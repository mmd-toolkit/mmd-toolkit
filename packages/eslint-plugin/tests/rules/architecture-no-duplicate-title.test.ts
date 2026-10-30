/** The rule on its document examples, fixture files, and escaped whitespace. */
import { RuleTester } from "eslint"
import { architectureNoDuplicateTitle } from "../../src/rules/architecture-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("architecture-no-duplicate-title", architectureNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "architecture-no-duplicate-title",
  architectureNoDuplicateTitle,
  {
    valid: [
      {
        name: "valid/architecture/acctitle-space-tab-run-equivalent",
        filename: "acctitle-space-tab-run-equivalent.mmd",
        code: `architecture-beta
accTitle: A \tB
accTitle: A B
`,
      },
      {
        name: "valid/architecture/acctitle-line-separators-content",
        filename: "acctitle-line-separators-content.mmd",
        code: `architecture-beta
accTitle: A\u2028accTitle: B\u2029C
accTitle: A\u2028accTitle: B\u2029C
`,
      },
    ],
    invalid: [
      {
        name: "invalid/architecture/acctitle-whitespace-reset",
        filename: "acctitle-whitespace-reset.mmd",
        code: `architecture-beta
accTitle: First
accTitle: \t 
accTitle: Second
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 13,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `architecture-beta
accTitle: First
accTitle: Second
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `architecture-beta
accTitle: \t\u0020
accTitle: Second
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/architecture/acctitle-single-tab-distinct",
        filename: "acctitle-single-tab-distinct.mmd",
        code: `architecture-beta
accTitle: A\tB
accTitle: A B
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
                desc: "Remove this `accTitle` statement.",
                output: `architecture-beta
accTitle: A\tB
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `architecture-beta
accTitle: A B
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/architecture/acctitle-lone-cr",
        filename: "acctitle-lone-cr.mmd",
        code: `architecture-beta\raccTitle: First\raccTitle: Second\r`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 17,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `architecture-beta\raccTitle: First\r`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `architecture-beta\raccTitle: Second\r`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/architecture/acctitle-crlf",
        filename:
          "tests/fixtures/rules/architecture-no-duplicate-title/invalid/architecture/acctitle-crlf-input.mmd",
        code: `architecture-beta\r
accTitle: First\r
accTitle: Second\r
service api\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 17,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `architecture-beta\r
accTitle: First\r
service api\r
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `architecture-beta\r
accTitle: Second\r
service api\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/architecture/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/architecture-no-duplicate-title/invalid/architecture/title-equal-predecessor-crlf-input.mmd",
        code: `architecture-beta\r
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
                output: `architecture-beta\r
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
