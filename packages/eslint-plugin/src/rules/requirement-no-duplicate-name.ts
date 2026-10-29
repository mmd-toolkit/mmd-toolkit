import type {
  RequirementElementStatement,
  RequirementRequirementStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { fieldOf } from "../utils/requirement-fields.ts"
import type { BoxStatement } from "../utils/requirement-fields.ts"
import { requirementNameText } from "../utils/requirement-names.ts"

/**
 * The value of each field that the body of `statement` sets, by the keyword of
 * the field. mermaid.js keeps the first value of a field, so a later field of
 * the same keyword does not count.
 */
function fieldValues(statement: BoxStatement): Map<string, string> {
  const values = new Map<string, string>()
  for (const item of statement.body) {
    const field = fieldOf(item)
    if (field !== null && !values.has(field.name)) {
      values.set(field.name, field.value)
    }
  }
  return values
}

/**
 * Whether `statement` holds a field that `kept` does not have with the same
 * value: mermaid.js drops such a field, because it keeps `kept`.
 */
function losesField(statement: BoxStatement, kept: BoxStatement): boolean {
  const keptValues = fieldValues(kept)
  return [...fieldValues(statement)].some(
    ([name, value]) => keptValues.get(name) !== value,
  )
}

/**
 * The rule `requirement-no-duplicate-name`, described in
 * `docs/rules/requirement-no-duplicate-name.md`: the name of a requirement
 * when an earlier requirement has the same name, or the name of an element when
 * an earlier element has the same name, and the later statement loses
 * something: it is another kind of requirement, or it holds a field that the
 * earlier one does not have with the same value. The earlier box stays as it
 * was; a later statement that loses nothing only gives classes. A requirement
 * and an element of one name are two boxes and are not compared. ESLint visits
 * the statements in the order of the source, and a later statement is compared
 * with the first requirement or the first element of its name, whichever is of
 * its own sort.
 */
export const requirementNoDuplicateName: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a requirement or an element that reuses the name of an earlier one.",
      recommended: true,
      url: ruleDocsUrl("requirement-no-duplicate-name"),
    },
    schema: [],
    messages: {
      ignored:
        "mermaid.js keeps the first {{kind}} named `{{name}}` as it is: this statement adds only its classes.",
    },
  },
  create(context) {
    // mermaid.js keeps the requirements and the elements apart: a name can
    // belong to one requirement and to one element, each the first that has it.
    const requirements = new Map<string, RequirementRequirementStatement>()
    const elements = new Map<string, RequirementElementStatement>()

    /** Reports the name of `node` as a statement that changes nothing but the earlier box's classes. */
    function reportIgnored(node: BoxStatement): void {
      context.report({
        node: node.name,
        messageId: "ignored",
        data: {
          name: requirementNameText(node.name),
          kind:
            node.type === "RequirementRequirementStatement"
              ? "requirement"
              : "element",
        },
      })
    }

    return {
      RequirementRequirementStatement(node) {
        const name = requirementNameText(node.name)
        const earlier = requirements.get(name)
        if (earlier === undefined) {
          requirements.set(name, node)
        } else if (
          earlier.requirementType !== node.requirementType ||
          losesField(node, earlier)
        ) {
          reportIgnored(node)
        }
      },
      RequirementElementStatement(node) {
        const name = requirementNameText(node.name)
        const earlier = elements.get(name)
        if (earlier === undefined) {
          elements.set(name, node)
        } else if (losesField(node, earlier)) {
          reportIgnored(node)
        }
      },
    }
  },
}
