import { util } from "prettier"
import { parsers } from "prettier/plugins/markdown"
import { languages } from "prettier-plugin-mmd"
import type { Indentation } from "./diagram.ts"
import { formatDiagram } from "./diagram.ts"
import type { Diagnostic, FormatResult, PositionsIn } from "./diagnostic.ts"
import type { Line, LineEnding } from "./lines.ts"
import { lineEndingOf, positionIn, readText, splitLines } from "./lines.ts"

/** A line and a column of Prettier's Markdown tree, both 1-based. */
interface Point {
  readonly line: number
  readonly column: number
}

/** The fields of a node of Prettier's Markdown tree (mdast) that the tool reads. */
interface MarkdownNode {
  readonly type: string
  readonly lang?: string | null
  readonly value?: string
  readonly position: { readonly start: Point; readonly end: Point }
  readonly children?: readonly MarkdownNode[]
}

/** A fenced code block whose info string marks a diagram. */
interface DiagramBlock {
  /** The text of the block as the parser reads it, without its last line ending. */
  readonly value: string
  /** From the first character of the opening fence to the end of the block. */
  readonly position: { readonly start: Point; readonly end: Point }
  /** Whether the opening fence stands on the line of a footnote's label. */
  readonly followsFootnoteLabel: boolean
}

/** What a `prettier-ignore` comment asks Prettier to leave as written. */
type PrettierIgnore = "next" | "start" | "end"

/**
 * The first words of an info string that mark a diagram: the `aliases` of the
 * language of prettier-plugin-mmd. Prettier compares them case-sensitively. It
 * also matches the language's name in lower case and its extensions without the
 * dot, which for this plugin are among its aliases;
 * `tests/plugin-blocks.test.ts` compares the blocks with those Prettier formats.
 */
const diagramLanguages: ReadonlySet<string> = new Set(
  languages.flatMap((language) => language.aliases ?? []),
)

/**
 * Formats the diagrams in the code blocks of a Markdown file and changes
 * nothing else (README, Code blocks in detail). The warnings give their
 * positions in the text that `positionsIn` names.
 */
export async function formatMarkdown(
  text: string,
  indentation: Indentation,
  positionsIn: PositionsIn,
): Promise<FormatResult> {
  const { byteOrderMark, lines, normalized } = readText(text)
  const lineEnding = lineEndingOf(text)
  const diagnostics: Diagnostic[] = []
  let output = byteOrderMark
  // The index of the first line of the file that is not in `output` yet.
  let next = 0
  // The number of lines that the blocks formatted so far have added, or
  // removed where it is negative.
  let addedLines = 0
  for (const block of diagramBlocksOf(await parseMarkdown(normalized))) {
    const result = await formatBlock(block, lines, indentation, lineEnding)
    if (result.kind === "warning") {
      // A block with a warning is left as written, so in the text after
      // formatting only the blocks before it have moved its lines, and its
      // columns stay.
      const { diagnostic } = result
      const { line, column } = diagnostic.position
      diagnostics.push(
        positionsIn === "input"
          ? diagnostic
          : { ...diagnostic, position: { line: line + addedLines, column } },
      )
      continue
    }
    if (result.kind === "unchanged") continue
    output += joinLines(lines.slice(next, result.start)) + result.text
    next = result.start + result.count
    addedLines += result.textLineCount - result.count
  }
  output += joinLines(lines.slice(next))
  return { text: output, diagnostics }
}

/**
 * Parses Markdown with Prettier's Markdown parser, so that the tool finds the
 * code blocks that Prettier finds. Its `parse` reads only the text (it takes
 * one parameter), so it is called without Prettier's options.
 */
async function parseMarkdown(text: string): Promise<MarkdownNode> {
  const parse = parsers.markdown.parse as (
    text: string,
  ) => MarkdownNode | Promise<MarkdownNode>
  return parse(text)
}

/**
 * The code blocks of diagrams in a Markdown tree, in the order of the file,
 * without those that Prettier leaves as written for a `prettier-ignore`
 * comment (README, Excluding files): the node right after
 * `<!-- prettier-ignore -->` among the children of any node, and the nodes
 * between `<!-- prettier-ignore-start -->` and the next
 * `<!-- prettier-ignore-end -->` among the children of the root.
 */
function diagramBlocksOf(root: MarkdownNode): DiagramBlock[] {
  const blocks: DiagramBlock[] = []

  /** Collects the blocks of a node and of its descendants. */
  function visit(node: MarkdownNode, footnoteLines: readonly number[]): void {
    if (
      node.type === "code" &&
      typeof node.lang === "string" &&
      diagramLanguages.has(node.lang) &&
      typeof node.value === "string"
    ) {
      blocks.push({
        value: node.value,
        position: node.position,
        followsFootnoteLabel: footnoteLines.includes(node.position.start.line),
      })
      return
    }
    // The containers of a code block in Prettier's Markdown tree are lists,
    // list items, block quotes, and footnote definitions.
    const lines =
      node.type === "footnoteDefinition"
        ? [...footnoteLines, node.position.start.line]
        : footnoteLines
    const children = node.children ?? []
    const ignored =
      node === root ? nodesInIgnoredRanges(children) : new Set<MarkdownNode>()
    for (const [index, child] of children.entries()) {
      if (ignored.has(child)) continue
      if (index > 0 && prettierIgnoreOf(children[index - 1]) === "next") {
        continue
      }
      visit(child, lines)
    }
  }

  visit(root, [])
  return blocks
}

