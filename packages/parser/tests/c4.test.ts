import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { C4Diagram, Root } from "../src/index.ts"
import { ParseError, parse } from "../src/index.ts"

// This suite never writes records and does not call mermaid.js or dbFromTree.
describe("c4 fixtures", async () => {
  const fixtures = await loadFixtures("c4")

  /** One fixed corpus input parsed as C4. */
  function rootOf(name: string): Root {
    const fixture = fixtures.find((candidate) => candidate.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return parse(fixture.input)
  }

  /** The C4 body of a fixed corpus input. */
  function diagramOf(name: string): C4Diagram {
    const root = rootOf(name)
    if (root.body.type !== "C4Diagram") throw new Error("no C4 body")
    return root.body
  }

  it("keeps empty blocks in the header gap and the boundary gap", () => {
    expect(diagramOf("gram-empty-block-header-gap").beforeBody).toMatchObject([
      { type: "C4AccDescrBlockStatement", value: null },
    ])
    const boundary = diagramOf("gram-empty-block-after-args-before-body")
      .body[0]
    expect(boundary).toMatchObject({
      type: "C4BoundaryStatement",
      beforeBody: [{ value: null }],
    })
  })

  it("keeps a bare argument across a closing parenthesis and line feed", () => {
    expect(diagramOf("lex-bare-across-close-and-line").body[0]).toMatchObject({
      arguments: [
        { type: "C4Literal", value: "a)\ncontinued" },
        { type: "StringLiteral", value: "A" },
      ],
    })
  })

  it("keeps a null named key and a closed quoted value", () => {
    expect(diagramOf("lex-named-empty-key").body[0]).toMatchObject({
      arguments: [
        { value: "a" },
        { value: "A" },
        { type: "C4NamedAttribute", key: null, value: { closed: true } },
      ],
    })
  })

  it("keeps written CRLF and removes directives from bare and quoted values", () => {
    const bare = diagramOf("lex-bare-crlf-directive").body[0]
    const quoted = diagramOf("lex-quote-crlf-directive").body[0]
    expect(bare).toMatchObject({
      arguments: [{ value: "a\r\nb" }, { value: "A" }],
    })
    expect(quoted).toMatchObject({
      arguments: [{ value: "a" }, { value: "x\r\ny" }],
    })
  })

  it("keeps null entries distinct from empty strings and trailing commas", () => {
    expect(diagramOf("lex-double-comma").body[0]).toMatchObject({
      arguments: [{ value: "a" }, null, { value: "D" }],
    })
    expect(diagramOf("lex-trailing-comma").body[0]).toMatchObject({
      arguments: [{ value: "a" }, { value: "A" }],
    })
    expect(diagramOf("lex-empty-strings").body[0]).toMatchObject({
      arguments: [
        { type: "StringLiteral", value: "" },
        { type: "StringLiteral", value: "" },
      ],
    })
  })

  it("splits the named equals sign from the quoted value across a directive", () => {
    const root = rootOf("lex-directive-named-equals-quote")
    expect(root.tokens.map((token) => [token.type, token.value])).toEqual([
      ["Keyword", "C4Context"],
      ["Keyword", "Person"],
      ["Punctuator", "("],
      ["RawText", "a"],
      ["Punctuator", ","],
      ["String", '"A"'],
      ["Punctuator", ","],
      ["Punctuator", "$"],
      ["RawText", "descr"],
      ["Punctuator", "="],
      ["Directive", "%%{init: {}}%%"],
      ["String", '"V"'],
      ["Punctuator", ")"],
    ])
  })

  it("keeps title whitespace and fragments a string around common trivia", () => {
    expect(diagramOf("db-title-whitespace").body[0]).toMatchObject({
      type: "C4TitleStatement",
      value: { value: "   T   ", range: [16, 23] },
    })
    const root = rootOf("lex-quote-crlf-directive")
    expect(
      root.tokens
        .filter((token) => token.type === "StringFragment")
        .map((token) => token.value),
    ).toEqual(['"x\r', '\ny"'])
  })

  it.each([
    [
      "lex-keyword-eof",
      "The call keyword has no ( before the end of the text",
      [10, 16],
    ],
    [
      "lex-unclosed-parenthesis",
      "The arguments have no ) before the end of the text",
      [16, 17],
    ],
    [
      "lex-unclosed-quote",
      'The string has no closing " before the end of the text',
      [20, 21],
    ],
    [
      "lex-unclosed-named",
      'The string has no closing " before the end of the text',
      [31, 32],
    ],
    [
      "lex-named-open-eof",
      "The named attribute has no = before the end of the text",
      [24, 25],
    ],
    [
      "gram-unclosed-acctitle",
      "accTitle has no text before the end of the text",
      [10, 18],
    ],
    [
      "gram-unclosed-accdescr",
      "accDescr has no text before the end of the text",
      [10, 18],
    ],
    [
      "gram-acc-descr-block-unclosed",
      "The description block has no } before the end of the text",
      [10, 18],
    ],
    ["gram-named-empty-value", "Unexpected token", [32, 33]],
    ["gram-boundary-unclosed", "Unexpected end of text", [44, 44]],
    ["gram-direction-tb", "A direction line is not allowed in C4", [10, 22]],
    [
      "gram-named-proto",
      "A consumed named attribute cannot have the key __proto__",
      [48, 57],
    ],
  ] as const)("reports %s at its cause", (name, message, range) => {
    try {
      rootOf(name)
    } catch (error) {
      expect(error).toBeInstanceOf(ParseError)
      expect((error as ParseError).message).toBe(message)
      expect((error as ParseError).range).toEqual(range)
      return
    }
    throw new Error("expected a rejection")
  })
})
