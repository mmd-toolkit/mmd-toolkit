import { isWhitespace, isWordCharacter } from "../db-from-tree/characters.ts"
import { checkChildTypes, checkFieldWords } from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  CHILD,
  between,
  checkJoinedOwnText,
  checkLayout,
  checkOwnKinds,
  checkRangeIsHull,
  childOf,
  entriesOf,
  isBlank,
  nextWrittenCharacter,
  ownOf,
  readingOf,
  startsWithWhitespace,
  textOf,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import type { CheckedNode, CheckedRoot, CheckedToken } from "./types.ts"
import { nodesOf, walkNodes } from "./walk.ts"

// ast/kanban.md and diagrams/kanban.md define these checks; token kinds and
// ranges follow parser/docs/tokens/kanban.md and positions/kanban.md.

/** ast/kanban.md, KanbanShape: the openings, each independent of the closing written with it. */
export const KANBAN_OPENERS: readonly string[] = [
  "-)",
  "(-",
  "))",
  ")",
  "((",
  "{{",
  "(",
  "[",
]
/** ast/kanban.md, KanbanShape: the closings, each independent of the opening written with it. */
export const KANBAN_CLOSERS: readonly string[] = [
  "))",
  ")",
  "]",
  "}}",
  "(-",
  "-)",
  "((",
  "(",
]

/** parser/docs/tokens/kanban.md: delimiters, the class marker, and data blocks. */
export const KANBAN_PUNCTUATORS: readonly string[] = [
  ":::",
  ")",
  "))",
  "(",
  "((",
  "[",
  "]",
  "{{",
  "}}",
  "(-",
  "-)",
  "@{",
  "}",
]

/** ast/kanban.md: the words of the value fields. */
export const KANBAN_FIELD_WORDS: FieldTable<readonly string[]> = {
  KanbanShape: { opener: KANBAN_OPENERS, closer: KANBAN_CLOSERS },
  KanbanLabel: { kind: ["text", "string", "markdown"] },
}

/** ast/kanban.md: the Type column of each child field, in visit order. */
export const KANBAN_CHILD_TYPES: FieldTable<readonly string[]> = {
  KanbanDiagram: { body: ["KanbanNode"] },
  KanbanNode: {
    id: ["KanbanLiteral"],
    shape: ["KanbanShape"],
    data: ["KanbanDataBlock"],
    decorations: ["KanbanIconStatement", "KanbanClassStatement"],
    children: ["KanbanNode"],
  },
  KanbanShape: { label: ["KanbanLabel"] },
  KanbanIconStatement: { icon: ["KanbanLiteral"] },
  KanbanClassStatement: { cssClass: ["KanbanLiteral"] },
}

/** Units and contexts: count non-CR/LF whitespace through shared trivia, stopping at native comment text. */
function indentationBefore(reading: Reading, offset: number): number {
  let count = 0
  for (let at = offset - 1; at >= 0; at--) {
    if (reading.written.isLeftOut(at)) continue
    if (
      reading.root.comments.some(
        (comment) => comment.range[0] <= at && at < comment.range[1],
      )
    )
      break
    const code = reading.text.charCodeAt(at)
    if (code === 10 || code === 13 || !isWhitespace(code)) break
    count++
  }
  return count
}

/** Diagram and lines: statements are separated by a line end; diagram comments can supply it. */
function checkLineGap(
  reading: Reading,
  node: CheckedNode,
  from: number,
  to: number,
  needsEnd: boolean,
): void {
  const comments = reading.root.comments.filter(
    (comment) => from <= comment.range[0] && comment.range[1] <= to,
  )
  const gap = reading.written.of(
    [from, to],
    comments.map((comment) => comment.range),
  )
  const lineEnd =
    gap.includes("\n") ||
    gap.includes("\r") ||
    comments.some((comment) => {
      const next = nextWrittenCharacter(reading, comment.range[1])
      return next === "\u2028" || next === "\u2029"
    })
  reading.problems.expect(
    isBlank(gap) && (!needsEnd || lineEnd),
    label(node),
    "the statements are not separated by whitespace and a line end",
  )
}

