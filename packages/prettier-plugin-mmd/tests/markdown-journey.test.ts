/**
 * Formats user journeys in Markdown code blocks with the real parser and
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

describe("a user journey in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        "# Title\n\n```mermaid\njourney\ntitle   T\nsection S\nMake tea:5:Me,You\n```\n",
      ),
    ).toBe(
      "# Title\n\n```mermaid\njourney\n  title   T\n  section S\n    Make tea: 5: Me, You\n```\n",
    )
  })

  it("is formatted in a list item, indented from the list item's column", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  journey\n  section S\n  A: 5\n  ```\n",
      ),
    ).toBe(
      "- item\n\n  ```mermaid\n  journey\n    section S\n      A: 5\n  ```\n",
    )
  })

  it("keeps a task whose data is whitespace only", async () => {
    expect(await formatTwice("```mermaid\njourney\nA:   \nB: 5\n```\n")).toBe(
      "```mermaid\njourney\n  A: \n  B: 5\n```\n",
    )
  })
})
