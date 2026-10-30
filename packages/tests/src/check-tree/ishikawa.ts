import {
  isLineTerminatorCode,
  isWhitespace,
  isWordCharacter,
  lowercaseAscii,
} from "../db-from-tree/characters.ts"
import type { TreeRange } from "../db-from-tree/tree.ts"
import { checkChildTypes } from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  checkRangeIsHull,
  checkTokenKinds,
  childOf,
  entriesOf,
  nextWrittenCharacter,
  ownOf,
  readingOf,
  textOf,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes, nodeTokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { nodesOf, walkNodes } from "./walk.ts"

/** ast/ishikawa.md: the child fields, in source order. */
export const ISHIKAWA_CHILD_TYPES: FieldTable<readonly string[]> = {
  IshikawaDiagram: { root: ["IshikawaNode"] },
  IshikawaNode: { text: ["IshikawaLiteral"], children: ["IshikawaNode"] },
}

/** diagrams/ishikawa.md, Units: beta precedes stable, with ASCII word boundaries. */
const HEADERS: readonly string[] = ["ishikawa-beta", "ishikawa"]

/** The selected header at a unit start, not a spelling inside prose. */
function headerAt(text: string): string | undefined {
  const lower = lowercaseAscii(text)
  return HEADERS.find(
    (header) =>
      lower.startsWith(header) &&
      !isWordCharacter(text.charCodeAt(header.length)),
  )
}

/** Count written line whitespace, stopping at a comment body but counting its ending separator. */
function indentBefore(reading: Reading, offset: number): number {
  let indent = 0
  for (let at = offset - 1; at >= 0; at--) {
    if (reading.written.isLeftOut(at)) continue
    if (
      reading.root.comments.some(
        (comment) => comment.range[0] <= at && at < comment.range[1],
      )
    )
      break
    const code = reading.text.charCodeAt(at)
    if (isLineTerminatorCode(code) || !isWhitespace(code)) break
    indent++
  }
  return indent
}

/** Check parents from written indentation; the Db builder only projects the resulting nesting. */
function checkParents(reading: Reading, ordered: readonly CheckedNode[]): void {
  const root = ordered[0]
  const firstCause = ordered[1]
  if (root === undefined || firstCause === undefined) return
  const expected = new Map<CheckedNode, CheckedNode[]>()
  const causes: CheckedNode[] = []
  for (const node of ordered.slice(1)) {
    if (Number(node.indent) <= Number(firstCause.indent)) causes.length = 0
    while (
      causes.length > 0 &&
      Number(causes.at(-1)?.indent) >= Number(node.indent)
    )
      causes.pop()
    const parent = causes.at(-1) ?? root
    expected.set(parent, [...(expected.get(parent) ?? []), node])
    causes.push(node)
  }
  for (const node of ordered) {
    reading.problems.expectEqual(
      entriesOf(node, "children").map((child) => child?.range),
      (expected.get(node) ?? []).map((child) => child.range),
      label(node),
      "the children do not follow the Ishikawa first-cause and nearest-smaller-indent parent rule",
    )
  }
}

