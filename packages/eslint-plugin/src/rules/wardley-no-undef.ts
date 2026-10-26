import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import {
  wardleyDeclarationsOf,
  wardleyLinkTarget,
  wardleyNameText,
} from "../utils/wardley-declarations.ts"

/** Forward declarations count; only links may resolve a pipeline child's label. */
export const wardleyNoUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "undef"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a link or an `evolve` that names no node.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-undef"),
    },
    schema: [],
    messages: {
      undef: "mermaid.js draws no {{kind}} because `{{name}}` names no node.",
    },
  },
  create(context) {
    return {
      WardleyDiagram(diagram) {
        const declarations = wardleyDeclarationsOf(diagram)
        for (const node of diagram.body) {
          if (node.type === "WardleyLinkStatement") {
            for (const reference of [node.from, node.to]) {
              const name = wardleyNameText(reference)
              if (wardleyLinkTarget(declarations, name) === undefined) {
                context.report({
                  node: reference,
                  messageId: "undef",
                  data: { name, kind: "link" },
                })
              }
            }
          } else if (node.type === "WardleyEvolveStatement") {
            const name = wardleyNameText(node.component)
            if (!declarations.nodes.has(name)) {
              context.report({
                node: node.component,
                messageId: "undef",
                data: { name, kind: "evolution arrow" },
              })
            }
          }
        }
      },
    }
  },
}
