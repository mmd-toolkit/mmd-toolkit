# Db の要約

英語版: [db-summaries.md](./db-summaries.md)

この文書は、`expected.json` の `db` の欄を説明します。
mermaid.js の Db の要約が何を持ち、図種ごとに何を捨てるかです。

## 要約とは

要約は構文が決める情報だけを、素の JSON で持ちます。
コレクションは宣言順の配列にし、`undefined` の欄は省き、
内部のカウンタと DOM の ID は捨てます。
正規化関数は `src/normalizers/` にあり、Db クラスごとに 1 つで、
`src/normalizers/index.ts` に図種 ID ごとに登録します。
各図種の要約の形は、`@mmd-toolkit/spec` の `docs/diagrams/<diagram>.md` の
「Db normalization」の節で定めます。

## 要約がまだない図種

正規化関数のない図種 ID では、`runMermaid()` は `db: null` を返します。
どの図種を載せてもよい `common/` では、生成器は `db: null` を記録します。
意味は「この図種には正規化関数がまだないので、要約していない」です。
図種自身の区分では、生成器は fixture を書きません。
その図種の正規化関数を足すと、再生成で `null` が要約に置き換わり、
差分として見えます。
実装は `db` が `null` のところでは Db を比べません。
ローダーは `common/` 以外の `db: null` を拒否します。

## flowchart

`normalizeFlowchart()`（`src/normalizers/flowchart.ts`）は、
`FlowDB` を共有する `flowchart-v2`、`flowchart-elk`、
`swimlane` の Db を要約します。
`FlowDB` がゲッターで公開するものを保ち、次のものを、
それぞれに書いた理由で捨てます。

- `vertices[].domId`: カウンタから作る DOM の ID で、描画にだけ使う。
- `classDefs[].textStyles`: 描画のために `styles` から導いた値
  （`color` を含む要素の `fill` を `bgFill` に置き換えたもの）。
- `vertices[].haveCallback`:
  サイト設定の `securityLevel: loose` のときだけ付く。
  click があったことは class `clickable` で分かる。
- click のコールバックの名前と引数: 閉包の中にしかない。
- 内部の管理用の値（`vertexCounter`、`subCount`、`posCrossRef` など）。
- style の各値の末尾の空白。
  対象は、`vertices[].styles`、`classDefs[].styles`、`edges[].style`、
  `edgeDefaults.style`。
  文法は、カンマや行末の前に書いた空白を値に含めるが、
  mermaid.js はそれをどこでも読まず、整形はこれらの行の末尾の空白を消す。
  消す文字は `String.prototype.trimEnd()` が消すもので、
  文法がそこに残しうる文字とちょうど一致する。
  値の先頭の空白は残す。
  Db を変えることがあるため
  （`linkStyle` は、`fill` で始まる値がないときに `fill:none` を足す）。

要約のそのほかの値:

- テキスト
  （ラベル、subgraph と図の題、`accTitle`、`accDescr`、ツールチップ）
  は HTML の無害化の前の値で、
  `vertices[].link` は書かれたとおりの URL（trim 済み）です。
  [expected-results.ja.md](./expected-results.ja.md) を参照してください。
- 節点の `icon`、`form`、`pos`、`img`、`constraint`、`assetWidth`、
  `assetHeight`、辺の `animate` と `animation`、subgraph の `metadata` は、
  `@{ ... }` のデータブロックだけが設定します。
  [embedded-data.ja.md](./embedded-data.ja.md) を参照してください。

## sequence

`normalizeSequence()`（`src/normalizers/sequence.ts`）は、
`sequence` の Db を要約します。
`SequenceDB` がゲッターで公開するものを保ちます。
actor（最初に足された順）、box、作られた actor と消された actor
（その文より前のメッセージの数とともに）、メッセージ、題です。
actor の box は、`boxes` の中の位置で表します。
次のものを、それぞれに書いた理由で捨てます。

- `messages[].id`: メッセージの位置を文字列にしたもの。
- `actors[].actorCnt` と `actors[].rectData`: 描画が埋めるもので、
  解析の直後は常に `null`。
- ノートの一覧: どのノートも、
  同じ文字列、配置、actor を持つ `NOTE` 型のメッセージでもある。
  描画はメッセージを読む。
- `sequenceNumbersEnabled`: 描画だけが有効にする。
  `autonumber` はメッセージになる。
- 内部の管理用の値。
  最後に足した actor、開いている box、最後に作られた actor と消された actor、
  設定から写した wrap の値。

要約のそのほかの値:

- actor、box、メッセージの `wrap` は、`wrap:` と `nowrap:` の接頭辞に従い、
  それがなければ設定に従う。
  設定は、サイト、フロントマター、ディレクティブの `wrap` か `sequence.wrap`。
- 題は、文法が渡したとおりに保つ。
  `title` の後の最初の空白より後ろの空白と、行末の空白も含む。
  空白だけの題も、描画にとっては題であり、そのための場所を取るので、
  空白は捨てない。
- actor の links と properties は、著者が JSON で書いたキーを持つ。
  `SequenceDB` はそれをキーごとに actor へ写す
  （[`insertLinks`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L488-L496)、
  [`insertProperties`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L512-L520)）。
  そのため、キー `__proto__` は項目を足さずに、
  オブジェクトのプロトタイプを置き換え、
  mermaid.js はそのプロトタイプの項目も読む。
  要約は、そのようなプロトタイプを最初の項目 `__proto__` として記録する。
- actor の `type` と説明は、その `@{ ... }` のデータブロックでも決まる。
  [embedded-data.ja.md](./embedded-data.ja.md) を参照。
