import type { RuleFixer } from "@eslint/core"
import type { Directive } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import {
  directiveNameRange,
  initNameCase,
  initArgumentJson,
} from "../utils/directive-arguments.ts"
import type {
  JsonProblemKind,
  JsonProblem,
  JsonReading,
} from "../utils/json.ts"
import { mermaidReadsJson } from "../utils/json.ts"

/** A corrected name must not make invalid JSON discard the other init settings. */
function nameFix(
  directive: Directive,
  parsed: JsonReading | null,
): RuleFixer | null {
  if (parsed !== null && !mermaidReadsJson(parsed)) return null
  return (fixer) =>
    fixer.replaceTextRange(
      directiveNameRange(directive),
      directive.name.toLowerCase(),
    )
}

/** Edits use written token ranges so adjacent escapes keep their meaning. */
function problemFix(problem: JsonProblem): RuleFixer {
  switch (problem.kind) {
    case "trailingComma":
      return (fixer) => fixer.removeRange(problem.range)
    case "apostropheInDoubleQuotedString":
    case "escapedApostrophe":
      return (fixer) => fixer.replaceTextRange(problem.range, "\\u0027")
    case "quoteInSingleQuotedString":
      return (fixer) => fixer.replaceTextRange(problem.range, '\\"')
    default: {
      const unreachable: never = problem.kind
      throw new Error(`Unexpected JSON problem: ${String(unreachable)}`)
    }
  }
}

/** Read the embedded JSON from every written directive, including comment lines. */
export const noInvalidInitDirective: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "nameCase" | "invalid" | JsonProblemKind
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
      trailingComma:
        "mermaid.js reads no settings from this init directive because of this trailing comma.",
      apostropheInDoubleQuotedString:
        "mermaid.js turns this ' into \" before reading the JSON, which breaks it, so it reads no settings from this init directive. Write \\u0027.",
      escapedApostrophe:
        "mermaid.js turns this \\' into \\\" and reads \" instead of '. Write \\u0027.",
      quoteInSingleQuotedString:
        'mermaid.js turns the \' around this string into ", so this " breaks the JSON and it reads no settings from this init directive. Write \\".',
    },
  },
  create(context) {
    return {
      Root(root) {
        for (const directive of root.directives) {
          const nameCase = initNameCase(directive)
          if (nameCase === "notInit") continue
          if (nameCase === "wrongCase") {
            const range = directiveNameRange(directive)
            const parsed = initArgumentJson(directive)
            context.report({
              loc: {
                start: context.sourceCode.getLocFromIndex(range[0]),
                end: context.sourceCode.getLocFromIndex(range[1]),
              },
              messageId: "nameCase",
              data: { name: directive.name },
              fix: nameFix(directive, parsed),
            })
            continue
          }
          const parsed = initArgumentJson(directive)
          if (parsed === null) continue
          if (parsed.invalid) {
            context.report({
              loc: {
                start: context.sourceCode.getLocFromIndex(parsed.range[0]),
                end: context.sourceCode.getLocFromIndex(parsed.range[1]),
              },
              messageId: "invalid",
            })
            continue
          }
          for (const problem of parsed.problems) {
            context.report({
              loc: {
                start: context.sourceCode.getLocFromIndex(problem.range[0]),
                end: context.sourceCode.getLocFromIndex(problem.range[1]),
              },
              messageId: problem.kind,
              fix: problemFix(problem),
            })
          }
        }
      },
    }
  },
}
