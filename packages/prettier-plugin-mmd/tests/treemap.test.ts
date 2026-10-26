/** Escaped treemap Unicode/control/EOL cases keep their contextual reading. */
import { describe, expect, it } from "vitest"
import { formatMermaid } from "./helpers.ts"
import {
  dbOfText,
  defaultEmbedded,
  describeFrontmatterChange,
  treeProblemsOfText,
  writtenEmbeddedTexts,
  writtenTextKeptUpToSemicolons,
} from "./db-reading.ts"
import { treemapCases } from "./treemap-cases.ts"

/** The source Prettier gives the parser, without a leading byte order mark. */
function parserText(text: string): string {
  return text.startsWith("\ufeff") ? text.slice(1) : text
}

describe("treemap escaped cases", () => {
  it.each(treemapCases)("$name", async (fixture) => {
    const { input, output, options } = fixture
    expect(await formatMermaid(input, "diagram.mmd", options)).toBe(output)
    expect(await formatMermaid(output, "diagram.mmd", options)).toBe(output)
    const before = parserText(input)
    const after = parserText(output)
    const embedded = defaultEmbedded()
    expect(dbOfText(after, embedded)).toEqual(dbOfText(before, embedded))
    expect(writtenEmbeddedTexts(after)).toEqual(writtenEmbeddedTexts(before))
    expect(await describeFrontmatterChange(before, after, options)).toBeNull()
    expect(writtenTextKeptUpToSemicolons(before, after)).toBe(true)
    expect(treeProblemsOfText(before)).toEqual([])
    expect(treeProblemsOfText(after)).toEqual([])
  })
})
