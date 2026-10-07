import { isWhitespaceAt } from "../db-from-tree/characters.ts"
import { contains } from "./invariants.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import { nodeTokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot, CheckedToken } from "./types.ts"
import { childNodesOf, isNode, nodesOf } from "./walk.ts"

// ast.md, Nodes: a field that may be null is null where the node writes
// nothing for it. The text of such a field lies in the tokens of its node, and
// a token of a value that no node holds is reported where tokens are placed
// (`checkTokensInValueNodes()` of `tokens.ts`), so that a field whose node is
// made null is found there. This check is for the fields where that does not
// find it: what the node writes for the field is a keyword or a punctuator of
// the node itself, a text with no token of a value, or the braces of a body,
// which a list holds with no node in it. Each rule below reads the tokens of
// the node outside its child nodes, its own tokens, and decides from them
// whether the node writes something for its field.

/** What a rule reads: the node, and the tokens of it that no child node holds. */
interface OwnTokens {
  readonly text: string
  readonly root: CheckedRoot
  readonly node: CheckedNode
  readonly own: readonly CheckedToken[]
}

/** The text of the tokens of `node` that no child node of it holds, `Directive` and `IgnoredSemicolon` tokens left out. */
function ownTokensOf(
  root: CheckedRoot,
  node: CheckedNode,
): readonly CheckedToken[] {
  const children = childNodesOf(node)
  return nodeTokensIn(root, node.range).filter(
    (token) => !children.some((child) => contains(child.range, token.range)),
  )
}

/** Whether `token` is a `Punctuator` with the text `value`. */
function isPunctuator(token: CheckedToken, value: string): boolean {
  return token.type === "Punctuator" && token.value === value
}

/** Whether `token` is a `Keyword` of the word `word`, written in any case. */
function isKeyword(token: CheckedToken, word: string): boolean {
  return token.type === "Keyword" && token.value.toLowerCase() === word
}

/**
 * The first own token after the first own token that starts at or after `from`
 * and for which `isMark` holds, such as the token after the `:` of a
 * statement; none when there is no such mark or no token after it.
 */
function tokenAfterMark(
  own: readonly CheckedToken[],
  isMark: (token: CheckedToken) => boolean,
  from = 0,
): CheckedToken | null {
  const mark = own.findIndex((token) => token.range[0] >= from && isMark(token))
  return mark === -1 ? null : (own[mark + 1] ?? null)
}

/**
 * The first own token before the `{` of the body, other than the tokens that
 * `isOwnWord` says are words of the node itself. The `{` of the body is the
 * last own `{`; a node with no body has no such token, and the braces of its
 * own tokens are those of the body that it should have, which its field `body`
 * reports.
 */
function tokenBeforeBody(
  { node, own }: OwnTokens,
  isOwnWord: (token: CheckedToken, index: number) => boolean,
): CheckedToken | null {
  const open = own.filter((token) => isPunctuator(token, "{")).at(-1)
  const before =
    node.body === null || open === undefined
      ? own.filter((token) => !isBodyBrace(token))
      : own.slice(0, own.indexOf(open))
  return before.find((token, index) => !isOwnWord(token, index)) ?? null
}

/** Whether `token` is a brace of a body. */
function isBodyBrace(token: CheckedToken): boolean {
  return isPunctuator(token, "{") || isPunctuator(token, "}")
}

/**
 * state.md, The note contexts: with two or more whitespace characters before
 * the `:` of a note on one line, the `:` is a character of the text. The
 * whitespace before it is counted past the directives and the `;` that the
 * line rule ignores, which lie between two characters of the diagram text.
 */
function whitespaceBefore(
  text: string,
  root: CheckedRoot,
  offset: number,
): number {
  /** The `Directive` or `IgnoredSemicolon` token that ends at `end`. */
  function cutEndingAt(end: number): CheckedToken | undefined {
    return root.tokens.find(
      (token) =>
        (token.type === "Directive" || token.type === "IgnoredSemicolon") &&
        token.range[1] === end,
    )
  }

  let count = 0
  let position = offset
  while (position > 0) {
    const cut = cutEndingAt(position)
    if (cut !== undefined) {
      position = cut.range[0]
    } else if (isWhitespaceAt(text, position - 1)) {
      count++
      position--
    } else {
      break
    }
  }
  return count
}

/** How a rule finds what its node writes for the field. */
interface NullFieldRule {
  readonly field: string
  /**
   * A text field (`text`) or the body of a list (`braces`): a list that the
   * node writes with `{` and `}` is not null, also when it is empty, so a list
   * that is not null is checked for its `{` as well.
   */
  readonly kind: "text" | "braces"
  /** The token of the node that is written for the field, outside the child nodes; none when the node writes nothing for it. */
  readonly writes: (reading: OwnTokens) => CheckedToken | null
  /** How the token belongs to the field, for the message: the sentence of the specification that says it. */
  readonly belongs: string
}

