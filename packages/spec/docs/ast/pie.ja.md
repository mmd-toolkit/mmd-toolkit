# Pie の節点

英語版: [pie.md](./pie.md)

`pie` のソースの木を定めます。
共通の葉は [ast.md](../ast.ja.md)、
構文と受理条件は [diagrams/pie.md](../diagrams/pie.ja.md) にあります。
値は Db の変換ではなく書かれたテキストを保ちます。
任意の欄は null として存在し、書かれないリストは空です。
以下の子の欄は訪問順で、各リストはソース順です。 [fixture: pie/db-all-fields]
[fixture: pie/header-only]
[fixture: pie/label-unknown-escapes]
[fixture: pie/number-negative-zero]

## 節点

### PieDiagram

| 欄                   | 型                     | 意味                               |
| -------------------- | ---------------------- | ---------------------------------- |
| `showData`           | boolean                | ヘッダーのフラグが書かれているか。 |
| `textBeforeHeader`   | list of PieIgnoredText | pie の前に読む隠れた形。           |
| `textBeforeShowData` | list of PieIgnoredText | pie とフラグの間の隠れた形。       |
| `body`               | list of PieBodyItem    | 書かれた本文の項目。               |

子の欄: `textBeforeHeader`、`textBeforeShowData`、`body`。
範囲は保持したヘッダー前の最初の形から、なければ pie から、
最後に書かれたヘッダーか本体の形までで、無関係な外側の空白は除きます。
別のヘッダーの節点や、
実効のタイトルと区分は生成しません。 [fixture: pie/frontmatter-nonleading-comment]
[fixture: pie/header-only]
[fixture: pie/db-all-fields]
[fixture: pie/lex-hidden-directive-second-detection-scan]

textBeforeHeader は、pie の隠れた YAML と隠れた DIRECTIVE の規則で、
pie の前に読む PieIgnoredText の形を持ちます。
保持する先頭以外のブロックと再走査のディレクティブも、その pie の規則で読み、
境界が受理を決めます。
検出が通過させた裸の行は、`%%{}%%`、`%%{!}%%`、閉じない `%%{!` も含め、
印が `%%` の共通の Comment です。
PieIgnoredText ではなく、PieDiagram の範囲を延ばしません。
pie の字句規則は検出点から読みます。
裸の `%%` の行と、検出がそれと一緒に通過させる空白と改行は読み直しません。
空白と改行はトリビアです。
そのような裸の行と通過させたトリビアは、
保持した形の後や保持した形の間にも置けます。
textBeforeHeader に入るのは隠れた形だけです。 [fixture: pie/div-preheader-retained-directive-bare-bom]
[fixture: pie/div-preheader-retained-directive-bare-ls]
[fixture: pie/div-preheader-retained-directive-bare-ls-line]
[fixture: pie/div-preheader-retained-yaml-bare-bom]
[fixture: pie/div-preheader-retained-yaml-bare-ls]
[fixture: pie/div-preheader-retained-yaml-bare-ls-line]
[fixture: pie/div-preheader-retained-yaml-bare-then-directive]
[fixture: pie/lex-preheader-retained-directive-bare-ascii]
[fixture: pie/lex-preheader-retained-directive-bare-ascii-line]
[fixture: pie/lex-preheader-retained-yaml-bare-ascii]
[fixture: pie/lex-preheader-retained-yaml-bare-ascii-line]
[fixture: pie/lex-preheader-retained-yaml-bare-then-directive-ascii]
[fixture: pie/div-preheader-bare-ls-blank]
[fixture: pie/div-preheader-bare-ps-blank]
[fixture: pie/div-preheader-bare-nbsp-blank]
[fixture: pie/div-preheader-bare-bom-blank]
[fixture: pie/div-preheader-bare-vt-blank]
[fixture: pie/div-preheader-bare-ff-blank]
[fixture: pie/div-preheader-bare-u1680-blank]
[fixture: pie/div-preheader-bare-u2003-blank]
[fixture: pie/div-preheader-bare-u202f-blank]
[fixture: pie/div-preheader-bare-u205f-blank]
[fixture: pie/div-preheader-bare-u3000-blank]
[fixture: pie/div-preheader-bare-ls-before-header]
[fixture: pie/div-preheader-bare-bom-before-header]
[fixture: pie/lex-preheader-bare-ascii-blank-control]
[fixture: pie/lex-preheader-ls-without-bare-control]
[fixture: pie/comment-preheader-unclosed-percent-brace]
[fixture: pie/lex-bare-percent-braces-before-header]
[fixture: pie/lex-hidden-comment-before-header]
[fixture: pie/frontmatter-nonleading-comment]
[fixture: pie/lex-hidden-directive-second-detection-scan]
[fixture: pie/lex-preheader-yaml-opening-nbsp]
[fixture: pie/lex-preheader-yaml-opening-bom]
[fixture: pie/lex-preheader-yaml-closing-nbsp]
[fixture: pie/lex-preheader-yaml-closing-u3000]
[fixture: pie/lex-preheader-yaml-after-closing-u3000-line]
[fixture: pie/lex-preheader-yaml-adjacent-fence-tail]
[fixture: pie/lex-preheader-yaml-empty-line-control]
[fixture: pie/lex-hidden-directive-second-detection-scan-glued]

