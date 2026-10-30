import type { Identifier, NodeBase } from "../../ast.ts"
import type {
  ArchitectureDiagram,
  ArchitectureGroupStatement,
  ArchitectureServiceStatement,
  ArchitectureJunctionStatement,
} from "../../ast/architecture.ts"
import { ParseError } from "../../errors.ts"

/** Registered declaration kind and a node's optional group, as specified by Semantic acceptance conditions. */
interface Registration {
  readonly kind: "group" | "node"
  readonly parent: string | null
}

/** Report a semantic failure on the authored ID or construct that violates the condition. */
function reject(message: string, node: NodeBase): never {
  throw new ParseError(message, node.range, node.loc)
}

/**
 * diagrams/architecture.md, Semantic acceptance conditions: groups, services,
 * junctions, edges, then alignments, preserving source order within each category.
 * IDs contain only ASCII name characters, so their written and converted values coincide.
 */
export function checkArchitectureDeclarations(
  diagram: ArchitectureDiagram,
): void {
  const registered = new Map<string, Registration>()

  /** Register a declaration after uniqueness, self-parent and existing-group checks. */
  function register(
    statement:
      | ArchitectureGroupStatement
      | ArchitectureServiceStatement
      | ArchitectureJunctionStatement,
    kind: "group" | "node",
  ): void {
    const { id, in: parent } = statement
    if (registered.has(id.name))
      reject("Architecture ID is already registered", id)
    if (parent !== null) {
      if (parent.name === id.name)
        reject("Architecture declaration cannot be its own parent", parent)
      if (registered.get(parent.name)?.kind !== "group")
        reject("Architecture parent must be a registered group", parent)
    }
    registered.set(id.name, { kind, parent: parent?.name ?? null })
  }

  /** Edges and alignments can reference only registered services or junctions. */
  function nodeAt(id: Identifier): Registration {
    const node = registered.get(id.name)
    if (node?.kind !== "node")
      reject("Architecture reference must name a service or junction", id)
    return node
  }

  for (const statement of diagram.body)
    if (statement.type === "ArchitectureGroupStatement")
      register(statement, "group")
  for (const statement of diagram.body)
    if (statement.type === "ArchitectureServiceStatement")
      register(statement, "node")
  for (const statement of diagram.body)
    if (statement.type === "ArchitectureJunctionStatement")
      register(statement, "node")
  for (const statement of diagram.body) {
    if (statement.type !== "ArchitectureEdgeStatement") continue
    const lhs = nodeAt(statement.lhsId)
    const rhs = nodeAt(statement.rhsId)
    if (
      (statement.lhsGroup || statement.rhsGroup) &&
      lhs.parent !== null &&
      lhs.parent === rhs.parent
    )
      reject(
        "Architecture group modifier cannot join nodes in the same parent group",
        statement,
      )
  }
  for (const statement of diagram.body) {
    if (statement.type !== "ArchitectureAlignmentStatement") continue
    const members = new Set<string>()
    for (const member of statement.members) {
      nodeAt(member.id)
      if (members.has(member.id.name))
        reject("Architecture alignment members must be distinct", member.id)
      members.add(member.id.name)
    }
  }
}
