import { describe, expect, it } from "vitest"
import { findRewrites, withRewrites } from "../src/divergence-removals.ts"

const removal = {
  diagramType: "example",
  sampleText: "",
  rules: [{ original: "^b", replacement: "^c" }],
}

describe("findRewrites", () => {
  it("finds a rule by its source and keeps its flags", () => {
    const rules = [/^a/u, /^b/u]
    const rewrites = findRewrites(rules, removal)
    if (typeof rewrites === "string") throw new Error(rewrites)
    expect(rewrites).toHaveLength(1)
    expect(rewrites[0]?.index).toBe(1)
    expect(rewrites[0]?.replacement.source).toBe("^c")
    expect(rewrites[0]?.replacement.flags).toBe("u")
  })

  it("reports a rule that is missing or found twice", () => {
    expect(findRewrites([/^a/u], removal)).toBe(
      "the example lexer has 0 rules ^b, not one",
    )
    expect(findRewrites([/^b/u, /^b/u], removal)).toBe(
      "the example lexer has 2 rules ^b, not one",
    )
  })
})

describe("withRewrites", () => {
  it("replaces the rules only during the call", async () => {
    const rules = [/^a/u, /^b/u]
    const rewrites = findRewrites(rules, removal)
    if (typeof rewrites === "string") throw new Error(rewrites)
    const during = await withRewrites(rewrites, () =>
      Promise.resolve(rules[1]?.source),
    )
    expect(during).toBe("^c")
    expect(rules[1]?.source).toBe("^b")
  })

  it("puts the rules back when the call fails", async () => {
    const rules = [/^b/u]
    const rewrites = findRewrites(rules, removal)
    if (typeof rewrites === "string") throw new Error(rewrites)
    await expect(
      withRewrites(rewrites, () => Promise.reject(new Error("x"))),
    ).rejects.toThrow("x")
    expect(rules[0]?.source).toBe("^b")
  })
})
