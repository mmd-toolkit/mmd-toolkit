import {
  agentflowPreservesComments,
  readAgentflowCharacters,
} from "../db-from-tree/converted-text.ts"
import { StringDelimiters } from "../db-from-tree/graph.ts"
import { isWhitespace, isWordCharacter } from "../db-from-tree/characters.ts"
import { trimmed } from "../db-from-tree/values.ts"
import { scanSource } from "../source-scan.ts"
import {
  checkChildTypes,
  checkFieldWords,
  checkListsWithAnEntry,
} from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { GRAPH_SHAPES } from "./graph-shapes.ts"
import {
  digitsOnly,
  erasedGraphForm,
  graphDirection,
  graphLeafIsValid,
  horizontalPadding,
} from "./graph-lexical.ts"
import type { GraphLeafPosition } from "./graph-lexical.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  CHILD,
  checkAccessibilityBlock,
  checkAccessibilityLine,
  checkLayout,
  checkRangeIsHull,
  checkTokenKinds,
  childOf,
  entriesOf,
  isBlank,
  ownOf,
  readingOf,
  textOf,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes, nodeTokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import type { StringDelimitersOf } from "./values.ts"
import { childNodesOf, nodesOf } from "./walk.ts"

/** ast/agentflow.md: child types in visitation order, without inferred relationships. */
export const AGENTFLOW_CHILD_TYPES: FieldTable<readonly string[]> = {
  AgentflowDiagram: {
    body: [
      "AgentflowEmptyStatement",
      "AgentflowFlowStatement",
      "AgentflowGlobalStatement",
      "AgentflowConnectorStatement",
      "AgentflowVertexStatement",
      "AgentflowStyleStatement",
      "AgentflowClassDefStatement",
      "AgentflowClassStatement",
      "AgentflowLinkStyleStatement",
      "AgentflowDefaultLinkStyleStatement",
      "AgentflowClickCallbackStatement",
      "AgentflowClickUrlStatement",
      "AgentflowDirectionStatement",
      "AgentflowAccTitleStatement",
      "AgentflowAccDescrStatement",
      "AgentflowAccDescrBlockStatement",
    ],
  },
  AgentflowFlowStatement: {
    name: ["AgentflowName"],
    title: ["AgentflowLabel"],
    data: ["AgentflowDataBlock"],
    body: [
      "AgentflowEmptyStatement",
      "AgentflowFlowStatement",
      "AgentflowGlobalStatement",
      "AgentflowConnectorStatement",
      "AgentflowVertexStatement",
      "AgentflowStyleStatement",
      "AgentflowClassDefStatement",
      "AgentflowClassStatement",
      "AgentflowLinkStyleStatement",
      "AgentflowDefaultLinkStyleStatement",
      "AgentflowClickCallbackStatement",
      "AgentflowClickUrlStatement",
      "AgentflowDirectionStatement",
      "AgentflowAccTitleStatement",
      "AgentflowAccDescrStatement",
      "AgentflowAccDescrBlockStatement",
    ],
  },
  AgentflowGlobalStatement: {
    body: [
      "AgentflowEmptyStatement",
      "AgentflowFlowStatement",
      "AgentflowGlobalStatement",
      "AgentflowConnectorStatement",
      "AgentflowVertexStatement",
      "AgentflowStyleStatement",
      "AgentflowClassDefStatement",
      "AgentflowClassStatement",
      "AgentflowLinkStyleStatement",
      "AgentflowDefaultLinkStyleStatement",
      "AgentflowClickCallbackStatement",
      "AgentflowClickUrlStatement",
      "AgentflowDirectionStatement",
      "AgentflowAccTitleStatement",
      "AgentflowAccDescrStatement",
      "AgentflowAccDescrBlockStatement",
    ],
  },
  AgentflowConnectorStatement: {
    name: ["AgentflowName"],
    title: ["AgentflowLabel"],
    data: ["AgentflowDataBlock"],
  },
  AgentflowName: {
    parts: ["AgentflowLabel", "AgentflowIgnoredText"],
  },
  AgentflowVertexStatement: {
    first: ["AgentflowVertexGroup"],
    links: ["AgentflowLink"],
  },
  AgentflowVertexGroup: {
    vertices: ["AgentflowVertex"],
  },
  AgentflowVertex: {
    id: ["Identifier"],
    shape: ["AgentflowShape"],
    cssClass: ["Identifier"],
    data: ["AgentflowDataBlock"],
  },
  AgentflowShape: {
    property: ["AgentflowShapeProperty"],
    label: ["AgentflowLabel"],
  },
  AgentflowShapeProperty: {
    name: ["Identifier"],
    value: ["Identifier"],
  },
  AgentflowLink: {
    id: ["Identifier"],
    opening: ["AgentflowOpeningArrow"],
    arrow: ["AgentflowArrow"],
    label: ["AgentflowLabel"],
    target: ["AgentflowVertexGroup"],
  },
  AgentflowStyleStatement: {
    id: ["Identifier"],
    styles: ["AgentflowLiteral"],
  },
  AgentflowClassDefStatement: {
    cssClasses: ["Identifier"],
    styles: ["AgentflowLiteral"],
  },
  AgentflowClassStatement: {
    ids: ["Identifier"],
    cssClass: ["Identifier"],
  },
  AgentflowLinkStyleStatement: {
    indices: ["NumericLiteral"],
    interpolate: ["Identifier"],
    styles: ["AgentflowLiteral"],
  },
  AgentflowDefaultLinkStyleStatement: {
    interpolate: ["Identifier"],
    styles: ["AgentflowLiteral"],
  },
  AgentflowClickCallbackStatement: {
    ids: ["Identifier"],
    callback: ["Identifier", "AgentflowLiteral"],
    arguments: ["AgentflowLiteral"],
    textBeforeTooltip: ["AgentflowIgnoredText"],
    tooltip: ["StringLiteral"],
  },
  AgentflowClickUrlStatement: {
    ids: ["Identifier"],
    textBeforeUrl: ["AgentflowIgnoredText"],
    url: ["StringLiteral"],
    textBeforeTooltip: ["AgentflowIgnoredText"],
    tooltip: ["StringLiteral"],
  },
  AgentflowDirectionStatement: {
    textBefore: ["AgentflowIgnoredText"],
    textAfter: ["AgentflowIgnoredText"],
  },
  AgentflowAccTitleStatement: {
    value: ["AgentflowLiteral"],
  },
  AgentflowAccDescrStatement: {
    value: ["AgentflowLiteral"],
  },
  AgentflowAccDescrBlockStatement: {
    value: ["AgentflowLiteral"],
  },
}

/** ast/agentflow.md: the lists that always have at least one written slot. */
export const AGENTFLOW_NONEMPTY_LISTS: Readonly<
  Record<string, readonly string[]>
> = {
  AgentflowName: ["parts"],
  AgentflowVertexGroup: ["vertices"],
  AgentflowStyleStatement: ["styles"],
  AgentflowClassDefStatement: ["cssClasses", "styles"],
  AgentflowClassStatement: ["ids"],
  AgentflowLinkStyleStatement: ["indices"],
  AgentflowClickCallbackStatement: ["ids"],
  AgentflowClickUrlStatement: ["ids"],
}

/** ast/agentflow.md: the finite vocabularies of scalar fields. */
export const AGENTFLOW_FIELD_WORDS: FieldTable<readonly string[]> = {
  AgentflowLabel: { kind: ["text", "string", "markdown"] },
  AgentflowIgnoredText: {
    kind: [
      "click",
      "empty-string",
      "empty-markdown-string",
      "empty-call",
      "empty-description-block",
      "direction-text",
    ],
  },
  AgentflowArrow: {
    startMarker: ["none"],
    line: ["solid", "dotted"],
    endMarker: ["arrow", "cross", "none"],
  },
  AgentflowOpeningArrow: { startMarker: ["none"], line: ["solid"] },
  AgentflowDirectionStatement: { direction: ["TB", "BT", "RL", "LR", "TD"] },
}

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

