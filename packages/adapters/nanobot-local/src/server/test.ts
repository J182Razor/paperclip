import type {
  AdapterEnvironmentCheck,
  AdapterEnvironmentTestContext,
  AdapterEnvironmentTestResult,
} from "@paperclipai/adapter-utils";
import {
  asString,
  parseObject,
  ensureAbsoluteDirectory,
  ensureCommandResolvable,
  ensurePathInEnv,
  runChildProcess,
} from "@paperclipai/adapter-utils/server-utils";

function summarizeStatus(checks: AdapterEnvironmentCheck[]): AdapterEnvironmentTestResult["status"] {
  if (checks.some((check) => check.level === "error")) return "fail";
  if (checks.some((check) => check.level === "warn")) return "warn";
  return "pass";
}

function firstNonEmptyLine(text: string): string {
  return (
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) ?? ""
  );
}

function normalizeEnv(input: unknown): Record<string, string> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return {};
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (typeof value === "string") env[key] = value;
  }
  return env;
}

export async function testEnvironment(
  ctx: AdapterEnvironmentTestContext,
): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentCheck[] = [];
  const config = parseObject(ctx.config);
  const command = asString(config.command, "nanobot");
  const cwd = asString(config.cwd, process.cwd());

  // Check working directory
  try {
    await ensureAbsoluteDirectory(cwd, { createIfMissing: false });
    checks.push({
      code: "nanobot_cwd_valid",
      level: "info",
      message: `Working directory is valid: ${cwd}`,
    });
  } catch (err) {
    checks.push({
      code: "nanobot_cwd_invalid",
      level: "error",
      message: err instanceof Error ? err.message : "Invalid working directory",
      detail: cwd,
    });
  }

  const envConfig = parseObject(config.env);
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(envConfig)) {
    if (typeof value === "string") env[key] = value;
  }
  const runtimeEnv = normalizeEnv(ensurePathInEnv({ ...process.env, ...env }));

  const cwdInvalid = checks.some((check) => check.code === "nanobot_cwd_invalid");

  // Check nanobot command is resolvable
  if (cwdInvalid) {
    checks.push({
      code: "nanobot_command_skipped",
      level: "warn",
      message: "Skipped command check because working directory validation failed.",
      detail: command,
    });
  } else {
    try {
      await ensureCommandResolvable(command, cwd, runtimeEnv);
      checks.push({
        code: "nanobot_command_resolvable",
        level: "info",
        message: `Command is executable: ${command}`,
      });
    } catch (err) {
      checks.push({
        code: "nanobot_command_unresolvable",
        level: "error",
        message: err instanceof Error ? err.message : "Command is not executable",
        detail: command,
        hint: "Install Nanobot with: pip install nanobot-ai",
      });
    }
  }

  // Check model is configured
  const configuredModel = asString(config.model, "").trim();
  if (!configuredModel) {
    checks.push({
      code: "nanobot_model_required",
      level: "error",
      message: "Nanobot requires a configured model.",
      hint: "Set adapterConfig.model (e.g. nvidia/llama-3.1-nemotron-ultra-253b-v1, ollama/llama3).",
    });
  } else {
    checks.push({
      code: "nanobot_model_configured",
      level: "info",
      message: `Configured model: ${configuredModel}`,
    });
  }

  // Run hello probe if prerequisites pass
  const canRunProbe =
    !cwdInvalid &&
    checks.every((check) => check.code !== "nanobot_command_unresolvable") &&
    configuredModel;

  if (canRunProbe) {
    const args = ["agent", "-m", "Respond with hello."];

    try {
      const probe = await runChildProcess(
        `nanobot-envtest-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        command,
        args,
        {
          cwd,
          env: runtimeEnv,
          timeoutSec: 30,
          graceSec: 5,
          onLog: async () => {},
        },
      );

      const output = (probe.stdout + probe.stderr).trim();

      if (probe.timedOut) {
        checks.push({
          code: "nanobot_hello_probe_timed_out",
          level: "warn",
          message: "Nanobot hello probe timed out after 30s.",
          hint: "Retry the probe. If this persists, run `nanobot agent -m hello` manually.",
        });
      } else if ((probe.exitCode ?? 1) === 0) {
        const hasHello = /\bhello\b/i.test(output);
        checks.push({
          code: hasHello ? "nanobot_hello_probe_passed" : "nanobot_hello_probe_unexpected",
          level: hasHello ? "info" : "warn",
          message: hasHello
            ? "Nanobot hello probe succeeded."
            : "Nanobot probe ran but did not return `hello` as expected.",
          ...(output ? { detail: output.replace(/\s+/g, " ").trim().slice(0, 240) } : {}),
        });
      } else {
        const detail = firstNonEmptyLine(probe.stderr) || firstNonEmptyLine(probe.stdout);
        checks.push({
          code: "nanobot_hello_probe_failed",
          level: "error",
          message: "Nanobot hello probe failed.",
          ...(detail ? { detail: detail.slice(0, 240) } : {}),
          hint: "Run `nanobot agent -m hello` manually to debug.",
        });
      }
    } catch (err) {
      checks.push({
        code: "nanobot_hello_probe_failed",
        level: "error",
        message: "Nanobot hello probe failed.",
        detail: err instanceof Error ? err.message : String(err),
        hint: "Run `nanobot agent -m hello` manually to debug.",
      });
    }
  }

  return {
    adapterType: ctx.adapterType,
    status: summarizeStatus(checks),
    checks,
    testedAt: new Date().toISOString(),
  };
}
