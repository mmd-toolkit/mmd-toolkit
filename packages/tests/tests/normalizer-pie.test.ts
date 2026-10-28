import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { getFixturesRoot } from "../src/index.ts"
import { runMermaidWithEmbeddedData } from "../src/mermaid.ts"
import { normalizePie } from "../src/normalizers/pie.ts"
import type { MermaidConfig } from "../src/types.ts"

/** Runs a fixed pie corpus input with optional site settings. */
async function runFixture(name: string, config: MermaidConfig = {}) {
  return runMermaidWithEmbeddedData(
    readFileSync(
      path.join(getFixturesRoot(), "pie", name, "input.mmd"),
      "utf8",
    ),
    { config },
  )
}

/** The summary of an accepted pie fixture. */
async function summary(name: string, config: MermaidConfig = {}) {
  const { outcome } = await runFixture(name, config)
  if (!outcome.accepted || outcome.db === null) throw new Error("expected a Db")
  return outcome.db
}

describe("the summary of a pie diagram", () => {
  it("keeps every stored section, in order, and the common drawing inputs", async () => {
    expect(await summary("db-all-fields")).toEqual({
      title: "Chart",
      accTitle: "Accessible",
      accDescr: "First line\nSecond line",
      showData: true,
      sections: [
        { label: "B", value: 10 },
        { label: "A", value: 100 },
        { label: "Small", value: 0.1 },
        { label: "Zero", value: 0 },
      ],
    })
    expect(await summary("db-three-definitions")).toMatchObject({
      sections: [
        { label: "A", value: 1 },
        { label: "B", value: 2 },
      ],
    })
  })

  it("omits drawing configuration and derived data without mutating the Db", () => {
    const sections = new Map([
      ["10", 1],
      ["2", 2],
    ])
    expect(
      normalizePie({
        getSections: () => sections,
        getShowData: () => false,
        getDiagramTitle: () => "T",
        getAccTitle: () => "AT",
        getAccDescription: () => "AD",
        getConfig: () => {
          throw new Error("drawing configuration must not be read")
        },
        arcs: [{ startAngle: 0, endAngle: 1 }],
        sum: 3,
      }),
    ).toEqual({
      title: "T",
      accTitle: "AT",
      accDescr: "AD",
      showData: false,
      sections: [
        { label: "10", value: 1 },
        { label: "2", value: 2 },
      ],
    })
    expect([...sections]).toEqual([
      ["10", 1],
      ["2", 2],
    ])
  })

  it("records overflowing values as text and negative zero as zero", async () => {
    expect((await summary("number-overflow")).sections).toEqual([
      { label: "A", value: "Infinity" },
    ])
    expect((await summary("number-negative-zero")).sections).toEqual([
      { label: "A", value: 0 },
    ])
  })

  it("leaves pie configuration in embedded values rather than duplicating it", async () => {
    const frontmatter = await runFixture("frontmatter-config")
    expect(frontmatter.outcome).toEqual(
      (await runFixture("config-drawing-only")).outcome,
    )
    expect(frontmatter.embedded?.config.pie).toMatchObject({
      textPosition: 0.2,
      donutHole: 0.4,
      legendPosition: "left",
      highlightSlice: "A",
    })
    expect(frontmatter.embedded?.dataBlockEffects).toEqual([])
  })

  it("retains markup under every supported security level", async () => {
    const base = await summary("html-all-texts")
    for (const securityLevel of ["strict", "loose", "antiscript", "sandbox"]) {
      expect(await summary("html-all-texts", { securityLevel })).toEqual(base)
    }
  })

  it("rejects lexical, recovered grammatical and Db errors, then clears stored state", async () => {
    await summary("db-all-fields")
    for (const name of [
      "recover-lexer-first",
      "recover-parser-missing-number",
      "recover-parser-extra-token",
      "recover-lexer-after-parser",
      "db-duplicate-negative",
    ]) {
      expect((await runFixture(name)).outcome.accepted, name).toBe(false)
    }
    expect(await summary("header-only")).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      showData: false,
      sections: [],
    })
  })
})
