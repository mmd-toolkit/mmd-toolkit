/**
 * The rule `flowchart-no-spaced-stroke`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { flowchartNoSpacedStroke } from "../../src/rules/flowchart-no-spaced-stroke.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-spaced-stroke", flowchartNoSpacedStroke)

const SPACED =
  "`stroke` written with whitespace before `:` is not a form that the mermaid.js documentation shows, and mermaid.js does not read it for the colour of an arrowhead."

new RuleTester(LANGUAGE_CONFIG).run(
  "flowchart-no-spaced-stroke",
  flowchartNoSpacedStroke,
  {
    valid: [
      {
        name: "valid/flowchart/link-style-nbsp-before-colon",
        filename: "link-style-nbsp-before-colon.mmd",
        code: `flowchart LR
  A --> B
  linkStyle 0 stroke\u00a0:#f00
`,
      },
    ],
    invalid: [
      {
        name: "invalid/flowchart/link-style-cr",
        filename: "link-style-cr.mmd",
        code: `flowchart LR\r  A --> B\r  linkStyle 0 stroke :#f00\r`,
        errors: [
          { message: SPACED, line: 3, column: 21, endLine: 3, endColumn: 22 },
        ],
        output: `flowchart LR\r  A --> B\r  linkStyle 0 stroke:#f00\r`,
      },

      {
        name: "invalid/flowchart/link-style-crlf",
        filename:
          "tests/fixtures/rules/flowchart-no-spaced-stroke/invalid/flowchart/link-style-crlf-input.mmd",
        code: `flowchart LR\r
  A --> B\r
  linkStyle 0 stroke :#f00\r
`,
        errors: [
          { message: SPACED, line: 3, column: 21, endLine: 3, endColumn: 22 },
        ],
        output: `flowchart LR\r
  A --> B\r
  linkStyle 0 stroke:#f00\r
`,
      },

      {
        name: "invalid/flowchart/link-style-tab-before-colon",
        filename: "link-style-tab-before-colon.mmd",
        code: `flowchart LR
  A --> B
  linkStyle 0 stroke\t:#f00
`,
        errors: [
          { message: SPACED, line: 3, column: 21, endLine: 3, endColumn: 22 },
        ],
        output: `flowchart LR
  A --> B
  linkStyle 0 stroke:#f00
`,
      },

      {
        name: "invalid/flowchart/link-style-line-separator-after",
        filename: "link-style-line-separator-after.mmd",
        code: `flowchart LR
  A --> B
  linkStyle 0 stroke :#f00\u2028
`,
        errors: [
          { message: SPACED, line: 3, column: 21, endLine: 3, endColumn: 22 },
        ],
        output: `flowchart LR
  A --> B
  linkStyle 0 stroke:#f00\u2028
`,
      },
    ],
  },
)
