import { describe, expect, it } from "vitest"
import { runMermaid } from "../src/mermaid.ts"
import { normalizeTimeline } from "../src/normalizers/timeline.ts"
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
 * A diagram that has every kind of value the summary keeps: the direction, the
 * title, the accessibility texts, two sections, a task before the first
 * section, and tasks with several events.
 */
const KEPT_FIELDS = `timeline TD
  title Plan
  accTitle: Plan title
  accDescr: Plan description
  Wake up
  section Morning
  Make tea : Boil : Pour
           : Wait
  section Work
  Commute
`

describe("the summary of a timeline diagram", () => {
  it("keeps the fields of the summary with their values", async () => {
    expect(await summary(KEPT_FIELDS)).toEqual({
      direction: "TD",
      title: "Plan",
      accTitle: "Plan title",
      accDescr: "Plan description",
      sections: ["Morning", "Work"],
      tasks: [
        { section: "", task: "Wake up", events: [] },
        {
          section: "Morning",
          task: "Make tea ",
          events: ["Boil ", "Pour", "Wait"],
        },
        { section: "Work", task: "Commute", events: [] },
      ],
    })
  })

  it("starts each text from an empty Db", async () => {
    await summary("timeline TD\n  title One\n  section S\n  A : x\n")
    expect(await summary("timeline\n  B\n")).toEqual({
      direction: "LR",
      title: "",
      accTitle: "",
      accDescr: "",
      sections: [],
      tasks: [{ section: "", task: "B", events: [] }],
    })
  })

  it("does not depend on the diagrams parsed before it", async () => {
    // The Db numbers its tasks with a counter that `clear()` does not reset,
    // and an event is added to the task with the last number.
    const text = "timeline\n  A : x\n  B : y\n    : z\n"
    const first = await summary(text)
    await summary("timeline\n  C\n  D\n  E\n")
    expect(await summary(text)).toEqual(first)
  })

  it("keeps its sections when the Db is cleared for the next text", async () => {
    // The Db empties its list of sections in place when it is cleared.
    const first = await summary("timeline\n  section S\n  A\n")
    await summary("timeline\n  B\n")
    expect(first.sections).toEqual(["S"])
  })

  it("leaves the Db as it was, so that it can be summarized again", () => {
    // `getTasks()` appends the tasks to its list every time it is called; a
    // second summary of the same Db must be the first one.
    const raw = [
      { id: 7, section: "S", type: "S", task: "T", score: 0, events: ["e"] },
    ]
    const list: object[] = []
    const db = {
      getDirection: () => "LR",
      getSections: () => ["S"],
      getTasks: () => {
        list.push(...raw)
        return list
      },
      getCommonDb: () => ({
        getDiagramTitle: () => "",
        getAccTitle: () => "",
        getAccDescription: () => "",
      }),
    }
    const first = normalizeTimeline(db)
    expect(normalizeTimeline(db)).toEqual(first)
    expect(list).toEqual([])
  })

  it("does not have the fields it drops", async () => {
    const db = await summary(KEPT_FIELDS)
    for (const task of db.tasks as object[]) {
      expect(task).not.toHaveProperty("id")
      expect(task).not.toHaveProperty("type")
      expect(task).not.toHaveProperty("score")
    }
  })

  it("records the title and the accessibility texts with the characters replaced under a securityLevel that is no value of mermaid.js", async () => {
    const text =
      "timeline\n  title <b>T</b>\n  accTitle: <i>A</i>\n  accDescr: <u>D</u>\n  section <b>S</b>\n  <b>P</b> : <i>E</i>\n"
    const replaced = await summary(text, { securityLevel: "other" })
    expect(replaced).toMatchObject({
      title: "&lt;b&gt;T&lt;/b&gt;",
      accTitle: "&lt;i&gt;A&lt;/i&gt;",
      accDescr: "&lt;u&gt;D&lt;/u&gt;",
      sections: ["<b>S</b>"],
      tasks: [{ section: "<b>S</b>", task: "<b>P</b> ", events: ["<i>E</i>"] }],
    })
    expect(await summary(text, { securityLevel: "loose" })).toMatchObject({
      title: "<b>T</b>",
    })
  })
})
