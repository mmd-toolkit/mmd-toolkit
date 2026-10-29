# Pie

英語版: [pie.md](./pie.md)

`pie` を定義します。
ソースの木は [ast/pie.md](../ast/pie.ja.md)、記録される値は、
[tests の要約](../../../tests/docs/db-summaries.ja.md#pie) にあります。

字句と文法の規則は
[pie.langium](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/pie/pie.langium#L1-L20)
と、
インポートする
[common.langium](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/common.langium#L1-L34)
に従います。

## 検出

[detection.md](../detection.ja.md) の項目 13 は、
正確な小文字の接頭部 `pie` で pie を選びます。
検出に接尾辞の境界はなく、`pieChart` は pie と検出した後で字句規則が拒否します。
`Pie` と `PIE` は pie を選びません。 [fixture: pie/header-only]
[fixture: pie/header-letter-suffix] [fixture: pie/header-capitalized]
[fixture: pie/header-uppercase]

共通の先頭トリビア、フロントマター、ディレクティブ、コメント領域、
HTML 属性の引用符、実体参照、選ばれたセミコロンの規則を適用します。
検出がヘッダー前で通過させた裸のパーセント対の行は、
印が `%%` の共通の Comment です。
`%%{}%%`、`%%{!}%%`、閉じない `%%{!` の行も含みます。
PieIgnoredText ではなく、 pie の字句規則で読み直しません。
[fixture: pie/directive-before-header] [fixture: pie/comment-before-header]
[fixture: pie/html-all-texts] [fixture: pie/entity-all-texts]
[fixture: pie/style-label-trigger] [fixture: pie/review-comment-bare-header-eof]
[fixture: pie/lex-bare-percent-braces-before-header]
[fixture: pie/lex-hidden-comment-before-header]
[fixture: pie/comment-preheader-unclosed-percent-brace]

検出点では、裸のパーセント対の行を通り過ぎる前に、
共通の [フロントマター](../common.ja.md#フロントマター) の形を満たすブロックが 1
つあれば、それを飛ばして後のヘッダーを探します。
先頭のフロントマターではないため、図の字句解析器はブロックを読みます。
pie は、その残されたテキストに隠れた YAML の規則を適用します。
一致すればブロックを PieIgnoredText に保ち、そのタイトルと設定は適用しません。
gitgraph も一致する隠れたブロックを保ちます。
以下で引用するほかの図種の入力は拒否します。
[fixture: pie/frontmatter-nonleading-comment]
[fixture: gitgraph/lex-yaml-after-comment]
[fixture: pie/lex-yaml-leading-config-not-applied]
[fixture: pie/lex-yaml-after-leading-lf]
[fixture: pie/lex-yaml-bom-opening-only]
[fixture: pie/lex-yaml-after-directive-line]
[fixture: pie/lex-yaml-after-directive-glued]
[fixture: common/directive-before-frontmatter]
[fixture: common/frontmatter-leading-newline]
[fixture: common/frontmatter-nonleading-sequence]
[fixture: common/frontmatter-nonleading-class]
[fixture: common/frontmatter-nonleading-state]
[fixture: agentflow/db-frontmatter-after-comment]
[fixture: block/gram-frontmatter-comment-before]
[fixture: ishikawa/frontmatter-after-comment]
[fixture: usecase/frontmatter-after-comment]
[fixture: venn/frontmatter-comment-before]

両方の区切りのバイトオーダーマークが一致すれば、
先頭のフロントマターになる場合があります。
先頭以外のブロックの不正な YAML 本文も読み飛ばし、YAML として検査しません。
本文の行がない隣り合う `---`、閉じない区切り、前にある裸の `%%` の行は、
検出による飛ばしを止め、拒否する `---` 疑似図種を残します。
[fixture: pie/lex-yaml-bom-both-fences]
[fixture: pie/lex-yaml-after-comment-invalid-body]
[fixture: pie/lex-yaml-after-comment-adjacent-fences]
[fixture: pie/frontmatter-unclosed] [fixture: pie/lex-yaml-after-bare-comment]
[fixture: common/frontmatter-adjacent-delimiters]
[fixture: common/frontmatter-unclosed]
[fixture: pie/detect-block-after-bare-brace-line]

この飛ばしは、裸の行の通過やディレクティブの再走査の前に、1 回だけ試します。
2 つ目のブロックや、再走査のディレクティブの後のブロックは飛ばしません。
先にブロックを飛ばし、その後でディレクティブを再走査する場合は通ります。
本来の先頭のフロントマターの後に、この別の保持するブロックを置けます。
検出点の先頭の字下げはトリビアなので、
先頭以外の両方の区切りの字下げが等しければ、閉じだけに字下げが残り、
飛ばしを妨げます。 [fixture: pie/detect-two-nonleading-blocks]
[fixture: pie/detect-block-after-real-frontmatter]
[fixture: pie/detect-second-scan-directive-before-block]
[fixture: pie/detect-block-before-second-scan-directive]
[fixture: pie/detect-block-equally-indented-fences]

検出は、裸の `%%` の行とヘッダーの間の共通の空白を通過させます。
共通の CR/CRLF 変換の後、その間に残る ASCII 空白、タブ、LF 以外の共通の空白を、
Mermaid の pie の字句規則は拒否し、この仕様は先頭のトリビアとして受理します。
空白だけの行と、ヘッダーの直前の LS やバイトオーダーマークも含みます。
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.ja.md)
を参照してください。
その場所の ASCII 空白とタブの行や、裸の行がない LS の行は、両者が受理します。
[fixture: pie/div-preheader-bare-ls-blank]
[fixture: pie/div-preheader-bare-ps-blank]
[fixture: pie/div-preheader-bare-nbsp-blank]
[fixture: pie/div-preheader-bare-bom-blank]
[fixture: pie/lex-preheader-bare-ascii-blank-control]
[fixture: pie/lex-preheader-ls-without-bare-control]
[fixture: pie/div-preheader-bare-vt-blank]
[fixture: pie/div-preheader-bare-ff-blank]
[fixture: pie/div-preheader-bare-u1680-blank]
[fixture: pie/div-preheader-bare-u2003-blank]
[fixture: pie/div-preheader-bare-u202f-blank]
[fixture: pie/div-preheader-bare-u205f-blank]
[fixture: pie/div-preheader-bare-u3000-blank]
[fixture: pie/div-preheader-bare-ls-before-header]
[fixture: pie/div-preheader-bare-bom-before-header]

保持した先頭以外のブロックや再走査のディレクティブの後に裸の行がある場合も、
この扱いを適用します。
保持したブロックと再走査のディレクティブの間に、
通過させたトリビアがある場合も同じです。
[fixture: pie/div-preheader-retained-directive-bare-bom]
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

## 字句構造

### 規則の順序

[common.md](../common.ja.md#ソースの読み方) の変換した図のテキストを読みます。
検出点から、単位の位置ごとに次の順で規則を試し、最初の一致を取り、
その後で再び試します。
一般的な最長一致ではありません。
読めない文字があれば入力全体を拒否します。
裸の `%%` の行と、検出がそれと一緒に通過させる空白と改行は読み直しません。
裸の行は共通の Comment とし、空白と改行はトリビアです。
[fixture: pie/div-preheader-retained-directive-bare-bom]
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
先頭以外の `---` ブロックと、検出の再走査が見つけたディレクティブは、
pie の隠れた YAML と隠れた DIRECTIVE の規則で読みます。
検出を通っても受理されるとは限らず、それらの規則と境界を適用します。
[fixture: pie/lex-preheader-yaml-opening-nbsp]
[fixture: pie/lex-preheader-yaml-opening-bom]
[fixture: pie/lex-preheader-yaml-closing-nbsp]
[fixture: pie/lex-preheader-yaml-closing-u3000]
[fixture: pie/lex-preheader-yaml-after-closing-u3000-line]
[fixture: pie/lex-preheader-yaml-adjacent-fence-tail]
[fixture: pie/lex-preheader-yaml-empty-line-control]
[fixture: pie/lex-hidden-directive-second-detection-scan]
[fixture: pie/lex-hidden-directive-second-detection-scan-glued]
[fixture: pie/review-hidden-directive-in-string]
[fixture: pie/review-hidden-directive-in-block]
[fixture: pie/recover-lexer-first] [fixture: pie/recover-lexer-final]
[fixture: pie/comment-preheader-unclosed-percent-brace]
[fixture: pie/lex-bare-percent-braces-before-header]
[fixture: pie/lex-hidden-comment-before-header]

1. 下記のキーワード境界を持つ `showData`。
2. 同じ境界を持つ `pie`。
3. `:`。
4. `pie-number`。
   小数を整数より先に試します。
5. 1 つの複合した一致としての `acc-descr-line` または `acc-descr-block`。
6. 1 つの複合した一致としての `acc-title-line`。
7. 1 つの複合した一致としての `title-line`。
8. `string`。
9. 1 つの改行を読む `newline`。
10. 隠れた ASCII 空白。
11. 隠れた YAML。
12. 隠れた DIRECTIVE。
13. 図のコメント。 [fixture: pie/db-all-fields]
    [fixture: pie/review-block-brace-colon-priority]
    [fixture: pie/review-hidden-directive-in-string]
    [fixture: pie/review-hidden-directive-in-block] [fixture: pie/lex-tab]
    [fixture: pie/review-yaml-before-showdata]

### キーワードの境界

`pie` と `showData` は大文字と小文字を区別し、直後には共通の空白、
テキストの終わり、`%%` のいずれかが必要です。
境界は共通のディレクティブを除いたテキストで判断します。
キーワードと showData やラベルの間に接着したディレクティブは、境界を与えません。
英字、数字、underscore、ダッシュ、ASCII 外の字母、コロン、 `#`、単独の `%`、
開き波括弧、引用符はこの境界を満たしません。 [fixture: pie/header-letter-suffix]
[fixture: pie/header-digit-suffix] [fixture: pie/header-underscore-suffix]
[fixture: pie/header-dash-suffix] [fixture: pie/header-unicode-suffix]
[fixture: pie/header-colon] [fixture: pie/header-quote-glued]
[fixture: pie/lex-header-hash-boundary]
[fixture: pie/lex-header-single-percent-boundary]
[fixture: pie/lex-header-brace-boundary] [fixture: pie/showdata-letter-suffix]
[fixture: pie/review-showdata-digit-suffix] [fixture: pie/showdata-word-suffix]
[fixture: pie/showdata-dash-suffix] [fixture: pie/showdata-unicode-suffix]
[fixture: pie/showdata-quote-glued] [fixture: pie/lex-showdata-colon-glued]
[fixture: pie/lex-showdata-hash-glued]
[fixture: pie/lex-showdata-single-percent-glued]
[fixture: pie/lex-showdata-brace-glued] [fixture: pie/lex-showdata-eof-boundary]
[fixture: pie/comment-header-glued] [fixture: pie/comment-showdata-glued]
[fixture: pie/lex-header-global-directive-glued-showdata]
[fixture: pie/lex-header-global-directive-glued-label]
[fixture: pie/lex-showdata-global-directive-glued-label]

境界の共通の空白は隠れた空白より広い集合です。
NBSP やバイトオーダーマークは境界を満たしても、
単位間では読めない場合があります。
検出点より前の先頭の共通の空白は、トリビアです。
[fixture: pie/lex-preheader-yaml-after-closing-u3000-line]
[fixture: pie/lex-header-nbsp] [fixture: pie/lex-showdata-bom]
[fixture: pie/lex-unicode-before-header] [fixture: pie/lex-bom-before-header]

### 数

`pie-number` は任意のマイナスと、その後の小数か整数です。
小数は 1 個以上の ASCII 数字、ドット、1 個以上の数字で、先頭のゼロを許します。
整数はゼロ 1 個、またはゼロ以外の数字と 0 個以上の数字です。
選んだ一致は、直後にドットがあるところでは終わりません。
[fixture: pie/number-zero] [fixture: pie/number-negative-zero]
[fixture: pie/number-decimal] [fixture: pie/number-decimal-leading-zero]
[fixture: pie/number-leading-zero] [fixture: pie/number-double-zero]
[fixture: pie/number-range] [fixture: pie/number-dots]

プラス、離れたマイナス、ドットだけで始まるか終わる小数、指数、十六進数、NaN、
Infinity の綴り、語の接尾辞は拒否します。
不正な末尾の前で短い数に一致しても、残りの入力が図を拒否させます。
小数部は 2 桁に制限しません。 [fixture: pie/number-plus]
[fixture: pie/number-negative-space] [fixture: pie/number-decimal-no-integer]
[fixture: pie/number-decimal-no-fraction] [fixture: pie/number-exponent]
[fixture: pie/number-exponent-uppercase] [fixture: pie/number-hex]
[fixture: pie/number-nan] [fixture: pie/number-infinity]
[fixture: pie/number-tail] [fixture: pie/number-decimal]

### 文字列

`string` は一致する一重か二重の引用符で開閉し、空でもかまいません。
間では、対応する引用符と backslash 以外の任意の文字、
または backslash と次の文字を読みます。
その次の文字は物理改行、U+2028、U+2029 ではいけません。
エスケープした対応する引用符は文字列を閉じません。
閉じる引用符が必要です。 [fixture: pie/label-single-quote]
[fixture: pie/label-empty] [fixture: pie/review-label-empty-single]
[fixture: pie/label-escaped-quotes] [fixture: pie/label-escaped-newline]
[fixture: pie/review-label-escaped-crlf] [fixture: pie/label-backslash-ls]
[fixture: pie/label-backslash-ps] [fixture: pie/label-unclosed]
[fixture: pie/label-unclosed-single] [fixture: pie/label-escaped-final-quote]

エスケープしていない改行、U+2028、U+2029 は文字列の内容です。
反対側の引用符、パーセント対、見かけの YAML ブロック、
共通の走査後に残るディレクティブのような形も内容です。
先の文字列規則が読むので、隠れた形にはなりません。
空白とエスケープの綴りは StringLiteral に保ちます。
[fixture: pie/label-multiline] [fixture: pie/label-cr] [fixture: pie/label-crlf]
[fixture: pie/label-ls] [fixture: pie/label-ps]
[fixture: pie/label-opposite-quote] [fixture: pie/label-punctuation]
[fixture: pie/review-label-hidden-yaml-text]
[fixture: pie/review-hidden-directive-in-string] [fixture: pie/label-whitespace]
[fixture: pie/label-unknown-escapes]

### 共通の複合した形

以下の共通の複合した形は、単位の位置ならどこでも始まり、
前の ASCII 空白とタブは任意です。
その字下げは、書かれたキーワードの外です。
`title-line` は `title` と、その後の ASCII 空白かタブ 1 個と行の残り、
または `title` だけを読みます。
行のテキストは最初の `%%` か物理行末の直前で終わり、空でもかまいません。
[fixture: pie/header-title-inline] [fixture: pie/title-spaces]
[fixture: pie/title-comment] [fixture: pie/review-title-bare-lone-eof]
[fixture: pie/comment-title-value-start]
[fixture: pie/lex-title-double-percent-no-gap]
[fixture: pie/lex-title-tab-separator] [fixture: pie/ast-title-tab-null-eof]
[fixture: pie/ast-common-values-directive-only]

`acc-title-line` は `accTitle`、0 個以上の ASCII 空白とタブ、コロン、
同じ空でもよい行のテキストを読みます。
`acc-descr-line` は `accDescr` で同じことをします。
どちらの値も次の物理行を取らず、空行、コメント行、
ディレクティブだけの行があっても同じです。 [fixture: pie/acctitle-spaces]
[fixture: pie/accdescr-spaces] [fixture: pie/acctitle-eof]
[fixture: pie/accdescr-eof] [fixture: pie/title-blank-gap]
[fixture: pie/acctitle-blank-gap] [fixture: pie/accdescr-blank-gap]
[fixture: pie/title-comment-gap] [fixture: pie/acctitle-comment-gap]
[fixture: pie/accdescr-comment-gap] [fixture: pie/title-directive-gap]
[fixture: pie/acctitle-directive-gap] [fixture: pie/accdescr-directive-gap]

これらの形は固有の構成要素の規則を持ち、pie/showData の境界とは違います。
`title2` は裸の title 接頭部を読み、残る数で失敗します。
必要な区切りがない `title#`、`title%`、`title{` は拒否しますが、
裸の title の後のパーセント対はコメントを始められます。
必要なコロンやブロックの開きがないアクセシビリティの語は拒否します。
コロンの前の隙間では Unicode 空白を許しません。
[fixture: pie/review-title-digit-suffix]
[fixture: pie/review-acc-title-digit-suffix]
[fixture: pie/review-acc-descr-digit-suffix]
[fixture: pie/lex-title-hash-no-gap]
[fixture: pie/lex-title-single-percent-no-gap]
[fixture: pie/lex-title-brace-no-gap]
[fixture: pie/lex-title-double-percent-no-gap]
[fixture: pie/lex-acctitle-brace-without-colon]
[fixture: pie/lex-accdescr-hash-without-delimiter]
[fixture: pie/lex-accdescr-single-percent-without-delimiter]
[fixture: pie/lex-accdescr-double-percent-without-delimiter]
[fixture: pie/lex-accdescr-quote-without-delimiter]
[fixture: pie/lex-accdescr-bare-at-eof] [fixture: pie/acctitle-unicode-colon]
[fixture: pie/accdescr-unicode-colon]

ブロックの選択肢は `accDescr`、0 個以上の共通の空白、`{`、
最初の `}` までの任意の文字を読みます。
波括弧の前の隙間は、空行、コメント行、ディレクティブ行、
Unicode 区切りをまたげます。
波括弧は入れ子にならず、引用符と backslash は閉じを保護しません。
別の開き波括弧は普通の内容です。
閉じないブロックは拒否します。
コロンがあれば、値が `{` で始まっても行の選択肢です。
[fixture: pie/accdescr-block-gap]
[fixture: pie/review-accdescr-block-blank-before-opener]
[fixture: pie/accdescr-block-comment-gap]
[fixture: pie/accdescr-block-directive-gap]
[fixture: pie/review-block-unicode-opener-separators]
[fixture: pie/accdescr-block-nested] [fixture: pie/accdescr-block-quote-brace]
[fixture: pie/accdescr-block-escaped-brace]
[fixture: pie/lex-block-open-brace-content-single-close]
[fixture: pie/accdescr-block-unclosed]
[fixture: pie/review-block-brace-colon-priority]

### 隠れた ASCII 空白

先の規則の後で、ASCII 空白とタブの空でない最長列を読み飛ばします。
複合した形や文字列がすでに読んだものは、値のテキストのままです。
LF は可視の改行で、共通の CR/CRLF 変換はそれぞれを 1 つの改行にします。
LS/PS とほかの Unicode 空白は、元の EOF と追加 LF の間を含め、
隠れた区切りではありません。
文字列や共通の値の内容、共通の先頭トリビアにはなれます。 [fixture: pie/lex-tab]
[fixture: pie/lex-tab-blank-line] [fixture: pie/label-whitespace]
[fixture: pie/lex-cr] [fixture: pie/lex-crlf] [fixture: pie/lex-ls-line]
[fixture: pie/lex-ps-line] [fixture: pie/lex-unicode-eof]
[fixture: pie/lex-nbsp] [fixture: pie/lex-ideographic] [fixture: pie/lex-bom]
[fixture: pie/lex-unicode-before-header] [fixture: pie/title-line-separators]
[fixture: pie/accdescr-block-line-separators]

### 隠れた YAML

単位の位置では、`---`、0 個以上の ASCII 空白とタブ、
LF が隠れた YAML を開きます。
開きは物理行頭でなくてもかまいません。
まず本文がある形を試し、LF、LS、PS を含むできるだけ少ない任意の文字を、
後続の LF と、その後の字下げのない `---` まで読みます。
閉じの直後は LF、共通の空白、またはテキストの終わりでなければいけません。
本文がある一致がなければ、開始の LF の直後が閉じの、空の本文を試します。
YAML の内容は検査しません。
[fixture: pie/lex-yaml-immediate-fence-before-later-closer]
[fixture: pie/lex-preheader-yaml-opening-nbsp]
[fixture: pie/lex-preheader-yaml-opening-bom]
[fixture: pie/lex-preheader-yaml-empty-line-control]
[fixture: pie/frontmatter-between-section-parts]
[fixture: pie/review-yaml-opening-tabs] [fixture: pie/review-yaml-hidden-empty]
[fixture: pie/review-yaml-hidden-invalid]
[fixture: pie/review-yaml-closing-space-boundary]
[fixture: pie/lex-yaml-body-unicode-separators]

この優先順では、最初の後続の区切りも本文になる場合があります。
隣接する区切りの 3 行は 1 個のブロックで、中央の区切りが本文に入ります。
区分の隙間や、ヘッダー前に保持する先頭以外のブロックでも同じ順に選びます。
[fixture: pie/lex-yaml-three-adjacent-fences]
[fixture: pie/lex-yaml-three-fences-before-value]
[fixture: pie/lex-nonleading-yaml-three-adjacent-fences]
空のブロックが 2 個に見えても、区切りが余る場合があります。
最初のブロックが区分に見える行を含み、
後に残る `x` と最後の `---` を読めずに入力を拒否します。
[fixture: pie/lex-yaml-apparent-empty-pairs-unmatched-fence]
最初の本文に適格な閉じがあれば、空でない 2 個のブロックは別々です。
[fixture: pie/lex-yaml-before-colon-two-blocks]

閉じる区切りの直後の LF は消費し、ほかの空白の境界は先読みするだけです。
[fixture: pie/lex-preheader-yaml-closing-nbsp]
[fixture: pie/lex-preheader-yaml-closing-u3000]
[fixture: pie/lex-preheader-yaml-after-closing-u3000-line]
[fixture: pie/lex-preheader-yaml-adjacent-fence-tail]
条件を満たさない `---x` は、後に適合する区切りがあれば本文です。
字下げされた閉じ、開きの Unicode 空白、閉じの欠落は拒否します。
すでに始まった文字列、タイトル、説明ブロックの YAML のような形は、その内容です。
[fixture: pie/lex-yaml-closer-suffix-skip-later]
[fixture: pie/review-yaml-closing-tab-eof]
[fixture: pie/review-yaml-closing-indent]
[fixture: pie/lex-yaml-opening-unicode-gap] [fixture: pie/yaml-unclosed-in-body]
[fixture: pie/review-label-hidden-yaml-text]
[fixture: pie/review-block-hidden-yaml-text]
[fixture: pie/lex-yaml-in-title-line]
[fixture: pie/lex-yaml-closing-ls-boundary]

認識したブロックはそれぞれ kind が `yaml-block` の PieIgnoredText に保ちます。
ヘッダーの前、showData の前後、区分の隙間、値と EOL の間に置けます。
数と数の間では 2 つの数を残し、数字の前では読めないマイナスを修復しません。
[fixture: pie/frontmatter-nonleading-comment]
[fixture: gitgraph/lex-yaml-after-comment]
[fixture: pie/review-yaml-before-showdata]
[fixture: pie/lex-yaml-after-showdata-before-first-section]
[fixture: pie/review-yaml-between-label-colon]
[fixture: pie/frontmatter-between-section-parts]
[fixture: pie/gram-section-eof-hidden-yaml]
[fixture: pie/gram-block-eof-hidden-yaml]
[fixture: pie/lex-yaml-before-colon-two-blocks]
[fixture: pie/lex-yaml-inside-integer]
[fixture: pie/lex-yaml-between-numeric-sign-and-digit]

### 隠れた DIRECTIVE

共通のディレクティブを除いた後で、単位の位置なら `%%{` から任意の文字を、改行、
共通の空白、テキストの終わりが続く最初の `}%%` まで読みます。
内容は LF、LS、PS を含められ、空や記号だけでもかまいません。
直後の LF は消費し、ほかの空白は先読みするだけです。
kind が `directive` の PieIgnoredText で、共通の Directive 記録ではありません。
[fixture: pie/review-directive-empty-body]
[fixture: pie/review-directive-punctuation-body]
[fixture: pie/review-directive-hidden-crlf]
[fixture: pie/review-directive-hidden-space-boundary]
[fixture: pie/review-directive-hidden-eof]
[fixture: pie/lex-hidden-before-colon-space]
[fixture: pie/lex-hidden-before-colon-lf]
[fixture: pie/review-hidden-directive-ls-boundary]
[fixture: pie/lex-hidden-directive-second-detection-scan]
[fixture: pie/lex-hidden-directive-second-detection-scan-glued]
[fixture: pie/lex-hidden-body-unicode-separators]
[fixture: pie/lex-hidden-directive-lone-cr]
[fixture: pie/lex-hidden-directive-ps-boundary]

直後が数字の閉じの綴りは条件を満たさず、後の閉じで形を終えられます。
適合する閉じがなければ、コメント規則が数字を含む物理行を読む場合があります。
値の欠落なら拒否しますが、完成した値の後の同じ代替は次の行を許します。
文字列やブロックの内容では、先の規則が優先します。
[fixture: pie/lex-hidden-multiple-closers]
[fixture: pie/review-directive-hidden-word-boundary]
[fixture: pie/review-directive-hidden-unclosed]
[fixture: pie/review-directive-open-no-type]
[fixture: pie/lex-hidden-comment-fallback-no-boundary]
[fixture: pie/review-hidden-directive-in-string]
[fixture: pie/review-hidden-directive-in-block]

### コメント

最後の規則は、任意の前置 ASCII 空白とタブ、`%%`、
次の物理改行の直前までの最長のテキストを読みます。
印は `%%`、値はその印の後のテキストで、終わりの LF は消費しません。
行中、裸、3 個のパーセント、失敗したディレクティブのような形でもかまいません。
単独のパーセントはこのコメントを始めません。
[fixture: pie/comment-section-glued] [fixture: pie/comment-section-eof]
[fixture: pie/review-comment-bare-header-eof]
[fixture: pie/lex-native-triple-percent-inline]
[fixture: pie/review-directive-open-no-type]
[fixture: pie/comment-single-percent]

LS/PS は図のコメントを終えません。
共通のコメント領域がそれを切り、
続きを後の物理行のテキストに結び付ける場合があります。
文字列のパーセント対は内容、共通の行の値では値の終わり、
説明ブロックでは最初の閉じ波括弧までの内容です。
どの値の中でも、共通のコメントだけの行は除きます。 [fixture: pie/comment-ls]
[fixture: pie/comment-ps] [fixture: pie/lex-comment-ls-region-bridge]
[fixture: pie/label-punctuation] [fixture: pie/title-comment]
[fixture: pie/acctitle-comment] [fixture: pie/accdescr-comment]
[fixture: pie/accdescr-block-comment-lines] [fixture: pie/comment-label-line]
[fixture: pie/comment-label-single-line]
[fixture: pie/lex-common-values-comment-region-ls]

### 値の中の共通のトリビア

共通のディレクティブと選ばれたセミコロンは、文字列、共通の値、
無視する形のテキストの中に置け、書かれた値からはそのトリビアを除きます。
YAML の区切りや隠れた DIRECTIVE の開始と閉じを分ける場合も含みます。
無視する YAML と隠れた DIRECTIVE の中にも共通のコメント領域を適用します。
隠れた形の認識は、全体を除去する処理ではありません。
[fixture: pie/directive-label-middle] [fixture: pie/directive-block-middle]
[fixture: pie/directive-title-middle]
[fixture: pie/review-style-directive-rejoin-label]
[fixture: pie/lex-yaml-opener-global-directive]
[fixture: pie/lex-yaml-closer-global-directive]
[fixture: pie/lex-hidden-opener-global-directive]
[fixture: pie/lex-yaml-opener-selected-semicolon]
[fixture: pie/lex-hidden-body-global-directive]
[fixture: pie/lex-yaml-body-directive-content]
[fixture: pie/lex-yaml-body-comment-content]
[fixture: pie/lex-global-directive-before-quote-escape]
[fixture: pie/lex-hidden-global-comment-region]
[fixture: pie/lex-hidden-opener-selected-semicolon]
[fixture: pie/lex-hidden-closer-selected-semicolon]
[fixture: pie/lex-hidden-closer-global-directive]

固定したキーワードか数の内部では、
ディレクティブと選ばれたセミコロンに既存の原子的な境界の差異を適用します。
完全な構成要素の間では許し、accTitle とコロン、accDescr と波括弧の間も含みます。
その異なる入力では mermaid.js の共通の除去が数字を結びますが、
単位の境界の隠れた形は結びません。
区分の隙間にある可視の LF は、後のディレクティブだけの行では消えません。
[fixture: pie/div-directive-in-header] [fixture: pie/div-directive-in-showdata]
[fixture: pie/div-directive-in-title-keyword]
[fixture: pie/div-directive-in-acctitle-keyword]
[fixture: pie/div-directive-in-accdescr-keyword]
[fixture: pie/div-directive-number]
[fixture: pie/review-directive-acc-title-colon]
[fixture: pie/review-directive-acc-descr-block-opener]
[fixture: pie/review-directive-number-line-gap]
[fixture: pie/review-directive-label-colon-line-gap]
[fixture: pie/lex-hidden-before-colon-lf]
[fixture: pie/div-atomic-semicolon-number]
[fixture: pie/div-directive-in-accdescr-block-keyword]

共通の style/classDef の行規則は、実体参照の変換前に、
各引き金が選ぶ最後のセミコロンだけを選びます。
ラベルとすべての共通の値の中でも働きます。
変換後の値は [pie の要約](../../../tests/docs/db-summaries.ja.md#pie)
にあります。
大文字と小文字、`#` の前の空白、別の行区間、両方の引き金がある場合は、
共通の規則が区別します。 [fixture: pie/style-label-trigger]
[fixture: pie/style-label-two-semicolons]
[fixture: pie/style-label-three-semicolons]
[fixture: pie/review-style-title-two] [fixture: pie/review-style-acctitle-two]
[fixture: pie/review-style-accdescr-two] [fixture: pie/review-style-block-two]
[fixture: pie/style-label-upper] [fixture: pie/style-label-space]
[fixture: pie/review-style-ls-boundaries]
[fixture: pie/review-style-ps-boundaries]
[fixture: pie/review-style-both-triggers-label] [fixture: pie/entity-all-texts]

## 文法

```text
diagram = newline* "pie" "showData"? body-item* end-of-text
body-item = section-statement | common-statement | newline
section-statement = string ":" pie-number eol
common-statement = title-statement | acc-title-statement
                 | acc-descr-statement | acc-descr-block-statement
title-statement = title-line eol
acc-title-statement = acc-title-line eol
acc-descr-statement = acc-descr-line eol
acc-descr-block-statement = acc-descr-block eol
eol = newline+ | end-of-text
```

文法は [共通の表記](../common.ja.md#表記) を使い、上の可視の単位に適用します。
隠れた形とコメントは固有の保持規則を持ち、可視の区切りを与えません。
本体は空でもよく、空行を持ち、区分と共通の文を混ぜられます。
有効なキーワード境界の後なら、最初の文はヘッダーと同じ行に置けます。
[fixture: pie/header-only] [fixture: pie/lex-tab-blank-line]
[fixture: pie/gram-common-between-sections] [fixture: pie/header-section-inline]
[fixture: pie/header-title-inline]

showData は pie の次の可視の単位として、1 回だけ置けます。
コメントやディレクティブだけの行の前のものを含め、改行があれば置けません。
隠れた形なら、間の物理改行を消費できます。
可視の LF がもう 1 つあれば置けません。 [fixture: pie/showdata]
[fixture: pie/showdata-repeated] [fixture: pie/showdata-next-line]
[fixture: pie/review-showdata-comment-gap]
[fixture: pie/review-showdata-directive-gap]
[fixture: pie/review-hidden-directive-before-showdata]
[fixture: pie/review-yaml-before-showdata]
[fixture: pie/lex-hidden-before-showdata-glued]
[fixture: pie/lex-hidden-before-showdata-extra-lf]
[fixture: pie/lex-hidden-directive-with-second-hidden-token]

区分には文字列、コロン、数、EOL が必要です。
構成要素の欠落や重複、裸のラベル、構成要素間の可視の改行、
同じ行の隣り合う区分は拒否します。
コロンと数のある空のラベルは実在する区分ですが、空の文字列だけなら未完成です。
[fixture: pie/gram-missing-colon] [fixture: pie/gram-missing-number]
[fixture: pie/gram-two-colons] [fixture: pie/gram-bare-label]
[fixture: pie/gram-newline-before-colon]
[fixture: pie/gram-newline-before-number] [fixture: pie/gram-adjacent-sections]
[fixture: pie/label-empty] [fixture: pie/lex-empty-label-alone]
[fixture: pie/lex-empty-label-duplicate]

空の説明ブロックを含め、完成した共通の文にも EOL が必要です。
セミコロンは文の区切りではありません。
行の値なら、セミコロンと見かけ上の後続の文をテキストとして読めます。
2 つ目のヘッダーと、場違いの showData は拒否します。
有効な接頭部や回復できる完全な区分があっても、
どこかの字句や文法が失敗すれば入力全体を拒否します。
[fixture: pie/gram-block-next-inline]
[fixture: pie/lex-block-empty-followed-inline]
[fixture: pie/header-spaced-semicolon] [fixture: pie/lex-section-semicolon]
[fixture: pie/title-semicolon] [fixture: pie/acctitle-semicolons]
[fixture: pie/gram-common-same-line] [fixture: pie/header-twice]
[fixture: pie/review-showdata-after-section] [fixture: pie/recover-lexer-first]
[fixture: pie/recover-parser-extra-token]
[fixture: pie/recover-parser-missing-number]
[fixture: pie/recover-lexer-after-parser]

ソースの終わりは共通の追加 LF を与えますが、書かれた文字は増やしません。
隠れた YAML や DIRECTIVE はそれを消費し、
テキストの終わりによって EOL を満たせます。
後の文の前では、唯一の区切り LF を消費すれば拒否し、
余分の LF があれば EOL を回復します。
区分、閉じた説明ブロック、共通の行の値の後に適用します。
[fixture: pie/gram-section-eof-hidden-yaml]
[fixture: pie/gram-block-eof-hidden-yaml]
[fixture: pie/review-directive-hidden-eof]
[fixture: pie/review-hidden-directive-title-eof]
[fixture: pie/review-hidden-directive-acctitle-eof]
[fixture: pie/review-hidden-directive-accdescr-eof]
[fixture: pie/review-hidden-directive-block-eof]
[fixture: pie/review-hidden-directive-after-section]
[fixture: pie/review-hidden-directive-after-title]
[fixture: pie/review-hidden-directive-after-acctitle]
[fixture: pie/review-hidden-directive-after-accdescr]
[fixture: pie/review-hidden-directive-after-block]
[fixture: pie/lex-yaml-after-value-before-eol]
[fixture: pie/lex-yaml-after-value-extra-eol]
[fixture: pie/lex-yaml-after-block-before-eol]
[fixture: pie/lex-hidden-eof-extra-lf]
[fixture: pie/lex-hidden-after-title-with-space-boundary]
[fixture: pie/lex-hidden-after-title-before-comment]
[fixture: pie/lex-yaml-after-showdata-eof]

### 規則と節点

| 規則                      | 節点                           |
| ------------------------- | ------------------------------ |
| diagram                   | PieDiagram                     |
| section-statement         | PieSectionStatement            |
| title-statement           | PieTitleStatement              |
| acc-title-statement       | PieAccTitleStatement           |
| acc-descr-statement       | PieAccDescrStatement           |
| acc-descr-block-statement | PieAccDescrBlockStatement      |
| string / pie-number       | StringLiteral / NumericLiteral |
| 書かれた共通の値          | PieLiteral                     |
| 保持する隠れた形          | PieIgnoredText                 |

表の文と値の形を次の fixture が示します。 [fixture: pie/db-all-fields]
[fixture: pie/frontmatter-between-section-parts]
[fixture: pie/review-hidden-directive-before-showdata]

### 文法の外での拒否

どれかの区分の値を double に変換してゼロ未満になれば拒否します。
ラベルが重複する場合も検査します。
負の無限大は拒否しますが、負のゼロと負のゼロへ丸める負の小数は拒否しません。
[addSection()](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/pie/pieDb.ts#L36-L46)
の条件であり、書かれた小数の正確な実数としての負かどうかではありません。
[fixture: pie/number-negative] [fixture: pie/db-duplicate-negative]
[fixture: pie/number-negative-overflow] [fixture: pie/number-negative-zero]
[fixture: pie/number-negative-decimal-zero]
[fixture: pie/review-number-negative-underflow-final]

### Db の正規化

ここで受理を決めるのは、[文法の外での拒否](#文法の外での拒否) で述べた、
変換後の数が負であるかどうかだけです。
AST は書かれたテキストを保ちます。
それ以外の変換と記録する値は、
[pie の Db 要約](../../../tests/docs/db-summaries.ja.md#pie) で定めます。
[fixture: pie/number-negative] [fixture: pie/number-negative-zero]
[fixture: pie/review-number-negative-underflow-final]
[fixture: pie/label-unknown-escapes] [fixture: pie/title-spaces]

## 既知の差異

**[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.ja.md)。**
固定したキーワードか数の内部の共通のディレクティブは、 Mermaid が結合しても、
ここでは拒否します。
完全な構成要素の境界と書かれたテキストでは受理します。
この規則によって Mermaid が拒否する入力を受理することはありません。
[fixture: pie/div-directive-in-header] [fixture: pie/div-directive-in-showdata]
[fixture: pie/div-directive-in-title-keyword]
[fixture: pie/div-directive-in-acctitle-keyword]
[fixture: pie/div-directive-in-accdescr-keyword]
[fixture: pie/div-directive-number]
[fixture: pie/div-review-directive-number-sign]
[fixture: pie/div-review-directive-number-decimal]
[fixture: pie/review-directive-acc-title-colon]
[fixture: pie/div-directive-in-accdescr-block-keyword]

**[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
固定したキーワードか数の内部の、選ばれたセミコロンも同じ拒否の規則です。
テキストと隠れた形の中身では共通のトリビアとして保てます。
差異は、 Mermaid が結合して受理する原子的な単位をここで拒否する向きだけです。
[fixture: pie/div-atomic-semicolon-number]
[fixture: pie/div-selected-semicolon-title-keyword]
[fixture: pie/div-selected-semicolon-showdata]
[fixture: pie/div-selected-semicolon-acctitle]
[fixture: pie/div-selected-semicolon-accdescr]
[fixture: pie/div-selected-semicolon-block-keyword]
[fixture: pie/lex-yaml-opener-selected-semicolon]

**[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.ja.md)。**
共通の HTML の走査は本当のフロントマターを除きます。
区切りをまたぐタグにより、Mermaid が受理するラベルをここでは拒否します。
フロントマター内でタグが閉じるタイトルは、両者が同じ変換後の値を読みます。
先頭以外の隠れた YAML は図のテキストで、この除外は受けません。
[fixture: pie/frontmatter-html]
[fixture: pie/div-review-frontmatter-html-cross-label]

**[embedded-data-opaque](../known-divergences/embedded-data-opaque.ja.md)。**
先頭のフロントマターの不正な内容は、 Mermaid が拒否しても、
ここでは不透明なテキストとして受理します。
HTML 属性の引用符の変換で不正になった YAML も含みます。
この規則で反対向きの差異はありません。
不正な隠れた YAML は両方が受理するので差異の印を付けません。
[fixture: pie/div-review-yaml-leading-invalid]
[fixture: pie/review-yaml-hidden-invalid]
[fixture: pie/div-review-frontmatter-html-invalid-yaml]

**[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.ja.md)。**
ラベル、タイトル、アクセシビリティの行の値、説明ブロック、本体の YAML、
区分の後やヘッダー行の EOF のコメントにある、
先頭に限定しない 4 語のいずれかが検出のテキストに残っても、
ここでは pie のヘッダーが pie を選びます。
Mermaid は C4 を選び、ほかの点では有効なこれらの pie を拒否します。
この規則は、その pie の受理を増やす向きだけです。
[fixture: pie/div-detect-c4-label] [fixture: pie/div-detect-c4-title]
[fixture: pie/div-yaml-body-c4-hidden] [fixture: pie/div-detect-c4-acctitle]
[fixture: pie/div-detect-c4-accdescr-line]
[fixture: pie/div-detect-c4-accdescr-block]
[fixture: pie/div-detect-c4-section-comment-eof]
[fixture: pie/div-detect-c4-header-comment-eof]

ラベル `C4Context %% C4Container` の後に最後の LF があれば、
検出は行中のパーセント接尾部を除いて pie を選び、
ラベルは書かれた全文を保ちます。
EOF ではその接尾部が検出のテキストに残るため、Mermaid は C4 を選んで拒否します。
この仕様は、既存の逆方向の基準により、同じ pie のラベルを受理します。
ラベル内の `C4Context` 単独では C4 を選びません。
[fixture: pie/lex-c4-inline-percent-with-lf]
[fixture: pie/div-c4-inline-percent-eof] [fixture: pie/lex-c4context-label]

**[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.ja.md)。**
裸の行は共通の Comment が持ち、後の共通の空白はトリビアです。
共通の行終端の変換の後、その行とヘッダーの間に残る共通の空白を、
この仕様は受理します。
Mermaid は ASCII 空白、タブ、LF 以外を、
空白だけの行でもヘッダーの直前でも拒否します。
既存の処理順による逆方向の基準を使い、Mermaid が受理する入力は拒否しません。
ASCII 空白とタブの行、裸の行がない LS の行は、両者の読みが一致します。
[fixture: pie/div-preheader-bare-ls-blank]
[fixture: pie/div-preheader-bare-ps-blank]
[fixture: pie/div-preheader-bare-nbsp-blank]
[fixture: pie/div-preheader-bare-bom-blank]
[fixture: pie/lex-preheader-bare-ascii-blank-control]
[fixture: pie/lex-preheader-ls-without-bare-control]
[fixture: pie/div-preheader-bare-vt-blank]
[fixture: pie/div-preheader-bare-ff-blank]
[fixture: pie/div-preheader-bare-u1680-blank]
[fixture: pie/div-preheader-bare-u2003-blank]
[fixture: pie/div-preheader-bare-u202f-blank]
[fixture: pie/div-preheader-bare-u205f-blank]
[fixture: pie/div-preheader-bare-u3000-blank]
[fixture: pie/div-preheader-bare-ls-before-header]
[fixture: pie/div-preheader-bare-bom-before-header]

隠れた YAML と DIRECTIVE は PieIgnoredText に持てるので、
新しい差異は要りません。
空のラベルと説明ブロックは実在する構文で、tokenless-empty-forms は適用しません。
図のコメントは終わりの LF と前の文字を残します。
コメントが前の文字や LF を取る差異が当てはまる場合はありません。
[fixture: pie/frontmatter-between-section-parts]
[fixture: pie/review-directive-empty-body] [fixture: pie/label-empty]
[fixture: pie/review-accdescr-empty-block-first]
[fixture: pie/comment-section-glued]
[fixture: pie/review-comment-bare-header-eof]
[fixture: pie/lex-bare-percent-braces-before-header]
