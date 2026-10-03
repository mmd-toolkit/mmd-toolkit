import { describe, expect, it } from "vitest"
import type { DiagramTokenKind } from "../src/ast.ts"
import type { DiagramAnalysis, DiagramInput } from "../src/diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../src/diagram-parsing.ts"
import { ParseError } from "../src/index.ts"
import type { DiagramPosition } from "../src/diagram-text.ts"
import { SourceLexer } from "../src/source-lexer.ts"

// Expectations come from common.md, Reading a source, A directive is a
// token boundary, and `style` and `classDef` lines, and from the promises
// of `DiagramAnalysis`, which `finishDiagram` checks.

/** The input of a diagram whose text is `text`, read from its start. */
function inputOf(text: string): DiagramInput {
  return {
    lexer: new SourceLexer(text, 0),
    frontmatter: null,
    diagramType: "error",
  }
}

/** Finishes the tree of `text` with the tokens `tokens`; the body is an ErrorDiagram. */
function finish(text: string, tokens: DiagramAnalysis["tokens"]) {
  return finishDiagram(inputOf(text), { tokens, comments: [] }, (place) => ({
    type: "ErrorDiagram",
    ...place,
  }))
}

describe("openDiagramText", () => {
  it("reads the diagram text without its directives, comment regions, and ignored `;`", () => {
    const input = inputOf("a%%{x}%%b\n%% c\nstyle:#d;")
    const reader = openDiagramText(input)
    let read = ""
    for (let position: DiagramPosition = reader.first(); position !== null;) {
      read += String.fromCodePoint(position.codePoint)
      position = reader.after(position)
    }
    expect(read).toBe("ab\nstyle:#d\n")
    expect(reader.directives).toEqual([[1, 8]])
  })
})

describe("finishDiagram", () => {
  it("records the tokens, cut at the directives, and builds the root", () => {
    const root = finish("ab%%{x}%%cd", [{ kind: "RawText", range: [0, 11] }])
    expect(root.tokens.map((token) => [token.type, token.value])).toEqual([
      ["RawText", "ab"],
      ["Directive", "%%{x}%%"],
      ["RawText", "cd"],
    ])
    expect(root.body.range).toEqual([0, 11])
    expect(root.directives.map((directive) => directive.name)).toEqual(["x"])
  })

  it("cuts a String token at a directive inside it into StringFragment tokens", () => {
    const root = finish('"a%%{x}%%b"', [{ kind: "String", range: [0, 11] }])
    expect(root.tokens.map((token) => [token.type, token.value])).toEqual([
      ["StringFragment", '"a'],
      ["Directive", "%%{x}%%"],
      ["StringFragment", 'b"'],
    ])
  })

  it("cuts a RawText token at a `;` that the line rule ignores", () => {
    const root = finish("style:#a;b", [{ kind: "RawText", range: [0, 10] }])
    expect(root.tokens.map((token) => [token.type, token.value])).toEqual([
      ["RawText", "style:#a"],
      ["IgnoredSemicolon", ";"],
      ["RawText", "b"],
    ])
  })

  it.each<DiagramTokenKind>(["Identifier", "Keyword", "Punctuator", "Numeric"])(
    "rejects a directive inside a %s token at the directive",
    (kind) => {
      expect(() => finish("ab%%{x}%%cd", [{ kind, range: [0, 11] }])).toThrow(
        expect.objectContaining({
          constructor: ParseError,
          message: "Unexpected directive",
          range: [2, 9],
        }),
      )
    },
  )

  it.each<DiagramTokenKind>(["Identifier", "Keyword", "Punctuator", "Numeric"])(
    "rejects a `;` that the line rule ignores inside a %s token at the `;`",
    (kind) => {
      expect(() =>
        finish("style:#a;b", [
          { kind: "RawText", range: [0, 7] },
          { kind, range: [7, 10] },
        ]),
      ).toThrow(
        expect.objectContaining({
          constructor: ParseError,
          message: "Unexpected ; that the line rule ignores",
          range: [8, 9],
        }),
      )
    },
  )

  it.each<[string, string, DiagramAnalysis["tokens"]]>([
    [
      "out of source order",
      "a b",
      [
        { kind: "RawText", range: [2, 3] },
        { kind: "RawText", range: [0, 1] },
      ],
    ],
    [
      "overlapping",
      "a b",
      [
        { kind: "RawText", range: [0, 2] },
        { kind: "RawText", range: [1, 3] },
      ],
    ],
    ["empty", "a b", [{ kind: "RawText", range: [1, 1] }]],
    [
      "leaving a character in no token",
      "a b",
      [{ kind: "RawText", range: [0, 1] }],
    ],
    [
      "of a kind that a comment region cuts",
      "a\n%% c\nb",
      [{ kind: "Identifier", range: [0, 8] }],
    ],
  ])("fails as a parser bug on tokens %s", (_what, text, tokens) => {
    expect(() => finish(text, tokens)).toThrow("mmd-toolkit parser bug")
  })
})
