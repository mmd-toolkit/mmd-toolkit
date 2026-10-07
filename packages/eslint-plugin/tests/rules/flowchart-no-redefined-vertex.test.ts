/**
 * The rule `flowchart-no-redefined-vertex`, on the examples of its document and
 * on the fixtures that record what mermaid.js does with a vertex written again.
 */
import { flowchartNoRedefinedVertex } from "../../src/rules/flowchart-no-redefined-vertex.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-redefined-vertex", flowchartNoRedefinedVertex, {
  sentences: [
    {
      sentence:
        "This rule reports a vertex written with a shape whose shape or label differs from the last shape written for the same vertex before it.",
      cases: [
        {
          case: "the label differs",
          reports: true,
          inputs: [
            "docs/rules/flowchart-no-redefined-vertex.md incorrect 1",
            "invalid/flowchart/db-vertex-label-redefined",
          ],
        },
        {
          case: "the shape differs, the label is the same",
          reports: true,
          inputs: ["invalid/flowchart/db-redefined-vertex-shape-differs"],
        },
        {
          case: "the shape and the label differ",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-shape-and-label-differ",
          ],
        },
        {
          case: "the properties and the label differ",
          reports: true,
          inputs: ["invalid/flowchart/db-props-merge"],
        },
        {
          case: "both writes are in one link",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-redefined-in-one-link",
          ],
        },
        {
          case: "a write without a shape stands between",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-redefined-after-a-write-without-shape",
            "invalid/flowchart/db-redefined-vertex-empty-description-block-between",
          ],
        },
        {
          case: "the first write is in a subgraph",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-redefined-after-subgraph",
          ],
        },
        {
          case: "only the properties differ",
          reports: false,
          inputs: ["valid/flowchart/db-redefined-vertex-property-only-differs"],
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
          inputs: ["docs/rules/flowchart-no-redefined-vertex.md incorrect 1"],
        },
        {
          case: "the header `graph`, a `flowchart-v2` diagram",
          reports: true,
          inputs: ["invalid/flowchart/db-redefined-vertex-header-graph"],
        },
        {
          case: "the header `flowchart-elk`",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-header-flowchart-elk",
          ],
        },
        {
          case: "the header `swimlane-beta`, a `swimlane` diagram",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-header-swimlane-beta",
          ],
        },
      ],
    },
    {
      sentence:
        "After `A[Start] --> B`, the line `C --> A[End]` gives the vertex `A` the label `End`, and the label `Start` is lost.",
      cases: [
        {
          case: "a later link writes the vertex with another label",
          reports: true,
          inputs: ["docs/rules/flowchart-no-redefined-vertex.md incorrect 1"],
        },
      ],
    },
    {
      sentence:
        "Writing the vertex again without a shape, as in `A --> C`, keeps its shape and label and is not reported, and neither is writing the shape and label that the vertex already has: after `A[x]` and `A[y]`, a third `A[y]` changes nothing and is not reported.",
      cases: [
        {
          case: "the vertex is written again without a shape",
          reports: false,
          inputs: [
            "docs/rules/flowchart-no-redefined-vertex.md correct 1",
            "valid/flowchart/db-vertex-label-kept-without-label",
          ],
        },
        {
          case: "the vertex is written again with the same shape and label",
          reports: false,
          inputs: [
            "docs/rules/flowchart-no-redefined-vertex.md correct 2",
            "valid/flowchart/db-vertex-label-redefined-same",
          ],
        },
        {
          case: "a third write equals the second: only the second is reported",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-third-write-equals-the-second",
          ],
        },
      ],
    },
    {
      sentence:
        "A shape or a label set by a data block, as in `A@{ shape: rect }`, is not compared, also where it stands between two shapes of the vertex.",
      cases: [
        {
          case: "a data block before, or after, a shape",
          reports: false,
          inputs: [
            "valid/flowchart/db-redefined-vertex-data-block-before",
            "valid/flowchart/db-redefined-vertex-data-block-label-after",
            "valid/flowchart/db-redefined-vertex-data-block-shape-after",
          ],
        },
        {
          case: "a data block between two shapes that differ",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-data-block-between-two-shapes",
          ],
        },
        {
          case: "a data block between two equal shapes",
          reports: false,
          inputs: [
            "valid/flowchart/db-redefined-vertex-data-block-between-equal-shapes",
          ],
        },
      ],
    },
    {
      sentence:
        'Labels are compared without the whitespace at their ends, which mermaid.js removes: `A["x"]` and then `A["x "]` is not reported.',
      cases: [
        {
          case: "whitespace at the end, or at the start, of a string",
          reports: false,
          inputs: [
            "valid/flowchart/db-redefined-vertex-label-differs-in-end-space",
            "valid/flowchart/db-redefined-vertex-label-differs-in-start-space",
            "valid/flowchart/db-vertex-label-string-trailing-space-redefined",
          ],
        },
        {
          case: "whitespace and a directive at the end",
          reports: false,
          inputs: [
            "valid/flowchart/db-redefined-vertex-label-with-a-directive-part-same",
          ],
        },
      ],
    },
    {
      sentence:
        "Apart from that whitespace, labels are compared as written: two labels that differ only in their line breaks (LF, CRLF, or CR) or in the quotes of an HTML attribute are reported, although mermaid.js keeps them the same.",
      cases: [
        {
          case: "whitespace inside the label",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-label-differs-inside",
          ],
        },
        {
          case: "a line break and a space",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-label-differs-by-a-line-break",
          ],
        },
        {
          case: "CRLF and LF",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-label-differs-by-crlf-and-lf",
            "invalid/flowchart/db-vertex-label-carriage-return-redefined",
          ],
        },
        {
          case: "CR and LF",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-label-differs-by-cr-and-lf",
            "invalid/flowchart/db-vertex-label-carriage-return-no-line-feed",
          ],
        },
        {
          case: "the quotes of an HTML attribute",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-label-differs-by-html-attribute-quotes",
          ],
          recorded: [
            "flowchart/db-vertex-label-attribute-quote-double",
            "flowchart/db-vertex-label-attribute-quote-single",
          ],
        },
        {
          case: "a directive inside the label that changes it",
          reports: true,
          inputs: [
            "invalid/flowchart/db-redefined-vertex-label-differs-by-a-directive-part",
          ],
        },
      ],
    },
    {
      sentence:
        "The kind of the label (text, string, or markdown string) is not compared",
      cases: [
        {
          case: "a text and a string, or a string and a markdown string",
          reports: false,
          inputs: [
            "valid/flowchart/db-redefined-vertex-text-and-string",
            "valid/flowchart/db-redefined-vertex-string-and-markdown-string",
          ],
        },
      ],
    },
  ],
})
