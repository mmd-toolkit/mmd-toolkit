/**
 * The rule `flowchart/no-ignored-text`, on the examples of its document and on the
 * fixtures that record what mermaid.js does with text on a direction line.
 */
import { Linter } from "eslint"
import { describe, expect, it } from "vitest"
import { noIgnoredText } from "../../../src/rules/flowchart/no-ignored-text.ts"
import { LANGUAGE_CONFIG } from "../../helpers.ts"
import { testRule } from "../../rule-test.ts"

testRule("flowchart/no-ignored-text", noIgnoredText, {
  revealed: {
    kind: "anyRule",
    because:
      "The text split off becomes statements, and any rule may report a mistake in them.",
  },
  // The text that mermaid.js dropped is read as statements. The direction is
  // read as before: the Db is the same there.
  claims: { splitAtSeparator: { kind: "readsDroppedTextAsStatements" } },
  sentences: [
    {
      sentence:
        "This rule reports the text that stands on a direction line before `direction` or after the direction value.",
      cases: [
        {
          case: "text before `direction`, with or without a `;`",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-ignored-text-text-before-direction-without-semicolon",
            "invalid/flowchart/lex-direction-line-after-semicolon",
            "invalid/flowchart/gram-ignored-text-top-level-link-before-with-semicolon",
          ],
        },
        {
          case: "text after the direction value, with or without a `;`",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-ignored-text-link-after-value-without-semicolon",
            "invalid/flowchart/lex-direction-line-text-after-value",
            "invalid/flowchart/gram-ignored-text-top-level-link-after-with-semicolon",
          ],
        },
        {
          case: "text on both sides",
          reports: true,
          inputs: ["invalid/flowchart/gram-ignored-text-split-text-on-both-sides"],
        },
        {
          case: "a directive stands in the line, and the text is on one side of it or inside it",
          reports: true,
          inputs: [
            "invalid/flowchart/lex-direction-line-directive-between",
            "invalid/flowchart/lex-direction-line-text-before-directive-inside",
            "invalid/flowchart/lex-direction-line-text-after-directive-inside",
          ],
        },
        {
          case: "the direction value is on the next line",
          reports: true,
          inputs: ["invalid/flowchart/lex-direction-line-value-next-line"],
        },
        {
          case: "no other text on the line",
          reports: false,
          inputs: [
            "valid/flowchart/lex-direction-line-own-line-after-link",
            "valid/direction-then-link-on-next-line",
          ],
        },
        {
          case: "only `;` and whitespace before `direction`",
          reports: false,
          inputs: ["valid/separators-and-spaces-only"],
        },
        {
          // The document does not say this: the `end` of a subgraph and its
          // `;` are a statement, not text that is dropped.
          case: "the text before `direction` is the `end` of a subgraph",
          reports: false,
          inputs: [
            "valid/separator-after-subgraph-end",
            "valid/flowchart/lex-direction-line-after-end-semicolon-column-zero",
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
          inputs: ["docs/rules/flowchart/no-ignored-text.md incorrect 1"],
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
        "A link written on the same line, before or after the direction, disappears, also when a `;` separates the two.",
      cases: [
        {
          case: "a link before the direction, without a `;`",
          reports: true,
          inputs: ["invalid/flowchart/lex-direction-line-swallows-edge"],
        },
        {
          case: "a link after the direction value, without a `;`",
          reports: true,
          inputs: ["invalid/flowchart/gram-ignored-text-link-after-value-without-semicolon"],
        },
        {
          case: "a link before the direction, with a `;`",
          reports: true,
          inputs: ["invalid/flowchart/gram-ignored-text-top-level-link-before-with-semicolon"],
        },
        {
          case: "a link after the direction value, with a `;`",
          reports: true,
          inputs: [
            "invalid/flowchart/gram-ignored-text-top-level-link-after-with-semicolon",
            "invalid/flowchart/lex-direction-line-semicolon-link-after-value",
          ],
        },
      ],
    },
    {
      sentence:
        "In a subgraph, `A-->B; direction TB` and `direction TB; A-->B` give the subgraph the direction `TB` and make no vertex and no link, while the same two statements on two lines make the link from `A` to `B`.",
      cases: [
        {
          case: "the link, `;`, then the direction, in a subgraph",
          reports: true,
          inputs: ["invalid/flowchart/lex-direction-line-after-semicolon"],
        },
        {
          case: "the direction, `;`, then the link, in a subgraph",
          reports: true,
          inputs: [
            "invalid/flowchart/lex-direction-line-then-semicolon-statement",
          ],
        },
        {
          case: "the link, then the direction, on two lines",
          reports: false,
          inputs: ["valid/flowchart/lex-direction-line-own-line-after-link"],
        },
        {
          case: "the direction, then the link, on two lines",
          reports: false,
          inputs: ["valid/direction-then-link-on-next-line"],
        },
      ],
    },
    {
      sentence:
        "At the top level, `A-->B direction TB` makes no vertex and no link either.",
      cases: [
        {
          case: "a link, then the direction, at the top level",
          reports: true,
          inputs: ["invalid/flowchart/lex-direction-line-swallows-edge"],
        },
      ],
    },
    {
      sentence:
        "Text after the direction, as in `direction LR trailing`, is dropped in the same way.",
      cases: [
        {
          case: "a word after the direction value",
          reports: true,
          inputs: ["invalid/flowchart/lex-direction-line-text-after-value"],
        },
      ],
    },
    {
      sentence:
        "When `direction` and a direction value stand on it, as in `A[Set direction LR]-->B`, the line is a direction statement and makes no vertex and no link. The rule reports that too.",
      cases: [
        {
          case: "`direction` and a value in a label, with a link",
          reports: true,
          inputs: ["invalid/flowchart/lex-direction-line-in-label-with-link"],
        },
        {
          case: "`direction` and a value in a label, without a link",
          reports: true,
          inputs: ["invalid/flowchart/lex-direction-line-in-label"],
        },
        {
          case: "`direction` and a value in a string label",
          reports: true,
          inputs: ["invalid/flowchart/lex-direction-line-in-string-label"],
        },
        {
          case: "`direction` without a value in a label",
          reports: false,
          inputs: ["valid/word-direction-without-value-in-label"],
        },
        {
          case: "a value without `direction` in a label",
          reports: false,
          inputs: ["valid/direction-value-word-without-direction-in-label"],
        },
      ],
    },
    {
      sentence:
        "Text of only `;` and whitespace, as in `direction TB;`. A `;` only ends the statement.",
      cases: [
        {
          case: "one `;` right after the value",
          reports: false,
          inputs: ["valid/flowchart/lex-direction-line-semicolon-after-value"],
        },
        {
          case: "`;` separated by whitespace",
          reports: false,
          inputs: ["valid/flowchart/gram-ignored-text-value-then-spaced-semicolons"],
        },
      ],
    },
    {
      sentence:
        "Text in which only `;` and whitespace come before `%%`, as in `direction TB %% vertical` and `direction TB; %% vertical`.",
      cases: [
        {
          case: "whitespace, then `%%`",
          reports: false,
          inputs: ["valid/flowchart/lex-direction-line-percent-after-value"],
        },
        {
          case: "a `;`, whitespace, then `%%`",
          reports: false,
          inputs: ["valid/semicolon-comment-after-value-in-subgraph"],
        },
        {
          case: "two `;`, then `%%`",
          reports: false,
          inputs: ["valid/double-semicolon-comment-after-value-in-subgraph"],
        },
        {
          case: "`%%` right after the value, or alone",
          reports: false,
          inputs: [
            "valid/flowchart/gram-ignored-text-value-then-comment-mark-without-space",
            "valid/flowchart/gram-ignored-text-value-then-bare-comment-mark",
          ],
        },
        {
          case: "a `;` inside the comment",
          reports: false,
          inputs: [
            "valid/semicolon-comment-with-semicolon-after-value-in-subgraph",
          ],
        },
      ],
    },
    {
      sentence:
        "Other text before the `%%` is reported: in `direction TB; x %% c`, the `x`, meant as a statement, is dropped.",
      cases: [
        {
          case: "a word between the value and `%%`",
          reports: true,
          inputs: ["invalid/text-before-comment-after-value-in-subgraph"],
        },
        {
          case: "text before `direction`, and a comment after the value",
          reports: true,
          inputs: ["invalid/split-before-direction-with-comment-after-value"],
        },
      ],
    },
    {
      sentence:
        "When a `;` separates every reported text on the line from the direction, as in `A-->B; direction TB`, the rule suggests splitting the line there: the whitespace after each such `;` becomes a line break and the indentation of the line, and the `;` stays, as if the author had broken the line after it.",
      cases: [
        {
          case: "text before `direction`, one `;` between",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/gram-ignored-text-top-level-link-before-with-semicolon",
            "invalid/flowchart/lex-direction-line-after-semicolon",
          ],
        },
        {
          case: "two statements before `direction`",
          reports: true,
          suggests: true,
          inputs: ["invalid/flowchart/gram-ignored-text-split-two-statements-before"],
        },
        {
          case: "text after the value, a `;` between",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/split-after-direction-value",
            "invalid/flowchart/gram-ignored-text-top-level-link-after-with-semicolon",
          ],
        },
        {
          case: "text on both sides",
          reports: true,
          suggests: true,
          inputs: ["invalid/flowchart/gram-ignored-text-split-text-on-both-sides"],
        },
        {
          case: "no whitespace after the `;`",
          reports: true,
          suggests: true,
          inputs: ["invalid/split-without-space-after-separator"],
        },
        {
          case: "a comment after the value",
          reports: true,
          suggests: true,
          inputs: ["invalid/split-before-direction-with-comment-after-value"],
        },
        {
          case: "the indentation is a tab",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/lex-direction-line-acc-title-tab-indented",
          ],
        },
        {
          case: "the text before `direction` is a style line or a description block",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/gram-ignored-text-split-after-style-line",
            "invalid/split-after-description-block",
          ],
        },
        {
          case: "no `;` between the text and the direction",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/flowchart/gram-ignored-text-text-before-direction-without-semicolon",
            "invalid/flowchart/gram-ignored-text-link-after-value-without-semicolon",
            "invalid/flowchart/lex-direction-line-swallows-edge",
          ],
        },
      ],
    },
    {
      // The text of each split is compared with the input in LINE_BREAKS below.
      sentence:
        "The line break is of the kind that the text uses there: the one that ends the line, or, on a last line without one, the one that ends the line before it",
      cases: [
        {
          case: "the line ends with CRLF",
          reports: true,
          suggests: true,
          inputs: ["invalid/split-keeps-crlf"],
        },
        {
          case: "the line ends with CR",
          reports: true,
          suggests: true,
          inputs: ["invalid/split-keeps-cr"],
        },
        {
          case: "the line ends with LF",
          reports: true,
          suggests: true,
          inputs: ["invalid/flowchart/gram-ignored-text-top-level-link-before-with-semicolon"],
        },
        {
          case: "the last line has no line break, and the line before it ends with LF",
          reports: true,
          suggests: true,
          inputs: ["invalid/flowchart/gram-ignored-text-split-on-last-line-without-line-break"],
        },
        {
          case: "the last line has no line break, and the line before it ends with CRLF",
          reports: true,
          suggests: true,
          inputs: ["invalid/split-keeps-crlf-on-last-line-without-line-break"],
        },
      ],
    },
    {
      sentence:
        "Where a kept `;` would then not end the statement before it, the rule removes all the `;`s on the line with the whitespace instead: after `accTitle: What to buy`, whose text runs to the end of the line, the `;` would be part of the text; after the direction value, the rest of the line is dropped; and after a description block, as in `accDescr { x }; direction TB`, a `;` alone is a statement of its own, which inside a subgraph makes a member `;`.",
      cases: [
        {
          case: "the `;` is part of an `accTitle` text",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/split-drops-separator-in-title",
            "invalid/flowchart/lex-direction-line-acc-title-indented",
          ],
        },
        {
          case: "the `;` is part of an `accDescr` text",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/flowchart/lex-direction-line-acc-descr-subgraph-indented",
          ],
        },
        {
          case: "the `;` follows the direction value",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/split-after-direction-value",
            "invalid/flowchart/lex-direction-line-then-semicolon-statement",
          ],
        },
        {
          case: "the `;` follows a description block: it would be a statement of its own",
          reports: true,
          suggests: true,
          inputs: [
            "invalid/split-after-description-block",
            "invalid/split-after-description-block-in-subgraph",
          ],
        },
        {
          case: "two `;` in a row",
          reports: true,
          suggests: true,
          inputs: ["invalid/split-at-double-separator"],
        },
      ],
    },
    {
      sentence:
        "The rule suggests it only when the result is read so, the split text as statements and the direction as a direction statement, and the rule reports no text on the line any more. Otherwise the rule suggests nothing",
      cases: [
        {
          case: "the text after the split would start with an arrow",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/split-would-leave-bare-arrow",
            "invalid/flowchart/lex-direction-line-semicolon-link-after-value",
          ],
        },
        {
          case: "the text is inside a label",
          reports: true,
          suggests: false,
          inputs: [
            "invalid/flowchart/lex-direction-line-in-label-with-link",
            "invalid/flowchart/lex-direction-line-in-label",
            "invalid/flowchart/lex-direction-line-in-string-label",
          ],
        },
        {
          case: "a word follows the value, with no `;`",
          reports: true,
          suggests: false,
          inputs: ["invalid/flowchart/lex-direction-line-text-after-value"],
        },
        {
          case: "a directive stands in the text",
          reports: true,
          suggests: false,
          inputs: ["invalid/flowchart/lex-direction-line-directive-between"],
        },
      ],
    },
    {
      sentence:
        "Once split, the text is read as statements, and other rules may report what it holds, such as a second `accTitle`.",
      cases: [
        {
          case: "the text split off is a second `accTitle`",
          reports: true,
          suggests: true,
          inputs: ["invalid/split-reveals-duplicate-title"],
        },
      ],
    },
  ],
})

