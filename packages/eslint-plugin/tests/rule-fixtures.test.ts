/**
 * Checks the fixture directories of the rules, `tests/fixtures/rules/<name>/`.
 * Each belongs to a rule. An input under `valid/<diagram>/` or
 * `invalid/<diagram>/`, where `<diagram>` is a directory of the conformance
 * corpus, is a copy of the input of the corpus fixture of the same name, which
 * records what mermaid.js does with it (`expected.json`): the copy stays the
 * same as the corpus, byte for byte. No input stands directly under `valid/` or
 * `invalid/`: a rule checks only inputs of which the corpus records what
 * mermaid.js does.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { DiagramType, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import { rules } from "../src/rules/index.ts"
import { isDiagramType } from "./helpers.ts"
import { INPUT_SUFFIX, inputFiles, RULE_FIXTURES_DIR } from "./rule-cases.ts"

/** The kinds of the cases, each a directory of a rule's fixtures. */
const KINDS = ["valid", "invalid"] as const

/**
 * The directories under `RULE_FIXTURES_DIR` that hold `valid/` or `invalid/`,
 * as paths relative to it: the rule names that they are for.
 */
function fixtureRuleNames(directory = ""): string[] {
  const names: string[] = []
  for (const entry of readdirSync(`${RULE_FIXTURES_DIR}${directory}`)) {
    const path = `${directory}${entry}`
    if (!statSync(`${RULE_FIXTURES_DIR}${path}`).isDirectory()) continue
    if ((KINDS as readonly string[]).includes(entry)) {
      names.push(directory.slice(0, -1))
    } else {
      names.push(...fixtureRuleNames(`${path}/`))
    }
  }
  return [...new Set(names)]
}

/** The copies of corpus inputs: each input file whose first directory names a corpus diagram type. */
const copies = fixtureRuleNames().flatMap((name) =>
  KINDS.flatMap((kind) => {
    const directory = `${RULE_FIXTURES_DIR}${name}/${kind}/`
    if (!existsSync(directory)) return []
    return inputFiles(directory).flatMap((file) => {
      const slash = file.indexOf("/")
      const diagram = slash === -1 ? "" : file.slice(0, slash)
      if (!isDiagramType(diagram)) return []
      return [
        {
          path: `${name}/${kind}/${file}`,
          diagram,
          fixture: file.slice(slash + 1, -INPUT_SUFFIX.length),
        },
      ]
    })
  }),
)

/** The input files that are no copy of a corpus input: those with no diagram directory. */
const direct = fixtureRuleNames().flatMap((name) =>
  KINDS.flatMap((kind) => {
    const directory = `${RULE_FIXTURES_DIR}${name}/${kind}/`
    if (!existsSync(directory)) return []
    return inputFiles(directory)
      .filter((file) => !isDiagramType(file.split("/")[0] ?? ""))
      .map((file) => `${name}/${kind}/${file}`)
  }),
)

/** The corpus fixtures of each diagram type, read once for all the copies. */
const corpus = new Map<DiagramType, Promise<Fixture[]>>()

/** The fixtures of the corpus directory of `diagram`. */
function corpusFixtures(diagram: DiagramType): Promise<Fixture[]> {
  const cached = corpus.get(diagram)
  if (cached !== undefined) return cached
  const loaded = loadFixtures(diagram)
  corpus.set(diagram, loaded)
  return loaded
}

describe("the fixture directories of the rules", () => {
  it("each belong to a rule", () => {
    for (const name of fixtureRuleNames()) {
      expect(rules).toHaveProperty([name])
    }
  })

  it("hold no input that is not a copy of a corpus input", () => {
    expect(direct).toEqual([])
  })

  it.each(copies.map((copy) => [copy.path, copy]))(
    "%s is the input of the corpus fixture of its name",
    async (_path, copy) => {
      const fixture = (await corpusFixtures(copy.diagram)).find(
        (candidate) => candidate.name === copy.fixture,
      )
      expect(fixture).toBeDefined()
      expect(readFileSync(`${RULE_FIXTURES_DIR}${copy.path}`, "utf8")).toBe(
        fixture?.input,
      )
    },
  )
})
