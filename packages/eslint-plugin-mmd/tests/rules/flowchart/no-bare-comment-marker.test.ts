/**
 * The rule `flowchart/no-bare-comment-marker`, on the examples of its document
 * and on the fixtures that record what mermaid.js does with a line that holds
 * only `%%`.
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
      sentence:
        "A comment is a `%%` with only whitespace and directives before it on its line, whose first character after it that is not part of a directive is neither `{` nor part of a line terminator.",
      cases: [
        {
          case: "text follows the `%%`, or a space: a comment",
          reports: false,
          inputs: [
            "valid/common/comment-bare-with-space",
            "valid/common/comment-bare-between-comment-lines-space",
          ],
        },
        {
          case: "a directive follows the `%%`, then a line terminator: not a comment",
          reports: true,
          inputs: ["invalid/flowchart/comment-percent-before-directive"],
        },
        {
          case: "a `{` follows the `%`, and no directive: not a comment, and no line holding only `%`",
          reports: false,
          inputs: ["valid/flowchart/gram-percent-token-diamond-vertex"],
        },
        {
          case: "a U+2028 follows the `%%`: it is no line terminator, so the line is a comment",
          reports: false,
          inputs: [],
          corpus: ["flowchart/comment-bare-then-u2028-and-vertex"],
        },
        {
          case: "a line terminator follows the `%%`: not a comment",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-two-vertex-lines",
            "invalid/common/comment-bare",
          ],
        },
      ],
    },
    {
      sentence: "This rule reports a line that holds only `%%`.",
      cases: [
        {
          case: "a vertex line between statements, at the top level and in a subgraph",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-two-vertex-lines",
            "invalid/flowchart/gram-bare-comment-marker-vertex-line-in-subgraph",
            "invalid/common/comment-bare",
            "invalid/flowchart/gram-bare-comment-marker-empty-description-block-before-vertex-line",
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
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-vertex-line-crlf",
          ],
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
          case: "a U+2028 follows the `%%`: it is no line terminator, so the line is a comment",
          reports: false,
          inputs: [],
          corpus: ["flowchart/comment-bare-then-u2028-and-vertex"],
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
          inputs: ["invalid/flowchart/gram-bare-comment-marker-header-graph"],
        },
        {
          case: "the header `flowchart-elk`",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-header-flowchart-elk",
          ],
        },
        {
          case: "the header `swimlane-beta`, a `swimlane` diagram",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-header-swimlane-beta",
          ],
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
            "invalid/flowchart/gram-bare-comment-marker-label-crlf-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-label-cr-marker-line",
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
            "invalid/flowchart/gram-link-text-takes-bare-marker-line",
          ],
          rejected: ["flowchart/gram-link-text-open-line-break"],
        },
        {
          case: "the label of a subgraph",
          reports: true,
          inputs: ["invalid/flowchart/lex-percent-line-in-subgraph-title"],
        },
        {
          case: "a description block",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-description-block-line",
          ],
        },
        {
          case: "the line after `accTitle:`",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-acc-title-next-line",
            "invalid/flowchart/lex-acc-title-bare-marker-next-line",
          ],
        },
        {
          case: "the line after `accDescr:`",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-acc-descr-next-line",
          ],
        },
        {
          case: "the tooltip of `click`",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-click-tooltip-line",
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
          inputs: [
            "valid/flowchart/gram-bare-comment-marker-description-block-comment-line",
          ],
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
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-data-block-string-line",
          ],
        },
        {
          case: "an indented block of text",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-data-block-block-text-line",
          ],
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
          inputs: [
            "valid/flowchart/gram-bare-comment-marker-data-block-comment-line",
          ],
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
            "invalid/flowchart/gram-bare-comment-marker-click-callback-name-line",
            "invalid/flowchart/gram-bare-comment-marker-click-name-line-then-statement",
            "invalid/flowchart/gram-bare-comment-marker-click-name-line-then-indented-line",
            "invalid/flowchart/gram-click-takes-bare-marker-line",
          ],
          recorded: ["flowchart/db-click-without-target-takes-next-line"],
          rejected: ["flowchart/gram-click-without-target-at-end"],
        },
        {
          case: "after `click A call`, in the name",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-click-call-name-line",
            "invalid/flowchart/gram-bare-comment-marker-click-call-name-line-first",
            "invalid/flowchart/gram-bare-comment-marker-click-call-name-only-marker-line",
          ],
        },
        {
          case: "in the arguments of the call",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-click-call-arguments-line",
            "invalid/flowchart/gram-bare-comment-marker-click-call-arguments-only-marker-line",
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
          inputs: [
            "valid/flowchart/gram-bare-comment-marker-unclosed-description-block-line",
          ],
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
          inputs: [
            "valid/flowchart/gram-bare-comment-marker-percent-brace-that-is-no-directive",
            "valid/flowchart/gram-percent-token-diamond-vertex",
          ],
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
            "invalid/flowchart/gram-bare-comment-marker-two-vertex-lines",
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
            "invalid/flowchart/gram-bare-comment-marker-vertex-line-crlf",
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
          results: {
            "invalid/flowchart/gram-bare-marker-vertex-after-semicolon":
              "flowchart/gram-vertex-semicolon-indented",
          },
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
          rejected: ["flowchart/gram-link-without-end-at-end-of-text"],
        },
        {
          case: "the `%%` ends a link, a vertex follows",
          reports: true,
          suggests: false,
          inputs: ["invalid/flowchart/gram-bare-marker-link-end-then-vertex"],
          recorded: ["flowchart/gram-link-end-on-next-line-indented"],
        },
        {
          case: "the `%%` is the start of a link",
          reports: true,
          suggests: false,
          inputs: ["invalid/flowchart/gram-bare-marker-link-start"],
          rejected: ["flowchart/gram-link-without-start"],
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
            "invalid/flowchart/gram-bare-comment-marker-description-block-line",
            "invalid/flowchart/gram-bare-comment-marker-click-tooltip-line",
            "invalid/flowchart/gram-bare-comment-marker-dash-link-text-line",
            "invalid/flowchart/lex-percent-line-in-subgraph-title",
          ],
        },
        {
          case: "a directive on the line before",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-string-directive-on-line-before-marker",
          ],
        },
        {
          case: "a whole directive on the line, before the `%%`",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-string-directive-before-marker-on-line",
          ],
        },
        {
          case: "the end of a directive on the line",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-string-directive-ends-on-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-tooltip-directive-ends-on-marker-line",
          ],
        },
        {
          case: "the start of a directive on the line",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-string-directive-starts-on-marker-line",
          ],
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
            "invalid/flowchart/gram-bare-comment-marker-two-lines-in-label",
            "invalid/flowchart/gram-bare-comment-marker-two-lines-in-description-block",
            "invalid/flowchart/div-bare-comment-marker-two-lines-in-data-block",
            "invalid/flowchart/gram-bare-comment-marker-two-lines-in-data-block-string",
          ],
        },
        {
          case: "several lines in the name or in the arguments of a call",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-two-lines-in-call-name",
            "invalid/flowchart/gram-bare-comment-marker-two-lines-in-call-arguments",
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
            "invalid/flowchart/gram-bare-comment-marker-data-block-string-line",
            "invalid/flowchart/gram-bare-comment-marker-data-block-string-only-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-click-call-name-line",
          ],
        },
        {
          case: "the value holds only the line, in a label, a string label, a link, a subgraph title, a description block, or a tooltip",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-label-only-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-string-label-only-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-link-text-only-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-subgraph-title-only-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-description-block-only-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-tooltip-only-marker-line",
            "invalid/flowchart/gram-link-text-takes-bare-marker-line",
          ],
          recorded: [
            "flowchart/db-subgraph-title-bare-marker-line",
            "flowchart/db-subgraph-title-empty-lines",
            "flowchart/db-click-tooltip-bare-marker-line",
            "flowchart/db-click-tooltip-empty-lines",
          ],
        },
        {
          case: "the value holds only the line, in a call: the name, the arguments",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-click-call-name-only-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-click-call-arguments-only-marker-line",
          ],
        },
        {
          case: "the value holds only the line, in a data block",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/flowchart/div-bare-comment-marker-data-block-only-marker-line",
          ],
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
            "invalid/flowchart/gram-bare-comment-marker-acc-title-line-then-statement",
            "invalid/flowchart/gram-bare-comment-marker-acc-descr-line-then-statement",
            "invalid/flowchart/gram-bare-comment-marker-click-name-line-then-statement",
          ],
        },
        {
          case: "the line is all of the value, and the line ends the text",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-acc-title-next-line",
            "invalid/flowchart/gram-bare-comment-marker-acc-descr-next-line",
            "invalid/flowchart/gram-click-takes-bare-marker-line",
          ],
        },
        {
          case: "an empty line, a comment line, or a directive stands between `accTitle:` and the line",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-acc-title-value-after-an-empty-line",
            "invalid/flowchart/gram-bare-comment-marker-acc-title-value-after-a-comment-line",
            "invalid/flowchart/gram-bare-comment-marker-acc-title-value-after-a-directive",
          ],
        },
        {
          case: "two lines: the first is the value, the second is a vertex line",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-acc-title-line-then-vertex-line",
            "invalid/flowchart/gram-bare-comment-marker-click-name-line-then-vertex-line",
          ],
        },
      ],
    },
    {
      sentence:
        "Flowchart reads the `%%` of such a line as a vertex with the id `%%`, so the diagram gets a box that the author did not write.",
      cases: [
        {
          case: "a vertex line: the message says that the line becomes a vertex",
          reports: true,
          messageHas: "as a vertex with the id `%%`",
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-two-vertex-lines",
            "invalid/flowchart/gram-bare-comment-marker-vertex-line-in-subgraph",
          ],
        },
      ],
    },
    {
      sentence: "The rule reports these lines too.",
      cases: [
        {
          case: "a line that goes into the name or the arguments of a `click` call",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-click-call-name-line",
            "invalid/flowchart/gram-bare-comment-marker-click-call-arguments-line",
          ],
        },
      ],
    },
    {
      sentence:
        "Each suggestion removes only the line that its report marks: mermaid.js then makes no vertex from that line, and the text or the data block no longer holds it.",
      cases: [
        {
          case: "several lines of only `%%`: each report has its own suggestion",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-two-vertex-lines",
            "invalid/flowchart/gram-bare-comment-marker-two-lines-in-label",
            "invalid/flowchart/gram-bare-comment-marker-two-lines-in-description-block",
            "invalid/flowchart/gram-bare-comment-marker-two-lines-in-call-name",
          ],
        },
      ],
    },
    {
      sentence:
        "A data block, or a link text between `--` and `-->`, would be left empty, which mermaid.js rejects, and a description block would be left empty, which [no-empty-description-block](./no-empty-description-block.md) reports.",
      cases: [
        {
          case: "the line is all of a data block, of a link text, or of a description block: no suggestion",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/flowchart/div-bare-comment-marker-data-block-only-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-link-text-only-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-description-block-only-marker-line",
          ],
        },
      ],
    },
    {
      sentence:
        "In a label, a string, the title of a subgraph, a tooltip, or the arguments of a function, the result is the value that the line as a comment gives; the rule keeps one condition for every place rather than a list of places.",
      cases: [
        {
          case: "the line is all of the value in each of these places: no suggestion",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-label-only-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-string-label-only-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-subgraph-title-only-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-tooltip-only-marker-line",
            "invalid/flowchart/gram-bare-comment-marker-click-call-arguments-only-marker-line",
          ],
          recorded: [
            "flowchart/db-subgraph-title-bare-marker-line",
            "flowchart/db-subgraph-title-empty-lines",
            "flowchart/db-click-tooltip-bare-marker-line",
            "flowchart/db-click-tooltip-empty-lines",
          ],
        },
      ],
    },
    {
      sentence:
        "Adding a space after the `%%` is not suggested: an editor that removes whitespace at the end of lines would undo it.",
      cases: [
        {
          case: "the only suggestion removes the line or the `%%`",
          reports: true,
          offers: ["removeMarker"],
          inputs: [
            "invalid/flowchart/gram-bare-comment-marker-two-vertex-lines",
          ],
        },
      ],
    },
  ],
  notBehavior: [
    "It is not shown as a code block below",
    "Where the line is all of the value, what removing it gives depends on the place.",
  ],
})
