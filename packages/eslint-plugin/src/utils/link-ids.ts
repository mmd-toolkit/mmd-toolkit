import type { AgentflowLink, FlowchartLink } from "@mmd-toolkit/parser"
import { normalizeLineTerminators } from "./acc-text.ts"

/** The statement kinds that contain bodies or link chains in each graph tree. */
interface LinkStatementKinds<
  Statement,
  Link extends AgentflowLink | FlowchartLink,
> {
  isContainer(statement: Statement): statement is Statement & {
    readonly body: readonly Statement[]
  }
  isVertexStatement(statement: Statement): statement is Statement & {
    readonly first: Link["target"]
    readonly links: readonly Link[]
  }
}

/** Visit nested bodies and chains in written order, sharing one pair counter. */
export function linkIdsOf<
  Statement,
  Link extends AgentflowLink | FlowchartLink,
>(
  statements: readonly Statement[],
  kinds: LinkStatementKinds<Statement, Link>,
): ReadonlyMap<Link, readonly string[]> {
  const ids = new Map<Link, readonly string[]>()
  const nextIds = linkIdCounter()

  /** A container's links occur where its body is written. */
  function addLinks(body: readonly Statement[]): void {
    for (const statement of body) {
      if (kinds.isContainer(statement)) {
        addLinks(statement.body)
      } else if (kinds.isVertexStatement(statement)) {
        let source = statement.first.vertices.map((vertex) =>
          normalizeLineTerminators(vertex.id.name),
        )
        for (const link of statement.links) {
          const target = link.target.vertices.map((vertex) =>
            normalizeLineTerminators(vertex.id.name),
          )
          const written =
            link.id === null ? null : normalizeLineTerminators(link.id.name)
          ids.set(link, nextIds(source, target, written))
          source = target
        }
      }
    }
  }

  addLinks(statements)
  return ids
}

/**
 * Allocate link ids in endpoint order. Both graph diagrams count all earlier
 * links of an endpoint pair, including links with a written id.
 */
export function linkIdCounter(): (
  source: readonly string[],
  target: readonly string[],
  writtenId: string | null,
) => string[] {
  const used = new Set<string>()
  const counts = new Map<string, Map<string, number>>()
  return (source, target, writtenId) => {
    const ids: string[] = []
    const lastSource = source.at(-1)
    const firstTarget = target[0]
    for (const start of source) {
      let ends = counts.get(start)
      if (ends === undefined) {
        ends = new Map<string, number>()
        counts.set(start, ends)
      }
      for (const end of target) {
        const earlier = ends.get(end) ?? 0
        const id =
          writtenId !== null &&
          start === lastSource &&
          end === firstTarget &&
          !used.has(writtenId)
            ? writtenId
            : `L_${start}_${end}_${earlier === 0 ? 0 : earlier + 1}`
        used.add(id)
        ends.set(end, earlier + 1)
        ids.push(id)
      }
    }
    return ids
  }
}
