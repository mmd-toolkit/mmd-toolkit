import { NODE_FIELDS } from "../src/check-tree/node-fields.ts"
import { isWhitespace } from "../src/db-from-tree/characters.ts"
import type {
  CheckedComment,
  CheckedDirective,
  CheckedFrontmatter,
  CheckedRoot,
  CheckedToken,
  Position,
} from "../src/check-tree/types.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"

// Trees made by hand, for the tests of the check of a tree: a tree is JSON, so
// a test builds the tree of a source from the pieces of the source that its
// tokens, comments, and directives cover, and breaks it by changing the
// object.

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
export function locationOf(
  source: string,
  range: TreeRange,
): { start: Position; end: Position } {
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
export function rangeOf(source: string, piece: Piece): TreeRange {
  const start = source.indexOf(piece.text, piece.from ?? 0)
  if (start === -1) {
    throw new Error(`no ${JSON.stringify(piece.text)} in the text`)
  }
  return [start, start + piece.text.length]
}

/** A token of the tree that covers `piece`. */
export function tokenOf(
  source: string,
  type: string,
  piece: Piece | string,
): CheckedToken {
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
  mark: string | null,
  piece: Piece | string,
  value?: string,
): CheckedComment {
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
export function directiveOf(
  source: string,
  piece: Piece | string,
): CheckedDirective {
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

/** The fields of a node of `type` with an empty value in each, as a hand made body has. */
function emptyFieldsOf(type: string): Record<string, unknown> {
  const empty: Record<string, unknown> = {}
  for (const [field, spec] of Object.entries(NODE_FIELDS[type] ?? {})) {
    switch (spec.shape) {
      case "nodeList":
      case "nodeListWithNull":
        empty[field] = []
        break
      case "value":
        empty[field] =
          spec.valueType === "boolean"
            ? false
            : spec.valueType === "number"
              ? 0
              : spec.valueType === "stringOrNull"
                ? null
                : ""
        break
      default:
        empty[field] = null
    }
  }
  return empty
}

/** What a hand made tree has: the pieces that its records cover. */
export interface Pieces {
  /** The body type; `ErrorDiagram` by default. */
  readonly bodyType?: string
  readonly tokens: readonly (readonly [type: string, piece: Piece | string])[]
  readonly comments?: readonly CheckedComment[]
  readonly directives?: readonly CheckedDirective[]
  readonly frontmatter?: CheckedFrontmatter
}

/**
 * A tree over `source`, made by hand. The body runs from the first token of
 * the diagram to the last, without the `Directive` and `IgnoredSemicolon`
 * tokens and the tokens of the frontmatter.
 */
export function handMadeRoot(source: string, pieces: Pieces): CheckedRoot {
  const tokens = pieces.tokens.map(([type, piece]) =>
    tokenOf(source, type, piece),
  )
  const frontmatterEnd = pieces.frontmatter?.range[1] ?? 0
  const diagramTokens = tokens.filter(
    (token) =>
      token.type !== "Directive" &&
      token.type !== "IgnoredSemicolon" &&
      token.range[0] >= frontmatterEnd,
  )
  const bodyRange: TreeRange = [
    diagramTokens[0]?.range[0] ?? 0,
    diagramTokens.at(-1)?.range[1] ?? 0,
  ]
  const rootRange: TreeRange = [0, source.length]
  return {
    type: "Root",
    diagramType: "error",
    body: {
      type: pieces.bodyType ?? "ErrorDiagram",
      range: bodyRange,
      loc: locationOf(source, bodyRange),
      ...emptyFieldsOf(pieces.bodyType ?? "ErrorDiagram"),
    },
    frontmatter: pieces.frontmatter ?? null,
    comments: pieces.comments ?? [],
    directives: pieces.directives ?? [],
    tokens,
    range: rootRange,
    loc: locationOf(source, rootRange),
  }
}

/** The frontmatter of the tree that covers `piece`, whose value is the text in `valueRange`. */
export function frontmatterOf(
  source: string,
  piece: string,
  valueRange: TreeRange,
): CheckedFrontmatter {
  const range = rangeOf(source, { text: piece })
  return {
    type: "Frontmatter",
    value: source.slice(...valueRange),
    valueRange,
    range,
    loc: locationOf(source, range),
  }
}

/** `token` moved by `by` characters, with its `loc` on the same line. */
export function shifted(token: CheckedToken, by: number): CheckedToken {
  return {
    ...token,
    range: [token.range[0] + by, token.range[1] + by],
    loc: {
      start: { ...token.loc.start, column: token.loc.start.column + by },
      end: { ...token.loc.end, column: token.loc.end.column + by },
    },
  }
}

/**
 * The tokens of `source` as `RawText` runs of characters that are not
 * whitespace, outside the ranges in `skip`, for the trees of tests that are
 * about comments and directives and not about the tokens of a diagram.
 */
export function rawTokensOutside(
  source: string,
  skip: readonly TreeRange[],
): (readonly [type: string, piece: Piece])[] {
  const tokens: (readonly [string, Piece])[] = []
  let start = -1

  /** Ends the run that started at `start`, if there is one, at `end`. */
  function flush(end: number): void {
    if (start !== -1) {
      tokens.push(["RawText", { text: source.slice(start, end), from: start }])
      start = -1
    }
  }

  for (let offset = 0; offset < source.length; offset++) {
    const skipped = skip.some(([from, to]) => from <= offset && offset < to)
    if (skipped || isWhitespace(source.charCodeAt(offset))) {
      flush(offset)
    } else if (start === -1) {
      start = offset
    }
  }
  flush(source.length)
  return tokens
}
