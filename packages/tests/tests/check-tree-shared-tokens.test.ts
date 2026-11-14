import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type {
  CheckedRoot,
  CheckedToken,
  Placed,
} from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import {
  copyOf,
  recordedTree,
  setField,
  firstNode,
  replaceToken,
} from "./check-tree-recorded.ts"
import {
  handMadeRoot,
  tokenOf,
  locationOf,
  commentOf,
  directiveOf,
  frontmatterOf,
} from "./check-tree-trees.ts"

// The shared token conditions in packages/parser/docs/tokens.md. A named
// recorded tree, or a tree made by hand, is valid before one condition is
// broken. Every test names its mutation explicitly.

/** The token of `root` with the given source text. */
function token(root: CheckedRoot, value: string): CheckedToken {
  const found = root.tokens.find((item) => item.value === value)
  if (found === undefined) throw new Error(`no token ${JSON.stringify(value)}`)
  return found
}

/** Moves a record's range and location to the same source span. */
function span(input: string, placed: Placed, start: number, end: number): void {
  setField(placed, "range", [start, end])
  setField(placed, "loc", locationOf(input, [start, end]))
}

/** Moves a token's span, keeping its source text and location consistent. */
function extendToken(
  input: string,
  item: CheckedToken,
  start: number,
  end: number,
): void {
  span(input, item, start, end)
  setField(item, "value", input.slice(start, end))
}

describe("checkTree: records (tokens.md)", () => {
  const input = "---\ntitle: x\n---\nerror a %%{init: {}}%% b\n%% c\n"
  const tree = handMadeRoot(input, {
    tokens: [
      ["Punctuator", "---"],
      ["RawText", "title: x"],
      ["Punctuator", { text: "---", from: 4 }],
      ["RawText", "error"],
      ["RawText", "a"],
      ["Directive", "%%{init: {}}%%"],
      ["RawText", "b"],
    ],
    frontmatter: frontmatterOf(input, "---\ntitle: x\n---", [4, 12]),
    directives: [directiveOf(input, "%%{init: {}}%%")],
    comments: [commentOf(input, "%%", "%% c")],
  })

  it("passes the valid tree of records", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a frontmatter field that holds text instead of its record", () => {
    const broken = copyOf(tree)
    setField(broken, "frontmatter", "title: x")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Root at 0-47",
      message: "the field frontmatter is string, not a node or null",
    })
  })

  it("fails Root.comments represented as one child record", () => {
    const broken = copyOf(tree)
    setField(broken, "comments", broken.comments[0])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Root at 0-47",
      message: "the field comments is object, not a list",
    })
  })

  it("fails a comment stored as a child of a diagram node", () => {
    const broken = copyOf(tree)
    setField(broken.body, "comment", broken.comments[0])
    expect(checkTree(input, broken)).toContainEqual({
      where: "ErrorDiagram at 17-41",
      message: "has the field comment, which its type does not have",
    })
  })

  it("fails a comment record without a range", () => {
    const broken = copyOf(tree)
    Reflect.deleteProperty(broken.comments[0], "range")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Root at 0-47.comments[0]",
      message: "is no node: it has no type and no range",
    })
  })

  it("fails a comment record without a loc", () => {
    const broken = copyOf(tree)
    Reflect.deleteProperty(broken.comments[0], "loc")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 42-46",
      message: "has a loc that is no location",
    })
  })

  it("fails a comment value that is not a string", () => {
    const broken = copyOf(tree)
    setField(broken.comments[0], "value", 42)
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 42-46",
      message: "the field value is number, not string",
    })
  })

  it("fails a frontmatter valueRange that is not an offset pair", () => {
    const broken = copyOf(tree)
    setField(broken.frontmatter!, "valueRange", [4])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Frontmatter at 0-16",
      message: "the field valueRange is a list, not range",
    })
  })

  it("fails a directive record without its name field", () => {
    const broken = copyOf(tree)
    Reflect.deleteProperty(broken.directives[0], "name")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Directive at 25-39",
      message: "lacks the field name",
    })
  })

  it("fails a diagram range including frontmatter tokens", () => {
    const broken = copyOf(tree)
    span(input, broken.body, 0, broken.body.range[1])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Root.body",
      message:
        "does not run from its first token to its last: [0,41], not [17,41]",
    })
  })

  it("fails a directive record without a range", () => {
    const broken = copyOf(tree)
    Reflect.deleteProperty(broken.directives[0], "range")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Root at 0-47.directives[0]",
      message: "is no node: it has no type and no range",
    })
  })

  it("fails a frontmatter record without a range", () => {
    const broken = copyOf(tree)
    Reflect.deleteProperty(broken.frontmatter!, "range")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Root at 0-47",
      message: "the field frontmatter is object, not a node or null",
    })
  })

  it("fails a directive record without a loc", () => {
    const broken = copyOf(tree)
    Reflect.deleteProperty(broken.directives[0], "loc")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Directive at 25-39",
      message: "has a loc that is no location",
    })
  })

  it("fails a frontmatter record without a loc", () => {
    const broken = copyOf(tree)
    Reflect.deleteProperty(broken.frontmatter!, "loc")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Frontmatter at 0-16",
      message: "has a loc that is no location",
    })
  })

  it("fails Root.tokens represented as one child record", () => {
    const broken = copyOf(tree)
    setField(broken, "tokens", broken.tokens[0])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Root at 0-47",
      message: "the field tokens is object, not a list",
    })
  })
})

describe("checkTree: error (tokens.md)", () => {
  const input = "error x y\n"
  const tree = handMadeRoot(input, {
    tokens: [
      ["RawText", "error"],
      ["RawText", "x"],
      ["RawText", "y"],
    ],
  })

  it("passes the valid tree of error", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a token used as the diagram node", () => {
    const broken = copyOf(tree)
    setField(broken, "body", broken.tokens[0])
    expect(checkTree(input, broken)).toContainEqual({
      where: "RawText at 0-5",
      message: "is of a type that the specification does not define",
    })
  })

  it("fails a token stored in an extra field of a node", () => {
    const broken = copyOf(tree)
    setField(broken.body, "token", broken.tokens[0])
    expect(checkTree(input, broken)).toContainEqual({
      where: "ErrorDiagram at 0-9",
      message: "has the field token, which its type does not have",
    })
  })

  it("fails a token type that is not a string", () => {
    const broken = copyOf(tree)
    setField(broken.tokens[0], "type", 42)
    expect(checkTree(input, broken)).toContainEqual({
      where: "Root at 0-10.tokens[0]",
      message: "is no node: it has no type and no range",
    })
  })

  it("fails an unlisted token kind in an error diagram", () => {
    const broken = copyOf(tree)
    setField(broken.tokens[0], "type", "UnknownToken")
    expect(checkTree(input, broken)).toContainEqual({
      where: "UnknownToken at 0-5",
      message: 'kind: "UnknownToken", not "RawText"',
    })
  })

  it("fails a token range that is not an offset pair", () => {
    const broken = copyOf(tree)
    setField(broken.tokens[0], "range", [0, 1, 5])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Root at 0-10.tokens[0]",
      message: "is no node: it has no type and no range",
    })
  })

  it("fails a token loc that has no end position", () => {
    const broken = copyOf(tree)
    setField(broken.tokens[0], "loc", { start: { line: 1, column: 0 } })
    expect(checkTree(input, broken)).toContainEqual({
      where: "RawText at 0-5",
      message: "has a loc that is no location",
    })
  })

  it("fails a whitespace-only token outside every value", () => {
    const broken = copyOf(tree)
    setField(broken, "tokens", [
      broken.tokens[0],
      tokenOf(input, "RawText", " "),
      ...broken.tokens.slice(1),
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "RawText at 5-6",
      message:
        "starts with whitespace or a line terminator where no value starts",
    })
  })

  it("fails a line terminator represented by an extra node field", () => {
    const broken = copyOf(tree)
    setField(broken.body, "separator", {
      type: "LineTerminator",
      range: [9, 10],
      loc: locationOf(input, [9, 10]),
    })
    expect(checkTree(input, broken)).toContainEqual({
      where: "ErrorDiagram at 0-9",
      message: "has the field separator, which its type does not have",
    })
  })

  it("fails an ErrorDiagram with no token", () => {
    const broken = copyOf(tree)
    setField(broken, "tokens", [])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Root.body",
      message: "has no token",
    })
  })
})

