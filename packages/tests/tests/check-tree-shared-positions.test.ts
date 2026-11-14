import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type {
  CheckedRoot,
  CheckedToken,
  Location,
} from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import {
  copyOf,
  firstNode,
  recordedTree,
  setField,
} from "./check-tree-recorded.ts"
import {
  commentOf,
  directiveOf,
  frontmatterOf,
  handMadeRoot,
  locationOf,
  tokenOf,
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

describe("checkTree: every kind of positioned record carries range and loc", () => {
  const text = "---\na: 1\n---\n%%{init: {}}%% error\n%% c"
  const root = handMadeRoot(text, {
    frontmatter: frontmatterOf(text, "---\na: 1\n---", [4, 8]),
    directives: [directiveOf(text, "%%{init: {}}%%")],
    comments: [commentOf(text, "%%", "%% c")],
    tokens: [
      ["Punctuator", "---"],
      ["RawText", "a: 1"],
      ["Punctuator", { text: "---", from: 4 }],
      ["Directive", "%%{init: {}}%%"],
      ["RawText", "error"],
    ],
  })

  it("passes the positioned records before their fields are removed", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  const positionedRecordCases = [
    {
      name: "fails a token without range or loc",
      pick: (tree: CheckedRoot) => tree.tokens[0],
      missingFields: [
        { field: "range", message: "has no type and no range" },
        { field: "loc", message: "has a loc that is no location" },
      ],
    },
    {
      name: "fails a comment without range or loc",
      pick: (tree: CheckedRoot) => tree.comments[0],
      missingFields: [
        { field: "range", message: "has no type and no range" },
        { field: "loc", message: "has a loc that is no location" },
      ],
    },
    {
      name: "fails a directive without range or loc",
      pick: (tree: CheckedRoot) => tree.directives[0],
      missingFields: [
        { field: "range", message: "has no type and no range" },
        { field: "loc", message: "has a loc that is no location" },
      ],
    },
    {
      name: "fails frontmatter without range or loc",
      pick: (tree: CheckedRoot) => tree.frontmatter,
      missingFields: [
        {
          field: "range",
          message: "the field frontmatter is object, not a node or null",
        },
        { field: "loc", message: "has a loc that is no location" },
      ],
    },
  ] as const
  for (const testCase of positionedRecordCases) {
    it(testCase.name, () => {
      for (const { field, message } of testCase.missingFields) {
        const broken = copyOf(root)
        const record = testCase.pick(broken)
        if (record === null || record === undefined)
          throw new Error("unexpected tree")
        Reflect.deleteProperty(record, field)
        const problems = checkTree(text, broken)
        expect(problems, field).toHaveLength(1)
        expect(problems[0]?.message, field).toContain(message)
      }
    })
  }
})

describe("checkTree: the missing cases of positions.md", () => {
  const missingRootPositionCases = [
    [
      "fails a Root without range",
      "range",
      { where: "the tree", message: "is no node: it has no type and no range" },
    ],
    [
      "fails a Root without loc",
      "loc",
      { where: "Root at 0-37", message: "has a loc that is no location" },
    ],
  ] as const
  for (const [name, field, problem] of missingRootPositionCases) {
    it(name, () => {
      const { input, tree } = recordedTree(
        "sequence",
        "db-message-activate-target",
      )
      const broken = copyOf(tree)
      Reflect.deleteProperty(broken, field)
      expect(checkTree(input, broken)).toEqual([problem])
    })
  }

  const missingBodyPositionCases = [
    [
      "fails a node in the body without range",
      "range",
      {
        where: "SequenceMessageStatement at 16-25",
        message: "the field from is object, not a node",
      },
    ],
    [
      "fails a node in the body without loc",
      "loc",
      {
        where: "SequenceIdentifier at 16-17",
        message: "has a loc that is no location",
      },
    ],
  ] as const
  for (const [name, field, problem] of missingBodyPositionCases) {
    it(name, () => {
      const { input, tree } = recordedTree(
        "sequence",
        "db-message-activate-target",
      )
      const broken = copyOf(tree)
      Reflect.deleteProperty(firstNode(broken, "SequenceIdentifier"), field)
      expect(checkTree(input, broken)).toEqual([problem])
    })
  }

  it("fails a root whose start offset is not zero", () => {
    const text = " error"
    const root = handMadeRoot(text, { tokens: [["RawText", "error"]] })
    expect(checkTree(text, root)).toEqual([])
    expect(
      checkTree(text, {
        ...root,
        range: [1, text.length],
        loc: locationOf(text, [1, text.length]),
      }),
    ).toContainEqual({
      where: "Root",
      message: "the root does not cover the whole input: [1,6], not [0,6]",
    })
  })

  it("fails a child that ends after the end of its parent", () => {
    const { input, tree } = recordedTree(
      "sequence",
      "db-message-activate-target",
    )
    const broken = copyOf(tree)
    const child = firstNode(broken, "SequenceIdentifier")
    setField(child, "range", [16, 26])
    setField(child, "loc", locationOf(input, [16, 26]))
    expect(checkTree(input, broken)).toContainEqual({
      where: "SequenceIdentifier at 16-26",
      message: "lies outside SequenceMessageStatement at 16-25",
    })
  })

  it("fails two Directive tokens for the same directive", () => {
    const text = "error %%{init: {}}%%"
    const root = handMadeRoot(text, {
      directives: [directiveOf(text, "%%{init: {}}%%")],
      tokens: [
        ["RawText", "error"],
        ["Directive", "%%{init: {}}%%"],
      ],
    })
    expect(checkTree(text, root)).toEqual([])
    const directive = root.tokens[1]
    if (directive === undefined) throw new Error("unexpected tree")
    expect(
      checkTree(text, { ...root, tokens: [...root.tokens, directive] }),
    ).toContainEqual({
      where: "the Directive tokens",
      message:
        "are not those of the directives outside all other tokens and all comments: [[6,20],[6,20]], not [[6,20]]",
    })
  })

  it("fails a Directive token whose range differs from its directive", () => {
    const text = "error %%{init: {}}%%"
    const root = handMadeRoot(text, {
      directives: [directiveOf(text, "%%{init: {}}%%")],
      tokens: [
        ["RawText", "error"],
        ["Directive", "%%{init: {}}%%"],
      ],
    })
    const broken = withToken(root, 1, () =>
      tokenOf(text, "Directive", "%%{init: {}}%"),
    )
    expect(checkTree(text, broken)).toContainEqual({
      where: "the Directive tokens",
      message:
        "are not those of the directives outside all other tokens and all comments: [[6,19]], not [[6,20]]",
    })
  })

  it("fails a Directive token for a directive after the mark inside a comment", () => {
    const text = "error\n%% c %%{init: {}}%%"
    const root = handMadeRoot(text, {
      directives: [directiveOf(text, "%%{init: {}}%%")],
      comments: [commentOf(text, "%%", "%% c %%{init: {}}%%")],
      tokens: [["RawText", "error"]],
    })
    expect(checkTree(text, root)).toEqual([])
    expect(
      checkTree(text, {
        ...root,
        tokens: [...root.tokens, tokenOf(text, "Directive", "%%{init: {}}%%")],
      }),
    ).toContainEqual({
      where: "the Directive tokens",
      message:
        "are not those of the directives outside all other tokens and all comments: [[11,25]], not []",
    })
  })

  it("fails a Directive token for a directive between the percents of a comment mark", () => {
    const text = "error\n%%%{init: {}}%%% c"
    const root = handMadeRoot(text, {
      directives: [directiveOf(text, "%%{init: {}}%%")],
      comments: [commentOf(text, "%%", "%%%{init: {}}%%% c", " c")],
      tokens: [["RawText", "error"]],
    })
    expect(checkTree(text, root)).toEqual([])
    expect(
      checkTree(text, {
        ...root,
        tokens: [...root.tokens, tokenOf(text, "Directive", "%%{init: {}}%%")],
      }),
    ).toContainEqual({
      where: "the Directive tokens",
      message:
        "are not those of the directives outside all other tokens and all comments: [[7,21]], not []",
    })
  })

  it("fails a nonempty comment range shorter than its mark", () => {
    const text = "error\n%% c"
    const root = handMadeRoot(text, {
      tokens: [["RawText", "error"]],
      comments: [commentOf(text, "%%", "%% c")],
    })
    const comment = root.comments[0]
    if (comment === undefined) throw new Error("unexpected tree")
    expect(checkTree(text, root)).toEqual([])
    expect(
      checkTree(text, {
        ...root,
        comments: [
          {
            ...comment,
            range: [6, 7],
            loc: locationOf(text, [6, 7]),
            value: "",
          },
        ],
      }).some((problem) => problem.where === "Comment at 6-7"),
    ).toBe(true)
  })

  it("fails a nonempty directive range shorter than its mark", () => {
    const text = "error %%{init: {}}%%"
    const root = handMadeRoot(text, {
      tokens: [
        ["RawText", "error"],
        ["Directive", "%%{init: {}}%%"],
      ],
      directives: [directiveOf(text, "%%{init: {}}%%")],
    })
    const directive = root.directives[0]
    if (directive === undefined) throw new Error("unexpected tree")
    expect(checkTree(text, root)).toEqual([])
    expect(
      checkTree(text, {
        ...root,
        directives: [
          {
            ...directive,
            range: [6, 7],
            loc: locationOf(text, [6, 7]),
            value: "",
            name: "",
            closed: false,
          },
        ],
      }).some(
        (problem) =>
          problem.where === "the directives" &&
          problem.message.startsWith(
            "the directives of the tree are not those of the source",
          ),
      ),
    ).toBe(true)
  })
})

describe("checkTree: the two ends and units of a position", () => {
  const text = "error\nx"
  const root = handMadeRoot(text, {
    tokens: [
      ["RawText", "error"],
      ["RawText", "x"],
    ],
  })

  it("fails a start offset that is not an integer", () => {
    const broken = withToken(root, 0, (token) => ({
      ...token,
      range: [0.5, 5],
    }))
    expect(checkTree(text, broken)).toEqual([
      {
        where: "RawText at 0.5-5",
        message: "has a range that is no offset pair",
      },
    ])
  })

  it("fails a start position that is not a position", () => {
    const broken = copyOf(root)
    const token = broken.tokens[0]
    if (token === undefined) throw new Error("unexpected tree")
    setField(token.loc, "start", null)
    expect(checkTree(text, broken)).toEqual([
      { where: "RawText at 0-5", message: "has a loc that is no location" },
    ])
  })

  it("fails an end position that is not a position", () => {
    const broken = copyOf(root)
    const token = broken.tokens[0]
    if (token === undefined) throw new Error("unexpected tree")
    setField(token.loc, "end", null)
    expect(checkTree(text, broken)).toEqual([
      { where: "RawText at 0-5", message: "has a loc that is no location" },
    ])
  })

  it("fails a line counted from zero and a column counted from one", () => {
    for (const loc of [location([0, 0], [0, 5]), location([1, 1], [1, 6])]) {
      expect(
        checkTree(
          text,
          withToken(root, 0, (token) => ({ ...token, loc })),
        ),
      ).toContainEqual({
        where: "RawText at 0-5",
        message: expect.stringContaining("loc:"),
      })
    }
  })

  it("fails a loc that does not count a line feed as a line end", () => {
    expect(
      checkTree(
        text,
        withToken(root, 1, (token) => ({
          ...token,
          loc: location([1, 6], [1, 7]),
        })),
      ),
    ).toContainEqual({
      where: "RawText at 6-7",
      message: expect.stringContaining("loc:"),
    })
  })
})

describe("checkTree: whitespace at cut boundaries must belong to a value", () => {
  it("fails whitespace at either side of a directive outside a value", () => {
    const text = "error x %%{init: {}}%% y"
    for (const [before, after] of [
      ["x ", "y"],
      ["x", " y"],
    ]) {
      const root = handMadeRoot(text, {
        directives: [directiveOf(text, "%%{init: {}}%%")],
        tokens: [
          ["RawText", "error"],
          ["RawText", before],
          ["Directive", "%%{init: {}}%%"],
          ["RawText", after],
        ],
      })
      expect(checkTree(text, root)).toContainEqual({
        where: expect.stringContaining("RawText at"),
        message: expect.stringContaining(
          "with whitespace or a line terminator where no value",
        ),
      })
    }
  })

  it("fails whitespace at either side of a comment region outside a value", () => {
    const text = "error x\n%% c\ny"
    for (const [before, after] of [
      ["x\n", "y"],
      ["x", "\ny"],
    ]) {
      const root = handMadeRoot(text, {
        comments: [commentOf(text, "%%", "%% c")],
        tokens: [
          ["RawText", "error"],
          ["RawText", before],
          ["RawText", after],
        ],
      })
      expect(checkTree(text, root)).toContainEqual({
        where: expect.stringContaining("RawText at"),
        message: expect.stringContaining(
          "with whitespace or a line terminator where no value",
        ),
      })
    }
  })

  it("fails whitespace at either side of an ignored semicolon outside a value", () => {
    const text = "error x ; y"
    for (const [before, after] of [
      ["x ", "y"],
      ["x", " y"],
    ]) {
      const root = handMadeRoot(text, {
        tokens: [
          ["RawText", "error"],
          ["RawText", before],
          ["IgnoredSemicolon", ";"],
          ["RawText", after],
        ],
      })
      expect(checkTree(text, root)).toContainEqual({
        where: expect.stringContaining("RawText at"),
        message: expect.stringContaining(
          "with whitespace or a line terminator where no value",
        ),
      })
    }
  })
})

describe("checkTree: a value read as empty has no token", () => {
  it("fails a nonempty whitespace token for an empty accessibility title", () => {
    const recorded = recordedTree("flowchart", "gram-acc-title-empty-at-end")
    const text = `${recorded.input} `
    const root = copyOf(recorded.tree)
    setField(root, "range", [0, text.length])
    setField(root, "loc", locationOf(text, [0, text.length]))
    expect(checkTree(text, root)).toEqual([])
    const token = tokenOf(text, "RawText", {
      text: " ",
      from: recorded.input.length,
    })
    expect(
      checkTree(text, { ...root, tokens: [...root.tokens, token] }),
    ).toContainEqual({
      where: `RawText at ${recorded.input.length}-${text.length}`,
      message:
        "starts with whitespace or a line terminator where no value starts",
    })
  })
})

describe("checkTree: the whitespace of the frontmatter body is not tokenized", () => {
  it("fails a frontmatter body token that is all whitespace", () => {
    const text = "---\n \n---\nerror"
    const root = handMadeRoot(text, {
      frontmatter: frontmatterOf(text, "---\n \n---", [4, 5]),
      tokens: [
        ["Punctuator", "---"],
        ["Punctuator", { text: "---", from: 4 }],
        ["RawText", "error"],
      ],
    })
    expect(checkTree(text, root)).toEqual([])
    const opening = root.tokens[0]
    const closing = root.tokens[1]
    const error = root.tokens[2]
    if (opening === undefined || closing === undefined || error === undefined) {
      throw new Error("unexpected tree")
    }
    expect(
      checkTree(text, {
        ...root,
        tokens: [
          opening,
          tokenOf(text, "RawText", { text: " ", from: 4 }),
          closing,
          error,
        ],
      }),
    ).toContainEqual({
      where: "the tokens in the range of the frontmatter",
      message: expect.stringContaining(
        "are not the opening delimiter, the body, and the closing delimiter",
      ),
    })
  })
})
