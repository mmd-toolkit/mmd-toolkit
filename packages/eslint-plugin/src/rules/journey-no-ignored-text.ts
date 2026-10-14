import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Whether `text` holds a character other than a colon and whitespace. */
function holdsText(text: string): boolean {
  return [...text].some(
    (character) => character !== ":" && character.trim() !== "",
  )
}

/**
 * The rule `journey-no-ignored-text`, described in
 * `docs/rules/journey-no-ignored-text.md`: the text of the data of a task from
 * its third colon (a `JourneyIgnoredText`) that holds anything but colons and
 * whitespace. The value is the text without directives, so a directive in it is
 * no text.
 */
export const journeyNoIgnoredText: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow text in the data of a task that mermaid.js does not read.",
      recommended: true,
      url: ruleDocsUrl("journey-no-ignored-text"),
    },
    schema: [],
    messages: {
      ignored:
        "mermaid.js does not read the data of a task from its third colon and drops `{{text}}`.",
    },
  },
  create(context) {
    return {
      JourneyIgnoredText(node) {
        if (!holdsText(node.value)) return
        context.report({
          node,
          messageId: "ignored",
          data: { text: node.value },
        })
      },
    }
  },
}
