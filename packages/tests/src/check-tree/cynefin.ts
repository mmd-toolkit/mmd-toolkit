import {
  boundary,
  checkCommon,
  checkEnd,
  checkGap,
  checkHiddenGap,
  checkIgnored,
  checkNativeComments,
  checkPreheader,
  checkStatementNode,
  following,
  stringSpelling,
} from "./common-statement-checks.ts"
import { checkChildTypes, checkFieldWords } from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  childOf,
  entriesOf,
  ownOf,
  readingOf,
  checkTokenKinds,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { walkNodes } from "./walk.ts"

const HIDDEN = ["CynefinIgnoredText"]
const COMMON = [
  "CynefinTitleStatement",
  "CynefinAccTitleStatement",
  "CynefinAccDescrStatement",
  "CynefinAccDescrBlockStatement",
]
const DOMAINS = ["complex", "complicated", "clear", "chaotic", "confusion"]

/** ast/cynefin.md: all authored children in their specified visitor order. */
export const CYNEFIN_CHILD_TYPES: FieldTable<readonly string[]> = {
  CynefinDiagram: {
    textBeforeHeader: HIDDEN,
    body: [
      "CynefinDomainStatement",
      "CynefinTransitionStatement",
      ...COMMON,
      ...HIDDEN,
    ],
  },
  CynefinDomainStatement: {
    textAfterName: HIDDEN,
    items: ["CynefinDomainItem"],
  },
  CynefinDomainItem: {
    textBefore: HIDDEN,
    label: ["StringLiteral"],
    textAfter: HIDDEN,
  },
  CynefinTransitionStatement: {
    textBeforeArrow: HIDDEN,
    arrow: ["CynefinArrow"],
    textBeforeTo: HIDDEN,
    textBeforeColon: HIDDEN,
    textBeforeLabel: HIDDEN,
    label: ["StringLiteral"],
    textAfter: HIDDEN,
  },
  CynefinTitleStatement: { value: ["CynefinLiteral"], textAfter: HIDDEN },
  CynefinAccTitleStatement: { value: ["CynefinLiteral"], textAfter: HIDDEN },
  CynefinAccDescrStatement: { value: ["CynefinLiteral"], textAfter: HIDDEN },
  CynefinAccDescrBlockStatement: {
    value: ["CynefinLiteral"],
    textAfter: HIDDEN,
  },
}

/** Fixed strings are checked both for membership and against authored components. */
export const CYNEFIN_FIELD_WORDS: FieldTable<readonly string[]> = {
  CynefinDomainStatement: { name: DOMAINS },
  CynefinTransitionStatement: { from: DOMAINS, to: DOMAINS },
  CynefinArrow: {
    startMarker: ["none"],
    line: ["solid"],
    endMarker: ["arrow"],
  },
  CynefinIgnoredText: { kind: ["yaml-block", "directive"] },
}

/** The last native match, whose consumed LF can fall outside the enclosing range. */
function lastHidden(
  node: CheckedNode,
  field = "textAfter",
): CheckedNode | null {
  return entriesOf(node, field).at(-1) ?? null
}

/** A domain ends at its last item or immediate name suffix; neither requires EOL. */
function domainSuffix(node: CheckedNode): CheckedNode | null {
  const item = entriesOf(node, "items").at(-1)
  return item === undefined || item === null
    ? lastHidden(node, "textAfterName")
    : lastHidden(item)
}

/** A quoted item has its own leading and trailing hidden matches, never outer padding. */
function checkItem(reading: Reading, node: CheckedNode): void {
  const value = childOf(node, "label")
  if (value === null) return
  checkHiddenGap(
    reading,
    node,
    "textBefore",
    node.range[0],
    value.range[0],
    true,
  )
  checkHiddenGap(reading, node, "textAfter", value.range[1], node.range[1])
  reading.problems.expect(
    ownOf(reading.root, node).tokens.length === 0,
    label(node),
    "an item writes only its label and named hidden forms",
  )
}

