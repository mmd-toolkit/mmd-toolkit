import { isWhitespace, isWhitespaceAt } from "../db-from-tree/characters.ts"
import type { TreeRange } from "../db-from-tree/tree.ts"
import { trimmed } from "../db-from-tree/values.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { contains } from "./invariants.ts"
import { nodesOf } from "./walk.ts"
import { WrittenText } from "./written-text.ts"
import { QUADRANT_TRIMMED_TEXT_STATEMENTS } from "./quadrant.ts"
import { XYCHART_ACCESSIBILITY_STATEMENTS } from "./xychart.ts"

// ast.md, Nodes: the value of a node is its written text, or the part of it
// that the node type names. The tokens of the node are the units of that
// text. One rule applies to the value of every node that has one, and the
// table below lists, node type by node type, how the value is made from the
// text: the types that follow the plain rule, and the ones that do not, each
// with the sentence of the specification that says so.

/**
 * How the value of a node type is made from the source text of its range:
 *
 * - `written-text`: the value is the written text, the text of the range
 *   without the directives, the comment regions, and the ignored `;`, and
 *   without the {@link ValueRule.delimiters} of the rule, if it has any. The
 *   tokens of the node are that text, so the value is also the texts of its
 *   tokens joined, but for the whitespace and line terminators that
 *   {@link ValueRule.gaps} says lie in no token.
 * - `units-joined`: the value is the written texts of the units joined in
 *   order, so that whitespace between two units is not part of it. The
 *   tokens of the node are those units, so the value is the texts of its
 *   tokens joined, also where a directive cuts a unit into fragments, and the
 *   whitespace next to the cut that mermaid.js reads as part of the unit lies
 *   in a fragment.
 * - `trimmed-text`: the value is the written text without the whitespace at
 *   its ends, so that it is empty for a text of whitespace only. The tokens of
 *   the node are the written text, as for `written-text`.
 * - `derived`: the value is not the text but follows from it; another check
 *   reads it.
 */
type ValueKind = "written-text" | "units-joined" | "trimmed-text" | "derived"

/** Where the delimiters that a value leaves out lie in the range of the node. */
type DelimitersKind = "string" | "data-block"

/** The way the value of a node type is made, and the sentence of the specification that says so. */
export interface ValueRule {
  /** The field that holds the value. */
  readonly field: "value" | "name"
  readonly kind: ValueKind
  /** The delimiters that belong to the node's own text and that the value leaves out, with the whitespace written inside them kept. */
  readonly delimiters?: DelimitersKind
  /**
   * Whether the whitespace and line terminators between two units of the node
   * are part of the value and lie in no token (ast.md, Nodes): the nodes of
   * text that mermaid.js does not read, which show what was written. A run of
   * text (`RawText`) keeps the whitespace next to a cut in its fragments
   * (parser/docs/tokens.md, A token that a directive cuts). Every other
   * character of the value lies in a token. UsecaseIdentifier also retains
   * the HWS between its separate dash prefix and word, without a token for
   * that HWS (ast/usecase.md, UsecaseIdentifier).
   */
  readonly gaps?: true
  /** Whether the text of the comments in the range of the node is left out as well: the nodes of text that mermaid.js does not read show the lines around a comment (ast.md, Nodes). */
  readonly withoutComments?: true
  /** Whether the value holds no whitespace (ast.md, Identifier). */
  readonly withoutWhitespace?: true
  /** Whether the node has exactly one token, which no directive and no ignored `;` cuts (parser/docs/tokens.md, A token that a directive cuts); also for a `derived` value. */
  readonly oneToken?: true
  /** The sentence of the specification that says how the value is made. */
  readonly spec: string
}

const WRITTEN_TEXT = "Its written text (ast.md, Nodes)."

/**
 * The rule of a tag of a task of a gantt diagram. The tag is an `Identifier`
 * made of one `data-item` unit, a unit of text that a directive may cut, so its
 * tokens are `RawText` tokens (parser/docs/tokens/gantt.md, Tokens), more than
 * one where a directive cuts it, and its name is its written text, as for the
 * tilde word of an ER diagram (`ErIdentifier`): `do%%{x}%%ne` is the tag
 * `done` (ast/gantt.md, GanttTaskStatement).
 */
