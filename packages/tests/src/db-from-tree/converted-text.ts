import { scanSource } from "../source-scan.ts"
import { isDigit, isWhitespace, isWordCharacter } from "./characters.ts"
import type { TreeRange, TreeRoot, TreeToken } from "./tree.ts"

/** A character of the converted form, with the offset of the source character it was read from. */
export interface ConvertedCharacter {
  readonly start: number
  readonly codePoint: number
}

const LINE_FEED = 0x0a
const CARRIAGE_RETURN = 0x0d

/** The characters of an entity's placeholder (common.md, Entities): U+FB02, U+00B0, U+00B6, U+00DF. */
const PLACEHOLDER_OPEN = 0xfb02
const PLACEHOLDER_DEGREE = 0xb0
const PLACEHOLDER_PILCROW = 0xb6
const PLACEHOLDER_SHARP_S = 0xdf

/** Marks the offsets of `range` in `marks`. */
function mark(marks: Uint8Array, range: TreeRange): void {
  marks.fill(1, range[0], range[1])
}

/**
 * The offsets of the `"` that common.md, HTML attribute quotes, reads as `'`:
 * the two quotes of each quoted value of each attribute part, found in the
 * text as written, from `from` on.
 */
function findAttributeQuotes(text: string, from: number): Set<number> {
  const quotes = new Set<number>()
  let search = from
  for (;;) {
    const open = text.indexOf("<", search)
    if (open === -1) return quotes
    search = open + 1
    let nameEnd = open + 1
    while (isWordCharacter(text.charCodeAt(nameEnd))) nameEnd++
    const close = text.indexOf(">", nameEnd)
    if (nameEnd === open + 1 || close === -1) continue
    let valueSearch = nameEnd
    for (;;) {
      const equals = text.indexOf('="', valueSearch)
      if (equals === -1 || equals >= close) break
      const valueEnd = text.indexOf('"', equals + 2)
      if (valueEnd === -1 || valueEnd >= close) break
      quotes.add(equals + 1)
      quotes.add(valueEnd)
      valueSearch = valueEnd + 1
    }
    search = close + 1
  }
}

/** common.md, HTML attribute quotes: source-wide positions, found once before any range is read. */
export class AttributeQuotes {
  private readonly source: string

  private readonly positions: ReadonlySet<number>

  public constructor(source: string, root: TreeRoot) {
    this.source = source
    this.positions = findAttributeQuotes(
      source,
      root.frontmatter?.range[1] ?? 0,
    )
  }

  /** Whether the quote at the original source offset is an attribute quote. */
  public has(offset: number): boolean {
    return this.positions.has(offset)
  }

  /** Only attribute quotes are converted; original offsets and line terminators are kept. */
  public of(range: TreeRange, leftOut: (offset: number) => boolean): string {
    let read = ""
    for (let offset = range[0]; offset < range[1]; offset++) {
      if (!leftOut(offset))
        read += this.has(offset) ? "'" : this.source.charAt(offset)
    }
    return read
  }

  /** Apply the source's quote positions to the held value, retaining even a broken value for lexical checks. */
  public readValue(
    range: TreeRange,
    value: string,
    leftOut: (offset: number) => boolean,
    delimiters: number,
    trim: boolean,
  ): string {
    const offsets: number[] = []
    for (let offset = range[0]; offset < range[1]; offset++)
      if (!leftOut(offset)) offsets.push(offset)
    let start = delimiters
    let end = offsets.length - delimiters
    if (trim) {
      while (
        start < end &&
        isWhitespace(this.source.charCodeAt(offsets[start] ?? -1))
      )
        start++
      while (
        end > start &&
        isWhitespace(this.source.charCodeAt(offsets[end - 1] ?? -1))
      )
        end--
    }
    // A broken held value is still checked as supplied. Source positions only
    // describe a value that agrees with its written range.
    if (
      value.length !== end - start ||
      offsets
        .slice(start, end)
        .some(
          (offset, index) => this.source.charAt(offset) !== value.charAt(index),
        )
    )
      return value
    let read = ""
    for (let index = 0; index < value.length; index++) {
      const offset = start + index < end ? offsets[start + index] : undefined
      read +=
        value.charAt(index) === '"' && offset !== undefined && this.has(offset)
          ? "'"
          : value.charAt(index)
    }
    return read
  }
}

/**
 * The offsets that the common source scan leaves out (common.md, Reading a
 * source): the directives, with what their scan takes after them, and the
 * comment regions. Ignored semicolons are supplied by each caller's tree.
 */
