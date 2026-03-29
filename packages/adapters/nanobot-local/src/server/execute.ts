import fs from "node:fs/promises";
import path from "node:path";
import type { AdapterExecutionContext, AdapterExecutionResult } from "@paperclipai/adapter-utils";
import {
  asString,
  asNumber,
  parseObject,
  buildPaperclipEnv,
  joinPromptSections,
  redactEnvForLogs,
  ensureAbsoluteDirectory,
  ensureCommandResolvable,
  ensurePathInEnv,
  renderTemplate,
  runChildProcess,
} from "@paperclipai/adapter-utils/server-utils";
import { parseNanobotOutput } from "./parse.js";
import { generateNanobotConfig } from "./config.js";

function firstNonEmptyLine(text: string): string {
  return (
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) ?? ""
  );
}

export async function execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult> {
  const { runId, agent, config, context, onLog, onMeta, onSpawn, authToken } = ctx;

  const promptTemplate = asString(
    config.promptTemplate,
    "You are agent {{agent.id}} ({{agent.name}}). Continue your Paperclip work.",
  );
  const command = asString(config.command, "nanobot");
  const model = asString(config.model, "").trim();
  const provider = asString(config.provider, "").trim() || null;
  const apiBaseUrl = asString(config.apiBaseUrl, "").trim() || null;

  if (!model) {
    return {
      exitCode: 1,
      signal: null,
      timedOut: false,
      errorMessage: "nanobot_local adapter requires a model to be configured.",
    };
  }

  // Resolve workspace cwd
  const workspaceContext = parseObject(context.paperclipWorkspace);
  const workspaceCwd = asString(workspaceContext.cwd, "");
  const workspaceSource = asString(workspaceContext.source, "");
  const workspaceId = asString(workspaceContext.workspaceId, "");
  const workspaceRepoUrl = asString(workspaceContext.repoUrl, "");
  const workspaceRepoRef = asString(workspaceContext.repoRef, "");
  const agentHome = asString(workspaceContext.agentHome, "");
  const workspaceHints = Array.isArray(context.paperclipWorkspaces)
    ? context.paperclipWorkspaces.filter(
        (value): value is Record<string, unknown> => typeof value === "object" && value !== null,
      )
    : [];
  const configuredCwd = asString(config.cwd, "");
  const useConfiguredInsteadOfAgentHome = workspaceSource === "agent_home" && configuredCwd.length > 0;
  const effectiveWorkspaceCwd = useConfiguredInsteadOfAgentHome ? "" : workspaceCwd;
  const cwd = effectiveWorkspaceCwd || configuredCwd || process.cwd();
  await ensureAbsoluteDirectory(cwd, { createIfMissing: true });

  // Build environment
  const envConfig = parseObject(config.env);
  const hasExplicitApiKey =
    typeof envConfig.PAPERCLIP_API_KEY === "string" && envConfig.PAPERCLIP_API_KEY.trim().length > 0;
  const env: Record<string, string> = { ...buildPaperclipEnv(agent) };
  env.PAPERCLIP_RUN_ID = runId;

  const wakeTaskId =
    (typeof context.taskId === "string" && context.taskId.trim().length > 0 && context.taskId.trim()) ||
    (typeof context.issueId === "string" && context.issueId.trim().length > 0 && context.issueId.trim()) ||
    null;
  const wakeReason =
    typeof context.wakeReason === "string" && context.wakeReason.trim().length > 0
      ? context.wakeReason.trim()
      : null;
  const wakeCommentId =
    (typeof context.wakeCommentId === "string" && context.wakeCommentId.trim().length > 0 && context.wakeCommentId.trim()) ||
    (typeof context.commentId === "string" && context.commentId.trim().length > 0 && context.commentId.trim()) ||
    null;
  const approvalId =
    typeof context.approvalId === "string" && context.approvalId.trim().length > 0
      ? context.approvalId.trim()
      : null;
  const approvalStatus =
    typeof context.approvalStatus === "string" && context.approvalStatus.trim().length > 0
      ? context.approvalStatus.trim()
      : null;
  const linkedIssueIds = Array.isArray(context.issueIds)
    ? context.issueIds.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];

  if (wakeTaskId) env.PAPERCLIP_TASK_ID = wakeTaskId;
  if (wakeReason) env.PAPERCLIP_WAKE_REASON = wakeReason;
  if (wakeCommentId) env.PAPERCLIP_WAKE_COMMENT_ID = wakeCommentId;
  if (approvalId) env.PAPERCLIP_APPROVAL_ID = approvalId;
  if (approvalStatus) env.PAPERCLIP_APPROVAL_STATUS = approvalStatus;
  if (linkedIssueIds.length > 0) env.PAPERCLIP_LINKED_ISSUE_IDS = linkedIssueIds.join(",");
  if (workspaceCwd) env.PAPERCLIP_WORKSPACE_CWD = workspaceCwd;
  if (workspaceSource) env.PAPERCLIP_WORKSPACE_SOURCE = workspaceSource;
  if (workspaceId) env.PAPERCLIP_WORKSPACE_ID = workspaceId;
  if (workspaceRepoUrl) env.PAPERCLIP_WORKSPACE_REPO_URL = workspaceRepoUrl;
  if (workspaceRepoRef) env.PAPERCLIP_WORKSPACE_REPO_REF = workspaceRepoRef;
  if (agentHome) env.AGENT_HOME = agentHome;
  if (workspaceHints.length > 0) env.PAPERCLIP_WORKSPACES_JSON = JSON.stringify(workspaceHints);

  for (const [key, value] of Object.entries(envConfig)) {
    if (typeof value === "string") env[key] = value;
  }
  if (!hasExplicitApiKey && authToken) {
    env.PAPERCLIP_API_KEY = authToken;
  }

  const runtimeEnv = Object.fromEntries(
    Object.entries(ensurePathInEnv({ ...process.env, ...env })).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
  await ensureCommandResolvable(command, cwd, runtimeEnv);

  const timeoutSec = asNumber(config.timeoutSec, 300);
  const graceSec = asNumber(config.graceSec, 20);

  // Generate per-agent nanobot config
  const configPath = await generateNanobotConfig({
    agentId: agent.id,
    model,
    provider,
    apiBaseUrl,
    env: runtimeEnv,
  });
  await onLog("stderr", `[paperclip] Generated Nanobot config at ${configPath}\n`);

  // Handle instructions file
  const instructionsFilePath = asString(config.instructionsFilePath, "").trim();
  const resolvedInstructionsFilePath = instructionsFilePath
    ? path.resolve(cwd, instructionsFilePath)
    : "";

  let instructionsContent = "";
  if (resolvedInstructionsFilePath) {
    try {
      instructionsContent = await fs.readFile(resolvedInstructionsFilePath, "utf8");
      await onLog("stderr", `[paperclip] Loaded agent instructions from ${resolvedInstructionsFilePath}\n`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      await onLog(
        "stdout",
        `[paperclip] Warning: could not read agent instructions file "${resolvedInstructionsFilePath}": ${reason}\n`,
      );
    }
  }

  // Build user prompt
  const bootstrapPromptTemplate = asString(config.bootstrapPromptTemplate, "");
  const templateData = {
    agentId: agent.id,
    companyId: agent.companyId,
    runId,
    company: { id: agent.companyId },
    agent,
    run: { id: runId, source: "on_demand" },
    context,
  };
  const renderedHeartbeatPrompt = renderTemplate(promptTemplate, templateData);
  const renderedBootstrapPrompt =
    bootstrapPromptTemplate.trim().length > 0
      ? renderTemplate(bootstrapPromptTemplate, templateData).trim()
      : "";
  const sessionHandoffNote = asString(context.paperclipSessionHandoffMarkdown, "").trim();

  // Compose the full prompt: instructions + context + task
  const promptParts: string[] = [];
  if (instructionsContent.trim()) {
    promptParts.push(instructionsContent.trim());
  }
  promptParts.push(joinPromptSections([
    renderedBootstrapPrompt,
    sessionHandoffNote,
    renderedHeartbeatPrompt,
  ]));
  const userPrompt = promptParts.join("\n\n---\n\n");

  const promptMetrics = {
    systemPromptChars: instructionsContent.length,
    promptChars: userPrompt.length,
    bootstrapPromptChars: renderedBootstrapPrompt.length,
    sessionHandoffChars: sessionHandoffNote.length,
    heartbeatPromptChars: renderedHeartbeatPrompt.length,
  };

  // Build nanobot CLI args
  const args: string[] = ["agent", "-m", userPrompt, "--config", configPath];

  if (onMeta) {
    await onMeta({
      adapterType: "nanobot_local",
      command,
      cwd,
      commandNotes: [
        `Model: ${model}`,
        ...(provider ? [`Provider: ${provider}`] : []),
        ...(apiBaseUrl ? [`API Base: ${apiBaseUrl}`] : []),
        `Config: ${configPath}`,
      ],
      commandArgs: args,
      env: redactEnvForLogs(env),
      prompt: userPrompt,
      promptMetrics,
      context,
    });
  }

  const proc = await runChildProcess(runId, command, args, {
    cwd,
    env: runtimeEnv,
    timeoutSec,
    graceSec,
    onSpawn,
    onLog,
  });

  const parsed = parseNanobotOutput(proc.stdout);

  if (proc.timedOut) {
    return {
      exitCode: proc.exitCode,
      signal: proc.signal,
      timedOut: true,
      errorMessage: `Timed out after ${timeoutSec}s`,
    };
  }

  const stderrLine = firstNonEmptyLine(proc.stderr);
  const rawExitCode = proc.exitCode;
  const fallbackErrorMessage = stderrLine || `Nanobot exited with code ${rawExitCode ?? -1}`;

  return {
    exitCode: rawExitCode,
    signal: proc.signal,
    timedOut: false,
    errorMessage: (rawExitCode ?? 0) === 0 ? null : fallbackErrorMessage,
    // No usage tracking in v1 — Nanobot CLI doesn't report token counts
    usage: undefined,
    // No session resume in v1
    sessionId: null,
    sessionParams: null,
    sessionDisplayId: null,
    provider: provider || (model.includes("/") ? model.slice(0, model.indexOf("/")) : null),
    biller: provider || (model.includes("/") ? model.slice(0, model.indexOf("/")) : "unknown"),
    model,
    billingType: "unknown",
    costUsd: undefined,
    resultJson: {
      stdout: proc.stdout,
      stderr: proc.stderr,
    },
    summary: parsed.finalMessage ?? parsed.messages.join("\n\n").trim(),
  };
}