const GANTT_TAG_RULE: ValueRule = {
  field: "name",
  kind: "written-text",
  spec: "Its written text, of one unit that a directive may cut (ast/gantt.md, GanttTaskStatement).",
}

/** The tags of the tasks of a gantt diagram among `nodes`. */
function ganttTagsOf(nodes: readonly CheckedNode[]): ReadonlySet<CheckedNode> {
  return new Set(
    nodes.flatMap((node) =>
      node.type === "GanttTaskStatement" && Array.isArray(node.tags)
        ? (node.tags as CheckedNode[])
        : [],
    ),
  )
}

const IGNORED_TEXT =
  "Its written text is the source text of its range without the directives, the comment regions, the comments, and the ignored `;`; the whitespace and line terminators between its units are part of it (ast.md, Nodes)."

/**
 * The node types with a value, by type: the types whose value is not simply
 * the written text are those with `delimiters`, the `derived` ones, and the
 * `units-joined` ones, which leave out the whitespace between units.
 * `tests/check-tree-values.test.ts`
 * requires this table to list every field `value` or `name` of a node of the
 * field tables that holds a string or a number, and to agree with the
 * Meaning column of those tables on which of them are the written text.
 */
export const VALUE_RULES: Readonly<Record<string, ValueRule>> = {
  PieLiteral: {
    field: "value",
    kind: "written-text",
    spec: "Its written common value (ast/pie.md, PieLiteral).",
  },
  PieIgnoredText: {
    field: "value",
    kind: "written-text",
    spec: "Its complete written hidden form (ast/pie.md, PieIgnoredText).",
  },
  UsecaseLabel: {
    field: "value",
    kind: "written-text",
    delimiters: "string",
    spec: "Complete written content, excluding plain or markdown delimiters (ast/usecase.md, UsecaseLabel).",
  },
  UsecaseLiteral: {
    field: "value",
    kind: "written-text",
    spec: "Written text of this grammar position (ast/usecase.md, UsecaseLiteral).",
  },
  UsecaseIdentifier: {
    field: "name",
    kind: "written-text",
    gaps: true,
    spec: "Written CSS property name, including internal HWS (ast/usecase.md, UsecaseIdentifier).",
  },
  UsecaseOpeningArrow: {
    field: "value",
    kind: "written-text",
    oneToken: true,
    spec: "Written --, <--, o--, or x-- (ast/usecase.md, UsecaseOpeningArrow).",
  },
  UsecaseArrow: {
    field: "value",
    kind: "written-text",
    oneToken: true,
    spec: "The written sole/final arrow (ast/usecase.md, UsecaseArrow).",
  },
  UsecaseJsonDataBlock: {
    field: "value",
    kind: "written-text",
    delimiters: "data-block",
    spec: "Written interior of the balanced object after its actual opening brace, checked by usecase.ts (ast/usecase.md, UsecaseJsonDataBlock).",
  },
  AgentflowLabel: {
    field: "value",
    kind: "written-text",
    spec: "Its initial string content and following written bare text (ast/agentflow.md, AgentflowLabel).",
    delimiters: "string",
  },
  AgentflowDataBlock: {
    field: "value",
    kind: "written-text",
    spec: "The written interior between @{ and } (ast/agentflow.md, AgentflowDataBlock).",
    delimiters: "data-block",
  },
  AgentflowLiteral: {
    field: "value",
    kind: "written-text",
    spec: "The written text of this value (ast/agentflow.md, AgentflowLiteral).",
  },
  AgentflowIgnoredText: {
    field: "value",
    kind: "written-text",
    spec: "The retained written spelling, with full erased-form delimiters (ast/agentflow.md, AgentflowIgnoredText).",
    withoutComments: true,
  },
  AgentflowArrow: {
    field: "value",
    kind: "written-text",
    spec: "The written arrow without surrounding whitespace (ast/agentflow.md, AgentflowArrow).",
  },
  AgentflowOpeningArrow: {
    field: "value",
    kind: "written-text",
    spec: "The written two opening dashes (ast/agentflow.md, AgentflowOpeningArrow).",
  },
  AgentflowShape: {
    field: "name",
    kind: "derived",
    spec: "The full shape name determined by its delimiters (ast/agentflow.md, AgentflowShape).",
  },
  Identifier: {
    field: "name",
    kind: "units-joined",
    withoutWhitespace: true,
    oneToken: true,
    spec: "The texts of its units, joined in order; no whitespace lies inside or between the units (ast.md, Identifier).",
  },
  StringLiteral: {
    field: "value",
    kind: "written-text",
    delimiters: "string",
    spec: "What the diagram's string rules read between its delimiters (ast.md, StringLiteral).",
  },
  NumericLiteral: {
    field: "value",
    kind: "derived",
    oneToken: true,
    spec: "The number that its written text writes (ast.md, NumericLiteral).",
  },
  FlowchartLabel: {
    field: "value",
    kind: "written-text",
    delimiters: "string",
    spec: "The content of the string or markdown string that it starts with, followed by the written text of the rest of the label (ast/flowchart.md, FlowchartLabel).",
  },
  FlowchartDataBlock: {
    field: "value",
    kind: "written-text",
    delimiters: "data-block",
    spec: "Its written text between `@{` and the `}` that closes it (ast/flowchart.md, FlowchartDataBlock).",
  },
  FlowchartLiteral: {
    field: "value",
    kind: "written-text",
    spec: WRITTEN_TEXT,
  },
  FlowchartIgnoredText: {
    field: "value",
    kind: "written-text",
    gaps: true,
    withoutComments: true,
    spec: IGNORED_TEXT,
  },
  FlowchartArrow: { field: "value", kind: "written-text", spec: WRITTEN_TEXT },
  FlowchartOpeningArrow: {
    field: "value",
    kind: "written-text",
    spec: WRITTEN_TEXT,
  },
  FlowchartShape: {
    field: "name",
    kind: "derived",
    spec: "One of the names in the table of Shapes (ast/flowchart.md, FlowchartShape).",
  },
  SequenceBoxText: {
    field: "value",
    kind: "written-text",
    spec: "Its written text; the whitespace between its colour candidate and its remainder is a token of its own (ast/sequence.md, SequenceBoxText).",
  },
  SequenceIgnoredStatement: {
    field: "value",
    kind: "written-text",
    gaps: true,
    withoutComments: true,
    spec: IGNORED_TEXT,
  },
  SequenceIdentifier: {
    field: "name",
    kind: "written-text",
    spec: WRITTEN_TEXT,
  },
  SequenceLiteral: { field: "value", kind: "written-text", spec: WRITTEN_TEXT },
  SequenceArrow: { field: "value", kind: "written-text", spec: WRITTEN_TEXT },
  SequenceDataBlock: {
    field: "value",
    kind: "written-text",
    delimiters: "data-block",
    spec: "The text between `@{` and `}`, as written, whitespace included (ast/sequence.md, SequenceDataBlock).",
  },
  ClassLiteral: {
    field: "value",
    kind: "written-text",
    spec: "Its written text; for a style, the written texts of its units joined in order (ast/class.md, ClassLiteral).",
  },
  ClassIdentifier: {
    field: "name",
    kind: "units-joined",
    withoutWhitespace: true,
    spec: "The written texts of its units, joined in order; no whitespace lies inside or between the units (ast/class.md, ClassIdentifier).",
  },
  ClassIgnoredText: {
    field: "value",
    kind: "written-text",
    gaps: true,
    withoutComments: true,
    spec: IGNORED_TEXT,
  },
  ClassArrow: {
    field: "value",
    kind: "units-joined",
    spec: "The written texts of its units, joined in order (ast/class.md, ClassArrow).",
  },
  StateLiteral: { field: "value", kind: "written-text", spec: WRITTEN_TEXT },
  StateIgnoredText: {
    field: "value",
    kind: "written-text",
    gaps: true,
    withoutComments: true,
    spec: IGNORED_TEXT,
  },
  StateIgnoredStatement: {
    field: "value",
    kind: "written-text",
    gaps: true,
    withoutComments: true,
    spec: IGNORED_TEXT,
  },
  ErIdentifier: { field: "name", kind: "written-text", spec: WRITTEN_TEXT },
  ErLiteral: {
    field: "value",
    kind: "written-text",
    spec: "Its written text; for a style, the written texts of its units joined in order (ast/er.md, ErLiteral).",
  },
  ErIgnoredText: {
    field: "value",
    kind: "written-text",
    gaps: true,
    withoutComments: true,
    spec: IGNORED_TEXT,
  },
  GanttLiteral: { field: "value", kind: "written-text", spec: WRITTEN_TEXT },
  JourneyLiteral: {
    field: "value",
    kind: "written-text",
    spec: "Its written text (ast/journey.md, JourneyLiteral).",
  },
  JourneyIgnoredText: {
    field: "value",
    kind: "written-text",
    spec: "Its written text, from the third colon of the data to its end, without the whitespace at its end (ast/journey.md, JourneyIgnoredText).",
  },
  RequirementIdentifier: {
    field: "name",
    kind: "written-text",
    spec: "Its written text, whitespace included, without the whitespace after the name (ast/requirement.md, RequirementIdentifier).",
  },
  RequirementLiteral: {
    field: "value",
    kind: "written-text",
    spec: "Its written text; for a style, the written texts of its units joined in order (ast/requirement.md, RequirementLiteral).",
  },
  RequirementIgnoredText: {
    field: "value",
    kind: "written-text",
    gaps: true,
    spec: "Its written text is the source text of its range without the directives, the comment regions, and the ignored `;`; the whitespace between its units is part of it, and no diagram comment lies inside it (ast/requirement.md, RequirementIgnoredText).",
  },
  KanbanLiteral: {
    field: "value",
    kind: "written-text",
    spec: "Its written text (ast/kanban.md, KanbanLiteral).",
  },
  KanbanLabel: {
    field: "value",
    kind: "written-text",
    delimiters: "string",
    spec: "The written text, without string delimiters (ast/kanban.md, KanbanLabel).",
  },
  KanbanDataBlock: {
    field: "value",
    kind: "written-text",
    delimiters: "data-block",
    spec: "The whole written interior of `@{ ... }` (ast/kanban.md, KanbanDataBlock).",
  },
  MindmapLabel: {
    field: "value",
    kind: "written-text",
    delimiters: "string",
    spec: "For a text, its written text; for a string or a markdown string, its written text between its delimiters (ast/mindmap.md, MindmapLabel).",
  },
  MindmapLiteral: {
    field: "value",
    kind: "written-text",
    spec: "Its written text (ast/mindmap.md, MindmapLiteral).",
  },
  IshikawaLiteral: {
    field: "value",
    kind: "written-text",
    spec: "The node text as written (ast/ishikawa.md, IshikawaLiteral).",
  },
  TimelineLiteral: {
    field: "value",
    kind: "written-text",
    spec: "Its written text (ast/timeline.md, TimelineLiteral).",
  },
  SankeyIdentifier: {
    field: "name",
    kind: "trimmed-text",
    spec: "The field without the whitespace at its ends, as written (ast/sankey.md, SankeyIdentifier).",
  },
  SankeyLiteral: {
    field: "value",
    kind: "trimmed-text",
    spec: "The field without the whitespace at its ends, as written (ast/sankey.md, SankeyLiteral).",
  },
  VennLiteral: {
    field: "value",
    kind: "written-text",
    gaps: true,
    spec: "Its written text, including atom spacing (ast/venn.md, VennLiteral).",
  },
  VennIgnoredText: {
    field: "value",
    kind: "written-text",
    spec: "The swallowed code unit as written (ast/venn.md, VennIgnoredText).",
  },
  VennLabel: {
    field: "value",
    kind: "derived",
    spec: "The written bracket interior without string quotes (ast/venn.md, VennLabel), checked in venn.ts.",
  },
  C4Literal: {
    field: "value",
    kind: "written-text",
    spec: "Its written text (ast/c4.md, C4Literal).",
  },
  BlockLiteral: { field: "value", kind: "written-text", spec: WRITTEN_TEXT },
  BlockArrow: { field: "value", kind: "written-text", spec: WRITTEN_TEXT },
  BlockOpeningArrow: {
    field: "value",
    kind: "written-text",
    spec: WRITTEN_TEXT,
  },
  QuadrantIdentifier: {
    field: "name",
    kind: "written-text",
    spec: "Its written text (ast/quadrant.md, QuadrantIdentifier).",
  },
  QuadrantLabel: {
    field: "value",
    kind: "derived",
    spec: "For a text that starts without quotes, its written text; for a string or a markdown string, its content followed by the written text of the rest (ast/quadrant.md, QuadrantLabel).",
  },
  QuadrantLiteral: {
    field: "value",
    kind: "written-text",
    spec: "Its written text (ast/quadrant.md, QuadrantLiteral).",
  },
  XychartLiteral: {
    field: "value",
    kind: "units-joined",
    withoutWhitespace: true,
    spec: "For a text without quotes, the written texts of its units, joined; the whitespace between them is no part of it (ast/xychart.md, XychartLiteral).",
  },
}

