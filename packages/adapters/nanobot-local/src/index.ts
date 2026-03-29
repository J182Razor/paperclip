export const type = "nanobot_local";
export const label = "Nanobot (local)";

// Models are discovered dynamically via listNanobotModels() in the server.
// The dropdown fetches live model lists from NVIDIA NIM's /v1/models endpoint.
export const models: Array<{ id: string; label: string }> = [];

export const agentConfigurationDoc = `# nanobot_local agent configuration

Adapter: nanobot_local

Use when:
- You want to run agents on low-cost LLM providers (NVIDIA NIM, OpenRouter, Ollama)
- You want Paperclip to invoke Nanobot (Python agent framework) locally as the agent runtime
- You need 20+ LLM provider support including local models
- You want to reduce cost for worker agents doing routine tasks

Don't use when:
- You need session resume across heartbeats (not supported in v1)
- You need structured tool call display (plain text transcript only in v1)
- Nanobot CLI is not installed (pip install nanobot-ai)
- You need token/cost tracking (not available in v1)

Core fields:
- model (string, required): model id — select from the dropdown or type a custom ID
- provider (string, optional): provider name (nvidia, openrouter, ollama, custom)
- apiBaseUrl (string, optional): custom API base URL for the provider
- cwd (string, optional): default working directory for the agent process
- instructionsFilePath (string, optional): absolute path to a markdown instructions file
- promptTemplate (string, optional): user prompt template
- command (string, optional): defaults to "nanobot"
- env (object, optional): KEY=VALUE environment variables (set NVIDIA_API_KEY here)

Operational fields:
- timeoutSec (number, optional): run timeout in seconds (default 300)
- graceSec (number, optional): SIGTERM grace period in seconds (default 20)

Notes:
- Nanobot supports 20+ LLM providers. Install with \`pip install nanobot-ai\`.
- Run \`nanobot onboard\` for interactive setup and API key configuration.
- Each heartbeat is a fresh conversation (no session resume in v1).
- The agent uses curl + PAPERCLIP_API_KEY env var to interact with the Paperclip API.
- Transcript is plain text output (no structured tool call display in v1).
- For NVIDIA NIM: set NVIDIA_API_KEY in Environment Variables (supports company secrets).
- For Ollama: no API key needed, set apiBaseUrl to your Ollama endpoint.
`;
