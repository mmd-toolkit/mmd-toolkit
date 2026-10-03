# ignored-semicolon-as-token-boundary

英語版:
[ignored-semicolon-as-token-boundary.md](./ignored-semicolon-as-token-boundary.md)

図種: flowchart、sequence、class。
この仕様の mermaid.js からの
[既知の差](../known-divergences.ja.md) の 1 つです。

## 構文

`style` を含み、その後に `:` と空白でない文字と `#` があり、
さらにその後に `;` がある行は、`style` の規則に当たり、
その最後の `;` は無視されます。
mermaid.js もこの仕様も、それを読みません
（[`style` と `classDef` の行](../common.ja.md#style-行と-classdef-行) を参照）。
この規則は、`style A fill:#f00;` のように色を終える `;` が、
色を実体にしないためのものです。

規則はテキストだけを見るので、無視される `;` は行のどこにでもありえます。
ラベルの中、2 つの語の間、
名前、数、キーワード、矢印、区切り記号の中です。
この文書は、最後のものについてのものです。
ここでの名前は空白のない名前です。
sequence 図の参加者の id やクラスの名前のような、空白を含みうる名前は、
テキストとして読まれ、無視される `;` を持てます。

## 差

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
差は一方向だけです。
この仕様は、mermaid.js が拒否する入力を受理することはなく、
どちらも受理する入力には、すべて同じ Db を与えます。

state 図では、無視される `;` がこれらの中にある行は見つかりませんでした。
`style`、`:`、`#` を持てる文は、行の残りをテキストとして読むからです。

各図の文書は、これがどこに表れるかを、既知の差の節に挙げています。
[flowchart](../diagrams/flowchart.ja.md#既知の差)、
[sequence](../diagrams/sequence.ja.md#既知の差)、
[class](../diagrams/class.ja.md#既知の差) です。

## mermaid.js がそう読む理由

mermaid.js は、図を読む前に、行のテキストから `;` を除きます
（[`encodeEntities()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L895-L917)）。
各図種の字句解析器は、その後に残ったテキストを読み、
`;` がどこにあったかを知りません。
名前や矢印がそのような `;` で分かれられることは、
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
これは既知の差の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

## 書き手にとっての結果

名前、数、キーワード、矢印、区切り記号の中の無視される `;` は、
この道具では拒否されます。
mermaid.js はそれを受理し、`;` がないものとして行を読みます。
どちらも同じに読む図を書くには、
`style` の規則に当たる行は `;` で終えるか、語の中に `;` を書かないでください。

## mermaid.js の文書と issue

- [flowchart](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L1237-L1237)
  の文書は、`;` を `style`、`classDef`、`linkStyle` の行の終わりにだけ示し、
  名前や矢印の中の `;` には触れていません。
- [Issue #1666](https://github.com/mermaid-js/mermaid/issues/1666)
  「Flowchart: linkStyle issues with hex colors」は、
  `#ff9900;` が実体として読まれて
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
