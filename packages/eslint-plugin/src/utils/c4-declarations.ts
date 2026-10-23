import type {
  C4BoundaryStatement,
  C4ElementStatement,
  C4UpdateStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleVisitor } from "../rule-types.ts"
import {
  c4ArgumentValue,
  c4Assignments,
  c4Parameters,
  isC4DeploymentNode,
} from "./c4-arguments.ts"
import type { C4ArgumentValue, C4Call } from "./c4-arguments.ts"

/** Only the current fields needed for target matching and declaration reports. */
export interface C4Declaration {
  readonly family: "element" | "boundary" | "relationship"
  alias: C4ArgumentValue
  from: C4ArgumentValue
  to: C4ArgumentValue
  /** A declaration's string label; null for an object or a raw style label. */
  label: string | null
  /** The shape keyword or the boundary's string type; null for a raw style. */
  kind: string | null
  /** An explicit boundary type can be lost; an unwritten default cannot. */
  writtenType: boolean
}

/** Observations of declarations and updates on their matching entries. */
interface Observers {
  declaration?(
    node: C4ElementStatement | C4BoundaryStatement,
    previous: C4Declaration | undefined,
    current: C4Declaration,
  ): void
  /** Every field a declaration writes, on the stable matching entry. */
  declared?(target: C4Declaration, fields: readonly string[]): void
  update?(node: C4UpdateStatement, target: C4Declaration | undefined): void
}

/** The type reset by a boundary declaration, before optional assignments. */
function boundaryType(node: C4BoundaryStatement): string {
  switch (node.keyword) {
    case "Enterprise_Boundary":
      return "ENTERPRISE"
    case "System_Boundary":
      return "SYSTEM"
    case "Container_Boundary":
      return "CONTAINER"
    default:
      return isC4DeploymentNode(node) ? "node" : "system"
  }
}

/** Applies fields needed by later comparisons and returns every written field. */
function assign(entry: C4Declaration, node: C4Call): string[] {
  const style = node.type === "C4UpdateStatement"
  const fields: string[] = []
  for (const { key, value, index } of c4Assignments(node)) {
    fields.push(key)
    const stored =
      node.keyword === "UpdateRelStyle" && index >= 4
        ? Number.parseInt(value, 10)
        : value
    switch (key) {
      case "alias":
      case "from":
      case "to":
        entry[key] = stored
        break
      case "label":
        entry.label = style ? null : value
        break
      case "type":
        if (node.type === "C4BoundaryStatement") {
          entry.kind = value
          entry.writtenType = true
        } else if (style && entry.family === "boundary") {
          entry.kind = null
          entry.writtenType = false
        }
        break
      case "typeC4Shape":
        if (style && entry.family === "element") entry.kind = null
        break
      default:
        // Other fields do not participate in target or appearance comparisons.
        break
    }
  }
  return fields
}

/**
 * Keeps the first matching entries in insertion order. Matching and consumed
 * assignments follow the specification's Rejections outside the grammar; a
 * boundary is declared on entry, before any statement of its body is visited.
 * Each matching entry keeps its identity across updates and redefinitions, so
 * observers can associate state with the resolved target.
 */
export function c4DeclarationVisitor(observers: Observers): MermaidRuleVisitor {
  const shapes: C4Declaration[] = []
  const boundaries: C4Declaration[] = [
    {
      family: "boundary",
      alias: "global",
      from: undefined,
      to: undefined,
      label: null,
      kind: "global",
      writtenType: false,
    },
  ]
  const relationships: C4Declaration[] = []

  /** Replaces the first matching declaration without changing insertion order. */
  function declare(node: C4ElementStatement | C4BoundaryStatement): void {
    const entries = node.type === "C4ElementStatement" ? shapes : boundaries
    const alias = c4ArgumentValue(node.arguments[0])
    const previous = entries.find((entry) => entry.alias === alias)
    const label = c4ArgumentValue(node.arguments[1]) ?? ""
    const current: C4Declaration = {
      family: node.type === "C4ElementStatement" ? "element" : "boundary",
      alias,
      from: previous?.from,
      to: previous?.to,
      label: typeof label === "string" ? label : null,
      kind:
        node.type === "C4ElementStatement" ? node.keyword : boundaryType(node),
      writtenType:
        node.type === "C4BoundaryStatement" &&
        !isC4DeploymentNode(node) &&
        node.keyword !== "Boundary",
    }
    const fields: string[] = [
      "alias",
      "label",
      "parentBoundary",
      "wrap",
      node.type === "C4ElementStatement" ? "typeC4Shape" : "type",
      ...assign(current, node),
    ]
    if (node.type === "C4BoundaryStatement" && isC4DeploymentNode(node)) {
      fields.push("nodeType")
    }
    observers.declaration?.(node, previous, current)
    if (previous === undefined) entries.push(current)
    else Object.assign(previous, current)
    observers.declared?.(previous ?? current, fields)
  }

  return {
    C4ElementStatement: declare,
    C4BoundaryStatement: declare,
    C4RelationshipStatement(node) {
      const { required } = c4Parameters(node)
      if (node.arguments.length < required) return
      // The required prefix ends with the two endpoints and the label.
      const offset = required - 3
      const from = c4ArgumentValue(node.arguments[offset])
      const to = c4ArgumentValue(node.arguments[offset + 1])
      let entry = relationships.find(
        (rel) => rel.from === from && rel.to === to,
      )
      if (entry === undefined) {
        entry = {
          family: "relationship",
          alias: undefined,
          from,
          to,
          label: null,
          kind: null,
          writtenType: false,
        }
        relationships.push(entry)
      }
      entry.from = from
      entry.to = to
      const fields = assign(entry, node)
      observers.declared?.(entry, [
        "type",
        "from",
        "to",
        "label",
        "wrap",
        ...fields,
      ])
    },
    C4UpdateStatement(node) {
      if (node.keyword === "UpdateLayoutConfig") return
      const first = c4ArgumentValue(node.arguments[0])
      const second = c4ArgumentValue(node.arguments[1])
      const target =
        node.keyword === "UpdateElementStyle"
          ? (shapes.find((entry) => entry.alias === first) ??
            boundaries.find((entry) => entry.alias === first))
          : relationships.find(
              (entry) => entry.from === first && entry.to === second,
            )
      observers.update?.(node, target)
      if (target !== undefined) assign(target, node)
    },
  }
}
