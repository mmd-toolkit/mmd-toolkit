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

- `autonumber` の数（`start` と `step`）は数で、
  double に収まらない大きさの数は、JSON にそのような数がないので、
  テキスト `"Infinity"` です。
  [fixture: sequence/db-autonumber-start-overflow]
  [fixture: sequence/db-autonumber-step-overflow]
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
  ただし空のブロックは何も変えず、その前の説明を残します。
  ブロックの行は改行でつなぎ、各行の先頭の空白を除くので、
  空行と空白だけの行は余分な改行を残しません。
  ブロックの中のコメント行とディレクティブの行はテキストではなく、
  U+2028 はそのまま残ります。
  [fixture: er/db-acc-descr-line]
  [fixture: er/db-acc-descr-block]
  [fixture: er/db-acc-descr-replaces]
  [fixture: er/db-acc-descr-block-comment-line]
  [fixture: er/db-acc-descr-block-then-empty]
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
  `-0` は Db では数 -0 ですが、JSON に -0 はないので、要約は 0 です。
  [fixture: journey/db-task-score-decimal]
  [fixture: journey/db-task-score-hexadecimal]
  [fixture: journey/db-task-score-exponent]
  [fixture: journey/db-task-score-negative]
  [fixture: journey/db-task-score-negative-zero]
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
  ただし空の説明ブロックは何も変えず、その前の説明を残します。
  ブロックの説明のテキストは改行を持ち、各改行の後ろの空白は除かれます。
  [fixture: requirement/db-frontmatter-title]
  [fixture: requirement/db-acc-title-descr]
  [fixture: requirement/db-acc-descr-block]
  [fixture: requirement/db-empty-description-block-keeps-acc-descr-line]
  [fixture: requirement/db-empty-description-block-keeps-acc-descr-block]
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

## mindmap

要約の欄は 1 つです。

| 欄     | 内容                                                      |
| ------ | --------------------------------------------------------- |
| `root` | 最初のノードと、その下のノード。ノードがなければ `null`。 |

ノードは `nodeId`、`level`、`descr`、`type`、`children` を持ち、
文が与えたときは `icon` と `class` も持ちます。
`children` は、そのノードを親とするノードで、ソースの順です。

`normalizeMindmap()`（`src/normalizers/mindmap.ts`）が、
`mindmap` の Db を要約します。
Db はブラウザの機能も、時刻も、乱数も読まず
（乱数の id は
[`getData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L345-L408)
にあります）、構文にリンクもないので、
要約に Db のパッチは要りません。
読むのは
[`getMindmap()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L71-L73)
が返す木で、これはすべてのノードを子とともに 1 回ずつ持っています。
`getData()` の描画用のデータは読みません。
そちらはノードの section を数え、ノードから新しいノードを作ります。
次を、それぞれの理由で除きます。

- `id`。
  ノードが加えられた順の番号で、
  根から木をたどった順（子は親の後）と同じです。
- `isRoot`。
  根だけが true です。
- `width` と `padding`。
  サイトの設定の値です
  （`mindmap.maxNodeWidth` と `mindmap.padding`。
  padding は形によって 2 倍になります）。
  [fixture: mindmap/config-mindmap-padding-and-width]

描画と `getData()` は、ノードにさらに欄を置きます
（`section`、`height`、`x`、`y`）。
読む Db には、そのどれもありません。

欄ごとの値です。

- `root` は、ヘッダーの後に何もなければ `null` で、
  空白やコメント行が続くときも同じです。
  最初のノードが根です。
  ヘッダーの後に改行がないものは拒否されます。
  [fixture: mindmap/db-header-only]
  [fixture: mindmap/db-header-only-trailing-spaces]
  [fixture: mindmap/db-header-then-comment-line-only]
  [fixture: mindmap/db-header-without-line-feed]
- 根は、字下げが何であっても最初のノードです。
  ヘッダーの前の空白は、ノードの level を変えません。
  ヘッダーと同じ行の後ろにあるノードは根で、
  ヘッダーの後ろの空白の並び全体がその字下げなので、
  子はその文字数より多く字下げしなければなりません。
  [fixture: mindmap/db-first-node-unindented]
  [fixture: mindmap/db-header-indented]
  [fixture: mindmap/db-first-node-on-header-line]
  [fixture: mindmap/db-first-node-on-header-line-wide-gap]
  [fixture: mindmap/db-first-node-on-header-line-child-too-shallow]
  [fixture: mindmap/db-first-node-after-header-tab]
  [fixture: mindmap/spec-mindmap-903e1973]
  [fixture: mindmap/spec-mindmap-54e233b2]
- `level` は、ノードの字下げの文字数から、根の字下げの文字数を引いたものです。
  空白文字は、どれも 1 文字です。
  空白、タブ（タブ幅に展開しません）、全角空白、ノーブレークスペースです。
  [fixture: mindmap/db-indent-tab-levels]
  [fixture: mindmap/db-indent-tab-counts-as-one-char]
  [fixture: mindmap/db-indent-fullwidth-space]
  [fixture: mindmap/db-indent-no-break-space]
  [fixture: mindmap/db-indent-mixed-whitespace-kinds]
  [fixture: mindmap/db-indent-root-offset]
  [fixture: mindmap/db-indent-skips-levels]
- ノードの親は、そのノードより前の、level が自分より小さい最も近いノードです。
  そのため、前のノードと同じ字下げのノードは、その兄弟で、
  前のノードの下のノードの後に来ます。
  最初でなく、親になるノードがないものは拒否されます。
  根と同じ字下げか、それより浅いものです。
  [fixture: mindmap/db-indent-parent-is-nearest-shallower]
  [fixture: mindmap/db-indent-sibling-after-deeper]
  [fixture: mindmap/db-indent-less-than-root]
  [fixture: mindmap/db-indent-same-as-root]
  [fixture: mindmap/db-indent-tab-not-expanded-below-root]
  [fixture: mindmap/docs-syntax-mindmap-5106c1aa]
  [fixture: mindmap/docs-syntax-mindmap-50120b03]
  [fixture: mindmap/spec-mindmap-53c49526]
  [fixture: mindmap/spec-mindmap-bc95ec97]
- ノードの間の空行、空白だけの行、CRLF や単独の CR の改行は何も変えません。
  ヘッダーと最初のノードの間の空行と空白だけの行は拒否されます。
  最後のノードの後の空白は何も変えません。
  [fixture: mindmap/db-blank-line-between-nodes]
  [fixture: mindmap/db-whitespace-only-line-between-nodes]
  [fixture: mindmap/db-tab-only-line-between-nodes]
  [fixture: mindmap/db-blank-line-after-header]
  [fixture: mindmap/db-whitespace-line-after-header]
  [fixture: mindmap/db-whitespace-after-last-node]
  [fixture: mindmap/db-crlf-line-ends]
  [fixture: mindmap/db-lone-cr-line-ends]
  [fixture: mindmap/spec-mindmap-c6c76671]
  [fixture: mindmap/spec-mindmap-931bf91d]
- コメント行（前の空白を含む `%%` の行）は、どこにあっても何も変えません。
  ヘッダーと最初のノードの間やヘッダーの前でも同じで、
  その字下げはまわりの level を変えません。
  ノードのテキストの後ろの `%%` は、テキストの一部です。
  ディレクティブの行はコメント行と同じように除かれます。
  そのため、ヘッダーと最初のノードの間のものはそこに空行を残して拒否され、
  ノードの間のものは何も変えません。
  ノードのテキストの後ろのディレクティブは、テキストの一部ではありません。
  フロントマターは何も変えず、図はタイトルを持ちません。
  [fixture: mindmap/db-comment-line-between-nodes]
  [fixture: mindmap/db-comment-line-indented-deeper]
  [fixture: mindmap/db-comment-line-after-header]
  [fixture: mindmap/db-comment-before-header]
  [fixture: mindmap/db-comment-after-node-text]
  [fixture: mindmap/db-directive-line-between-nodes]
  [fixture: mindmap/db-directive-line-indented]
  [fixture: mindmap/db-directive-between-header-and-first-node]
  [fixture: mindmap/db-directive-after-node-text]
  [fixture: mindmap/db-frontmatter-before-header]
  [fixture: mindmap/spec-mindmap-32c71b33]
  [fixture: mindmap/spec-mindmap-f8ad2bf0]
- 形のないノードの `nodeId` と `descr` は、字下げの後の行全体で、
  行末の空白も含みます。
  コロン、ハッシュ、引用符、空白はテキストの文字です。
  同じテキストのノードが 2 つあってもかまいません。
  [fixture: mindmap/db-node-trailing-whitespace]
  [fixture: mindmap/db-text-with-colon-and-hash]
  [fixture: mindmap/db-text-with-quote]
  [fixture: mindmap/db-same-text-twice]
  [fixture: mindmap/docs-syntax-mindmap-85604c12]
- 形は id の後ろの区切りの対で、`type` を決めます
  （id がなければ、テキストが id です）。
  形がなければ 0、`( )` は 1、`[ ]` は 2、`(( ))` は 3、`) (` は 4、
  `)) ((` は 5、`{ }` は 6 です。
  `descr` は区切りの間のテキストです。
  長方形の閉じる区切りは、開く区切りと対でなくてもかまいません。
  `(-text-)` と `-)text(-` の形は、対ではなく字句の規則に従います。
  区切りの間の文字列は、区切りの文字を持てます。
  Markdown の文字列は、バッククォートを除いたテキストです。
  テキストのない形と、閉じる区切りの後ろのテキストは拒否されます。
  [fixture: mindmap/db-shape-rect]
  [fixture: mindmap/db-shape-rounded]
  [fixture: mindmap/db-shape-circle]
  [fixture: mindmap/db-shape-cloud]
  [fixture: mindmap/db-shape-bang]
  [fixture: mindmap/db-shape-hexagon]
  [fixture: mindmap/db-shape-cloud-dash-form]
  [fixture: mindmap/db-shape-explode-dash-form]
  [fixture: mindmap/db-shape-without-id]
  [fixture: mindmap/db-shape-without-id-circle]
  [fixture: mindmap/db-shape-mismatched-end]
  [fixture: mindmap/db-shape-string]
  [fixture: mindmap/db-shape-markdown-string]
  [fixture: mindmap/db-shape-empty-description]
  [fixture: mindmap/db-shape-text-after-end]
  [fixture: mindmap/db-shape-id-with-parentheses]
  [fixture: mindmap/spec-mindmap-2ab5d128]
  [fixture: mindmap/spec-mindmap-3b2342ba]
  [fixture: mindmap/spec-mindmap-5ccc3578]
  [fixture: mindmap/spec-mindmap-20bffa18]
  [fixture: mindmap/spec-mindmap-042bfdb5]
  [fixture: mindmap/spec-mindmap-3a9de64e]
- `::icon(text)` の行は、最後に加えたノードに `icon` を、
  `:::text` の行は `class` を与えます。
  字下げは関係ありません。
  同じ行がもう一度あれば、前のものを置き換えます。
  ノードと同じ行の icon は icon ではなく、
  同じ行の class はそのノードのテキストの一部です。
  `icon` の語は大文字小文字を問わず読み、
  括弧の中が空の icon は何も与えず、
  icon の括弧の中の空白と class の両端の空白は残ります。
  最初のノードより前の icon の行と class の行は拒否されます。
  [fixture: mindmap/db-icon-line]
  [fixture: mindmap/db-icon-same-line]
  [fixture: mindmap/db-icon-twice]
  [fixture: mindmap/db-icon-and-class-on-child]
  [fixture: mindmap/db-icon-indent-ignored]
  [fixture: mindmap/db-icon-before-node]
  [fixture: mindmap/db-icon-case-insensitive]
  [fixture: mindmap/db-icon-empty]
  [fixture: mindmap/db-class-line]
  [fixture: mindmap/db-class-twice]
  [fixture: mindmap/db-class-same-line-as-node]
  [fixture: mindmap/db-class-before-node]
  [fixture: mindmap/db-class-trailing-space]
  [fixture: mindmap/db-class-leading-whitespace]
  [fixture: mindmap/db-icon-surrounding-whitespace]
  [fixture: mindmap/db-class-empty]
  [fixture: mindmap/spec-mindmap-2b7307a0]
  [fixture: mindmap/spec-mindmap-4755cd73]
  [fixture: mindmap/spec-mindmap-c9bb7eac]
  [fixture: mindmap/spec-mindmap-da41aead]
