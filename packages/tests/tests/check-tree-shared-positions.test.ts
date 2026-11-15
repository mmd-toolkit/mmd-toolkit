import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type {
  CheckedRoot,
  CheckedToken,
  Location,
} from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { itFailsEach } from "./check-tree-built.ts"
import {
  copyOf,
  firstNode,
  itFailsEachRecorded,
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
import { buildInfo, common } from "./statement-tree-built.ts"

// The conditions of packages/parser/docs/positions.md, and of the position
// documents of the diagram types (packages/parser/docs/positions/<diagram>.md),
// that no other test of the check of a tree breaks: how lines, columns, and offsets are counted,
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

describe("checkTree: the range of the diagram node (positions.md, Nodes)", () => {
  // The tokens of the node in Root.body run from its first token to its last,
  // a separator after the last statement included, a directive or an ignored
  // `;` after the last token not.
  for (const [name, diagram, fixture, end, message] of [
    [
      "fails a flowchart diagram that ends before its trailing separator",
      "flowchart",
      "tokens-diagram-trailing-separator",
      14,
      "does not run from its first token to its last: [0,14], not [0,15]",
    ],
    [
      "fails a flowchart diagram that runs to a directive after its last token",
      "flowchart",
      "gram-separator-before-directive",
      40,
      "does not run from its first token to its last: [0,40], not [0,25]",
    ],
    [
      "fails a class diagram that ends after its trailing ignored semicolon",
      "class",
      "tokens-class-def-ignored-semicolon",
      46,
      "does not run from its first token to its last: [0,46], not [0,45]",
    ],
  ] as const) {
    it(name, () => {
      const { input, tree } = recordedTree(diagram, fixture)
      const broken = copyOf(tree)
      setField(broken.body, "range", [0, end])
      setField(broken.body, "loc", locationOf(input, [0, end]))
      expect(checkTree(input, broken)).toContainEqual({
        where: "Root.body",
        message,
      })
    })
  }
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

describe("checkTree: the range of a name after `style` or `classDef` (positions/requirement.md)", () => {
  const cases = [
    {
      name: "fails a name of a style whose range covers the space after its token",
      fixture: "db-style-statement",
      type: "RequirementStyleStatement",
      field: "names",
    },
    {
      name: "fails a class of a class definition whose range covers the space after its token",
      fixture: "db-class-def",
      type: "RequirementClassDefStatement",
      field: "cssClasses",
    },
  ] as const
  for (const testCase of cases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree("requirement", testCase.fixture)
      expect(checkTree(input, tree)).toEqual([])
      const broken = copyOf(tree)
      // The last name of the first statement, which a space follows.
      const names = firstNode(broken, testCase.type)[testCase.field] as {
        range: readonly [number, number]
      }[]
      const name = names[names.length - 1]
      const range = [name.range[0], name.range[1] + 1] as const
      setField(name, "range", range)
      setField(name, "loc", locationOf(input, range))
      expect(checkTree(input, broken)).toContainEqual({
        where: `Identifier at ${range[0]}-${range[1]}`,
        message: "does not run from the start of a token to the end of a token",
      })
    })
  }
})

describe("checkTree: the ranges of the nodes of a requirement diagram (positions/requirement.md)", () => {
  // Each case sets the range of one node, and its value where the case says
  // so, and expects the problem at that node.
  const rangeCases = [
    {
      name: "fails a requirement diagram that ends before its last token",
      fixture: "db-requirement-defaults",
      node: (root: CheckedRoot) => root.body,
      range: [0, 35],
      expected: {
        where: "Root.body",
        message:
          "does not run from its first token to its last: [0,35], not [0,36]",
      },
    },
    {
      name: "fails a field that runs over the spaces after its value",
      fixture: "db-requirement-value-spaces",
      node: (root: CheckedRoot) => firstNode(root, "RequirementValueField"),
      range: [37, 46],
      expected: {
        where: "RequirementValueField at 37-46",
        message: "does not run from the start of a token to the end of a token",
      },
    },
    {
      name: "fails a name that runs over the spaces after it",
      fixture: "db-requirement-name-spaces",
      node: (root: CheckedRoot) => firstNode(root, "RequirementIdentifier"),
      range: [32, 45],
      expected: {
        where: "RequirementIdentifier at 32-45",
        message: "does not run from the start of a token to the end of a token",
      },
    },
    {
      name: "fails a class statement that ends at the end of its first line",
      fixture: "lex-class-list-next-line",
      node: (root: CheckedRoot) => firstNode(root, "RequirementClassStatement"),
      range: [37, 44],
      expected: {
        where: "RequirementIdentifier at 45-46",
        message: "lies outside RequirementClassStatement at 37-44",
      },
    },
    {
      name: "fails a style that ends before its last unit",
      fixture: "lex-style-spaces",
      node: (root: CheckedRoot) => firstNode(root, "RequirementLiteral"),
      range: [45, 50],
      expected: {
        where: 'RawText at 51-54 of "red"',
        message: "lies in no value node",
      },
    },
    {
      name: "fails a text before a direction that runs over the space after it",
      fixture: "lex-direction-line-text-before-and-after",
      node: (root: CheckedRoot) => firstNode(root, "RequirementIgnoredText"),
      range: [19, 23],
      expected: {
        where: "RequirementIgnoredText at 19-23",
        message: "does not run from the start of a token to the end of a token",
      },
    },
  ] as const
  for (const testCase of rangeCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree("requirement", testCase.fixture)
      expect(checkTree(input, tree)).toEqual([])
      const broken = copyOf(tree)
      const node = testCase.node(broken)
      setField(node, "range", testCase.range)
      setField(node, "loc", locationOf(input, testCase.range))
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }

  it("fails an empty description block in a body that ends before its `}`", () => {
    const { input, tree } = recordedTree(
      "requirement",
      "gram-empty-description-block-multiline-in-body",
    )
    expect(checkTree(input, tree)).toEqual([])
    const broken = copyOf(tree)
    const block = firstNode(broken, "RequirementIgnoredText")
    // `accDescr {` and its line feed, without the `}` at 46.
    const range = [35, 45] as const
    setField(block, "range", range)
    setField(block, "loc", locationOf(input, range))
    setField(block, "value", input.slice(...range))
    expect(checkTree(input, broken)).toContainEqual({
      where: "RequirementIgnoredText at 35-45",
      message:
        'the text of an item of a body, without its whitespace, which is an empty description block: "accdescr{", not "accdescr{}"',
    })
  })

  it("fails an empty description block in a body whose value holds the comment line inside it", () => {
    const { input, tree } = recordedTree(
      "requirement",
      "gram-empty-description-block-comment-line-in-body",
    )
    expect(checkTree(input, tree)).toEqual([])
    const broken = copyOf(tree)
    const block = firstNode(broken, "RequirementIgnoredText")
    setField(block, "value", input.slice(...block.range))
    expect(checkTree(input, broken)).toContainEqual({
      where: "RequirementIgnoredText at 35-52",
      message:
        'value is not its written text: "accDescr {\\n%% c\\n}", not "accDescr {\\n}"',
    })
  })

  it("fails a style whose value holds the spaces between its units", () => {
    const { input, tree } = recordedTree("requirement", "lex-style-spaces")
    expect(checkTree(input, tree)).toEqual([])
    const broken = copyOf(tree)
    const style = firstNode(broken, "RequirementLiteral")
    setField(style, "value", input.slice(...style.range))
    expect(checkTree(input, broken)).toContainEqual({
      where: "RequirementLiteral at 45-54",
      message:
        'value is not the texts of its tokens joined: "fill: red", not "fill:red"',
    })
  })
})

/** Sets the range of the first node of the type `type` to `range`, with its location. */
function placeFirst(
  type: string,
  range: readonly [number, number],
): (root: CheckedRoot, input: string) => void {
  return (root, input) => {
    const node = firstNode(root, type)
    setField(node, "range", range)
    setField(node, "loc", locationOf(input, range))
  }
}

describe("checkTree: the ranges of the nodes of a packet diagram (positions/packet.md)", () => {
  itFailsEachRecorded("packet", [
    {
      name: "fails a packet root that ends before the end of the input",
      fixture: "gram-mixed",
      mutate: (root, input) => {
        setField(root, "range", [0, 38])
        setField(root, "loc", locationOf(input, [0, 38]))
      },
      expected:
        "Root: the root does not cover the whole input: [0,38], not [0,39]",
    },
    {
      name: "fails a packet diagram that runs over the comment after its last form",
      fixture: "comment-eof",
      mutate: placeFirst("PacketDiagram", [0, 19]),
      expected:
        "PacketDiagram at 0-19: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a bare comment line passed before the header held as a hidden form of the diagram",
      fixture: "detect-empty-braces-bare",
      mutate: (root, input) => {
        const node = {
          type: "PacketIgnoredText",
          kind: "directive",
          value: "%%{}%%",
          range: [0, 6] as const,
          loc: locationOf(input, [0, 6]),
        }
        setField(root.body, "textBeforeHeader", [node])
        placeFirst("PacketDiagram", [0, 13])(root, input)
        setField(root, "comments", [])
        setField(root, "tokens", [
          tokenOf(input, "RawText", { text: "%%{}%%" }),
          ...root.tokens,
        ])
      },
      expected:
        "PacketIgnoredText at 0-6: a pre-header hidden directive must be found by the second word-type scan; bare percent forms are Comments",
    },
    {
      name: "fails a count whose range holds the colon after its digits",
      fixture: "db-cap-following-block-unpublished",
      mutate: placeFirst("NumericLiteral", [8, 15]),
      expected: 'NumericLiteral at 8-15: raw: "320000", not "320000:"',
    },
    {
      name: "fails an empty label whose range leaves out its closing quote",
      fixture: "db-label-empty-double",
      mutate: placeFirst("StringLiteral", [9, 10]),
      expected:
        "StringLiteral at 9-10: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a label whose raw is not the source at its range",
      fixture: "gram-mixed",
      mutate: (root) => {
        setField(firstNode(root, "StringLiteral"), "raw", "'two'")
      },
      expected: 'StringLiteral at 10-15: raw: "\'two\'", not "\\"two\\""',
    },
    {
      name: "fails a label that a directive cuts whose range ends before the directive",
      fixture: "directive-label-middle",
      mutate: placeFirst("StringLiteral", [9, 11]),
      expected:
        'StringLiteral at 9-11: raw: "\\"A%%{init:{}}%%B\\"", not "\\"A"',
    },
    {
      name: "fails a label that a directive cuts whose value holds the directive",
      fixture: "directive-label-middle",
      mutate: (root, input) => {
        setField(firstNode(root, "StringLiteral"), "value", input.slice(10, 25))
      },
      expected:
        'StringLiteral at 9-26: value is not its written text: "A%%{init:{}}%%B", not "AB"',
    },
  ])
})

describe("checkTree: the ranges of the nodes of an ishikawa diagram (positions/ishikawa.md)", () => {
  itFailsEachRecorded("ishikawa", [
    {
      name: "fails an ishikawa diagram that ends before the trailing whitespace of its last text",
      fixture: "gram-root-trailing-space",
      mutate: placeFirst("IshikawaDiagram", [0, 14]),
      expected:
        "IshikawaDiagram at 0-14: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an ishikawa diagram that starts at the comments before its header",
      fixture: "header-before-comments",
      mutate: placeFirst("IshikawaDiagram", [0, 31]),
      expected:
        "IshikawaDiagram at 0-31: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an ishikawa diagram that runs over the comment after its last token",
      fixture: "gram-last-comment-blank-line",
      mutate: placeFirst("IshikawaDiagram", [0, 13]),
      expected:
        "IshikawaDiagram at 0-13: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a rootless ishikawa-beta diagram that ends before its beta suffix",
      fixture: "header-beta-only-lf",
      mutate: placeFirst("IshikawaDiagram", [0, 8]),
      expected:
        "IshikawaDiagram at 0-8: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an ishikawa node that starts at its indentation",
      fixture: "db-indent-first-cause",
      mutate: (root, input) => {
        const node = nodesOf(root).find(
          (candidate) =>
            candidate.type === "IshikawaNode" && candidate.range[0] === 15,
        )!
        setField(node, "range", [11, 24])
        setField(node, "loc", locationOf(input, [11, 24]))
      },
      expected:
        "IshikawaNode at 11-24: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an ishikawa node whose indentation counts the whitespace of the comment body before it",
      fixture: "lex-comment-ps-indent-excludes-body-padding",
      mutate: (root) => {
        const node = nodesOf(root).find(
          (candidate) =>
            candidate.type === "IshikawaNode" && candidate.range[0] === 21,
        )!
        setField(node, "indent", 6)
      },
      expected:
        "IshikawaNode at 21-22: the indent is not the written line whitespace count: 6, not 2",
    },
    {
      name: "fails an ishikawa text whose range leaves out its quotes",
      fixture: "gram-quotes-padding",
      mutate: (root, input) => {
        const text = firstNode(root, "IshikawaLiteral")
        setField(text, "range", [10, 15])
        setField(text, "loc", locationOf(input, [10, 15]))
        setField(text, "value", input.slice(10, 15))
      },
      expected:
        "IshikawaLiteral at 10-15: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an ishikawa text without the token of its fragment after the directive inside it",
      fixture: "directive-root-middle",
      mutate: (root) => {
        setField(
          root,
          "tokens",
          root.tokens.filter((candidate) => candidate.range[0] !== 25),
        )
      },
      expected:
        'offset 25: the character outside the tokens and comments is not whitespace: "o"',
    },
    {
      name: "fails an ishikawa node after a CR whose location stays on the line of the CR",
      fixture: "lex-cr-lines",
      mutate: (root) => {
        const node = nodesOf(root).find(
          (candidate) =>
            candidate.type === "IshikawaNode" && candidate.range[0] === 12,
        )!
        setField(node, "loc", {
          start: { line: 2, column: 4 },
          end: { line: 3, column: 2 },
        })
      },
      expected:
        'IshikawaNode at 12-17: loc: {"end":{"column":2,"line":3},"start":{"column":4,"line":2}}, not {"end":{"column":3,"line":4},"start":{"column":1,"line":3}}',
    },
    {
      name: "fails an ishikawa text whose location starts a new line at the U+2028 inside it",
      fixture: "lex-u2028-in-root",
      mutate: (root) => {
        const text = firstNode(root, "IshikawaLiteral")
        setField(text, "loc", {
          start: text.loc.start,
          end: { line: 3, column: 5 },
        })
      },
      expected:
        'IshikawaLiteral at 9-16: loc: {"end":{"column":5,"line":3},"start":{"column":0,"line":2}}, not {"end":{"column":7,"line":2},"start":{"column":0,"line":2}}',
    },
  ])
})

describe("checkTree: the ranges of the nodes of a sankey diagram (positions/sankey.md)", () => {
  itFailsEachRecorded("sankey", [
    {
      name: "fails a sankey diagram that ends before the last token of its last record",
      fixture: "db-link-basic",
      mutate: placeFirst("SankeyDiagram", [0, 11]),
      expected:
        "SankeyLinkStatement at 7-12: lies outside SankeyDiagram at 0-11",
    },
    {
      name: "fails a sankey link whose range leaves out the closing quote of its value",
      fixture: "db-quoted-value",
      mutate: placeFirst("SankeyLinkStatement", [7, 13]),
      expected:
        "SankeyLinkStatement at 7-13: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a sankey link that runs over the spaces before its source",
      fixture: "db-fields-trimmed",
      mutate: placeFirst("SankeyLinkStatement", [7, 18]),
      expected:
        "SankeyLinkStatement at 7-18: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an unquoted sankey field that runs over the space before it",
      fixture: "db-fields-trimmed",
      mutate: placeFirst("SankeyIdentifier", [8, 10]),
      expected:
        "SankeyIdentifier at 8-10: lies outside SankeyLinkStatement at 9-18",
    },
    {
      name: "fails a sankey field of spaces only whose range is empty",
      fixture: "db-spaces-only-source-id",
      mutate: (root, input) => {
        const node = nodesOf(root).find(
          (candidate) =>
            candidate.type === "SankeyIdentifier" && candidate.range[0] === 13,
        )!
        setField(node, "range", [13, 13])
        setField(node, "loc", locationOf(input, [13, 13]))
      },
      expected:
        "SankeyIdentifier at 13-13: does not run from the start of a token to the end of a token",
    },
  ])
})

describe("checkTree: the ranges of the nodes of a mindmap diagram (positions/mindmap.md)", () => {
  itFailsEachRecorded("mindmap", [
    {
      name: "fails a mindmap node with only a shape that starts after its opener",
      fixture: "db-shape-without-id",
      mutate: placeFirst("MindmapNode", [11, 16]),
      expected:
        "MindmapNode at 11-16: the range, which runs from the first of its tokens and child nodes to the last: [11,16], not [10,16]",
    },
    {
      name: "fails a mindmap node that ends before its last decoration",
      fixture: "db-icon-line",
      mutate: placeFirst("MindmapNode", [10, 14]),
      expected:
        "MindmapNode at 10-14: the range, which runs from the first of its tokens and child nodes to the last: [10,14], not [10,37]",
    },
    {
      name: "fails a mindmap shape that starts after its opener",
      fixture: "db-shape-without-id",
      mutate: placeFirst("MindmapShape", [11, 16]),
      expected:
        'MindmapShape at 11-16: the tokens of the node outside its child nodes, joined: "]", not "[]"',
    },
    {
      name: "fails a mindmap icon line that starts after its keyword",
      fixture: "db-icon-line",
      mutate: placeFirst("MindmapIconStatement", [26, 37]),
      expected:
        'MindmapIconStatement at 26-37: the tokens of the node outside its child nodes, joined: ")", not "::icon()"',
    },
    {
      name: "fails a mindmap class line that starts after its mark",
      fixture: "db-class-trailing-space",
      mutate: placeFirst("MindmapClassStatement", [22, 27]),
      expected:
        'MindmapClassStatement at 22-27: the tokens of the node outside its child nodes, joined: "", not ":::"',
    },
    {
      name: "fails a mindmap text label whose range leaves out its leading whitespace",
      fixture: "gram-shape-text-quoted-with-space",
      mutate: placeFirst("MindmapLabel", [18, 22]),
      expected:
        "MindmapLabel at 18-22: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a mindmap text label whose range leaves out its trailing whitespace",
      fixture: "gram-shape-text-quoted-with-space",
      mutate: placeFirst("MindmapLabel", [17, 21]),
      expected:
        "MindmapLabel at 17-21: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a mindmap icon whose range leaves out its leading whitespace",
      fixture: "db-icon-surrounding-whitespace",
      mutate: (root, input) => {
        const icon = firstNode(root, "MindmapIconStatement").icon!
        setField(icon, "range", [27, 29])
        setField(icon, "loc", locationOf(input, [27, 29]))
      },
      expected:
        "MindmapLiteral at 27-29: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a mindmap icon whose range leaves out its trailing whitespace",
      fixture: "db-icon-surrounding-whitespace",
      mutate: (root, input) => {
        const icon = firstNode(root, "MindmapIconStatement").icon!
        setField(icon, "range", [26, 28])
        setField(icon, "loc", locationOf(input, [26, 28]))
      },
      expected:
        "MindmapLiteral at 26-28: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a mindmap class whose range leaves out its leading whitespace",
      fixture: "db-class-leading-whitespace",
      mutate: (root, input) => {
        const cssClass = firstNode(root, "MindmapClassStatement").cssClass!
        setField(cssClass, "range", [24, 25])
        setField(cssClass, "loc", locationOf(input, [24, 25]))
      },
      expected:
        "MindmapLiteral at 24-25: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a mindmap class whose range leaves out its trailing whitespace",
      fixture: "db-class-trailing-space",
      mutate: (root, input) => {
        const cssClass = firstNode(root, "MindmapClassStatement").cssClass!
        setField(cssClass, "range", [22, 25])
        setField(cssClass, "loc", locationOf(input, [22, 25]))
      },
      expected:
        "MindmapLiteral at 22-25: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a mindmap markdown label that ends before the quote after its internal directive",
      fixture: "lex-directive-between-backquote-and-quote",
      mutate: placeFirst("MindmapLabel", [12, 16]),
      expected:
        'MindmapLabel at 12-16: the written text "\\"`x`" of a markdown does not start with "\\"`" and end with "`\\""',
    },
  ])
})

describe("checkTree: the ranges of the nodes of a timeline diagram (positions/timeline.md)", () => {
  itFailsEachRecorded("timeline", [
    {
      name: "fails a timeline period statement that ends before its last event on a later line",
      fixture: "db-event-own-line",
      mutate: placeFirst("TimelinePeriodStatement", [11, 21]),
      expected:
        "TimelinePeriodStatement at 11-21: the range, which runs from the first of its tokens and child nodes to the last: [11,21], not [11,30]",
    },
    {
      name: "fails a timeline period statement that ends before the event after an empty line",
      fixture: "db-event-own-line-after-blank-line",
      mutate: placeFirst("TimelinePeriodStatement", [11, 12]),
      expected:
        "TimelinePeriodStatement at 11-12: the range, which runs from the first of its tokens and child nodes to the last: [11,12], not [11,19]",
    },
    {
      name: "fails a timeline event statement that ends before its event",
      fixture: "db-event-after-section-joins-earlier-task",
      mutate: placeFirst("TimelineEventStatement", [27, 29]),
      expected:
        "TimelineEventStatement at 27-29: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline period statement that ends before the trailing whitespace of its period",
      fixture: "db-period-trailing-spaces",
      mutate: placeFirst("TimelinePeriodStatement", [11, 14]),
      expected:
        "TimelinePeriodStatement at 11-14: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline period statement that leaves out its whitespace-only event",
      fixture: "db-event-two-spaces",
      mutate: placeFirst("TimelinePeriodStatement", [11, 15]),
      expected:
        "TimelinePeriodStatement at 11-15: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline title statement that starts after the start of its keyword",
      fixture: "db-title-trailing-spaces",
      mutate: placeFirst("TimelineTitleStatement", [12, 21]),
      expected:
        "TimelineTitleStatement at 12-21: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline section statement that starts after the start of its keyword",
      fixture: "db-section-trailing-spaces",
      mutate: placeFirst("TimelineSectionStatement", [12, 23]),
      expected:
        "TimelineSectionStatement at 12-23: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline title statement that ends before its trailing whitespace",
      fixture: "db-title-trailing-spaces",
      mutate: placeFirst("TimelineTitleStatement", [11, 20]),
      expected:
        "TimelineTitleStatement at 11-20: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline section statement that ends before its trailing whitespace",
      fixture: "db-section-trailing-spaces",
      mutate: placeFirst("TimelineSectionStatement", [11, 22]),
      expected:
        "TimelineSectionStatement at 11-22: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline accessibility title statement that starts after the start of its keyword",
      fixture: "db-acc-title-trailing-spaces",
      mutate: placeFirst("TimelineAccTitleStatement", [12, 22]),
      expected:
        "TimelineAccTitleStatement at 12-22: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline accessibility description statement that starts after the start of its keyword",
      fixture: "db-acc-descr-trailing-spaces",
      mutate: placeFirst("TimelineAccDescrStatement", [12, 22]),
      expected:
        "TimelineAccDescrStatement at 12-22: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline accessibility description statement that covers the trailing whitespace of its line",
      fixture: "db-acc-descr-trailing-spaces",
      mutate: placeFirst("TimelineAccDescrStatement", [11, 25]),
      expected:
        "TimelineAccDescrStatement at 11-25: the range, which runs from the first of its tokens and child nodes to the last: [11,25], not [11,22]",
    },
    {
      name: "fails a timeline event whose range leaves out its leading whitespace",
      fixture: "db-event-leading-spaces",
      mutate: (root, input) => {
        const node = nodesOf(root).find(
          (candidate) =>
            candidate.type === "TimelineLiteral" && candidate.range[0] === 15,
        )!
        setField(node, "range", [16, 18])
        setField(node, "loc", locationOf(input, [16, 18]))
      },
      expected:
        "TimelineLiteral at 16-18: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline event whose range leaves out its trailing whitespace",
      fixture: "db-event-trailing-spaces",
      mutate: (root, input) => {
        const node = nodesOf(root).find(
          (candidate) =>
            candidate.type === "TimelineLiteral" && candidate.range[0] === 15,
        )!
        setField(node, "range", [15, 18])
        setField(node, "loc", locationOf(input, [15, 18]))
      },
      expected:
        "TimelineLiteral at 15-18: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline title text whose range leaves out its leading whitespace",
      fixture: "db-title-two-spaces",
      mutate: placeFirst("TimelineLiteral", [18, 19]),
      expected:
        "TimelineLiteral at 18-19: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline section name whose range leaves out its leading whitespace",
      fixture: "db-section-two-spaces",
      mutate: placeFirst("TimelineLiteral", [20, 21]),
      expected:
        "TimelineLiteral at 20-21: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline accessibility title text whose range covers its leading whitespace",
      fixture: "db-acc-title-trailing-spaces",
      mutate: placeFirst("TimelineLiteral", [20, 22]),
      expected:
        "TimelineLiteral at 20-22: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline accessibility title text whose range covers its trailing whitespace",
      fixture: "db-acc-title-trailing-spaces",
      mutate: placeFirst("TimelineLiteral", [21, 23]),
      expected:
        "TimelineLiteral at 21-23: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline accessibility description text whose range covers its leading whitespace",
      fixture: "db-acc-descr-trailing-spaces",
      mutate: placeFirst("TimelineLiteral", [20, 22]),
      expected:
        "TimelineLiteral at 20-22: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline accessibility description text whose range covers its trailing whitespace",
      fixture: "db-acc-descr-trailing-spaces",
      mutate: placeFirst("TimelineLiteral", [21, 23]),
      expected:
        "TimelineLiteral at 21-23: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline description block text whose range covers its leading whitespace",
      fixture: "db-acc-descr-block",
      mutate: placeFirst("TimelineLiteral", [23, 37]),
      expected:
        "TimelineLiteral at 23-37: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a timeline description block text whose range covers its trailing whitespace",
      fixture: "db-acc-descr-block",
      mutate: placeFirst("TimelineLiteral", [24, 38]),
      expected:
        "TimelineLiteral at 24-38: does not run from the start of a token to the end of a token",
    },
  ])
})

describe("checkTree: the ranges of the nodes of an info diagram (positions/info.md)", () => {
  itFailsEachRecorded("info", [
    {
      name: "fails an info root that ends before the end of the input",
      fixture: "header-lf",
      mutate: (root, input) => {
        setField(root, "range", [0, 4])
        setField(root, "loc", locationOf(input, [0, 4]))
      },
      expected:
        "Root: the root does not cover the whole input: [0,4], not [0,5]",
    },
    {
      name: "fails an info diagram that starts at its header after retained YAML",
      fixture: "frontmatter-nonleading-comment",
      mutate: placeFirst("InfoDiagram", [28, 32]),
      expected:
        "InfoDiagram at 28-32: the range, which runs from the first of its tokens and child nodes to the last: [28,32], not [5,32]",
    },
    {
      name: "fails an info diagram that starts at its header after a retained directive",
      fixture: "detect-second-scan-directive",
      mutate: placeFirst("InfoDiagram", [17, 21]),
      expected:
        "InfoDiagram at 17-21: the range, which runs from the first of its tokens and child nodes to the last: [17,21], not [0,21]",
    },
    {
      name: "fails an info diagram that starts after the first character of its header",
      fixture: "header-lf",
      mutate: placeFirst("InfoDiagram", [1, 4]),
      expected:
        "InfoDiagram at 1-4: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info diagram that covers the line feed after its header",
      fixture: "header-lf",
      mutate: placeFirst("InfoDiagram", [0, 5]),
      expected:
        "InfoDiagram at 0-5: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info diagram that ends before its last flag character",
      fixture: "header-inline-flag",
      mutate: placeFirst("InfoDiagram", [0, 12]),
      expected:
        "InfoDiagram at 0-12: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info diagram that ends before its last body token",
      fixture: "common-all",
      mutate: placeFirst("InfoDiagram", [0, 38]),
      expected:
        "InfoDiagram at 0-38: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info diagram that covers its trailing native comment",
      fixture: "comment-eof",
      mutate: placeFirst("InfoDiagram", [0, 17]),
      expected:
        "InfoDiagram at 0-17: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info diagram that covers the comment before its first retained form",
      fixture: "frontmatter-nonleading-comment",
      mutate: placeFirst("InfoDiagram", [0, 32]),
      expected:
        "InfoDiagram at 0-32: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info diagram that starts at a passed percent-brace line",
      fixture: "lex-detect-preheader-empty-braces",
      mutate: placeFirst("InfoDiagram", [0, 11]),
      expected:
        "InfoDiagram at 0-11: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info diagram that starts at a passed unclosed percent-brace line",
      fixture: "lex-detect-preheader-open-brace",
      mutate: placeFirst("InfoDiagram", [0, 9]),
      expected:
        "InfoDiagram at 0-9: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info title statement that starts after its keyword starts",
      fixture: "title-tabs",
      mutate: placeFirst("InfoTitleStatement", [6, 18]),
      expected:
        "InfoTitleStatement at 6-18: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info title statement that ends before its last value character",
      fixture: "title-tabs",
      mutate: placeFirst("InfoTitleStatement", [5, 17]),
      expected:
        "InfoTitleStatement at 5-17: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a null info title statement that covers the line feed after its keyword",
      fixture: "title-empty",
      mutate: placeFirst("InfoTitleStatement", [5, 11]),
      expected:
        "InfoTitleStatement at 5-11: the range, which runs from the first of its tokens and child nodes to the last: [5,11], not [5,10]",
    },
    {
      name: "fails an info accessibility title statement that starts after its keyword starts",
      fixture: "acctitle-gap",
      mutate: placeFirst("InfoAccTitleStatement", [6, 18]),
      expected:
        "InfoAccTitleStatement at 6-18: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info accessibility title statement that ends before its last value character",
      fixture: "acctitle-gap",
      mutate: placeFirst("InfoAccTitleStatement", [5, 17]),
      expected:
        "InfoAccTitleStatement at 5-17: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a null info accessibility title statement that covers the line feed after its colon",
      fixture: "acctitle-empty",
      mutate: placeFirst("InfoAccTitleStatement", [5, 15]),
      expected:
        "InfoAccTitleStatement at 5-15: the range, which runs from the first of its tokens and child nodes to the last: [5,15], not [5,14]",
    },
    {
      name: "fails an info accessibility description statement that starts after its keyword starts",
      fixture: "accdescr-line-quoted",
      mutate: placeFirst("InfoAccDescrStatement", [6, 22]),
      expected:
        "InfoAccDescrStatement at 6-22: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info accessibility description statement that ends before its last value character",
      fixture: "accdescr-line-quoted",
      mutate: placeFirst("InfoAccDescrStatement", [5, 21]),
      expected:
        "InfoAccDescrStatement at 5-21: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a null info accessibility description statement that covers the line feed after its colon",
      fixture: "accdescr-line-empty",
      mutate: placeFirst("InfoAccDescrStatement", [5, 15]),
      expected:
        "InfoAccDescrStatement at 5-15: the range, which runs from the first of its tokens and child nodes to the last: [5,15], not [5,14]",
    },
    {
      name: "fails an info description block statement that starts after its keyword starts",
      fixture: "space-block-interior",
      mutate: placeFirst("InfoAccDescrBlockStatement", [6, 27]),
      expected:
        "InfoAccDescrBlockStatement at 6-27: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info description block statement that ends before its first closing brace",
      fixture: "hidden-directive-block-first-brace",
      mutate: placeFirst("InfoAccDescrBlockStatement", [5, 21]),
      expected:
        'InfoAccDescrBlockStatement at 5-21: the common statement\'s fixed components: "accDescr{", not "accDescr{}"',
    },
    {
      name: "fails an empty info description block statement that ends before its closing brace",
      fixture: "accdescr-block-empty",
      mutate: placeFirst("InfoAccDescrBlockStatement", [5, 15]),
      expected:
        'InfoAccDescrBlockStatement at 5-15: the common statement\'s fixed components: "accDescr{", not "accDescr{}"',
    },
    {
      name: "fails a whitespace-only info description block statement that ends before its closing brace",
      fixture: "lex-block-whitespace-only",
      mutate: placeFirst("InfoAccDescrBlockStatement", [5, 20]),
      expected:
        "InfoAccDescrBlockStatement at 5-20: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a directive-only info description block statement that ends before its closing brace",
      fixture: "lex-block-directive-only",
      mutate: placeFirst("InfoAccDescrBlockStatement", [5, 27]),
      expected:
        "InfoAccDescrBlockStatement at 5-27: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a comment-only info description block statement that ends before its closing brace",
      fixture: "lex-block-comment-only",
      mutate: placeFirst("InfoAccDescrBlockStatement", [5, 21]),
      expected:
        "InfoAccDescrBlockStatement at 5-21: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info title statement that ends at its value before its hidden suffix",
      fixture: "hidden-directive-title-eof",
      mutate: placeFirst("InfoTitleStatement", [5, 12]),
      expected:
        "InfoTitleStatement at 5-12: the range, which runs from the first of its tokens and child nodes to the last: [5,12], not [5,18]",
    },
    {
      name: "fails an info accessibility title statement that ends at its value before its hidden suffix",
      fixture: "hidden-directive-acctitle-eof",
      mutate: placeFirst("InfoAccTitleStatement", [5, 16]),
      expected:
        "InfoAccTitleStatement at 5-16: the range, which runs from the first of its tokens and child nodes to the last: [5,16], not [5,22]",
    },
    {
      name: "fails an info accessibility description statement that ends at its value before its hidden suffix",
      fixture: "hidden-directive-accdescr-eof",
      mutate: placeFirst("InfoAccDescrStatement", [5, 16]),
      expected:
        "InfoAccDescrStatement at 5-16: the range, which runs from the first of its tokens and child nodes to the last: [5,16], not [5,22]",
    },
    {
      name: "fails an info description block statement that ends at its brace before its hidden suffix",
      fixture: "hidden-directive-block-eof",
      mutate: placeFirst("InfoAccDescrBlockStatement", [5, 19]),
      expected:
        "InfoAccDescrBlockStatement at 5-19: the range, which runs from the first of its tokens and child nodes to the last: [5,19], not [5,25]",
    },
    {
      name: "fails an info description block statement that ends before the last of its two hidden suffixes",
      fixture: "lex-hidden-tail-two",
      mutate: placeFirst("InfoAccDescrBlockStatement", [5, 25]),
      expected:
        "InfoAccDescrBlockStatement at 5-25: the range, which runs from the first of its tokens and child nodes to the last: [5,25], not [5,38]",
    },
    {
      name: "fails an info description block statement that covers the line feed after its closing brace",
      fixture: "accdescr-block-empty",
      mutate: placeFirst("InfoAccDescrBlockStatement", [5, 17]),
      expected:
        "InfoAccDescrBlockStatement at 5-17: the range, which runs from the first of its tokens and child nodes to the last: [5,17], not [5,16]",
    },
    {
      name: "fails an info title statement that covers its native comment",
      fixture: "comment-title",
      mutate: placeFirst("InfoTitleStatement", [5, 16]),
      expected:
        "InfoTitleStatement at 5-16: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info accessibility title statement that covers its native comment",
      fixture: "comment-acctitle",
      mutate: placeFirst("InfoAccTitleStatement", [5, 20]),
      expected:
        "InfoAccTitleStatement at 5-20: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info accessibility description statement that covers its native comment",
      fixture: "comment-accdescr",
      mutate: placeFirst("InfoAccDescrStatement", [5, 20]),
      expected:
        "InfoAccDescrStatement at 5-20: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info description block statement that covers its native comment",
      fixture: "comment-after-block",
      mutate: placeFirst("InfoAccDescrBlockStatement", [5, 23]),
      expected:
        "InfoAccDescrBlockStatement at 5-23: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info title literal whose range leaves out its leading padding",
      fixture: "title-tabs",
      mutate: placeFirst("InfoLiteral", [12, 18]),
      expected:
        "InfoLiteral at 12-18: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info title literal whose range leaves out its trailing padding",
      fixture: "title-tabs",
      mutate: placeFirst("InfoLiteral", [11, 17]),
      expected:
        "InfoLiteral at 11-17: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info accessibility title literal whose range leaves out its leading padding",
      fixture: "acctitle-gap",
      mutate: placeFirst("InfoLiteral", [17, 18]),
      expected:
        "InfoLiteral at 17-18: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info accessibility title literal whose range leaves out its trailing whitespace",
      fixture: "acctitle-repeat-empty",
      mutate: (root, input) => {
        const node = nodesOf(root).find(
          (candidate) =>
            candidate.type === "InfoLiteral" && candidate.range[0] === 38,
        )!
        setField(node, "range", [38, 39])
        setField(node, "loc", locationOf(input, [38, 39]))
      },
      expected:
        "InfoLiteral at 38-39: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info accessibility description literal whose range leaves out its leading whitespace",
      fixture: "lex-accdescr-line-whitespace",
      mutate: placeFirst("InfoLiteral", [15, 16]),
      expected:
        "InfoLiteral at 15-16: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info accessibility description literal whose range leaves out its trailing whitespace",
      fixture: "lex-accdescr-line-whitespace",
      mutate: placeFirst("InfoLiteral", [14, 15]),
      expected:
        "InfoLiteral at 14-15: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info block literal whose range holds its leading common whitespace",
      fixture: "space-block-interior",
      mutate: placeFirst("InfoLiteral", [16, 25]),
      expected:
        "InfoLiteral at 16-25: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info block literal whose range holds its trailing common whitespace",
      fixture: "space-block-interior",
      mutate: placeFirst("InfoLiteral", [17, 26]),
      expected:
        "InfoLiteral at 17-26: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info hidden directive whose range leaves out its opener character",
      fixture: "hidden-directive-padding",
      mutate: placeFirst("InfoIgnoredText", [8, 16]),
      expected:
        "InfoIgnoredText at 8-16: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info hidden directive whose range leaves out its closer character",
      fixture: "hidden-directive-padding",
      mutate: placeFirst("InfoIgnoredText", [7, 15]),
      expected:
        "InfoIgnoredText at 7-15: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info hidden YAML whose range leaves out its opener character",
      fixture: "hidden-yaml-empty",
      mutate: placeFirst("InfoIgnoredText", [6, 12]),
      expected:
        "InfoIgnoredText at 6-12: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info hidden YAML whose range leaves out its closer character",
      fixture: "hidden-yaml-empty",
      mutate: placeFirst("InfoIgnoredText", [5, 11]),
      expected:
        "InfoIgnoredText at 5-11: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info hidden directive whose range holds its preceding ASCII padding",
      fixture: "hidden-directive-padding",
      mutate: placeFirst("InfoIgnoredText", [6, 16]),
      expected:
        "InfoIgnoredText at 6-16: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info hidden YAML whose range holds its preceding ASCII padding",
      fixture: "hidden-yaml-after-flag",
      mutate: placeFirst("InfoIgnoredText", [13, 26]),
      expected:
        "InfoIgnoredText at 13-26: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info hidden directive whose range holds its consumed following line feed",
      fixture: "hidden-directive-padding",
      mutate: placeFirst("InfoIgnoredText", [7, 17]),
      expected:
        "InfoIgnoredText at 7-17: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info hidden YAML whose range holds its consumed following line feed",
      fixture: "hidden-yaml-empty",
      mutate: placeFirst("InfoIgnoredText", [5, 13]),
      expected:
        "InfoIgnoredText at 5-13: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info hidden directive whose range holds the appended line feed beyond source EOF",
      fixture: "hidden-directive-title-eof",
      mutate: placeFirst("InfoIgnoredText", [12, 19]),
      expected: "InfoIgnoredText at 12-19: lies outside the input",
    },
    {
      name: "fails an info hidden YAML whose range holds the appended line feed beyond source EOF",
      fixture: "hidden-yaml-block-eof",
      mutate: placeFirst("InfoIgnoredText", [19, 32]),
      expected: "InfoIgnoredText at 19-32: lies outside the input",
    },
    {
      name: "fails an info literal whose range ends before its internal common directive",
      fixture: "directive-title-value",
      mutate: placeFirst("InfoLiteral", [11, 12]),
      expected:
        'InfoLiteral at 11-12: value is not its written text: "ab", not "a"',
    },
    {
      name: "fails an info literal whose range ends before its internal comment region",
      fixture: "lex-line-comment-region-ls",
      mutate: placeFirst("InfoLiteral", [11, 13]),
      expected:
        'InfoLiteral at 11-13: value is not its written text: "A\u2028B", not "A\u2028"',
    },
    {
      name: "fails an info literal whose range ends before its internal selected semicolon",
      fixture: "lex-acc-title-line-separator-comment-line-line-rule-after",
      mutate: placeFirst("InfoLiteral", [14, 30]),
      expected:
        'InfoLiteral at 14-30: value is not its written text: " A\u2028style:#bB", not " A\u2028style:#b"',
    },
    {
      name: "fails an info hidden form whose range ends before its internal common directive",
      fixture: "lex-hidden-nested-global",
      mutate: placeFirst("InfoIgnoredText", [5, 10]),
      expected:
        "InfoIgnoredText at 5-10: the value is not one complete hidden YAML or DIRECTIVE form without its following LF",
    },
    {
      name: "fails an info hidden form whose range ends before its internal comment region",
      fixture: "lex-yaml-common-comment",
      mutate: placeFirst("InfoIgnoredText", [5, 9]),
      expected:
        "InfoIgnoredText at 5-9: the value is not one complete hidden YAML or DIRECTIVE form without its following LF",
    },
    {
      name: "fails an info hidden form whose range ends before its internal selected semicolon",
      fixture: "lex-yaml-fences-selected",
      mutate: (root, input) => {
        const node = nodesOf(root).find(
          (candidate) =>
            candidate.type === "InfoIgnoredText" && candidate.range[0] === 23,
        )!
        setField(node, "range", [23, 25])
        setField(node, "loc", locationOf(input, [23, 25]))
      },
      expected:
        "InfoIgnoredText at 23-25: the value is not one complete hidden YAML or DIRECTIVE form without its following LF",
    },
    {
      name: "fails an info hidden directive that ends at a nonqualifying closer",
      fixture: "hidden-directive-nonqualifying-closer",
      mutate: placeFirst("InfoIgnoredText", [5, 11]),
      expected:
        "InfoIgnoredText at 5-11: the value is not one complete hidden YAML or DIRECTIVE form without its following LF",
    },
    {
      name: "fails an info hidden YAML that ends at a nonqualifying closer",
      fixture: "hidden-yaml-nonqualifying-closer",
      mutate: placeFirst("InfoIgnoredText", [5, 17]),
      expected:
        "InfoIgnoredText at 5-17: the value is not one complete hidden YAML or DIRECTIVE form without its following LF",
    },
    {
      name: "fails an info literal whose range counts CRLF as one source unit",
      fixture: "line-crlf",
      mutate: placeFirst("InfoLiteral", [25, 28]),
      expected:
        "InfoLiteral at 25-28: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an info title statement whose range holds the outside padding before it",
      fixture: "header-common-inline",
      mutate: placeFirst("InfoTitleStatement", [4, 12]),
      expected:
        "InfoTitleStatement at 4-12: the range, which runs from the first of its tokens and child nodes to the last: [4,12], not [5,12]",
    },
    {
      name: "fails an info accessibility title statement whose range holds the outside padding before it",
      fixture: "lex-selected-colon-boundary",
      mutate: placeFirst("InfoAccTitleStatement", [22, 35]),
      expected:
        "InfoAccTitleStatement at 22-35: the range, which runs from the first of its tokens and child nodes to the last: [22,35], not [23,35]",
    },
    {
      name: "fails an info description block statement whose range holds the outside padding before it",
      fixture: "lex-selected-brace-boundary",
      mutate: placeFirst("InfoAccDescrBlockStatement", [22, 37]),
      expected:
        "InfoAccDescrBlockStatement at 22-37: the range, which runs from the first of its tokens and child nodes to the last: [22,37], not [23,37]",
    },
  ])
})

describe("checkTree: the gaps of an info diagram that no recorded tree holds (positions/info.md)", () => {
  // The corpus has no accessibility description line with ASCII padding before
  // its keyword, so this tree is made by hand with the diagram's own builder.
  itFailsEach([
    {
      name: "an info accessibility description statement whose range holds the outside padding before it",
      built: () =>
        buildInfo("info\n accDescr: A\n", (kit) => [
          common(kit, "Info", "AccDescr", " A"),
        ]),
      mutate: placeFirst("InfoAccDescrStatement", [5, 17]),
      expected:
        "InfoAccDescrStatement at 5-17: the range, which runs from the first of its tokens and child nodes to the last: [5,17], not [6,17]",
    },
  ])
})