/** The shared nested string contexts, with Agentflow's own comment and brace conversion. */
export function agentflowStringDelimitersOf(
  text: string,
  root: CheckedRoot,
): StringDelimitersOf {
  const strings = new StringDelimiters(
    root,
    readAgentflowCharacters(text, root),
  )
  return (node, problems) => {
    try {
      return strings.around(node.range)
    } catch (error) {
      problems.report(
        label(node),
        `its string cannot be read: ${error instanceof Error ? error.message : String(error)}`,
      )
      return []
    }
  }
}

/** A grammar gap is judged after the diagram's conversions and retained source cuts. */
function gap(reading: Reading, left: CheckedNode, right: CheckedNode): string {
  return reading.converted.of([left.range[1], right.range[0]])
}

/** A space unit is one whitespace character other than LF, after CR normalization. */
function oneSpace(text: string): boolean {
  return text.length === 1 && text !== "\n" && isWhitespace(text.charCodeAt(0))
}

/** A recorded lexical comment can supply a header or statement separator. */
function commentBetween(reading: Reading, from: number, to: number): boolean {
  return reading.root.comments.some(
    (comment) => from <= comment.range[0] && comment.range[1] <= to,
  )
}

/** Statement separators are newline, semicolon, EOF or an Agentflow comment. */
function hasSeparator(reading: Reading, from: number, to: number): boolean {
  const text = reading.converted.of([from, to])
  return (
    text.includes("\n") ||
    text.includes(";") ||
    to > reading.text.length ||
    commentBetween(reading, from, to)
  )
}

/** Agentflow's own arrows, used before the shared id-run rule. */
function arrowAt(text: string, from: number): boolean {
  if (text.startsWith("--", from)) return true
  if (text[from] !== "-") return false
  let at = from + 1
  while (text[at] === ".") at++
  return at > from + 1 && text[at] === "-"
}

const VOCABULARY = {
  headers: ["agentflow-beta"],
  containers: ["flow", "connector", "global"],
  arrowAt,
}

/** The next line supplies lookahead even when it lies outside the leaf's range. */
function validLeaf(
  reading: Reading,
  node: CheckedNode,
  position: GraphLeafPosition,
  from = node.range[0],
): void {
  const value = reading.converted.of([from, node.range[1]])
  // Include lookahead after a line break consumed by call/href/click or
  // accessibility whitespace, without rescanning the rest of a large body.
  let lookahead = node.range[1]
  while (isWhitespace(reading.text.charCodeAt(lookahead))) lookahead++
  const end = reading.text.indexOf("\n", lookahead)
  const following = reading.converted.of([
    node.range[1],
    end === -1 ? reading.text.length : end + 1,
  ])
  reading.problems.expect(
    graphLeafIsValid(value + following, value.length, position, VOCABULARY),
    label(node),
    `the value has no lexical unit in its ${position} position`,
  )
}

/** Name and click-prefix fields retain one of the five recognized erased forms. */
function checkErasedKind(reading: Reading, node: CheckedNode): void {
  const value = textOf(node)
  let matches: boolean
  switch (node.kind) {
    case "click":
      matches = value === "click"
      break
    case "empty-string":
      matches = value === '""'
      break
    case "empty-markdown-string":
      matches = value === '"``"'
      break
    case "empty-call":
      matches = value.startsWith("call") && erasedGraphForm(value)
      break
    case "empty-description-block":
      matches = value.startsWith("accDescr") && erasedGraphForm(value)
      break
    default:
      matches = false
      break
  }
  reading.problems.expect(
    matches,
    label(node),
    "the ignored-text kind must match its recognized erased form",
  )
}

/** A name retains erased forms while tracking entry to and exit from click context. */
function checkName(
  reading: Reading,
  node: CheckedNode,
  delimiters: StringDelimitersOf,
  isConnector: boolean,
): boolean {
  const parts = entriesOf(node, "parts").filter((part) => part !== null)
  reading.problems.expect(
    parts.some((part) => part.type === "AgentflowLabel"),
    label(node),
    "parts has no contributing Label",
  )
  let initial = true
  let click = false
  let needsClickUnit = false
  for (const [index, part] of parts.entries()) {
    const previous = parts[index - 1]
    if (previous !== undefined) {
      const between = gap(reading, previous, part)
      if (previous.type === "AgentflowIgnoredText" && previous.kind === "click")
        reading.problems.expect(
          between !== "" && isBlank(between),
          label(part),
          "a name click consumes its following whitespace",
        )
      else if (click && between !== "") {
        reading.problems.expect(
          between.length === 1 && isWhitespace(between.charCodeAt(0)),
          label(part),
          "a click exit consumes one whitespace unit before a retained form or fragment",
        )
        click = false
      } else {
        reading.problems.expect(
          between === "",
          label(part),
          "ordinary name whitespace must belong to a Label part",
        )
        reading.problems.expect(
          part.type !== "AgentflowLabel" || previous.type !== "AgentflowLabel",
          label(part),
          "ordinary name fragments must be maximal; a click exit consumes one whitespace unit",
        )
        if (click && part.type === "AgentflowLabel" && part.kind === "text")
          reading.problems.expect(
            previous.type !== "AgentflowIgnoredText" ||
              previous.kind === "click" ||
              (isConnector &&
                (previous.kind === "empty-string" ||
                  previous.kind === "empty-markdown-string")),
            label(part),
            "bare name text after an empty string requires the click-context exit",
          )
      }
    }
    if (part.type === "AgentflowIgnoredText") {
      checkErasedKind(reading, part)
      if (part.kind === "click") {
        click = true
        needsClickUnit = true
      } else if (click) {
        reading.problems.expect(
          part.kind === "empty-string" || part.kind === "empty-markdown-string",
          label(part),
          "only an empty string is an erased form in click context",
        )
        needsClickUnit = false
      }
      continue
    }
    reading.problems.expect(
      initial || part.kind === "text",
      label(part),
      "a later name fragment must have kind text",
    )
    const stringEnd = delimiters(part, reading.problems)[1]?.[1]
    const bareStart = stringEnd ?? part.range[0]
    if (bareStart < part.range[1]) {
      if (click) {
        const bare = reading.converted.of([bareStart, part.range[1]])
        reading.problems.expect(
          !bare.startsWith('"') &&
            ![...bare].some((c) => isWhitespace(c.charCodeAt(0))),
          label(part),
          "a click name continuation must be a nonwhitespace run, not another string",
        )
      } else validLeaf(reading, part, "container-name", bareStart)
    }
    initial = false
    needsClickUnit = false
  }
  reading.problems.expect(
    !needsClickUnit,
    label(node),
    "an erased click has no recognized unit after it",
  )
  return click
}

/** Delimiters, properties and full shape names use the shared bracket-shape table. */
function checkShape(reading: Reading, node: CheckedNode): void {
  const property = childOf(node, "property")
  const content = childOf(node, "label")
  if (content === null) return
  const own = ownOf(reading.root, node)
  const opening = own.tokens[0]?.value ?? ""
  const closing = own.tokens.at(-1)?.value ?? ""
  const row = GRAPH_SHAPES.find(
    (candidate) =>
      candidate.opening === opening && candidate.closings.includes(closing),
  )
  reading.problems.expectEqual(
    node.name,
    row?.name,
    label(node),
    "the shape name does not match its delimiters",
  )
  reading.problems.expectEqual(
    property !== null,
    opening === "[|",
    label(node),
    "property is present exactly with [|",
  )
  checkLayout(
    reading,
    node,
    own,
    property === null
      ? [opening, CHILD, closing]
      : [opening, CHILD, "|", CHILD, closing],
  )
}

