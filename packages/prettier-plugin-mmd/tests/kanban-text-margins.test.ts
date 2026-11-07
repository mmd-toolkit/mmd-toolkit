import { describe, expect, it } from "vitest"
import type { DbSummary } from "@mmd-toolkit/tests"
import { kanbanDbForFormattingComparison } from "./kanban-text-margins.ts"

/** Two Dbs of a text, before and after it is formatted. */
interface DbPair {
  readonly name: string
  readonly before: DbSummary
  readonly after: DbSummary
}

/** The Db of a board with one column and one card. */
function board(column: string, card: string, label: string): DbSummary {
  return {
    nodes: [
      { id: column, label: " Todo ", isGroup: true },
      { id: card, label, isGroup: false, parentId: column, icon: " fa " },
    ],
  }
}

const restored: readonly DbPair[] = [
  {
    name: "the padding of a card and of a label",
    before: board("todo ", "id1 ", " Create "),
    after: {
      nodes: [
        { id: "todo ", label: " Todo ", isGroup: true },
        {
          id: "id1",
          label: "Create",
          isGroup: false,
          parentId: "todo ",
          icon: " fa ",
        },
      ],
    },
  },
]

const kept: readonly DbPair[] = [
  {
    name: "the id of a column",
    before: { nodes: [{ id: "todo ", label: "T", isGroup: true }] },
    after: { nodes: [{ id: "todo", label: "T", isGroup: true }] },
  },
  {
    name: "a changed label",
    before: board("todo", "a", "x"),
    after: board("todo", "a", "y"),
  },
]

describe("the spaces and tabs at the ends of kanban texts that the formatter takes away", () => {
  it.each(restored)("restores $name", ({ before, after }) => {
    const result = kanbanDbForFormattingComparison(before, after)
    expect(result).toEqual({
      nodes: [
        { id: "todo ", label: " Todo ", isGroup: true },
        {
          id: "id1 ",
          label: " Create ",
          isGroup: false,
          parentId: "todo ",
          icon: " fa ",
        },
      ],
    })
  })

  it.each(kept)("keeps $name as a difference", ({ before, after }) => {
    expect(kanbanDbForFormattingComparison(before, after)).toEqual(after)
  })

  it("passes a Db that is missing through", () => {
    expect(kanbanDbForFormattingComparison(null, null)).toBeNull()
  })
})
