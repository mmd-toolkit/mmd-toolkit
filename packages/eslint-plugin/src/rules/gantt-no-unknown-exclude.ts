import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** The words that mermaid.js reads in `excludes` besides dates, in lower case. */
const EXCLUDED_WORDS: readonly string[] = [
  "weekends",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

/** Whether `text` holds an ASCII digit: an item with one is a date, which the rule does not check. */
function holdsDigit(text: string): boolean {
  return [...text].some((character) => character >= "0" && character <= "9")
}

/**
 * The rule `gantt-no-unknown-exclude`, described in
 * `docs/rules/gantt-no-unknown-exclude.md`: an item of an `excludes` statement
 * that holds no digit and is not `weekends` or the name of a day, in any case.
 * mermaid.js compares such an item with the days of the week, and leaves out no
 * day for a word that is none of them.
 */
export const ganttNoUnknownExclude: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unknown"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a word in `excludes` that is neither `weekends` nor the name of a day.",
      recommended: true,
      url: ruleDocsUrl("gantt-no-unknown-exclude"),
    },
    schema: [],
    messages: {
      unknown:
        "mermaid.js leaves out no day for `{{word}}`: it is neither `weekends` nor the name of a day, and it has no digit to be a date.",
    },
  },
  create(context) {
    return {
      GanttExcludesStatement(node) {
        for (const item of node.items) {
          if (holdsDigit(item.name)) continue
          if (EXCLUDED_WORDS.includes(item.name.toLowerCase())) continue
          context.report({
            node: item,
            messageId: "unknown",
            data: { word: item.name },
          })
        }
      },
    }
  },
}
