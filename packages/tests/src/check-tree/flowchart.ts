import {
  readConvertedCharacters,
  readWhitespaceAfterBraceAsLineFeed,
} from "../db-from-tree/converted-text.ts"
import { StringDelimiters } from "../db-from-tree/flowchart-strings.ts"
import type { TreeRange } from "../db-from-tree/tree.ts"
import { FLOWCHART_SHAPES } from "./flowchart-shapes.ts"
import { diagramTokensOf } from "./invariants.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import { checkTokensInValueNodes, nodeTokensIn, tokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import type { StringDelimitersOf } from "./values.ts"
import { isNode, nodesOf } from "./walk.ts"
import {
  isLineTerminatorCode,
  isWhitespaceAt,
} from "../db-from-tree/characters.ts"
import { WrittenText } from "./written-text.ts"

// The checks of a flowchart tree beyond the conditions of every tree
// (invariants.ts): what packages/spec/docs/ast/flowchart.md and
// packages/spec/docs/diagrams/flowchart.md state about the fields of the
// nodes, as far as they follow from the tree and the source text. Each check
// below names the sentence it implements.
//
// The nodes are read through the interfaces below, which hold the fields that
// a check reads and no others. `checkShape()` has required every field of
// every node (shape.ts) before a check here runs, so the functions that test
// for these fields only tell the type system what the tree is.

/** A node with a `value` field: ast/flowchart.md, the nodes whose table has a `value` of type string. */
interface ValueNode extends CheckedNode {
  readonly value: string
}

/** ast/flowchart.md, FlowchartDiagram. */
interface FlowchartDiagramNode extends CheckedNode {
  readonly direction: string | null
}

/** ast/flowchart.md, FlowchartShape. */
interface FlowchartShapeNode extends CheckedNode {
  readonly name: string
  readonly property: CheckedNode | null
  readonly label: CheckedNode
}

/** ast/flowchart.md, FlowchartLink. */
interface FlowchartLinkNode extends CheckedNode {
  readonly opening: ValueNode | null
  readonly arrow: ValueNode
}

/** The statements that have a list of styles: ast/flowchart.md, FlowchartStyleStatement and the three statements that list styles like it. */
interface FlowchartStyleListNode extends CheckedNode {
  readonly styles: readonly (CheckedNode | null)[]
}

/** ast/flowchart.md, FlowchartSubgraphStatement. */
interface FlowchartSubgraphNode extends CheckedNode {
  readonly name: CheckedNode
  readonly title: CheckedNode | null
}

/** Whether `node` has a string `value`. */
function hasValue(node: CheckedNode): node is ValueNode {
  return typeof node.value === "string"
}

/** Whether `node` has the fields of a FlowchartDiagram that are read. */
function isDiagram(node: CheckedNode): node is FlowchartDiagramNode {
  return typeof node.direction === "string" || node.direction === null
}

/** Whether `node` has the fields of a FlowchartShape that are read. */
function isShape(node: CheckedNode): node is FlowchartShapeNode {
  return (
    typeof node.name === "string" &&
    (node.property === null || isNode(node.property)) &&
    isNode(node.label)
  )
}

/** Whether `node` has the fields of a FlowchartLink that are read. */
function isLink(node: CheckedNode): node is FlowchartLinkNode {
  return (
    isNode(node.arrow) &&
    hasValue(node.arrow) &&
    (node.opening === null || (isNode(node.opening) && hasValue(node.opening)))
  )
}

/** Whether `node` has a list of styles, each a node or null. */
function isStyleList(node: CheckedNode): node is FlowchartStyleListNode {
  return (
    Array.isArray(node.styles) &&
    node.styles.every((style) => style === null || isNode(style))
  )
}

/** Whether `node` has the fields of a FlowchartSubgraphStatement that are read. */
function isSubgraph(node: CheckedNode): node is FlowchartSubgraphNode {
  return isNode(node.name) && (node.title === null || isNode(node.title))
}

/**
 * diagrams/flowchart.md, Shapes: the name that the delimiters `opening` and
 * `closing` give a shape, as its table lists them; null for delimiters that no
 * row has. `closing` is the source text of the closing unit.
 */
function shapeNameOf(opening: string, closing: string): string | null {
  const row = FLOWCHART_SHAPES.find(
    (shape) => shape.opening === opening && shape.closings.includes(closing),
  )
  return row === undefined ? null : row.name
}

/**
 * The delimiter in `range`: its one `Punctuator` token, whole (parser/docs/
 * tokens/flowchart.md, Tokens: the units that open a shape, and those that
 * close it, are one token each, which a directive or an ignored `;` does not
 * cut). The text is empty, and a problem is reported, when `range` has none
 * or more than one.
 */