- どの値も[変換した形](../../spec/docs/common.ja.md#ソースの読み方)で読むので、
  エンティティは、ノードのテキスト、形のテキスト、icon、class で
  プレースホルダです。
  文字列の中の改行はテキストに残り、そこの CRLF は改行で、
  形のテキストの属性の引用符は一重引用符です。
  [fixture: mindmap/entity-placeholder-in-node-text]
  [fixture: mindmap/entity-placeholder-numeric]
  [fixture: mindmap/entity-placeholder-in-description]
  [fixture: mindmap/entity-placeholder-in-icon]
  [fixture: mindmap/entity-placeholder-in-class]
  [fixture: mindmap/lex-html-attribute-quote-in-description]
  [fixture: mindmap/lex-string-line-feed]
  [fixture: mindmap/lex-string-crlf]
  [fixture: mindmap/lex-markdown-string-line-feed]
  [fixture: mindmap/docs-syntax-mindmap-d3468819]
- `nodeId`、`descr`、`icon`、`class` は `sanitizeText` を通ります。
  `securityLevel` が mermaid.js の値のどれでもなく、HTML のラベルが有効なら、
  文字を置き換えたものを持ちます
  （[db-from-tree.md](./db-from-tree.md) の文字の置き換えを参照）。
  [fixture: mindmap/config-security-level-other-texts]
  [fixture: mindmap/config-security-level-other-html-labels-false]

値は、空白を含めて Db が持つままで記録します。

## timeline

要約の欄は次のとおりです。

| 欄          | 内容                                                          |
| ----------- | ------------------------------------------------------------- |
| `direction` | `LR`。`timeline TD` では `TD`。                               |
| `title`     | 最後の `title` の文のタイトル。なければ空のテキスト。         |
| `accTitle`  | アクセシビリティのタイトル。なければ空のテキスト。            |
| `accDescr`  | アクセシビリティの説明。なければ空のテキスト。                |
| `sections`  | section のテキスト。`section` の文ごとに 1 つで、ソースの順。 |
| `tasks`     | タスク。ソースの順。                                          |

タスクは、`section`、`task`、`events` を持ちます。

`normalizeTimeline()`（`src/normalizers/timeline.ts`）は、`timeline` の Db を
要約します。
Db は、ブラウザーの機能も、時刻も、乱数も読まず、構文にリンクもありません。
このため、要約に Db のパッチはいりません。
Db は、すべての timeline 図が共有する 1 つのモジュールで、
[`clear()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L12-L19)
が、構文解析のたびにその状態を初期化します。
ただしタスクの番号の数え上げは初期化しません。
[`getTasks()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L38-L50)
は、呼ぶたびに、タスクを自分の一覧に加えます。
そのため要約は、一覧を 1 度だけ読み、空に戻します。
こうして Db は、読む前のままになります。
次のものを、それぞれに書いた理由で捨てます。

- `tasks[].id`: タスクの番号。
  `clear()` が初期化しない数え上げから取るので、
  この図より前に解析した図に依存します。
  タスクの順は、一覧の順です。
- `tasks[].type`: section の繰り返し。
- `tasks[].score`: 常に 0 です。
  [文法](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L35)が、どのタスクも score 0 で加えるからです
  （[`addTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L52-L63)）。

値を、欄ごとに述べます。

- `direction` は、ヘッダーの後ろに空白かタブと `TD` が続けば `TD`、
  そうでなければ `LR` です。
  方向は大文字小文字を問いません。
  語はそこで終わらなければならず、`TDx` と `LRx` はタスクの period で、
  方向は `LR` のままです。
  ヘッダーと方向を分けるのは空白かタブだけです。
  ほかの空白は、改行も含めて、方向をタスクの period にします。
  2 つ目の方向も period です。
  [fixture: timeline/db-header-only]
  [fixture: timeline/db-direction-lr]
  [fixture: timeline/db-direction-td]
  [fixture: timeline/db-direction-lower-case]
  [fixture: timeline/db-direction-mixed-case]
  [fixture: timeline/db-direction-two-spaces]
  [fixture: timeline/db-direction-tab]
  [fixture: timeline/db-direction-trailing-space]
  [fixture: timeline/header-direction-no-break-space]
  [fixture: timeline/header-direction-ideographic-space]
  [fixture: timeline/header-direction-line-feed]
  [fixture: timeline/header-direction-word-suffix]
  [fixture: timeline/header-direction-word-suffix-lr]
  [fixture: timeline/header-direction-twice]
- ヘッダーは小文字だけが検出されます。
  ヘッダーの行でその後ろにあるものは、行と同じに読みます。
  period、タイトル、section、アクセシビリティのタイトル、
  `#` か `%` のコメント、取り除かれるディレクティブです。
  event は、そこでは task がないので、拒否されます。
  ヘッダーに続けて書いた語はヘッダーではありません。
  ヘッダーの後ろのダッシュは period `-x` を始め、
  コロンは task のない event を始めます。
  2 つ目のヘッダーは拒否されます。
  [fixture: timeline/header-without-line-feed]
  [fixture: timeline/header-trailing-spaces]
  [fixture: timeline/header-direction-then-colon]
  [fixture: timeline/header-direction-glued-colon]
  [fixture: timeline/header-glued-direction]
  [fixture: timeline/header-word-suffix]
  [fixture: timeline/header-dash-suffix]
  [fixture: timeline/header-colon-suffix]
  [fixture: timeline/header-text-on-header-line]
  [fixture: timeline/header-period-with-event-on-header-line]
  [fixture: timeline/header-event-on-header-line]
  [fixture: timeline/header-title-on-header-line]
  [fixture: timeline/header-section-on-header-line]
  [fixture: timeline/header-acc-title-on-header-line]
  [fixture: timeline/header-indented]
  [fixture: timeline/header-after-blank-lines]
  [fixture: timeline/header-after-comment-line]
  [fixture: timeline/header-after-hash-line]
  [fixture: timeline/header-upper-case]
  [fixture: timeline/header-capitalized]
  [fixture: timeline/header-hash-comment-on-header-line]
  [fixture: timeline/header-percent-comment-on-header-line]
  [fixture: timeline/header-single-percent-comment-on-header-line]
  [fixture: timeline/header-directive-before-direction]
  [fixture: timeline/header-directive-after-header]
  [fixture: timeline/header-twice]
  [fixture: timeline/header-twice-with-directions]
- `title` は、
  [`title` の文](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L23)の、
  キーワードと空白 1 文字の後ろから行末までのテキストです。
  キーワードは大文字小文字を問いません。
  両端の空白は残ります。
  空白 2 つの `title  T` のタイトルは ` T` で、末尾の空白も残ります。
  `:`、`#`、`%%` はタイトルの文字です。
  `;` もタイトルの文字ですが、`style` の行の行規則が捨てる 1 つは除きます。
  最後の `title` の文がタイトルです。
  キーワードの後ろには、どの空白文字も続けられ、タイトルには入りません。
  改行も含むので、行末の `title` は、次の行をタイトルとします。
  その行が何を書いていても同じです。
  [fixture: timeline/db-title-statement]
  [fixture: timeline/db-title-upper-case]
  [fixture: timeline/db-title-two-spaces]
  [fixture: timeline/db-title-three-spaces]
  [fixture: timeline/db-title-trailing-spaces]
  [fixture: timeline/db-title-only-space]
  [fixture: timeline/db-title-colon]
  [fixture: timeline/db-title-hash]
  [fixture: timeline/db-title-percent]
  [fixture: timeline/db-title-semicolon]
  [fixture: timeline/db-title-twice]
  [fixture: timeline/db-title-with-tags]
  [fixture: timeline/lex-title-separator-tab]
  [fixture: timeline/lex-title-separator-no-break-space]
  [fixture: timeline/lex-title-separator-ideographic-space]
  [fixture: timeline/lex-title-separator-line-separator]
  [fixture: timeline/lex-title-separator-paragraph-separator]
  [fixture: timeline/lex-title-separator-byte-order-mark]
  [fixture: timeline/lex-title-separator-line-feed]
  [fixture: timeline/lex-title-separator-carriage-return]
  [fixture: timeline/lex-title-line-separator-inside]
  [fixture: timeline/db-period-title-then-section-lines]
- title の文には、キーワードの後ろの空白の後ろに、同じ行で 1 文字が要ります。
  テキストの終わりにあるキーワードだけのもの、
  空白 1 つと行末が続くものは、タスクの period です。
  `title` で始まる語も period です。
  キーワードの直後のコロンは、コロンの後ろに空白が要るので、拒否されます。
  [fixture: timeline/gram-title-keyword-alone]
  [fixture: timeline/gram-title-keyword-trailing-space]
  [fixture: timeline/gram-title-word-suffix]
  [fixture: timeline/gram-title-colon-glued]
- フロントマターのタイトルは、図のタイトルではありません。
  [Diagram](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/Diagram.ts#L52-L54)は、`setDiagramTitle` を持つ Db にだけタイトルを渡し、
  timeline の Db にはそのメソッドがないからです。
  `title` の文は、どちらの場合もタイトルです。
  [fixture: timeline/db-title-frontmatter]
  [fixture: timeline/db-title-frontmatter-and-statement]
- `accTitle` と `accDescr` は、`:` の後ろでは、
  行のテキストを trim したものです。
  コロンの周りの空白は、改行も含めて、テキストに入りません。
  このためコロンも、テキストも、次の行に書けます。
  キーワードは大文字小文字を問いません。
  `:`、`#`、`%%` はテキストの文字です。
  `;` もテキストの文字ですが、`style` の行の行規則が捨てる 1 つは除きます。
  テキストのない文は拒否されます。
  どちらも最後の文が値で、ブロックの説明と行の説明は互いを置き換えます。
  ただし空のブロックは何も置き換えません。
  [fixture: timeline/db-acc-title-statement]
  [fixture: timeline/db-acc-title-glued]
  [fixture: timeline/db-acc-title-space-before-colon]
  [fixture: timeline/db-acc-title-upper-case]
  [fixture: timeline/db-acc-title-many-spaces]
  [fixture: timeline/db-acc-title-trailing-spaces]
  [fixture: timeline/db-acc-title-colon]
  [fixture: timeline/db-acc-title-hash]
  [fixture: timeline/db-acc-title-percent]
  [fixture: timeline/db-acc-title-semicolon]
  [fixture: timeline/db-acc-title-twice]
  [fixture: timeline/lex-acc-title-colon-on-next-line]
  [fixture: timeline/lex-acc-title-value-on-next-line]
  [fixture: timeline/lex-acc-title-separator-no-break-space]
  [fixture: timeline/gram-acc-title-empty]
  [fixture: timeline/gram-acc-title-only-space]
  [fixture: timeline/gram-acc-descr-empty]
  [fixture: timeline/lex-acc-title-line-separator-inside]
  [fixture: timeline/db-acc-descr-statement]
  [fixture: timeline/db-acc-descr-glued]
  [fixture: timeline/db-acc-descr-trailing-spaces]
  [fixture: timeline/db-acc-descr-hash]
  [fixture: timeline/db-acc-descr-line-then-block]
  [fixture: timeline/db-acc-descr-block-then-line]
  [fixture: timeline/lex-acc-descr-line-separator-inside]
  [fixture: timeline/db-acc-all-statements]
- ブロックの説明のテキストは最初の `}` までで、
  [`setAccDescription`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L22-L24)が説明を変えます。
  改行とその後ろの空白は、どの種類の空白でも
  （タブ、ノーブレークスペース、U+3000、U+2028、U+FEFF）1 つの改行になり、
  ブロックの中の行のインデントと空の行は除かれます。
  改行の前の空白は残ります。
  ブロックは `accDescr` の後ろに空白を要さず、両端の空白はテキストに入りません。
  空のブロックは何も変えません。
  その前にある、行のものもブロックのものも含む説明を残し、
  前になければ説明は空のままです。
  `}` のないブロックは拒否されます。
  最初の `}` の後ろは、行として読みます。
  ブロックの中の `%%` で始まる行は、コメント行で、取り除かれます。
  [fixture: timeline/db-acc-descr-block]
  [fixture: timeline/db-acc-descr-block-glued]
  [fixture: timeline/db-acc-descr-block-spaces]
  [fixture: timeline/db-acc-descr-block-empty]
  [fixture: timeline/db-acc-descr-block-braces-only]
  [fixture: timeline/db-acc-descr-block-then-empty-block]
  [fixture: timeline/db-acc-descr-line-then-empty-braces]
  [fixture: timeline/gram-empty-description-block-keeps-description]
  [fixture: timeline/gram-empty-description-block-directive-only]
  [fixture: timeline/gram-empty-description-block-comment-line-only]
  [fixture: timeline/db-acc-descr-block-blank-line]
  [fixture: timeline/db-acc-descr-block-spaces-before-line-feed]
  [fixture: timeline/db-acc-descr-block-tab-before-line-feed]
  [fixture: timeline/db-acc-descr-block-no-break-space-before-line-feed]
  [fixture: timeline/db-acc-descr-block-ideographic-space-before-line-feed]
  [fixture: timeline/db-acc-descr-block-tab-after-line-feed]
  [fixture: timeline/db-acc-descr-block-no-break-space-after-line-feed]
  [fixture: timeline/db-acc-descr-block-ideographic-space-after-line-feed]
  [fixture: timeline/db-acc-descr-block-line-separator-after-line-feed]
  [fixture: timeline/db-acc-descr-block-byte-order-mark-after-line-feed]
  [fixture: timeline/db-acc-descr-block-hash-and-percent]
  [fixture: timeline/db-acc-descr-block-percent-line]
  [fixture: timeline/gram-acc-descr-block-unclosed]
  [fixture: timeline/db-acc-descr-block-brace-inside]
  [fixture: timeline/db-acc-descr-block-then-text]
  [fixture: timeline/lex-acc-descr-block-line-separator-inside]
- コロンもブレースもない、行の中の `accTitle` と `accDescr` だけのものは、
  period です。
  [fixture: timeline/db-period-acc-keywords-alone]
- `sections` は、
  [`section` の文](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L31)の、
  キーワードと空白 1 文字を除いたテキストで、テキストが繰り返されても同じです。
  テキストは `:` か行末までで、`#` と `%%` はテキストに入ります。
  両端の空白も入り、空白 1 つのテキストも同じです。
  キーワードは大文字小文字を問わず、どの空白文字も後ろに続けられ、
  改行も含むので、その場合は次の行がテキストになります。
  `:` はテキストを終わらせます。
  その後ろの event は section の前の最後の task のもので、
  task がなければ拒否されます。
  キーワードの直後のコロンも拒否されます。
  キーワードだけのもの、キーワードと空白 1 つ、
  `section` で始まる語は period です。
  [fixture: timeline/db-section-statement]
  [fixture: timeline/db-section-upper-case]
  [fixture: timeline/db-section-two-spaces]
  [fixture: timeline/db-section-trailing-spaces]
  [fixture: timeline/db-section-only-space]
  [fixture: timeline/db-section-hash]
  [fixture: timeline/db-section-percent]
  [fixture: timeline/db-section-twice-same-name]
  [fixture: timeline/db-section-with-tags]
  [fixture: timeline/lex-section-separator-tab]
  [fixture: timeline/lex-section-separator-ideographic-space]
  [fixture: timeline/lex-section-separator-line-feed]
  [fixture: timeline/lex-section-separator-line-separator]
  [fixture: timeline/lex-section-line-separator-inside]
  [fixture: timeline/gram-section-keyword-alone]
  [fixture: timeline/gram-section-keyword-trailing-space]
  [fixture: timeline/gram-section-word-suffix]
  [fixture: timeline/gram-section-colon-glued]
  [fixture: timeline/db-section-with-event-after-task]
  [fixture: timeline/gram-section-with-event]
  [fixture: timeline/gram-section-then-event-line]
- タスクは、その前の section に属し、最初の section の前では `section` が
  空のテキストです。
  section とタスクの間の title は、何も変えません。
  [fixture: timeline/db-section-two-with-tasks]
  [fixture: timeline/db-section-after-tasks]
  [fixture: timeline/db-section-then-title]
- `task` は period で、ほかの文でない行のテキストです。
  `:` か `#` か行末までです。
  前の空白はテキストに入らず、後ろの空白は残ります。
  行は、インデントに関わらずそれぞれタスクで、テキストは繰り返せます。
  [fixture: timeline/db-period-only]
  [fixture: timeline/db-period-trailing-spaces]
  [fixture: timeline/db-period-with-spaces]
  [fixture: timeline/db-period-leading-whitespace]
  [fixture: timeline/db-period-leading-ideographic-space]
  [fixture: timeline/db-period-two-lines]
  [fixture: timeline/db-period-same-text-twice]
  [fixture: timeline/db-indentation-does-not-nest]
  [fixture: timeline/db-tab-indentation]
  [fixture: timeline/db-names-of-object-prototype]
  [fixture: timeline/db-period-cjk]
- [event](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L34)は、`:` と空白 1 文字の後ろのテキストで、その前のタスクのものです。
  後ろに空白がある次の `:` か、行末までです。
  後ろに空白のない `:` は event の文字です。
  後ろに空白のある `:` は、前に何があっても event を終わらせ、
  同じタスクの次の event を始めます。
  コロンの前の空白は前のテキストに入り、
  コロンの後ろの空白は、最初の 1 文字を除いて event に入ります。
  コロンの後ろには、どの空白文字も続けられます。
  [fixture: timeline/db-period-and-event]
  [fixture: timeline/db-period-colon-glued-to-period]
  [fixture: timeline/db-event-two-spaces]
  [fixture: timeline/db-event-leading-spaces]
  [fixture: timeline/db-event-trailing-spaces]
  [fixture: timeline/db-event-two-on-a-line]
  [fixture: timeline/db-event-three-on-a-line]
  [fixture: timeline/db-event-colon-glued-inside]
  [fixture: timeline/db-event-colon-space-before-glued-after]
  [fixture: timeline/db-event-colon-glued-before]
  [fixture: timeline/lex-event-separator-tab]
  [fixture: timeline/lex-event-separator-no-break-space]
  [fixture: timeline/lex-event-separator-ideographic-space]
  [fixture: timeline/lex-event-separator-line-separator]
  [fixture: timeline/lex-event-separator-paragraph-separator]
  [fixture: timeline/lex-event-separator-byte-order-mark]
- period の直後の、後ろに空白のない `:` は拒否されます。
  後ろに何もない、または空白 1 文字だけがテキストの終わりまで続く `:` も、
  period の後でも event の後でも拒否されます。
  [fixture: timeline/gram-event-colon-glued-to-event]
  [fixture: timeline/gram-event-colon-space-glued]
  [fixture: timeline/gram-event-empty-after-colon]
  [fixture: timeline/gram-event-empty-after-colon-space]
  [fixture: timeline/gram-event-trailing-colon]
  [fixture: timeline/gram-event-trailing-colon-space]
  [fixture: timeline/gram-event-colon-at-end-glued]
- 独立した行の event は、その前の最後のタスクのものです。
  間にある空の行、空白だけの行、コメント行、ディレクティブの行、
  title、アクセシビリティのタイトルと説明、section は、タスクを終わらせません。
  どのタスクよりも前の event は task がなく、Db が `TypeError` を投げるので、
  入力は拒否されます。
  [fixture: timeline/db-event-own-line]
  [fixture: timeline/db-event-own-line-after-event]
  [fixture: timeline/db-event-own-line-two-tasks]
  [fixture: timeline/db-event-own-line-after-blank-line]
  [fixture: timeline/db-event-own-line-after-whitespace-line]
  [fixture: timeline/db-event-own-line-after-comment-line]
  [fixture: timeline/db-event-own-line-after-hash-line]
  [fixture: timeline/db-event-own-line-after-directive-line]
  [fixture: timeline/db-event-own-line-after-title]
  [fixture: timeline/db-event-own-line-after-acc-title]
  [fixture: timeline/db-event-own-line-after-acc-descr-block]
  [fixture: timeline/db-event-after-section-joins-earlier-task]
  [fixture: timeline/gram-event-first]
  [fixture: timeline/gram-event-after-title]
  [fixture: timeline/gram-event-after-section-only]
- `:` の後ろの空白は改行を含むので、行末の `:` は、次の行を event とします。
  インデントも event に入り、`:` だけの行も同じです。
  その後ろが空の行なら拒否され、空白だけの行ならその空白が event になって、
  次の行はタスクです。
  [fixture: timeline/db-event-line-feed-after-colon]
  [fixture: timeline/db-event-line-feed-after-colon-indented]
  [fixture: timeline/db-event-line-feed-after-second-colon]
  [fixture: timeline/db-event-own-line-colon-then-line-feed]
  [fixture: timeline/gram-event-line-feed-then-empty-line]
  [fixture: timeline/db-event-line-feed-then-whitespace-line]
  [fixture: timeline/db-event-colon-only-twice]
- 引用符、括弧、矢印、マークアップ、リンク、バックスラッシュ、
  基本多言語面の外の文字は、テキストの文字です。
  `;` もテキストの文字ですが、`style` の行の行規則が捨てる 1 つは除きます。
  [fixture: timeline/db-event-semicolons]
  [fixture: timeline/db-event-links-and-tags]
  [fixture: timeline/db-event-quotes-and-brackets]
  [fixture: timeline/db-event-arrows]
  [fixture: timeline/db-event-backslash-n]
  [fixture: timeline/db-event-non-bmp]
- event の中の `#` と `%%`、event が `#` か `%%` だけのこと、
  event に続けた `%%` は、event の文字です。
  [fixture: timeline/db-event-hash]
  [fixture: timeline/db-event-percent]
  [fixture: timeline/db-event-percent-glued]
  [fixture: timeline/db-event-only-hash]
  [fixture: timeline/db-event-only-percent]
- `#` で始まる行と、後ろに `{` が続かない `%` で始まる行は、コメント行です。
  `% c`、`%c`、`%`、`%% c` はコメントで、`%{x}` は period です。
  period や title の中の `%` と、event の最初の `%` は、テキストの文字です。
  コメント行のインデントは何も変えず、タスクとその event の間にも、
  ヘッダーの直後にも置けます。
  period の後ろの `#` は、行末まで続くコメントを始めます。
  その後ろの event は失われ、`#` の前の空白は period に残ります。
  [fixture: timeline/db-comment-hash-line]
  [fixture: timeline/db-comment-percent-line]
  [fixture: timeline/db-comment-hash-only]
  [fixture: timeline/db-comment-percent-only]
  [fixture: timeline/db-comment-hash-line-at-end]
  [fixture: timeline/db-comment-hash-line-indented]
  [fixture: timeline/db-comment-before-event-line]
  [fixture: timeline/db-comment-hash-between-header-and-first-line]
  [fixture: timeline/db-comment-percent-after-header]
  [fixture: timeline/db-comment-hash-after-period]
  [fixture: timeline/db-comment-hash-after-period-hides-event]
  [fixture: timeline/db-comment-hash-after-period-only]
  [fixture: timeline/db-comment-single-percent-line]
  [fixture: timeline/db-comment-single-percent-glued]
  [fixture: timeline/db-comment-single-percent-only]
  [fixture: timeline/db-comment-single-percent-between-task-and-event]
  [fixture: timeline/lex-percent-brace-period]
  [fixture: timeline/db-period-percent-inside]
  [fixture: timeline/db-title-single-percent]
  [fixture: timeline/db-event-single-percent]
- period と空白の後ろの `%%` は period の文字です。
  1 文字の period に続けた `%%` は、その 1 文字を取るコメントを始めます。
  [コメントの規則](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L15)が、トークンの先頭で、`}` 以外の 1 文字を
  `%%` の前に取るからで、タスクは失われます。
  2 文字以上の後ろや、`}` の後ろでは、period の文字です。
  [fixture: timeline/db-comment-percent-after-period]
  [fixture: timeline/db-comment-percent-after-period-glued]
  [fixture: timeline/db-comment-percent-after-period-glued-no-space]
  [fixture: timeline/db-comment-percent-glued-after-two-characters]
  [fixture: timeline/db-comment-percent-after-closing-brace]
  [fixture: timeline/db-comment-percent-glued-in-event]
- [`style` 行と `classDef` 行](../../spec/docs/common.ja.md#style-行と-classdef-行)の
  共通の行規則は、timeline のテキストにも、どの図種とも同じに働きます。
  小文字の `style` か `classDef`、`:`、空白でない文字、`#`、その後ろの `;` を
  持つ行では、行の最後の `;` が捨てられます。
  その前にある `;` は、文字参照を終わらせることがあります。
  `:` の後ろに `#` がない行、`#` が `:` の前にある行は、`;` がそのまま残ります。
  大文字の `Style` の行は規則に当たらないので、`;` を捨てません。
  ただし、`#` と語の文字の後ろの `;` はそこで文字参照を終わらせるので、
  Db にはプレースホルダが見え、`;` は見えません。
  規則が届くのは、title、アクセシビリティのテキスト、event です。
  section と period は、`style` の後ろの、後ろに空白のない `:` で終わるので、
  その行は拒否されます。
  [fixture: timeline/lex-title-semicolon-in-style-line]
  [fixture: timeline/lex-title-semicolon-in-style-line-last-only]
  [fixture: timeline/lex-title-semicolon-in-classdef-line]
  [fixture: timeline/lex-title-semicolon-after-text-before-style]
  [fixture: timeline/lex-title-semicolon-in-style-line-entity]
  [fixture: timeline/lex-title-semicolon-without-hash]
  [fixture: timeline/lex-title-semicolon-hash-before-colon]
  [fixture: timeline/lex-title-semicolon-style-upper-case]
  [fixture: timeline/lex-acc-title-semicolon-in-style-line]
  [fixture: timeline/lex-acc-descr-semicolon-in-style-line]
  [fixture: timeline/lex-acc-descr-block-semicolon-in-style-line]
  [fixture: timeline/lex-event-semicolon-in-style-line]
  [fixture: timeline/lex-event-semicolon-in-style-line-second-event]
  [fixture: timeline/gram-section-style-line]
  [fixture: timeline/gram-period-style-line]
- キーワードか行末の `:` が次の行を取るときは、間の行を先に読みます。
  `%%` のコメント行は取り除かれるので、その後ろの行を取ります。
  `#` の行は、そこではコメント行ではなく、
  title や event のテキストとして取られます。
  ディレクティブの行は取り除かれ、インデントが残ります。
  インデントがあれば、そのインデントが title、section、event になり、
  次の行は task です。
  インデントがなければ空の行が残ります。
  テキストの中の空の行も同じで、
  `title` と `section` は period に、`:` は拒否されます。
  `accTitle:` と `accDescr:` の後ろでは、
  空白がディレクティブの行と空の行を取るので、テキストは次の行です。
  [fixture: timeline/lex-title-line-feed-comment-line]
  [fixture: timeline/lex-title-line-feed-two-comment-lines]
  [fixture: timeline/lex-title-line-feed-hash-line]
  [fixture: timeline/lex-title-line-feed-directive-line]
  [fixture: timeline/lex-title-line-feed-directive-line-unindented]
  [fixture: timeline/lex-title-line-feed-empty-line]
  [fixture: timeline/lex-section-line-feed-comment-line]
  [fixture: timeline/lex-section-line-feed-directive-line]
  [fixture: timeline/lex-section-line-feed-directive-line-unindented]
  [fixture: timeline/lex-section-line-feed-empty-line]
  [fixture: timeline/lex-acc-title-value-after-comment-line]
  [fixture: timeline/lex-acc-title-value-after-directive-line]
  [fixture: timeline/lex-acc-descr-value-after-comment-line]
  [fixture: timeline/lex-acc-descr-value-after-directive-line]
  [fixture: timeline/lex-event-line-feed-comment-line]
  [fixture: timeline/lex-event-line-feed-directive-line]
  [fixture: timeline/lex-event-line-feed-directive-line-unindented]
  [fixture: timeline/lex-event-own-line-colon-comment-line]
  [fixture: timeline/lex-event-own-line-colon-directive-line-unindented]
- ディレクティブは、テキストを読む前に取り除かれ、周りの空白は残ります。
  そのため、前後の部分がつながります。
  period、event、title、section、アクセシビリティのテキストで同じです。
  [fixture: timeline/db-period-directive-before-colon]
  [fixture: timeline/db-period-directive-glued]
  [fixture: timeline/db-event-directive]
  [fixture: timeline/db-title-directive]
  [fixture: timeline/db-section-directive]
  [fixture: timeline/db-acc-title-directive]
  [fixture: timeline/db-acc-descr-block-directive]
- 値は[変換した形](../../spec/docs/common.ja.md#ソースの読み方)で読むので、
  文字参照は、どのテキストでもプレースホルダです。
  参照の `#` はコメントを始めず、参照を始めない `#` は始めます。
  [fixture: timeline/db-title-entity]
  [fixture: timeline/db-section-entity]
  [fixture: timeline/db-event-entity]
  [fixture: timeline/db-event-entity-named]
  [fixture: timeline/db-event-entity-hex]
  [fixture: timeline/db-event-entity-is-no-comment]
  [fixture: timeline/db-period-unclosed-reference]
  [fixture: timeline/db-acc-title-entity]
  [fixture: timeline/db-acc-descr-entity]
  [fixture: timeline/db-acc-descr-block-entity]
- CRLF と単独の CR は、改行と同じに行を終わらせます。
  U+2028 と U+2029 は行を終わらせず、period、event、section、title、
  アクセシビリティのテキストの文字で、period の前の空白にも入ります。
  ほかの空白は、ノーブレークスペースと U+3000 も含めて、
  period の前ではインデントです。
  period の末尾のノーブレークスペースと U+3000 は period に入ります。
  [fixture: timeline/db-crlf-line-ends]
  [fixture: timeline/db-lone-cr-line-ends]
  [fixture: timeline/db-blank-line-between-tasks]
  [fixture: timeline/db-whitespace-only-line]
  [fixture: timeline/db-whitespace-after-last-line]
  [fixture: timeline/lex-period-line-separator-inside]
  [fixture: timeline/lex-period-paragraph-separator-inside]
  [fixture: timeline/lex-event-line-separator-inside]
  [fixture: timeline/lex-event-paragraph-separator-inside]
  [fixture: timeline/lex-section-line-separator-inside]
  [fixture: timeline/lex-line-separator-before-period]
  [fixture: timeline/lex-line-separator-before-event-colon]
  [fixture: timeline/lex-line-separator-after-header]
  [fixture: timeline/lex-ideographic-space-indentation]
  [fixture: timeline/lex-ideographic-space-at-end-of-period]
  [fixture: timeline/lex-no-break-space-around-period-and-event]
- `title`、`accTitle`、`accDescr` は `sanitizeText` を通ります。
  `securityLevel` が mermaid.js の値のどれでもなく、HTML のラベルが有効なら、
  文字を置き換えたものを持ちます
  （[db-from-tree.md](./db-from-tree.md) の文字の置き換えを参照）。
  section、period、event は変わりません。
  テーマと timeline の設定は、Db を何も変えません。
  [fixture: timeline/config-security-level-other-title-and-accessibility]
  [fixture: timeline/config-security-level-other-accessibility-block]
  [fixture: timeline/config-security-level-other-html-labels-false]
  [fixture: timeline/config-security-level-other-flowchart-html-labels-false]
  [fixture: timeline/config-security-level-other-sections-periods-events]
  [fixture: timeline/config-security-level-loose-title]
  [fixture: timeline/config-security-level-sandbox-title]
  [fixture: timeline/config-theme-and-timeline-settings]
- すべての欄を一度に。
  [fixture: timeline/db-everything]

値は、空白も含めて、Db が持つとおりに記録します。

## sankey

要約の欄は次のとおりです。

| 欄      | 内容                                                       |
| ------- | ---------------------------------------------------------- |
| `title` | フロントマターのタイトル。なければ空のテキスト。           |
| `nodes` | ノードの id。各ノードを 1 度だけ、名前が出た順に並べます。 |
| `links` | リンク。ソースの順。                                       |

リンクは、ノードの id である `source` と `target`、
および数である `value` を持ちます。
有限の数でない値は、その数のテキストになります。
`"NaN"`、`"Infinity"`、`"-Infinity"` です。
JSON にそのような数がないからです。

`normalizeSankey()`（`src/normalizers/sankey.ts`）は、`sankey` の Db を
要約します。
Db は、ブラウザーの機能も、時刻も、乱数も読まず、
構文にたどるリンクもありません。
このため、要約に Db のパッチはいりません。
Db は、すべての sankey 図が共有する 1 つのモジュールで、
[`clear()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L20-L25)
が、構文解析のたびにその状態を初期化します。
要約は、ノードとリンクを id で並べる
[`getGraph()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L63-L70)
と、タイトルを読みます。
次のものを、それぞれに書いた理由で捨てます。

- `getAccTitle()` と `getAccDescription()`:
  文法にそれらの文がないので、常に空のテキストです。
- `getNodes()` の `SankeyNode` と、リンクが持つ `SankeyNode`: id の繰り返し。

値を、欄ごとに述べます。
テキストは、まず
[`prepareTextForParsing()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyUtils.ts#L1-L8)
で整えられます。
[この関数](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDiagram.ts#L9-L10)
は、構文解析の前に呼ばれ、
テキスト全体の両端の空白を取り除き、
テキストのどこでも、改行と復帰の連なりを 1 つの改行にします。
コメント行、ディレクティブ、フロントマターは、どの図でも、これより前に
取り除かれます。

- ヘッダーは `sankey` か `sankey-beta` です。
  [検出器](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDetector.ts#L5-L7)は小文字だけを読み、
  字句解析は `-beta` を大文字小文字を問わず読みます。
  ヘッダーの前の空白は取り除かれ、
  その前の空行、コメント行、ディレクティブの行も取り除かれます。
  ヘッダーに続けて書いた語、ダッシュ、ASCII の外の文字は、
  ヘッダーではありません。
  [fixture: sankey/header-non-ascii-suffix]
  [fixture: sankey/header-beta-non-ascii-suffix]
  [fixture: sankey/db-header-beta]
  [fixture: sankey/db-header-beta-upper-case]
  [fixture: sankey/header-upper-case]
  [fixture: sankey/header-capitalized]
  [fixture: sankey/header-word-suffix]
  [fixture: sankey/header-beta-suffix]
  [fixture: sankey/header-dash-suffix]
  [fixture: sankey/header-indented]
  [fixture: sankey/header-tab-indented]
  [fixture: sankey/header-nbsp-before]
- ヘッダーはその行を終えます。
  字句解析はそこで改行を求めるので、
  ヘッダーの行でその後ろにある文字、空白、タブ、`%%` は拒否されます。
  ヘッダーの後ろのコメント行、ディレクティブの行、空行は、取り除かれ、
  何も変えません。
  ディレクティブは取り除かれ、あとに残るもので決まります。
  ヘッダーに続けて書けばヘッダーが残り、空白のあとに書けば空白が残って、
  拒否されます。
  [fixture: sankey/header-record-on-header-line]
  [fixture: sankey/header-trailing-spaces]
  [fixture: sankey/header-trailing-tab]
  [fixture: sankey/header-comment-on-header-line]
  [fixture: sankey/header-after-blank-lines]
  [fixture: sankey/header-after-comment-line]
  [fixture: sankey/header-after-directive-line]
  [fixture: sankey/header-then-directive-line]
  [fixture: sankey/header-directive-glued-to-header]
  [fixture: sankey/header-directive-after-space-on-header-line]
- 図にはレコードが 1 つ以上いります。
  ヘッダーだけ、またはその後ろが空行やコメント行だけなら、拒否されます。
  [fixture: sankey/header-only]
  [fixture: sankey/header-without-line-feed]
  [fixture: sankey/header-blank-line-only]
  [fixture: sankey/header-beta-only]
  [fixture: sankey/header-then-comment-line-only]
  [fixture: sankey/header-only-after-frontmatter]
- 各行がレコードで、レコードは、1 つ目の欄から 2 つ目の欄へのリンクで、
  3 つ目の欄の数を持ちます。
  リンクはソースの順です。
  最後の行に改行はいらず、空行は何も変えず、
  レコードの前後の空白はレコードの一部ではありません。
  [fixture: sankey/db-link-basic]
  [fixture: sankey/db-two-links]
  [fixture: sankey/db-no-line-feed-at-end]
  [fixture: sankey/db-blank-lines-between]
  [fixture: sankey/db-indented-records]
  [fixture: sankey/db-trailing-spaces-line]
- 空白だけの行は欄になります。
  そのため、2 つのレコードの間やヘッダーの後ろでは拒否され、
  テキストの末尾では末尾とともに取り除かれます。
  [fixture: sankey/gram-whitespace-line-between]
  [fixture: sankey/gram-whitespace-line-after-header]
  [fixture: sankey/db-whitespace-line-at-end]
- CRLF と単独の CR は、改行と同じに行を終えます。
  U+2028 と U+2029 は行を終えません。
  レコードの間や最初のレコードの前では拒否され、
  テキストの末尾では空白として取り除かれます。
  ノーブレークスペース、U+3000、U+FEFF、タブも同じです。
  ヘッダーの前の U+FEFF も同じに取り除かれます。
  レコードの前、欄の中、ヘッダーの後ろ、
  次のレコードが続く値の後ろでは、
  ノーブレークスペース、U+FEFF、タブは、欄の文字ではないので拒否されます。
  [fixture: sankey/db-crlf-line-ends]
  [fixture: sankey/db-lone-cr-line-ends]
  [fixture: sankey/db-trailing-nbsp-at-end]
  [fixture: sankey/db-trailing-line-separator-at-end]
  [fixture: sankey/db-trailing-ideographic-space-at-end]
  [fixture: sankey/gram-line-separator-between-records]
  [fixture: sankey/gram-line-separator-before-first-record]
  [fixture: sankey/gram-no-break-space-before-record]
  [fixture: sankey/db-trailing-paragraph-separator-at-end]
  [fixture: sankey/gram-paragraph-separator-between-records]
  [fixture: sankey/db-byte-order-mark-at-start]
  [fixture: sankey/gram-byte-order-mark-after-header]
  [fixture: sankey/gram-byte-order-mark-before-record]
  [fixture: sankey/gram-byte-order-mark-in-field]
  [fixture: sankey/gram-byte-order-mark-between-records]
  [fixture: sankey/db-byte-order-mark-at-end]
  [fixture: sankey/db-tab-at-end-of-text]
  [fixture: sankey/gram-tab-after-value-before-record]
- 引用符のない欄は、次のコンマか行末までです。
  欄の前後の空白は欄の一部ではありません。
  [字句解析](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L25)が許す文字のうち、コンマと引用符以外を含められます。
  許す文字は、空白と `!` から `~` までの文字です。
  このため `;`、`#`、`<`、`>`、`&`、`'`、スラッシュ、バックスラッシュ、
  テキストの中の `%` は欄の文字です。
  ただし次の項目が落とす `;` は除きます。
  マークアップは書いたとおりに残り、
  文字参照を始めない `#` も同じです（`a#35` には `;` がありません）。
  引用符で始まらない欄の中の引用符は、拒否されます。
  [fixture: sankey/db-fields-trimmed]
  [fixture: sankey/db-text-with-spaces]
  [fixture: sankey/db-text-punctuation]
  [fixture: sankey/db-text-semicolon-and-hash]
  [fixture: sankey/db-text-hash-leading]
  [fixture: sankey/db-text-slashes]
  [fixture: sankey/db-text-ampersand-and-angle]
  [fixture: sankey/db-text-html-tags]
  [fixture: sankey/db-text-apostrophe]
  [fixture: sankey/db-text-percent-in-field]
  [fixture: sankey/db-text-percent-in-target]
  [fixture: sankey/gram-quote-in-unquoted-field]
  [fixture: sankey/gram-doubled-quote-in-unquoted-field]
  [fixture: sankey/db-text-reference-without-semicolon]
  [fixture: sankey/db-text-semicolon-at-end-of-field]
- `;` は、どの図種にもある
  [`style` と `classDef` の行の規則](../../spec/docs/common.ja.md#style-行と-classdef-行)
  で落とされます。
  テキストの行に、`style`、その後ろの空白でない文字が続く `:` と `#`、
  さらにその後ろの `;` があれば、その行の最後の `;` が落ちます。
  そのあと `classDef` でも同じことをします。
  ここでの行はテキストの行で、引用符の中の行も 1 つの行です。
  規則は行のすべての欄を引用符の内外を問わず読み、
  行の最後の `;` を、どこにあっても落とします。
  [fixture: sankey/lex-style-line-semicolon-source]
  [fixture: sankey/lex-style-line-semicolon-target]
  [fixture: sankey/lex-style-line-semicolon-in-quotes]
  [fixture: sankey/lex-style-line-semicolon-in-second-line-of-quotes]
  [fixture: sankey/lex-classdef-line-semicolon]
  [fixture: sankey/lex-style-line-last-semicolon-only]
  [fixture: sankey/lex-style-line-semicolon-in-other-field]
  [fixture: sankey/lex-style-line-semicolon-at-end-of-field]
  [fixture: sankey/lex-style-line-space-before-colon]
  [fixture: sankey/lex-style-line-text-between-colon-and-hash]
- この規則はテキストだけで決まり、どの行にも合うわけではありません。
  `:` の後ろに `#` がないとき、`:` と `#` の間に空白があるとき、
  語が `Style` や `classdef` のときは、`;` が残ります。
  `#` と単語文字の後ろの `;` は文字参照を終え、
  そのプレースホルダーは拒否されます（次の項目）。
  最初の `;` の後ろにもう 1 つ `;` がある行も、
  最初の `;` が残るので拒否されます。
  規則は 1 つの行を読むので、別の行の `;` は残ります。
  [fixture: sankey/lex-style-line-without-hash-keeps-semicolon]
  [fixture: sankey/lex-style-line-does-not-cross-lines]
  [fixture: sankey/lex-style-line-does-not-cross-lines-in-quotes]
  [fixture: sankey/lex-style-upper-case-entity]
  [fixture: sankey/lex-classdef-lower-case-entity]
  [fixture: sankey/lex-style-line-last-semicolon-of-two]
  [fixture: sankey/lex-style-line-space-after-colon]
- 引用符の中でも外でも、その文字の集合の文字だけが許されます。
  ASCII の外の文字、タブ、ノーブレークスペース、U+3000、U+2028、U+2029 は、
  欄のどこにあっても、レコードや欄の前にあっても、拒否されます。
  `#35;` や `#amp;` のような文字参照は、構文解析の前にプレースホルダーに
  置き換えられ、プレースホルダーは ASCII の外にあります。
  そのため、文字参照を含む欄は拒否されます。
  [fixture: sankey/gram-non-ascii]
  [fixture: sankey/gram-cjk]
  [fixture: sankey/gram-emoji]
  [fixture: sankey/gram-no-break-space-in-field]
  [fixture: sankey/gram-ideographic-space-in-field]
  [fixture: sankey/gram-line-separator-in-field]
  [fixture: sankey/gram-paragraph-separator-in-field]
  [fixture: sankey/gram-tab-in-field]
  [fixture: sankey/gram-tab-before-record]
  [fixture: sankey/gram-tab-before-second-field]
  [fixture: sankey/gram-tab-after-first-field]
  [fixture: sankey/gram-quoted-non-ascii]
  [fixture: sankey/gram-quoted-line-separator]
  [fixture: sankey/gram-entity-numeric]
  [fixture: sankey/gram-entity-named]
  [fixture: sankey/gram-entity-in-quoted-field]
  [fixture: sankey/gram-entity-in-quoted-value]
- 引用符つきの欄は、コンマを含められ、
  その中の 2 つの引用符は、欄の 1 つの引用符です。
  文法の
  [`escaped`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L65)
  です。
  欄を囲む引用符は欄の一部ではありません。
  引用符は左から右へ読まれ、後ろに引用符が続かない引用符が欄を閉じます。
  このため、文字の後ろの 5 つの引用符は、欄の 2 つの引用符と閉じる引用符です。
  [fixture: sankey/db-quoted-fields]
  [fixture: sankey/db-quoted-comma]
  [fixture: sankey/db-quoted-doubled-quote]
  [fixture: sankey/db-quoted-four-quotes]
  [fixture: sankey/db-quoted-doubled-quote-at-end]
  [fixture: sankey/db-quoted-doubled-quote-at-start]
  [fixture: sankey/db-quoted-only-quote]
  [fixture: sankey/db-quoted-two-quotes-at-end]
  [fixture: sankey/db-id-quote-and-comma]
  [fixture: sankey/db-quoted-and-unquoted-same-id]
- 引用符の中の改行は欄の一部です。
  CRLF、単独の CR、空行の連なりは、そこでは `prepareTextForParsing()` により
  1 つの改行になります。
  改行の前後の空白と、空白だけの行は、残ります。
  [fixture: sankey/db-quoted-line-feed]
  [fixture: sankey/db-quoted-crlf]
  [fixture: sankey/db-quoted-cr]
  [fixture: sankey/db-quoted-blank-line-collapses]
  [fixture: sankey/db-quoted-crlf-blank-line-collapses]
  [fixture: sankey/db-quoted-space-line-kept]
  [fixture: sankey/db-quoted-trailing-spaces-before-line-feed]
  [fixture: sankey/db-quoted-leading-spaces-after-line-feed]
- 欄はそのあと、どの欄とも同じに trim されます。
  このため、引用符つきの欄の両端の空白と改行は、id の一部ではありません。
  引用符つきの値も trim されます。
  [fixture: sankey/db-quoted-leading-line-feed]
  [fixture: sankey/db-quoted-trailing-line-feed]
  [fixture: sankey/db-quoted-both-line-feed-ids]
  [fixture: sankey/db-quoted-line-feeds-only]
  [fixture: sankey/db-quoted-space-only]
  [fixture: sankey/db-quoted-spaces-trimmed]
  [fixture: sankey/db-quoted-space-before-value]
- 空白だけの欄、または引用符の中の空白と改行だけの欄は、空の id で、
  そのためのノードが作られます。
  中に何もない欄は、引用符があってもなくても拒否されます。
  空の id は、空白を 1 つ書いて表します。
  [fixture: sankey/db-spaces-only-source-id]
  [fixture: sankey/db-spaces-only-target-id]
  [fixture: sankey/db-spaces-only-source-id-first-record]
- 閉じない引用符、開く引用符の前や閉じる引用符の後ろの文字、
  引用符の前後の空白、空の引用符つきの欄は、拒否されます。
  [fixture: sankey/gram-quoted-empty]
  [fixture: sankey/gram-quoted-empty-value]
  [fixture: sankey/gram-quoted-unclosed]
  [fixture: sankey/gram-quoted-value-unclosed]
  [fixture: sankey/gram-text-after-closing-quote]
  [fixture: sankey/gram-text-before-opening-quote]
  [fixture: sankey/gram-space-before-opening-quote]
  [fixture: sankey/gram-space-after-closing-quote]
  [fixture: sankey/gram-space-before-quoted-second-field]
  [fixture: sankey/gram-quoted-value-then-text]
  [fixture: sankey/gram-quote-after-space-in-field]
  [fixture: sankey/gram-quoted-then-trailing-comma]
  [fixture: sankey/gram-quoted-unclosed-at-end-of-text]
- レコードは、ちょうど 3 つの欄を持ちます。
  [文法](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L51-L58)がそう定めています。
  それより少ない行、多い行、3 つ目の欄の後ろのコンマ、空の欄は、
  拒否されます。
  [fixture: sankey/gram-two-columns]
  [fixture: sankey/gram-one-column]
  [fixture: sankey/gram-four-columns]
  [fixture: sankey/gram-trailing-comma]
  [fixture: sankey/gram-empty-source]
  [fixture: sankey/gram-empty-target]
  [fixture: sankey/gram-empty-value]
  [fixture: sankey/gram-commas-only]
  [fixture: sankey/gram-comma-only-line]
  [fixture: sankey/gram-short-line-after-record]
  [fixture: sankey/gram-one-field-after-record]
- `value` は、trim した 3 つ目の欄の
  [`parseFloat()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L55)
  です。
  数はテキストの先頭から読まれます。
  符号、小数点、指数、先頭の点が読まれ、数の後ろは捨てられます
  （`1abc`、`1 2`、`1_000`、`1.2.3`。`0x10` は `0` です。
  数の後ろの `%`、`#`、`;`、空白と `;` も、捨てられるテキストの一部です）。
  負の値は受け入れられます。
  `-0` は Db では数 -0 ですが、JSON に -0 はないので、要約は 0 です。
  [fixture: sankey/db-value-negative]
  [fixture: sankey/db-value-plus-sign]
  [fixture: sankey/db-value-zero]
  [fixture: sankey/db-value-decimal]
  [fixture: sankey/db-value-leading-dot]
  [fixture: sankey/db-value-trailing-dot]
  [fixture: sankey/db-value-exponent]
  [fixture: sankey/db-value-exponent-negative]
  [fixture: sankey/db-value-hexadecimal]
  [fixture: sankey/db-value-text-after-number]
  [fixture: sankey/db-value-two-numbers]
  [fixture: sankey/db-value-underscore]
  [fixture: sankey/db-value-two-dots]
  [fixture: sankey/db-value-spaces]
  [fixture: sankey/db-value-percent-after-number]
  [fixture: sankey/db-value-hash-after-number]
  [fixture: sankey/db-quoted-value]
  [fixture: sankey/db-quoted-value-with-comma]
  [fixture: sankey/db-quoted-value-with-quotes]
  [fixture: sankey/db-value-negative-zero]
  [fixture: sankey/db-value-semicolon-after-number]
  [fixture: sankey/db-value-space-semicolon-after-number]
  [fixture: sankey/db-value-two-semicolons-after-number]
- 数で始まらない値は `NaN` で、レコードは受け入れられます。
  `NaN` はテキスト `"NaN"` として記録します。
  空白だけの値もそうです。
  ただしテキストの末尾にあるときは、空白が取り除かれ、
  レコードは欄の数のために拒否されます。
  [fixture: sankey/db-value-not-a-number]
  [fixture: sankey/db-value-number-after-text]
  [fixture: sankey/db-value-nan-text]
  [fixture: sankey/db-quoted-value-not-a-number]
  [fixture: sankey/db-spaces-only-value]
  [fixture: sankey/gram-spaces-only-value-at-end-of-text]
- `Infinity` と `-Infinity` はその数として読まれ、
  倍精度に収まらない大きな数（`1e999`）もそうです。
  テキスト `"Infinity"` と `"-Infinity"` として記録します。
  [fixture: sankey/db-value-infinity]
  [fixture: sankey/db-value-negative-infinity]
  [fixture: sankey/db-value-overflow]
- ノードは、trim して 2 つの引用符を 1 つにした id で
  [探すか作ります](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L48-L58)。
  id は大文字小文字を区別し、引用符のあるなしにかかわらず同じテキストは
  1 つのノードです。
  ノードは、最初のリンクの source、次に target の順で名前が出ます。
  ノード自身へのリンク、同じノードの 2 つのリンク、戻るリンクは、
  どれも受け入れられ、リンクごとに 1 つ加えられます。
  オブジェクトのプロパティの名前も、ほかと同じ id です。
  [fixture: sankey/db-self-link]
  [fixture: sankey/db-duplicate-link]
  [fixture: sankey/db-reverse-link]
  [fixture: sankey/db-node-order]
  [fixture: sankey/db-ids-case-sensitive]
  [fixture: sankey/db-ids-compared-after-trim]
  [fixture: sankey/db-ids-of-object-prototype]
- 字下げのあとに `%%` で始まる行はコメント行で、取り除かれます。
  引用符の中でも同じで、前後の行は 1 つの欄に改行でつながります。
  `%%` だけの行はコメント行ではなく、`#` はコメントを始めません。
  どちらも欄になり、欄の数のために拒否されます。
  [fixture: sankey/db-comment-line]
  [fixture: sankey/db-comment-line-between-records]
  [fixture: sankey/db-comment-line-with-blank-lines]
  [fixture: sankey/db-comment-line-at-end]
  [fixture: sankey/db-comment-line-indented]
  [fixture: sankey/gram-percent-line-alone]
  [fixture: sankey/gram-hash-line-alone]
  [fixture: sankey/db-quoted-comment-line]
  [fixture: sankey/db-quoted-directive-line]
- ディレクティブは、テキストを読む前に、どこにあっても取り除かれます。
  このため前後の部分がつながります。
  欄の中、値の後ろ、レコードの先頭、引用符の中が対象です。
  図の設定を持つディレクティブは、Db を何も変えません。
  引用符の中のディレクティブの行も、
  コメント行と同じに取り除かれます（上を参照）。
  `}%%` のないディレクティブは、
  次の行の先頭の語を引数に取ります
  （[ディレクティブ](../../spec/docs/common.ja.md#ディレクティブ)）。
  `a,b,1 %%{init` と次の行 `c,d,2` は `a,b,1 ,d,2` になって 4 つの欄を持ち、
  拒否されます。
  テキストの末尾なら何も取らず、レコードは残ります。
  [fixture: sankey/db-directive-in-field]
  [fixture: sankey/db-directive-at-start-of-record]
  [fixture: sankey/db-directive-after-value]
  [fixture: sankey/db-directive-in-quotes]
  [fixture: sankey/db-directive-sankey-settings]
  [fixture: sankey/gram-directive-unclosed-takes-next-line]
  [fixture: sankey/db-directive-unclosed-at-end]
- `title` はフロントマターのタイトルで、Diagram が `setDiagramTitle` で
  Db に渡します。
  タイトルの空白は残ります。
  文法に `title` の文もアクセシビリティの文もないので、
  そのような行はレコードとして読まれ、欄の数のために拒否されます。
  フロントマターの設定は、Db を何も変えません。
  [fixture: sankey/db-title-frontmatter]
  [fixture: sankey/db-title-frontmatter-spaces]
  [fixture: sankey/gram-title-statement]
  [fixture: sankey/gram-acc-title-statement]
  [fixture: sankey/db-frontmatter-config]
- `title` と id は `sanitizeText` を通ります。
  `securityLevel` が mermaid.js の値のどれでもなく、HTML ラベルが有効なら、
  置き換えられた文字を持ちます
  （[db-from-tree.md](./db-from-tree.md) の文字の置き換えを参照）。
  `loose` と `sandbox` では、また設定の最上位か `flowchart` の `htmlLabels` が
  false なら、書いたとおりです。
  テーマと図の設定は、何も変えません。
  [fixture: sankey/config-security-level-other-title-and-ids]
  [fixture: sankey/config-security-level-other-html-labels-false]
  [fixture: sankey/config-security-level-other-flowchart-html-labels-false]
  [fixture: sankey/config-security-level-loose-ids]
  [fixture: sankey/config-security-level-sandbox-ids]
  [fixture: sankey/config-sankey-settings]
- すべての欄を一度に。
  [fixture: sankey/db-everything]

値は、空白も含めて、Db が持つとおりに記録します。

## xychart

要約の欄は次のとおりです。

| 欄            | 内容                                                        |
| ------------- | ----------------------------------------------------------- |
| `orientation` | `vertical` か `horizontal`。                                |
| `title`       | 図のタイトル。最後の `title` の文、なければフロントマター。 |
| `accTitle`    | アクセシビリティのタイトル。なければ空のテキスト。          |
| `accDescr`    | アクセシビリティの説明。なければ空のテキスト。              |
| `xAxis`       | x 軸。                                                      |
| `yAxis`       | y 軸。                                                      |
| `plots`       | プロット。ソースの順。                                      |

軸は、`type`、`title`、
型が `band` なら カテゴリーのテキストである `categories`、
型が `linear` なら数である `min` と `max` を持ちます。
プロットは、`type`（`line` か `bar`）、`title`、`data`、
ラベルが書かれた line では `pointLabels` を持ちます。
有限でない数は、JSON にそのような数がないので、数のテキスト（`"Infinity"`、
`"-Infinity"`）になり、
`-0` は、JSON に -0 がないので 0 です。

`normalizeXyChart()`（`src/normalizers/xychart.ts`）は、
`xychart` の Db を要約します。
Db は、構文解析のあいだ、ブラウザーの機能も、時刻も、乱数も読まないので、
要約に Db のパッチはいりません。
Db は、すべての xychart 図が共有する 1 つのモジュールで、
[`clear()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L223-L232) が、
構文解析のたびにその状態を初期化します。
要約は、共通の Db のタイトルとアクセシビリティのテキスト、
[`getChartConfig()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L215-L217) の向き、
[`getXYChartData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L219-L221) を読みます。
次のものを、それぞれに書いた理由で捨てます。

- `plots[].strokeFill`、`plots[].strokeWidth`、`plots[].fill`:
  描画が使う色と幅で、プロットの番号からテーマで決まります。
- `getChartThemeConfig()` と、`chartOrientation` を除く `getChartConfig()`:
  テーマの色と描画の設定で、サイトが与えます。
- `getXYChartData().title`:
  図を描くとき（
  [`getDrawableElem()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L203-L209)）にだけ設定されるので、
  テキストを解析した時点では空のテキストです。
  タイトルは共通の Db のものです。

軸の範囲とプロットの組の x は、値と軸から決まりますが、
Db は各文を実行する場所で、その時点の状態から計算します
（
[`transformDataWithoutCategory()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L125-L164)、
[`setYAxisRangeFromPlotData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L112-L123)）。
このため、プロットの後ろの文は、プロットがすでに作ったものを変えません。
Db が持つとおりに保ちます。

値を、欄ごとに述べます。
テキストは
[字句解析](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L15-L75)と
[文法](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L83-L175)が読みます。

- ヘッダーは `xychart` か `xychart-beta` です。
  [検出器](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDetector.ts#L9-L11)は小文字だけを読むので、
  `XYCHART` と `Xychart-Beta` は拒否されますが、
  字句解析は大文字小文字を問わず読みます。
  ヘッダーに続けて書いた語、ダッシュと数字、ASCII の外の文字は、
  ヘッダーではありません。
  ヘッダーの後ろのコロン、波括弧、`#`、引用符、数字、コンマ、カッコは拒否され、
  ヘッダーの前の `#` で始まる行も拒否されます。
  どの検出器もそのテキストを読まないからです。
  ヘッダーの後ろに文がなくても受理され、図は空です。
  [fixture: xychart/db-header-beta-only]
  [fixture: xychart/db-header-plain]
  [fixture: xychart/header-upper-case]
  [fixture: xychart/header-beta-capitalized]
  [fixture: xychart/header-word-suffix]
  [fixture: xychart/header-plain-word-suffix]
  [fixture: xychart/header-dash-suffix]
  [fixture: xychart/header-non-ascii-suffix]
  [fixture: xychart/header-without-line-feed]
  [fixture: xychart/gram-header-after-hash-line]
  [fixture: xychart/gram-header-brace-suffix]
  [fixture: xychart/gram-header-bracket-suffix]
  [fixture: xychart/gram-header-colon-suffix]
  [fixture: xychart/gram-header-comma-suffix]
  [fixture: xychart/gram-header-digit-suffix]
  [fixture: xychart/gram-header-hash-suffix]
  [fixture: xychart/gram-header-quote-suffix]
- ヘッダーの前の空白、タブ、空行、ノーブレークスペース、U+FEFF、コメント行、
  ディレクティブの行は、何も変えません。
  ヘッダーに続けて書いたディレクティブは取り除かれ、
  その後ろのコメントは、空白があってもなくても読み飛ばされます。
  ヘッダーの前でも後ろでも、`%%` だけの行と `%%{ }%%` の行はコメント行です。
  [fixture: xychart/header-indented]
  [fixture: xychart/header-tab-indented]
  [fixture: xychart/header-after-bare-percent-line]
  [fixture: xychart/header-after-bare-percent-line-and-whitespace-line]
  [fixture: xychart/header-after-blank-lines]
  [fixture: xychart/header-after-comment-line]
  [fixture: xychart/header-after-directive-line]
  [fixture: xychart/header-after-empty-braces-line]
  [fixture: xychart/header-nbsp-before]
  [fixture: xychart/header-bom-before]
  [fixture: xychart/header-directive-glued-after-header]
  [fixture: xychart/header-comment-on-header-line]
  [fixture: xychart/header-comment-glued-to-header]
  [fixture: xychart/header-bare-percent-line-after-header]
- ヘッダーの行に文を続けて書けます。`;` も続けられ、行を終えます。
  2 つ目のヘッダーは、自分の行でも 1 つ目の後ろでも、
  もう一度ヘッダーとして読まれます。
  [fixture: xychart/header-statement-on-header-line]
  [fixture: xychart/header-line-on-header-line]
  [fixture: xychart/header-semicolon]
  [fixture: xychart/header-semicolon-only]
  [fixture: xychart/header-semicolon-spaced]
  [fixture: xychart/header-leading-semicolon]
  [fixture: xychart/header-twice]
  [fixture: xychart/header-twice-same-line]
- `orientation` は `vertical` で、
  ヘッダーの後ろに語 `horizontal` が続くと `horizontal` です。
  字句解析は語を大文字小文字を問わず読みますが、
  Db は `horizontal` 以外の語を縦として扱うので、
  `HORIZONTAL` と `Horizontal` は `vertical` になります。
  ヘッダーと語は、空白かタブで分けられ、語のあとに文を続けられます。
  語は文でもテキストでもありません。
  次の行にある、2 つある、別の語に続けて書く、文の後ろにある、
  タイトルやカテゴリー、軸のタイトルとして書くと拒否されます。
  引用符の中ではテキストです。
  [fixture: xychart/db-orientation-capitalized]
  [fixture: xychart/db-orientation-horizontal]
  [fixture: xychart/db-orientation-in-quotes]
  [fixture: xychart/db-orientation-plain-header]
  [fixture: xychart/db-orientation-tab]
  [fixture: xychart/db-orientation-two-spaces]
  [fixture: xychart/db-orientation-upper-case]
  [fixture: xychart/db-orientation-vertical]
  [fixture: xychart/db-orientation-vertical-upper-case]
  [fixture: xychart/db-orientation-with-statement]
  [fixture: xychart/gram-orientation-after-statement]
  [fixture: xychart/gram-orientation-as-axis-title]
  [fixture: xychart/gram-orientation-as-category]
  [fixture: xychart/gram-orientation-as-title]
  [fixture: xychart/gram-orientation-on-next-line]
  [fixture: xychart/gram-orientation-twice]
  [fixture: xychart/gram-orientation-word-suffix]
- ヘッダーに向きの語がなければ、
  `orientation` は設定 `xyChart.chartOrientation` で、既定は `vertical` です。
  設定がサイトのものでも、フロントマターのものでも、
  ディレクティブのものでも同じで、
  ヘッダーの語が設定に優先します。
  図のほかの設定、テーマ、パレットの色は、Db を何も変えません。
  [fixture: xychart/config-orientation-directive]
  [fixture: xychart/config-orientation-frontmatter]
  [fixture: xychart/config-orientation-frontmatter-header-wins]
  [fixture: xychart/config-orientation-header-wins]
  [fixture: xychart/config-orientation-setting-horizontal]
  [fixture: xychart/config-settings-do-not-change-db]
- 文は、行末、`;`、テキストの終わりで終わります。
  空行と空の文は何も変えず、文の前後の、空白、タブ、垂直タブ、改ページ、
  ノーブレークスペース、U+FEFF、U+3000 も同じです。
  CRLF と単独の CR は、改行と同じに行を終えます。
  語の後ろの U+2028 と U+2029 は空白です。
  テキストの終わりの文に改行はいりません。
  [fixture: xychart/db-statement-blank-lines]
  [fixture: xychart/db-statement-leading-semicolon]
  [fixture: xychart/db-statement-tab-indented]
  [fixture: xychart/db-lines-form-feed-before-statement]
  [fixture: xychart/db-lines-keyword-bom-end]
  [fixture: xychart/db-lines-nbsp-after-statement]
  [fixture: xychart/db-lines-no-line-feed-at-end]
  [fixture: xychart/db-lines-prototype-title]
  [fixture: xychart/db-lines-statement-on-header-line-crlf]
  [fixture: xychart/db-lines-statements-after-bom-and-tab]
  [fixture: xychart/db-lines-trailing-spaces]
  [fixture: xychart/db-lines-trailing-tab]
  [fixture: xychart/db-lines-unicode-line-separator-between-statements]
  [fixture: xychart/db-lines-vertical-tab-before-statement]
  [fixture: xychart/db-semicolon-after-statement]
  [fixture: xychart/db-semicolon-line-alone]
  [fixture: xychart/db-semicolon-spaced]
  [fixture: xychart/db-semicolon-statements]
  [fixture: xychart/db-semicolon-twice]
  [fixture: xychart/db-title-crlf-line-ends]
  [fixture: xychart/db-title-lone-cr-line-ends]
  [fixture: xychart/db-title-line-separator-end]
  [fixture: xychart/db-title-paragraph-separator-end]
  [fixture: xychart/db-title-bom-after-word]
  [fixture: xychart/db-title-bom-before-keyword]
  [fixture: xychart/db-title-form-feed-after-word]
  [fixture: xychart/db-title-nbsp-before-keyword]
  [fixture: xychart/db-title-ideographic-space]
- タイトルはテキストです。
  引用符のテキストは、引用符の間にあるものから両端の空白を除いたもの、
  引用符のない語は、語の間の空白を除いてつないだものです。
  語は、英字、数字、`-`、`_`、`.`、`+`、`=`、`*`、`&`、`#` を含みます。
  `#` はコメントを始めないので、`T # c` はタイトル `T#c` です。
  引用符のテキストは、句読点、キーワード、空白の後ろの `%%`、マークアップ、
  ASCII の外の文字、
  バッククォート、改行を含められ、CRLF は 1 つの改行になります。
  [fixture: xychart/db-title-quoted]
  [fixture: xychart/db-title-bare-word]
  [fixture: xychart/db-title-bare-digit]
  [fixture: xychart/db-title-bare-number]
  [fixture: xychart/db-title-bare-words]
  [fixture: xychart/db-title-bare-characters]
  [fixture: xychart/db-title-quoted-spaces-trimmed]
  [fixture: xychart/db-title-quoted-special]
  [fixture: xychart/db-title-quoted-line-feed]
  [fixture: xychart/db-title-quoted-crlf]
  [fixture: xychart/db-title-quoted-non-ascii]
  [fixture: xychart/db-title-quoted-keyword]
  [fixture: xychart/db-title-quoted-hash-and-semicolon-apart]
  [fixture: xychart/db-title-quoted-percent]
  [fixture: xychart/db-title-quoted-html]
  [fixture: xychart/db-title-md-string]
  [fixture: xychart/db-title-hash-bare-word]
  [fixture: xychart/db-title-bare-hash-comment]
  [fixture: xychart/db-title-bare-percent-comment]
  [fixture: xychart/db-title-quoted-line-separator]
  [fixture: xychart/db-title-nbsp-between-words]
  [fixture: xychart/db-title-quoted-semicolon]
  [fixture: xychart/db-title-bare-semicolon]
  [fixture: xychart/db-title-semicolon-empty-statements]
- 最後の `title` の文がタイトルで、フロントマターのタイトルを置き換えます。
  フロントマターのタイトルは、文がなければタイトルで、空白もそのまま残ります。
  キーワードは大文字小文字を問わず、後ろにタブを置けます。
  `title` で始まる語はテキストですが、キーワードに続けて書いた語、`titles`、
  テキストとしての `title` や `Title` は拒否されます。
  [fixture: xychart/db-title-twice]
  [fixture: xychart/db-title-three-times]
  [fixture: xychart/db-title-bare-then-quoted]
  [fixture: xychart/db-title-frontmatter]
  [fixture: xychart/db-title-frontmatter-and-statement]
  [fixture: xychart/db-title-frontmatter-spaces]
  [fixture: xychart/db-title-at-end-of-text]
  [fixture: xychart/db-title-upper-case-keyword]
  [fixture: xychart/db-title-capitalized-keyword]
  [fixture: xychart/db-title-tab-separator]
  [fixture: xychart/db-title-keyword-prefix-word]
  [fixture: xychart/gram-title-glued]
  [fixture: xychart/gram-title-plural]
  [fixture: xychart/gram-title-keyword-as-text]
  [fixture: xychart/gram-title-bare-title-keyword]
- 引用符のテキストの中と、アクセシビリティのテキストの中の、
  文字参照はプレースホルダーになります。
  `#35;` もそうで、`a#b;c` の `#b;` もそうです。
  語でつながない `#` と `;` は、テキストの文字です。
  引用符のないタイトル、軸のタイトル、カテゴリー、プロットのタイトルでは、
  プレースホルダーが ASCII の外にあるので、文字参照は拒否されます。
  HTML のタグの引用符は `'` として読まれます。
  [fixture: xychart/lex-title-entity-in-quotes]
  [fixture: xychart/gram-title-entity-bare]
  [fixture: xychart/lex-title-quoted-hash-word-semicolon-entity]
  [fixture: xychart/lex-acc-descr-block-entity]
  [fixture: xychart/lex-acc-descr-entity]
  [fixture: xychart/lex-acc-title-entity]
  [fixture: xychart/db-title-html-tag-in-quotes]
- テキストのないタイトル、引用符だけで間に何もないタイトル、
  テキストが次の行にあるタイトル、
  引用符のテキストの後ろにテキストがあるタイトルは、拒否されます。
  閉じない引用符も、テキストの終わりでも、拒否されます。
  引用符のない語は、`,`、`:`、`/`、`(`、`)`、`'`、`<`、`>`、`[`、
  `]` と ASCII の外の文字を含められず、
  語に続けて書いた `%%` はその前の文字を取るので、タイトルは拒否されます。
  [fixture: xychart/gram-title-after-quoted]
  [fixture: xychart/gram-title-bare-angle]
  [fixture: xychart/gram-title-bare-apostrophe]
  [fixture: xychart/gram-title-bare-colon]
  [fixture: xychart/gram-title-bare-comma]
  [fixture: xychart/gram-title-bare-non-ascii]
  [fixture: xychart/gram-title-bare-parenthesis]
  [fixture: xychart/gram-title-bare-percent-at-end]
  [fixture: xychart/gram-title-bare-percent-inside]
  [fixture: xychart/gram-title-bare-slash]
  [fixture: xychart/gram-title-bare-square]
  [fixture: xychart/gram-title-comment-line-before-text]
  [fixture: xychart/gram-title-comment-line-between]
  [fixture: xychart/gram-title-empty-string]
  [fixture: xychart/gram-title-keyword-alone-at-end]
  [fixture: xychart/gram-title-no-text]
  [fixture: xychart/gram-title-quoted-unclosed]
  [fixture: xychart/gram-title-quoted-unclosed-at-end]
  [fixture: xychart/gram-title-text-on-next-line]
- `style` 行と `classDef` 行の行の規則は、`style:` か `classDef:`、
  その後ろの `#`、さらに後ろの `;` を持つ行の最後の `;` を、
  引用符の中のどのテキストからも落とします。
  タイトル、軸のタイトル、カテゴリー、プロットのタイトル、ラベル、
  アクセシビリティのテキストが対象です。
  `;` が 2 つあれば最初の `;` が残って文字参照を終え、
  大文字小文字が違う `Style`、`#` がない場合、
  `:` と `#` の間に空白がある場合は `;` が残り、
  引用符の中の行はそれだけで 1 つの行です。
  [fixture: xychart/lex-title-style-line-semicolon]
  [fixture: xychart/lex-style-line-classdef]
  [fixture: xychart/lex-style-line-does-not-cross-lines-in-quotes]
  [fixture: xychart/lex-style-line-no-hash]
  [fixture: xychart/lex-style-line-semicolon-in-second-line-of-quotes]
  [fixture: xychart/lex-style-line-semicolon-two]
  [fixture: xychart/lex-style-line-space-after-colon]
  [fixture: xychart/lex-style-line-statement-separator]
  [fixture: xychart/lex-style-line-upper-case-keyword]
  [fixture: xychart/db-x-axis-title-quoted-style-line-semicolon]
  [fixture: xychart/db-y-axis-title-quoted-style-line-semicolon]
  [fixture: xychart/db-x-axis-band-quoted-style-line-semicolon]
  [fixture: xychart/db-plot-title-style-line-semicolon]
  [fixture: xychart/db-label-style-line-semicolon]
  [fixture: xychart/lex-acc-descr-block-style-line-semicolon]
  [fixture: xychart/lex-acc-descr-style-line-semicolon]
  [fixture: xychart/lex-acc-title-style-line-semicolon]
- ディレクティブはテキストを読む前に取り除かれ、前後の部分がつながります。
  引用符のタイトルの中、タイトルの語の間と後ろ、キーワードの前、
  カテゴリーの間と語の中、数、範囲、矢印の中、キーワードとカッコの間が対象です。
  引用符のテキストの中のコメント行とディレクティブの行は、
  その行ごと取り除かれます。
  閉じないディレクティブは、テキストの終わりでは何も取らず、
  次の行の先頭の語を取り、その行は拒否されます。
  [fixture: xychart/db-title-directive-after-bare]
  [fixture: xychart/db-title-directive-before-keyword]
  [fixture: xychart/db-title-directive-in-quotes]
  [fixture: xychart/db-title-quoted-comment-line-inside]
  [fixture: xychart/db-title-quoted-directive-line-inside]
  [fixture: xychart/db-directive-after-plot]
  [fixture: xychart/db-directive-between-label]
  [fixture: xychart/db-directive-between-title-words]
  [fixture: xychart/db-directive-glued-to-keyword]
  [fixture: xychart/db-directive-in-arrow]
  [fixture: xychart/db-directive-in-range]
  [fixture: xychart/db-directive-line]
  [fixture: xychart/db-directive-unclosed-after-categories]
  [fixture: xychart/db-directive-unclosed-after-header]
  [fixture: xychart/db-directive-unclosed-after-plot]
  [fixture: xychart/db-directive-unclosed-at-end]
  [fixture: xychart/gram-directive-unclosed-next-line]
  [fixture: xychart/db-x-axis-band-directive]
  [fixture: xychart/db-x-axis-band-directive-in-word]
  [fixture: xychart/db-plot-directive-in-number]
  [fixture: xychart/db-plot-directive-inside]
- コメントは `%%` で、行の終わりまでです。
  コメント行と文の後ろのコメントは読み飛ばされます。
  直前の文字にくっついた `%%` はその文字を取ります。
  値やカテゴリーの閉じカッコ、数、語の後ろでは文が拒否され、
  引用符のテキストの閉じ引用符の後ろではコメントが読み飛ばされてテキストは残り、
  空白の後ろでは何も取りません。
  `#` はコメントを始めないので、`#` で始まる行は拒否され、
  単独の `%` もコメントではありません。
  [fixture: xychart/db-comment-after-bracket-line]
  [fixture: xychart/db-comment-after-statement]
  [fixture: xychart/db-comment-at-end]
  [fixture: xychart/db-comment-glued-after-quote]
  [fixture: xychart/db-comment-glued-after-quoted-axis-title]
  [fixture: xychart/db-comment-indented]
  [fixture: xychart/db-comment-line]
  [fixture: xychart/db-comment-line-between]
  [fixture: xychart/db-comment-spaced-after-range]
  [fixture: xychart/gram-comment-hash-line]
  [fixture: xychart/gram-comment-in-label-quotes-closing]
  [fixture: xychart/gram-comment-percent-single]
  [fixture: xychart/div-comment-glued-after-axis-title]
  [fixture: xychart/div-comment-glued-after-bracket]
  [fixture: xychart/div-comment-glued-after-categories]
  [fixture: xychart/div-comment-glued-after-label]
  [fixture: xychart/div-comment-glued-after-range]
  [fixture: xychart/div-comment-glued-after-title-word]
  [fixture: xychart/gram-plot-comment-inside]
  [fixture: xychart/db-plot-comment-after]
  [fixture: xychart/db-x-axis-band-comment-after]
- `xAxis` は、
  範囲を与える文があるまで `{ type: "band", title, categories }` です。
  `x-axis` の後ろのテキストがタイトルで、引用符でも語でもよく、なければ空です。
  後の `x-axis` は前の軸を、タイトルも含めて置き換えるので、
  タイトルのない文は空のタイトルを与えます。
  引用符のタイトルを 2 つ書くと拒否されます。
  引用符のないタイトルは、英字と `_`、`.`、`&`、`=`、`*`、`#`、`+`、
  `-` を含められますが、数字は含められません。
  数字は数を始め、数はタイトルの一部ではないので、
  `Q1`、`A-1`、`Year 2024`、`2024` は軸のタイトルとして拒否され、
  `"Q1"` は受理されます。
  図のタイトル、プロットのタイトル、カテゴリーは数字を含められます。
  文のテキストはその行にあり、
  キーワードとテキストやカッコの間のコメントや改行はそれらをつなぎません。
  その文は拒否されます。
  キーワードは大文字小文字を問わず、カッコや引用符を空白なしで続けられます。
  文字を続けて書くと拒否され、`x-axis` だけも拒否されます。
  [fixture: xychart/db-x-axis-title-at-end-of-text]
  [fixture: xychart/db-x-axis-title-bare-characters]
  [fixture: xychart/db-x-axis-title-bare-hyphen]
  [fixture: xychart/db-x-axis-title-bare-word]
  [fixture: xychart/db-x-axis-title-keyword-prefix]
  [fixture: xychart/db-x-axis-title-quoted]
  [fixture: xychart/db-x-axis-title-quoted-digit]
  [fixture: xychart/db-x-axis-title-words]
  [fixture: xychart/gram-x-axis-title-bare-digit]
  [fixture: xychart/gram-x-axis-title-bare-digit-before-band]
  [fixture: xychart/gram-x-axis-title-bare-hyphen-digit]
  [fixture: xychart/gram-x-axis-title-bare-title-keyword]
  [fixture: xychart/gram-x-axis-title-bare-underscore-digit]
  [fixture: xychart/gram-x-axis-title-bare-words-number]
  [fixture: xychart/db-x-axis-three-times]
  [fixture: xychart/db-x-axis-twice]
  [fixture: xychart/db-x-axis-twice-title-cleared]
  [fixture: xychart/gram-x-axis-keyword-alone-at-end]
  [fixture: xychart/gram-x-axis-line-feed-before-bracket]
  [fixture: xychart/gram-x-axis-comment-before-bracket]
  [fixture: xychart/db-x-axis-upper-case-keyword]
  [fixture: xychart/db-x-axis-keyword-glued-bracket]
  [fixture: xychart/db-x-axis-keyword-glued-quote]
  [fixture: xychart/db-x-axis-prototype-title]
  [fixture: xychart/gram-x-axis-empty]
  [fixture: xychart/gram-x-axis-keyword-suffix]
  [fixture: xychart/gram-x-axis-band-after-string-title]
  [fixture: xychart/db-x-axis-range-then-band]
- 範囲は 2 つの数と `-->` で、`{ type: "linear", title, min, max }` になります。
  数は、数字と省略できる小数部、または整数部のない小数部で、
  省略できる符号がつきます。
  先頭の 0 は数字として読まれます。
  最初の数は 2 つ目より大きくても等しくてもよく、矢印の前後の空白はいらず、
  `-0` は 0 で、
  倍精度で正確に表せない大きな数は Db が持つ数です。
  指数、`->`、3 つ目の数、矢印のない数、前後の数がない矢印、語、
  `1.` は拒否されます。
  [fixture: xychart/db-x-axis-range]
  [fixture: xychart/db-x-axis-range-decimal]
  [fixture: xychart/db-x-axis-range-equal]
  [fixture: xychart/db-x-axis-range-large]
  [fixture: xychart/db-x-axis-range-leading-zeros]
  [fixture: xychart/db-x-axis-range-negative]
  [fixture: xychart/db-x-axis-range-negative-zero]
  [fixture: xychart/db-x-axis-range-no-spaces]
  [fixture: xychart/db-x-axis-range-plus]
  [fixture: xychart/db-x-axis-range-title]
  [fixture: xychart/db-x-axis-range-title-quoted]
  [fixture: xychart/gram-x-axis-range-exponent]
  [fixture: xychart/gram-x-axis-range-no-end]
  [fixture: xychart/gram-x-axis-range-no-start]
  [fixture: xychart/gram-x-axis-range-one-number]
  [fixture: xychart/gram-x-axis-range-short-arrow]
  [fixture: xychart/gram-x-axis-range-text]
  [fixture: xychart/gram-x-axis-range-third]
  [fixture: xychart/gram-x-axis-range-trailing-dot]
- カテゴリーの一覧は、`[` と `]` の間の、コンマで分けたテキストです。
  語は、語の間の空白を除いてつなぎ、引用符のテキストは、空白、コンマ、
  改行を含められ、両端の空白が落ちます。
  数、符号、オブジェクトのプロパティの名前も、ほかと同じカテゴリーです。
  同じテキストの 2 つのカテゴリーは 2 つのカテゴリーで、
  引用符の中のキーワードはカテゴリーですが、
  引用符のないキーワードは大文字小文字を問わず拒否されます。
  閉じカッコの前にコンマがある一覧、空の一覧、空白だけの一覧、
  引用符で空のテキスト、
  項目の間に改行がある一覧、語に ASCII の外の文字や単独の `%` がある一覧、
  2 つ書いた一覧、
  後ろにテキストがある一覧、閉じない一覧は拒否されます。
  [fixture: xychart/db-x-axis-band]
  [fixture: xychart/db-x-axis-band-characters]
  [fixture: xychart/db-x-axis-band-digit]
  [fixture: xychart/db-x-axis-band-entity]
  [fixture: xychart/db-x-axis-band-line-separator-inside]
  [fixture: xychart/db-x-axis-band-nbsp-inside]
  [fixture: xychart/db-x-axis-band-negative]
  [fixture: xychart/db-x-axis-band-no-spaces]
  [fixture: xychart/db-x-axis-band-numbers]
  [fixture: xychart/db-x-axis-band-one]
  [fixture: xychart/db-x-axis-band-prototype-names]
  [fixture: xychart/db-x-axis-band-quoted]
  [fixture: xychart/db-x-axis-band-quoted-keyword]
  [fixture: xychart/db-x-axis-band-quoted-line-feed]
  [fixture: xychart/db-x-axis-band-quoted-spaces]
  [fixture: xychart/db-x-axis-band-same-category]
  [fixture: xychart/db-x-axis-band-tab-inside]
  [fixture: xychart/db-x-axis-band-title]
  [fixture: xychart/db-x-axis-band-title-quoted]
  [fixture: xychart/db-x-axis-band-words]
  [fixture: xychart/gram-x-axis-band-axis-keyword]
  [fixture: xychart/gram-x-axis-band-empty]
  [fixture: xychart/gram-x-axis-band-empty-string]
  [fixture: xychart/gram-x-axis-band-extra-text]
  [fixture: xychart/gram-x-axis-band-keyword]
  [fixture: xychart/gram-x-axis-band-keyword-upper-case]
  [fixture: xychart/gram-x-axis-band-line-feed]
  [fixture: xychart/gram-x-axis-band-non-ascii]
  [fixture: xychart/gram-x-axis-band-percent-inside]
  [fixture: xychart/gram-x-axis-band-spaces-only]
  [fixture: xychart/gram-x-axis-band-title-keyword]
  [fixture: xychart/gram-x-axis-band-trailing-comma]
  [fixture: xychart/gram-x-axis-band-twice]
  [fixture: xychart/gram-x-axis-band-unclosed]
  [fixture: xychart/gram-x-axis-band-unclosed-string]
  [fixture: xychart/db-category-quoted-line-separator]
  [fixture: xychart/db-title-quoted-crlf-category]
- `yAxis` は `{ type: "linear", title, min, max }` です。
  範囲を与える文もプロットが加える値もなければ、
  範囲は `Infinity` と `-Infinity` です。
  範囲の前のテキストがタイトルで、範囲だけの後の `y-axis` は空のタイトルを与え、
  タイトルだけの後の `y-axis` はタイトルだけを変えて範囲を残します。
  プロットの前でも後でも、書いた範囲がプロットの与える範囲に優先します。
  カテゴリー、3 つ目の数、1 つの数、範囲を囲むカッコ、
  `y-axis` だけは拒否されます。
  [fixture: xychart/db-y-axis-after-plot]
  [fixture: xychart/db-y-axis-before-plot]
  [fixture: xychart/db-y-axis-no-range-no-plot]
  [fixture: xychart/db-y-axis-range]
  [fixture: xychart/db-y-axis-range-negative-decimal]
  [fixture: xychart/db-y-axis-range-reversed]
  [fixture: xychart/db-y-axis-range-title]
  [fixture: xychart/db-y-axis-title-bare-word]
  [fixture: xychart/db-y-axis-title-only-then-range]
  [fixture: xychart/db-y-axis-title-quoted]
  [fixture: xychart/db-y-axis-twice]
  [fixture: xychart/db-y-axis-upper-case-keyword]
  [fixture: xychart/gram-y-axis-band]
  [fixture: xychart/gram-y-axis-empty]
  [fixture: xychart/gram-y-axis-glued-bracket]
  [fixture: xychart/gram-y-axis-keyword-alone-at-end]
  [fixture: xychart/gram-y-axis-one-number]
  [fixture: xychart/gram-y-axis-third]
  [fixture: xychart/gram-y-axis-title-bare-digit]
  [fixture: xychart/gram-y-axis-title-bare-digit-before-range]
  [fixture: xychart/gram-y-axis-title-bare-letters-digits]
  [fixture: xychart/gram-y-axis-title-bare-title-keyword]
- プロットは `line` か `bar`、省略できるタイトル（引用符か語）、
  `[` と `]` の間のコンマで分けた値で、
  `{ type, title, data }` になります。
  キーワードは大文字小文字を問わず、カッコを空白なしで続けられ、
  タブで分けられます。
  キーワードに続けて書いた語、カッコのない値、空のカッコ、
  次の行にある値は拒否されます。
  プロットはテキストの順で、2 つのプロットが同じタイトルを持てます。
  1 文字のタイトルやオブジェクトのプロパティ名のタイトルも、タイトルです。
  [fixture: xychart/db-line-title-bare]
  [fixture: xychart/db-line-title-bare-digit]
  [fixture: xychart/db-line-title-quoted]
  [fixture: xychart/db-line-title-words]
  [fixture: xychart/db-line-values]
  [fixture: xychart/db-bar-title-bare]
  [fixture: xychart/db-bar-title-bare-number]
  [fixture: xychart/db-bar-title-quoted]
  [fixture: xychart/db-bar-values]
  [fixture: xychart/db-plot-title-bare-hyphen-digit]
  [fixture: xychart/db-plot-title-entity]
  [fixture: xychart/db-plot-title-keyword-like]
  [fixture: xychart/db-plot-title-prototype-name]
  [fixture: xychart/db-plot-title-quoted-line-feed]
  [fixture: xychart/db-plot-title-quoted-lone-cr]
  [fixture: xychart/db-plot-title-quoted-special]
  [fixture: xychart/db-plot-title-trimmed]
  [fixture: xychart/db-plot-bar-keyword-glued-bracket]
  [fixture: xychart/db-plot-capitalized-keyword]
  [fixture: xychart/db-plot-keyword-glued-bracket]
  [fixture: xychart/db-plot-tab-keyword]
  [fixture: xychart/db-plot-upper-case-keyword]
  [fixture: xychart/db-plot-bar-then-line]
  [fixture: xychart/db-plot-same-title-twice]
  [fixture: xychart/gram-line-comment-before-bracket]
  [fixture: xychart/gram-line-keyword-alone-at-end]
  [fixture: xychart/gram-line-title-only-at-end]
  [fixture: xychart/gram-bar-keyword-alone-at-end]
  [fixture: xychart/gram-bar-title-only-at-end]
  [fixture: xychart/gram-plot-values-keyword-glued-title]
  [fixture: xychart/gram-plot-values-bar-keyword-glued]
  [fixture: xychart/gram-plot-values-no-brackets]
  [fixture: xychart/gram-plot-values-empty]
  [fixture: xychart/gram-plot-values-line-feed-before-bracket]
  [fixture: xychart/gram-plot-values-title-line-feed-before-bracket]
  [fixture: xychart/gram-plot-values-extra-text]
- 値は、軸の範囲が書くのと同じ数です。
  数字と省略できる小数部、または整数部のない小数部で、省略できる符号がつきます。
  `-0` は 0 で、倍精度で正確に表せない大きな数は Db が持つ数です。
  カッコの中やコンマの前後の、空白、タブ、ノーブレークスペース、U+FEFF、
  U+2028 は何も変えず、改行や CRLF は拒否されます。
  指数、語、`NaN`、`Infinity`、`5.`、`1.5.2`、アンダースコア、2 つのコンマ、
  最初の値や閉じカッコの前のコンマ、コンマのない 2 つの値、カッコの中の改行、
  閉じないカッコは拒否されます。
  [fixture: xychart/db-plot-values-bom-inside]
  [fixture: xychart/db-plot-values-decimal]
  [fixture: xychart/db-plot-values-decimal-division]
  [fixture: xychart/db-plot-values-form-feed-inside]
  [fixture: xychart/db-plot-values-large]
  [fixture: xychart/db-plot-values-leading-zeros]
  [fixture: xychart/db-plot-values-line-separator-inside]
  [fixture: xychart/db-plot-values-nbsp-inside]
  [fixture: xychart/db-plot-values-negative]
  [fixture: xychart/db-plot-values-negative-zero]
  [fixture: xychart/db-plot-values-no-spaces]
  [fixture: xychart/db-plot-values-one]
  [fixture: xychart/db-plot-values-plus]
  [fixture: xychart/db-plot-values-spaces]
  [fixture: xychart/db-plot-values-tab-inside]
  [fixture: xychart/gram-plot-values-crlf-inside]
  [fixture: xychart/gram-plot-values-double-comma]
  [fixture: xychart/gram-plot-values-exponent]
  [fixture: xychart/gram-plot-values-infinity]
  [fixture: xychart/gram-plot-values-leading-comma]
  [fixture: xychart/gram-plot-values-line-feed-after-bracket]
  [fixture: xychart/gram-plot-values-line-feed-before-comma]
  [fixture: xychart/gram-plot-values-missing-comma]
  [fixture: xychart/gram-plot-values-nan]
  [fixture: xychart/gram-plot-values-trailing-comma]
  [fixture: xychart/gram-plot-values-trailing-dot]
  [fixture: xychart/gram-plot-values-two-dots]
  [fixture: xychart/gram-plot-values-unclosed]
  [fixture: xychart/gram-plot-values-underscore]
  [fixture: xychart/gram-plot-values-word]
- line の値の後ろに、ラベル（引用符のテキスト）を、
  空白があってもなくても続けられます。
  `pointLabels` は各値のラベルの一覧で、ラベルのない値は空のテキストです。
  ラベルが書かれているときだけあります。
  空のラベルはラベルを与えません。
  ラベルは、句読点と改行を含められ、両端の空白が落ちます。
  bar のラベルは受理され、保たれません。
  引用符のないラベル、値の前のラベル、2 つのラベル、
  中に 2 つの引用符があるラベル、閉じないラベルは拒否されます。
  [fixture: xychart/db-label-all]
  [fixture: xychart/db-label-empty-string]
  [fixture: xychart/db-label-entity]
  [fixture: xychart/db-label-last]
  [fixture: xychart/db-label-line-feed]
  [fixture: xychart/db-label-no-space]
  [fixture: xychart/db-label-on-bar]
  [fixture: xychart/db-label-one]
  [fixture: xychart/db-label-quoted-crlf]
  [fixture: xychart/db-label-spaces-trimmed]
  [fixture: xychart/db-label-special]
  [fixture: xychart/gram-label-bare]
  [fixture: xychart/gram-label-before-value]
  [fixture: xychart/gram-label-doubled-quote]
  [fixture: xychart/gram-label-twice]
  [fixture: xychart/gram-label-unclosed]
- `data` は、
  プロットが加えられた時点の x 軸から Db が作る組 `[x, y]` の一覧です。
  カテゴリーの一覧があれば、カテゴリーごとに 1 組で、
  カテゴリーを超える値は捨てられ、
  値のないカテゴリーは `null` です。
  範囲があるか軸がなければ、値ごとに 1 組で、
  x は値を範囲に均等に広げて計算した数のテキストで、最初の値が範囲の始まりです。
  最初のプロットより前に x-axis の文がなければ、
  x 軸は 1 から値の数までの範囲になり、
  後のプロットはその範囲に広げられます。
  プロットの後ろに書いた x 軸は、そのプロットの組を変えません。
  [fixture: xychart/db-data-band-after-plot]
  [fixture: xychart/db-data-band-after-plot-longer]
  [fixture: xychart/db-data-band-equal]
  [fixture: xychart/db-data-band-fewer-values]
  [fixture: xychart/db-data-band-more-values]
  [fixture: xychart/db-data-band-two-plots]
  [fixture: xychart/db-data-longer-second-plot]
  [fixture: xychart/db-data-shorter-second-plot]
  [fixture: xychart/db-data-no-axis-bar-and-line]
  [fixture: xychart/db-data-range-after-plot]
  [fixture: xychart/db-data-range-equal]
  [fixture: xychart/db-data-range-fractions]
  [fixture: xychart/db-data-range-integers]
  [fixture: xychart/db-data-range-negative]
  [fixture: xychart/db-data-range-one-value]
  [fixture: xychart/db-data-range-reversed]
  [fixture: xychart/db-data-range-three]
- どの文も与えない y 軸の範囲は、プロットの値から計算されます。
  すべてのプロットの最小値と最大値で、カテゴリーの一覧が捨てる値は含みません。
  値が 1 つのプロットでは、その値だけの範囲です。
  [fixture: xychart/db-data-y-range-band-truncation]
  [fixture: xychart/db-data-y-range-from-plots]
  [fixture: xychart/db-data-y-range-negative-zero]
  [fixture: xychart/db-data-y-range-single-value]
- すべての欄を一度に。 [fixture: xychart/db-data-everything]
  [fixture: xychart/db-data-xy-title-and-plots]
- `accTitle` は、`accTitle:` の後ろから行末までのテキストで、
  両端の空白を除いたものです。
  `accDescr` は、`accDescr:` の後ろのテキスト、
  または `accDescr {` と `}` の間の行です。
  コロンの後ろやカッコの前に空白はいらず、
  コロンや波括弧はキーワードの次の行にも置けます。
  コロン、`;`、`#`、空白はテキストの文字です。
  キーワードは大文字小文字を問わず、コロンの前に空白を置けます。
  `accTitle:` や `accDescr:` の行にテキストがなければ、
  キーワードは、空行、コメント行、ディレクティブの行を越えて、
  次のテキストのある行をまるごと値にし、その行は文として読まれません。
  `title` の行や `line` の行が、そのままテキストになります。
  入力の終わりまでテキストがないときだけ、値は空です。
  キーワードに続けて書いた文字、ダッシュ、数字、キーワードの中の空白は拒否され、
  テキストの終わりにキーワードだけがあるのも拒否されます。
  各種類の最後の文が値です。
  テキストの終わりで閉じないブロックは空の説明を設定し、
  空のブロック（波括弧だけ、
  または間に空白だけ）は何も設定せずに前の説明を保ちます。
  行の説明とブロックは互いを置き換え、
  `}` はブロックを終え、その後ろのテキストは文として読まれます。
  ブロックの中の CRLF は行を 1 つの改行でつなぎ、U+2028 はテキストの文字です。
  [fixture: xychart/db-acc-descr]
  [fixture: xychart/db-acc-descr-blank-lines-then-text]
  [fixture: xychart/db-acc-descr-block]
  [fixture: xychart/db-acc-descr-block-comment-line-inside]
  [fixture: xychart/db-acc-descr-block-cr]
  [fixture: xychart/db-acc-descr-block-crlf]
  [fixture: xychart/db-acc-descr-block-directive-inside]
  [fixture: xychart/db-acc-descr-block-empty]
  [fixture: xychart/db-acc-descr-block-hash-semicolon]
  [fixture: xychart/db-acc-descr-block-line-feed-before-brace]
  [fixture: xychart/db-acc-descr-block-line-separator-inside]
  [fixture: xychart/db-acc-descr-block-no-space]
  [fixture: xychart/db-acc-descr-block-percent]
  [fixture: xychart/db-acc-descr-block-spaces-inside]
  [fixture: xychart/db-acc-descr-block-then-empty-block]
  [fixture: xychart/db-acc-descr-block-then-empty-line]
  [fixture: xychart/db-acc-descr-block-then-line]
  [fixture: xychart/db-acc-descr-block-then-title-same-line]
  [fixture: xychart/db-acc-descr-block-twice-same-line]
  [fixture: xychart/db-acc-descr-block-upper-case]
  [fixture: xychart/db-acc-descr-colon-on-next-line]
  [fixture: xychart/db-acc-descr-comment-line-then-text]
  [fixture: xychart/db-acc-descr-directive-line-then-text]
  [fixture: xychart/db-acc-descr-empty-block-after-title-same-line]
  [fixture: xychart/db-acc-descr-empty-block-before-plot]
  [fixture: xychart/db-acc-descr-empty-block-before-title-same-line]
  [fixture: xychart/db-acc-descr-line-separator-inside]
  [fixture: xychart/db-acc-descr-line-then-block]
  [fixture: xychart/db-acc-descr-line-then-empty-block]
  [fixture: xychart/db-acc-descr-line-then-empty-braces]
  [fixture: xychart/db-acc-descr-line-then-empty-line]
  [fixture: xychart/db-acc-descr-line-then-spaces-block]
  [fixture: xychart/db-acc-descr-no-space]
  [fixture: xychart/db-acc-descr-takes-title-line]
  [fixture: xychart/db-acc-descr-unclosed-block]
  [fixture: xychart/db-acc-title]
  [fixture: xychart/db-acc-title-blank-lines-then-text]
  [fixture: xychart/db-acc-title-colon-inside]
  [fixture: xychart/db-acc-title-colon-on-next-line]
  [fixture: xychart/db-acc-title-comment-line-then-text]
  [fixture: xychart/db-acc-title-directive-line-then-text]
  [fixture: xychart/db-acc-title-empty]
  [fixture: xychart/db-acc-title-empty-at-end-after-value]
  [fixture: xychart/db-acc-title-hash]
  [fixture: xychart/db-acc-title-leading-ideographic-space]
  [fixture: xychart/db-acc-title-line-separator-inside]
  [fixture: xychart/db-acc-title-no-space]
  [fixture: xychart/db-acc-title-semicolon]
  [fixture: xychart/db-acc-title-space-before-colon]
  [fixture: xychart/db-acc-title-spaces-trimmed]
  [fixture: xychart/db-acc-title-takes-next-line]
  [fixture: xychart/db-acc-title-then-empty-line]
  [fixture: xychart/db-acc-title-three-times]
  [fixture: xychart/db-acc-title-trailing-bom]
  [fixture: xychart/db-acc-title-trailing-ideographic-space]
  [fixture: xychart/db-acc-title-trailing-nbsp]
  [fixture: xychart/db-acc-title-trailing-tab]
  [fixture: xychart/db-acc-title-twice]
  [fixture: xychart/db-acc-title-two-colons]
  [fixture: xychart/db-acc-title-upper-case]
  [fixture: xychart/gram-acc-descr-block-braces-inside]
  [fixture: xychart/gram-acc-descr-block-double-close]
  [fixture: xychart/gram-acc-descr-block-two-blocks]
  [fixture: xychart/gram-acc-descr-empty-block-before-header]
  [fixture: xychart/gram-acc-descr-keyword-alone]
  [fixture: xychart/gram-acc-title-dash-suffix]
  [fixture: xychart/gram-acc-title-digit-suffix]
  [fixture: xychart/gram-acc-title-keyword-alone]
  [fixture: xychart/gram-acc-title-space-in-keyword]
  [fixture: xychart/gram-acc-title-word-suffix]
  [fixture: xychart/div-empty-description-block-inside-axis]
  [fixture: xychart/div-empty-description-block-inside-plot]
  [fixture: xychart/div-empty-description-block-inside-title-text]
  [fixture: xychart/div-empty-description-block-inside-values]
- `title`、`accTitle`、軸のタイトル、カテゴリー、プロットのタイトル、
  ラベルは `sanitizeText` を通ります。
  `securityLevel` が mermaid.js の値のどれでもなく、HTML ラベルが有効なら、
  置き換えられた文字を持ちます
  （[db-from-tree.md](./db-from-tree.md) の文字の置き換えを参照）。
  プロットの組は、置き換えられたカテゴリーを持ちます。
  `loose` と `sandbox` では、また、
  設定の最上位か `flowchart` の `htmlLabels` が false なら、書いたとおりです。
  [fixture: xychart/config-security-level-loose-all]
  [fixture: xychart/config-security-level-other-all]
  [fixture: xychart/config-security-level-other-flowchart-html-labels-false]
  [fixture: xychart/config-security-level-other-html-labels-false]
  [fixture: xychart/config-security-level-other-orientation-horizontal]
  [fixture: xychart/config-security-level-sandbox-all]
- テキストを持つ場所は、タイトル、アクセシビリティのタイトル、
  行の説明と波括弧の説明、x 軸のタイトル、カテゴリー、
  y 軸のタイトル、プロットのタイトル、ラベルです。
  アクセシビリティのテキストとラベルを除く場所は、
  引用符なしでも引用符つきでもテキストを持ちます。
  次の項目が別に述べるものを除き、どの場所でも同じ規則です。
  どの種類の空白も
  （タブ、U+FEFF、ノーブレークスペース、U+3000、U+2028、U+2029）、
  引用符のないテキストでは語を分けて読み飛ばされ、語がつながります。
  引用符の中とアクセシビリティのテキストでは、テキストの文字です。
  [fixture: xychart/db-grid-tab-acc-descr]
  [fixture: xychart/db-grid-tab-acc-descr-block]
  [fixture: xychart/db-grid-tab-acc-title]
  [fixture: xychart/db-grid-tab-category-bare]
  [fixture: xychart/db-grid-tab-category-quoted]
  [fixture: xychart/db-grid-tab-label]
  [fixture: xychart/db-grid-tab-plot-title-bare]
  [fixture: xychart/db-grid-tab-plot-title-quoted]
  [fixture: xychart/db-grid-tab-title-bare]
  [fixture: xychart/db-grid-tab-title-quoted]
  [fixture: xychart/db-grid-tab-x-title-bare]
  [fixture: xychart/db-grid-tab-x-title-quoted]
  [fixture: xychart/db-grid-tab-y-title-bare]
  [fixture: xychart/db-grid-tab-y-title-quoted]
  [fixture: xychart/db-grid-bom-acc-descr]
  [fixture: xychart/db-grid-bom-acc-descr-block]
  [fixture: xychart/db-grid-bom-acc-title]
  [fixture: xychart/db-grid-bom-category-bare]
  [fixture: xychart/db-grid-bom-category-quoted]
  [fixture: xychart/db-grid-bom-label]
  [fixture: xychart/db-grid-bom-plot-title-bare]
  [fixture: xychart/db-grid-bom-plot-title-quoted]
  [fixture: xychart/db-grid-bom-title-bare]
  [fixture: xychart/db-grid-bom-title-quoted]
  [fixture: xychart/db-grid-bom-x-title-bare]
  [fixture: xychart/db-grid-bom-x-title-quoted]
  [fixture: xychart/db-grid-bom-y-title-bare]
  [fixture: xychart/db-grid-bom-y-title-quoted]
  [fixture: xychart/db-grid-nbsp-acc-descr]
  [fixture: xychart/db-grid-nbsp-acc-descr-block]
  [fixture: xychart/db-grid-nbsp-acc-title]
  [fixture: xychart/db-grid-nbsp-category-bare]
  [fixture: xychart/db-grid-nbsp-category-quoted]
  [fixture: xychart/db-grid-nbsp-label]
  [fixture: xychart/db-grid-nbsp-plot-title-bare]
  [fixture: xychart/db-grid-nbsp-plot-title-quoted]
  [fixture: xychart/db-grid-nbsp-title-quoted]
  [fixture: xychart/db-grid-nbsp-x-title-bare]
  [fixture: xychart/db-grid-nbsp-x-title-quoted]
  [fixture: xychart/db-grid-nbsp-y-title-bare]
  [fixture: xychart/db-grid-nbsp-y-title-quoted]
  [fixture: xychart/db-grid-ideographic-acc-descr]
  [fixture: xychart/db-grid-ideographic-acc-descr-block]
  [fixture: xychart/db-grid-ideographic-acc-title]
  [fixture: xychart/db-grid-ideographic-category-bare]
  [fixture: xychart/db-grid-ideographic-category-quoted]
  [fixture: xychart/db-grid-ideographic-label]
  [fixture: xychart/db-grid-ideographic-plot-title-bare]
  [fixture: xychart/db-grid-ideographic-plot-title-quoted]
  [fixture: xychart/db-grid-ideographic-title-quoted]
  [fixture: xychart/db-grid-ideographic-x-title-bare]
  [fixture: xychart/db-grid-ideographic-x-title-quoted]
  [fixture: xychart/db-grid-ideographic-y-title-bare]
  [fixture: xychart/db-grid-ideographic-y-title-quoted]
  [fixture: xychart/db-grid-ls-acc-descr-block]
  [fixture: xychart/db-grid-ls-category-bare]
  [fixture: xychart/db-grid-ls-category-quoted]
  [fixture: xychart/db-grid-ls-label]
  [fixture: xychart/db-grid-ls-plot-title-bare]
  [fixture: xychart/db-grid-ls-plot-title-quoted]
  [fixture: xychart/db-grid-ls-title-bare]
  [fixture: xychart/db-grid-ls-x-title-bare]
  [fixture: xychart/db-grid-ls-x-title-quoted]
  [fixture: xychart/db-grid-ls-y-title-bare]
  [fixture: xychart/db-grid-ls-y-title-quoted]
  [fixture: xychart/db-grid-ps-acc-descr]
  [fixture: xychart/db-grid-ps-acc-descr-block]
  [fixture: xychart/db-grid-ps-acc-title]
  [fixture: xychart/db-grid-ps-category-bare]
  [fixture: xychart/db-grid-ps-category-quoted]
  [fixture: xychart/db-grid-ps-label]
  [fixture: xychart/db-grid-ps-plot-title-bare]
  [fixture: xychart/db-grid-ps-plot-title-quoted]
  [fixture: xychart/db-grid-ps-title-bare]
  [fixture: xychart/db-grid-ps-title-quoted]
  [fixture: xychart/db-grid-ps-x-title-bare]
  [fixture: xychart/db-grid-ps-x-title-quoted]
  [fixture: xychart/db-grid-ps-y-title-bare]
  [fixture: xychart/db-grid-ps-y-title-quoted]
- テキストの中の改行、CRLF、単独の CR は、引用符の中と波括弧の中では、
  テキストの 1 つの改行になります。
  引用符がない場合と `accTitle:`、`accDescr:` の行では、行を終え、
  残りは次の文として読まれて拒否されます。
  [fixture: xychart/db-grid-crlf-acc-descr-block]
  [fixture: xychart/db-grid-crlf-category-quoted]
  [fixture: xychart/db-grid-crlf-label]
  [fixture: xychart/db-grid-crlf-plot-title-quoted]
  [fixture: xychart/db-grid-crlf-title-quoted]
  [fixture: xychart/db-grid-crlf-x-title-quoted]
  [fixture: xychart/db-grid-crlf-y-title-quoted]
  [fixture: xychart/gram-grid-crlf-acc-descr]
  [fixture: xychart/gram-grid-crlf-acc-title]
  [fixture: xychart/gram-grid-crlf-category-bare]
  [fixture: xychart/gram-grid-crlf-plot-title-bare]
  [fixture: xychart/gram-grid-crlf-title-bare]
  [fixture: xychart/gram-grid-crlf-x-title-bare]
  [fixture: xychart/gram-grid-crlf-y-title-bare]
  [fixture: xychart/db-grid-cr-acc-descr-block]
  [fixture: xychart/db-grid-cr-category-quoted]
  [fixture: xychart/db-grid-cr-label]
  [fixture: xychart/db-grid-cr-title-quoted]
  [fixture: xychart/db-grid-cr-x-title-quoted]
  [fixture: xychart/db-grid-cr-y-title-quoted]
  [fixture: xychart/gram-grid-cr-acc-descr]
  [fixture: xychart/gram-grid-cr-acc-title]
  [fixture: xychart/gram-grid-cr-category-bare]
  [fixture: xychart/gram-grid-cr-plot-title-bare]
  [fixture: xychart/gram-grid-cr-title-bare]
  [fixture: xychart/gram-grid-cr-x-title-bare]
  [fixture: xychart/gram-grid-cr-y-title-bare]
  [fixture: xychart/db-grid-lf-acc-descr-block]
  [fixture: xychart/db-grid-lf-category-quoted]
  [fixture: xychart/db-grid-lf-x-title-quoted]
  [fixture: xychart/db-grid-lf-y-title-quoted]
  [fixture: xychart/gram-grid-lf-acc-descr]
  [fixture: xychart/gram-grid-lf-acc-title]
  [fixture: xychart/gram-grid-lf-category-bare]
  [fixture: xychart/gram-grid-lf-plot-title-bare]
  [fixture: xychart/gram-grid-lf-title-bare]
  [fixture: xychart/gram-grid-lf-x-title-bare]
  [fixture: xychart/gram-grid-lf-y-title-bare]
- テキストの中のディレクティブは、どの場所でも取り除かれ、
  前後の部分がつながります。
  テキストの中の、空白の後ろの `%%` は、引用符の中、アクセシビリティのテキスト、
  ラベルではテキストの文字です。
  引用符のない場合は、タイトルと軸のタイトルではコメントを始めてテキストを終え、
  カテゴリーとプロットのタイトルはそのあとに文の続きがあるので、拒否されます。
  [fixture: xychart/db-grid-directive-acc-descr]
  [fixture: xychart/db-grid-directive-acc-descr-block]
  [fixture: xychart/db-grid-directive-acc-title]
  [fixture: xychart/db-grid-directive-category-bare]
  [fixture: xychart/db-grid-directive-category-quoted]
  [fixture: xychart/db-grid-directive-label]
  [fixture: xychart/db-grid-directive-plot-title-bare]
  [fixture: xychart/db-grid-directive-plot-title-quoted]
  [fixture: xychart/db-grid-directive-title-bare]
  [fixture: xychart/db-grid-directive-title-quoted]
  [fixture: xychart/db-grid-directive-x-title-bare]
  [fixture: xychart/db-grid-directive-x-title-quoted]
  [fixture: xychart/db-grid-directive-y-title-bare]
  [fixture: xychart/db-grid-directive-y-title-quoted]
  [fixture: xychart/db-grid-comment-acc-descr]
  [fixture: xychart/db-grid-comment-acc-descr-block]
  [fixture: xychart/db-grid-comment-acc-title]
  [fixture: xychart/db-grid-comment-category-quoted]
  [fixture: xychart/db-grid-comment-label]
  [fixture: xychart/db-grid-comment-plot-title-quoted]
  [fixture: xychart/db-grid-comment-title-bare]
  [fixture: xychart/db-grid-comment-x-title-bare]
  [fixture: xychart/db-grid-comment-x-title-quoted]
  [fixture: xychart/db-grid-comment-y-title-bare]
  [fixture: xychart/db-grid-comment-y-title-quoted]
  [fixture: xychart/gram-grid-comment-category-bare]
  [fixture: xychart/gram-grid-comment-plot-title-bare]
- 行の規則が落とす `;`、文字参照、キーワード、ASCII の外の文字、HTML のタグ、
  句読点は、
  引用符の中、アクセシビリティのテキスト、ラベルではテキストです
  （タグの属性の引用符は `'` として読まれます）。
  引用符がなければ、引用符のないテキストは語の文字だけを持つので、拒否されます。
  [fixture: xychart/db-grid-style-acc-descr]
  [fixture: xychart/db-grid-style-acc-descr-block]
  [fixture: xychart/db-grid-style-acc-title]
  [fixture: xychart/db-grid-style-x-title-quoted]
  [fixture: xychart/gram-grid-style-category-bare]
  [fixture: xychart/gram-grid-style-plot-title-bare]
  [fixture: xychart/gram-grid-style-title-bare]
  [fixture: xychart/gram-grid-style-x-title-bare]
  [fixture: xychart/gram-grid-style-y-title-bare]
  [fixture: xychart/db-grid-entity-acc-descr]
  [fixture: xychart/db-grid-entity-acc-descr-block]
  [fixture: xychart/db-grid-entity-acc-title]
  [fixture: xychart/db-grid-entity-category-quoted]
  [fixture: xychart/db-grid-entity-plot-title-quoted]
  [fixture: xychart/db-grid-entity-x-title-quoted]
  [fixture: xychart/db-grid-entity-y-title-quoted]
  [fixture: xychart/gram-grid-entity-category-bare]
  [fixture: xychart/gram-grid-entity-plot-title-bare]
  [fixture: xychart/gram-grid-entity-x-title-bare]
  [fixture: xychart/gram-grid-entity-y-title-bare]
  [fixture: xychart/db-grid-keyword-acc-descr]
  [fixture: xychart/db-grid-keyword-acc-descr-block]
  [fixture: xychart/db-grid-keyword-acc-title]
  [fixture: xychart/db-grid-keyword-category-quoted]
  [fixture: xychart/db-grid-keyword-label]
  [fixture: xychart/db-grid-keyword-plot-title-quoted]
  [fixture: xychart/db-grid-keyword-title-quoted]
  [fixture: xychart/db-grid-keyword-x-title-quoted]
  [fixture: xychart/db-grid-keyword-y-title-quoted]
  [fixture: xychart/gram-grid-keyword-category-bare]
  [fixture: xychart/gram-grid-keyword-plot-title-bare]
  [fixture: xychart/gram-grid-keyword-title-bare]
  [fixture: xychart/gram-grid-keyword-x-title-bare]
  [fixture: xychart/gram-grid-keyword-y-title-bare]
  [fixture: xychart/db-grid-nonascii-acc-descr]
  [fixture: xychart/db-grid-nonascii-acc-descr-block]
  [fixture: xychart/db-grid-nonascii-acc-title]
  [fixture: xychart/db-grid-nonascii-category-quoted]
  [fixture: xychart/db-grid-nonascii-label]
  [fixture: xychart/db-grid-nonascii-plot-title-quoted]
  [fixture: xychart/db-grid-nonascii-title-quoted]
  [fixture: xychart/db-grid-nonascii-x-title-quoted]
  [fixture: xychart/db-grid-nonascii-y-title-quoted]
  [fixture: xychart/gram-grid-nonascii-category-bare]
  [fixture: xychart/gram-grid-nonascii-plot-title-bare]
  [fixture: xychart/gram-grid-nonascii-x-title-bare]
  [fixture: xychart/gram-grid-nonascii-y-title-bare]
  [fixture: xychart/db-grid-html-acc-descr]
  [fixture: xychart/db-grid-html-acc-descr-block]
  [fixture: xychart/db-grid-html-acc-title]
  [fixture: xychart/db-grid-html-category-quoted]
  [fixture: xychart/db-grid-html-label]
  [fixture: xychart/db-grid-html-plot-title-quoted]
  [fixture: xychart/db-grid-html-x-title-quoted]
  [fixture: xychart/db-grid-html-y-title-quoted]
  [fixture: xychart/gram-grid-html-category-bare]
  [fixture: xychart/gram-grid-html-plot-title-bare]
  [fixture: xychart/gram-grid-html-title-bare]
  [fixture: xychart/gram-grid-html-x-title-bare]
  [fixture: xychart/gram-grid-html-y-title-bare]
  [fixture: xychart/db-grid-punct-acc-descr]
  [fixture: xychart/db-grid-punct-acc-descr-block]
  [fixture: xychart/db-grid-punct-acc-title]
  [fixture: xychart/db-grid-punct-category-quoted]
  [fixture: xychart/db-grid-punct-label]
  [fixture: xychart/db-grid-punct-plot-title-quoted]
  [fixture: xychart/db-grid-punct-title-quoted]
  [fixture: xychart/db-grid-punct-x-title-quoted]
  [fixture: xychart/db-grid-punct-y-title-quoted]
  [fixture: xychart/gram-grid-punct-category-bare]
  [fixture: xychart/gram-grid-punct-plot-title-bare]
  [fixture: xychart/gram-grid-punct-title-bare]
  [fixture: xychart/gram-grid-punct-x-title-bare]
  [fixture: xychart/gram-grid-punct-y-title-bare]
- 名前 `__proto__` と語の中の `#` は、どの場所でもテキストです。
  空のテキストは、タイトル、軸のタイトル、カテゴリーとして、
  引用符があってもなくても拒否されます。
  アクセシビリティのテキストとプロットのタイトルでは空のテキストで、
  ラベルではラベルなしです。
  [fixture: xychart/db-grid-proto-acc-descr]
  [fixture: xychart/db-grid-proto-acc-descr-block]
  [fixture: xychart/db-grid-proto-acc-title]
  [fixture: xychart/db-grid-proto-category-bare]
  [fixture: xychart/db-grid-proto-category-quoted]
  [fixture: xychart/db-grid-proto-label]
  [fixture: xychart/db-grid-proto-plot-title-quoted]
  [fixture: xychart/db-grid-proto-title-bare]
  [fixture: xychart/db-grid-proto-title-quoted]
  [fixture: xychart/db-grid-proto-x-title-bare]
  [fixture: xychart/db-grid-proto-x-title-quoted]
  [fixture: xychart/db-grid-proto-y-title-bare]
  [fixture: xychart/db-grid-proto-y-title-quoted]
  [fixture: xychart/db-grid-hash-acc-descr]
  [fixture: xychart/db-grid-hash-acc-descr-block]
  [fixture: xychart/db-grid-hash-acc-title]
  [fixture: xychart/db-grid-hash-category-bare]
  [fixture: xychart/db-grid-hash-category-quoted]
  [fixture: xychart/db-grid-hash-label]
  [fixture: xychart/db-grid-hash-plot-title-bare]
  [fixture: xychart/db-grid-hash-plot-title-quoted]
  [fixture: xychart/db-grid-hash-title-bare]
  [fixture: xychart/db-grid-hash-title-quoted]
  [fixture: xychart/db-grid-hash-x-title-bare]
  [fixture: xychart/db-grid-hash-x-title-quoted]
  [fixture: xychart/db-grid-hash-y-title-bare]
  [fixture: xychart/db-grid-hash-y-title-quoted]
  [fixture: xychart/db-grid-empty-acc-descr]
  [fixture: xychart/db-grid-empty-acc-descr-block]
  [fixture: xychart/db-grid-empty-acc-title]
  [fixture: xychart/db-grid-empty-plot-title-bare]
  [fixture: xychart/db-grid-empty-plot-title-quoted]
  [fixture: xychart/gram-grid-empty-category-bare]
  [fixture: xychart/gram-grid-empty-category-quoted]
  [fixture: xychart/gram-grid-empty-title-bare]
  [fixture: xychart/gram-grid-empty-x-title-bare]
  [fixture: xychart/gram-grid-empty-x-title-quoted]
  [fixture: xychart/gram-grid-empty-y-title-bare]
  [fixture: xychart/gram-grid-empty-y-title-quoted]
