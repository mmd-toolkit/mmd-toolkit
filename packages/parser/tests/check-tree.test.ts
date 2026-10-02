import { describe, expect, it } from "vitest"
import type {
  ClassStatement,
  Comment,
  Directive,
  ErrorDiagram,
  FlowchartDiagram,
  FlowchartStatement,
  FlowchartVertexStatement,
  Frontmatter,
  Range,
  Root,
  Token,
  SequenceStatement,
} from "../src/index.ts"
import { parse } from "../src/index.ts"
import { LineIndex } from "../src/positions.ts"
import { checkInvariants, checkTree } from "./helpers/check-tree.ts"

// The check itself: it must pass the trees of ast.md and fail every tree
// that breaks one of the conditions of ast.md, Invariants.

/**
 * Frontmatter, whitespace of every kind, a directive, the tokens `error`,
 * `%%`, and `x;`, and a comment line.
 */
const text =
  "---\na: 1\n---\n\uFEFF %%{init: {}}%% error\u00A0%% x;\n%% c\r\n\u2028\t"

/** The body of `root`, which is that of the `error` pseudo-diagram. */
function errorDiagramOf(root: Root): ErrorDiagram {
  if (root.body.type !== "ErrorDiagram") throw new Error("unexpected tree")
  return root.body
}

/** The tree of `text`, as `parse()` returns it. */
function validRoot(): Root {
  return parse(text)
}

/** `token` moved by `by` characters, with its `loc` on the same line. */
function shifted(token: Token, by: number): Token {
  return {
    ...token,
    range: [token.range[0] + by, token.range[1] + by],
    loc: {
      start: { ...token.loc.start, column: token.loc.start.column + by },
      end: { ...token.loc.end, column: token.loc.end.column + by },
    },
  }
}

/** The parts of the valid tree, by name. */
function partsOf(root: Root): {
  frontmatter: Frontmatter
  directive: Directive
  frontmatterTokens: Token[]
  directiveToken: Token
  error: Token
  percent: Token
  last: Token
  comment: Comment
} {
  const [directive] = root.directives
  const [opening, body, closing, directiveToken, error, percent, last] =
    root.tokens
  const [comment] = root.comments
  if (root.frontmatter === null) throw new Error("unexpected tree")
  return {
    frontmatter: root.frontmatter,
    directive,
    frontmatterTokens: [opening, body, closing],
    directiveToken,
    error,
    percent,
    last,
    comment,
  }
}

/**
 * The tokens of the valid tree `root` with `diagramTokens` in place of the
 * tokens of its diagram, after the tokens of the frontmatter and the
 * `Directive` token.
 */
function withDiagramTokens(root: Root, ...diagramTokens: Token[]): Root {
  const { frontmatterTokens, directiveToken } = partsOf(root)
  return {
    ...root,
    tokens: [...frontmatterTokens, directiveToken, ...diagramTokens],
  }
}

/** The range of the first `piece` in `source`. */
function rangeOf(source: string, piece: string): [number, number] {
  const start = source.indexOf(piece)
  if (start === -1) throw new Error(`no ${JSON.stringify(piece)} in the text`)
  return [start, start + piece.length]
}

/**
 * A tree of the `error` pseudo-diagram over `source` made by hand, for trees
 * that `parse()` cannot give yet: its tokens, comments, and closed
 * directives are given as the source texts they cover.
 */
function handMadeRoot(
  source: string,
  pieces: {
    readonly tokens: readonly string[]
    readonly comments: readonly string[]
    readonly directives: readonly string[]
  },
): Root {
  const lines = new LineIndex(source)
  const tokens = pieces.tokens.map((piece): Token => {
    const range = rangeOf(source, piece)
    return { type: "RawText", value: piece, range, loc: lines.location(range) }
  })
  const comments = pieces.comments.map((piece): Comment => {
    const range = rangeOf(source, piece)
    return {
      type: "Comment",
      value: piece.slice(2),
      range,
      loc: lines.location(range),
    }
  })
  const directives = pieces.directives.map((piece): Directive => {
    const range = rangeOf(source, piece)
    const value = piece.slice(3, -3)
    return {
      type: "Directive",
      name: value.split(":")[0],
      value,
      closed: true,
      range,
      loc: lines.location(range),
    }
  })
  const bodyRange: Range = [
    tokens[0].range[0],
    tokens[tokens.length - 1].range[1],
  ]
  const rootRange: Range = [0, source.length]
  return {
    type: "Root",
    diagramType: "error",
    body: {
      type: "ErrorDiagram",
      range: bodyRange,
      loc: lines.location(bodyRange),
    },
    frontmatter: null,
    comments,
    directives,
    tokens,
    range: rootRange,
    loc: lines.location(rootRange),
  }
}

