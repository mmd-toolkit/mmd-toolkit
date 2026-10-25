import { describe, expect, it } from "vitest"
import { configDifference, recordEmbedded } from "../src/recorded-embedded.ts"

describe("configDifference", () => {
  it("keeps the values that differ from the baseline, with their paths", () => {
    const baseline = {
      theme: "default",
      flowchart: { inheritDir: false, curve: "basis" },
    }
    const config = {
      theme: "default",
      flowchart: { inheritDir: true, curve: "basis" },
    }
    expect(configDifference(config, baseline)).toEqual({
      flowchart: { inheritDir: true },
    })
  })

  it("takes an array, or a value of another kind, as one value", () => {
    expect(
      configDifference({ a: [1, 2], b: { c: 1 } }, { a: [1], b: 2 }),
    ).toEqual({
      a: [1, 2],
      b: { c: 1 },
    })
  })

  it("gives undefined when nothing differs, and leaves out a key only the baseline has", () => {
    expect(configDifference({ a: 1 }, { a: 1, b: 2 })).toBeUndefined()
  })
})

describe("recordEmbedded", () => {
  const baseline = { wrap: false }

  it("records nothing for an input with no embedded values", () => {
    expect(
      recordEmbedded(
        { config: { wrap: false }, title: undefined, dataBlockEffects: [] },
        baseline,
      ),
    ).toBeUndefined()
  })

  it("records the title, the effects of the data blocks, and the changed configuration", () => {
    expect(
      recordEmbedded(
        {
          config: { wrap: true },
          title: "t",
          dataBlockEffects: [{ id: "A", set: { icon: "x" } }],
        },
        baseline,
      ),
    ).toEqual({
      config: { wrap: true },
      title: "t",
      dataBlockEffects: [{ id: "A", set: { icon: "x" } }],
    })
  })

  it("tags non-finite configuration numbers without changing strings or Db effects", () => {
    expect(
      recordEmbedded(
        {
          config: { packet: { bitsPerRow: Infinity }, literal: "Infinity" },
          title: undefined,
          dataBlockEffects: [{ id: "A", set: { end: "Infinity" } }],
        },
        { packet: { bitsPerRow: 32 } },
      ),
    ).toEqual({
      config: {
        packet: { bitsPerRow: { nonFinite: "Infinity" } },
        literal: "Infinity",
      },
      dataBlockEffects: [{ id: "A", set: { end: "Infinity" } }],
    })
  })

  it("records an empty title, which the frontmatter may give", () => {
    expect(
      recordEmbedded(
        { config: { wrap: false }, title: "", dataBlockEffects: [] },
        baseline,
      ),
    ).toEqual({ title: "" })
  })
})
