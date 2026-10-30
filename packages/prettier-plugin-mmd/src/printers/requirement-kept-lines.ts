import type {
  RequirementDiagram,
  RequirementStatement,
} from "@mmd-toolkit/parser"
import { holdsDirection } from "./accessibility-lines.ts"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  findSemicolonLines,
  lineStartOf,
} from "./kept-lines.ts"
import { spansLinesThatCannotJoin } from "./layout.ts"
import type { Source } from "./source.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * Finds the kept lines of a requirement diagram, whose statements stay
 * together (docs/requirement.md, Statements one per line): the lines that
 * hold a `;` (see `findLinesWithOwnSemicolons`; no `;` separates statements
 * in a requirement diagram, so every `;` is a character of a text or one
 * that the line rule ignores), and the lines of the `accTitle` and `accDescr`
 * statements that keep the first column (see `findAccessibilityLines`). A
 * line that a `;` decides the end of is printed as written (see
 * `findLinesEndedBySemicolon`), and so is a line that ends with a statement
 * that the next lines continue and that cannot be joined (see
 * `findLinesOfContinuedStatements`).
 */
export function findRequirementKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const { body } = diagramOf(source)
  const kept: KeptLines = {
    joined: new Set([
      ...findLinesWithOwnSemicolons(source),
      ...findAccessibilityLines(source, body),
    ]),
    verbatim: new Set([
      ...findLinesEndedBySemicolon(source),
      ...findLinesOfContinuedStatements(source, body),
    ]),
    ownIndentation: new Set(findAccessibilityLines(source, body)),
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/** The body of the requirement diagram of a source. */
function diagramOf(source: Source): RequirementDiagram {
  const { body } = source.root
  if (body.type !== "RequirementDiagram") {
    throw new Error(
      "prettier-plugin-mmd: kept lines of a non-requirement diagram",
    )
  }
  return body
}

/**
 * The lines on which a statement that the next lines continue starts after a
 * `style`, `classDef`, or `class` statement, when the statement cannot be
 * joined into one line (see `spansLinesThatCannotJoin`) or the line keeps
 * its statements together because it holds a `;` (see `findSemicolonLines`).
 * The lexer is still in the style context after such a statement, so a string on its line
 * starts the next statement and the line feed after it, not the statement
 * context's `newline` unit, lets that statement go on: `style r fill:red "r"`
 * and a line `:::c` give r the class c, while `"r"` and `:::c` on lines of
 * their own are rejected (diagrams/requirement.md, The style context). A
 * statement that is joined stands on a line of its own with its parts on
 * one line, but one that cannot be joined, such as one with a comment line or
 * a directive in it, has to stay on the line of the statement before it, and
 * so has one on a line that holds a `;`, whose statements stay together: the
 * line is printed as written (docs/requirement.md, Statements one per line).
 */
function findLinesOfContinuedStatements(
  source: Source,
  statements: readonly RequirementStatement[],
): number[] {
  const semicolonLines = findSemicolonLines(source)
  const lines: number[] = []
  for (const [index, statement] of statements.entries()) {
    const previous = statements[index - 1]
    const line = lineStartOf(source, statement.range[0])
    if (
      previous !== undefined &&
      endsInStyleContext(previous) &&
      lineStartOf(source, previous.range[1] - 1) === line &&
      (spansLinesThatCannotJoin(
        source,
        statement.range[0],
        statement.range[1],
      ) ||
        semicolonLines.has(line))
    ) {
      lines.push(line)
    }
  }
  return lines
}

/** Whether the lexer is in the style context after a statement, on its last line. */
function endsInStyleContext(statement: RequirementStatement): boolean {
  return (
    statement.type === "RequirementStyleStatement" ||
    statement.type === "RequirementClassDefStatement" ||
    statement.type === "RequirementClassStatement"
  )
}

/**
 * The lines of the `accTitle` and `accDescr` statements whose first printed
 * line holds `direction`, followed by whitespace and a direction (see
 * `holdsDirection`). The lexer tries the rule of a direction line before the
 * rules of the other statements, but after the rules of `accTitle` and
 * `accDescr` (diagrams/requirement.md, The statement context): at the first
 * column, `accTitle: direction LR` is a title, while after an indentation,
 * the line is a direction line with the text `accTitle:` before it. So the
 * statement keeps the first column that it was written at (docs/requirement.md,
 * Accessibility statements).
 */
function findAccessibilityLines(
  source: Source,
  statements: readonly RequirementStatement[],
): number[] {
  const lines: number[] = []
  for (const statement of statements) {
    if (
      (statement.type === "RequirementAccTitleStatement" ||
        statement.type === "RequirementAccDescrStatement" ||
        statement.type === "RequirementAccDescrBlockStatement") &&
      holdsDirection(source, {
        range: statement.range,
        text:
          statement.type === "RequirementAccDescrBlockStatement"
            ? null
            : statement.value.value,
      })
    ) {
      lines.push(lineStartOf(source, statement.range[0]))
    }
  }
  return lines
}
