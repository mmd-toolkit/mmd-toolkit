/**
 * The rule `state-no-unclosed-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { stateNoUnclosedDescriptionBlock } from "../../src/rules/state-no-unclosed-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("state-no-unclosed-description-block", stateNoUnclosedDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "state-no-unclosed-description-block",
  stateNoUnclosedDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/state/closing-crlf-with-tab",
        filename: "input.mmd",
        code: `stateDiagram-v2\r
accDescr { First\tline\r
A --> B\r
`,
        errors: [
          {
            messageId: "unclosed",
            suggestions: [
              {
                desc: "Close the block at the end of the text.",
                output: `stateDiagram-v2\r
accDescr { First\tline\r
A --> B\r
}\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
