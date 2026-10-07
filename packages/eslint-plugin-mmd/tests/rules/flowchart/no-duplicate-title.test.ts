/**
 * The rule `flowchart/no-duplicate-title`, on the examples of its document and on the
 * fixtures that record what mermaid.js does with `accTitle` statements.
 */
import { noDuplicateTitle } from "../../../src/rules/flowchart/no-duplicate-title.ts"
import { testRule } from "../../rule-test.ts"

testRule("flowchart/no-duplicate-title", noDuplicateTitle, {
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
          inputs: ["docs/rules/flowchart/no-duplicate-title.md incorrect 1"],
        },
        {
          case: "three statements: the second and the third are reported",
          reports: true,
          inputs: ["invalid/flowchart/db-duplicate-title-three-titles"],
        },
        {
          case: "a description stands between the statements",
          reports: true,
          inputs: ["invalid/flowchart/db-duplicate-title-titles-around-a-description"],
        },
        {
          case: "one statement",
          reports: false,
          inputs: [
            "docs/rules/flowchart/no-duplicate-title.md correct 1",
            "valid/flowchart/db-acc-title-alone",
          ],
        },
        {
          case: "a title and a description",
          reports: false,
          inputs: ["valid/flowchart/db-duplicate-description-title-and-description"],
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
          inputs: ["docs/rules/flowchart/no-duplicate-title.md incorrect 1"],
        },
        {
          case: "the header `graph`, a `flowchart-v2` diagram",
          reports: true,
          inputs: ["invalid/header-graph"],
        },
        {
          case: "the header `flowchart-elk`",
          reports: true,
          inputs: ["invalid/header-flowchart-elk"],
        },
        {
          case: "the header `swimlane-beta`, a `swimlane` diagram",
          reports: true,
          inputs: ["invalid/header-swimlane-beta"],
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
        "`accTitle:` with no text sets the title too: at the end of the text it makes the title empty, and before more text it takes the next line that holds text as the title, past empty lines, comment lines, and directives. Either way, a title written before it is lost.",
      cases: [
        {
          case: "`accTitle:` with no text, at the end of the text",
          reports: true,
          inputs: [
            "docs/rules/flowchart/no-duplicate-title.md incorrect 2",
            "invalid/flowchart/db-acc-title-empty-replaces",
          ],
        },
        {
          case: "`accTitle:` with no text, and a line break after it, at the end of the text",
          reports: true,
          inputs: ["invalid/empty-title-before-final-line-break"],
        },
        {
          case: "`accTitle:` with no text, before another line: the line is the title",
          reports: true,
          inputs: ["invalid/empty-title-takes-next-line"],
        },
        {
          case: "an empty line, a comment line, or a directive stands before the line that holds the text",
          reports: true,
          inputs: [
            "invalid/empty-title-takes-text-past-an-empty-line",
            "invalid/empty-title-takes-text-past-a-comment-line",
            "invalid/empty-title-takes-text-past-a-directive",
          ],
        },
        {
          case: "`accTitle:` with no text, before another line, and no title before it",
          reports: false,
          inputs: ["valid/flowchart/db-duplicate-title-line-without-text-takes-next-line"],
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
            "docs/rules/flowchart/no-duplicate-title.md incorrect 3",
          ],
        },
        {
          case: "one in each of two subgraphs",
          reports: true,
          inputs: ["invalid/flowchart/db-duplicate-title-two-subgraphs"],
        },
        {
          case: "one in a nested subgraph, then one in its parent",
          reports: true,
          inputs: ["invalid/nested-subgraphs"],
        },
        {
          case: "one statement in a subgraph",
          reports: false,
          inputs: ["valid/flowchart/db-duplicate-title-title-in-subgraph-alone"],
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
            "invalid/empty-title-before-final-line-break",
          ],
        },
        {
          case: "a comment line, an empty line, a directive, or a `;` between the statements",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/db-duplicate-title-comment-line-between",
            "invalid/empty-line-between",
            "invalid/directive-between",
            "invalid/semicolon-statement-between",
          ],
        },
        {
          case: "the lines end with CRLF",
          reports: true,
          suggests: true,
          inputs: ["invalid/crlf"],
        },
        {
          case: "the statements stand in subgraphs",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/db-duplicate-title-inner-after-outer",
            "invalid/flowchart/db-duplicate-title-two-subgraphs",
            "invalid/nested-subgraphs",
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
          written: [
            {
              name: "line-separator-in-title",
              code: "flowchart LR\n  A\n  accTitle: a\u2028b\n  accTitle: c\n",
            },
          ],
        },
        {
          case: "a line separator in a title: one statement",
          reports: false,
          inputs: [],
          written: [
            {
              name: "line-separator-then-accTitle",
              code: "flowchart LR\n  A\n  accTitle: a\u2028accTitle: b\n",
            },
          ],
        },
      ],
    },
    {
      sentence: "mermaid.js uses the last title that remains.",
      cases: [
        {
          case: "a `;` after the title text is part of the title: one statement",
          reports: false,
          inputs: ["valid/flowchart/db-duplicate-title-semicolon-is-part-of-the-title"],
        },
        {
          case: "a directive inside the title text: one statement",
          reports: false,
          inputs: ["valid/directive-inside-title-text"],
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
            "invalid/nested-subgraphs",
            "invalid/flowchart/db-acc-title-outer-replaces-subgraph",
          ],
        },
      ],
    },
    {
      sentence:
        "A `;` after the statement stays where it separates statements; a `;` that mermaid.js ignores by the rule of [`style` and `classDef` lines](../../../../spec/docs/common.md#style-and-classdef-lines) in the specification, as in `accTitle: style:#b;`, is removed with the statement.",
      cases: [
        {
          case: "a `;` on its own line between the statements stays",
          reports: true,
          suggests: true,
          inputs: ["invalid/semicolon-statement-between"],
        },
        {
          case: "a `;` that ends the text is removed with the statement",
          reports: true,
          suggests: true,
          inputs: ["invalid/semicolon-ignored-at-end-of-text"],
        },
      ],
    },
  ],
})
