/**
 * The rule `requirement-no-unclosed-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { requirementNoUnclosedDescriptionBlock } from "../../src/rules/requirement-no-unclosed-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "requirement-no-unclosed-description-block",
  requirementNoUnclosedDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "requirement-no-unclosed-description-block",
  requirementNoUnclosedDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/requirement/unclosed-closed-by-body-crlf",
        filename:
          "tests/fixtures/rules/requirement-no-unclosed-description-block/invalid/requirement/unclosed-closed-by-body-crlf-input.mmd",
        code: `requirementDiagram\r
accDescr { d\r
requirement r {\r
  id: 1\r
}\r
element e {\r
}\r
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
