import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { fieldOf } from "../utils/requirement-fields.ts"
import type { BoxStatement } from "../utils/requirement-fields.ts"

/**
 * The rule `requirement-no-duplicate-field`, described in
 * `docs/rules/requirement-no-duplicate-field.md`: every field of a body after
 * the first one of the same field, in the body of a requirement or of an
 * element, when its value is not the value of the first one. The keywords are
 * read in any case, and an empty description block between two fields changes
 * nothing.
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
    /** Reports each field of the body of `node` whose value differs from the first field of its name in the body. */
    function check(node: BoxStatement): void {
      const firsts = new Map<string, { line: number; value: string }>()
      for (const item of node.body) {
        const field = fieldOf(item)
        if (field === null) continue
        const first = firsts.get(field.name)
        if (first === undefined) {
          firsts.set(field.name, {
            line: item.loc.start.line,
            value: field.value,
          })
        } else if (first.value !== field.value) {
          context.report({
            node: item,
            messageId: "duplicate",
            data: { field: field.name, line: String(first.line) },
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
