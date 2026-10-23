import { describe, expect, it } from "vitest"
import type { Range, Root } from "../src/index.ts"
import { ParseError, parse } from "../src/index.ts"
import { problemsOfTree } from "./helpers/tree-problems.ts"

// Expectations come from diagrams/state.md (the lexer, the grammar, and the
// rejections outside the grammar) and ast/state.md (the nodes and the
// tokens). Every input here was run through mermaid.js first.

/** The header line that the statements of these tests stand after. */
const HEADER = "stateDiagram-v2\n"

/** The tree of `statements` after the header line, checked against the invariants of ast.md. */
function parseStatements(statements: string): Root {
  const text = HEADER + statements
  const root = parse(text)
  expect(problemsOfTree(text, root)).toEqual([])
  return root
}

/** The kinds and source texts of the tokens of `statements`, without that of the header line. */
function tokensOf(statements: string): [string, string][] {
  return parseStatements(statements)
    .tokens.slice(1)
    .map((token) => [token.type, token.value])
}

/** The statements of the state diagram `root`. */
function bodyOf(root: Root): unknown {
  if (root.body.type !== "StateDiagram") throw new Error("unexpected tree")
  return root.body.body
}

/** The `ParseError` that `statements` after the header line make. */
function errorOf(statements: string): ParseError {
  try {
    parse(HEADER + statements)
  } catch (error) {
    if (error instanceof ParseError) return error
    throw error
  }
  throw new Error(`no ParseError for ${JSON.stringify(statements)}`)
}

/** The `;` tokens of `statements` after the header line, with their kinds. */
function semicolonTokensOf(statements: string): [string, string][] {
  return tokensOf(statements).filter(([, value]) => value === ";")
}

/** The range `range` of the statements, shifted by the header line. */
function inText(range: Range): Range {
  return [range[0] + HEADER.length, range[1] + HEADER.length]
}