/** Visible LF separates immediate suffix ownership from the next actual item's leading forms. */
function checkDomain(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const word = own.tokens[0]
  reading.problems.expect(
    own.tokens.length === 1 &&
      word?.type === "Keyword" &&
      DOMAINS.includes(word.value),
    label(node),
    "a domain writes exactly one complete fixed domain word",
  )
  if (word === undefined) return
  reading.problems.expectEqual(
    node.name,
    word.value,
    label(node),
    "the written domain name",
  )
  const suffix = lastHidden(node, "textAfterName")
  let end = suffix?.range[1] ?? word.range[1]
  checkHiddenGap(reading, node, "textAfterName", word.range[1], end)
  let previous = suffix
  for (const item of entriesOf(node, "items")) {
    if (item === null) continue
    const visible = checkGap(reading, node, end, item.range[0], true, previous)
    if (entriesOf(item, "textBefore").length > 0)
      reading.problems.expect(
        visible.includes("\n"),
        label(item),
        "item-leading hidden forms require a preceding visible LF",
      )
    end = item.range[1]
    previous = lastHidden(item)
  }
  reading.problems.expect(
    end === node.range[1],
    label(node),
    "the domain ends at its name suffix or last authored item",
  )
}

/** Check the supplied transition's components and hidden lists, without deciding acceptance. */
function checkTransition(reading: Reading, node: CheckedNode): void {
  const tokens = ownOf(reading.root, node).tokens
  let index = 0
  let end = node.range[0]

  /** A named gap contains exactly its whole hidden matches and ASCII padding. */
  function before(next: number, field?: string): void {
    if (field === undefined) checkGap(reading, node, end, next, false)
    else checkHiddenGap(reading, node, field, end, next)
  }

  /** Fixed words and punctuation stay whole tokens with their original case. */
  function token(expected: readonly string[], gapField?: string): string {
    const part = tokens[index++]
    reading.problems.expect(
      part !== undefined && expected.includes(part.value),
      label(node),
      `the authored component must be ${expected.join(" or ")}`,
    )
    if (part === undefined) return ""
    before(part.range[0], gapField)
    end = part.range[1]
    return part.value
  }

  /** The supplied arrow and string keep their independent ranges. */
  function child(field: string, gapField: string): void {
    const part = childOf(node, field)
    if (part === null) return
    before(part.range[0], gapField)
    end = part.range[1]
  }

  const from = token(DOMAINS)
  reading.problems.expectEqual(
    node.from,
    from,
    label(node),
    "the written from domain",
  )
  child("arrow", "textBeforeArrow")
  const to = token(DOMAINS, "textBeforeTo")
  reading.problems.expectEqual(
    node.to,
    to,
    label(node),
    "the written to domain",
  )
  if (childOf(node, "label") !== null) {
    token([":"], "textBeforeColon")
    child("label", "textBeforeLabel")
  } else {
    for (const field of ["textBeforeColon", "textBeforeLabel"])
      reading.problems.expect(
        entriesOf(node, field).length === 0,
        label(node),
        `the absent label's ${field} gap must be empty`,
      )
  }
  reading.problems.expect(
    index === tokens.length,
    label(node),
    "unexpected transition components remain",
  )
  checkHiddenGap(reading, node, "textAfter", end, node.range[1])
}

