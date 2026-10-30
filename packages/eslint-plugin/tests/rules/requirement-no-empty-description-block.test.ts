/**
 * The rule `requirement-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { requirementNoEmptyDescriptionBlock } from "../../src/rules/requirement-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "requirement-no-empty-description-block",
  requirementNoEmptyDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "requirement-no-empty-description-block",
  requirementNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/requirement/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `requirementDiagram\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `requirementDiagram\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
