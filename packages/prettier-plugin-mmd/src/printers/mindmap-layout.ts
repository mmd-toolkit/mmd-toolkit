import { appendItems } from "./collections.ts"
import type {
  MindmapClassStatement,
  MindmapDiagram,
  MindmapIconStatement,
  MindmapNode,
  Node,
} from "@mmd-toolkit/parser"
import type { AtomLayout } from "./atoms.ts"
import { keptAsWritten } from "./layout.ts"
import { lineStartOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween, isWhitespace } from "./source.ts"

/**
 * The node types of a mindmap whose text is a value, printed as written: the
 * text of a node, an icon, and a class, and the label of a shape. They have
 * no child fields; `tests/value-nodes.test.ts` checks that every other such
 * node type is left out on purpose.
 */
export const mindmapValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "MindmapLiteral",
  "MindmapLabel",
])

/**
 * A line of a mindmap: a node, or an icon or a class line that decorates the
 * node before it. The tree nests the nodes by their indentation, and a node
 * holds its children; the printer prints the lines one after the other, in
 * source order, each at an indentation of its own.
 */
export type MindmapLine =
  MindmapNode | MindmapIconStatement | MindmapClassStatement

/**
 * The lines of a mindmap in source order: each node, then its icon and class
 * lines, then its children, as the tree holds them.
 */
export function flattenMindmap(diagram: MindmapDiagram): MindmapLine[] {
  const lines: MindmapLine[] = []

  /** Adds a node, its decorations, and the nodes below it. */
  function addNode(node: MindmapNode): void {
    lines.push(node)
    appendItems(lines, node.decorations)
    for (const child of node.children) addNode(child)
  }

  if (diagram.root !== null) addNode(diagram.root)
  return lines
}

/**
 * The indentation of each line beyond the root's, in characters: the
 * indentation of a node minus that of the root, which is the level of the
 * node in the Db, and the indentation of its node for an icon or a class line
 * (docs/mindmap.md, Indentation). The indentation of the root itself is no
 * part of the Db, so only these differences are kept.
 */
export function findIndentationSteps(
  diagram: MindmapDiagram,
): ReadonlyMap<MindmapLine, number> {
  const steps = new Map<MindmapLine, number>()
  const { root } = diagram
  if (root === null) return steps

  /** Adds the steps of a node, its decorations, and the nodes below it. */
  function addNode(node: MindmapNode, rootIndent: number): void {
    const step = node.indent - rootIndent
    steps.set(node, step)
    for (const decoration of node.decorations) steps.set(decoration, step)
    for (const child of node.children) addNode(child, rootIndent)
  }

  addNode(root, root.indent)
  return steps
}

/**
 * Where the printed text of a line ends: at the end of the shape, or of the
 * node text for a node without a shape, and at the end of an icon or a class
 * line. The range of a node reaches the end of the nodes below it.
 */
export function findMindmapPrintedEnd(line: MindmapLine): number {
  if (line.type !== "MindmapNode") return line.range[1]
  return line.shape?.range[1] ?? line.id?.range[1] ?? line.range[1]
}

/**
 * The layout of a line: its text from its start to its printed end, as
 * written. A node text, a shape, an icon, and a class keep the whitespace
 * that mermaid.js reads in them, and a shape, a markdown string, and an icon
 * may go over lines, with the whitespace at the start of the later lines part
 * of the text (docs/mindmap.md, Node text and Multi-line texts).
 */
export function layoutMindmapLine(line: MindmapLine): AtomLayout {
  return keptAsWritten(line.range[0], findMindmapPrintedEnd(line))
}

/**
 * The number of whitespace characters between the first directive and the
 * text of a line that starts with a directive: only whitespace and
 * directives lie before its text on its line. The indentation of a node is
 * all the whitespace before its text in the text without its directives, the
 * whitespace after the directive too (diagrams/mindmap.md, Whitespace and
 * lines), so such a line is printed as written from its first directive, and
 * only the whitespace before the directive is the printer's. Null for any
 * other line.
 */
export function countWhitespaceAfterLeadingDirective(
  source: Source,
  line: MindmapLine,
): number | null {
  const lineStart = lineStartOf(source, line.range[0])
  const trivia = findTriviaBetween(source, lineStart, line.range[0])
  if (trivia.length === 0 || trivia.some((item) => item.type !== "Directive")) {
    return null
  }
  const firstDirective = trivia[0].range[0]
  let count = 0
  let offset = lineStart
  while (offset < line.range[0]) {
    const here = offset
    const directive = trivia.find((item) => item.range[0] === here)
    if (directive !== undefined) {
      offset = directive.range[1]
    } else if (isWhitespace(source.text[offset])) {
      if (offset > firstDirective) count++
      offset++
    } else {
      return null
    }
  }
  return count
}

/** Whether a source is a mindmap, for the checks of the kept lines. */
export function mindmapOf(source: Source): MindmapDiagram {
  const { body } = source.root
  if (body.type !== "MindmapDiagram") {
    throw new Error(
      "prettier-plugin-mmd: a mindmap printer for another diagram",
    )
  }
  return body
}
