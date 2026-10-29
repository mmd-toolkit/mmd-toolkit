/**
 * The rule `agentflow-no-duplicate-direction`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { agentflowNoDuplicateDirection } from "../../src/rules/agentflow-no-duplicate-direction.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("agentflow-no-duplicate-direction", agentflowNoDuplicateDirection)

new RuleTester(LANGUAGE_CONFIG).run(
  "agentflow-no-duplicate-direction",
  agentflowNoDuplicateDirection,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/agentflow/direction-cr",
        filename: "direction-cr.mmd",
        code: `agentflow-beta TB\rflow F\rdirection LR\rdirection BT\rend\r`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier direction for this flow with `BT`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 13,
          },
        ],
      },
      {
        name: "invalid/agentflow/direction-crlf",
        filename: "direction-crlf.mmd",
        code: `agentflow-beta TB\r
flow F\r
direction LR\r
direction BT\r
end\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier direction for this flow with `BT`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 13,
          },
        ],
      },
      {
        name: "invalid/agentflow/direction-nbsp-gap",
        filename: "direction-nbsp-gap.mmd",
        code: `agentflow-beta TB
flow F
direction\u00a0LR
direction\u00a0BT
end
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier direction for this flow with `BT`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 13,
          },
        ],
      },
    ],
  },
)
