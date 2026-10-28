import type { KeptLines } from "./kept-lines.ts"
import { maxOf } from "./collections.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineEndOf,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTokensBetween, isCommentLine, isStructural } from "./source.ts"

/**
 * Venn has no separating semicolons. A swallowed header fragment also
 * stays on its header line (docs/venn.md, Comments and Line rule and kept lines).
 */
export function findVennKeptLines(source: Source): KeptLines {
  const diagram = source.root.body
  if (diagram.type !== "VennDiagram")
    throw new Error("prettier-plugin-mmd: kept lines of a non-venn diagram")
  const joined = new Set(findLinesWithOwnSemicolons(source))
  // A directive touching a following statement cannot move to another line
  // without losing that relation. Keep its authored line when another
  // statement or the header precedes it (docs/venn.md, Directives).
  for (const directive of source.root.directives) {
    const line = lineStartOf(source, directive.range[0])
    if (
      diagram.body.some(
        (statement) => statement.range[0] === directive.range[1],
      ) &&
      findTokensBetween(source, line, directive.range[0]).some((token) =>
        isStructural(source, token),
      )
    )
      joined.add(line)
  }
  const first = diagram.body[0]
  if (
    first?.type === "VennIgnoredText" &&
    lineStartOf(source, first.range[0]) ===
      lineStartOf(source, diagram.range[0])
  )
    joined.add(lineStartOf(source, first.range[0]))
  // Whole values and every semicolon already stay in the prefix. Only an
  // unclosed directive needs the shared verbatim path: its stopping point
  // depends on the line after its argument (docs/venn.md, Directives).
  const verbatim = new Set(
    [...findLinesEndedBySemicolon(source)].filter((line) =>
      source.root.directives.some(
        (directive) =>
          !directive.closed && lineStartOf(source, directive.range[1]) === line,
      ),
    ),
  )
  return {
    joined,
    verbatim,
    writtenIndentation: new Set([...joined, ...verbatim]),
  }
}

/**
 * The printer's protected stretches keep whole comments and directives, even
 * across a shared line-rule segment boundary inside a diagram comment.
 * Exterior padding is printer whitespace (docs/venn.md, Line rule and kept lines).
 */
export function vennDiagramLineEnd(source: Source, offset: number): number {
  let end = lineEndOf(source, offset, true)
  const protectedEnd = Math.max(
    offset,
    maxOf(
      findTokensBetween(source, offset, end).map((token) => token.range[1]),
    ),
    maxOf(
      source.trivia
        .filter((item) => offset <= item.range[0] && item.range[0] < end)
        .map((item) => item.range[1]),
    ),
  )
  while (
    end > protectedEnd &&
    (source.text[end - 1] === " " || source.text[end - 1] === "\t")
  )
    end--
  return end
}

/** The protected semicolon prefix includes inline gaps between statements. */
export function vennKeptPrefixEnd(source: Source, offset: number): number {
  const end = vennDiagramLineEnd(source, offset)
  const last = source.text.lastIndexOf(";", end - 1)
  return last >= offset ? last + 1 : offset
}

/**
 * Diagram-comment gaps protect the line-start context, notably an empty
 * braces percent line after an empty versus a whitespace-only line. No
 * recovery-line or post-Unicode indentation rule is imported from C4/kanban
 * (diagrams/venn.md, Text and implicit text mode; docs/venn.md, Blank lines).
 */
export function vennKeptGapEnd(
  source: Source,
  start: number,
  end: number,
  beforeStatement: boolean,
): number | undefined {
  const comments = source.root.comments.filter(
    (comment) =>
      start <= comment.range[1] &&
      comment.range[0] < end &&
      !isCommentLine(source.text, source.root, comment),
  )
  if (comments.length === 0) return undefined
  const gap = source.text.slice(start, end)
  if (gap.indexOf("\n") === gap.lastIndexOf("\n")) return undefined
  if (!beforeStatement) return end
  let stop = end
  while (
    stop > start &&
    (source.text[stop - 1] === " " || source.text[stop - 1] === "\t")
  )
    stop--
  return stop
}
