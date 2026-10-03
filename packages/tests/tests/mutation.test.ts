import { describe, expect, it } from "vitest"
import {
  compareAll,
  compareWithMermaid,
  generatedInputs,
  mutate,
  runMutationDiff,
} from "../src/mutation.ts"

const input = "flowchart LR\n  A --> B\n  B -->|label| C\n"

describe("mutate", () => {
  it("is deterministic for an input and a seed", () => {
    expect(mutate(input, { seed: 7 })).toEqual(mutate(input, { seed: 7 }))
    expect(mutate(input, { seed: 7 })).not.toEqual(mutate(input, { seed: 8 }))
  })

  it("returns distinct mutants that differ from the input", () => {
    const mutants = mutate(input, { count: 50 })
    // An operator with few places (swapping two lines of three) has few
    // distinct mutants, and no other operator takes its place, so there can
    // be fewer than `count`: at least the first round.
    expect(mutants.length).toBeGreaterThanOrEqual(9)
    expect(mutants.length).toBeLessThanOrEqual(50)
    const texts = mutants.map((mutant) => mutant.text)
    expect(new Set(texts).size).toBe(texts.length)
    expect(texts).not.toContain(input)
  })

  it("uses character, token and line edits", () => {
    const kinds = new Set(
      mutate(input, { count: 100 }).map(
        (mutant) => mutant.description.split(" ")[0],
      ),
    )
    expect([...kinds].sort()).toEqual([
      "delete-char",
      "delete-line",
      "delete-token",
      "duplicate-line",
      "duplicate-token",
      "insert-char",
      "replace-char",
      "swap-lines",
      "swap-tokens",
    ])
  })

  it("uses a different operator for each of the first mutants, and each operator that applies once per round", () => {
    /** The operator of each mutant: the first word of its description. */
    function operatorsOf(count?: number): string[] {
      return mutate(input, count === undefined ? {} : { count }).map(
        (mutant) => mutant.description.split(" ")[0] ?? "",
      )
    }

    // All nine operators apply to the sample: it has several lines and tokens.
    const round = operatorsOf(9)
    expect(round).toHaveLength(9)
    expect(new Set(round).size).toBe(9)
    // Without `count`, one round.
    expect(operatorsOf()).toEqual(round)
    // Two rounds use each operator twice.
    const rounds = operatorsOf(18)
    expect(rounds).toHaveLength(18)
    for (const operator of new Set(rounds)) {
      expect(rounds.filter((used) => used === operator)).toHaveLength(2)
    }
    // Fewer mutants than operators are all of different operators.
    const first = operatorsOf(4)
    expect(new Set(first).size).toBe(4)
  })

  it("uses every operator that applies whatever the seed", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const used = new Set(
        mutate(input, { count: 9, seed }).map(
          (mutant) => mutant.description.split(" ")[0],
        ),
      )
      expect(used.size).toBe(9)
    }
  })

  it("does not use an operator that does not apply", () => {
    // One line of one token: nothing to swap.
    const operators = mutate("x", { count: 9 }).map(
      (mutant) => mutant.description.split(" ")[0],
    )
    expect(operators.length).toBeGreaterThan(0)
    expect(operators).not.toContain("swap-lines")
    expect(operators).not.toContain("swap-tokens")
    // Without `count`, one mutant for each operator that applies, all different.
    const round = mutate("x").map((mutant) => mutant.description.split(" ")[0])
    expect(new Set(round).size).toBe(round.length)
    expect(round).not.toContain("swap-lines")
  })

  it("chooses the operator uniformly among those that apply when it makes one mutant", () => {
    const counts = new Map<string, number>()
    for (let index = 0; index < 900; index++) {
      const text = `flowchart LR\n  A${index} --> B\n  B -->|label| C\n`
      const [mutant] = mutate(text, { count: 1 })
      const operator = mutant?.description.split(" ")[0] ?? ""
      counts.set(operator, (counts.get(operator) ?? 0) + 1)
    }
    expect(counts.size).toBe(9)
    for (const [operator, used] of counts) {
      expect(used, operator).toBeGreaterThan(60)
      expect(used, operator).toBeLessThan(140)
    }
  })

  it("handles empty input", () => {
    expect(mutate("", { count: 5 }).map((mutant) => mutant.text)).toEqual(
      expect.arrayContaining([expect.any(String)]),
    )
  })
})

describe("compareWithMermaid", () => {
  it("reports acceptance, diagram type and Db mismatches", async () => {
    const text = "flowchart LR\n  A --> B\n"
    expect(
      await compareWithMermaid(text, () => ({ accepted: false })),
    ).toMatchObject({
      kind: "acceptance",
    })
    expect(
      await compareWithMermaid(text, () => ({
        accepted: true,
        diagramType: "pie",
      })),
    ).toMatchObject({ kind: "diagramType" })
    expect(
      await compareWithMermaid(text, () => ({ accepted: true, db: {} })),
    ).toMatchObject({ kind: "db" })
    expect(
      await compareWithMermaid(text, () => ({ accepted: true })),
    ).toBeUndefined()
  })
})

describe("runMutationDiff", () => {
  it("finds mutants a naive candidate gets wrong", async () => {
    const report = await runMutationDiff(
      [{ name: "sample", text: "flowchart LR\n  A --> B\n" }],
      (text) => ({ accepted: /^flowchart\b/u.test(text) }),
      { count: 10 },
    )
    expect(report.compared).toBe(10)
    expect(report.mismatches.length).toBeGreaterThan(0)
    expect(report.mismatches[0]).toMatchObject({
      from: "sample",
      kind: "acceptance",
    })
  })
})

