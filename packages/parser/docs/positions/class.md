# Class positions

Japanese version: [class.ja.md](./class.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/class.md`](../../../spec/docs/ast/class.md); the tokens
in [tokens/class.md](../tokens/class.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### ClassDiagram

The range runs from the header keyword to the last token of the diagram text
other than a `Directive` or an `IgnoredSemicolon` token, the tokens that belong
to no statement included, as for the node in `Root.body` of every diagram (see
[Nodes](../../../spec/docs/ast.md#nodes)).

### ClassArrow

Each relation end and the line are tokens of their own; the range of the arrow
runs from the first to the last. [fixture: class/gram-relation-spaces]

### ClassDirectionStatement

The range covers the whole direction line.

### ClassAnnotation

The range runs from `<<` to `>>`.

### ClassLiteral

Where a text of only whitespace is a value, as in `class A~ ~` and `<<  >>` in a
body, it has a token of that whitespace. [fixture: class/tokens-generic-blank]
[fixture: class/tokens-annotation-blank]
