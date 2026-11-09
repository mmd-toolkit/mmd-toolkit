/** Escaped usecase Unicode/control/EOL cases keep their contextual reading. */
import { describe, expect, it } from "vitest"
import { formatMermaid } from "./helpers.ts"
import { dbForFormattingComparison } from "./db-comparison.ts"
import { dataBlockEmbeddedForFormattingComparison } from "./data-block-margins.ts"
import {
  dbOfText,
  defaultEmbedded,
  describeFrontmatterChange,
  treeProblemsOfText,
  writtenEmbeddedTexts,
} from "./db-reading.ts"
import { usecaseCases } from "./usecase-cases.ts"

describe("usecase escaped cases", () => {
  it.each(usecaseCases)("$name", async (fixture) => {
    const { input, output, options } = fixture
    expect(await formatMermaid(input, "diagram.mmd", options)).toBe(output)
    expect(await formatMermaid(output, "diagram.mmd", options)).toBe(output)
    const before = input.startsWith("\ufeff") ? input.slice(1) : input
    const after = output.startsWith("\ufeff") ? output.slice(1) : output
    const embedded = defaultEmbedded()
    const dbBefore = dbOfText(before, embedded)
    expect(
      dbForFormattingComparison(
        dbBefore,
        dbOfText(after, embedded),
        before,
        after,
      ),
    ).toEqual(dbBefore)
    expect(
      dataBlockEmbeddedForFormattingComparison(
        writtenEmbeddedTexts(before),
        writtenEmbeddedTexts(after),
      ),
    ).toEqual(writtenEmbeddedTexts(before))
    expect(await describeFrontmatterChange(before, after, options)).toBeNull()
    expect(treeProblemsOfText(before)).toEqual([])
    expect(treeProblemsOfText(after)).toEqual([])
  })
})
