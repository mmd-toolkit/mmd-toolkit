import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { TOKEN_KINDS_THAT_TOUCH_IN_VALUE_NODES } from "../src/check-tree/node-types.ts"
import { withArticle } from "../src/check-tree/problems.ts"
import type { CheckedRoot, CheckedToken } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { DiagramType } from "../src/index.ts"
import { copyOf, recordedTree, setField } from "./check-tree-recorded.ts"
import { locationOf } from "./check-tree-trees.ts"

// parser/docs/tokens/<diagram>.md, Tokens: a token is a run of the units of one
// item and one kind that follow one another with nothing between them, and a
// value node is made of the units of one item. A recorded tree whose token is
// split into two tokens of its kind that touch has the same values, since the
// tokens joined are the same text, so only a check of the tokens finds it.

/** A token of a value node that a case splits in two, at `at` characters from its start. */
interface SplitCase {
  readonly diagram: DiagramType
  readonly fixture: string
  /** The type of the node that holds the token that is split. */
  readonly node: string
  readonly token: string
  readonly at?: number
}

const CASES: readonly SplitCase[] = [
  {
    diagram: "agentflow",
    fixture: "db-all-fields",
    node: "AgentflowLiteral",
    token: "Accessible",
  },
  {
    diagram: "architecture",
    fixture: "db-mixed",
    node: "Identifier",
    token: "cross",
  },
  { diagram: "block", fixture: "db-name-at", node: "Identifier", token: "a@b" },
  {
    diagram: "c4",
    fixture: "db-title-html",
    node: "C4Literal",
    token: "<b>T</b>",
  },
  {
    diagram: "class",
    fixture: "db-link-digit",
    node: "ClassIdentifier",
    token: "1A",
  },
  {
    diagram: "cynefin",
    fixture: "db-prototype-texts",
    node: "CynefinLiteral",
    token: "__proto__",
  },
  {
    diagram: "er",
    fixture: "db-style-twice",
    node: "ErLiteral",
    token: "fill:red",
    at: 5,
  },
  {
    diagram: "eventmodeling",
    fixture: "db-all-fields",
    node: "Identifier",
    token: "01",
  },
  {
    diagram: "flowchart",
    fixture: "db-style-edge-id",
    node: "Identifier",
    token: "foo",
  },
  {
    diagram: "gantt",
    fixture: "db-sections",
    node: "GanttLiteral",
    token: "S1",
  },
  {
    diagram: "gitgraph",
    fixture: "db-prototype-ids",
    node: "Identifier",
    token: "__proto__",
  },
  {
    diagram: "info",
    fixture: "div-c4dynamic-block",
    node: "InfoLiteral",
    token: "C4Dynamic",
  },
  {
    diagram: "ishikawa",
    fixture: "db-all-fields",
    node: "IshikawaLiteral",
    token: "Effect",
  },
  {
    diagram: "journey",
    fixture: "db-sections",
    node: "JourneyLiteral",
    token: "S1",
  },
  {
    diagram: "kanban",
    fixture: "db-name-no-id",
    node: "KanbanLabel",
    token: "Todo",
  },
  {
    diagram: "mindmap",
    fixture: "db-icon-line",
    node: "MindmapLiteral",
    token: "root",
  },
  {
    diagram: "packet",
    fixture: "db-row-exact",
    node: "NumericLiteral",
    token: "32",
  },
  {
    diagram: "pie",
    fixture: "db-all-fields",
    node: "PieLiteral",
    token: "Chart",
  },
  {
    diagram: "quadrant",
    fixture: "db-name-dash",
    node: "QuadrantLabel",
    token: "A-B",
  },
  {
    diagram: "radar",
    fixture: "db-min-above-max",
    node: "NumericLiteral",
    token: "10",
  },
  {
    diagram: "railroad",
    fixture: "db-acc-descr-block-two-lines-before-statement",
    node: "Identifier",
    token: "word",
  },
  {
    diagram: "requirement",
    fixture: "db-class-def",
    node: "RequirementLiteral",
    token: "fill:#f00",
    at: 5,
  },
  {
    diagram: "requirement",
    fixture: "db-style-statement",
    node: "RequirementLiteral",
    token: "fill:#f9f",
    at: 5,
  },
  {
    diagram: "requirement",
    fixture: "db-requirement-name-spaces",
    node: "RequirementIdentifier",
    token: "spaced name",
    at: 3,
  },
  {
    diagram: "requirement",
    fixture: "db-requirement-value-spaces",
    node: "RequirementLiteral",
    token: "spaced out",
    at: 6,
  },
  {
    diagram: "requirement",
    fixture: "db-acc-title-descr",
    node: "RequirementLiteral",
    token: "t1",
  },
  {
    diagram: "sankey",
    fixture: "db-everything",
    node: "SankeyLiteral",
    token: "12.5",
  },
  {
    diagram: "sequence",
    fixture: "db-box-colour-candidate-word-prefix",
    node: "SequenceLiteral",
    token: "-team",
  },
  {
    diagram: "sequence",
    fixture: "db-links-null",
    node: "SequenceLiteral",
    token: "null",
  },
  {
    diagram: "state",
    fixture: "db-nested-style",
    node: "StateLiteral",
    token: "fill:red",
    at: 5,
  },
  {
    diagram: "timeline",
    fixture: "db-period-cjk",
    node: "TimelineLiteral",
    token: "日本語",
  },
  {
    diagram: "treemap",
    fixture: "db-all-fields",
    node: "Identifier",
    token: "sectionClass",
  },
  {
    diagram: "treeview",
    fixture: "db-icon-none",
    node: "Identifier",
    token: "none",
  },
  {
    diagram: "usecase",
    fixture: "db-all-fields",
    node: "Identifier",
    token: "Clerk",
  },
  { diagram: "venn", fixture: "db-markup", node: "Identifier", token: "color" },
  {
    diagram: "wardley",
    fixture: "db-zero-last",
    node: "NumericLiteral",
    token: "0.3",
  },
  {
    diagram: "xychart",
    fixture: "db-data-everything",
    node: "XychartLiteral",
    token: "AT",
  },
  {
    diagram: "agentflow",
    fixture: "lex-name-click-exit-ls",
    node: "AgentflowIgnoredText",
    token: "click",
  },
  {
    diagram: "architecture",
    fixture: "hidden-yaml-cr",
    node: "ArchitectureIgnoredText",
    token: "---\rignored\r---",
  },
  {
    diagram: "class",
    fixture: "db-direction-then-comment",
    node: "ClassIgnoredText",
    token: "%% vertical",
  },
  {
    diagram: "cynefin",
    fixture: "hidden-yaml-cr",
    node: "CynefinIgnoredText",
    token: "---\nx\n---",
  },
  {
    diagram: "er",
    fixture: "lex-direction-line-as-role",
    node: "ErIgnoredText",
    token: "A ||--o{ B :",
  },
  {
    diagram: "eventmodeling",
    fixture: "hidden-yaml-cr",
    node: "EventmodelingIgnoredText",
    token: "---\rx\r---",
  },
  {
    diagram: "flowchart",
    fixture: "lex-direction-line-in-label",
    node: "FlowchartIgnoredText",
    token: "A[",
  },
  {
    diagram: "gitgraph",
    fixture: "lex-yaml-crlf",
    node: "GitgraphIgnoredText",
    token: "---\r\nx: y\r\n---",
  },
  {
    diagram: "info",
    fixture: "hidden-yaml-cr",
    node: "InfoIgnoredText",
    token: "---\rx: y\r---",
  },
  {
    diagram: "journey",
    fixture: "db-task-extra-colon",
    node: "JourneyIgnoredText",
    token: ": c, d",
  },
  {
    diagram: "packet",
    fixture: "hidden-yaml-cr",
    node: "PacketIgnoredText",
    token: "---\rx\r---",
  },
  {
    diagram: "pie",
    fixture: "review-yaml-hidden-cr",
    node: "PieIgnoredText",
    token: "---\rx: y\r---",
  },
  {
    diagram: "radar",
    fixture: "hidden-yaml-body",
    node: "RadarIgnoredText",
    token: "---\nnot: [valid\n---",
  },
  {
    diagram: "railroad",
    fixture: "ir-hidden-yaml-cr",
    node: "RailroadIgnoredText",
    token: "---\rx\r---",
  },
  {
    diagram: "requirement",
    fixture: "lex-direction-tb-first",
    node: "RequirementIgnoredText",
    token: "direction LR x",
  },
  {
    diagram: "state",
    fixture: "lex-alias-third-part",
    node: "StateIgnoredText",
    token: ": y",
  },
  {
    diagram: "wardley",
    fixture: "hidden-yaml-eof",
    node: "WardleyIgnoredText",
    token: "---\nx\n---",
  },
]

