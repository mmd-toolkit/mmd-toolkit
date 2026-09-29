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

describe("input rejected because a directive lies inside a string", () => {
  // mermaid.js removes the directive and reads the label `a  b`; the parser
  // rejects a directive inside a string (fixture common/directive-in-string).
  const input = 'flowchart LR\nA["a %%{init: {}}%% b"]-->B\n'

  it("is reported as a syntax error in a standalone file", async () => {
    const error: unknown = await formatMermaid(input).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(SyntaxError)
    expect((error as Error).cause).toMatchObject({ name: "ParseError" })
    expect((error as Error).message).toContain(
      '> 2 | A["a %%{init: {}}%% b"]-->B',
    )
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
