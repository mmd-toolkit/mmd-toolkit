/**
 * The rule `sequence-no-invalid-json`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { sequenceNoInvalidJson } from "../../src/rules/sequence-no-invalid-json.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-invalid-json", sequenceNoInvalidJson)

new RuleTester(LANGUAGE_CONFIG).run(
  "sequence-no-invalid-json",
  sequenceNoInvalidJson,
  {
    valid: [
      {
        name: "a line separator inside a JSON string",
        filename: "input.mmd",
        code: `sequenceDiagram
participant A
links A: {"a": "b\u2028c"}
`,
      },
    ],
    invalid: [],
  },
)
