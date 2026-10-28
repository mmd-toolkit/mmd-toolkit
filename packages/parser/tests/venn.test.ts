import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { Root, VennDiagram } from "../src/index.ts"
import { ParseError, parse } from "../src/index.ts"

describe("venn fixtures", async () => {
  const fixtures = await loadFixtures("venn")

  /** Parses a fixed corpus input. */
  function rootOf(name: string): Root {
    const fixture = fixtures.find((candidate) => candidate.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return parse(fixture.input)
  }

  /** The venn body of a fixed corpus input. */
  function diagramOf(name: string): VennDiagram {
    const root = rootOf(name)
    if (root.body.type !== "VennDiagram") throw new Error("no venn body")
    return root.body
  }

  it("keeps the subset's written alternatives and empty quoted labels", () => {
    expect(diagramOf("db-form-set-label-size").body[0]).toMatchObject({
      type: "VennSubsetStatement",
      kind: "set",
      sets: [{ type: "Identifier" }],
      label: { type: "VennLabel", kind: "string" },
      size: { type: "NumericLiteral" },
    })
    expect(diagramOf("db-label-empty").body[0]).toMatchObject({
      label: { value: "" },
    })
  })

  it("keeps explicit and implicit text distinct without inferring a parent", () => {
    expect(diagramOf("db-form-text-id").body[0]).toMatchObject({
      type: "VennTextStatement",
      targets: [{ type: "Identifier" }],
      id: { type: "Identifier" },
    })
    expect(diagramOf("db-form-indent-id").body[1]).toMatchObject({
      type: "VennTextStatement",
      targets: null,
      id: { type: "Identifier" },
    })
  })

  it("keeps bare style atoms together as written while preserving their token kinds", () => {
    const root = rootOf("lex-style-adjacent-units")
    expect(root.body).toMatchObject({
      body: [
        {
          type: "VennStyleStatement",
          properties: [{ value: { type: "VennLiteral", value: "1red#abc" } }],
        },
      ],
    })
    expect(
      root.tokens.slice(-3).map((token) => [token.type, token.value]),
    ).toEqual([
      ["Numeric", "1"],
      ["Identifier", "red"],
      ["RawText", "#abc"],
    ])
  })

  it("keeps a swallowed fragment outside its comment", () => {
    const root = rootOf("db-grid-comment-header-line")
    expect((root.body as VennDiagram).body[0]).toMatchObject({
      type: "VennIgnoredText",
      value: "a",
    })
    expect(root.comments[0]?.mark).toBe("%%")
  })

  it("keeps written line terminators, raw numeric spelling, signed zero, and overflow", () => {
    expect(diagramOf("lex-crlf-quoted-value").body[0]).toMatchObject({
      sets: [{ value: "a\r\nb", raw: '"a\r\nb"' }],
    })
    expect(diagramOf("db-text-leading-zeros").body[0]).toMatchObject({
      id: { type: "NumericLiteral", value: 7, raw: "007" },
    })
    expect(diagramOf("db-size-negative-zero").body[0]).toMatchObject({
      size: { value: -0, raw: "-0" },
    })
    expect(diagramOf("db-size-overflow").body[0]).toMatchObject({
      size: { value: Infinity },
    })
    expect(diagramOf("db-size-negative-overflow").body[0]).toMatchObject({
      size: { value: -Infinity },
    })
  })

  it("preserves title padding and whitespace-only bare labels", () => {
    expect(diagramOf("db-title-padding").body[0]).toMatchObject({
      value: { type: "VennLiteral", value: "  padded  " },
    })
    expect(diagramOf("lex-label-bare-whitespace-line").body[0]).toMatchObject({
      label: { kind: "text", value: "\n" },
    })
    const root = rootOf("lex-label-directive-middle")
    expect(
      root.tokens
        .filter((token) => token.type === "StringFragment")
        .map((token) => token.value),
    ).toEqual(['"a', 'b"'])
    expect((root.body as VennDiagram).body[0]).toMatchObject({
      label: { value: "ab" },
    })
  })

  it("allows directives on both sides of a name-list comma", () => {
    const root = rootOf("lex-name-list-comma-directive")
    expect((root.body as VennDiagram).body[0]).toMatchObject({
      targets: [{ name: "A" }, { name: "B" }],
      id: { name: "item" },
    })
    expect(root.tokens.map((token) => [token.type, token.value])).toEqual([
      ["Keyword", "venn-beta"],
      ["Keyword", "text"],
      ["Identifier", "A"],
      ["Directive", "%%{x}%%"],
      ["Punctuator", ","],
      ["Directive", "%%{x}%%"],
      ["Identifier", "B"],
      ["Identifier", "item"],
    ])
  })

  it.each([
    "lex-label-quoted-directive-only",
    "lex-label-quoted-ignored-semicolon-only",
  ])("keeps a quoted label emptied by trivia: %s", (name) => {
    expect(diagramOf(name).body.at(-1)).toMatchObject({
      label: { type: "VennLabel", kind: "string", value: "" },
    })
  })

  it.each([
    ["lex-label-bare-comment-only", "text"],
    ["lex-label-quoted-comment-only", "string"],
  ])("keeps the first LF before a label's comment region: %s", (name, kind) => {
    expect(diagramOf(name).body[0]).toMatchObject({
      label: { kind, value: "\n" },
    })
  })

  it.each([
    ["lex-style-hex-ignored-semicolon", "#abc"],
    ["lex-style-rgb-ignored-semicolon", "#abc rgb(12,3,4)"],
  ])(
    "keeps a selected semicolon as trivia inside a whole color: %s",
    (name, value) => {
      const root = rootOf(name)
      expect((root.body as VennDiagram).body[0]).toMatchObject({
        properties: [{ value: { type: "VennLiteral", value } }],
      })
      expect(
        root.tokens.filter((token) => token.type === "IgnoredSemicolon"),
      ).toHaveLength(1)
    },
  )

  it.each([
    "lex-empty-braces-percent-between-set-and-text",
    "lex-indent-bare-percent-after-blank",
    "lex-indent-indented-empty-braces-after-blank",
  ])(
    "keeps implicit text mode through the specified comment form: %s",
    (name) => {
      expect(diagramOf(name).body.at(-1)).toMatchObject({
        type: "VennTextStatement",
        targets: null,
        id: { name: "item" },
      })
    },
  )

  it.each([
    [
      "gram-indent-after-empty-braces-explicit-id",
      [{ name: "A" }],
      { name: "x" },
    ],
    [
      "gram-indent-after-empty-braces-explicit-string",
      [{ value: "A" }],
      { value: "x" },
    ],
    [
      "gram-indent-after-empty-braces-explicit-target-list",
      [{ name: "A" }, { name: "B" }],
      { name: "x" },
    ],
  ])(
    "disables implicit text at unindented empty braces after an empty line: %s",
    (name, targets, id) => {
      expect(diagramOf(name).body.at(-1)).toMatchObject({
        type: "VennTextStatement",
        targets,
        id,
      })
    },
  )

  it("keeps C4 words in bare venn names and style values", () => {
    expect(diagramOf("div-c4-bare-identifier").body[0]).toMatchObject({
      sets: [{ type: "Identifier", name: "C4Container" }],
    })
    expect(diagramOf("div-c4-bare-style-value").body[0]).toMatchObject({
      properties: [{ value: { type: "VennLiteral", value: "C4Container" } }],
    })
  })

  it.each([
    "gram-name-list-comma-comment-gap",
    "gram-name-list-comma-blank-gap",
    "gram-name-list-comma-crlf-gap",
    "gram-name-list-comma-line-separator",
    "gram-label-bare-directive-only",
    "gram-label-bare-ignored-semicolon-only",
    "div-ignored-semicolon-style-value-number-selected",
    "gram-indent-empty-braces-after-blank",
    "gram-after-set-colon-space",
  ])("rejects the clarified boundary case: %s", (name) => {
    expect(() => rootOf(name)).toThrow(ParseError)
  })

  it("keeps a title colon as text rather than a colon unit", () => {
    expect(diagramOf("db-after-title-colon-space").body[0]).toMatchObject({
      value: { value: "T: " },
    })
  })

  it.each([
    ["gram-unclosed-id", "Unexpected character", [14, 15]],
    ["gram-unclosed-label", "Unexpected character", [15, 16]],
    ["gram-unclosed-style", "Unexpected character", [24, 25]],
    ["gram-header-non-bmp-before-comment", "Unexpected character", [10, 12]],
    ["gram-union-one", "Unexpected token", [22, 23]],
    ["gram-union-unknown", "A union member must name an earlier set", [24, 25]],
    ["gram-size-empty", "Unexpected token", [16, 16]],
    [
      "gram-set-colon-size-unclosed-directive-gap",
      "Unexpected end of text",
      [30, 30],
    ],
  ] as const)("reports %s at its cause", (name, message, range) => {
    expect(() => rootOf(name)).toThrow(
      expect.objectContaining({ constructor: ParseError, message, range }),
    )
  })
})
