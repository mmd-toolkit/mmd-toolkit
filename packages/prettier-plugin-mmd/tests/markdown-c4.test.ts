/** C4 fences preserve braced bodies, values, and null-block adjacency. */
import { describe, expect, it } from "vitest"
import { dbOfText, defaultEmbedded } from "./db-reading.ts"
import { formatMarkdown, formatMarkdownWithoutPlugin } from "./helpers.ts"
import { parseDocument } from "../src/parser.ts"

/** Checks host and diagram idempotence together. */
async function twice(input: string): Promise<string> {
  const output = await formatMarkdown(input)
  expect(await formatMarkdown(output)).toBe(output)
  return output
}

describe("c4 in Markdown", () => {
  it("dispatches to the C4 printer", () => {
    expect(parseDocument('C4Context\nPerson(a,"A")').type).toBe(
      "FormattedDocument",
    )
  })

  it("formats a top-level fence", async () => {
    expect(
      await twice(
        '```mermaid\n C4Context\nBoundary(b,"B")\n{Person(a,"A")}\n```\n',
      ),
    ).toBe(
      '```mermaid\nC4Context\n  Boundary(b, "B") {\n    Person(a, "A")\n  }\n```\n',
    )
  })

  it("keeps nesting in a list inside a block quote after host dedentation", async () => {
    const input =
      '> - item\n>\n>   ```mermaid\n>    C4Context\n>   Boundary(b,"B")\n>   {Person(a,"A")}\n>   ```\n'
    const output = await twice(input)
    expect(output).toBe(
      '> - item\n>\n>   ```mermaid\n>   C4Context\n>     Boundary(b, "B") {\n>       Person(a, "A")\n>     }\n>   ```\n',
    )
    const lines = output.split("\n")
    const opening = lines.indexOf(">   ```mermaid")
    const closing = lines.indexOf(">   ```", opening + 1)
    const diagram = `${lines
      .slice(opening + 1, closing)
      .map((line) => line.slice(">   ".length))
      .join("\n")}\n`
    expect(dbOfText(diagram, defaultEmbedded())).toEqual(
      dbOfText(
        'C4Context\nBoundary(b,"B")\n{Person(a,"A")}',
        defaultEmbedded(),
      ),
    )
  })

  it("retains multiline values and attached empty blocks", async () => {
    const markdown =
      '```mermaid\nC4Context accDescr {}\n  accDescr {}Person(a, "first\n second")\n```\n'
    expect(await twice(markdown)).toBe(markdown)
  })

  it("keeps a whitespace-only comment recovery line", async () => {
    const markdown =
      '```mermaid\nC4Context\n  Person(a, "A") %% tail\n \n  Person(b, "B")\n```\n'
    expect(await twice(markdown)).toBe(markdown)
  })

  it("declines a rejected fence without repairing its contents", async () => {
    const markdown =
      '- item\n\n  ```mermaid\n  C4Context\n  Person (a,"A")\n  ```\n'
    expect(await twice(markdown)).toBe(
      await formatMarkdownWithoutPlugin(markdown),
    )
    expect(await formatMarkdown(markdown)).toBe(markdown)
  })
})
