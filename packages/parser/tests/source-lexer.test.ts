import { describe, expect, it } from "vitest"
import type { Range } from "../src/ast.ts"
import { isWhitespace } from "../src/character-classes.ts"
import { SPACE } from "../src/code-points.ts"
import { readFrontmatterTrivia } from "../src/frontmatter.ts"
import { LineIndex } from "../src/positions.ts"
import type { PendingToken } from "../src/source-lexer.ts"
import { SourceLexer } from "../src/source-lexer.ts"

/** A lexer over `text` that starts after the frontmatter, as parse() creates it. */
function lexerOf(text: string): SourceLexer {
  const frontmatterTrivia = readFrontmatterTrivia(text, new LineIndex(text))
  return new SourceLexer(text, frontmatterTrivia?.textStart ?? 0)
}

/**
 * Types and source texts of the tokens and comments the lexer holds, in
 * source order; a directive outside every token and comment is a token.
 */
function listed(lexer: SourceLexer): [string, string][] {
  const all: { type: string; range: Range }[] = [
    ...lexer.tokens,
    ...lexer.comments,
  ]
  return all
    .sort((a, b) => a.range[0] - b.range[0])
    .map((entry) => [entry.type, lexer.text.slice(...entry.range)])
}

/**
 * Records `text` the way a diagram without a grammar would: every character
 * of the diagram text that is not whitespace is a `RawText` token of its
 * own, and so is each `;` that the line rule ignores. Returns what the lexer
 * holds afterwards.
 */
function recordEachCharacter(text: string): [string, string][] {
  const lexer = lexerOf(text)
  const tokens: PendingToken[] = []
  let offset = lexer.firstTokenStart()
  while (offset < text.length) {
    const element = lexer.readAt(offset)
    if (element.kind === "character" && element.endOfText) break
    const isToken =
      element.kind === "character" &&
      !isWhitespace(element.text.codePointAt(0) ?? SPACE)
    if (isToken) {
      tokens.push({ kind: "RawText", range: [element.start, element.end] })
    }
    offset = element.end
  }
  lexer.recordTokens(tokens, [], () => "RawText", null)
  return listed(lexer)
}

/** Every character of `characters` as a `RawText` entry of {@link recordEachCharacter}. */
function eachAsText(characters: string): [string, string][] {
  return [...characters].map((character) => ["RawText", character])
}

/**
 * Reads the converted forms of the characters from `offset` until a
 * directive or the end of the source; returns them joined, and where what
 * stopped the reading starts.
 */
function readFrom(
  lexer: SourceLexer,
  offset: number,
): { text: string; end: number } {
  const texts: string[] = []
  let current = offset
  for (;;) {
    const element = lexer.readAt(current)
    if (element.kind === "directive" || element.endOfText) {
      return { text: texts.join(""), end: element.start }
    }
    texts.push(element.text)
    current = element.end
  }
}

// Expectations come from common.md, Reading a source, and ast.md.

describe("SourceLexer constructor", () => {
  it("starts only at an offset within the source, after the frontmatter trivia", () => {
    expect(() => new SourceLexer("ab", 3)).toThrow("outside the source")
    expect(() => new SourceLexer("ab", -1)).toThrow("outside the source")
    const lexer = lexerOf("  ---\n  a\n  ---\n\n  \nx")
    expect(lexer.start).toBe(20)
    expect(lexer.firstTokenStart()).toBe(20)
    expect(() => lexer.readAt(19)).toThrow("before the start")
  })
})

describe("SourceLexer.firstTokenStart", () => {
  it("passes leading whitespace, line terminators, directives, and comment regions", () => {
    // common.md, Leading whitespace.
    expect(lexerOf("  %%{a}%%\n \n%% c\n  x").firstTokenStart()).toBe(19)
    expect(lexerOf(" \n\u2028 ").firstTokenStart()).toBe(4)
    expect(lexerOf("").firstTokenStart()).toBe(0)
  })
})

