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
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 4,
            column: 3,
            endLine: 4,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `flowchart LR
  A
  accTitle: a\u2028b
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
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
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 21,
            suggestions: [
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `flowchart LR
  accTitle: style:#b;\u2028
  A
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/flowchart/db-duplicate-title-crlf",
        filename:
          "tests/fixtures/rules/flowchart-no-duplicate-title/invalid/flowchart/db-duplicate-title-crlf-input.mmd",
        code: `flowchart LR\r
  A\r
  accTitle: a\r
  accTitle: b\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 4,
            column: 3,
            endLine: 4,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `flowchart LR\r
  A\r
  accTitle: a\r
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `flowchart LR\r
  A\r
  accTitle: b\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/flowchart/db-duplicate-title-duplicate-cr",
        filename:
          "tests/fixtures/rules/flowchart-no-duplicate-title/invalid/flowchart/db-duplicate-title-duplicate-cr-input.mmd",
        code: `flowchart LR\r  accTitle: a\r  accTitle: b\r`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `flowchart LR\r  accTitle: a\r`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `flowchart LR\r  accTitle: b\r`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/flowchart/db-duplicate-title-ignored-semicolon-cr",
        filename:
          "tests/fixtures/rules/flowchart-no-duplicate-title/invalid/flowchart/db-duplicate-title-ignored-semicolon-cr-input.mmd",
        code: `flowchart LR\r  accTitle: a\r  accTitle: style:#b;\r`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 21,
            suggestions: [
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `flowchart LR\r  accTitle: style:#b;\r`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/flowchart/db-duplicate-title-ignored-semicolon-crlf",
        filename:
          "tests/fixtures/rules/flowchart-no-duplicate-title/invalid/flowchart/db-duplicate-title-ignored-semicolon-crlf-input.mmd",
        code: `flowchart LR\r
  accTitle: a\r
  accTitle: style:#b;\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 21,
            suggestions: [
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `flowchart LR\r
  accTitle: style:#b;\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/flowchart/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/flowchart-no-duplicate-title/invalid/flowchart/title-equal-predecessor-crlf-input.mmd",
        code: `flowchart LR\r
accTitle: A\r
accTitle: A\r
accTitle: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `flowchart LR\r
accTitle: A\r
accTitle: A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
