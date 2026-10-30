import mermaid from "mermaid"
import { describe, expect, it, vi } from "vitest"
import type { Fixture } from "../src/index.ts"
import { loadFixtures } from "../src/index.ts"
import { runMermaid, runMermaidWithEmbeddedData } from "../src/mermaid.ts"
import { normalizeAgentflow } from "../src/normalizers/agentflow.ts"
import type { DbSummary, MermaidConfig } from "../src/types.ts"

const fixtures = await loadFixtures("agentflow")

/** A fixed corpus input, including its optional site configuration. */
function named(name: string): Fixture {
  const fixture = fixtures.find((candidate) => candidate.name === name)
  if (!fixture) throw new Error(`no agentflow fixture ${name}`)
  return fixture
}

/** The summary of an accepted, fixed corpus input. */
async function summary(
  name: string,
  config: MermaidConfig = {},
): Promise<DbSummary> {
  const fixture = named(name)
  const result = await runMermaid(fixture.input, {
    config: { ...fixture.config, ...config },
  })
  if (!result.accepted || !result.db) {
    throw new Error(`agentflow/${name} was not summarized`)
  }
  return result.db
}

describe("agentflow summary", () => {
  it("keeps syntax records and interactivity, without rendering bookkeeping", async () => {
    const db = await summary("db-all-fields")
    expect(Object.keys(db)).toEqual([
      "direction",
      "title",
      "accTitle",
      "accDescr",
      "vertices",
      "edges",
      "edgeDefaults",
      "classDefs",
      "subgraphs",
      "tooltips",
      "clickCalls",
    ])
    expect([db.direction, db.title, db.accTitle, db.accDescr]).toEqual([
      "LR",
      "Workflow",
      "Accessible",
      "Description",
    ])
    expect(db.vertices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "C", isConnector: true }),
        expect.objectContaining({ id: "A", styles: ["stroke:green"] }),
      ]),
    )
    for (const vertex of db.vertices as object[]) {
      expect(vertex).not.toHaveProperty("domId")
      expect(vertex).not.toHaveProperty("haveCallback")
    }
    for (const classDef of db.classDefs as object[]) {
      expect(classDef).not.toHaveProperty("textStyles")
    }
    for (const edge of db.edges as object[]) {
      expect(edge).not.toHaveProperty("edgeSemantic")
      expect(edge).not.toHaveProperty("isUserDefinedId")
    }
    expect(db).not.toHaveProperty("diagnostics")
    expect(db.clickCalls).toEqual([{ id: "B", name: "run", args: '"x", 2' }])
  })

  it("keeps the three edge kinds and the authored reference label", async () => {
    const db = await summary("gram-three-edge-kinds")
    expect(
      (db.edges as { type: string; stroke: string }[]).map((edge) => [
        edge.type,
        edge.stroke,
      ]),
    ).toEqual([
      ["arrow_point", "normal"],
      ["arrow_open", "dotted"],
      ["arrow_cross", "normal"],
    ])
    const reference = await summary("gram-reference-pipe-label")
    expect(reference.edges).toEqual([
      expect.objectContaining({
        text: "reference label",
        type: "arrow_open",
        stroke: "dotted",
      }),
    ])
  })

  it("keeps collapsed descendants and original endpoints", async () => {
    const db = await summary("db-flow-collapse")
    expect(db.vertices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "A" }),
        expect.objectContaining({ id: "B" }),
      ]),
    )
    expect(db.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ start: "X", end: "A" }),
        expect.objectContaining({ start: "B", end: "Y" }),
      ]),
    )
  })

  it("keeps accepted inputs that would emit diagnostics when drawn", async () => {
    const cases = [
      "db-data-block-removed-shape",
      "db-data-block-unsupported-shape",
      "db-diagnostics-containment-cycle",
      "db-diagnostics-no-semantic-checks",
      "db-flow-collapsed-removed-shape",
    ]
    for (const name of cases) {
      const db = await summary(name)
      expect(db).not.toHaveProperty("diagnostics")
    }
  })

  it("summarizes raw records without constructing layout data", async () => {
    const fixture = named("db-data-block-removed-shape")
    const expected = await summary(fixture.name)
    expect(await summary("db-diagnostic-position-variant")).toEqual(expected)
    const diagram = await mermaid.mermaidAPI.getDiagramFromText(fixture.input)
    const db = diagram.db as typeof diagram.db & { getData(): unknown }
    const getData = vi.spyOn(db, "getData")
    expect(normalizeAgentflow(db)).toEqual(expected)
    expect(normalizeAgentflow(db)).toEqual(expected)
    expect(getData).not.toHaveBeenCalled()
    getData.mockRestore()
  })

  it.each<[string, string, string | { values: string[] }]>([
    ["db-metadata-positive-infinity", "vertices", "Infinity"],
    ["db-metadata-negative-infinity", "vertices", "-Infinity"],
    ["db-metadata-nan", "vertices", "NaN"],
    ["db-metadata-overflow", "vertices", "1e999"],
    ["db-metadata-edge-infinity", "edges", "Infinity"],
    ["db-metadata-flow-infinity", "subgraphs", "Infinity"],
    ["db-metadata-connector-infinity", "vertices", "Infinity"],
    ["db-metadata-nested-nan", "vertices", { values: ["NaN"] }],
  ])(
    "accepts and extracts numeric metadata in %s",
    async (name, field, custom) => {
      const fixture = named(name)
      const result = await runMermaidWithEmbeddedData(fixture.input)
      expect(result.outcome.accepted).toBe(true)
      if (!result.outcome.accepted) return
      expect(result.outcome.db?.[field]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ metadata: { custom } }),
        ]),
      )
      expect(result.embedded?.dataBlockEffects).toEqual([
        expect.objectContaining({ set: { metadata: { custom } } }),
      ])
    },
  )

  it("records metadata effects on every element kind, in source order", async () => {
    const fixture = named("db-data-block-routing")
    const { embedded } = await runMermaidWithEmbeddedData(fixture.input)
    expect(embedded?.dataBlockEffects).toEqual([
      { id: "C", set: { metadata: { protocol: "http" } } },
      { id: "F", set: { metadata: { model: "x", view: "collapsed" } } },
      {
        id: "e",
        set: {
          metadata: { instruction: "go", curve: "linear" },
          interpolate: "linear",
        },
      },
      { id: "A", set: { metadata: { returns: "result" } } },
    ])
    const reserved = await runMermaidWithEmbeddedData(
      named("db-data-block-reserved-connectors").input,
    )
    expect(reserved.embedded?.dataBlockEffects).toEqual([
      { id: "connectors", set: {} },
    ])
    const empty = await runMermaidWithEmbeddedData(named("header-lf").input)
    expect(empty.embedded?.dataBlockEffects).toEqual([])
  })

  it("records the resolved metadata and strips prototype-shaped keys recursively", async () => {
    const fixture = named("db-data-block-recursive-prototype-keys")
    const { outcome, embedded } = await runMermaidWithEmbeddedData(
      fixture.input,
    )
    expect(outcome.accepted).toBe(true)
    expect(embedded?.dataBlockEffects).toEqual([
      {
        id: "A",
        set: { metadata: { safe: { keep: "ok" }, list: [{ keep: "yes" }] } },
      },
    ])
    const aliases = await runMermaidWithEmbeddedData(
      named("db-data-block-aliases").input,
    )
    expect(aliases.embedded?.dataBlockEffects[0]).toEqual({
      id: "A",
      set: { type: "roundedRect", metadata: { shape: "roundedRect" } },
    })
  })

  it("keeps markup under every supported security level", async () => {
    for (const name of ["html-label-contexts", "config-security-loose"]) {
      const base = await summary(name)
      for (const securityLevel of [
        "strict",
        "loose",
        "antiscript",
        "sandbox",
      ]) {
        expect(
          await summary(name, { securityLevel }),
          `${name}: ${securityLevel}`,
        ).toEqual(base)
      }
    }
  })
})
