import { describe, expect, it } from "vitest"
import { SourceLexer } from "../src/source-lexer.ts"

const OPENING = "\uFB02\u00B0"
const NUMERIC_OPENING = "\uFB02\u00B0\u00B0"
const CLOSING = "\u00B6\u00DF"
const DELIMITERS = new Set([OPENING, NUMERIC_OPENING, CLOSING])

/**
 * What the lexer reads in place of the `#` and the `;` of the entities of
 * `text`, read from its start, as `[offset, text, placeholderEnd]` triples in
 * source order.
 */
function delimitersOf(text: string): [number, string, number | null][] {
  const lexer = new SourceLexer(text, 0)
  const delimiters: [number, string, number | null][] = []
  let offset = 0
  for (;;) {
    const element = lexer.readAt(offset)
    if (element.kind === "character") {
      if (element.endOfText) return delimiters
      if (DELIMITERS.has(element.text)) {
        delimiters.push([element.start, element.text, element.placeholderEnd])
      }
    }
    offset = element.end
  }
}

// Expectations come from common.md, Entities.

describe("entities", () => {
  it.each([
    [
      "#amp;",
      [
        [0, OPENING, 5],
        [4, CLOSING, null],
      ],
    ],
    [
      "#35;",
      [
        [0, NUMERIC_OPENING, 4],
        [3, CLOSING, null],
      ],
    ],
    [
      "#a1_;",
      [
        [0, OPENING, 5],
        [4, CLOSING, null],
      ],
    ],
    [
      "a #amp; b",
      [
        [2, OPENING, 7],
        [6, CLOSING, null],
      ],
    ],
    // Entities are found from left to right and do not overlap.
    [
      "#a;#1;",
      [
        [0, OPENING, 3],
        [2, CLOSING, null],
        [3, NUMERIC_OPENING, 6],
        [5, CLOSING, null],
      ],
    ],
    [
      "#a#b;",
      [
        [2, OPENING, 5],
        [4, CLOSING, null],
      ],
    ],
    [
      "##a;",
      [
        [1, OPENING, 4],
        [3, CLOSING, null],
      ],
    ],
    // `+` is not a word character, and the word may not be empty.
    ["#+123;", []],
    ["#;", []],
    ["#a", []],
    ["a;", []],
    ["#a ;", []],
    ["# a;", []],
    ["#\u00E9;", []],
    ["#\u{1F600}a;", []],
    // An entity does not reach over a line terminator or a separator.
    [
      "#a\n;#b;",
      [
        [4, OPENING, 7],
        [6, CLOSING, null],
      ],
    ],
    ["#a\u2028b;", []],
  ])("%j has the delimiters %j", (text, expected) => {
    expect(delimitersOf(text)).toEqual(expected)
  })

  it("is no entity when the line rule ignores its `;`", () => {
    expect(delimitersOf("style:#f00;")).toEqual([])
    expect(delimitersOf("style:#f00;x;")).toEqual([
      [6, OPENING, 11],
      [10, CLOSING, null],
    ])
  })

  it("reads the text without its directives, so an entity can have a directive between two of its characters", () => {
    expect(delimitersOf("a#qu%%{init: {}}%%ot;b")).toEqual([
      [1, OPENING, 21],
      [20, CLOSING, null],
    ])
    expect(delimitersOf("#%%{x}%%1%%{y}%%;")).toEqual([
      [0, NUMERIC_OPENING, 17],
      [16, CLOSING, null],
    ])
    expect(delimitersOf("#a%%{x}%%;")).toEqual([
      [0, OPENING, 10],
      [9, CLOSING, null],
    ])
  })

  it("finds no entity in a comment region, and none that reaches into one", () => {
    expect(delimitersOf("%% #a;\nb")).toEqual([])
    expect(delimitersOf("#a\n%% x\n;")).toEqual([])
  })

  it("reads back from a `;` no further than the start of the reading", () => {
    const element = new SourceLexer("#a;", 1).readAt(2)
    expect(element.kind === "character" && element.text).toBe(";")
  })
})
