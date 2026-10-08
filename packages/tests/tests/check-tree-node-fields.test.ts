import { describe, expect, it } from "vitest"
import { fieldSpecOf } from "../src/check-tree/field-spec.ts"
import { NODE_FIELDS } from "../src/check-tree/node-fields.ts"
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

  it("list the fields that are nodes in the order of the child fields that the specification states", () => {
    const differing: string[] = []
    for (const [type, children] of readChildFields()) {
      const own = Object.entries(NODE_FIELDS[type] ?? {})
        .filter(([, spec]) => spec.shape !== "value")
        .map(([field]) => field)
      if (JSON.stringify(own) !== JSON.stringify(children)) {
        differing.push(
          `${type}: ${JSON.stringify(own)} for ${JSON.stringify(children)}`,
        )
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
