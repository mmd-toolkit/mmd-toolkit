# directive-as-token-boundary

英語版: [directive-as-token-boundary.md](./directive-as-token-boundary.md)

図種: すべて。
これは、この仕様の mermaid.js との
[既知の差異](../known-divergences.ja.md) の 1 つです。

## 構文

ディレクティブは、`%%{init: {}}%%` のような、`%%{` と名前で、
その後に引数が続くことがあり、ふつうは `}%%` で閉じます。
それは図に設定を与えます
（[ディレクティブ](../common.ja.md#ディレクティブ) を参照）。
ふつうは、ヘッダーの前の、それだけの行に書きます。

```mmd
%%{init: {"theme": "dark"}}%%
flowchart LR
  A --> B
```

[fixture: common/directive-init-theme]

mermaid.js は、図を読む前に、
どこにあってもすべてのディレクティブをテキストから除き、
その前と後のテキストをつなぎます。
この仕様も同じに読みます
（[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
を参照）。
例外が 1 つあり、この文書はそれについてのものです。
名前、キーワード
（sequence 図のメッセージの `wrap:` のような折り返しの接頭辞を含む）、
`:::` のような区切り記号、矢印、数の中のディレクティブです。
ここでの名前は、空白を含みうるかどうかにかかわらず、
図の文書が名前の単位と数えるものです。
U+00A0 を含みうる ER の実体の名前も、gantt の click の id も、その 1 つです。
sequence 図の参加者の id、クラスの名前、
`~` を使って書いた ER の属性の語、gantt のタスクの説明、
要求図の引用符なしの名前のように、
図の文書がテキストの単位と数える名前は、テキストとして読まれます。
[fixture: sequence/div-directive-in-wrap-prefix]
[fixture: sequence/lex-directive-in-participant-id]
[fixture: class/lex-directive-in-name]
[fixture: er/div-directive-in-name]
[fixture: er/lex-directive-in-tilde-word]
[fixture: gantt/div-directive-in-click-id]
[fixture: gantt/lex-directive-in-task-text]
[fixture: requirement/lex-directive-in-name]

kanban では `kanban`、形の開きと閉じ、`::icon(`、`:::`、
データの開き `@{` の中のディレクティブは拒否します。
mermaid.js は前後をつないで受理します。
[fixture: kanban/header-directive-inside]
[fixture: kanban/div-directive-opener]
[fixture: kanban/div-directive-closer]
[fixture: kanban/div-directive-icon-marker]
[fixture: kanban/div-directive-class-marker]
[fixture: kanban/div-directive-data-marker]

ノード本文、形の本文、icon 本文、class 本文、文字列、データ本文には、
ディレクティブを置けます。
[fixture: kanban/db-grid-directive-item-id]
[fixture: kanban/db-grid-directive-item-label-bare]
[fixture: kanban/db-grid-directive-item-icon]
[fixture: kanban/db-grid-directive-item-class]
[fixture: kanban/lex-label-directive-line]
[fixture: kanban/db-metadata-directive]
完全なデータブロックの間にはディレクティブを置けます
（[単位の中のディレクティブ](../diagrams/kanban.ja.md#単位の中のディレクティブ)
を参照）。
[fixture: kanban/db-metadata-adjacent-directive]

## 差異

どの例も、図の全体です。

1. キーワードの中のディレクティブ:

   ```mmd
   sequenceDiagram
     parti%%{init: {}}%%cipant A
   ```

2. 区切り記号の中のディレクティブ:

   ```mmd
   flowchart LR
     A::%%{init: {}}%%:c
     classDef c fill:#f00
   ```

3. 名前の中のディレクティブ:

   ```mmd
   flowchart LR
     A%%{init: {}}%%B-->C
   ```

4. 矢印の中のディレクティブ:

   ```mmd
   flowchart LR
     A-%%{init: {}}%%-->B
   ```

5. 数の中のディレクティブ:

   ```mmd
   sequenceDiagram
     autonumber 1%%{init: {}}%%0
     A->>B: x
   ```

6. 文字列の中のディレクティブ:

   ```mmd
   flowchart LR
     A["a %%{init: {}}%% b"]-->B
   ```

7. ラベルのテキストの中のディレクティブ:

   ```mmd
   flowchart LR
     A[x%%{init: {}}%%y]
   ```

| 例  | mermaid.js                              | この仕様 |
| --- | --------------------------------------- | -------- |
| 1   | 参加者 A                                | 拒否     |
| 2   | クラス c を持つ頂点 A                   | 拒否     |
| 3   | 頂点 `AB` から C への辺                 | 拒否     |
| 4   | `A--->B` と同じ、A から B への辺        | 拒否     |
| 5   | 10 から始まるメッセージの番号           | 拒否     |
| 6   | ラベル `a`、空白 2 つ、`b` を持つ頂点 A | 同じ     |
| 7   | ラベル `xy` を持つ頂点 A                | 同じ     |

[fixture: sequence/div-directive-in-keyword] [fixture:
flowchart/div-directive-in-style-separator] [fixture:
flowchart/div-directive-in-id] [fixture:
flowchart/div-directive-in-arrow-length] [fixture:
sequence/div-directive-in-number] [fixture: common/directive-in-string]
[fixture: common/directive-in-label-text]

つまり mermaid.js は、どの入力も、ディレクティブを除いたテキストとして読みます。
この仕様もそうしますが、
名前、キーワード、区切り記号、矢印、数は、
中にディレクティブを持てません。
そのような入力は拒否されます。
ディレクティブを除いたテキストを mermaid.js が拒否するときは、
どちらも入力を拒否します。
`flow%%{init: {}}%%chart LR` の後に行 `A-->` が続くものは、
mermaid.js では flowchart の文法が拒否し、
この仕様では、ディレクティブがヘッダーのキーワードの中にあるので拒否します。
[fixture: common/directive-splits-header-keyword]
同じヘッダーの後に行 `A-->B` が続けば、mermaid.js では flowchart になり、
この仕様では拒否されます。
[fixture: common/directive-in-header-keyword]
差異は一方向だけです。
この仕様は、mermaid.js が拒否する入力を受理することはなく、
どちらも受理する入力には、すべて同じ Db を与えます。

各図の文書は、これに当たるその図の単位を、既知の差異の節に挙げています。
[flowchart](../diagrams/flowchart.ja.md#既知の差異)、
[sequence](../diagrams/sequence.ja.md#既知の差異)、
[class](../diagrams/class.ja.md#既知の差異)、
[state](../diagrams/state.ja.md#既知の差異) です。

## 書き手にとっての結果

名前、キーワード、区切り記号、矢印、数の中のディレクティブは、
mmd-toolkit のパーサーでは拒否されます。
mermaid.js はそれを受理し、ディレクティブがないものとしてテキストを読みます。
どちらも同じに読む図を書くには、ディレクティブを独立した行に書きます。

## mermaid.js がそう読む理由

mermaid.js は、図を読む前に、1 回のテキストの置き換えで、
テキスト全体からすべてのディレクティブを除きます
（[`processDirectives`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L33-L45)、
[`removeDirectives`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L200-L202)）。
各図種の字句解析器は、その後に残ったテキストを読み、
ディレクティブがどこにあったかを知りません。
キーワードや矢印の途中にディレクティブを挟めるのは、
この処理の順から生じます。

## この仕様の規則と、その理由

この仕様では、ディレクティブはトークンの境界です。
その前と後のテキストは、mermaid.js と同じく、
つながっているものとして読まれるので、
テキスト、文字列、空白を含みうる名前はディレクティブを持てます。
名前、キーワード、区切り記号、矢印、数は、そのテキスト全体を表し、
その中のディレクティブは入力を拒否にします。

文字列は、もともと断片に切られることがあります。
コメント領域が文字列の中にあることがあり、
そのとき文字列は、領域の前と後の断片として読まれます。
文字列の中のディレクティブも同じように持たれ、
文字列の値は、コメント領域と同じく、それを除きます
（[ノード](../ast.ja.md#ノード) を参照）。
テキストは散文で、空白を含みうる名前も同じです。
その中のディレクティブも同じように持たれます。
この仕様は、名前、数、矢印、キーワード、区切り記号を、
ディレクティブで切りません。
どれも、そのテキスト全体として読まれます。
mermaid.js がその中のディレクティブを読めるのは、
読む前の段階としてディレクティブを除くからで、
仕様が構文の規則として述べるものではありません。
これは既知の差異の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

## mermaid.js の文書とテスト

- [ディレクティブ](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/config/directives.md)
  の文書は、どのディレクティブもそれだけの行に示し、
  トークンの中のディレクティブについては何も書いていません。
- mermaid.js のテストは、どのディレクティブもそれだけの行に置いています。
  固定した版の 287 の `*.spec.ts` と `*.spec.js` のファイルにある、
  37 の `%%{` のうち、34 はテストの入力にあり、
  どれも、字下げの後の、入力のその行の最初のものです。
  残りの 3 つは
  [`agentflow-comments.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow-comments.spec.ts)
  のコードのコメントにあります。
  テストの入力は、
  [`utils.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.spec.ts)、
  [`mermaidAPI.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.spec.ts)、
  [`comments.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.spec.ts)、
  [`config.appearance.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.appearance.spec.ts)、
  [`dagre/index.spec.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/rendering-util/layout-algorithms/dagre/index.spec.js)、
  [`sequenceDiagram.spec.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDiagram.spec.js)、
  [`radar.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/radar.spec.ts)、
  [`exampleConfig.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/.vitepress/theme/exampleConfig.spec.ts)
  にあります。
  mermaid.js の flowchart のパーサーのテストには、
  ディレクティブが 1 つもありません。
