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

      {
        name: "valid/agentflow/description-block-crlf",
        filename:
          "tests/fixtures/rules/agentflow-no-duplicate-description/valid/agentflow/description-block-crlf-input.mmd",
        code: `agentflow-beta TB
accDescr {First
Second}
accDescr {First\r
Second}
`,
      },
    ],
    invalid: [
      {
        name: "invalid/agentflow/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/agentflow-no-duplicate-description/invalid/agentflow/description-equal-predecessor-crlf-input.mmd",
        code: `agentflow-beta TB\r
accDescr: A\r
accDescr: A\r
accDescr: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `agentflow-beta TB\r
accDescr: A\r
accDescr: A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
