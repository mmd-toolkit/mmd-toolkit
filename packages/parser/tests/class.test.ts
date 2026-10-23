import { describe, expect, it } from "vitest"
import type { Range, Root } from "../src/index.ts"
import { ParseError, parse } from "../src/index.ts"
import { problemsOfTree } from "./helpers/tree-problems.ts"

// Expectations come from diagrams/class.md (the lexer, the grammar, and the
// rejections outside the grammar) and ast/class.md (the nodes and the
// tokens). Every input here was run through mermaid.js first.

/** The header line that the statements of these tests stand after. */
const HEADER = "classDiagram\n"

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
  it("makes the empty description blocks after the header and before the line break of a statement statements of their own", () => {
    const text = "classDiagram accDescr {}\nA <|-- B accDescr {}\nclass C\n"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    const block = { type: "ClassAccDescrBlockStatement", value: null }
    expect(bodyOf(root)).toMatchObject([
      { ...block, range: [13, 24] },
      { type: "ClassRelationStatement", range: [25, 33] },
      { ...block, range: [34, 45] },
      { type: "ClassDeclaration" },
    ])
  })

  it("makes one ClassIdentifier of the name parts of a class name, with a RawText token for each run of them", () => {
    expect(tokensOf("class Foo Bar")).toEqual([
      ["Keyword", "class"],
      ["RawText", "Foo"],
      ["RawText", "Bar"],
    ])
    expect(bodyOf(parseStatements("class Foo Bar"))).toMatchObject([
      {
        type: "ClassDeclaration",
        name: {
          prefix: null,
          name: { type: "ClassIdentifier", name: "FooBar" },
        },
      },
    ])
  })

  it("makes the name parts before a backquoted name its prefix", () => {
    expect(tokensOf("class A.`b c`")).toEqual([
      ["Keyword", "class"],
      ["RawText", "A."],
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

  it("cuts a backquoted name that is not closed at a directive inside it, also after its last character that is not whitespace", () => {
    // A directive between two characters that are not whitespace lies
    // inside the string unit, as in a closed one.
    expect(tokensOf("class `x%%{init: {}}%%y")).toEqual([
      ["Keyword", "class"],
      ["StringFragment", "`x"],
      ["Directive", "%%{init: {}}%%"],
      ["StringFragment", "y"],
    ])
    expect(bodyOf(parseStatements("class `x%%{init: {}}%%y"))).toMatchObject([
      { name: { name: { value: "xy", closed: false } } },
    ])
    // A closed directive on the next line: the name reads the line feeds on
    // both sides of it, so each is in the fragment next to it.
    expect(tokensOf("class `x\n%%{init: {}}%%\n")).toEqual([
      ["Keyword", "class"],
      ["StringFragment", "`x\n"],
      ["Directive", "%%{init: {}}%%"],
      ["StringFragment", "\n"],
    ])
    expect(bodyOf(parseStatements("class `x\n%%{init: {}}%%\n"))).toMatchObject(
      [{ name: { name: { value: "x\n\n", closed: false } } }],
    )
    // Two directives one after the other, and whitespace on both sides.
    expect(tokensOf("class `x\n%%{init: {}}%%%%{init: {}}%%\n")).toEqual([
      ["Keyword", "class"],
      ["StringFragment", "`x\n"],
      ["Directive", "%%{init: {}}%%"],
      ["Directive", "%%{init: {}}%%"],
      ["StringFragment", "\n"],
    ])
    expect(tokensOf("class `x %%{init: {}}%% \n")).toEqual([
      ["Keyword", "class"],
      ["StringFragment", "`x "],
      ["Directive", "%%{init: {}}%%"],
      ["StringFragment", " \n"],
    ])
    expect(bodyOf(parseStatements("class `x %%{init: {}}%% \n"))).toMatchObject(
      [{ name: { name: { value: "x  \n" } } }],
    )
  })

  it("ends a backquoted name that is not closed at its last source character, before a directive, one that is not closed, or a comment line at the end of the source", () => {
    for (const [statements, end, last] of [
      ["A --> `b %%{init: {}}%%", 9, "`b "],
      ["class `x\n%%{init:", 9, "`x\n"],
      ["class `x\n%% c", 9, "`x\n"],
    ] as const) {
      const root = parseStatements(statements)
      const name = root.tokens.find((token) => token.type === "String")
      expect(name?.value).toBe(last)
      expect(name?.range[1]).toBe(inText([0, end])[1])
      expect(root.body.range[1]).toBe(inText([0, end])[1])
    }
  })

  it("makes the text between the two `~` of a generic type a literal, and the `~` tokens", () => {
    expect(tokensOf("class Map~K, V~")).toEqual([
      ["Keyword", "class"],
      ["RawText", "Map"],
      ["Punctuator", "~"],
      ["RawText", "K, V"],
      ["Punctuator", "~"],
    ])
    expect(bodyOf(parseStatements("class Map~K, V~"))).toMatchObject([
      { name: { generic: { type: "ClassLiteral", value: "K, V" } } },
    ])
  })

  it("keeps the whitespace that mermaid.js reads in a value: a generic type, a member-line annotation, a member name that starts with a space, a return type before a classifier mark, and a backquoted name that is not closed", () => {
    // ast/class.md, ClassName: the generic is the whole generic text.
    expect(bodyOf(parseStatements("class A~ T ~"))).toMatchObject([
      { name: { generic: { value: " T " } } },
    ])
    expect(bodyOf(parseStatements("class A~ ~"))).toMatchObject([
      { name: { generic: { value: " " } } },
    ])
    // ClassAnnotation: as a member line, the whole text between `<<` and
    // `>>`; in an annotation statement, an Identifier without whitespace.
    expect(bodyOf(parseStatements("class A {\n<< y z >>\n}"))).toMatchObject([
      { members: [{ type: "ClassAnnotation", name: { value: " y z " } }] },
    ])
    expect(bodyOf(parseStatements("class A\n<< interface >> A"))).toMatchObject(
      [{}, { annotation: { name: { type: "Identifier", name: "interface" } } }],
    )
    // ClassMethod and ClassAttribute: a member name text that starts with a
    // space keeps it, one with a tab does not.
    expect(
      bodyOf(parseStatements("class A {\n+ foo()\n+\tbar()\n}")),
    ).toMatchObject([
      { members: [{ name: { value: " foo" } }, { name: { value: "bar" } }] },
    ])
    // The return type keeps the whitespace before a classifier mark that
    // ends it.
    expect(bodyOf(parseStatements("class A {\n+get() Foo $\n}"))).toMatchObject(
      [
        {
          members: [{ returnType: { value: "Foo " }, classifier: "static" }],
        },
      ],
    )
    // StringLiteral: a backquoted name that is not closed runs to the end of
    // the source, the line feed at its end included.
    const unclosed = parseStatements("class `x\n")
    expect(bodyOf(unclosed)).toMatchObject([
      {
        name: { name: { type: "StringLiteral", value: "x\n", closed: false } },
      },
    ])
    expect(unclosed.tokens.at(-1)?.value).toBe("`x\n")
  })

  it("gives a member no name when its name text is empty, the whitespace at the end of the line belonging to no unit", () => {
    // diagrams/class.md, Member lines: an empty member name text makes no
    // unit, while one space before a classifier mark is the name.
    for (const statements of [
      "class A {\n+ \n}",
      "class A {\n+  \n}",
      "class A {\n+ \t\n}",
      "A : + ",
    ]) {
      const root = parseStatements(statements)
      const member =
        root.body.type === "ClassDiagram"
          ? root.body.body.flatMap((statement) =>
              statement.type === "ClassDeclaration"
                ? statement.members
                : statement.type === "ClassMemberStatement"
                  ? [statement.member]
                  : [],
            )[0]
          : undefined
      expect(member).toMatchObject({ type: "ClassAttribute", name: null })
    }
    expect(bodyOf(parseStatements("class A {\n+ $\n}"))).toMatchObject([
      {
        members: [
          {
            type: "ClassAttribute",
            name: { value: " " },
            classifier: "static",
          },
        ],
      },
    ])
  })

  it("cuts a member name at a `;` that the line rule ignores, the space after it in the piece after it", () => {
    expect(tokensOf("class A {\n+x style:#a; b\n}").slice(4, 7)).toEqual([
      ["RawText", "x style:#a"],
      ["IgnoredSemicolon", ";"],
      ["RawText", " b"],
    ])
  })

  it("makes each relation end and the line of a relation tokens of their own", () => {
    expect(tokensOf("A <|  --  * B")).toEqual([
      ["RawText", "A"],
      ["Punctuator", "<|"],
      ["Punctuator", "--"],
      ["Punctuator", "*"],
      ["RawText", "B"],
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
      ["RawText", "A"],
      ["Punctuator", "--"],
      ["Punctuator", ">"],
      ["RawText", "B"],
      ["Punctuator", ":"],
      ["RawText", "x"],
    ])
  })

  it("divides a method line into its marks, its parentheses, and the words of its fields", () => {
    const statements = "class A {\n+foo(a: int) List~T~$\n}"
    expect(tokensOf(statements)).toEqual([
      ["Keyword", "class"],
      ["RawText", "A"],
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
      ["RawText", "A"],
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

  it("makes a style one token for each run of its units without whitespace between them, the `,` of its label included", () => {
    expect(
      tokensOf("class A\nstyle A fill : #f00 , stroke-width: 2px").slice(2),
    ).toEqual([
      ["Keyword", "style"],
      ["Identifier", "A"],
      ["RawText", "fill"],
      ["RawText", ": #f00 , stroke-width: 2px"],
    ])
  })

  it("keeps in a style the whitespace of a label before the `:` of the next label, and drops that between units", () => {
    // diagrams/class.md: a label ends at `:`, so `: a ` keeps its space,
    // which mermaid.js reads; ast/class.md, ClassLiteral: the value is the
    // written texts of the units joined.
    const root = parseStatements("class A\nstyle A fill : a : b")
    expect(root.tokens.slice(-2).map((token) => token.value)).toEqual([
      "fill",
      ": a : b",
    ])
    const statement =
      root.body.type === "ClassDiagram" ? root.body.body.at(-1) : undefined
    expect(
      statement?.type === "ClassStyleStatement"
        ? statement.styles.map((style) => style.value)
        : null,
    ).toEqual(["fill: a : b"])
  })

  it("keeps in a style the whitespace of a label before a directive that cuts its token", () => {
    // The directive lies between the label `: a ` and the next label, so
    // it cuts the token, and the space at the end of the label, which the
    // style reads, is in the fragment before it.
    const root = parseStatements("class A\nstyle A fill : a %%{init: {}}%%: b")
    expect(root.tokens.slice(-4).map((token) => token.value)).toEqual([
      "fill",
      ": a ",
      "%%{init: {}}%%",
      ": b",
    ])
    const statement =
      root.body.type === "ClassDiagram" ? root.body.body.at(-1) : undefined
    expect(
      statement?.type === "ClassStyleStatement"
        ? statement.styles.map((style) => style.value)
        : null,
    ).toEqual(["fill: a : b"])
  })

  it("keeps in a style the whitespace of a label before a `;` that the line rule ignores", () => {
    // The ignored `;` cuts the run of the two labels, as a directive does.
    expect(
      tokensOf("class A\nstyle A fill:#f00,color ;:blue").slice(-3),
    ).toEqual([
      ["RawText", "fill:#f00,color "],
      ["IgnoredSemicolon", ";"],
      ["RawText", ":blue"],
    ])
  })

  it("makes a `;` that the line rule ignores an IgnoredSemicolon token in every context", () => {
    expect(tokensOf("class A\nstyle A fill:#f00;").at(-1)).toEqual([
      "IgnoredSemicolon",
      ";",
    ])
    expect(tokensOf("accTitle: style:#x;\nclass A")[3]).toEqual([
      "IgnoredSemicolon",
      ";",
    ])
    expect(tokensOf("class A {\n+x style:#a;\n}").at(-2)).toEqual([
      "IgnoredSemicolon",
      ";",
    ])
  })

  it("makes the keyword, `call`, the parentheses, and the arguments of a callback tokens", () => {
    expect(tokensOf('click A call f(x) "t"')).toEqual([
      ["Keyword", "click"],
      ["RawText", "A"],
      ["Keyword", "call"],
      ["RawText", "f"],
      ["Punctuator", "("],
      ["RawText", "x"],
      ["Punctuator", ")"],
      ["String", '"t"'],
    ])
  })

  it("keeps in a callback name the whitespace before its `(`, and in its arguments the whitespace at their ends, as mermaid.js passes them on", () => {
    // ast/class.md, ClassCallbackStatement: the name and the arguments are
    // the texts that mermaid.js passes to the click function as written.
    /** The last statement of `statements`. */
    function statement(statements: string): unknown {
      return (bodyOf(parseStatements(statements)) as unknown[]).at(-1)
    }

    expect(statement("class A\nclick A call f (x)")).toMatchObject({
      callback: { value: "f " },
      arguments: { value: "x" },
    })
    expect(statement("class A\nclick A call f\n  ( x , y )")).toMatchObject({
      callback: { value: "f\n  " },
      arguments: { value: " x , y " },
    })
  })

  it("makes `note for` a keyword for each word", () => {
    expect(tokensOf('note for A "x"')).toEqual([
      ["Keyword", "note"],
      ["Keyword", "for"],
      ["RawText", "A"],
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
