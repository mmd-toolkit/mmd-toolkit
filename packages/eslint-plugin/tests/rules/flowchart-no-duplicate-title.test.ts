/**
 * The rule `flowchart-no-duplicate-title`, on the examples of its document and
 * on the inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { flowchartNoDuplicateTitle } from "../../src/rules/flowchart-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-duplicate-title", flowchartNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "flowchart-no-duplicate-title",
  flowchartNoDuplicateTitle,
  {
    valid: [
      {
        name: "a title containing a line separator and another title keyword",
        filename: "input.mmd",
        code: `flowchart LR
  A
  accTitle: a\u2028accTitle: b
`,
      },
    ],
    invalid: [
      {
        name: "a line separator inside a title before another title",
        filename: "input.mmd",
        code: `flowchart LR
  A
  accTitle: a\u2028b
  accTitle: c
`,
        errors: [
          {
            message:
              "mermaid.js replaces the title set on line 3 with the one of this `accTitle`.",
            line: 4,
            column: 3,
            endLine: 4,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement: mermaid.js uses the last title that remains.",
                output: `flowchart LR
  A
  accTitle: a\u2028b
`,
              },
              {
                desc: "Remove the `accTitle` statement on line 3: mermaid.js uses the last title that remains.",
                output: `flowchart LR
  A
  accTitle: c
`,
              },
            ],
          },
        ],
      },
      {
        name: "an ignored semicolon before a line separator and another title",
        filename: "input.mmd",
        code: `flowchart LR
  accTitle: a
  accTitle: style:#b;\u2028
  A
`,
        errors: [
          {
            message:
              "mermaid.js replaces the title set on line 2 with the one of this `accTitle`.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 21,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement: mermaid.js uses the last title that remains.",
                output: `flowchart LR
  accTitle: a
  A
`,
              },
              {
                desc: "Remove the `accTitle` statement on line 2: mermaid.js uses the last title that remains.",
                output: `flowchart LR
  accTitle: style:#b;\u2028
  A
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
