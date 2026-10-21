import type {
  KanbanClassStatement,
  KanbanDiagram,
  KanbanIconStatement,
  KanbanNode,
  Node,
  Range,
} from "@mmd-toolkit/parser"
import type { AtomLayout } from "./atoms.ts"
import { keptAsWritten } from "./layout.ts"
import { lineEndOf, lineStartOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween, isCommentLine, isWhitespace } from "./source.ts"

/** The leaves printed as written (docs/kanban.md, Labels and Data blocks). */
export const kanbanValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "KanbanLiteral",
  "KanbanLabel",
  "KanbanDataBlock",
])

/**
 * A node or decoration, with the extent of its printed line and what decides
 * its indentation (docs/kanban.md, Indentation).
 */
export interface LeadingDirectives {
  /** The directives before the text, in source order; may be none. */
  readonly directives: readonly Range[]
  /** The number of whitespace characters after each directive. */
  readonly gaps: readonly number[]
  /** Where the text of the node or decoration starts. */
  readonly textStart: number
}

export interface KanbanLine {
  readonly range: Range
  /**
   * The step of its indentation: 1 for a section, 2 for an item, and that of
   * its node for an icon or a class line.
   */
  readonly depth: 1 | 2
  /**
   * The number of characters of its indentation that the gap before it
   * prints as written: 1 for the U+2028 or U+2029 that ends a diagram comment
   * on the line before, which counts as indentation, and 0 otherwise.
   */
  readonly separatorWidth: 0 | 1
  /**
   * For an inline-directive line, the directives that stand before its text
   * and the whitespace after each of them, which is indentation too; null for
   * any other line.
   */
  readonly leading: LeadingDirectives | null
}

/**
 * The offsets of the U+2028 and U+2029 that end a diagram comment. Such a
 * separator is a node-line boundary even without a line feed
 * (diagrams/kanban.md, Comments). Joined comment fragments are already one
 * trivia item, so their internal separators cannot split a line.
 */
export function findCommentEnds(source: Source): number[] {
  return source.trivia
    .filter(
      (item) =>
        item.type === "Comment" &&
        (source.text[item.range[1]] === "\u2028" ||
          source.text[item.range[1]] === "\u2029"),
    )
    .map((item) => item.range[1])
}

/**
 * Flattens the source list and its decorations without inferring an item tree
 * (ast/kanban.md, KanbanDiagram; docs/kanban.md, Nodes one per line). Node
 * ranges include decorations, so their printed ends use the last data block,
 * shape, or id instead. A node is a section when it stands at the
 * indentation of the first node and an item otherwise, as in the Db; a
 * decoration stands where its node does.
 */
export function kanbanLines(
  source: Source,
  diagram: KanbanDiagram,
  headerEnd: number,
): KanbanLine[] {
  const commentEnds = findCommentEnds(source)
  const sectionIndent = diagram.body[0]?.indent
  const lines: KanbanLine[] = []
  for (const node of diagram.body) {
    const depth = node.indent === sectionIndent ? 1 : 2
    lines.push(lineOf(node, depth))
    for (const decoration of node.decorations) {
      lines.push(lineOf(decoration, depth))
    }
  }
  return lines

  /**
   * Keeps an inline-directive line whole, from its first directive or node
   * through its end. On the header line, only the post-header suffix moves
   * (docs/kanban.md, Header and Directives).
   */
  function lineOf(
    node: KanbanNode | KanbanIconStatement | KanbanClassStatement,
    depth: 1 | 2,
  ): KanbanLine {
    const end =
      node.type === "KanbanNode"
        ? (node.data.at(-1) ?? node.shape ?? node.id ?? node).range[1]
        : node.range[1]
    const start = Math.max(
      headerEnd,
      lineStartOf(source, node.range[0]),
      ...commentEnds.filter((offset) => offset <= node.range[0]),
    )
    const separatorWidth = commentEnds.includes(start) ? 1 : 0
    const lineEnd = Math.min(
      lineEndOf(source, end),
      ...commentEnds.filter((offset) => offset >= end),
    )
    const directives = findTriviaBetween(source, start, lineEnd).filter(
      (item) => item.type === "Directive",
    )
    if (directives.length === 0) {
      return {
        range: [node.range[0], end],
        depth,
        separatorWidth,
        leading: null,
      }
    }
    let content = start
    while (content < node.range[0] && isWhitespace(source.text[content]))
      content++
    return {
      range: [content, lineEnd],
      depth,
      separatorWidth,
      leading: findLeadingDirectives(source, content, node.range[0]),
    }
  }
}

