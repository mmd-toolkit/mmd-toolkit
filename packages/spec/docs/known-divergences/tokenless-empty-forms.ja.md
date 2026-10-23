# tokenless-empty-forms

英語版: [tokenless-empty-forms.md](./tokenless-empty-forms.md)

図種: flowchart、sequence、class、state、er、gantt、requirement、mindmap、
xychart、quadrant、block、kanban、agentflow。
これは、この仕様の mermaid.js との
[既知の差異](../known-divergences.ja.md) の 1 つです。

## 構文

空の文字列や空の説明ブロックのように、書かれていても中身が空の構文があります。
flowchart では 3 つです。

- **空の文字列**。`""` か、空のマークダウンの文字列です。
  [fixture: flowchart/lex-empty-string-line]
  [fixture: flowchart/header-empty-markdown-string]
- **空の呼び出し**。`click A call ()` のように、`call` とその後の空白に、
  間に空白しかない括弧が続くものです。
  [fixture: flowchart/gram-empty-call-line]
- **空の説明ブロック**。括弧の間に空白しかない `accDescr {}` です。
  [fixture: flowchart/db-acc-descr-empty-block-alone]

文字列も `call` も文法にない sequence では、空の説明ブロックだけです。
`call` を持たず、クリックの文が文字列を取る文の文脈では
字句解析器が `""` をトークンのある文字列の単位として読む state も同じです。
[fixture: state/lex-string-outside-click] [fixture: state/gram-click-terminal]
`state` が入る state の文脈でも、
mermaid.js は空の文字列にトークンを読みませんが、
そこでそれが現れるのは単位が始まるところだけで、
木（構文木、AST）はそのどの場所でも、それを持ちます。
名前の前と後、本体の前、別名の文の文字列の前と後では StateIgnoredText として、
`state` の後か行の中のほかの文の後では StateIgnoredStatement として持ちます
（[state の文字列の文脈](../diagrams/state.ja.md#state-の文脈) を参照）。
そのため、そのような入力は mermaid.js と同じく受理され、この差異には入りません。
[fixture: state/gram-state-empty-string-before-name] [fixture:
state/gram-state-empty-string-between-name-and-body] [fixture:
state/gram-state-empty-strings-around-alias-string] [fixture:
state/gram-state-empty-string-after-name]
class では 5 つです。
flowchart の 3 つ
（class にはマークダウン文字列がないので、空の文字列は `""` だけ）と、
クラスの名前の中に書く 2 つ、
つまり、2 つのバッククォートである**空のバッククォートの名前**と、
2 つの `~` である**空のジェネリクスの型**です。
er では 2 つです。
空の説明ブロックと、属性ブロックの中の、
間に何もない 2 つのバッククォートである**空のバッククォート**で、
mermaid.js はそれにトークンを読みません。
2 つの属性の間では木がそれをブロックの項目として持つので、
属性の中にあるものだけがこの差異に入ります
（[属性](../diagrams/er.ja.md#属性) を参照）。
gantt では 3 つです。
空の説明ブロック、`href` と間に何もない 2 つの引用符である**空の href**、
flowchart と同じ空の call です。
空の href と空の call は、どこにあってもこの差異に入ります
（[空の href と空の call](../diagrams/gantt.ja.md#空の-href-と空の-call)
を参照）。
requirement では 2 つです。
空の説明ブロックと、空の文字列 `""` で、
空の文字列はどこにあってもこの差異に入ります
（[単位と文脈](../diagrams/requirement.ja.md#単位と文脈) を参照）。
mindmap では 3 つです。
`::icon()` である**空の icon**、
`:::` の後にその行で何もない**空の class の行**、
形の中の空の文字列 `""` か空の markdown 文字列です。
3 つとも、どこにあってもこの差異に入ります
（[空の形](../diagrams/mindmap.ja.md#空の形) を参照）。
xychart では 2 つです。
閉じた空の説明ブロックと、空の文字列 `""` です。
空の文字列は、軸やプロットのタイトル全体でも値のラベル全体でもないところで、
この差異に入ります
（[空の文字列](../diagrams/xychart.ja.md#空の文字列) を参照）。
quadrant では 3 つです。
閉じた空の説明ブロック、空の文字列 `""`、空の markdown 文字列です。
2 つの文字列は、どこにあってもこの差異に入ります
（[空の文字列](../diagrams/quadrant.ja.md#空の文字列) を参照）。
block でも同じ 3 つで、2 つの文字列はどこにあってもこの差異に入ります
（[空の文字列](../diagrams/block.ja.md#空の文字列) を参照）。
[fixture: block/div-empty-string-line]
[fixture: block/div-empty-markdown-line]
[fixture: block/div-empty-block-in-edge]
[fixture: quadrant/div-empty-string-alone]
[fixture: quadrant/div-empty-markdown-string-line]
[fixture: quadrant/div-empty-block-in-quadrant-text]
[fixture: er/div-empty-description-block-in-relationship] [fixture:
er/div-empty-backquotes-between-type-and-name] [fixture:
er/gram-empty-backquotes-between-attributes] [fixture:
gantt/div-empty-href-before-call] [fixture: gantt/div-empty-call-before-href]
[fixture: gantt/gram-empty-href-line] [fixture: gantt/gram-empty-call-line]
[fixture: requirement/div-empty-string-line] [fixture:
requirement/div-empty-description-block-in-relationship] [fixture:
mindmap/div-empty-icon-before-root] [fixture:
mindmap/div-empty-class-before-root] [fixture:
mindmap/div-empty-string-in-shape] [fixture:
mindmap/div-empty-markdown-string-in-shape]
[fixture: xychart/div-empty-string-line]
[fixture: xychart/div-empty-description-block-in-categories]

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

kanban では mindmap と同様、
空の icon `::icon()` と空の class 行 `:::` は認識するどこでも拒否します。
最初のノードの前と形の直後も含みます。
[fixture: kanban/db-decoration-empty-class]
[fixture: kanban/db-decoration-empty-icon]
[fixture: kanban/div-empty-icon-before-first]
[fixture: kanban/div-empty-icon-header]
[fixture: kanban/div-empty-class-header]
[fixture: kanban/div-class-before-first-unindented-empty]
[fixture: kanban/div-class-end-empty]
[fixture: kanban/div-empty-icon-after-shape]
[fixture: kanban/div-empty-class-after-shape]
形の中の空の文字列と markdown 文字列も、
空でないラベルの前後を含めて拒否します
（[空の形](../diagrams/kanban.ja.md#空の形) を参照）。
[fixture: kanban/div-empty-string-before-label]
[fixture: kanban/div-empty-markdown-before-label]
[fixture: kanban/div-empty-string-after-label]
[fixture: kanban/div-empty-markdown-after-label]
[fixture: kanban/div-string-before-string]
[fixture: kanban/div-empty-markdown-before-string]

形の外の裸の `""` と空の markdown 文字列はノード本文です。
[fixture: kanban/db-empty-string-node]
[fixture: kanban/db-empty-markdown-node]
空の `@{}` はデータブロックです。
[fixture: kanban/db-metadata-empty]
どれも捨てられる空の形ではありません。

## 差異

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

class の 1 つの形は、別に読まれます。
mermaid.js は class の方向の行を、
`direction`、空白、値にまたがる 1 つの規則で読むので、
その間の空の説明ブロックはその規則が当たるのを妨げ、
mermaid.js は `direction` と値を、メンバーの文の 2 つの名前の部分として読み、
空白なしでつなぎます。
`direction accDescr {} LR` は方向を `TB` のままにしてクラスを宣言せず、
`direction LR` は `LR` にします。
`direction accDescr {} LR : x` は、
メンバー `x` を持つクラス `directionLR` を宣言します。
そのため mermaid.js は、この入力をブロックがないものとしては読みません。
[fixture: class/div-empty-description-block-between-direction-and-value]
[fixture: class/div-empty-description-block-before-direction-value-glued]
[fixture: class/div-empty-description-block-between-direction-and-value-label]

class と state では、ブロックは、
空白をまたぐ mermaid.js のほかの規則が当たるのも妨げます。
mermaid.js は `accTitle accDescr {}: t` を、
メンバーか説明を持つ名前 `accTitle` として読みますが、
`accTitle : t` は題です。
この仕様は、ブロックがその文の中にあるので、この入力を拒否します。
[fixture: class/div-empty-description-block-between-acc-title-and-colon]
[fixture: state/div-empty-description-block-between-acc-title-and-colon]

これらの形に見えるだけのテキストは、そのどれでもなく、どちらも同じに読みます。
`A""-->B` の引用符は頂点 `A""` の文字で、
`accTitle: ""` はタイトル `""` を持ち、
`A[" "]` は空白 1 つの文字列を持ち、
`A["call ()"]` はラベル `call ()` を持ちます。
[fixture: flowchart/lex-empty-quotes-in-id] [fixture:
flowchart/lex-acc-title-quotes]
[fixture: flowchart/gram-label-space-string] [fixture:
flowchart/gram-label-string-call-text]

差異は一方向だけです。
mermaid.js が受理し、この仕様が拒否します。
各図種の文書は、その例を既知の差異の節に挙げています。
[flowchart](../diagrams/flowchart.ja.md#既知の差異)、
[sequence](../diagrams/sequence.ja.md#既知の差異)、
[class](../diagrams/class.ja.md#既知の差異)、
[state](../diagrams/state.ja.md#既知の差異)、
[er](../diagrams/er.ja.md#既知の差異)、
[gantt](../diagrams/gantt.ja.md#既知の差異)、
[requirement](../diagrams/requirement.ja.md#既知の差異)、
[mindmap](../diagrams/mindmap.ja.md#既知の差異)、
[xychart](../diagrams/xychart.ja.md#既知の差異)、
[quadrant](../diagrams/quadrant.ja.md#既知の差異)、
[block](../diagrams/block.ja.md#既知の差異) です。

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
mmd-toolkit のパーサーはそのようなテキストを拒否し、その形を報告します。
形を除いたテキストは、
ほかの [既知の差異](../known-divergences.ja.md) を持たなければ、
どちらも同じに読みます。
mermaid.js は形をないかのように読むので（[差異](#差異) を参照）、
たいていはそのテキストを、形のあるテキストと同じに読みます。
ただし、形を除くと一緒に読まれる 2 つの部分を、形が隔てていたところは別で、
mermaid.js はそのテキストを違って読むか、拒否します。
`style A "" ""fill:red` のスタイルは空白と `fill:red` ですが、
`style A`、空白 2 つ、`fill:red` のスタイルは `fill:red` です。
`A:""::c` は頂点 `A:::c` ですが、`A:::c` はクラス `c` を持つ頂点 A です。
class では、`direction accDescr {} LR` は方向を `TB` のままにしますが、
`direction`、空白 2 つ、`LR` は `LR` を決めます。
`flowchart""TD` は受理されますが、
`flowchartTD` はヘッダーがなく、どちらも拒否します。
[fixture: flowchart/db-style-empty-strings-one-space]
[fixture: flowchart/db-style-two-spaces-before-style]
[fixture: flowchart/lex-empty-string-splits-triple-colon]
[fixture: flowchart/lex-triple-colon-after-id]
[fixture: class/div-empty-description-block-between-direction-and-value]
[fixture: class/lex-direction-two-spaces-before-value]
[fixture: flowchart/header-empty-string-no-space]
[fixture: flowchart/header-keyword-direction-glued]
mermaid.js のテスト、文書、デモから集めた入力に、
これらの形を持つものはありません。

## mermaid.js がそう読む理由

mermaid.js の字句解析器は、これらの形のどれにもトークンを読みません。
flowchart では、空の文字列の引用符
（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L82-L87)）、
空の呼び出しの `call` と括弧
（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L74-L79)）、
空の説明ブロックの `accDescr {` と `}`
（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L35-L37)）
を読み飛ばします。
sequence と state は空の説明ブロックを同じように読み飛ばし
（[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L76-L77)、
[`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison#L93-L95)）、
class は 5 つの形すべてを読み飛ばします
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L34-L35)、
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L53-L62)、
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L106-L112)）。
er は空の説明ブロック
（[`erDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/parser/erDiagram.jison#L16-L18)）
と空のバッククォート
（[`erDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/parser/erDiagram.jison#L38-L40)）
を読み飛ばします。
gantt は空の説明ブロック
（[`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L24-L25)）、
空の href の `href`、その空白、両方の引用符
（[`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L42-L43)）、
空の call の `call`、その空白、括弧
（[`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L54-L55)）
を読み飛ばします。
requirement は空の説明ブロック
（[`requirementDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L23-L24)）と、
文の文脈と style の文脈の空の文字列の引用符
（[`requirementDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L85-L96)）
を読み飛ばします。
mindmap は、その行で後に何もない `:::` と、間に何もない `::icon(` と `)`
（[`mindmap.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L24-L32)）、
空の文字列の引用符と空の markdown 文字列の区切り
（[`mindmap.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L45-L50)）
を読み飛ばします。
xychart は、閉じた空の説明ブロック
（[`xychart.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L28-L30)）と、
空の文字列の引用符
（[`xychart.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L54-L56)）
を読み飛ばします。
quadrant は、閉じた空の説明ブロック
（[`quadrant.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L28-L29)）、
空の markdown 文字列の区切り
（[`quadrant.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L41-L43)）、
空の文字列の引用符
（[`quadrant.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L44-L45)）
を読み飛ばします。
block は、閉じた空の説明ブロック
（[`block.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/block/parser/block.jison#L79-L80)）、
空の markdown 文字列の区切り
（[`block.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/block/parser/block.jison#L50-L52)）、
空の文字列の引用符
（[`block.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/block/parser/block.jison#L53-L54)）
を読み飛ばします。
これらの規則はどれも、字句解析器の状態に入るか出るだけで何も返さないので、
文法はその形を見ません。

## この仕様の規則と、その理由

この仕様では、これらの形はどれも、形が空でないときと同じ単位として読まれます。
空の文字列は 2 つの引用符、空の呼び出しは `call` と括弧、
空の説明ブロックは `accDescr`、`{`、`}` です。
文法のどの規則もそれらの単位を取らないところでは、入力は拒否されます
（[文字列](../diagrams/flowchart.ja.md#文字列)、
[クリックとコールバック](../diagrams/flowchart.ja.md#クリックとコールバック)、
[アクセシビリティの値](../diagrams/flowchart.ja.md#アクセシビリティの値)
を参照）。
[fixture: flowchart/tokens-empty-string-in-label]
[fixture: flowchart/gram-empty-call-before-link]
[fixture: flowchart/gram-empty-description-block-before-link]

そのような形は、どの 2 つの単位の間にも置けます。
id、ラベル、スタイルのような葉ノードの値の中にも、
ノードのフィールドの間にもです。
木には、そこにそれだけのノードの場所がなく、
形を木から除けば、書き手が書いたテキストが失われます。
これは既知の差異の 1 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。
mermaid.js がテキストを読まないことは、それだけでは拒否の理由になりません。
木に場所があるところでは、形はノードになり、入力は受理されます。
方向の文の周りで mermaid.js が捨てるテキストが
[FlowchartIgnoredText](../ast/flowchart.ja.md#flowchartignoredtext)
になるのと同じです。
[fixture: flowchart/lex-direction-line-swallows-edge] [fixture:
flowchart/lex-direction-line-text-after-value]

この仕様は、木に場所のあるところでは、そのような形をノードにし、
それ以外のところでは入力を拒否します。
場所は次のとおりです。
文が始まるところの空の説明ブロックは、sequence の箱の中でも、
説明ブロックの文で、
同じ行にほかの文が続いてもかまいません（例 5）。
文の最後の単位の後、区切りの前の空の説明ブロックも同じで、
`A accDescr {}`、class の `note for A "x" accDescr {}`、
sequence の `autonumber accDescr {}` がそうです。
ヘッダーの後、その区切りの前の空の説明ブロックも同じで、
`flowchart LR accDescr {}` と、改行が続く `classDiagram accDescr {}` がそうです
（[flowchart](../diagrams/flowchart.ja.md#区切りの前の空の説明ブロック)、
[class](../diagrams/class.ja.md#区切りの前の空の説明ブロック)、
[sequence](../diagrams/sequence.ja.md#区切りの前の空の説明ブロック)、
[state](../diagrams/state.ja.md#区切りの前の空の説明ブロック)
の区切りの前の空の説明ブロックの節を参照）。
[fixture: flowchart/gram-empty-description-block-after-vertex] [fixture:
class/gram-empty-description-block-after-note] [fixture:
sequence/gram-empty-description-block-after-autonumber] [fixture:
flowchart/header-empty-description-block-after-direction] [fixture:
class/header-empty-description-block]
class では、関係の多重度やツールチップとしての空の文字列は、
空の値を持つ StringLiteral で、Db はそれを「なし」として読みます（例 8）。
クラスの名前の終わりの空のジェネリクスの型は、
ジェネリクスのない 2 つの `~` です。
[fixture: class/gram-link-tooltip-empty] [fixture:
class/gram-generic-empty-at-end]
state では、2 つの文の間に何も要らないので、文は各文のすぐ後で始まります。
`A --> B accDescr {}` は遷移と説明のブロックの文で、
`A --> accDescr {} B` ではブロックが遷移の中にあり、入力は拒否されます。
後の単位（状態の参照の後の `-->`、`:::`、説明）がその前の文を続けるブロックと、
間に空白しかないブロックの連なりも、
その文の中にあります。
`A accDescr {} --> B` と `A --> B accDescr {} : x` は拒否されます。
[fixture: state/gram-empty-description-block-after-transition] [fixture:
state/div-empty-description-block-after-arrow] [fixture:
state/div-empty-description-block-in-transition] [fixture:
state/div-empty-description-block-before-label]

文の始まりでも、文やヘッダーの区切りの前でもない空の説明ブロックは、
文の中にあります。
木は、state の文脈の空の文字列と、区切りの前の空の説明ブロックを持ち、
state の合成状態と別名の文の中では、名前の次の行の本体の `{` の前のブロックを、
そこで mermaid.js が読まないほかのテキストを持つ `textBeforeBody` に持ちます。
以下の agentflow の名前と click の前置の位置を除き、
文の中にある他の空の説明ブロックは、次のどちらかの理由で持ちません。

- (a) 文の 2 つの単位の間では、それを持つには、
  その文のノードのその隙間に、mermaid.js が読まないテキストの欄が要ります。
  そのようなブロックは、どの文のほとんどどの隙間にも置けるので、
  どの文のノードのどの隙間にも、そのような欄が要ることになります。
- (b) 矢印、スタイル、名前の部分からなる名前のような値の中では、
  値がその両側にあるので、どの欄も持てません。

これに対して、state の文脈の空の文字列は、state の文脈の単位が始まるところ、
つまり合成状態と別名の文の決まった数か所にしか置けず、そのどの場所にも欄があり、
本体の `{` の前のブロックも同じです。
[fixture: state/gram-empty-description-block-before-alias-body-next-line]
区切りの前のブロックは文の最後の単位の後にあり、そこには文が続けられます。
次の場所は例で、mermaid.js がそのようなブロックを受理する文のノードごとに
少なくとも 1 つと、当たる理由を挙げます。
場所を尽くしてはおらず、場所は上の規則で決まります。
flowchart では:

- FlowchartVertexStatement と、
  その FlowchartVertexGroup と FlowchartLink の 2 つの単位の間:
  `A accDescr {}-->B`、`A-->accDescr {}B`、`A accDescr {}& B`、
  `A & accDescr {}B`、`A e1@accDescr {} --> B`、`A --> accDescr {}|t| B`、
  `A -->|t| accDescr {}B`、`A &accDescr {} B[y]`、
  `A@{ label: x } &accDescr {} A[y]`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: flowchart/gram-empty-description-block-before-link] [fixture:
  flowchart/div-empty-description-block-after-arrow-glued] [fixture:
  flowchart/div-empty-description-block-before-ampersand] [fixture:
  flowchart/div-empty-description-block-after-ampersand] [fixture:
  flowchart/div-empty-description-block-after-edge-id] [fixture:
  flowchart/div-empty-description-block-before-link-label] [fixture:
  flowchart/div-empty-description-block-after-link-label]
  [fixture: flowchart/div-ampersand-empty-block-then-vertex]
  [fixture: flowchart/div-data-block-ampersand-empty-block-then-vertex]
- FlowchartStyleStatement、FlowchartClassDefStatement、FlowchartClassStatement、
  FlowchartLinkStyleStatement の 2 つの単位の間:
  `style A accDescr {} fill:red`、`style A fill:red accDescr {},stroke:blue`、
  `classDef accDescr {}c fill:red`、`class accDescr {}A c`、
  `linkStyle accDescr {}0 stroke:red`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: flowchart/db-style-first-style-after-empty-description-block]
  [fixture: flowchart/div-empty-description-block-before-style-comma]
  [fixture: flowchart/div-empty-description-block-before-classdef-names]
  [fixture: flowchart/div-empty-description-block-before-class-ids] [fixture:
  flowchart/div-empty-description-block-before-linkstyle-numbers]
- スタイル、つまり FlowchartLiteral の中:
  `style A fill:accDescr {}red` と `style A fill:red accDescr {} %% c`。
  flowchart では、行のほかのテキストの後の `%%` はコメントではなくテキストなので
  （[コメント行](../common.ja.md#コメント行) を参照）、
  スタイルは `fill:red`、空白 2 つ、`%% c` で、ブロックはその中にある。
  値の中なので、どの欄も持てない（理由 b）。
  [fixture: flowchart/div-empty-description-block-in-style] [fixture:
  flowchart/div-empty-description-block-in-style-before-percent]
- FlowchartClickUrlStatement と FlowchartClickCallbackStatement の
  2 つの単位の間:
  `click A accDescr {}href "u"`、`click A "u"accDescr {} "t"`、
  `click A href "u"accDescr {} _blank`、`click A call cb()accDescr {} "t"`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: flowchart/div-empty-description-block-before-href] [fixture:
  flowchart/div-empty-description-block-before-click-tooltip] [fixture:
  flowchart/div-empty-description-block-before-link-target] [fixture:
  flowchart/div-empty-description-block-before-callback-tooltip]
- FlowchartSubgraphStatement の 2 つの単位の間:
  `subgraph accDescr {} fe [Front end]`、`subgraph accDescr {}"x"y`、
  `subgraph fe accDescr {} [Front end]`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: flowchart/div-empty-description-block-before-subgraph-name]
  [fixture: flowchart/gram-subgraph-name-empty-description-block-then-string]
  [fixture: flowchart/div-empty-description-block-before-subgraph-title]
- subgraph の名前、つまり FlowchartLabel の中:
  `subgraph a accDescr {} b` と `subgraph S accDescr {} %% c`。
  後者の `%% c` は、上と同じく名前のテキストで、題は `S`、空白 2 つ、`%% c`。
  値の中なので、どの欄も持てない（理由 b）。
  [fixture: flowchart/gram-empty-description-block-in-subgraph-name] [fixture:
  flowchart/div-empty-description-block-in-subgraph-name-before-percent]

class では:

- ClassRelationStatement と、その ClassName の 2 つの単位の間:
  `A accDescr {} --> B`、`A accDescr {}~T~ <|-- B`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: class/div-empty-description-block-in-statement] [fixture:
  class/div-empty-description-block-before-generic]
- ClassArrow、または名前の部分からなる名前、つまり Identifier の中:
  `A --accDescr {}> B`、`A accDescr {} - B --> C`（名前は `A-B`）、
  `direction accDescr {} LR`（上を参照）。
  値の中なので、どの欄も持てない（理由 b）。
  [fixture: class/div-empty-description-block-in-arrow] [fixture:
  class/div-empty-description-block-in-dashed-name] [fixture:
  class/div-empty-description-block-between-direction-and-value]
- ClassNoteStatement、ClassMemberStatement、ClassLinkStatement、
  ClassCallbackStatement、ClassCssClassStatement、ClassClassDefStatement、
  ClassStyleStatement、ClassAnnotationStatement の 2 つの単位の間:
  `note for accDescr {}A "x"`、`A accDescr {}: x`、
  `click accDescr {}A href "u"`、`click A accDescr {} href "u" "t"`、
  `click A href "u" "t" accDescr {} _self`、`callback A accDescr {} "f"`、
  `click A call f() accDescr {} "t"`、`cssClass accDescr {}"A" c`、
  `cssClass "A" accDescr {} c`、`classDef c accDescr {} fill:red`、
  `style C accDescr {} fill:red`、`<<interface>> accDescr {} Class01`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: class/div-empty-description-block-before-note-class] [fixture:
  class/div-empty-description-block-before-member-colon] [fixture:
  class/div-empty-description-block-before-click-class] [fixture:
  class/div-empty-description-block-before-href] [fixture:
  class/div-empty-description-block-before-link-target] [fixture:
  class/div-empty-description-block-in-callback] [fixture:
  class/div-empty-description-block-before-click-call-tooltip] [fixture:
  class/div-empty-description-block-before-css-class-ids] [fixture:
  class/div-empty-description-block-before-css-class-name] [fixture:
  class/div-empty-description-block-in-class-def] [fixture:
  class/div-empty-description-block-in-style] [fixture:
  class/div-empty-description-block-after-annotation]
- ClassAnnotation の名前の中:
  `<<accDescr {}interface>> A`。
  値の中なので、どの欄も持てない（理由 b）。
  [fixture: class/div-empty-description-block-in-annotation]

sequence では:

- SequenceMessageStatement の 2 つの単位の間:
  `A->>accDescr {}B: x`、`A() accDescr {}->>()B: x`、`A->> accDescr {}+B: x`、
  `A->>+ accDescr {}B: x`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: sequence/gram-empty-description-block-after-arrow] [fixture:
  sequence/div-empty-description-block-after-central-connection] [fixture:
  sequence/div-empty-description-block-before-activation] [fixture:
  sequence/div-empty-description-block-after-activation]
- SequenceNoteStatement の 2 つの単位の間:
  `note accDescr {} left of A: x`、`note left of accDescr {} A: x`、
  `note over A,accDescr {}B: x`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: sequence/div-empty-description-block-before-note-placement]
  [fixture: sequence/gram-empty-description-block-after-placement] [fixture:
  sequence/div-empty-description-block-between-note-ids]
- SequenceLinkStatement、SequenceLinksStatement、SequencePropertiesStatement、
  SequenceDetailsStatement の 2 つの単位の間:
  `link accDescr {}A: x@https://u`、`links accDescr {} A: {"a": "https://u"}`、
  `properties accDescr {} A: {}`、`details accDescr {} A: x`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: sequence/div-empty-description-block-before-link-id] [fixture:
  sequence/div-empty-description-block-before-links-id] [fixture:
  sequence/div-empty-description-block-before-properties-id] [fixture:
  sequence/div-empty-description-block-before-details-id]
- SequenceAutonumberStatement の 2 つの単位の間:
  `autonumber accDescr {}1 2`、`autonumber accDescr {} off`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: sequence/div-empty-description-block-before-autonumber-numbers]
  [fixture: sequence/div-empty-description-block-before-autonumber-off]
- SequenceParticipantStatement と SequenceDestroyStatement の、
  `create` とキーワードの間:
  `create accDescr {}participant A`、`create accDescr {} destroy A`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: sequence/div-empty-description-block-after-create] [fixture:
  sequence/div-empty-description-block-before-destroy]

state では、どれも文の 2 つの単位の間です:

- `A accDescr {} --> B` と `[*] accDescr {} --> A`:
  StateTransitionStatement の、元と矢印の間の欄。
  [fixture: state/div-empty-description-block-in-transition] [fixture:
  state/div-empty-description-block-terminal-before-arrow]
- `A --> accDescr {} B` と `A --> accDescr {} [*]`:
  StateTransitionStatement の、矢印と先の間の欄。
  [fixture: state/div-empty-description-block-after-arrow] [fixture:
  state/div-empty-description-block-before-terminal-target]
- `A --> B accDescr {} : x`: StateTransitionStatement の、ラベルの前の欄。
  [fixture: state/div-empty-description-block-before-label]
- `A accDescr {} : x`: StateDefinitionStatement の、説明の前の欄。
  [fixture: state/div-empty-description-block-before-description]
- `A accDescr {} :::c --> B` と `A --> B accDescr {} :::c`:
  StateReference の、`:::` の前の欄。
  [fixture: state/div-empty-description-block-before-class] [fixture:
  state/div-empty-description-block-before-target-class]
- `A:::accDescr {}c`: StateReference の、`:::` とクラスの間の欄。
  [fixture: state/div-empty-description-block-after-class-separator]
- `click accDescr {} A "u" "t"`: StateClickStatement の、id の前の欄。
  [fixture: state/div-empty-description-block-in-click-before-id]
- `click A accDescr {} "u" "t"` と `click A href accDescr {} "u"`:
  StateClickStatement の、URL の前の欄。
  [fixture: state/div-empty-description-block-in-click-before-url] [fixture:
  state/div-empty-description-block-in-click-after-href]
- `click A "u" accDescr {} "t"`: StateClickStatement の、ツールチップの前の欄。
  [fixture: state/div-empty-description-block-in-click-before-tooltip]

er では、どれも文の 2 つの単位の間で、
持つにはその隙間に欄が要ります（理由 a）。
ErRelationshipStatement の `A accDescr {} ||--o{ B : x` と
`A ||--o{ accDescr {} B : x`、
ErEntityStatement の `A accDescr {} :::c`、`A accDescr {} [P]`、
`A[accDescr {} P]`、
ErSubgraphStatement の `subgraph accDescr {} S` と
`subgraph S [accDescr {} T]`、
ErClassStatement の `class A accDescr {} a` です。
ErAttribute の単位の間の空のバッククォート、
`int `` a` や `int a `` PK` も同じです（理由 a）。
2 つの属性の間、最初の属性の前、最後の属性の後では、
木は空のバッククォートを属性の一覧の ErIgnoredText の項目として持つので、
入力は受理されます（[属性](../diagrams/er.ja.md#属性) を参照）。
[fixture: er/div-empty-description-block-in-relationship] [fixture:
er/div-empty-description-block-after-spec] [fixture:
er/div-empty-description-block-before-class-separator] [fixture:
er/div-empty-description-block-before-alias] [fixture:
er/div-empty-description-block-in-alias-start] [fixture:
er/div-empty-description-block-before-subgraph-id] [fixture:
er/div-empty-description-block-in-subgraph-title-start] [fixture:
er/div-empty-description-block-in-class] [fixture:
er/div-empty-backquotes-between-type-and-name] [fixture:
er/div-empty-backquotes-before-key] [fixture:
er/gram-empty-backquotes-between-attributes] [fixture:
er/gram-empty-backquotes-before-first] [fixture:
er/gram-empty-backquotes-after-last]

gantt では、GanttClickStatement の id と最初の部分の間、2 つの部分の間の
空の説明ブロックは、持つにはその隙間に欄が要ります（理由 a）。
`click id1 accDescr {} href "u"` です。
空の href と空の call は、独立した行の `href ""` や `call ()x : 1d` を含めて、
どこにあってもこの差異に入ります。
mermaid.js が丸ごと捨てるリンクや call を、木は文として持たないからです
（flowchart と同じ）。
文の始まる位置では、空の説明ブロックは文で、入力は受理されます
（[空の href と空の call](../diagrams/gantt.ja.md#空の-href-と空の-call)
を参照）。
[fixture: gantt/div-empty-description-block-between-click-id-and-href]
[fixture: gantt/div-empty-description-block-between-call-and-href] [fixture:
gantt/div-empty-href-before-call] [fixture:
gantt/div-empty-href-glued-before-href] [fixture:
gantt/div-empty-call-before-href] [fixture: gantt/gram-empty-href-line]
[fixture: gantt/gram-empty-call-line] [fixture:
gantt/gram-click-href-then-empty-href]

requirement では、文の 2 つの単位の間の空の説明ブロックは、
持つにはその隙間に欄が要ります（理由 a）。
RequirementRequirementStatement の `requirement accDescr {} r {`、
`requirement r:::accDescr {} c {`、`requirement "r" accDescr {} {`、
フィールドの `id accDescr {}: 1`、`id: accDescr {} 1`、
`risk: accDescr {} high`、
RequirementElementField の `type: accDescr {} t`、
RequirementRelationshipStatement の `a - accDescr {} satisfies -> b`、
`a - satisfies accDescr {} -> b`、`a - satisfies -> accDescr {} b`、
`a <- accDescr {} satisfies - b`、`"a" accDescr {} - satisfies -> b`、
RequirementClassShorthandStatement の `r:::accDescr {} c`、
`"r" accDescr {}:::c` です。
空の文字列は、文の文脈か style の文脈がそれを読むところでは、
それだけの行、文の前、ヘッダーの後、`}` の後、本体の行、
フィールドの値の前と後、文の 2 つの単位の間、style の文脈を含めて、
どこにあってもこの差異に入ります。
mermaid.js が丸ごと捨てる文字列を、木は文として持たないからです
（flowchart と class と同じ）。
文の始まる位置では、空の説明ブロックは文で、
要求か要素の本体の行では本体の RequirementIgnoredText の項目なので、
入力は受理されます
（[空の説明ブロック](../diagrams/requirement.ja.md#空の説明ブロック) を参照）。
[fixture: requirement/div-empty-description-block-between-keyword-and-name]
[fixture: requirement/div-empty-description-block-after-class-separator]
[fixture: requirement/div-empty-description-block-before-brace] [fixture:
requirement/div-empty-description-block-before-field-colon] [fixture:
requirement/div-empty-description-block-after-field-colon] [fixture:
requirement/div-empty-description-block-before-risk] [fixture:
requirement/div-empty-description-block-before-element-value] [fixture:
requirement/div-empty-description-block-in-relationship] [fixture:
requirement/div-empty-description-block-before-arrow] [fixture:
requirement/div-empty-description-block-after-arrow] [fixture:
requirement/div-empty-description-block-in-backward-relationship] [fixture:
requirement/div-empty-description-block-after-string-source]
[fixture: requirement/div-empty-description-block-before-shorthand-separator]
[fixture:
requirement/div-empty-description-block-after-shorthand-separator] [fixture:
requirement/div-empty-string-line] [fixture:
requirement/div-empty-string-before-statement] [fixture:
requirement/div-empty-string-after-header] [fixture:
requirement/div-empty-string-after-close-brace] [fixture:
requirement/div-empty-string-body-line] [fixture:
requirement/div-empty-string-before-value] [fixture:
requirement/div-empty-string-in-relationship] [fixture:
requirement/div-empty-string-before-style] [fixture:
requirement/gram-empty-description-block-in-body] [fixture:
requirement/gram-empty-description-block-after-string-value]

mindmap では、空の icon、空の class の行、形の中の空の文字列は、
ノードの後や根の前の icon と class の行、
形のテキストの前の空の文字列と空の markdown 文字列を含めて、
どこにあってもこの差異に入ります。
mermaid.js が丸ごと捨てる icon や class の行を、木は文として持たず、
丸ごと捨てる文字列を label として持たないからです
（flowchart と class と同じ。
[空の形](../diagrams/mindmap.ja.md#空の形) を参照）。
[fixture: mindmap/db-icon-empty] [fixture: mindmap/div-empty-icon-before-root]
[fixture: mindmap/db-class-empty] [fixture: mindmap/div-empty-class-before-root]
[fixture: mindmap/div-empty-string-in-shape] [fixture:
mindmap/div-empty-markdown-string-in-shape]

xychart では、文が始まらないところの閉じた空の説明ブロックです。
タイトルの語の中、軸やプロットのキーワードの後、分類、値、範囲の中、
ヘッダーと向きの間で、どの欄も持てません（理由 a と b）。
また、軸やプロットのタイトル全体でも値のラベル全体でもない空の文字列です。
それだけの行、文の前後、タイトル、軸、プロットのテキストの前後、
分類の前後、値の前、ラベルの前後、ヘッダーと向きの間です。
flowchart と class と同じく、mermaid.js が丸ごと捨てる文字列を、
木は文として持たないからです。
タイトル全体やラベル全体では、空の文字列は空の値の StringLiteral で、
class と同じく、Db はそれをタイトルなし、ラベルなしと読みます
（[空の説明ブロック](../diagrams/xychart.ja.md#空の説明ブロック) と
[空の文字列](../diagrams/xychart.ja.md#空の文字列) を参照）。
[fixture: xychart/div-empty-description-block-inside-title-text]
[fixture: xychart/div-empty-description-block-inside-axis]
[fixture: xychart/div-empty-description-block-inside-plot]
[fixture: xychart/div-empty-description-block-inside-values]
[fixture: xychart/div-empty-description-block-in-categories]
[fixture: xychart/div-empty-description-block-in-range]
[fixture: xychart/div-empty-description-block-before-orientation]
[fixture: xychart/div-empty-string-line]
[fixture: xychart/div-empty-string-before-statement]
[fixture: xychart/div-empty-string-after-title]
[fixture: xychart/div-empty-string-before-title-word]
[fixture: xychart/div-empty-string-after-quoted-title]
[fixture: xychart/div-empty-string-before-axis-title]
[fixture: xychart/div-empty-string-after-axis-title]
[fixture: xychart/div-empty-string-before-plot-title]
[fixture: xychart/div-empty-string-after-plot-title]
[fixture: xychart/div-empty-string-twice-as-plot-title]
[fixture: xychart/div-empty-string-before-category]
[fixture: xychart/div-empty-string-after-category]
[fixture: xychart/div-empty-string-before-value]
[fixture: xychart/div-empty-string-before-label]
[fixture: xychart/div-empty-string-after-label]
[fixture: xychart/div-empty-string-before-orientation]
[fixture: xychart/db-grid-empty-plot-title-quoted]
[fixture: xychart/db-empty-string-as-x-axis-title-before-band]
[fixture: xychart/db-label-empty-string]

quadrant では、文の中の閉じた空の説明ブロックです。
テキストや名前の中、点の `]` とそのスタイルの間、
`classDef` のクラスの名前とそのスタイルの間で、
どの欄も持てません（理由 a と b）。
文が始まるところと文の最後の単位の後では、説明ブロックの文です。
また、mermaid.js が受理するところの空の文字列と空の markdown 文字列です。
それだけの行、文の前、テキストや名前の語の前後、軸の矢印の後、
点のスタイルの間、`classDef` の行です。
flowchart と class と同じく、mermaid.js が丸ごと捨てる文字列を、
木は文として持たないからです。
どのテキストもそれを値全体として持ちません。
`quadrant-1 ""` は両方が拒否し、
mermaid.js は `x-axis L --> ""` を、
矢印を持ち 2 つ目のテキストのない軸の文と読み、
空の値の 2 つ目のテキストではそうなりません
（[空の説明ブロック](../diagrams/quadrant.ja.md#空の説明ブロック) と
[空の文字列](../diagrams/quadrant.ja.md#空の文字列) を参照）。
[fixture: quadrant/div-empty-block-in-classdef]
[fixture: quadrant/div-empty-block-in-name]
[fixture: quadrant/div-empty-block-in-quadrant-text]
[fixture: quadrant/div-empty-block-in-x-axis-text]
[fixture: quadrant/div-empty-string-after-name]
[fixture: quadrant/div-empty-string-before-name]
[fixture: quadrant/div-empty-string-before-quadrant-text]
[fixture: quadrant/div-empty-string-before-statement]
[fixture: quadrant/div-empty-string-between-words]
[fixture: quadrant/div-empty-string-in-classdef]
[fixture: quadrant/div-empty-string-in-point-styles]
[fixture: quadrant/div-empty-string-in-quadrant-text]
[fixture: quadrant/div-empty-string-inside-word]
[fixture: quadrant/div-empty-string-line]
[fixture: quadrant/div-x-axis-empty-string-after-arrow]
[fixture: quadrant/div-y-axis-empty-string-after-arrow]
[fixture: quadrant/div-empty-block-between-point-and-styles]
[fixture: quadrant/div-empty-markdown-string-before-statement]
[fixture: quadrant/div-empty-markdown-string-line]
[fixture: quadrant/div-empty-string-alone]
[fixture: quadrant/div-x-axis-empty-markdown-string-after-arrow]
[fixture: quadrant/gram-quadrant-empty-string]
[fixture: quadrant/gram-x-axis-empty-string-with-arrow]
[fixture: quadrant/gram-name-quoted-empty]
[fixture: quadrant/db-empty-string-in-title]
[fixture: quadrant/db-empty-block-after-point]
[fixture: quadrant/db-empty-block-before-statement]

アクセシビリティの文のない block では、文の中の閉じた空の説明ブロックです。
矢印とそれが行き着くノードの間などで、どの欄も持てません（理由 a と b）。
文が始まるところでは、欄のない説明ブロックの文です。
また、mermaid.js が受理するところの空の文字列と空の markdown 文字列です。
それだけの行、id、辺、形、幅、`end` の前後、入れ子のブロックの前と中、
`columns` とその数の間です。
flowchart と class と同じく、mermaid.js が丸ごと捨てる文字列を、
木は文として持たないからです。
どのラベルもそれを値全体として持たず、
`A[""]` と `A -- "" --> B` は両方が拒否し、id にくっついた `""` は id の一部です
（[空の説明ブロック](../diagrams/block.ja.md#空の説明ブロック) と
[空の文字列](../diagrams/block.ja.md#空の文字列) を参照）。
[fixture: block/div-empty-block-in-edge]
[fixture: block/div-empty-markdown-between]
[fixture: block/div-empty-markdown-line]
[fixture: block/div-empty-string-after-edge]
[fixture: block/div-empty-string-after-id]
[fixture: block/div-empty-string-before-block-key]
[fixture: block/div-empty-string-before-columns-number]
[fixture: block/div-empty-string-before-edge]
[fixture: block/div-empty-string-before-end]
[fixture: block/div-empty-string-before-shape]
[fixture: block/div-empty-string-before-width]
[fixture: block/div-empty-string-between]
[fixture: block/div-empty-string-first-in-line]
[fixture: block/div-empty-string-in-composite]
[fixture: block/div-empty-string-line]
[fixture: block/div-empty-strings-two]
[fixture: block/db-empty-block-line]
[fixture: block/db-empty-block-between]
[fixture: block/db-empty-string-glued-to-id]
[fixture: block/gram-empty-block-only]

文の最後の単位の後、その区切りの前では、
state の `click A "u" "t" accDescr {}` のように、ブロックは文です。
受理される入力は、ブロックを除き、まわりの空白を残した同じ入力の Db を持ちます。
その空白は効果を保つので、`subgraph S accDescr {}` の id は、
名前の後に空白のある `subgraph S` と同じく `subGraph0` で、
`subgraph S` の id は `S` です
（[flowchart](../diagrams/flowchart.ja.md#文法の外での拒否) を参照）。
ブロックの前の空白が受理されるかは、図の文書が述べるとおり、文によります
（[flowchart](../diagrams/flowchart.ja.md#区切りの前の空の説明ブロック) と
[sequence](../diagrams/sequence.ja.md#区切りの前の空の説明ブロック) を参照）。
class の `direction accDescr {}`、改行、`LR` もそのような入力です。
ブロックは、mermaid.js でも、2 つが方向の行になるのを妨げるので、
それらはラベルのない 2 つのメンバーの文で、方向は `TB` のままです。
[fixture: state/gram-click-empty-description-block-after] [fixture:
flowchart/gram-empty-description-block-after-data-block-space] [fixture:
sequence/gram-empty-description-block-after-autonumber-spaces] [fixture:
class/gram-empty-description-block-after-direction-word]

ヘッダーの後、その区切りの前でも、ブロックは文で、
受理される入力は、ブロックのない同じ入力の Db を持ちます。
ヘッダーの後でどこが受理されるかは、図の文書が述べるとおり、図種によります
（[flowchart](../diagrams/flowchart.ja.md#区切りの前の空の説明ブロック)、
[class](../diagrams/class.ja.md#区切りの前の空の説明ブロック)、
[sequence](../diagrams/sequence.ja.md#区切りの前の空の説明ブロック)、
[state](../diagrams/state.ja.md#区切りの前の空の説明ブロック)、
[er](../diagrams/er.ja.md#空の説明ブロック)、
[gantt](../diagrams/gantt.ja.md#空の説明ブロック)、
[requirement](../diagrams/requirement.ja.md#空の説明ブロック) を参照）。
[fixture: flowchart/header-empty-description-block-after-direction] [fixture:
flowchart/header-empty-description-block-before-semicolon] [fixture:
flowchart/header-empty-description-block-no-direction] [fixture:
class/header-empty-description-block] [fixture:
sequence/header-empty-description-block] [fixture:
state/header-empty-description-block] [fixture:
er/header-empty-description-block] [fixture:
gantt/gram-empty-description-block-after-header] [fixture:
requirement/header-empty-description-block]

kanban の空の装飾と形の文字列はそれ自体の意味を持ちます。
mermaid.js はそれらを丸ごと捨てます。
空の形の例外を適用します。
木はそれらを何も変えない文やラベルとしては持たず、
入力を拒否します。
[fixture: kanban/db-decoration-empty-icon]
[fixture: kanban/db-decoration-empty-class]
[fixture: kanban/div-empty-string-before-label]
[fixture: kanban/div-empty-markdown-before-label]

### Agentflow

agentflow は、flowchart と空の文字列、
空の markdown 文字列、空の call の語彙を共有します。
文の始まりでは IgnoredStatement に保つこともできますが、
その位置には明示の空の形の例外を適用します。
それ自体の意味を持って書かれた文字列や呼び出しを mermaid.js が丸ごと捨てるため、
何も変えない文は作りません。
[fixture: agentflow/div-empty-string-statement]
[fixture: agentflow/div-empty-markdown-statement]
[fixture: agentflow/div-empty-call-statement]
[fixture: agentflow/div-empty-string-before-vertex]
[fixture: agentflow/div-empty-call-before-vertex]

flow と connector の名前の中や、後続の click の URL・tooltip の前では、
既存の AgentflowName.parts、textBeforeUrl、textBeforeTooltip の欄が、
認識した消される空の文字列、空の markdown 文字列、空の call を
AgentflowIgnoredText として保てます。
その位置の消される click や閉じた空の説明ブロックと同じく、
書かれたまま受理します。
文の始まりの例外は、これらの位置には当たりません。
[fixture: agentflow/lex-empty-string-in-flow-name]
[fixture: agentflow/lex-empty-call-in-flow-name]
[fixture: agentflow/lex-empty-markdown-in-flow-name]
[fixture: agentflow/lex-empty-string-in-connector-name]
[fixture: agentflow/lex-empty-call-in-connector-name]
[fixture: agentflow/lex-empty-call-before-href]
[fixture: agentflow/lex-empty-string-before-url]
[fixture: agentflow/lex-empty-markdown-before-href]
[fixture: agentflow/lex-empty-string-before-url-tooltip]
[fixture: agentflow/lex-empty-call-before-url-tooltip]
[fixture: agentflow/lex-empty-markdown-before-callback-tooltip]
[fixture: agentflow/lex-mixed-empty-forms-before-url-tooltip]

矢印やコールバック名の前、ヘッダーと方向の間など、
保持する欄がない他の内部の位置では、
認識した消される形を tokenless-empty-forms の理由 1 で拒否します。
保持するには葉を分けるか任意の構造の間の欄を足す必要があります。
[fixture: agentflow/div-empty-string-before-arrow]
[fixture: agentflow/div-empty-call-before-arrow]
[fixture: agentflow/div-empty-string-before-callback]
[fixture: agentflow/div-empty-string-after-click]
[fixture: agentflow/div-empty-string-between-header-and-direction]

閉じた空の説明ブロックには、文の始まりの例外を適用しません。
文の始まりや完成した文の後では AgentflowAccDescrBlockStatement とし、
ヘッダーの方向の後では図の body、
flow の題や global の見出しの後ではその body の先頭に置きます。
flow と connector の名前の中では、
AgentflowName.parts が全体を AgentflowIgnoredText として保ち、
既存の click の textBefore の欄も保てます。
計測した通常の読み方を表せるため、理由 1 で拒否せず受理します。
[fixture: agentflow/lex-empty-description-before-node]
[fixture: agentflow/gram-empty-description-after-vertex]
[fixture: agentflow/gram-empty-description-after-header-direction]
[fixture: agentflow/gram-empty-description-after-global]
[fixture: agentflow/gram-empty-description-after-flow-title]
[fixture: agentflow/lex-empty-description-in-flow-name]
[fixture: agentflow/lex-empty-description-in-connector-name]
[fixture: agentflow/gram-empty-description-before-href]

それらの置き場のない内部のブロックだけを理由 1 で拒否します。
Identifier を分ける場合、必須のクラス名や最初の style の前、
style のコンマの前などです。
保持するには葉の値を変えるか、任意の構造の間の欄を加える必要があります。
完成したクラスの値の後の末尾のブロックは保ちます。
空のデータブロックと空白だけの文字列も、消される空の形ではなく実際の構文です。
[fixture: agentflow/div-empty-description-inside-vertex-id]
[fixture: agentflow/div-empty-description-before-class-name]
[fixture: agentflow/div-empty-description-in-style]
[fixture: agentflow/div-empty-description-in-classdef]
[fixture: agentflow/div-empty-description-before-style-comma]
[fixture: agentflow/gram-empty-description-after-class-glued]
[fixture: agentflow/gram-data-null-document]
[fixture: agentflow/gram-url-tooltip-whitespace-only]

## mermaid.js の文書と issue

以下は固定版の文書が説明する形です。
空の形の区切りを lexer が消す規則としては説明されていません。

- flowchart:
  [文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L53-L74)
  引用した Unicode と markdown のラベルを示します。

- sequence:
  [文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/config/accessibility.md#L67-L93)
  accDescr と空でない複数行の説明ブロックを説明します。

- class:
  [文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/classDiagram.md#L150-L167)
  引用したラベルと空でないバッククォートのクラス名を示します。

- state:
  [文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/config/accessibility.md#L67-L93)
  共通の説明ブロックの構文を説明します。
  [PR #8498](https://github.com/mermaid-js/mermaid/pull/8498) は
  2026-10-22 時点で open であり、as の後の state の id を必須にする提案です。
  消される空の説明ブロックではなく、id の欠落を扱うものです。

- er:
  [文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/entityRelationshipDiagram.md#L225-L241)
  type と name の対を持つ属性ブロックを示します。
  2026-10-22 に確認した closed の
  [issue #1415](https://github.com/mermaid-js/mermaid/issues/1415) は、
  属性内の空のバッククォートではなく、空の関係ラベルを報告します。

- gantt:
  [文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gantt.md#L450-L477)
  URL とコールバック名を持つ click href と call の文を示します。

- requirement:
  [文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/requirementDiagram.md#L91-L109)
  ユーザーのテキストの引用を任意とし、空でない欄を示します。

- mindmap:
  [文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/mindmap.md#L113-L139)
  ::icon() の中のアイコン名と ::: の後のクラス名を示します。

- xychart:
  [文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/xyChart.md#L33-L56)
  引用した図の題、軸の題、カテゴリーのラベルを示します。

- quadrant:
  [文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/quadrantChart.md#L35-L62)
  題と軸のテキストを説明します。

- block:
  [文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/block.md#L175-L195)
  形の中の空でない引用したラベルを示します。

- kanban:
  [文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/kanban.md#L15-L47)
  括弧で囲む列とタスクのラベルを示します。

- agentflow:
  [文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/agentflow.md#L108-L118)
  flowchart と同じノードの宣言を説明します。
  2026-10-22 に `agentflow empty in:title,body` で検索し、
  消される空の文字列、call、内部の説明ブロックの報告は見つかりませんでした。

2026-10-22 に `mermaid-js/mermaid` の issue と pull request を
`"empty string" in:title,body`、`"empty call" in:title,body`、
`accDescr empty in:title,body` で検索しました。
上に挙げた state と ER の報告は、空の id や関係ラベルを扱います。
この差異の、空の形の区切りの消去についての判断ではありません。
