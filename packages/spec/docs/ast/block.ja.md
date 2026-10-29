# Block diagram のノード

英語版: [block.md](./block.md)

この文書は、図種 `block` の木のノードを定めます。
木の共通の部分は [ast.ja.md](../ast.ja.md) で定めます。
ソースの読み方と、どの文法の規則がどのノードを作るかは、
[diagrams/block.ja.md](../diagrams/block.ja.md) で定めます。

この図種の本体は [BlockDiagram](#blockdiagram) です。
欄の値は、
[ast.ja.md](../ast.ja.md#ノード) が値の書かれたテキストを定めるとおり、
書き手が書いたものを保ちます。
[common.ja.md](../common.ja.md#ソースの読み方) の変換した形ではありません。
mermaid.js が値を Db にどう読むか（形の型、2 回定めたブロック、
辺の連鎖など）は、 tests パッケージの要約にあります。

block diagram は**ブロック**を列に並べます。
ブロックは、ノード、`space` のブロック、
自分のブロックを持つ**入れ子のブロック**です。
辺がノードをつなぎ、クラスとスタイルが見た目を与えます。

## ノード

### BlockDiagram

| 欄     | 型                      | 意味                              |
| ------ | ----------------------- | --------------------------------- |
| `body` | BlockStatement のリスト | 文。ソースの順。少なくとも 1 つ。 |

子の欄: `body`。
ヘッダーの語 `block-beta` か `block` は欄ではありません。
どちらも同じ図種です。
文のないヘッダーは拒否されます。 [fixture: block/db-name-no-final-line-feed]
[fixture: block/header-only-block-beta]

**BlockStatement** は、BlockNodeStatement、BlockSpaceStatement、
BlockColumnsStatement、BlockCompositeStatement、BlockClassDefStatement、
BlockClassStatement、BlockStyleStatement、
BlockAccDescrBlockStatement のどれかです。

### BlockNodeStatement

ノードと、その幅と、それに続くリンク: `A`、`A:2`、`A --> B`、
`A -- "text" --> B`。

| 欄      | 型                     | 意味                                       |
| ------- | ---------------------- | ------------------------------------------ |
| `node`  | BlockNode              | 最初のノード。                             |
| `width` | NumericLiteral か null | 最初のノードの後の幅。なければ null。      |
| `links` | BlockLink のリスト     | リンク。ソースの順。なくてもかまいません。 |

子の欄: `node`、`width`、`links`。
文法がほかのところでは許さないので、幅は最初のノードにだけ属します。
`A:2 --> B` は幅 2 を持ち、`A --> B:2` は拒否されます。
リンクの連鎖は 1 つの文です。
`A --> B --> C` は書かれたとおり 2 つのリンクを持ち、mermaid.js は、
それを誤って読みます（[辺の文](../diagrams/block.ja.md#辺の文) を参照）。
[fixture: block/db-width-before-edge] [fixture: block/db-width-with-label]
[fixture: block/db-edge-arrow] [fixture: block/db-edge-chain]

### BlockNode

ノード: 形かブロック矢印を持つ id、またはどちらも持たない id。

| 欄      | 型                                  | 意味                              |
| ------- | ----------------------------------- | --------------------------------- |
| `id`    | Identifier                          | id。                              |
| `shape` | BlockShape、BlockArrowShape か null | 形かブロック矢印。なければ null。 |

子の欄: `id`、 `shape`。 [fixture: block/db-shape-square]
[fixture: block/db-arrow-two]

### BlockShape

ラベルを持つ形: `["text"]`、`(("text"))`。

| 欄      | 型            | 意味                                         |
| ------- | ------------- | -------------------------------------------- |
| `open`  | 文字列        | 書かれたとおりの開き。`[`、`((`、`[/` など。 |
| `close` | 文字列        | 書かれたとおりの閉じ。`]`、`))`、`\]` など。 |
| `label` | StringLiteral | その間の文字列。                             |

子の欄: `label`。
開きと閉じは続けて別々に読まれるので（[形](../diagrams/block.ja.md#形)
を参照）、どの開きもどの閉じに出会えます。
`A["x")` は開き `[` と閉じ `)` を持ちます。
どの組が mermaid.js の形で、Db が組にどの型を与えるかは、
tests パッケージの要約にあります。 [fixture: block/db-shape-square]
[fixture: block/db-shape-round] [fixture: block/db-shape-mixed-square-round]

### BlockArrowShape

ブロック矢印: `<["text"]>(right, down)`。

| 欄           | 型                    | 意味                                                          |
| ------------ | --------------------- | ------------------------------------------------------------- |
| `label`      | StringLiteral         | `<[` と `]>` の間の文字列。                                   |
| `directions` | BlockLiteral のリスト | 方向。ソースの順。それぞれが持つ空白を含む。少なくとも 1 つ。 |

子の欄: `label`、`directions`。
方向は `right`、`left`、`up`、`down`、`x`、`y` の語に、その後に書かれた、
次の `,`、方向、`)` までの空白を含めたものです。
前に `,` がなければ、`(` の後のその前に書かれた空白も含みます。
mermaid.js が方向をそう読むからです。
`,` とその後の空白は、どの方向にも属しません。
空白は改行も含めて文字を保ち、書かれたテキストと同じく、
ディレクティブとコメントの範囲を除きます（[ast.ja.md](../ast.ja.md#ノード)
を参照）。
方向は BlockLiteral で、その範囲は空白も覆うので、
その中の行終端を mermaid.js がどう読むかは範囲で決まります。
間にディレクティブのある `\r` と `\n` は 2
つの行終端です（[行終端](../common.ja.md#行終端) を参照）。
`(right, down)` と `(rightdown)` は方向 `right` と `down` を、
`(right , down )` はそれぞれにスペースが続く方向 `right` と `down` を、
`(right down)` はスペースが続く方向 `right` と方向 `down` を、
`( right)` はスペースと `right` の方向を、
`( right , down)` は両側にスペースのある方向 `right` と方向 `down` を持ちます。
[fixture: block/db-arrow-two] [fixture: block/db-grid-empty-directions]
[fixture: block/db-arrow-spaces-around-comma]
[fixture: block/db-arrow-spaces-around-first]
[fixture: block/db-arrow-comment-line-before-first]
[fixture: block/db-arrow-directive-before-first]
[fixture: block/db-arrow-cr-directive-lf] [fixture: block/db-arrow-spaces]
[fixture: block/db-arrow-leading-space] [fixture: block/db-arrow-trailing-space]
[fixture: block/db-spec-spaces-around-directions]
[fixture: block/db-spec-directions-line-feeds]
[fixture: block/db-grid-spaces-directions]
[fixture: block/db-grid-comment-line-directions]
[fixture: block/db-grid-directive-line-directions]

### BlockLink

ノードの文のリンク: 矢印か、開きの矢印・ラベル・矢印と、それが行き着くノード。

| 欄        | 型                        | 意味                                          |
| --------- | ------------------------- | --------------------------------------------- |
| `opening` | BlockOpeningArrow か null | ラベルを持つリンクの開きの矢印。ほかは null。 |
| `arrow`   | BlockArrow                | 矢印、またはラベルの後の矢印。                |
| `label`   | StringLiteral か null     | 2 つの矢印の間のラベル。なければ null。       |
| `target`  | BlockNode                 | リンクが行き着くノード。                      |

子の欄: `opening`、`label`、`arrow`、`target`。
ソースの順です。
ラベルを持つリンクの 2 つの矢印は、違う線でもかまいません。
`A -- "text" ==> B` は開きの線 `solid` と線 `thick` を持ち、
mermaid.js は 2 つ目の矢印だけから辺を読みます。 [fixture: block/db-edge-label]
[fixture: block/db-edge-label-mismatched]

### BlockArrow

矢印です（[辺](../diagrams/block.ja.md#辺) を参照）。
[FlowchartArrow](./flowchart.ja.md#flowchartarrow) の欄を持ちます。

| 欄            | 型     | 意味                                                                                 |
| ------------- | ------ | ------------------------------------------------------------------------------------ |
| `value`       | 文字列 | 書かれたテキスト。                                                                   |
| `startMarker` | 文字列 | 線の前の印。`<` なら `arrow`、なければ `none`。                                      |
| `line`        | 文字列 | `-` なら `solid`、`=` なら `thick`、`.` なら `dotted`。                              |
| `length`      | 整数   | 線の文字の数。`-` か `=` の数、点線では `.` の数。                                   |
| `endMarker`   | 文字列 | 線の後の印。`>` なら `arrow`、`x` なら `cross`、`o` なら `circle`、なければ `none`。 |

子の欄はありません。
語は FlowchartArrow のものです。
id が矢印より先に読まれるので、始まりの印 `cross` と `circle`、
線 `invisible` は現れません（[辺](../diagrams/block.ja.md#辺) を参照）。
`-->` は線 `solid`、長さ 2、終わりの印 `arrow` を持ち、
`<-->` は始まりの印 `arrow` も持ちます。 [fixture: block/db-edge-arrow]
[fixture: block/db-edge-bidirectional]

### BlockOpeningArrow

ラベルを持つリンクの開きの矢印です。
[FlowchartOpeningArrow](./flowchart.ja.md#flowchartopeningarrow)
の欄を持ちます。

| 欄            | 型     | 意味                                                       |
| ------------- | ------ | ---------------------------------------------------------- |
| `value`       | 文字列 | 書かれたテキスト。                                         |
| `startMarker` | 文字列 | 線の前の印。`<` なら `arrow`、なければ `none`。            |
| `line`        | 文字列 | `--` なら `solid`、`==` なら `thick`、`-.` なら `dotted`。 |

子の欄はありません。
flowchart と違い、その線はラベルの後の矢印の線と同じでなくてかまいません。
[fixture: block/db-edge-label] [fixture: block/db-edge-label-mismatched]

### BlockSpaceStatement

`space` か `space:N`。

| 欄      | 型                     | 意味                                   |
| ------- | ---------------------- | -------------------------------------- |
| `width` | NumericLiteral か null | `space:` の後の数。`space` なら null。 |

子の欄: `width`。 [fixture: block/db-space-plain]
[fixture: block/db-space-width]

### BlockColumnsStatement

`columns N` か `columns auto`。

| 欄      | 型                     | 意味                     |
| ------- | ---------------------- | ------------------------ |
| `count` | NumericLiteral か null | 列数。`auto` なら null。 |

子の欄: `count`。 [fixture: block/db-columns-after-nodes]
[fixture: block/db-columns-only-auto]

### BlockCompositeStatement

入れ子のブロック: `block:G`、`block`、`block-beta` と、その文と、`end`。

| 欄     | 型                         | 意味                                                           |
| ------ | -------------------------- | -------------------------------------------------------------- |
| `head` | BlockNodeStatement か null | `block:` の後のノードの文。`block` と `block-beta` なら null。 |
| `body` | BlockStatement のリスト    | `end` までの文。ソースの順。少なくとも 1 つ。                  |

子の欄: `head`、`body`。
頭はほかと同じノードの文で、幅と形を持てます（`block:G:2`、
`block:G["label"]`）。
`block:` の後の辺の文は、書かれたとおり頭で、
mermaid.js はそれを id のない入れ子のブロックとして読みます。
[fixture: block/db-composite-end-crlf] [fixture: block/db-composite-no-id]
[fixture: block/db-composite-edge-header] [fixture: block/db-composite-width]
[fixture: block/db-composite-label]

### BlockClassDefStatement

クラスの名前とスタイルを持つ `classDef`: `classDef c color:#fff,fill:#000`。

| 欄       | 型                               | 意味                                                                                  |
| -------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| `name`   | Identifier                       | クラスの名前。                                                                        |
| `styles` | （BlockLiteral か null）のリスト | スタイル。両端の空白を除いた行の残りの、`,` の間の部分。ソースの順。空の部分は null。 |

子の欄: `name`、`styles`。
スタイルは名前の次の行から始められます。
`classDef c` に行 `class A c` が続くと、1 つのスタイル `class A c` を持ちます。
スタイルがどの空白を持つかは [BlockLiteral](#blockliteral) にあります。
[fixture: block/db-class-def-color-fill]
[fixture: block/db-class-def-empty-style]
[fixture: block/db-spec-class-def-name-only-then-class]

### BlockClassStatement

id とクラスの名前を持つ `class`: `class A,B c`。

| 欄         | 型                    | 意味                                        |
| ---------- | --------------------- | ------------------------------------------- |
| `ids`      | BlockLiteral のリスト | id。`,` の間の部分。ソースの順。            |
| `cssClass` | BlockLiteral か null  | 行の残り、つまりクラスの名前。空なら null。 |

子の欄: `ids`、`cssClass`。
クラスの名前は、中の空白も含めて 1 つのテキストで、
`class A c d` は名前 `c d` を持ちます。
`,` の後の id は `,` のすぐ後から始まり、そこにある改行も含む空白を保ちます。
mermaid.js が id をそう読むからです。
`class A, B c` は id `A` と、スペースの後の `B` を持ち、
`class A,` に行 `B c` が続くと、id `A` と、改行の後の `B` を持ちます。
`,` の前の空白は id の並びを終えます。
`class A ,B c` は 1 つの id `A` と、クラスの名前 `,B c` を持ちます。
id は空白を持てるので、Identifier ではなく BlockLiteral です。
mermaid.js がそうした id を Db でどう探すかは、
tests パッケージの要約にあります。 [fixture: block/db-class-def-undefined-use]
[fixture: block/db-class-apply-list]
[fixture: block/db-class-apply-names-spaces]
[fixture: block/db-class-apply-list-spaces]
[fixture: block/db-class-apply-line-feed-after-comma]
[fixture: block/db-class-apply-list-space-before-comma]
[fixture: block/db-class-apply-comment-line-after-comma]
[fixture: block/db-class-apply-directive-after-comma]

### BlockStyleStatement

id とスタイルを持つ `style`: `style A fill:#f00`。

| 欄       | 型                               | 意味                                      |
| -------- | -------------------------------- | ----------------------------------------- |
| `id`     | Identifier                       | id。コンマも含む。                        |
| `styles` | （BlockLiteral か null）のリスト | スタイル。BlockClassDefStatement と同じ。 |

子の欄: `id`、`styles`。
flowchart と同じく、id はコンマも含む 1 つの id で、Db は、
それを 1 つのテキストとして探します。 [fixture: block/db-style-plain]
[文法の外の拒否](../diagrams/block.ja.md#文法の外の拒否) を参照してください。

### BlockAccDescrBlockStatement

文が始まるところの空の説明ブロック: `accDescr {}`。

子の欄はありません。
欄もありません。
block diagram には説明がありません。
テキストを持つブロックは拒否され、
文の中の空のブロックは既知の差異 `tokenless-empty-forms` です。
[fixture: block/db-empty-block-line] [fixture: block/div-empty-block-in-edge]
[空の説明ブロック](../diagrams/block.ja.md#空の説明ブロック)
を参照してください。

### BlockLiteral

`class` のクラスの名前、`class` の id、スタイル、またはブロック矢印の方向です。

| 欄      | 型     | 意味                                                              |
| ------- | ------ | ----------------------------------------------------------------- |
| `value` | 文字列 | その書かれたテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
値は中の空白を保ちます。
クラスの名前は端に空白を持たず、
`class` の id はその前の `,`
の後の空白を保ちます（[BlockClassStatement](#blockclassstatement) を参照）。
方向は [BlockArrowShape](#blockarrowshape) が定める空白を保ちます。
`classDef` と `style` のスタイルは、両端の空白を除いた行の残りの、
`,` の間の部分です。
mermaid.js がそう読むからです。
スタイルは、自身と `,` の間にある端の空白を保つので、
最初のスタイルは空白でない最初の文字から始まり、
最後のものは空白でない最後の文字で終わります。
`style A  fill:#f00 ,stroke:#333  ` は、スペースが続く `fill:#f00` と、
`stroke:#333` のスタイルを持ち、 `style A fill:#f00 , stroke:#333` は、
スペースが続く `fill:#f00` と、
スペースの後の `stroke:#333` のスタイルを持ちます。
空白だけの部分は、その空白のリテラルです。
mermaid.js が `style` のスタイルにそれを保つからです。
`style A fill:red,  ,stroke:#333` は 2 つのスタイルの間に、
スペース 2 つのリテラルを持ちます。
何もない部分は null です。
`style A ,` は 2 つの null を持ちます。
`style A  , fill:#f00` は最初に、
`style A fill:#f00,  ` は最後に null を持ちます。
行の残りの両端の空白は、どのスタイルにも属さないからです。
`classDef` のスタイルも同じ形です。
Db がそれをどう trim するかは、 tests パッケージの要約にあります。
[fixture: block/db-class-apply-names-spaces]
[fixture: block/db-class-def-color-fill] [fixture: block/db-style-spaces]
[fixture: block/db-style-spaces-at-line-ends]
[fixture: block/db-style-whitespace-only-between-commas]
[fixture: block/db-style-tab-only-between-commas]
[fixture: block/db-class-def-whitespace-only-between-commas]
[fixture: block/db-class-def-spaces-around-styles]
[fixture: block/db-style-whitespace-only-first]
[fixture: block/db-style-whitespace-only-last]
[fixture: block/db-style-only-comma]
[fixture: block/db-style-directive-before-comma]
[fixture: block/db-class-def-directive-before-comma]
