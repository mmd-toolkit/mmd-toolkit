# 埋め込まれたデータから導く値

英語版: [embedded-data.md](./embedded-data.md)

この文書は、入力の埋め込まれたデータから mermaid.js が導く値と、
fixture がそれを記録する方法と、それと比べて確かめられることを説明します。

## 実装がそれを必要とする理由

仕様は、埋め込まれたデータ（フロントマターの YAML、ディレクティブの中身、
`@{ ... }` のデータブロック）を不透明なものとして扱います。
パーサーはそれを解析も検査もしません（既知の差異 `embedded-data-opaque`）。
それでも Db の一部の値はそのデータに左右されます。
例えば subgraph の向きは `flowchart.inheritDir` に、
title はフロントマターの `title` に左右され、
データブロックだけが設定する欄（`icon`、`animate`、`metadata` など）もあります。
それらを作るために、実装は fixture から値を受け取ります。

## 値のある場所

`expected.json` の受理の結果（と `specified.json`。
[expected-results.ja.md](./expected-results.ja.md) を参照）は、
欄 `embedded`（`{ config?, title?, dataBlockEffects? }`）を持つことがあります。
入力がその値を与えないときは、その欄を置かず、
どれも与えないときは `embedded` を置きません。
受理する fixture は、入力にデータブロックか、フロントマターの `title` か、
設定を変えるフロントマターまたはディレクティブがあるとき、これを持ちます。
残りは埋め込まれたデータから何も要りません。
specified の読みは、自分の `embedded` を持つことがあります。
mermaid.js が入力を拒否するとき、その読みが、
ディレクティブの設定やデータブロックの効果を持つ場合です。
[fixture: class/div-comment-then-directive-line-sets-config]
[fixture: sequence/div-comment-after-number-with-data-block]

- `title` と `dataBlockEffects` は、下に書く値です。
- `config` は、設定の全体ではなく、入力が mermaid.js の設定に起こす変更です。
  設定の全体は大きく（23 KB）、ほとんどの fixture で同じだからです。
  何も変えないテキストに対する mermaid.js の設定を、
  fixture 自身の `config` で読んだものとの差です。
  実装は、キーを `embedded.config`、fixture の `config`、
  [`fixtures/default-config.json`](../fixtures/default-config.json)
  の既定値（`getDefaultConfig()`）の順に探します。
  オブジェクトはキーごとに重ね、配列とその他の値は置き換えます。

記録する設定の中では、非有限の数を、
予約した 1 欄のオブジェクト `{ "nonFinite": "Infinity" }`、
`{ "nonFinite": "-Infinity" }`、 `{ "nonFinite": "NaN" }` で表します。
配列の要素を含め、入れ子の中にも同じ形を使います。
有限の数は JSON の数のままです。
`"Infinity"`、`"-Infinity"`、`"NaN"` などの文字列は文字列のままです。
印のある値は重ねる前に数へ戻すので、普通のオブジェクトとして結合せず、
値を置き換えます。
`getDefaultConfig()` と `embeddedValuesOf()` は、
`dbFromTree()` に数の値を渡します。
[fixture: packet/config-frontmatter-row-infinity]
[fixture: packet/config-frontmatter-row-negative-infinity]
[fixture: packet/config-frontmatter-row-nan]
[fixture: packet/config-frontmatter-row-infinity-string]
[fixture: packet/config-init-row-overflow]
[fixture: packet/config-init-row-infinity-word-string]

`embeddedValuesOf(fixture)` は、これらの値を fixture から作ります。
既定値に、fixture の `config`、`embedded.config` の順に重ねます。
入力が `theme` を変えると、mermaid.js は `themeVariables` を計算し直して、
そのキーのいくつかを落とすことがあります。
差は、落とされたキーを記録しないので、作った設定には、
mermaid.js 自身の設定にないキーが残ることがあります。
受理する fixture のうち 16 件がそうです。
Db の値は、それらのキーに左右されません。

`@mmd-toolkit/tests/mermaid` の関数は、設定の全体を含む値を、
どのテキストにも返します。

- `resolveEmbeddedData(text, { config })` は
  `{ config, title, dataBlockEffects }` を返す。
  mermaid.js がテキストを拒否したときは、
  比べる mermaid.js の Db がないので `undefined` を返す。
- `runMermaidWithEmbeddedData(text, { config })` は、
  `runMermaid()` の結果とこれらの値を 1 回の実行で返す。

生成器は、これらから fixture の値を記録し、 `fixtures:check` が、
記録した値を mermaid.js と比べます。

## `config` と `title`

- 全体の `config` は、mermaid.js がそのテキストを解析するときの設定で、
  [configuration.ja.md](./configuration.ja.md) が述べる手順で導かれます。
  `mermaid.parse()` の直後に `mermaidAPI.getConfig()` で読みます。
  図種ごとの見た目の既定値（`look` など）は含みません。
  Db の要約には影響しません。
  実行時に返す設定では、非有限の数もメモリ上の数として保ち、
  生成器が設定を JSON に記録するときだけ印を付けます。
- `title` は、
  `render()` が Db に渡すのと同じフロントマターの title
  です（[expected-results.ja.md](./expected-results.ja.md) を参照）。

