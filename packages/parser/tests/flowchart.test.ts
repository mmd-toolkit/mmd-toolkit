import { describe, expect, it } from "vitest"
import type { FlowchartLink, FlowchartStatement, Root } from "../src/index.ts"
import { ParseError, parse } from "../src/index.ts"
import { problemsOfTree } from "./helpers/tree-problems.ts"
import { flowchartEdgeCount } from "@mmd-toolkit/tests"

// Expectations come from diagrams/flowchart.md (the lexer and the grammar)
// and ast/flowchart.md (the nodes and the tokens).

/** The header line that the statements of these tests stand after. */
const HEADER = "flowchart LR\n"

/** A directive, as the tests of directives write it. */
const DIRECTIVE = "%%{init: {}}%%"

/** The tree of `statements` after the header line, checked against the invariants of ast.md. */
function parseStatements(statements: string): Root {
  const text = HEADER + statements
  const root = parse(text)
  expect(problemsOfTree(text, root)).toEqual([])
  return root
}

/** The kinds and source texts of the tokens of `statements`, without those of the header line. */
function tokensOf(statements: string): [string, string][] {
  return parseStatements(statements)
    .tokens.slice(2)
    .map((token) => [token.type, token.value])
}

/** The statements of the flowchart `root`. */
function bodyOf(root: Root): unknown {
  if (root.body.type !== "FlowchartDiagram") throw new Error("unexpected tree")
  return root.body.body
}

/** The first link of the vertex statement `statement` after the header line. */
function firstLinkOf(statement: string): FlowchartLink {
  const root = parseStatements(statement)
  if (root.body.type !== "FlowchartDiagram") throw new Error("unexpected tree")
  const [first] = root.body.body
  if (first.type !== "FlowchartVertexStatement") {
    throw new Error("unexpected tree")
  }
  return first.links[0]
}

