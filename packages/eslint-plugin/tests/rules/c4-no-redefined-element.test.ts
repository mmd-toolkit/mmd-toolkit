/**
 * The rule `c4-no-redefined-element`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { c4NoRedefinedElement } from "../../src/rules/c4-no-redefined-element.ts"
import { testRule } from "../rule-test.ts"

testRule("c4-no-redefined-element", c4NoRedefinedElement)

new RuleTester(LANGUAGE_CONFIG).run(
  "c4-no-redefined-element",
  c4NoRedefinedElement,
  {
    valid: [
      {
        name: "valid/c4/label-line-ending-normalization",
        filename:
          "tests/fixtures/rules/c4-no-redefined-element/valid/c4/label-line-ending-normalization-input.mmd",
        code: `C4Context
Person(a, "Customer
Mobile")
Person(a, "Customer\r
Mobile")
`,
      },
    ],
    invalid: [],
  },
)
