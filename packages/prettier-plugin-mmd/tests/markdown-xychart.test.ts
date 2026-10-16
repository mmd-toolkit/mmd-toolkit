/**
 * Formats XY charts in Markdown code blocks with the real parser and
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

describe("an XY chart in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        '# Title\n\n```mermaid\n  xychart-beta\n\n  title   Two  words\nx-axis[ a ,b ]\nline Sales[1 "x" , 2]\n```\n',
      ),
    ).toBe(
      '# Title\n\n```mermaid\nxychart-beta\n  title Two words\n  x-axis [a, b]\n  line Sales [1 "x", 2]\n```\n',
    )
  })

  it("is formatted in a list item, with the lines under the fence of the item", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  xychart\n    title T line [1]\n  ```\n",
      ),
    ).toBe(
      "- item\n\n  ```mermaid\n  xychart\n    title T\n    line [1]\n  ```\n",
    )
  })

  it("keeps a block that is not closed as written", async () => {
    expect(
      await formatTwice("```mermaid\nxychart\naccDescr {\n  a\n```\n"),
    ).toBe("```mermaid\nxychart\n  accDescr {\n  a\n```\n")
  })
})
