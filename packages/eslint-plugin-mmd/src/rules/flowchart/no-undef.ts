import type {
  FlowchartClassStatement,
  FlowchartClickCallbackStatement,
  FlowchartClickUrlStatement,
  FlowchartStyleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"
import { subgraphIdsOf } from "../../utils/subgraph-ids.ts"

/** A statement that names ids of the diagram: `class` or `click`. */
type IdsStatement =
  | FlowchartClassStatement
  | FlowchartClickCallbackStatement
  | FlowchartClickUrlStatement

/**
 * The rule `flowchart/no-undef`, described in
 * `docs/rules/flowchart/no-undef.md`: a `style`, `class`, or `click` statement
 * that names an id that is the id of no vertex, no subgraph, and no link of
 * the diagram, before or after the statement. For `style`, mermaid.js then
 * adds a new vertex; for `class` and `click`, it does nothing. A vertex that a
 * `style` adds is a vertex of the diagram too: only the first `style` of such
 * an id adds it and is reported, and a `class` or `click` of the id is not. The ids of the
 * subgraphs are those of the Db of mermaid.js, which `subgraphIdsOf`
 * gives; like the other ids, they are in the form of the values of the tree,
 * so they compare as they are. The rule suggests nothing: which id the author
 * meant is not in the text.
 */
export const noUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "style" | "ignored"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `style`, `class`, or `click` statement that names an id that the diagram does not define.",
      recommended: true,
      url: ruleDocsUrl("flowchart/no-undef"),
    },
    schema: [],
    messages: {
      style:
        "mermaid.js adds a new vertex `{{id}}` for this `style`: no vertex, subgraph, or link of the diagram has this id.",
      ignored:
        "mermaid.js does nothing with `{{id}}` here: no vertex, subgraph, or link of the diagram has this id.",
    },
  },
  create(context) {
    const { sourceCode } = context
    /** The ids of the vertices and of the links, wherever they stand. */
    const definedIds = new Set<string>()
    const styles: FlowchartStyleStatement[] = []
    const idsStatements: IdsStatement[] = []

    /** Collects the statement `node`, which names ids. */
    function collectIds(node: IdsStatement): void {
      idsStatements.push(node)
    }

    return {
      FlowchartVertex(node) {
        definedIds.add(node.id.name)
      },
      FlowchartLink(node) {
        if (node.id !== null) definedIds.add(node.id.name)
      },
      FlowchartStyleStatement(node) {
        styles.push(node)
      },
      FlowchartClassStatement: collectIds,
      FlowchartClickCallbackStatement: collectIds,
      FlowchartClickUrlStatement: collectIds,
      "FlowchartDiagram:exit"() {
        for (const id of subgraphIdsOf(sourceCode).values()) {
          definedIds.add(id)
        }
        // In the order of the source: a `style` of an id that nothing
        // defines adds the vertex, which the later statements then name.
        for (const style of styles) {
          if (definedIds.has(style.id.name)) continue
          definedIds.add(style.id.name)
          context.report({
            node: style.id,
            messageId: "style",
            data: { id: style.id.name },
          })
        }
        for (const statement of idsStatements) {
          for (const id of statement.ids) {
            if (id === null || definedIds.has(id.name)) continue
            context.report({
              node: id,
              messageId: "ignored",
              data: { id: id.name },
            })
          }
        }
      },
    }
  },
}
