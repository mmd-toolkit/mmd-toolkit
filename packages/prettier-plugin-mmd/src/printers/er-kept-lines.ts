import { appendItems } from "./collections.ts"
import type { ErStatement } from "@mmd-toolkit/ast"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineEndOf,
  lineStartOf,
} from "./kept-lines.ts"
import { holdsDirection, holdsStatementAfter } from "./accessibility-lines.ts"
import type { Source } from "./source.ts"
import {
  findTokenEndingBefore,
  findTriviaAt,
  isWhitespace,
  skipDirectives,
  textWithoutDirectives,
} from "./source.ts"
import { toAsciiLowerCase } from "./layout.ts"

/** The lines that hold a `;`, of each source, found once per source. */
const semicolonLinesBySource = new WeakMap<Source, ReadonlySet<number>>()

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * The lines of an ER diagram that hold a `;` (see
 * `findLinesWithOwnSemicolons`), by line start offset. No `;` separates
 * statements in an ER diagram (diagrams/er.md, Diagram and statements), so
 * every `;` in the diagram is a `;` that ends a `classDef` or `style`
 * statement, one that the line rule ignores, or a character of a token.
 */
export function findErSemicolonLines(source: Source): ReadonlySet<number> {
  const cached = semicolonLinesBySource.get(source)
  if (cached !== undefined) return cached
  const lines = findLinesWithOwnSemicolons(source)
  semicolonLinesBySource.set(source, lines)
  return lines
}

/**
 * Finds the kept lines of an ER diagram, whose statements stay together
 * (docs/er.md, Statements one per line and Semicolons): the lines that hold
 * a `;` (see `findErSemicolonLines`), the line of a subgraph header that is
 * followed by empty description blocks, which are the first statements of the
 * body and stand on the line of the header (docs/er.md, Subgraphs), and the
 * lines of the `accTitle` and `accDescr` statements that keep the first
 * column (see `findAccessibilityLines`). A line that a `;` decides the end of
 * is printed as written (see `findLinesEndedBySemicolon`), and so is a line
 * that a line break would make other statements of (see
 * `findLinesReadByTheirPlace`).
 */
