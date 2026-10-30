/**
 * The rule `venn-no-ignored-text`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { vennNoIgnoredText } from "../../src/rules/venn-no-ignored-text.ts"
import { testRule } from "../rule-test.ts"

testRule("venn-no-ignored-text", vennNoIgnoredText)

new RuleTester(LANGUAGE_CONFIG).run("venn-no-ignored-text", vennNoIgnoredText, {
  valid: [],
  invalid: [
    {
      name: "invalid/venn/ignored-crlf",
      filename:
        "tests/fixtures/rules/venn-no-ignored-text/invalid/venn/ignored-crlf-input.mmd",
      code: `venn-beta\r
set A:%% c\r
`,
      errors: [
        {
          message:
            "mermaid.js removes this character with the comment after it.",
          line: 2,
          column: 6,
          endLine: 2,
          endColumn: 7,
        },
      ],
    },
  ],
})
