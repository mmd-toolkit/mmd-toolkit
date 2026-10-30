# Info

英語版: [info.md](./info.md)

この文書は `info` を定めます。
ソースの木は [ast/info.md](../ast/info.ja.md)、
導出した値の要約は
[tests パッケージ](../../../tests/docs/db-summaries.ja.md#info) にあります。
構文は、
[info.langium](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/info/info.langium#L1-L9)
と、
インポート先の
[common.langium](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/common.langium#L1-L34)
に従います。 [fixture: info/header-lf] [fixture: info/common-all]

## 検出

[detection.md](../detection.ja.md) の項目 12 は、
小文字の接頭辞 `info` を接尾の境界なしで選びます。
`information` は info と検出されますが、字句規則が拒否します。
`Info` と `INFO` は別名ではなく、
分割した見出しや見出しのない入力も info を選びません。 [fixture: info/header-lf]
[fixture: info/detect-lower-suffix] [fixture: info/detect-titlecase]
[fixture: info/detect-uppercase] [fixture: info/detect-header-split]
[fixture: info/detect-bare-only]

共通の先頭トリビア、実際のフロントマター、ディレクティブ、コメント領域、
HTML 属性の引用符、文字参照、選ばれたセミコロンの規則が適用されます。
フロントマターの title は全図種で Mermaid が求める値であり、
info の文にはなりません。 [fixture: info/frontmatter-title]
[fixture: info/frontmatter-html] [fixture: info/frontmatter-config]
[fixture: info/directive-config] [fixture: info/html-all-common]
[fixture: info/style-title]

検出点では、裸のパーセント対の行や 2 回目のディレクティブ走査より前に、
共通の [フロントマター](../common.ja.md#フロントマター)
の形を満たすブロックを最大 1 つ飛ばします。
ブロックは図のテキストのままです。
info は隠れた YAML の規則を適用し、
一致するブロックを textBeforeHeader の InfoIgnoredText として保持します。
その YAML のプロパティーは適用せず、不正な YAML も受理します。
[fixture: info/frontmatter-nonleading-comment]
[fixture: info/frontmatter-nonleading-lf]
[fixture: info/frontmatter-bom-opening]
[fixture: info/hidden-yaml-config-ignored]
[fixture: info/hidden-yaml-preheader-invalid]

実際のフロントマターは残されるブロックより前に、
2 回目の走査で見つかるディレクティブはその後に置けます。
2 つ目のブロック、2 回目の走査の後のブロック、
通過した裸の行の後のブロックは飛ばしません。
先頭の空白の除去で閉じだけが字下げされたままとなり、飛ばせないこともあります。
[fixture: info/detect-block-after-real-frontmatter]
[fixture: info/detect-block-before-second-scan]
[fixture: info/detect-two-blocks]
[fixture: info/detect-second-scan-before-block]
[fixture: info/detect-block-after-bare-brace]
[fixture: info/detect-block-equally-indented]

本文の行がない隣接フェンス、閉じないブロック、不一致の字下げ、
開きの 4 本のダッシュ、閉じの接尾テキスト、必要な改行のない閉じは、
検出の形を満たしません。
隣接する 3 行のフェンスなら本文の行を持てます。
検出を通っても通常の境界は緩めません。
開きの Unicode 空白や、閉じの後の読めない空白は拒否します。
[fixture: info/lex-detect-preheader-adjacent]
[fixture: info/lex-preheader-unclosed]
[fixture: info/lex-preheader-mismatched-indent]
[fixture: info/lex-detect-preheader-four]
[fixture: info/lex-detect-preheader-closing-suffix]
[fixture: info/frontmatter-unclosed] [fixture: info/lex-preheader-three-fences]
[fixture: info/lex-detect-preheader-open-nbsp]
[fixture: info/lex-detect-preheader-close-nbsp]
[fixture: info/lex-preheader-closer-u3000]

残された 2 回目の走査のディレクティブは、
閉じの境界を含む隠れた DIRECTIVE の規則で読み、textBeforeHeader に置きます。
閉じに接着した見出しは拒否します。
検出が通す裸の行は `%%{}%%` や閉じない `%%{!` も含め、
mark が `%%` の共有 Comment であり、InfoIgnoredText ではありません。
その行と共に通した空白・改行は読み直しません。
残された形は、到達した見出しだけからではなく検出点から読みます。
[fixture: info/detect-second-scan-directive]
[fixture: info/detect-second-scan-glued]
[fixture: info/lex-detect-preheader-empty-braces]
[fixture: info/lex-detect-preheader-open-brace]
[fixture: info/detect-retained-yaml-ascii]
[fixture: info/detect-retained-directive-ascii]

裸の行の後に通した共通の空白は、単独の行、見出しの直前、
残された形の間のいずれでもトリビアです。
共通の CR 変換後、
Mermaid はその位置で ASCII の space・tab・ LF 以外を拒否しますが、
この仕様は
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.ja.md)
として受理します。
裸の行を通さなければ、
残された接頭の形の後の空白には通常の字句規則が適用されます。
[fixture: info/div-bare-before-header-1680]
[fixture: info/div-bare-before-header-2000]
[fixture: info/div-bare-before-header-2001]
[fixture: info/div-bare-before-header-2002]
[fixture: info/div-bare-before-header-2003]
[fixture: info/div-bare-before-header-2004]
[fixture: info/div-bare-before-header-2005]
[fixture: info/div-bare-before-header-2006]
[fixture: info/div-bare-before-header-2007]
[fixture: info/div-bare-before-header-2008]
[fixture: info/div-bare-before-header-2009]
[fixture: info/div-bare-before-header-200a]
[fixture: info/div-bare-before-header-202f]
[fixture: info/div-bare-before-header-205f]
[fixture: info/div-bare-before-header-3000]
[fixture: info/div-bare-before-header-bom]
[fixture: info/div-bare-before-header-ff]
[fixture: info/div-bare-before-header-ls]
[fixture: info/div-bare-before-header-nbsp]
[fixture: info/div-bare-before-header-ps]
[fixture: info/div-bare-before-header-vt] [fixture: info/div-bare-line-1680]
[fixture: info/div-bare-line-2000] [fixture: info/div-bare-line-2001]
[fixture: info/div-bare-line-2002] [fixture: info/div-bare-line-2003]
[fixture: info/div-bare-line-2004] [fixture: info/div-bare-line-2005]
[fixture: info/div-bare-line-2006] [fixture: info/div-bare-line-2007]
[fixture: info/div-bare-line-2008] [fixture: info/div-bare-line-2009]
[fixture: info/div-bare-line-200a] [fixture: info/div-bare-line-202f]
[fixture: info/div-bare-line-205f] [fixture: info/div-bare-line-3000]
[fixture: info/div-bare-line-bom] [fixture: info/div-bare-line-ff]
[fixture: info/div-bare-line-ls] [fixture: info/div-bare-line-nbsp]
[fixture: info/div-bare-line-ps] [fixture: info/div-bare-line-vt]
[fixture: info/div-detect-retained-directive-bare-bom]
[fixture: info/div-detect-retained-directive-bare-ls]
[fixture: info/div-detect-retained-directive-bare-ls-line]
[fixture: info/div-detect-retained-yaml-bare-bom]
[fixture: info/div-detect-retained-yaml-bare-ls]
[fixture: info/div-detect-retained-yaml-bare-ls-line]
[fixture: info/bare-before-header-space] [fixture: info/bare-line-tab]
[fixture: info/div-detect-yaml-bare-directive]
[fixture: info/lex-detect-yaml-bare-directive-ascii]
[fixture: info/lex-retained-no-bare-ls]

## 字句構造

### 規則の順序

検出点から [common.md](../common.ja.md#ソースの読み方)
の変換後の図のテキストを読み、上記の通過した区間を除きます。
単位の先頭では次の順で最初に一致する規則を取り、その後から再開します。
一般的な最長一致は使いません。
読めない文字は入力全体を拒否させます。 [fixture: info/common-all]
[fixture: info/hidden-directive-body] [fixture: info/hidden-yaml-body]
[fixture: info/comment-bare-body] [fixture: info/error-after-prefix]
[fixture: info/error-after-common]

1. `showInfo`。
2. `info`。
3. `acc-descr-line` か `acc-descr-block`。
4. `acc-title-line`。
5. `title-line`。
6. `newline`（LF）。
7. 隠れた ASCII 空白。
8. 隠れた YAML。
9. 隠れた DIRECTIVE。
10. 図のコメント。

インポートした BOOLEAN・FLOAT・INT・NUMBER・STRING・ID には到達せず、
追加の単位を供給しません。
単独の文字列、空文字列、真偽値、数、名前は拒否します。
引用されたように見える共通のテキストは普通のテキストのままです。
[fixture: info/terminal-string-double] [fixture: info/terminal-string-single]
[fixture: info/lex-empty-quotes-standalone] [fixture: info/terminal-boolean]
[fixture: info/terminal-number] [fixture: info/terminal-id]
[fixture: info/title-open-quote]

### キーワードの境界

固定の 2 キーワードは大文字小文字を区別し、直後に共通の空白、`%%`、
またはテキストの終わりを要求します。
共通のディレクティブと選ばれたセミコロンを除いて境界を判断します。
除いたディレクティブだけでは境界になりません。
英字、数字、下線、ダッシュ、Unicode の文字、コロン、hash、単独の percent、
波括弧、引用符は境界になりません。 [fixture: info/detect-lower-suffix]
[fixture: info/detect-digit-suffix] [fixture: info/detect-underscore-suffix]
[fixture: info/detect-dash-suffix] [fixture: info/detect-unicode-suffix]
[fixture: info/detect-colon] [fixture: info/flag-letter-suffix]
[fixture: info/flag-digit-suffix] [fixture: info/flag-underscore-suffix]
[fixture: info/flag-dash-suffix] [fixture: info/flag-unicode-suffix]
[fixture: info/flag-colon-suffix] [fixture: info/flag-uppercase]
[fixture: info/flag-lowercase] [fixture: info/directive-header-glued]
[fixture: info/directive-header-space-control]
[fixture: info/directive-flag-glued] [fixture: info/lex-header-hash]
[fixture: info/lex-header-percent] [fixture: info/lex-header-brace]
[fixture: info/lex-header-quote] [fixture: info/lex-flag-hash]
[fixture: info/lex-flag-percent] [fixture: info/lex-flag-brace]
[fixture: info/lex-flag-quote]

キーワードの境界は空白を消費しません。
NBSP・BOM などの共通の空白は境界を満たしても、通常の間隔としては拒否されます。
単位間で隠れる空白は ASCII の space と tab だけで、LF は可視です。
共通の CR と CRLF はそれぞれ 1 つの LF になります。
LS・PS などの共通の空白は、元の EOF も含め、
値・ブロックの開きの間隔・共通の先頭トリビアが持つ位置でだけ読めます。
[fixture: info/space-header-tab] [fixture: info/space-header-nbsp]
[fixture: info/space-header-bom] [fixture: info/space-leading-unicode]
[fixture: info/space-trailing-unicode] [fixture: info/line-cr]
[fixture: info/line-crlf] [fixture: info/line-ls-between]
[fixture: info/line-ps-between] [fixture: info/line-ls-eof]
[fixture: info/line-ps-eof] [fixture: info/line-ls-in-value]
[fixture: info/line-ps-in-value] [fixture: info/accdescr-block-gap-ls]
[fixture: info/end-block-tab] [fixture: info/end-block-ls]
[fixture: info/end-block-ps]

### 複合した共通の形

単位の先頭では、共通の形の前に任意の ASCII 字下げを置けます。
`title-line` は `title` だけ、
または `title` と ASCII の space/tab 1 文字と空でもよい行テキストを読みます。
`acc-title-line` は `accTitle`、0 個以上の ASCII space/tab、コロン、
空でもよい行テキストを読み、`acc-descr-line` は `accDescr` で同じ形を読みます。
区切りやコロン前の Unicode 空白は拒否します。
info/showInfo の境界ではなく、各構成要素の規則が適用されます。
[fixture: info/title-empty] [fixture: info/title-tabs]
[fixture: info/acctitle-empty] [fixture: info/acctitle-gap]
[fixture: info/accdescr-line-empty] [fixture: info/space-title-separator-nbsp]
[fixture: info/space-acctitle-colon-nbsp] [fixture: info/accdescr-colon-gap-ls]
[fixture: info/title-colon] [fixture: info/title-digit-suffix]
[fixture: info/acctitle-no-colon] [fixture: info/lex-acctitle-brace]
[fixture: info/lex-accdescr-bare] [fixture: info/lex-title-hash]
[fixture: info/lex-title-percent] [fixture: info/lex-title-brace]
[fixture: info/lex-title-double-percent]

行テキストは最初の `%%` または物理的な行末の直前で終わります。
LS、PS、単独の percent、セミコロン、コロン、引用符、バックスラッシュ、
波括弧は内容です。
引用符は閉じなくてもよく、エスケープは文字列構文ではありません。
同じ行の後のキーワードも内容です。
空の値は、空行・ディレクティブ行・コメント行を挟んでも、
次の物理行を内容として取りません。 [fixture: info/comment-title]
[fixture: info/comment-acctitle] [fixture: info/comment-accdescr]
[fixture: info/common-line-leading-percent] [fixture: info/title-open-quote]
[fixture: info/title-double-quotes] [fixture: info/title-single-quotes]
[fixture: info/acctitle-quoted] [fixture: info/accdescr-line-quoted]
[fixture: info/title-consumes-next-keyword] [fixture: info/acctitle-next-line]
[fixture: info/common-title-comment-gap]
[fixture: info/common-acctitle-comment-gap] [fixture: info/lex-title-blank-gap]
[fixture: info/lex-acctitle-blank-gap] [fixture: info/lex-accdescr-blank-gap]
[fixture: info/lex-title-directive-gap]
[fixture: info/lex-acctitle-directive-gap]
[fixture: info/lex-accdescr-directive-gap]
[fixture: info/lex-accdescr-comment-gap] [fixture: info/end-title-semicolons]
[fixture: info/end-acctitle-semicolons] [fixture: info/end-accdescr-semicolons]
[fixture: info/line-ls-in-value] [fixture: info/line-ps-in-value]
[fixture: info/lex-block-colon-first]

ブロックの選択肢は `accDescr`、0 個以上の共通の空白、`{`、
最初の `}` までの任意の内容を読みます。
開きの間隔は物理的な改行・空行・Unicode の区切りを越えられ、
共通のディレクティブやコメント領域も除けます。
残る通常のコメントではその間隔を橋渡しできません。
内容は物理的な改行と LS・PS を含みます。
波括弧は入れ子にならず、引用符やバックスラッシュは閉じを保護しません。
追加の開き波括弧は内容です。
閉じ波括弧は必須です。
波括弧の前でもコロンがあれば行の形を選びます。
[fixture: info/accdescr-block-gap-lf] [fixture: info/accdescr-block-gap-ls]
[fixture: info/accdescr-block-gap-bom] [fixture: info/common-block-blank-gap]
[fixture: info/common-accdescr-directive-gap]
[fixture: info/lex-block-common-comment-gap]
[fixture: info/common-block-native-comment-gap]
[fixture: info/accdescr-block-lines] [fixture: info/line-ls-block]
[fixture: info/accdescr-block-empty] [fixture: info/accdescr-block-nested]
[fixture: info/common-block-closer-quoted]
[fixture: info/accdescr-block-escaped-brace]
[fixture: info/lex-block-open-brace] [fixture: info/accdescr-block-open]
[fixture: info/lex-block-colon-first]

### 隠れた YAML

単位の先頭では、物理的な行の先頭でなくても `---`、0 個以上の ASCII space/tab、
LF が隠れた YAML を開きます。
まず本文ありの形を試します。
後続の LF と字下げのない `---` まで、任意の文字をできるだけ少なく読みます。
その直後は LF・共通の空白・EOF のいずれかです。
この形が一致しない場合だけ、開きの LF の直後が閉じとなる空本文を試します。
本文は LF・LS・PS を含み、 YAML の検証はしません。
[fixture: info/hidden-yaml-body] [fixture: info/hidden-yaml-open-padding]
[fixture: info/hidden-yaml-empty] [fixture: info/hidden-yaml-invalid]
[fixture: info/lex-yaml-body-separators] [fixture: info/lex-yaml-close-space]
[fixture: info/lex-yaml-close-tab-eof] [fixture: info/lex-yaml-three-fences]
[fixture: info/lex-yaml-empty-then-content]
[fixture: info/lex-yaml-empty-spare-line]

従って隣接する 3 本のフェンスは一つの形になります。
空の 2 ブロックに見えても、 4 本目のフェンスが対応しないまま残ることがあります。
条件を満たさない閉じは、後に適切な閉じがあれば本文のままです。
最初の本文に適切な閉じがあれば、空でない 2 ブロックは別々のままです。
字下げした閉じ、開きの Unicode 空白、開きの 4 本のダッシュ、
閉じの欠落は拒否します。 [fixture: info/lex-yaml-three-fences]
[fixture: info/lex-yaml-two-empty]
[fixture: info/lex-yaml-empty-before-later-block]
[fixture: info/hidden-yaml-nonqualifying-closer]
[fixture: info/lex-yaml-two-before-flag] [fixture: info/hidden-yaml-indent]
[fixture: info/hidden-yaml-open-nbsp] [fixture: info/hidden-yaml-four-dashes]
[fixture: info/hidden-yaml-unclosed]
[fixture: info/lex-yaml-close-indent-inline]

先に始まった複合した値は、その内部の隠れた形に見えるテキストも既に持っています。
行の値は後続の YAML のダッシュを取り、説明ブロックは YAML に見える行を持ちます。
隠れた形は単位の位置にある一つの InfoIgnoredText ノードであり、
大域的な除去や固定キーワードの結合ではありません。
[fixture: info/hidden-yaml-after-title]
[fixture: info/hidden-yaml-after-acctitle]
[fixture: info/hidden-yaml-after-accdescr]
[fixture: info/hidden-yaml-inside-block]
[fixture: info/hidden-yaml-after-header] [fixture: info/hidden-yaml-flag-glued]

### 隠れた DIRECTIVE と改行

任意の ASCII 空白の後、隠れた DIRECTIVE は `%%{` から、
直後が LF・共通の空白・ EOF のいずれかとなる最初の `}%%`
まで任意の内容を読みます。
空の本文、単語でない本文、物理的な改行、LS・PS を許します。
条件を満たさない閉じは飛ばして後の閉じを使えます。
適切な閉じがなければ通常のコメント規則を試すため、
同じ行に接着したフラグがコメントの内容になることがあります。
[fixture: info/hidden-directive-padding]
[fixture: info/hidden-directive-nonqualifying-closer]
[fixture: info/hidden-directive-first-close]
[fixture: info/hidden-directive-unclosed]
[fixture: info/hidden-directive-close-glued]
[fixture: info/lex-hidden-body-separators]
[fixture: info/hidden-directive-header-eof]

どちらの隠れた形も、直後の LF を消費します。
他の条件を満たす空白は先読みだけで、その位置で読める必要があります。
共通の形の後の唯一の LF を消費すると後の文を読めません。
余分な LF や閉じの直後の ASCII space/tab があれば EOL を保てます。
元の EOF では追加の LF を消費しても、EOF が EOL を満たせます。
消費した LF は無視テキストの範囲外です。
[fixture: info/hidden-directive-after-title]
[fixture: info/hidden-directive-title-spare-lf]
[fixture: info/hidden-directive-title-space]
[fixture: info/hidden-directive-title-eof]
[fixture: info/hidden-directive-after-acctitle]
[fixture: info/hidden-directive-acctitle-spare-lf]
[fixture: info/hidden-directive-acctitle-space]
[fixture: info/hidden-directive-acctitle-eof]
[fixture: info/hidden-directive-after-accdescr]
[fixture: info/hidden-directive-accdescr-spare-lf]
[fixture: info/hidden-directive-accdescr-space]
[fixture: info/hidden-directive-accdescr-eof]
[fixture: info/hidden-directive-after-block]
[fixture: info/hidden-directive-block-spare-lf]
[fixture: info/hidden-directive-block-space]
[fixture: info/hidden-directive-block-eof]
[fixture: info/hidden-yaml-after-block]
[fixture: info/hidden-yaml-block-spare-lf]
[fixture: info/hidden-yaml-block-space] [fixture: info/hidden-yaml-block-eof]
[fixture: info/hidden-directive-close-tab]
[fixture: info/hidden-directive-close-ls] [fixture: info/hidden-yaml-close-ls]
[fixture: info/lex-hidden-close-ps] [fixture: info/lex-yaml-close-nbsp]
[fixture: info/hidden-directive-cr] [fixture: info/hidden-directive-crlf]
[fixture: info/hidden-yaml-cr] [fixture: info/hidden-yaml-crlf]

### コメントと共通のトリビア

通常のコメント規則は任意の ASCII 字下げ、`%%`、
物理的な EOL の直前までの最大のテキストを読みます。
mark は `%%`、value は mark の後で、前の文字と終端の LF は含めません。
単独の percent はコメントではありません。
裸の形と 3 個の percent の形は許します。
LS・PS は終端になりません。
共通のディレクティブは 2 個の percent を分離でき、
共通のコメント領域は内容を切れます。 [fixture: info/comment-header]
[fixture: info/comment-flag] [fixture: info/comment-title]
[fixture: info/comment-acctitle] [fixture: info/comment-accdescr]
[fixture: info/comment-after-block] [fixture: info/comment-eof]
[fixture: info/comment-bare-body] [fixture: info/comment-triple]
[fixture: info/lex-comment-single-percent]
[fixture: info/lex-comment-split-mark] [fixture: info/lex-comment-ls-bridge]
[fixture: info/lex-native-comment-ps]

コメントは共有の Comment レコードであり、InfoIgnoredText ではありません。
先に始まった説明ブロック内の裸の percent 行は内容ですが、
共通のコメント行は引き続き除かれます。
ディレクティブに見える内容でも最初の `}` がブロックを閉じ、
残った `%%` をコメント規則が読みます。
その後にブロックの残りのテキストがあると拒否されます。
[fixture: info/comment-bare-block] [fixture: info/comment-block]
[fixture: info/hidden-directive-block-first-brace]
[fixture: info/hidden-directive-inside-block]
[fixture: info/lex-block-comment-only]

共通のディレクティブ・コメント領域・選ばれたセミコロンは、隠れたフェンスも含め、
共通の値や無視する形のテキストの内部に置けます。
書かれた値からはそのトリビアを除き、他のソースの綴りを保ちます。
大域的なディレクティブで隠れた開き・閉じを作ったり、
共通の style/classDef 規則で隠れたテキスト内のセミコロンを選んだりできます。
完全なキーワードとコロン・波括弧の間も共通のトリビアを許します。
固定キーワードの内部には後述の原子的な差異が適用されます。
[fixture: info/directive-title-value] [fixture: info/directive-acctitle-value]
[fixture: info/directive-accdescr-value] [fixture: info/directive-block-value]
[fixture: info/directive-acctitle-colon] [fixture: info/directive-block-brace]
[fixture: info/lex-line-comment-region-ls]
[fixture: info/lex-yaml-opener-global] [fixture: info/lex-yaml-closer-global]
[fixture: info/lex-hidden-opener-global]
[fixture: info/lex-hidden-closer-global]
[fixture: info/lex-hidden-nested-global] [fixture: info/lex-yaml-common-comment]
[fixture: info/lex-hidden-common-comment]
[fixture: info/lex-yaml-fences-selected]
[fixture: info/lex-hidden-opener-selected]
[fixture: info/lex-hidden-closer-selected]
[fixture: info/lex-selected-colon-boundary]
[fixture: info/lex-selected-brace-boundary]

共通の行規則は、style/classDef の引き金、大文字小文字、
行区分の境界に従って条件を満たすセミコロンだけを選びます。
従って完成したブロックの後の選ばれた接尾は受理できますが、
残るセミコロンは拒否します。
セミコロンが文の区切りになるわけではありません。
HTML と文字参照の変換は共通の範囲を保ち、書かれた値はそのままです。
[fixture: info/style-block-end-semicolon] [fixture: info/style-block-end-double]
[fixture: info/style-block-end-upper] [fixture: info/style-block-end-nohash]
[fixture: info/style-block-end-colon-space] [fixture: info/style-block-end-ls]
[fixture: info/style-block-end-ps] [fixture: info/style-block-end-directive]
[fixture: info/style-both] [fixture: info/html-all-common]
[fixture: info/entity-standalone] [fixture: info/lex-yaml-opener-selected]

## 文法

```text
diagram = newline* "info" newline* ("showInfo" newline*)?
          common-statements? end-of-text
common-statements = (common-statement eol)+
common-statement = title-line | acc-title-line
                 | acc-descr-line | acc-descr-block
eol = newline+ | end-of-text
```

記法は [共通の記法](../common.ja.md#表記) です。
隠れた形は [ast/info.md](../ast/info.ja.md) で定める所有者を持ち、
可視の区切りを加えません。
本文は空でもよく、最初の共通の形は見出しやフラグと同じ行に置けます。
任意のフラグの前には可視の改行を置け、
コメント行・ディレクティブ行・隠れた形の前も含みます。
フラグは共通の形より前に 1 回だけ置けます。
空のブロックでも、その機会を終わらせます。 [fixture: info/header-lf]
[fixture: info/header-inline-flag] [fixture: info/header-flag-next-line]
[fixture: info/header-blank-lines] [fixture: info/header-common-inline]
[fixture: info/header-flag-common-inline]
[fixture: info/comment-between-header-flag] [fixture: info/lex-flag-hidden-two]
[fixture: info/lex-flag-global-directive-gap]
[fixture: info/header-repeated-flag] [fixture: info/header-common-then-flag]
[fixture: info/lex-flag-after-empty-block]
[fixture: info/hidden-directive-glued-header]
[fixture: info/hidden-directive-flag-next-common]
[fixture: info/hidden-yaml-after-flag]

空のブロックも含め、共通の形はそれぞれ可視の EOL または EOF を要求します。
共通の形の間や最後には空行を置けます。
隠れた形の前の可視の EOL は、引き続き文を分けます。
2 つ目の見出し、未対応の単位、遅いフラグ、
区切りのない完成したブロックと共通の形は拒否します。
ただし行の値は、後のキーワードに見えるものを内容にできます。
[fixture: info/common-blank-lines] [fixture: info/end-block-eof]
[fixture: info/end-common-eof] [fixture: info/hidden-directive-between-common]
[fixture: info/hidden-yaml-between-common]
[fixture: info/lex-hidden-after-visible-eol] [fixture: info/header-repeated]
[fixture: info/spec-info-1b111b64] [fixture: info/header-common-then-flag]
[fixture: info/common-same-line] [fixture: info/lex-block-empty-inline]
[fixture: info/title-consumes-next-keyword] [fixture: info/lex-hidden-tail-two]

| 規則             | ノード                     |
| ---------------- | -------------------------- |
| diagram          | InfoDiagram                |
| title-line       | InfoTitleStatement         |
| acc-title-line   | InfoAccTitleStatement      |
| acc-descr-line   | InfoAccDescrStatement      |
| acc-descr-block  | InfoAccDescrBlockStatement |
| 書かれた共通の値 | InfoLiteral                |
| 残された隠れた形 | InfoIgnoredText            |

繰り返しや空の値も含め、共通の文はすべて別々のソース上の出現として保ちます。
ソースの木は Mermaid の最終的な共通の断片ではありません。
導出した値と公開の扱いは
[info の要約](../../../tests/docs/db-summaries.ja.md#info) が定め、
書かれたノードの代わりにはしません。 [fixture: info/common-all]
[fixture: info/common-flag-all] [fixture: info/title-repeat-empty]
[fixture: info/acctitle-repeat-empty] [fixture: info/accdescr-line-repeat]
[fixture: info/accdescr-block-repeat]

### 文法外の拒否

字句エラー、構文エラー、未消費の可視の単位があれば、
回復した木や正しい接頭が存在しても入力全体を拒否します。
[公開の解析ラッパー](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/parse.ts#L134-L150)
は両方のエラー一覧を検査します。
[info のアダプター](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/info/infoParser.ts#L6-L11)
は意味による拒否を加えません。
共通の検出と埋め込みデータの規則は引き続き適用されます。
[fixture: info/error-after-prefix] [fixture: info/error-after-common]
[fixture: info/spec-info-1b111b64] [fixture: info/terminal-number]
[fixture: info/div-frontmatter-invalid-yaml]

## 既知の差異

**[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.ja.md)。**
共通の Directive レコードは大域的なディレクティブを、
InfoIgnoredText は完全な隠れた形を持ちます。
どちらも固定キーワードの内部の独立した構成要素にはなりません。
直接の原子的な規則は info、showInfo、title、accTitle、
accDescr 内のディレクティブを拒否しますが、Mermaid は断片を結合します。
これは理由 2 で、逆方向の受理は加えません。
完全な構成要素の境界や値・隠れたテキストでは許し、
結合後も不正な入力は両方が拒否します。
[fixture: info/div-directive-header-middle]
[fixture: info/div-directive-flag-middle]
[fixture: info/div-directive-title-middle]
[fixture: info/div-directive-acctitle-middle]
[fixture: info/div-directive-accdescr-middle]
[fixture: info/div-directive-accdescr-line-keyword]
[fixture: info/directive-acctitle-colon] [fixture: info/directive-block-brace]
[fixture: info/lex-yaml-opener-global]
[fixture: info/lex-directive-rejected-tail]

**[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
選ばれたセミコロンの 1 文字の範囲は共通のトリビアにできますが、
文や無視テキストの兄弟を固定キーワードの内部には置けません。
理由 2 により showInfo、title、accTitle、
両方の accDescr の内部の選ばれたセミコロンを拒否しますが、Mermaid は結合します。
逆方向の受理はありません。
完全な構成要素の境界や隠れたテキスト・値では一致します。
選ばれないセミコロン、選択前に拒否される分割した見出し、
別の不正な接尾には印を付けません。 [fixture: info/div-selected-showinfo]
[fixture: info/div-selected-title] [fixture: info/div-selected-acctitle]
[fixture: info/div-selected-accdescr-line]
[fixture: info/div-selected-accdescr-block]
[fixture: info/lex-selected-colon-boundary]
[fixture: info/lex-selected-brace-boundary]
[fixture: info/lex-hidden-opener-selected] [fixture: info/lex-selected-header]
[fixture: info/lex-selected-keyword-rejected-tail]
[fixture: info/end-header-semicolon]

**[embedded-data-opaque](../known-divergences/embedded-data-opaque.ja.md)。**
Frontmatter は書かれた本文を既に持ちます。
属性の引用符の変換で不正になった YAML も含め、不正な内容はソースの構造を決めず、
Mermaid が拒否してもここでは受理します。
元の入力への拒否からは Db を得られませんが、
差異の原因となるブロックや鍵だけを除いた参照入力が受理されると、
[比較する Db](../known-divergences/embedded-data-opaque.ja.md#比較する-db)
の規則により、 `specified.json` はその Db と埋め込み値を比較のために記録します。
この 2 つのフロントマターでは、その Db は `{}` です。
この規則で Mermaid が受理する入力を拒否することはありません。
不正な隠れた YAML と記録済みの不正な init 引数は両方が受理し、印を付けません。
[fixture: info/div-frontmatter-invalid-yaml]
[fixture: info/div-frontmatter-html-invalid-yaml]
[fixture: info/hidden-yaml-preheader-invalid]
[fixture: info/directive-invalid-init]

**[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.ja.md)。**
InfoLiteral・InfoIgnoredText・共有 Comment は C4 の語を書かれたまま持ちます。
既存の逆方向の処理順の規則は見出しの文法を選びます。
検出テキストの後の位置にある 4 個のアンカーのない C4 の語は、
Mermaid が拒否してもここでは info として受理できます。
Mermaid が受理する入力を拒否しません。
C4Context、除いたフロントマター・ディレクティブ、
LF で終わるコメントの対照例は一致し、
別の理由で不正な info の本文は引き続き拒否します。
[fixture: info/div-c4container-title] [fixture: info/div-c4component-acctitle]
[fixture: info/div-c4dynamic-line] [fixture: info/div-c4deployment-block]
[fixture: info/div-c4container-header-comment-eof]
[fixture: info/div-c4component-flag-comment-eof]
[fixture: info/c4container-header-comment-lf]
[fixture: info/c4component-flag-comment-lf] [fixture: info/div-c4-hidden-yaml]
[fixture: info/div-c4-hidden-directive] [fixture: info/div-c4-retained-yaml]
[fixture: info/div-c4-retained-directive] [fixture: info/lex-c4context-common]
[fixture: info/lex-c4-removed-directive] [fixture: info/lex-c4-frontmatter]
[fixture: info/lex-c4-invalid-info]

**[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.ja.md)。**
共有 Comment は通過した裸の行を持ち、共に通した共通の空白はトリビアです。
既存の逆方向の処理順の規則は、残された形の後や間も含め、
Mermaid が通常の読み直しで拒否する空白を受理します。
Mermaid が受理する入力を拒否しません。
ASCII の対照例は一致し、裸の行を通さない Unicode の間隔は通常どおり拒否します。
[fixture: info/div-bare-before-header-bom] [fixture: info/div-bare-line-ls]
[fixture: info/div-detect-retained-yaml-bare-ls]
[fixture: info/div-detect-retained-directive-bare-bom]
[fixture: info/div-detect-yaml-bare-directive]
[fixture: info/bare-before-header-space] [fixture: info/bare-line-tab]
[fixture: info/lex-detect-yaml-bare-directive-ascii]
[fixture: info/lex-retained-no-bare-ls]

隠れた形にはノードがあり、空の共通の形には文があるため、
tokenless-empty-forms は不要です。
通常のコメントは前の文字も LF も取りません。
本文だけの HTML 規則は引き続き適用されますが、
フロントマターを越える引用符の変換は、この文法も比較できる空の要約も変えません。
従って対照例に html-tag-in-frontmatter の印はありません。
引用符の変換後に拒否される YAML は上記の不透明なデータの場合です。
[fixture: info/hidden-yaml-empty] [fixture: info/accdescr-block-empty]
[fixture: info/lex-block-empty-inline] [fixture: info/comment-title]
[fixture: info/comment-after-block] [fixture: info/frontmatter-html]
[fixture: info/lex-html-cross-title] [fixture: info/lex-html-cross-acctitle]
[fixture: info/lex-html-blocking]
[fixture: info/div-frontmatter-html-invalid-yaml]
