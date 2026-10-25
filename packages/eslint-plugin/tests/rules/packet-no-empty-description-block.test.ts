/** The rule on its document examples, fixture files, and escaped whitespace. */
import { RuleTester } from "eslint"
import { packetNoEmptyDescriptionBlock } from "../../src/rules/packet-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("packet-no-empty-description-block", packetNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "packet-no-empty-description-block",
  packetNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/packet/empty-ls-whitespace",
        filename: "empty-ls-whitespace.mmd",
        code: `packet
accDescr {\u2028\u2029}
0: "Flag"
`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 14,
          },
        ],
      },
      {
        name: "invalid/packet/empty-nbsp",
        filename: "empty-nbsp.mmd",
        code: `packet
accDescr {\u00A0}
`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 13,
          },
        ],
      },
      {
        name: "invalid/packet/empty-lone-cr",
        filename: "empty-lone-cr.mmd",
        code: `packet\raccDescr {\r \t\r}\r`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 4,
            endColumn: 2,
          },
        ],
      },
    ],
  },
)