/**
 * ast/xychart.md, XychartLiteral: the literals of the accessibility
 * statements, whose value is the written text without the whitespace at its
 * ends, the whitespace between its characters being part of it; the other
 * literals are texts without quotes, whose value is the units joined. The same
 * holds for the literals of a title, an accessibility statement, and a block of
 * a quadrant chart (ast/quadrant.md, QuadrantLiteral), whose other literals are
 * written text.
 */
function accessibilityTextsOf(nodes: readonly CheckedNode[]): Set<unknown> {
  const texts = new Set<unknown>()
  for (const node of nodes) {
    if (
      (XYCHART_ACCESSIBILITY_STATEMENTS.includes(node.type) ||
        QUADRANT_TRIMMED_TEXT_STATEMENTS.includes(node.type)) &&
      node.value !== null
    ) {
      texts.add(node.value)
    }
  }
  return texts
}

/** The delimiters around the content of the string that `node` starts with; none if it starts with none. */
export type StringDelimitersOf = (
  node: CheckedNode,
  problems: Problems,
) => TreeRange[]

/**
 * The delimiters of the strings of a diagram with one pair of quotes: the
 * opening quote, and the closing one when the string is closed (ast.md,
 * StringLiteral).
 */
export function quoteDelimitersOf(node: CheckedNode): TreeRange[] {
  const [start, end] = node.range
  const opening: TreeRange = [start, start + 1]
  return node.closed === true ? [opening, [end - 1, end]] : [opening]
}

