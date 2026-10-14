/**
 * Formats Gantt charts in Markdown code blocks with the real parser and
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

describe("a Gantt chart in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        "# Title\n\n```mermaid\ngantt\ntitle   T\nsection S\nA task   :a1,2014-01-01,30d\n```\n",
      ),
    ).toBe(
      "# Title\n\n```mermaid\ngantt\n  title   T\n  section S\n    A task   :a1, 2014-01-01, 30d\n```\n",
    )
  })

  it("is formatted in a list item, indented from the list item's column", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  gantt\n  section S\n  a : 1d\n  ```\n",
      ),
    ).toBe(
      "- item\n\n  ```mermaid\n  gantt\n    section S\n      a :1d\n  ```\n",
    )
  })

  it("keeps a task whose data is whitespace only", async () => {
    expect(await formatTwice("```mermaid\ngantt\na :   \nb : 1d\n```\n")).toBe(
      "```mermaid\ngantt\n  a : \n  b :1d\n```\n",
    )
  })
})
