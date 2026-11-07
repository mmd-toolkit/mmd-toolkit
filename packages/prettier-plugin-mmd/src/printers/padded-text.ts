import type { Range } from "@mmd-toolkit/ast"
import type { Source } from "./source.ts"
import { isSpaceOrTab } from "./source.ts"

/**
 * The printing of the texts of a mindmap or a kanban board without the spaces
 * and tabs at their ends: the text of a node, the text of its shape, its icon,
 * and its class (docs/compatibility.md, Mindmap texts that are drawn the
 * same).
 */

/** The shape of a node, with the part that carries its text. */
export interface PaddedShape {
  readonly range: Range
  readonly label: {
    readonly kind: "text" | "string" | "markdown"
    readonly range: Range
  }
}

/** The text without the spaces and tabs at its ends. */
export function trimBlanks(text: string): string {
  return trimBlanksEnd(trimBlanksStart(text))
}

/** The text without the spaces and tabs at its end. */
export function trimBlanksEnd(text: string): string {
  let end = text.length
  while (end > 0 && isSpaceOrTab(text[end - 1])) end--
  return text.slice(0, end)
}

/** The text without the spaces and tabs at its start. */
function trimBlanksStart(text: string): string {
  let start = 0
  while (start < text.length && isSpaceOrTab(text[start])) start++
  return text.slice(start)
}

/**
 * Whether the text of a line from `start` to `end` can be printed without the
 * padding of its texts: it stands on one line, holds no comment and no
 * directive, and nothing but spaces and tabs follows it on its line.
 */
export function isPlainLine(
  source: Source,
  start: number,
  end: number,
): boolean {
  const lineEnd = source.text.indexOf("\n", end)
  const after = source.text.slice(end, lineEnd === -1 ? undefined : lineEnd)
  const written = source.text.slice(start, end)
  return (
    trimBlanks(after) === "" &&
    !written.includes("\n") &&
    !written.includes(" ") &&
    !written.includes(" ") &&
    !written.includes("%%")
  )
}

/**
 * A line of an icon or a class: the text of the range `whole` with the part
 * `inner` trimmed; undefined where `inner` holds nothing but spaces and tabs.
 */
export function printPaddedLiteral(
  source: Source,
  whole: Range,
  inner: Range,
): string | undefined {
  const text = trimBlanks(source.text.slice(...inner))
  if (text === "") return undefined
  return (
    source.text.slice(whole[0], inner[0]) +
    text +
    source.text.slice(inner[1], whole[1])
  )
}

/**
 * The shape with the spaces and tabs at the ends of its text left out. A string
 * and a markdown string keep theirs, and so does a text of nothing but spaces
 * and tabs, and a text that would start with a quote once its padding is gone:
 * `a[ "x" ]` has the text `"x"` with its quotes, and `a["x"]` is a string.
 */
export function printShapeWithoutPadding(
  source: Source,
  shape: PaddedShape,
): string {
  const { label } = shape
  const text = source.text.slice(...label.range)
  const trimmed = trimBlanks(text)
  const keepsPadding =
    label.kind !== "text" || trimmed === "" || trimmed.startsWith('"')
  return (
    source.text.slice(shape.range[0], label.range[0]) +
    (keepsPadding ? text : trimmed) +
    source.text.slice(label.range[1], shape.range[1])
  )
}
