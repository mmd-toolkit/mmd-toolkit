import {
  isWhitespace,
  isLineTerminatorCode,
} from "../db-from-tree/characters.ts"
import { scanSource } from "../source-scan.ts"
import { readConvertedCharacters } from "../db-from-tree/converted-text.ts"
import type { TreeRange } from "../db-from-tree/tree.ts"
import {
  checkIgnored,
  checkPreheader,
  checkStatementNode,
} from "./common-statement-checks.ts"
import { eventmodelingUnit } from "./eventmodeling-lexical.ts"
import type { EventmodelingUnit } from "./eventmodeling-lexical.ts"
import {
  checkChildTypes,
  checkFieldWords,
  checkListsWithAnEntry,
} from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import { checkDiagramCommentEnd } from "./invariants.ts"
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
import { checkTokensInValueNodes } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { nodesOf } from "./walk.ts"

const HIDDEN = ["EventmodelingIgnoredText"]
const COMMON = [
  "EventmodelingTitleStatement",
  "EventmodelingAccTitleStatement",
  "EventmodelingAccDescrStatement",
  "EventmodelingAccDescrBlockStatement",
]
const ENTITY_TYPES = [
  "rmo",
  "readmodel",
  "ui",
  "cmd",
  "command",
  "evt",
  "event",
  "pcr",
  "processor",
]
const DATA_TYPES = [
  "json",
  "jsobj",
  "figma",
  "salt",
  "uri",
  "md",
  "html",
  "text",
]

/** Every authored delimiter is one atom; arrows have an independent node too. */
export const EVENTMODELING_PUNCTUATORS: readonly string[] = [
  "->>",
  "[[",
  "]]",
  "`",
  ".",
  "{",
  "}",
  ":",
]

const FRAME_FIELDS = {
  textBeforeName: HIDDEN,
  name: ["Identifier"],
  textBeforeModelEntityType: HIDDEN,
  textBeforeEntityIdentifier: HIDDEN,
  entityIdentifier: ["EventmodelingQualifiedName"],
  sourceFrames: ["EventmodelingSourceReference"],
  dataReference: ["EventmodelingDataReference"],
  data: ["EventmodelingInlineData"],
}
const DATA_FIELDS = {
  textBefore: HIDDEN,
  textBeforeDataType: HIDDEN,
  textBeforeTypeClose: HIDDEN,
  textBeforeValue: HIDDEN,
  value: ["EventmodelingLiteral", "StringLiteral"],
}

