# 象限チャートの整形規則

英語版: [quadrant.md](./quadrant.md)

prettier-plugin-mmd が象限チャートをどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各規則でその条件を説明します。
象限チャートは、ヘッダーと、その後に続く文でできています。
XY チャートと違って、引用符なしのテキストの単語の間の空白は Db に入ります。
そのため、テキストは書かれたままに印字し、
規則が形を選ぶのは、その周りのものです。
字下げ、キーワード、矢印、角括弧、コンマです。

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
文法は文の字下げを禁じていません。
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
([indentation/statements-one-level-deeper-input.mmd](../tests/fixtures/quadrant/indentation/statements-one-level-deeper-input.mmd)):

```mmd
quadrantChart
title T
   x-axis L --> R
  quadrant-1 A
A: [0.3, 0.6]
classDef c1 color: #f00
```

出力
([indentation/statements-one-level-deeper-output.mmd](../tests/fixtures/quadrant/indentation/statements-one-level-deeper-output.mmd)):

```mmd
quadrantChart
  title T
  x-axis L --> R
  quadrant-1 A
  A: [0.3, 0.6]
  classDef c1 color: #f00
```

### 1 行 1 文

どの文も、自分の行に置きます。
mermaid.js は、`;` で区切らない限り、1 行の 2 つの文を拒否します。
ただし、ヘッダーの行でヘッダーの後に文を書けて、
文の後に空の説明ブロックを書けるので、それらは自分の行に移します。
1 行に 2 つの文があると読みにくいからで、ほかの図も同じです
（[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)を参照）。
`;` は、改行と同じに文を終わらせます。
文を別々の行に置けば、何も区切らなくなるので、落とします。
先頭にあるとき、続けて 2 つあるとき、最後にあるときも同じです。
[fixture: statements-one-per-line/header-then-axis]
[fixture: statements-one-per-line/header-then-title]
[fixture: statements-one-per-line/header-then-point]
[fixture: statements-one-per-line/header-glued-point]
[fixture: statements-one-per-line/semicolon-between-statements-dropped]
[fixture: statements-one-per-line/semicolons-at-the-start-twice-and-at-the-end-dropped]
[fixture: statements-one-per-line/semicolon-after-the-header-dropped]
[fixture: statements-one-per-line/semicolon-line-alone-dropped]
[fixture: statements-one-per-line/description-block-then-statement]
[fixture: statements-one-per-line/empty-description-block-then-axis]
[fixture: statements-one-per-line/point-then-empty-description-block]
[fixture: statements-one-per-line/text-then-empty-description-block]
[fixture: statements-one-per-line/empty-description-block-after-the-header]
[fixture: directives/directive-after-the-header-then-statement]
[fixture: directives/directive-between-two-statements-moves-with-the-next]

title、アクセシビリティのテキスト、説明ブロックの中の `;` は、
テキストの文字なので残ります。
`title T; quadrant-1 A` は 1 つの title です。
`title T accDescr {}` のように title の中にある空の説明ブロックは、
title の一部なので、title と一緒に残ります。
[fixture: statements-one-per-line/semicolon-in-a-title-is-text]
[fixture: statements-one-per-line/semicolon-in-an-accessibility-text-is-text]
[fixture: statements-one-per-line/empty-description-block-in-a-title-stays]

mermaid.js の行の規則が読む `;` がある行では、文を動かしません。
行の規則は、`style` か `classDef`、その後の `:`、
その後の、`:` との間に空白のない `#`、その後の `;` を持つ行の、
最後の `;` を取り除きます。
そのような行から文を動かしたり、`;` を落としたりすると、
どの `;` が最後かが変わり、テキストも変わります。
`x-axis style; title a:#b;c` は、文を別々の行に置くと、別の title になります。
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
[fixture: statements-one-per-line/classdef-semicolon-ignored-by-the-line-rule-dropped]

入力
([statements-one-per-line/header-then-axis-input.mmd](../tests/fixtures/quadrant/statements-one-per-line/header-then-axis-input.mmd)):

```mmd
quadrantChart x-axis L --> R
quadrant-1 A
```

出力
([statements-one-per-line/header-then-axis-output.mmd](../tests/fixtures/quadrant/statements-one-per-line/header-then-axis-output.mmd)):

```mmd
quadrantChart
  x-axis L --> R
  quadrant-1 A
```

入力
([statements-one-per-line/semicolon-between-statements-dropped-input.mmd](../tests/fixtures/quadrant/statements-one-per-line/semicolon-between-statements-dropped-input.mmd)):

