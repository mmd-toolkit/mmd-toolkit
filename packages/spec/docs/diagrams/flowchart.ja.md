# Flowchart

英語版: [flowchart.md](./flowchart.md)

mermaid.js での正解の出どころ:

- [`flow.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison)
- [`flowParser.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/parser/flowParser.ts)
- [`flowDb.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/flowDb.ts)
- [`parser/`](https://github.com/mermaid-js/mermaid/tree/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/parser)
  の中のテスト（`*.spec.js`）

この文書は、図種 `flowchart-v2`、`flowchart-elk`、`swimlane` を扱います。
3 つとも同じ文法と同じ Db を使います。
木のノードは [ast/flowchart.ja.md](../ast/flowchart.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の 3 つの項目がこの文法を選びます。
項目 3（`flowchart-elk`、id `flowchart-elk`）、項目 16（`swimlane-beta`、
id `swimlane`）、項目 17（`graph` か `flowchart`、 id `flowchart-v2`）です。
[fixture: common/detect-minimal-flowchart-elk] [fixture:
common/detect-minimal-swimlane] [fixture: common/detect-minimal-flowchart-v2]

検出は検出点だけを見ます（[図種の検出](../common.ja.md#図種の検出) を参照）。
その後、
文法がヘッダーのキーワードをもう一度読み（[ヘッダーの文脈](#ヘッダーの文脈)
を参照）、その後に語の文字が続かないことを求めます。
そのため、`graphTD` は `flowchart-v2` として検出されて拒否され、
`flowchart-elkX` は `flowchart-elk` として検出されて拒否されます。
後者では、文法が `flowchart` を読み、その後の `-elkX` を読めないからです。
[fixture: common/detect-no-boundary-graph] [fixture:
flowchart/header-elk-suffix]

ヘッダーの前の `%%` だけの行や、
ディレクティブではない `%%{ }%%` の行は `%%` だけの行で、
検出はそれを読んで通り過ぎてヘッダーを探し、どの図種でも同じく、
ここでは図のコメントです（[図種の検出](../common.ja.md#図種の検出) を参照）。
mermaid.js は入力を拒否します。
flowchart の字句解析器が `%%` をヘッダーの前の id として読むからです。
既知の差異 [`bare-percent-line-before-header`](#既知の差異) です。
[fixture: flowchart/header-after-bare-percent-line] [fixture:
flowchart/header-after-empty-braces-line]

## 字句構造

字句解析器は、
[図のテキスト](../common.ja.md#ソースの読み方) を
[変換した形](../common.ja.md#ソースの読み方) で読みます。
行終端を `\n` として、属性の引用符を `'` として、
エンティティをそのプレースホルダとして読み、
コメント領域と行単位の規則が無視する `;` は、ないかのように読み進めます。
最後の文字の後に字句解析器が読む `\n` は、
図のテキストの一部です（[テキストの終わり](../common.ja.md#テキストの終わり)）。
規則は、他の改行と同じくそれを読み、それについての条件を確かめます。
文法の `end-of-text` は、その後の位置です。
そのため、改行のない `flowchart` だけのテキストは受理されます。
ヘッダーの文脈が、足された `\n` をヘッダーの終わりとして読むからです。
[fixture: flowchart/header-only-no-line-break] [fixture:
flowchart/header-direction-trailing-space]
この節は、図の単位の規則、
つまり [ソースの読み方](../common.ja.md#ソースの読み方) の項目 4 を述べます。

### 単位と文脈

字句解析器は、図のテキストを**単位**に分けます。
文法は単位の上に書かれます。
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
それぞれ単位として読むはずのところでは、プレースホルダは代わりに 1 つの単位で、
その単位はエンティティのソースの文字を持ちます。
[エンティティ](../common.ja.md#エンティティ) を参照してください。
規則がほかの文字の間や後で読む空白は、規則がその前に作る単位に属し、
前に単位がなければ最初の単位に属します。
単位を作らない規則が読む空白は、クリックの文脈を出る 1 個の空白のように、
どの単位にも属しません。
そのような空白がどの単位に属するかで、値は変わりません。
空白を持ちうる値は、それを持つかどうかを述べているからです。
テキストの終わりで、字句解析器は止まります。

各文脈の規則を以下に挙げます。
今の文脈のどの規則も一致しなければ、入力は拒否されます。
以下の一覧ではこれを繰り返しません。
入力を拒否する規則を挙げるのは、
それがなければ別の規則が一致してしまう位置だけです。
そこでは、mermaid.js の字句解析器が、
その文法が決して受け付けないものを読みます。

### 単位の中のディレクティブ

字句解析器は、ディレクティブを持たない図のテキストを、mermaid.js が、
ディレクティブを取り除いた後のテキストを読むのと同じように読みます。
単位、後に続く文字についての条件、文脈、`}` の後の空白は、
すべてそのテキストで決まります。
その後、
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則が、単位に当てはまります。
テキストと文字列の単位の中のディレクティブは、入力の mermaid.js の読み方を保ち、
名前の単位を含む、ほかの単位の中のディレクティブは、入力を拒否させます。
**名前の単位**は、 `id` のすべての単位、`id-list-part` のすべての単位、
`edge-id` の単位、クリックの文の `click-id` の単位、`name` のすべての単位、
`[|` で書いた長方形の 2 つの `id-run` の単位です。
**テキストの単位**は、ラベルの `text-run` の単位、
クリックの文の `callback-name` の単位、リンクの `link-text-char` の単位、
`subgraph-name` の、文字列と markdown 文字列以外の、名前の部品の単位、
`classDef` の文で `\` の直後にある `,` を含む、木のスタイルのすべての単位、
文の `title-text`、`description-text`、`description-block-text` の単位、
クリックの文の `callback-arguments` の単位、
`data-start` の単位とその `}` の間の `data-text` と `data-quote` の単位、
`direction-text` の単位です。
**文字列の単位**は、`string`、`markdown-string`、`empty-string` の単位です。
`id`、`id-list-part`、`name` の単位は、それぞれ合わせて 1 つの名前です。
円か六角形を開く 2 つの `(` か `{` と、閉じる 2 つの `)` か `}` は、
それぞれ合わせて 1 つの区切り記号です。
これらの 2 つの単位の間のディレクティブは、その名前か区切り記号の中にあります。
[fixture: flowchart/div-directive-in-class-id-list]
[fixture: flowchart/div-directive-in-class-def-id-list]
[fixture: flowchart/div-directive-in-edge-id]
[fixture: flowchart/div-directive-in-interpolate-name]
[fixture: flowchart/div-directive-in-bar-rectangle-first-id-run]
[fixture: flowchart/div-directive-in-bar-rectangle-second-id-run]
[fixture: flowchart/div-directive-in-circle-opening]

- 単位がその始まりか終わりで読む空白の中のディレクティブは、何も変えません。
  `A --> %%{init: {}}%% B` では、
  ディレクティブは矢印の単位の空白の中にあります。
  [fixture: flowchart/lex-directive-after-arrow]
- `A-->en%%{init: {}}%%d` は、mermaid.js と同じく拒否されます。
  字句解析器はキーワード `end` を読みます。
  [fixture: flowchart/lex-directive-joins-keyword]
- `accTitle: a %%{init: {}}%% b` のタイトルは `a`、空白 2 つ、`b` で、
  subgraph `subgraph sty%%{init: {}}%%le x` のタイトルは `style x` です。
  どちらも mermaid.js と同じです。
  ディレクティブはテキストの単位の中にあります。
  [fixture: flowchart/lex-directive-in-title] [fixture:
  flowchart/lex-directive-in-description-block] [fixture:
  flowchart/lex-directive-in-callback-name] [fixture:
  flowchart/lex-directive-in-callback-arguments] [fixture:
  flowchart/lex-directive-in-subgraph-name]
  [fixture: flowchart/tokens-directive-label-space-after]
  [fixture: flowchart/lex-link-text-entity-directive-inside]
  [fixture: flowchart/gram-classdef-escaped-comma-directive]
  [fixture: flowchart/lex-direction-line-text-after-directive-inside]
  [fixture: flowchart/lex-directive-in-style-text]
  [fixture: flowchart/lex-directive-in-acc-descr-text]
  [fixture: flowchart/lex-directive-in-data-text]
- 文字列と markdown 文字列の中のディレクティブは、単位の中のどこにあっても、
  mermaid.js の読み方を保ちます。
  `A["a%%{init: {}}%%b"]`、`A["%%{init: {}}%%b"]`、`A["a%%{init: {}}%%"]`、
  ``A["`a %%{init: {}}%% b`"]`` のラベルは、 `ab`、`b`、`a`、そして `a`、
  空白 2 つ、`b` で、
  markdown 文字列の引用符とバッククォートの間のディレクティブは、
  文字列の中にあります。 [fixture: flowchart/lex-directive-in-string-glued]
  [fixture:
  flowchart/lex-directive-in-string-after-open-quote] [fixture:
  flowchart/lex-directive-in-string-before-close-quote] [fixture:
  flowchart/lex-directive-in-markdown-string] [fixture:
  flowchart/lex-directive-in-markdown-string-glued] [fixture:
  flowchart/lex-directive-before-markdown-backquote] [fixture:
  flowchart/lex-directive-after-markdown-backquote]
  空白 2 つの間のディレクティブ、続けて並ぶ 2 つのディレクティブ、
  文字列の中でそれだけの行にあるディレクティブも同じで、辺のラベル、
  リンクのテキスト、subgraph のタイトル、クリックの文の文字列も同じです。
  [fixture: flowchart/lex-directive-in-string-between-spaces] [fixture:
  flowchart/lex-directives-in-string-adjacent] [fixture:
  flowchart/lex-directive-in-string-own-line] [fixture:
  flowchart/lex-directive-in-edge-label-string] [fixture:
  flowchart/lex-directive-in-link-text-string] [fixture:
  flowchart/lex-directive-in-subgraph-title-string] [fixture:
  flowchart/lex-directive-in-click-href-string] [fixture:
  flowchart/lex-directive-in-click-tooltip-string]
  ディレクティブだけの文字列は空の文字列として読まれ、
  `A["%%{init: {}}%%"]` は `A[""]` と同じく拒否されます。
  [fixture: flowchart/lex-directive-in-string-only]
- `A--%%{init: {}}%%>B` では、ディレクティブは、
  テキストの単位でも文字列の単位でもない矢印の単位 `-->` の中にあり、
  入力は拒否されます。
  mermaid.js はそれを受理します。
  `A-%%{init: {}}%%-->B` や `A-%%{init: {}}%%.->B` のようなほかの矢印、
  `A%%{init: {}}%%B-->C`、`style%%{init: {}}%%A-->B`、
  `click A%%{init: {}}%%B "u"` のような名前（mermaid.js はそれぞれ id `AB`、
  `styleA`、`AB` と読みます）、
  `click A hr%%{init: {}}%%ef "u"` の `href` のようなキーワード、
  `:::` のような区切り記号、
  mermaid.js が円と読む `A(%%{init: {}}%%(x))` のような、
  円を開く 2 つの `(` も同じです（[既知の差異](#既知の差異) を参照）。
  [fixture: flowchart/div-directive-inside-arrow] [fixture:
  flowchart/div-directive-in-arrow-length] [fixture:
  flowchart/div-directive-in-arrow-dotted] [fixture:
  flowchart/div-directive-in-id] [fixture:
  flowchart/div-directive-in-id-starting-with-style] [fixture:
  flowchart/div-directive-in-click-id] [fixture:
  flowchart/div-directive-in-keyword-href] [fixture:
  flowchart/div-directive-in-style-separator] [fixture:
  flowchart/div-directive-in-circle-opening] [fixture:
  flowchart/div-directive-in-circle-closing] [fixture:
  flowchart/div-directive-in-hexagon-opening] [fixture:
  flowchart/div-directive-in-hexagon-closing]
- 2 つの単位の間のディレクティブは、合わせて 1 つの名前か区切り記号でなければ、
  単位の種類によらず許されます。
  `accTitle%%{init: {}}%%: t` のタイトルは、 mermaid.js と同じく `t` です。
  [fixture: flowchart/lex-directive-between-acctitle-colon]

### `}` の後の空白

`}` の後に改行を含む空白が続くとき、字句解析器は、その空白の最後の改行までを、
1 つの改行として読みます。
この空白は図のテキストのものなので、
その中のコメント領域とディレクティブは除きます。
mermaid.js は、文法がテキストを読む前に、
[`flowParser.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/parser/flowParser.ts#L6-L10)
でこの置き換えを行います。

そのため、その空白の中にディレクティブがあっても、結果は mermaid.js と同じです。
`A-- a}`、空白 2 つ、ディレクティブ、空白 2 つ、改行、 ` b -->B` では、
mermaid.js はリンクテキスト `a}`、改行、` b` を読み、 `click A call f(a}`、
空白 2 つ、ディレクティブ、空白 2 つ、改行、 ` b)` は受理されます。
[fixture: flowchart/lex-brace-link-text-directive] [fixture:
flowchart/lex-brace-callback-arguments-directive]

- データブロックの後の空白で行を終えられます。
  `A@{ shape: rect }` の後に空白と改行が続くものは受理されます。
  文法は、文の終わりのデータブロックの後に空白を受け付けないにもかかわらずです。
  [fixture: flowchart/lex-brace-data-trailing-space] [fixture:
  flowchart/lex-brace-data-trailing-directive]
- そのような `}` を含む文字列で、mermaid.js が読むものが変わります。
  `A["a}`、空白 2 つ、改行、`  b"]` では、 mermaid.js はラベル `a}`、改行、
  `  b` を読みます。
  木のラベルの値は書かれたテキストで、`a}`、空白 2 つ、改行、
  `  b` です（[ノード](../ast.ja.md#ノード) を参照）。
  [fixture: flowchart/lex-brace-string]

### 文の文脈

文の文脈の各位置で、字句解析器は、次の規則のうち一致する最初のものを適用します。

1. `accTitle`、0 個以上の空白、`:`、
   0 個以上の空白: `accTitle` の単位と `:` の単位。
   タイトルの文脈に入ります。 [fixture: flowchart/db-acc-title-alone]
   [fixture: flowchart/lex-acc-title-line-feed-before-colon]
   [fixture: flowchart/lex-acc-title-space-before-colon]
   [fixture: flowchart/lex-acc-title-no-whitespace]
2. `accDescr`、0 個以上の空白、`:`、
   0 個以上の空白: `accDescr` の単位と `:` の単位。
   説明の文脈に入ります。 [fixture: flowchart/db-acc-descr-line-alone]
   [fixture: flowchart/lex-acc-descr-line-feed-before-colon]
   [fixture: flowchart/lex-acc-descr-space-before-colon]
   [fixture: flowchart/lex-acc-descr-no-whitespace]
3. `accDescr`、0 個以上の空白、`{`、
   0 個以上の空白: `accDescr` の単位と `{` の単位。
   説明のブロックの文脈に入ります。
   [fixture: flowchart/db-acc-descr-empty-block-alone]
   [fixture: flowchart/lex-acc-descr-block-unclosed]
   [fixture: flowchart/lex-acc-descr-block-line-feed-before-brace]
   [fixture: flowchart/gram-acc-descr-block-empty-no-space]
4. `@{`: `data-start` の単位。
   データの文脈に入ります。 [fixture: flowchart/gram-data-shape-known]
5. `call` と 1 個以上の空白: `call` の単位。
   コールバック名の文脈に入ります。 [fixture: flowchart/gram-click-call]
6. `"`: 文字列（[文字列](#文字列) を参照）。
   文字列は 1 つの単位です。 [fixture: flowchart/db-subgraph-quoted-name]
7. 後に語の文字が続かない `style`、`default`、`linkStyle`、`interpolate`、
   `classDef`、`class`: そのテキストを名前とする単位。
   `classDef` は `class` より先に試します。
   [fixture: flowchart/gram-style-semicolon-ends-statement]
   [fixture: flowchart/db-linkstyle-default-no-fill]
   [fixture: flowchart/db-linkstyle-interpolate-only]
   [fixture: flowchart/db-classdef-names-trailing-comma]
   [fixture: flowchart/gram-class-name-comma]
   [fixture: flowchart/lex-keyword-prefix-of-id]
8. `href` と 1 個の空白: `href` の単位。 [fixture: flowchart/gram-click-href]
9. `click` と 1 個以上の空白: `click` の単位。
   クリックの文脈に入ります。 [fixture: flowchart/gram-click-two-ids-one-click]
10. 後に語の文字が続かない `flowchart-elk`、`swimlane-beta`、`graph`、
    `flowchart`（この順に試す）: `header-keyword` の単位。
    テキストで最初のヘッダーのキーワードは、ヘッダーの文脈にも入ります。
    [fixture: flowchart/header-elk-suffix]
    [fixture: flowchart/lex-header-keyword-as-vertex]
11. 後に語の文字が続かない `subgraph`: `subgraph` の単位。
    [fixture: flowchart/gram-subgraph-title-space-before]
12. 後に語の文字が続かない `end` と、
    その後のすべての空白（改行を含む）: `end` の単位。
    [fixture: flowchart/gram-subgraph-name-end]
13. 後に語の文字が続かない `_self`、`_blank`、`_parent`、
    `_top`: `link-target` の単位。 [fixture: flowchart/gram-click-url-target]
14. 方向の行（下を参照）。 [fixture: flowchart/lex-direction-line-swallows-edge]
15. 辺の id: 空白でも `"` でもない 1 個以上の文字と、その後の、
    `{` でも `"` でもない文字が後に続く `@`。
    並びは、次の空白か `"` より前にある、そのような最後の `@` で終わります。
    その `@` より前の文字は `edge-id` の単位で、`@` は `@` の単位です。
    `A @-->B` は辺の id を持ちません。
    その `@` の前に文字がないからです。
    その `@` を読む規則はないので、入力は拒否されます。
    [fixture: flowchart/lex-edge-id-at-start] [fixture: flowchart/gram-edge-id]
16. 1 個以上の ASCII の数字: `number` の単位。
    [fixture: flowchart/lex-number-vertices]
17. `#`、`:::`、`:`、`&`、`;`、`,`、`*`: そのテキストを名前とする単位。
    `:::` は `:` より先に試します。 [fixture: flowchart/gram-vertex-id-comma]
    [fixture: flowchart/gram-group-two-vertices]
    [fixture: flowchart/db-subgraph-member-empty-statement]
    [fixture: flowchart/gram-class-after-shape]
18. 矢印（[矢印](#矢印) を参照）: `arrow` の単位、
    または `opening-arrow` の単位。
    後者は、その種類のリンクテキストの文脈に入ります。
    [fixture: flowchart/db-arrow-single-forms]
    [fixture: flowchart/lex-link-text-head-letter]
19. `(-`（楕円の文脈に入る）、`([`、`[[`、`>`、`[(`、
    `(((`（ラベルの文脈に入る）、`[|`、`[/` か `[\`（斜めの文脈に入る）、`^`。
    どれもそのテキストを名前とする単位で、この順に試します。
    その後に `\|`（バックスラッシュと縦線）: 拒否されます。
    この規則がなければ、規則 21 がバックスラッシュを読みます。
    [fixture: flowchart/lex-ellipse-label]
    [fixture: flowchart/lex-lean-right-label]
    [fixture: flowchart/gram-rect-property]
    [fixture: flowchart/db-bracket-shape-types]
    [fixture: flowchart/lex-backslash-bar-rejected]
20. 後に語の文字が続かない `v`: `v` の単位。
    [fixture: flowchart/gram-vertex-id-v]
21. id の並び: 1 個以上の、できるだけ多くの文字で、どれも ASCII の英字か数字、
    `!` `"` `#` `$` `%` `&` `'` `*` `+` `.` `` ` `` `?` `\` `_` `/` のどれか、
    または `>`、`-`、`.` 以外の文字が後に続く `-` であるもの。
    `id-run` の単位。 [fixture: flowchart/lex-keyword-inside-id-run]
22. `-`: `-` の単位。 [fixture: flowchart/lex-minus-then-tag]
23. Unicode の文字（[Unicode の文字](#unicode-の文字) を参照）: 1 文字の
    `letter` の単位。 [fixture: flowchart/lex-letter-in-id]
24. `|`、`(`、`[`、`{`: そのテキストを名前とする単位。
    ラベルの文脈に入ります。 [fixture: flowchart/gram-pipe-label-space-after]
    [fixture: flowchart/gram-label-space]
25. 1 個以上の改行: `newline` の単位。
    [fixture: flowchart/lex-arrow-line-break-after]
26. 改行以外の 1 個以上の空白: `space` の単位。
    [fixture: flowchart/gram-group-two-vertices]

それ以外は拒否されます。
たとえば、単独の `=`、`}`、`]`、`)`、
辺の id にもデータブロックにもならない `@`、
絵文字のような Unicode の文字の外の文字です。
[fixture: flowchart/lex-non-bmp-character-unexpected]
[fixture: flowchart/lex-edge-id-at-start]
[fixture: flowchart/lex-label-closing-bracket-paren]
[fixture: flowchart/lex-equals-alone] [fixture: flowchart/lex-close-brace-alone]
[fixture: flowchart/lex-close-bracket-alone]
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
  空の文字列 `""` は `empty-string` の単位で、
  文法のどの規則も取らないので（[文字列](#文字列) を参照）、
  `A ""` は拒否されます。
  mermaid.js はこれを頂点 `A` として受理します。
  [fixture: flowchart/lex-quote-in-id] [fixture: flowchart/lex-empty-string]
- `&` が単独の単位を始めるのは、単位が始まる位置だけです。
  `A&B` は 1 つの頂点 `A&B` で、 `A & B` は 2 つの頂点です。
  [fixture: flowchart/lex-ampersand-in-id] [fixture:
  flowchart/gram-group-two-vertices]
- 単位の始まりで `--` の前にある `x` や `o` は、矢印の矢じりです。
  `A-->x-->B` では、字句解析器は 2 つの矢印 `-->` と `x-->` を読み、
  入力は拒否されます。 [fixture: flowchart/lex-arrow-head-x]
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
  `click;A`、`call;A`、`href;A`、 `A;click;B` は頂点です。
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
  拒否されます。 [fixture: flowchart/lex-square-label-space-slash] [fixture:
  flowchart/lex-lean-right-label] [fixture:
  flowchart/lex-round-label-space-dash] [fixture: flowchart/lex-ellipse-label]
  [fixture: flowchart/lex-circle-label-space-dash] [fixture:
  flowchart/lex-circle-dash-ellipse] [fixture:
  flowchart/lex-edge-id-space-label] [fixture: flowchart/lex-edge-id-in-label]
  [fixture: flowchart/lex-edge-id-space-pipe-label] [fixture:
  flowchart/lex-edge-id-in-pipe-label]

**方向の行。**
今の位置から、改行、U+2028、U+2029 を含まない文字の並びで、
後が続けられる最も長いもの、 `direction`、改行を含んでよい 1 個以上の空白、
`TB`、`BT`、`RL`、`LR`、 `TD` のどれか、
次の改行までのすべての文字（改行は含まない）が続くものです。
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
そのため、`direction TB x direction TB` は最後の `direction` で読まれ、
`direction TB x` は `direction-text` の単位です。
[fixture: flowchart/lex-direction-line-same-value-twice]
[fixture: flowchart/lex-direction-line-after-line-separator]
[fixture: flowchart/lex-direction-line-after-paragraph-separator]
規則 1〜13 が先に試されるので、方向の行は、
そのどれも当てはまらない行の最初の位置で始まり、行の残りを取ります。

- `A-->B direction TB` は方向の行で、頂点もリンクもまったく読まれません。
  `A[direction TB]` も方向の行です。
  [fixture: flowchart/lex-direction-line-swallows-edge] [fixture:
  flowchart/lex-direction-line-in-label]
  `direction` の前の `;` は何も変えません。
  subgraph の中の `A-->B; direction TB` は 1 つの方向の行で、
  subgraph に方向 `TB` を与え、メンバーを持たせません。
  一方、`direction TB` を単独の行にすると、A は B へリンクし、
  subgraph はメンバー B と A を持ちます。
  [fixture: flowchart/lex-direction-line-after-semicolon] [fixture:
  flowchart/lex-direction-line-own-line-after-link]
- `end direction TB` は、キーワード `end` と、それに続く方向の行です。
  `style A direction TB` は、キーワード `style` と、それに続く方向の行で、
  文法はこれを拒否します。 [fixture: flowchart/lex-direction-line-after-end]
  [fixture:
  flowchart/lex-direction-line-after-style]
- `A-->B %%{init: {}}%% direction TB` は方向の行で、mermaid.js と同じです。
  `A-->B direction%%{init: {}}%%TB` はそうではありません。
  テキストが `directionTB` だからです。
  入力は、 mermaid.js と同じく拒否されます。
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
  字下げすると、 subgraph に方向 `LR` を与えます。
  [fixture: flowchart/lex-direction-line-acc-title-column-zero] [fixture:
  flowchart/lex-direction-line-acc-title-indented] [fixture:
  flowchart/lex-direction-line-acc-title-tab-indented] [fixture:
  flowchart/lex-direction-line-acc-descr-subgraph-column-zero] [fixture:
  flowchart/lex-direction-line-acc-descr-subgraph-indented]
  `subgraph a` の後の `end; direction TB` も同じです。
  行の始めでは `end` の規則が先に当たって subgraph を閉じ、
  残りが方向の行になりますが、字下げすると行全体が方向の行になり、
  `end` は読まれず、 subgraph が閉じないので、拒否されます。
  [fixture: flowchart/lex-direction-line-after-end-semicolon-column-zero]
  [fixture: flowchart/lex-direction-line-after-end-semicolon-indented]
- `;` は空白ではありません。
  `direction ; TB` は方向の行ではなく、頂点 `direction` と `TB` で、
  `A-->direction; TB` は頂点 `direction` へのリンクと頂点 `TB` です。
  一方、`direction`、改行、`TB` は方向の行で、 subgraph の外では何も変えません。
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
  subgraph の中で、`direction TB;` は値の後のテキスト `;` を持ち、
  `direction TB; -->B` はテキスト `; -->B` を持つので、リンクは読まれません。
  一方、`-->B` が次の行にあると、リンクに元がなく、入力は拒否されます。
  [fixture: flowchart/lex-direction-line-semicolon-after-value] [fixture:
  flowchart/lex-direction-line-semicolon-link-after-value] [fixture:
  flowchart/lex-direction-line-then-link-without-source]

### 矢印

閉じた矢印も開く矢印も、その前の 0 個以上の空白と、
その後の 0 個以上の空白と一緒に読みます。
両側の空白は、改行を含めてその単位の一部です。
矢印そのものは次のどれかで、この順に試します。

1. **閉じた破線の矢印**: 省略可能な `x`、`o`、`<`（矢じり）、その後に、
   2 個以上の `-` と、それに続く `x`、`o`、`>`、または、
   そのような印が続かないときは 3 個以上の `-`。
   `-` はすべて取られます。
   `---->` は 1 つの矢印です。
   例: `-->`、`---`、`--x`、`<-->`、`o--o`。
   矢じりは、後に id が空白なしで続くときも取られます。
   `A---orders` は頂点 `rders` への矢印 `---o` で、
   `A---xray` は `ray` への矢印 `---x` です。
   一方、 `A --- orders` は `orders` へのリンクです。
   [fixture: flowchart/lex-arrow-head-o-before-id] [fixture:
   flowchart/lex-arrow-head-x-before-id] [fixture:
   flowchart/lex-arrow-spaced-before-id-o]
2. **開く破線の矢印**: 省略可能な矢じり、その後に `--`。
   [fixture: flowchart/lex-link-text-head-letter]
3. **閉じた太線の矢印**: 省略可能な矢じり、その後に、2 個以上の `=` と、
   それに続く `x`、`o`、`>`、または、
   そのような印が続かないときは 3 個以上の `=`。
   [fixture: flowchart/db-arrow-single-forms]
4. **開く太線の矢印**: 省略可能な矢じり、その後に `==`。
   [fixture: flowchart/lex-link-text-thick]
5. **閉じた点線の矢印**: 省略可能な矢じり、省略可能な `-`、1 個以上の `.`、`-`、
   続くときは `x`、`o`、`>`。
   例: `-.->`、`-.-`、`.-`、`-..-`。 [fixture: flowchart/db-arrow-single-forms]
6. **開く点線の矢印**: 省略可能な矢じり、その後に `-.`。
   [fixture: flowchart/lex-link-text-dotted]
7. **見えない矢印**: 3 個以上の `~`。 [fixture: flowchart/db-arrow-single-forms]

閉じた矢印は `arrow` の単位です。
開く矢印は `opening-arrow` の単位で、破線、太線、
点線のリンクテキストの文脈に入ります。
空白は矢印に属するので、2 行に分けた `A` と `-->B` は 1 つのリンクで、
2 行に分けた `A-->` と `B` もそうです。
`A-->B`、改行、 `x-->C` では、2 行目が矢印 `x-->` で始まるので、
リンクは `B` から `C` に向かい、頂点 `x` はありません。
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
   [fixture: flowchart/gram-label-string-then-text]
2. 0 個以上の空白と 3 個以上の `~`: 拒否されます。
   [fixture: flowchart/lex-label-tilde-start]
3. `(-`、`([`、`(((`: 拒否されます。
   この規則がなければ、規則 5 がその `(` を読みます。
   [fixture: flowchart/lex-label-ellipse-opening-rejected]
   [fixture: flowchart/lex-label-stadium-opening-rejected]
   [fixture: flowchart/lex-label-double-circle-opening-rejected]
4. `])`、`]]`、`)]`、`)))`、`|`、`)`、`]`、
   `}`（この順に試す）: そのテキストを名前とする単位。
   文脈を出ます。 [fixture: flowchart/lex-label-closing-bracket-paren]
5. `(` か `{`: そのテキストを名前とする単位。
   ラベルの文脈に入ります。
   文法がこれを受け付けるのは、
   円か六角形を開く `(` か `{` の直後だけです（[形](#形) を参照）。
   [fixture: flowchart/lex-circle-label-space-dash]
6. `[`、`]`、`(`、`)`、`{`、`}`、`|`、
   `"` 以外の 1 個以上の文字: `text-run` の単位。
   [fixture: flowchart/gram-label-space]

そのため、ラベルは文字列の外の最初の `]`、`)`、`}`、`|` で終わり、
字句解析器がどの閉じる単位を読むかは、その後の文字によります。
`A[x])` は `])` を読みますが、これは長方形を閉じないので拒否されます。
`~~~` は、テキストの並びの中ではテキストですが、
その始まりではそうではありません。
`A[x ~~~]` は受理され、 `A[ ~~~x]` は拒否されます。
[fixture: flowchart/lex-label-closing-bracket-paren] [fixture:
flowchart/lex-label-closing-double-bracket] [fixture:
flowchart/lex-label-tilde-inside] [fixture: flowchart/lex-label-tilde-start]
長方形のラベルの中の `(` は、`A[This is a () in text]` のように拒否されますが、
文字列はそれを含めます。
`A["<span style='color:rgb(51,51,51);font-size:12px'>x</span>"]`
は受理されます。 [fixture: flowchart/spec-flow-text-aa363bda] [fixture:
flowchart/lex-label-string-with-parenthesis]

### 斜めの文脈

斜めの文脈は、4 つの斜めの形のラベルを読みます。
各位置で:

1. `"`: 文字列（[文字列](#文字列) を参照）。
   [fixture: flowchart/lex-slanted-label-space-string]
2. 0 個以上の空白と 3 個以上の `~`: 拒否されます。
   [fixture: flowchart/lex-slanted-tilde-start]
3. `]` が後に続く、`\`、`(`、`?`、`=`、`]`、
   `)` のどれか: `backslash-end` の単位。
   文脈を出ます。 [fixture: flowchart/lex-slanted-question-end]
   [fixture: flowchart/lex-slanted-paren-open-end]
   [fixture: flowchart/lex-slanted-equals-end]
4. `/]`: `slash-end` の単位。
   文脈を出ます。 [fixture: flowchart/lex-lean-right-label]
5. `]` が後に続かない `/` か `\`、または `\`、`[`、`]`、`(`、`)`、`{`、`}`、
   `/` 以外の 1 個以上の文字: `text-run` の単位。
   [fixture: flowchart/lex-slanted-question-in-run]

規則 5 は `/` や `\` を単独のテキストの並びとして読むので、
単位が `?` や `=` から始まることがあります。
`A[/a/?]` はラベル `a/` の台形で、`A[/a?]` は拒否されます。
テキストの並び `a?` が `?` を取るからです。
`A[/a]]` と `A[/a)]` は、ラベル `a` の台形です。
[fixture: flowchart/lex-slanted-question-end] [fixture:
flowchart/lex-slanted-question-in-run] [fixture:
flowchart/lex-slanted-double-bracket-end] [fixture:
flowchart/lex-slanted-paren-end]
規則 1 は単位が始まる位置で当てはまります。
`A[/ "x /]` は、空白から始まるテキストの並びが `"` を取るので、
ラベル `"x` の `lean-right` の形です。
一方、`A[/"x/]` は閉じない文字列を始め、入力は拒否されます。
[fixture: flowchart/lex-slanted-label-space-quote] [fixture:
flowchart/lex-slanted-label-quote]
空白の後に引用符が 2 つあっても、同じくテキストの並びの文字として読みます。
`A[/ "x"/]`、`A[/ "x" /]`、`A[\ "x"\]` は、
引用符を含むテキストのラベル `"x"` を持ち、
`A[/ "x"y/]` はテキストのラベル `"x"y` を持ちます。
[fixture: flowchart/lex-slanted-label-space-string]
[fixture: flowchart/lex-slanted-label-space-string-space]
[fixture: flowchart/lex-slanted-label-backslash-space-string]
[fixture: flowchart/lex-slanted-label-space-string-then-text]

### 楕円の文脈

楕円の文脈は、`(-...-)` のラベルを読みます。
各位置で:

1. `"`: 文字列（[文字列](#文字列) を参照）。
   [fixture: flowchart/lex-ellipse-string]
2. 0 個以上の空白と 3 個以上の `~`: 拒否されます。
   [fixture: flowchart/lex-ellipse-tilde-start]
3. `)` が後に続く `-`、`/`、`)`: `ellipse-end` の単位。
   文脈を出ます。 [fixture: flowchart/lex-ellipse-slash-end]
4. `(`、`)`、`[`、`]`、`{`、`}` 以外の 1 文字: その 1 文字の `text-run` の単位。
   エンティティのプレースホルダは、
   1 つのそのような単位です（[エンティティ](../common.ja.md#エンティティ)
   を参照）。 [fixture: flowchart/lex-ellipse-label]

`A(-a/)` と `A(-a))` はラベル `a` の楕円で、 `A(-a|b-)` のラベルは `a|b` です。
[fixture: flowchart/lex-ellipse-slash-end] [fixture:
flowchart/lex-ellipse-paren-end] [fixture: flowchart/lex-ellipse-pipe]
`A(-#x;t-)` と `A(-t#x;-)` のラベルは、`#x;` のプレースホルダと `t` を、
その順に並べたものです。 [fixture: flowchart/lex-ellipse-entity-start] [fixture:
flowchart/lex-ellipse-entity-end]

### リンクテキストの文脈

開く矢印は、その種類（破線、太線、点線）のリンクテキストの文脈に入ります。
各位置で:

1. `"`: 文字列（[文字列](#文字列) を参照）。
   [fixture: flowchart/gram-link-text-string-then-text]
2. 同じ種類の閉じた矢印と、その空白（[矢印](#矢印) を参照）: `arrow` の単位。
   文脈を出ます。 [fixture: flowchart/lex-link-text-head-letter]
3. その種類の文字（破線は `-`、太線は `=`、点線は `.`）以外の 1 文字、または、
   破線の文脈では、`-` が後に続かない `-`: `link-text-char` の単位。
   エンティティのプレースホルダは、 1 つのそのような単位です。
   [fixture: flowchart/lex-link-text-double-dash]
   [エンティティ](../common.ja.md#エンティティ) を参照してください。

そのため、破線のリンクのテキストの中の `--` は、
リンクを閉じるのでなければ拒否されます。
太線のリンクの中の `=` と、点線のリンクの中の `.` も同じです。
閉じる矢印は各位置で最初に試されるので、その前の空白と、
その直前の矢じりの文字は矢印に属します。
`A-- box-->B` のリンクテキストは `bo` で、矢印は `x-->` です。
[fixture: flowchart/lex-link-text-double-dash] [fixture:
flowchart/lex-link-text-equals] [fixture: flowchart/lex-link-text-dot] [fixture:
flowchart/lex-link-text-head-letter]
リンクテキストの中のエンティティは 1 つの単位です。
`A--#x;-->B`、`A==#x;==>B`、
`A-.#x;.->B` の辺のテキストは `#x;` のプレースホルダで、数字のエンティティや、
語に `o` や `x` を持つエンティティも同じです。
`A--#x;x-->B` では、エンティティの後の `x` は閉じる矢印の矢じりです。
`A--#x%%{init: {}}%%y;-->B` のように、
エンティティの中にディレクティブがあってもかまいません。
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
  `accDescr {}` だけなら文になりますが、`""accDescr {}` も拒否されます。
  mermaid.js は空の文字列にトークンを読まず、
  これらをそれがないものとして受理します。
  これらは既知の差異
  [`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)
  です（[既知の差異](#既知の差異) を参照）。
  `A --""> B` はどちらも拒否します。
  リンクのテキストの中では、 `""` が開く `--` を終えないからです。
  [fixture: flowchart/lex-empty-string-line] [fixture:
  flowchart/lex-empty-string-before-id] [fixture:
  flowchart/lex-empty-string-before-empty-description-block] [fixture:
  flowchart/tokens-empty-string-in-label] [fixture:
  flowchart/lex-empty-string-after-string] [fixture:
  flowchart/lex-empty-string-after-shape] [fixture:
  flowchart/lex-empty-string-in-arrow]
- 並びが 1 つ: `string` の単位。
  その並びを markdown 文字列の文脈で読んだ場合は `markdown-string` の単位。
  単位のテキストはその並びです。
- 並びが 2 つ以上: 拒否されます。

ラベルや [StringLiteral](../ast.ja.md#stringliteral) としての文字列の値は、
その中身、つまりその 1 つの並びの [書かれたテキスト](../ast.ja.md#ノード) です。
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
   [fixture: flowchart/gram-string-nested-markdown]
2. `"`: 文脈を出ます。 [fixture: flowchart/lex-string-multiline]
3. `"` 以外の 1 個以上の文字: 中身の並び。
   [fixture: flowchart/lex-string-multiline]

markdown 文字列の文脈では:

1. バッククォートと `"` 以外の 1 個以上の文字: 中身の並び。
   [fixture: flowchart/gram-string-markdown-then-text]
2. `"` が後に続くバッククォート: 文脈を出ます。
   [fixture: flowchart/gram-string-markdown-then-text]
3. バッククォートが後に続く `"`: markdown 文字列の文脈に入ります。
   [fixture: flowchart/gram-string-markdown-in-markdown]
4. `"`: 文字列の文脈に入ります。
   [fixture: flowchart/lex-markdown-string-quote-enters-string]

文字列は行をまたいでかまわず、その中の改行は、
次の行の始まりの空白とともにテキストの一部です。
`A["a`、改行、`   b"]` のラベルは、`a`、改行、空白 3 つ、 `b` です。
[fixture: flowchart/lex-string-multiline]
[fixture: flowchart/lex-string-multiline-indent]
テキストの終わりまでにその文脈を出ない文字列は単位を作らず、入力は拒否されます。
[fixture: flowchart/lex-string-unclosed] [fixture:
flowchart/lex-markdown-string-unclosed]

### データブロック

`@{` で入るデータの文脈では:

1. `"`: `data-quote` の単位。
   データの文字列の文脈に入ります。
   [fixture: flowchart/lex-data-brace-in-string]
2. `}`、`^`、 `"` 以外の 1 個以上の文字: `data-text` の単位。
   [fixture: flowchart/gram-data-shape-known]
3. `}`: `}` の単位。
   文脈を出ます。 [fixture: flowchart/gram-data-shape-known]

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
   [fixture: flowchart/gram-click-string-id]
2. 1 個の空白: 文脈を出ます。 [fixture: flowchart/lex-click-line-feed]
3. 空白以外の 1 個以上の文字: その中の各 `,` は `click-comma` の単位で、
   それ以外の文字の各並びは `click-id` の単位。
   [fixture: flowchart/lex-click-id-comma]

そのため、クリックの文の id は、
次の空白までのすべての文字を各 `,` で区切ったもので、
その後の 1 個の空白は id と一緒に読まれます。
規則 3 はできるだけ多くの文字を読むので、規則 1 が当てはまるのは、
文脈の始まりと、文字列の直後だけです。
`,` の後の `"` は次の id に属し、`click A"" href "x"` の id は `A""` で、
どの頂点も指しません。 [fixture: flowchart/lex-click-id-with-quotes]
`click A[x],B href "u"` は id `A[x]` と `B` を、
`click A,"x" href "u"` は id `A` と `"x"` を読みます。
どちらも mermaid.js と同じです。 [fixture: flowchart/lex-click-id-comma]
[fixture:
flowchart/lex-click-id-comma-quote]
クリックの文脈が読む `,` は、 `,` の単位ではなく `click-comma` の単位です。
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
字下げが続く改行も同じで、`click A`、改行、 `  cb` は拒否されます。
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
それらは既知の差異
[`click-reserved-word`](../known-divergences/click-reserved-word.ja.md)
です（[既知の差異](#既知の差異) を参照）。
そのため、クリックの文は、始まりに `click` の単位を 1 つだけ持ち、
そのクリックの id は、その単位のクリックの文脈が読むものです。
`click A click href "u"`、`click A click B href "u"`、
`click A click cb "tip"`、`click A, click B href "u"`、
`click A click , href "u"`、`click A click ""href "u"`、
`click A click B call cb()`、`click A cb click B`、
`click A href "u" click _blank` は、mermaid.js と同じく拒否され、
`style A click fill:red`、`style A click ""fill:red`、`A:click b-->C`、
`A & click B`、`A-->B & click C` も拒否されます。
一方、 `click A,B href "u"` は受理されます。
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
[fixture: flowchart/gram-ampersand-then-click-statement]
[fixture: flowchart/gram-link-ampersand-then-click-statement]
[fixture: flowchart/gram-click-two-ids-one-click]
語 `click` が `click` の単位になるのは、単位の始まりにあり、
後に空白が続くときだけです（[文の文脈](#文の文脈) の規則 9）。
`A-click` と `vclick` は id の並びで、 `A:click""b` では、
`A` と `:` の後の `click""b` が id の並びです。
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
   文脈を出ます。 [fixture: flowchart/gram-click-empty-call-then-arguments]
   [fixture: flowchart/lex-callback-blank-parentheses]
   [fixture: flowchart/gram-click-call-empty-parentheses]
2. `(`: `(` の単位。
   文脈を出て、コールバックの引数の文脈に入ります。
   [fixture: flowchart/gram-click-call]
3. `(` 以外の 1 個以上の文字: `callback-name` の単位。
   [fixture: flowchart/lex-directive-in-callback-name]

コールバックの引数の文脈では、`)` は `)` の単位で文脈を出て、
他の 1 個以上の文字は `callback-arguments` の単位です。
名前と引数は、改行を含めてどの文字を含んでもかまいませんが、
`(` のないコールバックはテキストの残りを名前として読み、拒否されます。
テキストがコールバック名の文脈か、コールバックの引数の文脈の中で終わると、
入力は拒否されます。
mermaid.js はそこで空の名前か空の引数を読むからです。
[fixture: flowchart/lex-callback-no-parenthesis] [fixture:
flowchart/lex-callback-arguments-end-of-text]

mermaid.js は、`call` の単位と、コールバックの文脈の `(` と `)` の単位について、
トークンを読みません。
コールバックのうち、その文法のトークンになるのは名前と引数だけです。
この仕様の文法は、これらの単位を、クリックの文の中で、
名前と引数の前後にあるものとして読みます（[クリックの文](#クリックの文)
を参照）。
`call` の単位の後に、`(` の単位と `)` の単位が、
間に空白だけを挟んで直接続くものを、**空の呼び出し**と呼びます。
空の呼び出しは名前も引数も持ちません。
空の文字列と同じく、値の中を含め、どの 2 つの単位の間にも現れ、
木にはそこにそれを置く場所がありません。
そのため、文法のどの規則もそれを取らず、空の呼び出しのある入力は拒否されます。
mermaid.js はそのどれにもトークンを読まず、次のような場所で、
それがないものとして受理します。
1 行だけの `call ()`、`A call ()`、`call () B`、`A call ()-->B`、
`A-->call ()B`（`(` と `)` の間に改行があっても同じ）、
頂点 `A,` としての `A,call ()`、頂点 `,` としての `,call ()`、
クリックの文の中では、`click A cb` と同じものとしての `click A call ()cb`、
`click A call ()href "u"` がそうです。
これらは既知の差異
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)
です。
`A-->call () B` はどちらも拒否します。
mermaid.js は空の呼び出しの後の空白を、行き先の前の空白として読むからです。
[fixture: flowchart/gram-empty-call-line]
[fixture: flowchart/gram-empty-call-after-vertex]
[fixture: flowchart/gram-empty-call-before-vertex]
[fixture: flowchart/gram-empty-call-before-link]
[fixture: flowchart/gram-empty-call-after-arrow]
[fixture: flowchart/gram-empty-call-line-feed]
[fixture: flowchart/gram-empty-call-after-comma]
[fixture: flowchart/gram-empty-call-comma-vertex]
[fixture: flowchart/gram-click-empty-call-before-callback]
[fixture: flowchart/gram-click-empty-call-before-href]
[fixture: flowchart/gram-empty-call-after-arrow-space]
`call` は、
後に空白が続くときだけキーワードです（[文の文脈](#文の文脈) の規則 5）。
`call()` は拒否されます。
コールバックの名前や引数を受け付けるのは、
クリックの id の後に続くクリックの文だけです。
`,call x` と `A,call (x)` は拒否され、
クリックの id が `,call` である `click ,call ()` も拒否されます。
[fixture: flowchart/gram-call-no-whitespace]
[fixture: flowchart/gram-call-name-outside-click]
[fixture: flowchart/gram-call-arguments-outside-click]
[fixture: flowchart/gram-click-comma-call-empty]
クリックの文の中では、引数が、
名前の後の 2 つ目の `call` の後に来ることもあります。
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
それはテキストのない説明のブロックの文です。
[方向とアクセシビリティの文](#方向とアクセシビリティの文) を参照してください。
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
文の最後の単位の後、区切りの前でも、それは文です。
`A accDescr {}` と、2 行に分けた `A accDescr {` と `}` は、
頂点の文と説明ブロックの文です。
ヘッダーの方向の後、その区切りの前でも同じです。
[区切りの前の空の説明ブロック](#区切りの前の空の説明ブロック)
を参照してください。
それ以外の位置では、それは文の中にあり、木にはそこにそれを置く場所がないので、
文法のどの規則もそれを取らず、入力は拒否されます。
`A accDescr {}-->B` がそうです。
mermaid.js は空の説明ブロックにトークンを読まず、
それがないものとして受理します。
これは既知の差異
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)
です。
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
規則は、`:` や `{` の後の空白を、改行を含めて、
`:` や `{` の単位の一部として読みます。
`accTitle:`、改行、 `  foo` のタイトルは `foo` です。
[fixture: flowchart/lex-acc-title-next-line]
そのため、次の行の文がタイトルになります。
`accTitle:`、改行、`A-->B` のタイトルは `A-->B` で、頂点も辺もありません。
[fixture: flowchart/lex-acc-title-next-line-statement]

### ヘッダーの文脈

最初のヘッダーのキーワードが、ヘッダーの文脈に入ります。

1. 改行を含む空白の、最後の改行まで: `no-direction` の単位。
   文脈を出ます。 [fixture: flowchart/header-direction-next-line]
2. 0 個以上の空白、その後に、後に語の文字が続かない `LR`、`RL`、`TB`、`BT`、
   `TD`、`BR`、`v`、または `<`、`>`、`^`: その方向の `header-direction` の単位。
   文脈を出ます。 [fixture: flowchart/header-direction-trailing-space]
   [fixture: flowchart/db-direction-br] [fixture: flowchart/db-direction-bt]
   [fixture: flowchart/db-direction-mapping]
   [fixture: flowchart/header-direction-rl]
   [fixture: flowchart/header-direction-v]
   [fixture: flowchart/header-direction-greater-than]
   [fixture: flowchart/header-direction-caret]
   [fixture: flowchart/header-direction-then-word]
3. `"`: 文字列（[文字列](#文字列) を参照）。
   それが終わると、字句解析器はヘッダーの文脈に戻ります。
   [fixture: flowchart/header-string]

規則 1 が先なので、次の行の方向は方向ではありません。
`flowchart`、改行、`LR` は方向を持たず、頂点 `LR` を持ちます。
`flowchart LR;A` は受理され、 `graph;A` は拒否されます。
[fixture: flowchart/header-direction-next-line] [fixture:
flowchart/header-semicolon-no-direction]
文法はヘッダーに文字列を許しません。
中身のある文字列を持つ `flowchart"x" TD` は拒否され、
空の文字列も拒否されます（[文字列](#文字列) を参照）。
`flowchart"" TD`、`flowchart""TD`、`flowchart"""" TD`、
`flowchart` の後に空の markdown 文字列 `"``"` と ` TD` が続くもの、
`flowchart"" LR;A`、`flowchart""` の後に改行が続くものは、ここでは拒否されます。
mermaid.js はこれらを、空の文字列がないものとして受理し、方向は `TD`、`LR`、
またはなしです。
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
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L211-L272)
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
`é`（U+00E9）は文字ですが、 `°`（U+00B0）は文字ではありません。
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
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L302-L633)
の文法を述べ直したもので、同じ単位の並びを受理します。

次の各規則が、
[ast/flowchart.ja.md](../ast/flowchart.ja.md) で定める木のノードを作ります。

| 規則                                                                                                       | ノード                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `diagram`                                                                                                  | [`FlowchartDiagram`](../ast/flowchart.ja.md#flowchartdiagram)                                                                                                                                                                |
| `empty-statement`                                                                                          | [`FlowchartEmptyStatement`](../ast/flowchart.ja.md#flowchartemptystatement)                                                                                                                                                  |
| `vertex-statement`                                                                                         | [`FlowchartVertexStatement`](../ast/flowchart.ja.md#flowchartvertexstatement)                                                                                                                                                |
| `vertex-group`                                                                                             | [`FlowchartVertexGroup`](../ast/flowchart.ja.md#flowchartvertexgroup)                                                                                                                                                        |
| `vertex`                                                                                                   | [`FlowchartVertex`](../ast/flowchart.ja.md#flowchartvertex)                                                                                                                                                                  |
| `shape`                                                                                                    | [`FlowchartShape`](../ast/flowchart.ja.md#flowchartshape)。`"[\|"` の選択肢では、さらに [`FlowchartShapeProperty`](../ast/flowchart.ja.md#flowchartshapeproperty)                                                            |
| `label`, `link-text`, `subgraph-name`                                                                      | [`FlowchartLabel`](../ast/flowchart.ja.md#flowchartlabel)                                                                                                                                                                    |
| `id`、`id-list-part`、`click-id`、`edge-id`、`name`、`"[\|"` の後の各 `id-run`                             | [`Identifier`](../ast.ja.md#identifier)                                                                                                                                                                                      |
| クリックの文の `string`                                                                                    | [`StringLiteral`](../ast.ja.md#stringliteral)                                                                                                                                                                                |
| リンクスタイルの文の `number`                                                                              | [`NumericLiteral`](../ast.ja.md#numericliteral)                                                                                                                                                                              |
| `style`、`callback-name`、`callback-arguments`、`title-text`、`description-text`、`description-block-text` | [`FlowchartLiteral`](../ast/flowchart.ja.md#flowchartliteral)。すべて空白の `style` は null（[FlowchartStyleStatement](../ast/flowchart.ja.md#flowchartstylestatement) を参照）                                              |
| `data`                                                                                                     | [`FlowchartDataBlock`](../ast/flowchart.ja.md#flowchartdatablock)                                                                                                                                                            |
| `link`                                                                                                     | [`FlowchartLink`](../ast/flowchart.ja.md#flowchartlink)。その行き先は、その後の頂点のグループ                                                                                                                                |
| `arrow`                                                                                                    | [`FlowchartArrow`](../ast/flowchart.ja.md#flowchartarrow)                                                                                                                                                                    |
| `opening-arrow`                                                                                            | [`FlowchartOpeningArrow`](../ast/flowchart.ja.md#flowchartopeningarrow)                                                                                                                                                      |
| `subgraph-statement`                                                                                       | [`FlowchartSubgraphStatement`](../ast/flowchart.ja.md#flowchartsubgraphstatement)                                                                                                                                            |
| `style-statement`                                                                                          | [`FlowchartStyleStatement`](../ast/flowchart.ja.md#flowchartstylestatement)                                                                                                                                                  |
| `class-def-statement`                                                                                      | [`FlowchartClassDefStatement`](../ast/flowchart.ja.md#flowchartclassdefstatement)                                                                                                                                            |
| `class-statement`                                                                                          | [`FlowchartClassStatement`](../ast/flowchart.ja.md#flowchartclassstatement)                                                                                                                                                  |
| `link-style-statement`                                                                                     | [`FlowchartLinkStyleStatement`](../ast/flowchart.ja.md#flowchartlinkstylestatement)。`"default"` のときは [`FlowchartDefaultLinkStyleStatement`](../ast/flowchart.ja.md#flowchartdefaultlinkstylestatement)                  |
| `click-statement`                                                                                          | [`FlowchartClickCallbackStatement`](../ast/flowchart.ja.md#flowchartclickcallbackstatement)（1 つ目と 3 つ目の選択肢）。2 つ目の選択肢では [`FlowchartClickUrlStatement`](../ast/flowchart.ja.md#flowchartclickurlstatement) |
| `direction-statement`                                                                                      | [`FlowchartDirectionStatement`](../ast/flowchart.ja.md#flowchartdirectionstatement)                                                                                                                                          |
| `title-statement`                                                                                          | [`FlowchartAccTitleStatement`](../ast/flowchart.ja.md#flowchartacctitlestatement)                                                                                                                                            |
| `description-statement`                                                                                    | [`FlowchartAccDescrStatement`](../ast/flowchart.ja.md#flowchartaccdescrstatement)                                                                                                                                            |
| `description-block-statement`                                                                              | [`FlowchartAccDescrBlockStatement`](../ast/flowchart.ja.md#flowchartaccdescrblockstatement)                                                                                                                                  |
| `empty-description-block`                                                                                  | テキストのない [`FlowchartAccDescrBlockStatement`](../ast/flowchart.ja.md#flowchartaccdescrblockstatement)。その前の文の後の文。subgraph の名前の後では、その本体の最初の文。ヘッダーの後では、図の最初の文                  |

### 図と文

```text
diagram                     = header line*
header                      = header-keyword ( no-direction | header-direction ( ";" | space* newline ) )
line                        = statement | empty-statement | newline | space
statement                   = vertex-statement statement-end
                            | style-statement statement-end
                            | class-def-statement statement-end
                            | class-statement statement-end
                            | link-style-statement statement-end
                            | click-statement statement-end
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
[fixture: flowchart/header-space-before-semicolon]
subgraph、方向の文、アクセシビリティの文以外の文の後には、その区切り、
つまり改行、`;`、テキストの終わりのどれかが続かなければならず、
その前には空の説明ブロックしか置けません。
[区切りの前の空の説明ブロック](#区切りの前の空の説明ブロック)
を参照してください。
そのため、`class A c; %%{init: {}}%%` は受理されますが、`;` がなければ、
ディレクティブの前の空白がクラス名の後の `space` の単位になり、
入力は拒否されます。
`class A c""` では引用符が id の並びの文字で、クラスは `c""` です。
一方、`class A c;""` では、それは区切りの後の空の文字列で、
入力は拒否されます（[文字列](#文字列) を参照）。
`;` の前の `click` が頂点になる `click;"" A` も、同じく拒否されます。
[fixture: flowchart/gram-separator-before-directive] [fixture:
flowchart/gram-no-separator-before-directive] [fixture:
flowchart/gram-separator-before-empty-string] [fixture:
flowchart/lex-click-keyword-semicolon-statement] [fixture:
flowchart/lex-quotes-after-class-name]
区切りはどの文にも属しません。
文法が読むそれ以外の `;` は、どれも空の文です。
区切りの後の 2 つ目の `;`、1 行だけの `;`、
区切りを取らない文の直後の `;` がそうです。
`end` はその後の空白を取るので、 1 行だけの `end;` の `;` は空の文です。
[fixture: flowchart/db-subgraph-member-empty-statement] [fixture:
flowchart/db-subgraph-member-empty-statement-end] [fixture:
flowchart/gram-empty-statement-line]
区切りの後に続く改行は、それ自体が 1 つの行です。

### 区切りの前の空の説明ブロック

```text
statement-end           = separator
empty-description-block = "accDescr" "{" "}"
```

`empty-description-block` は、`accDescr` の単位と `{` の単位に、
`description-block-text` の単位なしで `}` の単位がすぐ続くものです。
区切りが要る文は `statement-end`、つまりその区切りで終わります。
そのような文の最後の単位の後、区切りの前には、
空の説明ブロックがいくつ来てもかまわず、
産出規則 `header` と `statement-end` を含めて、文法は、下に述べるとおり、
それらを除いた単位を読みます。
それぞれ、その文の後に続く、テキストのない説明ブロックの文で、何も変えません。
mermaid.js は空の説明ブロックにトークンを読まないので（詳しくは
[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.ja.md)
を参照）、その文の後にすぐ区切りが続くものとして読みます。
テキストのある説明ブロックと、ほかの文は、区切りの前に置けません。

flowchart で区切り（改行、`;`、テキストの終わり）が要る文は、頂点、style、
クラスの定義、class、リンクのスタイル、click の文で、
subgraph の名前の後にも区切りが要ります。
そのため、`A accDescr {}`、`A accDescr {} accDescr {}`、`A accDescr {};B`、
`A --> B accDescr {}`、`style A fill:red accDescr {}`、
`classDef c fill:red accDescr {}`、`linkStyle 0 stroke:red accDescr {}`、
`subgraph S accDescr {}`、`click A href "u"accDescr {}` は受理されます。
`A accDescr {`、改行、 `}` も同じです。
[fixture: flowchart/gram-empty-description-block-after-vertex] [fixture:
flowchart/gram-empty-description-blocks-after-vertex] [fixture:
flowchart/gram-empty-description-block-before-semicolon] [fixture:
flowchart/gram-empty-description-block-after-link] [fixture:
flowchart/gram-empty-description-block-after-style] [fixture:
flowchart/gram-empty-description-block-after-classdef] [fixture:
flowchart/gram-empty-description-block-after-linkstyle] [fixture:
flowchart/gram-empty-description-block-after-subgraph-name] [fixture:
flowchart/gram-empty-description-block-after-click-glued] [fixture:
flowchart/gram-empty-description-block-line-feed]
文法は、mermaid.js と同じく、文とその `statement-end` を、
空の説明ブロックを除いて読みます。
ブロックの前、間、後の `space` の単位は文の終わりの空白で、
文の規則がそれを取るかどうかで決まります。
頂点の文の終わりは空白を取り、 style、クラスの定義、
リンクのスタイルの文のスタイルと、 subgraph の名前も空白を取るので、
`A accDescr {} ;B`、`A accDescr {} accDescr {} ;B`、
`style A fill:red accDescr {} ;B`、`subgraph S accDescr {} ;A` は受理されます。
class の文、click の文、データブロックで終わる頂点の文は、空白を取りません。
クラス名や URL の後の `space` の単位には文の続きが要り、
改行が続かないデータブロックの後の空白は `space`
の単位だからです（[`}` の後の空白](#-の後の空白) を参照）。
そのため、`class A c accDescr {}`、`class A c accDescr {} ;B`、
`click A href "u" accDescr {}`、`click A href "u"accDescr {} ;B`、
`click A href "u"accDescr {} accDescr {}`、`A@{ shape: rect } accDescr {}`、
`A@{ shape: rect }accDescr {} ;B` は、
ブロックのない同じものと同じく拒否されます。
一方、
`click A href "u"accDescr {}accDescr {}` と
`A@{ shape: rect }accDescr {}accDescr {}` は受理されます。
ブロックの両側の `space` の単位は、2 つの単位のままです。
`linkStyle 0 interpolate basis accDescr {} ;` では、 1 つ目が補間の名前を終え、
2 つ目がすべて空白のスタイルなので、入力は受理されますが、
`linkStyle 0 interpolate basis`、空白 2 つ、`;` は拒否されます。
改行で終わる、
ブロックの `}`
の後の空白は改行として読まれるので（[`}` の後の空白](#-の後の空白) を参照）、
`click A href "u"accDescr {}` に空白と改行が続くものは受理されます。
mermaid.js も同じに読みます。 [fixture:
flowchart/gram-empty-description-block-splits-spaces-after-interpolate]
[fixture: flowchart/gram-interpolate-trailing-space] [fixture:
flowchart/gram-empty-description-block-after-click-trailing-space]
[fixture: flowchart/gram-empty-description-block-before-space-semicolon]
[fixture: flowchart/gram-empty-description-blocks-before-space-semicolon]
[fixture: flowchart/gram-empty-description-block-after-style-before-semicolon]
[fixture:
flowchart/gram-empty-description-block-after-linkstyle-before-semicolon]
[fixture:
flowchart/gram-empty-description-block-after-classdef-before-semicolon]
[fixture:
flowchart/gram-empty-description-block-after-subgraph-name-before-semicolon]
[fixture: flowchart/gram-empty-description-block-after-data-block-glued]
[fixture: flowchart/gram-empty-description-blocks-after-data-block-glued]
[fixture: flowchart/gram-empty-description-blocks-after-click-glued] [fixture:
flowchart/gram-empty-description-block-after-click-space] [fixture:
flowchart/gram-empty-description-block-after-class-statement] [fixture:
flowchart/gram-empty-description-block-after-class-statement-before-semicolon]
[fixture: flowchart/gram-empty-description-block-after-click-before-semicolon]
[fixture: flowchart/gram-empty-description-blocks-after-click-space-between]
[fixture: flowchart/gram-empty-description-block-after-data-block-space]
[fixture:
flowchart/gram-empty-description-block-after-data-block-before-semicolon]
[fixture:
flowchart/gram-empty-description-blocks-after-data-block-space-between]
subgraph の名前の区切りの前の空の説明ブロックは、その本体の最初の文で、
subgraph の名前のテキストはそれを除きます（[文法の外での拒否](#文法の外での拒否)
を参照）。
`subgraph "S"accDescr {}` の名前のテキストは `S` で、id は `S` ですが、
ブロックの前の空白はそれに残り、
`subgraph S accDescr {}` の名前のテキストは `S` と空白で、
id は `subGraph0` です。
[fixture: flowchart/gram-empty-description-block-after-subgraph-name]
[fixture: flowchart/db-subgraph-name-text-without-empty-description-block]
区切りが続かないブロックは文の中にあります。
`A accDescr {} B` は両方が拒否し、mermaid.js が受理する `A accDescr {}-->B` は、
既知の差異 `tokenless-empty-forms` です。
[fixture: flowchart/gram-empty-description-block-then-vertex]
[fixture: flowchart/gram-empty-description-block-before-link]
[既知の差異](#既知の差異) を参照してください。

方向のあるヘッダーにも区切りが要ります。
`;` か、前に空白だけがある改行です（[図と文](#図と文) を参照）。
文の区切りの前と同じく、その区切りの前には空の説明ブロックが来てもかまいません。
それぞれ、テキストのない説明ブロックの文で、図の最初の文です。
mermaid.js は、ヘッダーの後にすぐ区切りが続くものとして読みます。
文法はヘッダーをそのブロックを除いて読むので、
ブロックの周りの `space` の単位は方向の後の空白で、その後には改行が要ります。
そのため、改行と `A` が続くか、
テキストの終わりにある `flowchart LR accDescr {}`、 `flowchart LR`、空白 2 つ、
`accDescr {} accDescr {}` に空白と改行が続くもの、
`flowchart >accDescr {}` は受理され、ブロックのない同じ入力の Db を持ちます。
`flowchart LR accDescr {};A` と `flowchart LR accDescr {} A` は、
`flowchart LR ;A` と `flowchart LR  A` と同じく拒否され、
ブロックにテキストのある `flowchart LR accDescr {x}` も拒否されます。
`;` の前にブロックが来るのは、方向の後に空白がないとき、つまり `<`、`>`、
`^` のすぐ後にブロックを書いたときだけです。
`flowchart >accDescr {};A` と、ブロックが 2 つの同じものは、
`flowchart >;A` と同じく受理され、
`flowchart >accDescr {} accDescr {};A` は拒否されます。
[fixture: flowchart/header-empty-description-block-glued-before-semicolon]
[fixture: flowchart/header-empty-description-blocks-glued-before-semicolon]
[fixture: flowchart/header-empty-description-blocks-space-before-semicolon]
方向のないヘッダーには、ブロックを置く場所がありません。
ヘッダーのキーワードの後で、ヘッダーの文脈は、改行を含む空白、方向、
文字列だけを読むので（[ヘッダーの文脈](#ヘッダーの文脈) を参照）、
`flowchart accDescr {}` は拒否されます。
一方、`flowchart`、改行、`accDescr {}` は、文が始まるところのブロックです。
mermaid.js もこれらを同じに読みます。
[fixture: flowchart/header-empty-description-block-after-direction] [fixture:
flowchart/header-empty-description-block-after-direction-at-end] [fixture:
flowchart/header-empty-description-blocks-after-direction-spaces] [fixture:
flowchart/header-empty-description-block-after-symbol-direction-glued]
[fixture: flowchart/header-empty-description-block-before-semicolon] [fixture:
flowchart/header-empty-description-block-then-statement] [fixture:
flowchart/header-description-block-with-text-after-direction] [fixture:
flowchart/header-empty-description-block-no-direction]

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
どれも木の 1 つのノードです。 [fixture: flowchart/gram-vertex-id-comma]
[fixture: flowchart/gram-vertex-id-colon]
[fixture: flowchart/gram-vertex-id-hash-start]
[fixture: flowchart/gram-vertex-id-star-start]
[fixture: flowchart/gram-vertex-id-default]
[fixture: flowchart/gram-vertex-id-v] [fixture: flowchart/lex-number-vertices]
[fixture: flowchart/gram-data-consecutive-blocks]

- `A & B --> C & D` は、最初のグループの各頂点を、
  2 つ目のグループの各頂点につなぎます。
  グループは単独でもかまいません。
  `A & B` は受理されます。 [fixture: flowchart/gram-group-links] [fixture:
  flowchart/gram-group-two-vertices]
- `A &B` は拒否されます。
  `&` の後に `space` が必要だからです。
  `A&B` は 1 つの id です（[文の文脈](#文の文脈) を参照）。
  [fixture: flowchart/gram-group-no-space-after-ampersand] [fixture:
  flowchart/lex-ampersand-in-id]
- `A%%{init: {}}%%B-->C` は拒否されます。
  mermaid.js はそれに頂点 `AB` を与えます。
  ディレクティブは、名前の単位である id の並び `AB` の中にあります。
  [fixture: flowchart/div-directive-in-id]
  [単位の中のディレクティブ](#単位の中のディレクティブ) を参照してください。
- id とその形の間に空白を置くことはできません。
  `A [x]` は拒否されます。 [fixture: flowchart/gram-space-before-shape]
- データブロックは、空白を挟まずに頂点の後に置くしかなく、その後には `&`、
  リンク、区切りしか続きません。
  `A @{ shape: rect }` は拒否されます。
  続けて書いたブロックは、どれもその頂点に属し、
  それぞれが 1 つのデータブロックで、 mermaid.js はそれらを一緒に読みます。
  続く行の `A@{`、`shape: rect`、`}@{`、`label: x`、`}` は、
  A に 2 つのデータブロックと、形 `rect` とラベル `x` を与えます。
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

各選択肢は形に名前を与えます。

| 書き方                 | 名前               |
| ---------------------- | ------------------ |
| `[` … `]`              | `rectangle`        |
| `(` … `)`              | `rounded`          |
| `((` … `))`            | `circle`           |
| `(((` … `)))`          | `double-circle`    |
| `{` … `}`              | `diamond`          |
| `{{` … `}}`            | `hexagon`          |
| `([` … `])`            | `stadium`          |
| `[[` … `]]`            | `framed-rectangle` |
| `[(` … `)]`            | `cylinder`         |
| `>` … `]`              | `odd`              |
| `(-` … `ellipse-end`   | `ellipse`          |
| `[/` … `backslash-end` | `trapezoid-bottom` |
| `[/` … `slash-end`     | `lean-right`       |
| `[\` … `slash-end`     | `trapezoid-top`    |
| `[\` … `backslash-end` | `lean-left`        |
| `[\|` … `\|` … `]`     | `rectangle`        |

名前は、
mermaid.js がデータブロック `A@{ shape: … }`
で同じ形に受け付ける語です（mermaid.js の
[`shapesDefs`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/rendering-util/rendering-elements/shapes.ts#L107-L534)）。
それらの語のうち、形そのものを表し、省略していない語です。
`process`、`decision`、`subroutine` のような用途の語や、 `rect`、`diam`、
`fr-rect` のような省略した語は採りません。
括弧で書いた形は、データブロックでその名前を書いた形として描かれます。
`A[x]` と `A@{ shape: rectangle }` は同じに描かれます。
[fixture: flowchart/db-data-block-shape-names]
形 `(-` … `-)` にはそのような語がありません。
mermaid.js は `ellipse` という形を定めていないので、
`A@{ shape: ellipse }` は mermaid.js が拒否し、ここでは受理されます。
[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)
を参照してください。
また、`A(-x-)` を描くと失敗し、
[issue #5976](https://github.com/mermaid-js/mermaid/issues/5976)
がそれを報告していて、 2026-10-01 の時点で未解決で、
不具合として承認されています。
受理と Db には関わりません。 [fixture: flowchart/div-data-block-shape-ellipse]

円の 2 つの `(` と六角形の 2 つの `{` は別々の単位ですが、
その間に空白やテキストを置くことはできません。
`A( (x) )` は拒否されます。
2 つは合わせて 1
つの区切り記号です（[単位の中のディレクティブ](#単位の中のディレクティブ)
を参照）。
`[|` で書いた長方形は、名前と値からなるプロパティを 1 つ持ち、
どちらも 1 つの id の並びです。
`A[|borders:lt|text]` は、値 `lt` のプロパティ `borders` を持ちます。
その名前は `[` … `]` と同じく `rectangle` です。
プロパティは、 mermaid.js が長方形を描く方法を何も変えません。
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
ラベルの残りの [書かれたテキスト](../ast.ja.md#ノード) を続けたものです。
テキストの並びで始まるラベルでは、その書かれたテキストです。
``A["`x`" y]`` の値は `x y` で、種類は `markdown` です。
[fixture: flowchart/gram-string-markdown-then-text]
内側の空白は保ちます。
両端に空白を持つのは、その文字列の中身の内側か、
ラベルがすべて空白のときだけです。
値は変換した形ではなく書き手が書いたものを保ちます。
mermaid.js はさらにそれを trim します。

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
  ディレクティブはラベルのテキストの単位の中にあります。
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
subgraph-statement = "subgraph" space subgraph-name ( "[" label "]" )? statement-end line* "end"
subgraph-name      = ( string | markdown-string | name-piece ) name-piece*
name-piece         = number | id-run | letter | space | "-" | "&" | ":" | "*" | "#" | "v" | "^"
                   | "style" | "linkStyle" | "classDef" | "class" | header-keyword | "subgraph" | "end"
```

`subgraph` の後の名前は必須です。
mermaid.js は、文法では `subgraph` だけを受け付け、その後 Db で拒否します。
[fixture: flowchart/gram-subgraph-no-name]
名前はそれ自体がラベルです。
文字列、markdown 文字列、名前の部品のどれかに、
さらに名前の部品が続いたものです。
その種類は、ラベルと同じく `string`、`markdown`、`text` のどれかで、
その値はラベルと同じように決まります。
mermaid.js はそれを、
[文法の外での拒否](#文法の外での拒否) が定める名前のテキストとして読みます。
`subgraph "a"b` の名前は `ab` で、それが id とタイトルです。
`subgraph "a" b` の名前は `a b` です。
markdown 文字列も同じように続けられます。
`subgraph "a""b"` は拒否されます。
`subgraph b"a"` では、
`"` は id の並び `b"a"` の文字で（[文の文脈](#文の文脈) を参照）、
それが名前です。 [fixture: flowchart/gram-subgraph-name-string-then-text]
[fixture: flowchart/gram-subgraph-name-string-space-text]
[fixture: flowchart/gram-subgraph-name-markdown-then-text]
[fixture: flowchart/gram-subgraph-name-string-then-text-title]
[fixture: flowchart/gram-subgraph-name-string-then-string]
[fixture: flowchart/gram-subgraph-name-pieces]
[fixture: flowchart/gram-subgraph-name-quote-inside]
`end` の単位はその後の空白を持つので、`end` の後の同じ行に文を続けられます。
`end B` は受理されます。 [fixture: flowchart/gram-subgraph-end-then-statement]
名前は内側の空白を保ちます。
`subgraph a   b` のタイトルは、`a`、空白 3 つ、 `b` です。
[fixture: flowchart/db-subgraph-title-inner-spaces]

名前はキーワードを含んでもよく、その場合キーワードは名前のテキストの一部です。
`end` は、読まれ方のために、後に続くものを変えます。
名前の中の `end` は、その後の空白を、改行も含めて取ります。
`subgraph a end`、改行、`A`、改行、`end` は、名前が `a end`、改行、`A` で、
メンバーのない subgraph です。 [fixture: flowchart/gram-subgraph-name-end]
そのため、`subgraph Front end`、 `A`、`end` は、タイトルが `Front end`、改行、
`A` で、メンバーを持ちません。
一方、`subgraph fe [Front end]` は、id が `fe`、タイトルが `Front end` で、
メンバー A を持ちます。 [fixture: flowchart/db-subgraph-name-end-word] [fixture:
flowchart/db-subgraph-id-with-title-spaces]
区切りが続くところでも同じです。
名前が `end` の単位で終わるとき、その後の空白は、改行も含めて名前の一部で、
続く `;` は文の区切りで、続く空の説明ブロックは、区切りの前の、
本体の最初の文です。
`subgraph end`、改行、`;` は、名前が `end` と改行で、空白を含むので、
id は生成された `subGraph0`、タイトルは `end` で、`;` はメンバーではありません。
`;` の代わりに空の説明ブロックがあるとき、名前が `"a"end` のとき、
`end` の後に空白があるとき、 `;` の前に空行があるときも同じです。
[fixture: flowchart/db-subgraph-name-end-line-feed-then-semicolon]
[fixture: flowchart/db-subgraph-name-end-line-feed-then-empty-description-block]
[fixture: flowchart/db-subgraph-string-name-end-line-feed-then-semicolon]
[fixture: flowchart/db-subgraph-name-end-space-line-feed-then-semicolon]
[fixture: flowchart/db-subgraph-name-end-blank-line-then-semicolon]
`end` の単位で終わらない名前は、改行で終わります。
`subgraph S` か `subgraph xend`、改行、`;` は、id が `S` か `xend` で、
`;` は本体の空の文、つまりメンバー `;` です。
一方、 `subgraph end;` の id は `end` です。
[fixture: flowchart/db-subgraph-name-line-feed-then-semicolon]
[fixture: flowchart/db-subgraph-name-end-in-word-line-feed-then-semicolon]
[fixture: flowchart/db-subgraph-name-end-semicolon]
mermaid.js の flowchart の文書は、冒頭で、
小文字だけの語 `end` は flowchart を壊すと警告し、
語かその文字のどれかを大文字にするよう勧めています（mermaid.js の
[flowchart.md](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/flowchart.md#L9-L11)）。
その警告は、
[issue #1444](https://github.com/mermaid-js/mermaid/issues/1444) 「Some node
names break the diagrams」の回避策にリンクしています。
この issue は、ラベル `Type: Enhancement`、`Area: Documentation`、
`Good first issue!` を持ち、2020-06-23 に閉じられました。

名前は `click` の単位を含めません。
`click` の単位はクリックの文を始めるだけだからです。
[クリックとコールバック](#クリックとコールバック) を参照してください。
`subgraph click me`、`subgraph 1click me`、`subgraph Handle click events` は、
mermaid.js は受理しますが、
ここでは拒否されます（[既知の差異](#既知の差異) を参照）。
id の並びの中では、`click` は単位になりません。
`subgraph xclick me` は、タイトルに `xclick` を持ちます。
[fixture: flowchart/gram-subgraph-name-click-inside-id-run]

`[` の前の `space` は文法の `name-piece` ですが、名前の値には入りません。
[FlowchartSubgraphStatement](../ast/flowchart.ja.md#flowchartsubgraphstatement)
を参照してください。
閉じる `]` の後には区切りしか続けられません。
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
flowchart/db-style-comma-two-styles]
そのため、
`linkStyle 0 stroke:red;stroke-width:2px` は頂点 `stroke-width:2px` を作り、
`style A fill:red; style B fill:blue` は 2 つの文です。
[fixture: flowchart/gram-linkstyle-semicolon-ends-statement] [fixture:
flowchart/gram-style-semicolon-two-statements]
[fixture: flowchart/gram-style-keyword-inside-style]

木では、スタイルはその書かれたテキストで、範囲はその前の `,` のすぐ後から、
そこの空白を含めて始まり、空白でない最後の文字で終わります。
`style A fill:#f00 ,  stroke:#333 ` のスタイルは、`fill:#f00` と、
空白 2 つの後の `stroke:#333` で、すべて空白のスタイルは null です。
[fixture: flowchart/db-style-written-text-whitespace]
[fixture: flowchart/db-style-whitespace-only]
[ast/flowchart.ja.md](../ast/flowchart.ja.md#flowchartstylestatement)
を参照してください。

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
flowchart/db-classdef-escape-space-before-comma]
スタイルには 1 個以上の単位が要ります。
`style A fill:#f00,` は拒否され、`style A fill:#f00, ` は受理されます。
スタイルが含められるのはこれらの単位だけです。
`fill:rgb(0,0,0)` は拒否されます。
`(` がラベルを始めるからです。
`fill:default` も拒否されます。
`default` はキーワードだからです。 [fixture: flowchart/gram-style-parenthesis]
[fixture:
flowchart/gram-style-keyword]

`id-list` は `id` と同じ単位を受理し、リストとして読みます。
その要素は `,` の単位の間の部分なので、要素の数は `,` の単位の数より 1 つ多く、
空の部分は空の要素です。
`class ,A c` は A にクラス c を与え、`class , c` は受理され、
`classDef a,,b` はクラス `a`、空の名前、`b` を定めます。
どれも mermaid.js と同じです。 [fixture: flowchart/db-class-ids-empty-first]
[fixture:
flowchart/db-class-ids-only-comma] [fixture: flowchart/db-classdef-names-empty]
[fixture: flowchart/db-classdef-names-trailing-comma]
`style` の文の id、 `class` の文の 2 つ目の id、`:::` の後のクラス、
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
その括弧が空のときは、2 つ目の `call` の後の括弧の中の引数で呼びます。
[クリックとコールバック](#クリックとコールバック) を参照してください。
2 つ目は、最初の文字列の URL にリンクし、
省略可能なツールチップとリンク先を持ちます。
3 つ目は、名前で挙げた関数を呼びます。
どれでも、呼び出しやリンクの後の文字列はツールチップです。
クリックの id は、`id-list` と同じようにリストです。
`click A,,B href "u" "tip"` は、A、空の id、 B にツールチップを与えます。
[fixture: flowchart/db-click-ids-empty-tooltip] [fixture:
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
`click --> cb "tip"` は、 id `-->` にツールチップ `tip` を与えます。
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
ブロックが文の最後の単位の後にある `A accDescr {}` は、
頂点の文と説明のブロックの文です。
一方、ブロックが文の中にある `A accDescr {}-->B` は拒否されます。
[fixture: flowchart/gram-acc-descr-block-empty]
[fixture: flowchart/gram-acc-descr-block-empty-then-statement]
[fixture: flowchart/gram-acc-descr-block-empty-then-semicolon]
[fixture: flowchart/gram-empty-description-block-after-vertex]
[fixture: flowchart/gram-empty-description-block-before-link]
[アクセシビリティの値](#アクセシビリティの値) を参照してください。
タイトルは、 `;` と `#` を含めて行の残りです。
`accTitle: a;b #c` のタイトルは `a;b #c` です。
[fixture: flowchart/gram-acc-title-semicolon]

### 文法の外での拒否

mermaid.js は、文法が受理する入力の一部を、Db を作る途中で拒否します。

- **linkStyle の番号。**
  `linkStyle` の文の各番号は、文を読む時点で存在する辺を指さなければなりません。
  その NumericLiteral の `raw` は、
  先頭に 0 のない整数で（`value` では `00` と `0` を区別できない）、
  それより前の文が作った辺の数より小さくなければなりません。
  リンクは、その前のグループ（文の最初のグループか、
  前のリンクの行き先のグループ）の各頂点から、行き先のグループの各頂点へ、
  辺を 1 本ずつ作ります。
  ほかの文は辺を作りません。
  subgraph の本体の中のリンクの辺は、リンクが書かれた所で数えます。
  そのため、`A & B --> C & D` は 4 本、`A --> B --> C` は 2 本、
  `A --> B & C --> D` はリンクごとに 2 本の辺を作ります。
  [fixture: flowchart/gram-linkstyle-group-edges] [fixture:
  flowchart/gram-linkstyle-group-edges-out-of-range] [fixture:
  flowchart/gram-linkstyle-chain-edges] [fixture:
  flowchart/gram-linkstyle-chain-edges-out-of-range] [fixture:
  flowchart/gram-linkstyle-chain-group-edges] [fixture:
  flowchart/gram-linkstyle-chain-group-edges-out-of-range] [fixture:
  flowchart/gram-linkstyle-link-in-subgraph] [fixture:
  flowchart/gram-linkstyle-repeated-link]
  `linkStyle 00 stroke:red` と、指すリンクより前にある `linkStyle` は、
  `interpolate` があってもなくても拒否されます。
  mermaid.js は、
  [`updateLink()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L391-L413)
  と、
  [`updateLinkInterpolate()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L377-L386)
  の `TypeError` で、これらを拒否します。
  どちらも、テキストとして受け取った番号を確かめないからです。
  [fixture: flowchart/linkstyle-index-out-of-range] [fixture:
  flowchart/gram-linkstyle-leading-zero] [fixture:
  flowchart/gram-linkstyle-before-link] [fixture:
  flowchart/gram-interpolate-out-of-range]
- **辺が多すぎる。**
  辺が、サイト設定の `maxEdges`（既定は 500）より多い入力は拒否されます。
  この上限はテキストではなくサイト設定にあるので、この検査は、
  設定に依存する値と同じように行います。
  [設定（参考）](../../../tests/docs/configuration.ja.md#設定参考)
  を参照してください。
  設定を持つ側が、上の **linkStyle の番号** の数え方で、
  木が作る辺の数をそれと比べます。
  一方、上の linkStyle の番号は、木だけで検査します。
  [fixture: flowchart/config-max-edges-exceeded]
- **subgraph のメンバー。**
  subgraph の**メンバー**は、本体の順に、各頂点の文については、
  その最後のグループの頂点の id、その前のグループの id、
  と最初のグループまでさかのぼったもの、入れ子の各 subgraph については、
  その id（下を参照）、値が null でない各アクセシビリティの文については、
  その値、各空の文については `;` です。
  メンバーの中で、
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
  flowchart/db-subgraph-member-has-own-property-in-nested]
  メンバー `hasOwnProperty` は、どの種類のメンバーでもかまいません。
  入れ子の subgraph の id として、 `subgraph hasOwnProperty`、
  `subgraph "hasOwnProperty"`、 `subgraph hasOwnProperty [T]`、
  `subgraph " hasOwnProperty "[T]` から来ることも、
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
  [fixture: flowchart/gram-subgraph-member-has-own-property-acc-descr-block]
  [fixture: flowchart/db-subgraph-member-has-own-property-nested-title]
  [fixture: flowchart/db-subgraph-member-has-own-property-nested-name-space]
  subgraph の **id** は、その名前のテキストから両端の空白を除いたものです。
  ただし、タイトルがなく名前のテキストに空白がある subgraph は、
  `subGraph` に数を続けた、生成した id を得ます。
  それが `hasOwnProperty` になることはありません。
  **名前のテキスト**は、 mermaid.js が名前として読むテキストです。
  変換した形にした名前の値に、空の説明ブロックが名前のすぐ後に続くときは、
  それらのブロックの間と、最後のブロックと `;` の間の空白を続けたもので、
  ブロックそのものは入りません。
  タイトルがなければ、名前の値はすでに、名前の後の空白を、
  区切りか最初の空の説明ブロックまで持つので（詳しくは
  [FlowchartSubgraphStatement](../ast/flowchart.ja.md#flowchartsubgraphstatement)
  を参照）、ソースから読むのは、ブロックの後のその空白だけです。
  `subgraph` の後の `space` の単位はそれに入りません。
  `subgraph %%{init: {}}%% a` のように、
  その単位の中にディレクティブがあっても同じです。
  [fixture: flowchart/db-subgraph-id-directive-in-statement-space]
  名前の後に空白がある `subgraph a ` の名前のテキストは `a` と空白で、
  id は `subGraph0` です。 [fixture: flowchart/db-subgraph-name-trailing-space]
  名前の後の空の説明ブロックの前の空白と、そのようなブロックの間の空白は、
  名前のテキストに残りますが、改行で終わる、
  最後のブロックの後の空白は改行として読まれ（[`}` の後の空白](#-の後の空白)
  を参照）、それに入りません。
  `subgraph S accDescr {}`、`subgraph S accDescr {};A`、
  `subgraph "S"accDescr {} accDescr {}` の名前のテキストは空白を含み、
  id は `subGraph0` ですが、`subgraph "S"accDescr {}` は、
  行の終わりのブロックの後に空白があっても、名前のテキストが `S` で、
  id は `S` です。
  [fixture: flowchart/gram-empty-description-block-after-subgraph-name]
  [fixture: flowchart/db-subgraph-name-space-before-empty-description-block]
  [fixture: flowchart/db-subgraph-name-space-between-empty-description-blocks]
  [fixture: flowchart/db-subgraph-name-text-without-empty-description-block]
  [fixture: flowchart/db-subgraph-name-space-after-empty-description-block]
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
  そのため、
  入れ子の `subgraph "hasOwnProperty"accDescr {}` の id は `hasOwnProperty` で、
  ブロックを 2 つ続けて書いたものも同じですが、
  ブロックの前かブロックの間に空白があれば、生成した id を持ちます。 [fixture:
  flowchart/gram-subgraph-member-has-own-property-nested-string-before-block]
  [fixture:
  flowchart/db-subgraph-member-has-own-property-nested-space-before-block]
  [fixture:
  flowchart/db-subgraph-member-has-own-property-nested-space-between-blocks]
  [fixture: flowchart/gram-subgraph-member-has-own-property-nested-blocks-glued]
  この名前は、ほかのどこでも予約されていません。
  mermaid.js は、
  [`addSubGraph()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L685-L707)
  で、見たメンバーを素のオブジェクトのキーとして持ち、
  各メンバーについてそのオブジェクトの `hasOwnProperty` 関数に尋ねます。
  メンバー `hasOwnProperty` を残すと、その関数が `true` に置き換わるので、
  次のメンバーで `TypeError` を投げます。
- **データブロック。**
  mermaid.js は各データブロックを YAML として読み、その一部を拒否します。
  この仕様はそうしません（[既知の差異](#既知の差異) を参照）。

## 既知の差異

[known-divergences.ja.md](../known-divergences.ja.md) の差異のうち、
次のものが flowchart に当てはまり、次のように現れます。

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  字句解析器は、
  mermaid.js と同じくディレクティブのないテキストを読むので（詳しくは
  [単位の中のディレクティブ](#単位の中のディレクティブ) を参照）、
  字句解析器と文法の中でディレクティブが違いを生むのは、
  テキストの単位と文字列の単位のほかの単位、たとえば名前、キーワード、
  区切り記号、矢印、数の中にあるときだけです。
  そのとき入力はここでは拒否され、mermaid.js では受理されます。
  例は、`A%%{init: {}}%%B-->C` と `style%%{init: {}}%%A-->B` の名前、
  `A--%%{init: {}}%%>B`、`A-%%{init: {}}%%-->B`、
  `A-%%{init: {}}%%.->B` の矢印、`click A hr%%{init: {}}%%ef "u"`、
  `linkStyle 0 interpo%%{init: {}}%%late basis`、
  `A-->B dir%%{init: {}}%%ection TB` のキーワード、
  `A::%%{init: {}}%%:c` の `:::`、 `A(%%{init: {}}%%(x))` の `((` です。
  [fixture: flowchart/div-directive-in-id] [fixture:
  flowchart/div-directive-in-id-starting-with-style] [fixture:
  flowchart/div-directive-inside-arrow] [fixture:
  flowchart/div-directive-in-arrow-length] [fixture:
  flowchart/div-directive-in-arrow-dotted] [fixture:
  flowchart/div-directive-in-keyword-href] [fixture:
  flowchart/div-directive-in-keyword-interpolate] [fixture:
  flowchart/div-direction-line-directive-in-word] [fixture:
  flowchart/div-directive-in-style-separator] [fixture:
  flowchart/div-directive-in-circle-opening]
  [fixture: flowchart/div-directive-in-linkstyle-number]
  [fixture: flowchart/div-directive-in-class-id-list]
  [fixture: flowchart/div-directive-in-class-def-id-list]
  [fixture: flowchart/div-directive-in-edge-id]
  [fixture: flowchart/div-directive-in-interpolate-name]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
  `style` の規則に当たる行で、名前、数、キーワード、矢印、
  区切り記号の中の無視される `;` は、ここでは入力を拒否させ、
  mermaid.js はそれを受理します。
  `A[style:#x] --> B;b`、`linkStyle 1;0 stroke:red`、`sub;graph S`、
  `A[style:#x] -;-> B`、`A[style:#x] -;- t --> B` と、区切り記号 `::;:`、`(;(`、
  `[;(`、`{;{`、`@;{` が、どれも `A[style:#x];` の後か、
  そのような行にあるものがそうです。
  [fixture: flowchart/div-ignored-semicolon-in-id] [fixture:
  flowchart/div-ignored-semicolon-in-id-in-group] [fixture:
  flowchart/div-ignored-semicolon-in-edge-id] [fixture:
  flowchart/div-ignored-semicolon-in-css-class] [fixture:
  flowchart/div-ignored-semicolon-in-click-id] [fixture:
  flowchart/div-ignored-semicolon-in-style-id] [fixture:
  flowchart/div-ignored-semicolon-in-class-ids] [fixture:
  flowchart/div-ignored-semicolon-in-class-def-name] [fixture:
  flowchart/div-ignored-semicolon-in-linkstyle-number] [fixture:
  flowchart/div-ignored-semicolon-in-keyword] [fixture:
  flowchart/div-ignored-semicolon-in-arrow] [fixture:
  flowchart/div-ignored-semicolon-in-opening-arrow] [fixture:
  flowchart/div-ignored-semicolon-in-triple-colon] [fixture:
  flowchart/div-ignored-semicolon-in-circle-opening] [fixture:
  flowchart/div-ignored-semicolon-in-cylinder-opening] [fixture:
  flowchart/div-ignored-semicolon-in-hexagon-opening] [fixture:
  flowchart/div-ignored-semicolon-in-data-block-start]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)。**
  データブロックの中身は読みません。
  mermaid.js はそれを YAML として読み、YAML として正しくない中身と、
  知らない形を挙げる中身と、
  改行を持ち値が null の YAML である頂点の中身（`A@{`、改行、`}`）を拒否します。
  1 行の `A@{ }` は両方が受理します。
  ここではそれらを受理します。
  [fixture: flowchart/div-data-block-line-break-only] [fixture:
  flowchart/gram-data-block-space-only]
  データブロックの中の `%%` だけの行はコメント行ではないので中身に残り、
  mermaid.js はそれを YAML として拒否します。
  `A@{`、行 `%%`、行 `shape: circle`、行 `}` は、 mermaid.js では拒否され、
  ここでは受理されます。
  `%%` の行がなければ、どちらも受理します。
  [fixture: flowchart/div-data-invalid-yaml] [fixture:
  flowchart/div-data-unknown-shape] [fixture:
  flowchart/div-data-block-bare-marker-line] [fixture:
  flowchart/gram-data-block-shape-on-own-line]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
  mermaid.js では、フロントマターの中で始まる HTML タグが、
  図の `"` の読み方を変えることがあります。
  ここではそうなりません。 [fixture: flowchart/html-tag-starts-in-frontmatter]
- **[`click-reserved-word`](../known-divergences/click-reserved-word.ja.md)。**
  クリックの文を始めない `click` の単位は、
  ここでは入力を拒否させます（[クリックとコールバック](#クリックとコールバック)
  を参照）。
  mermaid.js は、たとえば次のものを受理します。
  クリックの文脈が文字列を読む、
  文の中の `click` （`click A href "u" click "tip"`）、空の文字列だけを読む、
  文の中の `click`（`click A click "" href "u"`）。
  文の前の `click`（`click "" click A href "x"`、`click "" A-->B`）と、
  文の後の `click`（`A-->B click ""`）。
  id の中の `click`（`A:click "" b-->C`）と、
  スタイルの中の `click` （`style A fill:red click "" x`）。
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
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)。**
  空の文字列、空の呼び出し、文の始まりでも、文やヘッダーの区切りの前でもない、
  文の中の空の説明ブロックは、それがある位置には木にそれを置く場所がないので、
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
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)。**
  ヘッダーの後のどこかにある `C4Container`、`C4Component`、`C4Dynamic`、
  `C4Deployment`（頂点の id、ラベル、辺のテキストなど）は、
  mermaid.js ではテキストを C4 のパーサーに渡させ、拒否されます。
  ここではテキストは flowchart です。
  [fixture: flowchart/div-c4-keyword-in-label]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.ja.md)。**
  ヘッダーの前の `%%` だけの行や `%%{ }%%` の行は、ここではコメントです。
  mermaid.js は入力を拒否します。
  flowchart の字句解析器が `%%` をヘッダーの前の id として読むからです。
  [fixture: flowchart/header-after-bare-percent-line]
  [fixture: flowchart/header-after-empty-braces-line]
  [検出](#検出) を参照してください。
