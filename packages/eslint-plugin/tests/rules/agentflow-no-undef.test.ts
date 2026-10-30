/**
 * The rule `agentflow-no-undef`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { agentflowNoUndef } from "../../src/rules/agentflow-no-undef.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("agentflow-no-undef", agentflowNoUndef)

new RuleTester(LANGUAGE_CONFIG).run("agentflow-no-undef", agentflowNoUndef, {
  valid: [],
  invalid: [
    {
      name: "invalid/agentflow/undef-cr",
      filename: "undef-cr.mmd",
      code: `agentflow-beta TB\rA\rclass A,Typo hot\r`,
      errors: [
        {
          message:
            "mermaid.js gives no element these classes for the undefined id `Typo`.",
          line: 3,
          column: 9,
          endLine: 3,
          endColumn: 13,
        },
      ],
    },
    {
      name: "invalid/agentflow/undef-crlf",
      filename: "undef-crlf.mmd",
      code: `agentflow-beta TB\r
A\r
class A,Typo hot\r
`,
      errors: [
        {
          message:
            "mermaid.js gives no element these classes for the undefined id `Typo`.",
          line: 3,
          column: 9,
          endLine: 3,
          endColumn: 13,
        },
      ],
    },
  ],
})
