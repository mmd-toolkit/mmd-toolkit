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
    ],
  },
)
