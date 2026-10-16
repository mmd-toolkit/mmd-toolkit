import { describe, expect, it } from "vitest"
import { numberOrText } from "../src/summary-number.ts"

describe("numberOrText", () => {
  it("keeps a finite number and gives the text of any other number", () => {
    expect(numberOrText(2.5)).toBe(2.5)
    expect(numberOrText(Number.NaN)).toBe("NaN")
    expect(numberOrText(Number.POSITIVE_INFINITY)).toBe("Infinity")
    expect(numberOrText(Number.NEGATIVE_INFINITY)).toBe("-Infinity")
  })

  it("gives 0 for -0, which JSON cannot write", () => {
    expect(Object.is(numberOrText(-0), 0)).toBe(true)
  })
})
