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
function declarationName(text: string): { name: string; end: number } | null {
  const colon = text.indexOf(":")
  if (colon < 0) return null
  let end = colon
  while (end > 0 && isCssWhitespace(text[end - 1])) end--
  let start = 0
  while (start < end && isCssWhitespace(text[start])) start++
  return { name: text.slice(start, end), end }
}

/** Whether the style is named `stroke`, whatever its case and the whitespace around the name. */
export function isStrokeDeclaration(style: {
  readonly value: string
}): boolean {
  return declarationName(style.value)?.name.toLowerCase() === "stroke"
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
 * The `stroke` styles of `styles` that have whitespace before the `:`. The
 * range is that whitespace in the source, and the fix removes it; where the
 * written text of the style is not the text of the source (a directive lies
 * inside it), the range is the style and there is no fix.
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
    if (sourceCode.text.slice(...style.range) !== style.value) {
      spaced.push({ style, range: style.range, fix: null })
      continue
    }
    const range: Range = [style.range[0] + space[0], style.range[0] + space[1]]
    spaced.push({
      style,
      range,
      fix: canEditRange(sourceCode, range)
        ? (fixer) => fixer.removeRange(range)
        : null,
    })
  }
  return spaced
}
