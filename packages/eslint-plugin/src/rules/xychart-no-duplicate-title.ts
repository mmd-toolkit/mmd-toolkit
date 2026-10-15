import type {
  XychartAccTitleStatement,
  XychartTitleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

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
        "mermaid.js replaces the title set on line {{line}} with the one of this `title`.",
      duplicateAccTitle:
        "mermaid.js replaces the accessible title set on line {{line}} with the one of this `accTitle`.",
    },
  },
  create(context) {
    let previousTitle: XychartTitleStatement | null = null
    let previousAccTitle: XychartAccTitleStatement | null = null
    return {
      XychartTitleStatement(node) {
        if (
          previousTitle !== null &&
          previousTitle.value.value.trim() !== node.value.value.trim()
        ) {
          context.report({
            node,
            messageId: "duplicateTitle",
            data: { line: String(previousTitle.loc.start.line) },
          })
        }
        previousTitle = node
      },
      XychartAccTitleStatement(node) {
        if (
          previousAccTitle !== null &&
          (previousAccTitle.value?.value ?? "") !== (node.value?.value ?? "")
        ) {
          context.report({
            node,
            messageId: "duplicateAccTitle",
            data: { line: String(previousAccTitle.loc.start.line) },
          })
        }
        previousAccTitle = node
      },
    }
  },
}
