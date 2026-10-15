import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { TreeProblem } from "../src/check-tree/types.ts"
import type { DiagramType } from "../src/index.ts"
import { directiveOf, handMadeRoot } from "./check-tree-trees.ts"
import type { Piece } from "./check-tree-trees.ts"
import { recordedTree } from "./check-tree-recorded.ts"
import { cutToken } from "./check-tree-cuts.ts"
import type { Cut } from "./check-tree-cuts.ts"

// parser/docs/tokens.md, A token that a directive cuts: a directive, or a `;`
// that the line rule ignores, may lie inside a `String` token (the string is
// then `StringFragment` tokens) and inside a `RawText` token (then `RawText`
// tokens), and inside no other token. Each case below takes the recorded tree
// of a named fixture, writes one cut, or two or three, inside one of its
// tokens as a parser that cut the token would record the text, and says which
// problem the check reports, or that it reports none. The unedited tree of
// each fixture has no problem.

/** The directive that a case writes, and the `;` that the line rule ignores. */
const DIRECTIVE: Cut = "directive"
const SEMICOLON: Cut = "ignored-semicolon"

/** A case: a token of a recorded tree cut at places, and the problems of the check for the tree so made. */
interface CutCase {
  readonly name: string
  readonly diagram: DiagramType
  /** The fixture whose recorded tree is cut. */
  readonly fixture: string
  /** The first token of the fixture of this kind and this text, which is cut. */
  readonly token: { readonly type: string; readonly value: string }
  /** The cuts, from the first to the last: how many characters of the token come before it, and what is written. */
  readonly cuts: readonly { readonly at: number; readonly cut: Cut }[]
  /** The kind of every fragment of the token. */
  readonly fragments: string
  /** The parts of the messages of the problems that the case is about: a problem is one of them when its message has one of the parts; the empty string is every problem. */
  readonly about: readonly string[]
  /** The problems that the case is about, in the order of the check. */
  readonly problems: readonly TreeProblem[]
}

/** The problems that the check reports for the tree of `testCase` that the case is about, and those of the unedited tree. */
function problemsOf(testCase: CutCase): {
  base: TreeProblem[]
  cut: TreeProblem[]
} {
  const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
  const index = tree.tokens.findIndex(
    (token) =>
      token.type === testCase.token.type &&
      token.value === testCase.token.value,
  )
  const first = tree.tokens[index]
  if (first === undefined) {
    throw new Error(`no ${testCase.token.type} ${testCase.token.value}`)
  }
  let text = input
  let cutted = tree
  // The last cut first: the places of the cuts before it stay what they are.
  for (const { at, cut } of testCase.cuts.toReversed()) {
    const result = cutToken(
      text,
      JSON.stringify(cutted),
      index,
      first.range[0] + at,
      cut,
      { before: testCase.fragments, after: testCase.fragments },
    )
    text = result.text
    cutted = result.tree
  }
  return {
    base: checkTree(input, tree),
    cut: checkTree(text, cutted).filter((problem) =>
      testCase.about.some((part) => problem.message.includes(part)),
    ),
  }
}

/** Runs each case: the tree of the fixture has no problem, and the cut tree has `problems`. */
function expectCases(cases: readonly CutCase[]): void {
  for (const testCase of cases) {
    it(testCase.name, () => {
      const { base, cut } = problemsOf(testCase)
      expect(base).toEqual([])
      expect(cut).toEqual(testCase.problems)
    })
  }
}

describe("an Identifier that a cut cuts", () => {
  expectCases([
    {
      name: "is reported when a directive cuts it into two",
      diagram: "flowchart",
      fixture: "docs-syntax-flowchart-2d81e8b9",
      token: { type: "Identifier", value: "id1" },
      cuts: [{ at: 2, cut: DIRECTIVE }],
      fragments: "Identifier",
      about: ["token is cut"],
      problems: [
        {
          where: "Identifier at 33-34",
          message:
            "a Identifier token is cut: Identifier at 17-19 and this are its fragments",
        },
      ],
    },
    {
      name: "is reported when a `;` cuts it into two",
      diagram: "flowchart",
      fixture: "docs-syntax-flowchart-2d81e8b9",
      token: { type: "Identifier", value: "id1" },
      cuts: [{ at: 2, cut: SEMICOLON }],
      fragments: "Identifier",
      about: ["token is cut"],
      problems: [
        {
          where: "Identifier at 20-21",
          message:
            "a Identifier token is cut: Identifier at 17-19 and this are its fragments",
        },
      ],
    },
    {
      name: "is reported for each fragment after the first when a directive and a `;` cut it into three",
      diagram: "flowchart",
      fixture: "docs-syntax-flowchart-2d81e8b9",
      token: { type: "Identifier", value: "id1" },
      cuts: [
        { at: 1, cut: DIRECTIVE },
        { at: 2, cut: SEMICOLON },
      ],
      fragments: "Identifier",
      about: ["token is cut"],
      problems: [
        {
          where: "Identifier at 32-33",
          message:
            "a Identifier token is cut: Identifier at 17-18 and this are its fragments",
        },
        {
          where: "Identifier at 34-35",
          message:
            "a Identifier token is cut: Identifier at 32-33 and this are its fragments",
        },
      ],
    },
  ])
})

