import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { WardleyLinkStatement } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"
import {
  wardleyDeclarationsOf,
  wardleyLinkTarget,
  wardleyNameText,
} from "../utils/wardley-declarations.ts"

/** Remove either competing label, retaining the endpoint names and the arrow line. */
function labelSuggestions(
  sourceCode: MermaidSourceCode,
  node: WardleyLinkStatement,
): SuggestedEdit<"removeLabelAfterSemicolon" | "removeArrowLabel">[] {
  if (node.label === null || node.arrow?.label === null || node.arrow === null)
    return []
  const semicolon = sourceCode.getTokenBefore(node.label, {
    filter: (token) => token.type === "Punctuator" && token.value === ";",
  })
  if (semicolon === null) return []
  const label = node.arrow.label
  const tail = node.label
  const suggestions: SuggestedEdit<
    "removeLabelAfterSemicolon" | "removeArrowLabel"
  >[] = []
  if (
    canEditRange(sourceCode, [semicolon.range[0], tail.range[1]]) &&
    canCompactRange(sourceCode, [semicolon.range[0], tail.range[1]])
  )
    suggestions.push({
      messageId: "removeLabelAfterSemicolon",
      fix: (fixer) => fixer.removeRange([semicolon.range[0], tail.range[1]]),
    })
  if (
    canEditRange(sourceCode, label.range) &&
    canCompactRange(sourceCode, label.range)
  )
    suggestions.push({
      messageId: "removeArrowLabel",
      fix: (fixer) => fixer.remove(label),
    })
  return suggestions
}

/** A drawn link uses its arrow label, even when that label is empty. */
export const wardleyNoIgnoredLinkLabel: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored" | "removeLabelAfterSemicolon" | "removeArrowLabel"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a label after `;` that the label in the arrow of the link replaces.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-ignored-link-label"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeLabelAfterSemicolon: "Remove the label after `;`.",
      removeArrowLabel: "Remove the label in the arrow.",
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
          context.report({
            node: tail,
            messageId: "ignored",
            suggest: labelSuggestions(context.sourceCode, node),
          })
        }
      },
    }
  },
}
