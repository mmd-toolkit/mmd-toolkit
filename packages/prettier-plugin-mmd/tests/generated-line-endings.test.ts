/**
 * Formats statements of every diagram type with every kind of ending that a
 * line can have: `;` alone, in runs, and with whitespace around it; a
 * directive on either side of it; empty description blocks; whitespace and a
 * `:` at the end of a value, and a directive cutting a value. Formatting
 * moves, drops, or keeps the `;`, and keeps or drops whitespace at the end
 * of a line, and a second formatting must give the first one's text back
 * while the diagram stays the same (docs/flowchart.md, Semicolons;
 * docs/state.md, Descriptions and labels).
 */
import { describe, expect, it } from "vitest"
import type { GeneratedInput } from "./generated.ts"
import { checkGeneratedInputs, describeReport } from "./generated.ts"
import { diagrams } from "./generated-statements.ts"

/** What can end a line after the statement. */
const endings: readonly string[] = [
  "",
  ";",
  " ;",
  "; ",
  " ; ",
  ";;",
  "; ;",
  " ; ; ",
  ";\t",
  "\t;",
  ";%%{init: {}}%%",
  " %%{init: {}}%% ;",
  "%%{init: {}}%% ; ",
  ";\n;",
  "; accDescr {}",
  " accDescr {} ;",
  " ",
  ": ",
  ":  ;",
  "x: ",
  "x%%{init: {}}%%y: ",
  ";x: ",
]

/**
 * Every statement with every ending, alone and followed by another line;
 * and every block opening with every ending, with a member and its closing
 * line.
 */
function* makeInputs(): Generator<GeneratedInput> {
  for (const { header, statements, blockOpenings, blockClosing } of diagrams) {
    for (const ending of endings) {
      for (const statement of statements) {
        yield { text: `${header}\n${statement}${ending}\n`, options: {} }
        yield { text: `${header}\n${statement}${ending}\nA\n`, options: {} }
      }
      for (const opening of blockOpenings) {
        yield {
          text: `${header}\n${opening}${ending}\nA${blockClosing}\n`,
          options: {},
        }
      }
    }
  }
}

describe("a statement with every ending of a line", () => {
  it("is formatted without changing the diagram", async ({ annotate }) => {
    const report = await checkGeneratedInputs(makeInputs())
    await annotate(describeReport(report))
    expect(report.checked).toBeGreaterThan(0)
    expect(report.problems).toEqual([])
  }, 1_800_000)
})
