import { describe, expect, it } from "vitest"
import * as prettier from "prettier"
import plugin from "../src/index.ts"

/** Formats a diagram with the plugin at a line width. */
async function format(text: string, printWidth: number): Promise<string> {
  return prettier.format(text, {
    parser: "mermaid",
    plugins: [plugin],
    printWidth,
  })
}

/**
 * Prettier reads `max_line_length = off` of `.editorconfig` as `printWidth:
 * Infinity`, which mmdfmt passes on (docs/flowchart.md, Data blocks, and
 * docs/gantt.md, Task data).
 */
describe("printWidth: Infinity", () => {
  const longBlock = `flowchart LR\n  A@{ label: ${"x".repeat(100)}, shape: rect }\n`

  it("splits a block of one line that is too long for the width", async () => {
    expect(await format(longBlock, 80)).toBe(
      `flowchart LR\n  A@{\n    label: ${"x".repeat(100)}\n    shape: rect\n  }\n`,
    )
  })

  it("keeps a block of one line on its line, however long the line is", async () => {
    expect(await format(longBlock, Infinity)).toBe(longBlock)
  })

  const gantt = [
    "gantt",
    "  section A",
    "    A task : a1, 2014-01-01, 3d",
    "    Another long task name   : after a1, 2d, extra",
    "    X   : a3, after a2, 1d",
    "",
  ].join("\n")

  it("leaves the colons of a gantt section where the lines get too long", async () => {
    expect(await format(gantt, 40)).toBe(gantt)
  })

  it("lines up the colons of a gantt section, whatever the width of the lines", async () => {
    const aligned = [
      "gantt",
      "  section A",
      "    A task                 : a1, 2014-01-01, 3d",
      "    Another long task name : after a1, 2d, extra",
      "    X                      : a3, after a2, 1d",
      "",
    ].join("\n")
    expect(await format(gantt, Infinity)).toBe(aligned)
    expect(await format(gantt, 80)).toBe(aligned)
  })
})

/**
 * Prettier passes the plugin `printWidth` as it is for a diagram in a Markdown
 * code block in a list, without the width of what stands before the lines
 * (docs/gantt.md, Task data), while it measures a data block with it.
 */
describe("printWidth in a Markdown list item", () => {
  const gantt = [
    "gantt",
    "  dateFormat YYYY-MM-DD",
    "  section A",
    "  Task name long enough to matter : a1, 2014-01-01, 1d",
    "  T  : a2, after a1, 1d",
  ]
  const inList = [
    "- item",
    "",
    "  ```mermaid",
    ...gantt.map((line) => `  ${line}`),
    "  ```",
    "",
  ].join("\n")
  const alignedRow = "  T                               : a2, after a1, 1d"

  /** Formats Markdown with the plugin at a line width. */
  async function formatMarkdown(text: string, width: number): Promise<string> {
    return prettier.format(text, {
      parser: "markdown",
      plugins: [plugin],
      printWidth: width,
    })
  }

  it("Gantt in a list item: the width is that of the diagram alone", async () => {
    const widest = Math.max(...gantt.map((line) => line.length))
    expect(await formatMarkdown(inList, widest - 1)).not.toContain(alignedRow)
    expect(await formatMarkdown(inList, widest)).toContain(`  ${alignedRow}`)
    // The aligned line of the diagram stands two columns right in the list item.
    expect(`  ${alignedRow}`.length + 2 > widest).toBe(true)
  })

  it("splits a block of one line with the width left in the list item", async () => {
    const block = "flowchart LR\n  A@{ shape: rect, label: x, icon: y }\n"
    const inItem = `- item\n\n  \`\`\`mermaid\n  ${block.split("\n").join("\n  ").trimEnd()}\n  \`\`\`\n`
    const line = "  A@{ shape: rect, label: x, icon: y }".length
    expect(await formatMarkdown(inItem, line + 1)).not.toContain("label: x,")
    expect(await formatMarkdown(inItem, line + 2)).toContain("label: x,")
  })
})
