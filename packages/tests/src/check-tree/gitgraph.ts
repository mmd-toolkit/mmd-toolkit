import {
  isDigit,
  isWhitespace,
  isWordCharacter,
} from "../db-from-tree/characters.ts"
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
  stringSpelling,
} from "./common-statement-checks.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  childOf,
  entriesOf,
  ownOf,
  readingOf,
  textOf,
  checkTokenKinds,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import type { CheckedNode, CheckedRoot, CheckedToken } from "./types.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import { walkNodes } from "./walk.ts"

const HIDDEN = ["GitgraphIgnoredText"]
const REFERENCE = ["Identifier", "StringLiteral"]
const COMMON = [
  "GitgraphTitleStatement",
  "GitgraphAccTitleStatement",
  "GitgraphAccDescrStatement",
  "GitgraphAccDescrBlockStatement",
]
const COMMIT_OPTIONS = [
  "GitgraphIdOption",
  "GitgraphMessageOption",
  "GitgraphTagOption",
  "GitgraphTypeOption",
]
const MERGE_OPTIONS = [
  "GitgraphIdOption",
  "GitgraphTagOption",
  "GitgraphTypeOption",
]
const PICK_OPTIONS = [
  "GitgraphIdOption",
  "GitgraphParentOption",
  "GitgraphTagOption",
]

/** ast/gitgraph.md: every child field, in its specified order. */
export const GITGRAPH_CHILD_TYPES: FieldTable<readonly string[]> = {
  GitgraphDiagram: {
    textBeforeHeader: HIDDEN,
    textBeforeDirection: HIDDEN,
    textBeforeColon: HIDDEN,
    body: [
      "GitgraphCommitStatement",
      "GitgraphBranchStatement",
      "GitgraphCheckoutStatement",
      "GitgraphMergeStatement",
      "GitgraphCherryPickStatement",
      ...COMMON,
      ...HIDDEN,
    ],
  },
  GitgraphCommitStatement: { options: COMMIT_OPTIONS, textAfter: HIDDEN },
  GitgraphBranchStatement: {
    textBeforeName: HIDDEN,
    name: REFERENCE,
    order: ["GitgraphOrderOption"],
    textAfter: HIDDEN,
  },
  GitgraphCheckoutStatement: {
    textBeforeBranch: HIDDEN,
    branch: REFERENCE,
    textAfter: HIDDEN,
  },
  GitgraphMergeStatement: {
    textBeforeBranch: HIDDEN,
    branch: REFERENCE,
    options: MERGE_OPTIONS,
    textAfter: HIDDEN,
  },
  GitgraphCherryPickStatement: { options: PICK_OPTIONS, textAfter: HIDDEN },
  GitgraphIdOption: {
    textBefore: HIDDEN,
    textBeforeValue: HIDDEN,
    value: ["StringLiteral"],
  },
  GitgraphMessageOption: {
    textBefore: HIDDEN,
    textBeforeValue: HIDDEN,
    value: ["StringLiteral"],
  },
  GitgraphTagOption: {
    textBefore: HIDDEN,
    textBeforeValue: HIDDEN,
    value: ["StringLiteral"],
  },
  GitgraphTypeOption: { textBefore: HIDDEN, textBeforeValue: HIDDEN },
  GitgraphParentOption: {
    textBefore: HIDDEN,
    textBeforeValue: HIDDEN,
    value: ["StringLiteral"],
  },
  GitgraphOrderOption: {
    textBefore: HIDDEN,
    textBeforeValue: HIDDEN,
    value: ["NumericLiteral"],
  },
  GitgraphTitleStatement: { value: ["GitgraphLiteral"], textAfter: HIDDEN },
  GitgraphAccTitleStatement: { value: ["GitgraphLiteral"], textAfter: HIDDEN },
  GitgraphAccDescrStatement: { value: ["GitgraphLiteral"], textAfter: HIDDEN },
  GitgraphAccDescrBlockStatement: {
    value: ["GitgraphLiteral"],
    textAfter: HIDDEN,
  },
}

/** Fixed scalar words; nullable direction and message introducer are checked against components. */
export const GITGRAPH_FIELD_WORDS: FieldTable<readonly string[]> = {
  GitgraphCheckoutStatement: { keyword: ["checkout", "switch"] },
  GitgraphTypeOption: { value: ["NORMAL", "REVERSE", "HIGHLIGHT"] },
  GitgraphIgnoredText: { kind: ["yaml-block", "directive"] },
}

/** diagrams/gitgraph.md, Numbers and references: the longest complete reference. */
function referenceEnd(text: string): number {
  if (!isWordCharacter(text.charCodeAt(0))) return 0
  let end = 1
  for (let at = 1; at < text.length; at++) {
    const character = text.charAt(at)
    if (isWordCharacter(text.charCodeAt(at)) || character === "-") end = at + 1
    else if (character !== "." && character !== "/") break
  }
  return end
}

