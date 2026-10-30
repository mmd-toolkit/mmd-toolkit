# Flowchart positions

Japanese version: [flowchart.ja.md](./flowchart.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/flowchart.md`](../../../spec/docs/ast/flowchart.md); the
tokens in [tokens/flowchart.md](../tokens/flowchart.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### FlowchartDiagram

The range is that of the node in `Root.body` of every diagram (see
[Node ranges](../positions.md#node-ranges)).

### FlowchartEmptyStatement

Its range is that of its `;`. [fixture:
flowchart/gram-empty-statement-top-level]

### FlowchartVertex

The range of a vertex covers its data blocks: it runs from its id to its last
data block, when there is one, and so do the ranges of the vertex group and the
vertex statement that contain it. [fixture:
flowchart/gram-data-consecutive-blocks]

### FlowchartShapeProperty

Its range runs from the name to the value; the `|` around them are not part of
it. [fixture: flowchart/gram-rect-property]

### FlowchartLink

The range runs from the first token of the link to the last token of its target.
[fixture: flowchart/gram-edge-id]

### FlowchartArrow

Its range is its token, the arrow without the whitespace that its unit holds
around it. [fixture: flowchart/lex-directive-after-arrow] A directive or an
ignored `;` inside an arrow makes the input rejected, so no arrow has more than
one token (see [Tokens](../tokens.md#tokens)). [fixture:
flowchart/div-ignored-semicolon-in-arrow] [fixture:
flowchart/div-directive-in-arrow-length]

### FlowchartOpeningArrow

Its range is its token, as for [FlowchartArrow](#flowchartarrow). [fixture:
flowchart/db-arrow-dash-head-length] A directive or an ignored `;` inside an
opening arrow makes the input rejected, as inside an arrow. [fixture:
flowchart/div-ignored-semicolon-in-opening-arrow] [fixture:
flowchart/div-directive-in-opening-arrow]

### FlowchartLabel

A label that is all whitespace has the one `RawText` token of that whitespace
(see [the flowchart tokens](../tokens/flowchart.md#tokens)), and its range is
that token. [fixture: flowchart/gram-label-space]

### FlowchartLiteral

Its tokens are `RawText` tokens: one, or more when directives between its units
cut the text (see
[common.md](../../../spec/docs/common.md#a-directive-is-a-token-boundary)).
[fixture: flowchart/lex-acc-title-space-before-colon] [fixture:
flowchart/lex-directive-in-title] A literal always has a token.

### FlowchartDataBlock

Unlike the frontmatter, the block has no separate range for its value: the value
lies in the block's tokens. [fixture: flowchart/gram-data-block-space-only]

### FlowchartIgnoredText

Its tokens are `RawText` tokens: one, or more when directives cut the text, as
in `A-%%{init: {}}%%->B direction LR`, whose text before `direction` is `A-->B`.
[fixture: flowchart/lex-direction-line-after-directive-in-text] Its range runs
from its first token to its last.

### FlowchartSubgraphStatement

Without a title, the tokens and the range of the name run over the whitespace
after it; after a string, that whitespace is a `RawText` token of its own, as in
`subgraph "S"` followed by a space. [fixture:
flowchart/db-subgraph-name-space-before-empty-description-block] [fixture:
flowchart/db-subgraph-string-name-trailing-space] Where empty description blocks
follow the name right after it, the whitespace between them, or between the last
of them and a `;`, belongs to no token. [fixture:
flowchart/db-subgraph-name-space-between-empty-description-blocks] [fixture:
flowchart/db-subgraph-name-space-after-empty-description-block-before-semicolon]

### FlowchartStyleStatement

A `;` that the line rule ignores cuts a style: `style A fill:#f00;` followed by
two spaces has the style token `fill:#f00` and then the `IgnoredSemicolon`
token, with the two spaces outside both, and the one style of
`style A fill:#f00;stroke:#0f0` has two tokens. A directive cuts it in the same
way: in `style A fill:#f00, %%{init: {}}%%` followed by two spaces and
`stroke:#333`, the first token of the second style is the space before the
directive. [fixture: flowchart/tokens-style-ignored-semicolon-then-spaces]
[fixture: flowchart/tokens-style-directive-after-comma] [fixture:
flowchart/tokens-style-ignored-semicolon-between-values]

### FlowchartClickUrlStatement

The range of a click statement of either type starts at the `click` unit that
entered the click context in which its click ids were read, the unit with which
the grammar of the statement starts. That `click` is a `Keyword` token in the
range, and it belongs to no field. [fixture: flowchart/gram-click-href]
[fixture: flowchart/gram-click-call]

### FlowchartDirectionStatement

The range covers the whole direction line, and so the ranges of both texts.
[fixture: flowchart/lex-direction-line-in-label]
