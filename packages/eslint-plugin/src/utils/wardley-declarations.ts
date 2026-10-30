import type {
  NumericLiteral,
  StringLiteral,
  WardleyAnchorStatement,
  WardleyComponentStatement,
  WardleyCoordinates,
  WardleyDiagram,
  WardleyIdentifier,
  WardleyPipelineComponent,
  WardleyPipelineStatement,
} from "@mmd-toolkit/parser"
import { normalizeLineTerminators } from "./acc-text.ts"

/** Written names retain spaces, case and escapes; only line endings are normalized. */
export function wardleyNameText(
  node: WardleyIdentifier | StringLiteral,
): string {
  return normalizeLineTerminators(
    node.type === "WardleyIdentifier" ? node.name : node.value,
  )
}

/** Values at most one are fractions of a hundred; larger values are already percentages. */
export function wardleyPercent(node: NumericLiteral): number {
  return node.value <= 1 ? node.value * 100 : node.value
}

/** Coordinates in drawing order, after percentage conversion. */
export interface WardleyPosition {
  readonly x: number
  readonly y: number
}

/** Written coordinates put visibility first and evolution second. */
export function wardleyPosition(node: WardleyCoordinates): WardleyPosition {
  return {
    x: wardleyPercent(node.evolution),
    y: wardleyPercent(node.visibility),
  }
}

/** A registration retains its preceding declaration and the parent found at that moment. */
export interface WardleyDeclaration {
  readonly id: string
  readonly label: string
  readonly node:
    | WardleyAnchorStatement
    | WardleyComponentStatement
    | WardleyPipelineComponent
  readonly previous: WardleyDeclaration | undefined
  readonly parent: WardleyDeclaration | undefined
}

/** The current members of one authored pipeline, with repeats retained and order ignored. */
export interface WardleyPipeline {
  readonly node: WardleyPipelineStatement
  readonly parent: string
  readonly members: readonly string[]
}

/** Declaration identity and pipeline membership shared by the Wardley rules. */
export interface WardleyDeclarations {
  readonly registrations: readonly WardleyDeclaration[]
  readonly nodes: ReadonlyMap<string, WardleyDeclaration>
  readonly pipelines: readonly WardleyPipeline[]
  readonly pipelineMembers: ReadonlyMap<string, readonly string[]>
}

const cache = new WeakMap<WardleyDiagram, WardleyDeclarations>()

/** Register anchors, then components, then pipeline children, preserving each family's written order. */
export function wardleyDeclarationsOf(
  diagram: WardleyDiagram,
): WardleyDeclarations {
  const cached = cache.get(diagram)
  if (cached !== undefined) return cached
  const registrations: WardleyDeclaration[] = []
  const nodes = new Map<string, WardleyDeclaration>()
  const pipelines: WardleyPipeline[] = []
  const pipelineMembers = new Map<string, readonly string[]>()

  /** Replacing a declaration keeps its original position in the ID table. */
  function register(
    id: string,
    label: string,
    node: WardleyDeclaration["node"],
    parent?: WardleyDeclaration,
  ): void {
    const declaration = { id, label, node, previous: nodes.get(id), parent }
    registrations.push(declaration)
    nodes.set(id, declaration)
  }

  for (const node of diagram.body) {
    if (node.type !== "WardleyAnchorStatement") continue
    const id = wardleyNameText(node.name)
    register(id, id, node)
  }
  for (const node of diagram.body) {
    if (node.type !== "WardleyComponentStatement") continue
    const id = wardleyNameText(node.name)
    register(id, id, node)
  }
  for (const node of diagram.body) {
    if (node.type !== "WardleyPipelineStatement") continue
    const parentId = wardleyNameText(node.parent)
    const parent = nodes.get(parentId)
    const members: string[] = []
    for (const child of node.body) {
      if (child.type !== "WardleyPipelineComponent") continue
      const label = wardleyNameText(child.name)
      const id = `${parentId}_${label}`
      register(id, label, child, parent)
      members.push(id)
    }
    members.sort()
    pipelines.push({ node, parent: parentId, members })
    pipelineMembers.set(parentId, members)
  }
  const declarations = { registrations, nodes, pipelines, pipelineMembers }
  cache.set(diagram, declarations)
  return declarations
}

/** Links prefer an exact ID, then the first current label in initial registration order. */
export function wardleyLinkTarget(
  declarations: WardleyDeclarations,
  name: string,
): WardleyDeclaration | undefined {
  const exact = declarations.nodes.get(name)
  if (exact !== undefined) return exact
  return [...declarations.nodes.values()].find((node) => node.label === name)
}
