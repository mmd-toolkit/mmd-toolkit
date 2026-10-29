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
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `treeView-beta
  accTitle: First\treport
  root/
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `treeView-beta
  accTitle: First report
  root/
`,
              },
            ],
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
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `treeView-beta
└── accTitle: First\treport
root/
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `treeView-beta
└── accTitle: First    report
root/
`,
              },
            ],
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
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `treeView-beta
accTitle: First
accTitle: Second
root/
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `treeView-beta
accTitle: \t\u0020
accTitle: Second
root/
`,
              },
            ],
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
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `treeView-beta
accTitle: A\u2028B\u2029C
root/
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `treeView-beta
accTitle: A B C
root/
`,
              },
            ],
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
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `treeView-beta\raccTitle: First\rroot/\r`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `treeView-beta\raccTitle: Second\rroot/\r`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/treeview/acc-title-crlf",
        filename:
          "tests/fixtures/rules/treeview-no-duplicate-title/invalid/treeview/acc-title-crlf-input.mmd",
        code: `treeView-beta\r
  accTitle: First\r
  accTitle: Second\r
  root/\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 19,
            suggestions: [
              {
                desc: "Remove this `accTitle` statement.",
                output: `treeView-beta\r
  accTitle: First\r
  root/\r
`,
              },
              {
                desc: "Remove the earlier `accTitle` statement.",
                output: `treeView-beta\r
  accTitle: Second\r
  root/\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/title-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/treeview-no-duplicate-title/invalid/treeview/title-equal-predecessor-crlf-input.mmd",
        code: `treeView-beta\r
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
                output: `treeView-beta\r
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
