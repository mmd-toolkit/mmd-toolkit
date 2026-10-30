import type { SuggestedEdit } from "@eslint/core"
import type { VennStyleStatement, VennStyleProperty } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { commaRemovalRange } from "../utils/comma-parts.ts"
import { removalRange } from "../utils/removal.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"
import { vennRegionKey } from "../utils/venn-names.ts"
import { VENN_STYLE_KEYS } from "../utils/venn-styles.ts"

/** The history keeps the property and the statement needed by a sole-property removal. */
interface PropertyHistory {
  node: VennStyleProperty
  statement: VennStyleStatement
  value: string
  before: string | undefined
}

/** A sole property goes with its isolated statement; other properties go with a comma. */
function propertyRemovals(
  sourceCode: MermaidSourceCode,
  statement: VennStyleStatement,
  node: VennStyleProperty,
  previous: PropertyHistory,
  canRemovePrevious: boolean,
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  const choices: {
    node: VennStyleProperty
    statement: VennStyleStatement
    messageId: "removeThis" | "removePrevious"
  }[] = [{ node, statement, messageId: "removeThis" }]
  if (canRemovePrevious)
    choices.push({
      node: previous.node,
      statement: previous.statement,
      messageId: "removePrevious",
    })
  const suggestions: SuggestedEdit<"removeThis" | "removePrevious">[] = []
  for (const choice of choices) {
    const range =
      choice.statement.properties.length === 1
        ? removalRange(sourceCode, choice.statement)
        : commaRemovalRange(
            sourceCode,
            choice.node,
            choice.statement.properties,
          )
    if (range !== null)
      suggestions.push({
        messageId: choice.messageId,
        fix: (fixer) => fixer.removeRange(range),
      })
  }
  return suggestions
}

/** Keep the most recent value of each read property for each target list. */
export const vennNoDuplicateStyle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a style that replaces an earlier value of the same target.",
      recommended: true,
      url: ruleDocsUrl("venn-no-duplicate-style"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this property.",
      removePrevious: "Remove the earlier property.",
      duplicate:
        "mermaid.js replaces the `{{name}}` value given earlier for this target with this value.",
    },
  },
  create(context) {
    const targets = new Map<string, Map<string, PropertyHistory>>()
    return {
      VennStyleStatement(node) {
        const target = vennRegionKey(node.targets)
        let properties = targets.get(target)
        if (properties === undefined) {
          properties = new Map()
          targets.set(target, properties)
        }
        for (const property of node.properties) {
          const name = property.key.name
          if (!VENN_STYLE_KEYS.has(name)) continue
          const value = normalizeLineTerminators(property.value.value)
          const previous = properties.get(name)
          if (previous !== undefined && previous.value !== value) {
            context.report({
              node: property,
              messageId: "duplicate",
              data: { name },
              suggest: propertyRemovals(
                context.sourceCode,
                node,
                property,
                previous,
                previous.before === undefined || previous.before === value,
              ),
            })
          }
          properties.set(name, {
            node: property,
            statement: node,
            value,
            before: previous?.value,
          })
        }
      },
    }
  },
}
