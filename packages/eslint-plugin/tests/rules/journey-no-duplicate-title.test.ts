/**
 * The rule `journey-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { journeyNoDuplicateTitle } from "../../src/rules/journey-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("journey-no-duplicate-title", journeyNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "journey-no-duplicate-title",
  journeyNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/journey/acc-title-twice-crlf",
        filename:
          "tests/fixtures/rules/journey-no-duplicate-title/invalid/journey/acc-title-twice-crlf-input.mmd",
        code: `journey\r
  accTitle: a\r
  accTitle: b\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `journey\r
  accTitle: a\r
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `journey\r
  accTitle: b\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/journey/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/journey-no-duplicate-title/invalid/journey/title-equal-predecessor-crlf-input.mmd",
        code: `journey\r
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
                output: `journey\r
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
