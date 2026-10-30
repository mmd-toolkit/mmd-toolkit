/**
 * The rule `agentflow-no-redefined-connector`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { agentflowNoRedefinedConnector } from "../../src/rules/agentflow-no-redefined-connector.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("agentflow-no-redefined-connector", agentflowNoRedefinedConnector)

new RuleTester(LANGUAGE_CONFIG).run(
  "agentflow-no-redefined-connector",
  agentflowNoRedefinedConnector,
  {
    valid: [
      {
        name: "valid/agentflow/connector-cr-equivalent",
        filename: "connector-cr-equivalent.mmd",
        code: `agentflow-beta TB\rconnector C["x\ry"]\rconnector C["x
y"]\r`,
      },
    ],
    invalid: [],
  },
)
