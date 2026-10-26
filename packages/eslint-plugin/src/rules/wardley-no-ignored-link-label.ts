import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"
import {
  wardleyDeclarationsOf,
  wardleyLinkTarget,
  wardleyNameText,
} from "../utils/wardley-declarations.ts"

/** A drawn link uses its arrow label, even when that label is empty. */
export const wardleyNoIgnoredLinkLabel: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a label after `;` that the label in the arrow of the link replaces.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-ignored-link-label"),
    },
    schema: [],
    messages: {
      ignored:
        "mermaid.js uses the label in the arrow of this link and drops this label after `;`.",
    },
  },
  create(context) {
    return {
      WardleyDiagram(diagram) {
        const declarations = wardleyDeclarationsOf(diagram)
        for (const node of diagram.body) {
          if (node.type !== "WardleyLinkStatement") continue
          const tail = node.label
          const arrow = node.arrow?.label
          if (tail === null || arrow === null || arrow === undefined) continue
          const value = normalizeLineTerminators(tail.value).trim()
          if (value === "" || value === normalizeLineTerminators(arrow.value))
            continue
          const from = wardleyLinkTarget(
            declarations,
            wardleyNameText(node.from),
          )
          const to = wardleyLinkTarget(declarations, wardleyNameText(node.to))
          if (from === undefined || to === undefined) continue
          if (declarations.pipelineMembers.get(to.id)?.includes(from.id))
            continue
          context.report({ node: tail, messageId: "ignored" })
        }
      },
    }
  },
}
