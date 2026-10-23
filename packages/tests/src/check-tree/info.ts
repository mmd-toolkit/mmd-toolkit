import { checkChildTypes, checkFieldWords } from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import {
  boundary,
  following,
  checkCommon,
  checkHiddenGap,
  checkIgnored,
  checkStatementBody,
  checkStatementNode,
  checkNativeComments,
  checkPreheader,
} from "./common-statement-checks.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import { entriesOf, ownOf, readingOf } from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { walkNodes } from "./walk.ts"

const HIDDEN = ["InfoIgnoredText"]
const COMMON = [
  "InfoTitleStatement",
  "InfoAccTitleStatement",
  "InfoAccDescrStatement",
  "InfoAccDescrBlockStatement",
]

/** ast/info.md: child fields in visitor order. */
export const INFO_CHILD_TYPES: FieldTable<readonly string[]> = {
  InfoDiagram: {
    textBeforeHeader: HIDDEN,
    textBeforeShowInfo: HIDDEN,
    body: [...COMMON, ...HIDDEN],
  },
  InfoTitleStatement: { value: ["InfoLiteral"], textAfter: HIDDEN },
  InfoAccTitleStatement: { value: ["InfoLiteral"], textAfter: HIDDEN },
  InfoAccDescrStatement: { value: ["InfoLiteral"], textAfter: HIDDEN },
  InfoAccDescrBlockStatement: { value: ["InfoLiteral"], textAfter: HIDDEN },
}

/** ast/info.md: each ignored form has one explicit kind. */
export const INFO_FIELD_WORDS: FieldTable<readonly string[]> = {
  InfoIgnoredText: { kind: ["yaml-block", "directive"] },
}

/** The written header and flag precede all common forms; the flag gap permits visible LF. */
function checkDiagram(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  reading.problems.expectEqual(
    own.tokens.map((token) => token.value),
    node.showInfo === true ? ["info", "showInfo"] : ["info"],
    label(node),
    "the header and showInfo flag",
  )
  const header = own.tokens[0]
  if (header === undefined) return
  checkNativeComments(reading, header.range[1])
  for (const token of own.tokens) {
    const tail = following(reading, token.range[1])
    reading.problems.expect(
      boundary(tail, 0) || tail.startsWith("%%"),
      label(token),
      "the info/showInfo keyword has no whitespace, EOF or percent-pair boundary",
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
  if (node.showInfo === true && flag !== undefined)
    checkHiddenGap(
      reading,
      node,
      "textBeforeShowInfo",
      header.range[1],
      flag.range[0],
      true,
    )
  else
    reading.problems.expect(
      entriesOf(node, "textBeforeShowInfo").length === 0,
      label(node),
      "textBeforeShowInfo must be empty without showInfo",
    )
  checkStatementBody(reading, node, flag?.range[1] ?? header.range[1])
}

/** ast/info.md and diagrams/info.md: complete lexical values, named owners and surviving EOL. */
export function checkInfoTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  checkTokensInValueNodes(root, problems)
  walkNodes(root, (node) => {
    checkChildTypes(reading, node, INFO_CHILD_TYPES)
    checkFieldWords(reading, node, INFO_FIELD_WORDS)
    if (!node.type.startsWith("Info")) return
    checkStatementNode(reading, node)
    if (node.type === "InfoDiagram") checkDiagram(reading, node)
    else if (node.type === "InfoIgnoredText") checkIgnored(reading, node)
    else if (COMMON.includes(node.type)) checkCommon(reading, node)
  })
}
