/**
 * The rule `gantt-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { ganttNoDuplicateTitle } from "../../src/rules/gantt-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-duplicate-title", ganttNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "gantt-no-duplicate-title",
  ganttNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/gantt/acc-title-twice-crlf",
        filename:
          "tests/fixtures/rules/gantt-no-duplicate-title/invalid/gantt/acc-title-twice-crlf-input.mmd",
        code: `gantt\r
dateFormat YYYY-MM-DD\r
accTitle: a\r
accTitle: b\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `gantt\r
dateFormat YYYY-MM-DD\r
accTitle: a\r
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `gantt\r
dateFormat YYYY-MM-DD\r
accTitle: b\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/gantt/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/gantt-no-duplicate-title/invalid/gantt/title-equal-predecessor-crlf-input.mmd",
        code: `gantt\r
accTitle: A\r
accTitle: A\r
accTitle: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `gantt\r
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
