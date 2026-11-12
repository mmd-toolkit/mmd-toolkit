import { describe, expect, it } from "vitest"
import type { DbSummary } from "@mmd-toolkit/tests"
import { colorCaseDbForFormattingComparison } from "./color-case-differences.ts"

/** The Db of a flowchart with one vertex that has the given styles and text. */
function vertex(styles: readonly string[], text = "A"): DbSummary {
  return { vertices: [{ id: "A", text, styles }], edges: [], classDefs: [] }
}

/** A Db, its diagram type, and what the comparison gives for the printed Db. */
interface Case {
  readonly name: string
  readonly type: string
  readonly before: DbSummary
  readonly after: DbSummary
  readonly compared: DbSummary
}

const restored: readonly Case[] = [
  {
    name: "the colors of a style of a vertex",
    type: "flowchart-v2",
    before: vertex(["fill:#F9F", "stroke:#ABCDEF"]),
    after: vertex(["fill:#f9f", "stroke:#abcdef"]),
    compared: vertex(["fill:#F9F", "stroke:#ABCDEF"]),
  },
  {
    name: "colors of 4 and 8 digits",
    type: "flowchart-v2",
    before: vertex(["fill:#ABCD", "stroke:#ABCDEF12"]),
    after: vertex(["fill:#abcd", "stroke:#abcdef12"]),
    compared: vertex(["fill:#ABCD", "stroke:#ABCDEF12"]),
  },
  {
    name: "the color of a style with other differences left to the others",
    type: "flowchart-v2",
    before: vertex(["fill :#F9F"]),
    after: vertex(["fill: #f9f"]),
    compared: vertex(["fill: #F9F"]),
  },
  {
    name: "the colors between the parentheses of a function",
    type: "classDiagram",
    before: { classes: [{ id: "A", styles: ["fill:rgb(#F9F, #ABC)"] }] },
    after: { classes: [{ id: "A", styles: ["fill:rgb(#f9f, #abc)"] }] },
    compared: { classes: [{ id: "A", styles: ["fill:rgb(#F9F, #ABC)"] }] },
  },
  {
    name: "the styles of a class of an ER diagram",
    type: "er",
    before: { classes: [{ id: "c", styles: ["fill:#DEADBE"] }] },
    after: { classes: [{ id: "c", styles: ["fill:#deadbe"] }] },
    compared: { classes: [{ id: "c", styles: ["fill:#DEADBE"] }] },
  },
  {
    name: "the colors of a point of a quadrant chart",
    type: "quadrantChart",
    before: {
      points: [{ text: "P", color: "#FF3300", strokeColor: "#ABCDEF" }],
    },
    after: {
      points: [{ text: "P", color: "#ff3300", strokeColor: "#abcdef" }],
    },
    compared: {
      points: [{ text: "P", color: "#FF3300", strokeColor: "#ABCDEF" }],
    },
  },
  {
    name: "the properties of a style of a Venn diagram",
    type: "venn",
    before: { styles: [{ target: "A", styles: { fill: "#F9F" } }] },
    after: { styles: [{ target: "A", styles: { fill: "#f9f" } }] },
    compared: { styles: [{ target: "A", styles: { fill: "#F9F" } }] },
  },
]

const kept: readonly Case[] = [
  {
    name: "a run of 5 digits printed in lower case",
    type: "flowchart-v2",
    before: vertex(["fill:#ABCDE"]),
    after: vertex(["fill:#abcde"]),
    compared: vertex(["fill:#abcde"]),
  },
  {
    name: "a word that a letter follows printed in lower case",
    type: "flowchart-v2",
    before: vertex(["fill:#ABC-x"]),
    after: vertex(["fill:#abc-x"]),
    compared: vertex(["fill:#abc-x"]),
  },
  {
    name: "the argument of url( printed in lower case",
    type: "classDiagram",
    before: { classes: [{ id: "A", styles: ["fill:url(#ABC)"] }] },
    after: { classes: [{ id: "A", styles: ["fill:url(#abc)"] }] },
    compared: { classes: [{ id: "A", styles: ["fill:url(#abc)"] }] },
  },
  {
    name: "a string printed in lower case",
    type: "classDiagram",
    before: { classes: [{ id: "A", styles: ['content:"#ABC"'] }] },
    after: { classes: [{ id: "A", styles: ['content:"#abc"'] }] },
    compared: { classes: [{ id: "A", styles: ['content:"#abc"'] }] },
  },
  {
    name: "a color that became another color",
    type: "flowchart-v2",
    before: vertex(["fill:#F9F"]),
    after: vertex(["fill:#f9e"]),
    compared: vertex(["fill:#f9e"]),
  },
  {
    name: "a color that is lost",
    type: "flowchart-v2",
    before: vertex(["fill:#F9F"]),
    after: vertex(["fill:red"]),
    compared: vertex(["fill:red"]),
  },
  {
    name: "a color of a text that is no style",
    type: "flowchart-v2",
    before: vertex(["fill:red"], "color #ABC"),
    after: vertex(["fill:red"], "color #abc"),
    compared: vertex(["fill:red"], "color #abc"),
  },
  {
    name: "a color of a key that holds no style",
    type: "quadrantChart",
    before: { points: [{ text: "#ABC", color: "#FF3300" }] },
    after: { points: [{ text: "#abc", color: "#ff3300" }] },
    compared: { points: [{ text: "#abc", color: "#FF3300" }] },
  },
]

describe("the case of the colors of the styles that the formatter prints in lower case", () => {
  it.each(restored)("restores $name", ({ type, before, after, compared }) => {
    expect(colorCaseDbForFormattingComparison(before, after, type)).toEqual(
      compared,
    )
  })

  it.each(kept)(
    "keeps $name as a difference",
    ({ type, before, after, compared }) => {
      expect(colorCaseDbForFormattingComparison(before, after, type)).toEqual(
        compared,
      )
    },
  )

  it("passes a Db that is missing through", () => {
    expect(colorCaseDbForFormattingComparison(null, null, "venn")).toBeNull()
    expect(
      colorCaseDbForFormattingComparison(null, vertex(["fill:#f9f"]), "venn"),
    ).toEqual(vertex(["fill:#f9f"]))
    expect(
      colorCaseDbForFormattingComparison(vertex(["fill:#F9F"]), null, "venn"),
    ).toBeNull()
  })
})