PieBodyItem は PieSectionStatement、PieTitleStatement、PieAccTitleStatement、
PieAccDescrStatement、PieAccDescrBlockStatement、PieIgnoredText のいずれかです。
空行やコメントだけの行は本文の項目を作らず、コメントは共通の Comment 記録です。
重複する区分と繰り返した共通の文をすべて別々に保ちます。 [fixture: pie/db-all-fields]
[fixture: pie/lex-section-blank-comment-directive]
[fixture: pie/db-three-definitions]
[fixture: pie/title-repeat]
[fixture: pie/yaml-inline-after-title]

`showData` は、書かれたヘッダーのキーワードに対してだけ true です。
なければ textBeforeShowData は空で、pie の後の隠れた形は body を始めます。
書かれたフラグの後の隠れた形も body を始めます。
隠れた形が物理改行を消費しても、
これらの欄は書かれた構造を保ちます。 [fixture: pie/showdata]
[fixture: pie/review-hidden-directive-before-showdata]
[fixture: pie/review-yaml-before-showdata]
[fixture: pie/frontmatter-after-header]
[fixture: pie/lex-yaml-after-showdata-before-first-section]
[fixture: pie/lex-yaml-after-showdata-eof]
[fixture: pie/lex-hidden-directive-with-second-hidden-token]

### PieSectionStatement

| 欄                | 型                     | 意味                           |
| ----------------- | ---------------------- | ------------------------------ |
| `label`           | StringLiteral          | 空も含む、引用符つきのラベル。 |
| `textBeforeColon` | list of PieIgnoredText | コロンの前の隠れた形。         |
| `textBeforeValue` | list of PieIgnoredText | コロンの後の隠れた形。         |
| `value`           | NumericLiteral         | 書かれた区分の数。             |
| `textAfter`       | list of PieIgnoredText | 値の後、EOL の前の隠れた形。   |

子の欄: `label`、`textBeforeColon`、`textBeforeValue`、`value`、`textAfter`。
範囲はラベルの開き引用符から数の値か最後の textAfter までです。
コロンは含み、EOL は除きます。
可視の EOL の改行の後にある隠れた形は、代わりに図の body に入ります。
隙間で別々に認識した隠れた形は、
それぞれリストの 1 項目です。 [fixture: pie/review-yaml-between-label-colon]
[fixture: pie/frontmatter-between-section-parts]
[fixture: pie/gram-section-eof-hidden-yaml]
[fixture: pie/yaml-inline-after-title]
[fixture: pie/lex-yaml-before-colon-two-blocks]
[fixture: pie/lex-hidden-before-colon-lf]
コロンとその数の間の隣接する YAML の区切り 3 行は、
1 個の textBeforeValue です。 [fixture: pie/lex-yaml-three-fences-before-value]

