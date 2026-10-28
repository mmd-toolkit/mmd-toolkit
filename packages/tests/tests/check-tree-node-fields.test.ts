import { describe, expect, it } from "vitest"
import { fieldSpecOf } from "../src/check-tree/field-spec.ts"
import { NODE_FIELDS, childFieldsOf } from "../src/check-tree/node-fields.ts"
import {
  STRUCTURE_NODE_TYPES,
  VALUE_NODE_TYPES,
} from "../src/check-tree/node-types.ts"
import { readChildFields, readFieldTables } from "./spec-field-tables.ts"

// The table of the fields of each node type of the check of a tree
// (`node-fields.ts`) is a copy of the field tables of the tree documents of
// the specification; the specification defines the form of a tree.

/** The node types that their documents describe with no field table. */
const TYPES_WITHOUT_FIELD_TABLE: ReadonlySet<string> = new Set([
  "RailroadAnyExpression",
  "BlockAccDescrBlockStatement",
  "ErrorDiagram",
  "FlowchartEmptyStatement",
  "GanttInclusiveEndDatesStatement",
  "StateDividerStatement",
  "StateHideEmptyDescriptionStatement",
  "StateTerminal",
])

describe("the fields of the node types of the check of a tree", () => {
  const documented = readFieldTables()

  it("are the fields that the field tables of the specification list, of the kind that their Type column gives", () => {
    const differing: string[] = []
    for (const [type, fields] of documented) {
      const own = NODE_FIELDS[type]
      if (own === undefined) {
        differing.push(`${type}: not in the table`)
        continue
      }
      for (const [field, cell] of fields) {
        const spec = own[field]
        if (spec === undefined) {
          differing.push(`${type}.${field}: not in the table`)
        } else if (JSON.stringify(spec) !== JSON.stringify(fieldSpecOf(cell))) {
          differing.push(
            `${type}.${field}: ${JSON.stringify(spec)} for ${cell}`,
          )
        }
      }
      for (const field of Object.keys(own)) {
        if (!fields.has(field))
          differing.push(`${type}.${field}: not documented`)
      }
    }
    expect(differing).toEqual([])
  })

  it("list the child fields in the order that the specification states, for every node type", () => {
    const stated = readChildFields()
    const differing: string[] = []
    // A record is no node type, and no section states its child fields.
    const nodeTypes = [...VALUE_NODE_TYPES, ...STRUCTURE_NODE_TYPES]
    for (const type of nodeTypes) {
      const children = stated.get(type)
      if (children === undefined) {
        differing.push(`${type}: the specification states no child fields`)
      } else if (
        JSON.stringify(childFieldsOf(type)) !== JSON.stringify(children)
      ) {
        differing.push(
          `${type}: ${JSON.stringify(childFieldsOf(type))} for ${JSON.stringify(children)}`,
        )
      }
    }
    for (const type of stated.keys()) {
      if (!nodeTypes.includes(type)) {
        differing.push(`${type}: states child fields but is no node type`)
      }
    }
    expect(differing).toEqual([])
  })

  it("list no type that no table of the specification describes, except the types with no fields", () => {
    const extra = Object.keys(NODE_FIELDS).filter(
      (type) => !documented.has(type) && !TYPES_WITHOUT_FIELD_TABLE.has(type),
    )
    expect(extra).toEqual([])
    for (const type of TYPES_WITHOUT_FIELD_TABLE) {
      expect(Object.keys(NODE_FIELDS[type] ?? { x: 1 })).toEqual([])
    }
  })

  it("cover every node type that is classified as a value node or not", () => {
    const missing = [...VALUE_NODE_TYPES, ...STRUCTURE_NODE_TYPES].filter(
      (type) => !Object.hasOwn(NODE_FIELDS, type),
    )
    // `Root` is classified, and described by ast.md.
    expect(missing).toEqual([])
  })
})
