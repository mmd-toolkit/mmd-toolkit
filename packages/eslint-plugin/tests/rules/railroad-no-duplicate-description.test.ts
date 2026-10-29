/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { railroadNoDuplicateDescription } from "../../src/rules/railroad-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("railroad-no-duplicate-description", railroadNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "railroad-no-duplicate-description",
  railroadNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/railroad/peg-description-ls",
        filename: "peg-description-ls.mmd",
        code: `railroad-peg-beta
accDescr {First\u2028 Second}
accDescr {First\u2028Second}
word<-"a";`,
      },
      {
        name: "valid/railroad/ebnf-description-lone-cr-equivalent",
        filename: "ebnf-description-lone-cr-equivalent.mmd",
        code: `railroad-ebnf-beta
accDescr { A\r  B }
accDescr {A
B}
word="a";`,
      },
      {
        name: "valid/railroad/abnf-description-block-ps",
        filename: "abnf-description-block-ps.mmd",
        code: `railroad-abnf-beta
accDescr {First \u2029 Second}
accDescr {First\u2029Second}
word="a";`,
      },
      {
        name: "valid/railroad/abnf-description-tab-runs-equivalent",
        filename: "abnf-description-tab-runs-equivalent.mmd",
        code: `railroad-abnf-beta
accDescr: A \tB
accDescr { A B }
word="a";`,
      },

      {
        name: "valid/railroad/ir-description-crlf",
        filename:
          "tests/fixtures/rules/railroad-no-duplicate-description/valid/railroad/ir-description-crlf-input.mmd",
        code: `railroad-beta\r
accDescr { First\r
Second }\r
accDescr {First\r
Second}\r
word=terminal("a");`,
      },
    ],
    invalid: [
      {
        name: "invalid/railroad/abnf-description-space-reset",
        filename: "abnf-description-space-reset.mmd",
        code: `railroad-abnf-beta
accDescr: First
accDescr: \t
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
                desc: "Remove this statement.",
                output: `railroad-abnf-beta
accDescr: First
word="a";`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `railroad-abnf-beta
accDescr: \t
word="a";`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/railroad/peg-description-line-ls",
        filename: "peg-description-line-ls.mmd",
        code: `railroad-peg-beta
accDescr: First\u2028 Second
accDescr: First\u2028Second
word<-"a";`,
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
                output: `railroad-peg-beta
accDescr: First\u2028 Second
word<-"a";`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `railroad-peg-beta
accDescr: First\u2028Second
word<-"a";`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/railroad/ir-description-line-ps",
        filename: "ir-description-line-ps.mmd",
        code: `railroad-beta
accDescr: First\u2029 Second
accDescr: First\u2029Second
word=terminal("a");`,
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
                output: `railroad-beta
accDescr: First\u2029 Second
word=terminal("a");`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `railroad-beta
accDescr: First\u2029Second
word=terminal("a");`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/railroad/ebnf-description-single-tab-distinct",
        filename: "ebnf-description-single-tab-distinct.mmd",
        code: `railroad-ebnf-beta
accDescr: A\tB
accDescr: A B
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
                desc: "Remove this statement.",
                output: `railroad-ebnf-beta
accDescr: A\tB
word="a";`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `railroad-ebnf-beta
accDescr: A B
word="a";`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/railroad/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/railroad-no-duplicate-description/invalid/railroad/description-equal-predecessor-crlf-input.mmd",
        code: `railroad-beta\r
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
                output: `railroad-beta\r
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
