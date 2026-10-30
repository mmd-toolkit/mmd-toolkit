/**
 * The rule `xychart-no-unclosed-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { xychartNoUnclosedDescriptionBlock } from "../../src/rules/xychart-no-unclosed-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "xychart-no-unclosed-description-block",
  xychartNoUnclosedDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "xychart-no-unclosed-description-block",
  xychartNoUnclosedDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/xychart/closing-crlf-with-tab",
        filename: "input.mmd",
        code: `xychart\r
accDescr { First\tline\r
line [1]\r
`,
        errors: [
          {
            messageId: "unclosed",
            suggestions: [
              {
                desc: "Close the block at the end of the text.",
                output: `xychart\r
accDescr { First\tline\r
line [1]\r
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
