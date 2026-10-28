import { appendItems } from "./collections.ts"
import type {
  FlowchartAccDescrBlockStatement,
  FlowchartStatement,
  FlowchartSubgraphStatement,
  Token,
} from "@mmd-toolkit/parser"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findFirstIndex, findTokenStartingAt } from "./source.ts"

import {
  findStyleLinesWithLineSeparators,
  findLinesAfterWords,
  findLinesAfterEmptyStyle,
  findDirectionTextLines,
  textUpToLastWord,
  findWordEnd,
  endsWithWordReadWithLineBreaks,
} from "./graph-kept-lines.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * Words after which the lexer reads the whitespace that follows, line
 * breaks included, with the word (diagrams/flowchart.md, The statement
 * context, Click and callbacks, and Subgraphs). After one of them, a line
 * break does not separate statements the way a `;` does: `accTitle ; :` is
 * the vertices `accTitle` and `:`, while `accTitle` and `:` on two lines is
 * an accessibility title, and `A-->direction; TB` becomes a direction
 * statement. After `click`, a line break makes it a `click` unit, which may
 * only start a click statement (known-divergences/click-reserved-word.md):
 * `A-->click; B` is accepted, and `A-->click` and `B` on two lines are
 * rejected. `end` takes the line break in a subgraph name and in the text of
 * a style: `subgraph Front end ;` has members, and `subgraph Front end` and
 * `A` on two lines has the name `Front end`, a line feed, and `A`.
 */
const wordsReadWithLineBreaks: readonly string[] = [
  "accTitle",
  "accDescr",
  "click",
  "call",
  "href",
  "end",
]

/** Finds the kept lines of a flowchart. */
export function findFlowchartKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const { root } = source
  if (root.body.type !== "FlowchartDiagram") {
    throw new Error("prettier-plugin-mmd: kept lines of a non-flowchart")
  }
  const statements = root.body.body
  const directionText = findDirectionTextLines(source, statements)
  const kept: KeptLines = {
    joined: new Set([
      ...findLinesWithOwnSemicolons(source),
      ...findLinesAfterWords(source, statements, wordsReadWithLineBreaks),
      ...findLinesAfterEmptyStyle(source, statements),
      ...findLinesOfSubgraphBlocks(source, statements),
    ]),
    verbatim: new Set([
      ...directionText,
      ...findStyleLinesWithLineSeparators(source, statements),
      ...findLinesEndedBySemicolon(source),
      ...findLinesOfPercentStatements(source, statements),
    ]),
    ownIndentation: directionText,
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/**
 * The `;` that follows the name of a subgraph without a title on a later line,
 * when the name ends with one of `wordsReadWithLineBreaks`: the word reads the
 * line break after it, so the `;` still ends the name, and without it the
 * next line would be read as part of the name (`subgraph a end`, a line
 * break, `;`, and `B`: the name is `a end`, while without the `;` it holds a
 * line break and `B`). The `;` is kept where it is, with the whitespace
 * before it as written, as part of the `subgraph` line. A `;` that is a
 * statement of its own, as after the name `a accTitle`, is printed as one.
 */
export function findSemicolonOnLaterLine(
  source: Source,
  subgraph: FlowchartSubgraphStatement,
): Token | undefined {
  if (subgraph.title !== null) return undefined
  const { range } = subgraph.name
  const text = textUpToLastWord(source, range)
  if (!endsWithWordReadWithLineBreaks(text, wordsReadWithLineBreaks))
    return undefined
  const { tokens } = source.root
  let after = findFirstIndex(tokens, (token) => token.range[0] >= range[1])
  while (tokens[after]?.type === "Directive") after++
  const separator = tokens[after]
  if (separator?.value !== ";" || separator.range[0] >= subgraph.range[1]) {
    return undefined
  }
  const isStatement = subgraph.body.some(
    (statement) =>
      statement.type === "FlowchartEmptyStatement" &&
      statement.range[0] === separator.range[0],
  )
  if (isStatement) return undefined
  const between = source.text.slice(
    findWordEnd(source, range),
    separator.range[0],
  )
  return between.includes("\n") || between.includes("\r")
    ? separator
    : undefined
}

/**
 * The lines of the empty description blocks that follow the name of a
 * subgraph without a title on its line, with the line of the `subgraph`: the
 * blocks stay on that line as written. The blocks read no token, so for
 * mermaid.js the whitespace around them, and the `;` that follows them, belong
 * to the name, and the line break after the header is hidden by whitespace
 * that ends it: with the blocks on a line of their own, `subgraph S`, a space,
 * `accDescr {}`, a space, a `;`, and a directive is read as `subgraph S` and
 * the vertex `;` (diagrams/flowchart.md, Subgraphs; ast/flowchart.md,
 * FlowchartSubgraphStatement).
 */
function findLinesOfSubgraphBlocks(
  source: Source,
  statements: readonly FlowchartStatement[],
): number[] {
  const lines: number[] = []
  for (const statement of statements) {
    if (statement.type !== "FlowchartSubgraphStatement") continue
    appendItems(lines, findLinesOfSubgraphBlocks(source, statement.body))
    const blocks = findHeaderBlocks(source, statement)
    if (blocks.length === 0) continue
    lines.push(lineStartOf(source, statement.range[0]))
    appendItems(
      lines,
      blocks.map((block) => lineStartOf(source, block.range[1] - 1)),
    )
  }
  return lines
}

/**
 * The empty description blocks that follow the name of a subgraph without a
 * title on its line, one after the other, as far as they are written on the
 * line where the previous one ends.
 */
export function findHeaderBlocks(
  source: Source,
  subgraph: FlowchartSubgraphStatement,
): FlowchartAccDescrBlockStatement[] {
  if (subgraph.title !== null) return []
  const blocks: FlowchartAccDescrBlockStatement[] = []
  let previousLine = lineStartOf(source, subgraph.name.range[1] - 1)
  for (const next of subgraph.body) {
    if (
      next.type !== "FlowchartAccDescrBlockStatement" ||
      next.value !== null ||
      lineStartOf(source, next.range[0]) !== previousLine
    ) {
      break
    }
    blocks.push(next)
    previousLine = lineStartOf(source, next.range[1] - 1)
  }
  return blocks
}

/**
 * The lines of the statements that start with a token that starts with `%%`,
 * as in `A;%%x`, `A; %%x`, and `accDescr {y}%%z`. mermaid.js reads a `%%` as
 * a comment only at the start of a line or after whitespace that follows a
 * unit that takes no such text, so after a `;` or the `}` of a block the token
 * is the id of a vertex statement, `%%x`, and a statement printed on a line of
 * its own would start with a comment. The line keeps its tokens as written.
 */
function findLinesOfPercentStatements(
  source: Source,
  statements: readonly FlowchartStatement[],
): ReadonlySet<number> {
  const lines = new Set<number>()
  for (const statement of statements) {
    if (statement.type === "FlowchartSubgraphStatement") {
      for (const line of findLinesOfPercentStatements(source, statement.body)) {
        lines.add(line)
      }
    }
    const first = findTokenStartingAt(source, statement.range[0])
    if (first?.type !== "Directive" && first?.value.startsWith("%%") === true) {
      lines.add(lineStartOf(source, statement.range[0]))
    }
  }
  return lines
}
