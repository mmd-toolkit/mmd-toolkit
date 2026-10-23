import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { getFixturesRoot } from "../src/index.ts"
import { runMermaidWithEmbeddedData } from "../src/mermaid.ts"
import { normalizeC4, patchC4Db } from "../src/normalizers/c4.ts"
import type { JsonObject, MermaidConfig } from "../src/types.ts"

/** Runs a fixed C4 corpus input under the given site settings. */
async function runFixture(name: string, config: MermaidConfig = {}) {
  return runMermaidWithEmbeddedData(
    readFileSync(path.join(getFixturesRoot(), "c4", name, "input.mmd"), "utf8"),
    { config },
  )
}

/** The summary of a named accepted C4 fixture. */
async function summary(name: string, config: MermaidConfig = {}) {
  const { outcome } = await runFixture(name, config)
  if (!outcome.accepted || outcome.db === null) throw new Error("expected a Db")
  return outcome.db
}

/** A stand-in with all the getters the C4 normalizer reads. */
function fakeDb() {
  return {
    getC4Type: () => "C4Context",
    getTitle: () => "Title",
    getAccTitle: () => "Accessible title",
    getAccDescription: () => "Description",
    getC4ShapeArray: (): Record<string, unknown>[] => [],
    getBoundaries: (): Record<string, unknown>[] => [],
    getRels: (): Record<string, unknown>[] => [],
    getC4ShapeInRow: () => 4,
    getC4BoundaryInRow: () => 2,
  }
}

const SHAPE = {
  alias: "a",
  label: { text: "A" },
  techn: "Changed technology",
  descr: { text: "Description" },
  sprite: "changed sprite",
  tags: "tags",
  // eslint-disable-next-line no-script-url -- the fixture checks that links are kept as written
  link: "javascript:alert(1)",
  typeC4Shape: { text: "container" },
  parentBoundary: "inner",
  bgColor: "red",
  fontColor: "white",
  borderColor: "blue",
  shadowing: "yes",
  shape: "box",
  legendText: "Legend",
  legendSprite: "Legend sprite",
}

const GLOBAL = {
  alias: "global",
  label: { text: "global" },
  type: { text: "global" },
  tags: null,
  link: null,
  parentBoundary: "",
}

const REL = {
  type: "rel",
  from: "a",
  to: "b",
  label: { text: "Uses" },
  techn: { text: "HTTPS" },
  descr: { text: "Relationship" },
  sprite: "rel sprite",
  tags: "rt",
  link: "rl",
  textColor: "green",
  lineColor: "black",
  offsetX: -4,
  offsetY: 7,
}