describe("SourceLexer.readAt", () => {
  it("reads line terminators as `\\n`, attribute quotes as `'`, and entities as placeholders", () => {
    const lexer = lexerOf('A[<a href="u">#amp;\r\nb]')
    expect(readFrom(lexer, 0).text).toBe(
      "A[<a href='u'>\uFB02\u00B0amp\u00B6\u00DF\nb]",
    )
  })

  it("reads the `#` and the `;` of an entity as the opening and the closing of its placeholder, also across a directive", () => {
    // common.md, Entities: entities are found in the text without its
    // directives, so an entity can have a directive between two of its
    // characters; the read reports that directive where it stands.
    const lexer = lexerOf("a#qu%%{d}%%ot;#1;#x")
    expect(lexer.readAt(1)).toEqual({
      kind: "character",
      text: "\uFB02\u00B0",
      start: 1,
      end: 2,
      endOfText: false,
      // The placeholder that the opening starts ends after the `;` at 13.
      placeholderEnd: 14,
    })
    expect(lexer.readAt(2)).toMatchObject({ text: "q", start: 2, end: 3 })
    expect(lexer.readAt(4)).toEqual({ kind: "directive", start: 4, end: 11 })
    expect(lexer.readAt(13)).toMatchObject({
      text: "\u00B6\u00DF",
      start: 13,
      end: 14,
      placeholderEnd: null,
    })
    // A numeric entity, and a `#` that starts no entity.
    expect(lexer.readAt(14)).toMatchObject({ text: "\uFB02\u00B0\u00B0" })
    expect(lexer.readAt(17)).toMatchObject({ text: "#" })
  })

  it("reads through a comment region and an ignored `;`, and reports a directive", () => {
    const lexer = lexerOf('x"a\n%% c\nb"%%{d}%%\nstyle:#e;f')
    expect(readFrom(lexer, 0)).toEqual({ text: 'x"a\nb"', end: 11 })
    expect(lexer.readAt(11)).toEqual({ kind: "directive", start: 11, end: 18 })
    // After the directive, the `;` of the segment `style:#e;f` is ignored.
    expect(readFrom(lexer, 18).text).toBe("\nstyle:#ef")
    // Reading records nothing.
    expect(listed(lexer)).toEqual([])
  })

  it("says where the character after an ignored `;` starts, so that a token can hold the `;`", () => {
    // Before a line terminator.
    expect(lexerOf("style:#f;\nx").readAt(8)).toEqual({
      kind: "character",
      text: "\n",
      start: 9,
      end: 10,
      endOfText: false,
      placeholderEnd: null,
    })
    // Before a directive.
    expect(lexerOf("style:#f;%%{x}%%").readAt(8)).toEqual({
      kind: "directive",
      start: 9,
      end: 16,
    })
    // At the end of the source.
    expect(lexerOf("style:#f;").readAt(8)).toEqual({
      kind: "character",
      text: "\n",
      start: 9,
      end: 9,
      endOfText: true,
      placeholderEnd: null,
    })
    // Between two characters of the same line.
    expect(lexerOf("style:#f;x").readAt(8)).toEqual({
      kind: "character",
      text: "x",
      start: 9,
      end: 10,
      endOfText: false,
      placeholderEnd: null,
    })
  })

  it("reports a directive with its end, so that the reading can go on after it", () => {
    // common.md, A directive is a token boundary.
    const lexer = lexerOf("end%%{a}%%%%{b}%% x")
    expect(lexer.readAt(3)).toEqual({ kind: "directive", start: 3, end: 10 })
    expect(lexer.readAt(10)).toEqual({ kind: "directive", start: 10, end: 17 })
    expect(lexer.readAt(17)).toEqual({
      kind: "character",
      text: " ",
      start: 17,
      end: 18,
      endOfText: false,
      placeholderEnd: null,
    })
  })

  it("reads one more `\\n` after the last character", () => {
    expect(lexerOf("x").readAt(1)).toEqual({
      kind: "character",
      text: "\n",
      start: 1,
      end: 1,
      endOfText: true,
      placeholderEnd: null,
    })
  })

  it("decides a segment that a reading reaches from an earlier line", () => {
    // The `;` of the second segment is ignored although nothing read from
    // the start of that segment.
    expect(readFrom(lexerOf("x\nstyle A:#f;"), 0).text).toBe("x\nstyle A:#f")
  })
})

