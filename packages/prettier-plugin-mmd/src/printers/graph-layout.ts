import type {
  AgentflowLabel,
  Node,
  AgentflowLink,
  AgentflowShape,
  FlowchartLabel,
  FlowchartLink,
  FlowchartShape,
  Token,
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import {
  collectAtoms,
  expectToken,
  expectValue,
  keptAsWritten,
} from "./layout.ts"
import { holdsJoiningRegion } from "./kept-lines.ts"
import { findWrittenWhitespaceEnd } from "./gap.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findStructuralTokenEndingBefore,
  findTokenStartingAt,
  findTokenEndingBefore,
  isWhitespace,
} from "./source.ts"

type GraphLabel = AgentflowLabel | FlowchartLabel
type GraphLink = AgentflowLink | FlowchartLink
type GraphShape = AgentflowShape | FlowchartShape

/** Adds the rules of a shape. */
export function addShapeRules(
  source: Source,
  shape: GraphShape,
  rules: Map<number, GapRule>,
): void {
  if (shape.label.kind !== "text") return
  const edge = labelEdgeRule(source, shape.label)
  rules.set(shape.label.range[0], edge)
  const closing = expectToken(
    findStructuralToken(source, shape.label.range[1]),
    "the closing bracket of a shape",
  )
  rules.set(closing.range[0], takesTextBefore(closing) ? "none" : edge)
}

/** Adds the rules of a link. */
export function addLinkRules(
  source: Source,
  link: GraphLink,
  rules: Map<number, GapRule>,
): void {
  rules.set(link.range[0], "space")
  rules.set(link.target.range[0], "space")
  if (link.id !== null) {
    const at = expectToken(
      findStructuralToken(source, link.id.range[1]),
      "the `@` of an edge id",
    )
    expectValue(at, "@")
    rules.set(at.range[0], "none")
    rules.set((link.opening ?? link.arrow).range[0], "none")
  }
  if (link.opening !== null) {
    const label = link.label as NonNullable<GraphLink["label"]>
    rules.set(label.range[0], "space")
    rules.set(link.arrow.range[0], "space")
    return
  }
  if (link.label === null) return
  const opening = expectToken(
    findStructuralToken(source, link.arrow.range[1]),
    "the first `|` of a link label",
  )
  expectValue(opening, "|")
  rules.set(opening.range[0], "none")
  if (link.label.kind !== "text") return
  const edge = labelEdgeRule(source, link.label)
  rules.set(link.label.range[0], edge)
  const closing = expectToken(
    findStructuralToken(source, link.label.range[1]),
    "the second `|` of a link label",
  )
  expectValue(closing, "|")
  rules.set(closing.range[0], edge)
}

/**
 * Whether a closing bracket of a slanted shape starts with a character that
 * a text run would take after whitespace: `?]` and `=]` (diagrams/flowchart.md,
 * the slanted context). `A[/a/?]` is a trapezoid-bottom with the label `a/`, but in
 * `A[/a/ ?]` the text run ` ?` takes the `?`, and the input is rejected. So
 * no space is put before such a bracket.
 */
function takesTextBefore(closing: Token): boolean {
  return closing.value.startsWith("?") || closing.value.startsWith("=")
}

/**
 * The rule for the whitespace on both sides of a label without quotes
 * (docs/flowchart.md, Label inner whitespace): none, as mermaid.js drops
 * that whitespace, except where the
 * whitespace before the label is kept (see `keepsLeadingWhitespace`). Then
 * one space stands on each side, so that the label looks as meant:
 * `A[ /x/]` becomes `A[ /x/ ]`. A space after a label does not change it.
 * The whitespace before the label is looked for from the bracket, past the
 * directives between them: in `A[ %%{init: {}}%%/x/]`, the label starts
 * after the directive token.
 */
export function labelEdgeRule(source: Source, label: GraphLabel): GapRule {
  const before = expectToken(
    findStructuralTokenEndingBefore(source, label.range[0]),
    "the bracket before a label",
  )
  const hasWhitespaceBefore = [
    ...source.text.slice(before.range[1], label.range[0]),
  ].some(isWhitespace)
  return hasWhitespaceBefore && keepsLeadingWhitespace(label) ? "space" : "none"
}

/**
 * Whether the whitespace before a label without quotes is kept, as one
 * space, rather than removed (docs/flowchart.md, Label inner whitespace).
 * mermaid.js drops that whitespace,
 * but without it the label's first characters are read with the bracket or
 * the `|` before it:
 *
 * - a label that starts with `/`, `\`, `-`, or `"`: `A[ /x/]` is a rectangle
 *   with the label `/x/`, `A[/x/]` a lean-right with the label `x`;
 *   `A( -x-)` is a rounded, `A(-x-)` an ellipse; `A[/ "x /]` has the
 *   label `"x`, and `A[/"x/]` is rejected.
 * - a label whose first word, up to whitespace or a `"`, holds a `@`:
 *   `A[x@]` is rejected, because `A[x@` is read as an edge id.
 *
 * The rule is the same for every shape and for the text between `|`, so
 * that it does not depend on which brackets a label has. The label's value
 * is its text without directives, as mermaid.js reads it.
 */
function keepsLeadingWhitespace(label: GraphLabel): boolean {
  const first = label.value.charAt(0)
  if (first === "/" || first === "\\" || first === "-" || first === '"') {
    return true
  }
  let wordEnd = 0
  while (
    wordEnd < label.value.length &&
    !isWhitespace(label.value.charAt(wordEnd)) &&
    label.value.charAt(wordEnd) !== '"'
  ) {
    wordEnd++
  }
  return label.value.slice(0, wordEnd).includes("@")
}

/** Graph headers share the authored keyword/direction layout. */
export function layoutGraphHeader(
  source: Source,
  diagram: Node,
  end: number,
): AtomLayout {
  if (holdsJoiningRegion(source, diagram.range[0], end))
    return keptAsWritten(diagram.range[0], end)
  return {
    atoms: collectAtoms(source, diagram.range[0], end, [], []),
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/** The required null-style whitespace can extend past a statement's range. */
export function findStyleStatementEnd(
  source: Source,
  statement: Node & { readonly styles: readonly (Node | null)[] },
): number {
  const last = expectToken(
    findTokenEndingBefore(source, statement.range[1]),
    "the end of a style statement",
  )
  return statement.styles.at(-1) !== null && !last.value.endsWith(",")
    ? statement.range[1]
    : findWrittenWhitespaceEnd(source, statement.range[1])
}

/** The end of a graph header's keyword and optional authored direction. */
export function findGraphHeaderEnd(
  source: Source,
  diagram: Node & { readonly direction: string | null },
): number {
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the header keyword",
  )
  if (diagram.direction === null) return keyword.range[1]
  const direction = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the header direction",
  )
  expectValue(direction, diagram.direction)
  return direction.range[1]
}

/** The closing bracket of an explicit graph container heading title. */
export function findGraphTitleEnd(source: Source, title: GraphLabel): number {
  const closing = expectToken(
    findStructuralToken(source, title.range[1]),
    "the heading title closer",
  )
  expectValue(closing, "]")
  return closing.range[1]
}

/** The token that closes a graph container, at its recorded end. */
export function findGraphEndKeyword(source: Source, container: Node): Token {
  const token = expectToken(
    findTokenEndingBefore(source, container.range[1]),
    "the end of a graph container",
  )
  if (token.range[1] !== container.range[1])
    throw new Error("prettier-plugin-mmd: no token at the container end")
  return token
}
