/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { radarNoDuplicateDescription } from "../../src/rules/radar-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("radar-no-duplicate-description", radarNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "radar-no-duplicate-description",
  radarNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/radar/description-block-ps",
        filename: "description-block-ps.mmd",
        code: `radar-beta
accDescr { First\u2029 Second }
accDescr { First\u2029Second }
axis A, B, C
curve sales{1,2,3}
`,
      },
      {
        name: "valid/radar/description-block-ls",
        filename: "description-block-ls.mmd",
        code: `radar-beta
accDescr { First \u2028 Second }
accDescr { First\u2028Second }
`,
      },
      {
        name: "valid/radar/description-lone-cr",
        filename: "description-lone-cr.mmd",
        code: `radar-beta
accDescr { First\r  Second }
accDescr { First
Second }
`,
      },
      {
        name: "valid/radar/description-nbsp-indent",
        filename: "description-nbsp-indent.mmd",
        code: `radar-beta
accDescr { First
\u00a0Second }
accDescr { First
Second }
`,
      },
      {
        name: "valid/radar/description-tab-runs",
        filename: "description-tab-runs.mmd",
        code: `radar-beta
accDescr: First\t\treport
accDescr: First report
`,
      },

      {
        name: "valid/radar/description-crlf",
        filename:
          "tests/fixtures/rules/radar-no-duplicate-description/valid/radar/description-crlf-input.mmd",
        code: `radar-beta\r
accDescr {\r
 First\r
 Second\r
}\r
accDescr {\r
 First\r
 Second\r
}\r
axis A, B, C\r
curve sales{1,2,3}\r
`,
      },
    ],
    invalid: [
      {
        name: "invalid/radar/description-line-ls",
        filename: "description-line-ls.mmd",
        code: `radar-beta
accDescr: First\u2028 Second
accDescr { First\u2028 Second }
axis A, B, C
curve sales{1,2,3}
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 27,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `radar-beta
accDescr: First\u2028 Second
axis A, B, C
curve sales{1,2,3}
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `radar-beta
accDescr { First\u2028 Second }
axis A, B, C
curve sales{1,2,3}
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/radar/description-line-ps",
        filename: "description-line-ps.mmd",
        code: `radar-beta
accDescr: First\u2029 Second
accDescr { First\u2029 Second }
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 27,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `radar-beta
accDescr: First\u2029 Second
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `radar-beta
accDescr { First\u2029 Second }
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/radar/description-single-tab",
        filename: "description-single-tab.mmd",
        code: `radar-beta
accDescr: First\treport
accDescr: First report
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
                output: `radar-beta
accDescr: First\treport
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `radar-beta
accDescr: First report
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/radar/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/radar-no-duplicate-description/invalid/radar/description-equal-predecessor-crlf-input.mmd",
        code: `radar-beta\r
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
                output: `radar-beta\r
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
