import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { NODE_FIELDS } from "../src/check-tree/node-fields.ts"
import { DATA_BLOCK_NODE_TYPES } from "../src/check-tree/node-types.ts"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import {
  SHAPE_CONTENT_TYPES,
  shapeOf,
  shapeSourceOf,
} from "../src/fixture-shapes.ts"
import type { ShapeSource, ShapeToken } from "../src/fixture-shapes.ts"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot, loadFixtures } from "../src/index.ts"

// docs/maintaining-fixtures.md, Choosing inputs by shape: two texts of one
// shape differ only in what the author named, as far as the names are the same
// ones or other ones.

const DIAGRAMS: readonly DiagramType[] = [
  "common",
  "flowchart",
  "sequence",
  "class",
  "state",
]

const LS = String.fromCharCode(0x2028)
const BOM = String.fromCharCode(0xfeff)

/**
 * The tokens of `text` that a test names: each `[type, value]` is found, in
 * order, after the one before it.
 */
function tokensOf(
  text: string,
  ...named: readonly (readonly [type: string, value: string])[]
): ShapeToken[] {
  let from = 0
  return named.map(([type, value]) => {
    const start = text.indexOf(value, from)
    if (start === -1) throw new Error(`no ${JSON.stringify(value)} in the text`)
    from = start + value.length
    return { type, value, range: [start, start + value.length] }
  })
}

/** The shape source of `text` with the named tokens, and the ranges that stay as written. */
function sourceOf(
  text: string,
  tokens: readonly (readonly [type: string, value: string])[],
  writtenRanges: ShapeSource["writtenRanges"] = [],
): ShapeSource {
  return { tokens: tokensOf(text, ...tokens), writtenRanges }
}

/** The shape of the flowchart text `A-->B` with two names. */
function edge(from: string, to: string): string {
  const text = `flowchart LR\n  ${from}-->${to}\n`
  return shapeOf(
    text,
    sourceOf(text, [
      ["Keyword", "flowchart"],
      ["Keyword", "LR"],
      ["Identifier", from],
      ["Punctuator", "-->"],
      ["Identifier", to],
    ]),
  )
}

