import { describe, expect, it } from "vitest"
import type { DbSummary } from "@mmd-toolkit/tests"
import { styleDbForFormattingComparison } from "./style-margins.ts"

/** Two Dbs of a text, before and after it is formatted. */
interface DbPair {
  readonly name: string
  readonly before: DbSummary
  readonly after: DbSummary
}

const restored: readonly DbPair[] = [
  {
    name: "the whitespace around the first colon and the comma",
    before: {
      vertices: [{ id: "A", styles: ["fill:#f00", " stroke:#333"] }],
    },
    after: {
      vertices: [{ id: "A", styles: ["fill: #f00", " stroke: #333"] }],
    },
  },
  {
    name: "the whitespace at the ends of a style",
    before: { classDefs: [{ id: "c", styles: ["fill:#f00", "color:red "] }] },
    after: { classDefs: [{ id: "c", styles: ["fill:#f00", " color:red"] }] },
  },
  {
    name: "the styles of a link",
    before: { edges: [{ id: "L", style: ["stroke:#f00", " color:red"] }] },
    after: { edges: [{ id: "L", style: ["stroke: #f00", " color: red"] }] },
  },
]

const kept: readonly DbPair[] = [
  {
    name: "a changed value",
    before: { vertices: [{ id: "A", styles: ["fill:#f00"] }] },
    after: { vertices: [{ id: "A", styles: ["fill: #f01"] }] },
  },
  {
    name: "a changed name",
    before: { vertices: [{ id: "A", styles: ["fill:#f00"] }] },
    after: { vertices: [{ id: "A", styles: ["stroke: #f00"] }] },
  },
  {
    name: "whitespace inside a value",
    before: { vertices: [{ id: "A", styles: ["font-family:a  b"] }] },
    after: { vertices: [{ id: "A", styles: ["font-family: a b"] }] },
  },
  {
    name: "the fill:none that a link gets where no style starts with fill",
    before: { edges: [{ id: "L", style: ["stroke:#f00", "fill:red"] }] },
    after: {
      edges: [{ id: "L", style: ["stroke: #f00", " fill:red", "fill:none"] }],
    },
  },
  {
    name: "the whitespace of a text that is no style",
    before: { vertices: [{ id: "A", text: "a:b" }] },
    after: { vertices: [{ id: "A", text: "a: b" }] },
  },
]

describe("the margins of styles that the formatter changes", () => {
  it.each(restored)("restores $name", ({ before, after }) => {
    expect(styleDbForFormattingComparison(before, after)).toEqual(before)
  })

  it.each(kept)("keeps $name as a difference", ({ before, after }) => {
    expect(styleDbForFormattingComparison(before, after)).toEqual(after)
  })

  it("passes a Db that is missing through", () => {
    expect(styleDbForFormattingComparison(null, null)).toBeNull()
  })
})
