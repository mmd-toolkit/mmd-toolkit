/** The rule on its document examples, fixture files, and escaped line terminators. */
import { RuleTester } from "eslint"
import { gitgraphNoRedefinedCommit } from "../../src/rules/gitgraph-no-redefined-commit.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("gitgraph-no-redefined-commit", gitgraphNoRedefinedCommit)

new RuleTester(LANGUAGE_CONFIG).run(
  "gitgraph-no-redefined-commit",
  gitgraphNoRedefinedCommit,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/gitgraph/duplicate-id-value-cr",
        filename: "duplicate-id-value-cr.mmd",
        code: `gitGraph
commit id:"a\rb"
commit id:"a
b"
`,
        errors: [
          {
            messageId: "redefined",
            line: 4,
            column: 1,
            endLine: 5,
            endColumn: 3,
          },
        ],
      },

      {
        name: "invalid/gitgraph/crlf",
        filename:
          "tests/fixtures/rules/gitgraph-no-redefined-commit/invalid/gitgraph/crlf-input.mmd",
        code: `gitGraph\r
commit id:"A"\r
%% c\r
commit id:"A"\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the commit with this id, written earlier, with this commit.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 14,
          },
        ],
      },
    ],
  },
)
