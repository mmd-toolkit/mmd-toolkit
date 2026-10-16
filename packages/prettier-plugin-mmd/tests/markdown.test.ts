import type * as ParserModule from "@mmd-toolkit/parser"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  formatMarkdown,
  formatMarkdownWithoutPlugin,
  stubRoot,
} from "./helpers.ts"

const parse = vi.hoisted(() => vi.fn())
vi.mock("@mmd-toolkit/parser", async (importOriginal) => ({
  ...(await importOriginal<typeof ParserModule>()),
  parse,
}))

beforeEach(() => {
  parse.mockReset()
  parse.mockImplementation((text: string) => stubRoot(text, "ErrorDiagram"))
})

const body = "flowchart LR\n  A --> B"

describe("fenced code blocks in Markdown", () => {
  it.each([
    ["```mermaid", "```"],
    ["```mmd", "```"],
    ["~~~mermaid", "~~~"],
    ["````mermaid", "````"],
    ["```mermaid title=example", "```"],
  ])("passes the content of %s to the parser", async (open, close) => {
    await formatMarkdown(`# Title\n\n${open}\n${body}\n${close}\n`)
    expect(parse).toHaveBeenCalledTimes(1)
    expect(parse.mock.calls[0][0]).toBe(body)
  })

  it.each(["```js", "```", "```Mermaid", "```mermaidjs"])(
    "does not pass the content of %s to the parser",
    async (open) => {
      await formatMarkdown(`${open}\n${body}\n\`\`\`\n`)
      expect(parse).not.toHaveBeenCalled()
    },
  )

  it("passes every mermaid block in a document to the parser", async () => {
    const markdown = [
      "```mermaid",
      "flowchart LR",
      "  A --> B",
      "```",
      "",
      "- item",
      "",
      "  ```mmd",
      "  graph TD",
      "    C --> D",
      "  ```",
      "",
      "> ```mermaid",
      "> flowchart TB",
      ">   E --> F",
      "> ```",
      "",
    ].join("\n")
    await formatMarkdown(markdown)
    expect(parse.mock.calls.map(([text]) => text)).toEqual([
      "flowchart LR\n  A --> B",
      "graph TD\n  C --> D",
      "flowchart TB\n  E --> F",
    ])
  })

  it("leaves a block unchanged when the parser fails", async () => {
    parse.mockImplementation(() => {
      throw new SyntaxError("Parse error")
    })
    const markdown = "Text\n\n```mermaid\nflowchart LR\n  A -->\n```\n"
    expect(await formatMarkdown(markdown)).toBe(
      await formatMarkdownWithoutPlugin(markdown),
    )
    expect(await formatMarkdown(markdown)).toBe(markdown)
  })
})