/** Gaps hold trivia only; successive text lines need a newline or a comment-ending LS/PS. */
function checkLines(reading: Reading, ordered: readonly CheckedNode[]): void {
  const own = ownOf(reading.root, reading.root.body)
  const header = own.tokens[0]
  const headerText = lowercaseAscii(header?.value ?? "")
  reading.problems.expect(
    own.tokens.length === 1 &&
      header?.type === "Keyword" &&
      HEADERS.includes(headerText),
    label(reading.root.body),
    "the diagram must write one complete Ishikawa header Keyword",
  )
  if (header === undefined) return
  const following = reading.written.of([header.range[1], reading.text.length])
  reading.problems.expect(
    headerAt(header.value + following) === headerText,
    label(reading.root.body),
    "the header is not the first bounded header unit",
  )
  reading.problems.expect(
    following !== "",
    label(reading.root.body),
    "the header has no source whitespace, comment or node after it",
  )
  const comments = reading.root.comments.map((comment) => comment.range)
  let previous = header.range[1]
  for (const [index, node] of ordered.entries()) {
    const literal = childOf(node, "text")
    if (literal === null) continue
    const range: TreeRange = [previous, literal.range[0]]
    const gap = reading.written.of(range, comments)
    reading.problems.expect(
      [...gap].every((character) =>
        isWhitespace(character.codePointAt(0) ?? 0),
      ),
      label(node),
      "the node gap contains text outside nodes or comments",
    )
    const commentSeparator = reading.root.comments.some((comment) => {
      const end = comment.range[1]
      return (
        range[0] <= end &&
        end < literal.range[0] &&
        !reading.written.isLeftOut(end) &&
        (reading.text.charAt(end) === "\u2028" ||
          reading.text.charAt(end) === "\u2029")
      )
    })
    reading.problems.expect(
      index === 0 ||
        gap.includes("\n") ||
        gap.includes("\r") ||
        commentSeparator,
      label(node),
      "successive nodes have no line break or comment-ending separator between them",
    )
    previous = literal.range[1]
  }
  const tail = reading.written.of([previous, reading.text.length], comments)
  reading.problems.expect(
    [...tail].every((character) => isWhitespace(character.codePointAt(0) ?? 0)),
    label(reading.root.body),
    "the body has trailing text outside nodes or comments",
  )
}

/** ast/ishikawa.md: literals retain written prose, and each line has one maximal text unit. */
function checkLiteral(reading: Reading, node: CheckedNode): void {
  const value = textOf(node)
  const converted = reading.converted.of(node.range)
  reading.problems.expect(value !== "", label(node), "the literal is empty")
  reading.problems.expect(
    converted !== "" &&
      !isWhitespace(converted.charCodeAt(0)) &&
      !converted.includes("\n") &&
      !converted.includes("\r") &&
      !converted.startsWith("%%") &&
      headerAt(converted) === undefined,
    label(node),
    "the literal is not a node-text unit: it starts with trivia or a header, or crosses a line break",
  )
  const next = nextWrittenCharacter(reading, node.range[1])
  reading.problems.expect(
    next === undefined || isLineTerminatorCode(next.charCodeAt(0)),
    label(node),
    "the node text ends before the end of its line",
  )
  checkTokenKinds(reading, node, ["RawText"], "Ishikawa node text")
  reading.problems.expectEqual(
    nodeTokensIn(reading.root, node.range).length,
    reading.written.cutsIn(node.range) + 1,
    label(node),
    "the literal token count, split only at common trivia cuts",
  )
}

/** The diagram's fields, values, indentation, nesting, token kinds and source coverage. */
export function checkIshikawaTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  checkTokensInValueNodes(root, problems)
  walkNodes(root, (node) => {
    checkChildTypes(reading, node, ISHIKAWA_CHILD_TYPES)
    if (node.type === "IshikawaLiteral") checkLiteral(reading, node)
    if (node.type !== "IshikawaNode" && node.type !== "IshikawaDiagram") return
    const own = ownOf(root, node)
    checkRangeIsHull(reading, node, own)
    if (node.type !== "IshikawaNode") return
    problems.expectEqual(
      own.tokens.length,
      0,
      label(node),
      "a node writes no token outside its text and children",
    )
    problems.expect(
      Number.isInteger(node.indent) && Number(node.indent) >= 0,
      label(node),
      "the indent is not a nonnegative integer",
    )
    const literal = childOf(node, "text")
    if (literal !== null)
      problems.expectEqual(
        node.indent,
        indentBefore(reading, literal.range[0]),
        label(node),
        "the indent is not the written line whitespace count",
      )
  })
  const ordered = nodesOf(root)
    .filter((node) => node.type === "IshikawaNode")
    .sort((a, b) => a.range[0] - b.range[0])
  checkLines(reading, ordered)
  checkParents(reading, ordered)
}
