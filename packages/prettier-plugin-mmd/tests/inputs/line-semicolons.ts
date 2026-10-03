/**
 * Formats lines that hold a `;` other than one that separates statements: in
 * a label without quotes, in a string, in an accessibility statement, with
 * the word `style` on the line or not, alone or with other statements on the
 * same line, also with a directive written over two lines. The line rule
 * ignores the last `;` of some lines, so removing a separating `;` or
 * splitting the line can change which `;` it ignores (docs/flowchart.md,
 * Statements one per line).
 */
import type { GeneratedInput } from "../generated.ts"
import { pairwiseIndexes } from "../pairwise.ts"

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

/**
 * Every combination, with the statement that holds a `;` first or second,
 * the axes together in pairs, in three passes (see `pairwise.ts`).
 */
export function makeInputs(): GeneratedInput[] {
  return pairwiseIndexes(
    [
      statementsWithSemicolons.length,
      otherStatements.length,
      separators.length,
      lineEnds.length,
      afterHeader.length,
      2,
    ],
    3,
  ).map(([withSemicolon, other, separator, lineEnd, header, order]) => {
    const held = statementsWithSemicolons[withSemicolon]
    const next = otherStatements[other]
    const line =
      next === ""
        ? held
        : order === 0
          ? `${held}${separators[separator]}${next}`
          : `${next}${separators[separator]}${held}`
    return {
      text: `flowchart LR${afterHeader[header]}${line}${lineEnds[lineEnd]}\n`,
      options: {},
    }
  })
}
