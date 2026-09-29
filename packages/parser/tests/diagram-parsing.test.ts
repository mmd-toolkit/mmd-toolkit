import { describe, expect, it } from "vitest"
import type { DiagramAnalysis, DiagramInput } from "../src/diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../src/diagram-parsing.ts"
import { ParseError } from "../src/index.ts"
import type { DiagramPosition } from "../src/diagram-text.ts"
import { SourceLexer } from "../src/source-lexer.ts"

// Expectations come from common.md, Reading a source and A directive is a
// token boundary, and from the promises of `DiagramAnalysis`, which
// `finishDiagram` checks.

/** The input of a diagram whose text is `text`, read from its start. */
function inputOf(text: string): DiagramInput {
  return {
    lexer: new SourceLexer(text, 0),
    frontmatter: null,
    diagramType: "error",
  }
}

/** Finishes the tree of `text` with `analysis`; the body is an ErrorDiagram. */
function finish(
  text: string,
  analysis: Omit<DiagramAnalysis, "comments" | "ignoredSemicolonKindAt">,
) {
  const input = inputOf(text)
  const reader = openDiagramText(input)
  // The reader is read to its end, so that it knows the directives.
  for (let position: DiagramPosition = reader.first(); position !== null;) {
    position = reader.after(position)
  }
  return finishDiagram(
    input,
    reader,
    { ...analysis, comments: [], ignoredSemicolonKindAt: () => "RawText" },
    (place) => ({ type: "ErrorDiagram", ...place }),
  )
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
    const root = finish("ab%%{x}%%cd", {
      units: [{ kind: "RawText", range: [0, 11] }],
      tokens: [{ kind: "RawText", range: [0, 11] }],
    })
    expect(root.tokens.map((token) => [token.type, token.value])).toEqual([
      ["RawText", "ab"],
      ["Directive", "%%{x}%%"],
      ["RawText", "cd"],
    ])
    expect(root.body.range).toEqual([0, 11])
    expect(root.directives.map((directive) => directive.name)).toEqual(["x"])
  })

  it("rejects a directive inside a unit of a kind other than RawText and Identifier", () => {
    expect(() =>
      finish("ab%%{x}%%cd", {
        units: [{ kind: "Keyword", range: [0, 11] }],
        tokens: [{ kind: "Keyword", range: [0, 11] }],
      }),
    ).toThrow(ParseError)
  })

  it.each<
    [string, Omit<DiagramAnalysis, "comments" | "ignoredSemicolonKindAt">]
  >([
    [
      "out of source order",
      {
        units: [],
        tokens: [
          { kind: "RawText", range: [2, 3] },
          { kind: "RawText", range: [0, 1] },
        ],
      },
    ],
    [
      "overlapping",
      {
        units: [
          { kind: "RawText", range: [0, 2] },
          { kind: "RawText", range: [1, 3] },
        ],
        tokens: [],
      },
    ],
    ["empty", { units: [{ kind: "RawText", range: [1, 1] }], tokens: [] }],
    [
      "starting with whitespace",
      { units: [], tokens: [{ kind: "RawText", range: [1, 3] }] },
    ],
    [
      "ending with whitespace",
      { units: [{ kind: "RawText", range: [0, 2] }], tokens: [] },
    ],
  ])("fails as a parser bug on units or tokens %s", (_what, analysis) => {
    expect(() => finish("a b", analysis)).toThrow("mmd-toolkit parser bug")
  })
})