/** KanbanNode: a text, a shape, or both, followed by adjacent data and then decoration lines. */
function checkNode(reading: Reading, node: CheckedNode): void {
  const id = childOf(node, "id")
  const shape = childOf(node, "shape")
  reading.problems.expect(
    Number.isInteger(node.indent) && Number(node.indent) >= 0,
    label(node),
    "the indent is no integer of 0 or more",
  )
  reading.problems.expectEqual(
    node.indent,
    indentationBefore(reading, node.range[0]),
    label(node),
    "the indent, which is the number of whitespace characters before the node on its line",
  )
  reading.problems.expect(
    id !== null || shape !== null,
    label(node),
    "has neither a node text nor a shape",
  )
  if (id !== null && shape !== null) {
    reading.problems.expect(
      between(reading, id.range[1], shape.range[0]) === "" &&
        textOf(shape, "opener") !== "-)",
      label(node),
      "the node text does not run to the shape",
    )
  }
  const data = entriesOf(node, "data")
  let end = (shape ?? id)?.range[1] ?? node.range[0]
  if (id !== null && shape === null) {
    const next = nextWrittenCharacter(reading, id.range[1])
    reading.problems.expect(
      next === undefined || next === "\n" || next === "\r" || next === "@",
      label(id),
      "the node text ends before the end of its unit",
    )
  }
  for (const block of data) {
    if (block === null) continue
    reading.problems.expect(
      between(reading, end, block.range[0]) === "",
      label(node),
      "the data blocks do not touch the node and one another",
    )
    end = block.range[1]
  }
  for (const decoration of entriesOf(node, "decorations")) {
    if (decoration === null) continue
    checkLineGap(reading, node, end, decoration.range[0], true)
    end = decoration.range[1]
  }
}

/** KanbanLabel and The shape context: nonempty text or the content of a closed string of its kind. */
function checkLabel(reading: Reading, node: CheckedNode): void {
  const kind = textOf(node, "kind")
  const written = reading.attributeTextOf(node.range)
  const [opening, closing]: readonly [string, string] =
    kind === "markdown" ? ['"`', '`"'] : ['"', '"']
  const value =
    kind === "text" ? written : written.slice(opening.length, -closing.length)
  const forbidden =
    kind === "text"
      ? [")", "]", "(", "}"]
      : kind === "string"
        ? ['"']
        : ['"', "`"]
  reading.problems.expect(
    textOf(node) !== "",
    label(node),
    "the label is empty",
  )
  reading.problems.expect(
    kind === "text"
      ? !written.startsWith('"')
      : written.startsWith(opening) && written.endsWith(closing),
    label(node),
    "the label does not have the delimiters of its kind",
  )
  reading.problems.expect(
    !forbidden.some((character) => value.includes(character)),
    label(node),
    "the label holds a character that ends its kind",
  )
  if (kind === "string")
    reading.problems.expect(
      !written.startsWith('"`'),
      label(node),
      "the string starts a markdown label",
    )
}

/** KanbanLiteral and its three contexts: nonempty, with every character and trailing whitespace of its unit. */
function checkLiteral(
  reading: Reading,
  node: CheckedNode,
  parent: CheckedNode | null,
): void {
  const value = reading.attributeValueOf(node)
  reading.problems.expect(value !== "", label(node), "the literal is empty")
  if (parent?.type === "KanbanNode") {
    const lower = value.toLowerCase()
    reading.problems.expect(
      !startsWithWhitespace(value) &&
        !["(", "[", ")", "{", "}", "@", "\n", "\r"].some((character) =>
          value.includes(character),
        ) &&
        !["%%", ":::", "::icon(", "-)"].some((start) =>
          lower.startsWith(start),
        ) &&
        !(lower.startsWith("kanban") && !isWordCharacter(lower.charCodeAt(6))),
      label(node),
      "the node text starts or holds a character read by an earlier rule",
    )
  } else if (parent?.type === "KanbanIconStatement") {
    reading.problems.expect(
      !value.includes(")"),
      label(node),
      "the icon holds its closing parenthesis",
    )
  } else if (parent?.type === "KanbanClassStatement") {
    const next = nextWrittenCharacter(reading, node.range[1])
    const ends = ["\n", "\r", "\u2028", "\u2029"]
    reading.problems.expect(
      !ends.some((end) => value.includes(end)) &&
        (next === undefined || ends.includes(next)),
      label(node),
      "the class does not run to the end of its line segment",
    )
  }
}

