/** The rule `usecase-no-duplicate-title`, on its document examples and fixture inputs. */
import { RuleTester } from "eslint"
import { usecaseNoDuplicateTitle } from "../../src/rules/usecase-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("usecase-no-duplicate-title", usecaseNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "usecase-no-duplicate-title",
  usecaseNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/usecase/title-cr",
        filename: "title-cr.mmd",
        code: `usecase-beta
accTitle: First\raccTitle: Second\r`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 17,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `usecase-beta
accTitle: First\r`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `usecase-beta
accTitle: Second\r`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/usecase/title-unicode-separators",
        filename: "title-unicode-separators.mmd",
        code: `usecase-beta
accTitle: First\u2028More
accTitle: First\u2029More
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 21,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `usecase-beta
accTitle: First\u2028More
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `usecase-beta
accTitle: First\u2029More
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/usecase/title-crlf",
        filename:
          "tests/fixtures/rules/usecase-no-duplicate-title/invalid/usecase/title-crlf-input.mmd",
        code: `usecase-beta
accTitle: First\r
accTitle: Second\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 17,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `usecase-beta
accTitle: First\r
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `usecase-beta
accTitle: Second\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/usecase/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/usecase-no-duplicate-title/invalid/usecase/title-equal-predecessor-crlf-input.mmd",
        code: `usecase-beta\r
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
                output: `usecase-beta\r
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
