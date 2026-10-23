# Kanban tokens

Japanese version: [kanban.ja.md](./kanban.ja.md)

This document defines the kanban tokens. The nodes are defined in
[`ast/kanban.md`](../../../spec/docs/ast/kanban.md); shared token rules are in
[tokens.md](../tokens.md).

## Tokens

The units of
[Lexical structure](../../../spec/docs/diagrams/kanban.md#lexical-structure)
give these grammar items and token kinds:

| Kind         | Items                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `header`; `::icon(`                                                                                                             |
| `Punctuator` | `opener`; `closer`; `:::`; the `)` of an icon; `data-start` and the `}` of a data block                                         |
| `RawText`    | `node-text`; `shape-text`; `icon-text`; `class-text`; the `data-text` and `data-quote` units of a data block, together one item |
| `String`     | `string` and `markdown-string`, including their delimiters                                                                      |

[fixture: kanban/db-shape-square] [fixture: kanban/db-decoration-icon-item]
[fixture: kanban/db-decoration-class-item] [fixture: kanban/db-metadata-all]
[fixture: kanban/spec-kanban-562eb2dc] [fixture: kanban/db-markdown-label]

Each listed unit is one item, except the units between the `data-start` and the
`}` of a data block, which are one `RawText` item together, as in a flowchart:
the `data-text` units and the `data-quote` units around a quoted part, also one
around `}` or `^`, make one `RawText` token for the whole interior. An empty
interior makes no token; a whitespace-only interior makes a `RawText` token of
that whitespace. Adjacent data blocks keep separate tokens. No `Identifier` or
`Numeric` items are used. [fixture: kanban/db-metadata-empty] [fixture:
kanban/db-metadata-whitespace] [fixture: kanban/db-metadata-quotes-empty]
[fixture: kanban/db-metadata-quoted-brace] [fixture:
kanban/db-metadata-double-caret] [fixture: kanban/db-metadata-two-items]

Indentation and statement-context whitespace make no tokens. Node text keeps its
trailing whitespace. Shape text, icon text, class text, and data interiors keep
all whitespace they read, including whitespace-only values. A class ends before
its line-segment separator. Line feeds in labels, icons, and data remain inside
their tokens, with the original CRLF or CR spelling. [fixture:
kanban/db-indent-tabs] [fixture: kanban/db-name-trailing-space] [fixture:
kanban/gram-whitespace-bare-shape] [fixture: kanban/gram-whitespace-icon]
[fixture: kanban/gram-whitespace-class] [fixture: kanban/lex-class-ls-lf]
[fixture: kanban/db-metadata-spaces] [fixture: kanban/lex-string-crlf] [fixture:
kanban/lex-icon-multiline] [fixture: kanban/db-metadata-multiline]

Directives, comment regions, and the semicolon selected by the common line rule
cut `RawText` and `String` items under the
[shared rules](../tokens.md#a-token-that-a-directive-cuts). A cut `String`
becomes `StringFragment` tokens. The data interior remains `RawText`, including
its quotes. A cut inside a keyword or delimiter rejects the input. The common
part records `Directive` and `IgnoredSemicolon` tokens and comments; the kanban
lexer adds diagram comments beginning at a unit-start `%%`. [fixture:
kanban/db-grid-directive-item-id] [fixture:
kanban/db-grid-directive-item-label-markdown] [fixture:
kanban/db-grid-directive-item-icon] [fixture:
kanban/db-grid-directive-item-class] [fixture:
kanban/db-grid-directive-metadata-key] [fixture: kanban/lex-comment-quoted-line]
[fixture: kanban/db-metadata-comment-line] [fixture: kanban/lex-id-style-rule]
[fixture: kanban/lex-label-style-rule] [fixture: kanban/lex-metadata-style-rule]
[fixture: kanban/div-directive-data-marker] [fixture:
kanban/div-directive-opener] [fixture: kanban/div-semicolon-closer] [fixture:
kanban/lex-after-shape-comment]
