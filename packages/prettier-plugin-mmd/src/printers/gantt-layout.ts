import type {
  GanttAccDescrBlockStatement,
  GanttClickStatement,
  GanttExcludesStatement,
  GanttIncludesStatement,
  GanttStatement,
  GanttTaskStatement,
  Node,
} from "@mmd-toolkit/ast"
import { util } from "prettier"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import type { MermaidAst } from "../parser.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  keepFirstGapLineTails,
  keptAsWritten,
  layoutDescriptionBlock,
  replaceInAtoms,
} from "./layout.ts"
import {
  findKeptBreaks,
  gapKeepsLineBreak,
  holdsJoiningRegion,
  spansKeptBreaks,
} from "./kept-lines.ts"
import {
  accessibilityRules,
  findCallRangeWithTrivia,
  normalizeCallArguments,
  trimTextAfterKeyword,
} from "./statement-rules.ts"
import type { Source } from "./source.ts"
import {
  findTokenEndingBefore,
  findTokensBetween,
  isAtLineEnd,
  isSpaceOrTab,
  textWithoutDirectives,
} from "./source.ts"

/**
 * The node types of a Gantt chart whose text is a value, printed as written:
 * the texts of the statements (descriptions, items of task data, settings,
 * titles, sections, callbacks, accessibility texts), the ids and the list
 * items, and the string of a link. They have no child fields;
 * `tests/value-nodes.test.ts` checks that every other such node type is left
 * out on purpose.
 */
export const ganttValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "GanttLiteral",
])

/**
 * The statements that are printed on one line, the lines of an `accDescr`
 * block excepted: every statement of a Gantt chart. A chart has no block of
 * statements, `section` included, so no statement holds others.
 */
export type GanttPrintedStatement = GanttStatement

/** Which statements a node of the tree is: its statement types, or null. */
export function isGanttStatement(node: MermaidAst): node is GanttStatement {
  switch (node.type) {
    case "GanttTaskStatement":
    case "GanttClickStatement":
    case "GanttDateFormatStatement":
    case "GanttAxisFormatStatement":
    case "GanttTickIntervalStatement":
    case "GanttTodayMarkerStatement":
    case "GanttIncludesStatement":
    case "GanttExcludesStatement":
    case "GanttInclusiveEndDatesStatement":
    case "GanttWeekdayStatement":
    case "GanttWeekendStatement":
    case "GanttTitleStatement":
    case "GanttSectionStatement":
    case "GanttAccTitleStatement":
    case "GanttAccDescrStatement":
    case "GanttAccDescrBlockStatement":
      return true
    default:
      node satisfies Exclude<MermaidAst, GanttStatement>
      return false
  }
}

/**
 * Where the printed text of a statement ends: at its last token, or, for a
 * statement whose keyword or colon needs whitespace after it that its range
 * leaves out, after the first character of that whitespace (see
 * `findBlankRemainder`).
 */
export function findGanttPrintedEnd(
  source: Source,
  statement: GanttStatement,
): number {
  const remainder = findBlankRemainder(source, statement)
  return remainder === null ? statement.range[1] : remainder.end
}

/**
 * The whitespace that is printed after a statement that ends with a keyword
 * or a colon that needs whitespace after it, and holds nothing after it but
 * that whitespace: the `:` of a task whose data is whitespace only (`a : ` is
 * a task with an empty item, `a :` is rejected, and one character is enough)
 * and the keyword of an `includes` or `excludes` statement whose list is
 * whitespace only (the keyword takes one whitespace character, and the list
 * text another one at least). The whitespace is outside the range of the
 * statement, and its first character, or its first two for a list, are
 * printed as written (docs/gantt.md, Task data and Lists). Null when the
 * statement is not of that kind, or when the line goes on after the
 * whitespace with anything but spaces and tabs, which is read by the line
 * (see `findGanttKeptLines`).
 */
export function findBlankRemainder(
  source: Source,
  statement: GanttStatement,
): Atom | null {
  if (!endsWithNeededWhitespace(source, statement)) return null
  const start = statement.range[1]
  const first = source.text[start]
  if (first !== " " && first !== "\t") return null
  let end = start
  while (source.text[end] === " " || source.text[end] === "\t") end++
  // The characters of whitespace that the lexer needs: one after the colon of
  // a task, and, for a list, the one that follows the keyword and one of the
  // list text.
  const needed = statement.type === "GanttTaskStatement" ? 1 : 2
  return isAtLineEnd(source, end) && end - start >= needed
    ? { start, end: start + needed }
    : null
}

