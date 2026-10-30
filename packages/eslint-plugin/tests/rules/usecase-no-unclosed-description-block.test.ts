/** The rule `usecase-no-unclosed-description-block`, on its document examples and fixture inputs. */
import { RuleTester } from "eslint"
import { usecaseNoUnclosedDescriptionBlock } from "../../src/rules/usecase-no-unclosed-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "usecase-no-unclosed-description-block",
  usecaseNoUnclosedDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "usecase-no-unclosed-description-block",
  usecaseNoUnclosedDescriptionBlock,
  {
    valid: [
      {
        name: "valid/usecase/later-brace-after-ls-is-same-line",
        filename: "later-brace-after-ls-is-same-line.mmd",
        code: `usecase-beta
accDescr { first\u2028C@{type:hollow}
D
`,
      },
      {
        name: "valid/usecase/later-brace-after-ps-is-same-line",
        filename: "later-brace-after-ps-is-same-line.mmd",
        code: `usecase-beta
accDescr { first\u2029C@{type:hollow}
D
`,
      },
    ],
    invalid: [
      {
        name: "invalid/usecase/closing-crlf-with-tab",
        filename: "input.mmd",
        code: `usecase-beta\r
accDescr { First\tline\r
actor C@{ type: hollow }\r
D\r
`,
        errors: [{ messageId: "closedByOtherBrace" }],
      },

      {
        name: "invalid/usecase/crlf",
        filename:
          "tests/fixtures/rules/usecase-no-unclosed-description-block/invalid/usecase/crlf-input.mmd",
        code: `usecase-beta\r
accDescr { first\r
A --> B\r
C@{ type: hollow }\r
D\r
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
