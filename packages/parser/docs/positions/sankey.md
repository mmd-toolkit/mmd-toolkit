# Sankey positions

Japanese version: [sankey.ja.md](./sankey.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/sankey.md`](../../../spec/docs/ast/sankey.md); the tokens
in [tokens/sankey.md](../tokens/sankey.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### SankeyDiagram

The range is that of the node in `Root.body` of every diagram (see
[Node ranges](../positions.md#node-ranges)): from the header keyword to the last
token of the last record. [fixture: sankey/db-link-basic] [fixture:
sankey/db-header-beta]

### SankeyLinkStatement

The range runs from its source to its value, the quotes of a string included;
the spaces around the record and the line feed after it are outside it:
`  a , b , 1` followed by two spaces covers `a , b , 1`. [fixture:
sankey/db-fields-trimmed] [fixture: sankey/db-quoted-fields] [fixture:
sankey/db-spaces-only-source-id-first-record]

### SankeyIdentifier and SankeyLiteral

The range is that of its token, the field without the spaces at its ends, and
the value is the written text of the range: `a` with a space before and after it
covers `a`, and `a b` covers `a b`. A field of spaces only has the empty value
and the range of its spaces, which its one token covers (see
[Tokens](../tokens/sankey.md#tokens)): the target of `a, ,1` covers the space
between the commas. It is the only node of this diagram type whose value is not
the written text of its range: its written text is empty, and the token gives
the node a place. [fixture: sankey/db-fields-trimmed] [fixture:
sankey/db-text-with-spaces] [fixture: sankey/db-spaces-only-source-id] [fixture:
sankey/db-spaces-only-target-id] [fixture: sankey/db-spaces-only-value]
