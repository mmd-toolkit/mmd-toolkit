import type {
  Range,
  Root,
  StateNoteStatement,
  StateStatement,
  Token,
} from "@mmd-toolkit/parser"
import { parse } from "@mmd-toolkit/parser"
import type { DbSummary, JsonObject, JsonValue } from "@mmd-toolkit/tests"

/**
 * Checks authored note bodies even when trimming leaves the raw Db unchanged.
 * Only verified ASCII-space margins of attached multiline prose notes are
 * restored for comparison; every other Db field remains the actual after value.
 * Throws for a changed body outside that allowance. Line endings follow the
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
      !hasPlainEdges(printed, afterRoot, next, nextClosing) ||
      !isAllowedBodyChange(text, nextText)
    )
      throw new Error("state note body changed beyond an allowed prose margin")
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
): readonly [Token, Token] | null {
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
    ? [end, last]
    : null
}

/** Include the margins and outer blank rows omitted by the literal's range. */
function bodyRange(
  source: string,
  note: StateNoteStatement,
  closing: readonly [Token, Token] | null,
): Range | null {
  if (closing === null) return null
  const openingLine = source.indexOf(
    "\n",
    note.state?.range[1] ?? note.range[0],
  )
  if (openingLine === -1 || openingLine >= closing[0].range[0]) return null
  const closingLine = source.lastIndexOf("\n", closing[0].range[0] - 1) + 1
  const end =
    source.slice(closingLine, closing[0].range[0]).trim() === ""
      ? closingLine
      : closing[0].range[0]
  return [openingLine + 1, end]
}

/** The note's header and closer stay on single lines without owned trivia. */
function hasPlainEdges(
  source: string,
  root: Root,
  note: StateNoteStatement,
  closing: readonly [Token, Token],
): boolean {
  if (note.state === null) return false
  const headerEnd = source.indexOf("\n", note.range[0])
  const closeStart = source.lastIndexOf("\n", closing[0].range[0] - 1) + 1
  const closerGap = source.slice(closing[0].range[1], closing[1].range[0])
  return (
    note.state.range[1] <= headerEnd &&
    source.slice(note.state.range[1], headerEnd).trim() === "" &&
    source.slice(closeStart, closing[0].range[0]).trim() === "" &&
    !closerGap.includes("\n") &&
    closerGap.trim() === "" &&
    !source.slice(...note.range).includes(";") &&
    ![...root.comments, ...root.directives].some(
      (item) => note.range[0] <= item.range[0] && item.range[0] < note.range[1],
    )
  )
}

/** Prose rows are contiguous; their output margins share one ASCII-space width. */
function isAllowedBodyChange(before: string, after: string): boolean {
  if (!before.endsWith("\n") || !after.endsWith("\n")) return false
  if (
    before.slice(0, -1).includes("  \n") ||
    after.slice(0, -1).includes("  \n")
  )
    return false
  const rowsBefore = before.slice(0, -1).split("\n")
  const rowsAfter = after.slice(0, -1).split("\n")
  if (rowsBefore.length !== rowsAfter.length) return false
  let margin: number | undefined
  for (const [index, row] of rowsBefore.entries()) {
    const printed = rowsAfter[index]
    const beforeStart = leadingSpaces(row)
    const afterStart = leadingSpaces(printed)
    const content = row.slice(beforeStart)
    if (!isOrdinaryProse(content) || content !== printed.slice(afterStart))
      return false
    margin ??= afterStart
    if (afterStart !== margin) return false
  }
  return true
}

/** Guard Markdown syntax independently of the printer's body classifier. */
function isOrdinaryProse(row: string): boolean {
  if (
    row === "" ||
    "#>+-!|=:{}".includes(row[0]) ||
    row.includes("%%") ||
    row.includes(";")
  )
    return false
  for (const character of row) {
    if (
      "`*_~[]<>\\".includes(character) ||
      (character !== " " && character.trim() === "")
    )
      return false
  }
  let digitEnd = 0
  while (row[digitEnd] >= "0" && row[digitEnd] <= "9") digitEnd++
  return !(
    digitEnd > 0 &&
    (row[digitEnd] === "." || row[digitEnd] === ")") &&
    (digitEnd + 1 === row.length || row[digitEnd + 1] === " ")
  )
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
