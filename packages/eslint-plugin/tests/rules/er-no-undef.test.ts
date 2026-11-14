/**
 * The rule `er-no-undef`, on the examples of its document, on the inputs of its
 * fixture directory, and on names that go on across a comment region, whose
 * U+2028 is written as an escape.
 */
import { RuleTester } from "eslint"
import { erNoUndef } from "../../src/rules/er-no-undef.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("er-no-undef", erNoUndef)

new RuleTester(LANGUAGE_CONFIG).run("er-no-undef", erNoUndef, {
  valid: [
    {
      name: "valid/er/entity-name-comment-region-style-plain-name",
      filename: "entity-name-comment-region-style-plain-name.mmd",
      code: `erDiagram
  A\u2028%% c
Bar
  style A\u2028Bar fill:#f00
`,
    },

    {
      name: "valid/er/entity-plain-name-style-comment-region",
      filename: "entity-plain-name-style-comment-region.mmd",
      code: `erDiagram
  A\u2028Bar
  style A\u2028%% c
Bar fill:#f00
`,
    },
  ],
  invalid: [
    {
      name: "invalid/er/style-name-comment-region-is-longer-than-entity",
      filename: "style-name-comment-region-is-longer-than-entity.mmd",
      code: `erDiagram
  A
  style A\u2028%% c
B fill:#f00
`,
      errors: [
        {
          message:
            "mermaid.js does nothing with `A\u2028B` in this `style` statement: no entity and no subgraph of the diagram has this name.",
          line: 3,
          column: 9,
          endLine: 4,
          endColumn: 2,
        },
      ],
    },

    {
      name: "invalid/er/class-list-name-comment-region",
      filename: "class-list-name-comment-region.mmd",
      code: `erDiagram
  A\u2028%% c
Bar
  class A\u2028%% c
Bar,Q c1
`,
      errors: [
        {
          message:
            "mermaid.js does nothing with `Q` in this `class` statement: no entity and no subgraph of the diagram has this name.",
          line: 5,
          column: 5,
          endLine: 5,
          endColumn: 6,
        },
      ],
    },
  ],
})
