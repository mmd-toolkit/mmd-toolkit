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

/** The names of the fields of `value`, in alphabetical order. */
function fieldsOf(value: unknown): string[] {
  return Object.keys(value as object).sort()
}

/**
 * A diagram that has every kind of value the summary keeps: every setting, a
 * frontmatter title, the accessibility texts, two sections, tasks with an id
 * written and not, with tags, relative to the task before and to others, a
 * link and a click callback.
 */
const KEPT_FIELDS = `---
title: Plan
---
gantt
  accTitle: Plan title
  accDescr: Plan description
  dateFormat YYYY-MM-DD
  axisFormat %m/%d
  tickInterval 1week
  todayMarker stroke-width:5px
  includes 2024-01-06
  excludes weekends, Monday
  inclusiveEndDates
  weekday tuesday
  weekend friday
  section Design
  Draft :done, d1, 2024-01-01, 3d
  Review :crit, active, after d1, 2d
  section Build
  Code : 5d
  Launch :milestone, l1, after d1 d2, 0d
  click d1 href "https://example.com/d1"
  click l1 call launched(1, "a,b")
`

describe("the summary of a gantt diagram", () => {
  it("keeps the fields of the summary with their values", async () => {
    const db = await summary(KEPT_FIELDS)
    expect(fieldsOf(db)).toEqual([
      "accDescr",
      "accTitle",
      "axisFormat",
      "clickCalls",
      "dateFormat",
      "excludes",
      "includes",
      "inclusiveEndDates",
      "links",
      "sections",
      "tasks",
      "tickInterval",
      "title",
      "todayMarker",
      "weekday",
      "weekend",
    ])
    expect(db).toEqual({
      dateFormat: "YYYY-MM-DD",
      axisFormat: "%m/%d",
      tickInterval: "1week",
      todayMarker: "stroke-width:5px",
      includes: ["2024-01-06"],
      excludes: ["weekends", "monday"],
      inclusiveEndDates: true,
      weekday: "tuesday",
      weekend: "friday",
      title: "Plan",
      accTitle: "Plan title",
      accDescr: "Plan description",
      sections: ["Design", "Build"],
      tasks: [
        {
          section: "Design",
          raw: {
            startTime: { type: "getStartDate", startData: "2024-01-01" },
            endTime: { data: "3d" },
          },
          task: "Draft ",
          classes: ["clickable"],
          id: "d1",
          done: true,
          order: 0,
        },
        {
          section: "Design",
          raw: {
            startTime: { type: "getStartDate", startData: "after d1" },
            endTime: { data: "2d" },
          },
          task: "Review ",
          classes: [],
          id: "task1",
          active: true,
          crit: true,
          order: 1,
        },
        {
          section: "Build",
          raw: {
            startTime: { type: "prevTaskEnd", id: "task1" },
            endTime: { data: "5d" },
          },
          task: "Code ",
          classes: [],
          id: "task2",
          order: 2,
        },
        {
          section: "Build",
          raw: {
            startTime: { type: "getStartDate", startData: "after d1 d2" },
            endTime: { data: "0d" },
          },
          task: "Launch ",
          classes: ["clickable"],
          id: "l1",
          milestone: true,
          order: 3,
        },
      ],
      links: [{ id: "d1", url: "https://example.com/d1" }],
      clickCalls: [{ id: "l1", name: "launched", args: '1, "a,b"' }],
    })
  })

  it("rejects the topAxis statement, which calls a method the Db does not have", async () => {
    const outcome = await runMermaid("gantt\n  topAxis\n")
    expect(outcome).toMatchObject({
      accepted: false,
      error: { name: "TypeError", message: "yy.TopAxis is not a function" },
    })
  })

  it("has the fields of the tickInterval and the clicks only when the text sets them", async () => {
    const db = await summary("gantt\n  Task : 1d\n")
    expect(db).not.toHaveProperty("tickInterval")
    expect(db).not.toHaveProperty("clickCalls")
    expect(db.weekend).toBe("saturday")
    expect(db.weekday).toBe("sunday")
  })

  it("has no date of a task, also where the date cannot be computed", async () => {
    // `getTasks()` computes the dates when the diagram is drawn: `after` an id
    // that is no task is today, and the start `foo` is no date, for which it
    // throws. The text is accepted, and the summary does not depend on either.
    const db = await summary(
      "gantt\n  dateFormat YYYY-MM-DD\n  A :a, after nowhere, 2d\n  B :b, foo, 3d\n",
    )
    expect(db.tasks).toEqual([
      expect.objectContaining({ id: "a", order: 0 }),
      expect.objectContaining({ id: "b", order: 1 }),
    ])
    for (const task of db.tasks as object[]) {
      expect(fieldsOf(task)).toEqual([
        "classes",
        "id",
        "order",
        "raw",
        "section",
        "task",
      ])
      expect(fieldsOf((task as { raw: object }).raw)).toEqual([
        "endTime",
        "startTime",
      ])
    }
  })

  it("keeps the links and the click calls as written under every securityLevel", async () => {
    // The URL that `@braintree/sanitize-url` replaces with `about:blank`.
    const url = ["javascript", "alert(1)"].join(":")
    const text = `gantt\n  A :a, 2024-01-01, 1d\n  click a href "${url}"\n  click a call cb(1)\n`
    const expected = await summary(text, { securityLevel: "loose" })
    expect(expected.links).toEqual([{ id: "a", url }])
    expect(expected.clickCalls).toEqual([{ id: "a", name: "cb", args: "1" }])
    for (const securityLevel of ["strict", "antiscript", "sandbox"]) {
      expect(await summary(text, { securityLevel })).toEqual(expected)
    }
  })

  it("lists a link for a task that exists when the click statement is read", async () => {
    const db = await summary(
      'gantt\n  click later href "u1"\n  A :a, 2024-01-01, 1d\n  click a href "u2"\n  click a href "u3"\n  click missing href "u4"\n',
    )
    expect(db.links).toEqual([{ id: "a", url: "u3" }])
  })

  it("starts each text from an empty Db", async () => {
    const first = await summary(
      'gantt\n  title One\n  section S\n  A :a, 2024-01-01, 1d\n  click a href "u"\n  click a call cb()\n  excludes weekends\n  weekend friday\n',
    )
    expect(first.tasks).toHaveLength(1)
    const second = await summary("gantt\n  B :b, 2024-02-01, 1d\n")
    expect(second).toEqual({
      dateFormat: "",
      axisFormat: "",
      todayMarker: "",
      includes: [],
      excludes: [],
      inclusiveEndDates: false,
      weekday: "sunday",
      weekend: "saturday",
      title: "",
      accTitle: "",
      accDescr: "",
      sections: [],
      tasks: [
        {
          section: "",
          raw: {
            startTime: { type: "getStartDate", startData: "2024-02-01" },
            endTime: { data: "1d" },
          },
          task: "B ",
          classes: [],
          id: "b",
          order: 0,
        },
      ],
      links: [],
    })
  })

  it("does not find a task of the text before by an id the text does not define", async () => {
    // The Db keeps a table from an id to the position of its task and does not
    // clear it between texts; the patch makes it forget the earlier ids.
    await summary("gantt\n  T :x, 2024-01-01, 1d\n")
    const db = await summary(
      'gantt\n  A :a, 2024-01-01, 1d\n  click x href "u"\n',
    )
    expect(db.links).toEqual([])
    expect((db.tasks as { classes: string[] }[])[0]?.classes).toEqual([])
  })

  it("numbers the tasks without an id from one in each text", async () => {
    const text = "gantt\n  A : 1d\n  B : 1d\n"

    /** The ids of the tasks of `text`, in order. */
    async function ids(): Promise<string[]> {
      const { tasks } = await summary(text)
      return (tasks as { id: string }[]).map((task) => task.id)
    }

    expect(await ids()).toEqual(["task1", "task2"])
    expect(await ids()).toEqual(["task1", "task2"])
  })

  it("gives a task after a vert task the order of the task before it", async () => {
    const db = await summary(
      "gantt\n  A :a, 2024-01-01, 1d\n  V :vert, v, 2024-01-02, 0d\n  B :b, 2024-01-03, 1d\n",
    )
    expect(
      (db.tasks as { id: string; order: number }[]).map((task) => [
        task.id,
        task.order,
      ]),
    ).toEqual([
      ["a", 0],
      ["v", -1],
      ["b", 1],
    ])
  })
})
