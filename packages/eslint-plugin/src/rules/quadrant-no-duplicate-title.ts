import type {
  QuadrantAccTitleStatement,
  QuadrantTitleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { titleText } from "../utils/acc-text.ts"

/**
 * The rule `quadrant-no-duplicate-title`, described in
 * `docs/rules/quadrant-no-duplicate-title.md`: a later `title` or `accTitle`
 * that replaces the preceding value of its own kind. The tree trims the
 * values, keeps quotes and semicolons in titles, and represents an empty
 * title with null. Frontmatter is not a title statement.
 */
export const quadrantNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicateTitle" | "duplicateAccTitle"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `title` or `accTitle` statement that sets its title again.",
      recommended: true,
      url: ruleDocsUrl("quadrant-no-duplicate-title"),
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
    let previousTitle: QuadrantTitleStatement | null = null
    let previousAccTitle: QuadrantAccTitleStatement | null = null
    return {
      QuadrantTitleStatement(node) {
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
      QuadrantAccTitleStatement(node) {
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
