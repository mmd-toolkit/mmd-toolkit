import type {
  QuadrantAccTitleStatement,
  QuadrantTitleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { titleText } from "../utils/acc-text.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"

/**
 * The rule `quadrant-no-duplicate-title`, described in
 * `docs/rules/quadrant-no-duplicate-title.md`: a later `title` or `accTitle`
 * that replaces the preceding value of its own kind. The tree trims the
 * values, keeps quotes and semicolons in titles, and represents an empty
 * title with null. Frontmatter is not a title statement.
 */
export const quadrantNoDuplicateTitle: MermaidRuleDefinition<{
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
      url: ruleDocsUrl("quadrant-no-duplicate-title"),
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
    let previousTitle: QuadrantTitleStatement | null = null
    let beforePreviousTitle: QuadrantTitleStatement | null = null

    let previousAccTitle: QuadrantAccTitleStatement | null = null
    let beforePreviousAccTitle: QuadrantAccTitleStatement | null = null

    return {
      QuadrantTitleStatement(node) {
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
      QuadrantAccTitleStatement(node) {
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
