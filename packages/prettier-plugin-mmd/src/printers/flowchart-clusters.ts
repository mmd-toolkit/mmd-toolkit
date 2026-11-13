import type {
  FlowchartDiagram,
  FlowchartStatement,
  FlowchartSubgraphStatement,
} from "@mmd-toolkit/ast"
import { appendItems } from "./collections.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  isWhitespace,
  textWithoutDirectives,
} from "./source.ts"

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
  /** The ids that make a vertex somewhere: in a vertex statement, a style, or a class. */
  readonly vertices: Set<string>
  /** The ids of the click statements, which make no vertex. */
  readonly clicked: Set<string>
  /** How many subgraphs have each name text, by the text without the whitespace at its ends. */
  readonly names: Map<string, number>
}

/**
 * Whether the flowchart has a subgraph that the dagre layout of some versions
 * that count draws in the opposite direction of the figure: a subgraph without
 * a direction of its own, with a member, and without a link that joins a
 * vertex inside it to one outside it. That layout takes such a subgraph out of
 * the figure and lays it out alone, in `LR` where the figure is `TB` and in
 * `TB` where it is not, so the figure drawn with `TB` and with `TD` differs
 * there (docs/flowchart.md, Direction; docs/compatibility.md, Forms kept for
 * versions of mermaid.js that count). A link to the id of the subgraph does
 * not join the subgraph to the outside, and a link from a vertex inside it to
 * its id is counted as no link to the outside, as the layout of the first of
 * those versions counts it.
 *
 * The members of a subgraph and its id follow the specification (diagrams/
 * flowchart.md, Subgraph members), except that the list of the specification
 * also holds the value of an accessibility statement and a `;`, which are no
 * node of the figure: a subgraph that holds only them is empty here. Where the
 * specification gives an id that this function does not, it errs towards
 * reporting a subgraph.
 */
export function hasSubgraphWithoutOuterLink(
  source: Source,
  diagram: FlowchartDiagram,
): boolean {
  const facts = factsOf(source, diagram)
  const kept = withMembersLeftOut(facts.clusters)
  // A member that is no vertex and no subgraph, such as the value of an
  // accessibility statement or a `;`, is no node of the figure.
  const known = new Set([
    ...facts.vertices,
    ...facts.clicked,
    ...kept.map((item) => item.id),
  ])
  const clusters = kept.map((item) => ({
    ...item,
    members: item.members.filter((member) => known.has(member)),
  }))
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

/** The facts of each diagram, found once per source. */
const factsBySource = new WeakMap<Source, Facts>()

/** The facts of a diagram, which its statements give. */
function factsOf(source: Source, diagram: FlowchartDiagram): Facts {
  const cached = factsBySource.get(source)
  if (cached !== undefined) return cached
  const facts: Facts = {
    clusters: [],
    links: [],
    vertices: new Set(),
    clicked: new Set(),
    names: new Map(),
  }
  collectMembers(source, diagram.body, facts)
  factsBySource.set(source, facts)
  return facts
}

/**
 * Whether some other statement names the id that the subgraph has when its
 * name is one word: a vertex, a style, or a class with that id, or another
 * subgraph with the same name. A statement that names an id which no subgraph
 * has makes a vertex of it, except a click, which makes none. So where the id
 * of the subgraph differs from the name, such a statement reads a vertex and
 * not the subgraph.
 */
export function isSubgraphIdNamedElsewhere(
  source: Source,
  diagram: FlowchartDiagram,
  subgraph: FlowchartSubgraphStatement,
): boolean {
  const facts = factsOf(source, diagram)
  const id = subgraph.name.value.trim()
  return facts.vertices.has(id) || (facts.names.get(id) ?? 0) > 1
}

/**
 * Whether more than one whitespace character stands between `subgraph` and a
 * name of one word without a title, with the directives left out. The versions
 * that read the first of them as the separator after the keyword read the rest
 * as the start of the name text, so the name text holds whitespace and the
 * subgraph gets a generated id instead of the name (docs/flowchart.md,
 * Subgraph header).
 */
export function hasSpaceBeforeOneWordName(
  source: Source,
  subgraph: FlowchartSubgraphStatement,
): boolean {
  const { name } = subgraph
  if (
    subgraph.title !== null ||
    name.kind !== "text" ||
    [...name.value].some(isWhitespace)
  )
    return false
  const keyword = findStructuralToken(source, subgraph.range[0])
  if (keyword === undefined) return false
  const gap = textWithoutDirectives(source, keyword.range[1], name.range[0])
  return [...gap].filter(isWhitespace).length > 1
}

/**
 * Records the links and the subgraphs of the statements and returns their
 * members, in the order of the specification: for a vertex statement, the
 * vertices of its last group, then those of the group before it, back to the
 * first; for a subgraph, its id; for an accessibility statement with a value,
 * the value; and `;` for an empty statement. The last two are no vertex, and
 * `hasSubgraphWithoutOuterLink` leaves them out.
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
        for (const group of groups) {
          for (const id of group) facts.vertices.add(id)
        }
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
      case "FlowchartStyleStatement":
        facts.vertices.add(statement.id.name)
        break
      case "FlowchartClassStatement":
        for (const id of statement.ids) {
          if (id !== null) facts.vertices.add(id.name)
        }
        break
      case "FlowchartClickCallbackStatement":
      case "FlowchartClickUrlStatement":
        for (const id of statement.ids) {
          if (id !== null) facts.clicked.add(id.name)
        }
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
  const name = statement.name.value.trim()
  facts.names.set(name, (facts.names.get(name) ?? 0) + 1)
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
 * The id of a subgraph: its name text without the whitespace at its ends, or
 * `subGraph` and the number of the subgraphs closed before it where there is
 * no title and the name text holds whitespace, also at its ends, or whitespace
 * stands before a name of one word (see `hasSpaceBeforeOneWordName`).
 */
function subgraphId(
  source: Source,
  statement: FlowchartSubgraphStatement,
  closed: number,
): string {
  const text = statement.name.value
  return statement.title === null &&
    ([...text].some(isWhitespace) ||
      hasSpaceBeforeOneWordName(source, statement))
    ? `subGraph${closed}`
    : text.trim()
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
