import type { GanttStatement, GanttTaskStatement } from "@mmd-toolkit/ast"
import type { ParserOptions } from "prettier"
import { util } from "prettier"
import type { MermaidAst } from "../parser.ts"
import { maxOf } from "./collections.ts"
import type { KeptLines } from "./kept-lines.ts"
import { lineEndOf, lineStartOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween, isSpaceOrTab } from "./source.ts"
import { holdsWhiteSpaceProperty } from "./text-runs.ts"

/**
 * A task line whose colon the printer may move: the width of its name, the
 * column of its colon, whether its name is followed by more than one
 * whitespace character (or a tab) as padding, and the width of the line from
 * the colon on.
 */
interface TaskRow {
  readonly task: GanttTaskStatement
  readonly nameWidth: number
  readonly column: number
  readonly padded: boolean
  readonly widthFromColon: number
}

/** The places of the colons of the tasks of a chart, for the options used. */
interface Alignment {
  readonly printWidth: number
  readonly tabWidth: number
  /** The column, counted from the start of the name, of the colons to move. */
  readonly columns: ReadonlyMap<GanttTaskStatement, number>
}

const alignmentBySource = new WeakMap<Source, Alignment>()

/**
 * The column, counted from the start of the name, at which the printer puts the
 * colon of a task, for the tasks whose colons it moves: the task of a section
 * whose colons do not stand in one column, though a name of the section has
 * padding before its colon, so that the author meant to align them
 * (docs/gantt.md, Task data). Mermaid keeps the whitespace before the colon in
 * the name of the task, and draws the same figure (docs/compatibility.md,
 * Texts after a keyword that are drawn the same).
 *
 * The tasks before the first `section` are a section of their own. The column
 * of a section is the one that every other section of the chart has, when all
 * of them have one column and it stands after the longest name of the section,
 * and otherwise the one after the longest name of the section. A section is
 * left as it is where the aligned lines would be longer than `printWidth` and
 * longer than they are; a chart that holds `white-space` is left as it is,
 * since its CSS may draw the whitespace. A task whose line holds a comment, a
 * directive, or a `;` of its own, or runs over lines, is no part of a section's
 * tasks.
 */
export function findColonColumns(
  source: Source,
  statements: readonly GanttStatement[],
  kept: KeptLines,
  options: ParserOptions<MermaidAst>,
): ReadonlyMap<GanttTaskStatement, number> {
  const cached = alignmentBySource.get(source)
  if (
    cached !== undefined &&
    cached.printWidth === options.printWidth &&
    cached.tabWidth === options.tabWidth
  )
    return cached.columns
  const columns = new Map<GanttTaskStatement, number>()
  alignmentBySource.set(source, {
    printWidth: options.printWidth,
    tabWidth: options.tabWidth,
    columns,
  })
  if (holdsWhiteSpaceProperty(source)) return columns
  const sections = findSections(source, statements, kept)
  // The tasks before the first section stand one level less deep.
  const [before, ...after] = sections
  for (const [index, section] of sections.entries()) {
    if (section.length < 2 || !needsAlignment(section)) continue
    const longest = maxOf(section.map((row) => row.nameWidth))
    const common = commonColumn(
      index === 0 ? [] : after.filter((rows) => rows !== section).flat(),
    )
    const column = common !== null && common > longest ? common : longest + 1
    const depth = section === before ? 1 : 2
    const indentWidth = depth * options.tabWidth
    if (
      section.some((row) => {
        const longer = indentWidth + column + row.widthFromColon
        return (
          longer > options.printWidth &&
          longer > indentWidth + row.column + row.widthFromColon
        )
      })
    )
      continue
    for (const row of section) columns.set(row.task, column)
  }
  return columns
}

/** Whether the colons of a section are in more than one column and padded. */
function needsAlignment(section: readonly TaskRow[]): boolean {
  return section.some((row) => row.padded) && commonColumn(section) === null
}

/** The column that every row has for its colon, or null. */
function commonColumn(rows: readonly TaskRow[]): number | null {
  const first = rows.at(0)
  return first !== undefined && rows.every((row) => row.column === first.column)
    ? first.column
    : null
}

/**
 * The task lines of the chart that the printer may align, in groups: the tasks
 * before the first `section`, and the tasks of each `section` (a group with no
 * such task is left out, but the first group is kept in its place when it is
 * not empty).
 */
function findSections(
  source: Source,
  statements: readonly GanttStatement[],
  kept: KeptLines,
): TaskRow[][] {
  const sections: TaskRow[][] = [[]]
  for (const statement of statements) {
    if (statement.type === "GanttSectionStatement") sections.push([])
    else if (statement.type === "GanttTaskStatement") {
      const row = toRow(source, statement, kept.joined, kept.verbatim)
      if (row !== null) sections.at(-1)!.push(row)
    }
  }
  return sections.filter((rows, index) => index === 0 || rows.length > 0)
}

/** The row of a task whose line the printer may align, or null. */
function toRow(
  source: Source,
  task: GanttTaskStatement,
  joinedLines: ReadonlySet<number>,
  verbatimLines: ReadonlySet<number>,
): TaskRow | null {
  const lineStart = lineStartOf(source, task.range[0])
  const lineEnd = lineEndOf(source, task.range[1])
  if (
    joinedLines.has(lineStart) ||
    verbatimLines.has(lineStart) ||
    source.text.slice(task.range[0], task.range[1]).includes("\n") ||
    findTriviaBetween(source, lineStart, lineEnd).length > 0
  )
    return null
  const [from, colon] = task.description.range
  let nameEnd = colon
  while (nameEnd > from && isSpaceOrTab(source.text[nameEnd - 1])) nameEnd--
  if (nameEnd === from) return null
  const padding = source.text.slice(nameEnd, colon)
  const nameWidth = util.getStringWidth(source.text.slice(from, nameEnd))
  return {
    task,
    nameWidth,
    column: nameWidth + padding.length,
    padded: padding !== "" && padding !== " ",
    widthFromColon: util.getStringWidth(
      source.text.slice(colon, task.range[1]),
    ),
  }
}
