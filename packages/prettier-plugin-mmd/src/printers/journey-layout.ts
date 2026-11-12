import type {
  JourneyAccDescrBlockStatement,
  JourneyStatement,
  JourneyTaskStatement,
  Node,
} from "@mmd-toolkit/ast"
import type { MermaidAst } from "../parser.ts"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import {
  collectAtoms,
  collectValueNodes,
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
import { accessibilityRules, trimTextAfterKeyword } from "./statement-rules.ts"
import type { Source } from "./source.ts"
import {
  findTriviaBetween,
  isAtLineEnd,
  isSpaceOrTab,
  isWhitespace,
} from "./source.ts"

/**
 * The node types of a user journey whose text is a value, printed as written:
 * the texts of the statements (descriptions, scores, people, titles,
 * sections, accessibility texts) and the data that mermaid.js does not read.
 * They have no child fields; `tests/value-nodes.test.ts` checks that every
 * other such node type is left out on purpose.
 */
export const journeyValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "JourneyLiteral",
  "JourneyIgnoredText",
])

/** Whether a node of the tree is a statement of a user journey. */
export function isJourneyStatement(node: MermaidAst): node is JourneyStatement {
  switch (node.type) {
    case "JourneyTaskStatement":
    case "JourneyTitleStatement":
    case "JourneySectionStatement":
    case "JourneyAccTitleStatement":
    case "JourneyAccDescrStatement":
    case "JourneyAccDescrBlockStatement":
      return true
    default:
      node satisfies Exclude<MermaidAst, JourneyStatement>
      return false
  }
}

/**
 * Where the printed text of a statement ends: at its last token, or, for a
 * task whose data is whitespace only, after the first character of that
 * whitespace (see `findBlankRemainder`).
 */
export function findJourneyPrintedEnd(
  source: Source,
  statement: JourneyStatement,
): number {
  const remainder = findBlankRemainder(source, statement)
  return remainder === null ? statement.range[1] : remainder.end
}

/**
 * The whitespace that is printed after a task whose data is whitespace only:
 * `A: ` is a task, with the score and the people empty, while `A:` is
 * rejected, since the data text has a character at least. The whitespace is
 * outside the range of the task, and its first character is printed as
 * written (docs/journey.md, Task data). Null when the task is not of that
 * kind, or when the line goes on after the whitespace with anything but
 * spaces and tabs, which is read by the line (see `findJourneyKeptLines`).
 */
export function findBlankRemainder(
  source: Source,
  statement: JourneyStatement,
): Atom | null {
  if (!endsWithNeededWhitespace(statement)) return null
  const start = statement.range[1]
  const first = source.text[start]
  if (first !== " " && first !== "\t") return null
  let end = start
  while (source.text[end] === " " || source.text[end] === "\t") end++
  return isAtLineEnd(source, end) ? { start, end: start + 1 } : null
}

/**
 * Whether a statement is a task whose data holds no score, no person, and no
 * text after the third colon: see `findBlankRemainder`.
 */
export function endsWithNeededWhitespace(statement: JourneyStatement): boolean {
  return (
    statement.type === "JourneyTaskStatement" &&
    statement.score === null &&
    statement.people.length === 0 &&
    statement.textAfter === null
  )
}

/**
 * The layout of a statement, from its start to `end` (the end of its range).
 *
 * - A statement written over several lines stands on one line where the
 *   lexer reads the line break as whitespace, which it does only right after
 *   a keyword (diagrams/journey.md, The statement context). Accessibility
 *   line trivia keeps its breaks with ordinary continuation columns; titles,
 *   sections and protected regions keep their original layout
 *   (docs/journey.md, Multi-line statements).
 * - The rules of the gaps are those of docs/journey.md: Task data, Titles and
 *   sections, and Accessibility statements.
 */
