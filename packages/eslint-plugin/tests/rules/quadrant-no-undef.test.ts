/**
 * The rule `quadrant-no-undef`, on the examples of its document, on the inputs
 * of its fixture directory, and on a class name that goes on across a comment
 * region, whose U+2028 is written as an escape.
 */
import { RuleTester } from "eslint"
import { quadrantNoUndef } from "../../src/rules/quadrant-no-undef.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-undef", quadrantNoUndef)

new RuleTester(LANGUAGE_CONFIG).run("quadrant-no-undef", quadrantNoUndef, {
  valid: [
    {
      name: "valid/quadrant/class-name-comment-region-and-plain-class",
      filename: "class-name-comment-region-and-plain-class.mmd",
      code: `quadrantChart
classDef a\u2028%% c
b color: #f00
classDef a color: #0f0
P:::a: [0.5, 0.5]
`,
    },
  ],
  invalid: [
    {
      name: "invalid/quadrant/class-name-comment-region-is-longer-than-point-class",
      filename: "class-name-comment-region-is-longer-than-point-class.mmd",
      code: `quadrantChart
classDef a\u2028%% c
b color: #f00
P:::a: [0.5, 0.5]
`,
      errors: [
        {
          message:
            "mermaid.js gives this point no styles from `a`: no `classDef` of the chart defines this class.",
          line: 4,
          column: 5,
          endLine: 4,
          endColumn: 6,
        },
      ],
    },
  ],
})
