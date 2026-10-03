import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { getFixturesRoot } from "../src/index.ts"

// The checks of a flowchart tree have teeth: each case takes the recorded tree
// of a named fixture, makes one change to the tree (or, for a string that
// cannot be read, to the text), and requires the problem that the check of
// that condition reports. The unchanged tree of each fixture has no problem.

/** A case: one change to the tree or the text of `fixture`, and the problem it must cause. */
interface MutationCase {
  readonly name: string
  /** The name of a fixture of the flowchart directory that has an `ast.json`. */
  readonly fixture: string
  /** Changes the tree in place. */
  readonly mutateTree?: (root: CheckedRoot) => void
  /** The text that the tree is checked against. */
  readonly mutateText?: (text: string) => string
  /** Parts that one problem, written `where: message`, must all contain: the check must report it. */
  readonly expected: readonly string[]
}

/** The text and the recorded tree of the fixture `name`; the tree is a copy that a case may change. */
function loadFixture(name: string): { text: string; tree: CheckedRoot } {
  const directory = path.join(getFixturesRoot(), "flowchart", name)
  return {
    text: readFileSync(path.join(directory, "input.mmd"), "utf8"),
    tree: JSON.parse(
      readFileSync(path.join(directory, "ast.json"), "utf8"),
    ) as CheckedRoot,
  }
}

/** The `index`-th node of the type `type` in the tree (in the order of the walk); fails the case when there is none. */
function nodeOf(root: CheckedRoot, type: string, index = 0): CheckedNode {
  const node = nodesOf(root)
    .filter((candidate) => candidate.type === type)
    .at(index)
  if (node === undefined) throw new Error(`no ${type} number ${index}`)
  return node
}

/** Sets the field `field` of `node`. */
function setField(node: CheckedNode, field: string, value: unknown): void {
  Reflect.set(node, field, value)
}

/** The string in the field `field` of `node`. */
function stringField(node: CheckedNode, field: string): string {
  const value = node[field]
  if (typeof value !== "string") throw new Error(`${field} is no string`)
  return value
}

/** Moves the end of the range of `node` by `delta`. */
function moveEnd(node: CheckedNode, delta: number): void {
  setField(node, "range", [node.range[0], node.range[1] + delta])
}