describe("checkTree: common/entity-css-in-string-label (tokens.md)", () => {
  const { input, tree } = recordedTree("common", "entity-css-in-string-label")

  it("passes the valid tree of common/entity-css-in-string-label", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a string fragment spanning its ignored semicolon", () => {
    const broken = copyOf(tree)
    extendToken(input, broken.tokens[4], 15, 57)
    expect(checkTree(input, broken)).toContainEqual({
      where: "IgnoredSemicolon at 56-57",
      message: "overlaps the IgnoredSemicolon before it, or comes before it",
    })
  })

  it("fails an ignored semicolon retyped as a grammar punctuator", () => {
    const broken = copyOf(tree)
    setField(token(broken, ";"), "type", "Punctuator")
    expect(checkTree(input, broken)).toContainEqual({
      where: 'Punctuator at 56-57 of ";"',
      message: "lies in the value node FlowchartLabel at 15-68",
    })
  })

  it("fails an ignored semicolon included in a label value", () => {
    const broken = copyOf(tree)
    setField(
      firstNode(broken, "FlowchartLabel"),
      "value",
      "<span style='color:#f00;font-weight:bold;'>x</span>",
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "FlowchartLabel at 15-68",
      message:
        "value is not its written text: \"<span style='color:#f00;font-weight:bold;'>x</span>\", not \"<span style='color:#f00;font-weight:bold'>x</span>\"",
    })
  })
})

describe("checkTree: class/tokens-string-crlf-in-note (tokens.md)", () => {
  const { input, tree } = recordedTree("class", "tokens-string-crlf-in-note")

  it("passes the valid tree of class/tokens-string-crlf-in-note", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a string value whose written CRLF is converted to LF", () => {
    const broken = copyOf(tree)
    setField(firstNode(broken, "StringLiteral"), "value", "a\nb")
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 34-40",
      message: 'value is not its written text: "a\\nb", not "a\\r\\nb"',
    })
  })
})

describe("checkTree: flowchart/tokens-string-literal-comment-line (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "flowchart",
    "tokens-string-literal-comment-line",
  )

  it("passes the valid tree of flowchart/tokens-string-literal-comment-line", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a whole quoted string presented as a fragment", () => {
    const broken = copyOf(tree)
    setField(token(broken, '"u"'), "type", "StringFragment")
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 23-26",
      message:
        "the tokens of the string are not one String token or StringFragment tokens: StringFragment",
    })
  })

  it("fails a string node ending before its final comment-cut fragment", () => {
    const broken = copyOf(tree)
    const node = nodesOf(broken).find(
      (candidate) =>
        candidate.type === "StringLiteral" &&
        candidate.raw === '"one\n%% c\ntwo"',
    )!
    span(input, node, 27, 32)
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 27-32",
      message: 'raw: "\\"one\\n%% c\\ntwo\\"", not "\\"one\\n"',
    })
  })

  it("fails an uncut string split into two String tokens", () => {
    const broken = copyOf(tree)
    replaceToken(broken, token(broken, '"u"'), [
      ["String", 0, 1],
      ["String", 1, 3],
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 23-26",
      message:
        "the tokens of the string are not one String token or StringFragment tokens: String, String",
    })
  })

  it("fails a String token missing its opening quote", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, '"u"'), 24, 26)
    expect(checkTree(input, broken)).toContainEqual({
      where: "String at 24-26",
      message: 'a String token does not start with a quote: "u\\""',
    })
  })

  it("fails an uncut StringLiteral range omitting its closing quote", () => {
    const broken = copyOf(tree)
    span(input, firstNode(broken, "StringLiteral"), 23, 25)
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 23-25",
      message: 'raw: "\\"u\\"", not "\\"u"',
    })
  })

  it("fails a string value retaining its comment region", () => {
    const broken = copyOf(tree)
    const node = nodesOf(broken).find(
      (candidate) =>
        candidate.type === "StringLiteral" && candidate.range[0] === 27,
    )!
    setField(node, "value", "one\n%% c\ntwo")
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 27-41",
      message:
        'value is not its written text: "one\\n%% c\\ntwo", not "one\\ntwo"',
    })
  })
})

describe("checkTree: class/db-generic-spaces (tokens.md)", () => {
  const { input, tree } = recordedTree("class", "db-generic-spaces")

  it("passes the valid tree of class/db-generic-spaces", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a value token missing its first read space", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, " T "), 22, 24)
    expect(checkTree(input, broken)).toContainEqual({
      where: "ClassLiteral at 21-24",
      message:
        'the texts of its tokens joined are not its written text: "T ", not " T "',
    })
  })

  it("fails a value token missing its last read space", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, " T "), 21, 23)
    expect(checkTree(input, broken)).toContainEqual({
      where: "ClassLiteral at 21-24",
      message:
        'the texts of its tokens joined are not its written text: " T", not " T "',
    })
  })
})

describe("checkTree: class/db-generic-blank (tokens.md)", () => {
  const { input, tree } = recordedTree("class", "db-generic-blank")

  it("passes the valid tree of class/db-generic-blank", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a whitespace-only value with its token removed", () => {
    const broken = copyOf(tree)
    setField(
      broken,
      "tokens",
      broken.tokens.filter((item) => item.value !== " "),
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "ClassLiteral at 21-22",
      message:
        'the texts of its tokens joined are not its written text: "", not " "',
    })
  })
})

describe("checkTree: common/error-style-semicolon-inside (tokens.md)", () => {
  const { input, tree } = recordedTree("common", "error-style-semicolon-inside")

  it("passes the valid tree of common/error-style-semicolon-inside", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails an ignored semicolon with its own token removed", () => {
    const broken = copyOf(tree)
    setField(
      broken,
      "tokens",
      broken.tokens.filter((item) => item.type !== "IgnoredSemicolon"),
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "offset 17",
      message:
        'the character outside the tokens and comments is not whitespace: ";"',
    })
  })

  it("fails a diagram node range starting at an ignored semicolon token", () => {
    const broken = copyOf(tree)
    span(input, broken.body, 17, 19)
    expect(checkTree(input, broken)).toContainEqual({
      where: "ErrorDiagram at 17-19",
      message: "does not run from the start of a token to the end of a token",
    })
  })

  it("fails an ignored semicolon represented as a child node", () => {
    const broken = copyOf(tree)
    setField(broken.body, "semicolon", {
      type: "IgnoredSemicolon",
      range: [17, 18],
      loc: locationOf(input, [17, 18]),
    })
    expect(checkTree(input, broken)).toContainEqual({
      where: "ErrorDiagram at 0-19",
      message: "has the field semicolon, which its type does not have",
    })
  })

  it("fails an error run spanning its ignored semicolon and next run", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, "style:#f"), 9, 19)
    setField(
      broken,
      "tokens",
      broken.tokens.filter((item) => item.value !== "x"),
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "IgnoredSemicolon at 17-18",
      message: "overlaps the IgnoredSemicolon before it, or comes before it",
    })
  })
})

describe("checkTree: common/comment-percent-joined-by-directive (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "common",
    "comment-percent-joined-by-directive",
  )

  it("passes the valid tree of common/comment-percent-joined-by-directive", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a comment mark containing its intervening directive", () => {
    const broken = copyOf(tree)
    setField(broken.comments[0], "mark", "%%%{init: {}}%%%")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 13-31",
      message: "the mark of a comment line is not %%",
    })
  })

  it("fails a split comment mark whose value starts after the first percent", () => {
    const broken = copyOf(tree)
    setField(broken.comments[0], "value", input.slice(14, 31))
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 13-31",
      message: 'value of a comment line: "%%{init: {}}%%% c", not " c"',
    })
  })
})

describe("checkTree: eventmodeling/comment-mark-directive (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "eventmodeling",
    "comment-mark-directive",
  )

  it("passes the valid tree of eventmodeling/comment-mark-directive", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a shared directive record omitted from a native comment mark", () => {
    const broken = copyOf(tree)
    setField(broken, "directives", [])
    expect(checkTree(input, broken)).toContainEqual({
      where: "the directives",
      message:
        "the directives of the tree are not those of the source: [], not [[[27,34],true]]",
    })
  })
})

describe("checkTree: eventmodeling/comment-block-close-mark-directive (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "eventmodeling",
    "comment-block-close-mark-directive",
  )

  it("passes the valid tree of eventmodeling/comment-block-close-mark-directive", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a shared directive record omitted from a native comment closer", () => {
    const broken = copyOf(tree)
    setField(broken, "directives", [])
    expect(checkTree(input, broken)).toContainEqual({
      where: "the directives",
      message:
        "the directives of the tree are not those of the source: [], not [[[30,37],true]]",
    })
  })
})

