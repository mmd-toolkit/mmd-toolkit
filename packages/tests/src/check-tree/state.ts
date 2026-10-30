import type { Problems } from "./problems.ts"
import { label } from "./problems.ts"
import {
  checkTokensInValueNodes,
  tokensIn,
  nodeTokensIn,
  wordsIn,
} from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { nodesOf } from "./walk.ts"

/**
 * ast/state.md, StatePseudostateDefinitionStatement: the kind is the word of
 * its mark, the last `Keyword` token, written in any case.
 */
function checkStatePseudostate(
  root: CheckedRoot,
  statement: CheckedNode,
  problems: Problems,
): void {
  const mark = wordsIn(root, statement.range, "Keyword").at(-1)
  problems.expect(
    mark === `<<${String(statement.kind)}>>` ||
      mark === `[[${String(statement.kind)}]]`,
    label(statement),
    `the kind ${JSON.stringify(statement.kind)} is not that of the mark ${JSON.stringify(mark)}`,
  )
}

/**
 * ast/state.md, StateNoteStatement: the position is the word before `of` in
 * the statement: the second `Keyword` token, and `of` is the third (each word
 * of `left of` and `right of` is a token of its own), written in any case.
 */
function checkStateNote(
  root: CheckedRoot,
  statement: CheckedNode,
  problems: Problems,
): void {
  const words = wordsIn(root, statement.range, "Keyword")
  problems.expectEqual(
    words.slice(1, 3),
    [String(statement.position), "of"],
    label(statement),
    "the position, which is the word before `of`",
  )
}

/**
 * ast/state.md: checks what the state document states about its tree beyond
 * the conditions of every tree (ast.md): the values of the leaf nodes are
 * their written texts, the tokens of values lie in value nodes, and the fixed
 * words and marks of a node are its tokens: `[*]` and `--`, the kind of a
 * pseudostate, the position of a note, the value of a direction statement, and
 * the `}` of a closed description block.
 */
export function checkStateTree(root: CheckedRoot, problems: Problems): void {
  const nodes = nodesOf(root)
  checkTokensInValueNodes(root, problems)
  for (const node of nodes) {
    switch (node.type) {
      case "StateTerminal":
      case "StateDividerStatement":
        problems.expectEqual(
          nodeTokensIn(root, node.range).map((token) => [
            token.type,
            token.value,
          ]),
          [["Punctuator", node.type === "StateTerminal" ? "[*]" : "--"]],
          label(node),
          "the tokens",
        )
        break
      case "StringLiteral":
        // ast/state.md: a string of this diagram is always closed.
        problems.expect(node.closed === true, label(node), "is not closed")
        break
      case "StatePseudostateDefinitionStatement":
        checkStatePseudostate(root, node, problems)
        break
      case "StateNoteStatement":
        checkStateNote(root, node, problems)
        break
      case "StateHideEmptyDescriptionStatement":
        problems.expectEqual(
          wordsIn(root, node.range, "Keyword"),
          ["hide", "empty", "description"],
          label(node),
          "the keywords, one token for each word",
        )
        break
      case "StateDirectionStatement":
        problems.expectEqual(
          wordsIn(root, node.range, "Keyword"),
          ["direction", String(node.direction).toLowerCase()],
          label(node),
          "the keywords",
        )
        break
      case "StateAccDescrBlockStatement": {
        const last = tokensIn(root, node.range).at(-1)
        problems.expectEqual(
          last?.type === "Punctuator" && last.value === "}",
          node.closed,
          label(node),
          "closed, which is whether it ends with }",
        )
        break
      }
      default:
        break
    }
  }
}
