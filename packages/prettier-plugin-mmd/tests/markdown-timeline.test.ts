/**
 * Formats timelines in Markdown code blocks with the real parser and
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

describe("a timeline in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        "# Title\n\n```mermaid\ntimeline TD\ntitle   T\nsection S\n2004: Facebook\n  : Google\n```\n",
      ),
    ).toBe(
      "# Title\n\n```mermaid\ntimeline TD\n  title   T\n  section S\n    2004: Facebook\n      : Google\n```\n",
    )
  })

  it("is formatted in a list item, indented from the list item's column", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  timeline\n  section S\n  a : e\n  ```\n",
      ),
    ).toBe(
      "- item\n\n  ```mermaid\n  timeline\n    section S\n      a : e\n  ```\n",
    )
  })

  it("keeps the whitespace at the end of an event", async () => {
    expect(
      await formatTwice("```mermaid\ntimeline\na : e  \nb : f\n```\n"),
    ).toBe("```mermaid\ntimeline\n  a : e  \n  b : f\n```\n")
  })
})
