/**
 * Formats sankey diagrams in Markdown code blocks with the real parser and
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

describe("a sankey diagram in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        '# Title\n\n```mermaid\n  sankey-beta\n\n  a , b , 1\n"c", d ,2\n```\n',
      ),
    ).toBe('# Title\n\n```mermaid\nsankey-beta\na,b,1\n"c",d,2\n```\n')
  })

  it("is formatted in a list item, with the lines at the first column of the item", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  sankey\n    a , b , 1\n  ```\n",
      ),
    ).toBe("- item\n\n  ```mermaid\n  sankey\n  a,b,1\n  ```\n")
  })

  it("keeps a value of spaces only before another record", async () => {
    expect(await formatTwice("```mermaid\nsankey\na,b,   \nc,d,2\n```\n")).toBe(
      "```mermaid\nsankey\na,b, \nc,d,2\n```\n",
    )
  })
})
