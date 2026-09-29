import * as prettier from "prettier"
import type {
  Comment,
  DiagramBody,
  Position,
  Range,
  Root,
} from "@mmd-toolkit/parser"
import plugin from "../src/index.ts"

/**
 * Formats a standalone Mermaid file with the plugin.
 */
export function formatMermaid(
  text: string,
  filepath = "diagram.mmd",
  options: prettier.Options = {},
): Promise<string> {
  return prettier.format(text, { ...options, filepath, plugins: [plugin] })
}

/**
 * Formats Markdown with the plugin.
 */
export function formatMarkdown(text: string): Promise<string> {
  return prettier.format(text, { parser: "markdown", plugins: [plugin] })
}

/**
 * Formats Markdown with Prettier alone, as the baseline for code blocks that
 * the plugin must leave to Prettier.
 */
export function formatMarkdownWithoutPlugin(text: string): Promise<string> {
  return prettier.format(text, { parser: "markdown" })
}

/**
 * Converts an offset to a 1-based line and 0-based column.
 */
function positionAt(text: string, offset: number): Position {
  const before = text.slice(0, offset)
  const lastBreak = before.lastIndexOf("\n")
  return {
    line: before.split("\n").length,
    column: offset - (lastBreak + 1),
  }
}

/**
 * Finds `%%` comments for a stub root: on each line, the first `%%` that does
 * not open a directive, to the end of the line.
 */
function findComments(text: string): Comment[] {
  const comments: Comment[] = []
  let lineStart = 0
  for (const line of text.split("\n")) {
    const commentStart = line.indexOf("%%")
    if (commentStart !== -1 && line[commentStart + 2] !== "{") {
      const start = lineStart + commentStart
      const end = lineStart + line.length
      comments.push({
        type: "Comment",
        value: line.slice(commentStart + 2),
        range: [start, end],
        loc: { start: positionAt(text, start), end: positionAt(text, end) },
      })
    }
    lineStart += line.length + 1
  }
  return comments
}

/**
 * Builds a minimal root node for stubbing the parser. The body has the given
 * type, which selects the diagram printer.
 *
 * Only the body is cast: its type is made up on purpose, to exercise the
 * dispatch without a real diagram printer. Every other field is checked
 * against the parser's `Root`.
 */
export function stubRoot(text: string, bodyType: string): Root {
  const range: Range = [0, text.length]
  const loc = {
    start: positionAt(text, 0),
    end: positionAt(text, text.length),
  }
  const comments = findComments(text)
  const body = { type: bodyType, range, loc } as unknown as DiagramBody
  return {
    type: "Root",
    diagramType: "error",
    body,
    frontmatter: null,
    comments,
    directives: [],
    tokens: [],
    range,
    loc,
  } satisfies Root
}
