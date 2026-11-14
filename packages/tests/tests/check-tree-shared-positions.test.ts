import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type {
  CheckedRoot,
  CheckedToken,
  Location,
} from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { copyOf, recordedTree, setField } from "./check-tree-recorded.ts"
import {
  directiveOf,
  frontmatterOf,
  handMadeRoot,
  locationOf,
} from "./check-tree-trees.ts"

// The conditions of packages/parser/docs/positions.md that no other test of
// the check of a tree breaks: how lines, columns, and offsets are counted,
// which characters are whitespace, and where the tokens of the frontmatter
// stand. The trees are made by hand; each case breaks one condition of a
// valid tree and expects the problem that `checkTree` reports for it.

/** `root` with the token at `index` changed by `change`. */
function withToken(
  root: CheckedRoot,
  index: number,
  change: (token: CheckedToken) => CheckedToken,
): CheckedRoot {
  return {
    ...root,
    tokens: root.tokens.map((token, at) =>
      at === index ? change(token) : token,
    ),
  }
}

/** A location from the lines and columns of its two ends. */
function location(
  [startLine, startColumn]: readonly [number, number],
  [endLine, endColumn]: readonly [number, number],
): Location {
  return {
    start: { line: startLine, column: startColumn },
    end: { line: endLine, column: endColumn },
  }
}

describe("checkTree: lines, columns, and offsets (positions.md, Positions)", () => {
  // Each of `\r\n`, a lone `\r`, and `\n` ends one line; U+2028 and U+2029
  // end none. Offsets and columns count UTF-16 code units: the character
  // outside the Basic Multilingual Plane counts two.
  const text = "error\r\nb\rc\nd\u2028k\u2029f \u{1F600} g\n"
  const root = handMadeRoot(text, {
    tokens: [
      ["RawText", "error"],
      ["RawText", "b"],
      ["RawText", "c"],
      ["RawText", "d"],
      ["RawText", "k"],
      ["RawText", "f"],
      ["RawText", "\u{1F600}"],
      ["RawText", "g"],
    ],
  })

  it("passes a tree whose loc counts every kind of line end and the UTF-16 code units", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a loc that counts a \\r\\n as two line ends", () => {
    const broken = withToken(root, 1, (token) => ({
      ...token,
      loc: location([3, 0], [3, 1]),
    }))
    expect(checkTree(text, broken).map((problem) => problem.where)).toEqual([
      "RawText at 7-8",
    ])
  })

  it("fails a loc that does not count a lone \\r as a line end", () => {
    const broken = withToken(root, 2, (token) => ({
      ...token,
      loc: location([2, 2], [2, 3]),
    }))
    expect(checkTree(text, broken).map((problem) => problem.where)).toEqual([
      "RawText at 9-10",
    ])
  })

  it("fails a loc that counts a U+2028 or a U+2029 as a line end", () => {
    const afterLineSeparator = withToken(root, 4, (token) => ({
      ...token,
      loc: location([5, 0], [5, 1]),
    }))
    const afterParagraphSeparator = withToken(root, 5, (token) => ({
      ...token,
      loc: location([5, 0], [5, 1]),
    }))
    expect(
      checkTree(text, afterLineSeparator).map((problem) => problem.where),
    ).toEqual(["RawText at 13-14"])
    expect(
      checkTree(text, afterParagraphSeparator).map((problem) => problem.where),
    ).toEqual(["RawText at 15-16"])
  })

  it("fails a column that counts a character outside the Basic Multilingual Plane as one", () => {
    const broken = withToken(root, 7, (token) => ({
      ...token,
      loc: location([4, 8], [4, 9]),
    }))
    expect(checkTree(text, broken)).toEqual([
      {
        where: "RawText at 20-21",
        message:
          'loc: {"end":{"column":9,"line":4},"start":{"column":8,"line":4}}, not {"end":{"column":10,"line":4},"start":{"column":9,"line":4}}',
      },
    ])
  })

  it("fails an offset that counts a character outside the Basic Multilingual Plane as one", () => {
    const broken = withToken(root, 7, (token) => ({
      ...token,
      range: [19, 20],
      loc: location([4, 8], [4, 9]),
    }))
    expect(checkTree(text, broken)).toContainEqual({
      where: "RawText at 19-20",
      message: 'value: "g", not " "',
    })
  })

  it("fails a range whose end offset is the last character, not the one after it", () => {
    const broken = withToken(root, 0, (token) => ({
      ...token,
      range: [0, 4],
      loc: location([1, 0], [1, 4]),
    }))
    expect(checkTree(text, broken)).toContainEqual({
      where: "RawText at 0-4",
      message: 'value: "error", not "erro"',
    })
  })

  it("fails a line or a column that is not an integer", () => {
    for (const loc of [
      location([1.5, 0], [1, 5]),
      location([1, 0.5], [1, 5]),
    ]) {
      expect(
        checkTree(
          text,
          withToken(root, 0, (token) => ({ ...token, loc })),
        ),
      ).toEqual([
        { where: "RawText at 0-5", message: "has a loc that is no location" },
      ])
    }
  })
})

