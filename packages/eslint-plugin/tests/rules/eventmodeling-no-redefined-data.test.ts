/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { eventmodelingNoRedefinedData } from "../../src/rules/eventmodeling-no-redefined-data.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("eventmodeling-no-redefined-data", eventmodelingNoRedefinedData)

new RuleTester(LANGUAGE_CONFIG).run(
  "eventmodeling-no-redefined-data",
  eventmodelingNoRedefinedData,
  {
    valid: [
      {
        name: "valid/eventmodeling/data-lone-cr-lf-equal",
        filename: "data-lone-cr-lf-equal.mmd",
        code: `eventmodeling
tf 01 evt Bought [[Payload]]
data Payload {\rfirst\r}
data Payload {
first
}`,
      },

      {
        name: "valid/eventmodeling/data-mixed-crlf-lf-equal",
        filename:
          "tests/fixtures/rules/eventmodeling-no-redefined-data/valid/eventmodeling/data-mixed-crlf-lf-equal-input.mmd",
        code: `eventmodeling
tf 01 evt Bought [[Payload]]
data Payload {\r
first\r
}
data Payload {
first
}`,
      },
    ],
    invalid: [
      {
        name: "invalid/eventmodeling/data-ls-ps-kept-as-content",
        filename: "data-ls-ps-kept-as-content.mmd",
        code: `eventmodeling
tf 01 evt Bought [[Payload]]
data Payload {
A\u2028B\u2029C
}
data Payload {
A
B
C
}`,
        errors: [
          {
            message:
              "mermaid.js shows the first `Payload` data block; the content of this later block is not used.",
            line: 6,
            column: 6,
            endLine: 6,
            endColumn: 13,
          },
        ],
      },
      {
        name: "invalid/eventmodeling/data-tab-content-differs",
        filename: "data-tab-content-differs.mmd",
        code: `eventmodeling
tf 01 evt Bought [[Payload]]
data Payload {
A\tB
}
data Payload {
A B
}`,
        errors: [
          {
            message:
              "mermaid.js shows the first `Payload` data block; the content of this later block is not used.",
            line: 6,
            column: 6,
            endLine: 6,
            endColumn: 13,
          },
        ],
      },

      {
        name: "invalid/eventmodeling/data-redefined-crlf",
        filename:
          "tests/fixtures/rules/eventmodeling-no-redefined-data/invalid/eventmodeling/data-redefined-crlf-input.mmd",
        code: `eventmodeling\r
tf 01 evt Bought [[Payload]]\r
data Payload {\r
first\r
}\r
data Payload {\r
second\r
}`,
        errors: [
          {
            message:
              "mermaid.js shows the first `Payload` data block; the content of this later block is not used.",
            line: 6,
            column: 6,
            endLine: 6,
            endColumn: 13,
          },
        ],
      },
    ],
  },
)
