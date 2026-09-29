import type { Comment, Root, Token } from "@mmd-toolkit/parser"

/**
 * A comment or a `Directive` token: text that belongs to no node, which the
 * printers print as written between the things they print (ast.md, Tokens,
 * and Comments, directives, and frontmatter).
 */
export type Trivia = Comment | Token

/**
 * What a diagram printer reads besides the tree: the source text, the root
 * with its lists, and the comments and directives merged in source order.
 */
export interface Source {
  readonly text: string
  readonly root: Root
  /**
   * `Root.comments` and the `Directive` tokens of `Root.tokens`, merged in
   * source order. The directives are taken from the tokens, not from
   * `Root.directives`: the tokens hold exactly the directives that lie
   * outside the tokens and comments, with the same ranges, so every scan of
   * the text reads one list of what it covers.
   */
  readonly trivia: readonly Trivia[]
}

/**
 * Whether a character is whitespace as common.md defines it (Notation):
 * U+0009 to U+000D, U+0020, U+00A0, U+1680, U+2000 to U+200A, U+2028,
 * U+2029, U+202F, U+205F, U+3000, and U+FEFF. `String.prototype.trim`
 * removes exactly this set: the characters of the Unicode category Zs, the
 * other ECMAScript whitespace, and the line terminators. If a later Unicode
 * version adds a character to Zs, the two sets differ.
 */
export function isWhitespace(character: string): boolean {
  return character.trim() === ""
}

/**
 * Makes the printing context of a parsed document.
 */
export function createSource(text: string, root: Root): Source {
  const directives = root.tokens.filter((token) => token.type === "Directive")
  const trivia = [...root.comments, ...directives].sort(
    (a, b) => a.range[0] - b.range[0],
  )
  return { text, root, trivia }
}

/**
 * Returns the token that starts at `offset`, or `undefined`.
 */
export function findTokenStartingAt(
  source: Source,
  offset: number,
): Token | undefined {
  const index = findFirstIndex(
    source.root.tokens,
    (token) => token.range[0] >= offset,
  )
  const token = source.root.tokens[index]
  return token?.range[0] === offset ? token : undefined
}

/**
 * Returns the last token that ends at or before `offset`, or `undefined`.
 */
export function findTokenEndingBefore(
  source: Source,
  offset: number,
): Token | undefined {
  const index = findFirstIndex(
    source.root.tokens,
    (token) => token.range[1] > offset,
  )
  return source.root.tokens[index - 1]
}

/**
 * Returns the first token that starts at or after `offset` and may belong to
 * the structure of a node, or `undefined`.
 *
 * The printers look for the tokens that the structure of a node implies,
 * such as the bracket that closes a shape (see `isStructural`).
 */
export function findStructuralToken(
  source: Source,
  offset: number,
): Token | undefined {
  const { tokens } = source.root
  let index = findFirstIndex(tokens, (token) => token.range[0] >= offset)
  while (index < tokens.length && !isStructural(source, tokens[index])) {
    index++
  }
  return tokens[index]
}

/**
 * Returns the last token that ends at or before `offset` and may belong to
 * the structure of a node, or `undefined` (see `findStructuralToken`).
 */
export function findStructuralTokenEndingBefore(
  source: Source,
  offset: number,
): Token | undefined {
  const { tokens } = source.root
  let index = findFirstIndex(tokens, (token) => token.range[1] > offset) - 1
  while (index >= 0 && !isStructural(source, tokens[index])) index--
  return tokens[index]
}

/**
 * Whether a token may belong to the structure of a node: a token of the
 * diagram text that is not a `Directive` token, which may lie between any
 * two tokens, as in `A%%{init: {}}%%-->B`, and not a `;`, which separates
 * statements or is ignored within one, and may also lie between any two
 * tokens, as in `A[style:#x] e;@-->B` (ast.md, Tokens). The tokens of the
 * frontmatter are not of the diagram text: its delimiters are `---`
 * punctuators, as an arrow of a flowchart link may be, so they are told
 * apart by the range of the frontmatter, not by their kind or value.
 */
export function isStructural(source: Source, token: Token): boolean {
  const { frontmatter } = source.root
  const inFrontmatter =
    frontmatter !== null &&
    frontmatter.range[0] <= token.range[0] &&
    token.range[1] <= frontmatter.range[1]
  return !inFrontmatter && token.type !== "Directive" && token.value !== ";"
}

/**
 * Returns the tokens that start in `[start, end)`.
 */
export function findTokensBetween(
  source: Source,
  start: number,
  end: number,
): readonly Token[] {
  const first = findFirstIndex(
    source.root.tokens,
    (token) => token.range[0] >= start,
  )
  const afterLast = findFirstIndex(
    source.root.tokens,
    (token) => token.range[0] >= end,
  )
  return source.root.tokens.slice(first, afterLast)
}

/**
 * Returns the comments and directives that start in `[start, end)`.
 */
export function findTriviaBetween(
  source: Source,
  start: number,
  end: number,
): readonly Trivia[] {
  const first = findFirstIndex(source.trivia, (item) => item.range[0] >= start)
  const afterLast = findFirstIndex(
    source.trivia,
    (item) => item.range[0] >= end,
  )
  return source.trivia.slice(first, afterLast)
}

/**
 * Binary search over a list sorted so that `isAtOrAfter` is false for a
 * prefix and true for the rest: returns the index of the first element for
 * which it is true, or the length of the list.
 */
function findFirstIndex<T>(
  list: readonly T[],
  isAtOrAfter: (element: T) => boolean,
): number {
  let low = 0
  let high = list.length
  while (low < high) {
    const middle = (low + high) >>> 1
    if (isAtOrAfter(list[middle])) high = middle
    else low = middle + 1
  }
  return low
}
