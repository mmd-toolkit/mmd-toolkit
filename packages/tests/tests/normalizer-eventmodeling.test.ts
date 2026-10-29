import { describe, expect, it } from "vitest"
import { loadFixtures } from "../src/index.ts"
import { runMermaid, runMermaidWithEmbeddedData } from "../src/mermaid.ts"
import {
  normalizeEventmodeling,
  patchEventmodelingDb,
} from "../src/normalizers/eventmodeling.ts"
import type { MermaidConfig } from "../src/types.ts"

const fixtures = await loadFixtures("eventmodeling")

/** The fixed eventmodeling input with this name. */
function named(name: string) {
  const fixture = fixtures.find((item) => item.name === name)
  if (fixture === undefined) throw new Error(`missing eventmodeling/${name}`)
  return fixture
}

/** The summary of an accepted corpus input, under its site settings and `config`. */
async function summary(name: string, config: MermaidConfig = {}) {
  const fixture = named(name)
  const result = await runMermaid(fixture.input, {
    config: { ...fixture.config, ...config },
  })
  if (!result.accepted) throw new Error(`expected accepted ${name}`)
  return result.db
}

describe("eventmodeling normalization", () => {
  it("keeps ordered frames and omits declarations unused by drawing", async () => {
    const result = await summary("db-all-fields")
    expect(Object.keys(result!)).toEqual(["accTitle", "accDescr", "frames"])
    expect(result?.frames).toMatchObject([
      {
        kind: "time",
        name: "01",
        modelEntityType: "ui",
        entityIdentifier: "Shop.Screen",
        data: null,
      },
      {
        kind: "time",
        name: "02",
        sourceFrames: ["01"],
        data: { kind: "inline", value: "{ x: 1 }" },
      },
      {
        kind: "time",
        name: "03",
        sourceFrames: ["02"],
        data: { kind: "block", value: "{\n<b>x</b>\n}\n" },
      },
      {
        kind: "reset",
        name: "04",
        modelEntityType: "rmo",
        sourceFrames: ["03"],
      },
    ])
    expect(await summary("db-entities-notes-gwt")).toEqual({
      accTitle: "",
      accDescr: "",
      frames: [],
    })
  })

  it("rejects a repeated frame id", async () => {
    const result = await runMermaid(named("db-frame-duplicates").input)
    expect(result).toMatchObject({
      accepted: false,
      error: { message: 'Duplicate event modeling frame ID "01" on line 3' },
    })
  })

  it("keeps first matching data and source membership", async () => {
    expect((await summary("db-data-first"))?.frames).toMatchObject([
      { data: { kind: "block", value: "{\nfirst\n}\n" } },
      { data: { kind: "block", value: "{\npartner\n}\n" } },
    ])
    expect(await summary("db-source-order")).toEqual(
      await summary("db-source-order-control"),
    )
    expect((await summary("db-data-unresolved-inline"))?.frames).toMatchObject([
      { data: { kind: "inline", value: "{ inline }" } },
    ])
  })

  it("keeps raw EM accessibility values and excludes the undrawn title", async () => {
    expect(await summary("common-inline")).toMatchObject({
      accTitle: "accTitle: A",
      accDescr: " accDescr { D }",
    })
    const result = await runMermaidWithEmbeddedData(
      named("frontmatter-title").input,
    )
    expect(result.embedded?.title).toBe("Front")
    expect(result.outcome).toMatchObject({
      accepted: true,
      db: { accTitle: "", accDescr: "" },
    })
    if (result.outcome.accepted)
      expect(result.outcome.db).not.toHaveProperty("title")
  })

  it("observes publication without linking, drawing, mutating or changing the original calls", () => {
    let stored: unknown
    let clears = 0
    const ref = Object.freeze({
      $refText: "02",
      get ref(): never {
        throw new Error("must not link")
      },
    })
    const frame = Object.freeze({
      $type: "EmTimeFrame",
      name: "01",
      modelEntityType: "evt",
      entityIdentifier: "A",
      sourceFrames: Object.freeze([ref]),
    })
    const ast = Object.freeze({
      frames: Object.freeze([frame]),
      dataEntities: Object.freeze([]),
    })
    const db = {
      clear() {
        stored = undefined
        clears++
      },
      setAst(value: unknown) {
        stored = value
      },
      getAccTitle: () => "A",
      getAccDescription: () => "D",
      getState(): never {
        throw new Error("must not draw")
      },
    }
    patchEventmodelingDb(db)
    db.setAst(ast)
    expect(stored).toBe(ast)
    expect(normalizeEventmodeling(db)).toMatchObject({
      frames: [{ name: "01", sourceFrames: ["02"] }],
    })
    expect(frame.sourceFrames).toEqual([ref])
    db.clear()
    expect(clears).toBe(1)
    expect(stored).toBeUndefined()
    expect(() => normalizeEventmodeling(db)).toThrow(
      "published AST was not observed",
    )
  })

  it("resets after rejection", async () => {
    await summary("db-all-fields")
    expect((await runMermaid(named("error-after-prefix").input)).accepted).toBe(
      false,
    )
    expect(await summary("header-only")).toEqual({
      accTitle: "",
      accDescr: "",
      frames: [],
    })
  })

  it("keeps markup under every supported security level", async () => {
    const base = await summary("html-common")
    for (const securityLevel of ["strict", "loose", "antiscript", "sandbox"]) {
      expect(await summary("html-common", { securityLevel })).toEqual(base)
    }
  })
})
