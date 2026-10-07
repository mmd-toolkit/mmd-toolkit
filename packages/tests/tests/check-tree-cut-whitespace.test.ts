import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import {
  copyOf,
  expectWhitespaceCases,
  recordedTree,
  setField,
} from "./check-tree-recorded.ts"
import { locationOf } from "./check-tree-trees.ts"

// parser/docs/tokens.md, A token that a directive cuts: a run of text that a
// cut lies inside is cut into fragments, and the whitespace next to the cut
// lies in the fragment next to it, a `RawText` token or a `StringFragment`
// token: the whitespace before the cut at the end of the fragment before it,
// and the whitespace after the cut at the start of the fragment after it, for
// each kind of cut. Each case below takes the recorded
// tree of a named fixture, takes the whitespace off one side of a token that
// touches a cut (the token keeps the text of the source at its range, so the
// whitespace lies in no token), and says which problem the check reports. The
// unedited tree of each fixture has no problem. The problem is one of two:
// where the text is a value (a label, a member) the value made of the tokens
// lacks the whitespace, and where the text is one that mermaid.js does not
// read (`FlowchartIgnoredText`) the whitespace between two `RawText` tokens
// next to a cut lies in no token.

const JOINED = "the texts of its tokens joined are not its written text"

describe("the whitespace before a directive", () => {
  expectWhitespaceCases([
    {
      name: "is in the RawText token before it: a member text without it is reported",
      diagram: "class",
      fixture: "tokens-directive-member-spaces",
      token: { type: "RawText", value: "x " },
      side: "end",
      problems: [
        {
          where: "ClassLiteral at 19-37",
          message: `${JOINED}: "x y", not "x  y"`,
        },
      ],
    },
    {
      name: "is in the StringFragment token before it: a label without it is reported",
      diagram: "flowchart",
      fixture: "lex-directive-in-string-between-spaces",
      token: { type: "StringFragment", value: '" ' },
      side: "end",
      problems: [
        {
          where: "FlowchartLabel at 17-35",
          message: `${JOINED}: " ", not "  "`,
        },
      ],
    },
    {
      name: "is in the RawText token before it: an ignored text without it is reported",
      diagram: "flowchart",
      fixture: "tokens-ignored-text-directive-before-direction",
      token: { type: "RawText", value: "A-->B a " },
      side: "end",
      problems: [
        {
          where: "FlowchartIgnoredText at 15-39",
          message:
            "the whitespace between RawText at 15-22 and RawText at 37-39, next to a cut, lies in no token",
        },
      ],
    },
  ])
})

describe("the whitespace after a directive", () => {
  expectWhitespaceCases([
    {
      name: "is in the RawText token after it: a member text without it is reported",
      diagram: "class",
      fixture: "tokens-directive-member-spaces",
      token: { type: "RawText", value: " y" },
      side: "start",
      problems: [
        {
          where: "ClassLiteral at 19-37",
          message: `${JOINED}: "x y", not "x  y"`,
        },
      ],
    },
    {
      name: "is in the StringFragment token after it: a label without it is reported",
      diagram: "flowchart",
      fixture: "lex-directive-in-string-between-spaces",
      token: { type: "StringFragment", value: ' "' },
      side: "start",
      problems: [
        {
          where: "FlowchartLabel at 17-35",
          message: `${JOINED}: " ", not "  "`,
        },
      ],
    },
    {
      name: "is in the RawText token after it: an ignored text without it is reported",
      diagram: "flowchart",
      fixture: "tokens-ignored-text-directive-before-direction",
      token: { type: "RawText", value: " b" },
      side: "start",
      problems: [
        {
          where: "FlowchartIgnoredText at 15-39",
          message:
            "the whitespace between RawText at 15-23 and RawText at 38-39, next to a cut, lies in no token",
        },
      ],
    },
  ])
})

describe("the whitespace before a `;` that the line rule ignores", () => {
  expectWhitespaceCases([
    {
      name: "is in the RawText token before it: a label without it is reported",
      diagram: "flowchart",
      fixture: "tokens-ignored-semicolon-label-spaces",
      token: { type: "RawText", value: "style:#x " },
      side: "end",
      problems: [
        {
          where: "FlowchartLabel at 17-29",
          message: `${JOINED}: "style:#x y", not "style:#x  y"`,
        },
      ],
    },
    {
      name: "is in the StringFragment token before it: a label without it is reported",
      diagram: "flowchart",
      fixture: "tokens-string-fragment-space-before-ignored-semicolon",
      token: { type: "StringFragment", value: '"a style:#x ' },
      side: "end",
      problems: [
        {
          where: "FlowchartLabel at 17-32",
          message: `${JOINED}: "a style:#xb", not "a style:#x b"`,
        },
      ],
    },
  ])
})

describe("the whitespace after a `;` that the line rule ignores", () => {
  expectWhitespaceCases([
    {
      name: "is in the RawText token after it: a label without it is reported",
      diagram: "flowchart",
      fixture: "tokens-ignored-semicolon-label-spaces",
      token: { type: "RawText", value: " y" },
      side: "start",
      problems: [
        {
          where: "FlowchartLabel at 17-29",
          message: `${JOINED}: "style:#x y", not "style:#x  y"`,
        },
      ],
    },
    {
      name: "is in the StringFragment token after it: a subgraph title without it is reported",
      diagram: "flowchart",
      fixture: "tokens-subgraph-title-string-ignored-semicolon",
      token: { type: "StringFragment", value: ' b"' },
      side: "start",
      problems: [
        {
          where: "FlowchartLabel at 25-40",
          message: `${JOINED}: "a style:#xb", not "a style:#x b"`,
        },
      ],
    },
  ])
})

