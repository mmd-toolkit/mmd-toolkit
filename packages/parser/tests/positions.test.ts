import { describe, expect, it } from "vitest"
import { LineIndex } from "../src/positions.ts"

// Expectations come from ast.md, Positions.

describe("LineIndex", () => {
  it("ends a line at `\\n`, `\\r\\n`, and a lone `\\r`, but not at U+2028", () => {
    const lines = new LineIndex("a\nb\r\nc\rd\u2028e")
    expect(lines.position(0)).toEqual({ line: 1, column: 0 })
    expect(lines.position(1)).toEqual({ line: 1, column: 1 })
    expect(lines.position(2)).toEqual({ line: 2, column: 0 })
    expect(lines.position(3)).toEqual({ line: 2, column: 1 })
    expect(lines.position(4)).toEqual({ line: 2, column: 2 })
    expect(lines.position(5)).toEqual({ line: 3, column: 0 })
    expect(lines.position(7)).toEqual({ line: 4, column: 0 })
    expect(lines.position(9)).toEqual({ line: 4, column: 2 })
    expect(lines.position(10)).toEqual({ line: 4, column: 3 })
  })

  it("counts columns in UTF-16 code units", () => {
    const lines = new LineIndex("\uD83D\uDE00x\n")
    expect(lines.position(2)).toEqual({ line: 1, column: 2 })
    expect(lines.position(3)).toEqual({ line: 1, column: 3 })
    expect(lines.position(4)).toEqual({ line: 2, column: 0 })
  })

  it("gives the location of a range", () => {
    const lines = new LineIndex("ab\ncd")
    expect(lines.location([1, 4])).toEqual({
      start: { line: 1, column: 1 },
      end: { line: 2, column: 1 },
    })
  })

  it("handles the empty text", () => {
    expect(new LineIndex("").position(0)).toEqual({ line: 1, column: 0 })
  })
})