export function findErKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const kept: KeptLines = {
    joined: new Set([
      ...findErSemicolonLines(source),
      ...findSubgraphHeaderLines(source, diagramOf(source).body),
      ...findAccessibilityLines(source, diagramOf(source).body),
    ]),
    verbatim: new Set([
      ...findLinesEndedBySemicolon(source),
      ...findLinesReadByTheirPlace(source, diagramOf(source).body),
      ...findAttributeLinesWithTildes(source, diagramOf(source).body),
    ]),
    ownIndentation: new Set(
      findAccessibilityLines(source, diagramOf(source).body),
    ),
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/** The body of the ER diagram of a source. */
function diagramOf(
  source: Source,
): Extract<Source["root"]["body"], { type: "ErDiagram" }> {
  const { body } = source.root
  if (body.type !== "ErDiagram") {
    throw new Error("prettier-plugin-mmd: kept lines of a non-ER diagram")
  }
  return body
}

/**
 * The lines of the headers of the subgraphs with a statement of their body
 * on the line of the header: only empty description blocks may stand there.
 */
function findSubgraphHeaderLines(
  source: Source,
  statements: readonly ErStatement[],
): number[] {
  const lines: number[] = []
  for (const statement of statements) {
    if (statement.type !== "ErSubgraphStatement") continue
    const headerEnd = lineEndOf(source, statement.range[0])
    if (statement.body.some((inner) => inner.range[0] < headerEnd)) {
      lines.push(lineStartOf(source, statement.range[0]))
    }
    appendItems(lines, findSubgraphHeaderLines(source, statement.body))
  }
  return lines
}

/**
 * The lines of the statements that mermaid.js reads as they stand on their
 * line, which the formatter prints as written:
 *
 * - An entity statement `1` with a letter, a digit, `_`, or a quote right
 *   after it, touching, or after a directive that touches it: the next
 *   statement, or the `end` of the subgraph that it closes. `1a` is the
 *   entities `1` and `a`, while `1` and a letter on two lines, or with
 *   whitespace between them, are the cardinality `only-one` and a name
 *   (diagrams/er.md, The cardinalities, numbers, and relationship lines,
 *   rule 11), so the statements cannot be split into lines of their own
 *   (docs/er.md, Statements one per line).
 * - An entity statement named by a number of two digits or more, with a
 *   character right after it that continues a name: `12a` is the entities
 *   `12` and `a` to the pinned lexer, and one name to a version that counts.
 * - A statement that starts with a U+2028 or U+2029, with another statement
 *   after it on its line, where a version that counts reads the line from the
 *   end of the whitespace as a `class` statement or a direction line (see
 *   `startsLineReadAsKeywordByOlderVersions`): the character belongs to the
 *   first name to the pinned lexer, and a version that counts reads it as
 *   whitespace. `class A a` is a statement that goes on over the line, and
 *   `A direction LR` is a direction line, which has no entity `A`; on lines
 *   of their own, the statements are a keyword alone, which it rejects, and
 *   an entity and a direction line.
 * - The lines of an attribute block with a `~` that a version that counts
 *   reads from the start of an attribute (see `findAttributeLinesWithTildes`).
 * - The `subgraph` keyword with a character outside ASCII, or a U+2028 or
 *   U+2029, between it and its name: the keyword ends there to the pinned
 *   lexer, and a version that counts reads one name (`subgraphé` is the
 *   keyword and the name `é`). The statement after an `end` that stands
 *   so stays on its line (see `followsEndAsOneName`).
 */
function findLinesReadByTheirPlace(
  source: Source,
  statements: readonly ErStatement[],
): number[] {
  const lines: number[] = []
  for (const [index, statement] of statements.entries()) {
    const keptLine = findLineReadAsKeywordByOlderVersions(
      source,
      statements,
      index,
    )
    if (keptLine !== null) lines.push(keptLine)
    if (
      isNameAlone(statement) &&
      statement.name.type === "ErIdentifier" &&
      (statement.name.name === "1"
        ? startsLikeRuleEleven(source, statement.range[1])
        : isNumber(statement.name.name) &&
          continuesName(
            source.text.charAt(skipDirectives(source, statement.range[1])),
          ))
    ) {
      lines.push(lineStartOf(source, statement.range[0]))
    }
    if (statement.type === "ErSubgraphStatement") {
      if (followsSplitKeyword(source, statement.id.range[0])) {
        lines.push(lineStartOf(source, statement.range[0]))
      }
      appendItems(lines, findLinesReadByTheirPlace(source, statement.body))
    }
  }
  return lines
}

/**
 * The lines of an attribute block that hold several attributes, one of which
 * starts before a pair of `~`. The oldest version that counts reads the `~` of
 * a generic type with the rule `(.*?)[~](.*?)*[~]`, which starts at the
 * attribute and runs on over the rest of the line to the second `~`, so
 * ` int a List~int~ b` is the attribute `int a List~int~` and `b` there, and
 * the attributes `int a` and `List~int~ b` when they stand on lines of their
 * own. The rule reads an attribute whose own type holds the pair as it is
 * (`List~int~ a`) (docs/er.md, Attribute blocks).
 */
function findAttributeLinesWithTildes(
  source: Source,
  statements: readonly ErStatement[],
): number[] {
  const lines: number[] = []
  for (const statement of statements) {
    if (statement.type === "ErSubgraphStatement") {
      appendItems(lines, findAttributeLinesWithTildes(source, statement.body))
    }
    if (statement.type !== "ErEntityStatement" || statement.attributes === null)
      continue
    const attributes = statement.attributes.filter(
      (item) => item.type === "ErAttribute",
    )
    for (const attribute of attributes) {
      const line = lineStartOf(source, attribute.range[0])
      const lineEnd = lineEndOf(source, attribute.range[0])
      const first = indexOfTilde(source, attribute.range[0], lineEnd)
      const second =
        first === -1 ? -1 : indexOfTilde(source, first + 1, lineEnd)
      const onLine = attributes.filter(
        (other) => lineStartOf(source, other.range[0]) === line,
      )
      if (
        onLine.length > 1 &&
        second !== -1 &&
        second < lineEnd &&
        second >= attribute.dataType.range[1]
      ) {
        lines.push(line)
      }
    }
  }
  return lines
}

/**
 * The offset of the first `~` from `from` to the end of the line at `to` that
 * no directive holds, or -1: mermaid.js removes the directives before it reads
 * the text.
 */
function indexOfTilde(source: Source, from: number, to: number): number {
  let position = from
  while (position < to) {
    const trivia = findTriviaAt(source, position)
    if (trivia?.type === "Directive") position = trivia.range[1]
    else if (source.text[position] === "~") return position
    else position++
  }
  return -1
}

/**
 * The line to print as written for the statement at `index`, which starts
 * with a U+2028 or U+2029 that a version that counts reads as whitespace, or
 * null where the statements on lines of their own are read as the line is.
 * The keyword rules of that version start where the whitespace ends, with the
 * directives removed:
 *
 * - `class` followed by a character that is no letter, digit, or `_` is the
 *   keyword, and `class A a` is one statement. It needs two names after the
 *   keyword, and a statement of a name alone is one name (`classé` is the
 *   keyword and the name `é`), so `class A` is rejected whether it stands on
 *   one line or on two. The line of the statement is the one to keep.
 * - The rule of the direction line takes the run up to the next line
 *   terminator that holds `direction`, whitespace, and a direction
 *   (`holdsDirection`), so `A direction LR` is a direction line with no entity
 *   `A`, while on lines of their own `A` is an entity. When the statement
 *   after the first is a direction line, whose `direction` is out of the reach
 *   of the rule once it stands on a line of its own, the line of the first is
 *   the one to keep. When `direction` ends the first statement, the whitespace
 *   before the direction may hold a line feed, so a line of the entity
 *   `direction` and a line of the entity `LR` are the same direction line; the
 *   line that holds the value is read differently only where a statement
 *   follows the value on it, which the rule takes into the direction line and
 *   which stands on a line of its own otherwise, and that line is the one to
 *   keep.
 */
function findLineReadAsKeywordByOlderVersions(
  source: Source,
  statements: readonly ErStatement[],
  index: number,
): number | null {
  const statement = statements[index]
  if (!isLineSeparator(source.text.charAt(statement.range[0]))) return null
  const start = skipWhitespaceOnLine(source, statement.range[0])
  // A separator that whitespace follows is a name of its own, and the
  // keyword after the whitespace is read the same by every version.
  if (start >= statement.range[1]) return null
  const line = lineStartOf(source, statement.range[0])
  const followers = statements.slice(index + 1, index + 3)
  const own = textWithoutDirectives(source, start, statement.range[1])
  if (toAsciiLowerCase(readWord(own, 0)) === "class") {
    const needed = own.length > "class".length ? 1 : 2
    const names = followers.slice(0, needed)
    return isNameAlone(statement) &&
      names.length === needed &&
      names.every(
        (name) =>
          isNameAlone(name) &&
          name.name.type === "ErIdentifier" &&
          lineStartOf(source, name.range[0]) === line,
      )
      ? line
      : null
  }
  if (
    !holdsDirection(source, {
      range: [start, lineEndOf(source, start)],
      text: null,
    })
  )
    return null
  const [first, second] = followers
  if (
    first?.type === "ErDirectionStatement" &&
    lineStartOf(source, first.range[0]) === line
  )
    return line
  const valueLine =
    first === undefined ? null : lineStartOf(source, first.range[0])
  return second !== undefined &&
    valueLine === lineStartOf(source, second.range[0])
    ? valueLine
    : null
}

/**
 * The offset of the first character from `offset` on that is no whitespace
 * and no directive, or of the line feed that ends the line.
 */
function skipWhitespaceOnLine(source: Source, offset: number): number {
  let start = offset
  for (;;) {
    start = skipDirectives(source, start)
    const character = source.text.charAt(start)
    if (
      character === "" ||
      character === "\n" ||
      character === "\r" ||
      !isWhitespace(character)
    )
      return start
    start++
  }
}

/** Whether the statement is an entity written by its name alone. */
function isNameAlone(
  statement: ErStatement,
): statement is Extract<ErStatement, { type: "ErEntityStatement" }> {
  return (
    statement.type === "ErEntityStatement" &&
    statement.alias === null &&
    statement.cssClasses.length === 0 &&
    statement.attributes === null
  )
}

/** Whether a character is a U+2028 or a U+2029. */
function isLineSeparator(character: string): boolean {
  return character === "\u2028" || character === "\u2029"
}

/** The letters, digits, and `_` that start at `offset`. */
function readWord(text: string, offset: number): string {
  let end = offset
  while (end < text.length && isWordCharacter(text.charAt(end))) end++
  return text.slice(offset, end)
}

/** Whether a character is an ASCII letter, a digit, or `_`. */
function isWordCharacter(character: string): boolean {
  return (
    (character >= "a" && character <= "z") ||
    (character >= "A" && character <= "Z") ||
    (character >= "0" && character <= "9") ||
    character === "_"
  )
}

/** Whether the text is a number of two digits or more. */
function isNumber(text: string): boolean {
  return text.length >= 2 && [...text].every((c) => c >= "0" && c <= "9")
}

/**
 * Whether a character continues a name to a version that counts: an ASCII
 * letter, `_`, `-`, `*`, or a character outside ASCII, a U+2028 and a U+2029
 * included.
 */
function continuesName(character: string): boolean {
  return (
    character !== "" &&
    ((character >= "a" && character <= "z") ||
      (character >= "A" && character <= "Z") ||
      character === "_" ||
      character === "-" ||
      character === "*" ||
      character > "\u007f")
  )
}

/**
 * Whether the name that starts at `nameStart` follows the keyword `end` or
 * `subgraph` so that a version that counts reads both as one name: a U+2028 or
 * U+2029 stands between them, or a character outside ASCII touches the keyword.
 * The pinned lexer ends the keyword there (docs/er.md, Statements one per
 * line). The directives between them are left out, since mermaid.js removes
 * them before it reads the text.
 */
export function followsSplitKeyword(
  source: Source,
  nameStart: number,
): boolean {
  let keyword = findTokenEndingBefore(source, nameStart)
  while (keyword?.type === "Directive") {
    keyword = findTokenEndingBefore(source, keyword.range[0])
  }
  if (
    keyword?.type !== "Keyword" ||
    !["end", "subgraph"].includes(toAsciiLowerCase(keyword.value))
  )
    return false
  const gap = textWithoutDirectives(source, keyword.range[1], nameStart)
  return (
    gap.includes("\u2028") ||
    gap.includes("\u2029") ||
    (gap === "" && source.text.charAt(nameStart) > "\u007f")
  )
}

/**
 * Whether an ASCII letter, an ASCII digit, `_`, `"`, or `'` stands at
 * `offset`, after the directives that start there: mermaid.js removes the
 * directives before it reads the text, so they do not separate what lies
 * before them from what lies after them.
 */
function startsLikeRuleEleven(source: Source, offset: number): boolean {
  const character = source.text[skipDirectives(source, offset)]
  return (
    character !== undefined &&
    ((character >= "a" && character <= "z") ||
      (character >= "A" && character <= "Z") ||
      (character >= "0" && character <= "9") ||
      character === "_" ||
      character === '"' ||
      character === "'")
  )
}

/**
 * The lines of the `accTitle` and `accDescr` statements whose first printed
 * line holds `direction`, followed by whitespace and a direction. The lexer
 * tries the rule of a direction line before the rules of the other
 * statements, but after the rules of `accTitle` and `accDescr`
 * (diagrams/er.md, The statement context): at the first column,
 * `accTitle: direction LR` is a title, while after an indentation, the line
 * is a direction line with the text `accTitle:` before it. So the statement
 * keeps the first column that it was written at (docs/er.md, Accessibility
 * statements). The first printed line is the one that the printer makes: the
 * text of `accTitle:` or `accDescr:` is brought to the line of the `:`
 * (docs/er.md, Multi-line statements), and the other statements start with
 * their first line as written.
 */
function findAccessibilityLines(
  source: Source,
  statements: readonly ErStatement[],
): number[] {
  const lines: number[] = []
  for (const statement of statements) {
    if (statement.type === "ErSubgraphStatement") {
      appendItems(lines, findAccessibilityLines(source, statement.body))
    } else if (
      (statement.type === "ErAccTitleStatement" ||
        statement.type === "ErAccDescrStatement" ||
        statement.type === "ErAccDescrBlockStatement") &&
      holdsDirection(source, {
        range: [statement.range[0], lineEndOf(source, statement.range[1])],
        text:
          statement.type === "ErAccDescrBlockStatement" ||
          holdsStatementAfter(source, statement.range[1])
            ? null
            : statement.value.value,
      })
    ) {
      lines.push(lineStartOf(source, statement.range[0]))
    }
  }
  return lines
}