/** Arrow fields denote exactly one whole operator of the three Agentflow families. */
function checkArrow(reading: Reading, node: CheckedNode): void {
  const value = textOf(node)
  const opening = node.type === "AgentflowOpeningArrow"
  const solid =
    value.length >= 3 &&
    [">", "x"].includes(value.at(-1) ?? "") &&
    [...value.slice(0, -1)].every((c) => c === "-")
  const reference =
    value.length >= 3 &&
    value.startsWith("-") &&
    value.endsWith("-") &&
    [...value.slice(1, -1)].every((c) => c === ".")
  reading.problems.expect(
    opening ? value === "--" : solid || reference,
    label(node),
    "the arrow is no Agentflow operator",
  )
  reading.problems.expectEqual(
    nodeTokensIn(reading.root, node.range).map((token) => [
      token.type,
      token.range,
    ]),
    [["Punctuator", node.range]],
    label(node),
    "the tokens of the arrow",
  )
  reading.problems.expectEqual(
    node.startMarker,
    "none",
    label(node),
    "startMarker must be none",
  )
  reading.problems.expectEqual(
    node.line,
    reference ? "dotted" : "solid",
    label(node),
    "the arrow line",
  )
  if (!opening) {
    reading.problems.expectEqual(
      node.endMarker,
      reference ? "none" : value.endsWith("x") ? "cross" : "arrow",
      label(node),
      "the arrow endMarker",
    )
    reading.problems.expectEqual(
      node.length,
      reference ? value.length - 2 : value.length - 1,
      label(node),
      "the written arrow length, before the Db cap",
    )
  }
}

/** Source-order hulls and the units outside children define each structural production. */
function checkStructure(
  reading: Reading,
  node: CheckedNode,
  delimiters: StringDelimitersOf,
): void {
  const own = ownOf(reading.root, node)
  const children = childNodesOf(node)

  /** The layout of this production, with its children kept in source order. */
  function simple(expected: readonly string[]): void {
    checkLayout(reading, node, own, expected)
  }

  switch (node.type) {
    case "AgentflowEmptyStatement":
      simple([";"])
      break
    case "AgentflowVertexStatement":
      simple(children.map(() => CHILD))
      break
    case "AgentflowVertexGroup": {
      simple(
        children.flatMap((_, index) => (index === 0 ? [CHILD] : ["&", CHILD])),
      )
      for (const token of own.tokens) {
        const before = reading.written.of([node.range[0], token.range[0]])
        const after = reading.written.of([token.range[1], node.range[1]])
        reading.problems.expect(
          isWhitespace(before.charCodeAt(before.length - 1)) &&
            isWhitespace(after.charCodeAt(0)),
          label(node),
          "a group & needs whitespace on both sides",
        )
      }
      break
    }
    case "AgentflowVertex": {
      const id = childOf(node, "id")
      const shape = childOf(node, "shape")
      const css = childOf(node, "cssClass")
      simple([
        CHILD,
        ...(shape === null ? [] : [CHILD]),
        ...(css === null ? [] : ["::: ".trim(), CHILD]),
        ...entriesOf(node, "data").map(() => CHILD),
      ])
      let previous = id
      for (const child of [shape, css, ...entriesOf(node, "data")]) {
        if (child === null) continue
        if (previous !== null) {
          const value = gap(reading, previous, child)
          reading.problems.expect(
            value === (child === css ? ":::" : ""),
            label(child),
            "vertex suffixes must be adjacent, with only their delimiter between",
          )
        }
        previous = child
      }
      break
    }
    case "AgentflowShapeProperty": {
      simple([CHILD, ":", CHILD])
      const name = childOf(node, "name")
      const value = childOf(node, "value")
      if (name !== null && value !== null)
        reading.problems.expect(
          gap(reading, name, value) === ":",
          label(node),
          "property operands must touch their colon",
        )
      break
    }
    case "AgentflowLink": {
      const id = childOf(node, "id")
      const opening = childOf(node, "opening")
      const arrow = childOf(node, "arrow")
      const content = childOf(node, "label")
      const prefix = id === null ? [] : [CHILD, "@"]
      simple([
        ...prefix,
        ...(opening !== null
          ? [CHILD, CHILD, CHILD]
          : content === null
            ? [CHILD]
            : [CHILD, "|", CHILD, "|"]),
        CHILD,
      ])
      reading.problems.expect(
        opening === null || (content !== null && arrow?.line === "solid"),
        label(node),
        "a split link requires a label and solid closing arrow",
      )
      if (opening === null && content !== null) {
        const pipe = own.tokens.filter((token) => token.value === "|").at(-1)
        const target = childOf(node, "target")
        if (pipe !== undefined && target !== null) {
          const after = reading.converted.of([pipe.range[1], target.range[0]])
          reading.problems.expect(
            after === "" || oneSpace(after),
            label(node),
            "a pipe label permits at most one following space unit",
          )
        }
      }
      break
    }
    case "AgentflowFlowStatement":
    case "AgentflowGlobalStatement":
    case "AgentflowConnectorStatement": {
      const isFlow = node.type === "AgentflowFlowStatement"
      const isGlobal = node.type === "AgentflowGlobalStatement"
      const name = childOf(node, "name")
      const title = childOf(node, "title")
      const data = entriesOf(node, "data")
      const clickExit =
        name !== null &&
        checkName(
          reading,
          name,
          delimiters,
          node.type === "AgentflowConnectorStatement",
        )

      /** A final click unit, including an erased string, leaves its exit outside Name. */
      function afterNameExit(text: string): string {
        if (!clickExit) return text
        reading.problems.expect(
          isWhitespace(text.charCodeAt(0)),
          label(node),
          "a final name click context requires its one-whitespace exit",
        )
        return text.slice(1)
      }

      const expected = [
        isGlobal ? "global" : isFlow ? "flow" : "connector",
        ...(name === null ? [] : [CHILD]),
        ...(title === null ? [] : ["[", CHILD, "]"]),
        ...data.map(() => CHILD),
      ]
      const titleEnd =
        title === null
          ? undefined
          : own.tokens.find(
              (token) =>
                token.value === "]" && token.range[0] >= title.range[1],
            )?.range[1]
      let previousEnd =
        data.at(-1)?.range[1] ??
        titleEnd ??
        name?.range[1] ??
        own.tokens[0]?.range[1] ??
        node.range[0]
      for (const statement of entriesOf(node, "body"))
        if (statement !== null) {
          const segmentStart = previousEnd
          expected.push(
            ...own.tokens
              .filter(
                (token) =>
                  token.value === ";" &&
                  segmentStart <= token.range[0] &&
                  token.range[1] <= statement.range[0],
              )
              .map(() => ";"),
            CHILD,
          )
          previousEnd = statement.range[1]
        }
      if (isFlow || isGlobal)
        expected.push(
          ...own.tokens
            .filter(
              (token) => token.value === ";" && previousEnd <= token.range[0],
            )
            .map(() => ";"),
          "end",
        )
      simple(expected)
      if (name === null)
        reading.problems.expect(
          title === null && data.length === 0,
          label(node),
          "an unnamed flow has no title or heading data",
        )
      else {
        const first = own.tokens[0]
        if (first !== undefined)
          reading.problems.expect(
            oneSpace(reading.converted.of([first.range[1], name.range[0]])),
            label(node),
            "a flow or connector requires one space before its name",
          )
        if (title !== null) {
          const beforeTitle = afterNameExit(gap(reading, name, title))
          reading.problems.expect(
            beforeTitle === "[" ||
              (title.kind === "text" &&
                beforeTitle.startsWith("[") &&
                isBlank(beforeTitle.slice(1))),
            label(title),
            "the bracket title must follow the name and its opener",
          )
        }
        let previous = title ?? name
        for (const block of data)
          if (block !== null) {
            const before = gap(reading, previous, block)
            reading.problems.expect(
              (previous === name ? afterNameExit(before) : before) ===
                (previous === title ? "]" : ""),
              label(block),
              "heading data must touch the preceding heading unit",
            )
            previous = block
          }
      }
      if (isFlow || isGlobal) {
        const body = entriesOf(node, "body").filter(
          (statement) => statement !== null,
        )
        const first = body[0]
        const from =
          data.at(-1)?.range[1] ??
          titleEnd ??
          name?.range[1] ??
          own.tokens[0]?.range[1] ??
          node.range[0]
        const end = own.tokens.at(-1)?.range[0] ?? node.range[1]
        const initialBlocks = []
        for (const statement of body) {
          if (
            statement.type !== "AgentflowAccDescrBlockStatement" ||
            statement.value !== null ||
            statement.closed !== true
          )
            break
          initialBlocks.push(statement)
        }
        if (
          !isGlobal &&
          title === null &&
          data.length === 0 &&
          first?.type === "AgentflowAccDescrBlockStatement"
        )
          reading.problems.expect(
            hasSeparator(reading, from, first.range[0]),
            label(first),
            "an empty block before the name separator belongs to Name.parts",
          )
        const next = body[initialBlocks.length]
        const to = next?.range[0] ?? end
        const headingGap = reading.converted.of(
          [from, to],
          initialBlocks.map((block) => block.range),
        )
        const nameEndsHeading =
          name !== null && title === null && data.length === 0
        const afterHeading = nameEndsHeading
          ? afterNameExit(headingGap)
          : headingGap
        const immediateSeparator = isGlobal
          ? ["\n", ";"].includes(
              afterHeading.charAt(horizontalPadding(afterHeading)),
            )
          : afterHeading.startsWith("\n") || afterHeading.startsWith(";")
        const comment = reading.root.comments.find(
          (candidate) => from <= candidate.range[0] && candidate.range[1] <= to,
        )
        const beforeComment =
          comment === undefined
            ? ""
            : reading.converted.of([from, comment.range[0]])
        const commentGap =
          nameEndsHeading && clickExit ? beforeComment.slice(1) : beforeComment
        const commentSeparator =
          comment !== undefined &&
          horizontalPadding(commentGap) === commentGap.length
        reading.problems.expect(
          immediateSeparator || commentSeparator,
          label(node),
          "heading padding before its separator is not accepted here",
        )
        reading.problems.expect(
          afterHeading.includes("\n") ||
            afterHeading.includes(";") ||
            commentBetween(reading, from, to),
          label(node),
          "a flow/global heading requires its statement separator",
        )
      }
      break
    }
    case "AgentflowAccTitleStatement":
    case "AgentflowAccDescrStatement": {
      const keyword =
        node.type === "AgentflowAccTitleStatement" ? "accTitle" : "accDescr"
      simple([
        keyword.toLowerCase(),
        ":",
        ...(childOf(node, "value") === null ? [] : [CHILD]),
      ])
      checkAccessibilityLine(reading, node, own)
      const value = childOf(node, "value")
      if (value !== null)
        reading.problems.expect(
          !reading.converted.of(value.range).includes("\n"),
          label(value),
          "an accessibility line value crosses a line break",
        )
      if (value !== null)
        reading.problems.expect(
          trimmed(textOf(value)) === textOf(value),
          label(value),
          "an accessibility line value must exclude its outside padding",
        )
      else
        reading.problems.expect(
          isBlank(reading.converted.of([node.range[1], reading.text.length])),
          label(node),
          "an absent accessibility line value requires EOF after whitespace",
        )
      break
    }
    case "AgentflowAccDescrBlockStatement": {
      simple([
        "accdescr",
        "{",
        ...(childOf(node, "value") === null ? [] : [CHILD]),
        ...(node.closed === true ? ["}"] : []),
      ])
      reading.problems.expectEqual(
        node.closed,
        own.tokens.at(-1)?.value === "}",
        label(node),
        "closed is not whether the last token is }",
      )
      checkAccessibilityBlock(reading, node, own)
      if (node.closed !== true)
        reading.problems.expect(
          node.range[1] === reading.text.length,
          label(node),
          "an unclosed description must run to EOF",
        )
      break
    }
    default:
      break
  }
}

