import type {
  Node,
  SequenceMessageStatement,
  SequenceStatement,
  SequenceTitleStatement,
  Token,
} from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import { findWrittenWhitespaceEnd } from "./gap.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  findAccDescrBlockClosing,
  findAccDescrBlockStretches,
} from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenStartingAt,
  findTriviaBetween,
} from "./source.ts"

/**
 * The node types of a sequence diagram whose text is a value, printed as
 * written: the shared leaf nodes, of which no sequence statement holds a
 * `StringLiteral` yet, and the leaf nodes of the diagram type. They have no
 * child fields; `tests/value-nodes.test.ts` checks that every other such
 * node type is left out on purpose.
 */
export const sequenceValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
  "SequenceLiteral",
  "SequenceDataBlock",
  "SequenceIgnoredStatement",
])

/** The blocks whose statements are one body, closed by `end`. */
export type SequenceBodyBlockStatement = Extract<
  SequenceStatement,
  {
    type:
      | "SequenceBoxStatement"
      | "SequenceLoopStatement"
      | "SequenceRectStatement"
      | "SequenceOptStatement"
      | "SequenceBreakStatement"
  }
>

/**
 * The blocks of sections: each section is closed by the next one, and the
 * last by `end`.
 */
export type SequenceSectionBlockStatement = Extract<
  SequenceStatement,
  {
    type:
      | "SequenceAltStatement"
      | "SequenceParStatement"
      | "SequenceParOverStatement"
      | "SequenceCriticalStatement"
  }
>

/** The statements that hold statements of their own, with an `end`. */
export type SequenceBlockStatement =
  SequenceBodyBlockStatement | SequenceSectionBlockStatement

/** A statement that holds no other statement. */
export type SequenceSimpleStatement = Exclude<
  SequenceStatement,
  SequenceBlockStatement
>

/** A statement, with the kind of statement it is. */
export type ClassifiedSequenceStatement =
  | { readonly kind: "body"; readonly statement: SequenceBodyBlockStatement }
  | {
      readonly kind: "sections"
      readonly statement: SequenceSectionBlockStatement
    }
  | { readonly kind: "simple"; readonly statement: SequenceSimpleStatement }

/**
 * Which kind of statement a node is: a block with one body, a block of
 * sections, or a statement that holds no other; null for a node that is no
 * statement of a sequence diagram. The kinds are decided here only. Every
 * statement type is listed, the node of each case is checked against the
 * type of its kind, and the check after the cases fails when a statement
 * type of the tree is not listed.
 */
export function classifySequenceStatement(
  node: SequenceStatement,
): ClassifiedSequenceStatement
export function classifySequenceStatement(
  node: MermaidAst,
): ClassifiedSequenceStatement | null
export function classifySequenceStatement(
  node: MermaidAst,
): ClassifiedSequenceStatement | null {
  switch (node.type) {
    case "SequenceBoxStatement":
    case "SequenceLoopStatement":
    case "SequenceRectStatement":
    case "SequenceOptStatement":
    case "SequenceBreakStatement":
      return { kind: "body", statement: node }
    case "SequenceAltStatement":
    case "SequenceParStatement":
    case "SequenceParOverStatement":
    case "SequenceCriticalStatement":
      return { kind: "sections", statement: node }
    case "SequenceParticipantStatement":
    case "SequenceDestroyStatement":
    case "SequenceMessageStatement":
    case "SequenceAutonumberStatement":
    case "SequenceActivateStatement":
    case "SequenceDeactivateStatement":
    case "SequenceNoteStatement":
    case "SequenceLinksStatement":
    case "SequenceLinkStatement":
    case "SequencePropertiesStatement":
    case "SequenceDetailsStatement":
    case "SequenceTitleStatement":
    case "SequenceAccTitleStatement":
    case "SequenceAccDescrStatement":
    case "SequenceAccDescrBlockStatement":
    case "SequenceIgnoredStatement":
      return { kind: "simple", statement: node }
    default:
      node satisfies Exclude<MermaidAst, SequenceStatement>
      return null
  }
}