describe("a Numeric that a cut cuts", () => {
  expectCases([
    {
      name: "is reported when a directive cuts a number of a sequence diagram into two",
      diagram: "sequence",
      fixture: "db-autonumber-fraction",
      token: { type: "Numeric", value: "1.25" },
      cuts: [{ at: 1, cut: DIRECTIVE }],
      fragments: "Numeric",
      about: ["token is cut"],
      problems: [
        {
          where: "Numeric at 45-48",
          message:
            "a Numeric token is cut: Numeric at 30-31 and this are its fragments",
        },
      ],
    },
    {
      name: "is reported when a `;` cuts a number of a state diagram into two",
      diagram: "state",
      fixture: "gram-scale",
      token: { type: "Numeric", value: "350" },
      cuts: [{ at: 2, cut: SEMICOLON }],
      fragments: "Numeric",
      about: ["token is cut"],
      problems: [
        {
          where: "Numeric at 27-28",
          message:
            "a Numeric token is cut: Numeric at 24-26 and this are its fragments",
        },
      ],
    },
  ])
})

describe("a Keyword that a cut cuts", () => {
  expectCases([
    {
      name: "is reported in a flowchart when a directive cuts `subgraph` into two",
      diagram: "flowchart",
      fixture: "config-inherit-dir-default",
      token: { type: "Keyword", value: "subgraph" },
      cuts: [{ at: 3, cut: DIRECTIVE }],
      fragments: "Keyword",
      about: ["token is cut"],
      problems: [
        {
          where: "Keyword at 15-18",
          message:
            'a Keyword token is cut: Keyword at 15-18, Keyword at 32-37 are the fragments of "subgraph"',
        },
      ],
    },
    {
      name: "is reported in a flowchart when a `;` cuts `subgraph` into two",
      diagram: "flowchart",
      fixture: "config-inherit-dir-default",
      token: { type: "Keyword", value: "subgraph" },
      cuts: [{ at: 3, cut: SEMICOLON }],
      fragments: "Keyword",
      about: ["token is cut"],
      problems: [
        {
          where: "Keyword at 15-18",
          message:
            'a Keyword token is cut: Keyword at 15-18, Keyword at 19-24 are the fragments of "subgraph"',
        },
      ],
    },
    {
      name: "is reported in a flowchart when a directive and a `;` cut `subgraph` into three, though no two fragments make a keyword",
      diagram: "flowchart",
      fixture: "config-inherit-dir-default",
      token: { type: "Keyword", value: "subgraph" },
      cuts: [
        { at: 2, cut: DIRECTIVE },
        { at: 5, cut: SEMICOLON },
      ],
      fragments: "Keyword",
      about: ["token is cut"],
      problems: [
        {
          where: "Keyword at 15-17",
          message:
            'a Keyword token is cut: Keyword at 15-17, Keyword at 31-34, Keyword at 35-38 are the fragments of "subgraph"',
        },
      ],
    },
    {
      name: "is reported in a flowchart when two directives cut `subgraph` into three",
      diagram: "flowchart",
      fixture: "config-inherit-dir-default",
      token: { type: "Keyword", value: "subgraph" },
      cuts: [
        { at: 2, cut: DIRECTIVE },
        { at: 5, cut: DIRECTIVE },
      ],
      fragments: "Keyword",
      about: ["token is cut"],
      problems: [
        {
          where: "Keyword at 15-17",
          message:
            'a Keyword token is cut: Keyword at 15-17, Keyword at 31-34, Keyword at 48-51 are the fragments of "subgraph"',
        },
      ],
    },
    {
      name: "is reported in a flowchart when `;` and a directive cut `subgraph` into four",
      diagram: "flowchart",
      fixture: "config-inherit-dir-default",
      token: { type: "Keyword", value: "subgraph" },
      cuts: [
        { at: 1, cut: SEMICOLON },
        { at: 3, cut: DIRECTIVE },
        { at: 6, cut: SEMICOLON },
      ],
      fragments: "Keyword",
      about: ["token is cut"],
      problems: [
        {
          where: "Keyword at 15-16",
          message:
            'a Keyword token is cut: Keyword at 15-16, Keyword at 17-19, Keyword at 33-36, Keyword at 37-39 are the fragments of "subgraph"',
        },
        {
          where: "Keyword at 33-36",
          message:
            'a Keyword token is cut: Keyword at 33-36, Keyword at 37-39 are the fragments of "graph"',
        },
      ],
    },
    {
      name: "is reported in a sequence diagram when a directive cuts `participant` into two",
      diagram: "sequence",
      fixture: "db-box-colour-candidate-word-prefix",
      token: { type: "Keyword", value: "participant" },
      cuts: [{ at: 4, cut: DIRECTIVE }],
      fragments: "Keyword",
      about: ["token is cut"],
      problems: [
        {
          where: "Keyword at 29-33",
          message:
            'a Keyword token is cut: Keyword at 29-33, Keyword at 47-54 are the fragments of "participant"',
        },
      ],
    },
    {
      name: "is reported in a class diagram when a directive cuts `classDiagram` into `class` and `Diagram`",
      diagram: "class",
      fixture: "config-security-level-sandbox-link-default-target",
      token: { type: "Keyword", value: "classDiagram" },
      cuts: [{ at: 5, cut: DIRECTIVE }],
      fragments: "Keyword",
      about: ["token is cut"],
      problems: [
        {
          where: "Keyword at 0-5",
          message:
            'a Keyword token is cut: Keyword at 0-5, Keyword at 19-26 are the fragments of "classDiagram"',
        },
      ],
    },
    {
      name: "is reported in a state diagram when a directive cuts `stateDiagram-v2` into `state` and `Diagram-v2`",
      diagram: "state",
      fixture: "db-acc-descr-block-crlf",
      token: { type: "Keyword", value: "stateDiagram-v2" },
      cuts: [{ at: 5, cut: DIRECTIVE }],
      fragments: "Keyword",
      about: ["token is cut"],
      problems: [
        {
          where: "Keyword at 0-5",
          message:
            'a Keyword token is cut: Keyword at 0-5, Keyword at 19-29 are the fragments of "stateDiagram-v2"',
        },
      ],
    },
  ])
})

