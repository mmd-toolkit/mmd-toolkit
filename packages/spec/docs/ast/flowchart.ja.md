# Flowchart のノード

英語版: [flowchart.md](./flowchart.md)

この文書は、図種 `flowchart-v2`、`flowchart-elk`、
`swimlane` の木のノードを定めます。
木の共通の部分は [ast.ja.md](../ast.ja.md) で定めます。
ソースをどう読むか、
どの文法規則がどのノードを作るかは
[diagrams/flowchart.ja.md](../diagrams/flowchart.ja.md) で定めます。

これらの図種の本文は [FlowchartDiagram](#flowchartdiagram) です。
欄の値は、[ast.ja.md](../ast.ja.md#ノード) が定める値の書かれたテキストとして、
書き手が書いたものを保ちます。
[common.ja.md](../common.ja.md#ソースの読み方) の変換した形ではありません。
値が空白で始まるか終わるのは、
値の単位がそれを自身の文字として持つところだけです。
[ノード](../ast.ja.md#ノード) を参照してください。
この図種では、`,` の後のスタイルの始まり、タイトルのない subgraph の名前の後、
`call` の後のコールバックの名前の終わりと、
その引数の両端です（[FlowchartStyleStatement](#flowchartstylestatement)、
[FlowchartSubgraphStatement](#flowchartsubgraphstatement)、
[FlowchartClickCallbackStatement](#flowchartclickcallbackstatement) を参照）。
ほかのところでは、値の両端の空白は値の外です。
mermaid.js は、
subgraph の名前のすぐ後の空の説明ブロックの間か後の空白も名前に読みますが、
どのノードもそれを持ちません。
[FlowchartSubgraphStatement](#flowchartsubgraphstatement) を参照してください。
書き手が書いた名前と値は、
書く形で決まる [ast.ja.md](../ast.ja.md#共通の葉のノード) の葉のノードで、
引用符のないテキストは [FlowchartLiteral](#flowchartliteral) です。
どの文法の規則がどのノードを作るかは
[diagrams/flowchart.ja.md](../diagrams/flowchart.ja.md#文法) の表にあります。

flowchart のノード、つまり図の箱の 1 つ 1 つは、木のノードと紛れないように、
mermaid.js の Db と同じくここでは**頂点**（vertex）と呼びます。
**リンク**（link）は、 1 本の矢印とそれに属するものです。

下のどのノードの子の欄もソースの順です。
2 つの矢印の間にテキストを持つ [FlowchartLink](#flowchartlink) だけが、
例外です（[ノード](../ast.ja.md#ノード) を参照）。

この図種の StringLiteral（click の文の URL と tooltip）は、
常に閉じていて空ではありません。
空の文字列 `""` は `empty-string` の単位で、文法のどの規則も取りません。
[fixture: flowchart/lex-empty-string-line]
[fixture: flowchart/gram-click-href-empty-string]
[fixture: flowchart/gram-click-href-tooltip-empty-string]
[fixture: flowchart/gram-click-call-tooltip-empty-string]
[fixture: flowchart/gram-click-callback-tooltip-empty-string]
[文字列](../diagrams/flowchart.ja.md#文字列) を参照してください。

## ノード

### FlowchartDiagram

| 欄          | 型                      | 意味                                                                                      |
| ----------- | ----------------------- | ----------------------------------------------------------------------------------------- |
| `direction` | 文字列または null       | ヘッダーの方向。`LR`、`TD`、`<` のように書かれたとおりで、空白を含まない。なければ null。 |
| `body`      | FlowchartStatement の列 | 文。ソースの順。                                                                          |

子の欄: `body`。
ヘッダーのキーワードは欄にしません。
`flowchart-elk` と `swimlane-beta` は図種で区別でき、
`graph` と `flowchart` は同じ Db を作るからです。

**FlowchartStatement** は、FlowchartEmptyStatement、FlowchartVertexStatement、
FlowchartSubgraphStatement、FlowchartStyleStatement、
FlowchartClassDefStatement、FlowchartClassStatement、
FlowchartClickCallbackStatement、FlowchartClickUrlStatement、
FlowchartLinkStyleStatement、FlowchartDefaultLinkStyleStatement、
FlowchartDirectionStatement、FlowchartAccTitleStatement、
FlowchartAccDescrStatement、FlowchartAccDescrBlockStatement のどれかです。

### FlowchartEmptyStatement

前の文の区切りとしてではなく、
それ自体を文として文法が読む `;`
です（[diagrams/flowchart.ja.md](../diagrams/flowchart.ja.md#図と文) を参照）。
子の欄はありません。
欄もありません。

### FlowchartVertexStatement

`A`、`A & B --> C`、`A --> B --> C` のような、
リンクでつないだ頂点のグループの連鎖です。

| 欄      | 型                   | 意味                                             |
| ------- | -------------------- | ------------------------------------------------ |
| `first` | FlowchartVertexGroup | 最初の頂点のグループ。                           |
| `links` | FlowchartLink の列   | リンク。ソースの順。それぞれ `target` へ向かう。 |

子の欄: `first`、`links`。
各リンクの始点は、その前のリンクの `target` で、最初のリンクでは `first` です。

### FlowchartVertexGroup

`&` でつないだ頂点です。
頂点 1 つだけでも、1 つからなるグループです。

| 欄         | 型                   | 意味                   |
| ---------- | -------------------- | ---------------------- |
| `vertices` | FlowchartVertex の列 | 1 個以上。ソースの順。 |

子の欄: `vertices`。

### FlowchartVertex

頂点の 1 回の出現です。

| 欄         | 型                         | 意味                                                             |
| ---------- | -------------------------- | ---------------------------------------------------------------- |
| `id`       | Identifier                 | id。カンマを含む。                                               |
| `shape`    | FlowchartShape または null | ラベルを伴う形。形なしで書かれた頂点では null。                  |
| `cssClass` | Identifier または null     | `:::` の後の CSS クラス。カンマを含む。なければ null。           |
| `data`     | FlowchartDataBlock の列    | 頂点の直後に続けて書いたデータブロック。ソースの順。なければ空。 |

子の欄: `id`、`shape`、`cssClass`、 `data`。
[fixture: flowchart/gram-vertex-id-comma] [fixture:
flowchart/gram-vertex-class-comma]

### FlowchartShape

| 欄         | 型                                 | 意味                                                                                      |
| ---------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `name`     | 文字列                             | [形](../diagrams/flowchart.ja.md#形) の表の名前のどれか。`rectangle` や `cylinder` など。 |
| `property` | FlowchartShapeProperty または null | `[\|` で書いた長方形のプロパティ。他のどの形でも null。                                   |
| `label`    | FlowchartLabel                     | 形の中のラベル。                                                                          |

子の欄: `property`、`label`。
ソースの順で、プロパティはラベルより前に来ます。
`property` が null でないのは、形が `[|名前:値|…]` と書かれたときちょうどです。
その名前は、
`[…]` と同じく `rectangle` です（[形](../diagrams/flowchart.ja.md#形) を参照）。

### FlowchartShapeProperty

| 欄      | 型         | 意味                                 |
| ------- | ---------- | ------------------------------------ |
| `name`  | Identifier | `borders` のような、`:` の前の名前。 |
| `value` | Identifier | `lt` のような、`:` の後の値。        |

子の欄: `name`、`value`。

### FlowchartLink

| 欄        | 型                                | 意味                                                                  |
| --------- | --------------------------------- | --------------------------------------------------------------------- |
| `id`      | Identifier または null            | 矢印の前に書いた辺の id。`@` を除く。なければ null。                  |
| `opening` | FlowchartOpeningArrow または null | 2 つの矢印の間にテキストを持つリンクの、開く矢印。それ以外では null。 |
| `arrow`   | FlowchartArrow                    | 矢印、または 2 つの矢印の間にテキストを持つリンクの閉じる矢印。       |
| `label`   | FlowchartLabel または null        | 矢印の間か `\|` の間のテキスト。なければ null。                       |
| `target`  | FlowchartVertexGroup              | リンクが向かう頂点のグループ。                                        |

子の欄: `id`、`opening`、`arrow`、`label`、`target`。
`label` は、`|` の間に書かれたときは `arrow` の後に、
開く矢印と閉じる矢印の間に書かれたときは `arrow` の前にあります。
後者では、子の欄の順はソースの順ではなく、ソースの順は `opening`、`label`、
`arrow` です（[ノード](../ast.ja.md#ノード) を参照）。
ラベルは 1 つの欄のままです。
道具が、書き方によらず、
リンクのラベルを 1 か所で見つけられるようにするためです。
[fixture: flowchart/gram-pipe-label-space-after] [fixture:
flowchart/gram-link-text-string-then-text]

### FlowchartArrow

閉じた矢印です（[矢印](../diagrams/flowchart.ja.md#矢印) を参照）。
リンクの矢印か、2 つの矢印の間にテキストを持つリンクの閉じる矢印です。

| 欄            | 型     | 意味                                                                             |
| ------------- | ------ | -------------------------------------------------------------------------------- |
| `value`       | 文字列 | その書かれたテキスト。                                                           |
| `startMarker` | 文字列 | 線の前の記号。`<` は `arrow`、`x` は `cross`、`o` は `circle`。なければ `none`。 |
| `line`        | 文字列 | `-` は `solid`、`=` は `thick`、`.` は `dotted`、`~` は `invisible`。            |
| `length`      | 整数   | 線の文字の数。`-`、`=`、`~` の数か、点線なら `.` の数。                          |
| `endMarker`   | 文字列 | 線の後の記号。`>` は `arrow`、`x` は `cross`、`o` は `circle`。なければ `none`。 |

子の欄はありません。
`-->` は線 `solid`、長さ 2、終わりの記号 `arrow` を持ちます。
`<-->` は始まりの記号 `arrow` も持ちます。
`---` は長さ 3 で、記号を持ちません。
`A x==>B` の矢印 `x==>` は、始まりの記号 `cross` と線 `thick` を持ちます。
`-..->` は線 `dotted` と長さ 2 を持ちます。
点線の `.` の前後の `-` は数えず、
その最初のものは省略できます（`.->` と `-.->` はどちらも長さ 1
の点線の矢印です）。
どちらが書かれたかは、`value` にあり、欄にはありません。
[fixture: flowchart/db-arrow-single-forms] [fixture:
flowchart/lex-arrow-head-x-before-id]

### FlowchartOpeningArrow

2 つの矢印の間にテキストを持つリンクの、
開く矢印です（[矢印](../diagrams/flowchart.ja.md#矢印) を参照）。

| 欄            | 型     | 意味                                                                             |
| ------------- | ------ | -------------------------------------------------------------------------------- |
| `value`       | 文字列 | その書かれたテキスト。                                                           |
| `startMarker` | 文字列 | 線の前の記号。`<` は `arrow`、`x` は `cross`、`o` は `circle`。なければ `none`。 |
| `line`        | 文字列 | `--` は `solid`、`==` は `thick`、`-.` は `dotted`。                             |

子の欄はありません。
開く矢印は、省略できる記号の後の `--`、`==`、`-.` のどれかなので、
終わりの記号も、それ自身の長さも持ちません。
その `line` は、いつもリンクの閉じる矢印の `line` と同じです。
同じ種類の閉じた矢印だけが、リンクテキストの文脈を出るからです。
[リンクテキストの文脈](../diagrams/flowchart.ja.md#リンクテキストの文脈)
を参照してください。
`A<-- t -->B` では、開く矢印は始まりの記号 `arrow` を持ちます。
`A== t x==>B` では、どちらの矢印も線 `thick` を持ち、
閉じる矢印は始まりの記号 `cross` を持ちます。
[fixture: flowchart/db-arrow-double] [fixture:
flowchart/db-arrow-thick-head-invalid] [fixture:
flowchart/db-arrow-dash-head-length]

### FlowchartLabel

| 欄      | 型     | 意味                                                                                                                                                                                                         |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kind`  | 文字列 | `text`、`string`、`markdown` のどれか（[flowchart.ja.md](../diagrams/flowchart.ja.md#ラベル) を参照）。                                                                                                      |
| `value` | 文字列 | 先頭の文字列か markdown 文字列の中身に、ラベルの残りの書かれたテキストを続けたもの。テキストの並びで始まるラベルでは、その書かれたテキスト（[flowchart.ja.md](../diagrams/flowchart.ja.md#ラベル) を参照）。 |

子の欄はありません。
すべて空白のラベルの値は、その空白です。
[fixture: flowchart/tokens-label-all-whitespace] [fixture:
flowchart/tokens-edge-label-all-whitespace] [fixture:
flowchart/tokens-subgraph-title-all-whitespace]

### FlowchartLiteral

文法が空白を含むことを許し、その終わりを決める位置に、
書き手が引用符なしで書くテキストの値です。
スタイル、`call` の後のコールバックの名前とその引数、
アクセシビリティの文のテキストがそうです。
決めるのは書かれたものではなく位置です。
`accTitle: x` とスタイル `fill:red` はどちらも 1 語ですが、
その位置は空白を含むテキストを許すのでリテラルです。
一方、`[|` で書いた長方形のプロパティの値は、その位置が 1 語しか許さないので、
[Identifier](../ast.ja.md#identifier)
です（[共通の葉のノード](../ast.ja.md#共通の葉のノード) を参照）。

| 欄      | 型     | 意味                                                              |
| ------- | ------ | ----------------------------------------------------------------- |
| `value` | 文字列 | その書かれたテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
値は、改行を含めて内側の空白を保ちます。
両端に空白を持つのは、mermaid.js がそれを読むところ、
つまり `,` の後のスタイルの始まり、 `call` の後のコールバックの名前の終わり、
その引数の両端だけで、ほかのところでリテラルの周りに書かれた空白は、
どのノードにも属しません。
スタイルのようにテキストがすべて空白になるところでは、
欄はリテラルに代えて null
を持ちます（[FlowchartStyleStatement](#flowchartstylestatement) を参照）。

### FlowchartDataBlock

`@{` から、それを閉じる `}` までの 1 つのデータブロックです。
`A@{ shape: rect }@{ label: x }` のように続けて書いたブロックは、
それぞれが 1 つのノードです。

| 欄      | 型     | 意味                                                 |
| ------- | ------ | ---------------------------------------------------- |
| `value` | 文字列 | `@{` と、それを閉じる `}` の間の、書かれたテキスト。 |

子の欄はありません。
木は値を読みません。 [fixture: flowchart/gram-data-consecutive-blocks]
[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)
を参照してください。

### FlowchartIgnoredText

書き手が書いたが、mermaid.js が読まず、図に何の効果も持たないテキストです。
道具がソースのテキストを探さずにそのようなテキストを見つけられるように、
それ自体の型のノードにします。
flowchart では、方向の行の、`direction` の前と値の後のテキストです。
[FlowchartDirectionStatement](#flowchartdirectionstatement) を参照してください。

| 欄      | 型     | 意味                                                              |
| ------- | ------ | ----------------------------------------------------------------- |
| `value` | 文字列 | その書かれたテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
値は両端に空白を持ちません。
[fixture: flowchart/lex-direction-line-text-before-directive-inside] [fixture:
flowchart/lex-direction-line-text-after-directive-inside]

### FlowchartSubgraphStatement

| 欄      | 型                         | 意味                                       |
| ------- | -------------------------- | ------------------------------------------ |
| `name`  | FlowchartLabel             | `subgraph` の後に書いた名前。              |
| `title` | FlowchartLabel または null | `[` と `]` の間のタイトル。なければ null。 |
| `body`  | FlowchartStatement の列    | `end` までの文。ソースの順。               |

子の欄: `name`、`title`、`body`。
名前は Identifier ではなくラベルです。
文法は、名前を空白を含むテキスト、文字列、markdown 文字列、
それらの文字列の後にテキストが続くもののどれで書くことも許し、どれで書いたかを、
ラベルの `kind` が記録します。
空白を含む名前は id になりません。
subgraph の Db の id とタイトルは、`name`、`title`、そしてどのノードも持たない、
名前とそのタイトルか区切りとの間のソースのテキストから求めます。
[flowchart.ja.md](../diagrams/flowchart.ja.md#文法の外での拒否)
を参照してください。
タイトルがなければ、mermaid.js は名前を、その後の空白を含めて区切りまで読み、
名前が空白を持つタイトルのない subgraph は、作った id を持ちます。
そのため、タイトルがなければ、名前の書かれたテキストは、その後の空白を、
区切りか、その後の最初の空の説明ブロックまで含み、その値はその空白を持ちます。
空白 1 つが続く `subgraph S` の名前は `S` と空白 1 つで、
`subgraph S accDescr {}` も同じです。
文字列の後でも、その空白は名前に入ります。
空白 1 つが続く `subgraph "S"` がそうです。
[fixture: flowchart/db-subgraph-name-trailing-space] [fixture:
flowchart/db-subgraph-name-space-before-empty-description-block] [fixture:
flowchart/db-subgraph-string-name-trailing-space]
タイトルがあれば、mermaid.js は `[` の前の空白を読まず、
名前は空白でない最後の文字で終わります。
`subgraph a  [T]` の id は `a` です。
[fixture: flowchart/db-subgraph-title-spaces-before-bracket]
空の説明ブロックが名前のすぐ後に続くときだけ、その間の空白と、
最後のブロックと `;` の間の空白は、どのノードにも属しません。
ブロックは `body` の文だからですが、mermaid.js はそれを名前に読みます。
`subgraph "S"accDescr {} accDescr {}` と `subgraph "S"accDescr {} ;` は、
作った id を持ちます。
この形でだけ、 Db はその空白をソースから読みます。
[fixture: flowchart/db-subgraph-name-space-between-empty-description-blocks]
[fixture:
flowchart/db-subgraph-name-space-after-empty-description-block-before-semicolon]
名前かタイトルの後、区切りの前の空の説明ブロックは、`body` の最初の文です。
子のノードをソースの順に保つためです。
`subgraph S accDescr {}`、行 `A`、`end` の本体は、
FlowchartAccDescrBlockStatement と FlowchartVertexStatement です。
[fixture: flowchart/gram-empty-description-block-after-subgraph-name]

### FlowchartStyleStatement

| 欄       | 型                                  | 意味                                                                      |
| -------- | ----------------------------------- | ------------------------------------------------------------------------- |
| `id`     | Identifier                          | id。カンマを含む。                                                        |
| `styles` | (FlowchartLiteral または null) の列 | スタイル。ソースの順。それぞれリテラルか、すべて空白のスタイルなら null。 |

子の欄: `id`、`styles`。
スタイルは、`fill:#f00` のような、2 つの `,` の間、
またはリストの両端のテキストです。
mermaid.js は `,` の後のその始まりの空白をタブも含めて読み、それは、
たとえばリンクのスタイルが `fill` で始まるかを決めます。
そのため、スタイルのリテラルは、その前の `,` のすぐ後から、
最初のスタイルは文がその前に読む空白の後から始まり、
空白でない最後の文字で終わります。
`style A fill:#f00 ,  stroke:#333 ` のスタイルは、 `fill:#f00` と、
空白 2 つの後の `stroke:#333` です。
[fixture: flowchart/db-style-tabs-after-comma] [fixture:
flowchart/db-linkstyle-leading-space-fill]
すべて空白のスタイルは、空白の量によらず null で、
mermaid.js はそれを空のテキストとして読みます。
`style A fill:#f00, ` のスタイルは、リテラルと null です。
行単位の規則が `;` を無視するので、
空白 2 つが続く `style A fill:#f00;` はスタイル `fill:#f00` を持ち、
`style A fill:#f00;stroke:#0f0` は 1 つのスタイル `fill:#f00stroke:#0f0`
を持ちます。
`style A fill:#f00, %%{init: {}}%%` に空白 2 つと `stroke:#333` が続くと、
2 つ目のスタイルは空白 3 つと `stroke:#333` です。
[fixture: flowchart/tokens-style-ignored-semicolon-then-spaces] [fixture:
common/entity-style-semicolon-between-styles] [fixture:
flowchart/tokens-style-directive-after-comma]
[fixture: flowchart/gram-style-id-comma] [fixture:
flowchart/gram-style-whitespace] [fixture:
flowchart/db-style-whitespace-only-value]

### FlowchartClassDefStatement

| 欄           | 型                                  | 意味                                                                                                                                                                                                   |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cssClasses` | (Identifier または null) の列       | CSS クラス。`classDef` の後の `id-list` の、`,` の単位の間の部分。ソースの順。空の部分は null（[flowchart.ja.md](../diagrams/flowchart.ja.md#styleclasslinkstyle-の文) を参照）。                      |
| `styles`     | (FlowchartLiteral または null) の列 | スタイル。FlowchartStyleStatement と同じ。ただし、`\` の直後の `,` は 2 つのスタイルを分けず、スタイルの一部になる（[flowchart.ja.md](../diagrams/flowchart.ja.md#styleclasslinkstyle-の文) を参照）。 |

子の欄: `cssClasses`、 `styles`。 [fixture: flowchart/db-classdef-names-empty]
[fixture:
flowchart/db-classdef-names-trailing-comma]

### FlowchartClassStatement

| 欄         | 型                            | 意味                                                                                                         |
| ---------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ids`      | (Identifier または null) の列 | `class` の後の最初の id をリストとして読んだもの。その `id-list` の、`,` の単位の間の部分。空の部分は null。 |
| `cssClass` | Identifier                    | 2 つ目の id、つまり CSS クラス。カンマを含む。                                                               |

子の欄: `ids`、 `cssClass`。 [fixture: flowchart/db-class-ids-empty-first]
[fixture:
flowchart/db-class-ids-only-comma] [fixture: flowchart/gram-class-name-comma]

### FlowchartClickCallbackStatement

関数を呼ぶクリックの文です。
`click A callback`、`click A call callback(arguments)`。

| 欄          | 型                                 | 意味                                                                                                                                                                                                                                                                              |
| ----------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ids`       | (Identifier または null) の列      | クリックの id。`click-comma` の単位の間の部分。ソースの順。空の部分は null。                                                                                                                                                                                                      |
| `callback`  | Identifier または FlowchartLiteral | 関数の名前。`call` の後では FlowchartLiteral で、`callback-name` の単位、つまり空白と改行を含む `(` までの文字（[クリックとコールバック](../diagrams/flowchart.ja.md#クリックとコールバック) を参照）。`click A callback` のように `call` がなければ、Identifier（click の id）。 |
| `arguments` | FlowchartLiteral または null       | `call` の後の括弧の間の引数。1 つのテキストで、その値は両端のものも含めて空白と改行を保つ。括弧がないか、括弧の間が空白だけなら null。木はその中を読まない。                                                                                                                      |
| `tooltip`   | StringLiteral または null          | ツールチップの文字列。なければ null。                                                                                                                                                                                                                                             |

子の欄: `ids`、`callback`、`arguments`、`tooltip`。
`call` の後の名前は `(` の前の空白を保ちます。
mermaid.js はそれを関数の名前の一部として渡し、 `click A call f (x)` は、
`f` と空白という名前の関数を呼びます。
mermaid.js は引数を書かれたとおりに渡し、その後、引用符の外の `,` ごとに分けて、
それぞれの両端を削ります。
`click A call f( x, y )` の引数は、空白、`x, y`、空白で、
`f` を `x` と `y` で呼びます。
[fixture: flowchart/tokens-callback-name-trailing-space]
[fixture: flowchart/tokens-callback-arguments-spaces-at-ends]

### FlowchartClickUrlStatement

URL にリンクするクリックの文です。
`click A href "url"`、`click A "url" "tooltip" _blank`。

| 欄        | 型                            | 意味                                                                                                                                |
| --------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `ids`     | (Identifier または null) の列 | FlowchartClickCallbackStatement と同じ。                                                                                            |
| `url`     | StringLiteral                 | URL の文字列。                                                                                                                      |
| `tooltip` | StringLiteral または null     | FlowchartClickCallbackStatement と同じ。                                                                                            |
| `target`  | 文字列または null             | リンク先。`_self`、`_blank`、`_parent`、`_top` のどれか（[文の文脈](../diagrams/flowchart.ja.md#文の文脈) を参照）。なければ null。 |

子の欄: `ids`、`url`、 `tooltip`。
[fixture: flowchart/db-click-ids-empty-tooltip] [fixture:
flowchart/lex-click-id-comma]

文はほかに `click` の単位を持ちません。 [fixture: flowchart/gram-click-href]
[クリックとコールバック](../diagrams/flowchart.ja.md#クリックとコールバック)
を参照してください。

### FlowchartLinkStyleStatement

番号で指したリンクへの `linkStyle` の文です。

| 欄            | 型                                  | 意味                                                   |
| ------------- | ----------------------------------- | ------------------------------------------------------ |
| `indices`     | NumericLiteral の列                 | 番号。ソースの順。どれも整数。                         |
| `interpolate` | Identifier または null              | `interpolate` の後の名前。なければ null。              |
| `styles`      | (FlowchartLiteral または null) の列 | スタイル。FlowchartStyleStatement と同じ。なければ空。 |

子の欄: `indices`、`interpolate`、`styles`。
`interpolate` が null でないか、`styles` が空でないか、その両方です。

### FlowchartDefaultLinkStyleStatement

`linkStyle default` の文です。
番号で指したリンクではなく、すべてのリンクのスタイルを設定します。

| 欄            | 型                                  | 意味                                 |
| ------------- | ----------------------------------- | ------------------------------------ |
| `interpolate` | Identifier または null              | FlowchartLinkStyleStatement と同じ。 |
| `styles`      | (FlowchartLiteral または null) の列 | FlowchartLinkStyleStatement と同じ。 |

子の欄: `interpolate`、`styles`。
`interpolate` が null でないか、`styles` が空でないか、その両方です。

### FlowchartDirectionStatement

| 欄           | 型                                                        | 意味                                                                            |
| ------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `textBefore` | [FlowchartIgnoredText](#flowchartignoredtext) または null | 方向の行の、`direction` の前のテキスト。ない（空か、すべて空白の）ときは null。 |
| `direction`  | 文字列                                                    | `TB`、`BT`、`RL`、`LR`、`TD` のどれか。                                         |
| `textAfter`  | [FlowchartIgnoredText](#flowchartignoredtext) または null | 方向の行の、値の後のテキスト。ないときは null。                                 |

子の欄: `textBefore`、`textAfter`。
`A-->B direction TB` は `direction` の前のテキスト `A-->B` を、
`  accDescr: d ; direction LR` はテキスト `accDescr: d ;` を持ちます。
`A[direction TB]` は、その前のテキスト `A[` と値の後のテキスト `]` を持ち、
`direction LR trailing` は値の後のテキスト `trailing` を持ちます。
[fixture: flowchart/lex-direction-line-swallows-edge] [fixture:
flowchart/lex-direction-line-acc-descr-subgraph-indented] [fixture:
flowchart/lex-direction-line-text-before-directive-inside] [fixture:
flowchart/lex-direction-line-in-label] [fixture:
flowchart/lex-direction-line-text-after-value] [fixture:
flowchart/lex-direction-line-text-after-directive-inside]
`direction`、改行、 `TB` はどちらも持ちません。
[fixture: flowchart/lex-direction-line-top-level-next-line]

### FlowchartAccTitleStatement

| 欄      | 型                           | 意味                                                          |
| ------- | ---------------------------- | ------------------------------------------------------------- |
| `value` | FlowchartLiteral または null | `accTitle:` の後の、行の終わりまでのテキスト。なければ null。 |

子の欄: `value`。
`:` の後の空白は改行も含めて一緒に読まれるので、
値が null になるのはテキストの終わりだけです。
[fixture: flowchart/lex-acc-title-next-line] [fixture:
flowchart/gram-acc-title-empty-at-end]

### FlowchartAccDescrStatement

テキストを伴う `accDescr:` の文です。

| 欄      | 型                           | 意味                                                          |
| ------- | ---------------------------- | ------------------------------------------------------------- |
| `value` | FlowchartLiteral または null | `accDescr:` の後の、行の終わりまでのテキスト。なければ null。 |

子の欄: `value`。
`:` の後の空白は改行も含めて一緒に読まれるので、
値が null になるのはテキストの終わりだけです。
[fixture: flowchart/db-acc-descr-empty-replaces]

### FlowchartAccDescrBlockStatement

テキストと `}` を伴う `accDescr {` の文です。
テキストがブロックの中で終わるときは `}` を持ちません。
Db への効果が `accDescr:` の文と違うので、別のノードの型にしています。
閉じていないブロックは、テキストにかかわらず説明を空にし、
テキストのない閉じたブロックは何も変えません。

| 欄       | 型                           | 意味                                                                                                |
| -------- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `value`  | FlowchartLiteral または null | `accDescr {` と `}` の間のテキスト。ブロックが閉じていなければテキストの終わりまで。なければ null。 |
| `closed` | 真偽値                       | ブロックが `}` で終わるかどうか。テキストがブロックの中で終わるときは偽。                           |

子の欄: `value`。
テキストの終わりの `accDescr { x` の値は `x` です。
[fixture: flowchart/lex-acc-descr-block-unclosed]
`accDescr {  }` はテキストのない閉じたブロックで、値は null です。
`{` の後の空白は `{` と一緒に読まれます。
そのようなブロックは、文が始まるところと、文の最後の単位の後、
区切りの前で文です。
`A accDescr {}` は頂点の文と FlowchartAccDescrBlockStatement で、
subgraph の名前の後では、その subgraph の本体の最初の文で、ヘッダーの方向の後、
その区切りの前では、図の `body` の最初の文です。
[flowchart.ja.md](../diagrams/flowchart.ja.md#区切りの前の空の説明ブロック)
を参照してください。
ほかの場所では文の中にあり、入力は拒否されます。
[fixture: flowchart/gram-acc-descr-block-empty]
[fixture: flowchart/db-acc-descr-empty-block-keeps]
[fixture: flowchart/gram-empty-description-block-after-vertex]
[fixture: flowchart/header-empty-description-block-after-direction]
[flowchart.ja.md](../diagrams/flowchart.ja.md#アクセシビリティの値)
を参照してください。