/** Only common statements and transitions require surviving EOL; domain body forms need visible LF. */
function checkBody(reading: Reading, node: CheckedNode, from: number): void {
  let end = from
  let previous: CheckedNode | null = null
  for (const item of entriesOf(node, "body")) {
    if (item === null) continue
    if (
      previous !== null &&
      (COMMON.includes(previous.type) ||
        previous.type === "CynefinTransitionStatement")
    )
      checkEnd(reading, previous, item.range[0])
    else {
      const suffix =
        previous?.type === "CynefinDomainStatement"
          ? domainSuffix(previous)
          : previous?.type === "CynefinIgnoredText"
            ? previous
            : null
      const visible = checkGap(reading, node, end, item.range[0], true, suffix)
      if (
        previous?.type === "CynefinDomainStatement" &&
        item.type === "CynefinIgnoredText"
      )
        reading.problems.expect(
          visible.includes("\n"),
          label(item),
          "a body-owned hidden form after a domain requires visible LF",
        )
    }
    end = item.range[1]
    previous = item
  }
  if (
    previous !== null &&
    (COMMON.includes(previous.type) ||
      previous.type === "CynefinTransitionStatement")
  )
    checkEnd(reading, previous, reading.text.length)
  else
    checkGap(
      reading,
      node,
      end,
      reading.text.length,
      true,
      previous?.type === "CynefinDomainStatement"
        ? domainSuffix(previous)
        : previous?.type === "CynefinIgnoredText"
          ? previous
          : null,
    )
}

/** The colon header is one lexical form with separate authored word/colon tokens. */
function checkDiagram(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const header = own.tokens[0]
  const colon = own.tokens[1]
  reading.problems.expect(
    header?.value === "cynefin-beta" &&
      (own.tokens.length === 1 ||
        (own.tokens.length === 2 && colon?.value === ":")),
    label(node),
    "the written header must be cynefin-beta with at most one attached colon",
  )
  if (header === undefined) return
  if (colon !== undefined)
    reading.problems.expect(
      reading.converted.of([header.range[1], colon.range[0]]) === "",
      label(node),
      "the header word and colon must be adjacent after common removals",
    )
  else {
    const tail = following(reading, header.range[1])
    reading.problems.expect(
      boundary(tail, 0) || tail.startsWith("%%"),
      label(header),
      "the bare header has no whitespace, EOF or percent-pair boundary",
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
  checkNativeComments(reading, header.range[1])
  walkNodes(reading.root, (candidate) => {
    if (candidate.type !== "CynefinIgnoredText") return
    for (const comment of reading.root.comments)
      if (!reading.written.isLeftOut(comment.range[0]))
        reading.problems.expect(
          comment.range[0] < candidate.range[0] ||
            comment.range[0] >= candidate.range[1],
          label(comment),
          "a native Comment cannot start inside an earlier hidden form",
        )
  })
  checkBody(reading, node, colon?.range[1] ?? header.range[1])
}

/** Tree fields, lexical units and hidden ownership; fixture acceptance is checked separately. */
export function checkCynefinTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  checkTokensInValueNodes(root, problems)
  walkNodes(root, (node) => {
    checkChildTypes(reading, node, CYNEFIN_CHILD_TYPES)
    checkFieldWords(reading, node, CYNEFIN_FIELD_WORDS)
    if (node.type === "StringLiteral")
      problems.expect(
        node.closed === true &&
          stringSpelling(reading.converted.of(node.range)),
        label(node),
        "the value is not a complete closed STRING lexical unit",
      )
    if (!node.type.startsWith("Cynefin")) return
    checkStatementNode(reading, node, [":", "{", "}", "-->"])
    if (node.type === "CynefinDiagram") checkDiagram(reading, node)
    else if (node.type === "CynefinDomainStatement") checkDomain(reading, node)
    else if (node.type === "CynefinDomainItem") checkItem(reading, node)
    else if (node.type === "CynefinTransitionStatement")
      checkTransition(reading, node)
    else if (COMMON.includes(node.type)) checkCommon(reading, node)
    else if (node.type === "CynefinArrow") {
      problems.expect(
        ownOf(root, node).text === "-->" && node.value === "-->",
        label(node),
        "the arrow value must be the whole authored -->",
      )
      checkTokenKinds(reading, node, ["Punctuator"], "a cynefin arrow")
    } else if (node.type === "CynefinIgnoredText") {
      problems.expect(
        reading.written
          .of(node.range)
          .startsWith(node.kind === "yaml-block" ? "---" : "%%{"),
        label(node),
        "a retained form starts at its authored opener, without preceding padding",
      )
      checkIgnored(reading, node)
    }
  })
}