describe("checkTree: common/comment-after-directive (tokens.md)", () => {
  const { input, tree } = recordedTree("common", "comment-after-directive")

  it("passes the valid tree of common/comment-after-directive", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a recognized comment omitted from the comment records", () => {
    const broken = copyOf(tree)
    setField(broken, "comments", [])
    expect(checkTree(input, broken)).toContainEqual({
      where: "comment line at 15-19",
      message: "is no comment of the tree",
    })
  })

  it("fails a line comment including the space before its mark", () => {
    const broken = copyOf(tree)
    const comment = broken.comments[0]
    span(input, comment, 14, 19)
    setField(comment, "value", input.slice(16, 19))
    expect(checkTree(input, broken)).toContainEqual({
      where: "comment line at 15-19",
      message: "is no comment of the tree",
    })
  })

  it("fails a comment range including a preceding directive", () => {
    const broken = copyOf(tree)
    const comment = broken.comments[0]
    span(input, comment, 0, 19)
    setField(comment, "value", input.slice(2, 19))
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 0-19",
      message: "lies inside Directive at 0-14",
    })
  })
})

describe("checkTree: common/comment-blank-line-before-in-string (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "common",
    "comment-blank-line-before-in-string",
  )

  it("passes the valid tree of common/comment-blank-line-before-in-string", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a comment region line feed included in a string fragment", () => {
    const broken = copyOf(tree)
    const item = broken.tokens.find(
      (candidate) => candidate.type === "StringFragment",
    )!
    extendToken(input, item, item.range[0], item.range[1] + 1)
    expect(checkTree(input, broken)).toContainEqual({
      where: "FlowchartLabel at 15-26",
      message:
        'the texts of its tokens joined are not its written text: "x\\n\\ny", not "x\\ny"',
    })
  })

  it("fails a string fragment retaining the line feed ending its comment region", () => {
    const broken = copyOf(tree)
    const item = token(broken, 'y"')
    extendToken(input, item, 23, 26)
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringFragment at 23-26",
      message:
        "starts with whitespace or a line terminator where no value starts",
    })
  })
})

describe("checkTree: common/comment-directive-closed-then-spaces (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "common",
    "comment-directive-closed-then-spaces",
  )

  it("passes the valid tree of common/comment-directive-closed-then-spaces", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a comment losing spaces after a closed directive", () => {
    const broken = copyOf(tree)
    const comment = broken.comments[0]
    span(input, comment, 13, 30)
    setField(comment, "value", input.slice(15, 30))
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 13-30",
      message: "the range of a comment line: [13,30], not [13,32]",
    })
  })
})

describe("checkTree: sequence/tokens-comment-then-ignored-semicolon (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "sequence",
    "tokens-comment-then-ignored-semicolon",
  )

  it("passes the valid tree of sequence/tokens-comment-then-ignored-semicolon", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a diagram comment retaining its trailing ignored semicolon", () => {
    const broken = copyOf(tree)
    const comment = broken.comments[0]
    span(input, comment, 25, 35)
    setField(comment, "value", input.slice(26, 35))
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 25-35",
      message: "lies inside IgnoredSemicolon at 34-35",
    })
  })
})

describe("checkTree: state/tokens-ignored-semicolon-in-comment-before-spaces (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "state",
    "tokens-ignored-semicolon-in-comment-before-spaces",
  )

  it("passes the valid tree of state/tokens-ignored-semicolon-in-comment-before-spaces", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails an internal comment semicolon given a separate token", () => {
    const broken = copyOf(tree)
    setField(broken, "tokens", [
      ...broken.tokens,
      tokenOf(input, "IgnoredSemicolon", ";"),
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 18-32",
      message: "lies inside IgnoredSemicolon at 29-30",
    })
  })
})

describe("checkTree: comment-semicolon (tokens.md)", () => {
  const input = "error\n%% style:#f;\n"
  const tree = handMadeRoot(input, {
    tokens: [["RawText", "error"]],
    comments: [commentOf(input, "%%", "%% style:#f;")],
  })

  it("passes the valid tree of comment-semicolon", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails an ignored semicolon token inside a common comment line", () => {
    const broken = copyOf(tree)
    setField(broken, "tokens", [
      ...broken.tokens,
      tokenOf(input, "IgnoredSemicolon", ";"),
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 6-18",
      message: "lies inside IgnoredSemicolon at 17-18",
    })
  })
})

describe("checkTree: common/comment-bare (tokens.md)", () => {
  const { input, tree } = recordedTree("common", "comment-bare")

  it("passes the valid tree of common/comment-bare", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a non-comment percent pair recorded as a comment line", () => {
    const broken = copyOf(tree)
    const item = token(broken, "%%")
    setField(broken, "comments", [
      commentOf(input, "%%", { text: "%%", from: item.range[0] }),
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 13-15",
      message: "the mark %% is no mark of the comments of a FlowchartDiagram",
    })
  })

  it("fails an Identifier stored outside the body child fields", () => {
    const broken = copyOf(tree)
    setField(broken, "identifier", { ...firstNode(broken, "Identifier") })
    expect(checkTree(input, broken)).toContainEqual({
      where: "Root at 0-21",
      message: "has the field identifier, which its type does not have",
    })
  })

  it("fails an Identifier range extending past its single token", () => {
    const broken = copyOf(tree)
    span(input, firstNode(broken, "Identifier"), 13, 16)
    expect(checkTree(input, broken)).toContainEqual({
      where: "Identifier at 13-16",
      message: "does not run from the start of a token to the end of a token",
    })
  })

  it("fails whitespace included inside an Identifier token", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, "%%"), 12, 15)
    expect(checkTree(input, broken)).toContainEqual({
      where: "Identifier at 12-15",
      message:
        "starts with whitespace or a line terminator where no value starts",
    })
  })
})

describe("checkTree: class/header-after-bare-percent-line (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "class",
    "header-after-bare-percent-line",
  )

  it("passes the valid tree of class/header-after-bare-percent-line", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a bare pre-header comment mark losing its first percent", () => {
    const broken = copyOf(tree)
    const comment = broken.comments.find((item) => item.value === "")!
    span(input, comment, comment.range[0] + 1, comment.range[1])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 1-2",
      message: 'mark: "%%", not "%"',
    })
  })
})

describe("checkTree: state/lex-diagram-comment-empty-line-after-comment-line (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "state",
    "lex-diagram-comment-empty-line-after-comment-line",
  )

  it("passes the valid tree of state/lex-diagram-comment-empty-line-after-comment-line", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails an empty diagram-comment fragment represented as a Comment", () => {
    const broken = copyOf(tree)
    setField(broken, "comments", [
      ...broken.comments,
      {
        type: "Comment",
        mark: null,
        value: "",
        range: [30, 30],
        loc: locationOf(input, [30, 30]),
      },
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 30-30",
      message: "is empty",
    })
  })
})

describe("checkTree: state/tokens-ignored-text-comment-cut-spaces-after-region (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "state",
    "tokens-ignored-text-comment-cut-spaces-after-region",
  )

  it("passes the valid tree of state/tokens-ignored-text-comment-cut-spaces-after-region", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a whitespace-only fragment represented as a Comment", () => {
    const broken = copyOf(tree)
    setField(broken, "comments", [
      ...broken.comments.slice(0, 2),
      {
        type: "Comment",
        mark: null,
        value: "  ",
        range: [39, 41],
        loc: locationOf(input, [39, 41]),
      },
      ...broken.comments.slice(2),
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 39-41",
      message: "starts with whitespace",
    })
  })
})

describe("checkTree: state/tokens-ignored-text-comment-cut-fragment-trailing-space (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "state",
    "tokens-ignored-text-comment-cut-fragment-trailing-space",
  )

  it("passes the valid tree of state/tokens-ignored-text-comment-cut-fragment-trailing-space", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails the last diagram-comment fragment losing its final space", () => {
    const broken = copyOf(tree)
    const comment = broken.comments[2]
    span(input, comment, 39, 40)
    setField(comment, "value", "x")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 39-40",
      message: "does not end where its line ends",
    })
  })
})

