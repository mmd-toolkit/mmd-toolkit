import { RuleTester } from "eslint"
import { treeviewNoDuplicateTitle } from "../../src/rules/treeview-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("treeview-no-duplicate-title", treeviewNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "treeview-no-duplicate-title",
  treeviewNoDuplicateTitle,
  {
    valid: [
      {
        name: "valid/treeview/acc-title-same",
        filename: "acc-title-same.mmd",
        code: `treeView-beta
  accTitle: First
  accTitle:  First\u0020\u0020
  root/
`,
      },
      {
        name: "valid/treeview/acc-title-ps-same",
        filename: "acc-title-ps-same.mmd",
        code: `treeView-beta
accTitle: First\u2029Second
accTitle: First\u2029Second
root/
`,
      },
      {
        name: "valid/treeview/acc-title-tab-runs-equal",
        filename: "acc-title-tab-runs-equal.mmd",
        code: `treeView-beta
accTitle: First\t\treport
accTitle: First report
root/
`,
      },
    ],
    invalid: [
      {
        name: "invalid/treeview/acc-title-tab",
        filename: "acc-title-tab.mmd",
        code: `treeView-beta
  accTitle: First\treport
  accTitle: First report
  root/
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 25,
          },
        ],
      },
      {
        name: "invalid/treeview/acc-title-prefixed-tab",
        filename: "acc-title-prefixed-tab.mmd",
        code: `treeView-beta
└── accTitle: First\treport
└── accTitle: First    report
root/
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 30,
          },
        ],
      },
      {
        name: "invalid/treeview/acc-title-whitespace-clears",
        filename: "acc-title-whitespace-clears.mmd",
        code: `treeView-beta
accTitle: First
accTitle: \t\u0020
accTitle: Second
root/
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 13,
          },
        ],
      },
      {
        name: "invalid/treeview/acc-title-ls-ps-kept",
        filename: "acc-title-ls-ps-kept.mmd",
        code: `treeView-beta
accTitle: A\u2028B\u2029C
accTitle: A B C
root/
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 16,
          },
        ],
      },
      {
        name: "invalid/treeview/acc-title-lone-cr",
        filename: "acc-title-lone-cr.mmd",
        code: `treeView-beta\raccTitle: First\raccTitle: Second\rroot/\r`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 17,
          },
        ],
      },
    ],
  },
)
