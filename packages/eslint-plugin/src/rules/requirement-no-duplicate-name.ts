import type {
  RequirementElementStatement,
  RequirementRequirementStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { requirementNameText } from "../utils/requirement-names.ts"

/** A statement that defines a requirement or an element. */
type BoxStatement =
  RequirementRequirementStatement | RequirementElementStatement

/** Whether `statement` holds a field: its body holds an item other than an empty description block. */
function holdsField(statement: BoxStatement): boolean {
  return statement.body.some((item) => item.type !== "RequirementIgnoredText")
}

/**
 * The rule `requirement-no-duplicate-name`, described in
 * `docs/rules/requirement-no-duplicate-name.md`: the name of a requirement or
 * an element when an earlier requirement or element has the same name, and the
 * later one holds a field or is of another kind. The earlier box stays as it
 * was; a later statement of the same kind without a field only gives classes.
 * An element and a requirement of one name are two boxes. ESLint visits the
 * statements in the order of the source, and a later statement is compared
 * with the first requirement or the first element of its name, whichever is of
 * its own sort.
 */
export const requirementNoDuplicateName: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored" | "secondBox"
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
        "mermaid.js keeps the box `{{name}}` of line {{line}} as it is: this statement adds only its classes.",
      secondBox:
        "mermaid.js makes a second box named `{{name}}`, besides the one on line {{line}}: `style` and `class` with this name go to the requirement.",
    },
  },
  create(context) {
    // mermaid.js keeps the requirements and the elements apart: a name can
    // belong to one requirement and to one element, each the first that has it.
    const requirements = new Map<string, RequirementRequirementStatement>()
    const elements = new Map<string, RequirementElementStatement>()

    /** Reports the name of `node` as a second box besides `other`, the first box of the other sort with that name. */
    function reportSecondBox(node: BoxStatement, other: BoxStatement): void {
      context.report({
        node: node.name,
        messageId: "secondBox",
        data: {
          name: requirementNameText(node.name),
          line: String(other.loc.start.line),
        },
      })
    }

    /** Reports the name of `node` as a statement that changes nothing but the classes of `earlier`. */
    function reportIgnored(node: BoxStatement, earlier: BoxStatement): void {
      context.report({
        node: node.name,
        messageId: "ignored",
        data: {
          name: requirementNameText(node.name),
          line: String(earlier.loc.start.line),
        },
      })
    }

    return {
      RequirementRequirementStatement(node) {
        const name = requirementNameText(node.name)
        const earlier = requirements.get(name)
        if (earlier !== undefined) {
          if (
            earlier.requirementType !== node.requirementType ||
            holdsField(node)
          ) {
            reportIgnored(node, earlier)
          }
          return
        }
        requirements.set(name, node)
        const element = elements.get(name)
        if (element !== undefined) reportSecondBox(node, element)
      },
      RequirementElementStatement(node) {
        const name = requirementNameText(node.name)
        const earlier = elements.get(name)
        if (earlier !== undefined) {
          if (holdsField(node)) reportIgnored(node, earlier)
          return
        }
        elements.set(name, node)
        const requirement = requirements.get(name)
        if (requirement !== undefined) reportSecondBox(node, requirement)
      },
    }
  },
}
