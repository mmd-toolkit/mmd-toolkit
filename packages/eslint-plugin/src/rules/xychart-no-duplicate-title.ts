import type {
  XychartAccTitleStatement,
  XychartTitleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { titleText } from "../utils/acc-text.ts"

/** A visible chart title is compared without whitespace at its ends. */
function chartTitleText(node: XychartTitleStatement): string {
  return node.value.value.trim()
}

/**
 * The rule `xychart-no-duplicate-title`, described in
 * `docs/rules/xychart-no-duplicate-title.md`: a later `title` or `accTitle`
 * that replaces the value of the preceding statement of its own kind. The
 * tree joins unquoted words; quoted text is compared without the whitespace
 * at its ends. An `accTitle:` without text sets the empty title. Frontmatter
 * is not a statement, and the two kinds of title are counted separately.
 */
export const xychartNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicateTitle" | "duplicateAccTitle"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `title` or `accTitle` statement that sets its title again.",
      recommended: true,
      url: ruleDocsUrl("xychart-no-duplicate-title"),
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
    let previousTitle: XychartTitleStatement | null = null

    let previousAccTitle: XychartAccTitleStatement | null = null

    return {
      XychartTitleStatement(node) {
        if (
          previousTitle !== null &&
          chartTitleText(previousTitle) !== chartTitleText(node)
        ) {
          context.report({
            node,
            messageId: "duplicateTitle",
          })
        }

        previousTitle = node
      },
      XychartAccTitleStatement(node) {
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
