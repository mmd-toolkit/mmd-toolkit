/** An accessibility statement with its text: a node whose `value` is a literal, or null when it has no text. */
interface WithText {
  readonly value: { readonly value: string } | null
}

/** Reads CRLF and lone CR as LF, preserving every other character. */
export function normalizeLineTerminators(text: string): string {
  return text.replaceAll("\r\n", "\n").replaceAll("\r", "\n")
}

/**
 * The title that a `title` or `accTitle` statement sets, as mermaid.js keeps
 * it: the text of its value, which is the whole text after the keyword and one
 * whitespace character for a `title` and has no whitespace at its ends for an
 * `accTitle`, or the empty string for a statement without text.
 */
export function titleText(statement: WithText): string {
  return statement.value?.value ?? ""
}

/**
 * The description that an `accDescr` statement or block sets, as mermaid.js
 * keeps it. A statement without text sets the empty string.
 */
export function accDescrText(statement: WithText): string {
  return accDescrTextOf(statement.value?.value ?? "")
}

/**
 * Reads a description value with every line break (LF, CRLF, or CR) as a line
 * feed and removes the whitespace after each line break, taking the indentation
 * of the lines and the empty lines with it.
 */
export function accDescrTextOf(value: string): string {
  const text = normalizeLineTerminators(value)
  const [first = "", ...rest] = text.split("\n")
  const lines = rest
    .map((line) => line.trimStart())
    .filter((line) => line !== "")
  return [first, ...lines].join("\n")
}
