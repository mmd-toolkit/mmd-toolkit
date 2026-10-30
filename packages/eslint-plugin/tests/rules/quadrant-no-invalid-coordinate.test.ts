/**
 * The rule `quadrant-no-invalid-coordinate`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { quadrantNoInvalidCoordinate } from "../../src/rules/quadrant-no-invalid-coordinate.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-invalid-coordinate", quadrantNoInvalidCoordinate)

new RuleTester(LANGUAGE_CONFIG).run(
  "quadrant-no-invalid-coordinate",
  quadrantNoInvalidCoordinate,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/quadrant/coordinate-crlf-inside-brackets",
        filename:
          "tests/fixtures/rules/quadrant-no-invalid-coordinate/invalid/quadrant/coordinate-crlf-inside-brackets-input.mmd",
        code: `quadrantChart
  A: [0.3,\r
 0,6]
`,
        output: `quadrantChart
  A: [0.3,\r
 0.6]
`,
        errors: [
          {
            message:
              "mermaid.js does not place this point inside the chart: `0,6` is not read as a number from 0 to 1.",
            line: 3,
            column: 2,
            endLine: 3,
            endColumn: 5,
          },
        ],
      },
    ],
  },
)
