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
    "    A task :a1, 2014-01-01, 3d",
    "    Another long task name   :after a1, 2d, extra",
    "    X   :a3, after a2, 1d",
    "",
  ].join("\n")

  it("leaves the colons of a gantt section where the lines get too long", async () => {
    expect(await format(gantt, 40)).toBe(gantt)
  })

  it("lines up the colons of a gantt section, whatever the width of the lines", async () => {
    const aligned = [
      "gantt",
      "  section A",
      "    A task                 :a1, 2014-01-01, 3d",
      "    Another long task name :after a1, 2d, extra",
      "    X                      :a3, after a2, 1d",
      "",
    ].join("\n")
    expect(await format(gantt, Infinity)).toBe(aligned)
    expect(await format(gantt, 80)).toBe(aligned)
  })
})