/** The rule of the field `body` or `members` that a node writes with braces. */
function bracesRule(field: string, belongs: string): NullFieldRule {
  return {
    field,
    kind: "braces",
    writes: ({ own }) => own.find((token) => isPunctuator(token, "{")) ?? null,
    belongs,
  }
}

/** The own `Keyword` `state` that a statement starts with, if it starts with it. */
function startsWithState(
  { node }: OwnTokens,
  token: CheckedToken,
  index: number,
): boolean {
  return (
    index === 0 && token.range[0] === node.range[0] && isKeyword(token, "state")
  )
}

/**
 * The fields that a node can write with tokens of its own and no value, by
 * node type, each with the sentence of the specification that says what is
 * written. `tests/check-tree-fields.test.ts` makes each of them null in a
 * recorded tree where it is written, and requires the check to report it.
 */
export const NULL_FIELD_RULES: Readonly<
  Record<string, readonly NullFieldRule[]>
> = {
  ClassDeclaration: [
    bracesRule(
      "members",
      "opens the body of the class (ast/class.md, ClassDeclaration: the member lines between `{` and `}`; null without a body)",
    ),
  ],
  ClassMemberStatement: [
    {
      field: "member",
      kind: "text",
      writes: ({ own }) =>
        tokenAfterMark(own, (token) => isPunctuator(token, ":")),
      belongs:
        "follows the `:` of the statement (ast/class.md, ClassMemberStatement: the member after the `:`)",
    },
  ],
  SequenceMessageStatement: [
    {
      field: "text",
      kind: "text",
      writes: ({ node, own }) =>
        tokenAfterMark(
          own,
          (token) => isPunctuator(token, ":"),
          isNode(node.to) ? node.to.range[1] : 0,
        ),
      belongs:
        "follows the `:` of the message (ast/sequence.md, SequenceMessageStatement: the text after the `:`)",
    },
  ],
  SequenceParticipantStatement: [
    {
      field: "alias",
      kind: "text",
      writes: ({ own }) =>
        tokenAfterMark(own, (token) => isKeyword(token, "as")),
      belongs:
        "follows the `as` of the participant (ast/sequence.md, SequenceParticipantStatement: the text after `as`)",
    },
  ],
  StateCompositeStatement: [
    {
      field: "textBeforeBody",
      kind: "text",
      writes: (reading) =>
        tokenBeforeBody(reading, (token, index) =>
          startsWithState(reading, token, index),
        ),
      belongs:
        "is text before the `{` of the body that mermaid.js does not read (ast/state.md, StateCompositeStatement: textBeforeBody)",
    },
    bracesRule(
      "body",
      "opens the body of the state (ast/state.md, StateCompositeStatement: the statements between `{` and `}`; null without a body)",
    ),
  ],
  StateAliasDefinitionStatement: [
    {
      field: "textBeforeBody",
      kind: "text",
      writes: (reading) =>
        tokenBeforeBody(
          reading,
          (token, index) =>
            startsWithState(reading, token, index) ||
            isKeyword(token, "as") ||
            isPunctuator(token, ":"),
        ),
      belongs:
        "is text before the `{` of the body that mermaid.js does not read (ast/state.md, StateAliasDefinitionStatement: textBeforeBody)",
    },
    bracesRule(
      "body",
      "opens the body of the state (ast/state.md, StateAliasDefinitionStatement: the statements between `{` and `}`; null without a body)",
    ),
  ],
  StateNoteStatement: [
    {
      field: "text",
      kind: "text",
      writes: ({ text, root, own }) =>
        own.find(
          (token) =>
            isPunctuator(token, ":") &&
            whitespaceBefore(text, root, token.range[0]) >= 2,
        ) ?? null,
      belongs:
        "follows two or more whitespace characters and so starts the text (diagrams/state.md, The note contexts: with two or more whitespace characters before the `:`, the `:` is a character of the text)",
    },
  ],
}

/**
 * Checks that a field of the table that may be null is null exactly where the
 * node writes something for it (see the rules of {@link NULL_FIELD_RULES}).
 */
export function checkNullFields(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  for (const node of nodesOf(root)) {
    const rules = NULL_FIELD_RULES[node.type]
    if (rules === undefined) continue
    const own = ownTokensOf(root, node)
    for (const rule of rules) {
      const written = rule.writes({ text, root, node, own })
      const value = node[rule.field]
      if (value === null && written !== null) {
        problems.report(
          label(node),
          `the field ${rule.field} is null, but the ${written.type} ${JSON.stringify(written.value)} at ${written.range[0]}-${written.range[1]} ${rule.belongs}`,
        )
      } else if (value !== null && written === null && rule.kind === "braces") {
        problems.report(
          label(node),
          `the field ${rule.field} is a list, but the node has no \`{\` that ${rule.belongs}`,
        )
      }
    }
  }
}