describe("the flowchart tree", () => {
  it("has the header's direction and the statements, with the tokens on the root", () => {
    const text = "flowchart LR\nA[x] -->|t| B;"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(root.diagramType).toBe("flowchart-v2")
    expect(root.tokens.map((token) => [token.type, token.value])).toEqual([
      ["Keyword", "flowchart"],
      ["Keyword", "LR"],
      ["Identifier", "A"],
      ["Punctuator", "["],
      ["RawText", "x"],
      ["Punctuator", "]"],
      ["Punctuator", "-->"],
      ["Punctuator", "|"],
      ["RawText", "t"],
      ["Punctuator", "|"],
      ["Identifier", "B"],
      ["Punctuator", ";"],
    ])
    expect(root.body).toMatchObject({
      type: "FlowchartDiagram",
      direction: "LR",
      range: [0, 27],
      body: [
        {
          type: "FlowchartVertexStatement",
          // The separator `;` is not part of the statement.
          range: [13, 26],
          first: {
            type: "FlowchartVertexGroup",
            range: [13, 17],
            vertices: [
              {
                type: "FlowchartVertex",
                id: { type: "Identifier", name: "A", range: [13, 14] },
                shape: {
                  type: "FlowchartShape",
                  name: "rectangle",
                  label: {
                    type: "FlowchartLabel",
                    kind: "text",
                    value: "x",
                    range: [15, 16],
                  },
                  property: null,
                  range: [14, 17],
                },
                cssClass: null,
                data: [],
                range: [13, 17],
              },
            ],
          },
          links: [
            {
              type: "FlowchartLink",
              id: null,
              opening: null,
              arrow: {
                type: "FlowchartArrow",
                value: "-->",
                startMarker: "none",
                line: "solid",
                length: 2,
                endMarker: "arrow",
              },
              label: { kind: "text", value: "t", range: [22, 23] },
              target: {
                type: "FlowchartVertexGroup",
                vertices: [
                  {
                    id: { type: "Identifier", name: "B", range: [25, 26] },
                    shape: null,
                    range: [25, 26],
                  },
                ],
                range: [25, 26],
              },
              range: [18, 26],
            },
          ],
        },
      ],
    })
  })

  it("has no direction when the header has none, and keeps the direction as written", () => {
    expect(parse("flowchart\nA").body).toMatchObject({ direction: null })
    expect(parse("graph TD;A").body).toMatchObject({ direction: "TD" })
    expect(parse("graph <\nA").body).toMatchObject({ direction: "<" })
  })

  it("reads a header alone, because the text ends with a line feed", () => {
    // diagrams/flowchart.md, Lexical structure: the `\n` that the lexer reads
    // after the last character is part of the diagram text.
    const root = parse("flowchart")
    expect(root.tokens.map((token) => token.value)).toEqual(["flowchart"])
    expect(root.body).toMatchObject({ direction: null, body: [] })
  })

  it("makes each value its written text: without the whitespace around it, with the whitespace inside it", () => {
    expect(
      bodyOf(parseStatements("A[ x ]\nstyle A fill:#f00 , stroke:#333 ")),
    ).toMatchObject([
      { first: { vertices: [{ shape: { label: { value: "x" } } }] } },
      {
        type: "FlowchartStyleStatement",
        id: { name: "A" },
        // ast/flowchart.md, FlowchartStyleStatement: a style holds the
        // whitespace at its start after a `,`, which mermaid.js reads, and
        // not the whitespace at its end, which belongs to no node.
        styles: [
          { type: "FlowchartLiteral", value: "fill:#f00", range: [28, 37] },
          { type: "FlowchartLiteral", value: " stroke:#333", range: [39, 51] },
        ],
      },
    ])
  })

  it("makes the whitespace at the start of a style after a `,` part of its token, and a style that is all whitespace null", () => {
    expect(tokensOf("style A fill:#f00 ,\t stroke:#333 ").slice(-3)).toEqual([
      ["RawText", "fill:#f00"],
      ["Punctuator", ","],
      ["RawText", "\t stroke:#333"],
    ])
    expect(bodyOf(parseStatements("style A fill:#f00,  "))).toMatchObject([
      { styles: [{ value: "fill:#f00" }, null] },
    ])
    // A `;` that the line rule ignores cuts a style, and the whitespace after
    // it at the end belongs to no token.
    expect(tokensOf("style A fill:#f00;stroke:#0f0").slice(-3)).toEqual([
      ["RawText", "fill:#f00"],
      ["IgnoredSemicolon", ";"],
      ["RawText", "stroke:#0f0"],
    ])
    expect(
      bodyOf(parseStatements("style A fill:#f00;stroke:#0f0")),
    ).toMatchObject([{ styles: [{ value: "fill:#f00stroke:#0f0" }] }])
    expect(tokensOf("style A fill:#f00;  ").slice(-2)).toEqual([
      ["RawText", "fill:#f00"],
      ["IgnoredSemicolon", ";"],
    ])
    // A directive cuts it, and the whitespace on both sides of the
    // directive, which the style reads, is in the pieces.
    const directive = "style A fill:#f00, %%{init: {}}%%  stroke:#333"
    expect(tokensOf(directive).slice(-3)).toEqual([
      ["RawText", " "],
      ["Directive", "%%{init: {}}%%"],
      ["RawText", "  stroke:#333"],
    ])
    expect(bodyOf(parseStatements(directive))).toMatchObject([
      { styles: [{ value: "fill:#f00" }, { value: "   stroke:#333" }] },
    ])
  })

  it("makes the whitespace after the name of a subgraph without a title part of the name, up to the separator or the first empty description block", () => {
    const cases: [string, string, [string, string][]][] = [
      ["subgraph S \nend", "S ", [["RawText", "S "]]],
      ["subgraph S accDescr {}\nend", "S ", [["RawText", "S "]]],
      // After a string, the whitespace is a token of its own.
      [
        'subgraph "S" \nend',
        "S ",
        [
          ["String", '"S"'],
          ["RawText", " "],
        ],
      ],
      // With a title, mermaid.js reads no whitespace before its `[`.
      ["subgraph a  [T]\nend", "a", [["RawText", "a"]]],
      // After a string, the whitespace on both sides of a directive, which
      // the name reads, is in the pieces.
      [
        'subgraph "S" %%{init: {}}%% \nA\nend',
        "S  ",
        [
          ["String", '"S"'],
          ["RawText", " "],
          ["Directive", "%%{init: {}}%%"],
          ["RawText", " "],
        ],
      ],
      // The whitespace between the blocks belongs to no token.
      ['subgraph "S"accDescr {} accDescr {}\nend', "S", [["String", '"S"']]],
    ]
    for (const [statements, value, nameTokens] of cases) {
      expect(bodyOf(parseStatements(statements))).toMatchObject([
        { name: { value } },
      ])
      expect(tokensOf(statements).slice(1, 1 + nameTokens.length)).toEqual(
        nameTokens,
      )
    }
  })

  it("makes a link's arrows and label from its units, and joins the pieces of an id", () => {
    expect(bodyOf(parseStatements("A-b e1@-- t x--> 12ab & C"))).toMatchObject([
      {
        first: { vertices: [{ id: { name: "A-b" } }] },
        links: [
          {
            id: { type: "Identifier", name: "e1", range: [17, 19] },
            opening: {
              type: "FlowchartOpeningArrow",
              value: "--",
              startMarker: "none",
              line: "solid",
            },
            arrow: {
              type: "FlowchartArrow",
              value: "x-->",
              startMarker: "cross",
              line: "solid",
              length: 2,
              endMarker: "arrow",
            },
            label: { kind: "text", value: "t" },
            target: {
              vertices: [{ id: { name: "12ab" } }, { id: { name: "C" } }],
            },
          },
        ],
      },
    ])
  })

  it("names each shape as the table of Shapes does, with a property only for `[|`", () => {
    const shapes: [string, string, boolean][] = [
      ["A[x]", "rectangle", false],
      ["A(x)", "rounded", false],
      ["A((x))", "circle", false],
      ["A(((x)))", "double-circle", false],
      ["A{x}", "diamond", false],
      ["A{{x}}", "hexagon", false],
      ["A([x])", "stadium", false],
      ["A[[x]]", "framed-rectangle", false],
      ["A[(x)]", "cylinder", false],
      ["A>x]", "odd", false],
      ["A(-x-)", "ellipse", false],
      ["A[/x\\]", "trapezoid-bottom", false],
      ["A[/x/]", "lean-right", false],
      ["A[\\x/]", "trapezoid-top", false],
      ["A[\\x\\]", "lean-left", false],
      ["A[|borders:lt|x]", "rectangle", true],
    ]
    for (const [statement, name, hasProperty] of shapes) {
      const [first] = bodyOf(parseStatements(statement)) as FlowchartStatement[]
      if (first.type !== "FlowchartVertexStatement") {
        throw new Error("unexpected tree")
      }
      const { shape } = first.first.vertices[0]
      expect(shape?.name, statement).toBe(name)
      expect(shape?.property !== null, statement).toBe(hasProperty)
    }
  })

  it("gives an arrow its markers, its line, and the number of its line characters", () => {
    expect(firstLinkOf("A---B")).toMatchObject({
      arrow: {
        startMarker: "none",
        line: "solid",
        length: 3,
        endMarker: "none",
      },
    })
    expect(firstLinkOf("A<-->B")).toMatchObject({
      arrow: { startMarker: "arrow", length: 2, endMarker: "arrow" },
    })
    expect(firstLinkOf("A x==>B")).toMatchObject({
      arrow: { value: "x==>", startMarker: "cross", line: "thick" },
    })
    expect(firstLinkOf("A-..->B")).toMatchObject({
      arrow: { line: "dotted", length: 2, endMarker: "arrow" },
    })
    expect(firstLinkOf("A .->B")).toMatchObject({
      arrow: { line: "dotted", length: 1 },
    })
    expect(firstLinkOf("A~~~B")).toMatchObject({
      arrow: { line: "invisible", length: 3, endMarker: "none" },
    })
    expect(firstLinkOf("A<-- t -->B")).toMatchObject({
      opening: { value: "<--", startMarker: "arrow", line: "solid" },
      arrow: { value: "-->", startMarker: "none" },
    })
    expect(firstLinkOf("A== t x==>B")).toMatchObject({
      opening: { line: "thick", startMarker: "none" },
      arrow: { line: "thick", startMarker: "cross" },
    })
  })

  it("reads a line break before or after an arrow as part of the arrow", () => {
    // Arrows: the whitespace on both sides of an arrow, line feeds
    // included, is part of its unit.
    expect(bodyOf(parseStatements("A\n-->B\nx-->C"))).toMatchObject([
      {
        type: "FlowchartVertexStatement",
        first: { vertices: [{ id: { name: "A" } }] },
        links: [
          {
            arrow: { value: "-->", range: [15, 18] },
            target: { vertices: [{ id: { name: "B" } }] },
          },
          {
            arrow: { value: "x-->", startMarker: "cross" },
            target: { vertices: [{ id: { name: "C" } }] },
          },
        ],
      },
    ])
  })

  it("reads a line with `direction` and a value as a direction statement, whatever else it holds", () => {
    const root = parseStatements("A-->B direction TB x")
    expect(bodyOf(root)).toMatchObject([
      { type: "FlowchartDirectionStatement", direction: "TB", range: [13, 33] },
    ])
    expect(tokensOf("A-->B direction TB x")).toEqual([
      ["RawText", "A-->B"],
      ["Keyword", "direction"],
      ["Keyword", "TB"],
      ["RawText", "x"],
    ])
  })

  it("makes every other `;` an empty statement, and keeps subgraph bodies", () => {
    expect(bodyOf(parseStatements("subgraph S [T]\nA;;\nend"))).toMatchObject([
      {
        type: "FlowchartSubgraphStatement",
        name: { kind: "text", value: "S" },
        title: { kind: "text", value: "T" },
        body: [
          { type: "FlowchartVertexStatement" },
          { type: "FlowchartEmptyStatement", range: [30, 31] },
        ],
      },
    ])
  })

  it("makes each data block written one after another a node of its own, with the text between its braces", () => {
    // ast/flowchart.md, FlowchartDataBlock; the range of the vertex covers
    // its data blocks.
    expect(
      bodyOf(parseStatements("A@{ shape: rect\n}@{ label: x\n}")),
    ).toMatchObject([
      {
        first: {
          vertices: [
            {
              id: { name: "A" },
              data: [
                {
                  type: "FlowchartDataBlock",
                  value: " shape: rect\n",
                  range: [14, 30],
                },
                {
                  type: "FlowchartDataBlock",
                  value: " label: x\n",
                  range: [30, 43],
                },
              ],
              range: [13, 43],
            },
          ],
        },
      },
    ])
  })

  it("makes the empty description blocks before a separator statements after their statement, and those of the header and of a subgraph name the first statements of the body", () => {
    const text =
      "flowchart LR accDescr {}\nA accDescr {} ;B\nsubgraph S accDescr {}\nC\nend\n"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    const block = {
      type: "FlowchartAccDescrBlockStatement",
      value: null,
      closed: true,
    }
    expect(bodyOf(root)).toMatchObject([
      { ...block, range: [13, 24] },
      { type: "FlowchartVertexStatement", range: [25, 26] },
      { ...block, range: [27, 38] },
      { type: "FlowchartVertexStatement" },
      {
        type: "FlowchartSubgraphStatement",
        body: [{ ...block }, { type: "FlowchartVertexStatement" }],
      },
    ])
  })
})

