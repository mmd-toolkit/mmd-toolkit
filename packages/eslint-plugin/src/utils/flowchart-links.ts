import type {
  FlowchartDiagram,
  FlowchartLink,
  FlowchartStatement,
  FlowchartSubgraphStatement,
  FlowchartVertexStatement,
} from "@mmd-toolkit/parser"
import { linkIdsOf } from "./link-ids.ts"

/** Reuse the table when several rules read the same immutable diagram. */
const linkIdTables = new WeakMap<
  FlowchartDiagram,
  ReadonlyMap<FlowchartLink, readonly string[]>
>()

/** All link ids, including generated ids and grouped endpoint pairs. */
export function flowchartLinkIdsOf(
  diagram: FlowchartDiagram,
): ReadonlyMap<FlowchartLink, readonly string[]> {
  const cached = linkIdTables.get(diagram)
  if (cached !== undefined) return cached
  const ids = linkIdsOf<FlowchartStatement, FlowchartLink>(diagram.body, {
    isContainer: (statement): statement is FlowchartSubgraphStatement =>
      statement.type === "FlowchartSubgraphStatement",
    isVertexStatement: (statement): statement is FlowchartVertexStatement =>
      statement.type === "FlowchartVertexStatement",
  })
  linkIdTables.set(diagram, ids)
  return ids
}
