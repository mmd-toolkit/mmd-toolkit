/**
 * Formats ER diagrams in Markdown code blocks with the real parser and
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

describe("an ER diagram in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        "# Title\n\n```mermaid\nerDiagram\nA||--o{B:has\nCAR{\nstring registrationNumber PK\n}\n```\n",
      ),
    ).toBe(
      "# Title\n\n```mermaid\nerDiagram\n  A ||--o{ B : has\n  CAR {\n    string registrationNumber PK\n  }\n```\n",
    )
  })

  it("is formatted in a list item, indented from the list item's column", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  erDiagram\n  subgraph S\n  A\n  end\n  ```\n",
      ),
    ).toBe(
      "- item\n\n  ```mermaid\n  erDiagram\n    subgraph S\n      A\n    end\n  ```\n",
    )
  })

  it("keeps the first column of an accTitle that holds a direction", async () => {
    expect(
      await formatTwice(
        "```mermaid\nerDiagram\naccTitle: direction LR\nA\n```\n",
      ),
    ).toBe("```mermaid\nerDiagram\naccTitle: direction LR\n  A\n```\n")
  })
})
