/**
 * The rule `flowchart/no-bare-comment-marker`, on the examples of its document and on the
 * fixtures that record what mermaid.js does with a line that holds only `%%`.
 */
import { noBareCommentMarker } from "../../../src/rules/flowchart/no-bare-comment-marker.ts"
import { testRule } from "../../rule-test.ts"

testRule("flowchart/no-bare-comment-marker", noBareCommentMarker, {
  claims: {
    removeMarker: { kind: "removesVertexOfLine", id: "%%" },
    removeTextLine: { kind: "removesBareMarkerLine" },
    removeDataLine: { kind: "removesBareMarkerLine" },
    removeCallbackLine: { kind: "removesBareMarkerLine" },
  },
  sentences: [
    {
      sentence: "This rule reports a line that holds only `%%`.",
      cases: [
        {
          case: "a vertex line between statements, at the top level and in a subgraph",
          reports: true,
          inputs: [
            "invalid/two-vertex-lines",
            "invalid/flowchart/gram-bare-comment-marker-vertex-line-in-subgraph",
            "invalid/common/comment-bare",
          ],
        },
        {
          case: "the line is indented",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-vertex-line-indented",
          ],
        },
        {
          case: "the line is the last, without a line break",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-vertex-line-at-end-without-line-break",
          ],
        },
        {
          case: "the line ends with CRLF",
          reports: true,
          inputs: ["invalid/vertex-line-crlf"],
        },
        {
          case: "between comment lines",
          reports: true,
          inputs: ["invalid/common/comment-bare-between-comment-lines"],
        },
        {
          case: "the line holds `%%` and a space",
          reports: false,
          inputs: ["valid/common/comment-bare-with-space"],
        },
        {
          case: "between comment lines, the line is empty or holds a space",
          reports: false,
          inputs: [
            "valid/common/comment-bare-between-comment-lines-empty",
            "valid/common/comment-bare-between-comment-lines-space",
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
            "docs/rules/flowchart/no-bare-comment-marker.md incorrect 1",
          ],
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
        "A directive after the `%%` on the line, as in `%%%%{init: {}}%%`, changes nothing.",
      cases: [
        {
          case: "a directive follows the `%%`",
          reports: true,
          inputs: ["invalid/flowchart/comment-percent-before-directive"],
        },
      ],
    },
    {
      sentence:
        "The same happens inside a text that spans lines: the label of a vertex, a link, or a subgraph, also when the label is a string; a description block; a title or a description written on the line after `accTitle:` or `accDescr:`; and a string such as the tooltip of `click`.",
      cases: [
        {
          case: "the label of a vertex",
          reports: true,
          inputs: [
            "invalid/common/comment-bare-line-in-label",
            "invalid/flowchart/gram-bare-comment-marker-label-indented-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-label-tab-marker-line",
          ],
        },
        {
          case: "the label of a vertex, with CRLF or CR",
          reports: true,
          inputs: [
            "invalid/label-crlf-marker-line",
            "invalid/label-cr-marker-line",
          ],
        },
        {
          case: "the label of a vertex, a blank line next to the line",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-label-blank-line-after-marker",
            "invalid/flowchart/gram-bare-comment-marker-label-blank-line-before-marker",
          ],
        },
        {
          case: "the label of a vertex, a string",
          reports: true,
          inputs: ["invalid/common/comment-bare-line-in-string-label"],
        },
        {
          case: "the label of a link",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-dash-link-text-line",
            "invalid/flowchart/lex-percent-line-in-edge-label",
          ],
        },
        {
          case: "the label of a subgraph",
          reports: true,
          inputs: ["invalid/flowchart/lex-percent-line-in-subgraph-title"],
        },
        {
          case: "a description block",
          reports: true,
          inputs: ["invalid/description-block-line"],
        },
        {
          case: "the line after `accTitle:`",
          reports: true,
          inputs: [
            "invalid/acc-title-next-line",
            "invalid/flowchart/lex-acc-title-bare-marker-next-line",
          ],
        },
        {
          case: "the line after `accDescr:`",
          reports: true,
          inputs: ["invalid/acc-descr-next-line"],
        },
        {
          case: "the tooltip of `click`",
          reports: true,
          inputs: [
            "invalid/click-tooltip-line",
            "invalid/flowchart/lex-tooltip-bare-marker-line",
          ],
        },
      ],
    },
    {
      sentence:
        "mermaid.js removes the other comment lines from the text, but a line with `%%` alone stays in it",
      cases: [
        {
          case: "a comment line stands next to the line, in a label or in a string label",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/tokens-comment-region-after-bare-marker-line",
            "invalid/flowchart/tokens-comment-region-then-bare-marker-line",
            "invalid/flowchart/tokens-comment-region-then-bare-marker-line-in-string",
            "invalid/flowchart/lex-acc-descr-block-bare-marker-line-after-comment-line",
          ],
        },
        {
          case: "a comment line stands in the text, with text after `%%`",
          reports: false,
          inputs: [
            "valid/flowchart/gram-bare-comment-marker-label-marker-then-text",
          ],
        },
        {
          case: "a comment line stands in a description block, between lines of text",
          reports: false,
          inputs: ["valid/description-block-comment-line"],
        },
        {
          case: "a line starts with `%%;`",
          reports: false,
          inputs: [
            "valid/flowchart/gram-bare-comment-marker-label-marker-with-semicolon",
          ],
        },
      ],
    },
    {
      sentence:
        'Inside the data block of a vertex, the line is part of the data: where the data reads it as text, as in a quoted string such as `label: "…"` or in an indented block of text, the text keeps it, and elsewhere, as in `A@{`, `%%`, `shape: circle`, and `}`, it makes the data invalid, and mermaid.js rejects the diagram',
      cases: [
        {
          case: "a quoted string",
          reports: true,
          inputs: ["invalid/data-block-string-line"],
        },
        {
          case: "an indented block of text",
          reports: true,
          inputs: ["invalid/data-block-block-text-line"],
        },
        {
          case: "elsewhere in the data block",
          reports: true,
          inputs: [
            "invalid/flowchart/div-data-block-bare-marker-line",
            "docs/rules/flowchart/no-bare-comment-marker.md incorrect 3",
          ],
        },
        {
          case: "a comment line in the data block",
          reports: false,
          inputs: ["valid/data-block-comment-line"],
        },
        {
          case: "a data block without the line",
          reports: false,
          inputs: [
            "valid/flowchart/gram-data-block-shape-on-own-line",
            "docs/rules/flowchart/no-bare-comment-marker.md correct 2",
          ],
        },
      ],
    },
    {
      sentence:
        "In a `click` statement that calls a function, the line goes into the name of the function or into its arguments: after `click A`, a line with `%%` alone before the name is read as the name, and the name after it becomes a new vertex; after `click A call f(1,`, the arguments that mermaid.js passes to the function keep the line.",
      cases: [
        {
          case: "after `click A`, before the name",
          reports: true,
          inputs: [
            "invalid/click-callback-name-line",
            "invalid/click-name-line-then-statement",
            "invalid/click-name-line-then-indented-line",
            "invalid/click-name-line-at-end",
          ],
        },
        {
          case: "after `click A call`, in the name",
          reports: true,
          inputs: [
            "invalid/click-call-name-line",
            "invalid/click-call-name-line-first",
            "invalid/click-call-name-only-marker-line",
          ],
        },
        {
          case: "in the arguments of the call",
          reports: true,
          inputs: [
            "invalid/click-call-arguments-line",
            "invalid/click-call-arguments-only-marker-line",
          ],
        },
      ],
    },
    {
      sentence:
        "In a description block that is not closed, the line is not reported",
      cases: [
        {
          case: "the block has no `}`",
          reports: false,
          inputs: ["valid/unclosed-description-block-line"],
        },
      ],
    },
    {
      sentence:
        "A line with a space after the `%%` is a comment and is not reported.",
      cases: [
        {
          case: "at the top level, between comment lines, and in a label",
          reports: false,
          inputs: [
            "valid/common/comment-bare-with-space",
            "valid/common/comment-bare-between-comment-lines-space",
            "valid/common/comment-percent-space-line-in-label",
          ],
        },
      ],
    },
    {
      sentence:
        'A line that starts with `%%{` and is no directive, as `%%{"x"}`, is not a comment either: mermaid.js reads it as a vertex `%%` of the shape `{}`. The rule does not report it',
      cases: [
        {
          case: "`%%{` and no directive",
          reports: false,
          inputs: ["valid/percent-brace-that-is-no-directive"],
        },
      ],
    },
    {
      sentence:
        "Where the vertex `%%` is the whole statement, the rule suggests removing the `%%`, with its line when only whitespace is left on it; a directive on the line stays.",
      cases: [
        {
          case: "a line of its own, at the top level or in a subgraph",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/two-vertex-lines",
            "invalid/flowchart/gram-bare-comment-marker-vertex-line-in-subgraph",
            "invalid/flowchart/gram-bare-comment-marker-vertex-line-indented",
          ],
        },
        {
          case: "the last line, or a line that ends with CRLF",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-vertex-line-at-end-without-line-break",
            "invalid/vertex-line-crlf",
          ],
        },
        {
          case: "a directive follows the `%%`",
          reports: true,
          suggests: true,
          inputs: ["invalid/flowchart/comment-percent-before-directive"],
        },
        {
          case: "the vertex follows a `;`",
          reports: true,
          suggests: true,
          inputs: ["invalid/flowchart/gram-bare-marker-vertex-after-semicolon"],
        },
      ],
    },
    {
      sentence:
        "Where the `%%` is the end of a link, it suggests nothing: removing it leaves `A -->` or `--> B` without its end, which mermaid.js rejects, or, with a vertex on the line after it, makes the link go to that vertex.",
      cases: [
        {
          case: "the `%%` ends a link, nothing follows",
          reports: true,
          suggests: false,
          inputs: ["invalid/flowchart/gram-bare-marker-link-end"],
        },
        {
          case: "the `%%` ends a link, a vertex follows",
          reports: true,
          suggests: false,
          inputs: ["invalid/flowchart/gram-bare-marker-link-end-then-vertex"],
        },
        {
          case: "the `%%` is the start of a link",
          reports: true,
          suggests: false,
          inputs: ["invalid/flowchart/gram-bare-marker-link-start"],
        },
      ],
    },
    {
      sentence:
        "Inside a text that spans lines, it suggests removing the line of only `%%`, unless a directive, or the start or the end of one, is on that line: the line would take it with it.",
      cases: [
        {
          case: "no directive on the line, in a text of each kind",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/common/comment-bare-line-in-label",
            "invalid/description-block-line",
            "invalid/click-tooltip-line",
            "invalid/flowchart/gram-bare-comment-marker-dash-link-text-line",
            "invalid/flowchart/lex-percent-line-in-subgraph-title",
          ],
        },
        {
          case: "a directive on the line before",
          reports: true,
          suggests: true,
          inputs: ["invalid/string-directive-on-line-before-marker"],
        },
        {
          case: "a whole directive on the line, before the `%%`",
          reports: true,
          suggests: false,
          inputs: ["invalid/string-directive-before-marker-on-line"],
        },
        {
          case: "the end of a directive on the line",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/string-directive-ends-on-marker-line",
            "invalid/tooltip-directive-ends-on-marker-line",
          ],
        },
        {
          case: "the start of a directive on the line",
          reports: true,
          suggests: false,
          inputs: ["invalid/string-directive-starts-on-marker-line"],
        },
      ],
    },
    {
      sentence:
        "A value with several lines of only `%%` gets a report and a suggestion for each of them, and a data block that such lines made invalid is read once all of them are removed.",
      cases: [
        {
          case: "several lines in a label, a description block, a data block, a string of a data block",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/two-lines-in-label",
            "invalid/two-lines-in-description-block",
            "invalid/two-lines-in-data-block",
            "invalid/two-lines-in-data-block-string",
          ],
        },
        {
          case: "several lines in the name or in the arguments of a call",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/two-lines-in-call-name",
            "invalid/two-lines-in-call-arguments",
          ],
        },
      ],
    },
    {
      sentence:
        "A line of only `%%` gets this suggestion only when its value, the text, the name, or the data block, holds something besides lines of only `%%` and whitespace.",
      cases: [
        {
          case: "the value holds other text",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/common/comment-bare-line-in-label",
            "invalid/data-block-string-line",
            "invalid/data-block-string-only-marker-line",
            "invalid/click-call-name-line",
          ],
        },
        {
          case: "the value holds only the line, in a label, a string label, a link, a subgraph title, a description block, or a tooltip",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/label-only-marker-line",
            "invalid/string-label-only-marker-line",
            "invalid/link-text-only-marker-line",
            "invalid/subgraph-title-only-marker-line",
            "invalid/description-block-only-marker-line",
            "invalid/tooltip-only-marker-line",
          ],
        },
        {
          case: "the value holds only the line, in a call: the name, the arguments",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/click-call-name-only-marker-line",
            "invalid/click-call-arguments-only-marker-line",
          ],
        },
        {
          case: "the value holds only the line, in a data block",
          reports: true,
          suggests: false,
          inputs: ["invalid/data-block-only-marker-line"],
        },
      ],
    },
    {
      sentence:
        "After `accTitle:`, `accDescr:`, or `click A`, whose value is the next line that holds text, mermaid.js takes a later line as the value, so that `accTitle:`, `%%`, and `A` would have the title `A` and no vertex `A`; after `click A`, it may also reject the text, as where nothing follows.",
      cases: [
        {
          case: "`accTitle:`, `accDescr:`, `click A`: the line is all of the value, a statement follows",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/acc-title-line-then-statement",
            "invalid/acc-descr-line-then-statement",
            "invalid/click-name-line-then-statement",
          ],
        },
        {
          case: "the line is all of the value, and the line ends the text",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/acc-title-next-line",
            "invalid/acc-descr-next-line",
            "invalid/click-name-line-at-end",
          ],
        },
        {
          case: "an empty line, a comment line, or a directive stands between `accTitle:` and the line",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/acc-title-value-after-an-empty-line",
            "invalid/acc-title-value-after-a-comment-line",
            "invalid/acc-title-value-after-a-directive",
          ],
        },
        {
          case: "two lines: the first is the value, the second is a vertex line",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/acc-title-line-then-vertex-line",
            "invalid/click-name-line-then-vertex-line",
          ],
        },
      ],
    },
  ],
})
