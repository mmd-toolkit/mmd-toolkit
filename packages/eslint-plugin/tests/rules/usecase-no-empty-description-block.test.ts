/** The rule `usecase-no-empty-description-block`, on its document examples and fixture inputs. */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { usecaseNoEmptyDescriptionBlock } from "../../src/rules/usecase-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("usecase-no-empty-description-block", usecaseNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "usecase-no-empty-description-block",
  usecaseNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/usecase/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `usecase-beta\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `usecase-beta\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
