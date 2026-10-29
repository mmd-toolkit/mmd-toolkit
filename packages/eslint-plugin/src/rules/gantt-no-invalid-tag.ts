import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { MermaidSourceCode } from "../source-code.ts"
import type { RuleFixer } from "@eslint/core"
import type { GanttTaskStatement, GanttLiteral } from "@mmd-toolkit/parser"
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

/** Only a two-item start can become tags without moving an id or an end. */
function tagFix(
  sourceCode: MermaidSourceCode,
  node: GanttTaskStatement,
  item: GanttLiteral,
): RuleFixer | null {
  if (
    !canEditRange(sourceCode, item.range) ||
    !canCompactRange(sourceCode, item.range)
  )
    return null
  if (node.items.length !== 2 || node.items[0] !== item) return null
  const words = item.value.trim().toLowerCase().split(/\s+/u)
  if (!words.every((word) => TAG_WORDS.includes(word))) return null
  return (fixer) => fixer.replaceText(item, words.join(", "))
}

/**
 * The rule `gantt-no-invalid-tag`, described in
 * `docs/rules/gantt-no-invalid-tag.md`: the start or the end of a task whose
 * first word is a tag in any case. The tags that mermaid.js reads are at the
 * front, in lower case, and the tree holds them in `tags`; every other item is
 * an item of the data, and a tag word in the place of the start or the end is
 * read as a date. The id is any word, so it is not checked. Data of four items
 * or more is not checked: mermaid.js reads none of its items.
 */
export const ganttNoInvalidTag: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "invalid"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a tag in the data of a task that mermaid.js does not read as a tag.",
      recommended: true,
      url: ruleDocsUrl("gantt-no-invalid-tag"),
    },
    fixable: "code",
    schema: [],
    messages: {
      invalid:
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
            context.report({
              node: item,
              messageId: "invalid",
              data: { word },
              fix: tagFix(context.sourceCode, node, item),
            })
          }
        }
      },
    }
  },
}
