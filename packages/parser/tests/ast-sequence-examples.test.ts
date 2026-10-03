import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { Node, Range } from "../src/index.ts"
import { parse, traverseNodes } from "../src/index.ts"
import { examplesIn } from "./helpers/ast-examples.ts"
import { problemsOfTree } from "./helpers/tree-problems.ts"
import { allSequenceNodeTypes } from "./helpers/node-types.ts"

// The comments of `src/ast/sequence.ts` show examples of the syntax of each
// node type, with a line of `^` under each line of input for the range of
// the node. The examples are sequence diagrams. This test parses every
// example and compares the range.

/** The header line that the examples of statements stand after. */
const HEADER = "sequenceDiagram\n"

const examples = [
  ...examplesIn(
    readFileSync(new URL("../src/ast/sequence.ts", import.meta.url), "utf8"),
  ),
]

describe("the examples in the comments of the sequence node types", () => {
  it("cover every node type", () => {
    expect([...new Set(examples.map((example) => example.nodeType))]).toEqual([
      ...Object.keys(allSequenceNodeTypes),
    ])
  })

  it.each(examples)(
    "$nodeType: the marks under $input are the range of a node",
    ({ nodeType, input, range }) => {
      const isDiagram = nodeType === "SequenceDiagram"
      const text = isDiagram ? input : HEADER + input
      const offset = isDiagram ? 0 : HEADER.length
      const root = parse(text)
      expect(problemsOfTree(text, root)).toEqual([])
      const ranges: Range[] = []
      traverseNodes(root, {
        enterNode(node: Node) {
          if (node.type === nodeType) ranges.push(node.range)
        },
        leaveNode() {
          // Nothing to do on the way back.
        },
      })
      expect(ranges).toContainEqual([range[0] + offset, range[1] + offset])
    },
  )
})
