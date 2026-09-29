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
    expect(mutants).toHaveLength(50)
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
    const mutants = mutate(text, { count: 400 })
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
