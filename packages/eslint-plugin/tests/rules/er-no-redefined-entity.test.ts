/**
 * The rule `er-no-redefined-entity`, on the examples of its document, on the
 * inputs of its fixture directory, and on names that go on across a comment
 * region, whose U+2028 is written as an escape.
 */
import { RuleTester } from "eslint"
import { erNoRedefinedEntity } from "../../src/rules/er-no-redefined-entity.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("er-no-redefined-entity", erNoRedefinedEntity)

new RuleTester(LANGUAGE_CONFIG).run(
  "er-no-redefined-entity",
  erNoRedefinedEntity,
  {
    valid: [
      {
        name: "valid/er/name-comment-region-same-alias",
        filename: "name-comment-region-same-alias.mmd",
        code: `erDiagram
  A\u2028%% c
Bar["x"]
  A\u2028Bar["x"]
`,
      },

      {
        name: "valid/er/name-comment-region-is-another-entity",
        filename: "name-comment-region-is-another-entity.mmd",
        code: `erDiagram
  A\u2028%% c
Bar["x"]
  A["y"]
`,
      },
    ],
    invalid: [
      {
        name: "invalid/er/name-comment-region-then-plain-name",
        filename: "name-comment-region-then-plain-name.mmd",
        code: `erDiagram
  A\u2028%% c
Bar["x"]
  A\u2028Bar["y"]
`,
        errors: [
          {
            message:
              "mermaid.js keeps the first alias `x` of the entity `A\u2028Bar` and ignores this alias.",
            line: 4,
            column: 3,
            endLine: 4,
            endColumn: 13,
          },
        ],
      },

      {
        name: "invalid/er/name-comment-region-with-directive-then-plain-name",
        filename: "name-comment-region-with-directive-then-plain-name.mmd",
        code: `erDiagram
A\u2028%%{init: {}}%% %% c
Bar["x"]
A\u2028Bar["y"]
`,
        errors: [
          {
            message:
              "mermaid.js keeps the first alias `x` of the entity `A\u2028Bar` and ignores this alias.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 11,
          },
        ],
      },
    ],
  },
)
