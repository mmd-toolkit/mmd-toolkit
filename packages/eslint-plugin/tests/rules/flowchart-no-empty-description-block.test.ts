/**
 * The rule `flowchart-no-empty-description-block`, on the examples of its document and
 * on the inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { flowchartNoEmptyDescriptionBlock } from "../../src/rules/flowchart-no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "flowchart-no-empty-description-block",
  flowchartNoEmptyDescriptionBlock,
)

new RuleTester(LANGUAGE_CONFIG).run(
  "flowchart-no-empty-description-block",
  flowchartNoEmptyDescriptionBlock,
  {
    valid: [],
    invalid: [
      {
        name: "an empty description block after a line separator",
        filename: "input.mmd",
        code: `flowchart LR
subgraph S\u2028 accDescr {}
A
end
`,
        errors: [
          {
            message:
              "mermaid.js reads whitespace after the name `S` as part of the subgraph name, so the subgraph gets a generated id. This empty block sets no description.",
            line: 2,
            column: 13,
            endLine: 2,
            endColumn: 24,
            suggestions: [],
          },
        ],
      },
      {
        name: "an empty description block after a paragraph separator",
        filename: "input.mmd",
        code: `flowchart LR
subgraph S\u2029 accDescr {}
A
end
`,
        errors: [
          {
            message:
              "mermaid.js reads whitespace after the name `S` as part of the subgraph name, so the subgraph gets a generated id. This empty block sets no description.",
            line: 2,
            column: 13,
            endLine: 2,
            endColumn: 24,
            suggestions: [],
          },
        ],
      },
      {
        name: "an empty description block after a line separator and a comment line",
        filename: "input.mmd",
        code: `flowchart LR
subgraph S\u2028
%% c
 accDescr {}
A
end
`,
        errors: [
          {
            message:
              "mermaid.js reads whitespace after the name `S` as part of the subgraph name, so the subgraph gets a generated id. This empty block sets no description.",
            line: 4,
            column: 2,
            endLine: 4,
            endColumn: 13,
            suggestions: [],
          },
        ],
      },
      {
        name: "an empty description block after a paragraph separator and a comment line",
        filename: "input.mmd",
        code: `flowchart LR
subgraph S\u2029
%% c
 accDescr {}
A
end
`,
        errors: [
          {
            message:
              "mermaid.js reads whitespace after the name `S` as part of the subgraph name, so the subgraph gets a generated id. This empty block sets no description.",
            line: 4,
            column: 2,
            endLine: 4,
            endColumn: 13,
            suggestions: [],
          },
        ],
      },

      {
        name: "invalid/flowchart/gram-empty-description-block-block-cr",
        filename:
          "tests/fixtures/rules/flowchart-no-empty-description-block/invalid/flowchart/gram-empty-description-block-block-cr-input.mmd",
        code: `flowchart LR\r  A\r  accDescr {}\r`,
        errors: [
          {
            message:
              "mermaid.js takes no description from this empty `accDescr` block: the description stays as it was before it.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `flowchart LR\r  A\r`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/flowchart/gram-empty-description-block-block-with-crlf-lines",
        filename:
          "tests/fixtures/rules/flowchart-no-empty-description-block/invalid/flowchart/gram-empty-description-block-block-with-crlf-lines-input.mmd",
        code: `flowchart LR\r
  A\r
  accDescr {\r
  }\r
`,
        errors: [
          {
            message:
              "mermaid.js takes no description from this empty `accDescr` block: the description stays as it was before it.",
            line: 3,
            column: 3,
            endLine: 4,
            endColumn: 4,
            suggestions: [
              {
                desc: "Remove the empty block.",
                output: `flowchart LR\r
  A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
