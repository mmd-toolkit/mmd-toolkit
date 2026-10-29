/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { radarNoDuplicateTitle } from "../../src/rules/radar-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("radar-no-duplicate-title", radarNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "radar-no-duplicate-title",
  radarNoDuplicateTitle,
  {
    valid: [
      {
        name: "valid/radar/title-tab-runs",
        filename: "title-tab-runs.mmd",
        code: `radar-beta
title First\t\treport
title First report
`,
      },
      {
        name: "valid/radar/title-nbsp-ends",
        filename: "title-nbsp-ends.mmd",
        code: `radar-beta
title \u00a0First\u00a0
title First
`,
      },

      {
        name: "valid/radar/title-crlf-equivalent",
        filename:
          "tests/fixtures/rules/radar-no-duplicate-title/valid/radar/title-crlf-equivalent-input.mmd",
        code: `radar-beta\r
title First  report\r
title First report\r
`,
      },
    ],
    invalid: [
      {
        name: "invalid/radar/title-single-tab",
        filename: "title-single-tab.mmd",
        code: `radar-beta
title First\treport
title First report
`,
        errors: [
          {
            messageId: "duplicate",
            data: { kind: "title", statement: "title" },
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 19,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `radar-beta
title First\treport
`,
              },
              {
                desc: "Remove the earlier statement that sets the title.",
                output: `radar-beta
title First report
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/radar/title-ls-content",
        filename: "title-ls-content.mmd",
        code: `radar-beta
title First\u2028 Second
title First\u2028Second
`,
        errors: [
          {
            messageId: "duplicate",
            data: { kind: "title", statement: "title" },
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 19,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `radar-beta
title First\u2028 Second
`,
              },
              {
                desc: "Remove the earlier statement that sets the title.",
                output: `radar-beta
title First\u2028Second
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/radar/acctitle-ps-content",
        filename: "acctitle-ps-content.mmd",
        code: `radar-beta
accTitle: First\u2029 Second
accTitle: First\u2029Second
`,
        errors: [
          {
            messageId: "duplicate",
            data: {
              kind: "accessible title",
              statement: "accTitle",
            },
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 23,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `radar-beta
accTitle: First\u2029 Second
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `radar-beta
accTitle: First\u2029Second
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/radar/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/radar-no-duplicate-title/invalid/radar/title-equal-predecessor-crlf-input.mmd",
        code: `radar-beta\r
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
                output: `radar-beta\r
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
