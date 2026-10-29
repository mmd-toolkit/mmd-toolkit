/**
 * The rule `venn-no-undef`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { vennNoUndef } from "../../src/rules/venn-no-undef.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("venn-no-undef", vennNoUndef)

// A valid case asserts zero reports on its escaped CR.
new RuleTester(LANGUAGE_CONFIG).run("venn-no-undef", vennNoUndef, {
  valid: [
    {
      name: "valid/venn/target-cr",
      filename: "target-cr.mmd",
      code: `venn-beta
set "A\rB"
style "A
B" fill:red
`,
    },

    {
      name: "valid/venn/target-crlf",
      filename:
        "tests/fixtures/rules/venn-no-undef/valid/venn/target-crlf-input.mmd",
      code: `venn-beta
set "A\r
B"
style "A
B" fill:red
`,
    },
  ],
  invalid: [],
})
