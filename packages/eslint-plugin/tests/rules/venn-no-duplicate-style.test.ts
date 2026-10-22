/**
 * The rule `venn-no-duplicate-style`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { vennNoDuplicateStyle } from "../../src/rules/venn-no-duplicate-style.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("venn-no-duplicate-style", vennNoDuplicateStyle)

// A valid case asserts zero reports on its escaped CR.
new RuleTester(LANGUAGE_CONFIG).run(
  "venn-no-duplicate-style",
  vennNoDuplicateStyle,
  {
    valid: [
      {
        name: "valid/venn/style-cr-values",
        filename: "style-cr-values.mmd",
        code: `venn-beta
set A
style A color:"red\rblue",color:"red
blue"
`,
      },
    ],
    invalid: [],
  },
)
