import type {
  Comment,
  Directive,
  Frontmatter,
  Location,
  Position,
  Range,
  Token,
  TokenKind,
} from "@mmd-toolkit/ast"
import type { TreeRange } from "../src/db-from-tree/tree.ts"

// Source pieces placed explicitly for the Db tests.

/** Line and column of `offset`, counting `\r\n`, `\r`, and `\n` as one line terminator each. */
export function positionOf(source: string, offset: number): Position {
  let line = 1
  let lineStart = 0
  for (let index = 0; index < offset; index++) {
    const character = source[index]
    if (
      character === "\n" ||
      (character === "\r" && source[index + 1] !== "\n")
    ) {
      line++
      lineStart = index + 1
    }
  }
  return { line, column: offset - lineStart }
}

/** The location of `range` in `source`. */
export function locationOf(source: string, range: TreeRange): Location {
  return {
    start: positionOf(source, range[0]),
    end: positionOf(source, range[1]),
  }
}

/** A piece of the source: its text, found at or after `from`. */
export interface Piece {
  readonly text: string
  readonly from?: number
}

/** The range of the first `piece` in `source`. */
export function rangeOf(source: string, piece: Piece): Range {
  const start = source.indexOf(piece.text, piece.from ?? 0)
  if (start === -1) {
    throw new Error(`no ${JSON.stringify(piece.text)} in the text`)
  }
  return [start, start + piece.text.length]
}

/** A token of the tree that covers `piece`. */
export function tokenOf(
  source: string,
  type: TokenKind,
  piece: Piece | string,
): Token {
  const found = typeof piece === "string" ? { text: piece } : piece
  const range = rangeOf(source, found)
  return {
    type,
    value: found.text,
    range,
    loc: locationOf(source, range),
  }
}

/** A comment of the tree that covers `piece`, with the mark `mark`. */
export function commentOf(
  source: string,
  mark: Comment["mark"],
  piece: Piece | string,
  value?: string,
): Comment {
  const found = typeof piece === "string" ? { text: piece } : piece
  const range = rangeOf(source, found)
  const markLength = mark === null ? 0 : mark.length
  return {
    type: "Comment",
    mark,
    value: value ?? found.text.slice(markLength),
    range,
    loc: locationOf(source, range),
  }
}

/** A directive of the tree that covers `piece`, closed when it ends with `}%%`. */
export function directiveOf(source: string, piece: Piece | string): Directive {
  const found = typeof piece === "string" ? { text: piece } : piece
  const range = rangeOf(source, found)
  const closed = found.text.endsWith("}%%")
  const value = closed ? found.text.slice(3, -3) : found.text.slice(3)
  return {
    type: "Directive",
    name: value.trim().split(/\W/u)[0] ?? "",
    value,
    closed,
    range,
    loc: locationOf(source, range),
  }
}

/** The frontmatter of the tree that covers `piece`, whose value is the text in `valueRange`. */
export function frontmatterOf(
  source: string,
  piece: string,
  valueRange: TreeRange,
): Frontmatter {
  const range = rangeOf(source, { text: piece })
  return {
    type: "Frontmatter",
    value: source.slice(...valueRange),
    valueRange: [valueRange[0], valueRange[1]],
    range,
    loc: locationOf(source, range),
  }
}
