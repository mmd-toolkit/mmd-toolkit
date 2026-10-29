/**
 * The rule `sequence-no-link-without-separator`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { sequenceNoLinkWithoutSeparator } from "../../src/rules/sequence-no-link-without-separator.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-link-without-separator", sequenceNoLinkWithoutSeparator)

new RuleTester(LANGUAGE_CONFIG).run(
  "sequence-no-link-without-separator",
  sequenceNoLinkWithoutSeparator,
  {
    valid: [],
    invalid: [
      {
        name: "a line separator in a link without its separator",
        filename: "input.mmd",
        code: `sequenceDiagram
link A: Dash https://x\u2028
`,
        output: `sequenceDiagram
link A: Dash @ https://x\u2028
`,
        errors: [
          {
            message:
              "mermaid.js finds no `@` in the text of this `link` statement, so the label is the text without its last two characters and the URL is the whole text.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 23,
          },
        ],
      },

      {
        name: "invalid/sequence/db-link-without-at-cr",
        filename:
          "tests/fixtures/rules/sequence-no-link-without-separator/invalid/sequence/db-link-without-at-cr-input.mmd",
        code: `sequenceDiagram\rlink A: Dash https://x\r`,
        output: `sequenceDiagram\rlink A: Dash @ https://x\r`,
        errors: [
          {
            message:
              "mermaid.js finds no `@` in the text of this `link` statement, so the label is the text without its last two characters and the URL is the whole text.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 23,
          },
        ],
      },
      {
        name: "invalid/sequence/db-link-without-at-crlf",
        filename:
          "tests/fixtures/rules/sequence-no-link-without-separator/invalid/sequence/db-link-without-at-crlf-input.mmd",
        code: `sequenceDiagram\r
link A: Dash https://x\r
`,
        output: `sequenceDiagram\r
link A: Dash @ https://x\r
`,
        errors: [
          {
            message:
              "mermaid.js finds no `@` in the text of this `link` statement, so the label is the text without its last two characters and the URL is the whole text.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 23,
          },
        ],
      },
    ],
  },
)
