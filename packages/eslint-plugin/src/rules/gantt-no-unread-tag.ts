import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { itemRolesOf } from "../utils/gantt-tasks.ts"

/** The words that mermaid.js reads as tags at the front of the data of a task. */
const TAG_WORDS: readonly string[] = [
  "active",
  "done",
  "crit",
  "milestone",
  "vert",
]

/** The first word of `text`: up to the first whitespace character. */
function firstWordOf(text: string): string {
  let end = 0
  while (end < text.length && text[end].trim() !== "") end++
  return text.slice(0, end)
}

/**
 * The rule `gantt-no-unread-tag`, described in
 * `docs/rules/gantt-no-unread-tag.md`: the start or the end of a task whose
 * first word is a tag in any case. The tags that mermaid.js reads are at the
 * front, in lower case, and the tree holds them in `tags`; every other item is
 * an item of the data, and a tag word in the place of the start or the end is
 * read as a date. The id is any word, so it is not checked. Data of four items
 * or more is not checked: mermaid.js reads none of its items.
 */
export const ganttNoUnreadTag: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unread"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a tag in the data of a task that mermaid.js does not read as a tag.",
      recommended: true,
      url: ruleDocsUrl("gantt-no-unread-tag"),
    },
    schema: [],
    messages: {
      unread:
        "mermaid.js does not read `{{word}}` as a tag here: it takes this as an item of the data.",
    },
  },
  create(context) {
    return {
      GanttTaskStatement(node) {
        const { start, end } = itemRolesOf(node)
        for (const item of [start, end]) {
          if (item === null) continue
          const word = firstWordOf(item.value)
          if (TAG_WORDS.includes(word.toLowerCase())) {
            context.report({ node: item, messageId: "unread", data: { word } })
          }
        }
      },
    }
  },
}
