# XY chart positions

Japanese version: [xychart.ja.md](./xychart.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/xychart.md`](../../../spec/docs/ast/xychart.md); the
tokens in [tokens/xychart.md](../tokens/xychart.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### XychartDiagram

The range is that of the node in `Root.body` of every diagram (see
[Node ranges](../positions.md#node-ranges)): from the first header keyword to
the last token. [fixture: xychart/db-orientation-capitalized] [fixture:
xychart/header-twice]

### XychartHeader

The range runs from the header keyword to its orientation, or covers the keyword
when there is no orientation: `xychart-beta Horizontal` covers the whole line.
[fixture: xychart/db-orientation-capitalized] [fixture: xychart/header-twice]

### Statements

The range of a statement runs from its keyword to its last token, over the lines
between them. An `accTitle:` or an `accDescr:` without a text covers the keyword
and the `:`, and one whose text is on a later line covers the lines up to that
text. A description block covers its `}`, and one that is not closed ends at its
text, or at its `{` when it has none. [fixture: xychart/db-x-axis-band-title]
[fixture: xychart/db-acc-title-empty] [fixture:
xychart/db-acc-title-takes-next-line] [fixture: xychart/db-acc-descr-block]
[fixture: xychart/db-acc-descr-unclosed-block] [fixture:
xychart/db-acc-descr-unclosed-empty-block-spaces]

### XychartBand, XychartRange, and XychartValue

An XychartBand runs from its `[` to its `]`, an XychartRange from its first
number to its second, and an XychartValue from its number to its label, or
covers the number when there is no label: the first value of `[1 "a", 2]` covers
`1 "a"`. [fixture: xychart/db-x-axis-band-title] [fixture:
xychart/db-x-axis-range] [fixture: xychart/db-label-one]

### XychartLiteral

The range runs from its first token to its last. For a text without quotes, it
runs from its first word to its last, the whitespace between them included, so
that the value, which leaves that whitespace out, is shorter than the range:
`title Two words` covers `Two words`, with the value `Twowords`. For the text of
an accessibility statement, it covers the text without the whitespace at its
ends, the line feeds of a description block included. [fixture:
xychart/db-title-bare-words] [fixture: xychart/db-acc-title-spaces-trimmed]
[fixture: xychart/db-acc-descr-block]
