# ignored-semicolon-as-token-boundary

英語版:
[ignored-semicolon-as-token-boundary.md](./ignored-semicolon-as-token-boundary.md)

図種: flowchart、sequence、class、state、er、gantt、journey。
この仕様の mermaid.js からの
[既知の差異](../known-divergences.ja.md) の 1 つです。

## 構文

`style` を含み、その後に `:` と、空白でない 0 個以上の文字と、`#` があり、
さらにその後に `;` がある行は、`style` の規則に当たり、
その最後の `;` は無視されます。
mermaid.js もこの仕様も、それを読みません
（[`style` と `classDef` の行](../common.ja.md#style-行と-classdef-行)
を参照）。
その後、`style` の規則が無視した `;` を除いた行に対して、
`style` を `classDef` に替えて同じことを行うので、
1 つの行に無視される `;` が 2 つあることもあります。
[fixture: common/entity-style-then-classdef-rule]
この規則は、`style A fill:#f00;` のように色を終える `;` によって、
色が [エンティティ](../common.ja.md#エンティティ)
（`#name;` の形の文字参照）として
解釈されるのを防ぐものです。

規則はテキストだけを見るので、無視される `;` は行のどこにでもありえます。
ラベルの中、2 つの語の間、
名前、数、キーワード、矢印、区切り記号の中です。
この文書は、最後のものについてのものです。
ここでの名前は、空白を含みうるかどうかにかかわらず、
図の文書が名前の単位と数えるものです。
U+00A0 を含みうる ER の実体の名前も、その 1 つです。
sequence 図の参加者の id、クラスの名前、
`~` を使って書いた ER の属性の語のように、
図の文書がテキストの単位と数える名前は、無視される `;` を持てます。
[fixture: sequence/tokens-ignored-semicolon-separator-line-feed]
[fixture: class/tokens-ignored-semicolon-in-relation-name]
[fixture: er/div-ignored-semicolon-in-name]
[fixture: er/tokens-ignored-semicolon-in-tilde-word]

## 差異

どの例も、図の全体です。

1. 名前の中の無視される `;`:

   ```mmd
   flowchart LR
     A[style:#x] --> B;b
   ```

2. 数の中の無視される `;`:

   ```mmd
   sequenceDiagram
     participant Z@{ "style": "x:#y" };autonumber 1;0
     A->>B: m
   ```

3. キーワードの中の無視される `;`:

   ```mmd
   flowchart LR
     A[style:#x];sub;graph S
     B
     end
   ```

4. 矢印の中の無視される `;`:

   ```mmd
   flowchart LR
     A[style:#x] -;-> B
   ```

5. 区切り記号の中の無視される `;`:

   ```mmd
   flowchart LR
     A[style:#x]::;:c
   ```

6. ラベルのテキストの中の無視される `;`:

   ```mmd
   flowchart LR
     A[style:#x ; y]
   ```

| 例  | mermaid.js                                     | この仕様 |
| --- | ---------------------------------------------- | -------- |
| 1   | A から頂点 `Bb` への辺                         | 拒否     |
| 2   | 10 から始まるメッセージの番号                  | 拒否     |
| 3   | subgraph S                                     | 拒否     |
| 4   | `A --> B` と同じ、A から B への辺              | 拒否     |
| 5   | クラス c を持つ頂点 A                          | 拒否     |
| 6   | ラベル `style:#x`、空白 2 つ、`y` を持つ頂点 A | 同じ     |

[fixture: flowchart/div-ignored-semicolon-in-id] [fixture:
sequence/div-ignored-semicolon-in-autonumber-start] [fixture:
flowchart/div-ignored-semicolon-in-keyword] [fixture:
flowchart/div-ignored-semicolon-in-arrow] [fixture:
flowchart/div-ignored-semicolon-in-triple-colon] [fixture:
flowchart/tokens-ignored-semicolon-label-spaces]

つまり mermaid.js は、そのような入力を、どれも `;` のない行として読みます。
この仕様もそうしますが、
名前、数、キーワード、矢印、区切り記号は、
中に無視される `;` を持てません。
そのような入力は拒否されます。
差異は一方向だけです。
この仕様は、mermaid.js が拒否する入力を受理することはなく、
どちらも受理する入力には、すべて同じ Db を与えます。

state 図では、無視される `;` は、
`style`、`:`、`#` を持てる `state` の後の名前の中に置けます。
mermaid.js は、本体の続く `state style:#x;B` を合成状態 `style:#xB` と読み、
この仕様はそれを拒否します。
[fixture: state/div-ignored-semicolon-in-state-name]
[fixture: state/div-ignored-semicolon-in-state-name-without-body]
`style`、`:`、`#` を持てるほかの文は、行の残りをテキストとして読みます。
ER 図では、`style`、`:`、`#` は、`;` より前の行のどこにあってもかまいません。
`Bstyle` のような実体の名前、関係の `:` とロール `"#"`、
属性のコメント `"c:#"` などです。
そのため、無視される `;` は、名前、数、濃度、関係の線、キーワード、`:::`、
属性ブロックの語やキーの中に置けます。
mermaid.js は `A ||--o{ Bstyle :"#" C;D` を Bstyle への関係と実体 `CD` と読み、
この仕様はそれを拒否します。
[fixture: er/div-ignored-semicolon-in-name]
[fixture: er/div-ignored-semicolon-in-attribute-word]
[fixture: er/div-ignored-semicolon-in-relationship-line]
ガントチャートでは、`style`、`:`、`#` は、click の文の URL 文字列や
コールバック引数、その行の文の前の説明ブロック、click の id そのものに
置けるので、無視される `;` は click の id、キーワード、
`includes` や `excludes` の項目の中に置けます。
mermaid.js は `click style:#y,id;1 href "u"` を `id1` のリンクと読み、
`click id1 href "style:#x" ca;ll f()` を call と読み、
この仕様はそれらを拒否します。
[fixture: gantt/div-ignored-semicolon-in-click-id]
[fixture: gantt/div-ignored-semicolon-in-call-keyword]
[fixture: gantt/div-ignored-semicolon-in-list-item]
ユーザージャーニー図では、`#` はタイトルのテキスト、section のテキスト、
タスクのテキスト、タスクのデータを終えてコメントを始めるので、
`style`、`:`、`#` はその行の文の前の説明ブロックにあり、
無視される `;` はキーワードの中に置けます。
mermaid.js は `accDescr { style:#x } ti;tle T` をタイトル `T` と読み、
`accDescr { style:#x } sec;tion S` を section `S` と読み、
この仕様はそれらを拒否します。
[fixture: journey/div-ignored-semicolon-in-title-keyword]
[fixture: journey/div-ignored-semicolon-in-section-keyword]

各図の文書は、これがどこに表れるかを、既知の差異の節に挙げています。
[flowchart](../diagrams/flowchart.ja.md#既知の差異)、
[sequence](../diagrams/sequence.ja.md#既知の差異)、
[class](../diagrams/class.ja.md#既知の差異)、
[state](../diagrams/state.ja.md#既知の差異)、
[er](../diagrams/er.ja.md#既知の差異)、
[gantt](../diagrams/gantt.ja.md#既知の差異)、
[journey](../diagrams/journey.ja.md#既知の差異) です。

## 書き手にとっての結果

名前、数、キーワード、矢印、区切り記号の中の無視される `;` は、
mmd-toolkit のパーサーでは拒否されます。
mermaid.js はそれを受理し、`;` がないものとして行を読みます。
どちらも同じに読む図を書くには、
`style` の規則に当たる行は `;` で終えるか、語の中に `;` を書かないでください。

## mermaid.js がそう読む理由

mermaid.js は、図を読む前に、行のテキストから `;` を除きます
（[`encodeEntities()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L895-L917)）。
各図種の字句解析器は、その後に残ったテキストを読み、
`;` がどこにあったかを知りません。
名前や矢印の途中にそのような `;` を挟めるのは、
この処理の順から生じます。

## この仕様の規則と、その理由

この仕様では、無視される `;` はソースに残り、
字句解析器はそれがないものとして読み進めます。
それは、ディレクティブと同じく、テキストと文字列の中と、
2 つの単位の間にあってかまいません
（[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
を参照）。
名前、数、キーワード、矢印、区切り記号は、そのテキスト全体を表し、
その中の無視される `;` は入力を拒否にします。

テキストと文字列は、もともと断片に切られることがあります。
コメント領域がその中にあることがあり、
その値は、コメント領域と同じく、中の無視される `;` を除きます
（[ノード](../ast.ja.md#ノード) を参照）。
この仕様は、名前、数、キーワード、矢印、区切り記号のトークンを、
無視される `;` で切りません。
どれも、そのテキスト全体として読まれます。
mermaid.js がその中の無視される `;` を読めるのは、
読む前の段階として `;` を除くからで、
仕様が構文の規則として述べるものではありません。
これは既知の差異の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

## mermaid.js の文書と issue

- [flowchart](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L1237-L1237)
  の文書は、`;` を `style`、`classDef`、`linkStyle` の行の終わりにだけ示し、
  名前や矢印の中の `;` には触れていません。
- [Issue #1666](https://github.com/mermaid-js/mermaid/issues/1666)
  「Flowchart: linkStyle issues with hex colors」は、
  `#ff9900;` がエンティティとして読まれて
  `linkStyle 0 stroke:#ff9900;` が拒否されたことを報告しています。
  2026-10-03 の時点で閉じていて、
  ラベルは `Type: Bug / Error` と `Status: Triage` です。
  無視される `;` の規則が扱う場合に当たります。
- [Issue #7140](https://github.com/mermaid-js/mermaid/issues/7140)
  「Error on invalid syntax of style」は、
  書き手が CSS のように `classDef` に書いた `;` を知らせることを提案しています。
  2026-10-03 の時点で開いていて、
  ラベルは `Type: Bug / Error` と `new parser` です。
- 名前、数、キーワード、矢印、区切り記号の中の `;` についての
  issue と pull request は見つかりませんでした。
  問いは `semicolon`、`semicolon style`、`semicolon arrow`、
  `semicolon flowchart`、`semicolon in style`、`semicolon link`、
  `encodeEntities`、`classDef semicolon`、`semicolon entity` で、
  2026-10-03 に検索しました。
