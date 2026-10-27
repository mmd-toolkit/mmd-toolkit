import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { KanbanDiagram, Root } from "../src/index.ts"
import { ParseError, parse, visitorKeys } from "../src/index.ts"
import { isWhitespace } from "../src/character-classes.ts"

/** Project invariant 3: exact token text, no overlaps, and no lost nontrivia characters. */
function expectCoverage(text: string, root: Root): void {
  const entries = [...root.tokens, ...root.comments].toSorted(
    (a, b) => a.range[0] - b.range[0],
  )
  let end = 0
  for (const entry of entries) {
    expect(entry.range[0]).toBeGreaterThanOrEqual(end)
    expect(entry.range[1]).toBeGreaterThan(entry.range[0])
    if (entry.type !== "Comment") {
      expect(entry.value).toBe(text.slice(...entry.range))
    } else {
      const written = text.slice(...entry.range)
      // A directive can split the two characters of the comment mark.
      expect(written.endsWith(entry.value)).toBe(true)
    }
    for (const character of text.slice(end, entry.range[0])) {
      expect(isWhitespace(character.codePointAt(0)!)).toBe(true)
    }
    end = entry.range[1]
  }
  for (const character of text.slice(end)) {
    expect(isWhitespace(character.codePointAt(0)!)).toBe(true)
  }
}

describe("kanban fixtures", async () => {
  const fixtures = await loadFixtures("kanban")

  /** Parses one fixed corpus input and returns its kanban body. */
  function diagramOf(name: string): KanbanDiagram {
    const fixture = fixtures.find((candidate) => candidate.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    const root = parse(fixture.input)
    if (root.body.type !== "KanbanDiagram") throw new Error("no kanban body")
    return root.body
  }

  it("puts cards directly under columns while retaining assigned indentation and descendant ranges", () => {
    const body = diagramOf("lex-indent-directive").body
    expect(body).toMatchObject([
      {
        indent: 1,
        id: { value: "S" },
        range: [8, 28],
        children: [
          { indent: 3, id: { value: "A" }, range: [27, 28], children: [] },
        ],
      },
    ])
    expect(diagramOf("db-indent-deeper").body).toMatchObject([
      {
        indent: 1,
        id: { value: "S" },
        children: [
          { indent: 3, id: { value: "A" }, children: [] },
          { indent: 5, id: { value: "B" }, children: [] },
          { indent: 3, id: { value: "C" }, children: [] },
        ],
      },
    ])
    expect(diagramOf("db-indent-shallower-last").body).toMatchObject([
      {
        indent: 4,
        range: [11, 16],
        children: [{ indent: 2, range: [15, 16], children: [] }],
      },
    ])
    expect(
      diagramOf("gram-nesting-item-decoration-before-deeper-item").body,
    ).toMatchObject([
      {
        range: [8, 32],
        children: [
          {
            id: { value: "A" },
            range: [13, 25],
            decorations: [{ icon: { value: "x" } }],
            children: [],
          },
          {
            id: { value: "B" },
            range: [31, 32],
            decorations: [],
            children: [],
          },
        ],
      },
    ])
    expect(visitorKeys.KanbanNode).toEqual([
      "id",
      "shape",
      "data",
      "decorations",
      "children",
    ])
  })

  it("keeps each adjacent data block and its written value", () => {
    const node = diagramOf("db-metadata-two-items").body[0].children[0]
    expect(node.data.map((data) => [data.value, data.range])).toEqual([
      ["ticket: X,", [14, 27]],
      ["assigned: Ada", [27, 43]],
    ])
    expect(node.range).toEqual([13, 43])
    expect(
      diagramOf("db-metadata-directive").body[0].children[0].data[0].value,
    ).toBe("assigned: Ada")
  })

  it("keeps written CRLF inside a quoted label and its delimiters in its range", () => {
    const label = diagramOf("lex-string-crlf").body[0].shape?.label
    expect(label).toMatchObject({
      kind: "string",
      value: "a\r\nb",
      range: [11, 17],
    })
    expect(label?.loc).toEqual({
      start: { line: 2, column: 3 },
      end: { line: 3, column: 2 },
    })
  })

  it("keeps mismatched shape delimiters as written", () => {
    expect(diagramOf("db-shape-mismatched").body[0].shape).toMatchObject({
      opener: "[",
      closer: ")",
      label: { kind: "text", value: "Todo" },
    })
  })

  it("leaves an ignored semicolon out of the value and cuts a String token", () => {
    const fixture = fixtures.find(
      (candidate) => candidate.name === "lex-label-style-rule",
    )!
    const root = parse(fixture.input)
    expect(root.tokens.map((token) => [token.type, token.value])).toEqual([
      ["Keyword", "kanban"],
      ["RawText", "S"],
      ["RawText", "A"],
      ["Punctuator", "["],
      ["StringFragment", '"astyle:#x'],
      ["IgnoredSemicolon", ";"],
      ["StringFragment", 'yb"'],
      ["Punctuator", "]"],
    ])
    expect(
      diagramOf("lex-label-style-rule").body[0].children[0].shape?.label.value,
    ).toBe("astyle:#xyb")
  })

  it.each([
    ["header-only", "The header cannot end the text", [0, 6]],
    [
      "gram-indent-shallower-followed",
      "A node cannot follow a node less indented than the first",
      [21, 22],
    ],
    [
      "gram-unclosed-shape",
      "The shape has no closer before the end of the text",
      [9, 10],
    ],
    [
      "gram-unclosed-icon",
      "The icon has no ) before the end of the text",
      [11, 18],
    ],
    [
      "gram-metadata-unclosed",
      "The data block has no } before the end of the text",
      [14, 16],
    ],
  ] as const)("reports %s at its cause", (name, message, range) => {
    const fixture = fixtures.find((candidate) => candidate.name === name)!
    try {
      parse(fixture.input)
    } catch (error) {
      expect(error).toBeInstanceOf(ParseError)
      expect((error as ParseError).message).toBe(message)
      expect((error as ParseError).range).toEqual(range)
      return
    }
    throw new Error("expected a rejection")
  })

  for (const fixture of fixtures) {
    it(fixture.name, () => {
      let root: Root | null = null
      try {
        root = parse(fixture.input)
      } catch (error) {
        if (!(error instanceof ParseError)) throw error
      }
      if (root !== null) {
        expect(root.diagramType).toBe(
          fixture.specified?.accepted === true
            ? fixture.specified.diagramType
            : fixture.expected.accepted
              ? fixture.expected.diagramType
              : "kanban",
        )
        expectCoverage(fixture.input, root)
      }
    })
  }
})
