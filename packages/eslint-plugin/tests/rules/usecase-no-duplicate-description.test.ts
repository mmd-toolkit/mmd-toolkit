/** The rule `usecase-no-duplicate-description`, on its document examples and fixture inputs. */
import { RuleTester } from "eslint"
import { usecaseNoDuplicateDescription } from "../../src/rules/usecase-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("usecase-no-duplicate-description", usecaseNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "usecase-no-duplicate-description",
  usecaseNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/usecase/description-trim-both-nbsp",
        filename: "description-trim-both-nbsp.mmd",
        code: `usecase-beta
accDescr: \u00a0First\u00a0
accDescr {\u00a0First\u00a0}
`,
      },
      {
        name: "valid/usecase/description-cr-indent",
        filename: "description-cr-indent.mmd",
        code: `usecase-beta\raccDescr {First\rSecond}\raccDescr { \r  First\r\tSecond\r}\r`,
      },
      {
        name: "valid/usecase/description-nbsp-after-lf",
        filename: "description-nbsp-after-lf.mmd",
        code: `usecase-beta
accDescr {First
Second}
accDescr {First
\u00a0Second}
`,
      },

      {
        name: "valid/usecase/description-block-crlf",
        filename:
          "tests/fixtures/rules/usecase-no-duplicate-description/valid/usecase/description-block-crlf-input.mmd",
        code: `usecase-beta
accDescr {First\r
Second}\r
accDescr {First
Second}
`,
      },
      {
        name: "valid/usecase/description-crlf-indent",
        filename:
          "tests/fixtures/rules/usecase-no-duplicate-description/valid/usecase/description-crlf-indent-input.mmd",
        code: `usecase-beta\r
accDescr {First\r
Second}\r
accDescr { \r
  First\r
\tSecond\r
}\r
`,
      },
    ],
    invalid: [
      {
        name: "invalid/usecase/description-ls-content-no-indent-trim",
        filename: "description-ls-content-no-indent-trim.mmd",
        code: `usecase-beta
accDescr: First\u2028 Second
accDescr: First\u2028Second
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 23,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `usecase-beta
accDescr: First\u2028 Second
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `usecase-beta
accDescr: First\u2028Second
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/usecase/description-ps-content-no-indent-trim",
        filename: "description-ps-content-no-indent-trim.mmd",
        code: `usecase-beta
accDescr {First\u2029 Second}
accDescr {First\u2029Second}
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 24,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `usecase-beta
accDescr {First\u2029 Second}
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `usecase-beta
accDescr {First\u2029Second}
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/usecase/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/usecase-no-duplicate-description/invalid/usecase/description-equal-predecessor-crlf-input.mmd",
        code: `usecase-beta\r
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
                output: `usecase-beta\r
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
