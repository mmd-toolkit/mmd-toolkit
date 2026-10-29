/**
 * The rule `block-no-spaced-class-id`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { blockNoSpacedClassId } from "../../src/rules/block-no-spaced-class-id.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-spaced-class-id", blockNoSpacedClassId)

new RuleTester(LANGUAGE_CONFIG).run(
  "block-no-spaced-class-id",
  blockNoSpacedClassId,
  {
    valid: [],
    invalid: [
      {
        name: "autofix-crlf",
        filename: "autofix-crlf.mmd",
        code: `block-beta\r
A B\r
class A, B c\r
`,
        output: `block-beta\r
A B\r
class A,B c\r
`,
        errors: [
          {
            message:
              "mermaid.js includes the whitespace after the comma in this id and gives the class to an unplaced block.",
            line: 3,
            column: 9,
            endLine: 3,
            endColumn: 11,
          },
        ],
      },
    ],
  },
)