/** The literal/empty slots and their commas, retaining null entries in the layout. */
function slotsOf(entries: readonly (CheckedNode | null)[]): string[] {
  return entries.flatMap((entry, index) => [
    ...(index === 0 ? [] : [","]),
    ...(entry === null ? [] : [CHILD]),
  ])
}

/** An id list has one slot between each pair of adjacent commas; no padding is part of it. */
function checkIdSlots(
  reading: Reading,
  node: CheckedNode,
  entries: readonly (CheckedNode | null)[],
  from: number,
  to: number,
): void {
  const commas = ownOf(reading.root, node).tokens.filter(
    (token) =>
      token.value === "," && token.range[0] >= from && token.range[1] <= to,
  )
  reading.problems.expectEqual(
    entries.length,
    commas.length + 1,
    label(node),
    "the number of id-list slots",
  )
  for (const [index, entry] of entries.entries()) {
    const low = index === 0 ? from : commas[index - 1]?.range[1]
    const high = index === commas.length ? to : commas[index]?.range[0]
    if (low === undefined || high === undefined) continue
    if (entry === null)
      reading.problems.expect(
        reading.converted.of([low, high]) === "",
        label(node),
        "a null id-list slot is not empty",
      )
    else
      reading.problems.expect(
        reading.converted.of([low, entry.range[0]]) === "" &&
          reading.converted.of([entry.range[1], high]) === "",
        label(entry),
        "an id-list item must fill its slot",
      )
  }
}