describe("the summary of a C4 diagram", () => {
  it("keeps every field, text wrappers, raw style technology and parent order", async () => {
    expect(await summary("db-all-fields")).toEqual({
      type: "C4Context",
      title: "All fields",
      accTitle: "",
      accDescr: "Accessible description",
      shapes: [
        SHAPE,
        {
          alias: "b",
          label: { text: "B" },
          descr: { text: "Person description" },
          custom: "own",
          typeC4Shape: { text: "person" },
          parentBoundary: "inner",
        },
      ],
      boundaries: [
        GLOBAL,
        {
          alias: "outer",
          label: { text: "Outer" },
          type: { text: "company" },
          tags: "bt",
          link: "bl",
          parentBoundary: "global",
        },
        {
          alias: "inner",
          label: { text: "Inner" },
          type: { text: "machine" },
          descr: { text: "Node description" },
          tags: "nt",
          link: "nl",
          nodeType: "node",
          parentBoundary: "outer",
        },
      ],
      rels: [REL],
      c4ShapeInRow: 3,
      c4BoundaryInRow: 1,
    })
  })

  it.each([
    ["getC4Type", "type", "C4Deployment"],
    ["getTitle", "title", "Changed title"],
    ["getAccTitle", "accTitle", "Changed accessibility title"],
    ["getAccDescription", "accDescr", "Changed description"],
    ["getC4ShapeInRow", "c4ShapeInRow", 7],
    ["getC4BoundaryInRow", "c4BoundaryInRow", 9],
  ])("observes a single changed %s getter", (getter, field, value) => {
    const db = fakeDb()
    expect(normalizeC4({ ...db, [getter]: () => value })).toEqual({
      ...normalizeC4(db),
      [field]: value,
    })
  })

  it.each(Object.entries(SHAPE))(
    "observes a single changed shape attribute %s",
    (field, value) => {
      const changed = { [field]: value }
      expect(
        normalizeC4({ ...fakeDb(), getC4ShapeArray: () => [changed] }).shapes,
      ).toEqual([changed])
    },
  )

  it.each(Object.entries(REL))(
    "observes a single changed relationship attribute %s",
    (field, value) => {
      const changed = { [field]: value }
      expect(
        normalizeC4({ ...fakeDb(), getRels: () => [changed] }).rels,
      ).toEqual([changed])
    },
  )

  it("keeps arbitrary own attributes, geometry-like named keys and nested required-slot objects", async () => {
    const own = JSON.parse(
      '{"__proto__":"own","constructor":"value"}',
    ) as JsonObject
    expect(
      normalizeC4({
        ...fakeDb(),
        getBoundaries: () => [{ ...GLOBAL, ...own, x: "written" }],
      }).boundaries,
    ).toEqual([{ ...GLOBAL, ...own, x: "written" }])
    const result = await summary("db-style-layout-key-attributes")
    expect((result.shapes as JsonObject[])[0]).toMatchObject({
      x: "17",
      width: "20",
      constructor: "own",
      hasOwnProperty: "yes",
    })
    expect((await summary("db-rel-named-endpoints")).rels).toEqual([
      {
        type: "rel",
        from: { from: "a" },
        to: { to: "b" },
        label: { text: { label: "Uses" } },
        techn: { text: "" },
        descr: { text: "" },
      },
    ])
  })

  it("omits undefined attributes and converts every non-finite numeric attribute", () => {
    expect(
      normalizeC4({
        ...fakeDb(),
        getRels: () => [
          {
            offsetX: Number.NaN,
            offsetY: -Infinity,
            custom: Infinity,
            unset: undefined,
          },
          { offsetX: -0 },
        ],
        getC4ShapeInRow: () => Infinity,
      }),
    ).toMatchObject({
      rels: [
        { offsetX: "NaN", offsetY: "-Infinity", custom: "Infinity" },
        { offsetX: 0 },
      ],
      c4ShapeInRow: "Infinity",
    })
  })

  it("drops configuration, parsing stacks and renderer constants outside the attribute bags", () => {
    const db = fakeDb()
    expect(
      normalizeC4({
        ...db,
        getConfig: () => ({ theme: "dark", width: 900 }),
        getCurrentBoundaryParse: () => "unclosed",
        getParentBoundaryParse: () => "parent",
        LINETYPE: { SOLID: 0 },
        ARROWTYPE: { FILLED: 0 },
        PLACEMENT: { OVER: 2 },
      }),
    ).toEqual(normalizeC4(db))
  })

  it("uses first-insertion order with the values from the last definition", async () => {
    const shapes = (await summary("db-shape-three-definitions"))
      .shapes as JsonObject[]
    expect(shapes.map((shape) => shape.alias)).toEqual(["a", "b"])
    expect(shapes[0]).toMatchObject({
      label: { text: "Third" },
      techn: { text: "Java" },
      descr: { text: "Third D" },
      tags: "first",
      parentBoundary: "c",
    })
    const rels = (await summary("db-rel-three-definitions"))
      .rels as JsonObject[]
    expect(rels.map((rel) => [rel.from, rel.to])).toEqual([
      ["a", "b"],
      ["b", "a"],
    ])
    expect(rels[0]).toMatchObject({
      label: { text: "Third" },
      techn: { text: "RPC" },
      tags: "tags",
    })
  })

  it("records root wrap and ignores C4-specific drawing configuration", async () => {
    const base = await summary("header-context-minimal")
    expect(await summary("db-directive-drawing-config")).toEqual(base)
    expect(
      await summary("header-context-minimal", { wrap: true }),
    ).toMatchObject({
      shapes: [{ wrap: true }],
    })
    expect(
      await summary("header-context-minimal", {
        c4: { wrap: false, c4ShapeInRow: 9 },
      }),
    ).toEqual(base)
    expect(
      (await runFixture("db-wrap-directive")).embedded?.dataBlockEffects,
    ).toEqual([])
  })

  it("is unchanged under supported security levels and observes unsupported-level htmlLabels", async () => {
    const base = await summary("db-all-fields")
    for (const securityLevel of ["strict", "loose", "antiscript", "sandbox"]) {
      expect(await summary("db-all-fields", { securityLevel })).toEqual(base)
    }
    const name = "config-security-level-other"
    expect((await summary(name, { securityLevel: "other" })).title).toBe(
      "&lt;b&gt;T&lt;/b&gt; &equals; value",
    )
    expect(
      await summary(name, { securityLevel: "other", htmlLabels: false }),
    ).toEqual(await summary(name))
  })

  it("does not cache a getter that breaks once or reuse fields after success and rejection", async () => {
    const db = fakeDb()
    let breakOnce = true
    const failing = {
      ...db,
      getRels: () => {
        if (breakOnce) {
          breakOnce = false
          throw new Error("broken once")
        }
        return []
      },
    }
    expect(() => normalizeC4(failing)).toThrow("broken once")
    expect(normalizeC4(failing)).toEqual(normalizeC4(db))
    await summary("db-all-fields")
    expect((await runFixture("lex-unclosed-named")).outcome.accepted).toBe(
      false,
    )
    expect(await summary("header-context-minimal")).toEqual({
      type: "C4Context",
      title: "",
      accTitle: "",
      accDescr: "",
      shapes: [
        {
          alias: "a",
          label: { text: "A" },
          descr: { text: "" },
          typeC4Shape: { text: "person" },
          parentBoundary: "global",
        },
      ],
      boundaries: [GLOBAL],
      rels: [],
      c4ShapeInRow: 4,
      c4BoundaryInRow: 2,
    })
  })
})

describe("patchC4Db", () => {
  it("resets common accessibility strings when the parser's yy is a copy", () => {
    let title = "Before"
    let description = "Before"
    const db = {
      ...fakeDb(),
      clear: (): string => "cleared",
      setAccTitle: (text: string) => {
        title = text
      },
      setAccDescription: (text: string) => {
        description = text
      },
      getAccTitle: () => title,
      getAccDescription: () => description,
    }
    patchC4Db(db)
    expect({ ...db }.clear()).toBe("cleared")
    const empty = normalizeC4(db)
    expect(empty.accTitle).toBe("")
    expect(empty.accDescr).toBe("")
    db.setAccTitle("New title")
    db.setAccDescription("New description")
    expect(normalizeC4(db)).toMatchObject({
      accTitle: "New title",
      accDescr: "New description",
    })
    db.clear()
    expect(normalizeC4(db)).toEqual(empty)
  })
})
