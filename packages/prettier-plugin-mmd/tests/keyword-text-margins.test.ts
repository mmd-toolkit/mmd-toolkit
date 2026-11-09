import { describe, expect, it } from "vitest"
import type { DbSummary } from "@mmd-toolkit/tests"
import { keywordTextDbForFormattingComparison } from "./keyword-text-margins.ts"

/** Two Dbs of a text, before and after it is formatted. */
interface DbPair {
  readonly name: string
  readonly diagramType?: string
  readonly before: DbSummary
  readonly after: DbSummary
}

const restored: readonly DbPair[] = [
  {
    name: "the whitespace at the start of a title",
    before: { title: "  X  Y" },
    after: { title: "X  Y" },
  },
  {
    name: "the whitespace at the end of a title",
    before: { title: "X  Y  \t" },
    after: { title: "X  Y" },
  },
  {
    name: "the whitespace at both ends of a date format and an axis format",
    before: { dateFormat: "  YYYY-MM-DD  ", axisFormat: "\t%Y\t" },
    after: { dateFormat: "YYYY-MM-DD", axisFormat: "%Y" },
  },
  {
    name: "the whitespace at the start of a title that a directive had split",
    before: { title: "    Z" },
    after: { title: "  Z" },
  },
  {
    name: "the whitespace at both ends of a title of a C4 diagram",
    diagramType: "c4",
    before: { title: "  T  ", accDescr: "   D   " },
    after: { title: "T", accDescr: "D" },
  },
  {
    name: "the whitespace at the end of an event of a timeline",
    diagramType: "timeline",
    before: { tasks: [{ task: "2020 ", events: ["e   ", "f  "] }] },
    after: { tasks: [{ task: "2020 ", events: ["e   ", "f"] }] },
  },
  {
    name: "the whitespace at the end of the name of a task of a Gantt chart",
    before: { tasks: [{ task: "A task\t", id: "a1" }] },
    after: { tasks: [{ task: "A task     ", id: "a1" }] },
  },
  {
    name: "the whitespace at the end of a description of a state",
    diagramType: "stateDiagram",
    before: { states: [{ id: "A", description: [" x   "] }] },
    after: { states: [{ id: "A", description: [" x"] }] },
  },
]

const kept: readonly DbPair[] = [
  {
    name: "a changed title",
    before: { title: "  X" },
    after: { title: "Y" },
  },
  {
    name: "whitespace inside a title",
    before: { title: "X  Y" },
    after: { title: "X Y" },
  },
  {
    name: "the whitespace before a tick interval, which changes the ticks",
    before: { tickInterval: "  1week" },
    after: { tickInterval: "1week" },
  },
  {
    name: "the whitespace at the end of a tick interval, which changes the ticks",
    before: { tickInterval: "1week  " },
    after: { tickInterval: "1week" },
  },
  {
    name: "the whitespace at the end of a today marker, which is another marker",
    before: { todayMarker: "off  " },
    after: { todayMarker: "off" },
  },
  {
    name: "the whitespace before a text that is no keyword text",
    before: { tasks: [{ task: "  t" }] },
    after: { tasks: [{ task: "t" }] },
  },
  {
    name: "the whitespace before a section, which tells two sections apart",
    before: {
      sections: ["S", " S"],
      tasks: [{ section: " S", task: "t" }],
    },
    after: {
      sections: ["S", "S"],
      tasks: [{ section: "S", task: "t" }],
    },
  },
  {
    name: "the whitespace at the end of a section, which tells two sections apart",
    before: { sections: ["S", "S "] },
    after: { sections: ["S", "S"] },
  },
  {
    name: "a list of sections of another length",
    before: { sections: ["  S"] },
    after: { sections: ["S", "T"] },
  },
  {
    name: "the whitespace at the start of an event of a timeline",
    diagramType: "timeline",
    before: { tasks: [{ task: "a", events: ["  e"] }] },
    after: { tasks: [{ task: "a", events: ["e"] }] },
  },
  {
    name: "the whitespace at the start of a description of a state",
    diagramType: "stateDiagram",
    before: { states: [{ id: "A", description: ["  x"] }] },
    after: { states: [{ id: "A", description: [" x"] }] },
  },
  {
    name: "the whitespace at the end of an event of a diagram that has none to trim",
    diagramType: "gantt",
    before: { tasks: [{ task: "a", events: ["e  "] }] },
    after: { tasks: [{ task: "a", events: ["e"] }] },
  },
  {
    name: "a changed name of a task of a Gantt chart",
    before: { tasks: [{ task: "A task  ", id: "a1" }] },
    after: { tasks: [{ task: "B task  ", id: "a1" }] },
  },
  {
    name: "whitespace added at the start of the name of a task of a Gantt chart",
    before: { tasks: [{ task: "A task", id: "a1" }] },
    after: { tasks: [{ task: " A task", id: "a1" }] },
  },
  {
    name: "whitespace changed inside the name of a task of a Gantt chart",
    before: { tasks: [{ task: "A  task ", id: "a1" }] },
    after: { tasks: [{ task: "A task ", id: "a1" }] },
  },
]

describe("the whitespace of a keyword text that the formatter takes away", () => {
  it.each(restored)(
    "restores $name",
    ({ before, after, diagramType = "gantt" }) => {
      expect(
        keywordTextDbForFormattingComparison(before, after, diagramType),
      ).toEqual(before)
    },
  )

  it.each(kept)(
    "keeps $name as a difference",
    ({ before, after, diagramType = "gantt" }) => {
      expect(
        keywordTextDbForFormattingComparison(before, after, diagramType),
      ).toEqual(after)
    },
  )

  it("passes a Db that is missing through", () => {
    expect(keywordTextDbForFormattingComparison(null, null, "gantt")).toBeNull()
  })
})
