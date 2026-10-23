# pie の位置

English version: [pie.md](./pie.md)

この文書は [ast/pie.md](../../../spec/docs/ast/pie.ja.md) のノードについて、
[positions.md](../positions.ja.md) を補います。
トークンの項目は [tokens/pie.md](../tokens/pie.ja.md) が定義します。

## 範囲と所有先

Root はソース全体を覆います。
PieDiagram は、保持する最初のヘッダー前形式から始まります。
その形式がなければ pie から始まり、
最後に書かれたヘッダーまたは本文のトークンで終わります。
周囲の空白、共通ディレクティブ、末尾コメントは範囲を延ばしません。
[fixture: pie/header-only]
[fixture:
pie/frontmatter-nonleading-comment]
[fixture:
pie/lex-hidden-directive-second-detection-scan]
[fixture:
pie/directive-title-middle]
[fixture: pie/comment-section-eof]
[fixture:
pie/ast-common-values-directive-only]

textBeforeHeader は、pie の前で読んだ隠し YAML と DIRECTIVE を、
ソース順に保持します。
検出が通過した裸の行はコメントであり、図の範囲を延ばしません。
検出が一緒に通過した空白は trivia です。
[fixture:
pie/frontmatter-nonleading-comment]
[fixture:
pie/lex-hidden-directive-second-detection-scan]
[fixture:
pie/comment-preheader-unclosed-percent-brace]
[fixture:
pie/lex-bare-percent-braces-before-header]
[fixture:
pie/div-preheader-bare-ls-blank]
[fixture:
pie/div-preheader-bare-bom-before-header]
[fixture: pie/div-preheader-retained-yaml-bare-ls]
[fixture: pie/div-preheader-retained-yaml-bare-bom]
[fixture: pie/div-preheader-retained-yaml-bare-ls-line]
[fixture: pie/lex-preheader-retained-yaml-bare-ascii]
[fixture: pie/lex-preheader-retained-yaml-bare-ascii-line]
[fixture: pie/div-preheader-retained-directive-bare-ls]
[fixture: pie/div-preheader-retained-directive-bare-bom]
[fixture: pie/div-preheader-retained-directive-bare-ls-line]
[fixture: pie/lex-preheader-retained-directive-bare-ascii]
[fixture: pie/lex-preheader-retained-directive-bare-ascii-line]
[fixture: pie/div-preheader-retained-yaml-bare-then-directive]
[fixture: pie/lex-preheader-retained-yaml-bare-then-directive-ascii]

showData が書かれていれば、pie とそのフラグの間の隠し形式は、
textBeforeShowData に属します。
書かれていなければそのリストは空で、隠し形式は body の先頭に置きます。
showData の後の隠し形式も body の先頭に置きます。
[fixture:
pie/review-hidden-directive-before-showdata]
[fixture:
pie/review-yaml-before-showdata]
[fixture: pie/frontmatter-after-header]
[fixture: pie/lex-yaml-after-showdata-before-first-section]
[fixture:
pie/lex-yaml-after-showdata-eof]
[fixture:
pie/lex-hidden-directive-with-second-hidden-token]

セクションはラベルの開き引用符から、数値または最後の textAfter 形式までです。
EOL は含みません。
ラベルは両方の引用符を含み、raw は元のソース範囲と等しくなります。
数値はマイナスと書かれたすべての数字を含みます。
[fixture: pie/db-all-fields]
[fixture: pie/label-single-quote]
[fixture:
pie/label-empty]
[fixture: pie/label-unknown-escapes]
[fixture:
pie/number-negative-zero]
[fixture: pie/number-decimal-leading-zero]

ラベルとコロンの間の隠し形式は textBeforeColon、
コロンと数値の間は textBeforeValue、
数値の後から見える EOL までのものは textAfter に属します。
見える EOL の後の隠し形式は body に属します。
1 つの隙間にある 2 つの形式は、別々に保持します。
[fixture: pie/review-yaml-between-label-colon]
[fixture: pie/frontmatter-between-section-parts]
[fixture:
pie/gram-section-eof-hidden-yaml]
[fixture: pie/yaml-inline-after-title]
[fixture: pie/lex-yaml-before-colon-two-blocks]
[fixture:
pie/lex-hidden-before-colon-lf]

タイトル文は title から始まり、値の最後の文字で終わります。
値が null ならキーワードで終わります。
アクセシビリティの行文は accTitle/accDescr から始まり、
値の最後の文字で終わります。
値が null ならコロンで終わります。
行の値は、title の 1 文字の区切りの後、またはコロン直後の余白を保持します。
厳密に空の値には Literal の範囲がありません。
[fixture: pie/title-spaces]
[fixture: pie/title-whitespace-last]
[fixture: pie/ast-title-tab-null-eof]
[fixture: pie/review-title-bare-lone-eof]
[fixture: pie/acctitle-spaces]
[fixture: pie/accdescr-spaces]
[fixture: pie/acctitle-eof]
[fixture:
pie/accdescr-eof]
[fixture: pie/ast-common-values-directive-only]

説明ブロック文は accDescr から最初の閉じ波括弧までです。
Literal は波括弧と両端の共通空白を除きます。
空または空白だけのブロックは値が null で、Literal の範囲がありません。
[fixture:
pie/accdescr-block]
[fixture: pie/accdescr-block-unicode-trim]
[fixture:
pie/accdescr-empty-block-last]
[fixture: pie/accdescr-space-block-last]
[fixture: pie/gram-description-block-directive-only]
[fixture:
pie/gram-description-block-comment-only]

各共通文は、見える EOL の前にある最後の textAfter 形式まで範囲を延ばします。
見える EOL の後の形式は body に属します。
隠し形式が区切りの LF を消費しても、この所有先は変わりません。
ソース EOF で隠し形式が終わる場合も同じです。
[fixture: pie/review-hidden-directive-title-eof]
[fixture:
pie/review-hidden-directive-acctitle-eof]
[fixture:
pie/review-hidden-directive-accdescr-eof]
[fixture:
pie/review-hidden-directive-block-eof]
[fixture: pie/gram-block-eof-hidden-yaml]
[fixture: pie/yaml-inline-after-title]

PieIgnoredText は、認識した --- または %%{ の開きから、
閉じフェンスまでを覆います。
直前の ASCII 余白と、字句規則が後で消費する LF は除きます。
内部の改行と余白は、範囲と書かれた値に残ります。
[fixture: pie/frontmatter-between-section-parts]
[fixture:
pie/review-directive-hidden-crlf]
[fixture:
pie/review-directive-hidden-space-boundary]
[fixture:
pie/review-directive-hidden-eof]
[fixture: pie/lex-hidden-directive-lone-cr]

ラベル、Literal、無視する形式の内部にある共通 trivia は、
ソース範囲内に残り、書かれた値からは除きます。
StringLiteral.raw はそれを保持します。
CRLF はソースの 2 コード単位を保持し、行を 1 つ進めます。
LS/PS は行を進めません。
[fixture: pie/directive-label-middle]
[fixture: pie/directive-title-middle]
[fixture: pie/style-label-trigger]
[fixture: pie/lex-hidden-global-comment-region]
[fixture: pie/label-crlf]
[fixture: pie/label-cr]
[fixture: pie/label-ls]
[fixture: pie/label-ps]
