/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { cynefinNoRedefinedDomain } from "../../src/rules/cynefin-no-redefined-domain.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("cynefin-no-redefined-domain", cynefinNoRedefinedDomain)

new RuleTester(LANGUAGE_CONFIG).run(
  "cynefin-no-redefined-domain",
  cynefinNoRedefinedDomain,
  {
    valid: [
      {
        name: "valid/cynefin/domain-lone-cr-equivalent",
        filename: "domain-lone-cr-equivalent.mmd",
        code: `cynefin-beta
complex "A\rB"
complex "A
B"`,
      },
    ],
    invalid: [],
  },
)
