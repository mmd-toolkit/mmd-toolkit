import type {
  FlowchartStatement,
  Range,
  Root,
  Token,
} from "@mmd-toolkit/parser"
import type { KeptLines } from "./kept-lines.ts"
import { findLinesWithOwnSemicolons, lineStartOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { isWhitespace } from "./source.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/** The word that starts a direction text. */
const DIRECTION = "direction"

/** The values that a direction text ends with. */
const DIRECTION_VALUES: readonly string[] = ["TB", "BT", "RL", "LR", "TD"]

/**
 * Words after which the lexer reads the whitespace that follows, line
 * breaks included, with the word (diagrams/flowchart.md, The statement
 * context, and Click and callbacks). After one of them, a line break does
 * not separate statements the way a `;` does: `accTitle ; :` is the
 * vertices `accTitle` and `:`, while `accTitle` and `:` on two lines is an
 * accessibility title, and `A-->direction; TB` becomes a direction statement.
 * After `click`, a line break makes it a `click` unit, which may only start a
 * click statement (known-divergences.md, `click-reserved-word`): `A-->click; B` is
 * accepted, and `A-->click` and `B` on two lines are rejected.
 */
const wordsReadWithLineBreaks: ReadonlySet<string> = new Set([
  "accTitle",
  "accDescr",
  "direction",
  "click",
  "call",
  "href",
])

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
      ...findLinesWithOwnSemicolons(source, collectStatementRanges(statements)),
      ...findLinesAfterWords(source, statements),
    ]),
    verbatim: directionText,
    writtenIndentation: directionText,
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/**
 * Whether an `Identifier` is spelled as one of `wordsReadWithLineBreaks`,
 * or ends with `direction`: the direction line takes `direction` after any
 * run of characters (diagrams/flowchart.md, The statement context), so
 * `directiondirection ; TB` is two vertices, while `directiondirection` and
 * `TB` on two lines is a direction statement.
 */
function endsWithWordReadWithLineBreaks(identifier: Token): boolean {
  return (
    wordsReadWithLineBreaks.has(identifier.value) ||
    identifier.value.endsWith(DIRECTION)
  )
}

/**
 * The lines that hold a `;` separating two statements after a statement
 * whose last token is an `Identifier` spelled as one of
 * `wordsReadWithLineBreaks`, or ending with `direction` (see
 * `endsWithWordReadWithLineBreaks`): the `;` is kept, and the next
 * statement stays on its line: a line break in place of the `;` would be
 * read with the word. The whitespace within the statements may change, as
 * on any line.
 */
function findLinesAfterWords(
  source: Source,
  statements: readonly FlowchartStatement[],
): ReadonlySet<number> {
  const { tokens }: Root = source.root
  const lines = new Set<number>()
  for (const [, end] of collectStatementRanges(statements)) {
    const index = tokens.findIndex((token) => token.range[1] === end)
    const last = tokens[index]
    if (last?.type !== "Identifier" || !endsWithWordReadWithLineBreaks(last)) {
      continue
    }
    const separator = tokens
      .slice(index + 1)
      .find((token) => token.type !== "String")
    if (separator?.value === ";") {
      lines.add(lineStartOf(source, separator.range[0]))
    }
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
 * The ranges of the statements that hold no other statement and are not a
 * `;` of their own: a `;` token inside one of them is one that the line
 * rule ignores, not one that separates statements.
 */
function collectStatementRanges(
  statements: readonly FlowchartStatement[],
): Range[] {
  const ranges: Range[] = []
  for (const statement of statements) {
    if (statement.type === "FlowchartSubgraphStatement") {
      ranges.push(...collectStatementRanges(statement.body))
    } else if (statement.type !== "FlowchartEmptyStatement") {
      ranges.push(statement.range)
    }
  }
  return ranges
}
