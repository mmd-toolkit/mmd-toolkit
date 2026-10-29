/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { cynefinNoDuplicateDescription } from "../../src/rules/cynefin-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("cynefin-no-duplicate-description", cynefinNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "cynefin-no-duplicate-description",
  cynefinNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/cynefin/description-block-ls-same",
        filename: "description-block-ls-same.mmd",
        code: `cynefin-beta
accDescr {A\u2028  B}
accDescr {A\u2028B}`,
      },
      {
        name: "valid/cynefin/description-block-ps-same",
        filename: "description-block-ps-same.mmd",
        code: `cynefin-beta:
accDescr {A \u2029  B}
accDescr {A\u2029B}`,
      },
      {
        name: "valid/cynefin/description-lone-cr-equivalent",
        filename: "description-lone-cr-equivalent.mmd",
        code: `cynefin-beta
accDescr { A\r  B }
accDescr {A
B}`,
      },

      {
        name: "valid/cynefin/description-crlf",
        filename:
          "tests/fixtures/rules/cynefin-no-duplicate-description/valid/cynefin/description-crlf-input.mmd",
        code: `cynefin-beta\r
accDescr { A\r
 B }\r
accDescr { A
 B }`,
      },
    ],
    invalid: [
      {
        name: "invalid/cynefin/description-line-ls-different",
        filename: "description-line-ls-different.mmd",
        code: `cynefin-beta
accDescr: A\u2028 B
accDescr {A\u2028B}`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 15,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `cynefin-beta
accDescr: A\u2028 B`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `cynefin-beta
accDescr {A\u2028B}`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/cynefin/description-line-ps-different",
        filename: "description-line-ps-different.mmd",
        code: `cynefin-beta
accDescr: A\u2029 B
accDescr: A\u2029B`,
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
                output: `cynefin-beta
accDescr: A\u2029 B`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `cynefin-beta
accDescr: A\u2029B`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/cynefin/description-whitespace-reset-history",
        filename: "description-whitespace-reset-history.mmd",
        code: `cynefin-beta
accDescr: First
accDescr: \t 
accDescr: Second`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 13,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `cynefin-beta
accDescr: First
accDescr: Second`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `cynefin-beta
accDescr: \t\u0020
accDescr: Second`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/cynefin/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/cynefin-no-duplicate-description/invalid/cynefin/description-equal-predecessor-crlf-input.mmd",
        code: `cynefin-beta\r
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
                output: `cynefin-beta\r
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
