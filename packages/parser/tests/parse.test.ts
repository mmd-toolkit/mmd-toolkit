import { describe, expect, it } from "vitest"
import type { Range, Root } from "../src/index.ts"
import { ParseError, UnsupportedDiagramError, parse } from "../src/index.ts"
import { problemsOfTree } from "./helpers/tree-problems.ts"

/**
 * Types and source texts of the tokens and comments of the root, in source
 * order, for compact assertions. Every character that is not whitespace or
 * a line terminator is in one of them (ast.md, Root): the frontmatter and a
 * directive outside every token and comment are tokens.
 */
function listed(text: string, root: Root): [string, string][] {
  const all: { type: string; range: Range }[] = [
    ...root.tokens,
    ...root.comments,
  ]
  return all
    .sort((a, b) => a.range[0] - b.range[0])
    .map((entry) => [entry.type, text.slice(...entry.range)])
}

/** The source texts of the tokens of the root. */
function tokenValues(root: Root): string[] {
  return root.tokens.map((token) => token.value)
}

/** The source text of the body of the root. */
function bodyText(text: string, root: Root): string {
  return text.slice(...root.body.range)
}

/** Returns the `ParseError` that `parse(text)` throws. */
function parseError(text: string): ParseError {
  try {
    parse(text)
  } catch (error) {
    if (error instanceof ParseError) return error
    throw error
  }
  throw new Error(`expected a ParseError for ${JSON.stringify(text)}`)
}

// Every expectation below follows ast.md (the tree) and common.md (the rules).

