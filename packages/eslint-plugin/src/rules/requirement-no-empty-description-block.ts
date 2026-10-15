import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { blockHoldsComment } from "../utils/description-block.ts"

/**
 * The rule `requirement-no-empty-description-block`, described in
 * `docs/rules/requirement-no-empty-description-block.md`: an `accDescr { }`
 * block that holds nothing or only whitespace. The tree shows it as a
 * `RequirementAccDescrBlockStatement` without a value where a statement
 * starts, and, in the body of a requirement or an element, as a
 * `RequirementIgnoredText`: there mermaid.js reads no block and drops it. A
 * block that holds only comments is meant to do nothing, and is not reported.
 */
export const requirementNoEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty" | "emptyInBody"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr` block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("requirement-no-empty-description-block"),
    },
    schema: [],
    messages: {
      empty:
        "mermaid.js takes no description from this empty `accDescr` block: the description stays as it was before it.",
      emptyInBody:
        "mermaid.js reads no description block in the body of a requirement or an element, and drops this empty `accDescr` block.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      RequirementAccDescrBlockStatement(node) {
        if (node.value !== null) return
        if (blockHoldsComment(sourceCode, node)) return
        context.report({ node, messageId: "empty" })
      },
      RequirementIgnoredText(node, parent) {
        // The text of a direction line is reported by `requirement-no-ignored-text`.
        if (
          parent?.type !== "RequirementRequirementStatement" &&
          parent?.type !== "RequirementElementStatement"
        ) {
          return
        }
        if (blockHoldsComment(sourceCode, node)) return
        context.report({ node, messageId: "emptyInBody" })
      },
    }
  },
}
