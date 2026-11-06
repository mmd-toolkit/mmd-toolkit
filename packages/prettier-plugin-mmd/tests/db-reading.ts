import { treeviewBoxCharacters } from "../src/printers/treeview-characters.ts"
/**
 * What formatting must keep, checked without mermaid.js: the Db that the tree
 * of a text denotes, the texts of the embedded data, and the written source
 * apart from whitespace, frontmatter, removed semicolons and redrawn outer
 * box structure.
 *
 * The Db is built from the tree by `dbFromTree` of `@mmd-toolkit/tests`, with
 * the values that mermaid.js derives from the embedded data of the input (the
 * frontmatter, the directives, the data blocks): a fixture of the corpus
 * records them (`embeddedValuesOf`), and another text has the defaults. A
 * formatted text is given the values of its input, which holds for formatting
 * only if it keeps the embedded data as written, so that is checked as well:
 * `writtenEmbeddedTexts` exposes the complete raw values before and after.
 * Permitted margins are checked by `eventmodeling-data-margins.ts` and
 * `state-note-margins.ts`; this module preserves both raw Db differences.
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
  Range,
  TreeviewBranchPrefix,
  TreeviewIgnoredText,
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
 * blocks (the nodes of `DATA_BLOCK_NODE_TYPES`). Eventmodeling's comparison
 * checks its permitted body-margin changes separately from this raw list.
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
        // body is compared, including its margin (docs/eventmodeling.md,
        // Data blocks).
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
 * The diagram types whose `;` may be dropped wherever one is written:
 * docs/flowchart.md and docs/agentflow.md, Semicolons; docs/sequence.md,
 * docs/quadrant.md and docs/xychart.md, Statements one per line. Their rules
 * replace statement separators with line breaks.
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
 * The `classDef` and `style` statements of the diagram types that drop the `;`
 * that ends such a statement, and only that one (docs/class.md, docs/state.md,
 * docs/er.md, docs/requirement.md, docs/block.md, docs/venn.md and
 * docs/usecase.md, Semicolons at the end of a style statement; docs/treemap.md,
 * Semicolons).
 */
const styleStatementTypes: ReadonlySet<string> = new Set([
  "ClassClassDefStatement",
  "ClassStyleStatement",
  "StateClassDefStatement",
  "StateStyleStatement",
  "ErClassDefStatement",
  "ErStyleStatement",
  "RequirementClassDefStatement",
  "RequirementStyleStatement",
  "BlockClassDefStatement",
  "BlockStyleStatement",
  "VennStyleStatement",
  "UsecaseClassDefStatement",
  "UsecaseStyleStatement",
  "TreemapClassDefStatement",
])

/**
 * The offsets of the `;` of a text that formatting may drop: every `;` in a
 * diagram of `semicolonSeparatorDiagramTypes`, and in the others the `;` that
 * the line rule ignores right after a `classDef` or `style` statement, and the
 * last character of such a statement. Every other `;`, including grammatical
 * punctuation and text, stays.
 */
function droppableSemicolonsOf(text: string, root: Root): ReadonlySet<number> {
  const offsets = new Set<number>()
  if (semicolonSeparatorDiagramTypes.has(root.body.type)) {
    for (const token of root.tokens) {
      if (token.value === ";") offsets.add(token.range[0])
    }
    return offsets
  }
  const ends = new Set<number>()
  walk(root.body, (node) => {
    if (!styleStatementTypes.has(node.type)) return
    const { range } = node as unknown as { range: Range }
    ends.add(range[1])
    // ER, state, block and treemap read a last `;` of a statement as part of its
    // range.
    if (text[range[1] - 1] === ";") offsets.add(range[1] - 1)
  })

  /** The directive that ends at `end`. */
  function directiveEndingAt(end: number): Range | undefined {
    return root.directives.find((candidate) => candidate.range[1] === end)
      ?.range
  }

  for (const token of root.tokens) {
    if (token.type !== "IgnoredSemicolon") continue
    // Only whitespace and directives lie between the statement and the `;`.
    let position = token.range[0]
    while (position > 0 && !ends.has(position)) {
      const directive = directiveEndingAt(position)
      if (directive !== undefined) position = directive[0]
      else if (text[position - 1].trim() === "") position--
      else break
    }
    if (ends.has(position)) offsets.add(token.range[0])
  }
  return offsets
}

/**
 * Compare authored text while allowing treeview's explicitly redrawn outer
 * box structure. Only the `;` of `droppableSemicolonsOf` may be removed from
 * the input. Ignore common.md's whitespace (including BOM) and frontmatter;
 * describeFrontmatterChange checks its YAML separately.
 */
export function writtenTextKeptUpToSemicolons(
  before: string,
  after: string,
): boolean {
  const droppable = droppableSemicolonsOf(before, parse(before))
  const [input, output] = [before, after].map((text) => {
    const root = parse(text)
    const structural: Range[] = []
    // Only authored outer box forms may be redrawn. Value-owned box text,
    // arbitrary prefix characters, trivia and every semicolon still compare
    // exactly (docs/treeview.md, Branch prefixes and Source order).
    walk(root.body, (node) => {
      if (
        node.type === "TreeviewBranchPrefix" ||
        node.type === "TreeviewIgnoredText"
      )
        structural.push(
          (node as TreeviewBranchPrefix | TreeviewIgnoredText).range,
        )
    })
    let written = ""
    const offsets: number[] = []
    for (let offset = 0; offset < text.length; offset++) {
      const character = text[offset]
      const frontmatter = root.frontmatter?.range
      if (
        frontmatter !== undefined &&
        frontmatter[0] <= offset &&
        offset < frontmatter[1]
      )
        continue
      const drawn =
        treeviewBoxCharacters.includes(character) &&
        structural.some(([from, to]) => from <= offset && offset < to) &&
        ![...root.comments, ...root.directives].some(
          (item) => item.range[0] <= offset && offset < item.range[1],
        )
      if (!drawn && character.trim() !== "") {
        written += character
        offsets.push(offset)
      }
    }
    return { written, offsets }
  })
  let outputIndex = 0
  for (let inputIndex = 0; inputIndex < input.written.length; inputIndex++) {
    if (input.written[inputIndex] === output.written[outputIndex]) outputIndex++
    else if (
      input.written[inputIndex] !== ";" ||
      !droppable.has(input.offsets[inputIndex])
    )
      return false
  }
  return outputIndex === output.written.length
}
