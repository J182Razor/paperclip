import { createHash } from "node:crypto";
import type { AdapterModel } from "@paperclipai/adapter-utils";

/**
 * Dynamic model discovery for Nanobot adapter.
 *
 * Fetches models from provider APIs (NVIDIA NIM, etc.) so the model dropdown
 * stays current without hardcoding. Caches results for 5 minutes.
 */

const MODELS_CACHE_TTL_MS = 5 * 60_000; // 5 minutes

const NVIDIA_NIM_API_BASE = "https://integrate.api.nvidia.com/v1";

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry {
  expiresAt: number;
  models: AdapterModel[];
}

const discoveryCache = new Map<string, CacheEntry>();

function pruneExpiredCache(now: number) {
  for (const [key, value] of discoveryCache.entries()) {
    if (value.expiresAt <= now) discoveryCache.delete(key);
  }
}

function cacheKey(apiBase: string, apiKeyHash: string): string {
  return `${apiBase}\n${apiKeyHash}`;
}

function hashSecret(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

// ---------------------------------------------------------------------------
// NVIDIA NIM model discovery
// ---------------------------------------------------------------------------

interface NvidiaModelEntry {
  id: string;
  object?: string;
  owned_by?: string;
}

/**
 * Fetches available models from an OpenAI-compatible /v1/models endpoint.
 * Works with NVIDIA NIM, OpenRouter, and any compatible provider.
 */
async function fetchOpenAiCompatibleModels(
  apiBase: string,
  apiKey: string | null,
): Promise<AdapterModel[]> {
  const url = `${apiBase.replace(/\/+$/, "")}/models`;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) {
      return [];
    }

    const body = (await res.json()) as { data?: NvidiaModelEntry[] };
    if (!body.data || !Array.isArray(body.data)) return [];

    const models: AdapterModel[] = [];
    for (const entry of body.data) {
      if (typeof entry.id !== "string" || !entry.id.trim()) continue;
      // Skip embedding, reranking, and non-chat models
      if (/embed|rerank|reward|vlm|audio|tts|asr/i.test(entry.id)) continue;
      models.push({
        id: entry.id,
        label: formatModelLabel(entry.id, entry.owned_by),
      });
    }

    return dedupeAndSort(models);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function formatModelLabel(id: string, ownedBy?: string): string {
  // Extract a readable label from the model id
  // e.g. "nvidia/llama-3.1-nemotron-ultra-253b-v1" → "NVIDIA Llama 3.1 Nemotron Ultra 253B v1"
  const parts = id.split("/");
  const modelPart = parts.length > 1 ? parts[parts.length - 1] : id;
  const provider = parts.length > 1 ? parts[0] : (ownedBy ?? "");

  const prettyModel = modelPart
    .replace(/-/g, " ")
    .replace(/\b\d+b\b/gi, (m) => m.toUpperCase())
    .replace(/\bv\d+/gi, (m) => m)
    .trim();

  const prettyProvider = provider
    .replace(/-ai$/i, "")
    .replace(/ai$/, "")
    .trim();

  if (prettyProvider) {
    return `${prettyProvider}/${prettyModel}`;
  }
  return prettyModel;
}

function dedupeAndSort(models: AdapterModel[]): AdapterModel[] {
  const seen = new Set<string>();
  const deduped: AdapterModel[] = [];
  for (const model of models) {
    const id = model.id.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    deduped.push(model);
  }
  return deduped.sort((a, b) =>
    a.id.localeCompare(b.id, "en", { numeric: true, sensitivity: "base" }),
  );
}

// ---------------------------------------------------------------------------
// Resolve API key from environment
// ---------------------------------------------------------------------------

function resolveNvidiaApiKey(env?: Record<string, string>): string | null {
  const sources = [
    env?.NVIDIA_API_KEY,
    process.env.NVIDIA_API_KEY,
    env?.NANOBOT_API_KEY,
    process.env.NANOBOT_API_KEY,
  ];
  for (const val of sources) {
    if (typeof val === "string" && val.trim().length > 0) return val.trim();
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Discover models from NVIDIA NIM (and optionally a custom apiBase).
 * Results are cached for 5 minutes keyed by (apiBase, apiKeyHash).
 */
export async function discoverNanobotModels(input: {
  apiBase?: string;
  env?: Record<string, string>;
} = {}): Promise<AdapterModel[]> {
  const apiBase = input.apiBase?.trim() || NVIDIA_NIM_API_BASE;
  const apiKey = resolveNvidiaApiKey(input.env ?? undefined);
  const key = cacheKey(apiBase, apiKey ? hashSecret(apiKey) : "none");
  const now = Date.now();

  pruneExpiredCache(now);
  const cached = discoveryCache.get(key);
  if (cached && cached.expiresAt > now) return cached.models;

  const models = await fetchOpenAiCompatibleModels(apiBase, apiKey);
  if (models.length > 0) {
    discoveryCache.set(key, { expiresAt: now + MODELS_CACHE_TTL_MS, models });
  }
  return models;
}

/**
 * List models for the adapter registry. Returns empty array on failure
 * so the UI gracefully falls back to manual text input.
 */
export async function listNanobotModels(): Promise<AdapterModel[]> {
  try {
    return await discoverNanobotModels();
  } catch {
    return [];
  }
}

export function resetNanobotModelsCacheForTests() {
  discoveryCache.clear();
}
