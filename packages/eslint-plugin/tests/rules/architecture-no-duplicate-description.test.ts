/** The rule on its document examples, fixture files, and escaped whitespace. */
import { RuleTester } from "eslint"
import { architectureNoDuplicateDescription } from "../../src/rules/architecture-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "architecture-no-duplicate-description",
  architectureNoDuplicateDescription,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "architecture-no-duplicate-description",
  architectureNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/architecture/description-block-ls",
        filename: "description-block-ls.mmd",
        code: `architecture-beta
accDescr {First\u2028 Second}
accDescr {First\u2028Second}
service api
`,
      },
      {
        name: "valid/architecture/description-block-ps",
        filename: "description-block-ps.mmd",
        code: `architecture-beta
accDescr {First\u2029 Second}
accDescr {First\u2029Second}
service api
`,
      },
      {
        name: "valid/architecture/description-lone-cr-equivalent",
        filename: "description-lone-cr-equivalent.mmd",
        code: `architecture-beta
accDescr { A\r  B }
accDescr {A
B}
`,
      },
    ],
    invalid: [
      {
        name: "invalid/architecture/description-line-ls",
        filename: "description-line-ls.mmd",
        code: `architecture-beta
accDescr: First\u2028 Second
accDescr: First\u2028Second
service api
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 23,
          },
        ],
      },
      {
        name: "invalid/architecture/description-line-whitespace-reset",
        filename: "description-line-whitespace-reset.mmd",
        code: `architecture-beta
accDescr: First
accDescr: \t 
accDescr: Second
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 13,
          },
        ],
      },
      {
        name: "invalid/architecture/description-line-ps-is-text",
        filename: "description-line-ps-is-text.mmd",
        code: `architecture-beta
accDescr: A\u2029 B
accDescr: A\u2029B
`,
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
    ],
  },
)