describe("the identifiers and literals of a flowchart", () => {
  // ast.md, Shared leaf nodes, and ast/flowchart.md: which fields hold an
  // Identifier or a FlowchartLiteral, and of which units it is made.

  it("makes each part of an id list an Identifier of its own, and an empty part null", () => {
    expect(
      bodyOf(parseStatements("classDef a,,b fill:#f00\nclass ,A c")),
    ).toMatchObject([
      {
        type: "FlowchartClassDefStatement",
        cssClasses: [
          { type: "Identifier", name: "a", range: [22, 23] },
          null,
          { type: "Identifier", name: "b", range: [25, 26] },
        ],
        styles: [{ type: "FlowchartLiteral", value: "fill:#f00" }],
      },
      {
        type: "FlowchartClassStatement",
        ids: [null, { type: "Identifier", name: "A" }],
        cssClass: { type: "Identifier", name: "c" },
      },
    ])
    expect(tokensOf("classDef a,,b fill:#f00")).toEqual([
      ["Keyword", "classDef"],
      ["Identifier", "a"],
      ["Punctuator", ","],
      ["Punctuator", ","],
      ["Identifier", "b"],
      ["RawText", "fill:#f00"],
    ])
  })

  it("keeps the commas in a vertex id, a style id, and the class after `:::`", () => {
    expect(
      bodyOf(parseStatements("A,B:::c,d\nstyle A,B fill:red")),
    ).toMatchObject([
      {
        first: {
          vertices: [
            {
              id: { name: "A,B", range: [13, 16] },
              cssClass: { name: "c,d", range: [19, 22] },
            },
          ],
        },
      },
      { type: "FlowchartStyleStatement", id: { name: "A,B" } },
    ])
  })

  it("splits the click ids at `,`, and makes the callback after `call` and its arguments FlowchartLiterals, and the tooltip a StringLiteral", () => {
    expect(
      bodyOf(parseStatements('click A,,B call f (1, 2) "tip"')),
    ).toMatchObject([
      {
        type: "FlowchartClickCallbackStatement",
        ids: [{ name: "A" }, null, { name: "B" }],
        // Click and callbacks: the callback name keeps the whitespace before
        // its `(`, which mermaid.js passes on as part of the name.
        callback: { type: "FlowchartLiteral", value: "f ", range: [29, 31] },
        arguments: { type: "FlowchartLiteral", value: "1, 2", range: [32, 36] },
        tooltip: { type: "StringLiteral", value: "tip", range: [38, 43] },
      },
    ])
    // The name keeps a line break and the indent before its `(` as it keeps
    // a space, and the arguments keep the whitespace at their ends.
    expect(
      bodyOf(parseStatements("click A call f\n  ( x , y )")),
    ).toMatchObject([
      {
        callback: { value: "f\n  " },
        arguments: { value: " x , y " },
      },
    ])
    expect(tokensOf('click A,,B href "u"')).toEqual([
      ["Keyword", "click"],
      ["Identifier", "A"],
      ["Punctuator", ","],
      ["Punctuator", ","],
      ["Identifier", "B"],
      ["Keyword", "href"],
      ["String", '"u"'],
    ])
    expect(bodyOf(parseStatements('click A "u" "t" _blank'))).toMatchObject([
      {
        type: "FlowchartClickUrlStatement",
        url: { type: "StringLiteral", value: "u" },
        tooltip: { type: "StringLiteral", value: "t" },
        target: "_blank",
      },
    ])
    expect(bodyOf(parseStatements("click A call f()"))).toMatchObject([
      { arguments: null, tooltip: null },
    ])
  })

  it("reads a `click` only at the start of a click statement, which the statement's range starts with", () => {
    // Click and callbacks: `click` is a reserved word; its click context
    // reads the click ids, parted at `click-comma` units.
    expect(bodyOf(parseStatements('click A,B href "u"'))).toMatchObject([
      {
        type: "FlowchartClickUrlStatement",
        ids: [{ name: "A" }, { name: "B" }],
        range: [13, 31],
      },
    ])
    expect(bodyOf(parseStatements('click , href "x"'))).toMatchObject([
      { type: "FlowchartClickUrlStatement", ids: [null, null] },
    ])
    // A `,` of the statement context starts a vertex id.
    expect(bodyOf(parseStatements(",cb"))).toMatchObject([
      {
        type: "FlowchartVertexStatement",
        first: { vertices: [{ id: { name: ",cb" } }] },
      },
    ])
    // A click statement may start where a statement starts, also after `;`
    // or `end` on the same line.
    expect(bodyOf(parseStatements('A;click A href "u"'))).toMatchObject([
      { type: "FlowchartVertexStatement" },
      { type: "FlowchartClickUrlStatement" },
    ])
  })

  it.each([
    ['click A href "u" click "tip"', [30, 35]],
    ['click "" click A href "x"', [13, 18]],
    ['click "" A-->B', [13, 18]],
    ['A-->B click ""', [19, 24]],
    ['A:click "" b-->C', [15, 20]],
    ['style A fill:red click "" x', [30, 35]],
    ["subgraph click me\nend", [22, 27]],
    ['subgraph click "" y\nend', [22, 27]],
    ['A\nclick A click B href "u"', [23, 28]],
  ])(
    // known-divergences/click-reserved-word.md: a `click` unit that does not
    // start a click statement makes the input rejected, reported at the word
    // `click` (docs/error-positions.md, Known divergences).
    "rejects %j at its `click`, which does not start a click statement",
    (statements, range) => {
      let caught: unknown
      try {
        parseStatements(statements)
      } catch (error) {
        caught = error
      }
      expect(caught).toBeInstanceOf(ParseError)
      expect(caught).toMatchObject({
        message:
          "click is a reserved word: it may only start a click statement",
        range,
      })
    },
  )

  it("makes the numbers of a linkStyle statement NumericLiterals, and the interpolation name an Identifier", () => {
    expect(
      bodyOf(
        parseStatements("A-->B-->C\nlinkStyle 0,1 interpolate basis color:red"),
      ),
    ).toMatchObject([
      {},
      {
        type: "FlowchartLinkStyleStatement",
        indices: [
          { type: "NumericLiteral", value: 0, range: [33, 34] },
          { type: "NumericLiteral", value: 1, range: [35, 36] },
        ],
        interpolate: { type: "Identifier", name: "basis" },
        styles: [{ type: "FlowchartLiteral", value: "color:red" }],
      },
    ])
  })

  it("makes the name and the value of the property of a rect shape Identifiers", () => {
    expect(bodyOf(parseStatements("A[|borders:lt|x]"))).toMatchObject([
      {
        first: {
          vertices: [
            {
              shape: {
                name: "rectangle",
                property: {
                  name: {
                    type: "Identifier",
                    name: "borders",
                    range: [16, 23],
                  },
                  value: { type: "Identifier", name: "lt", range: [24, 26] },
                  range: [16, 26],
                },
              },
            },
          ],
        },
      },
    ])
  })

  it("tells `accDescr:` and `accDescr {` apart, has no value without text, and tells whether a block is closed", () => {
    expect(
      bodyOf(
        parseStatements(
          "accTitle: t\naccDescr: d\naccDescr { e }\naccDescr {  }\naccTitle:",
        ),
      ),
    ).toMatchObject([
      {
        type: "FlowchartAccTitleStatement",
        value: { type: "FlowchartLiteral", value: "t" },
      },
      {
        type: "FlowchartAccDescrStatement",
        value: { type: "FlowchartLiteral", value: "d" },
      },
      {
        type: "FlowchartAccDescrBlockStatement",
        value: { type: "FlowchartLiteral", value: "e" },
        closed: true,
      },
      // Accessibility values: an empty description block where a statement
      // starts is a description block statement without text.
      { type: "FlowchartAccDescrBlockStatement", value: null, closed: true },
      { type: "FlowchartAccTitleStatement", value: null },
    ])
    // It needs no separator, as every description block statement.
    expect(bodyOf(parseStatements("accDescr {} A-->B"))).toMatchObject([
      { type: "FlowchartAccDescrBlockStatement", value: null, closed: true },
      { type: "FlowchartVertexStatement" },
    ])
    expect(bodyOf(parseStatements("accDescr {};A"))).toMatchObject([
      { type: "FlowchartAccDescrBlockStatement", value: null, closed: true },
      { type: "FlowchartEmptyStatement" },
      { type: "FlowchartVertexStatement" },
    ])
    // A block that the text ends inside is not closed. Its value is the text
    // of its range, which ends with its last token.
    expect(bodyOf(parseStatements("accDescr { x"))).toMatchObject([
      {
        type: "FlowchartAccDescrBlockStatement",
        value: { value: "x", range: [24, 25] },
        closed: false,
      },
    ])
    expect(bodyOf(parseStatements("accDescr {"))).toMatchObject([
      { type: "FlowchartAccDescrBlockStatement", value: null, closed: false },
    ])
  })

  it("keeps what the author wrote in a value: entities, attribute quotes, the whitespace after `}`, and line terminators", () => {
    // ast.md, Nodes: the written text is not converted.
    expect(bodyOf(parseStatements("A[a #amp; b]"))).toMatchObject([
      { first: { vertices: [{ shape: { label: { value: "a #amp; b" } } }] } },
    ])
    expect(bodyOf(parseStatements('A[<a href="u">t</a>]'))).toMatchObject([
      {
        first: {
          vertices: [{ shape: { label: { value: '<a href="u">t</a>' } } }],
        },
      },
    ])
    expect(bodyOf(parseStatements("A-- a}  \n b -->B"))).toMatchObject([
      { links: [{ label: { value: "a}  \n b" } }] },
    ])
    expect(bodyOf(parseStatements('A["a\r\nb"]'))).toMatchObject([
      {
        first: {
          vertices: [{ shape: { label: { kind: "string", value: "a\r\nb" } } }],
        },
      },
    ])
    expect(bodyOf(parseStatements('click A href "x#amp;y"'))).toMatchObject([
      { url: { type: "StringLiteral", value: "x#amp;y" } },
    ])
  })

  it("does not separate two styles of a classDef statement at a `,` right after a `\\`", () => {
    // diagrams/flowchart.md, Style, class, and link style statements.
    expect(bodyOf(parseStatements("classDef c fill:x\\,y"))).toMatchObject([
      { styles: [{ type: "FlowchartLiteral", value: "fill:x\\,y" }] },
    ])
    expect(tokensOf("classDef c fill:x\\,y")).toEqual([
      ["Keyword", "classDef"],
      ["Identifier", "c"],
      ["RawText", "fill:x\\,y"],
    ])
    expect(
      bodyOf(parseStatements(`classDef c fill:x\\${DIRECTIVE},y`)),
    ).toMatchObject([{ styles: [{ value: "fill:x\\,y" }] }])
    expect(bodyOf(parseStatements("classDef c fill:x\\ ,y"))).toMatchObject([
      { styles: [{ value: "fill:x\\" }, { value: "y" }] },
    ])
    expect(bodyOf(parseStatements("classDef c fill:x\\, "))).toMatchObject([
      { styles: [{ value: "fill:x\\," }] },
    ])
    expect(() => parse(`${HEADER}classDef c fill:x\\,`)).toThrow(ParseError)
    // In `style` and `linkStyle`, the `,` separates two styles.
    expect(bodyOf(parseStatements("style A fill:x\\,y"))).toMatchObject([
      { styles: [{ value: "fill:x\\" }, { value: "y" }] },
    ])
  })

  it("makes a style that is all whitespace null", () => {
    // ast/flowchart.md, FlowchartStyleStatement.
    const root = parseStatements("style A fill:#f00, ")
    expect(bodyOf(root)).toMatchObject([
      {
        type: "FlowchartStyleStatement",
        range: [13, 31],
        styles: [{ type: "FlowchartLiteral", value: "fill:#f00" }, null],
      },
    ])
  })

  it("reads a string followed by text in a link text and in a subgraph name, with the kind of the string", () => {
    // diagrams/flowchart.md, Links and Subgraphs: `( string |
    // markdown-string | piece ) piece*`.
    expect(bodyOf(parseStatements('A-- "a"b -->B'))).toMatchObject([
      { links: [{ label: { kind: "string", value: "ab" } }] },
    ])
    expect(tokensOf('A-- "a"b -->B')).toEqual([
      ["Identifier", "A"],
      ["Punctuator", "--"],
      ["String", '"a"'],
      ["RawText", "b"],
      ["Punctuator", "-->"],
      ["Identifier", "B"],
    ])
    expect(bodyOf(parseStatements('subgraph "a" b\nend'))).toMatchObject([
      { name: { kind: "string", value: "a b" } },
    ])
    expect(() => parse(`${HEADER}subgraph "a""b"\nend`)).toThrow(ParseError)
  })

  it("gives a label that is all whitespace the range of its units", () => {
    // ast/flowchart.md, FlowchartLabel: the label of `A -->| | B` is the
    // space between the `|`.
    expect(bodyOf(parseStatements("A -->| | B"))).toMatchObject([
      {
        first: { vertices: [{ id: { name: "A" } }] },
        links: [{ label: { kind: "text", value: " ", range: [19, 20] } }],
      },
    ])
  })
})

