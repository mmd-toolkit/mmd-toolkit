/**
 * The rule `kanban-no-duplicate-section`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { kanbanNoDuplicateSection } from "../../src/rules/kanban-no-duplicate-section.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("kanban-no-duplicate-section", kanbanNoDuplicateSection)

new RuleTester(LANGUAGE_CONFIG).run(
  "kanban-no-duplicate-section",
  kanbanNoDuplicateSection,
  {
    valid: [
      {
        name: "section-after-comment-line-separator-and-space",
        filename: "input.mmd",
        code: `kanban
 S[x]%% c\u2028 S
   a
`,
      },
    ],
    invalid: [
      {
        name: "section-after-comment-line-separator",
        filename: "input.mmd",
        code: `kanban
 S[x]%% c\u2028S
   a
`,
        errors: [
          {
            message:
              "mermaid.js lists every item belonging to `S` under each section with this id.",
            line: 2,
            column: 11,
            endLine: 2,
            endColumn: 12,
          },
        ],
      },

      {
        name: "invalid/kanban/section-directive-comments-crlf",
        filename:
          "tests/fixtures/rules/kanban-no-duplicate-section/invalid/kanban/section-directive-comments-crlf-input.mmd",
        code: `kanban\r
  Todo\r
    docs\r
  %% note\r
  %%{init: {}}%%\r
  To%%{init: {}}%%do\r
`,
        errors: [
          {
            message:
              "mermaid.js lists every item belonging to `Todo` under each section with this id.",
            line: 6,
            column: 3,
            endLine: 6,
            endColumn: 21,
          },
        ],
      },
    ],
  },
)
