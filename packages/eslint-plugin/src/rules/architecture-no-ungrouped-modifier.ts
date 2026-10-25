import type { Identifier } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Membership comes from all declarations, including those after an edge. */
export const architectureNoUngroupedModifier: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ungrouped"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow the `{group}` modifier on an end of an edge that is in no group.",
      recommended: true,
      url: ruleDocsUrl("architecture-no-ungrouped-modifier"),
    },
    schema: [],
    messages: {
      ungrouped:
        "mermaid.js moves this end away from `{{id}}` as if it had a group, although it is declared without `in`.",
    },
  },
  create(context) {
    const ungrouped = new Set<string>()

    /** The modifier has no node, so report its brace-to-brace token location. */
    function checkEnd(id: Identifier, hasModifier: boolean): void {
      if (!hasModifier || !ungrouped.has(id.name)) return
      const opening = context.sourceCode.getTokenAfter(id, {
        filter: (token) => token.type === "Punctuator" && token.value === "{",
      })
      const closing =
        opening === null
          ? null
          : context.sourceCode.getTokenAfter(opening, {
              filter: (token) =>
                token.type === "Punctuator" && token.value === "}",
            })
      if (opening === null || closing === null) {
        throw new Error("An accepted architecture modifier has no brace tokens")
      }
      context.report({
        loc: { start: opening.loc.start, end: closing.loc.end },
        messageId: "ungrouped",
        data: { id: id.name },
      })
    }

    return {
      ArchitectureDiagram(node) {
        for (const statement of node.body) {
          if (
            (statement.type === "ArchitectureServiceStatement" ||
              statement.type === "ArchitectureJunctionStatement") &&
            statement.in === null
          ) {
            ungrouped.add(statement.id.name)
          }
        }
      },
      ArchitectureEdgeStatement(node) {
        checkEnd(node.lhsId, node.lhsGroup)
        checkEnd(node.rhsId, node.rhsGroup)
      },
    }
  },
}
