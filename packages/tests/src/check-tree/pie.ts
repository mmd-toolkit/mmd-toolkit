import {
  boundary,
  following,
  checkGap,
  checkHiddenGap,
  checkNativeComments,
  checkIgnored,
  stringSpelling,
  checkCommon,
  checkEnd,
  checkPreheader,
  checkRawUnit,
} from "./common-statement-checks.ts"
import { isDigit } from "../db-from-tree/characters.ts"
import { checkChildTypes, checkFieldWords } from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  checkOwnKinds,
  checkRangeIsHull,
  checkTokenKinds,
  childOf,
  entriesOf,
  ownOf,
  readingOf,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { childNodesOf, walkNodes } from "./walk.ts"

const HIDDEN = ["PieIgnoredText"]
const COMMON = [
  "PieTitleStatement",
  "PieAccTitleStatement",
  "PieAccDescrStatement",
  "PieAccDescrBlockStatement",
]

/** ast/pie.md: child types in the specified visitation order. */
export const PIE_CHILD_TYPES: FieldTable<readonly string[]> = {
  PieDiagram: {
    textBeforeHeader: HIDDEN,
    textBeforeShowData: HIDDEN,
    body: ["PieSectionStatement", ...COMMON, ...HIDDEN],
  },
  PieSectionStatement: {
    label: ["StringLiteral"],
    textBeforeColon: HIDDEN,
    textBeforeValue: HIDDEN,
    value: ["NumericLiteral"],
    textAfter: HIDDEN,
  },
  PieTitleStatement: { value: ["PieLiteral"], textAfter: HIDDEN },
  PieAccTitleStatement: { value: ["PieLiteral"], textAfter: HIDDEN },
  PieAccDescrStatement: { value: ["PieLiteral"], textAfter: HIDDEN },
  PieAccDescrBlockStatement: { value: ["PieLiteral"], textAfter: HIDDEN },
}

/** ast/pie.md, PieIgnoredText: the two complete hidden forms. */
export const PIE_FIELD_WORDS: FieldTable<readonly string[]> = {
  PieIgnoredText: { kind: ["yaml-block", "directive"] },
}

/** Fixed punctuation outside values; hidden fences are RawText. */
export const PIE_PUNCTUATORS: readonly string[] = [":", "{", "}"]

/** diagrams/pie.md, Numbers: a whole fraction or integer, without plus or exponent. */
function numberSpelling(value: string): boolean {
  let at = value.startsWith("-") ? 1 : 0
  const first = at
  while (isDigit(value.charCodeAt(at))) at++
  if (at === first) return false
  if (value.charAt(at) === ".") {
    const fraction = ++at
    while (isDigit(value.charCodeAt(at))) at++
    return at > fraction && at === value.length
  }
  return (
    at === value.length && (at - first === 1 || value.charAt(first) !== "0")
  )
}

/** A section has exactly one colon, correctly owned gaps, and complete lexical values. */
function checkSection(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  reading.problems.expectEqual(
    own.text,
    ":",
    label(node),
    "the section punctuation",
  )
  const colon = own.tokens.find((token) => token.value === ":")
  const string = childOf(node, "label")
  const number = childOf(node, "value")
  if (string !== null) {
    reading.problems.expect(
      string.closed === true &&
        stringSpelling(reading.converted.of(string.range)),
      label(string),
      "the label is not a closed STRING lexical unit",
    )
    checkHiddenGap(
      reading,
      node,
      "textBeforeColon",
      string.range[1],
      colon?.range[0] ?? string.range[1],
    )
  }
  if (number !== null) {
    const raw = reading.written.of(number.range)
    reading.problems.expect(
      numberSpelling(raw),
      label(number),
      "the number is not one pie-number lexical unit",
    )
    checkTokenKinds(reading, number, ["Numeric"], "a section number")
    checkHiddenGap(
      reading,
      node,
      "textBeforeValue",
      colon?.range[1] ?? number.range[0],
      number.range[0],
    )
    checkHiddenGap(reading, node, "textAfter", number.range[1], node.range[1])
  }
}

/** The header, optional flag and body own every hidden form at the first available grammar gap. */
function checkDiagram(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  reading.problems.expectEqual(
    own.tokens.map((token) => token.value),
    node.showData === true ? ["pie", "showData"] : ["pie"],
    label(node),
    "the header and showData flag",
  )
  const header = own.tokens[0]
  if (header === undefined) return
  checkNativeComments(reading, header.range[1])
  for (const token of own.tokens) {
    const tail = following(reading, token.range[1])
    reading.problems.expect(
      boundary(tail, 0) || tail.startsWith("%%"),
      label(token),
      "the pie/showData keyword has no whitespace, EOF or percent-pair boundary",
    )
  }
  checkPreheader(reading, node)
  checkHiddenGap(
    reading,
    node,
    "textBeforeHeader",
    node.range[0],
    header.range[0],
    true,
    true,
  )
  const flag = own.tokens[1]
  if (node.showData === true && flag !== undefined)
    checkHiddenGap(
      reading,
      node,
      "textBeforeShowData",
      header.range[1],
      flag.range[0],
    )
  else
    reading.problems.expect(
      entriesOf(node, "textBeforeShowData").length === 0,
      label(node),
      "textBeforeShowData must be empty without showData",
    )
  let end = flag?.range[1] ?? header.range[1]
  let previous: CheckedNode | null = null
  for (const item of entriesOf(node, "body")) {
    if (item === null) continue
    if (previous !== null && previous.type !== "PieIgnoredText")
      checkEnd(reading, previous, item.range[0])
    else checkGap(reading, node, end, item.range[0], true, previous)
    end = item.range[1]
    previous = item
  }
  if (previous !== null && previous.type !== "PieIgnoredText")
    checkEnd(reading, previous, reading.text.length)
  else checkGap(reading, node, end, reading.text.length, true, previous)
}

/** ast/pie.md: coverage, lexical units, hidden ownership and surviving EOL. */
export function checkPieTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  checkTokensInValueNodes(root, problems)
  walkNodes(root, (node) => {
    checkChildTypes(reading, node, PIE_CHILD_TYPES)
    checkFieldWords(reading, node, PIE_FIELD_WORDS)
    if (node.type === "PieLiteral")
      checkTokenKinds(reading, node, ["RawText"], "a common value")
    if (node.type === "PieLiteral" || node.type === "PieIgnoredText")
      checkRawUnit(reading, node)
    if (!node.type.startsWith("Pie")) return
    const own = ownOf(root, node)
    checkRangeIsHull(reading, node, own)
    if (node.type !== "PieLiteral" && node.type !== "PieIgnoredText") {
      checkOwnKinds(reading, node, own, PIE_PUNCTUATORS)
      const children = childNodesOf(node)
      for (const [index, child] of children.entries()) {
        const next = children[index + 1]
        if (next !== undefined)
          problems.expect(
            child.range[1] <= next.range[0],
            label(node),
            "child fields are not in their specified source order",
          )
      }
    }
    switch (node.type) {
      case "PieDiagram":
        checkDiagram(reading, node)
        break
      case "PieSectionStatement":
        checkSection(reading, node)
        break
      case "PieIgnoredText":
        checkIgnored(reading, node)
        break
      default:
        if (COMMON.includes(node.type)) checkCommon(reading, node)
        break
    }
  })
}
