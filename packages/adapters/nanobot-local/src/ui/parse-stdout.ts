import type { TranscriptEntry } from "@paperclipai/adapter-utils";

/**
 * Nanobot stdout line parser for the UI transcript.
 * In v1, Nanobot outputs plain text (no JSON streaming).
 * Each non-empty line becomes an assistant transcript entry.
 */
export function parseNanobotStdoutLine(line: string, ts: string): TranscriptEntry[] {
  const trimmed = line.trim();
  if (!trimmed) return [];

  // Detect error lines
  if (/^(error|Error|ERROR):/i.test(trimmed) || /^Traceback /i.test(trimmed)) {
    return [{ kind: "stdout", ts, text: trimmed }];
  }

  // Treat all other output as assistant text
  return [{ kind: "assistant", ts, text: trimmed, delta: true }];
}
