/**
 * The rule `quadrant-no-invalid-color`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { quadrantNoInvalidColor } from "../../src/rules/quadrant-no-invalid-color.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-invalid-color", quadrantNoInvalidColor)

const BARE =
  "mermaid.js accepts `f00` as a colour but writes it into the drawing as it is, which browsers do not read, so the colour is not drawn."

new RuleTester(LANGUAGE_CONFIG).run(
  "quadrant-no-invalid-color",
  quadrantNoInvalidColor,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/quadrant/point-color-cr",
        filename: "point-color-cr.mmd",
        code: `quadrantChart\r  Point A: [0.3, 0.5] color: f00, radius: 12\r`,
        errors: [
          { message: BARE, line: 2, column: 30, endLine: 2, endColumn: 33 },
        ],
        output: `quadrantChart\r  Point A: [0.3, 0.5] color: #f00, radius: 12\r`,
      },

      {
        name: "invalid/quadrant/point-color-crlf",
        filename:
          "tests/fixtures/rules/quadrant-no-invalid-color/invalid/quadrant/point-color-crlf-input.mmd",
        code: `quadrantChart\r
  Point A: [0.3, 0.5] color: f00, radius: 12\r
`,
        errors: [
          { message: BARE, line: 2, column: 30, endLine: 2, endColumn: 33 },
        ],
        output: `quadrantChart\r
  Point A: [0.3, 0.5] color: #f00, radius: 12\r
`,
      },

      {
        name: "invalid/quadrant/point-color-tab-after-colon",
        filename: "point-color-tab-after-colon.mmd",
        code: `quadrantChart
  Point A: [0.3, 0.5] color:\tf00
`,
        errors: [
          { message: BARE, line: 2, column: 30, endLine: 2, endColumn: 33 },
        ],
        output: `quadrantChart
  Point A: [0.3, 0.5] color:\t#f00
`,
      },
    ],
  },
)
