import { describe, expect, it } from "vitest"
import { loadFixtures } from "../src/index.ts"
import { runMermaid } from "../src/mermaid.ts"
import { normalizeTreemap } from "../src/normalizers/treemap.ts"
import type { MermaidConfig } from "../src/types.ts"

const fixtures = await loadFixtures("treemap")

/** The fixed treemap fixture of this name. */
function named(name: string) {
  const fixture = fixtures.find((item) => item.name === name)
  if (fixture === undefined) throw new Error(`missing treemap/${name}`)
  return fixture
}

/** The summary of an accepted corpus input, under its site settings and `config`. */
async function summary(name: string, config: MermaidConfig = {}) {
  const fixture = named(name)
  const result = await runMermaid(fixture.input, {
    config: { ...fixture.config, ...config },
  })
  if (!result.accepted) throw new Error(`expected accepted treemap/${name}`)
  return result.db
}

describe("treemap normalization", () => {
  it("keeps the forest, empty sections, leaf values and forward class definitions", async () => {
    expect(await summary("db-all-fields")).toEqual({
      title: "T",
      accTitle: "A",
      accDescr: "D\nE",
      nodes: [
        {
          name: "Root",
          classSelector: "sectionClass",
          children: [
            {
              name: "Branch",
              children: [
                { name: "Leaf", value: 1234.5, classSelector: "leafClass" },
              ],
            },
            { name: "Empty", children: [] },
          ],
        },
        { name: "Other", value: 0 },
      ],
      classDefs: [
        { id: "sectionClass", styles: ["fill:red", "color:blue"] },
        { id: "leafClass", styles: ["stroke:#abc"] },
      ],
    })
    expect(await summary("db-class-repeat")).toMatchObject({
      classDefs: [
        { id: "same", styles: ["fill:red", "color:green"] },
        { id: "other", styles: ["stroke:blue"] },
      ],
    })
    expect(await summary("db-class-empty-final")).toMatchObject({
      classDefs: [{ id: "same", styles: ["fill:red", ""] }],
    })
  })

  it("keeps the Db's hierarchy without sorting, aggregating or deduplicating nodes", async () => {
    expect(await summary("db-leaf-not-parent")).toMatchObject({
      nodes: [
        {
          name: "A",
          children: [
            { name: "B", value: 1 },
            { name: "C", value: 2 },
          ],
        },
        { name: "D", value: 3 },
        { name: "E", value: 4 },
      ],
    })
    expect(await summary("db-empty-names")).toMatchObject({
      nodes: [
        { name: "", children: [{ name: "", value: 0 }] },
        { name: "", classSelector: "emptyClass", children: [] },
      ],
    })
    expect(await summary("db-prototype-names")).toMatchObject({
      classDefs: [
        { id: "__proto__", styles: ["fill:red"] },
        { id: "constructor", styles: ["color:blue"] },
      ],
    })
  })

  it("uses the shared numeric form after NUMBER2 conversion", async () => {
    for (const [name, value] of [
      ["db-number-comma", 1234.5],
      ["db-number-underscore", 1],
      ["db-number-multiple-dots", 1.2],
      ["db-number-nan", "NaN"],
      ["db-number-overflow", "Infinity"],
      ["db-number-subnormal", 1e-323],
      ["db-number-underflow", 0],
    ] as const) {
      expect(await summary(name), name).toMatchObject({ nodes: [{ value }] })
    }
  })

  it("omits duplicate and drawing state without mutating the Db", () => {
    const children = Object.freeze([
      Object.freeze({
        name: "Leaf",
        value: -0,
        cssCompiledStyles: ["fill:red"],
      }),
      Object.freeze({ name: "Overflow", value: Infinity }),
      Object.freeze({ name: "Negative", value: -Infinity }),
      Object.freeze({ name: "Invalid", value: Number.NaN }),
    ])
    const styles = Object.freeze(["fill:red \t", " color:blue", ""])
    const classes = new Map([
      ["styled", { id: "styled", styles, textStyles: [" color:blue"] }],
    ])
    const db = {
      getDiagramTitle: () => "",
      getAccTitle: () => "",
      getAccDescription: () => "",
      getRoot: () => ({ name: "artificial", children }),
      getClasses: () => classes,
      getNodes: () => {
        throw new Error("must not read the duplicate node list")
      },
      getConfig: () => {
        throw new Error("must not read drawing configuration")
      },
    }
    expect(normalizeTreemap(db)).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      nodes: [
        { name: "Leaf", value: 0 },
        { name: "Overflow", value: "Infinity" },
        { name: "Negative", value: "-Infinity" },
        { name: "Invalid", value: "NaN" },
      ],
      classDefs: [{ id: "styled", styles: ["fill:red", " color:blue", ""] }],
    })
    expect(styles[0]).toBe("fill:red \t")
    expect(Object.is(children[0].value, -0)).toBe(true)
  })

  it("resets publication after a rejected row", async () => {
    await summary("db-all-fields")
    expect((await runMermaid(named("error-after-prefix").input)).accepted).toBe(
      false,
    )
    expect(await summary("header-beta")).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      nodes: [],
      classDefs: [],
    })
  })

  it("keeps markup under every supported security level", async () => {
    const base = await summary("html-fields")
    for (const securityLevel of ["strict", "loose", "antiscript", "sandbox"]) {
      expect(await summary("html-fields", { securityLevel })).toEqual(base)
    }
  })
})
