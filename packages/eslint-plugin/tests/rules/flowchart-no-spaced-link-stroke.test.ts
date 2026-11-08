/**
 * The rule `flowchart-no-spaced-link-stroke`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { flowchartNoSpacedLinkStroke } from "../../src/rules/flowchart-no-spaced-link-stroke.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-spaced-link-stroke", flowchartNoSpacedLinkStroke)

const SPACED =
  "mermaid.js draws the line with this style but finds the colour of the arrowhead by `stroke:`, so the whitespace before the `:` leaves the arrowhead in the colour of the theme."

new RuleTester(LANGUAGE_CONFIG).run(
  "flowchart-no-spaced-link-stroke",
  flowchartNoSpacedLinkStroke,
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
          "tests/fixtures/rules/flowchart-no-spaced-link-stroke/invalid/flowchart/link-style-crlf-input.mmd",
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
