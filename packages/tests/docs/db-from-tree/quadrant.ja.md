# 木から quadrant の Db を作る

English version: [quadrant.md](./quadrant.md)

quadrant chart の図の木から Db の要約を作る手順です。
`src/db-from-tree/quadrant.ts` がこれを実装します
（[db-from-tree.md](../db-from-tree.md) を参照）。
構文と木は、仕様の
[diagrams/quadrant.md](../../../spec/docs/diagrams/quadrant.md) と
[ast/quadrant.md](../../../spec/docs/ast/quadrant.md) が定めます。
要約の欄は [db-summaries.md](../db-summaries.md#quadrant) にあります。

mermaid.js は、構文解析のあいだに Db を作ります。
文法は、文が終わるたびに Db を呼びます
（[`statement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L125-L136)）。
Db は、あとの文が変える状態を持ちます。
象限と軸のテキスト、点、クラスです
（[`quadrantDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L30-L110)）。
要約も同じように作ります。
文をソースの順に、同じ状態で実行し、
最後の文を実行したときに Db が持つものが要約になります
（要約が何を残すかは [db-summaries.md](../db-summaries.md#quadrant) を参照）。

## 木から要約を作る

**変換後の形。**
テキストはそれぞれ
[変換後の形](../../../spec/docs/common.md#reading-a-source)で読みます。
文字列とアクセシビリティのテキストの中の各行終端
（`\r\n` と単独の `\r` も）は `\n`、
各属性の引用符は `'`、各エンティティはその代替の文字列です。
ディレクティブ、コメント行、無視される `;` は含まれません。
[fixture: quadrant/db-grid-crlf-x-axis-quoted]
[fixture: quadrant/db-grid-html-x-axis-quoted]
[fixture: quadrant/db-quadrant-entity]
[fixture: quadrant/db-directive-in-quotes]
[fixture: quadrant/db-comment-line-inside-quoted-text]
[fixture: quadrant/db-directive-inside-quoted-multiline]
[fixture: quadrant/db-grid-style-quadrant-quoted]

**テキスト。**
木の欄のテキストは次のように読みます。

- QuadrantLiteral は、範囲の変換後の形で、中の空白を含みます。
  両端の空白はありません。
  タイトル、アクセシビリティのテキスト、座標、スタイルがこのリテラルです。
  [fixture: quadrant/db-acc-title-trimmed]
  [fixture: quadrant/db-point-coordinate-space-in-x]
  [fixture: quadrant/db-acc-descr-block-indented-lines]
- 種類 `text` の QuadrantLabel は、範囲の変換後の形で、語の間の空白を含みます。
  [fixture: quadrant/db-quadrant-spaces-trimmed]
  [fixture: quadrant/db-quadrant-tab-inside]
- 種類 `string` の QuadrantLabel は、範囲の変換後の形の引用符の間にあるものに、
  閉じ引用符の後ろにあるものを続けたものです。
  種類 `markdown` は、文字列の両端の引用符とバッククォートを除いた同じものです。
  引用符が文字列を閉じるかどうかは変換後の形で読み、
  そこでは属性の引用符は `'` です。
  [fixture: quadrant/db-quadrant-quoted]
  [fixture: quadrant/db-quadrant-quoted-newline]
  [fixture: quadrant/db-quadrant-quoted-then-bare]
  [fixture: quadrant/db-quadrant-markdown]
  [fixture: quadrant/db-quadrant-markdown-then-bare]
  [fixture: quadrant/db-x-axis-markdown-multiline]
  [fixture: quadrant/db-x-axis-quoted-glued-text]
- ラベルのテキストは、両端の空白を除き、
  文字の置き換え（後述）をして保たれるので、
  空白だけの文字列は空のテキストです。
  タイトルも同じように保たれ、`accTitle` のテキストもそうです。
  `accDescr` のテキストは、両端の空白を除き、各改行を、
  それに続く空白とともに 1 つの改行にして保たれます。
  [fixture: quadrant/db-x-axis-spaces-only-string]
  [fixture: quadrant/db-quadrant-twice-empty-spaces]
  [fixture: quadrant/db-acc-descr-trimmed]
  [fixture: quadrant/db-acc-descr-block-blank-lines]

**歩き方。**
本体の文をソースの順に実行します。
文は、下の段落が述べるとおりに状態を変え、2 つの文の間にある文は、
その 2 つの文のものを何も変えません。
[fixture: quadrant/db-points-three]

**タイトル。**
タイトルは、mermaid.js が読むフロントマターのタイトルから始まり、
文字の置き換えをして、空白も含みます。
`title` の文がこれを設定し、テキストのない `title` は空のテキストを設定します。
最後のものがタイトルです。
[fixture: quadrant/db-title-frontmatter]
[fixture: quadrant/db-title-frontmatter-and-statement]
[fixture: quadrant/db-title-frontmatter-after-statement]
[fixture: quadrant/db-title-twice]
[fixture: quadrant/db-title-keyword-alone]

**アクセシビリティ。**
`accTitle:` がアクセシビリティのタイトルを設定し、
`accDescr:` とテキストのあるブロックが説明を設定します。
それぞれ最後のものが値です。
テキストのないブロックは、単独でも、行やブロックの後ろにあっても、何も変えず、
その前の説明を保ちます。
`accTitle:` と `accDescr:` のテキストは、
キーワードの後ろで最初にテキストのある行で、リテラルが述べるとおりに読みます。
[fixture: quadrant/db-acc-title-plain]
[fixture: quadrant/db-acc-title-twice]
[fixture: quadrant/db-acc-title-next-line]
[fixture: quadrant/db-acc-descr-plain]
[fixture: quadrant/db-acc-descr-block]
[fixture: quadrant/db-acc-descr-block-lines]
[fixture: quadrant/db-acc-descr-block-empty]
[fixture: quadrant/db-acc-descr-empty-block-keeps-line-braces]
[fixture: quadrant/db-acc-descr-empty-block-keeps-block]
[fixture: quadrant/db-acc-both]

**象限。**
要約は 4 つのテキストを、文の順にかかわらず、象限の順に並べます。
`quadrant-N` の文が象限 N のテキストを設定し、
象限ごとに最後のものがそのテキストです。
[fixture: quadrant/db-quadrant-all-four]
[fixture: quadrant/db-quadrant-reverse-order]
[fixture: quadrant/db-quadrant-3-alone]
[fixture: quadrant/db-quadrant-twice]
[fixture: quadrant/db-quadrant-ten]

**軸。**
軸には、最初のテキスト（x 軸の左、y 軸の下）と、2 つ目のテキスト（右、
上）があります。
テキストが 1 つで矢印のない文は、最初のテキストだけを設定します。
矢印と 2 つ目のテキストのある文は、両方を設定します。
矢印があって 2 つ目のテキストのない文は、
最初のテキストの後ろに ` ⟶` を付けたものを設定し
（テキストにそれを続けて両端の空白を除きます）、2 つ目のテキストはそのままです。
後の文は、名指したものを設定して、残りを保ちます。
[fixture: quadrant/db-x-axis-both]
[fixture: quadrant/db-x-axis-left-only]
[fixture: quadrant/db-x-axis-left-with-arrow]
[fixture: quadrant/db-x-axis-twice]
[fixture: quadrant/db-x-axis-twice-arrow-then-both]
[fixture: quadrant/db-x-axis-twice-arrow-without-right]
[fixture: quadrant/db-x-axis-right-only-after-left]
[fixture: quadrant/db-x-axis-quoted-both]
[fixture: quadrant/db-y-axis-both]
[fixture: quadrant/db-y-axis-bottom-only]

**点。**
点の文は、すでにある点の前に点を加えるので、
要約は点を新しいものから古いものへ並べます。
点は、名前のテキスト、クラス名（ないときは空のテキストで、
その名前のクラスがあるかどうかは問いません）、
書かれたとおりのテキストである 2 つの座標、下のスタイルを持ちます。
[fixture: quadrant/db-point-plain]
[fixture: quadrant/db-points-same-name]
[fixture: quadrant/db-point-long-fraction]
[fixture: quadrant/db-point-coordinate-any-char-x]
[fixture: quadrant/db-name-markdown]
[fixture: quadrant/db-class-plain]
[fixture: quadrant/db-class-undefined]

**スタイル。**
スタイルは、名前、`:`、値として読みます。
名前は最初の `:` の前にあるもので、その末尾の空白を除いたものです。
値は最初の `:` と 2 つ目の `:`（なければ終わり）の間にあるもので、
周りの空白を除いたものなので、
2 つ目の `:` の後ろは捨てられます。
名前 `radius` は値の数、`color` と `stroke-color` は書かれたとおりの値、
`stroke-width` は書かれたとおりの値を、
それぞれキー `radius`、`color`、`strokeColor`、`strokeWidth` に持ちます。
スタイルは書かれた順に入り、2 回書かれた名前は最初の位置と最後の値を持ちます。
有限でない radius（桁が多すぎて double で持てない数）は、
要約では数のテキストです。
[fixture: quadrant/db-style-radius]
[fixture: quadrant/db-style-radius-leading-zeros]
[fixture: quadrant/db-style-radius-overflow]
[fixture: quadrant/db-radius-above-safe-integer]
[fixture: quadrant/db-style-color]
[fixture: quadrant/db-style-stroke-width-leading-zero]
[fixture: quadrant/db-style-two]
[fixture: quadrant/db-style-two-reversed]
[fixture: quadrant/db-style-same-twice]
[fixture: quadrant/db-style-radius-colon-after]
[fixture: quadrant/db-style-color-colon-space-after]
[fixture: quadrant/db-style-space-around]
[fixture: quadrant/db-style-four]

**クラス。**
`classDef` の文は、名前のクラスのスタイルを、
点のスタイルと同じように読んで設定します。
クラスは最後の定義のスタイルだけを持ち、一覧では最初の定義の位置を保ちます。
名前は範囲の変換後の形です。
点とそのクラスのスタイルは併合されず、どの点も使わないクラスも一覧に載ります。
[fixture: quadrant/db-classdef-color]
[fixture: quadrant/db-classdef-twice-replaces]
[fixture: quadrant/db-classdef-two-classes]
[fixture: quadrant/db-classdef-redefine-order]
[fixture: quadrant/db-classdef-three-times-partner]
[fixture: quadrant/db-classdef-point-style-and-class]
[fixture: quadrant/db-classdef-unused]
[fixture: quadrant/db-classdef-dash-name]
[fixture: quadrant/db-grid-nbsp-classdef-name]
[fixture: quadrant/db-classdef-prototype-used]

**要約。**
要約は [db-summaries.md](../db-summaries.md#quadrant) の欄を持ちます。
タイトル、アクセシビリティのタイトルと説明、象限の 4 つのテキスト、2 つの軸、
点、クラスです。
[fixture: quadrant/config-settings-chart]

## 文字の置き換え

Db は、テキストを `sanitizeText` に通します。
タイトル（フロントマターのものと `title` の文のもの）、
アクセシビリティのタイトルと説明、
軸と象限のテキスト、点の名前です。
`quadrantDbOf()` は、
[db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) の置き換え
`textReplacementOf(embedded.config)` を、これらのテキストにだけ適用します。
クラス名、座標、スタイルには及びません。
テキストは、上のように読んだ後に置き換えます。
[fixture: quadrant/config-security-level-other-all]