describe("the flowchart tokens", () => {
  it("keeps `click` inside an id run as part of the subgraph name", () => {
    // `click` is a unit only where a unit starts and whitespace follows it.
    expect(tokensOf("subgraph xclick me\nend")).toEqual([
      ["Keyword", "subgraph"],
      ["RawText", "xclick me"],
      ["Keyword", "end"],
    ])
  })

  it("makes one token of an id of several units, of a style, and of a subgraph name", () => {
    expect(tokensOf("12ab\nA-b\n\u65E5\u672C\u8A9E")).toEqual([
      ["Identifier", "12ab"],
      ["Identifier", "A-b"],
      ["Identifier", "\u65E5\u672C\u8A9E"],
    ])
    expect(tokensOf("style A stroke-width: 2px")).toEqual([
      ["Keyword", "style"],
      ["Identifier", "A"],
      ["RawText", "stroke-width: 2px"],
    ])
    expect(tokensOf("subgraph a b\nend")).toEqual([
      ["Keyword", "subgraph"],
      ["RawText", "a b"],
      ["Keyword", "end"],
    ])
  })

  it("makes the call and the parentheses of a callback tokens of the click statement", () => {
    // Click statements: they are in no field. The arguments may follow a
    // second `call` when the parentheses after the name are empty.
    expect(tokensOf("click A call cb()call (x)")).toEqual([
      ["Keyword", "click"],
      ["Identifier", "A"],
      ["Keyword", "call"],
      ["RawText", "cb"],
      ["Punctuator", "("],
      ["Punctuator", ")"],
      ["Keyword", "call"],
      ["Punctuator", "("],
      ["RawText", "x"],
      ["Punctuator", ")"],
    ])
    expect(bodyOf(parseStatements("click A call cb()call (x)"))).toMatchObject([
      {
        type: "FlowchartClickCallbackStatement",
        callback: { type: "FlowchartLiteral", value: "cb" },
        arguments: { value: "x" },
      },
    ])
    expect(bodyOf(parseStatements("click A call cb()"))).toMatchObject([
      { callback: { value: "cb" }, arguments: null },
    ])
  })

  it.each([
    ['""', "An empty string cannot be written here", [13, 15]],
    ['A[""x]', "An empty string cannot be written here", [15, 17]],
    ['style A fill:""red', "An empty string cannot be written here", [26, 28]],
    ['click ""A href "x"', "An empty string cannot be written here", [19, 21]],
    ["A call ()-->B", "An empty call cannot be written here", [15, 22]],
    ["click A call ()cb", "An empty call cannot be written here", [21, 28]],
    ["call (\n)", "An empty call cannot be written here", [13, 21]],
    [
      "A accDescr {}-->B",
      "An empty description block can only be written where a statement starts or ends",
      [15, 26],
    ],
  ])(
    // known-divergences/tokenless-empty-forms.md: an empty form that no rule
    // takes makes the input rejected, reported at the whole form
    // (docs/error-positions.md, Known divergences).
    "rejects %j at its empty form",
    (statements, message, range) => {
      let caught: unknown
      try {
        parseStatements(statements)
      } catch (error) {
        caught = error
      }
      expect(caught).toBeInstanceOf(ParseError)
      expect(caught).toMatchObject({ message, range })
    },
  )

  it("rejects an empty string after the header keyword at the empty string", () => {
    expect(() => parse('flowchart"" LR\nA')).toThrow(
      expect.objectContaining({
        message: "An empty string cannot be written here",
        range: [9, 11],
      }),
    )
  })

  it("makes the two delimiters of a circle and of a hexagon one token each", () => {
    expect(tokensOf("A((x))\nB{{y}}")).toEqual([
      ["Identifier", "A"],
      ["Punctuator", "(("],
      ["RawText", "x"],
      ["Punctuator", "))"],
      ["Identifier", "B"],
      ["Punctuator", "{{"],
      ["RawText", "y"],
      ["Punctuator", "}}"],
    ])
  })

  it("makes a `;` that the line rule ignores an IgnoredSemicolon token, which cuts a text that it lies inside", () => {
    // `A[x;]`: the `;` is not ignored, and is a character of the label.
    expect(tokensOf("A[x;]")).toEqual([
      ["Identifier", "A"],
      ["Punctuator", "["],
      ["RawText", "x;"],
      ["Punctuator", "]"],
    ])
    // `A[mystyle:#x;]`: the `;` is ignored.
    expect(tokensOf("A[mystyle:#x;]")).toEqual([
      ["Identifier", "A"],
      ["Punctuator", "["],
      ["RawText", "mystyle:#x"],
      ["IgnoredSemicolon", ";"],
      ["Punctuator", "]"],
    ])
    expect(tokensOf("A[my;style:#x;]")).toEqual([
      ["Identifier", "A"],
      ["Punctuator", "["],
      ["RawText", "my;style:#x"],
      ["IgnoredSemicolon", ";"],
      ["Punctuator", "]"],
    ])
  })

  it.each([
    ["an arrow", "A[style:#x] -;-> B"],
    ["an id", "A[style:#x] --> B;b"],
    ["a keyword", "A[style:#x];sub;graph S\nend"],
    ["a delimiter", "A[style:#x]:::c;d"],
    ["a delimiter of two units", "A[style:#x];B(;(c))"],
    [
      "a number of a linkStyle statement",
      "A-->B-->C-->D-->E-->F-->G-->H-->I-->J-->K-->L\nZ[style:#x];linkStyle 1;0 stroke:red",
    ],
  ])(
    "rejects a `;` that the line rule ignores inside %s",
    (_unit, statements) => {
      // common.md, `style` and `classDef` lines: only a text and a string may
      // have an ignored `;` inside them. The error is at the `;`, the last of
      // the line.
      const text = HEADER + statements
      const semicolon = text.lastIndexOf(";")
      let caught: unknown
      try {
        parse(text)
      } catch (error) {
        caught = error
      }
      expect(caught).toBeInstanceOf(ParseError)
      expect(caught).toMatchObject({
        message: "Unexpected ; that the line rule ignores",
        range: [semicolon, semicolon + 1],
      })
    },
  )

  it("gives a label that is all whitespace one token of that whitespace, and the range between its delimiters", () => {
    expect(tokensOf("A[ ]")).toEqual([
      ["Identifier", "A"],
      ["Punctuator", "["],
      ["RawText", " "],
      ["Punctuator", "]"],
    ])
    expect(bodyOf(parseStatements("A[ ]\nB-->| |C"))).toMatchObject([
      {
        first: {
          vertices: [
            { shape: { label: { kind: "text", value: " ", range: [15, 16] } } },
          ],
        },
      },
      { links: [{ label: { kind: "text", value: " ", range: [23, 24] } }] },
    ])
  })
})

