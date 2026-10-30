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
              "mermaid.js replaces the earlier title with the one of this `title`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 10,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `wardley-beta
title A\tB`,
              },
              {
                desc: "Remove the earlier statement that sets the title.",
                output: `wardley-beta
title A B`,
              },
            ],
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
              "mermaid.js replaces the earlier title with the one of this `title`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 11,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `wardley-beta\rtitle First`,
              },
              {
                desc: "Remove the earlier statement that sets the title.",
                output: `wardley-beta\rtitle Last`,
              },
            ],
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
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `wardley-beta
accTitle: A\u2029B`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `wardley-beta
accTitle: A B`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/wardley/title-crlf-change",
        filename:
          "tests/fixtures/rules/wardley-no-duplicate-title/invalid/wardley/title-crlf-change-input.mmd",
        code: `wardley-beta\r
title First\r
title Last`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `title`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 11,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `wardley-beta\r
title First`,
              },
              {
                desc: "Remove the earlier statement that sets the title.",
                output: `wardley-beta\r
title Last`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/wardley/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/wardley-no-duplicate-title/invalid/wardley/title-equal-predecessor-crlf-input.mmd",
        code: `wardley-beta\r
accTitle: A\r
accTitle: A\r
accTitle: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `wardley-beta\r
accTitle: A\r
accTitle: A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
