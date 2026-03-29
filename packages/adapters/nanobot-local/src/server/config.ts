import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const NANOBOT_CONFIGS_DIR = path.join(os.homedir(), ".paperclip", "nanobot-configs");

export interface NanobotConfigOptions {
  agentId: string;
  model: string;
  provider: string | null;
  apiBaseUrl: string | null;
  env: Record<string, string>;
}

/**
 * Generates a per-agent Nanobot config.json file.
 * Returns the absolute path to the generated config file.
 */
export async function generateNanobotConfig(opts: NanobotConfigOptions): Promise<string> {
  const agentDir = path.join(NANOBOT_CONFIGS_DIR, opts.agentId);
  await fs.mkdir(agentDir, { recursive: true });

  const providerName = opts.provider || deriveProvider(opts.model);

  const providerConfig: Record<string, unknown> = {};
  const apiKey = resolveApiKey(providerName, opts.env);
  if (apiKey) providerConfig.apiKey = apiKey;
  if (opts.apiBaseUrl) providerConfig.apiBase = opts.apiBaseUrl;

  const config: Record<string, unknown> = {
    providers: {
      [providerName]: providerConfig,
    },
    agents: {
      defaults: {
        model: opts.model,
        provider: providerName,
      },
    },
    tools: {
      exec: { enable: true },
    },
  };

  const configPath = path.join(agentDir, "config.json");
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
  return configPath;
}

function deriveProvider(model: string): string {
  if (model.includes("/")) {
    const prefix = model.slice(0, model.indexOf("/")).toLowerCase();
    if (prefix === "nvidia" || prefix === "ollama" || prefix === "openrouter") return prefix;
    return prefix;
  }
  return "default";
}

function resolveApiKey(provider: string, env: Record<string, string>): string | null {
  const providerUpper = provider.toUpperCase();

  // Check provider-specific keys first
  const candidates = [
    `${providerUpper}_API_KEY`,
    `NVIDIA_API_KEY`,
    `OPENROUTER_API_KEY`,
    `NANOBOT_API_KEY`,
  ];

  for (const key of candidates) {
    const val = env[key];
    if (typeof val === "string" && val.trim().length > 0) return val.trim();
  }

  return null;
}
