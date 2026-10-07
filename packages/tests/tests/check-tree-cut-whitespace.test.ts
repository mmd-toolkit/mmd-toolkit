import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot, loadFixtures } from "../src/index.ts"
import { scanSource } from "../src/source-scan.ts"
import { copyOf, recordedTree, setField } from "./check-tree-recorded.ts"
import { withoutTokenWhitespace } from "./check-tree-token-edits.ts"
import { locationOf } from "./check-tree-trees.ts"

// parser/docs/tokens.md, A token that a directive cuts: the whitespace next to
// a cut (a directive, a comment region, or a `;` that the line rule ignores)
// that mermaid.js reads as part of a value is in the fragment next to the cut.
// A tree whose fragment lacks that whitespace is reported: in every recorded
// tree, the whitespace is taken off the side of each token that touches a cut,
// one side at a time, and the check must report each of the trees so made.

const DIAGRAMS: readonly DiagramType[] = [
  "common",
  "flowchart",
  "sequence",
  "class",
  "state",
]

/** The ranges of the cuts of the text of a recorded tree: directives, comment regions, and ignored `;`. */
function cutsOf(text: string, recorded: CheckedRoot): [number, number][] {
  const scan = scanSource(text, recorded.frontmatter?.range[1] ?? 0)
  return [
    ...scan.directives.map((directive): [number, number] => [
      directive.range[0],
      directive.scanEnd,
    ]),
    ...scan.commentLines.map((line): [number, number] => [
      line.region[0],
      line.region[1],
    ]),
    ...recorded.tokens
      .filter((token) => token.type === "IgnoredSemicolon")
      .map((token): [number, number] => [token.range[0], token.range[1]]),
  ]
}

/** The trees made from the recorded tree `json` of `text`, each with the whitespace taken off one side of one token that touches a cut, named by token and side. */
function treesWithoutCutWhitespace(
  text: string,
  json: string,
): { name: string; tree: CheckedRoot }[] {
  const recorded = JSON.parse(json) as CheckedRoot
  const cuts = cutsOf(text, recorded)
  const trees: { name: string; tree: CheckedRoot }[] = []
  recorded.tokens.forEach((token, index) => {
    if (token.type === "Directive" || token.type === "IgnoredSemicolon") return
    for (const side of ["start", "end"] as const) {
      const touches = cuts.some(([start, end]) =>
        side === "start" ? end === token.range[0] : start === token.range[1],
      )
      if (!touches) continue
      const tree = withoutTokenWhitespace(text, json, index, side)
      if (tree === null) continue
      trees.push({ name: `token ${index} ${side}`, tree })
    }
  })
  return trees
}

describe("the whitespace next to a cut", () => {
  it("is in the fragment: a tree without it is reported", async () => {
    let made = 0
    const missed: string[] = []
    for (const diagram of DIAGRAMS) {
      for (const fixture of await loadFixtures(diagram)) {
        const file = path.join(
          getFixturesRoot(),
          diagram,
          fixture.name,
          "ast.json",
        )
        if (!existsSync(file)) continue
        const mutated = treesWithoutCutWhitespace(
          fixture.input,
          readFileSync(file, "utf8"),
        )
        made += mutated.length
        for (const { name, tree } of mutated) {
          if (checkTree(fixture.input, tree).length === 0) {
            missed.push(`${diagram}/${fixture.name}: ${name}`)
          }
        }
      }
    }
    expect(made).toBeGreaterThan(100)
    expect(missed).toEqual([])
  }, 120_000)
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
