/**
 * The rule `venn-no-invalid-style-key`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { vennNoInvalidStyleKey } from "../../src/rules/venn-no-invalid-style-key.ts"
import { testRule } from "../rule-test.ts"

testRule("venn-no-invalid-style-key", vennNoInvalidStyleKey)

new RuleTester(LANGUAGE_CONFIG).run(
  "venn-no-invalid-style-key",
  vennNoInvalidStyleKey,
  {
    valid: [],
    invalid: [
      {
        name: "autofix-crlf",
        filename: "autofix-crlf.mmd",
        code: `venn-beta\r
set A\r
style A FILL:red\r
`,
        output: `venn-beta\r
set A\r
style A fill:red\r
`,
        errors: [
          {
            message:
              "mermaid.js does not read the style property `FILL` in the drawing.",
            line: 3,
            column: 9,
            endLine: 3,
            endColumn: 13,
            suggestions: [],
          },
        ],
      },
    ],
  },
)