describe("the whitespace before a comment region", () => {
  expectWhitespaceCases([
    {
      name: "is in the RawText token before it: a label without it is reported",
      diagram: "flowchart",
      fixture: "tokens-comment-region-label-spaces",
      token: { type: "RawText", value: "a \n" },
      side: "end",
      problems: [
        {
          where: "FlowchartLabel at 17-28",
          message: `${JOINED}: "a  b", not "a \\n  b"`,
        },
      ],
    },
    {
      name: "is in the StringFragment token before it: a label without it is reported",
      diagram: "flowchart",
      fixture: "tokens-comment-region-string-spaces",
      token: { type: "StringFragment", value: '"one  \n' },
      side: "end",
      problems: [
        {
          where: "FlowchartLabel at 17-37",
          message: `${JOINED}: "one  three", not "one  \\n  three"`,
        },
      ],
    },
    {
      name: "is in the RawText token before it: an ignored text without it is reported, the line terminator being U+2028",
      diagram: "flowchart",
      fixture: "tokens-ignored-text-comment-in-direction-line",
      token: { type: "RawText", value: "x\u2028" },
      side: "end",
      problems: [
        {
          where: "FlowchartIgnoredText at 39-49",
          message:
            "the whitespace between RawText at 39-40 and RawText at 46-49, next to a cut, lies in no token",
        },
      ],
    },
  ])
})

describe("the whitespace after a comment region", () => {
  expectWhitespaceCases([
    {
      name: "is in the RawText token after it: a label without it is reported",
      diagram: "flowchart",
      fixture: "tokens-comment-region-label-spaces",
      token: { type: "RawText", value: "  b" },
      side: "start",
      problems: [
        {
          where: "FlowchartLabel at 17-28",
          message: `${JOINED}: "a \\nb", not "a \\n  b"`,
        },
      ],
    },
    {
      name: "is in the StringFragment token after it: a label without it is reported",
      diagram: "flowchart",
      fixture: "tokens-comment-region-string-spaces",
      token: { type: "StringFragment", value: '  three"' },
      side: "start",
      problems: [
        {
          where: "FlowchartLabel at 17-37",
          message: `${JOINED}: "one  \\nthree", not "one  \\n  three"`,
        },
      ],
    },
    {
      name: "is in the RawText token after it: an ignored text without it is reported",
      diagram: "flowchart",
      fixture: "tokens-ignored-text-comment-in-direction-line",
      token: { type: "RawText", value: "  A" },
      side: "start",
      problems: [
        {
          where: "FlowchartIgnoredText at 39-49",
          message:
            "the whitespace between RawText at 39-41 and RawText at 48-49, next to a cut, lies in no token",
        },
      ],
    },
  ])
})

// parser/docs/tokens.md and positions.md, Invariants: a token that goes on with
// a value that the token right before it starts keeps the whitespace at its
// start, and a token that is all whitespace and is followed by a token of the
// same value keeps it at its end. Where the token right before does not touch
// the token, or no token follows the whitespace, the whitespace is not allowed.
// Both branches are reached by recorded trees (`goesOn` by the text after a
// string that a label starts with, `continues` by the whitespace tokens of the
// box text of a sequence diagram), so the negative cases are made from a
// recorded tree by changing the range of one token.

const LINE_SEPARATOR = String.fromCodePoint(0x2028)

/** Sets the range of the token `index` of `root`, with its value and its location, as the source `input` has them. */
function setTokenRange(
  root: CheckedRoot,
  input: string,
  index: number,
  range: [number, number],
): void {
  const token = root.tokens[index]
  if (token === undefined) throw new Error(`no token ${index}`)
  setField(token, "range", range)
  setField(token, "value", input.slice(...range))
  setField(token, "loc", locationOf(input, range))
}

describe("the whitespace at the start of a token that goes on with a value", () => {
  it("is not allowed where the token before does not touch the token", () => {
    // `state X ""` and `state {}`: the `state` of the second line is in the
    // StateIgnoredText `""` + line feed + spaces + `state`, which starts at
    // the `""`, and the whitespace before it lies in no token. A `state` token
    // that takes one of its spaces starts with whitespace in a value that
    // started before it, but the `""` does not end where it starts.
    const { input, tree } = recordedTree(
      "state",
      "gram-ignored-state-empty-body",
    )
    expect(checkTree(input, tree)).toEqual([])
    const root = copyOf(tree)
    setTokenRange(root, input, 4, [30, 36])
    expect(checkTree(input, root)).toEqual([
      {
        where: "Keyword at 30-36",
        message:
          "starts with whitespace or a line terminator where no value starts",
      },
    ])
  })
})

describe("the whitespace at the end of an all-whitespace token that continues a value", () => {
  it("is not allowed where no token follows it", () => {
    // `box aqua`, two spaces, and a line separator: the box text is `aqua`
    // and the whitespace, with a RawText token of the two spaces (24-26) and one
    // of the line separator (26-27) that touch. The first loses its last space,
    // which then lies in no token: it is all whitespace, ends with whitespace,
    // and is followed by no token that touches it. The box text no longer has
    // the whitespace in its tokens, so its value is reported as well.
    const { input, tree } = recordedTree(
      "sequence",
      "db-box-colour-then-spaces-and-line-separator",
    )
    expect(checkTree(input, tree)).toEqual([])
    const root = copyOf(tree)
    setTokenRange(root, input, 3, [24, 25])
    expect(checkTree(input, root)).toEqual([
      {
        where: "RawText at 24-25",
        message:
          "ends with whitespace or a line terminator where no value ends",
      },
      {
        where: "SequenceBoxText at 20-27",
        message: `the texts of its tokens joined are not its written text: "aqua ${LINE_SEPARATOR}", not "aqua  ${LINE_SEPARATOR}"`,
      },
    ])
  })
})
