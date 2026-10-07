/**
 * The shape of a text, for choosing which of many inputs become fixtures
 * (docs/maintaining-fixtures.md, Choosing inputs by shape). Two inputs of one
 * shape differ only in the names, strings, and texts that the author gave,
 * as far as they are the same name or another, so one of them stands for both;
 * two that differ in a word, an arrow, a number, whitespace, a `;`, a U+2028 or
 * U+2029, a comment, a line break, whether two names are one, or the way the
 * grammar cut the text into tokens, do not.
 */
import { DATA_BLOCK_NODE_TYPES } from "./check-tree/node-types.ts"
import { nodesOf } from "./check-tree/walk.ts"
import type { CheckedRoot } from "./check-tree/types.ts"
import { IDS_WITHOUT_NODE } from "./db-from-tree/state.ts"

/** A token of a text, as the shape reads it: its type and where it lies. */
export interface ShapeToken {
  /** The token type, such as `Keyword`, `Punctuator`, or `RawText`. */
  readonly type: string
  /** The source text of the token. */
  readonly value: string
  /** The start and the end of the token in the text. */
  readonly range: readonly [number, number]
}

/**
 * The types of the tokens that hold what the author names. The reading does
 * not depend on the spelling of their words and numbers, except where the
 * exception below says so; it depends on where they start and end, which the
 * boundaries of the tokens in a shape show, and on the characters that are
 * not letters or digits (a `:` and a `#` before a `;`, which the line rule
 * reads, a quote). Every other token (a `Keyword`, a `Punctuator`, a
 * `Numeric`, a `Directive`, an `IgnoredSemicolon`) is a word, a letter of an
 * arrow, a number, or a text that the grammar reads by its value, and stays as
 * written.
 */
export const SHAPE_CONTENT_TYPES: ReadonlySet<string> = new Set([
  "Identifier",
  "RawText",
  "String",
  "StringFragment",
])

/** What a shape is made from: the tokens of a text, and the ranges that stay as written. */
export interface ShapeSource {
  readonly tokens: readonly ShapeToken[]
  /**
   * The ranges whose tokens stay as written, as their words are values: the
   * frontmatter and the data blocks `@{ … }` (`"wrap": true` and
   * `"wrap": false`, a shape that exists in `shape:` and one that does not).
   */
  readonly writtenRanges: readonly (readonly [number, number])[]
}

/**
 * The shape source of a recorded tree (`ast.json`) or of the tree that the
 * parser returns: its tokens, and the ranges of its frontmatter and of its data
 * block nodes, taken from the tree and not found again in the text.
 */
export function shapeSourceOf(tree: CheckedRoot): ShapeSource {
  const writtenRanges: (readonly [number, number])[] = []
  if (tree.frontmatter !== null) writtenRanges.push(tree.frontmatter.range)
  for (const node of nodesOf(tree)) {
    if (DATA_BLOCK_NODE_TYPES.has(node.type)) writtenRanges.push(node.range)
  }
  return { tokens: tree.tokens, writtenRanges }
}

/**
 * The names of a text, numbered as they first appear: a run of letters, digits,
 * and underscores becomes `a1`, `a2`, … (the same spelling, the same number), or
 * `0_1`, `0_2`, … when it is digits only. The spelling of a name does not
 * change the reading, but whether two names are one does (`A-->B` has two
 * vertices, and `A-->A` one).
 */
class NameNumbers {
  private readonly words = new Map<string, number>()

  private readonly digits = new Map<string, number>()

  /** The label of a run: its number among the words, or among the numbers. */
  private labelOf(run: string): string {
    const isNumber = /^\p{N}+$/u.test(run)
    const known = isNumber ? this.digits : this.words
    let number = known.get(run)
    if (number === undefined) {
      number = known.size + 1
      known.set(run, number)
    }
    return isNumber ? `0_${number}` : `a${number}`
  }

  /**
   * The fragments `texts` of one name, as a directive cuts it (`a%%{init:
   * {}}%%b` is the name `ab`), with the runs of the joined text numbered and
   * every other character as written. A run that a cut lies in is labelled in
   * the fragment where it starts, and the rest of it goes.
   */
  public collapse(texts: readonly string[]): string[] {
    const joined = texts.join("")
    const owner = texts.flatMap((text, index) =>
      Array.from({ length: text.length }, () => index),
    )
    const collapsed = texts.map(() => "")

    /** Adds the characters from `from` to `to` of the joined text as written. */
    function addWritten(from: number, to: number): void {
      for (let offset = from; offset < to; offset++) {
        collapsed[owner[offset] ?? 0] += joined.charAt(offset)
      }
    }

    let position = 0
    for (const match of joined.matchAll(/[\p{L}\p{N}_]+/gu)) {
      addWritten(position, match.index)
      collapsed[owner[match.index] ?? 0] += this.labelOf(match[0])
      position = match.index + match[0].length
    }
    addWritten(position, joined.length)
    return collapsed
  }
}

