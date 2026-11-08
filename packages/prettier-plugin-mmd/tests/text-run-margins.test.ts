import { describe, expect, it } from "vitest"
import type { DbSummary } from "@mmd-toolkit/tests"
import { textRunDbForFormattingComparison } from "./text-run-margins.ts"

/** Two Dbs of a text, before and after it is formatted. */
interface DbPair {
  readonly name: string
  readonly diagramType?: string
  readonly before: DbSummary
  readonly after: DbSummary
}

const restored: readonly DbPair[] = [
  {
    name: "a run of spaces in a title",
    before: { title: "Sales  report" },
    after: { title: "Sales report" },
  },
  {
    name: "a tab in the description of the accessibility statements",
    before: { accDescr: "c \t d" },
    after: { accDescr: "c d" },
  },
]

const kept: readonly DbPair[] = [
  {
    name: "a changed word",
    before: { title: "Sales  report" },
    after: { title: "Sales reports" },
  },
  {
    name: "a run that became nothing",
    before: { title: "Sales  report" },
    after: { title: "Salesreport" },
  },
  {
    name: "the whitespace at the end of a title, which is another exception",
    before: { title: "Sales  " },
    after: { title: "Sales" },
  },
  {
    name: "a run in the title of the accessibility statements, which the browser shows as a tooltip",
    before: { accTitle: "a  b" },
    after: { accTitle: "a b" },
  },
  {
    name: "a run in a name that other statements refer to",
    before: { sections: [{ label: "a  b" }] },
    after: { sections: [{ label: "a b" }] },
  },
  {
    name: "a run in a diagram type that has no listed text",
    diagramType: "sankey",
    before: { title: "a  b" },
    after: { title: "a b" },
  },
]

describe("the runs of whitespace in a text that the formatter prints as one space", () => {
  it.each(restored)(
    "restores $name",
    ({ before, after, diagramType = "pie" }) => {
      expect(
        textRunDbForFormattingComparison(before, after, diagramType),
      ).toEqual(before)
    },
  )

  it.each(kept)(
    "keeps $name as a difference",
    ({ before, after, diagramType = "pie" }) => {
      expect(
        textRunDbForFormattingComparison(before, after, diagramType),
      ).toEqual(after)
    },
  )

  it("passes a Db that is missing through", () => {
    expect(textRunDbForFormattingComparison(null, null, "pie")).toBeNull()
  })
})
