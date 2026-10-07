import type { ClassStatement } from "@mmd-toolkit/parser"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesWithOwnSemicolons,
  findLinesEndedBySemicolon,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"

/** The lines that hold a `;`, of each source, found once per source. */
const semicolonLinesBySource = new WeakMap<Source, ReadonlySet<number>>()

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * The lines of a class diagram that hold a `;` (see
 * `findLinesWithOwnSemicolons`), by line start offset. No `;` separates
 * statements in a class diagram (diagrams/class.md, Diagram and
 * statements), so every `;` in the diagram is one that the line rule
 * ignores or a character of a token.
 */
export function findClassSemicolonLines(source: Source): ReadonlySet<number> {
  const cached = semicolonLinesBySource.get(source)
  if (cached !== undefined) return cached
  const lines = findLinesWithOwnSemicolons(source, false)
  semicolonLinesBySource.set(source, lines)
  return lines
}

/**
 * Finds the kept lines of a class diagram, whose statements stay together
 * (docs/class.md, Labels and Empty description blocks): the lines that hold
 * a `;` (see `findClassSemicolonLines`); the lines of an empty description
 * block, which is a statement only when another statement follows it on its
 * line: `accDescr {} class A` declares A, and `accDescr {}` on a line of its
 * own is rejected (diagrams/class.md, Empty description blocks); and the
 * lines of a `{` whose member line starts with `%%` (see
 * `findPercentMemberLines`). No line of a class diagram is printed as
 * written.
 */
export function findClassKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const { body } = diagramOf(source)
  const kept: KeptLines = {
    joined: new Set([
      ...findClassSemicolonLines(source),
      ...findEmptyDescriptionBlockLines(source, body),
      ...findPercentMemberLines(source, body),
    ]),
    verbatim: findLinesEndedBySemicolon(source),
    writtenIndentation: new Set(),
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/** The body of the class diagram of a source. */
function diagramOf(
  source: Source,
): Extract<Source["root"]["body"], { type: "ClassDiagram" }> {
  const { body } = source.root
  if (body.type !== "ClassDiagram") {
    throw new Error("prettier-plugin-mmd: kept lines of a non-class")
  }
  return body
}

/**
 * The lines of the `{` of a member body whose first member line starts
 * with `%%` on that line. On the line of the `{`, `%% c` is a member line,
 * the attribute `%% c` (diagrams/class.md, The member context), while on a
 * line of its own, after only whitespace, it would be a comment line,
 * removed before the lexer reads the text (common.md, Comment lines). So
 * that member line stays on the line of the `{` (docs/class.md, Member
 * bodies).
 */
function findPercentMemberLines(
  source: Source,
  statements: readonly ClassStatement[],
): number[] {
  const lines: number[] = []
  for (const statement of statements) {
    if (statement.type === "ClassNamespaceStatement") {
      lines.push(...findPercentMemberLines(source, statement.body))
      continue
    }
    if (statement.type !== "ClassDeclaration") continue
    const first = statement.members?.at(0)
    if (first === undefined) continue
    if (!source.text.startsWith("%%", first.range[0])) continue
    lines.push(lineStartOf(source, first.range[0]))
  }
  return lines
}

/**
 * The lines on which an empty description block starts a statement, and the
 * line on which it ends when it is written over several lines: the statement
 * that follows it stands on that line, as in `accDescr`, a line break, and
 * `{} class A`.
 */
function findEmptyDescriptionBlockLines(
  source: Source,
  statements: readonly ClassStatement[],
): number[] {
  const lines: number[] = []
  for (const statement of statements) {
    if (
      statement.type === "ClassAccDescrBlockStatement" &&
      statement.value === null
    ) {
      lines.push(
        lineStartOf(source, statement.range[0]),
        lineStartOf(source, statement.range[1] - 1),
      )
    }
  }
  return lines
}
