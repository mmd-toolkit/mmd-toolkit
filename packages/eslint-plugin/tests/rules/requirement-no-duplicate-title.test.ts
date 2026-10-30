/**
 * The rule `requirement-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { requirementNoDuplicateTitle } from "../../src/rules/requirement-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("requirement-no-duplicate-title", requirementNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "requirement-no-duplicate-title",
  requirementNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/requirement/acc-title-twice-crlf",
        filename:
          "tests/fixtures/rules/requirement-no-duplicate-title/invalid/requirement/acc-title-twice-crlf-input.mmd",
        code: `requirementDiagram\r
accTitle: a\r
accTitle: b\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `requirementDiagram\r
accTitle: a\r
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `requirementDiagram\r
accTitle: b\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/requirement/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/requirement-no-duplicate-title/invalid/requirement/title-equal-predecessor-crlf-input.mmd",
        code: `requirementDiagram\r
accTitle: A\r
accTitle: A\r
accTitle: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `accTitle`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `requirementDiagram\r
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
