# tokenless-empty-forms

英語版: [tokenless-empty-forms.md](./tokenless-empty-forms.md)

図種: flowchart、sequence、class。
これは、この仕様の mermaid.js との
[既知の差](../known-divergences.ja.md) の 1 つです。

## 構文

書かれているのに何も持たない形があります。
flowchart では 3 つです。

- **空の文字列**。`""` か、空のマークダウンの文字列です。
- **空の呼び出し**。`click A call ()` のように、`call` とその後の空白に、
  間に空白しかない括弧が続くものです。
- **空の説明ブロック**。括弧の間に空白しかない `accDescr {}` です。

文字列も `call` も文法にない sequence では、空の説明ブロックだけです。
class では 5 つです。
flowchart の 3 つと、クラスの名前の中に書く 2 つ、
つまり、2 つのバッククォートである**空のバッククォートの名前**と、
2 つの `~` である**空のジェネリクスの型**です。

それだけの行の空の説明ブロックは、そのふつうの書き方で、
何も変えない説明ブロックの文です。

```mmd
flowchart LR
  accDescr { }
  A
```

[fixture: flowchart/gram-acc-descr-block-empty]

この文書は、この仕様の木にそれらの場所がないところ、
つまり文の中や、値の中のほかのテキストの隣にある、これらの形についてのものです。

## 差

どの例も、図の全体です。

1. ラベルのテキストの前の空の文字列:

   ```mmd
   flowchart LR
     A[""x]
   ```

2. コールバックの名前の前の空の呼び出し:

   ```mmd
   flowchart LR
     A
     click A call ()cb
   ```

3. ラベルの全体としての空の文字列:

   ```mmd
   flowchart LR
     A[""]
   ```

4. 矢印と id の間の空の説明ブロック:

   ```mmd
   sequenceDiagram
     A->>accDescr {}B: x
   ```

5. 同じ行のメッセージの前の空の説明ブロック:

   ```mmd
   sequenceDiagram
     accDescr {} A ->> B: x
   ```

6. クラスの名前の中の空のバッククォートの名前:

   ```mmd
   classDiagram
     class A``B
   ```

7. 文の始めの空の文字列:

   ```mmd
   classDiagram
     "" A --> B
   ```

8. 多重度としての空の文字列:

   ```mmd
   classDiagram
     A "" --> B
   ```

| 例  | mermaid.js                             | この仕様                           |
| --- | -------------------------------------- | ---------------------------------- |
| 1   | ラベル `x` を持つ頂点 A                | 拒否                               |
| 2   | `click A cb` と同じく A が `cb` を呼ぶ | 拒否                               |
| 3   | 拒否                                   | 拒否                               |
| 4   | A から B へのメッセージ                | 拒否                               |
| 5   | A から B へのメッセージ                | 空の説明ブロックと、そのメッセージ |
| 6   | クラス `AB`                            | 拒否                               |
| 7   | A から B への関係                      | 拒否                               |
| 8   | A から B への関係                      | A の側に空の多重度を持つ関係       |

[fixture: flowchart/tokens-empty-string-in-label] [fixture:
flowchart/gram-click-empty-call-before-callback] [fixture:
flowchart/gram-label-empty-string] [fixture:
sequence/gram-empty-description-block-after-arrow] [fixture:
sequence/gram-acc-descr-block-empty-then-statement] [fixture:
class/div-empty-backquoted-in-name] [fixture:
class/div-empty-string-statement-start] [fixture: class/gram-cardinality-empty]

つまり mermaid.js は、これらの形のある入力を、その形がないものとして読みます。
残ったものが受理されるところなら、どこでもその入力を受理します。
文の間、文の中、ラベル・スタイル・サブグラフの名前の中のほかのテキストの隣、
クリック文の id の前、ヘッダーのキーワードのすぐ後です。
残ったものが受理されないところでは、入力を拒否します。
例 3 のように形が値の全体であるところと、
`A --""> B` や `linkStyle 0""0 stroke:red` のように、
字句解析器が 1 つのトークンとして読むもの、
たとえば矢印や数の中にあるところです。
[fixture: flowchart/lex-empty-string-in-arrow]
[fixture: flowchart/gram-linkstyle-number-empty-string]

