/**
 * Runs the check of a tree on one recorded tree: `checkTree`, and the check
 * that every node type of the tree is classified as a value node or not.
 *
 * `tools/recorded-trees.ts` follows the imports of this module to find the
 * files that decide its result, and checks every recorded tree when one of
 * them changes. So this module imports nothing but the built-in modules of
 * Node.js and relative paths: the version of a package that it imported could
 * change the result without changing a file that it reaches.
 */
import { readFileSync } from "node:fs"
import { checkTree } from "../../packages/tests/src/check-tree/index.ts"
import {
  STRUCTURE_NODE_TYPES,
  VALUE_NODE_TYPES,
} from "../../packages/tests/src/check-tree/node-types.ts"
import type {
  CheckedRoot,
  TreeProblem,
} from "../../packages/tests/src/check-tree/types.ts"
import { nodesOf } from "../../packages/tests/src/check-tree/walk.ts"

/** The files of a recorded tree. */
export interface RecordedTreeFiles {
  /** The absolute path of the input, `input.mmd`. */
  readonly input: string
  /** The absolute path of the tree, `ast.json`. */
  readonly tree: string
}

/** What the check found in a recorded tree. */
export type RecordedTreeResult =
  | {
      readonly kind: "unreadable"
      /** Why the files cannot be read as an input and its tree. */
      readonly reason: string
    }
  | {
      readonly kind: "checked"
      /** The conditions of the tree that do not hold (`checkTree`). */
      readonly problems: readonly TreeProblem[]
      /** The node types of the tree that are neither a value node nor a structure node. */
      readonly unclassified: readonly string[]
    }

/** Checks the recorded tree in `files`. */
export function checkRecordedTree(
  files: RecordedTreeFiles,
): RecordedTreeResult {
  let input: string, root: CheckedRoot
  try {
    input = readFileSync(files.input, "utf8")
  } catch {
    return { kind: "unreadable", reason: "input.mmd cannot be read" }
  }
  try {
    // checkTree checks the shape of what it is given first.
    root = JSON.parse(readFileSync(files.tree, "utf8")) as CheckedRoot
  } catch {
    return { kind: "unreadable", reason: "ast.json is not JSON" }
  }
  const problems = checkTree(input, root)
  const unclassified = new Set<string>()
  // A tree with problems fails already, and the nodes of a tree whose shape
  // breaks the specification cannot be walked.
  if (problems.length === 0) {
    for (const node of nodesOf(root)) {
      if (
        !VALUE_NODE_TYPES.has(node.type) &&
        !STRUCTURE_NODE_TYPES.has(node.type)
      ) {
        unclassified.add(node.type)
      }
    }
  }
  return { kind: "checked", problems, unclassified: [...unclassified] }
}
