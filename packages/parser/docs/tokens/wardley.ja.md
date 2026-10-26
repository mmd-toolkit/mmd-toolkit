# Wardley のトークン

英語版: [wardley.md](./wardley.md)

トークンは仕様の
[優先順の単位](../../../spec/docs/diagrams/wardley.ja.md#単位の優先順)
に従い、最初に完全一致した規則を採用する。
マイナス句読点の明示的な長い候補もこの順で調べる。
複合形は記述された構成要素の境界で分ける。
[fixture: wardley/keywords-all-glued] [fixture: wardley/db-link-forms]
[fixture: wardley/directive-coordinate-parts]
[fixture: wardley/directive-flow-before-label]

## トークン

| 種類         | 対象                                                                                                | fixture                                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | ヘッダー、命令語、戦略、inertia。                                                                   | [fixture: wardley/db-all-fields] [fixture: wardley/db-inertia-forms]                                                                                 |
| `Identifier` | WardleyIdentifier が持つ id-name。                                                                  | [fixture: wardley/db-id-underscore]                                                                                                                  |
| `RawText`    | spaced-name、共通値、セミコロンラベル内容、全体の隠し形式。                                         | [fixture: wardley/db-unquoted-names] [fixture: wardley/common-repeat-empty] [fixture: wardley/db-link-forms] [fixture: wardley/hidden-all-unit-gaps] |
| `Numeric`    | 符号なしの整数または小数。                                                                          | [fixture: wardley/db-all-fields] [fixture: wardley/db-number-overflow]                                                                               |
| `String`     | 引用符を含む名前、テキスト、フローラベル。                                                          | [fixture: wardley/db-empty-texts] [fixture: wardley/lex-string-conversion] [fixture: wardley/lex-link-flow-raw-escapes]                              |
| `Punctuator` | 括弧、コンマ、@、スラッシュ、マイナス、矢印、ポート、フローのプラスとマーカー、ラベルのセミコロン。 | [fixture: wardley/db-all-fields] [fixture: wardley/db-link-forms] [fixture: wardley/hidden-all-unit-gaps]                                            |

フローはプラス、String ラベル、末尾マーカーの独立した項目になる。
双方向マーカー、ポート全体、依存矢印の字形は不可分である。
座標の括弧、数値、コンマと、オフセットの符号、絶対値は別項目になる。
共通メタデータの語はコロン、波括弧、タイトル区切りと分ける。
通常の空白やネイティブな隠し形式は複合フローやメタデータを分割できない。
[fixture: wardley/directive-flow-before-label]
[fixture: wardley/directive-flow-after-label]
[fixture: wardley/directive-coordinate-parts]
[fixture: wardley/directive-offset-sign]
[fixture: wardley/directive-common-colon]
[fixture: wardley/common-block-directive-gap]
[fixture: wardley/lex-link-native-flow-components]
[fixture: wardley/lex-native-common-keyword-colon]

spaced-name は内部のスペースとタブを保ち、外側の余白を除く。
共通の行値は title の最初の区切りまたはコロンの後をすべて保つ。
空白のみならトークンがあり、内容なしならない。
ブロック値は外側の共通空白のみを除き、空なら値のトークンを作らない。
セミコロンラベルは物理行の残りを、空白のみの場合も保つ。
[fixture: wardley/db-unquoted-names] [fixture: wardley/lex-name-trailing-space]
[fixture: wardley/common-title-tabs] [fixture: wardley/common-title-two-spaces]
[fixture: wardley/common-empty-literals]
[fixture: wardley/common-line-whitespace]
[fixture: wardley/common-block-whitespace]
[fixture: wardley/tail-link-spaced-label]
[fixture: wardley/line-link-label-values]

隠し形式全体は、条件を満たす閉じまでの一つの RawText 項目になる。
直前の余白と消費した末尾 LF は含めない。
先行する文字列、フローラベル、セミコロンラベル、共通値の内部では、
隠し形式に似たテキストもその値に属する。
[fixture: wardley/lex-hidden-directive-cr] [fixture: wardley/lex-hidden-yaml-cr]
[fixture: wardley/hidden-yaml-adjacent-later]
[fixture: wardley/hidden-directive-string]
[fixture: wardley/hidden-yaml-string] [fixture: wardley/line-every-text]
[fixture: wardley/lex-hidden-directive-multiline-label]
[fixture: wardley/hidden-yaml-block]

共通の除去は RawText と String を分割し、文字列片は StringFragment になる。
固定語、id-name、数値、不可分な字形の内部の分割は拒否する。
構成要素の完全な境界での分割は trivia のままである。
引用符、エスケープ、数字、改行は記述どおりトークン値に残る。
[fixture: wardley/directive-every-field] [fixture: wardley/style-every-text]
[fixture: wardley/common-block-comment] [fixture: wardley/directive-id-inside]
[fixture: wardley/directive-keyword-middle] [fixture: wardley/directive-number]
[fixture: wardley/directive-port-inside]
[fixture: wardley/directive-flow-marker-inside]
[fixture: wardley/lex-selected-decimal-inside]
[fixture: wardley/line-string-values]

## コメントと trivia

ネイティブな余白は ASCII スペースとタブである。
可視 LF、補われた未記述の LF、title の最初の区切りにはトークンがない。
ネイティブな %% コメントは物理行末の手前で終わる。
検出が通過した裸の行と付随する trivia は、保持形式の間でも読み直さない。
[fixture: wardley/space-tabs] [fixture: wardley/space-lines]
[fixture: wardley/common-title-tabs] [fixture: wardley/comment-eof]
[fixture: wardley/comment-native-triple]
[fixture: wardley/detect-retained-secondscan-bare-ascii]
[fixture: wardley/retained-directive-between-bares]
[fixture: wardley/bare-line-ls]
