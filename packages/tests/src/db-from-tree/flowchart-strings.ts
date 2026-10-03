import type { ConvertedCharacter } from "./converted-text.ts"
import type { TreeRange, TreeRoot } from "./tree.ts"

// diagrams/flowchart.md, Strings: where the content of a string lies in the
// source. A string is one unit from its opening `"` to its closing `"`; the
// lexer reads it in nested contexts, and the value of a string is the one
// run of content that the contexts read, so what the contexts read besides
// the run, their delimiters, is left out of the value. The tree has the
// tokens of the string, not the contexts, so the contexts are read again from
// the converted form of the text, as the lexer reads it: a `"` that is an
// attribute quote is a `'` there, and a comment region, which cuts the tokens
// of a string, is not there.

const QUOTE = '"'

const BACKTICK = "`"

/** The context that the lexer is in while it reads a string. */
type StringContext = "string" | "markdown"

/** Where the content run of a string lies among the characters that it is read from, by index. */
interface StringUnit {
  /** The index of the first character of the content run. */
  readonly contentStart: number
  /** The index after the last character of the content run. */
  readonly contentEnd: number
  /** The index after the last character of the string: its closing `"`. */
  readonly end: number
}

/**
 * Strings: reads the string that starts at the index `from` of `characters`,
 * with the rules of the string context and of the markdown string context,
 * and returns where its content run lies. The string ends when the lexer
 * leaves the context that its opening `"` entered.
 */
function readStringUnit(
  characters: readonly string[],
  from: number,
): StringUnit {
  /** The character at `index`, or the empty text after the last. */
  function at(index: number): string {
    return characters[index] ?? ""
  }

  const contexts: StringContext[] = []
  let index = from
  // The opening `"` enters the markdown string context when a backtick
  // follows it, and the string context otherwise.
  if (at(index) === QUOTE && at(index + 1) === BACKTICK) {
    contexts.push("markdown")
    index += 2
  } else if (at(index) === QUOTE) {
    contexts.push("string")
    index += 1
  } else {
    throw new Error(
      `flowchart Db: a string starts with ${JSON.stringify(at(index))}`,
    )
  }
  let contentStart = -1
  let contentEnd = -1
  let runs = 0

  /** Reads a run of content: the characters up to one of `stops`. */
  function readRun(stops: readonly string[]): void {
    const start = index
    while (index < characters.length && !stops.includes(at(index))) index += 1
    runs += 1
    if (contentStart === -1) contentStart = start
    contentEnd = index
  }

  while (contexts.length > 0) {
    if (index >= characters.length) {
      throw new Error("flowchart Db: a string is not closed")
    }
    const here = at(index)
    const next = at(index + 1)
    if (contexts[contexts.length - 1] === "string") {
      if (here === QUOTE && next === BACKTICK) {
        contexts.push("markdown")
        index += 2
      } else if (here === QUOTE) {
        contexts.pop()
        index += 1
      } else {
        readRun([QUOTE])
      }
    } else if (here === BACKTICK && next === QUOTE) {
      contexts.pop()
      index += 2
    } else if (here === QUOTE && next === BACKTICK) {
      contexts.push("markdown")
      index += 2
    } else if (here === QUOTE) {
      contexts.push("string")
      index += 1
    } else if (here === BACKTICK) {
      throw new Error(
        "flowchart Db: a backtick in a markdown string matches no rule",
      )
    } else {
      readRun([BACKTICK, QUOTE])
    }
  }
  // Two or more runs make the input rejected, and no run is an empty string,
  // which no rule of the grammar takes: the tree has neither.
  if (runs !== 1) {
    throw new Error(`flowchart Db: a string with ${runs} runs of content`)
  }
  return { contentStart, contentEnd, end: index }
}

/**
 * The delimiters of the strings of a tree. A string is one `String` token,
 * or, where a comment region or a `;` that the line rule ignores cuts it,
 * `StringFragment` tokens, the first of which starts at the opening `"`.
 */
export class StringDelimiters {
  /** The converted form of the diagram text, one character each, as the lexer reads it. */
  private readonly characters: readonly string[]

  /** The offset of each converted character. */
  private readonly offsets: readonly number[]

  /** The index of the first converted character at each offset where a token of a string starts. */
  private readonly stringStarts = new Map<number, number>()

  public constructor(
    root: TreeRoot,
    characters: readonly ConvertedCharacter[],
  ) {
    this.characters = characters.map(({ codePoint }) =>
      String.fromCodePoint(codePoint),
    )
    this.offsets = characters.map(({ start }) => start)
    const tokenStarts = new Set<number>()
    for (const token of root.tokens) {
      if (token.type === "String" || token.type === "StringFragment") {
        tokenStarts.add(token.range[0])
      }
    }
    this.offsets.forEach((offset, index) => {
      if (tokenStarts.has(offset) && !this.stringStarts.has(offset)) {
        this.stringStarts.set(offset, index)
      }
    })
  }

  /**
   * What the value of the node with the range `range` leaves out of it: the
   * delimiters around the content of the string or markdown string that its
   * first token starts, the opening ones before the content and the closing
   * ones after it. None when the node does not start with a string.
   */
  public around(range: TreeRange): TreeRange[] {
    const first = this.stringStarts.get(range[0])
    if (first === undefined) return []
    const unit = readStringUnit(this.characters, first)
    return [
      [this.offsetAt(first), this.offsetAt(unit.contentStart - 1) + 1],
      [this.offsetAt(unit.contentEnd), this.offsetAt(unit.end - 1) + 1],
    ]
  }

  /** The offset of the converted character `index`. */
  private offsetAt(index: number): number {
    const offset = this.offsets[index]
    if (offset === undefined) {
      throw new Error(`flowchart Db: no converted character ${index}`)
    }
    return offset
  }
}
