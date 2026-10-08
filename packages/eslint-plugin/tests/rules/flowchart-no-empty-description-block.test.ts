/**
 * The rule `flowchart-no-empty-description-block`, on the examples of its
 * document and on the fixtures that record what mermaid.js does with a
 * description block that holds nothing.
 */
import { flowchartNoEmptyDescriptionBlock } from "../../src/rules/flowchart-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

const GENERATED_ID = "the subgraph gets a generated id"

testRule(
  "flowchart-no-empty-description-block",
  flowchartNoEmptyDescriptionBlock,
  {
    claims: { removeBlock: { kind: "keepsDb" } },
    sentences: [
      {
        sentence:
          "This rule reports a closed `accDescr` block that holds nothing or only whitespace.",
        cases: [
          {
            case: "nothing between the braces, with or without a space before the `{`",
            reports: true,
            inputs: [
              "docs/rules/flowchart-no-empty-description-block.md incorrect 1",
              "invalid/flowchart/db-acc-descr-empty-block-alone",
              "invalid/flowchart/gram-acc-descr-block-empty-no-space",
            ],
          },
          {
            case: "spaces between the braces",
            reports: true,
            inputs: [
              "docs/rules/flowchart-no-empty-description-block.md incorrect 2",
              "invalid/flowchart/db-acc-descr-empty-block-spaces-alone",
              "invalid/flowchart/gram-acc-descr-block-empty",
            ],
          },
          {
            case: "a line break between the braces",
            reports: true,
            inputs: [
              "docs/rules/flowchart-no-empty-description-block.md incorrect 3",
              "invalid/flowchart/db-acc-descr-empty-block-lines-alone",
            ],
          },
          {
            case: "a tab between the braces",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-with-only-a-tab",
            ],
          },
          {
            case: "CRLF between the braces",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-with-crlf-lines",
              "invalid/flowchart/gram-empty-description-block-block-cr",
            ],
          },
          {
            case: "text between the braces",
            reports: false,
            inputs: [
              "docs/rules/flowchart-no-empty-description-block.md correct 1",
              "valid/flowchart/db-acc-descr-block-alone",
              "valid/flowchart/db-acc-descr-block-replaces",
            ],
          },
          {
            case: "a `;` between the braces is text",
            reports: false,
            inputs: [
              "valid/flowchart/gram-empty-description-block-block-with-a-semicolon",
            ],
          },
          {
            case: "`%%` after the `{` on its line is text",
            reports: false,
            inputs: [
              "valid/flowchart/gram-empty-description-block-comment-mark-after-the-brace-is-text",
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
              "docs/rules/flowchart-no-empty-description-block.md incorrect 1",
            ],
          },
          {
            case: "the header `graph`, a `flowchart-v2` diagram",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-header-graph",
            ],
          },
          {
            case: "the header `flowchart-elk`",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-header-flowchart-elk",
            ],
          },
          {
            case: "the header `swimlane-beta`, a `swimlane` diagram",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-header-swimlane-beta",
            ],
          },
        ],
      },
      {
        sentence:
          "A directive in the block is no text: a block that holds only directives is reported too, and mermaid.js still applies their settings.",
        cases: [
          {
            case: "a directive and whitespace on one line",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-with-only-a-directive",
              "invalid/flowchart/db-empty-description-block-with-directive-inherit-dir",
            ],
            recorded: ["flowchart/config-inherit-dir-default"],
          },
          {
            case: "a directive on a line of its own",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-with-a-directive-on-its-own-line",
            ],
          },
          {
            case: "a directive and text",
            reports: false,
            inputs: [
              "valid/flowchart/gram-empty-description-block-block-with-text-and-a-directive",
            ],
          },
        ],
      },
      {
        sentence:
          "The description stays what it was before the block: after `accDescr: x`, the block `accDescr { }` leaves the description `x`, and with no description before it, the description stays empty.",
        cases: [
          {
            case: "after `accDescr: x`",
            reports: true,
            inputs: [
              "invalid/flowchart/db-acc-descr-empty-block-keeps",
              "invalid/flowchart/db-acc-descr-empty-block-lines-keeps",
            ],
          },
          {
            case: "after a block that holds a description",
            reports: true,
            inputs: ["invalid/flowchart/db-acc-descr-empty-block-after-block"],
          },
          {
            case: "no description before the block",
            reports: true,
            inputs: ["invalid/flowchart/db-acc-descr-empty-block-alone"],
          },
          {
            case: "in a subgraph, after a description in the subgraph",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-after-line-in-subgraph",
            ],
          },
        ],
      },
      {
        sentence:
          "An empty description written as a line is different: `accDescr:` with no line that holds text after it sets the description to the empty text.",
        cases: [
          {
            case: "`accDescr:` without text, at the end of the text, after a description",
            reports: false,
            inputs: ["valid/flowchart/db-acc-descr-empty-replaces"],
          },
        ],
      },
      {
        sentence: "A block that holds only comments is not reported.",
        cases: [
          {
            case: "comment lines in the block, with or without a description before it",
            reports: false,
            inputs: [
              "docs/rules/flowchart-no-empty-description-block.md correct 2",
              "valid/flowchart/db-acc-descr-block-comment-only-alone",
              "valid/flowchart/db-acc-descr-block-comment-only-keeps",
              "valid/flowchart/db-empty-description-block-comment-and-directive-lines",
            ],
          },
        ],
      },
      {
        sentence:
          "An empty block may also follow the last part of a statement on the same line, as in `A accDescr {}`, or the header, as in `flowchart LR accDescr {}`. It sets no description there either, and the rule reports it in the same way.",
        cases: [
          {
            case: "after a vertex",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-after-vertex",
            ],
          },
          {
            case: "after a `click`, a `style`, or a `linkStyle` statement",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-after-click-with-trailing-space",
              "invalid/flowchart/gram-empty-description-block-block-after-style-before-separator",
              "invalid/flowchart/gram-empty-description-block-splits-spaces-after-interpolate",
            ],
          },
          {
            case: "after a `;`",
            reports: true,
            inputs: [
              "invalid/flowchart/db-acc-descr-empty-block-after-semicolon-keeps",
            ],
          },
          {
            case: "after the header",
            reports: true,
            inputs: [
              "invalid/flowchart/header-empty-description-block-after-direction",
            ],
          },
          {
            case: "before a statement on the same line",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-acc-descr-block-empty-then-statement",
            ],
          },
        ],
      },
      {
        sentence:
          "After the name of a subgraph that has no title, the whitespace around an empty block can become part of the name, and a name that holds whitespace gives the subgraph a generated id, such as `subGraph0`, instead of the name.",
        cases: [
          {
            case: "one space between the name and the block",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-after-subgraph-name",
            ],
          },
          {
            case: "two spaces between the name and the block",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-after-subgraph-name-and-two-spaces",
            ],
          },
          {
            case: "the name holds whitespace of its own",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-after-subgraph-name-with-whitespace",
            ],
          },
          {
            case: "a directive stands between the name and the block",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-after-subgraph-name-and-directive",
            ],
          },
          {
            case: "a quoted name that ends with a space",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-after-quoted-name-ending-with-space",
              "invalid/flowchart/gram-empty-description-block-block-after-quoted-name-with-directive-and-space",
            ],
          },
        ],
      },
      {
        sentence:
          "The message of the rule says so for each empty block between the name and the end of its line or a `;`.",
        cases: [
          {
            case: "the block is between the name and the end of the line",
            reports: true,
            messageHas: GENERATED_ID,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-after-subgraph-name",
              "invalid/flowchart/gram-empty-description-block-block-after-subgraph-name-and-two-spaces",
              "invalid/flowchart/gram-empty-description-block-block-after-subgraph-name-and-directive",
              "invalid/flowchart/gram-empty-description-block-block-across-lines-after-subgraph-name",
            ],
          },
          {
            case: "the block is between the name and a `;`",
            reports: true,
            messageHas: GENERATED_ID,
            inputs: [
              "invalid/flowchart/db-subgraph-name-space-before-empty-description-block",
            ],
          },
          {
            case: "the block is after the `;` that ends the name: it is no part of the name",
            reports: true,
            messageLacks: GENERATED_ID,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-after-subgraph-name-and-separator",
              "invalid/flowchart/gram-empty-description-block-block-right-after-separator-after-subgraph-name",
            ],
          },
          {
            case: "two blocks after the name",
            reports: true,
            messageHas: GENERATED_ID,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-two-blocks-after-subgraph-name",
              "invalid/flowchart/db-subgraph-name-space-between-empty-description-blocks",
            ],
          },
          {
            case: "a block before the `;` that ends the name, and a block after it: only the first is part of the name",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-blocks-around-separator-after-subgraph-name",
            ],
          },
          {
            case: "the block is not after the name of a subgraph",
            reports: true,
            messageLacks: GENERATED_ID,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-after-vertex",
              "invalid/flowchart/gram-empty-description-block-block-first-in-subgraph-body",
              "invalid/flowchart/gram-empty-description-block-block-with-only-a-tab",
            ],
          },
          {
            case: "the block follows a U+2028 or a U+2029 after the name, on the same line",
            reports: true,
            messageHas: GENERATED_ID,
            suggests: false,
            inputs: [],
            corpus: [
              "flowchart/gram-empty-description-block-after-u2028",
              "flowchart/gram-empty-description-block-after-u2029",
            ],
          },
        ],
      },
      {
        sentence:
          "For a block that starts its line, the rule suggests removing it, with the whitespace after it, or with its line when nothing else is on the line.",
        cases: [
          {
            case: "nothing else on the line",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/db-acc-descr-empty-block-alone",
              "invalid/flowchart/db-acc-descr-empty-block-lines-alone",
              "invalid/flowchart/db-acc-descr-empty-block-spaces-alone",
              "invalid/flowchart/gram-empty-description-block-block-with-only-a-tab",
            ],
          },
          {
            case: "the lines end with CRLF",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-with-crlf-lines",
            ],
          },
          {
            case: "a statement follows on the line",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/gram-acc-descr-block-empty-then-statement",
            ],
          },
          {
            case: "in a subgraph",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-first-in-subgraph-body",
              "invalid/flowchart/gram-empty-description-block-block-after-line-in-subgraph",
              "invalid/flowchart/db-subgraph-member-empty-acc-descr-block",
              "invalid/flowchart/db-subgraph-member-has-own-property-no-member-statements",
            ],
          },
        ],
      },
      {
        sentence: "A `;` after it stays.",
        cases: [
          {
            case: "a `;` and a statement after the block",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/gram-acc-descr-block-empty-then-semicolon",
              "invalid/flowchart/gram-empty-description-block-semicolon-after-block-in-subgraph",
              "invalid/flowchart/gram-empty-description-block-semicolon-after-block-in-nested-subgraph",
            ],
          },
        ],
      },
      {
        sentence:
          "A block that holds a directive gets no suggestion: removing the block would remove the directive, whose settings mermaid.js applies.",
        cases: [
          {
            case: "a directive in the block, on the line of the block or on its own line",
            reports: true,
            suggests: false,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-with-only-a-directive",
              "invalid/flowchart/db-empty-description-block-with-directive-inherit-dir",
              "invalid/flowchart/gram-empty-description-block-block-with-a-directive-on-its-own-line",
            ],
          },
        ],
      },
      {
        sentence:
          "A block that follows something on its line gets no suggestion: whether removing the whitespace before it changes how mermaid.js reads what comes before depends on that statement, as after the name of a subgraph, where the whitespace can be part of the name.",
        cases: [
          {
            case: "after a vertex, a `click`, a `style`, a `linkStyle`, or the header",
            reports: true,
            suggests: false,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-after-vertex",
              "invalid/flowchart/gram-empty-description-block-block-after-click-with-trailing-space",
              "invalid/flowchart/gram-empty-description-block-block-after-style-before-separator",
              "invalid/flowchart/gram-empty-description-block-splits-spaces-after-interpolate",
              "invalid/flowchart/header-empty-description-block-after-direction",
            ],
          },
          {
            case: "after a `;`",
            reports: true,
            suggests: false,
            inputs: [
              "invalid/flowchart/db-acc-descr-empty-block-after-semicolon-keeps",
            ],
          },
          {
            case: "after the name of a subgraph",
            reports: true,
            suggests: false,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-after-subgraph-name",
              "invalid/flowchart/gram-empty-description-block-block-after-subgraph-name-and-two-spaces",
              "invalid/flowchart/gram-empty-description-block-block-after-subgraph-name-with-whitespace",
              "invalid/flowchart/gram-empty-description-block-block-after-subgraph-name-and-directive",
              "invalid/flowchart/gram-empty-description-block-block-after-subgraph-name-and-separator",
              "invalid/flowchart/db-subgraph-name-space-after-empty-description-block",
            ],
          },
        ],
      },
      {
        sentence:
          "Nor does a block at the start of the body of a subgraph get one when a U+2028, a U+2029, or an unclosed directive stands between the name and the block: such a character or directive carries line breaks into the name, and without the block mermaid.js may read the lines after it as part of the name.",
        cases: [
          {
            case: "a U+2028 or a U+2029 after the name, then a comment line, then the block",
            reports: true,
            suggests: false,
            messageHas: GENERATED_ID,
            inputs: [],
            corpus: [
              "flowchart/gram-empty-description-block-comment-line-after-u2028",
              "flowchart/gram-empty-description-block-comment-line-after-u2029",
            ],
          },
          {
            case: "an unclosed directive after the name",
            reports: true,
            suggests: false,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-after-unclosed-directive-in-subgraph-name",
            ],
          },
          {
            case: "nothing stands before the block: the suggestion is offered",
            reports: true,
            suggests: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-first-in-subgraph-body",
            ],
          },
          {
            case: "a block on the next line after another block after the name",
            reports: true,
            inputs: [
              "invalid/flowchart/gram-empty-description-block-block-on-next-line-after-subgraph-name",
            ],
          },
        ],
      },
      {
        sentence:
          "The author who turns the lines of a description into comments means the block to do nothing, and mermaid.js reads it so: the description before the block stays.",
        cases: [
          {
            case: "comment lines in the block, after a description or alone",
            reports: false,
            inputs: [
              "valid/flowchart/db-acc-descr-block-comment-only-keeps",
              "valid/flowchart/db-acc-descr-block-comment-only-alone",
            ],
          },
        ],
      },
      {
        sentence:
          "A block that holds a comment line is not reported also when it holds directives besides; mermaid.js applies their settings.",
        cases: [
          {
            case: "a comment line and a directive in the block",
            reports: false,
            inputs: [
              "valid/flowchart/db-empty-description-block-comment-and-directive-lines",
            ],
          },
        ],
      },
      {
        sentence:
          "When the name has no whitespace of its own and the subgraph gets a generated id in this way, as in `subgraph S accDescr {}`, `style S` and links to `S` no longer reach it.",
        cases: [
          {
            case: "a name without whitespace, an empty block after it",
            reports: true,
            messageHas: "the subgraph gets a generated id",
            inputs: [
              "invalid/flowchart/gram-empty-description-block-after-subgraph-name",
            ],
          },
        ],
      },
    ],
    notBehavior: [],
  },
)