```mmd
quadrantChart
x-axis L; quadrant-1 A
A: [0.3, 0.6]; B: [0.1, 0.2]
```

出力
([statements-one-per-line/semicolon-between-statements-dropped-output.mmd](../tests/fixtures/quadrant/statements-one-per-line/semicolon-between-statements-dropped-output.mmd)):

```mmd
quadrantChart
  x-axis L
  quadrant-1 A
  A: [0.3, 0.6]
  B: [0.1, 0.2]
```

入力
([statements-one-per-line/line-rule-line-kept-together-input.mmd](../tests/fixtures/quadrant/statements-one-per-line/line-rule-line-kept-together-input.mmd)):

```mmd
quadrantChart
x-axis style; title a:#b;c
```

出力
([statements-one-per-line/line-rule-line-kept-together-output.mmd](../tests/fixtures/quadrant/statements-one-per-line/line-rule-line-kept-together-output.mmd)):

```mmd
quadrantChart
  x-axis style; title a:#b;c
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
[fixture: blank-lines/around-comment-lines]
[fixture: blank-lines/whitespace-only-lines]

入力
([blank-lines/runs-become-one-input.mmd](../tests/fixtures/quadrant/blank-lines/runs-become-one-input.mmd)):

```mmd
quadrantChart
title T



quadrant-1 A
```

出力
([blank-lines/runs-become-one-output.mmd](../tests/fixtures/quadrant/blank-lines/runs-become-one-output.mmd)):

```mmd
quadrantChart
  title T

  quadrant-1 A
```

### ヘッダー

ヘッダー `quadrantChart` は書かれたままに印字します。
mermaid.js はこの大文字小文字だけを検出するので、印字側が選ぶものはありません。
前後の空白は落とし、同じ行の後ろの文は自分の行に移します
（[1 行 1 文](#1-行-1-文)を参照）。
[fixture: header/header-only]
[fixture: header/trailing-whitespace-dropped]
[fixture: header/comment-after-the-header]
[fixture: header/comment-glued-to-the-header]
[fixture: header/directive-after-the-header]
[fixture: header/directive-glued-to-the-header]

入力
([header/comment-after-the-header-input.mmd](../tests/fixtures/quadrant/header/comment-after-the-header-input.mmd)):

```mmd
quadrantChart %% c
title T
```

出力
([header/comment-after-the-header-output.mmd](../tests/fixtures/quadrant/header/comment-after-the-header-output.mmd)):

```mmd
quadrantChart %% c
  title T
```

### キーワードとテキスト

文のキーワードとテキストは、空白 1 つで離します。
空白の連なりは空白 1 つにします。
その間の空白は Db に入りません。
`x-axisL --> R` と `x-axis L --> R` は同じ軸で、
`quadrant-10 A` は象限 1 とテキスト `0 A` なので、`quadrant-1 0 A` と同じです。
接しているキーワードとテキストは、接したままにします。
ほかの図でも、接しているトークンはそうします。
空白を足すと、Db では見えない書き換えになります。
`quadrant-10 A` のように、書き手が別の象限を意図したかもしれない形は、
mermaid.js の読みを知らせる lint の規則が扱う場所で、
整形が書き換えるものではありません。
[fixture: keywords-and-texts/title-spaces]
[fixture: keywords-and-texts/title-tab]
[fixture: keywords-and-texts/axis-keyword-spaces]
[fixture: keywords-and-texts/quadrant-keyword-spaces]
[fixture: keywords-and-texts/keyword-touching-kept]
[fixture: keywords-and-texts/quadrant-ten-kept]
[fixture: keywords-and-texts/word-after-title-keyword-is-a-point-name]
[fixture: keywords-and-texts/inner-whitespace-of-a-title-kept]

テキストの中の空白は Db に入るので、書かれたまま残します。
`quadrant-1 a    b` のテキストは `a    b` で、
2 つの単語の間のタブはテキストの中のタブで、改ページも同じです。
テキストの両端の空白は、Db が落とすので落とします。
文字列とその後の単語は、間の空白を保ちます。
`"a" b` のテキストは `a b` で、`"a"b` のテキストは `ab` だからです。
[fixture: keywords-and-texts/inner-whitespace-kept]
[fixture: keywords-and-texts/whitespace-at-the-ends-dropped]
[fixture: keywords-and-texts/string-then-text-whitespace-kept]
[fixture: keywords-and-texts/inner-whitespace-of-a-title-kept]

入力
([keywords-and-texts/title-spaces-input.mmd](../tests/fixtures/quadrant/keywords-and-texts/title-spaces-input.mmd)):

```mmd
quadrantChart
title    T
```

出力
([keywords-and-texts/title-spaces-output.mmd](../tests/fixtures/quadrant/keywords-and-texts/title-spaces-output.mmd)):

```mmd
quadrantChart
  title T
