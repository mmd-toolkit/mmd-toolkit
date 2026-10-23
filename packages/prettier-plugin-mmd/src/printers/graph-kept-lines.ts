import type {
  FlowchartStyleStatement,
  AgentflowStyleStatement,
  FlowchartClassDefStatement,
  AgentflowClassDefStatement,
  FlowchartLinkStyleStatement,
  AgentflowLinkStyleStatement,
  FlowchartDefaultLinkStyleStatement,
  AgentflowDefaultLinkStyleStatement,
  AgentflowFlowStatement,
  AgentflowGlobalStatement,
  AgentflowStatement,
  FlowchartStatement,
  FlowchartSubgraphStatement,
  Range,
  Root,
} from "@mmd-toolkit/parser"
import { lineEndOf, lineStartOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween, isWhitespace } from "./source.ts"

type GraphStatement = FlowchartStatement | AgentflowStatement

type StyleStatement =
  | FlowchartStyleStatement
  | AgentflowStyleStatement
  | FlowchartClassDefStatement
  | AgentflowClassDefStatement
  | FlowchartLinkStyleStatement
  | AgentflowLinkStyleStatement
  | FlowchartDefaultLinkStyleStatement
  | AgentflowDefaultLinkStyleStatement

/** The style-bearing family shared by both graph line rules. */
function isStyleStatement(
  statement: GraphStatement,
): statement is StyleStatement {
  switch (statement.type) {
    case "FlowchartStyleStatement":
    case "AgentflowStyleStatement":
    case "FlowchartClassDefStatement":
    case "AgentflowClassDefStatement":
    case "FlowchartLinkStyleStatement":
    case "AgentflowLinkStyleStatement":
    case "FlowchartDefaultLinkStyleStatement":
    case "AgentflowDefaultLinkStyleStatement":
      return true
    default:
      return false
  }
}

const DIRECTION = "direction"
const DIRECTION_VALUES: readonly string[] = ["TB", "BT", "RL", "LR", "TD"]

/** The graph containers whose body is visited by the shared line rules. */
function holdsStatements(
  statement: GraphStatement,
): statement is
  | FlowchartSubgraphStatement
  | AgentflowFlowStatement
  | AgentflowGlobalStatement {
  return (
    statement.type === "FlowchartSubgraphStatement" ||
    statement.type === "AgentflowFlowStatement" ||
    statement.type === "AgentflowGlobalStatement"
  )
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
export function findStyleLinesWithLineSeparators(
  source: Source,
  statements: readonly GraphStatement[],
): number[] {
  const lines: number[] = []
  for (const statement of statements) {
    if (holdsStatements(statement)) {
      lines.push(...findStyleLinesWithLineSeparators(source, statement.body))
      continue
    }
    if (!isStyleStatement(statement)) continue
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
 * Whether a text ends with one of `words` as a word of its
 * own, or with `direction`: the direction line takes `direction` after any
 * run of characters (diagrams/flowchart.md, The statement context), so
 * `directiondirection ; TB` is two vertices, while `directiondirection` and
 * `TB` on two lines is a direction statement. A word of its own starts the
 * text, or follows a character that is no letter or digit: `fill:click`
 * ends with `click`, and `xclick` does not.
 */
export function endsWithWordReadWithLineBreaks(
  text: string,
  words: readonly string[],
): boolean {
  if (text.endsWith(DIRECTION)) return true
  return words.some((word) => {
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
export function textWithoutDirectives(source: Source, range: Range): string {
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
export function findWordEnd(source: Source, range: Range): number {
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
export function textUpToLastWord(source: Source, range: Range): string {
  return textWithoutDirectives(source, [range[0], findWordEnd(source, range)])
}

/**
 * The lines that hold a `;` separating two statements after a statement
 * or a subgraph name that ends with one of `words`, or with
 * `direction` (see `endsWithWordReadWithLineBreaks`): the `;` is kept, and the
 * next statement stays on its line: a line break in place of the `;` would be
 * read with the word. The whitespace within the statements may change, as
 * on any line. Strings, with the fragments of a string that comment lines
 * cut (ast.md, Comment), and directives between the word and the `;` are
 * passed over: mermaid.js removes directives before it reads the text, so
 * `A-->click%%{init: {}}%%;B` is read as `A-->click;B` (common.md,
 * Directives).
 */
export function findLinesAfterWords(
  source: Source,
  statements: readonly GraphStatement[],
  words: readonly string[],
): ReadonlySet<number> {
  const { tokens }: Root = source.root
  const lines = new Set<number>()
  for (const range of collectLineRanges(statements)) {
    if (!endsWithWordReadWithLineBreaks(textUpToLastWord(source, range), words))
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
function collectLineRanges(statements: readonly GraphStatement[]): Range[] {
  const ranges: Range[] = []
  for (const statement of statements) {
    if (holdsStatements(statement)) {
      if (
        statement.type !== "AgentflowGlobalStatement" &&
        statement.title === null &&
        statement.name !== null
      )
        ranges.push(statement.name.range)
      ranges.push(...collectLineRanges(statement.body))
    } else if (
      statement.type !== "FlowchartEmptyStatement" &&
      statement.type !== "AgentflowEmptyStatement"
    ) {
      ranges.push(statement.range)
    }
  }
  return ranges
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
export function findLinesAfterEmptyStyle(
  source: Source,
  statements: readonly GraphStatement[],
): number[] {
  const lines: number[] = []
  for (const [index, statement] of statements.entries()) {
    if (holdsStatements(statement)) {
      lines.push(...findLinesAfterEmptyStyle(source, statement.body))
      continue
    }
    if (!isStyleStatement(statement) || statement.styles.at(-1) !== null) {
      continue
    }
    const statementLine = lineStartOf(source, statement.range[0])
    const chainLines = [statementLine]
    let previousLine = statementLine
    for (const next of statements.slice(index + 1)) {
      if (
        (next.type !== "FlowchartAccDescrBlockStatement" &&
          next.type !== "AgentflowAccDescrBlockStatement") ||
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
export function findDirectionTextLines(
  source: Source,
  statements: readonly GraphStatement[],
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
  statements: readonly GraphStatement[],
): Range[] {
  const ranges: Range[] = []
  for (const statement of statements) {
    if (holdsStatements(statement)) {
      ranges.push(...collectDirectionStatementRanges(statement.body))
    } else if (
      statement.type === "FlowchartDirectionStatement" ||
      statement.type === "AgentflowDirectionStatement"
    ) {
      ranges.push(statement.range)
    }
  }
  return ranges
}

/** The graph direction rule's keyword must begin before the first segment ends. */
export function hasDirectionTextOnFirstLine(text: string): boolean {
  let end = 0
  while (
    end < text.length &&
    text[end] !== "\n" &&
    text[end] !== "\u2028" &&
    text[end] !== "\u2029"
  )
    end++
  let start = text.indexOf(DIRECTION)
  while (start !== -1 && start < end) {
    if (findDirectionValueStart(text, start + DIRECTION.length) !== -1)
      return true
    start = text.indexOf(DIRECTION, start + 1)
  }
  return false
}
