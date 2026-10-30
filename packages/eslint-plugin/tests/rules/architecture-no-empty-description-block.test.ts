/** The rule on its document examples, fixture files, and escaped whitespace. */
import { RuleTester } from "eslint"
import { architectureNoEmptyDescriptionBlock } from "../../src/rules/architecture-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "architecture-no-empty-description-block",
  architectureNoEmptyDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "architecture-no-empty-description-block",
  architectureNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/architecture/empty-whitespace",
        filename: "empty-whitespace.mmd",
        code: `architecture-beta
accDescr { \t
 }
service api
`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 3,
            endColumn: 3,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `architecture-beta
service api
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/architecture/empty-ls-ps",
        filename: "empty-ls-ps.mmd",
        code: `architecture-beta
accDescr {\u2028\u2029}
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
                output: `architecture-beta
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/architecture/empty-nbsp",
        filename: "empty-nbsp.mmd",
        code: `architecture-beta
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
                output: `architecture-beta
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/architecture/empty-lone-cr",
        filename: "empty-lone-cr.mmd",
        code: `architecture-beta\raccDescr {\r \t\r}\r`,
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
                output: `architecture-beta\r`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/architecture/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `architecture-beta\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `architecture-beta\r
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/architecture/empty-crlf",
        filename:
          "tests/fixtures/rules/architecture-no-empty-description-block/invalid/architecture/empty-crlf-input.mmd",
        code: `architecture-beta\r
accDescr {\r
}\r
service api\r
`,
        errors: [
          {
            message:
              "mermaid.js sets an empty description from this empty `accDescr` block, replacing any earlier description.",
            line: 2,
            column: 1,
            endLine: 3,
            endColumn: 2,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `architecture-beta\r
service api\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
