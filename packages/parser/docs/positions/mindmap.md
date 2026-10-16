# Mindmap positions

Japanese version: [mindmap.ja.md](./mindmap.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/mindmap.md`](../../../spec/docs/ast/mindmap.md); the
tokens in [tokens/mindmap.md](../tokens/mindmap.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### MindmapDiagram

The range is that of the node in `Root.body` of every diagram (see
[Node ranges](../positions.md#node-ranges)).

### MindmapNode

The range runs from the first token of the node, its node text or its opener, to
the last token of its last descendant or of its last decoration, whichever comes
last: the node covers the lines of the nodes and the decorations below it, and
not the indentation before it. In `root`, a line `::icon(x)`, and a line `  a`,
the root covers the three lines, from `root` to `a`, and the node `a` covers
`a`; in `root`, `    a`, `      b`, and `    c` on four lines, the node `a`
covers `a`, the line break, the indentation, and `b`. [fixture:
mindmap/gram-icon-then-child] [fixture: mindmap/db-indent-sibling-after-deeper]
[fixture: mindmap/db-first-node-on-header-line]

### MindmapShape, MindmapIconStatement, and MindmapClassStatement

A shape runs from its opener to its closer, and an icon line from `::icon(` to
its `)`. A class line runs from `:::` to the end of its class, the whitespace at
the end of the class included, which the token keeps: `:::a b` followed by two
spaces covers the two spaces. [fixture: mindmap/db-shape-rect] [fixture:
mindmap/db-icon-line] [fixture: mindmap/db-class-trailing-space]

### MindmapLabel and MindmapLiteral

The range is that of its token, with the whitespace at its ends that the token
keeps (see [Tokens](../tokens/mindmap.md#tokens)). The range of a string or a
markdown string holds its delimiters, while its value is its content between
them: ``r["`**bold** text`"]`` has the label that covers ``"`**bold** text`"``
with the value `**bold** text`, also where a directive cuts a delimiter. The
value of a node text, a shape text, an icon, and a class is the written text of
its range. [fixture: mindmap/db-shape-markdown-string] [fixture:
mindmap/lex-directive-between-backquote-and-quote] [fixture:
mindmap/db-node-trailing-whitespace]
