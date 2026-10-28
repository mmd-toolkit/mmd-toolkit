import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { getFixturesRoot } from "../src/index.ts"
import { runMermaidWithEmbeddedData } from "../src/mermaid.ts"
import { normalizeVenn } from "../src/normalizers/venn.ts"
import type { MermaidConfig } from "../src/types.ts"

/** Runs a fixed venn corpus input under the given site settings. */
async function runFixture(name: string, config: MermaidConfig = {}) {
  return runMermaidWithEmbeddedData(
    readFileSync(
      path.join(getFixturesRoot(), "venn", name, "input.mmd"),
      "utf8",
    ),
    { config },
  )
}

/** The summary of a named accepted venn fixture. */
async function summary(name: string, config: MermaidConfig = {}) {
  const { outcome } = await runFixture(name, config)
  if (!outcome.accepted || outcome.db === null) throw new Error("expected a Db")
  return outcome.db
}

/** A stand-in with every getter the normalizer reads. */
function fakeDb() {
  return {
    getDiagramTitle: () => "",
    getAccTitle: () => "",
    getAccDescription: () => "",
    getSubsetData: () => [],
    getTextData: () => [],
    getStyleData: () => [],
  }
}

describe("the summary of a venn diagram", () => {
  it("keeps every declaration field and the stored list order", async () => {
    expect(await summary("db-all-fields")).toEqual({
      title: "All fields",
      accTitle: "",
      accDescr: "",
      subsets: [
        { sets: ["B"], size: 12, label: "Beta" },
        { sets: ["A"], size: 20, label: "Alpha" },
        { sets: ["A", "B"], size: 3, label: "Overlap" },
      ],
      texts: [
        { sets: ["A", "B"], id: "item", label: "Shared note" },
        { sets: ["A", "B"], id: "explicit item", label: "Explicit" },
      ],
      styles: [
        {
          targets: ["A", "B"],
          styles: { fill: "rgb(1, 2, 3)", color: " dark blue " },
        },
      ],
    })
  })

  it.each([
    ["getDiagramTitle", "title", "Title"],
    ["getAccTitle", "accTitle", "Accessible title"],
    ["getAccDescription", "accDescr", "Description"],
    ["getSubsetData", "subsets", [{ sets: ["B", "A"], size: 7, label: "L" }]],
    ["getTextData", "texts", [{ sets: ["B", "A"], id: "id", label: "L" }]],
    [
      "getStyleData",
      "styles",
      [{ targets: ["B", "A"], styles: { fill: "red" } }],
    ],
  ])("observes a single changed %s getter", (getter, field, value) => {
    const db = fakeDb()
    expect(normalizeVenn({ ...db, [getter]: () => value })).toEqual({
      ...normalizeVenn(db),
      [field]: value,
    })
  })

  it.each([
    ["sets", ["A", "A"]],
    ["size", 4],
    ["label", "Changed"],
  ])("observes a single changed subset %s", (field, value) => {
    const base = { sets: ["A"], size: 10 }
    expect(
      normalizeVenn({
        ...fakeDb(),
        getSubsetData: () => [{ ...base, [field]: value }],
      }).subsets,
    ).toEqual([{ ...base, [field]: value }])
  })

  it.each([
    ["sets", ["B"]],
    ["id", "Changed"],
    ["label", "Label"],
  ])("observes a single changed text %s", (field, value) => {
    const base = { sets: ["A"], id: "id" }
    expect(
      normalizeVenn({
        ...fakeDb(),
        getTextData: () => [{ ...base, [field]: value }],
      }).texts,
    ).toEqual([{ ...base, [field]: value }])
  })

  it("omits undefined labels, keeps empty labels and spells non-finite sizes", () => {
    expect(
      normalizeVenn({
        ...fakeDb(),
        getSubsetData: () => [
          { sets: ["A"], size: Infinity, label: undefined },
          { sets: ["B"], size: -Infinity, label: "" },
          { sets: ["C"], size: Number.NaN },
          { sets: ["D"], size: -0 },
        ],
        getTextData: () => [{ sets: [], id: "", label: "" }],
      }),
    ).toMatchObject({
      subsets: [
        { sets: ["A"], size: "Infinity" },
        { sets: ["B"], size: "-Infinity", label: "" },
        { sets: ["C"], size: "NaN" },
        { sets: ["D"], size: 0 },
      ],
      texts: [{ sets: [], id: "", label: "" }],
    })
  })

  it("drops configuration, parse state and drawing fields without inspecting them", () => {
    expect(
      normalizeVenn({
        ...fakeDb(),
        getConfig: () => {
          throw new Error("configuration must not be read")
        },
        getCurrentSets: () => ["A"],
        getIndentMode: () => true,
        knownSets: new Set(["A"]),
        getSubsetData: () => [{ sets: ["A"], size: 10, x: 3, radius: 4 }],
      }),
    ).toEqual({
      ...normalizeVenn(fakeDb()),
      subsets: [{ sets: ["A"], size: 10 }],
    })
  })

  it("retains duplicate declarations and the Db's own style properties", async () => {
    const db = await summary("db-three-definitions")
    expect(db.subsets).toEqual([
      { sets: ["A"], size: 1, label: "First" },
      { sets: ["B"], size: 8 },
      { sets: ["A"], size: 2, label: "Second" },
      { sets: ["A", "B"], size: 3 },
      { sets: ["A"], size: 4, label: "Third" },
      { sets: ["A", "B"], size: 5 },
    ])
    expect((await summary("db-style-prototype-keys")).styles).toEqual([
      {
        targets: ["A"],
        styles: {
          constructor: "blue",
          hasOwnProperty: "green",
          toString: "yellow",
        },
      },
    ])
  })

  it("preserves the distinction between quoted ids and bracket-label trimming", async () => {
    expect((await summary("db-quoted-padding")).subsets).toEqual([
      { sets: ["  A  "], size: 10 },
    ])
    expect((await summary("db-label-double-normalization")).subsets).toEqual([
      { sets: ["A"], size: 10, label: "label" },
    ])
    expect(
      (await runFixture("db-all-fields")).embedded?.dataBlockEffects,
    ).toEqual([])
  })

  it("ignores drawing configuration and checks supported security levels", async () => {
    const base = await summary("db-markup")
    for (const securityLevel of ["strict", "loose", "antiscript", "sandbox"]) {
      expect(await summary("db-markup", { securityLevel })).toEqual(base)
    }
    expect(
      await summary("db-markup", {
        wrap: true,
        theme: "dark",
        look: "handDrawn",
        venn: { width: 900, height: 800, padding: 40, useDebugLayout: true },
      }),
    ).toEqual(base)
    expect((await summary("db-markup", { securityLevel: "other" })).title).toBe(
      "&lt;b&gt;T&lt;/b&gt; &equals; value",
    )
    expect(
      await summary("db-markup", { securityLevel: "other", htmlLabels: false }),
    ).toEqual(base)
  })

  it.each(Object.keys(fakeDb()))(
    "does not cache a %s getter that breaks once",
    (getter) => {
      const db = fakeDb()
      let breakOnce = true
      const failing = {
        ...db,
        [getter]: () => {
          if (breakOnce) {
            breakOnce = false
            throw new Error("broken once")
          }
          return db[getter as keyof typeof db]()
        },
      }
      expect(() => normalizeVenn(failing)).toThrow("broken once")
      expect(normalizeVenn(failing)).toEqual(normalizeVenn(db))
    },
  )

  it("clears lists and common title fields after accepted and rejected diagrams", async () => {
    await summary("db-all-fields")
    expect((await runFixture("gram-unclosed-id")).outcome.accepted).toBe(false)
    expect(await summary("header-only")).toEqual(normalizeVenn(fakeDb()))
  })
})
