/**
 * The rule `quadrant-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { quadrantNoDuplicateTitle } from "../../src/rules/quadrant-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-duplicate-title", quadrantNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "quadrant-no-duplicate-title",
  quadrantNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/quadrant/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/quadrant-no-duplicate-title/invalid/quadrant/title-equal-predecessor-crlf-input.mmd",
        code: `quadrantChart\r
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
                output: `quadrantChart\r
accTitle: A\r
accTitle: A\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/quadrant/title-twice-crlf",
        filename:
          "tests/fixtures/rules/quadrant-no-duplicate-title/invalid/quadrant/title-twice-crlf-input.mmd",
        code: `quadrantChart\r
  title a\r
  title b\r
  A: [0.3, 0.6]\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `title`.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 10,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `quadrantChart\r
  title a\r
  A: [0.3, 0.6]\r
`,
              },
              {
                desc: "Remove the earlier statement that sets the title.",
                output: `quadrantChart\r
  title b\r
  A: [0.3, 0.6]\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
