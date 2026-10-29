/** The rule `usecase-no-duplicate-description`, on its document examples and fixture inputs. */
import { RuleTester } from "eslint"
import { usecaseNoDuplicateDescription } from "../../src/rules/usecase-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("usecase-no-duplicate-description", usecaseNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "usecase-no-duplicate-description",
  usecaseNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/usecase/description-trim-both-nbsp",
        filename: "description-trim-both-nbsp.mmd",
        code: `usecase-beta
accDescr: \u00a0First\u00a0
accDescr {\u00a0First\u00a0}
`,
      },
      {
        name: "valid/usecase/description-cr-indent",
        filename: "description-cr-indent.mmd",
        code: `usecase-beta\raccDescr {First\rSecond}\raccDescr { \r  First\r\tSecond\r}\r`,
      },
      {
        name: "valid/usecase/description-nbsp-after-lf",
        filename: "description-nbsp-after-lf.mmd",
        code: `usecase-beta
accDescr {First
Second}
accDescr {First
\u00a0Second}
`,
      },
    ],
    invalid: [
      {
        name: "invalid/usecase/description-ls-content-no-indent-trim",
        filename: "description-ls-content-no-indent-trim.mmd",
        code: `usecase-beta
accDescr: First\u2028 Second
accDescr: First\u2028Second
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
        name: "invalid/usecase/description-ps-content-no-indent-trim",
        filename: "description-ps-content-no-indent-trim.mmd",
        code: `usecase-beta
accDescr {First\u2029 Second}
accDescr {First\u2029Second}
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 24,
          },
        ],
      },
    ],
  },
)
