/**
 * The rule `gantt-no-unknown-exclude`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { ganttNoUnknownExclude } from "../../src/rules/gantt-no-unknown-exclude.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-unknown-exclude", ganttNoUnknownExclude)

new RuleTester(LANGUAGE_CONFIG).run(
  "gantt-no-unknown-exclude",
  ganttNoUnknownExclude,
  {
    valid: [],
    invalid: [
      {
        name: "autofix-crlf",
        filename: "autofix-crlf.mmd",
        code: `gantt\r
excludes Sun\r
A : a, 2026-01-01, 1d\r
`,
        output: `gantt\r
excludes sunday\r
A : a, 2026-01-01, 1d\r
`,
        errors: [
          {
            message:
              "mermaid.js leaves out no day for `Sun`: it is neither `weekends` nor the name of a day, and it has no digit to be a date.",
            line: 2,
            column: 10,
            endLine: 2,
            endColumn: 13,
          },
        ],
      },
    ],
  },
)
