/**
 * The rule `sequence-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { sequenceNoDuplicateDescription } from "../../src/rules/sequence-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-duplicate-description", sequenceNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "sequence-no-duplicate-description",
  sequenceNoDuplicateDescription,
  {
    valid: [
      {
        name: "a line separator in an unclosed description block",
        filename: "input.mmd",
        code: `sequenceDiagram
accDescr: d
accDescr { x\u2028y
`,
      },
    ],
    invalid: [],
  },
)