/** Style/id slots retain null holes, comma ownership, and the exact one-space grammar gaps. */
function checkStylesAndLists(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const keyword = own.tokens[0]
  if (keyword === undefined) return
  const styles = entriesOf(node, "styles")
  const isClass = node.type === "AgentflowClassStatement"
  const isDef = node.type === "AgentflowClassDefStatement"
  const isStyle = node.type === "AgentflowStyleStatement"
  const isDefault = node.type === "AgentflowDefaultLinkStyleStatement"
  const ids = isStyle
    ? [childOf(node, "id")]
    : entriesOf(node, isClass ? "ids" : isDef ? "cssClasses" : "indices")
  if (!isDefault)
    reading.problems.expect(
      ids.some((id) => id !== null) || ids.length > 1,
      label(node),
      "an id list needs a written id or comma, not a single unwritten null slot",
    )
  const interpolation = childOf(node, "interpolate")
  const cssClass = childOf(node, "cssClass")
  const indexCommas = Math.max(0, ids.length - 1)
  const commas = own.tokens.filter((token) => token.value === ",")
  const idEnd = isDefault
    ? own.tokens.find((token) => token.value === "default")?.range[1]
    : (ids.at(-1)?.range[1] ?? commas[indexCommas - 1]?.range[1])
  const idStart =
    ids[0]?.range[0] ?? (indexCommas > 0 ? commas[0]?.range[0] : undefined)
  const defaultToken = own.tokens.find((token) => token.value === "default")
  const firstStart = isDefault ? defaultToken?.range[0] : idStart
  if (firstStart !== undefined)
    reading.problems.expect(
      oneSpace(reading.converted.of([keyword.range[1], firstStart])),
      label(node),
      "the keyword requires exactly one space unit before its first operand",
    )
  if (idStart !== undefined && idEnd !== undefined && !isDefault)
    checkIdSlots(reading, node, ids, idStart, idEnd)
  const expected = [
    keyword.value.toLowerCase(),
    ...(isDefault ? ["default"] : slotsOf(ids)),
  ]
  if (isClass) expected.push(CHILD)
  else
    expected.push(
      ...(interpolation === null ? [] : ["interpolate", CHILD]),
      ...slotsOf(styles),
    )
  checkLayout(reading, node, own, expected)
  if (isClass) {
    if (idEnd !== undefined && cssClass !== null)
      reading.problems.expect(
        oneSpace(reading.converted.of([idEnd, cssClass.range[0]])),
        label(node),
        "class requires exactly one space before its class value",
      )
    return
  }
  const interpolateToken = own.tokens.find(
    (token) => token.value === "interpolate",
  )
  if (interpolation !== null && interpolateToken !== undefined) {
    if (idEnd !== undefined)
      reading.problems.expect(
        oneSpace(reading.converted.of([idEnd, interpolateToken.range[0]])),
        label(node),
        "linkStyle requires exactly one space before interpolate",
      )
    reading.problems.expect(
      oneSpace(
        reading.converted.of([
          interpolateToken.range[1],
          interpolation.range[0],
        ]),
      ),
      label(interpolation),
      "interpolate requires exactly one space before its name",
    )
  }
  const styleCommas = commas.slice(indexCommas)
  const beforeStyle = interpolation?.range[1] ?? idEnd
  for (const [index, style] of styles.entries()) {
    const previous =
      index === 0 ? beforeStyle : styleCommas[index - 1]?.range[1]
    const next = styleCommas[index]?.range[0] ?? node.range[1]
    if (previous === undefined) continue
    if (style === null) {
      reading.problems.expect(
        isBlank(reading.converted.of([previous, next])),
        label(node),
        "a null style contains non-whitespace text",
      )
      const blocks = nodesOf(reading.root)
        .filter(
          (candidate) =>
            candidate.type === "AgentflowAccDescrBlockStatement" &&
            candidate.closed === true &&
            candidate.value === null,
        )
        .map((candidate) => candidate.range)
      const after = reading.converted.of(
        [previous, styleCommas[index]?.range[0] ?? reading.text.length + 1],
        [...blocks, ...commentPadding(reading)],
      )
      let units = 0
      for (const character of after) {
        if (character === "\n" || !isWhitespace(character.codePointAt(0) ?? -1))
          break
        units++
      }
      reading.problems.expect(
        units >= (index === 0 ? 2 : 1),
        label(node),
        "a null style needs a written whitespace style unit beyond its required gap",
      )
    } else {
      const value = textOf(style)
      reading.problems.expect(
        value !== "" && !isWhitespace(value.charCodeAt(value.length - 1)),
        label(style),
        "a style must not end with whitespace",
      )
      checkTokenKinds(reading, style, ["RawText"], "a style")
      const before = reading.converted.of([previous, style.range[0]])
      reading.problems.expect(
        index === 0 ? oneSpace(before) : before === "",
        label(style),
        "a style starts after its required one-space gap or immediately after its comma",
      )
      reading.problems.expect(
        isBlank(reading.converted.of([style.range[1], next])),
        label(style),
        "only trailing style padding may follow its value",
      )
    }
  }
  if (!isStyle && !isDef)
    reading.problems.expect(
      interpolation !== null || styles.length > 0,
      label(node),
      "linkStyle has neither interpolation nor styles",
    )
}

/** The erased prefixes belong only to their declared URL/tooltip field and require that value. */
function checkClick(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const url = childOf(node, "url")
  const tooltip = childOf(node, "tooltip")
  const callback = childOf(node, "callback")
  const args = childOf(node, "arguments")
  const ids = entriesOf(node, "ids")
  reading.problems.expect(
    ids.some((id) => id !== null) || ids.length > 1,
    label(node),
    "an id list needs a written id or comma, not a single unwritten null slot",
  )
  const keywords = own.tokens
    .filter((token) => token.type === "Keyword")
    .map((token) => token.value)
  reading.problems.expect(
    keywords[0] === "click" &&
      keywords.filter((word) => word === "click").length === 1 &&
      keywords.every((word) =>
        [
          "click",
          "call",
          "href",
          "_self",
          "_blank",
          "_parent",
          "_top",
        ].includes(word),
      ),
    label(node),
    "the click keywords outside retained prefix fields",
  )
  const commas = own.tokens.filter((token) => token.value === ",")
  const firstId = ids[0]?.range[0] ?? commas[0]?.range[0]
  const lastId = ids.at(-1)?.range[1] ?? commas.at(-1)?.range[1]
  const click = own.tokens[0]
  if (firstId !== undefined && lastId !== undefined && click !== undefined) {
    checkIdSlots(reading, node, ids, firstId, lastId)
    const before = reading.converted.of([click.range[1], firstId])
    reading.problems.expect(
      before !== "" && isBlank(before),
      label(node),
      "click requires whitespace before its id list",
    )
    const next = [
      ...own.tokens.filter((token) => token.range[0] >= lastId),
      ...childNodesOf(node).filter((child) => child.range[0] >= lastId),
    ].sort((a, b) => a.range[0] - b.range[0])[0]
    if (next !== undefined) {
      const after = reading.converted.of([lastId, next.range[0]])
      reading.problems.expect(
        after.length === 1 && isWhitespace(after.charCodeAt(0)),
        label(node),
        "the click-id context consumes exactly one exit whitespace unit",
      )
    }
  }
  for (const field of ["textBeforeUrl", "textBeforeTooltip"]) {
    const parts = entriesOf(node, field)
    const following = field === "textBeforeUrl" ? url : tooltip
    reading.problems.expect(
      following !== null || parts.length === 0,
      label(node),
      `${field} requires its following value`,
    )
    const lower =
      field === "textBeforeUrl"
        ? lastId
        : (url?.range[1] ??
          own.tokens.findLast((token) => token.value === ")")?.range[1] ??
          callback?.range[1])
    for (const part of parts)
      if (part !== null) {
        checkErasedKind(reading, part)
        reading.problems.expect(
          lower !== undefined &&
            part.range[0] >= lower &&
            following !== null &&
            part.range[1] <= following.range[0],
          label(part),
          `${field} must lie between its preceding operand and following value`,
        )
        if (part.kind === "click" && following !== null) {
          const next = [
            ...parts.filter(
              (candidate): candidate is CheckedNode =>
                candidate !== null && candidate.range[0] > part.range[0],
            ),
            ...own.tokens.filter((token) => token.range[0] >= part.range[1]),
            following,
          ].sort((a, b) => a.range[0] - b.range[0])[0]
          if (next !== undefined) {
            const after = reading.converted.of([part.range[1], next.range[0]])
            reading.problems.expect(
              after !== "" && isBlank(after),
              label(part),
              "a retained click marker requires its consumed following whitespace",
            )
          }
        }
      }
  }
  for (const value of [url, tooltip])
    if (value !== null)
      reading.problems.expect(
        value.type === "StringLiteral" &&
          value.closed === true &&
          textOf(value) !== "",
        label(value),
        "a URL or tooltip must be a closed nonempty string",
      )
  const expected = ["click", ...slotsOf(ids)]
  if (url !== null) {
    const hrefs = own.tokens.filter((token) => token.value === "href")
    reading.problems.expect(
      hrefs.length <= 1 &&
        hrefs.every(
          (token) =>
            token.range[0] >= (lastId ?? Infinity) &&
            token.range[1] <= url.range[0],
        ),
      label(node),
      "href occurs at most once, before the URL",
    )
    const beforeUrl = [
      ...entriesOf(node, "textBeforeUrl")
        .filter((part) => part !== null)
        .map((part) => ({ range: part.range, text: CHILD })),
      ...hrefs.map((token) => ({ range: token.range, text: "href" })),
    ].sort((a, b) => a.range[0] - b.range[0])
    expected.push(...beforeUrl.map((part) => part.text), CHILD)
    const href = hrefs[0]
    if (href !== undefined) {
      const next =
        beforeUrl.find((part) => part.range[0] > href.range[0])?.range[0] ??
        url.range[0]
      const after = reading.converted.of([href.range[1], next])
      reading.problems.expect(
        after.length === 1 && isWhitespace(after.charCodeAt(0)),
        label(node),
        "href consumes exactly one following whitespace unit",
      )
    }
    const last = own.tokens.at(-1)
    const target =
      last?.type === "Keyword" &&
      ["_self", "_blank", "_parent", "_top"].includes(last.value)
        ? last
        : undefined
    reading.problems.expectEqual(
      node.target,
      target?.value ?? null,
      label(node),
      "the target, which is the last token",
    )
    if (target !== undefined)
      reading.problems.expect(
        oneSpace(
          reading.converted.of([(tooltip ?? url).range[1], target.range[0]]),
        ),
        label(node),
        "a link target requires exactly one preceding space unit",
      )
  }
  if (callback !== null) {
    const calls = own.tokens.filter((token) => token.value === "call")
    reading.problems.expect(
      callback.type ===
        (calls.length === 0 ? "Identifier" : "AgentflowLiteral"),
      label(callback),
      "the callback kind must follow its bare or call spelling",
    )
    reading.problems.expect(
      args === null || calls.length > 0,
      label(node),
      "arguments require call parentheses",
    )
    if (args !== null)
      reading.problems.expect(
        !isBlank(textOf(args)),
        label(args),
        "whitespace-only callback arguments must be null",
      )
    if (calls.length === 0) expected.push(CHILD)
    else {
      reading.problems.expect(
        calls.length <= 2,
        label(node),
        "a callback has at most two call units",
      )
      expected.push("call", CHILD, "(")
      if (calls.length === 2) {
        reading.problems.expect(
          args !== null,
          label(node),
          "a second call must supply nonempty arguments",
        )
        expected.push(")", "call", "(")
      }
      expected.push(...(args === null ? [] : [CHILD]), ")")
      const call = calls[0]
      if (call !== undefined) {
        const before = reading.converted.of([call.range[1], callback.range[0]])
        reading.problems.expect(
          before !== "" && isBlank(before),
          label(callback),
          "call requires whitespace before its opaque name",
        )
      }
      const open = own.tokens.find((token) => token.value === "(")
      if (open !== undefined)
        reading.problems.expect(
          reading.converted.of([callback.range[1], open.range[0]]) === "",
          label(callback),
          "the callback name includes all padding before (",
        )
    }
  }
  expected.push(
    ...entriesOf(node, "textBeforeTooltip").map(() => CHILD),
    ...(tooltip === null ? [] : [CHILD]),
  )
  if (url !== null && node.target !== null) expected.push(String(node.target))
  checkLayout(reading, node, own, expected)
  if (tooltip !== null) {
    const previousEnd =
      url?.range[1] ??
      own.tokens.findLast((token) => token.value === ")")?.range[1] ??
      callback?.range[1]
    const prefix = entriesOf(node, "textBeforeTooltip")[0]
    if (previousEnd !== undefined)
      reading.problems.expect(
        oneSpace(
          reading.converted.of([
            previousEnd,
            prefix?.range[0] ?? tooltip.range[0],
          ]),
        ),
        label(node),
        "a tooltip requires exactly one preceding space unit",
      )
  }
}