/**
 * The directives that stand before the text of a line, which starts at
 * `textStart`, and the whitespace after each of them. The text of a node is
 * read without its directives, so all the whitespace before it is its
 * indentation, whatever lies between (diagrams/kanban.md, Directives inside
 * units).
 */
function findLeadingDirectives(
  source: Source,
  from: number,
  textStart: number,
): LeadingDirectives {
  const directives = findTriviaBetween(source, from, textStart)
    .filter((item) => item.type === "Directive")
    .map((item) => item.range)
  const gaps = directives.map((range, index) => {
    const next = directives[index + 1]?.[0] ?? textStart
    return source.text.slice(range[1], next).length
  })
  return { directives, gaps, textStart }
}

/** Every character inside a node, decoration, or opaque suffix is retained. */
export function layoutKanbanLine(line: KanbanLine): AtomLayout {
  return keptAsWritten(line.leading?.textStart ?? line.range[0], line.range[1])
}

/**
 * Protects complete gaps with blank/comment runs after a diagram comment, or
 * its Unicode ending (diagrams/kanban.md, Comments; docs/kanban.md, Blank
 * lines and Whitespace characters). Common comment lines alone use ordinary
 * alignment. No value or data text is scanned here: bounds delimit a gap.
 * Returns where the text that is kept as written stops: before the
 * indentation of the statement that follows, which the printer decides, after
 * the U+2028 or U+2029 that ends a diagram comment when that is the last
 * thing before it; or the end of the gap at the end of the board. Undefined
 * for a gap that is formatted as usual.
 */
export function findKeptGapEnd(
  source: Source,
  start: number,
  end: number,
  beforeStatement: boolean,
): number | undefined {
  if (!holdsKeptGap(source, start, end)) return undefined
  if (!beforeStatement) return end
  let offset = end
  while (offset > start && isWhitespace(source.text[offset - 1])) {
    const character = source.text[offset - 1]
    if (character === "\n" || endsDiagramComment(source, offset - 1)) break
    offset--
  }
  return offset
}

/** Whether the U+2028 or U+2029 at `offset` ends a diagram comment. */
function endsDiagramComment(source: Source, offset: number): boolean {
  return (
    (source.text[offset] === "\u2028" || source.text[offset] === "\u2029") &&
    source.root.comments.some((comment) => comment.range[1] === offset)
  )
}

/** Whether the gap holds a diagram comment that makes it a kept gap. */
function holdsKeptGap(source: Source, start: number, end: number): boolean {
  const comments = source.root.comments.filter(
    (comment) => start <= comment.range[1] && comment.range[1] <= end,
  )
  for (const comment of comments) {
    const boundary =
      Math.max(
        source.text.lastIndexOf("\n", comment.range[0] - 1),
        source.text.lastIndexOf("\u2028", comment.range[0] - 1),
        source.text.lastIndexOf("\u2029", comment.range[0] - 1),
      ) + 1
    const directives = findTriviaBetween(
      source,
      boundary,
      comment.range[0],
    ).filter((item) => item.type === "Directive")
    let position = boundary
    while (position < comment.range[0]) {
      const here = position
      const directive = directives.find((item) => item.range[0] === here)
      if (directive !== undefined) position = directive.range[1]
      else if (isWhitespace(source.text[position])) position++
      else break
    }
    if (
      isCommentLine(source.text, source.root, comment) &&
      position === comment.range[0]
    )
      continue
    const after = source.text.slice(comment.range[1], end)
    if (after.includes("\u2028") || after.includes("\u2029")) return true
    if (comments.some((next) => next.range[0] >= comment.range[1])) return true
    const lines = after.split("\n")
    if (lines.slice(1, -1).some((line) => line.trim() === "")) return true
  }
  return false
}
