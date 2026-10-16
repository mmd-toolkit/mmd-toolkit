# XY chart のノード

英語版: [xychart.md](./xychart.md)

この文書は、図種 `xychart` の木のノードを定めます。
木の共通の部分は [ast.ja.md](../ast.ja.md) で定めます。
ソースの読み方と、どの文法の規則がどのノードを作るかは、
[diagrams/xychart.ja.md](../diagrams/xychart.ja.md) で定めます。

この図種の本体は [XychartDiagram](#xychartdiagram) です。
欄の値は、
[ast.ja.md](../ast.ja.md#ノード) が値の書かれたテキストを定めるとおり、
書き手が書いたものを保ちます。
[common.ja.md](../common.ja.md#ソースの読み方) の変換した形ではありません。
テキストは引用符なしか引用符の中に書き、どちらで書いたかはノードの型が示します。
引用符なしのテキストは [XychartLiteral](#xychartliteral) で、
その値は、mermaid.js が読むとおり、
単位の書かれたテキストを間の空白なしでつないだものです。
引用符の中のテキストは [StringLiteral](../ast.ja.md#stringliteral) で、
その値は引用符の間にあるものを書かれたとおりに持ちます。

**プロット**は、その**値**から描く線か棒の組です。
x 軸は**分類**か、2 つの数の**範囲**を持ち、y 軸は範囲だけを持ちます。

## ノード

### XychartDiagram

| 欄        | 型                        | 意味                                    |
| --------- | ------------------------- | --------------------------------------- |
| `headers` | XychartHeader のリスト    | ヘッダー。ソースの順。少なくとも 1 つ。 |
| `body`    | XychartStatement のリスト | 文。ソースの順。なくてもかまいません。  |

子の欄: `headers`、`body`。
ヘッダーは最初の文の前に来ます。
最初のヘッダーの後の 2 つ目のヘッダーも、同じ行でも後の行でもヘッダーで、
文の後のヘッダーは入力を拒否させます。
改行、`;`、空行はどの文にも属さず、ノードを作りません。
ヘッダーがあって文のないテキストは受理されます。
[fixture: xychart/db-header-plain] [fixture: xychart/header-twice]
[fixture: xychart/header-twice-same-line]
[fixture: xychart/header-second-with-orientation]
[fixture: xychart/gram-header-after-statement]
[fixture: xychart/db-semicolon-statements]
[fixture: xychart/db-statement-blank-lines]
[fixture: xychart/db-header-beta-only]

**XychartStatement** は、XychartTitleStatement、XychartXAxisStatement、
XychartYAxisStatement、XychartPlotStatement、XychartAccTitleStatement、
XychartAccDescrStatement、XychartAccDescrBlockStatement のどれかです。

### XychartHeader

ヘッダーのキーワード `xychart` か `xychart-beta` と、その後の向きです。

| 欄            | 型            | 意味                                                                               |
| ------------- | ------------- | ---------------------------------------------------------------------------------- |
| `orientation` | 文字列か null | 書かれたとおりの向き。どの大文字小文字の `vertical` か `horizontal`。または null。 |

子の欄はありません。
キーワードは欄ではなく、どちらも同じ図種です。
向きはキーワードの後の語を書かれたとおりに持ちます。
`xychart Horizontal` は向き `Horizontal` を、
`xychart horizontal` は向き `horizontal` を持ち、向きがなければ null です。
mermaid.js が向きを Db にどう読むかは、tests パッケージの要約にあります。
[fixture: xychart/db-orientation-capitalized]
[fixture: xychart/db-orientation-horizontal]
[fixture: xychart/db-orientation-upper-case]
[fixture: xychart/db-orientation-vertical] [fixture: xychart/db-header-plain]

### XychartTitleStatement

`title` とそのテキストです。`title Sales`、`title "Sales Revenue"`。

| 欄      | 型                              | 意味       |
| ------- | ------------------------------- | ---------- |
| `value` | XychartLiteral か StringLiteral | テキスト。 |

子の欄: `value`。
`title Two words` は XychartLiteral `Twowords` を持ちます。
テキストは空になりません。`title ""` は拒否されます。
[fixture: xychart/db-title-bare-words] [fixture: xychart/db-title-quoted]
[fixture: xychart/gram-title-empty-string]

### XychartXAxisStatement

タイトル、分類か範囲、またはその両方を持つ `x-axis` です。
`x-axis Month [jan, feb]`、`x-axis 0 --> 10`、`x-axis "Month"`。

| 欄      | 型                                  | 意味                        |
| ------- | ----------------------------------- | --------------------------- |
| `title` | XychartLiteral、StringLiteral、null | タイトル。なければ null。   |
| `data`  | XychartBand、XychartRange、null     | 分類か範囲。なければ null。 |

子の欄: `title`、`data`。
少なくとも一方は null ではありません。`x-axis` だけは拒否されます。
引用符の中のタイトルが空でもよいのは、分類か範囲の前だけです。
`x-axis "" [a]` は空の値の StringLiteral をタイトルに持ち、
`x-axis ""` だけは拒否されます。
[fixture: xychart/db-x-axis-band-title] [fixture: xychart/db-x-axis-range]
[fixture: xychart/db-x-axis-title-quoted] [fixture: xychart/gram-x-axis-empty]
[fixture: xychart/db-empty-string-as-x-axis-title-before-band]
[fixture: xychart/db-empty-string-as-x-axis-title-before-range]
[fixture: xychart/gram-grid-empty-x-title-quoted]

### XychartYAxisStatement

タイトル、範囲、またはその両方を持つ `y-axis` です。`y-axis Revenue 0 --> 100`。

| 欄      | 型                                  | 意味                      |
| ------- | ----------------------------------- | ------------------------- |
| `title` | XychartLiteral、StringLiteral、null | タイトル。なければ null。 |
| `data`  | XychartRange か null                | 範囲。なければ null。     |

子の欄: `title`、`data`。
少なくとも一方は null ではなく、XychartXAxisStatement と同じく、
引用符の中のタイトルが空でもよいのは範囲の前だけです。
y 軸は分類を持ちません。`y-axis [a]` は拒否されます。
[fixture: xychart/db-y-axis-range-title]
[fixture: xychart/db-y-axis-title-bare-word] [fixture: xychart/db-y-axis-range]
[fixture: xychart/gram-y-axis-empty]
[fixture: xychart/db-empty-string-as-y-axis-title]
[fixture: xychart/gram-grid-empty-y-title-quoted]
[fixture: xychart/gram-y-axis-band]

### XychartBand

`[` から `]` までの x 軸の分類です。`[jan, "Feb 2", 3]`。

| 欄           | 型                                          | 意味                                |
| ------------ | ------------------------------------------- | ----------------------------------- |
| `categories` | （XychartLiteral か StringLiteral）のリスト | 分類。ソースの順。少なくとも 1 つ。 |

子の欄: `categories`。
同じテキストの 2 つの分類は 2 つの分類です。
空の分類はありません。`[]`、`[a, ""]`、`[, b]` は拒否されます。
[fixture: xychart/db-x-axis-band] [fixture: xychart/db-x-axis-band-quoted]
[fixture: xychart/db-x-axis-band-numbers]
[fixture: xychart/db-x-axis-band-same-category]
[fixture: xychart/gram-x-axis-band-empty]
[fixture: xychart/gram-x-axis-band-empty-string]
[fixture: xychart/gram-grid-empty-category-bare]

### XychartRange

2 つの数とその間の矢印です。`0 --> 100`。

| 欄      | 型             | 意味           |
| ------- | -------------- | -------------- |
| `start` | NumericLiteral | 矢印の前の数。 |
| `end`   | NumericLiteral | 矢印の後の数。 |

子の欄: `start`、`end`。
数は書かれた順を保ちます。
`5 --> 1` は始まり 5 と終わり 1 を、
`-1 --> -5` は始まりマイナス 1 と終わりマイナス 5 を持ちます。
数は、省略できる符号、数字、省略できる小数部で書くか、小数部だけで書きます。
`+1 --> 2` は `raw` が `+1` の始まりを、
`.5 --> 1.5` は `raw` が `.5` の始まりを、
`007 --> 010` は値 7 と 10 を持ちます。
[fixture: xychart/db-x-axis-range] [fixture: xychart/db-data-range-reversed]
[fixture: xychart/db-x-axis-range-negative]
[fixture: xychart/db-x-axis-range-plus]
[fixture: xychart/db-x-axis-range-decimal]
[fixture: xychart/db-x-axis-range-leading-zeros]

### XychartPlotStatement

`line` か `bar`、タイトルかタイトルなし、角括弧の中の値です。
`line Sales [10, 20 "peak", 15]`、`bar [1, 2]`。

| 欄       | 型                                  | 意味                              |
| -------- | ----------------------------------- | --------------------------------- |
| `kind`   | 文字列                              | `line` か `bar`。                 |
| `title`  | XychartLiteral、StringLiteral、null | タイトル。なければ null。         |
| `values` | XychartValue のリスト               | 値。ソースの順。少なくとも 1 つ。 |

子の欄: `title`、`values`。
種類は、書かれた大文字小文字によらず、キーワードを小文字にしたものです。
`LINE [1]` と `Bar [1]` は種類 `line` と `bar` を持ちます。
引用符の中のタイトルは空でもかまいません。
`line "" [1]` は空の値の StringLiteral をタイトルに持ちます。
[fixture: xychart/db-line-values] [fixture: xychart/db-bar-values]
[fixture: xychart/db-line-title-bare] [fixture: xychart/db-bar-title-quoted]
[fixture: xychart/db-plot-upper-case-keyword]
[fixture: xychart/db-plot-capitalized-keyword]
[fixture: xychart/db-grid-empty-plot-title-quoted]

### XychartValue

プロットの値で、ラベルを伴うものと伴わないものです。`20 "peak"`、`15`。

| 欄      | 型                    | 意味                            |
| ------- | --------------------- | ------------------------------- |
| `value` | NumericLiteral        | 数。                            |
| `label` | StringLiteral か null | その後の文字列。なければ null。 |

子の欄: `value`、`label`。
数は [範囲](#xychartrange) の数と同じに書きます。
`-.5` は値マイナス 2 分の 1 を持ちます。
bar の値も line の値と同じくラベルを持て、空の文字列は空の値のラベルです。
`bar [1 "a"]` はラベル `a` を、`line [1 ""]` は空の値のラベルを持ちます。
mermaid.js が line と bar のラベルを Db にどう読むかは、
tests パッケージの要約にあります。
[fixture: xychart/db-label-one] [fixture: xychart/db-label-all]
[fixture: xychart/db-plot-values-decimal] [fixture: xychart/db-label-on-bar]
[fixture: xychart/db-label-empty-string]

### XychartAccTitleStatement

テキストを伴う `accTitle:` の文です。

| 欄      | 型                     | 意味                                             |
| ------- | ---------------------- | ------------------------------------------------ |
| `value` | XychartLiteral か null | `accTitle:` の後、その行の終わりまでのテキスト。 |

子の欄: `value`。
`:` の後の空白は改行も含めてテキストとともに読まれるので、
テキストは、テキストを持つ最初の行で始まります。
`accTitle:` に行 `line [1]` が続くと、値 `line [1]` を持ちます。
テキストの終わりまでテキストが続かないとき、値は null です。
値は、テキストから両端の空白を除いたものです。
[fixture: xychart/db-acc-title] [fixture: xychart/db-acc-title-takes-next-line]
[fixture: xychart/db-acc-title-empty]
[fixture: xychart/db-acc-title-spaces-trimmed]

### XychartAccDescrStatement

テキストを伴う `accDescr:` の文です。

| 欄      | 型                     | 意味                                             |
| ------- | ---------------------- | ------------------------------------------------ |
| `value` | XychartLiteral か null | `accDescr:` の後、その行の終わりまでのテキスト。 |

子の欄: `value`。
XychartAccTitleStatement と同じく、テキストはテキストを持つ最初の行で始まり、
なければ値は null です。
[fixture: xychart/db-acc-descr] [fixture: xychart/db-acc-descr-takes-title-line]
[fixture: xychart/db-acc-descr-blank-lines-then-text]

### XychartAccDescrBlockStatement

テキストを伴う `accDescr { … }` の文か、テキストのないもの、
つまり空の説明ブロックです。

| 欄       | 型                     | 意味                                                                                  |
| -------- | ---------------------- | ------------------------------------------------------------------------------------- |
| `value`  | XychartLiteral か null | `accDescr {` と `}` の間のテキストから両端の空白を除いたもの。間が空白だけなら null。 |
| `closed` | 真偽値                 | ブロックが `}` で終わるかどうか。                                                     |

子の欄: `value`。
`accDescr {}`、`accDescr { }`、空行だけのブロックは値 null を持ちます。
閉じていないブロックはテキストの終わりまで続きます。
テキストの終わりの `accDescr {`、改行、`a` は値 `a` を持ち、閉じていません。
空の説明ブロックは、文が始まるところでだけ文で、ほかでは入力を拒否させます
（[空の説明ブロック](../diagrams/xychart.ja.md#空の説明ブロック) を参照）。
[fixture: xychart/db-acc-descr-block]
[fixture: xychart/db-acc-descr-block-empty]
[fixture: xychart/db-acc-descr-empty-block-spaces-then-plot]
[fixture: xychart/db-acc-descr-empty-block-line-feed-inside]
[fixture: xychart/db-acc-descr-unclosed-block]
[fixture: xychart/div-empty-description-block-inside-title-text]

### XychartLiteral

引用符なしのテキスト、またはアクセシビリティの文のテキストです。

| 欄      | 型     | 意味                                                                                                             |
| ------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| `value` | 文字列 | 引用符なしのテキストでは単位のテキストをつないだもの。アクセシビリティのテキストでは両端の空白を除いたテキスト。 |

子の欄はありません。
引用符なしのテキストは、間に空白があってもなくても、
語の文字の 1 つ以上の単位で、
その値は空白を除きます。
`title Two words` は値 `Twowords` を、`x-axis [a b c]` は分類 `abc` を、
`title a-b_c.d+e=f*g&h#i1` は同じテキストの値を持ちます。
文脈が語の文字として読むところでは、数字を書かれたとおりに持ちます。
`title 2024`、`line -5 [2]`、`x-axis [1.5, -2]` の分類は、
値 `2024`、`-5`、`1.5`、`-2` を持ちます。
アクセシビリティのテキストは、文字の間の空白を保ちます。
`accTitle: a b` は値 `a b` を持ちます。
[fixture: xychart/db-title-bare-words] [fixture: xychart/db-x-axis-band-words]
[fixture: xychart/db-title-bare-characters]
[fixture: xychart/db-title-bare-number]
[fixture: xychart/db-plot-title-negative-number]
[fixture: xychart/db-x-axis-band-decimal-and-negative]
[fixture: xychart/db-acc-title-spaces-trimmed]
