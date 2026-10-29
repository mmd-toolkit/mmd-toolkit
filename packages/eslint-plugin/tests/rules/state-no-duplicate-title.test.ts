/**
 * The rule `state-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { stateNoDuplicateTitle } from "../../src/rules/state-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("state-no-duplicate-title", stateNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "state-no-duplicate-title",
  stateNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/state/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/state-no-duplicate-title/invalid/state/title-equal-predecessor-crlf-input.mmd",
        code: `stateDiagram-v2\r
accTitle: A\r
accTitle: A\r
accTitle: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `stateDiagram-v2\r
accTitle: A\r
accTitle: A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