/** KanbanDataBlock: a closed opaque interior; only double quotes protect a closing brace or caret. */
function checkData(reading: Reading, node: CheckedNode): void {
  const written = reading.attributeTextOf(node.range)
  reading.problems.expect(
    written.startsWith("@{") && written.endsWith("}"),
    label(node),
    "the data block is not delimited by @{ and }",
  )
  let quoted = false
  let valid = true
  for (const character of written.slice(2, -1)) {
    if (character === '"') quoted = !quoted
    else if (!quoted && (character === "}" || character === "^")) valid = false
  }
  reading.problems.expect(
    valid && !quoted,
    label(node),
    "the data interior has an unquoted closing brace or caret, or an unclosed quote",
  )
}

/** parser/docs/tokens/kanban.md: each text unit is RawText, or String and its cut fragments; data delimiters are separate punctuation. */
function checkValueTokens(
  reading: Reading,
  node: CheckedNode,
  tokens: readonly CheckedToken[],
): void {
  let range = node.range
  let content = tokens
  if (node.type === "KanbanDataBlock") {
    const first = tokens[0]
    const last = tokens.at(-1)
    reading.problems.expect(
      first?.type === "Punctuator" &&
        first.value === "@{" &&
        last?.type === "Punctuator" &&
        last.value === "}",
      label(node),
      "the data delimiters are not separate Punctuator tokens @{ and }",
    )
    range = [node.range[0] + 2, node.range[1] - 1]
    content = tokens.slice(1, -1)
  }
  const isString =
    node.type === "KanbanLabel" &&
    ["string", "markdown"].includes(textOf(node, "kind"))
  const expected = isString
    ? reading.written.stringTokenKinds(range)
    : reading.written.of(range) === ""
      ? []
      : Array.from(
          { length: reading.written.cutsIn(range) + 1 },
          () => "RawText",
        )
  reading.problems.expectEqual(
    content.map((token) => token.type),
    expected,
    label(node),
    "the token kinds of the text unit, split only at directives, comment regions, and ignored semicolons",
  )
}

/** The occurrence ends at its own final decoration or suffix, before any cards. */
function ownEnd(node: CheckedNode): number {
  return (
    (
      entriesOf(node, "decorations").at(-1) ??
      entriesOf(node, "data").at(-1) ??
      childOf(node, "shape") ??
      childOf(node, "id")
    )?.range[1] ?? node.range[1]
  )
}

/** Columns use the first node's indent; all other nodes belong to the latest column. */
function checkParents(reading: Reading, ordered: readonly CheckedNode[]): void {
  const expected = new Map<CheckedNode, CheckedNode[]>()
  const columns: CheckedNode[] = []
  let column: CheckedNode | undefined
  for (const node of ordered) {
    if (column === undefined || node.indent === ordered[0]?.indent) {
      columns.push(node)
      column = node
    } else expected.set(column, [...(expected.get(column) ?? []), node])
  }
  for (const node of [reading.root.body, ...ordered]) {
    reading.problems.expectEqual(
      entriesOf(node, node === reading.root.body ? "body" : "children").map(
        (child) => child?.range,
      ),
      (node === reading.root.body ? columns : (expected.get(node) ?? [])).map(
        (child) => child.range,
      ),
      label(node),
      "the children do not follow the kanban two-level first-indent column rule",
    )
  }
}

