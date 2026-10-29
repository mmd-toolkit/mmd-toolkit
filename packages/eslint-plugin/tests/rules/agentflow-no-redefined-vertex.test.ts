/**
 * The rule `agentflow-no-redefined-vertex`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { agentflowNoRedefinedVertex } from "../../src/rules/agentflow-no-redefined-vertex.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("agentflow-no-redefined-vertex", agentflowNoRedefinedVertex)

new RuleTester(LANGUAGE_CONFIG).run(
  "agentflow-no-redefined-vertex",
  agentflowNoRedefinedVertex,
  {
    valid: [
      {
        name: "valid/agentflow/vertex-cr-equivalent",
        filename: "vertex-cr-equivalent.mmd",
        code: `agentflow-beta TB\rA["x\ry"]\rA["x
y"]\r`,
      },
      {
        name: "valid/agentflow/vertex-nbsp-padding",
        filename: "vertex-nbsp-padding.mmd",
        code: `agentflow-beta TB
A["x"]
A["\u00a0x\u00a0"]
`,
      },
    ],
    invalid: [
      {
        name: "invalid/agentflow/vertex-ls-not-lf",
        filename: "vertex-ls-not-lf.mmd",
        code: `agentflow-beta TB
A["x\u2028y"]
A["x
y"]
`,
        errors: [
          {
            message:
              "mermaid.js replaces the label of `A` written earlier with that of this vertex.",
            line: 3,
            column: 2,
            endLine: 4,
            endColumn: 4,
          },
        ],
      },
      {
        name: "invalid/agentflow/vertex-ps-not-lf",
        filename: "vertex-ps-not-lf.mmd",
        code: `agentflow-beta TB
A["x\u2029y"]
A["x
y"]
`,
        errors: [
          {
            message:
              "mermaid.js replaces the label of `A` written earlier with that of this vertex.",
            line: 3,
            column: 2,
            endLine: 4,
            endColumn: 4,
          },
        ],
      },
    ],
  },
)
