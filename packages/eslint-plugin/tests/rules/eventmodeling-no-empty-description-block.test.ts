/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { eventmodelingNoEmptyDescriptionBlock } from "../../src/rules/eventmodeling-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "eventmodeling-no-empty-description-block",
  eventmodelingNoEmptyDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "eventmodeling-no-empty-description-block",
  eventmodelingNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/eventmodeling/description-whitespace",
        filename: "description-whitespace.mmd",
        code: `eventmodeling accDescr { 
 \t
 } tf 01 evt Bought`,
        errors: [
          {
            message:
              "mermaid.js uses the text of this empty `accDescr` block as the description, replacing any earlier description.",
            line: 1,
            column: 15,
            endLine: 3,
            endColumn: 3,
          },
        ],
      },
      {
        name: "invalid/eventmodeling/empty-nbsp",
        filename: "empty-nbsp.mmd",
        code: `eventmodeling accDescr {\u00a0} tf 01 evt Bought`,
        errors: [
          {
            message:
              "mermaid.js uses the text of this empty `accDescr` block as the description, replacing any earlier description.",
            line: 1,
            column: 15,
            endLine: 1,
            endColumn: 27,
          },
        ],
      },
    ],
  },
)
