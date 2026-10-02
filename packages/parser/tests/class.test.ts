import { describe, expect, it } from "vitest"
import type { Range, Root } from "../src/index.ts"
import { ParseError, parse } from "../src/index.ts"
import { checkTree } from "./helpers/check-tree.ts"

// Expectations come from diagrams/class.md (the lexer, the grammar, and the
// rejections outside the grammar) and ast/class.md (the nodes and the
// tokens). Every input here was run through mermaid.js first.

/** The header line that the statements of these tests stand after. */
const HEADER = "classDiagram\n"

/** The tree of `statements` after the header line, checked against the invariants of ast.md. */
function parseStatements(statements: string): Root {
  const text = HEADER + statements
  const root = parse(text)
  checkTree(text, root)
  return root
}

/** The kinds and source texts of the tokens of `statements`, without that of the header line. */
function tokensOf(statements: string): [string, string][] {
  return parseStatements(statements)
    .tokens.slice(1)
    .map((token) => [token.type, token.value])
}

/** The statements of the class diagram `root`. */
function bodyOf(root: Root): unknown {
  if (root.body.type !== "ClassDiagram") throw new Error("unexpected tree")
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

/** The range `range` of the statements, shifted by the header line. */
function inText(range: Range): Range {
  return [range[0] + HEADER.length, range[1] + HEADER.length]
}

describe("the class tree", () => {
  it("makes one Identifier of the name parts of a class name, with a token for each run of them", () => {
    expect(tokensOf("class Foo Bar")).toEqual([
      ["Keyword", "class"],
      ["Identifier", "Foo"],
      ["Identifier", "Bar"],
    ])
    expect(bodyOf(parseStatements("class Foo Bar"))).toMatchObject([
      {
        type: "ClassDeclaration",
        name: { prefix: null, name: { type: "Identifier", name: "FooBar" } },
      },
    ])
  })

  it("makes the name parts before a backquoted name its prefix", () => {
    expect(tokensOf("class A.`b c`")).toEqual([
      ["Keyword", "class"],
      ["Identifier", "A."],
      ["String", "`b c`"],
    ])
    expect(bodyOf(parseStatements("class A.`b c`"))).toMatchObject([
      {
        name: {
          prefix: { name: "A." },
          name: {
            type: "StringLiteral",
            value: "b c",
            raw: "`b c`",
            closed: true,
          },
        },
      },
    ])
  })

  it("makes a backquoted name that is not closed a StringLiteral without its closing quote", () => {
    expect(bodyOf(parseStatements("class `x"))).toMatchObject([
      {
        name: {
          name: { type: "StringLiteral", value: "x", raw: "`x", closed: false },
        },
      },
    ])
  })

  it("makes the text between the two `~` of a generic type a literal, and the `~` tokens", () => {
    expect(tokensOf("class Map~K, V~")).toEqual([
      ["Keyword", "class"],
      ["Identifier", "Map"],
      ["Punctuator", "~"],
      ["RawText", "K, V"],
      ["Punctuator", "~"],
    ])
    expect(bodyOf(parseStatements("class Map~K, V~"))).toMatchObject([
      { name: { generic: { type: "ClassLiteral", value: "K, V" } } },
    ])
  })

  it("makes each relation end and the line of a relation tokens of their own", () => {
    expect(tokensOf("A <|  --  * B")).toEqual([
      ["Identifier", "A"],
      ["Punctuator", "<|"],
      ["Punctuator", "--"],
      ["Punctuator", "*"],
      ["Identifier", "B"],
    ])
    expect(bodyOf(parseStatements("A <|  --  * B"))).toMatchObject([
      {
        type: "ClassRelationStatement",
        arrow: {
          type: "ClassArrow",
          value: "<|--*",
          startMarker: "triangle",
          line: "solid",
          endMarker: "filled-diamond",
          range: inText([2, 11]),
        },
      },
    ])
    expect(bodyOf(parseStatements("A ()-- B"))).toMatchObject([
      { arrow: { value: "()--", startMarker: "lollipop", endMarker: "none" } },
    ])
  })

  it("makes the label of a relation a literal after its `:` token", () => {
    expect(tokensOf("class A\nA --> B : x").slice(2)).toEqual([
      ["Identifier", "A"],
      ["Punctuator", "--"],
      ["Punctuator", ">"],
      ["Identifier", "B"],
      ["Punctuator", ":"],
      ["RawText", "x"],
    ])
  })

  it("divides a method line into its marks, its parentheses, and the words of its fields", () => {
    const statements = "class A {\n+foo(a: int) List~T~$\n}"
    expect(tokensOf(statements)).toEqual([
      ["Keyword", "class"],
      ["Identifier", "A"],
      ["Punctuator", "{"],
      ["Punctuator", "+"],
      ["RawText", "foo"],
      ["Punctuator", "("],
      ["RawText", "a: int"],
      ["Punctuator", ")"],
      ["RawText", "List~T~"],
      ["Punctuator", "$"],
      ["Punctuator", "}"],
    ])
    expect(bodyOf(parseStatements(statements))).toMatchObject([
      {
        members: [
          {
            type: "ClassMethod",
            visibility: "public",
            name: { value: "foo" },
            parameters: { value: "a: int" },
            returnType: { value: "List~T~" },
            classifier: "static",
            textBefore: null,
            textAfter: null,
          },
        ],
      },
    ])
  })

  it("makes the text before the segment of a method line that is read, after U+2028, an ignored text", () => {
    const statements = "class A {\n+a\u2028b(c) int\n}"
    expect(bodyOf(parseStatements(statements))).toMatchObject([
      {
        members: [
          {
            type: "ClassMethod",
            visibility: "none",
            name: { value: "b" },
            textBefore: { type: "ClassIgnoredText", value: "+a" },
            textAfter: null,
          },
        ],
      },
    ])
  })

  it("makes a member text whose first `)` is its first character an attribute line", () => {
    expect(bodyOf(parseStatements("class A {\n)x()\n+)x()\n}"))).toMatchObject([
      {
        members: [
          { type: "ClassAttribute", name: { value: ")x()" } },
          { type: "ClassMethod", visibility: "public", name: { value: ")x" } },
        ],
      },
    ])
  })

  it("makes an annotation line in a member statement a ClassAnnotation with a literal name", () => {
    expect(tokensOf("A : <<x>>")).toEqual([
      ["Identifier", "A"],
      ["Punctuator", ":"],
      ["Punctuator", "<<"],
      ["RawText", "x"],
      ["Punctuator", ">>"],
    ])
    expect(bodyOf(parseStatements("A : <<x>>"))).toMatchObject([
      {
        type: "ClassMemberStatement",
        member: { type: "ClassAnnotation", name: { type: "ClassLiteral" } },
      },
    ])
  })

  it("makes a style one token, whitespace inside included, with the `,` of its label", () => {
    expect(
      tokensOf("class A\nstyle A fill : #f00 , stroke-width: 2px").slice(2),
    ).toEqual([
      ["Keyword", "style"],
      ["Identifier", "A"],
      ["RawText", "fill : #f00 , stroke-width: 2px"],
    ])
  })

  it("gives a `;` that the line rule ignores the kind that the context at its place reads", () => {
    expect(tokensOf("class A\nstyle A fill:#f00;").at(-1)).toEqual([
      "Punctuator",
      ";",
    ])
    expect(tokensOf("accTitle: style:#x;\nclass A")[3]).toEqual([
      "RawText",
      ";",
    ])
    expect(tokensOf("class A {\n+x style:#a;\n}").at(-2)).toEqual([
      "RawText",
      ";",
    ])
  })

  it("makes the keyword, `call`, the parentheses, and the arguments of a callback tokens", () => {
    expect(tokensOf('click A call f(x) "t"')).toEqual([
      ["Keyword", "click"],
      ["Identifier", "A"],
      ["Keyword", "call"],
      ["Identifier", "f"],
      ["Punctuator", "("],
      ["RawText", "x"],
      ["Punctuator", ")"],
      ["String", '"t"'],
    ])
  })

  it("makes `note for` one keyword", () => {
    expect(tokensOf('note for A "x"')).toEqual([
      ["Keyword", "note for"],
      ["Identifier", "A"],
      ["String", '"x"'],
    ])
  })

  it("makes an empty description block where a statement starts a statement of its own", () => {
    expect(bodyOf(parseStatements("accDescr {} class A"))).toMatchObject([
      { type: "ClassAccDescrBlockStatement", value: null },
      { type: "ClassDeclaration" },
    ])
  })

  it("makes a line of `%%` a diagram comment whose line feed belongs to no unit", () => {
    const root = parseStatements("%%\nclass A")
    expect(root.comments).toMatchObject([{ range: inText([0, 2]), value: "" }])
    expect(bodyOf(root)).toMatchObject([{ type: "ClassDeclaration" }])
  })
})

describe("the errors of the class diagram", () => {
  it("rejects an empty generic type and an empty backquoted name inside a class name, at the form", () => {
    const generic = errorOf("class A~~B")
    expect(generic.message).toBe(
      "An empty generic type can only end a class name",
    )
    expect(generic.range).toEqual(inText([7, 9]))
    const backquoted = errorOf("class A``B")
    expect(backquoted.message).toBe(
      "An empty backquoted name cannot be written here",
    )
    expect(backquoted.range).toEqual(inText([7, 9]))
  })

  it("rejects a name part after a generic type", () => {
    expect(errorOf("class A~T~ B").range).toEqual(inText([11, 12]))
  })

  it("rejects an annotation statement for a class that does not exist, at its class name", () => {
    const error = errorOf("<<interface>> A")
    expect(error.message).toBe(
      "An annotation statement needs a class that exists",
    )
    expect(error.range).toEqual(inText([14, 15]))
  })

  it("rejects a method line that cannot be divided, at its member text", () => {
    const error = errorOf("class A {\nx)\n}")
    expect(error.message).toBe(
      "A method line needs a ( that is not its first character and that a ) follows",
    )
    expect(error.range).toEqual(inText([10, 12]))
  })

  it("rejects a diagram text whose first unit is not the header, at that unit, also where the text ends in the title context", () => {
    for (const text of [
      "classDiagramX\nclass A\n",
      "classDiagramX\naccTitle:\n",
    ]) {
      let error: unknown = null
      try {
        parse(text)
      } catch (caught) {
        error = caught
      }
      expect(error).toBeInstanceOf(ParseError)
      expect(error).toMatchObject({
        message: "A class diagram starts with classDiagram or classDiagram-v2",
        range: [0, 13],
      })
    }
  })

  it("rejects a member body that the text ends in, at its `{`", () => {
    const error = errorOf("class A {")
    expect(error.message).toBe(
      "The member body has no } before the end of the text",
    )
    expect(error.range).toEqual(inText([8, 9]))
  })
})
