import type {
  RequirementElementStatement,
  RequirementRequirementStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** A statement that defines a requirement or an element, with a body. */
type BoxStatement =
  RequirementRequirementStatement | RequirementElementStatement

/** An item of the body of a requirement or an element. */
type BodyItem = BoxStatement["body"][number]

/**
 * The field that `item` sets, as the keyword in lower case, or null for an item
 * that sets none (an empty description block).
 */
function fieldOf(item: BodyItem): string | null {
  if (
    item.type === "RequirementValueField" ||
    item.type === "RequirementElementField"
  ) {
    return item.field
  }
  if (item.type === "RequirementRiskField") return "risk"
  if (item.type === "RequirementVerifyMethodField") return "verifymethod"
  return null
}

/**
 * The rule `requirement-no-duplicate-field`, described in
 * `docs/rules/requirement-no-duplicate-field.md`: every field of a body after
 * the first one of the same field, in the body of a requirement or of an
 * element. The keywords are read in any case, and an empty description block
 * between two fields changes nothing.
 */
export const requirementNoDuplicateField: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a field that the body of a requirement or an element already has.",
      recommended: true,
      url: ruleDocsUrl("requirement-no-duplicate-field"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js keeps the `{{field}}` of line {{line}}: this later one changes nothing.",
    },
  },
  create(context) {
    /** Reports each field of the body of `node` that an earlier field of the body sets already. */
    function check(node: BoxStatement): void {
      const lines = new Map<string, number>()
      for (const item of node.body) {
        const field = fieldOf(item)
        if (field === null) continue
        const earlier = lines.get(field)
        if (earlier === undefined) {
          lines.set(field, item.loc.start.line)
        } else {
          context.report({
            node: item,
            messageId: "duplicate",
            data: { field, line: String(earlier) },
          })
        }
      }
    }

    return {
      RequirementRequirementStatement: check,
      RequirementElementStatement: check,
    }
  },
}
