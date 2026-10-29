/**
 * The rule `sequence-no-unclosed-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { sequenceNoUnclosedDescriptionBlock } from "../../src/rules/sequence-no-unclosed-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "sequence-no-unclosed-description-block",
  sequenceNoUnclosedDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "sequence-no-unclosed-description-block",
  sequenceNoUnclosedDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "a line separator in an unclosed description block",
        filename: "input.mmd",
        code: `sequenceDiagram
accDescr: d
accDescr { x\u2028y
`,
        errors: [
          {
            message:
              "mermaid.js reads the rest of the diagram as the text of this unclosed `accDescr {` block, and sets an empty description.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 11,
            suggestions: [],
          },
        ],
      },
      {
        name: "invalid/sequence/closing-crlf-with-tab",
        filename: "input.mmd",
        code: `sequenceDiagram\r
accDescr { First\tline\r
A ->> B: Ready\r
`,
        errors: [
          {
            messageId: "unclosed",
            suggestions: [
              {
                desc: "Close the block at the end of the text.",
                output: `sequenceDiagram\r
accDescr { First\tline\r
A ->> B: Ready\r
}\r
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/sequence/db-acc-descr-block-unclosed-crlf",
        filename:
          "tests/fixtures/rules/sequence-no-unclosed-description-block/invalid/sequence/db-acc-descr-block-unclosed-crlf-input.mmd",
        code: `sequenceDiagram\r
accDescr: d\r
accDescr { x\r
`,
        errors: [
          {
            message:
              "mermaid.js reads the rest of the diagram as the text of this unclosed `accDescr {` block, and sets an empty description.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 11,
            suggestions: [],
          },
        ],
      },
    ],
  },
)
