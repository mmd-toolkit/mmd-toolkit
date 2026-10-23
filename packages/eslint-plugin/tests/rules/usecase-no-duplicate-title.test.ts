/** The rule `usecase-no-duplicate-title`, on its document examples and fixture inputs. */
import { RuleTester } from "eslint"
import { usecaseNoDuplicateTitle } from "../../src/rules/usecase-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("usecase-no-duplicate-title", usecaseNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "usecase-no-duplicate-title",
  usecaseNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/usecase/title-cr",
        filename: "title-cr.mmd",
        code: `usecase-beta
accTitle: First\raccTitle: Second\r`,
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
      {
        name: "invalid/usecase/title-unicode-separators",
        filename: "title-unicode-separators.mmd",
        code: `usecase-beta
accTitle: First\u2028More
accTitle: First\u2029More
`,
        errors: [
          {
            messageId: "duplicate",
            data: { line: "2" },
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 21,
          },
        ],
      },
    ],
  },
)