/**
 * The nodes between a `prettier-ignore-start` comment and the next
 * `prettier-ignore-end` comment, as Prettier finds them among the children of
 * the root: a start without an end leaves nothing as written.
 */
function nodesInIgnoredRanges(
  children: readonly MarkdownNode[],
): ReadonlySet<MarkdownNode> {
  const ignored = new Set<MarkdownNode>()
  let start: number | undefined
  for (const [index, child] of children.entries()) {
    const ignore = prettierIgnoreOf(child)
    if (ignore === "start" && start === undefined) {
      start = index
    } else if (ignore === "end" && start !== undefined) {
      for (const node of children.slice(start + 1, index)) ignored.add(node)
      start = undefined
    }
  }
  return ignored
}

/**
 * What a node asks as a `prettier-ignore` comment, as Prettier's Markdown
 * printer reads it: an HTML node of `<!--`, `prettier-ignore` with
 * `-start` or `-end` or nothing, and `-->`, with whitespace around the word.
 */
function prettierIgnoreOf(node: MarkdownNode): PrettierIgnore | undefined {
  const { value } = node
  if (
    node.type !== "html" ||
    value === undefined ||
    !value.startsWith("<!--") ||
    !value.endsWith("-->")
  ) {
    return undefined
  }
  switch (value.slice("<!--".length, -"-->".length).trim()) {
    case "prettier-ignore":
      return "next"
    case "prettier-ignore-start":
      return "start"
    case "prettier-ignore-end":
      return "end"
    default:
      return undefined
  }
}

/** What formatting a code block gives. */
type BlockResult =
  | { readonly kind: "unchanged" }
  | { readonly kind: "warning"; readonly diagnostic: Diagnostic }
  | {
      readonly kind: "replaced"
      /** The index of the line of the opening fence in the lines of the file. */
      readonly start: number
      /**
       * The number of lines that `text` replaces: the line of the opening
       * fence and the content lines.
       */
      readonly count: number
      /** The lines that replace them, with their line endings. */
      readonly text: string
      /** The number of lines of `text`. */
      readonly textLineCount: number
    }

/**
 * Formats the diagram of a code block. Only the content lines change: the
 * lines between the opening fence and the closing fence, or the end of the
 * block, without its blank lines there, when it is not closed. The line of the
 * opening fence keeps its text, and its line ending too unless the diagram
 * becomes empty.
 */
async function formatBlock(
  block: DiagramBlock,
  lines: readonly Line[],
  indentation: Indentation,
  lineEnding: LineEnding,
): Promise<BlockResult> {
  // The parser's line numbers are 1-based, so the 1-based number of the
  // opening fence's line is the index of the first content line.
  const start = block.position.start.line
  if (block.followsFootnoteLabel) {
    // The lines of a footnote are indented by four spaces, whatever stands
    // before the fence on the line of its label.
    return {
      kind: "warning",
      diagnostic: {
        severity: "warning",
        message:
          "not formatted: the opening fence stands on the line of a footnote label",
        position: { line: start, column: block.position.start.column },
      },
    }
  }
  // The lines of the diagram: the content lines, except, in a block that is
  // not closed, the empty lines and the lines of only spaces and tabs at its
  // end. Markdown reads those as part of the block, but they also part it from
  // what follows it, as an empty line between two items of a list does, which
  // keeps the list loose; they are left as written (README, Code blocks in
  // detail).
  const contentValues = valueLinesOf(block, lines)
  const values = isClosed(block, lines, contentValues.length)
    ? contentValues
    : withoutTrailingBlankLines(contentValues)
  const prefixes: string[] = []
  for (const [index, value] of values.entries()) {
    const line = lines[start + index].text
    if (!line.endsWith(value)) {
      return {
        kind: "warning",
        diagnostic: {
          severity: "warning",
          message:
            "not formatted: a tab in the indentation of this line is read partly as the text of the diagram",
          position: {
            line: start + index + 1,
            column: line.length - commonSuffixLength(line, value),
          },
        },
      }
    }
    prefixes.push(line.slice(0, line.length - value.length))
  }
  const endsWithLineEnding =
    values.length > 0 && lines[start + values.length - 1].ending !== ""
  const text = values.join("\n") + (endsWithLineEnding ? "\n" : "")

  const result = await formatDiagram(text, indentation, "\n")
  if (result.kind === "rejected") {
    const { line, column } = positionIn(text, result.offset)
    return {
      kind: "warning",
      diagnostic: {
        severity: "warning",
        message: result.message,
        position: {
          line: start + line,
          column: (prefixes[line - 1]?.length ?? 0) + column,
        },
      },
    }
  }
  // The text of a block that is not closed and ends the file without a line
  // ending has none at its end, and Prettier adds one: whether the file ends
  // with one is not the diagram's, so it is left out before comparing.
  const formatted =
    !endsWithLineEnding && result.text.endsWith("\n")
      ? result.text.slice(0, -1)
      : result.text
  if (formatted === text) return { kind: "unchanged" }

  const fenceLine = lines[start - 1]
  const prefix = newLinePrefixOf(
    fenceLine.text.slice(0, block.position.start.column - 1),
  )
  // The lines written: the line of the opening fence, and after it each
  // formatted line with the prefix and the line ending of the file.
  const written: Line[] = [fenceLine]
  for (const line of splitLines(formatted)) {
    // The rest after the last line ending is not a line.
    if (line.ending === "" && line.text === "") break
    // The prefix holds only spaces, tabs, and `>`.
    written.push({
      text: line.text === "" ? prefix.trimEnd() : prefix + line.text,
      ending: lineEnding,
    })
  }
  // The last line written, which is the line of the opening fence when the
  // diagram becomes empty, keeps the line ending of the last content line, so
  // that the line after the block follows the same line ending as before.
  // Another one could join with that line's into one: a `\r` before an empty
  // line that ends with `\n` is read as `\r\n`, and the lines after the block
  // would change (README, Code blocks in detail). It also keeps a block that
  // ends the file without a line ending without one.
  const last = written.length - 1
  written[last] = {
    text: written[last].text,
    ending: lines[start + values.length - 1].ending,
  }
  return {
    kind: "replaced",
    start: start - 1,
    count: values.length + 1,
    text: joinLines(written),
    textLineCount: written.length,
  }
}