/** ast/eventmodeling.md: all child fields, in the specified visitor order. */
export const EVENTMODELING_CHILD_TYPES: FieldTable<readonly string[]> = {
  EventmodelingDiagram: {
    textBeforeHeader: HIDDEN,
    body: [
      "EventmodelingTimeFrameStatement",
      "EventmodelingResetFrameStatement",
      "EventmodelingModelEntityStatement",
      "EventmodelingDataEntityStatement",
      "EventmodelingNoteStatement",
      "EventmodelingGwtStatement",
      ...COMMON,
      ...HIDDEN,
    ],
  },
  EventmodelingTimeFrameStatement: FRAME_FIELDS,
  EventmodelingResetFrameStatement: FRAME_FIELDS,
  EventmodelingQualifiedName: {
    head: ["Identifier"],
    tail: ["EventmodelingQualifiedNamePart"],
  },
  EventmodelingQualifiedNamePart: {
    textBeforeDot: HIDDEN,
    textBeforeName: HIDDEN,
    name: ["Identifier"],
  },
  EventmodelingSourceReference: {
    textBefore: HIDDEN,
    arrow: ["EventmodelingArrow"],
    textBeforeFrame: HIDDEN,
    frame: ["Identifier"],
  },
  EventmodelingDataReference: {
    textBefore: HIDDEN,
    textBeforeName: HIDDEN,
    name: ["Identifier"],
    textBeforeClose: HIDDEN,
  },
  EventmodelingInlineData: DATA_FIELDS,
  EventmodelingDataBlock: { ...DATA_FIELDS, value: ["EventmodelingLiteral"] },
  EventmodelingModelEntityStatement: {
    textBeforeName: HIDDEN,
    name: ["EventmodelingQualifiedName"],
  },
  EventmodelingDataEntityStatement: {
    textBeforeName: HIDDEN,
    name: ["Identifier"],
    data: ["EventmodelingDataBlock"],
  },
  EventmodelingNoteStatement: {
    textBeforeSourceFrame: HIDDEN,
    sourceFrame: ["Identifier"],
    data: ["EventmodelingDataBlock"],
  },
  EventmodelingGwtStatement: {
    textBeforeSourceFrame: HIDDEN,
    sourceFrame: ["Identifier"],
    given: ["EventmodelingGwtClause"],
    when: ["EventmodelingGwtClause"],
    then: ["EventmodelingGwtClause"],
  },
  EventmodelingGwtClause: {
    textBefore: HIDDEN,
    body: ["EventmodelingGwtItem"],
  },
  EventmodelingGwtItem: {
    textBefore: HIDDEN,
    textBeforeEntityIdentifier: HIDDEN,
    entityIdentifier: ["Identifier"],
  },
  EventmodelingTitleStatement: { value: ["EventmodelingLiteral"] },
  EventmodelingAccTitleStatement: { value: ["EventmodelingLiteral"] },
  EventmodelingAccDescrStatement: { value: ["EventmodelingLiteral"] },
  EventmodelingAccDescrBlockStatement: { value: ["EventmodelingLiteral"] },
}

/** Scalar membership is checked separately from agreement with source components. */
export const EVENTMODELING_FIELD_WORDS: FieldTable<readonly string[]> = {
  EventmodelingTimeFrameStatement: { modelEntityType: ENTITY_TYPES },
  EventmodelingResetFrameStatement: { modelEntityType: ENTITY_TYPES },
  EventmodelingGwtItem: { modelEntityType: ENTITY_TYPES },
  EventmodelingGwtClause: { kind: ["given", "when", "then"] },
  EventmodelingArrow: {
    startMarker: ["none"],
    line: ["solid"],
    endMarker: ["arrow"],
  },
  EventmodelingIgnoredText: { kind: ["yaml-block", "directive"] },
}

/** The grammar's single nonempty authored list; no semantic acceptance checks. */
export const EVENTMODELING_NONEMPTY_LISTS: Readonly<
  Record<string, readonly string[]>
> = { EventmodelingGwtClause: ["body"] }

/** One whole lexical match with its source boundaries and optional payload. */
interface Occurrence {
  readonly unit: EventmodelingUnit
  readonly range: TreeRange
  readonly payload: TreeRange | null
}

/** Match whole lexical units after the supplied header, retaining original source offsets. */
function occurrences(
  reading: Reading,
  header: { readonly range: TreeRange },
): Occurrence[] {
  const characters = readConvertedCharacters(reading.text, reading.root)
  let text = ""
  const starts: number[] = []
  const ends: number[] = []
  for (const character of characters) {
    const value = String.fromCodePoint(character.codePoint)
    let end =
      character.start +
      (reading.text.codePointAt(character.start)! > 0xffff ? 2 : 1)
    if (
      reading.text.charAt(character.start) === "\r" &&
      reading.text.charAt(character.start + 1) === "\n" &&
      !reading.written.isLeftOut(character.start + 1)
    )
      end++
    for (let offset = 0; offset < value.length; offset++) {
      starts.push(character.start)
      ends.push(Math.min(end, reading.text.length))
    }
    text += value
  }

  /** Source ranges exclude common cuts outside their first/last visible characters. */
  function range(from: number, to: number): TreeRange {
    return [
      starts[from] ?? reading.text.length,
      ends[to - 1] ?? reading.text.length,
    ]
  }

  const result: Occurrence[] = []
  let at = starts.findIndex((offset) => offset >= header.range[0])
  if (at === -1) return result
  while (at < text.length) {
    const unit = eventmodelingUnit(text, at)
    if (unit === undefined) {
      reading.problems.report(
        label(reading.root.body),
        `no complete lexical unit at source offset ${starts[at]}`,
      )
      at++
      continue
    }
    if (unit.kind !== "whitespace")
      result.push({
        unit,
        range:
          unit.kind === "percent-comment" || unit.kind === "slash-line-comment"
            ? [
                starts[unit.start] ?? reading.text.length,
                starts[unit.end] ?? reading.text.length,
              ]
            : range(unit.start, unit.end),
        payload:
          unit.payload === undefined || unit.payload[0] === unit.payload[1]
            ? null
            : range(...unit.payload),
      })
    at = unit.next
  }
  return result
}

