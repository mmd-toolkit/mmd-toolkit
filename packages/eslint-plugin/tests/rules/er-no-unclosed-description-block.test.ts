/**
 * The rule `er-no-unclosed-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { erNoUnclosedDescriptionBlock } from "../../src/rules/er-no-unclosed-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("er-no-unclosed-description-block", erNoUnclosedDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "er-no-unclosed-description-block",
  erNoUnclosedDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/er/crlf",
        filename:
          "tests/fixtures/rules/er-no-unclosed-description-block/invalid/er/crlf-input.mmd",
        code: `erDiagram\r
accDescr { x\r
A {\r
string n\r
}\r
B\r
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
