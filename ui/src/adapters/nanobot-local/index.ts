import type { UIAdapterModule } from "../types";
import { parseNanobotStdoutLine } from "@paperclipai/adapter-nanobot-local/ui";
import { NanobotLocalConfigFields } from "./config-fields";
import { buildNanobotLocalConfig } from "@paperclipai/adapter-nanobot-local/ui";

export const nanobotLocalUIAdapter: UIAdapterModule = {
  type: "nanobot_local",
  label: "Nanobot (local)",
  parseStdoutLine: parseNanobotStdoutLine,
  ConfigFields: NanobotLocalConfigFields,
  buildAdapterConfig: buildNanobotLocalConfig,
};
