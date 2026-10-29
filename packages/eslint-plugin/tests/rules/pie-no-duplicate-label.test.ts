/** The rule on its document examples, fixture files, and escaped line terminators. */
import { RuleTester } from "eslint"
import { pieNoDuplicateLabel } from "../../src/rules/pie-no-duplicate-label.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("pie-no-duplicate-label", pieNoDuplicateLabel)

new RuleTester(LANGUAGE_CONFIG).run(
  "pie-no-duplicate-label",
  pieNoDuplicateLabel,
  {
    valid: [
      {
        name: "valid/pie/label-ls-not-lf",
        filename: "label-ls-not-lf.mmd",
        code: `pie
"A\u2028B":1
"A
B":2`,
      },
    ],
    invalid: [
      {
        name: "invalid/pie/label-lone-cr-lf-equal",
        filename: "label-lone-cr-lf-equal.mmd",
        code: `pie
"A\rB":1
"A
B":2`,
        errors: [
          {
            messageId: "duplicate",
            line: 4,
            column: 1,
            endLine: 5,
            endColumn: 5,
          },
        ],
      },
    ],
  },
)
