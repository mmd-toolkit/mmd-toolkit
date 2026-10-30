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
              "mermaid.js replaces the earlier direction for this subgraph with `BT`.",
            line: 5,
            column: 1,
            endLine: 5,
            endColumn: 13,
            suggestions: [
              {
                desc: "Remove this direction statement.",
                output: `flowchart TB\rsubgraph S\rdirection LR\rA\rend\r`,
              },
              {
                desc: "Remove the earlier direction statement.",
                output: `flowchart TB\rsubgraph S\rA\rdirection BT\rend\r`,
              },
            ],
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
              "mermaid.js replaces the earlier direction for this subgraph with `BT`.",
            line: 5,
            column: 1,
            endLine: 5,
            endColumn: 13,
            suggestions: [
              {
                desc: "Remove this direction statement.",
                output: `flowchart TB
subgraph S
direction\u00a0LR
A
end
`,
              },
              {
                desc: "Remove the earlier direction statement.",
                output: `flowchart TB
subgraph S
A
direction\u00a0BT
end
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/flowchart/crlf",
        filename:
          "tests/fixtures/rules/flowchart-no-duplicate-direction/invalid/flowchart/crlf-input.mmd",
        code: `flowchart TB\r
subgraph S\r
  direction LR\r
  A\r
  direction BT\r
end\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier direction for this subgraph with `BT`.",
            line: 5,
            column: 3,
            endLine: 5,
            endColumn: 15,
            suggestions: [
              {
                desc: "Remove this direction statement.",
                output: `flowchart TB\r
subgraph S\r
  direction LR\r
  A\r
end\r
`,
              },
              {
                desc: "Remove the earlier direction statement.",
                output: `flowchart TB\r
subgraph S\r
  A\r
  direction BT\r
end\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
