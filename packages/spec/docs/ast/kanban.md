# Kanban nodes

Japanese version: [kanban.ja.md](./kanban.ja.md)

This document defines the nodes of the tree for the diagram type `kanban`. The
shared parts are defined in [ast.md](../ast.md). The syntax and acceptance rules
are defined in [diagrams/kanban.md](../diagrams/kanban.md).

The body is a [KanbanDiagram](#kanbandiagram). Values keep the written text
defined under [Nodes](../ast.md#nodes). They are not in converted form. Node
text keeps trailing whitespace. [fixture: kanban/db-name-trailing-space]
[fixture: kanban/db-name-space-before-shape] Shape labels, icons, classes, and
data content keep their interior whitespace, including line terminators.
[fixture: kanban/db-spaces-label] [fixture: kanban/lex-icon-spaces] [fixture:
kanban/lex-class-trailing-spaces] [fixture: kanban/db-metadata-spaces] [fixture:
kanban/lex-string-crlf]

How mermaid.js reads section membership, final ids and labels, shape types, and
metadata effects is in the
[tests package summary](../../../tests/docs/db-summaries.md#kanban).

## Nodes

### KanbanDiagram

| Field  | Type               | Meaning                                           |
| ------ | ------------------ | ------------------------------------------------- |
| `body` | list of KanbanNode | The written nodes, in source order; may be empty. |

Child fields: `body`. The header keyword is not a field. Indentation does not
nest nodes. Deeper rows stay in the flat list. [fixture:
kanban/db-indent-unindented] [fixture: kanban/db-indent-tabs] [fixture:
kanban/db-indent-deeper] [fixture: kanban/db-indent-shallower-last] [fixture:
kanban/db-sections-items] [fixture: kanban/spec-kanban-d05521ff] Repeated ids
also stay in the list. [fixture: kanban/db-section-three-definitions] [fixture:
kanban/db-item-three-definitions] [fixture: kanban/db-section-item-same-id]
[fixture: kanban/db-metadata-repeated-id] [fixture:
kanban/db-object-prototype-ids] [fixture: kanban/db-name-case]

A board without nodes has an empty body, also with whitespace and comments after
the header. [fixture: kanban/header-only-lf] [fixture:
kanban/db-empty-board-comment] [fixture: kanban/db-empty-board-whitespace]
[fixture: kanban/header-header-space-only]

### KanbanNode

A node is node text, node text with a shape, or a shape alone. [fixture:
kanban/db-name-two-words] [fixture: kanban/db-name-no-id] [fixture:
kanban/db-shape-square] [fixture: kanban/spec-kanban-46081dfb] [fixture:
kanban/db-name-space-before-shape] Its data blocks and decoration lines follow
it. [fixture: kanban/db-metadata-all] [fixture: kanban/db-decoration-icon-item]

| Field         | Type                                                  | Meaning                                                     |
| ------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| `indent`      | nonnegative integer                                   | The number of indentation characters.                       |
| `id`          | KanbanLiteral or null                                 | The node text; null for a shape alone.                      |
| `shape`       | KanbanShape or null                                   | The shape; null for bare node text.                         |
| `data`        | list of KanbanDataBlock                               | The written blocks, in source order; may be empty.          |
| `decorations` | list of (KanbanIconStatement or KanbanClassStatement) | The decoration lines before the next node, in source order. |

Child fields: `id`, `shape`, `data`, `decorations`. `id` and `shape` are not
both null. A shape alone has `id` null. [fixture: kanban/db-name-no-id]
[fixture: kanban/spec-kanban-46081dfb] A bare node has `shape` null. [fixture:
kanban/db-name-two-words] A node text with a shape has both fields set.
[fixture: kanban/db-shape-square] [fixture: kanban/db-name-space-before-shape]

Indentation counts every whitespace character other than a line feed once, with
directives left out. [fixture: kanban/db-indent-tabs] [fixture:
kanban/lex-tab-line-start] [fixture: kanban/lex-bom-line-start] [fixture:
kanban/lex-nbsp-line-start] [fixture: kanban/lex-ideographic-line-start]
[fixture: kanban/lex-ls-line-start] [fixture: kanban/lex-ps-line-start]
[fixture: kanban/header-ff-after] [fixture: kanban/header-vt-after] [fixture:
kanban/header-nel-after] [fixture: kanban/lex-indent-directive] For a node on
the header line, it counts whitespace after the header. [fixture:
kanban/header-statement-on-header-line] [fixture:
kanban/header-statement-on-header-line-tab] After a comment-ending U+2028 or
U+2029, it counts that separator and the following whitespace. [fixture:
kanban/lex-node-comment-ls] [fixture: kanban/div-header-comment-ps-node]

The id keeps its trailing whitespace: `A [text]` has the id `A `. [fixture:
kanban/db-name-space-before-shape] [fixture: kanban/db-name-trailing-space] It
is a KanbanLiteral because node text allows whitespace. [fixture:
kanban/db-name-two-words]

The data list is empty when no suffix is written. [fixture:
kanban/db-shape-square] Otherwise it holds one node per block, including empty
and adjacent blocks. The blocks are not merged in the tree. [fixture:
kanban/db-metadata-empty] [fixture: kanban/db-metadata-adjacent-empty] [fixture:
kanban/db-metadata-two-items] [fixture: kanban/db-metadata-one-item-reference]

The decorations list is empty when none is written. [fixture:
kanban/db-shape-square] Otherwise it holds every icon and class line after this
node and before the next node. Their indentation does not change which node they
decorate. [fixture: kanban/spec-kanban-382e97e1] [fixture:
kanban/spec-kanban-dc1ceff8] [fixture: kanban/spec-kanban-3f5b450b] [fixture:
kanban/gram-decoration-then-child] [fixture:
kanban/gram-shallower-then-decoration] Repeated decorations remain separate.
[fixture: kanban/db-decoration-icon-twice] [fixture:
kanban/db-decoration-class-twice] Classes that the Db does not expose also
remain in the list. [fixture: kanban/db-decoration-class-item]

### KanbanShape

| Field    | Type        | Meaning                                         |
| -------- | ----------- | ----------------------------------------------- |
| `opener` | string      | `-)`, `(-`, `))`, `)`, `((`, `{{`, `(`, or `[`. |
| `closer` | string      | `))`, `)`, `]`, `}}`, `(-`, `-)`, `((`, or `(`. |
| `label`  | KanbanLabel | The label between them.                         |

Child fields: `label`. The opener and closer keep their written forms. [fixture:
kanban/db-shape-bang-alt] [fixture: kanban/db-shape-cloud-alt] [fixture:
kanban/db-shape-bang] [fixture: kanban/db-shape-cloud] [fixture:
kanban/db-shape-circle] [fixture: kanban/db-shape-hexagon] [fixture:
kanban/db-shape-round] [fixture: kanban/db-shape-square] [fixture:
kanban/gram-shape-carryover-doublecircle] [fixture:
kanban/lex-shape-dash-string] They need not match: `[text)` has opener `[` and
closer `)`. [fixture: kanban/db-shape-mismatched]

An unclosed shape or label is rejected. [fixture: kanban/gram-unclosed-shape]
[fixture: kanban/gram-unclosed-quote] [fixture: kanban/gram-unclosed-markdown]
Every shape in an accepted tree has its closer. There is no `closed` field.
[fixture: kanban/db-shape-square]

### KanbanLabel

| Field   | Type   | Meaning                                      |
| ------- | ------ | -------------------------------------------- |
| `kind`  | string | `text`, `string`, or `markdown`.             |
| `value` | string | The written text, without string delimiters. |

No child fields. `kind` is `text` for a bare label, `string` for a quoted label,
and `markdown` for a markdown label. [fixture: kanban/db-shape-square] [fixture:
kanban/spec-kanban-562eb2dc] [fixture: kanban/db-markdown-label] The value
excludes quotes and markdown delimiters. It keeps whitespace and written line
terminators inside them. [fixture: kanban/db-label-multiline] [fixture:
kanban/lex-string-crlf]

The value is never empty. [fixture: kanban/gram-empty-label] [fixture:
kanban/gram-empty-quoted-label] [fixture: kanban/gram-empty-markdown-shape] It
may be whitespace only. [fixture: kanban/gram-whitespace-string] [fixture:
kanban/gram-whitespace-bare-shape] A bare label never starts with a quote.
`A[ "x" ]` has kind `text` and a space at each end of its value. [fixture:
kanban/lex-bare-leading-space-string]

### KanbanIconStatement

| Field  | Type          | Meaning                             |
| ------ | ------------- | ----------------------------------- |
| `icon` | KanbanLiteral | The text between `::icon(` and `)`. |

Child fields: `icon`. The text is nonempty. [fixture:
kanban/db-decoration-icon-item] [fixture: kanban/db-decoration-empty-icon] It
keeps whitespace at both ends and any line terminators. [fixture:
kanban/lex-icon-spaces] [fixture: kanban/lex-icon-multiline] It may be
whitespace only. [fixture: kanban/gram-whitespace-icon]

### KanbanClassStatement

| Field      | Type          | Meaning                                   |
| ---------- | ------------- | ----------------------------------------- |
| `cssClass` | KanbanLiteral | The rest of the line segment after `:::`. |

Child fields: `cssClass`. The text is nonempty. [fixture:
kanban/db-decoration-class-item] [fixture: kanban/db-decoration-empty-class] It
keeps whitespace at both ends, including whitespace-only content. [fixture:
kanban/lex-class-trailing-spaces] [fixture: kanban/gram-whitespace-class] It
excludes the line feed, U+2028, or U+2029 that ends its line segment. [fixture:
kanban/lex-class-ls-lf] [fixture: kanban/gram-grid-ps-item-class]

### KanbanDataBlock

| Field   | Type   | Meaning                                   |
| ------- | ------ | ----------------------------------------- |
| `value` | string | The whole written interior of `@{ ... }`. |

No child fields. The value may be empty. [fixture: kanban/db-metadata-empty] It
keeps whitespace at both ends, quotes, line terminators, unknown keys, and
duplicate keys as written. [fixture: kanban/db-metadata-spaces] [fixture:
kanban/db-metadata-multiline] [fixture: kanban/db-metadata-unknown-key]
[fixture: kanban/db-metadata-proto-key] [fixture:
kanban/gram-metadata-ticket-duplicate] [fixture: kanban/db-metadata-whitespace]
[fixture: kanban/db-metadata-unknown-reference] [fixture:
kanban/db-metadata-double-line-space] [fixture:
kanban/db-metadata-single-line-space] It has no YAML children or type
validation. [fixture: kanban/gram-metadata-bad-yaml] [fixture:
kanban/gram-metadata-empty-multiline]

There is one KanbanDataBlock per block. [fixture:
kanban/db-metadata-adjacent-empty] `A@{ticket: X,}@{assigned: Ada}` has two data
nodes. [fixture: kanban/db-metadata-two-items] `A@{ticket: X,assigned: Ada}` has
one. [fixture: kanban/db-metadata-one-item-reference] The tests package defines
how adjacent blocks give one combined metadata effect.

### KanbanLiteral

| Field   | Type   | Meaning           |
| ------- | ------ | ----------------- |
| `value` | string | Its written text. |

No child fields. A node text, icon, or class is a KanbanLiteral rather than an
Identifier because each position allows whitespace. [fixture:
kanban/db-name-two-words] [fixture: kanban/lex-icon-spaces] [fixture:
kanban/lex-class-trailing-spaces] It keeps all whitespace its unit reads,
including trailing whitespace in node text. [fixture:
kanban/db-name-space-before-shape] [fixture: kanban/db-name-trailing-space]
