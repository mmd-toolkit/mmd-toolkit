import { describe, expect, it } from "vitest"
import type { JisonLexer } from "../src/divergence-removals.ts"
import type { LexerRewrite, NamedRewrites } from "../src/divergence-removals.ts"
import {
  findRewrites,
  overlapOf,
  withRewrites,
} from "../src/divergence-removals.ts"

/**
 * A lexer with the given rules and start states, and a `setInput` that does
 * nothing.
 */
function fakeLexer(
  rules: RegExp[],
  conditions: JisonLexer["conditions"] = {},
): JisonLexer {
  return { rules, conditions, setInput: () => undefined }
}

/**
 * `rewrite` as the only rewrite of a call, under a name it does not need.
 */
function named(rewrite: LexerRewrite): NamedRewrites {
  return [["comment-takes-character", rewrite]]
}

/**
 * Tries a rule as jison's lexer does, with `text.match(rule)`, which calls the
 * rule's `Symbol.match`.
 */
function tryRule(rule: RegExp | undefined, text: string): string | undefined {
  if (rule === undefined) throw new Error("no rule")
  return rule[Symbol.match](text)?.[0]
}

const patternRemoval = {
  diagramType: "example",
  sampleText: "",
  changes: [{ kind: "pattern", original: "^b", source: "^c" } as const],
}

const lineRemoval = {
  diagramType: "example",
  sampleText: "",
  changes: [
    {
      kind: "by-line-position",
      original: "^%%[^\\n]*\\n?",
      lineStart: "^%%[^\\n]*\\n?",
      midLine: "^%%[^\\n]*",
    } as const,
  ],
}

const tryFirstRemoval = {
  diagramType: "example",
  sampleText: "",
  changes: [
    { kind: "try-first", state: "quoted", sources: ["^q", "^t"] } as const,
  ],
}

describe("findRewrites", () => {
  it("finds a rule by its source and keeps its flags", () => {
    const lexer = fakeLexer([/^a/u, /^b/u])
    const rewrite = findRewrites(lexer, patternRemoval)
    if (typeof rewrite === "string") throw new Error(rewrite)
    expect(rewrite.swaps).toHaveLength(1)
    expect(rewrite.swaps[0]?.key).toBe(1)
    const replacement = rewrite.swaps[0]?.replacement as RegExp
    expect([replacement.source, replacement.flags]).toEqual(["^c", "u"])
  })

  it("reports a rule that is missing or found twice", () => {
    expect(findRewrites(fakeLexer([/^a/u]), patternRemoval)).toBe(
      "the example lexer has 0 rules ^b, not one",
    )
    expect(findRewrites(fakeLexer([/^b/u, /^b/u]), patternRemoval)).toBe(
      "the example lexer has 2 rules ^b, not one",
    )
  })
})

describe("try-first", () => {
  it("moves the rules that only the state tries to the front, in order", async () => {
    // 1 is `^q` of every state; 2 is `^q` of the state `quoted` alone.
    const lexer = fakeLexer([/^a/u, /^q/u, /^q/u, /^t/u], {
      INITIAL: { rules: [0, 1] },
      quoted: { rules: [0, 1, 2, 3] },
    })
    const quoted = lexer.conditions.quoted
    const rewrite = findRewrites(lexer, tryFirstRemoval)
    if (typeof rewrite === "string") throw new Error(rewrite)
    const { result } = await withRewrites(named(rewrite), () =>
      Promise.resolve(lexer.conditions.quoted?.rules),
    )
    expect(result).toEqual([2, 3, 0, 1])
    expect(lexer.rules.map((rule) => rule.source)).toEqual([
      "^a",
      "^q",
      "^q",
      "^t",
    ])
    expect(lexer.conditions.quoted).toBe(quoted)
    expect(quoted?.rules).toEqual([0, 1, 2, 3])
  })

  it("reports a rule that only the state tries but is missing or twice there", () => {
    expect(
      findRewrites(
        fakeLexer([/^q/u, /^t/u], {
          INITIAL: { rules: [0] },
          quoted: { rules: [0, 1] },
        }),
        tryFirstRemoval,
      ),
    ).toBe(
      "the example lexer has 0 rules ^q that only the start state quoted tries, not one",
    )
    expect(
      findRewrites(
        fakeLexer([/^q/u, /^q/u, /^t/u], { quoted: { rules: [0, 1, 2] } }),
        tryFirstRemoval,
      ),
    ).toBe(
      "the example lexer has 2 rules ^q that only the start state quoted tries, not one",
    )
    expect(findRewrites(fakeLexer([/^q/u]), tryFirstRemoval)).toBe(
      "the example lexer has no start state quoted",
    )
  })
})

