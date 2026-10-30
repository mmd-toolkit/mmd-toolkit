import { appendItems } from "./collections.ts"
import type { BlockStatement } from "@mmd-toolkit/parser"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * Finds the kept lines of a block diagram, as in the other diagram types: the
 * lines that hold a `;` (a `;` is a character of an id in a block diagram, and
 * separates nothing), whose statements stay together, and the lines that a `;`
 * decides the end of, which are printed as written (see
 * `findLinesWithOwnSemicolons` and `findLinesEndedBySemicolon`). Also the
 * lines that hold a statement that starts with `%%`: mermaid.js reads `%%x`
 * after a node as an id, and a line that starts with `%%x` as a comment line,
 * so the statement does not move to the start of a line (docs/block.md, Rows).
 */
export function findBlockKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const body = source.root.body
  if (body.type !== "BlockDiagram") {
    throw new Error(
      `prettier-plugin-mmd: ${body.type} is no block diagram that has kept lines`,
    )
  }
  const joined = new Set(findLinesWithOwnSemicolons(source))
  for (const offset of findPercentStatements(body.body)) {
    joined.add(lineStartOf(source, offset))
  }
  const kept: KeptLines = {
    joined,
    verbatim: findLinesEndedBySemicolon(source),
    ownIndentation: new Set(),
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/**
 * The starts of the statements that start with `%%`, among the statements and
 * the statements of the composites below them.
 */
function findPercentStatements(
  statements: readonly BlockStatement[],
): number[] {
  const offsets: number[] = []
  for (const statement of statements) {
    if (statement.type === "BlockCompositeStatement") {
      appendItems(offsets, findPercentStatements(statement.body))
    } else if (
      statement.type === "BlockNodeStatement" &&
      statement.node.id.name.startsWith("%%")
    ) {
      offsets.push(statement.range[0])
    }
  }
  return offsets
}
