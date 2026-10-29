import type {
  C4AccDescriptionStatement,
  C4AccDescrStatement,
  C4AccDescrBlockStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { accDescrTextOf } from "../utils/acc-text.ts"

/** All three forms write the shared description. Empty blocks do not write it. */
type DescriptionStatement =
  C4AccDescriptionStatement | C4AccDescrStatement | C4AccDescrBlockStatement

/** Compare description values with the shared indentation rule. */
export const c4NoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a description statement that replaces a different diagram description.",
      recommended: true,
      url: ruleDocsUrl("c4-no-duplicate-description"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier description with this description.",
    },
  },
  create(context) {
    let previous: string | null = null

    /** Values already retain or trim exterior whitespace according to the form. */
    function check(node: DescriptionStatement): void {
      const text = accDescrTextOf(node.value?.value ?? "")
      if (previous !== null && previous !== text) {
        context.report({
          node,
          messageId: "duplicate",
        })
      }
      previous = text
    }

    return {
      C4AccDescriptionStatement: check,
      C4AccDescrStatement: check,
      C4AccDescrBlockStatement(node) {
        if (node.value !== null) check(node)
      },
    }
  },
}
