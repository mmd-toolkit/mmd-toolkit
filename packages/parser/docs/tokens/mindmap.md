# Mindmap tokens

Japanese version: [mindmap.ja.md](./mindmap.ja.md)

This document defines the tokens of the diagram type `mindmap` in the tree that
`@mmd-toolkit/parser` produces. The nodes are defined by the specification in
[`ast/mindmap.md`](../../../spec/docs/ast/mindmap.md); the tokens shared by all
diagram types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/mindmap.md](../../../spec/docs/diagrams/mindmap.md#lexical-structure).
Every unit that is not all whitespace belongs to one **item** of
[the grammar](../../../spec/docs/diagrams/mindmap.md#grammar) and has the kind
that this table gives for the item:

| Kind         | Items and their units                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | a `header` unit; an `::icon(` unit                                                                                                                                             |
| `RawText`    | the text units of [Directives inside units](../../../spec/docs/diagrams/mindmap.md#directives-inside-units): a `node-text`, a `shape-text`, an `icon-text`, and a `class-text` |
| `String`     | the string units of [Directives inside units](../../../spec/docs/diagrams/mindmap.md#directives-inside-units): a `string` and a `markdown-string`, with their delimiters       |
| `Punctuator` | a `:::` unit and the `)` unit of an icon line; an `opener` and a `closer` unit                                                                                                 |

[fixture: mindmap/db-header-only] [fixture: mindmap/db-icon-line] [fixture:
mindmap/db-class-line] [fixture: mindmap/db-shape-rect] [fixture:
mindmap/db-shape-string] [fixture: mindmap/db-shape-markdown-string]

Every item is one unit, and so one **token**: `r["text with ( paren"]` has the
`RawText` token `r`, the `Punctuator` tokens `[` and `]`, and the `String` token
`"text with ( paren"`, its quotes included, and `::icon(fa fa-book)` has the
`Keyword` token `::icon(`, the `RawText` token `fa fa-book`, and the
`Punctuator` token `)`. [fixture: mindmap/db-shape-string] [fixture:
mindmap/db-icon-line]

A token holds no whitespace at its ends, except where mermaid.js reads it as
part of a value (see [Tokens](../tokens.md#tokens)). Every text unit keeps the
whitespace that it reads, which mermaid.js keeps in the value, and its token
keeps it too: a node text the whitespace at its end, as `root` followed by three
spaces, whose token is `root` and the three spaces, and a shape text, an icon,
and a class the whitespace at both ends, as `a[ "x" ]`, whose shape text is a
space, `"x"`, and a space, `::icon( x )`, whose icon is a space, `x`, and a
space, and `:::  x`, whose class is two spaces and `x`. A shape text holds the
line feeds inside it: `a[x`, a line break, and `y]` has the token `x`, the line
break, and `y`. [fixture: mindmap/db-node-trailing-whitespace] [fixture:
mindmap/gram-shape-text-quoted-with-space] [fixture:
mindmap/db-icon-surrounding-whitespace] [fixture:
mindmap/db-class-leading-whitespace] [fixture:
mindmap/gram-shape-text-line-feed]

A directive, a comment region, or a `;` that the line rule ignores inside a
`RawText` or a `String` token cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says, and a cut `String` token becomes `StringFragment` tokens; inside a token
of any other kind, a directive or an ignored `;` makes the input rejected (see
[Directives inside units](../../../spec/docs/diagrams/mindmap.md#directives-inside-units)):
`a%%{init: {}}%%b` has the `RawText` tokens `a` and `b` with the `Directive`
token between them, and ``r["`a%%{init: {}}%%b`"]`` the `StringFragment` tokens
``"`a`` and ``b`"``, while `a(%%{init: {}}%%(x))`, whose directive lies inside
the opener `((`, is rejected. A directive between the two characters of a
delimiter of a markdown string cuts its token as well:
``a["`x`%%{init: {}}%%"]`` has the `StringFragment` tokens `` "`x` `` and `"`.
[fixture: mindmap/lex-directive-in-node-text] [fixture:
mindmap/lex-directive-in-markdown-string] [fixture:
mindmap/div-directive-in-opener] [fixture:
mindmap/lex-directive-between-backquote-and-quote]

A `;` that the line rule ignores is an `IgnoredSemicolon` token: the node text
`style:#x;y` has the `RawText` tokens `style:#x` and `y` with the
`IgnoredSemicolon` token between them. [fixture:
mindmap/tokens-ignored-semicolon-in-node-text]
