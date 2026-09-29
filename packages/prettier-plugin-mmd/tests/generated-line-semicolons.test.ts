/**
 * Formats lines that hold a `;` other than one that separates statements: in
 * a label without quotes, in a string, in an accessibility statement, with
 * the word `style` on the line or not, alone or with other statements on the
 * same line, also with a directive written over two lines. The line rule
 * ignores the last `;` of some lines, so removing a separating `;` or
 * splitting the line can change which `;` it ignores (docs/flowchart.md,
 * Statements one per line).
 */
import { describe, expect, it } from "vitest"
import type { GeneratedInput } from "./generated.ts"
import { checkGeneratedInputs, describeReport } from "./generated.ts"

/** Statements that hold a `;` of their own. */
const statementsWithSemicolons: readonly string[] = [
  "A[x;]",
  'A["x;"]',
  "A[style:#x;]",
  'A["style:#x;"]',
  "A[mystyle: #x;]",
  "A[a#x;b]",
  "A-->|style:#x;|B",
  "accTitle: style:#x;y",
  "accDescr: a;b",
]

/** Statements to stand next to them on the line, or none. */
const otherStatements: readonly string[] = [
  "",
  "B",
  "B-->C",
  "B[y;]",
  "style B fill:#f00",
  "classDef c fill:#0f0",
]

/** What separates the two statements. */
const separators: readonly string[] = [
  ";",
  "; ",
  ";;",
  "; %%{init:\n{}}%% ",
  " %%{init:\n{}}%%;",
]

/** What ends the line. */
const lineEnds: readonly string[] = ["", ";", " ;", " %%{init:\n{}}%%"]

/** What stands between the header and the line: a line break, or a `;`. */
const afterHeader: readonly string[] = ["\n", ";"]

/** Every combination, with the statement that holds a `;` first or second. */
function* makeInputs(): Generator<GeneratedInput> {
  for (const withSemicolon of statementsWithSemicolons) {
    for (const other of otherStatements) {
      for (const separator of separators) {
        for (const lineEnd of lineEnds) {
          for (const header of afterHeader) {
            const orders =
              other === ""
                ? [withSemicolon]
                : [
                    `${withSemicolon}${separator}${other}`,
                    `${other}${separator}${withSemicolon}`,
                  ]
            for (const line of orders) {
              yield {
                text: `flowchart LR${header}${line}${lineEnd}\n`,
                options: {},
              }
            }
          }
        }
      }
    }
  }
}

describe("a line that holds a `;` of its own", () => {
  it("is formatted without changing the diagram", async ({ annotate }) => {
    const report = await checkGeneratedInputs(makeInputs())
    await annotate(describeReport(report))
    expect(report.checked).toBeGreaterThan(0)
    expect(report.problems).toEqual([])
  }, 600_000)
})
