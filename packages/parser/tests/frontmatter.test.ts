import { describe, expect, it } from "vitest"
import { matchFrontmatter, readFrontmatterTrivia } from "../src/frontmatter.ts"
import { LineIndex } from "../src/positions.ts"

// Expectations come from common.md, Frontmatter. Each case gives the body
// range and where the frontmatter trivia ends, or null.

describe("matchFrontmatter", () => {
  it.each([
    // Condition 4: the body runs from the first content line to the closing line.
    ["---\ntitle: x\n---\nerror", [4, 12], 17],
    ["---\na\nb\n---\n", [4, 7], 12],
    // The frontmatter trivia includes the whitespace-only lines after the closing line.
    ["---\na\n---\n\n  \nx", [4, 5], 14],
    // A whitespace-only last line without a line terminator is not part of it.
    ["---\na\n---\n  ", [4, 5], 10],
    ["---\na\n---\n\n  ", [4, 5], 11],
    // Condition 5: a whitespace-only line before a delimiter line is the body.
    ["---\n\n---\n", [4, 4], 9],
    ["---\n  \n---\n", [4, 6], 11],
    ["---\n\n\n---\n", [5, 5], 10],
    // Condition 4 comes first: a delimiter line after the first content line closes the block.
    ["---\n\n---\n---\n", [5, 8], 13],
    ["---\n---\n---\nx", [4, 7], 12],
    // Only the first delimiter line after the first content line closes the block.
    ["---\na\n---\nb\n---\n", [4, 5], 10],
    // The delimiter lines may end with line whitespace, and `\r\n` and `\r` are line terminators.
    ["---  \na\n---\t\nx", [6, 7], 13],
    ["---\r\na\r\n---\r\nx", [5, 6], 13],
    ["---\ra\r---\rx", [4, 5], 10],
    // The indent must repeat before the closing delimiter, character for character.
    ["  ---\n  a\n  ---\nx", [6, 9], 16],
    ["\uFEFF---\na\n\uFEFF---\nx", [5, 6], 12],
    // Condition 3: an indented `---` inside the body does not close the block.
    ["---\na: |\n  ---\n  b\n---\nx", [4, 18], 23],
    // Adjacent delimiters, no content line, or no closing line: no frontmatter.
    ["---\n---\n", null, null],
    ["---\n---", null, null],
    ["---\n", null, null],
    ["---\na\n", null, null],
    ["---\na\n---", null, null],
    ["---\na\n--- x\n", null, null],
    ["----\na\n----\n", null, null],
    ["  ---\n  a\n---\n", null, null],
    ["---\na\n  ---\n", null, null],
    ["\n---\na\n---\n", null, null],
    ["\u2028---\na\n---\n", null, null],
    ["", null, null],
    ["x", null, null],
  ])("%j", (text, body, end) => {
    const match = matchFrontmatter(text, 0)
    if (body === null) {
      expect(match).toBeNull()
    } else {
      expect(match).not.toBeNull()
      expect([match!.bodyStart, match!.bodyEnd]).toEqual(body)
      expect(match!.end).toBe(end)
      expect(match!.start).toBe(0)
    }
  })

  it("reads U+2028 as line whitespace on a delimiter line", () => {
    const match = matchFrontmatter("---\u2028\na\n---\u2028\nx", 0)
    expect(match).not.toBeNull()
    expect(match!.closingDelimiterEnd).toBe(10)
  })

  it("ends the range after the closing `---`, before its trailing whitespace", () => {
    const match = matchFrontmatter("---\na\n---  \nx", 0)
    expect(match!.closingDelimiterEnd).toBe(9)
    expect(match!.end).toBe(12)
  })

  it("starts at the given offset", () => {
    const match = matchFrontmatter("xx---\na\n---\ny", 2)
    expect(match).toMatchObject({ start: 2, bodyStart: 6, bodyEnd: 7, end: 12 })
  })
})

describe("readFrontmatterTrivia", () => {
  it("builds the Frontmatter from the `---` of the opening line, and says where the text starts after the whitespace-only lines", () => {
    const text = "  ---  \n  a: 1\n  ---\t\r\n\n \u2028\nx"
    const trivia = readFrontmatterTrivia(text, new LineIndex(text))
    expect(trivia).not.toBeNull()
    expect(trivia!.frontmatter).toEqual({
      type: "Frontmatter",
      value: "  a: 1",
      valueRange: [8, 14],
      range: [2, 20],
      loc: { start: { line: 1, column: 2 }, end: { line: 3, column: 5 } },
    })
    expect(trivia!.textStart).toBe(27)
  })

  it("returns null without frontmatter", () => {
    expect(readFrontmatterTrivia("x", new LineIndex("x"))).toBeNull()
  })
})
