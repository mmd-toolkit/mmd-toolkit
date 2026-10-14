import type { Node } from "./ast.ts"
import { classVisitorKeys } from "./visitor-keys/class.ts"
import { erVisitorKeys } from "./visitor-keys/er.ts"
import { flowchartVisitorKeys } from "./visitor-keys/flowchart.ts"
import { ganttVisitorKeys } from "./visitor-keys/gantt.ts"
import { journeyVisitorKeys } from "./visitor-keys/journey.ts"
import { sequenceVisitorKeys } from "./visitor-keys/sequence.ts"
import { stateVisitorKeys } from "./visitor-keys/state.ts"

/**
 * ast.md, Nodes: for each node type, its child fields, the fields whose
 * values are child nodes, in the order in which a walk visits them.
 */
export type VisitorKeys = Readonly<Record<Node["type"], readonly string[]>>

/**
 * ast.md, Nodes: the child fields of every node type, as each node's section
 * states them. `Root` has `body`; `frontmatter`, `comments`, `directives`,
 * and `tokens` are lists, not child fields. `ErrorDiagram` and the shared
 * leaf nodes have none. The nodes of each diagram type have a table of
 * their own under `visitor-keys/`, which is added here.
 */
export const visitorKeys: VisitorKeys = {
  Root: ["body"],
  ErrorDiagram: [],
  Identifier: [],
  StringLiteral: [],
  NumericLiteral: [],
  ...flowchartVisitorKeys,
  ...sequenceVisitorKeys,
  ...classVisitorKeys,
  ...stateVisitorKeys,
  ...erVisitorKeys,
  ...ganttVisitorKeys,
  ...journeyVisitorKeys,
}
