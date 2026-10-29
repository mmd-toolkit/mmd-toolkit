/**
 * The rule `er-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { erNoEmptyDescriptionBlock } from "../../src/rules/er-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("er-no-empty-description-block", erNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "er-no-empty-description-block",
  erNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/er/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `erDiagram\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `erDiagram\r
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/er/crlf",
        filename:
          "tests/fixtures/rules/er-no-empty-description-block/invalid/er/crlf-input.mmd",
        code: `erDiagram\r
A\r
accDescr {}\r
`,
        errors: [
          {
            message:
              "mermaid.js takes no description from this empty `accDescr` block: the description stays as it was before it.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `erDiagram\r
A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