function sourceLeftOut(text: string, textStart: number): Uint8Array {
  const leftOut = new Uint8Array(text.length)
  const scan = scanSource(text, textStart)
  for (const directive of scan.directives) {
    mark(leftOut, [directive.range[0], directive.scanEnd])
  }
  for (const commentLine of scan.commentLines) mark(leftOut, commentLine.region)
  return leftOut
}

/** The shared source cuts, with the ignored semicolons supplied by the recorded tree. */
function findLeftOut(
  text: string,
  root: TreeRoot,
  textStart: number,
): Uint8Array {
  const leftOut = sourceLeftOut(text, textStart)
  for (const token of root.tokens) {
    if (token.type === "IgnoredSemicolon") mark(leftOut, token.range)
  }
  return leftOut
}

/**
 * The entity that starts at the visible character `index` of `visible`:
 * `#`, a word, `;`. The index of its `;` in `visible`, and whether its word
 * is digits only; null when none starts there.
 */
function findEntityAt(
  text: string,
  visible: readonly number[],
  index: number,
): { semicolon: number; numeric: boolean } | null {
  if (text[visible[index] ?? -1] !== "#") return null
  let end = index + 1
  while (isWordCharacter(text.charCodeAt(visible[end] ?? -1))) end++
  if (end === index + 1 || text[visible[end] ?? -1] !== ";") return null
  const numeric = visible
    .slice(index + 1, end)
    .every((offset) => isDigit(text.charCodeAt(offset)))
  return { semicolon: end, numeric }
}

/**
 * The converted form of the diagram text (common.md, Reading a source): each
 * line terminator as `\n`, each attribute quote as `'`, and each entity as
 * its placeholder, for the characters of the text outside directives, comment
 * regions, and the `;` that the line rule ignores. Each character knows the
 * offset of the source character it was read from; the characters of a
 * placeholder are read from the `#`, the word, and the `;` as follows: the
 * opening characters from the `#`, the word characters from themselves, the
 * closing characters from the `;`.
 */
export function readConvertedCharacters(
  text: string,
  root: TreeRoot,
  attributes: AttributeQuotes = new AttributeQuotes(text, root),
): ConvertedCharacter[] {
  const textStart = root.frontmatter?.range[1] ?? 0
  const leftOut = findLeftOut(text, root, textStart)
  // Leading whitespace is trivia (common.md, Leading whitespace), also after
  // the directives and comment regions that precede the first unit.
  const visible: number[] = []
  for (let offset = textStart; offset < text.length; offset++) {
    if (leftOut[offset] === 1) continue
    if (visible.length === 0 && isWhitespace(text.charCodeAt(offset))) continue
    visible.push(offset)
  }
  const characters = convertVisibleCharacters(
    text,
    visible,
    attributes,
    leftOut,
  )
  characters.push({ start: text.length, codePoint: LINE_FEED })
  return characters
}

/** The common character conversions, keeping the supplied source offsets and cuts. */
function convertVisibleCharacters(
  text: string,
  visible: readonly number[],
  quotes: AttributeQuotes,
  leftOut: Uint8Array,
  sourceOffset = 0,
): ConvertedCharacter[] {
  const characters: ConvertedCharacter[] = []
  for (let index = 0; index < visible.length; index++) {
    const offset = visible[index] ?? 0
    const entity = findEntityAt(text, visible, index)
    if (entity !== null) {
      const opening = entity.numeric
        ? [PLACEHOLDER_OPEN, PLACEHOLDER_DEGREE, PLACEHOLDER_DEGREE]
        : [PLACEHOLDER_OPEN, PLACEHOLDER_DEGREE]
      for (const codePoint of opening) {
        characters.push({ start: offset, codePoint })
      }
      for (let word = index + 1; word < entity.semicolon; word++) {
        const wordOffset = visible[word] ?? 0
        characters.push({
          start: wordOffset,
          codePoint: text.charCodeAt(wordOffset),
        })
      }
      const semicolonOffset = visible[entity.semicolon] ?? 0
      for (const codePoint of [PLACEHOLDER_PILCROW, PLACEHOLDER_SHARP_S]) {
        characters.push({ start: semicolonOffset, codePoint })
      }
      index = entity.semicolon
      continue
    }
    const code = text.charCodeAt(offset)
    if (code === CARRIAGE_RETURN) {
      characters.push({ start: offset, codePoint: LINE_FEED })
      // A `\r\n` is one line terminator: only when the two are adjacent in
      // the source (a directive between them makes two).
      if (
        text.charCodeAt(offset + 1) === LINE_FEED &&
        leftOut[offset + 1] !== 1
      ) {
        index++
      }
      continue
    }
    if (code === 0x22 && quotes.has(sourceOffset + offset)) {
      characters.push({ start: offset, codePoint: 0x27 })
      continue
    }
    const codePoint = text.codePointAt(offset) ?? code
    characters.push({ start: offset, codePoint })
    // The second half of a surrogate pair is visible too, and is not a character of its own.
    if (codePoint > 0xffff) index++
  }
  return characters
}

