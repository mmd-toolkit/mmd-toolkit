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

/** A whole class definition may add styles, but must keep its earlier styles. */
export const usecaseNoRedefinedClass: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `classDef` that drops or changes the styles of the class defined before it.",
      recommended: true,
      url: ruleDocsUrl("usecase-no-redefined-class"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the styles of the class `{{name}}`, set earlier, with those of this `classDef`.",
    },
  },
  create(context) {
    const classes = new Map<string, ReadonlyMap<string, string>>()
    return {
      UsecaseClassDefStatement(node) {
        const styles = stylesOf(node.styles)
        for (const name of node.classes) {
          const previous = classes.get(name.name)
          if (
            previous !== undefined &&
            dropsOrChangesStyles(previous, styles)
          ) {
            context.report({
              node: name,
              messageId: "redefined",
              data: { name: name.name },
            })
          }
          classes.set(name.name, styles)
        }
      },
    }
  },
}