/** The nodes of the `styles` of the statements of a class diagram, an ER diagram, or a requirement diagram: their ClassLiteral, ErLiteral, and RequirementLiteral values are units joined. */
function stylesOf(nodes: readonly CheckedNode[]): Set<unknown> {
  const styles = new Set<unknown>()
  for (const node of nodes) {
    if (
      (node.type === "ClassStyleStatement" ||
        node.type === "ClassClassDefStatement" ||
        node.type === "ErStyleStatement" ||
        node.type === "ErClassDefStatement" ||
        node.type === "RequirementStyleStatement" ||
        node.type === "RequirementClassDefStatement") &&
      Array.isArray(node.styles)
    ) {
      for (const style of node.styles as unknown[]) styles.add(style)
    }
  }
  return styles
}

/** The delimiters of `node` as the rule of its type says. */
function delimitersOf(
  node: CheckedNode,
  kind: DelimitersKind,
  delimitersOfStrings: StringDelimitersOf,
  problems: Problems,
  root: CheckedRoot,
): TreeRange[] {
  if (node.type === "UsecaseJsonDataBlock") {
    const opening = root.tokens.find(
      (token) =>
        token.type === "Punctuator" &&
        token.value === "{" &&
        contains(node.range, token.range),
    )
    return [
      [node.range[0], opening?.range[1] ?? node.range[0] + 2],
      [node.range[1] - 1, node.range[1]],
    ]
  }
  if (kind === "string") return delimitersOfStrings(node, problems)
  const [start, end] = node.range
  return [
    [start, start + 2],
    [end - 1, end],
  ]
}

