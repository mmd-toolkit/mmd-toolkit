import type { DbSummary, DbTreeRoot } from "@mmd-toolkit/tests"
import { dbFromTree } from "@mmd-toolkit/tests"
import type { EmbeddedValues } from "@mmd-toolkit/tests/mermaid"
import { cssSupportsColor } from "@mmd-toolkit/tests/mermaid"
import type { Root } from "../../src/index.ts"

/**
 * The Db summary that the tree `root` of the source `text` denotes, as
 * `@mmd-toolkit/tests` builds it from a recorded tree (`dbFromTree`): the
 * tree is given as its JSON, as `ast.json` records it, with `embedded`, the
 * values that mermaid.js derived from the embedded data of the text, and
 * the answer about a colour that the tests package gives mermaid.js.
 */
export function dbOfTree(
  text: string,
  root: Root,
  embedded: EmbeddedValues,
): DbSummary {
  const tree = JSON.parse(JSON.stringify(root)) as DbTreeRoot
  return dbFromTree(text, tree, embedded, cssSupportsColor)
}
