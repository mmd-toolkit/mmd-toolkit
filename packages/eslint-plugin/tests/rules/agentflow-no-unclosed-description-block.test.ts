/**
 * The rule `agentflow-no-unclosed-description-block`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { agentflowNoUnclosedDescriptionBlock } from "../../src/rules/agentflow-no-unclosed-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "agentflow-no-unclosed-description-block",
  agentflowNoUnclosedDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "agentflow-no-unclosed-description-block",
  agentflowNoUnclosedDescriptionBlock,
  {
    valid: [
      {
        name: "valid/agentflow/unclosed-ls-not-linebreak",
        filename: "unclosed-ls-not-linebreak.mmd",
        code: `agentflow-beta TB
accDescr { x\u2028A{y}
B
`,
      },
      {
        name: "valid/agentflow/unclosed-ps-not-linebreak",
        filename: "unclosed-ps-not-linebreak.mmd",
        code: `agentflow-beta TB
accDescr { x\u2029A{y}
B
`,
      },
      {
        name: "valid/agentflow/unclosed-nbsp-alone",
        filename: "unclosed-nbsp-alone.mmd",
        code: `agentflow-beta TB
accDescr {
x { here
\u00a0}
A
`,
      },
    ],
    invalid: [
      {
        name: "invalid/agentflow/unclosed-cr-other-brace",
        filename: "unclosed-cr-other-brace.mmd",
        code: `agentflow-beta TB\raccDescr { x\rA{y}\rB\r`,
        errors: [
          {
            message:
              "mermaid.js closes this `accDescr {` block at the `}` of a later `{`, and reads the lines up to it as the description.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 11,
            suggestions: [],
          },
        ],
      },
      {
        name: "invalid/agentflow/unclosed-crlf-other-brace",
        filename: "unclosed-crlf-other-brace.mmd",
        code: `agentflow-beta TB\r
accDescr { x\r
A{y}\r
B\r
`,
        errors: [
          {
            message:
              "mermaid.js closes this `accDescr {` block at the `}` of a later `{`, and reads the lines up to it as the description.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 11,
            suggestions: [],
          },
        ],
      },
      {
        name: "invalid/agentflow/closing-crlf-with-tab",
        filename: "input.mmd",
        code: `agentflow-beta TB\r
accDescr { First\tline\r
A --> B\r
`,
        errors: [
          {
            messageId: "unclosed",
            suggestions: [
              {
                desc: "Close the block at the end of the text.",
                output: `agentflow-beta TB\r
accDescr { First\tline\r
A --> B\r
}\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
