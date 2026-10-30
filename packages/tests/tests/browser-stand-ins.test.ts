import { describe, expect, it } from "vitest"
import * as entry from "../src/index.ts"
import {
  cssSupportsColor,
  withGlobal,
} from "../src/normalizers/browser-stand-ins.ts"

describe("cssSupportsColor", () => {
  it("is exported by the entry, which runs no mermaid.js", () => {
    expect(entry.cssSupportsColor).toBe(cssSupportsColor)
  })

  it("accepts named colors, transparent and color functions in any case", () => {
    for (const value of [
      "green",
      "LightGreen",
      "transparent",
      "rgb(34, 56, 0)",
      "rgb(1 2 3 / 50%)",
      "hsla(10, 40%, 90%, 0.5)",
      "RGB(1,2,3)",
    ]) {
      expect(cssSupportsColor(value), value).toBe(true)
    }
  })

  it("accepts the keywords the color parser does not resolve", () => {
    for (const value of [
      "currentColor",
      "inherit",
      "revert-layer",
      "Canvas",
      "ActiveBorder",
    ]) {
      expect(cssSupportsColor(value), value).toBe(true)
    }
  })

  it("accepts a value that holds a substitution function", () => {
    expect(cssSupportsColor("rgb(1 var(--x) 3)")).toBe(true)
    expect(cssSupportsColor("rgb(env(x))")).toBe(true)
    expect(cssSupportsColor("rgb(attr(x))")).toBe(true)
  })

  it("rejects words that are not colors and malformed functions", () => {
    for (const value of [
      "Group",
      "123",
      "",
      "rgb(1,2)",
      "rgb(1, 2%, 3)",
      "rgb(1,2,3) Title (x)",
    ]) {
      expect(cssSupportsColor(value), value).toBe(false)
    }
  })
})

describe("withGlobal", () => {
  it("sets the global only during the call", () => {
    const name = "mmdStandInProbe"
    const seen = withGlobal(
      name,
      42,
      () => (globalThis as Record<string, unknown>)[name],
    )
    expect(seen).toBe(42)
    expect(Object.hasOwn(globalThis, name)).toBe(false)
  })

  it("restores the global when the call throws", () => {
    const name = "mmdStandInProbe"
    expect(() =>
      withGlobal(name, 1, () => {
        throw new Error("x")
      }),
    ).toThrow("x")
    expect(Object.hasOwn(globalThis, name)).toBe(false)
  })
})
