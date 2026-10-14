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
各図種の要約の形は下に述べ、木からそれを作る手順は
[db-from-tree/](./db-from-tree/)（`flowchart.ja.md`、`sequence.ja.md`、
`class.ja.md`、`state.ja.md`、`er.ja.md`）にあります。

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

要約の欄は次のとおりです。

| 欄             | 内容                                                                                                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `direction`    | 図の方向。                                                                                                                                                                                                            |
| `title`        | フロントマターのタイトル。                                                                                                                                                                                            |
| `accTitle`     | アクセシビリティのタイトル。なければ空のテキスト。                                                                                                                                                                    |
| `accDescr`     | アクセシビリティの説明。なければ空のテキスト。                                                                                                                                                                        |
| `vertices`     | 頂点。加えた順。`id`、`labelType`、`styles`、`classes`、`text`、`type`、`props`、`link`、`linkTarget`、およびデータブロックだけが設定する欄 `icon`、`form`、`pos`、`img`、`constraint`、`assetWidth`、`assetHeight`。 |
| `edges`        | 辺。加えた順。`start`、`end`、`type`、`stroke`、`length`、`text`、`labelType`、`classes`、`isUserDefinedId`、`id`、`interpolate`、`style`、およびデータブロックだけが設定する `animate` と `animation`。              |
| `edgeDefaults` | `linkStyle default` による `interpolate` と `style`。設定されていなければそれぞれ null。                                                                                                                              |
| `classDefs`    | `classDef` で定めたクラス。定めた順。`id` と `styles`。                                                                                                                                                               |
| `subgraphs`    | subgraph。加えた順。`id`、`nodes`、`title`、`classes`、`labelType`、`dir`、およびデータブロックだけが設定する `metadata`。                                                                                            |
| `tooltips`     | ツールチップ。その id に最初にツールチップが与えられた順。`id` と `text`。                                                                                                                                            |
| `clickCalls`   | click のコールバックを結ぶ呼び出し。ソースの順で、コールバックを持つ click の id ごとに 1 つ。`id`、`name`、`args`。Db が受け取ったまま（下を参照）。なければ欄がない。                                               |

`normalizeFlowchart()`（`src/normalizers/flowchart.ts`）は、
`FlowDB` を共有する `flowchart-v2`、`flowchart-elk`、
`swimlane` の Db を要約します。
`FlowDB` がゲッターで公開するものを保ち、次のものを、
それぞれに書いた理由で捨てます。

- `vertices[].domId`: カウンタから作る DOM の ID で、描画にだけ使う。
- `classDefs[].textStyles`: 描画のために `styles` から導いた値
  （`color` を含む要素の `fill` を `bgFill` に置き換えたもの）。
