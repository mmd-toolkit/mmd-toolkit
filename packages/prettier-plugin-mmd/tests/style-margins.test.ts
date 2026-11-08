import { describe, expect, it } from "vitest"
import type { DbSummary } from "@mmd-toolkit/tests"
import { styleDbForFormattingComparison } from "./style-margins.ts"

/** Two Dbs of a text, before and after it is formatted. */
interface DbPair {
  readonly name: string
  readonly diagramType?: string
  readonly before: DbSummary
  readonly after: DbSummary
}

const restored: readonly DbPair[] = [
  {
    name: "the whitespace before the colon of stroke in a style of a vertex",
    before: { vertices: [{ id: "A", styles: ["stroke :#f00"] }] },
    after: { vertices: [{ id: "A", styles: ["stroke: #f00"] }] },
  },
  {
    name: "the whitespace before the colon of stroke where no link is styled",
    diagramType: "stateDiagram",
    before: { classDefs: [{ id: "c", styles: ["stroke :#f00"] }] },
    after: { classDefs: [{ id: "c", styles: ["stroke: #f00"] }] },
  },
  {
    name: "a run of whitespace before the colon of stroke in a link",
    before: { edges: [{ id: "L", style: ["stroke\t :#f00"] }] },
    after: { edges: [{ id: "L", style: ["stroke : #f00"] }] },
  },
  {
    name: "the whitespace around the first colon and the comma",
    before: {
      vertices: [{ id: "A", styles: ["fill:#f00", " stroke:#333"] }],
    },
    after: {
      vertices: [{ id: "A", styles: ["fill: #f00", " stroke: #333"] }],
    },
  },
  {
    name: "the whitespace at the ends of a style",
    before: { classDefs: [{ id: "c", styles: ["fill:#f00", "color:red "] }] },
    after: { classDefs: [{ id: "c", styles: ["fill:#f00", " color:red"] }] },
  },
  {
    name: "the styles of a link",
    before: { edges: [{ id: "L", style: ["stroke:#f00", " color:red"] }] },
    after: { edges: [{ id: "L", style: ["stroke: #f00", " color: red"] }] },
  },
  {
    name: "a run of whitespace before a style of a link that starts with stroke:",
    before: { edges: [{ id: "L", style: ["fill:none", "  stroke:#f00"] }] },
    after: { edges: [{ id: "L", style: ["fill: none", " stroke: #f00"] }] },
  },
  {
    name: "the whitespace before a style of a link that does not start with stroke:",
    before: { edges: [{ id: "L", style: ["stroke:#f00", "color:red"] }] },
    after: { edges: [{ id: "L", style: ["stroke: #f00", " color: red"] }] },
  },
  {
    name: "the amount of whitespace in a value of a stroke that is whitespace only",
    before: { edges: [{ id: "L", style: ["stroke:\t", " stroke:#f00"] }] },
    after: { edges: [{ id: "L", style: ["stroke: ", " stroke: #f00"] }] },
  },
  {
    name: "the whitespace before a style that starts with stroke: in a class",
    diagramType: "agentflow",
    before: { classDefs: [{ id: "c", styles: ["fill:none", "stroke:#f00"] }] },
    after: {
      classDefs: [{ id: "c", styles: ["fill: none", " stroke: #f00"] }],
    },
  },
  {
    name: "the amount of whitespace after a backslash that ends a style of a link",
    before: { edges: [{ id: "L", style: ["stroke-width:4px\\\t"] }] },
    after: { edges: [{ id: "L", style: ["stroke-width: 4px\\ "] }] },
  },
  {
    name: "whitespace after two backslashes that end a style of a link",
    before: { edges: [{ id: "L", style: ["stroke-width:4px\\\\ "] }] },
    after: { edges: [{ id: "L", style: ["stroke-width: 4px\\\\"] }] },
  },
  {
    name: "whitespace after a backslash that ends a style of a vertex",
    before: { vertices: [{ id: "A", styles: ["stroke-width:4px\\ "] }] },
    after: { vertices: [{ id: "A", styles: ["stroke-width: 4px\\"] }] },
  },
  {
    name: "whitespace after a backslash that ends a style of a class",
    diagramType: "agentflow",
    before: { classDefs: [{ id: "c", styles: ["stroke-width:4px\\ "] }] },
    after: { classDefs: [{ id: "c", styles: ["stroke-width: 4px\\"] }] },
  },
  {
    name: "whitespace after a backslash that ends a style of a block class",
    diagramType: "block",
    before: { classes: [{ id: "c", styles: ["stroke-width:3px\\ "] }] },
    after: { classes: [{ id: "c", styles: ["stroke-width: 3px\\"] }] },
  },
]

