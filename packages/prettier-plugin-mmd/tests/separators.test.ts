/**
 * Formats statements that `;` separates or ends, where the printer drops a
 * `;` that separates statements and keeps one that the line rule ignores or
 * that stands in a place where it matters (docs/flowchart.md, Semicolons):
 * every statement kind of flowchart and sequence diagrams in pairs, a
 * statement that ends with a word that reads the whitespace after it, a
 * Db text that reaches past the range of its node with `;` written in and
 * after it, lines that hold a `;` of their own, and a `;` after a comment,
 * after a subgraph name, and after empty description blocks.
 *
 * The inputs are the ones that the tests of `inputs/` make; the forms with
 * many axes are combined in pairs, and every input is tried once.
 */
import type { GeneratedInput } from "./generated.ts"
import { defineCheckedGroups } from "./checked-groups.ts"
import * as commentSemicolons from "./inputs/comment-semicolons.ts"
import * as emptyBlocks from "./inputs/empty-blocks.ts"
import * as ignoredSemicolons from "./inputs/ignored-semicolons.ts"
import * as lineSemicolons from "./inputs/line-semicolons.ts"
import * as statementPairs from "./inputs/statement-pairs.ts"
import * as subgraphNames from "./inputs/subgraph-names.ts"
import * as wordsBeforeSeparators from "./inputs/words-before-separators.ts"

/** The inputs without the ones that stand twice. */
function once(inputs: Iterable<GeneratedInput>): GeneratedInput[] {
  const seen = new Set<string>()
  const result: GeneratedInput[] = []
  for (const input of inputs) {
    if (seen.has(input.text)) continue
    seen.add(input.text)
    result.push(input)
  }
  return result
}

defineCheckedGroups("statements that `;` separates or ends", [
  ["two statements joined by a `;`", once(statementPairs.makeInputs())],
  [
    "a statement that ends with a word, then a `;`",
    once(wordsBeforeSeparators.makeInputs()),
  ],
  ["a Db text with `;` written in it", once(ignoredSemicolons.makeInputs())],
  [
    "a Db text with a `;` inserted at a word edge",
    once(ignoredSemicolons.makeSweepInputs()),
  ],
  ["a line that holds a `;` of its own", once(lineSemicolons.makeInputs())],
  [
    "a line that ends with a `;` after a comment",
    once(commentSemicolons.makeInputs()),
  ],
  [
    "a subgraph header whose name ends with a word",
    once(subgraphNames.makeInputs()),
  ],
  [
    "a statement that ends with empty description blocks",
    once(emptyBlocks.makeInputs()),
  ],
])
