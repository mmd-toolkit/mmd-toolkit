import { sameJsonValue } from "../utils/json.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { MermaidSourceCode } from "../source-code.ts"

import type { SuggestedEdit } from "@eslint/core"
import type { DuplicateInitMember } from "../utils/directive-arguments.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { duplicateInitMembers } from "../utils/directive-arguments.ts"

/** Remove the earlier member only if the value before it would no longer conflict here. */
function memberRemovals(
  sourceCode: MermaidSourceCode,
  member: DuplicateInitMember,
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  const choices: {
    range: [number, number]
    messageId: "removeThis" | "removePrevious"
  }[] = [{ range: member.current.removalRange, messageId: "removeThis" }]
  const before = member.previous.previous
  if (before === undefined || sameJsonValue(before.value, member.current.value))
    choices.push({
      range: member.previous.removalRange,
      messageId: "removePrevious",
    })
  return choices
    .filter((choice) => canCompactRange(sourceCode, choice.range))
    .map((choice) => ({
      messageId: choice.messageId,
      fix: (fixer) => fixer.removeRange(choice.range),
    }))
}

/** Each object keeps its own key history; separate directives never replace it. */
export const noDuplicateInitKey: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a key written twice in one object of the JSON of an init directive.",
      recommended: true,
      url: ruleDocsUrl("no-duplicate-init-key"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this JSON member.",
      removePrevious: "Remove the earlier JSON member.",
      duplicate:
        "mermaid.js replaces the earlier value of key {{key}} in this init directive with this value.",
    },
  },
  create(context) {
    return {
      Root(root) {
        for (const directive of root.directives) {
          for (const member of duplicateInitMembers(directive)) {
            context.report({
              loc: {
                start: context.sourceCode.getLocFromIndex(
                  member.current.keyRange[0],
                ),
                end: context.sourceCode.getLocFromIndex(
                  member.current.keyRange[1],
                ),
              },
              messageId: "duplicate",
              data: { key: member.current.key },
              suggest: memberRemovals(context.sourceCode, member),
            })
          }
        }
      },
    }
  },
}
