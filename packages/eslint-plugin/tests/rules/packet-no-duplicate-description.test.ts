/** The rule on its document examples, fixture files, and escaped whitespace. */
import { RuleTester } from "eslint"
import { packetNoDuplicateDescription } from "../../src/rules/packet-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("packet-no-duplicate-description", packetNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "packet-no-duplicate-description",
  packetNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/packet/description-block-ls-equivalent",
        filename: "description-block-ls-equivalent.mmd",
        code: `packet
accDescr { A\u2028 B }
accDescr { A\u2028B }
`,
      },
      {
        name: "valid/packet/description-block-ps-equivalent",
        filename: "description-block-ps-equivalent.mmd",
        code: `packet
accDescr { A\u2029 B }
accDescr { A\u2029B }
`,
      },
      {
        name: "valid/packet/description-lone-cr-equivalent",
        filename: "description-lone-cr-equivalent.mmd",
        code: `packet
accDescr {A\r  B}
accDescr {A
B}
`,
      },

      {
        name: "valid/packet/description-crlf-equivalent",
        filename:
          "tests/fixtures/rules/packet-no-duplicate-description/valid/packet/description-crlf-equivalent-input.mmd",
        code: `packet\r
accDescr { A\r
B }\r
accDescr { A
B }
`,
      },
    ],
    invalid: [
      {
        name: "invalid/packet/description-line-ls-distinct",
        filename: "description-line-ls-distinct.mmd",
        code: `packet
accDescr: A\u2028 B
accDescr: A\u2028B
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `packet
accDescr: A\u2028 B
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `packet
accDescr: A\u2028B
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/packet/description-line-ps-distinct",
        filename: "description-line-ps-distinct.mmd",
        code: `packet
accDescr: A\u2029 B
accDescr: A\u2029B
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `packet
accDescr: A\u2029 B
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `packet
accDescr: A\u2029B
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/packet/description-line-block-ls-different",
        filename: "description-line-block-ls-different.mmd",
        code: `packet
accDescr: A \u2028 B
accDescr { A \u2028 B }
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 19,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `packet
accDescr: A \u2028 B
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `packet
accDescr { A \u2028 B }
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/packet/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/packet-no-duplicate-description/invalid/packet/description-equal-predecessor-crlf-input.mmd",
        code: `packet\r
accDescr: A\r
accDescr: A\r
accDescr: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `packet\r
accDescr: A\r
accDescr: A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
