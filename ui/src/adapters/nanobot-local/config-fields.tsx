import type { AdapterConfigFieldsProps } from "../types";
import {
  Field,
  DraftInput,
} from "../../components/agent-config-primitives";
import { ChoosePathButton } from "../../components/PathInstructionsModal";

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";

const providerHint =
  "Provider name (nvidia, openrouter, ollama, custom). Derived from model prefix if omitted.";
const apiBaseUrlHint =
  "Custom API base URL for the provider (e.g. https://integrate.api.nvidia.com/v1). Leave blank for default.";
const instructionsFileHint =
  "Absolute path to a markdown file (e.g. AGENTS.md) that defines this agent's behavior. Injected into the prompt at runtime.";

export function NanobotLocalConfigFields({
  isCreate,
  values,
  set,
  config,
  eff,
  mark,
  hideInstructionsFile,
}: AdapterConfigFieldsProps) {
  return (
    <>
      {!isCreate && (
        <>
          <Field label="Provider" hint={providerHint}>
            <DraftInput
              value={eff("adapterConfig", "provider", String(config.provider ?? ""))}
              onCommit={(v) => mark("adapterConfig", "provider", v || undefined)}
              immediate
              className={inputClass}
              placeholder="nvidia"
            />
          </Field>

          <Field label="API Base URL" hint={apiBaseUrlHint}>
            <DraftInput
              value={eff("adapterConfig", "apiBaseUrl", String(config.apiBaseUrl ?? ""))}
              onCommit={(v) => mark("adapterConfig", "apiBaseUrl", v || undefined)}
              immediate
              className={inputClass}
              placeholder="https://integrate.api.nvidia.com/v1"
            />
          </Field>
        </>
      )}

      {isCreate && (
        <div className="rounded-md border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-xs text-blue-200">
          Set <code className="font-mono">NVIDIA_API_KEY</code> in the Environment Variables section below.
          For Ollama, no API key is needed.
        </div>
      )}

      {!hideInstructionsFile && (
        <Field label="Agent instructions file" hint={instructionsFileHint}>
          <div className="flex items-center gap-2">
            <DraftInput
              value={
                isCreate
                  ? values!.instructionsFilePath ?? ""
                  : eff(
                      "adapterConfig",
                      "instructionsFilePath",
                      String(config.instructionsFilePath ?? ""),
                    )
              }
              onCommit={(v) =>
                isCreate
                  ? set!({ instructionsFilePath: v })
                  : mark("adapterConfig", "instructionsFilePath", v || undefined)
              }
              immediate
              className={inputClass}
              placeholder="/absolute/path/to/AGENTS.md"
            />
            <ChoosePathButton />
          </div>
        </Field>
      )}
    </>
  );
}
