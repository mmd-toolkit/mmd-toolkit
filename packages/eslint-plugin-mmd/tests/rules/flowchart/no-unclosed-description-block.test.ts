/**
 * The rule `flowchart/no-unclosed-description-block`, on the examples of its
 * document and on the fixtures that record what mermaid.js does with an
 * unclosed `accDescr {` block.
 */
import { noUnclosedDescriptionBlock } from "../../../src/rules/flowchart/no-unclosed-description-block.ts"
import { testRule } from "../../rule-test.ts"

testRule(
  "flowchart/no-unclosed-description-block",
  noUnclosedDescriptionBlock,
  {
    revealed: {
      kind: "rules",
      rules: {
        "flowchart/no-duplicate-description":
          "A description set before the block, which the closed block replaces.",
      },
    },
    claims: {
      closeAtLineEnd: { kind: "setsDescription", from: "restOfLine" },
      closeAtTextEnd: { kind: "setsDescription", from: "restOfText" },
    },
    sentences: [
      {
        sentence:
          "This rule reports an `accDescr {` block that is not closed by `}`.",
        cases: [
          {
            case: "text on the line of the `{`, and nothing after it",
            reports: true,
            inputs: [
              "docs/rules/flowchart/no-unclosed-description-block.md incorrect 1",
              "invalid/flowchart/lex-acc-descr-block-unclosed",
            ],
          },
          {
            case: "text on the line of the `{`, and lines after it",
            reports: true,
            inputs: [
              "docs/rules/flowchart/no-unclosed-description-block.md incorrect 2",
              "docs/rules/flowchart/no-unclosed-description-block.md incorrect 2",
              "invalid/flowchart/gram-unclosed-description-block-whitespace-after-the-text-on-the-brace-line",
            ],
          },
          {
            case: "a U+2028 in the text on the line of the `{`: it ends no line",
            reports: true,
            offers: ["closeAtLineEnd", "closeAtTextEnd"],
            inputs: [],
            corpus: [
              "flowchart/gram-unclosed-description-block-line-separator-in-text-on-brace-line",
            ],
          },
          {
            case: "text on a later line only",
            reports: true,
            inputs: [
              "invalid/flowchart/db-acc-descr-unclosed-text-next-line",
              "invalid/flowchart/gram-unclosed-description-block-text-with-a-blank-line",
              "invalid/flowchart/gram-unclosed-description-block-several-final-line-breaks",
              "invalid/flowchart/gram-unclosed-description-block-text-on-a-later-line-without-final-line-break",
            ],
          },
          {
            case: "nothing after the `{`, or only whitespace",
            reports: true,
            inputs: [
              "invalid/flowchart/lex-acc-descr-block-unclosed-empty",
              "invalid/flowchart/gram-unclosed-description-block-only-whitespace-after-the-brace",
            ],
          },
          {
            case: "the block follows a statement on its line, or is indented with a tab",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-after-a-statement-on-the-same-line",
              "invalid/flowchart/gram-unclosed-description-block-tab-indented",
              "invalid/flowchart/gram-unclosed-description-block-unclosed-after-empty-block",
            ],
          },
          {
            case: "the lines end with CRLF",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-crlf-lines",
            ],
          },
          {
            case: "`%` and a comment after the `{`",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-comment-mark-after-the-brace",
            ],
          },
          {
            case: "a directive on the line of the `{`",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-only-directive-on-brace-line",
              "invalid/flowchart/gram-unclosed-description-block-directive-spans-lines-on-brace-line",
            ],
          },
          {
            case: "a closed block",
            reports: false,
            inputs: [
              "docs/rules/flowchart/no-unclosed-description-block.md correct 1",
              "docs/rules/flowchart/no-unclosed-description-block.md correct 2",
              "valid/flowchart/db-acc-descr-block-alone",
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
              "docs/rules/flowchart/no-unclosed-description-block.md incorrect 1",
            ],
          },
          {
            case: "the header `graph`, a `flowchart-v2` diagram",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-header-graph",
            ],
          },
          {
            case: "the header `flowchart-elk`",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-header-flowchart-elk",
            ],
          },
          {
            case: "the header `swimlane-beta`, a `swimlane` diagram",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-header-swimlane-beta",
            ],
          },
        ],
      },
      {
        sentence:
          "A description written before the block is replaced by the empty one.",
        cases: [
          {
            case: "a line description before the block",
            reports: true,
            inputs: [
              "invalid/flowchart/db-acc-descr-unclosed-replaces",
              "invalid/flowchart/db-acc-descr-unclosed-empty-replaces",
              "invalid/flowchart/gram-unclosed-description-block-closed-twice-by-a-later-description",
            ],
          },
          {
            case: "the block is closed, and a later statement sets the description: no mistake of this rule",
            reports: false,
            inputs: [
              "valid/flowchart/db-description-block-closed-then-closed-block",
              "valid/flowchart/db-description-block-closed-then-acc-descr-line",
            ],
          },
          {
            case: "a title before the block stays",
            reports: true,
            inputs: ["invalid/flowchart/db-acc-descr-unclosed-keeps-title"],
          },
        ],
      },
      {
        sentence:
          "The statements after the block become its text: after `accDescr { x`, the line `B --> C` makes no link.",
        cases: [
          {
            case: "lines after the line of the `{`, and lines after a `{` alone",
            reports: true,
            inputs: [
              "docs/rules/flowchart/no-unclosed-description-block.md incorrect 2",
              "docs/rules/flowchart/no-unclosed-description-block.md incorrect 2",
              "invalid/flowchart/db-acc-descr-unclosed-text-next-line",
            ],
          },
        ],
      },
      {
        sentence:
          "The rule also reports a block that a `}` written for something else closes.",
        cases: [
          {
            case: "the `}` of a shape",
            reports: true,
            messageHas: "closes this `accDescr {` block at the `}`",
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-of-a-later-shape",
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-crlf",
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-cr",
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-without-final-line-break",
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-in-subgraph",
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-after-empty-and-comment-lines",
            ],
          },
          {
            case: "the `}` of a data block",
            reports: true,
            messageHas: "closes this `accDescr {` block at the `}`",
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-data-block",
              "invalid/flowchart/db-unclosed-description-block-takes-data-block-line",
            ],
          },
          {
            case: "lines of other statements stand between the block and the `}`",
            reports: true,
            inputs: [
              "invalid/flowchart/db-unclosed-description-block-takes-brace-line",
              "invalid/flowchart/db-unclosed-description-block-takes-vertex-brace",
            ],
          },
          {
            case: "a description is set before the block",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-after-a-description",
            ],
          },
        ],
      },
      {
        sentence:
          "The rule reports a block whose text holds a `{` on a later line than the `{` of the block, unless the `}` that closes the block stands alone on its line",
        cases: [
          {
            case: "the `}` of a shape or of a data block, on a later line",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-of-a-later-shape",
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-data-block",
              "invalid/flowchart/db-unclosed-description-block-takes-brace-line",
            ],
          },
          {
            case: "the shape spans lines: its `{` and its `}` are on different lines",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-of-a-shape-spanning-lines",
              "invalid/flowchart/db-unclosed-description-block-brace-after-lines",
            ],
          },
          {
            case: "no `{` on a later line than the `{` of the block",
            reports: false,
            inputs: [
              "valid/flowchart/gram-unclosed-description-block-closing-brace-on-a-later-line-no-brace-before-it",
            ],
          },
          {
            case: "the `}` that closes the block stands alone on its line, after a `{` on a later line",
            reports: false,
            inputs: [
              "valid/flowchart/gram-unclosed-description-block-own-brace-alone-after-a-brace-on-a-later-line",
              "valid/flowchart/db-unclosed-description-block-brace-alone-after-open-brace",
            ],
          },
          {
            case: "a shape spans lines, and the `}` that closes the block stands alone on its line",
            reports: false,
            inputs: [
              "valid/flowchart/db-unclosed-description-block-shape-over-lines",
            ],
          },
        ],
      },
      {
        sentence:
          "A `}` on the line of the `{`, as in `accDescr { a { b }`, and a `}` alone on its line close the block as written, and are not reported",
        cases: [
          {
            case: "a `}` on the line of the `{`, with a `{` in the text",
            reports: false,
            inputs: [
              "valid/flowchart/gram-unclosed-description-block-brace-in-text-closed-on-the-same-line",
              "valid/flowchart/db-unclosed-description-block-brace-inside",
            ],
          },
          {
            case: "a `{` only in a directive or in a comment line on a later line: it is no text of the description",
            reports: false,
            inputs: [
              "valid/flowchart/gram-unclosed-description-block-directive-with-brace-on-a-later-line",
              "valid/flowchart/gram-unclosed-description-block-comment-line-with-brace-on-a-later-line",
            ],
          },
          {
            case: "a `}` alone on its line, with a `{` in the text on the line of the `{`",
            reports: false,
            inputs: [
              "valid/flowchart/gram-unclosed-description-block-brace-in-text-closing-brace-alone-on-its-line",
              "valid/flowchart/db-unclosed-description-block-open-brace-line-end",
            ],
          },
          {
            case: "a `{` only in a directive in the text",
            reports: false,
            inputs: [
              "valid/flowchart/gram-unclosed-description-block-directive-with-braces-in-text",
            ],
          },
        ],
      },
      {
        sentence:
          "A description that holds a `{` and ends with its own `}` on a later line, as `accDescr {`, then `a {b }`, is reported too",
        cases: [
          {
            case: "the description holds a `{` and ends with its own `}`",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-own-description-on-a-later-line",
              "invalid/flowchart/db-unclosed-description-block-brace-on-next-line",
            ],
          },
        ],
      },
      {
        sentence:
          "At the end of the line of the `{`, when text follows the `{` on that line and the lines after it are read as statements.",
        cases: [
          {
            case: "text follows the `{`, and the lines after it are statements",
            reports: true,
            offers: ["closeAtLineEnd", "closeAtTextEnd"],
            inputs: [
              "docs/rules/flowchart/no-unclosed-description-block.md incorrect 2",
              "invalid/flowchart/gram-unclosed-description-block-after-a-statement-on-the-same-line",
              "invalid/flowchart/gram-unclosed-description-block-tab-indented",
              "invalid/flowchart/gram-unclosed-description-block-whitespace-after-the-text-on-the-brace-line",
              "invalid/flowchart/gram-unclosed-description-block-comment-mark-after-the-brace",
              "invalid/flowchart/gram-unclosed-description-block-directive-spans-lines-on-brace-line",
              "invalid/flowchart/gram-unclosed-description-block-brace-inside-the-text",
            ],
          },
          {
            case: "text follows the `{`, and nothing after it",
            reports: true,
            offers: ["closeAtLineEnd"],
            inputs: [
              "invalid/flowchart/lex-acc-descr-block-unclosed",
              "invalid/flowchart/db-acc-descr-unclosed-replaces",
              "invalid/flowchart/db-acc-descr-unclosed-keeps-title",
            ],
          },
          {
            case: "text follows the `{`, and a later line is no statement",
            reports: true,
            offers: ["closeAtTextEnd"],
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-later-line-is-no-statement",
            ],
            rejected: [
              "flowchart/gram-description-block-closed-at-line-end-then-text",
            ],
          },
          {
            case: "the block is closed by a later `}`, and a later line is no statement",
            reports: true,
            offers: [],
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-later-line-no-statement",
            ],
          },
          {
            case: "no text on the line of the `{`",
            reports: true,
            offers: ["closeAtTextEnd"],
            inputs: [
              "invalid/flowchart/db-acc-descr-unclosed-text-next-line",
              "invalid/flowchart/gram-unclosed-description-block-crlf-lines",
              "invalid/flowchart/gram-unclosed-description-block-text-with-a-blank-line",
            ],
          },
        ],
      },
      {
        sentence:
          "At the end of the text, when the block is not closed and has text on a later line. mermaid.js then reads all the text after the `{` as the description. A block that a later `}` closes gets only the first suggestion.",
        cases: [
          {
            case: "text on a later line, the text ends with line breaks or none",
            reports: true,
            offers: ["closeAtTextEnd"],
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-several-final-line-breaks",
              "invalid/flowchart/gram-unclosed-description-block-text-on-a-later-line-without-final-line-break",
              "invalid/flowchart/gram-unclosed-description-block-crlf-lines",
            ],
          },
          {
            case: "a later `}` closes the block: only the suggestion at the end of the line",
            reports: true,
            offers: ["closeAtLineEnd"],
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-of-a-later-shape",
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-data-block",
              "invalid/flowchart/db-unclosed-description-block-takes-brace-line",
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-after-a-description",
              "invalid/flowchart/db-unclosed-description-block-takes-data-block-line",
              "invalid/flowchart/db-unclosed-description-block-brace-after-lines",
            ],
            results: {
              "invalid/flowchart/db-unclosed-description-block-takes-brace-line":
                "flowchart/db-closed-description-block-then-statements",
              "invalid/flowchart/db-unclosed-description-block-brace-after-lines":
                "flowchart/db-closed-description-block-then-vertex-braces",
            },
          },
        ],
      },
      {
        sentence:
          "A block with nothing after its `{` gets no suggestion: closed there, it would be empty.",
        cases: [
          {
            case: "the `{` ends the text, or only whitespace follows it",
            reports: true,
            offers: [],
            inputs: [
              "invalid/flowchart/lex-acc-descr-block-unclosed-empty",
              "invalid/flowchart/db-acc-descr-unclosed-empty-replaces",
              "invalid/flowchart/gram-unclosed-description-block-only-whitespace-after-the-brace",
            ],
          },
          {
            case: "the block is closed by a later `}`, and the `{` ends its line",
            reports: true,
            offers: [],
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-nothing-on-brace-line",
              "invalid/flowchart/db-unclosed-description-block-takes-vertex-brace",
            ],
          },
        ],
      },
      {
        sentence:
          "A directive is not text: with only a directive after the `{`, the block gets no suggestion at the end of the line.",
        cases: [
          {
            case: "only a directive after the `{`",
            reports: true,
            offers: ["closeAtTextEnd"],
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-only-directive-on-brace-line",
            ],
          },
        ],
      },
      {
        sentence:
          "A block that holds a directive that is not closed gets no suggestion: from that directive on, the directive decides what mermaid.js reads, wherever the block is closed.",
        cases: [
          {
            case: "an `init` directive that is not closed, on the line of the `{` or after it",
            reports: true,
            offers: [],
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-unclosed-directive-on-brace-line",
              "invalid/flowchart/gram-unclosed-description-block-unclosed-directive-after-brace-line",
              "invalid/flowchart/gram-unclosed-description-block-unclosed-directive-after-text-on-last-line",
              "invalid/flowchart/gram-unclosed-description-block-unclosed-directive-ends-the-text-on-brace-line",
            ],
          },
          {
            case: "a `wrap` directive that is not closed",
            reports: true,
            offers: [],
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-unclosed-wrap-directive-on-brace-line",
              "invalid/flowchart/gram-unclosed-description-block-unclosed-wrap-directive-after-brace-line",
            ],
          },
        ],
      },
      {
        sentence:
          "When a description is set before the block, or by a statement after it, closing the block makes the text set the description twice",
        cases: [
          {
            case: "a description is set before the block",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/db-acc-descr-unclosed-replaces",
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-after-a-description",
            ],
          },
        ],
      },
      {
        sentence:
          "A description block ends at the first `}` after its `{`; every other character up to there, a `{` too, is its text",
        cases: [
          {
            case: "a `{` in the text, and the `}` on the line of the `{` or alone on its line",
            reports: false,
            inputs: [
              "valid/flowchart/db-unclosed-description-block-brace-inside",
              "valid/flowchart/db-unclosed-description-block-open-brace-line-end",
            ],
          },
        ],
      },
      {
        sentence:
          "When a later statement holds a `{` with its `}`, as the shape `A{y}` or the data block `A@{ shape: rect }`, that `}` closes the block, and the lines up to it become the description",
        cases: [
          {
            case: "the `}` of a shape or of a data block on a later line",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-of-a-later-shape",
              "invalid/flowchart/db-unclosed-description-block-takes-data-block-line",
            ],
          },
        ],
      },
      {
        sentence:
          "For the same reason, a shape written over lines whose `}` stands alone on its line is not reported",
        cases: [
          {
            case: "a shape over lines, its `}` alone on its line",
            reports: false,
            inputs: [
              "valid/flowchart/db-unclosed-description-block-shape-over-lines",
            ],
          },
        ],
      },
      {
        sentence:
          "Where a later line is no statement, as `second line, more`, the result would be rejected, and this suggestion is not offered.",
        cases: [
          {
            case: "a later line that is no statement: the suggestion at the end of the line is not offered",
            reports: true,
            offers: ["closeAtTextEnd"],
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-later-line-is-no-statement",
            ],
            rejected: [
              "flowchart/gram-description-block-closed-at-line-end-then-text",
            ],
          },
          {
            case: "a later line that is no statement, and a later `}` closes the block: no suggestion",
            reports: true,
            offers: [],
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-closed-by-a-brace-later-line-no-statement",
            ],
          },
        ],
      },
      {
        sentence:
          "After `accDescr { d }`, the lines `more %%{init: {}` and `A --> B` give no edge from A to B, and with `%%{wrap` in place of `%%{init: {}`, closing the block right before the directive is rejected.",
        cases: [
          {
            case: "a directive that is not closed after a closed block: the block is closed, and nothing is reported",
            reports: false,
            inputs: [
              "valid/flowchart/gram-unclosed-description-block-unclosed-directive-after-closed-block-init",
            ],
          },
          {
            case: "a `wrap` directive that is not closed swallows the `}`: the block is not closed, and no suggestion is offered",
            reports: true,
            offers: [],
            inputs: [
              "invalid/flowchart/gram-unclosed-description-block-unclosed-directive-wrap-before-closing-brace",
            ],
          },
        ],
      },
      {
        sentence:
          "A `}` is alone on its line when only whitespace and directives stand before it there, whatever follows it, as in `};` or `} C`.",
        cases: [
          {
            case: "a `;` follows the `}` on its line: the `}` is alone, and the block is not reported",
            reports: false,
            inputs: [
              "valid/flowchart/gram-unclosed-description-block-closing-brace-with-semicolon",
              "valid/flowchart/db-unclosed-description-block-brace-line-word-after",
              "valid/flowchart/gram-unclosed-description-block-closing-brace-after-a-directive",
              "valid/flowchart/db-unclosed-description-block-brace-line-semicolon-vertex",
              "valid/flowchart/db-unclosed-description-block-brace-line-directive-after",
              "valid/flowchart/db-unclosed-description-block-brace-line-directive-before",
            ],
          },
        ],
      },
      {
        sentence:
          "A `}` alone on its line is the author's also after such a `{`, as in `accDescr {`, `uses { here`, and `}`, whose description is `uses { here`.",
        cases: [
          {
            case: "a `{` in the text on a later line, and the `}` alone on its line",
            reports: false,
            inputs: [
              "valid/flowchart/db-unclosed-description-block-brace-alone-after-open-brace",
            ],
          },
        ],
      },
    ],
    notBehavior: ["For each report, the rule suggests closing the block:"],
  },
)
