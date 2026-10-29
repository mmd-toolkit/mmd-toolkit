/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { treemapNoEmptyDescriptionBlock } from "../../src/rules/treemap-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("treemap-no-empty-description-block", treemapNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "treemap-no-empty-description-block",
  treemapNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/treemap/empty-block-space",
        filename: "empty-block-space.mmd",
        code: `treemap
accDescr { \t }
"A":10
`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 15,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `treemap
"A":10
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treemap/block-ls-ps-whitespace",
        filename: "block-ls-ps-whitespace.mmd",
        code: `treemap
accDescr {\u2028 \u2029}
"A":1
`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 15,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `treemap
"A":1
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treemap/block-lone-cr-whitespace",
        filename: "block-lone-cr-whitespace.mmd",
        code: `treemap
accDescr {\r  }
"A":1
`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 3,
            endColumn: 4,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `treemap
"A":1
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treemap/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `treemap\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `treemap\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
