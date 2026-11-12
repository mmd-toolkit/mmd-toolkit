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
  isSpaceOrTab,
  skipDirectives,
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
 * - A line that starts with a U+2028 or U+2029 and holds several statements: the
 *   character belongs to the first name, and a version that counts rejects
 *   the statements on lines of their own.
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
    const following = statements[index + 1]
    if (
      following !== undefined &&
      startsWithSeparator(source, statement.range[0]) &&
      lineStartOf(source, following.range[0]) ===
        lineStartOf(source, statement.range[0])
    ) {
      lines.push(lineStartOf(source, statement.range[0]))
    }
    if (
      statement.type === "ErEntityStatement" &&
      statement.name.type === "ErIdentifier" &&
      statement.alias === null &&
      statement.cssClasses.length === 0 &&
      statement.attributes === null &&
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
 * The lines of an attribute block that hold several attributes and a `~`.
 * The oldest version that counts reads the `~` of a generic type from the
 * start of the line, so ` string a "x~y" List~int~ b` is one attribute there,
 * and two when the attributes stand on lines of their own (docs/er.md,
 * Attribute blocks).
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
      const onLine = attributes.filter(
        (other) => lineStartOf(source, other.range[0]) === line,
      )
      if (
        onLine[0] === attribute &&
        onLine.length > 1 &&
        source.text
          .slice(attribute.range[0], onLine.at(-1)?.range[1])
          .includes("~")
      ) {
        lines.push(line)
      }
    }
  }
  return lines
}

/**
 * Whether the line of the offset starts, after spaces and tabs, with a U+2028
 * or U+2029, which belongs to the name of the first statement to the pinned
 * lexer and not to the whitespace before it.
 */
function startsWithSeparator(source: Source, offset: number): boolean {
  const line = lineStartOf(source, offset)
  let position = line
  while (isSpaceOrTab(source.text.charAt(position))) position++
  const character = source.text.charAt(position)
  return character === "\u2028" || character === "\u2029"
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
  let gap = ""
  for (let offset = keyword.range[1]; offset < nameStart;) {
    const next = skipDirectives(source, offset)
    if (next > offset) {
      offset = next
    } else {
      gap += source.text.charAt(offset)
      offset++
    }
  }
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