```

入力
([keywords-and-texts/keyword-touching-kept-input.mmd](../tests/fixtures/quadrant/keywords-and-texts/keyword-touching-kept-input.mmd)):

```mmd
quadrantChart
x-axisL --> R
quadrant-3C
title-x
```

出力
([keywords-and-texts/keyword-touching-kept-output.mmd](../tests/fixtures/quadrant/keywords-and-texts/keyword-touching-kept-output.mmd)):

```mmd
quadrantChart
  x-axisL --> R
  quadrant-3C
  title-x
```

### 軸

軸の矢印は、前に空白 1 つ、後ろに空白 1 つ置きます
（`x-axis Low Reach --> High Reach`）。
接して書かれていても（`Low Reach-->High Reach`）、空白がいくつあっても同じです。
mermaid.js は、矢印の周りの空白があってもなくても同じに読むので、
この形は選択です。
空白 1 つは mermaid.js の文書が使う形で、
テキストの中の空白（[キーワードとテキスト](#キーワードとテキスト)を参照）が
隠してしまう、最初のテキストの終わりを示します。
矢印の長さは Db に入りませんが、書き手が書いたものなので、`--->` は残します。
[fixture: axes/arrow-touching]
[fixture: axes/arrow-with-more-whitespace]
[fixture: axes/arrow-touching-on-one-side]
[fixture: axes/arrow-length-kept]
[fixture: axes/text-inner-whitespace-kept]
[fixture: axes/strings]
[fixture: axes/markdown-string]
[fixture: axes/axis-only-one-text]

矢印だけで、後ろにテキストのない軸（`x-axis L -->`）は、
矢印を残し、前に空白 1 つを置きます。
mermaid.js は `x-axis L` と別の軸として読むからです
（左端のテキストは `L` と矢印の文字になります）。
[fixture: axes/arrow-only]

入力
([axes/arrow-touching-input.mmd](../tests/fixtures/quadrant/axes/arrow-touching-input.mmd)):

```mmd
quadrantChart
x-axis Low Reach-->High Reach
y-axis B-->T
```

出力
([axes/arrow-touching-output.mmd](../tests/fixtures/quadrant/axes/arrow-touching-output.mmd)):

```mmd
quadrantChart
  x-axis Low Reach --> High Reach
  y-axis B --> T
```

入力
([axes/arrow-only-input.mmd](../tests/fixtures/quadrant/axes/arrow-only-input.mmd)):

```mmd
quadrantChart
x-axis L-->
y-axis B   -->
```

出力
([axes/arrow-only-output.mmd](../tests/fixtures/quadrant/axes/arrow-only-output.mmd)):

```mmd
quadrantChart
  x-axis L -->
  y-axis B -->
