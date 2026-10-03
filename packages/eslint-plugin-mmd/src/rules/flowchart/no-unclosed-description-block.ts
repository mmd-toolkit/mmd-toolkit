import type { SuggestedEdit } from "@eslint/core"
import type { Token } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"
import type { MermaidSourceCode } from "../../source-code.ts"

/** The ids of the messages of the suggestions. */
type SuggestionId = "closeAtLineEnd" | "closeAtTextEnd"

/** The length of the first line of `text`, without the whitespace at its end. */
function firstLineLength(text: string): number {
  let end = 0
  while (end < text.length && text[end] !== "\n" && text[end] !== "\r") end++
  return text.slice(0, end).trimEnd().length
}

/** The line terminator at the end of `text`, or the empty string. */
function finalLineTerminator(text: string): string {
  if (text.endsWith("\r\n")) return "\r\n"
  if (text.endsWith("\n")) return "\n"
  if (text.endsWith("\r")) return "\r"
  return ""
}

/**
 * The suggestions for an unclosed block whose `{` is `brace` and whose text
 * is `body`, the tokens after the `{`. Where the `}` belongs is the author's
 * choice, so they are suggestions, not a fix: the end of the line of the `{`,
 * when the block has text on that line, and the end of the text, when the
 * block has text on a later line. A block without text would become an empty
 * block, so it gets no suggestion.
 */
function closingSuggestions(
  sourceCode: MermaidSourceCode,
  brace: Token,
  body: readonly Token[],
): SuggestedEdit<SuggestionId>[] {
  const suggestions: SuggestedEdit<SuggestionId>[] = []
  const lastOnBraceLine = body
    .filter((token) => token.loc.start.line === brace.loc.end.line)
    .at(-1)
  if (lastOnBraceLine !== undefined) {
    // After the text on the line, before the whitespace at its end.
    const index =
      lastOnBraceLine.range[0] + firstLineLength(lastOnBraceLine.value)
    suggestions.push({
      messageId: "closeAtLineEnd",
      fix: (fixer) => fixer.insertTextAfterRange([index, index], " }"),
    })
  }
  const lastToken = body.at(-1)
  if (
    lastToken === undefined ||
    lastToken.loc.end.line === brace.loc.end.line
  ) {
    return suggestions
  }
  // A line with only `}` after the last line of the text.
  const { text } = sourceCode
  const terminator = finalLineTerminator(text)
  const closing = terminator === "" ? "\n}" : `}${terminator}`
  suggestions.push({
    messageId: "closeAtTextEnd",
    fix: (fixer) =>
      fixer.insertTextAfterRange([text.length, text.length], closing),
  })
  return suggestions
}

/**
 * The rule `flowchart/no-unclosed-description-block`, described in
 * `docs/rules/flowchart/no-unclosed-description-block.md`: an `accDescr {`
 * block that no `}` closes, which the tree shows as a
 * `FlowchartAccDescrBlockStatement` whose `closed` is false.
 */
export const noUnclosedDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unclosed" | SuggestionId
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr {` block without its closing `}`.",
      recommended: true,
      url: ruleDocsUrl("flowchart/no-unclosed-description-block"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      unclosed:
        "mermaid.js reads the rest of the diagram as the text of this unclosed `accDescr {` block, and sets an empty description.",
      closeAtLineEnd:
        "Close the block at the end of the line of the `{`: mermaid.js then reads the rest of that line as the description, and the lines after it as statements.",
      closeAtTextEnd:
        "Close the block at the end of the text: mermaid.js then reads all the text after the `{` as the description.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      FlowchartAccDescrBlockStatement(node) {
        if (node.closed) return
        // The block runs to the end of the text; the report marks where it
        // opens, `accDescr {`, its first two tokens.
        const [keyword, brace, ...body] = sourceCode.getTokens(node)
        if (keyword === undefined || brace === undefined) return
        context.report({
          loc: { start: keyword.loc.start, end: brace.loc.end },
          messageId: "unclosed",
          suggest: closingSuggestions(sourceCode, brace, body),
        })
      },
    }
  },
}