/** The layout of the header line: the keyword `sequenceDiagram`. */
export function layoutSequenceHeader(
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

/**
 * The layout of the line that opens a block or a section, from its keyword
 * at `start` to `end`: the keyword and the text after it (`text`), whose
 * values are printed as written.
 *
 * The text of a box is kept as a whole, the whitespace between its colour
 * candidate and the rest included: when the candidate is no colour,
 * mermaid.js takes the whole text as the name of the box
 * (diagrams/sequence.md, Box colours), so `box Group   1` has the name
 * `Group   1`.
 */
export function layoutBlockHeader(
  source: Source,
  start: number,
  end: number,
  text: Node | null,
): AtomLayout {
  const kept: Atom[] =
    text?.type === "SequenceBoxText"
      ? [{ start: text.range[0], end: text.range[1] }]
      : []
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      kept.length === 0 ? valuesOf(text) : [],
      kept,
    ),
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * The layout of a statement that holds no other statement, from its start
 * to `end` (see `findSequencePrintedEnd`).
 *
 * - A statement written over several lines stands on one line: a line
 *   break inside a statement comes after whitespace, and the lexer reads
 *   the two as whitespace (diagrams/sequence.md, The statement context,
 *   rule 2). One with a comment or a directive in it is kept as written
 *   (see `isKeptAsWritten`); the lines of an `accDescr { ... }` block are
 *   lines of its text, and are kept (docs/sequence.md, Multi-line
 *   statements).
 * - A title is laid out by `layoutTitle`.
 * - A message has one space before and after its arrow (docs/sequence.md,
 *   Arrow spacing).
 * - A `:` before a text touches what comes before it and has one space
 *   after it when a text follows (docs/sequence.md, Colons).
 * - The lines of an `accDescr { ... }` block whose text starts on a later
 *   line than the `{` are kept as written, and its `}` stands at the level
 *   of the statement (docs/sequence.md, Multi-line values).
 */
export function layoutSequenceStatement(
  source: Source,
  statement: SequenceSimpleStatement,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  if (isKeptAsWritten(source, statement, end)) {
    return {
      atoms: [{ start, end }],
      rules: new Map(),
      outdented: new Set(),
      lineBreaks: "kept",
    }
  }
  if (statement.type === "SequenceTitleStatement") {
    return layoutTitle(source, statement)
  }
  const values = collectValueNodes(statement, sequenceValueNodeTypes)
  if (statement.type === "SequenceIgnoredStatement") values.push(statement)
  if (statement.type === "SequenceAccDescrBlockStatement") {
    const closing = findAccDescrBlockClosing(source, statement)
    return {
      atoms: collectAtoms(
        source,
        start,
        end,
        values,
        findAccDescrBlockStretches(source, statement),
      ),
      rules: new Map(),
      outdented: closing === null ? new Set() : new Set([closing]),
      lineBreaks: "kept",
    }
  }
  return {
    atoms: collectAtoms(source, start, end, values, []),
    rules: statementRules(source, statement),
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * Whether a statement is kept as written, from its start to `end`: it is
 * written over several lines, and a comment or a directive lies in it
 * (docs/sequence.md, Multi-line statements). Such a statement cannot stand
 * on one line, and its lines are part of it only through the whitespace at
 * their ends (diagrams/sequence.md, The statement context, rule 2), which
 * the formatter does not write. A title with a comment line between its
 * keyword and its text is one: the comment line is removed before the
 * lexer reads the text (common.md, Comment lines), so the line after it is
 * the title. The lines of an `accDescr { ... }` block are lines of its
 * text, kept by its own layout.
 */
function isKeptAsWritten(
  source: Source,
  statement: SequenceSimpleStatement,
  end: number,
): boolean {
  if (statement.type === "SequenceAccDescrBlockStatement") return false
  const start = statement.range[0]
  return (
    source.text.slice(start, end).includes("\n") &&
    findTriviaBetween(source, start, end).length > 0
  )
}

/**
 * The layout of a title: its keyword with the directives right after it,
 * one space for the one whitespace character that follows them, and the
 * rest as written (docs/sequence.md, Title). The title of the Db keeps the
 * whitespace after that character, at its end included, and that character
 * may be a line break, after which the next line is the title: `title`, a
 * line break, and `A->>B: x` is printed as `title A->>B: x`, which shows
 * how mermaid.js reads it.
 */
function layoutTitle(
  source: Source,
  statement: SequenceTitleStatement,
): AtomLayout {
  const { separator, end } = findTitleText(source, statement)
  const text: Atom = { start: separator + 1, end }
  return {
    atoms: [{ start: statement.range[0], end: separator }, text],
    rules: new Map([[text.start, "space"]]),
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * Where the text of a title lies: `separator`, the offset of the one
 * whitespace character after its keyword and the directives right after
 * the keyword, and `end`, the end of the text with the whitespace at its
 * end. The text starts after the separator and may be all whitespace; it
 * runs to a `#`, a `;`, or a line break (diagrams/sequence.md, The
 * statement context).
 */
export function findTitleText(
  source: Source,
  statement: SequenceTitleStatement,
): { readonly separator: number; readonly end: number } {
  const keyword = expectToken(
    findTokenStartingAt(source, statement.range[0]),
    "the keyword of a title",
  )
  let separator = keyword.range[1]
  let directive = findTokenStartingAt(source, separator)
  while (directive?.type === "Directive") {
    separator = directive.range[1]
    directive = findTokenStartingAt(source, separator)
  }
  const end = findWrittenWhitespaceEnd(
    source,
    statement.value?.range[1] ?? separator + 1,
    "separator",
  )
  return { separator, end }
}

/** The gap rules of a statement: around its arrow and its `:`. */
function statementRules(
  source: Source,
  statement: SequenceSimpleStatement,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  switch (statement.type) {
    case "SequenceMessageStatement":
      addArrowRules(source, statement, rules)
      addColonRules(source, statement.to.range[1], statement.text, rules)
      break
    case "SequenceNoteStatement":
      addColonRules(
        source,
        (statement.ids.at(-1) ?? statement).range[1],
        statement.text,
        rules,
      )
      break
    case "SequenceLinksStatement":
    case "SequenceLinkStatement":
    case "SequencePropertiesStatement":
    case "SequenceDetailsStatement":
      addColonRules(source, statement.id.range[1], statement.text, rules)
      break
    case "SequenceAccTitleStatement":
    case "SequenceAccDescrStatement":
      addColonRules(
        source,
        expectToken(
          findStructuralToken(source, statement.range[0]),
          "`accTitle` or `accDescr`",
        ).range[1],
        statement.value,
        rules,
      )
      break
    default:
      break
  }
  return rules
}

/**
 * Adds the rules of a message's arrow: one space before the arrow and one
 * after it, before the `+`, `-`, or `()` that may follow it, or before the
 * target; none on either side when the source is an id that a following
 * space would make another unit (see `isReadOtherwiseBeforeWhitespace`).
 * The arrow is printed from its token, whose range is the range of the
 * arrow node.
 */
function addArrowRules(
  source: Source,
  statement: SequenceMessageStatement,
  rules: Map<number, GapRule>,
): void {
  const { arrow } = statement
  const next = expectToken(
    findStructuralToken(source, arrow.range[1]),
    "what follows the arrow of a message",
  )
  const rule = isReadOtherwiseBeforeWhitespace(statement.from.name)
    ? "none"
    : "space"
  rules.set(arrow.range[0], rule)
  rules.set(next.range[0], rule)
}

/**
 * Whether an id is spelled so that, followed by whitespace where a unit
 * starts, the lexer reads it as another unit (diagrams/sequence.md, The
 * statement context). Two rules of the statement context need whitespace
 * after what they match: rule 5, a number, and rule 13, `title` followed by
 * one whitespace character; a keyword is read where no word character
 * follows it, whitespace or not. So `1 ->>2: x` is rejected, since `1` is a
 * number there, and `title ->> B: x` is a title, while `1->>2: x` and
 * `title->>B: x` are messages (docs/sequence.md, Arrow spacing).
 */
export function isReadOtherwiseBeforeWhitespace(id: string): boolean {
  return isNumber(id) || toAsciiLowerCase(id) === "title"
}

/**
 * Whether a text has the form of a number of rule 5 of the statement
 * context: one or more digits, optionally followed by `.` and one or two
 * digits, or `.` followed by one or two digits. A digit is an ASCII digit.
 */
function isNumber(text: string): boolean {
  const point = text.indexOf(".")
  if (point === -1) return text.length > 0 && isDigits(text)
  const whole = text.slice(0, point)
  const fraction = text.slice(point + 1)
  return (
    (whole.length === 0 || isDigits(whole)) &&
    fraction.length >= 1 &&
    fraction.length <= 2 &&
    isDigits(fraction)
  )
}

/** Whether every character of a text is an ASCII digit. */
function isDigits(text: string): boolean {
  return [...text].every((character) => character >= "0" && character <= "9")
}

/**
 * The text with its ASCII letters in lower case. The lexer compares
 * keywords case-insensitively (common.md, Notation), and with an ASCII word
 * only the ASCII letters of either case match: a character outside ASCII
 * whose uppercase would be an ASCII letter keeps itself.
 */
function toAsciiLowerCase(text: string): string {
  return [...text]
    .map((character) =>
      character >= "A" && character <= "Z"
        ? character.toLowerCase()
        : character,
    )
    .join("")
}

/**
 * Adds the rules of the `:` that comes after `offset`: no space before it,
 * and one space after it before the text, when there is one.
 */
function addColonRules(
  source: Source,
  offset: number,
  text: Node | null,
  rules: Map<number, GapRule>,
): void {
  const colon: Token = expectToken(
    findStructuralToken(source, offset),
    "the `:` before a text",
  )
  expectValue(colon, ":")
  rules.set(colon.range[0], "none")
  if (text !== null) rules.set(text.range[0], "space")
}

/** The value nodes of a node and below it. */
function valuesOf(node: Node | null): Node[] {
  if (node === null) return []
  const values = collectValueNodes(node, sequenceValueNodeTypes)
  return sequenceValueNodeTypes.has(node.type) ? [node, ...values] : values
}
