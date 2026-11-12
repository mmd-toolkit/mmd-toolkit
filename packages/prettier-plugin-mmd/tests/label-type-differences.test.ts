import { describe, expect, it } from "vitest"
import type { DbSummary } from "@mmd-toolkit/tests"
import { labelTypeDbForFormattingComparison } from "./label-type-differences.ts"

/** Two Dbs of a text, before and after it is formatted. */
interface DbPair {
  readonly name: string
  readonly before: DbSummary
  readonly after: DbSummary
}

/** The Db of a diagram with one vertex, with the given `labelType` and text. */
function vertex(labelType: string, text: string): DbSummary {
  return { vertices: [{ id: "A", labelType, text }], edges: [], subgraphs: [] }
}

/** The Db of a diagram with one edge, with the given `labelType` and text. */
function edge(labelType: string, text: string): DbSummary {
  return {
    vertices: [],
    edges: [{ start: "A", end: "B", labelType, text }],
    subgraphs: [],
  }
}

/** The Db of a diagram with one subgraph, with the given `labelType` and title. */
function subgraph(labelType: string, title: string): DbSummary {
  return {
    vertices: [],
    edges: [],
    subgraphs: [{ id: "S", labelType, title }],
  }
}

const restored: readonly DbPair[] = [
  {
    name: "the label of a vertex that lost its quotes",
    before: vertex("string", "x"),
    after: vertex("text", "x"),
  },
  {
    name: "the label of a vertex that got quotes",
    before: vertex("text", "x"),
    after: vertex("string", "x"),
  },
  {
    name: "the label of an edge",
    before: edge("string", "y"),
    after: edge("text", "y"),
  },
  {
    name: "the title of a subgraph",
    before: subgraph("string", "t"),
    after: subgraph("text", "t"),
  },
]

const kept: readonly DbPair[] = [
  {
    name: "a label that became markdown",
    before: vertex("text", "x"),
    after: vertex("markdown", "x"),
  },
  {
    name: "a label that stopped being markdown",
    before: vertex("markdown", "x"),
    after: vertex("string", "x"),
  },
  {
    name: "a changed text with the same labelType",
    before: vertex("text", "x"),
    after: vertex("text", "y"),
  },
  {
    name: "a different number of vertices",
    before: vertex("string", "x"),
    after: {
      vertices: [
        { id: "A", labelType: "text", text: "x" },
        { id: "B", labelType: "text", text: "B" },
      ],
      edges: [],
      subgraphs: [],
    },
  },
]

describe("the labelType of the labels that the formatter prints with or without quotes", () => {
  it.each(restored)("restores $name", ({ before, after }) => {
    expect(labelTypeDbForFormattingComparison(before, after)).toEqual(before)
  })

  it.each(kept)("keeps $name as a difference", ({ before, after }) => {
    expect(labelTypeDbForFormattingComparison(before, after)).toEqual(after)
  })

  it("restores the labelType and keeps a changed text beside it", () => {
    expect(
      labelTypeDbForFormattingComparison(
        vertex("string", "x"),
        vertex("text", "y"),
      ),
    ).toEqual(vertex("string", "y"))
  })

  it("restores only the labelType and keeps a difference beside it", () => {
    const before = vertex("string", "x")
    const after: DbSummary = {
      vertices: [{ id: "A", labelType: "text", text: "x", type: "square" }],
      edges: [],
      subgraphs: [],
    }
    expect(labelTypeDbForFormattingComparison(before, after)).toEqual({
      vertices: [{ id: "A", labelType: "string", text: "x", type: "square" }],
      edges: [],
      subgraphs: [],
    })
  })

  it("passes a Db that is missing through", () => {
    expect(labelTypeDbForFormattingComparison(null, null)).toBeNull()
    expect(
      labelTypeDbForFormattingComparison(null, vertex("text", "x")),
    ).toEqual(vertex("text", "x"))
    expect(
      labelTypeDbForFormattingComparison(vertex("text", "x"), null),
    ).toBeNull()
  })
})
