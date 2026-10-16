import type {
  FlowchartAccDescrBlockStatement,
  FlowchartStatement,
  FlowchartSubgraphStatement,
  Range,
  Root,
  Token,
} from "@mmd-toolkit/parser"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineEndOf,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween, isWhitespace } from "./source.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/** The word that starts a direction text. */
const DIRECTION = "direction"

/** The values that a direction text ends with. */
const DIRECTION_VALUES: readonly string[] = ["TB", "BT", "RL", "LR", "TD"]

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
      ...findLinesAfterWords(source, statements),
      ...findLinesAfterEmptyStyle(source, statements),
      ...findLinesOfSubgraphBlocks(source, statements),
    ]),
    verbatim: new Set([
      ...directionText,
      ...findStyleLinesWithLineSeparators(source, statements),
      ...findLinesEndedBySemicolon(source),
      ...findLinesOfPercentStatements(source, statements),
    ]),
    writtenIndentation: directionText,
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/**
 * The lines of a `style`, `classDef`, or `linkStyle` statement that hold a
 * U+2028 or U+2029 and a `;`, from the start of the statement to the end of
 * the line: the line is printed as written, from where its statement starts,
 * so a U+2028 or U+2029 before the statement is not printed and does not
 * count. The line rule
 * of mermaid.js, which ignores the last `;` of such a line (common.md, The
 * `style` and `classDef` lines), reads the text up to the character, and the
 * style that is all whitespace after an empty description block reads it as
 * something other than whitespace, so with the character printed as a space
 * the `;` would be read otherwise: `classDef c fill:#f96;`, U+2028, and `;`
 * is accepted, and with a space in place of the U+2028 it is rejected.
 */
function findStyleLinesWithLineSeparators(
  source: Source,
  statements: readonly FlowchartStatement[],
): number[] {
  const lines: number[] = []
  for (const statement of statements) {
    if (statement.type === "FlowchartSubgraphStatement") {
      lines.push(...findStyleLinesWithLineSeparators(source, statement.body))
      continue
    }
    if (
      statement.type !== "FlowchartStyleStatement" &&
      statement.type !== "FlowchartClassDefStatement" &&
      statement.type !== "FlowchartLinkStyleStatement" &&
      statement.type !== "FlowchartDefaultLinkStyleStatement"
    ) {
      continue
    }
    const line = source.text.slice(
      statement.range[0],
      lineEndOf(source, statement.range[1]),
    )
    if (
      line.includes(";") &&
      (line.includes("\u2028") || line.includes("\u2029"))
    ) {
      lines.push(lineStartOf(source, statement.range[0]))
    }
  }
  return lines
}

/**
 * Whether a text ends with one of `wordsReadWithLineBreaks` as a word of its
 * own, or with `direction`: the direction line takes `direction` after any
 * run of characters (diagrams/flowchart.md, The statement context), so
 * `directiondirection ; TB` is two vertices, while `directiondirection` and
 * `TB` on two lines is a direction statement. A word of its own starts the
 * text, or follows a character that is no letter or digit: `fill:click`
 * ends with `click`, and `xclick` does not.
 */
function endsWithWordReadWithLineBreaks(text: string): boolean {
  if (text.endsWith(DIRECTION)) return true
  return wordsReadWithLineBreaks.some((word) => {
    if (!text.endsWith(word)) return false
    const before = text.at(-word.length - 1)
    return before === undefined || !isLetterOrDigit(before)
  })
}

/** Whether a character is an ASCII letter or digit. */
function isLetterOrDigit(character: string): boolean {
  return (
    (character >= "a" && character <= "z") ||
    (character >= "A" && character <= "Z") ||
    (character >= "0" && character <= "9")
  )
}

/**
 * The text of a range without the directives in it: mermaid.js removes
 * directives before it reads the text, so a word that a directive cuts is
 * a word (common.md, Directives).
 */
function textWithoutDirectives(source: Source, range: Range): string {
  let text = ""
  let position = range[0]
  for (const item of findTriviaBetween(source, range[0], range[1])) {
    if (item.type !== "Directive") continue
    text += source.text.slice(position, item.range[0])
    position = item.range[1]
  }
  return text + source.text.slice(position, range[1])
}

