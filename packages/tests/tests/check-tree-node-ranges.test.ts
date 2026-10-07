import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { copyOf, recordedTree, says, setField } from "./check-tree-recorded.ts"
import { handMadeRoot } from "./check-tree-trees.ts"

// positions.md, Invariants: the range of a node runs from the start of a token
// to the end of one, inside its parent, and the child nodes of a node do not
// overlap; the body covers the tokens of the diagram.

const FIXTURE = "db-message-activate-target"

/** The first node of `type` of `tree`. */
function nodeOf(type: string, tree: CheckedRoot): CheckedNode {
  const node = nodesOf(tree).find((candidate) => candidate.type === type)
  if (node === undefined) throw new Error(`no ${type}`)
  return node
}

describe("checkTree: the ranges of the nodes", () => {
  const { input, tree } = recordedTree("sequence", FIXTURE)

  it("passes the recorded tree", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a node that starts before its parent", () => {
    // `A` of `A->>+B: x` starts one character early, at the line feed.
    const broken = copyOf(tree)
    setField(nodeOf("SequenceIdentifier", broken), "range", [15, 17])
    expect(
      says(
        checkTree(input, broken),
        "SequenceIdentifier at 15-17: lies outside SequenceMessageStatement at 16-25",
      ),
    ).toBe(true)
  })

  it("fails a node that ends where no token ends", () => {
    const broken = copyOf(tree)
    setField(nodeOf("SequenceIdentifier", broken), "range", [16, 18])
    expect(
      says(
        checkTree(input, broken),
        "SequenceIdentifier at 16-18: does not run from the start of a token to the end of a token",
      ),
    ).toBe(true)
  })

  it("fails child nodes that overlap", () => {
    // `A` ends one character into the arrow after it.
    const broken = copyOf(tree)
    setField(nodeOf("SequenceIdentifier", broken), "range", [16, 18])
    expect(
      says(
        checkTree(input, broken),
        "SequenceArrow at 17-20: overlaps the child node SequenceIdentifier at 16-18 of SequenceMessageStatement at 16-25",
      ),
    ).toBe(true)
  })

  it("fails a tree whose text has no token", () => {
    const source = "  \n"
    expect(checkTree(source, handMadeRoot(source, { tokens: [] }))).toEqual([
      {
        where: "ErrorDiagram at 0-0",
        message: "does not run from the start of a token to the end of a token",
      },
      { where: "Root.body", message: "has no token" },
    ])
  })

  it("fails a body of a type that is no diagram", () => {
    const source = "error"
    const root = handMadeRoot(source, {
      bodyType: "StringLiteral",
      tokens: [["RawText", "error"]],
    })
    expect(
      says(
        checkTree(source, root),
        "Root.body: the body type StringLiteral is no diagram of the specification",
      ),
    ).toBe(true)
  })
})
