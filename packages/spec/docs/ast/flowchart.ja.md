# Flowchart のノード

英語版: [flowchart.md](./flowchart.md)

この文書は、図種 `flowchart-v2`、`flowchart-elk`、
`swimlane` の木のノードとトークンを定めます。
木の共通の部分は [ast.ja.md](../ast.ja.md) で定めます。
ソースをどう読むか、
どの文法規則がどのノードを作るかは
[diagrams/flowchart.ja.md](../diagrams/flowchart.ja.md) で定めます。

これらの図種の本文は [FlowchartDiagram](#flowchartdiagram) です。
欄の値は、[ast.ja.md](../ast.ja.md#ノード) が定める範囲のテキストとして、
書き手が書いたものを保ちます。
[common.ja.md](../common.ja.md#ソースの読み方) の変換した形ではなく、
変換は [diagrams/flowchart.ja.md](../diagrams/flowchart.ja.md#木から要約を作る)
の Db の正規化が、値を使うところで行います。
ノードの範囲の外の空白は、その値に入りません。
それが Db に効くのは、
スタイルの Db のテキストと subgraph の名前のテキストの 2 か所で、
そこでは Db の正規化がそれをソースから読みます。
書き手が書いた名前と値は、
書く形で決まる [ast.ja.md](../ast.ja.md#共通の葉のノード) の葉のノードで、
引用符のないテキストは [FlowchartLiteral](#flowchartliteral) です。
どの文法の規則がどのノードを作るかは
[diagrams/flowchart.ja.md](../diagrams/flowchart.ja.md#文法) の表にあります。

flowchart のノード、つまり図の箱の 1 つ 1 つは、木のノードと紛れないように、
mermaid.js の Db
と同じくここでは**頂点**（vertex）と呼びます。**リンク**（link）は、
1 本の矢印とそれに属するものです。
2 つの頂点のグループの間のリンクは、それぞれの頂点の組ごとに Db の辺を作ります。

下のどのノードの子の欄もソースの順です。
2 つの矢印の間にテキストを持つ [FlowchartLink](#flowchartlink) だけが例外です
（[ノード](../ast.ja.md#ノード) を参照）。

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
そのトークンは `Root.tokens` にあります。

FlowchartDiagram のトークンは、
`Directive` のトークンを除く図のテキストのすべてのトークンで、
ヘッダーのキーワードからその最後のものまでです。
そのため、その範囲は、どの文にも属さないトークンも覆います。
最後の文の後の区切りと、
それ自体が 1 つのトークンである無視する `;` がそうです。
`A;` の図の範囲は `;` の後で終わります。
[fixture: flowchart/tokens-diagram-trailing-separator]

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
欄も子の欄もありません。
範囲は、その `;` の範囲です。

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

子の欄: `id`、`shape`、`cssClass`、`data`。
頂点の範囲はそのデータブロックを覆います。
範囲は id から、データブロックがあれば最後のデータブロックまでで、
その頂点を含む頂点のグループと頂点の文の範囲も同じです。
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
その名前は、`[…]` と同じく `rectangle` です
（[形](../diagrams/flowchart.ja.md#形) を参照）。

### FlowchartShapeProperty

| 欄      | 型         | 意味                                 |
| ------- | ---------- | ------------------------------------ |
| `name`  | Identifier | `borders` のような、`:` の前の名前。 |
| `value` | Identifier | `lt` のような、`:` の後の値。        |

子の欄: `name`、`value`。
範囲は、名前から値までです。
その前後の `|` は含みません。

### FlowchartLink

| 欄        | 型                                | 意味                                                                  |
| --------- | --------------------------------- | --------------------------------------------------------------------- |
| `id`      | Identifier または null            | 矢印の前に書いた辺の id。`@` を除く。なければ null。                  |
| `opening` | FlowchartOpeningArrow または null | 2 つの矢印の間にテキストを持つリンクの、開く矢印。それ以外では null。 |
| `arrow`   | FlowchartArrow                    | 矢印、または 2 つの矢印の間にテキストを持つリンクの閉じる矢印。       |
| `label`   | FlowchartLabel または null        | 矢印の間か `\|` の間のテキスト。なければ null。                       |
| `target`  | FlowchartVertexGroup              | リンクが向かう頂点のグループ。                                        |

子の欄: `id`、`opening`、`arrow`、`label`、`target`。
範囲は、リンクの最初のトークンから、その行き先の最後のトークンまでです。
`label` は、`|` の間に書かれたときは `arrow` の後に、
開く矢印と閉じる矢印の間に書かれたときは `arrow` の前にあります。
後者では、子の欄の順はソースの順ではなく、
ソースの順は `opening`、`label`、`arrow` です
（[ノード](../ast.ja.md#ノード) を参照）。
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
| `value`       | 文字列 | その範囲のテキスト。                                                             |
| `startMarker` | 文字列 | 線の前の記号。`<` は `arrow`、`x` は `cross`、`o` は `circle`。なければ `none`。 |
| `line`        | 文字列 | `-` は `solid`、`=` は `thick`、`.` は `dotted`、`~` は `invisible`。            |
| `length`      | 整数   | 線の文字の数。`-`、`=`、`~` の数か、点線なら `.` の数。                          |
| `endMarker`   | 文字列 | 線の後の記号。`>` は `arrow`、`x` は `cross`、`o` は `circle`。なければ `none`。 |

子の欄はありません。
範囲はそのトークンで、単位が前後に持つ空白を除いた矢印です。
`-->` は線 `solid`、長さ 2、終わりの記号 `arrow` を持ちます。
`<-->` は始まりの記号 `arrow` も持ちます。
`---` は長さ 3 で、記号を持ちません。
`A x==>B` の矢印 `x==>` は、始まりの記号 `cross` と線 `thick` を持ちます。
`-..->` は線 `dotted` と長さ 2 を持ちます。
点線の `.` の前後の `-` は数えず、その最初のものは省略できます
（`.->` と `-.->` はどちらも長さ 1 の点線の矢印です）。
どちらが書かれたかは、`value` とトークンにあり、欄にはありません。
[fixture: flowchart/db-arrow-single-forms] [fixture:
flowchart/lex-arrow-head-x-before-id]
どの値とも同じく、`value` はその範囲のテキストです。
`A[style:#x] -;-> B` では行単位の規則が `;` を無視するので、
`value` は `-->` で欄も同じですが、トークンは `-;->` です。
[fixture: flowchart/tokens-arrow-ignored-semicolon]

### FlowchartOpeningArrow

2 つの矢印の間にテキストを持つリンクの、開く矢印です
（[矢印](../diagrams/flowchart.ja.md#矢印) を参照）。

| 欄            | 型     | 意味                                                                             |
| ------------- | ------ | -------------------------------------------------------------------------------- |
| `value`       | 文字列 | その範囲のテキスト。                                                             |
| `startMarker` | 文字列 | 線の前の記号。`<` は `arrow`、`x` は `cross`、`o` は `circle`。なければ `none`。 |
| `line`        | 文字列 | `--` は `solid`、`==` は `thick`、`-.` は `dotted`。                             |

子の欄はありません。
範囲はそのトークンです。
開く矢印は、省略できる記号の後の `--`、`==`、`-.` のどれかなので、
終わりの記号も、それ自身の長さも持ちません。
その `line` は、いつもリンクの閉じる矢印の `line` と同じです。
同じ種類の閉じた矢印だけが、リンクテキストの文脈を出るからです
（[リンクテキストの文脈](../diagrams/flowchart.ja.md#リンクテキストの文脈) を参照）。
`A<-- t -->B` では、開く矢印は始まりの記号 `arrow` を持ちます。
`A== t x==>B` では、どちらの矢印も線 `thick` を持ち、
閉じる矢印は始まりの記号 `cross` を持ちます。
[fixture: flowchart/db-arrow-double] [fixture:
flowchart/db-arrow-thick-head-invalid] [fixture:
flowchart/db-arrow-dash-head-length]

### FlowchartLabel

| 欄      | 型     | 意味                                                                                                                                                                                             |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kind`  | 文字列 | `text`、`string`、`markdown` のどれか（[flowchart.ja.md](../diagrams/flowchart.ja.md#ラベル) を参照）。                                                                                          |
| `value` | 文字列 | 先頭の文字列か markdown 文字列の中身に、残りの範囲のテキストを続けたもの。テキストの並びで始まるラベルでは、その範囲のテキスト（[flowchart.ja.md](../diagrams/flowchart.ja.md#ラベル) を参照）。 |

子の欄はありません。
すべて空白のラベルはトークンを持ちません。
トークンを持たないどのノードとも同じく、
その範囲はその単位を覆うので（[ast.ja.md](../ast.ja.md#ノード) を参照）、
その値はその空白です。

### FlowchartLiteral

文法が空白を含むことを許し、その終わりを決める位置に、
書き手が引用符なしで書くテキストの値です。
スタイル、コールバックの引数、アクセシビリティの文のテキストがそうです。
決めるのは書かれたものではなく位置です。
`accTitle: x` とスタイル `fill:red` はどちらも 1 語ですが、
その位置は空白を含むテキストを許すのでリテラルです。
一方、`[|` で書いた長方形のプロパティの値は、
その位置が 1 語しか許さないので [Identifier](../ast.ja.md#identifier)
です（[共通の葉のノード](../ast.ja.md#共通の葉のノード) を参照）。

| 欄      | 型     | 意味                                                            |
| ------- | ------ | --------------------------------------------------------------- |
| `value` | 文字列 | その範囲のテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
そのトークンは `RawText` のトークンです。
1 つで、単位の間のディレクティブがテキストを切るときはそれより多くなります
（[common.ja.md](../common.ja.md#ディレクティブはトークンの境界) を参照）。
値は、
改行を含めて内側の空白を保ち、両端に空白を持ちません。
リテラルの周りに書かれた空白はどのノードにも属さず、Db がそれを要るところでは、
ソースから読みます
（[flowchart.ja.md](../diagrams/flowchart.ja.md#木から要約を作る) を参照）。
リテラルは必ずトークンを持ちます。
スタイルのようにテキストがすべて空白になるところでは、
欄はそれに代えて null
を持ちます（[FlowchartStyleStatement](#flowchartstylestatement) を参照）。

### FlowchartDataBlock

`@{` から、それを閉じる `}` までの 1 つのデータブロックです。
`A@{ shape: rect }@{ label: x }` のように続けて書いたブロックは、
それぞれが 1 つのノードです。

| 欄      | 型     | 意味                                               |
| ------- | ------ | -------------------------------------------------- |
| `value` | 文字列 | `@{` と、それを閉じる `}` の間の、範囲のテキスト。 |

子の欄はありません。
木は値を読みません
（[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md) を参照）。
フロントマターと違い、値の範囲を別に持ちません。
値はブロックのトークンの中にあります。
[fixture: flowchart/gram-data-consecutive-blocks]

### FlowchartIgnoredText

書き手が書いたが、mermaid.js が読まず、図に何の効果も持たないテキストです。
道具がトークンを探さずにそのようなテキストを見つけられるように、
それ自体の型のノードにします。
flowchart では、方向の行の、
`direction`
の前と値の後のテキストです
（[FlowchartDirectionStatement](#flowchartdirectionstatement) を参照）。

| 欄      | 型     | 意味                                                            |
| ------- | ------ | --------------------------------------------------------------- |
| `value` | 文字列 | その範囲のテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
そのトークンは `RawText` のトークンです。
1 つで、ディレクティブがテキストを切るときはそれより多くなります。
`A-%%{init: {}}%%->B direction LR` の `direction` の前のテキストは `A-->B`
です。
範囲は最初のトークンから最後のトークンまでなので、値は両端に空白を持ちません。
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
それらの文字列の後にテキストが続くもののどれで書くことも許し、
どれで書いたかが subgraph のラベルの種類を決めます。
空白を含む名前は id になりません。
subgraph の Db の id とタイトルは、`name`、`title`、そしてどのノードも持たない、
名前とそのタイトルか区切りとの間のソースのテキストから求めます
（[flowchart.ja.md](../diagrams/flowchart.ja.md#db-の正規化) を参照）。

### FlowchartStyleStatement

| 欄       | 型                                  | 意味                                                                      |
| -------- | ----------------------------------- | ------------------------------------------------------------------------- |
| `id`     | Identifier                          | id。カンマを含む。                                                        |
| `styles` | (FlowchartLiteral または null) の列 | スタイル。ソースの順。それぞれリテラルか、すべて空白のスタイルなら null。 |

子の欄: `id`、`styles`。
スタイルは、`fill:#f00` のような、2 つの `,` の間、
またはリストの両端のテキストで、そのリテラルは両端の空白を除いてそれを持ちます。
`style A fill:#f00 , stroke:#333 ` のスタイルは `fill:#f00` と `stroke:#333`
です。
スタイルの周りに書かれた空白は、
Db が読みます
（[flowchart.ja.md](../diagrams/flowchart.ja.md#木から要約を作る) を参照）。
すべて空白のスタイルはトークンを持たないので、null です。
`style A fill:#f00, ` のスタイルは、リテラルと null です。
[fixture: flowchart/gram-style-id-comma] [fixture:
flowchart/gram-style-whitespace] [fixture:
flowchart/db-style-whitespace-only-value]

### FlowchartClassDefStatement

| 欄           | 型                                  | 意味                                                                                                                                                                                                   |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cssClasses` | (Identifier または null) の列       | CSS クラス。`classDef` の後の `id-list` の、`,` の単位の間の部分。ソースの順。空の部分は null（[flowchart.ja.md](../diagrams/flowchart.ja.md#styleclasslinkstyle-の文) を参照）。                      |
| `styles`     | (FlowchartLiteral または null) の列 | スタイル。FlowchartStyleStatement と同じ。ただし、`\` の直後の `,` は 2 つのスタイルを分けず、スタイルの一部になる（[flowchart.ja.md](../diagrams/flowchart.ja.md#styleclasslinkstyle-の文) を参照）。 |

子の欄: `cssClasses`、`styles`。
[fixture: flowchart/db-classdef-names-empty] [fixture:
flowchart/db-classdef-names-trailing-comma]

### FlowchartClassStatement

| 欄         | 型                            | 意味                                                                                                         |
| ---------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ids`      | (Identifier または null) の列 | `class` の後の最初の id をリストとして読んだもの。その `id-list` の、`,` の単位の間の部分。空の部分は null。 |
| `cssClass` | Identifier                    | 2 つ目の id、つまり CSS クラス。カンマを含む。                                                               |

子の欄: `ids`、`cssClass`。
[fixture: flowchart/db-class-ids-empty-first] [fixture:
flowchart/db-class-ids-only-comma] [fixture: flowchart/gram-class-name-comma]

### FlowchartClickCallbackStatement

関数を呼ぶクリックの文です。
`click A callback`、`click A call callback(arguments)`。

| 欄          | 型                            | 意味                                                                                                                                                                          |
| ----------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ids`       | (Identifier または null) の列 | クリックの id。`click-comma` の単位の間の部分。ソースの順。空の部分は null。                                                                                                  |
| `callback`  | Identifier                    | 関数の名前。`(` までの文字で、空白や改行を含むことがある。両端の空白は名前に含まない（[クリックとコールバック](../diagrams/flowchart.ja.md#クリックとコールバック) を参照）。 |
| `arguments` | FlowchartLiteral または null  | `call` の後の括弧の間の引数。その値は空白と改行を保つ。括弧がないか、括弧の間が空白だけなら null。木はその中を読まない。                                                      |
| `tooltip`   | StringLiteral または null     | ツールチップの文字列。なければ null。                                                                                                                                         |

子の欄: `ids`、`callback`、`arguments`、`tooltip`。
[fixture: flowchart/tokens-callback-name-trailing-space]

### FlowchartClickUrlStatement

URL にリンクするクリックの文です。
`click A href "url"`、`click A "url" "tooltip" _blank`。

| 欄        | 型                            | 意味                                                                                                                                |
| --------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `ids`     | (Identifier または null) の列 | FlowchartClickCallbackStatement と同じ。                                                                                            |
| `url`     | StringLiteral                 | URL の文字列。                                                                                                                      |
| `tooltip` | StringLiteral または null     | FlowchartClickCallbackStatement と同じ。                                                                                            |
| `target`  | 文字列または null             | リンク先。`_self`、`_blank`、`_parent`、`_top` のどれか（[文の文脈](../diagrams/flowchart.ja.md#文の文脈) を参照）。なければ null。 |

子の欄: `ids`、`url`、`tooltip`。
[fixture: flowchart/db-click-ids-empty-tooltip] [fixture:
flowchart/lex-click-id-comma]

どちらの型でも、クリックの文の範囲は、
そのクリックの id を読んだクリックの文脈に入った `click` の単位から始まります。
文の文法が始まる単位です。
その `click` は範囲の中の `Keyword` のトークンで、どの欄にも属しません。
文はほかに `click` の単位を持ちません
（[クリックとコールバック](../diagrams/flowchart.ja.md#クリックとコールバック) を参照）。
[fixture: flowchart/gram-click-href]

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
範囲は方向の行の全体なので、両方のテキストの範囲を覆います。
`A-->B direction TB` は `direction` の前のテキスト `A-->B` を、
`  accDescr: d ; direction LR` はテキスト `accDescr: d ;` を持ちます。
`A[direction TB]` は、その前のテキスト `A[` と値の後のテキスト `]` を持ち、
`direction LR trailing` は値の後のテキスト `trailing` を持ちます。
[fixture: flowchart/lex-direction-line-swallows-edge] [fixture:
flowchart/lex-direction-line-acc-descr-subgraph-indented] [fixture:
flowchart/lex-direction-line-text-before-directive-inside] [fixture:
flowchart/lex-direction-line-in-label] [fixture:
flowchart/lex-direction-line-text-after-value] [fixture:
flowchart/lex-direction-line-text-after-directive-inside] `direction`、改行、
`TB` はどちらも持ちません。
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
テキストのない閉じたブロックは何も変えません
（[flowchart.ja.md](../diagrams/flowchart.ja.md#木から要約を作る) を参照）。

| 欄       | 型                           | 意味                                                                                                |
| -------- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `value`  | FlowchartLiteral または null | `accDescr {` と `}` の間のテキスト。ブロックが閉じていなければテキストの終わりまで。なければ null。 |
| `closed` | 真偽値                       | ブロックが `}` で終わるかどうか。テキストがブロックの中で終わるときは偽。                           |

子の欄: `value`。
テキストの終わりの `accDescr { x` の値は `x` です。
[fixture: flowchart/lex-acc-descr-block-unclosed]
`accDescr {  }` はテキストのない閉じたブロックで、値は null です。
`{` の後の空白は `{` と一緒に読まれます。
そのようなブロックも、どの説明のブロックとも同じく文を始めるので、
`A accDescr {}` は拒否されます
（[flowchart.ja.md](../diagrams/flowchart.ja.md#アクセシビリティの値) を参照）。
[fixture: flowchart/gram-acc-descr-block-empty] [fixture:
flowchart/db-acc-descr-empty-block-keeps] [fixture:
flowchart/gram-empty-description-block-after-vertex]

## トークン

トークンは、
[diagrams/flowchart.ja.md](../diagrams/flowchart.ja.md#字句構造)
の単位から作ります。
すべて空白でない単位は、
どれも [文法](../diagrams/flowchart.ja.md#文法) の 1 つの**項目**に属し、
この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | `header-keyword` と `header-direction` の単位。文を始めるか続ける `subgraph`、`end`、`style`、`classDef`、`class`、`linkStyle`、`interpolate`、`href`、`accTitle`、`accDescr` の単位。クリックの文の `click` の単位。クリックの文の `call` の単位。`linkStyle` の文の `default` の単位。方向の文の `direction` と `direction-value` の単位。`link-target` の単位                                                                                                                           |
| `Identifier` | `id`（そのすべての単位）。`id-list-part`（そのすべての単位）。`edge-id` の単位。クリックの文の `click-id` の単位。クリックの文の `callback-name` の単位。`name`（そのすべての単位）。`[\|` で書いた長方形の 2 つの `id-run`（それぞれが 1 つの項目）                                                                                                                                                                                                                                       |
| `Numeric`    | `linkStyle` の文の `number` の単位                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `String`     | `string` と `markdown-string` の単位                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `RawText`    | ラベルの `text-run` の単位。リンクの `link-text-char` の単位。`subgraph-name` の、文字列と markdown 文字列以外の単位（文字列で区切られない並びごとに 1 つの項目。名前の部品の単位）。木のスタイル（そのすべての単位。`classDef` の文で `\` の直後にある `,` を含む）。文の `title-text`、`description-text`、`description-block-text` の単位。クリックの文の `callback-arguments` の単位。`data-start` の単位とその `}` の間の `data-text` と `data-quote` の単位。`direction-text` の単位 |
| `Punctuator` | 形を開く単位（まとめて 1 つの項目）。規則 `shape` の選択肢でラベルより前にある単位で、最後の選択肢では `"[\|"` だけ。規則 `shape` の選択肢でラベルより後にある単位（まとめて 1 つの項目）。すべて空白でない他の単位（それぞれが 1 つの項目）。リンクのラベルを囲む `\|`、`[\|` で書いた長方形の `:` と `\|`、`&`、`:::`、いま挙げたもの以外の `,`、クリックの文の `click-comma` の単位、`:`、`;`、`@`、`data-start` と `}`、矢印と開く矢印、`{`、`(`、`)`                                  |

**トークン**は、同じ項目で同じ種類の単位が、
その項目の空白の単位だけを挟んで続く最長の並びから、両端の空白を除いたものです。
そのような並びの空白でない 2 つの文字の間にディレクティブがあれば、
並びはディレクティブのところで切られます。
各断片から両端の空白を除いたものがトークンで、
すべて空白の断片はトークンになりません
（[common.ja.md](../common.ja.md#ディレクティブはトークンの境界) を参照）。
断片の間のディレクティブは、それ自体が `Directive` のトークンです
（[ast.ja.md](../ast.ja.md#directive) を参照）。
1 つの単位の中のディレクティブは、単位が `RawText` か `Identifier` でなければ、
入力を拒否させます。
各単位は 1 つの項目に属し 1 つの種類を持つので、
この規則ですべてのトークンが決まり、
空白でないどの文字もトークンかコメントに含まれます。

- `id-list` では、
  2 つの `,` の単位の間の各部分がそれぞれ 1 つの `Identifier` のトークンで、
  各 `,` は `Punctuator` です。
  クリックの文のクリックの id の `click-comma` の単位も同じです。
  `classDef a,,b fill:red` のトークンは、`classDef`、`a`、`,`、`,`、`b`、
  `fill:red` です。
  [fixture: flowchart/db-classdef-names-empty]
- id は、複数の単位からなる場合でも 1 つのトークンです。
  `12ab` も `A-b` も、それぞれ 1 つの `Identifier` で、
  各文字が `letter` の単位である `日本語` もそうです。
  `stroke-width: 2px` のようなスタイルは 1 つの `RawText` のトークンで、
  `a b` のような subgraph の名前もそうです。
- 文字列は、開く引用符から閉じる引用符までの 1 つの単位なので、
  1 つの `String` のトークンです。
- クリックの文では、`call` のトークンと、引数の周りの `(` と `)` のトークンは、
  文に属し、どの欄にも属しません。
  [fixture: flowchart/gram-click-call] [fixture:
  flowchart/gram-click-empty-call-then-arguments]
- 形を開く区切りは、2 つの単位からなる場合でも 1 つのトークンで、
  閉じる区切りも同じです。
  円の `((` と `))`、六角形の `{{` と `}}` は、`(((` や `[[` と同じく、
  それぞれ 1 つの `Punctuator` のトークンです。
  2 つの単位の間のディレクティブは、そのようなトークンを切ります。
  `A(%%{init: {}}%%(x))` は mermaid.js と同じく円で、
  その開く区切りは 2 つのトークン `(` と `(` です。
  [fixture: flowchart/tokens-circle-hexagon-delimiters] [fixture:
  flowchart/tokens-circle-directive-between] [fixture:
  flowchart/gram-circle-gap]
- 行単位の規則が無視する `;` は、
  [ast.ja.md](../ast.ja.md#トークン) の規則に従います。
  同じトークンの文字が前後にあればそのトークンの中にあり、
  そうでなければ単独の `Punctuator` のトークンです。
  `A[x;]` のラベルは `x;` で、`;` はラベルのトークンの中にあります。
  `A[mystyle:#x;]` では `;` が無視されるので、
  ラベルのトークンは `mystyle:#x` で、その後の `;` は単独の `Punctuator` です。
  [fixture: flowchart/tokens-label-semicolon] [fixture:
  common/entity-style-in-label]
- 文の区切りの `;` は、文の範囲に入りません。
  文の範囲は、その最初のトークンから最後のトークンまでです。
- `A[ ]`、`A-->| |B`、`subgraph S[ ]` のラベルのように、
  すべて空白のラベルはトークンを持ちません。
  トークンを持たないことがあるノードはこれだけで、
  その範囲はその単位を覆います（[ast.ja.md](../ast.ja.md#ノード) を参照）。
  すべて空白のスタイルもトークンを持たず、
  木では null です
  （[FlowchartStyleStatement](#flowchartstylestatement) を参照）。
  [fixture: flowchart/gram-label-space] [fixture:
  flowchart/tokens-pipe-label-space] [fixture:
  flowchart/tokens-subgraph-title-space] [fixture:
  flowchart/db-style-whitespace-only-value]
