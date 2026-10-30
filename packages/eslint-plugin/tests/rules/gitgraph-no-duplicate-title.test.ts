import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
/** The rule on its document examples and fixture files. */
import { gitgraphNoDuplicateTitle } from "../../src/rules/gitgraph-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("gitgraph-no-duplicate-title", gitgraphNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "gitgraph-no-duplicate-title",
  gitgraphNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/gitgraph/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/gitgraph-no-duplicate-title/invalid/gitgraph/title-equal-predecessor-crlf-input.mmd",
        code: `gitGraph\r
accTitle: A\r
accTitle: A\r
accTitle: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `gitGraph\r
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
