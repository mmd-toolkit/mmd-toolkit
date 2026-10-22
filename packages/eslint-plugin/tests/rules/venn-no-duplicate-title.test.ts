/**
 * The rule `venn-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { vennNoDuplicateTitle } from "../../src/rules/venn-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("venn-no-duplicate-title", vennNoDuplicateTitle)

// Valid cases assert zero reports on their escaped line terminators.
new RuleTester(LANGUAGE_CONFIG).run(
  "venn-no-duplicate-title",
  vennNoDuplicateTitle,
  {
    valid: [
      {
        name: "valid/venn/title-line-separator",
        filename: "title-line-separator.mmd",
        code: `venn-beta
title First\u2028title Second
set A
`,
      },
      {
        name: "valid/venn/title-cr-value",
        filename: "title-cr-value.mmd",
        code: `venn-beta
title Audience
title\rAudience
`,
      },
    ],
    invalid: [],
  },
)
