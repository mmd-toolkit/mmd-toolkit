import type { TreeRange } from "../db-from-tree/tree.ts"
import { contains, diagramTokensOf } from "./invariants.ts"
import {
  DATA_BLOCK_NODE_TYPES,
  NODE_TYPES_WITH_TOKENS_OF_ANY_KIND,
  VALUE_NODE_TYPES,
} from "./node-types.ts"
import { KEYWORD_TEXTS } from "./keywords.ts"
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
 * The Tokens of each diagram's parser/docs/tokens/<diagram>.md: the tokens of a
 * diagram and the value nodes they lie in. A token of a value, `Identifier`,
 * `RawText`, `Numeric`, `String`, or `StringFragment`, lies in a value node. A
 * `Keyword` or `Punctuator` token lies in no value node, except the delimiters
 * of a data block, which the block's range covers, the tokens of the units of a
 * node that holds them whatever their kind, and the `:` at the start of a note
 * text. The `IgnoredSemicolon` tokens, which are no node's tokens, are left out
 * (parser/docs/tokens.md, Tokens).
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
 * `Numeric`, or `Keyword` token, which it would cut into fragments. Two
 * tokens of one of these kinds and one kind, with a cut and nothing else
 * between them, are the fragments of a cut token, as `A%%{init: {}}%%B` is
 * for the `Identifier` `AB`, and as `sub`, a directive, and `graph` are for the
 * `Keyword` `subgraph`: two `Keyword` tokens are fragments only when their
 * texts joined are the text of a keyword (`KEYWORD_TEXTS`); tokens that lie
 * apart, with whitespace between them, are units of their own, and so are
 * keywords that a diagram lets follow each other with nothing between
 * (`<<choice>>accDescr {}`). The `Punctuator` tokens are checked by
 * `checkPunctuatorsAreWhole()`, and the arrows and the shapes by the checks of
 * their nodes.
 */
export function checkTokensAreNotCut(
  root: CheckedRoot,
  problems: Problems,
): void {
  const tokens = diagramTokensOf(root)
  for (const [index, token] of tokens.entries()) {
    const previous = tokens[index - 1]
    if (
      previous !== undefined &&
      previous.type === token.type &&
      TOKEN_KINDS_THAT_ARE_NEVER_CUT.has(token.type) &&
      gluedByCuts(root, previous, token) &&
      (token.type !== "Keyword" ||
        isKeywordText(root, `${previous.value}${token.value}`))
    ) {
      problems.report(
        label(token),
        `a ${token.type} token is cut: ${label(previous)} and this are its fragments`,
      )
    }
  }
}

/** Whether `text` is the text of a `Keyword` token of the diagram of `root`, in any case. */
function isKeywordText(root: CheckedRoot, text: string): boolean {
  return (KEYWORD_TEXTS[root.body.type] ?? []).includes(text.toLowerCase())
}

/** Whether only directives and ignored `;` lie between the tokens `a` and `b`, with at least one, and nothing else, not even whitespace. */
export function gluedByCuts(
  root: CheckedRoot,
  a: CheckedToken,
  b: CheckedToken,
): boolean {
  let end = a.range[1]
  let cuts = 0
  for (const token of root.tokens) {
    if (token.range[0] < end) continue
    if (token.range[0] >= b.range[0]) break
    if (
      (token.type !== "Directive" && token.type !== "IgnoredSemicolon") ||
      token.range[0] !== end
    ) {
      return false
    }
    end = token.range[1]
    cuts++
  }
  return cuts > 0 && end === b.range[0]
}

/** The characters that a string of any diagram starts with, and ends with when it is closed. */
const STRING_QUOTES: ReadonlySet<string> = new Set(['"', "`"])

/**
 * parser/docs/tokens.md, A token that a directive cuts: a directive or an
 * ignored `;` inside a string cuts it into `StringFragment` tokens, not into
 * `String` tokens. So a `String` token starts with a quote, and one that a cut
 * is glued to is closed: it ends with the quote it starts with, and has
 * another character before it.
 */
export function checkStringsAreWhole(
  root: CheckedRoot,
  problems: Problems,
): void {
  const tokens = diagramTokensOf(root)
  for (const token of root.tokens) {
    if (token.type !== "String") continue
    const first = token.value.charAt(0)
    problems.expect(
      STRING_QUOTES.has(first),
      label(token),
      `a String token does not start with a quote: ${JSON.stringify(token.value)}`,
    )
    const next = tokens.find((other) => other.range[0] >= token.range[1])
    if (
      next === undefined ||
      (next.type !== "String" && next.type !== "StringFragment") ||
      !gluedByCuts(root, token, next)
    ) {
      continue
    }
    problems.expect(
      token.value.length > 1 && token.value.endsWith(first),
      label(token),
      `a String token that a cut is glued to is not closed: ${JSON.stringify(token.value)} and ${label(next)} are the fragments of one string`,
    )
  }
}