/**
 * The line terminator of a split: the text that the split gives uses the kind
 * of line terminator that the text uses at the line, and, on a last line
 * without one, the kind that ends the line before it. The snapshots show line
 * breaks alike, so this test compares the output with the text.
 */
const LINE_BREAKS: readonly { case: string; input: string; output: string }[] =
  [
    {
      case: "the line ends with CRLF",
      input: "flowchart LR\r\n  A-->B; direction TB\r\n",
      output: "flowchart LR\r\n  A-->B;\r\n  direction TB\r\n",
    },
    {
      case: "the line ends with CR",
      input: "flowchart LR\r  A-->B; direction TB\r",
      output: "flowchart LR\r  A-->B;\r  direction TB\r",
    },
    {
      case: "the last line has none, and the line before it ends with CRLF",
      input: "flowchart LR\r\n  A-->B; direction TB",
      output: "flowchart LR\r\n  A-->B;\r\n  direction TB",
    },
    {
      case: "the last line has none, and the line before it ends with CR",
      input: "flowchart LR\r  A-->B; direction TB",
      output: "flowchart LR\r  A-->B;\r  direction TB",
    },
  ]

describe("flowchart/no-ignored-text, the line break of a split", () => {
  it.each(LINE_BREAKS.map((each) => [each.case, each]))("%s", (_case, each) => {
    const messages = new Linter({ configType: "flat" }).verify(
      each.input,
      {
        ...LANGUAGE_CONFIG,
        rules: { "mmd/flowchart/no-ignored-text": "error" },
      },
      "input.mmd",
    )
    const [fix] = messages.flatMap((message) =>
      (message.suggestions ?? []).map((suggestion) => suggestion.fix),
    )
    expect(fix).toBeDefined()
    if (fix === undefined) return
    expect(
      each.input.slice(0, fix.range[0]) +
        fix.text +
        each.input.slice(fix.range[1]),
    ).toBe(each.output)
  })
})
