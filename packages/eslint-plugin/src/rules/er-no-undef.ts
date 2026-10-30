import type { ErClassStatement, ErStyleStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { erNameText } from "../utils/er-names.ts"

/**
 * The rule `er-no-undef`, described in `docs/rules/er-no-undef.md`: a name of a
 * `style` or `class` statement that is the name of no entity and the id of no
 * subgraph of the diagram. The entities are those that an entity statement or
 * a relationship names, and the subgraphs those that a subgraph statement
 * names, wherever they stand: a name that a later statement defines is defined
 * too, because the rule compares the names with the whole diagram. An alias is
 * no name. The id of a subgraph is its name without the whitespace at the ends
 * of a quoted name.
 */
export const erNoUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `style` or `class` statement that names no entity and no subgraph.",
      recommended: true,
      url: ruleDocsUrl("er-no-undef"),
    },
    schema: [],
    messages: {
      ignored:
        "mermaid.js does nothing with `{{name}}` in this `{{keyword}}` statement: no entity and no subgraph of the diagram has this name.",
    },
  },
  create(context) {
    const { sourceCode } = context
    /** The names of the entities and the ids of the subgraphs, wherever they stand. */
    const definedNames = new Set<string>()
    const statements: (ErStyleStatement | ErClassStatement)[] = []
    return {
      ErEntityStatement(node) {
        definedNames.add(erNameText(node.name))
      },
      ErEntityReference(node) {
        definedNames.add(erNameText(node.name))
      },
      ErSubgraphStatement(node) {
        // mermaid.js trims the whitespace at the ends of a quoted subgraph name
        // for its id (the Db of the tests package, Subgraphs).
        definedNames.add(
          node.id.type === "ErIdentifier" ? node.id.name : node.id.value.trim(),
        )
      },
      ErStyleStatement: (node) => statements.push(node),
      ErClassStatement: (node) => statements.push(node),
      "ErDiagram:exit"() {
        for (const statement of statements) {
          for (const entity of statement.entities) {
            if (definedNames.has(entity.name)) continue
            context.report({
              node: entity,
              messageId: "ignored",
              data: {
                name: entity.name,
                keyword: sourceCode.getFirstToken(statement)?.value ?? "",
              },
            })
          }
        }
      },
    }
  },
}
