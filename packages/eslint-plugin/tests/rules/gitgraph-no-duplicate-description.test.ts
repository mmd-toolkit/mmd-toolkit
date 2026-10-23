/** The rule on its document examples, fixture files, and escaped line terminators. */
import { RuleTester } from "eslint"
import { gitgraphNoDuplicateDescription } from "../../src/rules/gitgraph-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("gitgraph-no-duplicate-description", gitgraphNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "gitgraph-no-duplicate-description",
  gitgraphNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/gitgraph/descriptions-cr-control",
        filename: "descriptions-cr-control.mmd",
        code: `gitGraph
accDescr {A\rB}
accDescr {A
B}
`,
      },
      {
        name: "valid/gitgraph/description-block-ls-ends-line",
        filename: "description-block-ls-ends-line.mmd",
        code: `gitGraph
accDescr {a \u2028  b}
accDescr {a\u2028b}
commit
`,
      },
      {
        name: "valid/gitgraph/description-block-ps-ends-line",
        filename: "description-block-ps-ends-line.mmd",
        code: `gitGraph
accDescr {a  \u2029 b}
accDescr {a\u2029b}
commit
`,
      },
    ],
    invalid: [
      {
        name: "invalid/gitgraph/description-line-ls-is-text",
        filename: "description-line-ls-is-text.mmd",
        code: `gitGraph
accDescr: a  \u2028 b
accDescr {a  \u2028 b}
commit
`,
        errors: [
          {
            messageId: "duplicate",
            data: { line: "2" },
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 18,
          },
        ],
      },
    ],
  },
)
