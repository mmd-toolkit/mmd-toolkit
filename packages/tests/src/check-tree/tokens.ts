import type { TreeRange } from "../db-from-tree/tree.ts"
import { contains, diagramTokensOf } from "./invariants.ts"
import {
  DATA_BLOCK_NODE_TYPES,
  NODE_TYPES_WITH_TOKENS_OF_ANY_KIND,
  VALUE_NODE_TYPES,
} from "./node-types.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import type { CheckedNode, CheckedRoot, CheckedToken } from "./types.ts"
import { isNode, nodesOf } from "./walk.ts"

/** The tokens of `root` that lie in `range`. */
export function tokensIn(root: CheckedRoot, range: TreeRange): CheckedToken[] {
  return root.tokens.filter((token) => contains(range, token.range))
}

/** The tokens of `root` in `range`, other than the `Directive` and `IgnoredSemicolon` tokens: the tokens of the node that has the range. */
export function nodeTokensIn(
  root: CheckedRoot,
  range: TreeRange,
): CheckedToken[] {
  return tokensIn(root, range).filter(
    (token) => token.type !== "Directive" && token.type !== "IgnoredSemicolon",
  )
}

/** The values of the tokens of `root` in `range` of the kind `kind`, in lower case, for the fixed words that the lexers read case-insensitively. */
export function wordsIn(
  root: CheckedRoot,
  range: TreeRange,
  kind: string,
): string[] {
  return tokensIn(root, range)
    .filter((token) => token.type === kind)
    .map((token) => token.value.toLowerCase())
}

/**
 * ast/state.md, StateNoteStatement: the text of a note on one line with two
 * whitespace characters before its `:` starts with a `Punctuator` token of its
 * own, that `:`.
 */
function textsFromColon(
  root: CheckedRoot,
  nodes: readonly CheckedNode[],
): CheckedNode[] {
  const texts: CheckedNode[] = []
  for (const node of nodes) {
    if (node.type !== "StateNoteStatement" || !isNode(node.text)) continue
    const first = tokensIn(root, node.text.range)[0]
    if (first?.type === "Punctuator" && first.value === ":") {
      texts.push(node.text)
    }
  }
  return texts
}

/**
 * The Tokens of each diagram's ast/<diagram>.md: the tokens of a diagram and
 * the value nodes they lie in. A token of a value, `Identifier`, `RawText`,
 * `Numeric`, `String`, or `StringFragment`, lies in a value node. A `Keyword`
 * or `Punctuator` token lies in no value node, except the delimiters of a data
 * block, which the block's range covers, the tokens of the units of a node that
 * holds them whatever their kind, and the `:` at the start of a note text. The
 * `IgnoredSemicolon` tokens, which are no node's tokens, are left out
 * (ast.md, Tokens).
 */
export function checkTokensInValueNodes(
  root: CheckedRoot,
  problems: Problems,
): void {
  const nodes = nodesOf(root)
  const valueNodes = nodes.filter((node) => VALUE_NODE_TYPES.has(node.type))
  const fromColon = textsFromColon(root, nodes)
  for (const token of diagramTokensOf(root)) {
    const holders = valueNodes.filter((node) =>
      contains(node.range, token.range),
    )
    const where = `${label(token)} of ${JSON.stringify(token.value)}`
    const isValue =
      token.type === "Identifier" ||
      token.type === "RawText" ||
      token.type === "Numeric" ||
      token.type === "String" ||
      token.type === "StringFragment"
    if (isValue) {
      problems.expect(holders.length > 0, where, "lies in no value node")
    } else if (token.type === "Keyword" || token.type === "Punctuator") {
      const allowed = holders.every(
        (node) =>
          NODE_TYPES_WITH_TOKENS_OF_ANY_KIND.has(node.type) ||
          (token.type === "Punctuator" &&
            DATA_BLOCK_NODE_TYPES.has(node.type)) ||
          (fromColon.includes(node) && token.range[0] === node.range[0]),
      )
      problems.expect(
        allowed,
        where,
        `lies in the value node ${holders.map(label).join(", ")}`,
      )
    }
  }
}

/** The kinds of token that a directive or an ignored `;` never cuts: only a `String` and a `RawText` token can hold one. */
const TOKEN_KINDS_THAT_ARE_NEVER_CUT: ReadonlySet<string> = new Set([
  "Identifier",
  "Numeric",
  "Keyword",
])

/**
 * parser/docs/tokens.md, A token that a directive cuts: a directive or an
 * ignored `;` lies in a `String` or a `RawText` token, and in no `Identifier`,
 * `Numeric`, or `Keyword` token, which it would cut into fragments. A cut
 * with no whitespace on either side between two tokens of one of these kinds
 * and one kind is a cut inside a token, as `A%%{init: {}}%%B` is for the
 * `Identifier` `AB`; tokens of the kind that lie apart, with whitespace
 * between them, are units of their own. (A `Punctuator` token is not checked
 * here: two of them may follow each other with nothing between, as the `,` of
 * `a,,b` do; the arrows and the other tokens of one unit are checked by the
 * checks of their nodes.)
 */
export function checkTokensAreNotCut(
  root: CheckedRoot,
  problems: Problems,
): void {
  let previous: CheckedToken | null = null
  let cuts: CheckedToken[] = []
  for (const token of root.tokens) {
    if (token.type === "Directive" || token.type === "IgnoredSemicolon") {
      cuts.push(token)
      continue
    }
    if (
      previous !== null &&
      cuts.length > 0 &&
      previous.type === token.type &&
      TOKEN_KINDS_THAT_ARE_NEVER_CUT.has(token.type)
    ) {
      let end = previous.range[1]
      for (const cut of cuts) {
        if (cut.range[0] !== end) break
        end = cut.range[1]
      }
      if (end === token.range[0] && cuts[0]?.range[0] === previous.range[1]) {
        problems.report(
          label(token),
          `a ${token.type} token is cut by ${label(cuts[0])}: ${label(previous)} and this are its fragments`,
        )
      }
    }
    previous = token
    cuts = []
  }
}
