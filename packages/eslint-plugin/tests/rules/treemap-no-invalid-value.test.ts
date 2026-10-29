/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { treemapNoInvalidValue } from "../../src/rules/treemap-no-invalid-value.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("treemap-no-invalid-value", treemapNoInvalidValue)

new RuleTester(LANGUAGE_CONFIG).run(
  "treemap-no-invalid-value",
  treemapNoInvalidValue,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/treemap/number-lone-cr-selector",
        filename: "number-lone-cr-selector.mmd",
        code: `treemap\r"A":1_000:::warm\rclassDef warm fill:red;\r`,
        output: `treemap\r"A":1000:::warm\rclassDef warm fill:red;\r`,
        errors: [
          {
            messageId: "invalid",
            data: { value: "1" },
            line: 2,
            column: 5,
            endLine: 2,
            endColumn: 10,
            suggestions: [],
          },
        ],
      },

      {
        name: "invalid/treemap/number-crlf-no-gap",
        filename:
          "tests/fixtures/rules/treemap-no-invalid-value/invalid/treemap/number-crlf-no-gap-input.mmd",
        code: `treemap\r
"Revenue":1_000%% estimated\r
`,
        output: `treemap\r
"Revenue":1000%% estimated\r
`,
        errors: [
          {
            message:
              "mermaid.js reads this value as `1` after removing its commas.",
            line: 2,
            column: 11,
            endLine: 2,
            endColumn: 16,
            suggestions: [],
          },
        ],
      },
    ],
  },
)
