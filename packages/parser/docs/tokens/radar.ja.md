# radar のトークン

英語版: [radar.md](./radar.md)

[字句規則の優先順](../../../spec/docs/diagrams/radar.ja.md#規則の優先順) で最初に完全一致する規則を使います。
複合形式は記述された構成要素の境界で分けます。 [fixture: radar/gram-written-tree]
[fixture: radar/lex-id-keyword-prefix]
[fixture: radar/gram-directive-composite-header]

## トークン

| 種類         | 要素                                       | fixture                                                                                                               |
| ------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | ヘッダー、文の語、真偽値、graticule の語。 | [fixture: radar/gram-written-tree] [fixture: radar/db-options-repeat]                                                 |
| `Identifier` | 軸名、曲線名、名前付き entry の参照。      | [fixture: radar/gram-written-tree] [fixture: radar/lex-bare-accessibility-ids]                                        |
| `Numeric`    | entry と数値オプションの値。               | [fixture: radar/gram-written-tree] [fixture: radar/db-number-leading-zero-decimal]                                    |
| `String`     | 対応する引用符を含むラベル。               | [fixture: radar/db-empty-labels] [fixture: radar/lex-string-conversion]                                               |
| `Punctuator` | 各コロン、コンマ、角括弧、波括弧。         | [fixture: radar/gram-written-tree] [fixture: radar/gram-detailed-colon-mixed-spelling]                                |
| `RawText`    | 共通値と完全な native hidden form。        | [fixture: radar/common-repeat-empty] [fixture: radar/lex-hidden-yaml-two-nonempty] [fixture: radar/hidden-native-eof] |

3 種のヘッダーはいずれも radar-beta を Keyword とし、
記述されたコロンを別の Punctuator にします。
結合形も分離形もヘッダーノードを作りません。 [fixture: radar/header-colon-inline]
[fixture: radar/header-separated-colon]
[fixture: radar/spec-radar-test-ts-f0c0291e]

Numeric は、double 変換で丸め、アンダーフロー、オーバーフローが起きても、
記述された数字と小数点をすべて保持します。
ラベルの String は空のラベルと物理改行も含め、
記述された引用符とエスケープを保持します。 [fixture: radar/db-number-rounded]
[fixture: radar/db-number-subnormal]
[fixture: radar/db-number-underflow] [fixture: radar/db-number-overflow]
[fixture: radar/db-option-overflow] [fixture: radar/db-empty-labels]
[fixture: radar/lex-string-conversion] [fixture: radar/line-cr-values]

行形式の共通値は title の ASCII 区切り 1 字、
またはアクセシビリティのコロンの後の空白をすべて保持します。
空の内容に値トークンはなく、空白だけの行内容にはあります。
説明ブロックの値は両端の共通空白だけを除き、
空または共通 trivia だけのブロックには値トークンがありません。
引用符に見える共通値も RawText です。 [fixture: radar/lex-common-title-one-space]
[fixture: radar/lex-common-title-two-spaces] [fixture: radar/lex-title-tab-null]
[fixture: radar/lex-title-second-tab] [fixture: radar/lex-common-empty-values]
[fixture: radar/common-repeat-empty] [fixture: radar/common-block-whitespace]
[fixture: radar/lex-common-description-only-directive]
[fixture: radar/lex-common-description-only-comment]
[fixture: radar/common-title-open-quote]

native hidden form は開始から条件を満たす終端まで 1 つの RawText です。
直前の空白と消費した直後の LF は含みません。
本体のある YAML の一致は隣接フェンスの選択肢より優先されるため、
3 本のフェンスで 1 要素になる場合があります。
先に始まった文字列と共通値は、内部の hidden
form に見える文を所有します。 [fixture: radar/lex-hidden-padding]
[fixture: radar/hidden-yaml-adjacent-eof]
[fixture: radar/detect-retained-three-native]
[fixture: radar/lex-hidden-yaml-two-nonempty]
[fixture: radar/hidden-native-string]
[fixture: radar/lex-common-hidden-yaml-block-owner]
[fixture: radar/lex-common-hidden-percent-block-owner]

共通ディレクティブ、コメント領域、
選択されたセミコロンは RawText と String を切り、
文字列の断片は StringFragment になります。
分割できない Identifier、Numeric、Keyword の内部で切ると拒否します。
ヘッダー、ラベル、entry、
共通形式の完全な構成要素間の切れ目は trivia です。 [fixture: radar/directive-common]
[fixture: radar/common-block-comment]
[fixture: radar/directive-axis-label] [fixture: radar/style-fields]
[fixture: radar/directive-axis-name] [fixture: radar/directive-number]
[fixture: radar/div-directive-boolean-atom]
[fixture: radar/div-directive-graticule-atom]
[fixture: radar/div-directive-common-keyword] [fixture: radar/div-semicolon-id]
[fixture: radar/div-semicolon-number] [fixture: radar/div-semicolon-keyword]
[fixture: radar/gram-directive-composite-header]
[fixture: radar/directive-label-before-open]
[fixture: radar/directive-entry-before-colon]
[fixture: radar/common-block-directive-gap]

## コメントと trivia

要素間の ASCII 空白とタブ、可視改行、追加 LF にトークンはありません。
native comment は印 %% を持ち、物理 EOL の前で終わり、
LS と PS を内容として保持します。
検出が通過した bare percent 行と付随する trivia は、
保持する形式の間も再読しません。 [fixture: radar/space-tabs]
[fixture: radar/space-lines]
[fixture: radar/comment-axis] [fixture: radar/comment-ls]
[fixture: radar/comment-ps] [fixture: radar/bare-line-ls]
[fixture: radar/div-detect-yaml-bare-secondscan-native-ls]