/** Native gaps hold only their supplied hidden list, comments and general Notation whitespace. */
function checkGap(
  reading: Reading,
  node: CheckedNode,
  from: number,
  to: number,
  field?: string,
): void {
  const hidden =
    field === undefined
      ? []
      : entriesOf(node, field).filter((part) => part !== null)
  let end = from
  for (const part of hidden) {
    reading.problems.expect(
      end <= part.range[0] && part.range[1] <= to,
      label(node),
      `${field} must own its hidden forms exactly once in source order before the next component`,
    )
    end = part.range[1]
  }
  const value = reading.converted.of(
    [from, to],
    [
      ...reading.root.comments.map((comment) => comment.range),
      ...hidden.map((part) => part.range),
    ],
  )
  reading.problems.expect(
    from <= to &&
      [...value].every((character) =>
        isWhitespace(character.codePointAt(0) ?? -1),
      ),
    label(node),
    `the ${field ?? "component"} gap contains unowned text: ${JSON.stringify(value)}`,
  )
}

/** Consume only the supplied node's authored components and named gaps. */
function components(reading: Reading, node: CheckedNode) {
  const tokens = ownOf(reading.root, node).tokens
  let index = 0
  let end = node.range[0]
  return {
    word(words: readonly string[], field?: string): string {
      const token = tokens[index++]
      reading.problems.expect(
        token !== undefined && words.includes(token.value),
        label(node),
        `the authored component must be ${words.join(" or ")}`,
      )
      if (token === undefined) return ""
      checkGap(reading, node, end, token.range[0], field)
      end = token.range[1]
      return token.value
    },
    child(field: string, gapField?: string): void {
      const child = childOf(node, field)
      if (child === null) return
      checkGap(reading, node, end, child.range[0], gapField)
      end = child.range[1]
    },
    list(field: string): void {
      for (const child of entriesOf(node, field)) {
        if (child === null) continue
        checkGap(reading, node, end, child.range[0])
        end = child.range[1]
      }
    },
    finish(): void {
      reading.problems.expect(
        index === tokens.length && end === node.range[1],
        label(node),
        "the supplied components must fill the complete node in source order",
      )
    },
  }
}

/** Composite payloads retain whitespace, delimiters and their exact null boundary. */
function checkPayload(
  reading: Reading,
  node: CheckedNode,
  occurrence: Occurrence | undefined,
): void {
  if (occurrence === undefined) return
  const value = childOf(node, "value")
  const expected = occurrence.payload
  reading.problems.expect(
    expected === null
      ? value === null
      : value !== null &&
          value.range[0] === expected[0] &&
          value.range[1] === expected[1],
    label(node),
    "the payload must fill its complete lexical interior, or be null only when that interior is empty",
  )
}