describe("withRewrites", () => {
  it("replaces the rules only during the call, also when it fails", async () => {
    const lexer = fakeLexer([/^a/u, /^b/u])
    const rewrite = findRewrites(lexer, patternRemoval)
    if (typeof rewrite === "string") throw new Error(rewrite)
    const { result } = await withRewrites(named(rewrite), () =>
      Promise.resolve(lexer.rules[1]?.source),
    )
    expect(result).toBe("^c")
    expect(lexer.rules[1]?.source).toBe("^b")
    await expect(
      withRewrites(named(rewrite), () => Promise.reject(new Error("x"))),
    ).rejects.toThrow("x")
    expect(lexer.rules[1]?.source).toBe("^b")
  })

  it("matches by the position in the line of the text given to the lexer", async () => {
    const lexer = fakeLexer([/^%%[^\n]*\n?/u])
    const originalSetInput = lexer.setInput
    const rewrite = findRewrites(lexer, lineRemoval)
    if (typeof rewrite === "string") throw new Error(rewrite)
    const { result, problem } = await withRewrites(named(rewrite), () => {
      const text = "A %% c\n  %% d\nB"
      lexer.setInput(text)
      return Promise.resolve([
        tryRule(lexer.rules[0], text.slice(2)),
        tryRule(lexer.rules[0], text.slice(9)),
      ])
    })
    expect(result).toEqual(["%% c", "%% d\n"])
    expect(problem).toBeUndefined()
    expect(lexer.setInput).toBe(originalSetInput)
  })

  it("reports text it cannot place in what the lexer was given", async () => {
    const lexer = fakeLexer([/^%%[^\n]*\n?/u])
    const rewrite = findRewrites(lexer, lineRemoval)
    if (typeof rewrite === "string") throw new Error(rewrite)
    const { result, problem } = await withRewrites(named(rewrite), () => {
      lexer.setInput("A %% c\n")
      return Promise.resolve(tryRule(lexer.rules[0], "%% other\n"))
    })
    expect(result).toBeUndefined()
    expect(problem).toMatch(/put back text/u)
  })
})

describe("several rewrites", () => {
  const otherRemoval = {
    diagramType: "example",
    sampleText: "",
    changes: [{ kind: "pattern", original: "^a", source: "^d" } as const],
  }

  it("makes all of them during the call and undoes them afterwards", async () => {
    const lexer = fakeLexer([/^a/u, /^b/u])
    const first = findRewrites(lexer, patternRemoval)
    const second = findRewrites(lexer, otherRemoval)
    if (typeof first === "string") throw new Error(first)
    if (typeof second === "string") throw new Error(second)
    const rewrites: NamedRewrites = [
      ["comment-takes-character", first],
      ["comment-takes-line-break", second],
    ]
    expect(overlapOf(rewrites)).toBeUndefined()
    const { result } = await withRewrites(rewrites, () =>
      Promise.resolve(lexer.rules.map((rule) => rule.source)),
    )
    expect(result).toEqual(["^d", "^c"])
    expect(lexer.rules.map((rule) => rule.source)).toEqual(["^a", "^b"])
  })

  it("reports two rewrites that change the same part of a lexer", () => {
    const lexer = fakeLexer([/^a/u, /^b/u])
    const first = findRewrites(lexer, patternRemoval)
    const second = findRewrites(lexer, patternRemoval)
    if (typeof first === "string") throw new Error(first)
    if (typeof second === "string") throw new Error(second)
    expect(
      overlapOf([
        ["comment-takes-character", first],
        ["name-start-reads-unit", second],
      ]),
    ).toBe(
      "comment-takes-character and name-start-reads-unit change the same part of the lexer (1), so they cannot be removed together",
    )
  })
})
