import type { MindmapCloser, MindmapOpener } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The closer of each opener that mermaid.js draws a shape for. The openers
 * `(-` and `-)` are not here: mermaid.js draws the default shape for them
 * whatever the closer.
 */
const CLOSER_OF: Partial<Record<MindmapOpener, MindmapCloser>> = {
  "[": "]",
  "(": ")",
  "((": "))",
  "))": "((",
  ")": "(",
  "{{": "}}",
}

/**
 * The rule `mindmap-no-mismatched-shape`, described in
 * `docs/rules/mindmap-no-mismatched-shape.md`: a `MindmapShape` whose closer is
 * not the closer of its opener. The opener `(` is reported with its own
 * message: any closer other than `)` makes mermaid.js draw a cloud.
 */
export const mindmapNoMismatchedShape: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "mismatched" | "cloud"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a shape whose closer does not match its opener.",
      recommended: true,
      url: ruleDocsUrl("mindmap-no-mismatched-shape"),
    },
    schema: [],
    messages: {
      mismatched:
        "mermaid.js draws the shape that the opener `{{opener}}` writes and ignores the closer `{{closer}}`; the closer of `{{opener}}` is `{{expected}}`.",
      cloud:
        "mermaid.js draws a cloud, because the closer `{{closer}}` is not the `)` that closes `(`.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      MindmapShape(node) {
        const expected = CLOSER_OF[node.opener]
        if (expected === undefined || node.closer === expected) return
        const closerToken = sourceCode.getLastToken(node)
        context.report({
          loc: closerToken?.loc ?? node.loc,
          messageId: node.opener === "(" ? "cloud" : "mismatched",
          data: {
            opener: node.opener,
            expected,
            closer: node.closer,
          },
        })
      },
    }
  },
}