/** The tree of `tree` whose token `token` is two touching tokens of its kind, the first with `at` characters. */
function withSplit(
  input: string,
  tree: CheckedRoot,
  token: CheckedToken,
  at: number,
): CheckedRoot {
  const broken = copyOf(tree)
  const index = broken.tokens.findIndex(
    (candidate) =>
      candidate.type === token.type &&
      candidate.range[0] === token.range[0] &&
      candidate.range[1] === token.range[1],
  )
  const middle = token.range[0] + at
  const first: CheckedToken = {
    ...token,
    value: token.value.slice(0, at),
    range: [token.range[0], middle],
    loc: locationOf(input, [token.range[0], middle]),
  }
  const second: CheckedToken = {
    ...token,
    value: token.value.slice(at),
    range: [middle, token.range[1]],
    loc: locationOf(input, [middle, token.range[1]]),
  }
  setField(broken, "tokens", [
    ...broken.tokens.slice(0, index),
    first,
    second,
    ...broken.tokens.slice(index + 1),
  ])
  return broken
}

describe("checkTree: a token of a value node split into two touching tokens", () => {
  for (const row of CASES) {
    it(`fails ${row.token} of a ${row.node} of ${row.diagram}/${row.fixture} split in two`, () => {
      const { input, tree } = recordedTree(row.diagram, row.fixture)
      expect(checkTree(input, tree)).toEqual([])
      const node = nodesOf(tree).find(
        (candidate) =>
          candidate.type === row.node &&
          tree.tokens.some(
            (held) =>
              held.value === row.token &&
              candidate.range[0] <= held.range[0] &&
              held.range[1] <= candidate.range[1],
          ),
      )
      if (node === undefined) throw new Error("the tree has no such node")
      const token = tree.tokens.find(
        (candidate) =>
          candidate.value === row.token &&
          node.range[0] <= candidate.range[0] &&
          candidate.range[1] <= node.range[1],
      )
      if (token === undefined) throw new Error("the node has no such token")
      const at = row.at ?? 1
      const middle = token.range[0] + at
      expect(
        checkTree(input, withSplit(input, tree, token, at)),
      ).toContainEqual({
        where: `${token.type} at ${middle}-${token.range[1]}`,
        message: `${withArticle(token.type)} token is split: ${token.type} at ${token.range[0]}-${middle} and this touch in ${row.node} at ${node.range[0]}-${node.range[1]}, so they are one token`,
      })
    })
  }

  it("does not ask the value nodes of several items, whose tokens may touch", () => {
    // A node of text that mermaid.js does not read has the tokens of its
    // units, and a venn literal the atoms of a bare style value. A sequence
    // box text holds its colour candidate and remainder in child nodes, whose
    // tokens touch at the boundary of the two, and which are asked on their own.
    expect(TOKEN_KINDS_THAT_TOUCH_IN_VALUE_NODES.get("VennLiteral")).toEqual(
      new Set(["Identifier", "Numeric", "RawText"]),
    )
    expect(
      TOKEN_KINDS_THAT_TOUCH_IN_VALUE_NODES.get("StateIgnoredText"),
    ).toEqual(new Set(["String"]))
    for (const [diagram, fixture] of [
      ["sequence", "db-box-colour-candidate-word-prefix"],
      ["sequence", "tokens-box-text-space-between-parts"],
      ["venn", "db-style-adjacent-numeric-tokens"],
      ["state", "gram-state-empty-strings-adjacent"],
    ] as const) {
      const { input, tree } = recordedTree(diagram, fixture)
      expect(checkTree(input, tree), `${diagram}/${fixture}`).toEqual([])
    }
  })
})