/** The texts of the tokens of `root` in `range` joined, other than the `Directive` and `IgnoredSemicolon` tokens, without the characters in `leftOut`. */
function joinedTokenTextOf(
  text: string,
  root: CheckedRoot,
  range: TreeRange,
  leftOut: readonly TreeRange[],
): string {
  let joined = ""
  for (const token of root.tokens) {
    if (
      token.type === "Directive" ||
      token.type === "IgnoredSemicolon" ||
      token.range[0] < range[0] ||
      range[1] < token.range[1]
    ) {
      continue
    }
    for (let offset = token.range[0]; offset < token.range[1]; offset++) {
      if (leftOut.some(([from, to]) => from <= offset && offset < to)) continue
      joined += text[offset]
    }
  }
  return joined
}

/** `text` without its whitespace. */
function withoutWhitespace(text: string): string {
  return [...text]
    .filter((character) => !isWhitespace(character.codePointAt(0) ?? 0))
    .join("")
}

/**
 * parser/docs/tokens.md, A token that a directive cuts: a run of text that a
 * cut (a directive, a comment region, or an ignored `;`) lies inside is cut
 * into fragments, and the whitespace next to the cut lies in the fragment next
 * to it. So where a cut separates two `RawText` tokens of `node`, the
 * whitespace between the first token and the cut, and between the cut and the
 * second, lies in those tokens and not outside them. A cut between a
 * `RawText` token and a token of another kind lies between two units, and the
 * whitespace there is no token's.
 */
