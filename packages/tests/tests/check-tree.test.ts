import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type {
  CheckedComment,
  CheckedDirective,
  CheckedFrontmatter,
  CheckedRoot,
  CheckedToken,
  Location,
  TreeProblem,
} from "../src/check-tree/types.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import {
  commentOf,
  directiveOf,
  frontmatterOf,
  handMadeRoot,
  locationOf,
  shifted,
  tokenOf,
} from "./check-tree-trees.ts"
import type { Piece } from "./check-tree-trees.ts"

// The check itself: it must pass the trees of ast.md and fail every tree that
// breaks one of the conditions of positions.md, Invariants. The trees are made
// by hand from the pieces of the source that their records cover.

/**
 * Frontmatter, whitespace of every kind, a directive, the tokens `error`,
 * `%%`, and `x;`, and a comment line.
 */
const text =
  "---\na: 1\n---\n\uFEFF %%{init: {}}%% error\u00A0%% x;\n%% c\r\n\u2028\t"

/** Whether one of the problems says `message`. */
function says(problems: readonly TreeProblem[], message: string): boolean {
  return problems.some((problem) =>
    `${problem.where}: ${problem.message}`.includes(message),
  )
}

/** The valid tree of `text`, and its parts by name. */
function validParts(): {
  root: CheckedRoot
  frontmatterTokens: CheckedToken[]
  directiveToken: CheckedToken
  error: CheckedToken
  percent: CheckedToken
  last: CheckedToken
  comment: CheckedComment
} {
  const errorAt = text.indexOf("error")
  const frontmatterTokens = [
    tokenOf(text, "Punctuator", "---"),
    tokenOf(text, "RawText", "a: 1"),
    tokenOf(text, "Punctuator", { text: "---", from: 4 }),
  ]
  const directiveToken = tokenOf(text, "Directive", "%%{init: {}}%%")
  const error = tokenOf(text, "RawText", "error")
  const percent = tokenOf(text, "RawText", { text: "%%", from: errorAt })
  const last = tokenOf(text, "RawText", "x;")
  const comment = commentOf(text, "%%", "%% c")
  const root = handMadeRoot(text, {
    tokens: [],
    comments: [comment],
    directives: [directiveOf(text, "%%{init: {}}%%")],
    frontmatter: frontmatterOf(text, "---\na: 1\n---", [4, 8]),
  })
  return {
    root: {
      ...root,
      body: {
        ...root.body,
        range: [error.range[0], last.range[1]],
        loc: locationOf(text, [error.range[0], last.range[1]]),
      },
      tokens: [...frontmatterTokens, directiveToken, error, percent, last],
    },
    frontmatterTokens,
    directiveToken,
    error,
    percent,
    last,
    comment,
  }
}

/** The valid tree with `diagramTokens` in place of the tokens of its diagram. */
function withDiagramTokens(
  parts: ReturnType<typeof validParts>,
  ...diagramTokens: CheckedToken[]
): CheckedRoot {
  return {
    ...parts.root,
    tokens: [
      ...parts.frontmatterTokens,
      parts.directiveToken,
      ...diagramTokens,
    ],
  }
}