## `dataBlockEffects`

`dataBlockEffects` は、各 `@{ ... }` のデータブロックが Db に何をしたかを、
mermaid.js がブロックを適用した順に並べた一覧です。
その順はソース順であるはずで、実装のテストが、一覧の要素の数と id の並びを、
実装が見つけたブロックと比べて確かめます。

flowchart では、`A@{ ... }@{ ... }` のように間を空けずに続くブロックは、
1 つと数えます。
文法がそれらの中身を連結して、
1 回の呼び出しで渡すためです（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L396-L401)）。

kanban の 1 つのノードに隣り合う `@{ ... }` ブロックは、
中身を連結した 1 つの接尾部として読み、
そのグループに 1 つの効果を記録します。
[fixture: kanban/db-metadata-adjacent-comma]
[fixture: kanban/db-metadata-adjacent-empty]
[fixture: kanban/db-metadata-two-items]
[fixture: kanban/gram-metadata-two-blocks] [fixture: kanban/db-metadata-all]

要素は `{ id, set }` です。

- `id` は、ブロックの直前に書いた id。
- `set` は、ブロックが効いた要素の要約の欄のうち、
  そのブロックが変えたものとその新しい値（何も変えなかったときは `{}`）。

実装は、構文から Db を組み立て、データブロックのところで、
そのブロックが属する要素に次の要素を適用します。

テキストにデータブロックがないとき、また、Db のパッチがまだ記録しない図種では、
一覧は空です。

usecase の JSON 表は、Mermaid が読んだ値とプロパティ順の全体を、
空オブジェクトも含め `{ id, set: { value, propertyOrder } }` として記録します。
effect は JSON 宣言の記述順で、前方参照があると Db の Map 順と異なります。
ネイティブな usecase メタデータは構文であり、この effect を持ちません。
usecase のパッチは `commit` で公開モデルを捕捉し、JSON 文をソース順にたどって、
Mermaid が読んだ値を取得します。
JSON の内部を読み直しません。
`clear` は effect をリセットします。 [fixture: usecase/gram-json-empty]
[fixture: usecase/db-json-source-map-order]
[fixture: usecase/db-native-metadata-not-yaml]

### 記録のしかた

flowchart の Db のパッチが、
[`FlowDB.addVertex`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L127-L277)
を包んで記録します。
文法はブロックを、
要素を作る呼び出し（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L464-L465)）の後に、
それだけの `addVertex` の呼び出しで渡します（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L403-L421)）。
パッチは、その呼び出しの前後ですべての要素の要約を比べます。
ブロックの中身も、それについての mermaid.js の規則も読みません。

sequence の Db のパッチは、
[`SequenceDB.addActor`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L155-L231)
を包んで記録します。
文法は参加者のブロックを、
その参加者を足すのと同じ呼び出しで渡します（[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L358-L367)、
[`SequenceDB.apply`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L578-L580)）。
そのため、パッチはその呼び出しを、まずブロックなしで 1 回実行し、
すべての actor と box の要約を取っておきます。
次に Db の一覧を元に戻し、mermaid.js が行ったとおりの呼び出しを実行します。
2 回の実行で違う欄が、ブロックの効果です。
ブロックの中身も、それについての mermaid.js の規則も読みません。

kanban の Db のパッチは
[`addNode()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L99-L165)
を包みます。
文法はノードを追加する同じ呼び出しにブロックを渡します（[`kanban.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/parser/kanban.jison#L126-L133)）。
その呼び出しをブロックなしとありで実行した後のノードの要約を比べます。
共有 Db の状態はモジュール変数にあるため、 Db を消去し、
元のノード追加と装飾の呼び出しでそれまでの状態を復元します。
次の解析の前に Db の `clear()` とともに記録した効果と問題も消します。
[fixture: kanban/db-metadata-all] [fixture: kanban/db-metadata-repeated-id]
[fixture: kanban/db-decoration-icon-twice] [fixture: kanban/header-only-lf]

ブロックが要素を作ったり消したり、2 つ以上の要素を変えたりしたとき、
またブロックなしでは参加者や kanban のノードを足せないときは、
推測せずに実行を失敗させます。
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
ブロックは actor の `type` と説明を決めますが、それはキーワード（`participant`、
`actor`）と別名でも決まります。

kanban の `ticket`、`priority`、`assigned` はブロックだけが設定し、
`label` はノードの説明でも決まり、`icon` はアイコン装飾でも設定できます。
ノードの要約が公開する欄だけが効果に加わるため、列の `assigned`、`priority`、
`icon` と固定の `shape` は何も加えません。 [fixture: kanban/db-metadata-all]
[fixture: kanban/db-metadata-section-assigned]
[fixture: kanban/db-metadata-section-priority]
[fixture: kanban/db-metadata-section-icon]
[fixture: kanban/db-metadata-shape-lower]
[fixture: kanban/db-decoration-icon-twice]

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
  既知の差異 `embedded-data-opaque` に当たる。
- そのときの要素の状態で変わる効果。
  `icon` や `img` が `text` を空にするのは、`text` が id と同じときだけ。
