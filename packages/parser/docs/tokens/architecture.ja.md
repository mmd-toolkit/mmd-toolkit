# architecture のトークン

英語版: [architecture.md](./architecture.md)

トークンは仕様の
[順序](../../../spec/docs/diagrams/architecture.md#ordered-rules)に従います。
複合一致は、書かれた構成要素の境界でのみ分割します。
[fixture: architecture/gram-written-tree]
[fixture: architecture/directive-icon-delimiters]
[fixture: architecture/directive-group-delimiters]

## トークン

| 種類         | 項目                                                                                     | fixture                                                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | ヘッダー、宣言・整列の語、`in`、ポート・整列方向、修飾子の `group`、共通値のキーワード。 | [fixture: architecture/db-mixed] [fixture: architecture/db-directions] [fixture: architecture/common-all]                                                                         |
| `Identifier` | 宣言 ID、参照、整列メンバー、アイコン名。                                                | [fixture: architecture/gram-written-tree] [fixture: architecture/lex-icon-leading-symbols] [fixture: architecture/lex-numeric-ids-text]                                           |
| `Punctuator` | コロン、マーカー、ダッシュ単位、丸括弧、角括弧、波括弧それぞれ。二重ダッシュは一項目。   | [fixture: architecture/db-mixed] [fixture: architecture/end-edge-eof] [fixture: architecture/directive-icon-delimiters] [fixture: architecture/directive-group-delimiters]        |
| `String`     | 閉じた文字列アイコン、引用ラベル内容。一致する引用符を含む。                             | [fixture: architecture/db-empty-values] [fixture: architecture/lex-string-conversion] [fixture: architecture/lex-title-quoted-brackets]                                           |
| `RawText`    | 裸のラベル内容、共通値一つ、ネイティブの隠れた形式一つの全体。                           | [fixture: architecture/lex-title-padded-quotes] [fixture: architecture/common-all] [fixture: architecture/hidden-yaml-three-fences] [fixture: architecture/hidden-directive-body] |

Numeric 項目はなく、数字に見える名前やラベルもテキストです。
丸括弧のアイコンは `(`・アイコン名・`)`、
修飾子は `{`・`group`・`}` に分かれます。
余白やネイティブの隠れた形式は、この複合一致を分割できません。
[fixture: architecture/lex-numeric-ids-text]
[fixture: architecture/lex-icon-leading-symbols]
[fixture: architecture/directive-icon-delimiters]
[fixture: architecture/directive-group-delimiters]
[fixture: architecture/gram-hidden-inside-icon]
[fixture: architecture/gram-hidden-inside-modifier]

ラベルの角括弧は別項目です。
字句解析が選んだ完全な引用の選択肢は String 項目、
裸の代替は余白も含めて RawText 項目です。
変換結果や引用に見える内容で、この選択を変更しません。
[fixture: architecture/lex-title-quoted-brackets]
[fixture: architecture/lex-title-padded-quotes]
[fixture: architecture/lex-title-unclosed-quote-with-close]
[fixture: architecture/lex-title-unescaped-quote-fallback]
[fixture: architecture/lex-label-escaped-ls-fallback]
[fixture: architecture/html-label-authored-quotes]
[fixture: architecture/lex-label-selected-semicolon-after-quote]

行の値は title の一つの ASCII 区切りか、
アクセシビリティのコロンの後の余白をすべて保持します。
空の内容にトークンはありません。
ブロックの値は両端の共通空白だけを除き、
空または共通 trivia だけの内容に値のトークンはありません。
引用に見える内容も、共通値は RawText です。
[fixture: architecture/lex-title-one-space-null]
[fixture: architecture/lex-title-one-tab-null]
[fixture: architecture/lex-title-two-spaces-literal]
[fixture: architecture/lex-acctitle-whitespace-only]
[fixture: architecture/lex-description-line-whitespace-only]
[fixture: architecture/lex-description-block-whitespace-only]
[fixture: architecture/common-description-block-directive]
[fixture: architecture/common-description-block-comment]
[fixture: architecture/common-title-literal-quotes]

隠れた形式は開始から条件を満たす終端まで一つの RawText 項目です。
直前の余白と、消費した直後の LF は含みません。
本文のある YAML は、隣接する空のフェンスや両ダッシュ規則に優先します。
[fixture: architecture/hidden-yaml-open-padding]
[fixture: architecture/hidden-yaml-adjacent-eof]
[fixture: architecture/hidden-yaml-three-fences]
[fixture: architecture/hidden-yaml-adjacent-later-closer]
[fixture: architecture/hidden-directive-crlf]
[fixture: architecture/hidden-directive-eof]
[fixture: architecture/hidden-yaml-after-header]

共通ディレクティブ、コメント領域、選択されたセミコロンは、
テキスト・文字列項目を切り、文字列の断片は StringFragment になります。
分割できない名前・語・二重ダッシュの内部のディレクティブや、
選択されたセミコロンは共通の境界規則で拒否します。
アイコン・修飾子の完全な構成要素間のディレクティブは許可します。
値はエスケープ、実体、属性の引用符、ソースの改行を保持します。
[fixture: architecture/directive-fields]
[fixture: architecture/comment-in-quoted-label]
[fixture: architecture/style-fields] [fixture: architecture/div-directive-name]
[fixture: architecture/div-directive-icon-name]
[fixture: architecture/div-directive-group-word]
[fixture: architecture/div-directive-line]
[fixture: architecture/div-semicolon-in-keyword]
[fixture: architecture/div-semicolon-parent-id]
[fixture: architecture/directive-icon-delimiters]
[fixture: architecture/directive-group-delimiters]
[fixture: architecture/common-quotes-entities]
[fixture: architecture/html-all-fields] [fixture: architecture/line-cr-title]
[fixture: architecture/line-crlf]

## コメントと trivia

単位間の ASCII 空白・タブ、可視改行、追加の LF にトークンはありません。
ネイティブコメントの印は `%%` で、LF/CR の前で終わり、
LS/PS は内容として保持します。 [fixture: architecture/space-tabs]
[fixture: architecture/space-lines]
[fixture: architecture/end-statements-comments]
[fixture: architecture/space-comment-ls]
[fixture: architecture/space-comment-ps] [fixture: architecture/end-service-eof]

検出が通過した裸のパーセント行と付随する空白・改行は、
共通の Comments と trivia とし、保持する形式の間でも再読しません。
先に一致した外側の値は、内部の隠れた形式に見えるテキストを所有します。
[fixture: architecture/detect-empty-braces-bare]
[fixture: architecture/detect-unclosed-brace-bare]
[fixture: architecture/div-retained-bare-second-scan-ls]
[fixture: architecture/hidden-directive-inside-values]
[fixture: architecture/hidden-yaml-inside-values]
