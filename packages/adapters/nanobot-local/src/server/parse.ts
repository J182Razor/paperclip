/**
 * Nanobot stdout parser.
 *
 * Nanobot CLI outputs plain text (not JSON) in v1.
 * We collect all stdout lines as the assistant response.
 */

export interface ParsedNanobotOutput {
  messages: string[];
  errors: string[];
  finalMessage: string | null;
}

export function parseNanobotOutput(stdout: string): ParsedNanobotOutput {
  const result: ParsedNanobotOutput = {
    messages: [],
    errors: [],
    finalMessage: null,
  };

  const lines = stdout.split(/\r?\n/);
  const messageLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    // Detect error lines from nanobot
    if (/^(error|Error|ERROR):/i.test(line.trim()) || /^Traceback /i.test(line.trim())) {
      result.errors.push(line.trim());
      continue;
    }

    messageLines.push(line);
  }

  const fullMessage = messageLines.join("\n").trim();
  if (fullMessage) {
    result.messages.push(fullMessage);
    result.finalMessage = fullMessage;
  }

  return result;
}
