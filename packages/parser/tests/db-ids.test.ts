import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { FlowchartSubgraphStatement, Root } from "../src/index.ts"
import {
  flowchartDbTexts,
  flowchartSubgraphIds,
  parse,
  traverseNodes,
} from "../src/index.ts"
import { ConvertedText } from "./helpers/converted-text.ts"
import { FlowchartSource } from "./helpers/flowchart-source.ts"

// `flowchartSubgraphIds()` gives each subgraph the id that the Db of
// mermaid.js has, in the written form of the values of the tree. On every
// flowchart fixture whose Db has subgraphs, its ids, in the order in which
// the subgraphs are added, are the ids of the Db, where converting the name
// text changes nothing; the fixtures where it changes something are left
// out, and the Db summary of the fixture tests compares them in converted
// form.

/** The subgraph statements of `root`, in source order. */
function subgraphStatementsOf(root: Root): FlowchartSubgraphStatement[] {
  const statements: FlowchartSubgraphStatement[] = []
  traverseNodes(root, {
    enterNode(node) {
      if (node.type === "FlowchartSubgraphStatement") statements.push(node)
    },
    leaveNode() {
      // Nothing to do on the way back.
    },
  })
  return statements
}

/** Whether converting the name text of some subgraph of `root` changes it. */
function conversionChangesANameText(text: string, root: Root): boolean {
  const source = new FlowchartSource(text, root)
  const converted = new ConvertedText(source.diagramText)
  const { subgraphNameTexts } = flowchartDbTexts(root, text)
  return [...subgraphNameTexts.values()].some(
    ({ range, leftOut }) =>
      converted.of(range, leftOut) !==
      source.lexer.textOfRange(range[0], range[1], leftOut),
  )
}

describe("flowchartSubgraphIds", async () => {
  const fixtures = (await loadFixtures("flowchart")).filter(
    (fixture) =>
      fixture.knownDivergence === undefined &&
      fixture.expected.accepted &&
      Array.isArray(fixture.expected.db?.subgraphs) &&
      fixture.expected.db.subgraphs.length > 0,
  )
  const compared = fixtures.filter(
    (fixture) =>
      !conversionChangesANameText(fixture.input, parse(fixture.input)),
  )

  it("compares most of the fixtures whose Db has subgraphs", () => {
    expect(compared.length * 2).toBeGreaterThan(fixtures.length)
  })

  for (const fixture of compared) {
    it(fixture.name, () => {
      const root = parse(fixture.input)
      const subgraphs = fixture.expected.accepted
        ? (fixture.expected.db?.subgraphs as { id: string }[])
        : []
      expect([...flowchartSubgraphIds(root, fixture.input).values()]).toEqual(
        subgraphs.map((subgraph) => subgraph.id),
      )
    })
  }

  it("gives every subgraph statement an id, and none to another diagram", () => {
    const text =
      "flowchart LR\n  subgraph a b\n    subgraph c\n    end\n  end\n"
    const root = parse(text)
    const ids = flowchartSubgraphIds(root, text)
    const [outer, inner] = subgraphStatementsOf(root)
    expect(ids.get(inner)).toBe("c")
    expect(ids.get(outer)).toBe("subGraph1")
    expect(
      flowchartSubgraphIds(parse("sequenceDiagram\n"), "sequenceDiagram\n")
        .size,
    ).toBe(0)
  })
})
