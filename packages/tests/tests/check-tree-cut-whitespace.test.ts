import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot, loadFixtures } from "../src/index.ts"
import { scanSource } from "../src/source-scan.ts"
import { withoutTokenWhitespace } from "./check-tree-token-edits.ts"

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
