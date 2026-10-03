import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { NODE_FIELDS } from "../src/check-tree/node-fields.ts"
import {
  STRUCTURE_NODE_TYPES,
  VALUE_NODE_TYPES,
} from "../src/check-tree/node-types.ts"
import { VALUE_RULES } from "../src/check-tree/values.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot, loadFixtures } from "../src/index.ts"
import { withoutTokenWhitespace } from "./check-tree-token-edits.ts"
import type { TokenSide } from "./check-tree-token-edits.ts"
import { readFieldMeanings } from "./spec-field-tables.ts"

// The value of a node is made from the written text of its range by one rule
// (`src/check-tree/values.ts`): the table of that file lists, for each node
// type with a value, how. This test requires the table to list every value
// of the field tables, to agree with the Meaning column of the specification
// on which values are simply the written text, and every kind of break of a
// value to be reported in a recorded tree.

const DIAGRAMS: readonly DiagramType[] = [
  "common",
  "flowchart",
  "sequence",
  "class",
  "state",
]

/** A recorded tree, with its input and its name. */
interface Recorded {
  readonly name: string
  readonly input: string
  readonly json: string
}

/** The recorded trees of the corpus. */
async function recordedTrees(): Promise<Recorded[]> {
  const trees: Recorded[] = []
  for (const diagram of DIAGRAMS) {
    for (const fixture of await loadFixtures(diagram)) {
      const file = path.join(
        getFixturesRoot(),
        diagram,
        fixture.name,
        "ast.json",
      )
      if (!existsSync(file)) continue
      trees.push({
        name: `${diagram}/${fixture.name}`,
        input: fixture.input,
        json: readFileSync(file, "utf8"),
      })
    }
  }
  return trees
}

/** The fields `value` and `name` of the node types of the field tables that hold a string or a number: the values of the nodes. */
function valueFieldsOfTables(): Map<string, string> {
  const fields = new Map<string, string>()
  for (const [type, own] of Object.entries(NODE_FIELDS)) {
    if (!VALUE_NODE_TYPES.has(type) && !STRUCTURE_NODE_TYPES.has(type)) continue
    for (const field of ["value", "name"]) {
      const spec = own[field]
      if (
        spec?.shape === "value" &&
        (spec.valueType === "string" || spec.valueType === "number")
      ) {
        fields.set(type, field)
      }
    }
  }
  return fields
}

/** How the Meaning column of the specification says that a value is made: its written text, the texts of its units joined, or otherwise. */
function saidInSpecification(
  meaning: string,
): "written-text" | "units-joined" | "otherwise" {
  if (meaning.startsWith("Its written text between")) return "otherwise"
  if (meaning.startsWith("Its written text")) return "written-text"
  if (
    meaning.startsWith("The written texts of its units") ||
    meaning.startsWith("The texts of its units")
  ) {
    return "units-joined"
  }
  return "otherwise"
}

describe("the rules of the values of the nodes", () => {
  it("list exactly the fields value and name that the field tables give to a node", () => {
    const rules = new Map(
      Object.entries(VALUE_RULES).map(([type, rule]) => [type, rule.field]),
    )
    expect(rules).toEqual(valueFieldsOfTables())
  })

  it("say a value is its written text, or the texts of its units joined, where the specification says so, and make the others exceptions", () => {
    const meanings = readFieldMeanings()
    const differing: string[] = []
    for (const [type, rule] of Object.entries(VALUE_RULES)) {
      const meaning = meanings.get(type)?.get(rule.field)
      if (meaning === undefined) {
        differing.push(`${type}.${rule.field}: not in the specification`)
        continue
      }
      const expected =
        rule.kind === "units-joined"
          ? "units-joined"
          : rule.kind === "written-text" && rule.delimiters === undefined
            ? "written-text"
            : "otherwise"
      if (saidInSpecification(meaning) !== expected) {
        differing.push(
          `${type}.${rule.field}: the rule is ${expected}, the specification says ${meaning}`,
        )
      }
    }
    expect(differing).toEqual([])
  })
})

/** The nodes of `tree` of the type `type` whose rule is not `derived`... and that have a value to break. */
function instancesWithValue(tree: CheckedRoot, type: string): CheckedNode[] {
  const field = VALUE_RULES[type]?.field ?? "value"
  return nodesOf(tree).filter(
    (node) =>
      node.type === type &&
      (typeof node[field] === "number" ||
        (typeof node[field] === "string" && node[field] !== "")),
  )
}

