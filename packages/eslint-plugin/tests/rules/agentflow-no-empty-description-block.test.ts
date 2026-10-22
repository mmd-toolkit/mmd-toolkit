/**
 * The rule `agentflow-no-empty-description-block`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { agentflowNoEmptyDescriptionBlock } from "../../src/rules/agentflow-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "agentflow-no-empty-description-block",
  agentflowNoEmptyDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "agentflow-no-empty-description-block",
  agentflowNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/agentflow/empty-ls-block",
        filename: "empty-ls-block.mmd",
        code: `agentflow-beta TB
accDescr {\u2028}
`,
        errors: [
          {
            message:
              "mermaid.js takes no description from this empty `accDescr` block: the description stays as it was before it.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 13,
          },
        ],
      },
      {
        name: "invalid/agentflow/empty-ps-block",
        filename: "empty-ps-block.mmd",
        code: `agentflow-beta TB
accDescr {\u2029}
`,
        errors: [
          {
            message:
              "mermaid.js takes no description from this empty `accDescr` block: the description stays as it was before it.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 13,
          },
        ],
      },
      {
        name: "invalid/agentflow/empty-nbsp-block",
        filename: "empty-nbsp-block.mmd",
        code: `agentflow-beta TB
accDescr {\u00a0}
`,
        errors: [
          {
            message:
              "mermaid.js takes no description from this empty `accDescr` block: the description stays as it was before it.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 13,
          },
        ],
      },
      {
        name: "invalid/agentflow/empty-cr-block",
        filename: "empty-cr-block.mmd",
        code: `agentflow-beta TB\raccDescr {\r}\r`,
        errors: [
          {
            message:
              "mermaid.js takes no description from this empty `accDescr` block: the description stays as it was before it.",
            line: 2,
            column: 1,
            endLine: 3,
            endColumn: 2,
          },
        ],
      },
    ],
  },
)
