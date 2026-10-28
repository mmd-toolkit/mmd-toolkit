import { describe, expect, it } from "vitest"
import {
  ConvertedText,
  convertedValuesOf,
  readConvertedCharacters,
  readWhitespaceAfterBraceAsLineFeed,
  agentflowPreservesComments,
  readAgentflowCharacters,
} from "../src/db-from-tree/converted-text.ts"
import { loadFixture } from "../src/index.ts"
import type { TreeRoot, TreeToken } from "../src/db-from-tree/tree.ts"

/** A tree of `text` with only the given parts. */
function rootOf(
  text: string,
  parts: {
    readonly tokens?: readonly TreeToken[]
  } = {},
): TreeRoot {
  return {
    type: "Root",
    range: [0, text.length],
    diagramType: "flowchart-v2",
    body: { type: "FlowchartDiagram", range: [0, text.length] },
    frontmatter: null,
    comments: [],
    directives: [],
    tokens: [],
    ...parts,
  }
}

/** The whole converted form of `text` (with the line feed that ends every text). */
function convertedFormOf(text: string, root: TreeRoot = rootOf(text)): string {
  return new ConvertedText(readConvertedCharacters(text, root)).of([
    0,
    text.length + 1,
  ])
}

describe("readConvertedCharacters", () => {
  it("reads each line terminator as a line feed, and the end of the text as one more", () => {
    expect(convertedFormOf("a\r\nb\rc\nd")).toBe("a\nb\nc\nd\n")
  })

  it("reads U+2028 and U+2029 as they are", () => {
    expect(convertedFormOf("a\u2028b\u2029c")).toBe("a\u2028b\u2029c\n")
  })

  it("reads a `\\r` and a `\\n` with a directive between them as two line terminators", () => {
    const text = "a\r%%{wrap}%%\nb"
    expect(convertedFormOf(text, rootOf(text))).toBe("a\n\nb\n")
  })

  it("reads an entity as its placeholder, with an extra mark for digits only", () => {
    expect(convertedFormOf("#amp;")).toBe("ﬂ°amp¶ß\n")
    expect(convertedFormOf("#123;")).toBe("ﬂ°°123¶ß\n")
    expect(convertedFormOf("#12a;")).toBe("ﬂ°12a¶ß\n")
  })

  it("does not read `#`, a character that is no word character, and `;` as an entity", () => {
    expect(convertedFormOf("#+123;")).toBe("#+123;\n")
    expect(convertedFormOf("#amp")).toBe("#amp\n")
    expect(convertedFormOf("#;")).toBe("#;\n")
  })

  it("finds an entity across a directive, and leaves the directive out", () => {
    const text = "#qu%%{init: {}}%%ot;"
    const converted = convertedFormOf(text, rootOf(text))
    expect(converted).toBe("ﬂ°quot¶ß\n")
  })

  it("reads the quotes of a quoted attribute value in an HTML tag as `'`", () => {
    expect(convertedFormOf('<a href="u" b="v">t</a> "x"')).toBe(
      "<a href='u' b='v'>t</a> \"x\"\n",
    )
  })

  it("reads the quotes of a tag that starts on a comment line, as the text is written", () => {
    // `%% <a` starts a tag whose `>` is in the next line.
    const text = '%% <a\nb="c">'
    expect(convertedFormOf(text)).toBe("b='c'>\n")
  })

  it("leaves out a comment region, with the blank lines before the comment", () => {
    const text = "x\n \n  %% c\ny"
    expect(convertedFormOf(text)).toBe("x\ny\n")
  })

  it("keeps a `%%` that is no comment line, as a `%%{` that is no directive is a diagram comment", () => {
    const text = "x\n%%{-\ny"
    expect(convertedFormOf(text)).toBe("x\n%%{-\ny\n")
  })

  it("keeps a diagram comment in the middle of a line", () => {
    const text = "A %% c\nB"
    expect(convertedFormOf(text)).toBe("A %% c\nB\n")
  })

  it("leaves out the `;` that the line rule ignores", () => {
    const text = "A;B"
    const root = rootOf(text, {
      tokens: [{ type: "IgnoredSemicolon", value: ";", range: [1, 2] }],
    })
    expect(convertedFormOf(text, root)).toBe("AB\n")
  })

  it("leaves out the whitespace that the scan takes after a directive that is not closed", () => {
    const text = "A %%{wrap B \n C"
    expect(convertedFormOf(text)).toBe("A C\n")
  })

  it("does not read leading whitespace", () => {
    expect(convertedFormOf(" \n\t A")).toBe("A\n")
  })

  it("reads a character outside the BMP as one character", () => {
    const characters = readConvertedCharacters(
      "a\u{1F600}b",
      rootOf("a\u{1F600}b"),
    )
    expect(characters.map((character) => character.start)).toEqual([0, 1, 3, 4])
  })
})

describe("readWhitespaceAfterBraceAsLineFeed", () => {
  /** The converted form after the flowchart rule. */
  function afterBrace(text: string): string {
    const characters = readWhitespaceAfterBraceAsLineFeed(
      readConvertedCharacters(text, rootOf(text)),
    )
    return new ConvertedText(characters).of([0, text.length + 1])
  }

  it("reads the whitespace after a `}`, up to its last line feed, as one line feed", () => {
    expect(afterBrace("a}  \n  \n  b")).toBe("a}\n  b\n")
    expect(afterBrace("a} \t\nb")).toBe("a}\nb\n")
  })

  it("leaves whitespace without a line feed as it is", () => {
    expect(afterBrace("a}  b")).toBe("a}  b\n")
  })
})

