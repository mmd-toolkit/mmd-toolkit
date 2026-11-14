/**
 * The rule `quadrant-no-duplicate-style`, on the examples of its document, on
 * the inputs of its fixture directory, and on a `classDef` whose name goes on
 * across a comment region, whose U+2028 is written as an escape.
 */
import { RuleTester } from "eslint"
import { quadrantNoDuplicateStyle } from "../../src/rules/quadrant-no-duplicate-style.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-duplicate-style", quadrantNoDuplicateStyle)

new RuleTester(LANGUAGE_CONFIG).run(
  "quadrant-no-duplicate-style",
  quadrantNoDuplicateStyle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/quadrant/class-name-comment-region-then-styles",
        filename: "class-name-comment-region-then-styles.mmd",
        code: `quadrantChart
  classDef a\u2028%% c
b color: #f00, color: #0f0
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier `color` with the value of this style.",
            line: 3,
            column: 16,
            endLine: 3,
            endColumn: 27,
            suggestions: [
              {
                desc: "Remove this style.",
                output: `quadrantChart
  classDef a\u2028%% c
b color: #f00
`,
              },
              {
                desc: "Remove the earlier style.",
                output: `quadrantChart
  classDef a\u2028%% c
b  color: #0f0
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
