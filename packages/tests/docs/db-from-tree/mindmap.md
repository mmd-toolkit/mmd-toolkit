# Building the mindmap Db from the tree

Japanese version: [mindmap.ja.md](./mindmap.ja.md)

The steps that build the Db summary of a mindmap diagram from its tree, which
`src/db-from-tree/mindmap.ts` implements (see
[db-from-tree.md](../db-from-tree.md)). The syntax and the tree are defined by
the specification in
[diagrams/mindmap.md](../../../spec/docs/diagrams/mindmap.md) and
[ast/mindmap.md](../../../spec/docs/ast/mindmap.md); the fields of the summary
are in [db-summaries.md](../db-summaries.md#mindmap).

mermaid.js builds the Db while it parses: the grammar calls a method of the Db
for each line that holds a node, an icon, or a class
([`statement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L99-L108),
[`node`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L112-L126)),
and the Db keeps what the methods are given
([`addNode`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L75-L125),
[`getParent`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L62-L69),
[`getType`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L127-L145),
[`decorateNode`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L154-L167)).
The summary is built the same way, with one difference: the Db searches the
nodes added before for the parent of a node, while the tree already holds each
node under its parent, so the builder does not search (see **Parents**). The
nodes are visited in the order in which the Db adds them, a node before the
nodes below it. Values are kept as the Db holds them, whitespace included. The
summary is the tree that `getMindmap()` returns (see
[db-summaries.md](../db-summaries.md#mindmap)), so each node of the tree is one
node of the summary.

## Building the summary from the tree

**Converted form.** Each value is read in
[converted form](../../../spec/docs/common.md#reading-a-source), so an entity is
its placeholder in a node text, in the text of a shape, in an icon, and in a
class: `a#amp; b` is the node text of `a`, the placeholder, and ` b`, and a
numeric entity has its own placeholder. The same form has each line terminator,
`\r\n` and a lone `\r` too, as `\n`, in a string, a markdown string, the text of
a shape, and an icon, and each attribute quote as `'`, in a node text, the text
of a shape, an icon, and a class. [fixture:
mindmap/entity-placeholder-in-node-text] [fixture:
mindmap/entity-placeholder-numeric] [fixture:
mindmap/entity-placeholder-in-description] [fixture:
mindmap/entity-placeholder-in-icon] [fixture:
mindmap/entity-placeholder-in-class] [fixture: mindmap/lex-string-crlf]
[fixture: mindmap/lex-string-lone-cr] [fixture: mindmap/lex-shape-text-crlf]
[fixture: mindmap/lex-markdown-string-crlf] [fixture: mindmap/lex-icon-crlf]
[fixture: mindmap/lex-html-attribute-quote-in-description] [fixture:
mindmap/lex-html-attribute-quote-in-node-text] [fixture:
mindmap/lex-html-attribute-quote-in-icon] [fixture:
mindmap/lex-html-attribute-quote-in-class] [fixture: mindmap/db-crlf-line-ends]
[fixture: mindmap/db-lone-cr-line-ends]

**Texts.** The text of a leaf node of the tree is read as follows.

- A MindmapLiteral has the converted form of its range. Its `value` is the
  written text, which the tree keeps, and the Db has the text as mermaid.js
  reads it. A node text keeps the whitespace at its end, and so does the node
  text before a shape: `a (x)` has the id `a `. An icon and a class keep the
  whitespace at both ends. [fixture: mindmap/db-node-trailing-whitespace]
  [fixture: mindmap/gram-node-text-space-before-shape] [fixture:
  mindmap/db-icon-surrounding-whitespace] [fixture:
  mindmap/db-class-leading-whitespace] [fixture:
  mindmap/db-class-trailing-space]
- A MindmapLabel has the converted form of its range, which includes the
  delimiters of a string, `"` at each end, and of a markdown string, `` "` ``
  and `` `" ``. The builder cuts the delimiters from the converted form, one
  character at each end for a string and two for a markdown string, so that a
  directive inside a delimiter does not move the cut. A text keeps all its
  whitespace and its line feeds, and a string keeps what lies between its
  quotes. [fixture: mindmap/db-shape-string] [fixture:
  mindmap/db-shape-markdown-string] [fixture:
  mindmap/docs-syntax-mindmap-d3468819] [fixture:
  mindmap/gram-shape-text-line-feed] [fixture:
  mindmap/gram-shape-text-quoted-with-space] [fixture:
  mindmap/lex-string-line-feed] [fixture: mindmap/lex-markdown-string-line-feed]
- A directive inside a text unit is not in the converted form, and so not in the
  text: `a%%{init: {}}%%b` is the node `ab`, `::icon(a%%{init: {}}%%b)` has the
  icon `ab`, `:::a%%{init: {}}%%b` the class `ab`, and `a[x%%{init: {}}%%y]` and
  `a["x%%{init: {}}%%y"]` the text `xy`. A directive at the end of a node text
  is no part of it. [fixture: mindmap/lex-directive-in-node-text] [fixture:
  mindmap/lex-directive-in-icon] [fixture: mindmap/lex-directive-in-class]
  [fixture: mindmap/lex-directive-in-shape-text] [fixture:
  mindmap/lex-directive-in-string] [fixture:
  mindmap/lex-directive-between-quote-and-backquote] [fixture:
  mindmap/lex-directive-between-backquote-and-quote] [fixture:
  mindmap/lex-directive-after-node-text-trailing-spaces] [fixture:
  mindmap/lex-directive-in-icon-with-spaces] [fixture:
  mindmap/lex-directive-in-shape-text-with-spaces] [fixture:
  mindmap/db-directive-after-node-text]
- A `;` that the line rule ignores is not in the converted form either, inside a
  text: `style:#x;y` is the node `style:#xy`, and `a[style:#x;y]` has the text
  `style:#xy`. [fixture: mindmap/tokens-ignored-semicolon-in-node-text]
  [fixture: mindmap/tokens-ignored-semicolon-in-shape-text]

**The root.** The summary has one field, `root`. It is `null` for a diagram
without a node, also when whitespace or comment lines follow the header, and
otherwise the summary of the root of the tree. The frontmatter changes nothing,
and the diagram keeps no title. [fixture: mindmap/db-header-only] [fixture:
mindmap/db-header-only-trailing-spaces] [fixture:
mindmap/db-header-then-comment-line-only] [fixture:
mindmap/db-frontmatter-before-header]

**Parents.** The Db adds the nodes in source order and gives a node to the
nearest node before it with a smaller level, so a node as indented as an earlier
one follows the nodes below that one. The tree holds each node as a child of the
node that the Db would choose (see
[Indentation and parents](../../../spec/docs/diagrams/mindmap.md#indentation-and-parents)),
and the builder takes the children of a node from the tree, in source order,
without comparing levels. Two nodes with the same text are two nodes. [fixture:
mindmap/db-indent-parent-is-nearest-shallower] [fixture:
mindmap/db-indent-sibling-after-deeper] [fixture:
mindmap/gram-indent-between-earlier-levels] [fixture:
mindmap/db-same-text-twice] [fixture: mindmap/demo-mindmap-34332335]

**Levels.** The `level` of a node is its `indent` less the `indent` of the root,
so the root has the level 0 whatever its indentation, and a node on the line of
the header is the root with the whitespace after the header as its indentation.
The tree has counted the whitespace characters, each as one (see
[ast/mindmap.md](../../../spec/docs/ast/mindmap.md#mindmapnode)), so a tab and a
U+3000 are one character each. A child may be indented by any number of
characters more than its parent, and its level is that number plus the level of
the parent. [fixture: mindmap/db-first-node-unindented] [fixture:
mindmap/db-indent-root-offset] [fixture: mindmap/db-first-node-on-header-line]
[fixture: mindmap/db-first-node-on-header-line-wide-gap] [fixture:
mindmap/db-first-node-after-header-tab] [fixture: mindmap/db-indent-tab-levels]
[fixture: mindmap/db-indent-fullwidth-space] [fixture:
mindmap/db-indent-skips-levels] [fixture: mindmap/lex-indent-around-directive]

**Texts of a node.** `nodeId` and `descr` come from the `id` and the `shape` of
the node. A node without a shape has its node text as both. A node with a node
text and a shape has the node text as `nodeId` and the text of the label as
`descr`. A shape alone has the text of its label as both. [fixture:
mindmap/db-first-node-unindented] [fixture: mindmap/db-shape-rect] [fixture:
mindmap/db-shape-without-id] [fixture: mindmap/db-shape-without-id-circle]
[fixture: mindmap/gram-shape-dash-opener-without-id]

**Types.** `type` is 0 for a node without a shape. For a shape it comes from the
opener: `[` gives 2, `((` gives 3, `)` gives 4, `))` gives 5, `{{` gives 6, and
`(-` and `-)` give 0. For `(` it comes from the closer too: 1 with `)`, and 4
with any other closer. The closer decides nothing for the other openers, so
`[text)` is 2 and `((x)` is 3. [fixture: mindmap/db-shape-rect] [fixture:
mindmap/db-shape-rounded] [fixture: mindmap/db-shape-circle] [fixture:
mindmap/db-shape-cloud] [fixture: mindmap/db-shape-bang] [fixture:
mindmap/db-shape-hexagon] [fixture: mindmap/db-shape-cloud-dash-form] [fixture:
mindmap/db-shape-explode-dash-form] [fixture: mindmap/db-shape-mismatched-end]
[fixture: mindmap/gram-shape-round-other-closer] [fixture:
mindmap/gram-shape-round-double-closer] [fixture:
mindmap/gram-shape-circle-single-closer] [fixture:
mindmap/gram-strings-in-round-and-circle] [fixture:
mindmap/db-shape-round-open-circle-close] [fixture:
mindmap/db-shape-round-open-brace-close] [fixture:
mindmap/db-shape-round-string-dash-close] [fixture:
mindmap/db-shape-cloud-open-rect-close] [fixture:
mindmap/db-shape-bang-open-rect-close] [fixture:
mindmap/db-shape-hexagon-open-rect-close] [fixture:
mindmap/db-shape-dash-open-rect-close] [fixture:
mindmap/db-shape-id-ending-dash-then-cloud-rect-close]

**Decorations.** The icon and class lines in the `decorations` of a node are the
lines that the Db gives to that node, since it gives them to the node added
last. `icon` is the text of the last icon line, and `class` the text of the last
class line, so a second line of a kind replaces the first; a node without such a
line has no `icon` or `class` in the summary. An icon line and a class line are
independent, and the case of the word `icon` does not matter. [fixture:
mindmap/db-icon-line] [fixture: mindmap/db-class-line] [fixture:
mindmap/db-icon-twice] [fixture: mindmap/db-class-twice] [fixture:
mindmap/db-icon-and-class-on-child] [fixture: mindmap/db-icon-indent-ignored]
[fixture: mindmap/gram-icon-then-child] [fixture:
mindmap/db-icon-case-insensitive] [fixture: mindmap/db-class-then-icon-on-node]

**The summary.** A node of the summary has `nodeId`, `level`, `descr`, `type`,
and `children`, and `icon` and `class` where a decoration gave them, as in
[db-summaries.md](../db-summaries.md#mindmap).

## The replacement of characters

The Db passes four texts of a node through `sanitizeText`: the id, the
description, the icon, and the class. `mindmapDbOf()` applies the replacement
`textReplacementOf(embedded.config)` of
[db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) to these,
which are all the texts of the summary. A node without a shape, and a shape
alone, have one text for `nodeId` and `descr`, which is replaced once for each.
[fixture: mindmap/config-security-level-other-texts] [fixture:
mindmap/config-security-level-other-html-labels-false] [fixture:
mindmap/config-security-level-other-shape-only]
