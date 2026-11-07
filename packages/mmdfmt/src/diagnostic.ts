import type { Position } from "./lines.ts"

/**
 * A rejected diagram, or a code block that is not formatted, at its position
 * in the file (README, When a diagram cannot be read).
 */
export interface Diagnostic {
  /** An error makes the run fail; a warning does not. */
  readonly severity: "error" | "warning"
  readonly message: string
  readonly position: Position
}

/** The text of a file after formatting, and what was reported about it. */
export interface FormatResult {
  readonly text: string
  readonly diagnostics: readonly Diagnostic[]
}
