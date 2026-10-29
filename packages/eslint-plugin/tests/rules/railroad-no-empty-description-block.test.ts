/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { railroadNoEmptyDescriptionBlock } from "../../src/rules/railroad-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("railroad-no-empty-description-block", railroadNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "railroad-no-empty-description-block",
  railroadNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/railroad/abnf-empty",
        filename: "abnf-empty.mmd",
        code: `railroad-abnf-beta
accDescr {
\t
}
word="a";`,
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
                output: `railroad-abnf-beta
word="a";`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/railroad/ir-empty-ls-ps",
        filename: "ir-empty-ls-ps.mmd",
        code: `railroad-beta
accDescr {\u2028\u2029}
word=terminal("a");`,
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
                output: `railroad-beta
word=terminal("a");`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/railroad/ebnf-empty-nbsp",
        filename: "ebnf-empty-nbsp.mmd",
        code: `railroad-ebnf-beta
accDescr {\u00a0}
word="a";`,
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
                output: `railroad-ebnf-beta
word="a";`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/railroad/abnf-empty-lone-cr",
        filename: "abnf-empty-lone-cr.mmd",
        code: `railroad-abnf-beta\raccDescr {\r \r}\rword="a";`,
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
                output: `railroad-abnf-beta\rword="a";`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/railroad/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `railroad-beta\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `railroad-beta\r
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/railroad/peg-empty-crlf",
        filename:
          "tests/fixtures/rules/railroad-no-empty-description-block/invalid/railroad/peg-empty-crlf-input.mmd",
        code: `railroad-peg-beta\r
accDescr {\r
}\r
word<-"a";`,
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
                output: `railroad-peg-beta\r
word<-"a";`,
              },
            ],
          },
        ],
      },
    ],
  },
)