/** A value range read with the source-wide HTML tag context and its written delimiters excluded. */
export type ConvertedValueReader = (
  range: TreeRange,
  value: string,
  delimiterLength?: number,
) => string

/** Find HTML attribute quotes once; all other conversion reads only the supplied value ranges. */
export function convertedValuesOf(
  source: string,
  root: TreeRoot,
  diagram: string,
): ConvertedValueReader {
  const attributes = new AttributeQuotes(source, root)
  return (range, value, delimiterLength = 0) =>
    convertedValueOf(source, range, value, delimiterLength, diagram, attributes)
}

/** Leaf-local trivia and entity conversion, retaining original offsets for CRLF and HTML quotes. */
function convertedValueOf(
  source: string,
  range: TreeRange,
  value: string,
  delimiterLength: number,
  diagram: string,
  attributes: AttributeQuotes,
): string {
  const text = `x${source.slice(...range)}`
  const leftOut = sourceLeftOut(text, 0)
  const written: number[] = []
  for (let offset = 1; offset < text.length; offset++) {
    if (leftOut[offset] !== 1) written.push(offset)
  }
  const content =
    delimiterLength === 0
      ? written
      : written.slice(delimiterLength, -delimiterLength)
  const visible: number[] = []
  let at = 0
  for (const offset of content) {
    if (text.charAt(offset) === value.charAt(at) && at < value.length) {
      visible.push(offset)
      at++
    } else if (text.charAt(offset) === ";") {
      leftOut[offset] = 1
    } else {
      throw new Error(
        `${diagram} Db: the written value does not match its node range`,
      )
    }
  }
  if (at !== value.length)
    throw new Error(
      `${diagram} Db: the written value does not match its node range`,
    )
  return convertVisibleCharacters(
    text,
    visible,
    attributes,
    leftOut,
    range[0] - 1,
  )
    .map(({ codePoint }) => String.fromCodePoint(codePoint))
    .join("")
}

/**
 * Whitespace after `}` (diagrams/flowchart.md): the whitespace that follows a
 * `}` up to and including its last line feed is one line feed.
 */
export function readWhitespaceAfterBraceAsLineFeed(
  characters: readonly ConvertedCharacter[],
): ConvertedCharacter[] {
  const result: ConvertedCharacter[] = []
  for (let index = 0; index < characters.length; index++) {
    const character = characters[index]
    if (character === undefined) continue
    result.push(character)
    if (character.codePoint !== 0x7d) continue
    let lastLineFeed = -1
    for (
      let next = index + 1;
      next < characters.length &&
      isWhitespace(characters[next]?.codePoint ?? 0);
      next++
    ) {
      if (characters[next]?.codePoint === LINE_FEED) lastLineFeed = next
    }
    const first = characters[index + 1]
    if (first !== undefined && lastLineFeed !== -1) {
      result.push({ start: first.start, codePoint: LINE_FEED })
      index = lastLineFeed
    }
  }
  return result
}

/**
 * The converted form of ranges of the source, as the steps that build the Db of
 * each diagram read the values of the tree.
 */
export class ConvertedText {
  private readonly characters: readonly ConvertedCharacter[]

  public constructor(characters: readonly ConvertedCharacter[]) {
    this.characters = characters
  }

  /**
   * The converted form of the text of `range`, without the characters in
   * `leftOut`, such as the delimiters of a string.
   */
  public of(range: TreeRange, leftOut: readonly TreeRange[] = []): string {
    let text = ""
    for (const { start, codePoint } of this.characters) {
      if (start < range[0]) continue
      if (start >= range[1]) break
      if (leftOut.some(([from, to]) => from <= start && start < to)) continue
      text += String.fromCodePoint(codePoint)
    }
    return text
  }

  /**
   * The converted forms of the tokens of `tokens` inside `range`, joined: the
   * value of a node whose value is the texts of its tokens. The whitespace
   * between two tokens lies in no token, so it is no part of the value, and a
   * directive or an ignored `;` has no converted form.
   */
  public ofTokensIn(range: TreeRange, tokens: readonly TreeToken[]): string {
    return tokens
      .filter(
        (token) => range[0] <= token.range[0] && token.range[1] <= range[1],
      )
      .map((token) => this.of(token.range))
      .join("")
  }
}
