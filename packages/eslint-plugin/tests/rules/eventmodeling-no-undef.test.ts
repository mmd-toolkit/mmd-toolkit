/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { eventmodelingNoUndef } from "../../src/rules/eventmodeling-no-undef.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("eventmodeling-no-undef", eventmodelingNoUndef)

new RuleTester(LANGUAGE_CONFIG).run(
  "eventmodeling-no-undef",
  eventmodelingNoUndef,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/eventmodeling/source-ls",
        filename: "source-ls.mmd",
        code: `eventmodeling
rf 01 ui Cart\u2028tf 02 cmd Buy ->> 99`,
        errors: [
          {
            message: "mermaid.js finds no frame named `99` for this reference.",
            line: 2,
            column: 33,
            endLine: 2,
            endColumn: 35,
          },
        ],
      },

      {
        name: "invalid/eventmodeling/source-crlf",
        filename:
          "tests/fixtures/rules/eventmodeling-no-undef/invalid/eventmodeling/source-crlf-input.mmd",
        code: `eventmodeling\r
rf 01 ui Cart\r
tf 02 cmd Buy ->> 99`,
        errors: [
          {
            message: "mermaid.js finds no frame named `99` for this reference.",
            line: 3,
            column: 19,
            endLine: 3,
            endColumn: 21,
          },
        ],
      },
    ],
  },
)