この仕様は、木に場所のあるところでは、そのような形をノードにし、
それ以外のところでは入力を拒否します。
場所は次のとおりです。
文が始まるところの空の説明ブロックは、sequence の箱の中でも、
説明ブロックの文で、
同じ行にほかの文が続いてもかまいません（例 5 と上の例）。
class では、関係の多重度やツールチップとしての空の文字列は、
空の値を持つ StringLiteral で、Db はそれを「なし」として読みます（例 8）。
クラスの名前の終わりの空のジェネリクスの型は、
ジェネリクスのない 2 つの `~` です。
[fixture: class/gram-link-tooltip-empty] [fixture:
class/gram-generic-empty-at-end]

これらの形に見えるだけのテキストは、そのどれでもなく、どちらも同じに読みます。
`A""-->B` の引用符は頂点 `A""` の文字で、
`accTitle: ""` はタイトル `""` を持ち、
`A[" "]` は空白 1 つの文字列を持ち、
`A["call ()"]` はラベル `call ()` を持ちます。
[fixture: flowchart/lex-empty-quotes-in-id] [fixture:
flowchart/lex-acc-title-quotes]
[fixture: flowchart/gram-label-space-string] [fixture:
flowchart/gram-label-string-call-text]

差は一方向だけです。
mermaid.js が受理し、この仕様が拒否します。
各図種の文書は、その場所を既知の差の節に挙げています。
[flowchart](../diagrams/flowchart.ja.md#既知の差)、
[sequence](../diagrams/sequence.ja.md#既知の差)、
[class](../diagrams/class.ja.md#既知の差) です。

## mermaid.js がそう読む理由

mermaid.js の字句解析器は、これらの形のどれにもトークンを読みません。
flowchart では、空の文字列の引用符
（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L82-L87)）、
空の呼び出しの `call` と括弧
（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L74-L79)）、
空の説明ブロックの `accDescr {` と `}`
（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L35-L37)）
を読み飛ばします。
sequence は空の説明ブロックを同じように読み飛ばし
（[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L76-L77)）、
class は 5 つの形すべてを読み飛ばします
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L34-L35)、
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L53-L62)、
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L106-L112)）。
これらの規則はどれも、字句解析器の状態に入るか出るだけで何も返さないので、
文法はその形を見ません。

## この仕様の規則と、その理由

