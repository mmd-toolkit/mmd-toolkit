import { appendItems } from "./collections.ts"
import type { SequenceStatement } from "@mmd-toolkit/parser"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesWithOwnSemicolons,
  findLinesEndedBySemicolon,
  lineEndOf,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findFirstIndex } from "./source.ts"
import type { SequenceSimpleStatement } from "./sequence-layout.ts"
import { classifySequenceStatement } from "./sequence-layout.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/** The ends that `printedEndAfterSemicolons` gives, by the end of the statement, found with the kept lines. */
const extendedEndsBySource = new WeakMap<Source, ReadonlyMap<number, number>>()

/**
 * Finds the kept lines of a sequence diagram: the lines that hold a `;`
 * other than one that separates statements (see
 * `findLinesWithOwnSemicolons`), and the lines of a statement that ends
 * with a unit that reads no whitespace, which a directive and a `;` follow
 * (see `findStatementsThatEndWithUnitsThatReadNoWhitespace`). The lines that hold a
 * `;` that the line rule ignores and a U+2028 or U+2029 after it are printed
 * as written (see `findLinesEndedBySemicolon`), over the `;` that follow on
 * the lines after it (see `printedEndAfterSemicolons`).
 */
export function findSequenceKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const { root } = source
  if (root.body.type !== "SequenceDiagram") {
    throw new Error("prettier-plugin-mmd: kept lines of a non-sequence")
  }
  const statementsOfUnits = findStatementsThatEndWithUnitsThatReadNoWhitespace(
    root.body.body,
  )
  const linesAfterUnits = statementsOfUnits
    .filter((statement) =>
      isFollowedByDirectiveAndSemicolon(source, statement.range[1]),
    )
    .map((statement) => lineStartOf(source, statement.range[1]))
  const verbatimLines = new Set([
    ...findLinesEndedBySemicolon(source),
    ...linesAfterUnits.filter((line) =>
      holdsLineSeparator(source.text.slice(line, lineEndOf(source, line))),
    ),
  ])
  const extendedEnds = new Map<number, number>()
  const linesOfExtendedEnds = new Set<number>()
  for (const statement of statementsOfUnits) {
    const line = lineStartOf(source, statement.range[1])
    const end = findEndOfSemicolonsAfter(source, statement.range[1])
    if (verbatimLines.has(line)) {
      if (end > lineEndOf(source, line)) {
        extendedEnds.set(statement.range[1], end)
        verbatimLines.add(lineStartOf(source, end - 1))
        linesOfExtendedEnds.add(lineStartOf(source, end - 1))
      }
    } else if (isFollowedByDirectiveAndSemicolon(source, statement.range[1])) {
      extendedEnds.set(statement.range[1], end)
    }
  }
  const kept: KeptLines = {
    joined: new Set([
      ...findLinesWithOwnSemicolons(source),
      ...linesOfExtendedEnds,
      ...linesAfterUnits.filter((line) => verbatimLines.has(line)),
    ]),
    verbatim: verbatimLines,
    ownIndentation: new Set(),
  }
  keptLinesBySource.set(source, kept)
  extendedEndsBySource.set(source, extendedEnds)
  return kept
}

/**
 * Where a statement that ends a line with whitespace and a U+2028 or U+2029
 * is printed to: over the `;` that follow it, which may stand on the lines
 * after it. The unit that ends it reads no whitespace, so the whitespace at
 * the end of its line hides the line break, and the `;` that follows ends
 * the statement: dropping it would leave a statement that needs a `newline`
 * (see `findStatementsThatEndWithUnitsThatReadNoWhitespace`). Undefined when the
 * statement is not one.
 */
export function printedEndAfterSemicolons(
  source: Source,
  statement: SequenceStatement,
): number | undefined {
  if (!extendedEndsBySource.has(source)) findSequenceKeptLines(source)
  return extendedEndsBySource.get(source)?.get(statement.range[1])
}

/**
 * The end of the `;` that follow `offset` in the tokens, with directives
 * between them, or `offset` when none does.
 */
function findEndOfSemicolonsAfter(source: Source, offset: number): number {
  let end = offset
  const { tokens } = source.root
  const first = findFirstIndex(tokens, (token) => token.range[0] >= offset)
  for (let index = first; index < tokens.length; index++) {
    const token = tokens[index]
    if (token.type === "Directive") continue
    if (token.value !== ";") break
    end = token.range[1]
  }
  return end
}

/**
 * Whether a text holds a U+2028 or U+2029. On a line of a unit that reads no
 * whitespace, with a directive and a `;` after it, the character is no
 * whitespace to the `}` that ends the unit, so the line is printed as written
 * (a space in its place would end the line with whitespace).
 */
function holdsLineSeparator(text: string): boolean {
  return text.includes("\u2028") || text.includes("\u2029")
}

/**
 * The statements whose last unit does not read the whitespace after it: the
 * data block of a `participant` or an `actor`, and `autonumber`
 * (diagrams/sequence.md, Empty description blocks before a separator). The
 * last unit of most of the others reads the whitespace with it, a text, an
 * id, or a description after `as`. mermaid.js removes a directive, and
 * whitespace at the end of the line then hides the line break from the
 * statement, which needs one (diagrams/sequence.md, The statement context,
 * rule 2): a statement that needs a `newline` unit is rejected when its line
 * ends with whitespace. `autonumber`, a space, a directive, and `;` are
 * accepted, while the same without the `;` is rejected, and dropping the `;`
 * would make the printed text rejected. So the line of such a statement that
 * a `;` follows after a directive keeps the `;`, and so does one that ends
 * with whitespace and a U+2028 or U+2029 (see `findSequenceKeptLines`).
 */
function findStatementsThatEndWithUnitsThatReadNoWhitespace(
  statements: readonly SequenceStatement[],
): SequenceSimpleStatement[] {
  const found: SequenceSimpleStatement[] = []
  for (const statement of statements) {
    const classified = classifySequenceStatement(statement)
    if (classified.kind === "body") {
      appendItems(
        found,
        findStatementsThatEndWithUnitsThatReadNoWhitespace(
          classified.statement.body,
        ),
      )
    } else if (classified.kind === "sections") {
      for (const section of classified.statement.sections) {
        appendItems(
          found,
          findStatementsThatEndWithUnitsThatReadNoWhitespace(section.body),
        )
      }
    } else if (endsWithUnitThatReadsNoWhitespace(classified.statement)) {
      found.push(classified.statement)
    }
  }
  return found
}

/**
 * Whether the last unit of a statement does not read the whitespace after
 * it: an `autonumber`, and a `participant` or an `actor` with a data block
 * (see `findStatementsThatEndWithUnitsThatReadNoWhitespace`).
 */
function endsWithUnitThatReadsNoWhitespace(
  statement: SequenceSimpleStatement,
): boolean {
  return (
    statement.type === "SequenceAutonumberStatement" ||
    (statement.type === "SequenceParticipantStatement" &&
      statement.data !== null &&
      statement.alias === null)
  )
}

/**
 * Whether one or more directives, and then a `;`, come right after `offset`
 * in the tokens.
 */
function isFollowedByDirectiveAndSemicolon(
  source: Source,
  offset: number,
): boolean {
  const { tokens } = source.root
  const first = findFirstIndex(tokens, (token) => token.range[0] >= offset)
  let after = first
  while (tokens[after]?.type === "Directive") after++
  return after > first && tokens[after]?.value === ";"
}
