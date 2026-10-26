/**
 * What formatting must keep, checked without mermaid.js: the Db that the tree
 * of a text denotes, the texts of the embedded data, and the written source
 * apart from whitespace, frontmatter, and removed semicolons.
 *
 * The Db is built from the tree by `dbFromTree` of `@mmd-toolkit/tests`, with
 * the values that mermaid.js derives from the embedded data of the input (the
 * frontmatter, the directives, the data blocks): a fixture of the corpus
 * records them (`embeddedValuesOf`), and another text has the defaults. A
 * formatted text is given the values of its input, which holds for formatting
 * only if it keeps the embedded data as written, so that is checked as well:
 * `writtenEmbeddedTexts` is the same before and after.
 */
import type {
  CheckedRoot,
  TreeProblem,
  DbSummary,
  DbTreeRoot,
  EmbeddedValues,
} from "@mmd-toolkit/tests"
import {
  checkTree,
  DATA_BLOCK_NODE_TYPES,
  cssSupportsColor,
  dbFromTree,
  getDefaultConfig,
} from "@mmd-toolkit/tests"
import * as prettier from "prettier"
import type { Options } from "prettier"
import type {
  DiagramBody,
  Root,
  EventmodelingDataBlock,
} from "@mmd-toolkit/parser"
import { parse, visitorKeys } from "@mmd-toolkit/parser"
import { significantIndentationWidth } from "../src/printers/lines.ts"

/** Whether a node is a data block, whose written text is embedded data. */
function isDataBlock(node: { type: string }): boolean {
  return DATA_BLOCK_NODE_TYPES.has(node.type)
}

/** Native raw terminals need no externally evaluated data effects. */
function isNativeDataBlock(node: {
  type: string
}): node is EventmodelingDataBlock {
  return node.type === "EventmodelingDataBlock"
}

/** The values of a text whose embedded data gives mermaid.js nothing to derive. */
export function defaultEmbedded(): EmbeddedValues {
  return {
    config: getDefaultConfig(),
    title: undefined,
    dataBlockEffects: [],
  }
}

/**
 * The Db summary that the tree of `text` denotes: the tree is given as its
 * JSON, as a recorded tree is. Throws the error of the parser for a text that
 * it rejects.
 */
export function dbOfText(
  text: string,
  embedded: EmbeddedValues,
): DbSummary | null {
  const root = parse(text)
  if (
    embedded.dataBlockEffects.length === 0 &&
    writtenDataBlockTexts(root).length > 0
  ) {
    return null
  }
  const tree = JSON.parse(JSON.stringify(root)) as DbTreeRoot
  return dbFromTree(text, tree, embedded, cssSupportsColor)
}

/** The data blocks of a tree, which the Db is built with the effects that mermaid.js gave. */
function writtenDataBlockTexts(root: Root): unknown[] {
  const blocks: unknown[] = []
  walk(root.body, (node) => {
    // Native data terminals are read directly from the tree and source, with
    // no externally evaluated effects (diagrams/eventmodeling.md, Data).
    if (isDataBlock(node) && !isNativeDataBlock(node)) blocks.push(node)
  })
  return blocks
}

/** Calls `visit` for every node below `node`, in the order of the parser's `visitorKeys`. */
function walk(node: unknown, visit: (node: { type: string }) => void): void {
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit)
    return
  }
  if (typeof node !== "object" || node === null || !("type" in node)) return
  const typed = node as { type: string }
  visit(typed)
  for (const key of visitorKeys[typed.type as keyof typeof visitorKeys] ?? []) {
    walk((node as Record<string, unknown>)[key], visit)
  }
}

/**
 * The text of each piece of embedded data of a text other than the
 * frontmatter, as written, in source order: the directives and the data
 * blocks (the nodes of `DATA_BLOCK_NODE_TYPES`). The printers print
 * these as written, so the list is the same before and after formatting.
 */
