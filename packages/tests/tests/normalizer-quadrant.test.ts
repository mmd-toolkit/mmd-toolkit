import { describe, expect, it } from "vitest"
import { MermaidEnvironmentError, runMermaid } from "../src/mermaid.ts"
import { normalizeQuadrant } from "../src/normalizers/quadrant.ts"
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
 * A chart with every kind of value the summary keeps: the title of a statement
 * over the one of the frontmatter, the accessibility texts, both texts of the
 * x axis and the first of the y axis, the four quadrants, a point with a class
 * and styles, a point with none, and a class that a statement defines again.
 */
const KEPT_FIELDS = `---
title: Frontmatter
---
quadrantChart
  title Chart
  accTitle: An accessibility title
  accDescr: A description
  x-axis "Low reach" --> High reach
  y-axis Quality -->
  quadrant-1 First
  quadrant-2 "Second one"
  quadrant-3 Third
  quadrant-4 Fourth
  classDef warm color: #ff0000, radius: 4
  classDef warm stroke-width: 2px
  Alpha:::warm: [0.3, 0.6] radius: 7, stroke-color: #00ff00
  Beta: [1, 0]
`

describe("the summary of a quadrant chart diagram", () => {
  it("keeps the fields of the summary with their values", async () => {
    expect(await summary(KEPT_FIELDS)).toEqual({
      title: "Chart",
      accTitle: "An accessibility title",
      accDescr: "A description",
      quadrants: ["First", "Second one", "Third", "Fourth"],
      xAxis: { left: "Low reach", right: "High reach" },
      yAxis: { bottom: "Quality ⟶", top: "" },
      points: [
        { text: "Beta", className: "", x: "1", y: "0" },
        {
          text: "Alpha",
          className: "warm",
          x: "0.3",
          y: "0.6",
          radius: 7,
          strokeColor: "#00ff00",
        },
      ],
      classes: [{ name: "warm", strokeWidth: "2px" }],
    })
  })

  it("starts each text from an empty Db", async () => {
    await summary(KEPT_FIELDS)
    expect(await summary("quadrantChart\n")).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      quadrants: ["", "", "", ""],
      xAxis: { left: "", right: "" },
      yAxis: { bottom: "", top: "" },
      points: [],
      classes: [],
    })
  })

  it("starts over after a text that the Db rejected while it was parsed", async () => {
    // `Alpha` is added before the style of `Beta` is rejected; the next text
    // must not see it.
    const rejected = await runMermaid(
      "quadrantChart\n  Alpha: [0.3, 0.6]\n  Beta: [0.1, 0.2] radius: x\n",
    )
    expect(rejected.accepted).toBe(false)
    expect(await summary("quadrantChart\n  Gamma: [0, 0]\n")).toMatchObject({
      points: [{ text: "Gamma", className: "", x: "0", y: "0" }],
      classes: [],
    })
  })

  it("lists the points in the order the Db holds them, the reverse of the text", async () => {
    const db = await summary(
      "quadrantChart\n  A: [0.1, 0.1]\n  B: [0.2, 0.2]\n  C: [0.3, 0.3]\n",
    )
    expect(
      (db.points as { text: string }[]).map((point) => point.text),
    ).toEqual(["C", "B", "A"])
  })

  it("holds the coordinates as the texts the lexer read", async () => {
    const db = await summary("quadrantChart\n  A: [0x5, 0.30]\n  B: [1, 0 3]\n")
    expect(db.points).toEqual([
      { text: "B", className: "", x: "1", y: "0 3" },
      { text: "A", className: "", x: "0x5", y: "0.30" },
    ])
  })

  it("tells which text of an axis a single label is", async () => {
    const cases: [string, unknown][] = [
      ["x-axis L", { left: "L", right: "" }],
      ["x-axis L -->", { left: "L ⟶", right: "" }],
      ["x-axis L --> R", { left: "L", right: "R" }],
      // A string of spaces is a text that the Db trims to nothing, so the Db
      // holds the right text only, which the layout puts at the centre.
      ['x-axis "  " --> R', { left: "", right: "R" }],
      ["x-axis L --> R\nx-axis M", { left: "M", right: "R" }],
      ["x-axis L --> R\nx-axis M -->", { left: "M ⟶", right: "R" }],
      ["x-axis L\nx-axis M --> N", { left: "M", right: "N" }],
    ]
    for (const [statements, expected] of cases) {
      expect((await summary(`quadrantChart\n  ${statements}\n`)).xAxis).toEqual(
        expected,
      )
      expect(
        (
          await summary(
            `quadrantChart\n  ${statements.replaceAll("x-axis", "y-axis")}\n`,
          )
        ).yAxis,
      ).toEqual(
        Object.fromEntries(
          Object.entries(expected as Record<string, string>).map(
            ([key, value]) => [key === "left" ? "bottom" : "top", value],
          ),
        ),
      )
    }
  })

  it("lists the classes in the order of their first definition, each with the styles of its last", async () => {
    const db = await summary(
      "quadrantChart\n  classDef a color: #f00\n  classDef b radius: 3\n  classDef a radius: 9\n",
    )
    expect(db.classes).toEqual([
      { name: "a", radius: 9 },
      { name: "b", radius: 3 },
    ])
  })

  it("lists a class that no point uses, and keeps the class name of a point that no class defines", async () => {
    const db = await summary(
      "quadrantChart\n  classDef used color: #f00\n  A:::other: [0.3, 0.6]\n",
    )
    expect(db.classes).toEqual([{ name: "used", color: "#f00" }])
    expect(db.points).toEqual([
      { text: "A", className: "other", x: "0.3", y: "0.6" },
    ])
  })

  it("keeps the styles of a point and of its class as written, and does not merge them", async () => {
    const db = await summary(
      "quadrantChart\n  classDef c color: #f00, radius: 2\n  A:::c: [0.3, 0.6] color: #00f\n",
    )
    expect(db.classes).toEqual([{ name: "c", color: "#f00", radius: 2 }])
    expect(db.points).toEqual([
      { text: "A", className: "c", x: "0.3", y: "0.6", color: "#00f" },
    ])
  })

  it("records a radius of so many digits that the number is infinite as the text of the number", async () => {
    const digits = "9".repeat(400)
    const db = await summary(
      `quadrantChart\n  classDef c radius: ${digits}\n  A: [0.3, 0.6] radius: ${digits}\n`,
    )
    expect(db.classes).toEqual([{ name: "c", radius: "Infinity" }])
    expect(db.points).toEqual([
      { text: "A", className: "", x: "0.3", y: "0.6", radius: "Infinity" },
    ])
  })

  it("records the radius as the number the digits make", async () => {
    expect(
      (await summary("quadrantChart\n  A: [0.3, 0.6] radius: 007\n")).points,
    ).toEqual([{ text: "A", className: "", x: "0.3", y: "0.6", radius: 7 }])
  })

  it("has the fields it keeps and none that it drops", async () => {
    const db = await summary(KEPT_FIELDS)
    expect(Object.keys(db)).toEqual([
      "title",
      "accTitle",
      "accDescr",
      "quadrants",
      "xAxis",
      "yAxis",
      "points",
      "classes",
    ])
    for (const point of db.points as object[]) {
      expect(Object.keys(point)).not.toContain("fill")
      expect(Object.keys(point)).not.toContain("textFill")
    }
  })

  it("does not change with the settings of the chart or the theme", async () => {
    const settings = {
      theme: "dark",
      themeVariables: { quadrant1Fill: "#ff0000" },
      quadrantChart: {
        chartWidth: 100,
        chartHeight: 50,
        pointRadius: 20,
        xAxisPosition: "top",
        yAxisPosition: "right",
      },
    }
    expect(await summary(KEPT_FIELDS, settings)).toEqual(
      await summary(KEPT_FIELDS),
    )
  })

  it("stops where a setting of the site hides the labels of an axis, since the summary would lose the text", async () => {
    const text = "quadrantChart\n  x-axis L --> R\n  y-axis B\n"
    const hiding: MermaidConfig[] = [
      { quadrantChart: { showXAxis: false } },
      { quadrantChart: { showYAxis: false } },
    ]
    for (const config of hiding) {
      await expect(runMermaid(text, { config })).rejects.toThrow(
        MermaidEnvironmentError,
      )
    }
    // Nothing is lost where the text sets no text of that axis.
    expect(
      (
        await summary("quadrantChart\n  y-axis B\n", {
          quadrantChart: { showXAxis: false },
        })
      ).yAxis,
    ).toEqual({ bottom: "B", top: "" })
  })

  it("records the texts with the characters replaced under a securityLevel that is no value of mermaid.js", async () => {
    const text =
      'quadrantChart\n  title <b>T</b>\n  x-axis "<i>X" --> "<u>Y"\n  quadrant-1 "<b>Q"\n  "<i>P": [0.3, 0.6]\n'
    expect(await summary(text, { securityLevel: "other" })).toMatchObject({
      title: "&lt;b&gt;T&lt;/b&gt;",
      xAxis: { left: "&lt;i&gt;X", right: "&lt;u&gt;Y" },
      quadrants: ["&lt;b&gt;Q", "", "", ""],
      points: [{ text: "&lt;i&gt;P" }],
    })
    expect(await summary(text, { securityLevel: "loose" })).toMatchObject({
      title: "<b>T</b>",
    })
  })

  it("refuses a Db that the patch was not applied to", () => {
    expect(() => normalizeQuadrant({})).toThrow(TypeError)
  })
})
