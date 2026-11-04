import type {
  Range,
  Root,
  StateNoteStatement,
  StateStatement,
  Token,
} from "@mmd-toolkit/parser"
import { parse } from "@mmd-toolkit/parser"
import type { DbSummary, JsonObject, JsonValue } from "@mmd-toolkit/tests"
import { isDeepStrictEqual } from "node:util"
import { Marked, type Token as MarkdownToken } from "marked"

const comparisonMarkdown = new Marked({
  gfm: true,
  breaks: false,
  pedantic: false,
})

/** The two keywords that close a multiline attached note. */
interface NoteClosingTokens {
  readonly end: Token
  readonly note: Token
}

/**
 * Checks authored note bodies even when trimming leaves the raw Db unchanged.
 * Only verified ASCII-space margins of attached multiline paragraph notes are
 * restored for comparison; every other Db field remains the actual after value.
 * First-row-only margins keep raw Db comparison strict. Other changed bodies
 * must meet the paragraph allowance or throw. Line endings follow the
 * formatter's existing CR/CRLF normalization (docs/state.md, Notes).
 */
export function stateDbForFormattingComparison(
  before: DbSummary | null,
  after: DbSummary | null,
  beforeSource: string,
  afterSource: string,
): DbSummary | null {
  const written = withLineFeeds(beforeSource)
  const printed = withLineFeeds(afterSource)
  const beforeRoot = parse(written)
  const afterRoot = parse(printed)
  const beforeNotes = attachedNotes(beforeRoot)
  const afterNotes = attachedNotes(afterRoot)
  if (beforeNotes.length !== afterNotes.length)
    throw new Error("state note count changed while formatting")
  const permitted = new Set<number>()
  for (const [index, note] of beforeNotes.entries()) {
    const next = afterNotes[index]
    const closing = closingTokens(beforeRoot, note)
    const nextClosing = closingTokens(afterRoot, next)
    const body = bodyRange(written, note, closing)
    const nextBody = bodyRange(printed, next, nextClosing)
    if (body === null && nextBody === null) {
      const value = note.text === null ? "" : written.slice(...note.text.range)
      const nextValue =
        next.text === null ? "" : printed.slice(...next.text.range)
      if (value !== nextValue)
        throw new Error("inline state note text changed while formatting")
      continue
    }
    if (body === null || nextBody === null)
      throw new Error("state note body boundaries changed while formatting")
    const text = written.slice(...body)
    const nextText = printed.slice(...nextBody)
    if (text === nextText) continue
    if (
      closing === null ||
      nextClosing === null ||
      !hasPlainEdges(written, beforeRoot, note, closing) ||
      !hasPlainEdges(printed, afterRoot, next, nextClosing)
    )
      throw new Error(
        "state note body changed beyond an allowed paragraph margin",
      )
    if (onlyFirstRowMarginChanged(text, nextText)) continue
    if (!isAllowedBodyChange(text, nextText))
      throw new Error(
        "state note body changed beyond an allowed paragraph margin",
      )
    permitted.add(index)
  }
  if (!Array.isArray(before?.notes) || !Array.isArray(after?.notes))
    return after
  const beforeDbNotes: readonly JsonValue[] = before.notes
  const afterDbNotes: readonly JsonValue[] = after.notes
  return {
    ...after,
    notes: afterDbNotes.map((note, index) => {
      const previous = objectOf(beforeDbNotes[index])
      const current = objectOf(note)
      if (
        !permitted.has(index) ||
        current === undefined ||
        typeof previous?.text !== "string" ||
        typeof current.text !== "string" ||
        !onlyLeadingSpacesChanged(previous.text, current.text)
      )
        return note
      return { ...current, text: previous.text }
    }),
  }
}

