/** The rule on its document examples, fixture files, and escaped line terminators. */
import { RuleTester } from "eslint"
import { pieNoDuplicateDescription } from "../../src/rules/pie-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("pie-no-duplicate-description", pieNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "pie-no-duplicate-description",
  pieNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/pie/description-block-ls-ends-line",
        filename: "description-block-ls-ends-line.mmd",
        code: `pie
accDescr {a \u2028  b}
accDescr {a\u2028b}
"A":1
`,
      },
      {
        name: "valid/pie/description-block-ps-ends-line",
        filename: "description-block-ps-ends-line.mmd",
        code: `pie
accDescr: a\u2029b
accDescr {a  \u2029 b}
"A":1
`,
      },
      {
        name: "valid/pie/description-block-two-ls",
        filename: "description-block-two-ls.mmd",
        code: `pie
accDescr {a\u2028\u2028b}
accDescr {a\u2028b}
"A":1
`,
      },
      {
        name: "valid/pie/description-lone-cr-lf-equality",
        filename: "description-lone-cr-lf-equality.mmd",
        code: `pie
accDescr {A\rB}
accDescr {A
B}`,
      },

      {
        name: "valid/pie/description-crlf-lf-equality",
        filename:
          "tests/fixtures/rules/pie-no-duplicate-description/valid/pie/description-crlf-lf-equality-input.mmd",
        code: `pie
accDescr {A\r
B}
accDescr {A
B}`,
      },
    ],
    invalid: [
      {
        name: "invalid/pie/description-line-ls-is-text",
        filename: "description-line-ls-is-text.mmd",
        code: `pie
accDescr: a  \u2028 b
accDescr {a  \u2028 b}
"A":1
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 18,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `pie
accDescr: a  \u2028 b
"A":1
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `pie
accDescr {a  \u2028 b}
"A":1
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/pie/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/pie-no-duplicate-description/invalid/pie/description-equal-predecessor-crlf-input.mmd",
        code: `pie\r
accDescr: A\r
accDescr: A\r
accDescr: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `pie\r
accDescr: A\r
accDescr: A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
