import { stripVTControlCharacters } from "node:util"
import type { Options } from "prettier"
import { format } from "prettier"
import plugin from "prettier-plugin-mmd"
import { describe, expect, it } from "vitest"
import { formatDiagram } from "../src/diagram.ts"
import { formatMarkdown } from "../src/markdown.ts"
import { readOptions } from "../src/options.ts"
import { lines } from "./helpers.ts"

/** How many times a Markdown text holds the formatted form of `A-->B`. */
function formattedDiagrams(text: string): number {
  return text.split("A --> B").length - 1
}

/**
 * The message of the error that `promise` rejects with. Prettier colors the
 * words of a message where the environment asks for colors, as on CI, so the
 * colors are taken off: they are not what a test compares.
 */
async function rejectionMessage(promise: Promise<unknown>): Promise<string> {
  try {
    await promise
  } catch (error) {
    if (error instanceof Error) return stripVTControlCharacters(error.message)
    throw error
  }
  throw new Error("The promise did not reject")
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

describe("If you know Prettier: the settings under which Prettier leaves a diagram in Markdown as written", () => {
  const diagramBlock = lines("```mermaid", "flowchart LR", "A-->B", "```")
  const formattedBlock = lines("```mermaid", "flowchart LR", "  A --> B", "```")
  const frontmatterBlock = lines(
    "```mermaid",
    "---",
    'title:   "T"',
    "---",
    "flowchart LR",
    "A-->B",
    "```",
  )
  const formattedFrontmatterBlock = lines(
    "```mermaid",
    "---",
    'title:   "T"',
    "---",
    "flowchart LR",
    "  A --> B",
    "```",
  )

  it.each([
    {
      setting: "requirePragma without the pragma comment",
      text: diagramBlock,
      formatted: formattedBlock,
      options: { requirePragma: true },
    },
    {
      setting: "checkIgnorePragma with the ignore comment",
      text: lines("<!-- @noformat -->", "", diagramBlock),
      formatted: lines("<!-- @noformat -->", "", formattedBlock),
      options: { checkIgnorePragma: true },
    },
    {
      setting:
        "checkIgnorePragma with the other spelling of the ignore comment",
      text: lines("<!-- @noprettier -->", "", diagramBlock),
      formatted: lines("<!-- @noprettier -->", "", formattedBlock),
      options: { checkIgnorePragma: true },
    },
    {
      setting: "a range that does not cover the whole file",
      text: diagramBlock,
      formatted: formattedBlock,
      options: { rangeStart: 0, rangeEnd: 5 },
    },
    {
      setting: "embeddedLanguageFormatting off, which leaves the frontmatter",
      text: frontmatterBlock,
      formatted: formattedFrontmatterBlock,
      options: { embeddedLanguageFormatting: "off" as const },
    },
  ])(
    "leaves a diagram as written under $setting, while mmdfmt formats it",
    async ({ text, formatted, options }) => {
      const byPrettier = await format(text, {
        parser: "markdown",
        plugins: [plugin],
        ...options,
      })
      const byTool = await formatMarkdown(text, readOptions(options), "output")
      expect(byPrettier).toBe(text)
      expect(byTool).toEqual({ text: formatted, diagnostics: [] })
    },
  )

  it("does not leave a Markdown file whose pragma comment follows the frontmatter, under requirePragma", async () => {
    const before = lines("---", "title: x", "---", "", "<!-- @prettier -->", "")
    const byPrettier = await format(before + diagramBlock, {
      parser: "markdown",
      plugins: [plugin],
      requirePragma: true,
    })
    expect(byPrettier).toBe(before + formattedBlock)
  })

  it("leaves a .mmd file as written under a range that does not cover it, while mmdfmt formats it", async () => {
    const text = lines("flowchart LR", "A-->B")
    const options = { rangeStart: 0, rangeEnd: 5 }
    expect(
      await format(text, { parser: "mermaid", plugins: [plugin], ...options }),
    ).toBe(text)
    expect(await formatDiagram(text, readOptions(options), "\n")).toEqual({
      kind: "formatted",
      text: lines("flowchart LR", "  A --> B"),
    })
  })

  it("refuses a value of an option of another language, which mmdfmt does not read", async () => {
    // A configuration file holds JSON, whose values the type checker cannot know.
    const refused: Options = JSON.parse('{ "semi": "yes" }')
    expect(
      await rejectionMessage(
        format(diagramBlock, {
          parser: "markdown",
          plugins: [plugin],
          ...refused,
        }),
      ),
    ).toBe('Invalid semi value. Expected true or false, but received "yes".')
    expect(
      await formatMarkdown(diagramBlock, readOptions(refused), "output"),
    ).toEqual({ text: formattedBlock, diagnostics: [] })
  })
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
  /** The lines of a diagram, as the content of a code block in a list item. */
  function inListItem(diagram: readonly string[]): string {
    return lines(
      "- item",
      "",
      "  ```mermaid",
      ...diagram.map((line) => `  ${line}`),
      "  ```",
    )
  }

  /** The lines of a diagram, as the content of a code block in a block quote. */
  function inBlockQuote(diagram: readonly string[]): string {
    return lines("> ```mermaid", ...diagram.map((line) => `> ${line}`), "> ```")
  }

  /** The lines of a diagram, as the content of a code block in an ordered list item whose number is `number`, such as `1.`. */
  function inOrderedListItem(
    number: string,
  ): (diagram: readonly string[]) => string {
    const indentation = " ".repeat(number.length + 1)
    return (diagram) =>
      lines(
        `${number} item`,
        "",
        `${indentation}\`\`\`mermaid`,
        ...diagram.map((line) => `${indentation}${line}`),
        `${indentation}\`\`\``,
      )
  }

  /**
   * A gantt chart with three tasks, each after `margin`, with `gaps` before the
   * colons, and a `section` line before them unless `withSection` is false.
   */
  function ganttLines(
    margin: string,
    gaps: readonly string[],
    withSection = true,
  ): string[] {
    const tasks = [
      ["Task name long enough to matter", ": a1, 2014-01-01, 1d"],
      ["T", ": a2, after a1, 1d"],
      ["Mid name", ": a3, after a2, 1d"],
    ].map(([name, rest], index) => `${margin}${name}${gaps[index]}${rest}`)
    return [
      "gantt",
      "  dateFormat YYYY-MM-DD",
      ...(withSection ? ["  section A"] : []),
      ...tasks,
    ]
  }

  /** The row of the second task once the colons are lined up under the longest name. */
  const alignedRow = "T                               : a2, after a1, 1d"
  /** The tasks of a section are one level deeper than `section`, and the tasks before it one level deeper than `gantt`. */
  const sectionMargin = "    "
  const noSectionMargin = "  "
  const padded = ["  ", "   ", " "]

  it.each([
    {
      container: "a list item",
      inContainer: inListItem,
      prettierOnly: [54, 55],
      both: 56,
    },
    {
      container: "a block quote",
      inContainer: inBlockQuote,
      prettierOnly: [54, 55],
      both: 56,
    },
    {
      container: "an ordered list item",
      inContainer: inOrderedListItem("1."),
      prettierOnly: [54, 55, 56],
      both: 57,
    },
    {
      container: "an ordered list item with a number of two digits",
      inContainer: inOrderedListItem("10."),
      prettierOnly: [54, 55, 56, 57],
      both: 58,
    },
  ])(
    "in $container, is lined up by Prettier where the lines fit without what stands before them, and by mmdfmt only where they fit with it",
    async ({ inContainer, prettierOnly, both }) => {
      // The lined-up rows are 54 columns wide without what stands before the
      // lines, and 54 plus the width of that with it: 56 in a list item and in
      // a block quote, 57 after `1.`, and 58 after `10.`.
      const text = inContainer(ganttLines(sectionMargin, padded))
      for (const { printWidth, prettierLinesUp, toolLinesUp } of [
        { printWidth: 53, prettierLinesUp: false, toolLinesUp: false },
        ...prettierOnly.map((width) => ({
          printWidth: width,
          prettierLinesUp: true,
          toolLinesUp: false,
        })),
        { printWidth: both, prettierLinesUp: true, toolLinesUp: true },
      ]) {
        const byPrettier = await format(text, {
          parser: "markdown",
          plugins: [plugin],
          printWidth,
        })
        const byTool = await formatMarkdown(text, { printWidth }, "output")
        expect(byPrettier.includes(alignedRow)).toBe(prettierLinesUp)
        expect(byTool.text.includes(alignedRow)).toBe(toolLinesUp)
        if (prettierLinesUp && !toolLinesUp) {
          // A lined-up line is wider than the line width, with the container.
          const widest = Math.max(
            ...byPrettier.split("\n").map((line) => line.length),
          )
          expect(widest).toBeGreaterThan(printWidth)
        }
        // Not lined up, the text stays as written, which is printed already.
        if (!toolLinesUp) expect(byTool).toEqual({ text, diagnostics: [] })
        if (toolLinesUp) expect(byTool.text).toBe(byPrettier)
      }
    },
  )

  it.each([
    {
      written: "tasks as the printer indents them",
      indentation: 4,
      gaps: padded,
    },
    {
      written: "tasks less deep than the printer indents them",
      indentation: 2,
      gaps: padded,
    },
    {
      written: "tasks deeper than the printer indents them",
      indentation: 6,
      gaps: padded,
    },
    {
      written: "one, two, and five spaces before the colons",
      indentation: 4,
      gaps: [" ", "  ", "     "],
    },
  ])(
    "leaves the whitespace before each colon as written and indents the tasks as in any chart, for $written",
    async ({ indentation, gaps }) => {
      const text = inListItem(ganttLines(" ".repeat(indentation), gaps))
      const printed = inListItem(ganttLines(sectionMargin, gaps))
      const printWidth = 54
      const byPrettier = await format(text, {
        parser: "markdown",
        plugins: [plugin],
        printWidth,
      })
      const byTool = await formatMarkdown(text, { printWidth }, "output")
      expect(byPrettier).toContain(`      ${alignedRow}\n`)
      expect(byTool).toEqual({ text: printed, diagnostics: [] })
    },
  )

  it("indents the tasks before the first section one level deeper than gantt, and leaves the whitespace before each colon as written", async () => {
    // The lined-up rows are 52 columns wide without what stands before the lines.
    const text = inListItem(ganttLines("      ", padded, false))
    const printed = inListItem(ganttLines(noSectionMargin, padded, false))
    const printWidth = 52
    const byPrettier = await format(text, {
      parser: "markdown",
      plugins: [plugin],
      printWidth,
    })
    const byTool = await formatMarkdown(text, { printWidth }, "output")
    expect(byPrettier).toContain(`    ${alignedRow}\n`)
    expect(byTool).toEqual({ text: printed, diagnostics: [] })
  })
})
