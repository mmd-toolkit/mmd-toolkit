/**
 * The rule `state-no-ignored-text`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { stateNoIgnoredText } from "../../src/rules/state-no-ignored-text.ts"
import { testRule } from "../rule-test.ts"

testRule("state-no-ignored-text", stateNoIgnoredText)

new RuleTester(LANGUAGE_CONFIG).run(
  "state-no-ignored-text",
  stateNoIgnoredText,
  {
    valid: [],
    invalid: [
      {
        name: "autofix-crlf",
        filename: "autofix-crlf.mmd",
        code: `stateDiagram-v2\r
A\r
note left of A:hi\r
`,
        output: `stateDiagram-v2\r
A\r
note left of A: hi\r
`,
        errors: [
          {
            message: "mermaid.js does not read `h` and drops it.",
            line: 3,
            column: 16,
            endLine: 3,
            endColumn: 17,
          },
        ],
      },
    ],
  },
)
