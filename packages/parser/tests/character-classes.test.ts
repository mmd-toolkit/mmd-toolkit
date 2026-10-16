import { describe, expect, it } from "vitest"
import {
  canonicalize,
  isAsciiDigit,
  isAsciiLetter,
  isHighSurrogate,
  isLineSegmentSeparator,
  isLineWhitespace,
  isLowSurrogate,
  isOutsideBmp,
  isWhitespace,
  isWordCharacter,
  matchesIgnoringCase,
} from "../src/character-classes.ts"

// Expectations come from common.md, Notation.

describe("character sets", () => {
  /** The whitespace characters that Notation lists. */
  const whitespace = [
    0x0009, 0x000a, 0x000b, 0x000c, 0x000d, 0x0020, 0x00a0, 0x1680, 0x2000,
    0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009,
    0x200a, 0x2028, 0x2029, 0x202f, 0x205f, 0x3000, 0xfeff,
  ]

  it("whitespace is exactly the listed set", () => {
    const found: number[] = []
    for (let codePoint = 0; codePoint <= 0x10ffff; codePoint++) {
      if (isWhitespace(codePoint)) found.push(codePoint)
    }
    expect(found).toEqual(whitespace)
  })

  it("line whitespace is whitespace other than `\\r` and `\\n`", () => {
    for (const codePoint of whitespace) {
      expect(isLineWhitespace(codePoint)).toBe(
        codePoint !== 0x000a && codePoint !== 0x000d,
      )
    }
    expect(isLineWhitespace(0x61)).toBe(false)
  })

  it("word characters are ASCII letters, ASCII digits, and `_`", () => {
    const found: string[] = []
    for (let codePoint = 0; codePoint <= 0x10ffff; codePoint++) {
      if (isWordCharacter(codePoint))
        found.push(String.fromCodePoint(codePoint))
    }
    expect(found.join("")).toBe(
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz",
    )
    // U+017F and U+00E9 are letters, but not word characters.
    expect(isWordCharacter(0x017f)).toBe(false)
    expect(isWordCharacter(0x00e9)).toBe(false)
  })

  it("ASCII letters", () => {
    expect(isAsciiLetter(0x41)).toBe(true)
    expect(isAsciiLetter(0x5a)).toBe(true)
    expect(isAsciiLetter(0x61)).toBe(true)
    expect(isAsciiLetter(0x7a)).toBe(true)
    expect(isAsciiLetter(0x40)).toBe(false)
    expect(isAsciiLetter(0x5b)).toBe(false)
    expect(isAsciiLetter(0x60)).toBe(false)
    expect(isAsciiLetter(0x7b)).toBe(false)
    expect(isAsciiLetter(0x00e9)).toBe(false)
  })

  it("ASCII digits", () => {
    expect(isAsciiDigit(0x30)).toBe(true)
    expect(isAsciiDigit(0x39)).toBe(true)
    expect(isAsciiDigit(0x2f)).toBe(false)
    expect(isAsciiDigit(0x3a)).toBe(false)
    // An Arabic-Indic digit is not an ASCII digit.
    expect(isAsciiDigit(0x0661)).toBe(false)
  })

  it("U+2028 and U+2029 separate line segments; nothing else does besides line terminators", () => {
    expect(isLineSegmentSeparator(0x2028)).toBe(true)
    expect(isLineSegmentSeparator(0x2029)).toBe(true)
    expect(isLineSegmentSeparator(0x000a)).toBe(false)
    expect(isLineSegmentSeparator(0x0085)).toBe(false)
  })
})

describe("canonicalize", () => {
  it.each([
    ["a", "A"],
    ["A", "A"],
    ["_", "_"],
    ["\u00E9", "\u00C9"],
    // A character outside ASCII whose uppercase is ASCII keeps itself:
    // U+017F LATIN SMALL LETTER LONG S and U+0131 LATIN SMALL LETTER DOTLESS I.
    ["\u017F", "\u017F"],
    ["\u0131", "\u0131"],
    // U+212A KELVIN SIGN is its own uppercase, and `k` becomes `K`.
    ["\u212A", "\u212A"],
    ["k", "K"],
    // The uppercase of U+00DF is `SS`, two characters, so it keeps itself.
    ["\u00DF", "\u00DF"],
    // A character outside the BMP keeps itself. U+10428 would become U+10400.
    ["\uD801\uDC28", "\uD801\uDC28"],
    // A lone surrogate keeps itself.
    ["\uD801", "\uD801"],
    ["\uDC28", "\uDC28"],
  ])("%j has the canonical form %j", (character, expected) => {
    expect(canonicalize(character.codePointAt(0)!)).toBe(
      expected.codePointAt(0),
    )
  })

  it("matches `\u00DF` with nothing but itself", () => {
    expect(matchesIgnoringCase(0x00df, 0x00df)).toBe(true)
    expect(matchesIgnoringCase(0x00df, 0x53)).toBe(false)
  })
})

describe("surrogates and the BMP", () => {
  it("tells high and low surrogates and characters outside the BMP apart", () => {
    expect(isHighSurrogate(0xd800)).toBe(true)
    expect(isHighSurrogate(0xdbff)).toBe(true)
    expect(isHighSurrogate(0xdc00)).toBe(false)
    expect(isLowSurrogate(0xdc00)).toBe(true)
    expect(isLowSurrogate(0xdfff)).toBe(true)
    expect(isLowSurrogate(0xe000)).toBe(false)
    expect(isOutsideBmp(0xffff)).toBe(false)
    expect(isOutsideBmp(0x10000)).toBe(true)
  })
})
