/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { railroadNoDuplicateTitle } from "../../src/rules/railroad-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("railroad-no-duplicate-title", railroadNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "railroad-no-duplicate-title",
  railroadNoDuplicateTitle,
  {
    valid: [
      {
        name: "valid/railroad/ebnf-title-tab-runs-equivalent",
        filename: "ebnf-title-tab-runs-equivalent.mmd",
        code: `railroad-ebnf-beta
accTitle: A \tB
accTitle: A B
word="a";`,
      },
    ],
    invalid: [
      {
        name: "invalid/railroad/ebnf-title-space-reset",
        filename: "ebnf-title-space-reset.mmd",
        code: `railroad-ebnf-beta
accTitle: First
accTitle: \t
word="a";`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `railroad-ebnf-beta
accTitle: First
word="a";`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `railroad-ebnf-beta
accTitle: \t
word="a";`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/railroad/abnf-title-single-tab-distinct",
        filename: "abnf-title-single-tab-distinct.mmd",
        code: `railroad-abnf-beta
accTitle: A\tB
accTitle: A B
word="a";`,
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
                output: `railroad-abnf-beta
accTitle: A\tB
word="a";`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `railroad-abnf-beta
accTitle: A B
word="a";`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/railroad/peg-title-ls-ps-content",
        filename: "peg-title-ls-ps-content.mmd",
        code: `railroad-peg-beta
accTitle: A\u2028 B\u2029C
accTitle: A\u2028B\u2029C
word<-"a";`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 16,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `railroad-peg-beta
accTitle: A\u2028 B\u2029C
word<-"a";`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `railroad-peg-beta
accTitle: A\u2028B\u2029C
word<-"a";`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/railroad/ir-title-lone-cr",
        filename: "ir-title-lone-cr.mmd",
        code: `railroad-beta\raccTitle: First\raccTitle: Second\rword=terminal("a");`,
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
                output: `railroad-beta\raccTitle: First\rword=terminal("a");`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `railroad-beta\raccTitle: Second\rword=terminal("a");`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/railroad/ir-title-crlf",
        filename:
          "tests/fixtures/rules/railroad-no-duplicate-title/invalid/railroad/ir-title-crlf-input.mmd",
        code: `railroad-beta\r
accTitle: First\r
\r
accTitle: Second\r
word=terminal("a");\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 17,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `railroad-beta\r
accTitle: First\r
\r
word=terminal("a");\r
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `railroad-beta\r
\r
accTitle: Second\r
word=terminal("a");\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/railroad/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/railroad-no-duplicate-title/invalid/railroad/title-equal-predecessor-crlf-input.mmd",
        code: `railroad-beta\r
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
                output: `railroad-beta\r
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
