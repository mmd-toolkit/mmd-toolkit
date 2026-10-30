/**
 * The rule `journey-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { journeyNoEmptyDescriptionBlock } from "../../src/rules/journey-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("journey-no-empty-description-block", journeyNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "journey-no-empty-description-block",
  journeyNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/journey/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `journey\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `journey\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
