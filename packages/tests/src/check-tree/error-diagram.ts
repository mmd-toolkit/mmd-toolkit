import { isWhitespace } from "../db-from-tree/characters.ts"
import { diagramTokensOf } from "./invariants.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import type { CheckedRoot } from "./types.ts"

/**
 * ast.md, ErrorDiagram: checks how the `error` pseudo-diagram splits its text
 * into tokens. Its tokens, besides the `Directive`, `IgnoredSemicolon`, and
 * frontmatter tokens, are `RawText` tokens, the maximal runs of characters that
 * are not whitespace or line terminators and lie outside directives, comment
 * regions, and the `;` that the line rule ignores. Together with the first
 * invariant, by which every such character is in a token, three conditions say
 * that: every token is of the kind `RawText`, no token holds whitespace or a
 * line terminator, and no two tokens touch, since a directive or an ignored `;`
 * lies between the two runs it cuts. That every comment is outside the tokens
 * holds for every tree (Invariants). Tokens of other diagrams do not satisfy
 * these conditions.
 */
export function checkErrorDiagramTokens(
  root: CheckedRoot,
  problems: Problems,
): void {
  const tokens = diagramTokensOf(root)
  tokens.forEach((token, index) => {
    const where = label(token)
    problems.expectEqual(token.type, "RawText", where, "kind")
    problems.expect(
      !Array.from(token.value, (character) =>
        isWhitespace(character.charCodeAt(0)),
      ).includes(true),
      where,
      "holds whitespace or a line terminator",
    )
    const before = tokens[index - 1]
    if (before !== undefined) {
      problems.expect(
        token.range[0] > before.range[1],
        where,
        "touches the token before it",
      )
    }
  })
}
