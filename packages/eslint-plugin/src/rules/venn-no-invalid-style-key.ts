import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { MermaidSourceCode } from "../source-code.ts"
import type {
  RuleFixer,
  RuleTextEdit,
  RuleTextEditor,
  SuggestedEdit,
} from "@eslint/core"
import type { Identifier } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { vennRegionKey } from "../utils/venn-names.ts"
import { VENN_STYLE_KEYS } from "../utils/venn-styles.ts"

/** A competing spelling leaves the value to keep undecided, so it gets a suggestion. */
function keyEdits(
  sourceCode: MermaidSourceCode,
  node: Identifier,
  hasOther: boolean,
): { fix?: RuleFixer; suggest?: SuggestedEdit<"writeLowerCase">[] } {
  if (
    !canEditRange(sourceCode, node.range) ||
    !canCompactRange(sourceCode, node.range)
  )
    return {}
  const value = node.name.toLowerCase()
  if (!VENN_STYLE_KEYS.has(value)) return {}

  /** Change the property key without changing its value. */
  function fix(fixer: RuleTextEditor): RuleTextEdit {
    return fixer.replaceText(node, value)
  }

  return hasOther
    ? { suggest: [{ messageId: "writeLowerCase", fix }] }
    : { fix }
}

/** Check every written key, including repeats and keys on undeclared targets. */
export const vennNoInvalidStyleKey: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "invalid" | "writeLowerCase"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a style property that the drawing does not read.",
      recommended: true,
      url: ruleDocsUrl("venn-no-invalid-style-key"),
    },
    hasSuggestions: true,
    fixable: "code",
    schema: [],
    messages: {
      writeLowerCase: "Write the property name in lower case.",

      invalid:
        "mermaid.js does not read the style property `{{name}}` in the drawing.",
    },
  },
  create(context) {
    // A later style can compete too; fixes only lower names, so this count cannot grow.
    const counts = new Map<string, Map<string, number>>()
    const diagram = context.sourceCode.ast.body
    if (diagram.type === "VennDiagram") {
      for (const statement of diagram.body) {
        if (statement.type !== "VennStyleStatement") continue
        const target = vennRegionKey(statement.targets)
        let properties = counts.get(target)
        if (properties === undefined) {
          properties = new Map()
          counts.set(target, properties)
        }
        for (const property of statement.properties) {
          const name = property.key.name.toLowerCase()
          properties.set(name, (properties.get(name) ?? 0) + 1)
        }
      }
    }
    return {
      VennStyleStatement(node) {
        const properties = counts.get(vennRegionKey(node.targets))
        for (const property of node.properties) {
          if (VENN_STYLE_KEYS.has(property.key.name)) continue
          context.report({
            node: property.key,
            messageId: "invalid",
            ...keyEdits(
              context.sourceCode,
              property.key,
              (properties?.get(property.key.name.toLowerCase()) ?? 0) > 1,
            ),
            data: { name: property.key.name },
          })
        }
      },
    }
  },
}
