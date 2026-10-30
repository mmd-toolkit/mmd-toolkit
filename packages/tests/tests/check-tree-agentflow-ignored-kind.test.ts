import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { childOf } from "../src/check-tree/statement-checks.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { firstNode, recordedTree, setField } from "./check-tree-recorded.ts"

// Each wrong kind is another allowed word, so the position/form check must
// reject it even though the scalar vocabulary accepts it.
const WRONG_KINDS: readonly {
  readonly name: string
  readonly fixture: string
  readonly kind: string
  readonly wrong: string
  readonly field?: "textBefore" | "textAfter"
}[] = [
  {
    name: "the erased click in a name",
    fixture: "lex-flow-name-click-state",
    kind: "click",
    wrong: "direction-text",
  },
  {
    name: "an empty string in a name",
    fixture: "lex-empty-string-in-flow-name",
    kind: "empty-string",
    wrong: "empty-markdown-string",
  },
  {
    name: "an empty markdown string in a name",
    fixture: "lex-empty-markdown-in-flow-name",
    kind: "empty-markdown-string",
    wrong: "empty-string",
  },
  {
    name: "an empty call in a connector name",
    fixture: "lex-empty-call-in-connector-name",
    kind: "empty-call",
    wrong: "empty-description-block",
  },
  {
    name: "an empty description block in a name",
    fixture: "lex-empty-description-in-flow-name",
    kind: "empty-description-block",
    wrong: "empty-call",
  },
  {
    name: "an empty string after a name click",
    fixture: "lex-name-click-empty-string-before-text",
    kind: "empty-string",
    wrong: "click",
  },
  {
    name: "an empty markdown string after a name click",
    fixture: "lex-name-click-empty-markdown-before-text",
    kind: "empty-markdown-string",
    wrong: "click",
  },
  {
    name: "a direction prefix",
    fixture: "lex-direction-line-greedy",
    kind: "direction-text",
    wrong: "click",
    field: "textBefore",
  },
  {
    name: "a direction suffix",
    fixture: "lex-direction-line-greedy",
    kind: "direction-text",
    wrong: "empty-string",
    field: "textAfter",
  },
  {
    name: "an empty description block before a URL",
    fixture: "gram-empty-description-before-href",
    kind: "empty-description-block",
    wrong: "direction-text",
  },
  {
    name: "an erased click before a URL",
    fixture: "gram-click-erased-before-url",
    kind: "click",
    wrong: "empty-string",
  },
  {
    name: "an erased click before a URL tooltip",
    fixture: "gram-click-erased-before-url-tooltip",
    kind: "click",
    wrong: "empty-call",
  },
  {
    name: "an erased click before a callback tooltip",
    fixture: "gram-click-erased-before-callback-tooltip",
    kind: "click",
    wrong: "empty-description-block",
  },
  {
    name: "an empty string before a URL tooltip",
    fixture: "lex-mixed-empty-forms-before-url-tooltip",
    kind: "empty-string",
    wrong: "empty-markdown-string",
  },
  {
    name: "an empty call before a URL tooltip",
    fixture: "lex-mixed-empty-forms-before-url-tooltip",
    kind: "empty-call",
    wrong: "empty-description-block",
  },
  {
    name: "an empty markdown string before a URL tooltip",
    fixture: "lex-mixed-empty-forms-before-url-tooltip",
    kind: "empty-markdown-string",
    wrong: "empty-string",
  },
]

describe("AgentflowIgnoredText kind", () => {
  for (const testCase of WRONG_KINDS)
    it(`rejects the wrong kind for ${testCase.name}`, () => {
      const { input, tree } = recordedTree("agentflow", testCase.fixture)
      expect(checkTree(input, tree)).toEqual([])
      const part =
        testCase.field === undefined
          ? nodesOf(tree).find(
              (node) =>
                node.type === "AgentflowIgnoredText" &&
                node.kind === testCase.kind,
            )
          : childOf(
              firstNode(tree, "AgentflowDirectionStatement"),
              testCase.field,
            )
      if (part === null || part === undefined) throw new Error(testCase.name)
      expect(part.kind).toBe(testCase.kind)
      setField(part, "kind", testCase.wrong)
      const problems = checkTree(input, tree)
      const message =
        testCase.field === undefined
          ? "the ignored-text kind must match its recognized erased form"
          : `${testCase.field} must have kind direction-text`
      expect(
        problems.some(
          (problem) =>
            problem.where ===
              `AgentflowIgnoredText at ${part.range[0]}-${part.range[1]}` &&
            problem.message.startsWith(message),
        ),
        JSON.stringify(problems),
      ).toBe(true)
    })

  it("rejects a kind outside the six recognized words", () => {
    const { input, tree } = recordedTree(
      "agentflow",
      "lex-flow-name-click-state",
    )
    expect(checkTree(input, tree)).toEqual([])
    setField(firstNode(tree, "AgentflowIgnoredText"), "kind", "other")
    expect(
      checkTree(input, tree).some((problem) =>
        problem.message.startsWith("the field kind is "),
      ),
    ).toBe(true)
  })
})
