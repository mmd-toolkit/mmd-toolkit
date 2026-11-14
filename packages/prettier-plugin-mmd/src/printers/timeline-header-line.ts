import type { Node, TimelineStatement } from "@mmd-toolkit/ast"
import { lineStartOf } from "./kept-lines.ts"
import { expectToken } from "./layout.ts"
import type { Source } from "./source.ts"
import { findStructuralToken, isWhitespace, textRead } from "./source.ts"

/** The statements on the lines of the header, found once per source. */
const headerLineStatementsBySource = new WeakMap<
  Source,
  readonly TimelineStatement[]
>()

/**
 * The statements that stand on a line whose text a version of mermaid.js that
 * reads no direction draws as the text of a period: the statements that start
 * on the line of the header of a timeline that has a direction, and those that
 * start on the line where a description block of that line ends, since that
 * version reads each line of the block as such a text (docs/timeline.md, Header
 * and direction).
 */
export function findTimelineHeaderLineStatements(
  source: Source,
): readonly TimelineStatement[] {
  const cached = headerLineStatementsBySource.get(source)
  if (cached !== undefined) return cached
  const found: TimelineStatement[] = []
  const { body } = source.root
  if (body.type === "TimelineDiagram" && body.direction !== null) {
    const keyword = expectToken(
      findStructuralToken(source, body.range[0]),
      "the header keyword",
    )
    const direction = expectToken(
      findStructuralToken(source, keyword.range[1]),
      "the direction of the header",
    )
    // The line breaks that count are the ones mermaid.js reads: a line break
    // inside a directive is removed with it.
    let blockEndLine: number | undefined
    for (const statement of body.body) {
      const onLine =
        !textRead(source, direction.range[1], statement.range[0]).includes(
          "\n",
        ) ||
        (blockEndLine !== undefined &&
          lineStartOf(source, statement.range[0]) === blockEndLine)
      if (!onLine) break
      found.push(statement)
      if (statement.type !== "TimelineAccDescrBlockStatement") break
      blockEndLine = lineStartOf(source, statement.range[1] - 1)
    }
  }
  headerLineStatementsBySource.set(source, found)
  return found
}

/**
 * Whether a statement stays on a line of the header, with the whitespace of
 * its gap printed as the whitespace of a text that an old version draws
 * (`BlockRules.textGapBefore`).
 */
export function staysOnTimelineHeaderLine(
  source: Source,
  statement: Node,
): boolean {
  return findTimelineHeaderLineStatements(source).some(
    (found) => found === statement,
  )
}

/**
 * Whether the gap follows a nonempty description block on one header line
 * whose printed text is not padded on both sides. Header text gaps collapse
 * runs of spaces and tabs without adding or removing padding, so this test
 * of the brace interior also holds after printing, including directives.
 * Empty, doubly padded and multi-line blocks keep their text whitespace
 * (docs/timeline.md, Header and direction).
 */
export function followsOneLineTimelineHeaderDescriptionBlock(
  source: Source,
  start: number,
): boolean {
  return findTimelineHeaderLineStatements(source).some((statement) => {
    if (
      statement.type !== "TimelineAccDescrBlockStatement" ||
      statement.range[1] !== start ||
      lineStartOf(source, statement.range[0]) !== lineStartOf(source, start - 1)
    )
      return false
    const keyword = expectToken(
      findStructuralToken(source, statement.range[0]),
      "the description keyword",
    )
    const opening = expectToken(
      findStructuralToken(source, keyword.range[1]),
      "the description opener",
    )
    const inside = source.text.slice(opening.range[1], start - 1)
    return (
      inside.trim() !== "" &&
      !(isWhitespace(inside[0]) && isWhitespace(inside[inside.length - 1]))
    )
  })
}
