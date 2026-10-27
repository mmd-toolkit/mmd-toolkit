# Kanban のノード

英語版: [kanban.md](./kanban.md)

この文書は図種 `kanban` の木のノードを定めます。
共通の部分は [ast.ja.md](../ast.ja.md) が定めます。
構文と受理の規則は、
[diagrams/kanban.ja.md](../diagrams/kanban.ja.md) が定めます。

本体は [KanbanDiagram](#kanbandiagram) です。
値は [ノード](../ast.ja.md#ノード) が定める書かれたテキストを保ちます。
変換後の形ではありません。
ノード本文は末尾の空白を保ちます。
[fixture: kanban/db-name-trailing-space]
[fixture: kanban/db-name-space-before-shape]
形のラベル、icon、class、データ本文は行終端を含む内側の空白を保ちます。
[fixture: kanban/db-spaces-label]
[fixture: kanban/lex-icon-spaces]
[fixture: kanban/lex-class-trailing-spaces]
[fixture: kanban/db-metadata-spaces]
[fixture: kanban/lex-string-crlf]

mermaid.js が最終の id とラベル、形の型、
メタデータの効果をどう読むかは、
[tests パッケージの要約](../../../tests/docs/db-summaries.ja.md#kanban)
にあります。

## ノード

### KanbanDiagram

| 欄     | 型                  | 意味                         |
| ------ | ------------------- | ---------------------------- |
| `body` | KanbanNode のリスト | 列。ソースの順。空でもよい。 |

子の欄: `body`。
ヘッダー語は欄ではありません。
body に直接置くのは列のノードだけとし、各列の children は
[字下げと親子](../diagrams/kanban.ja.md#字下げと親子)によるカードです。
両方の役割に同じ KanbanNode 型を使い、カードの children は常に空にします。
人工の根、親への参照、導出した深さは加えません。
[fixture: kanban/db-indent-unindented]
[fixture: kanban/db-indent-tabs]
[fixture: kanban/db-indent-deeper]
[fixture: kanban/db-indent-shallower-last]
[fixture: kanban/db-sections-items]
[fixture: kanban/spec-kanban-d05521ff]
重複した id も、これらのリストに別々の出現として保ちます。
[fixture: kanban/db-section-three-definitions]
[fixture: kanban/db-item-three-definitions]
[fixture: kanban/db-section-item-same-id]
[fixture: kanban/db-metadata-repeated-id]
[fixture: kanban/db-object-prototype-ids]
[fixture: kanban/db-name-case]

ノードのない図は、
ヘッダーの後に空白とコメントがあっても空の body を持ちます。
[fixture: kanban/header-only-lf]
[fixture: kanban/db-empty-board-comment]
[fixture: kanban/db-empty-board-whitespace]
[fixture: kanban/header-header-space-only]

図の範囲はヘッダーから最後の列とその子孫までとし、
空の図ではヘッダーで終わります。
無関係な末尾のコメント・ディレクティブ・空白で範囲を延ばしません。
[fixture: kanban/header-only-lf]
[fixture: kanban/db-empty-board-comment]
[fixture: kanban/db-sections-items]
[fixture: kanban/gram-shallower-then-decoration]

### KanbanNode

ノードはノード本文、ノード本文と形、形だけのどれかです。
[fixture: kanban/db-name-two-words]
[fixture: kanban/db-name-no-id]
[fixture: kanban/db-shape-square]
[fixture: kanban/spec-kanban-46081dfb]
[fixture: kanban/db-name-space-before-shape]
その後にデータブロックと装飾の行が続きます。
[fixture: kanban/db-metadata-all]
[fixture: kanban/db-decoration-icon-item]

| 欄            | 型                                                      | 意味                                       |
| ------------- | ------------------------------------------------------- | ------------------------------------------ |
| `indent`      | 0 以上の整数                                            | 字下げの文字数。                           |
| `id`          | KanbanLiteral か null                                   | ノード本文。形だけなら null。              |
| `shape`       | KanbanShape か null                                     | 形。裸のノード本文なら null。              |
| `data`        | KanbanDataBlock のリスト                                | 書かれたブロック。ソースの順。空でもよい。 |
| `decorations` | （KanbanIconStatement か KanbanClassStatement）のリスト | 次のノードまでの装飾の行。ソースの順。     |
| `children`    | KanbanNode のリスト                                     | 列のカード。カードでは常に空。             |

子の欄: `id`、`shape`、`data`、`decorations`、`children`。
`id` と `shape` が両方 null にはなりません。
形だけなら `id` は null です。
[fixture: kanban/db-name-no-id]
[fixture: kanban/spec-kanban-46081dfb]
裸のノードなら `shape` は null です。
[fixture: kanban/db-name-two-words]
ノード本文と形があれば両方の欄に値を持ちます。
[fixture: kanban/db-shape-square]
[fixture: kanban/db-name-space-before-shape]

字下げはディレクティブを除き、
改行以外の空白文字を各 1 文字と数えます。
[fixture: kanban/db-indent-tabs]
[fixture: kanban/lex-tab-line-start]
[fixture: kanban/lex-bom-line-start]
[fixture: kanban/lex-nbsp-line-start]
[fixture: kanban/lex-ideographic-line-start]
[fixture: kanban/lex-ls-line-start]
[fixture: kanban/lex-ps-line-start]
[fixture: kanban/header-ff-after]
[fixture: kanban/header-vt-after]
[fixture: kanban/header-nel-after]
[fixture: kanban/lex-indent-directive]
ヘッダー行のノードではヘッダーの後の空白を数えます。
[fixture: kanban/header-statement-on-header-line]
[fixture: kanban/header-statement-on-header-line-tab]
コメントを終える U+2028 と U+2029 の後では、
その区切りと後続の空白を数えます。
[fixture: kanban/lex-node-comment-ls]
[fixture: kanban/div-header-comment-ps-node]
[fixture: kanban/lex-indent-comment-ps-semicolon-space]
[fixture: kanban/lex-indent-comment-ls-semicolon-space]
[fixture: kanban/lex-indent-comment-ps-semicolon-touching]
[fixture: kanban/lex-indent-comment-ls-semicolon-touching]
[fixture: kanban/lex-indent-comment-ps-no-semicolon-space]
[fixture: kanban/lex-indent-comment-ps-no-semicolon-touching]
[fixture: kanban/lex-indent-comment-ps-semicolon-wide-tail]
[fixture: kanban/lex-indent-comment-ps-space-after-card]
[fixture: kanban/lex-indent-comment-ps-space-after-column]
[fixture: kanban/lex-indent-comment-ls-space-after-column]
[fixture: kanban/lex-indent-comment-ps-two-spaces-after-card]
[fixture: kanban/lex-indent-comment-ps-after-card-then-column]
[fixture: kanban/lex-indent-comment-ps-zero-baseline]
[fixture: kanban/lex-indent-comment-ps-selected-semicolon-space]
[fixture: kanban/lex-indent-comment-ps-selected-semicolon-touching]
[fixture: kanban/lex-indent-comment-ps-unselected-semicolon-node]
[fixture: kanban/lex-indent-comment-lf-semicolon-space]
[fixture: kanban/lex-indent-comment-crlf-semicolon-space]
[fixture: kanban/lex-indent-comment-ps-common-line]
[fixture: kanban/lex-indent-comment-ps-indent-directive]
[fixture: kanban/lex-indent-comment-ps-tail-directive]
[fixture: kanban/lex-indent-comment-ps-empty-line-before]
[fixture: kanban/lex-indent-comment-ls-selected-semicolon-touching]
[fixture: kanban/lex-indent-comment-ps-tail-directive-touching]
[fixture: kanban/lex-indent-comment-ps-selected-semicolon-indent-directive]

id は末尾の空白を保ち、
`A [text]` の id は `A ` です。
[fixture: kanban/db-name-space-before-shape]
[fixture: kanban/db-name-trailing-space]
ノード本文は空白を許すため KanbanLiteral です。
[fixture: kanban/db-name-two-words]

接尾部がなければ data のリストは空です。
[fixture: kanban/db-shape-square]
接尾部があれば、
空のブロックと隣り合うブロックも含めてブロックごとに 1 ノードを持ちます。
木ではブロックを結合しません。
[fixture: kanban/db-metadata-empty]
[fixture: kanban/db-metadata-adjacent-empty]
[fixture: kanban/db-metadata-two-items]
[fixture: kanban/db-metadata-one-item-reference]

装飾がなければ decorations のリストは空です。
[fixture: kanban/db-shape-square]
装飾があれば、
このノードの後から次のノードまでの icon と class の行をすべて持ちます。
装飾の字下げは飾るノードを変えません。
[fixture: kanban/spec-kanban-382e97e1]
[fixture: kanban/spec-kanban-dc1ceff8]
[fixture: kanban/spec-kanban-3f5b450b]
[fixture: kanban/gram-decoration-then-child]
[fixture: kanban/gram-shallower-then-decoration]
繰り返した装飾も別々に保ちます。
[fixture: kanban/db-decoration-icon-twice]
[fixture: kanban/db-decoration-class-twice]
Db が公開しない class もリストに保ちます。
[fixture: kanban/db-decoration-class-item]

children はソース順とし、カードが無ければ空にします。
カードの後のより深いカードも列の別の子です。
最初の列より浅い最後のカードも同じです。
重複した列やカードも木に一度ずつ残し、
同じ列 id による Db の繰り返す公開を AST の出現の複製にはしません。
[fixture: kanban/db-indent-deeper]
[fixture: kanban/db-indent-shallower-last]
[fixture: kanban/db-section-three-definitions]
[fixture: kanban/db-section-item-same-id]

ノードの範囲はノード本文か形の開きから始めます。
末尾は最後の子孫までとし、子が無ければ自身の最後の装飾、データブロック、
形、ノード本文の順で、存在するものの末尾までにします。
範囲は連続し、兄弟は重なりません。
前置の字下げや無関係な末尾の trivia で範囲を延ばしません。
ノード本文として読む空白は id の葉の内側に残します。
[fixture: kanban/db-name-trailing-space]
[fixture: kanban/db-metadata-all]
[fixture: kanban/gram-decoration-then-child]
[fixture: kanban/gram-nesting-item-decoration-before-deeper-item]
[fixture: kanban/gram-shallower-then-decoration]

### KanbanShape

| 欄       | 型          | 意味                                          |
| -------- | ----------- | --------------------------------------------- |
| `opener` | 文字列      | `-)`、`(-`、`))`、`)`、`((`、`{{`、`(`、`[`。 |
| `closer` | 文字列      | `))`、`)`、`]`、`}}`、`(-`、`-)`、`((`、`(`。 |
| `label`  | KanbanLabel | その間のラベル。                              |

子の欄: `label`。
開きと閉じは書かれた形を保ちます。
[fixture: kanban/db-shape-bang-alt]
[fixture: kanban/db-shape-cloud-alt]
[fixture: kanban/db-shape-bang]
[fixture: kanban/db-shape-cloud]
[fixture: kanban/db-shape-circle]
[fixture: kanban/db-shape-hexagon]
[fixture: kanban/db-shape-round]
[fixture: kanban/db-shape-square]
[fixture: kanban/gram-shape-carryover-doublecircle]
[fixture: kanban/lex-shape-dash-string]
開きと閉じは一致しなくてもよく、
`[text)` は開き `[` と閉じ `)` を持ちます。
[fixture: kanban/db-shape-mismatched]

閉じない形とラベルは拒否します。
[fixture: kanban/gram-unclosed-shape]
[fixture: kanban/gram-unclosed-quote]
[fixture: kanban/gram-unclosed-markdown]
受理した木の形はすべて閉じを持ちます。
`closed` の欄はありません。
[fixture: kanban/db-shape-square]

### KanbanLabel

| 欄      | 型     | 意味                                 |
| ------- | ------ | ------------------------------------ |
| `kind`  | 文字列 | `text`、`string`、`markdown`。       |
| `value` | 文字列 | 文字列の区切りを除いた書かれた本文。 |

子の欄はありません。
`kind` は裸のラベルなら `text`、引用したラベルなら `string`、
markdown ラベルなら `markdown` です。
[fixture: kanban/db-shape-square]
[fixture: kanban/spec-kanban-562eb2dc]
[fixture: kanban/db-markdown-label]
値は引用符と markdown の区切りを除きます。
その中の空白と書かれた行終端を保ちます。
[fixture: kanban/db-label-multiline]
[fixture: kanban/lex-string-crlf]

値は空にはなりません。
[fixture: kanban/gram-empty-label]
[fixture: kanban/gram-empty-quoted-label]
[fixture: kanban/gram-empty-markdown-shape]
空白だけでもかまいません。
[fixture: kanban/gram-whitespace-string]
[fixture: kanban/gram-whitespace-bare-shape]
裸のラベルは引用符で始まりません。
`A[ "x" ]` の kind は `text` で、
値の両端に空白を持ちます。
[fixture: kanban/lex-bare-leading-space-string]

### KanbanIconStatement

| 欄     | 型            | 意味                          |
| ------ | ------------- | ----------------------------- |
| `icon` | KanbanLiteral | `::icon(` と `)` の間の本文。 |

子の欄: `icon`。
本文は空ではありません。
[fixture: kanban/db-decoration-icon-item]
[fixture: kanban/db-decoration-empty-icon]
両端の空白と行終端を保ちます。
[fixture: kanban/lex-icon-spaces]
[fixture: kanban/lex-icon-multiline]
空白だけでもかまいません。
[fixture: kanban/gram-whitespace-icon]

### KanbanClassStatement

| 欄         | 型            | 意味                       |
| ---------- | ------------- | -------------------------- |
| `cssClass` | KanbanLiteral | `:::` の後の行区間の残り。 |

子の欄: `cssClass`。
本文は空ではありません。
[fixture: kanban/db-decoration-class-item]
[fixture: kanban/db-decoration-empty-class]
空白だけの本文も含めて両端の空白を保ちます。
[fixture: kanban/lex-class-trailing-spaces]
[fixture: kanban/gram-whitespace-class]
行区間を終える改行、U+2028、U+2029 は含みません。
[fixture: kanban/lex-class-ls-lf]
[fixture: kanban/gram-grid-ps-item-class]

### KanbanDataBlock

| 欄      | 型     | 意味                            |
| ------- | ------ | ------------------------------- |
| `value` | 文字列 | `@{ ... }` の書かれた本文全体。 |

子の欄はありません。
値は空でもかまいません。
[fixture: kanban/db-metadata-empty]
両端の空白、引用符、行終端、未知のキー、重複キーを書かれたとおりに保ちます。
[fixture: kanban/db-metadata-spaces]
[fixture: kanban/db-metadata-multiline]
[fixture: kanban/db-metadata-unknown-key]
[fixture: kanban/db-metadata-proto-key]
[fixture: kanban/gram-metadata-ticket-duplicate]
[fixture: kanban/db-metadata-whitespace]
[fixture: kanban/db-metadata-unknown-reference]
[fixture: kanban/db-metadata-double-line-space]
[fixture: kanban/db-metadata-single-line-space]
YAML の子と型の検査はありません。
[fixture: kanban/gram-metadata-bad-yaml]
[fixture: kanban/gram-metadata-empty-multiline]

ブロックごとに KanbanDataBlock を 1 つ持ちます。
[fixture: kanban/db-metadata-adjacent-empty]
`A@{ticket: X,}@{assigned: Ada}` は 2 つのデータノードを持ちます。
[fixture: kanban/db-metadata-two-items]
`A@{ticket: X,assigned: Ada}` は 1 つを持ちます。
[fixture: kanban/db-metadata-one-item-reference]
隣り合うブロックが 1 つのメタデータの効果を作る手順は、
tests パッケージが定めます。

### KanbanLiteral

| 欄      | 型     | 意味               |
| ------- | ------ | ------------------ |
| `value` | 文字列 | 書かれたテキスト。 |

子の欄はありません。
ノード本文、icon、class は各位置が空白を許すため、
Identifier ではなく KanbanLiteral です。
[fixture: kanban/db-name-two-words]
[fixture: kanban/lex-icon-spaces]
[fixture: kanban/lex-class-trailing-spaces]
ノード本文の末尾の空白を含め、
その単位が読む空白をすべて保ちます。
[fixture: kanban/db-name-space-before-shape]
[fixture: kanban/db-name-trailing-space]

## 例

この記述例は、二段の木を示すため不揃いな字下げを保っています。
Diagram.body は S、S.children は A・B・C を持ちます。
三つのカードの children は空で、B は A の子ではありません。
[fixture: kanban/db-indent-deeper]

```mmd
kanban
 S
   A
     B
   C
```