/** The earlier integer rule may backtrack before a dot; its zero branch has no dot test. */
function integerEnd(text: string): number {
  if (text.startsWith("0")) return 1
  if (!isDigit(text.charCodeAt(0))) return 0
  let end = 1
  while (isDigit(text.charCodeAt(end))) end++
  while (end > 0 && text.charAt(end) === ".") end--
  return end
}

/** A keyword yields only to a strictly longer reference, except the bounded header word. */
function checkKeyword(reading: Reading, token: CheckedToken): void {
  const tail = following(reading, token.range[0])
  reading.problems.expect(
    referenceEnd(tail) <= token.value.length,
    label(token),
    "a longer bare-reference match takes this keyword",
  )
}

/** Complete shared leaves at their actual lexical priority. */
function checkLeaf(reading: Reading, node: CheckedNode): void {
  const value = reading.converted.of(node.range)
  if (node.type === "StringLiteral") {
    reading.problems.expect(
      node.closed === true && stringSpelling(value),
      label(node),
      "the value is not a complete closed STRING lexical unit",
    )
  } else if (node.type === "NumericLiteral") {
    reading.problems.expect(
      value.length > 0 &&
        integerEnd(following(reading, node.range[0])) === value.length &&
        [...value].every((character) => isDigit(character.charCodeAt(0))),
      label(node),
      "the value is not one unsigned-integer lexical unit",
    )
    checkTokenKinds(reading, node, ["Numeric"], "an unsigned integer")
  } else if (node.type === "Identifier") {
    const tail = following(reading, node.range[0])
    const reserved = [
      "gitGraph",
      "cherry-pick",
      "HIGHLIGHT",
      "checkout",
      "REVERSE",
      "commit",
      "NORMAL",
      "branch",
      "switch",
      "merge",
      "LR",
      "TB",
      "BT",
    ]
    let afterTitle = "accTitle".length
    while (tail.charAt(afterTitle) === " " || tail.charAt(afterTitle) === "\t")
      afterTitle++
    let afterDescr = "accDescr".length
    while (tail.charAt(afterDescr) === " " || tail.charAt(afterDescr) === "\t")
      afterDescr++
    let brace = "accDescr".length
    while (isWhitespace(tail.charCodeAt(brace))) brace++
    const earlierCommon =
      tail.startsWith("title") ||
      (tail.startsWith("accTitle") && tail.charAt(afterTitle) === ":") ||
      (tail.startsWith("accDescr") &&
        (tail.charAt(afterDescr) === ":" || tail.charAt(brace) === "{"))
    reading.problems.expect(
      value.length > 0 &&
        referenceEnd(tail) === value.length &&
        integerEnd(tail) === 0 &&
        !reserved.includes(value) &&
        !earlierCommon,
      label(node),
      "the name is not one bare-reference lexical unit after earlier rules",
    )
    checkTokenKinds(reading, node, ["Identifier"], "a bare reference")
  }
}

/** Each option owns its prefix forms and its value gap; introducer word/colon has no native gap. */
function checkOption(reading: Reading, node: CheckedNode, from: number): void {
  const own = ownOf(reading.root, node)
  const bare = node.type === "GitgraphMessageOption" && node.keyword === null
  const word =
    node.type === "GitgraphIdOption"
      ? "id"
      : node.type === "GitgraphMessageOption"
        ? "msg"
        : node.type === "GitgraphTagOption"
          ? "tag"
          : node.type === "GitgraphTypeOption"
            ? "type"
            : node.type === "GitgraphParentOption"
              ? "parent"
              : "order"
  const type = node.type === "GitgraphTypeOption"
  reading.problems.expectEqual(
    own.tokens.map((token) => token.value),
    bare ? [] : type ? [word, ":", textOf(node)] : [word, ":"],
    label(node),
    "the option's authored components",
  )
  const value = childOf(node, "value")
  const valueStart = type ? own.tokens.at(-1)?.range[0] : value?.range[0]
  const valueEnd = type ? own.tokens.at(-1)?.range[1] : value?.range[1]
  if (valueStart === undefined || valueEnd === undefined) return
  checkHiddenGap(
    reading,
    node,
    "textBefore",
    from,
    bare ? valueStart : (own.tokens[0]?.range[0] ?? valueStart),
  )
  if (bare)
    reading.problems.expect(
      entriesOf(node, "textBeforeValue").length === 0,
      label(node),
      "a bare message has no textBeforeValue",
    )
  else {
    const keyword = own.tokens[0]
    const colon = own.tokens[1]
    if (keyword !== undefined && colon !== undefined) {
      reading.problems.expect(
        reading.converted.of([keyword.range[1], colon.range[0]]) === "",
        label(node),
        "the option word and colon must be contiguous after common removal",
      )
      checkHiddenGap(
        reading,
        node,
        "textBeforeValue",
        colon.range[1],
        valueStart,
      )
    }
    if (node.type === "GitgraphMessageOption")
      reading.problems.expect(
        node.keyword === "msg",
        label(node),
        "the message keyword must be msg or null for a bare string",
      )
  }
  if (type) {
    const token = own.tokens.at(-1)
    if (token !== undefined) checkKeyword(reading, token)
  }
  reading.problems.expect(
    node.range[1] === valueEnd,
    label(node),
    "an option ends at its complete value",
  )
}

