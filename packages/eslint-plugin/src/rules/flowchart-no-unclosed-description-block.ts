import type { SuggestedEdit } from "@eslint/core"
import type { Token } from "@mmd-toolkit/parser"
import { parse } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import type { MermaidSourceCode } from "../source-code.ts"

/** The ids of the messages of the suggestions. */
type SuggestionId = "closeAtLineEnd" | "closeAtTextEnd"

/** Whether the parser accepts `text`, as mermaid.js does. */
function isAccepted(text: string): boolean {
  try {
    parse(text)
    return true
  } catch {
    return false
  }
}

/** The line terminator at the end of `text`, or the empty string. */
function finalLineTerminator(text: string): string {
  if (text.endsWith("\r\n")) return "\r\n"
  if (text.endsWith("\n")) return "\n"
  if (text.endsWith("\r")) return "\r"
  return ""
}

/**
 * The line of the `{`, as mermaid.js reads it: directives are taken out before
 * the text is read, so a line ends at the first line terminator outside the
 * directives, and a directive that spans lines carries the line on.
 */
interface BraceLine {
  /** Where the line ends, without the whitespace at its end. */
  readonly end: number
  /** Whether text other than a directive stands on the line. */
  readonly hasText: boolean
  /** Whether text other than a directive stands after the line. */
  readonly textBeyond: boolean
}

/**
 * The line of the `{` of an unclosed block, from the tokens `body` after it.
 * A token may hold directives, which `sourceCode.ast.directives` gives; the
 * line of a token ends at its first line terminator outside them. The block
 * holds no directive that is not closed (see `closingSuggestions`).
 */
function braceLineOf(
  sourceCode: MermaidSourceCode,
  brace: Token,
  body: readonly Token[],
): BraceLine {
  const { text } = sourceCode
  const { directives } = sourceCode.ast
  let end = brace.range[1]
  let line = brace.loc.end.line
  let hasText = false

  for (const [index, token] of body.entries()) {
    if (token.loc.start.line !== line) {
      return { end, hasText, textBeyond: textIn(body, index) }
    }
    // Where the line of the token ends: at a line terminator that no
    // directive holds.
    let lineEnd = token.range[1]
    for (let at = token.range[0]; at < token.range[1]; at++) {
      const directive = directives.find(
        (each) => each.range[0] <= at && at < each.range[1],
      )
      if (directive !== undefined) {
        at = directive.range[1] - 1
      } else if (text[at] === "\n" || text[at] === "\r") {
        lineEnd = at
        break
      }
    }
    if (token.type !== "Directive") hasText = true
    end = token.range[0] + text.slice(token.range[0], lineEnd).trimEnd().length
    if (lineEnd < token.range[1]) return { end, hasText, textBeyond: true }
    line = token.loc.end.line
  }
  return { end, hasText, textBeyond: false }
}

/** Whether a token other than a directive is among `tokens`, from `from` on. */
function textIn(tokens: readonly Token[], from: number): boolean {
  return tokens.slice(from).some((token) => token.type !== "Directive")
}

/**
 * The suggestions for a block whose `{` is `brace` and whose text is `body`,
 * the tokens after the `{`. Where the `}` belongs is the author's choice, so
 * they are suggestions, not a fix: the end of the line of the `{`, when the
 * block has text on that line, and the end of the text, when the block is not
 * closed and has text after that line. A block without text would become an
 * empty block, so it gets no suggestion. Nor does a block with a directive that
 * is not closed: from that directive on, the directive decides what mermaid.js
 * reads, wherever the block is closed. A suggestion is offered only when the
 * parser accepts its result, which it does not where a later line is no
 * statement.
 */
function closingSuggestions(
  sourceCode: MermaidSourceCode,
  brace: Token,
  body: readonly Token[],
  blockEnd: number,
  closed: boolean,
): SuggestedEdit<SuggestionId>[] {
  if (
    sourceCode.ast.directives.some(
      (directive) =>
        !directive.closed &&
        brace.range[1] <= directive.range[0] &&
        directive.range[0] < blockEnd,
    )
  ) {
    return []
  }
  const { text } = sourceCode
  const suggestions: SuggestedEdit<SuggestionId>[] = []
  const braceLine = braceLineOf(sourceCode, brace, body)
  if (braceLine.hasText) {
    // After the text on the line, before the whitespace at its end.
    const { end } = braceLine
    const closing = " }"
    if (isAccepted(text.slice(0, end) + closing + text.slice(end))) {
      suggestions.push({
        messageId: "closeAtLineEnd",
        fix: (fixer) => fixer.insertTextAfterRange([end, end], closing),
      })
    }
  }
  // A block that a later `}` closes ends there, at the end of its text.
  if (closed || !braceLine.textBeyond) return suggestions
  // A line with only `}` after the last line of the text.
  const terminator = finalLineTerminator(text)
  const closing = terminator === "" ? "\n}" : `}${terminator}`
  if (isAccepted(text + closing)) {
    suggestions.push({
      messageId: "closeAtTextEnd",
      fix: (fixer) =>
        fixer.insertTextAfterRange([text.length, text.length], closing),
    })
  }
  return suggestions
}

