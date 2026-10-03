/**
 * The insertion test of the state diagram: the fixture inputs that `parse()`
 * accepts, with a text put at a place of each kind (`insertions.ts`), must
 * agree with the pinned mermaid.js, every difference a declared known
 * divergence that its own cause explains, and the tree of each accepted
 * input must pass the check of the tree.
 */
import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import { disagreementsOf, treeProblemsOf } from "./agreement.ts"
import type { DiagramInsertions } from "./insertions.ts"
import { idStartingWith, insertionGroupsOf } from "./insertions.ts"
import { inputsByOutcome } from "./mermaid-comparison.ts"
import { timeoutFor } from "./run-size.ts"

/**
 * The keywords of the state diagram: one word of each rule of
 * diagrams/state.md, Lexical structure, that reads a keyword unit (one
 * direction value, one pseudostate mark), since the words of one rule are
 * read in the same way.
 */
const KEYWORDS: readonly string[] = [
  "state",
  "as",
  "note",
  "left of",
  "right of",
  "end note",
  "classDef",
  "class",
  "style",
  "click",
  "href",
  "default",
  "direction",
  "LR",
  "scale",
  "width",
  "hide empty description",
  "<<choice>>",
  "accTitle",
  "accDescr",
  "stateDiagram",
  "stateDiagram-v2",
]

const STATE: DiagramInsertions = {
  // One for each rule: the quote of a floating note, the `,` of a list of
  // ids, the `--` of a concurrency divider, the `-->` of a transition, the
  // `:` of a description, the `:::` of a class, `[*]`, and the braces of a
  // body.
  separators: ['"', ",", "--", "-->", ":", ":::", "[*]", "{", "}"],
  lines: [
    // A line of an id that starts with each keyword, which the rule of the
    // keyword does not take.
    ...KEYWORDS.map((keyword) => `\n${idStartingWith(keyword)}`),
    // Such ids in a transition, before and after the arrow.
    "\nnotes --> stateful",
    "\nclassDefs --> hidden",
  ],
}

describe("the state parser agrees with mermaid.js on a text put at a place of each kind", async () => {
  const groups = insertionGroupsOf(await loadFixtures("state"), STATE)

  for (const group of groups) {
    const byOutcome = inputsByOutcome(group.inputs)
    it(
      `state / ${group.name}`,
      async () => {
        expect(treeProblemsOf(byOutcome.decided)).toEqual([])
        expect(await disagreementsOf(byOutcome)).toEqual([])
      },
      timeoutFor(group.inputs.length),
    )
  }
})
