import type {
  FlowchartClickCallbackStatement,
  FlowchartDiagram,
  FlowchartLabel,
  FlowchartLink,
  FlowchartShape,
  FlowchartStatement,
  FlowchartSubgraphStatement,
  Node,
  Token,
} from "@mmd-toolkit/parser"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  findAccDescrBlockClosing,
  findAccDescrBlockStretches,
  walk,
} from "./layout.ts"
import { holdsJoiningRegion } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findStructuralTokenEndingBefore,
  findTokensBetween,
  isWhitespace,
} from "./source.ts"

/**
 * The node types whose text is a value, printed as written. They have no
 * child fields; `tests/value-nodes.test.ts` checks that every other node
 * type without child fields is left out on purpose.
 */
export const valueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
  "FlowchartLabel",
  "FlowchartLiteral",
  "FlowchartDataBlock",
  "FlowchartIgnoredText",
])

/**
 * The layout of the header line: the keyword, and the direction when there
 * is one.
 */
export function layoutHeader(
  source: Source,
  diagram: FlowchartDiagram,
  headerEnd: number,
): AtomLayout {
  if (holdsJoiningRegion(source, diagram.range[0], headerEnd)) {
    return keptAsWritten(diagram.range[0], headerEnd)
  }
  return {
    atoms: collectAtoms(source, diagram.range[0], headerEnd, [], []),
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * A layout of one atom, the text from `start` to `end` as written: a comment
 * line cuts in, after a U+2028 or U+2029, and the line goes on after it, so
 * the text cannot be printed with its parts on lines of their own
 * (docs/compatibility.md, A comment line after U+2028 or U+2029).
 */
function keptAsWritten(start: number, end: number): AtomLayout {
  return {
    atoms: [{ start, end }],
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * Whether an atom starts inside one of the kept stretches. The name of a
 * subgraph without a title may end with line breaks, and the line ends before
 * the last of them (see `findSubgraphHeaderEnd`), so the token of the name
 * reaches past the stretch that holds its text. Only this layout cuts a token
 * of a name on purpose, and `collectAtoms` still rejects a stretch that cuts a
 * value node.
 */
function startsInside(kept: readonly Atom[], atom: Atom): boolean {
  return kept.some(
    (stretch) => stretch.start <= atom.start && atom.start < stretch.end,
  )
}

/**
 * The layout of the `subgraph` line. A name without a title is printed
 * with the whitespace after it, which mermaid.js reads as part of the name.
 */
export function layoutSubgraphHeader(
  source: Source,
  subgraph: FlowchartSubgraphStatement,
  headerEnd: number,
): AtomLayout {
  if (holdsJoiningRegion(source, subgraph.range[0], headerEnd)) {
    return keptAsWritten(subgraph.range[0], headerEnd)
  }
  const kept: Atom[] =
    subgraph.title === null
      ? [{ start: subgraph.name.range[0], end: headerEnd }]
      : []
  const values: Node[] =
    subgraph.title === null ? [] : [subgraph.name, subgraph.title]
  return {
    atoms: collectAtoms(
      source,
      subgraph.range[0],
      headerEnd,
      values,
      kept,
    ).filter((atom) => kept.includes(atom) || !startsInside(kept, atom)),
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * The layout of a statement other than a subgraph, from its start to
 * `end` (see `findPrintedEnd`).
 */
export function layoutStatement(
  source: Source,
  statement: Exclude<FlowchartStatement, FlowchartSubgraphStatement>,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  if (holdsJoiningRegion(source, start, end)) {
    return keptAsWritten(start, end)
  }
  const kept = findKeptStretches(source, statement, end)
  const values = collectValueNodes(statement, valueNodeTypes)
  const rules =
    statement.type === "FlowchartVertexStatement"
      ? vertexStatementRules(source, statement)
      : new Map<number, GapRule>()
  return {
    atoms: collectAtoms(source, start, end, values, kept),
    rules,
    outdented: findOutdentedAtoms(source, statement),
    lineBreaks: "kept",
  }
}

/**
 * The atoms of a statement whose line starts at the statement's
 * indentation: the `}` of an `accDescr` block (see
 * `findAccDescrBlockClosing`).
 */
function findOutdentedAtoms(
  source: Source,
  statement: Exclude<FlowchartStatement, FlowchartSubgraphStatement>,
): Set<number> {
  if (statement.type !== "FlowchartAccDescrBlockStatement") return new Set()
  const closing = findAccDescrBlockClosing(source, statement)
  return closing === null ? new Set() : new Set([closing])
}

/**
 * The stretches of a statement that are printed exactly as written:
 *
 * - a list of styles, from where its first style starts (`findStylesStart`):
 *   after the whitespace that follows the id or the
 *   names before it, which is one space when printed
 *   (docs/flowchart.md, Whitespace between tokens). Everything after it is
 *   part of the first style, as mermaid.js reads it, directives and
 *   whitespace included: in `style A %%{init: {}}%%  fill:red`, the two
 *   spaces after the directive belong to the style. The whitespace around
 *   its commas is part of the values that mermaid.js stores, also when a
 *   style is all whitespace and has no node.
 * - the parentheses of a callback with the arguments between them.
 * - an `accDescr { ... }` block from the `{` to the end of its text and of
 *   the comments and directives after the text, when the text starts on a
 *   later line than the `{`: its lines keep their columns
 *   (docs/flowchart.md, Multi-line values), the
 *   first one included, and comment lines among them stay where they are.
 *   The whitespace after the `{` is read with the `{`, so the text on the
 *   line of the `{` is spaced as any other token.
 * - a `;` that is a statement of its own: its `;` is its structure, not a
 *   `;` that separates statements or that the line rule ignores.
 * - a click statement written over several lines. mermaid.js accepts a line
 *   break inside it, but not always whitespace after the break: `click A`
 *   and `cb` on the next line is accepted, and the same with `cb` indented
 *   is rejected. So its lines are not indented again (docs/flowchart.md,
 *   Multi-line statements).
 */
function findKeptStretches(
  source: Source,
  statement: Exclude<FlowchartStatement, FlowchartSubgraphStatement>,
  end: number,
): Atom[] {
  const whole: Atom = { start: statement.range[0], end }
  switch (statement.type) {
    case "FlowchartStyleStatement":
    case "FlowchartClassDefStatement":
    case "FlowchartLinkStyleStatement":
    case "FlowchartDefaultLinkStyleStatement": {
      return [{ start: findStylesStart(source, statement), end }]
    }
    case "FlowchartClickCallbackStatement":
      if (spansLines(source, statement)) return [whole]
      return findCallbackParentheses(source, statement)
    case "FlowchartClickUrlStatement":
      return spansLines(source, statement) ? [whole] : []
    case "FlowchartAccDescrBlockStatement":
      return findAccDescrBlockStretches(source, statement)
    case "FlowchartEmptyStatement":
      return [whole]
    default:
      return []
  }
}

/**
 * Where the styles of a style, class definition, or link style statement
 * start, as written: at the first style when it has a text, at the first `,`
 * when the first style is all whitespace and has no node, and at the end of
 * the statement's last token when no style has a text. The whitespace of a
 * style that has no node lies after that token, and is part of what
 * mermaid.js reads (ast/flowchart.md, FlowchartStyleStatement).
 */
function findStylesStart(
  source: Source,
  statement: Extract<
    FlowchartStatement,
    {
      type:
        | "FlowchartStyleStatement"
        | "FlowchartClassDefStatement"
        | "FlowchartLinkStyleStatement"
        | "FlowchartDefaultLinkStyleStatement"
    }
  >,
): number {
  const first = statement.styles.find((style) => style !== null)
  if (first === undefined) return statement.range[1]
  if (statement.styles[0] !== null) return first.range[0]
  const comma = findTokensBetween(
    source,
    statement.range[0],
    first.range[0],
  ).find((token) => token.value === ",")
  return comma?.range[0] ?? first.range[0]
}

/** Whether a statement's source contains a line terminator. */
function spansLines(source: Source, statement: Node): boolean {
  return source.text
    .slice(statement.range[0], statement.range[1])
    .includes("\n")
}

/** The parentheses after `call` with the arguments between them, if any. */
function findCallbackParentheses(
  source: Source,
  statement: FlowchartClickCallbackStatement,
): Atom[] {
  const opening = findStructuralToken(source, statement.callback.range[1])
  if (opening?.value !== "(" || opening.range[0] >= statement.range[1]) {
    return []
  }
  const closing = expectToken(
    findStructuralToken(
      source,
      statement.arguments?.range[1] ?? opening.range[1],
    ),
    "the `)` of callback arguments",
  )
  expectValue(closing, ")")
  return [{ start: opening.range[0], end: closing.range[1] }]
}

/**
 * The gap rules of a vertex statement, from its shapes and links.
 *
 * - Inside a shape, a label without quotes touches its brackets, as
 *   mermaid.js drops that whitespace (docs/flowchart.md, Label inner
 *   whitespace).
 * - A link has one space before and after it, and one space on each side of
 *   text between two arrows (docs/flowchart.md, Arrow spacing). An edge id
 *   touches its `@` and the arrow. Text between `|` touches the `|` and the
 *   `|` touch the arrow.
 */
function vertexStatementRules(
  source: Source,
  statement: FlowchartStatement & { type: "FlowchartVertexStatement" },
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  walk(statement, (node) => {
    if (node.type === "FlowchartShape") addShapeRules(source, node, rules)
    if (node.type === "FlowchartLink") addLinkRules(source, node, rules)
  })
  return rules
}

/** Adds the rules of a shape. */
function addShapeRules(
  source: Source,
  shape: FlowchartShape,
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
function addLinkRules(
  source: Source,
  link: FlowchartLink,
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
    const label = link.label as NonNullable<FlowchartLink["label"]>
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
function labelEdgeRule(source: Source, label: FlowchartLabel): GapRule {
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
function keepsLeadingWhitespace(label: FlowchartLabel): boolean {
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