StringLiteral は、対応する引用符の間の書かれた内容を、復号せずに持ちます。
raw は元の引用符つきのソース全体を保ち、closed は true です。
NumericLiteral は raw に元の綴り、value に共通の double を保ちます。
負のゼロと正の無限大も含みます。
両方の引用符、余白、実体参照、物理行終端、数の精度を、書かれたとおりに保ちます。
数のようなラベルでも Identifier は作りません。 [fixture: pie/label-single-quote]
[fixture: pie/label-escaped-quotes]
[fixture: pie/label-unknown-escapes]
[fixture: pie/label-whitespace]
[fixture: pie/label-crlf]
[fixture: pie/entity-single-quoted]
[fixture: pie/number-negative-zero]
[fixture: pie/number-overflow]
[fixture: pie/number-decimal-leading-zero]
[fixture: pie/review-number-fraction-precision]
[fixture: pie/db-numeric-label-order]

コロンと数がある空の引用符つきラベルも区分です。
重複したラベルも別の節点として保ちます。
重複の変換や抑制は Db の処理で、
ソースのリストを置き換えません。 [fixture: pie/label-empty]
[fixture: pie/review-label-empty-single]
[fixture: pie/lex-empty-label-duplicate]
[fixture: pie/db-three-definitions]
[fixture: pie/label-escaped-name-collision]

### PieTitleStatement

| 欄          | 型                     | 意味                 |
| ----------- | ---------------------- | -------------------- |
| `value`     | PieLiteral or null     | 書かれた共通の値。   |
| `textAfter` | list of PieIgnoredText | EOL の前の隠れた形。 |

title と ASCII 空白かタブ 1 個の後から行の値の末尾までです。
残る両端の空白は保ちます。
その区切りの後に何もない場合と、
title に区切りがない場合は null です。 [fixture: pie/title-spaces]
[fixture: pie/review-title-bare-lone-eof]
[fixture: pie/lex-empty-title-vs-null-reference]
[fixture: pie/title-whitespace-last]
[fixture: pie/title-comment]
[fixture: pie/ast-title-tab-null-eof]
[fixture: pie/lex-title-tab-separator]
[fixture: pie/ast-common-values-directive-only]
[fixture: pie/lex-common-values-comment-region-ls]

子の欄: `value`、`textAfter`。
範囲は title から、値の最後の文字までで、値が null ならキーワードまでです。
textAfter があれば最後の形まで延ばし、EOL と無関係な外側の余白は除きます。
可視の EOL の改行の後の隠れた形は、
代わりに図の body に入ります。 [fixture: pie/title-spaces]
[fixture: pie/review-title-bare-lone-eof]
[fixture: pie/lex-empty-title-vs-null-reference]
[fixture: pie/title-whitespace-last]
[fixture: pie/title-comment]
[fixture: pie/review-hidden-directive-title-eof]

### PieAccTitleStatement

| 欄          | 型                     | 意味                 |
| ----------- | ---------------------- | -------------------- |
| `value`     | PieLiteral or null     | 書かれた共通の値。   |
| `textAfter` | list of PieIgnoredText | EOL の前の隠れた形。 |

コロン直後から行の値の末尾までの、書かれたテキストです。
両端の余白を保ちます。
内容が空なら null、空白だけならリテラルです。 [fixture: pie/acctitle-spaces]
[fixture: pie/acctitle-eof]
[fixture: pie/review-acctitle-whitespace-final]
[fixture: pie/acctitle-comment]
[fixture: pie/ast-common-values-directive-only]
[fixture: pie/lex-common-values-comment-region-ls]

子の欄: `value`、`textAfter`。
範囲は accTitle から、コロンか値の最後の文字までです。
textAfter があれば最後の形まで延ばし、EOL と無関係な外側の余白は除きます。
可視の EOL の改行の後の隠れた形は、
代わりに図の body に入ります。 [fixture: pie/acctitle-spaces]
[fixture: pie/acctitle-eof]
[fixture: pie/review-acctitle-whitespace-final]
[fixture: pie/acctitle-comment]
[fixture: pie/review-hidden-directive-acctitle-eof]

### PieAccDescrStatement