describe("a Punctuator that a cut cuts", () => {
  expectCases([
    {
      name: "is reported in a flowchart when a directive cuts `(((` into `(` and `((`",
      diagram: "flowchart",
      fixture: "docs-syntax-flowchart-2d81e8b9",
      token: { type: "Punctuator", value: "(((" },
      cuts: [{ at: 1, cut: DIRECTIVE }],
      fragments: "Punctuator",
      about: ["the Punctuator text", "a Punctuator token is cut"],
      problems: [
        {
          where: "Punctuator at 20-21",
          message:
            'a Punctuator token is cut: Punctuator at 20-21, Punctuator at 35-37 are the fragments of "((("',
        },
      ],
    },
    {
      name: "is reported in a flowchart when a `;` cuts `(((` into `((` and `(`",
      diagram: "flowchart",
      fixture: "docs-syntax-flowchart-2d81e8b9",
      token: { type: "Punctuator", value: "(((" },
      cuts: [{ at: 2, cut: SEMICOLON }],
      fragments: "Punctuator",
      about: ["the Punctuator text", "a Punctuator token is cut"],
      problems: [
        {
          where: "Punctuator at 20-22",
          message:
            'a Punctuator token is cut: Punctuator at 20-22, Punctuator at 23-24 are the fragments of "((("',
        },
      ],
    },
    {
      name: "is reported in a flowchart for each run of fragments that make a text of the table when two directives cut `(((` into three `(`",
      diagram: "flowchart",
      fixture: "docs-syntax-flowchart-2d81e8b9",
      token: { type: "Punctuator", value: "(((" },
      cuts: [
        { at: 1, cut: DIRECTIVE },
        { at: 2, cut: DIRECTIVE },
      ],
      fragments: "Punctuator",
      about: ["the Punctuator text", "a Punctuator token is cut"],
      problems: [
        {
          where: "Punctuator at 20-21",
          message:
            'a Punctuator token is cut: Punctuator at 20-21, Punctuator at 35-36 are the fragments of "(("',
        },
        {
          where: "Punctuator at 20-21",
          message:
            'a Punctuator token is cut: Punctuator at 20-21, Punctuator at 35-36, Punctuator at 50-51 are the fragments of "((("',
        },
        {
          where: "Punctuator at 35-36",
          message:
            'a Punctuator token is cut: Punctuator at 35-36, Punctuator at 50-51 are the fragments of "(("',
        },
      ],
    },
    {
      name: "is reported in a sequence diagram when a directive cuts `()` into `(` and `)`, with their texts that the diagram lacks",
      diagram: "sequence",
      fixture: "db-message-central-connection-both",
      token: { type: "Punctuator", value: "()" },
      cuts: [{ at: 1, cut: DIRECTIVE }],
      fragments: "Punctuator",
      about: ["the Punctuator text", "a Punctuator token is cut"],
      problems: [
        {
          where: "Punctuator at 17-18",
          message:
            'the Punctuator text "(" is none of those of a SequenceDiagram',
        },
        {
          where: "Punctuator at 32-33",
          message:
            'the Punctuator text ")" is none of those of a SequenceDiagram',
        },
        {
          where: "Punctuator at 17-18",
          message:
            'a Punctuator token is cut: Punctuator at 17-18, Punctuator at 32-33 are the fragments of "()"',
        },
      ],
    },
    {
      name: "is reported in a class diagram when a directive cuts `<<` into two `<`, with their texts that the diagram lacks",
      diagram: "class",
      fixture: "db-annotation-after-backquoted-tilde-class",
      token: { type: "Punctuator", value: "<<" },
      cuts: [{ at: 1, cut: DIRECTIVE }],
      fragments: "Punctuator",
      about: ["the Punctuator text", "a Punctuator token is cut"],
      problems: [
        {
          where: "Punctuator at 29-30",
          message: 'the Punctuator text "<" is none of those of a ClassDiagram',
        },
        {
          where: "Punctuator at 44-45",
          message: 'the Punctuator text "<" is none of those of a ClassDiagram',
        },
        {
          where: "Punctuator at 29-30",
          message:
            'a Punctuator token is cut: Punctuator at 29-30, Punctuator at 44-45 are the fragments of "<<"',
        },
      ],
    },
    {
      name: "is reported in a state diagram when a directive cuts `-->` into `-` and `->`, with their texts that the diagram lacks",
      diagram: "state",
      fixture: "db-choice-close-tag-id",
      token: { type: "Punctuator", value: "-->" },
      cuts: [{ at: 1, cut: DIRECTIVE }],
      fragments: "Punctuator",
      about: ["the Punctuator text", "a Punctuator token is cut"],
      problems: [
        {
          where: "Punctuator at 28-29",
          message: 'the Punctuator text "-" is none of those of a StateDiagram',
        },
        {
          where: "Punctuator at 43-45",
          message:
            'the Punctuator text "->" is none of those of a StateDiagram',
        },
        {
          where: "Punctuator at 28-29",
          message:
            'a Punctuator token is cut: Punctuator at 28-29, Punctuator at 43-45 are the fragments of "-->"',
        },
      ],
    },
    {
      name: "is reported in a state diagram when a `;` cuts `[*]` into `[` and `*]`",
      diagram: "state",
      fixture: "db-composite-id-terminal-then-transition",
      token: { type: "Punctuator", value: "[*]" },
      cuts: [{ at: 1, cut: SEMICOLON }],
      fragments: "Punctuator",
      about: ["the Punctuator text", "a Punctuator token is cut"],
      problems: [
        {
          where: "Punctuator at 42-43",
          message: 'the Punctuator text "[" is none of those of a StateDiagram',
        },
        {
          where: "Punctuator at 44-46",
          message:
            'the Punctuator text "*]" is none of those of a StateDiagram',
        },
        {
          where: "Punctuator at 42-43",
          message:
            'a Punctuator token is cut: Punctuator at 42-43, Punctuator at 44-46 are the fragments of "[*]"',
        },
      ],
    },
    {
      name: "is reported in an ER diagram when a directive cuts the cardinality `||` into two `|`, with their texts that the diagram lacks",
      diagram: "er",
      fixture: "gram-relationship-symbols",
      token: { type: "Punctuator", value: "||" },
      cuts: [{ at: 1, cut: DIRECTIVE }],
      fragments: "Punctuator",
      about: ["the Punctuator text", "a Punctuator token is cut"],
      problems: [
        {
          where: "Punctuator at 12-13",
          message: 'the Punctuator text "|" is none of those of a ErDiagram',
        },
        {
          where: "Punctuator at 27-28",
          message: 'the Punctuator text "|" is none of those of a ErDiagram',
        },
        {
          where: "Punctuator at 12-13",
          message:
            'a Punctuator token is cut: Punctuator at 12-13, Punctuator at 27-28 are the fragments of "||"',
        },
      ],
    },
  ])
})

