import { describe, expect, it } from "vitest"
import {
  formatMarkdown,
  formatMarkdownWithoutPlugin,
  formatMermaid,
} from "./helpers.ts"

// Inputs that mermaid.js rejects (UnknownDiagramError in mermaid 12.0.0), run
// through the real parser.
const rejected = ["this is not a diagram\n", "flowchrt LR\n  A --> B\n"]

describe("input the parser rejects", () => {
  it.each(rejected)(
    "is reported as a syntax error in a standalone file: %j",
    async (input) => {
      const error: unknown = await formatMermaid(input).catch((e: unknown) => e)
      // The parser's ParseError, with its position converted for Prettier.
      expect(error).toBeInstanceOf(SyntaxError)
      expect((error as Error).cause).toMatchObject({ name: "ParseError" })
      expect((error as { loc?: unknown }).loc).toMatchObject({
        start: { line: 1 },
      })
    },
  )

  it.each(rejected)(
    "is left to Prettier inside Markdown: %j",
    async (input) => {
      const markdown = `Text\n\n\`\`\`mermaid\n${input}\`\`\`\n`
      const formatted = await formatMarkdown(markdown)
      expect(formatted).toBe(await formatMarkdownWithoutPlugin(markdown))
      expect(formatted).toBe(markdown)
    },
  )
})

// Class diagrams that mermaid.js and the parser reject: a `;` between
// statements, and an empty body after a CSS class (diagrams/class.md, Class
// statements). The error is on the line of the statement.
const rejectedClassDiagrams = [
  "classDiagram\nclass A; class B\n",
  "classDiagram\nclass A:::c {}\n",
]

describe("a class diagram the parser rejects", () => {
  it.each(rejectedClassDiagrams)(
    "is reported as a syntax error in a standalone file: %j",
    async (input) => {
      const error: unknown = await formatMermaid(input).catch((e: unknown) => e)
      expect(error).toBeInstanceOf(SyntaxError)
      expect((error as Error).cause).toMatchObject({ name: "ParseError" })
      expect((error as { loc?: unknown }).loc).toMatchObject({
        start: { line: 2 },
      })
    },
  )

  it.each(rejectedClassDiagrams)(
    "is left to Prettier inside Markdown: %j",
    async (input) => {
      const markdown = `Text\n\n\`\`\`mermaid\n${input}\`\`\`\n`
      const formatted = await formatMarkdown(markdown)
      expect(formatted).toBe(await formatMarkdownWithoutPlugin(markdown))
      expect(formatted).toBe(markdown)
    },
  )
})

// Prettier's code frame ends a line at U+2028 and U+2029 too, which Mermaid
// does not, so the position of an error is counted again from its offsets,
// and an error that ends at the start of a line has a start only. With the
// parser's lines the frame failed on a line that does not exist (a
// `RangeError`). The characters are written as escapes.
describe("an error in a text with U+2028 or U+2029", () => {
  it.each([
    [
      "sequenceDiagram\nparticipant #c\u2028%% e\n John\n",
      { start: { line: 4, column: 6 } },
    ],
    [
      'stateDiagram-v2\nstate X ""\u2029% c\naccDescr {} {\nB\n}\n',
      { start: { line: 3, column: 3 }, end: { line: 4, column: 11 } },
    ],
  ])("is reported as a syntax error: %j", async (input, loc) => {
    const error: unknown = await formatMermaid(input).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(SyntaxError)
    expect((error as Error).cause).toMatchObject({ name: "ParseError" })
    expect((error as { loc?: unknown }).loc).toEqual(loc)
  })
})

describe("input rejected because a directive lies inside a keyword", () => {
  // mermaid.js removes the directive and reads the keyword `subgraph`; the
  // parser rejects a directive inside a keyword (known divergence
  // directive-as-token-boundary).
  const input = "flowchart LR\nsub%%{init: {}}%%graph S\nA\nend\n"

  it("is reported as a syntax error in a standalone file", async () => {
    const error: unknown = await formatMermaid(input).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(SyntaxError)
    expect((error as Error).cause).toMatchObject({ name: "ParseError" })
    expect((error as Error).message).toContain("> 2 | sub%%{init: {}}%%graph S")
  })

  it("is left to Prettier inside Markdown", async () => {
    const markdown = `\`\`\`mermaid\n${input}\`\`\`\n`
    const formatted = await formatMarkdown(markdown)
    expect(formatted).toBe(await formatMarkdownWithoutPlugin(markdown))
    expect(formatted).toBe(markdown)
  })
})

// Control for the tests above: an input mermaid.js accepts is not rejected.
// Only the absence of an error is asserted: the formatting itself is checked
// by the fixtures.
describe("input the parser accepts", () => {
  it("is formatted without an error", async () => {
    await expect(
      formatMermaid("flowchart LR\n  A --> B\n"),
    ).resolves.toBeTypeOf("string")
  })
})

// A known limitation: Prettier removes a byte order mark at the start of the
// text before it calls the parser, and adds it back to the result. The
// parser therefore reads frontmatter without the mark before its opening
// delimiter, which decides whether the block is frontmatter at all
// (common.md, Frontmatter: a mark before the opening delimiter must be
// repeated before the closing one).
describe("a byte order mark before frontmatter", () => {
  it("before both delimiters: mermaid.js accepts the text, the plugin reports a syntax error", async () => {
    const input = "\uFEFF---\ntitle: x\n\uFEFF---\nflowchart LR\nA\n"
    const error: unknown = await formatMermaid(input).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(SyntaxError)
    expect((error as Error).cause).toMatchObject({ name: "ParseError" })
  })

  it("before the opening delimiter only: mermaid.js rejects the text, the plugin formats it", async () => {
    const input = "\uFEFF---\ntitle: x\n---\nflowchart LR\nA\n"
    expect(await formatMermaid(input)).toBe(
      "\uFEFF---\ntitle: x\n---\nflowchart LR\n  A\n",
    )
  })
})
