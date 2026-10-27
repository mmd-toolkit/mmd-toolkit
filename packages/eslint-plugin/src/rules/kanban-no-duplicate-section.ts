import type { KanbanNode } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `kanban-no-duplicate-section`, described in
 * `docs/rules/kanban-no-duplicate-section.md`: each section after the first
 * with the same id, when any item of the board belongs to that id. The body
 * holds columns, and each column's children are its cards. Collect every
 * column with cards before reporting duplicates.
 */
export const kanbanNoDuplicateSection: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a repeated section id that lists its items more than once.",
      recommended: true,
      url: ruleDocsUrl("kanban-no-duplicate-section"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js lists every item belonging to `{{name}}` under each section with this id.",
    },
  },
  create(context) {
    return {
      KanbanDiagram(diagram) {
        const sections = new Map<string, KanbanNode[]>()
        const withItems = new Set<string>()
        for (const node of diagram.body) {
          // A node without an id always has a shape.
          const id = node.id?.value ?? node.shape!.label.value
          const earlier = sections.get(id)
          if (earlier === undefined) sections.set(id, [node])
          else earlier.push(node)
          if (node.children.length > 0) withItems.add(id)
        }
        for (const [name, nodes] of sections) {
          if (!withItems.has(name)) continue
          for (const node of nodes.slice(1)) {
            // The column's range includes its cards; report only its own syntax.
            const last =
              node.decorations.at(-1) ??
              node.data.at(-1) ??
              node.shape ??
              node.id!
            context.report({
              loc: { start: node.loc.start, end: last.loc.end },
              messageId: "duplicate",
              data: { name },
            })
          }
        }
      },
    }
  },
}
