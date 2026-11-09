import type { Position } from "./lines.ts"

/**
 * A rejected diagram, or a code block that is not formatted, at its position
 * in the file (README, Errors and exit codes).
 */
export interface Diagnostic {
  /** An error makes the run fail; a warning does not. */
  readonly severity: "error" | "warning"
  readonly message: string
  readonly position: Position
}

/**
 * The text whose lines a diagnostic counts: the text as it was read, or the
 * text after formatting. A person opens the file after the run to fix what is
 * reported, so a diagnostic gives its position in the text that the run leaves:
 * the text after formatting with `--write` and `--stdin-filepath`, and the text
 * as it was read with `--check` or `--list-different` alone (README, Errors
 * and exit codes).
 */
export type PositionsIn = "input" | "output"

/** The text of a file after formatting, and what was reported about it. */
export interface FormatResult {
  readonly text: string
  readonly diagnostics: readonly Diagnostic[]
}
