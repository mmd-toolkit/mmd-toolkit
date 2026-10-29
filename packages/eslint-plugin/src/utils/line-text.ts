import type { MermaidSourceCode } from "../source-code.ts"

/** The whitespace at the start of the line `line` (counted from 1). */
export function indentationOf(
  sourceCode: MermaidSourceCode,
  line: number,
): string {
  const text = sourceCode.lines[line - 1] ?? ""
  return text.slice(0, text.length - text.trimStart().length)
}

/**
 * The line terminator that the text uses at the line `line` (counted from 1):
 * the one that ends the line; for the last line, which has none, the one that
 * ends the line before it; for a text of one line, `\n`. A line break that
 * the rule adds is of that kind.
 */
export function lineTerminatorOf(
  sourceCode: MermaidSourceCode,
  line: number,
): string {
  const { text } = sourceCode
  const start = sourceCode.getIndexFromLoc({ line, column: 0 })
  for (let index = start; index < text.length; index++) {
    if (text[index] === "\r") return text[index + 1] === "\n" ? "\r\n" : "\r"
    if (text[index] === "\n") return "\n"
  }
  if (text[start - 1] === "\r") return "\r"
  if (text[start - 1] === "\n") return text[start - 2] === "\r" ? "\r\n" : "\n"
  return "\n"
}
