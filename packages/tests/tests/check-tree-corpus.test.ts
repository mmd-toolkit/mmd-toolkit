import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import {
  STRUCTURE_NODE_TYPES,
  VALUE_NODE_TYPES,
} from "../src/check-tree/node-types.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot, loadFixtures } from "../src/index.ts"

// The check of a tree on the recorded trees of the corpus: a tree that
// `ast.json` records satisfies every condition that the specification states
// about a tree, so that its value fields and its ranges are the reading of
// mermaid.js that the Db comparison relies on.

const DIAGRAMS: readonly DiagramType[] = [
  "common",
  "flowchart",
  "sequence",
  "class",
  "state",
  "er",
  "gantt",
  "journey",
  "requirement",
  "mindmap",
  "timeline",
  "sankey",
  "xychart",
  "quadrant",
  "block",
  "kanban",
  "c4",
]

/** The recorded trees of the corpus, with the input of each, by fixture name. */
async function recordedTrees(): Promise<
  { name: string; input: string; tree: CheckedRoot }[]
> {
  const trees = []
  for (const diagram of DIAGRAMS) {
    for (const fixture of await loadFixtures(diagram)) {
      const file = path.join(
        getFixturesRoot(),
        diagram,
        fixture.name,
        "ast.json",
      )
      if (!existsSync(file)) continue
      trees.push({
        name: `${diagram}/${fixture.name}`,
        input: fixture.input,
        tree: JSON.parse(readFileSync(file, "utf8")) as CheckedRoot,
      })
    }
  }
  return trees
}

describe("checkTree on the recorded trees", () => {
  it("finds no problem in any recorded tree", async () => {
    const withProblems: string[] = []
    let checked = 0
    for (const { name, input, tree } of await recordedTrees()) {
      checked++
      const problems = checkTree(input, tree)
      if (problems.length > 0) {
        const [first] = problems
        withProblems.push(
          `${name}: ${problems.length} problems, the first: ${first?.where}: ${first?.message}`,
        )
      }
    }
    expect(checked).toBeGreaterThan(0)
    expect(withProblems).toEqual([])
  }, 60_000)

  it("classifies every node type that a recorded tree has as a value node or not", async () => {
    const unclassified = new Set<string>()
    for (const { tree } of await recordedTrees()) {
      nodesOf(tree).forEach((node: CheckedNode) => {
        if (
          !VALUE_NODE_TYPES.has(node.type) &&
          !STRUCTURE_NODE_TYPES.has(node.type)
        ) {
          unclassified.add(node.type)
        }
      })
    }
    expect([...unclassified]).toEqual([])
  }, 60_000)
})