describe("checkTree: the conditions of every tree", () => {
  it("passes a tree whose lists leave only whitespace and line terminators outside", () => {
    expect(checkTree(text, validParts().root)).toEqual([])
  })

  it("fails when a token is missing", () => {
    const parts = validParts()
    // Without the `%%` token, its characters are in no list.
    const broken = withDiagramTokens(parts, parts.error, parts.last)
    expect(says(checkTree(text, broken), "is not whitespace")).toBe(true)
  })

  it("fails when a comment, or the token of a directive or of the frontmatter, is missing", () => {
    const parts = validParts()
    const { root, frontmatterTokens, directiveToken, error, percent, last } =
      parts
    expect(
      says(checkTree(text, { ...root, comments: [] }), "is not whitespace"),
    ).toBe(true)
    expect(
      says(
        checkTree(text, {
          ...root,
          tokens: [...frontmatterTokens, error, percent, last],
        }),
        "is not whitespace",
      ),
    ).toBe(true)
    expect(
      says(
        checkTree(text, {
          ...root,
          tokens: [
            ...frontmatterTokens.slice(0, 2),
            directiveToken,
            error,
            percent,
            last,
          ],
        }),
        "is not whitespace",
      ),
    ).toBe(true)
  })

  it("fails when a Directive token has no directive", () => {
    const { root } = validParts()
    const problems = checkTree(text, { ...root, directives: [] })
    expect(says(problems, "the Directive tokens")).toBe(true)
  })

  it("fails when the frontmatter is not divided into its delimiters and its body", () => {
    const { root, frontmatterTokens } = validParts()
    const [opening, , closing] = frontmatterTokens
    if (
      root.frontmatter === null ||
      opening === undefined ||
      closing === undefined
    ) {
      throw new Error("unexpected tree")
    }
    const whole: CheckedToken = {
      ...opening,
      value: text.slice(...root.frontmatter.range),
      range: root.frontmatter.range,
      loc: root.frontmatter.loc,
    }
    expect(
      says(
        checkTree(text, { ...root, tokens: [whole, ...root.tokens.slice(3)] }),
        "the tokens in the range of the frontmatter",
      ),
    ).toBe(true)
    const bodyAsPunctuator: CheckedToken = {
      ...frontmatterTokens[1],
      type: "Punctuator",
    }
    expect(
      says(
        checkTree(text, {
          ...root,
          tokens: [opening, bodyAsPunctuator, closing, ...root.tokens.slice(3)],
        }),
        "the tokens in the range of the frontmatter",
      ),
    ).toBe(true)
  })

  it("fails when tokens overlap or are out of order", () => {
    const parts = validParts()
    const { error, percent, last } = parts
    // The same token twice: the second one starts before the first one ends.
    const twice = withDiagramTokens(parts, error, error, percent, last)
    expect(says(checkTree(text, twice), "overlaps the RawText before it")).toBe(
      true,
    )
    const swapped = withDiagramTokens(parts, error, last, percent)
    expect(says(checkTree(text, swapped), "comes before it")).toBe(true)
  })

  it("fails when a token's range is shifted, or its value is not the source text of its range", () => {
    const parts = validParts()
    const { error, percent, last } = parts
    // `error` moved one character to the left: its last character is in no
    // list.
    const moved = withDiagramTokens(parts, shifted(error, -1), percent, last)
    expect(says(checkTree(text, moved), "is not whitespace")).toBe(true)
    // `error` with the space before it: every character is covered, but the
    // value is no longer the source text of its range.
    const widened: CheckedToken = {
      ...error,
      range: [error.range[0] - 1, error.range[1]],
      loc: { start: shifted(error, -1).loc.start, end: error.loc.end },
    }
    const wide = withDiagramTokens(parts, widened, percent, last)
    expect(says(checkTree(text, wide), "RawText at")).toBe(true)
    expect(says(checkTree(text, wide), "value")).toBe(true)
    const wrongValue: CheckedToken = { ...error, value: "ERROR" }
    expect(
      says(
        checkTree(text, withDiagramTokens(parts, wrongValue, percent, last)),
        "value",
      ),
    ).toBe(true)
    const wrongLoc: CheckedToken = {
      ...error,
      loc: { start: error.loc.start, end: error.loc.start },
    }
    expect(
      says(
        checkTree(text, withDiagramTokens(parts, wrongLoc, percent, last)),
        "loc",
      ),
    ).toBe(true)
  })

  it("fails when a token starts or ends with whitespace or a line terminator where no value starts or ends", () => {
    // `error` with the space before it, and with the space after it, in the
    // `error` pseudo-diagram, which has no value node. The values are the
    // source texts of the ranges, so only this condition fails.
    const source = "x error y"
    for (const [piece, message] of [
      [
        " error",
        "starts with whitespace or a line terminator where no value starts",
      ],
      [
        "error ",
        "ends with whitespace or a line terminator where no value ends",
      ],
    ] as const) {
      const root = handMadeRoot(source, {
        tokens: [
          ["RawText", "x"],
          ["RawText", piece],
          ["RawText", "y"],
        ],
      })
      expect(says(checkTree(source, root), message)).toBe(true)
    }
    const lineEnd = "error\nx"
    const root = handMadeRoot(lineEnd, {
      tokens: [
        ["RawText", "error\n"],
        ["RawText", "x"],
      ],
    })
    expect(
      says(
        checkTree(lineEnd, root),
        "RawText at 0-6: ends with whitespace or a line terminator where no value ends",
      ),
    ).toBe(true)
  })

  it("fails when the body covers an IgnoredSemicolon token after its last token", () => {
    // ast.md, Nodes: the range of the body ends before an ignored `;` after
    // its last token, which is the token of no node.
    const source = "classDiagram\nclassDef c fill:#f00;\n"
    const root = handMadeRoot(source, {
      bodyType: "ClassDiagram",
      tokens: [
        ["Keyword", "classDiagram"],
        ["Keyword", "classDef"],
        ["Identifier", "c"],
        ["RawText", "fill:#f00"],
        ["IgnoredSemicolon", ";"],
      ],
    })
    expect(root.body.range[1]).toBe(source.indexOf(";"))
    const range: TreeRange = [root.body.range[0], source.indexOf(";") + 1]
    const broken: CheckedRoot = {
      ...root,
      body: { ...root.body, range, loc: locationOf(source, range) },
    }
    expect(
      says(
        checkTree(source, broken),
        "does not run from its first token to its last",
      ),
    ).toBe(true)
  })

  it("fails when a directive lies inside a token", () => {
    const parts = validParts()
    const { root, frontmatterTokens, error, percent, last } = parts
    const directive = root.directives[0]
    if (directive === undefined) throw new Error("unexpected tree")
    // One token from the start of the directive to the end of `error`, in
    // place of the `Directive` token and `error`.
    const range: TreeRange = [directive.range[0], error.range[1]]
    const wide: CheckedToken = {
      type: "RawText",
      value: text.slice(...range),
      range,
      loc: { start: directive.loc.start, end: error.loc.end },
    }
    const broken: CheckedRoot = {
      ...root,
      body: {
        ...root.body,
        range: [range[0], root.body.range[1]],
        loc: { start: directive.loc.start, end: root.body.loc.end },
      },
      tokens: [...frontmatterTokens, wide, percent, last],
    }
    expect(
      says(
        checkTree(text, broken),
        "Directive at 15-29: lies inside RawText at 15-35",
      ),
    ).toBe(true)
  })

  describe("a token that a directive or an ignored `;` cuts", () => {
    /** The tree of `source` with the tokens `pieces`, and the directives of `source` that it names. */
    function treeOf(
      source: string,
      pieces: readonly [string, string | { text: string; from?: number }][],
      directive?: string,
    ): CheckedRoot {
      return handMadeRoot(source, {
        tokens: pieces,
        directives:
          directive === undefined ? [] : [directiveOf(source, directive)],
      })
    }

    // A `Keyword` token is cut only when the texts of the fragments joined are
    // a keyword of the diagram (tests/check-tree-keywords.test.ts).
    for (const kind of ["Identifier", "Numeric"]) {
      it(`fails when a directive cuts a ${kind} token into fragments`, () => {
        const source = "ab%%{init: {}}%%cd"
        const root = treeOf(
          source,
          [
            [kind, "ab"],
            ["Directive", "%%{init: {}}%%"],
            [kind, "cd"],
          ],
          "%%{init: {}}%%",
        )
        expect(says(checkTree(source, root), "token is cut:")).toBe(true)
      })

      it(`fails when an ignored ; cuts a ${kind} token into fragments`, () => {
        const source = "ab;cd"
        const root = treeOf(source, [
          [kind, "ab"],
          ["IgnoredSemicolon", ";"],
          [kind, "cd"],
        ])
        expect(says(checkTree(source, root), "token is cut:")).toBe(true)
      })
    }

    it("passes a RawText token cut by a directive, and tokens of units that whitespace separates", () => {
      const cut = "ab%%{init: {}}%%cd"
      expect(
        says(
          checkTree(
            cut,
            treeOf(
              cut,
              [
                ["RawText", "ab"],
                ["Directive", "%%{init: {}}%%"],
                ["RawText", "cd"],
              ],
              "%%{init: {}}%%",
            ),
          ),
          "token is cut:",
        ),
      ).toBe(false)
      const apart = "ab %%{init: {}}%% cd"
      expect(
        says(
          checkTree(
            apart,
            treeOf(
              apart,
              [
                ["Identifier", "ab"],
                ["Directive", "%%{init: {}}%%"],
                ["Identifier", "cd"],
              ],
              "%%{init: {}}%%",
            ),
          ),
          "token is cut:",
        ),
      ).toBe(false)
    })
  })

  it("passes a token cut by a comment region, with a Directive token for the directive before the comment's `%%`", () => {
    // A token that continues across a comment line, as a multi-line quoted
    // label does, is cut at the comment region: the region lies outside every
    // token, the directive before the comment's `%%` has a `Directive` token,
    // and the one inside the comment has none.
    const source = 'error "a\n%%{init: {}}%% %% c %%{wrap}%%\nb"'
    const root = handMadeRoot(source, {
      tokens: [
        ["RawText", "error"],
        ["RawText", '"a'],
        ["Directive", "%%{init: {}}%%"],
        ["RawText", 'b"'],
      ],
      comments: [commentOf(source, "%%", "%% c %%{wrap}%%")],
      directives: [
        directiveOf(source, "%%{init: {}}%%"),
        directiveOf(source, "%%{wrap}%%"),
      ],
    })
    expect(checkTree(source, root)).toEqual([])
  })

  it("fails when a comment region lies inside a token", () => {
    // The token reads through the comment region instead of being cut there.
    const source = 'error "a\n%%{init: {}}%% %% c\nb"'
    const root = handMadeRoot(source, {
      tokens: [
        ["RawText", "error"],
        ["RawText", '"a\n%%{init: {}}%% %% c\nb"'],
      ],
      comments: [commentOf(source, "%%", "%% c")],
      directives: [directiveOf(source, "%%{init: {}}%%")],
    })
    expect(
      says(
        checkTree(source, root),
        "Comment at 24-28: lies inside RawText at 6-31",
      ),
    ).toBe(true)
  })

  it("fails when a comment lies partly inside a token", () => {
    const parts = validParts()
    const { root, error, percent, last, comment } = parts
    // The last token grows over the line terminator and the comment's `%%`.
    const range: TreeRange = [last.range[0], comment.range[0] + 2]
    const wide: CheckedToken = {
      type: "RawText",
      value: text.slice(...range),
      range,
      loc: {
        start: last.loc.start,
        end: { line: comment.loc.start.line, column: 2 },
      },
    }
    const broken: CheckedRoot = {
      ...withDiagramTokens(parts, error, percent, wide),
      body: {
        ...root.body,
        range: [root.body.range[0], range[1]],
        loc: { start: root.body.loc.start, end: wide.loc.end },
      },
    }
    expect(says(checkTree(text, broken), "lies inside RawText")).toBe(true)
  })

  it("fails when comments or directives overlap", () => {
    const { root, comment } = validParts()
    expect(
      says(
        checkTree(text, { ...root, comments: [comment, comment] }),
        "overlaps the Comment before it",
      ),
    ).toBe(true)
    // A directive listed twice, inside a comment, so that it has no
    // `Directive` token.
    const source = "error\n%% c %%{init: {}}%%"
    const twice = handMadeRoot(source, {
      tokens: [["RawText", "error"]],
      comments: [commentOf(source, "%%", "%% c %%{init: {}}%%")],
      directives: [
        directiveOf(source, "%%{init: {}}%%"),
        directiveOf(source, "%%{init: {}}%%"),
      ],
    })
    expect(
      says(checkTree(source, twice), "overlaps the Directive before it"),
    ).toBe(true)
  })

  it("fails when the content fields of a comment, a directive, or the frontmatter are not the text of their ranges", () => {
    const { root } = validParts()
    const [comment] = root.comments
    const [directive] = root.directives
    if (
      comment === undefined ||
      directive === undefined ||
      root.frontmatter === null
    ) {
      throw new Error("unexpected tree")
    }
    expect(
      says(
        checkTree(text, { ...root, comments: [{ ...comment, value: "c" }] }),
        "Comment at",
      ),
    ).toBe(true)
    expect(
      says(
        checkTree(text, {
          ...root,
          directives: [{ ...directive, closed: false }],
        }),
        "Directive at",
      ),
    ).toBe(true)
    expect(
      says(
        checkTree(text, {
          ...root,
          frontmatter: { ...root.frontmatter, valueRange: [4, 7] },
        }),
        "Frontmatter at",
      ),
    ).toBe(true)
  })

  it("fails when a comment lies in the frontmatter", () => {
    // The body of the frontmatter looks like a comment line. A comment made
    // of it lies inside the body's token.
    const source = "---\n%% c\n---\nsequenceDiagram\nA->>B: x\n"
    const frontmatter = frontmatterOf(source, "---\n%% c\n---", [4, 8])
    const root = handMadeRoot(source, {
      bodyType: "SequenceDiagram",
      frontmatter,
      tokens: [
        ["Punctuator", "---"],
        ["RawText", "%% c"],
        ["Punctuator", { text: "---", from: 4 }],
        ["Keyword", "sequenceDiagram"],
      ],
    })
    expect(
      checkTree(source, root).some((p) => p.where.startsWith("Comment")),
    ).toBe(false)
    const comment = commentOf(source, "%%", "%% c")
    expect(
      says(
        checkTree(source, { ...root, comments: [comment] }),
        "Comment at 4-8: lies inside RawText",
      ),
    ).toBe(true)
  })

  it("fails when the body does not run from its first token to its last", () => {
    const { root, error } = validParts()
    // The body ends with its first token, although two more follow.
    const short: CheckedRoot = {
      ...root,
      body: { ...root.body, range: error.range, loc: error.loc },
    }
    expect(
      says(
        checkTree(text, short),
        "does not run from its first token to its last",
      ),
    ).toBe(true)
  })

  it("fails when the root does not cover the whole input", () => {
    const { root } = validParts()
    const range: TreeRange = [0, text.length - 1]
    expect(
      says(
        checkTree(text, { ...root, range, loc: locationOf(text, range) }),
        "the root does not cover the whole input",
      ),
    ).toBe(true)
  })

  it("fails when a range lies outside the input", () => {
    // positions.md, Positions: every range lies in the input.
    const source = "x y"
    const root = handMadeRoot(source, {
      tokens: [
        ["RawText", "x"],
        ["RawText", "y"],
      ],
    })
    const [first, second] = root.tokens
    if (first === undefined || second === undefined) {
      throw new Error("unexpected tree")
    }
    const beyond: TreeRange = [2, 4]
    const token: CheckedToken = {
      ...second,
      range: beyond,
      loc: locationOf(source, beyond),
    }
    expect(
      says(
        checkTree(source, { ...root, tokens: [first, token] }),
        "RawText at 2-4: lies outside the input",
      ),
    ).toBe(true)
    const node = { ...root.body, range: [0, 4] as TreeRange }
    expect(
      says(
        checkTree(source, {
          ...root,
          body: { ...node, loc: locationOf(source, node.range) },
        }),
        "ErrorDiagram at 0-4: lies outside the input",
      ),
    ).toBe(true)
    const withComment = "x\n%% c"
    const commentRoot = handMadeRoot(withComment, {
      tokens: [["RawText", "x"]],
      comments: [commentOf(withComment, "%%", "%% c")],
    })
    const comment = commentRoot.comments[0]
    if (comment === undefined) throw new Error("unexpected tree")
    const longer: TreeRange = [comment.range[0], comment.range[1] + 3]
    expect(
      says(
        checkTree(withComment, {
          ...commentRoot,
          comments: [
            {
              ...comment,
              range: longer,
              loc: locationOf(withComment, longer),
            },
          ],
        }),
        "Comment at 2-9: lies outside the input",
      ),
    ).toBe(true)
  })

  it("fails when the loc of a comment, a directive, the frontmatter, or the body is not the place of its range", () => {
    // positions.md, Positions: every `loc` is the place of its `range`.
    const { root } = validParts()
    const [comment] = root.comments
    const [directive] = root.directives
    const { frontmatter } = root
    if (
      comment === undefined ||
      directive === undefined ||
      frontmatter === null
    ) {
      throw new Error("unexpected tree")
    }
    const wrong: Location = {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 1 },
    }
    const broken: [string, CheckedRoot][] = [
      [
        `Comment at ${comment.range[0]}-${comment.range[1]}`,
        { ...root, comments: [{ ...comment, loc: wrong }] },
      ],
      [
        `Directive at ${directive.range[0]}-${directive.range[1]}`,
        { ...root, directives: [{ ...directive, loc: wrong }] },
      ],
      [
        `Frontmatter at ${frontmatter.range[0]}-${frontmatter.range[1]}`,
        { ...root, frontmatter: { ...frontmatter, loc: wrong } },
      ],
      [
        `ErrorDiagram at ${root.body.range[0]}-${root.body.range[1]}`,
        { ...root, body: { ...root.body, loc: wrong } },
      ],
    ]
    for (const [where, tree] of broken) {
      const locs = checkTree(text, tree).filter((problem) =>
        problem.message.startsWith("loc:"),
      )
      expect(locs.map((problem) => problem.where)).toEqual([where])
    }
  })

  it("fails when a token, a comment, or a directive is empty", () => {
    // positions.md, Invariants: no range of a token, a comment, or a
    // directive is empty.
    const source = "x y"
    const empty: TreeRange = [1, 1]
    const token = handMadeRoot(source, {
      tokens: [
        ["RawText", "x"],
        ["RawText", "y"],
      ],
    })
    const emptyToken: CheckedToken = {
      type: "RawText",
      value: "",
      range: empty,
      loc: locationOf(source, empty),
    }
    expect(
      says(
        checkTree(source, {
          ...token,
          tokens: [token.tokens[0], emptyToken],
        }),
        "RawText at 1-1: is empty",
      ),
    ).toBe(true)
    const withComment = "x\ny"
    const commentRoot = handMadeRoot(withComment, {
      tokens: [
        ["RawText", "x"],
        ["RawText", "y"],
      ],
    })
    const emptyComment: CheckedComment = {
      type: "Comment",
      mark: "%%",
      value: "",
      range: empty,
      loc: locationOf(withComment, empty),
    }
    expect(
      says(
        checkTree(withComment, { ...commentRoot, comments: [emptyComment] }),
        "Comment at 1-1: is empty",
      ),
    ).toBe(true)
    const emptyDirective: CheckedDirective = {
      type: "Directive",
      name: "",
      value: "",
      closed: false,
      range: empty,
      loc: locationOf(source, empty),
    }
    expect(
      says(
        checkTree(source, { ...token, directives: [emptyDirective] }),
        "Directive at 1-1: is empty",
      ),
    ).toBe(true)
  })

  it("reports every condition that does not hold, not only the first", () => {
    // The value of a token and the diagram type of the root are broken
    // together; each has its own problem.
    const { root, error } = validParts()
    const tokens = root.tokens.map((token) =>
      token === error ? { ...token, value: "ERROR" } : token,
    )
    const problems = checkTree(text, {
      ...root,
      diagramType: "classDiagram",
      tokens,
    })
    expect(problems).toEqual([
      {
        where: `RawText at ${error.range[0]}-${error.range[1]}`,
        message: 'value: "ERROR", not "error"',
      },
      {
        where: "Root",
        message:
          "the diagram type classDiagram is not one of those of a ErrorDiagram: error",
      },
    ])
  })
})

