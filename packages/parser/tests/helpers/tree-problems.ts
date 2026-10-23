import type { CheckedRoot, TreeProblem } from "@mmd-toolkit/tests"
import { checkTree } from "@mmd-toolkit/tests"
import type { Root } from "../../src/index.ts"

/**
 * The check of the tree that `@mmd-toolkit/tests` makes on every recorded
 * tree of the corpus (`checkTree`), made on `root`, the tree that `parse()`
 * gave for `text`, read as the corpus records it, as JSON: the conditions
 * of the specification that the tree breaks, none when it keeps them all.
 */
export function problemsOfTree(text: string, root: Root): TreeProblem[] {
  const tree = JSON.parse(JSON.stringify(root)) as CheckedRoot
  return checkTree(text, tree)
}
