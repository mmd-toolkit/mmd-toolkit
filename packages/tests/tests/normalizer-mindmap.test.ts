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

/** A diagram with every kind of value the summary keeps: shapes, an icon, a class, and levels apart by more than one indentation step. */
const KEPT_FIELDS = `mindmap
  root((The root))
    a[Square]
      ::icon(fa fa-book)
      :::big red
    b
        deep{{Hexagon}}
`

/** The fields that the summary drops, which no node of the tree has. */
const DROPPED_FIELDS: readonly string[] = ["id", "isRoot", "width", "padding"]

/** Checks that `node` and the nodes below it have none of the dropped fields. */
function expectNoDroppedFields(node: Record<string, unknown>): void {
  for (const dropped of DROPPED_FIELDS) {
    expect(node).not.toHaveProperty(dropped)
  }
  for (const child of node.children as Record<string, unknown>[]) {
    expectNoDroppedFields(child)
  }
}

describe("the summary of a mindmap diagram", () => {
  it("keeps the fields of the summary with their values", async () => {
    expect(await summary(KEPT_FIELDS)).toEqual({
      root: {
        nodeId: "root",
        level: 0,
        descr: "The root",
        type: 3,
        children: [
          {
            nodeId: "a",
            level: 2,
            descr: "Square",
            type: 2,
            icon: "fa fa-book",
            class: "big red",
            children: [],
          },
          {
            nodeId: "b",
            level: 2,
            descr: "b",
            type: 0,
            children: [
              {
                nodeId: "deep",
                level: 6,
                descr: "Hexagon",
                type: 6,
                children: [],
              },
            ],
          },
        ],
      },
    })
  })

  it("has no root for a header alone", async () => {
    expect(await summary("mindmap\n")).toEqual({ root: null })
  })

  it("starts each text from an empty Db", async () => {
    await summary(KEPT_FIELDS)
    expect(await summary("mindmap\n  only\n")).toEqual({
      root: { nodeId: "only", level: 0, descr: "only", type: 0, children: [] },
    })
  })

  it("does not have the fields it drops", async () => {
    const db = await summary(KEPT_FIELDS)
    expectNoDroppedFields(db.root as Record<string, unknown>)
  })

  it("is the same under every site setting that is not about the texts", async () => {
    const plain = await summary(KEPT_FIELDS)
    const configs: MermaidConfig[] = [
      { mindmap: { padding: 99, maxNodeWidth: 7 } },
      { look: "handDrawn" },
      { theme: "dark" },
      { securityLevel: "strict" },
      { securityLevel: "loose" },
      { securityLevel: "sandbox" },
    ]
    for (const config of configs) {
      expect(
        await summary(KEPT_FIELDS, config),
        JSON.stringify(config),
      ).toEqual(plain)
    }
  })
})
