/**
 * The example in the Usage section of the README and its Japanese version:
 * the input that it parses, the values that its comments show for the
 * fields of `root` that it reads, and the tree that its JSON block shows,
 * with `loc` left out, are those of `parse()`.
 */
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { Root } from "../src/index.ts"
import { parse } from "../src/index.ts"

/** The README files that carry the example. */
const readmes = ["README.md", "README.ja.md"]

/** The line of the example that parses the input. */
const PARSE_CALL = "const root = parse("

/** What comes before the path of a field in a line of the example that reads a field of `root`. */
const FIELD_READ = " = root."

/** What separates a line of the example from the value it shows. */
const SHOWN_VALUE = " // "

/** The contents of the fenced code blocks of `language` in `markdown`, in order. */
function codeBlocksOf(markdown: string, language: string): string[] {
  const opening = `\`\`\`${language}\n`
  const closing = "\n```\n"
  const blocks: string[] = []
  let from = markdown.indexOf(opening)
  while (from !== -1) {
    const start = from + opening.length
    const end = markdown.indexOf(closing, start)
    if (end === -1) throw new Error("a code block is not closed")
    blocks.push(markdown.slice(start, end + 1))
    from = markdown.indexOf(opening, end)
  }
  return blocks
}

/** The value at `path` below `root`, such as `body.type`. */
function valueAt(root: Root, path: string): unknown {
  let value: unknown = root
  const keys = path.split(".")
  for (const key of keys) {
    if (typeof value !== "object" || value === null) {
      throw new Error(`${path} leaves the tree at ${key}`)
    }
    value = (value as Record<string, unknown>)[key]
  }
  return value
}

/** `value` as JSON, without its `loc` fields. */
function withoutLoc(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (key, field: unknown) =>
      key === "loc" ? undefined : field,
    ),
  )
}

describe.each(readmes)("the Usage example of %s", (readme) => {
  const markdown = readFileSync(new URL(`../${readme}`, import.meta.url), {
    encoding: "utf8",
  })
  const example = codeBlocksOf(markdown, "ts").find((block) =>
    block.includes(PARSE_CALL),
  )
  if (example === undefined) throw new Error(`no example in ${readme}`)
  const lines = example.split("\n")
  const call = lines.find((line) => line.startsWith(PARSE_CALL))
  if (call === undefined) throw new Error(`no call of parse() in ${readme}`)
  const input: unknown = JSON.parse(
    call.slice(PARSE_CALL.length, call.lastIndexOf(")")),
  )
  if (typeof input !== "string") throw new Error("the input is not a string")
  const root = parse(input)

  const shown = lines.filter(
    (line) => line.includes(FIELD_READ) && line.includes(SHOWN_VALUE),
  )
  it.each(shown)("%s", (line) => {
    const at = line.indexOf(SHOWN_VALUE)
    const path = line.slice(line.indexOf(FIELD_READ) + FIELD_READ.length, at)
    const value: unknown = JSON.parse(line.slice(at + SHOWN_VALUE.length))
    expect(valueAt(root, path)).toEqual(value)
  })

  it("shows root.body", () => {
    const [tree] = codeBlocksOf(markdown, "json")
    expect(tree).toBeDefined()
    expect(JSON.parse(tree)).toEqual(withoutLoc(root.body))
  })
})
