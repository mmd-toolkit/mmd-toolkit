import type { FlowchartShape } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The text of the label of `shape` that the rule compares: the text as written
 * without the whitespace at its ends, which mermaid.js removes (`addVertex`),
 * so `A["x"]` and `A["x "]` write the same label. Nothing else is changed: two
 * labels that differ only in their line breaks or in the quotes of an HTML
 * attribute are different here, although mermaid.js keeps them the same. The
 * value of the tree keeps the whitespace at the ends, as written.
 */
function labelText(shape: FlowchartShape): string {
  return shape.label.value.trim()
}

/**
 * The rule `flowchart-no-redefined-vertex`, described in
 * `docs/rules/flowchart-no-redefined-vertex.md`: a vertex written with a shape
 * whose name or label differs from the shape that the same id was last
 * written with. A vertex written without a shape keeps the shape, and is not
 * compared. A shape or a label set by a data block is not compared either:
 * the tree does not read data blocks. Nor is the property of a shape, which
 * changes nothing in how mermaid.js draws it.
 */
export const flowchartNoRedefinedVertex: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow writing the shape or the label of a vertex again, differently.",
      recommended: true,
      url: ruleDocsUrl("flowchart-no-redefined-vertex"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the shape and the label of `{{id}}` written on line {{line}} with these.",
    },
  },
  create(context) {
    /** The shape that each id was last written with. */
    const shapes = new Map<string, FlowchartShape>()
    return {
      FlowchartVertex(node) {
        if (node.shape === null) return
        const previous = shapes.get(node.id.name)
        if (
          previous !== undefined &&
          (previous.name !== node.shape.name ||
            labelText(previous) !== labelText(node.shape))
        ) {
          context.report({
            node: node.shape,
            messageId: "redefined",
            data: {
              id: node.id.name,
              line: String(previous.loc.start.line),
            },
          })
        }
        shapes.set(node.id.name, node.shape)
      },
    }
  },
}