/**
 * Whether a statement ends with a keyword or a colon that needs whitespace
 * after it, with nothing in its data: see `findBlankRemainder`.
 */
export function endsWithNeededWhitespace(
  source: Source,
  statement: GanttStatement,
): boolean {
  switch (statement.type) {
    case "GanttTaskStatement":
      return (
        statement.tags.length === 0 &&
        statement.items.length === 1 &&
        statement.items[0] === null
      )
    case "GanttIncludesStatement":
    case "GanttExcludesStatement": {
      const last = findTokenEndingBefore(source, statement.range[1])
      return (
        statement.items.length === 0 &&
        last !== undefined &&
        last.range[0] === statement.range[0]
      )
    }
    default:
      return false
  }
}

/**
 * The layout of a statement, from its start to `end` (the end of its range).
 *
 * - A statement written over several lines stands on one line where the
 *   lexer reads the line break as whitespace, which it does only right after
 *   a keyword and before a part of a statement (diagrams/gantt.md, The
 *   statement context). Trivia keeps structural click/day/list/accessibility
 *   gaps broken, with ordinary continuation columns; raw line values,
 *   semicolon lines and joining regions keep their original layout
 *   (docs/gantt.md, Multi-line statements).
 * - The rules of the gaps are those of docs/gantt.md: Task data, Settings,
 *   Lists, Click statements, and Accessibility statements.
 * - The whitespace after the name of a task is printed so that its colon
 *   stands in the column that `colonColumns` gives (see `findColonColumns`).
 */
