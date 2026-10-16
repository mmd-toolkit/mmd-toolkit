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

/** A node or decoration, with the extent and indentation of its printed line. */
export interface KanbanLine {
  readonly range: Range
  readonly indent: number
  /** The original prefix on an inline-directive line; otherwise undefined. */
  readonly writtenIndentation: string | undefined
}

/**
 * Flattens the source list and its decorations without inferring an item tree
 * (ast/kanban.md, KanbanDiagram; docs/kanban.md, Nodes one per line). Node
 * ranges include decorations, so their printed ends use the last data block,
 * shape, or id instead. Decorations stand at their node's absolute column.
 */
export function kanbanLines(
  source: Source,
  diagram: KanbanDiagram,
  headerEnd: number,
): KanbanLine[] {
  // A diagram-comment ending is a node-line boundary even without LF
  // (diagrams/kanban.md, Comments). Joined comment fragments are already
  // one trivia item, so their internal separators cannot split a line.
  const commentEnds = source.trivia
    .filter(
      (item) =>
        item.type === "Comment" &&
        (source.text[item.range[1]] === "\u2028" ||
          source.text[item.range[1]] === "\u2029"),
    )
    .map((item) => item.range[1])
  const lines: KanbanLine[] = []
  for (const node of diagram.body) {
    lines.push(lineOf(node, node.indent))
    for (const decoration of node.decorations) {
      lines.push(lineOf(decoration, node.indent))
    }
  }
  return lines

  /**
   * Keeps an inline-directive line whole, from its first directive or node
   * through its end, with the original prefix. On the header line, only the
   * post-header suffix moves (docs/kanban.md, Header and Directives).
   */
  function lineOf(
    node: KanbanNode | KanbanIconStatement | KanbanClassStatement,
    indent: number,
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
        indent,
        writtenIndentation: undefined,
      }
    }
    let content = start
    while (content < node.range[0] && isWhitespace(source.text[content]))
      content++
    return {
      range: [content, lineEnd],
      indent,
      writtenIndentation: source.text.slice(start, content),
    }
  }
}

/** Every character inside a node, decoration, or opaque suffix is retained. */
export function layoutKanbanLine(line: KanbanLine): AtomLayout {
  return keptAsWritten(line.range[0], line.range[1])
}

/**
 * Protects complete gaps with blank/comment runs after a diagram comment, or
 * its Unicode ending (diagrams/kanban.md, Comments; docs/kanban.md, Blank
 * lines and Whitespace characters). Common comment lines alone use ordinary
 * alignment. No value or data text is scanned here: bounds delimit a gap.
 */
export function keepsKanbanGap(
  source: Source,
  start: number,
  end: number,
): boolean {
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
