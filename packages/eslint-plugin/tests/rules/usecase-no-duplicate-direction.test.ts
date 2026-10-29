import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
/** The rule `usecase-no-duplicate-direction`, on its document examples and fixture inputs. */
import { usecaseNoDuplicateDirection } from "../../src/rules/usecase-no-duplicate-direction.ts"
import { testRule } from "../rule-test.ts"

testRule("usecase-no-duplicate-direction", usecaseNoDuplicateDirection)

new RuleTester(LANGUAGE_CONFIG).run(
  "usecase-no-duplicate-direction",
  usecaseNoDuplicateDirection,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/usecase/direction-crlf",
        filename:
          "tests/fixtures/rules/usecase-no-duplicate-direction/invalid/usecase/direction-crlf-input.mmd",
        code: `usecase-beta
direction LR\r
direction RL\r
`,
        errors: [
          {
            message: "mermaid.js replaces the earlier direction with `RL`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 13,
            suggestions: [
              {
                desc: "Remove this direction statement.",
                output: `usecase-beta
direction LR\r
`,
              },
              {
                desc: "Remove the earlier direction statement.",
                output: `usecase-beta
direction RL\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