describe("checkTree: a Keyword token split into two touching tokens", () => {
  // A keyword is one unit, so its fragments that touch, with no cut between
  // them, make the text of a keyword of the diagram, as a cut one does.
  const KEYWORDS = [
    {
      diagram: "flowchart",
      fixture: "db-class-vertex-and-subgraph-same-id",
      keyword: "subgraph",
    },
    {
      diagram: "sequence",
      fixture: "db-block-create-awaiting-at-end",
      keyword: "participant",
    },
    {
      diagram: "requirement",
      fixture: "db-class-statement",
      keyword: "element",
    },
  ] as const

  for (const row of KEYWORDS) {
    it(`fails the keyword ${row.keyword} of ${row.diagram}/${row.fixture} split in two`, () => {
      const { input, tree } = recordedTree(row.diagram, row.fixture)
      const token = tree.tokens.find(
        (candidate) =>
          candidate.type === "Keyword" && candidate.value === row.keyword,
      )
      if (token === undefined) throw new Error("the tree has no such keyword")
      const middle = token.range[0] + 3
      expect(checkTree(input, withSplit(input, tree, token, 3))).toContainEqual(
        {
          where: `Keyword at ${token.range[0]}-${middle}`,
          message: `a Keyword token is cut: Keyword at ${token.range[0]}-${middle}, Keyword at ${middle}-${token.range[1]} are the fragments of ${JSON.stringify(row.keyword)}`,
        },
      )
    })
  }
})

