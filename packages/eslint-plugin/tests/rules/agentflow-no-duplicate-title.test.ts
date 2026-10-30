/**
 * The rule `agentflow-no-duplicate-title`, on its document examples and fixture inputs.
 */
import { RuleTester } from "eslint"
import { agentflowNoDuplicateTitle } from "../../src/rules/agentflow-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("agentflow-no-duplicate-title", agentflowNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "agentflow-no-duplicate-title",
  agentflowNoDuplicateTitle,
  {
    valid: [
      {
        name: "valid/agentflow/title-nbsp-padding",
        filename: "title-nbsp-padding.mmd",
        code: `agentflow-beta TB
accTitle: a
accTitle:\u00a0a\u00a0
`,
      },
    ],
    invalid: [
      {
        name: "invalid/agentflow/title-cr",
        filename: "title-cr.mmd",
        code: `agentflow-beta TB\raccTitle: First\raccTitle: Second\r`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 17,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `agentflow-beta TB\raccTitle: First\r`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `agentflow-beta TB\raccTitle: Second\r`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/agentflow/title-crlf",
        filename:
          "tests/fixtures/rules/agentflow-no-duplicate-title/invalid/agentflow/title-crlf-input.mmd",
        code: `agentflow-beta TB\r
accTitle: First\r
accTitle: Second\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 17,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `agentflow-beta TB\r
accTitle: First\r
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `agentflow-beta TB\r
accTitle: Second\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/agentflow/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/agentflow-no-duplicate-title/invalid/agentflow/title-equal-predecessor-crlf-input.mmd",
        code: `agentflow-beta TB\r
accTitle: A\r
accTitle: A\r
accTitle: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `agentflow-beta TB\r
accTitle: A\r
accTitle: A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
