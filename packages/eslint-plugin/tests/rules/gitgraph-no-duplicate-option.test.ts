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
    ],
    invalid: [],
  },
)
