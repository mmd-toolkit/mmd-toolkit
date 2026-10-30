import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import { embeddedValuesOf, loadFixture } from "../src/index.ts"
import { cssSupportsColor } from "../src/normalizers/browser-stand-ins.ts"
import { recordedTree } from "./check-tree-recorded.ts"
import { AGENTFLOW_CASES, buildAgentflowCase } from "./agentflow-cases.ts"

/** Mermaid's recorded result and the hand-supplied productions are independent. */
describe("agentflow Db from hand-built trees", () => {
  for (const testCase of AGENTFLOW_CASES.filter(
    (candidate) => candidate.db !== false,
  ))
    it(testCase.fixture, async () => {
      const fixture = await loadFixture("agentflow", testCase.fixture)
      const result = fixture.specified ?? fixture.expected
      const embedded = embeddedValuesOf(fixture, result)
      if (!result.accepted || embedded === undefined)
        throw new Error("a Db case needs an accepted result")
      const { tree } = buildAgentflowCase(testCase, fixture.input)
      expect(
        dbFromTree(
          fixture.input,
          tree as unknown as DbTreeRoot,
          embedded,
          cssSupportsColor,
        ),
        fixture.name,
      ).toEqual(result.db)
    })
})

// Frontmatter removal includes all trailing trivia, at each default-size branch.
for (const name of [
  "frontmatter-extra-trivia-below",
  "frontmatter-extra-trivia-boundary",
  "frontmatter-extra-whitespace-line-boundary",
  "frontmatter-extra-trivia-above",
  "frontmatter-extra-trivia-indent-above",
])
  it(`builds the recorded Db of ${name}`, async () => {
    const fixture = await loadFixture("agentflow", name)
    const embedded = embeddedValuesOf(fixture, fixture.expected)
    if (!fixture.expected.accepted || embedded === undefined)
      throw new Error("the boundary fixture needs a Db")
    const { input, tree } = recordedTree("agentflow", name)
    expect(
      dbFromTree(
        input,
        tree as unknown as DbTreeRoot,
        embedded,
        cssSupportsColor,
      ),
    ).toEqual(fixture.expected.db)
  })
