import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { MermaidSourceCode } from "../source-code.ts"
import {
  numberWithoutDigitSeparators,
  numberWithDecimalPoint,
} from "../utils/number-spellings.ts"
import type {
  RuleFixer,
  RuleTextEdit,
  RuleTextEditor,
  SuggestedEdit,
} from "@eslint/core"
import type { SankeyLiteral, StringLiteral } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The start of a text that `parseFloat` of JavaScript reads, which mermaid.js
 * uses for the value of a link: an optional sign, then `Infinity` or digits
 * with an optional decimal point and exponent.
 */
const NUMBER_AT_START =
  /^[+-]?(?:Infinity|(?:\d+\.?\d*|\.\d+)(?:[Ee][+-]?\d+)?)/u

/** Offer only the recorded number spellings, preserving CSV quotes. */
function numberEdits(
  sourceCode: MermaidSourceCode,
  node: SankeyLiteral | StringLiteral,
): { fix?: RuleFixer; suggest?: SuggestedEdit<"writeNumber">[] } {
  if (
    !canEditRange(sourceCode, node.range) ||
    !canCompactRange(sourceCode, node.range)
  )
    return {}
  const text = node.value.trim()
  let value: string | undefined
  let automatic = true
  if (["infinity", "+infinity", "-infinity"].includes(text.toLowerCase())) {
    value = text.toLowerCase().replace("infinity", "Infinity")
  } else if (text.includes("_")) {
    value = numberWithoutDigitSeparators(text)
  } else if (
    text.toLowerCase().startsWith("0x") &&
    text.length > 2 &&
    [...text.slice(2).toLowerCase()].every(
      (character) =>
        (character >= "0" && character <= "9") ||
        (character >= "a" && character <= "f"),
    )
  ) {
    value = String(Number(text))
  } else {
    value = numberWithDecimalPoint(text)
    automatic = false
  }
  if (value === undefined) return {}
  const written = node.type === "StringLiteral" ? `"${value}"` : value

  /** Write the selected spelling with the original CSV quoting. */
  function fix(fixer: RuleTextEditor): RuleTextEdit {
    return fixer.replaceText(node, written)
  }

  return automatic
    ? { fix }
    : { suggest: [{ messageId: "writeNumber", data: { number: value }, fix }] }
}

/**
 * The rule `sankey-no-invalid-value`, described in
 * `docs/rules/sankey-no-invalid-value.md`: the value of a link when
 * mermaid.js does not read its whole text as a number. The text is read
 * without the whitespace at its ends, for a value in quotes too. A text that
 * does not start with a number is reported as no number; text after the number
 * is reported as dropped, unless it starts with `%%` (after whitespace, if
 * any), which the author marks as a comment. The tree holds the value as
 * mermaid.js reads it: without directives, without the `;` that the line
 * rule ignores, and without the comment lines inside a string.
 */
export const sankeyNoInvalidValue: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "notNumber" | "dropped" | "writeNumber"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a link value that mermaid.js does not read as written.",
      recommended: true,
      url: ruleDocsUrl("sankey-no-invalid-value"),
    },
    hasSuggestions: true,
    fixable: "code",
    schema: [],
    messages: {
      writeNumber: "Write the number as `{{number}}`.",
      notNumber:
        "mermaid.js reads this value as NaN, because it does not start with a number: the link has no size.",
      dropped:
        "mermaid.js reads only the number at the start of this value and drops the rest of it.",
    },
  },
  create(context) {
    return {
      SankeyLinkStatement(node) {
        const text = node.value.value.trim()
        const number = NUMBER_AT_START.exec(text)
        if (number === null) {
          context.report({
            node: node.value,
            messageId: "notNumber",
            ...numberEdits(context.sourceCode, node.value),
          })
          return
        }
        const rest = text.slice(number[0].length)
        if (rest !== "" && !rest.trimStart().startsWith("%%")) {
          context.report({
            node: node.value,
            messageId: "dropped",
            ...numberEdits(context.sourceCode, node.value),
          })
        }
      },
    }
  },
}
