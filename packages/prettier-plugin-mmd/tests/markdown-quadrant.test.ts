/**
 * Formats quadrant charts in Markdown code blocks with the real parser and
 * printer, as `markdown-flowchart.test.ts` does for flowcharts.
 */
import { describe, expect, it } from "vitest"
import { formatMarkdown } from "./helpers.ts"

/** Formats Markdown, and checks that formatting the result changes nothing. */
async function formatTwice(markdown: string): Promise<string> {
  const output = await formatMarkdown(markdown)
  expect(await formatMarkdown(output)).toBe(output)
  return output
}

describe("a quadrant chart in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        "# Title\n\n```mermaid\n  quadrantChart\n\n  title   Two  words\nx-axis L-->R\nCampaign A:[0.3,0.6]radius: 9\n```\n",
      ),
    ).toBe(
      "# Title\n\n```mermaid\nquadrantChart\n  title Two  words\n  x-axis L --> R\n  Campaign A: [0.3, 0.6] radius: 9\n```\n",
    )
  })

  it("is formatted in a list item, with the lines under the fence of the item", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  quadrantChart\n    quadrant-1 A; quadrant-2 B\n  ```\n",
      ),
    ).toBe(
      "- item\n\n  ```mermaid\n  quadrantChart\n    quadrant-1 A\n    quadrant-2 B\n  ```\n",
    )
  })

  it("keeps the whitespace inside a text", async () => {
    expect(
      await formatTwice("```mermaid\nquadrantChart\nquadrant-1 a    b\n```\n"),
    ).toBe("```mermaid\nquadrantChart\n  quadrant-1 a    b\n```\n")
  })
})