describe("SourceLexer.recordTokens", () => {
  it("records the tokens with their kinds, source texts, and places, and passes whitespace and line terminators", () => {
    const lexer = lexerOf("\nab c")
    lexer.recordTokens(
      [
        { kind: "Identifier", range: [1, 3] },
        { kind: "Keyword", range: [4, 5] },
      ],
      [],
      () => "Punctuator",
      null,
    )
    expect(lexer.tokens).toEqual([
      {
        type: "Identifier",
        value: "ab",
        range: [1, 3],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 2 } },
      },
      {
        type: "Keyword",
        value: "c",
        range: [4, 5],
        loc: { start: { line: 2, column: 3 }, end: { line: 2, column: 4 } },
      },
    ])
  })

  it("records the comment regions and directives between the tokens", () => {
    expect(recordEachCharacter("x\n\n  %% c\ny")).toEqual([
      ["RawText", "x"],
      ["Comment", "%% c"],
      ["RawText", "y"],
    ])
    // A directive inside a comment has no token.
    expect(recordEachCharacter("%%{a}%% %% c %%{b}%% d\nx")).toEqual([
      ["Directive", "%%{a}%%"],
      ["Comment", "%% c %%{b}%% d"],
      ["RawText", "x"],
    ])
    expect(recordEachCharacter("a%%{x}%%b")).toEqual([
      ["RawText", "a"],
      ["Directive", "%%{x}%%"],
      ["RawText", "b"],
    ])
  })

  it("does not start a comment right after a directive that ends with a line break", () => {
    // The `%%` is still a comment: from the start of the text, only the
    // directive lies before it.
    // The directive ends without the line break that its scan takes.
    expect(recordEachCharacter("%%{init: dark\n%% c\nx")).toEqual([
      ["Directive", "%%{init: dark"],
      ["Comment", "%% c"],
      ["RawText", "x"],
    ])
    // But a `%%` after diagram text and such a directive is not one.
    expect(recordEachCharacter("x %%{init: dark\n%% c")).toEqual([
      ["RawText", "x"],
      ["Directive", "%%{init: dark"],
      ["RawText", "%"],
      ["RawText", "%"],
      ["RawText", "c"],
    ])
  })

  it("treats `\\r\\n` as one line terminator: no comment start lies between its characters", () => {
    expect(recordEachCharacter("x\r\n%% c\r\ny")).toEqual([
      ["RawText", "x"],
      ["Comment", "%% c"],
      ["RawText", "y"],
    ])
    expect(recordEachCharacter("\n---\r\n%% c\n\n---\nerror")).toEqual([
      ...eachAsText("---"),
      ["Comment", "%% c"],
      ...eachAsText("---error"),
    ])
  })

  it("starts a comment region right after U+2028 or U+2029, at the earliest comment start", () => {
    expect(recordEachCharacter("error\u2028  %% c")).toEqual([
      ...eachAsText("error"),
      ["Comment", "%% c"],
    ])
    const lexer = lexerOf("e\u2028 \u2029%% c\nx")
    lexer.recordTokens(
      [
        { kind: "RawText", range: [0, 1] },
        { kind: "RawText", range: [9, 10] },
      ],
      [],
      () => "RawText",
      null,
    )
    expect(lexer.comments.map((comment) => comment.range)).toEqual([[4, 8]])
  })

  it("records an ignored `;` inside the token that goes on after it, and otherwise as a token of its own of the given kind", () => {
    // ast.md, Tokens.
    expect(recordEachCharacter("style A fill:#f00;\nx")).toEqual([
      // With its `;` ignored, `#f00` is no entity, so each character is a
      // token.
      ...eachAsText("styleAfill:#f00"),
      ["RawText", ";"],
      ["RawText", "x"],
    ])
    const inside = lexerOf("style:#f;x")
    inside.recordTokens(
      [{ kind: "RawText", range: [0, 10] }],
      [],
      () => "Punctuator",
      null,
    )
    expect(inside.tokens.map((token) => token.value)).toEqual(["style:#f;x"])
    const alone = lexerOf("style:#f ; x")
    alone.recordTokens(
      [
        { kind: "RawText", range: [0, 8] },
        { kind: "RawText", range: [11, 12] },
      ],
      [],
      () => "Punctuator",
      null,
    )
    expect(alone.tokens.map((token) => [token.type, token.value])).toEqual([
      ["RawText", "style:#f"],
      ["Punctuator", ";"],
      ["RawText", "x"],
    ])
    expect(recordEachCharacter("x\u2028 style A:#f;")).toEqual([
      ...eachAsText("xstyleA:#f"),
      ["RawText", ";"],
    ])
  })

  it("cuts a token at a comment region that it reads through, with a Directive token for the directive before the comment", () => {
    // ast.md, Comment: the pieces of a `String` token are `StringFragment`
    // tokens, the region lies outside them, the directive before the
    // comment's `%%` is a `Directive` token, and the one inside the comment
    // is part of it.
    const text = '"a\n%%{i}%% %% c %%{j}%%\nb"'
    const lexer = lexerOf(text)
    lexer.recordTokens(
      [{ kind: "String", range: [0, text.length] }],
      [],
      () => "RawText",
      null,
    )
    expect(listed(lexer)).toEqual([
      ["StringFragment", '"a'],
      ["Directive", "%%{i}%%"],
      ["Comment", "%% c %%{j}%%"],
      ["StringFragment", 'b"'],
    ])
    expect(
      lexer.directives.map((directive) => text.slice(...directive.range)),
    ).toEqual(["%%{i}%%", "%%{j}%%"])
  })

  it("cuts a token at a directive between two of its characters that are not whitespace", () => {
    // common.md, A directive is a token boundary: each piece, without the
    // whitespace at its ends, is a token of the same kind, and a piece that
    // is all whitespace is no token.
    const text = "ab%%{x}%%cd e %%{y}%% %%{z}%% f"
    const lexer = lexerOf(text)
    lexer.recordTokens(
      [{ kind: "RawText", range: [0, text.length] }],
      [],
      () => "RawText",
      null,
    )
    expect(listed(lexer)).toEqual([
      ["RawText", "ab"],
      ["Directive", "%%{x}%%"],
      ["RawText", "cd e"],
      ["Directive", "%%{y}%%"],
      ["Directive", "%%{z}%%"],
      ["RawText", "f"],
    ])
    // A `;` that the line rule ignores and that no character of a piece
    // follows is a token of its own.
    const semicolon = lexerOf("style:#f; %%{x}%% y")
    semicolon.recordTokens(
      [{ kind: "RawText", range: [0, 19] }],
      [],
      () => "Punctuator",
      null,
    )
    expect(semicolon.tokens.map((token) => [token.type, token.value])).toEqual([
      ["RawText", "style:#f"],
      ["Punctuator", ";"],
      ["Directive", "%%{x}%%"],
      ["RawText", "y"],
    ])
  })

  it("records the tokens only once", () => {
    const lexer = lexerOf("x")
    lexer.recordTokens(
      [{ kind: "RawText", range: [0, 1] }],
      [],
      () => "RawText",
      null,
    )
    expect(() => lexer.recordTokens([], [], () => "RawText", null)).toThrow(
      "the tokens are recorded twice",
    )
  })
})

