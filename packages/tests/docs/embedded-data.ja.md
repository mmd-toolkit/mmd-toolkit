# 埋め込まれたデータから導く値

英語版: [embedded-data.md](./embedded-data.md)

この文書は、
`resolveEmbeddedData()` と `runMermaidWithEmbeddedData()` が実装に渡す値と、
それと比べて確かめられることを説明します。

## 実装がそれを必要とする理由

仕様は、埋め込まれたデータ
（フロントマターの YAML、ディレクティブの中身、`@{ ... }` のデータブロック）
を不透明なものとして扱います。
パーサーはそれを解析も検査もしません（既知の差 `embedded-data-opaque`）。
それでも Db の一部の値はそのデータに左右されます。
例えば subgraph の向きは `flowchart.inheritDir` に、
title はフロントマターの `title` に左右され、
データブロックだけが設定する欄（`icon`、`animate`、`metadata` など）もあります。
それらを作るために、実装のテストは mermaid.js から値を受け取ります。

- `resolveEmbeddedData(text, { config })` は
  `{ config, title, dataBlockEffects }` を返す。
  mermaid.js がテキストを拒否したときは、
  比べる mermaid.js の Db がないので `undefined` を返す。
- `runMermaidWithEmbeddedData(text, { config })` は、
  `runMermaid()` の結果とこれらの値を 1 回の実行で返す。
- 変異差分テストは、同じ値を比較対象の 3 つ目の引数として渡す
  （[mutation-testing.ja.md](./mutation-testing.ja.md) を参照）。

これらの値はどれも `expected.json` には保存しません。
設定の全体は大きく、
mermaid.js の既定値が変わるとすべての fixture に差分が出るためです。

## `config` と `title`

- `config` は、mermaid.js がそのテキストを解析するときの設定の全体です。
  mermaid.js の既定値、サイト設定、フロントマターの `config`、
  ディレクティブを mermaid.js 自身が合成したもので、
  `mermaid.parse()` の直後に `mermaidAPI.getConfig()` で読みます。
  図種ごとの見た目の既定値（`look` など）は含みません。
  Db の要約には影響しません。
- `title` は、`render()` が Db に渡すのと同じフロントマターの title です
  （[expected-results.ja.md](./expected-results.ja.md) を参照）。

## `dataBlockEffects`

`dataBlockEffects` は、各 `@{ ... }` のデータブロックが Db に何をしたかを、
mermaid.js がブロックを適用した順に並べた一覧です。
その順はソース順であるはずで、実装のテストが、一覧の要素の数と id の並びを、
実装が見つけたブロックと比べて確かめます。

flowchart では、`A@{ ... }@{ ... }` のように間を空けずに続くブロックは、
1 つと数えます。
文法がそれらの中身を連結して、1 回の呼び出しで渡すためです
（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L396-L401)）。

要素は `{ id, set }` です。

- `id` は、ブロックの直前に書いた id。
- `set` は、ブロックが効いた要素の要約の欄のうち、
  そのブロックが変えたものとその新しい値（何も変えなかったときは `{}`）。

実装は、構文から Db を組み立て、データブロックのところで、
そのブロックが属する要素に次の要素を適用します。

テキストにデータブロックがないとき、また、Db のパッチがまだ記録しない図種では、
一覧は空です。

### 記録のしかた

flowchart の Db のパッチが、
[`FlowDB.addVertex`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L127-L277)
を包んで記録します。
文法はブロックを、要素を作る呼び出し
（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L464-L465)）
の後に、それだけの `addVertex` の呼び出しで渡します
（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L403-L421)）。
パッチは、その呼び出しの前後ですべての要素の要約を比べます。
ブロックの中身も、それについての mermaid.js の規則も読みません。

sequence の Db のパッチは、
[`SequenceDB.addActor`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L155-L231)
を包んで記録します。
文法は参加者のブロックを、その参加者を足すのと同じ呼び出しで渡します
（[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L358-L367)、
[`SequenceDB.apply`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L578-L580)）。
そのため、パッチはその呼び出しを、まずブロックなしで 1 回実行し、
すべての actor と box の要約を取っておきます。
次に Db の一覧を元に戻し、mermaid.js が行ったとおりの呼び出しを実行します。
2 回の実行で違う欄が、ブロックの効果です。
ブロックの中身も、それについての mermaid.js の規則も読みません。

ブロックが要素を作ったり消したり、2 つ以上の要素を変えたりしたとき、
またブロックなしでは参加者を足せないときは、推測せずに実行を失敗させます。
mermaid.js の解析中にパッチが例外を投げると、
`mermaid.parse()` はそれを入力の拒否として報告してしまうので、
パッチは問題を記録しておき、
その Db の効果を読むときに例外を投げます（`src/normalizers/data-blocks.ts`）。

### データブロックだけが設定する欄

要約の欄には、データブロックだけが設定するものがあります。
flowchart では、節点の `icon`、`form`、`pos`、`img`、`constraint`、
`assetWidth`、`assetHeight`、辺の `animate` と `animation`、
subgraph の `metadata` です。
データブロックを読まない実装はこれらを `dataBlockEffects` を通じてだけ得るので、
これらは mermaid.js の側でしか検査されません。
sequence 図には、そのような欄はありません。
ブロックは actor の `type` と説明を決めますが、
それはキーワード（`participant`、`actor`）と別名でも決まります。

### それと比べて確かめられること

これらの値を使うと、実装のテストは次を確かめます。

- ブロックの位置と順序。
- 各ブロックが効く要素。
  一覧の要素はそれを示さないので、違う要素を選ぶと Db が違ってくる。
- ブロックの前後で構文が決める欄。
- 構文とブロックが適用される順序。

次は確かめません。
mermaid.js が計算したとおりに届きます。

- ブロックの中身から値への変換。
  例えば `shape` から `type`、`w` から数値、
  `label` だけのときに `labelType` が `markdown` になること。
- 中身が正しいかどうか（壊れた YAML や未知の shape）。
  既知の差 `embedded-data-opaque` に当たる。
- そのときの要素の状態で変わる効果。
  `icon` や `img` が `text` を空にするのは、`text` が id と同じときだけ。
