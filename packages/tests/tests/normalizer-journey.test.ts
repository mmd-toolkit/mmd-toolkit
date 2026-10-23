import { describe, expect, it } from "vitest"
import { runMermaid } from "../src/mermaid.ts"
import { normalizeJourney } from "../src/normalizers/journey.ts"
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
 * A diagram that has every kind of value the summary keeps: a frontmatter
 * title, the accessibility texts, two sections, tasks with people and without,
 * and a task before the first section.
 */
const KEPT_FIELDS = `---
title: Plan
---
journey
  accTitle: Plan title
  accDescr: Plan description
  Wake up: 1
  section Morning
  Make tea: 5: Me, You
  section Work
  Commute: 2: Me
`

describe("the summary of a journey diagram", () => {
  it("keeps the fields of the summary with their values", async () => {
    expect(await summary(KEPT_FIELDS)).toEqual({
      title: "Plan",
      accTitle: "Plan title",
      accDescr: "Plan description",
      sections: ["Morning", "Work"],
      tasks: [
        { section: "", task: "Wake up", people: [], score: 1 },
        {
          section: "Morning",
          task: "Make tea",
          people: ["Me", "You"],
          score: 5,
        },
        { section: "Work", task: "Commute", people: ["Me"], score: 2 },
      ],
    })
  })

  it("records a score that is no finite number as the text of the number", async () => {
    const db = await summary(
      "journey\n  A: abc: x\n  B: Infinity: x\n  C: -Infinity: x\n",
    )
    expect(
      (db.tasks as { score: unknown }[]).map((task) => task.score),
    ).toEqual(["NaN", "Infinity", "-Infinity"])
  })

  it("starts each text from an empty Db", async () => {
    await summary("journey\n  title One\n  section S\n  A: 3: x\n")
    expect(await summary("journey\n  B: 1\n")).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      sections: [],
      tasks: [{ section: "", task: "B", people: [], score: 1 }],
    })
  })

  it("keeps its sections when the Db is cleared for the next text", async () => {
    // The Db empties its list of sections in place when it is cleared.
    const first = await summary("journey\n  section S\n  A: 1\n")
    await summary("journey\n  B: 1\n")
    expect(first.sections).toEqual(["S"])
  })

  it("leaves the Db as it was, so that it can be summarized again", () => {
    // `getTasks()` appends the tasks to its list every time it is called; a
    // second summary of the same Db must be the first one.
    const raw = [
      { section: "S", type: "S", people: ["a"], task: "T", score: 3 },
    ]
    const list: object[] = []
    const db = {
      getDiagramTitle: () => "",
      getAccTitle: () => "",
      getAccDescription: () => "",
      getSections: () => ["S"],
      getTasks: () => {
        list.push(...raw)
        return list
      },
    }
    const first = normalizeJourney(db)
    expect(normalizeJourney(db)).toEqual(first)
    expect(list).toEqual([])
  })

  it("does not have the fields it drops", async () => {
    const db = await summary(KEPT_FIELDS)
    expect(db).not.toHaveProperty("actors")
    for (const task of db.tasks as object[]) {
      expect(task).not.toHaveProperty("type")
    }
  })
})