describe("SourceLexer.recordTokens rejects the tokens that a diagram's parser gets wrong", () => {
  // ast.md, Tokens and Invariants: every character that is not whitespace
  // is in a token, and no token starts or ends with whitespace, a line
  // terminator, a comment region, or an ignored `;`, or holds a directive
  // outside a comment region. A wrong token is a bug of the diagram's
  // parser.

  /** Whether recording `tokens` over `text` fails as a bug of the diagram's parser. */
  function fails(text: string, tokens: readonly PendingToken[]): void {
    expect(() => {
      lexerOf(text).recordTokens(tokens, [], () => "RawText", null)
    }).toThrow("mmd-toolkit parser bug")
  }

  it("rejects a character that is not whitespace and lies in no token", () => {
    fails("ab c", [{ kind: "RawText", range: [0, 2] }])
    fails("ab c", [{ kind: "RawText", range: [1, 2] }])
  })

  it("rejects a token that starts at an ignored `;`", () => {
    fails("style:#f ;x", [
      { kind: "RawText", range: [0, 8] },
      { kind: "RawText", range: [9, 11] },
    ])
  })

  it.each([
    ["ends with whitespace", "x \r\n%% c\ny", 2],
    ["ends with a line terminator", "x \r\n%% c\ny", 4],
    ["ends with a comment region", "x \r\n%% c\ny", 9],
    ["ends inside a comment region", '"a\n%% c\nb"', 5],
    ["ends with an ignored `;`", "style:#f;\nx", 9],
    ["ends inside a surrogate pair", "a\uD83D\uDE00b", 2],
    ["ends inside `\\r\\n`", '"a\r\nb"', 3],
    ["ends after the end of the source", "ab", 5],
  ] as const)("rejects a token that %s", (_what, text, end) => {
    fails(text, [{ kind: "RawText", range: [0, end] }])
  })

  it("rejects tokens that are left when the source ends", () => {
    fails("ab", [
      { kind: "RawText", range: [0, 2] },
      { kind: "RawText", range: [3, 4] },
    ])
  })
})