export function layoutGanttStatement(
  source: Source,
  statement: GanttStatement,
  end: number,
  colonColumns: ReadonlyMap<GanttTaskStatement, number>,
): AtomLayout {
  const start = statement.range[0]
  if (statement.type === "GanttAccDescrBlockStatement") {
    return layoutDescriptionBlock(source, statement, end, ganttValueNodeTypes)
  }
  const keptBreaks = findKeptBreaks(source, start, end)
  const keepsLineBreaks = spansKeptBreaks(source, keptBreaks, start, end)
  const formatsTriviaLines =
    statement.type === "GanttClickStatement" ||
    statement.type === "GanttWeekdayStatement" ||
    statement.type === "GanttWeekendStatement" ||
    statement.type === "GanttIncludesStatement" ||
    statement.type === "GanttExcludesStatement" ||
    statement.type === "GanttAccTitleStatement" ||
    statement.type === "GanttAccDescrStatement"
  // Trivia prevents joining, but ordinary structural gaps still use atoms.
  // Value columns, semicolon lines and removed-line regions stay written.
  if (
    (keepsLineBreaks &&
      (!formatsTriviaLines || holdsJoiningRegion(source, start, end))) ||
    holdsCaseIgnoredSeparator(source, statement, end)
  ) {
    return keptAsWritten(start, end)
  }
  const atoms = collectAtoms(
    source,
    start,
    end,
    collectValueNodes(statement, ganttValueNodeTypes),
    findCallArgumentsStretches(source, statement),
  )
  trimTextAfterKeyword(
    source,
    atoms,
    textAfterKeyword(source, statement)?.range ?? null,
    statement.type === "GanttTitleStatement",
  )
  if (statement.type === "GanttClickStatement") {
    normalizeCallArguments(source, atoms, statement.call?.args?.range ?? null)
  }
  if (statement.type === "GanttTaskStatement") {
    alignColon(source, statement, atoms, colonColumns)
  }
  const remainder = findBlankRemainder(source, statement)
  if (remainder !== null) atoms.push(remainder)
  return {
    atoms: keepFirstGapLineTails(source, atoms, (from, to) =>
      gapKeepsLineBreak(source, keptBreaks, from, to),
    ),
    rules: statementRules(source, statement, atoms, remainder),
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * Prints the whitespace between the name of a task and its colon as the spaces
 * that put the colon in its column, where `colonColumns` has one for the task
 * (docs/gantt.md, Task data).
 */
function alignColon(
  source: Source,
  task: GanttTaskStatement,
  atoms: Atom[],
  colonColumns: ReadonlyMap<GanttTaskStatement, number>,
): void {
  const column = colonColumns.get(task)
  if (column === undefined) return
  const [from, colon] = task.description.range
  let nameEnd = colon
  while (nameEnd > from && isSpaceOrTab(source.text[nameEnd - 1])) nameEnd--
  const nameWidth = util.getStringWidth(source.text.slice(from, nameEnd))
  replaceInAtoms(source, atoms, [
    { range: [nameEnd, colon], replacement: " ".repeat(column - nameWidth) },
  ])
}

/**
 * The text after the keyword of a statement whose whitespace at the start
 * mermaid.js leaves out of the figure (docs/compatibility.md, Texts after a
 * keyword that are drawn the same): a title, a date format, an axis format.
 * The name of a section is not one: texts that differ by their whitespace are
 * two sections, and not once they are printed alike. A tick interval is
 * matched against its whole text, so a space before it turns the ticks into
 * the default ones. A date format of `D` has another axis than the same text
 * with whitespace around it (ganttRenderer.ts, `makeGrid`).
 */
function textAfterKeyword(
  source: Source,
  statement: GanttStatement,
): Node | null {
  switch (statement.type) {
    case "GanttTitleStatement":
    case "GanttAxisFormatStatement":
      return statement.value
    case "GanttDateFormatStatement":
      return textWithoutDirectives(source, ...statement.value.range).trim() ===
        "D"
        ? null
        : statement.value
    default:
      return null
  }
}

/**
 * The arguments of a call with a comment or a directive among them, from the
 * `(` through the `)`, printed as written (see `findCallRangeWithTrivia`).
 */
function findCallArgumentsStretches(
  source: Source,
  statement: GanttStatement,
): Atom[] {
  const args =
    statement.type === "GanttClickStatement" ? statement.call?.args : null
  if (args === null || args === undefined) return []
  const call = findCallRangeWithTrivia(source, args)
  return call === null ? [] : [{ start: call[0], end: call[1] }]
}

/**
 * Whether the list of an `includes` or `excludes` statement has a U+FEFF
 * between its items. mermaid.js lowers the case of the whole list text before
 * it splits it, and a capital sigma becomes the final `ς` when the character
 * before it, skipping the characters that the conversion ignores, is a
 * letter: U+FEFF is ignored, so `ΑΒ` + U+FEFF + `Σ` ends in `ς`, while with a
 * space, or any other whitespace, the `Σ` stands alone and becomes `σ`. So a
 * list with a U+FEFF is printed as written (docs/gantt.md, Lists).
 */
function holdsCaseIgnoredSeparator(
  source: Source,
  statement: GanttStatement,
  end: number,
): boolean {
  if (
    statement.type !== "GanttIncludesStatement" &&
    statement.type !== "GanttExcludesStatement"
  ) {
    return false
  }
  const first = statement.items.at(0)
  if (first === undefined) return false
  return source.text.slice(first.range[0], end).includes("\uFEFF")
}

/** The gap rules of a statement, by the start of the atom after the gap. */
function statementRules(
  source: Source,
  statement: Exclude<GanttStatement, GanttAccDescrBlockStatement>,
  atoms: readonly Atom[],
  remainder: Atom | null,
): Map<number, GapRule> {
  switch (statement.type) {
    case "GanttTaskStatement":
      return taskRules(source, statement, atoms, remainder)
    case "GanttClickStatement":
      return clickRules(source, statement, atoms)
    case "GanttIncludesStatement":
    case "GanttExcludesStatement":
      return listRules(source, statement, atoms, remainder)
    case "GanttDateFormatStatement":
    case "GanttAxisFormatStatement":
    case "GanttTickIntervalStatement":
    case "GanttTodayMarkerStatement":
    case "GanttTitleStatement":
      return afterKeywordRules(statement.value.range[0])
    case "GanttSectionStatement":
      return afterKeywordRules(statement.name.range[0])
    case "GanttWeekdayStatement":
    case "GanttWeekendStatement":
      // The day is the last token of the statement.
      return afterKeywordRules(
        expectToken(
          findTokenEndingBefore(source, statement.range[1]),
          "the day of a `weekday` or `weekend` statement",
        ).range[0],
      )
    case "GanttInclusiveEndDatesStatement":
      return new Map()
    case "GanttAccTitleStatement":
    case "GanttAccDescrStatement":
      return accessibilityRules(source, statement)
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown statement ${JSON.stringify(statement satisfies never)}`,
      )
  }
}

/** The one rule of a statement of a keyword and its value or day: one space. */
function afterKeywordRules(valueStart: number): Map<number, GapRule> {
  return new Map<number, GapRule>([[valueStart, "space"]])
}

/**
 * The rules of the line of a task: the `:` touches the description, whose
 * range keeps the whitespace before it, what follows the `:` stands after one
 * space, and a `,` touches what is before it and is followed by one space
 * where an item follows (docs/gantt.md, Task data). The whitespace of data
 * that holds only whitespace is one character (see `findBlankRemainder`).
 */
function taskRules(
  source: Source,
  statement: GanttTaskStatement,
  atoms: readonly Atom[],
  remainder: Atom | null,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  const valueStarts = new Set(
    collectValueNodes(statement, ganttValueNodeTypes).map(
      (value) => value.range[0],
    ),
  )
  let afterComma = false
  let colonSeen = false
  let afterColon = false
  for (const atom of atoms.slice(1)) {
    if (remainder !== null && atom.start === remainder.start) {
      rules.set(atom.start, "none")
    } else if (afterColon) {
      // The first item, or the `,` of an empty first item.
      rules.set(atom.start, "space")
      afterColon = false
      afterComma =
        !valueStarts.has(atom.start) && source.text[atom.start] === ","
    } else if (valueStarts.has(atom.start)) {
      rules.set(atom.start, afterComma ? "space" : "none")
      afterComma = false
    } else {
      // The `:` and the `,` units of the data.
      rules.set(atom.start, "none")
      afterComma = source.text[atom.start] === ","
      if (!colonSeen) {
        colonSeen = true
        afterColon = true
        afterComma = false
      }
    }
  }
  return rules
}

/**
 * The rules of a list of `includes` or `excludes`: the first item stands
 * after one space, a `,` touches what is before it, and an item stands after
 * one space, also after a `,` (docs/gantt.md, Lists). Whitespace only is one
 * character after the keyword (see `findBlankRemainder`).
 */
function listRules(
  source: Source,
  statement: GanttIncludesStatement | GanttExcludesStatement,
  atoms: readonly Atom[],
  remainder: Atom | null,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  const itemStarts = new Set(statement.items.map((item) => item.range[0]))
  for (const [index, atom] of atoms.slice(1).entries()) {
    if (remainder !== null && atom.start === remainder.start) {
      rules.set(atom.start, "none")
    } else if (itemStarts.has(atom.start) || index === 0) {
      rules.set(atom.start, "space")
    } else {
      const token = expectToken(
        findTokensBetween(source, atom.start, atom.end).at(0),
        "a `,` of a list",
      )
      expectValue(token, ",")
      rules.set(atom.start, "none")
    }
  }
  return rules
}

/**
 * The rules of a click statement: its ids stand after one space, a `,`
 * touches the id before it and the id after it touches the `,`, since a space
 * ends the id text; each part stands after one space, and so does the name
 * of a call and the string of a link; the `(` touches the name, whose range
 * keeps the whitespace before it, and the arguments touch the parentheses,
 * which touch each other where the arguments are blank (docs/gantt.md, Click
 * statements).
 */
function clickRules(
  source: Source,
  statement: GanttClickStatement,
  atoms: readonly Atom[],
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  const idStarts = new Set(
    statement.ids.filter((id) => id !== null).map((id) => id.range[0]),
  )
  const argsStart = statement.call?.args?.range[0]
  let previousIsComma = false
  for (const [index, atom] of atoms.slice(1).entries()) {
    const token = expectToken(
      findTokensBetween(source, atom.start, atom.end).at(0),
      "a token of a click statement",
    )
    const isPunctuator = token.type === "Punctuator"
    let rule: GapRule | undefined
    if (idStarts.has(atom.start)) {
      rule = previousIsComma ? "none" : "space"
    } else if (isPunctuator && token.value === ",") {
      rule = index === 0 ? "space" : "none"
    } else if (isPunctuator && (token.value === "(" || token.value === ")")) {
      rule = "none"
    } else if (atom.start === argsStart) {
      rule = "none"
    } else {
      // A keyword (`call`, `href`), the name of a call, or the string of a link.
      rule = "space"
    }
    if (rule !== undefined) rules.set(atom.start, rule)
    previousIsComma = isPunctuator && token.value === ","
  }
  return rules
}
