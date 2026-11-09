import type { Node, Range } from "@mmd-toolkit/ast"
import type { Doc } from "prettier"
import { builders } from "prettier/doc"
import type { AtomLayout } from "./atoms.ts"
import { findNodes, minOf } from "./collections.ts"
import type { KeptLines } from "./kept-lines.ts"
import { lineStartOf } from "./kept-lines.ts"
import { printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"
import {
  findDirectiveEndingAt,
  findFirstIndex,
  isSpaceOrTab,
  isWhitespace,
} from "./source.ts"

const { conditionalGroup, literalline, literallineWithoutBreakParent } =
  builders

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

/**
 * The movable data blocks whose single line is padded: all but the JSON tables
 * of a use case diagram, whose `{` and `}` are the brackets of the JSON itself
 * and not the delimiters of a block (docs/usecase.md, JSON tables).
 */
const paddedTypes: ReadonlySet<string> = new Set([
  "FlowchartDataBlock",
  "AgentflowDataBlock",
  "KanbanDataBlock",
  "SequenceDataBlock",
])

/**
 * The blocks of one line that print on several lines when the line is too long:
 * the diagram types that read the text of a block as YAML and accept the lines
 * of a block mapping in place of a flow mapping. A sequence diagram rejects the
 * lines, and a JSON table is JSON.
 */
const splitTypes: ReadonlySet<string> = new Set([
  "FlowchartDataBlock",
  "AgentflowDataBlock",
  "KanbanDataBlock",
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
 * The layout with the data blocks of the statement in `range` formatted: a
 * block of one line printed with one space inside each end (see
 * `padDataBlock`), and, where the statement holds no other block, a block of
 * several lines printed one level inside the statement, with its closing `}`
 * on a line of its own at the column of the statement, in spaces (see
 * `moveDataBlock`). The `{` of a JSON table of a use case diagram is printed
 * right after its `@` (see `findJsonTableBrace`).
 */
export function formatDataBlocks(
  source: Source,
  layout: AtomLayout,
  range: Range,
  placement: DataBlockPlacement,
): AtomLayout {
  const all = dataBlocksOf(source)
  // The blocks do not overlap, so those inside the range follow one another.
  const first = findFirstIndex(all, (block) => block.range[0] >= range[0])
  const afterLast = findFirstIndex(all, (block) => block.range[1] > range[1])
  const atoms = [...layout.atoms]
  let changed = false
  for (let index = first; index < afterLast; index++) {
    const block = all[index]
    const brace = findJsonTableBrace(source, block, placement.kept)
    const padded = isOneLine(source.text.slice(...block.range))
      ? padDataBlock(source, all, index, placement.kept)
      : undefined
    const doc =
      (padded !== undefined
        ? (splitDataBlock(
            source,
            block,
            range,
            placement,
            padded,
            afterLast - first === 1,
          ) ?? padded)
        : isOneLine(source.text.slice(...block.range))
          ? undefined
          : afterLast - first === 1 && placement.tabWidth !== 0
            ? moveDataBlock(source, block, range, placement, brace)
            : undefined) ??
      (brace === null
        ? undefined
        : ["@", printAsWritten(source, brace, block.range[1])])
    if (doc === undefined) continue
    // The atoms are in source order and do not overlap, so the first one that
    // ends at or after the block is the one that holds it, if any does.
    const at = findFirstIndex(atoms, (atom) => atom.end >= block.range[1])
    const atom = atoms[at]
    if (
      atom === undefined ||
      atom.doc !== undefined ||
      atom.writtenIndentation !== undefined ||
      atom.start > block.range[0] ||
      (placement.wholeLine !== true && atom.end !== block.range[1])
    )
      continue
    // An atom that holds several blocks is a kanban node, whose blocks touch,
    // and so none of them is formatted.
    atoms[at] = {
      ...atom,
      doc: [
        printAsWritten(source, atom.start, block.range[0]),
        doc,
        printAsWritten(source, block.range[1], atom.end),
      ],
    }
    changed = true
  }
  return changed ? { ...layout, atoms } : layout
}

/**
 * The offset of the `{` of a JSON table of a use case diagram that spaces or
 * tabs separate from its `@`, or null: the printer puts the `{` right after
 * the `@`, as the other data blocks have their `@{`, and the whitespace
 * between them is not in the Db (docs/usecase.md, JSON tables). A block that
 * holds a directive, or that lies on a kept line, stays as written.
 */
function findJsonTableBrace(
  source: Source,
  block: Node,
  kept: KeptLines,
): number | null {
  if (block.type !== "UsecaseJsonDataBlock") return null
  const text = source.text.slice(...block.range)
  const brace = text.indexOf("{")
  if (
    brace <= "@".length ||
    text.includes("%%{") ||
    holdsKeptLine(source, block.range, kept) ||
    !Array.from(text.slice("@".length, brace)).every(
      (character) => character === " " || character === "\t",
    )
  )
    return null
  return block.range[0] + brace
}

/** Whether a text holds no line break: LF, CR, U+2028 or U+2029. */
function isOneLine(text: string): boolean {
  return (
    !text.includes("\n") &&
    !text.includes("\r") &&
    !text.includes("\u2028") &&
    !text.includes("\u2029")
  )
}

/**
 * The block of one line printed with one space inside each end, `@{ shape:
 * circle }`, and a block of nothing but spaces and tabs, or of nothing, as
 * `@{ }`; undefined where it stays as written. These diagram types read the
 * text inside `@{` and `}` as the lines of a YAML flow mapping
 * (docs/flowchart.md, Data blocks), so the spaces and tabs at its ends carry no
 * meaning. A block is padded only if
 *
 * - it is one of `paddedTypes`;
 * - no `%%{` lies in it: a directive in the block is written as it stands;
 * - it is on no kept line (see `KeptLines`);
 * - its text does not start at the first column with `---`, `...`, or `%`: a
 *   space before `---` or `...` makes a document marker an ordinary string, so
 *   `@{---}` is rejected while `@{ --- }` is accepted; the starts that are no
 *   marker stay as written as well, as in a block of several lines;
 * - it touches no other block: two blocks with nothing between them, or only
 *   directives, are read as one text.
 *
 * Only spaces and tabs are removed at its ends: other whitespace, such as
 * U+00A0, is part of the text.
 */
function padDataBlock(
  source: Source,
  blocks: readonly Node[],
  index: number,
  kept: KeptLines,
): Doc | undefined {
  const block = blocks[index]
  const text = source.text.slice(...block.range)
  const before = blocks[index - 1]
  const after = blocks[index + 1]
  if (
    !paddedTypes.has(block.type) ||
    text.includes("%%{") ||
    startsWithYamlMark(text.slice(2)) ||
    holdsKeptLine(source, block.range, kept) ||
    (before !== undefined &&
      holdsOnlyDirectives(source, before.range[1], block.range[0])) ||
    (after !== undefined &&
      holdsOnlyDirectives(source, block.range[1], after.range[0]))
  )
    return undefined
  let start = 2
  let end = text.length - 1
  while (start < end && (text[start] === " " || text[start] === "\t")) start++
  while (end > start && (text[end - 1] === " " || text[end - 1] === "\t")) end--
  if (start === end) return "@{ }"
  return ["@{ ", text.slice(start, end), " }"]
}

/** Whether nothing but directives lies between two offsets, or nothing. */
function holdsOnlyDirectives(
  source: Source,
  from: number,
  to: number,
): boolean {
  let position = to
  while (position > from) {
    const directive = findDirectiveEndingAt(source, position)
    if (directive === undefined || directive.range[0] < from) return false
    position = directive.range[0]
  }
  return true
}

/** Whether a text starts with a YAML document marker or directive mark. */
function startsWithYamlMark(text: string): boolean {
  return (
    text.startsWith("---") || text.startsWith("...") || text.startsWith("%")
  )
}

/**
 * The block of one line, `@{ a: 1, b: 2 }`, printed as the lines of a block
 * mapping where its line is too long, one entry on each line, one level inside
 * the statement, with the `}` alone on a line at the column of the statement
 * (see `moveDataBlock`); `padded` where it fits or does not split. Prettier
 * chooses: the block stays on its line if the line fits; otherwise it prints
 * on lines if the line of the `{` fits then, and as `padded` if it does not,
 * since the lines would not shorten the line that is too long. mermaid.js
 * reads the text of a block on one line as a YAML flow mapping, and the text of
 * a block of several lines as the lines of a block mapping, which reads the
 * same where each entry is a key and a value that read the same in both (see
 * `splitEntries`) (docs/flowchart.md, Data blocks). A block splits only if
 *
 * - it is one of `splitTypes` and `tabWidth` is not 0, as a block of several
 *   lines moves only then, and the statement is not indented with a tab: the
 *   lines of a block mapping are indented with spaces, since mermaid.js rejects
 *   a tab before them, so under a node indented with tabs they would stand at
 *   a depth that is right for one width of a tab only;
 * - it is the only block of its statement, and the last thing in it, on the
 *   first line of the statement: the text after its `}` would stand after the
 *   `}` on a line of its own, and the statement level is the level of that
 *   first line;
 * - it has at least two entries: with one, the lines would not shorten the
 *   line, and add lines.
 */
function splitDataBlock(
  source: Source,
  block: Node,
  statement: Range,
  placement: DataBlockPlacement,
  padded: Doc,
  alone: boolean,
): Doc | undefined {
  if (
    !splitTypes.has(block.type) ||
    !alone ||
    placement.tabWidth === 0 ||
    placement.statement.includes("\t") ||
    block.range[1] !== statement[1] ||
    source.text.slice(statement[0], block.range[0]).includes("\n")
  )
    return undefined
  const entries = splitEntries(
    source.text.slice(block.range[0] + 2, -1 + block.range[1]),
  )
  if (entries === null) return undefined
  const column = columnsOf(placement.statement, placement.tabWidth)
  const lines: Doc[] = []
  for (const entry of entries)
    lines.push(
      literallineWithoutBreakParent,
      " ".repeat(column + placement.tabWidth),
      entry,
    )
  return conditionalGroup([
    padded,
    ["@{", ...lines, literallineWithoutBreakParent, " ".repeat(column), "}"],
    padded,
  ])
}

/**
 * The entries of the text inside a block of one line, or null where the block
 * does not split. An entry is a key and a value separated by a colon and
 * whitespace, which read the same in a flow mapping, where a `,` ends an entry,
 * and in a block mapping, where a line break does:
 *
 * - the key is a plain or a quoted scalar, and the value a quoted scalar that
 *   ends the entry, or a plain scalar that starts with no indicator of YAML
 *   (`&`, `*`, `!`, `|`, `>`, `%`, `@`, a backquote, `-`, `?` or `:` before
 *   whitespace) and holds no colon before whitespace or at its end;
 * - the text holds no nested `{}` or `[]` and no comment (a `#` after
 *   whitespace or at the start), outside the quotes: a flow collection in a
 *   value, and a comment, read differently over lines, and a value that holds
 *   a nested collection is not a line to read one entry at a time;
 * - an entry without a value, as the `a` of `{a, b}`, or an empty entry,
 *   as after a trailing `,`, is a key without a value in a flow mapping and
 *   no mapping in a block;
 * - at least two entries.
 *
 * An entry is printed as it is written, without the spaces and tabs at its
 * ends; the characters of its key and value stay.
 */
function splitEntries(inside: string): readonly string[] | null {
  const text = trimSpacesAndTabs(inside)
  if (text.includes("%%")) return null
  const entries: string[] = []
  let start = 0
  let quote = ""
  // Whether a quote here would start a quoted scalar: at the start of an entry
  // or after the colon of its key.
  let startsScalar = true
  for (let index = 0; index < text.length; index++) {
    const character = text[index]
    if (quote !== "") {
      if (quote === '"' && character === "\\") index++
      else if (character === quote) {
        if (quote === "'" && text[index + 1] === "'") index++
        else {
          quote = ""
          startsScalar = false
        }
      }
      continue
    }
    if (
      character === "{" ||
      character === "}" ||
      character === "[" ||
      character === "]" ||
      (character === "#" && (index === 0 || isSpaceOrTab(text[index - 1])))
    )
      return null
    if (character === ",") {
      entries.push(text.slice(start, index))
      start = index + 1
      startsScalar = true
    } else if (startsScalar && (character === '"' || character === "'")) {
      quote = character
    } else if (character === ":") {
      startsScalar =
        text[index + 1] === undefined || isSpaceOrTab(text[index + 1])
    } else if (!isSpaceOrTab(character)) {
      startsScalar = false
    }
  }
  if (quote !== "") return null
  entries.push(text.slice(start))
  const trimmed = entries.map(trimSpacesAndTabs)
  return trimmed.length >= 2 && trimmed.every(readsAsEntry) ? trimmed : null
}

/** Whether an entry is a key and a value as `splitEntries` describes. */
function readsAsEntry(entry: string): boolean {
  const key =
    entry.startsWith('"') || entry.startsWith("'")
      ? quotedScalarEnd(entry, 0)
      : plainKeyEnd(entry)
  if (key === -1) return false
  let colon = key
  while (isSpaceOrTab(entry[colon])) colon++
  if (entry[colon] !== ":" || !isSpaceOrTab(entry[colon + 1])) return false
  const value = trimSpacesAndTabs(entry.slice(colon + 1))
  if (value === "") return false
  if (value.startsWith('"') || value.startsWith("'"))
    return quotedScalarEnd(value, 0) === value.length
  return isPlainScalar(value)
}

/**
 * The offset after a quoted scalar that starts at `start`, or -1 where it is
 * not closed. A double-quoted scalar escapes with a backslash, a single-quoted
 * one doubles its quote.
 */
function quotedScalarEnd(text: string, start: number): number {
  const quote = text[start]
  for (let index = start + 1; index < text.length; index++) {
    if (quote === '"' && text[index] === "\\") index++
    else if (text[index] === quote) {
      if (quote === "'" && text[index + 1] === "'") index++
      else return index + 1
    }
  }
  return -1
}

/**
 * The offset of the end of a plain key, before the whitespace and the colon
 * that follow it, or -1 where the entry starts with an indicator or has no
 * colon before whitespace.
 */
function plainKeyEnd(entry: string): number {
  if (startsWithIndicator(entry)) return -1
  for (let index = 0; index < entry.length; index++) {
    if (
      entry[index] === ":" &&
      (entry[index + 1] === undefined || isSpaceOrTab(entry[index + 1]))
    ) {
      let end = index
      while (end > 0 && isSpaceOrTab(entry[end - 1])) end--
      return end === 0 ? -1 : end
    }
  }
  return -1
}

/** Whether a plain scalar value reads the same in a flow mapping and a block. */
function isPlainScalar(value: string): boolean {
  if (startsWithIndicator(value) || value.endsWith(":")) return false
  for (let index = 0; index < value.length; index++)
    if (value[index] === ":" && isSpaceOrTab(value[index + 1])) return false
  return true
}

/** Whether a text starts with a character that YAML gives a meaning. */
function startsWithIndicator(text: string): boolean {
  const [first, second] = [text[0], text[1]]
  return (
    "&*!|>%@`\"'".includes(first) ||
    ("-?:".includes(first) && (second === undefined || isSpaceOrTab(second)))
  )
}

/** The text without the spaces and tabs at its ends. */
function trimSpacesAndTabs(text: string): string {
  let start = 0
  let end = text.length
  while (start < end && isSpaceOrTab(text[start])) start++
  while (end > start && isSpaceOrTab(text[end - 1])) end--
  return text.slice(start, end)
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
  brace: number | null,
): Doc | undefined {
  const text = source.text.slice(...block.range)
  if (
    text.includes("%%{") ||
    source.text.slice(statement[0], block.range[0]).includes("\n") ||
    holdsKeptLine(source, block.range, placement.kept)
  )
    return undefined
  const rows = text.split("\n")
  const opening =
    brace === null ? rows[0] : `@${rows[0].slice(brace - block.range[0])}`
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
      (index) => margins[index] === 0 && startsWithYamlMark(body[index]),
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
