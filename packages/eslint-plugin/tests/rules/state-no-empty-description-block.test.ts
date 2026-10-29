/**
 * The rule `state-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { stateNoEmptyDescriptionBlock } from "../../src/rules/state-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("state-no-empty-description-block", stateNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "state-no-empty-description-block",
  stateNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/state/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `stateDiagram-v2\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `stateDiagram-v2\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
