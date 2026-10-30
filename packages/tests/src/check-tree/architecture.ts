import { isWordCharacter, isWhitespace } from "../db-from-tree/characters.ts"
import {
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
  entriesOf,
  ownOf,
  readingOf,
  checkTokenKinds,
  checkRangeIsHull,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes, nodeTokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { walkNodes } from "./walk.ts"

const HIDDEN = ["ArchitectureIgnoredText"]
const COMMON = [
  "ArchitectureTitleStatement",
  "ArchitectureAccTitleStatement",
  "ArchitectureAccDescrStatement",
  "ArchitectureAccDescrBlockStatement",
]
const DECLARATIONS = [
  "ArchitectureGroupStatement",
  "ArchitectureServiceStatement",
  "ArchitectureJunctionStatement",
]
const WORDS = [
  "architecture-beta",
  "junction",
  "service",
  "column",
  "group",
  "align",
  "row",
  "in",
]
/** The authored component punctuation, with double dash as one indivisible unit. */
export const ARCHITECTURE_PUNCTUATORS: readonly string[] = [
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  ":",
  "--",
  "-",
  "<",
  ">",
]

/** ast/architecture.md: every child field in visitor order. */
export const ARCHITECTURE_CHILD_TYPES: FieldTable<readonly string[]> = {
  ArchitectureDiagram: {
    textBeforeHeader: HIDDEN,
    body: [
      ...DECLARATIONS,
      "ArchitectureEdgeStatement",
      "ArchitectureAlignmentStatement",
      ...COMMON,
      ...HIDDEN,
    ],
  },
  ArchitectureGroupStatement: {
    textBeforeId: HIDDEN,
    id: ["Identifier"],
    textBeforeIcon: HIDDEN,
    icon: ["Identifier"],
    textBeforeTitle: HIDDEN,
    title: ["ArchitectureLabel"],
    textBeforeIn: HIDDEN,
    textBeforeParent: HIDDEN,
    in: ["Identifier"],
    textAfter: HIDDEN,
  },
  ArchitectureServiceStatement: {
    textBeforeId: HIDDEN,
    id: ["Identifier"],
    textBeforeIcon: HIDDEN,
    icon: ["Identifier", "StringLiteral"],
    textBeforeTitle: HIDDEN,
    title: ["ArchitectureLabel"],
    textBeforeIn: HIDDEN,
    textBeforeParent: HIDDEN,
    in: ["Identifier"],
    textAfter: HIDDEN,
  },
  ArchitectureJunctionStatement: {
    textBeforeId: HIDDEN,
    id: ["Identifier"],
    textBeforeIn: HIDDEN,
    textBeforeParent: HIDDEN,
    in: ["Identifier"],
    textAfter: HIDDEN,
  },
  ArchitectureEdgeStatement: {
    lhsId: ["Identifier"],
    textBeforeLhsGroup: HIDDEN,
    textBeforeArrow: HIDDEN,
    arrow: ["ArchitectureArrow"],
    textBeforeRhsId: HIDDEN,
    rhsId: ["Identifier"],
    textBeforeRhsGroup: HIDDEN,
    textAfter: HIDDEN,
  },
  ArchitectureArrow: {
    textBeforeStartDirection: HIDDEN,
    textBeforeStartMarker: HIDDEN,
    textBeforeLine: HIDDEN,
    textBeforeTitle: HIDDEN,
    title: ["ArchitectureLabel"],
    textBeforeEndDash: HIDDEN,
    textBeforeEndMarker: HIDDEN,
    textBeforeEndDirection: HIDDEN,
    textBeforeEndColon: HIDDEN,
  },
  ArchitectureAlignmentStatement: {
    textBeforeDirection: HIDDEN,
    members: ["ArchitectureAlignmentMember"],
    textAfter: HIDDEN,
  },
  ArchitectureAlignmentMember: { textBeforeId: HIDDEN, id: ["Identifier"] },
  ArchitectureTitleStatement: {
    value: ["ArchitectureLiteral"],
    textAfter: HIDDEN,
  },
  ArchitectureAccTitleStatement: {
    value: ["ArchitectureLiteral"],
    textAfter: HIDDEN,
  },
  ArchitectureAccDescrStatement: {
    value: ["ArchitectureLiteral"],
    textAfter: HIDDEN,
  },
  ArchitectureAccDescrBlockStatement: {
    value: ["ArchitectureLiteral"],
    textAfter: HIDDEN,
  },
}

/** The finite authored choices; their spelling is independently checked below. */
export const ARCHITECTURE_FIELD_WORDS: FieldTable<readonly string[]> = {
  ArchitectureLabel: { kind: ["text", "string"] },
  ArchitectureIgnoredText: { kind: ["yaml-block", "directive"] },
  ArchitectureArrow: {
    startDirection: ["L", "R", "T", "B"],
    startMarker: ["none", "arrow"],
    line: ["solid"],
    endMarker: ["none", "arrow"],
    endDirection: ["L", "R", "T", "B"],
  },
  ArchitectureAlignmentStatement: { direction: ["row", "column"] },
}

/** IDs are maximal word/dash runs whose last character is a word character. */
function idEnd(text: string): number {
  if (!isWordCharacter(text.charCodeAt(0))) return 0
  let at = 1
  while (isWordCharacter(text.charCodeAt(at)) || text.charAt(at) === "-") at++
  while (text.charAt(at - 1) === "-") at--
  return at
}

/** Complete strings, then nonempty bare text, in the label's first-match order. */
function labelMatch(text: string): { end: number; kind: string } | null {
  if (!text.startsWith("[")) return null
  for (const quote of ['"', "'"]) {
    if (text.charAt(1) !== quote) continue
    for (let at = 2; at < text.length; at++) {
      const character = text.charAt(at)
      if (character === "\\") {
        const escaped = text.charAt(++at)
        if (["", "\n", "\r", "\u2028", "\u2029"].includes(escaped)) break
      } else if (character === quote) {
        if (text.charAt(at + 1) === "]") return { end: at + 2, kind: "string" }
        break
      }
    }
  }
  let at = 1
  while (at < text.length && !["[", "]", "\r", "\n"].includes(text.charAt(at)))
    at++
  return at > 1 && text.charAt(at) === "]"
    ? { end: at + 1, kind: "text" }
    : null
}

/** An earlier common form wins over a bare ID even when its suffix is empty. */
function commonStart(text: string): boolean {
  if (text.startsWith("title")) return true
  for (const word of ["accTitle", "accDescr"]) {
    if (!text.startsWith(word)) continue
    let at = word.length
    while (text.charAt(at) === " " || text.charAt(at) === "\t") at++
    if (text.charAt(at) === ":") return true
    if (word === "accDescr") {
      at = word.length
      while (isWhitespace(text.charCodeAt(at))) at++
      if (text.charAt(at) === "{") return true
    }
  }
  return false
}

/** Shared leaves obey this position's complete lexical unit and earlier priorities. */
function checkLeaf(
  reading: Reading,
  node: CheckedNode,
  icons: ReadonlySet<CheckedNode>,
): void {
  const value = reading.converted.of(node.range)
  if (node.type === "Identifier") {
    const tail = following(reading, node.range[0])
    const icon = icons.has(node)
    reading.problems.expect(
      value.length > 0 &&
        (icon
          ? [...value].every(
              (character) =>
                isWordCharacter(character.charCodeAt(0)) ||
                character === "-" ||
                character === ":",
            )
          : idEnd(tail) === value.length &&
            !WORDS.includes(value) &&
            !"LRTB".includes(value.charAt(0)) &&
            !commonStart(tail)),
      label(node),
      "the name is not one complete icon-name or ID lexical unit at this position",
    )
    checkTokenKinds(reading, node, ["Identifier"], "an architecture name")
  } else if (node.type === "StringLiteral") {
    reading.problems.expect(
      node.closed === true && stringSpelling(value),
      label(node),
      "the value is not a complete closed STRING lexical unit",
    )
  } else if (node.type === "ArchitectureLabel") {
    checkRangeIsHull(reading, node, ownOf(reading.root, node))
    const match = labelMatch(following(reading, node.range[0]))
    reading.problems.expect(
      match !== null && match.end === value.length,
      label(node),
      "the label is not one complete first-match bracketed lexical unit",
    )
    reading.problems.expectEqual(
      node.kind,
      match?.kind,
      label(node),
      "the label kind from its first complete alternative",
    )
    const raw = reading.written.of(node.range)
    const count = node.kind === "string" ? 2 : 1
    reading.problems.expectEqual(
      node.value,
      raw.slice(count, -count),
      label(node),
      "value is not its written label content",
    )
    const tokens = nodeTokensIn(reading.root, node.range)
    const open = tokens[0]
    const close = tokens.at(-1)
    const content = tokens.slice(1, -1)
    const kind =
      match?.kind === "string"
        ? content.length === 1
          ? "String"
          : "StringFragment"
        : "RawText"
    reading.problems.expect(
      open?.type === "Punctuator" &&
        open.value === "[" &&
        close?.type === "Punctuator" &&
        close.value === "]" &&
        content.length > 0 &&
        content.every((token) => token.type === kind) &&
        content.map((token) => token.value).join("") === raw.slice(1, -1),
      label(node),
      "the label's bracket and content tokens do not match its lexical alternative",
    )
    for (const [index, token] of content.entries()) {
      const next = content[index + 1]
      if (next === undefined) continue
      let cut = false
      for (let at = token.range[1]; at < next.range[0]; at++)
        if (reading.written.isLeftOut(at)) cut = true
      reading.problems.expect(
        cut,
        label(node),
        "one label content unit fragments only at common trivia",
      )
    }
  }
}

/** Follow each authored component once, assigning hidden matches to the next present component. */
function components(reading: Reading, node: CheckedNode) {
  const tokens = ownOf(reading.root, node).tokens
  let index = 0
  let end = node.range[0]

  /** Check the gap immediately before the next authored component. */
  function before(next: number, field?: string, compact = false): void {
    if (field !== undefined) checkHiddenGap(reading, node, field, end, next)
    else {
      const value = checkGap(reading, node, end, next, false)
      if (compact)
        reading.problems.expect(
          value === "",
          label(node),
          "a composite component cannot contain padding or native hidden forms",
        )
    }
  }

  return {
    token(
      expected: readonly string[],
      field?: string,
      compact = false,
    ): string {
      const token = tokens[index++]
      reading.problems.expect(
        token !== undefined && expected.includes(token.value),
        label(node),
        `the authored component must be ${expected.join(" or ")}`,
      )
      if (token === undefined) return ""
      if (token.value === "-" || token.value === "--")
        reading.problems.expect(
          yamlEnd(following(reading, token.range[0])) === undefined,
          label(node),
          "the line dash yields to a complete hidden YAML match",
        )
      if (token.value === "-")
        reading.problems.expect(
          !following(reading, token.range[0]).startsWith("--"),
          label(node),
          "a single line dash yields to the earlier double dash unit",
        )
      if (WORDS.includes(token.value))
        reading.problems.expect(
          idEnd(following(reading, token.range[0])) === token.value.length,
          label(node),
          "the authored keyword yields to its longer ID alternative",
        )
      before(token.range[0], field, compact)
      end = token.range[1]
      return token.value
    },
    child(field: string, gapField?: string, compact = false): void {
      const child = childOf(node, field)
      if (child === null) return
      before(child.range[0], gapField, compact)
      end = child.range[1]
    },
    absent(field: string): void {
      reading.problems.expect(
        entriesOf(node, field).length === 0,
        label(node),
        `the absent component's ${field} gap must be empty`,
      )
    },
    member(member: CheckedNode): void {
      const id = childOf(member, "id")
      if (id === null) return
      checkHiddenGap(reading, member, "textBeforeId", end, id.range[0])
      end = member.range[1]
    },
    finish(suffix = true): void {
      reading.problems.expect(
        index === tokens.length,
        label(node),
        "unexpected authored components remain",
      )
      if (suffix) checkHiddenGap(reading, node, "textAfter", end, node.range[1])
      else checkGap(reading, node, end, node.range[1], false)
    },
  }
}

/** Declarations retain independent optional icon, title and parent syntax. */
function checkDeclaration(reading: Reading, node: CheckedNode): void {
  const parts = components(reading, node)
  const word =
    node.type === "ArchitectureGroupStatement"
      ? "group"
      : node.type === "ArchitectureServiceStatement"
        ? "service"
        : "junction"
  parts.token([word])
  parts.child("id", "textBeforeId")
  if (word !== "junction") {
    const icon = childOf(node, "icon")
    if (icon === null) parts.absent("textBeforeIcon")
    else if (icon.type === "StringLiteral")
      parts.child("icon", "textBeforeIcon")
    else {
      parts.token(["("], "textBeforeIcon")
      parts.child("icon", undefined, true)
      parts.token([")"], undefined, true)
    }
    if (childOf(node, "title") === null) parts.absent("textBeforeTitle")
    else parts.child("title", "textBeforeTitle")
  }
  if (childOf(node, "in") === null) {
    parts.absent("textBeforeIn")
    parts.absent("textBeforeParent")
  } else {
    parts.token(["in"], "textBeforeIn")
    parts.child("in", "textBeforeParent")
  }
  parts.finish()
}

/** The flags correspond to whole modifiers, whose interiors admit only common trivia. */
function checkEdge(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const arrow = childOf(node, "arrow")
  const rhs = childOf(node, "rhsId")
  if (arrow !== null && rhs !== null) {
    reading.problems.expectEqual(
      node.lhsGroup,
      own.tokens.some(
        (token) => token.value === "{" && token.range[0] < arrow.range[0],
      ),
      label(node),
      "the written lhsGroup modifier",
    )
    reading.problems.expectEqual(
      node.rhsGroup,
      own.tokens.some(
        (token) => token.value === "{" && token.range[0] >= rhs.range[1],
      ),
      label(node),
      "the written rhsGroup modifier",
    )
  }
  const parts = components(reading, node)
  parts.child("lhsId")
  for (const side of ["lhs", "rhs"]) {
    if (side === "rhs") {
      parts.child("arrow", "textBeforeArrow")
      parts.child("rhsId", "textBeforeRhsId")
    }
    const field = side === "lhs" ? "textBeforeLhsGroup" : "textBeforeRhsGroup"
    if (node[`${side}Group`] === true) {
      parts.token(["{"], field)
      parts.token(["group"], undefined, true)
      parts.token(["}"], undefined, true)
    } else parts.absent(field)
  }
  parts.finish()
}

/** Directions and marker fields agree with their authored tokens, including reversed markers. */
function checkArrow(reading: Reading, node: CheckedNode): void {
  const parts = components(reading, node)
  parts.token([":"])
  const start = parts.token(["L", "R", "T", "B"], "textBeforeStartDirection")
  reading.problems.expectEqual(
    node.startDirection,
    start,
    label(node),
    "the written start direction",
  )
  if (node.startMarker === "arrow")
    parts.token(["<", ">"], "textBeforeStartMarker")
  else parts.absent("textBeforeStartMarker")
  const titled = childOf(node, "title") !== null
  parts.token([titled ? "-" : "--"], "textBeforeLine")
  if (titled) {
    parts.child("title", "textBeforeTitle")
    parts.token(["-"], "textBeforeEndDash")
  } else {
    parts.absent("textBeforeTitle")
    parts.absent("textBeforeEndDash")
  }
  if (node.endMarker === "arrow") parts.token(["<", ">"], "textBeforeEndMarker")
  else parts.absent("textBeforeEndMarker")
  const end = parts.token(["L", "R", "T", "B"], "textBeforeEndDirection")
  reading.problems.expectEqual(
    node.endDirection,
    end,
    label(node),
    "the written end direction",
  )
  parts.token([":"], "textBeforeEndColon")
  parts.finish(false)
}

/** Tree conditions only; the parser and fixture result records own semantic acceptance. */
export function checkArchitectureTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  const icons = new Set<CheckedNode>()
  walkNodes(root, (node) => {
    if (
      node.type === "ArchitectureGroupStatement" ||
      node.type === "ArchitectureServiceStatement"
    ) {
      const icon = childOf(node, "icon")
      if (icon !== null) icons.add(icon)
    }
  })
  checkTokensInValueNodes(root, problems)
  walkNodes(root, (node) => {
    checkChildTypes(reading, node, ARCHITECTURE_CHILD_TYPES)
    checkFieldWords(reading, node, ARCHITECTURE_FIELD_WORDS)
    checkLeaf(reading, node, icons)
    if (!node.type.startsWith("Architecture")) return
    if (node.type === "ArchitectureLabel") return
    checkStatementNode(reading, node, ARCHITECTURE_PUNCTUATORS)
    if (DECLARATIONS.includes(node.type)) checkDeclaration(reading, node)
    else if (node.type === "ArchitectureEdgeStatement") checkEdge(reading, node)
    else if (node.type === "ArchitectureArrow") checkArrow(reading, node)
    else if (node.type === "ArchitectureAlignmentStatement") {
      const parts = components(reading, node)
      parts.token(["align"])
      const direction = parts.token(["row", "column"], "textBeforeDirection")
      problems.expectEqual(
        node.direction,
        direction,
        label(node),
        "the written alignment direction",
      )
      const members = entriesOf(node, "members").filter(
        (member) => member !== null,
      )
      problems.expect(
        members.length >= 2,
        label(node),
        "an alignment must have at least two written members",
      )
      for (const member of members) parts.member(member)
      parts.finish()
    } else if (node.type === "ArchitectureIgnoredText") {
      problems.expect(
        reading.written
          .of(node.range)
          .startsWith(node.kind === "yaml-block" ? "---" : "%%{"),
        label(node),
        "a retained form starts at its authored opener, without preceding padding",
      )
      checkIgnored(reading, node)
    } else if (COMMON.includes(node.type)) checkCommon(reading, node)
    else if (node.type === "ArchitectureDiagram") {
      const header = ownOf(root, node).tokens[0]
      problems.expect(
        ownOf(root, node).tokens.length === 1 &&
          header?.value === "architecture-beta",
        label(node),
        "the written header must be architecture-beta",
      )
      if (header === undefined) return
      problems.expect(
        idEnd(following(reading, header.range[0])) === header.value.length,
        label(node),
        "the header yields to its longer ID alternative",
      )
      checkNativeComments(reading, header.range[1])
      walkNodes(root, (candidate) => {
        if (candidate.type !== "ArchitectureLabel") return
        for (const comment of root.comments) {
          const at = comment.range[0]
          if (at >= header.range[1] && !reading.written.isLeftOut(at))
            problems.expect(
              at < candidate.range[0] || at >= candidate.range[1],
              label(comment),
              "a native Comment cannot start inside a bracketed label",
            )
        }
      })
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
  })
}