/** A trimmed first-row margin needs no Db allowance; every later byte stays. */
function onlyFirstRowMarginChanged(before: string, after: string): boolean {
  const beforeEnd = before.indexOf("\n")
  const afterEnd = after.indexOf("\n")
  if (beforeEnd < 0 || afterEnd < 0) return false
  const content = before.slice(leadingPadding(before), beforeEnd)
  return (
    content !== "" &&
    content[0].trim() !== "" &&
    content === after.slice(leadingSpaces(after), afterEnd) &&
    before.slice(beforeEnd) === after.slice(afterEnd)
  )
}

/** The real attached-note nodes, in the same source walk as the state Db. */
function attachedNotes(root: Root): StateNoteStatement[] {
  if (root.body.type !== "StateDiagram")
    throw new TypeError("state note comparison requires state diagrams")
  const notes: StateNoteStatement[] = []

  /** Follow only the statement bodies that the state Db visits. */
  function visit(statements: readonly StateStatement[]): void {
    for (const statement of statements) {
      if (statement.type === "StateNoteStatement") notes.push(statement)
      if (
        (statement.type === "StateCompositeStatement" ||
          statement.type === "StateAliasDefinitionStatement") &&
        statement.body !== null
      )
        visit(statement.body)
    }
  }

  visit(root.body.body)
  return notes
}

/** The actual final `end` and `note` tokens distinguish block and inline notes. */
function closingTokens(
  root: Root,
  note: StateNoteStatement,
): NoteClosingTokens | null {
  const last = root.tokens.findLast(
    (token) => token.range[1] <= note.range[1] && token.type !== "Directive",
  )
  if (
    last?.type !== "Keyword" ||
    last.value.toLowerCase() !== "note" ||
    last.range[1] !== note.range[1]
  )
    return null
  const end = root.tokens.findLast(
    (token) => token.range[1] <= last.range[0] && token.type !== "Directive",
  )
  return end?.type === "Keyword" && end.value.toLowerCase() === "end"
    ? { end, note: last }
    : null
}

/** Include the margins and outer blank rows omitted by the literal's range. */
function bodyRange(
  source: string,
  note: StateNoteStatement,
  closing: NoteClosingTokens | null,
): Range | null {
  if (closing === null) return null
  const openingLine = source.indexOf(
    "\n",
    note.state?.range[1] ?? note.range[0],
  )
  if (openingLine === -1 || openingLine >= closing.end.range[0]) return null
  const closingLine = source.lastIndexOf("\n", closing.end.range[0] - 1) + 1
  const end =
    source.slice(closingLine, closing.end.range[0]).trim() === ""
      ? closingLine
      : closing.end.range[0]
  return [openingLine + 1, end]
}

/** The note's header and closer stay on single lines without owned trivia. */
function hasPlainEdges(
  source: string,
  root: Root,
  note: StateNoteStatement,
  closing: NoteClosingTokens,
): boolean {
  if (note.state === null) return false
  const headerEnd = source.indexOf("\n", note.range[0])
  const closeStart = source.lastIndexOf("\n", closing.end.range[0] - 1) + 1
  const closerGap = source.slice(closing.end.range[1], closing.note.range[0])
  return (
    note.state.range[1] <= headerEnd &&
    source.slice(note.state.range[1], headerEnd).trim() === "" &&
    source.slice(closeStart, closing.end.range[0]).trim() === "" &&
    !closerGap.includes("\n") &&
    closerGap.trim() === "" &&
    !source.slice(...note.range).includes(";") &&
    ![...root.comments, ...root.directives].some(
      (item) => note.range[0] <= item.range[0] && item.range[0] < note.range[1],
    )
  )
}