| 欄          | 型                     | 意味                 |
| ----------- | ---------------------- | -------------------- |
| `value`     | PieLiteral or null     | 書かれた共通の値。   |
| `textAfter` | list of PieIgnoredText | EOL の前の隠れた形。 |

コロン直後から行の値の末尾までの、書かれたテキストです。
両端の余白を保ちます。
内容が空なら null、空白だけならリテラルです。 [fixture: pie/accdescr-spaces]
[fixture: pie/accdescr-eof]
[fixture: pie/review-accdescr-whitespace-final]
[fixture: pie/accdescr-comment]
[fixture: pie/ast-common-values-directive-only]
[fixture: pie/lex-common-values-comment-region-ls]

子の欄: `value`、`textAfter`。
範囲は accDescr から、コロンか値の最後の文字までです。
textAfter があれば最後の形まで延ばし、EOL と無関係な外側の余白は除きます。
可視の EOL の改行の後の隠れた形は、
代わりに図の body に入ります。 [fixture: pie/accdescr-spaces]
[fixture: pie/accdescr-eof]
[fixture: pie/review-accdescr-whitespace-final]
[fixture: pie/accdescr-comment]
[fixture: pie/review-hidden-directive-accdescr-eof]

### PieAccDescrBlockStatement

| 欄          | 型                     | 意味                 |
| ----------- | ---------------------- | -------------------- |
| `value`     | PieLiteral or null     | 書かれた共通の値。   |
| `textAfter` | list of PieIgnoredText | EOL の前の隠れた形。 |

波括弧の中身から両端の共通の空白を除いたものです。
空白、共通のディレクティブ、コメント領域だけなら null です。
内側の空白、行終端、引用符、
エスケープは書かれたテキストを保ちます。 [fixture: pie/accdescr-block]
[fixture: pie/accdescr-block-unicode-trim]
[fixture: pie/accdescr-space-block-last]
[fixture: pie/accdescr-empty-block-last]
[fixture: pie/directive-block-lines]
[fixture: pie/accdescr-block-comment-lines]
[fixture: pie/review-block-quotes-backslashes]
[fixture: pie/gram-description-block-directive-only]
[fixture: pie/gram-description-block-comment-only]

子の欄: `value`、`textAfter`。
範囲は accDescr から、最初の閉じ波括弧までです。
textAfter があれば最後の形まで延ばし、EOL と無関係な外側の余白は除きます。
可視の EOL の改行の後の隠れた形は、
代わりに図の body に入ります。 [fixture: pie/accdescr-block]
[fixture: pie/accdescr-block-unicode-trim]
[fixture: pie/accdescr-space-block-last]
[fixture: pie/accdescr-empty-block-last]
[fixture: pie/directive-block-lines]
[fixture: pie/accdescr-block-comment-lines]
[fixture: pie/review-block-quotes-backslashes]
[fixture: pie/gram-description-block-directive-only]
[fixture: pie/gram-description-block-comment-only]
[fixture: pie/gram-block-eof-hidden-yaml]

ブロックは閉じる必要があるので、closed の欄は要りません。
空の形もこの文で、前の説明の代入を置き換えられます。
任意の単位間に置ける、
自由な無視する形ではありません。 [fixture: pie/accdescr-block-unclosed]
[fixture: pie/accdescr-empty-block-last]
[fixture: pie/lex-block-empty-followed-inline]

### PieLiteral

| 欄      | 型     | 意味                         |
| ------- | ------ | ---------------------------- |
| `value` | string | 共通の値の書かれたテキスト。 |

子の欄はありません。
範囲は、上で定めた値のソースの最初の文字から最後の文字までで、
内側の共通のトリビアをまたぎます。
null に空のリテラルは作りません。
value からは共通のディレクティブ、コメント領域、選ばれたセミコロンを除き、
ほかのソース文字は保ちます。
引用符に見えるテキストも StringLiteral ではなく PieLiteral です。 [fixture: pie/title-spaces]
[fixture: pie/acctitle-eof]
[fixture: pie/accdescr-block]
[fixture: pie/directive-title-middle]
[fixture: pie/accdescr-block-comment-lines]
[fixture: pie/style-acctitle-trigger]
[fixture: pie/review-common-quotes-backslashes]

