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
    invalid: [],
  },
)
