# packet のトークン

英語版: [packet.md](./packet.md)

トークンは仕様の
[順序付き規則](../../../spec/docs/diagrams/packet.ja.md#規則の順序)に従い、
複合した共通形式を記述上の構成要素の境界で分けます。
[fixture: packet/gram-mixed] [fixture: packet/directive-acctitle-colon]

## トークン

| 種類                                      | 対象                                                       | fixture                                 |
| ----------------------------------------- | ---------------------------------------------------------- | --------------------------------------- |
| `Keyword`                                 | `packet`、`packet-beta`、`title`、`accTitle`、`accDescr`。 | [fixture: packet/db-all-fields]         |
| [fixture: packet/spec-packet-c4580507]    |
| `Punctuator`                              | 範囲のダッシュ、相対指定のプラス、コロン、説明の波括弧。   | [fixture: packet/gram-mixed]            |
| [fixture: packet/db-all-fields]           |
| `Numeric`                                 | 記述された符号なし整数。相対指定のプラスは別。             | [fixture: packet/gram-mixed]            |
| [fixture: packet/db-precision-rounded]    |
| `String`                                  | 対応する引用符を含むラベル全体。                           | [fixture: packet/db-label-empty-double] |
| [fixture: packet/db-label-single-escapes] |
| `RawText`                                 | 共通の値、または隠れた YAML・DIRECTIVE 全体。              | [fixture: packet/db-all-fields]         |
| [fixture: packet/hidden-yaml-body]        |
| [fixture: packet/hidden-directive-header] |

行の値は、title の ASCII 区切り 1 文字またはアクセシビリティのコロンの後を、
残る余白と空白だけの値も含めて保持します。
空の内容にトークンはありません。
ブロックの値は両端の共通空白を除き、
空または共通 trivia だけの内容に値のトークンはありません。
[fixture: packet/common-whitespace] [fixture: packet/lex-title-one-space]
[fixture: packet/lex-title-one-tab] [fixture: packet/lex-title-two-spaces]
[fixture: packet/acctitle-empty] [fixture: packet/acctitle-repeat-empty]
[fixture: packet/lex-accdescr-whitespace-only]
[fixture: packet/gram-empty-description]
[fixture: packet/lex-description-whitespace-only]
[fixture: packet/lex-description-directive-only]
[fixture: packet/lex-description-comment-only]

引用符付きラベルと共通の値は、エスケープ、実体参照、HTML 属性の引用符、
ソースの改行を含め、記述を保持します。
共通の値の引用符は閉じていなくても RawText です。
[fixture: packet/db-label-escapes] [fixture: packet/html-all-fields]
[fixture: packet/entity-all-text] [fixture: packet/line-crlf-label]
[fixture: packet/title-open-quote] [fixture: packet/accdescr-block-quoted]

隠れた形式は、開始から条件を満たす閉じまでの 1 つの RawText 項目です。
前の余白と、直後に消費する LF は含まず、元の EOF でも同じです。
本文のある YAML は空の本文と開始の範囲ダッシュより優先します。
[fixture: packet/hidden-yaml-padding]
[fixture: packet/hidden-directive-block-eof]
[fixture: packet/hidden-yaml-block-eof] [fixture: packet/hidden-directive-cr]
[fixture: packet/hidden-directive-crlf] [fixture: packet/hidden-yaml-cr]
[fixture: packet/hidden-yaml-crlf] [fixture: packet/hidden-yaml-adjacent-later]
[fixture: packet/lex-dash-before-yaml]

共通ディレクティブ、コメント領域、選択されたセミコロンは、
テキストと文字列の項目を分割します。
固定キーワードや整数の内部の分割は、共通の不可分な境界規則で拒否します。
[fixture: packet/directive-label-middle] [fixture: packet/directive-title-value]
[fixture: packet/common-block-comment] [fixture: packet/style-label]
[fixture: packet/lex-hidden-nested-global]
[fixture: packet/lex-yaml-common-comment]
[fixture: packet/lex-yaml-fence-selected]
[fixture: packet/directive-header-middle]
[fixture: packet/directive-number-middle]
[fixture: packet/div-selected-title-interior]
[fixture: packet/div-selected-integer-interior]

## コメントと trivia

単位間の ASCII スペース・タブ、可視の改行単位、
付加する LF にトークンはありません。
固有コメントは印が `%%` で、物理行末の直前までです。
LS・PS は内容として残り、コメントは共通レコードです。
[fixture: packet/space-count-tab] [fixture: packet/gram-block-blank-lines]
[fixture: packet/spec-packet-7426afc4] [fixture: packet/comment-block]
[fixture: packet/comment-eof] [fixture: packet/comment-bare]
[fixture: packet/lex-native-comment-triple]
[fixture: packet/lex-native-comment-ls] [fixture: packet/lex-native-comment-ps]

検出が読み過ごした % だけの行と付随する trivia は再読しません。
保持する形式の間でも、その行は共通の Comment です。
[fixture: packet/detect-empty-braces-bare]
[fixture: packet/detect-unclosed-brace-bare]
[fixture: packet/retained-yaml-bare-ls]
[fixture: packet/retained-directive-bare-bom]
[fixture: packet/div-detect-yaml-bare-directive-ls]