### PieIgnoredText

| 欄      | 型     | 意味                               |
| ------- | ------ | ---------------------------------- |
| `kind`  | string | yaml-block または directive。      |
| `value` | string | 区切りを含む、空でない無視する形。 |

子の欄はありません。
範囲は認識した `---` か `%%{` の開きから閉じる区切りまでで、
任意の前置 ASCII 空白と、字句規則が閉じの後で消費する LF は除きます。
内側の行終端と余白は書かれたテキストに含めます。
追加した LF は範囲にも値にも入りません。 [fixture: pie/frontmatter-between-section-parts]
[fixture: pie/review-directive-hidden-crlf]
[fixture: pie/review-directive-hidden-space-boundary]
[fixture: pie/gram-section-eof-hidden-yaml]
[fixture: pie/review-directive-hidden-eof]
[fixture: pie/lex-yaml-body-unicode-separators]
[fixture: pie/lex-hidden-body-unicode-separators]
[fixture: pie/lex-hidden-directive-lone-cr]

YAML の閉じは、
[隠れた YAML](../diagrams/pie.ja.md#隠れた-yaml) の本文がある一致を優先する順で選びます。
直後の閉じに見える区切りは、代わりに葉の value に入る場合があります。
隣接する区切り 3 行は、
中央の区切りを含む 1 個の葉です。 [fixture: pie/lex-yaml-three-adjacent-fences]
[fixture: pie/lex-yaml-immediate-fence-before-later-closer]
ヘッダー前に保持する隣接した区切り 3 行のブロックは、
1 個の textBeforeHeader です。 [fixture: pie/lex-nonleading-yaml-three-adjacent-fences]

隠れた YAML の各箇所は kind が yaml-block、
隠れた DIRECTIVE の各箇所は directive です。
本文が空でも区切りが書かれているので、無視する葉は空になりません。
value から共通のディレクティブ、コメント領域、選ばれたセミコロンを除いても、
ソースの範囲はそれらをまたぎます。
YAML のプロパティや独自の設定の効果は持ちません。
その中で認識した共通のディレクティブは、
共通の効果を保ちます。 [fixture: pie/review-yaml-hidden-empty]
[fixture: pie/review-directive-empty-body]
[fixture: pie/lex-yaml-body-directive-content]
[fixture: pie/lex-yaml-body-comment-content]
[fixture: pie/lex-yaml-opener-selected-semicolon]
[fixture: pie/lex-hidden-body-global-directive]
[fixture: pie/lex-yaml-leading-config-not-applied]
[fixture: pie/frontmatter-after-header]
[fixture: pie/lex-hidden-global-comment-region]
[fixture: pie/lex-hidden-opener-selected-semicolon]
[fixture: pie/lex-hidden-closer-selected-semicolon]
[fixture: pie/lex-hidden-closer-global-directive]

隠れた形は、上記の名前のある隙間、ヘッダー前のリスト、body の位置に持ち、
別の場所に重複して持ちません。
すでに始まった文字列や説明ブロックが囲む隠れた形に見えるものは、内容です。
行の値は最初の `%%` の前で終わり、
そこで始まる隠れた DIRECTIVE はその文の textAfter に入ります。
行の値がすでに読んだ YAML のようなテキストは、内容のままです。
代替の図のコメントは、PieIgnoredText ではなく共通の Comment です。
読み飛ばすテキストを保てるので、
差異として拒否する理由にはなりません。 [fixture: pie/review-yaml-between-label-colon]
[fixture: pie/frontmatter-between-section-parts]
[fixture: pie/frontmatter-nonleading-comment]
[fixture: pie/review-hidden-directive-before-showdata]
[fixture: pie/review-hidden-directive-in-string]
[fixture: pie/review-block-hidden-yaml-text]
[fixture: pie/lex-hidden-comment-fallback-no-boundary]
[fixture: pie/review-hidden-directive-title-eof]
[fixture: pie/review-hidden-directive-acctitle-eof]
[fixture: pie/review-hidden-directive-accdescr-eof]
[fixture: pie/lex-yaml-in-title-line]