/** Whole header, direction, label-kind and atomic token checks. */
function checkDiagramAndValues(
  reading: Reading,
  delimiters: StringDelimitersOf,
): void {
  const diagram = reading.root.body
  const own = ownOf(reading.root, diagram)
  const header = own.tokens[0]
  reading.problems.expect(
    header?.type === "Keyword" && header.value === "agentflow-beta",
    label(diagram),
    "the diagram must write one complete agentflow-beta header",
  )
  const second = own.tokens[1]
  const direction =
    second?.type === "Keyword" && HEADER_DIRECTIONS.includes(second.value)
      ? second
      : undefined
  const spellings = [
    "agentflow-beta",
    "flow",
    "connector",
    "global",
    "end",
    "style",
    "classDef",
    "class",
    "linkStyle",
    "interpolate",
    "default",
    "click",
    "call",
    "href",
    "direction",
    "accTitle",
    "accDescr",
    "_self",
    "_blank",
    "_parent",
    "_top",
    ...HEADER_DIRECTIONS,
  ]
  for (const token of reading.root.tokens)
    if (token.type === "Keyword")
      reading.problems.expect(
        spellings.includes(token.value),
        label(token),
        "Agentflow keywords use their exact case-sensitive spelling",
      )
  reading.problems.expectEqual(
    diagram.direction,
    direction?.value ?? null,
    label(diagram),
    "the direction of the header",
  )
  reading.problems.expect(
    own.tokens.every(
      (token, index) =>
        index === 0 || token === direction || token.value === ";",
    ),
    label(diagram),
    "the diagram writes only its header, direction and separator semicolons",
  )
  if (header !== undefined && direction !== undefined)
    reading.problems.expect(
      !reading.converted
        .of([header.range[1], direction.range[0]])
        .includes("\n"),
      label(diagram),
      "a header direction must be on the header line",
    )
  if (header !== undefined) {
    const initialBlocks = []
    const body = entriesOf(diagram, "body").filter(
      (statement) => statement !== null,
    )
    if (direction !== undefined)
      for (const statement of body) {
        if (
          statement.type !== "AgentflowAccDescrBlockStatement" ||
          statement.value !== null ||
          statement.closed !== true
        )
          break
        initialBlocks.push(statement)
      }
    const from = direction?.range[1] ?? header.range[1]
    const next = Math.min(
      body[initialBlocks.length]?.range[0] ?? reading.text.length + 1,
      own.tokens.find((token) => token.value === ";" && token.range[0] >= from)
        ?.range[0] ?? reading.text.length + 1,
    )
    const after = reading.converted.of(
      [from, next],
      initialBlocks.map((block) => block.range),
    )
    const semicolon = reading.text.charAt(next) === ";"
    reading.problems.expect(
      after.includes("\n") ||
        commentBetween(reading, from, next) ||
        (direction !== undefined && semicolon && after === ""),
      label(diagram),
      "the header requires its newline/comment or immediate directional semicolon separator",
    )
    reading.problems.expect(
      !isWordCharacter(reading.text.charCodeAt(header.range[1])),
      label(diagram),
      "the header keyword requires its ASCII word boundary",
    )
  }
  for (const node of nodesOf(reading.root)) {
    if (
      node.type === "Identifier" ||
      node.type === "NumericLiteral" ||
      node.type === "AgentflowLiteral"
    )
      checkTokenKinds(
        reading,
        node,
        [
          node.type === "Identifier"
            ? "Identifier"
            : node.type === "NumericLiteral"
              ? "Numeric"
              : "RawText",
        ],
        "an Agentflow value",
      )
    if (node.type === "AgentflowLabel") {
      const opening = delimiters(node, reading.problems)[0]
      const kind =
        opening === undefined
          ? "text"
          : reading.written.of(opening).endsWith("`")
            ? "markdown"
            : "string"
      reading.problems.expectEqual(
        node.kind,
        kind,
        label(node),
        "the kind of the label, from the delimiter before its content",
      )
      reading.problems.expect(
        textOf(node) !== "",
        label(node),
        "the label is empty",
      )
      checkTokenKinds(
        reading,
        node,
        node.kind === "text"
          ? ["RawText"]
          : ["String", "StringFragment", "RawText"],
        "an Agentflow label",
      )
    }
    if (node.type === "AgentflowDirectionStatement") {
      const keywords = ownOf(reading.root, node).tokens.filter(
        (token) => token.type === "Keyword",
      )
      reading.problems.expectEqual(
        keywords.map((token) => token.value),
        ["direction", node.direction],
        label(node),
        "the direction keywords",
      )
      const whole = reading.converted.of(node.range)
      const last = graphDirection(whole)
      reading.problems.expectEqual(
        node.direction,
        last?.value,
        label(node),
        "the direction family priority",
      )
      const keyword = keywords[0]
      const value = keywords[1]
      if (last !== undefined && keyword !== undefined && value !== undefined) {
        reading.problems.expectEqual(
          reading.converted.of([node.range[0], keyword.range[0]]),
          whole.slice(0, last.index),
          label(node),
          "the last matching direction occurrence of the selected family",
        )
        const between = reading.converted.of([keyword.range[1], value.range[0]])
        reading.problems.expect(
          between !== "" && isBlank(between),
          label(node),
          "direction requires whitespace before its value",
        )
      }
      checkLayout(reading, node, ownOf(reading.root, node), [
        ...(childOf(node, "textBefore") === null ? [] : [CHILD]),
        "direction",
        String(node.direction).toLowerCase(),
        ...(childOf(node, "textAfter") === null ? [] : [CHILD]),
      ])
      for (const field of ["textBefore", "textAfter"]) {
        const part = childOf(node, field)
        if (part !== null) {
          reading.problems.expectEqual(
            part.kind,
            "direction-text",
            label(part),
            `${field} must have kind direction-text`,
          )
          reading.problems.expect(
            textOf(part) !== "" && trimmed(textOf(part)) === textOf(part),
            label(part),
            `${field} must retain its nonempty trimmed ignored text`,
          )
        }
      }
    }
  }
}

