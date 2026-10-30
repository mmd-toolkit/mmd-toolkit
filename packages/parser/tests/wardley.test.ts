import { describe, expect, it } from "vitest"
import type { Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { WardleyDiagram } from "../src/index.ts"
import { parse } from "../src/index.ts"
import { wardleyLexingOf } from "./helpers/reference-inputs.ts"

describe("wardley fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("wardley")),
    ...(await loadFixtures("common")).filter((f) => f.name.includes("wardley")),
  ]

  /** Corpus input shared with the syntax specification. */
  function fixtureOf(name: string): Fixture {
    const fixture = fixtures.find((f) => f.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return fixture
  }

  /** Authored Wardley body of a corpus case. */
  function diagramOf(name: string): WardleyDiagram {
    const body = parse(fixtureOf(name).input).body
    if (body.type !== "WardleyDiagram") throw new Error("no Wardley diagram")
    return body
  }

  it("keeps the authored fields, coordinate order, signed offsets and pipeline members", () => {
    const body = diagramOf("db-all-fields").body
    expect(body.map((n) => n.type)).toEqual([
      "WardleyTitleStatement",
      "WardleyAccTitleStatement",
      "WardleyAccDescrBlockStatement",
      "WardleySizeStatement",
      "WardleyEvolutionStatement",
      "WardleyAnchorStatement",
      "WardleyComponentStatement",
      "WardleyComponentStatement",
      "WardleyPipelineStatement",
      "WardleyLinkStatement",
      "WardleyEvolveStatement",
      "WardleyAnnotationsStatement",
      "WardleyAnnotationStatement",
      "WardleyNoteStatement",
      "WardleyAcceleratorStatement",
      "WardleyDeacceleratorStatement",
    ])
    expect(body[6]).toMatchObject({
      name: { type: "WardleyIdentifier", name: "A" },
      coordinates: {
        visibility: { raw: "0.4", value: 0.4 },
        evolution: { raw: "0.5", value: 0.5 },
      },
      decorations: [
        {
          type: "WardleyLabelOffsetDecoration",
          negativeX: true,
          offsetX: { raw: "0", value: 0 },
          negativeY: true,
          offsetY: { raw: "2", value: 2 },
        },
        { type: "WardleySourceStrategyDecoration", value: "build" },
        { type: "WardleyInertiaDecoration" },
      ],
    })
    expect(body[8]).toMatchObject({
      parent: { name: "A" },
      body: [
        {
          type: "WardleyPipelineComponent",
          name: { name: "Child" },
          evolution: { raw: "0.6" },
          labelOffset: null,
        },
      ],
    })
    expect(body[11]).toMatchObject({
      coordinates: { visibility: { raw: "10" }, evolution: { raw: "20" } },
    })
  })

  it("keeps both labels and ports, authored arrow glyphs, and separate inertia forms", () => {
    expect(diagramOf("db-inertia-forms").body[1]).toMatchObject({
      decorations: [{ type: "WardleyParenthesizedInertiaDecoration" }],
    })
    const links = diagramOf("db-link-forms").body
    expect(links[0]).toMatchObject({
      fromPort: null,
      arrow: null,
      toPort: null,
      label: null,
    })
    expect(links[3]).toMatchObject({
      arrow: { value: "-.->", kind: "dependency", line: "dotted" },
    })
    expect(links[8]).toMatchObject({ fromPort: "forward", toPort: "backward" })
    expect(links[9]).toMatchObject({
      arrow: {
        value: "+'flow'<>",
        kind: "flow",
        startMarker: "arrow",
        endMarker: "arrow",
        label: { raw: "'flow'", value: "flow" },
      },
      label: { value: " annotation" },
    })
  })

  it("splits composite flow and common forms at authored components", () => {
    const fixture = fixtureOf("directive-flow-before-label")
    const units = wardleyLexingOf(fixture.input)!.units
    expect(
      units
        .filter((u) => u.name.startsWith("flow-"))
        .map((u) => [u.name, u.text]),
    ).toEqual([
      ["flow-open", "+"],
      ["flow-label", "'x'"],
      ["flow-marker", ">"],
    ])
    const tokens = parse(fixture.input).tokens.map((t) => [t.type, t.value])
    expect(tokens).toContainEqual(["Punctuator", "+"])
    expect(tokens).toContainEqual(["String", "'x'"])
    expect(tokens).toContainEqual(["Punctuator", ">"])
  })

  it("keeps evolution gaps and pending forms in the present optional component's named owner", () => {
    const stages = diagramOf("lex-hidden-evolution-members").body[0]
    expect(stages).toMatchObject({
      stages: [
        {
          textBefore: [{ value: "%%{!a}%%" }],
          textBeforeBoundaryMark: [{ value: "%%{!b}%%" }],
          textBeforeBoundary: [{ value: "%%{!c}%%" }],
          textBeforeSecondNameMark: [{ value: "%%{!d}%%" }],
          textBeforeSecondName: [{ value: "%%{!e}%%" }],
          textAfter: [{ value: "%%{!f}%%" }],
        },
        {
          textBefore: [{ value: "%%{!g}%%" }],
          boundary: null,
          secondName: null,
          textAfter: [{ value: "%%{!h}%%" }],
        },
      ],
    })
    expect(diagramOf("lex-hidden-pipeline-before-close").body[1]).toMatchObject(
      {
        body: [
          { type: "WardleyPipelineComponent", textAfter: [] },
          { type: "WardleyIgnoredText", value: "%%{!x}%%" },
        ],
      },
    )
  })
})