/**
 * Where the last word of a range ends, before the whitespace, the comments,
 * and the directives at its end: the name of a subgraph without a title runs
 * over the whitespace after it (ast/flowchart.md, FlowchartSubgraphStatement),
 * and mermaid.js removes comments and directives before it reads the text, so
 * none of them is part of the word that the range ends with.
 */
function findWordEnd(source: Source, range: Range): number {
  const trivia = findTriviaBetween(source, range[0], range[1])
  let end = range[1]
  for (;;) {
    if (end > range[0] && isWhitespace(source.text[end - 1])) {
      end--
      continue
    }
    const covering = findItemEndingAt(trivia, end)
    if (covering === undefined) return end
    end = covering.range[0]
  }
}

/** The comment or directive that ends at an offset, if any. */
function findItemEndingAt(
  trivia: readonly { readonly range: Range }[],
  offset: number,
): { readonly range: Range } | undefined {
  return trivia.find((item) => item.range[1] === offset)
}

/** The text of a range up to the end of its last word (see `findWordEnd`). */
function textUpToLastWord(source: Source, range: Range): string {
  return textWithoutDirectives(source, [range[0], findWordEnd(source, range)])
}

/**
 * The lines that hold a `;` separating two statements after a statement
 * or a subgraph name that ends with one of `wordsReadWithLineBreaks`, or with
 * `direction` (see `endsWithWordReadWithLineBreaks`): the `;` is kept, and the
 * next statement stays on its line: a line break in place of the `;` would be
 * read with the word. The whitespace within the statements may change, as
 * on any line. Strings, with the fragments of a string that comment lines
 * cut (ast.md, Comment), and directives between the word and the `;` are
 * passed over: mermaid.js removes directives before it reads the text, so
 * `A-->click%%{init: {}}%%;B` is read as `A-->click;B` (common.md,
 * Directives).
 */
function findLinesAfterWords(
  source: Source,
  statements: readonly FlowchartStatement[],
): ReadonlySet<number> {
  const { tokens }: Root = source.root
  const lines = new Set<number>()
  for (const range of collectLineRanges(statements)) {
    if (!endsWithWordReadWithLineBreaks(textUpToLastWord(source, range)))
      continue
    const index = tokens.findIndex((token) => token.range[1] === range[1])
    const separator = tokens
      .slice(index + 1)
      .find(
        (token) =>
          token.type !== "String" &&
          token.type !== "StringFragment" &&
          token.type !== "Directive",
      )
    if (separator?.value === ";") {
      lines.add(lineStartOf(source, separator.range[0]))
    }
  }
  return lines
}

/**
 * The ranges of the lines that a `;` may follow: each statement that holds
 * no other statement, and the name of a subgraph without a title.
 */
