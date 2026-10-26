/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { radarNoEmptyDescriptionBlock } from "../../src/rules/radar-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("radar-no-empty-description-block", radarNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "radar-no-empty-description-block",
  radarNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/radar/empty-block-space",
        filename: "empty-block-space.mmd",
        code: `radar-beta
accDescr { 
 \t}
axis A, B, C
curve sales{1,2,3}
`,
        errors: [
          { messageId: "empty", line: 2, column: 1, endLine: 3, endColumn: 4 },
        ],
      },
      {
        name: "invalid/radar/block-ls-ps-whitespace",
        filename: "block-ls-ps-whitespace.mmd",
        code: `radar-beta
accDescr {\u2028 \u2029}
`,
        errors: [
          { messageId: "empty", line: 2, column: 1, endLine: 2, endColumn: 15 },
        ],
      },
      {
        name: "invalid/radar/block-lone-cr-whitespace",
        filename: "block-lone-cr-whitespace.mmd",
        code: `radar-beta
accDescr {\r  }
`,
        errors: [
          { messageId: "empty", line: 2, column: 1, endLine: 3, endColumn: 4 },
        ],
      },
    ],
  },
)
