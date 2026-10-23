/** Escaped Ishikawa Unicode/control/EOL cases keep their contextual reading. */
import { describe, expect, it } from "vitest"
import {
  formatMermaid,
  formatMarkdown,
  formatMarkdownWithoutPlugin,
} from "./helpers.ts"
import {
  dbOfText,
  treeProblemsOfText,
  defaultEmbedded,
  writtenEmbeddedTexts,
  describeFrontmatterChange,
} from "./db-reading.ts"
import { ishikawaCases } from "./ishikawa-cases.ts"

describe("ishikawa escaped cases", () => {
  it.each(ishikawaCases)("$name", async (fixture) => {
    const { input, output, options } = fixture
    if (fixture.rejected) {
      expect(output).toBe(input)
      await expect(
        formatMermaid(input, "diagram.mmd", options),
      ).rejects.toBeInstanceOf(SyntaxError)
      const markdown = `\`\`\`mermaid\n${input}\n\`\`\`\n`
      expect(await formatMarkdown(markdown)).toBe(
        await formatMarkdownWithoutPlugin(markdown),
      )
      return
    }
    expect(await formatMermaid(input, "diagram.mmd", options)).toBe(output)
    expect(await formatMermaid(output, "diagram.mmd", options)).toBe(output)
    const before = input.startsWith("\ufeff") ? input.slice(1) : input
    const after = output.startsWith("\ufeff") ? output.slice(1) : output
    expect(dbOfText(after, defaultEmbedded())).toEqual(
      dbOfText(before, defaultEmbedded()),
    )
    expect(writtenEmbeddedTexts(after)).toEqual(writtenEmbeddedTexts(before))
    expect(await describeFrontmatterChange(before, after, options)).toBeNull()
    expect(treeProblemsOfText(before)).toEqual([])
    expect(treeProblemsOfText(after)).toEqual([])
  })
})
