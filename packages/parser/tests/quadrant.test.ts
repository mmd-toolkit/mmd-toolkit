import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import { detectDiagram } from "../src/detection.ts"
import { diagramInputOf, openSource } from "../src/parse.ts"
import type { QuadrantUnits } from "../src/diagrams/quadrant/index.ts"
import { lexQuadrant } from "../src/diagrams/quadrant/index.ts"

describe("quadrant statement units", async () => {
  const fixtures = await loadFixtures("quadrant")

  /** Reads a fixed corpus input through the diagram's ordered lexical rules. */
  function unitsOf(name: string): QuadrantUnits {
    const fixture = fixtures.find((candidate) => candidate.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    const opened = openSource(fixture.input)
    return lexQuadrant(
      diagramInputOf(opened, detectDiagram(opened.lexer), "quadrantChart"),
    )
  }

  it("keeps each blank-line space and tab as one unit", () => {
    const { units } = unitsOf("db-whitespace-line-between-spaces-and-tab")
    expect(
      units
        .filter((unit) => unit.name === "space")
        .map((unit) => [unit.text, unit.start, unit.end]),
    ).toEqual([
      [" ", 27, 28],
      ["\t", 28, 29],
      [" ", 29, 30],
    ])
  })

  it("keeps every space of a run inside a point name", () => {
    const { units } = unitsOf("db-name-long-spaces")
    expect(
      units
        .filter((unit) => unit.name === "space")
        .map((unit) => [unit.text, unit.start, unit.end]),
    ).toEqual([
      [" ", 15, 16],
      [" ", 16, 17],
      [" ", 17, 18],
      [" ", 18, 19],
      [" ", 19, 20],
      [" ", 20, 21],
    ])
  })

  it.each([
    ["db-x-axis-indented", "x-axis", "  x-axis ", [16, 22]],
    ["db-x-axis-extra-spaces", "arrow", "  -->  ", [25, 28]],
    ["header-twice-indented", "header", "  quadrantChart", [16, 29]],
  ] as const)(
    "%s: reads the spaced keyword before one-character whitespace",
    (fixture, name, text, significantRange) => {
      const { units } = unitsOf(fixture)
      expect(units.find((unit) => unit.text === text)).toMatchObject({
        name,
        significantRange,
      })
    },
  )

  it.each([
    "db-point-space-and-line-feed-before-colon",
    "db-point-tab-and-line-feed-before-colon",
    "db-point-empty-line-before-colon",
    "db-point-comment-line-before-colon",
    "db-point-directive-line-before-colon",
  ])("%s: point lookahead takes whitespace across lines", (fixture) => {
    const { units } = unitsOf(fixture)
    expect(units.slice(2, 5).map((unit) => unit.name)).toEqual([
      "word",
      ":",
      "[",
    ])
  })

  it("reads a leading LF before trying point lookahead", () => {
    const { units } = unitsOf("gram-point-newline-before-bracket-open")
    expect(units.slice(2, 6).map((unit) => unit.name)).toEqual([
      "word",
      "newline",
      ":",
      "[",
    ])
  })

  it("keeps the spaces around a directive at their source positions", () => {
    const { units, text } = unitsOf("db-directive-line-spaces")
    expect(
      units
        .filter((unit) => unit.name === "space")
        .map((unit) => [unit.text, unit.start, unit.end]),
    ).toEqual([
      [" ", 14, 15],
      [" ", 15, 16],
      [" ", 30, 31],
      [" ", 31, 32],
    ])
    expect(text.directives).toEqual([[16, 30]])
  })

  it("keeps whitespace when a colon does not start a point", () => {
    const { units } = unitsOf("db-style-radius-spaced-colon")
    expect(units.slice(9, 14).map((unit) => [unit.name, unit.text])).toEqual([
      ["word", "radius"],
      ["space", " "],
      [":", ":"],
      ["space", " "],
      ["word", "10"],
    ])
  })

  it.each([
    [
      "db-quadrant-double-dash",
      [
        [26, 27],
        [27, 28],
      ],
    ],
    [
      "db-x-axis-dashes-after-text",
      [
        [22, 23],
        [23, 24],
      ],
    ],
    [
      "db-y-axis-dashes-after-text",
      [
        [22, 23],
        [23, 24],
      ],
    ],
    ["db-name-dash-at-end", [[15, 16]]],
  ] as const)("%s: keeps each text dash as one unit", (fixture, ranges) => {
    const { units } = unitsOf(fixture)
    expect(
      units
        .filter((unit) => unit.name === "-")
        .map((unit) => [unit.text, [unit.start, unit.end]]),
    ).toEqual(ranges.map((range) => ["-", range]))
  })

  it.each(["db-x-axis-long-arrow", "db-y-axis-long-arrow"])(
    "%s: reads the real arrow before one-character dashes",
    (fixture) => {
      const { units } = unitsOf(fixture)
      expect(
        units
          .filter((unit) => unit.name === "arrow")
          .map((unit) => [
            unit.text,
            unit.start,
            unit.end,
            unit.significantRange,
          ]),
      ).toEqual([[" ---> ", 22, 28, [23, 27]]])
    },
  )

  it("reads a separate arrow after a text dash", () => {
    const { units } = unitsOf("db-x-axis-dash-before-arrow")
    expect(
      units
        .slice(3, 7)
        .map((unit) => [unit.name, unit.text, unit.start, unit.end]),
    ).toEqual([
      ["word", "L", 21, 22],
      ["-", "-", 22, 23],
      ["arrow", " --> ", 23, 28],
      ["word", "R", 28, 29],
    ])
  })
})
