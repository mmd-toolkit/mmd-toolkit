# Quadrant chart positions

Japanese version: [quadrant.ja.md](./quadrant.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/quadrant.md`](../../../spec/docs/ast/quadrant.md); the
tokens in [tokens/quadrant.md](../tokens/quadrant.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### QuadrantDiagram

The range is that of the node in `Root.body` of every diagram (see
[Node ranges](../positions.md#node-ranges)): from the header keyword to the last
token. [fixture: quadrant/db-point-plain]

### Statements

The range of a statement runs from its first token, its keyword or the name of a
point, to its last token, without the spaces that the keyword, the arrow, and
the `]` of a point read around them. A title with no text covers `title`, an
axis statement that ends with the arrow covers the arrow, and a point covers its
styles: `x-axis L -->` covers the whole line, and
`A: [0.3, 0.6] radius: 10, color: #f00` covers it up to `#f00`. A description
block covers its `}`, over the lines of its text. [fixture:
quadrant/db-title-keyword-alone] [fixture: quadrant/db-x-axis-left-with-arrow]
[fixture: quadrant/db-style-two] [fixture: quadrant/db-acc-descr-block-lines]

### QuadrantLabel

The range runs from its first token to its last, the whitespace between its
words included, and a U+00A0 at its ends too (see
[Tokens](../tokens/quadrant.md#tokens)): `quadrant-1   A  b   ` covers `A  b`.
For a text without quotes, the value is the written text of the range. For a
text that starts with a string or a markdown string, the range runs from its
opening quote, and the value leaves out the quotes and the backquotes:
`quadrant-1 "a" b` covers `"a" b`, with the value `a b`. [fixture:
quadrant/db-quadrant-spaces-trimmed] [fixture:
quadrant/db-quadrant-quoted-then-bare] [fixture: quadrant/db-name-markdown]

### QuadrantLiteral, QuadrantIdentifier, and Identifier

The range is that of the token, without the whitespace that the token leaves out
at its ends, and the value is the written text of the range (see
[Tokens](../tokens/quadrant.md#tokens)): a coordinate covers its characters, a
style and the name of a class cover their text without the whitespace of ASCII
at its ends, `radius: 10` in `] radius: 10, color: #f00`, and a title, an
accessibility text, and the text of a description block cover their text without
the whitespace of Notation at its ends, U+00A0 included, the lines of a
description block between the whitespace after the `{` and the whitespace before
the `}`. [fixture: quadrant/db-point-plain] [fixture: quadrant/db-style-two]
[fixture: quadrant/db-acc-descr-block-lines] [fixture: quadrant/db-class-plain]
[fixture: quadrant/db-classdef-two-styles] [fixture:
quadrant/db-grid-nbsp-classdef-name] [fixture:
quadrant/db-title-nbsp-before-text] [fixture:
quadrant/db-acc-descr-block-nbsp-before-brace-close]
