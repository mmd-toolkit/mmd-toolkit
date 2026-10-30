import { isDigit } from "../db-from-tree/characters.ts"
import {
  boundary,
  following,
  checkCommon,
  checkGap,
  checkHiddenGap,
  checkIgnored,
  checkNativeComments,
  checkPreheader,
  checkStatementBody,
  checkStatementNode,
  stringSpelling,
  yamlEnd,
} from "./common-statement-checks.ts"
import { checkChildTypes, checkFieldWords } from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  childOf,
  ownOf,
  readingOf,
  checkTokenKinds,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { walkNodes } from "./walk.ts"

const HIDDEN = ["PacketIgnoredText"]
const COMMON = [
  "PacketTitleStatement",
  "PacketAccTitleStatement",
  "PacketAccDescrStatement",
  "PacketAccDescrBlockStatement",
]
const BLOCKS = [
  "PacketRangeBlockStatement",
  "PacketSingleBlockStatement",
  "PacketRelativeBlockStatement",
]

/** ast/packet.md: every child field, in visitor order. */
export const PACKET_CHILD_TYPES: FieldTable<readonly string[]> = {
  PacketDiagram: {
    textBeforeHeader: HIDDEN,
    body: [...BLOCKS, ...COMMON, ...HIDDEN],
  },
  PacketRangeBlockStatement: {
    start: ["NumericLiteral"],
    textBeforeDash: HIDDEN,
    textBeforeEnd: HIDDEN,
    end: ["NumericLiteral"],
    textBeforeColon: HIDDEN,
    textBeforeLabel: HIDDEN,
    label: ["StringLiteral"],
    textAfter: HIDDEN,
  },
  PacketSingleBlockStatement: {
    start: ["NumericLiteral"],
    textBeforeColon: HIDDEN,
    textBeforeLabel: HIDDEN,
    label: ["StringLiteral"],
    textAfter: HIDDEN,
  },
  PacketRelativeBlockStatement: {
    textBeforeCount: HIDDEN,
    count: ["NumericLiteral"],
    textBeforeColon: HIDDEN,
    textBeforeLabel: HIDDEN,
    label: ["StringLiteral"],
    textAfter: HIDDEN,
  },
  PacketTitleStatement: { value: ["PacketLiteral"], textAfter: HIDDEN },
  PacketAccTitleStatement: { value: ["PacketLiteral"], textAfter: HIDDEN },
  PacketAccDescrStatement: { value: ["PacketLiteral"], textAfter: HIDDEN },
  PacketAccDescrBlockStatement: { value: ["PacketLiteral"], textAfter: HIDDEN },
}

/** ast/packet.md: the two complete retained forms. */
export const PACKET_FIELD_WORDS: FieldTable<readonly string[]> = {
  PacketIgnoredText: { kind: ["yaml-block", "directive"] },
}

/** The zero branch ends immediately; a nonzero integer can shorten before a dot. */
function integerEnd(text: string): number {
  if (text.startsWith("0")) return 1
  if (!isDigit(text.charCodeAt(0))) return 0
  let end = 1
  while (isDigit(text.charCodeAt(end))) end++
  while (end > 0 && text.charAt(end) === ".") end--
  return end
}

/** Shared leaves must be complete units in packet's ordered rules. */
function checkLeaf(reading: Reading, node: CheckedNode): void {
  const value = reading.converted.of(node.range)
  if (node.type === "NumericLiteral") {
    reading.problems.expect(
      value.length > 0 &&
        integerEnd(following(reading, node.range[0])) === value.length &&
        [...value].every((character) => isDigit(character.charCodeAt(0))),
      label(node),
      "the value is not one unsigned-integer lexical unit",
    )
    checkTokenKinds(reading, node, ["Numeric"], "an unsigned integer")
  } else if (node.type === "StringLiteral")
    reading.problems.expect(
      node.closed === true && stringSpelling(value),
      label(node),
      "the value is not a complete closed STRING lexical unit",
    )
}

/** Written operators and the form-specific gaps, with no visible LF between components. */
function checkBlock(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  checkStatementNode(reading, node, ["+", "-", ":"])
  const relative = node.type === "PacketRelativeBlockStatement"
  const range = node.type === "PacketRangeBlockStatement"
  reading.problems.expectEqual(
    own.tokens.map((token) => token.value),
    relative ? ["+", ":"] : range ? ["-", ":"] : [":"],
    label(node),
    "the block's authored operators",
  )
  const first = childOf(node, relative ? "count" : "start")
  const end = range ? childOf(node, "end") : first
  const labelNode = childOf(node, "label")
  const colon = own.tokens.at(-1)
  if (
    first === null ||
    end === null ||
    labelNode === null ||
    colon === undefined
  )
    return
  if (relative) {
    const plus = own.tokens[0]
    if (plus !== undefined)
      checkHiddenGap(
        reading,
        node,
        "textBeforeCount",
        plus.range[1],
        first.range[0],
      )
  } else checkGap(reading, node, node.range[0], first.range[0], false)
  if (range) {
    const dash = own.tokens[0]
    if (dash !== undefined) {
      reading.problems.expect(
        yamlEnd(following(reading, dash.range[0])) === undefined,
        label(dash),
        "the range dash yields to a complete hidden YAML match",
      )
      checkHiddenGap(
        reading,
        node,
        "textBeforeDash",
        first.range[1],
        dash.range[0],
      )
      checkHiddenGap(
        reading,
        node,
        "textBeforeEnd",
        dash.range[1],
        end.range[0],
      )
    }
  }
  checkHiddenGap(reading, node, "textBeforeColon", end.range[1], colon.range[0])
  checkHiddenGap(
    reading,
    node,
    "textBeforeLabel",
    colon.range[1],
    labelNode.range[0],
  )
  checkHiddenGap(reading, node, "textAfter", labelNode.range[1], node.range[1])
}

/** Only the plain header needs the common whitespace/percent-pair boundary. */
function checkDiagram(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const header = own.tokens[0]
  reading.problems.expect(
    own.tokens.length === 1 &&
      (header?.value === "packet" || header?.value === "packet-beta"),
    label(node),
    "the written header must be packet or packet-beta",
  )
  if (header === undefined) return
  if (header.value === "packet") {
    const tail = following(reading, header.range[1])
    reading.problems.expect(
      boundary(tail, 0) || tail.startsWith("%%"),
      label(header),
      "the packet keyword has no whitespace, EOF or percent-pair boundary",
    )
  }
  checkNativeComments(reading, header.range[1])
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
  checkStatementBody(reading, node, header.range[1])
}

/** Tree conditions only; semantic acceptance is checked through fixture result records. */
export function checkPacketTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  checkTokensInValueNodes(root, problems)
  walkNodes(root, (node) => {
    checkChildTypes(reading, node, PACKET_CHILD_TYPES)
    checkFieldWords(reading, node, PACKET_FIELD_WORDS)
    checkLeaf(reading, node)
    if (!node.type.startsWith("Packet")) return
    if (BLOCKS.includes(node.type)) {
      checkBlock(reading, node)
      return
    }
    checkStatementNode(reading, node)
    if (node.type === "PacketDiagram") checkDiagram(reading, node)
    else if (node.type === "PacketIgnoredText") checkIgnored(reading, node)
    else if (COMMON.includes(node.type)) checkCommon(reading, node)
  })
}
