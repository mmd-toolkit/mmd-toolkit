import type {
  KanbanClassStatement,
  KanbanIconStatement,
  KanbanNode,
  Node,
  Range,
} from "@mmd-toolkit/ast"
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
import { keptWithDirectiveEnd } from "./statement-rules.ts"
import { printAsWritten } from "./lines.ts"
import {
  isPlainLine,
  printPaddedLiteral,
  printShapeWithoutPadding,
  trimBlanksEnd,
  withoutIgnoredSemicolonsEnd,
} from "./padded-text.ts"
import type { Source } from "./source.ts"
import {
  findFirstIndex,
  findTokenStartingAt,
  findTriviaBetween,
  isSpaceOrTab,
  isWhitespace,
  textRead,
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
  /** The node, icon line, or class line that the line prints. */
  readonly node: KanbanNode | KanbanIconStatement | KanbanClassStatement
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
  /**
   * For a class line with no directive on it, the text after its `:::`; null
   * for any other line, a class line with a directive included, which is
   * printed as written.
   */
  readonly cssClass: Node | null
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
        node,
        range: [node.range[0], end],
        depth,
        separatorWidth,
        leading: null,
        cssClass: node.type === "KanbanClassStatement" ? node.cssClass : null,
      }
    }
    let content = textStart
    while (content < node.range[0] && isWhitespace(source.text[content]))
      content++
    return {
      node,
      range: [content, lineEnd],
      depth,
      separatorWidth,
      leading: findLeadingDirectives(source, content, node.range[0]),
      cssClass: null,
    }
  }
}

/**
 * Every character inside a node, decoration, or opaque suffix is retained,
 * except the spaces and tabs at the ends of the text of a class line with no
 * directive, between the `:::` and the first other character of its class and
 * after the last: the class text is only a class name for the rendering, so
 * ` hot ` and `hot` name the same class (docs/kanban.md, Icons and classes). A
 * class of only whitespace is printed as one space. The spaces and tabs at the
 * ends of the text of a card, of the text of its shape, and of an icon go too
 * (see `printKanbanText`).
 */
export function layoutKanbanLine(source: Source, line: KanbanLine): AtomLayout {
  const start = line.leading?.textStart ?? line.range[0]
  const { cssClass } = line
  if (cssClass === null) {
    const printed = printKanbanText(source, line)
    if (printed === undefined) {
      // The id of a column is read with the whitespace at its end, which the
      // figure depends on (see `printKanbanText`), so only a card prints the
      // end of its text.
      return line.depth === 2
        ? keptWithDirectiveEnd(source, start, line.range[1])
        : keptAsWritten(start, line.range[1])
    }
    return {
      atoms: [{ start, end: line.range[1], doc: printed }],
      rules: new Map(),
      outdented: new Set(),
      lineBreaks: "kept",
    }
  }
  let [textStart, textEnd] = cssClass.range
  while (textStart < textEnd && isSpaceOrTab(source.text[textStart]))
    textStart++
  while (textEnd > textStart && isSpaceOrTab(source.text[textEnd - 1]))
    textEnd--
  if (textStart === cssClass.range[0] && textEnd === cssClass.range[1]) {
    return keptWithDirectiveEnd(source, start, line.range[1])
  }
  if (textStart === textEnd) {
    // A class of spaces and tabs only is printed as one space: the grammar
    // rejects an empty class (docs/kanban.md, Icons and classes).
    return source.text.slice(...cssClass.range) === " "
      ? keptAsWritten(start, line.range[1])
      : {
          atoms: [{ start, end: line.range[1], doc: [":::", " "] }],
          rules: new Map(),
          outdented: new Set(),
          lineBreaks: "kept",
        }
  }
  return {
    atoms: [
      {
        start,
        end: line.range[1],
        doc: [":::", printAsWritten(source, textStart, textEnd)],
      },
    ],
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * The text of a line of a card, a column, or an icon without the spaces and
 * tabs at the ends of its texts, which mermaid.js keeps in the Db and draws
 * without (docs/compatibility.md, Mindmap texts that are drawn the same);
 * undefined where the line stays as written: a line that starts with a
 * directive, one over lines or with a comment or a directive in it or after it,
 * a node with a data block, and the texts that `printShapeWithoutPadding` and
 * `printPaddedLiteral` leave. The text of a column before its shape stays as
 * written, with the space before the shape: mermaid.js tells two columns apart
 * by it, so `todo [A]` and `todo[B]` are two columns, and not once the space is
 * gone.
 */
function printKanbanText(source: Source, line: KanbanLine): string | undefined {
  const { node } = line
  if (line.leading !== null || !isPlainLine(source, ...line.range))
    return undefined
  if (node.type === "KanbanIconStatement")
    return printPaddedLiteral(source, node.range, node.icon.range)
  if (node.type === "KanbanClassStatement" || node.data.length > 0)
    return undefined
  const { id, shape } = node
  const written = id === null ? "" : source.text.slice(...id.range)
  const head = line.depth === 2 ? trimBlanksEnd(written) : written
  if (shape === null) {
    return line.depth === 2 && head !== "" ? head : undefined
  }
  // A `;` that the line rule ignores between the text and the shape is removed
  // by mermaid.js, with the whitespace around it.
  const text = id === null ? "" : withoutIgnoredSemicolonsEnd(source, id.range)
  return (
    (line.depth === 2 ? trimBlanksEnd(text) : text) +
    printShapeWithoutPadding(source, shape)
  )
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

/** Whether the gap holds a diagram comment that makes it a kept gap. */
function holdsKeptGap(source: Source, start: number, end: number): boolean {
  // A kept stretch may already have printed the comment's final selected
  // semicolon. Its separator still belongs to this gap (docs/kanban.md,
  // Blank lines and Whitespace characters).
  if (isCommentEnd(source, start)) return true
  const all = source.root.comments
  const comments = all
    .slice(
      findFirstIndex(all, (comment) => comment.range[1] >= start),
      findFirstIndex(all, (comment) => comment.range[1] > end),
    )
    .filter((comment) => textRead(source, ...comment.range) !== "")
  for (const comment of comments) {
    const after = textRead(source, comment.range[1], end)
    if (after.includes("\u2028") || after.includes("\u2029")) return true
    if (comments.some((next) => next.range[0] >= comment.range[1])) return true
    const lines = after.split("\n")
    if (lines.slice(1, -1).some((line) => line.trim() === "")) return true
  }
  return false
}