describe("generated inputs", () => {
  it("names generator output by seed and index, and compares it unchanged", async () => {
    /** Returns `count` single-node flowcharts named after the seed. */
    function generator(seed: number, count: number): string[] {
      return Array.from(
        { length: count },
        (_, i) => `flowchart LR\n  N${seed}_${i}\n`,
      )
    }

    const inputs = generatedInputs(generator, [1, 2], 2, "sample")
    expect(inputs.map((item) => item.name)).toEqual([
      "sample-s1-0000",
      "sample-s1-0001",
      "sample-s2-0000",
      "sample-s2-0001",
    ])
    const report = await compareAll(inputs, () => ({ accepted: true }))
    expect(report).toMatchObject({ compared: 4, mismatches: [], skipped: [] })
  })

  it("can compare the inputs along with their mutants", async () => {
    const report = await runMutationDiff(
      [{ name: "sample", text: "flowchart LR\n  A --> B\n" }],
      () => ({ accepted: false }),
      { count: 3, includeInputs: true },
    )
    expect(report.compared).toBe(4)
    expect(report.mismatches[0]).toMatchObject({ description: "input" })
  })
})

describe("line breaks", () => {
  it("treats CRLF and lone CR as line ends and inserts CR, NBSP and BOM", () => {
    const text = "flowchart LR\r\n  A --> B\r  B --> C\n"
    // Each round uses the character edit once, so many rounds reach every character.
    const mutants = mutate(text, { count: 3000 })
    const swapped = mutants.find((m) => m.description === "swap-lines 1 and 2")
    expect(swapped?.text).toBe("  A --> B\r\nflowchart LR\r  B --> C\n")
    const deleted = mutants.find((m) => m.description === "delete-line 2")
    expect(deleted?.text).toBe("flowchart LR\r\n  B --> C\n")
    const inserted = new Set(
      mutants
        .filter((m) => m.description.startsWith("insert-char"))
        .map((m) => m.description.split(" ")[1]),
    )
    for (const char of ["\r", "\u00a0", "\ufeff"]) {
      expect(inserted).toContain(JSON.stringify(char))
    }
  })
})

describe("required parts", () => {
  const text = "flowchart LR\n  A --> B\n"

  it("reports a candidate that leaves out a required part", async () => {
    expect(
      await compareWithMermaid(text, () => ({ accepted: true }), undefined, {
        require: ["db"],
      }),
    ).toMatchObject({ kind: "missing-db" })
    expect(
      await compareWithMermaid(text, () => ({ accepted: true }), undefined, {
        require: ["diagramType"],
      }),
    ).toMatchObject({ kind: "missing-diagramType" })
  })

  it("does not require a Db where mermaid has no normalizer", async () => {
    expect(
      await compareWithMermaid(
        'pie\n  "a": 1\n',
        () => ({ accepted: true }),
        undefined,
        { require: ["db"] },
      ),
    ).toBeUndefined()
  })

  it("counts the parts actually compared", async () => {
    const withoutDb = await compareAll([{ name: "x", text }], () => ({
      accepted: true,
      diagramType: "flowchart-v2",
    }))
    expect(withoutDb.comparedParts).toEqual({ diagramType: 1, db: 0 })
  })
})

describe("known divergences declared by the candidate", () => {
  const text = "flowchart LR\n  A --> B\n"
  const id = "directive-as-token-boundary"

  it("reports a declared difference as a divergence, not a mismatch", async () => {
    const report = await compareAll([{ name: "x", text }], () => ({
      accepted: false,
      knownDivergence: id,
    }))
    expect(report.mismatches).toEqual([])
    expect(report.divergences).toMatchObject([
      { from: "x", id, kind: "acceptance" },
    ])
  })

  it("only counts a declaration when the results agree", async () => {
    const report = await compareAll([{ name: "x", text }], () => ({
      accepted: true,
      knownDivergence: id,
    }))
    expect(report.mismatches).toEqual([])
    expect(report.divergences).toEqual([])
    expect(report.declaredWithoutDifference).toEqual({ [id]: 1 })
  })

  it("rejects an unknown identifier", async () => {
    expect(
      await compareWithMermaid(text, () => ({
        accepted: false,
        knownDivergence: "typo",
      })),
    ).toMatchObject({ kind: "unknown-divergence" })
  })

  it("still reports a required part left out", async () => {
    expect(
      await compareWithMermaid(
        text,
        () => ({ accepted: true, knownDivergence: id }),
        undefined,
        { require: ["db"] },
      ),
    ).toMatchObject({ kind: "missing-db" })
  })
})

describe("embedded values passed to the candidate", () => {
  it("passes mermaid's embedded values for accepted text and undefined otherwise", async () => {
    const seen: unknown[] = []
    await compareAll(
      [
        {
          name: "accepted",
          text: "---\ntitle: T\n---\nflowchart LR\n  A\n",
          config: { securityLevel: "loose" },
        },
        { name: "rejected", text: "flowchart LR\n  A -->\n" },
      ],
      (_text, _config, embedded) => {
        seen.push(
          embedded && {
            title: embedded.title,
            securityLevel: embedded.config.securityLevel,
          },
        )
        return { accepted: embedded !== undefined }
      },
    )
    expect(seen).toEqual([{ title: "T", securityLevel: "loose" }, undefined])
  })
})
