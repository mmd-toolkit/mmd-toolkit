import { RuleTester } from "eslint"
import { treeviewNoUnclosedDescriptionBlock } from "../../src/rules/treeview-no-unclosed-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "treeview-no-unclosed-description-block",
  treeviewNoUnclosedDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "treeview-no-unclosed-description-block",
  treeviewNoUnclosedDescriptionBlock,
  {
    valid: [
      {
        name: "valid/treeview/unclosed-ls-ps-gap-is-content",
        filename: "unclosed-ls-ps-gap-is-content.mmd",
        code: `treeView-beta
accDescr\u2028{ First
accDescr\u2029{ Second
`,
      },
    ],
    invalid: [
      {
        name: "invalid/treeview/unclosed-tab",
        filename: "unclosed-tab.mmd",
        code: `treeView-beta
  accDescr\t{ Project files
  root/
`,
        errors: [
          {
            message:
              "mermaid.js reads this unclosed `accDescr {` as a node name and sets no description from it.",
            line: 2,
            column: 3,
            endLine: 2,
            endColumn: 27,
          },
        ],
      },
      {
        name: "invalid/treeview/unclosed-lone-cr",
        filename: "unclosed-lone-cr.mmd",
        code: `treeView-beta\raccDescr { Project files\rroot/\r`,
        errors: [
          {
            message:
              "mermaid.js reads this unclosed `accDescr {` as a node name and sets no description from it.",
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 25,
          },
        ],
      },
    ],
  },
)
