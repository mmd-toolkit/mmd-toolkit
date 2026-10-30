/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { cynefinNoRedefinedDomain } from "../../src/rules/cynefin-no-redefined-domain.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("cynefin-no-redefined-domain", cynefinNoRedefinedDomain)

new RuleTester(LANGUAGE_CONFIG).run(
  "cynefin-no-redefined-domain",
  cynefinNoRedefinedDomain,
  {
    valid: [
      {
        name: "valid/cynefin/domain-lone-cr-equivalent",
        filename: "domain-lone-cr-equivalent.mmd",
        code: `cynefin-beta
complex "A\rB"
complex "A
B"`,
      },

      {
        name: "valid/cynefin/domain-line-ending-equivalent",
        filename:
          "tests/fixtures/rules/cynefin-no-redefined-domain/valid/cynefin/domain-line-ending-equivalent-input.mmd",
        code: `cynefin-beta
complex "A\r
B"
complex "A
B"`,
      },
    ],
    invalid: [
      {
        name: "invalid/cynefin/domain-crlf-comment-directive",
        filename:
          "tests/fixtures/rules/cynefin-no-redefined-domain/invalid/cynefin/domain-crlf-comment-directive-input.mmd",
        code: `cynefin-beta\r
complex "Old"\r
%% copied section\r
%%{init: {}}%%\r
\r
complex 'New'\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the items of the domain `complex`, set earlier, with those of this statement.",
            line: 6,
            column: 1,
            endLine: 6,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this domain statement.",
                output: `cynefin-beta\r
complex "Old"\r
%% copied section\r
%%{init: {}}%%\r
\r
`,
              },
              {
                desc: "Remove the earlier domain statement.",
                output: `cynefin-beta\r
%% copied section\r
%%{init: {}}%%\r
\r
complex 'New'\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