describe("checkTree: a Punctuator token split into two touching tokens", () => {
  // A `Punctuator` text outside an arrow is one unit, so two fragments that
  // touch, whose texts joined are a text of the diagram, are one token.
  const PUNCTUATORS = [
    ["agentflow", "db-shape-hex", "@{"],
    ["architecture", "db-mixed", "--"],
    ["block", "db-arrow-x", "<["],
    ["c4", "db-grid-empty-alias-argument-bare", "(,"],
    ["class", "db-class-def-names", ":::"],
    ["cynefin", "db-all-fields", "-->"],
    ["er", "db-role-word", "||"],
    ["eventmodeling", "db-all-fields", "->>"],
    ["flowchart", "db-props-merge", "[|"],
    ["kanban", "db-shape-bang", "))"],
    ["mindmap", "db-class-line", ":::"],
    ["quadrant", "db-class-plain", ":::"],
    ["railroad", "peg-line-cr", "<-"],
    ["requirement", "db-class-colon-form", ":::"],
    ["sequence", "db-data-block-alias-and-as", "@{"],
    ["state", "db-classes-order", ":::"],
    ["treemap", "db-all-fields", ":::"],
    ["treeview", "db-all-fields", ":::"],
    ["usecase", "db-all-fields", "@{"],
    ["wardley", "db-all-fields", "->"],
    ["xychart", "db-x-axis-range", "-->"],
  ] as const

  for (const [diagram, fixture, text] of PUNCTUATORS) {
    it(`fails ${text} of ${diagram}/${fixture} split in two`, () => {
      const { input, tree } = recordedTree(diagram, fixture)
      const token = tree.tokens.find(
        (candidate) =>
          candidate.type === "Punctuator" && candidate.value === text,
      )
      if (token === undefined) throw new Error("the tree has no such token")
      const middle = token.range[0] + 1
      expect(checkTree(input, withSplit(input, tree, token, 1))).toContainEqual(
        {
          where: `Punctuator at ${token.range[0]}-${middle}`,
          message: `a Punctuator token is cut: Punctuator at ${token.range[0]}-${middle}, Punctuator at ${middle}-${token.range[1]} are the fragments of ${JSON.stringify(text)}`,
        },
      )
    })
  }
})

describe("checkTree: an atom of a venn style value split into two touching tokens", () => {
  // diagrams/venn.md, rules 16, 17, and 20, and parser/docs/tokens/venn.md,
  // Tokens: the atoms of a bare style value (a number, a hexadecimal colour, a
  // name) keep their own tokens even when adjacent, and the lexer takes each as
  // many characters as it can. The check of a venn diagram reads the atoms of
  // the value from its written text, so a token that splits an atom is found
  // there, not by the check of the value nodes.
  const ATOMS = [
    ["db-form-style-tokens", "one", 1],
    ["db-form-style-tokens", "#abc", 2],
    ["db-style-adjacent-numeric-tokens", "1.2", 1],
    ["lex-style-adjacent-units", "red", 1],
  ] as const

  for (const [fixture, text, at] of ATOMS) {
    it(`fails the atom ${text} of venn/${fixture} split after ${at} characters`, () => {
      const { input, tree } = recordedTree("venn", fixture)
      const token = tree.tokens.find(
        (candidate) => candidate.value === text && candidate.range[0] > 12,
      )
      if (token === undefined) throw new Error("the tree has no such token")
      const literal = nodesOf(tree).find(
        (node) =>
          node.type === "VennLiteral" &&
          node.range[0] <= token.range[0] &&
          token.range[1] <= node.range[1],
      )
      if (literal === undefined) throw new Error("the token is in no literal")
      expect(
        checkTree(input, withSplit(input, tree, token, at)),
      ).toContainEqual({
        where: `VennLiteral at ${literal.range[0]}-${literal.range[1]}`,
        message:
          "the bare style atom token kinds or boundaries do not match the written units",
      })
    })
  }
})
