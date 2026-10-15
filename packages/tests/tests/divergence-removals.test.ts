import mermaid from "mermaid"
import { beforeAll, describe, expect, it } from "vitest"
import type { JisonLexer } from "../src/divergence-removals.ts"
import type { NamedRewrites, Rewrite } from "../src/divergence-removals.ts"
import {
  allRemovals,
  findDetectorRewrite,
  findRewrites,
  isDetectorRemoval,
  overlapOf,
  withRewrites,
} from "../src/divergence-removals.ts"

/**
 * A lexer with the given rules and start states, a `setInput` that does
 * nothing, and the stack of start states `stack`, of which the last is the one
 * the lexer is in.
 */
function fakeLexer(
  rules: RegExp[],
  conditions: JisonLexer["conditions"] = {},
  stack: string[] = ["INITIAL"],
  options: JisonLexer["options"] = {},
): JisonLexer {
  return {
    rules,
    conditions,
    options,
    setInput: () => undefined,
    topState: () => stack.at(-1) ?? "INITIAL",
    popState: () => stack.pop() ?? "INITIAL",
  }
}

/**
 * `rewrite` as the only rewrite of a call, under a name it does not need.
 */
function named(rewrite: Rewrite): NamedRewrites {
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
  it("finds a rule by its source and keeps its flags", async () => {
    const lexer = fakeLexer([/^a/u, /^b/u])
    const rewrite = findRewrites(lexer, patternRemoval)
    if (typeof rewrite === "string") throw new Error(rewrite)
    expect(rewrite.swaps.map((swap) => swap.slot)).toEqual([
      "lexer:example:rules[1]",
    ])
    const { result } = await withRewrites(named(rewrite), () =>
      Promise.resolve(lexer.rules[1]),
    )
    expect([result?.source, result?.flags]).toEqual(["^c", "u"])
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

const leaveStateRemoval = {
  diagramType: "example",
  sampleText: "",
  changes: [
    { kind: "leave-state", state: "axis", sources: ["^;", "^k"] } as const,
  ],
}

describe("leave-state", () => {
  const conditions = {
    INITIAL: { rules: [0, 1, 2] },
    axis: { rules: [0, 1, 2] },
  }

  it("pops the state when a rule matches while the lexer is in it", async () => {
    const stack = ["INITIAL", "axis", "axis"]
    const lexer = fakeLexer([/^a/u, /^;/u, /^k/u], conditions, stack)
    const rewrite = findRewrites(lexer, leaveStateRemoval)
    if (typeof rewrite === "string") throw new Error(rewrite)
    const { result } = await withRewrites(named(rewrite), () => {
      lexer.setInput("a;k")
      return Promise.resolve([
        tryRule(lexer.rules[0], "a"),
        stack.join(),
        tryRule(lexer.rules[1], ";"),
        stack.join(),
        tryRule(lexer.rules[2], "k"),
        stack.join(),
      ])
    })
    expect(result).toEqual([
      "a",
      "INITIAL,axis,axis",
      ";",
      "INITIAL,axis",
      "k",
      "INITIAL",
    ])
  })

  it("leaves a lexer that is in another state, and a rule that does not match, as they are", async () => {
    const stack = ["INITIAL", "axis", "data"]
    const lexer = fakeLexer([/^a/u, /^;/u, /^k/u], conditions, stack)
    const rewrite = findRewrites(lexer, leaveStateRemoval)
    if (typeof rewrite === "string") throw new Error(rewrite)
    const { result } = await withRewrites(named(rewrite), () => {
      lexer.setInput(";")
      return Promise.resolve([tryRule(lexer.rules[1], ";"), stack.join()])
    })
    expect(result).toEqual([";", "INITIAL,axis,data"])
    stack.splice(2, 1)
    await withRewrites(named(rewrite), () => {
      lexer.setInput("x")
      return Promise.resolve(tryRule(lexer.rules[1], "x"))
    })
    expect(stack).toEqual(["INITIAL", "axis"])
  })

  it("pops the state of the lexer that was given the text, not of the lexer the rules belong to", async () => {
    // mermaid.js reads with an object made from its lexer for each parse.
    const prototype = fakeLexer([/^a/u, /^;/u, /^k/u], conditions, ["INITIAL"])
    const stack = ["INITIAL", "axis"]
    const reader = {
      ...fakeLexer([], {}, stack),
      setInput: prototype.setInput,
    }
    const rewrite = findRewrites(prototype, leaveStateRemoval)
    if (typeof rewrite === "string") throw new Error(rewrite)
    await withRewrites(named(rewrite), () => {
      prototype.setInput.call(reader, ";")
      tryRule(prototype.rules[1], ";")
      return Promise.resolve()
    })
    expect(stack).toEqual(["INITIAL"])
  })

  it("refuses a lexer that takes the longest match or may reject a match", () => {
    for (const options of [{ flex: true }, { backtrack_lexer: true }]) {
      const lexer = fakeLexer(
        [/^a/u, /^;/u, /^k/u],
        conditions,
        ["INITIAL", "axis"],
        options,
      )
      expect(findRewrites(lexer, leaveStateRemoval)).toBe(
        "the example lexer does not take the first rule that matches, so leaving a start state at a match is not sound",
      )
    }
  })

  it("reports a rule that matches before the lexer was given a text", async () => {
    const lexer = fakeLexer([/^a/u, /^;/u, /^k/u], conditions, [
      "INITIAL",
      "axis",
    ])
    const rewrite = findRewrites(lexer, leaveStateRemoval)
    if (typeof rewrite === "string") throw new Error(rewrite)
    const { problem } = await withRewrites(named(rewrite), () => {
      tryRule(lexer.rules[1], ";")
      return Promise.resolve()
    })
    expect(problem).toMatch(/not given its text/u)
  })

  it("puts the rules back after the call", async () => {
    const lexer = fakeLexer([/^a/u, /^;/u, /^k/u], conditions)
    const rules = [...lexer.rules]
    const rewrite = findRewrites(lexer, leaveStateRemoval)
    if (typeof rewrite === "string") throw new Error(rewrite)
    await withRewrites(named(rewrite), () => Promise.resolve())
    expect(lexer.rules).toEqual(rules)
    expect(lexer.rules[1]).toBe(rules[1])
  })

  it("reports a missing state, and a rule that is missing, twice, or not tried by the state", () => {
    expect(findRewrites(fakeLexer([/^;/u, /^k/u]), leaveStateRemoval)).toBe(
      "the example lexer has no start state axis",
    )
    expect(
      findRewrites(
        fakeLexer([/^;/u], { axis: { rules: [0] } }),
        leaveStateRemoval,
      ),
    ).toBe("the example lexer has 0 rules ^k, not one")
    expect(
      findRewrites(
        fakeLexer([/^;/u, /^;/u, /^k/u], { axis: { rules: [0, 1, 2] } }),
        leaveStateRemoval,
      ),
    ).toBe("the example lexer has 2 rules ^;, not one")
    expect(
      findRewrites(
        fakeLexer([/^;/u, /^k/u], { axis: { rules: [0] } }),
        leaveStateRemoval,
      ),
    ).toBe("the start state axis of the example lexer does not try the rule ^k")
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
      "comment-takes-character and name-start-reads-unit change the same part of mermaid.js (lexer:example:rules[1]), so they cannot be removed together",
    )
  })

  it("reports two rewrites that change the rule order of the same start state", () => {
    const lexer = fakeLexer([/^a/u, /^q/u, /^t/u], {
      INITIAL: { rules: [0] },
      quoted: { rules: [0, 1, 2] },
    })
    const first = findRewrites(lexer, tryFirstRemoval)
    const second = findRewrites(lexer, {
      ...tryFirstRemoval,
      changes: [
        { kind: "try-first", state: "quoted", sources: ["^t"] } as const,
      ],
    })
    if (typeof first === "string") throw new Error(first)
    if (typeof second === "string") throw new Error(second)
    expect(
      overlapOf([
        ["comment-takes-line-break", first],
        ["name-start-reads-unit", second],
      ]),
    ).toBe(
      "comment-takes-line-break and name-start-reads-unit change the same part of mermaid.js (lexer:example:conditions.quoted.rules), so they cannot be removed together",
    )
  })

  it("reports two rewrites that both give the lexer its text through setInput", () => {
    // The two removals read different rules, so only `setInput` is shared.
    const lexer = fakeLexer([/^%%[^\n]*\n?/u, /^#[^\n]*\n?/u])
    const first = findRewrites(lexer, lineRemoval)
    const second = findRewrites(lexer, {
      ...lineRemoval,
      changes: [
        {
          kind: "by-line-position",
          original: "^#[^\\n]*\\n?",
          lineStart: "^#[^\\n]*\\n?",
          midLine: "^#[^\\n]*",
        } as const,
      ],
    })
    if (typeof first === "string") throw new Error(first)
    if (typeof second === "string") throw new Error(second)
    expect(first.swaps.map((swap) => swap.slot)).toEqual([
      "lexer:example:rules[0]",
      "lexer:example:setInput",
    ])
    expect(second.swaps.map((swap) => swap.slot)).toEqual([
      "lexer:example:rules[1]",
      "lexer:example:setInput",
    ])
    expect(
      overlapOf([
        ["comment-takes-line-break", first],
        ["name-start-reads-unit", second],
      ]),
    ).toBe(
      "comment-takes-line-break and name-start-reads-unit change the same part of mermaid.js (lexer:example:setInput), so they cannot be removed together",
    )
  })
})

describe("lexers of different diagram types", () => {
  it("do not overlap where a rule of the same index is replaced in each", () => {
    const first = findRewrites(fakeLexer([/^a/u, /^b/u]), patternRemoval)
    const second = findRewrites(fakeLexer([/^a/u, /^b/u]), {
      ...patternRemoval,
      diagramType: "other",
    })
    if (typeof first === "string") throw new Error(first)
    if (typeof second === "string") throw new Error(second)
    expect(
      overlapOf([
        ["comment-takes-character", first],
        ["name-start-reads-unit", second],
      ]),
    ).toBeUndefined()
  })
})

describe("withRewrites: a swap that fails", () => {
  /** A rewrite of one swap that records its calls in `log`. */
  function loggedRewrite(
    slot: string,
    log: string[],
    failsToApply = false,
  ): Rewrite {
    return {
      swaps: [
        {
          slot,
          apply: () => {
            if (failsToApply) throw new Error(`${slot} cannot be made`)
            log.push(`apply ${slot}`)
          },
          undo: () => {
            log.push(`undo ${slot}`)
          },
        },
      ],
      call: undefined,
    }
  }

  it("undoes the swaps made before it, and not the swap that failed, last made first", async () => {
    const log: string[] = []
    await expect(
      withRewrites(
        [
          ["comment-takes-character", loggedRewrite("one", log)],
          ["comment-takes-line-break", loggedRewrite("two", log)],
          ["name-start-reads-unit", loggedRewrite("three", log, true)],
        ],
        () => Promise.resolve(log.push("call")),
      ),
    ).rejects.toThrow("three cannot be made")
    expect(log).toEqual(["apply one", "apply two", "undo two", "undo one"])
  })

  it("makes the swaps in order, calls, and undoes them last made first", async () => {
    const log: string[] = []
    await withRewrites(
      [
        ["comment-takes-character", loggedRewrite("one", log)],
        ["comment-takes-line-break", loggedRewrite("two", log)],
      ],
      () => Promise.resolve(log.push("call")),
    )
    expect(log).toEqual([
      "apply one",
      "apply two",
      "call",
      "undo two",
      "undo one",
    ])
  })
})

describe("the removal of c4-keyword-anywhere", () => {
  const removal = allRemovals().find(
    ([name]) => name === "c4-keyword-anywhere",
  )?.[1]
  if (removal === undefined || !isDetectorRemoval(removal)) {
    throw new Error("c4-keyword-anywhere is no removal of a detector")
  }
  const rewrite = findDetectorRewrite(removal)

  /** The id the detectors of mermaid.js give `text`, or `undefined`. */
  function idOf(text: string): string | undefined {
    try {
      return mermaid.detectType(text, {})
    } catch {
      return undefined
    }
  }

  beforeAll(async () => {
    // Registers the detectors of mermaid.js, as its first use does.
    await mermaid.registerExternalDiagrams([])
  })

  it("is the only removal of a detector", () => {
    expect(
      allRemovals()
        .filter(([, other]) => isDetectorRemoval(other))
        .map(([name]) => name),
    ).toEqual(["c4-keyword-anywhere"])
  })

  it("has one swap, for the detector of c4", () => {
    expect(rewrite.swaps.map((swap) => swap.slot)).toEqual(["detector:c4"])
    expect(rewrite.call).toBeUndefined()
  })

  it("replaces the detector only during the call, also when it fails", async () => {
    const text = "flowchart LR\nA[C4Container]"
    expect(idOf(text)).toBe("c4")
    const { result } = await withRewrites(
      [["c4-keyword-anywhere", rewrite]],
      () => Promise.resolve(idOf(text)),
    )
    expect(result).toBe("flowchart-v2")
    expect(idOf(text)).toBe("c4")
    await expect(
      withRewrites([["c4-keyword-anywhere", rewrite]], () =>
        Promise.reject(new Error("x")),
      ),
    ).rejects.toThrow("x")
    expect(idOf(text)).toBe("c4")
  })

  it("claims a text that starts with one of the five keywords, after whitespace, and no other", async () => {
    /** The id the detectors give `text` while the detector is replaced. */
    async function claimed(text: string): Promise<string | undefined> {
      const { result } = await withRewrites(
        [["c4-keyword-anywhere", rewrite]],
        () => Promise.resolve(idOf(text)),
      )
      return result
    }

    for (const keyword of [
      "C4Context",
      "C4Container",
      "C4Component",
      "C4Dynamic",
      "C4Deployment",
    ]) {
      expect(await claimed(keyword), keyword).toBe("c4")
      expect(await claimed(`  \n ${keyword}`), keyword).toBe("c4")
      expect(await claimed(`x ${keyword}`), keyword).toBeUndefined()
    }
  })

  it("reports two removals that change the same detector", () => {
    expect(
      overlapOf([
        ["c4-keyword-anywhere", rewrite],
        ["comment-takes-character", findDetectorRewrite(removal)],
      ]),
    ).toBe(
      "c4-keyword-anywhere and comment-takes-character change the same part of mermaid.js (detector:c4), so they cannot be removed together",
    )
  })
})