describe("the shape of a text", () => {
  it("numbers the names as they first appear: a spelling goes, whether two names are one stays", () => {
    expect(edge("A", "B")).toBe(edge("Start", "End2"))
    expect(edge("A", "A")).toBe(edge("Start", "Start"))
    expect(edge("A", "B")).not.toBe(edge("A", "A"))
    expect(JSON.parse(edge("A", "B"))).toEqual([
      ["Keyword", "flowchart"],
      " ",
      ["Keyword", "LR"],
      "\n  ",
      ["Identifier", "a1"],
      ["Punctuator", "-->"],
      ["Identifier", "a2"],
      "\n",
    ])
  })

  it("numbers the runs of digits apart from the words", () => {
    const text = "x 12 12 y 7"
    const shape = JSON.parse(
      shapeOf(text, sourceOf(text, [["RawText", text]])),
    ) as [string, string][]
    expect(shape[0]?.[1]).toBe("a1 0_1 0_1 a2 0_2")
  })

  it("keeps a word, an arrow, and a number as written, and a string apart from a name", () => {
    const o = "A --o B"
    const x = "A --x B"

    /** The shape of `A`, an arrow of the mark `mark`, and `B`. */
    function arrow(text: string, mark: string): string {
      return shapeOf(
        text,
        sourceOf(text, [
          ["Identifier", "A"],
          ["Punctuator", mark],
          ["Identifier", "B"],
        ]),
      )
    }

    expect(arrow(o, "--o")).not.toBe(arrow(x, "--x"))
    const zero = "linkStyle 0 x"
    const five = "linkStyle 5 x"
    expect(
      shapeOf(
        zero,
        sourceOf(zero, [
          ["Keyword", "linkStyle"],
          ["Numeric", "0"],
        ]),
      ),
    ).not.toBe(
      shapeOf(
        five,
        sourceOf(five, [
          ["Keyword", "linkStyle"],
          ["Numeric", "5"],
        ]),
      ),
    )
    const lower = "direction lr"
    const upper = "direction LR"
    expect(
      shapeOf(
        lower,
        sourceOf(lower, [
          ["Keyword", "direction"],
          ["Keyword", "lr"],
        ]),
      ),
    ).not.toBe(
      shapeOf(
        upper,
        sourceOf(upper, [
          ["Keyword", "direction"],
          ["Keyword", "LR"],
        ]),
      ),
    )
    const string = 'state "d"'
    const name = "state d"
    expect(
      shapeOf(
        string,
        sourceOf(string, [
          ["Keyword", "state"],
          ["String", '"d"'],
        ]),
      ),
    ).not.toBe(
      shapeOf(
        name,
        sourceOf(name, [
          ["Keyword", "state"],
          ["Identifier", "d"],
        ]),
      ),
    )
  })

  it("keeps what lies outside the tokens as written: whitespace, `;`, separators, comments, line breaks", () => {
    const shapes = [
      "A B",
      "A  B",
      "A;B",
      `A${LS}B`,
      "A%% c\nB",
      "A#c\nB",
      "A\nB",
      "A\r\nB",
      "A\rB",
    ].map((text) => {
      const a = text.indexOf("A")
      const b = text.lastIndexOf("B")
      return shapeOf(text, {
        tokens: [
          { type: "Identifier", value: "A", range: [a, a + 1] },
          { type: "Identifier", value: "B", range: [b, b + 1] },
        ],
        writtenRanges: [],
      })
    })
    expect(new Set(shapes).size).toBe(shapes.length)
  })

  it("keeps the characters that are not letters or digits in a token, so the `;` of an entity shows", () => {
    // `as A style:#f00;` has an ignored `;`, and `as A classDef:#x; ;` has a `;` inside a run of text.
    const style = "x style:#f00;  "
    const entity = "x classDef:#x; ;  "
    const first = shapeOf(
      style,
      sourceOf(style, [
        ["Identifier", "x"],
        ["RawText", "style"],
        ["Punctuator", ":"],
        ["RawText", "#f00"],
        ["IgnoredSemicolon", ";"],
        ["RawText", "  "],
      ]),
    )
    const second = shapeOf(
      entity,
      sourceOf(entity, [
        ["Identifier", "x"],
        ["RawText", "classDef"],
        ["Punctuator", ":"],
        ["RawText", "#x; ;  "],
      ]),
    )
    expect(first).not.toBe(second)
    expect(JSON.parse(second)).toContainEqual(["RawText", "#a1; ;  "])
  })

  it("tells where a token ends: the line break that a name takes, and one that follows it", () => {
    // Only the end of a subgraph name that is `end` takes the line break
    // after it (the name token is `a end` and the line break, or `a pend`).
    const taken = "subgraph a end\n;"
    const left = "subgraph a pend\n;"
    expect(
      shapeOf(
        taken,
        sourceOf(taken, [
          ["Keyword", "subgraph"],
          ["RawText", "a end\n"],
          ["Punctuator", ";"],
        ]),
      ),
    ).not.toBe(
      shapeOf(
        left,
        sourceOf(left, [
          ["Keyword", "subgraph"],
          ["RawText", "a pend"],
          ["Punctuator", ";"],
        ]),
      ),
    )
  })

  it("keeps the run of text after `box`, which is a colour or a name, and no other", () => {
    /** The shape of `box` and a run of text. */
    function box(text: string, word: string): string {
      return shapeOf(
        text,
        sourceOf(text, [
          ["Keyword", "box"],
          ["RawText", word],
        ]),
      )
    }

    expect(box("box red", "red")).toBe(
      JSON.stringify([["Keyword", "box"], " ", ["RawText", "red"]]),
    )
    expect(box("box red", "red")).not.toBe(box("box team", "team"))
    const upper = "BOX red"
    expect(
      shapeOf(
        upper,
        sourceOf(upper, [
          ["Keyword", "BOX"],
          ["RawText", "red"],
        ]),
      ),
    ).toBe(JSON.stringify([["Keyword", "BOX"], " ", ["RawText", "red"]]))

    /** The shape of `participant` and a run of text. */
    function participant(text: string, word: string): string {
      return shapeOf(
        text,
        sourceOf(text, [
          ["Keyword", "participant"],
          ["RawText", word],
        ]),
      )
    }

    expect(participant("participant red", "red")).toBe(
      participant("participant team", "team"),
    )
  })

  it("keeps the runs of text of a linkStyle statement, where `fill` decides whether `fill:none` is added", () => {
    /** The shape of a `linkStyle` statement with the run of text `style`, and what follows. */
    function statement(style: string, after: string): string {
      const text = `linkStyle 0 ${style}\n${after}`
      const start = text.lastIndexOf(after)
      return shapeOf(text, {
        tokens: [
          ...tokensOf(
            text,
            ["Keyword", "linkStyle"],
            ["Numeric", "0"],
            ["RawText", style],
          ),
          {
            type: "RawText",
            value: after,
            range: [start, start + after.length],
          },
        ],
        writtenRanges: [],
      })
    }

    expect(statement("fill:red", "A")).not.toBe(statement("color:red", "A"))
    // After the end of the statement, a run of text is a name again.
    expect(statement("fill:red", "A")).toBe(statement("fill:red", "B"))
  })

  it("keeps the id of a state that makes no node, which is in a set of values", () => {
    /** The shape of a state with the id `id` and the pseudostate `<<fork>>`. */
    function fork(id: string): string {
      const text = `state ${id} <<fork>>\nX`
      return shapeOf(
        text,
        sourceOf(text, [
          ["Keyword", "state"],
          ["RawText", id],
          ["Keyword", "<<fork>>"],
          ["Identifier", "X"],
        ]),
      )
    }

    expect(fork("</join></fork>")).not.toBe(fork("</x></fork>"))
    expect(fork("</choice>")).not.toBe(fork("</x>"))
    // Another id is a name like any other.
    expect(fork("</x></fork>")).toBe(fork("</y></fork>"))
  })

  it("keeps every token in a written range as written, where the words are values", () => {
    // The tree gives the ranges, so a `}` in a directive in a data block, and a
    // byte order mark before the frontmatter, do not matter.
    const text = "participant A@{ type: %%{init: {}}%% actor }\nparticipant B\n"
    const tokens: [string, string][] = [
      ["Keyword", "participant"],
      ["RawText", "A"],
      ["Punctuator", "@{"],
      ["RawText", " type: "],
      ["Directive", "%%{init: {}}%%"],
      ["RawText", " actor "],
      ["Punctuator", "}"],
      ["Keyword", "participant"],
      ["RawText", "B"],
    ]
    const start = text.indexOf("@{")
    const end = text.indexOf("}\n") + 1
    const written = shapeOf(text, sourceOf(text, tokens, [[start, end]]))
    expect(JSON.parse(written)).toContainEqual(["RawText", " actor "])
    const boundary = text.replace(" actor ", " boundary ")
    const otherTokens = tokens.map(([type, value]): [string, string] => [
      type,
      value === " actor " ? " boundary " : value,
    ])
    expect(
      shapeOf(boundary, sourceOf(boundary, otherTokens, [[start, end + 3]])),
    ).not.toBe(written)
    // Not in a written range, the words go.
    expect(shapeOf(text, sourceOf(text, tokens))).toBe(
      shapeOf(boundary, sourceOf(boundary, otherTokens)),
    )
    const frontmatter = `${BOM}---\ntitle: x\n---\nflowchart LR\nA\n`
    const frontTokens: [string, string][] = [
      ["Punctuator", "---"],
      ["RawText", "title: x"],
      ["Punctuator", "---"],
      ["Keyword", "flowchart"],
      ["Keyword", "LR"],
      ["Identifier", "A"],
    ]
    const frontEnd = frontmatter.indexOf("---\nflowchart") + 3
    const kept = shapeOf(
      frontmatter,
      sourceOf(frontmatter, frontTokens, [[1, frontEnd]]),
    )
    expect(JSON.parse(kept)).toContainEqual(["RawText", "title: x"])
  })

  it("numbers the fragments that a directive cuts out of one name together", () => {
    // `a%%{init: {}}%%b --> ab` is one class `ab`; `--> cd` is another.

    /** The shape of a cut name, an arrow, and the name `second`. */
    function names(second: string): string {
      const text = `a%%{init: {}}%%b --> ${second}`
      return shapeOf(
        text,
        sourceOf(text, [
          ["RawText", "a"],
          ["Directive", "%%{init: {}}%%"],
          ["RawText", "b"],
          ["Punctuator", "-->"],
          ["RawText", second],
        ]),
      )
    }

    expect(names("ab")).not.toBe(names("cd"))
    expect(names("cd")).toBe(names("xy"))
    expect(names("ab")).not.toBe(names("a"))
    // A run that a cut lies in is labelled once, in the fragment where it starts.
    expect(JSON.parse(names("ab"))).toEqual([
      ["RawText", "a1"],
      ["Directive", "%%{init: {}}%%"],
      ["RawText", ""],
      " ",
      ["Punctuator", "-->"],
      " ",
      ["RawText", "a1"],
    ])
  })

  it("is the text with its names numbered when there is no source", () => {
    expect(shapeOf("A-->B", null)).toBe("a1-->a2")
    expect(shapeOf("A-->B", null)).toBe(shapeOf("Start-->End2", null))
    expect(shapeOf("A-->A", null)).not.toBe(shapeOf("A-->B", null))
  })
})