describe("checkTree", () => {
  it("passes a tree whose lists leave only whitespace and line terminators outside", () => {
    const root = validRoot()
    expect(root.tokens.map((token) => [token.type, token.value])).toEqual([
      ["Punctuator", "---"],
      ["RawText", "a: 1"],
      ["Punctuator", "---"],
      ["Directive", "%%{init: {}}%%"],
      ["RawText", "error"],
      ["RawText", "%%"],
      ["RawText", "x;"],
    ])
    expect(root.directives.map((directive) => directive.value)).toEqual([
      "init: {}",
    ])
    expect(root.comments.map((comment) => comment.value)).toEqual([" c"])
    expect(root.frontmatter?.value).toBe("a: 1")
    checkTree(text, root)
  })

  it("fails when a token is missing", () => {
    const root = validRoot()
    const { error, last } = partsOf(root)
    // Without the `%%` token, its characters are in no list.
    const broken = withDiagramTokens(root, error, last)
    expect(() => checkTree(text, broken)).toThrow("is not whitespace")
  })

  it("fails when a comment, or the token of a directive or of the frontmatter, is missing", () => {
    const root = validRoot()
    const { frontmatterTokens, directiveToken, error, percent, last } =
      partsOf(root)
    expect(() => checkTree(text, { ...root, comments: [] })).toThrow(
      "is not whitespace",
    )
    expect(() =>
      checkTree(text, {
        ...root,
        tokens: [...frontmatterTokens, error, percent, last],
      }),
    ).toThrow("is not whitespace")
    expect(() =>
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
    ).toThrow("is not whitespace")
  })

  it("fails when a Directive token has no directive", () => {
    const root = validRoot()
    expect(() => checkTree(text, { ...root, directives: [] })).toThrow(
      "the Directive tokens are those of the directives outside all other tokens and all comments",
    )
  })

  it("fails when the frontmatter is not divided into its delimiters and its body", () => {
    const root = validRoot()
    const { frontmatter, frontmatterTokens } = partsOf(root)
    const [opening, , closing] = frontmatterTokens
    const whole: Token = {
      ...opening,
      value: text.slice(...frontmatter.range),
      range: frontmatter.range,
      loc: frontmatter.loc,
    }
    expect(() =>
      checkTree(text, { ...root, tokens: [whole, ...root.tokens.slice(3)] }),
    ).toThrow("the tokens in the range of the frontmatter")
    const bodyAsPunctuator: Token = {
      ...frontmatterTokens[1],
      type: "Punctuator",
    }
    expect(() =>
      checkTree(text, {
        ...root,
        tokens: [opening, bodyAsPunctuator, closing, ...root.tokens.slice(3)],
      }),
    ).toThrow("the tokens in the range of the frontmatter")
  })

  it("fails when tokens overlap or are out of order", () => {
    const root = validRoot()
    const { error, percent, last } = partsOf(root)
    // The same token twice: the second one starts before the first one ends.
    const twice = withDiagramTokens(root, error, error, percent, last)
    expect(() => checkTree(text, twice)).toThrow(
      "overlaps the RawText before it",
    )
    const swapped = withDiagramTokens(root, error, last, percent)
    expect(() => checkTree(text, swapped)).toThrow("comes before it")
  })

  it("fails when a token's range is shifted, or its value is not the text of its range", () => {
    const root = validRoot()
    const { error, percent, last } = partsOf(root)
    // `error` moved one character to the left: its last character is in no
    // list.
    const moved = withDiagramTokens(root, shifted(error, -1), percent, last)
    expect(() => checkTree(text, moved)).toThrow("is not whitespace")
    // `error` with the space before it: every character is covered, but the
    // value is no longer the text of the range.
    const widened: Token = {
      ...error,
      range: [error.range[0] - 1, error.range[1]],
      loc: { start: shifted(error, -1).loc.start, end: error.loc.end },
    }
    const wide = withDiagramTokens(root, widened, percent, last)
    expect(() => checkTree(text, wide)).toThrow("value of RawText")
    const wrongValue: Token = { ...error, value: "ERROR" }
    const broken = withDiagramTokens(root, wrongValue, percent, last)
    expect(() => checkTree(text, broken)).toThrow("value of RawText")
    const wrongLoc: Token = {
      ...error,
      loc: { start: error.loc.start, end: error.loc.start },
    }
    const brokenLoc = withDiagramTokens(root, wrongLoc, percent, last)
    expect(() => checkTree(text, brokenLoc)).toThrow("loc of RawText")
  })

  it("fails when a token starts or ends with whitespace or a line terminator", () => {
    // `error` with the space before it, and with the space after it. The
    // values are the text of the ranges, so only this condition fails.
    for (const piece of [" error", "error "]) {
      const source = "x error y"
      const root = handMadeRoot(source, {
        tokens: ["x", piece, "y"],
        comments: [],
        directives: [],
      })
      expect(() => checkInvariants(source, root)).toThrow(
        "starts or ends with whitespace or a line terminator",
      )
    }
    const source = "error\nx"
    const root = handMadeRoot(source, {
      tokens: ["error\n", "x"],
      comments: [],
      directives: [],
    })
    expect(() => checkInvariants(source, root)).toThrow(
      "RawText at 0-6 starts or ends with whitespace or a line terminator",
    )
  })

  it("fails when a directive lies inside a token", () => {
    const root = validRoot()
    const { directive, frontmatterTokens, error, percent, last } = partsOf(root)
    // One token from the start of the directive to the end of `error`, in
    // place of the `Directive` token and `error`.
    const range: Range = [directive.range[0], error.range[1]]
    const wide: Token = {
      type: "RawText",
      value: text.slice(...range),
      range,
      loc: { start: directive.loc.start, end: error.loc.end },
    }
    const body: ErrorDiagram = {
      ...errorDiagramOf(root),
      range: [range[0], root.body.range[1]],
      loc: { start: directive.loc.start, end: root.body.loc.end },
    }
    const broken: Root = {
      ...root,
      body,
      tokens: [...frontmatterTokens, wide, percent, last],
    }
    expect(() => checkTree(text, broken)).toThrow(
      "Directive at 15-29 lies inside RawText at 15-35",
    )
  })

  it("passes a directive inside a token when it is part of a comment region that lies inside the token", () => {
    // A token that continues across a comment line, as a multi-line quoted
    // label does: the lexer reads through the whole comment region, with
    // the directive before the comment's `%%` and the one inside the
    // comment. No diagram that the parser supports has such a token yet, so
    // the tree is made by hand and only the conditions of every tree apply.
    const source = 'error "a\n%%{init: {}}%% %% c %%{wrap}%%\nb"'
    const root = handMadeRoot(source, {
      tokens: ["error", '"a\n%%{init: {}}%% %% c %%{wrap}%%\nb"'],
      comments: ["%% c %%{wrap}%%"],
      directives: ["%%{init: {}}%%", "%%{wrap}%%"],
    })
    checkInvariants(source, root)
  })

  it("fails when a directive inside a token is not part of a comment region", () => {
    // The directive stands on the line before the comment line, after other
    // characters of the token: the comment region starts after the line
    // terminator and does not hold it.
    const source = 'error "a %%{x}%%\n%% c\nb"'
    const root = handMadeRoot(source, {
      tokens: ["error", '"a %%{x}%%\n%% c\nb"'],
      comments: ["%% c"],
      directives: ["%%{x}%%"],
    })
    expect(() => checkInvariants(source, root)).toThrow(
      "Directive at 9-16 lies inside RawText at 6-24, and not in a comment region inside that token",
    )
  })

  it("fails when the comment region of a directive inside a token does not lie inside the token", () => {
    // The comment region starts at the space after the line terminator; the
    // token starts at the directive, one character later.
    const source = "error\n %%{x}%% %% c\nb"
    const root = handMadeRoot(source, {
      tokens: ["error", "%%{x}%% %% c\nb"],
      comments: ["%% c"],
      directives: ["%%{x}%%"],
    })
    expect(() => checkInvariants(source, root)).toThrow(
      "Directive at 7-14 lies inside RawText at 7-21, and not in a comment region inside that token",
    )
  })

  it("fails when a comment lies partly inside a token", () => {
    const root = validRoot()
    const { error, percent, last, comment } = partsOf(root)
    // The last token grows over the line terminator and the comment's `%%`.
    const range: Range = [last.range[0], comment.range[0] + 2]
    const wide: Token = {
      type: "RawText",
      value: text.slice(...range),
      range,
      loc: {
        start: last.loc.start,
        end: { line: comment.loc.start.line, column: 2 },
      },
    }
    const body: ErrorDiagram = {
      ...errorDiagramOf(root),
      range: [root.body.range[0], range[1]],
      loc: { start: root.body.loc.start, end: wide.loc.end },
    }
    const broken: Root = {
      ...withDiagramTokens(root, error, percent, wide),
      body,
    }
    expect(() => checkTree(text, broken)).toThrow("lies partly inside RawText")
  })

  it("fails when comments or directives overlap", () => {
    const root = validRoot()
    const { comment } = partsOf(root)
    expect(() =>
      checkTree(text, { ...root, comments: [comment, comment] }),
    ).toThrow("overlaps the Comment before it")
    // A directive listed twice, inside a comment region inside a token, so
    // that it has no `Directive` token.
    const source = 'error "a\n%%{init: {}}%% %% c\nb"'
    const twice = handMadeRoot(source, {
      tokens: ["error", '"a\n%%{init: {}}%% %% c\nb"'],
      comments: ["%% c"],
      directives: ["%%{init: {}}%%", "%%{init: {}}%%"],
    })
    expect(() => checkInvariants(source, twice)).toThrow(
      "overlaps the Directive before it",
    )
  })

  it("fails when the content fields of a comment, a directive, or the frontmatter are not the text of their ranges", () => {
    const root = validRoot()
    const { comment, directive, frontmatter } = partsOf(root)
    expect(() =>
      checkTree(text, { ...root, comments: [{ ...comment, value: "c" }] }),
    ).toThrow("value of Comment")
    expect(() =>
      checkTree(text, {
        ...root,
        directives: [{ ...directive, closed: false }],
      }),
    ).toThrow("value of Directive")
    expect(() =>
      checkTree(text, {
        ...root,
        frontmatter: { ...frontmatter, valueRange: [4, 7] },
      }),
    ).toThrow("value of the frontmatter")
  })

  it("fails when the frontmatter does not come before every comment and directive", () => {
    // The body of the frontmatter looks like a comment line. A comment made
    // of it lies inside the body's token, which every other condition
    // allows.
    const source = "---\n%% c\n---\nerror"
    const root = parse(source)
    checkTree(source, root)
    const range: Range = [4, 8]
    const comment: Comment = {
      type: "Comment",
      value: " c",
      range,
      loc: new LineIndex(source).location(range),
    }
    expect(() => checkTree(source, { ...root, comments: [comment] })).toThrow(
      "Comment at 4-8 comes before the end of the frontmatter",
    )
  })

  it("fails when the body does not run from its first token to its last", () => {
    const root = validRoot()
    const { error } = partsOf(root)
    // The body ends with its first token, although two more follow.
    const short: ErrorDiagram = {
      ...errorDiagramOf(root),
      range: error.range,
      loc: error.loc,
    }
    expect(() => checkTree(text, { ...root, body: short })).toThrow(
      "the body runs from its first token to its last",
    )
  })

  it("fails when a token of an ErrorDiagram is not a RawText token", () => {
    // No other token kind exists yet, so the kind is made up.
    const source = "error"
    const root = parse(source)
    const [error] = root.tokens
    const otherKind = { ...error, type: "Keyword" } as unknown as Token
    const broken: Root = { ...root, tokens: [otherKind] }
    checkInvariants(source, broken)
    expect(() => checkTree(source, broken)).toThrow("kind of Keyword at 0-5")
  })

  it("fails when a token of an ErrorDiagram holds whitespace", () => {
    // `error x` as one token: every condition of every tree holds, but the
    // token is not a run of characters that are not whitespace.
    const source = "error x"
    const root = handMadeRoot(source, {
      tokens: ["error x"],
      comments: [],
      directives: [],
    })
    checkInvariants(source, root)
    expect(() => checkTree(source, root)).toThrow(
      "RawText at 0-7 holds whitespace or a line terminator",
    )
  })

  it("fails when two tokens of an ErrorDiagram touch", () => {
    // `error` as `err` and `or`: neither is a maximal run.
    const source = "error"
    const root = handMadeRoot(source, {
      tokens: ["err", "or"],
      comments: [],
      directives: [],
    })
    checkInvariants(source, root)
    expect(() => checkTree(source, root)).toThrow(
      "RawText at 3-5 touches the token before it, and neither is a `;`",
    )
  })

  it("passes tokens of an ErrorDiagram that touch when one of them is a `;`", () => {
    // `style:#f;` as the parser splits it when the line rule ignores the `;`.
    const source = "error %% style:#f;\n"
    checkTree(source, parse(source))
    const root = handMadeRoot(source, {
      tokens: ["error", "%%", "style:#f", ";"],
      comments: [],
      directives: [],
    })
    checkTree(source, root)
  })

  it("fails when a comment lies inside a token of an ErrorDiagram", () => {
    // The comment line `%%c` is also listed as a token.
    const source = "error\n%%c"
    const root = handMadeRoot(source, {
      tokens: ["error", "%%c"],
      comments: ["%%c"],
      directives: [],
    })
    checkInvariants(source, root)
    expect(() => checkTree(source, root)).toThrow(
      "Comment at 6-9 lies inside RawText at 6-9 of an ErrorDiagram",
    )
  })

  it("fails when the root does not cover the whole input", () => {
    const root = validRoot()
    const shortRoot: Root = { ...root, range: [0, text.length - 1] }
    expect(() => checkTree(text, shortRoot)).toThrow()
  })
})

