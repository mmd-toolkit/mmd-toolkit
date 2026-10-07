import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { getFixturesRoot } from "../src/index.ts"

// The form of a tree (`shape.ts`): a tree that lacks a field, has a field that
// its type does not have or one of another kind, or has a range that is no
// offset pair, is reported as such and does not make the other checks throw.

const FIXTURE = "sequence/db-message-activate-target"

/** The input and a fresh copy of the recorded tree of the fixture. */
function recorded(): { input: string; tree: CheckedRoot } {
  const directory = path.join(getFixturesRoot(), FIXTURE)
  return {
    input: readFileSync(path.join(directory, "input.mmd"), "utf8"),
    tree: JSON.parse(
      readFileSync(path.join(directory, "ast.json"), "utf8"),
    ) as CheckedRoot,
  }
}

/** The first node of `type` in `tree`. */
function nodeOf(tree: CheckedRoot, type: string): CheckedNode {
  const node = nodesOf(tree).find((candidate) => candidate.type === type)
  if (node === undefined) throw new Error(`${FIXTURE} has no ${type}`)
  return node
}

/** The messages of the problems of the tree after `change`. */
function problemsAfter(change: (tree: CheckedRoot) => void): string[] {
  const { input, tree } = recorded()
  change(tree)
  return checkTree(input, tree).map(
    (problem) => `${problem.where}: ${problem.message}`,
  )
}

/** Sets `field` of `target` to `value`. */
function set(target: object, field: string, value: unknown): void {
  Reflect.set(target, field, value)
}

/** A copy of the JSON `value` in which the keys of every object are in the reverse order. */
function withReversedKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withReversedKeys)
  if (typeof value !== "object" || value === null) return value
  return Object.fromEntries(
    Object.entries(value)
      .reverse()
      .map(([key, entry]) => [key, withReversedKeys(entry)]),
  )
}

describe("checkTree: the form of a tree", () => {
  it("passes the recorded tree", () => {
    expect(problemsAfter(() => undefined)).toEqual([])
  })

  it("reports a node that lacks a field", () => {
    const problems = problemsAfter((tree) => {
      Reflect.deleteProperty(nodeOf(tree, "SequenceMessageStatement"), "text")
    })
    expect(problems).toEqual([
      expect.stringContaining("SequenceMessageStatement"),
    ])
    expect(problems[0]).toContain("lacks the field text")
  })

  it("reports a field of a node that is of another kind, and reports no more", () => {
    const problems = problemsAfter((tree) => {
      set(nodeOf(tree, "SequenceMessageStatement"), "text", "Z")
    })
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain(
      "the field text is string, not a node or null",
    )
  })

  it("reports a list that is a string, and a value of another type", () => {
    const list = problemsAfter((tree) => {
      set(nodeOf(tree, "SequenceDiagram"), "body", "Z")
    })
    expect(list[0]).toContain("the field body is string, not a list")
    const value = problemsAfter((tree) => {
      set(
        nodeOf(tree, "SequenceMessageStatement"),
        "toCentralConnection",
        "yes",
      )
    })
    expect(value[0]).toContain(
      "the field toCentralConnection is string, not boolean",
    )
  })

  it("reports a field that the type does not have", () => {
    const problems = problemsAfter((tree) => {
      set(nodeOf(tree, "SequenceMessageStatement"), "extra", 1)
    })
    expect(problems[0]).toContain(
      "has the field extra, which its type does not have",
    )
  })

  it("reports a type that the specification does not define", () => {
    const problems = problemsAfter((tree) => {
      set(
        nodeOf(tree, "SequenceMessageStatement"),
        "type",
        "SequenceFooStatement",
      )
    })
    expect(problems[0]).toContain(
      "is of a type that the specification does not define",
    )
  })

  it("reports a range that is no offset pair and a loc that is no location", () => {
    const range = problemsAfter((tree) => {
      set(nodeOf(tree, "SequenceMessageStatement"), "range", [5, 1])
    })
    expect(range[0]).toContain("range that is no offset pair")
    const loc = problemsAfter((tree) => {
      set(nodeOf(tree, "SequenceMessageStatement"), "loc", null)
    })
    expect(loc[0]).toContain("loc that is no location")
  })

  it("reports the records of the root that are missing or of another kind, without throwing", () => {
    for (const field of [
      "frontmatter",
      "directives",
      "comments",
      "tokens",
      "body",
    ]) {
      const missing = problemsAfter((tree) => {
        Reflect.deleteProperty(tree, field)
      })
      expect(missing[0]).toContain(`lacks the field ${field}`)
      const wrong = problemsAfter((tree) => {
        set(tree, field, "Z")
      })
      expect(wrong.length).toBeGreaterThan(0)
    }
  })

  it("reports a record of the root whose fields are wrong", () => {
    const problems = problemsAfter((tree) => {
      set(tree.tokens[0] ?? {}, "value", 1)
    })
    expect(problems[0]).toContain("the field value is number, not string")
  })

  it("reports a tree that is no Root", () => {
    const { input } = recorded()
    expect(
      checkTree(input, { type: "Foo" } as unknown as CheckedRoot).length,
    ).toBeGreaterThan(0)
  })

  it("reports a required node that is null", () => {
    const problems = problemsAfter((tree) => {
      set(nodeOf(tree, "SequenceMessageStatement"), "arrow", null)
    })
    expect(problems).toEqual([
      "SequenceMessageStatement at 16-25: the field arrow is null, not a node",
    ])
  })

  it("reports an entry of a list that is no node, and a null entry of a list that holds no null", () => {
    for (const entry of [5, null]) {
      expect(
        problemsAfter((tree) => {
          set(nodeOf(tree, "SequenceDiagram"), "body", [entry])
        }),
      ).toEqual([
        "SequenceDiagram at 0-36.body[0]: is no node: it has no type and no range",
      ])
    }
  })

  it("reports a range that is no pair of offsets, and a loc that lacks its end or itself", () => {
    /** The problems after `change` of the first message. */
    function statement(change: (node: CheckedNode) => void): string[] {
      return problemsAfter((tree) => {
        change(nodeOf(tree, "SequenceMessageStatement"))
      })
    }

    // A range of three entries is the range of no node: the object is no node.
    expect(
      statement((node) => {
        set(node, "range", [16, 20, 25])
      }),
    ).toEqual([
      "SequenceDiagram at 0-36.body[0]: is no node: it has no type and no range",
    ])
    // A fractional offset and a negative one are no offsets.
    for (const range of [
      [16, 25.5],
      [-1, 25],
    ]) {
      expect(
        statement((node) => {
          set(node, "range", range)
        }),
      ).toEqual([
        `SequenceMessageStatement at ${range.join("-")}: has a range that is no offset pair`,
      ])
    }
    expect(
      statement((node) => {
        set(node, "loc", { start: { line: 2, column: 0 } })
      }),
    ).toEqual([
      "SequenceMessageStatement at 16-25: has a loc that is no location",
    ])
    expect(
      statement((node) => {
        Reflect.deleteProperty(node, "loc")
      }),
    ).toEqual([
      "SequenceMessageStatement at 16-25: has a loc that is no location",
    ])
  })

  it("does not use the order of the fields of a node or the order of the keys of a loc", () => {
    // Every object of the tree, a record and a position too, with its keys
    // in the reverse order.
    const { input, tree } = recorded()
    expect(checkTree(input, withReversedKeys(tree) as CheckedRoot)).toEqual([])
  })
})