export function layoutJourneyStatement(
  source: Source,
  statement: JourneyStatement,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  if (statement.type === "JourneyAccDescrBlockStatement") {
    return layoutDescriptionBlock(source, statement, end, journeyValueNodeTypes)
  }
  const keptBreaks = findKeptBreaks(source, start, end)
  const keepsLineBreaks = spansKeptBreaks(source, keptBreaks, start, end)
  const formatsTriviaLines =
    statement.type === "JourneyAccTitleStatement" ||
    statement.type === "JourneyAccDescrStatement"
  // Trivia prevents joining, but ordinary structural gaps still use atoms.
  // Value columns, semicolon lines and removed-line regions stay written.
  if (
    keepsLineBreaks &&
    (!formatsTriviaLines || holdsJoiningRegion(source, start, end))
  ) {
    return keptAsWritten(start, end)
  }
  const atoms = collectAtoms(
    source,
    start,
    end,
    collectValueNodes(statement, journeyValueNodeTypes),
    [],
  )
  trimTextAfterKeyword(
    source,
    atoms,
    statement.type === "JourneyTitleStatement" ? statement.value.range : null,
    true,
  )
  if (statement.type === "JourneyTaskStatement") {
    dropDescriptionBlanks(source, statement, atoms)
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
 * The number of spaces and tabs at the end of the description of a task, which
 * is the whitespace before its first colon (the range of the description keeps
 * it).
 */
function countDescriptionBlanks(
  source: Source,
  task: JourneyTaskStatement,
): number {
  const [from, to] = task.description.range
  let count = 0
  while (to - count > from && isSpaceOrTab(source.text[to - count - 1])) count++
  return count
}

/** The padded tasks of each source, found once (`findPaddedTasks`). */
const paddedTasksOfSource = new WeakMap<
  Source,
  ReadonlySet<JourneyTaskStatement>
>()

/**
 * The tasks of the sections in which some description has padding before its
 * colon, two spaces or tabs at least: the padding lines the colons of the
 * section up, so the section stays as written (docs/journey.md, Task data). A
 * section is the tasks up to the next `section`; the tasks before the first
 * one are a section.
 */
function findPaddedTasks(source: Source): ReadonlySet<JourneyTaskStatement> {
  let found = paddedTasksOfSource.get(source)
  if (found === undefined) {
    const sections: JourneyTaskStatement[][] = [[]]
    const { body } = source.root
    if (body.type === "JourneyDiagram") {
      for (const statement of body.body) {
        if (statement.type === "JourneySectionStatement") sections.push([])
        else if (statement.type === "JourneyTaskStatement")
          sections.at(-1)!.push(statement)
      }
    }
    found = new Set(
      sections
        .filter((section) =>
          section.some((task) => countDescriptionBlanks(source, task) >= 2),
        )
        .flat(),
    )
    paddedTasksOfSource.set(source, found)
  }
  return found
}

/**
 * Leaves the spaces and tabs before the first colon of a task out of what is
 * printed: the Db keeps them as the end of the description and mermaid.js
 * draws the same task without them, and the examples in its documentation
 * write the colon touching the description (docs/journey.md, Task data). The
 * whitespace stays in a section whose colons it lines up (see
 * `findPaddedTasks`), after a whitespace character other than a space and a
 * tab, in a description of whitespace only, and in a description that holds a
 * directive.
 */
function dropDescriptionBlanks(
  source: Source,
  task: JourneyTaskStatement,
  atoms: Atom[],
): void {
  const [from, to] = task.description.range
  const blanks = countDescriptionBlanks(source, task)
  const contentEnd = to - blanks
  if (
    blanks === 0 ||
    contentEnd === from ||
    isWhitespace(source.text[contentEnd - 1]) ||
    findPaddedTasks(source).has(task) ||
    findTriviaBetween(source, from, to + 1).length > 0
  ) {
    return
  }
  replaceInAtoms(source, atoms, [{ range: [contentEnd, to], replacement: "" }])
}

/** The gap rules of a statement, by the start of the atom after the gap. */
function statementRules(
  source: Source,
  statement: Exclude<JourneyStatement, JourneyAccDescrBlockStatement>,
  atoms: readonly Atom[],
  remainder: Atom | null,
): Map<number, GapRule> {
  switch (statement.type) {
    case "JourneyTaskStatement":
      return taskRules(statement, atoms, remainder)
    case "JourneyTitleStatement":
      return new Map<number, GapRule>([[statement.value.range[0], "space"]])
    case "JourneySectionStatement":
      return new Map<number, GapRule>([[statement.name.range[0], "space"]])
    case "JourneyAccTitleStatement":
    case "JourneyAccDescrStatement":
      return accessibilityRules(source, statement)
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown statement ${JSON.stringify(statement satisfies never)}`,
      )
  }
}

/**
 * The rules of the line of a task: the first `:` touches the description,
 * whose range keeps the whitespace before it; a value, the score or a person,
 * stands after one space, after a `:` and after a `,` alike, and a `:` and a
 * `,` touch what is before them; the text after the third colon touches what
 * is before it (docs/journey.md, Task data and Ignored data). The whitespace
 * of data that holds only whitespace is one character (see
 * `findBlankRemainder`).
 */
function taskRules(
  statement: JourneyTaskStatement,
  atoms: readonly Atom[],
  remainder: Atom | null,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  const valueStarts = new Set(
    collectValueNodes(statement, journeyValueNodeTypes).map(
      (value) => value.range[0],
    ),
  )
  const ignoredStart = statement.textAfter?.range[0]
  for (const atom of atoms.slice(1)) {
    if (remainder !== null && atom.start === remainder.start) {
      rules.set(atom.start, "none")
    } else if (atom.start === ignoredStart) {
      rules.set(atom.start, "none")
    } else if (valueStarts.has(atom.start)) {
      rules.set(atom.start, "space")
    } else {
      // The `:` and `,` units of the data.
      rules.set(atom.start, "none")
    }
  }
  return rules
}