describe("the state tree", () => {
  it("makes a description two tokens, its `:` and its text, and no node of a blank one", () => {
    expect(tokensOf("A : a b")).toEqual([
      ["Identifier", "A"],
      ["Punctuator", ":"],
      ["RawText", "a b"],
    ])
    expect(bodyOf(parseStatements("A : \n"))).toMatchObject([
      { type: "StateDefinitionStatement", description: null },
    ])
  })

  it("makes `[*]` a StateTerminal, and the arrow, `:::`, and the `:` of a label punctuators", () => {
    expect(tokensOf("[*] --> A:::hot : go")).toEqual([
      ["Punctuator", "[*]"],
      ["Punctuator", "-->"],
      ["Identifier", "A"],
      ["Punctuator", ":::"],
      ["Identifier", "hot"],
      ["Punctuator", ":"],
      ["RawText", "go"],
    ])
    expect(bodyOf(parseStatements("[*] --> A:::hot : go"))).toMatchObject([
      {
        type: "StateTransitionStatement",
        from: { state: { type: "StateTerminal" }, cssClass: null },
        to: {
          state: { type: "Identifier", name: "A" },
          cssClass: { type: "Identifier", name: "hot" },
        },
        label: { type: "StateLiteral", value: "go" },
      },
    ])
  })

  it("divides the id of an alias at its first and its second `:`, the second description with its whitespace", () => {
    const statements = 'state "d" as A : more : rest'
    expect(tokensOf(statements)).toEqual([
      ["Keyword", "state"],
      ["String", '"d"'],
      ["Keyword", "as"],
      ["RawText", "A"],
      ["Punctuator", ":"],
      ["RawText", " more "],
      ["RawText", ": rest"],
    ])
    expect(bodyOf(parseStatements(statements))).toMatchObject([
      {
        type: "StateAliasDefinitionStatement",
        description: { value: "d", raw: '"d"', closed: true },
        id: { type: "StateLiteral", value: "A" },
        secondDescription: { type: "StateLiteral", value: " more " },
        textAfter: { type: "StateIgnoredText", value: ": rest" },
        body: null,
      },
    ])
  })

  it("makes a second description of whitespace alone a literal, and none after a `:` that nothing follows", () => {
    const spaces = 'state "d" as A :  '
    expect(tokensOf(spaces).slice(-2)).toEqual([
      ["Punctuator", ":"],
      ["RawText", "  "],
    ])
    const root = parseStatements(spaces)
    expect(bodyOf(root)).toMatchObject([
      {
        secondDescription: { value: "  ", range: inText([16, 18]) },
        range: inText([0, 18]),
      },
    ])
    expect(root.body.range).toEqual([0, HEADER.length + 18])
    expect(bodyOf(parseStatements('state "d" as A :'))).toMatchObject([
      { secondDescription: null, range: inText([0, 16]) },
    ])
  })

  it("cuts a second description at a `;` that the line rule ignores, the whitespace after it kept", () => {
    const statements = 'state "d" as A style:#x;  '
    expect(tokensOf(statements).slice(-4)).toEqual([
      ["Punctuator", ":"],
      ["RawText", "#x"],
      ["IgnoredSemicolon", ";"],
      ["RawText", "  "],
    ])
    expect(bodyOf(parseStatements(statements))).toMatchObject([
      {
        id: { value: "A style" },
        secondDescription: { value: "#x  ", range: inText([21, 26]) },
      },
    ])
  })

  it("makes the text before a pseudostate mark its id, whitespace inside included", () => {
    expect(tokensOf("state f 1 <<fork>>")).toEqual([
      ["Keyword", "state"],
      ["RawText", "f 1"],
      ["Keyword", "<<fork>>"],
    ])
    expect(bodyOf(parseStatements("state f 1 <<fork>>"))).toMatchObject([
      {
        type: "StatePseudostateDefinitionStatement",
        id: { value: "f 1" },
        kind: "fork",
      },
    ])
  })

  it("makes each word of the position of a note and of `end note` a keyword", () => {
    expect(tokensOf("note left of A : hi")).toEqual([
      ["Keyword", "note"],
      ["Keyword", "left"],
      ["Keyword", "of"],
      ["Identifier", "A"],
      ["Punctuator", ":"],
      ["RawText", "hi"],
    ])
    const block = "note right of A\n  x\nend note"
    expect(tokensOf(block)).toEqual([
      ["Keyword", "note"],
      ["Keyword", "right"],
      ["Keyword", "of"],
      ["Identifier", "A"],
      ["RawText", "x"],
      ["Keyword", "end"],
      ["Keyword", "note"],
    ])
    expect(bodyOf(parseStatements(block))).toMatchObject([
      { type: "StateNoteStatement", position: "right", text: { value: "x" } },
    ])
    // A directive next to the space lies between two keywords.
    expect(
      tokensOf("A\nnote left of A\nt\nend%%{init: {}}%% note").slice(-3),
    ).toEqual([
      ["Keyword", "end"],
      ["Directive", "%%{init: {}}%%"],
      ["Keyword", "note"],
    ])
  })

  it("makes the text of a note on one line what mermaid.js reads after the two characters it drops", () => {
    // One whitespace character and the `:`, or the `:` and whitespace.
    for (const statements of ["note left of A :hi", "note left of A: hi"]) {
      expect(bodyOf(parseStatements(statements))).toMatchObject([
        { textBeforeText: null, text: { value: "hi" } },
      ])
    }
    // Two whitespace characters, and the `:` is part of the text.
    // The text after the `:` goes on with the value that the `:` starts,
    // so its token keeps the space after the `:`.
    expect(tokensOf("note left of A  : hi ").slice(-2)).toEqual([
      ["Punctuator", ":"],
      ["RawText", " hi"],
    ])
    expect(bodyOf(parseStatements("note left of A  : hi "))).toMatchObject([
      {
        textBeforeText: null,
        text: { value: ": hi", range: inText([16, 20]) },
      },
    ])
    // The `:` right after the id, and the character after it dropped.
    expect(tokensOf("note left of A:hi").slice(-3)).toEqual([
      ["Punctuator", ":"],
      ["RawText", "h"],
      ["RawText", "i"],
    ])
    expect(bodyOf(parseStatements("note left of A:hi"))).toMatchObject([
      {
        textBeforeText: { type: "StateIgnoredText", value: "h" },
        text: { value: "i" },
      },
    ])
    expect(bodyOf(parseStatements("note left of A:h"))).toMatchObject([
      { textBeforeText: { value: "h" }, text: null },
    ])
  })

  it("makes an empty id of a style statement null", () => {
    const statements = "A\nstyle A,,B fill:red, stroke:blue"
    expect(tokensOf(statements).slice(1)).toEqual([
      ["Keyword", "style"],
      ["Identifier", "A"],
      ["Punctuator", ","],
      ["Punctuator", ","],
      ["Identifier", "B"],
      ["RawText", "fill:red"],
      ["Punctuator", ","],
      ["RawText", "stroke:blue"],
    ])
    expect(bodyOf(parseStatements(statements))).toMatchObject([
      {},
      {
        type: "StateStyleStatement",
        states: [{ name: "A" }, null, { name: "B" }],
        styles: [{ value: "fill:red" }, { value: "stroke:blue" }],
      },
    ])
  })

  it("makes a style that is empty or all whitespace null, and a style statement without text one null style", () => {
    expect(bodyOf(parseStatements("style A x, ,y"))).toMatchObject([
      { styles: [{ value: "x" }, null, { value: "y" }] },
    ])
    expect(tokensOf("style A x, ,y").slice(2)).toEqual([
      ["RawText", "x"],
      ["Punctuator", ","],
      ["Punctuator", ","],
      ["RawText", "y"],
    ])
    expect(bodyOf(parseStatements("style A x,"))).toMatchObject([
      { styles: [{ value: "x" }, null] },
    ])
    expect(bodyOf(parseStatements("style A"))).toMatchObject([
      { styles: [null] },
    ])
    expect(bodyOf(parseStatements("style A  "))).toMatchObject([
      { styles: [null] },
    ])
  })

  it("makes a style of a classDef that is empty or all whitespace null, and none of a classDef without text", () => {
    expect(bodyOf(parseStatements("classDef a x,,y"))).toMatchObject([
      { styles: [{ value: "x" }, null, { value: "y" }] },
    ])
    expect(bodyOf(parseStatements("classDef a ,"))).toMatchObject([
      { styles: [null, null] },
    ])
    expect(bodyOf(parseStatements("classDef a"))).toMatchObject([
      { styles: [] },
    ])
    expect(bodyOf(parseStatements("classDef a  "))).toMatchObject([
      { styles: [] },
    ])
  })

  it("makes a `;` that the line rule ignores an IgnoredSemicolon token in every context", () => {
    expect(tokensOf("classDef c fill:#f00;").slice(-2)).toEqual([
      ["RawText", "fill:#f00"],
      ["IgnoredSemicolon", ";"],
    ])
    expect(tokensOf("A : style:#x;").slice(-2)).toEqual([
      ["RawText", "style:#x"],
      ["IgnoredSemicolon", ";"],
    ])
    expect(tokensOf("note left of style :#x;").slice(-2)).toEqual([
      ["RawText", "#x"],
      ["IgnoredSemicolon", ";"],
    ])
  })

  it("makes the text around `direction` on a direction line ignored texts", () => {
    expect(tokensOf("x direction LR y")).toEqual([
      ["RawText", "x"],
      ["Keyword", "direction"],
      ["Keyword", "LR"],
      ["RawText", "y"],
    ])
    expect(bodyOf(parseStatements("x direction LR y"))).toMatchObject([
      {
        type: "StateDirectionStatement",
        textBefore: { type: "StateIgnoredText", value: "x" },
        direction: "LR",
        textAfter: { type: "StateIgnoredText", value: "y" },
      },
    ])
  })

  it("reads a direction line before the `%%` of a `{` that starts no directive, also in a composite body, where such a `%%` is rejected otherwise", () => {
    expect(bodyOf(parseStatements("%%{}direction LR"))).toMatchObject([
      {
        type: "StateDirectionStatement",
        textBefore: { type: "StateIgnoredText", value: "%%{}" },
      },
    ])
    expect(
      bodyOf(parseStatements("state A {\n  %%{ }direction LR\n  B\n}")),
    ).toMatchObject([
      {
        body: [
          {
            type: "StateDirectionStatement",
            textBefore: { type: "StateIgnoredText", value: "%%{ }" },
          },
          {},
        ],
      },
    ])
    expect(
      bodyOf(parseStatements("state A {\n  %%{}direction LR\n  B\n}")),
    ).toMatchObject([
      {
        type: "StateCompositeStatement",
        body: [
          {
            type: "StateDirectionStatement",
            textBefore: { type: "StateIgnoredText", value: "%%{}" },
            direction: "LR",
          },
          { type: "StateDefinitionStatement" },
        ],
      },
    ])
    // The composite body context has no rule for the `{` after the `%%`.
    expect(errorOf("state A {\n  %%{}B\n}").range).toEqual(inText([14, 15]))
  })

  it("makes `--` in a composite body a divider", () => {
    const statements = "state A {\n  B\n  --\n  C\n}"
    expect(tokensOf(statements)).toEqual([
      ["Keyword", "state"],
      ["Identifier", "A"],
      ["Punctuator", "{"],
      ["Identifier", "B"],
      ["Punctuator", "--"],
      ["Identifier", "C"],
      ["Punctuator", "}"],
    ])
    expect(bodyOf(parseStatements(statements))).toMatchObject([
      {
        type: "StateCompositeStatement",
        id: { name: "A" },
        body: [
          { type: "StateDefinitionStatement" },
          { type: "StateDividerStatement" },
          { type: "StateDefinitionStatement" },
        ],
      },
    ])
  })

  it("ends the id of an alias and of a note before `%%`, also at its first character, and keeps a floating note id that starts with it", () => {
    const alias = parseStatements('state "d" as %% c A')
    expect(bodyOf(alias)).toMatchObject([
      { type: "StateAliasDefinitionStatement", id: null },
    ])
    expect(alias.comments.map((comment) => comment.value)).toEqual([" c A"])
    // The note text context has no comment rule, so the note text starts
    // with the `%%`.
    expect(
      bodyOf(parseStatements("note right of %% c S\n  x\nend note")),
    ).toMatchObject([
      {
        type: "StateNoteStatement",
        state: null,
        text: { value: "%% c S\n  x" },
      },
    ])
    expect(tokensOf('note "x" as %% c').at(-1)).toEqual(["RawText", "%% c"])
  })

  it("cuts a diagram comment at a comment line after U+2028 or U+2029, the fragment after it without a mark", () => {
    /** The range, mark, and value of each comment of `statements`. */
    function commentsOf(statements: string): unknown[] {
      return parseStatements(statements).comments.map(
        ({ range, mark, value }) => [range, mark, value],
      )
    }

    // mermaid.js removes the comment line, and B continues the comment.
    expect(commentsOf("A %% x\u2029%% end\nB")).toEqual([
      [inText([2, 6]), "%%", " x"],
      [inText([7, 13]), "%%", " end"],
      [inText([14, 15]), null, "B"],
    ])
    expect(commentsOf("A # x\u2028%% end\nB")).toEqual([
      [inText([2, 5]), "#", " x"],
      [inText([6, 12]), "%%", " end"],
      [inText([13, 14]), null, "B"],
    ])
    // Without anything after the comment line, no fragment follows it.
    expect(commentsOf("A %% x\u2029%% end")).toEqual([
      [inText([2, 6]), "%%", " x"],
      [inText([7, 13]), "%%", " end"],
    ])
    // An empty line after the comment line ends the diagram comment.
    expect(bodyOf(parseStatements("A %% x\u2029%% end\n\nB"))).toMatchObject([
      { type: "StateDefinitionStatement" },
      { type: "StateDefinitionStatement" },
    ])
  })

  it("decides whether a `;` that the line rule ignores lies in a cut diagram comment on the whole comment, before the cut", () => {
    /** The values of the comments of `statements`. */
    function valuesOf(statements: string): string[] {
      return parseStatements(statements).comments.map(({ value }) => value)
    }

    // The U+2029 after the `;` is a character of the comment, so the `;`
    // lies inside, with the whitespace before it.
    expect(valuesOf("A %% style:#x;\u2029%% end")).toEqual([
      " style:#x;",
      " end",
    ])
    expect(valuesOf("A %% style:#x ;\u2029%% end")).toEqual([
      " style:#x ;",
      " end",
    ])
    expect(valuesOf("A %% style:#x;\u2029%% end\nB")).toEqual([
      " style:#x;",
      " end",
      "B",
    ])
    expect(semicolonTokensOf("A %% style:#x;\u2029%% end")).toEqual([])
    // At the end of the line, the `;` is the last character of the comment
    // and a token of its own; the whitespace before it stays in the comment.
    expect(valuesOf("A %% style:#x ;")).toEqual([" style:#x "])
    expect(semicolonTokensOf("A %% style:#x ;")).toEqual([
      ["IgnoredSemicolon", ";"],
    ])
  })

  it("ends a diagram comment where its line ends, a directive at its end included, and before a `;` that the line rule ignores and that is its last character", () => {
    for (const [statements, value, semicolons] of [
      ["A #c %%{init: {}}%%\nB", "c %%{init: {}}%%", []],
      ["A --> B %% c %%{init: {} \n\n", " c %%{init: {}", []],
      ["A #style:#x;\nB", "style:#x", [["IgnoredSemicolon", ";"]]],
      ["A #style:#x;  \nB", "style:#x;  ", []],
    ] as const) {
      const root = parseStatements(statements)
      expect(root.comments.map((comment) => comment.value)).toEqual([value])
      expect(root.tokens.filter((token) => token.type === "Directive")).toEqual(
        [],
      )
      expect(
        tokensOf(statements).filter(([, tokenValue]) => tokenValue === ";"),
      ).toEqual(semicolons)
    }
  })

  it("makes the `%%` that mermaid.js does not read before a body or a note id an ignored text", () => {
    expect(tokensOf("state X\n%%{}")).toEqual([
      ["Keyword", "state"],
      ["Identifier", "X"],
      ["RawText", "%%"],
      ["Punctuator", "{"],
      ["Punctuator", "}"],
    ])
    expect(bodyOf(parseStatements("state X\n%%{}"))).toMatchObject([
      {
        type: "StateCompositeStatement",
        textBeforeBody: { type: "StateIgnoredText", value: "%%" },
        body: [],
      },
    ])
    expect(
      bodyOf(parseStatements('state "d" as %% c {\n  B\n}')),
    ).toMatchObject([
      {
        type: "StateAliasDefinitionStatement",
        id: null,
        textBeforeBody: { type: "StateIgnoredText", value: "%% c" },
        body: [{ type: "StateDefinitionStatement" }],
      },
    ])
    expect(bodyOf(parseStatements("note left of%%x A : t"))).toMatchObject([
      {
        type: "StateNoteStatement",
        textBeforeState: { type: "StateIgnoredText", value: "%%x" },
        state: { name: "A" },
        text: { value: "t" },
      },
    ])
    // A directive between the position and the `%%` is no character of the
    // diagram text, so the `%%` is still right after the position.
    expect(
      bodyOf(parseStatements("note left of%%{init: {}}%%%%x A : t")),
    ).toMatchObject([
      {
        textBeforeState: { type: "StateIgnoredText", value: "%%x" },
        state: { name: "A" },
      },
    ])
  })

  it("does not divide the id of an alias whose body is on the next line, also after a comment on its line", () => {
    for (const statements of [
      'state "d" as A : x\n{\n  B\n}',
      'state "d" as A : x %% c\n{\n  B\n}',
    ]) {
      expect(bodyOf(parseStatements(statements))).toMatchObject([
        {
          type: "StateAliasDefinitionStatement",
          id: { value: "A : x" },
          secondDescription: null,
          body: [{ type: "StateDefinitionStatement" }],
        },
      ])
    }
  })

  it("makes each quote of a floating note a punctuator of its own, and the text between them a literal", () => {
    expect(tokensOf('note ""x" as N\nA')).toEqual([
      ["Keyword", "note"],
      ["Punctuator", '"'],
      ["Punctuator", '"'],
      ["RawText", "x"],
      ["Punctuator", '"'],
      ["Keyword", "as"],
      ["RawText", "N"],
      ["Identifier", "A"],
    ])
    expect(bodyOf(parseStatements('note ""x" as N\nA'))).toMatchObject([
      {
        type: "StateFloatingNoteStatement",
        text: { type: "StateLiteral", value: "x" },
        id: { value: "N" },
      },
      {},
    ])
    expect(bodyOf(parseStatements('note " " as N\nA'))).toMatchObject([
      { type: "StateFloatingNoteStatement", text: null },
      {},
    ])
  })

  it("makes the empty strings of the state context ignored texts of the statements around them, or ignored statements", () => {
    expect(tokensOf('state "" x')).toEqual([
      ["Keyword", "state"],
      ["String", '""'],
      ["Identifier", "x"],
    ])
    expect(bodyOf(parseStatements('state "" x'))).toMatchObject([
      {
        type: "StateCompositeStatement",
        textBeforeId: { type: "StateIgnoredText", value: '""' },
        id: { name: "x" },
      },
    ])
    // With no name, no string, and no body after them, they are a
    // statement of their own, after `state` or after another statement.
    expect(bodyOf(parseStatements('state x "" ""'))).toMatchObject([
      {
        type: "StateCompositeStatement",
        textBeforeId: null,
        id: { name: "x" },
      },
      { type: "StateIgnoredStatement", value: '"" ""', range: inText([8, 13]) },
    ])
    expect(tokensOf('state ""')).toEqual([
      ["Keyword", "state"],
      ["String", '""'],
    ])
    expect(bodyOf(parseStatements('state ""'))).toMatchObject([
      { type: "StateCompositeStatement", id: null, range: inText([0, 5]) },
      { type: "StateIgnoredStatement", value: '""' },
    ])
    expect(bodyOf(parseStatements('state x "" {\n  B\n}'))).toMatchObject([
      { id: { name: "x" }, textBeforeBody: { value: '""' }, body: [{}] },
    ])
    expect(bodyOf(parseStatements('state x "" %% c\n{\n  B\n}'))).toMatchObject(
      [{ id: { name: "x" }, textBeforeBody: { value: '""' }, body: [{}] }],
    )
    expect(bodyOf(parseStatements('state "" "y" "" as A'))).toMatchObject([
      {
        type: "StateAliasDefinitionStatement",
        textBeforeDescription: { value: '""' },
        description: { value: "y" },
        textAfterDescription: { value: '""' },
      },
    ])
  })

  it("makes each empty description block after a click statement a statement of its own", () => {
    expect(
      bodyOf(parseStatements('A\nclick A "u" "t" accDescr {} accDescr {}')),
    ).toMatchObject([
      { type: "StateDefinitionStatement" },
      { type: "StateClickStatement", range: inText([2, 17]) },
      {
        type: "StateAccDescrBlockStatement",
        value: null,
        closed: true,
        range: inText([18, 29]),
      },
      { type: "StateAccDescrBlockStatement", value: null, closed: true },
    ])
  })

  it("makes the empty description blocks before a body on the next line part of `textBeforeBody`, with the tokens of their units", () => {
    expect(
      bodyOf(
        parseStatements('state "d" as A\n  accDescr {}  accDescr {} {\n  B\n}'),
      ),
    ).toMatchObject([
      {
        type: "StateAliasDefinitionStatement",
        textBeforeBody: {
          type: "StateIgnoredText",
          value: "accDescr {}  accDescr {}",
          range: inText([17, 41]),
        },
        body: [{}],
      },
    ])
    expect(tokensOf('state X ""\naccDescr {} {\n}')).toEqual([
      ["Keyword", "state"],
      ["Identifier", "X"],
      ["String", '""'],
      ["Keyword", "accDescr"],
      ["Punctuator", "{"],
      ["Punctuator", "}"],
      ["Punctuator", "{"],
      ["Punctuator", "}"],
    ])
  })

  it("makes each word of `hide empty description` a keyword, and the number of `scale` a NumericLiteral", () => {
    expect(tokensOf("hide empty description")).toEqual([
      ["Keyword", "hide"],
      ["Keyword", "empty"],
      ["Keyword", "description"],
    ])
    expect(tokensOf("scale 350 width")).toEqual([
      ["Keyword", "scale"],
      ["Numeric", "350"],
      ["Keyword", "width"],
    ])
  })
})

