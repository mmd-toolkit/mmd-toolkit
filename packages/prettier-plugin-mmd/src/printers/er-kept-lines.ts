import { appendItems } from "./collections.ts"
import type { ErStatement } from "@mmd-toolkit/parser"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineEndOf,
  lineStartOf,
} from "./kept-lines.ts"
import { holdsDirection } from "./accessibility-lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween } from "./source.ts"

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
 */
function findLinesReadByTheirPlace(
  source: Source,
  statements: readonly ErStatement[],
): number[] {
  const lines: number[] = []
  for (const statement of statements) {
    if (
      statement.type === "ErEntityStatement" &&
      statement.name.type === "ErIdentifier" &&
      statement.name.name === "1" &&
      statement.alias === null &&
      statement.cssClasses.length === 0 &&
      statement.attributes === null &&
      startsLikeRuleEleven(source, statement.range[1])
    ) {
      lines.push(lineStartOf(source, statement.range[0]))
    }
    if (statement.type === "ErSubgraphStatement") {
      appendItems(lines, findLinesReadByTheirPlace(source, statement.body))
    }
  }
  return lines
}

/**
 * Whether an ASCII letter, an ASCII digit, `_`, `"`, or `'` stands at
 * `offset`, after the directives that start there: mermaid.js removes the
 * directives before it reads the text, so they do not separate what lies
 * before them from what lies after them.
 */
function startsLikeRuleEleven(source: Source, offset: number): boolean {
  let position = offset
  for (;;) {
    const trivia = findTriviaBetween(source, position, position + 1).at(0)
    if (trivia?.type !== "Directive") break
    position = trivia.range[1]
  }
  const character = source.text[position]
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
        range: statement.range,
        text:
          statement.type === "ErAccDescrBlockStatement"
            ? null
            : statement.value.value,
      })
    ) {
      lines.push(lineStartOf(source, statement.range[0]))
    }
  }
  return lines
}
