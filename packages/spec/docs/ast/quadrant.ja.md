# Quadrant chart のノード

英語版: [quadrant.md](./quadrant.md)

この文書は、図種 `quadrantChart` の木のノードを定めます。
木の共通の部分は [ast.ja.md](../ast.ja.md) で定めます。
ソースの読み方と、どの文法の規則がどのノードを作るかは、
[diagrams/quadrant.ja.md](../diagrams/quadrant.ja.md) で定めます。

この図種の本体は [QuadrantDiagram](#quadrantdiagram) です。
欄の値は、
[ast.ja.md](../ast.ja.md#ノード) が値の書かれたテキストを定めるとおり、
書き手が書いたものを保ちます。
[common.ja.md](../common.ja.md#ソースの読み方) の変換した形ではありません。
mermaid.js が値を Db にどう読むか（テキストの trim や点の順など）は、
tests パッケージの要約にあります。

quadrant chart は、始まりと終わりにテキストを持つ 2 つの**軸**、
それぞれテキストを持つ 4 つの**象限**、
名前と 2 つの座標とスタイルを持つ**点**を持ちます。
スタイルは `classDef` の**クラス**も与えられます。

## ノード

### QuadrantDiagram

| 欄     | 型                         | 意味                                   |
| ------ | -------------------------- | -------------------------------------- |
| `body` | QuadrantStatement のリスト | 文。ソースの順。なくてもかまいません。 |

子の欄: `body`。
ヘッダーは欄ではありません。ヘッダーは 1 つで、
2 つ目のヘッダーは入力を拒否させます。
改行、`;`、空行、空の文はどの文にも属さず、ノードを作りません。
ヘッダーがあって文のないテキストは受理されます。
[fixture: quadrant/spec-quadrant-jison-fe2d2340]
[fixture: quadrant/header-twice]

**QuadrantStatement** は、QuadrantTitleStatement、QuadrantAccTitleStatement、
QuadrantAccDescrStatement、QuadrantAccDescrBlockStatement、
QuadrantAxisStatement、QuadrantQuadrantStatement、QuadrantPointStatement、
QuadrantClassDefStatement のどれかです。

### QuadrantTitleStatement

`title` とその行の残り: `title Reach and engagement`。

| 欄      | 型                      | 意味                                    |
| ------- | ----------------------- | --------------------------------------- |
| `value` | QuadrantLiteral か null | `title` の後のテキスト。なければ null。 |

子の欄: `value`。
値は、両端の空白を除いた行の残りで、
U+00A0 や U+3000 など表記の空白文字も除きます。
mermaid.js がタイトルをそう読むからです。
`title   T   ` は値 `T` を、`title`、U+00A0、`T` は値 `T` を持ち、
`title` だけと、`title` と U+3000 だけは値 null を持ちます。
[fixture: quadrant/db-title-nbsp-before-text]
[fixture: quadrant/db-title-ideographic-only]
[fixture: quadrant/db-ends-title-nbsp-end]
[fixture: quadrant/db-ends-title-nbsp-end-of-text]
[fixture: quadrant/db-ends-title-ideographic-end]
[fixture: quadrant/db-ends-title-ideographic-end-of-text]
[fixture: quadrant/db-ends-title-bom-end]
[fixture: quadrant/db-ends-title-bom-end-of-text]
[fixture: quadrant/db-ends-title-ls-end-of-text]
[fixture: quadrant/db-ends-title-ps-end-of-text]
[fixture: quadrant/db-title-spaces-trimmed]
[fixture: quadrant/db-title-keyword-alone]

### QuadrantAccTitleStatement

テキストを持つ `accTitle:` の文です。

| 欄      | 型              | 意味                                               |
| ------- | --------------- | -------------------------------------------------- |
| `value` | QuadrantLiteral | `accTitle:` の後の、その行の終わりまでのテキスト。 |

子の欄: `value`。
`:` の後の空白は改行も含めて読まれるので、
テキストはテキストを持つ最初の行で始まります。
`accTitle:` に行 `title T` が続くと、値 `title T` を持ちます。
値は、mermaid.js が読むとおり、
U+00A0 など表記の空白文字も含めて両端の空白を除いたテキストで、
空になりません。
[fixture: quadrant/db-ends-acc-title-nbsp-end]
[fixture: quadrant/db-ends-acc-title-nbsp-end-of-text]
[fixture: quadrant/db-ends-acc-title-ideographic-end]
[fixture: quadrant/db-ends-acc-title-ideographic-end-of-text]
[fixture: quadrant/db-ends-acc-title-bom-end]
[fixture: quadrant/db-ends-acc-title-bom-end-of-text]
[fixture: quadrant/db-ends-acc-title-ls-end-of-text]
[fixture: quadrant/db-ends-acc-title-ps-end-of-text]
[fixture: quadrant/db-acc-title-nbsp-after-colon]
[fixture: quadrant/db-acc-title-ideographic-after-colon]
[fixture: quadrant/db-acc-title-bom-after-colon]
[fixture: quadrant/db-acc-title-ls-after-colon]
[fixture: quadrant/db-acc-title-ps-after-colon]
テキストの終わりまで空白しかない `accTitle:` は、U+00A0 だけでも拒否されます。
`accTitle:`、U+3000、改行、`title T` は値 `title T` を持ちます。
[fixture: quadrant/gram-acc-title-nbsp-only]
[fixture: quadrant/db-acc-title-ideographic-then-next-line]
[fixture: quadrant/db-acc-title-next-line-keyword]
[fixture: quadrant/gram-unclosed-acc-title-at-end]

### QuadrantAccDescrStatement

テキストを持つ `accDescr:` の文です。

| 欄      | 型              | 意味                                               |
| ------- | --------------- | -------------------------------------------------- |
| `value` | QuadrantLiteral | `accDescr:` の後の、その行の終わりまでのテキスト。 |

子の欄: `value`。
QuadrantAccTitleStatement と同じく、テキストはテキストを持つ最初の行で始まり、
両端に表記の空白を持たず、空になりません。
[fixture: quadrant/db-ends-acc-descr-nbsp-end]
[fixture: quadrant/db-ends-acc-descr-nbsp-end-of-text]
[fixture: quadrant/db-ends-acc-descr-ideographic-end]
[fixture: quadrant/db-ends-acc-descr-ideographic-end-of-text]
[fixture: quadrant/db-ends-acc-descr-bom-end]
[fixture: quadrant/db-ends-acc-descr-bom-end-of-text]
[fixture: quadrant/db-ends-acc-descr-ls-end-of-text]
[fixture: quadrant/db-ends-acc-descr-ps-end-of-text]
[fixture: quadrant/db-acc-descr-nbsp-around-text]
[fixture: quadrant/db-acc-descr-next-line]
[fixture: quadrant/gram-unclosed-acc-descr-at-end]

### QuadrantAccDescrBlockStatement

テキストを持つ `accDescr { … }` の文、またはテキストのない文、
つまり空の説明ブロックです。

| 欄      | 型                      | 意味                                                                                            |
| ------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| `value` | QuadrantLiteral か null | `accDescr {` と `}` の間のテキストで、両端の表記の空白を除いたもの。間に空白しかなければ null。 |

子の欄: `value`。
ブロックは必ず閉じます。テキストがその中で終わることはできません。
4 行の `accDescr {`、`D`、`E`、`}` は値 `D`、改行文字、`E` を持ちます。
`accDescr {x`、U+00A0、`}` は値 `x` を持ちます。
[fixture: quadrant/db-acc-descr-block-nbsp-before-brace-close]
`accDescr {}`、2 行の `accDescr {` と `}`、
U+3000 だけのブロックは値 null を持ち、
何も変えません。
`accDescr: D` に `accDescr {`、U+3000、`}` が続くと、説明 `D` を保ちます。
[fixture: quadrant/db-acc-descr-ideographic-block-keeps-line]
空の説明ブロックは、文が始まるところと文の最後の単位の後でだけ文で、
文の中では入力を拒否させます
（[空の説明ブロック](../diagrams/quadrant.ja.md#空の説明ブロック) を参照）。
[fixture: quadrant/db-acc-descr-block-lines]
[fixture: quadrant/db-acc-descr-block-empty-braces]
[fixture: quadrant/db-acc-descr-block-empty]
[fixture: quadrant/gram-acc-descr-block-unclosed]
[fixture: quadrant/db-empty-block-after-point]
[fixture: quadrant/div-empty-block-between-point-and-styles]

### QuadrantAxisStatement

1 つのテキストか、2 つのテキストとその間の矢印を持つ `x-axis` か `y-axis`:
`x-axis Low Reach --> High Reach`、`y-axis Low`、`y-axis Low -->`。

| 欄      | 型                    | 意味                                            |
| ------- | --------------------- | ----------------------------------------------- |
| `axis`  | 文字列                | `x` か `y`。                                    |
| `start` | QuadrantLabel         | 矢印の前のテキスト、またはただ 1 つのテキスト。 |
| `arrow` | 真偽値                | 矢印が書かれているかどうか。                    |
| `end`   | QuadrantLabel か null | 矢印の後のテキスト。なければ null。             |

子の欄: `start`、`end`。
軸は、書かれた大文字小文字によらず、キーワードの文字を小文字にしたものです。
`X-Axis L --> R` は軸 `x` を持ちます。
テキストは書かれた順を保ちます。
x 軸の左と右のテキスト、y 軸の下と上のテキストです。
`end` が null でないとき、`arrow` は真です。
`x-axis L -->` は `arrow` が真で `end` が null で、
mermaid.js はこれを `x-axis L` と違うように読みます。
矢印の長さは欄ではなく、
`y-axis B ---> T` と `y-axis B --> T` は同じ欄を持ちます。
[fixture: quadrant/db-x-axis-upper-case]
[fixture: quadrant/db-y-axis-both]
[fixture: quadrant/db-x-axis-left-with-arrow]
[fixture: quadrant/db-y-axis-bottom-only]
[fixture: quadrant/db-y-axis-long-arrow]

### QuadrantQuadrantStatement

テキストを持つ `quadrant-1`〜`quadrant-4`: `quadrant-1 We should expand`。

| 欄         | 型            | 意味                  |
| ---------- | ------------- | --------------------- |
| `quadrant` | 整数          | 1、2、3、4 のどれか。 |
| `text`     | QuadrantLabel | 象限のテキスト。      |

子の欄: `text`。
番号はキーワードの数字です。
`Quadrant-1 A` は象限 1 を、
`quadrant-10 A` は象限 1 とテキスト `0 A` を持ちます。
[fixture: quadrant/db-quadrant-upper-case]
[fixture: quadrant/db-quadrant-ten]

### QuadrantPointStatement

点: `Campaign A: [0.3, 0.6]`、`B:::c1: [0.45, 0.23] radius: 9, color: #f00`。

| 欄          | 型                       | 意味                                                   |
| ----------- | ------------------------ | ------------------------------------------------------ |
| `name`      | QuadrantLabel            | `:` の前の名前。                                       |
| `className` | Identifier か null       | `:::` の後のクラス名。なければ null。                  |
| `x`         | QuadrantLiteral          | 1 つ目の座標。                                         |
| `y`         | QuadrantLiteral          | 2 つ目の座標。                                         |
| `styles`    | QuadrantLiteral のリスト | `]` の後のスタイル。ソースの順。なくてもかまいません。 |

子の欄: `name`、`className`、`x`、`y`、`styles`。
座標は数ではなく、書かれたテキストを値とするリテラルです。
mermaid.js は読んだテキストを保つからです。
`0.30`、`0x5`、`0 3` はその値を持つ座標です。
クラス名は、`classDef` が定めるかどうかによらず、ASCII の語の文字の語で、
大文字小文字を保ちます。`A:::C1` はクラス名 `C1` を持ちます。
スタイルは、`]` か `,` から次の `,` かスタイルの終わりまでの書かれたテキストで、
両端の空白を除いたものです。
`radius: 10, color: #f00` はスタイル `radius: 10` と `color: #f00` を、
`radius:  10  ,  color:  #f00` は
スタイル `radius:  10` と `color:  #f00` を持ちます。
mermaid.js がスタイルを名前と値にどう読むか、どのスタイルを受け取るかは、
tests パッケージの要約と
[文法の外の拒否](../diagrams/quadrant.ja.md#文法の外の拒否) にあります。
[fixture: quadrant/db-point-plain]
[fixture: quadrant/db-point-coordinate-any-char-x]
[fixture: quadrant/db-point-coordinate-space-in-x]
[fixture: quadrant/db-point-long-fraction]
[fixture: quadrant/db-class-plain]
[fixture: quadrant/db-class-upper-case]
[fixture: quadrant/db-class-undefined]
[fixture: quadrant/db-style-two]
[fixture: quadrant/db-style-space-around]
[fixture: quadrant/db-style-radius-colon-after]

### QuadrantClassDefStatement

クラスの名前とそのスタイルを持つ `classDef`:
`classDef c1 radius: 5, color: #f00`。

| 欄       | 型                       | 意味                                    |
| -------- | ------------------------ | --------------------------------------- |
| `name`   | QuadrantIdentifier       | クラスの名前。                          |
| `styles` | QuadrantLiteral のリスト | スタイル。ソースの順。少なくとも 1 つ。 |

子の欄: `name`、`styles`。
スタイルは点のスタイルと同じく書きます。
スタイルのない `classDef` は拒否されます。
[fixture: quadrant/db-classdef-color]
[fixture: quadrant/db-classdef-two-styles]
[fixture: quadrant/gram-classdef-no-style]

### QuadrantLabel

軸か象限のテキスト、または点の名前です。
引用符なしの語、文字列、markdown 文字列で、
後に引用符なしの語が続けられます。

| 欄      | 型     | 意味                                                                                                                                 |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `kind`  | 文字列 | `text`、`string`、`markdown`: テキストの始まり方。                                                                                   |
| `value` | 文字列 | 始まりの文字列か markdown 文字列の中身に、残りの書かれたテキストを続けたもの。引用符なしで始まるテキストでは、その書かれたテキスト。 |

子の欄はありません。
引用符なしのテキストは、mermaid.js が読むとおり、語の間の空白を保ちます。
`quadrant-1   A  b   ` は値 `A  b` を、
`quadrant-1 a`、タブ、`b` は値 `a`、タブ、`b` を持ちます。
文字列は、両端の空白も含めて、引用符の間にあるものを保ちます。
`x-axis "  "` と `--> R` の始まりは、
種類 `string` と 2 つのスペースの値を持ちます。
markdown 文字列は引用符と逆引用符を除きます。
``"`A`": [0.3, 0.6]`` の名前は種類 `markdown` と値 `A` を持ちます。
文字列の後の語は、その前の空白とともに中身に続きます。
`quadrant-1 "a" b` は種類 `string` と値 `a b` を、
``quadrant-1 "`a`" b`` は種類 `markdown` と値 `a b` を持ちます。
[fixture: quadrant/db-quadrant-spaces-trimmed]
[fixture: quadrant/db-quadrant-tab-inside]
[fixture: quadrant/db-x-axis-spaces-only-string]
[fixture: quadrant/db-name-markdown]
[fixture: quadrant/db-quadrant-quoted-then-bare]
[fixture: quadrant/db-quadrant-markdown-then-bare]
[fixture: quadrant/db-x-axis-quoted-glued-text]

### QuadrantLiteral

タイトル、アクセシビリティのテキスト、説明ブロックのテキスト、座標、
スタイルです。

| 欄      | 型     | 意味                                                              |
| ------- | ------ | ----------------------------------------------------------------- |
| `value` | 文字列 | その書かれたテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
値は改行も含めて中の空白を保ち、端に空白を持ちません。
タイトル、アクセシビリティのテキスト、説明ブロックのテキストでは、
U+00A0 など表記の空白文字も端の空白です。
`accDescr {`、行 `  D`、行 `    E`、`}` は、
値 `D`、改行文字、4 つのスペース、`E` を持ちます。
[fixture: quadrant/db-acc-descr-block-indented-lines]
[fixture: quadrant/db-point-coordinate-space-in-x]

### QuadrantIdentifier

`classDef` のクラスの名前です。

| 欄     | 型     | 意味                                                           |
| ------ | ------ | -------------------------------------------------------------- |
| `name` | 文字列 | その書かれたテキスト（[ノード](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
これは [Identifier](../ast.ja.md#identifier) ではなく、図の名前のノードです。
名前は、この図種では語の文字である ASCII 外の空白文字、
たとえば U+00A0 を持てるからです。
`classDef a`、U+00A0、`b color: #f00` は、
名前が `a`、U+00A0、`b` のクラスを定めます。
名前は ASCII の空白を持たず、そのダッシュ、コロン、コンマは名前の一部です。
`classDef c-1 color: #f00` は `c-1` を定めます。
[fixture: quadrant/db-grid-nbsp-classdef-name]
[fixture: quadrant/db-classdef-dash-name]
[fixture: quadrant/db-classdef-name-colon-between-letters]