/** The edits of a value that the check must report. */
const VALUE_EDITS: readonly {
  name: string
  edit: (value: string | number) => string | number
}[] = [
  {
    name: "a character added at the end",
    edit: (value) => (typeof value === "number" ? value + 1 : `${value}Z`),
  },
  {
    name: "a character added at the start",
    edit: (value) => (typeof value === "number" ? value + 1 : `Z${value}`),
  },
  {
    name: "the last character dropped",
    edit: (value) =>
      typeof value === "number" ? value + 1 : value.slice(0, -1),
  },
  {
    name: "the first character dropped",
    edit: (value) => (typeof value === "number" ? value + 1 : value.slice(1)),
  },
]

describe("a broken value", () => {
  it("is reported for every node type with a value, whatever the edit", async () => {
    const trees = await recordedTrees()
    const unreported: string[] = []
    for (const [type, rule] of Object.entries(VALUE_RULES)) {
      // The shape name follows from the delimiters of the shape, which the
      // check of a flowchart reads; its edits are those of any value.
      for (const { name, edit } of VALUE_EDITS) {
        let reported: boolean | undefined
        for (const recorded of trees) {
          const tree = JSON.parse(recorded.json) as CheckedRoot
          const instance = instancesWithValue(tree, type)[0]
          if (instance === undefined) continue
          const mutable = instance as Record<string, unknown>
          const before = mutable[rule.field]
          if (typeof before !== "string" && typeof before !== "number") continue
          mutable[rule.field] = edit(before)
          reported = checkTree(recorded.input, tree).length > 0
          break
        }
        if (reported !== true) {
          unreported.push(`${type}.${rule.field}: ${name}`)
        }
      }
    }
    expect(unreported).toEqual([])
  }, 120_000)
})

/** The node types whose tokens never start or end with whitespace, so that no recorded tree has a token to take whitespace from, with the reason. */
const TYPES_WITHOUT_TOKEN_WHITESPACE: Readonly<Record<string, string>> = {
  Identifier: "its units hold no whitespace (ast.md, Identifier)",
  ClassIdentifier:
    "its tokens are the runs of its units without whitespace (ast/class.md, ClassIdentifier)",
  NumericLiteral: "its token is a number",
  FlowchartArrow: "its token is an arrow",
  FlowchartOpeningArrow: "its token is an arrow",
  SequenceArrow: "its token is an arrow",
  ClassArrow: "its tokens are the parts of an arrow",
  StateIgnoredStatement: "its tokens are words and strings",
  StateIgnoredText: "its tokens are words and strings",
  SequenceIgnoredStatement: "its tokens are single characters and words",
}

describe("whitespace taken off an end of a token", () => {
  it("is reported for every node type with a value that has a token with whitespace at an end", async () => {
    const trees = await recordedTrees()
    const sides: readonly TokenSide[] = ["start", "end"]
    const unreported: string[] = []
    for (const type of Object.keys(VALUE_RULES)) {
      const excluded = Object.hasOwn(TYPES_WITHOUT_TOKEN_WHITESPACE, type)
      let made = 0
      for (const recorded of trees) {
        const tree = JSON.parse(recorded.json) as CheckedRoot
        const holders = nodesOf(tree).filter((node) => node.type === type)
        for (const [index, token] of tree.tokens.entries()) {
          const inside = holders.some(
            (node) =>
              node.range[0] <= token.range[0] &&
              token.range[1] <= node.range[1],
          )
          if (!inside) continue
          for (const side of sides) {
            const edited = withoutTokenWhitespace(
              recorded.input,
              recorded.json,
              index,
              side,
            )
            if (edited === null) continue
            made++
            if (checkTree(recorded.input, edited).length === 0) {
              unreported.push(
                `${type}: ${recorded.name}, token ${index} ${side}`,
              )
            }
          }
        }
      }
      // The list stays true: a type in it has no such token, and a type not
      // in it has one.
      if (made === 0 && !excluded) {
        unreported.push(`${type}: no recorded tree has one`)
      }
      if (made > 0 && excluded) {
        unreported.push(`${type}: is listed as having none, and has one`)
      }
    }
    expect(unreported).toEqual([])
  }, 120_000)
})
