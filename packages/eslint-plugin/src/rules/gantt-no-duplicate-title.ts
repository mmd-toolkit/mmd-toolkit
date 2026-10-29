import type {
  GanttAccTitleStatement,
  GanttTitleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { titleText } from "../utils/acc-text.ts"

/**
 * The rule `gantt-no-duplicate-title`, described in
 * `docs/rules/gantt-no-duplicate-title.md`: every `title` statement after the
 * first, and every `accTitle` statement after the first, also one without text
 * on its line, which takes the next line that holds text. The two are separate
 * values, so each kind is compared with the one before it of its own kind. A
 * `title` statement after the title of the frontmatter is not reported: the
 * frontmatter is no statement. ESLint visits the statements in the order of the
 * source.
 *
 * A statement is reported only when the value it sets differs from that of the
 * one before it (`titleText`): setting what the diagram already has loses
 * nothing.
 */
export const ganttNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicateTitle" | "duplicateAccTitle"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `title` or `accTitle` statement that sets its title again.",
      recommended: true,
      url: ruleDocsUrl("gantt-no-duplicate-title"),
    },
    schema: [],
    messages: {
      duplicateTitle:
        "mermaid.js replaces the earlier title with the one of this `title`.",
      duplicateAccTitle:
        "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
    },
  },
  create(context) {
    let previousTitle: GanttTitleStatement | null = null
    let previousAccTitle: GanttAccTitleStatement | null = null
    return {
      GanttTitleStatement(node) {
        if (
          previousTitle !== null &&
          titleText(previousTitle) !== titleText(node)
        ) {
          context.report({
            node,
            messageId: "duplicateTitle",
          })
        }
        previousTitle = node
      },
      GanttAccTitleStatement(node) {
        if (
          previousAccTitle !== null &&
          titleText(previousAccTitle) !== titleText(node)
        ) {
          context.report({
            node,
            messageId: "duplicateAccTitle",
          })
        }
        previousAccTitle = node
      },
    }
  },
}
