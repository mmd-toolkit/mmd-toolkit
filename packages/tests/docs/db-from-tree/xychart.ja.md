# 木から xychart の Db を作る

English version: [xychart.md](./xychart.md)

xychart の図の木から Db の要約を作る手順です。
`src/db-from-tree/xychart.ts` がこれを実装します
（[db-from-tree.md](../db-from-tree.md) を参照）。
構文と木は、仕様の
[diagrams/xychart.md](../../../spec/docs/diagrams/xychart.md) と
[ast/xychart.md](../../../spec/docs/ast/xychart.md) が定めます。
要約の欄は [db-summaries.md](../db-summaries.md#xychart) にあります。

mermaid.js は、構文解析のあいだに Db を作ります。
文法は、文が終わるたびに Db を呼びます
（[`statement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L98-L110)）。
Db は、あとの文が読む状態を持ちます。
軸に範囲やカテゴリーが与えられたかどうかと、
プロットが広げた y 軸の範囲です
（[`xychartDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L26-L38)）。
要約も同じように作ります。
ヘッダーと文をソースの順に、同じ状態で実行し、
最後の文を実行したときに Db が持つものが要約になります
（要約が何を残すかは [db-summaries.md](../db-summaries.md#xychart) を参照）。

## 木から要約を作る

**変換後の形。**
テキストはそれぞれ
[変換後の形](../../../spec/docs/common.md#reading-a-source)で読みます。
文字列とアクセシビリティのテキストの中の各行終端（`\r\n` と単独の `\r` も）は
`\n` に、各属性の引用符は `'` に、各実体はそのプレースホルダーになります。
実体は、文字列とアクセシビリティのテキストが持てます。
ディレクティブ、コメント行、無視される `;` は、変換後の形にありません。
[fixture: xychart/db-title-quoted-crlf]
[fixture: xychart/db-label-quoted-crlf]
[fixture: xychart/db-title-html-tag-in-quotes]
[fixture: xychart/db-label-entity]
[fixture: xychart/db-title-directive-in-quotes]
[fixture: xychart/db-title-quoted-comment-line-inside]
[fixture: xychart/db-title-quoted-directive-line-inside]
[fixture: xychart/db-title-quoted-hash-and-semicolon-apart]
[fixture: xychart/db-plot-title-style-line-semicolon]
[fixture: xychart/db-label-style-line-semicolon]
[fixture: xychart/db-x-axis-band-quoted-style-line-semicolon]

**テキスト。**
木の欄のテキストは、次のように読みます。

- タイトル、軸、カテゴリー、プロットの XychartLiteral は、
  トークンの変換後の形をつないだものを持ちます。
  テキストの単位の間の空白はどのトークンにもないので、値の一部ではなく、
  2 つの単位の間のディレクティブは、2 つをつなぎます。
  `title Two words` のテキストは `Twowords` で、
  `[a%%{x}%%b]` のカテゴリーは `ab` です。
  [fixture: xychart/db-title-bare-words]
  [fixture: xychart/db-x-axis-band-words]
  [fixture: xychart/db-x-axis-title-words]
  [fixture: xychart/db-x-axis-band-directive-in-word]
- アクセシビリティの文の XychartLiteral は、
  範囲の変換後の形を、文字の間の空白も含めて持ちます。
  [fixture: xychart/db-acc-title]
  [fixture: xychart/db-acc-descr]
  [fixture: xychart/db-acc-title-takes-next-line]
- StringLiteral は、引用符の間にあるものの変換後の形を持ちます。
  木のテキストは書かれたままのものです。
  [fixture: xychart/db-title-quoted]
  [fixture: xychart/db-title-quoted-line-feed]
- 数は、その範囲の変換後の形から `Number()` が作る数です。
  `+1` は 1、`.5` は 2 分の 1、`007` は 7 で、
  double に収まらない大きさの数は `Infinity` です。
  `-0` は -0 で、JSON に -0 はないので、要約では 0 になります
  （JSON にないほかの数 `NaN`、`Infinity`、`-Infinity` は、数のテキストです）。
  数の中のディレクティブは、その前後の桁をつなぎます。
  [fixture: xychart/db-plot-values-decimal]
  [fixture: xychart/db-plot-values-leading-zeros]
  [fixture: xychart/db-plot-values-negative-zero]
  [fixture: xychart/db-plot-values-overflow]
  [fixture: xychart/db-plot-directive-in-number]
- タイトル、軸、カテゴリー、プロット、ラベルのテキストは、
  両端の空白を除いてから、文字の置き換え（下記）をして持ちます。
  `accTitle` のテキストも同じように持ちます。
  `accDescr` のテキストは両端の空白を除き、
  各改行だけは、続く空白と一緒に 1 つの改行にして持ちます。
  [fixture: xychart/db-title-quoted-spaces-trimmed]
  [fixture: xychart/db-plot-title-trimmed]
  [fixture: xychart/db-label-spaces-trimmed]
  [fixture: xychart/db-acc-title-spaces-trimmed]
  [fixture: xychart/db-acc-descr-block]

**歩き方。**
ヘッダーを順に実行し、次に body の文をソースの順に実行します。
文は、下の各段落のとおりに状態を変えます。
ほかの 2 つの文の間にある文は、その 2 つの文の何も変えません。
[fixture: xychart/db-semicolon-statements]
[fixture: xychart/db-statement-blank-lines]

**ヘッダー。**
向きは、設定（`embedded.config` の `xyChart.chartOrientation`）の向きで始まり、
設定が別の値にしない限り `vertical` です。
向きを持つヘッダーは、向きを決めます。
小文字の向きの語 `horizontal` は `horizontal` に、
それ以外の語は、どの大文字小文字でも `vertical` にします。
向きのないヘッダーは向きを変えないので、
向きを持つヘッダーは設定より優先し、
向きのない 2 つ目のヘッダーは、1 つ目が決めたものを変えません。
[fixture: xychart/config-orientation-setting-horizontal]
[fixture: xychart/config-orientation-directive]
[fixture: xychart/config-orientation-frontmatter]
[fixture: xychart/config-orientation-header-wins]
[fixture: xychart/config-orientation-frontmatter-header-wins]
[fixture: xychart/db-orientation-horizontal]
[fixture: xychart/db-orientation-capitalized]
[fixture: xychart/db-orientation-upper-case]
[fixture: xychart/db-orientation-vertical-upper-case]
[fixture: xychart/header-second-with-orientation]
[fixture: xychart/header-twice]

**タイトル。**
タイトルは、mermaid.js が読むとおりのフロントマターのタイトルで始まります。
文字の置き換えをし、空白はそのまま残します。
`title` 文がタイトルを決め、最後の `title` 文がタイトルになります。
[fixture: xychart/db-title-frontmatter]
[fixture: xychart/db-title-frontmatter-spaces]
[fixture: xychart/db-title-frontmatter-and-statement]
[fixture: xychart/db-title-twice]
[fixture: xychart/db-title-at-end-of-text]

**x 軸。**
x 軸は、カテゴリーもタイトルもない band です。
カテゴリーを持つ文は、軸にそのカテゴリーを順に与えて band にします。
範囲を持つ文は、書かれた順の数でその範囲を与えて linear の軸にします。
どちらでも、軸はそれで与えられたことになり、プロットは範囲を与えません。
文のタイトルが軸のタイトルで、文にタイトルがなければ空のテキストです。
そのため `x-axis [b]` は、`x-axis T [a]` が決めたタイトルをなくします。
タイトルだけの文は、タイトルだけを決め、カテゴリーや範囲はそのままです。
あとの文が、前の文を置き換えます。
[fixture: xychart/db-x-axis-band-title]
[fixture: xychart/db-x-axis-range]
[fixture: xychart/db-x-axis-range-title]
[fixture: xychart/db-x-axis-title-bare-word]
[fixture: xychart/db-x-axis-title-then-glued-range]
[fixture: xychart/db-x-axis-twice]
[fixture: xychart/db-x-axis-twice-title-cleared]
[fixture: xychart/db-x-axis-range-then-band]
[fixture: xychart/db-data-range-reversed]

**y 軸。**
y 軸は、タイトルのない linear の軸で、
ここまでのプロットの範囲を持ちます
（プロットが現れるまでは、`Infinity` から `-Infinity` の空の範囲です）。
範囲を持つ文は、書かれた順の数でその範囲を軸に与え、
それ以後、プロットはその範囲を広げません。
その前に加えたプロットが広げた範囲は、文の範囲に置き換わります。
タイトルは x 軸と同じに決まります。
[fixture: xychart/db-y-axis-range-title]
[fixture: xychart/db-y-axis-title-only-then-range]
[fixture: xychart/db-y-axis-twice]
[fixture: xychart/db-y-axis-no-range-no-plot]
[fixture: xychart/db-y-axis-before-plot]
[fixture: xychart/db-y-axis-after-plot]

**プロット。**
プロットの文は、種類、タイトル（なければ空のテキスト）、下のペアを持つ
プロットを加えます。
ペアは文を実行したときに、そのときの軸から作るので、
プロットは、あとに来る軸で変わりません。
[fixture: xychart/db-line-values]
[fixture: xychart/db-bar-values]
[fixture: xychart/db-data-band-after-plot]
[fixture: xychart/db-data-band-after-plot-longer]
[fixture: xychart/db-data-range-after-plot]

**ペア。**
プロットのペアは、その値から、次の手順で順に作ります。

1. カテゴリーも範囲も与えられていない x 軸には、
   1 から値の数までの範囲を与えます。
   あとのプロットは、値が長くても短くても、その範囲を変えません。
   [fixture: xychart/db-data-no-axis-bar-and-line]
   [fixture: xychart/db-data-longer-second-plot]
   [fixture: xychart/db-data-shorter-second-plot]
2. band の軸では、カテゴリーの数を超える値を切り捨て、
   以降の手順は、その値を見ません。
   [fixture: xychart/db-data-band-more-values]
   [fixture: xychart/db-data-y-range-band-truncation]
3. y 軸に範囲が与えられるまで、y 軸の範囲は、残った値を含むように広がります。
   最小は、これまでの最小と残った値の最小のうちの小さいほう、
   最大は、これまでの最大と残った値の最大のうちの大きいほうです。
   [fixture: xychart/db-data-y-range-from-plots]
   [fixture: xychart/db-data-y-range-single-value]
   [fixture: xychart/db-data-y-range-negative-zero]
   [fixture: xychart/db-data-band-two-plots]
4. band の軸では、ペアはカテゴリーで、それぞれにその位置の値が付きます。
   プロットの値がカテゴリーより少ないところには、値がありません。
   [fixture: xychart/db-data-band-equal]
   [fixture: xychart/db-data-band-fewer-values]
5. linear の軸で値が 1 つなら、ペアは、範囲の始まりの数のテキストとその値です。
   値が複数なら、刻みは「終わり − 始まり」を「値の数 − 1」で割ったものです。
   位置 `i` のペアは、数 `始まり + i × 刻み` のテキストと位置 `i` の値で、
   浮動小数点で計算し、JavaScript が数を書くとおりに書きます。
   大きい数から小さい数へ書いた範囲の刻みは、負になります。
   [fixture: xychart/db-data-range-one-value]
   [fixture: xychart/db-data-range-three]
   [fixture: xychart/db-data-range-fractions]
   [fixture: xychart/db-data-range-reversed]

**ラベル。**
値のラベルは、上のとおり読んだ文字列で、なければ空のテキストです。
line は、読んだあとのラベルの 1 つでも空でなければ、
ラベルを `pointLabels` として持ち、そのときは空のものも含めてすべてを持ちます。
ラベルは、band の軸がペアから切り捨てる値も含め、すべての値から取ります。
ラベルのない line、空のラベルだけの line、bar は、ラベルを持ちません。
[fixture: xychart/db-label-one]
[fixture: xychart/db-label-all]
[fixture: xychart/db-label-on-bar]
[fixture: xychart/db-label-empty-string]
[fixture: xychart/db-label-beyond-categories]

**アクセシビリティ。**
`accTitle` はアクセシビリティのタイトルを、
同じ行にテキストのある `accDescr` とテキストのあるブロックは説明を決めます。
それぞれ最後のものが値です。
どちらの文でも、テキストが null のとき（テキストの終わりで起こります）は
空のテキストを決めますが、閉じたテキストのないブロックは何も変えず、
その前の説明を残します。
閉じないブロックは、テキストがあってもなくても、空の説明を決めます。
ブロックはテキストの終わりまで続き、
字句解析器がそこでもう 1 つ空のテキストを返し、それが最後の説明になるためです。
[fixture: xychart/db-acc-descr-unclosed-block]
[fixture: xychart/db-acc-descr-unclosed-block-after-value]
[fixture: xychart/db-acc-descr-unclosed-empty-block-after-line]
[fixture: xychart/db-acc-descr-unclosed-empty-block-spaces]
[fixture: xychart/db-acc-descr-unclosed-empty-block-line-feeds]
[fixture: xychart/db-acc-title]
[fixture: xychart/db-acc-title-empty]
[fixture: xychart/db-acc-title-empty-at-end-after-value]
[fixture: xychart/db-acc-descr-empty-at-end-after-value]
[fixture: xychart/db-acc-descr]
[fixture: xychart/db-acc-descr-block]
[fixture: xychart/db-acc-descr-block-empty]
[fixture: xychart/db-acc-descr-line-then-empty-block]
[fixture: xychart/db-acc-descr-block-then-empty-block]

**要約。**
要約の欄は [db-summaries.md](../db-summaries.md#xychart) のとおりです。
向き、タイトル、アクセシビリティのタイトルと説明、2 つの軸、
ソースの順のプロットです。
軸の範囲は数で、有限でない数は、その数のテキストです。
[fixture: xychart/db-data-everything]
[fixture: xychart/db-data-xy-title-and-plots]

## 文字の置き換え

Db は、次のテキストを `sanitizeText` に通します。
タイトル（フロントマターと `title` 文）、アクセシビリティのタイトルと説明、
軸のタイトル、カテゴリー、プロットのタイトル、
line が持つ値のラベルです。
`xychartDbOf()` は、これらのテキストにだけ、
[db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) の置き換え
`textReplacementOf(embedded.config)` を適用します。
向きと数には届きません。
テキストは、上のとおり読んでから置き換えます。
[fixture: xychart/config-security-level-other-all]
[fixture: xychart/config-security-level-other-orientation-horizontal]
[fixture: xychart/config-security-level-other-html-labels-false]
[fixture: xychart/config-security-level-other-flowchart-html-labels-false]
[fixture: xychart/config-security-level-loose-all]
[fixture: xychart/config-security-level-sandbox-all]