describe("checkTree: the comment lines, the directives, and the frontmatter that the text has", () => {
  it("fails a comment line of the text that is no comment of the tree", () => {
    // The `%% c` is covered by tokens instead of being a comment: that is the
    // one problem.
    const source = "error\n%% c"
    const root = handMadeRoot(source, {
      tokens: [
        ["RawText", "error"],
        ["RawText", "%%"],
        ["RawText", "c"],
      ],
    })
    expect(checkTree(source, root)).toEqual([
      {
        where: "comment line at 6-10",
        message: "is no comment of the tree",
      },
    ])
  })

  describe("the directives of the tree", () => {
    const source = "error %%{init: {}}%% "
    const directive = "%%{init: {}}%%"

    /** The tree of the source with the given `Directive` tokens and directives. */
    function treeWith(
      directives: readonly CheckedDirective[],
      tokenCount = 1,
    ): CheckedRoot {
      return handMadeRoot(source, {
        tokens: [
          ["RawText", "error"],
          ...Array.from(
            { length: tokenCount },
            () => ["Directive", directive] as const,
          ),
        ],
        directives,
      })
    }

    it("passes the directive that the scan finds", () => {
      expect(
        checkTree(source, treeWith([directiveOf(source, directive)])),
      ).toEqual([])
    })

    it("fails a directive that the tree lacks, an extra one, one with another `closed`, and one with whitespace at its end", () => {
      const reason = "the directives of the tree are not those of the source"
      const real = directiveOf(source, directive)
      expect(says(checkTree(source, treeWith([])), reason)).toBe(true)
      expect(says(checkTree(source, treeWith([real, real])), reason)).toBe(true)
      // `closed` is false and the `value` is the text to the end of the
      // directive, so that this is the only condition that does not hold.
      const open: CheckedDirective = {
        ...real,
        closed: false,
        value: source.slice(real.range[0] + 3, real.range[1]),
      }
      expect(checkTree(source, treeWith([open]))).toEqual([
        {
          where: "the directives",
          message: `${reason}: [[[6,20],false]], not [[[6,20],true]]`,
        },
      ])
      const padded: TreeRange = [real.range[0], real.range[1] + 1]
      expect(
        says(
          checkTree(source, {
            ...treeWith([
              { ...real, range: padded, loc: locationOf(source, padded) },
            ]),
          }),
          reason,
        ),
      ).toBe(true)
    })
  })

  describe("the frontmatter", () => {
    const source = "---\na: 1\n---\nerror"

    /** The tree of `source` whose frontmatter has `fields` changed. */
    function withFrontmatter(fields: Partial<CheckedFrontmatter>): CheckedRoot {
      const frontmatter = frontmatterOf(source, "---\na: 1\n---", [4, 8])
      const root = handMadeRoot(source, {
        frontmatter,
        tokens: [
          ["Punctuator", "---"],
          ["RawText", "a: 1"],
          ["Punctuator", { text: "---", from: 4 }],
          ["RawText", "error"],
        ],
      })
      return { ...root, frontmatter: { ...frontmatter, ...fields } }
    }

    it("passes the frontmatter of a text", () => {
      expect(checkTree(source, withFrontmatter({}))).toEqual([])
    })

    it("fails a range that does not start or end with ---, and a value outside it", () => {
      const start: TreeRange = [1, 12]
      expect(
        says(
          checkTree(
            source,
            withFrontmatter({ range: start, loc: locationOf(source, start) }),
          ),
          "Frontmatter at 1-12: does not start with ---",
        ),
      ).toBe(true)
      const end: TreeRange = [0, 11]
      expect(
        says(
          checkTree(
            source,
            withFrontmatter({ range: end, loc: locationOf(source, end) }),
          ),
          "Frontmatter at 0-11: does not end with ---",
        ),
      ).toBe(true)
      expect(
        says(
          checkTree(source, withFrontmatter({ valueRange: [4, 20] })),
          "Frontmatter at 0-12: its value lies outside it",
        ),
      ).toBe(true)
    })

    it("fails a comment or a directive in the frontmatter", () => {
      // The body of the frontmatter looks like a comment line or a directive:
      // it is neither, and a comment or a directive of the tree there comes
      // before the end of the frontmatter.
      const asComment = "---\n%% c\n---\nerror"
      const commentRoot = handMadeRoot(asComment, {
        frontmatter: frontmatterOf(asComment, "---\n%% c\n---", [4, 8]),
        tokens: [
          ["Punctuator", "---"],
          ["RawText", "%% c"],
          ["Punctuator", { text: "---", from: 4 }],
          ["RawText", "error"],
        ],
        comments: [commentOf(asComment, "%%", "%% c")],
      })
      expect(
        says(
          checkTree(asComment, commentRoot),
          "Comment at 4-8: comes before the end of the frontmatter",
        ),
      ).toBe(true)
      const asDirective = "---\n%%{init: {}}%%\n---\nerror"
      const directiveRoot = handMadeRoot(asDirective, {
        frontmatter: frontmatterOf(
          asDirective,
          "---\n%%{init: {}}%%\n---",
          [4, 18],
        ),
        tokens: [
          ["Punctuator", "---"],
          ["RawText", "%%{init: {}}%%"],
          ["Punctuator", { text: "---", from: 4 }],
          ["RawText", "error"],
        ],
        directives: [directiveOf(asDirective, "%%{init: {}}%%")],
      })
      expect(
        says(
          checkTree(asDirective, directiveRoot),
          "Directive at 4-18: comes before the end of the frontmatter",
        ),
      ).toBe(true)
    })

    it("has no token for a body that is whitespace, and a token of the body without the whitespace around it", () => {
      const blank = "---\n \n---\nerror"
      const blankFrontmatter = frontmatterOf(blank, "---\n \n---", [4, 5])
      const reason =
        "are not the opening delimiter, the body, and the closing delimiter"

      /** The tree of `blank` whose tokens in the frontmatter are the delimiters and `body`. */
      function blankTokens(
        body: readonly (readonly [string, Piece | string])[],
      ): CheckedRoot {
        return handMadeRoot(blank, {
          frontmatter: blankFrontmatter,
          tokens: [
            ["Punctuator", "---"],
            ...body,
            ["Punctuator", { text: "---", from: 4 }],
            ["RawText", "error"],
          ],
        })
      }

      expect(checkTree(blank, blankTokens([]))).toEqual([])
      expect(
        says(
          checkTree(blank, blankTokens([["RawText", { text: " ", from: 4 }]])),
          `the tokens in the range of the frontmatter: ${reason}`,
        ),
      ).toBe(true)
      const padded = "---\n a \n---\nerror"
      const paddedFrontmatter = frontmatterOf(padded, "---\n a \n---", [4, 7])

      /** The tree of `padded` whose body token is `body`. */
      function paddedTokens(body: Piece): CheckedRoot {
        return handMadeRoot(padded, {
          frontmatter: paddedFrontmatter,
          tokens: [
            ["Punctuator", "---"],
            ["RawText", body],
            ["Punctuator", { text: "---", from: 4 }],
            ["RawText", "error"],
          ],
        })
      }

      expect(checkTree(padded, paddedTokens({ text: "a" }))).toEqual([])
      expect(
        says(
          checkTree(padded, paddedTokens({ text: " a ", from: 3 })),
          `the tokens in the range of the frontmatter: ${reason}`,
        ),
      ).toBe(true)
    })
  })
})
