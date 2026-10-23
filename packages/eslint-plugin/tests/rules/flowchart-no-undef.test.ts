/**
 * The rule `flowchart-no-undef`, on the examples of its document and
 * on the inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { flowchartNoUndef } from "../../src/rules/flowchart-no-undef.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-undef", flowchartNoUndef)

new RuleTester(LANGUAGE_CONFIG).run("flowchart-no-undef", flowchartNoUndef, {
  valid: [],
  invalid: [
    {
      name: "invalid/flowchart/db-undef-style-cr",
      filename: "db-undef-style-cr.mmd",
      code: `flowchart LR\r  A --> B\r  style C fill:red\r`,
      errors: [
        {
          messageId: "undef",
          data: { id: "C" },
          line: 3,
          column: 9,
          endLine: 3,
          endColumn: 10,
        },
      ],
    },
  ],
})
