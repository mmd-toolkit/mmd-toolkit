# ER positions

Japanese version: [er.ja.md](./er.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/er.md`](../../../spec/docs/ast/er.md); the tokens in
[tokens/er.md](../tokens/er.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### ErDiagram

The range is that of the node in `Root.body` of every diagram (see
[Node ranges](../positions.md#node-ranges)).

### ErRelationship

Each cardinality and the line are tokens of their own; the range runs from the
first to the last, over the whitespace between them: in `A || -- o{ B : has`, it
runs from `||` to `o{`. [fixture: er/lex-relationship-spaces-in-spec]

### ErSubgraphStatement

The range runs from `subgraph` to `end`; the whitespace that the `end` unit
reads after the keyword is outside it. [fixture:
er/lex-end-blank-line-then-name]

### ErDirectionStatement

The range covers the whole direction line, from its first token to its last.
[fixture: er/lex-direction-line-text-before] [fixture:
er/lex-direction-line-text-after]

### ErLiteral

The range of a style runs from its first token to its last, over the whitespace
between them, which its value leaves out: in `classDef a fill : #f9f`, it covers
`fill : #f9f`, and the value is `fill:#f9f`. [fixture:
er/lex-classdef-style-spaces]

### ErIgnoredText

The range of a run of `empty-backquotes` units runs from the first to the last,
and its value is the written text of that range, the whitespace between them
included. [fixture: er/gram-empty-backquotes-twice] [fixture:
er/gram-empty-backquotes-run-across-line-feed] [fixture:
er/gram-empty-backquotes-run-across-comment-line] [fixture:
er/gram-empty-backquotes-run-across-directive]
