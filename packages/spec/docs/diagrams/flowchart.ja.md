# Flowchart

英語版: [flowchart.md](./flowchart.md)

mermaid.js での正解の出どころ:

- [`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison)
- [`flowParser.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flowParser.ts)
- [`flowDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts)
- [`parser/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser)
  の中のテスト（`*.spec.js`）

この文書は、図種 `flowchart-v2`、`flowchart-elk`、`swimlane` を扱います。
3 つとも同じ文法と同じ Db を使います。
木のノードとトークンは [ast/flowchart.ja.md](../ast/flowchart.ja.md)
で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の 3 つの項目がこの文法を選びます。
項目 3（`flowchart-elk`、id `flowchart-elk`）、
項目 16（`swimlane-beta`、id `swimlane`）、
項目 17（`graph` か `flowchart`、id `flowchart-v2`）です。
[fixture: common/detect-minimal-flowchart-elk] [fixture:
common/detect-minimal-swimlane] [fixture: common/detect-minimal-flowchart-v2]

検出はテキストの先頭しか見ません。
その後、
文法がヘッダーのキーワードをもう一度読み
（[ヘッダーの文脈](#ヘッダーの文脈) を参照）、
その後に語の文字が続かないことを求めます。
そのため、`graphTD` は `flowchart-v2` として検出されて拒否され、
`flowchart-elkX` は `flowchart-elk` として検出されて拒否されます。
後者では、文法が `flowchart` を読み、その後の `-elkX` を読めないからです。
[fixture: common/detect-no-boundary-graph] [fixture:
flowchart/header-elk-suffix]

判定は、ヘッダーの前の `%%` だけの行を除きます
（[図種の検出](../common.ja.md#図種の検出) を参照）。
しかし、字句解析器はそれを図のテキスト（id）として読み、
文法はヘッダーから始まるので、mermaid.js と同じく入力は拒否されます。
[fixture: flowchart/header-after-bare-percent-line]

## 字句構造

字句解析器は、
[図のテキスト](../common.ja.md#ソースの読み方) を
[変換した形](../common.ja.md#ソースの読み方) で読みます。
行終端を `\n` として、属性の引用符を `'` として、
エンティティをそのプレースホルダとして読み、
コメント領域と行単位の規則が無視する `;` は、ないかのように読み進めます。
最後の文字の後に字句解析器が読む
`\n`
（[テキストの終わり](../common.ja.md#テキストの終わり)）は図のテキストの一部です。
規則は、他の改行と同じくそれを読み、それについての条件を確かめます。
文法の `end-of-text` は、その後の位置です。
そのため、改行のない `flowchart` だけのテキストは受理されます。
ヘッダーの文脈が、足された `\n` をヘッダーの終わりとして読むからです。
[fixture: flowchart/header-only-no-line-break] [fixture:
flowchart/header-direction-trailing-space] この節は、図のトークンの規則、
つまり [ソースの読み方](../common.ja.md#ソースの読み方) の項目 4 を述べます。

### 単位と文脈

字句解析器は、図のテキストを**単位**に分けます。
文法は単位の上に書かれ、
木のトークンは単位から作られます
（[ast/flowchart.ja.md](../ast/flowchart.ja.md#トークン) を参照）。
各単位は、文法が使う名前と、**テキスト**を持ちます。
テキストは、その単位が読んだ文字を変換した形です。

字句解析器は**文脈**のスタックを持ち、最初は文の文脈にいます。
規則は、文脈に入ること（スタックの一番上に積む）も、
今の文脈を出ること（その下の文脈に戻る）もできます。
文の文脈を出ても、文の文脈のままです。
字句解析器は、各位置で、
今の文脈の規則のうちそこで一致する最初のものを適用します。
規則が読む文字は、どれもその規則が作る単位のどれかに属します。
規則がエンティティのプレースホルダの各文字を、
それぞれ単位として読むはずのところでは、
プレースホルダは代わりに 1 つの単位で、
その単位はエンティティのソースの文字を持ちます
（[エンティティ](../common.ja.md#エンティティ) を参照）。
規則がほかの文字の間や後で読む空白は、規則がその前に作る単位に属し、
前に単位がなければ最初の単位に属します。
単位を作らない規則が読む空白は、クリックの文脈を出る 1 個の空白のように、
どの単位にも属しません。
そのような空白がどの単位に属するかで、トークンも値も変わりません。
トークンは両端の空白を除き、空白を持ちうる値は、
それを持つかどうかを述べているからです。
テキストの終わりで、字句解析器は止まります。

各文脈の規則を以下に挙げます。
今の文脈のどの規則も一致しなければ、入力は拒否されます。
以下の一覧ではこれを繰り返しません。
入力を拒否する規則を挙げるのは、
それがなければ別の規則が一致してしまう位置だけです。
そこでは、mermaid.js の字句解析器が、
その文法が決して受け付けないものを読みます。

### 単位の中のディレクティブ

字句解析器は、ディレクティブを持たない図のテキストを、
mermaid.js
がディレクティブを取り除いた後のテキストを読むのと同じように読みます。
単位、後に続く文字についての条件、文脈、`}` の後の空白は、
すべてそのテキストで決まります。
その後、
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則が、単位と、
単位から作るトークン
（[ast/flowchart.ja.md](../ast/flowchart.ja.md#トークン)）に当てはまります。
中にディレクティブを持つ、
`RawText` でも `Identifier` でもない単位は入力を拒否させ、
中にディレクティブを持つトークンはディレクティブのところで切られます。

- トークンの端の空白の中のディレクティブは、何も変えません。
  `A --> %%{init: {}}%% B` では、
  ディレクティブは矢印の単位の空白の中にあります。
  [fixture: flowchart/lex-directive-after-arrow]
- `style%%{init: {}}%%A-->B` は、mermaid.js と同じく頂点 `styleA` を持ちます。
  字句解析器は id の並び `styleA` を読み、
  ディレクティブはその `Identifier` のトークンを分けます。
  `A-->en%%{init: {}}%%d` は、mermaid.js と同じく拒否されます。
  字句解析器はキーワード `end` を読みます。
  [fixture: flowchart/lex-directive-inside-id] [fixture:
  flowchart/lex-directive-joins-keyword]
- `accTitle: a %%{init: {}}%% b` のタイトルは `a`、空白 2 つ、`b` で、
  `click A%%{init: {}}%%B "u"` のクリックの id は `AB` で、
  subgraph `subgraph sty%%{init: {}}%%le x` のタイトルは `style x` です。
  どれも mermaid.js と同じです。
  ディレクティブは `RawText` か `Identifier` のトークンを分けます。
  [fixture: flowchart/lex-directive-in-title] [fixture:
  flowchart/lex-directive-in-description-block] [fixture:
  flowchart/lex-directive-in-click-id] [fixture:
  flowchart/lex-directive-in-callback-name] [fixture:
  flowchart/lex-directive-in-callback-arguments] [fixture:
  flowchart/lex-directive-in-subgraph-name]
- `A--%%{init: {}}%%>B` では、
  ディレクティブは種類が `Punctuator` の矢印の単位 `-->` の中にあり、
  入力は拒否されます。
  mermaid.js はそれを受理します。
  文字列と markdown 文字列、
  `click A hr%%{init: {}}%%ef "u"` の `href` のようなキーワード、
  `:::` のような区切り記号も同じです（[既知の差](#既知の差) を参照）。
  [fixture: flowchart/lex-directive-inside-arrow] [fixture:
  common/directive-in-string] [fixture:
  flowchart/div-directive-in-markdown-string]
- 2 つの単位の間のディレクティブは、単位の種類によらず許されます。
  `accTitle%%{init: {}}%%: t` のタイトルは `t` で、
  `A(%%{init: {}}%%(x))` は円です。
  どちらも mermaid.js と同じです。
  後者では、ディレクティブが開く区切りのトークンを `(` と `(` に切ります。
  [fixture: flowchart/lex-directive-between-acctitle-colon] [fixture:
  flowchart/tokens-circle-directive-between]

### `}` の後の空白

`}` の後に改行を含む空白が続くとき、字句解析器は、その空白の最後の改行までを、
1 つの改行として読みます。
この空白は図のテキストのものなので、
その中のコメント領域とディレクティブは除きます。
mermaid.js は、文法がテキストを読む前に、
[`flowParser.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flowParser.ts#L6-L10)
でこの置き換えを行います。

そのため、その空白の中にディレクティブがあっても、結果は mermaid.js と同じです。
`A-- a}`、空白 2 つ、ディレクティブ、空白 2 つ、改行、
` b -->B` のリンクテキストは、`a}`、改行、` b` で、`click A call f(a}`、
空白 2 つ、ディレクティブ、空白 2 つ、改行、` b)` は受理されます。
[fixture: flowchart/lex-brace-link-text-directive] [fixture:
flowchart/lex-brace-callback-arguments-directive]

- データブロックの後の空白で行を終えられます。
  `A@{ shape: rect }` の後に空白と改行が続くものは受理されます。
  文法は、文の終わりのデータブロックの後に空白を受け付けないにもかかわらずです。
  [fixture: flowchart/lex-brace-data-trailing-space] [fixture:
  flowchart/lex-brace-data-trailing-directive]
- そのような `}` を含む文字列の値が変わります。
  `A["a}`、空白 2 つ、改行、`  b"]` のラベルは、`a}`、改行、`  b` です。
  [fixture: flowchart/lex-brace-string]

### 文の文脈

文の文脈の各位置で、字句解析器は、次の規則のうち一致する最初のものを適用します。

1. `accTitle`、0 個以上の空白、`:`、
   0 個以上の空白: `accTitle` の単位と `:` の単位。
   タイトルの文脈に入ります。
2. `accDescr`、0 個以上の空白、`:`、
   0 個以上の空白: `accDescr` の単位と `:` の単位。
   説明の文脈に入ります。
3. `accDescr`、0 個以上の空白、`{`、
   0 個以上の空白: `accDescr` の単位と `{` の単位。
   説明のブロックの文脈に入ります。
4. `@{`: `data-start` の単位。
   データの文脈に入ります。
5. `call` と 1 個以上の空白: `call` の単位。
   コールバック名の文脈に入ります。
6. `"`: 文字列（[文字列](#文字列) を参照）。
   文字列は 1 つの単位です。
7. 後に語の文字が続かない `style`、`default`、`linkStyle`、`interpolate`、
   `classDef`、`class`: そのテキストを名前とする単位。
   `classDef` は `class` より先に試します。
8. `href` と 1 個の空白: `href` の単位。
9. `click` と 1 個以上の空白: `click` の単位。
   クリックの文脈に入ります。
10. 後に語の文字が続かない `flowchart-elk`、`swimlane-beta`、`graph`、
    `flowchart`: `header-keyword` の単位。
    テキストで最初のヘッダーのキーワードは、ヘッダーの文脈にも入ります。
11. 後に語の文字が続かない `subgraph`: `subgraph` の単位。
12. 後に語の文字が続かない `end` と、
    その後のすべての空白（改行を含む）: `end` の単位。
13. 後に語の文字が続かない `_self`、`_blank`、`_parent`、
    `_top`: `link-target` の単位。
14. 方向の行（下を参照）。
15. 辺の id: 空白でも `"` でもない 1 個以上の文字と、その後の、
    `{` でも `"` でもない文字が後に続く `@`。
    並びは、次の空白か `"` より前にある、そのような最後の `@` で終わります。
    その `@` より前の文字は `edge-id` の単位で、`@` は `@` の単位です。
    `A @-->B` は辺の id を持ちません。
    その `@` の前に文字がないからです。
    その `@` を読む規則はないので、入力は拒否されます。
    [fixture: flowchart/lex-edge-id-at-start]
16. 1 個以上の ASCII の数字: `number` の単位。
17. `#`、`:::`、`:`、`&`、`;`、`,`、`*`: そのテキストを名前とする単位。
    `:::` は `:` より先に試します。
18. 矢印（[矢印](#矢印) を参照）: `arrow` の単位、
    または `opening-arrow` の単位。
    後者は、その種類のリンクテキストの文脈に入ります。
19. `(-`（楕円の文脈に入る）、`([`、`[[`、`>`、`[(`、
    `(((`（ラベルの文脈に入る）、`[|`、`[/` か `[\`（斜めの文脈に入る）、`^`。
    どれもそのテキストを名前とする単位で、この順に試します。
    その後に `\|`（バックスラッシュと縦線）: 拒否されます。
    この規則がなければ、規則 21 がバックスラッシュを読みます。
20. 後に語の文字が続かない `v`: `v` の単位。
21. id の並び: 1 個以上の、できるだけ多くの文字で、どれも ASCII の英字か数字、
    `!` `"` `#` `$` `%` `&` `'` `*` `+` `.` `` ` `` `?` `\` `_` `/` のどれか、
    または `>`、`-`、`.` 以外の文字が後に続く `-` であるもの。
    `id-run` の単位。
22. `-`: `-` の単位。
23. Unicode の文字（[Unicode の文字](#unicode-の文字) を参照）: 1 文字の
    `letter` の単位。
24. `|`、`(`、`[`、`{`: そのテキストを名前とする単位。
    ラベルの文脈に入ります。
25. 1 個以上の改行: `newline` の単位。
26. 改行以外の 1 個以上の空白: `space` の単位。

それ以外は拒否されます。
たとえば、単独の `=`、`}`、`]`、`)`、
辺の id にもデータブロックにもならない `@`、
絵文字のような Unicode の文字の外の文字です。
この順序からの帰結をいくつか挙げます。

- キーワードは、単位が始まる位置ならどこでもキーワードで、
  id に見えるものの中でもそうです。
  `A-->1end` では、`1` は数で `end` はキーワードなので、入力は拒否されます。
  id の並びの中では、キーワードはただの文字です。
  `A-->xend` は頂点 `xend` を持ちます。
  [fixture: flowchart/lex-keyword-after-number] [fixture:
  flowchart/lex-keyword-inside-id-run]
- `"` が文字列を始めるのは、単位が始まる位置だけです。
  id の並びの中では id の文字です。
  `A"x"-->B` は頂点 `A"x"` を持ちます。
  空の文字列 `""` は `empty-string` の単位で、文法のどの規則も取らないので
  （[文字列](#文字列) を参照）、`A ""` は拒否されます。
  mermaid.js はこれを頂点 `A` として受理します。
  [fixture: flowchart/lex-quote-in-id] [fixture: flowchart/lex-empty-string]
- `&` が単独の単位を始めるのは、単位が始まる位置だけです。
  `A&B` は 1 つの頂点 `A&B` で、`A & B` は 2 つの頂点です。
  [fixture: flowchart/lex-ampersand-in-id] [fixture:
  flowchart/gram-group-two-vertices]
- 単位の始まりで `--` の前にある `x` や `o` は、矢印の矢じりです。
  `A-->x-->B` では、字句解析器は 2 つの矢印 `-->` と `x-->` を読み、
  入力は拒否されます。
  [fixture: flowchart/lex-arrow-head-x]
- `>` が後に続く `-` は、矢印でも id の並びの一部でもありません。
  `A->B]` は、形 `>B]` を持つ頂点 `A-` です（[形](#形) を参照）。
  [fixture: flowchart/lex-minus-then-tag]
- `accTitle` と `accDescr` がキーワードになるのは、規則 1 と 2 が、
  改行を含む空白を越えてその後に読む `:` があるときだけです。
  `accTitle ; :` は頂点 `accTitle` と `:` です。
  一方、`accTitle`、改行、`:` は、
  タイトルが空で頂点のないアクセシビリティの文です。
  `accDescr` も同じです。
  [fixture: flowchart/lex-acc-title-semicolon-before-colon] [fixture:
  flowchart/lex-acc-title-line-feed-before-colon] [fixture:
  flowchart/lex-acc-descr-semicolon-before-colon] [fixture:
  flowchart/lex-acc-descr-line-feed-before-colon]
- `click`、`call`、`href` がキーワードになるのは、
  後に空白があるときだけで（規則 9、5、8）、改行は空白です。
  `A-->click;B`、`A-->call;B`、`A-->href;B` は、頂点 `click`、`call`、
  `href` へのリンクと、それに続く頂点 `B` です。
  一方、`;` の代わりに改行を置くと、入力は拒否されます。
  `click;A`、`call;A`、`href;A`、`A;click;B` は頂点です。
  [fixture: flowchart/lex-click-keyword-semicolon] [fixture:
  flowchart/lex-call-keyword-semicolon] [fixture:
  flowchart/lex-href-keyword-semicolon] [fixture:
  flowchart/lex-click-keyword-line-feed] [fixture:
  flowchart/lex-call-keyword-line-feed] [fixture:
  flowchart/lex-href-keyword-line-feed] [fixture:
  flowchart/lex-click-keyword-semicolon-vertex] [fixture:
  flowchart/lex-call-keyword-semicolon-statement] [fixture:
  flowchart/lex-href-keyword-semicolon-statement] [fixture:
  flowchart/lex-click-keyword-between-semicolons]
- `[/` や `(-` のような形を開く単位は内側に空白を持たないので、
  `[` や `(` の後の空白は形を変えます。
  `A[ /x/]` はラベル `/x/` の長方形で、
  `A[/x/]` はラベル `x` の `lean-right` の形です。
  `A( -x-)` はラベル `-x-` の角の丸い長方形で、`A(-x-)` は楕円です。
  `A(( -x))` はラベル `-x` の円ですが、
  `A((-x))` では `(` の後の `(-` が楕円を始め、入力は拒否されます。
  辺の id（規則 15）は次の空白で終わります。
  `A[ x@ ]` のラベルは `x@` で、`A-->| x@ |B` のリンクテキストは `x@` です。
  一方、`A[x@]` と `A-->|x@|B` は、`A[x` と `A-->|x` を辺の id として読み、
  拒否されます。
  [fixture: flowchart/lex-square-label-space-slash] [fixture:
  flowchart/lex-lean-right-label] [fixture:
  flowchart/lex-round-label-space-dash] [fixture: flowchart/lex-ellipse-label]
  [fixture: flowchart/lex-circle-label-space-dash] [fixture:
  flowchart/lex-circle-dash-ellipse] [fixture:
  flowchart/lex-edge-id-space-label] [fixture: flowchart/lex-edge-id-in-label]
  [fixture: flowchart/lex-edge-id-space-pipe-label] [fixture:
  flowchart/lex-edge-id-in-pipe-label]

**方向の行。** 今の位置から、改行、U+2028、U+2029 を含まない文字の並び、
`direction`、改行を含んでよい 1 個以上の空白、`TB`、`BT`、`RL`、`LR`、
`TD` のどれか、次の改行までのすべての文字（改行は含まない）が続くものです。
規則は、`direction` の前の文字を `direction-text` の単位、
`direction` を `direction` の単位、値を `direction-value` の単位、
値の後の文字をもう 1 つの `direction-text` の単位として読みます。
空かすべて空白になる `direction-text` の単位は作りません。
mermaid.js は `direction-text` の単位を読みません。
木では、
それらは
[FlowchartDirectionStatement](../ast/flowchart.ja.md#flowchartdirectionstatement)
の `textBefore` と `textAfter` です。
値は挙げた順に試します。
行のどこかに `TB` が後に続く `direction` があれば、値は `TB` です。
なければ `BT` を試し、以下同様です。
ある値について、字句解析器は、その値が後に続く並びの最後の `direction` を取り、
単位はその値がある行の終わりで終わります。
規則 1〜13 が先に試されるので、方向の行は、
そのどれも当てはまらない行の最初の位置で始まり、行の残りを取ります。

- `A-->B direction TB` は方向の行で、頂点もリンクもまったく読まれません。
  `A[direction TB]` も方向の行です。
  [fixture: flowchart/lex-direction-line-swallows-edge] [fixture:
  flowchart/lex-direction-line-in-label] `direction` の前の `;`
  は何も変えません。
  subgraph の中の `A-->B; direction TB` は 1 つの方向の行で、
  subgraph に方向 `TB` を与え、メンバーを持たせません。
  一方、`direction TB` を単独の行にすると、A は B へリンクし、
  subgraph はメンバー B と A を持ちます。
  [fixture: flowchart/lex-direction-line-after-semicolon] [fixture:
  flowchart/lex-direction-line-own-line-after-link]
- `end direction TB` は、キーワード `end` と、それに続く方向の行です。
  `style A direction TB` は、キーワード `style` と、それに続く方向の行で、
  文法はこれを拒否します。
  [fixture: flowchart/lex-direction-line-after-end] [fixture:
  flowchart/lex-direction-line-after-style]
- `A-->B %%{init: {}}%% direction TB` は方向の行で、mermaid.js と同じです。
  `A-->B direction%%{init: {}}%%TB` はそうではありません。
  テキストが `directionTB` だからです。
  入力は、mermaid.js と同じく拒否されます。
  [fixture: flowchart/lex-direction-line-directive-between] [fixture:
  flowchart/lex-direction-line-directive-glued]
- `direction`、改行、`TB` は方向の行です。
  空白は改行を含んでもかまいません。
  [fixture: flowchart/lex-direction-line-value-next-line]
- 字下げだけで読み方が変わる行があります。
  行の始まりの `accTitle: t;direction TB` のタイトルは `t;direction TB` です。
  最初の位置で `accTitle` の規則が当てはまるからです。
  同じ行を空白やタブの後に置くと方向の行になり、タイトルを持ちません。
  最初の空白の位置では、それより前のどの規則も当てはまらないからです。
  subgraph の中では、行の始まりの `accDescr: d ; direction LR` は説明で、
  subgraph に方向を与えません。
  字下げすると、subgraph に方向 `LR` を与えます。
  [fixture: flowchart/lex-direction-line-acc-title-column-zero] [fixture:
  flowchart/lex-direction-line-acc-title-indented] [fixture:
  flowchart/lex-direction-line-acc-title-tab-indented] [fixture:
  flowchart/lex-direction-line-acc-descr-subgraph-column-zero] [fixture:
  flowchart/lex-direction-line-acc-descr-subgraph-indented]
- `;` は空白ではありません。
  `direction ; TB` は方向の行ではなく、頂点 `direction` と `TB` で、
  `A-->direction; TB` は頂点 `direction` へのリンクと頂点 `TB` です。
  一方、`direction`、改行、`TB` は方向の行で、subgraph の外では何も変えません。
  [fixture: flowchart/lex-direction-line-semicolon-before-value] [fixture:
  flowchart/lex-direction-line-link-target-semicolon] [fixture:
  flowchart/lex-direction-line-top-level-next-line]
- 行は値の後にも続きます。
  subgraph の中の `direction TB; A-->B` は、subgraph に方向 `TB` を与え、
  リンクを読みません。
  `direction TB %% vertical` の `%%` は、
  行の中でテキストの後にあるのでコメントではなく、値の後のテキストの一部で、
  次の行のリンクは読まれます。
  文字列もこの規則を防ぎません。
  `A["Set direction LR"]-->B` は、`A[Set direction LR]-->B` と同じく方向の行で、
  どちらも頂点も辺も持ちません。
  [fixture: flowchart/lex-direction-line-then-semicolon-statement] [fixture:
  flowchart/lex-direction-line-percent-after-value] [fixture:
  flowchart/lex-direction-line-in-string-label] [fixture:
  flowchart/lex-direction-line-in-label-with-link]

### 矢印

閉じた矢印も開く矢印も、その前の 0 個以上の空白と、
その後の 0 個以上の空白と一緒に読みます。
両側の空白は、改行を含めてその単位の一部です。
矢印そのものは次のどれかで、この順に試します。

1. **閉じた破線の矢印**: 省略可能な `x`、`o`、`<`（矢じり）、
   その後に 3 個以上の `-`、または 2 個以上の `-` と、それに続く `x`、`o`、`>`。
   `-` はすべて取られます。
   `---->` は 1 つの矢印です。
   例: `-->`、`---`、`--x`、`<-->`、`o--o`。
   矢じりは、後に id が空白なしで続くときも取られます。
   `A---orders` は頂点 `rders` への矢印 `---o` で、
   `A---xray` は `ray` への矢印 `---x` です。
   一方、`A --- orders` は `orders` へのリンクです。
   [fixture: flowchart/lex-arrow-head-o-before-id] [fixture:
   flowchart/lex-arrow-head-x-before-id] [fixture:
   flowchart/lex-arrow-spaced-before-id-o]
2. **開く破線の矢印**: 省略可能な矢じり、その後に `--`。
3. **閉じた太線の矢印**: 省略可能な矢じり、その後に 3 個以上の `=`、
   または 2 個以上の `=` と、それに続く `x`、`o`、`>`。
4. **開く太線の矢印**: 省略可能な矢じり、その後に `==`。
5. **閉じた点線の矢印**: 省略可能な矢じり、省略可能な `-`、1 個以上の `.`、`-`、
   省略可能な `x`、`o`、`>`。
   例: `-.->`、`-.-`、`.-`、`-..-`。
6. **開く点線の矢印**: 省略可能な矢じり、その後に `-.`。
7. **見えない矢印**: 3 個以上の `~`。

閉じた矢印は `arrow` の単位です。
開く矢印は `opening-arrow` の単位で、破線、太線、
点線のリンクテキストの文脈に入ります。
空白は矢印に属するので、2 行に分けた `A` と `-->B` は 1 つのリンクで、
2 行に分けた `A-->` と `B` もそうです。
`A-->B`、改行、
`x-->C` では、2 行目が矢印 `x-->` で始まるので、リンクは `B` から `C` に向かい、
頂点 `x` はありません。
[fixture: flowchart/lex-arrow-line-break-before] [fixture:
flowchart/lex-arrow-line-break-after] [fixture:
flowchart/lex-arrow-line-break-head] [fixture:
flowchart/lex-arrow-line-break-comment]
`-` が 2 つの `<--` は開く矢印なので、
`B <-- C` は閉じる矢印が続かず拒否されます。
mermaid.js も拒否します。
[issue #6402](https://github.com/mermaid-js/mermaid/issues/6402) は、
これを C から B への矢印として読むことを求めていて、
2026-10-01 の時点で未解決で、承認されていて、
不具合と機能追加の両方のラベルを持ちます。
[fixture: flowchart/gram-reverse-arrow-two-dashes]

### ラベルの文脈

ラベルの文脈は、頂点の形のラベルか、縦線のラベル（`|...|`）を読みます。
各位置で:

1. `"`: 文字列（[文字列](#文字列) を参照）。
2. 0 個以上の空白と 3 個以上の `~`: 拒否されます。
3. `(-`、`([`、`(((`: 拒否されます。
   この規則がなければ、規則 5 がその `(` を読みます。
4. `])`、`]]`、`)]`、`)))`、`|`、`)`、`]`、
   `}`（この順に試す）: そのテキストを名前とする単位。
   文脈を出ます。
5. `(` か `{`: そのテキストを名前とする単位。
   ラベルの文脈に入ります。
   文法がこれを受け付けるのは、
   円か六角形を開く `(` か `{` の直後だけです（[形](#形) を参照）。
6. `[`、`]`、`(`、`)`、`{`、`}`、`|`、
   `"` 以外の 1 個以上の文字: `text-run` の単位。

そのため、ラベルは文字列の外の最初の `]`、`)`、`}`、`|` で終わり、
字句解析器がどの閉じる単位を読むかは、その後の文字によります。
`A[x])` は `])` を読みますが、これは長方形を閉じないので拒否されます。
`~~~` は、テキストの並びの中ではテキストですが、
その始まりではそうではありません。
`A[x ~~~]` は受理され、`A[ ~~~x]` は拒否されます。
[fixture: flowchart/lex-label-closing-bracket-paren] [fixture:
flowchart/lex-label-closing-double-bracket] [fixture:
flowchart/lex-label-tilde-inside] [fixture: flowchart/lex-label-tilde-start]
長方形のラベルの中の `(` は、`A[This is a () in text]` のように拒否されますが、
文字列はそれを含めます。
`A["<span style='color:rgb(51,51,51);font-size:12px'>x</span>"]`
は受理されます。
[fixture: flowchart/spec-flow-text-aa363bda] [fixture:
flowchart/lex-label-string-with-parenthesis]

### 斜めの文脈

斜めの文脈は、4 つの斜めの形のラベルを読みます。
各位置で:

1. `"`: 文字列（[文字列](#文字列) を参照）。
2. 0 個以上の空白と 3 個以上の `~`: 拒否されます。
3. `]` が後に続く、`\`、`(`、`?`、`=`、`]`、
   `)` のどれか: `backslash-end` の単位。
   文脈を出ます。
4. `/]`: `slash-end` の単位。
   文脈を出ます。
5. `]` が後に続かない `/` か `\`、または `\`、`[`、`]`、`(`、`)`、`{`、`}`、
   `/` 以外の 1 個以上の文字: `text-run` の単位。

規則 5 は `/` や `\` を単独のテキストの並びとして読むので、
単位が `?` や `=` から始まることがあります。
`A[/a/?]` はラベル `a/` の台形で、`A[/a?]` は拒否されます。
テキストの並び `a?` が `?` を取るからです。
`A[/a]]` と `A[/a)]` は、ラベル `a` の台形です。
[fixture: flowchart/lex-slanted-question-end] [fixture:
flowchart/lex-slanted-question-in-run] [fixture:
flowchart/lex-slanted-double-bracket-end] [fixture:
flowchart/lex-slanted-paren-end] 規則 1 は単位が始まる位置で当てはまります。
`A[/ "x /]` は、空白から始まるテキストの並びが `"` を取るので、
ラベル `"x` の `lean-right` の形です。
一方、`A[/"x/]` は閉じない文字列を始め、入力は拒否されます。
[fixture: flowchart/lex-slanted-label-space-quote] [fixture:
flowchart/lex-slanted-label-quote]

### 楕円の文脈

楕円の文脈は、`(-...-)` のラベルを読みます。
各位置で:

1. `"`: 文字列（[文字列](#文字列) を参照）。
2. 0 個以上の空白と 3 個以上の `~`: 拒否されます。
3. `)` が後に続く `-`、`/`、`)`: `ellipse-end` の単位。
   文脈を出ます。
4. `(`、`)`、`[`、`]`、`{`、`}` 以外の 1 文字: その 1 文字の `text-run` の単位。
   エンティティのプレースホルダは、
   1 つのそのような単位です
   （[エンティティ](../common.ja.md#エンティティ) を参照）。

`A(-a/)` と `A(-a))` はラベル `a` の楕円で、`A(-a|b-)` のラベルは `a|b` です。
[fixture: flowchart/lex-ellipse-slash-end] [fixture:
flowchart/lex-ellipse-paren-end] [fixture: flowchart/lex-ellipse-pipe]
`A(-#x;t-)` と `A(-t#x;-)` のラベルは、`#x;` のプレースホルダと `t` を、
その順に並べたものです。
[fixture: flowchart/lex-ellipse-entity-start] [fixture:
flowchart/lex-ellipse-entity-end]

### リンクテキストの文脈

開く矢印は、その種類（破線、太線、点線）のリンクテキストの文脈に入ります。
各位置で:

1. `"`: 文字列（[文字列](#文字列) を参照）。
2. 同じ種類の閉じた矢印と、その空白（[矢印](#矢印) を参照）: `arrow` の単位。
   文脈を出ます。
3. その種類の文字（破線は `-`、太線は `=`、点線は `.`）以外の 1 文字、または、
   破線の文脈では、`-` が後に続かない `-`: `link-text-char` の単位。
   エンティティのプレースホルダは、
   1 つのそのような単位です
   （[エンティティ](../common.ja.md#エンティティ) を参照）。

そのため、破線のリンクのテキストの中の `--` は、
リンクを閉じるのでなければ拒否されます。
太線のリンクの中の `=` と、点線のリンクの中の `.` も同じです。
閉じる矢印は各位置で最初に試されるので、その前の空白と、
その直前の矢じりの文字は矢印に属します。
`A-- box-->B` のリンクテキストは `bo` で、矢印は `x-->` です。
[fixture: flowchart/lex-link-text-double-dash] [fixture:
flowchart/lex-link-text-equals] [fixture: flowchart/lex-link-text-dot] [fixture:
flowchart/lex-link-text-head-letter] リンクテキストの中のエンティティは 1
つの単位です。
`A--#x;-->B`、`A==#x;==>B`、
`A-.#x;.->B` の辺のテキストは `#x;` のプレースホルダで、数字のエンティティや、
語に `o` や `x` を持つエンティティも同じです。
`A--#x;x-->B` では、エンティティの後の `x` は閉じる矢印の矢じりです。
`A--#x%%{init: {}}%%y;-->B` のように、
エンティティの中のディレクティブはトークンを切ります。
`A--#x;--#y;-->B` は、エンティティがないときの `--` と同じく拒否されます。
[fixture: flowchart/lex-link-text-entity-dash] [fixture:
flowchart/lex-link-text-entity-thick] [fixture:
flowchart/lex-link-text-entity-dotted] [fixture:
flowchart/lex-link-text-entity-between-words] [fixture:
flowchart/lex-link-text-entity-numeric] [fixture:
flowchart/lex-link-text-two-entities] [fixture:
flowchart/lex-link-text-entity-word-o] [fixture:
flowchart/lex-link-text-entity-word-x-o] [fixture:
flowchart/lex-link-text-entity-before-head-x] [fixture:
flowchart/lex-link-text-entity-before-head-o] [fixture:
flowchart/lex-link-text-entity-directive-inside] [fixture:
flowchart/lex-link-text-entity-then-double-dash]

### 文字列

文字列は、文字列を読む文脈の `"` から始まります。
文字列を読む文脈は、文の文脈、ラベル、斜め、楕円、リンクテキストの文脈、
クリックの文脈、ヘッダーの文脈で、それぞれそう述べる規則のところで読みます。
文字列が終わると、字句解析器は、それが始まった文脈に戻ります。
ほかの文脈は、`"` を、そのテキストの文字として、
データの文脈では `data-quote` の単位として読みます。
文字列の文脈で読まれ、
`"` の後にバッククォートが続くときは markdown 文字列の文脈で読まれます。
これらの文脈はさらに文字列の文脈に入ることがあり、文字列は、
開く `"` が入った文脈を字句解析器が出たところで終わります。
開く `"` から閉じる `"` までの文字列全体が 1 つの単位です。
その中で文字列の文脈が読む文字の並びが、その**中身**です。

- 中身がない: `empty-string` の単位。
  これは、id、ラベル、スタイルの値の中を含め、どの 2 つの単位の間にも現れ、
  木にはそこにそれ自体のノードを置く場所がありません。
  そのため、文法のどの規則もこれを取らず、空の文字列のある入力は拒否されます。
  1 行だけの `""`、`""A`、`A[""x]`、`A["a"""]`、`A[x]""` がそうです。
  mermaid.js は空の文字列にトークンを読まず、
  これらをそれがないものとして受理します。
  これらは既知の差
  [`tokenless-empty-forms`](../known-divergences.ja.md#tokenless-empty-forms) です
  （[既知の差](#既知の差) を参照）。
  `A --""> B` はどちらも拒否します。
  リンクのテキストの中では、`""` が開く `--` を終えないからです。
  [fixture: flowchart/lex-empty-string-line] [fixture:
  flowchart/lex-empty-string-before-id] [fixture:
  flowchart/tokens-empty-string-in-label] [fixture:
  flowchart/lex-empty-string-after-string] [fixture:
  flowchart/lex-empty-string-after-shape] [fixture:
  flowchart/lex-empty-string-in-arrow]
- 並びが 1 つ: `string` の単位。
  その並びを markdown 文字列の文脈で読んだ場合は `markdown-string` の単位。
  単位のテキストはその並びです。
- 並びが 2 つ以上: 拒否されます。

ラベルや [StringLiteral](../ast.ja.md#stringliteral) としての文字列の値は、
その中身、つまりその 1 つの並びの [範囲のテキスト](../ast.ja.md#ノード) です。
文脈の区切りは、どう入れ子になっていてもすべて除くので、
外側の区切りの幅では決まりません。
``A[""`x`""]`` は、中身が `x` の markdown 文字列です。
最初の `"` が文字列の文脈に入り、
次の `"` とバッククォートが markdown 文字列の文脈に入って `x` を読み、
バッククォートと `"`、そして最後の `"` が 2 つの文脈を出ます。
`click A href "u"``""` では、`u` の後の `"` とバッククォートが、
何も読まない markdown 文字列の文脈に入るので、
URL は文字列の文脈で読んだ `u` です。
文字列の文脈では、`"` の直後でないバッククォートは中身です。
``A["a`b"]`` のラベルは、`a`、バッククォート、`b` で、種類は `string` です。
``A["""`x`"""]`` は、空の文字列、中身が `x` の markdown 文字列、
もう 1 つの空の文字列なので、拒否されます。
`A["``"x"]` も拒否されます。
markdown 文字列が中身なしで閉じ、
`x` の後の `"` が閉じない文字列を始めるからです。
[fixture: flowchart/gram-string-nested-markdown] [fixture:
flowchart/gram-string-nested-empty-markdown] [fixture:
flowchart/gram-string-backtick-inside] [fixture:
flowchart/gram-string-triple-quotes-markdown] [fixture:
flowchart/gram-string-markdown-empty-then-string]

文字列の文脈では:

1. バッククォートが後に続く `"`: markdown 文字列の文脈に入ります。
2. `"`: 文脈を出ます。
3. `"` 以外の 1 個以上の文字: 中身の並び。

markdown 文字列の文脈では:

1. バッククォートと `"` 以外の 1 個以上の文字: 中身の並び。
2. `"` が後に続くバッククォート: 文脈を出ます。
3. バッククォートが後に続く `"`: markdown 文字列の文脈に入ります。
4. `"`: 文字列の文脈に入ります。

文字列は行をまたいでかまわず、その中の改行は、
次の行の始まりの空白とともにテキストの一部です。
`A["a`、改行、`   b"]` のラベルは、`a`、改行、空白 3 つ、`b` です。
[fixture: flowchart/lex-string-multiline]
[fixture: flowchart/lex-string-multiline-indent]
テキストの終わりまでにその文脈を出ない文字列は単位を作らず、入力は拒否されます。
[fixture: flowchart/lex-string-unclosed] [fixture:
flowchart/lex-markdown-string-unclosed]

### データブロック

`@{` で入るデータの文脈では:

1. `"`: `data-quote` の単位。
   データの文字列の文脈に入ります。
2. `}`、`^`、`"` 以外の 1 個以上の文字: `data-text` の単位。
3. `}`: `}` の単位。
   文脈を出ます。

データの文字列の文脈では、`"` は `data-quote` の単位で文脈を出ます。
他の 1 個以上の文字は `data-text` の単位です。
そのため、データブロックは引用符付きの文字列の外の最初の `}` で終わり、
引用符付きの文字列の外の `^` は拒否されます。
[fixture: flowchart/lex-data-brace-in-string] [fixture:
flowchart/lex-data-caret]

### クリックとコールバック

クリックの文脈は、`click` とその後の空白で入ります。

1. `"`: 文字列（[文字列](#文字列) を参照）。
   それが終わると、字句解析器はクリックの文脈に戻ります。
2. 1 個の空白: 文脈を出ます。
3. 空白以外の 1 個以上の文字: その中の各 `,` は `click-comma` の単位で、
   それ以外の文字の各並びは `click-id` の単位。

そのため、クリックの文の id は、
次の空白までのすべての文字を各 `,` で区切ったもので、
その後の 1 個の空白は id と一緒に読まれます。
規則 3 はできるだけ多くの文字を読むので、規則 1 が当てはまるのは、
文脈の始まりと、文字列の直後だけです。
`,` の後の `"` は次の id に属し、`click A"" href "x"` の id は `A""` で、
どの頂点も指しません。
[fixture: flowchart/lex-click-id-with-quotes]
`click A[x],B href "u"` は id `A[x]` と `B` を、
`click A,"x" href "u"` は id `A` と `"x"` を読みます。
どちらも mermaid.js と同じです。
[fixture: flowchart/lex-click-id-comma] [fixture:
flowchart/lex-click-id-comma-quote] クリックの文脈が読む `,` は、
`,` の単位ではなく `click-comma` の単位です。
mermaid.js はそれをクリックの id の一部として読みますが、
文の文脈の `,` はそれ自体が 1 つの単位で、
クリックの文の文法はそれを受け付けません。
そのため、`click , href "x"` と `click , call cb()` は id が空のクリックの文で、
`,href "x"` と `,call cb()` は拒否されます。
`,cb` だけの行は頂点 `,cb` です。
[fixture: flowchart/gram-click-comma-only-href] [fixture:
flowchart/gram-comma-href-statement] [fixture:
flowchart/gram-click-comma-only-call] [fixture:
flowchart/gram-comma-call-statement] [fixture:
flowchart/lex-comma-starts-vertex-id]
その文字は改行でもかまいません。
`click A`、改行、`cb` は、クリックの文 `click A cb` です。
id の後の 2 個の空白は拒否されます。
2 個目が、文法がコールバックを求める位置の `space` の単位になるからです。
字下げが続く改行も同じで、`click A`、改行、`  cb` は拒否されます。
[fixture: flowchart/lex-click-line-feed] [fixture:
flowchart/lex-click-two-spaces] [fixture:
flowchart/lex-click-line-feed-indented]

文法はクリックの文に文字列を許さないので、id の前の文字列は拒否されます。
`click "A" href "x"` と、中身のある markdown 文字列を置いたものがそうです。
そこにある空の文字列も拒否されます（[文字列](#文字列) を参照）。
`click ""A href "x"`、
`""` の代わりに空の markdown 文字列 `"``"` や 2 つの空の文字列を置いたもの、
`click ""A,B href "x"`、`click ""A callback` は、ここでは拒否されます。
mermaid.js はこれらを受理し、最初の id は `A` です。
`click "" A href "x"` はどちらも拒否します。
空の文字列の後の空白が、id の前で文脈を出るからです。
`click A ""href "x"` のように id とその空白の後にある空の文字列は、
文の文脈で読まれ、同じく入力を拒否させます。
[fixture: flowchart/gram-click-empty-string-before-id] [fixture:
flowchart/gram-click-empty-markdown-string-before-id] [fixture:
flowchart/gram-click-two-empty-strings-before-id] [fixture:
flowchart/gram-click-empty-string-before-ids] [fixture:
flowchart/gram-click-empty-string-before-callback-id] [fixture:
flowchart/gram-click-string-id] [fixture:
flowchart/gram-click-markdown-string-id] [fixture:
flowchart/gram-click-empty-string-then-space] [fixture:
flowchart/gram-click-empty-string-after-id]

`click` は予約語です。
文法は、`click` の単位を、クリックの文の最初の単位としてだけ読みます。
クリックの文は、文を始められる位置から始まります。
それ以外の位置にある `click` の単位は、入力を拒否させます。
mermaid.js は、字句解析器が `click` と空白を読むところでは、
どこでもクリックの文脈に入り、
そのような `click` をほかの位置に持つ入力のいくつかを受理します。
それらは既知の差
[`click-reserved-word`](../known-divergences.ja.md#click-reserved-word)
です（[既知の差](#既知の差) を参照）。
そのため、クリックの文は、始まりに `click` の単位を 1 つだけ持ち、
そのクリックの id は、その単位のクリックの文脈が読むものです。
`click A click href "u"`、`click A click B href "u"`、
`click A click cb "tip"`、`click A, click B href "u"`、
`click A click , href "u"`、`click A click ""href "u"`、
`click A click B call cb()`、`click A cb click B`、
`click A href "u" click _blank` は、mermaid.js と同じく拒否され、
`style A click fill:red`、`style A click ""fill:red`、`A:click b-->C`
も拒否されます。
一方、`click A,B href "u"` は受理されます。
[fixture: flowchart/gram-click-second-click-before-href]
[fixture: flowchart/gram-click-second-click-id-before-href]
[fixture: flowchart/gram-click-second-click-before-callback]
[fixture: flowchart/gram-click-second-click-after-comma]
[fixture: flowchart/gram-click-second-click-comma]
[fixture: flowchart/gram-click-second-click-empty-string-then-id]
[fixture: flowchart/gram-click-second-click-call]
[fixture: flowchart/gram-click-mid-statement-click-id]
[fixture: flowchart/gram-click-mid-statement-link-target]
[fixture: flowchart/gram-style-click-id-before-style]
[fixture: flowchart/gram-style-click-empty-string-then-click-id]
[fixture: flowchart/gram-click-ids-after-id-colon]
[fixture: flowchart/gram-click-two-ids-one-click]
語 `click` が `click` の単位になるのは、
単位の始まりにあり、後に空白が続くときだけです
（[文の文脈](#文の文脈) の規則 9）。
`A-click` と `vclick` は id の並びで、
`A:click""b` では、`A` と `:` の後の `click""b` が id の並びです。
[fixture: flowchart/lex-click-inside-id-run-vertex]
[fixture: flowchart/lex-click-v-id-run]
[fixture: flowchart/lex-click-no-whitespace-in-id]
`click` の単位が入ったクリックの文脈が、何も読まないうちにテキストが終わると、
入力は拒否されます。
mermaid.js はそこで空のクリックの id を読むからです。
テキストの終わりの、後に改行が続く `A-->B click` がそうです。
[fixture: flowchart/lex-click-at-end-of-text]

コールバック名の文脈は、`call` とその後の空白で入ります。

1. `(`、0 個以上の空白、`)`: `(` の単位と `)` の単位。
   文脈を出ます。
2. `(`: `(` の単位。
   文脈を出て、コールバックの引数の文脈に入ります。
3. `(` 以外の 1 個以上の文字: `callback-name` の単位。

コールバックの引数の文脈では、`)` は `)` の単位で文脈を出て、
他の 1 個以上の文字は `callback-arguments` の単位です。
名前と引数は、改行を含めてどの文字を含んでもかまいませんが、
`(` のないコールバックはテキストの残りを名前として読み、拒否されます。
テキストがコールバック名の文脈か、コールバックの引数の文脈の中で終わると、
入力は拒否されます。
mermaid.js はそこで空の名前か空の引数を読むからです。
[fixture: flowchart/lex-callback-no-parenthesis] [fixture:
flowchart/lex-callback-arguments-end-of-text]

mermaid.js は、`call` の単位と、
コールバックの文脈の `(` と `)` の単位について、トークンを読みません。
コールバックのうち、その文法のトークンになるのは名前と引数だけです。
この仕様の文法は、これらの単位を、クリックの文の中で、
名前と引数の前後にあるものとして読みます
（[クリックの文](#クリックの文) を参照）。
`call` の単位の後に、`(` の単位と `)` の単位が、
間に空白だけを挟んで直接続くものを、**空の呼び出し**と呼びます。
空の呼び出しは名前も引数も持ちません。
空の文字列と同じく、値の中を含め、どの 2 つの単位の間にも現れ、
木にはそこにそれを置く場所がありません。
そのため、文法のどの規則もそれを取らず、空の呼び出しのある入力は拒否されます。
mermaid.js はそのどれにもトークンを読まず、
次のような場所で、それがないものとして受理します。
1 行だけの `call ()`、`A call ()`、`call () B`、`A call ()-->B`、
`A-->call ()B`（`(` と `)` の間に改行があっても同じ）、
頂点 `A,` としての `A,call ()`、
クリックの文の中では、`click A cb` と同じものとしての `click A call ()cb`、
`click A call ()href "u"` がそうです。
これらは既知の差
[`tokenless-empty-forms`](../known-divergences.ja.md#tokenless-empty-forms) です。
`A-->call () B` はどちらも拒否します。
mermaid.js は空の呼び出しの後の空白を、行き先の前の空白として読むからです。
[fixture: flowchart/gram-empty-call-line]
[fixture: flowchart/gram-empty-call-after-vertex]
[fixture: flowchart/gram-empty-call-before-vertex]
[fixture: flowchart/gram-empty-call-before-link]
[fixture: flowchart/gram-empty-call-after-arrow]
[fixture: flowchart/gram-empty-call-line-feed]
[fixture: flowchart/gram-empty-call-after-comma]
[fixture: flowchart/gram-click-empty-call-before-callback]
[fixture: flowchart/gram-click-empty-call-before-href]
[fixture: flowchart/gram-empty-call-after-arrow-space]
`call` は、後に空白が続くときだけキーワードです
（[文の文脈](#文の文脈) の規則 5）。
`call()` は拒否されます。
コールバックの名前や引数を受け付けるのは、
クリックの id の後に続くクリックの文だけです。
`,call x` と `A,call (x)` は拒否され、
クリックの id が `,call` である `click ,call ()` も拒否されます。
[fixture: flowchart/gram-call-no-whitespace]
[fixture: flowchart/gram-call-name-outside-click]
[fixture: flowchart/gram-call-arguments-outside-click]
[fixture: flowchart/gram-click-comma-call-empty]
クリックの文の中では、
引数が、名前の後の 2 つ目の `call` の後に来ることもあります。
`click A call cb()call (x)` は、`click A call cb(x)` と同じく、
引数 `x` で `cb` を呼びます。
`click A call ()` だけのもの、id の後に空白がある `click A call () href "u"`、
引数が 2 つある `click A call cb(y)call (x)`、
名前が 2 つある `click A call cb()call x()` は、どちらも拒否します。
[fixture: flowchart/gram-click-empty-call-then-arguments]
[fixture: flowchart/gram-click-empty-call-only]
[fixture: flowchart/gram-click-empty-call-space-before-href]
[fixture: flowchart/gram-click-call-arguments-twice]
[fixture: flowchart/gram-click-call-name-twice]

### アクセシビリティの値

タイトルの文脈と説明の文脈では、改行はそれを読まずに文脈を出て、
他の 1 個以上の文字は `title-text` か `description-text` の単位です。
そのため、これらは行の残りを読み、それは空でもかまいません。
説明のブロックの文脈では、`}` は `}` の単位で文脈を出て、
他の 1 個以上の文字は `description-block-text` の単位です。
`}` の前でテキストが終わると、ブロックは `}` を持ちません。
テキストの終わりの `accDescr { x` と `accDescr {` は、
mermaid.js と同じく受理されます。
[fixture: flowchart/lex-acc-descr-block-unclosed] [fixture:
flowchart/lex-acc-descr-block-unclosed-empty]
`accDescr` の単位と `{` の単位の後に、
`description-block-text` の単位なしで `}` の単位が直接続くものを、
**空の説明ブロック**と呼びます。
それはテキストのない説明のブロックの文です
（[方向とアクセシビリティの文](#方向とアクセシビリティの文) を参照）。
そのため、ほかの文と同じく、文が始まる位置で受理されます。
1 行だけの `accDescr {}`、`;` の後の `accDescr {}`、
2 行に分けた `{` と `}`（間にコメント行があっても同じ）は、何も変えません。
[fixture: flowchart/db-acc-descr-empty-block-alone]
[fixture: flowchart/db-acc-descr-empty-block-spaces-alone]
[fixture: flowchart/db-acc-descr-empty-block-lines-alone]
[fixture: flowchart/db-acc-descr-block-comment-only-alone]
[fixture: flowchart/db-acc-descr-empty-block-keeps]
[fixture: flowchart/db-acc-descr-empty-block-after-semicolon-keeps]
[fixture: flowchart/db-acc-descr-empty-block-lines-keeps]
[fixture: flowchart/db-acc-descr-block-comment-only-keeps]
それ以外の位置では、それは文の中にあり、木にはそこにそれを置く場所がないので、
文法のどの規則もそれを取らず、入力は拒否されます。
`A accDescr {}`、`A accDescr {}-->B`、
2 行に分けた `A accDescr {` と `}` がそうです。
mermaid.js は空の説明ブロックにトークンを読まず、
これらを、それがないものとして受理します。
これらは既知の差
[`tokenless-empty-forms`](../known-divergences.ja.md#tokenless-empty-forms) です。
`A-->accDescr {} B` は、どちらも拒否します。
mermaid.js はブロックの後の空白を、行き先の前の空白として読むからです。
`A accDescr {x}` も、どちらも拒否します。
テキストのあるブロックはそれ自体が 1 つの文で、
ほかの文の中では始まらないからです。
[fixture: flowchart/gram-acc-descr-block-empty]
[fixture: flowchart/gram-empty-description-block-after-vertex]
[fixture: flowchart/gram-empty-description-block-before-link]
[fixture: flowchart/gram-empty-description-block-line-feed]
[fixture: flowchart/gram-empty-description-block-after-arrow-space]
[fixture: flowchart/gram-description-block-after-vertex]
規則は、`:` や `{` の後の空白を、
改行を含めて、`:` や `{` の単位の一部として読みます。
`accTitle:`、改行、`  foo` のタイトルは `foo` です。
[fixture: flowchart/lex-acc-title-next-line] そのため、
次の行の文がタイトルになります。
`accTitle:`、改行、`A-->B` のタイトルは `A-->B` で、頂点も辺もありません。
[fixture: flowchart/lex-acc-title-next-line-statement]

### ヘッダーの文脈

最初のヘッダーのキーワードが、ヘッダーの文脈に入ります。

1. 改行を含む空白の、最後の改行まで: `no-direction` の単位。
   文脈を出ます。
2. 0 個以上の空白、その後に、後に語の文字が続かない `LR`、`RL`、`TB`、`BT`、
   `TD`、`BR`、`v`、または `<`、`>`、`^`: その方向の `header-direction` の単位。
   文脈を出ます。
3. `"`: 文字列（[文字列](#文字列) を参照）。
   それが終わると、字句解析器はヘッダーの文脈に戻ります。

規則 1 が先なので、次の行の方向は方向ではありません。
`flowchart`、改行、`LR` は方向を持たず、頂点 `LR` を持ちます。
`flowchart LR;A` は受理され、`graph;A` は拒否されます。
[fixture: flowchart/header-direction-next-line] [fixture:
flowchart/header-semicolon-no-direction] 文法はヘッダーに文字列を許しません。
中身のある文字列を持つ `flowchart"x" TD` は拒否され、
空の文字列も拒否されます（[文字列](#文字列) を参照）。
`flowchart"" TD`、`flowchart""TD`、`flowchart"""" TD`、
`flowchart` の後に空の markdown 文字列 `"``"` と ` TD` が続くもの、
`flowchart"" LR;A`、`flowchart""` の後に改行が続くものは、ここでは拒否されます。
mermaid.js はこれらを、空の文字列がないものとして受理し、
方向は `TD`、`LR`、またはなしです。
`flowchart "" TD` はどちらも拒否します。
方向も改行も続かない空白を読むヘッダーの文脈の規則はないからです。
[fixture: flowchart/header-empty-string-before-direction] [fixture:
flowchart/header-empty-string-no-space] [fixture:
flowchart/header-two-empty-strings] [fixture:
flowchart/header-empty-markdown-string] [fixture:
flowchart/header-empty-string-semicolon] [fixture:
flowchart/header-empty-string-no-direction] [fixture:
flowchart/header-space-before-empty-string] [fixture: flowchart/header-string]

### Unicode の文字

`letter` の単位は、次の範囲の 1 文字です。
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L211-L272)
が挙げる文字です: U+00AA, U+00B5, U+00BA, U+00C0–U+00D6, U+00D8–U+00F6,
U+00F8–U+02C1, U+02C6–U+02D1, U+02E0–U+02E4, U+02EC, U+02EE, U+0370–U+0374,
U+0376, U+0377, U+037A–U+037D, U+0386, U+0388–U+038A, U+038C, U+038E–U+03A1,
U+03A3–U+03F5, U+03F7–U+0481, U+048A–U+0527, U+0531–U+0556, U+0559,
U+0561–U+0587, U+05D0–U+05EA, U+05F0–U+05F2, U+0620–U+064A, U+066E, U+066F,
U+0671–U+06D3, U+06D5, U+06E5, U+06E6, U+06EE, U+06EF, U+06FA–U+06FC, U+06FF,
U+0710, U+0712–U+072F, U+074D–U+07A5, U+07B1, U+07CA–U+07EA, U+07F4, U+07F5,
U+07FA, U+0800–U+0815, U+081A, U+0824, U+0828, U+0840–U+0858, U+08A0,
U+08A2–U+08AC, U+0904–U+0939, U+093D, U+0950, U+0958–U+0961, U+0971–U+0977,
U+0979–U+097F, U+0985–U+098C, U+098F, U+0990, U+0993–U+09A8, U+09AA–U+09B0,
U+09B2, U+09B6–U+09B9, U+09BD, U+09CE, U+09DC, U+09DD, U+09DF–U+09E1, U+09F0,
U+09F1, U+0A05–U+0A0A, U+0A0F, U+0A10, U+0A13–U+0A28, U+0A2A–U+0A30, U+0A32,
U+0A33, U+0A35, U+0A36, U+0A38, U+0A39, U+0A59–U+0A5C, U+0A5E, U+0A72–U+0A74,
U+0A85–U+0A8D, U+0A8F–U+0A91, U+0A93–U+0AA8, U+0AAA–U+0AB0, U+0AB2, U+0AB3,
U+0AB5–U+0AB9, U+0ABD, U+0AD0, U+0AE0, U+0AE1, U+0B05–U+0B0C, U+0B0F, U+0B10,
U+0B13–U+0B28, U+0B2A–U+0B30, U+0B32, U+0B33, U+0B35–U+0B39, U+0B3D, U+0B5C,
U+0B5D, U+0B5F–U+0B61, U+0B71, U+0B83, U+0B85–U+0B8A, U+0B8E–U+0B90,
U+0B92–U+0B95, U+0B99, U+0B9A, U+0B9C, U+0B9E, U+0B9F, U+0BA3, U+0BA4,
U+0BA8–U+0BAA, U+0BAE–U+0BB9, U+0BD0, U+0C05–U+0C0C, U+0C0E–U+0C10,
U+0C12–U+0C28, U+0C2A–U+0C33, U+0C35–U+0C39, U+0C3D, U+0C58, U+0C59, U+0C60,
U+0C61, U+0C85–U+0C8C, U+0C8E–U+0C90, U+0C92–U+0CA8, U+0CAA–U+0CB3,
U+0CB5–U+0CB9, U+0CBD, U+0CDE, U+0CE0, U+0CE1, U+0CF1, U+0CF2, U+0D05–U+0D0C,
U+0D0E–U+0D10, U+0D12–U+0D3A, U+0D3D, U+0D4E, U+0D60, U+0D61, U+0D7A–U+0D7F,
U+0D85–U+0D96, U+0D9A–U+0DB1, U+0DB3–U+0DBB, U+0DBD, U+0DC0–U+0DC6,
U+0E01–U+0E30, U+0E32, U+0E33, U+0E40–U+0E46, U+0E81, U+0E82, U+0E84, U+0E87,
U+0E88, U+0E8A, U+0E8D, U+0E94–U+0E97, U+0E99–U+0E9F, U+0EA1–U+0EA3, U+0EA5,
U+0EA7, U+0EAA, U+0EAB, U+0EAD–U+0EB0, U+0EB2, U+0EB3, U+0EBD, U+0EC0–U+0EC4,
U+0EC6, U+0EDC–U+0EDF, U+0F00, U+0F40–U+0F47, U+0F49–U+0F6C, U+0F88–U+0F8C,
U+1000–U+102A, U+103F, U+1050–U+1055, U+105A–U+105D, U+1061, U+1065, U+1066,
U+106E–U+1070, U+1075–U+1081, U+108E, U+10A0–U+10C5, U+10C7, U+10CD,
U+10D0–U+10FA, U+10FC–U+1248, U+124A–U+124D, U+1250–U+1256, U+1258,
U+125A–U+125D, U+1260–U+1288, U+128A–U+128D, U+1290–U+12B0, U+12B2–U+12B5,
U+12B8–U+12BE, U+12C0, U+12C2–U+12C5, U+12C8–U+12D6, U+12D8–U+1310,
U+1312–U+1315, U+1318–U+135A, U+1380–U+138F, U+13A0–U+13F4, U+1401–U+166C,
U+166F–U+167F, U+1681–U+169A, U+16A0–U+16EA, U+1700–U+170C, U+170E–U+1711,
U+1720–U+1731, U+1740–U+1751, U+1760–U+176C, U+176E–U+1770, U+1780–U+17B3,
U+17D7, U+17DC, U+1820–U+1877, U+1880–U+18A8, U+18AA, U+18B0–U+18F5,
U+1900–U+191C, U+1950–U+196D, U+1970–U+1974, U+1980–U+19AB, U+19C1–U+19C7,
U+1A00–U+1A16, U+1A20–U+1A54, U+1AA7, U+1B05–U+1B33, U+1B45–U+1B4B,
U+1B83–U+1BA0, U+1BAE, U+1BAF, U+1BBA–U+1BE5, U+1C00–U+1C23, U+1C4D–U+1C4F,
U+1C5A–U+1C7D, U+1CE9–U+1CEC, U+1CEE–U+1CF1, U+1CF5, U+1CF6, U+1D00–U+1DBF,
U+1E00–U+1F15, U+1F18–U+1F1D, U+1F20–U+1F45, U+1F48–U+1F4D, U+1F50–U+1F57,
U+1F59, U+1F5B, U+1F5D, U+1F5F–U+1F7D, U+1F80–U+1FB4, U+1FB6–U+1FBC, U+1FBE,
U+1FC2–U+1FC4, U+1FC6–U+1FCC, U+1FD0–U+1FD3, U+1FD6–U+1FDB, U+1FE0–U+1FEC,
U+1FF2–U+1FF4, U+1FF6–U+1FFC, U+2071, U+207F, U+2090–U+209C, U+2102, U+2107,
U+210A–U+2113, U+2115, U+2119–U+211D, U+2124, U+2126, U+2128, U+212A–U+212D,
U+212F–U+2139, U+213C–U+213F, U+2145–U+2149, U+214E, U+2183, U+2184,
U+2C00–U+2C2E, U+2C30–U+2C5E, U+2C60–U+2CE4, U+2CEB–U+2CEE, U+2CF2, U+2CF3,
U+2D00–U+2D25, U+2D27, U+2D2D, U+2D30–U+2D67, U+2D6F, U+2D80–U+2D96,
U+2DA0–U+2DA6, U+2DA8–U+2DAE, U+2DB0–U+2DB6, U+2DB8–U+2DBE, U+2DC0–U+2DC6,
U+2DC8–U+2DCE, U+2DD0–U+2DD6, U+2DD8–U+2DDE, U+2E2F, U+3005, U+3006,
U+3031–U+3035, U+303B, U+303C, U+3041–U+3096, U+309D–U+309F, U+30A1–U+30FA,
U+30FC–U+30FF, U+3105–U+312D, U+3131–U+318E, U+31A0–U+31BA, U+31F0–U+31FF,
U+3400–U+4DB5, U+4E00–U+9FCC, U+A000–U+A48C, U+A4D0–U+A4FD, U+A500–U+A60C,
U+A610–U+A61F, U+A62A, U+A62B, U+A640–U+A66E, U+A67F–U+A697, U+A6A0–U+A6E5,
U+A717–U+A71F, U+A722–U+A788, U+A78B–U+A78E, U+A790–U+A793, U+A7A0–U+A7AA,
U+A7F8–U+A801, U+A803–U+A805, U+A807–U+A80A, U+A80C–U+A822, U+A840–U+A873,
U+A882–U+A8B3, U+A8F2–U+A8F7, U+A8FB, U+A90A–U+A925, U+A930–U+A946,
U+A960–U+A97C, U+A984–U+A9B2, U+A9CF, U+AA00–U+AA28, U+AA40–U+AA42,
U+AA44–U+AA4B, U+AA60–U+AA76, U+AA7A, U+AA80–U+AAAF, U+AAB1, U+AAB5, U+AAB6,
U+AAB9–U+AABD, U+AAC0, U+AAC2, U+AADB–U+AADD, U+AAE0–U+AAEA, U+AAF2–U+AAF4,
U+AB01–U+AB06, U+AB09–U+AB0E, U+AB11–U+AB16, U+AB20–U+AB26, U+AB28–U+AB2E,
U+ABC0–U+ABE2, U+AC00–U+D7A3, U+D7B0–U+D7C6, U+D7CB–U+D7FB, U+F900–U+FA6D,
U+FA70–U+FAD9, U+FB00–U+FB06, U+FB13–U+FB17, U+FB1D, U+FB1F–U+FB28,
U+FB2A–U+FB36, U+FB38–U+FB3C, U+FB3E, U+FB40, U+FB41, U+FB43, U+FB44,
U+FB46–U+FBB1, U+FBD3–U+FD3D, U+FD50–U+FD8F, U+FD92–U+FDC7, U+FDF0–U+FDFB,
U+FE70–U+FE74, U+FE76–U+FEFC, U+FF21–U+FF3A, U+FF41–U+FF5A, U+FF66–U+FFBE,
U+FFC2–U+FFC7, U+FFCA–U+FFCF, U+FFD2–U+FFD7, U+FFDA–U+FFDC。
範囲の外の文字で、他のどの規則も読まないものは拒否されます。
`é`（U+00E9）は文字ですが、`°`（U+00B0）は文字ではありません。
[fixture: flowchart/lex-letter-in-id] [fixture: flowchart/lex-non-letter]

## 文法

文法は [common.ja.md](../common.ja.md#表記) の記法を、
文字ではなく単位の上で使います。
`id-run` のような単位の名前は、その名前の単位 1 つを表し、
二重引用符の中のテキストは、`"style"` や `"["` のように、
そのテキストを名前とする単位を表します。
`end-of-text` はテキストの終わりを表します。
これは単位ではなく、複数の規則がそれを見ることができます。
どの規則も取らない単位は、入力を拒否させます。
`empty-string` の単位がその例です（[文字列](#文字列) を参照）。
繰り返しを最後まで進められない場合、その繰り返しは取られず、
規則はその後に続くものへ進みます。
この文法は
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L302-L633)
の文法を述べ直したもので、同じ単位の並びを受理します。

次の各規則が、
[ast/flowchart.ja.md](../ast/flowchart.ja.md) で定める木のノードを作ります。

| 規則                                                                                            | ノード                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `diagram`                                                                                       | [`FlowchartDiagram`](../ast/flowchart.ja.md#flowchartdiagram)                                                                                                                                                                |
| `empty-statement`                                                                               | [`FlowchartEmptyStatement`](../ast/flowchart.ja.md#flowchartemptystatement)                                                                                                                                                  |
| `vertex-statement`                                                                              | [`FlowchartVertexStatement`](../ast/flowchart.ja.md#flowchartvertexstatement)                                                                                                                                                |
| `vertex-group`                                                                                  | [`FlowchartVertexGroup`](../ast/flowchart.ja.md#flowchartvertexgroup)                                                                                                                                                        |
| `vertex`                                                                                        | [`FlowchartVertex`](../ast/flowchart.ja.md#flowchartvertex)                                                                                                                                                                  |
| `shape`                                                                                         | [`FlowchartShape`](../ast/flowchart.ja.md#flowchartshape)。`"[\|"` の選択肢では、さらに [`FlowchartShapeProperty`](../ast/flowchart.ja.md#flowchartshapeproperty)                                                            |
| `label`, `link-text`, `subgraph-name`                                                           | [`FlowchartLabel`](../ast/flowchart.ja.md#flowchartlabel)                                                                                                                                                                    |
| `id`、`id-list-part`、`click-id`、`edge-id`、`callback-name`、`name`、`"[\|"` の後の各 `id-run` | [`Identifier`](../ast.ja.md#identifier)                                                                                                                                                                                      |
| クリックの文の `string`                                                                         | [`StringLiteral`](../ast.ja.md#stringliteral)                                                                                                                                                                                |
| リンクスタイルの文の `number`                                                                   | [`NumericLiteral`](../ast.ja.md#numericliteral)                                                                                                                                                                              |
| `style`、`callback-arguments`、`title-text`、`description-text`、`description-block-text`       | [`FlowchartLiteral`](../ast/flowchart.ja.md#flowchartliteral)。すべて空白の `style` は null（[FlowchartStyleStatement](../ast/flowchart.ja.md#flowchartstylestatement) を参照）                                              |
| `data`                                                                                          | [`FlowchartDataBlock`](../ast/flowchart.ja.md#flowchartdatablock)                                                                                                                                                            |
| `link`                                                                                          | [`FlowchartLink`](../ast/flowchart.ja.md#flowchartlink)。その行き先は、その後の頂点のグループ                                                                                                                                |
| `arrow`                                                                                         | [`FlowchartArrow`](../ast/flowchart.ja.md#flowchartarrow)                                                                                                                                                                    |
| `opening-arrow`                                                                                 | [`FlowchartOpeningArrow`](../ast/flowchart.ja.md#flowchartopeningarrow)                                                                                                                                                      |
| `subgraph-statement`                                                                            | [`FlowchartSubgraphStatement`](../ast/flowchart.ja.md#flowchartsubgraphstatement)                                                                                                                                            |
| `style-statement`                                                                               | [`FlowchartStyleStatement`](../ast/flowchart.ja.md#flowchartstylestatement)                                                                                                                                                  |
| `class-def-statement`                                                                           | [`FlowchartClassDefStatement`](../ast/flowchart.ja.md#flowchartclassdefstatement)                                                                                                                                            |
| `class-statement`                                                                               | [`FlowchartClassStatement`](../ast/flowchart.ja.md#flowchartclassstatement)                                                                                                                                                  |
| `link-style-statement`                                                                          | [`FlowchartLinkStyleStatement`](../ast/flowchart.ja.md#flowchartlinkstylestatement)。`"default"` のときは [`FlowchartDefaultLinkStyleStatement`](../ast/flowchart.ja.md#flowchartdefaultlinkstylestatement)                  |
| `click-statement`                                                                               | [`FlowchartClickCallbackStatement`](../ast/flowchart.ja.md#flowchartclickcallbackstatement)（1 つ目と 3 つ目の選択肢）。2 つ目の選択肢では [`FlowchartClickUrlStatement`](../ast/flowchart.ja.md#flowchartclickurlstatement) |
| `direction-statement`                                                                           | [`FlowchartDirectionStatement`](../ast/flowchart.ja.md#flowchartdirectionstatement)                                                                                                                                          |
| `title-statement`                                                                               | [`FlowchartAccTitleStatement`](../ast/flowchart.ja.md#flowchartacctitlestatement)                                                                                                                                            |
| `description-statement`                                                                         | [`FlowchartAccDescrStatement`](../ast/flowchart.ja.md#flowchartaccdescrstatement)                                                                                                                                            |
| `description-block-statement`                                                                   | [`FlowchartAccDescrBlockStatement`](../ast/flowchart.ja.md#flowchartaccdescrblockstatement)                                                                                                                                  |

### 図と文

```text
diagram                     = header line*
header                      = header-keyword ( no-direction | header-direction ( ";" | newline | space+ newline ) )
line                        = statement | empty-statement | newline | space
statement                   = vertex-statement separator
                            | style-statement separator
                            | class-def-statement separator
                            | class-statement separator
                            | link-style-statement separator
                            | click-statement separator
                            | subgraph-statement
                            | direction-statement
                            | title-statement
                            | description-statement
                            | description-block-statement
empty-statement             = ";"
separator                   = newline | ";" | end-of-text
direction-statement         = direction-text? "direction" direction-value direction-text?
title-statement             = "accTitle" ":" title-text?
description-statement       = "accDescr" ":" description-text?
description-block-statement = "accDescr" "{" description-block-text? ( "}" | end-of-text )
```

図はテキストの終わりで終わります。
ヘッダーの方向の後の `space` の後には、改行が続かなければなりません。
`flowchart TD ;` は拒否されます。
[fixture: flowchart/header-space-before-semicolon] subgraph、方向の文、
アクセシビリティの文以外の文の後には、その区切り、つまり改行、`;`、
テキストの終わりのどれかが続かなければなりません。
そのため、`class A c; %%{init: {}}%%` は受理されますが、`;` がなければ、
ディレクティブの前の空白がクラス名の後の `space` の単位になり、
入力は拒否されます。
`class A c""` では引用符が id の並びの文字で、クラスは `c""` です。
一方、`class A c;""` では、それは区切りの後の空の文字列で、
入力は拒否されます（[文字列](#文字列) を参照）。
[fixture: flowchart/gram-separator-before-directive] [fixture:
flowchart/gram-no-separator-before-directive] [fixture:
flowchart/gram-separator-before-empty-string] [fixture:
flowchart/lex-quotes-after-class-name]
区切りはどの文にも属しません
（[ast/flowchart.ja.md](../ast/flowchart.ja.md#トークン) を参照）。
文法が読むそれ以外の `;` は、どれも空の文です。
区切りの後の 2 つ目の `;`、1 行だけの `;`、
区切りを取らない文の直後の `;` がそうです。
`end` はその後の空白を取るので、1 行だけの `end;` の `;` は空の文です。
[fixture: flowchart/db-subgraph-member-empty-statement] [fixture:
flowchart/db-subgraph-member-empty-statement-end] [fixture:
flowchart/gram-empty-statement-line] 区切りの後に続く改行は、
それ自体が 1 つの行です。

### 頂点の文

```text
vertex-statement = vertex-group ( data | space+ )? ( link vertex-group ( data | space+ )? )*
vertex-group     = vertex ( data? space+ "&" space+ vertex )*
vertex           = id shape? ( ":::" id )?
id               = id-piece+
id-piece         = number | id-run | letter | "v" | "-" | "default" | "," | ":" | "&" | "#" | "*"
data             = ( data-start ( data-text | data-quote )* "}" )+
```

頂点の文は、リンクでつないだ頂点のグループの連鎖です。
頂点のグループは、`&` でつないだ 1 個以上の頂点で、
`&` の両側には空白が必要です。
データブロックは、その直前の頂点に属し、その後に続けて書いたブロックも同じです。
どれも木の 1 つのノードです。

- `A & B --> C & D` は、最初のグループの各頂点を、
  2 つ目のグループの各頂点につなぎます。
  グループは単独でもかまいません。
  `A & B` は受理されます。
  [fixture: flowchart/gram-group-links] [fixture:
  flowchart/gram-group-two-vertices]
- `A &B` は拒否されます。
  `&` の後に `space` が必要だからです。
  `A&B` は 1 つの id です（[文の文脈](#文の文脈) を参照）。
  [fixture: flowchart/gram-group-no-space-after-ampersand] [fixture:
  flowchart/lex-ampersand-in-id]
- `A%%{init: {}}%%B-->C` は、mermaid.js と同じく頂点 `AB` を持ちます。
  字句解析器は id の並び `AB` を読み、
  ディレクティブはその `Identifier` のトークンを分けます。
  [fixture: flowchart/gram-id-across-directive]
- id とその形の間に空白を置くことはできません。
  `A [x]` は拒否されます。
  [fixture: flowchart/gram-space-before-shape]
- データブロックは、空白を挟まずに頂点の後に置くしかなく、その後には `&`、
  リンク、区切りしか続きません。
  `A @{ shape: rect }` は拒否されます。
  続けて書いたブロックは 1 つのデータブロックです。
  続く行の `A@{` と `}@{` は一緒に読まれます。
  [fixture: flowchart/gram-data-space-before] [fixture:
  flowchart/gram-data-consecutive-blocks]
- `A:::c@{ shape: rect }` と `A[x]:::c-->B` は受理されます。
  クラスは形の後、データブロックの前に来ます。
  [fixture: flowchart/gram-class-then-data] [fixture:
  flowchart/gram-class-after-shape]

### 形

```text
shape = "[" label "]"
      | "(" label ")"
      | "(" "(" label ")" ")"
      | "(((" label ")))"
      | "{" label "}"
      | "{" "{" label "}" "}"
      | "([" label "])"
      | "[[" label "]]"
      | "[(" label ")]"
      | ">" label "]"
      | "(-" label ellipse-end
      | "[/" label ( backslash-end | slash-end )
      | "[\" label ( slash-end | backslash-end )
      | "[|" id-run ":" id-run "|" label "]"
```

各選択肢は、形に名前を、Db の頂点に type を与えます。

| 書き方                 | 名前               | Db の type      |
| ---------------------- | ------------------ | --------------- |
| `[` … `]`              | `rectangle`        | `square`        |
| `(` … `)`              | `rounded`          | `round`         |
| `((` … `))`            | `circle`           | `circle`        |
| `(((` … `)))`          | `double-circle`    | `doublecircle`  |
| `{` … `}`              | `diamond`          | `diamond`       |
| `{{` … `}}`            | `hexagon`          | `hexagon`       |
| `([` … `])`            | `stadium`          | `stadium`       |
| `[[` … `]]`            | `framed-rectangle` | `subroutine`    |
| `[(` … `)]`            | `cylinder`         | `cylinder`      |
| `>` … `]`              | `odd`              | `odd`           |
| `(-` … `ellipse-end`   | `ellipse`          | `ellipse`       |
| `[/` … `backslash-end` | `trapezoid-bottom` | `trapezoid`     |
| `[/` … `slash-end`     | `lean-right`       | `lean_right`    |
| `[\` … `slash-end`     | `trapezoid-top`    | `inv_trapezoid` |
| `[\` … `backslash-end` | `lean-left`        | `lean_left`     |
| `[\|` … `\|` … `]`     | `rectangle`        | `rect`          |

名前は、mermaid.js がデータブロック `A@{ shape: … }` で同じ形に受け付ける語です
（[`shapesDefs`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/rendering-util/rendering-elements/shapes.ts#L107-L534)）。
それらの語のうち、形そのものを表し、省略していない語です。
`process`、`decision`、`subroutine` のような用途の語や、
`rect`、`diam`、`fr-rect` のような省略した語は採りません。
括弧で書いた形は、データブロックでその名前を書いた形として描かれますが、
その Db の type は表の語で、mermaid.js がそれを与えます
（[`getTypeFromVertex()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L973-L1001)）。
`A[x]` と `A@{ shape: rectangle }` は同じに描かれ、
Db の type は `square` と `rectangle` です。
[fixture: flowchart/db-data-block-shape-names]
形 `(-` … `-)` にはそのような語がありません。
mermaid.js は `ellipse` という形を定めていないので、
`A@{ shape: ellipse }` は mermaid.js が拒否し、ここでは受理されます
（[`embedded-data-opaque`](../known-divergences.ja.md#embedded-data-opaque) を参照）。
また、`A(-x-)` を描くと失敗し、
[issue #5976](https://github.com/mermaid-js/mermaid/issues/5976) がそれを報告していて、
2026-10-01 の時点で未解決で、不具合として承認されています。
受理と Db には関わりません。
[fixture: flowchart/div-data-block-shape-ellipse]

円の 2 つの `(` と六角形の 2 つの `{` は別々の単位ですが、
その間に空白やテキストを置くことはできません。
`A( (x) )` は拒否されます。
`[|` で書いた長方形は、名前と値からなるプロパティを 1 つ持ち、
どちらも 1 つの id の並びです。
`A[|borders:lt|text]` は、値 `lt` のプロパティ `borders` を持ちます。
その名前は `[` … `]` と同じく `rectangle` です。
プロパティは Db の `props` に残り、mermaid.js が長方形を描く方法を何も変えず、
違うのは Db の type の `rect` だけです。
[fixture: flowchart/gram-circle-gap] [fixture: flowchart/gram-rect-property]

### ラベル

```text
label = ( string | markdown-string | text-run ) text-run*
```

ラベルは、文字列、markdown 文字列、テキストの並びのどれかと、
それに続く任意の数のテキストの並びです。
その**種類**は、文字列で始まれば `string`、
markdown 文字列で始まれば `markdown`、それ以外は `text` です。
その**値**は、
先頭の文字列か markdown 文字列の中身（[文字列](#文字列) を参照）に、
ラベルの残りの [範囲のテキスト](../ast.ja.md#ノード) を続けたものです。
テキストの並びで始まるラベルでは、その範囲のテキストです。
``A["`x`" y]`` の値は `x y` で、種類は `markdown` です。
[fixture: flowchart/gram-string-markdown-then-text] 内側の空白は保ちます。
両端に空白を持つのは、その文字列の中身の内側か、
ラベルがすべて空白のときだけです。
値は変換した形ではなく書き手が書いたものを保ち、Db が変換した形を使います。
mermaid.js はさらにそれを trim します（[Db の正規化](#db-の正規化) を参照）。

- `A["x" y]` は種類 `string`、値 `x y` で受理されます。
  一方、`A[ "x" ]` は拒否されます。
  テキストの並びは文字列の前に来られないからです。
  [fixture: flowchart/gram-label-string-then-text] [fixture:
  flowchart/gram-label-text-then-string]
- ラベルは空にできません。
  `A[]` と `A[""]` は拒否されます。
  `A[ ]` は受理され、その値は空白 1 つです。
  [fixture: flowchart/gram-label-empty] [fixture:
  flowchart/gram-label-empty-string] [fixture: flowchart/gram-label-space]
- テキストの並びの中のディレクティブは、ラベルを変えません。
  `A[x %%{init: {}}%% y]` の値は、mermaid.js と同じく `x`、空白 2 つ、`y` で、
  ディレクティブはラベルの `RawText` のトークンを分けます。
  [fixture: flowchart/gram-label-across-directive]

### リンク

```text
link      = ( edge-id "@" )? arrow ( "|" label "|" space? )?
          | ( edge-id "@" )? opening-arrow link-text arrow
link-text = ( string | markdown-string | link-text-char ) link-text-char*
```

リンクは矢印を持ち、省略可能な、その前の辺の id と、ラベルを持ちます。
ラベルは、矢印の後の `|` の間か、開く矢印と閉じる矢印の間にあります。
後者の閉じる矢印は、必ず開く矢印と同じ種類です。
そのような矢印しかリンクテキストの文脈を出ないからです。
リンクテキストのラベルは、ラベルと同じように作ります。
文字列、markdown 文字列、1 個の文字のどれかに、さらに文字が続いたものです。
種類は `string`、`markdown`、`text` のどれかで、
値はラベルと同じように決まります。

- `A e1@-->B`、`A e1@ --> B`、`A e1@-- t -->B` は、リンクに id `e1` を与えます。
  `A e1 @-->B` は拒否されます。
  辺の id は `@` で終わらなければならないからです。
  [fixture: flowchart/gram-edge-id] [fixture:
  flowchart/gram-edge-id-space-after] [fixture:
  flowchart/gram-edge-id-link-text] [fixture:
  flowchart/gram-edge-id-space-before-at]
- `A-->|t| B` は受理されます。
  閉じる `|` の後には `space` が続いてもかまいません。
  [fixture: flowchart/gram-pipe-label-space-after]
- `A-- "a"b -->B` のリンクテキストは種類 `string` の `ab` で、
  `A-- "a" x -->B` のテキストは `a x` です。
  markdown 文字列も同じように続けられます。
  `A-- b"a" -->B` と `A-- "a""b" -->B` は拒否されます。
  文字列は先頭にしか来られないからです。
  [fixture: flowchart/gram-link-text-string-then-text] [fixture:
  flowchart/gram-link-text-string-space-text] [fixture:
  flowchart/gram-link-text-markdown-then-text] [fixture:
  flowchart/gram-link-text-text-then-string] [fixture:
  flowchart/gram-link-text-string-then-string]

### subgraph

```text
subgraph-statement = "subgraph" space subgraph-name ( "[" label "]" )? separator line* "end"
subgraph-name      = ( string | markdown-string | name-piece ) name-piece*
name-piece         = number | id-run | letter | space | "-" | "&" | ":" | "*" | "#" | "v" | "^"
                   | "style" | "linkStyle" | "classDef" | "class" | header-keyword | "subgraph" | "end"
```

`subgraph` の後の名前は必須です。
mermaid.js は、文法では `subgraph` だけを受け付け、その後 Db で拒否します。
[fixture: flowchart/gram-subgraph-no-name] 名前はそれ自体がラベルです。
文字列、markdown 文字列、名前の部品のどれかに、
さらに名前の部品が続いたものです。
その種類は、ラベルと同じく `string`、`markdown`、`text` のどれかで、
その値はラベルと同じように決まります。
Db は、その文字の一部を除いて読みます（[Db の正規化](#db-の正規化) を参照）。
`subgraph "a"b` の名前は `ab` で、それが id とタイトルです。
`subgraph "a" b` の名前は `a b` です。
markdown 文字列も同じように続けられます。
`subgraph "a""b"` は拒否されます。
`subgraph b"a"` では、
`"` は id の並び `b"a"` の文字で（[文の文脈](#文の文脈) を参照）、
それが名前です。
[fixture: flowchart/gram-subgraph-name-string-then-text]
[fixture: flowchart/gram-subgraph-name-string-space-text]
[fixture: flowchart/gram-subgraph-name-markdown-then-text]
[fixture: flowchart/gram-subgraph-name-string-then-text-title]
[fixture: flowchart/gram-subgraph-name-string-then-string]
[fixture: flowchart/gram-subgraph-name-quote-inside]
`end` の単位はその後の空白を持つので、`end` の後の同じ行に文を続けられます。
`end B` は受理されます。
[fixture: flowchart/gram-subgraph-end-then-statement]
名前は内側の空白を保ちます。
`subgraph a   b` のタイトルは、`a`、空白 3 つ、`b` です。
[fixture: flowchart/db-subgraph-title-inner-spaces]

名前はキーワードを含んでもよく、その場合キーワードは名前のテキストの一部です。
`end` は、読まれ方のために、後に続くものを変えます。
名前の中の `end` は、その後の改行を取ります。
`subgraph a end`、改行、`A`、改行、`end` は、名前が `a end`、改行、`A` で、
メンバーのない subgraph です。
[fixture: flowchart/gram-subgraph-name-end] そのため、`subgraph Front end`、
`A`、`end` は、タイトルが `Front end`、改行、`A` で、メンバーを持ちません。
一方、`subgraph fe [Front end]` は、id が `fe`、タイトルが `Front end` で、
メンバー A を持ちます。
[fixture: flowchart/db-subgraph-name-end-word] [fixture:
flowchart/db-subgraph-id-with-title-spaces]

名前は `click` の単位を含めません。
`click` の単位はクリックの文を始めるだけだからです
（[クリックとコールバック](#クリックとコールバック) を参照）。
`subgraph click me`、`subgraph 1click me`、`subgraph Handle click events` は、
mermaid.js は受理しますが、ここでは拒否されます
（[既知の差](#既知の差) を参照）。
id の並びの中では、`click` は単位になりません。
`subgraph xclick me` は、タイトルに `xclick` を持ちます。
[fixture: flowchart/gram-subgraph-name-click-inside-id-run]

`[` の前の `space` は名前の一部で、閉じる `]` の後には区切りしか続けられません。
`subgraph S [t]` は受理され、
空白と改行が後に続く `subgraph S[t]` は拒否されます。
[fixture: flowchart/gram-subgraph-title-space-before] [fixture:
flowchart/gram-subgraph-title-space-after]

### style、class、linkStyle の文

```text
style-statement      = "style" space id space styles
class-def-statement  = "classDef" space id-list space styles
class-statement      = "class" space id-list space id
id-list              = ( id-list-part | "," )+
id-list-part         = ( number | id-run | letter | "v" | "-" | "default" | ":" | "&" | "#" | "*" )+
link-style-statement = "linkStyle" space ( "default" | number ( "," number )* ) space
                       ( "interpolate" space name ( space styles )? | styles )
styles               = style ( "," style )*
style                = ( number | id-run | ":" | "#" | space | "style" )+
name                 = ( number | letter | id-run | "v" | "-" | "," | ":" | "&" | "#" | "*" )+
```

行単位の規則が無視しない `;` は文を終えます。
`style A fill:red;stroke:blue` は A にスタイル `fill:red` を与え、
頂点 `stroke:blue` を作ります。
`classDef c fill:red;stroke:blue` もクラス `c` について同じです。
`;` の代わりに `,` を置くと、どちらもスタイルです。
[fixture: flowchart/gram-style-semicolon-ends-statement] [fixture:
flowchart/gram-classdef-semicolon-ends-statement] [fixture:
flowchart/db-style-comma-two-styles] そのため、
`linkStyle 0 stroke:red;stroke-width:2px` は頂点 `stroke-width:2px` を作り、
`style A fill:red; style B fill:blue` は 2 つの文です。
[fixture: flowchart/gram-linkstyle-semicolon-ends-statement] [fixture:
flowchart/gram-style-semicolon-two-statements]

木では、スタイルはその範囲のテキストです。
`style A fill:#f00 , stroke:#333 ` のスタイルは `fill:#f00` と `stroke:#333`
で、
すべて空白のスタイルは null
です（[ast/flowchart.ja.md](../ast/flowchart.ja.md#flowchartstylestatement)
を参照）。
スタイルの周りに書かれた空白は Db に効き、
Db はそれをソースから読みます
（[木から要約を作る](#木から要約を作る) の**スタイルの文**を参照）。

`classDef` の文では、図のテキストで `\` の直後にある `,` は、
木の 2 つのスタイルを分けません。
その両側のスタイルは、`,` を含めて 1 つのスタイルです。
`classDef c fill:x\,y` のスタイルは `fill:x\,y` の 1 つで、
ディレクティブは図のテキストではないので `classDef c fill:x\%%{init: {}}%%,y`
も同じです。
一方、`classDef c fill:x\ ,y` のスタイルは 2 つで、
`style A fill:x\,y` と `linkStyle 0 fill:x\,y` のスタイルは `fill:x\` と `y` の
2 つです。
文法はその `,` も読み、その後にスタイルを求めるので、
`classDef c fill:x\,` は mermaid.js と同じく拒否され、
`classDef c fill:x\, ` は受理されます。
[fixture: flowchart/gram-classdef-escaped-comma-one-style] [fixture:
flowchart/gram-classdef-escaped-comma-directive] [fixture:
flowchart/gram-style-escaped-comma-two-styles] [fixture:
flowchart/gram-classdef-escaped-comma-at-end] [fixture:
flowchart/gram-classdef-escaped-comma-then-space] [fixture:
flowchart/db-classdef-escape-space-before-comma][fixture:
flowchart/gram-style-whitespace] スタイルが含められるのはこれらの単位だけです。
`fill:rgb(0,0,0)` は拒否されます。
`(` がラベルを始めるからです。
`fill:default` も拒否されます。
`default` はキーワードだからです。
[fixture: flowchart/gram-style-parenthesis] [fixture:
flowchart/gram-style-keyword]

`id-list` は `id` と同じ単位を受理し、リストとして読みます。
その要素は `,` の単位の間の部分なので、要素の数は `,` の単位の数より 1 つ多く、
空の部分は空の要素です。
`class ,A c` は A にクラス c を与え、`class , c` は受理され、
`classDef a,,b` はクラス `a`、空の名前、`b` を定めます。
どれも mermaid.js と同じです。
[fixture: flowchart/db-class-ids-empty-first] [fixture:
flowchart/db-class-ids-only-comma] [fixture: flowchart/db-classdef-names-empty]
[fixture: flowchart/db-classdef-names-trailing-comma] `style` の文の id、
`class` の文の 2 つ目の id、`:::` の後のクラス、
頂点の id はリストではありません。
`style A,B fill:red` は頂点 `A,B` を作ります。
[fixture: flowchart/gram-style-id-comma] [fixture:
flowchart/gram-class-name-comma] [fixture: flowchart/gram-vertex-class-comma]
[fixture: flowchart/gram-vertex-id-comma]

`interpolate` とその名前の後の `space` には、スタイルが続かなければなりません。
空白が後に続く `linkStyle 0 interpolate basis` は拒否されます。
[fixture: flowchart/gram-interpolate-trailing-space]

### クリックの文

```text
click-statement = "click" click-ids ( callback ( space string )?
                                   | "href"? string ( space string )? ( space link-target )?
                                   | name ( space string )? )
click-ids       = ( click-id | click-comma )+
callback        = "call" callback-name "(" ( callback-arguments ")" | ")" ( "call" "(" callback-arguments ")" )? )
```

1 つ目の選択肢は、`call` の後で名前を挙げた関数を、
その後の括弧の中の引数で呼びます。
その括弧が空のときは、2 つ目の `call` の後の括弧の中の引数で呼びます
（[クリックとコールバック](#クリックとコールバック) を参照）。
2 つ目は、最初の文字列の URL にリンクし、
省略可能なツールチップとリンク先を持ちます。
3 つ目は、名前で挙げた関数を呼びます。
どれでも、呼び出しやリンクの後の文字列はツールチップです。
クリックの id は、`id-list` と同じようにリストです。
`click A,,B href "u" "tip"` は、A、空の id、B にツールチップを与えます。
[fixture: flowchart/db-click-ids-empty-tooltip][fixture:
flowchart/gram-click-call] [fixture: flowchart/gram-click-href] [fixture:
flowchart/gram-click-url-target]

クリックの id は、クリックの文脈が読む文字の並びで、それが何であっても、
mermaid.js と同じです。
`click` が頂点のつもりだったかもしれない場合も同じです。
`click --- abc;` は id が `---` でコールバックの名前が `abc` のクリックの文で、
その図は頂点も辺も持ちません。
`click --> B` は id が `-->` でコールバックの名前が `B` のクリックの文です。
`click end href "u"` と `click A[x] href "u"` の id は `end` と `A[x]` なので、
頂点 A はリンクを持ちません。
`click & B` は id が `&` でコールバックの名前が `B` のクリックの文、
`click B C` は id が `B` でコールバックの名前が `C` のクリックの文です。
どの頂点も指さないクリックの id も、ツールチップを持ちます。
`click --> cb "tip"` は、id `-->` にツールチップ `tip` を与えます。
[fixture: flowchart/lex-click-id-arrow-callback]
[fixture: flowchart/lex-click-id-arrow]
[fixture: flowchart/lex-click-id-keyword]
[fixture: flowchart/lex-click-id-shape]
[fixture: flowchart/gram-click-ampersand-id]
[fixture: flowchart/gram-click-id-then-callback-name]
[fixture: flowchart/db-click-tooltip-arrow-id]

### 方向とアクセシビリティの文

方向の文は方向の行で、それ自体が 1 つの文です。
テキストを伴う `accTitle:` と `accDescr:`、
テキストと `}` を伴う `accDescr {` もそうです。
どれも区切りを取りません。
そのテキストが、行の終わりか `}` まで続くからです。
テキストは、閉じたブロックでも空でかまいません。
`accDescr {}` は、テキストのない説明のブロックの文です。
それは、どの文とも同じく、文が始まる位置で始まります。
`accDescr {} A-->B` は、説明のブロックの文と頂点の文です。
`accDescr {};A` の `;` は、頂点の文の前の空の文です。
一方、`A accDescr {}` は拒否されます
（[アクセシビリティの値](#アクセシビリティの値) を参照）。
[fixture: flowchart/gram-acc-descr-block-empty]
[fixture: flowchart/gram-acc-descr-block-empty-then-statement]
[fixture: flowchart/gram-acc-descr-block-empty-then-semicolon]
タイトルは、`;` と `#` を含めて行の残りです。
`accTitle: a;b #c` のタイトルは `a;b #c` です。
[fixture: flowchart/gram-acc-title-semicolon]

### 文法の外での拒否

mermaid.js は、文法が受理する入力の一部を、Db を作る途中で拒否します。

- **linkStyle の番号。** `linkStyle` の文の各番号は、
  文を読む時点で存在する辺を指さなければなりません。
  そのトークンのソースのテキストは、
  先頭に 0 のない整数で
  （NumericLiteral の `value` では `00` と `0` を区別できない）、
  それより前の文が作った Db の辺の数より小さくなければなりません
  （[Db の正規化](#db-の正規化) を参照）。
  `linkStyle 00 stroke:red` と、指すリンクより前にある `linkStyle` は、
  `interpolate` があってもなくても拒否されます。
  mermaid.js は、
  [`updateLink()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L391-L413)
  と
  [`updateLinkInterpolate()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L377-L386)
  の `TypeError` でこれらを拒否します。
  どちらも、テキストとして受け取った番号を確かめないからです。
  [fixture: flowchart/linkstyle-index-out-of-range] [fixture:
  flowchart/gram-linkstyle-leading-zero] [fixture:
  flowchart/gram-linkstyle-before-link] [fixture:
  flowchart/gram-interpolate-out-of-range]
- **辺が多すぎる。** Db の辺が、
  サイト設定の `maxEdges`（既定は 500）より多い入力は拒否されます。
  この上限はテキストではなくサイト設定にあるので、この検査は、
  設定に依存する Db の値と同じように行います（[Db の正規化](#db-の正規化) と
  [設定（参考）](../common.ja.md#設定参考) を参照）。
  設定を持つ側が、木が作る辺の数をそれと比べます。
  一方、上の linkStyle の番号は、木だけで検査します。
  [fixture: flowchart/config-max-edges-exceeded]
- **subgraph のメンバー。** [木から要約を作る](#木から要約を作る)
  の **subgraph** に挙げた順のメンバーで、
  メンバー `hasOwnProperty` の後にほかのメンバーが続く subgraph は拒否されます。
  空やすべて空白のメンバーは数えず、
  方向の文のようにメンバーを加えない文は何も変えません。
  この検査は、各 subgraph について自分のメンバーで行い、
  先の subgraph が持つメンバーを除く前に行います。
  そのため、`hasOwnProperty` と `A` の行を持つ subgraph は拒否されます。
  `hasOwnProperty` を 2 つ持つもの、メンバーが `hasOwnProperty`、
  `A` の順になる `A-->hasOwnProperty` や `hasOwnProperty & A` を持つもの、
  `hasOwnProperty` の後に方向の文と `A`、空の文、アクセシビリティの文、
  入れ子の subgraph のどれかが続くものも拒否されます。
  `hasOwnProperty` を持つ先の subgraph があっても、これは変わりません。
  [fixture: flowchart/gram-subgraph-member-has-own-property-then-member]
  [fixture: flowchart/gram-subgraph-member-has-own-property-twice] [fixture:
  flowchart/gram-subgraph-member-has-own-property-link-target] [fixture:
  flowchart/gram-subgraph-member-has-own-property-group] [fixture:
  flowchart/gram-subgraph-member-has-own-property-direction-then-member]
  [fixture: flowchart/gram-subgraph-member-has-own-property-empty-statement]
  [fixture: flowchart/gram-subgraph-member-has-own-property-acc-title] [fixture:
  flowchart/gram-subgraph-member-has-own-property-nested] [fixture:
  flowchart/gram-subgraph-member-has-own-property-earlier-subgraph-then-member]
  `hasOwnProperty` だけを持つもの、`A` の後に `hasOwnProperty` を持つもの、
  メンバーが `A`、`hasOwnProperty` の順になる `hasOwnProperty-->A` を持つもの、
  `hasOwnProperty` の後にメンバーを加えない文だけが続くものは受理されます。
  入れ子の subgraph がメンバー `hasOwnProperty` を持ち、
  それを囲む subgraph にその後 `A` があるものも受理されます。
  [fixture: flowchart/db-subgraph-member-has-own-property-alone] [fixture:
  flowchart/db-subgraph-member-has-own-property-last] [fixture:
  flowchart/db-subgraph-member-has-own-property-link-source] [fixture:
  flowchart/db-subgraph-member-has-own-property-acc-title-last] [fixture:
  flowchart/db-subgraph-member-has-own-property-direction] [fixture:
  flowchart/db-subgraph-member-has-own-property-no-member-statements] [fixture:
  flowchart/db-subgraph-member-has-own-property-in-nested] メンバー
  `hasOwnProperty` は、どの種類のメンバーでもかまいません。
  入れ子の subgraph の Db の id（名前のテキストを trim したもの）として、
  `subgraph hasOwnProperty`、`subgraph "hasOwnProperty"`、
  `subgraph hasOwnProperty [T]`、
  `subgraph " hasOwnProperty "[T]` から来ることも、
  中にディレクティブのある id `hasOwn%%{init: {}}%%Property` から来ることも、
  テキストが `hasOwnProperty` の `accDescr {` のブロックのような、
  アクセシビリティの文の値から来ることもあります。
  どれも後に `A` が続けば拒否されます。
  入れ子の `subgraph x[hasOwnProperty]` の id は `x`、
  名前の後に空白がある入れ子の `subgraph hasOwnProperty ` の id は `subGraph0`
  なので、後に `A` が続いても受理されます。
  [fixture: flowchart/gram-subgraph-member-has-own-property-nested-id] [fixture:
  flowchart/gram-subgraph-member-has-own-property-nested-string-id] [fixture:
  flowchart/gram-subgraph-member-has-own-property-nested-id-title] [fixture:
  flowchart/gram-subgraph-member-has-own-property-nested-string-space-id-title]
  [fixture: flowchart/gram-subgraph-member-has-own-property-directive-inside]
  [fixture: flowchart/gram-subgraph-member-has-own-property-acc-descr-block]
  [fixture: flowchart/db-subgraph-member-has-own-property-nested-title]
  [fixture: flowchart/db-subgraph-member-has-own-property-nested-name-space]
  この名前は、ほかのどこでも予約されていません。
  mermaid.js は、
  [`addSubGraph()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L685-L707)
  で、見たメンバーを素のオブジェクトのキーとして持ち、
  各メンバーについてそのオブジェクトの `hasOwnProperty` 関数に尋ねます。
  メンバー `hasOwnProperty` を残すと、その関数が `true` に置き換わるので、
  次のメンバーで `TypeError` を投げます。
- **データブロック。** mermaid.js は各データブロックを YAML として読み、
  その一部を拒否します。
  この仕様はそうしません（[既知の差](#既知の差) を参照）。

## Db の正規化

フロントマターから来る図のタイトルと、設定に依存する Db の値は、
木からは得られません。
Db の値を確かめる側が、
mermaid.js
自身の関数でそれらを求めます
（[設定（参考）](../common.ja.md#設定参考) を参照）。

### 要約

fixture は、mermaid.js の Db を、
`@mmd-toolkit/tests` の
[`normalizeFlowchart()`](../../../tests/src/normalizers/flowchart.ts) が作る、
次の欄を持つ要約として記録します。

| 欄             | 内容                                                                                                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `direction`    | 図の方向。                                                                                                                                                                                                            |
| `title`        | フロントマターのタイトル。                                                                                                                                                                                            |
| `accTitle`     | アクセシビリティのタイトル。なければ空のテキスト。                                                                                                                                                                    |
| `accDescr`     | アクセシビリティの説明。なければ空のテキスト。                                                                                                                                                                        |
| `vertices`     | 頂点。加えた順。`id`、`labelType`、`styles`、`classes`、`text`、`type`、`props`、`link`、`linkTarget`、およびデータブロックだけが設定する欄 `icon`、`form`、`pos`、`img`、`constraint`、`assetWidth`、`assetHeight`。 |
| `edges`        | 辺。加えた順。`start`、`end`、`type`、`stroke`、`length`、`text`、`labelType`、`classes`、`isUserDefinedId`、`id`、`interpolate`、`style`、およびデータブロックだけが設定する `animate` と `animation`。              |
| `edgeDefaults` | `linkStyle default` による `interpolate` と `style`。設定されていなければそれぞれ null。                                                                                                                              |
| `classDefs`    | `classDef` で定めたクラス。定めた順。`id` と `styles`。                                                                                                                                                               |
| `subgraphs`    | subgraph。加えた順。`id`、`nodes`、`title`、`classes`、`labelType`、`dir`、およびデータブロックだけが設定する `metadata`。                                                                                            |
| `tooltips`     | ツールチップ。その id に最初にツールチップが与えられた順。`id` と `text`。                                                                                                                                            |

Db が設定しない欄は、要約に現れません。
要約は、描画だけが使うものを除きます。
頂点の DOM の id、クラスのテキストのスタイル、
mermaid.js が呼ぶコールバックをクリックが持つかどうか
（サイト設定 `securityLevel: loose` のときだけ呼ぶ）、
コールバックの名前と引数です。
mermaid.js が読まない方向の行のテキスト、
つまり
[FlowchartDirectionStatement](../ast/flowchart.ja.md#flowchartdirectionstatement)
の `textBefore` と `textAfter` も使いません。
また、
各スタイルの Db のテキスト（下の**スタイルの文**を参照）の末尾の空白を除きます。
頂点とクラスの `styles`、辺の `style`、`edgeDefaults` の `style` です。
mermaid.js はその空白を読まず、整形は行末の空白を消すので、
それを残す要約はテキストを整形すると変わってしまいます。
スタイルの Db のテキストは行終端を含まないので、落とすのは行の空白です。
Db のテキストの先頭の空白は残します。
スタイルが `fill` で始まるかどうかを決めるからです（下を参照）。
すべて空白のスタイルは空のテキストになります。
`style A fill:#f00, ` のスタイルは `fill:#f00` と空のテキストで、
`style A fill:#f00,` は拒否されます。
スタイルには 1 個以上の単位が要るからです。
[fixture: flowchart/gram-style-whitespace] [fixture:
flowchart/db-style-whitespace-only-value] [fixture:
flowchart/db-style-trailing-comma] テキストは、
mermaid.js が HTML の無害化の前に持つ形で記録します。
頂点の `link` は、書かれたとおりの URL を trim したもので、
`securityLevel` が `loose` でないときに mermaid.js が行う URL
の無害化の前の値です。
どう求めるかは、
[サニタイザは無効にする](../../../tests/docs/expected-results.ja.md#サニタイザは無効にする)
と [ラベルは HTML
のサニタイズ前の値で記録する](../../../tests/docs/expected-results.ja.md#ラベルは-html-のサニタイズ前の値で記録する)
が説明します。
こうすることで、`securityLevel` が `strict`、`loose`、`antiscript`、
`sandbox` のどれかである限り、要約は `securityLevel` に依存しません。

データブロックだけが設定する欄は、
木からは求めません
（[Db の中のデータブロック](#db-の中のデータブロック) を参照）。

### 木から要約を作る

要約は、
図の文をソースの順に（subgraph の中の文は subgraph そのものより先に）たどり、
以下の手順を適用して作ります。
これは、mermaid.js の文法が Db を呼ぶ順です。
各手順は、値を [変換した形](../common.ja.md#ソースの読み方) で読み、
`}` の後の空白は [`}` の後の空白](#-の後の空白) のとおりに読みます。
データブロックの値は読みません。
ラベルは、変換した値の両端の空白を trim したものと、
その種類をラベルの種類として与えます。
値が両端に空白を持つのは、先頭の文字列の区切りの内側か、
ラベルがすべて空白のときだけです。
ほかの値は [共通の葉のノード](../ast.ja.md#共通の葉のノード) の値で、
Identifier の `name` と、StringLiteral、NumericLiteral、
FlowchartLiteral の `value` です。
id とクラス名のリストの null の要素は、空のテキストを表します。
スタイルは、null かどうかにかかわらず、
その Db のテキストで読みます（**スタイルの文**を参照）。
[fixture: flowchart/db-linkstyle-whitespace-only-style] [fixture:
flowchart/db-classdef-whitespace-only-style]アクセシビリティの文の null の
`value` は、下の**アクセシビリティの文**で述べます。
クリックの文の `arguments` は使いません。
要約はコールバックの引数を除くからです。

**方向。** ヘッダーの方向です。
`<` は `RL`、`^` は `BT`、`>` は `LR`、`v` と `TD` は `TB` になり、
`BR` を含む他の値は書かれたままです。
方向のないヘッダーは `TB` になります。
subgraph の外の方向の文は、ヘッダーが方向を持たないときも、何も変えません。
`flowchart`、`direction LR`、`A-->B` の方向は `TB` です。
[fixture: flowchart/db-direction-mapping] [fixture: flowchart/db-direction-br]
[fixture: flowchart/header-direction-next-line] [fixture:
flowchart/db-direction-statement-top-level] [fixture:
flowchart/db-direction-statement-top-level-no-header-direction]

**頂点の手順。** id と、省略可能なラベル、形、スタイル、
プロパティを取ります。

1. その id の辺があれば、何も起きません。
   [fixture: flowchart/db-vertex-edge-id]
2. その id の頂点がなければ、id、ラベルの種類 `text`、スタイルなし、
   クラスなしの頂点を末尾に加えます。
3. ラベルがあれば、頂点は、既にテキストを持っていても、
   そのテキストとラベルの種類をラベルから取ります。
   `A[Start]-->B` の後の `C-->A[End]` は、A にラベル `End` を与えます。
   [fixture: flowchart/db-vertex-label-redefined] なければ、
   まだテキストのない頂点が id をテキストとして取り、
   テキストを持つ頂点はそれを保ちます。
   `A[Start]-->B` の後の `A-->C` も `C-->A[Start]` も、
   A のラベルを `Start` のままにします。
   [fixture: flowchart/db-vertex-label-kept-without-label] [fixture:
   flowchart/db-vertex-label-redefined-same]
4. 形があれば、その形の Db の type（[形](#形) を参照）が頂点の type になります。
   スタイルがあれば、頂点のスタイルに加えます。
5. まだ `props` のない頂点は、それを得ます。
   プロパティがあればそのプロパティを、なければ空のプロパティを持ちます。
   `props` のある頂点には、プロパティを加えます。
   同じ名前のプロパティがあれば、その値を置き換えます。
   名前が `__proto__` のプロパティは例外です。
   後から与えたものは、頂点のプロパティ `__proto__` の値を置き換え、
   それがなければ何も変えません。
   頂点がプロパティ `__proto__` を持てるのは、
   その `props` を作った手順で得たときだけです。
   そのため、`A` の後の `A[|__proto__:x|text]` は、`A` の `props` を、
   最初の手順が作った空のままにします。
   先にリンク、スタイルの文、データブロックが `props` を作ったときも同じです。
   `A[|b:y|t]` の後なら、`props` は値が `y` の `b` を保ち、
   `__proto__` は加わりません。
   一方、`class` の文は頂点を加えず `props` を作らないので、
   その後の `A[|__proto__:x|text]` が `__proto__` を持つ `props` を作ります。
   mermaid.js は、
   [`addVertex()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L229-L233)
   で、既存の `props` にプロパティを、素のオブジェクトへの代入で加えます。
   そこでは `__proto__` はキーになりません。
   [fixture: flowchart/db-props-merge] [fixture:
   flowchart/db-props-existing-vertex] [fixture: flowchart/db-props-replaced]
   [fixture: flowchart/db-props-constructor-existing-vertex] [fixture:
   flowchart/db-vertex-props-proto] [fixture: flowchart/db-props-proto-replaced]
   [fixture: flowchart/db-props-proto-then-other] [fixture:
   flowchart/db-props-proto-existing-vertex] [fixture:
   flowchart/db-props-proto-existing-link-vertex] [fixture:
   flowchart/db-props-proto-after-style] [fixture:
   flowchart/db-props-proto-after-data-block] [fixture:
   flowchart/db-props-proto-after-other-property] [fixture:
   flowchart/db-props-proto-after-class]

**クラスの手順。** id とクラス名を取ります。
それぞれの id の頂点、その id を持つ最初の辺、
その id で最後に加えた subgraph のクラスに、クラス名を加えます。
[fixture: flowchart/db-class-on-edge-and-subgraph] [fixture:
flowchart/db-class-vertex-id-with-comma]

**頂点の文。** 頂点のグループを最初から最後まで、それぞれの頂点について、
その形で頂点の手順を、次にクラスがあれば、
その頂点の id を `,` の文字で区切った部分とクラスでクラスの手順を
（そのため `A,B:::c` は頂点 `A,B` にクラスを与えません）、
次にグループの中でその前の頂点がデータブロックを持てばそれらを適用します。
グループの最後の頂点の後に、その頂点のデータブロックが来ます。
各リンクの行き先のグループの後に、そのリンクの辺が来ます。
そのため、`&` が後に続く頂点のデータブロックは、次の頂点の後に適用されます。
`A@{ label: x } & A[y]` の `A` のラベルは `x` です。
[fixture: flowchart/db-data-after-next-vertex] 頂点の文の**メンバー**は、
その最後のグループの id、その前のグループの id、
と最初のグループまでさかのぼったものです。

**リンク。** リンクは、その前のグループから行き先のグループへの辺を作ります。
最初のグループの各頂点について、順に、
行き先のグループの各頂点への辺を順に 1 本ずつ作ります。
各辺は、始点と終点の id、
矢印の type、stroke、length（下を参照。10 を超える length は 10）、
ラベルのテキストとラベルの種類（ラベルがなければ空のテキストと `text`）、
クラスなし、
その時点で設定されていれば `linkStyle default` の既定の interpolate を持ちます。
[fixture: flowchart/db-arrow-length-cap] [fixture:
flowchart/db-default-interpolate-later-edge] その id は次のとおりです。

- 始点が最初のグループの最後の頂点の id で、
  終点が 2 つ目のグループの最初の頂点の id である辺では、リンクの辺の id。
  ただし、それより前の辺がその id を持っていれば使いません。
  Db の id は、辺の id が `@` を含まなければそのままです。
  含めば、その最初の `@` を除き、末尾に `@` を足したものです。
  そのような辺の `isUserDefinedId` は true です。
  [fixture: flowchart/db-edge-id-group] [fixture: flowchart/db-edge-id-reused]
  [fixture: flowchart/db-edge-id-at-sign]
- それ以外では、`L_`、始点の id、`_`、終点の id、`_`、カウンタ。
  カウンタは、同じ始点と終点を持つそれより前の辺がなければ 0、
  あればその数に 1 を足したものです。
  3 つ目の `A-->B` は `L_A_B_3` になります。
  [fixture: flowchart/db-edge-id-counter]

辺が、
サイト設定の `maxEdges`
より多い入力は拒否されます（[文法の外での拒否](#文法の外での拒否) を参照）。

**矢印。** リンクの FlowchartArrow が、type、stroke、length を与えます。
type は終わりの記号から決まり、
`arrow` は `arrow_point`、`cross` は `arrow_cross`、
`circle` は `arrow_circle`、`none` は `arrow_open` です。
始まりの記号が、`none` でなく終わりの記号と同じ記号のとき、
始まりの記号は**対応する**と言い、
type に `double_` を前に付けます。
stroke は、線 `invisible` なら `invisible`、`dotted` なら `dotted`、
`solid` なら `normal` です。
`thick` なら、始まりの記号が `none` か対応するとき `thick`、
それ以外は `normal` です。
length は、点線なら矢印の `length` です。
それ以外は、矢印の `length` から 1 を引き、
終わりの記号が `none` ならさらに 1 を引き、
始まりの記号が `none` でも対応するものでもなければ 1 を足したものです。
これは、mermaid.js が、
矢印から最後の文字と対応する始まりの記号を除いたものから求める値で、
対応しない始まりの記号はそこに残ります。
`---` と `-->` の length は 1 です。
`A x-->B` は type `arrow_point`、stroke `normal`、length 2 で、
`A x==>B` の stroke は `normal` です。
`<-->` の type は `double_arrow_point`、
`A x---B` は type `arrow_open`、length 2 です。
`~~~` は stroke `invisible`、length 1、
`-..->` は stroke `dotted`、length 2 です。
[fixture: flowchart/db-arrow-single-forms] [fixture:
flowchart/lex-link-text-head-letter]
`A o--> B` のように、対応しない始まりの記号が記号として描かれず、
辺が長くなることは、
[issue #1665](https://github.com/mermaid-js/mermaid/issues/1665) が不具合として報告していて、
2026-10-01 の時点で未解決で、不具合として承認されています。
そのコメントは、`A o-- test1 --> B` のように、
そのような 2 つの矢印の間にテキストを持つリンクが、
矢じりを描かないことも報告していて、
これは下の type `INVALID` です。
[fixture: flowchart/db-arrow-mixed-markers]

開く矢印を持つリンクでは、FlowchartOpeningArrow が、
始まりの記号から type を、線から stroke を与えます。
type は、`arrow` なら `arrow_point`、`cross` なら `arrow_cross`、
`circle` なら `arrow_circle`、`none` なら `arrow_open` です。
stroke は、`thick` なら `thick`、`dotted` なら `dotted`、
`solid` なら `normal` です。
この stroke が上の閉じる矢印の stroke と違えば、type と stroke は `INVALID` で、
length はありません。
2 つの矢印は同じ線を持つので、
これが起こるのは、閉じる矢印が太線で、
その始まりの記号が `none` でも対応するものでもないときだけです。
`A== t x==>B` では、閉じる矢印の始まりの記号 `cross` が、
その stroke を `normal` にします。
そうでなければ、
開く矢印の type が `arrow_open` なら辺は閉じる矢印の type を取り、
閉じる矢印の type と等しければ type に `double_` を前に付け、
それ以外では type と stroke は `INVALID` で length はありません。
stroke は両者に共通のもので、length は閉じる矢印のものです。
`A x-- t --xB` の type は `double_arrow_cross` です。
`A x-- t -->B` と `A x-- t x--x B` は `INVALID` で、
後者は `arrow_cross` が `double_arrow_cross` でないからです。
[fixture: flowchart/db-arrow-double] [fixture: flowchart/db-arrow-invalid]
[fixture: flowchart/db-arrow-thick-head-invalid] [fixture:
flowchart/db-arrow-dash-head-length] [fixture:
flowchart/db-arrow-closing-double-in-link-text] [fixture:
flowchart/db-arrow-opening-cross-closing-cross] [fixture:
flowchart/db-arrow-opening-cross-closing-double-cross] [fixture:
flowchart/db-arrow-dotted-closing-start-marker]

**subgraph。** subgraph の文は、その本体の文の後に subgraph を加えます。
そのため、入れ子の subgraph は、それを囲む subgraph より先に来ます。
そのメンバーは、本体の順に、頂点の文のメンバー、
入れ子の各 subgraph の Db の id、
値が null
でない各アクセシビリティの文の値そのもの（説明の改行はここでは畳まない）、
各空の文ごとの `;` です。
subgraph の外の空の文は、何も変えません。
[fixture: flowchart/gram-empty-statement-top-level]
空やすべて空白のメンバーは除きます。
残りでは、等しいメンバーは最初のものだけを残します。
ただし、メンバー `__proto__` はすべて残します。
mermaid.js は見たメンバーを素のオブジェクトのキーとして持ち、
`__proto__` はそのキーにならないからです。
その後、先に加えた subgraph が既に持つメンバーは、`__proto__` も含めて除きます。
[fixture: flowchart/db-subgraph-member-empty-statement] [fixture:
flowchart/db-subgraph-member-empty-statement-end] [fixture:
flowchart/db-subgraph-member-acc-title] [fixture:
flowchart/db-subgraph-member-acc-descr-block] [fixture:
flowchart/db-subgraph-member-empty-acc-descr-block] [fixture:
flowchart/db-subgraph-nested-members] [fixture:
flowchart/db-subgraph-member-proto-twice] [fixture:
flowchart/db-subgraph-member-proto-mixed] [fixture:
flowchart/db-subgraph-member-proto-earlier-subgraph] [fixture:
flowchart/db-subgraph-member-has-own-property-earlier-subgraph] [fixture:
flowchart/db-subgraph-member-constructor-to-string] メンバー `hasOwnProperty`
の後にほかのメンバーが続く subgraph
は拒否されます（[文法の外での拒否](#文法の外での拒否) を参照）。 subgraph
は次のものを持ちます。

- `id`: 名前のテキストを trim したもの。**名前のテキスト**は、
  mermaid.js が名前として読むテキストです。
  名前の値に、名前の終わりからその後に続くもの
  （タイトルの `[` か区切り）までの範囲のテキストを続けて、
  変換した形にしたものです。
  `subgraph` の後の `space` の単位はそれに入りません。
  `subgraph %%{init: {}}%% a` のように、
  その単位の中にディレクティブがあっても同じです。
  [fixture: flowchart/db-subgraph-id-directive-in-statement-space]
  タイトルがなく、
  名前のテキストに空白があるときは、id は代わりに `subGraph` と、
  それより前に加えた subgraph の数を続けたものです。
  名前の後に空白がある `subgraph a ` の名前のテキストは `a` と空白で、
  id は `subGraph0` です。
  [fixture: flowchart/db-subgraph-name-trailing-space] [fixture:
  flowchart/db-subgraph-counter]
  空白の前の文字列やディレクティブは、これを変えません。
  行末に空白が続く `subgraph "S"` と `subgraph S%%{init: {}}%%` の id は
  `subGraph0` で、空白が続く `subgraph S` も同じです。
  後の `A-->S` は新しい頂点 `S` へのリンクです。
  `subgraph "click me"` では、
  `click` は文字列の中にあって `click` の単位ではないので、
  名前のテキストは `click me`、id は `subGraph0`、タイトルは `click me` です。
  [fixture: flowchart/db-subgraph-string-name-trailing-space] [fixture:
  flowchart/db-subgraph-name-directive-trailing-space] [fixture:
  flowchart/db-subgraph-name-trailing-space-then-vertex] [fixture:
  flowchart/gram-subgraph-string-click-title] [fixture:
  flowchart/db-subgraph-string-click-name-member]
- `title`: タイトルの値を変換した形、
  タイトルがなければ名前のテキストを trim したもの。
- `labelType`: タイトルの種類。
  タイトルがなければ、
  名前の種類が `markdown`（つまり名前が markdown 文字列で始まる）なら
  `markdown`、それ以外は、文字列で始まる名前でも `text`。
  [fixture: flowchart/db-subgraph-quoted-name] [fixture:
  flowchart/db-subgraph-markdown-name] [fixture:
  flowchart/gram-subgraph-name-markdown-then-text]
- `dir`: 本体の最後の方向の文の方向。
  なければ、
  [有効な設定](../common.ja.md#有効な設定) の `flowchart.inheritDir` が
  mermaid.js の判定で真とみなされるとき、つまり `false`、ゼロ、NaN、空の文字列、
  null のどれでもないときは図の方向、それ以外ではなし。
  `true`、`1`、`yes`、文字列の `false` と `0` では subgraph は図の方向を取り、
  `false`、`0`、空の文字列では取らない。
  フロントマターやディレクティブに書いたリストやマッピングは既定の `false`
  を置き換えず（[有効な設定](../common.ja.md#有効な設定) を参照）、
  null はキーの絞り込みが除くので、`[]`、`{}`、`null` でも取らない。
  [fixture: flowchart/config-inherit-dir-site] [fixture:
  flowchart/config-inherit-dir-frontmatter] [fixture:
  flowchart/config-inherit-dir-fm-one] [fixture:
  flowchart/config-inherit-dir-fm-yes] [fixture:
  flowchart/config-inherit-dir-fm-string-false] [fixture:
  flowchart/config-inherit-dir-fm-string-zero] [fixture:
  flowchart/config-inherit-dir-directive-string-false] [fixture:
  flowchart/config-inherit-dir-fm-false] [fixture:
  flowchart/config-inherit-dir-fm-zero] [fixture:
  flowchart/config-inherit-dir-fm-empty-string] [fixture:
  flowchart/config-inherit-dir-fm-list] [fixture:
  flowchart/config-inherit-dir-fm-mapping] [fixture:
  flowchart/config-inherit-dir-fm-null]
- `classes`: クラスの手順が加えるまではなし。

**スタイルの文。** スタイルの **Db のテキスト**は、その前の `,` の終わりから、
その後の `,` の始まりまでの [範囲のテキスト](../ast.ja.md#ノード) です。
最初のスタイルは、
文の規則が `styles` の前に読む `space` の単位の終わりから始まり、
最後のスタイルは文の区切りで終わります。
これは、どのノードも持たない、周りに書かれた空白を含めたスタイルで、
null のスタイルもすべて空白の Db のテキストを持ちます。
`style` は、
カンマで分けない id と、スタイルの Db のテキストで、頂点の手順を適用します。
そのため、まだどの文も作っていない頂点を加えます。
`A-->B` の後の `style C fill:red` は、スタイル `fill:red` を持つ C を加えます。
[fixture: flowchart/db-style-unknown-vertex] 頂点のほかの文より前の `style`
の文も、その頂点にスタイルを与えます。
`A-->B` の前の `style A fill:red` がそうです。
頂点の手順は subgraph を見ないので、`subgraph S` の後の `style S fill:red` は、
subgraph とは別に頂点 `S` を加えます。
[fixture: flowchart/db-style-before-vertex] [fixture:
flowchart/db-style-subgraph-id] `classDef` は、
スタイルの Db のテキストの各 `\,` を `,` として読みます。
各クラス名について、その名前のクラスがなければ末尾に加え、
スタイルをそれに加えます。
`classDef c fill:a\ ,stroke:b` のスタイルは `fill:a\` と `stroke:b` の 2 つで、
`classDef c fill:a\,  stroke:b` のスタイルは `fill:a,`、空白 2 つ、
`stroke:b` の 1 つです
（[style、class、linkStyle の文](#styleclasslinkstyle-の文) を参照）。
`class` は、その id とクラス名でクラスの手順を適用します。
[fixture: flowchart/db-class-def-escaped-comma] [fixture:
flowchart/db-classdef-escape-space-before-comma] [fixture:
flowchart/db-classdef-escape-space-after-comma]

**linkStyle の文。** `linkStyle` の文は、
まず `interpolate` を持つなら番号の各辺の interpolate を設定し、
次にスタイルを持つなら番号の各辺にスタイルの Db のテキストを与えます。
どれも `fill` で始まらなければ、番号のすべての辺が共有するスタイルに、
`fill:none` を 1 回加えます。
この判定は Db のテキストを見るので、
空白の後に書いたスタイルは `fill` で始まりません。
`linkStyle 0 stroke:#f00 , fill:red` は `fill:none` を得ます。
その後、要約は、どのスタイルとも同じく、
各 Db のテキストの末尾の空白を落とします。
[fixture: flowchart/db-linkstyle-shared-fill] [fixture:
flowchart/db-linkstyle-leading-space-fill] `interpolate`
を持ちスタイルを持たない文は、スタイルを変えません。
辺は前の文が与えたスタイルを保ち、`fill:none` も加えません。
[fixture: flowchart/db-linkstyle-interpolate-keeps-style][fixture:
flowchart/db-linkstyle-interpolate-only] `linkStyle default` は、
後で加える辺が取る既定の interpolate と、
スタイルを持つときは `edgeDefaults` の `style` を設定します。
`style` はスタイルの Db のテキストで、`fill:none` は加えず、
どの辺もそれを得ません。
スタイルを持たないときは、その `style` をそのままにします。
どの文も設定していなければ null です。
[fixture: flowchart/db-default-linkstyle-interpolate-keeps-style][fixture:
flowchart/db-default-interpolate-later-edge] [fixture:
flowchart/db-linkstyle-default-no-fill]

**クリックの文。** コールバックを持つクリックは、
クリックの id とクラス `clickable` でクラスの手順を適用します。
URL を持つクリックは、id がクリックの id のどれかである各頂点に、
trim し無害化していない URL を `link`（空ならなし）として、
リンク先を `linkTarget` として与え、次に同じクラスの手順を適用します。
ツールチップは、頂点があるかどうかにかかわらず、各 id について、
その StringLiteral の `value` を trim せずにテキストとして記録します。
同じ id への後のツールチップは、位置を保ったままテキストを置き換えます。
[fixture: flowchart/db-click-on-edge] [fixture: flowchart/db-tooltip-unknown-id]
[fixture: flowchart/db-tooltip-replaced] [fixture:
flowchart/db-tooltip-untrimmed]

**アクセシビリティの文。** `accTitle:` は、タイトルをその値にします。
`accDescr:` と `accDescr {` は、説明をその値の各改行を、
その後に続く空白（改行を含む）とあわせて 1 つの改行に置き換えたものにします。
mermaid.js はこれらのテキストを trim しますが、値は両端に空白を持たないので、
何も変わりません。
2 つの形のどちらでも、後の文は前の文が設定した値を置き換えます。
`accTitle: first` の後に `accTitle: second` が続くと、タイトルは `second` で、
`accDescr:` も同じです。
`accDescr { y }` だけでは、説明は `y` です。
`accDescr: x` の後に `accDescr { y }` が続くと、説明は `y` です。
`accDescr { first }` の後に `accDescr: second` が続くと、説明は `second` です。
subgraph の中の文も、外の文と同じ説明を設定します。
そのため、subgraph の中の `accDescr: inner` の後に、
その `end` の後の `accDescr: outer` が続くと、説明は `outer` で、
`accTitle:` も同じです。
[fixture: flowchart/db-acc-title-alone]
[fixture: flowchart/db-acc-descr-line-alone]
[fixture: flowchart/db-acc-descr-lines] [fixture:
flowchart/db-acc-descr-collapse-whitespace] [fixture: flowchart/db-acc-repeated]
[fixture: flowchart/db-acc-descr-block-alone]
[fixture: flowchart/db-acc-descr-block-replaces]
[fixture: flowchart/db-acc-descr-line-replaces-block]
[fixture: flowchart/db-acc-descr-outer-replaces-subgraph]
[fixture: flowchart/db-acc-title-replaces]
[fixture: flowchart/db-acc-descr-replaces]
[fixture: flowchart/db-acc-title-outer-replaces-subgraph]
閉じていない `accDescr {` のブロックは、そのテキストにかかわらず、
空の説明を設定します。
mermaid.js は、そのテキストを読んだ後、テキストの終わりで、
2 つ目のブロックとして空のテキストを読むからです。
`accDescr: d` の後にテキストの終わりの `accDescr { x` が続くと説明は空になり、
タイトルはそのままです。
[fixture: flowchart/lex-acc-descr-block-unclosed] [fixture:
flowchart/db-acc-descr-unclosed-replaces] [fixture:
flowchart/db-acc-descr-unclosed-empty-replaces] [fixture:
flowchart/db-acc-descr-unclosed-keeps-title] それ以外では、
値が null の文は空のテキストを設定します。
一方、テキストのない閉じた説明のブロックは何も変えません。
`accDescr: x` の後にテキストの終わりの `accDescr:` が続くと説明は空になり、
`accDescr { x }` の後に続いても同じです。
一方、`accDescr: x` の後の `accDescr {  }` は `x` を保ち、
`accDescr { x }` の後の `accDescr {}` も同じです。
[fixture: flowchart/db-acc-title-empty-replaces] [fixture:
flowchart/db-acc-descr-empty-replaces] [fixture:
flowchart/db-acc-descr-block-then-empty-line] [fixture:
flowchart/db-acc-descr-empty-block-keeps] [fixture:
flowchart/db-acc-descr-empty-block-after-block]

### Db の中のデータブロック

データブロックが設定する値は、
`@mmd-toolkit/tests` の `dataBlockEffects` から取ります。
データブロックを持つ頂点 1 つにつき 1 件で、
続けて書いたブロックは 1 件と数えます。
ソースの順です
（[`dataBlockEffects`](../../../tests/docs/embedded-data.ja.md#datablockeffects)
を参照）。
`A@{ label: a } & B@{ label: b } --> C@{ label: c } & D@{ label: d }` の件は、
`A`、`B`、`C`、`D` の件で、この順です。
[fixture: flowchart/db-data-block-entries-source-order] 上に挙げた位置で、
次の 1 件を適用します。
その欄を、頂点の id で最後に加えた subgraph があればそれに、
なければその id を持つ最初の辺があればそれに、
なければ頂点の手順が既に加えたその id の頂点に設定します。
[fixture: flowchart/gram-data-consecutive-blocks]

## 既知の差

[known-divergences.ja.md](../known-divergences.ja.md) の差のうち、
次のものが flowchart に当てはまり、次のように現れます。

- **[`directive-as-token-boundary`](../known-divergences.ja.md#directive-as-token-boundary)。**
  字句解析器は mermaid.js
  と同じくディレクティブのないテキストを読むので
  （[単位の中のディレクティブ](#単位の中のディレクティブ) を参照）、
  字句解析器と文法の中でディレクティブが違いを生むのは、
  `RawText` でも `Identifier` でもない単位の中にあるときだけです。
  そのとき入力はここでは拒否され、mermaid.js では受理されます。
  例は、`A--%%{init: {}}%%>B`、`A-%%{init: {}}%%-->B`、
  `A-%%{init: {}}%%.->B` の矢印、`click A hr%%{init: {}}%%ef "u"`、
  `linkStyle 0 interpo%%{init: {}}%%late basis`、
  `A-->B dir%%{init: {}}%%ection TB` のキーワード、
  `A::%%{init: {}}%%:c` の `:::`、文字列、markdown 文字列です。
  [fixture: flowchart/lex-directive-inside-arrow] [fixture:
  flowchart/div-directive-in-arrow-length] [fixture:
  flowchart/div-directive-in-arrow-dotted] [fixture:
  flowchart/div-directive-in-keyword-href] [fixture:
  flowchart/div-directive-in-keyword-interpolate] [fixture:
  flowchart/div-direction-line-directive-in-word] [fixture:
  flowchart/div-directive-in-style-separator] [fixture:
  common/directive-in-string] [fixture:
  flowchart/div-directive-in-markdown-string]
- **[`embedded-data-opaque`](../known-divergences.ja.md#embedded-data-opaque)。**
  データブロックの中身は読みません。
  mermaid.js はそれを YAML として読み、YAML として正しくない中身と、
  知らない形を挙げる中身を拒否します。
  ここではそれらを受理します。
  [fixture: flowchart/div-data-invalid-yaml] [fixture:
  flowchart/div-data-unknown-shape]
- **[`html-tag-in-frontmatter`](../known-divergences.ja.md#html-tag-in-frontmatter)。**
  mermaid.js では、フロントマターの中で始まる HTML タグが、
  図の `"` の読み方を変えることがあります。
  ここではそうなりません。
  [fixture: flowchart/html-tag-starts-in-frontmatter]
- **[`click-reserved-word`](../known-divergences.ja.md#click-reserved-word)。**
  クリックの文を始めない `click` の単位は、ここでは入力を拒否させます
  （[クリックとコールバック](#クリックとコールバック) を参照）。
  mermaid.js は、たとえば次のものを受理します。
  クリックの文脈が文字列を読む、文の中の `click`
  （`click A href "u" click "tip"`）、
  空の文字列だけを読む、文の中の `click`（`click A click "" href "u"`）。
  文の前の `click`（`click "" click A href "x"`、`click "" A-->B`）と、
  文の後の `click`（`A-->B click ""`）。
  id の中の `click`（`A:click "" b-->C`）と、スタイルの中の `click`
  （`style A fill:red click "" x`）。
  subgraph の名前の中の、後にクリックの id が続く `click` と、続かない `click`。
  前者の例は `subgraph click me`、`subgraph 1click me`、
  `subgraph Handle click events`、`subgraph click a,b` で、
  後者の例は `subgraph click "" y` です。
  [fixture: flowchart/gram-click-mid-statement-tooltip]
  [fixture: flowchart/gram-click-bare-click-before-href]
  [fixture: flowchart/gram-click-bare-before-click-statement]
  [fixture: flowchart/gram-click-bare-before-vertex-statement]
  [fixture: flowchart/gram-click-bare-after-vertex]
  [fixture: flowchart/db-vertex-id-bare-click]
  [fixture: flowchart/db-style-bare-click-inside-style]
  [fixture: flowchart/gram-subgraph-name-click]
  [fixture: flowchart/gram-subgraph-name-click-after-number]
  [fixture: flowchart/db-subgraph-name-click-word]
  [fixture: flowchart/gram-subgraph-name-click-comma]
  [fixture: flowchart/gram-subgraph-name-bare-click]
- **[`tokenless-empty-forms`](../known-divergences.ja.md#tokenless-empty-forms)。**
  空の文字列、空の呼び出し、文を始めない空の説明ブロックは、
  それがある位置には木にそれを置く場所がないので、
  ここでは入力を拒否させます（[文字列](#文字列)、
  [クリックとコールバック](#クリックとコールバック)、
  [アクセシビリティの値](#アクセシビリティの値) を参照）。
  mermaid.js はそれらにトークンを読まず、そのような入力の多くを受理します。
  たとえば、1 行だけの空の文字列（`""`）、ラベルの中の空の文字列（`A[""x]`）、
  クリックの文の id の前の空の文字列（`click ""A href "x"`）、
  ヘッダーのキーワードの後の空の文字列（`flowchart"" TD`）。
  文の中の空の呼び出し（`A call ()-->B`）と、
  クリックの文の中の空の呼び出し（`click A call ()cb`）。
  文の中の空の説明ブロック（`A accDescr {}-->B`）。
  [fixture: flowchart/lex-empty-string-line]
  [fixture: flowchart/tokens-empty-string-in-label]
  [fixture: flowchart/gram-click-empty-string-before-id]
  [fixture: flowchart/header-empty-string-before-direction]
  [fixture: flowchart/gram-empty-call-before-link]
  [fixture: flowchart/gram-click-empty-call-before-callback]
  [fixture: flowchart/gram-empty-description-block-before-link]
