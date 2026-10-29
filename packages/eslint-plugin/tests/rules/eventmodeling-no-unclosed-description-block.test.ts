/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { eventmodelingNoUnclosedDescriptionBlock } from "../../src/rules/eventmodeling-no-unclosed-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "eventmodeling-no-unclosed-description-block",
  eventmodelingNoUnclosedDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "eventmodeling-no-unclosed-description-block",
  eventmodelingNoUnclosedDescriptionBlock,
  {
    valid: [
      {
        name: "valid/eventmodeling/ls-same-physical-line",
        filename: "ls-same-physical-line.mmd",
        code: `eventmodeling accDescr { first\u2028tf 01 cmd Buy { item } tf 02 evt Bought`,
      },
      {
        name: "valid/eventmodeling/ps-same-physical-line",
        filename: "ps-same-physical-line.mmd",
        code: `eventmodeling accDescr { first\u2029tf 01 cmd Buy { item } tf 02 evt Bought`,
      },
    ],
    invalid: [
      {
        name: "invalid/eventmodeling/lone-cr-later-inline-brace",
        filename: "lone-cr-later-inline-brace.mmd",
        code: `eventmodeling accDescr { first\rtf 01 cmd Buy { item }\rtf 02 evt Bought`,
        errors: [
          {
            message:
              "mermaid.js closes this `accDescr {` block at the `}` of a later `{`, and reads the lines up to it as the description.",
            line: 1,
            column: 15,
            endLine: 1,
            endColumn: 25,
          },
        ],
      },

      {
        name: "invalid/eventmodeling/crlf",
        filename:
          "tests/fixtures/rules/eventmodeling-no-unclosed-description-block/invalid/eventmodeling/crlf-input.mmd",
        code: `eventmodeling accDescr { first\r
  tf 01 cmd Buy { item }\r
`,
        errors: [
          {
            message:
              "mermaid.js closes this `accDescr {` block at the `}` of a later `{`, and reads the lines up to it as the description.",
            line: 1,
            column: 15,
            endLine: 1,
            endColumn: 25,
          },
        ],
      },
    ],
  },
)