/** Checks a kanban tree against ast/kanban.md and parser/docs/tokens/kanban.md and positions/kanban.md. */
export function checkKanbanTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  checkTokensInValueNodes(root, problems)
  const body = nodesOf(root)
    .filter((node) => node.type === "KanbanNode")
    .sort(
      (a, b) =>
        ((childOf(a, "id") ?? childOf(a, "shape"))?.range[0] ?? a.range[0]) -
        ((childOf(b, "id") ?? childOf(b, "shape"))?.range[0] ?? b.range[0]),
    )
  checkParents(reading, body)
  const header = ownOf(root, root.body).tokens[0]
  let previous = header?.range[1] ?? root.body.range[0]
  if (header !== undefined) {
    const after = nextWrittenCharacter(reading, header.range[1])
    problems.expect(
      after === undefined || !isWordCharacter(after.charCodeAt(0)),
      label(root.body),
      "the header is followed by a word character",
    )
    problems.expect(
      between(reading, header.range[1], text.length) !== "" ||
        root.comments.some((comment) => comment.range[0] >= header.range[1]),
      label(root.body),
      "the header has neither a body nor a source line end or comment",
    )
  }
  for (const [index, node] of body.entries()) {
    checkLineGap(reading, node, previous, node.range[0], index > 0)
    previous = ownEnd(node)
  }
  checkLineGap(reading, root.body, previous, text.length, false)
  walkNodes(root, (node, parent) => {
    if (
      node.type === "KanbanIconStatement" ||
      node.type === "KanbanClassStatement"
    ) {
      const preceding = body
        .filter(
          (item) =>
            ((childOf(item, "shape") ?? childOf(item, "id"))?.range[1] ??
              Infinity) <= node.range[0],
        )
        .at(-1)
      problems.expect(
        parent === preceding &&
          entriesOf(parent ?? root.body, "decorations").filter(
            (entry) => entry === node,
          ).length === 1,
        label(node),
        "the decoration belongs exactly once to the last written node",
      )
    }
    checkChildTypes(reading, node, KANBAN_CHILD_TYPES)
    checkFieldWords(reading, node, KANBAN_FIELD_WORDS)
    if (!node.type.startsWith("Kanban")) return
    const own = ownOf(root, node)
    checkRangeIsHull(reading, node, own)
    if (
      ["KanbanLabel", "KanbanLiteral", "KanbanDataBlock"].includes(node.type)
    ) {
      checkValueTokens(reading, node, own.tokens)
      if (node.type === "KanbanLabel") checkLabel(reading, node)
      else if (node.type === "KanbanLiteral")
        checkLiteral(reading, node, parent)
      else checkData(reading, node)
      return
    }
    checkOwnKinds(reading, node, own, KANBAN_PUNCTUATORS)
    switch (node.type) {
      case "KanbanDiagram":
        checkJoinedOwnText(reading, node, own, "kanban", false)
        break
      case "KanbanNode":
        checkJoinedOwnText(reading, node, own, "", false)
        checkNode(reading, node)
        break
      case "KanbanShape": {
        const value = childOf(node, "label")
        checkLayout(reading, node, own, [
          textOf(node, "opener"),
          CHILD,
          textOf(node, "closer"),
        ])
        if (value !== null) {
          problems.expectEqual(
            between(reading, node.range[0], value.range[0]),
            textOf(node, "opener"),
            label(node),
            "the written opener",
          )
          problems.expectEqual(
            between(reading, value.range[1], node.range[1]),
            textOf(node, "closer"),
            label(node),
            "the written closer",
          )
          problems.expect(
            textOf(node, "closer") !== "-)" || textOf(value, "kind") !== "text",
            label(node),
            "a bare label reads the dash of the closer as text",
          )
        }
        break
      }
      case "KanbanIconStatement":
      case "KanbanClassStatement": {
        const icon = node.type === "KanbanIconStatement"
        checkLayout(
          reading,
          node,
          own,
          icon ? ["::icon(", CHILD, ")"] : [":::", CHILD],
        )
        const value = childOf(node, icon ? "icon" : "cssClass")
        if (value !== null) {
          problems.expectEqual(
            between(reading, node.range[0], value.range[0]).toLowerCase(),
            icon ? "::icon(" : ":::",
            label(node),
            "the written decoration marker",
          )
          problems.expectEqual(
            between(reading, value.range[1], node.range[1]),
            icon ? ")" : "",
            label(node),
            "the written decoration end",
          )
        }
        break
      }
      default:
        break
    }
  })
}
