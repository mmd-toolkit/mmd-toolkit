import type { Node, Range } from "@mmd-toolkit/parser"
import type { Doc } from "prettier"
import { builders } from "prettier/doc"
import type { AtomLayout } from "./atoms.ts"
import { findNodes, minOf } from "./collections.ts"
import type { KeptLines } from "./kept-lines.ts"
import { lineStartOf } from "./kept-lines.ts"
import { printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"
import { findFirstIndex, isWhitespace } from "./source.ts"

const { literalline } = builders

/**
 * The data blocks that print moved: a `@{` or `{` that a line break follows,
 * and the lines up to its `}`. The diagram types that write one (flowchart,
 * agentflow, kanban, sequence, and the JSON tables of a use case diagram) read
 * its lines as YAML or JSON (docs/flowchart.md, Data blocks).
 */
const movableTypes: ReadonlySet<string> = new Set([
  "FlowchartDataBlock",
  "AgentflowDataBlock",
  "KanbanDataBlock",
  "SequenceDataBlock",
  "UsecaseJsonDataBlock",
])

/** The movable data blocks of each source, in source order, found once. */
const blocksBySource = new WeakMap<Source, readonly Node[]>()

/**
 * The movable data blocks of the source, of one line and of several: a
 * statement that holds a block of one line next to one of several moves
 * neither.
 */
function dataBlocksOf(source: Source): readonly Node[] {
  const cached = blocksBySource.get(source)
  if (cached !== undefined) return cached
  const blocks = findNodes(source.root.body, (node) =>
    movableTypes.has(node.type),
  )
  blocksBySource.set(source, blocks)
  return blocks
}

/** Where the statement that holds the block stands, and what is read. */
export interface DataBlockPlacement {
  /** The kept lines of the diagram: a block on one of them stays as written. */
  readonly kept: KeptLines
  /** The indentation of the line that the statement starts on, as printed. */
  readonly statement: string
  /** The width of one level of indentation; a block moves only if not 0. */
  readonly tabWidth: number
  /**
   * Whether the layout holds the statement as one atom that is printed as
   * written, as a kanban node is, so the blocks lie inside it and not in atoms
   * of their own.
   */
  readonly wholeLine?: boolean
}

/**
 * The layout with the multi-line data block of the statement in `range`
 * printed one level inside the statement, and its closing `}` on a line of its
 * own at the column of the statement, in spaces (see `moveDataBlock`).
 */
export function moveDataBlocks(
  source: Source,
  layout: AtomLayout,
  range: Range,
  placement: DataBlockPlacement,
): AtomLayout {
  const all = dataBlocksOf(source)
  const first = findFirstIndex(all, (block) => block.range[0] >= range[0])
  // The blocks do not overlap, so those inside the range follow one another.
  const next = all[first + 1]
  const block = all[first]
  if (
    block === undefined ||
    block.range[1] > range[1] ||
    (next !== undefined && next.range[1] <= range[1]) ||
    placement.tabWidth === 0
  )
    return layout
  const moved = moveDataBlock(source, block, range, placement)
  if (moved === undefined) return layout
  const index = layout.atoms.findIndex(
    (atom) =>
      atom.doc === undefined &&
      atom.writtenIndentation === undefined &&
      (placement.wholeLine === true
        ? atom.start <= block.range[0] && block.range[1] <= atom.end
        : atom.start === block.range[0] && block.range[1] === atom.end),
  )
  if (index === -1) return layout
  const atom = layout.atoms[index]
  const doc: Doc = [
    printAsWritten(source, atom.start, block.range[0]),
    moved,
    printAsWritten(source, block.range[1], atom.end),
  ]
  return {
    ...layout,
    atoms: layout.atoms.map((item, at) =>
      at === index ? { ...atom, doc } : item,
    ),
  }
}

/**
 * The block printed with every line moved by the same number of spaces, so
 * that the shallowest line that holds text stands one level inside the
 * statement, and its closing `}`, where it stands on a line of its own, at
 * the column of the statement, in spaces; undefined where the block stays as
 * written. The lines stay literal lines: a literal block scalar reads their
 * trailing whitespace. A block moves only if
 *
 * - a line break follows the `{`: the first line counts its columns from the
 *   `{`, the later lines from the start of the line, so moving the later lines
 *   alone changes the reading of the first;
 * - the whitespace at the start of each line is spaces: YAML rejects a tab
 *   there, and the lines are moved by a count of spaces;
 * - no `%%{` lies in it: a directive in the block is written as it stands;
 * - when a line that holds text starts at the first column, none starts with
 *   `---`, `...`, or `%`: moved, the line would no longer be a document
 *   marker or a comment;
 * - a diagram that trims the whole block reads one line of text only: the
 *   sequence diagram removes the whitespace at the start of the first line
 *   and counts the columns of the later ones from the first column;
 * - a `}` that stands on a line of its own has only spaces before it, no more
 *   than the shallowest line that holds text: the whitespace before it is a
 *   line of the text, and a deeper one would be lost when the `}` moves;
 * - no line of the block, nor the line that the block starts on, is a kept
 *   line (see `KeptLines`);
 * - the block starts on the first line of its statement, whose indentation is
 *   then the indentation of the line that holds the `{`;
 * - the statement holds no other block: after the `}` of a block that moved,
 *   the next block would start on a line that is not the first of the
 *   statement, and the text of two blocks that touch is read as one.
 */
function moveDataBlock(
  source: Source,
  block: Node,
  statement: Range,
  placement: DataBlockPlacement,
): Doc | undefined {
  const text = source.text.slice(...block.range)
  if (
    text.includes("%%{") ||
    source.text.slice(statement[0], block.range[0]).includes("\n") ||
    holdsKeptLine(source, block.range, placement.kept)
  )
    return undefined
  const rows = text.split("\n")
  const opening = rows[0]
  const last = rows.at(-1) as string
  if (
    rows.length < 2 ||
    !opening.endsWith("{") ||
    opening.indexOf("{") !== opening.length - 1 ||
    !last.endsWith("}")
  )
    return undefined
  // A `}` is alone when only spaces stand before it. Any other whitespace
  // makes the row a row of the text, and the checks of the rows below apply.
  let closing = 0
  while (last[closing] === " ") closing++
  const closesAlone = last.slice(closing) === "}"
  const body = rows.slice(1, closesAlone ? -1 : undefined)
  const margins: number[] = []
  for (const row of body) {
    let margin = 0
    while (row[margin] === " ") margin++
    if (margin < row.length && isWhitespace(row[margin])) return undefined
    margins.push(margin)
  }

  /** Whether the line holds text and not spaces only. */
  function holdsText(index: number): boolean {
    return body[index].length > margins[index]
  }

  const textLines = body.flatMap((_, index) =>
    holdsText(index) ? [index] : [],
  )
  if (textLines.length === 0) return undefined
  if (block.type === "SequenceDataBlock" && textLines.length > 1)
    return undefined
  const shallowest = minOf(textLines.map((index) => margins[index]))
  if (
    shallowest === 0 &&
    textLines.some(
      (index) =>
        margins[index] === 0 &&
        (body[index].startsWith("---") ||
          body[index].startsWith("...") ||
          body[index].startsWith("%")),
    )
  )
    return undefined
  if (closesAlone) {
    // The whitespace before the `}` is the last line of the block text. In a
    // literal or folded scalar it is an empty line where it is no wider than
    // the shallowest line, and a line with spaces of its own where it is wider.
    if (closing > shallowest) return undefined
  }
  const target =
    columnsOf(placement.statement, placement.tabWidth) + placement.tabWidth
  const shift = target - shallowest
  // A line of only spaces is moved too, so that it keeps its width beyond the
  // indentation of a literal block scalar; one that the shift leaves without
  // width becomes empty, as does an empty line.
  const moved = body.map((row, index) =>
    holdsText(index)
      ? " ".repeat(margins[index] + shift) + row.slice(margins[index])
      : " ".repeat(Math.max(0, row.length === 0 ? 0 : row.length + shift)),
  )
  const lines = [opening, ...moved]
  const docs: Doc[] = []
  for (const [index, line] of lines.entries()) {
    if (index > 0) docs.push(literalline)
    docs.push(line)
  }
  if (closesAlone) {
    // Spaces, also with `useTabs`: a tab makes the line before the `}` a line
    // with text in a scalar that keeps its empty lines (`|+`, `>+`).
    docs.push(
      literalline,
      " ".repeat(columnsOf(placement.statement, placement.tabWidth)),
      "}",
    )
  }
  return docs
}

/** The columns of an indentation, in which a tab is `tabWidth` columns. */
function columnsOf(indentation: string, tabWidth: number): number {
  let columns = 0
  for (const character of indentation) {
    columns += character === "\t" ? tabWidth : 1
  }
  return columns
}

/** Whether the line of a range's start or one of its lines is a kept line. */
function holdsKeptLine(source: Source, range: Range, kept: KeptLines): boolean {
  const starts = [lineStartOf(source, range[0])]
  for (
    let lineFeed = source.text.indexOf("\n", range[0]);
    lineFeed !== -1 && lineFeed < range[1];
    lineFeed = source.text.indexOf("\n", lineFeed + 1)
  ) {
    starts.push(lineStartOf(source, lineFeed + 1))
  }
  return starts.some(
    (start) => kept.joined.has(start) || kept.verbatim.has(start),
  )
}
