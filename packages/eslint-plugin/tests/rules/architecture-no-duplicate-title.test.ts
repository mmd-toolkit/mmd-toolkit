/** The rule on its document examples, fixture files, and escaped whitespace. */
import { RuleTester } from "eslint"
import { architectureNoDuplicateTitle } from "../../src/rules/architecture-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("architecture-no-duplicate-title", architectureNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "architecture-no-duplicate-title",
  architectureNoDuplicateTitle,
  {
    valid: [
      {
        name: "valid/architecture/acctitle-space-tab-run-equivalent",
        filename: "acctitle-space-tab-run-equivalent.mmd",
        code: `architecture-beta
accTitle: A \tB
accTitle: A B
`,
      },
      {
        name: "valid/architecture/acctitle-line-separators-content",
        filename: "acctitle-line-separators-content.mmd",
        code: `architecture-beta
accTitle: A\u2028accTitle: B\u2029C
accTitle: A\u2028accTitle: B\u2029C
`,
      },
    ],
    invalid: [
      {
        name: "invalid/architecture/acctitle-whitespace-reset",
        filename: "acctitle-whitespace-reset.mmd",
        code: `architecture-beta
accTitle: First
accTitle: \t 
accTitle: Second
`,
        errors: [
          {
            messageId: "duplicate",
            data: { line: "2" },
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 13,
          },
        ],
      },
      {
        name: "invalid/architecture/acctitle-single-tab-distinct",
        filename: "acctitle-single-tab-distinct.mmd",
        code: `architecture-beta
accTitle: A\tB
accTitle: A B
`,
        errors: [
          {
            messageId: "duplicate",
            data: { line: "2" },
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 14,
          },
        ],
      },
      {
        name: "invalid/architecture/acctitle-lone-cr",
        filename: "acctitle-lone-cr.mmd",
        code: `architecture-beta\raccTitle: First\raccTitle: Second\r`,
        errors: [
          {
            messageId: "duplicate",
            data: { line: "2" },
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
