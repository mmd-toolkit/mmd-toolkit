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
    const byTool = await formatMarkdown(text, {}, "output")
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
    const byTool = await formatMarkdown(text, {}, "output")
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
    const byTool = await formatMarkdown(text, {}, "output")
    expect(formattedDiagrams(byPrettier)).toBe(1)
    expect(byTool).toEqual({ text, diagnostics: [] })
  })
})

/** A node with a data block on one line, 38 wide, split where printWidth is less. */
const wideDiagram = ["flowchart LR", "  A@{ shape: rect, label: x, icon: y }"]

describe("Code blocks in detail: the line width left in a container, as in Prettier", () => {
  it.each([
    { container: "the top level", before: "", fence: "", width: 0 },
    { container: "a list item", before: "- item\n\n", fence: "  ", width: 2 },
    {
      container: "an ordered list item",
      before: "1. item\n\n",
      fence: "   ",
      width: 3,
    },
    { container: "a block quote", before: "", fence: "> ", width: 2 },
    {
      container: "a list item in a list item",
      before: "- a\n  - b\n\n",
      fence: "    ",
      width: 4,
    },
  ])(
    "splits a block in $container where Prettier does",
    async ({ before, fence, width }) => {
      const text = `${before}${[
        `${fence}\`\`\`mermaid`,
        ...wideDiagram.map((line) => `${fence}${line}`),
        `${fence}\`\`\``,
      ]
        .map((line) => `${line}\n`)
        .join("")}`
      const lineWidth = wideDiagram[1].length
      for (const [printWidth, splits] of [
        [lineWidth + width - 1, true],
        [lineWidth + width, false],
      ] as const) {
        const byPrettier = await format(text, {
          parser: "markdown",
          plugins: [plugin],
          printWidth,
        })
        const byTool = await formatMarkdown(text, { printWidth }, "output")
        expect(byPrettier.includes("label: x,")).toBe(!splits)
        expect(byTool.text).toBe(byPrettier)
      }
    },
  )
})

describe("If you know Prettier: a tab after the `>` of a block quote", () => {
  /** A block quote whose `>` is followed by `separator`, holding `wideDiagram`. */
  function quoted(separator: string): string {
    return lines(
      `>${separator}\`\`\`mermaid`,
      ...wideDiagram.map((line) => `>${separator}${line}`),
      `>${separator}\`\`\``,
    )
  }

  /** The text with the tab after each `>` turned into the one space that Prettier prints. */
  function withPrettiersSpace(text: string): string {
    return text.replaceAll(">\t", "> ")
  }

  it("leaves the width Prettier leaves where the tab reaches the column of Prettier's space", async () => {
    // tabWidth 2: the tab after `>` reaches column 2, as `> ` is 2 wide.
    for (const [printWidth, splits] of [
      [wideDiagram[1].length + 1, true],
      [wideDiagram[1].length + 2, false],
    ] as const) {
      const options = { printWidth, tabWidth: 2 }
      const byPrettier = await format(quoted("\t"), {
        parser: "markdown",
        plugins: [plugin],
        ...options,
      })
      const byTool = await formatMarkdown(quoted("\t"), options, "output")
      expect(byPrettier.includes("label: x,")).toBe(!splits)
      expect(withPrettiersSpace(byTool.text)).toBe(byPrettier)
    }
  })

  it("leaves less than Prettier leaves where the tab reaches a column beyond Prettier's space", async () => {
    // tabWidth 4: the tab after `>` reaches column 4, `> ` is 2 wide, and the
    // block is indented by 4, so the data block is 40 wide.
    const options = { printWidth: 42, tabWidth: 4 }
    const byPrettier = await format(quoted("\t"), {
      parser: "markdown",
      plugins: [plugin],
      ...options,
    })
    const byTool = await formatMarkdown(quoted("\t"), options, "output")
    expect(byPrettier).toContain("    A@{ shape: rect, label: x, icon: y }\n")
    expect(byTool.text).toBe(
      lines(
        ">\t```mermaid",
        ">\tflowchart LR",
        ">\t    A@{",
        ">\t        shape: rect",
        ">\t        label: x",
        ">\t        icon: y",
        ">\t    }",
        ">\t```",
      ),
    )
  })
})

describe("If you know Prettier: the colons of a Gantt section in a container", () => {
  const gantt = [
    "gantt",
    "  dateFormat YYYY-MM-DD",
    "  section A",
    "  Task name long enough to matter :a1, 2014-01-01, 1d",
    "  T  :a2, after a1, 1d",
  ]
  const inList = lines(
    "- item",
    "",
    "  ```mermaid",
    ...gantt.map((line) => `  ${line}`),
    "  ```",
  )
  const alignedRow = "T                               :a2, after a1, 1d"
  const widest = Math.max(...gantt.map((line) => line.length))

  it("is lined up by Prettier and not by mmdfmt where the lines fit only without the container", async () => {
    for (const printWidth of [widest, widest + 1]) {
      const byPrettier = await format(inList, {
        parser: "markdown",
        plugins: [plugin],
        printWidth,
      })
      const byTool = await formatMarkdown(inList, { printWidth }, "output")
      expect(byPrettier).toContain(alignedRow)
      expect(byTool.text).not.toContain(alignedRow)
      // The colons stay where they were written; only the section's tasks get
      // the printer's indentation.
      expect(byTool.text).toContain(
        "    Task name long enough to matter :a1, 2014-01-01, 1d\n",
      )
      expect(byTool.text).toContain("    T  :a2, after a1, 1d\n")
    }
  })

  it("is lined up by both where the lines fit in the container", async () => {
    const printWidth = widest + 2
    const byPrettier = await format(inList, {
      parser: "markdown",
      plugins: [plugin],
      printWidth,
    })
    const byTool = await formatMarkdown(inList, { printWidth }, "output")
    expect(byTool.text).toBe(byPrettier)
    expect(byTool.text).toContain(alignedRow)
  })
})
