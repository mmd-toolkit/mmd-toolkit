/**
 * Formats a `style`, `classDef`, `linkStyle` statement that stands after a
 * U+2028 or U+2029 on its line, with every ending of a line that holds a
 * `;`. The line rule of mermaid.js reads the text up to the character (common.md,
 * The `style` and `classDef` lines), and the printer prints the line from the
 * start of the statement, where the characters before it are gone: a `;` that
 * it keeps for a character that it does not print makes the next formatting
 * drop it.
 */
import type { GeneratedInput } from "../generated.ts"

/** The statements of the line rule, with the line before them. */
const statements: readonly string[] = [
  "linkStyle 0 stroke:red",
  "linkStyle default stroke:red",
  "style A fill:red",
  "classDef c fill:red",
]

/** What can stand before the statement on its line. */
const starts: readonly string[] = [
  "\u2028",
  "\u2029",
  "  \u2028",
  "\u2028 ",
  "A;\u2028",
  "A\u2028",
]

/** What can end the line. */
const endings: readonly string[] = [";", ";\n", " ;\n", ";;\n", ";\u2028\n"]

/** Every statement with every start and every ending. */
export function makeInputs(): GeneratedInput[] {
  const inputs: GeneratedInput[] = []
  for (const statement of statements) {
    for (const start of starts) {
      for (const ending of endings) {
        inputs.push({
          text: `flowchart LR\nA-->B\n${start}${statement}${ending}`,
          options: {},
        })
      }
    }
  }
  return inputs
}
