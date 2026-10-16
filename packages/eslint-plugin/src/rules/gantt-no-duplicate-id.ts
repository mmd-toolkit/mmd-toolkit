import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { itemRolesOf } from "../utils/gantt-tasks.ts"

/**
 * The rule `gantt-no-duplicate-id`, described in
 * `docs/rules/gantt-no-duplicate-id.md`: the written id of a task when an
 * earlier task has the same one. mermaid.js finds the later task for the id, in
 * `after`, `until`, `click`, and in the start of a task with one item. The ids
 * compared are those written as the first of three items; the ids that
 * mermaid.js gives to the tasks without one are not. ESLint visits the tasks in
 * the order of the source.
 */
export const ganttNoDuplicateId: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a task id that an earlier task already has.",
      recommended: true,
      url: ruleDocsUrl("gantt-no-duplicate-id"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js finds only this task for the id `{{id}}`, not the task on line {{line}} that has it too.",
    },
  },
  create(context) {
    /** For each written id, the line of the first task that writes it. */
    const lines = new Map<string, number>()
    return {
      GanttTaskStatement(node) {
        const item = itemRolesOf(node).id
        if (item === null) return
        const earlier = lines.get(item.value)
        if (earlier === undefined) {
          lines.set(item.value, node.loc.start.line)
          return
        }
        context.report({
          node: item,
          messageId: "duplicate",
          data: { id: item.value, line: String(earlier) },
        })
      },
    }
  },
}
