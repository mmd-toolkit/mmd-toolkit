/**
 * The rule `flowchart-no-unclosed-description-block`, on the examples of its document and
 * on the inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { flowchartNoUnclosedDescriptionBlock } from "../../src/rules/flowchart-no-unclosed-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "flowchart-no-unclosed-description-block",
  flowchartNoUnclosedDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "flowchart-no-unclosed-description-block",
  flowchartNoUnclosedDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "a line separator on the opening line of an unclosed block",
        filename: "input.mmd",
        code: `flowchart LR
  accDescr { a\u2028b
  C
`,
        errors: [
          {
            message:
              "mermaid.js reads the rest of the diagram as the text of this unclosed `accDescr {` block, and sets an empty description.",
            line: 2,
            column: 3,
            endLine: 2,
            endColumn: 13,
            suggestions: [
              {
                desc: "Close the block at the end of the text.",
                output: `flowchart LR
  accDescr { a\u2028b
  C
}
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-cr",
        filename:
          "tests/fixtures/rules/flowchart-no-unclosed-description-block/invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-cr-input.mmd",
        code: `flowchart LR\r  accDescr { x\r  A{y}\r`,
        errors: [
          {
            message:
              "mermaid.js closes this `accDescr {` block at the `}` of a later `{`, and reads the lines up to it as the description.",
            line: 2,
            column: 3,
            endLine: 2,
            endColumn: 13,
            suggestions: [],
          },
        ],
      },
      {
        name: "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-crlf",
        filename:
          "tests/fixtures/rules/flowchart-no-unclosed-description-block/invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-crlf-input.mmd",
        code: `flowchart LR\r
  accDescr { x\r
  A{y}\r
`,
        errors: [
          {
            message:
              "mermaid.js closes this `accDescr {` block at the `}` of a later `{`, and reads the lines up to it as the description.",
            line: 2,
            column: 3,
            endLine: 2,
            endColumn: 13,
            suggestions: [],
          },
        ],
      },
      {
        name: "invalid/flowchart/gram-unclosed-description-block-crlf-lines",
        filename:
          "tests/fixtures/rules/flowchart-no-unclosed-description-block/invalid/flowchart/gram-unclosed-description-block-crlf-lines-input.mmd",
        code: `flowchart LR\r
  A\r
  accDescr {\r
    x\r
  B --> C\r
`,
        errors: [
          {
            message:
              "mermaid.js reads the rest of the diagram as the text of this unclosed `accDescr {` block, and sets an empty description.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 13,
            suggestions: [
              {
                desc: "Close the block at the end of the text.",
                output: `flowchart LR\r
  A\r
  accDescr {\r
    x\r
  B --> C\r
}\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
