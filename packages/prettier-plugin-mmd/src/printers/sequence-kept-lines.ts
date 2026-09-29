import type { Range, SequenceStatement } from "@mmd-toolkit/parser"
import type { KeptLines } from "./kept-lines.ts"
import { findLinesWithOwnSemicolons } from "./kept-lines.ts"
import { classifySequenceStatement } from "./sequence-layout.ts"
import type { Source } from "./source.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * Finds the kept lines of a sequence diagram: the lines that hold a `;`
 * other than one that separates statements (see
 * `findLinesWithOwnSemicolons`). No line of a sequence diagram is printed
 * as written.
 */
export function findSequenceKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const { root } = source
  if (root.body.type !== "SequenceDiagram") {
    throw new Error("prettier-plugin-mmd: kept lines of a non-sequence")
  }
  const kept: KeptLines = {
    joined: findLinesWithOwnSemicolons(
      source,
      collectStatementRanges(root.body.body),
    ),
    verbatim: new Set(),
    writtenIndentation: new Set(),
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/**
 * The ranges of the statements that hold no other statement, at every
 * depth: a `;` token inside one of them is one that the line rule ignores,
 * not one that separates statements.
 */
function collectStatementRanges(
  statements: readonly SequenceStatement[],
): Range[] {
  const ranges: Range[] = []
  for (const statement of statements) {
    const classified = classifySequenceStatement(statement)
    switch (classified.kind) {
      case "body":
        ranges.push(...collectStatementRanges(classified.statement.body))
        break
      case "sections":
        for (const section of classified.statement.sections) {
          ranges.push(...collectStatementRanges(section.body))
        }
        break
      case "simple":
        ranges.push(statement.range)
        break
      default:
        throw new Error(
          `prettier-plugin-mmd: unknown kind of statement ${JSON.stringify(classified satisfies never)}`,
        )
    }
  }
  return ranges
}
