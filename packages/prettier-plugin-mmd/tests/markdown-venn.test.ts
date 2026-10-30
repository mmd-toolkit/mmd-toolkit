/** Venn fences retain implicit markers, same-line groups and authored values. */
import { describe, expect, it } from "vitest"
import * as prettier from "prettier"
import plugin from "../src/index.ts"
import { dbOfText, defaultEmbedded } from "./db-reading.ts"
import { formatMarkdown, formatMarkdownWithoutPlugin } from "./helpers.ts"
import { parseDocument } from "../src/parser.ts"

/** Checks host and diagram idempotence together. */
async function twice(input: string): Promise<string> {
  const output = await formatMarkdown(input)
  expect(await formatMarkdown(output)).toBe(output)
  return output
}

describe("venn in Markdown", () => {
  it("dispatches to the Venn printer", () => {
    expect(parseDocument("venn-beta set A").type).toBe("FormattedDocument")
  })

  it("formats a top-level fence", async () => {
    expect(
      await twice(
        "```mermaid\n venn-beta set A   style A fill : red\n     text item [ L ]\n```\n",
      ),
    ).toBe(
      "```mermaid\nvenn-beta\nset A style A fill:red\n  text item[ L ]\n```\n",
    )
  })

  it("keeps a positive implicit marker with zero tabWidth", async () => {
    const input = "```mermaid\nvenn-beta\nset A\n text item\n```\n"
    const options = { parser: "markdown", plugins: [plugin], tabWidth: 0 }
    const output = await prettier.format(input, options)
    expect(output).toBe(input)
    expect(await prettier.format(output, options)).toBe(output)
    const diagram = `${output.split("\n").slice(1, -2).join("\n")}\n`
    expect(dbOfText(diagram, defaultEmbedded())).toEqual(
      dbOfText("venn-beta\nset A\n text item", defaultEmbedded()),
    )
  })

  it("keeps implicit markers in a list inside a block quote after host dedentation", async () => {
    const input =
      "> - item\n>\n>   ```mermaid\n>    venn-beta\n>    set A   style A fill : red\n>         text item [ L ]\n>   ```\n"
    const output = await twice(input)
    expect(output).toBe(
      "> - item\n>\n>   ```mermaid\n>   venn-beta\n>   set A style A fill:red\n>     text item[ L ]\n>   ```\n",
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
        "venn-beta\nset A style A fill:red\n text item[ L ]",
        defaultEmbedded(),
      ),
    )
  })

  it("retains multiline values and a swallowed fragment", async () => {
    const markdown =
      '```mermaid\nvenn-beta\nset A[L\n  M] Q%% tail\n  text "id\n next"\n```\n'
    expect(await twice(markdown)).toBe(markdown)
  })

  it("retains blank and directive mode boundaries", async () => {
    const markdown =
      "```mermaid\nvenn-beta\nset A\n\n%%{ }%%\ntext A item\n```\n"
    expect(await twice(markdown)).toBe(markdown)
  })

  it("declines a rejected fence without repairing its contents", async () => {
    const markdown =
      "- item\n\n  ```mermaid\n  venn-beta\n  set A; set B\n  ```\n"
    expect(await twice(markdown)).toBe(
      await formatMarkdownWithoutPlugin(markdown),
    )
    expect(await formatMarkdown(markdown)).toBe(markdown)
  })
})
