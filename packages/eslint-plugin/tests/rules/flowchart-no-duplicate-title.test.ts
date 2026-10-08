/**
 * The rule `flowchart-no-duplicate-title`, on the examples of its document and
 * on the fixtures that record what mermaid.js does with `accTitle` statements.
 */
import { flowchartNoDuplicateTitle } from "../../src/rules/flowchart-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-duplicate-title", flowchartNoDuplicateTitle, {
  claims: {
    // The last title is the one that mermaid.js uses.
    removePrevious: { kind: "keepsField", field: "accTitle" },
    removeThis: { kind: "usesLastRemaining", field: "accTitle" },
  },
  sentences: [
    {
      sentence:
        "This rule reports every `accTitle` statement after the first one.",
      cases: [
        {
          case: "two statements",
          reports: true,
          inputs: ["docs/rules/flowchart-no-duplicate-title.md incorrect 1"],
        },
        {
          case: "three statements: the second and the third are reported",
          reports: true,
          inputs: ["invalid/flowchart/db-duplicate-title-three-titles"],
        },
        {
          case: "a description stands between the statements",
          reports: true,
          inputs: [
            "invalid/flowchart/db-duplicate-title-titles-around-a-description",
          ],
        },
        {
          case: "one statement",
          reports: false,
          inputs: [
            "docs/rules/flowchart-no-duplicate-title.md correct 1",
            "valid/flowchart/db-acc-title-alone",
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
          inputs: ["docs/rules/flowchart-no-duplicate-title.md incorrect 1"],
        },
        {
          case: "the header `graph`, a `flowchart-v2` diagram",
          reports: true,
          inputs: ["invalid/flowchart/db-duplicate-title-header-graph"],
        },
        {
          case: "the header `flowchart-elk`",
          reports: true,
          inputs: ["invalid/flowchart/db-duplicate-title-header-flowchart-elk"],
        },
        {
          case: "the header `swimlane-beta`, a `swimlane` diagram",
          reports: true,
          inputs: ["invalid/flowchart/db-duplicate-title-header-swimlane-beta"],
        },
      ],
    },
    {
      sentence:
        "After `accTitle: first` and `accTitle: second`, the title is `second`.",
      cases: [
        {
          case: "two titles",
          reports: true,
          inputs: ["invalid/flowchart/db-acc-title-replaces"],
        },
      ],
    },
    {
      sentence:
        "`accTitle:` with no text sets the title too: it takes the next line that holds text as the title, past empty lines, comment lines, and directives, and when no such line follows, it makes the title empty. Either way, a title written before it is lost.",
      cases: [
        {
          case: "`accTitle:` with no text, at the end of the text",
          reports: true,
          inputs: [
            "docs/rules/flowchart-no-duplicate-title.md incorrect 2",
            "invalid/flowchart/db-acc-title-empty-replaces",
          ],
        },
        {
          case: "`accTitle:` with no text, and a line break after it, at the end of the text",
          reports: true,
          inputs: [
            "invalid/flowchart/db-duplicate-title-empty-title-before-final-line-break",
          ],
        },
        {
          case: "`accTitle:` with no text, before another line: the line is the title",
          reports: true,
          inputs: [
            "invalid/flowchart/db-duplicate-title-empty-title-takes-next-line",
          ],
        },
        {
          case: "an empty line, a comment line, or a directive stands before the line that holds the text",
          reports: true,
          inputs: [
            "invalid/flowchart/db-duplicate-title-empty-title-takes-text-past-an-empty-line",
            "invalid/flowchart/db-duplicate-title-empty-title-takes-text-past-a-comment-line",
            "invalid/flowchart/db-duplicate-title-empty-title-takes-text-past-a-directive",
          ],
        },
        {
          case: "`accTitle:` with no text, before another line, and no title before it",
          reports: false,
          inputs: [
            "valid/flowchart/db-duplicate-title-line-without-text-takes-next-line",
            "valid/flowchart/db-acc-title-line-empty-then-comment-and-directive-lines",
          ],
        },
      ],
    },
    {
      sentence:
        "A statement inside a subgraph sets the title of the whole diagram and is counted too; mermaid.js also adds the value of such a statement to the members of the subgraph as an id, so that a vertex or a subgraph with that id belongs to the subgraph.",
      cases: [
        {
          case: "the outer statement first, then one in a subgraph",
          reports: true,
          inputs: ["invalid/flowchart/db-duplicate-title-inner-after-outer"],
        },
        {
          case: "one in a subgraph first, then the outer statement",
          reports: true,
          inputs: [
            "invalid/flowchart/db-acc-title-outer-replaces-subgraph",
            "docs/rules/flowchart-no-duplicate-title.md incorrect 3",
          ],
        },
        {
          case: "one in each of two subgraphs",
          reports: true,
          inputs: [
            "invalid/flowchart/db-duplicate-title-two-subgraphs",
            "invalid/flowchart/db-subgraph-member-before-title",
          ],
        },
        {
          case: "one in a nested subgraph, then one in its parent",
          reports: true,
          inputs: ["invalid/flowchart/db-duplicate-title-nested-subgraphs"],
        },
        {
          case: "one statement in a subgraph",
          reports: false,
          inputs: [
            "valid/flowchart/db-duplicate-title-title-in-subgraph-alone",
            "valid/flowchart/db-subgraph-without-acc-title-member",
            "valid/flowchart/db-subgraph-acc-title-member",
            "valid/flowchart/db-subgraph-member-acc-title-same-as-vertex",
            "valid/flowchart/db-subgraph-member-acc-title-names-subgraph",
          ],
        },
      ],
    },
    {
      sentence:
        "For each report, the rule suggests removing one of two statements: the reported one, or the `accTitle` statement before it.",
      cases: [
        {
          case: "two statements, three, an empty title",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/db-acc-title-replaces",
            "invalid/flowchart/db-duplicate-title-three-titles",
            "invalid/flowchart/db-acc-title-empty-replaces",
            "invalid/flowchart/db-duplicate-title-empty-title-before-final-line-break",
          ],
        },
        {
          case: "a comment line, an empty line, a directive, or a `;` between the statements",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/db-duplicate-title-comment-line-between",
            "invalid/flowchart/db-duplicate-title-empty-line-between",
            "invalid/flowchart/db-duplicate-title-directive-between",
            "invalid/flowchart/db-duplicate-title-semicolon-statement-between",
            "invalid/flowchart/db-duplicate-title-empty-description-block-between",
          ],
        },
        {
          case: "the lines end with CRLF",
          reports: true,
          suggests: true,
          inputs: ["invalid/flowchart/db-duplicate-title-crlf"],
        },
        {
          case: "the statements stand in subgraphs",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/db-duplicate-title-inner-after-outer",
            "invalid/flowchart/db-duplicate-title-two-subgraphs",
            "invalid/flowchart/db-duplicate-title-nested-subgraphs",
            "invalid/flowchart/db-acc-title-outer-replaces-subgraph",
          ],
        },
        {
          case: "titles and descriptions repeated",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/db-duplicate-title-titles-around-a-description",
            "invalid/flowchart/db-acc-repeated",
          ],
        },
        {
          case: "a line separator in the title that comes first",
          reports: true,
          suggests: true,
          inputs: [],
          corpus: ["flowchart/db-duplicate-title-line-separator-in-title"],
        },
        {
          case: "a line separator in a title: one statement",
          reports: false,
          inputs: [],
          corpus: [
            "flowchart/db-duplicate-title-line-separator-then-acc-title",
          ],
        },
      ],
    },
    {
      sentence: "mermaid.js uses the last title that remains.",
      cases: [
        {
          case: "three statements: whichever statement is removed, the last that remains is used",
          reports: true,
          offers: ["removePrevious", "removeThis"],
          inputs: ["invalid/flowchart/db-duplicate-title-three-titles"],
        },
        {
          case: "a directive, or a `;`, inside the text of a statement: one statement",
          reports: false,
          inputs: [
            "valid/flowchart/db-duplicate-title-semicolon-is-part-of-the-title",
            "valid/flowchart/db-duplicate-title-directive-inside-title-text",
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
            "invalid/flowchart/db-duplicate-title-inner-after-outer",
            "invalid/flowchart/db-duplicate-title-two-subgraphs",
            "invalid/flowchart/db-duplicate-title-nested-subgraphs",
            "invalid/flowchart/db-acc-title-outer-replaces-subgraph",
          ],
        },
      ],
    },
    {
      sentence:
        "A `;` after the statement stays where it separates statements; a `;` that mermaid.js ignores by the rule of [`style` and `classDef` lines](../../../spec/docs/common.md#style-and-classdef-lines) in the specification, as in `accTitle: style:#b;`, is removed with the statement.",
      cases: [
        {
          case: "a `;` on its own line between the statements stays",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/db-duplicate-title-semicolon-statement-between",
          ],
        },
        {
          case: "an ignored `;` is removed with the statement, wherever the statement stands and whatever follows",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/db-duplicate-title-semicolon-ignored-at-end-of-text",
            "invalid/flowchart/db-subgraph-acc-title-style-member",
            "invalid/flowchart/db-duplicate-title-ignored-semicolon-on-the-previous-statement",
            "invalid/flowchart/db-duplicate-title-ignored-semicolon-crlf",
            "invalid/flowchart/db-duplicate-title-ignored-semicolon-cr",
            "invalid/flowchart/db-duplicate-title-ignored-semicolon-then-comment-line",
            "invalid/flowchart/db-duplicate-title-ignored-semicolon-then-empty-line",
            "invalid/flowchart/db-duplicate-title-ignored-semicolon-then-directive",
            "invalid/flowchart/db-duplicate-title-ignored-semicolon-doubled",
            "invalid/flowchart/db-duplicate-title-ignored-semicolon-spaced",
          ],
          recorded: ["flowchart/db-subgraph-acc-title-then-semicolon-member"],
          corpus: [
            "flowchart/db-duplicate-title-ignored-semicolon-then-line-separator",
          ],
        },
        {
          case: "the lines end with a lone CR",
          reports: true,
          suggests: true,
          inputs: ["invalid/flowchart/db-duplicate-title-duplicate-cr"],
        },
      ],
    },
  ],
})
