/**
 * Formats statements of every diagram type with a directive written at every
 * place inside them, also in the middle of a word, and with whitespace or a
 * `;` after the statement. A directive cuts a value into fragments, and what
 * formatting keeps as written, or reads at the end of a value, must not cut
 * a node in the middle (ast.md, Directive).
 */
import { describe, expect, it } from "vitest"
import type { GeneratedInput } from "./generated.ts"
import { checkGeneratedInputs, describeReport } from "./generated.ts"
import { diagrams } from "./generated-statements.ts"

/** A directive that changes nothing. */
const DIRECTIVE = "%%{init: {}}%%"

/** What follows the statement. */
const endings: readonly string[] = ["", " ", ";", " ;", "\t"]

/** Every statement with the directive at each of its offsets. */
function* makeInputs(): Generator<GeneratedInput> {
  for (const { header, statements, blockOpenings, blockClosing } of diagrams) {
    for (const statement of [...statements, ...blockOpenings]) {
      const closing = blockOpenings.includes(statement) ? blockClosing : ""
      for (let offset = 1; offset <= statement.length; offset++) {
        for (const ending of endings) {
          const cut = `${statement.slice(0, offset)}${DIRECTIVE}${statement.slice(offset)}`
          yield { text: `${header}\n${cut}${ending}${closing}\n`, options: {} }
        }
      }
    }
  }
}

describe("a statement with a directive inside it", () => {
  it("is formatted without changing the diagram", async ({ annotate }) => {
    const report = await checkGeneratedInputs(makeInputs())
    await annotate(describeReport(report))
    expect(report.checked).toBeGreaterThan(0)
    expect(report.problems).toEqual([])
  }, 1_800_000)
})
