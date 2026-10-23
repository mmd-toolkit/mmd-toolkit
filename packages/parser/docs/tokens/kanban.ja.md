# kanban のトークン

英語版: [kanban.md](./kanban.md)

kanban のトークンを定めます。
ノードは [`ast/kanban.md`](../../../spec/docs/ast/kanban.ja.md)、
共通のトークンの規則は [tokens.md](../tokens.ja.md) にあります。

## トークン

[字句構造](../../../spec/docs/diagrams/kanban.ja.md#字句構造) の単位から、
次の文法の項目とトークンの種類を作ります。

| 種類         | 項目                                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `header`、`::icon(`                                                                                                          |
| `Punctuator` | `opener`、`closer`、`:::`、icon の `)`、データブロックの `data-start` と `}`                                                 |
| `RawText`    | `node-text`、`shape-text`、`icon-text`、`class-text`、データブロックの `data-text` と `data-quote` の単位（合わせて 1 項目） |
| `String`     | 区切りを含む `string` と `markdown-string`                                                                                   |

[fixture: kanban/db-shape-square] [fixture: kanban/db-decoration-icon-item]
[fixture: kanban/db-decoration-class-item] [fixture: kanban/db-metadata-all]
[fixture: kanban/spec-kanban-562eb2dc] [fixture: kanban/db-markdown-label]

各単位は 1 項目です。
ただし、データブロックの `data-start` と `}` の間の単位は、
flowchart と同じく、合わせて 1 つの `RawText` 項目です。
`data-text` の単位と、引用された部分を囲む `data-quote` の単位は、
`}` や `^` を囲んでいても、内部全体で 1 つの `RawText` トークンになります。
空の内部はトークンを作りません。
空白だけの内部は、その空白の `RawText` トークンを作ります。
隣り合うデータブロックは別々のトークンを保ちます。
`Identifier` と `Numeric` の項目は使いません。
[fixture: kanban/db-metadata-empty] [fixture: kanban/db-metadata-whitespace]
[fixture: kanban/db-metadata-quotes-empty]
[fixture: kanban/db-metadata-quoted-brace]
[fixture: kanban/db-metadata-double-caret]
[fixture: kanban/db-metadata-two-items]

インデントと文の文脈の空白はトークンを作りません。
ノード本文は末尾の空白を保ちます。
形の本文、icon、class、データの内部は、
空白だけの値も含め、読んだ空白を保ちます。
class は行区間の区切りの前で終わります。
ラベル、icon、データの中の改行は、元の CRLF や CR の綴りでトークンに残ります。
[fixture: kanban/db-indent-tabs] [fixture: kanban/db-name-trailing-space]
[fixture: kanban/gram-whitespace-bare-shape]
[fixture: kanban/gram-whitespace-icon] [fixture: kanban/gram-whitespace-class]
[fixture: kanban/lex-class-ls-lf] [fixture: kanban/db-metadata-spaces]
[fixture: kanban/lex-string-crlf] [fixture: kanban/lex-icon-multiline]
[fixture: kanban/db-metadata-multiline]

ディレクティブ、コメント領域、共通の行の規則が選んだセミコロンは、
[共通の規則](../tokens.ja.md#ディレクティブが切るトークン) に従い、
`RawText` と `String` の項目を切ります。
切れた `String` は `StringFragment` のトークンになります。
データの内部は引用符も含めて `RawText` のままです。
キーワードや区切りの内側の切れ目は入力を拒否します。
共通の部分が `Directive` と `IgnoredSemicolon` のトークンと
コメントを記録します。
kanban の字句解析器は、単位の始まりの `%%` から始まる図のコメントを加えます。
[fixture: kanban/db-grid-directive-item-id]
[fixture: kanban/db-grid-directive-item-label-markdown]
[fixture: kanban/db-grid-directive-item-icon]
[fixture: kanban/db-grid-directive-item-class]
[fixture: kanban/db-grid-directive-metadata-key]
[fixture: kanban/lex-comment-quoted-line]
[fixture: kanban/db-metadata-comment-line]
[fixture: kanban/lex-id-style-rule] [fixture: kanban/lex-label-style-rule]
[fixture: kanban/lex-metadata-style-rule]
[fixture: kanban/div-directive-data-marker]
[fixture: kanban/div-directive-opener] [fixture: kanban/div-semicolon-closer]
[fixture: kanban/lex-after-shape-comment]
