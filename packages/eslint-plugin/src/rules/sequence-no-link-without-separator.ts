import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `sequence-no-link-without-separator`, described in
 * `docs/rules/sequence-no-link-without-separator.md`: a
 * `SequenceLinkStatement` whose text holds no `@`, or has no text. Looking for
 * the `@` in the value of the text reads the value, not the text again.
 */
export const sequenceNoLinkWithoutSeparator: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "withoutSeparator"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `link` statement without the `@` between its label and its URL.",
      recommended: true,
      url: ruleDocsUrl("sequence-no-link-without-separator"),
    },
    schema: [],
    messages: {
      withoutSeparator:
        "mermaid.js finds no `@` in the text of this `link` statement, so the label is the text without its last two characters and the URL is the whole text.",
    },
  },
  create(context) {
    return {
      SequenceLinkStatement(node) {
        if (node.text?.value?.value.includes("@") === true) return
        context.report({ node, messageId: "withoutSeparator" })
      },
    }
  },
}
