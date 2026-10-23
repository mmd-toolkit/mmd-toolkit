import type { KanbanNode } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `kanban-no-duplicate-section`, described in
 * `docs/rules/kanban-no-duplicate-section.md`: each section after the first
 * with the same id, when any item of the board belongs to that id. The first
 * node sets the section indentation; nodes at any other indentation are items
 * of the most recent section. Collect all items before reporting duplicates.
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
        const sectionIndent = diagram.body[0]?.indent
        let currentId = ""
        for (const node of diagram.body) {
          if (node.indent === sectionIndent) {
            // A node without an id always has a shape.
            currentId = node.id?.value ?? node.shape!.label.value
            const earlier = sections.get(currentId)
            if (earlier === undefined) sections.set(currentId, [node])
            else earlier.push(node)
          } else {
            withItems.add(currentId)
          }
        }
        for (const [name, nodes] of sections) {
          if (!withItems.has(name)) continue
          for (const node of nodes.slice(1)) {
            context.report({ node, messageId: "duplicate", data: { name } })
          }
        }
      },
    }
  },
}
