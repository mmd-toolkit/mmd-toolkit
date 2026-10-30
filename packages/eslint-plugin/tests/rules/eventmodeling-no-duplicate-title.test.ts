/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { eventmodelingNoDuplicateTitle } from "../../src/rules/eventmodeling-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("eventmodeling-no-duplicate-title", eventmodelingNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "eventmodeling-no-duplicate-title",
  eventmodelingNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/eventmodeling/acc-title-single-tab-kept",
        filename: "acc-title-single-tab-kept.mmd",
        code: `eventmodeling accTitle: First\treport
tf 01 evt Bought accTitle: First report`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 2,
            column: 18,
            endLine: 2,
            endColumn: 40,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `eventmodeling accTitle: First\treport
tf 01 evt Bought`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `eventmodeling
tf 01 evt Bought accTitle: First report`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/eventmodeling/acc-title-lone-cr-change",
        filename: "acc-title-lone-cr-change.mmd",
        code: `eventmodeling accTitle: First\rtf 01 evt Bought accTitle: Second`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 2,
            column: 18,
            endLine: 2,
            endColumn: 34,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `eventmodeling accTitle: First\rtf 01 evt Bought`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `eventmodeling\rtf 01 evt Bought accTitle: Second`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/eventmodeling/acc-title-ls-ps-kept",
        filename: "acc-title-ls-ps-kept.mmd",
        code: `eventmodeling accTitle: A\u2028B\u2029C
tf 01 evt Bought accTitle: A B C`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 2,
            column: 18,
            endLine: 2,
            endColumn: 33,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `eventmodeling accTitle: A\u2028B\u2029C
tf 01 evt Bought`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `eventmodeling
tf 01 evt Bought accTitle: A B C`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/eventmodeling/acc-title-crlf-change",
        filename:
          "tests/fixtures/rules/eventmodeling-no-duplicate-title/invalid/eventmodeling/acc-title-crlf-change-input.mmd",
        code: `eventmodeling accTitle: First\r
tf 01 evt Bought accTitle: Second`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 2,
            column: 18,
            endLine: 2,
            endColumn: 34,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `eventmodeling accTitle: First\r
tf 01 evt Bought`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `eventmodeling\r
tf 01 evt Bought accTitle: Second`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/eventmodeling/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/eventmodeling-no-duplicate-title/invalid/eventmodeling/title-equal-predecessor-crlf-input.mmd",
        code: `eventmodeling accTitle: A\r
tf 01 evt Bought accTitle: A\r
tf 02 evt Sent accTitle: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 3,
            column: 16,
            endLine: 3,
            endColumn: 27,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `eventmodeling accTitle: A\r
tf 01 evt Bought accTitle: A\r
tf 02 evt Sent\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
