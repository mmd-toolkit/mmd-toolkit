# Ishikawa のトークン

英語版: [ishikawa.md](./ishikawa.md)

[tokens.md](../tokens.ja.md) を補うトークンです。
ノードは [ast/ishikawa.md](../../../spec/docs/ast/ishikawa.ja.md)、
字句規則は
[diagrams/ishikawa.md](../../../spec/docs/diagrams/ishikawa.ja.md#字句構造)
が定めます。

## トークン

| 種類      | 項目                                                |
| --------- | --------------------------------------------------- |
| `Keyword` | 選ばれた `ishikawa` または `ishikawa-beta` ヘッダー |
| `RawText` | ノードのテキスト全体                                |

各項目は、共通のトリビアが切る前は 1 つのトークンです。
ヘッダーの大文字と小文字は書かれたままです。
beta 接尾辞の単語境界が成立しないとき、
接尾辞は安定版ヘッダーの後のノードのテキストです。
[fixture: ishikawa/header-uppercase] [fixture:
ishikawa/header-beta-mixed-case] [fixture: ishikawa/header-beta-letter-suffix]
[fixture: ishikawa/header-beta-digit-suffix] [fixture:
ishikawa/header-beta-underscore-suffix]
[fixture: ishikawa/header-beta-dash-suffix]

テキストのトークンは、内部と末尾の空白をすべて保ちます。
EOF、U+2028、U+2029、コロンの後の空白でも同じです。
引用符、バッククォート、数値、実体参照、
選ばれていない `;` も `RawText` の一部で、文字列、数値、
句読点のトークンにはなりません。 [fixture: ishikawa/gram-spaces-inside-text]
[fixture: ishikawa/gram-root-trailing-space] [fixture:
ishikawa/gram-child-trailing-space] [fixture:
ishikawa/lex-trailing-whitespace-eof] [fixture:
ishikawa/lex-trailing-ls-ps-whitespace] [fixture:
ishikawa/gram-after-root-colon-space] [fixture:
ishikawa/gram-after-child-colon-space] [fixture: ishikawa/gram-empty-quotes]
[fixture: ishikawa/gram-empty-backticks-text]
[fixture: ishikawa/db-number-labels]
[fixture: ishikawa/header-root-inline-entity] [fixture:
ishikawa/gram-after-child-semicolon]

字下げ、空行の空白、newline 単位はトークンを作りません。
CR と CRLF はテキストを終えますが、中の U+2028 と U+2029 は終えません。
[fixture: ishikawa/lex-space-positions] [fixture: ishikawa/lex-tab-positions]
[fixture: ishikawa/lex-nbsp-positions] [fixture:
ishikawa/gram-between-spaces-line] [fixture: ishikawa/lex-cr-lines] [fixture:
ishikawa/lex-crlf-lines] [fixture: ishikawa/lex-u2028-in-root] [fixture:
ishikawa/lex-u2029-in-child]

ディレクティブ、共通のコメント領域、選ばれた無視する `;` は、
[共通規則](../tokens.ja.md)に従ってテキストを `RawText` の断片に切ります。
切れ目の隣の値の空白は、空白だけの断片でも保ちます。
共通の記録処理が、
コメントの外の `Directive` と `IgnoredSemicolon` のトークンを作ります。
[fixture: ishikawa/directive-root-middle] [fixture:
ishikawa/directive-multiline-joins-node-text] [fixture:
ishikawa/comment-ls-region-in-text] [fixture:
ishikawa/lex-node-text-ps-comment-region] [fixture:
ishikawa/lex-root-style-semicolon-padding] [fixture:
ishikawa/lex-root-style-two-semicolons-padding] [fixture:
ishikawa/lex-root-style-three-semicolons-padding] [fixture:
ishikawa/lex-style-rule-directive-in-trigger]

図のコメントの印は `%%` で、LF、U+2028、U+2029 の直前か EOF で終わります。
前の空白はコメントの外です。
印の間や本文中のディレクティブは、コメントの範囲の中です。
ノードのテキストが始まった後の `%%` は `RawText` に残ります。
[fixture: ishikawa/gram-preserved-comment-after-root] [fixture:
ishikawa/comment-preserved-u2028] [fixture: ishikawa/comment-preserved-u2029]
[fixture: ishikawa/comment-only-eof] [fixture:
ishikawa/comment-directive-between-marks] [fixture:
ishikawa/div-header-comment-directive-value-ps] [fixture:
ishikawa/comment-root-inline-glued] [fixture:
ishikawa/comment-child-inline-spaced]

選ばれたヘッダーのキーワード内のディレクティブは、
共通のトークン境界の規則により拒否します。
beta の代替読みの接尾辞や数値に見えるテキストを含む、
ノードのテキスト内では許します。 [fixture: ishikawa/directive-in-header]
[fixture:
ishikawa/directive-in-beta-header] [fixture: ishikawa/div-directive-beta-prefix]
[fixture: ishikawa/lex-directive-before-beta-fallback-text] [fixture:
ishikawa/lex-directive-in-beta-fallback-text] [fixture:
ishikawa/lex-directive-in-numeric-looking-text]