/** One paragraph aligns to spaces; its outer blank rows remain byte-for-byte. */
function isAllowedBodyChange(before: string, after: string): boolean {
  if (!before.endsWith("\n") || !after.endsWith("\n")) return false
  const rowsBefore = before.slice(0, -1).split("\n")
  const rowsAfter = after.slice(0, -1).split("\n")
  if (rowsBefore.length !== rowsAfter.length) return false
  const lastContent = rowsBefore.findLastIndex((row) => row.trim() !== "")
  let margin: number | undefined
  let endedParagraph = false
  for (const [index, row] of rowsBefore.entries()) {
    const printed = rowsAfter[index]
    const beforeStart = leadingPadding(row)
    const afterStart = leadingSpaces(printed)
    const content = row.slice(beforeStart)
    if (content === "") {
      if (row !== printed) return false
      endedParagraph ||= margin !== undefined
      continue
    }
    // Only exact inline breaks are exempt from the opaque-source policy.
    const withoutBreakTags = content.split("<br/>").join("")
    if (
      endedParagraph ||
      (margin !== undefined && row.slice(0, beforeStart).includes("\t")) ||
      (index < lastContent && row.endsWith("  ")) ||
      content.startsWith("<br/>") ||
      withoutBreakTags.includes("%%") ||
      withoutBreakTags.includes(";") ||
      [...withoutBreakTags].some(
        (character) =>
          "~[]<>\\".includes(character) ||
          (character !== " " && character.trim() === ""),
      ) ||
      content !== printed.slice(afterStart)
    )
      return false
    margin ??= afterStart
    if (afterStart !== margin) return false
  }
  if (margin === undefined) return false
  const readingBefore = paragraphReading(before)
  const readingAfter = paragraphReading(after)
  return (
    readingBefore !== null &&
    readingAfter !== null &&
    isDeepStrictEqual(readingBefore, readingAfter)
  )
}

/** Read each actual body independently of the printer's Markdown decisions. */
function paragraphReading(body: string): JsonValue[] | null {
  const blocks = comparisonMarkdown.lexer(body.trim())
  const paragraph = blocks[0]
  if (
    blocks.length !== 1 ||
    paragraph.type !== "paragraph" ||
    paragraph.tokens === undefined
  )
    return null
  return inlineReading(paragraph.tokens)
}

/** Only text-node padding after LF may differ; other allowed tokens stay exact. */
function inlineReading(tokens: readonly MarkdownToken[]): JsonValue[] | null {
  const reading: JsonValue[] = []
  for (const token of tokens) {
    switch (token.type) {
      case "text":
        if (token.raw.includes("`") || typeof token.text !== "string")
          return null
        reading.push({
          type: "text",
          text: token.text
            .split("\n")
            .map((line, index) =>
              index === 0 ? line : line.slice(leadingSpaces(line)),
            )
            .join("\n"),
        })
        break
      case "em":
      case "strong": {
        const children =
          token.tokens === undefined ? null : inlineReading(token.tokens)
        if (children === null) return null
        reading.push({ type: token.type, children })
        break
      }
      case "codespan":
      case "link":
        if (token.raw.includes("\n")) return null
        reading.push({ type: token.type, raw: token.raw })
        break
      case "html":
        if (token.raw !== "<br/>" || token.block !== false) return null
        reading.push({ type: "html", raw: token.raw })
        break
      default:
        return null
    }
  }
  return reading
}

/** The Db trims the first row; only later rows may differ in ASCII margins. */
function onlyLeadingSpacesChanged(before: string, after: string): boolean {
  const rowsBefore = before.split("\n")
  const rowsAfter = after.split("\n")
  return (
    rowsBefore.length === rowsAfter.length &&
    rowsBefore.every((row, index) =>
      index === 0
        ? row === rowsAfter[index]
        : row.slice(leadingSpaces(row)) ===
          rowsAfter[index].slice(leadingSpaces(rowsAfter[index])),
    )
  )
}

/** Only the two ASCII indentation characters may be replaced in a paragraph. */
function leadingPadding(value: string): number {
  let end = 0
  while (value[end] === " " || value[end] === "\t") end++
  return end
}

/** The complete ASCII-space prefix, excluding tabs and other whitespace. */
function leadingSpaces(value: string): number {
  let end = 0
  while (value[end] === " ") end++
  return end
}

/** A Db note record, excluding arrays, null and missing entries. */
function objectOf(value: JsonValue | undefined): JsonObject | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : undefined
}

/** The existing formatter allowance for CRLF and lone CR. */
function withLineFeeds(value: string): string {
  return value.split("\r\n").join("\n").split("\r").join("\n")
}
