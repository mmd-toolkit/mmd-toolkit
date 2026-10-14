import type {
  JourneyAccDescrBlockStatement,
  JourneyAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** A statement that sets the description. */
type DescriptionStatement =
  JourneyAccDescrStatement | JourneyAccDescrBlockStatement

/**
 * The rule `journey-no-duplicate-description`, described in
 * `docs/rules/journey-no-duplicate-description.md`: every statement that sets
 * the description after the first. An `accDescr:` line sets it; a block sets it
 * when it holds a description, and an empty block sets nothing. ESLint visits
 * the statements in the order of the source, so each one is compared with the
 * one before it.
 */
export const journeyNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` statement that sets the description again.",
      recommended: true,
      url: ruleDocsUrl("journey-no-duplicate-description"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the description set on line {{line}} with the one of this `accDescr`.",
    },
  },
  create(context) {
    let previous: DescriptionStatement | null = null

    /** Reports `node` when a statement before it set the description. */
    function check(node: DescriptionStatement): void {
      if (previous !== null) {
        context.report({
          node,
          messageId: "duplicate",
          data: { line: String(previous.loc.start.line) },
        })
      }
      previous = node
    }

    return {
      JourneyAccDescrStatement: check,
      JourneyAccDescrBlockStatement(node) {
        if (node.value !== null) check(node)
      },
    }
  },
}
