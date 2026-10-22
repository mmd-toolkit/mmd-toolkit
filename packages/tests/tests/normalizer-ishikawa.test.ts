import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { getFixturesRoot, loadFixtures } from "../src/index.ts"
import { runMermaidWithEmbeddedData } from "../src/mermaid.ts"
import { normalizeIshikawa } from "../src/normalizers/ishikawa.ts"
import type { MermaidConfig } from "../src/types.ts"

/** Runs one fixed ishikawa corpus input under the given site settings. */
async function runFixture(name: string, config: MermaidConfig = {}) {
  return runMermaidWithEmbeddedData(
    readFileSync(
      path.join(getFixturesRoot(), "ishikawa", name, "input.mmd"),
      "utf8",
    ),
    { config },
  )
}

/** The summary of an accepted ishikawa fixture. */
async function summary(name: string, config: MermaidConfig = {}) {
  const { outcome } = await runFixture(name, config)
  if (!outcome.accepted || outcome.db === null) throw new Error("expected a Db")
  return outcome.db
}

describe("the summary of an ishikawa diagram", () => {
  it("keeps the renderer's recursive text tree and root-derived title", async () => {
    expect(await summary("db-all-fields")).toEqual({
      title: "Effect",
      accTitle: "",
      accDescr: "",
      root: {
        text: "Effect",
        children: [
          { text: "Cause B", children: [{ text: "Detail B", children: [] }] },
          { text: "Cause A", children: [{ text: "Detail A", children: [] }] },
        ],
      },
    })
    expect(
      (await runFixture("db-data-block-is-text")).embedded?.dataBlockEffects,
    ).toEqual([])
  })

  it("drops parse state and additional node fields at every depth", () => {
    const child = { text: "A", children: [], x: 10, level: 2 }
    const root = { text: "R", children: [child], id: "generated", width: 80 }
    expect(
      normalizeIshikawa({
        getRoot: () => root,
        getDiagramTitle: () => "T",
        getAccTitle: () => "Accessible title",
        getAccDescription: () => "Description",
        stack: [{ level: 1, node: child }],
        baseLevel: 4,
        getConfig: () => {
          throw new Error("drawing configuration must not be read")
        },
      }),
    ).toEqual({
      title: "T",
      accTitle: "Accessible title",
      accDescr: "Description",
      root: { text: "R", children: [{ text: "A", children: [] }] },
    })
    expect(root.children[0]).toBe(child)
    expect(child.x).toBe(10)
  })

  it("records an absent root as null and retains an independent title", async () => {
    expect(await summary("header-only-lf")).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      root: null,
    })
    expect(await summary("db-frontmatter-rootless")).toEqual({
      title: "Title only",
      accTitle: "",
      accDescr: "",
      root: null,
    })
  })

  it("keeps markup under supported security levels and drawing settings", async () => {
    const base = await summary("db-markup")
    for (const securityLevel of ["strict", "loose", "antiscript", "sandbox"]) {
      expect(await summary("db-markup", { securityLevel })).toEqual(base)
    }
    expect(
      await summary("db-markup", {
        ishikawa: { diagramPadding: 80, useMaxWidth: true },
        look: "handDrawn",
        handDrawnSeed: 7,
        fontSize: 30,
        theme: "dark",
      }),
    ).toEqual(base)
  })

  it("checks every fixture under a different supported security level", async () => {
    for (const fixture of await loadFixtures("ishikawa")) {
      const config = { ...fixture.config, securityLevel: "sandbox" }
      const { outcome } = await runMermaidWithEmbeddedData(fixture.input, {
        config,
      })
      // Unsupported levels intentionally replace characters; compare those
      // fixtures with strict while retaining all their other site settings.
      const expected =
        fixture.config?.securityLevel === "other"
          ? (
              await runMermaidWithEmbeddedData(fixture.input, {
                config: { ...fixture.config, securityLevel: "strict" },
              })
            ).outcome
          : fixture.expected.accepted
            ? {
                accepted: true,
                diagramType: fixture.expected.diagramType,
                db: fixture.expected.db,
              }
            : fixture.expected
      expect(outcome, fixture.name).toEqual(expected)
    }
  }, 10_000)

  it("clears the tree, title and indentation state after a rejected input", async () => {
    await summary("db-all-fields")
    expect((await runFixture("header-indented-second")).outcome.accepted).toBe(
      false,
    )
    expect(await summary("header-only-lf")).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      root: null,
    })
    expect((await summary("db-indent-tab-character")).title).toBe("R")
  })
})
