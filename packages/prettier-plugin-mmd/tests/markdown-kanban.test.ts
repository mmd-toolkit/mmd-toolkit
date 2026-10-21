/** Kanban fences keep sections and items after host dedentation. */
import { describe, expect, it } from "vitest"
import { dbOfText, defaultEmbedded } from "./db-reading.ts"
import { formatMarkdown, formatMarkdownWithoutPlugin } from "./helpers.ts"
import { parseDocument } from "../src/parser.ts"

/** Formats Markdown twice to check host and diagram idempotence together. */
async function twice(input: string): Promise<string> {
  const output = await formatMarkdown(input)
  expect(await formatMarkdown(output)).toBe(output)
  return output
}

describe("kanban in Markdown", () => {
  it("dispatches to the kanban printer", () => {
    expect(parseDocument("kanban\n S\n").type).toBe("FormattedDocument")
  })

  it("formats a top-level fence", async () => {
    expect(
      await twice("```mermaid\n  kanban   S[x]\n     A\n ::icon(x)\n```\n"),
    ).toBe("```mermaid\nkanban\n  S[x]\n    A\n    ::icon(x)\n```\n")
  })

  it("keeps sections and items in a list inside a block quote after dedenting the host", async () => {
    const input =
      "> - item\n>\n>   ```mermaid\n>     kanban   S[x]\n>        A\n>    ::icon(x)\n>   ```\n"
    const output = await twice(input)
    expect(output).toBe(
      "> - item\n>\n>   ```mermaid\n>   kanban\n>     S[x]\n>       A\n>       ::icon(x)\n>   ```\n",
    )
    const lines = output.split("\n")
    const opening = lines.indexOf(">   ```mermaid")
    const closing = lines.indexOf(">   ```", opening + 1)
    const diagram = `${lines
      .slice(opening + 1, closing)
      .map((line) => line.slice(">   ".length))
      .join("\n")}\n`
    expect(dbOfText(diagram, defaultEmbedded())).toEqual(
      dbOfText("kanban   S[x]\n     A\n ::icon(x)\n", defaultEmbedded()),
    )
  })

  it("retains multiline values and opaque adjacent data", async () => {
    const markdown =
      '```mermaid\nkanban\n  S\n    A["x\n y"]@{ticket: X,}@{assigned: Ada}\n```\n'
    expect(await twice(markdown)).toBe(markdown)
  })

  it("declines a rejected fence without repairing its contents", async () => {
    const markdown =
      "- item\n\n  ```mermaid\n  kanban\n   S\n     ::icon()\n  ```\n"
    expect(await twice(markdown)).toBe(
      await formatMarkdownWithoutPlugin(markdown),
    )
    expect(await formatMarkdown(markdown)).toBe(markdown)
  })
})