function checkRunsKeepWhitespaceNextToCuts(
  text: string,
  root: CheckedRoot,
  node: CheckedNode,
  written: WrittenText,
  problems: Problems,
): void {
  const [start, end] = node.range
  const tokens = root.tokens.filter(
    (token) =>
      token.type !== "Directive" &&
      token.type !== "IgnoredSemicolon" &&
      start <= token.range[0] &&
      token.range[1] <= end,
  )
  for (const [index, token] of tokens.entries()) {
    const next = tokens[index + 1]
    if (
      token.type !== "RawText" ||
      next === undefined ||
      next.type !== "RawText"
    ) {
      continue
    }
    // The characters between the two tokens: whitespace and cuts only, with a
    // cut in them, form the gap that a run keeps whitespace out of.
    const gap = [token.range[1], next.range[0]]
    let cut = false
    let whitespaceOutside = false
    for (let offset = gap[0] ?? 0; offset < (gap[1] ?? 0); offset++) {
      if (written.isLeftOut(offset)) cut = true
      else if (isWhitespaceAt(text, offset)) whitespaceOutside = true
    }
    problems.expect(
      !(cut && whitespaceOutside),
      label(node),
      `the whitespace between ${label(token)} and ${label(next)}, next to a cut, lies in no token`,
    )
  }
}

/**
 * The ranges of the diagram comments, each from its mark to the line
 * terminator that ends its line (state.md, Comments; common.md, Notation): a
 * line feed, the CRLF as one, or a lone CR, or the end of the text where none
 * follows. The range runs past the comment lines that cut the comment, since
 * their line terminators are part of the comment regions that the written text
 * leaves out and no line terminator of the comment itself. A diagram comment
 * is a comment that does not start where the text leaves a character out, as a
 * comment line does; the fragment after a comment line starts in the same
 * comment, and so has the same end. What the records leave between the
 * comments of one diagram comment, such as a U+2028 and the whitespace after a
 * comment line, lies in its range. This also implements diagrams/venn.md,
 * Comments: a diagram comment stops before a line feed, not U+2028 or U+2029.
 */
export function diagramCommentRanges(
  text: string,
  root: CheckedRoot,
  written: WrittenText,
): TreeRange[] {
  const ranges: TreeRange[] = []
  for (const comment of root.comments) {
    if (written.isLeftOut(comment.range[0])) continue
    let end = comment.range[1]
    while (
      end < text.length &&
      (written.isLeftOut(end) || (text[end] !== "\n" && text[end] !== "\r"))
    ) {
      end++
    }
    ranges.push([comment.range[0], end])
  }
  return ranges
}

/**
 * parser/docs/tokens.md, A token that a directive cuts: a node of one token
 * (an `Identifier`, a number) has exactly one, other than the `Directive` and
 * `IgnoredSemicolon` tokens.
 */
function checkHasOneToken(
  root: CheckedRoot,
  node: CheckedNode,
  problems: Problems,
): void {
  const count = root.tokens.filter(
    (token) =>
      token.type !== "Directive" &&
      token.type !== "IgnoredSemicolon" &&
      contains(node.range, token.range),
  ).length
  problems.expect(
    count === 1,
    label(node),
    `has ${count} tokens, not the one that a node of this type has`,
  )
}