- `FlowchartDirectionStatement` の `textBefore` と `textAfter`
  （[ast/flowchart.ja.md](../../spec/docs/ast/flowchart.ja.md#flowchartdirectionstatement)）
  :
  mermaid.js が読まない方向の行のテキスト。
- `vertices[].haveCallback`:
  サイト設定の `securityLevel: loose` のときだけ付く。
  click があったことは class `clickable` で分かる。
- click のコールバックの名前と引数は、Db の状態にありません。
  Db はそれらを閉包の中にだけ、`securityLevel: loose` のときだけ持ちます。
  要約は、代わりにそれらを `clickCalls` に持ちます。
  `FlowDB.setClickFun` の包み（`src/normalizers/click-calls.ts`）が、
  呼び出しを受けたとおりに記録します。
  Db が無視する呼び出し（頂点でない id、`loose` でない `securityLevel`）も
  記録します。
  `id` は渡された id、`name` は関数の名前、
  `args` は括弧の間のテキストを、両端の空白も含めて書かれたとおりにしたもの
  （括弧がないか、括弧の間が空白だけなら null）です。
  [fixture: flowchart/gram-click-call]
  [fixture: flowchart/db-click-callback-whitespace-arguments]
  [fixture: flowchart/lex-callback-blank-parentheses]
  [fixture: class/lex-callback-blank-parentheses]
  [fixture: flowchart/tokens-callback-name-trailing-space]
  [fixture: flowchart/tokens-callback-arguments-spaces-at-ends]
- 内部の管理用の値（`vertexCounter`、`subCount`、`posCrossRef` など）。
- style の各値の末尾の空白。
  対象は、`vertices[].styles`、`classDefs[].styles`、`edges[].style`、
  `edgeDefaults.style`。
  文法は、カンマや行末の前に書いた空白を値に含めるが、
  mermaid.js はそれをどこでも読まず、整形はこれらの行の末尾の空白を消す。
  消す文字は `String.prototype.trimEnd()` が消すもので、
  文法がそこに残しうる文字とちょうど一致する。
  木では、その空白は style の範囲の外にある
  （[db-from-tree/flowchart.ja.md](./db-from-tree/flowchart.ja.md) の
  **スタイルの文**を参照）。
  値の先頭の空白は残す。
  Db を変えることがあるため
  （`linkStyle` は、`fill` で始まる値がないときに `fill:none` を足す）。
  [fixture: flowchart/db-style-trailing-whitespace-characters]
  [fixture: flowchart/db-linkstyle-default-trailing-whitespace]

要約のそのほかの値:

- テキスト
  （ラベル、subgraph と図の題、`accTitle`、`accDescr`、ツールチップ）
  は HTML の無害化の前の値で、
  `vertices[].link` は書かれたとおりの URL（trim 済み）です。
  [expected-results.ja.md](./expected-results.ja.md) を参照してください。
  [fixture: flowchart/db-text-unsanitized-edge-label]
  [fixture: flowchart/db-text-unsanitized-subgraph-title]
  [fixture: flowchart/db-text-unsanitized-diagram-title]
  [fixture: flowchart/db-text-unsanitized-acc-title]
  [fixture: flowchart/db-text-unsanitized-acc-descr]
  [fixture: flowchart/db-text-unsanitized-tooltip]
- すべて空白の style は空のテキストになる。
  `style A fill:#f00, ` の style は `fill:#f00` と空のテキスト。
  [fixture: flowchart/gram-style-whitespace] [fixture:
  flowchart/db-style-whitespace-only-value] [fixture:
  flowchart/db-style-trailing-comma]
- こうすることで、`securityLevel` が `strict`、`loose`、`antiscript`、
  `sandbox` のどれかである限り、要約は `securityLevel` に依存しない。
  [fixture: flowchart/config-security-level-loose-click-call]
  [fixture: flowchart/config-security-level-loose-click-link-javascript]
- 節点の `icon`、`form`、`pos`、`img`、`constraint`、`assetWidth`、
  `assetHeight`、辺の `animate` と `animation`、subgraph の `metadata` は、
  `@{ ... }` のデータブロックだけが設定します。
  [embedded-data.ja.md](./embedded-data.ja.md) を参照してください。
  [fixture: flowchart/db-data-block-asset-width]

## sequence

要約の欄は次のとおりです。

| 欄                | 中身                                                                      |
| ----------------- | ------------------------------------------------------------------------- |
| `title`           | タイトル。                                                                |
| `accTitle`        | アクセシビリティのタイトル。なければ空のテキスト。                        |
| `accDescr`        | アクセシビリティの説明。なければ空のテキスト。                            |
| `actors`          | 参加者。最初に加えた順。                                                  |
| `boxes`           | 箱。ソースの順。`name`、`wrap`、`fill`、`actorKeys`。                     |
| `createdActors`   | 作られた参加者。`id` と `messageIndex`。                                  |
| `destroyedActors` | destroy された参加者。`id` と `messageIndex`。                            |
| `messages`        | メッセージ、ノート、autonumber の設定、活性化、ブロックの始まりと終わり。 |

参加者は、`name`、`description`、`wrap`、`prevActor`、`nextActor`、
`links`、`properties`、`type`、`box`（その箱の `boxes` の中の位置）を持ちます。
Db が設定しない欄は、要約にありません。

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
  [fixture: sequence/config-wrap-frontmatter]
  [fixture: sequence/config-sequence-wrap-frontmatter]
  [fixture: sequence/config-wrap-init-directive]
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

## class

要約の欄は次のとおりです。

| 欄           | 内容                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| `direction`  | 方向。方向の文が設定しなければ `TB`。                                                                           |
| `title`      | フロントマターのタイトル。なければ空のテキスト。                                                                |
| `accTitle`   | アクセシビリティのタイトル。なければ空のテキスト。                                                              |
| `accDescr`   | アクセシビリティの説明。なければ空のテキスト。                                                                  |
| `classes`    | クラス。最初に加えられた順。                                                                                    |
| `relations`  | 関係。ソースの順。                                                                                              |
| `notes`      | ノート。ソースの順。                                                                                            |
| `namespaces` | 名前空間。最初に加えられた順。                                                                                  |
| `interfaces` | lollipop の関係が加えるインターフェース。ソースの順。                                                           |
| `clickCalls` | click のコールバックを結ぶ呼び出し。ソースの順で、文の名前ごとに 1 つ。`id`、`name`、`args`。なければ欄がない。 |

クラスは、`id`、`type`、`label`、`text`、いつも `classBox` の `shape`、
`cssClasses`、`methods`、`members`、`annotations`、`styles` と、
設定されていれば `parent`、`link`、`linkTarget`、`haveCallback`、
`tooltip` を持ちます。
方法は、`memberType`（`method`）、`visibility`、`classifier`、`id`、
`parameters`、`returnType` を持ちます。
属性は `members` にあり、`memberType`（`attribute`）、`visibility`、
`classifier`、`id` を持ちます。
関係は、`id1`、`id2`、`type1`、`type2`、`lineType` を持つ `relation`、
`relationTitle1`、`relationTitle2` と、ラベルがあれば `title` を持ちます。
ノートは、`id`、`text` と、設定されていれば `class` と `parent` を持ちます。
名前空間は、`id`、`label`、その `classes`、`notes`、`children` の id、
`explicit` と、あれば `parent` を持ちます。
インターフェースは、`id`、`label`、`classId` を持ちます。

`normalizeClass()`（`src/normalizers/class.ts`）は、
`classDiagram` の Db を要約します。
mermaid.js は、`classDiagram` と `classDiagram-v2` のどちらも、
この ID として検出します。
`ClassDB` がゲッターで公開するものを、Db の持つ順に保ちます。
向き、題、class（メンバーとメソッドとともに）、関係、ノート、名前空間、
lollipop の関係が作るインターフェース（描画が描く）です。
名前空間は、その class、ノート、子の名前空間を id で挙げます。
次のものを、それぞれに書いた理由で捨てます。

- `classes[].domId` と `namespaces[].domId`: 数え上げから作る DOM の id で、
  描画にだけ使う。
- メンバーとメソッドの表示用の文字列（`text`）: ほかの欄から作る。
- `notes[].index`: ノートの id の番号と同じ。
- class の定義（`classDef`）: Db は、何も読まない private の表に持つ
  （[`ClassDB`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L40-L40)）。
  定義が変えるものは、`classes[].styles` に出る。
- click のコールバック: Db は、関数の名前と引数を閉包の中にだけ、
  `securityLevel: loose` のときだけ持ちます。
  要約は、代わりにそれらを `clickCalls` に持ちます。
  flowchart と同じく、`ClassDB.setClickFunc` の包みが記録し、
  クラスでない名前についても記録します。
  [fixture: class/db-callback-names-comma]
  [fixture: class/tokens-callback-name-trailing-space]
- style の各値の末尾の空白（`classes[].styles`）: flowchart の要約と同じ。
  文法はコンマや行末の前に書いた空白を値に残すが、何もそれを読まない。
  [fixture: class/db-style-trailing-whitespace-eol]
  [fixture: class/db-class-def-trailing-whitespace]

要約のそのほかの値:

- `classes[].text` は保つ。
  ラベルと型から作られるが、
  `addClass` は型を `&lt;T&gt;` と、ラベルの文は `<T>` と書く
  （[`addClass`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L112-L137)）
  ので、
  ラベルと型だけからは決まらない。
- `classes[].haveCallback` は保つ。
  flowchart と違い、`setClickEvent` はどの `securityLevel` でもこれを付ける
  （[`setClickEvent`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L434-L444)）。
  [fixture: class/config-security-level-loose-click]
- `classes[].link` は書かれたとおりの URL（trim 済み）、
  `classes[].linkTarget` は書かれた target か `_blank` で、
  どの `securityLevel` でも同じ
  （[expected-results.ja.md](./expected-results.ja.md) を参照）。
  [fixture: class/config-security-level-loose-click]

## state

要約の欄は次のとおりです。

| 欄            | 中身                                         |
| ------------- | -------------------------------------------- |
| `direction`   | 図の向き。                                   |
| `title`       | フロントマターのタイトルか、空のテキスト。   |
| `accTitle`    | アクセシビリティのタイトルか、空のテキスト。 |
| `accDescr`    | アクセシビリティの説明か、空のテキスト。     |
| `states`      | 状態。そのノードの順。                       |
| `notes`       | ノート。そのノードの順。                     |
| `transitions` | 遷移。ソースの順。                           |
| `classDefs`   | クラスの定義。最初の `classDef` の文の順。   |
| `links`       | 最上位の click の文。ソースの順。            |

状態は、`id`、`label`、`classes`、`styles` と、
設定されていれば `shape`、`description`、`parentId`、`dir` を持ちます
（[木から要約を作る](./db-from-tree/state.ja.md#木から要約を作る) を参照）。
ノートは、`state`、`position`、`text` を持ちます。
遷移は、`start`、`end`、`label` を持ちます。
クラスの定義は、`id` と `styles` を持ちます。
リンクは、`state`、`url`、`tooltip` を持ちます。

`normalizeState()`（`src/normalizers/state.ts`）は、
`stateDiagram` の Db を要約します。
mermaid.js は、`stateDiagram` と `stateDiagram-v2` のどちらも、
この ID として検出します。
要約の元は、描画が描くレイアウトのデータ
（[`getData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDb.ts#L763-L778)）
で、
mermaid.js は構文解析の間に、文からこれを作ります。
Db はほかに 2 つの形を持ちますが、どちらも要約しません。
文の木は、何も変えない文を持ちます
（複合状態の中の `classDef`、`class`、`style`、浮いたノート、`scale`）。
状態の表は最上位だけを持ちます。
[`extract`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDb.ts#L249-L272)
が最上位の文だけを読むためです。

要約は、レイアウトのデータの順に、次のものを保ちます。

- `states`: ノート以外のすべてのノード。
  `id`、`shape`、`label`、`description`、
  それが入る複合状態か領域（`parentId`）、
  複合状態と領域の向き（`dir`）を持つ。
  `classes` と `styles` は、状態の表がそのノードの id に与えるもの。
  [`dataFetcher`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/dataFetcher.ts#L250-L254)
  もそこから取る。
  表に項目のない状態は、どちらも持たない。
- `notes`: 各ノート。属する状態、`position`、`text` を持つ。
- `transitions`: 各遷移。`start`、`end`、`label` を持つ。
- `classDefs`: class の定義。`styles` を持つ。
- `links`: 各 click。状態と、
  書かれたとおりの `url` と `tooltip`（引用符を含む）を持つ。
- `direction`: 描画が使う向き。最上位の最後の `direction` の文から取る
  （[`getDir`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/dataFetcher.ts#L185-L195)）。
  最初のものを取る `getDirection()` は、描画が読まない。
- `title`、`accTitle`、`accDescr`。

次のものを、それぞれに書いた理由で捨てます。

- レイアウトのデータのうち、描くためだけの欄。
  DOM の id、辺の id、余白、角の半径、`look`、ラベルの種類と位置、
  mermaid.js が足す CSS のクラス名、複合状態のパレットの番号、矢印の印、
  `getData()` が設定から取る大きさ。
- 保つ値から作る値。
  ノードがグループかどうか（`shape` から）、
  ノードの class の style（`cssCompiledStyles`、`classDefs` から）、
  `classDefs[].textStyles`（`styles` から）、
  状態とそのノートを囲むグループ（ラベルと位置は最後のノートのもの）。

複合状態の最後の `--` の後の領域は、mermaid.js が無作為に作る id を持ちます
（[`docTranslator`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDb.ts#L366-L375)）。
これを、ノードの順に、
`generated-region-1`、`generated-region-2`、…… と記録します。
ノードの id、その領域の開始と終了の状態の id とラベル、`parentId`、
遷移の中など、現れるところすべてで同じです。
`--` が作る領域は、数え上げから付く id `divider-id-<番号>` のままです。

値は、Db が持つとおりに、空白も含めて記録します。
要約は、`look` では同じです。
`securityLevel` が `strict`、`loose`、`antiscript`、`sandbox` の
どれかなら同じで、
`htmlLabels` も、mermaid.js が文字を置き換えるのでなければ同じです。
ほかの `securityLevel` で HTML ラベルが有効なときは、
状態のラベルと説明、note のテキスト、遷移のラベルが置き換えた文字を持ちます
（[db-from-tree.ja.md](./db-from-tree.ja.md) の文字の置き換えを参照）。
[fixture: state/config-security-level-sandbox-click]
[fixture: state/config-look-hand-drawn]
[fixture: state/config-html-labels-false]
[fixture: state/config-security-level-other-description]
[fixture: state/config-security-level-other-note]
[fixture: state/config-security-level-other-transition-label]

## er

要約の欄は次のとおりです。

| 欄              | 内容                                                                         |
| --------------- | ---------------------------------------------------------------------------- |
| `direction`     | 方向。subgraph の外の `direction` の文が設定しなければ `TB`。                |
| `title`         | フロントマターのタイトル。なければ空のテキスト。                             |
| `accTitle`      | アクセシビリティのタイトル。なければ空のテキスト。                           |
| `accDescr`      | アクセシビリティの説明。なければ空のテキスト。                               |
| `entities`      | エンティティ。最初に現れた順。                                               |
| `relationships` | 関係。ソースの順。                                                           |
| `classes`       | クラスの定義。最初の `classDef` の順。                                       |
| `subGraphs`     | subgraph。終わった順。内側の subgraph は、それを囲む subgraph より前にある。 |

エンティティは、`id`、`name`、`alias`、`attributes`、`classes`、
`cssStyles` を持ちます。
属性は、`type`、`name`、`keys`、`comment` を持ちます。
関係は、`entityA`、`roleA`、`entityB`、`cardA`、`cardB`、`relType` を持ちます。
クラスの定義は、`id` と `styles` を持ちます。
subgraph は、`id`、`title`、`nodes`、`classes`、`cssStyles` と、
本体に `direction` の文があれば `dir` を持ちます。

`normalizeEr()`（`src/normalizers/er.ts`）は、`er` の Db を要約します。
`ErDB` が自分のリストに持つものを、持つ順のまま保ちます。
[`getData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts#L377-L459)
のレイアウトのデータは使いません。
これは、描画が描かないもの
（どのエンティティも使わないクラスの定義、subgraph の id を持つエンティティ）
を除き、ほかの値から作った値を加えるからです。
Db は、ブラウザーの機能も、時刻も、乱数も読まず、
構文にデータブロックもリンクもありません。
このため、要約に Db のパッチはいりません。
次のものを、それぞれに書いた理由で捨てます。

- `entities[].shape`、`look`、`labelType`: 固定の形 `erBox` とラベルの種類
  `markdown`、およびサイト設定の `look` で、描画にだけ使う。
- `entities[].label`: 名前で、要約が `name` として持っている。
- `entities[].cssClasses`: テキスト `default` に `classes` の名前を続けたもの。
  名前は `classes` にある。
- `classes[].textStyles`: `color` を含む style の `fill` を `bgFill` に
  置き換えたもので、`styles` だけから作る。
- `subGraphs[].labelType`: ラベルの種類 `markdown` で、文法は選ばない。
- id による subgraph の引き表、subgraph の数え上げ、
  構文解析中の subgraph の深さ:
  subgraph のリストから導けるか、構文解析の間だけ持つ。
- `getData()` が Db から作るもの。
  辺の id、矢印の種類と線の型、エンティティのコンパイル済みの style
  （`cssCompiledStyles`）、色の番号（`colorIndex`）。

値を、欄ごとに述べます。

**エンティティ**

- `id` は `entity-<名前>-<番号>` です。
  番号は、そのエンティティを作ったときにあったエンティティの数です。
  エンティティは、最初に現れた順に 0 から番号が付きます。
  現れる場所は、関係、ブロック、`:::` の文、subgraph の本体のどこでも同じです。
  関係は、エンティティを `id` で指します。
  [fixture: er/basic-entity]
  [fixture: er/db-entity-ids-first-appearance]
- `name` は、書かれたままの名前で、引用符を除いたものです。
  引用符で囲んだ名前は空白を保ち、`id` の中でも同じです。
  名前の引用符ありとなしは同じエンティティで、名前は大文字と小文字を区別します。
  [fixture: er/db-entity-name-quoted-spaces]
  [fixture: er/db-entity-name-quoted-same-as-bare]
  [fixture: er/db-entity-names-case]
  [fixture: er/db-relationship-quoted-entities]
- 名前は、字句解析が読んだとおりに記録します。
  数字だけでも、`-`、`.`、`*`、ASCII 以外の文字を含んでもよく、
  U+2028、U+2029、U+00A0 は名前の一部です。
  文の単位の間では、これらは空白ではありません。
  [fixture: er/db-entity-name-numbers]
  [fixture: er/db-entity-name-characters]
  [fixture: er/db-entity-name-line-separator]
  [fixture: er/db-entity-name-paragraph-separator]
  [fixture: er/db-entity-name-no-break-space]
  [fixture: er/db-entity-name-quoted-line-separator]
- エンティティ自身への関係は、両端が同じ `id` です。
  [fixture: er/db-entity-relationship-self]
- `alias` は `[alias]` のテキストで、なければ空のテキストです。
  最初の空でない alias が残ります。
  後の `A[second]` も、alias のない後の `A` も、何も変えません。
  alias なしで作ったエンティティは、後の文の alias を得ます。
  関係が作ったエンティティでも同じです。
  alias は名前です。
  引用符で囲んでも、数字でも、ハイフンを含んでもかまいません。
  [fixture: er/db-alias-first-kept]
  [fixture: er/db-alias-set-after-entity]
  [fixture: er/db-alias-after-relationship]
  [fixture: er/db-alias-with-attributes]
  [fixture: er/db-alias-with-class]
  [fixture: er/db-alias-empty-block]
  [fixture: er/db-alias-forms]
  [fixture: er/db-alias-first-kept-directive-line]

**属性**

- `attributes` は、書かれた順です。
  文法はブロックのリストを逆順に作り、
  [`addAttributes`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts#L95-L110)
  がそれを逆順に読むので、要約は書かれた順になります。
  2 度書かれた名前は 2 つ残ります。
  [fixture: er/db-attribute-order]
  [fixture: er/db-attribute-keys]
- 同じエンティティのブロックは足し合わさります。
  後のブロックは、同じ名前の属性も含め、前のブロックの後ろに属性を加えます。
  空のブロックは、`{}`、改行、空白のどれで書いても、エンティティを作って、
  何も加えません。
  属性のあるブロックの後でも同じです。
  ブロックは、そのエンティティを作った関係の後に来てもよく、
  1 行に書いてもかまいません。
  [fixture: er/db-attribute-blocks-add-up]
  [fixture: er/db-attribute-block-empty]
  [fixture: er/db-attribute-block-empty-after-attributes]
  [fixture: er/db-attribute-block-entity-from-relationship]
  [fixture: er/db-attribute-block-one-line]
  [fixture: er/db-attribute-blocks-add-up-comment-line]
- `keys` は、キー `PK`、`FK`、`UK` を書かれた順に並べたリストです。
  大文字と小文字は書かれたとおりで、2 度書かれたキーは 2 つ残ります。
  キーがなければ空のリストです。
  `comment` は、二重引用符の間のテキストで、引用符を除き、空白は保ちます。
  コメントがないか空なら、空のテキストです。
  [fixture: er/db-attribute-keys]
  [fixture: er/db-attribute-keys-case]
  [fixture: er/db-attribute-defaults]
  [fixture: er/db-attribute-comment-with-keys]
  [fixture: er/db-attribute-comment-spaces]
  [fixture: er/db-attribute-comment-empty]
- `type` と `name` は、読まれたとおりの語です。
  型は、括弧の長さ（`string(30)`、`decimal(10,2)`）、`?`、
  ジェネリクスの印（`List~int~`、中に空白があってもよい）、角括弧を持てます。
  語は `_`、`-`、`.` を含み、`*` で始まってもかまいません。
  バッククォートの中では空白を含められ、バッククォート自体は語に入りません。
  語の中の U+2028 は、語の一部です。
  [fixture: er/db-attribute-type-length]
  [fixture: er/db-attribute-type-question-mark]
  [fixture: er/db-attribute-type-generic]
  [fixture: er/db-attribute-type-brackets]
  [fixture: er/db-attribute-name-characters]
  [fixture: er/db-attribute-backquoted]
  [fixture: er/db-attribute-name-line-separator]
- ブロックの中では、コメント行、ディレクティブの行、空行、空白だけの行は
  テキストではなく、CRLF と単独の CR は行を終えます。
  そこにある `direction RL` は、方向の文ではなく、
  型 `direction`、名前 `RL` の属性です。
  [fixture: er/db-attribute-block-comment-line]
  [fixture: er/db-attribute-block-directive-line]
  [fixture: er/db-attribute-block-empty-line]
  [fixture: er/db-attribute-block-whitespace-line]
  [fixture: er/db-attribute-block-crlf]
  [fixture: er/db-attribute-block-cr]
  [fixture: er/db-attribute-block-direction-text]
- `style`、その後に `#` が続く `:`、その後に `;` を含む行は、
  最後の `;` を
  [common.ja.md](../../spec/docs/common.ja.md) の行の規則が無視します。
  属性のコメントの中でも同じで、コメント `"style:#x;"` は `style:#x` です。
  [fixture: er/db-attribute-comment-ignored-semicolon]

**エンティティのクラスと style**

- `classes` は、`class` の文と `:::` がエンティティに与えた名前を、
  文の順に並べたものです。
  2 度与えられた名前は 2 つ残ります。
  `classDef` はいりません。
  [fixture: er/db-class-statement-ids]
  [fixture: er/db-class-statement-repeat]
  [fixture: er/db-class-without-class-def]
- `class A,B c` は、リストの各エンティティに `c` を与えます。
  エンティティでない名前には何も与えず、それを作りもしません。
  文の後で作ったエンティティは、そのクラスを持ちません。
  リストのコンマの前後の空白は関係なく、
  `default` という名前のクラスも、ほかと同じに記録します。
  [fixture: er/db-class-undefined-entity]
  [fixture: er/db-class-before-entity]
  [fixture: er/db-class-list-spaces]
  [fixture: er/db-class-named-default]
  [fixture: er/db-class-name-line-separator]
- `A:::c1,c2` は、エンティティ A を作って、リストのクラスを与えます。
  関係の最初のエンティティ、2 番目、または両方にも同じに与え、
  alias の後と、ブロックの前にも置けます。
  [fixture: er/db-class-separator]
  [fixture: er/db-class-separator-relationship-first]
  [fixture: er/db-class-separator-relationship-second]
  [fixture: er/db-class-separator-relationship-both]
  [fixture: er/db-class-separator-block]
- `cssStyles` は、エンティティの `style` の文の style を、
  コンマで分け、文の順に、すべての文について並べたものです。
  名前のリストを持つ文は、各名前に style を与えます。
  エンティティでない名前には何も与えず、それを作りもしません。
  文がエンティティより前にあっても同じです。
  [fixture: er/db-style-statement]
  [fixture: er/db-style-id-list-spaces]
  [fixture: er/db-style-undefined-entity]
  [fixture: er/db-style-before-entity]
  [fixture: er/db-style-non-ascii]
  [fixture: er/db-style-line-separator]
- style の後の `;` は文を終えます。
  行に `style`、その後に `#` が続く `:`、その後に `;` があるとき、
  たとえば `style A fill:#f00;` では、最後の `;` を行の規則が無視し、
  ないものとして読みます。
  無視するのは最後の 1 つだけです。
  `style A fill:#f00;stroke:#00f;` では、手前の `#f00;` は
  文字参照のエンティティ
  （[エンティティ](../../spec/docs/common.ja.md#エンティティ)）
  として読まれ、プレースホルダに置き換わります。
  [fixture: er/db-style-semicolon-separator]
  [fixture: er/db-style-ignored-semicolon]
  [fixture: er/db-style-ignored-semicolon-last-only]
  [fixture: er/db-style-ignored-semicolon-two-statements]

**関係**

- `entityA` と `entityB` は、エンティティの `id` です。
  関係は、まだないエンティティを作ります。
  その名前の subgraph が文より前に終わっていれば、
  端は代わりにその subgraph の id です（**subgraph** を参照）。
  関係はソースの順で、2 度書かれたものは 2 つ残ります。
  [fixture: er/db-relationship-source-order]
- `cardA` は線の右に書かれた多重度、`cardB` は左に書かれたものです。
  mermaid.js の名前のとおりで、`||--o{` では、
  `cardA` が `ZERO_OR_MORE`、`cardB` が `ONLY_ONE` です。
  書き方の意味は、どちら側でも同じです。
  [fixture: er/db-cardinality-sides]
  [fixture: er/db-cardinality-symbol-either-side]
- 多重度の書き方です。
  語の大文字と小文字は区別しません。
  - `ONLY_ONE`: `||`、`one`、`only one`、`1`。
    [fixture: er/db-cardinality-symbols-only-one]
    [fixture: er/db-cardinality-words-only-one]
    [fixture: er/db-cardinality-digit-one]
  - `ZERO_OR_ONE`: `|o`、`o|`、`zero or one`、`one or zero`。
    [fixture: er/db-cardinality-symbols-zero-or-one]
    [fixture: er/db-cardinality-words-zero-or-one]
  - `ZERO_OR_MORE`: `}o`、`o{`、`zero or more`、`zero or many`、`0+`、
    `many(0)`、`many`。
    [fixture: er/db-cardinality-symbols-zero-or-more]
    [fixture: er/db-cardinality-words-zero-or-more]
    [fixture: er/db-cardinality-plus]
    [fixture: er/db-cardinality-many-with-count]
    [fixture: er/db-cardinality-many]
  - `ONE_OR_MORE`: `}|`、`|{`、`one or more`、`one or many`、`1+`、
    `many(1)`。
    [fixture: er/db-cardinality-symbols-one-or-more]
    [fixture: er/db-cardinality-words-one-or-more]
    [fixture: er/db-cardinality-plus]
    [fixture: er/db-cardinality-many-with-count]
  - `MD_PARENT`: `-`、`.`、`|` の直前の `u`（`u--` や `u..`）と `U`。
    どちらの側にも書けます。
    右側では、その次の文字が次の名前を始めます。
    `A ||--u-B : x` は、右の濃度が `MD_PARENT` で、エンティティ `-B` です。
    [fixture: er/db-cardinality-parent]
    [fixture: er/db-cardinality-parent-uppercase]
    [fixture: er/lex-md-parent-right]
    [fixture: er/lex-md-parent-right-glued-name]
    [fixture: er/lex-md-parent-right-glued-dot]
    [fixture: er/lex-md-parent-both-glued]
  - 語が大文字や混ざった形でも同じです。
    [fixture: er/db-cardinality-words-case]
- `relType` は、`--` と `to` が `IDENTIFYING`、
  `..`、`.-`、`-.`、`optionally to` が `NON_IDENTIFYING` です。
  [fixture: er/db-cardinality-symbols-only-one]
  [fixture: er/db-relationship-type-to]
  [fixture: er/db-relationship-type-dots]
  [fixture: er/db-relationship-type-dot-dash]
  [fixture: er/db-relationship-type-dash-dot]
  [fixture: er/db-relationship-type-optionally-to]
  [fixture: er/db-relationship-words-to]
- `roleA` は役割で、どの関係にもあります。
  裸の語か、引用符で囲んだテキストで、囲んだ場合は引用符を除き、空白は保ちます。
  空のテキスト、`%`、アポストロフィ、ASCII 以外の文字も使えます。
  U+2028 は、裸の役割では役割の一部で、引用符で囲んだ役割ではそのまま残ります。
  [fixture: er/db-role-word]
  [fixture: er/db-role-quoted]
  [fixture: er/db-role-quoted-empty]
  [fixture: er/db-role-quoted-percent]
  [fixture: er/db-role-non-ascii]
  [fixture: er/db-role-line-separator]
  [fixture: er/db-role-quoted-line-separator]

**クラスの定義**

- `classes` は、`classDef` の名前ごとに 1 つ持ち、
  その名前の最初の定義の順に並べます。
  `styles` は、コンマで分けた項目を順に並べたもので、
  `color` を含むものも入ります。
  同じ名前の 2 つ目の `classDef` は、最初のものに style を加え、
  順は動かしません。
  名前のリストを持つ `classDef` は、各名前を定義します。
  どのエンティティも使わない定義も残り、`default` という名前も残ります。
  [fixture: er/db-class-def-styles]
  [fixture: er/db-class-def-several-styles]
  [fixture: er/db-class-def-twice]
  [fixture: er/db-class-def-ids]
  [fixture: er/db-class-def-unused]
  [fixture: er/db-class-def-default]
  [fixture: er/db-class-def-twice-empty-line]
- `style` と同じく、style の後の `;` は文を終えます。
  行に `classDef`、その後に `#` が続く `:`、その後に `;` があるとき、
  最後の `;` は行の規則が無視します。
  U+2028 は style の一部です。
  [fixture: er/db-class-def-semicolon-separator]
  [fixture: er/db-class-def-ignored-semicolon]
  [fixture: er/db-class-def-line-separator]

**subgraph**

- `id` は、見出しの id で、引用符を除いて前後の空白を取ったものです。
  引用符で囲んだ id は空白を保ちます。
  同じ id の subgraph が 2 つあってもよく、どちらもリストに入ります。
  [fixture: er/db-subgraph-id-quoted]
  [fixture: er/db-subgraph-id-trimmed]
  [fixture: er/db-subgraph-same-id-twice]
  [fixture: er/db-subgraph-nested-same-id]
- `title` は、角括弧の中の語を空白 1 つでつないだものです。
  各語は引用符で囲んでもよい名前で、語の間の空白は 1 つになります。
  文字の置き換えの後に、前後の空白を取ります。
  角括弧がなければ id です。
  [fixture: er/db-subgraph-title-words]
  [fixture: er/db-subgraph-title-quoted]
  [fixture: er/db-subgraph-title-spaces-collapse]
  [fixture: er/db-subgraph-title-quoted-and-bare]
  [fixture: er/db-subgraph-title-trimmed]
  [fixture: er/db-subgraph-title-line-separator]
  [fixture: er/db-subgraph-no-title]
- `nodes` は、本体にあるエンティティの名前と、その中の subgraph の id を、
  順に並べたものです。
  入れ子の subgraph は先に終わるので、それを囲む subgraph より前にリストされ、
  その id は囲む subgraph の node になります。
  [fixture: er/db-subgraph-empty]
  [fixture: er/db-subgraph-nested]
- node は、本体の文の値です。
  関係は 2 つの名前を、alias、ブロック、`:::` を持つエンティティは
  その名前を与えます。
  ほかの文も値を与えます。
  `class`、`classDef`、`style` は、その語自身を与えます。
  `accTitle`、`accDescr`、`accDescr` のブロックは、前後の空白を取ったテキストを
  与えます。
  `direction` の文は何も与えません。
  [fixture: er/db-subgraph-nodes-relationship]
  [fixture: er/db-subgraph-nodes-block]
  [fixture: er/db-subgraph-nodes-alias]
  [fixture: er/db-subgraph-nodes-class-separator]
  [fixture: er/db-subgraph-nodes-class-statement]
  [fixture: er/db-subgraph-nodes-class-def-statement]
  [fixture: er/db-subgraph-nodes-style-statement]
  [fixture: er/db-subgraph-nodes-acc-title]
  [fixture: er/db-subgraph-nodes-acc-descr-line]
  [fixture: er/db-subgraph-nodes-acc-descr-block]
  [fixture: er/db-subgraph-nodes-all-statements]
  [fixture: er/db-subgraph-direction-only]
- node は、書かれたまま、空白も含め、引用符を除いて残ります。
  前後の空白を取ったテキストが空のとき、
  本体の前の node の前後の空白を取ったテキストと等しいとき、
  前の subgraph がすでに持つときは、捨てます。
  入れ子の subgraph は先に終わるので、入れ子の中の名前は、
  それを囲む subgraph が同じ名前を書いても、囲む側の node になりません。
  [fixture: er/db-subgraph-nodes-untrimmed]
  [fixture: er/db-subgraph-nodes-blank-name]
  [fixture: er/db-subgraph-nodes-quoted-name]
  [fixture: er/db-subgraph-member-repeated]
  [fixture: er/db-subgraph-member-in-earlier]
  [fixture: er/db-subgraph-member-nested-and-outer]
- 本体のコメント行、ディレクティブの行、空行、空白だけの行は、
  テキストではありません。
  [fixture: er/db-subgraph-nodes-comment-line]
  [fixture: er/db-subgraph-nodes-directive-line]
  [fixture: er/db-subgraph-nodes-empty-line]
  [fixture: er/db-subgraph-nodes-whitespace-line]
- `dir` は、本体の最後の `direction` の文の値で、なければありません。
  入れ子の subgraph は、自分の `dir` を持ちます。
  subgraph の中の `direction` の文は、図の方向を設定しません。
  [fixture: er/db-subgraph-direction]
  [fixture: er/db-subgraph-direction-top-level]
  [fixture: er/db-subgraph-direction-nested]
- 関係の端は、その名前の subgraph が文より前に終わっていれば、
  subgraph の id になります。
  subgraph は終わるときに加わるので、その本体の中の関係はそうなりません。
  文は同じ名前のエンティティも作るので、
  描画はそれを描きませんが、エンティティは `entities` に残ります。
  node のない subgraph も同じです。
  subgraph が文より後に来るときは、端はエンティティです。
  [fixture: er/db-subgraph-relationship-after]
  [fixture: er/db-subgraph-relationship-before]
  [fixture: er/db-subgraph-relationship-inside]
  [fixture: er/db-subgraph-relationship-two-subgraphs]
  [fixture: er/db-subgraph-relationship-empty-subgraph]
- subgraph の `classes` と `cssStyles` は、その終わりより後の
  `class` の文、`:::`、`style` の文から来ます。
  その名前を持つエンティティと subgraph のすべてに適用されます。
  同じ id の subgraph が 2 つあれば最後のものに、
  エンティティも同じ名前を持てばそのエンティティにも適用されます。
  subgraph より前の文は何もせず、`style` の文はエンティティを作りません。
  [fixture: er/db-subgraph-class-statement]
  [fixture: er/db-subgraph-style-statement]
  [fixture: er/db-subgraph-class-before-definition]
  [fixture: er/db-subgraph-entity-and-subgraph-style]
  [fixture: er/db-subgraph-same-id-class-last]

**方向、タイトル、アクセシビリティのテキスト**

- `direction` は、subgraph の外の最後の `direction` の文の `TB`、`BT`、`RL`、
  `LR` のどれかです。
  語と値は、大文字と小文字のどれでもよく、値は大文字で記録します。
  文は、それらを含む行です。
  語の前や値の後のテキストは文の一部で、エンティティを作りません。
  [fixture: er/db-direction-values]
  [fixture: er/db-direction-case]
  [fixture: er/db-direction-line-text-before]
  [fixture: er/db-direction-line-text-after]
- `title` は、フロントマターからだけ来ます。
  文法には `title` の文の規則がありますがトークンがないので、
  行 `title My ER` は、エンティティ `title`、`My`、`ER` を作ります。
  [fixture: er/db-title-frontmatter]
  [fixture: er/db-title-frontmatter-quoted]
  [fixture: er/db-title-line-is-entities]
- `accTitle` は、`accTitle:` の後のテキストの前後の空白を取ったもので、
  後のものが前のものを置き換えます。
  コロンの後の空白は行終端を含むので、その行にテキストのない `accTitle:` は
  次の行を取ります。
  テキストの中のディレクティブは、その一部になりません。
  [fixture: er/db-acc-title-line]
  [fixture: er/db-acc-title-spaces]
  [fixture: er/db-acc-title-replaces]
  [fixture: er/db-acc-title-empty-takes-next-line]
  [fixture: er/db-acc-title-directive-in-text]
- `accDescr` は、`accDescr:` の後のテキストか、`accDescr { }` のブロックの
  テキストの前後の空白を取ったもので、どちらの形でも後のものが前のものを
  置き換えます。
  ブロックの行は改行でつなぎ、各行の先頭の空白を除くので、
  空行と空白だけの行は余分な改行を残しません。
  ブロックの中のコメント行とディレクティブの行はテキストではなく、
  U+2028 はそのまま残ります。
  [fixture: er/db-acc-descr-line]
  [fixture: er/db-acc-descr-block]
  [fixture: er/db-acc-descr-replaces]
  [fixture: er/db-acc-descr-block-comment-line]
  [fixture: er/db-acc-descr-block-directive-line]
  [fixture: er/db-acc-descr-block-empty-line]
  [fixture: er/db-acc-descr-block-whitespace-line]
  [fixture: er/db-acc-descr-block-line-separator]
- 行の規則は、これらの行にもほかの行と同じに働きます。
  `accTitle: style:#x;y;` では、最後の `;` を無視し、
  `#x;` は文字参照のエンティティとして読まれてプレースホルダに置き換わります。
  説明のブロックでも同じです。
  [fixture: er/db-acc-title-ignored-semicolon]
  [fixture: er/db-acc-descr-block-ignored-semicolon]
- 文の間のコメント行、ディレクティブの行、空行、空白だけの行は、
  テキストではありません。
  [fixture: er/db-comment-line]
  [fixture: er/db-directive-line]
  [fixture: er/db-empty-line]
  [fixture: er/db-whitespace-line]

値は、Db が持つとおりに記録します。
mermaid.js は 4 つのテキストを
[`sanitizeText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts#L351-L353)
に通します。
`title`、`accTitle`、`accDescr`、subgraph のタイトルです。
Db のほかのテキストは通さず、名前、alias、属性、役割、id、node、クラス、style は
書かれたままです。
要約は、`look`（`classic`、`handDrawn`、`neo`）では同じです。
`securityLevel` が `strict`、`loose`、`antiscript`、`sandbox` のどれかでも、
同じです。
ほかの `securityLevel` で HTML ラベルが有効なときは、
この 4 つのテキストが置き換えた文字を持ちます
（[db-from-tree.ja.md](./db-from-tree.ja.md#文字の置き換え)を参照）。
HTML ラベルが無効なときは持ちません。
[fixture: er/config-look-classic]
[fixture: er/config-look-hand-drawn]
[fixture: er/config-look-neo]
[fixture: er/config-security-level-strict-subgraph-title]
[fixture: er/config-security-level-loose-subgraph-title]
[fixture: er/config-security-level-antiscript-subgraph-title]
[fixture: er/config-security-level-sandbox-subgraph-title]
[fixture: er/config-security-level-other-subgraph-title]
[fixture: er/config-security-level-other-subgraph-title-words]
[fixture: er/config-security-level-other-subgraph-title-trimmed]
[fixture: er/config-security-level-other-subgraph-title-html-labels-false]
[fixture: er/config-security-level-other-diagram-title]
[fixture: er/config-security-level-other-acc-title]
[fixture: er/config-security-level-other-acc-descr]
[fixture: er/config-security-level-other-acc-descr-block]
[fixture: er/config-security-level-other-names-as-written]

## gantt

要約の欄は次のとおりです。

| 欄                  | 内容                                                                          |
| ------------------- | ----------------------------------------------------------------------------- |
| `dateFormat`        | 最後の `dateFormat` の文のテキスト。なければ空のテキスト。                    |
| `axisFormat`        | 最後の `axisFormat` の文のテキスト。なければ空のテキスト。                    |
| `tickInterval`      | 最後の `tickInterval` の文のテキスト。文がなければ欄もない。                  |
| `todayMarker`       | 最後の `todayMarker` の文のテキスト。なければ空のテキスト。                   |
| `includes`          | 含めるトークン。小文字で、文をまたいで併合する。                              |
| `excludes`          | 除くトークン。小文字で、文をまたいで併合する。                                |
| `inclusiveEndDates` | `inclusiveEndDates` の文があるか。                                            |
| `weekday`           | 最後の `weekday` の文の、週の最初の日。なければ `sunday`。                    |
| `weekend`           | 最後の `weekend` の文の、週末の最初の日。なければ `saturday`。                |
| `title`             | 最後の `title` の文のタイトル。なければフロントマターのタイトル、なければ空。 |
| `accTitle`          | アクセシビリティのタイトル。なければ空のテキスト。                            |
| `accDescr`          | アクセシビリティの説明。なければ空のテキスト。                                |
| `sections`          | section の名前。`section` の文ごとに 1 つで、ソースの順。                     |
| `tasks`             | タスク。ソースの順。                                                          |
| `links`             | タスクのリンク。`href` を持つ最初の `click` の順。                            |
| `clickCalls`        | `call` を持つ `click` の文。ソースの順。なければ欄もない。                    |

タスクは、`section`、`task`、`classes`、`raw`、`order` と、
テキストが設定すれば
`id`、`active`、`done`、`crit`、`milestone`、`vert` を持ちます。
`raw` は `startTime` と `endTime` を持ちます。
リンクは `id` と `url` を持ちます。
click の呼び出しは `id`、`name`、`args` を持ちます。

`normalizeGantt()`（`src/normalizers/gantt.ts`）は、`gantt` の Db を要約します。
Db は、すべての gantt 図が共有する
[1 つのオブジェクト](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDiagram.ts#L8-L10)
で、状態はモジュールの変数です。
`clear()` が、構文解析のたびにそれを初期化します。
そのためパッチ（`patchGanttDb()`）は、クラスではなくこのオブジェクトに掛けます。
パッチは、Db が返さないもの、変えて返すものを保ちます。

- タスク。
  Db はタスクを private な配列に持ち、その配列を返すのは
  [`getTasks()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L169-L181)
  だけです。
  `getTasks()` は、先にタスクの日付を計算します（後述）。
  パッチは、`clear()` の直後、配列が空のときにその配列を取り、
  要約は、
  [`addTask()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L557-L591)
  が作ったままのタスクを読みます。
- タスクの id。
  `clear()` はタスクを初期化しますが、
  id からタスクの位置への表は初期化しません。
  そのため、テキストが定義しない id が、前のテキストの古い id の位置にある
  タスクを見つけ、その id への `click` がそのタスクをリンクしてしまいます。
  パッチは `clear()` の前に、前のテキストの id の位置を、
  どのタスクよりも後ろへ動かします。
  こうして、テキストの Db は、それより前に構文解析したテキストに依存しません。
- リンク。
  `setLink()` は、`securityLevel` が `loose` でなければ、
  URL を `@braintree/sanitize-url` に通したものを保ちます。
  これはテキストが述べるものではなく、
  要約はどの `securityLevel` でも同じです
  （[expected-results.md](./expected-results.md) を参照）。
  パッチは URL を書かれたままで保ちます。これは `loose` で Db が保つものです。
  [fixture: gantt/config-security-level-strict-click-href]
  [fixture: gantt/config-security-level-sandbox-click-href]
- コールバックを結び付ける呼び出し。
  Db は関数名と引数をクロージャーに持ち、`securityLevel: loose` のときだけです。
  パッチは、文法が行った呼び出しをそれぞれ記録します
  （`src/normalizers/click-calls.ts` を参照）。
  [fixture: gantt/config-security-level-loose-click-call]
  [fixture: gantt/config-security-level-antiscript-click-call]

`weekend` には getter がありません。
それを使うメソッド
[`isInvalidDate()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L183-L201)
を通して読みます。
金曜日と、除くトークンとしての `weekends` を渡したとき、
週末が金曜日に始まる場合にだけ真を返します。

次のものを、それぞれに書いた理由で捨てます。

- タスクの日付（`startTime`、`endTime`、`renderEndTime`）と、
  どこまで計算したかを示すだけの欄（`processed`、`manualEndTime`）。
  描画が図を描くときに計算するもので、テキストの構文解析中には計算しません。
  計算するのは
  [`getTasks()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L169-L181)
  で、結果は、
  プロセスのタイムゾーン、
  実行した日
  （タスクでない id の後ろの開始と、タスクでない id までの終了は
  [今日](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L320-L322)になる）、
  `dayjs` が `dateFormat` をどう読むかに依存します。
  また、日付でない開始に対しては
  （[`Invalid date`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L346-L346)）
  例外を投げますが、テキストは受理されます。
  テキストが決めるのは日付の与え方、つまり `raw` で、
  日付そのものではありません。
  そのため要約は、どの日でも、どのタイムゾーンでも同じです。
  [fixture: gantt/db-task-start-after-unknown]
  [fixture: gantt/db-task-start-not-a-date]
  [fixture: gantt/db-task-end-until-unknown]
- `type`: section の繰り返し。
  `prevTaskId`: 前のタスクの id で、`raw.startTime` とタスクの順が与える。
  `raw.data`: data のテキストで、`raw`、`id`、タグがその読み。
- `topAxis`: これを設定するのはメソッド `enableTopAxis()` だけですが、
  文 `topAxis` が呼ぶのは
  [`yy.TopAxis()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L141-L141)
  で、Db にはありません。
  そのため mermaid.js はこの文を `TypeError` で拒否し、
  受理されるテキストでこのフラグを立てるものはありません。
  [fixture: gantt/db-top-axis-statement]
- `displayMode`: どの文も設定しない（描画が設定から読む）。
  `diagramId` と click の文の関数: 図を描くときに設定される。

値を、欄ごとに述べます。

**設定**

- `dateFormat`、`axisFormat`、`tickInterval`、`todayMarker` は、
  キーワードの後ろのテキストから、すぐ後ろの空白 1 文字を除いたものです。
  ほかの空白は、末尾のものも残ります。
  テキストは `#`、`;`、改行の手前で終わります。
  ただし `todayMarker` は `;` と改行の手前で終わり、`#` を含みます。
  その後ろは、それだけで 1 つの文として読まれます。
  `includes` と `excludes` のトークン（後述）の終わりも同じです。
  後の文は、前の文を置き換えます。
  [fixture: gantt/db-date-format-ends-at-hash]
  [fixture: gantt/db-date-format-ends-at-semicolon]
  [fixture: gantt/db-axis-format-ends-at-hash]
  [fixture: gantt/db-axis-format-ends-at-semicolon]
  [fixture: gantt/db-tick-interval-ends-at-hash]
  [fixture: gantt/db-tick-interval-ends-at-semicolon]
  [fixture: gantt/db-excludes-ends-at-hash]
  [fixture: gantt/db-excludes-ends-at-semicolon]
  [fixture: gantt/db-includes-ends-at-hash]
  [fixture: gantt/db-includes-ends-at-semicolon]
  [fixture: gantt/db-today-marker-holds-hash]
  [fixture: gantt/db-today-marker-ends-at-semicolon]
  [fixture: gantt/db-date-format]
  [fixture: gantt/db-date-format-extra-spaces]
  [fixture: gantt/db-date-format-last-wins]
  [fixture: gantt/db-axis-format]
  [fixture: gantt/db-tick-interval]
  [fixture: gantt/db-today-marker]
  [fixture: gantt/db-today-marker-off]
- `includes` と `excludes` はトークンのリストで、
  [`mergeTokens`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L133-L139)
  が作ります。
  各文のテキストを小文字にし、空白とコンマで分け、
  前の文のトークンに加えます。
  トークンは最初の位置に 1 度だけ置きます。
  [fixture: gantt/db-excludes-tokens]
  [fixture: gantt/db-excludes-merged-lines]
  [fixture: gantt/db-excludes-duplicates]
  [fixture: gantt/db-includes-tokens]
- `inclusiveEndDates` は、文があれば真です。
  [fixture: gantt/db-inclusive-end-dates]
- `weekday` は最後の `weekday` の文の日、
  `weekend` は最後の `weekend` の文の日で、
  テキストの大文字小文字にかかわらず小文字です。
  [fixture: gantt/db-weekday-last-wins]
  [fixture: gantt/db-weekend-friday]
  [fixture: gantt/db-weekend-saturday]

**テキスト**

- `title` は、`title` と空白の後ろのテキストで、`#` や `;` も含みます。
  `title` の文は、フロントマターのタイトルを置き換えます。
  [fixture: gantt/db-title-statement]
  [fixture: gantt/db-title-frontmatter]
  [fixture: gantt/db-title-statement-after-frontmatter]
- `accTitle` と `accDescr` は、文のテキストを trim したものです。
  ブロックの説明のテキストは改行を持ち、各改行の後ろの空白は除かれます。
  [fixture: gantt/db-acc-title]
  [fixture: gantt/db-acc-descr]
  [fixture: gantt/db-acc-descr-block]
- タイトルとアクセシビリティのテキストは `sanitizeText` を通ります。
  `securityLevel` が mermaid.js の値のどれでもなく、HTML のラベルが有効なら、
  文字を置き換えたものを持ちます
  （[db-from-tree.md](./db-from-tree.md) の文字の置き換えを参照）。
  section の名前とタスクの説明は変わりません。
  [fixture: gantt/config-security-level-other-title]
  [fixture: gantt/config-security-level-other-acc-title]
  [fixture: gantt/config-security-level-other-acc-descr]
  [fixture: gantt/config-security-level-other-names-as-written]

**section とタスク**

- `sections` は、各 `section` の文の、キーワードとすぐ後ろの空白 1 文字を除いた
  テキストを持ちます。名前が繰り返されても、文ごとに 1 つです。
  最初の section の前のタスクは、空の `section` を持ちます。
  [fixture: gantt/db-sections]
  [fixture: gantt/db-task-before-section]
- `task` は、コロンの前のテキストで、コロンの前の空白を含みます。
  [fixture: gantt/db-task-description-spaces]
- コロンの後ろの data は、タグ（後述）を除いてからコンマで項目に分けます。
  [`parseData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L497-L551)
  は、1 項目を終了、2 項目を開始と終了、
  3 項目を id、開始、終了と読みます。
  1 項目のとき開始は `prevTaskEnd` で、前のタスクの id を持ちます。
  最初のタスクには id がありません。
  [fixture: gantt/db-task-id-written]
  [fixture: gantt/db-task-forms]
  [fixture: gantt/db-task-empty-data]
- 4 項目以上のタスクは `id` を持たず、`raw` は開始も終了も持ちません。
  [fixture: gantt/db-task-four-items]
- 項目は trim し、書かれたままで保ちます。
  id の後ろの開始（`after a b`）、id までの終了（`until`）、
  日付や長さの終了があります。
  [fixture: gantt/db-task-after-ids]
  [fixture: gantt/db-task-end-until]
  [fixture: gantt/db-task-end-date]
- id のないタスクは、id のないタスクの中で
  [番号](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L430-L436)
  `task1`、`task2`、…を付けます。
  番号は各テキストで 1 から始まります。
  [fixture: gantt/db-task-id-numbered]
- タグは、小文字で書いた
  `active`、`done`、`crit`、`milestone`、`vert` のどれかで、
  先頭の項目がタグである間、
  [先頭から取り除かれ](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L846-L860)
  ます。
  タグは自分のフラグを立て（繰り返しても 1 回）、項目ではありません。
  ほかの位置のタグ、別の大文字小文字のタグは項目です。
  [fixture: gantt/db-task-tags]
  [fixture: gantt/db-task-tag-case]
  [fixture: gantt/db-task-tag-after-item]
  [fixture: gantt/db-task-tag-repeated]
- `order` は、タスクの中での番号で、0 から始まります。
  `vert` のタスクは -1 で、番号を取りません。
  [fixture: gantt/db-task-vert]
- `id` は一意ではありません。
  同じ id を持つ後のタスクを、`click` は見つけます。
  [fixture: gantt/db-task-duplicate-id]

**リンクと click**

- `click` の文は、その id のタスクに、
  `href` と `call` の 2 つの部分のそれぞれにつき 1 度、
  クラス `clickable` を `classes` に加えます。
  その時点でタスクでない id（未知の id、後で現れるタスク）には何もしません。
  [fixture: gantt/db-click-href]
  [fixture: gantt/db-click-call]
  [fixture: gantt/db-click-href-then-call]
  [fixture: gantt/db-click-call-then-href]
  [fixture: gantt/db-click-unknown-id]
  [fixture: gantt/db-click-before-task]
- `click` の id は、コンマで区切ったリストです。
  [fixture: gantt/db-click-ids-list]
- `links` は、`href` の URL を書かれたままで、タスクごとに 1 つ持ちます。
  位置は最初のリンクの位置で、URL は最後のリンクのものです。
  [fixture: gantt/db-click-links-order]
- `clickCalls` は、文法が行った呼び出しをそのまま持ちます。
  `id` は書かれたままの id のリスト（タスクでない id も含む）、
  `name` は関数、`args` は括弧の間のテキストを書かれたままで、
  なければ null です。
  [fixture: gantt/db-click-call-args]
  [fixture: gantt/db-click-ids-list]

値は、空白を含めて Db が持つままで記録します。

## journey

要約の欄は次のとおりです。

| 欄         | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| `title`    | 最後の `title` の文のタイトル。なければフロントマターのタイトル、なければ空。 |
| `accTitle` | アクセシビリティのタイトル。なければ空のテキスト。                            |
| `accDescr` | アクセシビリティの説明。なければ空のテキスト。                                |
| `sections` | section の名前。`section` の文ごとに 1 つで、ソースの順。                     |
| `tasks`    | タスク。ソースの順。                                                          |

タスクは、`section`、`task`、`people`、`score` を持ちます。

`normalizeJourney()`（`src/normalizers/journey.ts`）は、`journey` の Db を
要約します。
Db は、ブラウザーの機能も、時刻も、乱数も読まず、構文にリンクもありません。
このため、要約に Db のパッチはいりません。
Db は、すべての journey 図が共有する 1 つのオブジェクトで、
`clear()` が、構文解析のたびにその状態を初期化します。
[`getTasks()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L35-L47)
は、呼ぶたびに、タスクを自分の一覧に加えます。
そのため要約は、一覧を 1 度だけ読み、空に戻します。
こうして Db は、読む前のままになります。
次のものを、それぞれに書いた理由で捨てます。

- `tasks[].type`: section の繰り返し。
- `getActors()`
  （[`updateActors`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L49-L59)）:
  タスクの人たちから、重複を除いて並べ替えたもので、タスクだけから作る。

値を、欄ごとに述べます。

- `title` は、`title` と空白 1 文字の後ろのテキストで、`#` か行末までです。
  両端の空白は残ります。
  空白 2 つの `title  T` のタイトルは ` T` です。
  テキストの後ろの `;` は、入力を拒否させます。
  `;` がテキストを終わらせ、その後ろを受け取る規則がないからです。
  `title` の文は、フロントマターのタイトルを置き換えます。
  [fixture: journey/db-title-statement]
  [fixture: journey/lex-title-two-spaces]
  [fixture: journey/lex-title-trailing-spaces]
  [fixture: journey/db-title-ends-at-hash]
  [fixture: journey/lex-title-semicolon]
  [fixture: journey/db-title-frontmatter]
  [fixture: journey/db-title-statement-after-frontmatter]
- `accTitle` と `accDescr` は、文のテキストを trim したものです。
  ブロックの説明のテキストは改行を持ち、各改行の後ろの空白は除かれます。
  [fixture: journey/db-acc-title]
  [fixture: journey/db-acc-descr]
  [fixture: journey/db-acc-descr-block]
- タイトルとアクセシビリティのテキストは `sanitizeText` を通ります。
  `securityLevel` が mermaid.js の値のどれでもなく、HTML のラベルが有効なら、
  文字を置き換えたものを持ちます
  （[db-from-tree.md](./db-from-tree.md) の文字の置き換えを参照）。
  section の名前、タスクの説明、人は変わりません。
  [fixture: journey/config-security-level-other-title]
  [fixture: journey/config-security-level-other-diagram-title]
  [fixture: journey/config-security-level-other-acc-title]
  [fixture: journey/config-security-level-other-acc-descr]
  [fixture: journey/config-security-level-other-acc-descr-block]
  [fixture: journey/config-security-level-other-names-as-written]
- `sections` は、各 `section` の文の、キーワードとすぐ後ろの空白 1 文字を除いた
  テキストを持ちます。名前が繰り返されても、文ごとに 1 つです。
  最初の section の前のタスクは、空の `section` を持ちます。
  名前は `#` の手前で終わり、`#` から行末まではコメントです。
  `#` の前の空白は残り、名前の先頭の空白も残ります。
  空白だけの名前も名前です。
  名前の後ろの `;` と `:` は、入力を拒否させます。
  これらがテキストを終わらせ、その後ろを受け取る規則がないからです。
  [fixture: journey/db-sections]
  [fixture: journey/db-task-before-section]
  [fixture: journey/db-section-ends-at-hash]
  [fixture: journey/lex-section-two-spaces]
  [fixture: journey/lex-section-whitespace-only]
  [fixture: journey/lex-section-semicolon]
  [fixture: journey/lex-section-colon]
- `task` は、最初のコロンの前のテキストで、コロンの前の空白を含みます。
  テキストの前の空白は含みません。
  [fixture: journey/db-task-description-spaces]
  [fixture: journey/lex-whitespace-ideographic-space-around-task]
- [`addTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L61-L84)
  は、最初のコロンの後ろのテキストを、各コロンで分けます。
  `score` は、最初の部分から JavaScript が作る数です。
  そのため、小数、16 進数、指数、負の数は数で、
  数の前後の空白は数に含まれず、空の部分と空白だけの部分は 0 です。
  [fixture: journey/db-task-score-decimal]
  [fixture: journey/db-task-score-hexadecimal]
  [fixture: journey/db-task-score-exponent]
  [fixture: journey/db-task-score-negative]
  [fixture: journey/db-task-score-spaces]
  [fixture: journey/db-task-score-empty]
  [fixture: journey/gram-task-data-whitespace-only]
  有限の数でない score は、JSON にそのような数がないので、
  数のテキストで記録します。
  数でない部分は `NaN` です。
  部分 `Infinity` と `-Infinity`、
  `1e400` のように倍精度に収まらない大きな数は、
  `Infinity` か `-Infinity` です。
  [fixture: journey/db-task-score-not-a-number]
  [fixture: journey/db-task-score-infinity]
  [fixture: journey/db-task-score-negative-infinity]
  [fixture: journey/db-task-score-overflow]
- `people` は、2 番目の部分を各コンマで分けて trim したもので、
  名前の数はコンマの数より 1 つ多くなります。
  そのため空の項目は空の名前で、空白だけの部分は空の名前 1 つです。
  2 つ目のコロンがなければ、人はいません。
  2 つ目のコロンがあってその後ろが空なら、空の名前が 1 つです。
  3 つ目のコロンから後のテキストは除かれます。
  [fixture: journey/db-task-people]
  [fixture: journey/db-task-people-empty-item]
  [fixture: journey/db-task-people-blank]
  [fixture: journey/gram-task-people-trailing-comma]
  [fixture: journey/gram-task-second-colon-at-end]
  [fixture: journey/db-task-score-only]
  [fixture: journey/db-task-extra-colon]
  タスクのデータも `#` の手前で終わり、行の残りはコメントです。
  `A: 1: x #y, z` の人は `x` です。
  [fixture: journey/db-task-data-ends-at-hash]

値は、空白を含めて Db が持つままで記録します。

## requirement

要約の欄です。

| 欄              | 内容                                                  |
| --------------- | ----------------------------------------------------- |
| `direction`     | `TB`。direction の文があれば、最後の文の方向。        |
| `title`         | フロントマターのタイトル。なければ空のテキスト。      |
| `accTitle`      | アクセシビリティのタイトル。なければ空のテキスト。    |
| `accDescr`      | アクセシビリティの説明。なければ空のテキスト。        |
| `requirements`  | requirement。最初に定義された順。                     |
| `elements`      | element。最初に定義された順。                         |
| `relationships` | 関係。ソースの順。                                    |
| `classes`       | クラスの定義（`classDef`）。id が最初に定義された順。 |

requirement は `name`、`type`、`requirementId`、`text`、`risk`、`verifyMethod`、
`cssStyles`、`classes` を持ちます。
element は `name`、`type`、`docRef`、`cssStyles`、`classes` を持ちます。
関係は `type`、`src`、`dst` を持ちます。
クラスの定義は `id` と `styles` を持ちます。

`normalizeRequirement()`（`src/normalizers/requirement.ts`）が、
`requirement` の Db を要約します。
Db はブラウザの機能も、時刻も、乱数も読まず、構文にリンクもないので、
要約に Db のパッチは要りません。
読むのは Db 自身の一覧（`getRequirements()`、`getElements()`、
`getRelationships()`、`getClasses()`）で、
描画用のデータ
[`getData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L292-L342)
ではありません。
`getData()` は、保存された requirement と element のオブジェクトに欄を足し、
辺を作りますが、どれも一覧から作れるものです。
次を、それぞれの理由で除きます。

- requirement と element の `classes` の最初の名前 `default`。
  どれも、文が何であれ、これで始まります。
  文が与える名前はその後に続き、文が `default` を与えたときは、それが残ります。
- `classes[].textStyles`。
  色に触れるクラスのスタイルで、`styles` だけから作られます。
- `getData()` が Db から作るもの。
  ノードの `id`、`shape`、`look`、`cssClasses`、`colorIndex` と、
  辺の id、ラベル、矢印の種類、線の模様です。
  `look` はサイトの設定です。
- 読んでいる途中の requirement と element。
  定義が終わるごとに初期化されます。

欄ごとの値です。

- `direction` は、direction の文がなければ `TB` です。
  最後の direction の文が決め、大文字小文字を問わず書け、記録は大文字です。
  [fixture: requirement/db-direction-last-wins]
  [fixture: requirement/db-direction-lower-case]
  [fixture: requirement/spec-requirement-diagram-7522200d]
  [fixture: requirement/spec-requirement-diagram-08cfba06]
  [fixture: requirement/spec-requirement-diagram-34fcfcee]
  [fixture: requirement/spec-requirement-diagram-6d165a76]
- `title` はフロントマターのタイトルです。図にはそのための文がありません。
  `accTitle` と `accDescr` は、
  その種類の最後の文のテキストを trim したものです。
  ブロックの説明のテキストは改行を持ち、各改行の後ろの空白は除かれます。
  [fixture: requirement/db-frontmatter-title]
  [fixture: requirement/db-acc-title-descr]
  [fixture: requirement/db-acc-descr-block]
  [fixture: requirement/spec-requirement-diagram-e5ae8f38]
  [fixture: requirement/spec-requirement-diagram-27be7222]
- タイトルとアクセシビリティのテキストは `sanitizeText` を通ります。
  `securityLevel` が mermaid.js の値のどれでもなく、HTML のラベルが有効なら、
  文字を置き換えたものを持ちます
  （[db-from-tree.md](./db-from-tree.md) の文字の置き換えを参照）。
  requirement と element の名前、id、テキスト、type、参照、
  関係の名前、クラスは変わりません。
  [fixture: requirement/config-security-level-other-title]
  [fixture: requirement/config-security-level-other-acc-title]
  [fixture: requirement/config-security-level-other-acc-descr]
  [fixture: requirement/config-security-level-other-acc-descr-block]
  [fixture: requirement/config-security-level-other-html-labels-false]
  [fixture: requirement/config-security-level-other-names-as-written]
- どの値も[変換した形](../../spec/docs/common.ja.md#ソースの読み方)で読むので、
  エンティティは、名前、id、テキスト、type、参照、関係の名前、
  アクセシビリティのテキストのどれでも、プレースホルダです。
  [fixture: requirement/entity-placeholder-in-requirement-fields]
  [fixture: requirement/entity-placeholder-in-element-fields]
  [fixture: requirement/entity-placeholder-in-relationship]
  [fixture: requirement/entity-placeholder-in-acc-title]
  [fixture: requirement/entity-placeholder-in-acc-descr]
  [fixture: requirement/entity-placeholder-in-acc-descr-block]
- `requirements` は、名前ごとに 1 つの requirement を、
  最初の定義の順に持ちます。
  本体が設定しない欄は、空のテキストです。
  [fixture: requirement/db-requirement-defaults]
  [fixture: requirement/db-requirement-all-fields]
  [fixture: requirement/db-requirement-order]
- requirement の `type` は、定義を始める語に対応する名前です。
  `Requirement`、`Functional Requirement`、`Interface Requirement`、
  `Performance Requirement`、`Physical Requirement`、
  `Design Constraint` のどれかです。
  `risk` は `Low`、`Medium`、`High`、
  `verifyMethod` は `Analysis`、`Demonstration`、`Inspection`、`Test` です。
  構文の語は大文字小文字を問わず読み、Db はここに挙げた名前で持ちます。
  [fixture: requirement/db-keywords-upper-case]
  [fixture: requirement/spec-requirement-diagram-54ea0a9d]
  [fixture: requirement/spec-requirement-diagram-d1dc0373]
  [fixture: requirement/spec-requirement-diagram-17e0a905]
  [fixture: requirement/spec-requirement-diagram-f221edee]
  [fixture: requirement/spec-requirement-diagram-0e21244e]
  [fixture: requirement/spec-requirement-diagram-06f108a7]
  [fixture: requirement/spec-requirement-diagram-4a3ca536]
  [fixture: requirement/spec-requirement-diagram-f64fbd88]
  [fixture: requirement/spec-requirement-diagram-1a2f68fa]
  [fixture: requirement/spec-requirement-diagram-1e009b06]
- 引用符のない名前や値は、両端の空白を失い、中に空白を含められます。
  引用符のあるものは、引用符の間の文字を、引用符のないものが持てない文字も
  空白も、そのまま保ちます。
  [fixture: requirement/db-requirement-value-spaces]
  [fixture: requirement/db-requirement-name-spaces]
  [fixture: requirement/db-requirement-quoted-values]
- 欄を複数回設定したときは、最初の値が残ります。
  Db は本体の欄を、最後から最初の順に適用するためです。
  [fixture: requirement/db-requirement-fields-repeated]
  [fixture: requirement/db-element-fields-repeated]
- 同じ名前をもう一度、どの type の requirement としても、element としても
  定義すると、最初の定義の欄がそのまま残り、2 回目の本体も含めて無視されます。
  ただし 2 回目の定義の頭の `:::` の後のクラスは与えられます。
  与える先は、その名前の requirement で、requirement がなければその名前の
  element です。2 回目がどちらであっても同じです。
  requirement と element は同じ名前を持て、
  その名前を指す文は requirement にだけ働きます。
  名前はどんな名前でもよく、`__proto__` や `constructor` も名前です。
  [fixture: requirement/db-requirement-definition-again-with-class]
  [fixture: requirement/db-element-definition-with-class-of-requirement]
  [fixture: requirement/db-element-definition-again-with-class]
  [fixture: requirement/db-requirement-name-repeated]
  [fixture: requirement/db-element-name-repeated]
  [fixture: requirement/db-requirement-and-element-same-name]
  [fixture: requirement/spec-requirement-diagram-7e4de658]
  [fixture: requirement/spec-requirement-diagram-dec8a0d9]
  [fixture: requirement/spec-requirement-diagram-29c59902]
  [fixture: requirement/spec-requirement-diagram-20d637a1]
- `elements` は、名前ごとに 1 つの element を持ちます。
  `type` と `docRef` は任意のテキストで、本体が設定しなければ空のテキストです。
  [fixture: requirement/db-element-defaults]
  [fixture: requirement/db-element-fields]
  [fixture: requirement/spec-requirement-diagram-aa701d4f]
- `relationships` は、関係の文ごとに 1 つを持ち、同じ文をもう一度書いても
  もう 1 つできます。
  `type` は `contains`、`copies`、`derives`、`satisfies`、`verifies`、
  `refines`、`traces` のどれかです。
  `src` は線の側の名前、`dst` は矢じりの側の名前で、
  語のどちら側に書かれていても同じです。
  名前は requirement や element のものでなくてもよく、引用符で囲めます。
  [fixture: requirement/db-relationship-arrows]
  [fixture: requirement/db-relationship-quoted-names]
  [fixture: requirement/db-relationship-undefined-names]
  [fixture: requirement/db-relationships-repeated]
  [fixture: requirement/spec-requirement-diagram-ef787489]
  [fixture: requirement/spec-requirement-diagram-50b3d65a]
  [fixture: requirement/spec-requirement-diagram-7dfbfd0b]
  [fixture: requirement/spec-requirement-diagram-bbf167e5]
  [fixture: requirement/spec-requirement-diagram-d742a321]
  [fixture: requirement/spec-requirement-diagram-3adb8f93]
  [fixture: requirement/spec-requirement-diagram-3b9d9ff5]
- `cssStyles` は、文が requirement や element に与えたスタイルを、
  与えた順に持ちます。
  `style` の文は、挙げた名前のそれぞれに、
  スタイルをコンマごとに 1 つずつ足します。
  requirement でも element でもない名前に当たると、そこで止まり、
  その後ろの名前は何も得ません。
  [fixture: requirement/db-style-statement]
  [fixture: requirement/db-style-unknown-name]
  [fixture: requirement/db-class-statement-unknown-name-first]
  [fixture: requirement/spec-requirement-diagram-5305b791]
  [fixture: requirement/spec-requirement-diagram-e39bdc99]
  [fixture: requirement/spec-requirement-diagram-5ee6d26d]
- requirement や element の `classes` は、文が与えたクラス名を順に持ちます。
  `class` の文、名前の後ろの `:::`、定義の頭の `:::` が与えます。
  `class` の文の名前が requirement でも element でもなければ、飛ばされ、
  その後ろの名前にはクラスが付きます。
  [fixture: requirement/db-class-statement]
  [fixture: requirement/db-class-statement-unknown-name-first]
  [fixture: requirement/db-class-colon-form]
  [fixture: requirement/db-class-in-definition]
  [fixture: requirement/db-class-default-name]
  [fixture: requirement/spec-requirement-diagram-6bb10181]
  [fixture: requirement/spec-requirement-diagram-5128588b]
  [fixture: requirement/spec-requirement-diagram-a55d1b35]
  [fixture: requirement/spec-requirement-diagram-a8854583]
  [fixture: requirement/spec-requirement-diagram-0799fd14]
- クラスは、2 つの場合にスタイルを requirement や element に与えます。
  メンバーがクラスに加わるとき（そのときまでにクラスが定義されていれば）と、
  クラスが定義されるとき（そのときのメンバーに）です。
  requirement と element はすべて、最初から `default` のメンバーなので、
  `default` の定義は、それより前に定義されたすべてにスタイルを足します。
  [fixture: requirement/db-class-styles-order]
  [fixture: requirement/db-class-styles-order-defined-first]
  [fixture: requirement/db-class-statement-before-def]
  [fixture: requirement/db-class-def-default-all]
- 要約の `classes` は、id ごとに 1 つのクラスの定義を、最初の定義の順に持ち、
  `styles` は与えた順です。
  同じ id をもう一度定義するとスタイルが足され、
  1 つの文で複数の id を定義することもできます。
  [fixture: requirement/db-class-def]
  [fixture: requirement/spec-requirement-diagram-7ee9ffc8]
  [fixture: requirement/spec-requirement-diagram-f9464f3d]

値は、空白を含めて Db が持つままで記録します。
