import type {
  GanttAccDescrBlockStatement,
  GanttClickStatement,
  GanttExcludesStatement,
  GanttIncludesStatement,
  GanttStatement,
  GanttTaskStatement,
  Node,
  Token,
} from "@mmd-toolkit/parser"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import type { MermaidAst } from "../parser.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  findAccDescrBlockClosing,
  findAccDescrBlockStretches,
  spansLinesThatCannotJoin,
} from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenEndingBefore,
  findTokensBetween,
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

/** The layout of the header line: the keyword `gantt`. */
export function layoutGanttHeader(source: Source, keyword: Token): AtomLayout {
  return {
    atoms: collectAtoms(source, keyword.range[0], keyword.range[1], [], []),
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/** A layout of one atom, the text from `start` to `end` as written. */
function keptAsWritten(start: number, end: number): AtomLayout {
  return {
    atoms: [{ start, end }],
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
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

/** Whether the text ends at `offset` or a line terminator stands there. */
function isAtLineEnd(source: Source, offset: number): boolean {
  return (
    offset >= source.text.length ||
    source.text[offset] === "\n" ||
    source.text[offset] === "\r"
  )
}

/**
 * The layout of a statement, from its start to `end` (the end of its range).
 *
 * - A statement written over several lines stands on one line where the
 *   lexer reads the line break as whitespace, which it does only right after
 *   a keyword and before a part of a statement (diagrams/gantt.md, The
 *   statement context); one with a comment or a directive in it is kept as
 *   written (see `spansLinesThatCannotJoin`). The lines of an `accDescr`
 *   block are lines of its text, and are kept (docs/gantt.md, Accessibility
 *   statements).
 * - The rules of the gaps are those of docs/gantt.md: Task data, Settings,
 *   Lists, Click statements, and Accessibility statements.
 */
export function layoutGanttStatement(
  source: Source,
  statement: GanttStatement,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  if (statement.type === "GanttAccDescrBlockStatement") {
    return layoutDescriptionBlock(source, statement, end)
  }
  if (
    spansLinesThatCannotJoin(source, start, end) ||
    holdsCaseIgnoredSeparator(source, statement, end)
  ) {
    return keptAsWritten(start, end)
  }
  const atoms = collectAtoms(
    source,
    start,
    end,
    collectValueNodes(statement, ganttValueNodeTypes),
    [],
  )
  const remainder = findBlankRemainder(source, statement)
  if (remainder !== null) atoms.push(remainder)
  return {
    atoms,
    rules: statementRules(source, statement, atoms, remainder),
    outdented: new Set(),
    lineBreaks: "joined",
  }
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

/**
 * The layout of an `accDescr { ... }` block: the lines of its text are kept
 * as written and its `}` stands at the level of the statement
 * (docs/gantt.md, Accessibility statements). A block without text is printed
 * on one line, as any statement is.
 */
function layoutDescriptionBlock(
  source: Source,
  statement: GanttAccDescrBlockStatement,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  if (statement.value === null) {
    if (spansLinesThatCannotJoin(source, start, end)) {
      return keptAsWritten(start, end)
    }
    return {
      atoms: collectAtoms(source, start, end, [], []),
      rules: new Map(),
      outdented: new Set(),
      lineBreaks: "joined",
    }
  }
  // A description block of a Gantt chart is always closed: one that is not is
  // rejected (diagrams/gantt.md, Units and contexts).
  const block = { range: statement.range, value: statement.value, closed: true }
  const closing = findAccDescrBlockClosing(source, block)
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      collectValueNodes(statement, ganttValueNodeTypes),
      findAccDescrBlockStretches(source, block),
    ),
    rules: new Map(),
    outdented: closing === null ? new Set() : new Set([closing]),
    lineBreaks: "kept",
  }
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
 * range keeps the whitespace before it, the first item touches the `:`, and
 * a `,` touches what is before it and is followed by one space where an item
 * follows (docs/gantt.md, Task data). The whitespace of data that holds only
 * whitespace is one character (see `findBlankRemainder`).
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
  for (const atom of atoms.slice(1)) {
    if (remainder !== null && atom.start === remainder.start) {
      rules.set(atom.start, "none")
    } else if (valueStarts.has(atom.start)) {
      rules.set(atom.start, afterComma ? "space" : "none")
      afterComma = false
    } else {
      // The `:` and the `,` units of the data.
      rules.set(atom.start, "none")
      afterComma = source.text[atom.start] === ","
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
 * keeps the whitespace before it, and the arguments touch the parentheses
 * (docs/gantt.md, Click statements).
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
    } else if (isPunctuator && token.value === "(") {
      rule = "none"
    } else if (atom.start === argsStart) {
      rule = "none"
    } else if (isPunctuator && token.value === ")") {
      // The `)` touches the arguments. Where the arguments are blank, there
      // are none to touch, and the whitespace between the parentheses stays
      // as in the source, a run of it as one space.
      rule = argsStart === undefined ? undefined : "none"
    } else {
      // A keyword (`call`, `href`), the name of a call, or the string of a link.
      rule = "space"
    }
    if (rule !== undefined) rules.set(atom.start, rule)
    previousIsComma = isPunctuator && token.value === ","
  }
  return rules
}

/**
 * The rules of an `accTitle` or `accDescr` line: the `:` touches the keyword
 * and the text stands after one space (docs/gantt.md, Accessibility
 * statements).
 */
function accessibilityRules(
  source: Source,
  statement: Extract<
    GanttStatement,
    { type: "GanttAccTitleStatement" | "GanttAccDescrStatement" }
  >,
): Map<number, GapRule> {
  const keyword = expectToken(
    findStructuralToken(source, statement.range[0]),
    "`accTitle` or `accDescr`",
  )
  const colon = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the `:` after `accTitle` or `accDescr`",
  )
  expectValue(colon, ":")
  return new Map<number, GapRule>([
    [colon.range[0], "none"],
    [statement.value.range[0], "space"],
  ])
}
