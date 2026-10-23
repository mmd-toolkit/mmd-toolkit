import type {
  GanttClickStatement,
  GanttLiteral,
  GanttTaskStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { itemRolesOf, taskIdsOf } from "../utils/gantt-tasks.ts"

/** Whether `character` is one that mermaid.js reads in the ids after `after` or `until`. */
function isIdListCharacter(character: string): boolean {
  return (
    (character >= "0" && character <= "9") ||
    (character >= "A" && character <= "Z") ||
    (character >= "a" && character <= "z") ||
    character === "_" ||
    character === "-" ||
    character === " "
  )
}

/**
 * The ids that the item `value` names after `word`, as mermaid.js reads them:
 * `value` starts with `word`, followed by whitespace; the ids are the text up
 * to the first character that is not an ASCII letter, a digit, `_`, `-`, or a
 * space, split at the spaces. The value is the text without directives, so a
 * directive inside an id is not part of it.
 */
function referencedIds(value: string, word: "after" | "until"): string[] {
  if (!value.startsWith(word)) return []
  let start = word.length
  while (start < value.length && value[start].trim() === "") start++
  if (start === word.length) return []
  let end = start
  while (end < value.length && isIdListCharacter(value[end])) end++
  return value
    .slice(start, end)
    .split(" ")
    .filter((id) => id !== "")
}

/**
 * The rule `gantt-no-undef`, described in `docs/rules/gantt-no-undef.md`: an id
 * in a `click` statement, after `after`, or after `until` that is the id of no
 * task of the chart. The ids are those of all the tasks, wherever they stand: a
 * task after the statement that names it is a task of the chart. `after` is
 * read in the start of the data (the first of two items, the second of three),
 * and `until` in the end (the last of one to three items); in the data of four
 * items or more, mermaid.js reads no item. The reference stands inside the
 * value of an item, so it is reported at the item, with the id in the message.
 */
export const ganttNoUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "click" | "after" | "until"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a task id in `click`, `after`, or `until` that is the id of no task.",
      recommended: true,
      url: ruleDocsUrl("gantt-no-undef"),
    },
    schema: [],
    messages: {
      click:
        "mermaid.js binds nothing to `{{id}}` in this `click` statement: no task has this id.",
      after:
        "mermaid.js finds no task with the id `{{id}}` for this `after`, so the task does not start after it.",
      until:
        "mermaid.js finds no task with the id `{{id}}` for this `until`, so the task does not end at it.",
    },
  },
  create(context) {
    const tasks: GanttTaskStatement[] = []
    const clicks: GanttClickStatement[] = []

    /** Reports each id that `item` names after `word` and that is the id of no task. */
    function checkItem(
      item: GanttLiteral | null,
      word: "after" | "until",
      taskIds: ReadonlySet<string>,
    ): void {
      if (item === null) return
      for (const id of referencedIds(item.value, word)) {
        if (!taskIds.has(id)) {
          context.report({ node: item, messageId: word, data: { id } })
        }
      }
    }

    return {
      GanttTaskStatement: (node) => tasks.push(node),
      GanttClickStatement: (node) => clicks.push(node),
      "GanttDiagram:exit"() {
        const taskIds = taskIdsOf(tasks)
        for (const click of clicks) {
          for (const id of click.ids) {
            if (id !== null && !taskIds.has(id.name)) {
              context.report({
                node: id,
                messageId: "click",
                data: { id: id.name },
              })
            }
          }
        }
        for (const task of tasks) {
          const { start, end } = itemRolesOf(task)
          checkItem(start, "after", taskIds)
          checkItem(end, "until", taskIds)
        }
      },
    }
  },
}