describe("a String that a cut cuts into String tokens", () => {
  expectCases([
    {
      name: "is reported when a directive cuts it: the second fragment starts with no quote and the first is not closed",
      diagram: "flowchart",
      fixture: "click-callback-tooltip",
      token: { type: "String", value: '"Tooltip for A"' },
      cuts: [{ at: 5, cut: DIRECTIVE }],
      fragments: "String",
      about: ["String token"],
      problems: [
        {
          where: "StringLiteral at 42-71",
          message:
            "the tokens of the string are not one String token or StringFragment tokens: String, String",
        },
        {
          where: "String at 42-47",
          message:
            'a String token that a cut is glued to is not closed: "\\"Tool" and String at 61-71 are the fragments of one string',
        },
        {
          where: "String at 61-71",
          message: 'a String token does not start with a quote: "tip for A\\""',
        },
      ],
    },
    {
      name: "is reported when a `;` cuts it: the second fragment starts with no quote and the first is not closed",
      diagram: "flowchart",
      fixture: "click-callback-tooltip",
      token: { type: "String", value: '"Tooltip for A"' },
      cuts: [{ at: 5, cut: SEMICOLON }],
      fragments: "String",
      about: ["String token"],
      problems: [
        {
          where: "StringLiteral at 42-58",
          message:
            "the tokens of the string are not one String token or StringFragment tokens: String, String",
        },
        {
          where: "String at 42-47",
          message:
            'a String token that a cut is glued to is not closed: "\\"Tool" and String at 48-58 are the fragments of one string',
        },
        {
          where: "String at 48-58",
          message: 'a String token does not start with a quote: "tip for A\\""',
        },
      ],
    },
  ])
})

