import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  formatMarkdown,
  formatMarkdownWithoutPlugin,
  formatMermaid,
  stubRoot,
} from "./helpers.ts"
import type { AstPath, Doc } from "prettier"
import { builders } from "prettier/doc"
import * as prettier from "prettier"
import type * as ParserModule from "@mmd-toolkit/parser"
import { ParseError, UnsupportedDiagramError } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../src/index.ts"
import plugin from "../src/index.ts"
import * as printers from "../src/printers/index.ts"

// Only `parse` is replaced; the error classes are the parser's own.
const { hardline } = builders

const parse = vi.hoisted(() => vi.fn())
vi.mock("@mmd-toolkit/parser", async (importOriginal) => ({
  ...(await importOriginal<typeof ParserModule>()),
  parse,
}))

/** Throws the parser's error for an unsupported diagram type. */
function throwUnsupported(): never {
  throw new UnsupportedDiagramError("er")
}

beforeEach(() => {
  parse.mockReset()
  vi.restoreAllMocks()
})

describe("dispatch to diagram printers", () => {
  it("hands the diagram body to the printer of its body type", async () => {
    const seen: string[] = []

    /** Prints the body as one word and the line break at the end of the text. */
    function printStub(path: AstPath<MermaidAst>): Doc {
      seen.push(path.node.type)
      return ["printed", hardline]
    }

    parse.mockImplementation((text: string) => stubRoot(text, "ErrorDiagram"))
    vi.spyOn(printers, "diagramPrinters", "get").mockReturnValue({
      ErrorDiagram: printStub,
    })
    // The comment makes `Root.comments` non-empty, which Prettier must not
    // treat as its own comments.
    const input = "%% a comment\nstub\n"
    expect(parse.getMockImplementation()?.(input).comments).toHaveLength(1)
    expect(await formatMermaid(input)).toBe("printed\n")
    expect(seen).toEqual(["ErrorDiagram"])
  })

  it("formats with a cursor position, which walks the tree", async () => {
    // Prettier walks the tree to find the node at the cursor. It must visit
    // only child nodes, not objects such as `loc`.
    /** Prints the body as one word and the line break at the end of the text. */
    function printErrorDiagram(): Doc {
      return ["printed", hardline]
    }

    parse.mockImplementation((text: string) => stubRoot(text, "ErrorDiagram"))
    vi.spyOn(printers, "diagramPrinters", "get").mockReturnValue({
      ErrorDiagram: printErrorDiagram,
    })
    const result = await prettier.formatWithCursor("error\n", {
      cursorOffset: 2,
      filepath: "diagram.mmd",
      plugins: [plugin],
    })
    expect(result.formatted).toBe("printed\n")
    expect(result.cursorOffset).toBeGreaterThanOrEqual(0)
  })

  it("does not take inherited properties of the printer table as printers", async () => {
    parse.mockImplementation((text: string) => stubRoot(text, "toString"))
    const input = "toString  \n"
    expect(await formatMermaid(input)).toBe(input)
  })

  it("prints a parsed diagram type without a printer unchanged", async () => {
    parse.mockImplementation((text: string) => stubRoot(text, "JourneyDiagram"))
    const input = "erDiagram\n  A ||--o{ B : has  \n\n\n"
    expect(await formatMermaid(input)).toBe(input)
  })

  describe("a diagram type the parser does not support is printed unchanged", () => {
    const inputs = [
      "erDiagram\n  A ||--o{ B : has  \n\n\n  %% comment\n",
      "erDiagram\n\tA ||--o{ B : has",
      "\n\n---\ntitle: T\n---\nerDiagram\n  A ||--o{ B : has\n",
      "%%{init: {'theme': 'dark'}}%%\nerDiagram\n  A ||--o{ B : has\n",
    ]
    it("when the parser reports it by name only", async () => {
      // Two installed copies of the parser would defeat `instanceof`.
      parse.mockImplementation(() => {
        throw Object.assign(new Error("er"), {
          name: "UnsupportedDiagramError",
        })
      })
      const input = "erDiagram\n  A ||--o{ B : has  \n"
      expect(await formatMermaid(input)).toBe(input)
    })

    it.each(inputs)("standalone file %j", async (input) => {
      parse.mockImplementation(throwUnsupported)
      expect(await formatMermaid(input)).toBe(input)
    })

    it("inside Markdown list items and block quotes", async () => {
      parse.mockImplementation(throwUnsupported)
      const markdown = [
        "- item",
        "",
        "  ```mermaid",
        "  erDiagram",
        "    A ||--o{ B : has",
        "",
        "    %% comment",
        "  ```",
        "",
        "> ```mermaid",
        "> erDiagram",
        ">     A ||--o{ B : has",
        "> ```",
        "",
      ].join("\n")
      const formatted = await formatMarkdown(markdown)
      expect(formatted).toBe(await formatMarkdownWithoutPlugin(markdown))
      expect(formatted).toBe(markdown)
    })

    it("inside Markdown, is left to Prettier as code it does not format", async () => {
      parse.mockImplementation(throwUnsupported)
      const markdown = [
        "- item",
        "",
        "  ```mermaid",
        "  erDiagram  ",
        "",
        "    A ||--o{ B : has\t",
        "  ```",
        "",
      ].join("\n")
      const formatted = await formatMarkdown(markdown)
      expect(formatted).toBe(await formatMarkdownWithoutPlugin(markdown))
      expect(formatted).toBe(
        "- item\n\n  ```mermaid\n  erDiagram\n\n    A ||--o{ B : has\n  ```\n",
      )
    })

    it("inside Markdown, keeps blank lines at the end of the block", async () => {
      // Prettier strips trailing line breaks from every embedded document,
      // so the plugin declines the block instead of printing it.
      parse.mockImplementation(throwUnsupported)
      const markdown = "```mermaid\nerDiagram\n  A ||--o{ B : has\n\n\n```\n"
      const formatted = await formatMarkdown(markdown)
      expect(formatted).toBe(await formatMarkdownWithoutPlugin(markdown))
      expect(formatted).toBe(markdown)
    })
  })

  describe("a parsed diagram type without a printer is left to Prettier inside Markdown", () => {
    it.each([
      "```mermaid\nerDiagram\n  A ||--o{ B : has\n\n\n```\n",
      "- item\n\n  ```mermaid\n  erDiagram  \n\n    A ||--o{ B : has\t\n  ```\n",
      "> ```mmd\n> erDiagram\n>\n>   A ||--o{ B : has\n> ```\n",
    ])("%j", async (markdown) => {
      parse.mockImplementation((text: string) =>
        stubRoot(text, "JourneyDiagram"),
      )
      expect(await formatMarkdown(markdown)).toBe(
        await formatMarkdownWithoutPlugin(markdown),
      )
      expect(parse).toHaveBeenCalledTimes(1)
    })
  })

  it("prints the whole text unchanged even if the root does not cover it", async () => {
    // A root may span only from the first to the last token.
    const input = "\n%% leading\nerDiagram\n  A ||--o{ B : has\n\n%% trailing\n"
    const first = input.indexOf("erDiagram")
    const last = input.indexOf("has") + 3
    parse.mockImplementation((text: string) => ({
      ...stubRoot(text, "JourneyDiagram"),
      range: [first, last],
    }))
    expect(await formatMermaid(input)).toBe(input)
  })

  describe("line endings of a document printed unchanged follow endOfLine", () => {
    // Prettier normalizes line endings to "\n" before parsing and converts
    // them to `endOfLine` after printing. mermaid.js also treats "\r\n" and
    // "\r" as "\n", so the diagram does not change.
    const input = "erDiagram\r\n  A ||--o{ B : has\r  %% c\r\n"
    it.each([
      [{}, "erDiagram\n  A ||--o{ B : has\n  %% c\n"],
      [{ endOfLine: "crlf" }, "erDiagram\r\n  A ||--o{ B : has\r\n  %% c\r\n"],
      [{ endOfLine: "auto" }, "erDiagram\r\n  A ||--o{ B : has\r\n  %% c\r\n"],
    ] as const)("with %j", async (options, expected) => {
      parse.mockImplementation(throwUnsupported)
      expect(await formatMermaid(input, "diagram.mmd", options)).toBe(expected)
    })

    it("and a byte order mark is kept", async () => {
      parse.mockImplementation(throwUnsupported)
      const withBom = "\uFEFFerDiagram\n  A ||--o{ B : has\n"
      expect(await formatMermaid(withBom)).toBe(withBom)
    })
  })
})

describe("parse errors", () => {
  it("are reported with a code frame at the parser's position", async () => {
    const input = "flowchart LR\n  A --> \n"
    const original = new ParseError("Expecting a node", [21, 22], {
      start: { line: 2, column: 8 },
      end: { line: 2, column: 9 },
    })
    parse.mockImplementation(() => {
      throw original
    })
    const error: unknown = await formatMermaid(input).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(SyntaxError)
    const { message, loc, cause } = error as SyntaxError & { loc: unknown }
    // The error is at the line feed, which ends at the start of the next
    // line: the position has a start only (see `toPrettierError`).
    expect(loc).toEqual({ start: { line: 2, column: 9 } })
    expect(message).toContain("Expecting a node")
    // The caret sits under the 0-based column 8 reported by the parser.
    expect(message).toContain(`> 2 |   A --> \n    | ${" ".repeat(8)}^`)
    expect(cause).toBe(original)
  })

  it("other than ParseError are passed through", async () => {
    const original = new Error("A bug in the parser")
    parse.mockImplementation(() => {
      throw original
    })
    await expect(formatMermaid("flowchart LR\n")).rejects.toBe(original)
  })
})
