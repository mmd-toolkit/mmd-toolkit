import { expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type {
  CheckedComment,
  CheckedDirective,
  CheckedNode,
  CheckedRoot,
  CheckedToken,
} from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import { copyOf, setField } from "./check-tree-recorded.ts"
import {
  commentOf,
  directiveOf,
  locationOf,
  tokenOf,
} from "./check-tree-trees.ts"

// The trees of a diagram with statements made by hand, for the tests of the
// check of such a diagram (gantt and journey): each tree is the header of the
// diagram, a line feed, and the statements that a test builds, with the tokens
// that the table of Tokens of the diagram gives them. The tests start from
// trees that satisfy every sentence (`VALID`), and each case changes one thing
// of such a tree so that it breaks the sentence the check implements.

/** What a test builds a tree with: the next token, a node, a directive, and a comment. */
export interface Kit {
  /** The token of the next `text` in the source, of the kind `type`. */
  token: (type: string, text: string) => CheckedToken
  /** A node of `type` over `range`, with the fields `fields`. */
  node: (
    type: string,
    range: TreeRange,
    fields: Record<string, unknown>,
  ) => CheckedNode
  /** The next directive `text` in the source, with its token. */
  directive: (text: string) => void
  /** The next diagram comment `text` in the source, with the mark `mark`. */
  comment: (mark: string | null, text: string) => void
}

/** A tree with its source. */
export interface Built {
  readonly source: string
  readonly tree: CheckedRoot
}

/** What the tree of a diagram type starts with: its header, the id of its type, and the type of its body. */
export interface DiagramOfTrees {
  readonly header: string
  readonly diagramType: string
  readonly bodyType: string
  /** The fields of the body made from the nodes that a test builds; the nodes are the list `body` where a diagram does not say otherwise. */
  readonly bodyFields?: (nodes: CheckedNode[]) => Record<string, unknown>
}

/**
 * The tree of `source`, which starts with the header of `diagram`. `makeStatements`
 * makes the tokens, in the order of the source, and returns the statements of
 * the body.
 */
export function buildTree(
  diagram: DiagramOfTrees,
  source: string,
  makeStatements: (kit: Kit) => CheckedNode[],
): Built {
  let cursor = 0
  const tokens: CheckedToken[] = []
  const directives: CheckedDirective[] = []
  const comments: CheckedComment[] = []
  const kit: Kit = {
    token(type, text) {
      const found = tokenOf(source, type, { text, from: cursor })
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
    comment(mark, text) {
      const found = commentOf(source, mark, { text, from: cursor })
      comments.push(found)
      cursor = found.range[1]
    },
  }
  const header = kit.token("Keyword", diagram.header)
  const body = makeStatements(kit)
  const last = tokens.filter((token) => token.type !== "Directive").at(-1)
  const whole: TreeRange = [0, source.length]
  return {
    source,
    tree: {
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
    },
  }
}

/** The first token of `tree` of the text `value`, which a case changes. */
export function tokenWith(tree: CheckedRoot, value: string): CheckedToken {
  const found = tree.tokens.find((token) => token.value === value)
  if (found === undefined) throw new Error(`no token ${value}`)
  return found
}

/** The first node of `tree` of the type `type`, or of the type `type` with `field` equal to `value`. */
export function nodeWith(
  tree: CheckedRoot,
  type: string,
  field?: string,
  value?: unknown,
): CheckedNode {
  const found = nodesOf(tree).find(
    (node) =>
      node.type === type && (field === undefined || node[field] === value),
  )
  if (found === undefined) throw new Error(`no ${type}`)
  return found
}

/** A case: a tree, one change of it, and the problem that the check must report. */
export interface BrokenCase {
  readonly name: string
  readonly built: () => Built
  /** Changes the copy of the tree; `source` is the text of the tree. */
  readonly mutate: (tree: CheckedRoot, source: string) => void
  /** A part of `where: message` of the problem that the change causes, where `#` stands for a range such as `6-11`. */
  readonly expected: string
}

/** The offset after the digits, a `-`, and digits that `text` has at `at`, or -1 where it has not a range such as `6-11` there. */
function endOfRangeAt(text: string, at: number): number {
  let end = at
  while (end < text.length && "0123456789".includes(text.charAt(end))) end++
  if (end === at || text.charAt(end) !== "-") return -1
  const digits = end + 1
  end = digits
  while (end < text.length && "0123456789".includes(text.charAt(end))) end++
  return end === digits ? -1 : end
}

/** Whether `text` holds `expected`, where each `#` of `expected` stands for a range such as `6-11`. */
function holds(text: string, expected: string): boolean {
  const [first = "", ...rest] = expected.split("#")
  for (
    let start = text.indexOf(first);
    start !== -1;
    start = text.indexOf(first, start + 1)
  ) {
    let at = start + first.length
    let matches = true
    for (const part of rest) {
      const end = endOfRangeAt(text, at)
      if (end === -1 || !text.startsWith(part, end)) {
        matches = false
        break
      }
      at = end + part.length
    }
    if (matches) return true
  }
  return false
}

/** Sets the kind of the first token of `tree` that has the text `value` to `type`. */
export function retype(value: string, type: string): BrokenCase["mutate"] {
  return (tree) => {
    setField(tokenWith(tree, value), "type", type)
  }
}

/** Sets the end of the range of the first node of the type `type` to `end` of the source. */
export function endAt(
  type: string,
  end: (tree: CheckedRoot, source: string) => number,
): BrokenCase["mutate"] {
  return (tree, source) => {
    const node = nodeWith(tree, type)
    setField(node, "range", [node.range[0], end(tree, source)])
  }
}

/** The length of the source. */
export function endOfSource(_tree: CheckedRoot, source: string): number {
  return source.length
}

/** The part of the message of the problem for a token of the kind `got` and the text `text` that the node `owner` writes itself, whose kind is `wanted`. */
export function ownKind(
  text: string,
  owner: string,
  got: string,
  wanted: string,
): string {
  return `${got} at # of ${JSON.stringify(text)} in ${owner} at #: the kind of a token that the node writes itself: "${got}", not "${wanted}"`
}

/** Registers a test for each case: the tree passes the check, and the tree after the change fails it with the problem the case expects. */
export function itFailsEach(cases: readonly BrokenCase[]): void {
  for (const testCase of cases) {
    it(`fails ${testCase.name}`, () => {
      const { source, tree } = testCase.built()
      expect(checkTree(source, tree)).toEqual([])
      const broken = copyOf(tree)
      testCase.mutate(broken, source)
      const problems = checkTree(source, broken)
      expect(
        problems.some((problem) =>
          holds(`${problem.where}: ${problem.message}`, testCase.expected),
        ),
        JSON.stringify(problems),
      ).toBe(true)
    })
  }
}
