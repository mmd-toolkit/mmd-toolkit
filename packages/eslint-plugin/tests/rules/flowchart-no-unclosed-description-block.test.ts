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
                desc: "Close the block at the end of the line of the `{`: mermaid.js then reads the rest of that line as the text of the block, and the lines after it as statements.",
                output: `flowchart LR
  accDescr { a\u2028b }
  C
`,
              },
              {
                desc: "Close the block at the end of the text: mermaid.js then reads all the text after the `{` as the description.",
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
    ],
  },
)
