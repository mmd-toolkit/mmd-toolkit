/**
 * The rule `block-no-redefined-style`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { blockNoRedefinedStyle } from "../../src/rules/block-no-redefined-style.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("block-no-redefined-style", blockNoRedefinedStyle)

new RuleTester(LANGUAGE_CONFIG).run(
  "block-no-redefined-style",
  blockNoRedefinedStyle,
  {
    valid: [],
    invalid: [
      {
        name: "a no-break space inside a value is no whitespace of CSS",
        filename: "input.mmd",
        code: `block
  A
  style A border:1px\u00a0solid red
  style A border:1px solid red
`,
        errors: [
          {
            message:
              "mermaid.js replaces the whole style list of `A`, losing a style set earlier.",
            line: 4,
            column: 3,
            endLine: 4,
            endColumn: 31,
          },
        ],
      },
    ],
  },
)
