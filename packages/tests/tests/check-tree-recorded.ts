import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type {
  CheckedNode,
  CheckedRoot,
  CheckedToken,
  TreeProblem,
} from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot, loadFixtures } from "../src/index.ts"
import { withoutTokenWhitespace } from "./check-tree-token-edits.ts"
import type { TokenSide } from "./check-tree-token-edits.ts"

// Tests of the check of a tree that break a recorded tree: the base is the
// `ast.json` of a named fixture, a mutation changes one thing of a copy of it,
// and the check must report the condition that the mutation breaks.

/** A fixture's input and its recorded tree. */
export interface RecordedTree {
  readonly input: string
  readonly tree: CheckedRoot
}

/** The input and the recorded tree of the fixture `name` of `diagram`. */
export function recordedTree(diagram: DiagramType, name: string): RecordedTree {
  const directory = path.join(getFixturesRoot(), diagram, name)
  return {
    input: readFileSync(path.join(directory, "input.mmd"), "utf8"),
    // ast.json is JSON of the tree, as the check of a tree reads it.
    tree: JSON.parse(
      readFileSync(path.join(directory, "ast.json"), "utf8"),
    ) as CheckedRoot,
  }
}

/** A recorded tree of the corpus, with its name (`diagram/fixture`), its input, and its `ast.json` text. */
export interface CorpusTree {
  readonly name: string
  readonly input: string
  readonly json: string
}

const CORPUS_DIAGRAMS: readonly DiagramType[] = [
  "common",
  "flowchart",
  "sequence",
  "class",
  "state",
  "er",
  "gantt",
  "journey",
  "requirement",
  "mindmap",
  "timeline",
  "sankey",
  "xychart",
  "quadrant",
  "block",
  "kanban",
]

/**
 * The prefixes of the node types of the diagram types that are new and whose
 * trees are not recorded yet: a test that needs a recorded tree of every node
 * type leaves these types out. Remove a prefix once the trees of its diagram
 * type are recorded; the list stays empty between two diagram types.
 */
export const NODE_TYPE_PREFIXES_WITHOUT_RECORDED_TREES: readonly string[] = [
  "C4",
]

/** Whether a recorded tree may have a node of the type `type`: false for the types of a diagram type whose trees are not recorded yet. */
export function mayHaveRecordedTrees(type: string): boolean {
  return !NODE_TYPE_PREFIXES_WITHOUT_RECORDED_TREES.some((prefix) =>
    type.startsWith(prefix),
  )
}

let corpusTrees: Promise<readonly CorpusTree[]> | undefined

/**
 * Every recorded tree of the corpus, in the order of the diagrams and of the
 * fixtures of each, read once for the tests of a file. A test that breaks a
 * kind of node takes the first of them that has one: any recorded tree that
 * has the kind will do, and the question the test asks does not depend on
 * which. A question whose answer depends on the tree names its fixture instead.
 */
export function recordedTreesOfCorpus(): Promise<readonly CorpusTree[]> {
  corpusTrees ??= readCorpusTrees()
  return corpusTrees
}

/** Reads the `ast.json` of every fixture of the corpus that has one. */
async function readCorpusTrees(): Promise<CorpusTree[]> {
  const trees: CorpusTree[] = []
  for (const diagram of CORPUS_DIAGRAMS) {
    for (const fixture of await loadFixtures(diagram)) {
      const file = path.join(
        getFixturesRoot(),
        diagram,
        fixture.name,
        "ast.json",
      )
      if (!existsSync(file)) continue
      trees.push({
        name: `${diagram}/${fixture.name}`,
        input: fixture.input,
        json: readFileSync(file, "utf8"),
      })
    }
  }
  return trees
}

/** A copy of `tree` that a mutation can change without changing the recorded one. */
export function copyOf(tree: CheckedRoot): CheckedRoot {
  return JSON.parse(JSON.stringify(tree)) as CheckedRoot
}

/** The first node of `root` of the type `type`. */
export function firstNode(root: CheckedRoot, type: string): CheckedNode {
  const node = nodesOf(root).find((candidate) => candidate.type === type)
  if (node === undefined) throw new Error(`the tree has no ${type}`)
  return node
}

/** The first token of `root` inside `node` for which `matches` holds. */
export function firstTokenIn(
  root: CheckedRoot,
  node: CheckedNode,
  matches: (token: CheckedToken) => boolean = () => true,
): CheckedToken {
  const token = root.tokens.find(
    (candidate) =>
      node.range[0] <= candidate.range[0] &&
      candidate.range[1] <= node.range[1] &&
      matches(candidate),
  )
  if (token === undefined) throw new Error(`${node.type} has no such token`)
  return token
}