describe("parse: the error pseudo-diagram", () => {
  it("parses a bare `error`", () => {
    const root = parse("error")
    expect(problemsOfTree("error", root)).toEqual([])
    const loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } }
    expect(root).toEqual({
      type: "Root",
      diagramType: "error",
      body: { type: "ErrorDiagram", range: [0, 5], loc },
      frontmatter: null,
      comments: [],
      directives: [],
      tokens: [{ type: "RawText", value: "error", range: [0, 5], loc }],
      range: [0, 5],
      loc,
    })
  })

  it("has the fields of ast.md in its order, and no list of children", () => {
    const root = parse("error")
    expect(Object.keys(root)).toEqual([
      "type",
      "diagramType",
      "body",
      "frontmatter",
      "comments",
      "directives",
      "tokens",
      "range",
      "loc",
    ])
    expect(Object.keys(root.body)).toEqual(["type", "range", "loc"])
  })

  it("lists the frontmatter, comments, directives, and tokens on the root, and leaves whitespace and line terminators outside them", () => {
    const text =
      "---\ntitle: x\n---\n\n\n%% note\n%%{init: {}}%%\n  error  \n\n"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["Punctuator", "---"],
      ["RawText", "title: x"],
      ["Punctuator", "---"],
      ["Comment", "%% note"],
      ["Directive", "%%{init: {}}%%"],
      ["RawText", "error"],
    ])
    expect(root.frontmatter).toMatchObject({
      value: "title: x",
      valueRange: [4, 12],
    })
    expect(root.comments.map((comment) => comment.value)).toEqual([" note"])
    expect(root.directives).toMatchObject([
      { name: "init", value: "init: {}", closed: true },
    ])
    expect(bodyText(text, root)).toBe("error")
  })

  it("keeps the indent before the opening `---` and the trailing whitespace of the closing delimiter line outside the frontmatter", () => {
    const text = "  ---  \n  title: x\n  ---  \n\nerror"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["Punctuator", "---"],
      ["RawText", "title: x"],
      ["Punctuator", "---"],
      ["RawText", "error"],
    ])
    expect(root.frontmatter?.range).toEqual([2, 24])
    expect(root.frontmatter?.value).toBe("  title: x")
  })

  it("takes the last whitespace-only line as the body when the first content line closes the frontmatter", () => {
    const text = "---\n\n  \n---\nerror"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(root.frontmatter).toMatchObject({
      value: "  ",
      valueRange: [5, 7],
      range: [0, 11],
    })
    // ast.md, Frontmatter: a body that is all whitespace has no token.
    expect(tokenValues(root)).toEqual(["---", "---", "error"])
  })

  it("makes the body one token from its first character that is not whitespace to its last, the indent of its other lines inside", () => {
    const text = "---\n  a: 1\n  b: 2  \n---\nerror"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(
      root.tokens.slice(0, 3).map((token) => [token.type, token.value]),
    ).toEqual([
      ["Punctuator", "---"],
      ["RawText", "a: 1\n  b: 2"],
      ["Punctuator", "---"],
    ])
    expect(root.frontmatter?.value).toBe("  a: 1\n  b: 2  ")
  })

  it("lists a directive that lies inside a comment, inside the comment's range, without a token", () => {
    const text = "%% a %%{init: {}}%% b\nerror"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["Comment", "%% a %%{init: {}}%% b"],
      ["RawText", "error"],
    ])
    expect(root.comments[0].value).toBe(" a %%{init: {}}%% b")
    expect(root.directives[0].range).toEqual([5, 19])
  })

  it("keeps a directive before the `%%` of a comment line outside the comment", () => {
    const text = "%%{init: {}}%% %% after\nerror"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["Directive", "%%{init: {}}%%"],
      ["Comment", "%% after"],
      ["RawText", "error"],
    ])
  })

  it("lets a directive that spans lines join a comment line to the next line", () => {
    // A line terminator inside a directive is left out with it, so the
    // comment extends through the directive to the next line terminator.
    const text = "%% a %%{init:\n{}}%% b\nerror"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["Comment", "%% a %%{init:\n{}}%% b"],
      ["RawText", "error"],
    ])
    expect(root.directives).toMatchObject([{ range: [5, 19] }])
  })

  it("makes a token of every run outside directives and comment regions, and runs the body from the first to the last", () => {
    // `%% x` is not a comment, because it is not a comment line.
    const text = "error %%{init: {}}%% %% x\n"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["RawText", "error"],
      ["Directive", "%%{init: {}}%%"],
      ["RawText", "%%"],
      ["RawText", "x"],
    ])
    expect(root.comments).toEqual([])
    expect(root.body.range).toEqual([0, 25])
    // `%%{ }` is not a directive and not a comment line.
    const withComment = "error\n%% c\n%%{ }\n"
    const rootWithComment = parse(withComment)
    expect(problemsOfTree(withComment, rootWithComment)).toEqual([])
    expect(listed(withComment, rootWithComment)).toEqual([
      ["RawText", "error"],
      ["Comment", "%% c"],
      ["RawText", "%%{"],
      ["RawText", "}"],
    ])
    expect(rootWithComment.directives).toEqual([])
    expect(bodyText(withComment, rootWithComment)).toBe("error\n%% c\n%%{ }")
  })

  it("keeps an attribute quote and an entity, which the lexer reads in another form, inside their tokens", () => {
    // The `"` of `b="c"` are read as `'` and `#amp;` as its placeholder;
    // neither converted form is whitespace, so neither ends a run.
    const text = 'error %% <a b="c"> #amp; x\n'
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(tokenValues(root)).toEqual([
      "error",
      "%%",
      "<a",
      'b="c">',
      "#amp;",
      "x",
    ])
  })

  it("ends a token before a directive", () => {
    const text = "error%%{wrap}%%"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["RawText", "error"],
      ["Directive", "%%{wrap}%%"],
    ])
    expect(root.body.range).toEqual([0, 5])
  })

  it("lists directives next to each other separately", () => {
    const text = "%%{a}%%%%{b}%%error"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["Directive", "%%{a}%%"],
      ["Directive", "%%{b}%%"],
      ["RawText", "error"],
    ])
  })

  it("does not treat a bare `%%` line as a comment", () => {
    const text = "%%\nerror"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(root.comments).toEqual([])
    expect(tokenValues(root)).toEqual(["%%", "error"])
    expect(bodyText(text, root)).toBe("%%\nerror")
  })

  it("keeps CRLF and lone CR line terminators", () => {
    for (const text of ["error\r\n%% c\r\n", "error\r%% c\r"]) {
      const root = parse(text)
      expect(problemsOfTree(text, root)).toEqual([])
      expect(root.comments[0].loc).toEqual({
        start: { line: 2, column: 0 },
        end: { line: 2, column: 4 },
      })
    }
    const crlf = "error\r\n%% c\r\n"
    expect(listed(crlf, parse(crlf))).toEqual([
      ["RawText", "error"],
      ["Comment", "%% c"],
    ])
  })

  it("starts a comment line after U+2028, which stays outside the tokens and the comment", () => {
    const text = "error\u2028%% c"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["RawText", "error"],
      ["Comment", "%% c"],
    ])
  })

  it("treats a leading byte order mark as whitespace", () => {
    // The closing delimiter does not repeat the indent (the byte order
    // mark), so this is not frontmatter; the error pseudo-diagram ignores
    // its text.
    const text = "\uFEFF---\ntitle: x\n---\nerror"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(root.frontmatter).toBeNull()
    expect(tokenValues(root)).toEqual(["---", "title:", "x", "---", "error"])
    expect(root.body.range).toEqual([1, 23])
  })

  it("lets detection remove a `%%` run only when a line break follows it", () => {
    const text = "error %% x\n"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(tokenValues(root)).toEqual(["error", "%%", "x"])
    expect(parseError("error %% x").range).toEqual([0, 10])
  })

  it("detects the body after a `---` block that is not frontmatter", () => {
    // A leading line break keeps the frontmatter rule from matching;
    // detection removes the block again after the leading whitespace.
    const text = "\n---\ntitle: T\n---\nerror\n"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(root.frontmatter).toBeNull()
    expect(tokenValues(root)).toEqual(["---", "title:", "T", "---", "error"])
    expect(bodyText(text, root)).toBe("---\ntitle: T\n---\nerror")
  })

  it("reads a lone `\\r` inside a directive as a line break", () => {
    const text = "%%{init: {'theme':\r'dark'}}%%\nerror"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["Directive", "%%{init: {'theme':\r'dark'}}%%"],
      ["RawText", "error"],
    ])
  })

  it("ends an unclosed directive after a word argument, without the whitespace that the scan takes after it", () => {
    // `foo}%%` stays in the text, so the text is no longer `error`.
    expect(parseError("%%{init: dark foo}%%\nerror").message).toBe(
      "No diagram type detected",
    )
    const text = "%%{init: dark\nerror"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(root.directives).toMatchObject([
      { value: "init: dark", closed: false, range: [0, 13] },
    ])
    expect(listed(text, root)).toEqual([
      ["Directive", "%%{init: dark"],
      ["RawText", "error"],
    ])
  })

  it("does not parse the frontmatter body or the directive arguments", () => {
    for (const text of [
      "---\ntitle: [x\n---\nerror",
      "---\nconfig: 5\ndisplayMode: compact\n---\nerror",
      "%%{init: 'x'}%%\n%%{wrap}%%\nerror",
      "%%{init: {bad json}}%%\nerror",
    ]) {
      const root = parse(text)
      expect(problemsOfTree(text, root)).toEqual([])
      expect(root.diagramType).toBe("error")
    }
  })

  it("keeps a `---` block whose lines end with `\\r\\n` as text when it is not frontmatter", () => {
    // `\r\n` is one line terminator, so no comment start lies inside it:
    // the comment region is `%% c\n`, the blank line stays, and detection
    // removes the `---` block again.
    const text = "\n---\r\n%% c\n\n---\nerror\n"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["RawText", "---"],
      ["Comment", "%% c"],
      ["RawText", "---"],
      ["RawText", "error"],
    ])
    expect(bodyText(text, root)).toBe("---\r\n%% c\n\n---\nerror")
  })

  it("starts a comment region right after U+2028, indent included", () => {
    const text = "error\u2028  %% c"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["RawText", "error"],
      ["Comment", "%% c"],
    ])
  })

  it("starts the comment region at the earliest comment start", () => {
    // The region starts right after the first U+2028, and holds the space
    // and the second U+2028 before the comment; they are in no list.
    const text = "error\u2028 \u2028%% c"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["RawText", "error"],
      ["Comment", "%% c"],
    ])
  })

  it("applies the line rule to the segment after U+2028, and makes the ignored `;` at its end a token", () => {
    const text = "error %% x\u2028 style A:#f;\n"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(tokenValues(root)).toEqual([
      "error",
      "%%",
      "x",
      "style",
      "A:#f",
      ";",
    ])
    // The body ends before the ignored `;`, the token of no node.
    expect(bodyText(text, root)).toBe("error %% x\u2028 style A:#f")
    const whole = "error\u2028  "
    expect(tokenValues(parse(whole))).toEqual(["error"])
  })

  it("makes the `;` that the line rule ignores at the end of a run an IgnoredSemicolon token, which the body does not cover", () => {
    const text = "error %% style:#f;\n"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(root.tokens.map((token) => [token.type, token.value])).toEqual([
      ["RawText", "error"],
      ["RawText", "%%"],
      ["RawText", "style:#f"],
      ["IgnoredSemicolon", ";"],
    ])
    expect(root.tokens[3].range).toEqual([17, 18])
    expect(root.body.range).toEqual([0, 17])
  })

  it("cuts a run at an ignored `;` that more characters follow", () => {
    const text = "error %% style:#f;x\n"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(root.tokens.map((token) => [token.type, token.value])).toEqual([
      ["RawText", "error"],
      ["RawText", "%%"],
      ["RawText", "style:#f"],
      ["IgnoredSemicolon", ";"],
      ["RawText", "x"],
    ])
  })

  it("makes an ignored `;` at the start of a run, and each of two at its end, a token of its own", () => {
    const leading = "error %% style:#f ;x\n"
    const rootLeading = parse(leading)
    expect(problemsOfTree(leading, rootLeading)).toEqual([])
    expect(tokenValues(rootLeading)).toEqual([
      "error",
      "%%",
      "style:#f",
      ";",
      "x",
    ])
    // The `style` rule ignores the last `;`, and then the `classDef` rule
    // the one before it.
    const two = "error %% classDef style:#a;;\n"
    const rootTwo = parse(two)
    expect(problemsOfTree(two, rootTwo)).toEqual([])
    expect(tokenValues(rootTwo)).toEqual([
      "error",
      "%%",
      "classDef",
      "style:#a",
      ";",
      ";",
    ])
  })

  it("makes an ignored `;` that stands alone a token of its own, and ends it before a directive", () => {
    const alone = "error %% style:#f ;\n"
    const rootAlone = parse(alone)
    expect(problemsOfTree(alone, rootAlone)).toEqual([])
    expect(tokenValues(rootAlone)).toEqual(["error", "%%", "style:#f", ";"])
    const beforeDirective = "error %% style:#f;%%{wrap}%%\n"
    const rootBeforeDirective = parse(beforeDirective)
    expect(problemsOfTree(beforeDirective, rootBeforeDirective)).toEqual([])
    expect(listed(beforeDirective, rootBeforeDirective)).toEqual([
      ["RawText", "error"],
      ["RawText", "%%"],
      ["RawText", "style:#f"],
      ["IgnoredSemicolon", ";"],
      ["Directive", "%%{wrap}%%"],
    ])
  })
})

