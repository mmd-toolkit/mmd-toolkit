/**
 * Checks each formatting fixture: the input formats to the output, the
 * output is already formatted, and the Db and embedded data stay the same
 * except for the independently checked eventmodeling data and state note
 * margins. Source comparison ignores frontmatter and whitespace and allows
 * only semicolon removals (see `db-reading.ts` and the margin helpers).
 * The outputs are written by
 * `pnpm --filter prettier-plugin-mmd run test:update` and reviewed as diffs;
 * this test never writes them.
 */
import { describe, expect, it } from "vitest"
import * as prettier from "prettier"
import plugin from "../src/index.ts"
import type { FormatFixture } from "./fixtures.ts"
import { loadFormatFixtures } from "./fixtures.ts"
import {
  dbOfText,
  defaultEmbedded,
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

/** Formats a fixture text with the fixture's options. */
function format(fixture: FormatFixture, text: string): Promise<string> {
  return prettier.format(text, {
    ...fixture.options,
    filepath: "fixture.mmd",
    plugins: [plugin],
  })
}

const fixtures = await loadFormatFixtures()

describe("formatting fixtures", () => {
  it("exist", () => {
    expect(fixtures.length).toBeGreaterThan(0)
  })

  it.each(fixtures.map((fixture) => [fixture.id, fixture] as const))(
    "%s",
    async (_id, fixture) => {
      expect(
        fixture.output,
        `${fixture.outputPath} is missing; run pnpm --filter prettier-plugin-mmd run test:update`,
      ).not.toBeNull()
      const output = fixture.output as string
      expect(await format(fixture, fixture.input)).toBe(output)
      const twice = await format(fixture, output)
      expect(twice).toBe(output)
      expect(await format(fixture, twice)).toBe(twice)
      expect(writtenTextKeptUpToSemicolons(fixture.input, output), output).toBe(
        true,
      )
      const embedded = defaultEmbedded()
      const dbBefore = dbOfText(fixture.input, embedded)
      const dbAfter = dbOfText(output, embedded)
      const writtenBefore = writtenEmbeddedTexts(fixture.input)
      const writtenAfter = writtenEmbeddedTexts(output)
      const isEventmodeling = fixture.id.startsWith("eventmodeling/")
      expect(
        isEventmodeling
          ? eventmodelingDbForFormattingComparison(dbBefore, dbAfter)
          : fixture.id.startsWith("state/")
            ? stateDbForFormattingComparison(
                dbBefore,
                dbAfter,
                fixture.input,
                output,
              )
            : dbAfter,
      ).toEqual(dbBefore)
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
      ).toEqual(writtenBefore)
      expect(
        await describeFrontmatterChange(fixture.input, output, fixture.options),
      ).toBeNull()
    },
  )
})

describe("written semicolon boundaries", () => {
  it.each([
    [
      "style terminator after a directive",
      "classDiagram\nclass A\nstyle A fill:#f00 %%{init: {}}%% ;\n",
      "classDiagram\nclass A\nstyle A fill:#f00 %%{init: {}}%%\n",
      true,
    ],
    [
      "ER terminating unit",
      "erDiagram\nstyle A fill:red;\n",
      "erDiagram\nstyle A fill:red\n",
      true,
    ],
    [
      "state final style character",
      "stateDiagram-v2\nclassDef c fill:red;\n",
      "stateDiagram-v2\nclassDef c fill:red\n",
      true,
    ],
    [
      "class member text",
      "classDiagram\nclass A {\nvalue;\n}\n",
      "classDiagram\nclass A {\nvalue\n}\n",
      false,
    ],
    [
      "state transition id",
      "stateDiagram-v2\nA --> B;\n",
      "stateDiagram-v2\nA --> B\n",
      false,
    ],
    [
      "interior style character",
      "stateDiagram-v2\nclassDef c fill:r;ed\n",
      "stateDiagram-v2\nclassDef c fill:red\n",
      false,
    ],
    [
      "directive argument",
      'classDiagram\nclass A\n%%{init: {"value": "x;y"}}%%\n',
      'classDiagram\nclass A\n%%{init: {"value": "xy"}}%%\n',
      false,
    ],
    [
      "comment text",
      "classDiagram\nclass A\n%% keep;\n",
      "classDiagram\nclass A\n%% keep\n",
      false,
    ],
  ])("%s", (_title, before, after, kept) => {
    expect(writtenTextKeptUpToSemicolons(before, after)).toBe(kept)
  })
})
