# Mindmap の位置

英語版: [mindmap.md](./mindmap.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは
[positions.ja.md](../positions.ja.md) にあります。
ノードは仕様の [`ast/mindmap.ja.md`](../../../spec/docs/ast/mindmap.ja.md) が、
トークンは [tokens/mindmap.ja.md](../tokens/mindmap.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### MindmapDiagram

範囲は、どの図の `Root.body` のノードとも同じ定めに従います
（[ノードの範囲](../positions.ja.md#ノードの範囲) を参照）。

### MindmapNode

範囲は、ノードの最初のトークン、つまりノードのテキストか opener から、
最後の子孫と最後の飾りのうち後にあるものの、最後のトークンまでです。
ノードは、その下のノードと飾りの行を覆い、前の字下げは覆いません。
`root`、`::icon(x)` の行、`  a` の行では、
根は 3 つの行を `root` から `a` まで覆い、ノード `a` は `a` を覆います。
`root`、`    a`、`      b`、`    c` の 4 行では、
ノード `a` は、`a`、改行、字下げ、`b` を覆います。
[fixture: mindmap/gram-icon-then-child]
[fixture: mindmap/db-indent-sibling-after-deeper]
[fixture: mindmap/db-first-node-on-header-line]

### MindmapShape、MindmapIconStatement、MindmapClassStatement

形は opener から closer まで、icon の行は `::icon(` から `)` までです。
class の行は、`:::` から class の終わりまでです。
トークンが残す class の終わりの空白も含みます。
`:::a b` と 2 つの空白は、2 つの空白も覆います。
[fixture: mindmap/db-shape-rect]
[fixture: mindmap/db-icon-line]
[fixture: mindmap/db-class-trailing-space]

### MindmapLabel と MindmapLiteral

範囲はそのトークンの範囲で、トークンが残す両端の空白を含みます
（[トークン](../tokens/mindmap.ja.md#トークン) を参照）。
文字列や markdown 文字列の範囲は区切りを含み、
値は区切りの間の中身です。
``r["`**bold** text`"]`` のラベルは ``"`**bold** text`"`` を覆い、
値は `**bold** text` です。
ディレクティブが区切りを切るところでも同じです。
ノードのテキスト、形のテキスト、icon、class の値は、
その範囲の書かれたテキストです。
[fixture: mindmap/db-shape-markdown-string]
[fixture: mindmap/lex-directive-between-backquote-and-quote]
[fixture: mindmap/db-node-trailing-whitespace]
