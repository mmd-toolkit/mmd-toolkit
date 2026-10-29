/** The rule on its document examples, fixture files, and escaped whitespace. */
import { RuleTester } from "eslint"
import { architectureNoDuplicateDescription } from "../../src/rules/architecture-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "architecture-no-duplicate-description",
  architectureNoDuplicateDescription,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "architecture-no-duplicate-description",
  architectureNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/architecture/description-block-ls",
        filename: "description-block-ls.mmd",
        code: `architecture-beta
accDescr {First\u2028 Second}
accDescr {First\u2028Second}
service api
`,
      },
      {
        name: "valid/architecture/description-block-ps",
        filename: "description-block-ps.mmd",
        code: `architecture-beta
accDescr {First\u2029 Second}
accDescr {First\u2029Second}
service api
`,
      },
      {
        name: "valid/architecture/description-lone-cr-equivalent",
        filename: "description-lone-cr-equivalent.mmd",
        code: `architecture-beta
accDescr { A\r  B }
accDescr {A
B}
`,
      },

      {
        name: "valid/architecture/description-crlf-equivalent",
        filename:
          "tests/fixtures/rules/architecture-no-duplicate-description/valid/architecture/description-crlf-equivalent-input.mmd",
        code: `architecture-beta\r
accDescr { First\r
Second }\r
accDescr {First\r
Second}\r
service api\r
`,
      },
    ],
    invalid: [
      {
        name: "invalid/architecture/description-line-ls",
        filename: "description-line-ls.mmd",
        code: `architecture-beta
accDescr: First\u2028 Second
accDescr: First\u2028Second
service api
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 23,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `architecture-beta
accDescr: First\u2028 Second
service api
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `architecture-beta
accDescr: First\u2028Second
service api
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/architecture/description-line-whitespace-reset",
        filename: "description-line-whitespace-reset.mmd",
        code: `architecture-beta
accDescr: First
accDescr: \t 
accDescr: Second
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
                desc: "Remove this statement.",
                output: `architecture-beta
accDescr: First
accDescr: Second
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `architecture-beta
accDescr: \t\u0020
accDescr: Second
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/architecture/description-line-ps-is-text",
        filename: "description-line-ps-is-text.mmd",
        code: `architecture-beta
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
                output: `architecture-beta
accDescr: A\u2029 B
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `architecture-beta
accDescr: A\u2029B
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/architecture/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/architecture-no-duplicate-description/invalid/architecture/description-equal-predecessor-crlf-input.mmd",
        code: `architecture-beta\r
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
                output: `architecture-beta\r
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
