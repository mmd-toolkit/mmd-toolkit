/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { eventmodelingNoDuplicateDescription } from "../../src/rules/eventmodeling-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "eventmodeling-no-duplicate-description",
  eventmodelingNoDuplicateDescription,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "eventmodeling-no-duplicate-description",
  eventmodelingNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/eventmodeling/description-line-block-ls-same",
        filename: "description-line-block-ls-same.mmd",
        code: `eventmodeling accDescr: First\u2028 Second
tf 01 evt Bought accDescr { First\u2028 Second }`,
      },
      {
        name: "valid/eventmodeling/description-line-ls-ps-trimmed",
        filename: "description-line-ls-ps-trimmed.mmd",
        code: `eventmodeling accDescr: A \u2028 B \u2029 C
tf 01 evt Bought accDescr { A\u2028B\u2029C }`,
      },
      {
        name: "valid/eventmodeling/description-lone-cr-crlf-lf-equal",
        filename: "description-lone-cr-crlf-lf-equal.mmd",
        code: `eventmodeling accDescr { A\r  B } tf 01 evt Bought accDescr { A\r
B }`,
      },
    ],
    invalid: [],
  },
)
