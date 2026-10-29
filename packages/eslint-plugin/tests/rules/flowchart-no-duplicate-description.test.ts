/**
 * The rule `flowchart-no-duplicate-description`, on the examples of its document and
 * on the inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { flowchartNoDuplicateDescription } from "../../src/rules/flowchart-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-duplicate-description", flowchartNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "flowchart-no-duplicate-description",
  flowchartNoDuplicateDescription,
  {
    valid: [
      {
        name: "a line separator inside one line description",
        filename: "input.mmd",
        code: `flowchart LR
  A
  accDescr: a\u2028accDescr: b
`,
      },
    ],
    invalid: [
      {
        name: "a line separator inside a block before another description",
        filename: "input.mmd",
        code: `flowchart LR
  A
  accDescr { a\u2028b }
  accDescr: c
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 4,
            column: 3,
            endLine: 4,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this statement: mermaid.js uses the last description that remains.",
                output: `flowchart LR
  A
  accDescr { a\u2028b }
`,
              },
              {
                desc: "Remove the earlier statement that sets the description: mermaid.js uses the last description that remains.",
                output: `flowchart LR
  A
  accDescr: c
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
