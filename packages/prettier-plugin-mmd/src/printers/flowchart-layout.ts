import type {
  FlowchartClickCallbackStatement,
  FlowchartStatement,
  FlowchartSubgraphStatement,
  Node,
} from "@mmd-toolkit/parser"
import {
  addShapeRules,
  addLinkRules,
  layoutGraphAccessibility,
} from "./graph-layout.ts"
import { findFlowchartKeptLines } from "./flowchart-kept-lines.ts"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  findAccDescrBlockClosing,
  findAccDescrBlockStretches,
  keptAsWritten,
  walk,
} from "./layout.ts"
import { holdsJoiningRegion } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findStructuralToken, findTokensBetween } from "./source.ts"

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
  const accessibility = layoutGraphAccessibility(
    source,
    statement,
    end,
    findFlowchartKeptLines(source),
  )
  if (accessibility !== null) return accessibility
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
