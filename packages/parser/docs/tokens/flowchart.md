# Flowchart tokens

Japanese version: [flowchart.ja.md](./flowchart.ja.md)

This document defines the tokens of the diagram types `flowchart-v2`,
`flowchart-elk`, and `swimlane` in the tree that `@mmd-toolkit/parser` produces.
The nodes are defined by the specification in
[`ast/flowchart.md`](../../../spec/docs/ast/flowchart.md); the tokens shared by
all diagram types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/flowchart.md](../../../spec/docs/diagrams/flowchart.md#lexical-structure).
Every unit that is not all whitespace, and the units of a label that is all
whitespace, belong to one **item** of
[the grammar](../../../spec/docs/diagrams/flowchart.md#grammar) and has the kind
that this table gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | a `header-keyword` or `header-direction` unit; a `subgraph`, `end`, `style`, `classDef`, `class`, `linkStyle`, `interpolate`, `href`, `accTitle`, or `accDescr` unit that begins or continues a statement; the `click` unit of a click statement; a `call` unit of a click statement; a `default` unit of a `linkStyle` statement; the `direction` and `direction-value` units of a direction statement; a `link-target` unit                                                                                                                                                                                   |
| `Identifier` | the name units of [Directives inside units](../../../spec/docs/diagrams/flowchart.md#directives-inside-units); an `id`, an `id-list-part`, and a `name` are each one item with all their units, and the two `id-run` units of a rectangle written with `[\|` are each an item of its own                                                                                                                                                                                                                                                                                                                        |
| `Numeric`    | a `number` unit of a `linkStyle` statement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `String`     | a `string` or `markdown-string` unit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `RawText`    | the text units of [Directives inside units](../../../spec/docs/diagrams/flowchart.md#directives-inside-units); the units of a `subgraph-name` other than its strings and markdown strings are one item for each run of them that no string separates, and a style of the tree is one item with all its units                                                                                                                                                                                                                                                                                                    |
| `Punctuator` | the units that open a shape, together one item: the units before the label in an alternative of the rule `shape`, except in its last alternative, where it is `"[\|"` alone; the units after the label in an alternative of the rule `shape`, together one item; every other unit that is not all whitespace, each an item of its own: the `\|` around the label of a link, the `:` and the `\|` of a rectangle written with `[\|`, `&`, `:::`, `,` other than the one just named, a `click-comma` unit of a click statement, `:`, `;`, `@`, `data-start` and `}`, arrows and opening arrows, `{`, `(`, and `)` |

[fixture: flowchart/tokens-diagram-trailing-separator] [fixture:
flowchart/spec-flow-singlenode-a5fa3415] [fixture:
flowchart/db-subgraph-member-empty-statement] [fixture:
flowchart/gram-style-id-comma] [fixture:
flowchart/gram-classdef-escaped-comma-one-style] [fixture:
flowchart/db-class-ids-empty-first] [fixture:
flowchart/db-linkstyle-interpolate-only] [fixture:
flowchart/db-linkstyle-default-no-fill] [fixture: flowchart/gram-click-href]
[fixture: flowchart/lex-acc-title-space-before-colon] [fixture:
flowchart/db-acc-descr-line-alone] [fixture:
flowchart/lex-acc-descr-block-line-feed-before-brace] [fixture:
flowchart/tokens-callback-name-trailing-space] [fixture:
flowchart/db-direction-statement-top-level] [fixture:
flowchart/lex-direction-line-same-value-twice] [fixture: flowchart/gram-edge-id]
[fixture: flowchart/gram-rect-property] [fixture:
flowchart/gram-label-string-then-text] [fixture:
flowchart/gram-string-markdown-then-text] [fixture:
flowchart/db-arrow-dash-head-length] [fixture:
flowchart/tokens-pipe-label-space] [fixture:
flowchart/gram-subgraph-name-string-then-text] [fixture:
flowchart/gram-data-block-space-only] [fixture:
flowchart/tokens-circle-hexagon-delimiters] [fixture:
flowchart/gram-group-two-vertices] [fixture:
flowchart/lex-triple-colon-after-id] [fixture:
flowchart/gram-click-comma-only-href]

A `String` token that a comment region or a directive cuts becomes
`StringFragment` tokens (see
[Comment regions in tokens](../tokens.md#comment-regions-in-tokens) and
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)).
[fixture: flowchart/tokens-string-literal-comment-line] [fixture:
flowchart/lex-directive-in-click-href-string]

A **token** is a maximal run of units of one item and one kind that follow one
another with nothing between them but whitespace units of that item, without the
whitespace at its ends, except the whitespace that mermaid.js reads, at the
start of a style after a `,`, after the name of a subgraph without a title, at
the end of a callback name after `call`, before its `(`, at both ends of the
arguments of a callback, and at the start of the text after the string or the
markdown string that a label, a link text, or a subgraph name starts with (see
[FlowchartStyleStatement](../../../spec/docs/ast/flowchart.md#flowchartstylestatement),
[FlowchartSubgraphStatement](../../../spec/docs/ast/flowchart.md#flowchartsubgraphstatement),
and [Labels](../../../spec/docs/diagrams/flowchart.md#labels)): the label of
`A["x" y]` has the tokens `"x"` and ` y`, and with a directive after the string,
`A["x" %%{init: {}}%% y]`, the tokens `"x"`, a space, the directive, and ` y`.
[fixture: flowchart/gram-label-string-then-text] [fixture:
flowchart/tokens-label-string-then-text-space] [fixture:
flowchart/tokens-label-string-directive-then-text] [fixture:
flowchart/tokens-link-text-string-then-text-space] [fixture:
flowchart/tokens-subgraph-name-string-directive-then-text] The callback name of
`click A call f (x)` has the token `f` with the space after it. [fixture:
flowchart/tokens-callback-name-trailing-space] The arguments of
`click A call f( x, y )` have the token `x, y` with its spaces. [fixture:
flowchart/tokens-callback-arguments-spaces-at-ends] A directive, a comment
region, or an ignored `;` inside such a run cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says, when the run is a `RawText` or a `String` token; inside a run of any other
kind, a directive or an ignored `;` makes the input rejected, also between two
of its units (see
[Directives inside units](../../../spec/docs/diagrams/flowchart.md#directives-inside-units)).
[fixture: flowchart/tokens-directive-label-space-after] [fixture:
flowchart/tokens-comment-region-in-edge-text] [fixture:
common/entity-css-in-string-label] [fixture: flowchart/div-directive-in-id]
[fixture: flowchart/div-ignored-semicolon-in-id] [fixture:
flowchart/div-directive-in-circle-opening] Each unit belongs to one item and has
one kind, so this rule decides every token, and every character that is not
whitespace is in a token or a comment.

- In an `id-list`, each part between two `,` units is an `Identifier` token of
  its own, and each `,` is a `Punctuator`, and so it is with the `click-comma`
  units in the click ids of a click statement: `classDef a,,b fill:red` has the
  tokens `classDef`, `a`, `,`, `,`, `b`, and `fill:red`. [fixture:
  flowchart/db-classdef-names-empty] [fixture:
  flowchart/gram-click-comma-only-href]
- An id is one token even when it consists of several units: `12ab` and `A-b`
  are one `Identifier` each, and so is `日本語`, although each of its characters
  is a `letter` unit. A style such as `stroke-width: 2px` is one `RawText`
  token, and so is a subgraph name such as `a b`. [fixture:
  flowchart/lex-style-value-with-whitespace] [fixture:
  flowchart/spec-flow-singlenode-9075959f] [fixture:
  flowchart/spec-flow-singlenode-c9da1f2e] [fixture:
  flowchart/lex-letter-id-cjk] [fixture:
  flowchart/db-subgraph-title-inner-spaces]
- A string is one unit, from its opening quote to its closing quote, and so one
  `String` token. [fixture: flowchart/gram-label-string-then-text]
- In a click statement, the `call` tokens and the `(` and `)` tokens around the
  arguments belong to the statement and to no field. [fixture:
  flowchart/gram-click-call] [fixture:
  flowchart/gram-click-empty-call-then-arguments]
- The delimiters that open a shape are one token, and so are those that close
  it, also where they are two units: `((` and `))` of a circle and `{{` and `}}`
  of a hexagon are one `Punctuator` token each, like `(((` and `[[`. So a
  directive or an ignored `;` between the two units makes the input rejected, as
  inside any delimiter: `A(%%{init: {}}%%(x))` is rejected at the directive,
  while mermaid.js reads a circle. [fixture:
  flowchart/tokens-circle-hexagon-delimiters] [fixture:
  flowchart/div-directive-in-circle-opening] [fixture:
  flowchart/div-directive-in-hexagon-closing] [fixture:
  flowchart/div-ignored-semicolon-in-circle-opening] [fixture:
  flowchart/gram-circle-gap]
- A `;` that the line rule ignores is an `IgnoredSemicolon` token, and it cuts a
  token that it lies inside (see [Tokens](../tokens.md#tokens)) when that is a
  label, a string, a subgraph name, or a style. `A[x;]` has the label `x;`,
  whose `;` the line rule does not ignore, and it is inside the label's token.
  In `A[mystyle:#x;]` the `;` is ignored, so the label's token is `mystyle:#x`,
  and the `;` after it is an `IgnoredSemicolon` token. A style that it cuts is
  described under
  [FlowchartStyleStatement](../../../spec/docs/ast/flowchart.md#flowchartstylestatement).
  Inside an id, a number, a keyword, an arrow, or another delimiter, it makes
  the input rejected: `A[style:#x] -;-> B` and `A[style:#x] --> B;b` are
  rejected at the `;`. [fixture: flowchart/tokens-label-semicolon] [fixture:
  common/entity-style-in-label] [fixture:
  flowchart/div-ignored-semicolon-in-arrow] [fixture:
  flowchart/div-ignored-semicolon-in-id] [fixture:
  common/entity-css-in-string-label] [fixture:
  flowchart/tokens-style-semicolon-ignored] [fixture:
  flowchart/tokens-style-ignored-semicolon-between-values] [fixture:
  flowchart/tokens-subgraph-name-ignored-semicolon] [fixture:
  flowchart/tokens-subgraph-title-ignored-semicolon] [fixture:
  flowchart/tokens-subgraph-title-string-ignored-semicolon]
- The separator `;` of a statement is not in the range of the statement: a
  statement's range runs from its first to its last token. [fixture:
  flowchart/tokens-diagram-trailing-separator]
- A label that is all whitespace, such as the label of `A[ ]`, `A-->| |B`, or
  `subgraph S[ ]`, has one `RawText` token of that whitespace, as every value of
  whitespace only has (see [Tokens](../tokens.md#tokens)). A style that is all
  whitespace has no token, and it is null in the tree, since the amount of its
  whitespace changes nothing (see
  [FlowchartStyleStatement](../../../spec/docs/ast/flowchart.md#flowchartstylestatement)).
  [fixture: flowchart/gram-label-space] [fixture:
  flowchart/tokens-pipe-label-space] [fixture:
  flowchart/tokens-subgraph-title-space] [fixture:
  flowchart/db-style-whitespace-only-value]
- The text of a data block between `@{` and `}`, its `data-text` and
  `data-quote` units, is one `RawText` token with the whitespace and line feeds
  at its ends, which the value of the
  [FlowchartDataBlock](../../../spec/docs/ast/flowchart.md#flowchartdatablock)
  holds: `A@{ }` has the token of the space, and `A@{`, a line break,
  `shape: rect`, a line break, and `}` the token of a line feed, `shape: rect`,
  and a line feed. [fixture: flowchart/gram-data-block-space-only] [fixture:
  flowchart/gram-data-consecutive-blocks]
