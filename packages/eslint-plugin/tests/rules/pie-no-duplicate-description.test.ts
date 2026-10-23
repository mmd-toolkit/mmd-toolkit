/** The rule on its document examples, fixture files, and escaped line terminators. */
import { RuleTester } from "eslint"
import { pieNoDuplicateDescription } from "../../src/rules/pie-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("pie-no-duplicate-description", pieNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "pie-no-duplicate-description",
  pieNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/pie/description-block-ls-ends-line",
        filename: "description-block-ls-ends-line.mmd",
        code: `pie
accDescr {a \u2028  b}
accDescr {a\u2028b}
"A":1
`,
      },
      {
        name: "valid/pie/description-block-ps-ends-line",
        filename: "description-block-ps-ends-line.mmd",
        code: `pie
accDescr: a\u2029b
accDescr {a  \u2029 b}
"A":1
`,
      },
      {
        name: "valid/pie/description-block-two-ls",
        filename: "description-block-two-ls.mmd",
        code: `pie
accDescr {a\u2028\u2028b}
accDescr {a\u2028b}
"A":1
`,
      },
      {
        name: "valid/pie/description-lone-cr-lf-equality",
        filename: "description-lone-cr-lf-equality.mmd",
        code: `pie
accDescr {A\rB}
accDescr {A
B}`,
      },
    ],
    invalid: [
      {
        name: "invalid/pie/description-line-ls-is-text",
        filename: "description-line-ls-is-text.mmd",
        code: `pie
accDescr: a  \u2028 b
accDescr {a  \u2028 b}
"A":1
`,
        errors: [
          {
            messageId: "duplicate",
            data: { line: "2" },
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 18,
          },
        ],
      },
    ],
  },
)
