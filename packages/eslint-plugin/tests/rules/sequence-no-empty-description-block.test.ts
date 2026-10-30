/**
 * The rule `sequence-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { sequenceNoEmptyDescriptionBlock } from "../../src/rules/sequence-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-empty-description-block", sequenceNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "sequence-no-empty-description-block",
  sequenceNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/sequence/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `sequenceDiagram\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `sequenceDiagram\r
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/sequence/gram-empty-description-block-after-autonumber-crlf",
        filename:
          "tests/fixtures/rules/sequence-no-empty-description-block/invalid/sequence/gram-empty-description-block-after-autonumber-crlf-input.mmd",
        code: `sequenceDiagram\r
autonumber accDescr {}\r
A->>B: x\r
`,
        errors: [
          {
            message:
              "mermaid.js takes no description from this empty `accDescr` block: the description stays as it was before it.",
            line: 2,
            column: 12,
            endLine: 2,
            endColumn: 23,
            suggestions: [],
          },
        ],
      },
    ],
  },
)