この仕様では、これらの形はどれも、形が空でないときと同じ単位として読まれます。
空の文字列は 2 つの引用符、空の呼び出しは `call` と括弧、
空の説明ブロックは `accDescr`、`{`、`}` です。
文法のどの規則もそれらの単位を取らないところでは、入力は拒否されます
（[文字列](../diagrams/flowchart.ja.md#文字列)、
[クリックとコールバック](../diagrams/flowchart.ja.md#クリックとコールバック)、
[アクセシビリティの値](../diagrams/flowchart.ja.md#アクセシビリティの値) を参照）。

そのような形は、どの 2 つの単位の間にも置けます。
id、ラベル、スタイルのような葉ノードの値の中にも、
ノードのフィールドの間にもです。
木には、そこにそれだけのノードの場所がなく、
形を木から除けば、書き手が書いたテキストが失われます。
これは既知の差の 1 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。
mermaid.js がテキストを読まないことは、それだけでは拒否の理由になりません。
木に場所があるところでは、形はノードになり、入力は受理されます。
方向の文の周りで mermaid.js が捨てるテキストが
[FlowchartIgnoredText](../ast/flowchart.ja.md#flowchartignoredtext)
になるのと同じです。
[fixture: flowchart/lex-direction-line-swallows-edge] [fixture:
flowchart/lex-direction-line-text-after-value]

## 書き手にとっての結果

書き手が空のものを表すつもりでこれらの形を書くと、
mermaid.js もそれを拒否します。
`A[""]`、`A("")`、`A-->|""|B`、`A -- "" --> B`、
`click A href ""`、`subgraph ""`、`click A call ()` は、どちらも拒否します。
[fixture: flowchart/gram-label-empty-string] [fixture:
flowchart/gram-shape-round-empty-string] [fixture:
flowchart/gram-link-text-empty-string] [fixture:
flowchart/gram-link-text-dash-empty-string] [fixture:
flowchart/gram-click-href-empty-string] [fixture:
flowchart/gram-subgraph-name-empty-string-only] [fixture:
flowchart/gram-click-empty-call-only]
mermaid.js がそれらを受理するのは、ほかのテキストの隣で何も残さず、
描かれるものを何も変えないところだけです。
この道具はそのようなテキストを拒否し、その形を報告します。
それを除けば、たいていはどちらも同じに読むテキストになります（下を参照）。
mermaid.js のテスト、文書、デモから集めた入力に、
これらの形を持つものはありません。

## 件数と確かめ方

parser の差分テストは、そのような入力を、その**参照入力**と比べます。
参照入力は、入力から、コメントの領域と空の形を除いたものです。
空の形とは、それぞれの空の文字列、`call` から `)` までのそれぞれの空の呼び出し、
文を始めない空の説明ブロックの `accDescr` から `}` までです。
ブロックが文を始めるかは、その前の空の文字列と空の呼び出しを除いて決めます。
`""accDescr {}` に改行と `A` が続くものでは、
空の文字列を除くとブロックが文を始めるので、ブロックは参照入力に残ります。
[fixture: flowchart/lex-empty-string-before-empty-description-block]

この仕様の字句解析器が、参照入力を、空の形の単位以外の入力の単位として読み、
mermaid.js が入力を受理するところでは、
parser は、mermaid.js が入力に与える Db を参照入力に与えることになっています。
`A[""x]` は `A[x]` になり、`click A call ()cb` は `click A cb` になります。
[fixture: flowchart/tokens-empty-string-in-label] [fixture:
flowchart/gram-click-empty-call-before-callback]
そうでなければ、除くことで形の両側にあるものがほかの単位につながり、
mermaid.js が参照入力を別に読むことがあります。
`style A "" fill:red` では、
空の文字列の前と後の空白が 1 つの `space` の単位になるので、
参照入力のスタイルは、空白と `fill:red` ではなく `fill:red` です。
`A:""::c` では、`:` と `::` が `:::` になるので、
参照入力は、頂点 `A:::c` ではなく、クラス `c` を持つ頂点 `A` を持ちます。
`flowchart""TD` は `flowchartTD` になり、mermaid.js はそれを拒否します。
[fixture: flowchart/gram-style-empty-string-before-first-style]
[fixture: flowchart/lex-empty-string-splits-triple-colon] [fixture:
flowchart/header-empty-string-no-space]

各図種の受理される fixture のうち、
コメント、ディレクティブ、フロントマターがなく、差の印がないものから、
ヘッダーの後の各行の、各空白の後と行の終わりに、
その図種の空の形をそれぞれ差し込んで、入力を作りました。
各図種から、そのうちの約 2,000 件を等間隔に取りました。
それぞれを mermaid.js とこの仕様の parser で読み、受理と Db を比べました。

| 図種      | 取った件数、作った件数のうち | mermaid.js は拒否、この仕様は受理 | 両方受理、Db が違う | mermaid.js は受理、この仕様は拒否 |
| --------- | ---------------------------: | --------------------------------: | ------------------: | --------------------------------: |
| flowchart |     33,292 件のうち 2,081 件 |                                95 |                   0 |                             1,134 |
| sequence  |      7,860 件のうち 2,620 件 |                                 0 |                   0 |                               117 |
| class     |    114,869 件のうち 2,016 件 |                                 0 |                   0 |                               670 |

flowchart の 95 件は、形がデータブロックに差し込まれ、
mermaid.js がその中身のために拒否する入力で、
[`embedded-data-opaque`](./embedded-data-opaque.ja.md) の入力です。
sequence のほかの 18 件では、形は箱の中で文を始める空の説明ブロックです。
この仕様はそれを説明のブロックの文として読み、
mermaid.js はそのそれぞれに、形を除いた入力と同じ Db を与えます。
[fixture: sequence/gram-box-empty-description-block-line]
残りは、どちらも同じに読みます。
mermaid.js が受理しこの仕様が拒否する 1,921 件のそれぞれについて、
parser の差分テストは、上で述べたとおり、
その参照入力で違いが説明されることを確かめ、
説明されないものはありませんでした。