describe("ConvertedText.of", () => {
  it("can revisit ranges and includes every placeholder character at a boundary", () => {
    const converted = new ConvertedText([
      { start: 1, codePoint: 0x61 },
      { start: 1, codePoint: 0x62 },
      { start: 4, codePoint: 0x63 },
      { start: 6, codePoint: 0x64 },
    ])
    expect(converted.of([4, 7])).toBe("cd")
    expect(converted.of([1, 4])).toBe("ab")
    expect(converted.of([1, 1])).toBe("")
    expect(
      converted.of(
        [1, 7],
        [
          [1, 2],
          [6, 7],
        ],
      ),
    ).toBe("c")
    const tokens: TreeToken[] = [
      { type: "RawText", value: "a", range: [1, 2] },
      { type: "RawText", value: "c", range: [4, 5] },
      { type: "RawText", value: "d", range: [6, 7] },
    ]
    expect(converted.ofTokensIn([4, 7], tokens)).toBe("cd")
    expect(converted.ofTokensIn([1, 4], tokens)).toBe("ab")
    expect(converted.ofTokensIn([1, 7], [tokens[2], tokens[0]])).toBe("dab")
  })

  it("gives the characters read from inside the range, without the left out ranges", () => {
    const text = '"ab"'
    const converted = new ConvertedText(
      readConvertedCharacters(text, rootOf(text)),
    )
    expect(converted.of([0, 4])).toBe('"ab"')
    expect(
      converted.of(
        [0, 4],
        [
          [0, 1],
          [3, 4],
        ],
      ),
    ).toBe("ab")
  })
})

describe("Agentflow conversion", () => {
  const sizes = [
    ["comment-default-size-equal", true],
    ["comment-default-size-fallback", false],
    ["comment-default-size-equal-crlf", true],
    ["comment-default-size-above-crlf", false],
    ["comment-default-size-equal-inline-directive", true],
    ["comment-default-size-above-inline-directive", false],
    ["comment-default-size-equal-frontmatter", true],
    ["comment-default-size-above-frontmatter", false],
  ] as const
  for (const [name, preserved] of sizes)
    it(`measures ${name} before comment removal`, async () => {
      const fixture = await loadFixture("agentflow", name)
      const base = rootOf(fixture.input)
      const root: TreeRoot = {
        ...base,
        body: { type: "AgentflowDiagram", range: base.range },
        frontmatter: name.endsWith("frontmatter")
          ? { type: "Frontmatter", range: [0, 16] }
          : null,
      }
      expect(agentflowPreservesComments(fixture.input, root)).toBe(preserved)
      expect(readAgentflowCharacters(fixture.input, root)[0]?.start).toBe(
        fixture.input.indexOf("agentflow-beta"),
      )
    })
  it("folds only line whitespace through the immediately following LF", () => {
    const text = "a} \u2028\t\n \n  b}  c"
    const base = rootOf(text)
    const root = {
      ...base,
      body: { type: "AgentflowDiagram", range: base.range },
    }
    expect(
      new ConvertedText(readAgentflowCharacters(text, root)).of([
        0,
        text.length + 1,
      ]),
    ).toBe("a}\n \n  b}  c\n")
  })
  it("keeps leading whitespace and comment-looking string content below the default limit", () => {
    const text = '  agentflow-beta\nA["a\n%% b\nc"]\n'
    const base = rootOf(text)
    const root = {
      ...base,
      body: { type: "AgentflowDiagram", range: base.range },
    }
    expect(
      new ConvertedText(readAgentflowCharacters(text, root)).of([
        0,
        text.length + 1,
      ]),
    ).toBe(`${text}\n`)
  })
})

describe("convertedValuesOf", () => {
  it("keeps the whole-source tag context when reading separate value ranges", () => {
    const source = 'venn-beta\ntitle <a\nset "b="c">d"\n'
    const readValue = convertedValuesOf(source, rootOf(source), "venn")
    expect(readValue([16, 18], "<a")).toBe("<a")
    expect(readValue([23, 32], 'b="c">d', 1)).toBe("b='c'>d")
    expect(readValue([23, 32], 'b="c">d', 1)).toBe("b='c'>d")
  })

  it("finds a tag before comment removal, even outside the value range", () => {
    const source = 'venn-beta\n%% <a\nset "b="c">d"\n'
    expect(
      convertedValuesOf(source, rootOf(source), "venn")([20, 29], 'b="c">d', 1),
    ).toBe("b='c'>d")
  })

  it("excludes frontmatter from the tag context", () => {
    const source = '---\ntitle: <a\n---\nvenn-beta\nset "b="c">d"\n'
    const start = source.indexOf('"b=')
    const root = rootOf(source)
    const readValue = convertedValuesOf(
      source,
      {
        ...root,
        frontmatter: {
          type: "Frontmatter",
          range: [0, source.indexOf("venn-beta")],
        },
      },
      "venn",
    )
    expect(readValue([start, start + 9], 'b="c">d', 1)).toBe('b="c">d')
  })
})
