/**
 * Formats subgraph headers whose name ends with a word, with the ways that a
 * `;` and other text can end the header. In a name, the word `end` takes the
 * whitespace after it, line feeds included, so a `;` after it must stay, or
 * the next line becomes a part of the name (docs/flowchart.md, Statements one
 * per line).
 */
import { describe, expect, it } from "vitest"
import type { GeneratedInput } from "./generated.ts"
import { checkGeneratedInputs, describeReport } from "./generated.ts"

/** Names of every form that ends with the word `end` or only looks like it. */
const names: readonly string[] = [
  "Front end",
  "S end",
  "end",
  '"S" end',
  "a\tend",
  "S pend",
  "S End",
  "S endx",
  "a-end",
  "a end b",
  "S[T] end",
  "S [end]",
  "S end[T]",
]

/** What can end the header. */
const endings: readonly string[] = [
  ";",
  " ;",
  "  ;",
  "\t;",
  ";;",
  "; ",
  " ; ",
  ";\n",
  " accDescr {} ;",
  "%%{init: {}}%%;",
  " %%{init: {}}%%;",
]

/** Every name with every ending, with a member and the `end` line. */
function* makeInputs(): Generator<GeneratedInput> {
  for (const name of names) {
    for (const ending of endings) {
      yield {
        text: `flowchart LR\nsubgraph ${name}${ending}\nA\nend\n`,
        options: {},
      }
    }
  }
}

describe("a subgraph header whose name ends with a word", () => {
  it("is formatted without changing the diagram", async ({ annotate }) => {
    const report = await checkGeneratedInputs(makeInputs())
    await annotate(describeReport(report))
    expect(report.checked).toBeGreaterThan(0)
    expect(report.problems).toEqual([])
  }, 600_000)
})