```

### 点

点は `名前: [x, y]` と印字します。
`:` は名前に接し、`[` の前は空白 1 つ、
`[` の後と `]` の前に空白は置かず、
コンマの前に空白は置かず、後ろに空白 1 つを置きます。
`:::` の後のクラス名は名前に接し、`:` はクラス名に接します
（`A:::c1: [0.3, 0.6]`）。
周りにどんな空白が書かれていても同じです。
この空白はどれも Db に入りません。
`:` の前の名前と座標はテキストで、書かれたまま残します
（`0.30` は `0.3` ではありません）が、両端の空白は Db が落とすので落とします。
この形は mermaid.js の文書のものです
（`Campaign A: [0.3, 0.6]`、`Campaign B:::class1: [0.8, 0.1]`）。
[fixture: points/colon-touches-the-name]
[fixture: points/spaces-inside-the-brackets]
[fixture: points/name-whitespace-at-the-ends-dropped]
[fixture: points/name-inner-whitespace-kept]
[fixture: points/string-names]
[fixture: points/class-name]
[fixture: points/coordinates-as-written]
[fixture: points/trailing-whitespace-dropped]

mermaid.js は、点の中の改行を空白として読みます。
`:` の周り、`[` の後、コンマの周り、`]` の前、
そして空白の文字が先にあるときの `:` の前です。
複数行に書かれた点は、改行が字句解析器にとって空白である所で 1 行に印字します。
コメント行か指令がある点は、ほかの図と同じに、書かれたまま残します
（[複数行の文](#複数行の文)を参照）。
[fixture: points/line-breaks-joined]
[fixture: points/line-break-with-a-comment-line-kept]
[fixture: points/line-break-with-a-directive-kept]
[fixture: multi-line-statements/point-over-lines-joined]
[fixture: multi-line-statements/name-then-colon-on-the-next-line-joined]

入力
([points/colon-touches-the-name-input.mmd](../tests/fixtures/quadrant/points/colon-touches-the-name-input.mmd)):

```mmd
quadrantChart
Campaign A:[0.3,0.6]
B : [ 0.1 , 0.2 ]
```

出力
([points/colon-touches-the-name-output.mmd](../tests/fixtures/quadrant/points/colon-touches-the-name-output.mmd)):

```mmd
quadrantChart
  Campaign A: [0.3, 0.6]
  B: [0.1, 0.2]
```

入力
([points/class-name-input.mmd](../tests/fixtures/quadrant/points/class-name-input.mmd)):

```mmd
quadrantChart
A :::c1 : [0.3, 0.6]
B:::c2:[0.1,0.2]
C:::C3: [0.1, 0.1]
```

出力
([points/class-name-output.mmd](../tests/fixtures/quadrant/points/class-name-output.mmd)):

```mmd
quadrantChart
  A:::c1: [0.3, 0.6]
  B:::c2: [0.1, 0.2]
  C:::C3: [0.1, 0.1]
```

### スタイル

点のスタイルは、`]` の後に、空白 1 つを置いて続けます。
接して書かれていても（`]radius:9`）、空白がいくつあっても同じです。
スタイルの間はコンマで区切り、
コンマの前に空白は置かず、後ろに空白 1 つを置きます
（`radius: 9, color: #f00`）。
最後のスタイルの両端の空白は落とします。
スタイルのテキストは、中の空白も含めて書かれたまま印字します
（`radius :  10` のように）。
Db は、スタイルの名前と値を、その空白なしで読むので、この形は選択です。
印字は書き手が書いたものを残します。
mermaid.js の文書にも `radius : 10` と `radius: 10` の両方があります。
木はスタイルを 1 つのテキストとして持ち、印字はそれを分けません。
[fixture: styles/styles-after-one-space]
[fixture: styles/comma-after-one-space]
[fixture: styles/style-text-as-written]

`classDef` の後ろには、空白 1 つ、クラスの名前、空白 1 つ、スタイルを置き、
スタイルは点のスタイルと同じに整えます。
文法は、キーワードの後と名前の後の空白を 1 文字と数えるので、
空白 1 つが唯一の形です。
名前の後の空白は、木では最初のスタイルに属し、Db が落とすので、
2 つ以上あれば 1 つにします。
[fixture: styles/class-definition]
[fixture: styles/class-definition-spaces]
[fixture: styles/class-definition-tabs]
[fixture: styles/class-definition-name-with-a-dash]
[fixture: styles/class-definition-three-styles]
[fixture: styles/class-definition-keyword-case-kept]
[fixture: styles/class-definition-with-an-ignored-semicolon]
[fixture: styles/class-definition-space-before-the-comma-dropped]

入力
([styles/styles-after-one-space-input.mmd](../tests/fixtures/quadrant/styles/styles-after-one-space-input.mmd)):

```mmd
quadrantChart
A: [0.3, 0.6]radius: 9, color: #f00
B: [0.1, 0.2]     radius: 5
```

出力
([styles/styles-after-one-space-output.mmd](../tests/fixtures/quadrant/styles/styles-after-one-space-output.mmd)):

```mmd
quadrantChart
  A: [0.3, 0.6] radius: 9, color: #f00
  B: [0.1, 0.2] radius: 5
```

入力
([styles/class-definition-spaces-input.mmd](../tests/fixtures/quadrant/styles/class-definition-spaces-input.mmd)):

```mmd
quadrantChart
classDef c1    radius: 5,color: #f00
```

出力
([styles/class-definition-spaces-output.mmd](../tests/fixtures/quadrant/styles/class-definition-spaces-output.mmd)):

```mmd
quadrantChart
  classDef c1 radius: 5, color: #f00
```

### 引用符

文字列と markdown 文字列は、書かれたまま印字します。
引用符、テキスト、中の空白を残し、引用符は足しも取りもしません。
mermaid.js は `"L"` と `L`、`"a b"` と `a b` を同じテキストとして読みますが、
文字列は引用符なしのテキストが持てないものを持てます。
`"a: b"` はコロンを持ち、引用符なしでは拒否されます。
そのため、引用符を外せるとは限らず、引用符を付けるかどうかは書き手の選択です。
[fixture: quotes/strings-as-written]
[fixture: quotes/quotes-not-removed]
[fixture: quotes/quotes-not-added]
[fixture: quotes/keywords-and-arrows-in-strings]
[fixture: quotes/markdown-strings]
[fixture: quotes/string-with-a-comment-mark]