describe("parse: the flowchart diagram types", () => {
  it.each([
    ["flowchart LR\nA-->B", "flowchart-v2"],
    ["graph TD\nA-->B", "flowchart-v2"],
    ["flowchart-elk TD\nA-->B", "flowchart-elk"],
    ["swimlane-beta LR\nA-->B", "swimlane"],
  ])("%j is a FlowchartDiagram of type %s", (text, diagramType) => {
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(root.diagramType).toBe(diagramType)
    expect(root.body.type).toBe("FlowchartDiagram")
  })

  it("reads the text without a directive, which can join the header to the next word", () => {
    // The lexer reads `flowchartLR`, which is not the header keyword
    // (common.md, A directive is a token boundary).
    expect(parseError("flowchart%%{init: {}}%%LR\nA-->B").message).toBe(
      "Unexpected token",
    )
  })
})

describe("parse: detected but unsupported diagram types", () => {
  it.each([
    ['pie\n"a": 1', "pie"],
    ['C4Container\nContainer(a, "A")', "c4"],
  ])("%j is %s", (text, diagramType) => {
    let caught: unknown
    try {
      parse(text)
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(UnsupportedDiagramError)
    expect(caught).toMatchObject({
      name: "UnsupportedDiagramError",
      diagramType,
    })
  })
})

describe("parse: rejected input", () => {
  it.each([
    // Text that is all trivia: the empty range at the end of the text.
    ["", [0, 0]],
    ["  ", [2, 2]],
    ["%% comment\n", [11, 11]],
    ["hello\nworld", [0, 5]],
    ["  \n  hello", [5, 10]],
    // The free-text argument of an unclosed directive runs to the end of the
    // text, so nothing is left to detect.
    ["%%{init: {}}\nerror", [18, 18]],
    ["%% a\n%% b", [9, 9]],
    ["error %% x", [0, 10]],
  ])("rejects %j with no diagram type at %j", (text, range) => {
    const error = parseError(text)
    expect(error).toBeInstanceOf(SyntaxError)
    expect(error.name).toBe("ParseError")
    expect(error.message).toBe("No diagram type detected")
    expect(error.range).toEqual(range)
    expect(error.index).toBe(range[0])
    expect(error.loc.start.line).toBeGreaterThanOrEqual(1)
  })

  it.each([
    ["---\ntitle: x\n---", [0, 3]],
    ["---\n---\nerror", [0, 3]],
    // A line break before the block: no frontmatter, and the diagram text
    // starts with `---` (common.md, Frontmatter).
    ["\n---\ntitle: T\n---\nflowchart LR\nA-->B\n", [1, 4]],
    ["%% c\n  ----\na\n----\nerror", [7, 10]],
  ])("rejects %j as the `---` pseudo-diagram at %j", (text, range) => {
    const error = parseError(text)
    expect(error.message).toBe(
      "Diagrams beginning with --- are not valid: the block is not frontmatter",
    )
    expect(error.range).toEqual(range)
  })

  it("reads the text without its directives: detection, comments, and the tokens of the error pseudo-diagram", () => {
    // common.md, A directive is a token boundary: the characters before and
    // after a directive follow one another. Detection sees `error`, and the
    // directive cuts the run into two tokens (ast.md, ErrorDiagram).
    const split = "err%%{init: {}}%%or"
    const splitRoot = parse(split)
    expect(problemsOfTree(split, splitRoot)).toEqual([])
    expect(listed(split, splitRoot)).toEqual([
      ["RawText", "err"],
      ["Directive", "%%{init: {}}%%"],
      ["RawText", "or"],
    ])
    // Comment lines: the `%%` of a comment can be two `%` with a directive
    // between them. The directive lies inside the comment, whose value is
    // the text after the second `%` (ast.md, Comment).
    const comment = "%%%{init: {}}%%% c\nerror"
    const commentRoot = parse(comment)
    expect(problemsOfTree(comment, commentRoot)).toEqual([])
    expect(commentRoot.comments).toMatchObject([
      { value: " c", range: [0, 18] },
    ])
    expect(commentRoot.directives).toMatchObject([{ range: [1, 15] }])
    expect(commentRoot.tokens.map((token) => token.value)).toEqual(["error"])
    // Diagram detection: the condition of the `error` pseudo-diagram applies
    // the directive rule once more and finds `%%{x}%%`, formed by leaving out
    // `%%{wrap}%%`. The tree keeps the directives of the
    // source: `%%` and `{x}%%` are tokens.
    const joined = "error %%%%{wrap}%%{x}%%"
    const joinedRoot = parse(joined)
    expect(problemsOfTree(joined, joinedRoot)).toEqual([])
    expect(listed(joined, joinedRoot)).toEqual([
      ["RawText", "error"],
      ["RawText", "%%"],
      ["Directive", "%%{wrap}%%"],
      ["RawText", "{x}%%"],
    ])
    // Once the directive is left out, nothing follows the `%%`: it is no
    // comment, and detection removes it with its line break.
    const percent = "%%%{a}%%%\nerror"
    const percentRoot = parse(percent)
    expect(problemsOfTree(percent, percentRoot)).toEqual([])
    expect(percentRoot.comments).toEqual([])
    expect(percentRoot.tokens.map((token) => token.value)).toEqual([
      "%",
      "%%{a}%%",
      "%",
      "error",
    ])
  })

  it("finds a directive once more across a directive that is left out, for the `error` pseudo-diagram", () => {
    // The first `%%{` starts no directive in the source, but in the diagram
    // text `%%{`, whitespace, `x`, and `}%%` form one, which the condition of
    // the `error` pseudo-diagram leaves out; it compares `error`. The tree
    // keeps the source as is.
    const text = "%%{\n%%{wrap}%%\nx}%%error"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(listed(text, root)).toEqual([
      ["RawText", "%%{"],
      ["Directive", "%%{wrap}%%"],
      ["RawText", "x}%%error"],
    ])
    // With `error` as the word after the whitespace, the directive found once
    // more runs to the end of the text, and the condition compares nothing.
    // The error is reported at the detection point, to the end of its line.
    expect(parseError("%%{\n%%{wrap}%%\nerror").range).toEqual([0, 3])
  })

  it("reports the location of the range", () => {
    const error = parseError("\n\nhello")
    expect(error.range).toEqual([2, 7])
    expect(error.loc).toEqual({
      start: { line: 3, column: 0 },
      end: { line: 3, column: 5 },
    })
  })
})
