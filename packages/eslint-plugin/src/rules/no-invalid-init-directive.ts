import type { RuleFixer } from "@eslint/core"
import type { Directive } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import {
  directiveArgumentRange,
  directiveArgumentText,
  parsesAsJson,
} from "../utils/directive-arguments.ts"
import { trailingJsonCommas } from "../utils/json-commas.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { invalidInitReason } from "../utils/directive-arguments.ts"

/** Only valid Mermaid JSON may follow a corrected name or a trailing-comma edit. */
function initFix(
  sourceCode: MermaidSourceCode,
  directive: Directive,
  reason: "nameCase" | "invalid",
): RuleFixer | null {
  const text = directiveArgumentText(directive).replaceAll("'", '"')
  if (reason === "nameCase") {
    if (!parsesAsJson(text)) return null
    let start = directive.range[0] + 3
    while (sourceCode.text[start]?.trim() === "") start++

    return (fixer) =>
      fixer.replaceTextRange(
        [start, start + directive.name.length],
        directive.name.toLowerCase(),
      )
  }
  const commas = trailingJsonCommas(text)
  if (commas.length === 0) return null
  const positions = new Set(commas)
  const cleaned = text
    .split("")
    .filter((_, at) => !positions.has(at))
    .join("")
  if (!parsesAsJson(cleaned)) return null
  const start = directiveArgumentRange(directive)[0]

  return (fixer) =>
    commas.map((at) => fixer.removeRange([start + at, start + at + 1]))
}

/**
 * Check the root's written directives, including ones on closing-marker lines.
 */
export const noInvalidInitDirective: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "nameCase" | "invalid"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a directive meant to configure the diagram that is not written validly, so that mermaid.js ignores it.",
      recommended: true,
      url: ruleDocsUrl("no-invalid-init-directive"),
    },
    fixable: "code",
    schema: [],
    messages: {
      nameCase:
        "mermaid.js reads no settings from `{{name}}`; init directive names are case-sensitive.",
      invalid:
        "mermaid.js reads no settings from this init directive because its JSON argument is invalid.",
    },
  },
  create(context) {
    return {
      Root(root) {
        for (const directive of root.directives) {
          const reason = invalidInitReason(directive)
          if (reason !== null) {
            context.report({
              loc: directive.loc,
              messageId: reason,
              data: { name: directive.name },
              fix: initFix(context.sourceCode, directive, reason),
            })
          }
        }
      },
    }
  },
}
