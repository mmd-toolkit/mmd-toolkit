/** The rule on its document examples, fixture files, and escaped whitespace. */
import { RuleTester } from "eslint"
import { packetNoDuplicateTitle } from "../../src/rules/packet-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("packet-no-duplicate-title", packetNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "packet-no-duplicate-title",
  packetNoDuplicateTitle,
  {
    valid: [
      {
        name: "valid/packet/titles-line-separators-content",
        filename: "titles-line-separators-content.mmd",
        code: `packet
title A\u2028title B
title A\u2028title B
accTitle: C\u2029accTitle: D
accTitle: C\u2029accTitle: D
`,
      },
    ],
    invalid: [
      {
        name: "invalid/packet/titles-lone-cr",
        filename: "titles-lone-cr.mmd",
        code: `packet\rtitle First\rtitle Second\raccTitle: First\raccTitle: Second\r`,
        errors: [
          {
            messageId: "duplicate",
            data: { kind: "title", statement: "title" },
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 13,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `packet\rtitle First\raccTitle: First\raccTitle: Second\r`,
              },
              {
                desc: "Remove the earlier statement that sets the title.",
                output: `packet\rtitle Second\raccTitle: First\raccTitle: Second\r`,
              },
            ],
          },
          {
            messageId: "duplicate",
            data: {
              kind: "accessible title",
              statement: "accTitle",
            },
            line: 5,
            column: 1,
            endLine: 5,
            endColumn: 17,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `packet\rtitle First\rtitle Second\raccTitle: First\r`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `packet\rtitle First\rtitle Second\raccTitle: Second\r`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/packet/title-crlf",
        filename:
          "tests/fixtures/rules/packet-no-duplicate-title/invalid/packet/title-crlf-input.mmd",
        code: `packet\r
title First\r
%% comment\r
title Second\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `title`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 13,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `packet\r
title First\r
%% comment\r
`,
              },
              {
                desc: "Remove the earlier statement that sets the title.",
                output: `packet\r
%% comment\r
title Second\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/packet/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/packet-no-duplicate-title/invalid/packet/title-equal-predecessor-crlf-input.mmd",
        code: `packet\r
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
                output: `packet\r
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