/** The optional tag and body have distinct gaps; their hidden forms are not body text. */
function checkData(
  reading: Reading,
  node: CheckedNode,
  units: readonly Occurrence[],
): void {
  const parts = components(reading, node)
  const own = ownOf(reading.root, node).tokens
  reading.problems.expectEqual(
    node.dataType,
    own[0]?.value === "`" ? own[1]?.value : null,
    label(node),
    "the written dataType",
  )
  const typed = node.dataType !== null
  if (typed) {
    parts.word(["`"], "textBefore")
    const word = parts.word(DATA_TYPES, "textBeforeDataType")
    reading.problems.expectEqual(
      node.dataType,
      word,
      label(node),
      "the field dataType is its written type word",
    )
    parts.word(["`"], "textBeforeTypeClose")
  } else
    for (const field of [
      "textBeforeDataType",
      "textBeforeTypeClose",
      "textBeforeValue",
    ])
      reading.problems.expect(
        entriesOf(node, field).length === 0,
        label(node),
        `without a type tag the ${field} gap must be empty`,
      )
  const value = childOf(node, "value")
  const quoted = value?.type === "StringLiteral"
  const open = quoted ? value : own.find((token) => token.value === "{")
  if (quoted) parts.child("value", typed ? "textBeforeValue" : "textBefore")
  else {
    parts.word(["{"], typed ? "textBeforeValue" : "textBefore")
    parts.child("value")
    parts.word(["}"])
  }
  parts.finish()
  const occurrence =
    open === undefined
      ? undefined
      : units.find((item) => item.range[0] === open.range[0])
  const kind = node.type === "EventmodelingDataBlock" ? "block" : "inline"
  reading.problems.expect(
    occurrence?.unit.kind === kind && occurrence.range[1] === node.range[1],
    label(node),
    `the body must be one complete ${kind} unit, without its consumed closing LF`,
  )
  if (!quoted) checkPayload(reading, node, occurrence)
}

/** Every required and optional authored member keeps its specified owner and order. */
function checkStructure(reading: Reading, node: CheckedNode): void {
  const parts = components(reading, node)
  switch (node.type) {
    case "EventmodelingTimeFrameStatement":
    case "EventmodelingResetFrameStatement": {
      parts.word(
        node.type === "EventmodelingTimeFrameStatement"
          ? ["tf", "timeframe"]
          : ["rf", "resetframe"],
      )
      parts.child("name", "textBeforeName")
      const word = parts.word(ENTITY_TYPES, "textBeforeModelEntityType")
      reading.problems.expectEqual(
        node.modelEntityType,
        word,
        label(node),
        "the written modelEntityType",
      )
      parts.child("entityIdentifier", "textBeforeEntityIdentifier")
      parts.list("sourceFrames")
      parts.child("dataReference")
      parts.child("data")
      break
    }
    case "EventmodelingQualifiedName":
      parts.child("head")
      parts.list("tail")
      break
    case "EventmodelingQualifiedNamePart":
      parts.word(["."], "textBeforeDot")
      parts.child("name", "textBeforeName")
      break
    case "EventmodelingSourceReference":
      parts.child("arrow", "textBefore")
      parts.child("frame", "textBeforeFrame")
      break
    case "EventmodelingDataReference":
      parts.word(["[["], "textBefore")
      parts.child("name", "textBeforeName")
      parts.word(["]]"], "textBeforeClose")
      break
    case "EventmodelingModelEntityStatement":
      parts.word(["entity"])
      parts.child("name", "textBeforeName")
      break
    case "EventmodelingDataEntityStatement":
      parts.word(["data"])
      parts.child("name", "textBeforeName")
      parts.child("data")
      break
    case "EventmodelingNoteStatement":
      parts.word(["note"])
      parts.child("sourceFrame", "textBeforeSourceFrame")
      parts.child("data")
      break
    case "EventmodelingGwtStatement":
      parts.word(["gwt"])
      parts.child("sourceFrame", "textBeforeSourceFrame")
      for (const field of ["given", "when", "then"]) {
        parts.child(field)
        const clause = childOf(node, field)
        if (clause !== null)
          reading.problems.expectEqual(
            clause.kind,
            field,
            label(node),
            `the written ${field} clause kind`,
          )
      }
      break
    case "EventmodelingGwtClause": {
      const word = parts.word(["given", "when", "then"], "textBefore")
      reading.problems.expectEqual(
        node.kind,
        word,
        label(node),
        "the written clause kind",
      )
      parts.list("body")
      break
    }
    case "EventmodelingGwtItem": {
      const word = parts.word(ENTITY_TYPES, "textBefore")
      reading.problems.expectEqual(
        node.modelEntityType,
        word,
        label(node),
        "the written modelEntityType",
      )
      parts.child("entityIdentifier", "textBeforeEntityIdentifier")
      break
    }
    default:
      return
  }
  parts.finish()
}

