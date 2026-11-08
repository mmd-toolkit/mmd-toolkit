/**
 * The rule `agentflow-no-spaced-stroke`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { agentflowNoSpacedStroke } from "../../src/rules/agentflow-no-spaced-stroke.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("agentflow-no-spaced-stroke", agentflowNoSpacedStroke)

const SPACED =
  "`stroke` written with whitespace before `:` is not a form that the mermaid.js documentation shows, and mermaid.js does not read it for the colour of an arrowhead."

new RuleTester(LANGUAGE_CONFIG).run(
  "agentflow-no-spaced-stroke",
  agentflowNoSpacedStroke,
  {
    valid: [
      {
        name: "valid/agentflow/link-style-nbsp-before-colon",
        filename: "link-style-nbsp-before-colon.mmd",
        code: `agentflow-beta TB
  A --> B
  linkStyle 0 stroke\u00a0:#f00
`,
      },
    ],
    invalid: [
      {
        name: "invalid/agentflow/link-style-cr",
        filename: "link-style-cr.mmd",
        code: `agentflow-beta TB\r  A --> B\r  linkStyle 0 stroke :#f00\r`,
        errors: [
          { message: SPACED, line: 3, column: 21, endLine: 3, endColumn: 22 },
        ],
        output: `agentflow-beta TB\r  A --> B\r  linkStyle 0 stroke:#f00\r`,
      },

      {
        name: "invalid/agentflow/link-style-crlf",
        filename:
          "tests/fixtures/rules/agentflow-no-spaced-stroke/invalid/agentflow/link-style-crlf-input.mmd",
        code: `agentflow-beta TB\r
  A --> B\r
  linkStyle 0 stroke :#f00\r
`,
        errors: [
          { message: SPACED, line: 3, column: 21, endLine: 3, endColumn: 22 },
        ],
        output: `agentflow-beta TB\r
  A --> B\r
  linkStyle 0 stroke:#f00\r
`,
      },

      {
        name: "invalid/agentflow/link-style-tab-before-colon",
        filename: "link-style-tab-before-colon.mmd",
        code: `agentflow-beta TB
  A --> B
  linkStyle 0 stroke\t:#f00
`,
        errors: [
          { message: SPACED, line: 3, column: 21, endLine: 3, endColumn: 22 },
        ],
        output: `agentflow-beta TB
  A --> B
  linkStyle 0 stroke:#f00
`,
      },

      {
        name: "invalid/agentflow/link-style-line-separator-after",
        filename: "link-style-line-separator-after.mmd",
        code: `agentflow-beta TB
  A --> B
  linkStyle 0 stroke :#f00\u2028
`,
        errors: [
          { message: SPACED, line: 3, column: 21, endLine: 3, endColumn: 22 },
        ],
        output: `agentflow-beta TB
  A --> B
  linkStyle 0 stroke:#f00\u2028
`,
      },
    ],
  },
)
