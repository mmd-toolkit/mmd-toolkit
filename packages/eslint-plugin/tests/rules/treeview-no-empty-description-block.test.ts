import { RuleTester } from "eslint"
import { treeviewNoEmptyDescriptionBlock } from "../../src/rules/treeview-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("treeview-no-empty-description-block", treeviewNoEmptyDescriptionBlock)

new RuleTester(LANGUAGE_CONFIG).run(
  "treeview-no-empty-description-block",
  treeviewNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/treeview/empty-whitespace-block",
        filename: "empty-whitespace-block.mmd",
        code: `treeView-beta
  accDescr {\u0020
 \t }
  root/
`,
        errors: [
          {
            message:
              "mermaid.js sets an empty description from this empty `accDescr` block, replacing any earlier description.",
            line: 2,
            column: 3,
            endLine: 3,
            endColumn: 5,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `treeView-beta
  root/
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/corpus-common-block-whitespace-raw",
        filename: "corpus-common-block-whitespace-raw.mmd",
        code: `treeView-beta
accDescr { \t\u0020
 \u00a0 }
node`,
        errors: [
          {
            message:
              "mermaid.js sets an empty description from this empty `accDescr` block, replacing any earlier description.",
            line: 2,
            column: 1,
            endLine: 3,
            endColumn: 5,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `treeView-beta
node`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/empty-line-separators",
        filename: "empty-line-separators.mmd",
        code: `treeView-beta
accDescr {\u2028\u2029}
root/
`,
        errors: [
          {
            message:
              "mermaid.js sets an empty description from this empty `accDescr` block, replacing any earlier description.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `treeView-beta
root/
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/empty-lone-cr",
        filename: "empty-lone-cr.mmd",
        code: `treeView-beta\raccDescr {\r}\rroot/\r`,
        errors: [
          {
            message:
              "mermaid.js sets an empty description from this empty `accDescr` block, replacing any earlier description.",
            line: 2,
            column: 1,
            endLine: 3,
            endColumn: 2,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `treeView-beta\rroot/\r`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/removal-crlf-with-tab",
        filename: "input.mmd",
        code: `treeView-beta\r
accDescr {\t}\r
`,
        errors: [
          {
            messageId: "empty",
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `treeView-beta\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