/** Native comments are owned by their actual earlier-priority lexical match, never an enclosing value. */
function checkComments(
  reading: Reading,
  units: readonly Occurrence[],
  headerEnd: number,
): void {
  const comments = units.filter((item) => item.unit.kind.endsWith("comment"))
  const scan = scanSource(reading.text, reading.root.frontmatter?.range[1] ?? 0)
  const regions = scan.commentLines.map((line) => line.region)
  const semicolons = new Set(
    reading.root.tokens
      .filter((token) => token.type === "IgnoredSemicolon")
      .map((token) => token.range[0]),
  )
  for (const comment of reading.root.comments) {
    if (reading.written.isLeftOut(comment.range[0])) continue
    if (comment.range[0] < headerEnd) {
      reading.problems.expect(
        comment.mark === "%%" &&
          reading.converted.of(comment.range).trimEnd() === "%%",
        label(comment),
        "a detection-passed native Comment before the header is a bare percent line",
      )
      let afterMark = comment.range[0]
      let remaining = 2
      while (afterMark < comment.range[1] && remaining > 0) {
        if (!reading.written.isLeftOut(afterMark)) remaining--
        afterMark++
      }
      reading.problems.expectEqual(
        comment.value,
        reading.text.slice(afterMark, comment.range[1]),
        label(comment),
        "value of a passed bare percent line",
      )
      continue
    }
    const occurrence = comments.find(
      (item) =>
        item.range[0] <= comment.range[0] && comment.range[1] <= item.range[1],
    )
    reading.problems.expect(
      occurrence !== undefined,
      label(comment),
      "a native Comment must belong to its complete comment match, with no earlier unit enclosing its start",
    )
    if (occurrence === undefined) continue
    const kind = occurrence.unit.kind
    if (comment.range[0] !== occurrence.range[0])
      reading.problems.expect(
        !isWhitespace(reading.text.charCodeAt(comment.range[0])) &&
          regions.some(
            ([, to]) =>
              occurrence.range[0] < to &&
              to <= comment.range[0] &&
              [...reading.converted.of([to, comment.range[0]])].every(
                (character) => isWhitespace(character.charCodeAt(0)),
              ),
          ),
        label(comment),
        "a native Comment fragment must follow a common comment region and its padding",
      )
    if (
      kind === "slash-block-comment" &&
      comment.range[1] !== occurrence.range[1]
    )
      reading.problems.expect(
        !isWhitespace(reading.text.charCodeAt(comment.range[1] - 1)) &&
          regions.some(
            ([from]) =>
              comment.range[1] <= from &&
              from < occurrence.range[1] &&
              [...reading.converted.of([comment.range[1], from])].every(
                (character) => isWhitespace(character.charCodeAt(0)),
              ),
          ),
        label(comment),
        "a native block Comment fragment ends only before a common comment region",
      )
    if (kind !== "slash-block-comment")
      checkDiagramCommentEnd(
        reading.text,
        comment,
        scan,
        regions,
        semicolons,
        isLineTerminatorCode,
        reading.problems,
      )
    const mark =
      kind === "percent-comment"
        ? "%%"
        : kind === "slash-line-comment"
          ? "//"
          : "/*"
    reading.problems.expect(
      comment.mark === (comment.range[0] === occurrence.range[0] ? mark : null),
      label(comment),
      "the native Comment mark must agree with its authored match or cut fragment",
    )
    let start = comment.range[0]
    if (comment.mark !== null) {
      let remaining = 2
      while (start < comment.range[1] && remaining > 0) {
        if (!reading.written.isLeftOut(start)) remaining--
        start++
      }
    }
    let end = comment.range[1]
    if (kind === "slash-block-comment" && end === occurrence.range[1]) {
      let remaining = 2
      while (end > start && remaining > 0) {
        end--
        if (!reading.written.isLeftOut(end)) remaining--
      }
    }
    reading.problems.expectEqual(
      comment.value,
      reading.text.slice(start, end),
      label(comment),
      "value of a native Comment",
    )
  }
  for (const occurrence of comments) {
    const ranges = reading.root.comments.map((comment) => comment.range)
    const remainder = reading.converted.of(occurrence.range, ranges)
    reading.problems.expect(
      [...remainder].every((character) =>
        isWhitespace(character.charCodeAt(0)),
      ),
      label(reading.root.body),
      "a native comment match must have its complete Comment records",
    )
  }
}

