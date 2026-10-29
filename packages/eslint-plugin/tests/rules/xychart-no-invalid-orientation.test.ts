/**
 * The rule `xychart-no-invalid-orientation`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { xychartNoInvalidOrientation } from "../../src/rules/xychart-no-invalid-orientation.ts"
import { testRule } from "../rule-test.ts"

testRule("xychart-no-invalid-orientation", xychartNoInvalidOrientation)

new RuleTester(LANGUAGE_CONFIG).run(
  "xychart-no-invalid-orientation",
  xychartNoInvalidOrientation,
  {
    valid: [],
    invalid: [
      {
        name: "autofix-crlf",
        filename: "autofix-crlf.mmd",
        code: `xychart-beta HORIZONTAL\r
line [1, 2]\r
`,
        output: `xychart-beta horizontal\r
line [1, 2]\r
`,
        errors: [
          {
            message:
              "mermaid.js does not read `HORIZONTAL` as `horizontal`: the chart is vertical.",
            line: 1,
            column: 14,
            endLine: 1,
            endColumn: 24,
          },
        ],
      },
    ],
  },
)
