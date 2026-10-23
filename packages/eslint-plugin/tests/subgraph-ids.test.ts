/**
 * Checks `subgraphIdsOf` of `src/utils/subgraph-ids.ts`, the Db id of each
 * subgraph derived from the tree, against the Db that mermaid.js gave for the
 * fixtures of the conformance corpus whose Db has subgraphs and for which the
 * specification does not depart from mermaid.js. They hold the claims of the
 * specification about the id: a name with whitespace, a title, a string, a
 * directive, empty description blocks after the name, nested subgraphs.
 */
import { describe, expect, it } from "vitest"
import type { Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import { parse } from "@mmd-toolkit/parser"
import { MermaidSourceCode } from "../src/index.ts"
import { subgraphIdsOf } from "../src/utils/subgraph-ids.ts"
import { withoutByteOrderMark } from "./helpers.ts"

/** The ids of the subgraphs in the Db that mermaid.js gave, in the order it added them; null when there are none. */
function dbSubgraphIds(fixture: Fixture): string[] | null {
  const { expected } = fixture
  if (!expected.accepted || expected.db === null) return null
  const { subgraphs } = expected.db
  if (!Array.isArray(subgraphs) || subgraphs.length === 0) return null
  return subgraphs.flatMap((subgraph) =>
    typeof subgraph === "object" &&
    subgraph !== null &&
    !Array.isArray(subgraph) &&
    typeof subgraph.id === "string"
      ? [subgraph.id]
      : [],
  )
}

const cases = (await loadFixtures("flowchart")).flatMap((fixture) => {
  const ids = dbSubgraphIds(fixture)
  if (ids === null || fixture.knownDivergence !== undefined) return []
  return [{ name: fixture.name, input: fixture.input, ids }]
})

describe("the ids of the subgraphs", () => {
  it("are tested on some fixtures", () => {
    expect(cases.length).toBeGreaterThan(0)
  })

  it.each(cases.map((fixtureCase) => [fixtureCase.name, fixtureCase]))(
    "%s is as in the Db of mermaid.js",
    (_name, fixtureCase) => {
      const text = withoutByteOrderMark(fixtureCase.input)
      const sourceCode = new MermaidSourceCode({ text, ast: parse(text) })
      expect([...subgraphIdsOf(sourceCode).values()]).toEqual(fixtureCase.ids)
    },
  )
})
