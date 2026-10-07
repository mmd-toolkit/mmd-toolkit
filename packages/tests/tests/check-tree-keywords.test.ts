import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { KEYWORD_TEXTS } from "../src/check-tree/keywords.ts"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot, loadFixtures } from "../src/index.ts"
import { directiveOf, handMadeRoot } from "./check-tree-trees.ts"

// parser/docs/tokens.md, A token that a directive cuts: a directive between
// two `Keyword` tokens cuts a keyword only when the two texts joined are a
// keyword of the diagram; two keywords that a diagram lets follow each other
// with nothing between are units of their own.

/** The diagrams, with the type of their body. */
const DIAGRAMS: readonly [DiagramType, string][] = [
  ["flowchart", "FlowchartDiagram"],
  ["sequence", "SequenceDiagram"],
  ["class", "ClassDiagram"],
  ["state", "StateDiagram"],
]

/** The problems of the check of cut tokens, for the tree of `text` with the two `Keyword` tokens `first` and `second` and a directive between them. */
function cutProblems(body: string, first: string, second: string): string[] {
  const directive = "%%{init: {}}%%"
  const text = `${first}${directive}${second}`
  const tokens: [string, { text: string; from: number }][] = [
    ["Keyword", { text: first, from: 0 }],
    ["Directive", { text: directive, from: first.length }],
    ["Keyword", { text: second, from: first.length + directive.length }],
  ]
  const tree = handMadeRoot(text, {
    bodyType: body,
    tokens,
    directives: [directiveOf(text, directive)],
  })
  return checkTree(text, tree)
    .filter((problem) => problem.message.includes("a Keyword token is cut"))
    .map((problem) => problem.message)
}

describe("the check of the cut Keyword tokens", () => {
  it("reports two Keyword tokens whose texts joined are a keyword of the diagram", () => {
    expect(cutProblems("FlowchartDiagram", "sub", "graph")).toHaveLength(1)
    expect(cutProblems("StateDiagram", "state", "diagram")).toHaveLength(1)
    expect(cutProblems("SequenceDiagram", "par", "_over")).toHaveLength(1)
    expect(cutProblems("StateDiagram", "<<cho", "ice>>")).toHaveLength(1)
  })

  it("does not report two keywords that a diagram lets follow each other with nothing between", () => {
    // `state A <<choice>>%%{init: {}}%%accDescr {}` is a pseudostate mark and
    // the start of an empty description block.
    expect(cutProblems("StateDiagram", "<<choice>>", "accDescr")).toEqual([])
    expect(cutProblems("StateDiagram", "<<fork>>", "accDescr")).toEqual([])
  })
})

describe("the table of the texts of Keyword tokens", () => {
  it("holds the text, in lower case, of every Keyword token of every recorded tree", async () => {
    const missing = new Set<string>()
    for (const [diagram, body] of DIAGRAMS) {
      const texts = new Set(KEYWORD_TEXTS[body] ?? [])
      for (const fixture of await loadFixtures(diagram)) {
        const file = path.join(
          getFixturesRoot(),
          diagram,
          fixture.name,
          "ast.json",
        )
        if (!existsSync(file)) continue
        const tree = JSON.parse(readFileSync(file, "utf8")) as CheckedRoot
        for (const token of tree.tokens) {
          if (
            token.type === "Keyword" &&
            !texts.has(token.value.toLowerCase())
          ) {
            missing.add(`${diagram}: ${token.value}`)
          }
        }
      }
    }
    expect([...missing]).toEqual([])
  }, 120_000)

  it("holds the words that the Keyword row of the table of Tokens of each diagram names as texts", () => {
    const here = path.dirname(new URL(import.meta.url).pathname)
    for (const [diagram, body] of DIAGRAMS) {
      const row = readFileSync(
        path.join(here, "../../parser/docs/tokens", `${diagram}.md`),
        "utf8",
      )
        .split("\n")
        .find((line) => line.startsWith("| `Keyword`"))
      expect(row, diagram).toBeDefined()
      const words = [...(row ?? "").matchAll(/`([^`]+)`/gu)]
        .map((match) => match[1] ?? "")
        // The names of units have a hyphen, or are `Keyword` (the name of the
        // row) and `header` (the unit of the header, whose text is the name of
        // the diagram); the texts of the keywords are none of these (the
        // `title:` of the sequence row ends with a colon).
        .filter(
          (span) =>
            span !== "Keyword" &&
            span !== "header" &&
            /^[A-Z_a-z]+:?$/u.test(span),
        )
        .map((word) => word.toLowerCase())
      const table = new Set(KEYWORD_TEXTS[body] ?? [])
      expect(
        words.filter((word) => !table.has(word)),
        diagram,
      ).toEqual([])
    }
  })
})
