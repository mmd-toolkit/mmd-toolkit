/**
 * Formats mindmaps in Markdown code blocks with the real parser and printer,
 * as `markdown-flowchart.test.ts` does for flowcharts.
 */
import { describe, expect, it } from "vitest"
import { formatMarkdown } from "./helpers.ts"

/** Formats Markdown, and checks that formatting the result changes nothing. */
async function formatTwice(markdown: string): Promise<string> {
  const output = await formatMarkdown(markdown)
  expect(await formatMarkdown(output)).toBe(output)
  return output
}

describe("a mindmap in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        "# Title\n\n```mermaid\nmindmap\n      root((x))\n          a   \n          b\n```\n",
      ),
    ).toBe(
      "# Title\n\n```mermaid\nmindmap\n  root((x))\n      a   \n      b\n```\n",
    )
  })

  it("is formatted in a list item, indented from the list item's column", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  mindmap\n  root\n    a\n  ```\n",
      ),
    ).toBe("- item\n\n  ```mermaid\n  mindmap\n    root\n      a\n  ```\n")
  })

  it("keeps the whitespace at the end of a node text", async () => {
    expect(
      await formatTwice("```mermaid\nmindmap\n  root   \n    a\n```\n"),
    ).toBe("```mermaid\nmindmap\n  root   \n    a\n```\n")
  })
})