describe("checkTree: the whitespace outside the tokens (positions.md, Invariants 1)", () => {
  // Whitespace is the set of common.md, Notation; a character outside it,
  // and outside the tokens and the comments, is reported.
  it("passes U+202F and U+3000, which are whitespace, outside the tokens", () => {
    for (const whitespace of ["\u202F", "\u3000"]) {
      const text = `error ${whitespace} x`
      expect(
        checkTree(
          text,
          handMadeRoot(text, {
            tokens: [
              ["RawText", "error"],
              ["RawText", "x"],
            ],
          }),
        ),
      ).toEqual([])
    }
  })

  it("fails U+200B, U+0085, and U+180E, which are not whitespace, outside the tokens", () => {
    for (const character of ["\u200B", "\u0085", "\u180E"]) {
      const text = `error ${character} x`
      expect(
        checkTree(
          text,
          handMadeRoot(text, {
            tokens: [
              ["RawText", "error"],
              ["RawText", "x"],
            ],
          }),
        ),
      ).toEqual([
        {
          where: "offset 6",
          message: `the character outside the tokens and comments is not whitespace: ${JSON.stringify(character)}`,
        },
      ])
    }
  })
})

describe("checkTree: the tokens of the frontmatter come first (positions.md, Invariants)", () => {
  const text = "---\na: 1\n---\n%%{init: {}}%% error"
  const root = handMadeRoot(text, {
    frontmatter: frontmatterOf(text, "---\na: 1\n---", [4, 8]),
    directives: [directiveOf(text, "%%{init: {}}%%")],
    tokens: [
      ["Punctuator", "---"],
      ["RawText", "a: 1"],
      ["Punctuator", { text: "---", from: 4 }],
      ["Directive", "%%{init: {}}%%"],
      ["RawText", "error"],
    ],
  })

  it("passes the tokens of the frontmatter before the token of a directive", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails the token of a directive before the tokens of the frontmatter", () => {
    const [opening, body, closing, directive, error] = root.tokens
    if (
      opening === undefined ||
      body === undefined ||
      closing === undefined ||
      directive === undefined ||
      error === undefined
    ) {
      throw new Error("unexpected tree")
    }
    expect(
      checkTree(text, {
        ...root,
        tokens: [directive, opening, body, closing, error],
      }),
    ).toContainEqual({
      where: "Punctuator at 0-3",
      message: "overlaps the Punctuator before it, or comes before it",
    })
  })
})

describe("checkTree: an unclosed agentflow accDescr block reaches the end of the source (positions.md, Nodes)", () => {
  // `accDescr {open`, a line feed, `A`, and a line feed, with no closing `}`:
  // the statement and the diagram run to the end of the source.
  const { input, tree } = recordedTree(
    "agentflow",
    "db-accessibility-unclosed-block",
  )

  it("passes the recorded tree", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails the statement or the diagram when it ends before the end of the source", () => {
    const statement = copyOf(tree)
    const block = nodesOf(statement).find(
      (node) => node.type === "AgentflowAccDescrBlockStatement",
    )
    if (block === undefined) throw new Error("unexpected tree")
    setField(block, "range", [block.range[0], 31])
    setField(block, "loc", locationOf(input, [block.range[0], 31]))
    expect(checkTree(input, statement)).toContainEqual({
      where: "AgentflowAccDescrBlockStatement at 18-31",
      message: "an unclosed description must run to EOF",
    })
    const diagram = copyOf(tree)
    setField(diagram.body, "range", [0, 31])
    setField(diagram.body, "loc", locationOf(input, [0, 31]))
    expect(checkTree(input, diagram)).toContainEqual({
      where: "Root.body",
      message:
        "does not run from its first token to its last: [0,31], not [0,35]",
    })
  })

  it("fails a token added for the end of the source", () => {
    const added: CheckedRoot = {
      ...tree,
      tokens: [
        ...tree.tokens,
        {
          type: "RawText",
          value: "\n",
          range: [34, 35],
          loc: locationOf(input, [34, 35]),
        },
      ],
    }
    expect(checkTree(input, added)).toContainEqual({
      where: "RawText at 34-35",
      message: "overlaps the RawText before it, or comes before it",
    })
  })
})

describe("checkTree: a sankey field of spaces only has the token of its spaces (positions.md, Invariants)", () => {
  // `a, ,1`: the target is the field of one space, a node with its token.
  const { input, tree } = recordedTree("sankey", "db-spaces-only-target-id")

  it("passes the recorded tree", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails the field without the token of its space", () => {
    const broken: CheckedRoot = {
      ...tree,
      tokens: tree.tokens.filter((token) => token.value !== " "),
    }
    expect(checkTree(input, broken)).toContainEqual({
      where: "SankeyIdentifier at 9-10",
      message: "does not run from the start of a token to the end of a token",
    })
  })
})
