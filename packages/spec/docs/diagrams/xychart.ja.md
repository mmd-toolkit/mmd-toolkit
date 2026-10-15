# XY chart

英語版: [xychart.md](./xychart.md)

mermaid.js の正となるソース：

- [`xychart.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison)
- [`xychartDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts)
- [`xychart/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart)
  の中のテスト（`*.spec.ts`）

この文書は図種 `xychart` を扱います。
木のノードは [ast/xychart.ja.md](../ast/xychart.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の項目 25 がこの文法を選びます。
テキストが、空白の後、ちょうどこの大文字小文字の `xychart` で始まるときです
（[`xychartDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDetector.ts#L9-L11)）。
`XYCHART` と `Xychart-Beta` はどの検出器にも合いません。
ヘッダーの前の U+FEFF と U+00A0 は空白です。
[fixture: xychart/db-header-plain] [fixture: xychart/db-header-beta-only]
[fixture: xychart/header-indented] [fixture: xychart/header-tab-indented]
[fixture: xychart/header-nbsp-before] [fixture: xychart/header-bom-before]
[fixture: xychart/header-after-blank-lines]
[fixture: xychart/spec-xychart-jison-b46d27a1]
[fixture: xychart/header-upper-case] [fixture: xychart/header-beta-capitalized]

字句解析器は次にヘッダーを読みます。
キーワード `xychart-beta` かキーワード `xychart` で、
大文字小文字を区別せずに比べ、語の文字が続かないものです
（[文の文脈](#文の文脈) を参照）。
2 つのヘッダーは同じ図種です。
`xychart-BETA` はヘッダーで、
`xychart-betax`、`xychartx`、`xychart-1`、`xychart-betaé` は拒否されます。
ヘッダーだけのテキストでもかまいません。
[fixture: xychart/header-beta-upper-case-suffix]
[fixture: xychart/header-word-suffix]
[fixture: xychart/header-plain-word-suffix]
[fixture: xychart/header-dash-suffix]
[fixture: xychart/spec-xychart-jison-80dffe73]
[fixture: xychart/header-non-ascii-suffix]
[fixture: xychart/header-without-line-feed]
[fixture: xychart/spec-xychart-jison-d2539031]

ヘッダーの前のコメント行とディレクティブの行は何も変えません。
`%%` だけの行と `%%{ }%%` の行もコメント行なので同じです。
ヘッダーの前の `#` で始まる行は、どの検出器も読みません。
[fixture: xychart/header-after-comment-line]
[fixture: xychart/header-after-directive-line]
[fixture: xychart/header-after-bare-percent-line]
[fixture: xychart/header-after-empty-braces-line]
[fixture: xychart/header-after-bare-percent-line-and-whitespace-line]
[fixture: xychart/gram-header-after-hash-line]

ヘッダーの行では、ヘッダーの後に向き、文、`;`、コメントを置くか、
何も置きません。
それ以外のテキストは入力を拒否させます。
`{`、`[`、`:`、`,`、数、`#`、引用符、キーワードでない語などです。
[fixture: xychart/header-statement-on-header-line]
[fixture: xychart/header-line-on-header-line]
[fixture: xychart/header-semicolon] [fixture: xychart/header-semicolon-only]
[fixture: xychart/header-semicolon-spaced]
[fixture: xychart/header-comment-on-header-line]
[fixture: xychart/header-comment-glued-to-header]
[fixture: xychart/header-directive-glued-after-header]
[fixture: xychart/gram-header-brace-suffix]
[fixture: xychart/gram-header-bracket-suffix]
[fixture: xychart/gram-header-colon-suffix]
[fixture: xychart/gram-header-comma-suffix]
[fixture: xychart/gram-header-digit-suffix]
[fixture: xychart/gram-header-hash-suffix]
[fixture: xychart/gram-header-quote-suffix]
[fixture: xychart/spec-xychart-jison-45159c50]
その文は、空のものも含めて説明ブロックでもかまいません。
`xychart accDescr {}` と `xychart accDescr {x}` は受理されます。
[fixture: xychart/db-header-line-empty-description-block]
[fixture: xychart/db-header-line-description-block]

**向き**は、
大文字小文字を区別せずに比べるキーワード `vertical` か `horizontal` で、
ヘッダーのすぐ後に、改行以外の空白か、
空白の後の空白と改行を挟んで置きます（[改行](#単位と文脈) を参照）。
その行で文が続いてもかまいません。
ほかのところには置けません。
改行の後、`;` の後、2 回、後に文字が続くもの、文の後、
タイトル、軸のタイトル、分類としては、入力を拒否させます。
引用符の中ではテキストです。
[fixture: xychart/db-orientation-vertical]
[fixture: xychart/db-orientation-horizontal]
[fixture: xychart/db-orientation-capitalized]
[fixture: xychart/db-orientation-upper-case]
[fixture: xychart/db-orientation-vertical-upper-case]
[fixture: xychart/db-orientation-tab]
[fixture: xychart/db-orientation-two-spaces]
[fixture: xychart/db-orientation-nbsp]
[fixture: xychart/db-orientation-plain-header]
[fixture: xychart/db-orientation-with-statement]
[fixture: xychart/spec-xychart-jison-03b26531]
[fixture: xychart/spec-xychart-jison-6668e7e4]
[fixture: xychart/gram-orientation-on-next-line]
[fixture: xychart/gram-orientation-on-second-line-after-semicolon]
[fixture: xychart/gram-orientation-twice]
[fixture: xychart/gram-orientation-word-suffix]
[fixture: xychart/gram-orientation-after-statement]
[fixture: xychart/gram-orientation-as-title]
[fixture: xychart/gram-orientation-as-axis-title]
[fixture: xychart/gram-orientation-as-category]
[fixture: xychart/db-orientation-in-quotes]

## 字句構造

### 単位と文脈

字句解析器は図のテキストを**単位**に分けます。文法は単位の上に書きます。
各単位は、文法が使う名前と、**テキスト**を持ちます。
テキストは、単位が読んだ文字を変換した形にしたものです。

字句解析器は**文脈**のスタックを持ちます。文の文脈から始めます。
規則は文脈に入ることがあり、そのときはその文脈をスタックの一番上に置きます。
今の文脈を出ることもあり、そのときはその下の文脈に戻ります。
各位置で、字句解析器は今の文脈の規則のうち、そこで合う最初のものを当てます。
規則が読んだ空白は、規則が別に言わないかぎり、どの単位にも属しません。
今の文脈のどの規則も合わないとき、入力は拒否されます。
以下の一覧では、これを繰り返しません。

テキストは、文字列の文脈、分類の文脈、
値の文脈以外のどの文脈で終わってもかまいません。
文字列、分類、値は閉じていなければならないので、
テキストの終わりの `title "T` と `line [1, 2` は拒否されます。
説明ブロックの文脈で終わってもよく、そのブロックはテキストの終わりまで続きます。
`accTitle:` や `accDescr:` の直後で終わってもかまいません。
[fixture: xychart/gram-title-quoted-unclosed-at-end]
[fixture: xychart/gram-plot-values-unclosed]
[fixture: xychart/gram-x-axis-band-unclosed]
[fixture: xychart/gram-x-axis-band-unclosed-string]
[fixture: xychart/db-acc-descr-unclosed-block]
[fixture: xychart/db-acc-title-empty] [fixture: xychart/db-title-at-end-of-text]
[fixture: xychart/db-x-axis-title-at-end-of-text]
[fixture: xychart/db-lines-no-line-feed-at-end]

**空白。**
この文書の空白は [表記](../common.ja.md#表記) の集合です。
タブ、垂直タブ、改ページ、U+00A0、U+2028、U+2029、U+3000、U+FEFF は、
規則が空白を読むところではどこでも空白です。
文字列とアクセシビリティのテキストの外では、
改行以外の文字で始まる空白の並びは、単位の一部にならずに単位の間にあり、
その中の改行も同じです（下の改行を参照）。
文の前後、テキストの語の間、角括弧、コンマ、矢印の周りです。
U+2028 と U+2029 は改行ではありません。
`line [1]`、U+2028、`bar [2]` は、1 つの行の 2 つの文です。
[fixture: xychart/db-statement-tab-indented]
[fixture: xychart/db-lines-form-feed-before-statement]
[fixture: xychart/db-lines-vertical-tab-before-statement]
[fixture: xychart/db-title-bom-before-keyword]
[fixture: xychart/db-title-bom-after-word]
[fixture: xychart/db-lines-keyword-bom-end]
[fixture: xychart/db-lines-statements-after-bom-and-tab]
[fixture: xychart/db-title-nbsp-before-keyword]
[fixture: xychart/db-lines-nbsp-after-statement]
[fixture: xychart/db-lines-trailing-spaces]
[fixture: xychart/db-lines-trailing-tab]
[fixture: xychart/db-title-form-feed-after-word]
[fixture: xychart/db-title-tab-separator]
[fixture: xychart/db-title-nbsp-between-words]
[fixture: xychart/db-title-ideographic-space]
[fixture: xychart/db-lines-unicode-line-separator-between-statements]
[fixture: xychart/db-title-line-separator-end]
[fixture: xychart/db-title-paragraph-separator-end]
[fixture: xychart/db-grid-ls-title-bare]
[fixture: xychart/db-grid-ps-title-bare]
[fixture: xychart/db-grid-tab-title-bare]
[fixture: xychart/db-grid-bom-title-bare]
[fixture: xychart/db-grid-ls-x-title-bare]
[fixture: xychart/db-grid-ls-category-bare]
[fixture: xychart/db-grid-ls-y-title-bare]
[fixture: xychart/db-grid-ls-plot-title-bare]
[fixture: xychart/db-plot-values-tab-inside]
[fixture: xychart/db-plot-values-nbsp-inside]
[fixture: xychart/db-plot-values-line-separator-inside]
[fixture: xychart/db-plot-values-bom-inside]
[fixture: xychart/db-plot-values-form-feed-inside]
[fixture: xychart/db-x-axis-band-tab-inside]
[fixture: xychart/db-x-axis-band-nbsp-inside]
[fixture: xychart/db-x-axis-band-line-separator-inside]
[fixture: xychart/db-grid-tab-x-title-bare]
[fixture: xychart/db-grid-tab-category-bare]
[fixture: xychart/db-grid-tab-y-title-bare]
[fixture: xychart/db-grid-tab-plot-title-bare]
[fixture: xychart/db-grid-bom-x-title-bare]
[fixture: xychart/db-grid-bom-category-bare]
[fixture: xychart/db-grid-bom-y-title-bare]
[fixture: xychart/db-grid-bom-plot-title-bare]
[fixture: xychart/db-grid-nbsp-x-title-bare]
[fixture: xychart/db-grid-nbsp-category-bare]
[fixture: xychart/db-grid-nbsp-y-title-bare]
[fixture: xychart/db-grid-nbsp-plot-title-bare]
[fixture: xychart/db-grid-ideographic-x-title-bare]
[fixture: xychart/db-grid-ideographic-category-bare]
[fixture: xychart/db-grid-ideographic-y-title-bare]
[fixture: xychart/db-grid-ideographic-plot-title-bare]
[fixture: xychart/db-grid-ps-x-title-bare]
[fixture: xychart/db-grid-ps-category-bare]
[fixture: xychart/db-grid-ps-y-title-bare]
[fixture: xychart/db-grid-ps-plot-title-bare]

**改行。**
ソースの改行は、図のテキストでは改行文字です
（[ソースの読み方](../common.ja.md#ソースの読み方) を参照）。
そのため、CRLF と単独の CR は、改行文字と同じく行を終えます。
単位が始まるところの改行文字は**改行**です。
引用符なしのテキストと文を終え、
角括弧の中や、キーワードとその文の残りの間の改行は、入力を拒否させます。
その行で空白の後にある改行文字は改行ではなく、
その前の空白の並びに、その後の改行文字や空白とともに属します。
そのため、行が空白で終わるとき、文は次の行へ続きます。
`title A`、空白文字、改行、`B` はタイトル `AB` です。
プロットのタイトル、空白文字、改行、`[1]` はプロットです。
分類、値、ラベル、矢印、範囲の終わりは、コンマ、値、
数と空白文字の次の行に置けます。
向きは、ヘッダーと空白文字の次の行に置けます。
空白と改行文字の間のディレクティブは何も変えませんが、
単位にくっついたディレクティブの後の改行文字は改行です。
`title A`、空白文字、ディレクティブ、改行、`B` はタイトル `AB` で、
空白文字がなければ拒否されます。
空白で終わる行の後のコメント行は、図のテキストの行ではないので
（[コメント行](../common.ja.md#コメント行) を参照）、
`title A`、空白文字、改行、行 `%% c`、`B` はタイトル `AB` で、
空白文字がなければ拒否されます。
`%%` だけの行はこの字句解析器のコメントで（[コメント](#コメント) を参照）、
その改行文字は改行なので、`title A`、空白文字、行 `%%`、`B` は拒否されます。
アクセシビリティの文のテキストは、空白の後でも、その改行文字で終わります。
それ以外では、タイトル、分類、軸やプロットのタイトル、値は、
そのキーワードの行にあります。
[fixture: xychart/db-whitespace-line-feed-title-words]
[fixture: xychart/db-whitespace-line-feed-title-after-keyword]
[fixture: xychart/db-whitespace-tab-line-feed-title-words]
[fixture: xychart/db-whitespace-two-line-feeds-title-words]
[fixture: xychart/db-whitespace-line-separator-line-feed-title-words]
[fixture: xychart/db-whitespace-crlf-title-words]
[fixture: xychart/db-whitespace-lone-cr-title-words]
[fixture: xychart/db-whitespace-line-feed-axis-title-words]
[fixture: xychart/db-whitespace-line-feed-plot-title-words]
[fixture: xychart/db-whitespace-line-feed-plot-title-then-values]
[fixture: xychart/db-whitespace-line-feed-plot-keyword-then-values]
[fixture: xychart/db-whitespace-line-feed-axis-title-then-band]
[fixture: xychart/db-whitespace-line-feed-axis-keyword-then-band]
[fixture: xychart/db-whitespace-line-feed-y-axis-keyword-then-range]
[fixture: xychart/db-whitespace-line-feed-in-categories]
[fixture: xychart/db-whitespace-line-feed-in-values]
[fixture: xychart/db-whitespace-line-feed-before-comma]
[fixture: xychart/db-whitespace-line-feed-before-label]
[fixture: xychart/db-whitespace-line-feed-in-range-before-arrow]
[fixture: xychart/db-whitespace-line-feed-in-range-after-arrow]
[fixture: xychart/db-whitespace-line-feed-header-then-orientation]
[fixture: xychart/db-whitespace-tab-line-feed-header-then-orientation]
[fixture: xychart/db-whitespace-two-line-feeds-header-then-orientation]
[fixture: xychart/gram-whitespace-line-feed-title-then-string]
[fixture: xychart/gram-acc-title-trailing-space-then-word]
[fixture: xychart/db-whitespace-directive-line-feed-title-words]
[fixture: xychart/gram-directive-line-feed-title-words]
[fixture: xychart/db-whitespace-comment-line-title-words]
[fixture: xychart/gram-comment-line-title-words]
[fixture: xychart/gram-whitespace-bare-percent-line-title-words]
[fixture: xychart/db-title-crlf-line-ends]
[fixture: xychart/db-title-lone-cr-line-ends]
[fixture: xychart/db-lines-statement-on-header-line-crlf]
[fixture: xychart/db-statement-blank-lines]
[fixture: xychart/gram-grid-lf-title-bare]
[fixture: xychart/gram-grid-crlf-title-bare]
[fixture: xychart/gram-grid-cr-title-bare]
[fixture: xychart/gram-grid-lf-acc-title]
[fixture: xychart/gram-grid-crlf-acc-title]
[fixture: xychart/gram-grid-cr-acc-title]
[fixture: xychart/gram-grid-lf-acc-descr]
[fixture: xychart/gram-grid-crlf-acc-descr]
[fixture: xychart/gram-grid-cr-acc-descr]
[fixture: xychart/gram-grid-lf-x-title-bare]
[fixture: xychart/gram-grid-crlf-x-title-bare]
[fixture: xychart/gram-grid-cr-x-title-bare]
[fixture: xychart/gram-grid-lf-category-bare]
[fixture: xychart/gram-grid-crlf-category-bare]
[fixture: xychart/gram-grid-cr-category-bare]
[fixture: xychart/gram-grid-lf-y-title-bare]
[fixture: xychart/gram-grid-crlf-y-title-bare]
[fixture: xychart/gram-grid-cr-y-title-bare]
[fixture: xychart/gram-grid-lf-plot-title-bare]
[fixture: xychart/gram-grid-crlf-plot-title-bare]
[fixture: xychart/gram-grid-cr-plot-title-bare]
[fixture: xychart/gram-title-text-on-next-line]
[fixture: xychart/gram-plot-values-line-feed-before-bracket]
[fixture: xychart/gram-plot-values-title-line-feed-before-bracket]
[fixture: xychart/gram-plot-values-line-feed-after-bracket]
[fixture: xychart/gram-plot-values-line-feed-before-comma]
[fixture: xychart/gram-plot-values-crlf-inside]
[fixture: xychart/gram-x-axis-band-line-feed]
[fixture: xychart/gram-x-axis-line-feed-before-bracket]

**エンティティ。**
エンティティは、字句解析器がテキストを読む前に、そのプレースホルダーとして読まれ
（[エンティティ](../common.ja.md#エンティティ) を参照）、
プレースホルダーは ASCII の外の文字でできています。
文字列とアクセシビリティのテキストの中では、それはテキストの文字で、
テキストはエンティティを書かれたとおりに保ちます。
`title "a#35;b"` はタイトル `a#35;b` を持ちます。
その外ではどの規則も読まないので、
`title a#35;b`、分類 `a#35;b`、軸やプロットのタイトル `a#35;b` は拒否されます。
[fixture: xychart/lex-title-entity-in-quotes] [fixture: xychart/db-label-entity]
[fixture: xychart/db-plot-title-entity] [fixture: xychart/db-x-axis-band-entity]
[fixture: xychart/lex-acc-title-entity] [fixture: xychart/lex-acc-descr-entity]
[fixture: xychart/lex-acc-descr-block-entity]
[fixture: xychart/lex-title-quoted-hash-word-semicolon-entity]
[fixture: xychart/db-grid-entity-acc-title]
[fixture: xychart/db-grid-entity-acc-descr]
[fixture: xychart/db-grid-entity-acc-descr-block]
[fixture: xychart/db-grid-entity-x-title-quoted]
[fixture: xychart/db-grid-entity-category-quoted]
[fixture: xychart/db-grid-entity-y-title-quoted]
[fixture: xychart/db-grid-entity-plot-title-quoted]
[fixture: xychart/gram-title-entity-bare]
[fixture: xychart/gram-grid-entity-x-title-bare]
[fixture: xychart/gram-grid-entity-category-bare]
[fixture: xychart/gram-grid-entity-y-title-bare]
[fixture: xychart/gram-grid-entity-plot-title-bare]

**HTML 属性の引用符と `style` 行。**
HTML タグの属性の引用符は、どの図種とも同じく `'` として読まれます
（[HTML 属性の引用符](../common.ja.md#html-属性の引用符) を参照）。
そのため、引用符を持つタグは、
引用符の中とアクセシビリティのテキストではテキストで、
引用符の外ではその `<` をどの規則も読みません。
`style` 行と `classDef` 行の行の規則が無視する `;`
（[ソースの読み方](../common.ja.md#ソースの読み方) を参照）は、
引用符の中のテキストとアクセシビリティのテキストから外されます。
[fixture: xychart/db-title-html-tag-in-quotes]
[fixture: xychart/db-title-quoted-html]
[fixture: xychart/db-grid-html-acc-title]
[fixture: xychart/db-grid-html-acc-descr]
[fixture: xychart/db-grid-html-acc-descr-block]
[fixture: xychart/db-grid-html-x-title-quoted]
[fixture: xychart/db-grid-html-category-quoted]
[fixture: xychart/db-grid-html-y-title-quoted]
[fixture: xychart/db-grid-html-plot-title-quoted]
[fixture: xychart/db-grid-html-label]
[fixture: xychart/gram-grid-html-title-bare]
[fixture: xychart/gram-grid-html-x-title-bare]
[fixture: xychart/gram-grid-html-category-bare]
[fixture: xychart/gram-grid-html-y-title-bare]
[fixture: xychart/gram-grid-html-plot-title-bare]
[fixture: xychart/lex-title-style-line-semicolon]
[fixture: xychart/db-label-style-line-semicolon]
[fixture: xychart/db-plot-title-style-line-semicolon]
[fixture: xychart/db-x-axis-band-quoted-style-line-semicolon]
[fixture: xychart/db-x-axis-title-quoted-style-line-semicolon]
[fixture: xychart/db-y-axis-title-quoted-style-line-semicolon]
[fixture: xychart/lex-acc-title-style-line-semicolon]
[fixture: xychart/lex-acc-descr-style-line-semicolon]
[fixture: xychart/lex-acc-descr-block-style-line-semicolon]
[fixture: xychart/db-grid-style-acc-title]
[fixture: xychart/db-grid-style-acc-descr]
[fixture: xychart/db-grid-style-acc-descr-block]
[fixture: xychart/db-grid-style-x-title-quoted]
[fixture: xychart/gram-grid-style-title-bare]
[fixture: xychart/gram-grid-style-x-title-bare]
[fixture: xychart/gram-grid-style-category-bare]
[fixture: xychart/gram-grid-style-y-title-bare]
[fixture: xychart/gram-grid-style-plot-title-bare]
[fixture: xychart/lex-style-line-classdef]
[fixture: xychart/lex-style-line-does-not-cross-lines-in-quotes]
[fixture: xychart/lex-style-line-no-hash]
[fixture: xychart/lex-style-line-semicolon-in-second-line-of-quotes]
[fixture: xychart/lex-style-line-semicolon-two]
[fixture: xychart/lex-style-line-space-after-colon]
[fixture: xychart/lex-style-line-statement-separator]
[fixture: xychart/lex-style-line-upper-case-keyword]
[fixture: xychart/db-title-quoted-hash-and-semicolon-apart]

### 単位の中のディレクティブ

字句解析器は、ディレクティブのない図のテキストを、
mermaid.js がディレクティブを除いた後にテキストを読むのと同じに読みます。
そのうえで、単位に
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則を当てます。
テキストの単位か文字列の中のディレクティブは mermaid.js の読みを保ち、
それ以外の単位の中のディレクティブは入力を拒否させます。
**テキストの単位**は、`word`、`acc-title-text`、`acc-description-text`、
`description-block-text` です。
ほかの単位、つまりヘッダー、向き、キーワード、`number`、`-->`、角括弧、
`,`、`;`、`:`、`{`、`}` はテキストの単位ではありません。

- テキストの語の間、語の中、文字列の中、
  アクセシビリティのテキストの中のディレクティブは、
  mermaid.js と同じく、その前後をつなぎます。
  `title A%%{init: {}}%% B` はタイトル `AB` を、
  分類 `a%%{init: {}}%%b` は分類 `ab` を、
  `title "T%%{init: {}}%%U"` はタイトル `TU` を持ちます。
  文字列の中のコメント行とディレクティブの行は、その行とともに外されます。
  [fixture: xychart/db-directive-between-title-words]
  [fixture: xychart/db-x-axis-band-directive-in-word]
  [fixture: xychart/db-title-directive-in-quotes]
  [fixture: xychart/db-title-directive-after-bare]
  [fixture: xychart/db-acc-descr-block-directive-inside]
  [fixture: xychart/db-acc-descr-block-comment-line-inside]
  [fixture: xychart/db-title-quoted-comment-line-inside]
  [fixture: xychart/db-title-quoted-directive-line-inside]
  [fixture: xychart/db-grid-directive-title-bare]
  [fixture: xychart/db-grid-directive-title-quoted]
  [fixture: xychart/db-grid-directive-acc-title]
  [fixture: xychart/db-grid-directive-acc-descr]
  [fixture: xychart/db-grid-directive-acc-descr-block]
  [fixture: xychart/db-grid-directive-x-title-bare]
  [fixture: xychart/db-grid-directive-x-title-quoted]
  [fixture: xychart/db-grid-directive-category-bare]
  [fixture: xychart/db-grid-directive-category-quoted]
  [fixture: xychart/db-grid-directive-y-title-bare]
  [fixture: xychart/db-grid-directive-y-title-quoted]
  [fixture: xychart/db-grid-directive-plot-title-bare]
  [fixture: xychart/db-grid-directive-plot-title-quoted]
  [fixture: xychart/db-grid-directive-label]
- 2 つの単位の間のディレクティブはかまいません。
  それだけの行、キーワードの前、キーワードと角括弧の間、値や分類の間、
  数と矢印の間、文の後です。
  [fixture: xychart/db-directive-line]
  [fixture: xychart/db-title-directive-before-keyword]
  [fixture: xychart/db-directive-glued-to-keyword]
  [fixture: xychart/db-plot-directive-inside]
  [fixture: xychart/db-x-axis-band-directive]
  [fixture: xychart/db-directive-in-range]
  [fixture: xychart/db-directive-between-label]
  [fixture: xychart/db-directive-after-plot]
- キーワード、数、矢印の中のディレクティブは入力を拒否させます。
  mermaid.js は前後をつなぎます。
  `ti%%{init: {}}%%tle T`、`x-%%{init: {}}%%axis [a]`、
  `line [1%%{init: {}}%%2]`、`x-axis 1%%{init: {}}%%0 --> 20`、
  `x-axis 1 -%%{init: {}}%%-> 5` です。
  これは既知の差異
  [`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)
  です。
  [fixture: xychart/div-directive-in-keyword]
  [fixture: xychart/div-directive-in-axis-keyword]
  [fixture: xychart/db-plot-directive-in-number]
  [fixture: xychart/div-directive-in-range-number]
  [fixture: xychart/db-directive-in-arrow]
- 閉じていないディレクティブはテキストの終わりまで続き、
  その引数は次の行で始まってもかまいません
  （[ディレクティブの位置](../common.ja.md#ディレクティブの位置) を参照）。
  テキストの終わり、文の後、ヘッダーの後の `%%{init` はほかに何も取りません。
  一方、`title T %%{init` に行 `line [1]` が続くと、語 `line` を引数として取り、
  その行の残りは拒否されます。
  [fixture: xychart/db-directive-unclosed-at-end]
  [fixture: xychart/db-directive-unclosed-after-header]
  [fixture: xychart/db-directive-unclosed-after-plot]
  [fixture: xychart/db-directive-unclosed-after-categories]
  [fixture: xychart/gram-directive-unclosed-next-line]

### 文の文脈

文の文脈の規則を、試す順に並べます。

1. `%%` とその行の残り: コメント（[コメント](#コメント) を参照）。
2. 1 つ以上の改行文字: `newline` の単位。
3. 大文字小文字を区別せずに比べる**キーワード**:
   - `title`、`xychart-beta`、`xychart`、`x-axis`、`y-axis`、`line`、`bar` で、
     どれも語の文字（文字、数字、`_`）が続かないもの:
     キーワードの名前の単位。`xychart-beta` と `xychart` ではヘッダー。
     `x-axis` と `y-axis` は軸の文脈に、
     `line` と `bar` はプロットの文脈に入ります。
   - `vertical` と `horizontal` で、何が続いてもよいもの: `orientation` の単位。
   - `accTitle` と `accDescr`、改行を含む空白、`:`:
     `accTitle` か `accDescr` の単位と `:` の単位で、
     そのキーワードのアクセシビリティの文脈に入ります。
   - `accDescr`、改行を含む空白、`{`:
     `accDescr` の単位と `{` の単位で、説明ブロックの文脈に入ります。
4. `"`: 文字列の文脈に入ります（[文字列](#文字列) を参照）。
5. `[` か `]`: その文字の単位。
6. 1 つ以上の ASCII の文字、1 つ以上の数字、
   または `-`、`_`、`.`、`+`、`=`、`*`、`&`、`#` のどれか 1 つ: `word` の単位。
7. `,` か `;`: その文字の単位。
8. 改行文字を含む 1 つ以上の空白: 何もなし。

単位が始まるどの位置でも、キーワードを語より先に試し、
文字の語は続く文字をすべて読みます。
そのため、キーワードは文字の並びの頭で読まれます。
語の中の数字、`_`、`-`、`.` の後でもそうなので、
`a1bar`、`T_line`、`a-title`、`a.line`、`a-xychart`、`a-x-axis` は
キーワードを持ち、拒否されます。
一方、`titleX`、`Titled`、`Barbara`、`a-titles`、`1accTitle` は語です。
規則 3 の最初の項目のキーワードは、
`-` や `.` などの語の文字でない文字が続いてもそのキーワードで、
その文字は次の単位を始めます。
`x-axis-foo` と `y-axis-foo` はタイトル `-foo` の軸、
`title-x` はタイトル `-x`、
`line.5` と `bar.5` はタイトル `.5` のプロットです。
`vertical` と `horizontal` は、後に境界が要りません。
`Verticals` と `a_vertical` は向きを持って拒否され、`aVertical` は語です。
別の大文字小文字のキーワードもキーワードです。
`Title`、`TITLE`、`Bar`、`LINE`、`X-AXIS`、`ACCTITLE:`、
`ACCDESCR {` は文を始め、
`title Title` は拒否されます。
引用符なしのキーワードはテキストになりません。
`title line`、分類 `line`、軸のタイトル `Title` は拒否され、
引用符の中とアクセシビリティのテキストではキーワードもテキストです。
`:` のない `accTitle` は語の文字です。
`accTitle` と `:` の間の文字、数字、ダッシュと、
`accTitle` の中の空白文字は、入力を拒否させます。
[fixture: xychart/db-x-axis-keyword-glued-hyphen-title]
[fixture: xychart/db-y-axis-keyword-glued-hyphen-title]
[fixture: xychart/db-title-keyword-glued-hyphen]
[fixture: xychart/db-plot-keyword-glued-dot-title]
[fixture: xychart/db-bar-keyword-glued-dot-title]
[fixture: xychart/db-title-capitalized-keyword]
[fixture: xychart/db-title-upper-case-keyword]
[fixture: xychart/db-plot-capitalized-keyword]
[fixture: xychart/db-plot-upper-case-keyword]
[fixture: xychart/db-x-axis-upper-case-keyword]
[fixture: xychart/db-acc-title-upper-case]
[fixture: xychart/db-acc-descr-block-upper-case]
[fixture: xychart/db-title-keyword-prefix-word]
[fixture: xychart/db-x-axis-title-keyword-prefix]
[fixture: xychart/db-keyword-capitalized-prefix-of-word]
[fixture: xychart/db-plot-keyword-prefix-of-word]
[fixture: xychart/db-keyword-word-starting-with-title-after-hyphen]
[fixture: xychart/db-acc-keyword-without-colon-in-word]
[fixture: xychart/db-orientation-inside-word]
[fixture: xychart/gram-title-glued] [fixture: xychart/gram-title-plural]
[fixture: xychart/gram-plot-values-keyword-glued-title]
[fixture: xychart/gram-plot-values-bar-keyword-glued]
[fixture: xychart/gram-x-axis-keyword-suffix]
[fixture: xychart/gram-acc-title-word-suffix]
[fixture: xychart/gram-acc-title-digit-suffix]
[fixture: xychart/gram-acc-title-dash-suffix]
[fixture: xychart/gram-acc-title-space-in-keyword]
[fixture: xychart/gram-keyword-after-digit-in-word]
[fixture: xychart/gram-keyword-after-underscore-in-word]
[fixture: xychart/gram-keyword-after-hyphen-in-word]
[fixture: xychart/gram-keyword-after-dot-in-word]
[fixture: xychart/gram-header-keyword-in-word]
[fixture: xychart/gram-axis-keyword-in-word]
[fixture: xychart/gram-orientation-prefix-of-word]
[fixture: xychart/gram-orientation-after-underscore-in-word]
[fixture: xychart/gram-title-bare-title-keyword]
[fixture: xychart/gram-title-keyword-as-text]
[fixture: xychart/gram-grid-keyword-title-bare]
[fixture: xychart/gram-grid-keyword-x-title-bare]
[fixture: xychart/gram-grid-keyword-y-title-bare]
[fixture: xychart/gram-grid-keyword-plot-title-bare]
[fixture: xychart/gram-x-axis-title-bare-title-keyword]
[fixture: xychart/gram-y-axis-title-bare-title-keyword]
[fixture: xychart/gram-grid-keyword-category-bare]
[fixture: xychart/gram-x-axis-band-title-keyword]
[fixture: xychart/gram-x-axis-band-keyword-upper-case]
[fixture: xychart/gram-x-axis-band-keyword]
[fixture: xychart/gram-x-axis-band-axis-keyword]
[fixture: xychart/db-grid-keyword-title-quoted]
[fixture: xychart/db-grid-keyword-acc-title]
[fixture: xychart/db-grid-keyword-acc-descr]
[fixture: xychart/db-grid-keyword-acc-descr-block]
[fixture: xychart/db-grid-keyword-x-title-quoted]
[fixture: xychart/db-grid-keyword-category-quoted]
[fixture: xychart/db-grid-keyword-y-title-quoted]
[fixture: xychart/db-grid-keyword-plot-title-quoted]
[fixture: xychart/db-grid-keyword-label]
[fixture: xychart/db-title-quoted-keyword]
[fixture: xychart/db-x-axis-band-quoted-keyword]

そのため、引用符なしのテキストは、ASCII の文字、数字、
`-`、`_`、`.`、`+`、`=`、`*`、`&`、`#` でできています。
`#` はコメントではなく、`title T # c` はタイトル `T#c` を持ちます。
ほかの文字は、どの規則も読まないか、どのテキストも取らない単位です。
`,`、`:`、`/`、`(`、`)`、`'`、`<`、`>`、`[`、`]`、単独の `%`、逆引用符、
ASCII の外の文字は、タイトル、分類、軸やプロットのタイトルを拒否させます。
`#` で始まる行は語で、文ではありません。
`__proto__` と `constructor` は、ほかと同じ語です。
[fixture: xychart/db-title-bare-characters]
[fixture: xychart/db-title-hash-bare-word]
[fixture: xychart/db-title-bare-hash-comment]
[fixture: xychart/db-title-bare-digit] [fixture: xychart/db-title-bare-number]
[fixture: xychart/db-lines-prototype-title]
[fixture: xychart/db-title-bare-word]
[fixture: xychart/spec-xychart-jison-571269be]
[fixture: xychart/gram-title-bare-angle]
[fixture: xychart/gram-title-bare-apostrophe]
[fixture: xychart/gram-title-bare-colon]
[fixture: xychart/gram-title-bare-comma]
[fixture: xychart/gram-title-bare-non-ascii]
[fixture: xychart/gram-title-bare-parenthesis]
[fixture: xychart/gram-title-bare-percent-at-end]
[fixture: xychart/gram-title-bare-percent-inside]
[fixture: xychart/gram-title-bare-slash]
[fixture: xychart/gram-title-bare-square]
[fixture: xychart/gram-comment-hash-line]
[fixture: xychart/gram-comment-percent-single]
[fixture: xychart/gram-grid-punct-title-bare]
[fixture: xychart/gram-grid-punct-x-title-bare]
[fixture: xychart/gram-grid-punct-category-bare]
[fixture: xychart/gram-grid-punct-y-title-bare]
[fixture: xychart/gram-grid-punct-plot-title-bare]
[fixture: xychart/gram-grid-nonascii-x-title-bare]
[fixture: xychart/gram-grid-nonascii-category-bare]
[fixture: xychart/gram-grid-nonascii-y-title-bare]
[fixture: xychart/gram-grid-nonascii-plot-title-bare]
[fixture: xychart/gram-x-axis-band-percent-inside]
[fixture: xychart/gram-x-axis-band-non-ascii]
[fixture: xychart/db-grid-proto-title-bare]
[fixture: xychart/db-grid-proto-x-title-bare]
[fixture: xychart/db-grid-proto-category-bare]
[fixture: xychart/db-grid-proto-y-title-bare]
[fixture: xychart/db-plot-title-prototype-name]
[fixture: xychart/db-x-axis-prototype-title]
[fixture: xychart/db-grid-hash-title-bare]
[fixture: xychart/db-grid-hash-x-title-bare]
[fixture: xychart/db-grid-hash-category-bare]
[fixture: xychart/db-grid-hash-y-title-bare]
[fixture: xychart/db-grid-hash-plot-title-bare]

### 軸の文脈

`x-axis` と `y-axis` は軸の文脈に入ります。
軸の文脈は、その文の終わりで終わります。
改行はこの文脈を出て `newline` の単位になり、
`;` とキーワードはこの文脈を出て、下の文脈で読まれます。
ただし、`accDescr` と `{` はこの文脈の上に説明ブロックの文脈を積むので、
`}` の後も軸の文脈が続きます。
範囲の数と矢印の間や、軸のタイトルの後で分類の前にある説明ブロックは、
軸の文脈で読まれて入力を拒否させます。
一方、`accTitle:` と `accDescr:` はその行の残りを取り、
`x-axis A accDescr {x} line [1]` のように、
その行で別の文が続く説明ブロックは受理されます。
[fixture: xychart/gram-x-axis-description-block-in-range]
[fixture: xychart/gram-x-axis-description-block-then-band]
[fixture: xychart/db-x-axis-title-then-acc-descr-line]
[fixture: xychart/db-x-axis-title-then-acc-title-line]
[fixture: xychart/db-x-axis-title-then-description-block]
[fixture: xychart/db-x-axis-title-description-block-then-plot]
[fixture: xychart/div-empty-description-block-in-range]
[fixture: xychart/div-empty-description-block-in-y-axis-range]
[fixture: xychart/gram-plot-description-block-before-values]
規則は、文の文脈の規則の前に、次のものを順に置いたものです。

1. `[`: `[` の単位で、分類の文脈に入ります。
2. `-->`: `-->` の単位。
3. **数**: 省略できる `+` か `-` の後に、
   省略できる `.` と数字を伴う数字か、`.` と数字: `number` の単位。

そのため、数字は数を始め、引用符なしの軸のタイトルは数字を持ちません。
`x-axis Q1`、`x-axis A-1`、`x-axis A_1`、`x-axis Year 2024`、
`y-axis 2024`、`y-axis Revenue2024`、`x-axis a.5` は拒否されます。
`x-axis T1 --> 2` はタイトル `T` と範囲です。
一方、`x-axis "Q1"`、`a-b`、
`- 1 --> 2`（`-` は空白文字の前の語）は受理されます。
範囲には矢印の 3 文字が続いて要ります。
`1-->-2` は範囲で、`1 - -> 2`、`1 -- > 2`、`1 -> 2` は拒否されます。
キーワードの後には、空白文字なしで角括弧と引用符が続けられ、
引用符の中のタイトルの後には角括弧と数が続けられます。
`x-axis "A"[a]` はタイトル `A` と分類 `a` です。
[fixture: xychart/gram-x-axis-title-bare-digit]
[fixture: xychart/gram-x-axis-title-bare-digit-before-band]
[fixture: xychart/gram-x-axis-title-bare-hyphen-digit]
[fixture: xychart/gram-x-axis-title-bare-underscore-digit]
[fixture: xychart/gram-x-axis-title-bare-words-number]
[fixture: xychart/gram-y-axis-title-bare-digit]
[fixture: xychart/gram-y-axis-title-bare-digit-before-range]
[fixture: xychart/gram-y-axis-title-bare-letters-digits]
[fixture: xychart/gram-x-axis-title-dot-digit]
[fixture: xychart/db-x-axis-title-quoted-digit]
[fixture: xychart/db-x-axis-title-bare-hyphen]
[fixture: xychart/db-x-axis-title-bare-characters]
[fixture: xychart/db-x-axis-title-then-glued-range]
[fixture: xychart/db-x-axis-title-hyphen-then-range]
[fixture: xychart/spec-xychart-jison-1627cb67]
[fixture: xychart/db-x-axis-range-glued-negative-end]
[fixture: xychart/db-x-axis-range-no-spaces]
[fixture: xychart/gram-x-axis-range-arrow-split-after-dash]
[fixture: xychart/gram-x-axis-range-arrow-split-before-head]
[fixture: xychart/gram-x-axis-range-short-arrow]
[fixture: xychart/db-y-axis-title-quoted-glued-range]
[fixture: xychart/db-x-axis-keyword-glued-bracket]
[fixture: xychart/db-x-axis-keyword-glued-quote]
[fixture: xychart/gram-y-axis-glued-bracket]
[fixture: xychart/db-x-axis-title-quoted-glued-band]

数は指数を持たず、後に数字のない `.` も持ちません。
`1e3 --> 5` と `1. --> 2` は拒否され、
`.5`、`007`、`-0`、`+1`、20 桁の数は数です。
[fixture: xychart/db-x-axis-range-decimal]
[fixture: xychart/db-x-axis-range-leading-zeros]
[fixture: xychart/db-x-axis-range-negative]
[fixture: xychart/db-x-axis-range-negative-zero]
[fixture: xychart/db-x-axis-range-plus] [fixture: xychart/db-x-axis-range-large]
[fixture: xychart/gram-x-axis-range-exponent]
[fixture: xychart/gram-x-axis-range-trailing-dot]
[fixture: xychart/spec-xychart-jison-2e7c7613]
[fixture: xychart/spec-xychart-jison-7cef6803]
[fixture: xychart/spec-xychart-jison-f137f1b7]

軸の文脈はその文で終わります。
そのため、同じ行でその後の文は、`;`、U+2028、説明ブロックの後でも、
何も挟まなくても、文の文脈で読まれ、それより後の行も同じです。
`x-axis A; title Q1`、`x-axis [a] title T5`、
`x-axis A; line [1]` の次の行の `title Q1`、
`x-axis A` と空白文字の次の行の `title Q1` は受理されます。
mermaid.js はそのようなタイトルの数字を軸の文脈で読んで拒否します。
これは既知の差異
[`title-digit-after-axis-statement`](../known-divergences/title-digit-after-axis-statement.ja.md)
です。
[fixture: xychart/div-title-digit-after-axis-semicolon]
[fixture: xychart/div-title-digit-after-axis-band-same-line]
[fixture: xychart/div-title-digit-after-axis-band-semicolon]
[fixture: xychart/div-title-digit-after-axis-line-separator]
[fixture: xychart/div-title-digit-after-axis-and-empty-block]
[fixture: xychart/div-title-digit-next-line-after-axis-and-plot]
[fixture: xychart/div-title-digit-after-axis-trailing-space]
[fixture: xychart/db-title-digit-line-after-axis]
[fixture: xychart/db-title-digit-after-axis-and-plot-same-line]
[fixture: xychart/db-title-dotted-word-after-axis-semicolon]

### 分類の文脈

軸の文脈の `[` は分類の文脈に入り、`]` はそれを出ます。
規則は、文の文脈の規則の前に、この文脈を出る `]` を置いたものです。
そのため、ここでは数字は語です。
`[Q1]`、`[1, 2]`、`[-1, +2, .5]`、`[1.5, -2]` は分類で、
分類の語は、間に空白があってもなくても 1 つの分類です。
改行は `newline` の単位で、分類はそれを取りません。
[fixture: xychart/db-x-axis-band-digit]
[fixture: xychart/db-x-axis-band-numbers]
[fixture: xychart/db-x-axis-band-negative]
[fixture: xychart/db-x-axis-band-decimal-and-negative]
[fixture: xychart/db-x-axis-band-characters]
[fixture: xychart/db-x-axis-band-words]
[fixture: xychart/db-x-axis-band-no-spaces]
[fixture: xychart/gram-x-axis-band-spaces-only]

### プロットの文脈

`line` と `bar` はプロットの文脈に入ります。
プロットの文脈は、軸の文脈と同じく、その文の終わりで終わり、
`accDescr` と `{` がその上に積む説明ブロックでは終わりません。
プロットのタイトルと値の間の説明ブロックは、入力を拒否させます。
規則は、文の文脈の規則の前に、値の文脈に入る `[` を置いたものです。
そのため、プロットのタイトルでは数字は語です。
`line Q1 [1]`、`bar 2024 [1]`、`line a-1 [1]`、`line -5 [2]`、
`line 1.5 [2]` は、
タイトル `Q1`、`2024`、`a-1`、`-5`、`1.5` を持ちます。
角括弧は、キーワードやタイトルの後に空白文字なしで続けられ、
間にタブを置いてもかまいません。
[fixture: xychart/db-line-title-bare-digit]
[fixture: xychart/db-bar-title-bare-number]
[fixture: xychart/db-plot-title-bare-hyphen-digit]
[fixture: xychart/db-plot-title-negative-number]
[fixture: xychart/db-plot-title-decimal]
[fixture: xychart/db-plot-title-glued-bracket]
[fixture: xychart/db-plot-title-quoted-glued-bracket]
[fixture: xychart/db-plot-keyword-glued-bracket]
[fixture: xychart/db-plot-bar-keyword-glued-bracket]
[fixture: xychart/db-plot-tab-keyword]
[fixture: xychart/db-statements-same-line-plot-then-title-digit]
[fixture: xychart/db-title-digit-after-plot-semicolon]

### 値の文脈

プロットの文脈の `[` は値の文脈に入り、`]` はそれを出ます。
規則は、文の文脈の規則の前に、この文脈を出る `]` と、
軸の文脈と同じ数を置いたものです。
値は数です。
`.5`、`-1`、`+.5`、`007`、`-0`、20 桁と 400 桁の数は値で、
`1e3`、`Infinity`、`NaN`、`5.`、`1.5.2`、`1_0`、`abc`、`-4aa5` は拒否されます。
[fixture: xychart/db-plot-values-one] [fixture: xychart/db-line-values]
[fixture: xychart/db-bar-values] [fixture: xychart/db-plot-values-no-spaces]
[fixture: xychart/db-plot-values-spaces]
[fixture: xychart/db-plot-values-decimal]
[fixture: xychart/db-plot-values-negative]
[fixture: xychart/db-plot-values-negative-zero]
[fixture: xychart/db-plot-values-plus]
[fixture: xychart/db-plot-values-leading-zeros]
[fixture: xychart/db-plot-values-large]
[fixture: xychart/db-plot-values-overflow]
[fixture: xychart/demo-xychart-d8ce9a38]
[fixture: xychart/gram-plot-values-exponent]
[fixture: xychart/gram-plot-values-infinity]
[fixture: xychart/gram-plot-values-nan]
[fixture: xychart/gram-plot-values-trailing-dot]
[fixture: xychart/gram-plot-values-two-dots]
[fixture: xychart/gram-plot-values-underscore]
[fixture: xychart/gram-plot-values-word]
[fixture: xychart/spec-xychart-jison-5ba427e7]
[fixture: xychart/spec-xychart-jison-35064ff7]

### 文字列

`"` は文字列の文脈に入ります。
この文脈は、次の `"` までのすべての文字を `string` の単位として読み、
その `"` で文脈を出ます。単位のテキストは引用符の間にあるものです。
テキストは改行を含めてどの文字でも持てます。
両端の空白文字、句読点、キーワード、ASCII の外の文字、マークアップ、
空白文字の後の `%%`、逆引用符、U+2028 はその文字です。
引用符の間に何もない文字列は、空のテキストの `string` の単位です
（[空の文字列](#空の文字列) を参照）。
文字列にエスケープはありません。2 つ目の `"` が文字列を終えるので、
`"a""b"` は 2 つの文字列です。
閉じていない文字列は入力を拒否させます。
[fixture: xychart/db-title-quoted]
[fixture: xychart/db-title-quoted-spaces-trimmed]
[fixture: xychart/db-title-quoted-special]
[fixture: xychart/db-title-quoted-non-ascii]
[fixture: xychart/db-title-quoted-line-feed]
[fixture: xychart/db-title-quoted-crlf]
[fixture: xychart/db-title-quoted-crlf-category]
[fixture: xychart/db-title-quoted-line-separator]
[fixture: xychart/db-title-quoted-percent] [fixture: xychart/db-title-md-string]
[fixture: xychart/gram-title-quoted-unclosed]
[fixture: xychart/gram-label-doubled-quote]
[fixture: xychart/db-plot-title-quoted-lone-cr]
[fixture: xychart/db-plot-title-quoted-line-feed]
[fixture: xychart/db-label-line-feed] [fixture: xychart/db-label-quoted-crlf]
[fixture: xychart/db-x-axis-band-quoted-line-feed]
[fixture: xychart/db-category-quoted-line-separator]
[fixture: xychart/db-grid-crlf-title-quoted]
[fixture: xychart/db-grid-cr-title-quoted]
[fixture: xychart/db-grid-ps-title-quoted]
[fixture: xychart/db-grid-tab-title-quoted]
[fixture: xychart/db-grid-bom-title-quoted]
[fixture: xychart/db-grid-nbsp-title-quoted]
[fixture: xychart/db-grid-ideographic-title-quoted]
[fixture: xychart/db-grid-nonascii-title-quoted]
[fixture: xychart/db-grid-punct-title-quoted]
[fixture: xychart/db-grid-proto-title-quoted]
[fixture: xychart/db-grid-hash-title-quoted]
[fixture: xychart/db-grid-lf-x-title-quoted]
[fixture: xychart/db-grid-lf-category-quoted]
[fixture: xychart/db-grid-lf-y-title-quoted]
[fixture: xychart/db-grid-crlf-x-title-quoted]
[fixture: xychart/db-grid-crlf-category-quoted]
[fixture: xychart/db-grid-crlf-y-title-quoted]
[fixture: xychart/db-grid-crlf-plot-title-quoted]
[fixture: xychart/db-grid-crlf-label]
[fixture: xychart/db-grid-cr-x-title-quoted]
[fixture: xychart/db-grid-cr-category-quoted]
[fixture: xychart/db-grid-cr-y-title-quoted] [fixture: xychart/db-grid-cr-label]
[fixture: xychart/db-grid-ls-x-title-quoted]
[fixture: xychart/db-grid-ls-category-quoted]
[fixture: xychart/db-grid-ls-y-title-quoted]
[fixture: xychart/db-grid-ls-plot-title-quoted]
[fixture: xychart/db-grid-ls-label] [fixture: xychart/db-grid-ps-x-title-quoted]
[fixture: xychart/db-grid-ps-category-quoted]
[fixture: xychart/db-grid-ps-y-title-quoted]
[fixture: xychart/db-grid-ps-plot-title-quoted]
[fixture: xychart/db-grid-ps-label]
[fixture: xychart/db-grid-tab-x-title-quoted]
[fixture: xychart/db-grid-tab-category-quoted]
[fixture: xychart/db-grid-tab-y-title-quoted]
[fixture: xychart/db-grid-tab-plot-title-quoted]
[fixture: xychart/db-grid-tab-label]
[fixture: xychart/db-grid-bom-x-title-quoted]
[fixture: xychart/db-grid-bom-category-quoted]
[fixture: xychart/db-grid-bom-y-title-quoted]
[fixture: xychart/db-grid-bom-plot-title-quoted]
[fixture: xychart/db-grid-bom-label]
[fixture: xychart/db-grid-nbsp-x-title-quoted]
[fixture: xychart/db-grid-nbsp-category-quoted]
[fixture: xychart/db-grid-nbsp-y-title-quoted]
[fixture: xychart/db-grid-nbsp-plot-title-quoted]
[fixture: xychart/db-grid-nbsp-label]
[fixture: xychart/db-grid-ideographic-x-title-quoted]
[fixture: xychart/db-grid-ideographic-category-quoted]
[fixture: xychart/db-grid-ideographic-y-title-quoted]
[fixture: xychart/db-grid-ideographic-plot-title-quoted]
[fixture: xychart/db-grid-ideographic-label]
[fixture: xychart/db-grid-nonascii-x-title-quoted]
[fixture: xychart/db-grid-nonascii-category-quoted]
[fixture: xychart/db-grid-nonascii-y-title-quoted]
[fixture: xychart/db-grid-nonascii-plot-title-quoted]
[fixture: xychart/db-grid-nonascii-label]
[fixture: xychart/db-grid-punct-x-title-quoted]
[fixture: xychart/db-grid-punct-category-quoted]
[fixture: xychart/db-grid-punct-y-title-quoted]
[fixture: xychart/db-grid-punct-plot-title-quoted]
[fixture: xychart/db-grid-punct-label]
[fixture: xychart/db-grid-proto-x-title-quoted]
[fixture: xychart/db-grid-proto-category-quoted]
[fixture: xychart/db-grid-proto-y-title-quoted]
[fixture: xychart/db-grid-proto-plot-title-quoted]
[fixture: xychart/db-grid-proto-label]
[fixture: xychart/db-grid-hash-x-title-quoted]
[fixture: xychart/db-grid-hash-category-quoted]
[fixture: xychart/db-grid-hash-y-title-quoted]
[fixture: xychart/db-grid-hash-plot-title-quoted]
[fixture: xychart/db-grid-hash-label]

markdown 文字列、つまり引用符の後に逆引用符が続くものは、
この図種では独自の単位ではありません。
`"`x`"` は、2 つの逆引用符をテキストに持つ文字列で、
文字列の外の逆引用符はどの規則も読みません。
[fixture: xychart/db-title-md-string]

### アクセシビリティの値

`accTitle` と `:` はアクセシビリティのタイトルの文脈に、
`accDescr` と `:` はアクセシビリティの説明の文脈に入ります。
どちらも、`:` の後の空白を改行も含めて読み、
それから行の残りを
`acc-title-text` か `acc-description-text` の単位として読んで、
文脈を出ます。
そのため、テキストはキーワードの後で空白以外の文字を持つ最初の行で始まり、
その行が文であっても、行全体を取ります。
`accTitle:` に行 `line [1]` が続くと、テキスト `line [1]` を持ち、
それは文ではなくなります。
その間のコメント行とディレクティブの行は、テキストの行ではありません。
テキストの終わりまで空白しか続かないとき、単位は空です。
`:` の前には改行も含めて空白を置け、
その間にコメント行やディレクティブの行があってもかまいません。
`accTitle`、コメント行、`: T` はタイトル `T` を持ちます。
`:`、`;`、`#`、`%%` と、文の文脈の文字は、テキストの文字です。
[fixture: xychart/db-acc-title] [fixture: xychart/db-acc-descr]
[fixture: xychart/db-acc-title-no-space]
[fixture: xychart/db-acc-title-space-before-colon]
[fixture: xychart/db-acc-title-colon-on-next-line]
[fixture: xychart/db-acc-descr-colon-on-next-line]
[fixture: xychart/db-acc-title-comment-line-before-colon]
[fixture: xychart/db-acc-descr-comment-line-before-colon]
[fixture: xychart/db-acc-title-directive-line-before-colon]
[fixture: xychart/db-acc-descr-directive-line-before-colon]
[fixture: xychart/db-acc-title-two-colons]
[fixture: xychart/db-acc-title-colon-inside]
[fixture: xychart/db-acc-title-hash] [fixture: xychart/db-acc-title-semicolon]
[fixture: xychart/db-acc-title-spaces-trimmed]
[fixture: xychart/db-acc-title-leading-ideographic-space]
[fixture: xychart/db-acc-title-trailing-ideographic-space]
[fixture: xychart/db-acc-title-trailing-nbsp]
[fixture: xychart/db-acc-title-trailing-tab]
[fixture: xychart/db-acc-title-trailing-bom]
[fixture: xychart/db-acc-title-line-separator-inside]
[fixture: xychart/db-acc-descr-line-separator-inside]
[fixture: xychart/db-acc-descr-no-space]
[fixture: xychart/db-acc-title-takes-next-line]
[fixture: xychart/db-acc-title-blank-lines-then-text]
[fixture: xychart/db-acc-title-comment-line-then-text]
[fixture: xychart/db-acc-title-directive-line-then-text]
[fixture: xychart/db-acc-descr-takes-title-line]
[fixture: xychart/db-acc-descr-blank-lines-then-text]
[fixture: xychart/db-acc-descr-comment-line-then-text]
[fixture: xychart/db-acc-descr-directive-line-then-text]
[fixture: xychart/db-acc-title-empty]
[fixture: xychart/db-acc-title-empty-at-end-after-value]
[fixture: xychart/db-acc-descr-empty-at-end-after-value]
[fixture: xychart/db-grid-bom-acc-title]
[fixture: xychart/db-grid-bom-acc-descr]
[fixture: xychart/db-grid-hash-acc-title]
[fixture: xychart/db-grid-hash-acc-descr]
[fixture: xychart/db-grid-ideographic-acc-title]
[fixture: xychart/db-grid-ideographic-acc-descr]
[fixture: xychart/db-grid-nbsp-acc-title]
[fixture: xychart/db-grid-nbsp-acc-descr]
[fixture: xychart/db-grid-nonascii-acc-title]
[fixture: xychart/db-grid-nonascii-acc-descr]
[fixture: xychart/db-grid-proto-acc-title]
[fixture: xychart/db-grid-proto-acc-descr]
[fixture: xychart/db-grid-ps-acc-title] [fixture: xychart/db-grid-ps-acc-descr]
[fixture: xychart/db-grid-punct-acc-title]
[fixture: xychart/db-grid-punct-acc-descr]
[fixture: xychart/db-grid-tab-acc-title]
[fixture: xychart/db-grid-tab-acc-descr]
[fixture: xychart/db-grid-empty-acc-title]
[fixture: xychart/db-grid-empty-acc-descr]

`accDescr`、空白、`{` は説明ブロックの文脈に入ります。
この文脈は、`{` の後の空白を読み、それから次の `}` までのすべての文字を
`description-block-text` の単位として読みます。
空白の後にすぐ `}` が来るとき、単位は空です。
それから `}` を `}` の単位として読み、文脈を出ます。
テキストは改行、`#`、`;`、`%%` を持てます。
その中の CRLF と単独の CR は改行文字です。
`{` の前には改行も含めて空白を置け、
その間にコメント行やディレクティブの行があってもかまいません。
`}` がなければ、テキストは図のテキストの終わりまで続きます。
ブロックの後の 2 つ目の `}` と、テキストの中の波括弧は、その一部ではありません。
`a } b` に `}` が続くと、ブロックは最初の `}` で終わり、
残りは文の文脈で読まれ、そこでは `}` をどの規則も読みません。
[fixture: xychart/db-acc-descr-block]
[fixture: xychart/db-acc-descr-block-no-space]
[fixture: xychart/db-acc-descr-block-spaces-inside]
[fixture: xychart/db-acc-descr-block-line-feed-before-brace]
[fixture: xychart/db-acc-descr-comment-line-before-brace]
[fixture: xychart/db-acc-descr-directive-line-before-brace]
[fixture: xychart/db-acc-descr-block-crlf]
[fixture: xychart/db-acc-descr-block-cr]
[fixture: xychart/db-acc-descr-block-line-separator-inside]
[fixture: xychart/db-acc-descr-block-hash-semicolon]
[fixture: xychart/db-acc-descr-block-percent]
[fixture: xychart/db-acc-descr-unclosed-block]
[fixture: xychart/gram-acc-descr-block-braces-inside]
[fixture: xychart/gram-acc-descr-block-double-close]
[fixture: xychart/gram-acc-descr-block-two-blocks]
[fixture: xychart/db-acc-descr-block-then-title-same-line]
[fixture: xychart/db-acc-descr-block-twice-same-line]
[fixture: xychart/spec-xychart-jison-fc54230a]
[fixture: xychart/db-grid-bom-acc-descr-block]
[fixture: xychart/db-grid-cr-acc-descr-block]
[fixture: xychart/db-grid-crlf-acc-descr-block]
[fixture: xychart/db-grid-hash-acc-descr-block]
[fixture: xychart/db-grid-ideographic-acc-descr-block]
[fixture: xychart/db-grid-lf-acc-descr-block]
[fixture: xychart/db-grid-ls-acc-descr-block]
[fixture: xychart/db-grid-nbsp-acc-descr-block]
[fixture: xychart/db-grid-nonascii-acc-descr-block]
[fixture: xychart/db-grid-proto-acc-descr-block]
[fixture: xychart/db-grid-ps-acc-descr-block]
[fixture: xychart/db-grid-punct-acc-descr-block]
[fixture: xychart/db-grid-tab-acc-descr-block]
[fixture: xychart/db-grid-empty-acc-descr-block]

### コメント

コメントは、単位が始まるところの `%%` から始まり、その行の終わりまで続きます。
改行文字は含みません。コメントはどの単位にも属しません。
コメント行、文の後のコメント、空白文字の後や文字列の閉じる引用符に続くコメント、
テキストの終わりのコメントは何も変えません。
コメントはその前の何も取りません。
`title AB%% c` はタイトル `AB` を、`title T%% c` はタイトル `T` を持ちます。
キーワードとその文の残りの間のコメントは行を終えます。
そのため、`line %% c` に行 `[1]` が続くもの、
`x-axis %% c` に行 `[a]` が続くもの、
`title %% c` に行 `T` が続くものは拒否されます。
分類や値の中、プロットのタイトルの語の間のコメントも、
その行を終えるので拒否されます。
文字列、アクセシビリティのテキスト、説明ブロックの中の `%%` は、その文字です。
[fixture: xychart/db-comment-line] [fixture: xychart/db-comment-indented]
[fixture: xychart/db-comment-line-between] [fixture: xychart/db-comment-at-end]
[fixture: xychart/db-comment-after-statement]
[fixture: xychart/db-comment-after-bracket-line]
[fixture: xychart/db-comment-spaced-after-range]
[fixture: xychart/db-title-bare-percent-comment]
[fixture: xychart/db-plot-comment-after]
[fixture: xychart/db-x-axis-band-comment-after]
[fixture: xychart/db-comment-glued-after-quote]
[fixture: xychart/db-comment-glued-after-quoted-axis-title]
[fixture: xychart/header-bare-percent-line-after-header]
[fixture: xychart/db-comment-glued-after-two-letter-word]
[fixture: xychart/db-comment-glued-after-two-digit-number]
[fixture: xychart/db-comment-glued-after-semicolon]
[fixture: xychart/gram-line-comment-before-bracket]
[fixture: xychart/gram-x-axis-comment-before-bracket]
[fixture: xychart/gram-title-comment-line-before-text]
[fixture: xychart/gram-title-comment-line-between]
[fixture: xychart/gram-grid-comment-category-bare]
[fixture: xychart/gram-grid-comment-plot-title-bare]
[fixture: xychart/gram-comment-in-label-quotes-closing]
[fixture: xychart/gram-plot-comment-inside]
[fixture: xychart/db-grid-comment-title-bare]
[fixture: xychart/db-grid-comment-acc-title]
[fixture: xychart/db-grid-comment-acc-descr]
[fixture: xychart/db-grid-comment-acc-descr-block]
[fixture: xychart/db-grid-comment-x-title-bare]
[fixture: xychart/db-grid-comment-x-title-quoted]
[fixture: xychart/db-grid-comment-category-quoted]
[fixture: xychart/db-grid-comment-y-title-bare]
[fixture: xychart/db-grid-comment-y-title-quoted]
[fixture: xychart/db-grid-comment-plot-title-quoted]
[fixture: xychart/db-grid-comment-label]
[fixture: xychart/db-title-quoted-percent]

mermaid.js は、1 文字の単位にくっついたコメントを、その文字とともに読みます。
`title T%% c`、`x-axis T%% c`、`line [1]%% c`、`x-axis [a, b]%% c`、
`bar [1 "a"]%% c`、`y-axis 0 --> 1%% c` は、mermaid.js では拒否され、
`title A B%% c` はタイトル `A` を、`title a-%% c` はタイトル `a` を持ちます。
これは既知の差異
[`comment-takes-character`](../known-divergences/comment-takes-character.ja.md)
です。
[fixture: xychart/div-comment-glued-after-title-word]
[fixture: xychart/div-comment-glued-after-axis-title]
[fixture: xychart/div-comment-glued-after-bracket]
[fixture: xychart/div-comment-glued-after-categories]
[fixture: xychart/div-comment-glued-after-label]
[fixture: xychart/div-comment-glued-after-range]
[fixture: xychart/div-comment-takes-one-letter-word]
[fixture: xychart/div-comment-takes-hyphen]

## 文法

文法は [common.ja.md](../common.ja.md#表記) の表記を、
文字ではなく単位の上で使います。
`word` のような単位の名前は、その名前の単位 1 つを表し、
`"title"` や `","` のような二重引用符の中のテキストは、
そのテキストの名前の単位を表します。
文法は
[`xychart.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L83-L175)
の文法の言い直しで、既知の差異を除いて、同じ単位の並びを受理します。

以下の各規則は、
[ast/xychart.ja.md](../ast/xychart.ja.md) で定める木のノードを作ります。

| 規則                                                               | ノード                        |
| ------------------------------------------------------------------ | ----------------------------- |
| `diagram`                                                          | XychartDiagram                |
| `header-part`                                                      | XychartHeader                 |
| `title-statement`                                                  | XychartTitleStatement         |
| `x-axis-statement`                                                 | XychartXAxisStatement         |
| `y-axis-statement`                                                 | XychartYAxisStatement         |
| `band`                                                             | XychartBand                   |
| `range`                                                            | XychartRange                  |
| `plot-statement`                                                   | XychartPlotStatement          |
| `value`                                                            | XychartValue                  |
| `acc-title-statement`                                              | XychartAccTitleStatement      |
| `acc-description-statement`                                        | XychartAccDescrStatement      |
| `description-block-statement`                                      | XychartAccDescrBlockStatement |
| `words`                                                            | XychartLiteral                |
| `acc-title-text`、`acc-description-text`、`description-block-text` | XychartLiteral                |
| `string`                                                           | StringLiteral                 |
| `number`                                                           | NumericLiteral                |

### 図と文

```text
diagram     = newline* header-part ( eol | header-part )* ( statement | eol )*
header-part = header orientation?
eol         = newline | ";"
statement   = title-statement | x-axis-statement | y-axis-statement
            | plot-statement | acc-title-statement
            | acc-description-statement | description-block-statement
words       = word+
```

図は 1 つ以上のヘッダーと、それに続く文です。
ヘッダーは、同じ行でも後の行でも、別のヘッダーに続けられ、向きを持てますが、
文の後にヘッダーは来ません。
文は、次の文の前に何も要りません。
2 つの文は、空白を挟んでも何も挟まなくても 1 つの行に置けます。
`title T line [1]`、`x-axis [a] line [1]`、`line [1] accTitle: b`、
`line [1]bar [2]`、`title "T"line [1]` です。
`;` は改行と同じく行を終え、空行と空の文は何も変えません。
文の後の、文を始めないテキストは入力を拒否させます。
`line [1, 2] extra`、`x-axis [a, b] extra`、`title "T" extra`、
2 つ目の `]` です。
[fixture: xychart/header-twice] [fixture: xychart/header-twice-same-line]
[fixture: xychart/header-second-with-orientation]
[fixture: xychart/header-after-semicolon-line]
[fixture: xychart/header-leading-semicolon]
[fixture: xychart/gram-header-after-statement]
[fixture: xychart/db-statements-same-line-title-then-plot]
[fixture: xychart/db-statements-same-line-axis-title-then-plot]
[fixture: xychart/db-statements-same-line-two-plots]
[fixture: xychart/db-statements-same-line-band-then-plot]
[fixture: xychart/db-statements-same-line-range-then-title]
[fixture: xychart/db-statements-same-line-title-then-acc-title]
[fixture: xychart/db-statements-same-line-plot-then-acc-title]
[fixture: xychart/db-statements-glued-two-plots]
[fixture: xychart/db-statements-glued-after-quoted-title]
[fixture: xychart/db-statements-glued-after-categories]
[fixture: xychart/db-semicolon-after-statement]
[fixture: xychart/db-semicolon-line-alone]
[fixture: xychart/db-semicolon-spaced]
[fixture: xychart/db-semicolon-statements] [fixture: xychart/db-semicolon-twice]
[fixture: xychart/db-statement-leading-semicolon]
[fixture: xychart/db-title-semicolon-empty-statements]
[fixture: xychart/db-title-bare-semicolon]
[fixture: xychart/db-title-quoted-semicolon]
[fixture: xychart/gram-plot-values-extra-text]
[fixture: xychart/gram-x-axis-band-extra-text]
[fixture: xychart/gram-title-after-quoted]
[fixture: xychart/spec-xychart-jison-37d8510a]
[fixture: xychart/spec-xychart-jison-ad21b30c]
[fixture: xychart/spec-xychart-jison-284bf6c8]
テキストの終わりの文のキーワードは、
それだけでもタイトルだけを伴っても拒否されます。
`title`、`line`、`bar`、`line T`、`bar T`、`x-axis`、`y-axis`、`accTitle`、
`accDescr` です。
[fixture: xychart/gram-title-keyword-alone-at-end]
[fixture: xychart/gram-line-keyword-alone-at-end]
[fixture: xychart/gram-bar-keyword-alone-at-end]
[fixture: xychart/gram-line-title-only-at-end]
[fixture: xychart/gram-bar-title-only-at-end]
[fixture: xychart/gram-x-axis-keyword-alone-at-end]
[fixture: xychart/gram-y-axis-keyword-alone-at-end]
[fixture: xychart/gram-acc-title-keyword-alone]
[fixture: xychart/gram-acc-descr-keyword-alone]
mermaid.js の文書の例は受理されます。
[fixture: xychart/docs-intro-examples-9bc72e53]
[fixture: xychart/docs-syntax-xy-chart-26b0cd5e]
[fixture: xychart/docs-syntax-xy-chart-3685342d]
[fixture: xychart/docs-syntax-xy-chart-4191b7b5]
[fixture: xychart/docs-syntax-xy-chart-55d282bc]
[fixture: xychart/docs-syntax-xy-chart-58d05b22]
[fixture: xychart/docs-syntax-xy-chart-ade44d5c]
[fixture: xychart/docs-syntax-xy-chart-fbe6837b]
[fixture: xychart/docs-syntax-xy-chart-ff4787ed]

### タイトル

```text
title-statement = "title" ( words | string )
```

タイトルは語か 1 つの文字列で、両方ではなく、空にもなりません。
`title` だけ、テキストの終わりの `title` と空白文字、`title ""` は拒否されます。
後のタイトルの文も、最初のものと同じ文です。
[fixture: xychart/spec-xychart-jison-a63fe3ac]
[fixture: xychart/db-title-bare-words] [fixture: xychart/db-title-three-times]
[fixture: xychart/db-title-twice] [fixture: xychart/db-title-bare-then-quoted]
[fixture: xychart/db-title-frontmatter]
[fixture: xychart/db-title-frontmatter-and-statement]
[fixture: xychart/db-title-frontmatter-spaces]
[fixture: xychart/gram-title-no-text]
[fixture: xychart/gram-grid-empty-title-bare]
[fixture: xychart/gram-title-empty-string]

### 軸

```text
x-axis-statement = "x-axis" ( axis-title | axis-title? ( band | range ) )
y-axis-statement = "y-axis" ( axis-title | axis-title? range )
axis-title       = words | string
band             = "[" category ( "," category )* "]"
category         = words | string
range            = number "-->" number
```

軸の文は、タイトル、そのデータ、またはその両方を持ちます。
データは、x 軸では分類か範囲、y 軸では範囲です。
タイトルが先に来ます。
空の引用符のタイトルにはデータが続かなければならず、
`x-axis "" [a]` と `y-axis "" 1 --> 2` は受理され、
`x-axis ""` と `y-axis ""` は拒否されます。
分類は語か文字列で、空になりません。
`[]`、`[ ]`、`[, b]`、`["", b]`、`[a, ""]`、`]` の前のコンマは拒否され、
2 つ目の分類の並び、3 つ目の数、1 つの数、角括弧の中の範囲、
引用符の 2 つのタイトル、文字列と語の分類も拒否されます。
同じテキストの 2 つの分類は 2 つの分類で、
後の軸の文も、最初のものと同じ文です。
[fixture: xychart/db-x-axis-band] [fixture: xychart/db-x-axis-band-one]
[fixture: xychart/db-x-axis-band-title]
[fixture: xychart/db-x-axis-band-title-quoted]
[fixture: xychart/db-x-axis-band-quoted]
[fixture: xychart/db-x-axis-band-quoted-spaces]
[fixture: xychart/db-x-axis-band-same-category]
[fixture: xychart/db-x-axis-band-prototype-names]
[fixture: xychart/db-x-axis-range] [fixture: xychart/db-x-axis-range-title]
[fixture: xychart/db-x-axis-range-title-quoted]
[fixture: xychart/db-x-axis-range-equal]
[fixture: xychart/db-x-axis-title-bare-word]
[fixture: xychart/db-x-axis-title-words]
[fixture: xychart/db-x-axis-title-quoted] [fixture: xychart/db-x-axis-twice]
[fixture: xychart/db-x-axis-three-times]
[fixture: xychart/db-x-axis-range-then-band]
[fixture: xychart/db-x-axis-twice-title-cleared]
[fixture: xychart/db-y-axis-no-range-no-plot] [fixture: xychart/db-y-axis-range]
[fixture: xychart/db-y-axis-range-negative-decimal]
[fixture: xychart/db-y-axis-range-reversed]
[fixture: xychart/db-y-axis-range-title]
[fixture: xychart/db-y-axis-title-bare-word]
[fixture: xychart/db-y-axis-title-only-then-range]
[fixture: xychart/db-y-axis-title-quoted] [fixture: xychart/db-y-axis-twice]
[fixture: xychart/db-y-axis-upper-case-keyword]
[fixture: xychart/db-y-axis-before-plot] [fixture: xychart/db-y-axis-after-plot]
[fixture: xychart/db-empty-string-as-x-axis-title-before-band]
[fixture: xychart/db-empty-string-as-x-axis-title-before-range]
[fixture: xychart/db-empty-string-as-y-axis-title]
[fixture: xychart/gram-x-axis-empty] [fixture: xychart/gram-y-axis-empty]
[fixture: xychart/gram-grid-empty-x-title-bare]
[fixture: xychart/gram-grid-empty-x-title-quoted]
[fixture: xychart/gram-grid-empty-y-title-bare]
[fixture: xychart/gram-grid-empty-y-title-quoted]
[fixture: xychart/gram-x-axis-band-empty]
[fixture: xychart/gram-x-axis-band-spaces-only]
[fixture: xychart/gram-grid-empty-category-bare]
[fixture: xychart/gram-grid-empty-category-quoted]
[fixture: xychart/gram-x-axis-band-empty-string]
[fixture: xychart/gram-x-axis-band-trailing-comma]
[fixture: xychart/gram-x-axis-band-twice]
[fixture: xychart/gram-x-axis-range-no-end]
[fixture: xychart/gram-x-axis-range-no-start]
[fixture: xychart/gram-x-axis-range-one-number]
[fixture: xychart/gram-x-axis-range-third]
[fixture: xychart/gram-x-axis-range-text] [fixture: xychart/gram-y-axis-band]
[fixture: xychart/gram-y-axis-one-number] [fixture: xychart/gram-y-axis-third]
[fixture: xychart/gram-x-axis-band-after-string-title]
[fixture: xychart/gram-x-axis-band-quoted-then-word]
[fixture: xychart/spec-xychart-jison-1125531c]
[fixture: xychart/spec-xychart-jison-160181bb]
[fixture: xychart/spec-xychart-jison-1baf4156]
[fixture: xychart/spec-xychart-jison-26a57e49]
[fixture: xychart/spec-xychart-jison-282ab4b5]
[fixture: xychart/spec-xychart-jison-37c05bb9]
[fixture: xychart/spec-xychart-jison-45e9e2ce]
[fixture: xychart/spec-xychart-jison-465e04ec]
[fixture: xychart/spec-xychart-jison-4e1f7c24]
[fixture: xychart/spec-xychart-jison-5b9945db]
[fixture: xychart/spec-xychart-jison-62128235]
[fixture: xychart/spec-xychart-jison-6bd37a9c]
[fixture: xychart/spec-xychart-jison-71181da9]
[fixture: xychart/spec-xychart-jison-9c6c9e75]
[fixture: xychart/spec-xychart-jison-b38b6043]
[fixture: xychart/spec-xychart-jison-d1310050]
[fixture: xychart/spec-xychart-jison-d931b39e]
[fixture: xychart/spec-xychart-jison-d997b01c]
[fixture: xychart/spec-xychart-jison-e05fd96d]
[fixture: xychart/spec-xychart-jison-efa16dec]
[fixture: xychart/spec-xychart-jison-f5965f5c]

### プロット

```text
plot-statement = ( "line" | "bar" ) plot-title? "[" value ( "," value )* "]"
plot-title     = words | string
value          = number string?
```

プロットの文は、`line` か `bar`、タイトルかタイトルなし、
コンマで区切って角括弧に入れた 1 つ以上の値です。
タイトルは語か 1 つの文字列で、両方ではなく、文字列は空でもかまいません。
値の後には、空白を挟んでも挟まなくても、文字列のラベルを置けます。
line でも bar でも同じです。
空の角括弧、最初の値の前、最後の値の後、別のコンマの後のコンマ、
コンマのない 2 つの値、角括弧のない値、引用符なしのラベル、値の前のラベル、
2 つのラベル、コンマなしでラベルの後に続く値は拒否されます。
2 つのプロットは同じタイトルを持てます。
[fixture: xychart/db-line-title-bare] [fixture: xychart/db-line-title-quoted]
[fixture: xychart/db-line-title-words] [fixture: xychart/db-bar-title-bare]
[fixture: xychart/db-bar-title-quoted] [fixture: xychart/db-plot-bar-then-line]
[fixture: xychart/db-plot-same-title-twice]
[fixture: xychart/db-plot-title-keyword-like]
[fixture: xychart/db-plot-title-trimmed]
[fixture: xychart/db-plot-title-quoted-special]
[fixture: xychart/db-grid-empty-plot-title-quoted]
[fixture: xychart/db-grid-empty-plot-title-bare]
[fixture: xychart/gram-plot-title-bare-then-quoted]
[fixture: xychart/db-label-all] [fixture: xychart/db-label-one]
[fixture: xychart/db-label-last] [fixture: xychart/db-label-no-space]
[fixture: xychart/db-label-glued-then-comma]
[fixture: xychart/db-label-beyond-categories] [fixture: xychart/db-label-on-bar]
[fixture: xychart/db-label-spaces-trimmed] [fixture: xychart/db-label-special]
[fixture: xychart/db-label-empty-string] [fixture: xychart/gram-label-bare]
[fixture: xychart/gram-label-before-value] [fixture: xychart/gram-label-twice]
[fixture: xychart/gram-label-unclosed] [fixture: xychart/gram-label-then-number]
[fixture: xychart/gram-plot-values-empty]
[fixture: xychart/gram-plot-values-double-comma]
[fixture: xychart/gram-plot-values-leading-comma]
[fixture: xychart/gram-plot-values-trailing-comma]
[fixture: xychart/gram-plot-values-missing-comma]
[fixture: xychart/gram-plot-values-no-brackets]
[fixture: xychart/gram-empty-string-as-last-value]
[fixture: xychart/spec-xychart-jison-3a65c313]
[fixture: xychart/spec-xychart-jison-494643b5]
[fixture: xychart/spec-xychart-jison-4922e556]
[fixture: xychart/spec-xychart-jison-4e8ed272]
[fixture: xychart/spec-xychart-jison-5111f0ab]
[fixture: xychart/spec-xychart-jison-5c3b8a48]
[fixture: xychart/spec-xychart-jison-5c9782dd]
[fixture: xychart/spec-xychart-jison-5d0c6f40]
[fixture: xychart/spec-xychart-jison-727d9a15]
[fixture: xychart/spec-xychart-jison-7d74bd3b]
[fixture: xychart/spec-xychart-jison-930c33d9]
[fixture: xychart/spec-xychart-jison-b2b889fc]
[fixture: xychart/spec-xychart-jison-d8f241fd]
[fixture: xychart/spec-xychart-jison-e0c06628]
[fixture: xychart/spec-xychart-jison-e37b0a2b]
[fixture: xychart/spec-xychart-jison-e3a04bdb]
[fixture: xychart/spec-xychart-jison-ed62ba96]
[fixture: xychart/spec-xychart-jison-f6e72740]
[fixture: xychart/spec-xychart-jison-f74af3f4]
[fixture: xychart/spec-xychart-jison-f7805467]

### アクセシビリティの文

```text
acc-title-statement         = "accTitle" ":" acc-title-text
acc-description-statement   = "accDescr" ":" acc-description-text
description-block-statement = "accDescr" "{" description-block-text ( "}" | end-of-text )
```

アクセシビリティのタイトルと説明は、
その単位のテキストから両端の空白を除いたものです。
同じ種類の後の文も、最初のものと同じ文です。
行の説明とブロックは、どちらも説明です。
[fixture: xychart/db-acc-title-twice]
[fixture: xychart/db-acc-title-three-times]
[fixture: xychart/db-acc-title-then-empty-line]
[fixture: xychart/db-acc-descr-block-then-line]
[fixture: xychart/db-acc-descr-line-then-block]
[fixture: xychart/db-acc-descr-block-then-empty-line]
[fixture: xychart/db-acc-descr-line-then-empty-line]
[fixture: xychart/spec-xychart-jison-d54713b7]
[fixture: xychart/spec-xychart-jison-440633f5]
[fixture: xychart/spec-xychart-jison-b2031c12]

### 空の説明ブロック

テキストが空か空白だけの説明ブロックの文は**空の説明ブロック**です。
`accDescr {}`、`accDescr { }`、改行文字だけのブロックです。
mermaid.js は、閉じたものには、どこにあってもトークンを読みません。
閉じたものは、文が始まるところでは文です。
それだけの行と、`title T accDescr {}` のように、その行のほかの文の前後です。
ほかのところでは文法はそれをどこにも取らず、入力は拒否されます。
タイトルの語の中、軸やプロットのキーワードの後、
分類、値、範囲の中、ヘッダーと向きの間です。
mermaid.js は、そのような入力を、ブロックがないものとして受理します。
これは既知の差異
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)
です。
ヘッダーの前の空の説明ブロックは図のテキストの一部ではなく、
どの検出器も読みません。
[fixture: xychart/db-acc-descr-empty-block-alone]
[fixture: xychart/db-acc-descr-block-empty]
[fixture: xychart/db-acc-descr-empty-block-spaces-then-plot]
[fixture: xychart/db-acc-descr-empty-block-line-feed-inside]
[fixture: xychart/db-acc-descr-empty-block-before-plot]
[fixture: xychart/db-acc-descr-empty-block-after-title-same-line]
[fixture: xychart/db-acc-descr-empty-block-before-title-same-line]
[fixture: xychart/db-acc-descr-block-then-empty-block]
[fixture: xychart/db-acc-descr-line-then-empty-braces]
[fixture: xychart/db-acc-descr-line-then-empty-block]
[fixture: xychart/db-acc-descr-line-then-spaces-block]
[fixture: xychart/gram-acc-descr-empty-block-before-header]
[fixture: xychart/div-empty-description-block-inside-title-text]
[fixture: xychart/div-empty-description-block-inside-axis]
[fixture: xychart/div-empty-description-block-inside-plot]
[fixture: xychart/div-empty-description-block-inside-values]
[fixture: xychart/div-empty-description-block-in-categories]
[fixture: xychart/div-empty-description-block-in-range]
[fixture: xychart/div-empty-description-block-before-orientation]

閉じていない空の説明ブロックはテキストの終わりまで続き、
mermaid.js はそれに空のテキストのトークンを読むので、
トークンのない形ではありません。
`title T accDescr {` がテキストの終わりにあるときのように、
mermaid.js と同じく、文が始まるところでだけ受理されます。
[fixture: xychart/db-acc-descr-unclosed-empty-block-after-line]
[fixture: xychart/db-acc-descr-unclosed-empty-block-spaces]
[fixture: xychart/db-acc-descr-unclosed-empty-block-line-feeds]
[fixture: xychart/db-acc-descr-unclosed-empty-block-after-title-same-line]
[fixture: xychart/gram-acc-descr-unclosed-empty-block-in-values]
[fixture: xychart/gram-x-axis-unclosed-empty-block]

### 空の文字列

空の文字列 `""` は、空のテキストの `string` の単位です。
mermaid.js は、どこにあってもそれにトークンを読みません。
文法は、それをプロットのタイトル全体、データが続く軸のタイトル全体、
値のラベル全体として取り、そこでは空の値の文字列です。
`line "" [1]`、`x-axis "" [a]`、`y-axis "" 1 --> 2`、
`line [1 ""]` は受理されます。
図のタイトルと分類は空にならないので、それらにはなりません。
`title ""` と `x-axis ["", b]` は mermaid.js と同じく拒否され、
`title "" ""` とデータのない `x-axis "" ""` も同じです。
ほかのところでは文法はそれをどこにも取らず、入力は拒否されます。
mermaid.js は、文字列がないものとして受理します。
それだけの行、文の前後、タイトル、軸、プロットの語や文字列の前後、
データが続く軸のタイトルやプロットのタイトルとしての 2 つの空の文字列、
分類の前後、値の前、
ラベルの前後、
ヘッダーと向きの間です。
これは既知の差異
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)
です。
[fixture: xychart/db-grid-empty-plot-title-quoted]
[fixture: xychart/db-empty-string-as-x-axis-title-before-band]
[fixture: xychart/db-empty-string-as-x-axis-title-before-range]
[fixture: xychart/db-empty-string-as-y-axis-title]
[fixture: xychart/db-label-empty-string]
[fixture: xychart/gram-title-empty-string]
[fixture: xychart/gram-grid-empty-category-quoted]
[fixture: xychart/div-empty-string-line]
[fixture: xychart/div-empty-string-before-statement]
[fixture: xychart/div-empty-string-after-title]
[fixture: xychart/div-empty-string-before-title-word]
[fixture: xychart/div-empty-string-after-quoted-title]
[fixture: xychart/div-empty-string-before-axis-title]
[fixture: xychart/div-empty-string-after-axis-title]
[fixture: xychart/div-empty-string-before-plot-title]
[fixture: xychart/div-empty-string-after-plot-title]
[fixture: xychart/div-empty-string-twice-as-plot-title]
[fixture: xychart/div-empty-string-twice-as-x-axis-title]
[fixture: xychart/div-empty-string-twice-as-y-axis-title]
[fixture: xychart/gram-title-two-empty-strings]
[fixture: xychart/gram-x-axis-two-empty-strings-only]
[fixture: xychart/div-empty-string-before-category]
[fixture: xychart/div-empty-string-after-category]
[fixture: xychart/div-empty-string-before-value]
[fixture: xychart/div-empty-string-before-label]
[fixture: xychart/div-empty-string-after-label]
[fixture: xychart/div-empty-string-before-orientation]

### 文法の外の拒否

ありません。
mermaid.js の Db は、テキストを読む間、
その文法が受理するどの入力でも例外を投げません。
その関数はテキストと数を保持するだけで、
空のチャート、プロットのない軸、軸のないプロットは受理されます。
[fixture: xychart/db-header-beta-only]
[fixture: xychart/db-y-axis-no-range-no-plot] [fixture: xychart/db-line-values]

## 既知の差異

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  キーワード、数、矢印の中のディレクティブは、ここでは入力を拒否させ、
  mermaid.js は前後をつなぎます
  （[単位の中のディレクティブ](#単位の中のディレクティブ) を参照）。
  [fixture: xychart/div-directive-in-keyword]
  [fixture: xychart/div-directive-in-axis-keyword]
  [fixture: xychart/div-directive-in-range-number]
  [fixture: xychart/db-plot-directive-in-number]
  [fixture: xychart/db-directive-in-arrow]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
  `"style:#a"` を持つ行のように `style` 行の行の規則が当たる行で、
  値やキーワードの中の無視される `;` は、ここでは入力を拒否させ、
  mermaid.js は前後をつなぎます。
  `line "style:#a" [1;2]` は mermaid.js では値 12 を持ち、
  `li;ne` はキーワード `line` です。
  [fixture: xychart/div-ignored-semicolon-in-value]
  [fixture: xychart/div-ignored-semicolon-in-keyword]
- **[`comment-takes-character`](../known-divergences/comment-takes-character.ja.md)。**
  1 文字の単位にくっついた `%%` は、mermaid.js ではその文字を取ります
  （[コメント](#コメント) を参照）。
  [fixture: xychart/div-comment-glued-after-title-word]
  [fixture: xychart/div-comment-glued-after-axis-title]
  [fixture: xychart/div-comment-glued-after-bracket]
  [fixture: xychart/div-comment-glued-after-categories]
  [fixture: xychart/div-comment-glued-after-label]
  [fixture: xychart/div-comment-glued-after-range]
  [fixture: xychart/div-comment-takes-one-letter-word]
  [fixture: xychart/div-comment-takes-hyphen]
- **[`title-digit-after-axis-statement`](../known-divergences/title-digit-after-axis-statement.ja.md)。**
  その行かそれより後の行で軸の文に続く、数字を持つ引用符なしのタイトルは、
  mermaid.js では拒否されます（[軸の文脈](#軸の文脈) を参照）。
  [fixture: xychart/div-title-digit-after-axis-semicolon]
  [fixture: xychart/div-title-digit-next-line-after-axis-and-plot]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)。**
  文法が取らないところの空の文字列と空の説明ブロックは、ここでは拒否され、
  mermaid.js はそれらがないものとして受理します
  （[空の説明ブロック](#空の説明ブロック) と
  [空の文字列](#空の文字列) を参照）。
  [fixture: xychart/div-empty-string-line]
  [fixture: xychart/div-empty-string-before-title-word]
  [fixture: xychart/div-empty-description-block-inside-title-text]
  [fixture: xychart/div-empty-description-block-in-categories]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)。**
  ヘッダーの後のどこかの、文字列やアクセシビリティのテキストの中の
  `C4Container`、`C4Component`、`C4Dynamic`、`C4Deployment` は、
  mermaid.js にテキストを C4 のパーサーへ渡させ、パーサーはそれを拒否します。
  ここではテキストは XY chart です。
  [fixture: xychart/div-c4-keyword-in-title]
  [fixture: xychart/div-c4-keyword-in-acc-title]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
  フロントマターに `title: <a` があると、`accTitle: b="c">d` は
  mermaid.js ではアクセシビリティのタイトル `b='c'>d` を持ちます。
  ここではフロントマターでタグを探さないので、引用符はそのままです。
  [fixture: xychart/div-html-tag-starts-in-frontmatter-acc-title]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)。
  **
  正しい YAML でないフロントマターは、この仕様では受理され、
  mermaid.js では拒否されます。
  [fixture: xychart/div-frontmatter-invalid-yaml]

既知の差異
[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.ja.md)、
[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.ja.md)、
[`percent-brace-after-unit`](../known-divergences/percent-brace-after-unit.ja.md)
は、この図種には当たりません。
mermaid.js は、ヘッダーの前の `%%` だけの行をコメント行として読み、
そのコメントの規則はコメントの後の改行文字を残し、
ディレクティブを始めない `%%{` をコメントとして読みます。
[fixture: xychart/header-after-bare-percent-line]
[fixture: xychart/db-comment-after-statement]
[fixture: xychart/db-directive-unclosed-after-plot]
