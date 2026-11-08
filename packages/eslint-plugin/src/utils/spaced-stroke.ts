import type { RuleFixer } from "@eslint/core"
import type { Range } from "@mmd-toolkit/ast"
import type { MermaidSourceCode } from "../source-code.ts"
import { canEditRange } from "./edit-range.ts"

/** A style of a statement, as the tree holds it: the written text and where it stands. */
interface StyleLiteral {
  readonly value: string
  readonly range: Range
}

/** A `stroke` with whitespace before its `:`, and the edit that removes it. */
export interface SpacedStroke {
  readonly range: Range
  readonly fix: RuleFixer | null
}

/** CSS reads a space, a tab, and a line terminator or form feed as whitespace; no other character. */
function isCssWhitespace(character: string): boolean {
  return " \t\n\r\f".includes(character)
}

/**
 * The whitespace between the name of a style and its `:`, when the name ends
 * with `stroke`. The arrowhead of a link takes its colour from the first
 * `stroke:` in the style of the path, which `stroke :` does not contain, while
 * CSS reads the name without the whitespace.
 */
function spaceBeforeColon(text: string): Range | null {
  const colon = text.indexOf(":")
  if (colon < 0) return null
  let end = colon
  while (end > 0 && isCssWhitespace(text[end - 1])) end--
  if (end === colon) return null
  let start = 0
  while (start < end && isCssWhitespace(text[start])) start++
  const name = text.slice(start, end)
  if (!name.endsWith("stroke") || [...name].some(isCssWhitespace)) return null
  return [end, colon]
}

/**
 * The `stroke` styles of `styles` that have whitespace before the `:`. The
 * range is that whitespace in the source, and the fix removes it; where the
 * written text of the style is not the text of the source (a directive lies
 * inside it), the range is the style and there is no fix.
 */
export function spacedStrokesOf(
  sourceCode: MermaidSourceCode,
  styles: readonly (StyleLiteral | null)[],
): SpacedStroke[] {
  const spaced: SpacedStroke[] = []
  for (const style of styles) {
    if (style === null) continue
    const space = spaceBeforeColon(style.value)
    if (space === null) continue
    if (sourceCode.text.slice(...style.range) !== style.value) {
      spaced.push({ range: style.range, fix: null })
      continue
    }
    const range: Range = [style.range[0] + space[0], style.range[0] + space[1]]
    spaced.push({
      range,
      fix: canEditRange(sourceCode, range)
        ? (fixer) => fixer.removeRange(range)
        : null,
    })
  }
  return spaced
}
