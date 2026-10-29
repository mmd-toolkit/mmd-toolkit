import type { FlowchartLink, FlowchartShape } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"
import { flowchartLabelText } from "../utils/flowchart-labels.ts"
import { flowchartLinkIdsOf } from "../utils/flowchart-links.ts"

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
        "mermaid.js replaces the shape and the label of `{{id}}` written earlier with these.",
    },
  },
  create(context) {
    /** The shape that each id was last written with. */
    const shapes = new Map<string, FlowchartShape>()
    const linkIds = new Set<string>()
    let links: ReadonlyMap<FlowchartLink, readonly string[]> = new Map()
    return {
      FlowchartDiagram(node) {
        links = flowchartLinkIdsOf(node)
      },
      FlowchartVertex(node) {
        if (node.shape === null) return
        if (linkIds.has(normalizeLineTerminators(node.id.name))) return
        const previous = shapes.get(node.id.name)
        if (
          previous !== undefined &&
          (previous.name !== node.shape.name ||
            flowchartLabelText(previous.label) !==
              flowchartLabelText(node.shape.label))
        ) {
          context.report({
            node: node.shape,
            messageId: "redefined",
            data: {
              id: node.id.name,
            },
          })
        }
        shapes.set(node.id.name, node.shape)
      },
      "FlowchartLink:exit"(node) {
        for (const id of links.get(node) ?? []) linkIds.add(id)
      },
    }
  },
}
