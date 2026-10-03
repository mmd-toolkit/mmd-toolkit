/**
 * The kinds of the places in a text where generated and differential tests
 * put something: which text is put where is chosen by kind, so that every
 * kind that the fixtures have is covered, and none is covered by chance.
 *
 * Two sets of places have kinds:
 *
 * - A boundary is an offset where a token, a comment, or a directive starts or
 *   ends. Its kind is the element before it, where it stands in its line, the
 *   statement of its line, and the element after it. An element is described
 *   by its type, and by its value when it is a keyword or a punctuator; a
 *   comment by its mark (`fragment` for the text after a comment line that cut
 *   a diagram comment, which has none); and a directive by whether it is
 *   closed.
 * - A place inside a token of two or more characters (a directive and a
 *   comment excepted) is after its first character, in its middle, or before
 *   its last character; a token of two characters has the first only. Its kind
 *   is the description of the token and the place.
 *
 * The functions return the parts of a kind as separate fields, and the caller
 * joins the parts it wants into a key (and so decides how fine the kinds are):
 * `selectByKey` takes places by such a key.
 *
 * The functions take the structure of a parsed text (tokens, comments,
 * directives, ranges) as plain values, so that this package does not depend
 * on a parser: the `Root` of `@mmd-toolkit/parser` has them.
 */

/** A range of a text: the offset of its start and of its end. */
export type KindRange = readonly [start: number, end: number]

/** A token, as the kinds read it. */
export interface KindToken {
  /**
   * The token type, such as `Keyword`, `Punctuator`, `Directive` or
   * `IgnoredSemicolon` (a `;` that the line rule ignores as a separator).
   */
  readonly type: string
  /** The source text of the token. */
  readonly value: string
  readonly range: KindRange
}

/** A comment, as the kinds read it. */
export interface KindComment {
  /** The characters of its mark; `null` for a fragment without a mark. */
  readonly mark: string | null
  readonly range: KindRange
}

/** A directive, as the kinds read it. */
export interface KindDirective {
  /** Whether the directive ends with `}%%`. */
  readonly closed: boolean
  readonly range: KindRange
}

/** What the kinds read of a parsed text. */
export interface KindSource {
  readonly text: string
  /** Every token, in order. */
  readonly tokens: readonly KindToken[]
  readonly comments: readonly KindComment[]
  readonly directives: readonly KindDirective[]
}

/** Where a boundary stands in its line. */
export type LinePosition = "start" | "lineStart" | "lineEnd" | "mid"

/** A boundary of a text, with the parts of its kind. */
export interface TextBoundary {
  readonly offset: number
  /** The description of the element that ends here, or `-`. */
  readonly before: string
  /** Where the boundary stands in its line. */
  readonly position: LinePosition
  /**
   * The statement of the line of the boundary: its first token, as the
   * lower-cased value of a keyword or the type of any other token; `-` where
   * the line has no token.
   */
  readonly statement: string
  /** The description of the element that starts here, or `-`. */
  readonly after: string
  /** Whether nothing but whitespace follows the boundary in the text. */
  readonly atEnd: boolean
}

/** Where a place inside a token is. */
export type InnerPosition = "after first" | "middle" | "before last"

/** A place inside a token, with the parts of its kind. */
export interface InnerPlace {
  readonly offset: number
  /** The description of the token. */
  readonly token: string
  readonly position: InnerPosition
  /** The statement of the line of the place, as for a boundary. */
  readonly statement: string
}

/** What starts or ends at an offset. */
interface Element {
  readonly start: number
  readonly end: number
  readonly label: string
}

/** The longest value of a keyword or a punctuator that a label keeps. */
const MOST_VALUE_CHARACTERS = 14

/**
 * The description of a token for the kind of a place: its type, with its
 * value for a keyword or a punctuator, and whether a directive is closed.
 */
function describeToken(
  token: KindToken,
  directives: readonly KindDirective[],
): string {
  if (token.type === "Directive") {
    const directive = directives.find(
      (candidate) => candidate.range[0] === token.range[0],
    )
    return directive?.closed === true ? "Directive:closed" : "Directive:open"
  }
  if (token.type === "Keyword" || token.type === "Punctuator") {
    return `${token.type}:${token.value.toLowerCase().slice(0, MOST_VALUE_CHARACTERS)}`
  }
  return token.type
}

/** The elements of a text: its tokens and its comments, in order. */
function findElements(source: KindSource): Element[] {
  return [
    ...source.tokens.map((token) => ({
      start: token.range[0],
      end: token.range[1],
      label: describeToken(token, source.directives),
    })),
    ...source.comments.map((comment) => ({
      start: comment.range[0],
      end: comment.range[1],
      label: `Comment:${comment.mark ?? "fragment"}`,
    })),
  ].sort((a, b) => a.start - b.start)
}

