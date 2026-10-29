import type {
  GanttAccTitleStatement,
  GanttTitleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { titleText } from "../utils/acc-text.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"

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
  MessageIds:
    "duplicateTitle" | "duplicateAccTitle" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `title` or `accTitle` statement that sets its title again.",
      recommended: true,
      url: ruleDocsUrl("gantt-no-duplicate-title"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      duplicateTitle:
        "mermaid.js replaces the earlier title with the one of this `title`.",
      duplicateAccTitle:
        "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
      removeThis: "Remove this {{statement}}.",
      removePrevious: "Remove the earlier {{statement}}.",
    },
  },
  create(context) {
    let previousTitle: GanttTitleStatement | null = null
    let beforePreviousTitle: GanttTitleStatement | null = null

    let previousAccTitle: GanttAccTitleStatement | null = null
    let beforePreviousAccTitle: GanttAccTitleStatement | null = null

    return {
      GanttTitleStatement(node) {
        if (
          previousTitle !== null &&
          titleText(previousTitle) !== titleText(node)
        ) {
          context.report({
            node,
            messageId: "duplicateTitle",
            suggest: oneOfTwoRemovals(
              context.sourceCode,
              node,
              previousTitle,
              beforePreviousTitle === null ||
                titleText(beforePreviousTitle) === titleText(node),
              {
                current: "statement",
                previous: "statement that sets the title",
              },
            ),
          })
        }
        beforePreviousTitle = previousTitle
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
            suggest: oneOfTwoRemovals(
              context.sourceCode,
              node,
              previousAccTitle,
              beforePreviousAccTitle === null ||
                titleText(beforePreviousAccTitle) === titleText(node),
              {
                current: "`accTitle` statement",
                previous: "`accTitle` statement",
              },
            ),
          })
        }
        beforePreviousAccTitle = previousAccTitle
        previousAccTitle = node
      },
    }
  },
}
