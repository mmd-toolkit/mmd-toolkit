import type { RuleFixer } from "@eslint/core"
import type { SequenceLinkStatement } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** The last of at least two words must be a URL with an explicit scheme. */
function separatorFix(
  sourceCode: MermaidSourceCode,
  node: SequenceLinkStatement,
): RuleFixer | null {
  const literal = node.text?.value
  if (literal == null) return null
  const text = sourceCode.getText(literal).trimEnd()
  let start = text.length
  while (start > 0 && text[start - 1].trim() !== "") start--
  if (
    start === 0 ||
    text.slice(0, start).trim() === "" ||
    !text.slice(start).includes("://")
  )
    return null
  return (fixer) =>
    fixer.insertTextBeforeRange(
      [literal.range[0] + start, literal.range[0] + start],
      "@ ",
    )
}

/**
 * The rule `sequence-no-link-without-separator`, described in
 * `docs/rules/sequence-no-link-without-separator.md`: a
 * `SequenceLinkStatement` whose text holds no `@`, or has no text. Looking for
 * the `@` in the value of the text reads the value, not the text again.
 */
export const sequenceNoLinkWithoutSeparator: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "withoutSeparator"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `link` statement without the `@` between its label and its URL.",
      recommended: true,
      url: ruleDocsUrl("sequence-no-link-without-separator"),
    },
    fixable: "code",
    schema: [],
    messages: {
      withoutSeparator:
        "mermaid.js finds no `@` in the text of this `link` statement, so the label is the text without its last two characters and the URL is the whole text.",
    },
  },
  create(context) {
    return {
      SequenceLinkStatement(node) {
        if (node.text?.value?.value.includes("@") === true) return
        context.report({
          node,
          messageId: "withoutSeparator",
          fix: separatorFix(context.sourceCode, node),
        })
      },
    }
  },
}
