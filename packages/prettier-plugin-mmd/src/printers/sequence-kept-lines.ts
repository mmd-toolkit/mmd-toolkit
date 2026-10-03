import type { SequenceStatement } from "@mmd-toolkit/parser"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesWithOwnSemicolons,
  findLinesWithSeparatorAfterIgnoredSemicolon,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import type { SequenceSimpleStatement } from "./sequence-layout.ts"
import { classifySequenceStatement } from "./sequence-layout.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * Finds the kept lines of a sequence diagram: the lines that hold a `;`
 * other than one that separates statements (see
 * `findLinesWithOwnSemicolons`), and the lines of a statement that ends
 * with a unit that reads no whitespace, which a directive and a `;` follow
 * (see `findLinesAfterUnitsThatReadNoWhitespace`). The lines that hold a
 * `;` that the line rule ignores and a U+2028 or U+2029 after it are printed
 * as written (see `findLinesWithSeparatorAfterIgnoredSemicolon`).
 */
export function findSequenceKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const { root } = source
  if (root.body.type !== "SequenceDiagram") {
    throw new Error("prettier-plugin-mmd: kept lines of a non-sequence")
  }
  const kept: KeptLines = {
    joined: new Set([
      ...findLinesWithOwnSemicolons(source, true),
      ...findLinesAfterUnitsThatReadNoWhitespace(source, root.body.body),
    ]),
    verbatim: findLinesWithSeparatorAfterIgnoredSemicolon(source),
    writtenIndentation: new Set(),
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/**
 * The lines of a statement whose last unit does not read the whitespace
 * after it, that a `;` follows after a directive: the `;` is kept, with the
 * directive before it. mermaid.js removes the directive, and whitespace at
 * the end of the line then hides the line break from the statement, which
 * needs one (diagrams/sequence.md, The statement context, rule 2): a
 * statement that needs a `newline` unit is rejected when its line ends with
 * whitespace. The last unit of most of them reads the whitespace with it, a
 * text, an id, or a description after `as`; the two that do not are the
 * data block of a `participant` or an `actor`, and `autonumber`
 * (diagrams/sequence.md, Empty description blocks before a separator).
 * `autonumber`, a space, a directive, and `;` are accepted, while the same
 * without the `;` is rejected, and dropping the `;` would make the printed
 * text rejected.
 */
function findLinesAfterUnitsThatReadNoWhitespace(
  source: Source,
  statements: readonly SequenceStatement[],
): number[] {
  const lines: number[] = []
  for (const statement of statements) {
    const classified = classifySequenceStatement(statement)
    if (classified.kind === "body") {
      lines.push(
        ...findLinesAfterUnitsThatReadNoWhitespace(
          source,
          classified.statement.body,
        ),
      )
    } else if (classified.kind === "sections") {
      for (const section of classified.statement.sections) {
        lines.push(
          ...findLinesAfterUnitsThatReadNoWhitespace(source, section.body),
        )
      }
    } else if (
      endsWithUnitThatReadsNoWhitespace(classified.statement) &&
      isFollowedByDirectiveAndSemicolon(source, statement.range[1])
    ) {
      lines.push(lineStartOf(source, statement.range[0]))
    }
  }
  return lines
}

/**
 * Whether the last unit of a statement does not read the whitespace after
 * it: an `autonumber`, and a `participant` or an `actor` with a data block
 * (see `findLinesAfterUnitsThatReadNoWhitespace`).
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
  const following = source.root.tokens.filter(
    (token) => token.range[0] >= offset,
  )
  const afterDirectives = following.findIndex(
    (token) => token.type !== "Directive",
  )
  return afterDirectives > 0 && following[afterDirectives].value === ";"
}
