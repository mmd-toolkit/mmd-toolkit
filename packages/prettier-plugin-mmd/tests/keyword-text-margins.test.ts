import { describe, expect, it } from "vitest"
import type { DbSummary } from "@mmd-toolkit/tests"
import { keywordTextDbForFormattingComparison } from "./keyword-text-margins.ts"

/** Two Dbs of a text, before and after it is formatted. */
interface DbPair {
  readonly name: string
  readonly before: DbSummary
  readonly after: DbSummary
}

const restored: readonly DbPair[] = [
  {
    name: "the whitespace before a title",
    before: { title: "  X  Y  " },
    after: { title: "X  Y  " },
  },
  {
    name: "the whitespace before a date format and an axis format",
    before: { dateFormat: "  YYYY-MM-DD", axisFormat: "\t%Y" },
    after: { dateFormat: "YYYY-MM-DD", axisFormat: "%Y" },
  },
  {
    name: "the whitespace before a title that a directive had split",
    before: { title: "    Z" },
    after: { title: "  Z" },
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
    name: "whitespace at the end of a title",
    before: { title: "X  " },
    after: { title: "X" },
  },
  {
    name: "the whitespace before a tick interval, which changes the ticks",
    before: { tickInterval: "  1week" },
    after: { tickInterval: "1week" },
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
    name: "a list of sections of another length",
    before: { sections: ["  S"] },
    after: { sections: ["S", "T"] },
  },
]

describe("the whitespace before a keyword text that the formatter takes away", () => {
  it.each(restored)("restores $name", ({ before, after }) => {
    expect(keywordTextDbForFormattingComparison(before, after)).toEqual(before)
  })

  it.each(kept)("keeps $name as a difference", ({ before, after }) => {
    expect(keywordTextDbForFormattingComparison(before, after)).toEqual(after)
  })

  it("passes a Db that is missing through", () => {
    expect(keywordTextDbForFormattingComparison(null, null)).toBeNull()
  })
})
