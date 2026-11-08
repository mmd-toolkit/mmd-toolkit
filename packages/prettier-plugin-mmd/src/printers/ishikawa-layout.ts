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
import { collapseRunEdits } from "./text-runs.ts"
import type { Source } from "./source.ts"
import {
  findDirectiveEndingAt,
  findTriviaBetween,
  isSpaceOrTab,
  isWhitespace,
} from "./source.ts"

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

  /** Adds a node's own literal before its children. */
  function add(node: IshikawaNode, depth: number): void {
    const textStart = node.text.range[0]
    const start = Math.max(headerEnd, findNodeLineStart(source, textStart))
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
  // The gap before a directive that follows the literal is that of the
  // directive, so the literal keeps its end there.
  const directiveFollows = findTriviaBetween(source, end, end + 1).some(
    (item) => item.type === "Directive" && item.range[0] === end,
  )
  if (!directiveFollows) {
    while (end > start + 1 && isSpaceOrTab(source.text[end - 1])) end--
  }
  const atoms: Atom[] = [{ start, end }]
  // Where the literal ends with a directive, as it does when blanks followed
  // it, its runs, the blanks before the directive among them, are those that
  // the same literal has when the directive stands after it: one space each
  // (docs/ishikawa.md, Trailing whitespace).
  const directive = findDirectiveEndingAt(source, end)
  if (directive !== undefined && directive.range[0] > start) {
    replaceInAtoms(
      source,
      atoms,
      collapseRunEdits(source, start, directive.range[0]),
    )
  }
  return { ...keptAsWritten(start, end), atoms }
}
