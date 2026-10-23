import type {
  RequirementClassShorthandStatement,
  RequirementClassStatement,
  RequirementName,
  RequirementRelationshipStatement,
  RequirementStyleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { requirementNameText } from "../utils/requirement-names.ts"

/** A statement that names requirements and elements to give them styles or classes. */
type StylingStatement =
  | RequirementStyleStatement
  | RequirementClassStatement
  | RequirementClassShorthandStatement

/**
 * The rule `requirement-no-undef`, described in
 * `docs/rules/requirement-no-undef.md`: a name in a `style`, `class`, or `:::`
 * statement, and an end of a relationship, that is the name of no requirement
 * and no element of the diagram. The names are those of all the requirements
 * and elements, wherever they stand: a `style` or `class` written before the
 * box that it names changes nothing in mermaid.js, but names a box of the
 * diagram, and a relationship may be written before the boxes that it joins.
 * The classes after `:::` and in `class` are class names, not boxes.
 */
export const requirementNoUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "styling" | "relationship"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a name in `style`, `class`, `:::`, or a relationship that names no requirement and no element.",
      recommended: true,
      url: ruleDocsUrl("requirement-no-undef"),
    },
    schema: [],
    messages: {
      styling:
        "mermaid.js does nothing with `{{name}}` in this statement: no requirement and no element of the diagram has this name.",
      relationship:
        "mermaid.js adds this relationship with the end `{{name}}`, which is no box: no requirement and no element of the diagram has this name.",
    },
  },
  create(context) {
    /** The names of the requirements and the elements, wherever they stand. */
    const definedNames = new Set<string>()
    const stylings: StylingStatement[] = []
    const relationships: RequirementRelationshipStatement[] = []

    /** Reports the name `name` when it is the name of no requirement and no element. */
    function check(
      name: RequirementName,
      messageId: "styling" | "relationship",
    ) {
      const text = requirementNameText(name)
      if (definedNames.has(text)) return
      context.report({ node: name, messageId, data: { name: text } })
    }

    return {
      RequirementRequirementStatement(node) {
        definedNames.add(requirementNameText(node.name))
      },
      RequirementElementStatement(node) {
        definedNames.add(requirementNameText(node.name))
      },
      RequirementStyleStatement: (node) => stylings.push(node),
      RequirementClassStatement: (node) => stylings.push(node),
      RequirementClassShorthandStatement: (node) => stylings.push(node),
      RequirementRelationshipStatement: (node) => relationships.push(node),
      "RequirementDiagram:exit"() {
        for (const statement of stylings) {
          const names =
            statement.type === "RequirementClassShorthandStatement"
              ? [statement.name]
              : statement.names
          for (const name of names) check(name, "styling")
        }
        for (const relationship of relationships) {
          check(relationship.left, "relationship")
          check(relationship.right, "relationship")
        }
      },
    }
  },
}
