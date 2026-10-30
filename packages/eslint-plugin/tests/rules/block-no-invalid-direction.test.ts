/**
 * The rule `block-no-invalid-direction`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { blockNoInvalidDirection } from "../../src/rules/block-no-invalid-direction.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-invalid-direction", blockNoInvalidDirection)

new RuleTester(LANGUAGE_CONFIG).run(
  "block-no-invalid-direction",
  blockNoInvalidDirection,
  {
    valid: [],
    invalid: [
      {
        name: "autofix-crlf",
        filename: "autofix-crlf.mmd",
        code: `block-beta\r
A<["x"]>( left )\r
`,
        output: `block-beta\r
A<["x"]>(left)\r
`,
        errors: [
          {
            message:
              "mermaid.js keeps the whitespace in this direction, and the block arrow does not point that way.",
            line: 2,
            column: 10,
            endLine: 2,
            endColumn: 16,
          },
        ],
      },
    ],
  },
)
