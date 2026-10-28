# Pie の位置

英語版: [pie.md](./pie.md)

節点の範囲は仕様の [pie の節点](../../../spec/docs/ast/pie.md#nodes)を、
元のソースのオフセットと物理改行の幅で実装します。 [fixture: pie/db-all-fields]
[fixture: pie/label-crlf]
[fixture: pie/accdescr-block-cr]

## 範囲

Root はソース全体を覆い、PieDiagram はヘッダー前の最初の保持形式、
なければ pie から、最後のヘッダーか本体の記述形式までで、
無関係な外側の空白とコメントを除きます。 [fixture: pie/header-only]
[fixture: pie/frontmatter-nonleading-comment]
[fixture: pie/lex-hidden-directive-second-detection-scan]
[fixture: pie/comment-preheader-unclosed-percent-brace]
[fixture: pie/lex-preheader-retained-yaml-bare-ascii-line]
[fixture: pie/comment-section-eof] [fixture: pie/lex-yaml-after-showdata-eof]

PieSectionStatement はラベルの開き引用符から数値か最後の textAfter までで、
コロンと各欄の隠し形式を含み、EOL は除きます。 [fixture: pie/label-empty]
[fixture: pie/review-yaml-between-label-colon]
[fixture: pie/frontmatter-between-section-parts]
[fixture: pie/lex-yaml-before-colon-two-blocks]
[fixture: pie/lex-yaml-three-fences-before-value]
[fixture: pie/gram-section-eof-hidden-yaml]

StringLiteral は対応する両引用符を含み、NumericLiteral は記述した数値全体で、
各 raw は元のソースの正確な部分文字列です。 [fixture: pie/label-single-quote]
[fixture: pie/label-escaped-quotes]
[fixture: pie/directive-label-middle] [fixture: pie/label-crlf]
[fixture: pie/number-negative-zero] [fixture: pie/number-decimal-leading-zero]

タイトル文は title から値の最終文字まで、null ならキーワードまでで、
アクセシビリティの行の文はキーワードから値の最終文字まで、
null ならコロンまでです。 [fixture: pie/title-spaces]
[fixture: pie/ast-title-tab-null-eof]
[fixture: pie/acctitle-spaces] [fixture: pie/acctitle-eof]
[fixture: pie/accdescr-spaces] [fixture: pie/accdescr-eof]
[fixture: pie/ast-common-values-directive-only]

説明ブロック文は accDescr から最初の閉じ波括弧までで、
空か空白だけのブロックも含みます。 [fixture: pie/accdescr-block]
[fixture: pie/accdescr-empty-block-last]
[fixture: pie/accdescr-space-block-last]
[fixture: pie/lex-block-open-brace-content-single-close]

各共通文は EOL 前の最後の textAfter まで延び、
見える EOL の後の隠し形式は body に属します。 [fixture: pie/review-hidden-directive-title-eof]
[fixture: pie/review-hidden-directive-acctitle-eof]
[fixture: pie/review-hidden-directive-accdescr-eof]
[fixture: pie/gram-block-eof-hidden-yaml] [fixture: pie/yaml-inline-after-title]

PieLiteral は空白を含む空でない行の値全体か、
両端の共通空白を除くブロックの内部で、
null に葉の範囲はありません。 [fixture: pie/title-spaces]
[fixture: pie/title-whitespace-last]
[fixture: pie/acctitle-spaces] [fixture: pie/accdescr-spaces]
[fixture: pie/accdescr-block-unicode-trim]
[fixture: pie/gram-description-block-comment-only]
[fixture: pie/gram-description-block-directive-only]

PieIgnoredText は内部の空白と元の改行を含む開始から終了のフェンスまでで、
前の空白と隠し規則が消費する直後の LF を除き、
追加の LF は範囲を延ばしません。 [fixture: pie/frontmatter-between-section-parts]
[fixture: pie/review-directive-hidden-crlf]
[fixture: pie/review-directive-hidden-space-boundary]
[fixture: pie/gram-section-eof-hidden-yaml]
[fixture: pie/review-directive-hidden-eof]
[fixture: pie/lex-yaml-body-unicode-separators]
[fixture: pie/lex-hidden-directive-lone-cr]

本文ありを優先する YAML 規則は、セクション内でもヘッダー前でも、
隣接する 3 つのフェンスを中央のフェンスを含む 1 つの無視される葉にします。 [fixture: pie/lex-yaml-three-fences-before-value]
[fixture: pie/lex-nonleading-yaml-three-adjacent-fences]

内部の共通ディレクティブ、コメント領域、選択されたセミコロンは、
それらをまたぐ節点の範囲内に残り、
記述値からは除かれます。 [fixture: pie/directive-title-middle]
[fixture: pie/accdescr-block-comment-lines]
[fixture: pie/style-acctitle-trigger]
[fixture: pie/lex-hidden-body-global-directive]
[fixture: pie/lex-yaml-body-comment-content]
[fixture: pie/lex-yaml-opener-selected-semicolon]