describe("flowchart rejections", () => {
  it.each([
    // The statement context reads `end` as a keyword where a unit starts.
    ["A-->1end"],
    // `&` needs whitespace on both sides.
    ["A &B"],
    // Whitespace may not come between an id and its shape.
    ["A [x]"],
    // A label cannot be empty.
    ["A[]"],
    // An arrow at the start of a line continues the statement before it;
    // after the header there is none.
    ["x-->B"],
    // Two runs of content in one string.
    ['A["x"`y`"]'],
  ])("rejects %j with a ParseError", (statements) => {
    expect(() => parse(HEADER + statements)).toThrow(ParseError)
  })

  it("rejects a linkStyle number that names no link, or is written with a leading zero", () => {
    expect(() => parse(`${HEADER}A-->B\nlinkStyle 1 stroke:red`)).toThrow(
      "linkStyle 1 does not name a link that exists",
    )
    expect(() => parse(`${HEADER}A-->B\nlinkStyle 00 stroke:red`)).toThrow(
      "linkStyle 00 does not name a link that exists",
    )
    expect(() => parse(`${HEADER}linkStyle 0 stroke:red\nA-->B`)).toThrow(
      ParseError,
    )
    // `A & B --> C & D` makes four edges.
    parse(`${HEADER}A & B --> C & D\nlinkStyle 3 stroke:red`)
  })

  it("does not reject for the number of edges, which depends on the site configuration", () => {
    // diagrams/flowchart.md, Rejections outside the grammar, Too many
    // edges: mermaid.js rejects more than `maxEdges` edges, 500 by default.
    const statements = Array.from(
      { length: 501 },
      (_, index) => `A${index}-->B${index}`,
    ).join("\n")
    const root = parse(HEADER + statements)
    expect(flowchartEdgeCount(root)).toBe(501)
  })

  it("reports the place of the unit that the grammar cannot read", () => {
    let caught: unknown
    try {
      parse(`${HEADER}A [x]`)
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(ParseError)
    expect(caught).toMatchObject({
      message: "Unexpected token",
      range: [15, 16],
    })
  })

  it.each([
    // Subgraph members: the first member after `hasOwnProperty`, here a
    // vertex id and the name of a nested subgraph.
    [
      `${HEADER}subgraph S\nhasOwnProperty\nA\nend`,
      "A subgraph member follows the member hasOwnProperty",
      [39, 40],
    ],
    [
      `${HEADER}subgraph S\nhasOwnProperty\nsubgraph T\nB\nend\nend`,
      "A subgraph member follows the member hasOwnProperty",
      [48, 49],
    ],
  ])(
    "reports %j at the member after hasOwnProperty",
    (text, message, range) => {
      let caught: unknown
      try {
        parse(text)
      } catch (error) {
        caught = error
      }
      expect(caught).toBeInstanceOf(ParseError)
      expect(caught).toMatchObject({ message, range })
    },
  )

  it.each([
    // A unit that is all whitespace, here the line break after `subgraph`:
    // the empty range at its start.
    [`${HEADER}subgraph\n`, "Unexpected token", [21, 21]],
    // The end of the text: the empty range there, also where the grammar
    // stops at the whitespace that ends the text.
    [`${HEADER}A-->`, "Unexpected end of text", [17, 17]],
    [`${HEADER}style A fill:#f00,`, "Unexpected end of text", [31, 31]],
  ])("reports %j with an empty range", (text, message, range) => {
    let caught: unknown
    try {
      parse(text)
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(ParseError)
    expect(caught).toMatchObject({ message, range })
  })

  it.each([
    // Click and callbacks: the text ends in the click context that a
    // `click` entered, before it read anything: at that `click`.
    [
      `${HEADER}A-->B click`,
      "click has no click id before the end of the text",
      [19, 24],
    ],
    [
      `${HEADER}A-->B click\n`,
      "click has no click id before the end of the text",
      [19, 24],
    ],
    // The text ends in the callback name context: at the `call`.
    [
      `${HEADER}A call cb\nB-->C`,
      "The callback after call has no ( before the end of the text",
      [15, 19],
    ],
    // The text ends in the callback arguments context: at the `(`.
    [
      `${HEADER}A\nclick A call cb(x`,
      "The arguments of the callback have no ) before the end of the text",
      [30, 31],
    ],
  ])(
    "reports %j at what entered the context that the text ends in",
    (text, message, range) => {
      let caught: unknown
      try {
        parse(text)
      } catch (error) {
        caught = error
      }
      expect(caught).toBeInstanceOf(ParseError)
      expect(caught).toMatchObject({ message, range })
    },
  )
})

describe("directives in a flowchart", () => {
  it("reads through a directive between tokens or in whitespace", () => {
    const text = "flowchart LR\nA --> %%{init: {}}%% B\n%%{wrap}%%\nC"
    const root = parse(text)
    expect(problemsOfTree(text, root)).toEqual([])
    expect(root.directives.map((directive) => directive.name)).toEqual([
      "init",
      "wrap",
    ])
    expect(bodyOf(root)).toMatchObject([
      { links: [{ target: { vertices: [{ id: { name: "B" } }] } }] },
      { first: { vertices: [{ id: { name: "C" } }] } },
    ])
  })

  it("cuts a RawText token at a directive and keeps the value of the label", () => {
    // docs/tokens.md, A token that a directive cuts: each piece, with the
    // whitespace next to the directive, which the label reads, is a token,
    // and the directive between them is a `Directive` token; the value does
    // not change.
    const root = parseStatements(`A[x ${DIRECTIVE} y]`)
    expect(root.tokens.slice(2).map((token) => token.value)).toEqual([
      "A",
      "[",
      "x ",
      DIRECTIVE,
      " y",
      "]",
    ])
    expect(bodyOf(root)).toMatchObject([
      {
        first: {
          vertices: [{ shape: { label: { value: "x  y", range: [15, 33] } } }],
        },
      },
    ])
    expect(tokensOf(`A[x${DIRECTIVE}y]`)).toEqual([
      ["Identifier", "A"],
      ["Punctuator", "["],
      ["RawText", "x"],
      ["Directive", DIRECTIVE],
      ["RawText", "y"],
      ["Punctuator", "]"],
    ])
    // A piece that is all whitespace is a token too, as the label reads it.
    expect(tokensOf(`A[x ${DIRECTIVE} ${DIRECTIVE} y]`)).toEqual([
      ["Identifier", "A"],
      ["Punctuator", "["],
      ["RawText", "x "],
      ["Directive", DIRECTIVE],
      ["RawText", " "],
      ["Directive", DIRECTIVE],
      ["RawText", " y"],
      ["Punctuator", "]"],
    ])
  })

  it("cuts a text at a directive, also one that starts with a keyword", () => {
    // diagrams/flowchart.md, Directives inside units: the name text of a
    // subgraph is a text, which a directive may cut.
    expect(tokensOf(`subgraph sty${DIRECTIVE}le x\nend`)).toEqual([
      ["Keyword", "subgraph"],
      ["RawText", "sty"],
      ["Directive", DIRECTIVE],
      ["RawText", "le x"],
      ["Keyword", "end"],
    ])
  })

  it("reads a keyword across a directive, as mermaid.js reads the text without it", () => {
    // The lexer reads the keyword `end` of `en` and `d`, after which the
    // grammar finds no vertex.
    expect(() => parse(`${HEADER}A-->en${DIRECTIVE}d`)).toThrow(
      expect.objectContaining({ message: "Unexpected token" }),
    )
  })

  it("allows a directive between two tokens", () => {
    expect(tokensOf(`A${DIRECTIVE}(x)`)).toEqual([
      ["Identifier", "A"],
      ["Directive", DIRECTIVE],
      ["Punctuator", "("],
      ["RawText", "x"],
      ["Punctuator", ")"],
    ])
    expect(tokensOf(`accTitle${DIRECTIVE}: a ${DIRECTIVE} b`)).toEqual([
      ["Keyword", "accTitle"],
      ["Directive", DIRECTIVE],
      ["Punctuator", ":"],
      ["RawText", "a "],
      ["Directive", DIRECTIVE],
      ["RawText", " b"],
    ])
  })

  it.each([
    ["an id", `A${DIRECTIVE}B-->C`],
    ["an id that starts with a keyword", `style${DIRECTIVE}A-->B`],
    ["an arrow", `A--${DIRECTIVE}>B`],
    ["a keyword", `click A hr${DIRECTIVE}ef "u"`],
    ["a delimiter of two units", `A(${DIRECTIVE}(x))`],
    ["the closing delimiter of two units", `A{{x}${DIRECTIVE}}`],
    ["a delimiter", `A::${DIRECTIVE}:c`],
    ["the start of a data block", `A@${DIRECTIVE}{ shape: rect }`],
    [
      "a number of a linkStyle statement",
      `A-->B-->C-->D-->E-->F-->G-->H-->I-->J-->K-->L\nlinkStyle 1${DIRECTIVE}0 stroke:red`,
    ],
  ])("rejects a directive inside %s", (_unit, statements) => {
    // common.md, A directive is a token boundary: only a text and a string
    // may have a directive inside them. The error is at the directive.
    const text = HEADER + statements
    const directiveStart = text.indexOf(DIRECTIVE)
    let caught: unknown
    try {
      parse(text)
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(ParseError)
    expect(caught).toMatchObject({
      message: "Unexpected directive",
      range: [directiveStart, directiveStart + DIRECTIVE.length],
    })
  })

  it("accepts the same units without the directive", () => {
    expect(
      tokensOf(
        "A-->B-->C-->D-->E-->F-->G-->H-->I-->J-->K-->L\nlinkStyle 10 stroke:red",
      ).at(-2),
    ).toEqual(["Numeric", "10"])
  })

  it("reads the line rule and entities without the directives", () => {
    // common.md, A directive is a token boundary: the line matches the
    // `style` rule across the directive, so its `;` is ignored, and the
    // entity `#quot;` has a directive between two of its characters.
    const styled = parseStatements(`A[mysty${DIRECTIVE}le:#x;]`)
    expect(bodyOf(styled)).toMatchObject([
      { first: { vertices: [{ shape: { label: { value: "mystyle:#x" } } }] } },
    ])
    expect(styled.tokens.slice(2).map((token) => token.value)).toEqual([
      "A",
      "[",
      "mysty",
      DIRECTIVE,
      "le:#x",
      ";",
      "]",
    ])
    const entity = parseStatements(`A[a#qu${DIRECTIVE}ot;b]`)
    expect(bodyOf(entity)).toMatchObject([
      {
        first: {
          vertices: [
            // The value keeps the entity as written; the Db reads it as its
            // placeholder.
            { shape: { label: { value: "a#quot;b", range: [15, 37] } } },
          ],
        },
      },
    ])
    expect(entity.tokens.slice(2).map((token) => token.value)).toEqual([
      "A",
      "[",
      "a#qu",
      DIRECTIVE,
      "ot;b",
      "]",
    ])
    // In a string, the directive inside the entity lies inside the string
    // unit, which it cuts into StringFragment tokens.
    expect(tokensOf(`A["a#qu${DIRECTIVE}ot;b"]`)).toEqual([
      ["Identifier", "A"],
      ["Punctuator", "["],
      ["StringFragment", '"a#qu'],
      ["Directive", DIRECTIVE],
      ["StringFragment", 'ot;b"'],
      ["Punctuator", "]"],
    ])
  })

  it("cuts a string at a comment region, and leaves a directive inside the comment to it", () => {
    // docs/tokens.md, Comment regions in tokens: the token of a string is
    // cut at a comment region into StringFragment tokens, the line feed
    // before the region in the first, and a directive inside the comment
    // has no token of its own.
    expect(tokensOf(`A["a\n%% c ${DIRECTIVE}\nb"]`)).toEqual([
      ["Identifier", "A"],
      ["Punctuator", "["],
      ["StringFragment", '"a\n'],
      ["StringFragment", 'b"'],
      ["Punctuator", "]"],
    ])
  })
})
