import { describe, expect, it } from "vitest"
import { orderJsonKeys } from "../src/ordered-json.ts"

describe("orderJsonKeys", () => {
  it("orders keys in nested objects while keeping array items in order", () => {
    expect(
      JSON.stringify(
        { b: [{ y: 1, x: 2 }, 3], a: { d: 4, c: 5 } },
        orderJsonKeys,
      ),
    ).toBe('{"a":{"c":5,"d":4},"b":[{"x":2,"y":1},3]}')
  })

  it("puts integer keys first in numeric order and keeps a __proto__ key", () => {
    const value: unknown = JSON.parse(
      '{"b":1,"10":"ten","2":"two","a":2,"__proto__":{"z":3,"a":4}}',
    )
    expect(JSON.stringify(value, orderJsonKeys)).toBe(
      '{"2":"two","10":"ten","__proto__":{"a":4,"z":3},"a":2,"b":1}',
    )
  })
})
