/**
 * Formats block diagrams in Markdown code blocks with the real parser and
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

describe("a block diagram in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        "# Title\n\n```mermaid\n  block-beta\n\n  columns   3 a b\nblock:G c end\nd-->e\n```\n",
      ),
    ).toBe(
      "# Title\n\n```mermaid\nblock-beta\n  columns 3\n  a b\n  block:G\n    c\n  end\n  d --> e\n```\n",
    )
  })

  it("is formatted in a list item, with the lines under the fence of the item", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  block-beta\n    columns 2 a b\n  ```\n",
      ),
    ).toBe(
      "- item\n\n  ```mermaid\n  block-beta\n    columns 2\n    a b\n  ```\n",
    )
  })

  it("keeps the whitespace inside a label", async () => {
    expect(
      await formatTwice('```mermaid\nblock-beta\nA["a    b"]\n```\n'),
    ).toBe('```mermaid\nblock-beta\n  A["a    b"]\n```\n')
  })
})