const cases: readonly MutationCase[] = [
  // ast.md, Nodes: the value of a leaf node is its written text.
  {
    name: "a label with a character added to its value",
    fixture: "lex-lean-right-label",
    mutateTree: (root) => {
      const label = nodeOf(root, "FlowchartLabel")
      setField(label, "value", `${stringField(label, "value")}x`)
    },
    expected: ["FlowchartLabel at", "value is not its written text"],
  },
  {
    name: "a label with a string keeps the quotes in its value",
    fixture: "gram-label-string-then-text",
    mutateTree: (root) => {
      const label = nodeOf(root, "FlowchartLabel")
      setField(label, "value", `"${stringField(label, "value")}`)
    },
    expected: ["FlowchartLabel at", "value is not its written text"],
  },
  {
    name: "a label without a value",
    fixture: "lex-lean-right-label",
    mutateTree: (root) => {
      Reflect.deleteProperty(nodeOf(root, "FlowchartLabel"), "value")
    },
    expected: ["FlowchartLabel at", "lacks the field value"],
  },
  {
    name: "a StringLiteral with an empty value",
    fixture: "db-tooltip-unknown-id",
    mutateTree: (root) => {
      setField(nodeOf(root, "StringLiteral"), "value", "")
    },
    expected: ["StringLiteral at", "value is not its written text"],
  },
  {
    name: "a FlowchartLiteral with a character added to its value",
    fixture: "lex-acc-descr-block-unclosed",
    mutateTree: (root) => {
      const literal = nodeOf(root, "FlowchartLiteral")
      setField(literal, "value", `${stringField(literal, "value")}!`)
    },
    expected: ["FlowchartLiteral at", "value is not its written text"],
  },
  {
    name: "a data block with a delimiter in its value",
    fixture: "gram-data-block-space-only",
    mutateTree: (root) => {
      const block = nodeOf(root, "FlowchartDataBlock")
      setField(block, "value", `@{${stringField(block, "value")}`)
    },
    expected: ["FlowchartDataBlock at", "value is not its written text"],
  },
  {
    name: "an ignored text that lost its first character",
    fixture: "lex-direction-line-in-label",
    mutateTree: (root) => {
      const text = nodeOf(root, "FlowchartIgnoredText")
      setField(text, "value", stringField(text, "value").slice(1))
    },
    expected: ["FlowchartIgnoredText at", "value is not its written text"],
  },
  {
    name: "an arrow with a character added to its value",
    fixture: "spec-flow-arrows-04b503ad",
    mutateTree: (root) => {
      const arrow = nodeOf(root, "FlowchartArrow")
      setField(arrow, "value", `${stringField(arrow, "value")}-`)
    },
    expected: ["FlowchartArrow at", "value is not its written text"],
  },
  {
    name: "an opening arrow with a marker added to its value",
    fixture: "db-arrow-double",
    mutateTree: (root) => {
      const arrow = nodeOf(root, "FlowchartOpeningArrow")
      setField(arrow, "value", `x${stringField(arrow, "value")}`)
    },
    expected: ["FlowchartOpeningArrow at", "value is not its written text"],
  },
  // diagrams/flowchart.md, Shapes: the name of a shape is given by its
  // delimiters, and a property exists exactly with `[|`.
  {
    name: "a rectangle named circle",
    fixture: "spec-flow-singlenode-f730191a",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartShape"), "name", "circle")
    },
    expected: ["the name of the shape, written [ and ]"],
  },
  {
    name: "a stadium named rounded",
    fixture: "docs-syntax-flowchart-848620f0",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartShape"), "name", "rounded")
    },
    expected: ["the name of the shape, written ([ and ])"],
  },
  {
    name: "a plain shape with a property",
    fixture: "spec-flow-singlenode-f730191a",
    mutateTree: (root) => {
      const shape = nodeOf(root, "FlowchartShape")
      setField(shape, "property", shape.label)
    },
    expected: ["has a property exactly when it is written with [|"],
  },
  {
    name: "a shape written with [| without its property",
    fixture: "gram-rect-property",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartShape"), "property", null)
    },
    expected: ["the name of the shape, written [|:| and ]"],
  },
  // ast/flowchart.md, FlowchartArrow and FlowchartOpeningArrow: the fields are
  // what the value writes.
  {
    name: "an arrow with a length that is one too long",
    fixture: "spec-flow-arrows-04b503ad",
    mutateTree: (root) => {
      const arrow = nodeOf(root, "FlowchartArrow")
      setField(arrow, "length", Number(arrow.length) + 1)
    },
    expected: ["the fields of the arrow, written -->"],
  },
  {
    name: "a solid arrow with the line thick",
    fixture: "spec-flow-arrows-04b503ad",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartArrow"), "line", "thick")
    },
    expected: ["the fields of the arrow, written -->"],
  },
  {
    name: "an arrow with a start marker it does not write",
    fixture: "spec-flow-arrows-04b503ad",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartArrow"), "startMarker", "arrow")
    },
    expected: ["the fields of the arrow, written -->"],
  },
  {
    name: "an arrow with the wrong end marker",
    fixture: "spec-flow-arrows-04b503ad",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartArrow"), "endMarker", "cross")
    },
    expected: ["the fields of the arrow, written -->"],
  },
  {
    name: "a dotted arrow with the line solid",
    fixture: "spec-flow-lines-dfaa52bf",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartArrow"), "line", "solid")
    },
    expected: ["the fields of the arrow, written -.->"],
  },
  {
    name: "an arrow whose range lacks its last character",
    fixture: "spec-flow-arrows-04b503ad",
    mutateTree: (root) => {
      moveEnd(nodeOf(root, "FlowchartArrow"), -1)
    },
    expected: ["the tokens of the arrow"],
  },
  {
    name: "an opening arrow with the line of another kind",
    fixture: "db-arrow-double",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartOpeningArrow"), "line", "thick")
    },
    expected: ["the line is that of the closing arrow"],
  },
  {
    name: "an opening arrow with a start marker it does not write",
    fixture: "db-arrow-double",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartOpeningArrow"), "startMarker", "none")
    },
    expected: ["the fields of the opening arrow, written <--"],
  },
  {
    name: "a link without its arrow",
    fixture: "spec-flow-arrows-04b503ad",
    mutateTree: (root) => {
      Reflect.deleteProperty(nodeOf(root, "FlowchartLink"), "arrow")
    },
    expected: ["FlowchartLink at", "lacks the field arrow"],
  },
  // ast/flowchart.md, FlowchartStyleStatement: a style starts right after the
  // `,` before it and ends at its last character that is not whitespace.
  {
    name: "a second style that starts after the first character",
    fixture: "db-class-def-escaped-comma",
    mutateTree: (root) => {
      const style = nodeOf(root, "FlowchartLiteral", 1)
      setField(style, "range", [style.range[0] + 1, style.range[1]])
    },
    expected: ["starts right after the `,` before it"],
  },
  {
    name: "a style that ends with the line terminator after it",
    fixture: "db-class-before-vertex",
    mutateTree: (root) => {
      moveEnd(nodeOf(root, "FlowchartLiteral"), 1)
    },
    expected: ["FlowchartLiteral at", "ends with whitespace"],
  },
  // ast/flowchart.md, FlowchartSubgraphStatement: the name without a title
  // runs over the whitespace after it; with a title it ends before it.
  {
    name: "a subgraph name that does not run over the whitespace after it",
    fixture: "db-subgraph-name-trailing-space",
    mutateTree: (root) => {
      moveEnd(nodeOf(root, "FlowchartLabel"), -1)
    },
    expected: ["ends before the whitespace after it"],
  },
  {
    name: "a subgraph name before a title that ends with whitespace",
    fixture: "db-subgraph-title-spaces-before-bracket",
    mutateTree: (root) => {
      moveEnd(nodeOf(root, "FlowchartLabel"), 1)
    },
    expected: ["before a title ends with whitespace"],
  },
  // ast/flowchart.md, FlowchartAccDescrBlockStatement: `closed` is whether the
  // block ends with `}`.
  {
    name: "a block that is not closed marked as closed",
    fixture: "lex-acc-descr-block-unclosed",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartAccDescrBlockStatement"), "closed", true)
    },
    expected: ["closed is not whether the last token is `}`"],
  },
  {
    name: "a closed block marked as not closed",
    fixture: "header-empty-description-block-after-direction-at-end",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartAccDescrBlockStatement"), "closed", false)
    },
    expected: ["closed is not whether the last token is `}`"],
  },
  // ast/flowchart.md, FlowchartDiagram: the direction is the header's first
  // token after the keyword.
  {
    name: "a header direction that differs from the written one",
    fixture: "spec-flow-singlenode-a5fa3415",
    mutateTree: (root) => {
      setField(root.body, "direction", "LR")
    },
    expected: ["the direction of the header is not the first token"],
  },
  {
    name: "a direction for a header that has none",
    fixture: "db-direction-statement-top-level-no-header-direction",
    mutateTree: (root) => {
      setField(root.body, "direction", "TD")
    },
    expected: ["the direction of the header is not the first token"],
  },
  // ast/flowchart.md, Tokens: the tokens of a value lie in a value node.
  {
    name: "an Identifier whose range holds no token",
    fixture: "spec-flow-singlenode-a5fa3415",
    mutateTree: (root) => {
      const identifier = nodeOf(root, "Identifier")
      setField(identifier, "range", [identifier.range[1], identifier.range[1]])
    },
    expected: ["Identifier at", "lies in no value node"],
  },
  // diagrams/flowchart.md, Strings: a string that cannot be read from the text
  // is a problem, not an exception.
  {
    name: "a text whose string is not closed",
    fixture: "db-tooltip-unknown-id",
    mutateText: (text) =>
      `${text.slice(0, text.lastIndexOf('"'))}x${text.slice(text.lastIndexOf('"') + 1)}`,
    expected: ["its string cannot be read"],
  },
  // diagrams/flowchart.md, The direction line: the keywords of the statement
  // are `direction` and the value as written.
  {
    name: "a direction statement with a direction it does not write",
    fixture: "db-direction-statement-top-level",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartDirectionStatement"), "direction", "LR")
    },
    expected: ["FlowchartDirectionStatement at", "the keywords"],
  },
  // diagrams/flowchart.md, The statement context, rule 13: the link target is
  // the `Keyword` that ends the statement.
  {
    name: "a click statement with a target other than the written one",
    fixture: "gram-click-url-target",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartClickUrlStatement"), "target", "_top")
    },
    expected: ["FlowchartClickUrlStatement at", "the target"],
  },
  {
    name: "a click statement without the target it writes",
    fixture: "gram-click-url-target",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartClickUrlStatement"), "target", null)
    },
    expected: ["FlowchartClickUrlStatement at", "the target"],
  },
  {
    name: "a click statement with a target it does not write",
    fixture: "db-tooltip-unknown-id",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartClickUrlStatement"), "target", "_self")
    },
    expected: ["FlowchartClickUrlStatement at", "the target"],
  },
  // diagrams/flowchart.md, Labels and Strings: the kind of a label follows
  // from the delimiter before the content of the string it starts with.
  {
    name: "a label of text with the kind string",
    fixture: "lex-lean-right-label",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartLabel"), "kind", "string")
    },
    expected: ["FlowchartLabel at", "the kind of the label"],
  },
  {
    name: "a label that starts with a string with the kind text",
    fixture: "gram-label-string-then-text",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartLabel"), "kind", "text")
    },
    expected: ["FlowchartLabel at", "the kind of the label"],
  },
  {
    name: "a label that starts with a string with the kind markdown",
    fixture: "gram-label-string-then-text",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartLabel"), "kind", "markdown")
    },
    expected: ["FlowchartLabel at", "the kind of the label"],
  },
  {
    name: "a label that starts with a markdown string with the kind string",
    fixture: "gram-string-markdown-then-text",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartLabel"), "kind", "string")
    },
    expected: ["FlowchartLabel at", "the kind of the label"],
  },
  {
    name: "a label with a markdown string inside a string with the kind string",
    fixture: "gram-string-nested-markdown",
    mutateTree: (root) => {
      setField(nodeOf(root, "FlowchartLabel"), "kind", "string")
    },
    expected: ["FlowchartLabel at", "the kind of the label"],
  },
]

describe("checkTree on a changed flowchart tree", () => {
  it("finds no problem in the unchanged tree of each fixture", () => {
    for (const fixture of new Set(cases.map((entry) => entry.fixture))) {
      const { text, tree } = loadFixture(fixture)
      expect({ fixture, problems: checkTree(text, tree) }).toEqual({
        fixture,
        problems: [],
      })
    }
  })

  for (const entry of cases) {
    it(`reports ${entry.name}`, () => {
      const { text, tree } = loadFixture(entry.fixture)
      entry.mutateTree?.(tree)
      const problems = checkTree(entry.mutateText?.(text) ?? text, tree).map(
        (problem) => `${problem.where}: ${problem.message}`,
      )
      expect(
        problems.some((problem) =>
          entry.expected.every((part) => problem.includes(part)),
        ),
        `${JSON.stringify(entry.expected)} is not among ${JSON.stringify(problems)}`,
      ).toBe(true)
    })
  }
})
