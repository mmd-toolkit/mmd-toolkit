import type { Comment } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { textWithoutDirectives } from "../utils/directive-free-text.ts"

/**
 * The rule `class-no-inline-comment`, described in
 * `docs/rules/class-no-inline-comment.md`: a comment of `Root.comments` that
 * has text before it on its line (the header keyword included) and a token
 * after it in the text, where neither counts a directive:
 * mermaid.js removes directives before it reads comments. The comment then
 * takes the line break after it, so that line break does not end the statement
 * (the known divergence `comment-takes-line-break`).
 */
export const classNoInlineComment: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "inline"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a comment after other text on its line.",
      recommended: false,
      url: ruleDocsUrl("class-no-inline-comment"),
    },
    schema: [],
    messages: {
      inline:
        "mermaid.js reads the line break after this comment as part of the comment, so that line break does not end the statement; put the comment on a line of its own.",
    },
  },
  create(context) {
    const { sourceCode } = context

    /**
     * Whether text other than whitespace and directives stands before
     * `comment` on its line. It reads the characters of the line, not the
     * token before the comment: a comment line inside a string splits the
     * string, and the part before it ends with the line break, so its `loc` ends
     * on the line of the comment.
     */
    function hasTextBefore(comment: Comment): boolean {
      const lineStart = comment.range[0] - comment.loc.start.column
      return (
        textWithoutDirectives(
          sourceCode,
          lineStart,
          comment.range[0],
        ).trim() !== ""
      )
    }

    return {
      ClassDiagram() {
        for (const comment of sourceCode.getAllComments()) {
          if (!hasTextBefore(comment)) continue
          const after = sourceCode.getTokenAfter(comment, {
            filter: (token) => token.type !== "Directive",
          })
          if (after === null) continue
          context.report({ loc: comment.loc, messageId: "inline" })
        }
      },
    }
  },
}
