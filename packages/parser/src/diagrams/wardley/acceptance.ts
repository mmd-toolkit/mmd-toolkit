import { ReferencedNames } from "./referenced-names.ts"
import type { NumericLiteral, StringLiteral } from "../../ast.ts"
import type {
  WardleyCoordinates,
  WardleyDiagram,
  WardleyIdentifier,
} from "../../ast/wardley.ts"
import { ParseError } from "../../errors.ts"
import type { WardleyComparisonNames } from "./grammar.ts"

/** Semantic acceptance conditions: normalize the already-rounded double before comparing its bounds. */
function checkedCoordinate(node: NumericLiteral): number {
  const value = node.value <= 1 ? node.value * 100 : node.value
  if (value < 0 || value > 100)
    throw new ParseError(
      "A Wardley coordinate must be between 0 and 100",
      node.range,
      node.loc,
    )
  return value
}

/** Authored pairs are always visibility then evolution; neither field is swapped. */
function checkedCoordinates(node: WardleyCoordinates): {
  visibility: number
  evolution: number
} {
  return {
    visibility: checkedCoordinate(node.visibility),
    evolution: checkedCoordinate(node.evolution),
  }
}

/** diagrams/wardley.md, Semantic acceptance conditions: the direct coordinate and existence rules only. */
export function checkWardleyAcceptance(
  diagram: WardleyDiagram,
  names: WardleyComparisonNames,
): void {
  /** Common conversions and string escapes were retained at the lexical name boundary. */
  function comparisonName(node: WardleyIdentifier | StringLiteral): string {
    const value = names.get(node)
    if (value === undefined)
      throw new Error("mmd-toolkit parser bug: missing Wardley comparison name")
    return value
  }

  const references = new ReferencedNames(
    diagram.body.flatMap((statement) => {
      if (statement.type === "WardleyPipelineStatement")
        return [comparisonName(statement.parent)]
      if (statement.type === "WardleyEvolveStatement")
        return [comparisonName(statement.component)]
      return []
    }),
  )
  const nodes = new Map<string, { visibility: number; evolution: number }>()
  let boxChecked = false
  for (const statement of diagram.body) {
    switch (statement.type) {
      case "WardleyNoteStatement":
      case "WardleyAnnotationStatement":
      case "WardleyAcceleratorStatement":
      case "WardleyDeacceleratorStatement":
        checkedCoordinates(statement.coordinates)
        break
      case "WardleyAnnotationsStatement":
        if (!boxChecked) {
          checkedCoordinates(statement.coordinates)
          boxChecked = true
        }
        break
      default:
        break
    }
  }
  // Registration order is anchors, top-level components, then pipelines, each in source order.
  for (const type of [
    "WardleyAnchorStatement",
    "WardleyComponentStatement",
  ] as const)
    for (const statement of diagram.body)
      if (statement.type === type)
        nodes.set(
          comparisonName(statement.name),
          checkedCoordinates(statement.coordinates),
        )
  for (const statement of diagram.body) {
    if (statement.type !== "WardleyPipelineStatement") continue
    const parentName = comparisonName(statement.parent)
    const parent = nodes.get(parentName)
    if (parent === undefined)
      throw new ParseError(
        "A Wardley pipeline parent must exist",
        statement.parent.range,
        statement.parent.loc,
      )
    const children = references.childrenOf(parentName)
    for (const child of statement.body) {
      if (child.type !== "WardleyPipelineComponent") continue
      const id = children.nameOf(comparisonName(child.name))
      const evolution = checkedCoordinate(child.evolution)
      if (id !== undefined)
        nodes.set(id, { visibility: parent.visibility, evolution })
    }
  }
  for (const statement of diagram.body)
    if (
      statement.type === "WardleyEvolveStatement" &&
      nodes.has(comparisonName(statement.component))
    )
      checkedCoordinate(statement.target)
}