function delimiterIn(
  root: CheckedRoot,
  range: TreeRange,
  where: string,
  problems: Problems,
): string {
  const delimiters = tokensIn(root, range).filter(
    (token) => token.type === "Punctuator",
  )
  problems.expect(
    delimiters.length === 1,
    where,
    `has ${delimiters.length} delimiter tokens between ${range[0]} and ${range[1]}, not one`,
  )
  return delimiters.length === 1 ? (delimiters[0]?.value ?? "") : ""
}

/**
 * diagrams/flowchart.md, Shapes: the name of `shape` is the one that its
 * delimiters give: those before its property or label, and those after its
 * label; and it has a property exactly when it is written with `[|`.
 */
function checkShape(
  root: CheckedRoot,
  shape: FlowchartShapeNode,
  problems: Problems,
): void {
  const where = label(shape)
  const firstInside = shape.property ?? shape.label
  const opening = delimiterIn(
    root,
    [shape.range[0], firstInside.range[0]],
    where,
    problems,
  )
  const closing = delimiterIn(
    root,
    [shape.label.range[1], shape.range[1]],
    where,
    problems,
  )
  problems.expectEqual(
    shapeNameOf(opening, closing),
    shape.name,
    where,
    `the name of the shape, written ${opening} and ${closing}`,
  )
  // ast/flowchart.md, FlowchartShape: `property` is not null exactly when the
  // shape is written as `[|name:value|…]`.
  problems.expect(
    (shape.property !== null) === (opening === "[|"),
    where,
    "has a property exactly when it is written with [|",
  )
}

/**
 * diagrams/flowchart.md, The header context, rule 2: the texts of the
 * `header-direction` units, which are the `Keyword` token after the header
 * keyword, as written.
 */
const HEADER_DIRECTIONS: readonly string[] = [
  "LR",
  "RL",
  "TB",
  "BT",
  "TD",
  "BR",
  "v",
  "<",
  ">",
  "^",
]

/**
 * ast/flowchart.md, FlowchartArrow and FlowchartOpeningArrow: the markers that
 * the characters before and after the line write.
 */
const START_MARKERS: ReadonlyMap<string, string> = new Map([
  ["<", "arrow"],
  ["x", "cross"],
  ["o", "circle"],
])
const END_MARKERS: ReadonlyMap<string, string> = new Map([
  [">", "arrow"],
  ["x", "cross"],
  ["o", "circle"],
])

/** ast/flowchart.md, FlowchartArrow: the line that each line character writes. */
const LINES: ReadonlyMap<string, string> = new Map([
  ["-", "solid"],
  ["=", "thick"],
  [".", "dotted"],
  ["~", "invisible"],
])

/** ast/flowchart.md, FlowchartOpeningArrow: the line that each opening arrow writes after its marker. */
const OPENING_LINES: ReadonlyMap<string, string> = new Map([
  ["--", "solid"],
  ["==", "thick"],
  ["-.", "dotted"],
])

/**
 * ast/flowchart.md, FlowchartLink, FlowchartArrow, and FlowchartOpeningArrow:
 * each arrow of the link is one `Punctuator` token, and its fields are what its
 * value writes: a start marker for a first character that is no line character,
 * an end marker for such a last character, the line of its line characters
 * (`dotted` when it has a `.`), and their number, the `.` only for a dotted
 * line. The opening arrow has the line of the closing arrow.
 */
function checkLink(
  root: CheckedRoot,
  link: FlowchartLinkNode,
  problems: Problems,
): void {
  const { arrow, opening } = link
  for (const node of opening === null ? [arrow] : [opening, arrow]) {
    problems.expectEqual(
      nodeTokensIn(root, node.range).map((token) => [token.type, token.range]),
      [["Punctuator", node.range]],
      label(node),
      "the tokens of the arrow",
    )
  }
  if (opening !== null) {
    problems.expectEqual(
      opening.line,
      arrow.line,
      label(opening),
      "the line is that of the closing arrow",
    )
  }
  const characters = [...arrow.value]
  const first = characters.at(0) ?? ""
  const last = characters.at(-1) ?? ""
  const lineCharacters = characters.filter((character) => LINES.has(character))
  const line = lineCharacters.includes(".")
    ? "dotted"
    : LINES.get(lineCharacters.at(0) ?? "")
  problems.expectEqual(
    {
      startMarker: arrow.startMarker,
      line: arrow.line,
      length: arrow.length,
      endMarker: arrow.endMarker,
    },
    {
      startMarker: LINES.has(first) ? "none" : START_MARKERS.get(first),
      line,
      length: lineCharacters.filter((character) =>
        line === "dotted" ? character === "." : true,
      ).length,
      endMarker: LINES.has(last) ? "none" : END_MARKERS.get(last),
    },
    label(arrow),
    `the fields of the arrow, written ${arrow.value}`,
  )
  if (opening !== null) {
    const openingCharacters = [...opening.value]
    const openingFirst = openingCharacters.at(0) ?? ""
    const marked = !LINES.has(openingFirst)
    problems.expectEqual(
      { startMarker: opening.startMarker, line: opening.line },
      {
        startMarker: marked ? START_MARKERS.get(openingFirst) : "none",
        line: OPENING_LINES.get(
          openingCharacters.slice(marked ? 1 : 0).join(""),
        ),
      },
      label(opening),
      `the fields of the opening arrow, written ${opening.value}`,
    )
  }
}

