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
    invalid: [
      {
        name: "invalid/venn/title-crlf",
        filename:
          "tests/fixtures/rules/venn-no-duplicate-title/invalid/venn/title-crlf-input.mmd",
        code: `venn-beta\r
title Audience\r
title Coverage\r
`,
        errors: [
          {
            message: "mermaid.js replaces the earlier title with this title.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 15,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `venn-beta\r
title Audience\r
`,
              },
              {
                desc: "Remove the earlier statement that sets the title.",
                output: `venn-beta\r
title Coverage\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/venn/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/venn-no-duplicate-title/invalid/venn/title-equal-predecessor-crlf-input.mmd",
        code: `venn-beta\r
title A\r
title A\r
title B\r
`,
        errors: [
          {
            message: "mermaid.js replaces the earlier title with this title.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 8,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `venn-beta\r
title A\r
title A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