const kept: readonly DbPair[] = [
  {
    name: "no whitespace before the colon of stroke in a link",
    before: { edges: [{ id: "L", style: ["stroke :#f00"] }] },
    after: { edges: [{ id: "L", style: ["stroke: #f00"] }] },
  },
  {
    name: "no whitespace before the colon of stroke in the default of the links",
    before: { edgeDefaults: { style: ["stroke :#f00"] } },
    after: { edgeDefaults: { style: ["stroke: #f00"] } },
  },
  {
    name: "no whitespace before the colon of stroke in a class",
    diagramType: "agentflow",
    before: { classDefs: [{ id: "c", styles: ["stroke :#f00"] }] },
    after: { classDefs: [{ id: "c", styles: ["stroke: #f00"] }] },
  },
  {
    name: "whitespace taken away before a style of a link that starts with stroke:",
    before: { edges: [{ id: "L", style: [" stroke:#f00"] }] },
    after: { edges: [{ id: "L", style: ["stroke: #f00"] }] },
  },
  {
    name: "whitespace added before a style of a link that starts with stroke:",
    before: { edges: [{ id: "L", style: ["stroke:#f00"] }] },
    after: { edges: [{ id: "L", style: [" stroke: #f00"] }] },
  },
  {
    name: "whitespace added before a style of the default of the links that starts with stroke:",
    before: { edgeDefaults: { style: ["stroke:#f00"] } },
    after: { edgeDefaults: { style: [" stroke: #f00"] } },
  },
  {
    name: "whitespace taken away from a value of a stroke that is whitespace only",
    before: { edges: [{ id: "L", style: ["stroke: "] }] },
    after: { edges: [{ id: "L", style: ["stroke:"] }] },
  },
  {
    name: "whitespace taken away after a backslash that ends a style of a link",
    before: { edges: [{ id: "L", style: ["stroke-width:4px\\ "] }] },
    after: { edges: [{ id: "L", style: ["stroke-width: 4px\\"] }] },
  },
  {
    name: "whitespace taken away after a backslash that ends a style of the default of the links",
    before: { edgeDefaults: { style: ["stroke-width:4px\\ "] } },
    after: { edgeDefaults: { style: ["stroke-width: 4px\\"] } },
  },
  {
    name: "whitespace taken away after a backslash that ends a style of a block",
    diagramType: "block",
    before: {
      root: { children: [{ id: "A", styles: ["stroke-width:3px\\ "] }] },
    },
    after: {
      root: { children: [{ id: "A", styles: ["stroke-width: 3px\\"] }] },
    },
  },
  {
    name: "whitespace taken away after a backslash that ends a style of a class",
    diagramType: "classDiagram",
    before: { classes: [{ id: "A", styles: ["fill:abc\\ "] }] },
    after: { classes: [{ id: "A", styles: ["fill: abc\\"] }] },
  },
  {
    name: "a changed value",
    before: { vertices: [{ id: "A", styles: ["fill:#f00"] }] },
    after: { vertices: [{ id: "A", styles: ["fill: #f01"] }] },
  },
  {
    name: "a changed name",
    before: { vertices: [{ id: "A", styles: ["fill:#f00"] }] },
    after: { vertices: [{ id: "A", styles: ["stroke: #f00"] }] },
  },
  {
    name: "whitespace inside a value",
    before: { vertices: [{ id: "A", styles: ["font-family:a  b"] }] },
    after: { vertices: [{ id: "A", styles: ["font-family: a b"] }] },
  },
  {
    name: "the fill:none that a link gets where no style starts with fill",
    before: { edges: [{ id: "L", style: ["stroke:#f00", "fill:red"] }] },
    after: {
      edges: [{ id: "L", style: ["stroke: #f00", " fill:red", "fill:none"] }],
    },
  },
  {
    name: "the whitespace of a text that is no style",
    before: { vertices: [{ id: "A", text: "a:b" }] },
    after: { vertices: [{ id: "A", text: "a: b" }] },
  },
]

describe("the margins of styles that the formatter changes", () => {
  it.each(restored)(
    "restores $name",
    ({ before, after, diagramType = "flowchart-v2" }) => {
      expect(
        styleDbForFormattingComparison(before, after, diagramType),
      ).toEqual(before)
    },
  )

  it.each(kept)(
    "keeps $name as a difference",
    ({ before, after, diagramType = "flowchart-v2" }) => {
      expect(
        styleDbForFormattingComparison(before, after, diagramType),
      ).toEqual(after)
    },
  )

  it("passes a Db that is missing through", () => {
    expect(
      styleDbForFormattingComparison(null, null, "flowchart-v2"),
    ).toBeNull()
  })
})
