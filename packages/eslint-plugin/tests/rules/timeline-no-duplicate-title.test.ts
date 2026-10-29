/**
 * The rule `timeline-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { timelineNoDuplicateTitle } from "../../src/rules/timeline-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("timeline-no-duplicate-title", timelineNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "timeline-no-duplicate-title",
  timelineNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/timeline/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/timeline-no-duplicate-title/invalid/timeline/title-equal-predecessor-crlf-input.mmd",
        code: `timeline\r
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
                output: `timeline\r
accTitle: A\r
accTitle: A\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/timeline/title-takes-next-line-crlf",
        filename:
          "tests/fixtures/rules/timeline-no-duplicate-title/invalid/timeline/title-takes-next-line-crlf-input.mmd",
        code: `timeline\r
  title T\r
  title\r
  2020 : a\r
  2021 : b\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `title`.",
            line: 3,
            column: 3,
            endLine: 4,
            endColumn: 11,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `timeline\r
  title T\r
  2021 : b\r
`,
              },
              {
                desc: "Remove the earlier statement that sets the title.",
                output: `timeline\r
  title\r
  2020 : a\r
  2021 : b\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/timeline/title-twice-crlf",
        filename:
          "tests/fixtures/rules/timeline-no-duplicate-title/invalid/timeline/title-twice-crlf-input.mmd",
        code: `timeline\r
  title A\r
  title B\r
  2020 : a\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `title`.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 10,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `timeline\r
  title A\r
  2020 : a\r
`,
              },
              {
                desc: "Remove the earlier statement that sets the title.",
                output: `timeline\r
  title B\r
  2020 : a\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
