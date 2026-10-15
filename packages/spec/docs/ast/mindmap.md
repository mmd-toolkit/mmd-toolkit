# Mindmap nodes

Japanese version: [mindmap.ja.md](./mindmap.ja.md)

This document defines the nodes of the tree for the diagram type `mindmap`. The
shared parts of the tree are defined in [ast.md](../ast.md); how the source is
read, and which grammar rule makes which node, is defined in
[diagrams/mindmap.md](../diagrams/mindmap.md).

The body of this diagram type is a [MindmapDiagram](#mindmapdiagram). The values
of the fields keep what the author wrote, as [ast.md](../ast.md#nodes) defines
the written text of a value; they are not in the converted form of
[common.md](../common.md#reading-a-source). In this diagram type, a value keeps
the whitespace at its ends where its unit reads it, as mermaid.js reads it: a
node text keeps the whitespace at its end, and an icon, a class, and the text of
a shape keep the whitespace at both ends (see
[Units and contexts](../diagrams/mindmap.md#units-and-contexts)). A string or a
markdown string in a shape is always closed and never empty, and a label is
never empty: an unclosed string, and an empty string or an empty markdown
string, make the input rejected (see
[Empty forms](../diagrams/mindmap.md#empty-forms)). [fixture:
mindmap/db-node-trailing-whitespace] [fixture: mindmap/db-class-trailing-space]
[fixture: mindmap/db-icon-surrounding-whitespace] [fixture:
mindmap/lex-string-unclosed] [fixture: mindmap/gram-empty-string-shape]
[fixture: mindmap/div-empty-string-in-shape]

A **node** is a box of the mindmap, written on a line of its own with its
indentation; the indentation makes the tree: the first node is the root, and
each other node is a child of the nearest node before it that is less indented.
An **icon** line and a **class** line decorate the node written last before
them.

## Nodes

### MindmapDiagram

| Field  | Type                | Meaning                                            |
| ------ | ------------------- | -------------------------------------------------- |
| `root` | MindmapNode or null | The first node, the root; null when there is none. |

Child fields: `root`. The header keyword is not a field. A diagram without nodes
has the root null, also with empty lines or comments after the header. [fixture:
mindmap/db-header-only] [fixture: mindmap/db-header-then-comment-line-only]
[fixture: mindmap/db-first-node-unindented]

### MindmapNode

A node: a node text, a node text and a shape, or a shape alone, with the icon
and class lines that decorate it and the nodes below it: `root`, `a(text)`,
`((circle))`.

| Field         | Type                                                    | Meaning                                                                                     |
| ------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `indent`      | number                                                  | The number of whitespace characters before the node on its line.                            |
| `id`          | MindmapLiteral or null                                  | The node text: before the shape, or the whole node without a shape; null for a shape alone. |
| `shape`       | MindmapShape or null                                    | The shape; null when there is none.                                                         |
| `decorations` | list of (MindmapIconStatement or MindmapClassStatement) | The icon and class lines after the node and before the next node, in source order.          |
| `children`    | list of MindmapNode                                     | The nodes whose parent it is, in source order.                                              |

Child fields: `id`, `shape`, `decorations`, `children`. The indentation counts
every whitespace character other than a line feed as one, a tab and a U+3000
included, in the text without its directives; for a root on the line of the
header, it is the whitespace after the header. The Db reads the level of a node
as its `indent` minus that of the root. The children of a node are the nodes
whose nearest earlier node with a smaller indentation is this one (see
[Indentation and parents](../diagrams/mindmap.md#indentation-and-parents)): in
`root`, `    a`, `  b`, `    c` on four lines, a and b are children of the root
and c a child of b. The decorations of a node are the icon and class lines
between its line and the next node line, whatever their indentation, because
mermaid.js gives them to the node it added last. The `id` keeps the whitespace
at its end: `a (x)` has the id `a `. The Db reads a shape alone with the text of
its label as the id. [fixture: mindmap/db-indent-tab-levels] [fixture:
mindmap/db-indent-fullwidth-space] [fixture:
mindmap/lex-indent-around-directive] [fixture:
mindmap/db-first-node-on-header-line] [fixture: mindmap/db-indent-root-offset]
[fixture: mindmap/gram-indent-between-earlier-levels] [fixture:
mindmap/db-indent-sibling-after-deeper] [fixture:
mindmap/db-icon-indent-ignored] [fixture: mindmap/gram-icon-then-child]
[fixture: mindmap/gram-node-text-space-before-shape] [fixture:
mindmap/db-shape-without-id]

### MindmapShape

The shape of a node: an opener, a label, and a closer, such as `(text)`,
`[text]`, and `))text((`.

| Field    | Type         | Meaning                                            |
| -------- | ------------ | -------------------------------------------------- |
| `opener` | string       | `(`, `((`, `[`, `{{`, `)`, `))`, `(-`, or `-)`.    |
| `closer` | string       | `)`, `))`, `]`, `}}`, `(`, `((`, `(-`, or `-)`.    |
| `label`  | MindmapLabel | The text, string, or markdown string between them. |

Child fields: `label`. The closer need not match the opener: `[text)` is a
rectangle. The Db reads the type of the shape from the opener, and for `(` from
the closer: `[` is a rectangle, `((` a circle, `)` a cloud, `))` a bang, `{{` a
hexagon, `(` with `)` a rounded rectangle and with any other closer a cloud, and
`(-` and `-)` the default shape (see
[Nodes and shapes](../diagrams/mindmap.md#nodes-and-shapes)). [fixture:
mindmap/db-shape-rect] [fixture: mindmap/db-shape-rounded] [fixture:
mindmap/db-shape-circle] [fixture: mindmap/db-shape-cloud] [fixture:
mindmap/db-shape-bang] [fixture: mindmap/db-shape-hexagon] [fixture:
mindmap/db-shape-mismatched-end] [fixture:
mindmap/gram-shape-round-other-closer] [fixture:
mindmap/db-shape-cloud-dash-form] [fixture:
mindmap/gram-shape-dash-opener-without-id]

### MindmapLabel

The text of a shape.

| Field   | Type   | Meaning                                                                                              |
| ------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `kind`  | string | `text`, `string`, or `markdown`.                                                                     |
| `value` | string | For a text, its written text; for a string or a markdown string, its content between its delimiters. |

No child fields. A text keeps its whitespace, line feeds included, and a string
keeps what lies between its quotes; the content of a markdown string lies
between `` "` `` and `` `" ``. The value is never empty, and a text never starts
with `"`: a `"` right after the opener starts a string or a markdown string (see
[The shape context](../diagrams/mindmap.md#the-shape-context)), so `a[ "x" ]`
has the text `"x"` with a space at each end. [fixture: mindmap/db-shape-rect]
[fixture: mindmap/gram-shape-text-line-feed] [fixture:
mindmap/gram-shape-text-quoted-with-space] [fixture: mindmap/db-shape-string]
[fixture: mindmap/lex-string-line-feed] [fixture:
mindmap/db-shape-markdown-string] [fixture: mindmap/db-shape-empty-description]

### MindmapIconStatement

An icon line: `::icon(fa fa-book)`.

| Field  | Type           | Meaning                             |
| ------ | -------------- | ----------------------------------- |
| `icon` | MindmapLiteral | The text between `::icon(` and `)`. |

Child fields: `icon`. The text keeps the whitespace at its ends and may go over
lines; it is never empty, as an empty icon makes the input rejected. [fixture:
mindmap/db-icon-line] [fixture: mindmap/db-icon-surrounding-whitespace]
[fixture: mindmap/gram-icon-line-feed] [fixture: mindmap/db-icon-empty]

### MindmapClassStatement

A class line: `:::big red`.

| Field      | Type           | Meaning                           |
| ---------- | -------------- | --------------------------------- |
| `cssClass` | MindmapLiteral | The rest of the line after `:::`. |

Child fields: `cssClass`. The text keeps the whitespace at its ends; it is never
empty, as an empty class line makes the input rejected. The Db reads it as one
class string, spaces included. [fixture: mindmap/db-class-line] [fixture:
mindmap/db-class-leading-whitespace] [fixture: mindmap/db-class-trailing-space]
[fixture: mindmap/db-class-empty]

### MindmapLiteral

A text without quotes that may contain whitespace: a node text, an icon, and a
class.

| Field   | Type   | Meaning                                          |
| ------- | ------ | ------------------------------------------------ |
| `value` | string | Its written text (see [Nodes](../ast.md#nodes)). |

No child fields. It is no [Identifier](../ast.md#identifier): no other node
refers to it, and it may hold whitespace between its characters. [fixture:
mindmap/db-node-trailing-whitespace] [fixture:
mindmap/lex-keyword-inside-node-text] [fixture: mindmap/db-icon-line]
