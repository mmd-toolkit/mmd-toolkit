/**
 * The pieces that the generated tests put together at the end of a line: a
 * U+2028 or U+2029, a `;`, whitespace, a line break, a comment line, a
 * diagram comment, a directive, a directive that is not closed, and an empty
 * description block. What goes wrong in the printing of the gap between
 * statements goes wrong in a sequence of them, such as a U+2028, a `;`, a
 * line break, and a comment line.
 */

const DIRECTIVE = "%%{init: {}}%%"
const UNCLOSED = "%%{init: {}"

/** U+2028 and U+2029, as escapes: no file of this package holds them. */
export const LINE_SEPARATORS: readonly string[] = ["\u2028", "\u2029"]

/** A piece of a sequence, with the strings that take its turns. */
export interface Piece {
  readonly name: string
  readonly variants: readonly string[]
}

export const pieces: readonly Piece[] = [
  { name: "separator", variants: LINE_SEPARATORS },
  { name: "semicolon", variants: [";"] },
  { name: "space", variants: [" ", "\t"] },
  { name: "line break", variants: ["\n"] },
  { name: "comment line", variants: ["\n%% c"] },
  { name: "diagram comment", variants: ["#c", "%% c", "% c"] },
  { name: "directive", variants: [DIRECTIVE] },
  { name: "unclosed directive", variants: [UNCLOSED] },
  { name: "empty block", variants: ["accDescr {}"] },
]

export const SEPARATOR = 0
export const SEMICOLON = 1

/** The indexes of the pieces. */
export const pieceIndexes: readonly number[] = pieces.map((_, index) => index)

/** The sequences of two pieces: every ordered pair. */
export const pairs: readonly (readonly number[])[] = pieceIndexes.flatMap(
  (first) => pieceIndexes.map((second) => [first, second]),
)

/**
 * The sequences of three pieces that hold both a `;` and a U+2028 or
 * U+2029: where the printer drops a `;` or a line break and keeps the
 * character, or the other way, the reading changes.
 */
export const triples: readonly (readonly number[])[] = pairs
  .flatMap((pair) => pieceIndexes.map((third) => [...pair, third]))
  .filter((triple) => triple.includes(SEPARATOR) && triple.includes(SEMICOLON))

/** The text of a sequence, with the variants of its pieces taking turns. */
export function writeSequence(
  sequence: readonly number[],
  turn: number,
): string {
  return sequence
    .map((index) => {
      const { variants } = pieces[index]
      return variants[turn % variants.length]
    })
    .join("")
}

/** The index of a piece by its name. */
function pieceIndex(name: string): number {
  const index = pieces.findIndex((piece) => piece.name === name)
  if (index === -1) throw new Error(`pieces: no piece named ${name}`)
  return index
}

/**
 * The sequences that every place at the end of a line is tried with, since
 * the failures found so far were in them: a U+2028 or U+2029 alone, which
 * ends the text of a box and of a title, and with a `;` in
 * either order, a `;` after a directive, a comment line after a separator,
 * and the three pieces of the failures where the printer kept the character
 * and dropped the `;`, or the other way, before a comment line.
 */
export const canonicalSequences: readonly (readonly number[])[] = [
  ["separator"],
  ["separator", "line break"],
  ["separator", "semicolon"],
  ["semicolon", "separator"],
  ["directive", "semicolon"],
  ["separator", "comment line"],
  ["separator", "semicolon", "comment line"],
  ["separator", "semicolon", "semicolon"],
  ["semicolon", "separator", "comment line"],
  ["separator", "directive", "semicolon"],
].map((names) => names.map(pieceIndex))
