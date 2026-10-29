import type { SuggestedEdit } from "@eslint/core"
import type { UsecaseClassDefStatement } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { removalRange } from "../utils/removal.ts"
import type { UsecaseStyleDeclaration } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { dropsOrChangesStyles } from "../utils/class-styles.ts"

/** Trim value padding and collapse whitespace only outside Mermaid's quoted strings. */
function cssValueText(text: string): string {
  let value = ""
  let space = false
  let quote: '"' | "'" | null = null
  for (const character of text.trim()) {
    if (quote !== null) {
      value += character
      if (character === quote) quote = null
    } else if (character.trim() === "") {
      space = true
    } else {
      if (space) value += " "
      value += character
      space = false
      if (character === '"' || character === "'") quote = character
    }
  }
  return value
}

/** Only the last value of each property in one class definition counts. */
function stylesOf(
  styles: readonly UsecaseStyleDeclaration[],
): Map<string, string> {
  const values = new Map<string, string>()
  for (const style of styles)
    values.set(style.name.name, cssValueText(style.value.value))
  return values
}

/** A statement defining another class cannot be removed to fix just this class. */
function classRemovals(
  sourceCode: MermaidSourceCode,
  node: UsecaseClassDefStatement,
  previous: UsecaseClassDefStatement,
  canRemovePrevious: boolean,
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  const choices: {
    node: UsecaseClassDefStatement
    messageId: "removeThis" | "removePrevious"
  }[] = [{ node, messageId: "removeThis" }]
  if (canRemovePrevious)
    choices.push({ node: previous, messageId: "removePrevious" })
  const suggestions: SuggestedEdit<"removeThis" | "removePrevious">[] = []
  for (const choice of choices) {
    if (new Set(choice.node.classes.map((name) => name.name)).size !== 1)
      continue
    const range = removalRange(sourceCode, choice.node)
    if (range !== null)
      suggestions.push({
        messageId: choice.messageId,
        fix: (fixer) => fixer.removeRange(range),
      })
  }
  return suggestions
}

/** A whole class definition may add styles, but must keep its earlier styles. */
export const usecaseNoRedefinedClass: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `classDef` that drops or changes the styles of the class defined before it.",
      recommended: true,
      url: ruleDocsUrl("usecase-no-redefined-class"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this class definition.",
      removePrevious: "Remove the earlier class definition.",
      redefined:
        "mermaid.js replaces the styles of the class `{{name}}`, set earlier, with those of this `classDef`.",
    },
  },
  create(context) {
    const classes = new Map<
      string,
      {
        node: UsecaseClassDefStatement
        styles: ReadonlyMap<string, string>
        before: ReadonlyMap<string, string> | undefined
      }
    >()
    return {
      UsecaseClassDefStatement(node) {
        const styles = stylesOf(node.styles)
        for (const name of node.classes) {
          const previous = classes.get(name.name)
          if (
            previous !== undefined &&
            dropsOrChangesStyles(previous.styles, styles)
          ) {
            context.report({
              node: name,
              messageId: "redefined",
              data: { name: name.name },
              suggest: classRemovals(
                context.sourceCode,
                node,
                previous.node,
                previous.before === undefined ||
                  !dropsOrChangesStyles(previous.before, styles),
              ),
            })
          }
          classes.set(name.name, {
            node,
            styles,
            // Repeating this name does not add another statement to remove.
            before:
              previous?.node === node ? previous.before : previous?.styles,
          })
        }
      },
    }
  },
}
