/** The rule on its document examples, fixture files, and escaped whitespace. */
import { RuleTester } from "eslint"
import { architectureNoReversedMarker } from "../../src/rules/architecture-no-reversed-marker.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("architecture-no-reversed-marker", architectureNoReversedMarker)

new RuleTester(LANGUAGE_CONFIG).run(
  "architecture-no-reversed-marker",
  architectureNoReversedMarker,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/architecture/marker-lone-cr",
        filename: "marker-lone-cr.mmd",
        code: `architecture-beta\rservice a\rservice b\ra:T >-- B:b\r`,
        errors: [
          {
            messageId: "reversed",
            line: 4,
            column: 2,
            endLine: 4,
            endColumn: 11,
            suggestions: [
              {
                desc: "Write the markers as drawn.",
                output: `architecture-beta\rservice a\rservice b\ra:T <-- B:b\r`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/architecture/marker-crlf",
        filename:
          "tests/fixtures/rules/architecture-no-reversed-marker/invalid/architecture/marker-crlf-input.mmd",
        code: `architecture-beta\r
service api\r
service db\r
api:T >-- B:db\r
`,
        errors: [
          {
            message:
              "mermaid.js draws `>` before the line as `<` and `<` after the line as `>`.",
            line: 4,
            column: 4,
            endLine: 4,
            endColumn: 13,
            suggestions: [
              {
                desc: "Write the markers as drawn.",
                output: `architecture-beta\r
service api\r
service db\r
api:T <-- B:db\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
