/** The rule on its document examples, fixture files, and escaped whitespace. */
import { RuleTester } from "eslint"
import { architectureNoEmptyDescriptionBlock } from "../../src/rules/architecture-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "architecture-no-empty-description-block",
  architectureNoEmptyDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "architecture-no-empty-description-block",
  architectureNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/architecture/empty-whitespace",
        filename: "empty-whitespace.mmd",
        code: `architecture-beta
accDescr { \t
 }
service api
`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 3,
            endColumn: 3,
          },
        ],
      },
      {
        name: "invalid/architecture/empty-ls-ps",
        filename: "empty-ls-ps.mmd",
        code: `architecture-beta
accDescr {\u2028\u2029}
`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 14,
          },
        ],
      },
      {
        name: "invalid/architecture/empty-nbsp",
        filename: "empty-nbsp.mmd",
        code: `architecture-beta
accDescr {\u00A0}
`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 13,
          },
        ],
      },
      {
        name: "invalid/architecture/empty-lone-cr",
        filename: "empty-lone-cr.mmd",
        code: `architecture-beta\raccDescr {\r \t\r}\r`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 4,
            endColumn: 2,
          },
        ],
      },
    ],
  },
)
