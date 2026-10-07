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
    let rejected = 0
    for (const diagram of DIAGRAMS) {
      for (const fixture of await loadFixtures(diagram)) {
        const file = path.join(
          getFixturesRoot(),
          diagram,
          fixture.name,
          "ast.json",
        )
        if (!existsSync(file)) continue
        const tree = JSON.parse(readFileSync(file, "utf8")) as DbTreeRoot
        const limited =
          !fixture.expected.accepted &&
          fixture.expected.error.message.startsWith(EDGE_LIMIT_MESSAGE)
        if (limited) rejected++
        if (exceedsMaxEdges(tree, fixture.config) !== limited) {
          differing.push(`${diagram}/${fixture.name}`)
        }
      }
    }
    expect(differing).toEqual([])
    // The corpus has the rejections that this test is about.
    expect(rejected).toBeGreaterThan(0)
  }, 60_000)
})
