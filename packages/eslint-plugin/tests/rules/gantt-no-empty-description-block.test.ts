/**
 * The rule `gantt-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { ganttNoEmptyDescriptionBlock } from "../../src/rules/gantt-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-empty-description-block", ganttNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "gantt-no-empty-description-block",
  ganttNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/gantt/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `gantt\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `gantt\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