/** `value` for a message: the JSON of it, but for a number that JSON cannot write, its name. */
function shown(value: unknown): string {
  return typeof value === "number" && !Number.isFinite(value)
    ? String(value)
    : (JSON.stringify(value) ?? "undefined")
}

/**
 * Checks the value of every node that has one against the rule of its type
 * ({@link VALUE_RULES}): the value is made from the written text of the
 * node's range as the rule says, and the tokens of the node agree with it
 * (ast.md, Nodes, and Tokens). `delimitersOfStrings` gives the delimiters of
 * the strings of the diagram.
 */
export function checkValues(
  text: string,
  root: CheckedRoot,
  delimitersOfStrings: StringDelimitersOf,
  problems: Problems,
): void {
  const written = new WrittenText(text, root)
  const diagramComments = diagramCommentRanges(text, root, written)
  const nodes = nodesOf(root)
  const styles = stylesOf(nodes)
  const accessibilityTexts = accessibilityTextsOf(nodes)
  const ganttTags = ganttTagsOf(nodes)
  for (const node of nodes) {
    const rule = ganttTags.has(node) ? GANTT_TAG_RULE : VALUE_RULES[node.type]
    if (rule === undefined) continue
    if (rule.oneToken === true) checkHasOneToken(root, node, problems)
    if (rule.kind === "derived") continue
    const where = label(node)
    const value = node[rule.field]
    // The field is a string in every tree of the form that `checkShape()`
    // requires, which `checkTree()` has checked.
    if (typeof value !== "string") continue
    const delimiters =
      rule.delimiters === undefined
        ? []
        : delimitersOf(
            node,
            rule.delimiters,
            delimitersOfStrings,
            problems,
            root,
          )
    const joined = joinedTokenTextOf(text, root, node.range, delimiters)
    const kind = styles.has(node)
      ? "units-joined"
      : accessibilityTexts.has(node)
        ? "trimmed-text"
        : rule.kind
    if (kind === "trimmed-text") {
      const writtenText = written.of(node.range)
      problems.expectEqual(
        value,
        trimmed(writtenText),
        where,
        `${rule.field} is not its written text without the whitespace at its ends`,
      )
      problems.expectEqual(
        joined,
        writtenText,
        where,
        "the texts of its tokens joined are not its written text",
      )
    } else if (kind === "units-joined") {
      problems.expectEqual(
        value,
        joined,
        where,
        `${rule.field} is not the texts of its tokens joined`,
      )
    } else {
      const leftOut = [...delimiters]
      if (rule.withoutComments === true) {
        for (const comment of root.comments) {
          if (contains(node.range, comment.range)) leftOut.push(comment.range)
        }
        for (const [start, end] of diagramComments) {
          if (node.range[0] <= start && start < node.range[1]) {
            leftOut.push([start, Math.min(end, node.range[1])])
          }
        }
      }
      const writtenText = written.of(node.range, leftOut)
      problems.expectEqual(
        value,
        writtenText,
        where,
        `${rule.field} is not its written text`,
      )
      if (rule.gaps === true) {
        problems.expectEqual(
          withoutWhitespace(joined),
          withoutWhitespace(writtenText),
          where,
          "a character of its written text other than whitespace lies in no token",
        )
        checkRunsKeepWhitespaceNextToCuts(text, root, node, written, problems)
      } else {
        problems.expectEqual(
          joined,
          writtenText,
          where,
          "the texts of its tokens joined are not its written text",
        )
      }
    }
    if (rule.withoutWhitespace === true && !accessibilityTexts.has(node)) {
      problems.expect(
        withoutWhitespace(joined) === joined,
        where,
        `${rule.field} holds whitespace`,
      )
    }
  }
  for (const node of nodes) {
    if (node.type !== "NumericLiteral") continue
    const number = Number(written.of(node.range))
    // A number that a double cannot hold is `Infinity` or `-Infinity`, and null
    // in a tree read from JSON, which writes them so; -0 and 0 are equal.
    const isNumber =
      node.value === null ? !Number.isFinite(number) : node.value === number
    problems.expect(
      isNumber,
      label(node),
      `value is not the number that its written text writes: ${shown(node.value)}, not ${shown(number)}`,
    )
  }
}
