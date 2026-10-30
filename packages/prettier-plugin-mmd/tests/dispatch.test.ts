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
import { ParseError } from "@mmd-toolkit/parser"
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

/**
 * Makes `parse` the parser's own, for the `error` pseudo-diagram, whose
 * printer prints the text as written.
 */
async function useRealParser(): Promise<void> {
  const actual = await vi.importActual<typeof ParserModule>(
    "@mmd-toolkit/parser",
  )
  parse.mockImplementation(actual.parse)
}

beforeEach(() => {
  parse.mockReset()
  vi.restoreAllMocks()
})

describe("dispatch to diagram printers", () => {
  it("registers the eventmodeling body printer", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(await formatMermaid("eventmodeling tf 007evt Dispatch")).toBe(
      "eventmodeling\n  tf 007 evt Dispatch\n",
    )
  })
  it("registers both cynefin header forms", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(await formatMermaid('cynefin-beta clear "DispatchBare"')).toBe(
      'cynefin-beta\n  clear\n    "DispatchBare"\n',
    )
    expect(await formatMermaid('cynefin-beta:clear "DispatchColon"')).toBe(
      'cynefin-beta:\n  clear\n    "DispatchColon"\n',
    )
  })
  it("registers the railroad body printer for all four dialects", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(await formatMermaid('railroad-beta r=terminal("dispatch");')).toBe(
      'railroad-beta\n  r = terminal("dispatch");\n',
    )
    expect(await formatMermaid('railroad-ebnf-beta r::="dispatch";')).toBe(
      'railroad-ebnf-beta\n  r ::= "dispatch";\n',
    )
    expect(await formatMermaid('railroad-abnf-beta r="dispatch";')).toBe(
      'railroad-abnf-beta\n  r = "dispatch";\n',
    )
    expect(await formatMermaid('railroad-peg-beta r<-"dispatch";')).toBe(
      'railroad-peg-beta\n  r <- "dispatch";\n',
    )
  })
  it("registers the radar body printer", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(await formatMermaid('radar-beta : axis Dispatch [ "Label" ]')).toBe(
      'radar-beta:\n  axis Dispatch["Label"]\n',
    )
  })
  it("registers the architecture body printer", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(
      await formatMermaid(
        "architecture-beta service dispatch (cloud) [Dispatch]",
      ),
    ).toBe("architecture-beta\n  service dispatch(cloud)[Dispatch]\n")
  })
  it("registers the packet body printer", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(await formatMermaid('packet-beta0 - 2 :"Dispatch"')).toBe(
      'packet-beta\n  0-2: "Dispatch"\n',
    )
  })
  it("registers the info body printer", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(await formatMermaid("info showInfo title Dispatch")).toBe(
      "info showInfo\n  title Dispatch\n",
    )
  })
  it("registers the gitgraph body printer", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(await formatMermaid('gitGraph:commit id:"Dispatch"')).toBe(
      'gitGraph:\n  commit id: "Dispatch"\n',
    )
  })
  it("registers the pie body printer", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(await formatMermaid('pie showData "Dispatch":2')).toBe(
      'pie showData\n  "Dispatch" : 2\n',
    )
  })
  it("registers the usecase body printer", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(
      await formatMermaid("usecase-beta\nactor Reader\nReader-->Document"),
    ).toBe("usecase-beta\n  actor Reader\n  Reader --> Document\n")
  })
  it("registers the Agentflow body printer", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(await formatMermaid("agentflow-beta TB\nflow F;A-->B;end")).toBe(
      "agentflow-beta TB\n  flow F\n    A --> B\n  end\n",
    )
  })
  it("registers the Ishikawa body printer", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(await formatMermaid("ishikawa R\n A\n   B")).toBe(
      "ishikawa\n  R\n    A\n      B\n",
    )
  })
  it("registers the Venn body printer", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(await formatMermaid("venn-beta set A\n text item")).toBe(
      "venn-beta\nset A\n  text item\n",
    )
  })
  it("registers the C4 body printer", async () => {
    const actual = await vi.importActual<typeof ParserModule>(
      "@mmd-toolkit/parser",
    )
    parse.mockImplementation(actual.parse)
    expect(await formatMermaid('C4Context\nPerson(a,"A")')).toBe(
      'C4Context\n  Person(a, "A")\n',
    )
  })
  it("hands the diagram body to the printer of its body type", async () => {
    const seen: string[] = []

    /** Prints the body as one word and the line break at the end of the text. */
    function printStub(path: AstPath<MermaidAst>): Doc {
      seen.push(path.node.type)
      return ["printed", hardline]
    }

    const table = printers.diagramPrinters
    parse.mockImplementation((text: string) =>
      stubRoot(text, "FlowchartDiagram"),
    )
    vi.spyOn(printers, "diagramPrinters", "get").mockReturnValue({
      ...table,
      FlowchartDiagram: printStub,
    })
    // The comment makes `Root.comments` non-empty, which Prettier must not
    // treat as its own comments.
    const input = "%% a comment\nstub\n"
    expect(parse.getMockImplementation()?.(input).comments).toHaveLength(1)
    expect(await formatMermaid(input)).toBe("printed\n")
    expect(seen).toEqual(["FlowchartDiagram"])
  })

  it("formats with a cursor position, which walks the tree", async () => {
    // Prettier walks the tree to find the node at the cursor. It must visit
    // only child nodes, not objects such as `loc`.
    /** Prints the body as one word and the line break at the end of the text. */
    function printStubbed(): Doc {
      return ["printed", hardline]
    }

    const table = printers.diagramPrinters
    parse.mockImplementation((text: string) =>
      stubRoot(text, "FlowchartDiagram"),
    )
    vi.spyOn(printers, "diagramPrinters", "get").mockReturnValue({
      ...table,
      FlowchartDiagram: printStubbed,
    })
    const result = await prettier.formatWithCursor("error\n", {
      cursorOffset: 2,
      filepath: "diagram.mmd",
      plugins: [plugin],
    })
    expect(result.formatted).toBe("printed\n")
    expect(result.cursorOffset).toBeGreaterThanOrEqual(0)
  })

  describe("the error pseudo-diagram is printed as written", () => {
    const inputs = [
      "error\n  %% has  \n\n\n  %% comment\n",
      "error\n\t%% has",
      "\n\n---\ntitle:   T\n---\nerror\n  %% has\n",
      "%%{init: {'theme': 'dark'}}%%\nerror\n  %% has\n",
    ]
    it.each(inputs)("standalone file %j", async (input) => {
      await useRealParser()
      expect(await formatMermaid(input)).toBe(input)
    })

    it("inside Markdown list items and block quotes", async () => {
      await useRealParser()
      const markdown = [
        "- item",
        "",
        "  ```mermaid",
        "  error",
        "    %% has",
        "",
        "    %% comment",
        "  ```",
        "",
        "> ```mermaid",
        "> error",
        ">     %% has",
        "> ```",
        "",
      ].join("\n")
      const formatted = await formatMarkdown(markdown)
      expect(formatted).toBe(await formatMarkdownWithoutPlugin(markdown))
      expect(formatted).toBe(markdown)
    })

    it("inside Markdown, is left to Prettier as code it does not format", async () => {
      await useRealParser()
      const markdown = [
        "- item",
        "",
        "  ```mermaid",
        "  error  ",
        "",
        "    %% has\t",
        "  ```",
        "",
      ].join("\n")
      const formatted = await formatMarkdown(markdown)
      expect(formatted).toBe(await formatMarkdownWithoutPlugin(markdown))
      expect(formatted).toBe(
        "- item\n\n  ```mermaid\n  error\n\n    %% has\n  ```\n",
      )
    })

    it("inside Markdown, keeps blank lines at the end of the block", async () => {
      // Prettier strips trailing line breaks from every embedded document,
      // so the plugin declines the block instead of printing it.
      await useRealParser()
      const markdown = "```mermaid\nerror\n  %% has\n\n\n```\n"
      const formatted = await formatMarkdown(markdown)
      expect(formatted).toBe(await formatMarkdownWithoutPlugin(markdown))
      expect(formatted).toBe(markdown)
    })
  })

  it("prints the whole text unchanged even if the root does not cover it", async () => {
    // A root may span only from the first to the last token.
    const input = "\n%% leading\nerror\n  %% has\n\n%% trailing\n"
    const first = input.indexOf("error")
    const last = input.indexOf("has") + 3
    parse.mockImplementation((text: string) => ({
      ...stubRoot(text, "ErrorDiagram"),
      range: [first, last],
    }))
    expect(await formatMermaid(input)).toBe(input)
  })

  describe("line endings of a document printed unchanged follow endOfLine", () => {
    // Prettier normalizes line endings to "\n" before parsing and converts
    // them to `endOfLine` after printing. mermaid.js also treats "\r\n" and
    // "\r" as "\n", so the diagram does not change.
    const input = "error\r\n  %% has\r  %% c\r\n"
    it.each([
      [{}, "error\n  %% has\n  %% c\n"],
      [{ endOfLine: "crlf" }, "error\r\n  %% has\r\n  %% c\r\n"],
      [{ endOfLine: "auto" }, "error\r\n  %% has\r\n  %% c\r\n"],
    ] as const)("with %j", async (options, expected) => {
      await useRealParser()
      expect(await formatMermaid(input, "diagram.mmd", options)).toBe(expected)
    })

    it("and a byte order mark is kept", async () => {
      await useRealParser()
      const withBom = "\uFEFFerror\n  %% has\n"
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
