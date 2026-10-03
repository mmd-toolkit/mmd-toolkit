import { readFileSync } from "node:fs"
import path from "node:path"
import { checkTree } from "../src/check-tree/index.ts"
import type {
  CheckedNode,
  CheckedRoot,
  CheckedToken,
  TreeProblem,
} from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot } from "../src/index.ts"

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

/** Whether one of the problems says `message`, in its place and its message together. */
export function says(
  problems: readonly TreeProblem[],
  message: string,
): boolean {
  return problems.some((problem) =>
    `${problem.where}: ${problem.message}`.includes(message),
  )
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
