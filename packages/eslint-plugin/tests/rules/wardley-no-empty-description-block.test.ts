/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { wardleyNoEmptyDescriptionBlock } from "../../src/rules/wardley-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("wardley-no-empty-description-block", wardleyNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "wardley-no-empty-description-block",
  wardleyNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/wardley/description-empty-ps",
        filename: "description-empty-ps.mmd",
        code: `wardley-beta
accDescr { \u2029 }`,
        errors: [
          {
            message:
              "mermaid.js sets an empty description from this empty `accDescr` block, replacing any earlier description.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 15,
          },
        ],
      },
      {
        name: "invalid/wardley/empty-nbsp",
        filename: "empty-nbsp.mmd",
        code: `wardley-beta
accDescr {\u00a0}`,
        errors: [
          {
            message:
              "mermaid.js sets an empty description from this empty `accDescr` block, replacing any earlier description.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 13,
          },
        ],
      },
      {
        name: "invalid/wardley/empty-lone-cr",
        filename: "empty-lone-cr.mmd",
        code: `wardley-beta\raccDescr { \r }`,
        errors: [
          {
            message:
              "mermaid.js sets an empty description from this empty `accDescr` block, replacing any earlier description.",
            line: 2,
            column: 1,
            endLine: 3,
            endColumn: 3,
          },
        ],
      },
    ],
  },
)