describe("checkTree on a flowchart", () => {
  // ast/flowchart.md: what the document of the diagram states about its
  // tree, beyond the invariants of ast.md.

  /** The tree of the flowchart `source`, checked to pass first. */
  function flowchartOf(source: string): {
    root: Root
    diagram: FlowchartDiagram
  } {
    const root = parse(source)
    checkTree(source, root)
    if (root.body.type !== "FlowchartDiagram") {
      throw new Error("unexpected tree")
    }
    return { root, diagram: root.body }
  }

  /** `root` with the token at `index` of the kind `kind`. */
  function withTokenKind(root: Root, index: number, kind: Token["type"]): Root {
    return {
      ...root,
      tokens: root.tokens.map((token, at) =>
        at === index ? { ...token, type: kind } : token,
      ),
    }
  }

  /** `root` with its first statement replaced by `statement`. */
  function withFirstStatement(
    root: Root,
    diagram: FlowchartDiagram,
    statement: FlowchartStatement,
  ): Root {
    return {
      ...root,
      body: { ...diagram, body: [statement, ...diagram.body.slice(1)] },
    }
  }

  /** The first statement of `diagram`, which must be a vertex statement. */
  function vertexStatementOf(
    diagram: FlowchartDiagram,
  ): FlowchartVertexStatement {
    const [statement] = diagram.body
    if (statement.type !== "FlowchartVertexStatement") {
      throw new Error("unexpected tree")
    }
    return statement
  }

  /** `root` with the label of the first vertex of `diagram` holding `value`. */
  function withFirstLabelValue(
    root: Root,
    diagram: FlowchartDiagram,
    value: string,
  ): Root {
    const statement = vertexStatementOf(diagram)
    const [vertex] = statement.first.vertices
    if (vertex.shape?.label == null) throw new Error("unexpected tree")
    const label = { ...vertex.shape.label, value }
    return withFirstStatement(root, diagram, {
      ...statement,
      first: {
        ...statement.first,
        vertices: [{ ...vertex, shape: { ...vertex.shape, label } }],
      },
    })
  }

  it("fails when the value of a leaf node is not the text of its range", () => {
    // Whitespace outside the range of the label.
    const spaced = "flowchart LR\nA[ hello  ]"
    const spacedTree = flowchartOf(spaced)
    expect(() =>
      checkTree(
        spaced,
        withFirstLabelValue(spacedTree.root, spacedTree.diagram, " hello  "),
      ),
    ).toThrow("is not the text of its range")
    // Only the outer delimiters of nested string contexts left out.
    const nested = 'flowchart LR\nA[""`x`""]'
    const nestedTree = flowchartOf(nested)
    expect(() =>
      checkTree(
        nested,
        withFirstLabelValue(nestedTree.root, nestedTree.diagram, "`x`"),
      ),
    ).toThrow("is not the text of its range")
    const click = 'flowchart LR\nA\nclick A href "u"``""'
    const clickTree = flowchartOf(click)
    const [, statement] = clickTree.diagram.body
    if (statement.type !== "FlowchartClickUrlStatement") {
      throw new Error("unexpected tree")
    }
    const outerOnly: Root = {
      ...clickTree.root,
      body: {
        ...clickTree.diagram,
        body: [
          clickTree.diagram.body[0],
          { ...statement, url: { ...statement.url, value: 'u"``"' } },
        ],
      },
    }
    expect(() => checkTree(click, outerOnly)).toThrow(
      "is not the text of its range",
    )
  })

  it("fails when the raw of a StringLiteral or a NumericLiteral is not the source text of its range", () => {
    const source =
      'flowchart LR\nA-->B\nclick A href "u"\nlinkStyle 0 stroke:red'
    const { root, diagram } = flowchartOf(source)
    const [, click, linkStyle] = diagram.body
    if (
      click.type !== "FlowchartClickUrlStatement" ||
      linkStyle.type !== "FlowchartLinkStyleStatement"
    ) {
      throw new Error("unexpected tree")
    }

    /** The tree with `body` as the statements of the diagram. */
    function withBody(body: FlowchartStatement[]): Root {
      return { ...root, body: { ...diagram, body } }
    }

    // The value of the string in place of its source text.
    const unquoted: FlowchartStatement = {
      ...click,
      url: { ...click.url, raw: "u" },
    }
    expect(() =>
      checkTree(source, withBody([diagram.body[0], unquoted, linkStyle])),
    ).toThrow("raw of StringLiteral")
    const [index] = linkStyle.indices
    const rewritten: FlowchartStatement = {
      ...linkStyle,
      indices: [{ ...index, raw: "00" }],
    }
    expect(() =>
      checkTree(source, withBody([diagram.body[0], click, rewritten])),
    ).toThrow("raw of NumericLiteral")
  })

  it("fails when a token of a value lies in no value node", () => {
    const source = "flowchart LR\nA-->B"
    const { root } = flowchartOf(source)
    // The arrow `-->` as if it were raw text.
    expect(() => checkTree(source, withTokenKind(root, 3, "RawText"))).toThrow(
      "lies in no value node",
    )
  })

  it("fails when a keyword or a punctuator lies in a value node", () => {
    const source = "flowchart LR\nA-->B"
    const { root } = flowchartOf(source)
    // The id `A` as if it were a keyword.
    expect(() => checkTree(source, withTokenKind(root, 2, "Keyword"))).toThrow(
      "lies in the value node",
    )
  })

  it("passes the delimiters of a data block, which lie in the block", () => {
    flowchartOf("flowchart LR\nA@{ shape: rect }")
  })

  it("fails when child nodes are out of source order", () => {
    const source = "flowchart LR\nA-->B-->C"
    const { root, diagram } = flowchartOf(source)
    const statement = vertexStatementOf(diagram)
    const reversed: FlowchartVertexStatement = {
      ...statement,
      links: [...statement.links].reverse(),
    }
    expect(() =>
      checkTree(source, withFirstStatement(root, diagram, reversed)),
    ).toThrow("overlaps the child node")
  })

  it("fails when the direction of the header is not the first token after the header keyword", () => {
    const source = "flowchart LR\nA"
    const { root, diagram } = flowchartOf(source)
    const wrong: Root = { ...root, body: { ...diagram, direction: "RL" } }
    expect(() => checkTree(source, wrong)).toThrow(
      "the direction of the header is the first token of the diagram after the header keyword",
    )
  })

  it("fails when the name of a shape does not agree with its delimiters", () => {
    const source = "flowchart LR\nA[x]"
    const { root, diagram } = flowchartOf(source)
    const statement = vertexStatementOf(diagram)
    const [vertex] = statement.first.vertices
    if (vertex.shape === null) throw new Error("unexpected tree")
    const round: FlowchartVertexStatement = {
      ...statement,
      first: {
        ...statement.first,
        vertices: [{ ...vertex, shape: { ...vertex.shape, name: "rounded" } }],
      },
    }
    expect(() =>
      checkTree(source, withFirstStatement(root, diagram, round)),
    ).toThrow("the name of FlowchartShape")
  })

  it("passes a link whose label is written between its arrows, and fails one whose child nodes overlap", () => {
    // ast/flowchart.md, FlowchartLink: with text between two arrows, the
    // child fields visit `arrow` before `label`, which comes first in the
    // source; every other node has its child fields in source order.
    const between = "flowchart LR\nA-- t -->B"
    checkTree(between, parse(between))
    const source = "flowchart LR\nA-->|t|B"
    const { root, diagram } = flowchartOf(source)
    const statement = vertexStatementOf(diagram)
    const [link] = statement.links
    if (link.label === null) throw new Error("unexpected tree")
    const overlapping: FlowchartVertexStatement = {
      ...statement,
      links: [
        {
          ...link,
          label: {
            ...link.label,
            range: link.arrow.range,
            loc: link.arrow.loc,
          },
        },
      ],
    }
    expect(() =>
      checkTree(source, withFirstStatement(root, diagram, overlapping)),
    ).toThrow("overlaps the child node of FlowchartLink")
  })

  it("fails when the fields of an arrow are not what it writes, or the two arrows of a link have different lines", () => {
    const source = "flowchart LR\nA-- t -->B"
    const { root, diagram } = flowchartOf(source)
    const statement = vertexStatementOf(diagram)
    const [link] = statement.links
    if (link.opening === null) throw new Error("unexpected tree")
    const wrongArrow: FlowchartVertexStatement = {
      ...statement,
      links: [{ ...link, arrow: { ...link.arrow, endMarker: "cross" } }],
    }
    expect(() =>
      checkTree(source, withFirstStatement(root, diagram, wrongArrow)),
    ).toThrow("the fields of FlowchartArrow")
    const wrongOpening: FlowchartVertexStatement = {
      ...statement,
      links: [{ ...link, opening: { ...link.opening, startMarker: "arrow" } }],
    }
    expect(() =>
      checkTree(source, withFirstStatement(root, diagram, wrongOpening)),
    ).toThrow("the fields of FlowchartOpeningArrow")
    const otherLine: FlowchartVertexStatement = {
      ...statement,
      links: [{ ...link, opening: { ...link.opening, line: "thick" } }],
    }
    expect(() =>
      checkTree(source, withFirstStatement(root, diagram, otherLine)),
    ).toThrow("is that of the closing arrow")
  })

  it("fails when a description block is closed but its last token is not `}`, or the reverse", () => {
    for (const source of [
      "flowchart LR\naccDescr { x }",
      "flowchart LR\naccDescr { x",
    ]) {
      const { root, diagram } = flowchartOf(source)
      const [statement] = diagram.body
      if (statement.type !== "FlowchartAccDescrBlockStatement") {
        throw new Error("unexpected tree")
      }
      const toggled: FlowchartStatement = {
        ...statement,
        closed: !statement.closed,
      }
      expect(() =>
        checkTree(source, withFirstStatement(root, diagram, toggled)),
      ).toThrow("is closed exactly when its last token is `}`")
    }
  })
})

