import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import { copyOf, recordedTree, says } from "./check-tree-recorded.ts"

// ast.md, Directive and Root: the records that every diagram shares. The name
// of a directive is its first word, and the diagram type of the root is one of
// those of its body.

describe("checkTree: the name of a directive", () => {
  const { input, tree } = recordedTree(
    "state",
    "lex-directive-name-next-line-after-state-name",
  )

  it("passes the name that follows the whitespace at the start of the value", () => {
    // The value of the directive is a line feed, spaces, and `A`: its name is
    // `A`, the first word.
    expect(tree.directives.map((directive) => directive.name)).toEqual(["A"])
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails an empty name for a value that starts with whitespace", () => {
    const broken = copyOf(tree)
    const [directive] = broken.directives
    if (directive === undefined) throw new Error("unexpected tree")
    Object.assign(directive, { name: "" })
    expect(checkTree(input, broken)).toEqual([
      { where: "Directive at 28-39", message: 'name: "", not "A"' },
    ])
  })
})

describe("checkTree: the diagram type of the root", () => {
  it("fails a diagram type that is none of those of the body", () => {
    const { input, tree } = recordedTree(
      "sequence",
      "db-message-activate-target",
    )
    const broken: CheckedRoot = { ...copyOf(tree), diagramType: "classDiagram" }
    expect(checkTree(input, broken)).toEqual([
      {
        where: "Root",
        message:
          "the diagram type classDiagram is not one of those of a SequenceDiagram: sequence",
      },
    ])
    expect(says(checkTree(input, tree), "diagram type")).toBe(false)
  })

  it("passes any of the diagram types that a flowchart body has", () => {
    // `flowchart-elk` is the type of a header the tree of `graph` does not
    // have, but the body of a flowchart has all three of the documents.
    const { input, tree } = recordedTree(
      "flowchart",
      "spec-flow-singlenode-a5fa3415",
    )
    for (const diagramType of ["flowchart-v2", "flowchart-elk", "swimlane"]) {
      expect(checkTree(input, { ...copyOf(tree), diagramType })).toEqual([])
    }
    expect(
      says(
        checkTree(input, { ...copyOf(tree), diagramType: "sequence" }),
        "is not one of those of a FlowchartDiagram",
      ),
    ).toBe(true)
  })
})