describe("checkTree: common/directive-in-comment (tokens.md)", () => {
  const { input, tree } = recordedTree("common", "directive-in-comment")

  it("passes the valid tree of common/directive-in-comment", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a comment range ending before its internal directive", () => {
    const broken = copyOf(tree)
    const comment = broken.comments[0]
    span(input, comment, 13, 20)
    setField(comment, "value", input.slice(15, 20))
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 13-20",
      message: "the range of a comment line: [13,20], not [13,39]",
    })
  })

  it("fails a Directive token added inside a common comment", () => {
    const broken = copyOf(tree)
    setField(broken, "tokens", [
      ...broken.tokens.slice(0, 2),
      tokenOf(input, "Directive", "%%{init: {}}%%"),
      ...broken.tokens.slice(2),
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "the Directive tokens",
      message:
        "are not those of the directives outside all other tokens and all comments: [[20,34]], not []",
    })
  })
})

describe("checkTree: sequence/lex-diagram-comment-directive-between-marks (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "sequence",
    "lex-diagram-comment-directive-between-marks",
  )

  it("passes the valid tree of sequence/lex-diagram-comment-directive-between-marks", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a diagram-comment mark retaining a directive in its spelling", () => {
    const broken = copyOf(tree)
    setField(broken.comments[0], "mark", "%%%{a}%%%")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 27-36",
      message: 'mark: "%%%{a}%%%", not "%%"',
    })
  })
})

describe("checkTree: sequence/tokens-diagram-comment-directive-at-end (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "sequence",
    "tokens-diagram-comment-directive-at-end",
  )

  it("passes the valid tree of sequence/tokens-diagram-comment-directive-at-end", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a directive token inside a diagram comment", () => {
    const broken = copyOf(tree)
    setField(broken, "tokens", [
      ...broken.tokens.slice(0, 6),
      tokenOf(input, "Directive", "%%{init: {}}%%"),
      ...broken.tokens.slice(6),
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "the Directive tokens",
      message:
        "are not those of the directives outside all other tokens and all comments: [[28,42]], not []",
    })
  })
})

describe("checkTree: flowchart/tokens-rawtext-comment-line-then-closing-bracket (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "flowchart",
    "tokens-rawtext-comment-line-then-closing-bracket",
  )

  it("passes the valid tree of flowchart/tokens-rawtext-comment-line-then-closing-bracket", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails an empty token after a comment region", () => {
    const broken = copyOf(tree)
    const closing = token(broken, "]")
    setField(broken, "tokens", [
      ...broken.tokens.slice(0, -1),
      {
        type: "RawText",
        value: "",
        range: [closing.range[0], closing.range[0]],
        loc: locationOf(input, [closing.range[0], closing.range[0]]),
      },
      closing,
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "RawText at 22-22",
      message: "is empty",
    })
  })
})

describe("checkTree: flowchart/tokens-comment-region-at-label-start (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "flowchart",
    "tokens-comment-region-at-label-start",
  )

  it("passes the valid tree of flowchart/tokens-comment-region-at-label-start", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails unread whitespace before a comment region stored as a token", () => {
    const broken = copyOf(tree)
    const before = tokenOf(input, "RawText", { text: "\n", from: 17 })
    setField(broken, "tokens", [
      ...broken.tokens.slice(0, 4),
      before,
      ...broken.tokens.slice(4),
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "RawText at 17-18",
      message:
        "starts with whitespace or a line terminator where no value starts",
    })
  })
})

describe("checkTree: flowchart/tokens-string-two-comment-lines (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "flowchart",
    "tokens-string-two-comment-lines",
  )

  it("passes the valid tree of flowchart/tokens-string-two-comment-lines", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a string fragment spanning the second comment region", () => {
    const broken = copyOf(tree)
    const item = token(broken, "b\n")
    extendToken(input, item, 23, 30)
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 25-29",
      message: "lies inside StringFragment at 23-30",
    })
  })
})

describe("checkTree: flowchart/tokens-comment-region-then-bare-marker-line (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "flowchart",
    "tokens-comment-region-then-bare-marker-line",
  )

  it("passes the valid tree of flowchart/tokens-comment-region-then-bare-marker-line", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a bare percent line inside a value recorded as a comment", () => {
    const broken = copyOf(tree)
    setField(broken, "comments", [
      ...broken.comments,
      commentOf(input, "%%", { text: "%%", from: 22 }),
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 22-24",
      message: "the mark %% is no mark of the comments of a FlowchartDiagram",
    })
  })
})

describe("checkTree: common/comment-region-directive-in-string (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "common",
    "comment-region-directive-in-string",
  )

  it("passes the valid tree of common/comment-region-directive-in-string", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a directive in a comment region included in a string token", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, '"a\n'), 15, 32)
    expect(checkTree(input, broken)).toContainEqual({
      where: "Directive at 18-32",
      message: "lies inside StringFragment at 15-32",
    })
  })

  it("fails a comment region record starting at its preceding directive", () => {
    const broken = copyOf(tree)
    const comment = broken.comments[0]
    span(input, comment, 18, 37)
    setField(comment, "value", input.slice(20, 37))
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 18-37",
      message: "lies inside Directive at 18-32",
    })
  })

  it("fails a directive token omitted before a comment mark in a string", () => {
    const broken = copyOf(tree)
    setField(
      broken,
      "tokens",
      broken.tokens.filter((item) => item.type !== "Directive"),
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "the Directive tokens",
      message:
        "are not those of the directives outside all other tokens and all comments: [], not [[18,32]]",
    })
  })
})

describe("checkTree: common/frontmatter-indented (tokens.md)", () => {
  const { input, tree } = recordedTree("common", "frontmatter-indented")

  it("passes the valid tree of common/frontmatter-indented", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails frontmatter opening indentation included in its token", () => {
    const broken = copyOf(tree)
    extendToken(input, broken.tokens[0], 0, 5)
    expect(checkTree(input, broken)).toContainEqual({
      where: "the tokens in the range of the frontmatter",
      message:
        'are not the opening delimiter, the body, and the closing delimiter: [["Punctuator",[0,5]],["RawText",[8,20]],["Punctuator",[23,26]]], not [["Punctuator",[2,5]],["RawText",[8,20]],["Punctuator",[23,26]]]',
    })
  })

  it("fails an extra token on a frontmatter delimiter line", () => {
    const broken = copyOf(tree)
    setField(broken, "tokens", [
      tokenOf(input, "RawText", " "),
      ...broken.tokens,
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "the tokens in the range of the frontmatter",
      message:
        'are not the opening delimiter, the body, and the closing delimiter: [["RawText",[0,1]],["Punctuator",[2,5]],["RawText",[8,20]],["Punctuator",[23,26]]], not [["Punctuator",[2,5]],["RawText",[8,20]],["Punctuator",[23,26]]]',
    })
  })
})

describe("checkTree: common/config-directive-after-frontmatter (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "common",
    "config-directive-after-frontmatter",
  )

  it("passes the valid tree of common/config-directive-after-frontmatter", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a frontmatter body token missing a later line indent", () => {
    const broken = copyOf(tree)
    setField(broken, "tokens", [
      broken.tokens[0],
      tokenOf(input, "RawText", "config:\n"),
      tokenOf(input, "RawText", {
        text: "flowchart:\n    inheritDir: true",
        from: 14,
      }),
      ...broken.tokens.slice(2),
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "the tokens in the range of the frontmatter",
      message:
        'are not the opening delimiter, the body, and the closing delimiter: [["Punctuator",[0,3]],["RawText",[4,12]],["RawText",[14,45]],["Punctuator",[46,49]]], not [["Punctuator",[0,3]],["RawText",[4,45]],["Punctuator",[46,49]]]',
    })
  })

  it("fails frontmatter value with a later line indent removed", () => {
    const broken = copyOf(tree)
    setField(
      broken.frontmatter!,
      "value",
      "config:\nflowchart:\n    inheritDir: true",
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "Frontmatter at 0-49",
      message:
        'value: "config:\\nflowchart:\\n    inheritDir: true", not "config:\\n  flowchart:\\n    inheritDir: true"',
    })
  })
})

describe("checkTree: common/frontmatter-line-separator-after-opening (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "common",
    "frontmatter-line-separator-after-opening",
  )

  it("passes the valid tree of common/frontmatter-line-separator-after-opening", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails U+2028 after a frontmatter delimiter stored in its token", () => {
    const broken = copyOf(tree)
    extendToken(input, broken.tokens[0], 0, 4)
    expect(checkTree(input, broken)).toContainEqual({
      where: "the tokens in the range of the frontmatter",
      message:
        'are not the opening delimiter, the body, and the closing delimiter: [["Punctuator",[0,4]],["RawText",[5,13]],["Punctuator",[14,17]]], not [["Punctuator",[0,3]],["RawText",[5,13]],["Punctuator",[14,17]]]',
    })
  })
})

