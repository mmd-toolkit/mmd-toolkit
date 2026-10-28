import type {
  IshikawaDiagram,
  IshikawaNode,
  Node,
  Range,
} from "@mmd-toolkit/parser"
import type { AtomLayout } from "./atoms.ts"
import { maxOf } from "./collections.ts"
import { findCommentEnds, findLeadingDirectives } from "./indentation-lines.ts"
import type { LeadingDirectives } from "./indentation-lines.ts"
import { lineStartOf } from "./kept-lines.ts"
import { keptAsWritten } from "./layout.ts"
import type { Source } from "./source.ts"
import { isWhitespace } from "./source.ts"

/** All Ishikawa values are literals, including numbers and apparent strings. */
export const ishikawaValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "IshikawaLiteral",
])

/** A node's own text, with its depth taken directly from AST nesting. */
export interface IshikawaLine {
  readonly range: Range
  readonly depth: number
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
  const commentEnds = findCommentEnds(source)

  /** Adds a node's own literal before its children. */
  function add(node: IshikawaNode, depth: number): void {
    const textStart = node.text.range[0]
    const start = Math.max(
      headerEnd,
      lineStartOf(source, textStart),
      maxOf(commentEnds.filter((end) => end <= textStart)),
    )
    let content = start
    while (content < textStart && isWhitespace(source.text[content])) content++
    let leading = findLeadingDirectives(source, content, textStart)
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
      separatorWidth: commentEnds.includes(start) ? 1 : 0,
      leading: leading.directives.length === 0 ? null : leading,
      keepsHeaderGroup,
    })
    for (const child of node.children) add(child, depth + 1)
  }

  if (diagram.root !== null) add(diagram.root, 1)
  return lines
}

/** Literals retain embedded regions and every physical continuation column. */
export function layoutIshikawaLine(line: IshikawaLine): AtomLayout {
  return keptAsWritten(line.leading?.textStart ?? line.range[0], line.range[1])
}
