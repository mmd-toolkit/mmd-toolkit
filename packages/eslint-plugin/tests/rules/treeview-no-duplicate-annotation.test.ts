import { RuleTester } from "eslint"
import { treeviewNoDuplicateAnnotation } from "../../src/rules/treeview-no-duplicate-annotation.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("treeview-no-duplicate-annotation", treeviewNoDuplicateAnnotation)

new RuleTester(LANGUAGE_CONFIG).run(
  "treeview-no-duplicate-annotation",
  treeviewNoDuplicateAnnotation,
  {
    valid: [
      {
        name: "valid/treeview/node-desc-same",
        filename: "node-desc-same.mmd",
        code: `treeView-beta
  file ## First
  ##  First\u0020
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
              "mermaid.js replaces the class given earlier for this node with this class.",
            line: 7,
            column: 32,
            endLine: 7,
            endColumn: 39,
            suggestions: [
              {
                desc: "Remove this annotation.",
                output: `treeView-beta
title  Tree 
accTitle:  Access 
accDescr: Line 
accDescr {  Block
  text  }
root/ :::first icon(pack:file) icon() ##  detail  
  "child/ "
''
`,
              },
              {
                desc: "Remove the earlier annotation.",
                output: `treeView-beta
title  Tree 
accTitle:  Access 
accDescr: Line 
accDescr {  Block
  text  }
root/ icon(pack:file) :::last icon() ##  detail  
  "child/ "
''
`,
              },
            ],
          },
          {
            message:
              "mermaid.js replaces the earlier icon setting for this node with this icon setting.",
            line: 7,
            column: 40,
            endLine: 7,
            endColumn: 46,
            suggestions: [
              {
                desc: "Remove this annotation.",
                output: `treeView-beta
title  Tree 
accTitle:  Access 
accDescr: Line 
accDescr {  Block
  text  }
root/ :::first icon(pack:file) :::last ##  detail  
  "child/ "
''
`,
              },
              {
                desc: "Remove the earlier annotation.",
                output: `treeView-beta
title  Tree 
accTitle:  Access 
accDescr: Line 
accDescr {  Block
  text  }
root/ :::first :::last icon() ##  detail  
  "child/ "
''
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/node-desc-prefixed-tab",
        filename: "node-desc-prefixed-tab.mmd",
        code: `treeView-beta
└── file ## a\tb
└── ## a    b
`,
        errors: [
          {
            message:
              "mermaid.js replaces the description given earlier for this node with this description.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this annotation.",
                output: `treeView-beta
└── file ## a\tb
`,
              },
              {
                desc: "Remove the earlier annotation.",
                output: `treeView-beta
└── file
└── ## a    b
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/node-desc-ls-ps-kept",
        filename: "node-desc-ls-ps-kept.mmd",
        code: `treeView-beta
file ## A\u2028B\u2029C
 ## A B C
`,
        errors: [
          {
            message:
              "mermaid.js replaces the description given earlier for this node with this description.",
            line: 3,
            column: 2,
            endLine: 3,
            endColumn: 10,
            suggestions: [
              {
                desc: "Remove this annotation.",
                output: `treeView-beta
file ## A\u2028B\u2029C
`,
              },
              {
                desc: "Remove the earlier annotation.",
                output: `treeView-beta
file
 ## A B C
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/node-desc-whitespace-clears",
        filename: "node-desc-whitespace-clears.mmd",
        code: `treeView-beta
file ## First
 ## \t\u0020
 ## Second
`,
        errors: [
          {
            message:
              "mermaid.js replaces the description given earlier for this node with this description.",
            line: 3,
            column: 2,
            endLine: 3,
            endColumn: 7,
            suggestions: [
              {
                desc: "Remove this annotation.",
                output: `treeView-beta
file ## First
 ## Second
`,
              },
              {
                desc: "Remove the earlier annotation.",
                output: `treeView-beta
file
 ## \t 
 ## Second
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/treeview/annotations-lone-cr",
        filename: "annotations-lone-cr.mmd",
        code: `treeView-beta\rfile :::first\r :::second\r`,
        errors: [
          {
            message:
              "mermaid.js replaces the class given earlier for this node with this class.",
            line: 3,
            column: 2,
            endLine: 3,
            endColumn: 11,
            suggestions: [
              {
                desc: "Remove this annotation.",
                output: `treeView-beta\rfile :::first\r`,
              },
              {
                desc: "Remove the earlier annotation.",
                output: `treeView-beta\rfile\r :::second\r`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/treeview/annotations-crlf",
        filename:
          "tests/fixtures/rules/treeview-no-duplicate-annotation/invalid/treeview/annotations-crlf-input.mmd",
        code: `treeView-beta\r
  file :::highlight :::muted\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the class given earlier for this node with this class.",
            line: 2,
            column: 21,
            endLine: 2,
            endColumn: 29,
            suggestions: [
              {
                desc: "Remove this annotation.",
                output: `treeView-beta\r
  file :::highlight\r
`,
              },
              {
                desc: "Remove the earlier annotation.",
                output: `treeView-beta\r
  file :::muted\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
