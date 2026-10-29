/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { treemapNoDuplicateTitle } from "../../src/rules/treemap-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("treemap-no-duplicate-title", treemapNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "treemap-no-duplicate-title",
  treemapNoDuplicateTitle,
  {
    valid: [
      {
        name: "valid/treemap/title-tab-runs",
        filename: "title-tab-runs.mmd",
        code: `treemap
title First\t\treport
title First report
"A":1
`,
      },
      {
        name: "valid/treemap/title-nbsp-ends",
        filename: "title-nbsp-ends.mmd",
        code: `treemap
title \u00a0First\u00a0
title First
"A":1
`,
      },
    ],
    invalid: [
      {
        name: "invalid/treemap/title-single-tab",
        filename: "title-single-tab.mmd",
        code: `treemap
title First\treport
title First report
"A":1
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 19,
            data: { kind: "title", statement: "title" },
          },
        ],
      },
      {
        name: "invalid/treemap/title-ls-content",
        filename: "title-ls-content.mmd",
        code: `treemap
title First\u2028 Second
title First\u2028Second
"A":1
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 19,
            data: { kind: "title", statement: "title" },
          },
        ],
      },
      {
        name: "invalid/treemap/acctitle-ps-content",
        filename: "acctitle-ps-content.mmd",
        code: `treemap
accTitle: First\u2029 Second
accTitle: First\u2029Second
"A":1
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 23,
            data: {
              kind: "accessible title",
              statement: "accTitle",
            },
          },
        ],
      },
    ],
  },
)