describe("checkTree on a sequence diagram", () => {
  // ast/sequence.md: what the document of the diagram states about its
  // tree, beyond the invariants of ast.md.

  /** The tree of the sequence diagram `source`, checked to pass first, with the first statement replaced by what `change` makes of it. */
  function withFirstStatementChanged(
    source: string,
    change: (statement: SequenceStatement) => SequenceStatement,
  ): Root {
    const root = parse(source)
    checkTree(source, root)
    if (root.body.type !== "SequenceDiagram") throw new Error("unexpected tree")
    const [first, ...rest] = root.body.body
    return { ...root, body: { ...root.body, body: [change(first), ...rest] } }
  }

  it("fails when the fields of the arrow of a message are not what it writes", () => {
    const source = "sequenceDiagram\nA->>B: x"
    const broken = withFirstStatementChanged(source, (statement) => {
      if (statement.type !== "SequenceMessageStatement") {
        throw new Error("unexpected tree")
      }
      return { ...statement, arrow: { ...statement.arrow, line: "dotted" } }
    })
    expect(() => checkTree(source, broken)).toThrow(
      "the fields of SequenceArrow",
    )
  })

  it("fails when the wrap of a text does not agree with its first token", () => {
    const source = "sequenceDiagram\nA->>B: wrap:x"
    const broken = withFirstStatementChanged(source, (statement) => {
      if (statement.type !== "SequenceMessageStatement" || !statement.text) {
        throw new Error("unexpected tree")
      }
      return { ...statement, text: { ...statement.text, wrap: "nowrap" } }
    })
    expect(() => checkTree(source, broken)).toThrow(
      "the wrap prefix of SequenceText",
    )
  })

  it("fails when the parts of a box text are not its tokens", () => {
    const source = "sequenceDiagram\nbox red-team\nparticipant A\nend"
    const broken = withFirstStatementChanged(source, (statement) => {
      if (statement.type !== "SequenceBoxStatement" || !statement.text) {
        throw new Error("unexpected tree")
      }
      return { ...statement, text: { ...statement.text, colorCandidate: null } }
    })
    expect(() => checkTree(source, broken)).toThrow("are its parts")
  })

  it("fails when the value of a literal is not the text of its range", () => {
    const source = "sequenceDiagram\nA->>B: x"
    const broken = withFirstStatementChanged(source, (statement) => {
      if (
        statement.type !== "SequenceMessageStatement" ||
        !statement.text?.value
      ) {
        throw new Error("unexpected tree")
      }
      return {
        ...statement,
        text: {
          ...statement.text,
          value: { ...statement.text.value, value: "y" },
        },
      }
    })
    expect(() => checkTree(source, broken)).toThrow(
      "is not the text of its range",
    )
  })
})

