/** The rule on its document examples and fixture files. */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { gitgraphNoEmptyDescriptionBlock } from "../../src/rules/gitgraph-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("gitgraph-no-empty-description-block", gitgraphNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "gitgraph-no-empty-description-block",
  gitgraphNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/gitgraph/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `gitGraph\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `gitGraph\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
