import { readFileSync } from "node:fs"
import path from "node:path"
import type { TreeRoot } from "../src/db-from-tree/tree.ts"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot } from "../src/index.ts"

/** A fixture's input and its recorded tree. */
export interface RecordedTree {
  readonly input: string
  readonly tree: TreeRoot
}

/** The input and the recorded tree of the fixture `name` of `diagram`. */
export function recordedTree(diagram: DiagramType, name: string): RecordedTree {
  const directory = path.join(getFixturesRoot(), diagram, name)
  return {
    input: readFileSync(path.join(directory, "input.mmd"), "utf8"),
    // ast.json is JSON of the tree, as the Db reads it.
    tree: JSON.parse(
      readFileSync(path.join(directory, "ast.json"), "utf8"),
    ) as TreeRoot,
  }
}

/** Sets `field` of `target`, a node or a token, to `value`. */
export function setField(target: object, field: string, value: unknown): void {
  Object.assign(target, { [field]: value })
}