/**
 * The delimiters of the strings of the tree, read from the converted form of
 * the text; a string that cannot be read is a problem, not an exception.
 */
export function stringDelimitersOf(
  text: string,
  root: CheckedRoot,
): StringDelimitersOf {
  const strings = new StringDelimiters(
    root,
    readWhitespaceAfterBraceAsLineFeed(readConvertedCharacters(text, root)),
  )
  // A node asked twice (the value and the kind of a label) reports once.
  const read = new Map<CheckedNode, TreeRange[]>()
  return (node, problems) => {
    const known = read.get(node)
    if (known !== undefined) return known
    let delimiters: TreeRange[]
    try {
      delimiters = strings.around(node.range)
    } catch (error) {
      problems.report(
        label(node),
        `its string cannot be read: ${error instanceof Error ? error.message : String(error)}`,
      )
      delimiters = []
    }
    read.set(node, delimiters)
    return delimiters
  }
}

/**
 * ast/flowchart.md, FlowchartStyleStatement: a style after a `,` starts right
 * after it, the whitespace there included, and every style ends at its last
 * character that is not whitespace. The `,` that separate the styles are the
 * last `,` punctuators of the statement; those before them separate the
 * numbers of a `linkStyle` statement.
 */
function checkStyles(
  text: string,
  root: CheckedRoot,
  written: WrittenText,
  statement: FlowchartStyleListNode,
  problems: Problems,
): void {
  const commas = tokensIn(root, statement.range).filter(
    (token) => token.type === "Punctuator" && token.value === ",",
  )
  const separators = commas.slice(commas.length - (statement.styles.length - 1))
  statement.styles.forEach((style, index) => {
    if (style === null) return
    const where = label(style)
    problems.expect(
      !isWhitespaceAt(text, style.range[1] - 1),
      where,
      "ends with whitespace",
    )
    if (index === 0) return
    const comma = separators.at(index - 1)
    if (comma === undefined) {
      problems.report(where, "follows a style but no `,` separates them")
      return
    }
    problems.expectEqual(
      written.of([comma.range[1], style.range[0]]),
      "",
      where,
      "starts right after the `,` before it",
    )
  })
}

/**
 * ast/flowchart.md, FlowchartSubgraphStatement: the name of a subgraph without
 * a title runs over the whitespace after it, up to its separator or the first
 * empty description block, so nothing but a line terminator lies between it and
 * the next token; with a title, it ends at its last character that is not
 * whitespace.
 */
function checkSubgraphName(
  text: string,
  root: CheckedRoot,
  written: WrittenText,
  statement: FlowchartSubgraphNode,
  problems: Problems,
): void {
  const { name } = statement
  const where = label(name)
  if (statement.title !== null) {
    problems.expect(
      !isWhitespaceAt(text, name.range[1] - 1),
      where,
      "before a title ends with whitespace",
    )
    return
  }
  const next = diagramTokensOf(root).find(
    (token) => token.range[0] >= name.range[1],
  )
  const after = written.of([name.range[1], next?.range[0] ?? text.length])
  let lineEnd = 0
  while (
    lineEnd < after.length &&
    !isLineTerminatorCode(after.charCodeAt(lineEnd))
  ) {
    lineEnd += 1
  }
  problems.expectEqual(
    after.slice(0, lineEnd),
    "",
    where,
    "ends before the whitespace after it",
  )
}

/**
 * diagrams/flowchart.md, Labels and Strings: the kind of a label is `text`
 * when it does not start with a string, and otherwise the kind of the context
 * that reads the content of its string: `markdown` when that context was
 * entered by `"` and a backtick, `string` when it was entered by a `"` alone.
 * The delimiter just before the content ends with a backtick in the first case
 * and with a `"` in the second, however the contexts nest: ``""`x`""`` is a
 * markdown string, and `"a`b"` a string.
 */
