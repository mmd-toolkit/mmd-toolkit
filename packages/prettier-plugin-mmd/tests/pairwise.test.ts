import { describe, expect, it } from "vitest"
import { pairwise, pairwiseIndexes } from "./pairwise.ts"

describe("pairwise", () => {
  it("puts every pair of values of two axes together in some row", () => {
    const sizes = [5, 3, 4, 2, 6]
    const rows = pairwiseIndexes(sizes)
    for (let first = 0; first < sizes.length; first++) {
      for (let second = first + 1; second < sizes.length; second++) {
        for (let a = 0; a < sizes[first]; a++) {
          for (let b = 0; b < sizes[second]; b++) {
            expect(
              rows.some((row) => row[first] === a && row[second] === b),
            ).toBe(true)
          }
        }
      }
    }
  })

  it("makes far fewer rows than the full product", () => {
    expect(pairwiseIndexes([16, 16, 8, 2, 8, 4, 4, 13]).length).toBeLessThan(
      400,
    )
  })

  it("gives the same rows on every run, with the values of the axes", () => {
    const axes: readonly (readonly (string | number)[])[] = [
      ["a", "b"],
      ["x", "y", "z"],
      [1, 2],
    ]
    expect(pairwise(axes)).toEqual(pairwise(axes))
    expect(pairwise(axes)[0]).toEqual(["a", "x", 1])
  })

  it("makes more rows with more passes, every pair still together", () => {
    const sizes = [4, 4, 3]
    const one = pairwiseIndexes(sizes, 1)
    const three = pairwiseIndexes(sizes, 3)
    expect(three.length).toBeGreaterThan(one.length)
    expect(new Set(three.map((row) => row.join(","))).size).toBe(three.length)
    for (const [first, second] of [
      [0, 1],
      [0, 2],
      [1, 2],
    ]) {
      for (let a = 0; a < sizes[first]; a++) {
        for (let b = 0; b < sizes[second]; b++) {
          expect(
            three.some((row) => row[first] === a && row[second] === b),
          ).toBe(true)
        }
      }
    }
  })

  it("makes one row for one axis value, and none for no axis", () => {
    expect(pairwiseIndexes([1, 1])).toEqual([[0, 0]])
    expect(pairwiseIndexes([])).toEqual([])
    expect(pairwiseIndexes([3])).toEqual([[0], [1], [2]])
  })
})
