import { describe, expect, it } from "vitest"
import type { DiagramType } from "../src/index.ts"
import { nodeTokensIn } from "../src/check-tree/tokens.ts"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import { firstNode, problemsOf, says, setField } from "./check-tree-recorded.ts"
import type { MutationCase } from "./check-tree-recorded.ts"

// parser/docs/tokens.md, String tokens: the tokens of a StringLiteral, a node
// type that every diagram type shares, are one `String` token, or
// `StringFragment` tokens where a directive or an ignored `;` cuts it. The
// check is one for every diagram type (`src/check-tree/leaves.ts`); each case
// here changes the kind of a token of the first string of the recorded tree of
// a named fixture.

const MESSAGE =
  "the tokens of the string are not one String token or StringFragment tokens"

/** A case: a diagram type, a fixture of it with a string, which token of the string changes (by its place), the kind it gets, and the kinds the problem names. */
interface StringCase {
  readonly diagram: DiagramType
  readonly fixture: string
  readonly token: number
  readonly to: string
  readonly named: string
}

const CASES: readonly StringCase[] = [
  {
    diagram: "flowchart",
    fixture: "click-callback-tooltip",
    token: 0,
    to: "RawText",
    named: "RawText",
  },
  {
    diagram: "class",
    fixture: "config-security-level-other-class-label",
    token: 0,
    to: "RawText",
    named: "RawText",
  },
  {
    diagram: "state",
    fixture: "config-security-level-other-alias",
    token: 0,
    to: "RawText",
    named: "RawText",
  },
  {
    diagram: "er",
    fixture: "config-security-level-other-subgraph-title-trimmed",
    token: 0,
    to: "RawText",
    named: "RawText",
  },
  {
    diagram: "sankey",
    fixture: "db-quoted-fields",
    token: 0,
    to: "RawText",
    named: "RawText",
  },
  {
    diagram: "sankey",
    fixture: "db-directive-in-quotes",
    token: 0,
    to: "String",
    named: "String, StringFragment",
  },
  {
    diagram: "sankey",
    fixture: "db-directive-in-quotes",
    token: 1,
    to: "RawText",
    named: "StringFragment, RawText",
  },
]

/** The mutation of `testCase`: the kind of one token of the first string of the tree is set. */
function mutationOf(testCase: StringCase): MutationCase {
  return {
    name: `a token of the string of ${testCase.fixture} as ${testCase.to}`,
    fixture: testCase.fixture,
    mutate: (root: CheckedRoot) => {
      const string = firstNode(root, "StringLiteral")
      const tokens = nodeTokensIn(root, string.range)
      const token = tokens[testCase.token]
      if (token === undefined) throw new Error("no such token")
      setField(token, "type", testCase.to)
    },
    expected: `${MESSAGE}: ${testCase.named}`,
  }
}

describe("the tokens of a string, for every diagram type", () => {
  for (const testCase of CASES) {
    it(`passes the recorded tree of ${testCase.diagram}/${testCase.fixture} and fails a token of its string as ${testCase.to}`, () => {
      const mutation = mutationOf(testCase)
      const { base, mutated } = problemsOf(testCase.diagram, mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }
})