describe("the shape source of a recorded tree", () => {
  it("has the range of the frontmatter, and of each data block, as the tree gives them", async () => {
    let frontmatters = 0
    let dataBlocks = 0
    for (const diagram of DIAGRAMS) {
      for (const fixture of await loadFixtures(diagram)) {
        const file = path.join(
          getFixturesRoot(),
          diagram,
          fixture.name,
          "ast.json",
        )
        if (!existsSync(file)) continue
        const tree = JSON.parse(readFileSync(file, "utf8")) as CheckedRoot
        const { tokens, writtenRanges } = shapeSourceOf(tree)
        expect(tokens).toBe(tree.tokens)
        for (const [start, end] of writtenRanges) {
          const written = fixture.input.slice(start, end)
          if (written.startsWith("@{")) dataBlocks++
          else {
            frontmatters++
            expect(written, fixture.name).toContain("---")
          }
        }
      }
    }
    expect(frontmatters).toBeGreaterThan(0)
    expect(dataBlocks).toBeGreaterThan(0)
  }, 120_000)
})

describe("the data block node types of the shape", () => {
  it("are the headings of the data blocks in the specification's AST documents", () => {
    const directory = path.join(
      import.meta.dirname,
      "..",
      "..",
      "spec",
      "docs",
      "ast",
    )
    const headings = new Set<string>()
    for (const file of readdirSync(directory)) {
      if (!file.endsWith(".md") || file.endsWith(".ja.md")) continue
      for (const line of readFileSync(path.join(directory, file), "utf8").split(
        "\n",
      )) {
        if (line.startsWith("### ") && line.endsWith("DataBlock")) {
          headings.add(line.slice(4).trim())
        }
      }
    }
    expect([...headings].sort()).toEqual([...DATA_BLOCK_NODE_TYPES].sort())
    for (const type of DATA_BLOCK_NODE_TYPES) {
      expect(NODE_FIELDS[type], type).toBeDefined()
    }
  })
})

describe("the token types of the shape", () => {
  it("are, in every recorded tree, one that holds what the author names or one that is kept as written", async () => {
    const kept = new Set([
      "Keyword",
      "Punctuator",
      "Numeric",
      "Directive",
      "IgnoredSemicolon",
    ])
    const unknown = new Set<string>()
    for (const diagram of DIAGRAMS) {
      for (const fixture of await loadFixtures(diagram)) {
        const file = path.join(
          getFixturesRoot(),
          diagram,
          fixture.name,
          "ast.json",
        )
        if (!existsSync(file)) continue
        const tree = JSON.parse(readFileSync(file, "utf8")) as {
          tokens: { type: string }[]
        }
        for (const token of tree.tokens) {
          if (!kept.has(token.type) && !SHAPE_CONTENT_TYPES.has(token.type)) {
            unknown.add(token.type)
          }
        }
      }
    }
    expect([...unknown]).toEqual([])
  }, 120_000)
})