/** Where `offset` stands in its line. */
function findPosition(text: string, offset: number): LinePosition {
  if (offset === 0) return "start"
  let after = offset
  while (text[after] === " " || text[after] === "\t") after++
  if (text[after] === "\r" && text[after + 1] === "\n") after++
  if (after >= text.length || text[after] === "\n") return "lineEnd"
  return text[offset - 1] === "\n" ? "lineStart" : "mid"
}

/** The offset of the line feed that ends the line holding `offset`, or the end of the text. */
function lineEndOf(text: string, offset: number): number {
  const lineFeed = text.indexOf("\n", offset)
  return lineFeed === -1 ? text.length : lineFeed
}

/**
 * The statement of the line that holds `offset`: its first token, as the
 * lower-cased value of a keyword or the type of any other token; `-` where
 * the line has no token.
 */
function findStatement(source: KindSource, offset: number): string {
  const lineStart = source.text.lastIndexOf("\n", offset - 1) + 1
  const lineEnd = lineEndOf(source.text, offset)
  const first = source.tokens.find(
    (token) => token.range[0] >= lineStart && token.range[0] < lineEnd,
  )
  if (first === undefined) return "-"
  return first.type === "Keyword" ? first.value.toLowerCase() : first.type
}

/** The boundaries of a text, with the parts of their kinds. */
export function findBoundaries(source: KindSource): TextBoundary[] {
  const { text } = source
  const elements = findElements(source)
  const offsets = [
    ...new Set(elements.flatMap((element) => [element.start, element.end])),
  ].sort((a, b) => a - b)
  return offsets.map((offset) => {
    const before = elements.filter((element) => element.end === offset).at(-1)
    const after = elements.find((element) => element.start === offset)
    return {
      offset,
      before: before?.label ?? "-",
      position: findPosition(text, offset),
      statement: findStatement(source, offset),
      after: after?.label ?? "-",
      atEnd: text.slice(offset).trim() === "",
    }
  })
}

/**
 * The places inside the tokens of a text, with the parts of their kinds: in
 * each token of two or more characters, except a directive, after its first
 * character, in its middle (the character half the length from its start,
 * rounded down), and before its last character. A place is listed once for
 * each offset: a token of two characters has `after first` only, one of three
 * has `after first` and `before last`, and the middle is a place of its own
 * from four characters. A character is a code point, and a place is never
 * between the two halves of a surrogate pair.
 */
export function findInnerPlaces(source: KindSource): InnerPlace[] {
  const places: InnerPlace[] = []
  for (const token of source.tokens) {
    if (token.type === "Directive") continue
    const [start, end] = token.range
    const characters = Array.from(source.text.slice(start, end))
    const length = characters.length
    if (length < 2) continue
    const description = describeToken(token, source.directives)
    // The index, in characters, of each place; the first two and the last
    // are distinct for a token of three characters, the middle from four.
    const indexes: [InnerPosition, number][] = [["after first", 1]]
    if (length >= 4) indexes.push(["middle", Math.floor(length / 2)])
    if (length >= 3) indexes.push(["before last", length - 1])
    for (const [position, index] of indexes) {
      const offset = start + characters.slice(0, index).join("").length
      const statement = findStatement(source, offset)
      places.push({ offset, token: description, position, statement })
    }
  }
  return places
}

/**
 * Takes up to `perKey` places of each key, from different lists where there
 * are several: the first place of a key in each list, in list order, and then
 * the next ones of the lists until `perKey`. A list is the places of one text
 * (a fixture), in the order they are found; `keyOf` makes the key of a place
 * from the parts of its kind.
 */
export function selectByKey<Place>(
  lists: readonly (readonly Place[])[],
  perKey: number,
  keyOf: (place: Place) => string,
): Map<string, Place[]> {
  const byList = lists.map((places) => {
    const keys = new Map<string, Place[]>()
    for (const place of places) {
      const key = keyOf(place)
      const sameKey = keys.get(key) ?? []
      sameKey.push(place)
      keys.set(key, sameKey)
    }
    return keys
  })
  const selected = new Map<string, Place[]>()
  for (let round = 0; round < perKey; round++) {
    for (const keys of byList) {
      for (const [key, places] of keys) {
        const taken = selected.get(key) ?? []
        if (taken.length >= perKey) continue
        const place = places[round]
        if (place === undefined) continue
        // The first round takes one per list; a later round only adds where
        // fewer than `perKey` lists have the key.
        taken.push(place)
        selected.set(key, taken)
      }
    }
  }
  return selected
}
