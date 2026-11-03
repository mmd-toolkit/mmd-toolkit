import { describe, expect, it } from "vitest"
import type { DbSummary } from "@mmd-toolkit/tests"
import {
  eventmodelingDbForFormattingComparison,
  eventmodelingEmbeddedForFormattingComparison,
} from "./eventmodeling-data-margins.ts"

describe("eventmodeling's permitted data margins", () => {
  it.each([
    {
      name: "a single unindented line",
      before: "{\nx\n}",
      after: "{\n  x\n}",
    },
    {
      name: "a first line at zero and a later positive margin",
      before: "{\nx\n  y\n}\n",
      after: "{\n  x\n  y\n}\n",
    },
    {
      name: "different positive leading margins",
      before: "{\n    x\n      y\n}",
      after: "{\n  x\n  y\n}",
    },
    {
      name: "a smaller margin following the first row",
      before: "{\n    x\n  y\n}",
      after: "{\n  x\n  y\n}",
    },
    {
      name: "a larger leading margin between equal margins",
      before: "{\n  x\n    y\n  z\n}",
      after: "{\n  x\n  y\n  z\n}",
    },
    {
      name: "blank rows and trailing whitespace retained byte for byte",
      before: "{\nx \t\n \t\n  y\t\n}",
      after: "{\n  x \t\n \t\n  y\t\n}",
    },
    {
      name: "an interior tab retained as content",
      before: "{\nx\ty\n}",
      after: "{\n  x\ty\n}",
    },
  ])("accepts $name", ({ before, after }) => {
    expect(
      eventmodelingEmbeddedForFormattingComparison([before], [after]),
    ).toEqual([before])
  })

  it.each([
    {
      name: "a changed closing-LF boundary",
      before: "{\nx\n}\n",
      after: "{\n  x\n}",
    },
    {
      name: "an indented closer",
      before: "{\nx\n}",
      after: "{\n  x\n  }",
    },
    {
      name: "opening-line padding",
      before: "{ \t\nx\n}",
      after: "{ \t\n  x\n}",
    },
    {
      name: "inline data",
      before: "{ x }",
      after: "{  x }",
    },
    {
      name: "changed content",
      before: "{\nx\n}",
      after: "{\n  y\n}",
    },
    {
      name: "different positive output margins",
      before: "{\n  x\n    y\n}",
      after: "{\n    x\n     y\n}",
    },
    {
      name: "a zero output margin",
      before: "{\n    x\n      y\n}",
      after: "{\nx\ny\n}",
    },
    {
      name: "a later output row without a margin",
      before: "{\n    x\n  y\n}",
      after: "{\n  x\ny\n}",
    },
    {
      name: "an inserted tab",
      before: "{\nx\n}",
      after: "{\n\tx\n}",
    },
    {
      name: "a removed tab",
      before: "{\n\tx\n}",
      after: "{\n  x\n}",
    },
    {
      name: "other leading whitespace",
      before: "{\n\u00a0x\n}",
      after: "{\n  \u00a0x\n}",
    },
    {
      name: "changed whitespace on a blank row",
      before: "{\nx\n \n  y\n}",
      after: "{\n  x\n  \n  y\n}",
    },
    {
      name: "changed trailing whitespace",
      before: "{\nx \t\n}",
      after: "{\n  x \n}",
    },
    {
      name: "an added physical row",
      before: "{\nx\n}",
      after: "{\n  x\n\n}",
    },
    {
      name: "a changed space-separated word boundary after LF",
      before: "{\nx\ny\n}",
      after: "{\n  x\n  y\n}",
    },
    {
      name: "HTML line-break content",
      before: "{\nx<br/>y\n}",
      after: "{\n  x<br/>y\n}",
    },
    {
      name: "an entity that can become HTML",
      before: "{\nx&lt;br/&gt;y\n}",
      after: "{\n  x&lt;br/&gt;y\n}",
    },
    {
      name: "a native entity protected by its semicolons",
      before: "{\nx#lt;br/#gt;y\n}",
      after: "{\n  x#lt;br/#gt;y\n}",
    },
    {
      name: "an embedded directive",
      before: "{\nx%%{wrap}%%y\n}",
      after: "{\n  x%%{wrap}%%y\n}",
    },
  ])("keeps $name visible to strict comparison", ({ before, after }) => {
    expect(
      eventmodelingEmbeddedForFormattingComparison([before], [after]),
    ).toEqual([after])
  })

  it("checks every block while retaining directives, order and extra entries", () => {
    const before = ["%%{init: {}}%%", "{\nunused\n}", "{\nnote\n}"]
    const after = [
      "%%{init: {x: 1}}%%",
      "{\n  unused\n}",
      "{\n  note\n}",
      "{\nextra\n}",
    ]
    expect(eventmodelingEmbeddedForFormattingComparison(before, after)).toEqual(
      ["%%{init: {x: 1}}%%", "{\nunused\n}", "{\nnote\n}", "{\nextra\n}"],
    )
  })
})

describe("eventmodeling's explicit Db comparison", () => {
  it("restores only a verified block margin and leaves both raw Dbs intact", () => {
    const before: DbSummary = {
      accTitle: "before",
      frames: [{ name: "01", data: { kind: "block", value: "{\nx\n}" } }],
    }
    const after: DbSummary = {
      accTitle: "changed",
      frames: [
        { name: "02", data: { kind: "block", value: "{\n  x\n}", extra: 1 } },
      ],
    }
    const originalBefore = structuredClone(before)
    const originalAfter = structuredClone(after)
    expect(eventmodelingDbForFormattingComparison(before, after)).toEqual({
      accTitle: "changed",
      frames: [
        { name: "02", data: { kind: "block", value: "{\nx\n}", extra: 1 } },
      ],
    })
    expect(before).toEqual(originalBefore)
    expect(after).toEqual(originalAfter)
  })

  it("leaves inline values, invalid block changes and frame additions visible", () => {
    const before: DbSummary = {
      frames: [
        { data: { kind: "inline", value: "{\nx\n}" } },
        { data: { kind: "block", value: "{\nx\n}" } },
      ],
    }
    const after: DbSummary = {
      frames: [
        { data: { kind: "inline", value: "{\n  x\n}" } },
        { data: { kind: "block", value: "{\n  y\n}" } },
        { data: null },
      ],
    }
    expect(eventmodelingDbForFormattingComparison(before, after)).toEqual(after)
  })

  it("does not substitute absent readings or missing frame data", () => {
    const after: DbSummary = { frames: [{ data: null }] }
    expect(eventmodelingDbForFormattingComparison(null, after)).toBe(after)
    expect(eventmodelingDbForFormattingComparison(after, null)).toBeNull()
    expect(
      eventmodelingDbForFormattingComparison(
        { frames: [{ data: { kind: "block", value: "{\nx\n}" } }] },
        after,
      ),
    ).toEqual(after)
  })
})
