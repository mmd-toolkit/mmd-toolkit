# gitgraph のトークン

英語版: [gitgraph.md](./gitgraph.md)

## トークン

[順序付き字句規則](../../../spec/docs/diagrams/gitgraph.md#ordered-rules)
が次の成分を作り、複合一致は書かれた語・コロン・波括弧の境界で分けます。
[fixture: gitgraph/gram-all-fields]
[fixture: gitgraph/lex-option-global-before-colon]

| 成分                                     | 種別         | fixture                                                                                                                         |
| ---------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| ヘッダー・方向・操作・オプション・型の語 | `Keyword`    | [fixture: gitgraph/gram-all-fields] [fixture: gitgraph/gram-switch]                                                             |
| コロンと説明の波括弧                     | `Punctuator` | [fixture: gitgraph/header-colon] [fixture: gitgraph/header-spaced-colon] [fixture: gitgraph/gram-all-fields]                    |
| 引用符のないブランチ参照                 | `Identifier` | [fixture: gitgraph/lex-reference-shape]                                                                                         |
| 符号のない順序                           | `Numeric`    | [fixture: gitgraph/number-zero] [fixture: gitgraph/number-precision] [fixture: gitgraph/number-overflow]                        |
| どちらの引用符でも文字列全体             | `String`     | [fixture: gitgraph/gram-commit-single-quotes] [fixture: gitgraph/gram-commit-empty-values]                                      |
| 共通値の内容と隠れた形式の全体           | `RawText`    | [fixture: gitgraph/gram-all-fields] [fixture: gitgraph/lex-yaml-empty-body] [fixture: gitgraph/lex-hidden-directive-commit-eof] |

[行の共通値](../../../spec/docs/ast/gitgraph.md#gitgraphtitlestatement)
は指定された空白を保持し、説明ブロックの内容は両端の共通空白だけを除き、
空の内容には内容トークンを作りません。
[fixture: gitgraph/title-conversion] [fixture: gitgraph/title-tab]
[fixture: gitgraph/common-acctitle-only-whitespace]
[fixture: gitgraph/common-accdescr-only-whitespace]
[fixture: gitgraph/accdescr-block]
[fixture: gitgraph/common-block-only-whitespace]
[fixture: gitgraph/lex-description-block-only-directive]
[fixture: gitgraph/lex-description-block-only-comment]

[隠れた形式](../../../spec/docs/ast/gitgraph.md#gitgraphignoredtext)は、
開始から終端までの一つの RawText 項目で、
先行する ASCII 空白と、消費する直後の LF は含めません。
[fixture: gitgraph/lex-yaml-empty-body]
[fixture: gitgraph/lex-yaml-three-adjacent-fences]
[fixture: gitgraph/lex-hidden-directive-commit-eof]
[fixture: gitgraph/lex-hidden-directive-commit-closing-space]
[fixture: gitgraph/lex-hidden-yaml-block-eof]

[共通の trivia](../../../spec/docs/common.md#reading-a-source)は
String 項目を StringFragment、RawText 項目を RawText に分割します。
語・参照・整数の内部での分割は拒否しますが、
オプションの語とコロンの境界では許可します。
[fixture: gitgraph/directive-in-string]
[fixture: gitgraph/lex-hidden-yaml-global-comment-body]
[fixture: gitgraph/lex-hidden-yaml-global-directive-body]
[fixture: gitgraph/style-acctitle]
[fixture: gitgraph/div-directive-in-commit]
[fixture: gitgraph/div-directive-in-reference]
[fixture: gitgraph/div-directive-in-number]
[fixture: gitgraph/div-style-semicolon-in-order-number]
[fixture: gitgraph/lex-option-global-before-colon]
[fixture: gitgraph/lex-selected-semicolon-option-word-colon]

[図のコメント](../../../spec/docs/diagrams/gitgraph.md#whitespace-and-comments)と
検出が通過した裸の行は、印が `%%` の Comment です。
可視の改行と通常の ASCII 空白にはトークンを作りません。
[fixture: gitgraph/comment-commit-glued]
[fixture: gitgraph/comment-between-mark-characters]
[fixture: gitgraph/detect-bare-brace-eof-header]
[fixture: gitgraph/lex-tab] [fixture: gitgraph/lex-crlf]

[比較値](../../../spec/docs/diagrams/gitgraph.md#comparison-values)には、
トークンを作りません。
引用された葉は書かれた escape・物理改行・空白を保持し、
裸の参照は自身の Identifier トークンを保持します。
[fixture: gitgraph/db-compare-bare-and-quoted]
[fixture: gitgraph/db-compare-branch-lookups]
[fixture: gitgraph/db-compare-escape-backslash]
[fixture: gitgraph/db-compare-escape-carriage-return]
[fixture: gitgraph/db-compare-escape-no-hex-unicode-decoding]
[fixture: gitgraph/db-compare-escape-once]
[fixture: gitgraph/db-compare-inner-whitespace]
[fixture: gitgraph/db-compare-padding-and-case]
[fixture: gitgraph/db-compare-empty-and-whitespace]
[fixture: gitgraph/db-compare-whitespace-id-lookups]
[fixture: gitgraph/db-compare-escaped-source-parent]
[fixture: gitgraph/db-compare-source-parent-from-escaped-ids]

比較時に正規化したりプレースホルダーとして読んだりする場合も、
HTML 改行の綴りとエンティティの元のテキストは、
String トークンと書かれた葉に残ります。
[fixture: gitgraph/db-compare-break-spellings]
[fixture: gitgraph/db-compare-break-whitespace]
[fixture: gitgraph/db-compare-break-boundaries]
[fixture: gitgraph/db-compare-entity-literal-hash-distinct]
