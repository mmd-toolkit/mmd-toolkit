import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { RuleFixer } from "@eslint/core"
import type {
  SequenceIgnoredStatement,
  SequenceText,
} from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Join a contiguous run of closing parentheses to the immediately preceding text. */
function joinFix(
  sourceCode: MermaidSourceCode,
  node: SequenceIgnoredStatement,
  previous: SequenceText | null,
): RuleFixer | null {
  if (previous === null) return null
  const line = sourceCode.lines[node.loc.start.line - 1] ?? ""
  const closings = line.trim()
  const value = previous?.value
  if (
    closings === "" ||
    [...closings].some((character) => character !== ")") ||
    value == null ||
    value.loc.end.line + 1 !== node.loc.start.line
  )
    return null
  const before = sourceCode.getTokenBefore(previous)
  if (before?.value !== ":") return null
  const precedingLine = sourceCode.lines[value.loc.end.line - 1] ?? ""
  if (precedingLine.slice(value.loc.end.column).trim() !== "") return null
  let open = 0
  for (const character of value.value) {
    if (character === "(") open++
    else if (character === ")" && open > 0) open--
  }
  if (open < closings.length) return null
  const end = sourceCode.getIndexFromLoc({
    line: node.loc.start.line,
    column: line.length,
  })
  if (
    !canEditRange(sourceCode, [value.range[1], end]) ||
    !canCompactRange(sourceCode, [value.range[1], end])
  )
    return null
  return (fixer) => fixer.replaceTextRange([value.range[1], end], closings)
}

/**
 * The rule `sequence-no-ignored-text`, described in
 * `docs/rules/sequence-no-ignored-text.md`: each `SequenceIgnoredStatement`,
 * a character that stands where a statement starts, starts none, and is
 * dropped by mermaid.js.
 */
export const sequenceNoIgnoredText: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a line that mermaid.js reads as nothing.",
      recommended: true,
      url: ruleDocsUrl("sequence-no-ignored-text"),
    },
    fixable: "code",
    schema: [],
    messages: {
      ignored: "mermaid.js reads `{{text}}` as no statement and drops it.",
    },
  },
  create(context) {
    let previous: SequenceText | null = null
    return {
      SequenceText(node) {
        previous = node
      },
      SequenceIgnoredStatement(node) {
        context.report({
          node,
          messageId: "ignored",
          data: { text: node.value },
          fix: joinFix(context.sourceCode, node, previous),
        })
      },
    }
  },
}
