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
              "mermaid.js replaces the description set on line 2 with the one of this `accDescr`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 17,
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
              "mermaid.js replaces the description set on line 2 with the one of this `accDescr`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 14,
          },
        ],
      },
    ],
  },
)
