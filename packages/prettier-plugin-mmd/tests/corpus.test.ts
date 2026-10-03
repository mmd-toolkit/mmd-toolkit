/**
 * Runs the formatter over every input of the conformance corpus that it
 * formats, and checks the two guarantees that hold for any input: formatting
 * again changes nothing, and mermaid.js reads the same diagram before and
 * after (see `describeReadingChange`). The formatted texts are not stored; the fixtures under
 * `tests/fixtures/` show the formatting itself.
 */
import { describe, expect, it } from "vitest"
import type { Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { RunMermaidOptions } from "@mmd-toolkit/tests/mermaid"
import { parseDocument } from "../src/parser.ts"
import { formatMermaid } from "./helpers.ts"
import {
  describeReadingChange,
  readingsOfFixture,
  readWithMermaid,
} from "./mermaid-readings.ts"

/**
 * Whether the plugin formats the input, rather than printing it as written
 * or reporting a syntax error.
 *
 * Prettier removes a byte order mark at the start of the text before it
 * calls the parser, so the parser is given the text without it. For
 * frontmatter that repeats the mark before its closing delimiter, that text
 * has no frontmatter and is rejected; the README lists this as a known
 * limitation, and `failure.test.ts` checks it.
 */
function isFormatted(fixture: Fixture): boolean {
  const text = fixture.input.startsWith("\uFEFF")
    ? fixture.input.slice(1)
    : fixture.input
  try {
    return parseDocument(text).type === "FormattedDocument"
  } catch {
    return false
  }
}

const fixtures = [
  ...(await loadFixtures("common")),
  ...(await loadFixtures("flowchart")),
  ...(await loadFixtures("sequence")),
  ...(await loadFixtures("class")),
  ...(await loadFixtures("state")),
].filter(isFormatted)

describe("the conformance corpus", () => {
  it("has inputs that the plugin formats", () => {
    expect(fixtures.length).toBeGreaterThan(0)
  })

  it.each(
    fixtures.map(
      (fixture) => [`${fixture.diagram}/${fixture.name}`, fixture] as const,
    ),
  )(
    "%s: formatting is idempotent and keeps the diagram",
    async (_name, fixture) => {
      const output = await formatMermaid(fixture.input)
      expect(await formatMermaid(output)).toBe(output)
      const options: RunMermaidOptions =
        fixture.config === undefined ? {} : { config: fixture.config }
      expect(
        describeReadingChange(
          readingsOfFixture(fixture) ??
            (await readWithMermaid(fixture.input, options)),
          await readWithMermaid(output, options),
        ),
        output,
      ).toBeNull()
    },
  )
})