describe("a String or a RawText that a cut cuts", () => {
  expectCases([
    {
      name: "is not reported when a directive cuts a String into StringFragment tokens",
      diagram: "flowchart",
      fixture: "click-callback-tooltip",
      token: { type: "String", value: '"Tooltip for A"' },
      cuts: [{ at: 5, cut: DIRECTIVE }],
      fragments: "StringFragment",
      about: [""],
      problems: [],
    },
    {
      name: "is not reported when a `;` cuts a String into StringFragment tokens",
      diagram: "flowchart",
      fixture: "click-callback-tooltip",
      token: { type: "String", value: '"Tooltip for A"' },
      cuts: [{ at: 5, cut: SEMICOLON }],
      fragments: "StringFragment",
      about: [""],
      problems: [],
    },
    {
      name: "is not reported when a directive cuts the String of a class diagram into StringFragment tokens",
      diagram: "class",
      fixture: "config-security-level-sandbox-link-default-target",
      token: { type: "String", value: '"https://example.com"' },
      cuts: [{ at: 8, cut: DIRECTIVE }],
      fragments: "StringFragment",
      about: [""],
      problems: [],
    },
    {
      name: "is not reported when a directive cuts a RawText of a flowchart into RawText tokens",
      diagram: "flowchart",
      fixture: "docs-syntax-flowchart-2d81e8b9",
      token: { type: "RawText", value: "This is the text in the circle" },
      cuts: [{ at: 3, cut: DIRECTIVE }],
      fragments: "RawText",
      about: [""],
      problems: [],
    },
    {
      name: "is not reported when a `;` cuts a RawText of a flowchart into RawText tokens",
      diagram: "flowchart",
      fixture: "docs-syntax-flowchart-2d81e8b9",
      token: { type: "RawText", value: "This is the text in the circle" },
      cuts: [{ at: 3, cut: SEMICOLON }],
      fragments: "RawText",
      about: [""],
      problems: [],
    },
    {
      name: "is not reported when a directive cuts a RawText of a sequence diagram into RawText tokens",
      diagram: "sequence",
      fixture: "config-wrap-false-sequence-wrap-true-site",
      token: { type: "RawText", value: "Alice" },
      cuts: [{ at: 2, cut: DIRECTIVE }],
      fragments: "RawText",
      about: [""],
      problems: [],
    },
    {
      name: "is not reported when a directive cuts a RawText of a class diagram into RawText tokens",
      diagram: "class",
      fixture: "db-acc-descr-block-replaces-block",
      token: { type: "RawText", value: "first" },
      cuts: [{ at: 2, cut: DIRECTIVE }],
      fragments: "RawText",
      about: [""],
      problems: [],
    },
  ])
})

