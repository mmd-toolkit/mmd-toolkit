import type {
  FlowchartDataBlock,
  FlowchartIgnoredText,
  FlowchartLabel,
  FlowchartLiteral,
  Identifier,
  Node,
  StringLiteral,
} from "@mmd-toolkit/parser"

/**
 * The node types whose text can hold a line of only `%%`: the nodes that show
 * the text of a label, a name, a string, a description, a title, a data block,
 * or text that mermaid.js does not read (ast.md and ast/flowchart.md). The
 * text is the `name` of an Identifier and the `value` of the others. The arrow
 * nodes have a text `value` too, but no line break;
 * `tests/text-nodes.test.ts` ties both lists to the specification.
 */
export const TEXT_NODE_TYPES: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "FlowchartLabel",
  "FlowchartLiteral",
  "FlowchartDataBlock",
  "FlowchartIgnoredText",
])

/** A node of one of the `TEXT_NODE_TYPES`. */
export type TextNode =
  | Identifier
  | StringLiteral
  | FlowchartLabel
  | FlowchartLiteral
  | FlowchartDataBlock
  | FlowchartIgnoredText

/** The text of `node`. */
export function textOf(node: TextNode): string {
  return node.type === "Identifier" ? node.name : node.value
}

/** Whether `node` is a `TextNode`. */
export function isTextNode(node: Node): node is TextNode {
  return TEXT_NODE_TYPES.has(node.type)
}
