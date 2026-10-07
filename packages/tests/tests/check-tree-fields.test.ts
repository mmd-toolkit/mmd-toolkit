import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { NODE_FIELDS } from "../src/check-tree/node-fields.ts"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot, loadFixtures } from "../src/index.ts"

// Every field of every node type of the tree, broken in a recorded tree, is
// reported by the check of a tree, except the fields that `UNCHECKED_FIELDS`
// lists with the reason.

const DIAGRAMS: readonly DiagramType[] = [
  "common",
  "flowchart",
  "sequence",
  "class",
  "state",
]

/**
 * The fields that the check of a tree does not compare with the source, with
 * the reason. A field that is not here is broken, and the check must report
 * the tree.
 */
const UNCHECKED_FIELDS: Readonly<Record<string, string>> = {}

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

/** An object of a tree, a node or a record, with its fields. */
type TreeObject = Record<string, unknown>

/** The objects of `list` as objects with fields. */
function objects(list: readonly object[]): TreeObject[] {
  return list as unknown as TreeObject[]
}

/** The objects that a mutation of `type` breaks, found in the tree: nodes, or records of the root. */
function instancesOf(tree: CheckedRoot, type: string): TreeObject[] {
  switch (type) {
    case "Root":
      return objects([tree])
    case "Token":
      return objects(tree.tokens)
    case "Comment":
      return objects(tree.comments)
    case "Directive":
      return objects(tree.directives)
    case "Frontmatter":
      return objects(tree.frontmatter === null ? [] : [tree.frontmatter])
    default:
      return objects(nodesOf(tree).filter((node) => node.type === type))
  }
}

/** The place of `object` as the problems name it: its `type` and its range. */
function placeOf(object: TreeObject): string {
  const [start, end] = object.range as TreeRange
  return `${String(object.type)} at ${start}-${end}`
}

/** The value that breaks the value of a field: a different one of the same kind. */
function brokenValue(value: unknown, valueType: string | undefined): unknown {
  switch (valueType) {
    case "boolean":
      return value !== true
    case "number":
      return typeof value === "number" ? value + 1 : 0
    case "range":
      return [0, 0]
    default:
      return typeof value === "string" ? `${value}Z` : "Z"
  }
}

describe("the fields of the nodes of a recorded tree", () => {
  it("are all reported when broken, except those listed as unchecked", async () => {
    const trees = await recordedTrees()
    const unreported: string[] = []
    for (const [type, fields] of Object.entries(NODE_FIELDS)) {
      for (const [field, spec] of Object.entries(fields)) {
        let reported: boolean | undefined
        for (const recorded of trees) {
          const tree = JSON.parse(recorded.json) as CheckedRoot
          const instances = instancesOf(tree, type)
          // An instance with a value in the field when there is one, so that
          // the field is broken from a value, else any instance.
          const instance =
            instances.find((candidate) => candidate[field] !== null) ??
            instances[0]
          if (instance === undefined) continue
          instance[field] =
            spec.shape === "value"
              ? brokenValue(instance[field], spec.valueType)
              : "Z"
          reported = checkTree(recorded.input, tree).length > 0
          break
        }
        if (reported === undefined) {
          unreported.push(`${type}.${field}: no recorded tree has it`)
        } else if (
          !reported &&
          !Object.hasOwn(UNCHECKED_FIELDS, `${type}.${field}`)
        ) {
          unreported.push(`${type}.${field}`)
        }
      }
    }
    expect(unreported).toEqual([])
  }, 120_000)

  it("are reported at their own node when a field that may be null is null where a word is written, and a word where none is written", async () => {
    // The first test breaks each field from a word, to another word: a check
    // that reads the field only when it is not null passes that. Here the
    // field is made null where the source writes the word, and a word where it
    // writes none, and the problem is the one of the node that holds the field.
    const trees = await recordedTrees()
    const unreported: string[] = []
    for (const [type, fields] of Object.entries(NODE_FIELDS)) {
      for (const [field, spec] of Object.entries(fields)) {
        if (spec.valueType !== "stringOrNull") continue
        for (const [written, broken] of [
          [true, null],
          [false, "Z"],
        ] as const) {
          const case_ = `${type}.${field} ${written ? "null where a word is written" : "a word where none is written"}`
          let outcome = `${case_}: no recorded tree has it`
          for (const recorded of trees) {
            const tree = JSON.parse(recorded.json) as CheckedRoot
            const instance = instancesOf(tree, type).find(
              (candidate) => (candidate[field] !== null) === written,
            )
            if (instance === undefined) continue
            instance[field] = broken
            const where = placeOf(instance)
            const problems = checkTree(recorded.input, tree)
            outcome = problems.some((problem) => problem.where === where)
              ? ""
              : `${case_}: no problem at ${where} in ${recorded.name}`
            break
          }
          if (outcome !== "") unreported.push(outcome)
        }
      }
    }
    expect(unreported).toEqual([])
  }, 120_000)
})
