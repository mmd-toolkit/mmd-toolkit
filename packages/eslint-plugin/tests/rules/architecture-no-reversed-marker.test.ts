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
          },
        ],
      },
    ],
  },
)
