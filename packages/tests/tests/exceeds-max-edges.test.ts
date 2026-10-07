import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import type { DbTreeRoot, DiagramType } from "../src/index.ts"
import { exceedsMaxEdges, getFixturesRoot, loadFixtures } from "../src/index.ts"

/** The diagram types whose fixtures can carry a flowchart. */
const DIAGRAMS: readonly DiagramType[] = ["common", "flowchart"]

/** The start of the message of mermaid.js for more edges than `maxEdges`. */
const EDGE_LIMIT_MESSAGE = "Edge limit exceeded"

describe("exceedsMaxEdges", () => {
  it("agrees with the edge limit rejections of mermaid.js on every recorded flowchart tree", async () => {
    const differing: string[] = []
    const withoutTree: string[] = []
    let rejected = 0
    for (const diagram of DIAGRAMS) {
      for (const fixture of await loadFixtures(diagram)) {
        const directory = path.join(getFixturesRoot(), diagram, fixture.name)
        const limited =
          !fixture.expected.accepted &&
          fixture.expected.error.message.startsWith(EDGE_LIMIT_MESSAGE)
        const file = path.join(directory, "ast.json")
        if (!existsSync(file)) {
          // The check is of the tree, so a rejection for the edge limit that
          // has none (nor an error of the parser) is a gap, not a skip.
          if (
            limited &&
            !existsSync(path.join(directory, "parse-error.json"))
          ) {
            withoutTree.push(`${diagram}/${fixture.name}`)
          }
          continue
        }
        const tree = JSON.parse(readFileSync(file, "utf8")) as DbTreeRoot
        if (limited) rejected++
        if (exceedsMaxEdges(tree, fixture.config) !== limited) {
          differing.push(`${diagram}/${fixture.name}`)
        }
      }
    }
    expect(withoutTree).toEqual([])
    expect(differing).toEqual([])
    // The corpus has the rejections that this test is about.
    expect(rejected).toBeGreaterThan(0)
  }, 60_000)
})
