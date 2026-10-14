import type {
  JourneyAccDescrBlockStatement,
  JourneyStatement,
  JourneyTaskStatement,
  Node,
  Token,
} from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
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
import { findStructuralToken } from "./source.ts"

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

/** The layout of the header line: the keyword `journey`. */
export function layoutJourneyHeader(
  source: Source,
  keyword: Token,
): AtomLayout {
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
 *   a keyword (diagrams/journey.md, The statement context); one with a
 *   comment or a directive in it is kept as written (see
 *   `spansLinesThatCannotJoin`). The lines of an `accDescr` block are lines
 *   of its text, and are kept (docs/journey.md, Accessibility statements).
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
    return layoutDescriptionBlock(source, statement, end)
  }
  if (spansLinesThatCannotJoin(source, start, end)) {
    return keptAsWritten(start, end)
  }
  const atoms = collectAtoms(
    source,
    start,
    end,
    collectValueNodes(statement, journeyValueNodeTypes),
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
 * The layout of an `accDescr { ... }` block: the lines of its text are kept
 * as written and its `}` stands at the level of the statement
 * (docs/journey.md, Accessibility statements). A block without text is
 * printed on one line, as any statement is.
 */
function layoutDescriptionBlock(
  source: Source,
  statement: JourneyAccDescrBlockStatement,
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
  // A description block of a user journey is always closed: one that is not
  // is rejected (diagrams/journey.md, Units and contexts).
  const block = { range: statement.range, value: statement.value, closed: true }
  const closing = findAccDescrBlockClosing(source, block)
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      collectValueNodes(statement, journeyValueNodeTypes),
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

/**
 * The rules of an `accTitle` or `accDescr` line: the `:` touches the keyword
 * and the text stands after one space (docs/journey.md, Accessibility
 * statements).
 */
function accessibilityRules(
  source: Source,
  statement: Extract<
    JourneyStatement,
    { type: "JourneyAccTitleStatement" | "JourneyAccDescrStatement" }
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
