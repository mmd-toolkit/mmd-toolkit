/**
 * Formats statements of every diagram type with the shapes that a line can
 * take: every ending of a line (`;` alone, in runs, and with whitespace or a
 * directive around it, empty description blocks, and whitespace and a `:` at
 * the end of a value), a directive written at every offset inside a
 * statement, a statement that goes on over a line break, a click statement
 * written over several lines, a style line that stands after U+2028 or U+2029,
 * and comment lines after U+2028 or U+2029 at the
 * end of a statement.
 *
 * The inputs are the ones that the tests of `inputs/` make, every input
 * tried once.
 */
import type { GeneratedInput } from "./generated.ts"
import { defineCheckedGroups } from "./checked-groups.ts"
import * as clickLines from "./inputs/click-lines.ts"
import * as commentLines from "./inputs/comment-lines.ts"
import * as danglingLines from "./inputs/dangling-lines.ts"
import * as directiveCuts from "./inputs/directive-cuts.ts"
import * as lineEndings from "./inputs/line-endings.ts"
import * as styleLineStarts from "./inputs/style-line-starts.ts"

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

defineCheckedGroups("the shapes of a line", [
  ["a statement with every ending of a line", once(lineEndings.makeInputs())],
  ["a statement with a directive inside it", once(directiveCuts.makeInputs())],
  [
    "a statement that goes on over a line break",
    once(danglingLines.makeInputs()),
  ],
  ["a click statement over several lines", once(clickLines.makeInputs())],
  [
    "a style line that starts after U+2028 or U+2029",
    once(styleLineStarts.makeInputs()),
  ],
  [
    "comment lines after U+2028 or U+2029 at the end of a statement",
    once(commentLines.makeInputs()),
  ],
])