/** Statement components have no visible LF; trailing hidden forms belong to textAfter. */
function checkStatement(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const word =
    node.type === "GitgraphCommitStatement"
      ? "commit"
      : node.type === "GitgraphBranchStatement"
        ? "branch"
        : node.type === "GitgraphCheckoutStatement"
          ? textOf(node, "keyword")
          : node.type === "GitgraphMergeStatement"
            ? "merge"
            : "cherry-pick"
  reading.problems.expectEqual(
    own.tokens.map((token) => token.value),
    [word],
    label(node),
    "the statement keyword",
  )
  const keyword = own.tokens[0]
  if (keyword === undefined) return
  checkKeyword(reading, keyword)
  let end = keyword.range[1]
  const name = childOf(
    node,
    node.type === "GitgraphBranchStatement" ? "name" : "branch",
  )
  if (name !== null) {
    checkHiddenGap(
      reading,
      node,
      node.type === "GitgraphBranchStatement"
        ? "textBeforeName"
        : "textBeforeBranch",
      end,
      name.range[0],
    )
    end = name.range[1]
  }
  const options =
    node.type === "GitgraphBranchStatement"
      ? [childOf(node, "order")]
      : entriesOf(node, "options")
  for (const option of options) {
    if (option === null) continue
    checkOption(reading, option, end)
    end = option.range[1]
  }
  checkHiddenGap(reading, node, "textAfter", end, node.range[1])
}

/** Header components distinguish joined colon from the bounded separate header word. */
function checkDiagram(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const header = own.tokens[0]
  if (header === undefined) return
  const direction = node.direction
  reading.problems.expect(
    direction === null ||
      ["LR", "TB", "BT"].includes(textOf(node, "direction")),
    label(node),
    "the written direction is LR, TB, BT or null",
  )
  const colon = own.tokens.find((token) => token.value === ":")
  reading.problems.expectEqual(
    own.tokens.map((token) => token.value),
    direction === null
      ? colon === undefined
        ? ["gitGraph"]
        : ["gitGraph", ":"]
      : ["gitGraph", direction, ":"],
    label(node),
    "the header, direction and colon",
  )
  const joined =
    direction === null &&
    colon !== undefined &&
    reading.converted.of([header.range[1], colon.range[0]]) === ""
  if (!joined) {
    const tail = following(reading, header.range[1])
    reading.problems.expect(
      boundary(tail, 0) || tail.startsWith("%%"),
      label(header),
      "the separate gitGraph keyword has no whitespace, EOF or percent-pair boundary",
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
  let end = header.range[1]
  if (direction !== null) {
    const token = own.tokens[1]
    if (token !== undefined) {
      checkKeyword(reading, token)
      checkHiddenGap(reading, node, "textBeforeDirection", end, token.range[0])
      end = token.range[1]
    }
  } else
    reading.problems.expect(
      entriesOf(node, "textBeforeDirection").length === 0,
      label(node),
      "textBeforeDirection must be empty without direction",
    )
  if (colon !== undefined) {
    checkHiddenGap(reading, node, "textBeforeColon", end, colon.range[0])
    end = colon.range[1]
  } else
    reading.problems.expect(
      entriesOf(node, "textBeforeColon").length === 0,
      label(node),
      "textBeforeColon must be empty without a separated colon",
    )
  checkStatementBody(reading, node, end)
}

/** Complete lexical units and AST invariants of an accepted gitgraph tree. */
export function checkGitgraphTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  checkTokensInValueNodes(root, problems)
  walkNodes(root, (node) => {
    checkChildTypes(reading, node, GITGRAPH_CHILD_TYPES)
    checkFieldWords(reading, node, GITGRAPH_FIELD_WORDS)
    checkLeaf(reading, node)
    if (!node.type.startsWith("Gitgraph")) return
    checkStatementNode(reading, node)
    if (node.type === "GitgraphDiagram") checkDiagram(reading, node)
    else if (node.type === "GitgraphIgnoredText") checkIgnored(reading, node)
    else if (COMMON.includes(node.type)) checkCommon(reading, node)
    else if (node.type.endsWith("Statement")) checkStatement(reading, node)
  })
}