/** The directive that the hand made trees below write. */
const HAND_MADE_DIRECTIVE = "%%{init: {}}%%"

/**
 * The problems of the flowchart tree made by hand from `parts`, `Punctuator`
 * tokens and the cuts between them, that say a `Punctuator` token is cut. A
 * cut is a directive (`%%{init: {}}%%`) or a `;` that the line rule ignores.
 */
function punctuatorRunProblems(
  parts: readonly (readonly [string, string])[],
): TreeProblem[] {
  let text = ""
  const tokens: [string, Piece][] = []
  const directives = []
  for (const [type, part] of parts) {
    tokens.push([type, { text: part, from: text.length }])
    if (type === "Directive") {
      directives.push(
        directiveOf(text + part, { text: part, from: text.length }),
      )
    }
    text += part
  }
  const root = handMadeRoot(text, {
    bodyType: "FlowchartDiagram",
    tokens,
    directives,
  })
  return checkTree(text, root).filter((problem) =>
    problem.message.includes("a Punctuator token is cut"),
  )
}

describe("a run of Punctuator fragments of a text of the table", () => {
  const cutDirective: [string, string] = ["Directive", HAND_MADE_DIRECTIVE]
  const cutSemicolon: [string, string] = ["IgnoredSemicolon", ";"]

  it("is reported with the `)` that a cut attaches before it: `:`, `:`, and `:` are `:::` and `)` is not part of the run", () => {
    expect(
      punctuatorRunProblems([
        ["Punctuator", ")"],
        cutDirective,
        ["Punctuator", ":"],
        cutSemicolon,
        ["Punctuator", ":"],
        cutSemicolon,
        ["Punctuator", ":"],
      ]),
    ).toEqual([
      {
        where: "Punctuator at 15-16",
        message:
          'a Punctuator token is cut: Punctuator at 15-16, Punctuator at 17-18, Punctuator at 19-20 are the fragments of ":::"',
      },
    ])
  })

  it("is reported with the `(` that a cut attaches after it", () => {
    expect(
      punctuatorRunProblems([
        ["Punctuator", ":"],
        cutSemicolon,
        ["Punctuator", ":"],
        cutDirective,
        ["Punctuator", ":"],
        cutSemicolon,
        ["Punctuator", "("],
      ]),
    ).toEqual([
      {
        where: "Punctuator at 0-1",
        message:
          'a Punctuator token is cut: Punctuator at 0-1, Punctuator at 2-3, Punctuator at 17-18 are the fragments of ":::"',
      },
    ])
  })

  it("is reported with a `)` before it and a `(` after it that cuts attach", () => {
    expect(
      punctuatorRunProblems([
        ["Punctuator", ")"],
        cutSemicolon,
        ["Punctuator", ":"],
        cutSemicolon,
        ["Punctuator", ":"],
        cutSemicolon,
        ["Punctuator", ":"],
        cutDirective,
        ["Punctuator", "("],
      ]),
    ).toEqual([
      {
        where: "Punctuator at 2-3",
        message:
          'a Punctuator token is cut: Punctuator at 2-3, Punctuator at 4-5, Punctuator at 6-7 are the fragments of ":::"',
      },
    ])
  })

  it("is not reported for the fragments of no text of the table: a `)` and a `(` that a cut separates", () => {
    expect(
      punctuatorRunProblems([
        ["Punctuator", ")"],
        cutDirective,
        ["Punctuator", "("],
      ]),
    ).toEqual([])
  })
})
