/**
 * The rule `timeline-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { timelineNoEmptyDescriptionBlock } from "../../src/rules/timeline-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("timeline-no-empty-description-block", timelineNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "timeline-no-empty-description-block",
  timelineNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/timeline/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `timeline\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `timeline\r
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/timeline/empty-block-crlf",
        filename:
          "tests/fixtures/rules/timeline-no-empty-description-block/invalid/timeline/empty-block-crlf-input.mmd",
        code: `timeline\r
  accDescr {\r
  }\r
  2020 : a\r
`,
        errors: [
          {
            message:
              "mermaid.js takes no description from this empty `accDescr` block: the description stays as it was before it.",
            line: 2,
            column: 3,
            endLine: 3,
            endColumn: 4,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `timeline\r
  2020 : a\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
