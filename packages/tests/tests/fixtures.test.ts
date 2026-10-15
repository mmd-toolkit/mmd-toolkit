import { readFile } from "node:fs/promises"
import path from "node:path"
import { beforeAll, describe, expect, it } from "vitest"
import type { DiagramType, Fixture } from "../src/index.ts"
import {
  KNOWN_DIVERGENCES,
  allowsUnsummarizedDb,
  embeddedValuesOf,
  getDefaultConfig,
  getFixturesRoot,
  loadFixtures,
  parseExpectedFile,
  serializeExpectedFile,
} from "../src/index.ts"
import { getNormalizer } from "../src/normalizers/index.ts"

// Reading every fixture takes 0.5 to 3 s alone and grows with the fixtures.
const READS_EVERY_FIXTURE = 30_000

const DIAGRAMS: readonly DiagramType[] = [
  "common",
  "flowchart",
  "sequence",
  "class",
  "state",
  "er",
  "gantt",
  "journey",
  "requirement",
  "mindmap",
  "timeline",
  "sankey",
  "xychart",
  "quadrant",
]

/** Every fixture, read once for all the tests of this file. */
let allFixtures: Fixture[]

/** The fixture `name` of the diagram type `diagram`. */
function named(diagram: string, name: string): Fixture {
  const found = allFixtures.find(
    (fixture) => fixture.diagram === diagram && fixture.name === name,
  )
  if (found === undefined) throw new Error(`no fixture ${diagram}/${name}`)
  return found
}

/** The fixtures of `diagram`. */
function fixturesOf(diagram: DiagramType): Fixture[] {
  return allFixtures.filter((fixture) => fixture.diagram === diagram)
}

beforeAll(async () => {
  allFixtures = (
    await Promise.all(DIAGRAMS.map((diagram) => loadFixtures(diagram)))
  ).flat()
}, READS_EVERY_FIXTURE)

