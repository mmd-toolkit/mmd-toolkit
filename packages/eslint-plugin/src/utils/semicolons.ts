import type { Comment, Node, Root, Token } from "@mmd-toolkit/parser"
import { traverseNodes } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"

/**
 * What a `;` is, in the tree. A `;` is one of three things, and the tree tells
 * which: a `Punctuator` that separates statements, an `IgnoredSemicolon` that
 * mermaid.js leaves out of the Db (by the rule of `style` and `classDef` lines
 * of the specification), or a `Punctuator` that is a statement of its own, a
 * `FlowchartEmptyStatement`, which is a member of a subgraph. A `;` in the text
 * of a statement is none of them. The rules that move or remove a `;` ask here.
 */

/** Whether `token` is a `;` that separates statements, or an ignored `;`. */
export function isSemicolonToken(token: Token | Comment): boolean {
  return (
    (token.type === "Punctuator" && token.value === ";") ||
    token.type === "IgnoredSemicolon"
  )
}

/**
 * The `;` that mermaid.js ignores right after `statement`, on its line, or
 * null. It belongs to no other statement, so it goes with `statement`.
 */
export function ignoredSemicolonAfter(
  sourceCode: MermaidSourceCode,
  statement: Node,
): Token | null {
  const semicolon = sourceCode.getTokenAfter(statement)
  return semicolon?.type === "IgnoredSemicolon" &&
    semicolon.loc.start.line === statement.loc.end.line
    ? semicolon
    : null
}

/**
 * Whether the `;` at `index` in the tree `root` is a statement of its own, an
 * empty statement, which ends no statement before it (as after a description
 * block) and is a member of a subgraph.
 */
export function isStatementOfItsOwn(root: Root, index: number): boolean {
  let found = false
  traverseNodes(root, {
    enterNode(statement) {
      if (
        statement.type === "FlowchartEmptyStatement" &&
        statement.range[0] <= index &&
        index < statement.range[1]
      ) {
        found = true
      }
    },
    leaveNode() {
      // Each statement is checked on entering it.
    },
  })
  return found
}
