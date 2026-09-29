import { readFile } from "node:fs/promises"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  KNOWN_DIVERGENCES,
  allowsUnsummarizedDb,
  getFixturesRoot,
  loadFixtures,
  parseExpectedFile,
  serializeExpectedFile,
} from "../src/index.ts"
import { getNormalizer } from "../src/normalizers/index.ts"

// Reading every fixture takes 0.5 to 3 s alone and grows with the fixtures.
const READS_EVERY_FIXTURE = 30_000

describe("fixtures", () => {
  it(
    "loads flowchart fixtures",
    async () => {
      const fixtures = await loadFixtures("flowchart")
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
    },
    READS_EVERY_FIXTURE,
  )

  it(
    "loads sequence fixtures",
    async () => {
      const fixtures = await loadFixtures("sequence")
      expect(fixtures.length).toBeGreaterThan(0)
      for (const fixture of fixtures) {
        if (fixture.expected.accepted) {
          expect(fixture.expected.diagramType).toBe("sequence")
        }
      }
    },
    READS_EVERY_FIXTURE,
  )

  it(
    "loads common fixtures",
    async () => {
      const fixtures = await loadFixtures("common")
      expect(fixtures.length).toBeGreaterThan(0)
      for (const fixture of fixtures) {
        expect(fixture.diagram).toBe("common")
      }
    },
    READS_EVERY_FIXTURE,
  )

  it(
    "stores every expected.json in canonical form",
    async () => {
      const fixtures = [
        ...(await loadFixtures("common")),
        ...(await loadFixtures("flowchart")),
        ...(await loadFixtures("sequence")),
      ]
      for (const fixture of fixtures) {
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

  it(
    "records db null exactly when the diagram type has no normalizer",
    async () => {
      const fixtures = [
        ...(await loadFixtures("common")),
        ...(await loadFixtures("flowchart")),
        ...(await loadFixtures("sequence")),
      ]
      for (const fixture of fixtures) {
        if (!fixture.expected.accepted) continue
        const hasNormalizer =
          getNormalizer(fixture.expected.diagramType) !== undefined
        expect(fixture.expected.db === null, fixture.name).toBe(!hasNormalizer)
        if (fixture.expected.db === null) {
          expect(allowsUnsummarizedDb(fixture.diagram), fixture.name).toBe(true)
        }
      }
    },
    READS_EVERY_FIXTURE,
  )

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