describe("fixtures", () => {
  it("loads flowchart fixtures", () => {
    const fixtures = fixturesOf("flowchart")
    expect(fixtures.length).toBeGreaterThan(0)
    for (const fixture of fixtures) {
      expect(typeof fixture.input).toBe("string")
      expect(["mermaid", "authored"]).toContain(fixture.source.kind)
      if (fixture.expected.accepted) {
        expect(fixture.expected.diagramType).toMatch(
          /^flowchart-v2$|^flowchart-elk$|^swimlane$/u,
        )
      } else {
        expect(typeof fixture.expected.error.name).toBe("string")
      }
    }
  })

  it("loads sequence fixtures", () => {
    const fixtures = fixturesOf("sequence")
    expect(fixtures.length).toBeGreaterThan(0)
    for (const fixture of fixtures) {
      if (fixture.expected.accepted) {
        expect(fixture.expected.diagramType).toBe("sequence")
      }
    }
  })

  it("loads class fixtures", () => {
    const fixtures = fixturesOf("class")
    expect(fixtures.length).toBeGreaterThan(0)
    for (const fixture of fixtures) {
      if (fixture.expected.accepted) {
        expect(fixture.expected.diagramType).toBe("classDiagram")
      }
    }
  })

  it("loads state fixtures", () => {
    const fixtures = fixturesOf("state")
    expect(fixtures.length).toBeGreaterThan(0)
    for (const fixture of fixtures) {
      if (fixture.expected.accepted) {
        expect(fixture.expected.diagramType).toBe("stateDiagram")
      }
    }
  })

  it("loads er fixtures", () => {
    const fixtures = fixturesOf("er")
    expect(fixtures.length).toBeGreaterThan(0)
    for (const fixture of fixtures) {
      if (fixture.expected.accepted) {
        expect(fixture.expected.diagramType).toBe("er")
      }
    }
  })

  it("loads common fixtures", () => {
    const fixtures = fixturesOf("common")
    expect(fixtures.length).toBeGreaterThan(0)
    for (const fixture of fixtures) {
      expect(fixture.diagram).toBe("common")
    }
  })

  it(
    "stores every expected.json in canonical form",
    async () => {
      for (const fixture of allFixtures) {
        const file = path.join(
          getFixturesRoot(),
          fixture.diagram,
          fixture.name,
          "expected.json",
        )
        const json = await readFile(file, "utf8")
        expect(
          serializeExpectedFile(parseExpectedFile(json, fixture.name)),
        ).toBe(json)
      }
    },
    READS_EVERY_FIXTURE,
  )

  it("keeps knownDivergence in the hand-written head, after config", () => {
    const json = serializeExpectedFile({
      source: { kind: "authored", note: "n" },
      config: { securityLevel: "loose" },
      knownDivergence: "directive-as-token-boundary",
      accepted: false,
      error: { name: "Error", message: "m" },
    })
    expect(Object.keys(JSON.parse(json) as object)).toEqual([
      "source",
      "config",
      "knownDivergence",
      "accepted",
      "error",
    ])
    expect(parseExpectedFile(json, "x").knownDivergence).toBe(
      "directive-as-token-boundary",
    )
  })

  it("accepts only known divergence identifiers", () => {
    expect(() =>
      parseExpectedFile(
        '{"source":{"kind":"authored","note":"n"},"knownDivergence":"typo","accepted":false,"error":{"name":"Error","message":"m"}}',
        "x",
      ),
    ).toThrow(/knownDivergence/u)
    expect(KNOWN_DIVERGENCES).toContain("directive-as-token-boundary")
  })

  it("lists every known divergence in both READMEs", async () => {
    for (const readme of ["README.md", "README.ja.md"]) {
      const items = listItems(
        await readFile(path.join(import.meta.dirname, "..", readme), "utf8"),
      )
      for (const id of KNOWN_DIVERGENCES) {
        expect(
          items.some((item) => item.startsWith(`\`${id}\`:`)),
          `${readme}: a list item for ${id}`,
        ).toBe(true)
      }
    }
  })

  it("accepts db null, which only common/ may use", () => {
    const file = parseExpectedFile(
      '{"source":{"kind":"authored","note":"n"},"accepted":true,"diagramType":"ishikawa","db":null}',
      "x",
    )
    expect(file).toMatchObject({ accepted: true, db: null })
    expect(allowsUnsummarizedDb("common")).toBe(true)
    expect(allowsUnsummarizedDb("flowchart")).toBe(false)
  })

  it("records db null exactly when the diagram type has no normalizer", () => {
    for (const fixture of allFixtures) {
      if (!fixture.expected.accepted) continue
      const hasNormalizer =
        getNormalizer(fixture.expected.diagramType) !== undefined
      expect(fixture.expected.db === null, fixture.name).toBe(!hasNormalizer)
      if (fixture.expected.db === null) {
        expect(allowsUnsummarizedDb(fixture.diagram), fixture.name).toBe(true)
      }
    }
  })

  /**
   * The marks of the known divergences whose fixtures hold the reading of the
   * specification in `specified.json` where it differs from `expected.json`:
   * one changes the detector of C4 of mermaid.js, five change its lexer, and
   * three change the text it reads (the frontmatter, the bare `%%` lines, the
   * blank lines of a mindmap).
   */
  const READING_MARKS = [
    "c4-keyword-anywhere",
    "comment-takes-character",
    "comment-takes-line-break",
    "name-start-reads-unit",
    "percent-brace-after-unit",
    "title-digit-after-axis-statement",
    "html-tag-in-frontmatter",
    "bare-percent-line-before-header",
    "blank-line-after-header-or-comments",
  ]

  it("has a specified reading for the fixtures of each mark that changes how mermaid.js reads", () => {
    for (const mark of READING_MARKS) {
      const marked = allFixtures.filter(
        (fixture) => fixture.knownDivergence === mark,
      )
      expect(marked.length, mark).toBeGreaterThan(0)
      // A reading that changed nothing would make the comparison with it the
      // comparison with mermaid.js as it is.
      expect(
        marked.filter((fixture) => fixture.specified !== undefined).length,
        mark,
      ).toBeGreaterThan(0)
    }
  })

  it("has a specified reading only in a fixture with such a mark, and one that differs from the recorded result", () => {
    for (const fixture of allFixtures) {
      if (fixture.specified === undefined) continue
      const label = `${fixture.diagram}/${fixture.name}`
      expect(READING_MARKS, label).toContain(fixture.knownDivergence)
      const { embedded: _expectedEmbedded, ...expected } =
        fixture.expected as Record<string, unknown>
      const { embedded: _specifiedEmbedded, ...specified } =
        fixture.specified as Record<string, unknown>
      expect(specified, label).not.toEqual(expected)
    }
  })

  it("builds the embedded values of a fixture from the defaults, its config and what it records", () => {
    /** The value of `flowchart.inheritDir` in the embedded values of `fixture`. */
    function inheritDirOf(fixture: Fixture): unknown {
      const config = embeddedValuesOf(fixture)?.config as {
        flowchart?: { inheritDir?: unknown }
      }
      return config.flowchart?.inheritDir
    }

    expect(inheritDirOf(named("flowchart", "config-inherit-dir-default"))).toBe(
      false,
    )
    expect(inheritDirOf(named("flowchart", "config-inherit-dir-site"))).toBe(
      true,
    )
    expect(
      inheritDirOf(named("flowchart", "config-inherit-dir-frontmatter")),
    ).toBe(true)
    expect(
      embeddedValuesOf(
        named("common", "frontmatter-title-escaped-quotes-in-tag"),
      )?.title,
    ).toBeDefined()
  })

  it("takes the embedded values from the specified reading, which may be a rejection", () => {
    // mermaid.js accepts the input and records the title `<a`; the specified
    // reading rejects it, so there are no values to give by default.
    const rejectedWhenSpecified = named(
      "flowchart",
      "html-tag-starts-in-frontmatter",
    )
    expect(rejectedWhenSpecified.specified?.accepted).toBe(false)
    expect(embeddedValuesOf(rejectedWhenSpecified)).toBeUndefined()
    expect(
      embeddedValuesOf(rejectedWhenSpecified, rejectedWhenSpecified.expected)
        ?.title,
    ).toBe("<a")

    // mermaid.js rejects the input; the specified reading accepts it, with
    // the values of its own.
    const acceptedWhenSpecified = named(
      "flowchart",
      "html-tag-starts-in-frontmatter-value",
    )
    expect(acceptedWhenSpecified.expected.accepted).toBe(false)
    expect(embeddedValuesOf(acceptedWhenSpecified)?.title).toBe("<a z='")
    expect(
      embeddedValuesOf(acceptedWhenSpecified, acceptedWhenSpecified.expected),
    ).toBeUndefined()
  })

  it("holds the default configuration, which the recorded configurations differ from", () => {
    const config = getDefaultConfig()
    expect(typeof config).toBe("object")
    expect(Object.keys(config).length).toBeGreaterThan(0)
  })

  it("rejects malformed expected.json", () => {
    expect(() => parseExpectedFile("{}", "x")).toThrow(/source/u)
    expect(() =>
      parseExpectedFile(
        '{"source":{"kind":"authored","note":"n"},"accepted":true}',
        "x",
      ),
    ).toThrow(/diagramType/u)
    expect(() =>
      parseExpectedFile(
        '{"source":{"kind":"authored","note":"n"},"accepted":false}',
        "x",
      ),
    ).toThrow(/error/u)
  })
})

/**
 * The items of the bullet lists of a Markdown text, each with its continuation
 * lines joined by a space, so that where Prettier wraps a line does not matter.
 */
function listItems(markdown: string): string[] {
  const items: string[] = []
  let current: string | undefined
  for (const line of markdown.split("\n")) {
    const text = line.trim()
    if (text.startsWith("- ")) {
      if (current !== undefined) items.push(current)
      current = text.slice("- ".length)
    } else if (text && current !== undefined && line.startsWith(" ")) {
      current += ` ${text}`
    } else if (current !== undefined) {
      items.push(current)
      current = undefined
    }
  }
  if (current !== undefined) items.push(current)
  return items
}
