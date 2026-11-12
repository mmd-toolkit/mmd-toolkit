import type {
  FlowchartLabel,
  FlowchartStatement,
  FlowchartSubgraphStatement,
  Node,
} from "@mmd-toolkit/ast"
import {
  addHeadingTitleRules,
  addShapeRules,
  addEdgeIdAfterDataBlockRules,
  addLinkRules,
  breaksBetweenParts,
  addBlankCallbackRule,
  findCallArgumentsParentheses,
  layoutGraphAccessibility,
} from "./graph-layout.ts"
import { findFlowchartKeptLines } from "./flowchart-kept-lines.ts"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import {
  collectAtoms,
  collectValueNodes,
  descriptionOpeningRules,
  expectToken,
  findAccDescrBlockClosing,
  findAccDescrBlockStretches,
  formatDescriptionBlock,
  keptAsWritten,
  replaceInAtoms,
  walk,
} from "./layout.ts"
import {
  holdsJoiningRegion,
  isDroppedSemicolon,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import {
  findDirectiveEndingAt,
  findStructuralToken,
  findTokensBetween,
  isSpaceOrTab,
  isWhitespace,
} from "./source.ts"
import {
  normalizeBlankLabels,
  normalizeCallArguments,
  normalizeStyleList,
} from "./statement-rules.ts"

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
 * Whether the name of a subgraph without a title is one word: mermaid.js makes
 * the name the id of the subgraph, unless the text of the name holds
 * whitespace, which it reads with the trailing whitespace of the name. So the
 * whitespace after a name of one word decides whether the subgraph has the
 * name as its id or a generated id, while a name of several words has a
 * generated id either way (docs/flowchart.md, Subgraph header).
 */
function isOneWord(name: FlowchartLabel): boolean {
  return ![...name.value.trimEnd()].some((character) => character.trim() === "")
}

/**
 * The end of the header of a subgraph without a title whose name has several
 * words, when its line ends at `end`: the start of the directives that end the
 * line, if there are any, and `end` otherwise. Whitespace after a directive
 * makes mermaid.js read the directive as part of the name, so the token of the
 * name reaches over `S1 S2  %%{x}%%  `, while without that whitespace the name
 * ends before the directive. The whitespace at the end of the name of several
 * words decides nothing, so both are laid out as a name that ends before the
 * directives, and a second formatting finds the text it has printed (docs/
 * flowchart.md, Subgraph header). A name of one word keeps its whitespace.
 */
export function findSeveralWordsHeaderEnd(
  source: Source,
  subgraph: FlowchartSubgraphStatement,
  end: number,
): number {
  if (subgraph.title !== null || isOneWord(subgraph.name)) return end
  let position = end
  let directivesStart = end
  while (position > subgraph.name.range[0]) {
    while (
      position > subgraph.name.range[0] &&
      isSpaceOrTab(source.text[position - 1])
    )
      position--
    const directive = findDirectiveEndingAt(source, position)
    if (directive === undefined) break
    position = directive.range[0]
    directivesStart = position
  }
  return directivesStart
}

/**
 * Whether the line of the header of `subgraph` ends at `offset`, apart from a
 * `;` that is dropped: an ignored one, or the one that ends the header, on a
 * line that is not kept with its `;` (see `findFlowchartKeptLines`).
 */
function endsLine(
  source: Source,
  subgraph: FlowchartSubgraphStatement,
  offset: number,
): boolean {
  let next = offset
  while (isSpaceOrTab(source.text[next])) next++
  const character = source.text[next]
  if (character === undefined || character === "\n" || character === "\r")
    return true
  if (character !== ";") return false
  const kept = findFlowchartKeptLines(source)
  const line = lineStartOf(source, next)
  return (
    !kept.joined.has(line) &&
    !kept.verbatim.has(line) &&
    (isDroppedSemicolon(source, next) ||
      subgraph.body[0] === undefined ||
      next < subgraph.body[0].range[0])
  )
}

/**
 * The layout of the `subgraph` line. A name of one word without a title is
 * printed with the whitespace after it, which mermaid.js reads as part of the
 * name; the whitespace at the end of the line of a name of several words
 * decides nothing and is left out.
 */
export function layoutSubgraphHeader(
  source: Source,
  subgraph: FlowchartSubgraphStatement,
  headerEnd: number,
): AtomLayout {
  if (holdsJoiningRegion(source, subgraph.range[0], headerEnd)) {
    return keptAsWritten(subgraph.range[0], headerEnd)
  }
  // A block, a `;` that stays or a directive on the line stands after the
  // whitespace, which then separates them from the name: only the whitespace
  // at the end of the line is left out, before a `;` that is dropped too.
  // The run of that whitespace is one space, as in a name that mermaid.js
  // draws without its runs, unless it is the indentation of a line that the
  // name takes (docs/flowchart.md, Subgraph header).
  let keptEnd = headerEnd
  let runStart: number | undefined
  if (subgraph.title === null && !isOneWord(subgraph.name)) {
    let position = headerEnd
    while (
      position > subgraph.name.range[0] &&
      isSpaceOrTab(source.text[position - 1])
    )
      position--
    if (endsLine(source, subgraph, headerEnd)) keptEnd = position
    else if (position < headerEnd && !isWhitespace(source.text[position - 1]))
      runStart = position
  }
  const kept: Atom[] =
    subgraph.title === null
      ? [{ start: subgraph.name.range[0], end: keptEnd }]
      : []
  const values: Node[] =
    subgraph.title === null ? [] : [subgraph.name, subgraph.title]
  // The `[` of the title touches the name (docs/flowchart.md, Subgraph header).
  const rules = new Map<number, GapRule>()
  if (subgraph.title !== null) {
    rules.set(
      expectToken(
        findStructuralToken(source, subgraph.name.range[1]),
        "the `[` before the title of a subgraph",
      ).range[0],
      "none",
    )
    addHeadingTitleRules(source, subgraph.title, rules)
  }
  const atoms = collectAtoms(
    source,
    subgraph.range[0],
    keptEnd,
    values,
    kept,
  ).filter((atom) => kept.includes(atom) || !startsInside(kept, atom))
  if (runStart !== undefined) {
    replaceInAtoms(source, atoms, [
      { range: [runStart, keptEnd], replacement: " " },
    ])
  }
  return { atoms, rules, outdented: new Set(), lineBreaks: "kept" }
}

/**
 * The layout of a statement other than a subgraph, from its start to
 * `end` (see `findPrintedEnd`).
 */
export function layoutStatement(
  source: Source,
  statement: Exclude<FlowchartStatement, FlowchartSubgraphStatement>,
  end: number,
  preservesDescriptionColumns: boolean,
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
  const rules: Map<number, GapRule> =
    statement.type === "FlowchartVertexStatement"
      ? vertexStatementRules(source, statement)
      : statement.type === "FlowchartAccDescrBlockStatement"
        ? descriptionOpeningRules(source, start)
        : new Map()
  if (statement.type === "FlowchartClickCallbackStatement") {
    addBlankCallbackRule(source, statement, rules)
  }
  const atoms = collectAtoms(source, start, end, values, kept)
  normalizeBlankLabels(source, atoms, values)
  if (statement.type === "FlowchartClickCallbackStatement") {
    normalizeCallArguments(source, atoms, statement.arguments?.range ?? null)
  }
  const layout: AtomLayout = {
    atoms,
    rules,
    outdented: findOutdentedAtoms(source, statement),
    lineBreaks: "kept",
  }
  if (
    statement.type === "FlowchartStyleStatement" ||
    statement.type === "FlowchartClassDefStatement" ||
    statement.type === "FlowchartLinkStyleStatement" ||
    statement.type === "FlowchartDefaultLinkStyleStatement"
  ) {
    // mermaid.js draws the same figure whatever the whitespace around the `:`
    // and the `,` of the styles, except before a style that starts with `fill`
    // in a `linkStyle` with link numbers, in the styles of a `linkStyle` where
    // mermaid.js reads them as the styles of a link, and between `stroke` and
    // the `:` in the styles that can reach a link (docs/flowchart.md, Styles).
    const isLinkStyle =
      statement.type === "FlowchartLinkStyleStatement" ||
      statement.type === "FlowchartDefaultLinkStyleStatement"
    normalizeStyleList(source, atoms, statement, {
      keepsSpaceBeforeFill: statement.type === "FlowchartLinkStyleStatement",
      isLinkStyle,
      joinsStyles: isLinkStyle,
      keepsGapAfterStroke: statement.type !== "FlowchartStyleStatement",
      escapesComma: statement.type === "FlowchartClassDefStatement",
      collapsesWordGaps: true,
    })
  }
  if (statement.type !== "FlowchartAccDescrBlockStatement") return layout
  return formatDescriptionBlock(
    source,
    statement,
    layout,
    preservesDescriptionColumns,
  )
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
 * - the parentheses of a callback with arguments, with the arguments between
 *   them.
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
    case "FlowchartClickCallbackStatement": {
      const parentheses = findCallArgumentsParentheses(source, statement)
      const stretches =
        parentheses === null
          ? []
          : [{ start: parentheses[0], end: parentheses[1] }]
      return breaksBetweenParts(source, statement, valueNodeTypes, stretches)
        ? [whole]
        : stretches
    }
    case "FlowchartClickUrlStatement":
      return breaksBetweenParts(source, statement, valueNodeTypes, [])
        ? [whole]
        : []
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

/**
 * The gap rules of a vertex statement, from its shapes and links.
 *
 * - Inside a shape, a label without quotes touches its brackets, as
 *   mermaid.js drops that whitespace (docs/flowchart.md, Label inner
 *   whitespace).
 * - A link has one space before and after it, and one space on each side of
 *   text between two arrows (docs/flowchart.md, Arrow spacing). An edge id
 *   touches its `@` and the arrow, and touches the data block before it. Text
 *   between `|` touches the `|` and the `|` touch the arrow.
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
  addEdgeIdAfterDataBlockRules(source, statement, rules)
  return rules
}
