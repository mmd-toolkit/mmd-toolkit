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

/**
 * A chart with every kind of value the summary keeps: the orientation, the
 * title of a statement over the one of the frontmatter, the accessibility
 * texts, a band x axis, a y axis with a range, a line with a label, and a bar
 * with fewer values than categories.
 */
const KEPT_FIELDS = `---
title: Frontmatter
---
xychart-beta horizontal
  title "Chart"
  accTitle: An accessibility title
  accDescr: A description
  x-axis "Month" [jan, "feb mar", apr]
  y-axis "Sales" 0 --> 10
  line "L" [1 "first", 2.5]
  bar [-3]
`

describe("the summary of an xychart diagram", () => {
  it("keeps the fields of the summary with their values", async () => {
    expect(await summary(KEPT_FIELDS)).toEqual({
      orientation: "horizontal",
      title: "Chart",
      accTitle: "An accessibility title",
      accDescr: "A description",
      xAxis: {
        type: "band",
        title: "Month",
        categories: ["jan", "feb mar", "apr"],
      },
      yAxis: { type: "linear", title: "Sales", min: 0, max: 10 },
      plots: [
        {
          type: "line",
          title: "L",
          data: [
            ["jan", 1],
            ["feb mar", 2.5],
            ["apr", null],
          ],
          pointLabels: ["first", ""],
        },
        {
          type: "bar",
          title: "",
          data: [
            ["jan", -3],
            ["feb mar", null],
            ["apr", null],
          ],
        },
      ],
    })
  })

  it("starts each text from an empty Db", async () => {
    await summary(KEPT_FIELDS)
    expect(await summary("xychart-beta\n")).toEqual({
      orientation: "vertical",
      title: "",
      accTitle: "",
      accDescr: "",
      xAxis: { type: "band", title: "", categories: [] },
      yAxis: { type: "linear", title: "", min: "Infinity", max: "-Infinity" },
      plots: [],
    })
  })

  it("records a linear x axis made by the plots, and the positions of the pairs", async () => {
    const db = await summary(
      "xychart-beta\n  x-axis 0 --> 1\n  line [1, 2, 3, 4]\n",
    )
    expect(db.plots).toEqual([
      {
        type: "line",
        title: "",
        data: [
          ["0", 1],
          ["0.3333333333333333", 2],
          ["0.6666666666666666", 3],
          ["1", 4],
        ],
      },
    ])
  })

  it("records -0 as 0", async () => {
    const db = await summary("xychart-beta\n  x-axis -0 --> 1\n  bar [-0]\n")
    expect(db.xAxis).toEqual({ type: "linear", title: "", min: 0, max: 1 })
    expect(Object.is((db.yAxis as { min: number }).min, 0)).toBe(true)
  })

  it("does not have the fields it drops", async () => {
    const db = await summary(KEPT_FIELDS)
    expect(Object.keys(db)).toEqual([
      "orientation",
      "title",
      "accTitle",
      "accDescr",
      "xAxis",
      "yAxis",
      "plots",
    ])
    for (const plot of db.plots as object[]) {
      expect(plot).not.toHaveProperty("strokeFill")
      expect(plot).not.toHaveProperty("strokeWidth")
      expect(plot).not.toHaveProperty("fill")
    }
  })

  it("takes the orientation from the setting where the header has none", async () => {
    const setting = { xyChart: { chartOrientation: "horizontal" } }
    expect(await summary("xychart-beta\n  line [1]\n", setting)).toMatchObject({
      orientation: "horizontal",
    })
    expect(
      await summary("xychart-beta vertical\n  line [1]\n", setting),
    ).toMatchObject({ orientation: "vertical" })
  })

  it("records the texts with the characters replaced under a securityLevel that is no value of mermaid.js", async () => {
    const text =
      'xychart-beta\n  title "<b>T</b>"\n  x-axis "<i>X" ["<u>c"]\n  line "<b>L" [1 "<i>p"]\n'
    expect(await summary(text, { securityLevel: "other" })).toMatchObject({
      title: "&lt;b&gt;T&lt;/b&gt;",
      xAxis: { title: "&lt;i&gt;X", categories: ["&lt;u&gt;c"] },
      plots: [
        {
          title: "&lt;b&gt;L",
          data: [["&lt;u&gt;c", 1]],
          pointLabels: ["&lt;i&gt;p"],
        },
      ],
    })
    expect(await summary(text, { securityLevel: "loose" })).toMatchObject({
      title: "<b>T</b>",
    })
  })
})
