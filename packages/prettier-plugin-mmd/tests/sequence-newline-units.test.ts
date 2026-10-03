/**
 * Formats every statement of a sequence diagram that needs a `newline` unit
 * (diagrams/sequence.md, Empty description blocks before a separator:
 * participant, destroy, message, `autonumber`, activate and deactivate,
 * note, and links, link, properties, and details statements) with
 * directives, whitespace, and a `;` after it, and a next statement. Whitespace at the end
 * of a line hides the line break from such a statement, so a `;` that the
 * printer dropped after a directive can make the printed text rejected; the
 * printer keeps it after the two statements whose last unit reads no
 * whitespace (`findLinesAfterUnitsThatReadNoWhitespace`), and this test
 * checks that the others, and the list of the specification, need no more.
 */
import type { GeneratedInput } from "./generated.ts"
import { defineCheckedGroups } from "./checked-groups.ts"
import { pairwiseIndexes } from "./pairwise.ts"

/** The statements that need a `newline` unit, in the forms that end differently. */
const statements: readonly string[] = [
  "participant A",
  'participant A@{ "type": "actor" }',
  'participant A@{ "type" : "boundary" }',
  'actor A@{ "type": "actor" }',
  "actor A",
  "participant A as x",
  'participant A@{ "type": "actor" } as x',
  "destroy A",
  "A->>B: x",
  "A->>B:",
  "autonumber",
  "autonumber 5",
  "autonumber 5 2",
  "autonumber off",
  "activate A",
  "deactivate A",
  "Note over A: x",
  "Note over A: ",
  'links A: {"x": "u"}',
  "link A: x @ u",
  'properties A: {"x": "y"}',
  'details A: {"x": "y"}',
]

const DIRECTIVE = "%%{wrap}%%"

/** What stands between the statement and its `;`: whitespace and directives. */
const runs: readonly string[] = [
  "",
  " ",
  DIRECTIVE,
  ` ${DIRECTIVE}`,
  `${DIRECTIVE} `,
  ` ${DIRECTIVE} `,
  `${DIRECTIVE}${DIRECTIVE}`,
  `${DIRECTIVE} ${DIRECTIVE}`,
  ` ${DIRECTIVE} ${DIRECTIVE}`,
  "\u2028",
  `\u2028${DIRECTIVE}`,
]

/** What follows the run. */
const ends: readonly string[] = [";", " ;", "; ", ";;"]

/** What follows the `;`: a line break and a next statement. */
const nexts: readonly string[] = ["\nA->>B: z\n", "\n%% c\nA->>B: z\n", "\n"]

/** Every statement with the runs, ends, and next lines together in pairs, in two passes. */
function makeInputs(): GeneratedInput[] {
  return pairwiseIndexes(
    [statements.length, runs.length, ends.length, nexts.length],
    2,
  ).map(([statement, run, end, next]) => ({
    text: `sequenceDiagram\nparticipant A\nparticipant B\n${statements[statement]}${runs[run]}${ends[end]}${nexts[next]}`,
    options: {},
  }))
}

defineCheckedGroups("sequence statements that need a `newline` unit", [
  ["statements with directives and a `;` after them", makeInputs()],
])
