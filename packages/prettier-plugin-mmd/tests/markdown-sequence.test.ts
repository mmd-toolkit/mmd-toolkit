/**
 * Formats sequence diagrams in Markdown code blocks with the real parser and
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

describe("a sequence diagram in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        "# Title\n\n```mermaid\nsequenceDiagram\nA->>B: x;B-->>A: y\nloop every minute\nA->>B: z\nend\n```\n",
      ),
    ).toBe(
      "# Title\n\n```mermaid\nsequenceDiagram\n  A ->> B: x\n  B -->> A: y\n  loop every minute\n    A ->> B: z\n  end\n```\n",
    )
  })

  it("is formatted in a list item, indented from the list item's column", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  sequenceDiagram\n  alt a\n  A->>B: x\n  else b\n  B->>A: y\n  end\n  ```\n",
      ),
    ).toBe(
      "- item\n\n  ```mermaid\n  sequenceDiagram\n    alt a\n      A ->> B: x\n    else b\n      B ->> A: y\n    end\n  ```\n",
    )
  })

  it("keeps the whitespace at the end of a title inside the block", async () => {
    expect(
      await formatTwice(
        "```mermaid\nsequenceDiagram\ntitle Kept  \nA->>B: x\n```\n",
      ),
    ).toBe("```mermaid\nsequenceDiagram\n  title Kept  \n  A ->> B: x\n```\n")
  })
})
