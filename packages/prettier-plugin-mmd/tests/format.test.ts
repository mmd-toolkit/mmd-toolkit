/**
 * Checks each formatting fixture: the input formats to the output, the
 * output is already formatted, and mermaid.js reads the same diagram from
 * both. The outputs are written by
 * `pnpm --filter prettier-plugin-mmd run test:update` and reviewed as diffs;
 * this test never writes them.
 */
import { describe, expect, it } from "vitest"
import * as prettier from "prettier"
import plugin from "../src/index.ts"
import type { FormatFixture } from "./fixtures.ts"
import { loadFormatFixtures } from "./fixtures.ts"
import { describeReadingChange, readWithMermaid } from "./mermaid-readings.ts"

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
      expect(await format(fixture, output)).toBe(output)
      expect(
        describeReadingChange(
          await readWithMermaid(fixture.input),
          await readWithMermaid(output),
        ),
      ).toBeNull()
    },
  )
})
