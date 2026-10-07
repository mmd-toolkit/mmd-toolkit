/**
 * The rule `flowchart-no-duplicate-description`, on the examples of its
 * document and on the fixtures that record what mermaid.js does with statements
 * that set the description.
 */
import { flowchartNoDuplicateDescription } from "../../src/rules/flowchart-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "flowchart-no-duplicate-description",
  flowchartNoDuplicateDescription,
  {
    claims: {
      // The last description is the one that mermaid.js uses.
      removePrevious: { kind: "keepsField", field: "accDescr" },
      removeThis: { kind: "usesLastRemaining", field: "accDescr" },
    },
    sentences: [
      {
        sentence:
          "This rule reports every statement that sets the description after the first one.",
        cases: [
          {
            case: "two `accDescr:` lines",
            reports: true,
            inputs: [
              "docs/rules/flowchart-no-duplicate-description.md incorrect 1",
            ],
          },
          {
            case: "three statements: the second and the third are reported",
            reports: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-three-descriptions",
            ],
          },
          {
            case: "one statement",
            reports: false,
            inputs: [
              "docs/rules/flowchart-no-duplicate-description.md correct 1",
              "valid/flowchart/db-acc-descr-line-alone",
              "valid/flowchart/db-duplicate-description-single-block",
              "valid/flowchart/db-subgraph-member-acc-descr-line",
            ],
          },
          {
            case: "a title and a description",
            reports: false,
            inputs: [
              "valid/flowchart/db-duplicate-description-title-and-description",
            ],
          },
        ],
      },
      {
        sentence:
          "It applies to `flowchart-v2`, `flowchart-elk`, and `swimlane`.",
        cases: [
          {
            case: "the header `flowchart`, a `flowchart-v2` diagram",
            reports: true,
            inputs: [
              "docs/rules/flowchart-no-duplicate-description.md incorrect 1",
            ],
          },
          {
            case: "the header `graph`, a `flowchart-v2` diagram",
            reports: true,
            inputs: ["invalid/flowchart/db-duplicate-description-header-graph"],
          },
          {
            case: "the header `flowchart-elk`",
            reports: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-header-flowchart-elk",
            ],
          },
          {
            case: "the header `swimlane-beta`, a `swimlane` diagram",
            reports: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-header-swimlane-beta",
            ],
          },
        ],
      },
      {
        sentence:
          "`accDescr:` sets the description. Without text, it sets the description too: at the end of the text it makes the description empty, and before more text it takes the next line that holds text as the description, past empty lines, comment lines, and directives.",
        cases: [
          {
            case: "`accDescr:` with text, twice",
            reports: true,
            inputs: ["invalid/flowchart/db-acc-descr-replaces"],
          },
          {
            case: "`accDescr:` without text, before another line: the line is the description",
            reports: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-empty-description-takes-next-line",
            ],
          },
          {
            case: "an empty line, a comment line, or a directive stands before the line that holds the text",
            reports: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-empty-description-takes-text-past-an-empty-line",
              "invalid/flowchart/db-duplicate-description-empty-description-takes-text-past-a-comment-line",
              "invalid/flowchart/db-duplicate-description-empty-description-takes-text-past-a-directive",
            ],
          },
          {
            case: "`accDescr:` without text, before another line, and no description before it",
            reports: false,
            inputs: [
              "valid/flowchart/db-duplicate-description-line-without-text-takes-next-line",
            ],
          },
          {
            case: "`accDescr:` without text, at the end of the text",
            reports: true,
            inputs: ["invalid/flowchart/db-acc-descr-empty-replaces"],
          },
          {
            case: "a block, then `accDescr:` without text, at the end of the text",
            reports: true,
            inputs: ["invalid/flowchart/db-acc-descr-block-then-empty-line"],
          },
        ],
      },
      {
        sentence: "A closed block that holds a description sets it as well.",
        cases: [
          {
            case: "two blocks, on one line each",
            reports: true,
            inputs: ["invalid/flowchart/db-duplicate-description-two-blocks"],
          },
          {
            case: "two blocks, on several lines",
            reports: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-multiline-blocks",
            ],
          },
          {
            case: "two blocks on one line",
            reports: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-blocks-on-one-line",
            ],
          },
        ],
      },
      {
        sentence:
          "The line form and the block form may be mixed: whichever comes first, the description written last is used.",
        cases: [
          {
            case: "a line, then a block",
            reports: true,
            inputs: ["invalid/flowchart/db-acc-descr-block-replaces"],
          },
          {
            case: "a block, then a line",
            reports: true,
            inputs: [
              "invalid/flowchart/db-acc-descr-line-replaces-block",
              "docs/rules/flowchart-no-duplicate-description.md incorrect 2",
            ],
          },
        ],
      },
      {
        sentence:
          "A statement inside a subgraph sets the description of the whole diagram and is counted too; mermaid.js also adds the value of such a statement to the members of the subgraph as an id, so that a vertex or a subgraph with that id belongs to the subgraph.",
        cases: [
          {
            case: "the outer statement first, then one in a subgraph",
            reports: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-inner-after-outer",
            ],
          },
          {
            case: "one in a subgraph first, then the outer statement",
            reports: true,
            inputs: [
              "invalid/flowchart/db-acc-descr-outer-replaces-subgraph",
              "docs/rules/flowchart-no-duplicate-description.md incorrect 3",
            ],
          },
          {
            case: "one in each of two subgraphs",
            reports: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-two-subgraphs",
            ],
          },
          {
            case: "two in a nested subgraph",
            reports: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-semicolon-after-block-in-subgraph",
              "invalid/flowchart/db-duplicate-description-semicolon-after-block-in-nested-subgraph",
              "invalid/flowchart/db-subgraph-member-acc-descr-block-semicolon-kept",
            ],
          },
        ],
      },
      {
        sentence:
          "A block that holds no description and a block that is not closed, which makes the description empty, are not counted",
        cases: [
          {
            case: "an empty block",
            reports: false,
            inputs: [
              "valid/flowchart/db-duplicate-description-empty-block-before-line",
              "valid/flowchart/db-acc-descr-empty-block-keeps",
            ],
          },
          {
            case: "an empty block that holds an empty line, a comment line, or a directive",
            reports: false,
            inputs: [
              "valid/flowchart/db-duplicate-description-empty-block-with-empty-line-after-line",
              "valid/flowchart/db-duplicate-description-comment-only-block-after-line",
              "valid/flowchart/db-duplicate-description-directive-only-block-after-line",
            ],
          },
          {
            case: "a block that is not closed",
            reports: false,
            inputs: [
              "valid/flowchart/db-duplicate-description-unclosed-block-after-line",
            ],
          },
        ],
      },
      {
        sentence:
          "For each report, the rule suggests removing one of two statements: the reported one, or the one before it that sets the description.",
        cases: [
          {
            case: "two lines, two blocks, a line and a block",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/db-acc-descr-replaces",
              "invalid/flowchart/db-duplicate-description-two-blocks",
              "invalid/flowchart/db-acc-descr-block-replaces",
              "invalid/flowchart/db-acc-descr-line-replaces-block",
            ],
          },
          {
            case: "a comment line, an empty line, a directive, or a `;` between the statements",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-comment-line-between",
              "invalid/flowchart/db-duplicate-description-empty-line-between",
              "invalid/flowchart/db-duplicate-description-directive-between",
              "invalid/flowchart/db-duplicate-description-semicolon-statement-between",
              "invalid/flowchart/db-duplicate-description-empty-description-block-between",
            ],
          },
          {
            case: "a `;` after a statement",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-semicolon-ends-line-description",
              "invalid/flowchart/db-duplicate-description-semicolon-after-block-in-subgraph",
            ],
          },
          {
            case: "the lines end with CRLF",
            reports: true,
            suggests: true,
            inputs: ["invalid/flowchart/db-duplicate-description-crlf"],
          },
          {
            case: "the statements stand in a subgraph",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-inner-after-outer",
              "invalid/flowchart/db-acc-descr-outer-replaces-subgraph",
            ],
          },
          {
            case: "a statement that makes the description empty",
            reports: true,
            suggests: true,
            inputs: ["invalid/flowchart/db-acc-descr-empty-replaces"],
          },
          {
            case: "title and description repeated",
            reports: true,
            suggests: true,
            inputs: ["invalid/flowchart/db-acc-repeated"],
          },
          {
            case: "a line separator in the text of a block",
            reports: true,
            suggests: true,
            inputs: [],
            corpus: [
              "flowchart/db-duplicate-description-line-separator-in-block-description",
            ],
          },
          {
            case: "a line separator in a line description: one statement",
            reports: false,
            inputs: [],
            corpus: [
              "flowchart/db-duplicate-description-line-separator-in-line-description",
            ],
          },
        ],
      },
      {
        sentence: "mermaid.js uses the last description that remains.",
        cases: [
          {
            case: "three statements: whichever statement is removed, the last that remains is used",
            reports: true,
            offers: ["removePrevious", "removeThis"],
            inputs: [
              "invalid/flowchart/db-duplicate-description-three-descriptions",
            ],
          },
          {
            case: "a directive, or a `;`, inside the text of a statement: one statement",
            reports: false,
            inputs: [
              "valid/flowchart/db-duplicate-description-directive-inside-description-text",
            ],
          },
        ],
      },
      {
        sentence:
          "Removing a statement inside a subgraph also removes that member, unless another statement of the subgraph makes the same id a member.",
        cases: [
          {
            case: "the reported statement or the one before it is in a subgraph",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-inner-after-outer",
              "invalid/flowchart/db-duplicate-description-two-subgraphs",
              "invalid/flowchart/db-acc-descr-outer-replaces-subgraph",
              "invalid/flowchart/db-duplicate-description-semicolon-after-block-in-nested-subgraph",
            ],
          },
        ],
      },
      {
        sentence:
          "A `;` after the statement stays where it separates statements; a `;` that mermaid.js ignores by the rule of [`style` and `classDef` lines](../../../spec/docs/common.md#style-and-classdef-lines) in the specification, as in `accDescr: style:#b;` and `accDescr { style:#b };`, is removed with the statement.",
        cases: [
          {
            case: "a `;` on its own line between the statements stays",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-semicolon-statement-between",
            ],
          },
          {
            case: "a `;` after a block stays",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-semicolon-after-block-in-subgraph",
            ],
          },
          {
            case: "a `;` that ends the text is removed with the statement",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-semicolon-ignored-at-end-of-text",
            ],
          },
          {
            case: "an ignored `;` after a block, in a subgraph, or after the previous statement is removed with the statement",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/db-duplicate-description-block-semicolon-ignored-at-end-of-text",
              "invalid/flowchart/db-subgraph-member-acc-descr-block-semicolon",
              "invalid/flowchart/db-duplicate-description-ignored-semicolon-in-subgraph",
              "invalid/flowchart/db-duplicate-description-ignored-semicolon-after-block-then-vertex",
              "invalid/flowchart/db-duplicate-description-ignored-semicolon-after-previous-block",
            ],
          },
          {
            case: "the lines end with a lone CR",
            reports: true,
            suggests: true,
            inputs: ["invalid/flowchart/db-duplicate-description-duplicate-cr"],
          },
        ],
      },
    ],
  },
)