describe("checkTree on a class diagram", () => {
  // ast/class.md: what the document of the diagram states about its tree,
  // beyond the invariants of ast.md.

  /** The tree of the class diagram `source`, checked to pass first, with the first statement replaced by what `change` makes of it. */
  function withFirstStatementChanged(
    source: string,
    change: (statement: ClassStatement) => ClassStatement,
  ): Root {
    const root = parse(source)
    checkTree(source, root)
    if (root.body.type !== "ClassDiagram") throw new Error("unexpected tree")
    const [first, ...rest] = root.body.body
    return { ...root, body: { ...root.body, body: [change(first), ...rest] } }
  }

  it("fails when the fields of the arrow of a relation are not what its tokens write", () => {
    const source = "classDiagram\nA <|-- B"
    const broken = withFirstStatementChanged(source, (statement) => {
      if (statement.type !== "ClassRelationStatement") {
        throw new Error("unexpected tree")
      }
      return {
        ...statement,
        arrow: { ...statement.arrow, startMarker: "arrow" },
      }
    })
    expect(() => checkTree(source, broken)).toThrow("the fields of ClassArrow")
  })

  it("fails when the value of an arrow is not the texts of its tokens", () => {
    const source = "classDiagram\nA <|  -- B"
    const broken = withFirstStatementChanged(source, (statement) => {
      if (statement.type !== "ClassRelationStatement") {
        throw new Error("unexpected tree")
      }
      return { ...statement, arrow: { ...statement.arrow, value: "<|  --" } }
    })
    expect(() => checkTree(source, broken)).toThrow(
      "is not the text of its range",
    )
  })

  it("fails when the visibility or the classifier of a member is not its mark", () => {
    const source = "classDiagram\nA : +x$"
    for (const change of [
      { visibility: "private" },
      { classifier: "abstract" },
    ] as const) {
      const broken = withFirstStatementChanged(source, (statement) => {
        if (
          statement.type !== "ClassMemberStatement" ||
          statement.member?.type !== "ClassAttribute"
        ) {
          throw new Error("unexpected tree")
        }
        return { ...statement, member: { ...statement.member, ...change } }
      })
      expect(() => checkTree(source, broken)).toThrow("of ClassAttribute")
    }
  })

  it("fails when the direction of a direction statement is not its value token", () => {
    const source = "classDiagram\ndirection LR"
    const broken = withFirstStatementChanged(source, (statement) => {
      if (statement.type !== "ClassDirectionStatement") {
        throw new Error("unexpected tree")
      }
      return { ...statement, direction: "TB" }
    })
    expect(() => checkTree(source, broken)).toThrow(
      "the keywords of ClassDirectionStatement",
    )
  })

  it("fails when the target of a link is not its last token", () => {
    const source = 'classDiagram\nlink A "u" _self'
    const broken = withFirstStatementChanged(source, (statement) => {
      if (statement.type !== "ClassLinkStatement") {
        throw new Error("unexpected tree")
      }
      return { ...statement, target: null }
    })
    expect(() => checkTree(source, broken)).toThrow(
      "the target of ClassLinkStatement",
    )
  })

  it("fails when the closed of a StringLiteral does not agree with its text", () => {
    const source = "classDiagram\nclass `x"
    const broken = withFirstStatementChanged(source, (statement) => {
      if (
        statement.type !== "ClassDeclaration" ||
        statement.name.name.type !== "StringLiteral"
      ) {
        throw new Error("unexpected tree")
      }
      return {
        ...statement,
        name: {
          ...statement.name,
          name: { ...statement.name.name, closed: true },
        },
      }
    })
    expect(() => checkTree(source, broken)).toThrow("closed of StringLiteral")
  })

  it("fails when the value of a StringLiteral is not its text without its quotes", () => {
    const source = "classDiagram\nclass `a b`"
    const broken = withFirstStatementChanged(source, (statement) => {
      if (
        statement.type !== "ClassDeclaration" ||
        statement.name.name.type !== "StringLiteral"
      ) {
        throw new Error("unexpected tree")
      }
      return {
        ...statement,
        name: {
          ...statement.name,
          name: { ...statement.name.name, value: "`a b`" },
        },
      }
    })
    expect(() => checkTree(source, broken)).toThrow(
      "is not the text of its range",
    )
  })
})