入力
([quotes/quotes-not-removed-input.mmd](../tests/fixtures/quadrant/quotes/quotes-not-removed-input.mmd)):

```mmd
quadrantChart
quadrant-1 "A"
"B": [0.3, 0.6]
```

出力
([quotes/quotes-not-removed-output.mmd](../tests/fixtures/quadrant/quotes/quotes-not-removed-output.mmd)):

```mmd
quadrantChart
  quadrant-1 "A"
  "B": [0.3, 0.6]
```

### title とアクセシビリティの文

`title` は、キーワードとそのテキストを、空白 1 つで離して印字します。
間に書かれた空白（タブも）はどれも同じです。
テキストは行の残りで、両端の空白は落とします。
テキストのない `title` は、キーワードだけを印字します。
title の中の `;`、`#`、`%%`、引用符、キーワードは、そのテキストの文字です。
[fixture: titles-and-accessibility-statements/title-text]
[fixture: titles-and-accessibility-statements/title-without-text]
[fixture: titles-and-accessibility-statements/title-with-special-characters]
[fixture: titles-and-accessibility-statements/title-keyword-case]

`accTitle` と `accDescr` の `:` は、キーワードに接し、
後ろに空白 1 つを置きます。
ほかの図と同じです
（[アクセシビリティの文](./xychart.ja.md#アクセシビリティの文)を参照）。
テキストの前後に空白は置かず、中の空白は残します。
中の空白は Db に入るからです。
後ろの行に書かれたテキスト、キーワードより後ろの行に書かれたコロン、
コロンの前の空白は、1 行にして印字します。
改行は字句解析器にとって空白で、文のテキストは変わりません。
[fixture: titles-and-accessibility-statements/colon-touches-keyword]
[fixture: titles-and-accessibility-statements/colon-without-space-after]
[fixture: titles-and-accessibility-statements/text-whitespace-dropped]
[fixture: titles-and-accessibility-statements/text-inner-whitespace-kept]
[fixture: titles-and-accessibility-statements/text-on-the-next-line-joined]
[fixture: titles-and-accessibility-statements/colon-on-the-next-line-joined]
[fixture: titles-and-accessibility-statements/text-that-looks-like-a-statement]

`accDescr { ... }` ブロックの行は、必要からではなく選択として、
書かれたまま残します。
行頭の空白は Db に入らず、行は書き手のテキストで、印字は整形しないからです。
`}` は文と同じ段に置きます。
`{` と同じ行のテキストは、書かれた括弧の間に空白があれば空白 1 つを置き、
括弧がテキストに接していれば接したままにします。
閉じていないブロックは拒否されるので、印字しません。
[fixture: titles-and-accessibility-statements/block-lines-kept]
[fixture: titles-and-accessibility-statements/block-text-on-the-opening-line]
[fixture: titles-and-accessibility-statements/block-closing-brace-at-the-level-of-the-statement]
[fixture: titles-and-accessibility-statements/block-comment-and-empty-lines-kept]
[fixture: titles-and-accessibility-statements/directive-around-colon-and-braces]

入力
([titles-and-accessibility-statements/colon-touches-keyword-input.mmd](../tests/fixtures/quadrant/titles-and-accessibility-statements/colon-touches-keyword-input.mmd)):

```mmd
quadrantChart
accTitle : T
accDescr  :  d
```

出力
([titles-and-accessibility-statements/colon-touches-keyword-output.mmd](../tests/fixtures/quadrant/titles-and-accessibility-statements/colon-touches-keyword-output.mmd)):

```mmd
quadrantChart
  accTitle: T
  accDescr: d
```

入力
([titles-and-accessibility-statements/text-on-the-next-line-joined-input.mmd](../tests/fixtures/quadrant/titles-and-accessibility-statements/text-on-the-next-line-joined-input.mmd)):

```mmd
quadrantChart
accTitle:
T
accDescr:

  d
```

出力
([titles-and-accessibility-statements/text-on-the-next-line-joined-output.mmd](../tests/fixtures/quadrant/titles-and-accessibility-statements/text-on-the-next-line-joined-output.mmd)):

```mmd
quadrantChart
  accTitle: T
  accDescr: d
```

入力
([titles-and-accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/quadrant/titles-and-accessibility-statements/block-lines-kept-input.mmd)):

```mmd
quadrantChart
accDescr {
   a
  b
}
```

出力
([titles-and-accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/quadrant/titles-and-accessibility-statements/block-lines-kept-output.mmd)):

```mmd
quadrantChart
  accDescr {
   a
  b
  }
```

### 空の説明ブロック

何も変えない空のブロックは、それ自身が 1 つの文です。
内側が空白だけなら、タブ、改行、Unicode の空白を含めて `{}` と印字します。
囲む空白を要する本文がないためです。
すでに空の内側は空のままです。
接した keyword は接したまま、`accDescr{  }` は `accDescr{}` にします。
[fixture: empty-description-blocks/empty-whitespace-interiors]
[test: quadrant Unicode and tab interiors]
指令かコメント行を持つブロックは、書かれたまま印字します。
ヘッダーの後でも、ほかの文の後でも、自分の行に置きます。
文法がブロックを受け入れるのは、文の始まりと、文の最後の単位の後です。
mermaid.js は、どこにあってもトークンのないものとして読みます。
[fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/touching-kept]
[fixture: empty-description-blocks/blank-lines-inside]
[fixture: empty-description-blocks/with-directive-or-comment-line-kept]
[fixture: empty-description-blocks/between-two-statements]

入力
([empty-description-blocks/touching-kept-input.mmd](../tests/fixtures/quadrant/empty-description-blocks/touching-kept-input.mmd)):

```mmd
quadrantChart
accDescr{}
accDescr {}
accDescr{ }
```

出力
([empty-description-blocks/touching-kept-output.mmd](../tests/fixtures/quadrant/empty-description-blocks/touching-kept-output.mmd)):

```mmd
quadrantChart
  accDescr{}
  accDescr {}
  accDescr{}
```

### 複数行の文

mermaid.js が複数行にわたって読む文は、
改行が字句解析器にとって空白である所では 1 行に印字します。
点の中、`:` の周り、`[` の後、コンマの周り、`]` の前、
`accTitle:` と `accDescr:` の後です。
改行は空白 1 つに置き換え、行末の空白もそれと一緒に落とします。
空白で終わる行は誰にも見えず、
それによって次の行へ続く文は見落としやすいので、印字は残しません。
ほかの図も同じ規則で文の行をつなぎます
（[複数行の文](./xychart.ja.md#複数行の文)を参照）。
[fixture: multi-line-statements/point-over-lines-joined]
[fixture: multi-line-statements/name-then-colon-on-the-next-line-joined]
[fixture: multi-line-statements/point-with-styles-over-lines-joined]

コメント行か指令を含む文は、書かれたまま残します。
コメント行は、置かれた行の残りを取り込むので、行にはつなげません。
指令を含む行をつないでも Db は変わりませんが、
コメント行と指令に同じ判断をするのが、すべての図の決まりで、
印字はそれを 1 度だけ決めます。
`;` を含む文も、行の規則があるので、書かれたまま残します
（[1 行 1 文](#1-行-1-文)を参照）。
[fixture: multi-line-statements/comment-line-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]
[fixture: multi-line-statements/semicolon-on-the-last-line-kept]

### 複数行の値

`accDescr` ブロックの行と、文字列の行は、改行と中の空白を含めて、
書かれたまま残します。
改行は Db に入り、文字列の空白も入ります。
ブロックの行頭の空白は入らないので、残すのは選択で、
値のテキストは整形しないからです。
[fixture: multi-line-values/string-with-line-breaks-kept]
[fixture: multi-line-values/description-block-lines-kept]
[fixture: multi-line-values/comment-line-inside-a-block-kept]

入力
([multi-line-values/string-with-line-breaks-kept-input.mmd](../tests/fixtures/quadrant/multi-line-values/string-with-line-breaks-kept-input.mmd)):

```mmd
quadrantChart
x-axis "a
   b"
quadrant-1 A
```

出力
([multi-line-values/string-with-line-breaks-kept-output.mmd](../tests/fixtures/quadrant/multi-line-values/string-with-line-breaks-kept-output.mmd)):

```mmd
quadrantChart
  x-axis "a
   b"
  quadrant-1 A
```

入力
([multi-line-values/description-block-lines-kept-input.mmd](../tests/fixtures/quadrant/multi-line-values/description-block-lines-kept-input.mmd)):

```mmd
quadrantChart
accDescr {
  a
    b
}
```

出力
([multi-line-values/description-block-lines-kept-output.mmd](../tests/fixtures/quadrant/multi-line-values/description-block-lines-kept-output.mmd)):

```mmd
quadrantChart
  accDescr {
  a
    b
  }
```

### キーワードの大文字小文字

キーワード `title`、`x-axis`、`y-axis`、`quadrant-1` から `quadrant-4`、
`classDef`、`accTitle`、`accDescr` は、書かれた大文字小文字のまま印字します。
mermaid.js はどれも大文字小文字を問わずに読み
（`Title`、`X-Axis`、`CLASSDEF`、`ACCTITLE:` も文を始めます）、Db は同じです。
そのため、大文字小文字は書き手のもので、強制するものはありません。
クラスの名前は、大文字小文字も残します。
[fixture: keyword-case/statement-keywords-kept]
[fixture: keyword-case/accessibility-keywords-kept]

入力
([keyword-case/statement-keywords-kept-input.mmd](../tests/fixtures/quadrant/keyword-case/statement-keywords-kept-input.mmd)):

```mmd
quadrantChart
Title T
X-AXIS L
Y-Axis B
Quadrant-1 A
QUADRANT-2 B
```

出力
([keyword-case/statement-keywords-kept-output.mmd](../tests/fixtures/quadrant/keyword-case/statement-keywords-kept-output.mmd)):

```mmd
quadrantChart
  Title T
  X-AXIS L
  Y-Axis B
  Quadrant-1 A
  QUADRANT-2 B
```

### コメント

コメントは、単位が始まる所の `%%` で始まり、行の終わりまで続きます。
単独の行のコメントは、後ろの文と同じ段に置き、
テキストと印は書かれたまま残します。
最後の文の後のコメント行は、その後ろに残ります。
ヘッダーより前のコメント行は 1 列目に置きます。
title、アクセシビリティのテキスト、説明ブロック、文字列の中の `%%` は、
その文字です。
点の角括弧の中の `%%` は、入力を拒否させます。
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
`x-axis L%% c` は拒否され、`quadrant-1 a b%% c` のテキストは `a` です。
コメントの前に必ず空白を書く規則は、そのような入力を mermaid.js が読む形を変え、
書き手の誤りを、何も知らせずに別のチャートとして読ませます。
印字はコメントが接しているかどうかを保ち、
報告する場所は lint の規則です。
ほかの図も同じです（[コメント](./journey.ja.md#コメント)を参照）。
[fixture: comments/comment-after-a-statement-spaced]
[fixture: comments/comment-after-a-statement-touching]
[fixture: comments/comment-glued-to-a-one-character-word-kept]
[fixture: comments/comment-glued-to-a-style-kept]
[fixture: comments/comment-takes-a-character-kept]
[fixture: comments/comment-after-a-description-block]

入力
([comments/comment-line-at-the-level-of-the-next-statement-input.mmd](../tests/fixtures/quadrant/comments/comment-line-at-the-level-of-the-next-statement-input.mmd)):

```mmd
quadrantChart
      %% a
title T
%% b
quadrant-1 A
```

出力
([comments/comment-line-at-the-level-of-the-next-statement-output.mmd](../tests/fixtures/quadrant/comments/comment-line-at-the-level-of-the-next-statement-output.mmd)):

```mmd
quadrantChart
  %% a
  title T
  %% b
  quadrant-1 A
```

入力
([comments/comment-after-a-statement-spaced-input.mmd](../tests/fixtures/quadrant/comments/comment-after-a-statement-spaced-input.mmd)):

```mmd
quadrantChart
quadrant-1 ab   %% c
A: [0.3, 0.6]  %% d
```

出力
([comments/comment-after-a-statement-spaced-output.mmd](../tests/fixtures/quadrant/comments/comment-after-a-statement-spaced-output.mmd)):

```mmd
quadrantChart
  quadrant-1 ab %% c
  A: [0.3, 0.6] %% d
```

### 指令

指令は、書かれた場所に残します。
文の単位の間にあっても、文の間にあっても同じです。
両側の空白は、それぞれ、あるかないかを保ちます。
空白が書かれていれば空白 1 つ、接していれば接したままです。
mermaid.js は、テキスト、名前、文字列の中の指令の前後を結んで読むので、
指令の隣の空白は動かさず、取り除きもしません
（[ディレクティブ](./journey.ja.md#ディレクティブ)を参照）。
単独の行にある指令は、後ろの文と同じ段に置き、
行の中で 2 つの文の間にある指令は、後ろの文と一緒に動きます。
[fixture: directives/directive-line-at-the-level-of-the-next-statement]
[fixture: directives/directive-line-before-the-header]
[fixture: directives/directive-after-a-statement-spaced]
[fixture: directives/directive-after-a-statement-touching]
[fixture: directives/directive-between-keyword-and-text]
[fixture: directives/directive-inside-a-text]
[fixture: directives/directive-between-colon-and-bracket]
[fixture: directives/directive-inside-a-coordinate]
[fixture: directives/directive-over-several-lines]
[fixture: directives/directive-and-comment-on-a-line]

入力
([directives/directive-line-at-the-level-of-the-next-statement-input.mmd](../tests/fixtures/quadrant/directives/directive-line-at-the-level-of-the-next-statement-input.mmd)):

```mmd
quadrantChart
    %%{init: {}}%%
title T
```

出力
([directives/directive-line-at-the-level-of-the-next-statement-output.mmd](../tests/fixtures/quadrant/directives/directive-line-at-the-level-of-the-next-statement-output.mmd)):

```mmd
quadrantChart
  %%{init: {}}%%
  title T
```

入力
([directives/directive-between-keyword-and-text-input.mmd](../tests/fixtures/quadrant/directives/directive-between-keyword-and-text-input.mmd)):

```mmd
quadrantChart
quadrant-1 %%{init: {}}%% A
x-axis%%{init: {}}%%L
```

出力
([directives/directive-between-keyword-and-text-output.mmd](../tests/fixtures/quadrant/directives/directive-between-keyword-and-text-output.mmd)):

```mmd
quadrantChart
  quadrant-1 %%{init: {}}%% A
  x-axis%%{init: {}}%%L
```

### フロントマターの YAML

フロントマターは、ほかの図と同じに Prettier が YAML として整形します
（[フロントマターの YAML](./flowchart.ja.md#フロントマターの-yaml)を参照）。
正しい YAML でないフロントマターは、書かれたまま残します。
フロントマターの title は Db に入るので、値には触れません。
[fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/malformed-kept]
[fixture: frontmatter-yaml/title-and-statement]
[fixture: frontmatter-yaml/comment-after-frontmatter-before-header]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/quadrant/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:
    quadrantChart:
        chartWidth:  400
---
quadrantChart
title X
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/quadrant/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config:
  quadrantChart:
    chartWidth: 400
---
quadrantChart
  title X
```

### 行区切り文字

この図種では、U+2028 と U+2029 は、U+00A0 と同じに単語の文字です。
テキスト、名前、title、アクセシビリティのテキスト、クラスの名前の中にあります。
テキストと名前は、書かれたテキストの一部なので、両端にあっても残し、
Db がそこで落とします。
title、アクセシビリティのテキスト、説明ブロックのテキストは、
値がそれらを両端から除くので、印字もそこで落とします。
それらを含む隙間と、それらを含むテキストは、書かれたまま印字します。
[test: U+2028 between the words of a text]
[test: U+2029 between the words of a text]
[test: U+2028 at the end of a text]
[test: U+2028 between a statement and the next]
[test: U+2028 between the words of a title]
[test: U+2028 after a title keyword]
[test: U+2028 at the end of a title]
[test: U+2028 in the name of a point]
[test: U+2028 in an accessibility text]
[test: U+2028 in a string]
[test: U+2028 around the arrow of an axis]
[test: U+2028 in the name of a class]

### 空白文字

空白、タブ、垂直タブ、改ページは、単位の間の空白です。
印字が空白を選ぶ所では、空白の連なりと同じに空白 1 つにし、
行頭と行末では落とします。
テキスト、文字列、アクセシビリティのテキストの中では文字で、そのまま残ります。
U+00A0、U+3000、U+FEFF は、
テキスト、名前、クラスの名前の中では単語の文字で、そのまま残ります。
点の `:`、角括弧、コンマの周りと、アクセシビリティの文のコロンと括弧の周りでは、
mermaid.js が空白として読むので、その場所に空白を印字します。
点の `]` の後では受理されません
（[行区切り文字](#行区切り文字)を参照）。
[test: U+00A0 between the words of a text]
[test: U+3000 between the words of a text]
[test: U+FEFF between the words of a text]
[test: a form feed between the words of a text]
[test: U+00A0 at the end of a text]
[test: U+00A0 around the text of a title]
[test: U+00A0 before the name of a point]
[test: U+00A0 around the colon and the brackets of a point]
[test: U+00A0 inside the brackets of a point]
[test: a form feed after the bracket of a point]
[test: U+00A0 around the colon of accTitle]
[test: U+00A0 inside a description block]
[test: U+00A0 inside an empty description block]
[test: U+00A0 around the arrow of an axis]
[test: U+00A0 in the name of a class]
