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
    name: "a run between the words of a style of a treemap",
    diagramType: "treemap",
    before: {
      classDefs: [{ id: "c", styles: ["border:2px   solid", "fill :red "] }],
    },
    after: {
      classDefs: [{ id: "c", styles: ["border: 2px solid", "fill: red"] }],
    },
  },
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
  {
    name: "whitespace before the colon and in a color style of a block",
    diagramType: "block",
    before: {
      root: {
        children: [{ id: "K", styles: ["fill:#ff0", " color :red"] }],
      },
    },
    after: {
      root: {
        children: [{ id: "K", styles: ["fill: #ff0", " color : red"] }],
      },
    },
  },
  {
    name: "whitespace before a style of a block that is no label style",
    diagramType: "block",
    before: {
      root: { children: [{ id: "K", styles: ["fill:#ff0", "stroke:red"] }] },
    },
    after: {
      root: { children: [{ id: "K", styles: ["fill: #ff0", " stroke: red"] }] },
    },
  },
  {
    name: "the whitespace around the first colon of a style of a usecase actor",
    diagramType: "usecase",
    before: { actors: [{ id: "A", styles: ["fill   :  red"] }] },
    after: { actors: [{ id: "A", styles: ["fill: red"] }] },
  },
  {
    name: "a run of whitespace before the colon of stroke in a usecase relationship",
    diagramType: "usecase",
    before: { relationships: [{ id: "e1", styles: ["stroke\t :#d33"] }] },
    after: { relationships: [{ id: "e1", styles: ["stroke : #d33"] }] },
  },
  {
    name: "a run of spaces and tabs between the words of a style of a vertex",
    before: { vertices: [{ id: "A", styles: ["border:2px   solid\tred"] }] },
    after: { vertices: [{ id: "A", styles: ["border: 2px solid red"] }] },
  },
  {
    name: "a run between the words of a style that has no colon",
    diagramType: "classDiagram",
    before: { classes: [{ id: "A", styles: ["fill   #f00"] }] },
    after: { classes: [{ id: "A", styles: ["fill #f00"] }] },
  },
  {
    name: "a run beside a string, a comment, and a url in a style of a state",
    diagramType: "stateDiagram",
    before: {
      states: [
        {
          id: "A",
          styles: ['font:12px   "A   B"   /* c   d */   url(a   b.png)   x'],
        },
      ],
    },
    after: {
      states: [
        {
          id: "A",
          styles: ['font: 12px "A   B" /* c   d */ url(a   b.png) x'],
        },
      ],
    },
  },
  {
    name: "a run between the words of a style of a usecase actor",
    diagramType: "usecase",
    before: { actors: [{ id: "A", styles: ["border:2px   solid"] }] },
    after: { actors: [{ id: "A", styles: ["border: 2px solid"] }] },
  },
  {
    name: "a run after the space that ends a hexadecimal escape",
    before: {
      vertices: [{ id: "A", styles: ["font-family:Arial\\20   Black"] }],
    },
    after: {
      vertices: [{ id: "A", styles: ["font-family: Arial\\20  Black"] }],
    },
  },
  {
    name: "a run after the seventh digit that follows a hexadecimal escape",
    before: {
      vertices: [{ id: "A", styles: ["font-family:Arial\\0000201   Black"] }],
    },
    after: {
      vertices: [{ id: "A", styles: ["font-family: Arial\\0000201 Black"] }],
    },
  },
  {
    name: "the whitespace around the colon of a style that starts with it",
    before: { vertices: [{ id: "A", styles: [":  red   x"] }] },
    after: { vertices: [{ id: "A", styles: [": red x"] }] },
  },
  {
    name: "a run between an escaped space and the colon",
    before: { vertices: [{ id: "A", styles: ["fill\\   :red   x"] }] },
    after: { vertices: [{ id: "A", styles: ["fill\\ : red x"] }] },
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
    name: "whitespace added before a color style of a block",
    diagramType: "block",
    before: {
      root: { children: [{ id: "K", styles: ["color:red"] }] },
    },
    after: {
      root: { children: [{ id: "K", styles: [" color: red"] }] },
    },
  },
  {
    name: "whitespace added before a text-align style of a block",
    diagramType: "block",
    before: {
      root: { children: [{ id: "K", styles: ["text-align:left"] }] },
    },
    after: {
      root: { children: [{ id: "K", styles: [" text-align: left"] }] },
    },
  },
  {
    name: "whitespace taken away before the colon of color in a block",
    diagramType: "block",
    before: {
      root: { children: [{ id: "K", styles: ["color :red"] }] },
    },
    after: {
      root: { children: [{ id: "K", styles: ["color: red"] }] },
    },
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
  {
    name: "the whitespace before the colon of stroke in a usecase class",
    diagramType: "usecase",
    before: { classDefs: [{ id: "c", styles: ["stroke:#d33"] }] },
    after: { classDefs: [{ id: "c", styles: ["stroke : #d33"] }] },
  },
  {
    name: "the whitespace before the colon of stroke in a usecase relationship",
    diagramType: "usecase",
    before: { relationships: [{ id: "e1", styles: ["stroke:#d33"] }] },
    after: { relationships: [{ id: "e1", styles: ["stroke : #d33"] }] },
  },
  {
    name: "a run changed inside a string of a style",
    diagramType: "stateDiagram",
    before: { states: [{ id: "A", styles: ['font-family:"A   B"'] }] },
    after: { states: [{ id: "A", styles: ['font-family: "A B"'] }] },
  },
  {
    name: "a run changed inside a comment of a style",
    diagramType: "stateDiagram",
    before: { states: [{ id: "A", styles: ["border:1px /* a   b */"] }] },
    after: { states: [{ id: "A", styles: ["border: 1px /* a b */"] }] },
  },
  {
    name: "a run changed inside the parentheses of url",
    diagramType: "classDiagram",
    before: { classes: [{ id: "A", styles: ["background:url(a   b.png)"] }] },
    after: { classes: [{ id: "A", styles: ["background: url(a b.png)"] }] },
  },
  {
    name: "a run changed after a backslash",
    before: { vertices: [{ id: "A", styles: ["font-family:a\\   b"] }] },
    after: { vertices: [{ id: "A", styles: ["font-family: a\\ b"] }] },
  },
  {
    name: "a run collapsed after the space that ends a hexadecimal escape",
    before: {
      vertices: [{ id: "A", styles: ["font-family:Arial\\20  Black"] }],
    },
    after: {
      vertices: [{ id: "A", styles: ["font-family: Arial\\20 Black"] }],
    },
  },
  {
    name: "the escaped space before the colon taken away",
    before: { vertices: [{ id: "A", styles: ["fill\\ :red"] }] },
    after: { vertices: [{ id: "A", styles: ["fill\\:red"] }] },
  },
  {
    name: "whitespace added between two words of a style",
    diagramType: "classDiagram",
    before: { classes: [{ id: "A", styles: ["fill#f00"] }] },
    after: { classes: [{ id: "A", styles: ["fill #f00"] }] },
  },
  {
    name: "a run changed between the words of a style of a diagram type that keeps it",
    diagramType: "kanban",
    before: { classDefs: [{ id: "c", styles: ["border:2px   solid"] }] },
    after: { classDefs: [{ id: "c", styles: ["border: 2px solid"] }] },
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
