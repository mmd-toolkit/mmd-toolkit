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
        "mermaid.js replaces the earlier target of the id `{{id}}` with this task.",
    },
  },
  create(context) {
    /** Written ids already assigned to a task. */
    const ids = new Set<string>()
    return {
      GanttTaskStatement(node) {
        const item = itemRolesOf(node).id
        if (item === null) return
        if (!ids.has(item.value)) {
          ids.add(item.value)
          return
        }
        context.report({
          node: item,
          messageId: "duplicate",
          data: { id: item.value },
        })
      },
    }
  },
}
