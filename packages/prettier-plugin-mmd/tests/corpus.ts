/**
 * Runs the formatter over every input of the conformance corpus that it
 * formats, and checks the guarantees that hold for any input: formatting again
 * changes nothing, source comparison ignores frontmatter and whitespace and
 * allows only semicolon removals, and the embedded data is as written (see
 * `writtenEmbeddedTexts`).
 * The Db that the tree of the formatted text denotes matches the corpus's
 * recorded Db except for permitted eventmodeling data and state note margins,
 * checked independently with their authored source before Db comparison. The
 * formatted texts are not stored; the fixtures under `tests/fixtures/` show the
 * formatting itself.
 */
import { describe, expect, it } from "vitest"
import type { DiagramType, Fixture } from "@mmd-toolkit/tests"
import { embeddedValuesOf, loadFixtures } from "@mmd-toolkit/tests"
import { parseDocument } from "../src/parser.ts"
import { formatMermaid } from "./helpers.ts"
import {
  dbOfText,
  describeFrontmatterChange,
  writtenEmbeddedTexts,
  writtenTextKeptUpToSemicolons,
} from "./db-reading.ts"
import { dataBlockEmbeddedForFormattingComparison } from "./data-block-margins.ts"
import {
  eventmodelingDbForFormattingComparison,
  eventmodelingEmbeddedForFormattingComparison,
} from "./eventmodeling-data-margins.ts"
import { stateDbForFormattingComparison } from "./state-note-margins.ts"

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
  try {
    return (
      parseDocument(withoutByteOrderMark(fixture.input)).type ===
      "FormattedDocument"
    )
  } catch {
    return false
  }
}

/** The text as the parser is given it: Prettier removes a byte order mark first. */
function withoutByteOrderMark(text: string): string {
  return text.startsWith("\uFEFF") ? text.slice(1) : text
}

/**
 * Whether the parser rejects the input, as the corpus records for the fixtures
 * that have a `parse-error.json`. A text of only whitespace is not given to
 * the parser: Prettier formats it as empty.
 */
function isRejected(fixture: Fixture): boolean {
  if (fixture.input.trim() === "") return false
  try {
    parseDocument(withoutByteOrderMark(fixture.input))
    return false
  } catch {
    return true
  }
}

/**
 * Registers the corpus checks for one diagram. Each diagram has a test file so
 * Vitest can run these checks in parallel without duplicating their assertions.
 */
export async function testCorpus(diagram: DiagramType): Promise<void> {
  const allFixtures = await loadFixtures(diagram)
  const fixtures = allFixtures.filter(isFormatted)
  const rejectedFixtures = allFixtures.filter(isRejected)

  describe("the conformance corpus", () => {
    it("has inputs that the plugin formats", () => {
      expect(fixtures.length).toBeGreaterThan(0)
    })

    it.each(
      fixtures.map(
        (fixture) => [`${fixture.diagram}/${fixture.name}`, fixture] as const,
      ),
    )("%s: idempotence and permitted Db changes", async (_name, fixture) => {
      const input = withoutByteOrderMark(fixture.input)
      const output = await formatMermaid(fixture.input)
      const twice = await formatMermaid(output)
      expect(twice).toBe(output)
      expect(await formatMermaid(twice)).toBe(twice)
      const formatted = withoutByteOrderMark(output)
      const writtenBefore = writtenEmbeddedTexts(input)
      const writtenAfter = writtenEmbeddedTexts(formatted)
      const isEventmodeling = fixture.diagram === "eventmodeling"
      expect(
        isEventmodeling
          ? eventmodelingEmbeddedForFormattingComparison(
              writtenBefore,
              writtenAfter,
            )
          : dataBlockEmbeddedForFormattingComparison(
              writtenBefore,
              writtenAfter,
            ),
        output,
      ).toEqual(writtenBefore)
      expect(await describeFrontmatterChange(input, formatted)).toBeNull()
      expect(writtenTextKeptUpToSemicolons(input, formatted), output).toBe(true)
      const recorded = fixture.specified ?? fixture.expected
      const embedded = embeddedValuesOf(fixture, recorded)
      if (!recorded.accepted || recorded.db === null || embedded === undefined)
        return
      const formattedDb = dbOfText(formatted, embedded)
      expect(
        isEventmodeling
          ? eventmodelingDbForFormattingComparison(recorded.db, formattedDb)
          : fixture.diagram === "state"
            ? stateDbForFormattingComparison(
                recorded.db,
                formattedDb,
                input,
                formatted,
              )
            : formattedDb,
        output,
      ).toEqual(recorded.db)
    })
  })

  describe("the inputs of the corpus that the parser rejects", () => {
    it("are listed", () => {
      expect(rejectedFixtures.length).toBeGreaterThan(0)
    })

    it.each(
      rejectedFixtures.map(
        (fixture) => [`${fixture.diagram}/${fixture.name}`, fixture] as const,
      ),
    )("%s: formatting reports a syntax error", async (_name, fixture) => {
      await expect(formatMermaid(fixture.input)).rejects.toBeInstanceOf(
        SyntaxError,
      )
    })
  })
}
