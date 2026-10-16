# XY チャートの整形規則

英語版: [xychart.md](./xychart.md)

prettier-plugin-mmd が XY チャートをどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各規則でその条件を説明します。
XY チャートは、ヘッダーと、その後に続く文でできています。
文は区切りを要さず、1 行に複数の文を書けます。
空白の多くは Db に入らないので、多くの規則は形を選ぶものです。
ただし、引用符なしの文字列の 2 つの単位が接しているかどうかは、
読みに入ります。
その箇所は各規則で説明します。

各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
fixture の置き方と確かめ方は、
[文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### インデント

ヘッダーの後の文と、その間のコメント行は、ヘッダーより 1 段深く置きます。
1 段は Prettier の `useTabs` と `tabWidth` の指定どおりで、
既定は空白 2 つです。
入力に書かれた字下げは残しません。
行頭の空白は mermaid.js にとって何の意味も持たないので、
字下げは構造だけで決め、どのテキストも 1 つの形になります。
文法は文の字下げを禁じていません（sankey とは違います）。
mermaid.js の文書も、ヘッダーの後の文を 1 段深く書き、
ほかの図も同じです
（flowchart の[字下げ](./flowchart.ja.md#字下げ)を参照）。
ヘッダーと、その前のコメント行は 1 列目に置きます。
[fixture: indentation/statements-one-level-deeper]
[fixture: indentation/written-indentation-dropped]
[fixture: indentation/header-leading-whitespace]
[fixture: indentation/tab-width-4]
[fixture: indentation/use-tabs]
[fixture: indentation/comment-lines-at-the-level-of-the-next-statement]
[fixture: indentation/comment-before-the-header-at-the-first-column]
[fixture: indentation/description-block-lines-kept]

入力
([indentation/statements-one-level-deeper-input.mmd](../tests/fixtures/xychart/indentation/statements-one-level-deeper-input.mmd)):

```mmd
xychart
title T
   x-axis [a]
 line [1]
```

出力
([indentation/statements-one-level-deeper-output.mmd](../tests/fixtures/xychart/indentation/statements-one-level-deeper-output.mmd)):

```mmd
xychart
  title T
  x-axis [a]
  line [1]
```

### 1 行 1 文

どの文も、自分の行に置きます。
XY チャートでは、文の間に何も要りません
（diagrams/xychart.md、Diagram and statements）。
そのため、`title T line [1]`、`x-axis [a] line [1]`、`line [1]bar [2]` や、
ヘッダーの行でヘッダーの後に続く文は、1 行に複数の文があります。
1 行に 2 つの文があると読みにくいので、それぞれ自分の行に移します。
ほかの図も同じです
（[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)を参照）。
ヘッダーの向きは、ヘッダーの行に残します
（[ヘッダーと向き](#ヘッダーと向き)を参照）。
行の中で 2 つの文の間にある指令は、後ろの文と一緒に動きます。
`;` は、改行と同じに文を終わらせます。
文を別々の行に置けば、何も区切らなくなるので、落とします。
先頭にあるとき、続けて 2 つあるとき、最後にあるときも同じです。
[fixture: statements-one-per-line/header-then-title]
[fixture: statements-one-per-line/header-orientation-then-title]
[fixture: statements-one-per-line/title-then-plot]
[fixture: statements-one-per-line/axis-then-plot]
[fixture: statements-one-per-line/statements-touching]
[fixture: statements-one-per-line/plot-then-accessibility]
[fixture: statements-one-per-line/description-block-then-statement]
[fixture: statements-one-per-line/empty-description-block-then-statement]
[fixture: statements-one-per-line/axis-statements-after-a-title]
[fixture: statements-one-per-line/semicolon-between-statements-dropped]
[fixture: statements-one-per-line/semicolons-at-the-start-twice-and-at-the-end-dropped]
[fixture: statements-one-per-line/semicolon-after-the-header-dropped]
[fixture: statements-one-per-line/semicolon-line-alone-dropped]
[fixture: directives/directive-after-the-header-then-statement]
[fixture: statements-one-per-line/directive-between-two-statements-moves-with-the-next]

行の規則が読む `;` がある行では、文を動かしません。
mermaid.js の行の規則は、`style` か `classDef`、その後の `:`、
その後の、`:` との間に空白のない `#`、その後の `;` を持つ行の、
最後の `;` を取り除きます。
文字列やアクセシビリティのテキストの中に、そのような行を書けます。
そこから文を動かしたり、`;` を落としたりすると、
どの `;` が最後かが変わり、テキストも変わります。
`title "style:#c;d" line [1];` は、文を別々の行に置いて `;` を落とすと、
別の title になります。
そのような行の文はその行に残し、文の間の空白はほかと同じに整え、
ただし `:` とその後の `#` の間の空白は、あるかないかを保ちます
（flowchart の[セミコロン](./flowchart.ja.md#セミコロン)を参照）。
`;` は書かれたままにします
（[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照）。
その行がヘッダーの行であるときは、文はヘッダーの行に残ります。
行の末尾にある、規則が無視する `;` は落とします。
印字した行には規則が読む `;` がないので、
その空白はほかと同じに整えます。
[fixture: statements-one-per-line/line-rule-line-with-a-dropped-semicolon-formats-the-gap]
[fixture: statements-one-per-line/line-rule-line-kept-together]
[fixture: statements-one-per-line/line-rule-line-after-the-header-kept-together]
[fixture: statements-one-per-line/line-rule-line-gap-between-colon-and-hash-touching-kept]
[fixture: statements-one-per-line/line-rule-line-gap-between-colon-and-hash-becomes-one-space]

mermaid.js は、数字を含む引用符なしの title が軸の文の後ろに続くと、
拒否することがあります。
軸の文と同じ行にあるとき、`;` の後ろにあるとき、
それらの行の後の行にあるときです
（既知の差異 `title-digit-after-axis-statement`）。
仕様はそれを受理し、mermaid.js も、自分の行に置いた同じ title は受理します。
そのため、`x-axis A; title Q1` を分けると、
mermaid.js が拒否していた入力が、
仕様の読みの Db のまま受理されるようになります。
規則はこの行でも変えません。
整形が守るのは、mermaid.js が受理する入力の Db で、
受理する入力が、分けたことで別の読みになることはありません。
[fixture: statements-one-per-line/axis-then-title-with-a-digit-split]
[fixture: statements-one-per-line/axis-band-then-title-with-a-digit-split]
[fixture: statements-one-per-line/range-then-title-with-a-digit-split]

入力
([statements-one-per-line/header-orientation-then-title-input.mmd](../tests/fixtures/xychart/statements-one-per-line/header-orientation-then-title-input.mmd)):

```mmd
xychart horizontal title T
line [1]
```

出力
([statements-one-per-line/header-orientation-then-title-output.mmd](../tests/fixtures/xychart/statements-one-per-line/header-orientation-then-title-output.mmd)):

```mmd
xychart horizontal
  title T
  line [1]
```

入力
([statements-one-per-line/statements-touching-input.mmd](../tests/fixtures/xychart/statements-one-per-line/statements-touching-input.mmd)):

```mmd
xychart
line [1]bar [2]
title "T"line [3]
```

出力
([statements-one-per-line/statements-touching-output.mmd](../tests/fixtures/xychart/statements-one-per-line/statements-touching-output.mmd)):

```mmd
xychart
  line [1]
  bar [2]
  title "T"
  line [3]
```

入力
([statements-one-per-line/line-rule-line-kept-together-input.mmd](../tests/fixtures/xychart/statements-one-per-line/line-rule-line-kept-together-input.mmd)):

```mmd
xychart
title "style:#c;d" line [1];
```

出力
([statements-one-per-line/line-rule-line-kept-together-output.mmd](../tests/fixtures/xychart/statements-one-per-line/line-rule-line-kept-together-output.mmd)):

```mmd
xychart
  title "style:#c;d" line [1];
```

### 空行

連続する空行は 1 つの空行にします。
ヘッダーと最初の文の間にも、テキストの最後にも、空行は置きません。
空行は、Db に入らない書き手の選択で、
1 つの空行がそれを最小の手間で示します。
Prettier がコードでそうするのと同じです
（[空行](./flowchart.ja.md#空行)を参照）。
[fixture: blank-lines/runs-become-one]
[fixture: blank-lines/none-after-the-header]
[fixture: blank-lines/none-at-the-end]
[fixture: blank-lines/one-kept-between-statements]
[fixture: blank-lines/around-comment-lines]
[fixture: blank-lines/whitespace-only-lines]
[fixture: blank-lines/after-a-description-block]

入力
([blank-lines/runs-become-one-input.mmd](../tests/fixtures/xychart/blank-lines/runs-become-one-input.mmd)):

```mmd
xychart
title A



line [1]
```

出力
([blank-lines/runs-become-one-output.mmd](../tests/fixtures/xychart/blank-lines/runs-become-one-output.mmd)):

```mmd
xychart
  title A

  line [1]
```

### ヘッダーと向き

ヘッダーは書かれたままに印字します。
`xychart` か `xychart-beta` で、大文字小文字も書かれたままです。
mermaid.js はどちらも同じ図種として読むので、
綴りは印字側ではなく書き手のものです。
2 つ目以降のヘッダーは自分の行に置き、取り除きません。
向きを持つ後のヘッダーは向きを変え、向きのないものは何も変えませんが、
書かれたテキストは書き手のものだからです。
改行をつなぐ所にコメント行か指令があるヘッダーは、書かれたまま残します
（[複数行の文](#複数行の文)を参照）。
[fixture: header-and-orientation/plain-header]
[fixture: header-and-orientation/beta-header-kept]
[fixture: header-and-orientation/header-only]
[fixture: header-and-orientation/vertical-kept]
[fixture: header-and-orientation/second-header-on-its-own-line]
[fixture: header-and-orientation/second-header-without-orientation-kept]
[fixture: header-and-orientation/second-header-on-the-line-of-the-first]
[fixture: header-and-orientation/second-header-spelling-and-case-kept]
[fixture: header-and-orientation/trailing-whitespace-dropped]
[fixture: header-and-orientation/comment-after-the-header]
[fixture: header-and-orientation/comment-glued-to-the-header]
[fixture: header-and-orientation/directive-after-the-header]
[fixture: header-and-orientation/directive-glued-to-the-header]
[fixture: header-and-orientation/comment-line-between-the-header-and-the-orientation-kept]
[fixture: multi-line-statements/header-orientation-joined]
[fixture: header-and-orientation/directive-line-between-the-header-and-the-orientation-kept]

向きは、ヘッダーの行に、空白 1 つの後ろに置きます。
mermaid.js は向きを、あらゆる種類の空白の後でも、
空白と改行の後でも読みます。
改行は字句解析器にとって空白なので、向きはヘッダーの行に移し、
誰にも見えない行末の空白を残しません
（[複数行の文](#複数行の文)を参照）。
向きは書かれた大文字小文字のまま印字します。
小文字の `horizontal` だけが横向きにし、
`Horizontal` は縦向きにするので、大文字小文字は Db に入っています。
[fixture: header-and-orientation/orientation-after-one-space]
[fixture: header-and-orientation/orientation-after-a-tab]
[fixture: header-and-orientation/orientation-on-the-next-line-joined]
[fixture: header-and-orientation/orientation-on-the-next-line-after-a-tab]
[fixture: header-and-orientation/orientation-case-kept]
[fixture: header-and-orientation/orientation-upper-case-kept]
[fixture: header-and-orientation/orientation-and-comment]

入力
([header-and-orientation/second-header-on-its-own-line-input.mmd](../tests/fixtures/xychart/header-and-orientation/second-header-on-its-own-line-input.mmd)):

```mmd
xychart
xychart horizontal
line [1]
```

出力
([header-and-orientation/second-header-on-its-own-line-output.mmd](../tests/fixtures/xychart/header-and-orientation/second-header-on-its-own-line-output.mmd)):

```mmd
xychart
  xychart horizontal
  line [1]
```

入力
([header-and-orientation/orientation-after-one-space-input.mmd](../tests/fixtures/xychart/header-and-orientation/orientation-after-one-space-input.mmd)):

```mmd
xychart  horizontal
line [1]
```

出力
([header-and-orientation/orientation-after-one-space-output.mmd](../tests/fixtures/xychart/header-and-orientation/orientation-after-one-space-output.mmd)):

```mmd
xychart horizontal
  line [1]
```

### テキストの単位

引用符なしの文字列（title、軸の title、プロットの title、分類）は、
単位でできています。
単位は、文字の連なり、数字の連なり、
`-`、`_`、`.`、`+`、`=`、`*`、`&`、`#` の 1 文字のどれかです。
単位の間の空白は Db に入らない
（`title Two   words` も `title Two words` も title は `Twowords`）ので、
空白の連なりは空白 1 つにします。
接している単位は、接したままにします。
単位が接しているかどうかは読みに入るからです。
キーワードは、後ろに単語の文字が続かないときだけキーワードなので、
`x-axis Title1 --> 5` の title は `Title` で、その後ろが範囲ですが、
`x-axis Title 1 --> 5` は、`Title` がキーワードになるので拒否されます。
`x-axis a-1 --> 2` の title は `a` で、範囲は数 `-1` から始まります。
`-` と `1` の間に空白を置くと、単語 `-` と数 `1` になり、別の図になります。
離れている単位も、つなげません。
`title ba r` の title は `bar` ですが、
`title bar` は、`bar` がキーワードなので違います。
そのため、印字が変えるのは空白の量だけで、
単位を離しておく最小の量が空白 1 つです。
軸の title とその後ろのデータの間、分類の単語の間も同じです。
[fixture: text-units/title-words-apart]
[fixture: text-units/title-words-apart-by-a-tab]
[fixture: text-units/words-touching-kept]
[fixture: text-units/words-and-a-hash-apart-and-touching]
[fixture: text-units/axis-title-words-apart]
[fixture: text-units/plot-title-words-apart]
[fixture: text-units/plot-title-digits-touching-kept]
[fixture: text-units/category-words-apart]
[fixture: text-units/category-digits-touching-kept]
[fixture: text-units/title-then-range-touching-kept]
[fixture: text-units/title-then-range-apart]
[fixture: text-units/hyphen-and-number-touching-kept]
[fixture: text-units/hyphen-and-number-apart-kept]
[fixture: text-units/directive-between-words-touching]
[fixture: text-units/directive-between-words-apart]
[fixture: text-units/directive-between-words-on-one-side]
[fixture: text-units/directive-inside-a-category-word]

テキストの前後の空白は、Db に入らないので落とします。
[fixture: text-units/whitespace-at-the-ends-dropped]

入力
([text-units/title-words-apart-input.mmd](../tests/fixtures/xychart/text-units/title-words-apart-input.mmd)):

```mmd
xychart
title   Two    words
```

出力
([text-units/title-words-apart-output.mmd](../tests/fixtures/xychart/text-units/title-words-apart-output.mmd)):

```mmd
xychart
  title Two words
```

入力
([text-units/title-then-range-touching-kept-input.mmd](../tests/fixtures/xychart/text-units/title-then-range-touching-kept-input.mmd)):

```mmd
xychart
x-axis Title1 --> 5
x-axis T1-->2
```

出力
([text-units/title-then-range-touching-kept-output.mmd](../tests/fixtures/xychart/text-units/title-then-range-touching-kept-output.mmd)):

```mmd
xychart
  x-axis Title1 --> 5
  x-axis T1 --> 2
```

### 角括弧とコンマ

分類と値は、角括弧の間に置きます。
`[` の前は、キーワードや title の後ろに空白 1 つを置きます。
`x-axis[a]`、`line T[1]`、`bar"Costs"[1,2]` のように、
接して書かれていても同じです。
`[` の後と `]` の前に空白は置きません。
コンマの前に空白は置かず、後ろに空白 1 つを置きます（`[jan, feb, mar]`）。
キーワードとその後ろの文字列も、同じに空白 1 つで離します
（`title"T"` は `title "T"` と印字します）。
この空白はどれも Db に入らず、単位の読みも変えません。
角括弧、コンマ、引用符は単語の文字ではないからです。
そのため、この形は選択です。
mermaid.js の文書の例の多くがこの形で
（`[jan, feb, mar]`、`[5000, 6000, 7500]`）、
コンマの後に空白がない例もあります（`[12,2,20,25,17,24]`）が、
どのチャートでも形が 1 つのほうが、2 つあるより読みやすくなります。
コンマの後の空白は、英文の読みでもあります。
[fixture: brackets-and-commas/spaces-inside-and-around-commas]
[fixture: brackets-and-commas/bracket-touching-the-keyword]
[fixture: brackets-and-commas/bracket-touching-the-title]
[fixture: brackets-and-commas/bracket-touching-a-string]
[fixture: brackets-and-commas/values-with-spaces]
[fixture: brackets-and-commas/values-with-tabs]
[fixture: brackets-and-commas/quoted-categories]
[fixture: brackets-and-commas/one-category-and-one-value]
[fixture: brackets-and-commas/keyword-and-string-one-space]
[fixture: brackets-and-commas/keyword-and-words-one-space]
[fixture: brackets-and-commas/comma-after-a-string-category]

入力
([brackets-and-commas/spaces-inside-and-around-commas-input.mmd](../tests/fixtures/xychart/brackets-and-commas/spaces-inside-and-around-commas-input.mmd)):

```mmd
xychart
x-axis [ jan ,feb,  mar ]
```

出力
([brackets-and-commas/spaces-inside-and-around-commas-output.mmd](../tests/fixtures/xychart/brackets-and-commas/spaces-inside-and-around-commas-output.mmd)):

```mmd
xychart
  x-axis [jan, feb, mar]
```

入力
([brackets-and-commas/bracket-touching-a-string-input.mmd](../tests/fixtures/xychart/brackets-and-commas/bracket-touching-a-string-input.mmd)):

```mmd
xychart
x-axis"T"[a]
bar"Costs"[1,2]
```

出力
([brackets-and-commas/bracket-touching-a-string-output.mmd](../tests/fixtures/xychart/brackets-and-commas/bracket-touching-a-string-output.mmd)):

```mmd
xychart
  x-axis "T" [a]
  bar "Costs" [1, 2]
```

### 範囲

範囲の矢印は、前後に空白 1 つを置きます（`4000 --> 11000`）。
接して書かれていても（`4000-->11000`）、空白がいくつあっても同じです。
矢印の周りの空白は Db に入りません。
符号の有無によらず、矢印に接した数が矢印の一部と読まれることもありません
（`1-->-2` と `1 --> -2` は同じ範囲です）。
mermaid.js の文書は、矢印を空白つきで書いています。
範囲の前にある引用符なしの title は、
[テキストの単位](#テキストの単位)に従います。
接して書かれていれば範囲に接したまま（`x-axis Title1 --> 5`）、
そうでなければ空白 1 つで離します。
[fixture: ranges/arrow-touching]
[fixture: ranges/arrow-with-more-whitespace]
[fixture: ranges/arrow-touching-on-one-side]
[fixture: ranges/negative-end-after-the-arrow]
[fixture: ranges/range-after-a-string-title]
[fixture: ranges/range-after-the-keyword]
[fixture: ranges/empty-string-title-before-a-range]

入力
([ranges/arrow-touching-input.mmd](../tests/fixtures/xychart/ranges/arrow-touching-input.mmd)):

```mmd
xychart
y-axis Revenue 4000-->11000
x-axis 0-->10
```

出力
([ranges/arrow-touching-output.mmd](../tests/fixtures/xychart/ranges/arrow-touching-output.mmd)):

```mmd
xychart
  y-axis Revenue 4000 --> 11000
  x-axis 0 --> 10
```

### 値とラベル

値とその後ろのラベルは、空白 1 つで離します（`20 "peak"`）。
接して書かれていても（`10"peak"`）同じです。
ラベルの後ろのコンマの前に、空白は置きません。
mermaid.js は、ラベルが値に接していても離れていても同じに読むので、
この形は選択です。
空白 1 つは、mermaid.js の文書が使う形（`25 "Launch"`）で、
キーワードと文字列の区切りと同じです
（[角括弧とコンマ](#角括弧とコンマ)を参照）。
[fixture: values-and-labels/label-touching-the-value]
[fixture: values-and-labels/label-with-more-whitespace]
[fixture: values-and-labels/empty-label]
[fixture: values-and-labels/label-on-a-line]

入力
([values-and-labels/label-touching-the-value-input.mmd](../tests/fixtures/xychart/values-and-labels/label-touching-the-value-input.mmd)):

```mmd
xychart
bar [10"peak"]
line [1"a", 2"b"]
```

出力
([values-and-labels/label-touching-the-value-output.mmd](../tests/fixtures/xychart/values-and-labels/label-touching-the-value-output.mmd)):

```mmd
xychart
  bar [10 "peak"]
  line [1 "a", 2 "b"]
```

### 数

数は書かれたままに印字します。
範囲の数とプロットの値は、値として読まれるので、
`+1`、`007`、`.5`、`-0`、`1.50` は、別の形に書いても Db は同じです。
ところが、分類や引用符なしの title に書かれた同じ数字はテキストなので
（`x-axis [007, .5]` の分類は `007` と `.5`）、変えるとチャートが変わります。
数だけを正規化すると、同じ数字が 1 つのチャートに 2 通りに綴られます。
そのため、数は書き手のテキストとして残します。
sankey の値の扱いと同じです
（[値](./sankey.ja.md#値)を参照）。
[fixture: numbers/range-numbers-as-written]
[fixture: numbers/values-as-written]
[fixture: numbers/categories-are-texts]
[fixture: numbers/titles-are-texts]

入力
([numbers/values-as-written-input.mmd](../tests/fixtures/xychart/numbers/values-as-written-input.mmd)):

```mmd
xychart
line [.5, 007, -0, 1.50, +3]
```

出力
([numbers/values-as-written-output.mmd](../tests/fixtures/xychart/numbers/values-as-written-output.mmd)):

```mmd
xychart
  line [.5, 007, -0, 1.50, +3]
```

### 引用符

文字列は書かれたままに印字します。
引用符、テキスト、中の空白、中の改行を残します。
引用符は、足しも取りもしません。
`"Sales"` と `Sales` は Db が同じですが、
`"a b"` と `a b` は違います（後者のテキストは `ab` です）。
空の文字列は、mermaid.js にとってはトークンのないものですが、
書き手のテキストです。
そのため、引用符を付けるかどうかは書き手に任せます。
sankey と同じです（[引用符](./sankey.ja.md#引用符)を参照）。
空の文字列は、文法が受け入れる位置にだけ置かれます。
プロットの title、データの前の軸の title、値のラベルです。
[fixture: quotes/strings-as-written]
[fixture: quotes/quotes-not-removed]
[fixture: quotes/quotes-not-added]
[fixture: quotes/keywords-and-markup-in-strings]
[fixture: quotes/comment-mark-in-a-string]
[fixture: quotes/empty-strings-where-the-grammar-takes-them]

入力
([quotes/quotes-not-removed-input.mmd](../tests/fixtures/xychart/quotes/quotes-not-removed-input.mmd)):

```mmd
xychart
title "Sales"
x-axis ["a", "b"]
```

出力
([quotes/quotes-not-removed-output.mmd](../tests/fixtures/xychart/quotes/quotes-not-removed-output.mmd)):

```mmd
xychart
  title "Sales"
  x-axis ["a", "b"]
```

入力
([quotes/empty-strings-where-the-grammar-takes-them-input.mmd](../tests/fixtures/xychart/quotes/empty-strings-where-the-grammar-takes-them-input.mmd)):

```mmd
xychart
line "" [1]
x-axis "" [a]
y-axis "" 0 --> 1
bar [1 ""]
```

出力
([quotes/empty-strings-where-the-grammar-takes-them-output.mmd](../tests/fixtures/xychart/quotes/empty-strings-where-the-grammar-takes-them-output.mmd)):

```mmd
xychart
  line "" [1]
  x-axis "" [a]
  y-axis "" 0 --> 1
  bar [1 ""]
```

### アクセシビリティの文

`accTitle` と `accDescr` の `:` は、キーワードに接し、
後ろに空白 1 つを置きます。
ほかの図と同じです
（[アクセシビリティの文](./journey.ja.md#アクセシビリティの文)を参照）。
テキストの前後に空白は置かず、中の空白は残します。
中の空白は Db に入るからです（`accTitle: a   b` の title は `a   b`）。
後ろの行に書かれたテキスト、キーワードより後ろの行に書かれたコロン、
コロンの前の空白は、1 行にして印字します。
改行は字句解析器にとって空白で、文のテキストは変わりません。
テキストのない `accTitle:` と `accDescr:` が、テキストの最後にあるときは、
キーワードとコロンだけを印字し、後ろに何も置きません。
[fixture: accessibility-statements/colon-touches-keyword]
[fixture: accessibility-statements/colon-without-space-after]
[fixture: accessibility-statements/text-whitespace-dropped]
[fixture: accessibility-statements/text-inner-whitespace-kept]
[fixture: accessibility-statements/special-characters-in-text]
[fixture: accessibility-statements/text-on-the-next-line-joined]
[fixture: accessibility-statements/colon-on-the-next-line-joined]
[fixture: accessibility-statements/text-that-looks-like-a-statement]
[fixture: accessibility-statements/without-text-at-the-end]
[fixture: accessibility-statements/without-text-and-trailing-whitespace]

`accDescr { ... }` ブロックの行は、必要からではなく選択として、
書かれたまま残します。
行頭の空白は Db に入らず、行は書き手のテキストで、印字は整形しないからです。
`}` は文と同じ段に置きます。
`{` と同じ行のテキストは、書かれた括弧の間に空白があれば空白 1 つを置き、
括弧がテキストに接していれば接したままにします。
閉じていないブロックはテキストの最後まで続き、
`}` を足さずに書かれたまま印字します。
mermaid.js はそのブロックのテキストを読まず、
印字が `}` を足すと、ブロックが説明になってしまうからです
（テキストの最後の `accDescr {` と `abc` の説明は Db では空で、
`}` を足すと `abc` になります）。
[fixture: accessibility-statements/block-lines-kept]
[fixture: accessibility-statements/block-text-on-the-opening-line]
[fixture: accessibility-statements/block-closing-brace-at-the-level-of-the-statement]
[fixture: accessibility-statements/block-then-statement-on-the-closing-line]
[fixture: accessibility-statements/block-comment-and-empty-lines-kept]
[fixture: accessibility-statements/block-not-closed-kept-as-written]
[fixture: accessibility-statements/block-not-closed-text-on-the-opening-line]
[fixture: accessibility-statements/block-not-closed-without-text]
[fixture: accessibility-statements/block-not-closed-after-a-statement-on-its-line]
[fixture: accessibility-statements/directive-around-colon-and-braces]

入力
([accessibility-statements/colon-touches-keyword-input.mmd](../tests/fixtures/xychart/accessibility-statements/colon-touches-keyword-input.mmd)):

```mmd
xychart
accTitle : T
accDescr  :  d
```

出力
([accessibility-statements/colon-touches-keyword-output.mmd](../tests/fixtures/xychart/accessibility-statements/colon-touches-keyword-output.mmd)):

```mmd
xychart
  accTitle: T
  accDescr: d
```

入力
([accessibility-statements/text-on-the-next-line-joined-input.mmd](../tests/fixtures/xychart/accessibility-statements/text-on-the-next-line-joined-input.mmd)):

```mmd
xychart
accTitle:
T
accDescr:

  d
```

出力
([accessibility-statements/text-on-the-next-line-joined-output.mmd](../tests/fixtures/xychart/accessibility-statements/text-on-the-next-line-joined-output.mmd)):

```mmd
xychart
  accTitle: T
  accDescr: d
```

入力
([accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/xychart/accessibility-statements/block-lines-kept-input.mmd)):

```mmd
xychart
accDescr {
   a
  b
}
```

出力
([accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/xychart/accessibility-statements/block-lines-kept-output.mmd)):

```mmd
xychart
  accDescr {
   a
  b
  }
```

### 空の説明ブロック

何も変えない空のブロックは、それ自身が 1 つの文で、
トークンの間の空白の規則に従います。
中の空白は、改行を含めて空白 1 つにし、接した括弧は接したままにします。
指令かコメント行を持つブロックは、書かれたまま印字します。
ヘッダーの後でも、ほかの文の後でも、自分の行に置きます。
テキストの最後で閉じていないブロックは、`}` を足さずに `accDescr {` と印字します
（[アクセシビリティの文](#アクセシビリティの文)を参照）。
[fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/touching-kept]
[fixture: empty-description-blocks/blank-lines-inside]
[fixture: empty-description-blocks/with-directive-or-comment-line-kept]
[fixture: empty-description-blocks/after-the-header]
[fixture: empty-description-blocks/after-a-statement-on-its-line]
[fixture: empty-description-blocks/not-closed-at-the-end-of-the-text]

入力
([empty-description-blocks/touching-kept-input.mmd](../tests/fixtures/xychart/empty-description-blocks/touching-kept-input.mmd)):

```mmd
xychart
accDescr{}
accDescr {}
accDescr{ }
```

出力
([empty-description-blocks/touching-kept-output.mmd](../tests/fixtures/xychart/empty-description-blocks/touching-kept-output.mmd)):

```mmd
xychart
  accDescr{}
  accDescr {}
  accDescr{ }
```

入力
([empty-description-blocks/blank-lines-inside-input.mmd](../tests/fixtures/xychart/empty-description-blocks/blank-lines-inside-input.mmd)):

```mmd
xychart
accDescr {


}
```

出力
([empty-description-blocks/blank-lines-inside-output.mmd](../tests/fixtures/xychart/empty-description-blocks/blank-lines-inside-output.mmd)):

```mmd
xychart
  accDescr { }
```

### 複数行の文

mermaid.js が複数行にわたって読む文は、
改行が字句解析器にとって空白である所では 1 行に印字します。
空白の後の改行で、文字列の中、title と角括弧の間、分類、値、範囲、
ラベルの周り、`accTitle:` と `accDescr:` の後が該当します。
改行は空白 1 つに置き換え、行末の空白もそれと一緒に落とします。
空白で終わる行は誰にも見えず、
それによって次の行へ続く文は見落としやすいので、印字は残しません。
ほかの図も同じ規則で文の行をつなぎます
（[複数行の文](./sequence.ja.md#複数行の文)を参照）。
このため、長い行を折ることもしません。
角括弧の中の改行には、誰にも見えない前の空白が要るからです。
[fixture: multi-line-statements/title-over-lines-joined]
[fixture: multi-line-statements/axis-title-and-band-joined]
[fixture: multi-line-statements/axis-keyword-and-band-joined]
[fixture: multi-line-statements/range-over-lines-joined]
[fixture: multi-line-statements/plot-over-lines-joined]
[fixture: multi-line-statements/plot-keyword-and-values-joined]
[fixture: multi-line-statements/text-over-several-line-breaks-joined]
[fixture: multi-line-statements/next-statement-after-trailing-whitespace]

コメント行か指令を含む文は、書かれたまま残します。
コメント行は、置かれた行の残りを取り込むので、
つないだ `title A %% c B` の title は `A` ですが、
コメント行を挟んだ文は `AB` です。
指令を含む行をつないでも Db は変わりません。
それでも、コメント行と指令に同じ判断をするのが、すべての図の決まりで、
印字はそれを 1 度だけ決めます
（[複数行の文](./er.ja.md#複数行の文)を参照）。
`;` を含む文も、行の規則があるので、書かれたまま残します
（[1 行 1 文](#1-行-1-文)を参照）。
[fixture: multi-line-statements/comment-line-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]
[fixture: multi-line-statements/semicolon-inside-kept]
[fixture: multi-line-statements/semicolon-on-the-last-line-kept]

### 複数行の値

`accDescr` ブロックの行と、文字列の行は、改行と中の空白を含めて、
書かれたまま残します。
改行は Db に入り、文字列の空白も入ります。
ブロックの行頭の空白は入らないので、残すのは選択で、
値のテキストは整形しないからです。
[fixture: multi-line-values/string-with-line-breaks-kept]
[fixture: multi-line-values/string-label-with-line-breaks-kept]
[fixture: multi-line-values/category-string-with-line-breaks-kept]
[fixture: multi-line-values/description-block-lines-kept]
[fixture: multi-line-values/comment-line-inside-a-block-kept]

入力
([multi-line-values/string-with-line-breaks-kept-input.mmd](../tests/fixtures/xychart/multi-line-values/string-with-line-breaks-kept-input.mmd)):

```mmd
xychart
title "a
   b"
line [1]
```

出力
([multi-line-values/string-with-line-breaks-kept-output.mmd](../tests/fixtures/xychart/multi-line-values/string-with-line-breaks-kept-output.mmd)):

```mmd
xychart
  title "a
   b"
  line [1]
```

入力
([multi-line-values/description-block-lines-kept-input.mmd](../tests/fixtures/xychart/multi-line-values/description-block-lines-kept-input.mmd)):

```mmd
xychart
accDescr {
  a
    b
}
```

出力
([multi-line-values/description-block-lines-kept-output.mmd](../tests/fixtures/xychart/multi-line-values/description-block-lines-kept-output.mmd)):

```mmd
xychart
  accDescr {
  a
    b
  }
```

### キーワードの大文字小文字

キーワード `title`、`x-axis`、`y-axis`、`line`、`bar`、
`accTitle`、`accDescr` は、書かれた大文字小文字のまま印字します。
mermaid.js はどれも大文字小文字を問わずに読み
（`Title`、`LINE`、`ACCTITLE:` も文を始めます）、Db は同じです。
そのため、大文字小文字は書き手のもので、強制するものはありません。
プロットの種類（`line` か `bar`）は、
書かれた大文字小文字によらず、Db では小文字です。
[fixture: keyword-case/statement-keywords-kept]
[fixture: keyword-case/accessibility-keywords-kept]
[fixture: keyword-case/header-spelling-kept]

入力
([keyword-case/statement-keywords-kept-input.mmd](../tests/fixtures/xychart/keyword-case/statement-keywords-kept-input.mmd)):

```mmd
xychart
Title T
X-AXIS [a]
Y-Axis 0 --> 1
LINE [1]
Bar [2]
```

出力
([keyword-case/statement-keywords-kept-output.mmd](../tests/fixtures/xychart/keyword-case/statement-keywords-kept-output.mmd)):

```mmd
xychart
  Title T
  X-AXIS [a]
  Y-Axis 0 --> 1
  LINE [1]
  Bar [2]
```

### コメント

コメントは、単位が始まる所の `%%` で始まり、行の終わりまで続きます。
単独の行のコメントは、後ろの文と同じ段に置き、
テキストと印は書かれたまま残します。
最後の文の後のコメント行は、その後ろに残ります。
ヘッダーより前のコメント行は 1 列目に置きます。
文字列、アクセシビリティのテキスト、説明ブロックの中の `%%` は、その文字です。
[fixture: comments/comment-line-at-the-level-of-the-next-statement]
[fixture: comments/comment-line-at-the-end]
[fixture: comments/comment-line-before-the-header]
[fixture: comments/comment-line-only]
[fixture: comments/comment-mark-in-an-accessibility-text]
[fixture: comments/comment-marks-and-empty-lines]
[fixture: comments/bare-percent-comment]

文の後ろのコメントは、文の行に残します。
前に空白が書かれていれば空白 1 つ、書かれていなければ接したままにします。
空白がどこにあっても Db は同じですが、
mermaid.js は、1 文字の単位に接した `%%` を、その文字と一緒に読みます
（既知の差異 `comment-takes-character`）。
`title T%% c` は拒否され、`title A B%% c` の title は `A` です。
コメントの前に必ず空白を書く規則は、そのような入力を mermaid.js が読む形を変え、
書き手の誤りを、何も知らせずに別のチャートとして読ませます。
印字はコメントが接しているかどうかを保ち、
報告する場所は lint の規則です。
ほかの図も同じです（[コメント](./journey.ja.md#コメント)を参照）。
[fixture: comments/comment-after-a-statement-spaced]
[fixture: comments/comment-after-a-statement-touching]
[fixture: comments/comment-glued-to-a-one-character-word-kept]
[fixture: comments/comment-glued-to-a-bracket-kept]
[fixture: comments/comment-takes-a-character-kept]
[fixture: comments/comment-after-a-description-block]

入力
([comments/comment-line-at-the-level-of-the-next-statement-input.mmd](../tests/fixtures/xychart/comments/comment-line-at-the-level-of-the-next-statement-input.mmd)):

```mmd
xychart
      %% a
title T
%% b
line [1]
```

出力
([comments/comment-line-at-the-level-of-the-next-statement-output.mmd](../tests/fixtures/xychart/comments/comment-line-at-the-level-of-the-next-statement-output.mmd)):

```mmd
xychart
  %% a
  title T
  %% b
  line [1]
```

入力
([comments/comment-after-a-statement-spaced-input.mmd](../tests/fixtures/xychart/comments/comment-after-a-statement-spaced-input.mmd)):

```mmd
xychart
line [1]   %% c
x-axis [a]  %% d
```

出力
([comments/comment-after-a-statement-spaced-output.mmd](../tests/fixtures/xychart/comments/comment-after-a-statement-spaced-output.mmd)):

```mmd
xychart
  line [1] %% c
  x-axis [a] %% d
```

### 指令

指令は、書かれた場所に残します。
文の単位の間にあっても、文の間にあっても同じです。
両側の空白は、それぞれ、あるかないかを保ちます。
空白が書かれていれば空白 1 つ、接していれば接したままです。
mermaid.js は、引用符なしの文字列と文字列の中の指令の前後を結んで読むので、
指令の隣の空白は動かさず、取り除きもしません
（[ディレクティブ](./journey.ja.md#ディレクティブ)を参照）。
単独の行にある指令は、後ろの文と同じ段に置きます。
[fixture: directives/directive-line-at-the-level-of-the-next-statement]
[fixture: directives/directive-line-before-the-header]
[fixture: directives/directive-after-a-statement-spaced]
[fixture: directives/directive-after-a-statement-touching]
[fixture: directives/directive-before-a-keyword]
[fixture: directives/directive-between-keyword-and-bracket]
[fixture: directives/directive-between-values]
[fixture: directives/directive-between-a-number-and-the-arrow]
[fixture: directives/directive-inside-a-string]
[fixture: directives/directive-in-an-accessibility-text-is-text]
[fixture: directives/directive-over-several-lines]
[fixture: directives/directive-not-closed-at-the-end]
[fixture: directives/directive-and-comment-on-a-line]

入力
([directives/directive-line-at-the-level-of-the-next-statement-input.mmd](../tests/fixtures/xychart/directives/directive-line-at-the-level-of-the-next-statement-input.mmd)):

```mmd
xychart
    %%{init: {}}%%
title T
```

出力
([directives/directive-line-at-the-level-of-the-next-statement-output.mmd](../tests/fixtures/xychart/directives/directive-line-at-the-level-of-the-next-statement-output.mmd)):

```mmd
xychart
  %%{init: {}}%%
  title T
```

入力
([directives/directive-between-keyword-and-bracket-input.mmd](../tests/fixtures/xychart/directives/directive-between-keyword-and-bracket-input.mmd)):

```mmd
xychart
line %%{init: {}}%% [1]
x-axis%%{init: {}}%%[a]
```

出力
([directives/directive-between-keyword-and-bracket-output.mmd](../tests/fixtures/xychart/directives/directive-between-keyword-and-bracket-output.mmd)):

```mmd
xychart
  line %%{init: {}}%% [1]
  x-axis%%{init: {}}%%[a]
```

### フロントマターの YAML

フロントマターは、ほかの図と同じに Prettier が YAML として整形します
（[フロントマターの YAML](./flowchart.ja.md#フロントマターの-yaml)を参照）。
正しい YAML でないフロントマターは、書かれたまま残します。
フロントマターの title と向きの設定は Db に入るので、値には触れません。
[fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/malformed-kept]
[fixture: frontmatter-yaml/orientation-setting]
[fixture: frontmatter-yaml/title-and-statement]
[fixture: frontmatter-yaml/comment-after-frontmatter-before-header]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/xychart/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:
    xyChart:
        width:  900
---
xychart
title X
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/xychart/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config:
  xyChart:
    width: 900
---
xychart
  title X
```

### 行区切り文字

U+2028 と U+2029 は、XY チャートの単位の間の空白で、
文字列とアクセシビリティのテキストの文字です。
文と文の間では、ほかの空白と同じ改行として扱い、
文はそれぞれ自分の行に置きます。
文の中の隙間にあるものは書かれたまま印字します。
ほかの図と同じで、mermaid.js は、
それをすべての規則で空白として読むわけではないからです
（[行区切り文字](./journey.ja.md#行区切り文字)を参照）。
文字列とテキストの中のものは、そのまま残します。
[test: U+2028 between the header and a statement]
[test: U+2028 between two statements]
[test: U+2028 between the header and the orientation]
[test: U+2028 between the words of a title]
[test: U+2029 between the words of a title]
[test: U+2028 after a title keyword]
[test: U+2028 between the words of a category]
[test: U+2028 after a comma of the values]
[test: U+2028 before the bracket of a plot]
[test: U+2028 between a value and its label]
[test: U+2028 around the arrow of a range]
[test: U+2028 in a string]
[test: U+2028 in an accessibility text]
[test: U+2028 after the colon of accTitle]
[test: U+2028 after a description block]
[test: U+2028 at the end of a statement]
[test: U+2028 at the end of the text]

### 空白文字

タブ、改ページ、U+00A0、U+3000、U+FEFF は、
単位の間では字句解析器にとって空白で、
文字列とアクセシビリティのテキストの中では文字です。
単位の間では、空白の連なりと同じに空白 1 つにし、
行頭と行末では落とします。
文字列とアクセシビリティのテキストの一部であるものは、そのまま残します。
[test: U+00A0 between the words of a title]
[test: a form feed between the words of a title]
[test: U+00A0 after a title keyword]
[test: U+00A0 around the values of a plot]
[test: U+00A0 around the arrow of a range]
[test: U+00A0 between the header and the orientation]
[test: U+FEFF between the words of a category]
[test: U+3000 before a statement]
[test: U+FEFF before a statement]
[test: U+00A0 between two statements]
[test: U+00A0 at the end of a statement]
[test: U+00A0 in a string]
[test: U+00A0 in an accessibility text]
[test: U+3000 around the text of accTitle]
[test: U+00A0 inside a description block]
[test: U+00A0 inside an empty description block]
