/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { radarNoUnclosedDescriptionBlock } from "../../src/rules/radar-no-unclosed-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("radar-no-unclosed-description-block", radarNoUnclosedDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "radar-no-unclosed-description-block",
  radarNoUnclosedDescriptionBlock,
  {
    valid: [
      {
        name: "valid/radar/brace-after-ls-same-physical-line",
        filename: "brace-after-ls-same-physical-line.mmd",
        code: `radar-beta
accDescr { first\u2028 curve sales{1, 2, 3}
`,
      },
      {
        name: "valid/radar/brace-after-ps-same-physical-line",
        filename: "brace-after-ps-same-physical-line.mmd",
        code: `radar-beta
accDescr { first\u2029 curve sales{1, 2, 3}
`,
      },
    ],
    invalid: [
      {
        name: "invalid/radar/closed-by-curve-lone-cr",
        filename: "closed-by-curve-lone-cr.mmd",
        code: `radar-beta\raccDescr { unfinished\raxis A, B, C\rcurve sales{1, 2, 3}\r`,
        errors: [
          {
            messageId: "closedByOtherBrace",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 11,
          },
        ],
      },

      {
        name: "invalid/radar/crlf",
        filename:
          "tests/fixtures/rules/radar-no-unclosed-description-block/invalid/radar/crlf-input.mmd",
        code: `radar-beta\r
accDescr { first\r
axis A, B, C\r
curve sales{1, 2, 3}\r
`,
        errors: [
          {
            message:
              "mermaid.js closes this `accDescr {` block at the `}` of a later `{`, and reads the lines up to it as the description.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 11,
          },
        ],
      },
    ],
  },
)
