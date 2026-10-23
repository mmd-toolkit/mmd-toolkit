# Kanban positions

Japanese version: [kanban.ja.md](./kanban.ja.md)

These ranges supplement [positions.md](../positions.md). The nodes are defined
in [`ast/kanban.md`](../../../spec/docs/ast/kanban.md), and the tokens in
[tokens/kanban.md](../tokens/kanban.md).

## Ranges

### KanbanDiagram

The diagram runs from its header keyword to its last diagram token. An empty
board covers just its header. Trailing comments, directives, and whitespace are
outside the range. [fixture: kanban/header-only-lf] [fixture:
kanban/db-empty-board-comment] [fixture: kanban/db-empty-board-whitespace]
[fixture: kanban/header-header-space-directive-only]

### KanbanNode

A node runs from its node text or shape opener to its last data block or last
decoration, when present. Its indentation is outside its range; its trailing
node-text whitespace is inside. Later nodes remain separate siblings, whatever
their indentation. [fixture: kanban/db-name-trailing-space] [fixture:
kanban/db-name-no-id] [fixture: kanban/db-name-space-before-shape] [fixture:
kanban/db-metadata-all] [fixture: kanban/db-metadata-two-items] [fixture:
kanban/gram-decoration-then-child] [fixture: kanban/db-indent-deeper]

### KanbanShape, KanbanIconStatement, and KanbanClassStatement

A shape covers its opener through its closer. An icon statement covers `::icon(`
through `)`. A class statement covers `:::` through its class text, including
trailing whitespace, before the line-segment separator. [fixture:
kanban/db-shape-square] [fixture: kanban/db-shape-mismatched] [fixture:
kanban/db-decoration-icon-item] [fixture: kanban/lex-icon-multiline] [fixture:
kanban/lex-class-trailing-spaces] [fixture: kanban/lex-class-ls-lf]

### KanbanLabel and KanbanLiteral

Each covers its text item's range, including whitespace that its token keeps. A
string or markdown label includes its delimiters in its range, while its value
excludes them. Values keep written line terminators, attribute quotes, and
entities. Directives and comment regions inside the range are left out of values
under the shared rules. [fixture: kanban/db-spaces-label] [fixture:
kanban/lex-icon-spaces] [fixture: kanban/lex-class-trailing-spaces] [fixture:
kanban/db-markdown-label] [fixture: kanban/lex-string-crlf] [fixture:
kanban/db-grid-html-attribute-item-label-quoted] [fixture:
kanban/db-grid-entity-item-label-quoted] [fixture:
kanban/db-grid-directive-item-label-markdown] [fixture:
kanban/lex-comment-quoted-line]

### KanbanDataBlock

Each block covers its `@{` through its `}`. Its value is the whole written
interior, whitespace included, without the delimiters. Empty and adjacent blocks
keep separate ranges. Directives, comment regions, and ignored semicolons inside
the range are left out of its value. [fixture: kanban/db-metadata-empty]
[fixture: kanban/db-metadata-adjacent-empty] [fixture:
kanban/db-metadata-spaces] [fixture: kanban/db-metadata-multiline] [fixture:
kanban/db-metadata-directive] [fixture: kanban/db-metadata-comment-line]
[fixture: kanban/lex-metadata-style-rule]
