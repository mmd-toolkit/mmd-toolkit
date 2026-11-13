import type {
  FlowchartDiagram,
  FlowchartStatement,
  FlowchartSubgraphStatement,
} from "@mmd-toolkit/ast"
import { appendItems } from "./collections.ts"
import type { Source } from "./source.ts"
import { isWhitespace } from "./source.ts"

/** A subgraph as the dagre layout meets it: its id and its members. */
interface Cluster {
  readonly id: string
  readonly members: string[]
  readonly hasDirection: boolean
}

/** What the statements of a diagram say about its subgraphs and its links. */
interface Facts {
  /** The subgraphs, in the order in which their `end` closes them. */
  readonly clusters: Cluster[]
  /** The two vertices of each link, a link of groups once for each pair. */
  readonly links: [string, string][]
}

/**
 * Whether the flowchart has a subgraph that the dagre layout of 10.9.8, 11.7.0,
 * and 11.8.1 draws in the opposite direction of the figure: a subgraph without
 * a direction of its own, with a member, and without a link that joins a
 * vertex inside it to one outside it (docs/flowchart.md, Direction). That
 * layout takes such a subgraph out of the figure and lays it out alone, in
 * `LR` where the figure is `TB` and in `TB` where it is not, so the figure
 * drawn with `TB` and with `TD` differs there. A link to the id of the subgraph
 * does not join the subgraph to the outside.
 *
 * The members of a subgraph and its id follow the specification (diagrams/
 * flowchart.md, Subgraph members), as far as the layout meets them. Where the
 * specification gives an id that this function does not, it errs towards
 * reporting a subgraph.
 */
export function hasSubgraphWithoutOuterLink(
  source: Source,
  diagram: FlowchartDiagram,
): boolean {
  const facts: Facts = { clusters: [], links: [] }
  collectMembers(source, diagram.body, facts)
  const clusters = withMembersLeftOut(facts.clusters)
  const children = new Map(clusters.map((item) => [item.id, item.members]))
  return clusters.some((cluster) => {
    if (cluster.members.length === 0 || cluster.hasDirection) return false
    const inside = descendantsOf(cluster.id, children)
    return !facts.links.some(
      ([from, to]) =>
        from !== cluster.id &&
        to !== cluster.id &&
        inside.has(from) !== inside.has(to),
    )
  })
}

/**
 * Records the links and the subgraphs of the statements and returns their
 * members, in the order of the specification: for a vertex statement, the
 * vertices of its last group, then those of the group before it, back to the
 * first; for a subgraph, its id; for an accessibility statement with a value,
 * the value; and `;` for an empty statement.
 */
function collectMembers(
  source: Source,
  statements: readonly FlowchartStatement[],
  facts: Facts,
): string[] {
  const members: string[] = []
  for (const statement of statements) {
    switch (statement.type) {
      case "FlowchartVertexStatement": {
        const groups = [
          statement.first,
          ...statement.links.map((link) => link.target),
        ].map((group) => group.vertices.map((vertex) => vertex.id.name))
        for (const [index, group] of groups.entries()) {
          const next = groups[index + 1]
          if (next === undefined) continue
          for (const from of group) {
            for (const to of next) facts.links.push([from, to])
          }
        }
        for (const group of groups.reverse()) appendItems(members, group)
        break
      }
      case "FlowchartSubgraphStatement":
        members.push(collectSubgraph(source, statement, facts))
        break
      case "FlowchartAccTitleStatement":
      case "FlowchartAccDescrStatement":
      case "FlowchartAccDescrBlockStatement":
        if (statement.value !== null) members.push(statement.value.value)
        break
      case "FlowchartEmptyStatement":
        members.push(";")
        break
      default:
        break
    }
  }
  return members
}

/** Records a subgraph after its body, and returns its id. */
function collectSubgraph(
  source: Source,
  statement: FlowchartSubgraphStatement,
  facts: Facts,
): string {
  const members = collectMembers(source, statement.body, facts)
  const id = subgraphId(source, statement, facts.clusters.length)
  facts.clusters.push({
    id,
    members,
    hasDirection: statement.body.some(
      (item) => item.type === "FlowchartDirectionStatement",
    ),
  })
  return id
}

/**
 * The id of a subgraph: its name text, or `subGraph` and the number of the
 * subgraphs closed before it where the name holds whitespace and there is no
 * title.
 */
function subgraphId(
  source: Source,
  statement: FlowchartSubgraphStatement,
  closed: number,
): string {
  const name = statement.name
  const text = (
    name.kind === "text" ? source.text.slice(...name.range) : name.value
  ).trim()
  return statement.title === null && [...text].some(isWhitespace)
    ? `subGraph${closed}`
    : text
}

/**
 * The subgraphs with the members that mermaid.js keeps: the empty and the
 * repeated members are left out, and so are the id of the subgraph itself and
 * the members that a subgraph closed before it has. A subgraph whose id an
 * earlier one has adds its members to that one, which keeps its direction.
 */
function withMembersLeftOut(clusters: readonly Cluster[]): Cluster[] {
  const kept = new Map<string, Cluster>()
  const taken = new Set<string>()
  for (const cluster of clusters) {
    const members = [...new Set(cluster.members)].filter(
      (member) =>
        member.trim() !== "" && member !== cluster.id && !taken.has(member),
    )
    for (const member of members) taken.add(member)
    const earlier = kept.get(cluster.id)
    if (earlier === undefined) {
      kept.set(cluster.id, { ...cluster, members })
    } else {
      appendItems(earlier.members, members)
    }
  }
  return [...kept.values()]
}

/** The members of a subgraph, and theirs if they are subgraphs too. */
function descendantsOf(
  id: string,
  children: ReadonlyMap<string, readonly string[]>,
): Set<string> {
  const found = new Set<string>()
  const pending = [...(children.get(id) ?? [])]
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    if (found.has(next)) continue
    found.add(next)
    appendItems(pending, children.get(next) ?? [])
  }
  return found
}