describe("checkTree: class/lex-backquote-unclosed-directive-at-end (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "class",
    "lex-backquote-unclosed-directive-at-end",
  )

  it("passes the valid tree of class/lex-backquote-unclosed-directive-at-end", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails an unclosed string token shortened before its written end", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, "`b "), 19, 21)
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 19-22",
      message:
        'the texts of its tokens joined are not its written text: "b", not "b "',
    })
  })

  it("fails an unclosed string range including a following directive", () => {
    const broken = copyOf(tree)
    span(input, firstNode(broken, "StringLiteral"), 19, 36)
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 19-36",
      message: 'raw: "`b ", not "`b %%{init: {}}%%"',
    })
  })
})

describe("checkTree: class/tokens-backquote-unclosed-directive-between-spaces (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "class",
    "tokens-backquote-unclosed-directive-between-spaces",
  )

  it("passes the valid tree of class/tokens-backquote-unclosed-directive-between-spaces", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails an unclosed string fragment missing its space after a directive", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, " b\n"), 39, 41)
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 21-41",
      message:
        'the texts of its tokens joined are not its written text: "a b\\n", not "a  b\\n"',
    })
  })

  it("fails an unclosed string fragment missing its final line feed", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, " b\n"), 38, 40)
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 21-41",
      message:
        'the texts of its tokens joined are not its written text: "a  b", not "a  b\\n"',
    })
  })
})

describe("checkTree: state/gram-scale (tokens.md)", () => {
  const { input, tree } = recordedTree("state", "gram-scale")

  it("passes the valid tree of state/gram-scale", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a NumericLiteral split into two tokens", () => {
    const broken = copyOf(tree)
    replaceToken(broken, token(broken, "350"), [
      ["Numeric", 0, 1],
      ["Numeric", 1, 3],
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "NumericLiteral at 24-27",
      message: "has 2 tokens, not the one that a node of this type has",
    })
  })

  it("fails a NumericLiteral range ending before its token", () => {
    const broken = copyOf(tree)
    span(input, firstNode(broken, "NumericLiteral"), 24, 26)
    expect(checkTree(input, broken)).toContainEqual({
      where: "NumericLiteral at 24-26",
      message: "does not run from the start of a token to the end of a token",
    })
  })
})

describe("checkTree: common/error-style-semicolon-trailing (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "common",
    "error-style-semicolon-trailing",
  )

  it("passes the valid tree of common/error-style-semicolon-trailing", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a trailing ignored semicolon omitted from error tokens", () => {
    const broken = copyOf(tree)
    setField(
      broken,
      "tokens",
      broken.tokens.filter((item) => item.type !== "IgnoredSemicolon"),
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "offset 17",
      message:
        'the character outside the tokens and comments is not whitespace: ";"',
    })
  })

  it("fails a trailing ignored semicolon retyped as RawText", () => {
    const broken = copyOf(tree)
    setField(token(broken, ";"), "type", "RawText")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Root.body",
      message:
        "does not run from its first token to its last: [0,17], not [0,18]",
    })
  })
})

describe("checkTree: common/error-bare-percent-line (tokens.md)", () => {
  const { input, tree } = recordedTree("common", "error-bare-percent-line")

  it("passes the valid tree of common/error-bare-percent-line", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a bare percent line omitted from error tokens", () => {
    const broken = copyOf(tree)
    setField(broken, "tokens", broken.tokens.slice(1))
    expect(checkTree(input, broken)).toContainEqual({
      where: "offset 0",
      message:
        'the character outside the tokens and comments is not whitespace: "%"',
    })
  })
})

describe("checkTree: common/error-trailing-percent (tokens.md)", () => {
  const { input, tree } = recordedTree("common", "error-trailing-percent")

  it("passes the valid tree of common/error-trailing-percent", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails two whitespace-separated error runs merged into one token", () => {
    const broken = copyOf(tree)
    extendToken(input, broken.tokens[1], 6, 10)
    setField(broken, "tokens", broken.tokens.slice(0, 2))
    expect(checkTree(input, broken)).toContainEqual({
      where: "RawText at 6-10",
      message: "holds whitespace or a line terminator",
    })
  })

  it("fails trailing error text misrepresented as a comment", () => {
    const broken = copyOf(tree)
    setField(broken, "comments", [commentOf(input, "%%", "%% x")])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 6-10",
      message: "the mark %% is no mark of the comments of a ErrorDiagram",
    })
  })
})

describe("checkTree: common/error-directive-adjacent (tokens.md)", () => {
  const { input, tree } = recordedTree("common", "error-directive-adjacent")

  it("passes the valid tree of common/error-directive-adjacent", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails an error directive retyped as RawText", () => {
    const broken = copyOf(tree)
    setField(broken.tokens[1], "type", "RawText")
    expect(checkTree(input, broken)).toContainEqual({
      where: "the Directive tokens",
      message:
        "are not those of the directives outside all other tokens and all comments: [], not [[5,15]]",
    })
  })
})

describe("checkTree: common/error-directive-inside (tokens.md)", () => {
  const { input, tree } = recordedTree("common", "error-directive-inside")

  it("passes the valid tree of common/error-directive-inside", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails error tokens ordered before their preceding directive", () => {
    const broken = copyOf(tree)
    const tokens = [...broken.tokens]
    const directive = tokens[1]
    tokens[1] = tokens[2]
    tokens[2] = directive
    setField(broken, "tokens", tokens)
    expect(checkTree(input, broken)).toContainEqual({
      where: "Directive at 6-20",
      message: "overlaps the Directive before it, or comes before it",
    })
  })
})

describe("checkTree: common/error-comment-inside (tokens.md)", () => {
  const { input, tree } = recordedTree("common", "error-comment-inside")

  it("passes the valid tree of common/error-comment-inside", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails an error comment line omitted from its comments", () => {
    const broken = copyOf(tree)
    setField(broken, "comments", [])
    expect(checkTree(input, broken)).toContainEqual({
      where: "comment line at 6-10",
      message: "is no comment of the tree",
    })
  })

  it("fails malformed directive-like error text recorded as a directive", () => {
    const broken = copyOf(tree)
    setField(broken, "directives", [directiveOf(input, "%%{ }")])
    expect(checkTree(input, broken)).toContainEqual({
      where: "the directives",
      message:
        "the directives of the tree are not those of the source: [[[11,16],false]], not []",
    })
  })
})

describe("checkTree: common/error-split-by-directive (tokens.md)", () => {
  const { input, tree } = recordedTree("common", "error-split-by-directive")

  it("passes the valid tree of common/error-split-by-directive", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails the Directive token omitted between error word fragments", () => {
    const broken = copyOf(tree)
    setField(
      broken,
      "tokens",
      broken.tokens.filter((item) => item.type !== "Directive"),
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "the Directive tokens",
      message:
        "are not those of the directives outside all other tokens and all comments: [], not [[3,17]]",
    })
  })
})

describe("checkTree: usecase/lex-class-property-custom-gap (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "usecase",
    "lex-class-property-custom-gap",
  )

  it("passes the valid tree of usecase/lex-class-property-custom-gap", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a whitespace-containing name retyped as a shared Identifier", () => {
    const broken = copyOf(tree)
    setField(firstNode(broken, "UsecaseIdentifier"), "type", "Identifier")
    expect(checkTree(input, broken)).toContainEqual({
      where: "UsecaseStyleDeclaration at 23-35",
      message: "the field name holds a Identifier, not a UsecaseIdentifier",
    })
  })
})

describe("checkTree: class/gram-name-spaces (tokens.md)", () => {
  const { input, tree } = recordedTree("class", "gram-name-spaces")

  it("passes the valid tree of class/gram-name-spaces", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails ClassIdentifier runs merged across whitespace", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, "Foo"), 19, 26)
    setField(
      broken,
      "tokens",
      broken.tokens.filter((item) => item.value !== "Bar"),
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "ClassIdentifier at 19-26",
      message: "name holds whitespace",
    })
  })
})

describe("checkTree: class/lex-directive-in-dotted-name (tokens.md)", () => {
  const { input, tree } = recordedTree("class", "lex-directive-in-dotted-name")

  it("passes the valid tree of class/lex-directive-in-dotted-name", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a ClassIdentifier directive token omitted between runs", () => {
    const broken = copyOf(tree)
    setField(
      broken,
      "tokens",
      broken.tokens.filter((item) => item.type !== "Directive"),
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "the Directive tokens",
      message:
        "are not those of the directives outside all other tokens and all comments: [], not [[22,36]]",
    })
  })
})

describe("checkTree: sequence/lex-directive-in-id-before-space (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "sequence",
    "lex-directive-in-id-before-space",
  )

  it("passes the valid tree of sequence/lex-directive-in-id-before-space", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a SequenceIdentifier token spanning its internal directive", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, "A"), 28, 43)
    expect(checkTree(input, broken)).toContainEqual({
      where: "Directive at 29-43",
      message: "lies inside RawText at 28-43",
    })
  })
})

describe("checkTree: flowchart/tokens-directives-label-space-between (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "flowchart",
    "tokens-directives-label-space-between",
  )

  it("passes the valid tree of flowchart/tokens-directives-label-space-between", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a read whitespace fragment between directives omitted from tokens", () => {
    const broken = copyOf(tree)
    setField(
      broken,
      "tokens",
      broken.tokens.filter((item) => item.value !== " "),
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "FlowchartLabel at 17-50",
      message:
        'the texts of its tokens joined are not its written text: "x  y", not "x   y"',
    })
  })
})

describe("checkTree: common/directive-in-string (tokens.md)", () => {
  const { input, tree } = recordedTree("common", "directive-in-string")

  it("passes the valid tree of common/directive-in-string", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a directive-cut label value losing a read space", () => {
    const broken = copyOf(tree)
    const node = firstNode(broken, "FlowchartLabel")
    setField(node, "value", String(node.value).replace("  ", " "))
    expect(checkTree(input, broken)).toContainEqual({
      where: "FlowchartLabel at 15-35",
      message: 'value is not its written text: "a b", not "a  b"',
    })
  })
})

describe("checkTree: class/tokens-ignored-semicolon-in-relation-name (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "class",
    "tokens-ignored-semicolon-in-relation-name",
  )

  it("passes the valid tree of class/tokens-ignored-semicolon-in-relation-name", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a ClassIdentifier run spanning an ignored semicolon", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, "B"), 32, 34)
    expect(checkTree(input, broken)).toContainEqual({
      where: "IgnoredSemicolon at 33-34",
      message: "overlaps the IgnoredSemicolon before it, or comes before it",
    })
  })
})

describe("checkTree: sequence/tokens-ignored-semicolon-in-participant-id (tokens.md)", () => {
  const { input, tree } = recordedTree(
    "sequence",
    "tokens-ignored-semicolon-in-participant-id",
  )

  it("passes the valid tree of sequence/tokens-ignored-semicolon-in-participant-id", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a SequenceIdentifier run spanning an ignored semicolon", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, "B"), 64, 66)
    expect(checkTree(input, broken)).toContainEqual({
      where: "IgnoredSemicolon at 65-66",
      message: "overlaps the IgnoredSemicolon before it, or comes before it",
    })
  })
})

describe("checkTree: a comment semicolon before a region (tokens.md, line 290)", () => {
  const { input, tree } = recordedTree(
    "state",
    "tokens-ignored-semicolon-in-comment-across-comment-line",
  )
  it("passes the comment with text after its region", () => {
    expect(checkTree(input, tree)).toEqual([])
  })
  it("fails a comment semicolon treated as external before later region fragments", () => {
    const broken = copyOf(tree)
    setField(broken, "tokens", [
      ...broken.tokens,
      tokenOf(input, "IgnoredSemicolon", ";"),
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 18-31",
      message: "lies inside IgnoredSemicolon at 30-31",
    })
  })
})

describe("checkTree: class/tokens-callback-arguments-line-feeds-at-ends (tokens.md, 88.0.1)", () => {
  const { input, tree } = recordedTree(
    "class",
    "tokens-callback-arguments-line-feeds-at-ends",
  )
  it("passes the valid tree for 88.0.1", () => {
    expect(checkTree(input, tree)).toEqual([])
  })
  it("fails a value token missing its first read line feed", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, "\nx\n"), 37, 39)
    expect(checkTree(input, broken)).toContainEqual({
      where: "ClassLiteral at 36-39",
      message:
        'the texts of its tokens joined are not its written text: "x\\n", not "\\nx\\n"',
    })
  })
})

describe("checkTree: class/tokens-callback-arguments-line-feeds-at-ends (tokens.md, 88.1.1)", () => {
  const { input, tree } = recordedTree(
    "class",
    "tokens-callback-arguments-line-feeds-at-ends",
  )
  it("passes the valid tree for 88.1.1", () => {
    expect(checkTree(input, tree)).toEqual([])
  })
  it("fails a value token missing its last read line feed", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, "\nx\n"), 36, 38)
    expect(checkTree(input, broken)).toContainEqual({
      where: "ClassLiteral at 36-39",
      message:
        'the texts of its tokens joined are not its written text: "\\nx", not "\\nx\\n"',
    })
  })
})

describe("checkTree: sequence/tokens-comment-then-ignored-semicolon (tokens.md, 228.5.1)", () => {
  const { input, tree } = recordedTree(
    "sequence",
    "tokens-comment-then-ignored-semicolon",
  )
  it("passes the valid tree for 228.5.1", () => {
    expect(checkTree(input, tree)).toEqual([])
  })
  it("fails an external comment semicolon with its token omitted", () => {
    const broken = copyOf(tree)
    setField(
      broken,
      "tokens",
      broken.tokens.filter((item) => item.type !== "IgnoredSemicolon"),
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "offset 34",
      message:
        'the character outside the tokens and comments is not whitespace: ";"',
    })
  })
})

describe("checkTree: common/frontmatter-blanks-after-delimiters (tokens.md, 442.0.1)", () => {
  const { input, tree } = recordedTree(
    "common",
    "frontmatter-blanks-after-delimiters",
  )
  it("passes the valid tree for 442.0.1", () => {
    expect(checkTree(input, tree)).toEqual([])
  })
  it("fails whitespace after frontmatter closing delimiter included in its token", () => {
    const broken = copyOf(tree)
    extendToken(input, broken.tokens[2], 15, 20)
    expect(checkTree(input, broken)).toContainEqual({
      where: "the tokens in the range of the frontmatter",
      message:
        'are not the opening delimiter, the body, and the closing delimiter: [["Punctuator",[0,3]],["RawText",[6,14]],["Punctuator",[15,20]]], not [["Punctuator",[0,3]],["RawText",[6,14]],["Punctuator",[15,18]]]',
    })
  })
})

describe("checkTree: blank lines after frontmatter (tokens.md, Frontmatter tokens)", () => {
  const input = "---\ntitle: x\n---\n\nerror"
  const tree = handMadeRoot(input, {
    tokens: [
      ["Punctuator", "---"],
      ["RawText", "title: x"],
      ["Punctuator", { text: "---", from: 4 }],
      ["RawText", "error"],
    ],
    frontmatter: frontmatterOf(input, "---\ntitle: x\n---", [4, 12]),
  })
  it("passes blank lines after the frontmatter closing delimiter", () => {
    expect(checkTree(input, tree)).toEqual([])
  })
  it("fails blank lines after frontmatter included in the closing token", () => {
    const broken = copyOf(tree)
    extendToken(input, broken.tokens[2], 13, 18)
    expect(checkTree(input, broken)).toContainEqual({
      where: "the tokens in the range of the frontmatter",
      message:
        'are not the opening delimiter, the body, and the closing delimiter: [["Punctuator",[0,3]],["RawText",[4,12]],["Punctuator",[13,18]]], not [["Punctuator",[0,3]],["RawText",[4,12]],["Punctuator",[13,16]]]',
    })
  })
})

describe("checkTree: flowchart/tokens-string-literal-comment-line (tokens.md, 479.1.1)", () => {
  const { input, tree } = recordedTree(
    "flowchart",
    "tokens-string-literal-comment-line",
  )
  it("passes the valid tree for 479.1.1", () => {
    expect(checkTree(input, tree)).toEqual([])
  })
  it("fails a String token missing its closing quote", () => {
    const broken = copyOf(tree)
    extendToken(input, token(broken, '"u"'), 23, 25)
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 23-26",
      message: "does not run from the start of a token to the end of a token",
    })
  })
})

describe("checkTree: flowchart/tokens-string-literal-comment-line (tokens.md, 479.3.1)", () => {
  const { input, tree } = recordedTree(
    "flowchart",
    "tokens-string-literal-comment-line",
  )
  it("passes the valid tree for 479.3.1", () => {
    expect(checkTree(input, tree)).toEqual([])
  })
  it("fails a cut string node starting at its last fragment", () => {
    const broken = copyOf(tree)
    const node = nodesOf(broken).find(
      (candidate) =>
        candidate.type === "StringLiteral" && candidate.range[0] === 27,
    )!
    span(input, node, 37, 41)
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 37-41",
      message: 'raw: "\\"one\\n%% c\\ntwo\\"", not "two\\""',
    })
  })
})

describe("checkTree: class/lex-backquote-unclosed-directive-at-end (tokens.md, 495.0.1)", () => {
  const { input, tree } = recordedTree(
    "class",
    "lex-backquote-unclosed-directive-at-end",
  )
  it("passes the valid tree for 495.0.1", () => {
    expect(checkTree(input, tree)).toEqual([])
  })
  it("fails an unclosed StringLiteral range shortened before its written end", () => {
    const broken = copyOf(tree)
    span(input, firstNode(broken, "StringLiteral"), 19, 21)
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 19-21",
      message: 'raw: "`b ", not "`b"',
    })
  })
})

describe("checkTree: class/db-class-def-attribute-quote (tokens.md, unchanged node values)", () => {
  const { input, tree } = recordedTree("class", "db-class-def-attribute-quote")
  it("passes the unchanged node value of class/db-class-def-attribute-quote", () => {
    expect(checkTree(input, tree)).toEqual([])
  })
  it("fails a node value whose attribute quotes are converted", () => {
    const broken = copyOf(tree)
    setField(firstNode(broken, "ClassLiteral"), "value", "x:<a b='c'>y</a>")
    expect(checkTree(input, broken)).toContainEqual({
      where: "ClassLiteral at 40-56",
      message:
        'value is not the texts of its tokens joined: "x:<a b=\'c\'>y</a>", not "x:<a b=\\"c\\">y</a>"',
    })
  })
})

describe("checkTree: class/db-acc-title-entity (tokens.md, unchanged node values)", () => {
  const { input, tree } = recordedTree("class", "db-acc-title-entity")
  it("passes the unchanged node value of class/db-acc-title-entity", () => {
    expect(checkTree(input, tree)).toEqual([])
  })
  it("fails a node value whose entity is converted to its placeholder", () => {
    const broken = copyOf(tree)
    setField(
      firstNode(broken, "ClassLiteral"),
      "value",
      "x\uFB02\u00B0amp\u00B6\u00DFy",
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "ClassLiteral at 25-32",
      message:
        'value is not its written text: "x\ufb02\u00b0amp\u00b6\u00dfy", not "x#amp;y"',
    })
  })
})

describe("checkTree: cases of the shared token conditions", () => {
  it("fails a Directive token value that contains only its content", () => {
    const input = "error %%{wrap}%%"
    const tree = handMadeRoot(input, {
      tokens: [
        ["RawText", "error"],
        ["Directive", "%%{wrap}%%"],
      ],
      directives: [directiveOf(input, "%%{wrap}%%")],
    })
    expect(checkTree(input, tree)).toEqual([])
    setField(tree.tokens[1], "value", "wrap")
    expect(checkTree(input, tree)).toContainEqual({
      where: "Directive at 6-16",
      message: 'value: "wrap", not "%%{wrap}%%"',
    })
  })

  it("fails a Root.tokens entry with an unknown token kind", () => {
    const tree = handMadeRoot("error", { tokens: [["RawText", "error"]] })
    expect(checkTree("error", tree)).toEqual([])
    setField(tree.tokens[0], "type", "OtherToken")
    expect(checkTree("error", tree)).toContainEqual({
      where: "OtherToken at 0-5",
      message: 'kind: "OtherToken", not "RawText"',
    })
  })

  it.each([
    {
      case: "a token whose written CRLF is converted to LF",
      fixture: "tokens-string-crlf-in-note",
      before: '"a\r\nb"',
      after: '"a\nb"',
    },
    {
      case: "a token whose attribute quotes are converted",
      fixture: "db-class-def-attribute-quote",
      before: 'x:<a b="c">y</a>',
      after: "x:<a b='c'>y</a>",
    },
    {
      case: "a token whose entity is converted to its placeholder",
      fixture: "db-acc-title-entity",
      before: "x#amp;y",
      after: "x\uFB02\u00B0amp\u00B6\u00DFy",
    },
  ])("fails $case", ({ fixture, before, after }) => {
    const { input, tree } = recordedTree("class", fixture)
    expect(checkTree(input, tree)).toEqual([])
    const broken = copyOf(tree)
    setField(token(broken, before), "value", after)
    expect(checkTree(input, broken)).toContainEqual({
      where: `${token(tree, before).type} at ${token(tree, before).range.join("-")}`,
      message: `value: ${JSON.stringify(after)}, not ${JSON.stringify(before)}`,
    })
  })

  it("fails an unclosed StringLiteral recorded as closed", () => {
    const { input, tree } = recordedTree(
      "class",
      "lex-backquote-unclosed-alone",
    )
    expect(checkTree(input, tree)).toEqual([])
    const broken = copyOf(tree)
    setField(firstNode(broken, "StringLiteral"), "closed", true)
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 21-23",
      message: "closed: true, not false",
    })
  })

  it("fails a closing quote added to an unclosed String token", () => {
    const { input, tree } = recordedTree(
      "class",
      "lex-backquote-unclosed-alone",
    )
    expect(checkTree(input, tree)).toEqual([])
    const broken = copyOf(tree)
    setField(token(broken, "`\n"), "value", "`\n`")
    expect(checkTree(input, broken)).toContainEqual({
      where: "String at 21-23",
      message: 'value: "`\\n`", not "`\\n"',
    })
  })

  it("fails a comment-cut string fragment retyped as String", () => {
    const { input, tree } = recordedTree(
      "flowchart",
      "tokens-string-literal-comment-line",
    )
    const broken = copyOf(tree)
    setField(token(broken, '"one\n'), "type", "String")
    expect(
      checkTree(input, broken).some(
        (problem) =>
          problem.where === "StringLiteral at 27-41" &&
          problem.message.includes("StringFragment"),
      ),
    ).toBe(true)
  })

  it("fails a directive-cut unclosed string fragment retyped as String", () => {
    const { input, tree } = recordedTree(
      "class",
      "tokens-backquote-unclosed-directive-between-spaces",
    )
    expect(checkTree(input, tree)).toEqual([])
    const broken = copyOf(tree)
    setField(token(broken, "`a "), "type", "String")
    expect(
      checkTree(input, broken).some(
        (problem) =>
          problem.where === "StringLiteral at 21-41" &&
          problem.message.includes("StringFragment"),
      ),
    ).toBe(true)
  })

  it("fails the two empty-frontmatter delimiter tokens merged into one", () => {
    const { input, tree } = recordedTree("common", "frontmatter-empty-body")
    expect(checkTree(input, tree)).toEqual([])
    const broken = copyOf(tree)
    extendToken(
      input,
      broken.tokens[0],
      broken.tokens[0].range[0],
      broken.tokens[1].range[1],
    )
    setField(broken, "tokens", [broken.tokens[0], ...broken.tokens.slice(2)])
    expect(
      checkTree(input, broken).some(
        (problem) =>
          problem.where === "the tokens in the range of the frontmatter",
      ),
    ).toBe(true)
  })

  it.each([
    {
      case: "a whitespace-only value",
      diagram: "class",
      fixture: "db-generic-blank",
      value: " ",
    },
    {
      case: "a whitespace fragment after a directive",
      diagram: "sequence",
      fixture: "tokens-title-directive-then-spaces",
      value: "  ",
    },
    {
      case: "a whitespace fragment after an ignored semicolon",
      diagram: "state",
      fixture: "tokens-alias-ignored-semicolon-then-spaces",
      value: "  ",
    },
    {
      case: "a value line separator before a comment region",
      diagram: "flowchart",
      fixture: "comment-lines-after-separator-0e277222",
      value: "\u2028",
    },
  ] as const)(
    "fails a missing token of $case",
    ({ diagram, fixture, value }) => {
      const { input, tree } = recordedTree(diagram, fixture)
      expect(checkTree(input, tree)).toEqual([])
      const broken = copyOf(tree)
      setField(
        broken,
        "tokens",
        broken.tokens.filter((item) => item.value !== value),
      )
      expect(
        checkTree(input, broken).some((problem) =>
          problem.message.includes("token"),
        ),
      ).toBe(true)
    },
  )

  it("fails distinct comments in reverse source order", () => {
    const input = "error\n%% first\n%% second\n"
    const tree = handMadeRoot(input, {
      tokens: [["RawText", "error"]],
      comments: [
        commentOf(input, "%%", "%% first"),
        commentOf(input, "%%", "%% second"),
      ],
    })
    expect(checkTree(input, tree)).toEqual([])
    const broken = copyOf(tree)
    setField(broken, "comments", [...broken.comments].reverse())
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 6-14",
      message: "overlaps the Comment before it, or comes before it",
    })
  })

  it("fails a separate token of a grammatical statement line terminator", () => {
    const { input, tree } = recordedTree("class", "gram-name-spaces")
    expect(checkTree(input, tree)).toEqual([])
    const broken = copyOf(tree)
    setField(broken, "tokens", [
      ...broken.tokens,
      tokenOf(input, "RawText", { text: "\n", from: input.length - 1 }),
    ])
    expect(
      checkTree(input, broken).some(
        (problem) =>
          problem.where.startsWith("RawText") &&
          problem.message.includes("whitespace"),
      ),
    ).toBe(true)
  })

  it.each([
    {
      case: "railroad ISO block mark",
      diagram: "railroad",
      fixture: "ebnf-comment-iso",
      index: 0,
    },
    {
      case: "railroad C block mark",
      diagram: "railroad",
      fixture: "ebnf-comment-iso",
      index: 1,
    },
    {
      case: "railroad semicolon mark",
      diagram: "railroad",
      fixture: "abnf-comment-semicolon-ls",
      index: 0,
    },
    {
      case: "eventmodeling block mark",
      diagram: "eventmodeling",
      fixture: "comment-native",
      index: 0,
    },
    {
      case: "eventmodeling line mark",
      diagram: "eventmodeling",
      fixture: "comment-native",
      index: 2,
    },
  ] as const)("fails a wrong $case", ({ diagram, fixture, index }) => {
    const { input, tree } = recordedTree(diagram, fixture)
    expect(checkTree(input, tree)).toEqual([])
    const broken = copyOf(tree)
    setField(broken.comments[index], "mark", "%%")
    expect(
      checkTree(input, broken).some(
        (problem) =>
          problem.message.includes("mark") ||
          problem.message.includes("native Comment"),
      ),
    ).toBe(true)
  })

  it("fails a diagram-comment value that drops its directive", () => {
    const { input, tree } = recordedTree(
      "sequence",
      "tokens-diagram-comment-directive-at-end",
    )
    const broken = copyOf(tree)
    setField(broken.comments[0], "value", "c ")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Comment at 25-42",
      message: 'value of a diagram comment: "c ", not "c %%{init: {}}%%"',
    })
  })

  it("fails a diagram-comment range ending before its internal directive", () => {
    const { input, tree } = recordedTree(
      "sequence",
      "tokens-diagram-comment-directive-at-end",
    )
    const broken = copyOf(tree)
    span(input, broken.comments[0], 25, 28)
    setField(broken.comments[0], "value", "c ")
    expect(
      checkTree(input, broken).some(
        (problem) =>
          problem.where === "Comment at 25-28" &&
          problem.message.includes("end"),
      ),
    ).toBe(true)
  })

  it.each([
    {
      case: "the common split mark",
      diagram: "common",
      fixture: "comment-percent-joined-by-directive",
    },
    {
      case: "the diagram split mark",
      diagram: "sequence",
      fixture: "lex-diagram-comment-directive-between-marks",
    },
  ] as const)(
    "fails a comment range starting after the directive in $case",
    ({ diagram, fixture }) => {
      const { input, tree } = recordedTree(diagram, fixture)
      expect(checkTree(input, tree)).toEqual([])
      const broken = copyOf(tree)
      const comment = broken.comments[0]
      span(input, comment, broken.directives[0].range[1], comment.range[1])
      expect(
        checkTree(input, broken).some(
          (problem) =>
            problem.where.startsWith("Comment") &&
            (problem.message.includes("mark") ||
              problem.message.includes("range")),
        ),
      ).toBe(true)
    },
  )

  it.each([
    {
      case: "railroad ISO block value",
      diagram: "railroad",
      fixture: "ebnf-comment-iso",
      index: 0,
      closer: "*)",
    },
    {
      case: "railroad C block value",
      diagram: "railroad",
      fixture: "ebnf-comment-iso",
      index: 1,
      closer: "*/",
    },
    {
      case: "eventmodeling block value",
      diagram: "eventmodeling",
      fixture: "comment-native",
      index: 0,
      closer: "*/",
    },
  ] as const)(
    "fails a closer retained in $case",
    ({ diagram, fixture, index, closer }) => {
      const { input, tree } = recordedTree(diagram, fixture)
      expect(checkTree(input, tree)).toEqual([])
      const broken = copyOf(tree)
      setField(
        broken.comments[index],
        "value",
        broken.comments[index].value + closer,
      )
      expect(
        checkTree(input, broken).some((problem) =>
          problem.message.includes("value"),
        ),
      ).toBe(true)
    },
  )

  it("fails a directive split into two Directive tokens", () => {
    const { input, tree } = recordedTree("common", "error-directive-adjacent")
    const broken = copyOf(tree)
    replaceToken(broken, token(broken, "%%{wrap}%%"), [
      ["Directive", 0, 3],
      ["Directive", 3, 10],
    ])
    expect(checkTree(input, broken)).toContainEqual({
      where: "the Directive tokens",
      message:
        "are not those of the directives outside all other tokens and all comments: [[5,8],[8,15]], not [[5,15]]",
    })
  })

  it("fails a final line-feed-only fragment omitted from an unclosed string", () => {
    const { input, tree } = recordedTree(
      "class",
      "lex-backquote-unclosed-directive-after-line-break",
    )
    expect(checkTree(input, tree)).toEqual([])
    const broken = copyOf(tree)
    setField(
      broken,
      "tokens",
      broken.tokens.filter((item) => item.value !== "\n"),
    )
    expect(
      checkTree(input, broken).some(
        (problem) =>
          problem.where === "StringLiteral at 19-37" &&
          problem.message.includes("token"),
      ),
    ).toBe(true)
  })

  it("fails a label value retaining its directive", () => {
    const { input, tree } = recordedTree("common", "directive-in-string")
    const broken = copyOf(tree)
    const node = firstNode(broken, "FlowchartLabel")
    setField(node, "value", input.slice(node.range[0], node.range[1]))
    expect(
      checkTree(input, broken).some(
        (problem) =>
          problem.where.startsWith("FlowchartLabel") &&
          problem.message.startsWith("value"),
      ),
    ).toBe(true)
  })

  it.each([
    {
      case: "opening indentation",
      fixture: "frontmatter-indented",
      start: 0,
      end: 26,
      message: "does not start with ---",
    },
    {
      case: "the opening delimiter",
      fixture: "frontmatter-indented",
      start: 3,
      end: 26,
      message: "does not start with ---",
    },
    {
      case: "the closing delimiter",
      fixture: "frontmatter-indented",
      start: 2,
      end: 25,
      message: "does not end with ---",
    },
    {
      case: "trailing delimiter whitespace",
      fixture: "frontmatter-blanks-after-delimiters",
      start: 0,
      end: 20,
      message: "does not end with ---",
    },
  ])(
    "fails a frontmatter record range including or omitting $case",
    ({ fixture, start, end, message }) => {
      const { input, tree } = recordedTree("common", fixture)
      expect(checkTree(input, tree)).toEqual([])
      const broken = copyOf(tree)
      span(input, broken.frontmatter!, start, end)
      expect(checkTree(input, broken)).toContainEqual({
        where: `Frontmatter at ${start}-${end}`,
        message,
      })
    },
  )

  it("fails blank lines after frontmatter included in its record range", () => {
    const input = "---\ntitle: x\n---\n\nerror"
    const tree = handMadeRoot(input, {
      tokens: [
        ["Punctuator", "---"],
        ["RawText", "title: x"],
        ["Punctuator", { text: "---", from: 4 }],
        ["RawText", "error"],
      ],
      frontmatter: frontmatterOf(input, "---\ntitle: x\n---", [4, 12]),
    })
    expect(checkTree(input, tree)).toEqual([])
    const broken = copyOf(tree)
    span(input, broken.frontmatter!, 0, 18)
    expect(checkTree(input, broken)).toContainEqual({
      where: "Frontmatter at 0-18",
      message: "does not end with ---",
    })
  })
})
