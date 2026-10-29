import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `class-no-bare-class-name`, described in
 * `docs/rules/class-no-bare-class-name.md`: each `ClassNameStatement`, a class
 * name written alone as a statement, which declares no class. The statement
 * can be `direction lr` or `title Animals`, which mermaid.js reads as the class
 * names `directionlr` and `titleAnimals`.
 */
export const classNoBareClassName: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "bare"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a class name alone on its line, which changes nothing.",
      recommended: true,
      url: ruleDocsUrl("class-no-bare-class-name"),
    },

    schema: [],
    messages: {
      bare: "mermaid.js reads `{{text}}` as a class name alone: it declares no class and changes nothing.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      ClassNameStatement(node) {
        context.report({
          node,
          messageId: "bare",
          data: { text: sourceCode.getText(node) },
        })
      },
    }
  },
}
