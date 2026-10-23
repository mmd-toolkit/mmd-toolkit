/**
 * The rule `agentflow-no-redefined-flow`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { agentflowNoRedefinedFlow } from "../../src/rules/agentflow-no-redefined-flow.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("agentflow-no-redefined-flow", agentflowNoRedefinedFlow)

new RuleTester(LANGUAGE_CONFIG).run(
  "agentflow-no-redefined-flow",
  agentflowNoRedefinedFlow,
  {
    valid: [
      {
        name: "valid/agentflow/flow-cr-equivalent",
        filename: "flow-cr-equivalent.mmd",
        code: `agentflow-beta TB\rflow F["x\ry"]\rend\rflow F["x
y"]\rend\r`,
      },
    ],
    invalid: [],
  },
)
