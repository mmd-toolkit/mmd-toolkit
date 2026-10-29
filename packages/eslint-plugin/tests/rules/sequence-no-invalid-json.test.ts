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

      {
        name: "valid/sequence/db-links-crlf",
        filename:
          "tests/fixtures/rules/sequence-no-invalid-json/valid/sequence/db-links-crlf-input.mmd",
        code: `sequenceDiagram\r
participant A\r
links A: {"a": "b"}\r
`,
      },
    ],
    invalid: [
      {
        name: "autofix-crlf",
        filename: "autofix-crlf.mmd",
        code: `sequenceDiagram\r
participant A\r
properties A: {"a": [1, 2,], "b": 1,}\r
`,
        output: `sequenceDiagram\r
participant A\r
properties A: {"a": [1, 2], "b": 1}\r
`,
        errors: [
          {
            message:
              "mermaid.js sets nothing from this `properties` statement because its text is not JSON.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 38,
          },
        ],
      },
    ],
  },
)
