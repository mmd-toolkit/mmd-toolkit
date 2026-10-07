import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { TreeProblem } from "../src/check-tree/types.ts"
import { directiveOf, handMadeRoot } from "./check-tree-trees.ts"
import type { Piece } from "./check-tree-trees.ts"

// parser/docs/tokens.md, A token that a directive cuts: which tokens a
// directive or an ignored `;` between two tokens shows to be the fragments of
// one token, and which it leaves as two units. The trees are made by hand, in
// the body of a flowchart.

const DIRECTIVE = "%%{init: {}}%%"

/** The problems of the tree of `source` with `tokens`, and the directive that `source` holds if it holds it, whose message contains `part`. */
function problemsSaying(
  source: string,
  tokens: readonly (readonly [string, Piece | string])[],
  part: string,
): TreeProblem[] {
  const root = handMadeRoot(source, {
    bodyType: "FlowchartDiagram",
    tokens,
    directives: source.includes(DIRECTIVE)
      ? [directiveOf(source, DIRECTIVE)]
      : [],
  })
  return checkTree(source, root).filter((problem) =>
    problem.message.includes(part),
  )
}

describe("checkTree: the tokens that a cut makes fragments of one token", () => {
  it("reports a Keyword that a `;` cuts, and one in upper case", () => {
    expect(
      problemsSaying(
        "sub;graph",
        [
          ["Keyword", "sub"],
          ["IgnoredSemicolon", ";"],
          ["Keyword", "graph"],
        ],
        "token is cut",
      ),
    ).toEqual([
      {
        where: "Keyword at 4-9",
        message:
          "a Keyword token is cut: Keyword at 0-3 and this are its fragments",
      },
    ])
    expect(
      problemsSaying(
        `SUB${DIRECTIVE}GRAPH`,
        [
          ["Keyword", "SUB"],
          ["Directive", DIRECTIVE],
          ["Keyword", { text: "GRAPH", from: 3 + DIRECTIVE.length }],
        ],
        "token is cut",
      ),
    ).toEqual([
      {
        where: `Keyword at ${3 + DIRECTIVE.length}-${8 + DIRECTIVE.length}`,
        message:
          "a Keyword token is cut: Keyword at 0-3 and this are its fragments",
      },
    ])
  })

  it("reports an Identifier that a directive and a `;` cut, whichever comes first", () => {
    for (const [source, cuts] of [
      [
        `ab${DIRECTIVE};cd`,
        [
          ["Directive", DIRECTIVE],
          ["IgnoredSemicolon", ";"],
        ],
      ],
      [
        `ab;${DIRECTIVE}cd`,
        [
          ["IgnoredSemicolon", ";"],
          ["Directive", DIRECTIVE],
        ],
      ],
    ] as const) {
      const problems = problemsSaying(
        source,
        [
          ["Identifier", "ab"],
          ...cuts,
          ["Identifier", { text: "cd", from: source.length - 2 }],
        ],
        "token is cut",
      )
      expect(problems).toEqual([
        {
          where: `Identifier at ${source.length - 2}-${source.length}`,
          message:
            "a Identifier token is cut: Identifier at 0-2 and this are its fragments",
        },
      ])
    }
  })

  it("does not report an Identifier next to a Keyword that a cut separates", () => {
    // The two are different kinds, so they are two units.
    expect(
      problemsSaying(
        `ab${DIRECTIVE}cd`,
        [
          ["Identifier", "ab"],
          ["Directive", DIRECTIVE],
          ["Keyword", { text: "cd", from: 2 + DIRECTIVE.length }],
        ],
        "token is cut",
      ),
    ).toEqual([])
  })

  it("reports a String that does not start with a quote or is not closed where a cut follows", () => {
    // `ab` is no string at all, and the string `"a` is open.
    expect(
      problemsSaying(
        `ab${DIRECTIVE}b"`,
        [
          ["String", "ab"],
          ["Directive", DIRECTIVE],
          ["StringFragment", { text: 'b"', from: 2 + DIRECTIVE.length }],
        ],
        "a String token",
      ),
    ).toEqual([
      {
        where: "String at 0-2",
        message: 'a String token does not start with a quote: "ab"',
      },
      {
        where: "String at 0-2",
        message:
          'a String token that a cut is glued to is not closed: "ab" and StringFragment at 16-18 are the fragments of one string',
      },
    ])
    expect(
      problemsSaying(
        `"a${DIRECTIVE}b"`,
        [
          ["String", '"a'],
          ["Directive", DIRECTIVE],
          ["StringFragment", { text: 'b"', from: 2 + DIRECTIVE.length }],
        ],
        "a String token",
      ),
    ).toEqual([
      {
        where: "String at 0-2",
        message:
          'a String token that a cut is glued to is not closed: "\\"a" and StringFragment at 16-18 are the fragments of one string',
      },
    ])
    // A single quote is not a closed string either.
    expect(
      problemsSaying(
        `"${DIRECTIVE}b"`,
        [
          ["String", '"'],
          ["Directive", DIRECTIVE],
          ["StringFragment", { text: 'b"', from: 1 + DIRECTIVE.length }],
        ],
        "a String token",
      ).map((problem) => problem.where),
    ).toEqual(["String at 0-1"])
  })

  it("does not report a closed String that a cut follows", () => {
    expect(
      problemsSaying(
        `"a"${DIRECTIVE}b"`,
        [
          ["String", '"a"'],
          ["Directive", DIRECTIVE],
          ["StringFragment", { text: 'b"', from: 3 + DIRECTIVE.length }],
        ],
        "a String token",
      ),
    ).toEqual([])
  })

  it("reports two `(` that a cut separates, and no two `,`", () => {
    // `((` is a text of the table of the `Punctuator` tokens of a flowchart,
    // and `,,` is none: two `,` are two units.
    expect(
      problemsSaying(
        `(${DIRECTIVE}(`,
        [
          ["Punctuator", "("],
          ["Directive", DIRECTIVE],
          ["Punctuator", { text: "(", from: 1 + DIRECTIVE.length }],
        ],
        "a Punctuator token is cut",
      ).map((problem) => problem.where),
    ).toEqual(["Punctuator at 0-1"])
    expect(
      problemsSaying(
        `,${DIRECTIVE},`,
        [
          ["Punctuator", ","],
          ["Directive", DIRECTIVE],
          ["Punctuator", { text: ",", from: 1 + DIRECTIVE.length }],
        ],
        "Punctuator",
      ),
    ).toEqual([])
  })
})
