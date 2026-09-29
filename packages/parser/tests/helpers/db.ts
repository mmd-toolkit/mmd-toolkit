import type { DbSummary } from "@mmd-toolkit/tests"
import type { EmbeddedValues } from "@mmd-toolkit/tests/mermaid"
import { cssSupportsColor } from "@mmd-toolkit/tests/mermaid"
import type { Root } from "../../src/index.ts"
import { flowchartDbOf } from "./flowchart-db.ts"
import { sequenceDbOf } from "./sequence-db.ts"

/**
 * Test helper: the Db summary that the tree `root` of the source `text`
 * denotes, in the normalized form of `@mmd-toolkit/tests` (compared with
 * `runMermaid()` and `expected.json`). The source is read for the converted
 * form of the values.
 * The values that come from embedded data, which the parser does not read,
 * are those that mermaid.js derived for the same text: `embedded`, from
 * `resolveEmbeddedData()` or `runMermaidWithEmbeddedData()`.
 *
 * Each diagram body type adds a case when layer 2 of the parser tests is
 * written for it.
 */
export function dbOf(
  text: string,
  root: Root,
  embedded: EmbeddedValues,
): DbSummary {
  switch (root.body.type) {
    // The error pseudo-diagram's parser does nothing; its Db holds nothing.
    case "ErrorDiagram":
      return {}
    case "FlowchartDiagram":
      return flowchartDbOf(text, root, root.body, embedded)
    // diagrams/sequence.md, Box colours: whether a colour candidate is a
    // colour is the answer of the browser, which the normalizer of
    // `@mmd-toolkit/tests` gives mermaid.js too.
    case "SequenceDiagram":
      return sequenceDbOf(text, root, root.body, embedded, cssSupportsColor)
    default:
      throw new Error(
        `dbOf: unknown body ${JSON.stringify(root.body satisfies never)}`,
      )
  }
}
