import type {
  IshikawaDiagram,
  IshikawaNode,
  Node,
  Range,
} from "@mmd-toolkit/ast"
import type { Atom, AtomLayout } from "./atoms.ts"
import {
  findLeadingDirectives,
  findNodeLineStart,
  isCommentEnd,
} from "./indentation-lines.ts"
import type { LeadingDirectives } from "./indentation-lines.ts"
import { keptAsWritten, replaceInAtoms } from "./layout.ts"
import { collectTextEndEdits, endsWithDirectives } from "./statement-rules.ts"
import type { Source } from "./source.ts"
import {
  findTriviaBetween,
  isSpaceOrTab,
  isWhitespace,
  textRead,
} from "./source.ts"

/** All Ishikawa values are literals, including numbers and apparent strings. */
export const ishikawaValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "IshikawaLiteral",
])

/** A node's own text, with its depth taken directly from AST nesting. */
export interface IshikawaLine {
  readonly range: Range
  readonly depth: number
  /**
   * The whitespace written before the node on its physical line, or null for
   * a root that stands on the line of the header.
   */
  readonly indentation: string | null
  /**
   * The number of whitespace characters before the node on its physical line,
   * also the ones after a directive, which mermaid.js removes first. For a
   * root on the line of the header, the ones between the header and its text.
   */
  readonly column: number
  readonly separatorWidth: 0 | 1
  readonly leading: LeadingDirectives | null
  /** A root-touching directive keeps this line with the header. */
  readonly keepsHeaderGroup: boolean
}

/**
 * Visits the written tree in source order. No source indentation is interpreted
 * again: the AST already records clamping and nearest-smaller parenting
 * (diagrams/ishikawa.md, Indentation and parents; docs/ishikawa.md, Indentation).
 */
export function ishikawaLines(
  source: Source,
  diagram: IshikawaDiagram,
  headerEnd: number,
): IshikawaLine[] {
  const lines: IshikawaLine[] = []

  /** Adds a node's own literal before its children. */
  function add(node: IshikawaNode, depth: number): void {
    const textStart = node.text.range[0]
    const start = Math.max(headerEnd, findNodeLineStart(source, textStart))
    let content = start
    while (content < textStart && isWhitespace(source.text[content])) content++
    const indentation =
      start === headerEnd ? null : source.text.slice(start, content)
    let leading = findLeadingDirectives(source, content, textStart)
    // A root on the line of the header has the whitespace between the header
    // and its text as its indentation.
    const column = [...textRead(source, start, textStart)].filter(
      isWhitespace,
    ).length
    let keepsHeaderGroup = false
    if (start === headerEnd) {
      // A header-attached prefix stays with the header. Once whitespace
      // separates a directive from that prefix, the remaining directives move
      // with a separated root and their gaps count as its indentation (I7/I8).
      // A directive touching the root instead keeps the whole header group
      // (diagrams/ishikawa.md, Directives; docs/ishikawa.md, Standalone directives).
      const directives = leading.directives
      keepsHeaderGroup = directives.at(-1)?.[1] === textStart
      content = textStart
      if (!keepsHeaderGroup) {
        let previousEnd = headerEnd
        for (const range of directives) {
          if (range[0] > previousEnd) {
            content = range[0]
            break
          }
          previousEnd = range[1]
        }
      }
      leading = findLeadingDirectives(source, content, textStart)
    }
    lines.push({
      range: [content, node.text.range[1]],
      depth,
      indentation,
      column,
      separatorWidth: isCommentEnd(source, start) ? 1 : 0,
      leading: leading.directives.length === 0 ? null : leading,
      keepsHeaderGroup,
    })
    for (const child of node.children) add(child, depth + 1)
  }

  if (diagram.root !== null) add(diagram.root, 1)
  return lines
}

/**
 * Literals retain embedded regions and every physical continuation column. The
 * spaces and tabs at the end of a literal are left out: mermaid.js trims the
 * literal, so the Db and the figure are the same without them
 * (docs/ishikawa.md, Trailing whitespace).
 */
export function layoutIshikawaLine(
  source: Source,
  line: IshikawaLine,
): AtomLayout {
  const start = line.leading?.textStart ?? line.range[0]
  let end = line.range[1]
  const atoms: Atom[] = []
  if (endsWithDirectives(source, [start, end])) {
    // The literal ends with directives, which are printed as at the end of a
    // line, with the whitespace before them as the same literal has when the
    // directives stand after it: one space each (docs/ishikawa.md, Trailing
    // whitespace).
    atoms.push({ start, end })
    replaceInAtoms(source, atoms, collectTextEndEdits(source, start, end, true))
  } else {
    // The gap before a directive that follows the literal is that of the
    // directive, so the literal keeps its end there.
    const directiveFollows = findTriviaBetween(source, end, end + 1).some(
      (item) => item.type === "Directive" && item.range[0] === end,
    )
    if (!directiveFollows) {
      while (end > start + 1 && isSpaceOrTab(source.text[end - 1])) end--
    }
    atoms.push({ start, end })
  }
  return { ...keptAsWritten(start, end), atoms }
}

/**
 * Whether the whitespace written before the nodes shows the tree by nesting
 * alone: each node is deeper than the nearest node before it that is less
 * deep, and so on up to the root, with a root on the line of the header
 * standing before any column. A version that counts reads a node that is not
 * deeper than the node before it, or deeper by less than the nodes in
 * between, as other than the specification does (a node that clamps to the
 * root, or a root deeper than its causes), so the printer keeps the written
 * indentation then (docs/ishikawa.md, Indentation; docs/compatibility.md,
 * Forms kept for versions of mermaid.js that count). A node that follows a
 * comment-ending separator on its line is left to the ordinary rules: the
 * separator is a whitespace character in the count of one reading and not in
 * the other. A root that follows one leaves the whole diagram to them, because
 * no version that counts draws such a diagram.
 */
export function indentationShowsTree(lines: readonly IshikawaLine[]): boolean {
  // Every version that counts rejects a root that follows a comment-ending
  // separator, so the indentation of such a diagram decides no drawing.
  if (lines.some((line) => line.depth === 1 && line.separatorWidth !== 0))
    return true
  const columns: number[] = []
  for (const line of lines) {
    const { column } = line
    while (columns.length > 0 && columns[columns.length - 1] >= column) {
      columns.pop()
    }
    if (line.separatorWidth !== 0) {
      // Left to the ordinary rules: it stands at its depth for the lines
      // after it, and decides nothing about the lines before it.
      columns.length = Math.min(columns.length, line.depth - 1)
      while (columns.length < line.depth - 1) columns.push(columns.at(-1) ?? -1)
    } else if (columns.length + 1 !== line.depth) return false
    columns.push(column)
  }
  return true
}
