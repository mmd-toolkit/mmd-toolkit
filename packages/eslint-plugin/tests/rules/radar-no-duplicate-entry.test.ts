import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
/** The rule on its document examples and fixtures. */
import { radarNoDuplicateEntry } from "../../src/rules/radar-no-duplicate-entry.ts"
import { testRule } from "../rule-test.ts"

testRule("radar-no-duplicate-entry", radarNoDuplicateEntry)

new RuleTester(LANGUAGE_CONFIG).run(
  "radar-no-duplicate-entry",
  radarNoDuplicateEntry,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/radar/named-duplicate-crlf",
        filename:
          "tests/fixtures/rules/radar-no-duplicate-entry/invalid/radar/named-duplicate-crlf-input.mmd",
        code: `radar-beta\r
axis A, B, C\r
curve sales{A:1, B:2, C:3,\r
%% old\r
A %%{init: {}}%% 9}\r
`,
        errors: [
          {
            message:
              "mermaid.js uses the first value for axis `A` in this curve, and drops this value.",
            line: 5,
            column: 1,
            endLine: 5,
            endColumn: 19,
          },
        ],
      },
    ],
  },
)
