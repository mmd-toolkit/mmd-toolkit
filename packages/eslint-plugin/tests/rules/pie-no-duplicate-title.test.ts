import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
/** The rule on its document examples and fixture inputs. */
import { pieNoDuplicateTitle } from "../../src/rules/pie-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("pie-no-duplicate-title", pieNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "pie-no-duplicate-title",
  pieNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/pie/title-crlf-history",
        filename:
          "tests/fixtures/rules/pie-no-duplicate-title/invalid/pie/title-crlf-history-input.mmd",
        code: `pie\r
title A\r
title B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `title`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 8,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `pie\r
title A\r
`,
              },
              {
                desc: "Remove the earlier statement that sets the title.",
                output: `pie\r
title B\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/pie/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/pie-no-duplicate-title/invalid/pie/title-equal-predecessor-crlf-input.mmd",
        code: `pie\r
accTitle: A\r
accTitle: A\r
accTitle: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `pie\r
accTitle: A\r
accTitle: A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
