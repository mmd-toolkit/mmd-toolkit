/**
 * The rule `quadrant-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { quadrantNoEmptyDescriptionBlock } from "../../src/rules/quadrant-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-empty-description-block", quadrantNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "quadrant-no-empty-description-block",
  quadrantNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/quadrant/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `quadrantChart\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `quadrantChart\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
