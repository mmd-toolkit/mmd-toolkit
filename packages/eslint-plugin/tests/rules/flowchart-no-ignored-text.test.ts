/**
 * The rule `flowchart-no-ignored-text`, on the examples of its document and
 * on the inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { flowchartNoIgnoredText } from "../../src/rules/flowchart-no-ignored-text.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-ignored-text", flowchartNoIgnoredText)

new RuleTester(LANGUAGE_CONFIG).run(
  "flowchart-no-ignored-text",
  flowchartNoIgnoredText,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/flowchart/gram-ignored-text-split-keeps-cr",
        filename:
          "tests/fixtures/rules/flowchart-no-ignored-text/invalid/flowchart/gram-ignored-text-split-keeps-cr-input.mmd",
        code: `flowchart LR\r  subgraph S\r    A-->B; direction TB\r  end\r`,
        errors: [
          {
            message:
              "mermaid.js reads this line as a `direction` statement and drops this text.",
            line: 3,
            column: 5,
            endLine: 3,
            endColumn: 11,
          },
        ],
      },
      {
        name: "invalid/flowchart/gram-ignored-text-split-keeps-cr-on-last-line-without-line-break",
        filename:
          "tests/fixtures/rules/flowchart-no-ignored-text/invalid/flowchart/gram-ignored-text-split-keeps-cr-on-last-line-without-line-break-input.mmd",
        code: `flowchart LR\r  A-->B; direction TB`,
        errors: [
          {
            message:
              "mermaid.js reads this line as a `direction` statement and drops this text.",
            line: 2,
            column: 3,
            endLine: 2,
            endColumn: 9,
          },
        ],
      },
      {
        name: "invalid/flowchart/gram-ignored-text-split-keeps-crlf",
        filename:
          "tests/fixtures/rules/flowchart-no-ignored-text/invalid/flowchart/gram-ignored-text-split-keeps-crlf-input.mmd",
        code: `flowchart LR\r
  subgraph S\r
    A-->B; direction TB\r
  end\r
`,
        errors: [
          {
            message:
              "mermaid.js reads this line as a `direction` statement and drops this text.",
            line: 3,
            column: 5,
            endLine: 3,
            endColumn: 11,
          },
        ],
      },
      {
        name: "invalid/flowchart/gram-ignored-text-split-keeps-crlf-on-last-line-without-line-break",
        filename:
          "tests/fixtures/rules/flowchart-no-ignored-text/invalid/flowchart/gram-ignored-text-split-keeps-crlf-on-last-line-without-line-break-input.mmd",
        code: `flowchart LR\r
  A-->B; direction TB`,
        errors: [
          {
            message:
              "mermaid.js reads this line as a `direction` statement and drops this text.",
            line: 2,
            column: 3,
            endLine: 2,
            endColumn: 9,
          },
        ],
      },
    ],
  },
)
