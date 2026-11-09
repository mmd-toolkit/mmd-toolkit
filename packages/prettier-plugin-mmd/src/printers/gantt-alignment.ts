import type { GanttStatement, GanttTaskStatement } from "@mmd-toolkit/ast"
import type { ParserOptions } from "prettier"
import { util } from "prettier"
import type { MermaidAst } from "../parser.ts"
import { maxOf } from "./collections.ts"
import type { KeptLines } from "./kept-lines.ts"
import { isInsideStyleRuleStretch, lineStartOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { isSpaceOrTab } from "./source.ts"
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
 * colon of a task, for the tasks whose colons it moves: the tasks of a section
 * where a name has padding before its colon (more than one whitespace
 * character, or a tab), whether the colons are in one column or not
 * (docs/gantt.md, Task data). Mermaid keeps the whitespace before the colon in
 * the name of the task, and draws the same figure (docs/compatibility.md,
 * Texts after a keyword that are drawn the same).
 *
 * The column of such a section is one space after its longest name. Where all
 * the sections with padding have their colons in one and the same column, they
 * share the column: one space after the longest of their longest names. A
 * section whose names are all followed by one space, with its colons in that
 * column, is part of the sharing too, since it is what a section with padding
 * becomes when its padding goes, but its lines are not changed. The tasks
 * before the first `section` are a section of their own and share nothing, as
 * they stand one level less deep. A section, or the sharing sections where any
 * of them would, is left as it is where the aligned lines would be longer than
 * `printWidth` and longer than they are; a chart that holds `white-space` is
 * left as it is, since its CSS may draw the whitespace. A task whose line holds
 * a comment, a directive, or a `;` of its own, or runs over lines, is no part of
 * a section's tasks.
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

  /** Sets the column of the tasks of the sections, where every line fits. */
  function align(
    sections: readonly (readonly TaskRow[])[],
    column: number,
    depth: number,
  ): void {
    const indentWidth = depth * options.tabWidth
    const fits = sections.every((section) =>
      section.every((row) => {
        const longer = indentWidth + column + row.widthFromColon
        return (
          longer <= options.printWidth ||
          longer <= indentWidth + row.column + row.widthFromColon
        )
      }),
    )
    if (!fits) return
    for (const section of sections)
      for (const row of section) columns.set(row.task, column)
  }

  // The tasks before the first section stand one level less deep.
  const [before, ...after] = findSections(source, statements, kept)
  if (isPadded(before)) align([before], longestName(before) + 1, 1)
  const padded = after.filter(isPadded)
  const shared = commonColumn(padded.flat())
  if (shared === null) {
    for (const section of padded) align([section], longestName(section) + 1, 2)
  } else {
    const members = [
      ...padded,
      ...after.filter(
        (section) =>
          !isPadded(section) &&
          section.every((row) => row.column - row.nameWidth === 1) &&
          commonColumn(section) === shared,
      ),
    ]
    align(padded, maxOf(members.map(longestName)) + 1, 2)
  }
  return columns
}

/** Whether a name of a section has padding before its colon. */
function isPadded(section: readonly TaskRow[]): boolean {
  return section.some((row) => row.padded)
}

/** The width of the longest name of a section. */
function longestName(section: readonly TaskRow[]): number {
  return maxOf(section.map((row) => row.nameWidth))
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
      const row = toRow(source, statement, kept.verbatim)
      if (row !== null) sections.at(-1)!.push(row)
    }
  }
  return sections.filter((rows, index) => index === 0 || rows.length > 0)
}

/** The row of a task whose line the printer may align, or null. */
function toRow(
  source: Source,
  task: GanttTaskStatement,
  verbatimLines: ReadonlySet<number>,
): TaskRow | null {
  const lineStart = lineStartOf(source, task.range[0])
  if (
    verbatimLines.has(lineStart) ||
    source.text.slice(task.range[0], task.range[1]).includes("\n")
  )
    return null
  const [from, colon] = task.description.range
  // A directive that touches the colon ends the description before it.
  if (source.text[colon] !== ":") return null
  let nameEnd = colon
  while (nameEnd > from && isSpaceOrTab(source.text[nameEnd - 1])) nameEnd--
  if (nameEnd === from) return null
  const padding = source.text.slice(nameEnd, colon)
  // The line rule of mermaid.js reads whether whitespace lies between a `:` and
  // a later `#` (common.md, The `style` and `classDef` lines), so a colon that
  // touches its name there stays touching.
  if (padding === "" && isInsideStyleRuleStretch(source, colon, colon))
    return null
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