/**
 * The shape of `text`, made from its `source` (null for a text that the parser
 * rejects, which has no tokens): the list, as JSON, of the characters outside
 * the tokens, as written (whitespace, line terminators, comments), and of the
 * tokens, each with its type, so that where a token starts and ends is part of
 * the shape. A token that holds what the author names (an `Identifier`, a
 * `RawText`, a `String`, a `StringFragment`) has its words and numbers numbered
 * as they first appear (`NameNumbers`), the fragments that a directive cuts out
 * of one name together (`a%%{init: {}}%%b` is the name `ab`), and the rest of
 * its characters as written. Every other token, and every token in a written
 * range (the frontmatter, a data block), has its text as written.
 *
 * Three exceptions, where the reading depends on whether a word is in a set and
 * no token shows it; the token stays as written:
 *
 * - the run of text right after a `box` keyword: a colour when it is the name
 *   of a CSS colour and a name when it is another word (diagrams/sequence.md,
 *   the box line): `box red` has the fill `red`, and `box team` the name `team`;
 * - the runs of text of a `linkStyle` statement, up to its `;` or the end of
 *   its line: mermaid.js adds `fill:none` to the style of an edge when no style
 *   of the list is a `fill` one: `linkStyle 0 fill:red` gives the edge the
 *   style `fill:red`, and `linkStyle 0 color:red` the styles `color:red` and
 *   `fill:none`;
 * - a token whose whole text is the id of a state that makes no node
 *   (`IDS_WITHOUT_NODE`), in any diagram and position: `state </join></fork>
 *   <<fork>>` has no fork state, and `state </x></fork> <<fork>>` has one. The
 *   token only separates shapes that would be one: where no state id is meant,
 *   the text is read as any other and the shape is finer than it needs to be.
 *
 * A place of this kind is added here when it is found, with the inputs that
 * show it.
 *
 * A text with no source has its words and numbers numbered, and nothing else.
 */
export function shapeOf(text: string, source: ShapeSource | null): string {
  const names = new NameNumbers()
  if (source === null || source.tokens.length === 0) {
    return names.collapse([text]).join("")
  }
  const { tokens } = source
  const kept = keptTokensOf(text, source)
  // The texts of the tokens whose words are numbered: the fragments that a
  // directive or an ignored `;` cuts out of one name are numbered together.
  const collapsed = new Map<number, string>()
  for (let index = 0; index < tokens.length; index++) {
    if (kept[index] === true || collapsed.has(index)) continue
    const fragments = fragmentsOfNameAt(tokens, index, kept)
    const numbered = names.collapse(
      fragments.map((at) => textOf(text, tokens[at])),
    )
    for (const [order, at] of fragments.entries()) {
      collapsed.set(at, numbered[order] ?? "")
    }
  }
  const parts: (string | readonly [type: string, text: string])[] = []
  let position = 0
  for (const [index, token] of tokens.entries()) {
    const [start, end] = token.range
    if (start > position) parts.push(text.slice(position, start))
    position = end
    parts.push([token.type, collapsed.get(index) ?? text.slice(start, end)])
  }
  if (position < text.length) parts.push(text.slice(position))
  return JSON.stringify(parts)
}

/** The source text of `token`. */
function textOf(text: string, token: ShapeToken | undefined): string {
  return token === undefined ? "" : text.slice(token.range[0], token.range[1])
}

/**
 * Whether each token stays as written: a token that holds no name, one in a
 * written range, and the tokens of the exceptions.
 */
function keptTokensOf(text: string, source: ShapeSource): boolean[] {
  let previous: ShapeToken | undefined
  // Whether the tokens so far are in a `linkStyle` statement, which ends at a
  // `;` or a line break.
  let inLinkStyle = false
  let position = 0
  return source.tokens.map((token) => {
    const [start, end] = token.range
    if (/[\n\r]/u.test(text.slice(position, start)) || token.value === ";") {
      inLinkStyle = false
    }
    position = end
    const kept =
      !SHAPE_CONTENT_TYPES.has(token.type) ||
      source.writtenRanges.some(([from, to]) => from <= start && start < to) ||
      IDS_WITHOUT_NODE.includes(text.slice(start, end)) ||
      (token.type === "RawText" &&
        ((previous?.type === "Keyword" &&
          previous.value.toLowerCase() === "box") ||
          inLinkStyle))
    if (token.type === "Keyword" && token.value === "linkStyle") {
      inLinkStyle = true
    }
    previous = token
    return kept
  })
}

/**
 * The tokens of the name that has a token at `index`: that token, and the
 * tokens of its type that follow a directive or an ignored `;` with nothing
 * between (a directive cuts a name into fragments).
 */
function fragmentsOfNameAt(
  tokens: readonly ShapeToken[],
  index: number,
  kept: readonly boolean[],
): number[] {
  const first = tokens[index]
  const fragments = [index]
  let at = index + 1
  let end = first?.range[1] ?? 0
  for (;;) {
    let cutEnd = end
    let next = at
    while (
      tokens[next] !== undefined &&
      (tokens[next]?.type === "Directive" ||
        tokens[next]?.type === "IgnoredSemicolon") &&
      tokens[next]?.range[0] === cutEnd
    ) {
      cutEnd = tokens[next]?.range[1] ?? cutEnd
      next++
    }
    const fragment = tokens[next]
    if (
      next === at ||
      fragment === undefined ||
      fragment.type !== first?.type ||
      fragment.range[0] !== cutEnd ||
      kept[next] === true
    ) {
      return fragments
    }
    fragments.push(next)
    at = next + 1
    end = fragment.range[1]
  }
}
