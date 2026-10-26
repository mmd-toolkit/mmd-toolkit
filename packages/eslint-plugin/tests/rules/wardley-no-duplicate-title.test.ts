/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { wardleyNoDuplicateTitle } from "../../src/rules/wardley-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("wardley-no-duplicate-title", wardleyNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "wardley-no-duplicate-title",
  wardleyNoDuplicateTitle,
  {
    valid: [
      {
        name: "valid/wardley/title-same-normalized",
        filename: "title-same-normalized.mmd",
        code: `wardley-beta
title A  B
title\tA B`,
      },
      {
        name: "valid/wardley/title-line-separator-normalized",
        filename: "title-line-separator-normalized.mmd",
        code: `wardley-beta
title A\u2028B
title A\u2028B`,
      },
    ],
    invalid: [
      {
        name: "invalid/wardley/title-single-tab-kept",
        filename: "title-single-tab-kept.mmd",
        code: `wardley-beta
title A\tB
title A B`,
        errors: [
          {
            message:
              "mermaid.js replaces the title set on line 2 with the one of this `title`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 10,
          },
        ],
      },
      {
        name: "invalid/wardley/title-lone-cr-change",
        filename: "title-lone-cr-change.mmd",
        code: `wardley-beta\rtitle First\rtitle Last`,
        errors: [
          {
            message:
              "mermaid.js replaces the title set on line 2 with the one of this `title`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 11,
          },
        ],
      },
      {
        name: "invalid/wardley/title-ps-kept",
        filename: "title-ps-kept.mmd",
        code: `wardley-beta
accTitle: A\u2029B
accTitle: A B`,
        errors: [
          {
            message:
              "mermaid.js replaces the accessible title set on line 2 with the one of this `accTitle`.",
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
