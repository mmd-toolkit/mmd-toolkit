import { describe, expect, it } from "vitest"
import { findDirectives } from "../src/directives.ts"
import { findEntityDelimiters } from "../src/entities.ts"

/**
 * What the lexer reads in place of the `#` and the `;` of the entities of
 * `text`, read as one line segment with its directives found first, as
 * `[offset, text]` pairs in source order. `ignoredSemicolons` are the `;`
 * that the line rule ignores.
 */
function delimitersOf(
  text: string,
  ignoredSemicolons: readonly number[] = [],
): [number, string][] {
  const directives = new Map(
    findDirectives(text, 0).map((directive) => [directive.range[0], directive]),
  )
  const delimiters = findEntityDelimiters({
    text,
    start: 0,
    end: text.length,
    directives,
    ignoredSemicolons: new Set(ignoredSemicolons),
  })
  return [...delimiters]
    .map(([offset, delimiter]): [number, string] => [offset, delimiter.text])
    .sort((a, b) => a[0] - b[0])
}

const OPENING = "\uFB02\u00B0"
const NUMERIC_OPENING = "\uFB02\u00B0\u00B0"
const CLOSING = "\u00B6\u00DF"

// Expectations come from common.md, Entities.

describe("findEntityDelimiters", () => {
  it.each([
    [
      "#amp;",
      [
        [0, OPENING],
        [4, CLOSING],
      ],
    ],
    [
      "#35;",
      [
        [0, NUMERIC_OPENING],
        [3, CLOSING],
      ],
    ],
    [
      "#a1_;",
      [
        [0, OPENING],
        [4, CLOSING],
      ],
    ],
    [
      "a #amp; b",
      [
        [2, OPENING],
        [6, CLOSING],
      ],
    ],
    // Entities are found from left to right and do not overlap.
    [
      "#a;#1;",
      [
        [0, OPENING],
        [2, CLOSING],
        [3, NUMERIC_OPENING],
        [5, CLOSING],
      ],
    ],
    [
      "#a#b;",
      [
        [2, OPENING],
        [4, CLOSING],
      ],
    ],
    // `+` is not a word character, and the word may not be empty.
    ["#+123;", []],
    ["#;", []],
    ["#a", []],
    ["#a ;", []],
    ["#\u00E9;", []],
  ])("%j has the delimiters %j", (text, expected) => {
    expect(delimitersOf(text)).toEqual(expected)
  })

  it("is no entity when the line rule ignores its `;`", () => {
    expect(delimitersOf("#f00;", [4])).toEqual([])
    expect(delimitersOf("#f00;x;", [6])).toEqual([
      [0, OPENING],
      [4, CLOSING],
    ])
  })

  it("reads the segment without its directives, so an entity can have a directive between two of its characters", () => {
    expect(delimitersOf("a#qu%%{init: {}}%%ot;b")).toEqual([
      [1, OPENING],
      [20, CLOSING],
    ])
    expect(delimitersOf("#%%{x}%%1%%{y}%%;")).toEqual([
      [0, NUMERIC_OPENING],
      [16, CLOSING],
    ])
  })

  it("gives the `#` the end of its placeholder, after the `;`, and the `;` none", () => {
    const delimiters = findEntityDelimiters({
      text: "a#qu%%{init: {}}%%ot;b",
      start: 0,
      end: 22,
      directives: new Map(
        findDirectives("a#qu%%{init: {}}%%ot;b", 0).map((directive) => [
          directive.range[0],
          directive,
        ]),
      ),
      ignoredSemicolons: new Set(),
    })
    expect(delimiters.get(1)?.placeholderEnd).toBe(21)
    expect(delimiters.get(20)?.placeholderEnd).toBeNull()
  })

  it("reads only the segment", () => {
    const text = "#a\n;#b;"
    expect([
      ...findEntityDelimiters({
        text,
        start: 0,
        end: 2,
        directives: new Map(),
        ignoredSemicolons: new Set(),
      }),
    ]).toEqual([])
  })
})
