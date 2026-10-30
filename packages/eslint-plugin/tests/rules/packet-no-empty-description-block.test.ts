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
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `packet
0: "Flag"
`,
              },
            ],
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
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `packet
`,
              },
            ],
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
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `packet\r`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/packet/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `packet\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `packet\r
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/packet/empty-crlf",
        filename:
          "tests/fixtures/rules/packet-no-empty-description-block/invalid/packet/empty-crlf-input.mmd",
        code: `packet\r
accDescr {\r
 \t\r
}\r
0: "Flag"\r
`,
        errors: [
          {
            message:
              "mermaid.js sets an empty description from this empty `accDescr` block, replacing any earlier description.",
            line: 2,
            column: 1,
            endLine: 4,
            endColumn: 2,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `packet\r
0: "Flag"\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