/** The bare continuation of a label; its actual closing delimiter supplies lookahead. */
function labelTextIsValid(
  text: string,
  length: number,
  context: "label" | "slanted" | "ellipse" | "dash",
): boolean {
  let at = 0
  while (at < length) {
    const c = text[at] ?? ""
    if (c === '"') return false // A string is permitted only as the initial unit.
    if (context === "dash") {
      if (c === "-" && text[at + 1] === "-") return false
      at++
    } else if (context === "ellipse") {
      if (text.startsWith("%%", at) && text[at + 2] !== "{") return false
      if (
        "()[]{}".includes(c) ||
        (["-", "/", ")"].includes(c) && text[at + 1] === ")")
      )
        return false
      at++
    } else if (context === "slanted") {
      if (
        ("\\(?=])/".includes(c) && text[at + 1] === "]") ||
        "[](){}%".includes(c)
      )
        return false
      if (c === "/" || c === "\\") at++
      else {
        // A quote inside a maximal text-run is ordinary slanted text.
        do {
          at++
        } while (at < length && !"\\[](){}/%".includes(text[at] ?? ""))
      }
    } else {
      if ('[](){}|"%'.includes(c)) return false
      do {
        at++
      } while (at < length && !'[](){}|"%'.includes(text[at] ?? ""))
    }
  }
  return true
}

/** Each held leaf must also be a unit of its particular lexical context. */
function checkLexicalValues(
  reading: Reading,
  delimiters: StringDelimitersOf,
): void {
  for (const parent of nodesOf(reading.root)) {
    for (const child of childNodesOf(parent)) {
      if (child.type === "StringLiteral") {
        const closing = delimiters(child, reading.problems)[1]
        reading.problems.expect(
          closing?.[1] === child.range[1],
          label(child),
          "a URL or tooltip must be one complete string unit",
        )
      }
      if (child.type === "Identifier") {
        if (
          (parent.type === "AgentflowClickUrlStatement" ||
            parent.type === "AgentflowClickCallbackStatement") &&
          entriesOf(parent, "ids").includes(child)
        ) {
          const value = reading.converted.of(child.range)
          reading.problems.expect(
            value !== "" &&
              !(
                entriesOf(parent, "ids")[0] === child && value.startsWith('"')
              ) &&
              ![...value].some(
                (c) => c === "," || isWhitespace(c.charCodeAt(0)),
              ),
            label(child),
            "a click id must be a nonempty click-context run without a comma",
          )
        } else if (
          parent.type === "AgentflowLink" &&
          childOf(parent, "id") === child
        ) {
          validLeaf(reading, child, "edge-id")
        } else {
          const position =
            parent.type === "AgentflowShapeProperty"
              ? "property"
              : childOf(parent, "callback") === child ||
                  childOf(parent, "interpolate") === child
                ? "name"
                : entriesOf(parent, "ids").includes(child) ||
                    entriesOf(parent, "cssClasses").includes(child)
                  ? "id-list"
                  : "id"
          validLeaf(reading, child, position)
        }
      }
      if (child.type === "AgentflowLiteral") {
        if (entriesOf(parent, "styles").includes(child))
          validLeaf(
            reading,
            child,
            parent.type === "AgentflowClassDefStatement"
              ? "class-style"
              : "style",
          )
        else if (childOf(parent, "callback") === child)
          reading.problems.expect(
            textOf(child) !== "" &&
              !reading.converted.of(child.range).includes("("),
            label(child),
            "a callback name needs a nonempty run before its opening parenthesis",
          )
        else if (parent.type === "AgentflowAccDescrBlockStatement")
          reading.problems.expect(
            !reading.converted.of(child.range).includes("}"),
            label(child),
            "an accessibility block value stops at its first closing brace",
          )
        else if (childOf(parent, "arguments") === child)
          reading.problems.expect(
            !reading.converted.of(child.range).includes(")"),
            label(child),
            "callback arguments stop at the first closing parenthesis",
          )
      }
      if (child.type !== "AgentflowLabel" || parent.type === "AgentflowName")
        continue
      const closing = delimiters(child, reading.problems)[1]
      const from = closing?.[1] ?? child.range[0]
      const bare = reading.converted.of([from, child.range[1]])
      const following = reading.converted.of([child.range[1], parent.range[1]])
      const context =
        parent.type === "AgentflowShape" && parent.name === "ellipse"
          ? "ellipse"
          : parent.type === "AgentflowShape" &&
              [
                "lean-right",
                "lean-left",
                "trapezoid-top",
                "trapezoid-bottom",
              ].includes(String(parent.name))
            ? "slanted"
            : parent.type === "AgentflowLink" &&
                childOf(parent, "opening") !== null
              ? "dash"
              : "label"
      reading.problems.expect(
        labelTextIsValid(bare + following, bare.length, context),
        label(child),
        `the bare label has no lexical unit in its ${context} context`,
      )
    }
  }
}

