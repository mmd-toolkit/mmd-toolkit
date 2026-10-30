import type {
  C4Argument,
  C4BoundaryStatement,
  C4ElementStatement,
  C4NamedAttribute,
  C4RelationshipStatement,
  C4UpdateStatement,
} from "@mmd-toolkit/parser"
import { normalizeLineTerminators } from "./acc-text.ts"

/** The four C4 call families, all with one written-order argument list. */
export type C4Call =
  | C4ElementStatement
  | C4BoundaryStatement
  | C4RelationshipStatement
  | C4UpdateStatement

/** Required positions and the fields selected by optional positional arguments. */
interface Parameters {
  readonly required: number
  /** Null marks an ignored position, rather than a field. */
  readonly fields: readonly (string | null)[]
}

/** The written positions read by a call, as defined by the C4 Db summary. */
export function c4Parameters(call: C4Call): Parameters {
  switch (call.type) {
    case "C4ElementStatement":
      return {
        required: 2,
        fields:
          call.keyword.startsWith("Person") || call.keyword.startsWith("System")
            ? ["alias", "label", "descr", "sprite", "tags", "link"]
            : ["alias", "label", "techn", "descr", "sprite", "tags", "link"],
      }
    case "C4BoundaryStatement":
      return {
        required: 2,
        fields:
          call.keyword === "Boundary"
            ? ["alias", "label", "type", "tags", "link"]
            : isC4DeploymentNode(call)
              ? ["alias", "label", "type", "descr", null, "tags", "link"]
              : ["alias", "label", "tags", "link"],
      }
    case "C4RelationshipStatement":
      return call.keyword === "RelIndex"
        ? {
            required: 4,
            fields: [
              null,
              "from",
              "to",
              "label",
              "techn",
              "descr",
              "sprite",
              "tags",
              "link",
            ],
          }
        : {
            required: 3,
            fields: [
              "from",
              "to",
              "label",
              "techn",
              "descr",
              "sprite",
              "tags",
              "link",
            ],
          }
    default:
      switch (call.keyword) {
        case "UpdateElementStyle":
          return {
            required: 1,
            fields: [
              "alias",
              "bgColor",
              "fontColor",
              "borderColor",
              "shadowing",
              "shape",
              "sprite",
              "techn",
              "legendText",
              "legendSprite",
            ],
          }
        case "UpdateRelStyle":
          return {
            required: 2,
            fields: [
              "from",
              "to",
              "textColor",
              "lineColor",
              "offsetX",
              "offsetY",
            ],
          }
        default:
          return { required: 0, fields: ["c4ShapeInRow", "c4BoundaryInRow"] }
      }
  }
}

/** Whether this boundary keyword declares a deployment node. */
export function isC4DeploymentNode(call: C4BoundaryStatement): boolean {
  return call.keyword === "Deployment_Node" || call.keyword.startsWith("Node")
}

/** The tree's text for comparison, with normalized line endings and trimmed ends. */
function comparisonText(value: string): string {
  return normalizeLineTerminators(value).trim()
}

/** Strings compare by their normalized tree value; named arguments by identity. */
export type C4ArgumentValue = string | C4NamedAttribute | number | undefined

/** A missing argument stays distinct from an explicitly empty entry. */
export function c4ArgumentValue(
  argument: C4Argument | undefined,
): C4ArgumentValue {
  if (argument === undefined) return undefined
  if (argument === null) return ""
  return argument.type === "C4NamedAttribute"
    ? argument
    : comparisonText(argument.value)
}

/** A consumed optional assignment, with the written position retained. */
export interface C4Assignment {
  readonly argument: C4Argument
  readonly key: string
  readonly value: string
  readonly index: number
}

/** Optional fields only, excluding excess arguments and the ignored sprite. */
export function c4Assignments(call: C4Call): C4Assignment[] {
  const { required, fields } = c4Parameters(call)
  const assignments: C4Assignment[] = []
  for (let index = required; index < fields.length; index++) {
    const field = fields[index]
    const argument = call.arguments[index]
    if (field === null || argument === undefined) continue
    const named = argument?.type === "C4NamedAttribute"
    const value =
      argument === null
        ? ""
        : comparisonText(named ? argument.value.value : argument.value)
    assignments.push({
      argument,
      key: named
        ? argument.key === null
          ? ""
          : comparisonText(argument.key.value)
        : field,
      value,
      index,
    })
  }
  return assignments
}