/** Sets `field` of `target`, a node or a token, to `value`. */
export function setField(target: object, field: string, value: unknown): void {
  Object.assign(target, { [field]: value })
}

/** A part of a token: its kind, and where it starts and ends, counted from the start of the token. */
export type TokenPart = readonly [kind: string, from: number, to: number]

/**
 * Replaces `token` of `root`, which lies on one line, by the tokens of
 * `parts`, with the value, the range, and the `loc` that their characters have.
 */
export function replaceToken(
  root: CheckedRoot,
  token: CheckedToken,
  parts: readonly TokenPart[],
): void {
  const pieces = parts.map(([kind, from, to]): CheckedToken => {
    const { start } = token.loc
    return {
      type: kind,
      value: token.value.slice(from, to),
      range: [token.range[0] + from, token.range[0] + to],
      loc: {
        start: { line: start.line, column: start.column + from },
        end: { line: start.line, column: start.column + to },
      },
    }
  })
  const tokens = root.tokens.flatMap((candidate) =>
    candidate === token ? pieces : [candidate],
  )
  Object.assign(root, { tokens })
}

/** Whether one of the problems says `message`, in its place and its message together. */
export function says(
  problems: readonly TreeProblem[],
  message: string,
): boolean {
  return problems.some((problem) =>
    `${problem.where}: ${problem.message}`.includes(message),
  )
}

/** Sets the kind of the first token inside the first node of the type `type` that is of the kind `from` (any kind where `from` is null) and has the text `value` (any text where it is null) to `to`. */
export function retypeIn(
  type: string,
  from: string | null,
  value: string | null,
  to: string,
): MutationCase["mutate"] {
  return (root) => {
    setField(
      firstTokenIn(
        root,
        firstNode(root, type),
        (token) =>
          (from === null || token.type === from) &&
          (value === null || token.value === value),
      ),
      "type",
      to,
    )
  }
}

/** Sets the end of the range of the first node of the type `type` to `end(root)`. */
export function setEnd(
  type: string,
  end: (root: CheckedRoot) => number,
): MutationCase["mutate"] {
  return (root) => {
    const node = firstNode(root, type)
    setField(node, "range", [node.range[0], end(root)])
  }
}

/** One case: a mutation of the recorded tree of a fixture and the problem that the check must report for it. */
export interface MutationCase {
  readonly name: string
  readonly fixture: string
  /** Changes one thing of the copy of the tree. */
  readonly mutate: (root: CheckedRoot) => void
  /** A part of `where: message` of the problem that the mutation causes. */
  readonly expected: string
}

/** The problems of the check for the unmutated tree, and for the tree after `mutation`. */
export function problemsOf(
  diagram: DiagramType,
  mutation: MutationCase,
): { base: TreeProblem[]; mutated: TreeProblem[] } {
  const { input, tree } = recordedTree(diagram, mutation.fixture)
  const copy = copyOf(tree)
  mutation.mutate(copy)
  return { base: checkTree(input, tree), mutated: checkTree(input, copy) }
}

/** A case: the whitespace taken off one side of a token of a recorded tree, and the problems of the check for the tree so made. */
export interface WhitespaceCase {
  readonly name: string
  readonly diagram: DiagramType
  /** The fixture whose recorded tree is edited. */
  readonly fixture: string
  /** The first token of the fixture of this kind and this text, which loses the whitespace. */
  readonly token: { readonly type: string; readonly value: string }
  /** The side of the token that loses its whitespace: the start is next to the cut before it, the end next to the cut after it. */
  readonly side: TokenSide
  /** The problems of the check, in order. */
  readonly problems: readonly TreeProblem[]
}

/** The tree of `testCase` without the whitespace, and the problems of the check for the tree before the edit. */
function editedTreeOf(testCase: WhitespaceCase): {
  input: string
  base: TreeProblem[]
  edited: CheckedRoot
} {
  const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
  const index = tree.tokens.findIndex(
    (token) =>
      token.type === testCase.token.type &&
      token.value === testCase.token.value,
  )
  const edited = withoutTokenWhitespace(
    input,
    JSON.stringify(tree),
    index,
    testCase.side,
  )
  if (edited === null) {
    throw new Error(
      `no ${testCase.token.type} ${JSON.stringify(testCase.token.value)} with whitespace at its ${testCase.side}`,
    )
  }
  return { input, base: checkTree(input, tree), edited }
}

/** Runs each case: the tree of the fixture has no problem, and the edited tree has `problems`. */
export function expectWhitespaceCases(cases: readonly WhitespaceCase[]): void {
  for (const testCase of cases) {
    it(testCase.name, () => {
      const { input, base, edited } = editedTreeOf(testCase)
      expect(base).toEqual([])
      expect(checkTree(input, edited)).toEqual(testCase.problems)
    })
  }
}
