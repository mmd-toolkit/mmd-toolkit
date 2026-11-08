import type { RuleFixer } from "@eslint/core"
import type { Range } from "@mmd-toolkit/ast"
import type { MermaidSourceCode } from "../source-code.ts"
import { positionsOfValue } from "./directive-free-text.ts"

/** A style of a statement, as the tree holds it: the written text and where it stands. */
interface StyleLiteral {
  readonly value: string
  readonly range: Range
}

/** A `stroke` with whitespace before its `:`, and the edit that removes it. */
export interface SpacedStroke<Style extends StyleLiteral> {
  readonly style: Style
  readonly range: Range
  readonly fix: RuleFixer | null
}

/** CSS reads a space, a tab, and a line terminator or form feed as whitespace; no other character. */
function isCssWhitespace(character: string): boolean {
  return " \t\n\r\f".includes(character)
}

/** The text of a style before its first `:` without the whitespace around it, with where that whitespace ends. */
export function declarationName(
  text: string,
): { name: string; end: number } | null {
  const colon = text.indexOf(":")
  if (colon < 0) return null
  let end = colon
  while (end > 0 && isCssWhitespace(text[end - 1])) end--
  let start = 0
  while (start < end && isCssWhitespace(text[start])) start++
  return { name: text.slice(start, end), end }
}

/**
 * The whitespace between the name of a style and its `:`, when the name is
 * `stroke` in lower case. The mermaid.js documentation writes the name directly
 * before the `:`, and mermaid.js finds the colour of the arrowhead of a link by
 * looking for `stroke:`, which `stroke :` does not contain.
 */
function spaceBeforeColon(text: string): Range | null {
  const declaration = declarationName(text)
  if (declaration === null || declaration.name !== "stroke") return null
  const colon = text.indexOf(":")
  return declaration.end === colon ? null : [declaration.end, colon]
}

/**
 * Removes the characters at `positions`: one range for each run of positions
 * that touch. A directive between two runs stays where it is.
 */
function removal(positions: readonly number[]): RuleFixer {
  const ranges: Range[] = []
  for (const at of positions) {
    const last = ranges.at(-1)
    if (last !== undefined && last[1] === at) last[1] = at + 1
    else ranges.push([at, at + 1])
  }
  return (fixer) => ranges.map((range) => fixer.removeRange(range))
}

/**
 * The `stroke` styles of `styles` that have whitespace before the `:`. The
 * range is that whitespace in the source, from its first to its last character,
 * and the fix removes it; a directive that lies in the whitespace is not part
 * of the edit and stays. Where the written text of the style is not the value,
 * the range is the style and there is no fix: mermaid.js leaves a `;` out of
 * the value, as in `classDef hot stroke :#f00;fill:none`, whose one style is
 * `stroke :#f00fill:none`.
 */
export function spacedStrokesOf<Style extends StyleLiteral>(
  sourceCode: MermaidSourceCode,
  styles: readonly (Style | null)[],
): SpacedStroke<Style>[] {
  const spaced: SpacedStroke<Style>[] = []
  for (const style of styles) {
    if (style === null) continue
    const space = spaceBeforeColon(style.value)
    if (space === null) continue
    const positions = positionsOfValue(sourceCode, style.range, style.value)
    if (positions === null) {
      spaced.push({ style, range: style.range, fix: null })
      continue
    }
    const whitespace = positions.slice(space[0], space[1])
    spaced.push({
      style,
      range: [whitespace[0], whitespace[whitespace.length - 1] + 1],
      fix: removal(whitespace),
    })
  }
  return spaced
}
