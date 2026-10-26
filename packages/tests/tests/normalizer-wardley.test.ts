import { describe, expect, it } from "vitest"
import { loadFixtures } from "../src/index.ts"
import { runMermaid, runMermaidWithEmbeddedData } from "../src/mermaid.ts"
import { normalizeWardley } from "../src/normalizers/wardley.ts"

const fixtures = await loadFixtures("wardley")

/** The fixed Wardley fixture with this name. */
function named(name: string) {
  const fixture = fixtures.find((item) => item.name === name)
  if (fixture === undefined) throw new Error(`missing wardley/${name}`)
  return fixture
}

/** Runs a corpus input with its site configuration. */
async function summary(name: string) {
  const fixture = named(name)
  const result = await runMermaid(fixture.input, { config: fixture.config })
  if (!result.accepted) throw new Error(`expected accepted wardley/${name}`)
  return result.db
}

describe("Wardley normalization", () => {
  it("keeps written size, stages, decorations and percentage coordinates before drawing", async () => {
    expect(await summary("db-all-fields")).toEqual({
      title: "T",
      accTitle: "A",
      accDescr: "D\nE",
      nodes: [
        { id: "User", label: "User", x: 80, y: 90, className: "anchor" },
        {
          id: "A",
          label: "A",
          x: 50,
          y: 40,
          className: "component",
          labelOffsetX: 0,
          labelOffsetY: -2,
          inertia: true,
          sourceStrategy: "build",
        },
        {
          id: "B",
          label: "B",
          x: 30,
          y: 20,
          className: "component",
          inertia: false,
        },
        {
          id: "A_Child",
          label: "Child",
          x: 60,
          y: 40,
          className: "pipeline-component",
        },
      ],
      links: [
        { source: "User", target: "A_Child", dashed: false, label: "label" },
      ],
      trends: [{ nodeId: "A", targetX: 90 }],
      pipelines: [{ nodeId: "A", componentIds: ["A_Child"] }],
      annotations: [
        { number: 1, coordinates: [{ x: 40, y: 30 }], text: "Text" },
      ],
      notes: [{ text: "N", x: 20, y: 10 }],
      accelerators: [{ name: "X", x: 30, y: 20 }],
      deaccelerators: [{ name: "Y", x: 40, y: 30 }],
      annotationsBox: { x: 20, y: 10 },
      axes: { stages: ["G / C", "P"], stageBoundaries: [0.3, 1] },
      size: { width: 900, height: 600 },
    })
  })

  it("keeps overflowing published numbers as text and underflow as zero", async () => {
    expect(await summary("db-number-overflow")).toMatchObject({
      size: { width: "Infinity", height: 2 },
      axes: { stageBoundaries: ["Infinity"] },
      nodes: [{ labelOffsetX: "-Infinity", labelOffsetY: 0 }],
      annotations: [{ number: "Infinity" }],
    })
    expect(await summary("db-number-subnormal")).toMatchObject({
      axes: { stageBoundaries: [1e-323] },
    })
    expect(await summary("db-number-underflow")).toMatchObject({
      axes: { stageBoundaries: [0] },
    })
  })

  it("preserves the frontmatter title when the final body title is empty", async () => {
    const result = await runMermaidWithEmbeddedData(
      named("frontmatter-empty-body-title").input,
    )
    expect(result.outcome).toMatchObject({
      accepted: true,
      db: { title: "Front" },
    })
    expect(result.embedded?.title).toBe("Front")
  })

  it("omits unused and derived fields without changing the published object", () => {
    const node = Object.freeze({
      id: "P",
      label: "P",
      x: 20,
      y: 10,
      isPipelineParent: true,
      inPipeline: true,
    })
    const trend = Object.freeze({ nodeId: "P", targetX: 30, targetY: 10 })
    const db = {
      getDiagramTitle: () => "T",
      getAccTitle: () => "",
      getAccDescription: () => "",
      getWardleyData: () => ({
        nodes: [node],
        links: [],
        trends: [trend],
        pipelines: [{ nodeId: "P", componentIds: [] }],
        annotations: [],
        notes: [],
        accelerators: [],
        deaccelerators: [],
        axes: { xLabel: "unused", yLabel: "unused" },
      }),
      getConfig: () => {
        throw new Error("must not read drawing configuration")
      },
    }
    expect(normalizeWardley(db)).toEqual({
      title: "T",
      accTitle: "",
      accDescr: "",
      nodes: [{ id: "P", label: "P", x: 20, y: 10 }],
      links: [],
      trends: [{ nodeId: "P", targetX: 30 }],
      pipelines: [{ nodeId: "P", componentIds: [] }],
      annotations: [],
      notes: [],
      accelerators: [],
      deaccelerators: [],
      axes: {},
    })
    expect(node.isPipelineParent).toBe(true)
    expect(node.inPipeline).toBe(true)
    expect(trend.targetY).toBe(10)
  })

  it("clears the shared builder and common metadata after rejected publication", async () => {
    await summary("db-all-fields")
    expect(
      (await runMermaid(named("gram-invalid-annotation").input)).accepted,
    ).toBe(false)
    const empty = named("header-only").expected
    if (!empty.accepted) throw new Error("expected accepted empty Wardley")
    expect(await summary("header-only")).toEqual(empty.db)
  })

  it("matches every corpus result under its site configuration and standard security levels", async () => {
    for (const fixture of fixtures) {
      const levels =
        fixture.config?.securityLevel === undefined
          ? ["strict", "loose", "antiscript", "sandbox"]
          : [fixture.config.securityLevel]
      for (const securityLevel of levels) {
        const result = await runMermaid(fixture.input, {
          config: { ...fixture.config, securityLevel },
        })
        expect(result.accepted, `${fixture.name}: ${securityLevel}`).toBe(
          fixture.expected.accepted,
        )
        if (result.accepted && fixture.expected.accepted)
          expect(result.db, fixture.name).toEqual(fixture.expected.db)
      }
    }
  }, 60_000)
})