function collectLineRanges(statements: readonly FlowchartStatement[]): Range[] {
  const ranges: Range[] = []
  for (const statement of statements) {
    if (statement.type === "FlowchartSubgraphStatement") {
      if (statement.title === null) ranges.push(statement.name.range)
      ranges.push(...collectLineRanges(statement.body))
    } else if (statement.type !== "FlowchartEmptyStatement") {
      ranges.push(statement.range)
    }
  }
  return ranges
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
  if (!endsWithWordReadWithLineBreaks(text)) return undefined
  const separator = source.root.tokens.find(
    (token) => token.range[0] >= range[1] && token.type !== "Directive",
  )
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
 * The lines of a style, class definition, or link style statement that
 * ends with a style that is all whitespace and is followed by empty
 * description blocks: the whitespace between the last block and the `;`.
 * The blocks read no token, so for mermaid.js the whitespace before them
 * ends the last unit of the statement, and the whitespace after them is the
 * style that is all whitespace: `linkStyle 0 interpolate basis accDescr {} ;`
 * and `classDef c accDescr {} ;` are accepted, while the same statements
 * followed by a space and a line break are rejected, and so are they with
 * the blocks on the next line. So the statement and the blocks stay together
 * with the `;`, on every line that they lie on (diagrams/flowchart.md, Empty
 * description blocks before a separator; docs/flowchart.md, Statements one
 * per line). A block that starts on the line where the one before it ends
 * belongs to the chain.
 */
function findLinesAfterEmptyStyle(
  source: Source,
  statements: readonly FlowchartStatement[],
): number[] {
  const lines: number[] = []
  for (const [index, statement] of statements.entries()) {
    if (statement.type === "FlowchartSubgraphStatement") {
      lines.push(...findLinesAfterEmptyStyle(source, statement.body))
      continue
    }
    if (
      (statement.type !== "FlowchartStyleStatement" &&
        statement.type !== "FlowchartClassDefStatement" &&
        statement.type !== "FlowchartLinkStyleStatement" &&
        statement.type !== "FlowchartDefaultLinkStyleStatement") ||
      statement.styles.at(-1) !== null
    ) {
      continue
    }
    const statementLine = lineStartOf(source, statement.range[0])
    const chainLines = [statementLine]
    let previousLine = statementLine
    for (const next of statements.slice(index + 1)) {
      if (
        next.type !== "FlowchartAccDescrBlockStatement" ||
        next.value !== null ||
        lineStartOf(source, next.range[0]) !== previousLine
      ) {
        break
      }
      previousLine = lineStartOf(source, next.range[1] - 1)
      chainLines.push(previousLine)
    }
    if (chainLines.length > 1) lines.push(...chainLines)
  }
  return lines
}

/**
 * The lines that hold a direction text but are not a direction statement:
 * `direction`, then whitespace, line feeds included, then `TB`, `BT`, `RL`,
 * `LR`, or `TD`, outside comments and directives. They are printed as
 * written, and keep their written indentation.
 *
 * At a position where a unit starts, the lexer tries the direction line
 * before whitespace (diagrams/flowchart.md, The statement context, rules 14
 * and 26). A line holds such a text without being a direction line only
 * where something before it read it in another way, which can only start at
 * the first column, such as `accTitle:` followed by the rest of the line:
 * `accTitle: t;direction TB` has the title `t;direction TB`. Indented, the
 * line starts with whitespace, the direction line comes first, and the
 * line becomes a direction statement.
 */
function findDirectionTextLines(
  source: Source,
  statements: readonly FlowchartStatement[],
): ReadonlySet<number> {
  const { text } = source
  const excluded: Range[] = [
    ...collectDirectionStatementRanges(statements),
    ...source.trivia.map((item) => item.range),
  ]
  const lines = new Set<number>()
  let index = text.indexOf(DIRECTION)
  while (index !== -1) {
    const valueStart = findDirectionValueStart(text, index + DIRECTION.length)
    if (valueStart !== -1 && !isInside(excluded, index)) {
      lines.add(lineStartOf(source, index))
      lines.add(lineStartOf(source, valueStart))
    }
    index = text.indexOf(DIRECTION, index + 1)
  }
  return lines
}

/**
 * Where the direction value starts after one or more whitespace characters
 * from `offset`, or -1 when no whitespace and value follow.
 */
function findDirectionValueStart(text: string, offset: number): number {
  let position = offset
  while (position < text.length && isWhitespace(text[position])) position++
  if (position === offset) return -1
  return DIRECTION_VALUES.some((value) => text.startsWith(value, position))
    ? position
    : -1
}

/** Whether an offset lies in one of the ranges. */
function isInside(ranges: readonly Range[], offset: number): boolean {
  return ranges.some(([start, end]) => start <= offset && offset < end)
}

/** The ranges of the direction statements, at every depth. */
function collectDirectionStatementRanges(
  statements: readonly FlowchartStatement[],
): Range[] {
  const ranges: Range[] = []
  for (const statement of statements) {
    if (statement.type === "FlowchartSubgraphStatement") {
      ranges.push(...collectDirectionStatementRanges(statement.body))
    } else if (statement.type === "FlowchartDirectionStatement") {
      ranges.push(statement.range)
    }
  }
  return ranges
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
    lines.push(...findLinesOfSubgraphBlocks(source, statement.body))
    const blocks = findHeaderBlocks(source, statement)
    if (blocks.length === 0) continue
    lines.push(
      lineStartOf(source, statement.range[0]),
      ...blocks.map((block) => lineStartOf(source, block.range[1] - 1)),
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
    const first = source.root.tokens.find(
      (token) => token.range[0] === statement.range[0],
    )
    if (first?.type !== "Directive" && first?.value.startsWith("%%") === true) {
      lines.add(lineStartOf(source, statement.range[0]))
    }
  }
  return lines
}
