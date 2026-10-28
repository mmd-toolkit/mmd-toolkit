import { appendItems } from "./collections.ts"
import type { Range, StateStatement } from "@mmd-toolkit/parser"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import { layoutCompactEmptyDescriptionBlock, walk } from "./layout.ts"
import type { Source } from "./source.ts"
import { findStructuralToken, isWhitespace } from "./source.ts"

/** The lines that hold a `;`, of each source, found once per source. */
const semicolonLinesBySource = new WeakMap<Source, ReadonlySet<number>>()

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * The lines of a state diagram that hold a `;` (see
 * `findLinesWithOwnSemicolons`), by line start offset. No `;` separates
 * statements in a state diagram: it is a character of an id
 * (diagrams/state.md, The statement context), so every `;` in the diagram
 * is one that the line rule ignores or a character of a token.
 */
export function findStateSemicolonLines(source: Source): ReadonlySet<number> {
  const cached = semicolonLinesBySource.get(source)
  if (cached !== undefined) return cached
  const lines = findLinesWithOwnSemicolons(source)
  semicolonLinesBySource.set(source, lines)
  return lines
}

/**
 * Finds the kept lines of a state diagram, whose statements stay together
 * (docs/state.md, Statements one per line): the lines that hold a `;` (see
 * `findStateSemicolonLines`), and the lines of a statement that the state
 * context reads on from the statement before it (see
 * `findStateContextLines`). The lines that hold U+2028 or U+2029 are
 * printed as written (see `findLineSeparatorLines`).
 */
export function findStateKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const kept: KeptLines = {
    joined: new Set([
      ...findStateSemicolonLines(source),
      ...findStateContextLines(source, diagramOf(source).body),
    ]),
    verbatim: new Set([
      ...findLineSeparatorLines(source),
      ...findLinesEndedBySemicolon(source),
    ]),
    ownIndentation: findLinesStartingWithSeparator(source),
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/**
 * The lines of the text that hold U+2028 or U+2029, also after the last
 * statement, where the comments that the diagram does not reach lie. In a
 * state diagram, these characters end the text in which the lexer looks for
 * a pseudostate mark, a direction line, and a second word before a `{`, while
 * the printer reads them as whitespace: `state a`, U+2028, and
 * `b <<fork>>` is the state name `a` and the fork `b`, and with a space in
 * place of the U+2028, the fork `a b` (diagrams/state.md, The state
 * context). Such a line is printed as written (docs/state.md, Line
 * separators).
 */
function findLineSeparatorLines(source: Source): ReadonlySet<number> {
  const lines = new Set<number>()
  const compactedInteriors: Range[] = []
  // Empty descriptions have no text whose reading a separator can change.
  // Keep other separators on the same line protected (docs/state.md,
  // Line separators and Multi-line values).
  walk(source.root.body, (node) => {
    if (
      node.type !== "StateAccDescrBlockStatement" ||
      node.value !== null ||
      !node.closed
    )
      return
    const compact = layoutCompactEmptyDescriptionBlock(
      source,
      node.range[0],
      node.range[1],
    )
    const opening = compact?.atoms.at(-2)
    const closing = compact?.atoms.at(-1)
    if (opening !== undefined && closing !== undefined)
      compactedInteriors.push([opening.end, closing.start])
  })
  for (let offset = 0; offset < source.text.length; offset++) {
    const character = source.text[offset]
    if (
      (character === "\u2028" || character === "\u2029") &&
      !compactedInteriors.some(
        ([start, end]) => start <= offset && offset < end,
      )
    ) {
      lines.add(lineStartOf(source, offset))
    }
  }
  return lines
}

/**
 * The lines of the diagram that hold U+2028 or U+2029 in the whitespace
 * before their first statement. That whitespace is part of what the lexer
 * reads, so the line keeps it as written, and not the indentation that a
 * printed line gets: with the separator dropped, a second formatting would
 * read the line as any other (docs/state.md, Line separators).
 */
function findLinesStartingWithSeparator(source: Source): ReadonlySet<number> {
  const lines = new Set<number>()
  for (const line of findLineSeparatorLines(source)) {
    let offset = line
    while (offset < source.text.length && isWhitespace(source.text[offset])) {
      if (source.text[offset] === "\n") break
      if (
        source.text[offset] === "\u2028" ||
        source.text[offset] === "\u2029"
      ) {
        lines.add(line)
        break
      }
      offset++
    }
  }
  return lines
}

/** The body of the state diagram of a source. */
function diagramOf(
  source: Source,
): Extract<Source["root"]["body"], { type: "StateDiagram" }> {
  const { body } = source.root
  if (body.type !== "StateDiagram") {
    throw new Error("prettier-plugin-mmd: kept lines of a non-state")
  }
  return body
}

/**
 * The lines on which a statement starts that the state context reads on
 * from the statement before it, without a `state` keyword of its own: the
 * second name of `state a b`, the `""` of `state x ""`, and the names and
 * `""` after them. A line break leaves the state context, so on a line of
 * its own such a statement would be read in the statement context:
 * `state a` followed by a line `b` adds the state b, which `state a b`
 * does not (diagrams/state.md, The state context).
 */
function findStateContextLines(
  source: Source,
  statements: readonly StateStatement[],
): number[] {
  const lines: number[] = []
  for (const statement of statements) {
    if (
      (statement.type === "StateCompositeStatement" ||
        statement.type === "StateAliasDefinitionStatement") &&
      statement.body !== null
    ) {
      appendItems(lines, findStateContextLines(source, statement.body))
    }
    if (isReadOnInStateContext(source, statement)) {
      lines.push(lineStartOf(source, statement.range[0]))
    }
  }
  return lines
}

/**
 * Whether a statement comes from the state context without a `state`
 * keyword of its own (see `findStateContextLines`).
 */
function isReadOnInStateContext(
  source: Source,
  statement: StateStatement,
): boolean {
  switch (statement.type) {
    case "StateCompositeStatement":
    case "StateAliasDefinitionStatement":
    case "StatePseudostateDefinitionStatement":
    case "StateIgnoredStatement": {
      const first = findStructuralToken(source, statement.range[0])
      return !(
        first?.type === "Keyword" && first.value.toLowerCase() === "state"
      )
    }
    default:
      return false
  }
}