/**
 * The lines of the text of a block, one for each content line. The parser
 * joins the content lines with `\n`, without a line ending after the last, so
 * that the text `""` stands both for no content line and for one empty
 * content line; see {@link hasOneEmptyLine}.
 */
function valueLinesOf(block: DiagramBlock, lines: readonly Line[]): string[] {
  if (block.value !== "") return block.value.split("\n")
  return hasOneEmptyLine(block, lines) ? [""] : []
}

/**
 * Whether a block whose text is `""` has one content line. The line after the
 * opening fence is then that line, which the block reaches into and which
 * holds only the indentation and the `>` of the block's container. Otherwise
 * that line is the closing fence, which holds the characters of a fence, or it
 * is outside the block.
 */
function hasOneEmptyLine(block: DiagramBlock, lines: readonly Line[]): boolean {
  const next = block.position.start.line
  const { end } = block.position
  const reachesNext =
    end.line - 1 > next || (end.line - 1 === next && end.column > 1)
  if (!reachesNext) return false
  const line = lines[next].text
  return !line.includes("`") && !line.includes("~")
}

/**
 * Whether a block has a closing fence: the line after its content lines, which
 * the block reaches into with the characters of a fence. A block that is not
 * closed ends where its container or the file ends, on its last content line,
 * or on the next line with no more of it than the indentation and the `>` of
 * its container.
 */
function isClosed(
  block: DiagramBlock,
  lines: readonly Line[],
  contentLineCount: number,
): boolean {
  const next = block.position.start.line + contentLineCount
  const { end } = block.position
  if (end.line - 1 !== next) return false
  const reached = lines[next].text.slice(0, end.column - 1)
  return reached.includes("`") || reached.includes("~")
}

/**
 * The lines without the lines at their end that are blank as Markdown reads
 * them: empty, or of only spaces and tabs.
 */
function withoutTrailingBlankLines(values: readonly string[]): string[] {
  let count = values.length
  while (count > 0 && isBlank(values[count - 1])) count--
  return values.slice(0, count)
}

/** Whether a line is empty or holds only spaces and tabs. */
function isBlank(text: string): boolean {
  return util.skipSpaces(text, 0) === text.length
}

/**
 * What starts a new content line of a block: what stands before the opening
 * fence on its line, with the characters of a list marker turned into spaces,
 * so that the line takes the indentation and the `>` of the block's container
 * and the indentation of the fence (README, Code blocks in detail). Tabs stay as
 * written, and with them the columns. A prefix that ends with `>` takes a
 * space: a block quote reads one space after its `>` as part of its marker, so
 * without it a line of the diagram that starts with a space would lose it.
 */
function newLinePrefixOf(beforeFence: string): string {
  let prefix = ""
  for (const character of beforeFence) {
    prefix +=
      character === " " || character === "\t" || character === ">"
        ? character
        : " "
  }
  return prefix.endsWith(">") ? `${prefix} ` : prefix
}

/** The number of characters at the end of `a` that `b` ends with too. */
function commonSuffixLength(a: string, b: string): number {
  let length = 0
  while (
    length < a.length &&
    length < b.length &&
    a[a.length - 1 - length] === b[b.length - 1 - length]
  ) {
    length++
  }
  return length
}

/** Joins lines with their own line endings. */
function joinLines(lines: readonly Line[]): string {
  let text = ""
  for (const line of lines) text += line.text + line.ending
  return text
}
