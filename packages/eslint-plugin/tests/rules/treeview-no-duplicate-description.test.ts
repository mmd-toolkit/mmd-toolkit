import { RuleTester } from "eslint"
import { treeviewNoDuplicateDescription } from "../../src/rules/treeview-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("treeview-no-duplicate-description", treeviewNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "treeview-no-duplicate-description",
  treeviewNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/treeview/desc-ls-equal",
        filename: "desc-ls-equal.mmd",
        code: `treeView-beta
accDescr { First\u2028  Second }
accDescr { First\u2028Second }
root/
`,
      },
      {
        name: "valid/treeview/desc-ps-equal",
        filename: "desc-ps-equal.mmd",
        code: `treeView-beta
accDescr { First\u2029  Second }
accDescr { First\u2029Second }
root/
`,
      },
      {
        name: "valid/treeview/desc-line-forms-equal",
        filename: "desc-line-forms-equal.mmd",
        code: `treeView-beta
accDescr: First
accDescr:  First\u0020\u0020
root/
`,
      },
      {
        name: "valid/treeview/desc-lone-cr-crlf-lf-equal",
        filename: "desc-lone-cr-crlf-lf-equal.mmd",
        code: `treeView-beta
accDescr {First\r  Second}
accDescr {First\r
Second}
accDescr {First
Second}
root/
`,
      },
    ],
    invalid: [
      {
        name: "invalid/treeview/corpus-gram-written-tree",
        filename: "corpus-gram-written-tree.mmd",
        code: `treeView-beta
title  Tree\u0020
accTitle:  Access\u0020
accDescr: Line\u0020
accDescr {  Block
  text  }
root/ :::first icon(pack:file) :::last icon() ##  detail\u0020\u0020
  "child/ "
''
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 5,
            column: 1,
            endLine: 6,
            endColumn: 10,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `treeView-beta
title  Tree\u0020
accTitle:  Access\u0020
accDescr: Line\u0020
root/ :::first icon(pack:file) :::last icon() ##  detail \u0020
  "child/ "
''
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `treeView-beta
title  Tree\u0020
accTitle:  Access\u0020
accDescr {  Block
  text  }
root/ :::first icon(pack:file) :::last icon() ##  detail \u0020
  "child/ "
''
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/desc-line-ls-distinct",
        filename: "desc-line-ls-distinct.mmd",
        code: `treeView-beta
accDescr: First\u2028  Second
accDescr {First\u2028Second}
root/
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 24,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `treeView-beta
accDescr: First\u2028  Second
root/
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `treeView-beta
accDescr {First\u2028Second}
root/
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/desc-prefixed-tab",
        filename: "desc-prefixed-tab.mmd",
        code: `treeView-beta
└── accDescr: First\treport
└── accDescr: First    report
root/
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 30,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `treeView-beta
└── accDescr: First\treport
root/
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `treeView-beta
└── accDescr: First    report
root/
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/desc-whitespace-line-resets",
        filename: "desc-whitespace-line-resets.mmd",
        code: `treeView-beta
accDescr: First
accDescr: \t\u0020
accDescr: Second
root/
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 13,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `treeView-beta
accDescr: First
accDescr: Second
root/
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `treeView-beta
accDescr: \t\u0020
accDescr: Second
root/
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/desc-line-ps-distinct",
        filename: "desc-line-ps-distinct.mmd",
        code: `treeView-beta
accDescr: First\u2029  Second
accDescr {First\u2029Second}
root/
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 24,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `treeView-beta
accDescr: First\u2029  Second
root/
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `treeView-beta
accDescr {First\u2029Second}
root/
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/treeview/desc-crlf",
        filename:
          "tests/fixtures/rules/treeview-no-duplicate-description/invalid/treeview/desc-crlf-input.mmd",
        code: `treeView-beta\r
accDescr: First\r
accDescr { Second }\r
root/\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 20,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `treeView-beta\r
accDescr: First\r
root/\r
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `treeView-beta\r
accDescr { Second }\r
root/\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/treeview-no-duplicate-description/invalid/treeview/description-equal-predecessor-crlf-input.mmd",
        code: `treeView-beta\r
accDescr: A\r
accDescr: A\r
accDescr: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `treeView-beta\r
accDescr: A\r
accDescr: A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
