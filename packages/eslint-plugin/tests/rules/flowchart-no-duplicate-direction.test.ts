/**
 * The rule `flowchart-no-duplicate-direction`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { flowchartNoDuplicateDirection } from "../../src/rules/flowchart-no-duplicate-direction.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-duplicate-direction", flowchartNoDuplicateDirection)

new RuleTester(LANGUAGE_CONFIG).run(
  "flowchart-no-duplicate-direction",
  flowchartNoDuplicateDirection,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/flowchart/flowchart-direction-cr",
        filename: "flowchart-direction-cr.mmd",
        code: `flowchart TB\rsubgraph S\rdirection LR\rA\rdirection BT\rend\r`,
        errors: [
          {
            message:
              "mermaid.js replaces the direction set on line 3 for this subgraph with `BT`.",
            line: 5,
            column: 1,
            endLine: 5,
            endColumn: 13,
          },
        ],
      },
      {
        name: "invalid/flowchart/flowchart-direction-nbsp-gap",
        filename: "flowchart-direction-nbsp-gap.mmd",
        code: `flowchart TB
subgraph S
direction\u00a0LR
A
direction\u00a0BT
end
`,
        errors: [
          {
            message:
              "mermaid.js replaces the direction set on line 3 for this subgraph with `BT`.",
            line: 5,
            column: 1,
            endLine: 5,
            endColumn: 13,
          },
        ],
      },
    ],
  },
)
