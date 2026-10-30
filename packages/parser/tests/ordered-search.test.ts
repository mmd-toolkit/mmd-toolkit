import { describe, expect, it } from "vitest"
import { firstIndexWhere } from "../src/ordered-search.ts"

describe("firstIndexWhere", () => {
  const starts = [0, 3, 3, 7]

  it("finds where the condition starts to hold", () => {
    expect(firstIndexWhere(starts, (start) => start >= 3)).toBe(1)
    expect(firstIndexWhere(starts, (start) => start > 3)).toBe(3)
    expect(firstIndexWhere(starts, (start) => start >= 0)).toBe(0)
  })

  it("gives the number of the items when the condition holds for none", () => {
    expect(firstIndexWhere(starts, (start) => start > 7)).toBe(4)
    expect(firstIndexWhere([], () => true)).toBe(0)
  })
})
