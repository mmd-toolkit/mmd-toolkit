/**
 * The rule `agentflow-no-ignored-text`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { agentflowNoIgnoredText } from "../../src/rules/agentflow-no-ignored-text.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("agentflow-no-ignored-text", agentflowNoIgnoredText)

new RuleTester(LANGUAGE_CONFIG).run(
  "agentflow-no-ignored-text",
  agentflowNoIgnoredText,
  {
    valid: [
      {
        name: "valid/agentflow/ignored-nbsp-semicolon",
        filename: "ignored-nbsp-semicolon.mmd",
        code: `agentflow-beta TB
direction TB;\u00a0%% c
`,
      },
    ],
    invalid: [
      {
        name: "invalid/agentflow/ignored-cr",
        filename: "ignored-cr.mmd",
        code: `agentflow-beta TB\rA; direction TB; B\r`,
        errors: [
          {
            message:
              "mermaid.js reads this line as a `direction` statement and drops this text.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 3,
          },
          {
            message:
              "mermaid.js reads this line as a `direction` statement and drops this text.",
            line: 2,
            column: 16,
            endLine: 2,
            endColumn: 19,
          },
        ],
      },
    ],
  },
)
