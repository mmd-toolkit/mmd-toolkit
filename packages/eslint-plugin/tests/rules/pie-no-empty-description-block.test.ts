/** The rule on its document examples, fixture files, and escaped whitespace. */
import { RuleTester } from "eslint"
import { pieNoEmptyDescriptionBlock } from "../../src/rules/pie-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("pie-no-empty-description-block", pieNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "pie-no-empty-description-block",
  pieNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/pie/empty-block-unicode-whitespace",
        filename: "empty-block-unicode-whitespace.mmd",
        code: `pie
accDescr {\u00a0\u2028\u2029\ufeff}`,
        errors: [
          {
            messageId: "empty",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 16,
          },
        ],
      },
    ],
  },
)
