/**
 * The rule `sankey-no-empty-node`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { sankeyNoEmptyNode } from "../../src/rules/sankey-no-empty-node.ts"
import { testRule } from "../rule-test.ts"

testRule("sankey-no-empty-node", sankeyNoEmptyNode)

new RuleTester(LANGUAGE_CONFIG).run("sankey-no-empty-node", sankeyNoEmptyNode, {
  valid: [],
  invalid: [
    {
      name: "invalid/sankey/empty-target-crlf",
      filename:
        "tests/fixtures/rules/sankey-no-empty-node/invalid/sankey/empty-target-crlf-input.mmd",
      code: `sankey\r
a, ,1\r
`,
      errors: [
        {
          message:
            "mermaid.js reads this field as the empty name and adds a node without a name.",
          line: 2,
          column: 3,
          endLine: 2,
          endColumn: 4,
        },
      ],
    },
  ],
})
