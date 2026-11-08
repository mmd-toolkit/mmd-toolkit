import { format } from "prettier"
import plugin from "prettier-plugin-mmd"
import { describe, expect, it } from "vitest"
import { formatMarkdown } from "../src/markdown.ts"
import { lines } from "./helpers.ts"

/** How many times a Markdown text holds the formatted form of `A-->B`. */
function formattedDiagrams(text: string): number {
  return text.split("A --> B").length - 1
}

/** The diagram block `A-->B`, unformatted, with its fences. */
const block = ["```mmd", "flowchart LR", "A-->B", "```"]

describe("Code blocks in detail: the same blocks as the plugin", () => {
  it.each([
    lines("```mermaid", "flowchart LR", "A-->B", "```"),
    lines("```mmd", "flowchart LR", "A-->B", "```"),
    lines("~~~mermaid", "flowchart LR", "A-->B", "~~~"),
    lines("```mermaid title", "flowchart LR", "A-->B", "```"),
    lines("```mermaid\ttitle", "flowchart LR", "A-->B", "```"),
    lines("```Mermaid", "flowchart LR", "A-->B", "```"),
    lines("```MMD", "flowchart LR", "A-->B", "```"),
    lines("```mermaidjs", "flowchart LR", "A-->B", "```"),
    lines("```{mermaid}", "flowchart LR", "A-->B", "```"),
    lines("```mermaid,title", "flowchart LR", "A-->B", "```"),
    lines("```.mmd", "flowchart LR", "A-->B", "```"),
    lines("- item", "", "  ```mermaid", "  flowchart LR", "  A-->B", "  ```"),
    lines("> ```mermaid", "> flowchart LR", "> A-->B", "> ```"),
    lines("    ```mermaid", "    flowchart LR", "    A-->B", "    ```"),
    lines("<div>", "```mermaid", "flowchart LR", "A-->B", "```", "</div>"),
    lines(
      "<div>",
      "",
      "```mermaid",
      "flowchart LR",
      "A-->B",
      "```",
      "",
      "</div>",
    ),
    lines("<!-- prettier-ignore -->", ...block),
    lines("<!--   prettier-ignore   -->", "", ...block),
    lines("<!-- prettier-ignore -->", ...block, "", ...block),
    lines("<!-- prettier-ignore -->", "text", "", ...block),
    lines("<!-- PRETTIER-IGNORE -->", ...block),
    lines("text <!-- prettier-ignore -->", "", ...block),
    lines(
      "- item",
      "",
      "  <!-- prettier-ignore -->",
      "",
      ...block.map((line) => `  ${line}`),
    ),
    lines(
      "> <!-- prettier-ignore -->",
      ">",
      ...block.map((line) => `> ${line}`),
    ),
    lines(
      "<!-- prettier-ignore-start -->",
      "",
      ...block,
      "",
      ...block,
      "",
      "<!-- prettier-ignore-end -->",
      "",
      ...block,
    ),
    lines("<!-- prettier-ignore-start -->", "", ...block),
    lines(
      "- item",
      "",
      "  <!-- prettier-ignore-start -->",
      "",
      ...block.map((line) => `  ${line}`),
      "",
      "  <!-- prettier-ignore-end -->",
    ),
  ])("formats %j as Prettier does with the plugin", async (text) => {
    const byPrettier = await format(text, {
      parser: "markdown",
      plugins: [plugin],
    })
    const byTool = await formatMarkdown(
      text,
      {
        tabWidth: undefined,
        useTabs: undefined,
      },
      "output",
    )
    expect(formattedDiagrams(byTool.text)).toBe(formattedDiagrams(byPrettier))
  })
})

describe("If you know Prettier: two results differ from the plugin in Markdown", () => {
  it("keeps the whitespace at the end of the last line, which Prettier removes", async () => {
    const text = lines(
      "```mermaid",
      "flowchart LR",
      "A",
      "style A fill:#f00, ",
      "```",
    )
    const byPrettier = await format(text, {
      parser: "markdown",
      plugins: [plugin],
    })
    const byTool = await formatMarkdown(
      text,
      {
        tabWidth: undefined,
        useTabs: undefined,
      },
      "output",
    )
    expect(byPrettier).toContain("  style A fill:#f00,\n")
    expect(byTool).toEqual({
      text: lines(
        "```mermaid",
        "flowchart LR",
        "  A",
        "  style A fill:#f00, ",
        "```",
      ),
      diagnostics: [],
    })
  })

  it("leaves a diagram inside a code block of Markdown, which Prettier formats", async () => {
    const text = lines(
      "````md",
      "```mermaid",
      "flowchart LR",
      "A-->B",
      "```",
      "````",
    )
    const byPrettier = await format(text, {
      parser: "markdown",
      plugins: [plugin],
    })
    const byTool = await formatMarkdown(
      text,
      {
        tabWidth: undefined,
        useTabs: undefined,
      },
      "output",
    )
    expect(formattedDiagrams(byPrettier)).toBe(1)
    expect(byTool).toEqual({ text, diagnostics: [] })
  })
})
