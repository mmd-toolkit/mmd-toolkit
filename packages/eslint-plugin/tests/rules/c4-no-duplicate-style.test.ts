/**
 * The rule `c4-no-duplicate-style`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { c4NoDuplicateStyle } from "../../src/rules/c4-no-duplicate-style.ts"
import { testRule } from "../rule-test.ts"

testRule("c4-no-duplicate-style", c4NoDuplicateStyle)

new RuleTester(LANGUAGE_CONFIG).run(
  "c4-no-duplicate-style",
  c4NoDuplicateStyle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/c4/crlf",
        filename:
          "tests/fixtures/rules/c4-no-duplicate-style/invalid/c4/crlf-input.mmd",
        code: `C4Context\r
Person(a, "A")\r
UpdateElementStyle(a, $bgColor="red")\r
UpdateElementStyle(a, $bgColor="blue")\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the `bgColor` given by an earlier update with this value.",
            line: 4,
            column: 23,
            endLine: 4,
            endColumn: 38,
          },
        ],
      },
    ],
  },
)
