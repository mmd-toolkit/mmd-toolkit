import { describe, expect, it } from "vitest"
import { RangeIndex } from "../src/range-index.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"

const outer = { range: [1, 12] as TreeRange }
const first = { range: [2, 4] as TreeRange }
const empty = { range: [4, 4] as TreeRange }
const last = { range: [7, 9] as TreeRange }

describe("RangeIndex", () => {
  it("includes empty boundary ranges", () => {
    const index = new RangeIndex([outer, first, empty, last])
    expect(index.in([2, 4])).toEqual([first, empty])
    expect(index.in([4, 4])).toEqual([empty])
    expect(index.in([12, 13])).toEqual([])
    expect(index.in([0, 0])).toEqual([])
    expect([...index.from(4)]).toEqual([empty, last])
    expect(index.firstFrom(4, (item) => item !== empty)).toBe(last)
    expect(index.firstFrom(10)).toBeUndefined()
  })

  it("finds overlapping earlier containers without including touching ends", () => {
    const index = new RangeIndex([outer, first, empty, last])
    expect(index.overlapping([4, 7])).toEqual([outer])
    expect(index.overlapping([4, 4])).toEqual([outer])
    expect(index.overlapping([3, 8])).toEqual([outer, first, empty, last])
    expect(index.overlapping([12, 13])).toEqual([])
    expect(index.hasContaining([8, 11])).toBe(true)
    expect(index.hasContaining([0, 2])).toBe(false)
    expect(index.hasContaining([10, 13])).toBe(false)
  })

  it("keeps equal starts in source order even when their ends differ", () => {
    const longer = { range: [2, 9] as TreeRange }
    const index = new RangeIndex([first, longer, empty])
    expect(index.in([2, 4])).toEqual([first, empty])
    expect(index.firstFrom(2)).toBe(first)
    expect(index.hasContaining([6, 8])).toBe(true)
  })

  it("preserves broken source order and indexes containment independently", () => {
    const index = new RangeIndex([last, empty, first, outer])
    expect(index.in([2, 9])).toEqual([last, empty, first])
    expect(index.overlapping([3, 8])).toEqual([last, empty, first, outer])
    expect([...index.from(3)]).toEqual([last, empty])
    expect(index.hasContaining([8, 11])).toBe(true)
    expect(index.hasContaining([0, 2])).toBe(false)
  })

  it("requires one whole holder, even where adjacent children cover a range", () => {
    const index = new RangeIndex([first, { range: [4, 7] as TreeRange }, last])
    expect(index.hasContaining([3, 8])).toBe(false)
    expect(index.hasContaining([4, 4])).toBe(true)
    expect(new RangeIndex([]).hasContaining([0, 0])).toBe(false)
    expect(new RangeIndex([]).in([0, 0])).toEqual([])
  })
})
