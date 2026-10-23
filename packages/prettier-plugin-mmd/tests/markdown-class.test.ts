/**
 * Formats class diagrams in Markdown code blocks with the real parser and
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

describe("a class diagram in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        "# Title\n\n```mermaid\nclassDiagram\nAnimal<|--Duck\nclass Duck{\n+swim()\n}\n```\n",
      ),
    ).toBe(
      "# Title\n\n```mermaid\nclassDiagram\n  Animal <|-- Duck\n  class Duck {\n    +swim()\n  }\n```\n",
    )
  })

  it("is formatted in a list item, indented from the list item's column", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  classDiagram\n  namespace N {\n  class A\n  }\n  ```\n",
      ),
    ).toBe(
      "- item\n\n  ```mermaid\n  classDiagram\n    namespace N {\n      class A\n    }\n  ```\n",
    )
  })

  it("keeps a line of one space after a comment inside the block", async () => {
    expect(
      await formatTwice(
        "```mermaid\nclassDiagram\nA --> B %% c\n  \nA : +int age\n```\n",
      ),
    ).toBe("```mermaid\nclassDiagram\n  A --> B %% c\n \n  A : +int age\n```\n")
  })
})
