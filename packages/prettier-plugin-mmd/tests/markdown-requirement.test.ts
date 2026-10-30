/**
 * Formats requirement diagrams in Markdown code blocks with the real parser
 * and printer, as `markdown-flowchart.test.ts` does for flowcharts.
 */
import { describe, expect, it } from "vitest"
import { formatMarkdown } from "./helpers.ts"

/** Formats Markdown, and checks that formatting the result changes nothing. */
async function formatTwice(markdown: string): Promise<string> {
  const output = await formatMarkdown(markdown)
  expect(await formatMarkdown(output)).toBe(output)
  return output
}

describe("a requirement diagram in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        "# Title\n\n```mermaid\nrequirementDiagram\nrequirement r{\nid:1\n}\nr-satisfies->e\n```\n",
      ),
    ).toBe(
      "# Title\n\n```mermaid\nrequirementDiagram\n  requirement r {\n    id: 1\n  }\n  r - satisfies -> e\n```\n",
    )
  })

  it("is formatted in a list item, indented from the list item's column", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  requirementDiagram\n  element e {\n  type: t\n  }\n  ```\n",
      ),
    ).toBe(
      "- item\n\n  ```mermaid\n  requirementDiagram\n    element e {\n      type: t\n    }\n  ```\n",
    )
  })

  it("keeps a statement that continues on the next line unchanged where it has a comment line", async () => {
    expect(
      await formatTwice(
        '```mermaid\nrequirementDiagram\nstyle r fill:red "r"\n%% c\n:::c\n```\n',
      ),
    ).toBe(
      '```mermaid\nrequirementDiagram\n  style r fill:red "r"\n%% c\n:::c\n```\n',
    )
  })
})
