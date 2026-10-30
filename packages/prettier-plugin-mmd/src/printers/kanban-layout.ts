import type {
  KanbanClassStatement,
  KanbanIconStatement,
  KanbanNode,
  Node,
  Range,
} from "@mmd-toolkit/parser"
import {
  findLeadingDirectives,
  findNodeLineEnd,
  findNodeLineStart,
  findNodeLineTextStart,
  isCommentEnd,
} from "./indentation-lines.ts"
import type { LeadingDirectives } from "./indentation-lines.ts"
import type { AtomLayout } from "./atoms.ts"
import { expectToken, keptAsWritten } from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findFirstIndex,
  findTokenStartingAt,
  findTriviaBetween,
  isCommentLine,
  isWhitespace,
} from "./source.ts"

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
   * on its line, after any comment region that mermaid.js removes before it
   * (see `findNodeLineTextStart`), and the whitespace after each of them,
   * which is indentation too; null for any other line.
   */
  readonly leading: LeadingDirectives | null
}

/** The lines of each board, found once per source. */
const linesBySource = new WeakMap<Source, readonly KanbanLine[]>()

/**
 * Reads columns from body and cards from children, preserving decorations in
 * source order (ast/kanban.md, KanbanDiagram; docs/kanban.md, Nodes one per
 * line). Node ranges include descendants and decorations, so printed ends use
 * the last data block, shape, or id instead. A decoration uses its node's depth.
 */
export function kanbanLines(source: Source): readonly KanbanLine[] {
  const cached = linesBySource.get(source)
  if (cached !== undefined) return cached
  const { body: diagram } = source.root
  if (diagram.type !== "KanbanDiagram") {
    throw new Error("prettier-plugin-mmd: a kanban printer for another diagram")
  }
  const headerEnd = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the header keyword",
  ).range[1]
  const lines: KanbanLine[] = []
  for (const node of diagram.body) {
    addNode(node, 1)
    for (const card of node.children) addNode(card, 2)
  }
  linesBySource.set(source, lines)
  return lines

  /** A node's decorations precede its cards and retain the node's role. */
  function addNode(node: KanbanNode, depth: 1 | 2): void {
    lines.push(lineOf(node, depth))
    for (const decoration of node.decorations)
      lines.push(lineOf(decoration, depth))
  }

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
    const start = Math.max(headerEnd, findNodeLineStart(source, node.range[0]))
    const separatorWidth = isCommentEnd(source, start) ? 1 : 0
    const lineEnd = findNodeLineEnd(source, end)
    const textStart = findNodeLineTextStart(source, node.range[0])
    const directives = findTriviaBetween(source, textStart, lineEnd).filter(
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
    let content = textStart
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
    if (character === "\n" || isCommentEnd(source, offset - 1)) break
    offset--
  }
  return offset
}

/** Whether a character is a line feed, a U+2028, or a U+2029. */
function isLineBreak(character: string): boolean {
  return character === "\n" || character === "\u2028" || character === "\u2029"
}

/** Whether the gap holds a diagram comment that makes it a kept gap. */
function holdsKeptGap(source: Source, start: number, end: number): boolean {
  // A kept stretch may already have printed the comment's final selected
  // semicolon. Its separator still belongs to this gap (docs/kanban.md,
  // Blank lines and Whitespace characters).
  if (isCommentEnd(source, start)) return true
  const all = source.root.comments
  const comments = all.slice(
    findFirstIndex(all, (comment) => comment.range[1] >= start),
    findFirstIndex(all, (comment) => comment.range[1] > end),
  )
  for (const comment of comments) {
    // Looking back for the line break one character at a time stays on the
    // line of the comment, where a search for each of the three characters
    // would run to the start of the text for one that is not there.
    let boundary = comment.range[0]
    while (boundary > 0 && !isLineBreak(source.text[boundary - 1])) boundary--
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
