import { describe, expect, it } from "vitest"
import { loadFixtures } from "../src/index.ts"
import { runMermaid } from "../src/mermaid.ts"
import { normalizeRadar } from "../src/normalizers/radar.ts"
import type { MermaidConfig } from "../src/types.ts"

const fixtures = await loadFixtures("radar")

/** The fixed radar fixture of this name. */
function named(name: string) {
  const fixture = fixtures.find((item) => item.name === name)
  if (fixture === undefined) throw new Error(`missing radar/${name}`)
  return fixture
}

/** The summary of an accepted corpus input, under its site settings and `config`. */
async function summary(name: string, config: MermaidConfig = {}) {
  const fixture = named(name)
  const result = await runMermaid(fixture.input, {
    config: { ...fixture.config, ...config },
  })
  if (!result.accepted) throw new Error(`expected accepted radar/${name}`)
  return result.db
}

describe("radar normalization", () => {
  it("keeps published labels, reordered entries and final options", async () => {
    expect(await summary("db-all-fields")).toEqual({
      title: "T",
      accTitle: "A",
      accDescr: "D\nE",
      axes: [{ label: "Bee" }, { label: "Ay" }],
      curves: [{ label: "See", entries: [1, 2] }],
      options: {
        showLegend: false,
        ticks: 2.5,
        max: 8,
        min: 1,
        graticule: "polygon",
      },
    })
    expect(await summary("db-options-repeat")).toMatchObject({
      options: { showLegend: false, ticks: 0, max: 0, min: 0 },
    })
    expect(await summary("db-ticks-cap-last")).toMatchObject({
      options: { ticks: 32 },
    })
    expect(await summary("db-ticks-cap-before-final")).toMatchObject({
      options: { ticks: 2 },
    })
  })

  it("keeps duplicate axes and curves, empty labels and undrawn positional data", async () => {
    expect(await summary("db-duplicate-axes")).toMatchObject({
      axes: [{ label: "First" }, { label: "B" }, { label: "Third" }],
      curves: [{ label: "c", entries: [1, 2, 1] }],
    })
    expect(await summary("db-duplicate-curves")).toMatchObject({
      curves: [
        { label: "First", entries: [1] },
        { label: "d", entries: [2] },
        { label: "Third", entries: [3] },
      ],
    })
    expect(await summary("db-empty-labels")).toMatchObject({
      axes: [{ label: "" }, { label: "" }],
      curves: [
        { label: "", entries: [1, 2] },
        { label: "", entries: [2, 1] },
      ],
    })
    expect(await summary("db-positional-no-axis")).toMatchObject({
      axes: [],
      curves: [{ label: "c", entries: [1, 2] }],
    })
  })

  it("omits reference names and drawing configuration without mutating values", () => {
    const entries = Object.freeze([Infinity, -Infinity, Number.NaN, -0])
    const options = Object.freeze({
      showLegend: false,
      ticks: 0,
      max: null,
      min: 0,
      graticule: "circle",
      width: 100,
    })
    expect(
      normalizeRadar({
        getDiagramTitle: () => "",
        getAccTitle: () => "",
        getAccDescription: () => "",
        getAxes: () => [{ name: "unused", label: "A", x: 99 }],
        getCurves: () => [
          { name: "unused", label: "C", entries, color: "red" },
        ],
        getOptions: () => options,
        getConfig: () => {
          throw new Error("must not read drawing configuration")
        },
      }),
    ).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      axes: [{ label: "A" }],
      curves: [
        {
          label: "C",
          entries: ["Infinity", "-Infinity", "NaN", 0],
        },
      ],
      options: {
        showLegend: false,
        ticks: 0,
        max: null,
        min: 0,
        graticule: "circle",
      },
    })
    expect(entries[0]).toBe(Infinity)
    expect(Object.is(entries[3], -0)).toBe(true)
  })

  it("records reachable number overflow as text and preserves underflow", async () => {
    expect(await summary("db-number-overflow")).toMatchObject({
      curves: [{ label: "c", entries: ["Infinity"] }],
    })
    expect(await summary("db-option-overflow")).toMatchObject({
      options: {
        ticks: 32,
        max: "Infinity",
        min: "Infinity",
      },
    })
    expect(await summary("db-number-underflow")).toMatchObject({
      curves: [{ label: "c", entries: [0] }],
    })
  })

  it("resets all publication after a semantic rejection", async () => {
    await summary("db-all-fields")
    const fixture = named("error-reference-missing")
    expect((await runMermaid(fixture.input)).accepted).toBe(false)
    expect(await summary("spec-radar-test-ts-f0c0291e")).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      axes: [],
      curves: [],
      options: {
        showLegend: true,
        ticks: 5,
        max: null,
        min: 0,
        graticule: "circle",
      },
    })
  })

  it("keeps markup under every supported security level", async () => {
    const base = await summary("html-fields")
    for (const securityLevel of ["strict", "loose", "antiscript", "sandbox"]) {
      expect(await summary("html-fields", { securityLevel })).toEqual(base)
    }
  })
})
