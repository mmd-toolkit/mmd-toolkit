/** The rule on its document examples, fixture files, and escaped line terminators. */
import { RuleTester } from "eslint"
import { gitgraphNoDuplicateOption } from "../../src/rules/gitgraph-no-duplicate-option.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("gitgraph-no-duplicate-option", gitgraphNoDuplicateOption)

new RuleTester(LANGUAGE_CONFIG).run(
  "gitgraph-no-duplicate-option",
  gitgraphNoDuplicateOption,
  {
    valid: [
      {
        name: "valid/gitgraph/repeat-options-value-cr",
        filename: "repeat-options-value-cr.mmd",
        code: `gitGraph
commit id:"a\rb" id:"a
b"
`,
      },

      {
        name: "valid/gitgraph/repeat-options-value-crlf",
        filename:
          "tests/fixtures/rules/gitgraph-no-duplicate-option/valid/gitgraph/repeat-options-value-crlf-input.mmd",
        code: `gitGraph
commit id:"a\r
b" id:"a
b"
`,
      },
    ],
    invalid: [
      {
        name: "invalid/gitgraph/repeat-options-crlf",
        filename:
          "tests/fixtures/rules/gitgraph-no-duplicate-option/invalid/gitgraph/repeat-options-crlf-input.mmd",
        code: `gitGraph\r
commit id:"a" id:"b"\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier `id:` value in this statement with this value.",
            line: 2,
            column: 15,
            endLine: 2,
            endColumn: 21,
            suggestions: [
              {
                desc: "Remove this option.",
                output: `gitGraph\r
commit id:"a"\r
`,
              },
              {
                desc: "Remove the earlier option.",
                output: `gitGraph\r
commit id:"b"\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
