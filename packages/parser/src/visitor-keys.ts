import { infoVisitorKeys } from "./visitor-keys/info.ts"
import { gitgraphVisitorKeys } from "./visitor-keys/gitgraph.ts"
import { pieVisitorKeys } from "./visitor-keys/pie.ts"
import { usecaseVisitorKeys } from "./visitor-keys/usecase.ts"
import { agentflowVisitorKeys } from "./visitor-keys/agentflow.ts"
import type { Node } from "./ast.ts"
import { classVisitorKeys } from "./visitor-keys/class.ts"
import { erVisitorKeys } from "./visitor-keys/er.ts"
import { flowchartVisitorKeys } from "./visitor-keys/flowchart.ts"
import { ganttVisitorKeys } from "./visitor-keys/gantt.ts"
import { journeyVisitorKeys } from "./visitor-keys/journey.ts"
import { mindmapVisitorKeys } from "./visitor-keys/mindmap.ts"
import { timelineVisitorKeys } from "./visitor-keys/timeline.ts"
import { sankeyVisitorKeys } from "./visitor-keys/sankey.ts"
import { xychartVisitorKeys } from "./visitor-keys/xychart.ts"
import { quadrantVisitorKeys } from "./visitor-keys/quadrant.ts"
import { blockVisitorKeys } from "./visitor-keys/block.ts"
import { kanbanVisitorKeys } from "./visitor-keys/kanban.ts"
import { c4VisitorKeys } from "./visitor-keys/c4.ts"
import { vennVisitorKeys } from "./visitor-keys/venn.ts"
import { ishikawaVisitorKeys } from "./visitor-keys/ishikawa.ts"
import { requirementVisitorKeys } from "./visitor-keys/requirement.ts"
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
  ...requirementVisitorKeys,
  ...mindmapVisitorKeys,
  ...timelineVisitorKeys,
  ...sankeyVisitorKeys,
  ...xychartVisitorKeys,
  ...quadrantVisitorKeys,
  ...blockVisitorKeys,
  ...kanbanVisitorKeys,
  ...c4VisitorKeys,
  ...vennVisitorKeys,
  ...ishikawaVisitorKeys,
  ...agentflowVisitorKeys,
  ...usecaseVisitorKeys,
  ...pieVisitorKeys,
  ...gitgraphVisitorKeys,
  ...infoVisitorKeys,
}
