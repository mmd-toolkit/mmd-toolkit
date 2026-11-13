import { appendItems } from "./collections.ts"
import type { Range, StateStatement } from "@mmd-toolkit/ast"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import { layoutCompactEmptyDescriptionBlock, walk } from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenStartingAt,
  isWhitespace,
  skipRemoved,
  textRead,
} from "./source.ts"

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
      ...findLinesReadAsCommentsByOlderVersions(source, diagramOf(source).body),
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
    while (offset < source.text.length) {
      offset = skipRemoved(source, offset)
      if (offset >= source.text.length || !isWhitespace(source.text[offset]))
        break
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

/**
 * The lines on which a version that counts reads the text after a statement
 * as a comment or as a part of it, which the formatter prints as written
 * (docs/state.md, Statements one per line):
 *
 * - A statement of the top level that starts with a `%` word, with another
 *   statement after it on its line that does not start with a `%` word (see
 *   `startsWithPercentWord`): the oldest versions that count read the `%`
 *   where a token starts as the start of a comment, and the comment runs to
 *   the end of the line. A statement after it that starts with a `%` word is
 *   a comment on a line of its own as well.
 * - A `click` statement that holds a `:`, with another statement after it on
 *   its line: the oldest version that counts has no `click` statement, and
 *   reads the `:` as the start of a description that runs on over the
 *   statements after it (see `holdsColon`). The directives are left out,
 *   since mermaid.js removes them before it reads the text.
 */
function findLinesReadAsCommentsByOlderVersions(
  source: Source,
  statements: readonly StateStatement[],
  topLevel = true,
): number[] {
  const lines: number[] = []
  for (const [index, statement] of statements.entries()) {
    const line = lineStartOf(source, statement.range[0])
    const later: StateStatement[] = []
    for (
      let next = index + 1;
      next < statements.length &&
      lineStartOf(source, statements[next].range[0]) === line;
      next++
    ) {
      later.push(statements[next])
    }
    if (
      topLevel &&
      later.some((next) => !startsWithPercentWord(source, next)) &&
      startsWithPercentWord(source, statement)
    ) {
      lines.push(line)
    }
    if (
      later.length > 0 &&
      statement.type === "StateClickStatement" &&
      holdsColon(source, statement.range)
    ) {
      lines.push(line)
    }
    if (
      (statement.type === "StateCompositeStatement" ||
        statement.type === "StateAliasDefinitionStatement") &&
      statement.body !== null
    ) {
      appendItems(
        lines,
        findLinesReadAsCommentsByOlderVersions(source, statement.body, false),
      )
    }
  }
  return lines
}

/**
 * Whether a state or a transition starts with a word that starts with `%` but
 * is no `%%` comment: `%`, `%a`, `% --> b`. The words after the `state`
 * keyword and the words in braces are read in other contexts of the lexer of
 * the oldest versions that count, which do not read the `%` as a comment.
 */
function startsWithPercentWord(
  source: Source,
  statement: StateStatement,
): boolean {
  if (
    statement.type !== "StateDefinitionStatement" &&
    statement.type !== "StateTransitionStatement"
  )
    return false
  const first = findTokenStartingAt(source, statement.range[0])
  return (
    first?.type === "Identifier" &&
    first.value.startsWith("%") &&
    !first.value.startsWith("%%")
  )
}

/** Whether the text of a range, without its directives, holds a `:`. */
function holdsColon(source: Source, range: Range): boolean {
  return textRead(source, range[0], range[1]).includes(":")
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
