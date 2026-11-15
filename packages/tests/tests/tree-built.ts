import type { TreeNode, TreeRoot, TreeRange } from "../src/db-from-tree/tree.ts"
import type { Comment, Directive, Token, TokenKind } from "@mmd-toolkit/ast"
import { commentOf, directiveOf, locationOf, tokenOf } from "./tree-pieces.ts"

// Trees made by hand from explicit source occurrences for the Db tests.

/** A recorded node whose diagram-specific fields are read or built by name. */
export interface RecordedNode extends TreeNode {
  readonly [field: string]: unknown
}

/** What a test builds a tree with: the next token, a node, a directive, and a comment. */
export interface Kit {
  /** The token of the next `text`, of the kind `type`; `from` explicitly locates a repeated spelling such as retained whitespace. */
  token: (type: TokenKind, text: string, from?: number) => Token
  /** A node of `type` over `range`, with the fields `fields`. */
  node: (
    type: string,
    range: TreeRange,
    fields: Record<string, unknown>,
  ) => RecordedNode
  /** The next directive `text` in the source, with its token. */
  directive: (text: string) => void
  /** The next diagram comment, with an explicit value when delimiters or cuts change it. */
  comment: (mark: Comment["mark"], text: string, value?: string) => void
}

/** A tree with its source. */
export interface Built {
  readonly source: string
  readonly tree: TreeRoot
}

/** What the tree of a diagram type starts with: its header, the id of its type, and the type of its body. */
export interface DiagramOfTrees {
  readonly header: string
  readonly diagramType: string
  readonly bodyType: string
  /** The fields of the body made from the nodes that a test builds; the nodes are the list `body` where a diagram does not say otherwise. */
  readonly bodyFields?: (nodes: RecordedNode[]) => Record<string, unknown>
}

/**
 * The tree of `source`, which starts with the header of `diagram`. `makeStatements`
 * makes the tokens, in the order of the source, and returns the statements of
 * the body.
 */
export function buildTree(
  diagram: DiagramOfTrees,
  source: string,
  makeStatements: (kit: Kit) => RecordedNode[],
): Built {
  let cursor = 0
  const tokens: Token[] = []
  const directives: Directive[] = []
  const comments: Comment[] = []
  const kit: Kit = {
    token(type, text, from) {
      const found = tokenOf(source, type, { text, from: from ?? cursor })
      tokens.push(found)
      cursor = found.range[1]
      return found
    },
    node(type, range, fields) {
      return { type, range, loc: locationOf(source, range), ...fields }
    },
    directive(text) {
      directives.push(directiveOf(source, { text, from: cursor }))
      tokens.push(tokenOf(source, "Directive", { text, from: cursor }))
      cursor += text.length
    },
    comment(mark, text, value) {
      const found = commentOf(source, mark, { text, from: cursor }, value)
      comments.push(found)
      cursor = found.range[1]
    },
  }
  const header = kit.token("Keyword", diagram.header)
  const body = makeStatements(kit)
  const last = tokens.filter((token) => token.type !== "Directive").at(-1)
  const whole: TreeRange = [0, source.length]
  const tree: TreeRoot & RecordedNode = {
    type: "Root",
    diagramType: diagram.diagramType,
    range: whole,
    loc: locationOf(source, whole),
    body: kit.node(
      diagram.bodyType,
      [header.range[0], last?.range[1] ?? header.range[1]],
      diagram.bodyFields === undefined ? { body } : diagram.bodyFields(body),
    ),
    frontmatter: null,
    comments,
    directives,
    tokens,
  }
  return { source, tree }
}
