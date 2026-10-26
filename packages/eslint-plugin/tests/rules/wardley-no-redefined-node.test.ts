/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { wardleyNoRedefinedNode } from "../../src/rules/wardley-no-redefined-node.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("wardley-no-redefined-node", wardleyNoRedefinedNode)

new RuleTester(LANGUAGE_CONFIG).run(
  "wardley-no-redefined-node",
  wardleyNoRedefinedNode,
  {
    valid: [
      {
        name: "valid/wardley/node-name-lone-cr-equal",
        filename: "node-name-lone-cr-equal.mmd",
        code: `wardley-beta
component "A\rB" [0.4,0.5]
component "A
B" [40.0,50.0]`,
      },
    ],
    invalid: [],
  },
)
