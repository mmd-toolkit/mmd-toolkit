import {
  isDigit,
  isWhitespace,
  isWordCharacter,
} from "../db-from-tree/characters.ts"
import {
  afterHorizontal,
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

const HIDDEN = ["RadarIgnoredText"]
const COMMON = [
  "RadarTitleStatement",
  "RadarAccTitleStatement",
  "RadarAccDescrStatement",
  "RadarAccDescrBlockStatement",
]
const OPTIONS = [
  "RadarShowLegendOption",
  "RadarTicksOption",
  "RadarMaxOption",
  "RadarMinOption",
  "RadarGraticuleOption",
]
const WORDS = [
  "radar-beta",
  "showLegend",
  "graticule",
  "curve",
  "ticks",
  "axis",
  "max",
  "min",
]
const GROUPS = [
  "RadarAxisStatement",
  "RadarCurveStatement",
  "RadarOptionsStatement",
]

/** ast/radar.md: all child fields, in the specified visitor order. */
export const RADAR_CHILD_TYPES: FieldTable<readonly string[]> = {
  RadarDiagram: {
    textBeforeHeader: HIDDEN,
    textBeforeColon: HIDDEN,
    body: [...GROUPS, ...COMMON, ...HIDDEN],
  },
  RadarAxisStatement: { axes: ["RadarAxis"] },
  RadarCurveStatement: { curves: ["RadarCurve"] },
  RadarOptionsStatement: { options: OPTIONS },
  RadarAxis: {
    textBefore: HIDDEN,
    name: ["Identifier"],
    textBeforeLabel: HIDDEN,
    textBeforeLabelValue: HIDDEN,
    label: ["StringLiteral"],
    textBeforeLabelClose: HIDDEN,
    textAfter: HIDDEN,
  },
  RadarCurve: {
    textBefore: HIDDEN,
    name: ["Identifier"],
    textBeforeLabel: HIDDEN,
    textBeforeLabelValue: HIDDEN,
    label: ["StringLiteral"],
    textBeforeLabelClose: HIDDEN,
    textBeforeEntries: HIDDEN,
    entries: ["RadarNumberEntry", "RadarNamedEntry"],
    textAfter: HIDDEN,
  },
  RadarNumberEntry: {
    textBefore: HIDDEN,
    value: ["NumericLiteral"],
    textAfter: HIDDEN,
  },
  RadarNamedEntry: {
    textBefore: HIDDEN,
    axis: ["Identifier"],
    textBeforeColon: HIDDEN,
    textBeforeValue: HIDDEN,
    value: ["NumericLiteral"],
    textAfter: HIDDEN,
  },
  RadarShowLegendOption: {
    textBefore: HIDDEN,
    textBeforeValue: HIDDEN,
    textAfter: HIDDEN,
  },
  RadarTicksOption: {
    textBefore: HIDDEN,
    textBeforeValue: HIDDEN,
    value: ["NumericLiteral"],
    textAfter: HIDDEN,
  },
  RadarMaxOption: {
    textBefore: HIDDEN,
    textBeforeValue: HIDDEN,
    value: ["NumericLiteral"],
    textAfter: HIDDEN,
  },
  RadarMinOption: {
    textBefore: HIDDEN,
    textBeforeValue: HIDDEN,
    value: ["NumericLiteral"],
    textAfter: HIDDEN,
  },
  RadarGraticuleOption: {
    textBefore: HIDDEN,
    textBeforeValue: HIDDEN,
    textAfter: HIDDEN,
  },
  RadarTitleStatement: { value: ["RadarLiteral"], textAfter: HIDDEN },
  RadarAccTitleStatement: { value: ["RadarLiteral"], textAfter: HIDDEN },
  RadarAccDescrStatement: { value: ["RadarLiteral"], textAfter: HIDDEN },
  RadarAccDescrBlockStatement: { value: ["RadarLiteral"], textAfter: HIDDEN },
}

/** Fixed words remain written strings, independently checked against their tokens. */
export const RADAR_FIELD_WORDS: FieldTable<readonly string[]> = {
  RadarIgnoredText: { kind: ["yaml-block", "directive"] },
  RadarShowLegendOption: { value: ["true", "false"] },
  RadarGraticuleOption: { value: ["circle", "polygon"] },
}

/** Maximal id spelling, before applying earlier lexical rules. */
function idEnd(text: string): number {
  if (!isWordCharacter(text.charCodeAt(0))) return 0
  let end = 1
  while (isWordCharacter(text.charCodeAt(end)) || text.charAt(end) === "-")
    end++
  while (text.charAt(end - 1) === "-") end--
  return end
}

/** The decimal alternative precedes the zero/nonzero integer alternatives. */
function numberEnd(text: string): number {
  let digits = 0
  while (isDigit(text.charCodeAt(digits))) digits++
  if (digits === 0) return 0
  if (text.charAt(digits) === ".") {
    const start = digits + 1
    let end = start
    while (isDigit(text.charCodeAt(end))) end++
    if (text.charAt(end) === ".") end--
    if (end > start) return end
  }
  if (text.startsWith("0")) return 1
  return text.charAt(digits) === "." ? digits - 1 : digits
}

/** Common composites outrank ids; bare accessibility words remain possible ids. */
function commonStart(text: string): boolean {
  if (text.startsWith("title")) return true
  for (const word of ["accTitle", "accDescr"]) {
    if (!text.startsWith(word)) continue
    if (text.charAt(afterHorizontal(text, word.length)) === ":") return true
    if (word === "accDescr") {
      let end = word.length
      while (isWhitespace(text.charCodeAt(end))) end++
      if (text.charAt(end) === "{") return true
    }
  }
  return false
}

/** The bare header alone adds a percent-pair boundary to common whitespace/EOF. */
function headerBoundary(text: string, at: number): boolean {
  return boundary(text, at) || text.startsWith("%%", at)
}

/** Shared leaves are whole units under radar's first-match priorities. */
function checkLeaf(reading: Reading, node: CheckedNode): void {
  const value = reading.converted.of(node.range)
  const tail = following(reading, node.range[0])
  if (node.type === "Identifier") {
    const keyword =
      value === "radar-beta"
        ? tail.startsWith("radar-beta:") || headerBoundary(tail, value.length)
        : WORDS.includes(value)
    reading.problems.expect(
      value.length > 0 &&
        idEnd(tail) === value.length &&
        !keyword &&
        !["true", "false", "circle", "polygon"].some((word) =>
          tail.startsWith(word),
        ) &&
        numberEnd(tail) === 0 &&
        !commonStart(tail),
      label(node),
      "the name is not one complete ID lexical unit at this position",
    )
    checkTokenKinds(reading, node, ["Identifier"], "a radar name")
  } else if (node.type === "NumericLiteral") {
    reading.problems.expect(
      value.length > 0 && numberEnd(tail) === value.length,
      label(node),
      "the value is not one unsigned-decimal NUMBER lexical unit",
    )
    checkTokenKinds(reading, node, ["Numeric"], "a radar number")
  } else if (node.type === "StringLiteral")
    reading.problems.expect(
      node.closed === true && stringSpelling(value),
      label(node),
      "the value is not a complete closed STRING lexical unit",
    )
}

/** A group's last member owns the trailing forms that can consume its following LF. */
function suffixOwner(node: CheckedNode): CheckedNode {
  const field =
    node.type === "RadarAxisStatement"
      ? "axes"
      : node.type === "RadarCurveStatement"
        ? "curves"
        : node.type === "RadarOptionsStatement"
          ? "options"
          : null
  return field === null ? node : (entriesOf(node, field).at(-1) ?? node)
}

/** Follow authored components and the named hidden lists between them exactly once. */
function components(reading: Reading, node: CheckedNode) {
  const tokens = ownOf(reading.root, node).tokens
  let index = 0
  let end = node.range[0]
  let previous: CheckedNode | null = null

  /** A previous member may have consumed the LF outside its range. */
  function before(next: number, field?: string, newline = false): void {
    if (field !== undefined)
      checkHiddenGap(reading, node, field, end, next, newline)
    else checkGap(reading, node, end, next, newline, previous)
  }

  return {
    token(
      expected: readonly string[],
      field?: string,
      newline = false,
    ): string {
      const token = tokens[index++]
      reading.problems.expect(
        token !== undefined && expected.includes(token.value),
        label(node),
        `the authored component must be ${expected.join(" or ")}`,
      )
      if (token === undefined) return ""
      if (WORDS.includes(token.value))
        reading.problems.expect(
          idEnd(following(reading, token.range[0])) === token.value.length,
          label(token),
          "the keyword yields to its longer ID alternative",
        )
      before(token.range[0], field, newline)
      end = token.range[1]
      previous = null
      return token.value
    },
    child(field: string, gapField?: string, newline = false): void {
      const child = childOf(node, field)
      if (child === null) return
      before(child.range[0], gapField, newline)
      end = child.range[1]
      previous = null
    },
    absent(field: string): void {
      reading.problems.expect(
        entriesOf(node, field).length === 0,
        label(node),
        `the absent component's ${field} gap must be empty`,
      )
    },
    member(member: CheckedNode, newline = false): void {
      before(member.range[0], undefined, newline)
      end = member.range[1]
      previous = entriesOf(member, "textAfter").at(-1) ?? null
    },
    finish(suffix = true, newline = false): void {
      reading.problems.expect(
        index === tokens.length,
        label(node),
        "unexpected authored components remain",
      )
      if (suffix)
        checkHiddenGap(reading, node, "textAfter", end, node.range[1], newline)
      else before(node.range[1])
    },
  }
}

/** One keyword introduces a nonempty comma group, without visible member newlines. */
function checkGroup(reading: Reading, node: CheckedNode): void {
  const field =
    node.type === "RadarAxisStatement"
      ? "axes"
      : node.type === "RadarCurveStatement"
        ? "curves"
        : "options"
  const members = entriesOf(node, field).filter((entry) => entry !== null)
  reading.problems.expect(
    members.length > 0,
    label(node),
    "a declaration or options group must be nonempty",
  )
  const parts = components(reading, node)
  if (field !== "options") parts.token([field === "axes" ? "axis" : "curve"])
  for (const [index, member] of members.entries()) {
    if (index > 0) parts.token([","])
    else if (field === "options")
      reading.problems.expect(
        entriesOf(member, "textBefore").length === 0,
        label(member),
        "the first option's textBefore must be empty",
      )
    parts.member(member)
  }
  parts.finish(false)
}

/** Optional labels and curve braces keep independent hidden gap owners. */
function checkDeclaration(reading: Reading, node: CheckedNode): void {
  const parts = components(reading, node)
  parts.child("name", "textBefore")
  if (childOf(node, "label") === null) {
    parts.absent("textBeforeLabel")
    parts.absent("textBeforeLabelValue")
    parts.absent("textBeforeLabelClose")
  } else {
    parts.token(["["], "textBeforeLabel")
    parts.child("label", "textBeforeLabelValue")
    parts.token(["]"], "textBeforeLabelClose")
  }
  if (node.type === "RadarCurve") {
    parts.token(["{"], "textBeforeEntries")
    const entries = entriesOf(node, "entries").filter((entry) => entry !== null)
    reading.problems.expect(
      entries.length > 0 &&
        entries.every((entry) => entry.type === entries[0]?.type),
      label(node),
      "curve entries must be a nonempty list of one entry form",
    )
    for (const [index, entry] of entries.entries()) {
      if (index > 0) parts.token([","])
      parts.member(entry, true)
    }
    parts.token(["}"], undefined, true)
  }
  parts.finish()
}

/** Only before/after entries can visible newlines occur; optional colon presence remains punctuation. */
function checkEntry(reading: Reading, node: CheckedNode, last: boolean): void {
  const parts = components(reading, node)
  if (node.type === "RadarNamedEntry") {
    parts.child("axis", "textBefore", true)
    if (ownOf(reading.root, node).tokens.some((token) => token.value === ":"))
      parts.token([":"], "textBeforeColon")
    else parts.absent("textBeforeColon")
    parts.child("value", "textBeforeValue")
  } else parts.child("value", "textBefore", true)
  parts.finish(true, last)
}

/** Fixed values agree with authored tokens; numeric options retain their original number. */
function checkOption(reading: Reading, node: CheckedNode): void {
  const parts = components(reading, node)
  const word =
    node.type === "RadarShowLegendOption"
      ? "showLegend"
      : node.type === "RadarTicksOption"
        ? "ticks"
        : node.type === "RadarMaxOption"
          ? "max"
          : node.type === "RadarMinOption"
            ? "min"
            : "graticule"
  parts.token([word], "textBefore")
  if (word === "showLegend" || word === "graticule") {
    const value = parts.token(
      word === "showLegend" ? ["true", "false"] : ["circle", "polygon"],
      "textBeforeValue",
    )
    reading.problems.expectEqual(
      node.value,
      value,
      label(node),
      "the written option value",
    )
  } else parts.child("value", "textBeforeValue")
  parts.finish()
}

/** Only common statements need EOL; a body hidden form must follow its predecessor's visible EOL. */
function checkBody(reading: Reading, node: CheckedNode, from: number): void {
  let end = from
  let previous: CheckedNode | null = null
  for (const item of entriesOf(node, "body")) {
    if (item === null) continue
    if (
      previous !== null &&
      (COMMON.includes(previous.type) ||
        (GROUPS.includes(previous.type) && item.type === "RadarIgnoredText"))
    )
      checkEnd(reading, suffixOwner(previous), item.range[0])
    else {
      const owner = previous === null ? null : suffixOwner(previous)
      const hidden =
        owner?.type === "RadarIgnoredText"
          ? owner
          : owner === null
            ? null
            : (entriesOf(owner, "textAfter").at(-1) ?? null)
      checkGap(reading, node, end, item.range[0], true, hidden)
    }
    end = item.range[1]
    previous = item
  }
  const owner = previous === null ? null : suffixOwner(previous)
  if (owner !== null && COMMON.includes(owner.type))
    checkEnd(reading, owner, reading.text.length)
  else
    checkGap(
      reading,
      node,
      end,
      reading.text.length,
      true,
      owner?.type === "RadarIgnoredText"
        ? owner
        : owner === null
          ? null
          : (entriesOf(owner, "textAfter").at(-1) ?? null),
    )
}

/** All header spellings share authored word/colon tokens; only a bare word has a boundary. */
function checkDiagram(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const header = own.tokens[0]
  const colon = own.tokens[1]
  reading.problems.expect(
    header?.value === "radar-beta" &&
      (own.tokens.length === 1 ||
        (own.tokens.length === 2 && colon?.value === ":")),
    label(node),
    "the written header must be radar-beta with at most one colon",
  )
  if (header === undefined) return
  const joined =
    colon !== undefined &&
    reading.converted.of([header.range[1], colon.range[0]]) === ""
  const tail = following(reading, header.range[1])
  reading.problems.expect(
    joined || headerBoundary(tail, 0),
    label(header),
    "the bare header has no whitespace, EOF or percent-pair boundary",
  )
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
  if (colon === undefined)
    reading.problems.expect(
      entriesOf(node, "textBeforeColon").length === 0,
      label(node),
      "textBeforeColon must be empty without a separate colon",
    )
  else
    checkHiddenGap(
      reading,
      node,
      "textBeforeColon",
      header.range[1],
      colon.range[0],
    )
  checkNativeComments(reading, header.range[1])
  walkNodes(reading.root, (candidate) => {
    if (candidate.type !== "RadarIgnoredText") return
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

/** Lexical and structural tree conditions only; accepted records are compared separately. */
export function checkRadarTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  const lastEntries = new Set<CheckedNode>()
  walkNodes(root, (node) => {
    if (node.type === "RadarCurve") {
      const last = entriesOf(node, "entries").at(-1)
      if (last !== undefined && last !== null) lastEntries.add(last)
    }
  })
  checkTokensInValueNodes(root, problems)
  walkNodes(root, (node) => {
    checkChildTypes(reading, node, RADAR_CHILD_TYPES)
    checkFieldWords(reading, node, RADAR_FIELD_WORDS)
    checkLeaf(reading, node)
    if (!node.type.startsWith("Radar")) return
    checkStatementNode(reading, node, [":", ",", "[", "]", "{", "}"])
    if (node.type === "RadarDiagram") checkDiagram(reading, node)
    else if (GROUPS.includes(node.type)) checkGroup(reading, node)
    else if (node.type === "RadarAxis" || node.type === "RadarCurve")
      checkDeclaration(reading, node)
    else if (
      node.type === "RadarNamedEntry" ||
      node.type === "RadarNumberEntry"
    )
      checkEntry(reading, node, lastEntries.has(node))
    else if (OPTIONS.includes(node.type)) checkOption(reading, node)
    else if (COMMON.includes(node.type)) checkCommon(reading, node)
    else if (node.type === "RadarIgnoredText") {
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
