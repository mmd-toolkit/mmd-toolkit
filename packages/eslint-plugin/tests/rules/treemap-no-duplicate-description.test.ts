/** The rule on its document examples and fixtures, with escaped whitespace. */
import { RuleTester } from "eslint"
import { treemapNoDuplicateDescription } from "../../src/rules/treemap-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("treemap-no-duplicate-description", treemapNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "treemap-no-duplicate-description",
  treemapNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/treemap/description-block-ls",
        filename: "description-block-ls.mmd",
        code: `treemap
accDescr { First \u2028 Second }
accDescr { First\u2028Second }
"A":1
`,
      },
      {
        name: "valid/treemap/description-block-ps",
        filename: "description-block-ps.mmd",
        code: `treemap
accDescr { First \u2029 Second }
accDescr { First\u2029Second }
"A":1
`,
      },
      {
        name: "valid/treemap/description-lone-cr",
        filename: "description-lone-cr.mmd",
        code: `treemap
accDescr { First\r  Second }
accDescr { First
Second }
"A":1
`,
      },
      {
        name: "valid/treemap/description-tab-runs",
        filename: "description-tab-runs.mmd",
        code: `treemap
accDescr: First\t\treport
accDescr: First report
"A":1
`,
      },
    ],
    invalid: [
      {
        name: "invalid/treemap/description-ls",
        filename: "description-ls.mmd",
        code: `treemap
accDescr {First\u2028report}
accDescr {First
report}
"A":10
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 4,
            endColumn: 8,
            data: { line: "2" },
          },
        ],
      },
      {
        name: "invalid/treemap/description-line-ls",
        filename: "description-line-ls.mmd",
        code: `treemap
accDescr: First\u2028 Second
accDescr { First\u2028 Second }
"A":1
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 27,
            data: { line: "2" },
          },
        ],
      },
      {
        name: "invalid/treemap/description-line-ps",
        filename: "description-line-ps.mmd",
        code: `treemap
accDescr: First\u2029 Second
accDescr { First\u2029 Second }
"A":1
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 27,
            data: { line: "2" },
          },
        ],
      },
      {
        name: "invalid/treemap/description-single-tab",
        filename: "description-single-tab.mmd",
        code: `treemap
accDescr: First\treport
accDescr: First report
"A":1
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 23,
            data: { line: "2" },
          },
        ],
      },
    ],
  },
)
