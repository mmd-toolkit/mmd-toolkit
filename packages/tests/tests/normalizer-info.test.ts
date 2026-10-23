import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { getFixturesRoot } from "../src/index.ts"
import { runMermaidWithEmbeddedData } from "../src/mermaid.ts"

/** Runs a fixed info corpus input. */
async function runFixture(name: string) {
  return runMermaidWithEmbeddedData(
    readFileSync(
      path.join(getFixturesRoot(), "info", name, "input.mmd"),
      "utf8",
    ),
  )
}

describe("info normalization", () => {
  it("omits the fixed version and the unstored showInfo keyword", async () => {
    expect((await runFixture("header-lf")).outcome).toEqual({
      accepted: true,
      diagramType: "info",
      db: {},
    })
    expect((await runFixture("header-inline-flag")).outcome).toEqual({
      accepted: true,
      diagramType: "info",
      db: {},
    })
  })

  it("omits common AST values that the adapter never publishes", async () => {
    expect((await runFixture("common-all")).outcome).toEqual({
      accepted: true,
      diagramType: "info",
      db: {},
    })
  })

  it("keeps frontmatter values in the shared reading without inventing Db state", async () => {
    const result = await runFixture("frontmatter-title")
    expect(result.outcome).toEqual({
      accepted: true,
      diagramType: "info",
      db: {},
    })
    expect(result.embedded?.title).toBe("Front")
  })

  it("rejects recoverable errors rather than summarizing the recovered AST", async () => {
    expect((await runFixture("error-after-prefix")).outcome.accepted).toBe(
      false,
    )
    expect((await runFixture("header-lf")).outcome).toEqual({
      accepted: true,
      diagramType: "info",
      db: {},
    })
  })
})
