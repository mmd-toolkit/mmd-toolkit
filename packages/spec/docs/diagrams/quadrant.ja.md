# Quadrant chart

英語版: [quadrant.md](./quadrant.md)

mermaid.js の正となるソース：

- [`quadrant.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison)
- [`quadrantDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts)
- [`quadrant-chart/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart)
  の中のテスト（`*.spec.ts`）

この文書は図種 `quadrantChart` を扱います。
木のノードは [ast/quadrant.ja.md](../ast/quadrant.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の項目 22 がこの文法を選びます。
テキストが、空白の後、
ちょうどこの大文字小文字の `quadrantChart` で始まるときです（mermaid.js の
[`quadrantDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDetector.ts#L9-L11)）。
`QUADRANTCHART`、`quadrantchart`、 `QuadrantChart` はどの検出器にも合いません。
[fixture: quadrant/header-upper-case] [fixture: quadrant/header-lower-case]
[fixture: quadrant/header-capitalized]

字句解析器は次にヘッダーを読みます。
キーワード `quadrantChart` で、前後のスペースを含み、
大文字小文字を区別せずに比べ、
後に何が来てもかまいません（[文の文脈](#文の文脈) を参照）。
2 つ目のヘッダーは、それだけの行にあっても、
最初のヘッダーの行にあっても拒否され、
単位が始まるどこにある語 `quadrantChart` も同じです。
`A quadrantChart: [0.3, 0.6]` は拒否され、
`"quadrantChart": [0.3, 0.6]` は点です。
ヘッダーだけのテキストも受理されます。
[fixture: quadrant/spec-quadrant-jison-fe2d2340]
[fixture: quadrant/header-word-suffix]
[fixture: quadrant/header-spaced-word-suffix]
[fixture: quadrant/header-dash-suffix]
[fixture: quadrant/header-non-ascii-suffix]
[fixture: quadrant/header-digit-suffix] [fixture: quadrant/header-title-glued]
[fixture: quadrant/header-twice] [fixture: quadrant/header-twice-indented]
[fixture: quadrant/header-twice-same-line]
[fixture: quadrant/db-keyword-header-in-word]
[fixture: quadrant/db-name-quoted-header-word]
[fixture: quadrant/gram-keyword-header-in-quadrant-text]
[fixture: quadrant/gram-name-header-word]
[fixture: quadrant/gram-name-header-word-after-word]
[fixture: quadrant/header-bom-after]
[fixture: quadrant/header-bom-after-statement]
[fixture: quadrant/header-underscore-suffix]

ヘッダーの前の空白、空行、コメント行、`%%` だけの行、ディレクティブの行、
`%%{ }%%` の行、
フロントマターは何も変えません（[先頭の空白](../common.ja.md#先頭の空白)
を参照）。
ヘッダーの前の `#` か `;` で始まる行、文、コメント行だけのテキストは、
どの図種としても検出されません。 [fixture: quadrant/header-indented]
[fixture: quadrant/header-tab-indented]
[fixture: quadrant/header-after-bare-percent-line]
[fixture: quadrant/header-after-blank-lines]
[fixture: quadrant/header-after-comment-line]
[fixture: quadrant/header-after-directive-line]
[fixture: quadrant/header-after-empty-braces-line]
[fixture: quadrant/header-after-frontmatter]
[fixture: quadrant/header-after-frontmatter-and-comment]
[fixture: quadrant/header-after-hash-line]
[fixture: quadrant/header-after-semicolon-line]
[fixture: quadrant/header-after-whitespace-line]
[fixture: quadrant/header-bom-before] [fixture: quadrant/header-nbsp-before]
[fixture: quadrant/header-ideographic-space-before]
[fixture: quadrant/header-ls-before]
[fixture: quadrant/header-leading-semicolon]
[fixture: quadrant/header-only-comment]
[fixture: quadrant/header-statement-first]

ヘッダーの行では、最初の文がヘッダーに続けられます。
スペースの後でも、タブの後でも、何も挟まなくてもかまいません。
`;`、コメント、ディレクティブも同じです。
`quadrantChart title T`、`quadrantChart;title T`、
`quadrantChartA: [0.3, 0.6]` は受理されます。
その後の、文を始めないテキストは入力を拒否させます。
ヘッダーにくっついた語、ダッシュと語、数字、ASCII 外の文字と、その後の U+00A0、
U+2028、U+2029、U+0085 がそうです。
一方、その後の垂直タブと改ページは空白です。
[fixture: quadrant/header-comment-on-header-line]
[fixture: quadrant/header-comment-glued]
[fixture: quadrant/header-directive-glued]
[fixture: quadrant/header-bare-percent-line-after-header]
[fixture: quadrant/header-statement-on-header-line]
[fixture: quadrant/header-statement-on-header-line-tab]
[fixture: quadrant/header-semicolon] [fixture: quadrant/header-semicolon-spaced]
[fixture: quadrant/header-semicolon-statement]
[fixture: quadrant/header-trailing-nbsp]
[fixture: quadrant/header-trailing-spaces]
[fixture: quadrant/header-trailing-tab] [fixture: quadrant/header-crlf]
[fixture: quadrant/header-cr] [fixture: quadrant/header-ls-after]
[fixture: quadrant/header-ps-after] [fixture: quadrant/header-vt-after]
[fixture: quadrant/header-ff-after] [fixture: quadrant/header-nel-after]
[fixture: quadrant/header-glued-point]

## 字句構造

### 単位と文脈

字句解析器は図のテキストを**単位**に分けます。
文法は単位の上で書かれます。
各単位は、文法が使う名前と、**テキスト**を持ちます。
テキストは、その単位が読んだ文字を変換した形にしたものです。

字句解析器は**文脈**のスタックを持ち、文の文脈から始めます。
規則は文脈に入ること（スタックの一番上に積む）と、
今の文脈を出ること（その下の文脈に戻る）ができます。
各位置で、字句解析器はその位置で合う今の文脈の最初の規則を当てます。
今の文脈のどの規則も合わないとき、入力は拒否されます。
以下の一覧ではこれを繰り返しません。

テキストは、文の文脈とタイトルの文脈で終わってかまいません。
文字列、markdown 文字列、説明ブロック、点、クラス名の文脈では終われず、
`accTitle:` か `accDescr:` の後に空白しかないままでも終われません。
`x-axis "L`、``quadrant-1 "`a``、`accDescr {` と行 `D`、`A: [0.3,`、`A:::c1`、
`accTitle:` がテキストの終わりにあると拒否されます。
一方、テキストの終わりの `title` と `x-axis L -->` は、
テキストのないタイトルと、矢印を持つ軸の文です。
[fixture: quadrant/db-unclosed-axis-arrow-at-end]
[fixture: quadrant/db-unclosed-directive-at-end]
[fixture: quadrant/db-unclosed-title-keyword-at-end]
[fixture: quadrant/gram-unclosed-acc-block-after-text]
[fixture: quadrant/gram-unclosed-acc-descr-at-end]
[fixture: quadrant/gram-unclosed-acc-title-at-end]
[fixture: quadrant/gram-unclosed-axis-quote-at-end]
[fixture: quadrant/gram-unclosed-class-marker-at-end]
[fixture: quadrant/gram-unclosed-class-name-at-end]
[fixture: quadrant/gram-unclosed-classdef-at-end]
[fixture: quadrant/gram-unclosed-markdown-at-end]
[fixture: quadrant/gram-unclosed-name-quote-at-end]
[fixture: quadrant/gram-unclosed-point-after-comma-at-end]
[fixture: quadrant/gram-unclosed-quadrant-quote-at-end]
[fixture: quadrant/gram-acc-title-spaces-at-end]

**空白。**
この図種では、単位の間の空白は、下に挙げるところを除き、スペース、タブ、
垂直タブ、改ページです。
文法がそれを数えるところでは、
これらの文字のそれぞれが `space` の単位です（[文の文脈](#文の文脈) を参照）。
[表記](../common.ja.md#表記) のほかの空白文字、 U+00A0、U+2028、U+2029、U+3000、
U+FEFF は ASCII 外の文字で、語の文字です。
テキスト、名前、タイトル、アクセシビリティのテキストの中に立ち、
テキストと名前では端にも立って、端のものは Db が取り除きます。
一方、タイトル、アクセシビリティのテキスト、説明ブロックのテキストは、
ほかの空白とともに端のものを除きます。
[fixture: quadrant/db-ends-title-nbsp-end]
[fixture: quadrant/db-ends-acc-title-nbsp-end]
[fixture: quadrant/db-acc-descr-block-nbsp-before-brace-close]
[ast/quadrant.ja.md](../ast/quadrant.ja.md#quadrantliteral) を参照してください。
文が始まるところではテキストを始めるので、
`x-axis` や `title` の前の U+00A0 は入力を拒否させ、
点の名前の前の U+00A0 は名前の一部です。
規則が空白の並びを読むところ、
つまり `accTitle` か `accDescr` とその `:` か `{` の間、その `:` か `{` の後、
点の文脈（点を始める `:` と `[` のまわりと角括弧の中）では、空白は、
改行も含めて、
[表記](../common.ja.md#表記)
のすべての空白文字です（[アクセシビリティの値](#アクセシビリティの値) と、
[点の文脈](#点の文脈) を参照）。
それ以外、つまり `space` の単位、キーワードと矢印のまわり、点の `]` の後では、
スペース、タブ、垂直タブ、改ページで、 `]` の後ではスペースだけがその一部です。
[fixture: quadrant/db-point-nbsp-before-colon]
[fixture: quadrant/db-point-nbsp-inside-brackets]
[fixture: quadrant/gram-ends-point-nbsp-end]
スペースとタブだけの行はどこにあってもかまいません。
一方、U+00A0、U+3000、U+FEFF、U+2028 の行は文を始めないテキストで、
拒否されます。 [fixture: quadrant/db-grid-tab-acc-descr]
[fixture: quadrant/db-grid-tab-acc-descr-block]
[fixture: quadrant/db-grid-tab-acc-title]
[fixture: quadrant/db-grid-tab-point-bare]
[fixture: quadrant/db-grid-tab-point-quoted]
[fixture: quadrant/db-grid-tab-quadrant-bare]
[fixture: quadrant/db-grid-tab-quadrant-quoted]
[fixture: quadrant/db-grid-tab-title]
[fixture: quadrant/db-grid-tab-x-axis-bare]
[fixture: quadrant/db-grid-tab-x-axis-quoted]
[fixture: quadrant/db-grid-tab-x-axis-right-bare]
[fixture: quadrant/db-grid-tab-x-axis-right-quoted]
[fixture: quadrant/db-grid-tab-y-axis-bare]
[fixture: quadrant/db-grid-tab-y-axis-quoted]
[fixture: quadrant/db-grid-tab-y-axis-top-bare]
[fixture: quadrant/db-grid-tab-y-axis-top-quoted]
[fixture: quadrant/gram-grid-tab-class-name]
[fixture: quadrant/gram-grid-tab-classdef-name]
[fixture: quadrant/db-grid-bom-acc-descr]
[fixture: quadrant/db-grid-bom-acc-descr-block]
[fixture: quadrant/db-grid-bom-acc-title]
[fixture: quadrant/db-grid-bom-classdef-name]
[fixture: quadrant/db-grid-bom-point-bare]
[fixture: quadrant/db-grid-bom-point-quoted]
[fixture: quadrant/db-grid-bom-quadrant-bare]
[fixture: quadrant/db-grid-bom-quadrant-quoted]
[fixture: quadrant/db-grid-bom-title]
[fixture: quadrant/db-grid-bom-x-axis-bare]
[fixture: quadrant/db-grid-bom-x-axis-quoted]
[fixture: quadrant/db-grid-bom-x-axis-right-bare]
[fixture: quadrant/db-grid-bom-x-axis-right-quoted]
[fixture: quadrant/db-grid-bom-y-axis-bare]
[fixture: quadrant/db-grid-bom-y-axis-quoted]
[fixture: quadrant/db-grid-bom-y-axis-top-bare]
[fixture: quadrant/db-grid-bom-y-axis-top-quoted]
[fixture: quadrant/gram-grid-bom-class-name]
[fixture: quadrant/db-grid-nbsp-acc-descr]
[fixture: quadrant/db-grid-nbsp-acc-descr-block]
[fixture: quadrant/db-grid-nbsp-acc-title]
[fixture: quadrant/db-grid-nbsp-classdef-name]
[fixture: quadrant/db-grid-nbsp-point-bare]
[fixture: quadrant/db-grid-nbsp-point-quoted]
[fixture: quadrant/db-grid-nbsp-quadrant-bare]
[fixture: quadrant/db-grid-nbsp-quadrant-quoted]
[fixture: quadrant/db-grid-nbsp-title]
[fixture: quadrant/db-grid-nbsp-x-axis-bare]
[fixture: quadrant/db-grid-nbsp-x-axis-quoted]
[fixture: quadrant/db-grid-nbsp-x-axis-right-bare]
[fixture: quadrant/db-grid-nbsp-x-axis-right-quoted]
[fixture: quadrant/db-grid-nbsp-y-axis-bare]
[fixture: quadrant/db-grid-nbsp-y-axis-quoted]
[fixture: quadrant/db-grid-nbsp-y-axis-top-bare]
[fixture: quadrant/db-grid-nbsp-y-axis-top-quoted]
[fixture: quadrant/gram-grid-nbsp-class-name]
[fixture: quadrant/db-grid-ideographic-acc-descr]
[fixture: quadrant/db-grid-ideographic-acc-descr-block]
[fixture: quadrant/db-grid-ideographic-acc-title]
[fixture: quadrant/db-grid-ideographic-classdef-name]
[fixture: quadrant/db-grid-ideographic-point-bare]
[fixture: quadrant/db-grid-ideographic-point-quoted]
[fixture: quadrant/db-grid-ideographic-quadrant-bare]
[fixture: quadrant/db-grid-ideographic-quadrant-quoted]
[fixture: quadrant/db-grid-ideographic-title]
[fixture: quadrant/db-grid-ideographic-x-axis-bare]
[fixture: quadrant/db-grid-ideographic-x-axis-quoted]
[fixture: quadrant/db-grid-ideographic-x-axis-right-bare]
[fixture: quadrant/db-grid-ideographic-x-axis-right-quoted]
[fixture: quadrant/db-grid-ideographic-y-axis-bare]
[fixture: quadrant/db-grid-ideographic-y-axis-quoted]
[fixture: quadrant/db-grid-ideographic-y-axis-top-bare]
[fixture: quadrant/db-grid-ideographic-y-axis-top-quoted]
[fixture: quadrant/gram-grid-ideographic-class-name]
[fixture: quadrant/db-grid-ls-acc-descr]
[fixture: quadrant/db-grid-ls-acc-descr-block]
[fixture: quadrant/db-grid-ls-acc-title]
[fixture: quadrant/db-grid-ls-classdef-name]
[fixture: quadrant/db-grid-ls-point-bare]
[fixture: quadrant/db-grid-ls-point-quoted]
[fixture: quadrant/db-grid-ls-quadrant-bare]
[fixture: quadrant/db-grid-ls-quadrant-quoted]
[fixture: quadrant/db-grid-ls-title] [fixture: quadrant/db-grid-ls-x-axis-bare]
[fixture: quadrant/db-grid-ls-x-axis-quoted]
[fixture: quadrant/db-grid-ls-x-axis-right-bare]
[fixture: quadrant/db-grid-ls-x-axis-right-quoted]
[fixture: quadrant/db-grid-ls-y-axis-bare]
[fixture: quadrant/db-grid-ls-y-axis-quoted]
[fixture: quadrant/db-grid-ls-y-axis-top-bare]
[fixture: quadrant/db-grid-ls-y-axis-top-quoted]
[fixture: quadrant/gram-grid-ls-class-name]
[fixture: quadrant/db-grid-ps-acc-descr]
[fixture: quadrant/db-grid-ps-acc-descr-block]
[fixture: quadrant/db-grid-ps-acc-title]
[fixture: quadrant/db-grid-ps-classdef-name]
[fixture: quadrant/db-grid-ps-point-bare]
[fixture: quadrant/db-grid-ps-point-quoted]
[fixture: quadrant/db-grid-ps-quadrant-bare]
[fixture: quadrant/db-grid-ps-quadrant-quoted]
[fixture: quadrant/db-grid-ps-title] [fixture: quadrant/db-grid-ps-x-axis-bare]
[fixture: quadrant/db-grid-ps-x-axis-quoted]
[fixture: quadrant/db-grid-ps-x-axis-right-bare]
[fixture: quadrant/db-grid-ps-x-axis-right-quoted]
[fixture: quadrant/db-grid-ps-y-axis-bare]
[fixture: quadrant/db-grid-ps-y-axis-quoted]
[fixture: quadrant/db-grid-ps-y-axis-top-bare]
[fixture: quadrant/db-grid-ps-y-axis-top-quoted]
[fixture: quadrant/gram-grid-ps-class-name]
[fixture: quadrant/db-whitespace-line-between-spaces-and-tab]
[fixture: quadrant/db-whitespace-line-between-tab]
[fixture: quadrant/db-whitespace-line-first-spaces-and-tab]
[fixture: quadrant/db-whitespace-line-first-tab]
[fixture: quadrant/db-whitespace-line-last-spaces-and-tab]
[fixture: quadrant/db-whitespace-line-last-tab]
[fixture: quadrant/gram-whitespace-line-between-bom]
[fixture: quadrant/gram-whitespace-line-between-ideographic]
[fixture: quadrant/gram-whitespace-line-between-ls]
[fixture: quadrant/gram-whitespace-line-between-nbsp]
[fixture: quadrant/gram-whitespace-line-first-bom]
[fixture: quadrant/gram-whitespace-line-first-ideographic]
[fixture: quadrant/gram-whitespace-line-first-ls]
[fixture: quadrant/gram-whitespace-line-first-nbsp]
[fixture: quadrant/gram-whitespace-line-last-bom]
[fixture: quadrant/gram-whitespace-line-last-ideographic]
[fixture: quadrant/gram-whitespace-line-last-ls]
[fixture: quadrant/gram-whitespace-line-last-nbsp]
[fixture: quadrant/db-ends-acc-descr-bom-end]
[fixture: quadrant/db-ends-acc-descr-bom-end-of-text]
[fixture: quadrant/db-ends-acc-descr-cr-end-of-text]
[fixture: quadrant/db-ends-acc-descr-crlf-end-of-text]
[fixture: quadrant/db-ends-acc-descr-ideographic-end]
[fixture: quadrant/db-ends-acc-descr-ideographic-end-of-text]
[fixture: quadrant/db-ends-acc-descr-ls-end-of-text]
[fixture: quadrant/db-ends-acc-descr-nbsp-end]
[fixture: quadrant/db-ends-acc-descr-nbsp-end-of-text]
[fixture: quadrant/db-ends-acc-descr-no-line-feed]
[fixture: quadrant/db-ends-acc-descr-ps-end-of-text]
[fixture: quadrant/db-ends-acc-descr-tab-end]
[fixture: quadrant/db-ends-acc-descr-tab-end-of-text]
[fixture: quadrant/db-ends-acc-descr-tab-start]
[fixture: quadrant/db-ends-acc-title-bom-end]
[fixture: quadrant/db-ends-acc-title-bom-end-of-text]
[fixture: quadrant/db-ends-acc-title-cr-end-of-text]
[fixture: quadrant/db-ends-acc-title-crlf-end-of-text]
[fixture: quadrant/db-ends-acc-title-ideographic-end]
[fixture: quadrant/db-ends-acc-title-ideographic-end-of-text]
[fixture: quadrant/db-ends-acc-title-ls-end-of-text]
[fixture: quadrant/db-ends-acc-title-nbsp-end]
[fixture: quadrant/db-ends-acc-title-nbsp-end-of-text]
[fixture: quadrant/db-ends-acc-title-no-line-feed]
[fixture: quadrant/db-ends-acc-title-ps-end-of-text]
[fixture: quadrant/db-ends-acc-title-tab-end]
[fixture: quadrant/db-ends-acc-title-tab-end-of-text]
[fixture: quadrant/db-ends-acc-title-tab-start]
[fixture: quadrant/db-ends-classdef-cr-end-of-text]
[fixture: quadrant/db-ends-classdef-crlf-end-of-text]
[fixture: quadrant/db-ends-classdef-no-line-feed]
[fixture: quadrant/db-ends-classdef-tab-end]
[fixture: quadrant/db-ends-classdef-tab-end-of-text]
[fixture: quadrant/db-ends-classdef-tab-start]
[fixture: quadrant/db-ends-point-bom-start]
[fixture: quadrant/db-ends-point-class-bom-start]
[fixture: quadrant/db-ends-point-class-cr-end-of-text]
[fixture: quadrant/db-ends-point-class-crlf-end-of-text]
[fixture: quadrant/db-ends-point-class-no-line-feed]
[fixture: quadrant/db-ends-point-class-tab-start]
[fixture: quadrant/db-ends-point-cr-end-of-text]
[fixture: quadrant/db-ends-point-crlf-end-of-text]
[fixture: quadrant/db-ends-point-no-line-feed]
[fixture: quadrant/db-ends-point-style-bom-start]
[fixture: quadrant/db-ends-point-style-cr-end-of-text]
[fixture: quadrant/db-ends-point-style-crlf-end-of-text]
[fixture: quadrant/db-ends-point-style-no-line-feed]
[fixture: quadrant/db-ends-point-style-tab-end]
[fixture: quadrant/db-ends-point-style-tab-end-of-text]
[fixture: quadrant/db-ends-point-style-tab-start]
[fixture: quadrant/db-ends-point-tab-start]
[fixture: quadrant/db-ends-quadrant-bom-end]
[fixture: quadrant/db-ends-quadrant-bom-end-of-text]
[fixture: quadrant/db-ends-quadrant-cr-end-of-text]
[fixture: quadrant/db-ends-quadrant-crlf-end-of-text]
[fixture: quadrant/db-ends-quadrant-ideographic-end]
[fixture: quadrant/db-ends-quadrant-ideographic-end-of-text]
[fixture: quadrant/db-ends-quadrant-ls-end-of-text]
[fixture: quadrant/db-ends-quadrant-nbsp-end]
[fixture: quadrant/db-ends-quadrant-nbsp-end-of-text]
[fixture: quadrant/db-ends-quadrant-no-line-feed]
[fixture: quadrant/db-ends-quadrant-ps-end-of-text]
[fixture: quadrant/db-ends-quadrant-tab-end]
[fixture: quadrant/db-ends-quadrant-tab-end-of-text]
[fixture: quadrant/db-ends-quadrant-tab-start]
[fixture: quadrant/db-ends-title-bom-end]
[fixture: quadrant/db-ends-title-bom-end-of-text]
[fixture: quadrant/db-ends-title-cr-end-of-text]
[fixture: quadrant/db-ends-title-crlf-end-of-text]
[fixture: quadrant/db-ends-title-ideographic-end]
[fixture: quadrant/db-ends-title-ideographic-end-of-text]
[fixture: quadrant/db-ends-title-ls-end-of-text]
[fixture: quadrant/db-ends-title-nbsp-end]
[fixture: quadrant/db-ends-title-nbsp-end-of-text]
[fixture: quadrant/db-ends-title-no-line-feed]
[fixture: quadrant/db-ends-title-ps-end-of-text]
[fixture: quadrant/db-ends-title-tab-end-of-text]
[fixture: quadrant/db-ends-x-axis-bom-end]
[fixture: quadrant/db-ends-x-axis-bom-end-of-text]
[fixture: quadrant/db-ends-x-axis-cr-end-of-text]
[fixture: quadrant/db-ends-x-axis-crlf-end-of-text]
[fixture: quadrant/db-ends-x-axis-ideographic-end]
[fixture: quadrant/db-ends-x-axis-ideographic-end-of-text]
[fixture: quadrant/db-ends-x-axis-ls-end-of-text]
[fixture: quadrant/db-ends-x-axis-nbsp-end]
[fixture: quadrant/db-ends-x-axis-nbsp-end-of-text]
[fixture: quadrant/db-ends-x-axis-no-line-feed]
[fixture: quadrant/db-ends-x-axis-ps-end-of-text]
[fixture: quadrant/db-ends-x-axis-tab-end]
[fixture: quadrant/db-ends-x-axis-tab-end-of-text]
[fixture: quadrant/db-ends-x-axis-tab-start]
[fixture: quadrant/db-ends-y-axis-bom-end]
[fixture: quadrant/db-ends-y-axis-bom-end-of-text]
[fixture: quadrant/db-ends-y-axis-cr-end-of-text]
[fixture: quadrant/db-ends-y-axis-crlf-end-of-text]
[fixture: quadrant/db-ends-y-axis-ideographic-end]
[fixture: quadrant/db-ends-y-axis-ideographic-end-of-text]
[fixture: quadrant/db-ends-y-axis-ls-end-of-text]
[fixture: quadrant/db-ends-y-axis-nbsp-end]
[fixture: quadrant/db-ends-y-axis-nbsp-end-of-text]
[fixture: quadrant/db-ends-y-axis-no-line-feed]
[fixture: quadrant/db-ends-y-axis-ps-end-of-text]
[fixture: quadrant/db-ends-y-axis-tab-end]
[fixture: quadrant/db-ends-y-axis-tab-end-of-text]
[fixture: quadrant/db-ends-y-axis-tab-start]
[fixture: quadrant/gram-ends-acc-descr-bom-start]
[fixture: quadrant/gram-ends-acc-title-bom-start]
[fixture: quadrant/gram-ends-classdef-bom-end]
[fixture: quadrant/gram-ends-classdef-bom-end-of-text]
[fixture: quadrant/gram-ends-classdef-bom-start]
[fixture: quadrant/gram-ends-classdef-ideographic-end]
[fixture: quadrant/gram-ends-classdef-ideographic-end-of-text]
[fixture: quadrant/gram-ends-classdef-ls-end-of-text]
[fixture: quadrant/gram-ends-classdef-nbsp-end]
[fixture: quadrant/gram-ends-classdef-nbsp-end-of-text]
[fixture: quadrant/gram-ends-classdef-ps-end-of-text]
[fixture: quadrant/gram-ends-point-bom-end]
[fixture: quadrant/gram-ends-point-bom-end-of-text]
[fixture: quadrant/gram-ends-point-class-bom-end]
[fixture: quadrant/gram-ends-point-class-bom-end-of-text]
[fixture: quadrant/gram-ends-point-class-ideographic-end]
[fixture: quadrant/gram-ends-point-class-ideographic-end-of-text]
[fixture: quadrant/gram-ends-point-class-ls-end-of-text]
[fixture: quadrant/gram-ends-point-class-nbsp-end]
[fixture: quadrant/gram-ends-point-class-nbsp-end-of-text]
[fixture: quadrant/gram-ends-point-class-ps-end-of-text]
[fixture: quadrant/gram-ends-point-class-tab-end]
[fixture: quadrant/gram-ends-point-class-tab-end-of-text]
[fixture: quadrant/gram-ends-point-ideographic-end]
[fixture: quadrant/gram-ends-point-ideographic-end-of-text]
[fixture: quadrant/gram-ends-point-ls-end-of-text]
[fixture: quadrant/gram-ends-point-nbsp-end]
[fixture: quadrant/gram-ends-point-nbsp-end-of-text]
[fixture: quadrant/gram-ends-point-ps-end-of-text]
[fixture: quadrant/gram-ends-point-style-bom-end]
[fixture: quadrant/gram-ends-point-style-bom-end-of-text]
[fixture: quadrant/gram-ends-point-style-ideographic-end]
[fixture: quadrant/gram-ends-point-style-ideographic-end-of-text]
[fixture: quadrant/gram-ends-point-style-ls-end-of-text]
[fixture: quadrant/gram-ends-point-style-nbsp-end]
[fixture: quadrant/gram-ends-point-style-nbsp-end-of-text]
[fixture: quadrant/gram-ends-point-style-ps-end-of-text]
[fixture: quadrant/gram-ends-point-tab-end-of-text]
[fixture: quadrant/gram-ends-quadrant-bom-start]
[fixture: quadrant/gram-ends-title-bom-start]
[fixture: quadrant/gram-ends-x-axis-bom-start]
[fixture: quadrant/gram-ends-y-axis-bom-start]
[fixture: quadrant/gram-nbsp-before-keyword]
[fixture: quadrant/gram-nbsp-before-title]
[fixture: quadrant/db-tab-before-keyword] [fixture: quadrant/db-name-after-nbsp]

**改行。**
ソースの改行は図のテキストの改行文字です。
[ソースの読み方](../common.ja.md#ソースの読み方) を参照してください。
そのため、CRLF と単独の CR は、改行文字と同じく行を終えます。
文の文脈で単位が始まるところの改行文字は `newline` の単位で、文を終えます。
テキストが次の行にあるキーワード（`x-axis` に行 `L` が続くもの）は拒否され、
矢印が次の行にある軸の文も同じです。
改行文字は、文字列、markdown 文字列、説明ブロックの中ではテキストの文字で、
点の角括弧の中、点の `:` と `,` のまわり、
`accTitle:` と `accDescr:` の `:` のまわりでは空白です。
点の `:` の前では、空白文字の後でだけ空白です。
[点の文脈](#点の文脈) で述べます。
U+2028 と U+2029 は改行ではありません。
[fixture: quadrant/gram-keyword-blank-line-classdef]
[fixture: quadrant/gram-keyword-blank-line-quadrant]
[fixture: quadrant/gram-keyword-blank-line-x-axis]
[fixture: quadrant/gram-keyword-blank-line-y-axis]
[fixture: quadrant/gram-keyword-comment-line-classdef]
[fixture: quadrant/gram-keyword-comment-line-quadrant]
[fixture: quadrant/gram-keyword-comment-line-title]
[fixture: quadrant/gram-keyword-comment-line-x-axis]
[fixture: quadrant/gram-keyword-comment-line-y-axis]
[fixture: quadrant/gram-keyword-directive-line-classdef]
[fixture: quadrant/gram-keyword-directive-line-quadrant]
[fixture: quadrant/gram-keyword-directive-line-x-axis]
[fixture: quadrant/gram-keyword-directive-line-y-axis]
[fixture: quadrant/gram-keyword-line-feed-classdef]
[fixture: quadrant/gram-keyword-line-feed-quadrant]
[fixture: quadrant/gram-keyword-line-feed-title]
[fixture: quadrant/gram-keyword-line-feed-x-axis]
[fixture: quadrant/gram-keyword-line-feed-y-axis]
[fixture: quadrant/db-grid-cr-acc-descr-block]
[fixture: quadrant/db-grid-cr-point-quoted]
[fixture: quadrant/db-grid-cr-quadrant-quoted]
[fixture: quadrant/db-grid-cr-x-axis-quoted]
[fixture: quadrant/db-grid-cr-x-axis-right-quoted]
[fixture: quadrant/db-grid-cr-y-axis-quoted]
[fixture: quadrant/db-grid-cr-y-axis-top-quoted]
[fixture: quadrant/db-grid-crlf-acc-descr-block]
[fixture: quadrant/db-grid-crlf-point-quoted]
[fixture: quadrant/db-grid-crlf-quadrant-quoted]
[fixture: quadrant/db-grid-crlf-x-axis-quoted]
[fixture: quadrant/db-grid-crlf-x-axis-right-quoted]
[fixture: quadrant/db-grid-crlf-y-axis-quoted]
[fixture: quadrant/db-grid-crlf-y-axis-top-quoted]
[fixture: quadrant/db-grid-lf-acc-descr-block]
[fixture: quadrant/db-grid-lf-point-quoted]
[fixture: quadrant/db-grid-lf-quadrant-quoted]
[fixture: quadrant/db-grid-lf-x-axis-quoted]
[fixture: quadrant/db-grid-lf-x-axis-right-quoted]
[fixture: quadrant/db-grid-lf-y-axis-quoted]
[fixture: quadrant/db-grid-lf-y-axis-top-quoted]
[fixture: quadrant/gram-grid-cr-acc-descr]
[fixture: quadrant/gram-grid-cr-acc-title]
[fixture: quadrant/gram-grid-cr-class-name]
[fixture: quadrant/gram-grid-cr-classdef-name]
[fixture: quadrant/gram-grid-cr-point-bare]
[fixture: quadrant/gram-grid-cr-quadrant-bare]
[fixture: quadrant/gram-grid-cr-title]
[fixture: quadrant/gram-grid-cr-x-axis-bare]
[fixture: quadrant/gram-grid-cr-x-axis-right-bare]
[fixture: quadrant/gram-grid-cr-y-axis-bare]
[fixture: quadrant/gram-grid-cr-y-axis-top-bare]
[fixture: quadrant/gram-grid-crlf-acc-descr]
[fixture: quadrant/gram-grid-crlf-acc-title]
[fixture: quadrant/gram-grid-crlf-class-name]
[fixture: quadrant/gram-grid-crlf-classdef-name]
[fixture: quadrant/gram-grid-crlf-point-bare]
[fixture: quadrant/gram-grid-crlf-quadrant-bare]
[fixture: quadrant/gram-grid-crlf-title]
[fixture: quadrant/gram-grid-crlf-x-axis-bare]
[fixture: quadrant/gram-grid-crlf-x-axis-right-bare]
[fixture: quadrant/gram-grid-crlf-y-axis-bare]
[fixture: quadrant/gram-grid-crlf-y-axis-top-bare]
[fixture: quadrant/gram-grid-lf-acc-descr]
[fixture: quadrant/gram-grid-lf-acc-title]
[fixture: quadrant/gram-grid-lf-class-name]
[fixture: quadrant/gram-grid-lf-classdef-name]
[fixture: quadrant/gram-grid-lf-point-bare]
[fixture: quadrant/gram-grid-lf-quadrant-bare]
[fixture: quadrant/gram-grid-lf-title]
[fixture: quadrant/gram-grid-lf-x-axis-bare]
[fixture: quadrant/gram-grid-lf-x-axis-right-bare]
[fixture: quadrant/gram-grid-lf-y-axis-bare]
[fixture: quadrant/gram-grid-lf-y-axis-top-bare]
[fixture: quadrant/gram-x-axis-line-feed-before-arrow]

**エンティティ、HTML 属性の引用符、`style` 行。**
エンティティはそのプレースホルダーとして読まれます。
[エンティティ](../common.ja.md#エンティティ) を参照してください。
プレースホルダーは ASCII 外の文字からなるので、どのテキスト、名前、タイトル、
アクセシビリティのテキストの文字でもあり、
`classDef` のクラスの名前の文字でもあります。
一方、点のクラス名とスタイルはプレースホルダーを持てません。
スタイルの `#f00;` はエンティティなので、
`A: [0.3, 0.6] color: #f00;` は拒否され、
`A: [0.3, 0.6] color: #f00 ;` は色 `#f00` を持ちます。
HTML のタグの属性の引用符は `'`
として読まれます（[HTML 属性の引用符](../common.ja.md#html-属性の引用符)
を参照）。
`style` 行と `classDef` 行の行の規則が無視する `;`
（[`style` 行と `classDef` 行](../common.ja.md#style-行と-classdef-行)
を参照）は、テキスト、タイトル、アクセシビリティのテキストから除かれます。
[fixture: quadrant/db-grid-style-acc-descr]
[fixture: quadrant/db-grid-style-acc-descr-block]
[fixture: quadrant/db-grid-style-acc-title]
[fixture: quadrant/db-grid-style-point-quoted]
[fixture: quadrant/db-grid-style-quadrant-quoted]
[fixture: quadrant/db-grid-style-title]
[fixture: quadrant/db-grid-style-x-axis-quoted]
[fixture: quadrant/db-grid-style-x-axis-right-quoted]
[fixture: quadrant/db-grid-style-y-axis-quoted]
[fixture: quadrant/db-grid-style-y-axis-top-quoted]
[fixture: quadrant/gram-grid-style-class-name]
[fixture: quadrant/gram-grid-style-point-bare]
[fixture: quadrant/gram-grid-style-quadrant-bare]
[fixture: quadrant/gram-grid-style-x-axis-bare]
[fixture: quadrant/gram-grid-style-x-axis-right-bare]
[fixture: quadrant/gram-grid-style-y-axis-bare]
[fixture: quadrant/gram-grid-style-y-axis-top-bare]
[fixture: quadrant/db-grid-entity-acc-descr]
[fixture: quadrant/db-grid-entity-acc-descr-block]
[fixture: quadrant/db-grid-entity-acc-title]
[fixture: quadrant/db-grid-entity-classdef-name]
[fixture: quadrant/db-grid-entity-point-quoted]
[fixture: quadrant/db-grid-entity-quadrant-bare]
[fixture: quadrant/db-grid-entity-quadrant-quoted]
[fixture: quadrant/db-grid-entity-x-axis-quoted]
[fixture: quadrant/db-grid-entity-x-axis-right-bare]
[fixture: quadrant/db-grid-entity-x-axis-right-quoted]
[fixture: quadrant/db-grid-entity-y-axis-quoted]
[fixture: quadrant/db-grid-entity-y-axis-top-bare]
[fixture: quadrant/db-grid-entity-y-axis-top-quoted]
[fixture: quadrant/gram-grid-entity-class-name]
[fixture: quadrant/db-title-entity] [fixture: quadrant/db-x-axis-entity]
[fixture: quadrant/db-y-axis-entity] [fixture: quadrant/db-quadrant-entity]
[fixture: quadrant/db-name-entity] [fixture: quadrant/db-grid-hash-acc-descr]
[fixture: quadrant/db-grid-hash-acc-descr-block]
[fixture: quadrant/db-grid-hash-acc-title]
[fixture: quadrant/db-grid-hash-classdef-name]
[fixture: quadrant/db-grid-hash-point-bare]
[fixture: quadrant/db-grid-hash-point-quoted]
[fixture: quadrant/db-grid-hash-quadrant-bare]
[fixture: quadrant/db-grid-hash-quadrant-quoted]
[fixture: quadrant/db-grid-hash-title]
[fixture: quadrant/db-grid-hash-x-axis-bare]
[fixture: quadrant/db-grid-hash-x-axis-quoted]
[fixture: quadrant/db-grid-hash-x-axis-right-bare]
[fixture: quadrant/db-grid-hash-x-axis-right-quoted]
[fixture: quadrant/db-grid-hash-y-axis-bare]
[fixture: quadrant/db-grid-hash-y-axis-quoted]
[fixture: quadrant/db-grid-hash-y-axis-top-bare]
[fixture: quadrant/db-grid-hash-y-axis-top-quoted]
[fixture: quadrant/gram-grid-hash-class-name]
[fixture: quadrant/db-entity-hash-in-class-name]
[fixture: quadrant/db-entity-hash-word-semicolon]
[fixture: quadrant/db-entity-html-named]
[fixture: quadrant/db-entity-html-numeric]
[fixture: quadrant/db-entity-numeric-quadrant-quoted-two]
[fixture: quadrant/db-entity-without-semicolon]
[fixture: quadrant/db-style-line-classdef-keyword-acc-title]
[fixture: quadrant/db-style-line-classdef-keyword-quadrant-quoted]
[fixture: quadrant/db-style-line-classdef-keyword-title]
[fixture: quadrant/db-style-line-hash-on-another-line-quoted]
[fixture: quadrant/db-style-line-ignored-in-point]
[fixture: quadrant/db-style-line-ignored-in-value]
[fixture: quadrant/db-style-line-keyword-on-another-line-quoted]
[fixture: quadrant/db-style-line-no-hash-acc-title]
[fixture: quadrant/db-style-line-no-hash-quadrant-quoted]
[fixture: quadrant/db-style-line-no-hash-title]
[fixture: quadrant/db-style-line-semicolon-on-another-line-quoted]
[fixture: quadrant/db-style-line-semicolon-statement-separator-in-title]
[fixture: quadrant/db-style-line-space-after-colon-acc-title]
[fixture: quadrant/db-style-line-space-after-colon-quadrant-quoted]
[fixture: quadrant/db-style-line-space-after-colon-title]
[fixture: quadrant/db-style-line-two-semicolons-acc-title]
[fixture: quadrant/db-style-line-two-semicolons-quadrant-quoted]
[fixture: quadrant/db-style-line-two-semicolons-title]
[fixture: quadrant/db-style-line-upper-case-acc-title]
[fixture: quadrant/db-style-line-upper-case-quadrant-quoted]
[fixture: quadrant/db-style-line-upper-case-title]
[fixture: quadrant/gram-style-line-ignored-between-axis-statements]
[fixture: quadrant/gram-style-line-ignored-between-statements]
[fixture: quadrant/gram-style-color-entity-semicolon]
[fixture: quadrant/db-style-color-space-semicolon]
[fixture: quadrant/db-classdef-color-space-semicolon]

### 単位の中のディレクティブ

字句解析器は、ディレクティブを持たない図のテキストを、
mermaid.js がディレクティブを除いた後のテキストを読むとおりに読みます。
そして
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則が単位に当たります。
テキストの単位や文字列の中のディレクティブは mermaid.js の読みを保ち、
ほかの単位の中のディレクティブは入力を拒否させます。
**テキストの単位**は、`word`、`title-text`、`acc-title-text`、
`acc-description-text`、`description-block-text`、`string`、 `markdown-string`、
`coordinate` です。
ただし、
`classDef` のクラスの名前の中の `word` は名前なので（[クラス](#クラス)
を参照）、テキストの単位ではありません。
ほかの単位、つまりヘッダー、キーワード、矢印、`:::`、`class-name`、 `-`、`:`、
`;`、角括弧は、テキストの単位ではありません。

- テキスト、名前、タイトル、アクセシビリティのテキスト、文字列、座標、
  スタイルの中のディレクティブは、mermaid.js と同じく、
  そのまわりの部分をつなぎます。
  `quadrant-1 a%%{init: {}}%%b` はテキスト `ab` を、
  `A: [0.%%{init: {}}%%3, 0.6]` は座標 `0.3` を持ちます。
  複数の行にわたる値の中のコメント行とディレクティブの行は、
  その行ごと除かれます。 [fixture: quadrant/db-grid-directive-acc-descr]
  [fixture: quadrant/db-grid-directive-acc-descr-block]
  [fixture: quadrant/db-grid-directive-acc-title]
  [fixture: quadrant/db-grid-directive-point-bare]
  [fixture: quadrant/db-grid-directive-point-quoted]
  [fixture: quadrant/db-grid-directive-quadrant-bare]
  [fixture: quadrant/db-grid-directive-quadrant-quoted]
  [fixture: quadrant/db-grid-directive-title]
  [fixture: quadrant/db-grid-directive-x-axis-bare]
  [fixture: quadrant/db-grid-directive-x-axis-quoted]
  [fixture: quadrant/db-grid-directive-x-axis-right-bare]
  [fixture: quadrant/db-grid-directive-x-axis-right-quoted]
  [fixture: quadrant/db-grid-directive-y-axis-bare]
  [fixture: quadrant/db-grid-directive-y-axis-quoted]
  [fixture: quadrant/db-grid-directive-y-axis-top-bare]
  [fixture: quadrant/db-grid-directive-y-axis-top-quoted]
  [fixture: quadrant/db-comment-line-inside-acc-block]
  [fixture: quadrant/db-comment-line-inside-brackets]
  [fixture: quadrant/db-comment-line-inside-markdown]
  [fixture: quadrant/db-comment-line-inside-quoted-axis]
  [fixture: quadrant/db-comment-line-inside-quoted-name]
  [fixture: quadrant/db-comment-line-inside-quoted-text]
  [fixture: quadrant/db-directive-line-inside-brackets]
  [fixture: quadrant/db-directive-inside-quoted-multiline]
  [fixture: quadrant/db-directive-inside-acc-block-line]
  [fixture: quadrant/db-comment-inline-in-quoted-block]
- 2 つの単位の間のディレクティブはかまいません。
  それだけの行、その行の文の前後、キーワードとそのテキストの間、
  `accTitle` とその `:` の間、点の `:` と `[` の間、
  `;` で分けた 2 つの文の間です。
  [fixture: quadrant/db-directive-after-statement]
  [fixture: quadrant/db-directive-before-statement-same-line]
  [fixture: quadrant/db-directive-between-statements]
  [fixture: quadrant/db-directive-config-width]
  [fixture: quadrant/db-directive-glued-to-statement]
  [fixture: quadrant/db-directive-in-acc-block]
  [fixture: quadrant/db-directive-in-header-line]
  [fixture: quadrant/db-directive-in-point-brackets]
  [fixture: quadrant/db-directive-in-quotes]
  [fixture: quadrant/db-directive-in-style-value]
  [fixture: quadrant/db-directive-line]
  [fixture: quadrant/db-directive-line-empty]
  [fixture: quadrant/db-directive-line-spaces]
  [fixture: quadrant/db-directive-multiline]
  [fixture: quadrant/db-directive-two-in-text]
  [fixture: quadrant/db-directive-unclosed]
  [fixture: quadrant/db-directive-unclosed-last-line]
  [fixture: quadrant/db-directive-wrap-statement]
  [fixture: quadrant/db-comment-line-brace-closed-wrong]
  [fixture: quadrant/db-directive-between-acc-title-and-colon]
- ヘッダー、キーワード、矢印、`:::`、`class-name`、
  `classDef` のクラスの名前の中のディレクティブは入力を拒否させます。
  mermaid.js は部分をつなぎます。
  `quadrant%%{init: {}}%%Chart`、`tit%%{init: {}}%%le T`、
  `acc%%{init: {}}%%Title: A`、`x-%%{init: {}}%%axis L`、
  `L --%%{init: {}}%%> R`、`A::%%{init: {}}%%:c1: [0.3, 0.6]`、
  `A:::c%%{init: {}}%%1: [0.3, 0.6]`、
  `classDef c%%{init: {}}%%1 color: #f00` です。
  これに当たる既知の差異は、
  [`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)
  です。 [fixture: quadrant/div-acc-title-keyword-inside-directive]
  [fixture: quadrant/div-class-directive-inside]
  [fixture: quadrant/div-directive-in-class-name]
  [fixture: quadrant/div-directive-in-keyword-classdef]
  [fixture: quadrant/div-directive-in-keyword-title]
  [fixture: quadrant/div-grid-directive-class-name]
  [fixture: quadrant/div-grid-directive-classdef-name]
  [fixture: quadrant/div-quadrant-directive-in-keyword]
  [fixture: quadrant/div-x-axis-directive-in-arrow]
  [fixture: quadrant/div-x-axis-directive-in-keyword]
  [fixture: quadrant/div-y-axis-directive-in-arrow]
  [fixture: quadrant/div-y-axis-directive-in-keyword]
  [fixture: quadrant/div-directive-in-class-marker]
  [fixture: quadrant/div-directive-inside]
- 閉じないディレクティブはテキストの終わりまで続き、
  その引数は次の行で始まることがあります。
  [ディレクティブの位置](../common.ja.md#ディレクティブの位置)
  を参照してください。
  行の終わりの `%%{init` は、次の行の頭の語を取ります。
  [fixture: quadrant/gram-directive-word-unclosed-takes-keyword]
  [fixture: quadrant/gram-directive-colon-unclosed-takes-keyword]
  [fixture: quadrant/db-directive-argument-word-unclosed]
  [fixture: quadrant/db-directive-name-only-closed]
  [fixture: quadrant/db-directive-at-start-of-axis-text]
  [fixture: quadrant/db-directive-at-start-of-classdef-styles]
  [fixture: quadrant/db-directive-at-start-of-name]
  [fixture: quadrant/db-directive-at-start-of-quadrant-text]
  [fixture: quadrant/db-directive-at-start-of-title]
  [fixture: quadrant/db-directive-glued-before-axis-text]
  [fixture: quadrant/db-directive-glued-before-quadrant-text]
  [fixture: quadrant/db-directive-glued-before-title-text]
  [fixture: quadrant/db-directive-glued-after-classdef]

### 文の文脈

文の文脈の規則を、試す順に挙げます。

1. `%%` とその行の残り: コメント（[コメント](#コメント) を参照）。
2. 1 つ以上の改行文字: `newline` の単位。
3. **キーワード**。
   大文字小文字を区別せずに比べます。
   - `title` で、後に語の文字（英字、数字、
     `_`）が続かないもの: `title` の単位で、タイトルの文脈に入ります。
   - `accTitle` か `accDescr`、改行も含む空白、
     `:`: `accTitle` か `accDescr` の単位と `:` の単位で、
     そのキーワードのアクセシビリティの文脈に入ります。
   - `accDescr`、改行も含む空白、`{`: `accDescr` の単位と `{` の単位で、
     説明ブロックの文脈に入ります。
   - `x-axis`、`y-axis`、`quadrant-1`〜`quadrant-4` で、
     前後のスペース（U+0020）を含み、
     後に何が来てもかまわないもの: そのキーワードの名前の単位。
   - 2 つ以上の `-` と `>` で、前後のスペースを含むもの: `arrow` の単位。
   - `classDef` で、後に語の文字が続かないもの: `classDef` の単位。
4. `"` と逆引用符: markdown 文字列の文脈に入ります。
   `"`: 文字列の文脈に入ります（[文字列](#文字列) を参照）。
5. `:::`: `:::` の単位で、クラス名の文脈に入ります。
6. 改行も含む空白、`:`、改行も含む空白、`[`: `:` の単位と `[` の単位で、
   点の文脈に入ります（[点の文脈](#点の文脈) を参照）。
7. 前後のスペースを含む `quadrantChart`: ヘッダー。
8. **語**: 1 つ以上の ASCII の英字、1 つ以上の ASCII 外の文字、 1 つ以上の数字、
   または `!`、`$`、`%`、`&`、`'`、`*`、`+`、`,`、 `.`、`/`、`=`、`?`、`\`、
   `_`、`#`、逆引用符のどれか 1 つ: `word` の単位。
9. `-`、`:`、`;`: その文字の単位。
10. 改行文字以外の 1 つの空白文字: `space` の単位。

単位が始まるどの位置でも、キーワードを語より先に試し、
英字の語は続く英字をすべて読みます。
そのため、キーワードは英字の並びの頭で読まれ、テキストの中の数字、`_`、`-`、
`.` の後でもそうです。
`quadrant-1 a.title`、`quadrant-1 a-title`、`quadrant-1 a1title`、
`quadrant-1 a_title`、`quadrant-1 a.x-axis`、`A.title: [0.3, 0.6]`、
`a.classDef: [0.3, 0.6]` はキーワードを持ち、拒否されます。
一方、`Titles` と `classDefs` は語で、
タイトルの中の `title a.title` はテキストです。
語の文字が続く `title` と `classDef` はキーワードではありません。
`titleT`、`title1`、`title_x`、`classDef1`、`classDef_x` は語で、
`title1: [0.3, 0.6]` と `title_x: [0.3, 0.6]` はそれを名前にします。
一方、`title-x` はタイトル `-x`、`titleé` はタイトル `é` で、
`classDef-x` と `classDefé` は後に空白のない `classDef` です。
`x-axis`、`y-axis`、`quadrant-1`〜`quadrant-4`、ヘッダーは、後に何も要りません。
`x-axisL`、`x-axis1`、`x-axis_x`、`x-axisé` はテキストを持つ x 軸で、
`quadrant-11` はテキスト `1` を持つ `quadrant-1` です。
一方、`x-axis-x` と `quadrant-1-x` は、キーワードとダッシュで始まるテキストで、
拒否されます。
ほかの大文字小文字のキーワードもキーワードです。
`TITLE`、`Title`、`X-Axis`、`Quadrant-1`、`CLASSDEF`、`ACCTITLE:`、
`ACCDESCR:` は文を始めます。
`:` か `{` のない `accTitle` と `accDescr` は語の英字で、
キーワードと `:` の間の空白以外の文字は入力を拒否させます。
`accTitlex:`、`accTitle-x:`、`accTitle1:`、 `accTitleé:` がそうです。
[fixture: quadrant/db-keyword-suffix-quadrant-digit]
[fixture: quadrant/db-keyword-suffix-quadrant-non-ascii]
[fixture: quadrant/db-keyword-suffix-quadrant-underscore]
[fixture: quadrant/db-keyword-suffix-title-dash]
[fixture: quadrant/db-keyword-suffix-title-non-ascii]
[fixture: quadrant/db-keyword-suffix-x-axis-digit]
[fixture: quadrant/db-keyword-suffix-x-axis-non-ascii]
[fixture: quadrant/db-keyword-suffix-x-axis-underscore]
[fixture: quadrant/db-keyword-suffix-y-axis-digit]
[fixture: quadrant/db-keyword-suffix-y-axis-non-ascii]
[fixture: quadrant/db-keyword-suffix-y-axis-underscore]
[fixture: quadrant/gram-keyword-suffix-acc-descr-dash]
[fixture: quadrant/gram-keyword-suffix-acc-descr-digit]
[fixture: quadrant/gram-keyword-suffix-acc-descr-non-ascii]
[fixture: quadrant/gram-keyword-suffix-acc-descr-underscore]
[fixture: quadrant/gram-keyword-suffix-acc-title-dash]
[fixture: quadrant/gram-keyword-suffix-acc-title-digit]
[fixture: quadrant/gram-keyword-suffix-acc-title-non-ascii]
[fixture: quadrant/gram-keyword-suffix-acc-title-underscore]
[fixture: quadrant/gram-keyword-suffix-classdef-dash]
[fixture: quadrant/gram-keyword-suffix-classdef-digit]
[fixture: quadrant/gram-keyword-suffix-classdef-non-ascii]
[fixture: quadrant/gram-keyword-suffix-classdef-underscore]
[fixture: quadrant/gram-keyword-suffix-quadrant-dash]
[fixture: quadrant/gram-keyword-suffix-title-digit]
[fixture: quadrant/gram-keyword-suffix-title-underscore]
[fixture: quadrant/gram-keyword-suffix-x-axis-dash]
[fixture: quadrant/gram-keyword-suffix-y-axis-dash]
[fixture: quadrant/db-keyword-after-dot-in-title]
[fixture: quadrant/gram-keyword-after-dash-in-name]
[fixture: quadrant/gram-keyword-after-dash-in-quadrant-text]
[fixture: quadrant/gram-keyword-after-digit-in-name]
[fixture: quadrant/gram-keyword-after-digit-in-quadrant-text]
[fixture: quadrant/gram-keyword-after-dot-in-name]
[fixture: quadrant/gram-keyword-after-dot-in-quadrant-text]
[fixture: quadrant/gram-keyword-after-underscore-in-name]
[fixture: quadrant/gram-keyword-after-underscore-in-quadrant-text]
[fixture: quadrant/gram-keyword-axis-after-dot-in-quadrant-text]
[fixture: quadrant/gram-keyword-classdef-after-dot-in-name]
[fixture: quadrant/db-acc-descr-upper-case]
[fixture: quadrant/db-acc-title-upper-case]
[fixture: quadrant/db-class-upper-case]
[fixture: quadrant/db-classdef-upper-case]
[fixture: quadrant/db-name-keyword-prefix]
[fixture: quadrant/db-quadrant-upper-case]
[fixture: quadrant/db-title-keyword-capitalized]
[fixture: quadrant/db-title-keyword-digit-word]
[fixture: quadrant/db-title-keyword-underscore-word]
[fixture: quadrant/db-title-keyword-upper-case]
[fixture: quadrant/db-title-prefix-of-name]
[fixture: quadrant/db-x-axis-upper-case]
[fixture: quadrant/db-y-axis-upper-case]
[fixture: quadrant/gram-acc-descr-glued-word]
[fixture: quadrant/gram-acc-title-glued-word]
[fixture: quadrant/gram-title-glued-word]

そのため、引用符なしのテキストは、語、`-`、空白からなります。
`-` で始まることはできず、`:`、`;`、角括弧、丸括弧、波括弧、`<`、`>`、`|`、
`@`、`^`、`~`、キーワードはその一部になりません。
`x-axis -L`、`x-axis L: M`、`x-axis L[M]`、`quadrant-1 a(b)`、
`quadrant-1 a|b`、`quadrant-1 a^b`、`quadrant-1 A title B`、
`quadrant-1 A quadrant-2 B` は拒否されます。
一方、`quadrant-1 a % b` と `quadrant-1 a!$'?\/b` はその文字を保ちます。
`;` は文を終えます。
象限のテキストや名前の中の矢印は矢印で、その文はそれを取らないので、
`quadrant-1 a-->b` は拒否されます。
引用符の中、タイトル、アクセシビリティのテキスト、説明ブロックの中では、
キーワードはテキストです。
`__proto__`、`constructor`、 `hasOwnProperty` はほかと同じ語です。
[fixture: quadrant/db-grid-nonascii-acc-descr]
[fixture: quadrant/db-grid-nonascii-acc-descr-block]
[fixture: quadrant/db-grid-nonascii-acc-title]
[fixture: quadrant/db-grid-nonascii-point-quoted]
[fixture: quadrant/db-grid-nonascii-quadrant-bare]
[fixture: quadrant/db-grid-nonascii-quadrant-quoted]
[fixture: quadrant/db-grid-nonascii-x-axis-bare]
[fixture: quadrant/db-grid-nonascii-x-axis-quoted]
[fixture: quadrant/db-grid-nonascii-x-axis-right-bare]
[fixture: quadrant/db-grid-nonascii-x-axis-right-quoted]
[fixture: quadrant/db-grid-nonascii-y-axis-bare]
[fixture: quadrant/db-grid-nonascii-y-axis-quoted]
[fixture: quadrant/db-grid-nonascii-y-axis-top-bare]
[fixture: quadrant/db-grid-nonascii-y-axis-top-quoted]
[fixture: quadrant/db-grid-html-acc-descr]
[fixture: quadrant/db-grid-html-acc-descr-block]
[fixture: quadrant/db-grid-html-acc-title]
[fixture: quadrant/db-grid-html-point-quoted]
[fixture: quadrant/db-grid-html-quadrant-quoted]
[fixture: quadrant/db-grid-html-title]
[fixture: quadrant/db-grid-html-x-axis-quoted]
[fixture: quadrant/db-grid-html-x-axis-right-quoted]
[fixture: quadrant/db-grid-html-y-axis-quoted]
[fixture: quadrant/db-grid-html-y-axis-top-quoted]
[fixture: quadrant/gram-grid-html-class-name]
[fixture: quadrant/gram-grid-html-classdef-name]
[fixture: quadrant/gram-grid-html-point-bare]
[fixture: quadrant/gram-grid-html-quadrant-bare]
[fixture: quadrant/gram-grid-html-x-axis-bare]
[fixture: quadrant/gram-grid-html-x-axis-right-bare]
[fixture: quadrant/gram-grid-html-y-axis-bare]
[fixture: quadrant/gram-grid-html-y-axis-top-bare]
[fixture: quadrant/db-grid-punct-acc-descr]
[fixture: quadrant/db-grid-punct-acc-descr-block]
[fixture: quadrant/db-grid-punct-acc-title]
[fixture: quadrant/db-grid-punct-point-quoted]
[fixture: quadrant/db-grid-punct-quadrant-quoted]
[fixture: quadrant/db-grid-punct-title]
[fixture: quadrant/db-grid-punct-x-axis-quoted]
[fixture: quadrant/db-grid-punct-x-axis-right-quoted]
[fixture: quadrant/db-grid-punct-y-axis-quoted]
[fixture: quadrant/db-grid-punct-y-axis-top-quoted]
[fixture: quadrant/gram-grid-punct-class-name]
[fixture: quadrant/gram-grid-punct-classdef-name]
[fixture: quadrant/gram-grid-punct-point-bare]
[fixture: quadrant/gram-grid-punct-quadrant-bare]
[fixture: quadrant/gram-grid-punct-x-axis-bare]
[fixture: quadrant/gram-grid-punct-x-axis-right-bare]
[fixture: quadrant/gram-grid-punct-y-axis-bare]
[fixture: quadrant/gram-grid-punct-y-axis-top-bare]
[fixture: quadrant/db-grid-semicolon-acc-descr]
[fixture: quadrant/db-grid-semicolon-acc-descr-block]
[fixture: quadrant/db-grid-semicolon-acc-title]
[fixture: quadrant/db-grid-semicolon-point-quoted]
[fixture: quadrant/db-grid-semicolon-quadrant-quoted]
[fixture: quadrant/db-grid-semicolon-title]
[fixture: quadrant/db-grid-semicolon-x-axis-quoted]
[fixture: quadrant/db-grid-semicolon-x-axis-right-quoted]
[fixture: quadrant/db-grid-semicolon-y-axis-quoted]
[fixture: quadrant/db-grid-semicolon-y-axis-top-quoted]
[fixture: quadrant/gram-grid-semicolon-class-name]
[fixture: quadrant/gram-grid-semicolon-classdef-name]
[fixture: quadrant/gram-grid-semicolon-point-bare]
[fixture: quadrant/gram-grid-semicolon-quadrant-bare]
[fixture: quadrant/gram-grid-semicolon-x-axis-bare]
[fixture: quadrant/gram-grid-semicolon-x-axis-right-bare]
[fixture: quadrant/gram-grid-semicolon-y-axis-bare]
[fixture: quadrant/gram-grid-semicolon-y-axis-top-bare]
[fixture: quadrant/db-grid-colon-acc-descr]
[fixture: quadrant/db-grid-colon-acc-descr-block]
[fixture: quadrant/db-grid-colon-acc-title]
[fixture: quadrant/db-grid-colon-classdef-name]
[fixture: quadrant/db-grid-colon-point-quoted]
[fixture: quadrant/db-grid-colon-quadrant-quoted]
[fixture: quadrant/db-grid-colon-title]
[fixture: quadrant/db-grid-colon-x-axis-quoted]
[fixture: quadrant/db-grid-colon-x-axis-right-quoted]
[fixture: quadrant/db-grid-colon-y-axis-quoted]
[fixture: quadrant/db-grid-colon-y-axis-top-quoted]
[fixture: quadrant/gram-grid-colon-class-name]
[fixture: quadrant/gram-grid-colon-point-bare]
[fixture: quadrant/gram-grid-colon-quadrant-bare]
[fixture: quadrant/gram-grid-colon-x-axis-bare]
[fixture: quadrant/gram-grid-colon-x-axis-right-bare]
[fixture: quadrant/gram-grid-colon-y-axis-bare]
[fixture: quadrant/gram-grid-colon-y-axis-top-bare]
[fixture: quadrant/db-grid-arrow-acc-descr]
[fixture: quadrant/db-grid-arrow-acc-descr-block]
[fixture: quadrant/db-grid-arrow-acc-title]
[fixture: quadrant/db-grid-arrow-point-quoted]
[fixture: quadrant/db-grid-arrow-quadrant-quoted]
[fixture: quadrant/db-grid-arrow-title]
[fixture: quadrant/db-grid-arrow-x-axis-bare]
[fixture: quadrant/db-grid-arrow-x-axis-quoted]
[fixture: quadrant/db-grid-arrow-x-axis-right-quoted]
[fixture: quadrant/db-grid-arrow-y-axis-bare]
[fixture: quadrant/db-grid-arrow-y-axis-quoted]
[fixture: quadrant/db-grid-arrow-y-axis-top-quoted]
[fixture: quadrant/gram-grid-arrow-class-name]
[fixture: quadrant/gram-grid-arrow-classdef-name]
[fixture: quadrant/gram-grid-arrow-point-bare]
[fixture: quadrant/gram-grid-arrow-quadrant-bare]
[fixture: quadrant/gram-grid-arrow-x-axis-right-bare]
[fixture: quadrant/gram-grid-arrow-y-axis-top-bare]
[fixture: quadrant/db-grid-quote-acc-descr]
[fixture: quadrant/db-grid-quote-acc-descr-block]
[fixture: quadrant/db-grid-quote-acc-title]
[fixture: quadrant/db-grid-quote-title]
[fixture: quadrant/gram-grid-quote-class-name]
[fixture: quadrant/gram-grid-quote-classdef-name]
[fixture: quadrant/gram-grid-quote-point-bare]
[fixture: quadrant/gram-grid-quote-point-quoted]
[fixture: quadrant/gram-grid-quote-quadrant-bare]
[fixture: quadrant/gram-grid-quote-quadrant-quoted]
[fixture: quadrant/gram-grid-quote-x-axis-bare]
[fixture: quadrant/gram-grid-quote-x-axis-quoted]
[fixture: quadrant/gram-grid-quote-x-axis-right-bare]
[fixture: quadrant/gram-grid-quote-x-axis-right-quoted]
[fixture: quadrant/gram-grid-quote-y-axis-bare]
[fixture: quadrant/gram-grid-quote-y-axis-quoted]
[fixture: quadrant/gram-grid-quote-y-axis-top-bare]
[fixture: quadrant/gram-grid-quote-y-axis-top-quoted]
[fixture: quadrant/db-grid-backtick-acc-descr]
[fixture: quadrant/db-grid-backtick-acc-descr-block]
[fixture: quadrant/db-grid-backtick-acc-title]
[fixture: quadrant/db-grid-backtick-point-bare]
[fixture: quadrant/db-grid-backtick-point-quoted]
[fixture: quadrant/db-grid-backtick-quadrant-bare]
[fixture: quadrant/db-grid-backtick-quadrant-quoted]
[fixture: quadrant/db-grid-backtick-title]
[fixture: quadrant/db-grid-backtick-x-axis-bare]
[fixture: quadrant/db-grid-backtick-x-axis-quoted]
[fixture: quadrant/db-grid-backtick-x-axis-right-bare]
[fixture: quadrant/db-grid-backtick-x-axis-right-quoted]
[fixture: quadrant/db-grid-backtick-y-axis-bare]
[fixture: quadrant/db-grid-backtick-y-axis-quoted]
[fixture: quadrant/db-grid-backtick-y-axis-top-bare]
[fixture: quadrant/db-grid-backtick-y-axis-top-quoted]
[fixture: quadrant/gram-grid-backtick-class-name]
[fixture: quadrant/gram-grid-backtick-classdef-name]
[fixture: quadrant/db-grid-percent-acc-descr]
[fixture: quadrant/db-grid-percent-acc-descr-block]
[fixture: quadrant/db-grid-percent-acc-title]
[fixture: quadrant/db-grid-percent-point-bare]
[fixture: quadrant/db-grid-percent-point-quoted]
[fixture: quadrant/db-grid-percent-quadrant-bare]
[fixture: quadrant/db-grid-percent-quadrant-quoted]
[fixture: quadrant/db-grid-percent-title]
[fixture: quadrant/db-grid-percent-x-axis-bare]
[fixture: quadrant/db-grid-percent-x-axis-quoted]
[fixture: quadrant/db-grid-percent-x-axis-right-bare]
[fixture: quadrant/db-grid-percent-x-axis-right-quoted]
[fixture: quadrant/db-grid-percent-y-axis-bare]
[fixture: quadrant/db-grid-percent-y-axis-quoted]
[fixture: quadrant/db-grid-percent-y-axis-top-bare]
[fixture: quadrant/db-grid-percent-y-axis-top-quoted]
[fixture: quadrant/gram-grid-percent-class-name]
[fixture: quadrant/gram-grid-percent-classdef-name]
[fixture: quadrant/db-grid-empty-x-axis-right-bare]
[fixture: quadrant/db-grid-empty-y-axis-top-bare]
[fixture: quadrant/gram-grid-empty-acc-descr]
[fixture: quadrant/gram-grid-empty-acc-title]
[fixture: quadrant/gram-grid-empty-classdef-name]
[fixture: quadrant/gram-grid-empty-point-bare]
[fixture: quadrant/gram-grid-empty-quadrant-bare]
[fixture: quadrant/gram-grid-empty-quadrant-quoted]
[fixture: quadrant/gram-grid-empty-x-axis-bare]
[fixture: quadrant/gram-grid-empty-y-axis-bare]
[fixture: quadrant/db-quadrant-single-percent]
[fixture: quadrant/db-quadrant-punctuation-run]
[fixture: quadrant/db-grid-constructor-acc-descr]
[fixture: quadrant/db-grid-constructor-acc-descr-block]
[fixture: quadrant/db-grid-constructor-acc-title]
[fixture: quadrant/db-grid-constructor-point-quoted]
[fixture: quadrant/db-grid-constructor-quadrant-bare]
[fixture: quadrant/db-grid-constructor-quadrant-quoted]
[fixture: quadrant/db-grid-constructor-title]
[fixture: quadrant/db-grid-constructor-x-axis-bare]
[fixture: quadrant/db-grid-constructor-x-axis-quoted]
[fixture: quadrant/db-grid-constructor-x-axis-right-bare]
[fixture: quadrant/db-grid-constructor-x-axis-right-quoted]
[fixture: quadrant/db-grid-constructor-y-axis-bare]
[fixture: quadrant/db-grid-constructor-y-axis-quoted]
[fixture: quadrant/db-grid-constructor-y-axis-top-bare]
[fixture: quadrant/db-grid-constructor-y-axis-top-quoted]
[fixture: quadrant/db-grid-keyword-acc-descr]
[fixture: quadrant/db-grid-keyword-acc-descr-block]
[fixture: quadrant/db-grid-keyword-acc-title]
[fixture: quadrant/db-grid-keyword-class-name]
[fixture: quadrant/db-grid-keyword-point-quoted]
[fixture: quadrant/db-grid-keyword-quadrant-quoted]
[fixture: quadrant/db-grid-keyword-title]
[fixture: quadrant/db-grid-keyword-x-axis-quoted]
[fixture: quadrant/db-grid-keyword-x-axis-right-quoted]
[fixture: quadrant/db-grid-keyword-y-axis-quoted]
[fixture: quadrant/db-grid-keyword-y-axis-top-quoted]
[fixture: quadrant/db-grid-proto-acc-descr]
[fixture: quadrant/db-grid-proto-acc-descr-block]
[fixture: quadrant/db-grid-proto-acc-title]
[fixture: quadrant/db-grid-proto-point-quoted]
[fixture: quadrant/db-grid-proto-quadrant-bare]
[fixture: quadrant/db-grid-proto-quadrant-quoted]
[fixture: quadrant/db-grid-proto-title]
[fixture: quadrant/db-grid-proto-x-axis-bare]
[fixture: quadrant/db-grid-proto-x-axis-quoted]
[fixture: quadrant/db-grid-proto-x-axis-right-bare]
[fixture: quadrant/db-grid-proto-x-axis-right-quoted]
[fixture: quadrant/db-grid-proto-y-axis-bare]
[fixture: quadrant/db-grid-proto-y-axis-quoted]
[fixture: quadrant/db-grid-proto-y-axis-top-bare]
[fixture: quadrant/db-grid-proto-y-axis-top-quoted]
[fixture: quadrant/gram-grid-keyword-quadrant-bare]
[fixture: quadrant/gram-grid-keyword-x-axis-bare]
[fixture: quadrant/gram-grid-keyword-x-axis-right-bare]
[fixture: quadrant/gram-grid-keyword-y-axis-bare]
[fixture: quadrant/gram-grid-keyword-y-axis-top-bare]

### タイトルの文脈

`title` はタイトルの文脈に入ります。
この文脈は行の残りを `title-text` の単位として読み、文脈を出ます。
キーワードの後で行が終わるとき、単位は空です。
改行文字までのすべての文字がタイトルの文字です。
`;`、`#`、`%%` とその後、引用符、コロン、キーワード、
点のように見えるテキストもそうです。
そのため、`title T; quadrant-1 A` はタイトル `T; quadrant-1 A` で、
`title: [0.3, 0.6]` はタイトルです。
[fixture: quadrant/db-title-keyword-trailing-space]
[fixture: quadrant/db-title-twice] [fixture: quadrant/db-title-indented]
[fixture: quadrant/db-title-tab-indented]
[fixture: quadrant/db-title-tab-separator]
[fixture: quadrant/db-title-after-semicolon]
[fixture: quadrant/db-title-frontmatter]
[fixture: quadrant/db-title-frontmatter-after-statement]
[fixture: quadrant/db-title-frontmatter-and-statement]
[fixture: quadrant/gram-title-in-name-middle]
[fixture: quadrant/gram-title-lf-ends]
[fixture: quadrant/gram-title-after-axis-text]
[fixture: quadrant/db-title-spaces-trimmed]
[fixture: quadrant/db-title-tab-trailing]
[fixture: quadrant/db-title-inner-spaces] [fixture: quadrant/db-title-colon]
[fixture: quadrant/db-title-quotes-kept]
[fixture: quadrant/db-title-semicolon-kept]
[fixture: quadrant/db-title-semicolon-then-statement]
[fixture: quadrant/db-acc-title-after-semicolon]
[fixture: quadrant/db-title-hash-kept] [fixture: quadrant/db-title-leading-dash]
[fixture: quadrant/db-title-leading-hash]
[fixture: quadrant/db-title-leading-semicolon]
[fixture: quadrant/db-title-percent-kept]
[fixture: quadrant/db-title-comment-glued-kept]
[fixture: quadrant/db-title-comment-kept]
[fixture: quadrant/db-title-comment-only]
[fixture: quadrant/db-title-directive-removed] [fixture: quadrant/db-title-dash]
[fixture: quadrant/db-title-non-ascii] [fixture: quadrant/db-title-html]
[fixture: quadrant/db-title-keyword-in-text]
[fixture: quadrant/db-title-with-colon-point-like]
[fixture: quadrant/db-title-digit-after-axis-semicolon]
[fixture: quadrant/db-title-digit-after-classdef]
[fixture: quadrant/db-title-digit-after-empty-block]
[fixture: quadrant/db-title-digit-after-point]
[fixture: quadrant/db-title-digit-after-quadrant]
[fixture: quadrant/db-title-digit-after-x-axis]
[fixture: quadrant/db-title-digit-after-x-axis-arrow]
[fixture: quadrant/db-title-digit-alone]
[fixture: quadrant/db-title-digits-with-space]
[fixture: quadrant/db-title-takes-empty-block]

### アクセシビリティの値

`accTitle` と `:` はアクセシビリティのタイトルの文脈に、
`accDescr` と `:` はアクセシビリティの説明の文脈に入ります。
どちらも、`:` の後の空白を改行も含めて読み、
それから行の残りを `acc-title-text` か `acc-description-text`
の単位として読んで、文脈を出ます。
そのため、テキストはキーワードの後で空白以外の文字を持つ最初の行で始まり、
その行が文であっても、行全体を取ります。
`accTitle:` に行 `quadrant-1 A` が続くと、テキスト `quadrant-1 A` を持ち、
それは文ではなくなります。
その間のコメント行とディレクティブの行は、テキストの行ではありません。
`:` の前には改行も含めて空白を置け、
その間にコメント行やディレクティブの行があってもかまいません。
U+00A0、U+2028、U+2029、U+3000、 U+FEFF も `:` の前後の空白です。
[fixture: quadrant/db-acc-title-nbsp-before-colon]
[fixture: quadrant/db-acc-title-ideographic-before-colon]
[fixture: quadrant/db-acc-title-bom-before-colon]
[fixture: quadrant/db-acc-title-ls-before-colon]
[fixture: quadrant/db-acc-title-ps-before-colon]
[fixture: quadrant/db-acc-descr-nbsp-before-colon]
[fixture: quadrant/db-acc-descr-ideographic-before-colon]
[fixture: quadrant/db-acc-descr-bom-before-colon]
[fixture: quadrant/db-acc-descr-ls-before-colon]
[fixture: quadrant/db-acc-descr-ps-before-colon]
[fixture: quadrant/db-acc-title-nbsp-after-colon]
[fixture: quadrant/db-acc-title-ideographic-after-colon]
[fixture: quadrant/db-acc-title-bom-after-colon]
[fixture: quadrant/db-acc-title-ls-after-colon]
[fixture: quadrant/db-acc-title-ps-after-colon]
[fixture: quadrant/db-acc-title-comment-line-before-colon]
[fixture: quadrant/db-acc-descr-comment-line-before-colon]
[fixture: quadrant/db-acc-title-directive-line-before-colon]
`:` の後、テキストの終わりまで空白しかないとき、入力は拒否されます。
前にアクセシビリティの文があっても同じです。
`:`、`;`、`#`、`%%`、引用符と、文の文脈の文字は、テキストの文字です。
[fixture: quadrant/db-acc-title-plain]
[fixture: quadrant/db-acc-title-glued-colon]
[fixture: quadrant/db-acc-title-space-before-colon]
[fixture: quadrant/db-acc-title-tab-before-colon]
[fixture: quadrant/gram-acc-title-no-colon]
[fixture: quadrant/db-acc-title-trimmed]
[fixture: quadrant/db-acc-title-indented]
[fixture: quadrant/db-acc-title-frontmatter-like-yaml]
[fixture: quadrant/db-acc-descr-plain]
[fixture: quadrant/db-acc-descr-glued-colon]
[fixture: quadrant/db-acc-descr-space-before-colon]
[fixture: quadrant/gram-acc-descr-no-colon]
[fixture: quadrant/db-acc-descr-trimmed]
[fixture: quadrant/db-acc-descr-frontmatter-like-yaml]
[fixture: quadrant/db-acc-both] [fixture: quadrant/db-acc-title-semicolon-kept]
[fixture: quadrant/db-acc-title-semicolon-only]
[fixture: quadrant/db-acc-title-semicolon-then-statement]
[fixture: quadrant/db-acc-title-hash-kept]
[fixture: quadrant/db-acc-title-comment-kept]
[fixture: quadrant/db-acc-title-quotes-kept]
[fixture: quadrant/db-acc-title-colon-kept]
[fixture: quadrant/db-acc-title-directive-removed]
[fixture: quadrant/db-acc-descr-semicolon-kept]
[fixture: quadrant/db-acc-descr-semicolon-only]
[fixture: quadrant/db-acc-descr-comment-kept]
[fixture: quadrant/db-acc-descr-hash-kept]
[fixture: quadrant/db-acc-descr-directive-removed]
[fixture: quadrant/gram-acc-title-empty]
[fixture: quadrant/gram-acc-title-spaces-only]
[fixture: quadrant/gram-acc-title-twice-empty-last]
[fixture: quadrant/gram-acc-descr-empty]
[fixture: quadrant/db-acc-title-next-line]
[fixture: quadrant/db-acc-title-next-line-after-blank-lines]
[fixture: quadrant/db-acc-title-next-line-crlf]
[fixture: quadrant/db-acc-title-next-line-indented]
[fixture: quadrant/db-acc-title-next-line-keyword]
[fixture: quadrant/db-acc-title-next-line-no-line-feed-at-end]
[fixture: quadrant/db-acc-descr-next-line]
[fixture: quadrant/db-acc-descr-next-line-tab]
[fixture: quadrant/db-acc-title-comment-line-before-text]
[fixture: quadrant/db-acc-title-directive-line-before-text]
[fixture: quadrant/db-acc-title-statement-as-text]
[fixture: quadrant/db-acc-title-quadrant-as-text]
[fixture: quadrant/db-acc-descr-comment-line-before-text]
[fixture: quadrant/db-acc-descr-classdef-as-text]
[fixture: quadrant/db-acc-descr-title-text-keeps-title]
[fixture: quadrant/db-acc-title-line-feed-before-colon]

`accDescr`、空白、`{` は説明ブロックの文脈に入ります。
この文脈は、`{` の後の空白を読み、
それから次の `}` までのすべての文字を `description-block-text`
の単位として読み、 `}` を `}` の単位として読んで、文脈を出ます。
`}` の前の空白はテキストの一部です。
`{` と `}` の間が空白だけのとき、`description-block-text` の単位はありません。
テキストは改行、`#`、`;`、引用符、キーワード、`%%` を持てます。
その中の CRLF と単独の CR は改行文字です。
`{` の前には改行も含めて空白を置け、
その間にコメント行やディレクティブの行があってもかまいません。
U+00A0 など、表記のほかの空白文字もそこに置けます。
[fixture: quadrant/db-acc-descr-nbsp-before-brace]
[fixture: quadrant/db-acc-descr-ideographic-before-brace]
[fixture: quadrant/db-acc-descr-bom-before-brace]
[fixture: quadrant/db-acc-descr-ls-before-brace]
[fixture: quadrant/db-acc-descr-ps-before-brace]
[fixture: quadrant/db-acc-descr-comment-line-before-brace]
[fixture: quadrant/db-acc-descr-directive-line-before-brace]
`}` のないブロックは入力を拒否させます。 [fixture: quadrant/db-acc-descr-block]
[fixture: quadrant/db-acc-descr-block-glued-brace]
[fixture: quadrant/db-acc-descr-block-lines]
[fixture: quadrant/db-acc-descr-block-indented-lines]
[fixture: quadrant/db-acc-descr-block-empty]
[fixture: quadrant/db-acc-descr-block-one-line]
[fixture: quadrant/db-acc-descr-block-blank-lines]
[fixture: quadrant/db-acc-descr-block-semicolon-kept]
[fixture: quadrant/db-acc-descr-block-hash-kept]
[fixture: quadrant/db-acc-descr-block-comment-kept]
[fixture: quadrant/db-acc-descr-block-directive-removed]
[fixture: quadrant/db-acc-descr-block-twice]
[fixture: quadrant/db-acc-descr-block-crlf]
[fixture: quadrant/db-acc-descr-block-cr]
[fixture: quadrant/db-acc-descr-block-quotes-kept]
[fixture: quadrant/db-acc-descr-block-keyword-inside]
[fixture: quadrant/db-acc-descr-block-after-title]
[fixture: quadrant/db-acc-descr-block-brace-on-next-line]
[fixture: quadrant/db-acc-descr-block-tab-before-brace]
[fixture: quadrant/db-acc-descr-block-no-line-feed-after-brace]
[fixture: quadrant/db-acc-descr-block-empty-braces]
[fixture: quadrant/db-acc-descr-block-spaces-only]
[fixture: quadrant/db-acc-descr-block-only-blank-lines]

### 文字列

`"` は文字列の文脈に入ります。
この文脈は次の `"` までのすべての文字を `string` の単位として読み、
その `"` で文脈を出ます。
単位のテキストは引用符の間にあるものです。
テキストは改行も含めて `"` 以外のどの文字も持てます。
端のスペース、句読点、キーワード、矢印、角括弧、逆引用符、
スペースの後や語にくっついた `%%`、ASCII 外の文字です。
文字列にエスケープはなく、閉じない文字列は入力を拒否させます。
[fixture: quadrant/db-quoted-comment-glued-kept]
[fixture: quadrant/db-quoted-comment-mark-kept-axis]
[fixture: quadrant/db-quoted-comment-mark-kept-point]
[fixture: quadrant/db-quoted-comment-mark-kept-quadrant]
[fixture: quadrant/db-quoted-comment-mark-markdown]
[fixture: quadrant/db-quadrant-string-backtick-inside]

引用符と逆引用符は markdown 文字列の文脈に入ります。
この文脈は次の逆引用符までの文字を `markdown-string` の単位として読み、
その逆引用符とその後の引用符で文脈を出ます。
テキストは逆引用符と引用符を持てず、``quadrant-1 "`a"b`"`` は拒否されます。
閉じない markdown 文字列は入力を拒否させます。
[fixture: quadrant/db-name-markdown] [fixture: quadrant/db-quadrant-markdown]
[fixture: quadrant/db-quadrant-markdown-newline]
[fixture: quadrant/db-quadrant-markdown-then-bare]
[fixture: quadrant/db-quadrant-markdown-then-title]
[fixture: quadrant/db-x-axis-markdown-multiline]
[fixture: quadrant/db-x-axis-markdown-string]
[fixture: quadrant/db-y-axis-markdown-multiline]
[fixture: quadrant/db-y-axis-markdown-string]
[fixture: quadrant/gram-markdown-string-quote-inside]
[fixture: quadrant/gram-quadrant-markdown-unclosed]
[fixture: quadrant/gram-x-axis-markdown-unclosed]
[fixture: quadrant/gram-y-axis-markdown-unclosed]

空の文字列 `""` と空の markdown 文字列は、
空のテキストを持つ `string` の単位と `markdown-string`
の単位です（[空の文字列](#空の文字列) を参照）。

### クラス名の文脈

`:::` はクラス名の文脈に入ります。
この文脈は 1 つ以上の ASCII の語の文字（英字、数字、
`_`）を `class-name` の単位として読み、文脈を出ます。
その後には点の `:` が続きます。
`:::` のすぐ後の空白、空の名前、名前の中のダッシュ、ASCII 外の文字、
エンティティのプレースホルダー、2 つ目の `:::`、後に `:` のないクラス名、
前に名前のない `:::` は、入力を拒否させます。
[fixture: quadrant/db-class-constructor] [fixture: quadrant/db-class-digits]
[fixture: quadrant/db-class-has-own-property]
[fixture: quadrant/db-class-marker-in-bare-name]
[fixture: quadrant/db-class-marker-with-comment]
[fixture: quadrant/db-class-name-with-trailing-text]
[fixture: quadrant/db-class-on-quoted-name] [fixture: quadrant/db-class-plain]
[fixture: quadrant/db-class-proto] [fixture: quadrant/db-class-spaces-around]
[fixture: quadrant/db-class-undefined] [fixture: quadrant/db-class-underscore]
[fixture: quadrant/gram-class-after-colon-name]
[fixture: quadrant/gram-class-dash] [fixture: quadrant/gram-class-empty-name]
[fixture: quadrant/gram-class-in-name-position]
[fixture: quadrant/gram-class-non-ascii]
[fixture: quadrant/gram-class-space-after-marker]
[fixture: quadrant/gram-class-two-markers]
[fixture: quadrant/gram-class-spaces-around-marker]
[fixture: quadrant/db-class-space-before-marker]

### 点の文脈

まわりに空白を持つ `:` と `[` は、点の文脈に入ります（文の文脈の規則 6）。
この空白は [表記](../common.ja.md#表記) のどの空白文字でもよく、改行文字、
U+00A0、U+2028、U+2029、U+3000、U+FEFF も含みます。
そのため、`A`、U+00A0、`: [0.3, 0.6]` と、`A:`、U+3000、
`[0.3, 0.6]` は点 `A` です。 [fixture: quadrant/db-point-nbsp-before-colon]
[fixture: quadrant/db-point-ideographic-before-colon]
[fixture: quadrant/db-point-bom-before-colon]
[fixture: quadrant/db-point-ls-before-colon]
[fixture: quadrant/db-point-ps-before-colon]
[fixture: quadrant/db-point-nbsp-after-colon]
[fixture: quadrant/db-point-ideographic-after-colon]
[fixture: quadrant/db-point-bom-after-colon]
[fixture: quadrant/db-point-ls-after-colon]
[fixture: quadrant/db-point-ps-after-colon]
[fixture: quadrant/db-class-nbsp-before-colon]
`:` の前の空白は、改行文字以外の空白文字で始まるときだけ、改行を持てます。
点の名前やクラス名のすぐ後の改行文字は `newline` の単位です。
そのため、`A`、改行、`: [0.3, 0.6]` は拒否され、 `A`、スペース、改行、
`: [0.3, 0.6]` は点です。
`A:`、改行、`[0.3, 0.6]` も点です。
クラス名の後でも、`A:::c`、スペース、改行、`: [0.3, 0.6]` は点で、
スペースがないと拒否されます。
`:` の前のタブも空白で、`:` の前の改行の間には、コメント行、ディレクティブの行、
空行を置けます。 [fixture: quadrant/db-point-tab-and-line-feed-before-colon]
[fixture: quadrant/db-point-comment-line-before-colon]
[fixture: quadrant/db-point-directive-line-before-colon]
[fixture: quadrant/db-point-empty-line-before-colon]
[fixture: quadrant/db-class-comment-line-before-colon]
[fixture: quadrant/gram-point-newline-before-bracket-open]
[fixture: quadrant/db-point-space-and-line-feed-before-colon]
[fixture: quadrant/db-point-line-feed-after-colon]
[fixture: quadrant/gram-class-line-feed-before-colon]
[fixture: quadrant/db-class-space-and-line-feed-before-colon]
[fixture: quadrant/db-point-tab-before-colon]
[fixture: quadrant/db-point-newline-after-bracket]
[fixture: quadrant/db-point-newline-after-comma]
[fixture: quadrant/db-point-newline-before-bracket]
[fixture: quadrant/db-point-newline-before-comma]

点の文脈では、**座標**は `coordinate` の単位です。
`1` か、`0` の後に、改行文字、U+2028、
U+2029 以外の 1 文字と 1 つ以上の数字が続くもの（省略可）です。
そのため、`0`、`1`、`0.3`、`0.30` は座標で、 `0x5`、`0 3`、`0,3`、`0;3`、`0#3`、
数字の前に引用符、ASCII 外の文字、U+00A0、U+3000、U+FEFF を持つ `0` も座標です。
一方、`1.5`、`2`、`10`、`00`、`01`、`.3`、`-0.3`、`+0.3`、`0.`、 `0..5`、
`0.6e1`、語、数字の前に改行文字、U+2028、 U+2029 を持つ `0` は拒否されます。
[fixture: quadrant/db-point-coordinate-nbsp]
[fixture: quadrant/db-point-coordinate-ideographic]
[fixture: quadrant/db-point-coordinate-bom]
[fixture: quadrant/gram-point-coordinate-line-separator]
[fixture: quadrant/gram-point-coordinate-ps]
最初の座標の後の `,` は、まわりの空白（どの種類でも）とともに `,` の単位で、
`]` はその後のスペースとともに `]` の単位で、文脈を出ます。
`[` の後と `]` の前には、どの種類の空白もかまいません。
[fixture: quadrant/db-point-nbsp-after-bracket]
[fixture: quadrant/db-point-ideographic-after-bracket]
[fixture: quadrant/db-point-bom-after-bracket]
[fixture: quadrant/db-point-ls-after-bracket]
[fixture: quadrant/db-point-ps-after-bracket]
[fixture: quadrant/db-point-nbsp-before-comma]
[fixture: quadrant/db-point-ideographic-before-comma]
[fixture: quadrant/db-point-bom-before-comma]
[fixture: quadrant/db-point-ls-before-comma]
[fixture: quadrant/db-point-ps-before-comma]
[fixture: quadrant/db-point-nbsp-inside-brackets]
[fixture: quadrant/db-point-ideographic-after-comma]
[fixture: quadrant/db-point-bom-after-comma]
[fixture: quadrant/db-point-ls-after-comma]
[fixture: quadrant/db-point-ps-after-comma]
[fixture: quadrant/db-point-nbsp-before-close]
[fixture: quadrant/db-point-ideographic-before-close]
[fixture: quadrant/db-point-bom-before-close]
[fixture: quadrant/db-point-ls-before-close]
[fixture: quadrant/db-point-ps-before-close]
`0` の後の文字はコンマでもよいので、 `A:[0,1]` は座標 `0,1` を持ち、
2 つ目の座標がなく、拒否されます。
一方、`A: [0, 1]` は点です。
角括弧の中の `%%` はコメントではなく、入力を拒否させます。
[fixture: quadrant/db-point-plain] [fixture: quadrant/db-point-glued]
[fixture: quadrant/db-point-spaces-everywhere]
[fixture: quadrant/db-point-tab-around-colon]
[fixture: quadrant/db-point-tab-inside-brackets]
[fixture: quadrant/db-point-nbsp-inside-brackets]
[fixture: quadrant/db-point-crlf-inside] [fixture: quadrant/db-point-both-one]
[fixture: quadrant/db-point-both-zero]
[fixture: quadrant/db-point-zero-decimals]
[fixture: quadrant/db-point-trailing-zero]
[fixture: quadrant/db-point-long-fraction] [fixture: quadrant/db-point-one-zero]
[fixture: quadrant/gram-point-x-over-one] [fixture: quadrant/gram-point-x-ten]
[fixture: quadrant/gram-point-x-two] [fixture: quadrant/gram-point-y-over-one]
[fixture: quadrant/gram-point-no-leading-zero]
[fixture: quadrant/gram-point-double-zero]
[fixture: quadrant/gram-point-leading-zero]
[fixture: quadrant/gram-point-negative] [fixture: quadrant/gram-point-plus]
[fixture: quadrant/gram-point-trailing-dot]
[fixture: quadrant/gram-point-exponent]
[fixture: quadrant/gram-point-one-coordinate]
[fixture: quadrant/gram-point-three-coordinates]
[fixture: quadrant/gram-point-no-comma]
[fixture: quadrant/gram-point-semicolon-comma]
[fixture: quadrant/gram-point-word-coordinate]
[fixture: quadrant/gram-point-word-second]
[fixture: quadrant/gram-point-empty-brackets]
[fixture: quadrant/gram-point-open-bracket-only]
[fixture: quadrant/gram-point-unclosed]
[fixture: quadrant/gram-point-double-close]
[fixture: quadrant/gram-point-no-brackets]
[fixture: quadrant/gram-point-no-colon] [fixture: quadrant/gram-point-parens]
[fixture: quadrant/db-point-coordinate-any-char-x]
[fixture: quadrant/db-point-coordinate-any-char-x2]
[fixture: quadrant/db-point-coordinate-any-char-y]
[fixture: quadrant/db-point-coordinate-comma]
[fixture: quadrant/db-point-coordinate-hash]
[fixture: quadrant/db-point-coordinate-nonascii]
[fixture: quadrant/db-point-coordinate-quote]
[fixture: quadrant/db-point-coordinate-semicolon]
[fixture: quadrant/db-point-coordinate-space-in-x]
[fixture: quadrant/db-point-coordinate-tab-in-x]
[fixture: quadrant/gram-point-coordinate-line-feed]
[fixture: quadrant/db-point-zero-and-one]
[fixture: quadrant/gram-point-coordinate-comma-without-space]
[fixture: quadrant/gram-point-coordinate-line-separator]
[fixture: quadrant/gram-point-coordinate-two-dots]

`]` の後のスペースは `]` の一部です。
そこでは U+00A0、U+2028、U+2029、U+3000、U+FEFF は語の文字で、
どのスタイルもそれを取らないので、入力は拒否されます。
[fixture: quadrant/gram-ends-point-nbsp-end]
[fixture: quadrant/gram-ends-point-ideographic-end]
[fixture: quadrant/gram-ends-point-bom-end]
[fixture: quadrant/gram-point-ls-after-close]
[fixture: quadrant/gram-point-ps-after-close]
ほかの空白文字は `space` の単位です。
それがスタイルを始めます。
`]` の後のタブは名前のないスタイルです（[文法の外の拒否](#文法の外の拒否)
を参照）。
その後の語もスタイルなので、 `A: [0.3, 0.6] x` と、
その行の 2 つ目の点は拒否されます。
2 つ目の `]` は拒否されます。 [fixture: quadrant/db-point-trailing-space]
[fixture: quadrant/db-point-semicolon]
[fixture: quadrant/db-point-semicolon-spaced-next]
[fixture: quadrant/db-point-semicolon-twice]
[fixture: quadrant/db-point-semicolon-gap]
[fixture: quadrant/gram-point-two-on-line]
[fixture: quadrant/db-point-comment-after-space]
[fixture: quadrant/db-point-comment-glued]
[fixture: quadrant/gram-point-comment-inside]
[fixture: quadrant/db-point-directive-inside]
[fixture: quadrant/db-point-directive-after-colon]
[fixture: quadrant/db-point-directive-in-name]
[fixture: quadrant/db-point-crlf-between]
[fixture: quadrant/db-point-cr-between]
[fixture: quadrant/db-style-glued-to-bracket]

### コメント

コメントは、文の文脈で単位が始まるところの `%%` から始まり、
その行の終わりまで続きます。
改行文字は含みません。
コメントはどの単位にも属しません。
コメント行、文の後のコメント（スペースの後でも、くっついていても）、
ヘッダーの後のコメント、テキストの終わりのコメントは何も変えません。
コメントはその前の何も取りません。
`quadrant-1 ab%% c` はテキスト `ab` を、
`x-axis L --> R%% c` はテキスト `L` と `R` を持ちます。
タイトル、アクセシビリティのテキスト、説明ブロック、
文字列の中の `%%` はその文字で、点の角括弧の中では入力を拒否させます。
`%%` だけの行と、`%%{ }%%` の行のようにディレクティブが始まらない `%%{` は、
コメントです。 [fixture: quadrant/db-comment-line]
[fixture: quadrant/db-comment-line-last]
[fixture: quadrant/db-comment-line-no-line-feed]
[fixture: quadrant/db-comment-line-indented]
[fixture: quadrant/db-comment-line-tab-indented]
[fixture: quadrant/db-comment-line-semicolon]
[fixture: quadrant/db-comment-line-keyword]
[fixture: quadrant/db-comment-line-hash]
[fixture: quadrant/db-comment-line-triple]
[fixture: quadrant/gram-comment-line-single-percent]
[fixture: quadrant/gram-comment-line-brace]
[fixture: quadrant/gram-comment-line-after-brace]
[fixture: quadrant/db-comment-crlf] [fixture: quadrant/db-comment-cr]
[fixture: quadrant/db-comment-ls] [fixture: quadrant/db-comment-two-lines]
[fixture: quadrant/db-comment-between-point-lines]
[fixture: quadrant/db-grid-comment-acc-descr]
[fixture: quadrant/db-grid-comment-acc-descr-block]
[fixture: quadrant/db-grid-comment-acc-title]
[fixture: quadrant/db-grid-comment-glued-acc-descr]
[fixture: quadrant/db-grid-comment-glued-acc-descr-block]
[fixture: quadrant/db-grid-comment-glued-acc-title]
[fixture: quadrant/db-grid-comment-glued-point-quoted]
[fixture: quadrant/db-grid-comment-glued-quadrant-quoted]
[fixture: quadrant/db-grid-comment-glued-title]
[fixture: quadrant/db-grid-comment-glued-x-axis-quoted]
[fixture: quadrant/db-grid-comment-glued-x-axis-right-quoted]
[fixture: quadrant/db-grid-comment-glued-y-axis-quoted]
[fixture: quadrant/db-grid-comment-glued-y-axis-top-quoted]
[fixture: quadrant/db-grid-comment-point-quoted]
[fixture: quadrant/db-grid-comment-quadrant-bare]
[fixture: quadrant/db-grid-comment-quadrant-quoted]
[fixture: quadrant/db-grid-comment-title]
[fixture: quadrant/db-grid-comment-x-axis-bare]
[fixture: quadrant/db-grid-comment-x-axis-quoted]
[fixture: quadrant/db-grid-comment-x-axis-right-bare]
[fixture: quadrant/db-grid-comment-x-axis-right-quoted]
[fixture: quadrant/db-grid-comment-y-axis-bare]
[fixture: quadrant/db-grid-comment-y-axis-quoted]
[fixture: quadrant/db-grid-comment-y-axis-top-bare]
[fixture: quadrant/db-grid-comment-y-axis-top-quoted]
[fixture: quadrant/gram-grid-comment-class-name]
[fixture: quadrant/gram-grid-comment-classdef-name]
[fixture: quadrant/gram-grid-comment-glued-class-name]
[fixture: quadrant/gram-grid-comment-glued-classdef-name]
[fixture: quadrant/gram-grid-comment-point-bare]
[fixture: quadrant/db-bare-percent-line-after-point]
[fixture: quadrant/db-comment-glued-after-semicolon]
[fixture: quadrant/db-empty-braces-line-between-statements]

mermaid.js は、1 文字の単位にくっついたコメントを、その文字とともに読みます。
字句解析器は、英字の並び、数字の並び、ASCII 外の文字の並び、
それ以外の 1 文字を、それぞれ 1 つとして読みます。
そのため、mermaid.js では `x-axis L%% c`、`quadrant-1 a%%b`、
`A: [0.3, 0.6] radius: 1%% c` は、文がテキストを、
スタイルが値を失って拒否されます。
`A%% c` と `a%%b: [0.3, 0.6]` は、mermaid.js では何もない行として受理され、
ここでは点のない名前として拒否されます。
`x-axis L --> R%% c` は、mermaid.js では矢印を持つ左のテキストを持ち、
右のテキストを持ちません。
`quadrant-1 ab,%% c` はテキスト `ab`、`quadrant-1 a b%% c` はテキスト `a` です。
空白文字も、文法がそれを数えるところでは 1 文字の単位です。
`accDescr {x}`、スペースかタブ、`%% c` と、
`}` の後に空のブロックやディレクティブを挟んだ同じ形と、 `A: [0.3, 0.6]`、タブ、
`%% c` は mermaid.js では受理され、
ここでは空白が残って拒否されます（詳しくは
[タイトルとアクセシビリティの文](#タイトルとアクセシビリティの文) と、
[点の文脈](#点の文脈) を参照）。
空白文字が 2 つなら、どちらも拒否します。
`;` の後、点の `]` の後、2 文字以上の並びの後、ブロックの `}` の後のコメントは、
どちらでも読みを変えるものを何も取りません。
これは既知の差異
[`comment-takes-character`](../known-divergences/comment-takes-character.ja.md)
です。 [fixture: quadrant/div-after-x-axis-glued-comment]
[fixture: quadrant/div-after-y-axis-glued-comment]
[fixture: quadrant/div-comment-unit-letter-then-non-ascii]
[fixture: quadrant/div-comment-unit-letters-then-digit]
[fixture: quadrant/div-comment-unit-non-ascii-single]
[fixture: quadrant/div-comment-unit-punctuation]
[fixture: quadrant/div-comment-unit-word-after-space]
[fixture: quadrant/div-grid-comment-glued-point-bare]
[fixture: quadrant/div-grid-comment-glued-x-axis-right-bare]
[fixture: quadrant/div-grid-comment-glued-y-axis-top-bare]
[fixture: quadrant/div-name-comment-glued]
[fixture: quadrant/div-x-axis-comment-glued-arrow]
[fixture: quadrant/div-x-axis-comment-unit-dash]
[fixture: quadrant/div-x-axis-comment-unit-right-digit]
[fixture: quadrant/div-y-axis-comment-glued-arrow]
[fixture: quadrant/div-y-axis-comment-unit-dash]
[fixture: quadrant/div-y-axis-comment-unit-top-digit]
[fixture: quadrant/div-acc-descr-block-space-and-comment-after-brace]
[fixture: quadrant/div-acc-descr-block-tab-and-comment-after-brace]
[fixture: quadrant/div-comment-glued-digit-in-quadrant-text]
[fixture: quadrant/div-comment-glued-hash-in-quadrant-text]
[fixture: quadrant/div-comment-glued-one-letter-name]
[fixture: quadrant/div-comment-glued-tab-after-point]
[fixture: quadrant/div-acc-descr-block-empty-block-space-and-comment]
[fixture: quadrant/div-acc-descr-block-directive-space-and-comment]
[fixture: quadrant/div-after-point-style-glued-comment]
[fixture: quadrant/div-after-quadrant-glued-comment]
[fixture: quadrant/div-classdef-comment-unit-single-digit]
[fixture: quadrant/div-grid-comment-glued-quadrant-bare]
[fixture: quadrant/div-grid-comment-glued-x-axis-bare]
[fixture: quadrant/div-grid-comment-glued-y-axis-bare]
[fixture: quadrant/div-quadrant-comment-glued]
[fixture: quadrant/div-style-radius-comment-glued-one-digit]
[fixture: quadrant/div-x-axis-comment-glued-text]
[fixture: quadrant/div-y-axis-comment-glued-text]
[fixture: quadrant/db-comment-unit-non-ascii-run]
[fixture: quadrant/db-comment-unit-two-digits]

## 文法

文法は [common.ja.md](../common.ja.md#表記) の表記を、
文字の代わりに単位の上で使います。
`word` のような単位の名前は、その名前の単位 1 つを表し、
二重引用符の中のテキストは、`"title"` や `","` のように、
そのテキストを名前とする単位を表します。
この文法は
[`quadrant.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L83-L189)
の文法を言い直したもので、既知の差異を除いて、同じ単位の並びを受理します。

下の各規則は、
[ast/quadrant.ja.md](../ast/quadrant.ja.md) で定める木のノードを作ります。

| 規則                                                     | ノード                         |
| -------------------------------------------------------- | ------------------------------ |
| `diagram`                                                | QuadrantDiagram                |
| `title-statement`                                        | QuadrantTitleStatement         |
| `acc-title-statement`                                    | QuadrantAccTitleStatement      |
| `acc-description-statement`                              | QuadrantAccDescrStatement      |
| `description-block-statement`、`empty-description-block` | QuadrantAccDescrBlockStatement |
| `axis-statement`                                         | QuadrantAxisStatement          |
| `quadrant-statement`                                     | QuadrantQuadrantStatement      |
| `point-statement`                                        | QuadrantPointStatement         |
| `class-def-statement`                                    | QuadrantClassDefStatement      |
| `text`                                                   | QuadrantLabel                  |
| `title-text`、`acc-title-text`、`acc-description-text`   | QuadrantLiteral                |
| `description-block-text`、`coordinate`、`style`          | QuadrantLiteral                |
| `class-name`                                             | Identifier                     |
| `class-def-name`                                         | QuadrantIdentifier             |

### 図と文

```text
diagram   = header line ( eol line )*
line      = blanks ( statement blanks
                   | description-block-statement empty-description-block* )?
blanks    = ( space | empty-description-block )*
eol       = newline | ";" | end-of-text
statement = title-statement | acc-title-statement | acc-description-statement
          | axis-statement | quadrant-statement | point-statement
          | class-def-statement
```

図はヘッダーと、その後の、改行と `;` で分けた行です。
最初の行はヘッダーのすぐ後で始まります。
行は文を 1 つ持つか、持ちません。
その前後には空白と空の説明ブロックを置けます。
[空の説明ブロック](#空の説明ブロック) を参照してください。
テキストを持つ説明ブロックの後には、空白なしで空の説明ブロックだけを置けます。
そのため、`;` で分けない限り、1 つの行の 2 つの文は拒否されます。
同じ行で `x-axis L` に `quadrant-1 A` が続くもの、点に 2 つ目の点が続くもの、
点の後の語（スタイルとして読まれる）は拒否されます。
空行、スペースとタブの行、2 つの `;` の間の空の文は何も変えません。
mermaid.js の文書の例は受理されます。 [fixture: quadrant/db-after-acc-descr-cr]
[fixture: quadrant/db-after-acc-descr-crlf]
[fixture: quadrant/db-after-acc-descr-directive]
[fixture: quadrant/db-after-acc-descr-directive-glued]
[fixture: quadrant/db-after-acc-descr-glued-comment]
[fixture: quadrant/db-after-acc-descr-semicolon]
[fixture: quadrant/db-after-acc-descr-semicolon-comment]
[fixture: quadrant/db-after-acc-descr-space-comment]
[fixture: quadrant/db-after-acc-descr-trailing-spaces]
[fixture: quadrant/db-after-acc-descr-trailing-tab]
[fixture: quadrant/db-after-acc-title-cr]
[fixture: quadrant/db-after-acc-title-crlf]
[fixture: quadrant/db-after-acc-title-directive]
[fixture: quadrant/db-after-acc-title-directive-glued]
[fixture: quadrant/db-after-acc-title-glued-comment]
[fixture: quadrant/db-after-acc-title-semicolon]
[fixture: quadrant/db-after-acc-title-semicolon-comment]
[fixture: quadrant/db-after-acc-title-space-comment]
[fixture: quadrant/db-after-acc-title-trailing-spaces]
[fixture: quadrant/db-after-acc-title-trailing-tab]
[fixture: quadrant/db-after-classdef-cr]
[fixture: quadrant/db-after-classdef-crlf]
[fixture: quadrant/db-after-classdef-directive]
[fixture: quadrant/db-after-classdef-directive-glued]
[fixture: quadrant/db-after-classdef-glued-comment]
[fixture: quadrant/db-after-classdef-space-comment]
[fixture: quadrant/db-after-classdef-trailing-spaces]
[fixture: quadrant/db-after-classdef-trailing-tab]
[fixture: quadrant/db-after-point-class-cr]
[fixture: quadrant/db-after-point-class-crlf]
[fixture: quadrant/db-after-point-class-directive]
[fixture: quadrant/db-after-point-class-directive-glued]
[fixture: quadrant/db-after-point-class-glued-comment]
[fixture: quadrant/db-after-point-class-semicolon]
[fixture: quadrant/db-after-point-class-semicolon-comment]
[fixture: quadrant/db-after-point-class-space-comment]
[fixture: quadrant/db-after-point-class-trailing-spaces]
[fixture: quadrant/db-after-point-cr] [fixture: quadrant/db-after-point-crlf]
[fixture: quadrant/db-after-point-directive]
[fixture: quadrant/db-after-point-directive-glued]
[fixture: quadrant/db-after-point-glued-comment]
[fixture: quadrant/db-after-point-semicolon]
[fixture: quadrant/db-after-point-semicolon-comment]
[fixture: quadrant/db-after-point-space-comment]
[fixture: quadrant/db-after-point-style-cr]
[fixture: quadrant/db-after-point-style-crlf]
[fixture: quadrant/db-after-point-style-directive]
[fixture: quadrant/db-after-point-style-directive-glued]
[fixture: quadrant/db-after-point-style-semicolon]
[fixture: quadrant/db-after-point-style-semicolon-comment]
[fixture: quadrant/db-after-point-style-space-comment]
[fixture: quadrant/db-after-point-style-trailing-spaces]
[fixture: quadrant/db-after-point-style-trailing-tab]
[fixture: quadrant/db-after-point-trailing-spaces]
[fixture: quadrant/db-after-quadrant-cr]
[fixture: quadrant/db-after-quadrant-crlf]
[fixture: quadrant/db-after-quadrant-directive]
[fixture: quadrant/db-after-quadrant-directive-glued]
[fixture: quadrant/db-after-quadrant-semicolon]
[fixture: quadrant/db-after-quadrant-semicolon-comment]
[fixture: quadrant/db-after-quadrant-space-comment]
[fixture: quadrant/db-after-quadrant-trailing-spaces]
[fixture: quadrant/db-after-quadrant-trailing-tab]
[fixture: quadrant/db-after-title-cr] [fixture: quadrant/db-after-title-crlf]
[fixture: quadrant/db-after-title-directive]
[fixture: quadrant/db-after-title-directive-glued]
[fixture: quadrant/db-after-title-glued-comment]
[fixture: quadrant/db-after-title-semicolon]
[fixture: quadrant/db-after-title-semicolon-comment]
[fixture: quadrant/db-after-title-space-comment]
[fixture: quadrant/db-after-title-trailing-spaces]
[fixture: quadrant/db-after-title-trailing-tab]
[fixture: quadrant/db-after-x-axis-cr] [fixture: quadrant/db-after-x-axis-crlf]
[fixture: quadrant/db-after-x-axis-directive]
[fixture: quadrant/db-after-x-axis-directive-glued]
[fixture: quadrant/db-after-x-axis-semicolon]
[fixture: quadrant/db-after-x-axis-semicolon-comment]
[fixture: quadrant/db-after-x-axis-space-comment]
[fixture: quadrant/db-after-x-axis-trailing-spaces]
[fixture: quadrant/db-after-x-axis-trailing-tab]
[fixture: quadrant/db-after-y-axis-cr] [fixture: quadrant/db-after-y-axis-crlf]
[fixture: quadrant/db-after-y-axis-directive]
[fixture: quadrant/db-after-y-axis-directive-glued]
[fixture: quadrant/db-after-y-axis-semicolon]
[fixture: quadrant/db-after-y-axis-semicolon-comment]
[fixture: quadrant/db-after-y-axis-space-comment]
[fixture: quadrant/db-after-y-axis-trailing-spaces]
[fixture: quadrant/db-after-y-axis-trailing-tab]
[fixture: quadrant/gram-after-classdef-semicolon]
[fixture: quadrant/gram-after-classdef-semicolon-comment]
[fixture: quadrant/db-after-acc-descr-space-semicolon]
[fixture: quadrant/db-after-acc-title-space-semicolon]
[fixture: quadrant/db-after-classdef-space-semicolon]
[fixture: quadrant/db-after-point-class-space-semicolon]
[fixture: quadrant/db-after-point-space-semicolon]
[fixture: quadrant/db-after-point-style-space-semicolon]
[fixture: quadrant/db-after-quadrant-space-semicolon]
[fixture: quadrant/db-after-title-space-semicolon]
[fixture: quadrant/db-after-x-axis-space-semicolon]
[fixture: quadrant/db-after-y-axis-space-semicolon]
[fixture: quadrant/db-after-acc-descr-double-semicolon]
[fixture: quadrant/db-after-acc-title-double-semicolon]
[fixture: quadrant/db-after-point-class-double-semicolon]
[fixture: quadrant/db-after-point-double-semicolon]
[fixture: quadrant/db-after-point-style-double-semicolon]
[fixture: quadrant/db-after-quadrant-double-semicolon]
[fixture: quadrant/db-after-title-double-semicolon]
[fixture: quadrant/db-after-x-axis-double-semicolon]
[fixture: quadrant/db-after-y-axis-double-semicolon]
[fixture: quadrant/gram-after-classdef-double-semicolon]
[fixture: quadrant/db-after-acc-descr-spaced-semicolons]
[fixture: quadrant/db-after-acc-title-spaced-semicolons]
[fixture: quadrant/db-after-classdef-spaced-semicolons]
[fixture: quadrant/db-after-point-class-spaced-semicolons]
[fixture: quadrant/db-after-point-spaced-semicolons]
[fixture: quadrant/db-after-point-style-spaced-semicolons]
[fixture: quadrant/db-after-quadrant-spaced-semicolons]
[fixture: quadrant/db-after-title-spaced-semicolons]
[fixture: quadrant/db-after-x-axis-spaced-semicolons]
[fixture: quadrant/db-after-y-axis-spaced-semicolons]
[fixture: quadrant/db-after-acc-descr-directive-unclosed]
[fixture: quadrant/db-after-acc-title-directive-unclosed]
[fixture: quadrant/db-after-classdef-directive-unclosed]
[fixture: quadrant/db-after-point-class-directive-unclosed]
[fixture: quadrant/db-after-point-directive-unclosed]
[fixture: quadrant/db-after-point-style-directive-unclosed]
[fixture: quadrant/db-after-quadrant-directive-unclosed]
[fixture: quadrant/db-after-title-directive-unclosed]
[fixture: quadrant/db-after-x-axis-directive-unclosed]
[fixture: quadrant/db-after-y-axis-directive-unclosed]
[fixture: quadrant/db-after-acc-descr-directive-closed-twice]
[fixture: quadrant/db-after-acc-title-directive-closed-twice]
[fixture: quadrant/db-after-classdef-directive-closed-twice]
[fixture: quadrant/db-after-point-class-directive-closed-twice]
[fixture: quadrant/db-after-point-directive-closed-twice]
[fixture: quadrant/db-after-point-style-directive-closed-twice]
[fixture: quadrant/db-after-quadrant-directive-closed-twice]
[fixture: quadrant/db-after-title-directive-closed-twice]
[fixture: quadrant/db-after-x-axis-directive-closed-twice]
[fixture: quadrant/db-after-y-axis-directive-closed-twice]
[fixture: quadrant/db-after-acc-descr-directive-word-unclosed]
[fixture: quadrant/db-after-acc-title-directive-word-unclosed]
[fixture: quadrant/db-after-quadrant-directive-word-unclosed]
[fixture: quadrant/db-after-title-directive-word-unclosed]
[fixture: quadrant/db-after-x-axis-directive-word-unclosed]
[fixture: quadrant/db-after-y-axis-directive-word-unclosed]
[fixture: quadrant/db-title-three-times]
[fixture: quadrant/db-quadrant-three-times]
[fixture: quadrant/db-quadrant-three-times-with-partner]
[fixture: quadrant/db-x-axis-three-times-arrow-forms]
[fixture: quadrant/db-x-axis-three-times-then-both]
[fixture: quadrant/db-y-axis-three-times-arrow-forms]
[fixture: quadrant/db-classdef-three-times]
[fixture: quadrant/db-classdef-three-times-partner]
[fixture: quadrant/db-frontmatter-crlf]
[fixture: quadrant/db-frontmatter-indented-delimiters]
[fixture: quadrant/db-frontmatter-no-title]
[fixture: quadrant/db-frontmatter-then-bom-header]
[fixture: quadrant/db-frontmatter-title-empty]
[fixture: quadrant/db-frontmatter-title-number]
[fixture: quadrant/db-frontmatter-title-quoted]
[fixture: quadrant/db-frontmatter-title-spaces]
[fixture: quadrant/db-frontmatter-title-with-quadrant-statement]
[fixture: quadrant/db-frontmatter-title-yaml-multiline]
[fixture: quadrant/db-frontmatter-with-quadrant-config]
[fixture: quadrant/db-frontmatter-with-theme]
[fixture: quadrant/config-settings-chart]
[fixture: quadrant/config-settings-max-text-size]
[fixture: quadrant/config-settings-point-radius]
[fixture: quadrant/config-security-level-default-script]
[fixture: quadrant/config-security-level-loose-all]
[fixture: quadrant/config-security-level-other-all]
[fixture: quadrant/config-security-level-other-flowchart-html-labels-false]
[fixture: quadrant/config-security-level-other-html-labels-false]
[fixture: quadrant/config-security-level-other-script]
[fixture: quadrant/config-security-level-sandbox-all]
[fixture: quadrant/demo-quadrantchart-52c3bebf]
[fixture: quadrant/demo-quadrantchart-a0fc48ce]
[fixture: quadrant/docs-intro-examples-19ab9ebf]
[fixture: quadrant/docs-syntax-quadrant-chart-ba45a744]
[fixture: quadrant/docs-syntax-quadrant-chart-cb034871]
[fixture: quadrant/spec-quadrant-jison-0fc9ec32]
[fixture: quadrant/spec-quadrant-jison-15068193]
[fixture: quadrant/spec-quadrant-jison-1cb39768]
[fixture: quadrant/spec-quadrant-jison-225dccc3]
[fixture: quadrant/spec-quadrant-jison-2b917256]
[fixture: quadrant/spec-quadrant-jison-2e0a7de4]
[fixture: quadrant/spec-quadrant-jison-2ece6aa9]
[fixture: quadrant/spec-quadrant-jison-43cd7d36]
[fixture: quadrant/spec-quadrant-jison-50b898df]
[fixture: quadrant/spec-quadrant-jison-5a924a42]
[fixture: quadrant/spec-quadrant-jison-6536aa70]
[fixture: quadrant/spec-quadrant-jison-6b480a86]
[fixture: quadrant/spec-quadrant-jison-732d669e]
[fixture: quadrant/spec-quadrant-jison-7ea55739]
[fixture: quadrant/spec-quadrant-jison-8418297c]
[fixture: quadrant/spec-quadrant-jison-856c8f79]
[fixture: quadrant/spec-quadrant-jison-86140df1]
[fixture: quadrant/spec-quadrant-jison-8c3d1169]
[fixture: quadrant/spec-quadrant-jison-8dac10d0]
[fixture: quadrant/spec-quadrant-jison-91681bd8]
[fixture: quadrant/spec-quadrant-jison-988ca5bc]
[fixture: quadrant/spec-quadrant-jison-9a746fe8]
[fixture: quadrant/spec-quadrant-jison-a0e26bb0]
[fixture: quadrant/spec-quadrant-jison-a3f7c02f]
[fixture: quadrant/spec-quadrant-jison-a5cf313b]
[fixture: quadrant/spec-quadrant-jison-a7ea43d1]
[fixture: quadrant/spec-quadrant-jison-a8ceb50a]
[fixture: quadrant/spec-quadrant-jison-ae92ea6b]
[fixture: quadrant/spec-quadrant-jison-b0118e13]
[fixture: quadrant/spec-quadrant-jison-bade5876]
[fixture: quadrant/spec-quadrant-jison-bbfa81b2]
[fixture: quadrant/spec-quadrant-jison-ce8b41ea]
[fixture: quadrant/spec-quadrant-jison-d38a2087]
[fixture: quadrant/spec-quadrant-jison-d461dfbf]
[fixture: quadrant/spec-quadrant-jison-da977a09]
[fixture: quadrant/spec-quadrant-jison-dfcee3bd]
[fixture: quadrant/spec-quadrant-jison-e268a026]
[fixture: quadrant/spec-quadrant-jison-e748e90b]
[fixture: quadrant/spec-quadrant-jison-e87d7a3c]
[fixture: quadrant/spec-quadrant-jison-f2dc5cde]
[fixture: quadrant/spec-quadrant-jison-f4315511]
[fixture: quadrant/spec-quadrant-jison-f816f569]
[fixture: quadrant/spec-quadrant-jison-fa7ba120]
[fixture: quadrant/spec-quadrant-jison-fd1ba7ac]

### テキスト

```text
text      = bare-text | ( string | markdown-string ) text-rest?
bare-text = word text-rest?
text-rest = ( word | "-" | space )+
```

**テキスト**は、軸のテキスト、象限のテキスト、点の名前です。
語で始まる、引用符なしの語、ダッシュ、空白か、文字列か markdown 文字列で、
その後に引用符なしのテキストが続けられます。
くっついていても、空白の後でもかまいません。
`"A" B` はテキスト `A B`、`"A"B` はテキスト `AB` です。
引用符なしのテキストの後の文字列、2 つの文字列、
markdown 文字列の後の文字列は拒否されます。
テキストの端の空白はその一部ではありません。
3 つの形のどれでテキストが始まるかが、そのノードの種類です。
[fixture: quadrant/db-x-axis-quoted-both]
[fixture: quadrant/db-y-axis-quoted-both]
[fixture: quadrant/db-x-axis-quoted-left-only]
[fixture: quadrant/db-y-axis-quoted-bottom-only]
[fixture: quadrant/db-x-axis-quoted-arrow]
[fixture: quadrant/db-y-axis-quoted-arrow]
[fixture: quadrant/db-x-axis-quoted-real-arrow]
[fixture: quadrant/db-y-axis-quoted-real-arrow]
[fixture: quadrant/db-x-axis-backticks-without-quotes]
[fixture: quadrant/db-y-axis-backticks-without-quotes]
[fixture: quadrant/db-x-axis-text-with-dash]
[fixture: quadrant/db-y-axis-text-with-dash]
[fixture: quadrant/db-x-axis-quoted-brackets]
[fixture: quadrant/db-y-axis-quoted-brackets]
[fixture: quadrant/db-x-axis-quoted-newline]
[fixture: quadrant/db-y-axis-quoted-newline]
[fixture: quadrant/db-x-axis-quoted-glued-text]
[fixture: quadrant/db-y-axis-quoted-glued-text]
[fixture: quadrant/db-x-axis-unicode-text]
[fixture: quadrant/db-y-axis-unicode-text]
[fixture: quadrant/db-x-axis-numeric-text]
[fixture: quadrant/db-y-axis-numeric-text]
[fixture: quadrant/db-x-axis-space-text-with-punctuation]
[fixture: quadrant/db-y-axis-space-text-with-punctuation]
[fixture: quadrant/db-x-axis-html] [fixture: quadrant/db-y-axis-html]
[fixture: quadrant/gram-x-axis-text-with-colon]
[fixture: quadrant/gram-y-axis-text-with-colon]
[fixture: quadrant/gram-x-axis-text-starting-with-dash]
[fixture: quadrant/gram-y-axis-text-starting-with-dash]
[fixture: quadrant/gram-x-axis-text-with-brackets]
[fixture: quadrant/gram-y-axis-text-with-brackets]
[fixture: quadrant/gram-x-axis-keyword-in-text]
[fixture: quadrant/gram-y-axis-keyword-in-text]
[fixture: quadrant/gram-x-axis-semicolon-in-text]
[fixture: quadrant/gram-y-axis-semicolon-in-text]
[fixture: quadrant/gram-x-axis-quoted-unclosed]
[fixture: quadrant/gram-y-axis-quoted-unclosed]
[fixture: quadrant/gram-x-axis-text-then-quoted]
[fixture: quadrant/gram-y-axis-text-then-quoted]
[fixture: quadrant/gram-x-axis-two-quoted]
[fixture: quadrant/gram-y-axis-two-quoted]
[fixture: quadrant/gram-quadrant-tab-after-keyword]
[fixture: quadrant/db-quadrant-tab-inside]
[fixture: quadrant/db-quadrant-dash-inside]
[fixture: quadrant/gram-quadrant-leading-dash]
[fixture: quadrant/gram-quadrant-colon]
[fixture: quadrant/db-quadrant-colon-in-quotes]
[fixture: quadrant/db-quadrant-quoted]
[fixture: quadrant/db-quadrant-quoted-then-bare]
[fixture: quadrant/gram-quadrant-bare-then-quoted]
[fixture: quadrant/gram-quadrant-two-strings]
[fixture: quadrant/gram-quadrant-quoted-unclosed]
[fixture: quadrant/db-quadrant-quoted-newline]
[fixture: quadrant/gram-quadrant-semicolon]
[fixture: quadrant/db-quadrant-semicolon-in-quotes]
[fixture: quadrant/db-quadrant-hash] [fixture: quadrant/gram-quadrant-brackets]
[fixture: quadrant/gram-quadrant-parens] [fixture: quadrant/gram-quadrant-angle]
[fixture: quadrant/gram-quadrant-braces] [fixture: quadrant/gram-quadrant-pipe]
[fixture: quadrant/gram-quadrant-at] [fixture: quadrant/gram-quadrant-caret]
[fixture: quadrant/gram-quadrant-tilde]
[fixture: quadrant/db-quadrant-punctuation]
[fixture: quadrant/db-quadrant-brackets-in-quotes]
[fixture: quadrant/gram-quadrant-arrow-in-text]
[fixture: quadrant/db-quadrant-double-dash]
[fixture: quadrant/db-quadrant-non-ascii]
[fixture: quadrant/db-quadrant-nbsp-inside]
[fixture: quadrant/db-quadrant-ideographic-inside]
[fixture: quadrant/db-quadrant-ideographic-after-keyword]
[fixture: quadrant/db-quadrant-nbsp-after-keyword]
[fixture: quadrant/db-quadrant-nbsp-trailing]
[fixture: quadrant/db-quadrant-html]
[fixture: quadrant/gram-quadrant-keyword-in-text]
[fixture: quadrant/gram-quadrant-title-in-text]
[fixture: quadrant/gram-quadrant-point-like-text]
[fixture: quadrant/db-quadrant-proto-text]
[fixture: quadrant/db-quadrant-constructor-text]
[fixture: quadrant/db-quadrant-trailing-tab]
[fixture: quadrant/db-name-acc-descr-word]
[fixture: quadrant/db-name-acc-title-word] [fixture: quadrant/db-name-backticks]
[fixture: quadrant/db-name-comma] [fixture: quadrant/db-name-constructor]
[fixture: quadrant/db-name-dash] [fixture: quadrant/db-name-digits]
[fixture: quadrant/db-name-has-own-property] [fixture: quadrant/db-name-hash]
[fixture: quadrant/db-name-html] [fixture: quadrant/db-name-ideographic]
[fixture: quadrant/db-name-indented]
[fixture: quadrant/db-name-keyword-in-quotes]
[fixture: quadrant/db-name-long-spaces] [fixture: quadrant/db-name-nbsp]
[fixture: quadrant/db-name-non-ascii] [fixture: quadrant/db-name-proto]
[fixture: quadrant/db-name-quoted] [fixture: quadrant/db-name-quoted-colon]
[fixture: quadrant/db-name-quoted-newline]
[fixture: quadrant/db-name-quoted-spaces]
[fixture: quadrant/db-name-single-dash] [fixture: quadrant/db-name-spaces]
[fixture: quadrant/db-name-spaces-trimmed]
[fixture: quadrant/db-name-tab-inside] [fixture: quadrant/db-name-to-string]
[fixture: quadrant/gram-name-arrow] [fixture: quadrant/gram-name-bracket]
[fixture: quadrant/gram-name-class-def-keyword]
[fixture: quadrant/gram-name-colon]
[fixture: quadrant/gram-name-comment-after-space]
[fixture: quadrant/gram-name-comment-unit-digit]
[fixture: quadrant/gram-name-keyword-word-inside]
[fixture: quadrant/gram-name-leading-dash] [fixture: quadrant/gram-name-only]
[fixture: quadrant/gram-name-quadrant-keyword]
[fixture: quadrant/gram-name-quoted-empty]
[fixture: quadrant/gram-name-semicolon] [fixture: quadrant/gram-name-x-axis]
[fixture: quadrant/db-name-quoted-glued-word]
[fixture: quadrant/db-name-dash-at-end]

### タイトルとアクセシビリティの文

```text
title-statement             = "title" title-text
acc-title-statement         = "accTitle" ":" acc-title-text
acc-description-statement   = "accDescr" ":" acc-description-text
description-block-statement = "accDescr" "{" description-block-text "}"
empty-description-block     = "accDescr" "{" "}"
```

タイトルは空でもかまいません。
`title` だけはテキストのないタイトルです。
アクセシビリティのタイトルと説明は空になりません。
[アクセシビリティの値](#アクセシビリティの値) を参照してください。
後の同じ種類の文は最初の文と同じ文で、行の説明もブロックも、どちらも説明です。
[fixture: quadrant/db-title-keyword-alone]
[fixture: quadrant/db-title-twice-empty-last]
[fixture: quadrant/db-acc-title-twice] [fixture: quadrant/db-acc-descr-twice]
[fixture: quadrant/db-acc-descr-line-then-block]
[fixture: quadrant/db-acc-descr-block-then-line]

テキストを持つ説明ブロックの後には、区切りまでの間に、コメントと、
`}` のすぐ後の空の説明ブロックしか置けません。
`accDescr {x}` に、行の終わりのスペース、スペースと `;`、
スペースとコメントかディレクティブ、テキスト、
スペースと空の説明ブロックが続くものは拒否されます。
一方、`accDescr {x};title T`、`accDescr {x}%% c`、
`accDescr {x}accDescr {}` は受理されます。
`accDescr {x}accDescr {}accDescr {}`、`accDescr {x}accDescr {};title T`、
`}` にディレクティブがくっついた `accDescr {x}` も受理され、
`accDescr {x}accDescr {}` にスペースが続くものは拒否されます。
[fixture: quadrant/db-acc-descr-block-then-two-empty-blocks]
[fixture: quadrant/db-acc-descr-block-empty-block-then-semicolon]
[fixture: quadrant/db-acc-descr-block-then-directive]
[fixture: quadrant/gram-acc-descr-block-empty-block-then-space]
[fixture: quadrant/div-acc-descr-block-empty-block-space-and-comment]
[fixture: quadrant/div-acc-descr-block-directive-space-and-comment]

mermaid.js は、ブロックの後に、空のブロックやディレクティブを挟んでも、
空白文字 1 つとコメントが続くものを受理します（[コメント](#コメント) を参照）。
[fixture: quadrant/db-acc-descr-block-closing-brace-same-line]
[fixture: quadrant/gram-acc-descr-block-braces-inside]
[fixture: quadrant/gram-acc-descr-block-unclosed]
[fixture: quadrant/gram-acc-descr-block-unclosed-no-line-feed]
[fixture: quadrant/gram-acc-descr-block-statement-after-brace]
[fixture: quadrant/db-acc-descr-block-statement-after-brace-semicolon]
[fixture: quadrant/gram-acc-descr-block-stray-brace]
[fixture: quadrant/gram-acc-descr-block-trailing-spaces-before-brace]
[fixture: quadrant/gram-acc-descr-block-text-after-brace]
[fixture: quadrant/gram-acc-descr-block-semicolon-spaced-after-brace]
[fixture: quadrant/db-comment-after-statement-brace]
[fixture: quadrant/db-acc-descr-block-then-empty-block-glued]
[fixture: quadrant/gram-acc-descr-block-space-and-directive]
[fixture: quadrant/gram-acc-descr-block-spaces-after-brace]
[fixture: quadrant/gram-acc-descr-block-then-empty-block-spaced]
[fixture: quadrant/gram-acc-descr-block-two-spaces-and-comment]

### 軸

```text
axis-statement = ( "x-axis" | "y-axis" ) text ( arrow text? )?
```

`x-axis` と `y-axis` は、1 つのテキスト、テキストと矢印と 2 つ目のテキスト、
テキストと矢印だけ、のどれかを取ります。
矢印は 2 つ以上のダッシュと `>` で、
まわりにスペースがあってもなくてもかまいません。
`L-->R` と `L ---> R` はテキスト `L` と `R` を持ちます。
一方、`L -> R`、`L -- > R`、2 つ目の矢印、前にテキストのない矢印、
キーワードだけは拒否され、キーワードとテキストの間のタブ、
矢印のまわりのタブ（`space` の単位）も同じです。
x 軸と y 軸は別の文で、どちらの順でもかまいません。
後の軸の文は最初の文と同じ文です。 [fixture: quadrant/db-x-axis-both]
[fixture: quadrant/db-y-axis-both] [fixture: quadrant/db-x-axis-left-only]
[fixture: quadrant/db-y-axis-bottom-only]
[fixture: quadrant/db-x-axis-left-with-arrow]
[fixture: quadrant/db-y-axis-bottom-with-arrow]
[fixture: quadrant/gram-x-axis-right-only]
[fixture: quadrant/gram-y-axis-top-only]
[fixture: quadrant/gram-x-axis-arrow-only]
[fixture: quadrant/gram-y-axis-arrow-only]
[fixture: quadrant/gram-x-axis-no-text] [fixture: quadrant/gram-y-axis-no-text]
[fixture: quadrant/db-x-axis-glued-arrow]
[fixture: quadrant/db-y-axis-glued-arrow]
[fixture: quadrant/db-x-axis-long-arrow]
[fixture: quadrant/db-y-axis-long-arrow]
[fixture: quadrant/gram-x-axis-short-arrow]
[fixture: quadrant/gram-y-axis-short-arrow]
[fixture: quadrant/gram-x-axis-broken-arrow]
[fixture: quadrant/gram-y-axis-broken-arrow]
[fixture: quadrant/gram-x-axis-two-arrows]
[fixture: quadrant/gram-y-axis-two-arrows] [fixture: quadrant/db-x-axis-twice]
[fixture: quadrant/db-x-axis-twice-arrow-then-both]
[fixture: quadrant/db-x-axis-twice-arrow-without-right]
[fixture: quadrant/db-x-axis-twice-both] [fixture: quadrant/db-y-axis-twice]
[fixture: quadrant/db-y-axis-twice-arrow-then-both]
[fixture: quadrant/db-y-axis-twice-arrow-without-top]
[fixture: quadrant/db-y-axis-twice-both]
[fixture: quadrant/db-x-axis-right-only-after-left]
[fixture: quadrant/db-y-axis-top-only-after-bottom]
[fixture: quadrant/db-x-axis-arrow-form-then-both]
[fixture: quadrant/db-y-axis-arrow-form-then-both]
[fixture: quadrant/db-x-axis-arrow-alone-with-text-after-no-space]
[fixture: quadrant/db-y-axis-arrow-alone-with-text-after-no-space]
[fixture: quadrant/db-x-axis-dash-before-arrow]
[fixture: quadrant/db-y-axis-dash-before-arrow]
[fixture: quadrant/db-x-axis-dashes-after-text]
[fixture: quadrant/db-y-axis-dashes-after-text]
[fixture: quadrant/db-x-axis-extra-spaces]
[fixture: quadrant/db-y-axis-extra-spaces]
[fixture: quadrant/db-x-axis-glued-text]
[fixture: quadrant/db-y-axis-glued-text]
[fixture: quadrant/gram-x-axis-glued-dash]
[fixture: quadrant/gram-y-axis-glued-dash]
[fixture: quadrant/db-x-axis-indented] [fixture: quadrant/db-y-axis-indented]
[fixture: quadrant/gram-x-axis-tab-after-keyword]
[fixture: quadrant/gram-y-axis-tab-after-keyword]
[fixture: quadrant/gram-x-axis-tab-around-arrow]
[fixture: quadrant/gram-y-axis-tab-around-arrow]
[fixture: quadrant/db-x-axis-nbsp-around-arrow]
[fixture: quadrant/db-y-axis-nbsp-around-arrow]
[fixture: quadrant/db-x-axis-then-y-axis] [fixture: quadrant/db-axes-y-then-x]
[fixture: quadrant/db-x-axis-semicolon-then-y]
[fixture: quadrant/db-axes-semicolon-y-then-x]
[fixture: quadrant/db-x-axis-trailing-semicolon]
[fixture: quadrant/db-y-axis-trailing-semicolon]
[fixture: quadrant/db-x-axis-comment-after-text]
[fixture: quadrant/db-y-axis-comment-after-text]
[fixture: quadrant/db-x-axis-comment-glued-text-longer]
[fixture: quadrant/db-y-axis-comment-glued-text-longer]
[fixture: quadrant/db-x-axis-comment-after-arrow]
[fixture: quadrant/db-y-axis-comment-after-arrow]
[fixture: quadrant/db-x-axis-directive-in-text]
[fixture: quadrant/db-y-axis-directive-in-text]

### 象限

```text
quadrant-statement = ( "quadrant-1" | "quadrant-2" | "quadrant-3" | "quadrant-4" ) text
```

象限の文はキーワードとテキストです。
`quadrant-0`、`quadrant-5`、キーワードだけは拒否されます。
4 つの象限はどの順でも設定でき、後の象限の文は最初の文と同じ文です。
[fixture: quadrant/db-quadrant-all-four]
[fixture: quadrant/db-quadrant-reverse-order]
[fixture: quadrant/db-quadrant-1-alone] [fixture: quadrant/db-quadrant-2-alone]
[fixture: quadrant/db-quadrant-3-alone] [fixture: quadrant/db-quadrant-4-alone]
[fixture: quadrant/gram-quadrant-no-text]
[fixture: quadrant/gram-quadrant-empty-string]
[fixture: quadrant/gram-quadrant-five] [fixture: quadrant/gram-quadrant-zero]
[fixture: quadrant/db-quadrant-ten] [fixture: quadrant/db-quadrant-glued-text]
[fixture: quadrant/db-quadrant-twice]
[fixture: quadrant/db-quadrant-twice-empty-spaces]
[fixture: quadrant/db-quadrant-spaces-trimmed]
[fixture: quadrant/db-quadrant-comment-after-space]
[fixture: quadrant/db-quadrant-comment-glued-longer]
[fixture: quadrant/db-quadrant-directive-inside]
[fixture: quadrant/db-quadrant-semicolon-then-next]
[fixture: quadrant/db-quadrant-semicolon-spaced-then-next]
[fixture: quadrant/db-quadrant-trailing-semicolon]
[fixture: quadrant/db-quadrant-blank-lines-between]
[fixture: quadrant/db-quadrant-whitespace-lines-between]
[fixture: quadrant/db-quadrant-crlf-between]
[fixture: quadrant/db-quadrant-cr-between]
[fixture: quadrant/db-quadrant-cr-cr-lf]
[fixture: quadrant/gram-quadrant-ls-between]
[fixture: quadrant/gram-quadrant-vt-between]

### 点

```text
point-statement = text ( ":::" class-name )? ":" "[" coordinate "," coordinate "]" styles?
styles          = style ( "," style )*
style           = ( style-word | space )+
```

点は、名前、`:::` の後のクラス名（なくてもよい）、角括弧の中の 2 つの座標と、
`]` の後のスタイル（なくてもよい）です。
`style-word` は、スタイルをなす単位の 1 つで、文の文脈で読まれます。
英字か数字の語、`:`、`#`、`-` です。
そのため、スタイルは英字、数字、`:`、`#`、`-`、空白を持ち、 `.`、`_`、`%`、
ASCII 外の文字、エンティティのプレースホルダーを持ちません。
`radius: 1.5` と `color: rgb(1,2,3)` は拒否されます。
スタイルは `,` で分け、そのまわりに空白があってもなくてもかまいません。
スタイルは `]` に空白なしで続けられます。
名前、角括弧、コロン、コンマのない点、座標が 1 つか 3 つの点、
コンマの代わりに `;` を持つ点は拒否されます。
同じ名前や位置の 2 つの点は 2 つの点です。 [fixture: quadrant/db-points-three]
[fixture: quadrant/db-points-same-name]
[fixture: quadrant/db-points-same-position]
[fixture: quadrant/db-points-identical]
[fixture: quadrant/db-points-between-statements]
[fixture: quadrant/db-style-radius] [fixture: quadrant/db-style-radius-glued]
[fixture: quadrant/db-style-radius-spaced-colon]
[fixture: quadrant/db-style-radius-zero]
[fixture: quadrant/db-style-radius-leading-zeros]
[fixture: quadrant/db-style-radius-big]
[fixture: quadrant/db-style-radius-overflow]
[fixture: quadrant/gram-style-radius-fraction]
[fixture: quadrant/db-style-radius-trailing-space]
[fixture: quadrant/db-style-radius-colon-after]
[fixture: quadrant/db-style-color]
[fixture: quadrant/db-style-color-colon-after]
[fixture: quadrant/db-style-color-colon-space-after]
[fixture: quadrant/db-style-color-no-hash]
[fixture: quadrant/db-style-color-short]
[fixture: quadrant/db-style-color-upper]
[fixture: quadrant/gram-style-color-function]
[fixture: quadrant/db-style-stroke-color]
[fixture: quadrant/db-style-stroke-width]
[fixture: quadrant/db-style-stroke-width-big]
[fixture: quadrant/db-style-stroke-width-leading-zero]
[fixture: quadrant/gram-style-stroke-width-fraction]
[fixture: quadrant/db-style-two] [fixture: quadrant/db-style-two-reversed]
[fixture: quadrant/db-style-four] [fixture: quadrant/db-style-same-twice]
[fixture: quadrant/gram-style-trailing-comma]
[fixture: quadrant/gram-style-leading-comma]
[fixture: quadrant/gram-style-double-comma]
[fixture: quadrant/db-style-space-around]
[fixture: quadrant/db-style-tab-around]
[fixture: quadrant/gram-style-nbsp-in-value]
[fixture: quadrant/gram-style-newline-after-comma]
[fixture: quadrant/db-style-semicolon-then-point]
[fixture: quadrant/db-style-with-class]
[fixture: quadrant/gram-style-keyword-in-value]
[fixture: quadrant/gram-style-non-ascii-key]
[fixture: quadrant/db-style-colon-in-point-name]
[fixture: quadrant/db-classdef-with-point-radius-overflow]
[fixture: quadrant/db-style-radius-semicolon]
[fixture: quadrant/db-style-radius-comment]
[fixture: quadrant/db-style-radius-comment-glued]
[fixture: quadrant/db-style-radius-directive-inside]

### クラス

```text
class-def-statement = "classDef" space class-def-name space styles
class-def-name      = ( word-of-name | "-" | "," | ":" )+
```

クラスの定義は、`classDef`、1 つの空白文字、名前、1 つの空白文字、
点のスタイルです。
`word-of-name` は、英字、数字、ASCII 外の文字の語か、 `&`、`#`、
`*` のどれかです。
名前は `_`、`.`、ほかの句読点を持たず、そのコロン、コンマ、
ダッシュは名前の一部です。
そのため、`classDef a:b color: #fff` はクラス `a:b` です。
名前の前の 2 つの空白文字は拒否されます。
一方、2 つ目の空白文字の後の空白は最初のスタイルに属します。
スタイルのない `classDef`、名前のない `classDef`、
名前が引用符の中にある `classDef` は拒否されます。
後のクラスの定義は最初の文と同じ文です。
クラスは、それを使う点の前でも後でも定義でき、使わなくてもかまいません。
[fixture: quadrant/db-classdef-color] [fixture: quadrant/db-classdef-two-styles]
[fixture: quadrant/db-classdef-all-four]
[fixture: quadrant/db-classdef-twice-replaces]
[fixture: quadrant/db-classdef-twice-same-style]
[fixture: quadrant/db-classdef-two-classes]
[fixture: quadrant/db-classdef-redefine-order]
[fixture: quadrant/gram-classdef-no-style]
[fixture: quadrant/gram-classdef-name-only-space]
[fixture: quadrant/gram-classdef-no-name]
[fixture: quadrant/db-classdef-two-spaces-after-name]
[fixture: quadrant/gram-classdef-two-spaces-before-name]
[fixture: quadrant/db-classdef-lower-case]
[fixture: quadrant/gram-classdef-glued-name]
[fixture: quadrant/gram-classdef-quoted-name]
[fixture: quadrant/db-classdef-class-used-after]
[fixture: quadrant/db-classdef-class-used-before]
[fixture: quadrant/db-classdef-point-style-and-class]
[fixture: quadrant/db-classdef-unused] [fixture: quadrant/db-classdef-indented]
[fixture: quadrant/gram-classdef-keyword-as-class]
[fixture: quadrant/gram-classdef-name-keyword-title]
[fixture: quadrant/db-classdef-blank-line-between]
[fixture: quadrant/db-classdef-comment-after]
[fixture: quadrant/db-classdef-comment-glued]
[fixture: quadrant/db-classdef-constructor-name]
[fixture: quadrant/db-classdef-dash-name]
[fixture: quadrant/db-classdef-digit-name]
[fixture: quadrant/db-classdef-has-own-property-name]
[fixture: quadrant/db-classdef-name-amp]
[fixture: quadrant/db-classdef-name-colon]
[fixture: quadrant/db-classdef-name-comma]
[fixture: quadrant/db-classdef-name-hash]
[fixture: quadrant/db-classdef-name-star]
[fixture: quadrant/db-classdef-non-ascii-name]
[fixture: quadrant/db-classdef-proto-via-dash]
[fixture: quadrant/db-classdef-semicolon-line-start]
[fixture: quadrant/db-classdef-to-string-name]
[fixture: quadrant/gram-classdef-name-dot]
[fixture: quadrant/gram-classdef-proto-name]
[fixture: quadrant/gram-classdef-semicolon-end]
[fixture: quadrant/gram-classdef-semicolon-separated]
[fixture: quadrant/gram-classdef-underscore-name]
[fixture: quadrant/db-name-prototype-definegetter]
[fixture: quadrant/db-name-prototype-isprototypeof]
[fixture: quadrant/db-name-prototype-lookupgetter]
[fixture: quadrant/db-name-prototype-propertyisenumerable]
[fixture: quadrant/db-name-prototype-tolocalestring]
[fixture: quadrant/db-name-prototype-valueof]
[fixture: quadrant/db-class-prototype-value-of]
[fixture: quadrant/db-classdef-prototype-to-string-redefined]
[fixture: quadrant/db-classdef-prototype-twice]
[fixture: quadrant/db-classdef-prototype-used]
[fixture: quadrant/db-classdef-radius-semicolon]
[fixture: quadrant/db-classdef-tabs]
[fixture: quadrant/db-classdef-name-colon-between-letters]

### 空の説明ブロック

`description-block-text` の単位のない説明ブロックの文は、
**空の説明ブロック**です。
`accDescr {}`、`accDescr { }`、改行かタブだけのブロックです。
mermaid.js は、どこにあってもそのトークンを読みません。
これは、文が始まるところ（ヘッダーの行も、同じ行の別の文の前も）と、
文の最後の単位の後、区切りの前では文です。
`accDescr {}`、`accDescr {} x-axis L`、`A: [0.3, 0.6] accDescr {}`、
`quadrant-1 A accDescr {}` は、
ブロックの後に空白があってもなくても受理されます。
それ以外、つまり文の中では、文法はそれをどこにも取らず、入力は拒否されます。
テキストの中、点の `]` とそのスタイルの間、クラスの名前とそのスタイルの間、
軸のキーワードのすぐ後です。
mermaid.js は、ブロックがないものとしてそのような入力を受理します。
ただし、軸のキーワードのすぐ後では、
テキストの前の空白が mermaid.js でも `space` の単位なので、
mermaid.js も拒否します。
これは既知の差異
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)
です。 [fixture: quadrant/div-empty-block-in-classdef]
[fixture: quadrant/div-empty-block-in-name]
[fixture: quadrant/div-empty-block-in-quadrant-text]
[fixture: quadrant/div-empty-block-in-x-axis-text]
[fixture: quadrant/div-empty-block-between-point-and-styles]
[fixture: quadrant/db-empty-block-after-point]
[fixture: quadrant/db-empty-block-before-statement]
[fixture: quadrant/db-empty-block-on-header-line]
[fixture: quadrant/gram-empty-block-before-x-axis-text]
[fixture: quadrant/gram-block-with-text-in-quadrant-text]
[fixture: quadrant/db-block-on-header-line]
[fixture: quadrant/db-acc-descr-empty-block-keeps-block]
[fixture: quadrant/db-acc-descr-empty-block-keeps-line-blank-line]
[fixture: quadrant/db-acc-descr-empty-block-keeps-line-braces]
[fixture: quadrant/db-acc-descr-empty-block-keeps-line-line-feed]
[fixture: quadrant/db-acc-descr-empty-block-keeps-line-space]
[fixture: quadrant/db-acc-descr-empty-block-keeps-line-tab]
[fixture: quadrant/db-acc-descr-empty-block-twice-keeps]
[fixture: quadrant/db-acc-title-then-empty-block]
[fixture: quadrant/gram-acc-descr-empty-line-after-text]
[fixture: quadrant/db-acc-descr-empty-block-keeps-line-plain]
[fixture: quadrant/db-acc-descr-empty-block-spaces-after]
[fixture: quadrant/db-acc-descr-empty-block-tab-after]
[fixture: quadrant/db-classdef-empty-block-after]
[fixture: quadrant/db-quadrant-empty-block-after]
[fixture: quadrant/db-x-axis-empty-block-after]

### 空の文字列

空の文字列 `""` と空の markdown 文字列は、
空のテキストを持つ `string` の単位と `markdown-string` の単位です。
mermaid.js は、どこにあってもそのトークンを読みません。
文法はそれをどこにも取りません。
空の文字列だけのテキストは、mermaid.js でも文字を持たないからです。
`quadrant-1 ""`、`x-axis ""`、`x-axis "" --> R`、`"": [0.3, 0.6]` は、
mermaid.js と同じく拒否されます。
mermaid.js がそれをないものとして受理する入力は、ここでは拒否されます。
それだけの行、文の前、テキストや名前の語の前後、
矢印の後（mermaid.js は矢印だけで 2 つ目のテキストのない軸の文と読みます）、
点のスタイルの間、`classDef` の行です。
これは既知の差異
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)
です。
タイトル、アクセシビリティのテキスト、説明ブロックの中では、
`""` はテキストの 2 つの文字です。
[fixture: quadrant/div-empty-string-after-name]
[fixture: quadrant/div-empty-string-before-name]
[fixture: quadrant/div-empty-string-before-quadrant-text]
[fixture: quadrant/div-empty-string-before-statement]
[fixture: quadrant/div-empty-string-between-words]
[fixture: quadrant/div-empty-string-in-classdef]
[fixture: quadrant/div-empty-string-in-point-styles]
[fixture: quadrant/div-empty-string-in-quadrant-text]
[fixture: quadrant/div-empty-string-inside-word]
[fixture: quadrant/div-empty-string-line]
[fixture: quadrant/div-x-axis-empty-string-after-arrow]
[fixture: quadrant/div-y-axis-empty-string-after-arrow]
[fixture: quadrant/div-empty-markdown-string-before-statement]
[fixture: quadrant/div-empty-markdown-string-line]
[fixture: quadrant/div-empty-string-alone]
[fixture: quadrant/div-x-axis-empty-markdown-string-after-arrow]
[fixture: quadrant/db-empty-string-in-title]
[fixture: quadrant/db-empty-string-title-before-statement-line]
[fixture: quadrant/gram-empty-string-after-colon]
[fixture: quadrant/gram-empty-string-in-brackets]
[fixture: quadrant/gram-empty-string-twice-quadrant]
[fixture: quadrant/gram-x-axis-empty-string]
[fixture: quadrant/gram-y-axis-empty-string]
[fixture: quadrant/gram-x-axis-empty-string-with-arrow]
[fixture: quadrant/gram-y-axis-empty-string-with-arrow]
[fixture: quadrant/db-x-axis-spaces-only-string]
[fixture: quadrant/db-y-axis-spaces-only-string]
[fixture: quadrant/db-x-axis-spaces-only-string-alone]
[fixture: quadrant/db-y-axis-spaces-only-string-alone]

### 文法の外の拒否

mermaid.js の Db は、テキストを読む間に点とクラスのスタイルを読み、
受け取らないスタイルで例外を投げます。
スタイルは、名前、`:`、値で、`:` のまわりに空白があってもなくてもかまいません。
値の後の 2 つ目の `:` とその後はかまいません。
名前は小文字だけで、数字を値とする `radius`、
`#` があってもなくてもよい 3 桁か 6 桁の 16 進を値とする `color` と
`stroke-color`、数字と `px` を値とする `stroke-width` です。
ほかの名前、空のスタイル、`:` や値のないスタイル、ほかの形の値は、
入力を拒否させます。
`radius: -5`、`radius: 1e3`、`color: red`、`stroke-width: 3`、
`stroke-width: 3 px`、`stroke-width: 3PX`、`stroke-width: 1.5px`、
`RADIUS: 10`、点の `]` の後のタブがそうです。
桁の多い `radius` は受理されます。
[fixture: quadrant/db-radius-above-safe-integer]
[fixture: quadrant/db-radius-first-infinite]
[fixture: quadrant/db-radius-largest-finite]
[fixture: quadrant/gram-radius-arabic-digit]
[fixture: quadrant/gram-radius-exponent]
[fixture: quadrant/gram-radius-fullwidth-digits]
[fixture: quadrant/gram-radius-hexadecimal]
[fixture: quadrant/gram-radius-infinity] [fixture: quadrant/gram-radius-nan]
[fixture: quadrant/gram-radius-negative-zero]
[fixture: quadrant/gram-radius-plus]
[fixture: quadrant/gram-radius-space-text-after-number]
[fixture: quadrant/gram-radius-text-after-number]
[fixture: quadrant/gram-radius-underscore]
[fixture: quadrant/gram-stroke-width-negative]
[fixture: quadrant/gram-stroke-width-text-after-unit]
[fixture: quadrant/db-stroke-width-zero]
[fixture: quadrant/gram-after-classdef-directive-word-unclosed]
[fixture: quadrant/gram-after-point-class-directive-word-unclosed]
[fixture: quadrant/gram-after-point-class-trailing-tab]
[fixture: quadrant/gram-after-point-directive-word-unclosed]
[fixture: quadrant/gram-after-point-style-directive-word-unclosed]
[fixture: quadrant/gram-after-point-trailing-tab]
[fixture: quadrant/gram-classdef-bad-style]
[fixture: quadrant/gram-classdef-empty-value]
[fixture: quadrant/gram-classdef-space-in-name]
[fixture: quadrant/gram-classdef-tab-between-styles]
[fixture: quadrant/gram-point-text-after]
[fixture: quadrant/gram-point-text-after-spaced]
[fixture: quadrant/gram-point-trailing-tab]
[fixture: quadrant/gram-point-two-tabs-and-comment]
[fixture: quadrant/gram-style-capital-key]
[fixture: quadrant/gram-style-color-four-digits]
[fixture: quadrant/gram-style-color-hash-only]
[fixture: quadrant/gram-style-color-name]
[fixture: quadrant/gram-style-color-not-hex]
[fixture: quadrant/gram-style-newline-in-style]
[fixture: quadrant/gram-style-no-comma]
[fixture: quadrant/gram-style-radius-double-colon]
[fixture: quadrant/gram-style-radius-empty]
[fixture: quadrant/gram-style-radius-leading-colon]
[fixture: quadrant/gram-style-radius-negative]
[fixture: quadrant/gram-style-radius-no-colon]
[fixture: quadrant/gram-style-radius-two-values]
[fixture: quadrant/gram-style-radius-unit]
[fixture: quadrant/gram-style-radius-word]
[fixture: quadrant/gram-style-stroke-width-no-unit]
[fixture: quadrant/gram-style-stroke-width-spaced-unit]
[fixture: quadrant/gram-style-stroke-width-upper-unit]
[fixture: quadrant/gram-style-unknown-key]
[fixture: quadrant/gram-style-upper-case-key]
[fixture: quadrant/gram-style-value-hash]
[fixture: quadrant/spec-quadrant-jison-2981d92b]

## 既知の差異

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  ヘッダー、キーワード、矢印、`:::`、クラス名、
  `classDef` のクラスの名前の中のディレクティブは、ここでは入力を拒否させ、
  mermaid.js
  は部分をつなぎます（[単位の中のディレクティブ](#単位の中のディレクティブ)
  を参照）。
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
  `classDef` のクラスの名前の中の、行の規則が無視する `;` は、
  ここでは入力を拒否させ、mermaid.js は部分をつなぎます。
  `classDef style:#x;y color: #f00` は、
  mermaid.js ではクラス `style:#xy` です。
  [fixture: quadrant/div-grid-style-classdef-name]
- **[`comment-takes-character`](../known-divergences/comment-takes-character.ja.md)。**
  1 文字の単位にくっついた `%%` は、
  mermaid.js ではその文字を取ります（[コメント](#コメント) を参照）。
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)。**
  空の文字列、空の markdown 文字列、文の中の空の説明ブロックは、
  ここでは拒否され、mermaid.js はないものとして受理します。
  [空の説明ブロック](#空の説明ブロック) と、
  [空の文字列](#空の文字列) を参照してください。
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)。**
  ヘッダーの後のどこかの、タイトル、アクセシビリティのテキスト、テキスト、
  文字列、クラス名の中の `C4Container`、`C4Component`、`C4Dynamic`、
  `C4Deployment` は、mermaid.js にテキストを C4 のパーサーへ渡させ、
  それが拒否します。
  ここではテキストは quadrant chart です。
  `C4Context` はどちらでもテキストの先頭でだけ数えるので、点の名前です。
  [fixture: quadrant/db-c4-context-in-name]
  [fixture: quadrant/div-c4-keyword-in-acc-title]
  [fixture: quadrant/div-c4-keyword-in-class-name]
  [fixture: quadrant/div-c4-keyword-in-quadrant-text]
  [fixture: quadrant/div-c4-keyword-in-quoted-name]
  [fixture: quadrant/div-c4-keyword-in-title]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)**
  と、
  **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)**
  は、どの図種とも同じく当たります。
  フロントマターに `title: <a` があると、
  `accTitle: b="c">d` は mermaid.js ではアクセシビリティのタイトル `b='c'>d`
  を持ち、正しい YAML でないフロントマターは、mermaid.js では拒否され、
  ここでは受理されます。
  [fixture: quadrant/div-frontmatter-html-tag-starts-in-field]
  [fixture: quadrant/div-frontmatter-invalid-yaml]

既知の差異
[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.ja.md)、
[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.ja.md)、
[`percent-brace-after-unit`](../known-divergences/percent-brace-after-unit.ja.md)
は、この図種には当たりません。
mermaid.js は、ヘッダーの前の `%%` だけの行をコメントとして読み、
そのコメントの規則が `%%` の前で取る改行文字は、
その後の改行文字がしないことを何も変えず、
ディレクティブを始めない `%%{` をコメントとして読むからです。
