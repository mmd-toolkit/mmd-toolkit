import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { AGENTFLOW_CHILD_TYPES } from "../src/check-tree/agentflow.ts"
import { loadFixtures } from "../src/index.ts"
import {
  AGENTFLOW_CASES,
  AGENTFLOW_REJECTION_CASES,
  buildAgentflowCase,
} from "./agentflow-cases.ts"
import { copyOf, firstNode, setField } from "./check-tree-recorded.ts"
import { readFieldTables } from "./spec-field-tables.ts"
import { commentOf, tokenOf } from "./check-tree-trees.ts"

const fixtures = loadFixtures("agentflow")

describe("Agentflow tree sentences", () => {
  for (const testCase of AGENTFLOW_CASES)
    it(`accepts ${testCase.fixture}`, async () => {
      const fixture = (await fixtures).find(
        (candidate) => candidate.name === testCase.fixture,
      )
      if (fixture === undefined) throw new Error(testCase.fixture)
      expect(
        checkTree(
          fixture.input,
          buildAgentflowCase(testCase, fixture.input).tree,
        ),
        testCase.fixture,
      ).toEqual([])
    })
  for (const testCase of AGENTFLOW_REJECTION_CASES)
    it(`rejects ${testCase.fixture}`, async () => {
      const fixture = (await fixtures).find(
        (candidate) => candidate.name === testCase.fixture,
      )
      if (fixture === undefined) throw new Error(testCase.fixture)
      const problems = checkTree(
        fixture.input,
        buildAgentflowCase(testCase, fixture.input).tree,
      )
      expect(
        problems.some((problem) => problem.message.includes(testCase.problem)),
        JSON.stringify(problems),
      ).toBe(true)
    })
  it("declares child fields in the specification's visitation order", () => {
    for (const [type, fields] of readFieldTables()) {
      if (!type.startsWith("Agentflow")) continue
      const children = [...fields]
        .filter(
          ([, cell]) =>
            ![
              "string",
              "integer",
              "boolean",
              "string or null",
              "none",
            ].includes(cell),
        )
        .map(([field]) => field)
      expect(Object.keys(AGENTFLOW_CHILD_TYPES[type] ?? {}), type).toEqual(
        children,
      )
    }
  })
  it("rejects a comment falsely cut out of an opaque data interior", async () => {
    const fixture = (await fixtures).find(
      (candidate) => candidate.name === "div-data-percent-line-is-content",
    )
    const testCase = AGENTFLOW_CASES.find(
      (candidate) => candidate.fixture === "div-data-percent-line-is-content",
    )
    if (fixture === undefined || testCase === undefined)
      throw new Error("the opaque percent-line case is missing")
    const tree = buildAgentflowCase(testCase, fixture.input).tree
    expect(checkTree(fixture.input, tree)).toEqual([])
    const block = firstNode(tree, "AgentflowDataBlock")
    const interior = tree.tokens.find(
      (token) =>
        token.type === "RawText" &&
        block.range[0] < token.range[0] &&
        token.range[1] < block.range[1],
    )
    if (interior === undefined)
      throw new Error("the data has no RawText interior")
    const comment = commentOf(fixture.input, "%%", { text: "%% c" })
    setField(tree, "comments", [comment])
    setField(block, "value", "\n\nlabel: x\n")
    setField(
      tree,
      "tokens",
      tree.tokens.flatMap((token) =>
        token !== interior
          ? [token]
          : [
              tokenOf(fixture.input, "RawText", {
                text: "\n",
                from: interior.range[0],
              }),
              tokenOf(fixture.input, "RawText", {
                text: "\nlabel: x\n",
                from: comment.range[1],
              }),
            ],
      ),
    )
    expect(checkTree(fixture.input, tree)).toContainEqual({
      where: `Comment at ${comment.range[0]}-${comment.range[1]}`,
      message:
        "a preserved Agentflow comment is not allowed inside AgentflowDataBlock",
    })
  })
  it("rejects a comment falsely cut off the end of an accessibility value", async () => {
    const fixture = (await fixtures).find(
      (candidate) => candidate.name === "lex-title-inline-percent-content",
    )
    const testCase = AGENTFLOW_CASES.find(
      (candidate) => candidate.fixture === "lex-title-inline-percent-content",
    )
    if (fixture === undefined || testCase === undefined)
      throw new Error("the accessibility percent-content case is missing")
    const tree = buildAgentflowCase(testCase, fixture.input).tree
    expect(checkTree(fixture.input, tree)).toEqual([])
    const value = firstNode(tree, "AgentflowLiteral")
    const statement = firstNode(tree, "AgentflowAccTitleStatement")
    const end = value.range[0] + 1
    setField(value, "range", [value.range[0], end])
    setField(value, "value", "T")
    setField(statement, "range", [statement.range[0], end])
    setField(tree, "comments", [
      commentOf(fixture.input, "%%", { text: "%% c" }),
    ])
    setField(
      tree,
      "tokens",
      tree.tokens.map((token) =>
        token.type === "RawText" && token.range[0] === value.range[0]
          ? tokenOf(fixture.input, "RawText", {
              text: "T",
              from: value.range[0],
            })
          : token,
      ),
    )
    expect(
      checkTree(fixture.input, tree).some((problem) =>
        problem.message.includes(
          "comment is not allowed inside AgentflowAccTitleStatement",
        ),
      ),
    ).toBe(true)
  })
  const broken = [
    [
      "gram-split-failure-label",
      "AgentflowLink",
      "opening",
      null,
      "source order",
    ],
    ["db-data-block-adjacent", "AgentflowVertex", "data", [], "source order"],
    [
      "gram-flow-inline-data",
      "AgentflowFlowStatement",
      "data",
      [],
      "source order",
    ],
    [
      "gram-click-erased-before-url-tooltip",
      "AgentflowClickUrlStatement",
      "textBeforeTooltip",
      [],
      "source order",
    ],
    [
      "gram-click-erased-before-callback-tooltip",
      "AgentflowClickCallbackStatement",
      "textBeforeTooltip",
      [],
      "source order",
    ],
    [
      "lex-direction-line-greedy",
      "AgentflowDirectionStatement",
      "direction",
      "TB",
      "direction",
    ],
    [
      "lex-direction-line-greedy",
      "AgentflowDirectionStatement",
      "textBefore",
      null,
      "source order",
    ],
    [
      "lex-direction-line-greedy",
      "AgentflowDirectionStatement",
      "textAfter",
      null,
      "source order",
    ],
    [
      "gram-three-edge-kinds",
      "AgentflowArrow",
      "startMarker",
      "cross",
      "startMarker",
    ],
    ["gram-three-edge-kinds", "AgentflowArrow", "line", "dotted", "arrow line"],
    [
      "gram-three-edge-kinds",
      "AgentflowArrow",
      "endMarker",
      "none",
      "endMarker",
    ],
    [
      "db-edge-length-cap",
      "AgentflowArrow",
      "length",
      10,
      "written arrow length",
    ],
    [
      "gram-split-failure-label",
      "AgentflowOpeningArrow",
      "line",
      "dotted",
      "field line",
    ],
    ["gram-bracket-shapes", "AgentflowShape", "name", "hexagon", "shape name"],
    [
      "gram-bracket-shapes",
      "AgentflowLabel",
      "kind",
      "markdown",
      "kind of the label",
    ],
    [
      "gram-bracket-shapes",
      "AgentflowLabel",
      "value",
      "changed",
      "written text",
    ],
    ["gram-props", "AgentflowShape", "property", null, "property"],
    ["lex-flow-name-click-state", "AgentflowName", "parts", [], "parts"],
    [
      "lex-flow-name-click-state",
      "AgentflowIgnoredText",
      "value",
      "arbitrary",
      "erased form",
    ],
    [
      "gram-flow-all-forms",
      "AgentflowFlowStatement",
      "title",
      null,
      "source order",
    ],
    [
      "gram-flow-inline-data",
      "AgentflowDataBlock",
      "value",
      "different",
      "written text",
    ],
    [
      "gram-click-erased-before-url",
      "AgentflowClickUrlStatement",
      "target",
      "_blank",
      "target",
    ],
    [
      "gram-click-erased-before-url",
      "AgentflowClickUrlStatement",
      "textBeforeUrl",
      [],
      "source order",
    ],
    [
      "gram-style-whitespace-after-comma",
      "AgentflowStyleStatement",
      "styles",
      [],
      "styles",
    ],
    [
      "gram-style-whitespace-after-comma",
      "AgentflowLiteral",
      "value",
      "fill:blue",
      "written text",
    ],
    [
      "db-style-leading-whitespace",
      "AgentflowLinkStyleStatement",
      "interpolate",
      "linear",
      "node or null",
    ],
  ] as const
  for (const [fixtureName, type, field, value, message] of broken)
    it(`reports ${type}.${field} in ${fixtureName}`, async () => {
      const testCase = AGENTFLOW_CASES.find(
        (candidate) => candidate.fixture === fixtureName,
      )
      const fixture = (await fixtures).find(
        (candidate) => candidate.name === fixtureName,
      )
      if (testCase === undefined || fixture === undefined)
        throw new Error(fixtureName)
      const built = buildAgentflowCase(testCase, fixture.input)
      expect(checkTree(fixture.input, built.tree)).toEqual([])
      const tree = copyOf(built.tree)
      setField(firstNode(tree, type), field, value)
      expect(
        checkTree(fixture.input, tree).some((problem) =>
          problem.message.includes(message),
        ),
        message,
      ).toBe(true)
    })
})
