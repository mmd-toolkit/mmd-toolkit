# Mindmap のノード

英語版: [mindmap.md](./mindmap.md)

この文書は、図種 `mindmap` の木のノードを定めます。
木の共通部分は [ast.ja.md](../ast.ja.md) で定め、
ソースの読み方と、どの文法の規則がどのノードを作るかは
[diagrams/mindmap.ja.md](../diagrams/mindmap.ja.md) で定めます。

この図種の本体は [MindmapDiagram](#mindmapdiagram) です。
欄の値は、
[ast.ja.md](../ast.ja.md#ノード)が値の書かれたテキストを定めるとおり、
書き手が書いたものを保ち、
[common.ja.md](../common.ja.md#ソースの読み方) の変換後の形ではありません。
この図種では、mermaid.js が読むとおり、
値はその単位が読む両端の空白を保ちます。
ノードのテキストは終わりの空白を、
icon、class、形のテキストは両端の空白を保ちます
（[単位と文脈](../diagrams/mindmap.ja.md#単位と文脈) を参照）。
形の中の文字列と markdown 文字列は常に閉じていて空ではなく、
label も空ではありません。
閉じていない文字列と、空の文字列や空の markdown 文字列は、入力を拒否させます
（[空の形](../diagrams/mindmap.ja.md#空の形) を参照）。
[fixture: mindmap/db-node-trailing-whitespace] [fixture:
mindmap/db-class-trailing-space] [fixture:
mindmap/db-icon-surrounding-whitespace] [fixture:
mindmap/lex-string-unclosed] [fixture: mindmap/gram-empty-string-shape]
[fixture: mindmap/div-empty-string-in-shape]

**ノード**はマインドマップの箱で、字下げを付けてそれだけの行に書きます。
字下げが木を作ります。
最初のノードが根で、ほかのノードは、
その前にある最も近い、字下げの小さいノードの子です。
**icon** の行と **class** の行は、その前に最後に書かれたノードを飾ります。

## ノード

### MindmapDiagram

| 欄     | 型                  | 意味                                      |
| ------ | ------------------- | ----------------------------------------- |
| `root` | MindmapNode か null | 最初のノード、つまり根。ないときは null。 |

子の欄: `root`。ヘッダーのキーワードは欄ではありません。
ノードのない図は、ヘッダーの後に空行やコメントがあっても、根 null を持ちます。
[fixture: mindmap/db-header-only] [fixture:
mindmap/db-header-then-comment-line-only] [fixture:
mindmap/db-first-node-unindented]

### MindmapNode

ノードです。
ノードのテキスト、ノードのテキストと形、または形だけで、
それを飾る icon と class の行と、その下のノードを持ちます。
`root`、`a(text)`、`((circle))` です。

| 欄            | 型                                                        | 意味                                                                        |
| ------------- | --------------------------------------------------------- | --------------------------------------------------------------------------- |
| `indent`      | number                                                    | その行でノードの前にある空白文字の数。                                      |
| `id`          | MindmapLiteral か null                                    | ノードのテキスト。形の前のもの、または形のないノード全体。形だけなら null。 |
| `shape`       | MindmapShape か null                                      | 形。ないときは null。                                                       |
| `decorations` | （MindmapIconStatement か MindmapClassStatement）のリスト | ノードの後、次のノードの前にある icon と class の行。ソースの順。           |
| `children`    | MindmapNode のリスト                                      | このノードが親であるノード。ソースの順。                                    |

子の欄: `id`、`shape`、`decorations`、`children`。
字下げは、改行以外の空白文字を 1 つずつ数え、タブも U+3000 も 1 つです。
ディレクティブを除いたテキストで数えます。
ヘッダーの行にある根では、ヘッダーの後の空白です。
ノードの子は、
その前にある最も近い、字下げの小さいノードがこのノードであるノードです
（[字下げと親](../diagrams/mindmap.ja.md#字下げと親) を参照）。
`root`、`    a`、`  b`、`    c` の 4 行では、
a と b が根の子で、c は b の子です。
ノードの decorations は、そのノードの行と次のノードの行の間にある
icon と class の行で、字下げにはよりません。
mermaid.js が最後に足したノードにそれらを与えるからです。
`id` は終わりの空白を保ちます。`a (x)` の id は `a ` です。
[fixture: mindmap/db-indent-tab-levels] [fixture:
mindmap/db-indent-fullwidth-space] [fixture:
mindmap/lex-indent-around-directive] [fixture:
mindmap/db-first-node-on-header-line] [fixture: mindmap/db-indent-root-offset]
[fixture: mindmap/gram-indent-between-earlier-levels] [fixture:
mindmap/db-indent-sibling-after-deeper] [fixture:
mindmap/db-icon-indent-ignored] [fixture: mindmap/gram-icon-then-child]
[fixture: mindmap/gram-node-text-space-before-shape] [fixture:
mindmap/db-shape-without-id]

### MindmapShape

ノードの形です。
開き、label、閉じで、`(text)`、`[text]`、`))text((` などです。

| 欄       | 型           | 意味                                          |
| -------- | ------------ | --------------------------------------------- |
| `opener` | string       | `(`、`((`、`[`、`{{`、`)`、`))`、`(-`、`-)`。 |
| `closer` | string       | `)`、`))`、`]`、`}}`、`(`、`((`、`(-`、`-)`。 |
| `label`  | MindmapLabel | その間のテキスト、文字列、markdown 文字列。   |

子の欄: `label`。
閉じは開きに合わなくてかまいません。
`[text)` は開き `[` と閉じ `)` を持ちます。
mermaid.js がそれらから形の種類をどう読むかは、tests パッケージの要約にあります
（[ノードと形](../diagrams/mindmap.ja.md#ノードと形) を参照）。
[fixture: mindmap/db-shape-rect] [fixture: mindmap/db-shape-rounded] [fixture:
mindmap/db-shape-circle] [fixture: mindmap/db-shape-cloud] [fixture:
mindmap/db-shape-bang] [fixture: mindmap/db-shape-hexagon] [fixture:
mindmap/db-shape-mismatched-end] [fixture:
mindmap/gram-shape-round-other-closer] [fixture:
mindmap/db-shape-cloud-dash-form] [fixture:
mindmap/gram-shape-dash-opener-without-id]

### MindmapLabel

形のテキストです。

| 欄      | 型     | 意味                                                                             |
| ------- | ------ | -------------------------------------------------------------------------------- |
| `kind`  | string | `text`、`string`、`markdown`。                                                   |
| `value` | string | テキストではその書かれたテキスト、文字列と markdown 文字列では区切りの間の中身。 |

子の欄はありません。
テキストは改行を含めて空白を保ち、文字列は引用符の間にあるものを保ちます。
markdown 文字列の中身は `` "` `` と `` `" `` の間です。
値は空にならず、テキストは `"` で始まりません。
開きの直後の `"` は文字列か markdown 文字列を始めるからです
（[形の文脈](../diagrams/mindmap.ja.md#形の文脈) を参照）。
`a[ "x" ]` は、両端に空白のあるテキスト `"x"` を持ちます。
[fixture: mindmap/db-shape-rect] [fixture: mindmap/gram-shape-text-line-feed]
[fixture: mindmap/gram-shape-text-quoted-with-space] [fixture:
mindmap/db-shape-string] [fixture: mindmap/lex-string-line-feed] [fixture:
mindmap/db-shape-markdown-string] [fixture: mindmap/db-shape-empty-description]

### MindmapIconStatement

icon の行です。`::icon(fa fa-book)` です。

| 欄     | 型             | 意味                              |
| ------ | -------------- | --------------------------------- |
| `icon` | MindmapLiteral | `::icon(` と `)` の間のテキスト。 |

子の欄: `icon`。
テキストは両端の空白を保ち、行をまたげます。
空の icon は入力を拒否させるので、空になりません。
[fixture: mindmap/db-icon-line] [fixture:
mindmap/db-icon-surrounding-whitespace]
[fixture: mindmap/gram-icon-line-feed] [fixture: mindmap/db-icon-empty]

### MindmapClassStatement

class の行です。`:::big red` です。

| 欄         | 型             | 意味                     |
| ---------- | -------------- | ------------------------ |
| `cssClass` | MindmapLiteral | `:::` の後の、行の残り。 |

子の欄: `cssClass`。
テキストは両端の空白を保ちます。
空の class の行は入力を拒否させるので、空になりません。
[fixture: mindmap/db-class-line] [fixture: mindmap/db-class-leading-whitespace]
[fixture: mindmap/db-class-trailing-space] [fixture: mindmap/db-class-empty]

### MindmapLiteral

空白を含みうる引用符なしのテキストです。
ノードのテキスト、icon、class です。

| 欄      | 型     | 意味                                                           |
| ------- | ------ | -------------------------------------------------------------- |
| `value` | string | その書かれたテキスト（[ノード](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
[Identifier](../ast.ja.md#identifier) ではありません。
ほかのノードはそれを参照せず、文字の間に空白を持てるからです。
[fixture: mindmap/db-node-trailing-whitespace] [fixture:
mindmap/lex-keyword-inside-node-text] [fixture: mindmap/db-icon-line]
