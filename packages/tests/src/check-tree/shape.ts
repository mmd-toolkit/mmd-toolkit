import { NODE_FIELDS } from "./node-fields.ts"
import type { Problems } from "./problems.ts"
import { isNode } from "./walk.ts"

// The form of a tree: the fields of each node type and record and their
// kinds, as the tables of the tree documents of the specification describe
// them (`node-fields.ts`). The other checks read a tree of this form; a tree
// that is not of it is reported here, with no other check run on it.

/** Whether `value` is an offset pair: two integers, the first not after the second. */
function isRange(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    Number.isInteger(value[0]) &&
    Number.isInteger(value[1]) &&
    (value[0] as number) >= 0 &&
    (value[0] as number) <= (value[1] as number)
  )
}

/** Whether `value` is a position: a line and a column. */
function isPosition(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false
  const { line, column } = value as { line?: unknown; column?: unknown }
  return Number.isInteger(line) && Number.isInteger(column)
}

/** Whether `value` is a location: a start and an end position. */
function isLocation(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false
  const { start, end } = value as { start?: unknown; end?: unknown }
  return isPosition(start) && isPosition(end)
}

/** The kind of a value, for the messages. */
function describe(value: unknown): string {
  if (value === null) return "null"
  if (Array.isArray(value)) return "a list"
  return typeof value
}

/**
 * Whether `value` is a value of the field `field` of the node type `type` that
 * the form of a recorded tree allows besides its kind: the `value` of a
 * NumericLiteral is also `Infinity`, `-Infinity`, NaN, or null for a non-finite
 * double, since JSON writes non-finite numbers as null
 * (tests/docs/maintaining-fixtures.md, The recorded tree is JSON). Which of them is right
 * for the written text is checked with the value (`values.ts`).
 */
function isNonFiniteNumber(
  type: string,
  field: string,
  value: unknown,
): boolean {
  return (
    type === "NumericLiteral" &&
    field === "value" &&
    (value === null ||
      value === Infinity ||
      value === -Infinity ||
      Number.isNaN(value))
  )
}

/** Whether `value` is of the value type `valueType` of a field. */
function isValueOfType(value: unknown, valueType: string | undefined): boolean {
  switch (valueType) {
    case "string":
      return typeof value === "string"
    case "stringOrNull":
      return typeof value === "string" || value === null
    case "boolean":
      return typeof value === "boolean"
    case "number":
      return typeof value === "number" && Number.isFinite(value)
    case "range":
      return isRange(value)
    default:
      return false
  }
}

/** Reports that the field `field` of the node at `where` holds `value`, and not a value of the kind `expected`. */
function reportWrongKind(
  problems: Problems,
  where: string,
  field: string,
  value: unknown,
  expected: string,
): void {
  problems.report(
    where,
    `the field ${field} is ${describe(value)}, not ${expected}`,
  )
}

/** Checks the form of the object `node` of the type it names, and of what is under it. */
function checkNodeShape(
  node: unknown,
  where: string,
  problems: Problems,
  seen: Set<unknown>,
  record?: string,
): void {
  if (!isNode(node)) {
    problems.report(where, "is no node: it has no type and no range")
    return
  }
  if (seen.has(node)) return
  seen.add(node)
  const here = `${node.type} at ${node.range[0]}-${node.range[1]}`
  if (!isRange(node.range)) {
    problems.report(here, "has a range that is no offset pair")
  }
  if (!isLocation(node.loc)) {
    problems.report(here, "has a loc that is no location")
  }
  const fields = NODE_FIELDS[record ?? node.type]
  if (fields === undefined) {
    problems.report(here, "is of a type that the specification does not define")
    return
  }
  for (const key of Object.keys(node)) {
    if (key === "type" || key === "range" || key === "loc") continue
    if (!Object.hasOwn(fields, key)) {
      problems.report(
        here,
        `has the field ${key}, which its type does not have`,
      )
    }
  }
  for (const [field, spec] of Object.entries(fields)) {
    const value = node[field]
    if (!Object.hasOwn(node, field)) {
      problems.report(here, `lacks the field ${field}`)
      continue
    }
    switch (spec.shape) {
      case "value":
        if (
          !isValueOfType(value, spec.valueType) &&
          !isNonFiniteNumber(String(node.type), field, value)
        )
          reportWrongKind(
            problems,
            here,
            field,
            value,
            spec.valueType ?? "a value",
          )
        break
      case "node":
        if (isNode(value))
          checkNodeShape(value, `${here}.${field}`, problems, seen, spec.record)
        else reportWrongKind(problems, here, field, value, "a node")
        break
      case "nodeOrNull":
        if (value === null) break
        if (isNode(value))
          checkNodeShape(value, `${here}.${field}`, problems, seen, spec.record)
        else reportWrongKind(problems, here, field, value, "a node or null")
        break
      case "nodeListOrNull":
      case "nodeList":
      case "nodeListWithNull": {
        if (value === null && spec.shape === "nodeListOrNull") break
        if (!Array.isArray(value)) {
          reportWrongKind(problems, here, field, value, "a list")
          break
        }
        value.forEach((entry: unknown, index: number) => {
          if (entry === null && spec.shape === "nodeListWithNull") return
          checkNodeShape(
            entry,
            `${here}.${field}[${index}]`,
            problems,
            seen,
            spec.record,
          )
        })
        break
      }
      default:
        break
    }
  }
}

/**
 * Checks that `root` is a tree of the form that the specification gives: every
 * node and record has the type, the range, the location, and the fields of
 * its type, each of its kind. Returns whether it is.
 */
export function checkShape(root: unknown, problems: Problems): boolean {
  const before = problems.list.length
  checkNodeShape(root, "the tree", problems, new Set())
  if (isNode(root) && root.type !== "Root") {
    problems.report("the tree", "is no Root")
  }
  return problems.list.length === before
}
