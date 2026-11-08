import { describe, expect, it } from "vitest"
import type { DbSummary } from "@mmd-toolkit/tests"
import { mindmapDbForFormattingComparison } from "./mindmap-text-margins.ts"

/** Two Dbs of a text, before and after it is formatted. */
interface DbPair {
  readonly name: string
  readonly before: DbSummary
  readonly after: DbSummary
}

const restored: readonly DbPair[] = [
  {
    name: "the spaces at the end of a node text and before a shape",
    before: { root: { nodeId: "a ", descr: "x", children: [] } },
    after: { root: { nodeId: "a", descr: "x", children: [] } },
  },
  {
    name: "the padding of the text of a shape",
    before: { root: { nodeId: "b", descr: " y ", children: [] } },
    after: { root: { nodeId: "b", descr: "y", children: [] } },
  },
  {
    name: "the padding of an icon and a class, below a node",
    before: {
      root: {
        nodeId: "r",
        descr: "r",
        children: [{ nodeId: "c", descr: "c", icon: " fa ", class: "  big " }],
      },
    },
    after: {
      root: {
        nodeId: "r",
        descr: "r",
        children: [{ nodeId: "c", descr: "c", icon: "fa", class: "big" }],
      },
    },
  },
]

const kept: readonly DbPair[] = [
  {
    name: "a text that became a string",
    before: { root: { nodeId: "d", descr: ' "q" ', children: [] } },
    after: { root: { nodeId: "d", descr: "q", children: [] } },
  },
  {
    name: "whitespace inside a text",
    before: { root: { nodeId: "a  b", descr: "a  b", children: [] } },
    after: { root: { nodeId: "a b", descr: "a b", children: [] } },
  },
  {
    name: "a changed text",
    before: { root: { nodeId: "a", descr: "x", children: [] } },
    after: { root: { nodeId: "a", descr: "y", children: [] } },
  },
]

describe("the spaces and tabs at the ends of mindmap texts that the formatter takes away", () => {
  it.each(restored)("restores $name", ({ before, after }) => {
    expect(mindmapDbForFormattingComparison(before, after)).toEqual(before)
  })

  it.each(kept)("keeps $name as a difference", ({ before, after }) => {
    expect(mindmapDbForFormattingComparison(before, after)).toEqual(after)
  })

  it("passes a Db that is missing through", () => {
    expect(mindmapDbForFormattingComparison(null, null)).toBeNull()
  })
})
