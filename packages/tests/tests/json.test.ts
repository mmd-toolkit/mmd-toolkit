import { describe, expect, it } from "vitest"
import { omit, toJson, toJsonObject } from "../src/normalizers/json.ts"

describe("toJson", () => {
  it("turns maps into arrays of values, keeping insertion order", () => {
    // As object keys, "2" and "10" would be reordered before "b".
    const map = new Map([
      ["b", { id: "b" }],
      ["10", { id: "10" }],
      ["2", { id: "2" }],
    ])
    expect(toJson(map)).toEqual([{ id: "b" }, { id: "10" }, { id: "2" }])
  })

  it("drops undefined properties and functions", () => {
    expect(toJson({ a: 1, b: undefined, c: () => 1, d: [undefined] })).toEqual({
      a: 1,
      d: [null],
    })
  })

  it("rejects values JSON cannot represent", () => {
    expect(() => toJson({ n: Number.NaN })).toThrow(/non-finite/u)
    expect(() => toJson({ d: new Date(0) })).toThrow(/instance of Date/u)
  })
})

describe("omit", () => {
  it("removes the given keys", () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ["b"])).toEqual({ a: 1, c: 3 })
  })
})

describe("properties named __proto__", () => {
  /** An object with an own property `__proto__`, as JSON.parse makes it. */
  function parsed(): unknown {
    return JSON.parse('{"__proto__":{"key":"val"},"safe":1}') as unknown
  }

  it("toJson keeps them as own properties", () => {
    const converted = toJson(parsed()) as Record<string, unknown>
    expect(Object.keys(converted)).toEqual(["__proto__", "safe"])
    expect(Object.getPrototypeOf(converted)).toBe(Object.prototype)
    expect(
      Object.getOwnPropertyDescriptor(converted, "__proto__")?.value,
    ).toEqual({
      key: "val",
    })
  })

  it("omit keeps them as own properties, and can leave them out", () => {
    const object = toJsonObject(parsed())
    const kept = omit(object, []) as Record<string, unknown>
    expect(Object.keys(kept)).toEqual(["__proto__", "safe"])
    expect(Object.getPrototypeOf(kept)).toBe(Object.prototype)
    expect(Object.keys(omit(object, ["__proto__"]))).toEqual(["safe"])
  })
})