/** Tree fields and lexical invariants only; parser result records establish acceptance. */
export function checkEventmodelingTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  const nodes = nodesOf(root)
  const diagram = root.body
  const header = ownOf(root, diagram).tokens[0]
  checkTokensInValueNodes(root, problems)
  problems.expect(
    ownOf(root, diagram).tokens.length === 1 &&
      header?.value === "eventmodeling",
    label(diagram),
    "the diagram must own exactly its complete lowercase eventmodeling header",
  )
  if (header === undefined) return
  const units = occurrences(reading, header)
  checkPreheader(reading, diagram)
  checkGap(
    reading,
    diagram,
    root.frontmatter?.range[1] ?? 0,
    header.range[0],
    "textBeforeHeader",
  )
  let end = header.range[1]
  for (const item of entriesOf(diagram, "body")) {
    if (item === null) continue
    checkGap(reading, diagram, end, item.range[0])
    end = item.range[1]
  }
  checkGap(reading, diagram, end, text.length)
  checkComments(reading, units, header.range[1])
  const frames = new Set<CheckedNode>()
  for (const node of nodes) {
    const fields =
      node.type === "EventmodelingTimeFrameStatement" ||
      node.type === "EventmodelingResetFrameStatement"
        ? ["name"]
        : node.type === "EventmodelingSourceReference"
          ? ["frame"]
          : node.type === "EventmodelingNoteStatement" ||
              node.type === "EventmodelingGwtStatement"
            ? ["sourceFrame"]
            : []
    for (const field of fields) {
      const child = childOf(node, field)
      if (child !== null) frames.add(child)
    }
  }
  for (const node of nodes) {
    checkChildTypes(reading, node, EVENTMODELING_CHILD_TYPES)
    checkFieldWords(reading, node, EVENTMODELING_FIELD_WORDS)
    checkListsWithAnEntry(reading, node, EVENTMODELING_NONEMPTY_LISTS)
    const unit = units.find(
      (item) =>
        item.range[0] === node.range[0] && item.range[1] === node.range[1],
    )
    if (node.type === "Identifier") {
      problems.expect(
        unit?.unit.kind === (frames.has(node) ? "frame" : "identifier"),
        label(node),
        "the identifier must be one complete name unit with its position's keyword priority",
      )
      checkTokenKinds(reading, node, ["Identifier"], "an authored name")
    }
    if (node.type === "StringLiteral")
      problems.expect(
        node.closed === true && unit?.unit.kind === "inline",
        label(node),
        "the string must be the complete greedy same-line inline unit",
      )
    if (!node.type.startsWith("Eventmodeling")) continue
    checkStatementNode(reading, node, EVENTMODELING_PUNCTUATORS)
    if (node.type === "EventmodelingLiteral")
      problems.expect(
        textOf(node) !== "",
        label(node),
        "an authored literal is nonempty",
      )
    else if (node.type === "EventmodelingIgnoredText") {
      checkIgnored(reading, node)
      if (node.range[0] >= header.range[1])
        problems.expect(
          unit?.unit.kind === node.kind,
          label(node),
          "a hidden form must be the whole first applicable native match without its consumed LF",
        )
    } else if (COMMON.includes(node.type)) {
      const kind =
        node.type === "EventmodelingTitleStatement"
          ? "title"
          : node.type === "EventmodelingAccTitleStatement"
            ? "accTitle"
            : node.type === "EventmodelingAccDescrStatement"
              ? "accDescr"
              : "accDescrBlock"
      problems.expect(
        unit?.unit.kind === kind,
        label(node),
        "the common statement must be its complete composite unit at the current position after common removals",
      )
      checkPayload(reading, node, unit)
      const expected =
        kind === "title"
          ? "title"
          : kind === "accTitle"
            ? "accTitle:"
            : kind === "accDescr"
              ? "accDescr:"
              : "accDescr{}"
      problems.expectEqual(
        ownOf(root, node).text,
        expected,
        label(node),
        "the common statement's fixed components",
      )
    } else if (
      node.type === "EventmodelingInlineData" ||
      node.type === "EventmodelingDataBlock"
    )
      checkData(reading, node, units)
    else if (node.type === "EventmodelingArrow") {
      problems.expect(
        ownOf(root, node).text === "->>" &&
          node.value === "->>" &&
          unit?.unit.kind === "punctuation",
        label(node),
        "the arrow value and fields must describe its whole authored ->>",
      )
      checkTokenKinds(reading, node, ["Punctuator"], "an authored arrow")
    } else checkStructure(reading, node)
  }
  for (const occurrence of units) {
    const { kind } = occurrence.unit
    if (kind === "yaml-block" || kind === "directive") {
      const owners = nodes.filter(
        (node) =>
          node.type === "EventmodelingIgnoredText" &&
          node.range[0] === occurrence.range[0] &&
          node.range[1] === occurrence.range[1],
      )
      problems.expect(
        owners.length === 1,
        label(diagram),
        "each native hidden match must have exactly one whole IgnoredText owner",
      )
    }
    if (["keyword", "punctuation", "identifier", "frame"].includes(kind)) {
      const expected =
        kind === "keyword"
          ? "Keyword"
          : kind === "punctuation"
            ? "Punctuator"
            : "Identifier"
      problems.expect(
        root.tokens.some(
          (token) =>
            token.type === expected &&
            token.range[0] === occurrence.range[0] &&
            token.range[1] === occurrence.range[1],
        ),
        label(diagram),
        `a whole ${kind} unit must have one complete ${expected} token`,
      )
    }
    if (
      [
        "inline",
        "block",
        "title",
        "accTitle",
        "accDescr",
        "accDescrBlock",
      ].includes(kind)
    ) {
      const owners = nodes.filter((node) => {
        if (kind === "inline" || kind === "block") {
          if (
            node.type !==
            (kind === "inline"
              ? "EventmodelingInlineData"
              : "EventmodelingDataBlock")
          )
            return false
          const value = childOf(node, "value")
          const open =
            value?.type === "StringLiteral"
              ? value
              : ownOf(root, node).tokens.find((token) => token.value === "{")
          return (
            open?.range[0] === occurrence.range[0] &&
            node.range[1] === occurrence.range[1]
          )
        }
        return (
          COMMON.includes(node.type) &&
          node.range[0] === occurrence.range[0] &&
          node.range[1] === occurrence.range[1]
        )
      })
      problems.expect(
        owners.length === 1,
        label(diagram),
        "each composite lexical unit must have exactly one complete authored owner",
      )
    }
  }
}
