/**
 * Formats state diagrams in Markdown code blocks with the real parser and
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

describe("a state diagram in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        "# Title\n\n```mermaid\nstateDiagram-v2\n[*]-->Still\nstate Moving{\nSlow-->Fast\n}\n```\n",
      ),
    ).toBe(
      "# Title\n\n```mermaid\nstateDiagram-v2\n  [*] --> Still\n  state Moving {\n    Slow --> Fast\n  }\n```\n",
    )
  })

  it("is formatted in a list item, indented from the list item's column", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  stateDiagram-v2\n  A-->B:go\n  note left of A : kept\n  ```\n",
      ),
    ).toBe(
      "- item\n\n  ```mermaid\n  stateDiagram-v2\n    A --> B : go\n    note left of A : kept\n  ```\n",
    )
  })
})
