/**
 * The rule `er-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { erNoDuplicateTitle } from "../../src/rules/er-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("er-no-duplicate-title", erNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "er-no-duplicate-title",
  erNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/er/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/er-no-duplicate-title/invalid/er/title-equal-predecessor-crlf-input.mmd",
        code: `erDiagram\r
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
                output: `erDiagram\r
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