/** The text before `token` on its line, without the directives that stand there. */
function lineBeforeWithoutDirectives(
  sourceCode: MermaidSourceCode,
  token: Token,
): string {
  const start = token.range[0] - token.loc.start.column
  return [...sourceCode.text.slice(start, token.range[0])]
    .filter(
      (_character, offset) =>
        !sourceCode.ast.directives.some(
          (directive) =>
            directive.range[0] <= start + offset &&
            start + offset < directive.range[1],
        ),
    )
    .join("")
}

/**
 * Whether the closed block whose `{` is `brace` and whose text is `body` ends
 * at a `}` written for another statement: its text holds a `{` after the line
 * of the block's `{` (a line is what `braceLineOf` gives, which a directive
 * may carry on), and the `}` that closes it (`closing`) does not stand alone
 * on its line: only whitespace and directives stand before it there, whatever
 * follows it. A `{` on the line of the block's `{` is a `{` of the
 * description, and a `}` alone on its line is the author's: both close the
 * block as written. The first `}` after the `{` of a block
 * closes it, so `closing` is the last token of the block.
 */
function closedByBraceOfOtherStatement(
  sourceCode: MermaidSourceCode,
  brace: Token,
  body: readonly Token[],
  closing: Token,
): boolean {
  if (lineBeforeWithoutDirectives(sourceCode, closing).trim() === "") {
    return false
  }
  const { end } = braceLineOf(sourceCode, brace, body)
  return body
    .filter((token) => token.type !== "Directive")
    .some((token) =>
      sourceCode.text
        .slice(Math.max(token.range[0], end), token.range[1])
        .includes("{"),
    )
}

/**
 * The rule `flowchart-no-unclosed-description-block`, described in
 * `docs/rules/flowchart-no-unclosed-description-block.md`: an `accDescr {`
 * block that no `}` closes, which the tree shows as a
 * `FlowchartAccDescrBlockStatement` whose `closed` is false.
 */
export const flowchartNoUnclosedDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unclosed" | "closedByOtherBrace" | SuggestionId
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr {` block without its closing `}`.",
      recommended: true,
      url: ruleDocsUrl("flowchart-no-unclosed-description-block"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      unclosed:
        "mermaid.js reads the rest of the diagram as the text of this unclosed `accDescr {` block, and sets an empty description.",
      closedByOtherBrace:
        "mermaid.js closes this `accDescr {` block at the `}` of a later `{`, and reads the lines up to it as the description.",
      closeAtLineEnd:
        "Close the block at the end of the line of the `{`: mermaid.js then reads the rest of that line as the text of the block, and the lines after it as statements.",
      closeAtTextEnd:
        "Close the block at the end of the text: mermaid.js then reads all the text after the `{` as the description.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      FlowchartAccDescrBlockStatement(node) {
        // The report marks where the block opens, `accDescr {`, its first two
        // tokens.
        const [keyword, brace, ...rest] = sourceCode.getTokens(node)
        if (keyword === undefined || brace === undefined) return
        const loc = { start: keyword.loc.start, end: brace.loc.end }
        if (!node.closed) {
          // The block runs to the end of the text.
          context.report({
            loc,
            messageId: "unclosed",
            suggest: closingSuggestions(
              sourceCode,
              brace,
              rest,
              sourceCode.text.length,
              false,
            ),
          })
          return
        }
        // The first `}` after the `{` closes the block, and is its last token.
        // When the text holds a `{` after the line of the block's `{`, and the
        // `}` does not stand alone on its line, it is the `}` of that `{`,
        // written for another statement.
        const closing = rest.at(-1)
        if (closing === undefined) return
        if (!closedByBraceOfOtherStatement(sourceCode, brace, rest, closing)) {
          return
        }
        context.report({
          loc,
          messageId: "closedByOtherBrace",
          suggest: closingSuggestions(
            sourceCode,
            brace,
            rest.slice(0, -1),
            node.range[1],
            true,
          ),
        })
      },
    }
  },
}
