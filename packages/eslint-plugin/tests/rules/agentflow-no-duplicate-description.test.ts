/**
 * The rule `agentflow-no-duplicate-description`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { agentflowNoDuplicateDescription } from "../../src/rules/agentflow-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("agentflow-no-duplicate-description", agentflowNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "agentflow-no-duplicate-description",
  agentflowNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/agentflow/description-cr-equivalent",
        filename: "description-cr-equivalent.mmd",
        code: `agentflow-beta TB\raccDescr {a\rb}\raccDescr {a
b}\r`,
      },
    ],
    invalid: [],
  },
)
