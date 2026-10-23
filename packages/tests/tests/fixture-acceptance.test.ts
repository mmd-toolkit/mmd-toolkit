import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  DIVERGENCE_PROPERTIES,
  KNOWN_DIVERGENCES,
  fixtureAccepts,
  loadFixtures,
} from "../src/index.ts"

describe("divergence properties", () => {
  it("lists exactly the identifiers in the specification and the loader", () => {
    const spec = readFileSync(
      new URL("../../spec/docs/known-divergences.md", import.meta.url),
      "utf8",
    )
    const identifiers = spec
      .split("\n")
      .filter((line) => line.startsWith("| [`"))
      .map((line) => {
        const from = line.indexOf("`") + 1
        return line.slice(from, line.indexOf("`", from))
      })
    expect([...DIVERGENCE_PROPERTIES.keys()].toSorted()).toEqual(
      identifiers.toSorted(),
    )
    expect([...DIVERGENCE_PROPERTIES.keys()].toSorted()).toEqual(
      KNOWN_DIVERGENCES.toSorted(),
    )
  })
})

describe("fixtureAccepts", async () => {
  const fixtures = await loadFixtures("pie")
  const accepted = fixtures.find((fixture) => fixture.name === "header-only")
  const rejected = fixtures.find(
    (fixture) => fixture.name === "header-letter-suffix",
  )
  if (accepted === undefined || rejected === undefined)
    throw new Error("missing pie header controls")

  it("uses mermaid's acceptance for an unmarked fixture", () => {
    expect(fixtureAccepts(accepted)).toBe(true)
    expect(fixtureAccepts(rejected)).toBe(false)
  })

  it("rejects a reject-only mark without a specified reading", () => {
    expect(
      fixtureAccepts({
        ...accepted,
        knownDivergence: "directive-as-token-boundary",
      }),
    ).toBe(false)
  })

  it("requires a specified reading for opaque embedded data", () => {
    expect(() =>
      fixtureAccepts({
        ...rejected,
        knownDivergence: "embedded-data-opaque",
      }),
    ).toThrow(
      `${rejected.diagram}/${rejected.name}: embedded-data-opaque requires specified.json`,
    )
  })

  it("uses opaque specified acceptance in both directions, including a reading without a Db", () => {
    expect(
      fixtureAccepts({
        ...rejected,
        knownDivergence: "embedded-data-opaque",
        specified: { accepted: true, diagramType: "pie", db: null },
      }),
    ).toBe(true)
    expect(
      fixtureAccepts({
        ...accepted,
        knownDivergence: "embedded-data-opaque",
        specified: rejected.expected,
      }),
    ).toBe(false)
  })

  for (const mark of [
    "c4-keyword-anywhere",
    "bare-percent-line-before-header",
    "percent-brace-after-unit",
    "blank-line-after-header-or-comments",
    "title-digit-after-axis-statement",
  ])
    it(`requires the comparison reading even for accept-only ${mark}`, () => {
      expect(() =>
        fixtureAccepts({ ...rejected, knownDivergence: mark }),
      ).toThrow(
        `${rejected.diagram}/${rejected.name}: ${mark} requires specified.json`,
      )
    })

  it("enforces every explicit reading requirement, naming the fixture and identifier", () => {
    for (const [mark, properties] of DIVERGENCE_PROPERTIES) {
      if (!properties.requiresSpecifiedReading) continue
      expect(() =>
        fixtureAccepts({ ...accepted, knownDivergence: mark }),
      ).toThrow(
        `${accepted.diagram}/${accepted.name}: ${mark} requires specified.json`,
      )
    }
  })

  it("uses specified acceptance in both directions", () => {
    expect(
      fixtureAccepts({
        ...rejected,
        knownDivergence: "html-tag-in-frontmatter",
        specified: accepted.expected,
      }),
    ).toBe(true)
    expect(
      fixtureAccepts({
        ...accepted,
        knownDivergence: "html-tag-in-frontmatter",
        specified: rejected.expected,
      }),
    ).toBe(false)
  })

  it("requires a reading to decide bidirectional acceptance", () => {
    expect(() =>
      fixtureAccepts({
        ...accepted,
        knownDivergence: "html-tag-in-frontmatter",
      }),
    ).toThrow(
      `${accepted.diagram}/${accepted.name}: html-tag-in-frontmatter requires specified.json`,
    )
  })

  it("uses a specified rejection even for an accept-only mark", () => {
    expect(
      fixtureAccepts({
        ...accepted,
        knownDivergence: "c4-keyword-anywhere",
        specified: rejected.expected,
      }),
    ).toBe(false)
  })

  it("rejects an unknown identifier with the fixture name", () => {
    expect(() =>
      fixtureAccepts({ ...accepted, knownDivergence: "toString" }),
    ).toThrow(
      `${accepted.diagram}/${accepted.name}: unknown divergence toString`,
    )
  })
})
