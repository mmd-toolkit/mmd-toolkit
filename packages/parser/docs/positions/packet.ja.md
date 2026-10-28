# packet の位置

英語版: [packet.md](./packet.md)

範囲は仕様の [packet ノード](../../../spec/docs/ast/packet.ja.md#ノード)に従い、
元の UTF-16 オフセットとソースの改行を使います。 [fixture: packet/gram-mixed]
[fixture: packet/line-crlf-label]

## 範囲

Root は入力全体です。
PacketDiagram は保持する最初のヘッダー前形式から、なければヘッダーから始まり、
最後に記述された形式で終わります。
外側の余白とコメントは範囲を広げません。
どちらのヘッダー表記もキーワードトークンです。 [fixture: packet/spec-packet-7426afc4]
[fixture: packet/spec-packet-c4580507]
[fixture: packet/detect-one-block]
[fixture: packet/detect-second-scan-directive]
[fixture: packet/comment-eof]
[fixture: packet/header-parser-packet-spaces]
[fixture: packet/header-parser-beta-spaces]

読み過ごした % だけの行と付随する空白・改行は、保持する形式の間でも、
図の範囲を広げず ignored-text の子になりません。 [fixture: packet/detect-empty-braces-bare]
[fixture: packet/detect-unclosed-brace-bare]
[fixture: packet/retained-yaml-bare-ls]
[fixture: packet/div-detect-yaml-bare-directive-ls]

範囲・単一位置ブロックは最初の数字から始まり、
相対ブロックは count.raw の外のプラスから始まります。
範囲はラベルの閉じ引用符までで、
可視 EOL 前の最後の textAfter 形式まで広がります。
内部の隠れた形式は名付けた隙間だけに属し、
行の分割でノードは増えません。 [fixture: packet/gram-mixed]
[fixture: packet/gram-hidden-range-gap-spaced]
[fixture: packet/gram-single-hidden-gaps]
[fixture: packet/gram-hidden-yaml-gap]
[fixture: packet/gram-relative-hidden-colon]
[fixture: packet/gram-hidden-gap]
[fixture: packet/hidden-directive-block-eof]
[fixture: packet/lex-hidden-two-suffixes]
[fixture: packet/db-row-split]

NumericLiteral は記述された数字を覆います。
StringLiteral は対応する両引用符と内部を覆い、
空のラベルとソースの改行を含みます。
raw はソースの正確な切り出しです。 [fixture: packet/db-precision-rounded]
[fixture: packet/db-overflow-wide]
[fixture: packet/db-label-empty-double]
[fixture: packet/db-label-empty-single]
[fixture: packet/db-label-single-escapes]
[fixture: packet/line-crlf-label]
[fixture: packet/directive-label-middle]

タイトル文は title から値の終わりまで、null ならキーワードまでです。
アクセシビリティの行形式は値の終わりまで、null ならコロンまでです。
説明ブロック文は、空や共通 trivia だけの内容でも最初の閉じ波括弧までです。
どの文も可視 EOL 前の最後の隠れた接尾形式まで広がり、
その EOL 後の形式は body に属します。
EOL と固有コメントは文の範囲を広げません。 [fixture: packet/title-empty]
[fixture: packet/lex-title-one-tab]
[fixture: packet/lex-title-two-spaces]
[fixture: packet/acctitle-empty]
[fixture: packet/accdescr-line-empty]
[fixture: packet/gram-empty-description]
[fixture: packet/lex-description-directive-only]
[fixture: packet/lex-description-comment-only]
[fixture: packet/lex-description-nested-open]
[fixture: packet/hidden-directive-title-eof]
[fixture: packet/hidden-directive-acctitle-eof]
[fixture: packet/hidden-directive-accdescr-eof]
[fixture: packet/hidden-directive-description-eof]
[fixture: packet/lex-hidden-after-visible-eol]
[fixture: packet/comment-block-description]

PacketLiteral は余白を含む空でない行の値、
または両端の共通空白を除いたブロック内部を覆います。
null に葉はありません。
PacketIgnoredText は開始から条件を満たす閉じまでで、内部のソース改行を含み、
前の余白と消費する直後の LF を含みません。
付加する LF はソース範囲を広げません。
本文を持つ YAML の優先により 3 つのフェンスが 1 つの葉になり得ます。
別々に一致した形式は別々の所有先を持ちます。 [fixture: packet/common-whitespace]
[fixture: packet/lex-title-one-space]
[fixture: packet/lex-title-two-spaces]
[fixture: packet/lex-accdescr-whitespace-only]
[fixture: packet/accdescr-block-lines]
[fixture: packet/lex-description-whitespace-only]
[fixture: packet/hidden-yaml-padding]
[fixture: packet/hidden-directive-crlf]
[fixture: packet/hidden-yaml-crlf]
[fixture: packet/hidden-yaml-block-eof]
[fixture: packet/hidden-yaml-adjacent-later]
[fixture: packet/lex-yaml-two-nonempty]
[fixture: packet/lex-hidden-two-suffixes]

共通ディレクティブ、コメント領域、選択されたセミコロンは、
またぐノードの範囲に残り、
記述値からは除きます。 [fixture: packet/directive-label-middle]
[fixture: packet/directive-title-value]
[fixture: packet/directive-description-value]
[fixture: packet/common-block-comment]
[fixture: packet/style-label]
[fixture: packet/lex-hidden-nested-global]
[fixture: packet/lex-yaml-common-comment]
[fixture: packet/lex-yaml-fence-selected]
