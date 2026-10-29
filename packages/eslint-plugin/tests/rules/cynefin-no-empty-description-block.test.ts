/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { cynefinNoEmptyDescriptionBlock } from "../../src/rules/cynefin-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("cynefin-no-empty-description-block", cynefinNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "cynefin-no-empty-description-block",
  cynefinNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/cynefin/empty-block-spaces",
        filename: "empty-block-spaces.mmd",
        code: `cynefin-beta
accDescr {   \t }`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 17,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `cynefin-beta`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/cynefin/empty-block-lines",
        filename: "empty-block-lines.mmd",
        code: `cynefin-beta
accDescr {

 \t
}
complex "Investigate"`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 5,
            endColumn: 2,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `cynefin-beta
complex "Investigate"`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/cynefin/empty-block-crlf",
        filename: "empty-block-crlf.mmd",
        code: `cynefin-beta\r
accDescr {\r
 \t\r
}\r
complex "Investigate"`,
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
                output: `cynefin-beta\r
complex "Investigate"`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/cynefin/empty-block-unicode-gap",
        filename: "empty-block-unicode-gap.mmd",
        code: `cynefin-beta
accDescr\u2028{\u2029}
complex "Investigate"`,
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
                output: `cynefin-beta
complex "Investigate"`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/cynefin/empty-block-nbsp",
        filename: "empty-block-nbsp.mmd",
        code: `cynefin-beta:
accDescr {\u00a0}`,
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
                output: `cynefin-beta:`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/cynefin/empty-block-lone-cr",
        filename: "empty-block-lone-cr.mmd",
        code: `cynefin-beta\raccDescr {\r \r}\r`,
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
                output: `cynefin-beta\r`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/cynefin/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `cynefin-beta\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `cynefin-beta\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
