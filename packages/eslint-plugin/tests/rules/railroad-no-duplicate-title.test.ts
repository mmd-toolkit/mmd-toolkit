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
          },
        ],
      },
    ],
  },
)
