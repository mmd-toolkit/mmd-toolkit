/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { wardleyNoDuplicateDescription } from "../../src/rules/wardley-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("wardley-no-duplicate-description", wardleyNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "wardley-no-duplicate-description",
  wardleyNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/wardley/description-block-ls-ps-indentation",
        filename: "description-block-ls-ps-indentation.mmd",
        code: `wardley-beta
accDescr { A  \u2028  B \u2029 C }
accDescr { A\u2028B\u2029C }`,
      },
      {
        name: "valid/wardley/description-lone-cr-indentation",
        filename: "description-lone-cr-indentation.mmd",
        code: `wardley-beta\raccDescr { A\r  B }\raccDescr { A
B }`,
      },
    ],
    invalid: [
      {
        name: "invalid/wardley/description-ps-change",
        filename: "description-ps-change.mmd",
        code: `wardley-beta
accDescr: A\u2029B
accDescr { A\u2029C }`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 17,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `wardley-beta
accDescr: A\u2029B`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `wardley-beta
accDescr { A\u2029C }`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/wardley/description-line-ls-kept",
        filename: "description-line-ls-kept.mmd",
        code: `wardley-beta
accDescr: A \u2028 B
accDescr: A\u2028B`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `wardley-beta
accDescr: A \u2028 B`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `wardley-beta
accDescr: A\u2028B`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/wardley/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/wardley-no-duplicate-description/invalid/wardley/description-equal-predecessor-crlf-input.mmd",
        code: `wardley-beta\r
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
                output: `wardley-beta\r
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
