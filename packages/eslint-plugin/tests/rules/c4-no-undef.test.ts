/**
 * The rule `c4-no-undef`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { c4NoUndef } from "../../src/rules/c4-no-undef.ts"
import { testRule } from "../rule-test.ts"

testRule("c4-no-undef", c4NoUndef)

new RuleTester(LANGUAGE_CONFIG).run("c4-no-undef", c4NoUndef, {
  valid: [],
  invalid: [
    {
      name: "invalid/c4/undefined-use-crlf",
      filename:
        "tests/fixtures/rules/c4-no-undef/invalid/c4/undefined-use-crlf-input.mmd",
      code: `C4Context\r
Person(a, "A")\r
UpdateElementStyle(typo, "red")\r
`,
      errors: [
        {
          message:
            "mermaid.js applies no style: no element or boundary has this alias when this `UpdateElementStyle` is read.",
          line: 3,
          column: 20,
          endLine: 3,
          endColumn: 24,
        },
      ],
    },
  ],
})
