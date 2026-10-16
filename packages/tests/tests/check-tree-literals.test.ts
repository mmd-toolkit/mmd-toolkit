import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import type { DiagramType } from "../src/index.ts"
import {
  copyOf,
  firstNode,
  recordedTree,
  says,
  setField,
} from "./check-tree-recorded.ts"

// positions.md, Invariants, last item, and ast.md, StringLiteral: the `raw` of
// a StringLiteral or a NumericLiteral is the source text of its range, and
// `closed` of a StringLiteral is whether its `raw` has more than one character
// and ends with the quote that it starts with.

/** One case: a literal of a recorded tree, a change, and the problem that it causes. */
interface LiteralCase {
  readonly name: string
  readonly diagram: DiagramType
  readonly fixture: string
  readonly type: string
  readonly change: (literal: CheckedNode) => void
  readonly expected: string
}

const CASES: readonly LiteralCase[] = [
  {
    name: "a StringLiteral whose raw is not its text",
    diagram: "class",
    fixture: "db-link-undefined-class",
    type: "StringLiteral",
    change: (literal) => {
      setField(literal, "raw", "Z")
    },
    expected: 'StringLiteral at 20-23: raw: "Z", not "\\"u\\""',
  },
  {
    name: "a NumericLiteral whose raw is not its text",
    diagram: "sequence",
    fixture: "db-autonumber-fraction",
    type: "NumericLiteral",
    change: (literal) => {
      setField(literal, "raw", "0.5")
    },
    expected: 'NumericLiteral at 27-29: raw: "0.5", not ".5"',
  },
  {
    name: "a closed StringLiteral recorded as not closed",
    diagram: "class",
    fixture: "db-link-undefined-class",
    type: "StringLiteral",
    change: (literal) => {
      setField(literal, "closed", false)
    },
    expected: "StringLiteral at 20-23: closed: false, not true",
  },
]

describe("checkTree: the raw text and the closing of a literal", () => {
  for (const entry of CASES) {
    it(`passes the recorded tree of ${entry.fixture} and fails ${entry.name}`, () => {
      const { input, tree } = recordedTree(entry.diagram, entry.fixture)
      expect(checkTree(input, tree)).toEqual([])
      const broken = copyOf(tree)
      entry.change(firstNode(broken, entry.type))
      const problems = checkTree(input, broken)
      expect(says(problems, entry.expected), JSON.stringify(problems)).toBe(
        true,
      )
    })
  }
})
