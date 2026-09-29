import { describe, expect, it } from "vitest"
import {
  codePointBefore,
  findCharacters,
  findCodePoint,
  findCodePoints,
  lineTerminatorEnd,
  matchCharacters,
  matchCharactersIgnoringCase,
  matchCodePoints,
  nextOffset,
  skipWhile,
} from "../src/text-cursor.ts"

// Expectations come from common.md, Notation and Line terminators.

describe("nextOffset", () => {
  // "a", U+1F600 (a surrogate pair), a lone high surrogate, "b".
  const text = "a\uD83D\uDE00\uD83Db"

  it("moves past a surrogate pair at once and a lone surrogate alone", () => {
    expect(nextOffset(text, 0)).toBe(1)
    expect(nextOffset(text, 1)).toBe(3)
    expect(nextOffset(text, 3)).toBe(4)
    expect(nextOffset(text, 4)).toBe(5)
    expect(nextOffset(text, 5)).toBe(5)
  })
})

describe("lineTerminatorEnd", () => {
  it("reads `\\r\\n` as one terminator, and a lone `\\r` or `\\n` as one each", () => {
    expect(lineTerminatorEnd("a\r\nb", 1)).toBe(3)
    expect(lineTerminatorEnd("a\rb", 1)).toBe(2)
    expect(lineTerminatorEnd("a\nb", 1)).toBe(2)
    expect(lineTerminatorEnd("a\n\rb", 1)).toBe(2)
    expect(lineTerminatorEnd("a\r", 1)).toBe(2)
  })

  it("does not read U+2028, U+2029, or U+0085 as a terminator", () => {
    expect(lineTerminatorEnd("a\u2028b", 1)).toBeNull()
    expect(lineTerminatorEnd("a\u2029b", 1)).toBeNull()
    expect(lineTerminatorEnd("a\u0085b", 1)).toBeNull()
    expect(lineTerminatorEnd("ab", 1)).toBeNull()
    expect(lineTerminatorEnd("ab", 2)).toBeNull()
  })
})

describe("matching and finding", () => {
  // "a", U+1F600 (a surrogate pair), a lone high surrogate, "ab".
  const text = "a\uD83D\uDE00\uD83Dab"

  it("matches characters from data one character at a time", () => {
    expect(matchCharacters(text, 0, "a")).toBe(1)
    expect(matchCharacters(text, 1, "\uD83D\uDE00")).toBe(3)
    // A lone surrogate does not match half of a pair.
    expect(matchCharacters(text, 1, "\uD83D")).toBeNull()
    expect(matchCharacters(text, 3, "\uD83D")).toBe(4)
    expect(matchCharacters(text, 4, "ab")).toBe(6)
    expect(matchCharacters(text, 4, "abc")).toBeNull()
    expect(matchCharacters(text, 6, "")).toBe(6)
  })

  it("finds characters from data at a character boundary", () => {
    expect(findCharacters(text, 0, "\uD83D")).toBe(3)
    expect(findCharacters(text, 0, "ab")).toBe(4)
    expect(findCharacters(text, 5, "a")).toBeNull()
    expect(findCharacters(text, 0, "\uDE00")).toBeNull()
  })

  it("matches and finds fixed code point sequences", () => {
    expect(matchCodePoints(text, 4, [0x61, 0x62])).toBe(6)
    expect(matchCodePoints(text, 4, [0x61, 0x63])).toBeNull()
    expect(matchCodePoints(text, 1, [0x1f600])).toBe(3)
    expect(matchCodePoints(text, 1, [0xd83d])).toBeNull()
    expect(matchCodePoints(text, 6, [])).toBe(6)
    expect(findCodePoints(text, 0, [0x61, 0x62])).toBe(4)
    expect(findCodePoints(text, 0, [0xd83d])).toBe(3)
    expect(findCodePoints(text, 0, [0xde00])).toBeNull()
  })

  it("finds one character at a character boundary", () => {
    expect(findCodePoint(text, 1, 0x61)).toBe(4)
    expect(findCodePoint(text, 0, 0x1f600)).toBe(1)
    expect(findCodePoint(text, 0, 0xde00)).toBeNull()
    expect(findCodePoint(text, 5, 0x61)).toBeNull()
  })

  it("reads the character before an offset", () => {
    expect(codePointBefore(text, 0)).toBeUndefined()
    expect(codePointBefore(text, 1)).toBe(0x61)
    expect(codePointBefore(text, 3)).toBe(0x1f600)
    expect(codePointBefore(text, 4)).toBe(0xd83d)
    expect(codePointBefore(text, 2)).toBe(0xd83d)
  })
})

describe("matchCharactersIgnoringCase", () => {
  it.each([
    ["ISHIKAWA-beta", "ishikawa", 8],
    ["IshiKawa", "ishikawa", 8],
    ["ishikaw", "ishikawa", null],
    ["i\u017Fhikawa", "ishikawa", null],
    ["ishi\u212Aawa", "ishikawa", null],
    ["\u00E9", "\u00C9", 1],
    // Outside the BMP nothing is folded: U+10428 does not match U+10400.
    ["\uD801\uDC28", "\uD801\uDC00", null],
    ["\uD801\uDC28x", "\uD801\uDC28X", 3],
  ])("%j at 0 against %j ends at %j", (text, literal, expected) => {
    expect(matchCharactersIgnoringCase(text, 0, literal)).toBe(expected)
  })
})

describe("skipWhile", () => {
  it("skips characters one at a time", () => {
    const text = "a\uD83D\uDE00\uD83Db"
    expect(skipWhile(text, 0, (codePoint) => codePoint !== 0x62)).toBe(4)
    expect(skipWhile(text, 1, (codePoint) => codePoint > 0xffff)).toBe(3)
    expect(skipWhile(text, 4, () => true)).toBe(5)
    expect(skipWhile(text, 5, () => true)).toBe(5)
  })
})
