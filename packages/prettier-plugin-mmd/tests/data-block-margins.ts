/**
 * Exposes the formatter's permitted changes of a data block without changing
 * the raw texts. The formatter moves every line of a multi-line block by the
 * same number of spaces and puts a closing `}` that stands on a line of its
 * own at the column of its statement, in spaces, and prints a block of one
 * line with one space inside each end (docs/flowchart.md, Data blocks); every
 * other character stays. A text that is not such a change stays as it is, so
 * that the comparison reports it.
 */
export function dataBlockEmbeddedForFormattingComparison(
  before: readonly string[],
  after: readonly string[],
): readonly string[] {
  return after.map((value, index) => {
    const previous = before[index]
    return previous !== undefined && isAllowedMove(previous, value)
      ? previous
      : value
  })
}

/** The number of spaces that start a row. */
function leadingSpaces(row: string): number {
  let count = 0
  while (row[count] === " ") count++
  return count
}

/** Whether a row is a `}` with only spaces before it. */
function isSpacesThenBrace(row: string): boolean {
  return row.slice(leadingSpaces(row)) === "}"
}

/** Whether a row holds only spaces, or nothing. */
function isBlank(row: string): boolean {
  return leadingSpaces(row) === row.length
}

/**
 * Whether the closing `}` alone on the last row has only spaces before it, no
 * more than the shallowest row that holds text: the whitespace before it is a
 * line of the text that a literal scalar reads, so a deeper one, or one with a
 * tab, cannot be replaced by the indentation of the statement.
 */
function isShallowCloser(rows: readonly string[], closing: number): boolean {
  const row = rows[closing]
  const before = leadingSpaces(row)
  let shallowest = Infinity
  for (let index = 1; index < closing; index++) {
    if (!isBlank(rows[index]))
      shallowest = Math.min(shallowest, leadingSpaces(rows[index]))
  }
  return before <= shallowest
}

/**
 * Whether `after` is the block `before` of one line with the spaces and tabs
 * at the ends of its inside replaced by one space each: `@{ ` and ` }` around
 * the same inside, which holds something other than spaces and tabs. The
 * formatter leaves a block as written that touches another block, which this
 * function cannot tell from the text alone, and one of a diagram type that is
 * not padded.
 */
function isPaddedOneLine(before: string, after: string): boolean {
  if (!before.startsWith("@{") || !before.endsWith("}")) return false
  const inside = before.slice(2, -1)
  // Blocks that the formatter leaves as written: with a directive, with a
  // separator inside, and with a document marker or a directive mark of YAML
  // at the first column, which a space before it would turn into a string.
  if (
    before.includes("%%{") ||
    before.includes("\u2028") ||
    before.includes("\u2029") ||
    inside.startsWith("---") ||
    inside.startsWith("...") ||
    inside.startsWith("%")
  )
    return false
  let start = 0
  let end = inside.length
  while (start < end && (inside[start] === " " || inside[start] === "\t"))
    start++
  while (end > start && (inside[end - 1] === " " || inside[end - 1] === "\t"))
    end--
  return start < end && after === `@{ ${inside.slice(start, end)} }`
}

/**
 * The block with the spaces and tabs removed between the `@` and the `{` of
 * its head, which the formatter drops from the JSON table of a use case
 * diagram (docs/usecase.md, JSON tables). A block with a directive is left
 * as it is, since the formatter leaves it as written.
 */
function withoutHeadPadding(block: string): string {
  if (!block.startsWith("@") || block.includes("%%{")) return block
  let brace = "@".length
  while (block[brace] === " " || block[brace] === "\t") brace++
  return block[brace] === "{" ? `@${block.slice(brace)}` : block
}

/**
 * Whether `after` is `before` with its lines moved by one number of spaces:
 * the same rows, the same first row, the same text in each row that holds
 * text, a blank row as wide as the move leaves it (empty where it leaves none),
 * and a closing `}` alone on its row in both, with spaces before it that are
 * no wider than the shallowest row with text (see `isShallowCloser`).
 */
function isAllowedMove(before: string, after: string): boolean {
  if (before === after) return true
  const head = withoutHeadPadding(before)
  if (head !== before) return isAllowedMove(head, after)
  if (!before.includes("\n") && !after.includes("\n"))
    return isPaddedOneLine(before, after)
  const rowsBefore = before.split("\n")
  const rowsAfter = after.split("\n")
  if (rowsBefore.length !== rowsAfter.length || rowsBefore[0] !== rowsAfter[0])
    return false
  const closing = rowsBefore.length - 1
  const closesAlone =
    isSpacesThenBrace(rowsBefore[closing]) &&
    isSpacesThenBrace(rowsAfter[closing])
  const body = closesAlone ? closing : rowsBefore.length
  if (
    closesAlone &&
    !(
      isShallowCloser(rowsBefore, closing) &&
      isShallowCloser(rowsAfter, closing)
    )
  )
    return false
  let shift: number | undefined
  for (let index = 1; index < body; index++) {
    const written = rowsBefore[index]
    const printed = rowsAfter[index]
    if (isBlank(written) && isBlank(printed)) continue
    if (
      isBlank(written) !== isBlank(printed) ||
      written.slice(leadingSpaces(written)) !==
        printed.slice(leadingSpaces(printed))
    )
      return false
    const rowShift = leadingSpaces(printed) - leadingSpaces(written)
    shift ??= rowShift
    if (rowShift !== shift) return false
  }
  if (shift === undefined) return false
  for (let index = 1; index < body; index++) {
    const written = rowsBefore[index]
    const printed = rowsAfter[index]
    if (!isBlank(written)) continue
    const width = written.length === 0 ? 0 : Math.max(0, written.length + shift)
    if (printed.length !== width) return false
  }
  return true
}
