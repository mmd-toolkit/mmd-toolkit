import type {
  FlowchartLink,
  FlowchartShape,
  FlowchartSubgraphStatement,
} from "@mmd-toolkit/ast"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"
import { flowchartLabelText } from "../utils/flowchart-labels.ts"
import { flowchartLinkIdsOf } from "../utils/flowchart-links.ts"
import { flowchartLostMembers } from "../utils/subgraph-ids.ts"

/** The name and value of the property of a rectangle, or an empty text. */
function propertyOf(shape: FlowchartShape): string {
  return shape.property === null
    ? ""
    : `${shape.property.name.name}:${shape.property.value.name}`
}

/**
 * Whether `shape` says nothing new about the vertex besides its name and label
 * text: both labels are markdown or neither is, and the property is the same.
 * A label in quotes and a label without them (the kinds `string` and `text`)
 * draw alike, so they are the same here; a markdown label draws differently.
 */
function sameForm(previous: FlowchartShape, shape: FlowchartShape): boolean {
  return (
    (previous.label.kind === "markdown") ===
      (shape.label.kind === "markdown") &&
    propertyOf(previous) === propertyOf(shape)
  )
}

/**
 * The rule `flowchart-no-redefined-vertex`, described in
 * `docs/rules/flowchart-no-redefined-vertex.md`: a vertex written with a shape
 * whose name or label differs from the shape that the same id was last
 * written with. A vertex written without a shape keeps the shape, and is not
 * compared. A shape or a label set by a data block is not compared either:
 * the tree does not read data blocks. Nor is the property of a shape, which
 * changes nothing in how mermaid.js draws it.
 *
 * The rule also reports a vertex written in a subgraph that does not get it,
 * because a subgraph that ended before has it (`flowchartLostMembers`), when
 * the vertex was written before and this occurrence has no link, class, or data
 * block and writes only the id, or the shape that the vertex has: the label and
 * the property of the shape the same, and both labels markdown or neither
 * (`sameForm`).
 */
export const flowchartNoRedefinedVertex: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined" | "dropped"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow writing a vertex again, differently or in a subgraph that does not get it.",
      recommended: true,
      url: ruleDocsUrl("flowchart-no-redefined-vertex"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the shape and the label of `{{id}}` written earlier with these.",
      dropped:
        "mermaid.js keeps `{{id}}` in an earlier subgraph, so this subgraph does not get it.",
    },
  },
  create(context) {
    /** The shape that each id was last written with. */
    const shapes = new Map<string, FlowchartShape>()
    const linkIds = new Set<string>()
    let links: ReadonlyMap<FlowchartLink, readonly string[]> = new Map()
    let lostMembers: ReadonlyMap<
      FlowchartSubgraphStatement,
      ReadonlySet<string>
    > = new Map()
    /** The ids of the vertices written so far. */
    const written = new Set<string>()
    /** Whether the statement being visited has a link. */
    let linked = false
    /** The ids that the subgraph of the statement being visited does not get. */
    let lostHere: ReadonlySet<string> = new Set()
    return {
      FlowchartDiagram(node) {
        links = flowchartLinkIdsOf(node)
        lostMembers = flowchartLostMembers(context.sourceCode)
      },
      FlowchartVertexStatement(node, parent) {
        linked = node.links.length > 0
        lostHere =
          (parent?.type === "FlowchartSubgraphStatement"
            ? lostMembers.get(parent)
            : undefined) ?? new Set()
      },
      FlowchartVertex(node) {
        const id = node.id.name
        if (linkIds.has(normalizeLineTerminators(id))) return
        const previous = shapes.get(id)
        const { shape } = node
        if (shape !== null) shapes.set(id, shape)
        if (
          shape !== null &&
          previous !== undefined &&
          (previous.name !== shape.name ||
            flowchartLabelText(previous.label) !==
              flowchartLabelText(shape.label))
        ) {
          context.report({
            node: shape,
            messageId: "redefined",
            data: {
              id,
            },
          })
        } else if (
          lostHere.has(id) &&
          written.has(id) &&
          !linked &&
          node.cssClass === null &&
          node.data.length === 0 &&
          (shape === null ||
            (previous !== undefined && sameForm(previous, shape)))
        ) {
          context.report({ node, messageId: "dropped", data: { id } })
        }
        written.add(id)
      },
      "FlowchartLink:exit"(node) {
        for (const id of links.get(node) ?? []) linkIds.add(id)
      },
    }
  },
}