export function writtenEmbeddedTexts(
  text: string,
  root: Root = parse(text),
): string[] {
  const ranges: [number, number][] = []
  for (const directive of root.directives) ranges.push(directive.range)
  walk(root.body, (node) => {
    if (isDataBlock(node)) {
      if (isNativeDataBlock(node)) {
        // The optional tag and named gaps can format; only the complete brace
        // body is opaque (docs/eventmodeling.md, Data blocks).
        const block = node
        const opening = root.tokens.find(
          (token) =>
            token.type === "Punctuator" &&
            token.value === "{" &&
            block.range[0] <= token.range[0] &&
            token.range[1] <= block.value.range[0],
        )
        if (opening === undefined) throw new Error("missing native data opener")
        ranges.push([opening.range[0], block.range[1]])
      } else ranges.push((node as unknown as { range: [number, number] }).range)
    }
  })
  return ranges
    .sort((a, b) => a[0] - b[0])
    .map(([start, end]) => withLineFeeds(text.slice(start, end)))
}

/**
 * The text with each line terminator as `\n`, as mermaid.js reads it:
 * Prettier writes the line terminators that its option `endOfLine` says.
 */
function withLineFeeds(text: string): string {
  return text.split("\r\n").join("\n").split("\r").join("\n")
}

/**
 * How the frontmatter changed from `before` to `after`, or null when it is
 * as written or as Prettier's YAML formatter prints its body with the chosen
 * options and at least one indentation character per level, which is what
 * the printer does where that is safe (docs/compatibility.md, Frontmatter).
 * Prettier keeps the value of the YAML, so the values mermaid.js derives
 * from it stay.
 */
export async function describeFrontmatterChange(
  before: string,
  after: string,
  options: Options = {},
): Promise<string | null> {
  const [beforeRoot, afterRoot] = [parse(before), parse(after)]
  const written = beforeRoot.frontmatter
  const printed = afterRoot.frontmatter
  if (written === null || printed === null) {
    return written === printed ? null : "the frontmatter appears or goes"
  }
  if (
    withLineFeeds(before.slice(...written.range)) ===
    withLineFeeds(after.slice(...printed.range))
  ) {
    return null
  }
  const formatted = await prettier.format(written.value, {
    ...options,
    parser: "yaml",
    tabWidth: significantIndentationWidth(options.tabWidth ?? 2),
    endOfLine: "lf",
  })
  const body = formatted.endsWith("\n") ? formatted.slice(0, -1) : formatted
  return body === withLineFeeds(printed.value)
    ? null
    : "the frontmatter is neither as written nor formatted as YAML"
}

/** Checks the public parser tree as the corpus's JSON-shaped tree interface. */
export function treeProblemsOfText(text: string): TreeProblem[] {
  return checkTree(text, JSON.parse(JSON.stringify(parse(text))) as CheckedRoot)
}

/**
 * Only these diagram types may drop separator or ignored line-end `;`:
 * docs/flowchart.md and docs/agentflow.md, Semicolons; docs/sequence.md,
 * docs/quadrant.md and docs/xychart.md, Statements one per line. Their rules
 * replace statement separators with line breaks. Every other diagram type
 * keeps all semicolons, including grammatical punctuation and text.
 */
const semicolonSeparatorDiagramTypes: ReadonlySet<DiagramBody["type"]> =
  new Set([
    "FlowchartDiagram",
    "AgentflowDiagram",
    "SequenceDiagram",
    "QuadrantDiagram",
    "XychartDiagram",
  ])

/**
 * Every printer keeps written characters. Only semicolonSeparatorDiagramTypes
 * may remove input `;`. Ignore common.md's whitespace (including BOM) and
 * frontmatter; describeFrontmatterChange checks its YAML separately.
 */
export function writtenTextKeptUpToSemicolons(
  before: string,
  after: string,
): boolean {
  const keepsAllSemicolons = !semicolonSeparatorDiagramTypes.has(
    parse(before).body.type,
  )
  const [input, output] = [before, after].map((text) => {
    const frontmatter = parse(text).frontmatter
    const outside =
      frontmatter === null
        ? text
        : text.slice(0, frontmatter.range[0]) + text.slice(frontmatter.range[1])
    let written = ""
    for (const character of outside) {
      if (character.trim() !== "") written += character
    }
    return written
  })
  let outputIndex = 0
  for (let inputIndex = 0; inputIndex < input.length; inputIndex++) {
    if (input[inputIndex] === output[outputIndex]) outputIndex++
    else if (input[inputIndex] !== ";" || keepsAllSemicolons) return false
  }
  return outputIndex === output.length
}
