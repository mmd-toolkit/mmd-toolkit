# directive-as-token-boundary

英語版: [directive-as-token-boundary.md](./directive-as-token-boundary.md)

図種: すべて。
これは、この仕様の mermaid.js との
[既知の差](../known-divergences.ja.md) の 1 つです。

## 構文

ディレクティブは、`%%{init: {}}%%` のような、`%%{`、名前、`}%%` で、
図に設定を与えます（[ディレクティブ](../common.ja.md#ディレクティブ) を参照）。
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
キーワード、矢印、数、文字列のような、
`RawText` でも `Identifier` でもない単位の中のディレクティブです。

## 差

どの例も、図の全体です。

1. 文字列の中のディレクティブ:

   ```mmd
   flowchart LR
     A["a %%{init: {}}%% b"] --> B
   ```

2. 矢印の中のディレクティブ:

   ```mmd
   flowchart LR
     A-%%{init: {}}%%-->B
   ```

3. キーワードの中のディレクティブ:

   ```mmd
   sequenceDiagram
     parti%%{init: {}}%%cipant A
   ```

4. 関係の中のディレクティブ:

   ```mmd
   classDiagram
     A -%%{init: {}}%%-> B
   ```

5. id の中のディレクティブ:

   ```mmd
   sequenceDiagram
     Al%%{init: {}}%%ice ->> B: x
   ```

6. ラベルのテキストの中のディレクティブ:

   ```mmd
   flowchart LR
     A[x%%{init: {}}%%y]
   ```

| 例  | mermaid.js                       | この仕様 |
| --- | -------------------------------- | -------- |
| 1   | ラベル `a  b` を持つ頂点 A       | 拒否     |
| 2   | `A--->B` と同じ、A から B への辺 | 拒否     |
| 3   | 参加者 A                         | 拒否     |
| 4   | A から B への関係                | 拒否     |
| 5   | `Alice` から B へのメッセージ    | 同じ     |
| 6   | ラベル `xy` を持つ頂点 A         | 同じ     |

[fixture: common/directive-in-string] [fixture:
flowchart/div-directive-in-arrow-length] [fixture:
sequence/div-directive-in-keyword] [fixture: class/div-directive-in-line]
[fixture: sequence/lex-directive-in-id-run] [fixture:
common/directive-in-label-text]

つまり mermaid.js は、どの入力も、ディレクティブを除いたテキストとして読みます。
この仕様もそうしますが、
`RawText` でも `Identifier` でもない単位は、中にディレクティブを持てません。
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
差は一方向だけです。
この仕様は、mermaid.js が拒否する入力を受理することはなく、
どちらも受理する入力には、すべて同じ Db を与えます。

各図の文書は、これに当たるその図の単位を、既知の差の節に挙げています。
[flowchart](../diagrams/flowchart.ja.md#既知の差)、
[sequence](../diagrams/sequence.ja.md#既知の差)、
[class](../diagrams/class.ja.md#既知の差) です。

## mermaid.js がそう読む理由

mermaid.js は、図を読む前に、1 回のテキストの置き換えで、
テキスト全体からすべてのディレクティブを除きます
（[`processDirectives`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L33-L45)、
[`removeDirectives`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L200-L202)）。
各図種の字句解析器は、その後に残ったテキストを読み、
ディレクティブがどこにあったかを知りません。
キーワードや矢印がディレクティブで分かれられることは、
この処理の順から生じます。

## この仕様の規則と、その理由

この仕様では、ディレクティブはトークンの境界です。
その前と後のテキストは、mermaid.js と同じく、
つながっているものとして読まれるので、
id やラベルのテキストはディレクティブを持てます。
`RawText` でも `Identifier` でもない単位は、そのテキスト全体を表し、
その中のディレクティブは入力を拒否にします。

キーワード、矢印、数、文字列は、木の 1 つのトークンで、
そのテキストはその範囲の入力です。
その中のディレクティブは、トークンを分けるか、
そのテキストを入力と違うものにします。
木には、2 つに分かれたキーワードの形がありません。
mermaid.js がそのような入力を読めるのは、
読む前の段階としてディレクティブを除くからで、
仕様が構文の規則として述べるものではありません。
これは既知の差の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

## 書き手にとっての結果

キーワード、矢印、数、文字列の中のディレクティブは、この道具では拒否されます。
mermaid.js はそれを受理し、ディレクティブがないものとしてテキストを読みます。
文字列の中では、例 1 のように、ディレクティブの周りの空白が残ります。
どちらも同じに読む図を書くには、ディレクティブをそれぞれの行に置きます。

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
  flowchart の parser のテストには、ディレクティブが 1 つもありません。

## 件数と確かめ方

flowchart、sequence、class の受理される fixture のうち、
コメント、ディレクティブ、フロントマターがなく、差の印がないものから、
行の 2 つの文字の間のそれぞれに `%%{init: {}}%%` を差し込んで、
入力を作りました。
各図種から、そのうちの約 1,500 件を等間隔に取りました。
それぞれを mermaid.js とこの仕様の parser で読み、受理と Db を比べました。

| 図種      | 取った件数、作った件数のうち | mermaid.js は拒否、この仕様は受理 | 両方受理、Db が違う | mermaid.js は受理、この仕様は拒否 |
| --------- | ---------------------------: | --------------------------------: | ------------------: | --------------------------------: |
| flowchart |    101,449 件のうち 1,515 件 |                                 0 |                   0 |                               373 |
| sequence  |     36,588 件のうち 1,525 件 |                                 0 |                   0 |                               457 |
| class     |     50,706 件のうち 1,537 件 |                                 0 |                   0 |                               486 |

残りは、どちらも同じに読みます。

単位の中のディレクティブのためにこの仕様が拒否する入力のそれぞれについて、
parser の差分テストは、parser と、**参照入力**に対する mermaid.js を比べます。
参照入力は、ディレクティブを除き、その周りのテキストをつないだ入力です。
parser は、参照入力に、
mermaid.js が元の入力に与えるものを与えることになっています。
上の 1,316 件の違いのすべてで、そうなりました。
