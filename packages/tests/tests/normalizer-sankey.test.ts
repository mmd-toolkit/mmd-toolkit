import { describe, expect, it } from "vitest"
import { runMermaid } from "../src/mermaid.ts"
import type { MermaidConfig } from "../src/types.ts"

/** Returns the summary mermaid gives `text` with `config`. */
async function summary(
  text: string,
  config: MermaidConfig = {},
): Promise<Record<string, unknown>> {
  const outcome = await runMermaid(text, { config })
  if (!outcome.accepted || !outcome.db) throw new Error("expected a Db")
  return outcome.db
}

/**
 * A diagram with every kind of value the summary keeps: the title of the
 * frontmatter, a node named by a source and by a target, a quoted id with a
 * comma and a quote, a decimal value, and a link back.
 */
const KEPT_FIELDS = `---
title: Flow
---
sankey
A,"B, ""C""",12.5
"B, ""C""",A,3
`

describe("the summary of a sankey diagram", () => {
  it("keeps the fields of the summary with their values", async () => {
    expect(await summary(KEPT_FIELDS)).toEqual({
      title: "Flow",
      nodes: ["A", 'B, "C"'],
      links: [
        { source: "A", target: 'B, "C"', value: 12.5 },
        { source: 'B, "C"', target: "A", value: 3 },
      ],
    })
  })

  it("starts each text from an empty Db", async () => {
    await summary(KEPT_FIELDS)
    expect(await summary("sankey\nx,y,1\n")).toEqual({
      title: "",
      nodes: ["x", "y"],
      links: [{ source: "x", target: "y", value: 1 }],
    })
  })

  it("records a value that is no finite number as the text of the number", async () => {
    // JSON has no `NaN` and no `Infinity`.
    const db = await summary("sankey\na,b,abc\na,b,1e999\na,b,-1e999\na,b,2\n")
    expect(db.links).toEqual([
      { source: "a", target: "b", value: "NaN" },
      { source: "a", target: "b", value: "Infinity" },
      { source: "a", target: "b", value: "-Infinity" },
      { source: "a", target: "b", value: 2 },
    ])
  })

  it("does not have the fields it drops", async () => {
    const db = await summary(KEPT_FIELDS)
    expect(Object.keys(db)).toEqual(["title", "nodes", "links"])
    for (const node of db.nodes as unknown[]) {
      expect(typeof node).toBe("string")
    }
    for (const link of db.links as object[]) {
      expect(Object.keys(link)).toEqual(["source", "target", "value"])
    }
  })

  it("records the title and the ids with the characters replaced under a securityLevel that is no value of mermaid.js", async () => {
    const text = "---\ntitle: <b>T</b>\n---\nsankey\n<i>A</i>,B,1\n"
    expect(await summary(text, { securityLevel: "other" })).toEqual({
      title: "&lt;b&gt;T&lt;/b&gt;",
      nodes: ["&lt;i&gt;A&lt;/i&gt;", "B"],
      links: [{ source: "&lt;i&gt;A&lt;/i&gt;", target: "B", value: 1 }],
    })
    expect(await summary(text, { securityLevel: "loose" })).toEqual({
      title: "<b>T</b>",
      nodes: ["<i>A</i>", "B"],
      links: [{ source: "<i>A</i>", target: "B", value: 1 }],
    })
  })
})
