/**
 * The rule `sankey-no-invalid-value`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { sankeyNoInvalidValue } from "../../src/rules/sankey-no-invalid-value.ts"
import { testRule } from "../rule-test.ts"

testRule("sankey-no-invalid-value", sankeyNoInvalidValue)

new RuleTester(LANGUAGE_CONFIG).run(
  "sankey-no-invalid-value",
  sankeyNoInvalidValue,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/sankey/value-text-after-number-crlf",
        filename:
          "tests/fixtures/rules/sankey-no-invalid-value/invalid/sankey/value-text-after-number-crlf-input.mmd",
        code: `sankey\r
a,b,1x\r
`,
        output: null,
        errors: [
          {
            message:
              "mermaid.js reads only the number at the start of this value and drops the rest of it.",
            line: 2,
            column: 5,
            endLine: 2,
            endColumn: 7,
            suggestions: [],
          },
        ],
      },

      {
        name: "autofix-crlf",
        filename: "autofix-crlf.mmd",
        code: `sankey-beta\r
a,b,0x10\r
`,
        output: `sankey-beta\r
a,b,16\r
`,
        errors: [
          {
            message:
              "mermaid.js reads only the number at the start of this value and drops the rest of it.",
            line: 2,
            column: 5,
            endLine: 2,
            endColumn: 9,
            suggestions: [],
          },
        ],
      },
    ],
  },
)