describe("the errors of the state diagram", () => {
  it("rejects two words between `state` and `{`, at the words", () => {
    const error = errorOf("state a b {\n}")
    expect(error.message).toBe("A state name before { must be a single word")
    expect(error.range).toEqual(inText([6, 11]))
  })

  it("rejects a composite state with more than one description, at its statement with the body", () => {
    const error = errorOf("state A {\n  B\n}\nA : x\nA : y")
    expect(error.message).toBe(
      "A composite state can have only one description",
    )
    expect(error.range).toEqual(inText([0, 15]))
  })

  it("rejects a composite body that the text ends in, at its `{`", () => {
    const error = errorOf("state A {\n")
    expect(error.message).toBe(
      "The composite state has no } before the end of the text",
    )
    expect(error.range).toEqual(inText([8, 9]))
  })

  it("rejects a composite state that an alias with a `:` gives a second description, also an empty one", () => {
    for (const statements of [
      'state "d" as A :\nstate A {\n  B\n}',
      'state A {\n  B\n}\nstate "d" as A :',
    ]) {
      expect(errorOf(statements).message).toBe(
        "A composite state can have only one description",
      )
    }
    // A string that is all whitespace, without a `:`, gives no description.
    expect(() =>
      parseStatements('state " " as A\nstate A {\n  B\n}\nA : x'),
    ).not.toThrow()
  })

  it("rejects a text that ends in a note, a scale statement, or a classDef, class, or style statement, at what entered it", () => {
    const cases: [string, string, Range][] = [
      [
        "note left of",
        "The note has no state before the end of the text",
        [0, 4],
      ],
      [
        "note left of A\nx",
        "The note has no end note before the end of the text",
        [0, 4],
      ],
      ["scale 3", "scale has no width before the end of the text", [0, 5]],
      [
        "classDef",
        "classDef has no class name before the end of the text",
        [0, 8],
      ],
      ["class", "class has no state before the end of the text", [0, 5]],
      ["style", "style has no state before the end of the text", [0, 5]],
    ]
    for (const [statements, message, range] of cases) {
      const error = errorOf(statements)
      expect(error.message).toBe(message)
      expect(error.range).toEqual(inText(range))
    }
  })

  it("rejects a `%%` before a `{` elsewhere than before a body, at the `%%`", () => {
    const error = errorOf("A\n%%{}")
    expect(error.message).toBe("Unexpected token")
    expect(error.range).toEqual(inText([2, 4]))
  })

  it("rejects two texts of a floating note", () => {
    expect(errorOf('note "a"b" as N\nA').message).toBe("Unexpected token")
  })

  it("rejects `as` that no string of an alias comes before, after an empty string, at `as`", () => {
    const error = errorOf('state "" as A')
    expect(error.message).toBe("Unexpected token")
    expect(error.range).toEqual(inText([9, 11]))
  })

  it("rejects a statement after the empty description blocks after a click statement, at the first block", () => {
    const error = errorOf('A\nclick A "u" "t" accDescr {} accDescr {} B')
    expect(error.message).toBe(
      "An empty description block can only be written where a statement starts or ends",
    )
    expect(error.range).toEqual(inText([18, 29]))
  })

  it("rejects an empty description block before the arrow of a transition, at the block", () => {
    const error = errorOf("A accDescr {} --> B")
    expect(error.message).toBe(
      "An empty description block can only be written where a statement starts or ends",
    )
    expect(error.range).toEqual(inText([2, 13]))
  })
})