function checkLabelKind(
  written: WrittenText,
  delimitersOf: StringDelimitersOf,
  node: CheckedNode,
  problems: Problems,
): void {
  const opening = delimitersOf(node, problems).at(0)
  const expected =
    opening === undefined
      ? "text"
      : written.of(opening).endsWith("`")
        ? "markdown"
        : "string"
  problems.expectEqual(
    node.kind,
    expected,
    label(node),
    "the kind of the label, from the delimiter before its content",
  )
}

/**
 * ast/flowchart.md: checks what the flowchart document states about its tree
 * beyond the invariants of ast.md: the values of the leaf nodes are their
 * written texts, the tokens of values lie in value nodes, the direction of the
 * header is the first token after the header keyword, the name of a shape
 * agrees with its delimiters, each arrow of a link is one token or its
 * fragments where an ignored `;` cuts it, its fields are what it writes, and
 * the opening arrow has the line of the closing one, a description block is
 * closed exactly when its last token is `}`, a style and the name of a
 * subgraph hold the whitespace that mermaid.js reads into them and no other.
 * `root` is the tree of a flowchart diagram type, whose body is a
 * FlowchartDiagram.
 */
export function checkFlowchartTree(
  text: string,
  root: CheckedRoot,
  delimitersOf: StringDelimitersOf,
  problems: Problems,
): void {
  const diagram = root.body
  const written = new WrittenText(text, root)
  checkTokensInValueNodes(root, problems)
  if (isDiagram(diagram)) {
    // FlowchartDiagram: the direction of the header, as written, is the token
    // after the header keyword when that is a direction, and null otherwise
    // (The header context, rules 1 and 2).
    const second = diagramTokensOf(root).at(1)
    problems.expectEqual(
      diagram.direction,
      second?.type === "Keyword" && HEADER_DIRECTIONS.includes(second.value)
        ? second.value
        : null,
      label(diagram),
      "the direction of the header is not the first token of the diagram after the header keyword, or null when that is no direction",
    )
  }
  for (const node of nodesOf(root)) {
    switch (node.type) {
      case "FlowchartShape":
        if (isShape(node)) checkShape(root, node, problems)
        break
      case "FlowchartLink":
        if (isLink(node)) checkLink(root, node, problems)
        break
      case "FlowchartStyleStatement":
      case "FlowchartClassDefStatement":
      case "FlowchartLinkStyleStatement":
      case "FlowchartDefaultLinkStyleStatement":
        if (isStyleList(node)) {
          checkStyles(text, root, written, node, problems)
        }
        break
      case "FlowchartSubgraphStatement":
        if (isSubgraph(node)) {
          checkSubgraphName(text, root, written, node, problems)
        }
        break
      case "FlowchartLabel":
        checkLabelKind(written, delimitersOf, node, problems)
        break
      case "FlowchartDirectionStatement":
        // diagrams/flowchart.md, The direction line: the `Keyword` tokens of
        // the statement are `direction` and the value, as written: one of
        // `TB`, `BT`, `RL`, `LR`, and `TD`, in upper case; the text before
        // and after them is `RawText` (ast/flowchart.md,
        // FlowchartDirectionStatement).
        problems.expectEqual(
          nodeTokensIn(root, node.range)
            .filter((token) => token.type === "Keyword")
            .map((token) => token.value),
          ["direction", node.direction],
          label(node),
          "the keywords",
        )
        break
      case "FlowchartClickUrlStatement": {
        // diagrams/flowchart.md, The statement context, rule 13, and Click
        // statements: the link target, `_self`, `_blank`, `_parent`, or
        // `_top`, is the last token of the statement, a `Keyword`; the
        // statement has none when its last token is the URL or the tooltip.
        const last = nodeTokensIn(root, node.range).at(-1)
        problems.expectEqual(
          last?.type === "Keyword" ? last.value : null,
          node.target,
          label(node),
          "the target, which is the last token",
        )
        break
      }
      case "FlowchartAccDescrBlockStatement": {
        // ast/flowchart.md, FlowchartAccDescrBlockStatement: `closed` is
        // whether the block ends with `}`.
        const last = tokensIn(root, node.range).at(-1)
        problems.expectEqual(
          node.closed,
          last?.type === "Punctuator" && last.value === "}",
          label(node),
          "closed is not whether the last token is `}`",
        )
        break
      }
      default:
        break
    }
  }
}