/** Canonical existing link indices and the flow member hasOwnProperty condition, before filtering. */
function checkOutsideGrammar(reading: Reading): void {
  let edges = 0
  const strings = new StringDelimiters(
    reading.root,
    readAgentflowCharacters(reading.text, reading.root),
  )

  /** The candidate name used by the member rejection, before membership filtering. */
  function nameOf(name: CheckedNode | null): string {
    return name === null
      ? "unnamed-flow"
      : entriesOf(name, "parts")
          .map((part) =>
            part?.type === "AgentflowLabel"
              ? reading.converted.of(part.range, strings.around(part.range))
              : "",
          )
          .join("")
          .trim()
  }

  /** Source-order candidate members, also counting the edges available at this statement. */
  function membersOf(node: CheckedNode): string[] {
    if (node.type === "AgentflowVertexStatement") {
      const groups = [
        childOf(node, "first"),
        ...entriesOf(node, "links").map((link) =>
          link === null ? null : childOf(link, "target"),
        ),
      ]
      for (let at = 1; at < groups.length; at++)
        edges +=
          (groups[at - 1] === null
            ? 0
            : entriesOf(groups[at - 1]!, "vertices").length) *
          (groups[at] === null ? 0 : entriesOf(groups[at]!, "vertices").length)
      return groups
        .reverse()
        .flatMap((group) =>
          group === null
            ? []
            : entriesOf(group, "vertices").map((vertex) =>
                vertex === null ? "" : textOf(childOf(vertex, "id"), "name"),
              ),
        )
    }
    if (
      node.type === "AgentflowFlowStatement" ||
      node.type === "AgentflowGlobalStatement"
    ) {
      const members = entriesOf(node, "body").flatMap((statement) =>
        statement === null ? [] : membersOf(statement),
      )
      if (node.type === "AgentflowGlobalStatement") return []
      let overwritten = false
      for (const member of members.filter((value) => !isBlank(value))) {
        reading.problems.expect(
          !overwritten,
          label(node),
          "hasOwnProperty is followed by another nonempty flow member",
        )
        if (member === "hasOwnProperty") overwritten = true
      }
      return [nameOf(childOf(node, "name"))]
    }
    if (node.type === "AgentflowConnectorStatement")
      return [nameOf(childOf(node, "name"))]
    if (node.type === "AgentflowLinkStyleStatement")
      for (const index of entriesOf(node, "indices"))
        if (index !== null) {
          const raw = reading.written.of(index.range)
          reading.problems.expect(
            digitsOnly(raw) &&
              (raw === "0" || !raw.startsWith("0")) &&
              Number(raw) < edges,
            label(index),
            "the linkStyle index is not canonical or names no preceding edge",
          )
        }
    if (node.type === "AgentflowEmptyStatement") return [";"]
    if (
      node.type === "AgentflowAccTitleStatement" ||
      node.type === "AgentflowAccDescrStatement" ||
      node.type === "AgentflowAccDescrBlockStatement"
    )
      return childOf(node, "value") === null
        ? []
        : [trimmed(reading.converted.of(childOf(node, "value")!.range))]
    return []
  }

  for (const statement of entriesOf(reading.root.body, "body"))
    if (statement !== null) membersOf(statement)
}

/** Complete data delimiters and lexical protection are syntax; the contents remain opaque. */
function checkData(reading: Reading, node: CheckedNode): void {
  const tokens = nodeTokensIn(reading.root, node.range)
  reading.problems.expect(
    tokens[0]?.value === "@{" && tokens.at(-1)?.value === "}",
    label(node),
    "a data block requires its complete delimiters",
  )
  reading.problems.expect(
    tokens.slice(1, -1).every((token) => token.type === "RawText"),
    label(node),
    "data interiors must be opaque RawText",
  )
  const value = reading.converted.of([node.range[0] + 2, node.range[1] - 1])
  let quoted = false
  for (const character of value) {
    if (character === '"') quoted = !quoted
    else if (!quoted)
      reading.problems.expect(
        character !== "^" && character !== "}",
        label(node),
        "data contains an unprotected brace or caret",
      )
  }
  reading.problems.expect(
    !quoted,
    label(node),
    "a data double quote is unclosed",
  )
}

/** ASCII padding consumed by the diagram comment rule is not a whitespace style unit. */
function commentPadding(reading: Reading): (readonly [number, number])[] {
  const characters = readAgentflowCharacters(reading.text, {
    ...reading.root,
    comments: [],
  })
  const ranges: (readonly [number, number])[] = []
  for (const comment of reading.root.comments) {
    let index = characters.findIndex(
      (character) => character.start === comment.range[0],
    )
    if (index < 0) continue
    let start = comment.range[0]
    while (index > 0) {
      const previous = characters[index - 1]
      if (previous.codePoint !== 0x09 && previous.codePoint !== 0x20) break
      start = previous.start
      index--
    }
    if (start < comment.range[0]) ranges.push([start, comment.range[0]])
  }
  return ranges
}

/** Preserved comments are unavailable in data, calls, accessibility, names and initial strings. */
function checkCommentContexts(reading: Reading): void {
  if (reading.root.comments.length === 0) return
  const commonRegions = agentflowPreservesComments(reading.text, reading.root)
    ? []
    : scanSource(
        reading.text,
        reading.root.frontmatter?.range[1] ?? 0,
      ).commentLines.map((line) => line.region)
  const nodes = nodesOf(reading.root)
  const forbidden: {
    readonly range: readonly [number, number]
    readonly type: string
  }[] = nodes.filter((node) =>
    [
      "AgentflowDataBlock",
      "AgentflowLiteral",
      "AgentflowIgnoredText",
      "AgentflowName",
      "AgentflowAccDescrBlockStatement",
      "AgentflowClickCallbackStatement",
      "AgentflowClickUrlStatement",
      "StringLiteral",
    ].includes(node.type),
  )
  const characters = readAgentflowCharacters(reading.text, {
    ...reading.root,
    comments: [],
  })
  for (const node of nodes) {
    if (
      node.type === "AgentflowAccTitleStatement" ||
      node.type === "AgentflowAccDescrStatement" ||
      node.type === "AgentflowDirectionStatement"
    ) {
      const end =
        characters.find(
          (character) =>
            character.start >= node.range[1] && character.codePoint === 0x0a,
        )?.start ?? reading.text.length
      forbidden.push({ type: node.type, range: [node.range[0], end] })
    }
    if (node.type === "AgentflowLink" && node.opening !== null) {
      const content = childOf(node, "label")
      if (content !== null) forbidden.push(content)
    }
    if (node.type !== "AgentflowLabel") continue
    const strings = nodeTokensIn(reading.root, node.range).filter(
      (token) => token.type === "String" || token.type === "StringFragment",
    )
    const first = strings[0]
    const last = strings.at(-1)
    if (first !== undefined && last !== undefined)
      forbidden.push({
        type: "the initial string",
        range: [first.range[0], last.range[1]],
      })
  }
  for (const comment of reading.root.comments) {
    if (
      commonRegions.some(
        ([start, end]) => start <= comment.range[0] && comment.range[1] <= end,
      )
    )
      continue
    for (const context of forbidden) {
      if (
        comment.range[0] < context.range[1] &&
        context.range[0] < comment.range[1]
      )
        reading.problems.report(
          label(comment),
          `a preserved Agentflow comment is not allowed inside ${context.type}`,
        )
    }
  }
}

/** All diagram-specific fields, attachment, retained fragments, layout and acceptance conditions. */
export function checkAgentflowTree(
  text: string,
  root: CheckedRoot,
  delimiters: StringDelimitersOf,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  checkCommentContexts(reading)
  checkTokensInValueNodes(root, problems)
  for (const node of nodesOf(root)) {
    if (!node.type.startsWith("Agentflow")) continue
    checkChildTypes(reading, node, AGENTFLOW_CHILD_TYPES)
    checkFieldWords(reading, node, AGENTFLOW_FIELD_WORDS)
    checkListsWithAnEntry(reading, node, AGENTFLOW_NONEMPTY_LISTS)
    if (
      ![
        "AgentflowLabel",
        "AgentflowLiteral",
        "AgentflowIgnoredText",
        "AgentflowDataBlock",
      ].includes(node.type) &&
      !(
        node.type === "AgentflowAccDescrBlockStatement" && node.closed === false
      )
    )
      checkRangeIsHull(reading, node, ownOf(root, node))
    if (node.type === "AgentflowDataBlock") checkData(reading, node)
    else if (node.type === "AgentflowIgnoredText")
      checkTokenKinds(reading, node, ["RawText"], "retained ignored text")
    else if (node.type === "AgentflowShape") checkShape(reading, node)
    else if (
      node.type === "AgentflowArrow" ||
      node.type === "AgentflowOpeningArrow"
    )
      checkArrow(reading, node)
    else if (
      node.type.includes("StyleStatement") ||
      node.type === "AgentflowClassDefStatement" ||
      node.type === "AgentflowClassStatement"
    )
      checkStylesAndLists(reading, node)
    else if (
      node.type === "AgentflowClickUrlStatement" ||
      node.type === "AgentflowClickCallbackStatement"
    )
      checkClick(reading, node)
    checkStructure(reading, node, delimiters)
  }
  checkDiagramAndValues(reading, delimiters)
  checkLexicalValues(reading, delimiters)
  checkOutsideGrammar(reading)
}
