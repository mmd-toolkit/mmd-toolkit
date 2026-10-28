/**
 * Checks `subgraphIdsOf` of `src/utils/subgraph-ids.ts`, the Db id of each
 * subgraph derived from the tree, against the Db that mermaid.js gave for the
 * fixtures of the conformance corpus that hold the claims about the id, each
 * named here: a name with whitespace after it, a string as the name, a title,
 * and empty description blocks after the name (before the first, between two,
 * and before a `;`), which the specification claims (ast/flowchart.md,
 * FlowchartSubgraphStatement); a directive in the name (diagrams/flowchart.md,
 * Subgraph members); and the number in a generated id, also of two nested
 * subgraphs (the tests package, docs/db-from-tree/flowchart.md, Subgraphs).
 */
import { describe, expect, it } from "vitest"
import type { Fixture } from "@mmd-toolkit/tests"
import { loadFixture } from "@mmd-toolkit/tests"
import { parse } from "@mmd-toolkit/parser"
import { MermaidSourceCode } from "../src/index.ts"
import { subgraphIdsOf } from "../src/utils/subgraph-ids.ts"
import { withoutByteOrderMark } from "./helpers.ts"

/** The fixtures of the flowchart that hold the claims, with the claim of each. */
const CASES: readonly { readonly claim: string; readonly name: string }[] = [
  {
    claim: "a name with whitespace after it",
    name: "db-subgraph-name-trailing-space",
  },
  {
    claim: "a string as the name, with whitespace after it",
    name: "db-subgraph-string-name-trailing-space",
  },
  {
    claim: "a directive in the name",
    name: "db-subgraph-name-directive-trailing-space",
  },
  {
    claim: "a title, with whitespace before the `[`",
    name: "db-subgraph-title-spaces-before-bracket",
  },
  {
    claim: "whitespace before the first empty description block",
    name: "db-subgraph-name-space-before-empty-description-block",
  },
  {
    claim: "whitespace between two empty description blocks",
    name: "db-subgraph-name-space-between-empty-description-blocks",
  },
  {
    claim: "whitespace between an empty description block and a `;`",
    name: "db-subgraph-name-space-after-empty-description-block-before-semicolon",
  },
  {
    claim: "the number of a generated id",
    name: "db-subgraph-counter",
  },
  {
    claim: "the numbers of two nested subgraphs with generated ids",
    name: "db-subgraph-counter-nested",
  },
]

/** The ids of the subgraphs in the Db that mermaid.js gave, in the order it added them. */
function dbSubgraphIds(fixture: Fixture): string[] {
  const { expected } = fixture
  if (!expected.accepted || expected.db === null) {
    throw new Error(`${fixture.name} is not accepted`)
  }
  const { subgraphs } = expected.db
  if (!Array.isArray(subgraphs)) {
    throw new Error(`${fixture.name} has no subgraphs in its Db`)
  }
  return subgraphs.flatMap((subgraph) =>
    typeof subgraph === "object" &&
    subgraph !== null &&
    !Array.isArray(subgraph) &&
    typeof subgraph.id === "string"
      ? [subgraph.id]
      : [],
  )
}

describe("the ids of the subgraphs", () => {
  it.each(CASES.map((each) => [each.claim, each.name]))(
    "%s is as in the Db of mermaid.js",
    async (_claim, name) => {
      const fixture = await loadFixture("flowchart", name)
      expect(fixture.knownDivergence).toBeUndefined()
      const ids = dbSubgraphIds(fixture)
      expect(ids.length).toBeGreaterThan(0)
      const text = withoutByteOrderMark(fixture.input)
      const sourceCode = new MermaidSourceCode({ text, ast: parse(text) })
      expect([...subgraphIdsOf(sourceCode).values()]).toEqual(ids)
    },
  )
})
