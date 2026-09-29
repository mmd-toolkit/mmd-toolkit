import type { Range } from "../../src/index.ts"

// The comments of the node types in `src/ast.ts` and `src/ast/<diagram>.ts`
// show examples of the syntax of each node type, with a line of `^` under
// each line of input for the range of the node. These functions read them.

/** One example of a comment: the input, and the range that the `^` lines mark. */
export interface Example {
  readonly nodeType: string
  readonly input: string
  readonly range: Range
}

/** Whether `line` is a line of `^` marks: only spaces and `^`, with at least one `^`. */
function isMarkLine(line: string): boolean {
  return (
    line.includes("^") &&
    [...line].every((character) => character === " " || character === "^")
  )
}

/** The example that the lines of one block of a comment hold. */
function exampleOf(nodeType: string, lines: readonly string[]): Example {
  const inputLines: string[] = []
  let start: number | null = null
  let end = 0
  let lineStart = 0
  for (const line of lines) {
    if (isMarkLine(line)) {
      // The marks are under the input line before them.
      const previousLineStart =
        lineStart - inputLines[inputLines.length - 1].length - 1
      start ??= previousLineStart + line.indexOf("^")
      end = previousLineStart + line.lastIndexOf("^") + 1
    } else {
      inputLines.push(line)
      lineStart += line.length + 1
    }
  }
  if (start === null) throw new Error(`no marks in an example of ${nodeType}`)
  return { nodeType, input: inputLines.join("\n"), range: [start, end] }
}

/** Every example in the comments of the node types of `source`. */
export function examplesIn(source: string): Example[] {
  const examples: Example[] = []
  const lines = source.split("\n")
  lines.forEach((line, index) => {
    if (
      !line.startsWith("export interface ") ||
      !line.endsWith(" extends NodeBase {")
    ) {
      return
    }
    const nodeType = line.slice(
      "export interface ".length,
      line.length - " extends NodeBase {".length,
    )
    // The comment is the block of lines right before the interface.
    let commentStart = index - 1
    while (!lines[commentStart].startsWith("/**")) commentStart -= 1
    const comment = lines
      .slice(commentStart + 1, index - 1)
      .map((commentLine) => commentLine.slice(" * ".length))
    let block: string[] | null = null
    for (const commentLine of comment) {
      if (block === null) {
        if (commentLine === "```text") block = []
      } else if (commentLine === "```" || commentLine === "") {
        if (block.length > 0) examples.push(exampleOf(nodeType, block))
        block = commentLine === "" ? [] : null
      } else {
        block.push(commentLine)
      }
    }
  })
  return examples
}
