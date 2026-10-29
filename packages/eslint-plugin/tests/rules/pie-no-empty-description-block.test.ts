/** The rule on its document examples, fixture files, and escaped whitespace. */
import { RuleTester } from "eslint"
import { pieNoEmptyDescriptionBlock } from "../../src/rules/pie-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("pie-no-empty-description-block", pieNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "pie-no-empty-description-block",
  pieNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/pie/empty-block-unicode-whitespace",
        filename: "empty-block-unicode-whitespace.mmd",
        code: `pie
accDescr {\u00a0\u2028\u2029\ufeff}`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 16,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `pie`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/pie/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `pie\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `pie\r
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/pie/empty-block-crlf",
        filename:
          "tests/fixtures/rules/pie-no-empty-description-block/invalid/pie/empty-block-crlf-input.mmd",
        code: `pie\r
accDescr {\r
 \t\r
}\r
`,
        errors: [
          {
            message:
              "mermaid.js sets an empty description from this empty `accDescr` block, replacing any earlier description.",
            line: 2,
            column: 1,
            endLine: 4,
            endColumn: 2,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `pie\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
