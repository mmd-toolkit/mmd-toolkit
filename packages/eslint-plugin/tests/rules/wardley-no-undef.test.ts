/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { wardleyNoUndef } from "../../src/rules/wardley-no-undef.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("wardley-no-undef", wardleyNoUndef)

new RuleTester(LANGUAGE_CONFIG).run("wardley-no-undef", wardleyNoUndef, {
  valid: [
    {
      name: "valid/wardley/name-reference-lone-cr",
      filename: "name-reference-lone-cr.mmd",
      code: `wardley-beta
component "A\rB" [0.4,0.5]
component C [0.6,0.7]
"A
B" -> C`,
    },
  ],
  invalid: [
    {
      name: "invalid/wardley/name-reference-whitespace-distinct",
      filename: "name-reference-whitespace-distinct.mmd",
      code: `wardley-beta
component "A B" [0.3,0.4]
component C [0.6,0.8]
"A\tB" -> C`,
      errors: [
        {
          message: "mermaid.js draws no link because `A\tB` names no node.",
          line: 4,
          column: 1,
          endLine: 4,
          endColumn: 6,
        },
      ],
    },
  ],
})
