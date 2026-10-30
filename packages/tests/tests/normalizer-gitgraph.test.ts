import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { getFixturesRoot } from "../src/index.ts"
import { runMermaid } from "../src/mermaid.ts"

/** Runs a fixed gitgraph corpus input. */
async function runFixture(name: string) {
  return runMermaid(
    readFileSync(
      path.join(getFixturesRoot(), "gitgraph", name, "input.mmd"),
      "utf8",
    ),
  )
}

/** The summary of an accepted gitgraph fixture. */
async function summary(name: string) {
  const result = await runFixture(name)
  if (!result.accepted || result.db === null) {
    throw new Error("expected an accepted gitgraph with a summary")
  }
  expect(result.diagramType).toBe("gitGraph")
  return result.db
}

describe("gitgraph normalization", () => {
  it("keeps empty state without options, configuration or drawing fields", async () => {
    expect(await summary("header-only")).toEqual({
      direction: "LR",
      title: "",
      accTitle: "",
      accDescr: "",
      commits: [],
      branches: [{ name: "main" }],
    })
  })

  it("renames generated ids and parent references consistently", async () => {
    const db = await summary("db-generated-ids")
    expect(db).toEqual(await summary("db-generated-ids"))
    expect(db.commits).toEqual([
      {
        id: "generated-commit-1",
        seq: 0,
        type: 0,
        tags: [],
        parents: [],
        branch: "main",
      },
      {
        id: "generated-commit-2",
        seq: 1,
        type: 0,
        tags: [],
        parents: ["generated-commit-1"],
        branch: "b",
      },
      {
        id: "generated-commit-3",
        seq: 2,
        type: 3,
        tags: [],
        parents: ["generated-commit-1", "generated-commit-2"],
        branch: "main",
        customId: false,
      },
    ])
    expect(db.branches).toEqual([{ name: "main" }, { name: "b" }])
  })

  it("avoids authored placeholder names and leaves literal tags intact", async () => {
    const db = await summary("db-generated-name-collision")
    expect(db.commits).toMatchObject([
      { id: "generated-commit-2" },
      { id: "generated-commit-1", parents: ["generated-commit-2"] },
      { id: "generated-commit-3", parents: ["generated-commit-1"] },
    ])
    expect((await summary("db-random-shaped-custom-id")).commits).toMatchObject(
      [
        { id: "0-abcdefg", tags: ["0-abcdefg"] },
        { id: "generated-commit-1", parents: ["0-abcdefg"] },
      ],
    )
  })

  it("retains first-id insertion order and the latest sequence after replacement", async () => {
    const db = await summary("db-three-definitions")
    expect(db.commits).toMatchObject([
      { id: "A", seq: 2, parents: ["B"] },
      { id: "B", seq: 1, parents: ["A"] },
      { id: "C", seq: 3, parents: ["A"] },
    ])
  })

  it("keeps renderer branch order and empty branch names", async () => {
    expect((await summary("gram-branch-order")).branches).toEqual([
      { name: "main" },
      { name: "d" },
      { name: "c" },
      { name: "b" },
    ])
    expect((await summary("gram-branch-empty")).branches).toEqual([
      { name: "main" },
      { name: "" },
    ])
  })

  it("keeps merge overrides and does not reverse tags while summarizing", async () => {
    expect((await summary("gram-merge-options")).commits).toMatchObject([
      { id: "A" },
      { id: "B" },
      { id: "M", type: 3, customType: 1, customId: true, tags: ["x", ""] },
    ])
  })

  it("keeps cherry-pick ids and copies explicit and default tags as stored", async () => {
    expect((await summary("gram-cherry-pick-tags")).commits).toMatchObject([
      { id: "A" },
      { id: "B" },
      {
        id: "generated-commit-1",
        type: 4,
        parents: ["A", "B"],
        tags: ["x", "y"],
      },
    ])
    expect((await summary("gram-cherry-pick")).commits).toMatchObject([
      { id: "A" },
      { id: "B" },
      { id: "generated-commit-1", tags: ["cherry-pick:B"] },
    ])
    expect(
      (await summary("gram-cherry-pick-merge-parent")).commits,
    ).toMatchObject([
      { id: "A" },
      { id: "B" },
      { id: "M" },
      { id: "generated-commit-1", tags: ["cherry-pick:M|parent:A"] },
    ])
  })

  it("starts the sequence and generated naming afresh after a rejected parse", async () => {
    expect(
      (await runFixture("db-merge-unknown-generated-prefix")).accepted,
    ).toBe(false)
    expect((await summary("gram-commit-empty-values")).commits).toMatchObject([
      { id: "generated-commit-1", seq: 0 },
    ])
  })
})
