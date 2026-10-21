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

## quadrant

要約の欄は次のとおりです。

| 欄          | 内容                                                        |
| ----------- | ----------------------------------------------------------- |
| `title`     | 図のタイトル。最後の `title` の文、なければフロントマター。 |
| `accTitle`  | アクセシビリティのタイトル。なければ空のテキスト。          |
| `accDescr`  | アクセシビリティの説明。なければ空のテキスト。              |
| `quadrants` | `quadrant-1` から `quadrant-4` のテキスト。この順。         |
| `xAxis`     | x 軸のテキスト。`left` と `right`。                         |
| `yAxis`     | y 軸のテキスト。`bottom` と `top`。                         |
| `points`    | 点。Db が持つ順。                                           |
| `classes`   | クラス。最初の定義の順。                                    |

点は、`text`、`className`（クラスがなければ空のテキスト）、
`x` と `y`（字句解析が読んだ 2 つの数のテキスト）、
テキストが書いたとおりのスタイルを持ちます。
スタイルは、`radius`（数）、`color`、`strokeColor`、`strokeWidth` です。
クラスは `name` と、持っているスタイルを持ちます。
有限でない radius（桁が多すぎて double で持てない数）は、
JSON にそのような数がないので、
数のテキスト（`"Infinity"`）になります。

`normalizeQuadrant()`（`src/normalizers/quadrant.ts`）は、
`quadrantChart` の Db を要約します。
Db は、構文解析のあいだ、ブラウザーの機能も、時刻も、乱数も読みません。
Db は、すべての quadrant 図が共有する 1 つのオブジェクトで、
状態は、自分のメソッドだけが触れる `QuadrantBuilder` にあり、
[`clear()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L147-L150) が構文解析のたびに初期化します。
テキストが与えたものを読む方法は、図を配置する
[`getQuadrantData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L120-L145)
（
[`build()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantBuilder.ts#L604-L623)）だけなので、
要約は、そこに配置が残すもの（象限、軸、
点のテキスト）を Db が持つとおりに取ります。
配置は、点のクラス名、書いたとおりの座標、書いたとおりのスタイル、
クラスを残さないので、
Db のパッチ（`patchQuadrantDb()`）が、
[`addPoint()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L95-L106) と
[`addClass()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L108-L110) が受け取るものを、
Db が受理した後に記録します。
スタイルは、書かれたものから
[`parseStyles()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L64-L93) が作ったものです。
Db は 1 つなので、パッチは Db 自体に当てられ、
`clear()` が記録を最初からやり直します。

配置は、軸のラベルを、空でないテキストの分だけ並べます。
ラベルが 1 つだけのときは、配置がそれを `left` に置けば軸の最初のテキストで
（2 つ目のテキストが空のとき）、`center` に置けば 2 つ目のテキストです
（2 つ目のテキストが空でないとき。
[`getAxisLabels()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantBuilder.ts#L286-L382)）。
軸のラベルを隠すサイトの設定があると、Db が持つテキストが失われます。
そのため、パッチは軸のテキストの setter でテキストが設定したテキストも記録し、
配置がそれと違うラベルを並べたとき、
要約は `MermaidEnvironmentError` を投げます。

次のものを、それぞれに書いた理由で捨てます。

- `getQuadrantData()` が作る配置: 図の単位での座標と大きさ、テーマの色、枠線、
  既定の radius と線の幅、テキストの位置です。
  サイトの設定（`quadrantChart`、テーマ）で決まり、
  テキストが言うことには依りません。
- 点のスタイルとそのクラスのスタイルの併合（`{ ...classStyles, ...point }`）:
  描画が行うもので、点とクラスのスタイルは、テキストが書いたとおりに保ちます。

値を、欄ごとに述べます。
テキストは
[字句解析](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L15-L77)と
[文法](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L83-L189)が読み、
スタイルは
[`parseStyles()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L64-L93) が読みます。
`parseStyles()` は、知らないものを拒否します
（
[`validateNumber()` など](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/utils.ts#L8-L18)）。

- ヘッダーは `quadrantChart` です。

  [検出器](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDetector.ts#L9-L11)はこの大文字小文字のとおりに読むので、
  `QUADRANTCHART`、`quadrantchart`、`QuadrantChart` は検出されません。
  ヘッダーに続けて書いた語、ダッシュと語、数字、ASCII の外の文字は、
  文が始まらない場所のテキストなので、
  拒否されます。
  キーワード（`title`）を続けて書くと、キーワードとして読まれます。
  2 つ目のヘッダーは、自分の行でも、空白の後ろでも、ヘッダーの行でも、
  拒否されます。
  [fixture: quadrant/spec-quadrant-jison-fe2d2340]
  [fixture: quadrant/header-upper-case]
  [fixture: quadrant/header-lower-case]
  [fixture: quadrant/header-capitalized]
  [fixture: quadrant/header-word-suffix]
  [fixture: quadrant/header-spaced-word-suffix]
  [fixture: quadrant/header-dash-suffix]
  [fixture: quadrant/header-non-ascii-suffix]
  [fixture: quadrant/header-digit-suffix]
  [fixture: quadrant/header-title-glued]
  [fixture: quadrant/header-twice]
  [fixture: quadrant/header-twice-indented]
  [fixture: quadrant/header-twice-same-line]

- ヘッダーの前の空白、タブ、空行、空白とタブだけの行、ノーブレークスペース、
  U+FEFF、
  全角スペース、U+2028、コメント行、`%%` だけの行、ディレクティブの行、
  `%%{ }%%` は、何も変えません。
  フロントマターも、その後ろのコメント行も同じです。
  ヘッダーの前の `#` で始まる行、`;`、文、コメント行だけのテキストは、
  検出されません。
  [fixture: quadrant/header-indented]
  [fixture: quadrant/header-tab-indented]
  [fixture: quadrant/header-after-bare-percent-line]
  [fixture: quadrant/header-after-blank-lines]
  [fixture: quadrant/header-after-comment-line]
  [fixture: quadrant/header-after-directive-line]
  [fixture: quadrant/header-after-empty-braces-line]
  [fixture: quadrant/header-after-frontmatter]
  [fixture: quadrant/header-after-frontmatter-and-comment]
  [fixture: quadrant/header-after-hash-line]
  [fixture: quadrant/header-after-semicolon-line]
  [fixture: quadrant/header-after-whitespace-line]
  [fixture: quadrant/header-bom-before]
  [fixture: quadrant/header-nbsp-before]
  [fixture: quadrant/header-ideographic-space-before]
  [fixture: quadrant/header-ls-before]
  [fixture: quadrant/header-leading-semicolon]
  [fixture: quadrant/header-only-comment]
  [fixture: quadrant/header-statement-first]
- ヘッダーの後ろでは、空白の後ろにあるコメントも、
  ヘッダーに続けたコメントも読み飛ばされ、
  ヘッダーに続けた、またはヘッダーの中のディレクティブは取り除かれ、
  `%%` だけの行はコメント行です。
  ヘッダーの行には、空白かタブで区切って文を続けられ、`;` も続けられて、
  `;` は行を終えます。
  ヘッダーの後ろの空白とタブは読み飛ばされ、CRLF と CR だけも行を終えます。
  垂直タブと改ページは空白ですが、
  ノーブレークスペース、U+2028、U+2029、U+0085 は、
  文が始まらない場所のテキストなので、拒否されます。
  [fixture: quadrant/header-comment-on-header-line]
  [fixture: quadrant/header-comment-glued]
  [fixture: quadrant/header-directive-glued]
  [fixture: quadrant/div-directive-inside]
  [fixture: quadrant/header-bare-percent-line-after-header]
  [fixture: quadrant/header-statement-on-header-line]
  [fixture: quadrant/header-statement-on-header-line-tab]
  [fixture: quadrant/header-semicolon]
  [fixture: quadrant/header-semicolon-spaced]
  [fixture: quadrant/header-semicolon-statement]
  [fixture: quadrant/header-trailing-nbsp]
  [fixture: quadrant/header-trailing-spaces]
  [fixture: quadrant/header-trailing-tab]
  [fixture: quadrant/header-crlf]
  [fixture: quadrant/header-cr]
  [fixture: quadrant/header-ls-after]
  [fixture: quadrant/header-ps-after]
  [fixture: quadrant/header-vt-after]
  [fixture: quadrant/header-ff-after]
  [fixture: quadrant/header-nel-after]
- 最後の `title` の文が図のタイトルで、フロントマターのタイトルを置き換えます。
  フロントマターのタイトルは、どの文もタイトルを与えないときのタイトルです。
  空の `title` の文も、空のテキストで置き換えます。
  キーワードは大文字小文字を問わず読まれ、テキストとの間は空白かタブで、
  キーワードの前に空白やタブを置けます。
  キーワードに続けた語（`titleT`）はキーワードではなく、
  文が始まらない場所のテキストなので、行は拒否されます。
  `title` で始まって語として続く語はテキストで、`Titles: [0.3, 0.6]` は点です。
  一方、テキストの中の語 `title` はキーワードなので、
  `My title: [0.3, 0.6]` と `x-axis A title T` は拒否されます。
  改行はタイトルを終え、次の行は文です。
  [fixture: quadrant/db-title-keyword-capitalized]
  [fixture: quadrant/db-title-keyword-upper-case]
  [fixture: quadrant/db-title-keyword-alone]
  [fixture: quadrant/db-title-keyword-trailing-space]
  [fixture: quadrant/gram-title-glued-word]
  [fixture: quadrant/db-title-twice]
  [fixture: quadrant/db-title-twice-empty-last]
  [fixture: quadrant/db-title-indented]
  [fixture: quadrant/db-title-tab-indented]
  [fixture: quadrant/db-title-tab-separator]
  [fixture: quadrant/db-title-after-semicolon]
  [fixture: quadrant/db-title-frontmatter]
  [fixture: quadrant/db-title-frontmatter-after-statement]
  [fixture: quadrant/db-title-frontmatter-and-statement]
  [fixture: quadrant/db-title-prefix-of-name]
  [fixture: quadrant/gram-title-in-name-middle]
  [fixture: quadrant/gram-title-lf-ends]
  [fixture: quadrant/gram-title-after-axis-text]
- タイトルは行の残りを、両端の空白とタブを除いて取ります。
  行のどの文字もテキストで、引用符、`;`、`#`、1 つの `%`、`%%` とその後ろ、
  コロン、ダッシュ、
  ASCII の外の文字、タグも同じなので、`;` の後ろの文もタイトルの一部です。
  コメントの規則は適用されません。
  中のディレクティブは、字句解析がテキストを読む前に取り除かれます。
  タイトルは点に見えることもあり、`title: [0.3, 0.6]` はタイトルです。
  数字のタイトルもタイトルで、ほかの文や `;` の後ろでも同じです。
  [fixture: quadrant/db-title-spaces-trimmed]
  [fixture: quadrant/db-title-tab-trailing]
  [fixture: quadrant/db-title-inner-spaces]
  [fixture: quadrant/db-title-colon]
  [fixture: quadrant/db-title-quotes-kept]
  [fixture: quadrant/db-title-semicolon-kept]
  [fixture: quadrant/db-title-semicolon-then-statement]
  [fixture: quadrant/db-acc-title-after-semicolon]
  [fixture: quadrant/db-title-hash-kept]
  [fixture: quadrant/db-title-leading-dash]
  [fixture: quadrant/db-title-leading-hash]
  [fixture: quadrant/db-title-leading-semicolon]
  [fixture: quadrant/db-title-percent-kept]
  [fixture: quadrant/db-title-comment-glued-kept]
  [fixture: quadrant/db-title-comment-kept]
  [fixture: quadrant/db-title-comment-only]
  [fixture: quadrant/db-title-directive-removed]
  [fixture: quadrant/db-title-dash]
  [fixture: quadrant/db-title-non-ascii]
  [fixture: quadrant/db-title-html]
  [fixture: quadrant/db-title-entity]
  [fixture: quadrant/db-title-keyword-in-text]
  [fixture: quadrant/db-title-with-colon-point-like]
  [fixture: quadrant/db-title-digit-after-axis-semicolon]
  [fixture: quadrant/db-title-digit-after-classdef]
  [fixture: quadrant/db-title-digit-after-empty-block]
  [fixture: quadrant/db-title-digit-after-point]
  [fixture: quadrant/db-title-digit-after-quadrant]
  [fixture: quadrant/db-title-digit-after-x-axis]
  [fixture: quadrant/db-title-digit-after-x-axis-arrow]
  [fixture: quadrant/db-title-digit-alone]
  [fixture: quadrant/db-title-digits-with-space]
- `accTitle:` と `accDescr:` がアクセシビリティのタイトルと説明を設定します。
  キーワードは大文字小文字を問わず読まれ、
  キーワードとコロンの間には空白かタブを置け、
  テキストはコロンに空白なしで続けられ、コロンは必要です。
  テキストは行の残りから両端の空白を除いたもので、最後の文が勝ち、
  2 つの文は互いに影響しません。
  キーワードに続けた語はキーワードではありません。
  フロントマターの `accTitle` と `accDescr` の欄は何も設定しません。
  [fixture: quadrant/db-acc-title-plain]
  [fixture: quadrant/db-acc-title-glued-colon]
  [fixture: quadrant/db-acc-title-space-before-colon]
  [fixture: quadrant/db-acc-title-tab-before-colon]
  [fixture: quadrant/gram-acc-title-no-colon]
  [fixture: quadrant/db-acc-title-upper-case]
  [fixture: quadrant/db-acc-title-trimmed]
  [fixture: quadrant/db-acc-title-twice]
  [fixture: quadrant/db-acc-title-indented]
  [fixture: quadrant/db-acc-title-frontmatter-like-yaml]
  [fixture: quadrant/gram-acc-title-glued-word]
  [fixture: quadrant/db-acc-descr-plain]
  [fixture: quadrant/db-acc-descr-glued-colon]
  [fixture: quadrant/db-acc-descr-space-before-colon]
  [fixture: quadrant/gram-acc-descr-no-colon]
  [fixture: quadrant/db-acc-descr-upper-case]
  [fixture: quadrant/db-acc-descr-trimmed]
  [fixture: quadrant/db-acc-descr-twice]
  [fixture: quadrant/db-acc-descr-frontmatter-like-yaml]
  [fixture: quadrant/gram-acc-descr-glued-word]
  [fixture: quadrant/db-acc-both]
- アクセシビリティの行のテキストは、タイトルと同じく行の残りです。
  `;`、`#`、コロン、引用符、`%%` とその後ろはテキストの一部で、
  中のディレクティブは取り除かれ、
  キーワードの中のディレクティブも取り除かれるので、キーワードは欠けません。
  コロンの後ろの空白には改行が含まれるので、テキストのない行は、
  テキストのある次の行をテキストとし、
  その行のキーワードはテキストです。
  テキストの終わりでは、前に別のテキストがあっても拒否されます。
  [fixture: quadrant/db-acc-title-semicolon-kept]
  [fixture: quadrant/db-acc-title-semicolon-only]
  [fixture: quadrant/db-acc-title-semicolon-then-statement]
  [fixture: quadrant/db-acc-title-hash-kept]
  [fixture: quadrant/db-acc-title-comment-kept]
  [fixture: quadrant/db-acc-title-quotes-kept]
  [fixture: quadrant/db-acc-title-colon-kept]
  [fixture: quadrant/db-acc-title-directive-removed]
  [fixture: quadrant/div-acc-title-keyword-inside-directive]
  [fixture: quadrant/db-acc-descr-semicolon-kept]
  [fixture: quadrant/db-acc-descr-semicolon-only]
  [fixture: quadrant/db-acc-descr-comment-kept]
  [fixture: quadrant/db-acc-descr-hash-kept]
  [fixture: quadrant/db-acc-descr-directive-removed]
  [fixture: quadrant/gram-acc-title-empty]
  [fixture: quadrant/gram-acc-title-spaces-only]
  [fixture: quadrant/gram-acc-title-twice-empty-last]
  [fixture: quadrant/gram-acc-descr-empty]
  [fixture: quadrant/db-acc-title-next-line]
  [fixture: quadrant/db-acc-title-next-line-after-blank-lines]
  [fixture: quadrant/db-acc-title-next-line-crlf]
  [fixture: quadrant/db-acc-title-next-line-indented]
  [fixture: quadrant/db-acc-title-next-line-keyword]
  [fixture: quadrant/db-acc-title-next-line-no-line-feed-at-end]
  [fixture: quadrant/db-acc-descr-next-line]
  [fixture: quadrant/db-acc-descr-next-line-tab]
- `accDescr {` はブロックを始め、ブロックは最初の `}` で終わります。
  説明はブロックのテキストから、両端の空白と改行の後ろの空白を除いたもので、
  行は 1 つの改行でつながれ、空行とインデントは消えます。
  波括弧は、キーワードに空白なしで続けても、次の行に置いても、
  タブの後ろに置いてもよく、
  ブロックは 1 行でも、改行なしでも書けます。
  空のブロック、空白だけのブロック、空行だけのブロックは、
  空のテキストを設定します。
  ブロックの中では、`;`、`#`、引用符、キーワード、`%%` とその後ろはテキストで、
  ディレクティブは取り除かれ、CRLF と CR だけは改行です。
  後のブロックや `accDescr:` の行は、説明を置き換えます。
  [fixture: quadrant/db-acc-descr-block]
  [fixture: quadrant/db-acc-descr-block-glued-brace]
  [fixture: quadrant/db-acc-descr-block-lines]
  [fixture: quadrant/db-acc-descr-block-indented-lines]
  [fixture: quadrant/db-acc-descr-block-empty]
  [fixture: quadrant/db-acc-descr-block-one-line]
  [fixture: quadrant/db-acc-descr-block-blank-lines]
  [fixture: quadrant/db-acc-descr-block-semicolon-kept]
  [fixture: quadrant/db-acc-descr-block-hash-kept]
  [fixture: quadrant/db-acc-descr-block-comment-kept]
  [fixture: quadrant/db-acc-descr-block-directive-removed]
  [fixture: quadrant/db-acc-descr-block-twice]
  [fixture: quadrant/db-acc-descr-block-then-line]
  [fixture: quadrant/db-acc-descr-line-then-block]
  [fixture: quadrant/db-acc-descr-block-crlf]
  [fixture: quadrant/db-acc-descr-block-cr]
  [fixture: quadrant/db-acc-descr-block-quotes-kept]
  [fixture: quadrant/db-acc-descr-block-keyword-inside]
  [fixture: quadrant/db-acc-descr-block-after-title]
  [fixture: quadrant/db-acc-descr-block-brace-on-next-line]
  [fixture: quadrant/db-acc-descr-block-tab-before-brace]
  [fixture: quadrant/db-acc-descr-block-no-line-feed-after-brace]
  [fixture: quadrant/db-acc-descr-block-empty-braces]
  [fixture: quadrant/db-acc-descr-block-spaces-only]
  [fixture: quadrant/db-acc-descr-block-only-blank-lines]
- ブロックは文で、閉じ波括弧の直後に行末か `;` を必要とします。
  `} ;`、波括弧の後ろの空白と `;` 以外の何か、波括弧に続けたテキスト、
  2 つ目の `}`、
  閉じ波括弧のないブロックは拒否され、
  `D}E` のように波括弧の後ろのテキストが文として読まれる場合も拒否されます。
  波括弧に続けたコメントと、`;` とその後ろの文は、受理されます。
  [fixture: quadrant/db-acc-descr-block-closing-brace-same-line]
  [fixture: quadrant/gram-acc-descr-block-braces-inside]
  [fixture: quadrant/gram-acc-descr-block-unclosed]
  [fixture: quadrant/gram-acc-descr-block-unclosed-no-line-feed]
  [fixture: quadrant/gram-acc-descr-block-statement-after-brace]
  [fixture: quadrant/db-acc-descr-block-statement-after-brace-semicolon]
  [fixture: quadrant/gram-acc-descr-block-stray-brace]
  [fixture: quadrant/gram-acc-descr-block-trailing-spaces-before-brace]
  [fixture: quadrant/gram-acc-descr-block-text-after-brace]
  [fixture: quadrant/gram-acc-descr-block-semicolon-spaced-after-brace]
  [fixture: quadrant/db-comment-after-statement-brace]
- `x-axis` と `y-axis` は、テキストを 1 つか 2 つ取ります。
  `x-axis L --> R` は x 軸の左と右のテキストを、
  `y-axis B --> T` は y 軸の下と上のテキストを設定します。
  矢印のないテキストは最初のテキストだけを設定し、
  矢印があってその後ろに何もないテキストは、
  最初のテキストの後ろに ` ⟶` を付けたもの（`L ⟶`）を設定して、
  2 つ目はそのままです。
  矢印はダッシュ 2 つ以上と `>` で、周りの空白はあってもなくてもよく、
  `->`、`-- >`、2 つ目の矢印、前にテキストのない矢印、矢印だけ、
  キーワードだけは拒否されます。
  軸の文は、名指したものだけを設定して残りを保ちます。
  後の `x-axis M` は左のテキストを変えて右のテキストを保ち、
  後の `x-axis M -->` は左のテキストを矢印付きで設定して右のテキストを保ち、
  テキストが 2 つある後の文は両方を設定します。
  [fixture: quadrant/db-x-axis-both]
  [fixture: quadrant/db-y-axis-both]
  [fixture: quadrant/db-x-axis-left-only]
  [fixture: quadrant/db-y-axis-bottom-only]
  [fixture: quadrant/db-x-axis-left-with-arrow]
  [fixture: quadrant/db-y-axis-bottom-with-arrow]
  [fixture: quadrant/gram-x-axis-right-only]
  [fixture: quadrant/gram-y-axis-top-only]
  [fixture: quadrant/gram-x-axis-arrow-only]
  [fixture: quadrant/gram-y-axis-arrow-only]
  [fixture: quadrant/gram-x-axis-no-text]
  [fixture: quadrant/gram-y-axis-no-text]
  [fixture: quadrant/db-x-axis-glued-arrow]
  [fixture: quadrant/db-y-axis-glued-arrow]
  [fixture: quadrant/db-x-axis-long-arrow]
  [fixture: quadrant/db-y-axis-long-arrow]
  [fixture: quadrant/gram-x-axis-short-arrow]
  [fixture: quadrant/gram-y-axis-short-arrow]
  [fixture: quadrant/gram-x-axis-broken-arrow]
  [fixture: quadrant/gram-y-axis-broken-arrow]
  [fixture: quadrant/gram-x-axis-two-arrows]
  [fixture: quadrant/gram-y-axis-two-arrows]
  [fixture: quadrant/db-x-axis-twice]
  [fixture: quadrant/db-x-axis-twice-arrow-then-both]
  [fixture: quadrant/db-x-axis-twice-arrow-without-right]
  [fixture: quadrant/db-x-axis-twice-both]
  [fixture: quadrant/db-y-axis-twice]
  [fixture: quadrant/db-y-axis-twice-arrow-then-both]
  [fixture: quadrant/db-y-axis-twice-arrow-without-top]
  [fixture: quadrant/db-y-axis-twice-both]
  [fixture: quadrant/db-x-axis-right-only-after-left]
  [fixture: quadrant/db-y-axis-top-only-after-bottom]
  [fixture: quadrant/db-x-axis-arrow-form-then-both]
  [fixture: quadrant/db-y-axis-arrow-form-then-both]
  [fixture: quadrant/db-x-axis-arrow-alone-with-text-after-no-space]
  [fixture: quadrant/db-y-axis-arrow-alone-with-text-after-no-space]
  [fixture: quadrant/db-x-axis-dash-before-arrow]
  [fixture: quadrant/db-y-axis-dash-before-arrow]
  [fixture: quadrant/db-x-axis-dashes-after-text]
  [fixture: quadrant/db-y-axis-dashes-after-text]
- 軸のテキストは、引用符のない形か、引用符で囲んだ形です。
  引用符のないテキストは、語、ASCII の外の文字、`!?$&=+*_./\',`、
  バッククォート、`#`、ダッシュを含み、
  語の間に空白を置けて、ダッシュで始めることはできません。
  コロン、`;`（文を終え、後ろは別の文です）、角括弧、キーワード（`x-axis`、
  `y-axis`、`title` など）は含められず、
  その行は拒否されます。
  引用符で囲んだテキストはこれらすべてと、矢印、括弧、改行を含められ、
  引用符を除いたものがテキストです。
  引用符で囲んだテキストの後ろの引用符なしのテキストは、空白でつながれますが、
  引用符なしのテキストの後ろの引用符付きのテキスト、
  続けて並べた 2 つの引用符付きのテキスト、
  閉じていない引用符は拒否されます。
  引用符の中のバッククォートはマークダウン文字列で、
  バッククォートを除いたものがテキストです。
  改行も含められます。
  引用符のないバッククォートはテキストの一部で、
  閉じていないマークダウン文字列は拒否されます。
  [fixture: quadrant/db-x-axis-quoted-both]
  [fixture: quadrant/db-y-axis-quoted-both]
  [fixture: quadrant/db-x-axis-quoted-left-only]
  [fixture: quadrant/db-y-axis-quoted-bottom-only]
  [fixture: quadrant/db-x-axis-quoted-arrow]
  [fixture: quadrant/db-y-axis-quoted-arrow]
  [fixture: quadrant/db-x-axis-quoted-real-arrow]
  [fixture: quadrant/db-y-axis-quoted-real-arrow]
  [fixture: quadrant/db-x-axis-markdown-string]
  [fixture: quadrant/db-y-axis-markdown-string]
  [fixture: quadrant/db-x-axis-backticks-without-quotes]
  [fixture: quadrant/db-y-axis-backticks-without-quotes]
  [fixture: quadrant/db-x-axis-text-with-dash]
  [fixture: quadrant/db-y-axis-text-with-dash]
  [fixture: quadrant/db-x-axis-quoted-brackets]
  [fixture: quadrant/db-y-axis-quoted-brackets]
  [fixture: quadrant/db-x-axis-quoted-newline]
  [fixture: quadrant/db-y-axis-quoted-newline]
  [fixture: quadrant/db-x-axis-quoted-glued-text]
  [fixture: quadrant/db-y-axis-quoted-glued-text]
  [fixture: quadrant/db-x-axis-markdown-multiline]
  [fixture: quadrant/db-y-axis-markdown-multiline]
  [fixture: quadrant/db-x-axis-unicode-text]
  [fixture: quadrant/db-y-axis-unicode-text]
  [fixture: quadrant/db-x-axis-numeric-text]
  [fixture: quadrant/db-y-axis-numeric-text]
  [fixture: quadrant/db-x-axis-space-text-with-punctuation]
  [fixture: quadrant/db-y-axis-space-text-with-punctuation]
  [fixture: quadrant/db-x-axis-html]
  [fixture: quadrant/db-y-axis-html]
  [fixture: quadrant/db-x-axis-entity]
  [fixture: quadrant/db-y-axis-entity]
  [fixture: quadrant/gram-x-axis-text-with-colon]
  [fixture: quadrant/gram-y-axis-text-with-colon]
  [fixture: quadrant/gram-x-axis-text-starting-with-dash]
  [fixture: quadrant/gram-y-axis-text-starting-with-dash]
  [fixture: quadrant/gram-x-axis-text-with-brackets]
  [fixture: quadrant/gram-y-axis-text-with-brackets]
  [fixture: quadrant/gram-x-axis-keyword-in-text]
  [fixture: quadrant/gram-y-axis-keyword-in-text]
  [fixture: quadrant/gram-x-axis-semicolon-in-text]
  [fixture: quadrant/gram-y-axis-semicolon-in-text]
  [fixture: quadrant/gram-x-axis-quoted-unclosed]
  [fixture: quadrant/gram-y-axis-quoted-unclosed]
  [fixture: quadrant/gram-x-axis-text-then-quoted]
  [fixture: quadrant/gram-y-axis-text-then-quoted]
  [fixture: quadrant/gram-x-axis-two-quoted]
  [fixture: quadrant/gram-y-axis-two-quoted]
  [fixture: quadrant/gram-x-axis-markdown-unclosed]
  [fixture: quadrant/gram-y-axis-markdown-unclosed]
- 空の引用符の文字列は、
  文がそれで始まるとき（`x-axis ""` と `x-axis "" --> R`）は拒否されますが、
  矢印の後ろでは捨てられ、文はテキストと、その後ろに何もない矢印になります。
  空白だけの文字列はテキストで、Db は空に切り詰めます。
  `x-axis "  " --> R` は左のテキストを空のままにして右のテキストを設定し、
  `x-axis "  "` は空の左のテキストを設定します。
  [fixture: quadrant/gram-x-axis-empty-string]
  [fixture: quadrant/gram-y-axis-empty-string]
  [fixture: quadrant/gram-x-axis-empty-string-with-arrow]
  [fixture: quadrant/gram-y-axis-empty-string-with-arrow]
  [fixture: quadrant/div-x-axis-empty-string-after-arrow]
  [fixture: quadrant/div-y-axis-empty-string-after-arrow]
  [fixture: quadrant/db-x-axis-spaces-only-string]
  [fixture: quadrant/db-y-axis-spaces-only-string]
  [fixture: quadrant/db-x-axis-spaces-only-string-alone]
  [fixture: quadrant/db-y-axis-spaces-only-string-alone]
- キーワードは大文字小文字を問わず読まれ、前に空白を置け、
  テキストを続けて書けます（`x-axisL`）。
  キーワードの後ろのダッシュ、キーワードとテキストの間のタブ、
  矢印の周りのタブは拒否されます。
  テキストと矢印の周りの余分な空白は取り除かれ、
  矢印の周りのノーブレークスペースはテキストの一部で、Db が切り詰めます。
  x 軸と y 軸は別々の文で、どちらの順でも書け、
  `;` は文を終えて次の文を続けられます。
  [fixture: quadrant/db-x-axis-upper-case]
  [fixture: quadrant/db-y-axis-upper-case]
  [fixture: quadrant/db-x-axis-extra-spaces]
  [fixture: quadrant/db-y-axis-extra-spaces]
  [fixture: quadrant/db-x-axis-glued-text]
  [fixture: quadrant/db-y-axis-glued-text]
  [fixture: quadrant/gram-x-axis-glued-dash]
  [fixture: quadrant/gram-y-axis-glued-dash]
  [fixture: quadrant/db-x-axis-indented]
  [fixture: quadrant/db-y-axis-indented]
  [fixture: quadrant/gram-x-axis-tab-after-keyword]
  [fixture: quadrant/gram-y-axis-tab-after-keyword]
  [fixture: quadrant/gram-x-axis-tab-around-arrow]
  [fixture: quadrant/gram-y-axis-tab-around-arrow]
  [fixture: quadrant/db-x-axis-nbsp-around-arrow]
  [fixture: quadrant/db-y-axis-nbsp-around-arrow]
  [fixture: quadrant/db-x-axis-then-y-axis]
  [fixture: quadrant/db-axes-y-then-x]
  [fixture: quadrant/db-x-axis-semicolon-then-y]
  [fixture: quadrant/db-axes-semicolon-y-then-x]
  [fixture: quadrant/db-x-axis-trailing-semicolon]
  [fixture: quadrant/db-y-axis-trailing-semicolon]
- 空白の後ろのコメントは読み飛ばされ、ディレクティブも同じで、
  キーワード、テキスト、矢印の中のディレクティブは取り除かれます。
  テキストに続けたコメントは、
  直前の文字が字句解析にとって 1 文字の単位であるときに、その文字を取ります
  （後の「コメント」を参照）。
  `x-axis L%% c` はテキストがなく拒否され、
  `x-axis L --> R%% c` は左のテキストと矢印になります。
  `x-axis Lm-%% c` はダッシュを、`x-axis L --> Rm1%% c` は数字を失います。
  2 文字以上の語に続けたコメントは、その語から何も取りません。
  [fixture: quadrant/db-x-axis-comment-after-text]
  [fixture: quadrant/db-y-axis-comment-after-text]
  [fixture: quadrant/div-x-axis-comment-glued-text]
  [fixture: quadrant/div-y-axis-comment-glued-text]
  [fixture: quadrant/db-x-axis-comment-glued-text-longer]
  [fixture: quadrant/db-y-axis-comment-glued-text-longer]
  [fixture: quadrant/div-x-axis-comment-glued-arrow]
  [fixture: quadrant/div-y-axis-comment-glued-arrow]
  [fixture: quadrant/div-x-axis-comment-unit-dash]
  [fixture: quadrant/div-x-axis-comment-unit-right-digit]
  [fixture: quadrant/div-y-axis-comment-unit-dash]
  [fixture: quadrant/div-y-axis-comment-unit-top-digit]
  [fixture: quadrant/db-x-axis-comment-after-arrow]
  [fixture: quadrant/db-y-axis-comment-after-arrow]
  [fixture: quadrant/db-x-axis-directive-in-text]
  [fixture: quadrant/db-y-axis-directive-in-text]
  [fixture: quadrant/div-x-axis-directive-in-arrow]
  [fixture: quadrant/div-y-axis-directive-in-arrow]
  [fixture: quadrant/div-x-axis-directive-in-keyword]
  [fixture: quadrant/div-y-axis-directive-in-keyword]
- `quadrant-1` から `quadrant-4` が 4 つのテキストを設定し、
  `quadrants` は文の順にかかわらず、番号の順に並べます。
  文が名指さない象限は空のテキストで、象限ごとに最後の文が勝ち、
  空白だけの文字列は空のテキストを設定します。
  キーワードは大文字小文字を問わず読まれ、テキストを続けて書け、
  `quadrant-10` は `quadrant-1` とテキスト `0 …` です。
  `quadrant-0`、`quadrant-5`、キーワードだけ、空の文字列は拒否されます。
  テキストの周りの空白は取り除かれ、中の空白は保たれます。
  [fixture: quadrant/db-quadrant-all-four]
  [fixture: quadrant/db-quadrant-reverse-order]
  [fixture: quadrant/db-quadrant-1-alone]
  [fixture: quadrant/db-quadrant-2-alone]
  [fixture: quadrant/db-quadrant-3-alone]
  [fixture: quadrant/db-quadrant-4-alone]
  [fixture: quadrant/gram-quadrant-no-text]
  [fixture: quadrant/gram-quadrant-empty-string]
  [fixture: quadrant/gram-quadrant-five]
  [fixture: quadrant/gram-quadrant-zero]
  [fixture: quadrant/db-quadrant-ten]
  [fixture: quadrant/db-quadrant-upper-case]
  [fixture: quadrant/db-quadrant-glued-text]
  [fixture: quadrant/db-quadrant-twice]
  [fixture: quadrant/db-quadrant-twice-empty-spaces]
  [fixture: quadrant/db-quadrant-spaces-trimmed]
- 象限のテキストも、軸のテキストと同じく、引用符のない形か引用符で囲んだ形で、
  使える文字も同じです。
  語、中のダッシュ、`#`、句読点 `!?$&=+*_./\',`、バッククォート、
  ASCII の外の文字、タブ、ノーブレークスペース、全角スペースが使えます。
  先頭のダッシュ、コロン、`;`（文を終えます）、各種の括弧、`|`、`@`、`^`、
  `~` は使えません。
  矢印 `-->` は矢印と読まれ、この文には矢印がないので、行は拒否されます。
  引用符の中では、これらすべてと改行がテキストです。
  引用符の文字列の後ろのテキストは、空白でつながれ、
  引用符なしのテキストの後ろの文字列は許されず、
  マークダウン文字列はバッククォートを除いたものがテキストです。
  テキストの中のキーワード（`quadrant-2`、`title`）はキーワードで、
  キーワードの後ろの点のような `A: [0.3, 0.6]` は拒否されます。
  [fixture: quadrant/gram-quadrant-tab-after-keyword]
  [fixture: quadrant/db-quadrant-tab-inside]
  [fixture: quadrant/db-quadrant-dash-inside]
  [fixture: quadrant/gram-quadrant-leading-dash]
  [fixture: quadrant/gram-quadrant-colon]
  [fixture: quadrant/db-quadrant-colon-in-quotes]
  [fixture: quadrant/db-quadrant-quoted]
  [fixture: quadrant/db-quadrant-quoted-then-bare]
  [fixture: quadrant/gram-quadrant-bare-then-quoted]
  [fixture: quadrant/gram-quadrant-two-strings]
  [fixture: quadrant/gram-quadrant-quoted-unclosed]
  [fixture: quadrant/db-quadrant-quoted-newline]
  [fixture: quadrant/db-quadrant-markdown]
  [fixture: quadrant/db-quadrant-markdown-newline]
  [fixture: quadrant/gram-quadrant-markdown-unclosed]
  [fixture: quadrant/db-quadrant-markdown-then-bare]
  [fixture: quadrant/gram-quadrant-semicolon]
  [fixture: quadrant/db-quadrant-semicolon-in-quotes]
  [fixture: quadrant/db-quadrant-hash]
  [fixture: quadrant/gram-quadrant-brackets]
  [fixture: quadrant/gram-quadrant-parens]
  [fixture: quadrant/gram-quadrant-angle]
  [fixture: quadrant/gram-quadrant-braces]
  [fixture: quadrant/gram-quadrant-pipe]
  [fixture: quadrant/gram-quadrant-at]
  [fixture: quadrant/gram-quadrant-caret]
  [fixture: quadrant/gram-quadrant-tilde]
  [fixture: quadrant/db-quadrant-punctuation]
  [fixture: quadrant/db-quadrant-brackets-in-quotes]
  [fixture: quadrant/gram-quadrant-arrow-in-text]
  [fixture: quadrant/db-quadrant-double-dash]
  [fixture: quadrant/db-quadrant-non-ascii]
  [fixture: quadrant/db-quadrant-nbsp-inside]
  [fixture: quadrant/db-quadrant-ideographic-inside]
  [fixture: quadrant/db-quadrant-ideographic-after-keyword]
  [fixture: quadrant/db-quadrant-nbsp-after-keyword]
  [fixture: quadrant/db-quadrant-nbsp-trailing]
  [fixture: quadrant/db-quadrant-entity]
  [fixture: quadrant/db-quadrant-html]
  [fixture: quadrant/gram-quadrant-keyword-in-text]
  [fixture: quadrant/gram-quadrant-title-in-text]
  [fixture: quadrant/gram-quadrant-point-like-text]
  [fixture: quadrant/db-quadrant-proto-text]
  [fixture: quadrant/db-quadrant-constructor-text]
  [fixture: quadrant/db-quadrant-trailing-tab]
  [fixture: quadrant/db-quadrant-markdown-then-title]
- 空白の後ろのコメントは読み飛ばされ、ディレクティブは、
  キーワードやテキストの中でも取り除かれます。
  1 文字の単位に続けたコメントはその文字を取り（後の「コメント」を参照）、
  それがテキスト全体なら文にテキストが残らなくなりますが、
  それより長い単位に続けたコメントは何も取りません。
  `;` は文を終え、周りの空白はあってもなくてもよく、次の文を続けられます。
  空行、空白だけの行、行末の空白は何も変えず、CRLF と CR だけは文を終えますが、
  U+2028 と垂直タブは終えません。
  `;` なしで 1 行に並べた 2 つの文は拒否されます。
  [fixture: quadrant/db-quadrant-comment-after-space]
  [fixture: quadrant/div-quadrant-comment-glued]
  [fixture: quadrant/db-quadrant-comment-glued-longer]
  [fixture: quadrant/db-quadrant-directive-inside]
  [fixture: quadrant/div-quadrant-directive-in-keyword]
  [fixture: quadrant/db-quadrant-semicolon-then-next]
  [fixture: quadrant/db-quadrant-semicolon-spaced-then-next]
  [fixture: quadrant/db-quadrant-trailing-semicolon]
  [fixture: quadrant/db-quadrant-blank-lines-between]
  [fixture: quadrant/db-quadrant-whitespace-lines-between]
  [fixture: quadrant/db-quadrant-crlf-between]
  [fixture: quadrant/db-quadrant-cr-between]
  [fixture: quadrant/db-quadrant-cr-cr-lf]
  [fixture: quadrant/gram-quadrant-ls-between]
  [fixture: quadrant/gram-quadrant-vt-between]
  [fixture: quadrant/gram-quadrant-keyword-in-text]
- 点は、名前、コロン、角括弧の中の 2 つの座標で、
  `A: [0.3, 0.6]` のように書きます。
  コロンの周り、角括弧の中、コンマの周りの空白、タブ、
  改行（CRLF も）は空白として扱われ、どれも必須ではありません。
  座標は `1`、または `0` に小数点 `.` と数字を続けたもので、
  要約の `x` と `y` は字句解析が読んだテキストなので、
  `0.30` は `0.30` のままです。
  小数点の `.` は字句解析では任意の1文字で、`0x5`、`0a5`、`0 3`、`0,3`、`0;3`、
  `0#3`、
  引用符、ASCII の外の文字がその位置にあるものも座標で、
  書いたとおりに保たれます。
  その位置の改行は座標になりません。
  1 を超える座標、先頭の 0 がない座標、先頭に 0 が余る座標、負の座標、符号、
  小数点の後ろに数字がない座標、指数、座標が 1 つか 3 つ、
  コンマ・角括弧・コロンの欠落、
  コンマの代わりの `;`、語、空の角括弧、閉じていない角括弧は拒否されます。
  [fixture: quadrant/db-point-plain]
  [fixture: quadrant/db-point-glued]
  [fixture: quadrant/db-point-spaces-everywhere]
  [fixture: quadrant/db-point-tab-around-colon]
  [fixture: quadrant/db-point-tab-inside-brackets]
  [fixture: quadrant/db-point-nbsp-inside-brackets]
  [fixture: quadrant/db-point-newline-after-bracket]
  [fixture: quadrant/db-point-newline-after-comma]
  [fixture: quadrant/db-point-newline-before-bracket]
  [fixture: quadrant/db-point-newline-before-comma]
  [fixture: quadrant/gram-point-newline-before-bracket-open]
  [fixture: quadrant/db-point-crlf-inside]
  [fixture: quadrant/db-point-both-one]
  [fixture: quadrant/db-point-both-zero]
  [fixture: quadrant/db-point-zero-decimals]
  [fixture: quadrant/db-point-trailing-zero]
  [fixture: quadrant/db-point-long-fraction]
  [fixture: quadrant/db-point-one-zero]
  [fixture: quadrant/gram-point-x-over-one]
  [fixture: quadrant/gram-point-x-ten]
  [fixture: quadrant/gram-point-x-two]
  [fixture: quadrant/gram-point-y-over-one]
  [fixture: quadrant/gram-point-no-leading-zero]
  [fixture: quadrant/gram-point-double-zero]
  [fixture: quadrant/gram-point-leading-zero]
  [fixture: quadrant/gram-point-negative]
  [fixture: quadrant/gram-point-plus]
  [fixture: quadrant/gram-point-trailing-dot]
  [fixture: quadrant/gram-point-exponent]
  [fixture: quadrant/gram-point-one-coordinate]
  [fixture: quadrant/gram-point-three-coordinates]
  [fixture: quadrant/gram-point-no-comma]
  [fixture: quadrant/gram-point-semicolon-comma]
  [fixture: quadrant/gram-point-word-coordinate]
  [fixture: quadrant/gram-point-word-second]
  [fixture: quadrant/gram-point-empty-brackets]
  [fixture: quadrant/gram-point-open-bracket-only]
  [fixture: quadrant/gram-point-unclosed]
  [fixture: quadrant/gram-point-double-close]
  [fixture: quadrant/gram-point-no-brackets]
  [fixture: quadrant/gram-point-no-colon]
  [fixture: quadrant/gram-point-parens]
  [fixture: quadrant/db-point-coordinate-any-char-x]
  [fixture: quadrant/db-point-coordinate-any-char-x2]
  [fixture: quadrant/db-point-coordinate-any-char-y]
  [fixture: quadrant/db-point-coordinate-comma]
  [fixture: quadrant/db-point-coordinate-hash]
  [fixture: quadrant/db-point-coordinate-nonascii]
  [fixture: quadrant/db-point-coordinate-quote]
  [fixture: quadrant/db-point-coordinate-semicolon]
  [fixture: quadrant/db-point-coordinate-space-in-x]
  [fixture: quadrant/db-point-coordinate-tab-in-x]
  [fixture: quadrant/gram-point-coordinate-line-feed]
- 点は閉じ角括弧で終わります。
  その後ろの空白は読み飛ばされ、
  その後ろのタブは名前のないスタイルとして読まれて拒否されます。
  `;` は点を終え、その後ろに文を続けられ、文の間の `;;` や `; ;` は空の文です。
  `;` なしで同じ行に続けた別の点や語は拒否されます。
  語はスタイルとして読まれ、`x` はスタイルではありません。
  空白の後ろのコメントも、閉じ角括弧に続けたコメントも読み飛ばされますが、
  `%` は座標の文字ではないので、角括弧の中のコメントは読み飛ばされません。
  角括弧の中、コロンと角括弧の間、名前の中のディレクティブは取り除かれます。
  CRLF と CR だけは点を終えます。
  [fixture: quadrant/db-point-trailing-space]
  [fixture: quadrant/gram-point-trailing-tab]
  [fixture: quadrant/db-point-semicolon]
  [fixture: quadrant/db-point-semicolon-spaced-next]
  [fixture: quadrant/db-point-semicolon-twice]
  [fixture: quadrant/db-point-semicolon-gap]
  [fixture: quadrant/gram-point-two-on-line]
  [fixture: quadrant/gram-point-text-after]
  [fixture: quadrant/gram-point-text-after-spaced]
  [fixture: quadrant/db-point-comment-after-space]
  [fixture: quadrant/db-point-comment-glued]
  [fixture: quadrant/gram-point-comment-inside]
  [fixture: quadrant/db-point-directive-inside]
  [fixture: quadrant/db-point-directive-after-colon]
  [fixture: quadrant/db-point-directive-in-name]
  [fixture: quadrant/db-point-crlf-between]
  [fixture: quadrant/db-point-cr-between]
- `points` は、Db が持つ順に点を並べ、これはテキストの順の逆です。
  新しい点が先頭に置かれるからです。
  名前が同じ、位置が同じ、またはその両方が同じ 2 つの点は、2 つの点で、
  点の間の別の文は点の順を変えません。
  [fixture: quadrant/db-points-three]
  [fixture: quadrant/db-points-same-name]
  [fixture: quadrant/db-points-same-position]
  [fixture: quadrant/db-points-identical]
  [fixture: quadrant/db-points-between-statements]
- 点の名前は、象限のテキストと同じ種類のテキストです。
  引用符のない形か引用符で囲んだ形で、中の空白は保たれ、周りの空白は取り除かれ、
  コンマ、`#`、中のダッシュ、数字、ASCII の外の文字は名前の一部です。
  先頭のダッシュ、コロン、`;`、角括弧は名前に含められず、
  矢印 `-->` は拒否されます。
  引用符の中ではコロン、マークダウン文字列、改行、タグが使えます。
  空白だけの文字列は、Db が空のテキストに切り詰める名前で、
  空の文字列は拒否されます。
  `Object.prototype` の名前は普通の名前です。
  キーワードは名前ではなく、`x-axis: [0.3, 0.6]`、`quadrant-1: [0.3, 0.6]`、
  `classDef: [0.3, 0.6]`、
  `quadrantChart: [0.3, 0.6]` は拒否されます。
  一方 `title: [0.3, 0.6]` はタイトル、
  `accTitle: [0.3, 0.6]` はアクセシビリティのタイトルで、
  引用符の中のキーワードは名前で、
  キーワードで始まって語として続く語（`classDefs`）も名前です。
  点のない名前は拒否されます。
  空白の後ろのコメントはその名前の行を終え、次の行の点は拒否されます。
  名前に続けたコメントは、最後の文字が 1 文字の単位であるとき、
  その文字と行の残りを取ります。
  `A1%% c: [0.3, 0.6]` は点がなくなって拒否され、
  1 文字の名前は行全体がコメントになって受理されます。
  [fixture: quadrant/db-name-acc-descr-word]
  [fixture: quadrant/db-name-acc-title-word]
  [fixture: quadrant/db-name-backticks]
  [fixture: quadrant/db-name-comma]
  [fixture: quadrant/div-name-comment-glued]
  [fixture: quadrant/db-name-constructor]
  [fixture: quadrant/db-name-dash]
  [fixture: quadrant/db-name-digits]
  [fixture: quadrant/db-name-entity]
  [fixture: quadrant/db-name-has-own-property]
  [fixture: quadrant/db-name-hash]
  [fixture: quadrant/db-name-html]
  [fixture: quadrant/db-name-ideographic]
  [fixture: quadrant/db-name-indented]
  [fixture: quadrant/db-name-keyword-in-quotes]
  [fixture: quadrant/db-name-keyword-prefix]
  [fixture: quadrant/db-name-long-spaces]
  [fixture: quadrant/db-name-markdown]
  [fixture: quadrant/db-name-nbsp]
  [fixture: quadrant/db-name-non-ascii]
  [fixture: quadrant/db-name-proto]
  [fixture: quadrant/db-name-quoted]
  [fixture: quadrant/db-name-quoted-colon]
  [fixture: quadrant/db-name-quoted-newline]
  [fixture: quadrant/db-name-quoted-spaces]
  [fixture: quadrant/db-name-single-dash]
  [fixture: quadrant/db-name-spaces]
  [fixture: quadrant/db-name-spaces-trimmed]
  [fixture: quadrant/db-name-tab-inside]
  [fixture: quadrant/db-name-to-string]
  [fixture: quadrant/gram-name-arrow]
  [fixture: quadrant/gram-name-bracket]
  [fixture: quadrant/gram-name-class-def-keyword]
  [fixture: quadrant/gram-name-colon]
  [fixture: quadrant/gram-name-comment-after-space]
  [fixture: quadrant/gram-name-comment-unit-digit]
  [fixture: quadrant/gram-name-header-word]
  [fixture: quadrant/gram-name-keyword-word-inside]
  [fixture: quadrant/gram-name-leading-dash]
  [fixture: quadrant/gram-name-only]
  [fixture: quadrant/gram-name-quadrant-keyword]
  [fixture: quadrant/gram-name-quoted-empty]
  [fixture: quadrant/gram-name-semicolon]
  [fixture: quadrant/gram-name-x-axis]
- 点のスタイルは閉じ角括弧の後ろにコンマで区切って書きます。
  `radius`（数字だけで、数として保たれ、`007` は 7）、
  `color` と `stroke-color`（3 桁か 6 桁の 16 進数で、
  `#` はあってもなくてもよく、書いたとおりに保たれます）、
  `stroke-width`（数字と `px` で、書いたとおりに保たれます）です。
  数が無限になるほど桁の多い radius は、クラスの中でも、
  JSON にそのような数がないので、テキスト `Infinity` です。
  同じスタイルを 2 回書くと最後の値になります。
  名前は小文字だけが読まれ、名前、値、コンマの周りの空白は取り除かれ、
  コロンの前に空白を置けます。
  値の後ろのコロンは値を終え、その後ろは捨てられます。
  拒否されるのは、未知の名前、radius の単位、符号、小数、16 進数でない値、
  `px` のない stroke-width、
  大文字の `PX`、`px` の前の空白、値やコロンの欠落、空のスタイル、
  コンマなしで空白だけで並べた 2 つの値、末尾・先頭・連続のコンマ、
  次の行に続くスタイル、値の中のキーワード、
  値の中のノーブレークスペースです。
  [fixture: quadrant/db-style-radius]
  [fixture: quadrant/db-style-radius-glued]
  [fixture: quadrant/db-style-radius-spaced-colon]
  [fixture: quadrant/db-style-radius-zero]
  [fixture: quadrant/db-style-radius-leading-zeros]
  [fixture: quadrant/db-style-radius-big]
  [fixture: quadrant/db-style-radius-overflow]
  [fixture: quadrant/gram-style-radius-unit]
  [fixture: quadrant/gram-style-radius-negative]
  [fixture: quadrant/gram-style-radius-fraction]
  [fixture: quadrant/gram-style-radius-word]
  [fixture: quadrant/gram-style-radius-empty]
  [fixture: quadrant/gram-style-radius-no-colon]
  [fixture: quadrant/gram-style-radius-two-values]
  [fixture: quadrant/db-style-radius-trailing-space]
  [fixture: quadrant/db-style-radius-colon-after]
  [fixture: quadrant/gram-style-radius-double-colon]
  [fixture: quadrant/gram-style-radius-leading-colon]
  [fixture: quadrant/db-style-color]
  [fixture: quadrant/db-style-color-colon-after]
  [fixture: quadrant/db-style-color-colon-space-after]
  [fixture: quadrant/db-style-color-no-hash]
  [fixture: quadrant/db-style-color-short]
  [fixture: quadrant/db-style-color-upper]
  [fixture: quadrant/gram-style-color-four-digits]
  [fixture: quadrant/gram-style-color-function]
  [fixture: quadrant/gram-style-color-hash-only]
  [fixture: quadrant/gram-style-color-name]
  [fixture: quadrant/gram-style-color-not-hex]
  [fixture: quadrant/db-style-stroke-color]
  [fixture: quadrant/db-style-stroke-width]
  [fixture: quadrant/db-style-stroke-width-big]
  [fixture: quadrant/db-style-stroke-width-leading-zero]
  [fixture: quadrant/gram-style-stroke-width-fraction]
  [fixture: quadrant/gram-style-stroke-width-no-unit]
  [fixture: quadrant/gram-style-stroke-width-spaced-unit]
  [fixture: quadrant/gram-style-stroke-width-upper-unit]
  [fixture: quadrant/db-style-two]
  [fixture: quadrant/db-style-two-reversed]
  [fixture: quadrant/db-style-four]
  [fixture: quadrant/db-style-same-twice]
  [fixture: quadrant/gram-style-trailing-comma]
  [fixture: quadrant/gram-style-leading-comma]
  [fixture: quadrant/gram-style-double-comma]
  [fixture: quadrant/gram-style-no-comma]
  [fixture: quadrant/gram-style-upper-case-key]
  [fixture: quadrant/gram-style-capital-key]
  [fixture: quadrant/gram-style-unknown-key]
  [fixture: quadrant/db-style-space-around]
  [fixture: quadrant/db-style-tab-around]
  [fixture: quadrant/gram-style-nbsp-in-value]
  [fixture: quadrant/gram-style-newline-after-comma]
  [fixture: quadrant/gram-style-newline-in-style]
  [fixture: quadrant/db-style-semicolon-then-point]
  [fixture: quadrant/db-style-with-class]
  [fixture: quadrant/gram-style-keyword-in-value]
  [fixture: quadrant/gram-style-value-hash]
  [fixture: quadrant/gram-style-non-ascii-key]
  [fixture: quadrant/db-style-colon-in-point-name]
  [fixture: quadrant/db-classdef-with-point-radius-overflow]
- スタイルの後ろのコメント、ディレクティブ、`;` は、
  スタイルのない点を終えるのと同じように点を終えます。
  値の中のディレクティブは取り除かれます。
  2 桁の数に続けたコメントは何も取りませんが、
  1 桁の数に続けたコメントはその桁を取り、値のないスタイルが残って拒否されます。
  [fixture: quadrant/db-style-radius-semicolon]
  [fixture: quadrant/db-style-radius-comment]
  [fixture: quadrant/db-style-radius-comment-glued]
  [fixture: quadrant/div-style-radius-comment-glued-one-digit]
  [fixture: quadrant/db-style-radius-directive-inside]
- 名前の後ろの `:::` が点にクラス名を与えます（`A:::c1: [0.3, 0.6]`）。
  `:::` の前とコロンの前に空白を置け、点の後ろのスタイルも書けます。
  クラス名は ASCII の単語文字（英字、数字、`_`）で、大文字小文字を保ち、
  検査されません。
  どの `classDef` も与えないクラスも、点に残ります。
  `:::` の後ろの空白、空の名前、ダッシュ、ASCII の外の文字、2 つ目の `:::`、
  後ろにコロンのない名前、前に名前のないクラスは拒否されます。
  `Object.prototype` の名前は普通のクラス名で、
  名前の中のディレクティブは取り除かれます。
  [fixture: quadrant/db-class-constructor]
  [fixture: quadrant/db-class-digits]
  [fixture: quadrant/div-class-directive-inside]
  [fixture: quadrant/db-class-has-own-property]
  [fixture: quadrant/db-class-marker-in-bare-name]
  [fixture: quadrant/db-class-marker-with-comment]
  [fixture: quadrant/db-class-name-with-trailing-text]
  [fixture: quadrant/db-class-on-quoted-name]
  [fixture: quadrant/db-class-plain]
  [fixture: quadrant/db-class-proto]
  [fixture: quadrant/db-class-spaces-around]
  [fixture: quadrant/db-class-undefined]
  [fixture: quadrant/db-class-underscore]
  [fixture: quadrant/db-class-upper-case]
  [fixture: quadrant/gram-class-after-colon-name]
  [fixture: quadrant/gram-class-dash]
  [fixture: quadrant/gram-class-empty-name]
  [fixture: quadrant/gram-class-in-name-position]
  [fixture: quadrant/gram-class-non-ascii]
  [fixture: quadrant/gram-class-space-after-marker]
  [fixture: quadrant/gram-class-two-markers]
- `classDef 名前 スタイル` はクラスを定義します。
  名前、空白、点と同じスタイルです。
  クラスは最後の定義のスタイルだけを持ち、2 つ目の定義は 1 つ目を置き換えて、
  併合しません。
  `classes` は最初の定義の順にクラスを並べます。
  どの点も使わないクラスも並べられ、クラスは使う点の前でも後ろでも定義でき、
  Db は点のスタイルとそのクラスのスタイルを併合しません。
  キーワードは大文字小文字を問わず読まれ、キーワードに続けた語、
  名前の前の 2 つの空白、
  引用符で囲んだ名前、名前としてのキーワードは拒否され、
  名前の後ろの 2 つの空白は受理されます。
  キーワード、名前、値の中のディレクティブは取り除かれます。
  [fixture: quadrant/db-classdef-color]
  [fixture: quadrant/db-classdef-two-styles]
  [fixture: quadrant/db-classdef-all-four]
  [fixture: quadrant/db-classdef-twice-replaces]
  [fixture: quadrant/db-classdef-twice-same-style]
  [fixture: quadrant/db-classdef-two-classes]
  [fixture: quadrant/db-classdef-redefine-order]
  [fixture: quadrant/gram-classdef-no-style]
  [fixture: quadrant/gram-classdef-name-only-space]
  [fixture: quadrant/gram-classdef-no-name]
  [fixture: quadrant/gram-classdef-bad-style]
  [fixture: quadrant/gram-classdef-empty-value]
  [fixture: quadrant/db-classdef-two-spaces-after-name]
  [fixture: quadrant/gram-classdef-two-spaces-before-name]
  [fixture: quadrant/db-classdef-upper-case]
  [fixture: quadrant/db-classdef-lower-case]
  [fixture: quadrant/gram-classdef-glued-name]
  [fixture: quadrant/gram-classdef-quoted-name]
  [fixture: quadrant/db-classdef-class-used-after]
  [fixture: quadrant/db-classdef-class-used-before]
  [fixture: quadrant/db-classdef-point-style-and-class]
  [fixture: quadrant/db-classdef-unused]
  [fixture: quadrant/db-classdef-indented]
  [fixture: quadrant/gram-classdef-keyword-as-class]
  [fixture: quadrant/gram-classdef-name-keyword-title]
  [fixture: quadrant/db-classdef-blank-line-between]
- クラスの名前は、数字、英字、ダッシュ、コロン、コンマ、`&`、`#`、`*`、
  ASCII の外の文字です。
  アンダースコア、ドット、空白は使えません（空白は名前を終え、
  次の語はスタイルとして読まれます）。
  `__proto__` も使えませんが、`constructor`、`hasOwnProperty`、
  `toString` は普通の名前です。
  クラスの行は行末で終わり、`;` では終わりません。
  `classDef c1 color: #f00;` は拒否され、次の行の頭の `;` は空の文です。
  スタイルの後ろのコメントは読み飛ばされ、
  1 桁の数字で終わる色（`#ff0`）に続けたコメントは、
  その数字を取って色が拒否されますが、
  `#f00` に続けたものは何も取らず、
  スタイルの間のタブは値の一部になって拒否されます。
  [fixture: quadrant/db-classdef-comment-after]
  [fixture: quadrant/db-classdef-comment-glued]
  [fixture: quadrant/db-classdef-constructor-name]
  [fixture: quadrant/db-classdef-dash-name]
  [fixture: quadrant/db-classdef-digit-name]
  [fixture: quadrant/db-classdef-has-own-property-name]
  [fixture: quadrant/db-classdef-name-amp]
  [fixture: quadrant/db-classdef-name-colon]
  [fixture: quadrant/db-classdef-name-comma]
  [fixture: quadrant/db-classdef-name-hash]
  [fixture: quadrant/db-classdef-name-star]
  [fixture: quadrant/db-classdef-non-ascii-name]
  [fixture: quadrant/db-classdef-proto-via-dash]
  [fixture: quadrant/db-classdef-semicolon-line-start]
  [fixture: quadrant/db-classdef-to-string-name]
  [fixture: quadrant/div-classdef-comment-unit-single-digit]
  [fixture: quadrant/gram-classdef-name-dot]
  [fixture: quadrant/gram-classdef-proto-name]
  [fixture: quadrant/gram-classdef-semicolon-end]
  [fixture: quadrant/gram-classdef-semicolon-separated]
  [fixture: quadrant/gram-classdef-space-in-name]
  [fixture: quadrant/gram-classdef-tab-between-styles]
  [fixture: quadrant/gram-classdef-underscore-name]
- コメント行は、空白かタブの後ろの `%%` で始まる行で、行末まで続きます。
  中の `;`、キーワード、`#` はコメントの一部で、
  `%%` だけの行と `%%%` もコメントです。
  最初の文の前、文の間、点の間、テキストの終わりのコメント行は、
  改行があってもなくても何も変えず、
  CRLF と CR だけはコメントを終え、U+2028 はコメントの一部です。
  1 つの `%` はコメントを始めず、閉じる `}%%` のない `%%{` もコメントではなく、
  どちらの行も拒否されます。
  `}%% c` は、コメントが波括弧を取るので拒否されます。
  [fixture: quadrant/db-comment-line]
  [fixture: quadrant/header-bare-percent-line-after-header]
  [fixture: quadrant/db-comment-line-last]
  [fixture: quadrant/db-comment-line-no-line-feed]
  [fixture: quadrant/db-comment-line-indented]
  [fixture: quadrant/db-comment-line-tab-indented]
  [fixture: quadrant/db-comment-line-semicolon]
  [fixture: quadrant/db-comment-line-keyword]
  [fixture: quadrant/db-comment-line-hash]
  [fixture: quadrant/db-comment-line-triple]
  [fixture: quadrant/gram-comment-line-single-percent]
  [fixture: quadrant/gram-comment-line-brace]
  [fixture: quadrant/gram-comment-line-after-brace]
  [fixture: quadrant/db-comment-crlf]
  [fixture: quadrant/db-comment-cr]
  [fixture: quadrant/db-comment-ls]
  [fixture: quadrant/db-comment-two-lines]
  [fixture: quadrant/db-comment-between-point-lines]
- `%%` が直前のものに続いているとき、
  字句解析がその直前の文字を 1 文字の単位として読むなら、
  コメントはその文字を取ります。
  字句解析は、英字の並び、数字の並び、ASCII の外の文字の並び、
  そのほかの 1 文字を、それぞれ単位として読みます。
  コメントは `ab1` の `1`、`aé` の `é`、`ab,` の `,`、`Lm-` の `-`、
  `a b` の `b` を取りますが、
  `ab12` や `a日本` からは何も取りません。
  取られた文字は、行の残りといっしょに捨てられます。
  [fixture: quadrant/div-comment-unit-letter-then-non-ascii]
  [fixture: quadrant/div-comment-unit-letters-then-digit]
  [fixture: quadrant/db-comment-unit-non-ascii-run]
  [fixture: quadrant/div-comment-unit-non-ascii-single]
  [fixture: quadrant/div-comment-unit-punctuation]
  [fixture: quadrant/db-comment-unit-two-digits]
  [fixture: quadrant/div-comment-unit-word-after-space]
- ディレクティブは、テキストが読まれる前に、どこにあっても取り除かれます。
  自分の行、行の中の文の前、文の後ろ、語に続けた位置、
  キーワード・名前・数・引用符のテキストの中、
  `;` で区切った文の間、行をまたいだ位置が含まれます
  （[Directives](../../spec/docs/common.md#directives)）。
  図の設定を持つディレクティブは、Db を何も変えません。
  閉じる `}%%` のないディレクティブはテキストの残りを取るので、
  その後ろの文は読まれません。
  テキストの終わりでは、何も取りません。
  `%%{ c }` も同じです。
  [fixture: quadrant/db-directive-after-statement]
  [fixture: quadrant/db-directive-before-statement-same-line]
  [fixture: quadrant/db-directive-between-statements]
  [fixture: quadrant/db-directive-config-width]
  [fixture: quadrant/db-directive-glued-to-statement]
  [fixture: quadrant/db-directive-in-acc-block]
  [fixture: quadrant/div-directive-in-class-name]
  [fixture: quadrant/db-directive-in-header-line]
  [fixture: quadrant/div-directive-in-keyword-classdef]
  [fixture: quadrant/div-directive-in-keyword-title]
  [fixture: quadrant/db-directive-in-point-brackets]
  [fixture: quadrant/db-directive-in-quotes]
  [fixture: quadrant/db-directive-in-style-value]
  [fixture: quadrant/db-directive-line]
  [fixture: quadrant/db-directive-line-empty]
  [fixture: quadrant/db-directive-line-spaces]
  [fixture: quadrant/db-directive-multiline]
  [fixture: quadrant/db-directive-two-in-text]
  [fixture: quadrant/db-directive-unclosed]
  [fixture: quadrant/db-directive-unclosed-last-line]
  [fixture: quadrant/db-directive-wrap-statement]
  [fixture: quadrant/db-comment-line-brace-closed-wrong]
- 引用符の中の `%%` は、マークダウン文字列の中でも、語に続けていても、
  テキストの一部です。
  引用符の外の、空白の後ろの `%%` はコメントです。
  [fixture: quadrant/db-quoted-comment-glued-kept]
  [fixture: quadrant/db-quoted-comment-mark-kept-axis]
  [fixture: quadrant/db-quoted-comment-mark-kept-point]
  [fixture: quadrant/db-quoted-comment-mark-kept-quadrant]
  [fixture: quadrant/db-quoted-comment-mark-markdown]
- 文の後ろに何があるかが、文の終わり方を決めます。
  空白、空白の後ろのコメント、`;`、`;` とコメント、ディレクティブ、CRLF、
  CR だけは、
  タイトル、アクセシビリティの行、軸、象限、点、
  クラスやスタイルのある点を終えます。
  タイトルとアクセシビリティの行は、コメント、`;`、
  ディレクティブをテキストとして取ります（ディレクティブは取り除かれます）。
  `classDef` の行の後ろの `;` は拒否されます。
  点やクラス付きの点の後ろのタブは、
  名前のないスタイルとして読まれて拒否されますが、
  スタイルや `classDef` の行の後ろでは読み飛ばされます。
  文に続けたコメントは、
  その文字が 1 文字の単位であるときに最後の文字を取ります。
  1 文字だけの象限のテキストと 1 桁のスタイルの値が空になって文が拒否され、
  軸の右のテキストが取られて左のテキストに矢印が付いた形が残ります。
  点の閉じ角括弧の後ろや、2 文字以上の単位の後ろでは何も取りません。
  [fixture: quadrant/db-after-acc-descr-cr]
  [fixture: quadrant/db-after-acc-descr-crlf]
  [fixture: quadrant/db-after-acc-descr-directive]
  [fixture: quadrant/db-after-acc-descr-directive-glued]
  [fixture: quadrant/db-after-acc-descr-glued-comment]
  [fixture: quadrant/db-after-acc-descr-semicolon]
  [fixture: quadrant/db-after-acc-descr-semicolon-comment]
  [fixture: quadrant/db-after-acc-descr-space-comment]
  [fixture: quadrant/db-after-acc-descr-trailing-spaces]
  [fixture: quadrant/db-after-acc-descr-trailing-tab]
  [fixture: quadrant/db-after-acc-title-cr]
  [fixture: quadrant/db-after-acc-title-crlf]
  [fixture: quadrant/db-after-acc-title-directive]
  [fixture: quadrant/db-after-acc-title-directive-glued]
  [fixture: quadrant/db-after-acc-title-glued-comment]
  [fixture: quadrant/db-after-acc-title-semicolon]
  [fixture: quadrant/db-after-acc-title-semicolon-comment]
  [fixture: quadrant/db-after-acc-title-space-comment]
  [fixture: quadrant/db-after-acc-title-trailing-spaces]
  [fixture: quadrant/db-after-acc-title-trailing-tab]
  [fixture: quadrant/db-after-classdef-cr]
  [fixture: quadrant/db-after-classdef-crlf]
  [fixture: quadrant/db-after-classdef-directive]
  [fixture: quadrant/db-after-classdef-directive-glued]
  [fixture: quadrant/db-after-classdef-glued-comment]
  [fixture: quadrant/db-after-classdef-space-comment]
  [fixture: quadrant/db-after-classdef-trailing-spaces]
  [fixture: quadrant/db-after-classdef-trailing-tab]
  [fixture: quadrant/db-after-point-class-cr]
  [fixture: quadrant/db-after-point-class-crlf]
  [fixture: quadrant/db-after-point-class-directive]
  [fixture: quadrant/db-after-point-class-directive-glued]
  [fixture: quadrant/db-after-point-class-glued-comment]
  [fixture: quadrant/db-after-point-class-semicolon]
  [fixture: quadrant/db-after-point-class-semicolon-comment]
  [fixture: quadrant/db-after-point-class-space-comment]
  [fixture: quadrant/db-after-point-class-trailing-spaces]
  [fixture: quadrant/db-after-point-cr]
  [fixture: quadrant/db-after-point-crlf]
  [fixture: quadrant/db-after-point-directive]
  [fixture: quadrant/db-after-point-directive-glued]
  [fixture: quadrant/db-after-point-glued-comment]
  [fixture: quadrant/db-after-point-semicolon]
  [fixture: quadrant/db-after-point-semicolon-comment]
  [fixture: quadrant/db-after-point-space-comment]
  [fixture: quadrant/db-after-point-style-cr]
  [fixture: quadrant/db-after-point-style-crlf]
  [fixture: quadrant/db-after-point-style-directive]
  [fixture: quadrant/db-after-point-style-directive-glued]
  [fixture: quadrant/db-after-point-style-semicolon]
  [fixture: quadrant/db-after-point-style-semicolon-comment]
  [fixture: quadrant/db-after-point-style-space-comment]
  [fixture: quadrant/db-after-point-style-trailing-spaces]
  [fixture: quadrant/db-after-point-style-trailing-tab]
  [fixture: quadrant/db-after-point-trailing-spaces]
  [fixture: quadrant/db-after-quadrant-cr]
  [fixture: quadrant/db-after-quadrant-crlf]
  [fixture: quadrant/db-after-quadrant-directive]
  [fixture: quadrant/db-after-quadrant-directive-glued]
  [fixture: quadrant/db-after-quadrant-semicolon]
  [fixture: quadrant/db-after-quadrant-semicolon-comment]
  [fixture: quadrant/db-after-quadrant-space-comment]
  [fixture: quadrant/db-after-quadrant-trailing-spaces]
  [fixture: quadrant/db-after-quadrant-trailing-tab]
  [fixture: quadrant/db-after-title-cr]
  [fixture: quadrant/db-after-title-crlf]
  [fixture: quadrant/db-after-title-directive]
  [fixture: quadrant/db-after-title-directive-glued]
  [fixture: quadrant/db-after-title-glued-comment]
  [fixture: quadrant/db-after-title-semicolon]
  [fixture: quadrant/db-after-title-semicolon-comment]
  [fixture: quadrant/db-after-title-space-comment]
  [fixture: quadrant/db-after-title-trailing-spaces]
  [fixture: quadrant/db-after-title-trailing-tab]
  [fixture: quadrant/db-after-x-axis-cr]
  [fixture: quadrant/db-after-x-axis-crlf]
  [fixture: quadrant/db-after-x-axis-directive]
  [fixture: quadrant/db-after-x-axis-directive-glued]
  [fixture: quadrant/div-after-x-axis-glued-comment]
  [fixture: quadrant/db-after-x-axis-semicolon]
  [fixture: quadrant/db-after-x-axis-semicolon-comment]
  [fixture: quadrant/db-after-x-axis-space-comment]
  [fixture: quadrant/db-after-x-axis-trailing-spaces]
  [fixture: quadrant/db-after-x-axis-trailing-tab]
  [fixture: quadrant/db-after-y-axis-cr]
  [fixture: quadrant/db-after-y-axis-crlf]
  [fixture: quadrant/db-after-y-axis-directive]
  [fixture: quadrant/db-after-y-axis-directive-glued]
  [fixture: quadrant/div-after-y-axis-glued-comment]
  [fixture: quadrant/db-after-y-axis-semicolon]
  [fixture: quadrant/db-after-y-axis-semicolon-comment]
  [fixture: quadrant/db-after-y-axis-space-comment]
  [fixture: quadrant/db-after-y-axis-trailing-spaces]
  [fixture: quadrant/db-after-y-axis-trailing-tab]
  [fixture: quadrant/gram-after-classdef-semicolon]
  [fixture: quadrant/gram-after-classdef-semicolon-comment]
  [fixture: quadrant/gram-after-point-class-trailing-tab]
  [fixture: quadrant/div-after-point-style-glued-comment]
  [fixture: quadrant/gram-after-point-trailing-tab]
  [fixture: quadrant/div-after-quadrant-glued-comment]
- mermaid.js の `style` と `classDef` の行の規則は、
  どのテキストにも適用されます。
  `style:` か `classDef:`、その後ろの `#`、その後ろの `;` を持つ行では、
  最後の `;` が落とされ、
  `style:#x;y` は `style:#xy` になります。
  タイトル、アクセシビリティのテキスト、引用符のテキスト、
  `classDef` のクラスの名前で見られます。
  軸や象限の引用符なしのテキストと点の名前はコロンを取らず、
  点のクラス名は単語文字だけなので、
  それらの場所では拒否されます。
  [fixture: quadrant/db-grid-style-acc-descr]
  [fixture: quadrant/db-grid-style-acc-descr-block]
  [fixture: quadrant/db-grid-style-acc-title]
  [fixture: quadrant/div-grid-style-classdef-name]
  [fixture: quadrant/db-grid-style-point-quoted]
  [fixture: quadrant/db-grid-style-quadrant-quoted]
  [fixture: quadrant/db-grid-style-title]
  [fixture: quadrant/db-grid-style-x-axis-quoted]
  [fixture: quadrant/db-grid-style-x-axis-right-quoted]
  [fixture: quadrant/db-grid-style-y-axis-quoted]
  [fixture: quadrant/db-grid-style-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-style-class-name]
  [fixture: quadrant/gram-grid-style-point-bare]
  [fixture: quadrant/gram-grid-style-quadrant-bare]
  [fixture: quadrant/gram-grid-style-x-axis-bare]
  [fixture: quadrant/gram-grid-style-x-axis-right-bare]
  [fixture: quadrant/gram-grid-style-y-axis-bare]
  [fixture: quadrant/gram-grid-style-y-axis-top-bare]
- `#35;` のような文字参照は、タイトル、アクセシビリティのテキスト、
  軸や象限のテキスト（引用符の有無を問わず）、
  点の名前、`classDef` のクラスの名前では、その代替の文字列（`ﬂ°°35¶ß`、
  Db が描画のときに戻します）になります。
  点のクラス名では、代替の文字列が単語文字でないために拒否されます。
  参照のない `#` は、これらのテキストの文字で、
  点のクラス名の文字ではありません。
  参照は `#`、語か数字、`;` で、`#b;` も参照です。
  `;` のない `#35` は参照ではなく、
  `&amp;` も参照ではなく書いたとおりに残りますが、`&#35;` の `#35;` は参照です。
  続けた 2 つの参照は、2 つの代替の文字列になります。
  [fixture: quadrant/db-grid-entity-acc-descr]
  [fixture: quadrant/db-grid-entity-acc-descr-block]
  [fixture: quadrant/db-grid-entity-acc-title]
  [fixture: quadrant/db-grid-entity-classdef-name]
  [fixture: quadrant/db-grid-entity-point-quoted]
  [fixture: quadrant/db-grid-entity-quadrant-bare]
  [fixture: quadrant/db-grid-entity-quadrant-quoted]
  [fixture: quadrant/db-grid-entity-x-axis-quoted]
  [fixture: quadrant/db-grid-entity-x-axis-right-bare]
  [fixture: quadrant/db-grid-entity-x-axis-right-quoted]
  [fixture: quadrant/db-grid-entity-y-axis-quoted]
  [fixture: quadrant/db-grid-entity-y-axis-top-bare]
  [fixture: quadrant/db-grid-entity-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-entity-class-name]
  [fixture: quadrant/db-title-entity]
  [fixture: quadrant/db-x-axis-entity]
  [fixture: quadrant/db-y-axis-entity]
  [fixture: quadrant/db-quadrant-entity]
  [fixture: quadrant/db-name-entity]
  [fixture: quadrant/db-grid-hash-acc-descr]
  [fixture: quadrant/db-grid-hash-acc-descr-block]
  [fixture: quadrant/db-grid-hash-acc-title]
  [fixture: quadrant/db-grid-hash-classdef-name]
  [fixture: quadrant/db-grid-hash-point-bare]
  [fixture: quadrant/db-grid-hash-point-quoted]
  [fixture: quadrant/db-grid-hash-quadrant-bare]
  [fixture: quadrant/db-grid-hash-quadrant-quoted]
  [fixture: quadrant/db-grid-hash-title]
  [fixture: quadrant/db-grid-hash-x-axis-bare]
  [fixture: quadrant/db-grid-hash-x-axis-quoted]
  [fixture: quadrant/db-grid-hash-x-axis-right-bare]
  [fixture: quadrant/db-grid-hash-x-axis-right-quoted]
  [fixture: quadrant/db-grid-hash-y-axis-bare]
  [fixture: quadrant/db-grid-hash-y-axis-quoted]
  [fixture: quadrant/db-grid-hash-y-axis-top-bare]
  [fixture: quadrant/db-grid-hash-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-hash-class-name]
  [fixture: quadrant/db-entity-hash-in-class-name]
  [fixture: quadrant/db-entity-hash-word-semicolon]
  [fixture: quadrant/db-entity-html-named]
  [fixture: quadrant/db-entity-html-numeric]
  [fixture: quadrant/db-entity-numeric-quadrant-quoted-two]
  [fixture: quadrant/db-entity-without-semicolon]
- 同じ文字は、テキストを取るどの場所にも置けます。
  タブ、U+FEFF、ノーブレークスペース、全角スペース、U+2028、U+2029 は、
  タイトル、アクセシビリティのテキスト、
  軸や象限のテキスト（引用符の有無を問わず）、点の名前の文字で、
  `classDef` のクラスの名前の文字でもあります。
  ただしタブは名前を終えます。
  点のクラス名はどれも受け付けません。
  改行、CR、CRLF は、引用符のない場所では文を終え、
  次の行が文として読まれて拒否されます。
  引用符のテキストの中と、アクセシビリティの説明のブロックの中では、
  テキストの改行です。
  [fixture: quadrant/db-grid-tab-acc-descr]
  [fixture: quadrant/db-grid-tab-acc-descr-block]
  [fixture: quadrant/db-grid-tab-acc-title]
  [fixture: quadrant/db-grid-tab-point-bare]
  [fixture: quadrant/db-grid-tab-point-quoted]
  [fixture: quadrant/db-grid-tab-quadrant-bare]
  [fixture: quadrant/db-grid-tab-quadrant-quoted]
  [fixture: quadrant/db-grid-tab-title]
  [fixture: quadrant/db-grid-tab-x-axis-bare]
  [fixture: quadrant/db-grid-tab-x-axis-quoted]
  [fixture: quadrant/db-grid-tab-x-axis-right-bare]
  [fixture: quadrant/db-grid-tab-x-axis-right-quoted]
  [fixture: quadrant/db-grid-tab-y-axis-bare]
  [fixture: quadrant/db-grid-tab-y-axis-quoted]
  [fixture: quadrant/db-grid-tab-y-axis-top-bare]
  [fixture: quadrant/db-grid-tab-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-tab-class-name]
  [fixture: quadrant/gram-grid-tab-classdef-name]
  [fixture: quadrant/db-grid-bom-acc-descr]
  [fixture: quadrant/db-grid-bom-acc-descr-block]
  [fixture: quadrant/db-grid-bom-acc-title]
  [fixture: quadrant/db-grid-bom-classdef-name]
  [fixture: quadrant/db-grid-bom-point-bare]
  [fixture: quadrant/db-grid-bom-point-quoted]
  [fixture: quadrant/db-grid-bom-quadrant-bare]
  [fixture: quadrant/db-grid-bom-quadrant-quoted]
  [fixture: quadrant/db-grid-bom-title]
  [fixture: quadrant/db-grid-bom-x-axis-bare]
  [fixture: quadrant/db-grid-bom-x-axis-quoted]
  [fixture: quadrant/db-grid-bom-x-axis-right-bare]
  [fixture: quadrant/db-grid-bom-x-axis-right-quoted]
  [fixture: quadrant/db-grid-bom-y-axis-bare]
  [fixture: quadrant/db-grid-bom-y-axis-quoted]
  [fixture: quadrant/db-grid-bom-y-axis-top-bare]
  [fixture: quadrant/db-grid-bom-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-bom-class-name]
  [fixture: quadrant/db-grid-nbsp-acc-descr]
  [fixture: quadrant/db-grid-nbsp-acc-descr-block]
  [fixture: quadrant/db-grid-nbsp-acc-title]
  [fixture: quadrant/db-grid-nbsp-classdef-name]
  [fixture: quadrant/db-grid-nbsp-point-bare]
  [fixture: quadrant/db-grid-nbsp-point-quoted]
  [fixture: quadrant/db-grid-nbsp-quadrant-bare]
  [fixture: quadrant/db-grid-nbsp-quadrant-quoted]
  [fixture: quadrant/db-grid-nbsp-title]
  [fixture: quadrant/db-grid-nbsp-x-axis-bare]
  [fixture: quadrant/db-grid-nbsp-x-axis-quoted]
  [fixture: quadrant/db-grid-nbsp-x-axis-right-bare]
  [fixture: quadrant/db-grid-nbsp-x-axis-right-quoted]
  [fixture: quadrant/db-grid-nbsp-y-axis-bare]
  [fixture: quadrant/db-grid-nbsp-y-axis-quoted]
  [fixture: quadrant/db-grid-nbsp-y-axis-top-bare]
  [fixture: quadrant/db-grid-nbsp-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-nbsp-class-name]
  [fixture: quadrant/db-grid-ideographic-acc-descr]
  [fixture: quadrant/db-grid-ideographic-acc-descr-block]
  [fixture: quadrant/db-grid-ideographic-acc-title]
  [fixture: quadrant/db-grid-ideographic-classdef-name]
  [fixture: quadrant/db-grid-ideographic-point-bare]
  [fixture: quadrant/db-grid-ideographic-point-quoted]
  [fixture: quadrant/db-grid-ideographic-quadrant-bare]
  [fixture: quadrant/db-grid-ideographic-quadrant-quoted]
  [fixture: quadrant/db-grid-ideographic-title]
  [fixture: quadrant/db-grid-ideographic-x-axis-bare]
  [fixture: quadrant/db-grid-ideographic-x-axis-quoted]
  [fixture: quadrant/db-grid-ideographic-x-axis-right-bare]
  [fixture: quadrant/db-grid-ideographic-x-axis-right-quoted]
  [fixture: quadrant/db-grid-ideographic-y-axis-bare]
  [fixture: quadrant/db-grid-ideographic-y-axis-quoted]
  [fixture: quadrant/db-grid-ideographic-y-axis-top-bare]
  [fixture: quadrant/db-grid-ideographic-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-ideographic-class-name]
  [fixture: quadrant/db-grid-ls-acc-descr]
  [fixture: quadrant/db-grid-ls-acc-descr-block]
  [fixture: quadrant/db-grid-ls-acc-title]
  [fixture: quadrant/db-grid-ls-classdef-name]
  [fixture: quadrant/db-grid-ls-point-bare]
  [fixture: quadrant/db-grid-ls-point-quoted]
  [fixture: quadrant/db-grid-ls-quadrant-bare]
  [fixture: quadrant/db-grid-ls-quadrant-quoted]
  [fixture: quadrant/db-grid-ls-title]
  [fixture: quadrant/db-grid-ls-x-axis-bare]
  [fixture: quadrant/db-grid-ls-x-axis-quoted]
  [fixture: quadrant/db-grid-ls-x-axis-right-bare]
  [fixture: quadrant/db-grid-ls-x-axis-right-quoted]
  [fixture: quadrant/db-grid-ls-y-axis-bare]
  [fixture: quadrant/db-grid-ls-y-axis-quoted]
  [fixture: quadrant/db-grid-ls-y-axis-top-bare]
  [fixture: quadrant/db-grid-ls-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-ls-class-name]
  [fixture: quadrant/db-grid-ps-acc-descr]
  [fixture: quadrant/db-grid-ps-acc-descr-block]
  [fixture: quadrant/db-grid-ps-acc-title]
  [fixture: quadrant/db-grid-ps-classdef-name]
  [fixture: quadrant/db-grid-ps-point-bare]
  [fixture: quadrant/db-grid-ps-point-quoted]
  [fixture: quadrant/db-grid-ps-quadrant-bare]
  [fixture: quadrant/db-grid-ps-quadrant-quoted]
  [fixture: quadrant/db-grid-ps-title]
  [fixture: quadrant/db-grid-ps-x-axis-bare]
  [fixture: quadrant/db-grid-ps-x-axis-quoted]
  [fixture: quadrant/db-grid-ps-x-axis-right-bare]
  [fixture: quadrant/db-grid-ps-x-axis-right-quoted]
  [fixture: quadrant/db-grid-ps-y-axis-bare]
  [fixture: quadrant/db-grid-ps-y-axis-quoted]
  [fixture: quadrant/db-grid-ps-y-axis-top-bare]
  [fixture: quadrant/db-grid-ps-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-ps-class-name]
  [fixture: quadrant/db-grid-lf-acc-descr-block]
  [fixture: quadrant/db-grid-lf-point-quoted]
  [fixture: quadrant/db-grid-lf-quadrant-quoted]
  [fixture: quadrant/db-grid-lf-x-axis-quoted]
  [fixture: quadrant/db-grid-lf-x-axis-right-quoted]
  [fixture: quadrant/db-grid-lf-y-axis-quoted]
  [fixture: quadrant/db-grid-lf-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-lf-acc-descr]
  [fixture: quadrant/gram-grid-lf-acc-title]
  [fixture: quadrant/gram-grid-lf-class-name]
  [fixture: quadrant/gram-grid-lf-classdef-name]
  [fixture: quadrant/gram-grid-lf-point-bare]
  [fixture: quadrant/gram-grid-lf-quadrant-bare]
  [fixture: quadrant/gram-grid-lf-title]
  [fixture: quadrant/gram-grid-lf-x-axis-bare]
  [fixture: quadrant/gram-grid-lf-x-axis-right-bare]
  [fixture: quadrant/gram-grid-lf-y-axis-bare]
  [fixture: quadrant/gram-grid-lf-y-axis-top-bare]
  [fixture: quadrant/db-grid-cr-acc-descr-block]
  [fixture: quadrant/db-grid-cr-point-quoted]
  [fixture: quadrant/db-grid-cr-quadrant-quoted]
  [fixture: quadrant/db-grid-cr-x-axis-quoted]
  [fixture: quadrant/db-grid-cr-x-axis-right-quoted]
  [fixture: quadrant/db-grid-cr-y-axis-quoted]
  [fixture: quadrant/db-grid-cr-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-cr-acc-descr]
  [fixture: quadrant/gram-grid-cr-acc-title]
  [fixture: quadrant/gram-grid-cr-class-name]
  [fixture: quadrant/gram-grid-cr-classdef-name]
  [fixture: quadrant/gram-grid-cr-point-bare]
  [fixture: quadrant/gram-grid-cr-quadrant-bare]
  [fixture: quadrant/gram-grid-cr-title]
  [fixture: quadrant/gram-grid-cr-x-axis-bare]
  [fixture: quadrant/gram-grid-cr-x-axis-right-bare]
  [fixture: quadrant/gram-grid-cr-y-axis-bare]
  [fixture: quadrant/gram-grid-cr-y-axis-top-bare]
  [fixture: quadrant/db-grid-crlf-acc-descr-block]
  [fixture: quadrant/db-grid-crlf-point-quoted]
  [fixture: quadrant/db-grid-crlf-quadrant-quoted]
  [fixture: quadrant/db-grid-crlf-x-axis-quoted]
  [fixture: quadrant/db-grid-crlf-x-axis-right-quoted]
  [fixture: quadrant/db-grid-crlf-y-axis-quoted]
  [fixture: quadrant/db-grid-crlf-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-crlf-acc-descr]
  [fixture: quadrant/gram-grid-crlf-acc-title]
  [fixture: quadrant/gram-grid-crlf-class-name]
  [fixture: quadrant/gram-grid-crlf-classdef-name]
  [fixture: quadrant/gram-grid-crlf-point-bare]
  [fixture: quadrant/gram-grid-crlf-quadrant-bare]
  [fixture: quadrant/gram-grid-crlf-title]
  [fixture: quadrant/gram-grid-crlf-x-axis-bare]
  [fixture: quadrant/gram-grid-crlf-x-axis-right-bare]
  [fixture: quadrant/gram-grid-crlf-y-axis-bare]
  [fixture: quadrant/gram-grid-crlf-y-axis-top-bare]
- テキストの中のディレクティブは、クラス名を含め、どの場所でも取り除かれます。
  `Object.prototype` の名前は、名前を取るどの場所でも普通の名前ですが、
  `classDef` のクラスの名前としての `__proto__` は、
  アンダースコアが許されないので例外です。
  キーワード `title` は、タイトル、アクセシビリティのテキスト、
  引用符のテキスト、点のクラス名ではテキストです。
  軸や象限の引用符なしのテキストと `classDef` のクラスの名前は受け付けず、
  点の名前としての `title` はタイトルです。
  [fixture: quadrant/db-grid-directive-acc-descr]
  [fixture: quadrant/db-grid-directive-acc-descr-block]
  [fixture: quadrant/db-grid-directive-acc-title]
  [fixture: quadrant/div-grid-directive-class-name]
  [fixture: quadrant/div-grid-directive-classdef-name]
  [fixture: quadrant/db-grid-directive-point-bare]
  [fixture: quadrant/db-grid-directive-point-quoted]
  [fixture: quadrant/db-grid-directive-quadrant-bare]
  [fixture: quadrant/db-grid-directive-quadrant-quoted]
  [fixture: quadrant/db-grid-directive-title]
  [fixture: quadrant/db-grid-directive-x-axis-bare]
  [fixture: quadrant/db-grid-directive-x-axis-quoted]
  [fixture: quadrant/db-grid-directive-x-axis-right-bare]
  [fixture: quadrant/db-grid-directive-x-axis-right-quoted]
  [fixture: quadrant/db-grid-directive-y-axis-bare]
  [fixture: quadrant/db-grid-directive-y-axis-quoted]
  [fixture: quadrant/db-grid-directive-y-axis-top-bare]
  [fixture: quadrant/db-grid-directive-y-axis-top-quoted]
  [fixture: quadrant/db-grid-proto-acc-descr]
  [fixture: quadrant/db-grid-proto-acc-descr-block]
  [fixture: quadrant/db-grid-proto-acc-title]
  [fixture: quadrant/db-grid-proto-point-quoted]
  [fixture: quadrant/db-grid-proto-quadrant-bare]
  [fixture: quadrant/db-grid-proto-quadrant-quoted]
  [fixture: quadrant/db-grid-proto-title]
  [fixture: quadrant/db-grid-proto-x-axis-bare]
  [fixture: quadrant/db-grid-proto-x-axis-quoted]
  [fixture: quadrant/db-grid-proto-x-axis-right-bare]
  [fixture: quadrant/db-grid-proto-x-axis-right-quoted]
  [fixture: quadrant/db-grid-proto-y-axis-bare]
  [fixture: quadrant/db-grid-proto-y-axis-quoted]
  [fixture: quadrant/db-grid-proto-y-axis-top-bare]
  [fixture: quadrant/db-grid-proto-y-axis-top-quoted]
  [fixture: quadrant/db-grid-constructor-acc-descr]
  [fixture: quadrant/db-grid-constructor-acc-descr-block]
  [fixture: quadrant/db-grid-constructor-acc-title]
  [fixture: quadrant/db-grid-constructor-point-quoted]
  [fixture: quadrant/db-grid-constructor-quadrant-bare]
  [fixture: quadrant/db-grid-constructor-quadrant-quoted]
  [fixture: quadrant/db-grid-constructor-title]
  [fixture: quadrant/db-grid-constructor-x-axis-bare]
  [fixture: quadrant/db-grid-constructor-x-axis-quoted]
  [fixture: quadrant/db-grid-constructor-x-axis-right-bare]
  [fixture: quadrant/db-grid-constructor-x-axis-right-quoted]
  [fixture: quadrant/db-grid-constructor-y-axis-bare]
  [fixture: quadrant/db-grid-constructor-y-axis-quoted]
  [fixture: quadrant/db-grid-constructor-y-axis-top-bare]
  [fixture: quadrant/db-grid-constructor-y-axis-top-quoted]
  [fixture: quadrant/db-class-proto]
  [fixture: quadrant/db-name-proto]
  [fixture: quadrant/gram-classdef-proto-name]
  [fixture: quadrant/db-grid-keyword-acc-descr]
  [fixture: quadrant/db-grid-keyword-acc-descr-block]
  [fixture: quadrant/db-grid-keyword-acc-title]
  [fixture: quadrant/db-grid-keyword-class-name]
  [fixture: quadrant/db-grid-keyword-point-quoted]
  [fixture: quadrant/db-grid-keyword-quadrant-quoted]
  [fixture: quadrant/db-grid-keyword-title]
  [fixture: quadrant/db-grid-keyword-x-axis-quoted]
  [fixture: quadrant/db-grid-keyword-x-axis-right-quoted]
  [fixture: quadrant/db-grid-keyword-y-axis-quoted]
  [fixture: quadrant/db-grid-keyword-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-keyword-quadrant-bare]
  [fixture: quadrant/gram-grid-keyword-x-axis-bare]
  [fixture: quadrant/gram-grid-keyword-x-axis-right-bare]
  [fixture: quadrant/gram-grid-keyword-y-axis-bare]
  [fixture: quadrant/gram-grid-keyword-y-axis-top-bare]
  [fixture: quadrant/gram-classdef-name-keyword-title]
  [fixture: quadrant/db-title-with-colon-point-like]
- 空白の後ろの `%%` は、タイトル、アクセシビリティのテキスト、説明のブロック、
  引用符のテキストではテキストの一部で、
  それ以外ではコメントです。
  軸や象限の引用符なしのテキストでは、
  コメントが読み飛ばされて手前のテキストが残ります。
  点の名前、点のクラス名、`classDef` のクラスの名前の後ろでは、
  点やスタイルのない行になって拒否されます。
  1 文字の単位に続けた `%%` は、その文字を取ります。
  軸や象限の引用符なしのテキストは空になって拒否され、
  軸の右のテキストは捨てられ、
  点の名前は行全体がコメントになって受理され、クラス名は拒否されます。
  [fixture: quadrant/db-grid-comment-acc-descr]
  [fixture: quadrant/db-grid-comment-acc-descr-block]
  [fixture: quadrant/db-grid-comment-acc-title]
  [fixture: quadrant/db-grid-comment-glued-acc-descr]
  [fixture: quadrant/db-grid-comment-glued-acc-descr-block]
  [fixture: quadrant/db-grid-comment-glued-acc-title]
  [fixture: quadrant/div-grid-comment-glued-point-bare]
  [fixture: quadrant/db-grid-comment-glued-point-quoted]
  [fixture: quadrant/db-grid-comment-glued-quadrant-quoted]
  [fixture: quadrant/db-grid-comment-glued-title]
  [fixture: quadrant/db-grid-comment-glued-x-axis-quoted]
  [fixture: quadrant/div-grid-comment-glued-x-axis-right-bare]
  [fixture: quadrant/db-grid-comment-glued-x-axis-right-quoted]
  [fixture: quadrant/db-grid-comment-glued-y-axis-quoted]
  [fixture: quadrant/div-grid-comment-glued-y-axis-top-bare]
  [fixture: quadrant/db-grid-comment-glued-y-axis-top-quoted]
  [fixture: quadrant/db-grid-comment-point-quoted]
  [fixture: quadrant/db-grid-comment-quadrant-bare]
  [fixture: quadrant/db-grid-comment-quadrant-quoted]
  [fixture: quadrant/db-grid-comment-title]
  [fixture: quadrant/db-grid-comment-x-axis-bare]
  [fixture: quadrant/db-grid-comment-x-axis-quoted]
  [fixture: quadrant/db-grid-comment-x-axis-right-bare]
  [fixture: quadrant/db-grid-comment-x-axis-right-quoted]
  [fixture: quadrant/db-grid-comment-y-axis-bare]
  [fixture: quadrant/db-grid-comment-y-axis-quoted]
  [fixture: quadrant/db-grid-comment-y-axis-top-bare]
  [fixture: quadrant/db-grid-comment-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-comment-class-name]
  [fixture: quadrant/gram-grid-comment-classdef-name]
  [fixture: quadrant/gram-grid-comment-glued-class-name]
  [fixture: quadrant/gram-grid-comment-glued-classdef-name]
  [fixture: quadrant/div-grid-comment-glued-quadrant-bare]
  [fixture: quadrant/div-grid-comment-glued-x-axis-bare]
  [fixture: quadrant/div-grid-comment-glued-y-axis-bare]
  [fixture: quadrant/gram-grid-comment-point-bare]
- 句読点とマークアップは、場所ごとの規則に従います。
  コロン、`;`、角括弧、タグ、矢印などの句読点は、タイトル、
  アクセシビリティのテキスト、
  引用符のテキストではテキストです（タグの引用符は `'` として読まれます）。
  軸や象限の引用符なしのテキストと点の名前は、コロン、`;`、角括弧、タグ、
  矢印を取りません（軸の矢印は文の矢印です）。
  クラスの名前は、`classDef` のコロン以外を取りません。
  引用符の中の `"` は文字列を終えるのでテキストは拒否されますが、
  タイトルとアクセシビリティのテキストではテキストです。
  1 つの `%`、バッククォート、ASCII の外の文字は、クラスの名前を除いて、
  テキストを取るどの場所でもテキストで、
  クラスの名前はバッククォートも `%` も取りません。
  空のテキストは、タイトルと説明のブロックでは空のテキストを設定し、
  テキストが必要なほかの場所では拒否され、軸の右のテキストでは捨てられます。
  [fixture: quadrant/db-grid-nonascii-acc-descr]
  [fixture: quadrant/db-grid-nonascii-acc-descr-block]
  [fixture: quadrant/db-grid-nonascii-acc-title]
  [fixture: quadrant/db-grid-nonascii-point-quoted]
  [fixture: quadrant/db-grid-nonascii-quadrant-bare]
  [fixture: quadrant/db-grid-nonascii-quadrant-quoted]
  [fixture: quadrant/db-grid-nonascii-x-axis-bare]
  [fixture: quadrant/db-grid-nonascii-x-axis-quoted]
  [fixture: quadrant/db-grid-nonascii-x-axis-right-bare]
  [fixture: quadrant/db-grid-nonascii-x-axis-right-quoted]
  [fixture: quadrant/db-grid-nonascii-y-axis-bare]
  [fixture: quadrant/db-grid-nonascii-y-axis-quoted]
  [fixture: quadrant/db-grid-nonascii-y-axis-top-bare]
  [fixture: quadrant/db-grid-nonascii-y-axis-top-quoted]
  [fixture: quadrant/db-grid-html-acc-descr]
  [fixture: quadrant/db-grid-html-acc-descr-block]
  [fixture: quadrant/db-grid-html-acc-title]
  [fixture: quadrant/db-grid-html-point-quoted]
  [fixture: quadrant/db-grid-html-quadrant-quoted]
  [fixture: quadrant/db-grid-html-title]
  [fixture: quadrant/db-grid-html-x-axis-quoted]
  [fixture: quadrant/db-grid-html-x-axis-right-quoted]
  [fixture: quadrant/db-grid-html-y-axis-quoted]
  [fixture: quadrant/db-grid-html-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-html-class-name]
  [fixture: quadrant/gram-grid-html-classdef-name]
  [fixture: quadrant/gram-grid-html-point-bare]
  [fixture: quadrant/gram-grid-html-quadrant-bare]
  [fixture: quadrant/gram-grid-html-x-axis-bare]
  [fixture: quadrant/gram-grid-html-x-axis-right-bare]
  [fixture: quadrant/gram-grid-html-y-axis-bare]
  [fixture: quadrant/gram-grid-html-y-axis-top-bare]
  [fixture: quadrant/db-grid-punct-acc-descr]
  [fixture: quadrant/db-grid-punct-acc-descr-block]
  [fixture: quadrant/db-grid-punct-acc-title]
  [fixture: quadrant/db-grid-punct-point-quoted]
  [fixture: quadrant/db-grid-punct-quadrant-quoted]
  [fixture: quadrant/db-grid-punct-title]
  [fixture: quadrant/db-grid-punct-x-axis-quoted]
  [fixture: quadrant/db-grid-punct-x-axis-right-quoted]
  [fixture: quadrant/db-grid-punct-y-axis-quoted]
  [fixture: quadrant/db-grid-punct-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-punct-class-name]
  [fixture: quadrant/gram-grid-punct-classdef-name]
  [fixture: quadrant/gram-grid-punct-point-bare]
  [fixture: quadrant/gram-grid-punct-quadrant-bare]
  [fixture: quadrant/gram-grid-punct-x-axis-bare]
  [fixture: quadrant/gram-grid-punct-x-axis-right-bare]
  [fixture: quadrant/gram-grid-punct-y-axis-bare]
  [fixture: quadrant/gram-grid-punct-y-axis-top-bare]
  [fixture: quadrant/db-grid-semicolon-acc-descr]
  [fixture: quadrant/db-grid-semicolon-acc-descr-block]
  [fixture: quadrant/db-grid-semicolon-acc-title]
  [fixture: quadrant/db-grid-semicolon-point-quoted]
  [fixture: quadrant/db-grid-semicolon-quadrant-quoted]
  [fixture: quadrant/db-grid-semicolon-title]
  [fixture: quadrant/db-grid-semicolon-x-axis-quoted]
  [fixture: quadrant/db-grid-semicolon-x-axis-right-quoted]
  [fixture: quadrant/db-grid-semicolon-y-axis-quoted]
  [fixture: quadrant/db-grid-semicolon-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-semicolon-class-name]
  [fixture: quadrant/gram-grid-semicolon-classdef-name]
  [fixture: quadrant/gram-grid-semicolon-point-bare]
  [fixture: quadrant/gram-grid-semicolon-quadrant-bare]
  [fixture: quadrant/gram-grid-semicolon-x-axis-bare]
  [fixture: quadrant/gram-grid-semicolon-x-axis-right-bare]
  [fixture: quadrant/gram-grid-semicolon-y-axis-bare]
  [fixture: quadrant/gram-grid-semicolon-y-axis-top-bare]
  [fixture: quadrant/db-grid-colon-acc-descr]
  [fixture: quadrant/db-grid-colon-acc-descr-block]
  [fixture: quadrant/db-grid-colon-acc-title]
  [fixture: quadrant/db-grid-colon-classdef-name]
  [fixture: quadrant/db-grid-colon-point-quoted]
  [fixture: quadrant/db-grid-colon-quadrant-quoted]
  [fixture: quadrant/db-grid-colon-title]
  [fixture: quadrant/db-grid-colon-x-axis-quoted]
  [fixture: quadrant/db-grid-colon-x-axis-right-quoted]
  [fixture: quadrant/db-grid-colon-y-axis-quoted]
  [fixture: quadrant/db-grid-colon-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-colon-class-name]
  [fixture: quadrant/gram-grid-colon-point-bare]
  [fixture: quadrant/gram-grid-colon-quadrant-bare]
  [fixture: quadrant/gram-grid-colon-x-axis-bare]
  [fixture: quadrant/gram-grid-colon-x-axis-right-bare]
  [fixture: quadrant/gram-grid-colon-y-axis-bare]
  [fixture: quadrant/gram-grid-colon-y-axis-top-bare]
  [fixture: quadrant/db-grid-arrow-acc-descr]
  [fixture: quadrant/db-grid-arrow-acc-descr-block]
  [fixture: quadrant/db-grid-arrow-acc-title]
  [fixture: quadrant/db-grid-arrow-point-quoted]
  [fixture: quadrant/db-grid-arrow-quadrant-quoted]
  [fixture: quadrant/db-grid-arrow-title]
  [fixture: quadrant/db-grid-arrow-x-axis-bare]
  [fixture: quadrant/db-grid-arrow-x-axis-quoted]
  [fixture: quadrant/db-grid-arrow-x-axis-right-quoted]
  [fixture: quadrant/db-grid-arrow-y-axis-bare]
  [fixture: quadrant/db-grid-arrow-y-axis-quoted]
  [fixture: quadrant/db-grid-arrow-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-arrow-class-name]
  [fixture: quadrant/gram-grid-arrow-classdef-name]
  [fixture: quadrant/gram-grid-arrow-point-bare]
  [fixture: quadrant/gram-grid-arrow-quadrant-bare]
  [fixture: quadrant/gram-grid-arrow-x-axis-right-bare]
  [fixture: quadrant/gram-grid-arrow-y-axis-top-bare]
  [fixture: quadrant/db-grid-quote-acc-descr]
  [fixture: quadrant/db-grid-quote-acc-descr-block]
  [fixture: quadrant/db-grid-quote-acc-title]
  [fixture: quadrant/db-grid-quote-title]
  [fixture: quadrant/gram-grid-quote-class-name]
  [fixture: quadrant/gram-grid-quote-classdef-name]
  [fixture: quadrant/gram-grid-quote-point-bare]
  [fixture: quadrant/gram-grid-quote-point-quoted]
  [fixture: quadrant/gram-grid-quote-quadrant-bare]
  [fixture: quadrant/gram-grid-quote-quadrant-quoted]
  [fixture: quadrant/gram-grid-quote-x-axis-bare]
  [fixture: quadrant/gram-grid-quote-x-axis-quoted]
  [fixture: quadrant/gram-grid-quote-x-axis-right-bare]
  [fixture: quadrant/gram-grid-quote-x-axis-right-quoted]
  [fixture: quadrant/gram-grid-quote-y-axis-bare]
  [fixture: quadrant/gram-grid-quote-y-axis-quoted]
  [fixture: quadrant/gram-grid-quote-y-axis-top-bare]
  [fixture: quadrant/gram-grid-quote-y-axis-top-quoted]
  [fixture: quadrant/db-grid-backtick-acc-descr]
  [fixture: quadrant/db-grid-backtick-acc-descr-block]
  [fixture: quadrant/db-grid-backtick-acc-title]
  [fixture: quadrant/db-grid-backtick-point-bare]
  [fixture: quadrant/db-grid-backtick-point-quoted]
  [fixture: quadrant/db-grid-backtick-quadrant-bare]
  [fixture: quadrant/db-grid-backtick-quadrant-quoted]
  [fixture: quadrant/db-grid-backtick-title]
  [fixture: quadrant/db-grid-backtick-x-axis-bare]
  [fixture: quadrant/db-grid-backtick-x-axis-quoted]
  [fixture: quadrant/db-grid-backtick-x-axis-right-bare]
  [fixture: quadrant/db-grid-backtick-x-axis-right-quoted]
  [fixture: quadrant/db-grid-backtick-y-axis-bare]
  [fixture: quadrant/db-grid-backtick-y-axis-quoted]
  [fixture: quadrant/db-grid-backtick-y-axis-top-bare]
  [fixture: quadrant/db-grid-backtick-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-backtick-class-name]
  [fixture: quadrant/gram-grid-backtick-classdef-name]
  [fixture: quadrant/db-grid-percent-acc-descr]
  [fixture: quadrant/db-grid-percent-acc-descr-block]
  [fixture: quadrant/db-grid-percent-acc-title]
  [fixture: quadrant/db-grid-percent-point-bare]
  [fixture: quadrant/db-grid-percent-point-quoted]
  [fixture: quadrant/db-grid-percent-quadrant-bare]
  [fixture: quadrant/db-grid-percent-quadrant-quoted]
  [fixture: quadrant/db-grid-percent-title]
  [fixture: quadrant/db-grid-percent-x-axis-bare]
  [fixture: quadrant/db-grid-percent-x-axis-quoted]
  [fixture: quadrant/db-grid-percent-x-axis-right-bare]
  [fixture: quadrant/db-grid-percent-x-axis-right-quoted]
  [fixture: quadrant/db-grid-percent-y-axis-bare]
  [fixture: quadrant/db-grid-percent-y-axis-quoted]
  [fixture: quadrant/db-grid-percent-y-axis-top-bare]
  [fixture: quadrant/db-grid-percent-y-axis-top-quoted]
  [fixture: quadrant/gram-grid-percent-class-name]
  [fixture: quadrant/gram-grid-percent-classdef-name]
  [fixture: quadrant/db-grid-empty-x-axis-right-bare]
  [fixture: quadrant/db-grid-empty-y-axis-top-bare]
  [fixture: quadrant/gram-grid-empty-acc-descr]
  [fixture: quadrant/gram-grid-empty-acc-title]
  [fixture: quadrant/gram-grid-empty-classdef-name]
  [fixture: quadrant/gram-grid-empty-point-bare]
  [fixture: quadrant/gram-grid-empty-quadrant-bare]
  [fixture: quadrant/gram-grid-empty-quadrant-quoted]
  [fixture: quadrant/gram-grid-empty-x-axis-bare]
  [fixture: quadrant/gram-grid-empty-y-axis-bare]
- フロントマターのタイトルは図のタイトルで、
  引用符の文字列や数はそのテキストになり、空のタイトルは空のテキストです。
  区切りの行はインデントでき、行は CRLF で終われます。
  設定だけでタイトルのないフロントマターは、タイトルを文に任せ、
  タイトルでない文は、フロントマターのタイトルを保ちます。
  タイトルの周りの空白は取り除かれ、中の空白は保たれ、
  YAML の折りたたみ文字列のタイトルは、末尾に改行のある 1 行です。
  フロントマターの後ろのヘッダーの前の U+FEFF は、何も変えません。
  YAML として正しくないフロントマターは拒否され、
  フロントマターの欄で始まって図の中で終わるタグは、
  1 つのタグとして引用符が置き換えられます。
  [fixture: quadrant/db-frontmatter-crlf]
  [fixture: quadrant/div-frontmatter-html-tag-starts-in-field]
  [fixture: quadrant/db-frontmatter-indented-delimiters]
  [fixture: quadrant/db-frontmatter-no-title]
  [fixture: quadrant/db-frontmatter-then-bom-header]
  [fixture: quadrant/db-frontmatter-title-empty]
  [fixture: quadrant/db-frontmatter-title-number]
  [fixture: quadrant/db-frontmatter-title-quoted]
  [fixture: quadrant/db-frontmatter-title-spaces]
  [fixture: quadrant/db-frontmatter-title-with-quadrant-statement]
  [fixture: quadrant/db-frontmatter-title-yaml-multiline]
  [fixture: quadrant/db-frontmatter-with-quadrant-config]
  [fixture: quadrant/db-frontmatter-with-theme]
  [fixture: quadrant/div-frontmatter-invalid-yaml]
- 図の設定（`quadrantChart`: 幅と高さ、余白とフォントの大きさ、軸の位置、
  点の半径）、テーマ、
  テーマの変数は、サイト、フロントマター、ディレクティブのどれが与えても、
  Db を変えません。
  点の半径はテキストが与えたもので、半径のない点は半径を持ちません。
  スキーマに載っていない設定 `showXAxis` と `showYAxis` は、
  レイアウトのラベルを隠します。
  要約は軸のテキストをラベルから読むので、サイトがそれを偽にし、
  テキストがその軸のテキストを設定すると、
  要約がテキストを失います。
  そのため `runMermaid()` は `MermaidEnvironmentError` で止まります
  （ディレクティブとフロントマターは、これらの設定を変えません）。
  [fixture: quadrant/config-settings-chart]
  [fixture: quadrant/config-settings-max-text-size]
  [fixture: quadrant/config-settings-point-radius]
- securityLevel が mermaid.js の値のどれでもない値（`other`）で、
  `htmlLabels` が未設定のとき、
  タイトル、アクセシビリティのタイトル、軸と象限のテキスト、
  点の名前の文字は置き換えられます。
  `htmlLabels` が false のとき、`loose` のとき、
  `sandbox` のときは書いたとおりで、
  既定の設定ではタグはそのまま保たれます。
  [fixture: quadrant/config-security-level-default-script]
  [fixture: quadrant/config-security-level-loose-all]
  [fixture: quadrant/config-security-level-other-all]
  [fixture: quadrant/config-security-level-other-flowchart-html-labels-false]
  [fixture: quadrant/config-security-level-other-html-labels-false]
  [fixture: quadrant/config-security-level-other-script]
  [fixture: quadrant/config-security-level-sandbox-all]
- `style` と `classDef` の行の規則には、ほかの図にあった形があります。
  別の大文字小文字のキーワード（`Style:#x;y`）、`:` と `#` の間の空白、
  `#` がない場合は `;` が残り、
  前に `#` があれば、その `;` は文字参照を終えます。
  `;` が 2 つあるときは最後が落とされ、最初が残ります。
  `classDef:` もこの規則のキーワードです。
  引用符のテキストの別の行の `;` は残り、キーワードのある、引用符の中の行は、
  独立した行です。
  文を終えるはずの `;` は落とされるので、
  `quadrant-1 "style:#a"; quadrant-2 B` と、`;` で区切った 2 つの軸の文は、
  つながって拒否されます。
  点を終える `;` は落とされますが、点は行末で終わり、
  タイトルの `;` も落とされて、タイトルは行の残りを持ちます。
  [fixture: quadrant/db-style-line-classdef-keyword-acc-title]
  [fixture: quadrant/db-style-line-classdef-keyword-quadrant-quoted]
  [fixture: quadrant/db-style-line-classdef-keyword-title]
  [fixture: quadrant/db-style-line-hash-on-another-line-quoted]
  [fixture: quadrant/db-style-line-ignored-in-point]
  [fixture: quadrant/db-style-line-ignored-in-value]
  [fixture: quadrant/db-style-line-keyword-on-another-line-quoted]
  [fixture: quadrant/db-style-line-no-hash-acc-title]
  [fixture: quadrant/db-style-line-no-hash-quadrant-quoted]
  [fixture: quadrant/db-style-line-no-hash-title]
  [fixture: quadrant/db-style-line-semicolon-on-another-line-quoted]
  [fixture: quadrant/db-style-line-semicolon-statement-separator-in-title]
  [fixture: quadrant/db-style-line-space-after-colon-acc-title]
  [fixture: quadrant/db-style-line-space-after-colon-quadrant-quoted]
  [fixture: quadrant/db-style-line-space-after-colon-title]
  [fixture: quadrant/db-style-line-two-semicolons-acc-title]
  [fixture: quadrant/db-style-line-two-semicolons-quadrant-quoted]
  [fixture: quadrant/db-style-line-two-semicolons-title]
  [fixture: quadrant/db-style-line-upper-case-acc-title]
  [fixture: quadrant/db-style-line-upper-case-quadrant-quoted]
  [fixture: quadrant/db-style-line-upper-case-title]
  [fixture: quadrant/gram-style-line-ignored-between-axis-statements]
  [fixture: quadrant/gram-style-line-ignored-between-statements]
- テキストが次の行にあるキーワードは拒否されます。
  `x-axis`、`y-axis`、`quadrant-1`、`classDef`、`title` で、間に空行、
  コメント行、ディレクティブの行があってもなくても同じです。
  テキストが独立した文になるからです。
  アクセシビリティのキーワードは、次の行をテキストとします。
  間のコメント行とディレクティブの行は取り除かれ、行の内容は何でもよく、点、
  象限の文、`classDef` の行、
  `title` の行でもよく、`title` の行はタイトルを設定しません。
  [fixture: quadrant/gram-keyword-line-feed-classdef]
  [fixture: quadrant/gram-keyword-line-feed-quadrant]
  [fixture: quadrant/gram-keyword-line-feed-title]
  [fixture: quadrant/gram-keyword-line-feed-x-axis]
  [fixture: quadrant/gram-keyword-line-feed-y-axis]
  [fixture: quadrant/gram-keyword-comment-line-classdef]
  [fixture: quadrant/gram-keyword-comment-line-quadrant]
  [fixture: quadrant/gram-keyword-comment-line-title]
  [fixture: quadrant/gram-keyword-comment-line-x-axis]
  [fixture: quadrant/gram-keyword-comment-line-y-axis]
  [fixture: quadrant/gram-keyword-directive-line-classdef]
  [fixture: quadrant/gram-keyword-directive-line-quadrant]
  [fixture: quadrant/gram-keyword-directive-line-x-axis]
  [fixture: quadrant/gram-keyword-directive-line-y-axis]
  [fixture: quadrant/gram-keyword-blank-line-classdef]
  [fixture: quadrant/gram-keyword-blank-line-quadrant]
  [fixture: quadrant/gram-keyword-blank-line-x-axis]
  [fixture: quadrant/gram-keyword-blank-line-y-axis]
  [fixture: quadrant/db-acc-title-comment-line-before-text]
  [fixture: quadrant/db-acc-title-directive-line-before-text]
  [fixture: quadrant/db-acc-title-statement-as-text]
  [fixture: quadrant/db-acc-title-quadrant-as-text]
  [fixture: quadrant/db-acc-descr-comment-line-before-text]
  [fixture: quadrant/db-acc-descr-classdef-as-text]
  [fixture: quadrant/db-acc-descr-title-text-keeps-title]
- キーワードに続けて書いたものがどうなるかは次のとおりです。
  `title` の後ろの ASCII の外の文字とダッシュは、
  タイトルの始まりで（`titleé` はタイトル `é`）、
  数字とアンダースコアは語になって行が拒否されます。
  `accTitle` と `accDescr` はコロンが隣に、`classDef` は空白が必要なので、
  どの接尾辞も拒否されます。
  `x-axis`、`y-axis`、`quadrant-1` の後ろにはテキストが続き、ASCII の外の文字、
  数字、アンダースコアで始められますが、ダッシュでは始められません。
  ヘッダーの後ろのアンダースコアと U+FEFF は、文が始まらない場所のテキストです。
  [fixture: quadrant/db-keyword-suffix-quadrant-digit]
  [fixture: quadrant/db-keyword-suffix-quadrant-non-ascii]
  [fixture: quadrant/db-keyword-suffix-quadrant-underscore]
  [fixture: quadrant/db-keyword-suffix-title-dash]
  [fixture: quadrant/db-keyword-suffix-title-non-ascii]
  [fixture: quadrant/db-keyword-suffix-x-axis-digit]
  [fixture: quadrant/db-keyword-suffix-x-axis-non-ascii]
  [fixture: quadrant/db-keyword-suffix-x-axis-underscore]
  [fixture: quadrant/db-keyword-suffix-y-axis-digit]
  [fixture: quadrant/db-keyword-suffix-y-axis-non-ascii]
  [fixture: quadrant/db-keyword-suffix-y-axis-underscore]
  [fixture: quadrant/gram-keyword-suffix-acc-descr-dash]
  [fixture: quadrant/gram-keyword-suffix-acc-descr-digit]
  [fixture: quadrant/gram-keyword-suffix-acc-descr-non-ascii]
  [fixture: quadrant/gram-keyword-suffix-acc-descr-underscore]
  [fixture: quadrant/gram-keyword-suffix-acc-title-dash]
  [fixture: quadrant/gram-keyword-suffix-acc-title-digit]
  [fixture: quadrant/gram-keyword-suffix-acc-title-non-ascii]
  [fixture: quadrant/gram-keyword-suffix-acc-title-underscore]
  [fixture: quadrant/gram-keyword-suffix-classdef-dash]
  [fixture: quadrant/gram-keyword-suffix-classdef-digit]
  [fixture: quadrant/gram-keyword-suffix-classdef-non-ascii]
  [fixture: quadrant/gram-keyword-suffix-classdef-underscore]
  [fixture: quadrant/gram-keyword-suffix-quadrant-dash]
  [fixture: quadrant/gram-keyword-suffix-title-digit]
  [fixture: quadrant/gram-keyword-suffix-title-underscore]
  [fixture: quadrant/gram-keyword-suffix-x-axis-dash]
  [fixture: quadrant/gram-keyword-suffix-y-axis-dash]
  [fixture: quadrant/header-underscore-suffix]
  [fixture: quadrant/header-bom-after]
  [fixture: quadrant/header-bom-after-statement]
- キーワード `title`、`x-axis`、`classDef` の前には境界が要りません。
  引用符のない、またはテキストの中や名前の中の `.`、ダッシュ、アンダースコア、
  数字の後ろにあれば、キーワードであり、行は拒否されます。
  タイトルの中の `title` はテキストです。
  引用符なしのテキストの中の語 `quadrantChart` はヘッダーで、
  行は拒否されますが、タイトルの中ではテキストです。
  [fixture: quadrant/db-keyword-after-dot-in-title]
  [fixture: quadrant/gram-keyword-after-dash-in-name]
  [fixture: quadrant/gram-keyword-after-dash-in-quadrant-text]
  [fixture: quadrant/gram-keyword-after-digit-in-name]
  [fixture: quadrant/gram-keyword-after-digit-in-quadrant-text]
  [fixture: quadrant/gram-keyword-after-dot-in-name]
  [fixture: quadrant/gram-keyword-after-dot-in-quadrant-text]
  [fixture: quadrant/gram-keyword-after-underscore-in-name]
  [fixture: quadrant/gram-keyword-after-underscore-in-quadrant-text]
  [fixture: quadrant/gram-keyword-axis-after-dot-in-quadrant-text]
  [fixture: quadrant/gram-keyword-classdef-after-dot-in-name]
  [fixture: quadrant/db-keyword-header-in-word]
  [fixture: quadrant/gram-keyword-header-in-quadrant-text]
- `Object.prototype` の名前は、
  点の名前としてもクラスの名前としても普通の名前で、
  `constructor` という名前のクラスも、ほかのクラスと同じように定義して使え、
  2 つ目の定義は 1 つ目を置き換えます。
  [fixture: quadrant/db-name-prototype-definegetter]
  [fixture: quadrant/db-name-prototype-isprototypeof]
  [fixture: quadrant/db-name-prototype-lookupgetter]
  [fixture: quadrant/db-name-prototype-propertyisenumerable]
  [fixture: quadrant/db-name-prototype-tolocalestring]
  [fixture: quadrant/db-name-prototype-valueof]
  [fixture: quadrant/db-class-prototype-value-of]
  [fixture: quadrant/db-classdef-prototype-to-string-redefined]
  [fixture: quadrant/db-classdef-prototype-twice]
  [fixture: quadrant/db-classdef-prototype-used]
- 同じ名前の定義が複数あるときは、
  3 つのタイトルや象限の 3 つのテキストが、最後の値になります。
  交互に設定した 2 つの象限は、それぞれの最後のテキストを保ちます。
  軸では、3 つ目の文が名指したものを設定するので、
  矢印付きの左のテキストは矢印のないテキストに置き換わり、
  最初の文の右のテキストは残ります。
  テキストが 2 つある 3 つ目の文は両方を設定します。
  クラスの 3 つ目の定義は 2 つ目を置き換え、間に別のクラスがあっても、
  各クラスは最後のスタイルを保ち、最初の定義の順は変わりません。
  [fixture: quadrant/db-title-three-times]
  [fixture: quadrant/db-quadrant-three-times]
  [fixture: quadrant/db-quadrant-three-times-with-partner]
  [fixture: quadrant/db-x-axis-three-times-arrow-forms]
  [fixture: quadrant/db-x-axis-three-times-then-both]
  [fixture: quadrant/db-y-axis-three-times-arrow-forms]
  [fixture: quadrant/db-classdef-three-times]
  [fixture: quadrant/db-classdef-three-times-partner]
- 空のブロック（`{}`、中に改行、空白、空行、
  タブがあるもの）は何も設定しないので、
  その前の行やブロックが設定した説明は残ります。
  空のブロックが 2 つ続いても同じで、アクセシビリティのタイトルには触れません。
  テキストの終わりのテキストのない `accDescr:` は、
  前にテキストがあっても拒否されます。
  [fixture: quadrant/db-acc-descr-empty-block-keeps-block]
  [fixture: quadrant/db-acc-descr-empty-block-keeps-line-blank-line]
  [fixture: quadrant/db-acc-descr-empty-block-keeps-line-braces]
  [fixture: quadrant/db-acc-descr-empty-block-keeps-line-line-feed]
  [fixture: quadrant/db-acc-descr-empty-block-keeps-line-space]
  [fixture: quadrant/db-acc-descr-empty-block-keeps-line-tab]
  [fixture: quadrant/db-acc-descr-empty-block-twice-keeps]
  [fixture: quadrant/db-acc-title-then-empty-block]
  [fixture: quadrant/gram-acc-descr-empty-line-after-text]
- 文の中の空のブロックは読み飛ばされます。
  軸や象限のテキストの中、名前の中、点の後ろ、`classDef` の行の中、文の頭、
  ヘッダーの行で、
  ヘッダーの行でテキストのあるブロックは説明を設定します。
  ブロックの周りの空白はテキストに残ります。
  軸のキーワードの直後では、テキストの前に空白が残って行が拒否され、
  文の中のテキストのあるブロックは独立した文で、その前の行を終えるので、
  行は拒否されます。
  [fixture: quadrant/db-empty-block-after-point]
  [fixture: quadrant/db-empty-block-before-statement]
  [fixture: quadrant/div-empty-block-in-classdef]
  [fixture: quadrant/div-empty-block-in-name]
  [fixture: quadrant/div-empty-block-in-quadrant-text]
  [fixture: quadrant/div-empty-block-in-x-axis-text]
  [fixture: quadrant/db-empty-block-on-header-line]
  [fixture: quadrant/gram-empty-block-before-x-axis-text]
  [fixture: quadrant/gram-block-with-text-in-quadrant-text]
  [fixture: quadrant/db-block-on-header-line]
- 空の文字列は、どこにあっても捨てられます。
  文の頭、独立した行、テキスト・語・名前の前後、点やクラスのスタイルの間です。
  周りの空白は残り、語はつながります。
  空の文字列だけの文はテキストがなくて拒否され、
  点のコロンと角括弧の間や、角括弧の中の空の文字列も拒否されます。
  タイトルの中ではテキストです。
  [fixture: quadrant/div-empty-string-after-name]
  [fixture: quadrant/div-empty-string-before-name]
  [fixture: quadrant/div-empty-string-before-quadrant-text]
  [fixture: quadrant/div-empty-string-before-statement]
  [fixture: quadrant/div-empty-string-between-words]
  [fixture: quadrant/div-empty-string-in-classdef]
  [fixture: quadrant/div-empty-string-in-point-styles]
  [fixture: quadrant/div-empty-string-in-quadrant-text]
  [fixture: quadrant/db-empty-string-in-title]
  [fixture: quadrant/div-empty-string-inside-word]
  [fixture: quadrant/div-empty-string-line]
  [fixture: quadrant/db-empty-string-title-before-statement-line]
  [fixture: quadrant/gram-empty-string-after-colon]
  [fixture: quadrant/gram-empty-string-in-brackets]
  [fixture: quadrant/gram-empty-string-twice-quadrant]
- 語 `C4Container`、`C4Component`、`C4Dynamic`、
  `C4Deployment` がテキストのどこかにあると、
  mermaid.js は C4 図を検出し、その図がテキストを拒否します。
  タイトル、アクセシビリティのテキスト、象限のテキスト、引用符の名前、
  クラス名で起きます。
  `C4Context` はテキストの先頭でだけ検出されるので、
  名前が `C4Context` であっても名前です。
  [fixture: quadrant/db-c4-context-in-name]
  [fixture: quadrant/div-c4-keyword-in-acc-title]
  [fixture: quadrant/div-c4-keyword-in-class-name]
  [fixture: quadrant/div-c4-keyword-in-quadrant-text]
  [fixture: quadrant/div-c4-keyword-in-quoted-name]
  [fixture: quadrant/div-c4-keyword-in-title]
- 文の後ろには、CRLF、CR だけ、または改行のないテキストの終わりが来られます。
  行末やテキストの終わりのタブ、U+FEFF、ノーブレークスペース、全角スペース、
  U+2028、U+2029は、
  タイトル、アクセシビリティのテキスト、軸、象限の後ろでは読み飛ばされます。
  点の後ろでは名前のないスタイルとして読まれて拒否されますが、
  点のスタイルの後ろのタブは読み飛ばされ、
  `classDef` の行の後ろでも読み飛ばされるのはタブだけです。
  文の前のタブは読み飛ばされ、
  キーワードで始まる文の前の U+FEFF は拒否されますが、
  U+FEFF で始まる点は、それを名前に含め、切り詰められます。
  [fixture: quadrant/db-ends-acc-descr-bom-end]
  [fixture: quadrant/db-ends-acc-descr-bom-end-of-text]
  [fixture: quadrant/db-ends-acc-descr-cr-end-of-text]
  [fixture: quadrant/db-ends-acc-descr-crlf-end-of-text]
  [fixture: quadrant/db-ends-acc-descr-ideographic-end]
  [fixture: quadrant/db-ends-acc-descr-ideographic-end-of-text]
  [fixture: quadrant/db-ends-acc-descr-ls-end-of-text]
  [fixture: quadrant/db-ends-acc-descr-nbsp-end]
  [fixture: quadrant/db-ends-acc-descr-nbsp-end-of-text]
  [fixture: quadrant/db-ends-acc-descr-no-line-feed]
  [fixture: quadrant/db-ends-acc-descr-ps-end-of-text]
  [fixture: quadrant/db-ends-acc-descr-tab-end]
  [fixture: quadrant/db-ends-acc-descr-tab-end-of-text]
  [fixture: quadrant/db-ends-acc-descr-tab-start]
  [fixture: quadrant/db-ends-acc-title-bom-end]
  [fixture: quadrant/db-ends-acc-title-bom-end-of-text]
  [fixture: quadrant/db-ends-acc-title-cr-end-of-text]
  [fixture: quadrant/db-ends-acc-title-crlf-end-of-text]
  [fixture: quadrant/db-ends-acc-title-ideographic-end]
  [fixture: quadrant/db-ends-acc-title-ideographic-end-of-text]
  [fixture: quadrant/db-ends-acc-title-ls-end-of-text]
  [fixture: quadrant/db-ends-acc-title-nbsp-end]
  [fixture: quadrant/db-ends-acc-title-nbsp-end-of-text]
  [fixture: quadrant/db-ends-acc-title-no-line-feed]
  [fixture: quadrant/db-ends-acc-title-ps-end-of-text]
  [fixture: quadrant/db-ends-acc-title-tab-end]
  [fixture: quadrant/db-ends-acc-title-tab-end-of-text]
  [fixture: quadrant/db-ends-acc-title-tab-start]
  [fixture: quadrant/db-ends-classdef-cr-end-of-text]
  [fixture: quadrant/db-ends-classdef-crlf-end-of-text]
  [fixture: quadrant/db-ends-classdef-no-line-feed]
  [fixture: quadrant/db-ends-classdef-tab-end]
  [fixture: quadrant/db-ends-classdef-tab-end-of-text]
  [fixture: quadrant/db-ends-classdef-tab-start]
  [fixture: quadrant/db-ends-point-bom-start]
  [fixture: quadrant/db-ends-point-class-bom-start]
  [fixture: quadrant/db-ends-point-class-cr-end-of-text]
  [fixture: quadrant/db-ends-point-class-crlf-end-of-text]
  [fixture: quadrant/db-ends-point-class-no-line-feed]
  [fixture: quadrant/db-ends-point-class-tab-start]
  [fixture: quadrant/db-ends-point-cr-end-of-text]
  [fixture: quadrant/db-ends-point-crlf-end-of-text]
  [fixture: quadrant/db-ends-point-no-line-feed]
  [fixture: quadrant/db-ends-point-style-bom-start]
  [fixture: quadrant/db-ends-point-style-cr-end-of-text]
  [fixture: quadrant/db-ends-point-style-crlf-end-of-text]
  [fixture: quadrant/db-ends-point-style-no-line-feed]
  [fixture: quadrant/db-ends-point-style-tab-end]
  [fixture: quadrant/db-ends-point-style-tab-end-of-text]
  [fixture: quadrant/db-ends-point-style-tab-start]
  [fixture: quadrant/db-ends-point-tab-start]
  [fixture: quadrant/db-ends-quadrant-bom-end]
  [fixture: quadrant/db-ends-quadrant-bom-end-of-text]
  [fixture: quadrant/db-ends-quadrant-cr-end-of-text]
  [fixture: quadrant/db-ends-quadrant-crlf-end-of-text]
  [fixture: quadrant/db-ends-quadrant-ideographic-end]
  [fixture: quadrant/db-ends-quadrant-ideographic-end-of-text]
  [fixture: quadrant/db-ends-quadrant-ls-end-of-text]
  [fixture: quadrant/db-ends-quadrant-nbsp-end]
  [fixture: quadrant/db-ends-quadrant-nbsp-end-of-text]
  [fixture: quadrant/db-ends-quadrant-no-line-feed]
  [fixture: quadrant/db-ends-quadrant-ps-end-of-text]
  [fixture: quadrant/db-ends-quadrant-tab-end]
  [fixture: quadrant/db-ends-quadrant-tab-end-of-text]
  [fixture: quadrant/db-ends-quadrant-tab-start]
  [fixture: quadrant/db-ends-title-bom-end]
  [fixture: quadrant/db-ends-title-bom-end-of-text]
  [fixture: quadrant/db-ends-title-cr-end-of-text]
  [fixture: quadrant/db-ends-title-crlf-end-of-text]
  [fixture: quadrant/db-ends-title-ideographic-end]
  [fixture: quadrant/db-ends-title-ideographic-end-of-text]
  [fixture: quadrant/db-ends-title-ls-end-of-text]
  [fixture: quadrant/db-ends-title-nbsp-end]
  [fixture: quadrant/db-ends-title-nbsp-end-of-text]
  [fixture: quadrant/db-ends-title-no-line-feed]
  [fixture: quadrant/db-ends-title-ps-end-of-text]
  [fixture: quadrant/db-ends-title-tab-end-of-text]
  [fixture: quadrant/db-ends-x-axis-bom-end]
  [fixture: quadrant/db-ends-x-axis-bom-end-of-text]
  [fixture: quadrant/db-ends-x-axis-cr-end-of-text]
  [fixture: quadrant/db-ends-x-axis-crlf-end-of-text]
  [fixture: quadrant/db-ends-x-axis-ideographic-end]
  [fixture: quadrant/db-ends-x-axis-ideographic-end-of-text]
  [fixture: quadrant/db-ends-x-axis-ls-end-of-text]
  [fixture: quadrant/db-ends-x-axis-nbsp-end]
  [fixture: quadrant/db-ends-x-axis-nbsp-end-of-text]
  [fixture: quadrant/db-ends-x-axis-no-line-feed]
  [fixture: quadrant/db-ends-x-axis-ps-end-of-text]
  [fixture: quadrant/db-ends-x-axis-tab-end]
  [fixture: quadrant/db-ends-x-axis-tab-end-of-text]
  [fixture: quadrant/db-ends-x-axis-tab-start]
  [fixture: quadrant/db-ends-y-axis-bom-end]
  [fixture: quadrant/db-ends-y-axis-bom-end-of-text]
  [fixture: quadrant/db-ends-y-axis-cr-end-of-text]
  [fixture: quadrant/db-ends-y-axis-crlf-end-of-text]
  [fixture: quadrant/db-ends-y-axis-ideographic-end]
  [fixture: quadrant/db-ends-y-axis-ideographic-end-of-text]
  [fixture: quadrant/db-ends-y-axis-ls-end-of-text]
  [fixture: quadrant/db-ends-y-axis-nbsp-end]
  [fixture: quadrant/db-ends-y-axis-nbsp-end-of-text]
  [fixture: quadrant/db-ends-y-axis-no-line-feed]
  [fixture: quadrant/db-ends-y-axis-ps-end-of-text]
  [fixture: quadrant/db-ends-y-axis-tab-end]
  [fixture: quadrant/db-ends-y-axis-tab-end-of-text]
  [fixture: quadrant/db-ends-y-axis-tab-start]
  [fixture: quadrant/gram-ends-acc-descr-bom-start]
  [fixture: quadrant/gram-ends-acc-title-bom-start]
  [fixture: quadrant/gram-ends-classdef-bom-end]
  [fixture: quadrant/gram-ends-classdef-bom-end-of-text]
  [fixture: quadrant/gram-ends-classdef-bom-start]
  [fixture: quadrant/gram-ends-classdef-ideographic-end]
  [fixture: quadrant/gram-ends-classdef-ideographic-end-of-text]
  [fixture: quadrant/gram-ends-classdef-ls-end-of-text]
  [fixture: quadrant/gram-ends-classdef-nbsp-end]
  [fixture: quadrant/gram-ends-classdef-nbsp-end-of-text]
  [fixture: quadrant/gram-ends-classdef-ps-end-of-text]
  [fixture: quadrant/gram-ends-point-bom-end]
  [fixture: quadrant/gram-ends-point-bom-end-of-text]
  [fixture: quadrant/gram-ends-point-class-bom-end]
  [fixture: quadrant/gram-ends-point-class-bom-end-of-text]
  [fixture: quadrant/gram-ends-point-class-ideographic-end]
  [fixture: quadrant/gram-ends-point-class-ideographic-end-of-text]
  [fixture: quadrant/gram-ends-point-class-ls-end-of-text]
  [fixture: quadrant/gram-ends-point-class-nbsp-end]
  [fixture: quadrant/gram-ends-point-class-nbsp-end-of-text]
  [fixture: quadrant/gram-ends-point-class-ps-end-of-text]
  [fixture: quadrant/gram-ends-point-class-tab-end]
  [fixture: quadrant/gram-ends-point-class-tab-end-of-text]
  [fixture: quadrant/gram-ends-point-ideographic-end]
  [fixture: quadrant/gram-ends-point-ideographic-end-of-text]
  [fixture: quadrant/gram-ends-point-ls-end-of-text]
  [fixture: quadrant/gram-ends-point-nbsp-end]
  [fixture: quadrant/gram-ends-point-nbsp-end-of-text]
  [fixture: quadrant/gram-ends-point-ps-end-of-text]
  [fixture: quadrant/gram-ends-point-style-bom-end]
  [fixture: quadrant/gram-ends-point-style-bom-end-of-text]
  [fixture: quadrant/gram-ends-point-style-ideographic-end]
  [fixture: quadrant/gram-ends-point-style-ideographic-end-of-text]
  [fixture: quadrant/gram-ends-point-style-ls-end-of-text]
  [fixture: quadrant/gram-ends-point-style-nbsp-end]
  [fixture: quadrant/gram-ends-point-style-nbsp-end-of-text]
  [fixture: quadrant/gram-ends-point-style-ps-end-of-text]
  [fixture: quadrant/gram-ends-point-tab-end-of-text]
  [fixture: quadrant/gram-ends-quadrant-bom-start]
  [fixture: quadrant/gram-ends-title-bom-start]
  [fixture: quadrant/gram-ends-x-axis-bom-start]
  [fixture: quadrant/gram-ends-y-axis-bom-start]
- 空白だけの行は、空白とタブだけなら、最初の文の前、文の間、
  テキストの終わりに置けます。
  ノーブレークスペース、全角スペース、U+FEFF、U+2028 の行は、
  文が始まらない場所のテキストなので、拒否されます。
  [fixture: quadrant/db-whitespace-line-between-spaces-and-tab]
  [fixture: quadrant/db-whitespace-line-between-tab]
  [fixture: quadrant/db-whitespace-line-first-spaces-and-tab]
  [fixture: quadrant/db-whitespace-line-first-tab]
  [fixture: quadrant/db-whitespace-line-last-spaces-and-tab]
  [fixture: quadrant/db-whitespace-line-last-tab]
  [fixture: quadrant/gram-whitespace-line-between-bom]
  [fixture: quadrant/gram-whitespace-line-between-ideographic]
  [fixture: quadrant/gram-whitespace-line-between-ls]
  [fixture: quadrant/gram-whitespace-line-between-nbsp]
  [fixture: quadrant/gram-whitespace-line-first-bom]
  [fixture: quadrant/gram-whitespace-line-first-ideographic]
  [fixture: quadrant/gram-whitespace-line-first-ls]
  [fixture: quadrant/gram-whitespace-line-first-nbsp]
  [fixture: quadrant/gram-whitespace-line-last-bom]
  [fixture: quadrant/gram-whitespace-line-last-ideographic]
  [fixture: quadrant/gram-whitespace-line-last-ls]
  [fixture: quadrant/gram-whitespace-line-last-nbsp]
- 文の後ろのコメント、`;`、ディレクティブには、
  ほかの図にあった形がまだあります。
  空白と `;`、2 つの `;`、空白を挟んだ 2 つの `;`、2 つのディレクティブは、
  1 つの場合と同じようにどの文も終えます。
  ただし `classDef` の行の後ろの `;;` は拒否されます。
  閉じていないディレクティブはテキストの残りを取るので、
  その後ろの行は読まれません。
  `%%{init` だけのディレクティブは次の行の頭の語を取り、
  その行の残りがテキストにつながり（`R U`、`T -1 U`）、
  スタイルにつながる場合は拒否されます。
  [fixture: quadrant/db-after-acc-descr-space-semicolon]
  [fixture: quadrant/db-after-acc-title-space-semicolon]
  [fixture: quadrant/db-after-classdef-space-semicolon]
  [fixture: quadrant/db-after-point-class-space-semicolon]
  [fixture: quadrant/db-after-point-space-semicolon]
  [fixture: quadrant/db-after-point-style-space-semicolon]
  [fixture: quadrant/db-after-quadrant-space-semicolon]
  [fixture: quadrant/db-after-title-space-semicolon]
  [fixture: quadrant/db-after-x-axis-space-semicolon]
  [fixture: quadrant/db-after-y-axis-space-semicolon]
  [fixture: quadrant/db-after-acc-descr-double-semicolon]
  [fixture: quadrant/db-after-acc-title-double-semicolon]
  [fixture: quadrant/db-after-point-class-double-semicolon]
  [fixture: quadrant/db-after-point-double-semicolon]
  [fixture: quadrant/db-after-point-style-double-semicolon]
  [fixture: quadrant/db-after-quadrant-double-semicolon]
  [fixture: quadrant/db-after-title-double-semicolon]
  [fixture: quadrant/db-after-x-axis-double-semicolon]
  [fixture: quadrant/db-after-y-axis-double-semicolon]
  [fixture: quadrant/gram-after-classdef-double-semicolon]
  [fixture: quadrant/db-after-acc-descr-spaced-semicolons]
  [fixture: quadrant/db-after-acc-title-spaced-semicolons]
  [fixture: quadrant/db-after-classdef-spaced-semicolons]
  [fixture: quadrant/db-after-point-class-spaced-semicolons]
  [fixture: quadrant/db-after-point-spaced-semicolons]
  [fixture: quadrant/db-after-point-style-spaced-semicolons]
  [fixture: quadrant/db-after-quadrant-spaced-semicolons]
  [fixture: quadrant/db-after-title-spaced-semicolons]
  [fixture: quadrant/db-after-x-axis-spaced-semicolons]
  [fixture: quadrant/db-after-y-axis-spaced-semicolons]
  [fixture: quadrant/db-after-acc-descr-directive-unclosed]
  [fixture: quadrant/db-after-acc-title-directive-unclosed]
  [fixture: quadrant/db-after-classdef-directive-unclosed]
  [fixture: quadrant/db-after-point-class-directive-unclosed]
  [fixture: quadrant/db-after-point-directive-unclosed]
  [fixture: quadrant/db-after-point-style-directive-unclosed]
  [fixture: quadrant/db-after-quadrant-directive-unclosed]
  [fixture: quadrant/db-after-title-directive-unclosed]
  [fixture: quadrant/db-after-x-axis-directive-unclosed]
  [fixture: quadrant/db-after-y-axis-directive-unclosed]
  [fixture: quadrant/db-after-acc-descr-directive-closed-twice]
  [fixture: quadrant/db-after-acc-title-directive-closed-twice]
  [fixture: quadrant/db-after-classdef-directive-closed-twice]
  [fixture: quadrant/db-after-point-class-directive-closed-twice]
  [fixture: quadrant/db-after-point-directive-closed-twice]
  [fixture: quadrant/db-after-point-style-directive-closed-twice]
  [fixture: quadrant/db-after-quadrant-directive-closed-twice]
  [fixture: quadrant/db-after-title-directive-closed-twice]
  [fixture: quadrant/db-after-x-axis-directive-closed-twice]
  [fixture: quadrant/db-after-y-axis-directive-closed-twice]
  [fixture: quadrant/db-after-acc-descr-directive-word-unclosed]
  [fixture: quadrant/db-after-acc-title-directive-word-unclosed]
  [fixture: quadrant/db-after-quadrant-directive-word-unclosed]
  [fixture: quadrant/db-after-title-directive-word-unclosed]
  [fixture: quadrant/db-after-x-axis-directive-word-unclosed]
  [fixture: quadrant/db-after-y-axis-directive-word-unclosed]
  [fixture: quadrant/gram-after-classdef-directive-word-unclosed]
  [fixture: quadrant/gram-after-point-class-directive-word-unclosed]
  [fixture: quadrant/gram-after-point-directive-word-unclosed]
  [fixture: quadrant/gram-after-point-style-directive-word-unclosed]
- 途中で切れたディレクティブは、自分のテキストより多くを取ります。
  行頭の `%%{init` は次の行の頭の語（キーワード）を取り、
  その行の残りは拒否されます。
  `%%{init:` も同じですが、`%%{init: x` は `x` を取って次の行を残し、
  閉じた `%%{ init }%%` は取り除かれます。
  ディレクティブは、タイトル、軸や象限のテキスト、名前、クラスのスタイルの頭と、
  キーワードとテキストの間で取り除かれます。
  [fixture: quadrant/gram-directive-word-unclosed-takes-keyword]
  [fixture: quadrant/gram-directive-colon-unclosed-takes-keyword]
  [fixture: quadrant/db-directive-argument-word-unclosed]
  [fixture: quadrant/db-directive-name-only-closed]
  [fixture: quadrant/db-directive-at-start-of-axis-text]
  [fixture: quadrant/db-directive-at-start-of-classdef-styles]
  [fixture: quadrant/db-directive-at-start-of-name]
  [fixture: quadrant/db-directive-at-start-of-quadrant-text]
  [fixture: quadrant/db-directive-at-start-of-title]
  [fixture: quadrant/db-directive-glued-before-axis-text]
  [fixture: quadrant/db-directive-glued-before-quadrant-text]
  [fixture: quadrant/db-directive-glued-before-title-text]
  [fixture: quadrant/db-directive-glued-after-classdef]
- 何行にもまたがる値の中のコメント行とディレクティブの行は、
  独立した行として取り除かれます。
  説明のブロック、引用符のテキスト、マークダウン文字列、引用符の点の名前、
  点の角括弧の中で、
  それらの前後の行は改行でつながり、ディレクティブの行は空行を残します。
  引用符の中の、空白の後ろの `%%` はテキストの一部です。
  [fixture: quadrant/db-comment-line-inside-acc-block]
  [fixture: quadrant/db-comment-line-inside-brackets]
  [fixture: quadrant/db-comment-line-inside-markdown]
  [fixture: quadrant/db-comment-line-inside-quoted-axis]
  [fixture: quadrant/db-comment-line-inside-quoted-name]
  [fixture: quadrant/db-comment-line-inside-quoted-text]
  [fixture: quadrant/db-directive-line-inside-brackets]
  [fixture: quadrant/db-directive-inside-quoted-multiline]
  [fixture: quadrant/db-directive-inside-acc-block-line]
  [fixture: quadrant/db-comment-inline-in-quoted-block]
- Db がテキストから読む数は、radius の数字だけです。
  `-0`、`NaN`、`Infinity`、`1e3`、`0x10`、数に続くテキスト、プラス記号、
  アンダースコア、ASCII の外の数字、全角数字は拒否されます。
  安全な整数を超える radius は double が持つ数になり、
  double が持てる 309 桁は数で、310 桁は無限で、
  要約ではテキスト `Infinity` です。
  負の stroke-width や、単位の後ろにテキストのあるものは拒否され、
  `0px` は書いたとおりに保たれます。
  [fixture: quadrant/db-radius-above-safe-integer]
  [fixture: quadrant/db-radius-first-infinite]
  [fixture: quadrant/db-radius-largest-finite]
  [fixture: quadrant/gram-radius-arabic-digit]
  [fixture: quadrant/gram-radius-exponent]
  [fixture: quadrant/gram-radius-fullwidth-digits]
  [fixture: quadrant/gram-radius-hexadecimal]
  [fixture: quadrant/gram-radius-infinity]
  [fixture: quadrant/gram-radius-nan]
  [fixture: quadrant/gram-radius-negative-zero]
  [fixture: quadrant/gram-radius-plus]
  [fixture: quadrant/gram-radius-space-text-after-number]
  [fixture: quadrant/gram-radius-text-after-number]
  [fixture: quadrant/gram-radius-underscore]
  [fixture: quadrant/gram-stroke-width-negative]
  [fixture: quadrant/gram-stroke-width-text-after-unit]
  [fixture: quadrant/db-stroke-width-zero]
- 閉じていない文脈の中で終わるテキストは、
  その文脈がもっと必要とする場合に拒否されます。
  閉じ引用符のない名前やテキスト、閉じていないマークダウン文字列、
  コンマや角括弧で切れた点、
  点のないクラスの印やクラス名、末尾の `accTitle:` と `accDescr:`、
  閉じ波括弧のないブロック、
  コロンで切れた `classDef` です。
  末尾の矢印は右のテキストのない矢印、末尾の `title` は空のタイトルで、
  末尾で切れたディレクティブは何も取りません。
  [fixture: quadrant/db-unclosed-axis-arrow-at-end]
  [fixture: quadrant/db-unclosed-directive-at-end]
  [fixture: quadrant/db-unclosed-title-keyword-at-end]
  [fixture: quadrant/gram-unclosed-acc-block-after-text]
  [fixture: quadrant/gram-unclosed-acc-descr-at-end]
  [fixture: quadrant/gram-unclosed-acc-title-at-end]
  [fixture: quadrant/gram-unclosed-axis-quote-at-end]
  [fixture: quadrant/gram-unclosed-class-marker-at-end]
  [fixture: quadrant/gram-unclosed-class-name-at-end]
  [fixture: quadrant/gram-unclosed-classdef-at-end]
  [fixture: quadrant/gram-unclosed-markdown-at-end]
  [fixture: quadrant/gram-unclosed-name-quote-at-end]
  [fixture: quadrant/gram-unclosed-point-after-comma-at-end]
  [fixture: quadrant/gram-unclosed-quadrant-quote-at-end]

## block

要約の欄です。

| 欄         | 内容                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`     | 図を持つブロックです。`columns`（テキストの最上位に `columns` がないとき `-1`）と、`children`（図のブロックをテキストの順に並べたもの）を持ちます。 |
| `unplaced` | Db が表に持ち、どの子の並びにも入っていないブロックです。                                                                                           |
| `edges`    | 辺で、テキストの順です。                                                                                                                            |
| `classes`  | `classDef` のクラスで、最初の定義の順です。                                                                                                         |

`normalizeBlock()`（`src/normalizers/block.ts`）が `block` の Db を要約します。
Db は、すべての block 図が共有する 1 つのオブジェクトで、
状態はモジュールの変数にあり、
構文解析のたびに
[`clear()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/block/blockDB.ts#L197-L209) がそれを初期状態に戻します。
構文解析のあいだ、ブラウザの機能も時刻も読みません。
文法は文の並びを作り、テキスト全体を読み終えたときに初めて、
[`setHierarchy()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/block/blockDB.ts#L305-L309) が
[`populateBlockDatabase()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/block/blockDB.ts#L105-L192) を呼びます。
これは並びをテキストの順に、子の並びを 1 つずつたどって Db を埋めます。
id ごとのブロックの表、辺の並び、クラスです。
要約は、それが終わったときの Db から読みます。

ブロックは `{ id, label, type, ... }` で、Db が持つ欄だけを、
Db が持つとおりに持ちます。
`widthInColumns` は node の `:N` で、辺の端の node にはありません。
`width` は `space` の幅です。
`directions` は block arrow の方向で、字句解析器が読んだとおりです。
`columns` は composite の中の最後の `columns` です。
`classes` は `class` が与えたクラス名で、文の順です。
`styles` は、そのブロックへの最後の `style` の文のスタイルで、
`,` で分けたものです。
composite は `children` を持ちます。
自分の並びのブロックで、テキストの順です。
`id` のない `block` と `space` ごとに、Db は
[`generateId()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/block/blockDB.ts#L300-L303) で id を作ります。
これは乱数を含むので、要約はそのようなブロックに `id` を持たず、
`space` に `label` も持ちません（`space` の label は Db が作った id です）。
図を持つブロックは `root` で、`id` を除けば他のブロックと同じ形です。

`root.columns` は、テキストの最上位に `columns` がないとき `-1` です。
`unplaced` は、Db が表に持ち、どの子の並びにも入っていないブロックを、
表の順に並べます。
`class` が、まだどの文も定義していない id、
または前に空白があってブロックが見つからない id
（`class A, B c`）に作ったブロック
（その id の表の項目の場所に入ります。
あとからその id が定義されると、そのブロックが使われ、図の外に残ります）と、
Db がすでに持つ id の composite の中のブロックです
（Db は id の最初のブロックを残し、新しいブロックを子の並びごと捨てます）。
ほかの載せたブロックの `children` が持つブロックは、そこにだけ載せます。
辺は
`{ start, end, label, thickness, pattern, arrowTypeStart, arrowTypeEnd }`
で、
端のブロックが block arrow のときは `directions` も持ちます。
辺はテキストの順で、composite の中の辺も含みます。
クラスは `{ id, styles }` で、
その id のすべての `classDef` のスタイルを順に並べたものです。

次のものは、理由があって要約から除きます。

- composite の `colorIndex`。描画のためのパレットの番号で、
  composite の順に数えます。
- クラスの `textStyles`。色を指すスタイルを描画のために書き直したもので、
  スタイルから決まります。
- 辺の `id` と `type`。`id` は同じ 2 つの id の間の辺の通し番号と 2 つの id で、
  `type` は常に `edge` です。
- composite でなくて子を持たないブロックの `children`（`[]`）、
  `space` の `label`（Db が作った id）、
  `space` の文が表に作る項目です（幅の分のブロックが幅を持ち、
  `space:0` はブロックを作りません）。
- `block:` の後ろに辺の文が続く composite の欄 `0`、`1`、`2`。
  Db は文の 3 つのブロックの並びを composite に展開し、その欄は何も読みません。
- 描画が埋める配置（`size`、`intersect`、`node`）。構文解析のあいだ、
  Db は持ちません。
- `getColumns()`。`columns` のない、または `0` のブロックには子の数を返します。
  残す欄から決まります。

Db のパッチ（`patchBlockDb()`）は `generateId()` が作る id を記録し、
要約がそれをテキストの id と区別できるようにします。`clear()` はそれを忘れます。
Db は 1 つなので、パッチは Db そのものに当てます。
要約は、mermaid.js のどの `securityLevel` でも、サイトのどの設定でも同じです。
ただし、その値のどれでもない `securityLevel` では、
ラベルの文字が置き換わります。

要約の値を欄ごとに示します。

- 見出しは `block-beta` か `block` です。
  [検出器](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/block/blockDetector.ts#L6-L6)は、空白のあとに `block` で始まるテキストを、この大文字小文字のとおりに読みます。
  そのため、`Block-beta`、`BLOCK-BETA`、`Block` は検出されません。
  `block-Beta` と `block-BETA` は、見出し `block` の後ろに、
  どの規則も読めないテキストが続く形です。
  見出しに単語の文字が続くと見出しでなく node になります。
  `blockx`、`block_beta`、`block2`、`block-betax`、
  `block-alpha` は拒否されます。
  ASCII の外の文字は単語の文字でないので、`blocké` は見出しと node `é` です。
  見出しだけのテキストは、改行があってもなくても拒否されます。
  [fixture: block/header-block-beta]
  [fixture: block/header-block]
  [fixture: block/header-only-block-beta]
  [fixture: block/header-only-block]
  [fixture: block/header-only-block-beta-no-line-break]
  [fixture: block/header-capitalized]
  [fixture: block/header-upper-case]
  [fixture: block/header-capitalized-block]
  [fixture: block/header-word-suffix]
  [fixture: block/header-dash-suffix]
  [fixture: block/header-alpha-suffix]
  [fixture: block/header-underscore-suffix]
  [fixture: block/header-digit-suffix]
  [fixture: block/header-non-ascii-suffix]
  [fixture: block/header-beta-capital]
  [fixture: block/header-beta-upper]
- 見出しと同じ行に、空白かタブを挟んで文を続けられます。`columns` も同じです。
  そこでは、`;` と `%%` とその後ろのテキストは node であり、
  区切りでもコメントでもありません。
  2 つ目の見出しは composite を開き、`end` で閉じなければなりません。
  1 行だけの見出し、見出しの行の後ろ、`block` の形のどれでも同じです。
  [fixture: block/header-spaced-word-suffix]
  [fixture: block/header-statement-on-header-line]
  [fixture: block/header-statement-on-header-line-tab]
  [fixture: block/header-columns-on-header-line]
  [fixture: block/header-semicolon]
  [fixture: block/header-semicolon-spaced]
  [fixture: block/header-comment-on-header-line]
  [fixture: block/header-comment-glued]
  [fixture: block/header-twice]
  [fixture: block/header-twice-closed]
  [fixture: block/header-twice-same-line]
  [fixture: block/header-twice-block]
  [fixture: block/header-keyword-header-in-text]
- 見出しの前の空白、タブ、空行、U+00A0、U+3000、U+FEFF、
  U+2028 は何も変えません。
  フロントマター、コメント行、ディレクティブ行も同じで、
  タイトルと設定を要約は残しません。
  見出しの前の `#` で始まる行、`;`、文は検出されません。
  見出しの前の `%%` だけの行と `%%{ }%%` は取り除かれず、
  字句解析器は見出しの前の node として読み、拒否されます。
  [fixture: block/header-indented]
  [fixture: block/header-tab-indented]
  [fixture: block/header-blank-lines-before]
  [fixture: block/header-nbsp-before]
  [fixture: block/header-ideographic-space-before]
  [fixture: block/header-bom-before]
  [fixture: block/header-ls-before]
  [fixture: block/header-after-comment-line]
  [fixture: block/header-after-directive-line]
  [fixture: block/header-after-whitespace-line]
  [fixture: block/header-after-frontmatter]
  [fixture: block/header-after-frontmatter-and-comment]
  [fixture: block/header-after-hash-line]
  [fixture: block/header-after-semicolon-line]
  [fixture: block/header-leading-semicolon]
  [fixture: block/header-statement-first]
  [fixture: block/div-after-bare-percent-line]
  [fixture: block/div-after-bare-percent-line-and-whitespace-line]
  [fixture: block/div-after-empty-braces-line]
- 見出しの後ろの空白、タブ、U+00A0、U+FEFF、U+3000、U+2028、U+2029、垂直タブ、
  改ページは空白です。
  単独の CR と CRLF は行を終わらせ、
  見出しに付いたディレクティブは取り除かれます。
  U+0085 は字句解析器にとって空白でなく、後ろの id とつながります。
  [fixture: block/header-trailing-spaces]
  [fixture: block/header-trailing-tab]
  [fixture: block/header-trailing-nbsp]
  [fixture: block/header-bom-after]
  [fixture: block/header-ls-after]
  [fixture: block/header-ps-after]
  [fixture: block/header-nel-after]
  [fixture: block/header-vt-after]
  [fixture: block/header-ff-after]
  [fixture: block/header-cr]
  [fixture: block/header-crlf]
  [fixture: block/header-directive-glued]
- `columns N` は、
  それが書かれたブロック（root か composite）の columns を決めます。
  ブロックの中のどこに書いても、そのブロックの最後の `columns` が columns です。
  数は 10 進数として読むので、`007` は 7 で、`0` と `00` は 0 です。
  `columns auto` は `-1` で、`columns` のないブロックの値と同じです。
  桁が多くて倍精度が無限になる数は、テキスト `Infinity` で記録します。
  Db は数をそのまま持ち、`0` は `0` として保存します（`getColumns()` は、
  その場合に子の数を返します）。
  [fixture: block/db-columns-plain]
  [fixture: block/db-columns-auto]
  [fixture: block/db-columns-zero]
  [fixture: block/db-columns-double-zero]
  [fixture: block/db-columns-leading-zeros]
  [fixture: block/db-columns-one]
  [fixture: block/db-columns-large]
  [fixture: block/db-columns-overflow]
  [fixture: block/db-columns-twice]
  [fixture: block/db-columns-twice-auto-last]
  [fixture: block/db-columns-twice-number-last]
  [fixture: block/db-definitions-columns-three]
  [fixture: block/db-columns-after-nodes]
  [fixture: block/db-columns-between-nodes]
  [fixture: block/db-columns-only]
  [fixture: block/db-columns-only-auto]
  [fixture: block/db-columns-after-block]
  [fixture: block/db-columns-after-end]
- composite は、root や外側の composite とは別の columns を持ちます。
  id のある composite、id のない composite、
  入れ子の composite の中の `columns` は、
  いちばん内側の composite の columns を決めます。
  `columns` だけを持つ composite は子を持ちません。
  composite の行で id の後ろに書いた `columns` は、その composite の文です。
  [fixture: block/db-columns-in-block]
  [fixture: block/db-columns-in-block-and-root]
  [fixture: block/db-columns-in-block-auto]
  [fixture: block/db-columns-in-block-only]
  [fixture: block/db-columns-in-anonymous-block]
  [fixture: block/db-columns-in-nested-block]
  [fixture: block/db-columns-in-block-header-line]
  [fixture: block/db-composite-width-and-columns]
- `columns` の後ろの、数でないものは数になりません。
  符号（`+2`、`-1`）、小数点、指数、16 進の接頭辞、ASCII の外の数字は、
  数を終えるか、数が始まらないようにします。
  残りは node として読みます（`columns 2.5` は columns 2 と node `.5` です）。
  `columns -1` と `columns 2:3` は拒否されます。
  `columns` の後ろの単語、`AUTO`、`auto2` は node で、
  `columns` 自身も node です。
  `Columns 2`、`COLUMNS 2`、`columns2`、`columnsauto` も同じで、
  キーワードは小文字で、空白が続くときに読みます。
  [fixture: block/db-columns-plus]
  [fixture: block/gram-columns-negative]
  [fixture: block/db-columns-decimal]
  [fixture: block/db-columns-exponent]
  [fixture: block/db-columns-hexadecimal]
  [fixture: block/db-columns-fullwidth-digit]
  [fixture: block/db-columns-arabic-digit]
  [fixture: block/gram-columns-colon-number]
  [fixture: block/db-columns-no-number]
  [fixture: block/db-columns-no-number-last]
  [fixture: block/db-columns-word]
  [fixture: block/db-columns-auto-upper]
  [fixture: block/db-columns-auto-suffix]
  [fixture: block/db-columns-auto-glued]
  [fixture: block/db-columns-glued-number]
  [fixture: block/db-columns-upper-case]
  [fixture: block/db-columns-upper-case-all]
  [fixture: block/db-columns-two-numbers]
- `columns` と数の間は、字句解析器の空白ならなんでもよく、改行と空行も含みます。
  数の後ろに同じ行で node を続けられます。数の後ろの `;` は node です。
  node の幅は columns によらず保たれ、columns より広い幅も変わりません。
  [fixture: block/db-columns-tab]
  [fixture: block/db-columns-line-feed]
  [fixture: block/db-columns-blank-line]
  [fixture: block/db-columns-nbsp]
  [fixture: block/db-columns-ideographic]
  [fixture: block/db-columns-ls]
  [fixture: block/db-columns-bom]
  [fixture: block/db-columns-crlf]
  [fixture: block/db-columns-two-spaces]
  [fixture: block/db-columns-trailing]
  [fixture: block/db-columns-then-word]
  [fixture: block/db-columns-semicolon]
  [fixture: block/db-columns-with-width]
  [fixture: block/db-columns-width-exceeds-zero]
  [fixture: block/db-columns-auto-then-width]
- 単語は node で、id と label はその単語です。
  1 行に、空白で区切って何個でも書けます。
  単語には、空白と `(`、`)`、`[`、`{`、`}`、`<`、`>`、`:`、`=`、
  `-` 以外のどの文字も入ります。
  この文字は単語を終えます。
  `_`、`.`、`/`、`,`、`|`、`#`、`&`、`%`、`$`、`*`、`+`、`~`、`^`、`@`、`!`、
  `?`、
  バッククォート、バックスラッシュ、`;`、引用符、`]`、すべての文字、CJK の文字、
  絵文字は id の一部です。
  単語の中の `%%` も id の一部です。
  id は数字、`%`、`#`、`;`、`_` で始められます。
  id は大文字小文字を区別し、もう一度使った id は同じブロックで、
  最初の位置にあります。
  [fixture: block/db-name-two]
  [fixture: block/db-name-three-lines]
  [fixture: block/db-name-digits]
  [fixture: block/db-name-digits-and-letters]
  [fixture: block/db-name-underscore]
  [fixture: block/db-name-underscore-first]
  [fixture: block/db-name-dot]
  [fixture: block/db-name-slash]
  [fixture: block/db-name-comma]
  [fixture: block/db-name-pipe]
  [fixture: block/db-name-hash]
  [fixture: block/db-name-ampersand]
  [fixture: block/db-name-percent]
  [fixture: block/db-name-percent-percent]
  [fixture: block/db-name-dollar]
  [fixture: block/db-name-asterisk]
  [fixture: block/db-name-plus]
  [fixture: block/db-name-tilde]
  [fixture: block/db-name-caret]
  [fixture: block/db-name-at]
  [fixture: block/db-name-exclamation]
  [fixture: block/db-name-question]
  [fixture: block/db-name-backtick]
  [fixture: block/db-name-backslash]
  [fixture: block/db-name-semicolon]
  [fixture: block/db-name-quote]
  [fixture: block/db-name-single-quote]
  [fixture: block/db-name-brackets-in-id]
  [fixture: block/db-name-non-ascii]
  [fixture: block/db-name-cjk]
  [fixture: block/db-name-emoji]
  [fixture: block/db-name-long]
  [fixture: block/db-name-same-twice]
  [fixture: block/db-name-same-three]
  [fixture: block/db-name-case]
  [fixture: block/db-name-leading-digits]
  [fixture: block/db-name-percent-first]
  [fixture: block/db-name-hash-first]
  [fixture: block/db-name-semicolon-first]
  [fixture: block/gram-name-dash]
  [fixture: block/gram-name-dash-first]
  [fixture: block/gram-name-colon]
  [fixture: block/gram-name-equals]
  [fixture: block/gram-name-less-than]
  [fixture: block/gram-name-greater-than]
  [fixture: block/gram-name-brace]
  [fixture: block/gram-name-close-paren]
- タブ、垂直タブ、改ページ、CR、CRLF、U+00A0、U+3000、U+FEFF、U+2028、
  U+2029 は 2 つの id を分けます。
  U+0085 は分けず、2 つの単語を 1 つの id につなげます。
  node の後ろの空白、行のインデント、空行、最後の改行がないことは、
  何も変えません。
  [fixture: block/db-name-tab-between]
  [fixture: block/db-name-nbsp-between]
  [fixture: block/db-name-ideographic-between]
  [fixture: block/db-name-bom-between]
  [fixture: block/db-name-ls-between]
  [fixture: block/db-name-ps-between]
  [fixture: block/db-name-nel-between]
  [fixture: block/db-name-vt-between]
  [fixture: block/db-name-ff-between]
  [fixture: block/db-name-cr-between]
  [fixture: block/db-name-crlf-between]
  [fixture: block/db-name-ls-around]
  [fixture: block/db-name-trailing-spaces]
  [fixture: block/db-name-indented-more]
  [fixture: block/db-name-blank-lines]
  [fixture: block/db-name-no-final-line-feed]
- id の後ろ、shape の後ろ、block arrow の方向の後ろの `:N` は、
  node の幅（列の数）です。
  `:N` のない node の幅は 1 です。
  数は 10 進数として読むので、`:007` は 7、`:0` は 0 です。
  桁が多くて倍精度が無限になる数は、テキスト `Infinity` です。
  `:` の前の空白は、改行も含めて許されます。
  `:` の後ろの空白、数のない `:`、符号、文字、ASCII の外の数字、
  2 つの幅は拒否されます。
  数の後ろは別に読みます。
  `A:2.5` は幅 2 と node `.5` で、`A:3B`、`A:3,B`、`A:3#`、
  `A:3;` は node A と別の node です。
  [fixture: block/db-width-plain]
  [fixture: block/db-width-one]
  [fixture: block/db-width-zero]
  [fixture: block/db-width-leading-zeros]
  [fixture: block/db-width-large]
  [fixture: block/db-width-overflow]
  [fixture: block/db-width-space-before]
  [fixture: block/db-width-tab-before]
  [fixture: block/db-width-line-feed-before]
  [fixture: block/gram-width-space-after]
  [fixture: block/gram-width-colon-only]
  [fixture: block/gram-width-negative]
  [fixture: block/db-width-decimal]
  [fixture: block/gram-width-letters]
  [fixture: block/gram-width-twice]
  [fixture: block/gram-width-fullwidth-digit]
  [fixture: block/db-width-glued-node]
  [fixture: block/db-width-comma]
  [fixture: block/db-width-hash]
  [fixture: block/db-width-semicolon]
  [fixture: block/db-width-on-two-nodes]
  [fixture: block/db-width-with-label]
  [fixture: block/db-width-label-then-space]
  [fixture: block/db-width-with-block-arrow]
- もう一度使った node は、最初に使ったときの幅を保ちます。
  最初に幅を与えたかどうかによりません。
  辺の始まりの node は Db では幅を持たず、辺の終わりの node は幅を持てません。
  始まりの幅は失われ、終わりの幅は拒否されます。
  辺より前に定義した node は幅を保ちます。
  [fixture: block/db-width-redefine]
  [fixture: block/db-width-redefine-without]
  [fixture: block/db-width-redefine-first]
  [fixture: block/db-width-on-edge-source]
  [fixture: block/gram-width-on-edge-target]
  [fixture: block/db-width-before-edge]
  [fixture: block/db-edge-keeps-width]
  [fixture: block/db-definitions-three-widths]
- id の後ろの shape は node の type を決め、
  引用符の間のテキストが label になります。
  `[ ]` は `square`、`( )` は `round`、`(( ))` は `circle`、
  `((( )))` は `doublecircle`、
  `([ ])` は `stadium`、`[[ ]]` は `subroutine`、`[( )]` は `cylinder`、
  `{ }` は `diamond`、`{{ }}` は `hexagon`、`> ]` は `rect_left_inv_arrow`、
  `[/ /]` は `lean_right`、`[\ \]` は `lean_left`、`[/ \]` は `trapezoid`、
  `[\ /]` は `inv_trapezoid`、`<[ ]>( )` は `block_arrow` です。
  shape のない node の type は `na` です。
  [fixture: block/db-shape-square]
  [fixture: block/db-shape-round]
  [fixture: block/db-shape-circle]
  [fixture: block/db-shape-doublecircle]
  [fixture: block/db-shape-stadium]
  [fixture: block/db-shape-subroutine]
  [fixture: block/db-shape-cylinder]
  [fixture: block/db-shape-diamond]
  [fixture: block/db-shape-hexagon]
  [fixture: block/db-shape-rect-left-inv-arrow]
  [fixture: block/db-shape-lean-right]
  [fixture: block/db-shape-lean-left]
  [fixture: block/db-shape-trapezoid]
  [fixture: block/db-shape-inv-trapezoid]
  [fixture: block/db-shape-block-arrow]
- 開きと閉じの文字の組がこれらのどれでもなければ type を持ちません。
  Db は `na` を与え、label は残ります。
  `) (`、`)) ((`、`(- -)`、`-) (-`、
  `( ]`、`[ )`、`> }`、`{ ]`、`(( )` のような合わない組、余分な `]` がそうです。
  `[| |]` と `[[[ ]]]` は shape でなく、拒否されます。
  id と shape の間に空白や改行を置けます。id のない shape は拒否されます。
  [fixture: block/db-shape-odd-left]
  [fixture: block/db-shape-odd-double]
  [fixture: block/db-shape-minus-round]
  [fixture: block/db-shape-minus-reverse]
  [fixture: block/db-shape-mixed-round-square]
  [fixture: block/db-shape-mixed-square-round]
  [fixture: block/db-shape-mixed-arrow-brace]
  [fixture: block/db-shape-mixed-brace-square]
  [fixture: block/db-shape-mixed-double]
  [fixture: block/db-shape-mixed-circle-stadium]
  [fixture: block/db-shape-extra-close]
  [fixture: block/gram-shape-pipe]
  [fixture: block/gram-shape-triple-square]
  [fixture: block/db-shape-space-before]
  [fixture: block/db-shape-line-feed-before]
  [fixture: block/gram-shape-shape-only]
  [fixture: block/gram-shape-shape-only-round]
  [fixture: block/db-shape-two-defs-line]
  [fixture: block/db-shape-no-space-between]
- node を定義し直すと、Db は新しい定義に type があればそれを取ります
  （type のない shape や shape のない使い方は type を変えません）。
  label は id と違うときに取ります。
  最初の幅と最初の方向は保たれ、node は最初の位置に残ります。
  id と同じ label は、label を置き換えません。
  3 回目の定義は 2 回目の結果と出会い、
  shape のない使い方が 2 つの定義の間にあっても何も変えません。
  [fixture: block/db-shape-redefine-shape]
  [fixture: block/db-shape-redefine-to-na]
  [fixture: block/db-shape-redefine-from-na]
  [fixture: block/db-shape-redefine-same-label]
  [fixture: block/db-shape-redefine-to-odd]
  [fixture: block/db-shape-redefine-width]
  [fixture: block/db-shape-redefine-label-only]
  [fixture: block/db-definitions-three-shapes]
  [fixture: block/db-definitions-three-labels-first-equal]
  [fixture: block/db-definitions-three-na-in-the-middle]
  [fixture: block/db-definitions-three-edge-ends]
  [fixture: block/db-definitions-three-edge-and-node]
  [fixture: block/db-edge-redefine-by-edge]
  [fixture: block/db-edge-keeps-shape]
- label は引用符の間のテキストです。空にはできず、`""` は拒否されます。
  空白だけの文字列は、その空白を持つ label です。
  テキストの前後の空白は残ります。
  単一引用符、引用符のないテキスト、
  閉じていない文字列（閉じていない shape も）は拒否されます。
  文字列の中の `"` も、前にバックスラッシュがあってもなくても拒否されます。
  文字列の中の `"` 以外の文字は label の一部です。
  括弧、`<` と `>`、矢印、`:`、`;`、`#`、`%`、`%%`、アポストロフィ、
  バッククォート、バックスラッシュ、
  ASCII の外の文字、絵文字、`end` や `columns 2` のようなキーワード、
  `__proto__` です。
  バッククォートで始まる文字列（markdown 文字列）は拒否されます。
  [fixture: block/db-label-plain]
  [fixture: block/gram-label-empty]
  [fixture: block/db-label-spaces]
  [fixture: block/db-label-padded]
  [fixture: block/gram-label-single-quote]
  [fixture: block/gram-label-unquoted]
  [fixture: block/gram-label-unquoted-space]
  [fixture: block/gram-label-unclosed]
  [fixture: block/gram-label-unclosed-shape]
  [fixture: block/gram-label-quote-inside]
  [fixture: block/gram-label-backslash-quote]
  [fixture: block/db-label-backslash]
  [fixture: block/db-label-escaped-n]
  [fixture: block/db-label-single-quote-inside]
  [fixture: block/gram-label-backtick]
  [fixture: block/db-label-backtick-inside]
  [fixture: block/gram-label-backtick-start]
  [fixture: block/db-label-backtick-end]
  [fixture: block/gram-label-markdown]
  [fixture: block/db-label-round-brackets]
  [fixture: block/db-label-square-brackets]
  [fixture: block/db-label-braces]
  [fixture: block/db-label-angle]
  [fixture: block/db-label-arrow]
  [fixture: block/db-label-colon]
  [fixture: block/db-label-semicolon]
  [fixture: block/db-label-hash]
  [fixture: block/db-label-percent]
  [fixture: block/db-label-comment]
  [fixture: block/db-label-non-ascii]
  [fixture: block/db-label-emoji]
  [fixture: block/db-label-long]
  [fixture: block/db-label-keyword]
  [fixture: block/db-label-keyword-columns]
  [fixture: block/db-label-proto]
  [fixture: block/db-label-constructor]
  [fixture: block/db-label-equals-id]
- 文字列の中の改行、タブ、U+2028、U+2029、U+00A0、U+3000、U+FEFF、
  U+0085 は label の一部です。
  ただし、単独の CR と CRLF は改行になります。
  文字列の中のコメント行は、その改行ごと取り除かれます。
  文字列の中のディレクティブは取り除かれ、行を単独で占めるディレクティブは、
  その前後の改行を残します。
  文字参照はその代替の文字列として読み、
  `;` のない `#` と数字は文字参照ではありません。
  HTML タグの属性の引用符の `"` は `'` として読むので、文字列を終えません。
  HTML タグ、`<br>`、`&amp;` はそのまま残ります。
  [fixture: block/db-label-line-feed]
  [fixture: block/db-label-crlf]
  [fixture: block/db-label-cr]
  [fixture: block/db-label-tab]
  [fixture: block/db-label-ls]
  [fixture: block/db-label-ps]
  [fixture: block/db-label-nbsp]
  [fixture: block/db-label-ideographic]
  [fixture: block/db-label-bom]
  [fixture: block/db-label-nel]
  [fixture: block/db-label-comment-line]
  [fixture: block/db-label-comment-line-spaced]
  [fixture: block/db-label-directive]
  [fixture: block/db-label-directive-line]
  [fixture: block/db-label-entity-numeric]
  [fixture: block/db-label-entity-named]
  [fixture: block/db-label-entity-no-semicolon]
  [fixture: block/db-label-html-tag]
  [fixture: block/db-label-html-br]
  [fixture: block/db-label-html-br-slash]
  [fixture: block/db-label-html-script]
  [fixture: block/db-label-html-attribute]
  [fixture: block/db-label-html-attribute-double]
  [fixture: block/db-label-ampersand]
  [fixture: block/db-label-after-string]
  [fixture: block/db-label-after-string-glued]
  [fixture: block/gram-label-string-only]
  [fixture: block/db-label-string-after-id]
  [fixture: block/gram-label-string-after-space]
- block arrow `<[ "text" ]>( 方向 )` は、`]>` の後ろに方向を持ちます。
  間に空白か改行を置けます。
  方向は `right`、`left`、`up`、`down`、`x`、`y` の小文字で、コンマで区切り、
  順に 1 つずつ残します。
  同じ方向を繰り返しても、そのとおりに残ります。
  方向のテキストは、後ろに続く空白を含みます。
  `right  ,  down` は `right  ` と `down`、`right down` は `right ` と `down`、
  `( right)` は ` right` です。
  一方、コンマの後ろの空白は捨てられ、最初の方向の前のコンマも捨てられます。
  最初の方向の前にコンマがなければ、その前の空白は方向に残ります。
  `( right , down)` は、前後に空白のある `right` と `down` です。
  `(` と最初の方向の間のコメント行やディレクティブは方向のテキストから除かれ、
  その周りの空白が残ります。
  方向の後の CR、ディレクティブ、LF は 2 つの行終端で、2 つの改行として読み、
  CRLF は 1 つです。
  `rightx`、`xright`、`updown` のように方向でできた単語は、
  中の方向として読みます。
  知らない単語、大文字、方向がないもの、末尾のコンマ、続くコンマ、キーワード、
  `>` のない閉じ、
  閉じていない並び、引用符のないラベル、ラベルのないものは拒否されます。
  ラベルは空白 1 つや `&nbsp;` でもかまいません。
  [fixture: block/db-shape-block-arrow]
  [fixture: block/db-arrow-left]
  [fixture: block/db-arrow-up]
  [fixture: block/db-arrow-down]
  [fixture: block/db-arrow-x]
  [fixture: block/db-arrow-y]
  [fixture: block/db-arrow-two]
  [fixture: block/db-arrow-all]
  [fixture: block/db-arrow-no-space]
  [fixture: block/db-arrow-spaces]
  [fixture: block/db-arrow-spaces-around-comma]
  [fixture: block/db-arrow-spaces-around-first]
  [fixture: block/db-arrow-comment-line-before-first]
  [fixture: block/db-arrow-directive-before-first]
  [fixture: block/db-arrow-cr-directive-lf]
  [fixture: block/db-arrow-trailing-space]
  [fixture: block/db-arrow-leading-space]
  [fixture: block/db-arrow-tab]
  [fixture: block/db-arrow-line-feed]
  [fixture: block/db-arrow-twice]
  [fixture: block/db-arrow-leading-comma]
  [fixture: block/db-arrow-glued-words]
  [fixture: block/db-arrow-word-suffix]
  [fixture: block/db-arrow-word-prefix]
  [fixture: block/db-arrow-up-down]
  [fixture: block/db-arrow-space-before-paren]
  [fixture: block/db-arrow-line-feed-before-paren]
  [fixture: block/gram-arrow-trailing-comma]
  [fixture: block/gram-arrow-double-comma]
  [fixture: block/gram-arrow-empty]
  [fixture: block/gram-arrow-unknown]
  [fixture: block/gram-arrow-upper-case]
  [fixture: block/gram-arrow-dir-keywords]
  [fixture: block/gram-arrow-no-paren]
  [fixture: block/gram-arrow-unclosed-paren]
  [fixture: block/gram-arrow-unquoted-label]
  [fixture: block/gram-arrow-empty-label]
  [fixture: block/gram-arrow-markdown-label]
  [fixture: block/gram-arrow-closing-wrong]
  [fixture: block/gram-arrow-closing-square]
  [fixture: block/db-arrow-spaces-label]
  [fixture: block/db-arrow-nbsp-label]
  [fixture: block/db-arrow-with-width]
  [fixture: block/db-arrow-two-lines]
  [fixture: block/db-arrow-class]
  [fixture: block/db-arrow-proto]
- block arrow を定義し直すと、最初の方向を保ち、新しい label を取ります。
  別の shape の node に block arrow を与えると type が `block_arrow` になり、
  方向はありません。
  block arrow に shape を与えると shape の type になり、方向は残ります。
  辺の終わりの block arrow は方向を辺にも与え、
  始まりの block arrow は与えません。
  [fixture: block/db-arrow-redefine]
  [fixture: block/db-arrow-redefine-from-square]
  [fixture: block/db-arrow-redefine-to-square]
  [fixture: block/db-definitions-three-arrows]
  [fixture: block/db-edge-to-block-arrow]
  [fixture: block/db-edge-from-block-arrow]
  [fixture: block/db-arrow-after-edge]
- `space` はキーワードで id ではなく、type が `space`、
  幅が 1 の `space` ブロックを作ります。
  `space:N` は N 個のブロックを作り、それぞれの幅は N です。
  要約は N 個の項目として並べます。
  `space:0` はブロックを作りません。数の先頭の 0 は 10 進数として読みます。
  数のそばの空白やコロンは別のテキストを作ります。
  `space :2` と `space: 2` は拒否され、数のない `space:`、符号、文字、
  ASCII の外の数字、2 つの幅も拒否されます。
  `space:2.5` は `space:2` と node `.5`、
  `space:2A` は `space:2` と node A です。
  `Space` と `SPACE:2` は node です。
  `space` に単語の文字が付いた単語は node です（`spaceship`、`space1`、
  `space_a`、`aspace`）。
  `space.a`、`space;`、`space#` は `space` ブロックと node です。
  `space` は辺の始まりにも終わりにもなれず、shape も持てず、
  `class` や `style` の文で名前を指すこともできません。
  `class space c` は、図に載らない id `space` のブロックを作ります。
  [fixture: block/db-space-plain]
  [fixture: block/db-space-width]
  [fixture: block/db-space-width-one]
  [fixture: block/db-space-width-zero]
  [fixture: block/db-space-zero-before-node]
  [fixture: block/db-space-leading-zeros]
  [fixture: block/gram-space-space-before-colon]
  [fixture: block/gram-space-space-after-colon]
  [fixture: block/gram-space-no-number]
  [fixture: block/gram-space-letters]
  [fixture: block/gram-space-negative]
  [fixture: block/db-space-decimal]
  [fixture: block/gram-space-twice-width]
  [fixture: block/gram-space-fullwidth-digit]
  [fixture: block/gram-space-nbsp-colon]
  [fixture: block/db-space-width-suffix]
  [fixture: block/db-space-upper-case]
  [fixture: block/db-space-upper-case-all]
  [fixture: block/db-space-suffix]
  [fixture: block/db-space-digit-suffix]
  [fixture: block/db-space-underscore-suffix]
  [fixture: block/db-space-prefix]
  [fixture: block/db-space-dot-suffix]
  [fixture: block/db-space-semicolon]
  [fixture: block/db-space-hash]
  [fixture: block/gram-space-dash-suffix]
  [fixture: block/gram-space-edge-start]
  [fixture: block/gram-edge-to-space]
  [fixture: block/gram-space-shape]
  [fixture: block/gram-space-quoted]
  [fixture: block/db-space-class]
- `space` ブロックはほかのブロックの間にテキストの順に並びます。
  node の前、間、後ろ、2 つ続き、それぞれの幅、columns のある行、
  composite の中のどれでも同じです。
  [fixture: block/db-space-then-node]
  [fixture: block/db-space-node-then]
  [fixture: block/db-space-between]
  [fixture: block/db-space-two]
  [fixture: block/db-space-two-widths]
  [fixture: block/db-space-with-columns]
  [fixture: block/db-space-in-composite]
  [fixture: block/db-space-in-named-composite]
  [fixture: block/db-space-label-in-line]
  [fixture: block/db-space-crlf]
  [fixture: block/db-definitions-space-three]
- `block:G` は id `G` の composite を開き、`end` が閉じます。
  id のない `block` と `block-beta` は、id のない composite を開きます。
  composite は type が `composite`、label が `""`、
  そして `children` を持ちます。
  id の後ろに幅（`block:G:2`）と、
  label のある shape（`block:G["text"]`）を置けます。
  label は残りますが shape と type は残らず、type は `composite` のままです。
  composite は何段にも入れ子にでき、続けて置けて、1 行に他の文と並べられます。
  block arrow の label を付けた composite は、方向を持ちます。
  [fixture: block/db-composite-plain]
  [fixture: block/db-composite-no-id]
  [fixture: block/db-composite-no-id-beta]
  [fixture: block/db-composite-width]
  [fixture: block/db-composite-width-zero]
  [fixture: block/db-composite-label]
  [fixture: block/db-composite-label-shapes]
  [fixture: block/db-composite-label-and-width]
  [fixture: block/db-composite-block-arrow]
  [fixture: block/db-composite-nested]
  [fixture: block/db-composite-nested-no-id]
  [fixture: block/db-composite-nested-three]
  [fixture: block/db-composite-siblings]
  [fixture: block/db-composite-siblings-no-id]
  [fixture: block/db-composite-end-in-line]
  [fixture: block/db-composite-two-statements-line]
  [fixture: block/db-composite-composite-in-line-with-node]
  [fixture: block/db-composite-many-composites]
  [fixture: block/db-composite-colors]
  [fixture: block/db-composite-child-width-in]
  [fixture: block/db-composite-columns-id]
  [fixture: block/db-composite-proto-id]
  [fixture: block/db-composite-constructor-id]
- composite にはブロックを作る文が要り、`end` で閉じなければなりません。
  空の composite、閉じていない composite、閉じる対象のない `end`、先頭の `end`、
  id としての `end` は拒否されます。
  `columns`、`classDef`、`class`、
  `style` だけを持つ composite は子を持ちません。
  `end` は小文字で、単独の単語として読みます。
  `END`、`End`、`endx`、`end_`、`end:2` は拒否されます。
  `end.x`、`end#`、`end;`、node が続く `end` は、キーワードと node です。
  label の中の `end` はテキストで、
  `end` の単語の中のディレクティブは取り除かれます。
  [fixture: block/gram-composite-empty]
  [fixture: block/gram-composite-empty-no-id]
  [fixture: block/gram-composite-not-closed]
  [fixture: block/gram-composite-not-closed-nested]
  [fixture: block/gram-composite-extra-end]
  [fixture: block/gram-composite-end-first]
  [fixture: block/gram-composite-end-as-id]
  [fixture: block/gram-composite-end-as-node-in-block]
  [fixture: block/db-composite-only-columns]
  [fixture: block/db-composite-only-class-def]
  [fixture: block/db-composite-only-class]
  [fixture: block/db-composite-only-style]
  [fixture: block/gram-composite-end-upper-case]
  [fixture: block/gram-composite-end-capital]
  [fixture: block/gram-composite-end-suffix]
  [fixture: block/gram-composite-end-underscore]
  [fixture: block/gram-composite-end-width]
  [fixture: block/db-composite-end-dot]
  [fixture: block/db-composite-end-hash]
  [fixture: block/db-composite-end-semicolon]
  [fixture: block/db-composite-end-then-node]
  [fixture: block/db-composite-end-comment]
  [fixture: block/db-composite-end-in-label]
  [fixture: block/db-composite-end-glued]
  [fixture: block/db-composite-end-tab]
  [fixture: block/db-composite-end-crlf]
  [fixture: block/db-composite-end-nbsp]
  [fixture: block/div-directive-inside-end]
- `block:` の後ろの id は node の id と同じ単語で、前に空白を置けます。
  `block: G` は `block:G` です。
  引用符のある id、id のないもの、コロンの前の空白、ダッシュ、`Block:G`、
  id としての `space` は拒否されます。
  `columns` は id になれます。
  `blockx`、`block2`、`block_a` は node で、`block-a`、`block-betax`、
  `blockx:G` は拒否されます。
  [fixture: block/db-composite-space-after-colon]
  [fixture: block/gram-composite-id-quoted]
  [fixture: block/gram-composite-no-id-after-colon]
  [fixture: block/gram-composite-space-before-colon]
  [fixture: block/gram-composite-id-with-dash]
  [fixture: block/gram-composite-upper-case]
  [fixture: block/gram-composite-space-id]
  [fixture: block/db-composite-suffix]
  [fixture: block/db-composite-digit-suffix]
  [fixture: block/db-composite-underscore-suffix]
  [fixture: block/gram-composite-dash-suffix]
  [fixture: block/gram-composite-beta-suffix]
  [fixture: block/gram-composite-colon-suffix]
- Db がすでに持つブロックの id を持つ composite は、新しいブロックを作りません。
  古いブロックは type が `composite`、label が `""` になり、位置と幅を保ち、
  子を持ちません。
  新しい composite の中のブロックは `unplaced` に別に載ります。
  composite の id を持つ node は composite を保ちます。ただし shape があれば、
  ブロックは shape の type と label になり、子は残ります。
  自分の composite の id を持つ node は、その composite です。
  composite の中で再び使った node は、最初の位置、つまり外に残ります。
  [fixture: block/db-composite-id-same-as-node-before]
  [fixture: block/db-composite-id-same-as-node-after]
  [fixture: block/db-composite-id-same-as-node-after-shape]
  [fixture: block/db-composite-id-same-composite]
  [fixture: block/db-composite-id-same-nested]
  [fixture: block/db-composite-id-same-as-child]
  [fixture: block/db-composite-id-same-child-defined-in-inner]
  [fixture: block/db-composite-child-first-then-composite]
  [fixture: block/db-definitions-three-composites]
  [fixture: block/db-definitions-composite-then-shape-then-composite]
  [fixture: block/db-definitions-shape-then-composite-then-shape]
  [fixture: block/db-composite-root-id]
- `block:` の後ろの辺の文は、id でなく composite の文として読まれます。
  composite は文の 3 つのブロックを欄として持ち、id を持ちません。
  要約は欄を除きます。
  辺が、その場で開いた composite で終わることはできません。
  その文の最初か最後の node への `style` は、
  文がそれらのブロックを作らないため、Db が例外を投げます。
  composite の中の node への `style` も、
  それを作る文より前にあれば同じで、後なら受理されます。
  [fixture: block/db-composite-edge-header]
  [fixture: block/db-composite-edge-header-width]
  [fixture: block/db-composite-shape-edge-header]
  [fixture: block/gram-composite-in-edge]
  [fixture: block/gram-style-on-composite-edge-head-start]
  [fixture: block/gram-style-on-composite-edge-head-end]
  [fixture: block/gram-style-in-composite-edge-head-before-child]
  [fixture: block/db-style-on-composite-edge-head-child]
  [fixture: block/db-style-in-composite-edge-head-after-child]
- 辺は 2 つの node を結ぶ線です。
  `-->` は終わりに矢印（`arrow_point`）のある通常の実線、`---` は矢印なし、
  `==>` と `===` は太線、`-.->` と `-.-` は点線です。
  `--x` は終わりが × （`arrow_cross`）、`--o` は終わりが円（`arrow_circle`）、
  `<-->` は両端が矢印です。
  ダッシュ、等号、ドットを増やしても同じ辺です。
  辺は `{ start, end }` で、label がなければ `""` です。
  端のブロックは、幅のない node として、テキストの順に作られます。
  `<--` だけ、`--` だけ、`-`、始まりや終わりのない辺、矢印だけは拒否されます。
  `~~~` は node で、`A~~~B` は 1 つの id です。
  `<~~~` は、空白があっても連なっていても拒否されます。
  見えない線に始点の印は付きません。
  矢印の前に付いた `x` と `o` は node なので、
  `A x--x B` は node A と `x` からの辺です。
  辺の周りに空白は要らず、`A-->B`、`A--xB`、`A--oB` も辺です。
  周りのタブ、複数の空白、改行は空白です。
  [fixture: block/db-edge-arrow]
  [fixture: block/db-edge-open]
  [fixture: block/db-edge-thick]
  [fixture: block/db-edge-thick-open]
  [fixture: block/db-edge-dotted]
  [fixture: block/db-edge-dotted-open]
  [fixture: block/db-edge-dotted-long]
  [fixture: block/db-edge-cross]
  [fixture: block/db-edge-circle]
  [fixture: block/db-edge-bidirectional]
  [fixture: block/db-edge-long]
  [fixture: block/db-edge-long-open]
  [fixture: block/db-edge-thick-long]
  [fixture: block/db-edge-start-cross]
  [fixture: block/db-edge-start-cross-spaced]
  [fixture: block/db-edge-start-circle]
  [fixture: block/gram-edge-reverse]
  [fixture: block/gram-edge-two-dashes]
  [fixture: block/gram-edge-one-dash]
  [fixture: block/db-edge-tilde]
  [fixture: block/db-edge-tilde-glued]
  [fixture: block/db-edge-glued]
  [fixture: block/db-edge-glued-x]
  [fixture: block/db-edge-glued-o]
  [fixture: block/db-edge-spaces]
  [fixture: block/db-edge-tab]
  [fixture: block/db-edge-line-feed-before]
  [fixture: block/db-edge-line-feed-after]
  [fixture: block/db-edge-line-feed-both]
  [fixture: block/db-edge-blank-line-after]
  [fixture: block/gram-edge-no-end]
  [fixture: block/gram-edge-no-start]
  [fixture: block/gram-edge-only-arrow]
  [fixture: block/db-edge-crlf]
  [fixture: block/db-edge-nbsp]
  [fixture: block/db-edge-ideographic]
  [fixture: block/db-edge-ls]
  [fixture: block/db-edge-digit]
  [fixture: block/db-edge-unicode]
  [fixture: block/db-edge-same-line-statements]
  [fixture: block/db-edge-then-columns]
  [fixture: block/db-edge-spaces-in-id]
- 辺は label を持てます。`-- "text" -->` で、太線は `==`、
  点線は `-.` を使います。
  引用符はダッシュに接してもかまいません。
  label は node の label と同じ文字列で、空にはできず、markdown もありません。
  中のコメント行、ディレクティブ、文字参照、HTML は label と同じに読みます。
  矢印、太さ、線の種類は辺の終わりが決め、始まりがどうであっても変わりません。
  `-- "t" ==> B` は太線、`-. "t" --> B` は実線、
  `<-- "t" -->` は始まりに矢印がありません。
  辺の終わりのない label、引用符のない label、
  合わない終わりが続く始まりは拒否されます。
  `-->|text|` は label でなく、`|text|` が辺の終わりの node で、
  B は別の node です。
  [fixture: block/db-edge-label]
  [fixture: block/db-edge-label-open]
  [fixture: block/db-edge-label-thick]
  [fixture: block/db-edge-label-dotted]
  [fixture: block/db-edge-label-glued]
  [fixture: block/gram-edge-label-empty]
  [fixture: block/db-edge-label-spaces]
  [fixture: block/gram-edge-label-unquoted]
  [fixture: block/db-edge-label-pipe]
  [fixture: block/db-edge-label-pipe-spaced]
  [fixture: block/gram-edge-label-markdown]
  [fixture: block/db-edge-label-line-feed]
  [fixture: block/db-edge-label-comment-line]
  [fixture: block/db-edge-label-directive]
  [fixture: block/db-edge-label-html]
  [fixture: block/db-edge-label-entity]
  [fixture: block/gram-edge-label-start-without-end]
  [fixture: block/gram-edge-label-wrong-end]
  [fixture: block/db-edge-label-mismatched]
  [fixture: block/db-edge-label-mismatched-dotted]
  [fixture: block/db-edge-label-cross]
  [fixture: block/db-edge-label-bidirectional]
  [fixture: block/db-edge-label-start-cross]
- 辺はテキストの順に並び、composite の中の辺は composite の位置に並びます。
  同じ辺を 2 回書くと 2 本の辺です。
  辺は、2 つの composite の node、composite と node、node 自身、`__proto__`、
  `constructor`、`root` を結べます。
  端のブロックは、先の定義が与えたもの（shape、label、幅）を保ちます。
  どちらの端の shape も、node と同じようにブロックを定義します。
  `A --> end`、`A --> space`、`A --> block:G` は拒否されます。
  `A --> columns` は `columns` という名前の node への辺です。
  [fixture: block/db-edge-twice]
  [fixture: block/db-edge-opposite]
  [fixture: block/db-edge-self]
  [fixture: block/db-edge-different-kinds]
  [fixture: block/db-edge-defined-before]
  [fixture: block/db-edge-new-shape]
  [fixture: block/db-edge-start-shape]
  [fixture: block/db-edge-both-shapes]
  [fixture: block/db-edge-to-composite]
  [fixture: block/db-edge-from-composite-child]
  [fixture: block/db-edge-inside-composite]
  [fixture: block/db-edge-across-composites]
  [fixture: block/db-edge-edge-in-composite-order]
  [fixture: block/db-edge-proto]
  [fixture: block/db-edge-root]
  [fixture: block/db-edge-to-columns]
  [fixture: block/gram-edge-to-end]
  [fixture: block/gram-edge-start-lt-invisible]
  [fixture: block/gram-edge-start-lt-invisible-glued]
  [fixture: block/db-definitions-edges-three]
  [fixture: block/db-proto-proto-edge]
  [fixture: block/db-proto-root-edge-end]
- 辺の連鎖 `A --> B --> C` は誤って読まれます。
  文法は最初の辺を次の辺の始まりに使うので、始まりには `id` がありません。
  そのため Db は欄のないブロックと、`start` のない辺と、
  最後の node `C` だけを持ちます。
  その前の node は、その間の辺ごと失われます。
  最後の辺の label と矢印は残ります。
  2 つの連鎖は、欄のない 1 つのブロックになります。
  連鎖のあとに使った node は別のブロックです。
  連鎖の途中の node への `style` も例外になります。
  要約はそのブロックを `{}`、辺を `start` のないものとして示します。
  [fixture: block/db-edge-chain]
  [fixture: block/db-edge-chain-open]
  [fixture: block/db-edge-chain-four]
  [fixture: block/db-edge-chain-labels]
  [fixture: block/db-edge-chain-twice]
  [fixture: block/db-edge-chain-then-node]
  [fixture: block/db-edge-chain-in-block]
  [fixture: block/gram-style-on-chain]
  [fixture: block/gram-style-on-chain-middle]
  [fixture: block/db-style-on-undefined-chain-end]
- `classDef 名前 スタイル` はクラスを定義します。
  名前は単語の文字（ASCII の英字、数字、`_`）の 1 文字以上で、
  スタイルは行の残りを `,` で分け、それぞれ前後の空白を除いたものです。
  `default`、`class`、`end`、`__proto__`、`constructor` は他の名前と同じです。
  `DEFAULT`、`-` や `:` を含む名前、ASCII の外の文字を含む名前は拒否されます。
  名前のない `classDef`、スタイルのないもの、別の大文字小文字のもの、
  単語に付いたものも拒否されます。
  キーワードの後ろにはタブと改行を置け、
  スタイルは次の行から始めてもかまいません。
  先頭や末尾の `,` は空のスタイルを残します。
  クラスを離れた位置で定義し直しても、すべての定義のスタイルを順に残し、
  クラスの順では最初の位置に残ります。
  同じスタイルを 2 回書けば 2 つ残ります。
  クラスは、`classDef` がどこにあっても図全体で同じです。
  composite の中でも同じです。
  [fixture: block/db-class-def-and-apply]
  [fixture: block/db-class-def-two-styles]
  [fixture: block/db-class-def-spaces-around-styles]
  [fixture: block/db-class-def-directive-before-comma]
  [fixture: block/db-class-def-empty-style]
  [fixture: block/db-class-def-leading-comma]
  [fixture: block/gram-class-def-no-style]
  [fixture: block/gram-class-def-spaces-only]
  [fixture: block/gram-class-def-no-name]
  [fixture: block/db-class-def-twice]
  [fixture: block/db-class-def-twice-same]
  [fixture: block/db-class-def-three]
  [fixture: block/db-class-def-color]
  [fixture: block/db-class-def-color-fill]
  [fixture: block/db-class-def-default]
  [fixture: block/gram-class-def-default-upper]
  [fixture: block/db-class-def-digits]
  [fixture: block/db-class-def-underscore]
  [fixture: block/gram-class-def-dash]
  [fixture: block/gram-class-def-non-ascii]
  [fixture: block/db-class-def-proto]
  [fixture: block/db-class-def-constructor]
  [fixture: block/db-class-def-keyword-names]
  [fixture: block/db-class-def-keyword-end]
  [fixture: block/gram-class-def-name-colon]
  [fixture: block/gram-class-def-upper-case]
  [fixture: block/gram-class-def-lower-case]
  [fixture: block/db-class-def-tab]
  [fixture: block/db-class-def-line-feed-after-keyword]
  [fixture: block/db-class-def-line-feed-after-name]
  [fixture: block/gram-class-def-glued]
  [fixture: block/db-class-def-in-block]
  [fixture: block/db-class-def-after-use]
  [fixture: block/db-class-def-undefined-use]
  [fixture: block/db-definitions-class-def-three]
  [fixture: block/db-definitions-class-def-three-others]
  [fixture: block/db-proto-proto-class-def]
  [fixture: block/db-proto-proto-class-twice]
  [fixture: block/db-proto-constructor-class-def]
- `classDef` のスタイルの中の `#`、引用符、HTML、`%%` はテキストです。
  ディレクティブは取り除かれ、文字参照はその代替の文字列として読みます。
  Db は、各スタイルの最初の `;` を取り除きます。
  mermaid.js の行の規則は、
  `:` と `#` のある行の最後の `;` を落とし
  （`style:#x;y` は `style:#xy` になります）、
  字句解析器が読む前の行に働きます。
  そのため `fill:#f00;` の末尾の `;` はなくなり、
  2 つのスタイルの間の `;` は 2 つをつなげます。
  `fill:#f00;,stroke:#000` は 2 つのスタイルのままで、
  末尾の空白と `;` は落とされます。
  `#f00` の後ろの 2 つ目の `;` は文字参照の終わりとして読まれます。
  [fixture: block/db-class-def-semicolon-end]
  [fixture: block/db-class-def-semicolon-middle]
  [fixture: block/db-class-def-semicolon-comma]
  [fixture: block/db-class-def-two-semicolons]
  [fixture: block/db-class-def-space-semicolon]
  [fixture: block/db-class-def-hash]
  [fixture: block/db-class-def-comment]
  [fixture: block/db-class-def-directive]
  [fixture: block/db-class-def-quotes]
  [fixture: block/db-class-def-html]
  [fixture: block/db-class-def-entity]
  [fixture: block/db-class-def-colon-hash-semicolon]
  [fixture: block/db-class-def-nbsp]
  [fixture: block/db-semicolon-in-class-def]
  [fixture: block/db-semicolon-class-def-then-node]
- `class ids 名前` は、クラスを id の node に適用します。
  id は単語の文字の 1 文字以上で、`,` で分け、コンマの前に空白は置きません。
  クラス名は各 node の `classes` に、文の順に残ります。
  繰り返しても残り、`classDef` が定義していなくても残ります。
  行の残りを前後の空白を除いたものが、1 つのテキストとしてのクラス名です。
  そのため `c,d` と `c d` は 1 つの名前で、名前は `;`、`#`、`%%` を含められ、
  名前のない `class A` は空の名前を与えます。
  id と名前は同じ行に書き、キーワードの後ろにタブと改行を置けます。
  別の大文字小文字のものや、単語に付いたものはキーワードでなく、
  `class` だけは拒否されます。
  `__proto__` と `constructor` は他の名前と同じです。
  [fixture: block/db-class-apply-two]
  [fixture: block/db-class-apply-same-twice]
  [fixture: block/db-class-apply-names-list]
  [fixture: block/db-class-apply-names-spaces]
  [fixture: block/db-class-apply-no-name]
  [fixture: block/db-class-apply-no-name-spaces]
  [fixture: block/gram-class-apply-no-id]
  [fixture: block/db-class-apply-name-upper]
  [fixture: block/db-class-apply-proto-class]
  [fixture: block/db-class-apply-constructor-class]
  [fixture: block/db-class-apply-semicolon]
  [fixture: block/db-class-apply-hash]
  [fixture: block/db-class-apply-comment]
  [fixture: block/db-class-apply-directive]
  [fixture: block/db-class-apply-trailing-spaces]
  [fixture: block/db-class-apply-nbsp]
  [fixture: block/db-class-apply-tab]
  [fixture: block/db-class-apply-line-feed-after-keyword]
  [fixture: block/db-class-apply-line-feed-after-ids]
  [fixture: block/db-class-apply-upper-case-keyword]
  [fixture: block/db-class-apply-glued]
  [fixture: block/db-class-apply-lower-keyword-id]
  [fixture: block/db-class-apply-space-shape]
  [fixture: block/db-class-apply-edge]
  [fixture: block/db-definitions-class-three]
  [fixture: block/db-definitions-class-three-ids]
  [fixture: block/db-proto-to-string-class]
  [fixture: block/db-proto-proto-directions]
- `class` の文の id は、コンマごとに分けられ、
  そのまま（空白を除かずに）探されます。
  `class A,B c` と `class A,B,C c` は各 node にクラスを適用します。
  `class A, B c` は ` B` を探してブロックが見つからず、
  id `B` の新しいブロックを作ります。
  それは表の項目 `B` の場所に入り、図には載りません。
  図の中の B にクラスは付かず、
  あとの `style B` や `B` の shape は新しいブロックを見つけます。
  コンマの前の空白は id を終え、
  `class A ,B c` は A にクラス `,B c` を適用します。
  id の中の `;` や `-` は id を終えます。
  大文字小文字の違う id は別の id です。
  コンマの後ろの空白は改行でもよく、
  id のない `class` が、テキストの終わりの前にあれば拒否されます。
  コンマの後ろのコメント行やディレクティブは id から除かれ、
  その前の空白が残ります。
  id `root` は図を持つブロックで、
  composite や composite の中の node へのクラスは、そこに残ります。
  別の composite の中の文からでも同じです。
  [fixture: block/db-class-apply-list]
  [fixture: block/db-class-apply-list-spaces]
  [fixture: block/db-class-apply-list-space-before-comma]
  [fixture: block/db-class-apply-list-three]
  [fixture: block/db-class-apply-list-trailing-comma]
  [fixture: block/db-class-apply-list-spaces-then-style]
  [fixture: block/db-class-apply-list-spaces-then-edge]
  [fixture: block/db-class-apply-list-spaces-then-shape]
  [fixture: block/gram-class-apply-no-id-end]
  [fixture: block/db-class-apply-line-feed-after-comma]
  [fixture: block/db-class-apply-comment-line-after-comma]
  [fixture: block/db-class-apply-directive-after-comma]
  [fixture: block/db-class-apply-id-semicolon]
  [fixture: block/db-class-apply-id-dash]
  [fixture: block/db-class-apply-id-case]
  [fixture: block/db-class-apply-proto-id]
  [fixture: block/db-class-apply-root]
  [fixture: block/db-composite-class-on]
  [fixture: block/db-composite-class-inside]
  [fixture: block/db-class-apply-in-block]
  [fixture: block/db-class-apply-in-block-outer]
- まだどの文も定義していない id への `class` の文は、
  type が `na` のその id のブロックを作ります。
  要約はそれを `unplaced` に載せます。
  あとからその id を定義しても（node、shape、辺、composite）、
  ブロックは子の並びに加わらず、type と label が変わるだけです。
  そのため node は図の外に残り、幅は失われます。
  そのような id への 2 つのクラスは順に残り、
  そのような 2 つの id への `class` は 2 つのブロックを作ります。
  順は id の順です。
  前に定義した node への `class` は図の中に残ります。
  composite の中でも同じです。
  composite の中の、あとで定義する node への `class` は、
  図の外に残るブロックを作ります。
  [fixture: block/db-class-apply-undefined-id]
  [fixture: block/db-class-apply-before-node]
  [fixture: block/db-class-apply-before-node-shape]
  [fixture: block/db-class-apply-before-node-width]
  [fixture: block/db-class-apply-before-edge]
  [fixture: block/db-class-apply-before-block]
  [fixture: block/db-class-apply-undefined-twice]
  [fixture: block/db-class-apply-undefined-list]
  [fixture: block/db-class-apply-mixed-list]
  [fixture: block/db-class-apply-in-block-later]
  [fixture: block/db-definitions-composite-then-shape-then-composite]
- `style id スタイル` は node `id` のスタイルを決めます。
  スタイルは行の残りを `,` で分けたもので、前後の空白は除かないので、
  コンマの周りの空白はスタイルに残ります。
  空白で始まるスタイルは、
  `color:` で始まるスタイルとは別のものとして描画に渡されます
  （[`getStylesFromArray()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L443-L459)）。
  `style` はその node への前の `style` のスタイルを置き換えます。
  スタイルのない `style` や空白だけの `style` は何も変えず、
  `,` だけは空のスタイルを 2 つ与えます。
  行の残りの両端の空白は捨てられるので、
  最初の `,` の前と最後の `,` の後ろが空白だけなら、その部分は空です。
  2 つの `,` の間の空白だけの部分は、その空白のスタイルで、
  `classDef` ではそれが空のスタイルに切り詰められます。
  `,` の前のディレクティブはスタイルから除かれ、両側の空白が残ります。
  id は単語の文字の 1 文字以上で、
  前の文がまだ定義していない id への `style` は拒否されます。
  Db がブロックを見つけられず、`TypeError` を投げるからです。
  コンマで分けない id の並び、どの文も定義しないブロック、
  連鎖で失われたブロックの id、`space` もそうです。
  `class` が作ったブロック、composite、id `root`、
  composite の中から外の node への `style` は受理されます。
  キーワードの後ろにタブと改行を置けますが、
  スタイルは id と同じ行に書かなければなりません。
  大文字のものや単語に付いたものはキーワードではありません。
  id のない `style` が、テキストの終わりの前にあれば拒否されます。
  [fixture: block/db-style-plain]
  [fixture: block/db-style-two]
  [fixture: block/db-style-spaces]
  [fixture: block/db-style-spaces-at-line-ends]
  [fixture: block/db-style-whitespace-only-between-commas]
  [fixture: block/db-style-tab-only-between-commas]
  [fixture: block/db-style-whitespace-only-first]
  [fixture: block/db-style-whitespace-only-last]
  [fixture: block/db-style-directive-before-comma]
  [fixture: block/db-class-def-whitespace-only-between-commas]
  [fixture: block/db-style-leading-space]
  [fixture: block/db-style-trailing-space]
  [fixture: block/db-style-none]
  [fixture: block/db-style-spaces-only]
  [fixture: block/db-style-only-comma]
  [fixture: block/db-style-twice]
  [fixture: block/db-style-then-none]
  [fixture: block/db-definitions-style-three]
  [fixture: block/db-definitions-style-three-empty-middle]
  [fixture: block/gram-style-undefined]
  [fixture: block/gram-style-defined-after]
  [fixture: block/gram-style-list]
  [fixture: block/gram-style-list-spaces]
  [fixture: block/gram-style-list-undefined]
  [fixture: block/gram-style-space]
  [fixture: block/gram-style-no-id]
  [fixture: block/gram-style-no-id-line-feed]
  [fixture: block/db-style-class-made]
  [fixture: block/db-style-after-class-undefined]
  [fixture: block/db-style-after-class-list-spaces]
  [fixture: block/db-style-composite]
  [fixture: block/db-style-root]
  [fixture: block/db-style-in-composite]
  [fixture: block/db-composite-style-on]
  [fixture: block/db-composite-style-inside]
  [fixture: block/db-composite-style-outer-inside]
  [fixture: block/gram-composite-style-later-outer]
  [fixture: block/db-style-before-edge]
  [fixture: block/db-style-proto-id]
  [fixture: block/db-style-constructor-id]
  [fixture: block/db-proto-proto-style-id]
  [fixture: block/db-style-name-only]
  [fixture: block/db-style-tab]
  [fixture: block/db-style-line-feed-after-keyword]
  [fixture: block/gram-style-line-feed-after-id]
  [fixture: block/gram-style-upper-case]
  [fixture: block/gram-style-glued]
- `style` のスタイルの中の、単語の付いた `#`、引用符、HTML、
  `%%` はテキストです。
  ディレクティブは取り除かれ、文字参照はその代替の文字列として読みます。
  行の規則は、`:` と `#` のある行の最後の `;` を落とします。
  そのため `fill:#f00;` は `fill:#f00`、
  `fill:#f00;stroke:#333` は 1 つのスタイル、
  `fill:#f00;,stroke:#333` は 2 つのスタイルで、
  末尾の空白と `;` は落とされます。
  `#` のない行は `;` を残します。
  [fixture: block/db-style-semicolon-end]
  [fixture: block/db-style-semicolon-middle]
  [fixture: block/db-style-semicolon-comma]
  [fixture: block/db-style-empty-style]
  [fixture: block/db-style-line-rule-hash]
  [fixture: block/db-style-entity]
  [fixture: block/db-style-comment]
  [fixture: block/db-style-directive]
  [fixture: block/db-style-quotes]
  [fixture: block/db-style-nbsp]
  [fixture: block/db-semicolon-in-style]
- id `root` は図を持つブロックの id なので、その id への文は、
  そのブロックに働きます。
  node `root`、幅のある `root`、composite の中の `root` は何も変えません。
  `root["x"]` は、図を持つブロックに label `x` と shape の type を与え、
  `columns` と子は保たれます。
  `block:root` はそのブロックに label `""` を与え、
  composite のブロックを `unplaced` に別に載せます。
  `class root c` はクラスを、`style root` はスタイルを与えます。
  辺は `root` から始めても、`root` で終えてもかまいません。
  [fixture: block/db-proto-root]
  [fixture: block/db-proto-root-twice]
  [fixture: block/db-proto-root-width]
  [fixture: block/db-proto-root-label]
  [fixture: block/db-proto-root-columns]
  [fixture: block/db-proto-root-composite-child]
  [fixture: block/db-composite-root-id]
  [fixture: block/db-class-apply-root]
  [fixture: block/db-proto-root-style]
  [fixture: block/db-edge-root]
  [fixture: block/db-proto-root-edge-end]
- `Object.prototype` の名前は、他の id と同じ id です。
  `__proto__`、`constructor`、`toString`、`hasOwnProperty`、`valueOf` を、
  node の id（shape、幅、クラス付きでも）、composite の id、辺の端、label、
  クラスの名前、`class` の名前、`style` に使えます。
  Db はブロックとクラスを `Map` に持つので、どれも prototype に働きません。
  [fixture: block/db-proto-proto]
  [fixture: block/db-proto-constructor]
  [fixture: block/db-proto-to-string]
  [fixture: block/db-proto-has-own-property]
  [fixture: block/db-proto-value-of]
  [fixture: block/db-proto-proto-twice]
  [fixture: block/db-proto-proto-shape]
  [fixture: block/db-proto-proto-width]
  [fixture: block/db-proto-proto-composite-child]
  [fixture: block/db-proto-proto-edge-label]
  [fixture: block/db-proto-proto-undefined-class]
  [fixture: block/db-label-proto]
  [fixture: block/db-label-constructor]
  [fixture: block/db-composite-proto-id]
  [fixture: block/db-composite-constructor-id]
  [fixture: block/db-arrow-proto]
  [fixture: block/db-class-apply-proto-id]
  [fixture: block/db-class-apply-proto-class]
  [fixture: block/db-class-apply-constructor-class]
  [fixture: block/db-style-proto-id]
  [fixture: block/db-style-constructor-id]
  [fixture: block/db-class-def-proto]
  [fixture: block/db-class-def-constructor]
  [fixture: block/db-edge-proto]
- コメント行は、あらゆる種類の空白（U+FEFF、U+00A0、U+3000、
  U+2028 も含む）のあとに `%%` とその後ろの 1 文字以上で始まります。
  改行ごと取り除かれ、どこに書いてもそうです。
  見出しの前後、テキストの終わり、composite の中、辺や文の部品の間、
  文字列の中がその例です。
  改行、CRLF、単独の CR で終わり、U+2028、U+2029、U+0085 では終わりません。
  `%%` だけ、`%` と単語、`#` と単語はコメントでなく、node です。
  コメント行の中は読まれず、中の引用符、矢印、キーワードは何もしません。
  [fixture: block/db-comment-line]
  [fixture: block/db-comment-line-indented]
  [fixture: block/db-comment-line-tab]
  [fixture: block/db-comment-line-glued]
  [fixture: block/db-comment-line-bare]
  [fixture: block/db-comment-line-bare-spaces]
  [fixture: block/db-comment-line-single-percent]
  [fixture: block/db-comment-line-hash]
  [fixture: block/db-comment-line-triple]
  [fixture: block/db-comment-line-first]
  [fixture: block/db-comment-line-last]
  [fixture: block/db-comment-line-last-no-line-feed]
  [fixture: block/gram-comment-line-only]
  [fixture: block/db-comment-lines-two]
  [fixture: block/db-comment-before-header-and-after]
  [fixture: block/db-comment-inside-composite]
  [fixture: block/db-comment-between-composite-lines]
  [fixture: block/db-comment-between-edge-parts]
  [fixture: block/db-comment-between-id-and-width]
  [fixture: block/db-comment-crlf]
  [fixture: block/db-comment-cr]
  [fixture: block/db-comment-ls-inside]
  [fixture: block/db-comment-ps-inside]
  [fixture: block/db-comment-nel-inside]
  [fixture: block/db-comment-bom-before]
  [fixture: block/db-comment-nbsp-before]
  [fixture: block/db-comment-ideographic-before]
  [fixture: block/db-comment-ls-before]
  [fixture: block/db-comment-directive-like]
  [fixture: block/db-comment-proto]
  [fixture: block/db-comment-long]
  [fixture: block/db-comment-unicode]
  [fixture: block/db-comment-markers-inside]
  [fixture: block/db-comment-quote-unclosed-inside]
  [fixture: block/db-label-comment-line]
  [fixture: block/db-label-comment-line-spaced]
  [fixture: block/db-edge-label-comment-line]
- 行の初めにない `%%` はコメントでありません。
  node、辺、`columns`、`end` の後ろでは node で、
  その後ろのテキストも node です。
  単語に付くとその id の一部で、文字列の中では label の一部です。
  `class`、`style`、`classDef` では、クラス名かスタイルの一部です。
  [fixture: block/db-comment-after-node]
  [fixture: block/db-comment-after-node-glued]
  [fixture: block/db-comment-after-edge]
  [fixture: block/db-comment-after-columns]
  [fixture: block/db-composite-end-comment]
  [fixture: block/db-comment-inside-string-start]
  [fixture: block/db-label-comment]
  [fixture: block/db-comment-after-style]
  [fixture: block/db-class-apply-comment]
  [fixture: block/db-class-def-comment]
  [fixture: block/db-style-comment]
  [fixture: block/db-name-percent-percent]
  [fixture: block/db-tail-node-comment]
  [fixture: block/db-tail-columns-comment]
  [fixture: block/db-tail-space-comment]
  [fixture: block/db-tail-class-comment]
  [fixture: block/db-tail-class-def-comment]
  [fixture: block/db-tail-style-comment]
- `;` は区切りでなく、`#` はコメントを始めません。
  `;` は、触れている id の一部です。
  空白、shape、幅、block arrow、`columns`、`space`、`end` の後ろでは、
  単独の node になります。
  クラス名とスタイルの中では、それらの一部で、`#` も同じです。
  行の残りを取る文（`class`、`style`、`classDef`）は、
  その行の後ろのものを保ちます。
  空白と `;`、2 つの `;`、`%%`、`#` は、クラス名かスタイルの一部です。
  ただし、行の規則や Db が取り除く `;` は別です。
  行の規則はその `;` を id やキーワードの中でも落とします。
  `A["style:#a"] B;C` の id は `BC` で、
  `A["style:#a"] col;umns 2` は `columns 2` です。
  [fixture: block/db-semicolon-after-node]
  [fixture: block/db-semicolon-between]
  [fixture: block/db-semicolon-space-before]
  [fixture: block/db-semicolon-alone]
  [fixture: block/db-semicolon-double]
  [fixture: block/db-semicolon-after-width]
  [fixture: block/db-semicolon-after-shape]
  [fixture: block/db-semicolon-after-edge]
  [fixture: block/db-semicolon-separates-statements-line]
  [fixture: block/db-tail-node-semicolon]
  [fixture: block/div-ignored-semicolon-in-id]
  [fixture: block/div-ignored-semicolon-in-keyword]
  [fixture: block/db-tail-node-space-semicolon]
  [fixture: block/db-tail-node-hash]
  [fixture: block/db-tail-node-shape-space-semicolon]
  [fixture: block/db-tail-node-shape-two-semicolons]
  [fixture: block/db-tail-node-width-space-semicolon]
  [fixture: block/db-tail-node-width-two-semicolons]
  [fixture: block/db-tail-edge-space-semicolon]
  [fixture: block/db-tail-edge-two-semicolons]
  [fixture: block/db-tail-edge-hash]
  [fixture: block/db-tail-block-arrow-semicolon]
  [fixture: block/db-tail-block-arrow-space-semicolon]
  [fixture: block/db-tail-block-arrow-two-semicolons]
  [fixture: block/db-tail-columns-semicolon]
  [fixture: block/db-tail-columns-space-semicolon]
  [fixture: block/db-tail-columns-two-semicolons]
  [fixture: block/db-tail-columns-hash]
  [fixture: block/db-tail-space-space-semicolon]
  [fixture: block/db-tail-space-two-semicolons]
  [fixture: block/db-tail-space-hash]
  [fixture: block/db-tail-space-width-semicolon]
  [fixture: block/db-tail-class-space-semicolon]
  [fixture: block/db-tail-class-two-semicolons]
  [fixture: block/db-tail-class-hash]
  [fixture: block/db-tail-style-semicolon]
  [fixture: block/db-tail-style-space-semicolon]
  [fixture: block/db-tail-style-two-semicolons]
  [fixture: block/db-tail-style-hash]
  [fixture: block/db-tail-class-def-semicolon]
  [fixture: block/db-tail-class-def-space-semicolon]
  [fixture: block/db-tail-class-def-two-semicolons]
  [fixture: block/db-tail-class-def-hash]
  [fixture: block/db-tail-composite-end-space-semicolon]
  [fixture: block/db-tail-composite-end-two-semicolons]
  [fixture: block/db-tail-composite-end-hash]
  [fixture: block/db-tail-composite-end-keyword-semicolon]
  [fixture: block/db-tail-composite-end-keyword-hash]
  [fixture: block/gram-tail-composite-line-semicolon]
- ディレクティブ `%%{...}%%` は、どこにあっても取り除かれ、
  両側の部分がつながります。
  id の中、文字列の中、見出しの中、ブロック矢印の方向の中、
  キーワード `columns`、`class`、`end` の中、
  id と幅や shape の間、幅の `:` や `space:` と数の間、
  shape やブロック矢印のラベルの前後、文の末尾がその例です。
  どの名前のディレクティブも取り除かれ、複数行にわたっても、
  2 つ続いても同じです。
  単語を持たない `%%{}%%` はディレクティブでなく、中を読めず拒否されます。
  閉じていないディレクティブは、テキストの残りごと取り除きます。
  テキストの終わりでは他を取らず、文の前にあると図に文が残らず、拒否されます。
  文字列の中で行を単独で占めるディレクティブは、前後の改行を残します。
  見出しの後ろがディレクティブだけのテキストは拒否されます。
  [fixture: block/db-directive-init-line]
  [fixture: block/db-directive-init-before-header]
  [fixture: block/db-directive-init-block-config]
  [fixture: block/db-directive-wrap]
  [fixture: block/db-directive-not-init]
  [fixture: block/db-directive-multi-line]
  [fixture: block/db-directive-two]
  [fixture: block/div-directive-in-id]
  [fixture: block/db-directive-between-ids]
  [fixture: block/db-directive-at-end-of-line]
  [fixture: block/db-directive-inside-string]
  [fixture: block/div-directive-inside-keyword]
  [fixture: block/div-directive-inside-class-keyword]
  [fixture: block/div-directive-inside-header]
  [fixture: block/div-directive-inside-direction]
  [fixture: block/db-directive-inside-shape]
  [fixture: block/db-directive-after-shape-label]
  [fixture: block/db-directive-before-block-arrow-label]
  [fixture: block/db-directive-after-block-arrow-label]
  [fixture: block/db-directive-between-colon-and-width]
  [fixture: block/db-directive-between-space-colon-and-width]
  [fixture: block/db-directive-glued-to-id]
  [fixture: block/db-directive-glued-to-width]
  [fixture: block/db-directive-glued-to-edge]
  [fixture: block/db-directive-line-feed-inside-id]
  [fixture: block/db-directive-spaces-around]
  [fixture: block/db-directive-class-def-line]
  [fixture: block/db-directive-after-end-of-text]
  [fixture: block/gram-directive-unclosed]
  [fixture: block/db-directive-unclosed-end-of-text]
  [fixture: block/gram-directive-unclosed-word-next-line]
  [fixture: block/gram-directive-empty]
  [fixture: block/gram-directive-only]
  [fixture: block/db-label-directive]
  [fixture: block/db-label-directive-line]
  [fixture: block/db-edge-label-directive]
  [fixture: block/db-tail-node-directive]
  [fixture: block/db-tail-node-directive-unclosed]
  [fixture: block/db-tail-node-shape-directive]
  [fixture: block/db-tail-node-width-directive]
  [fixture: block/db-tail-edge-directive]
  [fixture: block/db-tail-edge-label-directive]
  [fixture: block/db-tail-block-arrow-directive]
  [fixture: block/db-tail-columns-directive]
  [fixture: block/db-tail-space-directive]
  [fixture: block/db-tail-class-directive]
  [fixture: block/db-tail-style-directive]
  [fixture: block/db-tail-class-def-directive-unclosed]
  [fixture: block/db-tail-composite-end-directive]
  [fixture: block/db-tail-composite-end-keyword-directive]
- 見出しの前のフロントマターは取り除かれます。
  Db にタイトルがないので `title` は残らず、
  `block` を含む設定も要約を変えません。
  空のもの、閉じていないもの、インデントされたもの、コメントのあとのもの、
  見出しの後ろのものはフロントマターでなく、拒否されます。
  [fixture: block/db-frontmatter-config-block]
  [fixture: block/db-frontmatter-look]
  [fixture: block/db-frontmatter-html-in-title]
  [fixture: block/db-frontmatter-crlf]
  [fixture: block/header-after-frontmatter]
  [fixture: block/header-after-frontmatter-and-comment]
  [fixture: block/gram-frontmatter-empty]
  [fixture: block/gram-frontmatter-unclosed]
  [fixture: block/gram-frontmatter-indented]
  [fixture: block/gram-frontmatter-comment-before]
  [fixture: block/gram-frontmatter-after-header]
- `accTitle:`、`accDescr:`、`accDescr {` は block 図の文でなく、
  字句解析器はそれをキーワードとして読みますが、文法に規則がなく、拒否されます。
  `accTitle` だけは node、`title t` は node `title` と `t`、
  `title: t` は拒否されます。
  [fixture: block/gram-acc-acc-title]
  [fixture: block/gram-acc-acc-descr]
  [fixture: block/gram-acc-acc-descr-block]
  [fixture: block/db-acc-acc-title-word]
  [fixture: block/gram-acc-acc-title-space]
  [fixture: block/gram-acc-acc-title-upper]
  [fixture: block/gram-acc-acc-title-glued]
  [fixture: block/db-acc-title-word]
  [fixture: block/gram-acc-title-colon]
- 文は、空白だけを挟んで続きます。
  1 行に、node、辺、`columns`、`space` ブロック、composite を、
  何個でもどの順でも置けます。
  `class`、`style`、`classDef` は行の残りを取るので、
  その行の後ろのものはそれらの一部です。
  インデントに意味はなく、行は空でも空白だけでもよく、
  テキストの終わりも同じです。
  キーワードを含む単語は node です（`friend`、`endless`、`mycolumns`、
  `blockade`、`classy`、`styled`）。
  `columns:2` は幅 2 の node `columns` で、制御文字と DEL は id の一部です。
  [fixture: block/db-statement-many-line]
  [fixture: block/db-statement-mixed-line]
  [fixture: block/db-statement-columns-between]
  [fixture: block/db-statement-statements-then-class]
  [fixture: block/db-statement-statements-then-style]
  [fixture: block/db-statement-statements-then-class-def]
  [fixture: block/db-statement-edge-then-class]
  [fixture: block/db-statement-class-then-node]
  [fixture: block/db-statement-order-class-def-last]
  [fixture: block/db-statement-long-diagram]
  [fixture: block/db-statement-tab-indent]
  [fixture: block/db-statement-no-indent]
  [fixture: block/db-statement-deep-indent]
  [fixture: block/db-statement-trailing-whitespace-lines]
  [fixture: block/db-statement-final-spaces]
  [fixture: block/db-statement-final-lines]
  [fixture: block/db-statement-leading-blank-lines]
  [fixture: block/db-statement-control]
  [fixture: block/db-statement-delete]
  [fixture: block/db-statement-keywords-as-ids]
  [fixture: block/gram-statement-block-as-node]
  [fixture: block/db-statement-end-keyword-inside-id]
  [fixture: block/db-statement-end-prefix-id]
  [fixture: block/db-statement-keywords-inside-ids]
- node の id の中の空白は、タブ、改行、CR、CRLF、U+00A0、U+3000、U+FEFF、
  U+2028、U+2029、改ページ、垂直タブ、空白で、2 つの id を分けます。
  U+0085 は分けず、2 つの単語を 1 つの id につなげます。
  composite の id の中では、空白が id を終え、
  残りは composite の中の node です。
  [fixture: block/db-grid-tab-id]
  [fixture: block/db-grid-tab-composite-id]
  [fixture: block/db-grid-lf-id]
  [fixture: block/db-grid-lf-composite-id]
  [fixture: block/db-grid-cr-id]
  [fixture: block/db-grid-cr-composite-id]
  [fixture: block/db-grid-crlf-id]
  [fixture: block/db-grid-crlf-composite-id]
  [fixture: block/db-grid-ls-id]
  [fixture: block/db-grid-ls-composite-id]
  [fixture: block/db-grid-ps-id]
  [fixture: block/db-grid-ps-composite-id]
  [fixture: block/db-grid-nbsp-id]
  [fixture: block/db-grid-nbsp-composite-id]
  [fixture: block/db-grid-bom-id]
  [fixture: block/db-grid-bom-composite-id]
  [fixture: block/db-grid-ideographic-id]
  [fixture: block/db-grid-ideographic-composite-id]
  [fixture: block/db-grid-ff-id]
  [fixture: block/db-grid-ff-composite-id]
  [fixture: block/db-grid-vt-id]
  [fixture: block/db-grid-vt-composite-id]
  [fixture: block/db-grid-spaces-id]
  [fixture: block/db-grid-spaces-composite-id]
  [fixture: block/db-grid-nel-id]
  [fixture: block/db-grid-nel-composite-id]
- 文字列（node、block arrow、辺、
  composite の label）の中の空白はテキストの一部です。
  ただし、単独の CR と CRLF は改行になります。
  `;`、`#`、`%`、`:`、`,`、`-`、`|`、`'`、バッククォート、バックスラッシュ、
  括弧、波括弧、`<`、`>`、`=`、
  続く句読点、矢印、`%%`、HTML タグ、`&amp;`、キーワード、`__proto__`、
  `constructor`、`root`、
  ASCII の外の文字、絵文字、数字もテキストの一部です。
  ただし `"` は文字列を終え、その文字列は拒否されます。
  文字列の中のコメント行と、ディレクティブは取り除かれます。
  行を単独で占めるディレクティブは前後の改行を残します。
  文字参照は代替の文字列として読み、HTML の属性の引用符は `'` として読みます。
  行の規則は `style:#x;y` と `classDef:#x;y` の最後の `;` を落とします。
  [fixture: block/db-label-tab]
  [fixture: block/db-grid-tab-block-arrow-label]
  [fixture: block/db-grid-tab-edge-label]
  [fixture: block/db-grid-tab-composite-label]
  [fixture: block/db-label-line-feed]
  [fixture: block/db-grid-lf-block-arrow-label]
  [fixture: block/db-edge-label-line-feed]
  [fixture: block/db-grid-lf-composite-label]
  [fixture: block/db-label-cr]
  [fixture: block/db-grid-cr-block-arrow-label]
  [fixture: block/db-grid-cr-edge-label]
  [fixture: block/db-grid-cr-composite-label]
  [fixture: block/db-label-crlf]
  [fixture: block/db-grid-crlf-block-arrow-label]
  [fixture: block/db-grid-crlf-edge-label]
  [fixture: block/db-grid-crlf-composite-label]
  [fixture: block/db-label-ls]
  [fixture: block/db-grid-ls-block-arrow-label]
  [fixture: block/db-grid-ls-edge-label]
  [fixture: block/db-grid-ls-composite-label]
  [fixture: block/db-label-ps]
  [fixture: block/db-grid-ps-block-arrow-label]
  [fixture: block/db-grid-ps-edge-label]
  [fixture: block/db-grid-ps-composite-label]
  [fixture: block/db-label-nbsp]
  [fixture: block/db-grid-nbsp-block-arrow-label]
  [fixture: block/db-grid-nbsp-edge-label]
  [fixture: block/db-grid-nbsp-composite-label]
  [fixture: block/db-grid-bom-label]
  [fixture: block/db-grid-bom-block-arrow-label]
  [fixture: block/db-grid-bom-edge-label]
  [fixture: block/db-grid-bom-composite-label]
  [fixture: block/db-label-ideographic]
  [fixture: block/db-grid-ideographic-block-arrow-label]
  [fixture: block/db-grid-ideographic-edge-label]
  [fixture: block/db-grid-ideographic-composite-label]
  [fixture: block/db-grid-ff-label]
  [fixture: block/db-grid-ff-block-arrow-label]
  [fixture: block/db-grid-ff-edge-label]
  [fixture: block/db-grid-ff-composite-label]
  [fixture: block/db-grid-vt-label]
  [fixture: block/db-grid-vt-block-arrow-label]
  [fixture: block/db-grid-vt-edge-label]
  [fixture: block/db-grid-vt-composite-label]
  [fixture: block/db-grid-spaces-label]
  [fixture: block/db-grid-spaces-block-arrow-label]
  [fixture: block/db-grid-spaces-edge-label]
  [fixture: block/db-grid-spaces-composite-label]
  [fixture: block/db-label-nel]
  [fixture: block/db-grid-nel-block-arrow-label]
  [fixture: block/db-grid-nel-edge-label]
  [fixture: block/db-grid-nel-composite-label]
  [fixture: block/db-label-semicolon]
  [fixture: block/db-grid-semicolon-block-arrow-label]
  [fixture: block/db-grid-semicolon-edge-label]
  [fixture: block/db-grid-semicolon-composite-label]
  [fixture: block/db-label-hash]
  [fixture: block/db-grid-hash-block-arrow-label]
  [fixture: block/db-grid-hash-edge-label]
  [fixture: block/db-grid-hash-composite-label]
  [fixture: block/db-label-percent]
  [fixture: block/db-grid-percent-block-arrow-label]
  [fixture: block/db-grid-percent-edge-label]
  [fixture: block/db-grid-percent-composite-label]
  [fixture: block/db-label-colon]
  [fixture: block/db-grid-colon-block-arrow-label]
  [fixture: block/db-grid-colon-edge-label]
  [fixture: block/db-grid-colon-composite-label]
  [fixture: block/db-grid-comma-label]
  [fixture: block/db-grid-comma-block-arrow-label]
  [fixture: block/db-grid-comma-edge-label]
  [fixture: block/db-grid-comma-composite-label]
  [fixture: block/db-grid-dash-label]
  [fixture: block/db-grid-dash-block-arrow-label]
  [fixture: block/db-grid-dash-edge-label]
  [fixture: block/db-grid-dash-composite-label]
  [fixture: block/db-grid-pipe-label]
  [fixture: block/db-grid-pipe-block-arrow-label]
  [fixture: block/db-grid-pipe-edge-label]
  [fixture: block/db-grid-pipe-composite-label]
  [fixture: block/gram-label-quote-inside]
  [fixture: block/gram-grid-quote-block-arrow-label]
  [fixture: block/gram-grid-quote-edge-label]
  [fixture: block/gram-grid-quote-composite-label]
  [fixture: block/db-label-single-quote-inside]
  [fixture: block/db-grid-single-quote-block-arrow-label]
  [fixture: block/db-grid-single-quote-edge-label]
  [fixture: block/db-grid-single-quote-composite-label]
  [fixture: block/db-label-backtick-inside]
  [fixture: block/db-grid-backtick-block-arrow-label]
  [fixture: block/db-grid-backtick-edge-label]
  [fixture: block/db-grid-backtick-composite-label]
  [fixture: block/db-label-backslash]
  [fixture: block/db-grid-backslash-block-arrow-label]
  [fixture: block/db-grid-backslash-edge-label]
  [fixture: block/db-grid-backslash-composite-label]
  [fixture: block/db-grid-open-square-label]
  [fixture: block/db-grid-open-square-block-arrow-label]
  [fixture: block/db-grid-open-square-edge-label]
  [fixture: block/db-grid-open-square-composite-label]
  [fixture: block/db-grid-close-square-label]
  [fixture: block/db-grid-close-square-block-arrow-label]
  [fixture: block/db-grid-close-square-edge-label]
  [fixture: block/db-grid-close-square-composite-label]
  [fixture: block/db-grid-open-round-label]
  [fixture: block/db-grid-open-round-block-arrow-label]
  [fixture: block/db-grid-open-round-edge-label]
  [fixture: block/db-grid-open-round-composite-label]
  [fixture: block/db-grid-close-round-label]
  [fixture: block/db-grid-close-round-block-arrow-label]
  [fixture: block/db-grid-close-round-edge-label]
  [fixture: block/db-grid-close-round-composite-label]
  [fixture: block/db-grid-open-brace-label]
  [fixture: block/db-grid-open-brace-block-arrow-label]
  [fixture: block/db-grid-open-brace-edge-label]
  [fixture: block/db-grid-open-brace-composite-label]
  [fixture: block/db-grid-close-brace-label]
  [fixture: block/db-grid-close-brace-block-arrow-label]
  [fixture: block/db-grid-close-brace-edge-label]
  [fixture: block/db-grid-close-brace-composite-label]
  [fixture: block/db-grid-less-than-label]
  [fixture: block/db-grid-less-than-block-arrow-label]
  [fixture: block/db-grid-less-than-edge-label]
  [fixture: block/db-grid-less-than-composite-label]
  [fixture: block/db-grid-greater-than-label]
  [fixture: block/db-grid-greater-than-block-arrow-label]
  [fixture: block/db-grid-greater-than-edge-label]
  [fixture: block/db-grid-greater-than-composite-label]
  [fixture: block/db-grid-equals-label]
  [fixture: block/db-grid-equals-block-arrow-label]
  [fixture: block/db-grid-equals-edge-label]
  [fixture: block/db-grid-equals-composite-label]
  [fixture: block/db-grid-punct-label]
  [fixture: block/db-grid-punct-block-arrow-label]
  [fixture: block/db-grid-punct-edge-label]
  [fixture: block/db-grid-punct-composite-label]
  [fixture: block/db-grid-arrow-label]
  [fixture: block/db-grid-arrow-block-arrow-label]
  [fixture: block/db-grid-arrow-edge-label]
  [fixture: block/db-grid-arrow-composite-label]
  [fixture: block/db-label-arrow]
  [fixture: block/db-grid-arrow-spaced-block-arrow-label]
  [fixture: block/db-grid-arrow-spaced-edge-label]
  [fixture: block/db-grid-arrow-spaced-composite-label]
  [fixture: block/db-grid-comment-label]
  [fixture: block/db-grid-comment-block-arrow-label]
  [fixture: block/db-grid-comment-edge-label]
  [fixture: block/db-grid-comment-composite-label]
  [fixture: block/db-grid-comment-line-label]
  [fixture: block/db-grid-comment-line-block-arrow-label]
  [fixture: block/db-grid-comment-line-edge-label]
  [fixture: block/db-grid-comment-line-composite-label]
  [fixture: block/db-label-directive]
  [fixture: block/db-grid-directive-block-arrow-label]
  [fixture: block/db-edge-label-directive]
  [fixture: block/db-grid-directive-composite-label]
  [fixture: block/db-label-directive-line]
  [fixture: block/db-grid-directive-line-block-arrow-label]
  [fixture: block/db-grid-directive-line-edge-label]
  [fixture: block/db-grid-directive-line-composite-label]
  [fixture: block/db-label-entity-numeric]
  [fixture: block/db-grid-entity-block-arrow-label]
  [fixture: block/db-edge-label-entity]
  [fixture: block/db-grid-entity-composite-label]
  [fixture: block/db-label-entity-named]
  [fixture: block/db-grid-entity-named-block-arrow-label]
  [fixture: block/db-grid-entity-named-edge-label]
  [fixture: block/db-grid-entity-named-composite-label]
  [fixture: block/db-grid-html-label]
  [fixture: block/db-grid-html-block-arrow-label]
  [fixture: block/db-grid-html-edge-label]
  [fixture: block/db-grid-html-composite-label]
  [fixture: block/db-label-html-br-slash]
  [fixture: block/db-grid-html-br-block-arrow-label]
  [fixture: block/db-grid-html-br-edge-label]
  [fixture: block/db-grid-html-br-composite-label]
  [fixture: block/db-grid-html-attribute-label]
  [fixture: block/db-grid-html-attribute-block-arrow-label]
  [fixture: block/db-grid-html-attribute-edge-label]
  [fixture: block/db-grid-html-attribute-composite-label]
  [fixture: block/db-grid-ampersand-entity-label]
  [fixture: block/db-grid-ampersand-entity-block-arrow-label]
  [fixture: block/db-grid-ampersand-entity-edge-label]
  [fixture: block/db-grid-ampersand-entity-composite-label]
  [fixture: block/db-grid-keyword-end-label]
  [fixture: block/db-grid-keyword-end-block-arrow-label]
  [fixture: block/db-grid-keyword-end-edge-label]
  [fixture: block/db-grid-keyword-end-composite-label]
  [fixture: block/db-grid-keyword-block-label]
  [fixture: block/db-grid-keyword-block-block-arrow-label]
  [fixture: block/db-grid-keyword-block-edge-label]
  [fixture: block/db-grid-keyword-block-composite-label]
  [fixture: block/db-grid-keyword-columns-label]
  [fixture: block/db-grid-keyword-columns-block-arrow-label]
  [fixture: block/db-grid-keyword-columns-edge-label]
  [fixture: block/db-grid-keyword-columns-composite-label]
  [fixture: block/db-grid-keyword-space-label]
  [fixture: block/db-grid-keyword-space-block-arrow-label]
  [fixture: block/db-grid-keyword-space-edge-label]
  [fixture: block/db-grid-keyword-space-composite-label]
  [fixture: block/db-grid-keyword-class-label]
  [fixture: block/db-grid-keyword-class-block-arrow-label]
  [fixture: block/db-grid-keyword-class-edge-label]
  [fixture: block/db-grid-keyword-class-composite-label]
  [fixture: block/db-grid-keyword-style-label]
  [fixture: block/db-grid-keyword-style-block-arrow-label]
  [fixture: block/db-grid-keyword-style-edge-label]
  [fixture: block/db-grid-keyword-style-composite-label]
  [fixture: block/db-grid-keyword-classdef-label]
  [fixture: block/db-grid-keyword-classdef-block-arrow-label]
  [fixture: block/db-grid-keyword-classdef-edge-label]
  [fixture: block/db-grid-keyword-classdef-composite-label]
  [fixture: block/db-grid-keyword-header-label]
  [fixture: block/db-grid-keyword-header-block-arrow-label]
  [fixture: block/db-grid-keyword-header-edge-label]
  [fixture: block/db-grid-keyword-header-composite-label]
  [fixture: block/db-grid-proto-label]
  [fixture: block/db-grid-proto-block-arrow-label]
  [fixture: block/db-grid-proto-edge-label]
  [fixture: block/db-grid-proto-composite-label]
  [fixture: block/db-grid-constructor-label]
  [fixture: block/db-grid-constructor-block-arrow-label]
  [fixture: block/db-grid-constructor-edge-label]
  [fixture: block/db-grid-constructor-composite-label]
  [fixture: block/db-grid-root-label]
  [fixture: block/db-grid-root-block-arrow-label]
  [fixture: block/db-grid-root-edge-label]
  [fixture: block/db-grid-root-composite-label]
  [fixture: block/db-grid-nonascii-label]
  [fixture: block/db-grid-nonascii-block-arrow-label]
  [fixture: block/db-grid-nonascii-edge-label]
  [fixture: block/db-grid-nonascii-composite-label]
  [fixture: block/db-grid-emoji-label]
  [fixture: block/db-grid-emoji-block-arrow-label]
  [fixture: block/db-grid-emoji-edge-label]
  [fixture: block/db-grid-emoji-composite-label]
  [fixture: block/db-grid-digits-label]
  [fixture: block/db-grid-digits-block-arrow-label]
  [fixture: block/db-grid-digits-edge-label]
  [fixture: block/db-grid-digits-composite-label]
  [fixture: block/db-grid-empty-label]
  [fixture: block/db-grid-empty-block-arrow-label]
  [fixture: block/db-grid-empty-edge-label]
  [fixture: block/db-grid-empty-composite-label]
  [fixture: block/db-grid-style-rule-label]
  [fixture: block/db-grid-style-rule-block-arrow-label]
  [fixture: block/db-grid-style-rule-edge-label]
  [fixture: block/db-grid-style-rule-composite-label]
  [fixture: block/db-grid-classdef-rule-label]
  [fixture: block/db-grid-classdef-rule-block-arrow-label]
  [fixture: block/db-grid-classdef-rule-edge-label]
  [fixture: block/db-grid-classdef-rule-composite-label]
- node の id の中の `;`、`#`、`%`、`,`、`|`、`'`、`"`、バッククォート、
  バックスラッシュ、`]`、`%%`、文字参照、`&amp;`、
  `__proto__`、`constructor`、`root`、ASCII の外の文字、絵文字、数字、
  何もないものは、id の一部です。
  中のディレクティブは取り除かれ、コメント行は id を終えます。
  `[`、`(`、`{`、矢印でない `-`、`:`、`=`、`<`、`>`、`}`、`)`、続く句読点、
  HTML、行の規則は拒否されます。
  `a-->b` は辺です。
  id の後ろの `end` と `block-beta` は composite を開いたり閉じたりし、
  拒否されます。
  `columns 2`、`space`、`class A c`、`classDef c fill:red` は文で、
  `style A fill:red` は存在しない id への `style` です。
  [fixture: block/db-name-semicolon]
  [fixture: block/db-name-hash]
  [fixture: block/db-name-percent]
  [fixture: block/gram-name-colon]
  [fixture: block/db-name-comma]
  [fixture: block/gram-name-dash]
  [fixture: block/db-name-pipe]
  [fixture: block/db-name-quote]
  [fixture: block/db-name-single-quote]
  [fixture: block/db-name-backtick]
  [fixture: block/db-name-backslash]
  [fixture: block/gram-grid-open-square-id]
  [fixture: block/db-name-brackets-in-id]
  [fixture: block/gram-grid-open-round-id]
  [fixture: block/gram-name-close-paren]
  [fixture: block/gram-grid-open-brace-id]
  [fixture: block/gram-name-brace]
  [fixture: block/gram-name-less-than]
  [fixture: block/gram-name-greater-than]
  [fixture: block/gram-name-equals]
  [fixture: block/gram-grid-punct-id]
  [fixture: block/db-grid-arrow-id]
  [fixture: block/db-grid-arrow-spaced-id]
  [fixture: block/db-grid-comment-id]
  [fixture: block/db-grid-comment-line-id]
  [fixture: block/div-grid-directive-id]
  [fixture: block/db-grid-directive-line-id]
  [fixture: block/db-grid-entity-id]
  [fixture: block/db-grid-entity-named-id]
  [fixture: block/gram-grid-html-id]
  [fixture: block/gram-grid-html-br-id]
  [fixture: block/gram-grid-html-attribute-id]
  [fixture: block/db-grid-ampersand-entity-id]
  [fixture: block/gram-grid-keyword-end-id]
  [fixture: block/gram-grid-keyword-block-id]
  [fixture: block/db-grid-keyword-columns-id]
  [fixture: block/db-grid-keyword-space-id]
  [fixture: block/db-grid-keyword-class-id]
  [fixture: block/gram-grid-keyword-style-id]
  [fixture: block/db-grid-keyword-classdef-id]
  [fixture: block/gram-grid-keyword-header-id]
  [fixture: block/db-grid-proto-id]
  [fixture: block/db-grid-constructor-id]
  [fixture: block/db-grid-root-id]
  [fixture: block/db-grid-nonascii-id]
  [fixture: block/db-grid-emoji-id]
  [fixture: block/db-grid-digits-id]
  [fixture: block/db-grid-empty-id]
  [fixture: block/gram-grid-style-rule-id]
  [fixture: block/gram-grid-classdef-rule-id]
- `class` や `style` の文の id、クラス名、
  `classDef` の名前にこれらの文字があるとき。
  `classDef` の名前は単語の文字の 1 文字以上で、空白は名前を終え、
  残りが最初のスタイルになります。
  ほかの文字、句読点、ASCII の外の文字、コメント、文字参照は、
  そのテキストを拒否させます。
  `__proto__`、`constructor`、`root`、数字、何もないものは単語の文字か、
  文字がないことです。
  `class` と `style` の id も単語の文字なので、そうでない文字は id を終え、
  残りがクラス名やスタイルになります。
  存在しない id への `style` は拒否されます。
  [fixture: block/db-grid-tab-class-def-name]
  [fixture: block/db-grid-tab-class-apply-id]
  [fixture: block/db-grid-tab-style-id]
  [fixture: block/db-grid-lf-class-def-name]
  [fixture: block/db-grid-lf-class-apply-id]
  [fixture: block/gram-grid-lf-style-id]
  [fixture: block/db-grid-cr-class-def-name]
  [fixture: block/db-grid-cr-class-apply-id]
  [fixture: block/gram-grid-cr-style-id]
  [fixture: block/db-grid-crlf-class-def-name]
  [fixture: block/db-grid-crlf-class-apply-id]
  [fixture: block/gram-grid-crlf-style-id]
  [fixture: block/db-grid-ls-class-def-name]
  [fixture: block/db-grid-ls-class-apply-id]
  [fixture: block/db-grid-ls-style-id]
  [fixture: block/db-grid-ps-class-def-name]
  [fixture: block/db-grid-ps-class-apply-id]
  [fixture: block/db-grid-ps-style-id]
  [fixture: block/db-grid-nbsp-class-def-name]
  [fixture: block/db-grid-nbsp-class-apply-id]
  [fixture: block/db-grid-nbsp-style-id]
  [fixture: block/db-grid-bom-class-def-name]
  [fixture: block/db-grid-bom-class-apply-id]
  [fixture: block/db-grid-bom-style-id]
  [fixture: block/db-grid-ideographic-class-def-name]
  [fixture: block/db-grid-ideographic-class-apply-id]
  [fixture: block/db-grid-ideographic-style-id]
  [fixture: block/db-grid-ff-class-def-name]
  [fixture: block/db-grid-ff-class-apply-id]
  [fixture: block/db-grid-ff-style-id]
  [fixture: block/db-grid-vt-class-def-name]
  [fixture: block/db-grid-vt-class-apply-id]
  [fixture: block/db-grid-vt-style-id]
  [fixture: block/db-grid-spaces-class-def-name]
  [fixture: block/db-grid-spaces-class-apply-id]
  [fixture: block/db-grid-spaces-style-id]
  [fixture: block/gram-grid-nel-class-def-name]
  [fixture: block/db-grid-nel-class-apply-id]
  [fixture: block/gram-grid-nel-style-id]
  [fixture: block/gram-grid-semicolon-class-def-name]
  [fixture: block/db-grid-semicolon-class-apply-id]
  [fixture: block/gram-grid-semicolon-style-id]
  [fixture: block/gram-grid-hash-class-def-name]
  [fixture: block/db-grid-hash-class-apply-id]
  [fixture: block/gram-grid-hash-style-id]
  [fixture: block/gram-grid-percent-class-def-name]
  [fixture: block/db-grid-percent-class-apply-id]
  [fixture: block/gram-grid-percent-style-id]
  [fixture: block/gram-grid-colon-class-def-name]
  [fixture: block/gram-grid-colon-class-apply-id]
  [fixture: block/gram-grid-colon-style-id]
  [fixture: block/gram-grid-comma-class-def-name]
  [fixture: block/db-grid-comma-class-apply-id]
  [fixture: block/db-grid-comma-style-id]
  [fixture: block/gram-grid-dash-class-def-name]
  [fixture: block/gram-grid-dash-class-apply-id]
  [fixture: block/gram-grid-dash-style-id]
  [fixture: block/gram-grid-pipe-class-def-name]
  [fixture: block/db-grid-pipe-class-apply-id]
  [fixture: block/gram-grid-pipe-style-id]
  [fixture: block/gram-grid-quote-class-def-name]
  [fixture: block/db-grid-quote-class-apply-id]
  [fixture: block/gram-grid-quote-style-id]
  [fixture: block/gram-grid-single-quote-class-def-name]
  [fixture: block/db-grid-single-quote-class-apply-id]
  [fixture: block/gram-grid-single-quote-style-id]
  [fixture: block/gram-grid-backtick-class-def-name]
  [fixture: block/db-grid-backtick-class-apply-id]
  [fixture: block/gram-grid-backtick-style-id]
  [fixture: block/gram-grid-backslash-class-def-name]
  [fixture: block/db-grid-backslash-class-apply-id]
  [fixture: block/gram-grid-backslash-style-id]
  [fixture: block/gram-grid-open-square-class-def-name]
  [fixture: block/gram-grid-open-square-class-apply-id]
  [fixture: block/gram-grid-open-square-style-id]
  [fixture: block/gram-grid-close-square-class-def-name]
  [fixture: block/db-grid-close-square-class-apply-id]
  [fixture: block/gram-grid-close-square-style-id]
  [fixture: block/gram-grid-open-round-class-def-name]
  [fixture: block/gram-grid-open-round-class-apply-id]
  [fixture: block/gram-grid-open-round-style-id]
  [fixture: block/gram-grid-close-round-class-def-name]
  [fixture: block/gram-grid-close-round-class-apply-id]
  [fixture: block/gram-grid-close-round-style-id]
  [fixture: block/gram-grid-open-brace-class-def-name]
  [fixture: block/gram-grid-open-brace-class-apply-id]
  [fixture: block/gram-grid-open-brace-style-id]
  [fixture: block/gram-grid-close-brace-class-def-name]
  [fixture: block/gram-grid-close-brace-class-apply-id]
  [fixture: block/gram-grid-close-brace-style-id]
  [fixture: block/gram-grid-less-than-class-def-name]
  [fixture: block/gram-grid-less-than-class-apply-id]
  [fixture: block/gram-grid-less-than-style-id]
  [fixture: block/gram-grid-greater-than-class-def-name]
  [fixture: block/gram-grid-greater-than-class-apply-id]
  [fixture: block/gram-grid-greater-than-style-id]
  [fixture: block/gram-grid-equals-class-def-name]
  [fixture: block/gram-grid-equals-class-apply-id]
  [fixture: block/gram-grid-equals-style-id]
  [fixture: block/gram-grid-punct-class-def-name]
  [fixture: block/gram-grid-punct-class-apply-id]
  [fixture: block/gram-grid-punct-style-id]
  [fixture: block/gram-grid-arrow-class-def-name]
  [fixture: block/db-grid-arrow-class-apply-id]
  [fixture: block/db-grid-arrow-style-id]
  [fixture: block/db-grid-arrow-spaced-class-def-name]
  [fixture: block/db-grid-arrow-spaced-class-apply-id]
  [fixture: block/db-grid-arrow-spaced-style-id]
  [fixture: block/gram-grid-comment-class-def-name]
  [fixture: block/db-grid-comment-class-apply-id]
  [fixture: block/gram-grid-comment-style-id]
  [fixture: block/db-grid-comment-line-class-def-name]
  [fixture: block/db-grid-comment-line-class-apply-id]
  [fixture: block/gram-grid-comment-line-style-id]
  [fixture: block/div-grid-directive-class-def-name]
  [fixture: block/div-grid-directive-class-apply-id]
  [fixture: block/div-grid-directive-style-id]
  [fixture: block/db-grid-directive-line-class-def-name]
  [fixture: block/db-grid-directive-line-class-apply-id]
  [fixture: block/gram-grid-directive-line-style-id]
  [fixture: block/gram-grid-entity-class-def-name]
  [fixture: block/db-grid-entity-class-apply-id]
  [fixture: block/gram-grid-entity-style-id]
  [fixture: block/gram-grid-entity-named-class-def-name]
  [fixture: block/db-grid-entity-named-class-apply-id]
  [fixture: block/gram-grid-entity-named-style-id]
  [fixture: block/gram-grid-html-class-def-name]
  [fixture: block/gram-grid-html-class-apply-id]
  [fixture: block/gram-grid-html-style-id]
  [fixture: block/gram-grid-html-br-class-def-name]
  [fixture: block/gram-grid-html-br-class-apply-id]
  [fixture: block/gram-grid-html-br-style-id]
  [fixture: block/gram-grid-html-attribute-class-def-name]
  [fixture: block/gram-grid-html-attribute-class-apply-id]
  [fixture: block/gram-grid-html-attribute-style-id]
  [fixture: block/gram-grid-ampersand-entity-class-def-name]
  [fixture: block/db-grid-ampersand-entity-class-apply-id]
  [fixture: block/gram-grid-ampersand-entity-style-id]
  [fixture: block/db-grid-keyword-end-class-def-name]
  [fixture: block/gram-grid-keyword-end-class-apply-id]
  [fixture: block/gram-grid-keyword-end-style-id]
  [fixture: block/db-grid-keyword-block-class-def-name]
  [fixture: block/gram-grid-keyword-block-class-apply-id]
  [fixture: block/gram-grid-keyword-block-style-id]
  [fixture: block/db-grid-keyword-columns-class-def-name]
  [fixture: block/db-grid-keyword-columns-class-apply-id]
  [fixture: block/db-grid-keyword-columns-style-id]
  [fixture: block/db-grid-keyword-space-class-def-name]
  [fixture: block/db-grid-keyword-space-class-apply-id]
  [fixture: block/db-grid-keyword-space-style-id]
  [fixture: block/db-grid-keyword-class-class-def-name]
  [fixture: block/db-grid-keyword-class-class-apply-id]
  [fixture: block/db-grid-keyword-class-style-id]
  [fixture: block/db-grid-keyword-style-class-def-name]
  [fixture: block/gram-grid-keyword-style-class-apply-id]
  [fixture: block/gram-grid-keyword-style-style-id]
  [fixture: block/db-grid-keyword-classdef-class-def-name]
  [fixture: block/db-grid-keyword-classdef-class-apply-id]
  [fixture: block/db-grid-keyword-classdef-style-id]
  [fixture: block/db-grid-keyword-header-class-def-name]
  [fixture: block/gram-grid-keyword-header-class-apply-id]
  [fixture: block/gram-grid-keyword-header-style-id]
  [fixture: block/db-grid-proto-class-def-name]
  [fixture: block/db-grid-proto-class-apply-id]
  [fixture: block/db-grid-proto-style-id]
  [fixture: block/db-grid-constructor-class-def-name]
  [fixture: block/db-grid-constructor-class-apply-id]
  [fixture: block/db-grid-constructor-style-id]
  [fixture: block/db-grid-root-class-def-name]
  [fixture: block/db-grid-root-class-apply-id]
  [fixture: block/db-grid-root-style-id]
  [fixture: block/gram-grid-nonascii-class-def-name]
  [fixture: block/db-grid-nonascii-class-apply-id]
  [fixture: block/gram-grid-nonascii-style-id]
  [fixture: block/gram-grid-emoji-class-def-name]
  [fixture: block/db-grid-emoji-class-apply-id]
  [fixture: block/gram-grid-emoji-style-id]
  [fixture: block/db-grid-digits-class-def-name]
  [fixture: block/db-grid-digits-class-apply-id]
  [fixture: block/db-grid-digits-style-id]
  [fixture: block/db-grid-empty-class-def-name]
  [fixture: block/db-grid-empty-class-apply-id]
  [fixture: block/db-grid-empty-style-id]
  [fixture: block/gram-grid-style-rule-class-def-name]
  [fixture: block/gram-grid-style-rule-class-apply-id]
  [fixture: block/gram-grid-style-rule-style-id]
  [fixture: block/gram-grid-classdef-rule-class-def-name]
  [fixture: block/gram-grid-classdef-rule-class-apply-id]
  [fixture: block/gram-grid-classdef-rule-style-id]
- `classDef` と `style` のスタイルと、`class` のクラス名の中では、
  改行以外の空白はテキストの一部で、改行はテキストを終え、
  残りは文として読まれます。
  ほかの文字もテキストの一部です。
  Db は `classDef` のスタイルの最初の `;` を落とし、
  行の規則は `:` と `#` のある行の最後の `;` を落とします。
  コメント行と、ディレクティブは取り除かれます。
  U+0085 はテキストの一部です。
  [fixture: block/db-grid-tab-class-def-style]
  [fixture: block/db-grid-tab-class-apply-name]
  [fixture: block/db-grid-tab-style-text]
  [fixture: block/db-grid-lf-class-def-style]
  [fixture: block/db-grid-lf-class-apply-name]
  [fixture: block/db-grid-lf-style-text]
  [fixture: block/db-grid-cr-class-def-style]
  [fixture: block/db-grid-cr-class-apply-name]
  [fixture: block/db-grid-cr-style-text]
  [fixture: block/db-grid-crlf-class-def-style]
  [fixture: block/db-grid-crlf-class-apply-name]
  [fixture: block/db-grid-crlf-style-text]
  [fixture: block/db-grid-ls-class-def-style]
  [fixture: block/db-grid-ls-class-apply-name]
  [fixture: block/db-grid-ls-style-text]
  [fixture: block/db-grid-ps-class-def-style]
  [fixture: block/db-grid-ps-class-apply-name]
  [fixture: block/db-grid-ps-style-text]
  [fixture: block/db-grid-nbsp-class-def-style]
  [fixture: block/db-grid-nbsp-class-apply-name]
  [fixture: block/db-grid-nbsp-style-text]
  [fixture: block/db-grid-bom-class-def-style]
  [fixture: block/db-grid-bom-class-apply-name]
  [fixture: block/db-grid-bom-style-text]
  [fixture: block/db-grid-ideographic-class-def-style]
  [fixture: block/db-grid-ideographic-class-apply-name]
  [fixture: block/db-grid-ideographic-style-text]
  [fixture: block/db-grid-ff-class-def-style]
  [fixture: block/db-grid-ff-class-apply-name]
  [fixture: block/db-grid-ff-style-text]
  [fixture: block/db-grid-vt-class-def-style]
  [fixture: block/db-grid-vt-class-apply-name]
  [fixture: block/db-grid-vt-style-text]
  [fixture: block/db-grid-spaces-class-def-style]
  [fixture: block/db-grid-spaces-class-apply-name]
  [fixture: block/db-grid-spaces-style-text]
  [fixture: block/db-grid-nel-class-def-style]
  [fixture: block/db-grid-nel-class-apply-name]
  [fixture: block/db-grid-nel-style-text]
  [fixture: block/db-grid-semicolon-class-def-style]
  [fixture: block/db-grid-semicolon-class-apply-name]
  [fixture: block/db-grid-semicolon-style-text]
  [fixture: block/db-grid-hash-class-def-style]
  [fixture: block/db-grid-hash-class-apply-name]
  [fixture: block/db-grid-hash-style-text]
  [fixture: block/db-grid-percent-class-def-style]
  [fixture: block/db-grid-percent-class-apply-name]
  [fixture: block/db-grid-percent-style-text]
  [fixture: block/db-grid-colon-class-def-style]
  [fixture: block/db-grid-colon-class-apply-name]
  [fixture: block/db-grid-colon-style-text]
  [fixture: block/db-grid-comma-class-def-style]
  [fixture: block/db-grid-comma-class-apply-name]
  [fixture: block/db-grid-comma-style-text]
  [fixture: block/db-grid-dash-class-def-style]
  [fixture: block/db-grid-dash-class-apply-name]
  [fixture: block/db-grid-dash-style-text]
  [fixture: block/db-grid-pipe-class-def-style]
  [fixture: block/db-grid-pipe-class-apply-name]
  [fixture: block/db-grid-pipe-style-text]
  [fixture: block/db-grid-quote-class-def-style]
  [fixture: block/db-grid-quote-class-apply-name]
  [fixture: block/db-grid-quote-style-text]
  [fixture: block/db-grid-single-quote-class-def-style]
  [fixture: block/db-grid-single-quote-class-apply-name]
  [fixture: block/db-grid-single-quote-style-text]
  [fixture: block/db-grid-backtick-class-def-style]
  [fixture: block/db-grid-backtick-class-apply-name]
  [fixture: block/db-grid-backtick-style-text]
  [fixture: block/db-grid-backslash-class-def-style]
  [fixture: block/db-grid-backslash-class-apply-name]
  [fixture: block/db-grid-backslash-style-text]
  [fixture: block/db-grid-open-square-class-def-style]
  [fixture: block/db-grid-open-square-class-apply-name]
  [fixture: block/db-grid-open-square-style-text]
  [fixture: block/db-grid-close-square-class-def-style]
  [fixture: block/db-grid-close-square-class-apply-name]
  [fixture: block/db-grid-close-square-style-text]
  [fixture: block/db-grid-open-round-class-def-style]
  [fixture: block/db-grid-open-round-class-apply-name]
  [fixture: block/db-grid-open-round-style-text]
  [fixture: block/db-grid-close-round-class-def-style]
  [fixture: block/db-grid-close-round-class-apply-name]
  [fixture: block/db-grid-close-round-style-text]
  [fixture: block/db-grid-open-brace-class-def-style]
  [fixture: block/db-grid-open-brace-class-apply-name]
  [fixture: block/db-grid-open-brace-style-text]
  [fixture: block/db-grid-close-brace-class-def-style]
  [fixture: block/db-grid-close-brace-class-apply-name]
  [fixture: block/db-grid-close-brace-style-text]
  [fixture: block/db-grid-less-than-class-def-style]
  [fixture: block/db-grid-less-than-class-apply-name]
  [fixture: block/db-grid-less-than-style-text]
  [fixture: block/db-grid-greater-than-class-def-style]
  [fixture: block/db-grid-greater-than-class-apply-name]
  [fixture: block/db-grid-greater-than-style-text]
  [fixture: block/db-grid-equals-class-def-style]
  [fixture: block/db-grid-equals-class-apply-name]
  [fixture: block/db-grid-equals-style-text]
  [fixture: block/db-grid-punct-class-def-style]
  [fixture: block/db-grid-punct-class-apply-name]
  [fixture: block/db-grid-punct-style-text]
  [fixture: block/db-grid-arrow-class-def-style]
  [fixture: block/db-grid-arrow-class-apply-name]
  [fixture: block/db-grid-arrow-style-text]
  [fixture: block/db-grid-arrow-spaced-class-def-style]
  [fixture: block/db-grid-arrow-spaced-class-apply-name]
  [fixture: block/db-grid-arrow-spaced-style-text]
  [fixture: block/db-grid-comment-class-def-style]
  [fixture: block/db-grid-comment-class-apply-name]
  [fixture: block/db-grid-comment-style-text]
  [fixture: block/db-grid-comment-line-class-def-style]
  [fixture: block/db-grid-comment-line-class-apply-name]
  [fixture: block/db-grid-comment-line-style-text]
  [fixture: block/db-grid-directive-class-def-style]
  [fixture: block/db-grid-directive-class-apply-name]
  [fixture: block/db-grid-directive-style-text]
  [fixture: block/db-grid-directive-line-class-def-style]
  [fixture: block/db-grid-directive-line-class-apply-name]
  [fixture: block/db-grid-directive-line-style-text]
  [fixture: block/db-grid-entity-class-def-style]
  [fixture: block/db-grid-entity-class-apply-name]
  [fixture: block/db-grid-entity-style-text]
  [fixture: block/db-grid-entity-named-class-def-style]
  [fixture: block/db-grid-entity-named-class-apply-name]
  [fixture: block/db-grid-entity-named-style-text]
  [fixture: block/db-grid-html-class-def-style]
  [fixture: block/db-grid-html-class-apply-name]
  [fixture: block/db-grid-html-style-text]
  [fixture: block/db-grid-html-br-class-def-style]
  [fixture: block/db-grid-html-br-class-apply-name]
  [fixture: block/db-grid-html-br-style-text]
  [fixture: block/db-grid-html-attribute-class-def-style]
  [fixture: block/db-grid-html-attribute-class-apply-name]
  [fixture: block/db-grid-html-attribute-style-text]
  [fixture: block/db-grid-ampersand-entity-class-def-style]
  [fixture: block/db-grid-ampersand-entity-class-apply-name]
  [fixture: block/db-grid-ampersand-entity-style-text]
  [fixture: block/db-grid-keyword-end-class-def-style]
  [fixture: block/db-grid-keyword-end-class-apply-name]
  [fixture: block/db-grid-keyword-end-style-text]
  [fixture: block/db-grid-keyword-block-class-def-style]
  [fixture: block/db-grid-keyword-block-class-apply-name]
  [fixture: block/db-grid-keyword-block-style-text]
  [fixture: block/db-grid-keyword-columns-class-def-style]
  [fixture: block/db-grid-keyword-columns-class-apply-name]
  [fixture: block/db-grid-keyword-columns-style-text]
  [fixture: block/db-grid-keyword-space-class-def-style]
  [fixture: block/db-grid-keyword-space-class-apply-name]
  [fixture: block/db-grid-keyword-space-style-text]
  [fixture: block/db-grid-keyword-class-class-def-style]
  [fixture: block/db-grid-keyword-class-class-apply-name]
  [fixture: block/db-grid-keyword-class-style-text]
  [fixture: block/db-grid-keyword-style-class-def-style]
  [fixture: block/db-grid-keyword-style-class-apply-name]
  [fixture: block/db-grid-keyword-style-style-text]
  [fixture: block/db-grid-keyword-classdef-class-def-style]
  [fixture: block/db-grid-keyword-classdef-class-apply-name]
  [fixture: block/db-grid-keyword-classdef-style-text]
  [fixture: block/db-grid-keyword-header-class-def-style]
  [fixture: block/db-grid-keyword-header-class-apply-name]
  [fixture: block/db-grid-keyword-header-style-text]
  [fixture: block/db-grid-proto-class-def-style]
  [fixture: block/db-grid-proto-class-apply-name]
  [fixture: block/db-grid-proto-style-text]
  [fixture: block/db-grid-constructor-class-def-style]
  [fixture: block/db-grid-constructor-class-apply-name]
  [fixture: block/db-grid-constructor-style-text]
  [fixture: block/db-grid-root-class-def-style]
  [fixture: block/db-grid-root-class-apply-name]
  [fixture: block/db-grid-root-style-text]
  [fixture: block/db-grid-nonascii-class-def-style]
  [fixture: block/db-grid-nonascii-class-apply-name]
  [fixture: block/db-grid-nonascii-style-text]
  [fixture: block/db-grid-emoji-class-def-style]
  [fixture: block/db-grid-emoji-class-apply-name]
  [fixture: block/db-grid-emoji-style-text]
  [fixture: block/db-grid-digits-class-def-style]
  [fixture: block/db-grid-digits-class-apply-name]
  [fixture: block/db-grid-digits-style-text]
  [fixture: block/db-grid-empty-class-def-style]
  [fixture: block/db-grid-empty-class-apply-name]
  [fixture: block/db-grid-empty-style-text]
  [fixture: block/db-grid-style-rule-class-def-style]
  [fixture: block/db-grid-style-rule-class-apply-name]
  [fixture: block/db-grid-style-rule-style-text]
  [fixture: block/db-grid-classdef-rule-class-def-style]
  [fixture: block/db-grid-classdef-rule-class-apply-name]
  [fixture: block/db-grid-classdef-rule-style-text]
- `columns` の後ろでは、数字だけが columns の数を作ります。
  ほかの文字は `columns` を node にし、その文字が作るものが続くか、
  テキストが拒否されます。
  node や `space` の幅には、数字だけが幅になります。
  block arrow の方向の間では、空白はその前の方向の一部で、
  コメント行とディレクティブは取り除かれ、何もない場合は 2 つの方向が続きます。
  ほかの文字は拒否されます。
  見出しの同じ行に付いた空白、`;`、`#`、`%`、`,`、`|`、`'`、バッククォート、
  バックスラッシュ、`]`、コメント、文字参照、`&amp;`、ASCII の外の文字は、
  その文字で始まる node を作ります。
  キーワードはその文を始めます。
  [fixture: block/db-grid-tab-columns]
  [fixture: block/gram-grid-tab-width]
  [fixture: block/gram-grid-tab-space-width]
  [fixture: block/db-grid-tab-directions]
  [fixture: block/header-statement-on-header-line-tab]
  [fixture: block/db-grid-lf-columns]
  [fixture: block/gram-grid-lf-width]
  [fixture: block/gram-grid-lf-space-width]
  [fixture: block/db-grid-lf-directions]
  [fixture: block/db-grid-lf-header-line]
  [fixture: block/db-grid-cr-columns]
  [fixture: block/gram-grid-cr-width]
  [fixture: block/gram-grid-cr-space-width]
  [fixture: block/db-grid-cr-directions]
  [fixture: block/db-grid-cr-header-line]
  [fixture: block/db-grid-crlf-columns]
  [fixture: block/gram-grid-crlf-width]
  [fixture: block/gram-grid-crlf-space-width]
  [fixture: block/db-grid-crlf-directions]
  [fixture: block/db-grid-crlf-header-line]
  [fixture: block/db-grid-ls-columns]
  [fixture: block/gram-grid-ls-width]
  [fixture: block/gram-grid-ls-space-width]
  [fixture: block/db-grid-ls-directions]
  [fixture: block/header-ls-after]
  [fixture: block/db-grid-ps-columns]
  [fixture: block/gram-grid-ps-width]
  [fixture: block/gram-grid-ps-space-width]
  [fixture: block/db-grid-ps-directions]
  [fixture: block/header-ps-after]
  [fixture: block/db-grid-nbsp-columns]
  [fixture: block/gram-grid-nbsp-width]
  [fixture: block/gram-grid-nbsp-space-width]
  [fixture: block/db-grid-nbsp-directions]
  [fixture: block/db-grid-nbsp-header-line]
  [fixture: block/db-grid-bom-columns]
  [fixture: block/gram-grid-bom-width]
  [fixture: block/gram-grid-bom-space-width]
  [fixture: block/db-grid-bom-directions]
  [fixture: block/db-grid-bom-header-line]
  [fixture: block/db-grid-ideographic-columns]
  [fixture: block/gram-grid-ideographic-width]
  [fixture: block/gram-grid-ideographic-space-width]
  [fixture: block/db-grid-ideographic-directions]
  [fixture: block/db-grid-ideographic-header-line]
  [fixture: block/db-grid-ff-columns]
  [fixture: block/gram-grid-ff-width]
  [fixture: block/gram-grid-ff-space-width]
  [fixture: block/db-grid-ff-directions]
  [fixture: block/header-ff-after]
  [fixture: block/db-grid-vt-columns]
  [fixture: block/gram-grid-vt-width]
  [fixture: block/gram-grid-vt-space-width]
  [fixture: block/db-grid-vt-directions]
  [fixture: block/header-vt-after]
  [fixture: block/db-grid-spaces-columns]
  [fixture: block/gram-grid-spaces-width]
  [fixture: block/gram-grid-spaces-space-width]
  [fixture: block/db-grid-spaces-directions]
  [fixture: block/db-grid-spaces-header-line]
  [fixture: block/db-grid-nel-columns]
  [fixture: block/gram-grid-nel-width]
  [fixture: block/gram-grid-nel-space-width]
  [fixture: block/gram-grid-nel-directions]
  [fixture: block/header-nel-after]
  [fixture: block/db-grid-semicolon-columns]
  [fixture: block/gram-grid-semicolon-width]
  [fixture: block/gram-grid-semicolon-space-width]
  [fixture: block/gram-grid-semicolon-directions]
  [fixture: block/db-grid-semicolon-header-line]
  [fixture: block/db-grid-hash-columns]
  [fixture: block/gram-grid-hash-width]
  [fixture: block/gram-grid-hash-space-width]
  [fixture: block/gram-grid-hash-directions]
  [fixture: block/db-grid-hash-header-line]
  [fixture: block/db-grid-percent-columns]
  [fixture: block/gram-grid-percent-width]
  [fixture: block/gram-grid-percent-space-width]
  [fixture: block/gram-grid-percent-directions]
  [fixture: block/db-grid-percent-header-line]
  [fixture: block/gram-grid-colon-columns]
  [fixture: block/gram-grid-colon-width]
  [fixture: block/gram-grid-colon-space-width]
  [fixture: block/gram-grid-colon-directions]
  [fixture: block/gram-grid-colon-header-line]
  [fixture: block/db-grid-comma-columns]
  [fixture: block/gram-grid-comma-width]
  [fixture: block/gram-grid-comma-space-width]
  [fixture: block/db-arrow-no-space]
  [fixture: block/db-grid-comma-header-line]
  [fixture: block/gram-grid-dash-columns]
  [fixture: block/gram-grid-dash-width]
  [fixture: block/gram-grid-dash-space-width]
  [fixture: block/gram-grid-dash-directions]
  [fixture: block/gram-grid-dash-header-line]
  [fixture: block/db-grid-pipe-columns]
  [fixture: block/gram-grid-pipe-width]
  [fixture: block/gram-grid-pipe-space-width]
  [fixture: block/gram-grid-pipe-directions]
  [fixture: block/db-grid-pipe-header-line]
  [fixture: block/gram-grid-quote-columns]
  [fixture: block/gram-grid-quote-width]
  [fixture: block/gram-grid-quote-space-width]
  [fixture: block/gram-grid-quote-directions]
  [fixture: block/gram-grid-quote-header-line]
  [fixture: block/db-grid-single-quote-columns]
  [fixture: block/gram-grid-single-quote-width]
  [fixture: block/gram-grid-single-quote-space-width]
  [fixture: block/gram-grid-single-quote-directions]
  [fixture: block/db-grid-single-quote-header-line]
  [fixture: block/db-grid-backtick-columns]
  [fixture: block/gram-grid-backtick-width]
  [fixture: block/gram-grid-backtick-space-width]
  [fixture: block/gram-grid-backtick-directions]
  [fixture: block/db-grid-backtick-header-line]
  [fixture: block/db-grid-backslash-columns]
  [fixture: block/gram-grid-backslash-width]
  [fixture: block/gram-grid-backslash-space-width]
  [fixture: block/gram-grid-backslash-directions]
  [fixture: block/db-grid-backslash-header-line]
  [fixture: block/gram-grid-open-square-columns]
  [fixture: block/gram-grid-open-square-width]
  [fixture: block/gram-grid-open-square-space-width]
  [fixture: block/gram-grid-open-square-directions]
  [fixture: block/gram-grid-open-square-header-line]
  [fixture: block/db-grid-close-square-columns]
  [fixture: block/gram-grid-close-square-width]
  [fixture: block/gram-grid-close-square-space-width]
  [fixture: block/gram-grid-close-square-directions]
  [fixture: block/db-grid-close-square-header-line]
  [fixture: block/gram-grid-open-round-columns]
  [fixture: block/gram-grid-open-round-width]
  [fixture: block/gram-grid-open-round-space-width]
  [fixture: block/gram-grid-open-round-directions]
  [fixture: block/gram-grid-open-round-header-line]
  [fixture: block/gram-grid-close-round-columns]
  [fixture: block/gram-grid-close-round-width]
  [fixture: block/gram-grid-close-round-space-width]
  [fixture: block/gram-grid-close-round-directions]
  [fixture: block/gram-grid-close-round-header-line]
  [fixture: block/gram-grid-open-brace-columns]
  [fixture: block/gram-grid-open-brace-width]
  [fixture: block/gram-grid-open-brace-space-width]
  [fixture: block/gram-grid-open-brace-directions]
  [fixture: block/gram-grid-open-brace-header-line]
  [fixture: block/gram-grid-close-brace-columns]
  [fixture: block/gram-grid-close-brace-width]
  [fixture: block/gram-grid-close-brace-space-width]
  [fixture: block/gram-grid-close-brace-directions]
  [fixture: block/gram-grid-close-brace-header-line]
  [fixture: block/gram-grid-less-than-columns]
  [fixture: block/gram-grid-less-than-width]
  [fixture: block/gram-grid-less-than-space-width]
  [fixture: block/gram-grid-less-than-directions]
  [fixture: block/gram-grid-less-than-header-line]
  [fixture: block/gram-grid-greater-than-columns]
  [fixture: block/gram-grid-greater-than-width]
  [fixture: block/gram-grid-greater-than-space-width]
  [fixture: block/gram-grid-greater-than-directions]
  [fixture: block/gram-grid-greater-than-header-line]
  [fixture: block/gram-grid-equals-columns]
  [fixture: block/gram-grid-equals-width]
  [fixture: block/gram-grid-equals-space-width]
  [fixture: block/gram-grid-equals-directions]
  [fixture: block/gram-grid-equals-header-line]
  [fixture: block/gram-grid-punct-columns]
  [fixture: block/gram-grid-punct-width]
  [fixture: block/gram-grid-punct-space-width]
  [fixture: block/gram-grid-punct-directions]
  [fixture: block/gram-grid-punct-header-line]
  [fixture: block/db-grid-arrow-columns]
  [fixture: block/gram-grid-arrow-width]
  [fixture: block/gram-grid-arrow-space-width]
  [fixture: block/gram-grid-arrow-directions]
  [fixture: block/gram-grid-arrow-header-line]
  [fixture: block/db-grid-arrow-spaced-columns]
  [fixture: block/gram-grid-arrow-spaced-width]
  [fixture: block/gram-grid-arrow-spaced-space-width]
  [fixture: block/gram-grid-arrow-spaced-directions]
  [fixture: block/gram-grid-arrow-spaced-header-line]
  [fixture: block/db-grid-comment-columns]
  [fixture: block/gram-grid-comment-width]
  [fixture: block/gram-grid-comment-space-width]
  [fixture: block/gram-grid-comment-directions]
  [fixture: block/db-grid-comment-header-line]
  [fixture: block/db-grid-comment-line-columns]
  [fixture: block/gram-grid-comment-line-width]
  [fixture: block/gram-grid-comment-line-space-width]
  [fixture: block/db-grid-comment-line-directions]
  [fixture: block/db-comment-line-first]
  [fixture: block/db-grid-directive-columns]
  [fixture: block/gram-grid-directive-width]
  [fixture: block/gram-grid-directive-space-width]
  [fixture: block/db-grid-directive-directions]
  [fixture: block/gram-grid-directive-header-line]
  [fixture: block/db-grid-directive-line-columns]
  [fixture: block/gram-grid-directive-line-width]
  [fixture: block/gram-grid-directive-line-space-width]
  [fixture: block/db-grid-directive-line-directions]
  [fixture: block/db-grid-directive-line-header-line]
  [fixture: block/db-grid-entity-columns]
  [fixture: block/gram-grid-entity-width]
  [fixture: block/gram-grid-entity-space-width]
  [fixture: block/gram-grid-entity-directions]
  [fixture: block/db-grid-entity-header-line]
  [fixture: block/db-grid-entity-named-columns]
  [fixture: block/gram-grid-entity-named-width]
  [fixture: block/gram-grid-entity-named-space-width]
  [fixture: block/gram-grid-entity-named-directions]
  [fixture: block/db-grid-entity-named-header-line]
  [fixture: block/gram-grid-html-columns]
  [fixture: block/gram-grid-html-width]
  [fixture: block/gram-grid-html-space-width]
  [fixture: block/gram-grid-html-directions]
  [fixture: block/gram-grid-html-header-line]
  [fixture: block/gram-grid-html-br-columns]
  [fixture: block/gram-grid-html-br-width]
  [fixture: block/gram-grid-html-br-space-width]
  [fixture: block/gram-grid-html-br-directions]
  [fixture: block/gram-grid-html-br-header-line]
  [fixture: block/gram-grid-html-attribute-columns]
  [fixture: block/gram-grid-html-attribute-width]
  [fixture: block/gram-grid-html-attribute-space-width]
  [fixture: block/gram-grid-html-attribute-directions]
  [fixture: block/gram-grid-html-attribute-header-line]
  [fixture: block/db-grid-ampersand-entity-columns]
  [fixture: block/gram-grid-ampersand-entity-width]
  [fixture: block/gram-grid-ampersand-entity-space-width]
  [fixture: block/gram-grid-ampersand-entity-directions]
  [fixture: block/db-grid-ampersand-entity-header-line]
  [fixture: block/gram-grid-keyword-end-columns]
  [fixture: block/gram-grid-keyword-end-width]
  [fixture: block/gram-grid-keyword-end-space-width]
  [fixture: block/gram-grid-keyword-end-directions]
  [fixture: block/gram-grid-keyword-end-header-line]
  [fixture: block/gram-grid-keyword-block-columns]
  [fixture: block/gram-grid-keyword-block-width]
  [fixture: block/gram-grid-keyword-block-space-width]
  [fixture: block/gram-grid-keyword-block-directions]
  [fixture: block/gram-grid-keyword-block-header-line]
  [fixture: block/db-grid-keyword-columns-columns]
  [fixture: block/gram-grid-keyword-columns-width]
  [fixture: block/gram-grid-keyword-columns-space-width]
  [fixture: block/gram-grid-keyword-columns-directions]
  [fixture: block/db-grid-keyword-columns-header-line]
  [fixture: block/db-grid-keyword-space-columns]
  [fixture: block/gram-grid-keyword-space-width]
  [fixture: block/gram-grid-keyword-space-space-width]
  [fixture: block/gram-grid-keyword-space-directions]
  [fixture: block/db-grid-keyword-space-header-line]
  [fixture: block/db-grid-keyword-class-columns]
  [fixture: block/gram-grid-keyword-class-width]
  [fixture: block/gram-grid-keyword-class-space-width]
  [fixture: block/gram-grid-keyword-class-directions]
  [fixture: block/db-grid-keyword-class-header-line]
  [fixture: block/gram-grid-keyword-style-columns]
  [fixture: block/gram-grid-keyword-style-width]
  [fixture: block/gram-grid-keyword-style-space-width]
  [fixture: block/gram-grid-keyword-style-directions]
  [fixture: block/gram-grid-keyword-style-header-line]
  [fixture: block/db-grid-keyword-classdef-columns]
  [fixture: block/gram-grid-keyword-classdef-width]
  [fixture: block/gram-grid-keyword-classdef-space-width]
  [fixture: block/gram-grid-keyword-classdef-directions]
  [fixture: block/db-grid-keyword-classdef-header-line]
  [fixture: block/gram-grid-keyword-header-columns]
  [fixture: block/gram-grid-keyword-header-width]
  [fixture: block/gram-grid-keyword-header-space-width]
  [fixture: block/gram-grid-keyword-header-directions]
  [fixture: block/gram-grid-keyword-header-header-line]
  [fixture: block/db-grid-proto-columns]
  [fixture: block/gram-grid-proto-width]
  [fixture: block/gram-grid-proto-space-width]
  [fixture: block/gram-grid-proto-directions]
  [fixture: block/gram-grid-proto-header-line]
  [fixture: block/db-grid-constructor-columns]
  [fixture: block/gram-grid-constructor-width]
  [fixture: block/gram-grid-constructor-space-width]
  [fixture: block/gram-grid-constructor-directions]
  [fixture: block/gram-grid-constructor-header-line]
  [fixture: block/db-grid-root-columns]
  [fixture: block/gram-grid-root-width]
  [fixture: block/gram-grid-root-space-width]
  [fixture: block/gram-grid-root-directions]
  [fixture: block/gram-grid-root-header-line]
  [fixture: block/db-grid-nonascii-columns]
  [fixture: block/gram-grid-nonascii-width]
  [fixture: block/gram-grid-nonascii-space-width]
  [fixture: block/gram-grid-nonascii-directions]
  [fixture: block/db-grid-nonascii-header-line]
  [fixture: block/db-grid-emoji-columns]
  [fixture: block/gram-grid-emoji-width]
  [fixture: block/gram-grid-emoji-space-width]
  [fixture: block/gram-grid-emoji-directions]
  [fixture: block/db-grid-emoji-header-line]
  [fixture: block/db-grid-digits-columns]
  [fixture: block/db-grid-digits-width]
  [fixture: block/db-grid-digits-space-width]
  [fixture: block/gram-grid-digits-directions]
  [fixture: block/gram-grid-digits-header-line]
  [fixture: block/db-grid-empty-columns]
  [fixture: block/gram-width-colon-only]
  [fixture: block/gram-space-no-number]
  [fixture: block/db-grid-empty-directions]
  [fixture: block/gram-grid-empty-header-line]
  [fixture: block/gram-grid-style-rule-columns]
  [fixture: block/gram-grid-style-rule-width]
  [fixture: block/gram-grid-style-rule-space-width]
  [fixture: block/gram-grid-style-rule-directions]
  [fixture: block/gram-grid-style-rule-header-line]
  [fixture: block/gram-grid-classdef-rule-columns]
  [fixture: block/gram-grid-classdef-rule-width]
  [fixture: block/gram-grid-classdef-rule-space-width]
  [fixture: block/gram-grid-classdef-rule-directions]
  [fixture: block/gram-grid-classdef-rule-header-line]
- 文の中の空白とコメント。
  字句解析器が空白で分ける文の部品の間（`columns` と数、
  `classDef` と名前やスタイル、`class` と id、`style` と id、`block:` と id、
  node と幅や shape や方向、辺と終わり）には、
  改行、空行、コメント行、ディレクティブ行を置けます。
  Db はそれらがないものとして読みます。
  例外は、`class` と `style` の id とクラス名・スタイルの間です。
  `class A` の後ろの改行は文を終え、名前は空になります。
  `style A` の後ろでは、スタイルが同じ行になければならず、拒否されます。
  [fixture: block/db-between-columns-comment-line]
  [fixture: block/db-between-columns-directive-line]
  [fixture: block/db-between-columns-empty-line]
  [fixture: block/db-between-columns-spaces-line]
  [fixture: block/db-between-class-def-name-comment-line]
  [fixture: block/db-between-class-def-name-directive-line]
  [fixture: block/db-between-class-def-name-empty-line]
  [fixture: block/db-between-class-def-name-spaces-line]
  [fixture: block/db-between-class-def-style-comment-line]
  [fixture: block/db-between-class-def-style-directive-line]
  [fixture: block/db-between-class-def-style-empty-line]
  [fixture: block/db-between-class-def-style-spaces-line]
  [fixture: block/db-between-class-ids-comment-line]
  [fixture: block/db-between-class-ids-directive-line]
  [fixture: block/db-between-class-ids-empty-line]
  [fixture: block/db-between-class-ids-spaces-line]
  [fixture: block/db-between-class-name-comment-line]
  [fixture: block/db-between-class-name-directive-line]
  [fixture: block/db-between-class-name-empty-line]
  [fixture: block/db-between-class-name-spaces-line]
  [fixture: block/db-between-style-ids-comment-line]
  [fixture: block/db-between-style-ids-directive-line]
  [fixture: block/db-between-style-ids-empty-line]
  [fixture: block/db-between-style-ids-spaces-line]
  [fixture: block/gram-between-style-text-comment-line]
  [fixture: block/gram-between-style-text-directive-line]
  [fixture: block/gram-between-style-text-empty-line]
  [fixture: block/gram-between-style-text-spaces-line]
  [fixture: block/db-between-composite-id-comment-line]
  [fixture: block/db-between-composite-id-directive-line]
  [fixture: block/db-between-composite-id-empty-line]
  [fixture: block/db-between-composite-id-spaces-line]
  [fixture: block/db-comment-between-id-and-width]
  [fixture: block/db-between-width-directive-line]
  [fixture: block/db-between-width-empty-line]
  [fixture: block/db-between-width-spaces-line]
  [fixture: block/db-between-edge-comment-line]
  [fixture: block/db-between-edge-directive-line]
  [fixture: block/db-between-edge-empty-line]
  [fixture: block/db-between-edge-spaces-line]
  [fixture: block/db-between-edge-end-comment-line]
  [fixture: block/db-between-edge-end-directive-line]
  [fixture: block/db-between-edge-end-empty-line]
  [fixture: block/db-between-edge-end-spaces-line]
  [fixture: block/db-between-shape-comment-line]
  [fixture: block/db-between-shape-directive-line]
  [fixture: block/db-between-shape-empty-line]
  [fixture: block/db-between-shape-spaces-line]
  [fixture: block/db-between-directions-comment-line]
  [fixture: block/db-between-directions-directive-line]
  [fixture: block/db-between-directions-empty-line]
  [fixture: block/db-between-directions-spaces-line]
- 文の行末に続くもの。
  `;`、空白と `;`、2 つの `;`、`%%` のコメント、ディレクティブ、
  閉じていないディレクティブ、末尾の空白、タブ、U+00A0、`# c` です。
  node、shape、幅、block arrow、`columns`、`space`、`end`、辺の後ろでは、
  空白の後ろの `;`、`%%`、`#` とその後ろのテキストは node です。
  id（node や辺の終わり）に付いた `;` は id の一部です。
  ディレクティブと末尾の空白は読まれません。
  `class`、`style`、`classDef` の後ろでは、クラス名やスタイルの一部です。
  ただし、行の規則と Db が取り除くものは別です。

  [fixture: block/db-tail-node-semicolon]
  [fixture: block/db-tail-node-space-semicolon]
  [fixture: block/db-semicolon-double]
  [fixture: block/db-tail-node-comment]
  [fixture: block/db-tail-node-comment-glued]
  [fixture: block/db-tail-node-directive]
  [fixture: block/db-directive-glued-to-id]
  [fixture: block/db-tail-node-directive-unclosed]
  [fixture: block/db-name-trailing-spaces]
  [fixture: block/db-tail-node-trailing-tab]
  [fixture: block/db-tail-node-trailing-nbsp]
  [fixture: block/db-tail-node-hash]
  [fixture: block/db-semicolon-after-shape]
  [fixture: block/db-tail-node-shape-space-semicolon]
  [fixture: block/db-tail-node-shape-two-semicolons]
  [fixture: block/db-tail-node-shape-comment]
  [fixture: block/db-tail-node-shape-comment-glued]
  [fixture: block/db-tail-node-shape-directive]
  [fixture: block/db-tail-node-shape-directive-glued]
  [fixture: block/db-tail-node-shape-directive-unclosed]
  [fixture: block/db-tail-node-shape-trailing-spaces]
  [fixture: block/db-tail-node-shape-trailing-tab]
  [fixture: block/db-tail-node-shape-trailing-nbsp]
  [fixture: block/db-tail-node-shape-hash]
  [fixture: block/db-semicolon-after-width]
  [fixture: block/db-tail-node-width-space-semicolon]
  [fixture: block/db-tail-node-width-two-semicolons]
  [fixture: block/db-tail-node-width-comment]
  [fixture: block/db-tail-node-width-comment-glued]
  [fixture: block/db-tail-node-width-directive]
  [fixture: block/db-tail-node-width-directive-glued]
  [fixture: block/db-tail-node-width-directive-unclosed]
  [fixture: block/db-tail-node-width-trailing-spaces]
  [fixture: block/db-tail-node-width-trailing-tab]
  [fixture: block/db-tail-node-width-trailing-nbsp]
  [fixture: block/db-tail-node-width-hash]
  [fixture: block/db-semicolon-after-edge]
  [fixture: block/db-tail-edge-space-semicolon]
  [fixture: block/db-tail-edge-two-semicolons]
  [fixture: block/db-comment-after-edge]
  [fixture: block/db-tail-edge-comment-glued]
  [fixture: block/db-tail-edge-directive]
  [fixture: block/db-tail-edge-directive-glued]
  [fixture: block/db-tail-edge-directive-unclosed]
  [fixture: block/db-tail-edge-trailing-spaces]
  [fixture: block/db-tail-edge-trailing-tab]
  [fixture: block/db-tail-edge-trailing-nbsp]
  [fixture: block/db-tail-edge-hash]
  [fixture: block/db-tail-edge-label-semicolon]
  [fixture: block/db-tail-edge-label-space-semicolon]
  [fixture: block/db-tail-edge-label-two-semicolons]
  [fixture: block/db-tail-edge-label-comment]
  [fixture: block/db-tail-edge-label-comment-glued]
  [fixture: block/db-tail-edge-label-directive]
  [fixture: block/db-tail-edge-label-directive-glued]
  [fixture: block/db-tail-edge-label-directive-unclosed]
  [fixture: block/db-tail-edge-label-trailing-spaces]
  [fixture: block/db-tail-edge-label-trailing-tab]
  [fixture: block/db-tail-edge-label-trailing-nbsp]
  [fixture: block/db-tail-edge-label-hash]
  [fixture: block/db-tail-block-arrow-semicolon]
  [fixture: block/db-tail-block-arrow-space-semicolon]
  [fixture: block/db-tail-block-arrow-two-semicolons]
  [fixture: block/db-tail-block-arrow-comment]
  [fixture: block/db-tail-block-arrow-comment-glued]
  [fixture: block/db-tail-block-arrow-directive]
  [fixture: block/db-tail-block-arrow-directive-glued]
  [fixture: block/db-tail-block-arrow-directive-unclosed]
  [fixture: block/db-tail-block-arrow-trailing-spaces]
  [fixture: block/db-tail-block-arrow-trailing-tab]
  [fixture: block/db-tail-block-arrow-trailing-nbsp]
  [fixture: block/db-tail-block-arrow-hash]
  [fixture: block/db-tail-columns-semicolon]
  [fixture: block/db-tail-columns-space-semicolon]
  [fixture: block/db-tail-columns-two-semicolons]
  [fixture: block/db-tail-columns-comment]
  [fixture: block/db-tail-columns-comment-glued]
  [fixture: block/db-tail-columns-directive]
  [fixture: block/db-tail-columns-directive-glued]
  [fixture: block/db-tail-columns-directive-unclosed]
  [fixture: block/db-tail-columns-trailing-spaces]
  [fixture: block/db-tail-columns-trailing-tab]
  [fixture: block/db-tail-columns-trailing-nbsp]
  [fixture: block/db-tail-columns-hash]
  [fixture: block/db-space-semicolon]
  [fixture: block/db-tail-space-space-semicolon]
  [fixture: block/db-tail-space-two-semicolons]
  [fixture: block/db-tail-space-comment]
  [fixture: block/db-tail-space-comment-glued]
  [fixture: block/db-tail-space-directive]
  [fixture: block/db-tail-space-directive-glued]
  [fixture: block/db-tail-space-directive-unclosed]
  [fixture: block/db-tail-space-trailing-spaces]
  [fixture: block/db-tail-space-trailing-tab]
  [fixture: block/db-tail-space-trailing-nbsp]
  [fixture: block/db-tail-space-hash]
  [fixture: block/db-tail-space-width-semicolon]
  [fixture: block/db-tail-space-width-space-semicolon]
  [fixture: block/db-tail-space-width-two-semicolons]
  [fixture: block/db-tail-space-width-comment]
  [fixture: block/db-tail-space-width-comment-glued]
  [fixture: block/db-tail-space-width-directive]
  [fixture: block/db-tail-space-width-directive-glued]
  [fixture: block/db-tail-space-width-directive-unclosed]
  [fixture: block/db-tail-space-width-trailing-spaces]
  [fixture: block/db-tail-space-width-trailing-tab]
  [fixture: block/db-tail-space-width-trailing-nbsp]
  [fixture: block/db-tail-space-width-hash]
  [fixture: block/db-class-apply-semicolon]
  [fixture: block/db-tail-class-space-semicolon]
  [fixture: block/db-tail-class-two-semicolons]
  [fixture: block/db-tail-class-comment]
  [fixture: block/db-tail-class-comment-glued]
  [fixture: block/db-tail-class-directive]
  [fixture: block/db-class-apply-directive]
  [fixture: block/db-tail-class-directive-unclosed]
  [fixture: block/db-class-apply-trailing-spaces]
  [fixture: block/db-tail-class-trailing-tab]
  [fixture: block/db-class-apply-nbsp]
  [fixture: block/db-tail-class-hash]
  [fixture: block/db-tail-style-semicolon]
  [fixture: block/db-tail-style-space-semicolon]
  [fixture: block/db-tail-style-two-semicolons]
  [fixture: block/db-tail-style-comment]
  [fixture: block/db-tail-style-comment-glued]
  [fixture: block/db-tail-style-directive]
  [fixture: block/db-tail-style-directive-glued]
  [fixture: block/db-tail-style-directive-unclosed]
  [fixture: block/db-tail-style-trailing-spaces]
  [fixture: block/db-tail-style-trailing-tab]
  [fixture: block/db-tail-style-trailing-nbsp]
  [fixture: block/db-tail-style-hash]
  [fixture: block/db-tail-class-def-semicolon]
  [fixture: block/db-tail-class-def-space-semicolon]
  [fixture: block/db-tail-class-def-two-semicolons]
  [fixture: block/db-tail-class-def-comment]
  [fixture: block/db-tail-class-def-comment-glued]
  [fixture: block/db-directive-class-def-line]
  [fixture: block/db-tail-class-def-directive-glued]
  [fixture: block/db-tail-class-def-directive-unclosed]
  [fixture: block/db-tail-class-def-trailing-spaces]
  [fixture: block/db-tail-class-def-trailing-tab]
  [fixture: block/db-tail-class-def-trailing-nbsp]
  [fixture: block/db-tail-class-def-hash]
  [fixture: block/db-composite-end-semicolon]
  [fixture: block/db-tail-composite-end-space-semicolon]
  [fixture: block/db-tail-composite-end-two-semicolons]
  [fixture: block/db-composite-end-comment]
  [fixture: block/db-tail-composite-end-comment-glued]
  [fixture: block/db-tail-composite-end-directive]
  [fixture: block/db-tail-composite-end-directive-glued]
  [fixture: block/db-tail-composite-end-directive-unclosed]
  [fixture: block/db-tail-composite-end-trailing-spaces]
  [fixture: block/db-composite-end-tab]
  [fixture: block/db-composite-end-nbsp]
  [fixture: block/db-tail-composite-end-hash]
  [fixture: block/db-tail-composite-end-keyword-semicolon]
  [fixture: block/db-tail-composite-end-keyword-space-semicolon]
  [fixture: block/db-tail-composite-end-keyword-two-semicolons]
  [fixture: block/db-tail-composite-end-keyword-comment]
  [fixture: block/db-tail-composite-end-keyword-comment-glued]
  [fixture: block/db-tail-composite-end-keyword-directive]
  [fixture: block/db-tail-composite-end-keyword-directive-glued]
  [fixture: block/db-tail-composite-end-keyword-directive-unclosed]
  [fixture: block/db-tail-composite-end-keyword-trailing-spaces]
  [fixture: block/db-tail-composite-end-keyword-trailing-tab]
  [fixture: block/db-tail-composite-end-keyword-trailing-nbsp]
  [fixture: block/db-tail-composite-end-keyword-hash]

- 要約は、mermaid.js のどの `securityLevel`（`strict`、`loose`、`antiscript`、
  `sandbox`）でも同じです。
  サイトの設定（`block` の設定 `padding` と `useMaxWidth`、テーマ、look、
  `htmlLabels`、`flowchart.htmlLabels`、`maxTextSize`、
  `deterministicIds`）でも同じで、これらは描画に働き、Db には働きません。
  その値のどれでもない `securityLevel` では、Db が無害化するテキスト、
  つまり node、block arrow、composite、辺の label に、置き換えた文字が入ります。
  `<` は `&lt;`、`>` は `&gt;`、`<br>` は `<br/>` で、id、スタイル、クラス、
  方向は書かれたとおりです。
  [fixture: block/config-block-padding]
  [fixture: block/config-block-use-max-width]
  [fixture: block/config-deterministic-ids]
  [fixture: block/config-flowchart-html-labels-false]
  [fixture: block/config-html-labels-false]
  [fixture: block/config-look-neo]
  [fixture: block/config-max-text-size-small]
  [fixture: block/config-security-level-antiscript-all]
  [fixture: block/config-security-level-loose-all]
  [fixture: block/config-security-level-other-all]
  [fixture: block/config-security-level-other-ampersand]
  [fixture: block/config-security-level-other-block-arrow-label]
  [fixture: block/config-security-level-other-br]
  [fixture: block/config-security-level-other-class-style]
  [fixture: block/config-security-level-other-composite-label]
  [fixture: block/config-security-level-other-directions]
  [fixture: block/config-security-level-other-edge-label]
  [fixture: block/config-security-level-other-empty-label-space]
  [fixture: block/config-security-level-other-label]
  [fixture: block/config-security-level-other-style]
  [fixture: block/config-security-level-sandbox-all]
  [fixture: block/config-security-level-strict-all]
  [fixture: block/config-theme-dark]
- `block:` の後ろの id では、空白以外の文字は node の id と同じに読みます。
  `;`、`#`、`%`、`,`、`|`、`'`、`"`、バッククォート、バックスラッシュ、`]`、
  `%%`、文字参照、`&amp;`、
  `__proto__`、`constructor`、`root`、ASCII の外の文字、絵文字、
  数字は id の一部です。
  中のディレクティブは取り除かれ、コメント行は id を終えます。
  中の矢印は文を辺の文にし、composite は id を持ちません。
  id の後ろの `columns 2`、`space`、`class A c`、
  `classDef c fill:red` は composite の文です。
  `style A fill:red` は拒否され、`[`、`(`、`{`、`)`、`}`、`<`、`>`、`=`、`:`、
  HTML、続く句読点、行の規則、`end`、`block`、`block-beta` も拒否されます。
  [fixture: block/db-grid-semicolon-composite-id]
  [fixture: block/db-grid-hash-composite-id]
  [fixture: block/db-grid-percent-composite-id]
  [fixture: block/gram-grid-colon-composite-id]
  [fixture: block/db-grid-comma-composite-id]
  [fixture: block/gram-composite-id-with-dash]
  [fixture: block/db-grid-pipe-composite-id]
  [fixture: block/db-grid-quote-composite-id]
  [fixture: block/db-grid-single-quote-composite-id]
  [fixture: block/db-grid-backtick-composite-id]
  [fixture: block/db-grid-backslash-composite-id]
  [fixture: block/gram-grid-open-square-composite-id]
  [fixture: block/db-grid-close-square-composite-id]
  [fixture: block/gram-grid-open-round-composite-id]
  [fixture: block/gram-grid-close-round-composite-id]
  [fixture: block/gram-grid-open-brace-composite-id]
  [fixture: block/gram-grid-close-brace-composite-id]
  [fixture: block/gram-grid-less-than-composite-id]
  [fixture: block/gram-grid-greater-than-composite-id]
  [fixture: block/gram-grid-equals-composite-id]
  [fixture: block/gram-grid-punct-composite-id]
  [fixture: block/db-grid-arrow-composite-id]
  [fixture: block/db-grid-arrow-spaced-composite-id]
  [fixture: block/db-grid-comment-composite-id]
  [fixture: block/db-grid-comment-line-composite-id]
  [fixture: block/div-grid-directive-composite-id]
  [fixture: block/db-grid-directive-line-composite-id]
  [fixture: block/db-grid-entity-composite-id]
  [fixture: block/db-grid-entity-named-composite-id]
  [fixture: block/gram-grid-html-composite-id]
  [fixture: block/gram-grid-html-br-composite-id]
  [fixture: block/gram-grid-html-attribute-composite-id]
  [fixture: block/db-grid-ampersand-entity-composite-id]
  [fixture: block/gram-grid-keyword-end-composite-id]
  [fixture: block/gram-grid-keyword-block-composite-id]
  [fixture: block/db-grid-keyword-columns-composite-id]
  [fixture: block/db-grid-keyword-space-composite-id]
  [fixture: block/db-grid-keyword-class-composite-id]
  [fixture: block/gram-grid-keyword-style-composite-id]
  [fixture: block/db-grid-keyword-classdef-composite-id]
  [fixture: block/gram-grid-keyword-header-composite-id]
  [fixture: block/db-grid-proto-composite-id]
  [fixture: block/db-grid-constructor-composite-id]
  [fixture: block/db-grid-root-composite-id]
  [fixture: block/db-grid-nonascii-composite-id]
  [fixture: block/db-grid-emoji-composite-id]
  [fixture: block/db-grid-digits-composite-id]
  [fixture: block/db-grid-empty-composite-id]
  [fixture: block/gram-grid-style-rule-composite-id]
  [fixture: block/gram-grid-classdef-rule-composite-id]
- node のある行で開いて `end` で閉じない composite は、node の後ろに `;`、
  コメント、ディレクティブ、`#`、末尾の空白があっても、
  なくても同じように拒否されます。
  [fixture: block/gram-tail-composite-line-comment]
  [fixture: block/gram-tail-composite-line-comment-glued]
  [fixture: block/gram-tail-composite-line-directive]
  [fixture: block/gram-tail-composite-line-directive-glued]
  [fixture: block/gram-tail-composite-line-directive-unclosed]
  [fixture: block/gram-tail-composite-line-hash]
  [fixture: block/gram-tail-composite-line-semicolon]
  [fixture: block/gram-tail-composite-line-space-semicolon]
  [fixture: block/gram-tail-composite-line-trailing-nbsp]
  [fixture: block/gram-tail-composite-line-trailing-spaces]
  [fixture: block/gram-tail-composite-line-trailing-tab]
  [fixture: block/gram-tail-composite-line-two-semicolons]
- mermaid.js のテスト、ドキュメント、デモの入力は、どれも受理されます。
  書き手が使う形を示しています。
  node、幅、shape、block arrow、`space`、`columns` のある composite、
  label のある辺、クラスとスタイルです。
  [fixture: block/demo-block-0f7b1b81]
  [fixture: block/demo-block-2472aba6]
  [fixture: block/demo-block-44d70be5]
  [fixture: block/demo-block-7d24edf7]
  [fixture: block/demo-block-8b6e7c41]
  [fixture: block/demo-block-a8323c64]
  [fixture: block/demo-block-b3231b02]
  [fixture: block/demo-block-b4d9a28a]
  [fixture: block/demo-block-ca540acf]
  [fixture: block/demo-block-f71819c7]
  [fixture: block/demo-block-fbbaee87]
  [fixture: block/docs-syntax-block-0c75f481]
  [fixture: block/docs-syntax-block-0eeed10a]
  [fixture: block/docs-syntax-block-1493c734]
  [fixture: block/docs-syntax-block-1d2ef9d1]
  [fixture: block/docs-syntax-block-24e2536f]
  [fixture: block/docs-syntax-block-2a2aedc0]
  [fixture: block/docs-syntax-block-3eeec690]
  [fixture: block/docs-syntax-block-50dc2ed1]
  [fixture: block/docs-syntax-block-668adabd]
  [fixture: block/docs-syntax-block-66fde579]
  [fixture: block/docs-syntax-block-6a5c5e67]
  [fixture: block/docs-syntax-block-6dd28f68]
  [fixture: block/docs-syntax-block-6fbaef0c]
  [fixture: block/docs-syntax-block-7134441c]
  [fixture: block/docs-syntax-block-715f1762]
  [fixture: block/docs-syntax-block-78e30a8a]
  [fixture: block/docs-syntax-block-7c6756e8]
  [fixture: block/docs-syntax-block-7ddc4030]
  [fixture: block/docs-syntax-block-8c1f8d53]
  [fixture: block/docs-syntax-block-a5a467c8]
  [fixture: block/docs-syntax-block-ab04e715]
  [fixture: block/docs-syntax-block-b6eebb8c]
  [fixture: block/docs-syntax-block-bd54fe8a]
  [fixture: block/docs-syntax-block-c1690d0b]
  [fixture: block/docs-syntax-block-c574652d]
  [fixture: block/docs-syntax-block-e29ee1ca]
  [fixture: block/docs-syntax-block-f3c3e654]
  [fixture: block/docs-syntax-block-f8418640]
  [fixture: block/docs-syntax-block-fd481f6b]
  [fixture: block/docs-syntax-block-fddacaac]
  [fixture: block/spec-block-0365699a]
  [fixture: block/spec-block-12f308cf]
  [fixture: block/spec-block-17e824ed]
  [fixture: block/spec-block-1b677ef0]
  [fixture: block/spec-block-256830d9]
  [fixture: block/spec-block-269adfec]
  [fixture: block/spec-block-324a07d6]
  [fixture: block/spec-block-39bb98c0]
  [fixture: block/spec-block-48aaf41f]
  [fixture: block/spec-block-52e0ec56]
  [fixture: block/spec-block-6382a25a]
  [fixture: block/spec-block-855ca1c9]
  [fixture: block/spec-block-870f6dc9]
  [fixture: block/spec-block-946762fc]
  [fixture: block/spec-block-9a645429]
  [fixture: block/spec-block-a3184350]
  [fixture: block/spec-block-ae4c1db0]
  [fixture: block/spec-block-be5706bf]
  [fixture: block/spec-block-cc1ee20b]
  [fixture: block/spec-block-cd0ecd2d]
  [fixture: block/spec-block-cf4d00b8]
  [fixture: block/spec-block-color-index-29ce8f4b]
  [fixture: block/spec-block-color-index-7228003b]
  [fixture: block/spec-block-color-index-9a40ae65]
  [fixture: block/spec-block-color-index-dd469c8d]
  [fixture: block/spec-block-d0ba877e]
  [fixture: block/spec-block-d1395cc6]
  [fixture: block/spec-block-ee611de8]
  [fixture: block/spec-block-f4c30090]
  [fixture: block/spec-block-f6ceb4d8]
  [fixture: block/spec-block-fd3dd910]
  [fixture: block/spec-block-ff426370]
- C4 図の検出器は、`C4Container`、`C4Component`、`C4Dynamic`、
  `C4Deployment` をテキストのどこにあっても読み、
  他の検出器は C4 の検出器のあとで読みます。
  そのため、これらのどれかを含むテキストは、
  どこにあっても block 図として検出されず、C4 図の字句解析器に拒否されます。
  どこにあってもとは、id、label、辺の label、composite の id や label、
  クラスの名前やスタイル、クラス名、スタイル、見出しの前です。
  `C4Context` はテキストの先頭でだけ検出されるので、block 図では id です。
  コメント行、ディレクティブ、フロントマターは検出器が読む前に取り除かれ、
  その中の語は何もしません。
  語はこの大文字小文字のとおりに読みます。
  [fixture: block/div-c4-component-in-id]
  [fixture: block/div-c4-container-after-node]
  [fixture: block/gram-c4-container-before-header]
  [fixture: block/div-c4-container-in-class-def-name]
  [fixture: block/div-c4-container-in-class-def-style]
  [fixture: block/div-c4-container-in-class-name]
  [fixture: block/db-c4-container-in-comment-line]
  [fixture: block/div-c4-container-in-composite-id]
  [fixture: block/div-c4-container-in-composite-label]
  [fixture: block/db-c4-container-in-directive]
  [fixture: block/div-c4-container-in-edge-label]
  [fixture: block/db-c4-container-in-frontmatter]
  [fixture: block/div-c4-container-in-id]
  [fixture: block/div-c4-container-in-label]
  [fixture: block/div-c4-container-in-style]
  [fixture: block/db-c4-container-lower-case]
  [fixture: block/div-c4-container-with-context]
  [fixture: block/db-c4-context-in-id]
  [fixture: block/db-c4-context-lower-case]
  [fixture: block/div-c4-deployment-in-id]
  [fixture: block/div-c4-dynamic-in-id]
- `default`、`linkStyle`、`interpolate` は字句解析器の語で、
  block 図のどの文もこれを受け付けません。
  id として、node の後ろで、`linkStyle` の文として使うと拒否されます。
  `DEFAULT`、`defaultx`、`linkStylex`、`interpolatex` は id で、
  3 つの語は label、クラス名、スタイルの中ではテキストです。
  `default` は `classDef` ではクラスの名前になれます。
  [fixture: block/gram-name-reserved-default]
  [fixture: block/gram-name-reserved-default-after-node]
  [fixture: block/db-name-reserved-default-in-class-def]
  [fixture: block/db-name-reserved-default-in-label]
  [fixture: block/db-name-reserved-default-in-style]
  [fixture: block/db-name-reserved-default-prefix]
  [fixture: block/db-name-reserved-default-upper]
  [fixture: block/gram-name-reserved-interpolate]
  [fixture: block/gram-name-reserved-interpolate-after-node]
  [fixture: block/db-name-reserved-interpolate-prefix]
  [fixture: block/gram-name-reserved-link-style]
  [fixture: block/db-name-reserved-link-style-in-class]
  [fixture: block/db-name-reserved-link-style-in-label]
  [fixture: block/db-name-reserved-link-style-prefix]
  [fixture: block/gram-name-reserved-link-style-statement]
- 空の文字列 `""` と空の markdown 文字列 `"``"` は字句を作らないので、
  文のどこに置いても読み飛ばされます。
  文の間、id・辺・shape・幅・`end` の前後、composite の前、
  composite の中がその例で、2 つ続いても読み飛ばされます。
  id に付いた `""` は id の一部です。
  これだけのテキストは拒否され、3 つ続く引用符（空の文字列と引用符）、
  空白 1 つの markdown 文字列、
  辺の label を始める空の label の後ろの 2 つ目の文字列も拒否されます。
  `columns` と数の間の空の文字列は読み飛ばされますが、
  その両側の空白が `columns` を node にし、数を別の node にします。
  [fixture: block/div-empty-string-after-edge]
  [fixture: block/div-empty-string-after-id]
  [fixture: block/div-empty-string-before-block-key]
  [fixture: block/div-empty-string-before-columns-number]
  [fixture: block/div-empty-string-before-edge]
  [fixture: block/div-empty-string-before-end]
  [fixture: block/div-empty-string-before-shape]
  [fixture: block/div-empty-string-before-width]
  [fixture: block/div-empty-string-between]
  [fixture: block/gram-empty-string-between-edge-parts]
  [fixture: block/div-empty-string-first-in-line]
  [fixture: block/db-empty-string-glued-to-id]
  [fixture: block/div-empty-string-in-composite]
  [fixture: block/div-empty-string-line]
  [fixture: block/gram-empty-string-only]
  [fixture: block/gram-empty-string-three-quotes]
  [fixture: block/div-empty-strings-two]
  [fixture: block/div-empty-markdown-between]
  [fixture: block/div-empty-markdown-line]
  [fixture: block/gram-empty-markdown-only]
  [fixture: block/gram-empty-markdown-spaces]
- 空の `accDescr` ブロック `accDescr {}` も字句を作りません。
  中に空白、改行、コメント行があっても、波括弧の前に空白がなくても同じです。
  文の間、2 つの id の間、辺の後ろ、`columns` の前、composite の中、
  `end` の前で読み飛ばされ、2 つ続いても読み飛ばされます。
  ただし、それだけを持つ composite は文を持たず、
  それだけのテキストは拒否されます。
  テキストのあるブロック、`ACCDESCR {}`、`accDescr: {}`、
  閉じていないブロックは拒否されます。
  文字列の中の `accDescr {}` はテキストです。
  見出しの行では読み飛ばされ、テキストのあるブロックは拒否されます。
  `columns` と数の間では読み飛ばされ、
  その周りの空白が `columns` を node にします。
  [fixture: block/gram-empty-block-as-only-statement-in-composite]
  [fixture: block/db-empty-block-before-columns]
  [fixture: block/db-empty-block-before-end]
  [fixture: block/db-empty-block-between]
  [fixture: block/db-empty-block-between-columns-and-number]
  [fixture: block/db-empty-block-glued-brace]
  [fixture: block/db-empty-block-glued-to-id]
  [fixture: block/db-empty-block-in-composite]
  [fixture: block/div-empty-block-in-edge]
  [fixture: block/db-empty-block-in-label]
  [fixture: block/db-empty-block-line]
  [fixture: block/db-empty-block-line-feed]
  [fixture: block/gram-empty-block-only]
  [fixture: block/db-empty-block-spaces]
  [fixture: block/gram-empty-block-then-colon]
  [fixture: block/db-empty-block-twice]
  [fixture: block/gram-empty-block-unclosed]
  [fixture: block/gram-empty-block-upper-case]
  [fixture: block/db-empty-block-with-comment-line]
  [fixture: block/db-empty-block-on-header-line]
  [fixture: block/gram-description-block-on-header-line]
  [fixture: block/gram-empty-block-with-text]
- shape は、括弧の中に空白を許しません。
  `A[ "x" ]`、`A[ "x"]`、`A["x" ]`、括弧の中の改行、`A<[ "x" ]>(right)`、
  2 つの文字列は拒否されます。
  shape の前の空白は許され（`A ("x")`）、方向の括弧の中の空白も許されます。
  方向の括弧の中の空白と改行は方向のテキストの一部です。
  `[|` と終わり `]` の組は type を持たず、
  `)))` は `))` と `)` として読まれて拒否され、知らない方向は拒否されます。
  [fixture: block/db-spec-bracket-pipe]
  [fixture: block/gram-spec-triple-round-start]
  [fixture: block/db-spec-space-before-round]
  [fixture: block/gram-spec-spaces-inside-square]
  [fixture: block/gram-spec-space-before-string]
  [fixture: block/gram-spec-space-after-string]
  [fixture: block/gram-spec-line-feed-inside-square]
  [fixture: block/gram-spec-two-strings]
  [fixture: block/gram-spec-spaces-inside-block-arrow]
  [fixture: block/db-spec-spaces-around-directions]
  [fixture: block/db-spec-directions-line-feeds]
  [fixture: block/gram-spec-directions-unknown]
- `->` は辺でなく、`A --> block` は composite を開いて拒否されます。
  `:::`、`::`、`A:::` の後ろのクラス名も拒否されます。
  字句解析器が `:` で止まるからです。
  ディレクティブは、矢印の中、`<` の後ろ、矢じりの前、
  label を始めるダッシュの中で取り除かれ、部分がつながります。
  `--` の 2 つのダッシュの間のものは `A -- B` を残し、拒否されます。
  辺の label の周りの空白は何も変えず、label の中の 2 つの文字列は拒否されます。
  [fixture: block/gram-spec-single-dash-arrow]
  [fixture: block/gram-spec-edge-to-block-keyword]
  [fixture: block/gram-spec-colon-colon-colon]
  [fixture: block/gram-spec-colon-colon]
  [fixture: block/gram-spec-colon-colon-colon-two]
  [fixture: block/div-spec-edge-directive-in-arrow]
  [fixture: block/div-spec-edge-directive-before-head]
  [fixture: block/gram-spec-edge-directive-in-dashes]
  [fixture: block/div-spec-edge-directive-in-start]
  [fixture: block/div-spec-edge-directive-in-label-start]
  [fixture: block/db-spec-edge-label-spaces-around]
  [fixture: block/gram-spec-edge-label-two-strings]
- `block:` の後ろの id は、次の行にあってもかまいません。
  `block:` の後ろの空白が改行を含むからです。
  `classDef` のスタイルも、同じ理由で名前の次の行に置けます。
  そのとき、その行は文であってもスタイルです。
  `classDef c` の次の行の `class A c` は、
  クラス `c` のスタイル `class A c` になります。
  id の中の引用符はその一部で、引用符の後ろの空白が id を終えます。
  `%%` と `%` は、付いていれば id の一部です。
  [fixture: block/db-spec-composite-lf-id]
  [fixture: block/db-spec-class-def-next-line-styles]
  [fixture: block/db-spec-class-def-next-line-two]
  [fixture: block/db-spec-class-def-name-only-then-class]
  [fixture: block/db-spec-id-with-quoted-part]
  [fixture: block/db-spec-id-comment-glued]
  [fixture: block/db-spec-percent-id]
- Db がブロックを集める手順です。
  テキスト全体を構文解析し終えたあとで、Db は文をテキストの順に、
  子の並びを 1 つずつたどり、composite は出会った時点でその中に入ります。
  composite はまず表に入り、次にその子が順に入り（composite は自分の子より先、
  子は並びの次のブロックより先）、そのあとに次のブロックが入ります。
  Db がすでに表に持つブロックを定義する文（node、shape、composite、
  辺の終わり）は、新しいブロックを作りません。
  古いブロックを更新します。
  type は、新しい定義の type が `na` でなければそれになり、
  label は id と違えば新しい label になります。
  幅、方向、`columns`、クラス、スタイル、子は、そのまま残ります。
  新しいブロックは捨てられ、composite の子の並びも捨てられます。
  辺は、たどるときに辺の並びに加わります。composite の中でも同じで、
  端のブロックが何であっても同じです。
  composite の中でも外でも使ったブロックは、最初に使った場所に残ります。
  [fixture: block/db-collecting-child-first-then-outer]
  [fixture: block/db-collecting-columns-per-composite]
  [fixture: block/db-collecting-composite-then-node-shape-width]
  [fixture: block/db-collecting-depth-first]
  [fixture: block/db-collecting-edge-order-in-composite]
  [fixture: block/db-collecting-edge-then-redefine]
  [fixture: block/db-collecting-redefine-keeps-directions]
  [fixture: block/db-collecting-redefine-label-equal-id]
  [fixture: block/db-collecting-redefine-label-only-odd]
  [fixture: block/db-collecting-redefine-type-na-keeps]
  [fixture: block/db-collecting-two-composites-share-child]
  [fixture: block/db-shape-redefine-from-na]
  [fixture: block/db-shape-redefine-label-only]
  [fixture: block/db-shape-redefine-same-label]
  [fixture: block/db-shape-redefine-shape]
  [fixture: block/db-shape-redefine-to-na]
  [fixture: block/db-shape-redefine-to-odd]
  [fixture: block/db-shape-redefine-width]
  [fixture: block/db-definitions-class-def-three]
  [fixture: block/db-definitions-class-def-three-others]
  [fixture: block/db-definitions-class-three]
  [fixture: block/db-definitions-class-three-ids]
  [fixture: block/db-definitions-columns-three]
  [fixture: block/db-definitions-composite-then-shape-then-composite]
  [fixture: block/db-definitions-edges-three]
  [fixture: block/db-definitions-shape-then-composite-then-shape]
  [fixture: block/db-definitions-space-three]
  [fixture: block/db-definitions-style-three]
  [fixture: block/db-definitions-style-three-empty-middle]
  [fixture: block/db-definitions-three-arrows]
  [fixture: block/db-definitions-three-composites]
  [fixture: block/db-definitions-three-edge-and-node]
  [fixture: block/db-definitions-three-edge-ends]
  [fixture: block/db-definitions-three-labels-first-equal]
  [fixture: block/db-definitions-three-na-in-the-middle]
  [fixture: block/db-definitions-three-shapes]
  [fixture: block/db-definitions-three-widths]
  [fixture: block/db-composite-id-same-as-node-before]
  [fixture: block/db-composite-id-same-as-node-after]
  [fixture: block/db-composite-id-same-as-node-after-shape]
  [fixture: block/db-composite-id-same-composite]
  [fixture: block/db-composite-id-same-nested]
  [fixture: block/db-composite-id-same-as-child]
  [fixture: block/db-composite-id-same-child-defined-in-inner]
  [fixture: block/db-width-redefine]
  [fixture: block/db-width-redefine-without]
  [fixture: block/db-width-redefine-first]
  [fixture: block/db-arrow-redefine]
  [fixture: block/db-arrow-redefine-from-square]
  [fixture: block/db-arrow-redefine-to-square]
  [fixture: block/db-edge-keeps-shape]
  [fixture: block/db-edge-keeps-width]
  [fixture: block/db-edge-redefine-by-edge]
  [fixture: block/db-edge-edge-in-composite-order]
- ブロックの表は、ブロックを入れた順に持ち、図を持つブロックが最初です。
  `unplaced` は、図を持つブロックから子の並びをたどって届かない表の項目を、
  表の順に並べます。
  `space` の文の項目は除きます
  （`space` の文の項目は type が `space` で、id は Db が作ったものです。
  幅は幅の分のブロックが持ち、`space:0` はブロックを作りません）。
  ほかの載せたブロックの `children` が持つブロックは、そこにだけ載せます。
  そのため、捨てられた composite は子と一緒に載り、子は重ねて載りません。
  捨てられた composite のブロック、
  まだ定義のない id、または見つからなかった id（`class A, B c`）に
  `class` が作ったブロック、
  その id の後の定義が更新したブロックは `unplaced` です。
  辺、`class`、`style` は、それをほかのブロックと同じように見つけます。
  捨てられた composite と一緒に失われるのは `columns` と幅で、
  古いブロックは取りません。
  [fixture: block/db-unplaced-class-on-unplaced-child]
  [fixture: block/db-unplaced-columns-in-dropped]
  [fixture: block/db-unplaced-dropped-with-label]
  [fixture: block/db-unplaced-dropped-with-width]
  [fixture: block/db-unplaced-edge-into-dropped]
  [fixture: block/db-unplaced-nested-composite]
  [fixture: block/db-unplaced-order]
  [fixture: block/db-unplaced-order-defined-later]
  [fixture: block/db-unplaced-space]
  [fixture: block/db-unplaced-style-on-unplaced]
  [fixture: block/db-class-apply-undefined-id]
  [fixture: block/db-class-apply-before-node]
  [fixture: block/db-class-apply-before-node-shape]
  [fixture: block/db-class-apply-before-node-width]
  [fixture: block/db-class-apply-before-edge]
  [fixture: block/db-class-apply-before-block]
  [fixture: block/db-class-apply-undefined-twice]
  [fixture: block/db-class-apply-undefined-list]
  [fixture: block/db-class-apply-mixed-list]
  [fixture: block/db-class-apply-in-block-later]
  [fixture: block/db-style-class-made]
  [fixture: block/db-composite-id-same-as-node-before]
  [fixture: block/db-composite-id-same-composite]
  [fixture: block/db-composite-id-same-nested]
  [fixture: block/db-space-class]
  [fixture: block/db-space-width-zero]
  [fixture: block/db-space-in-composite]
- shape の type は、それを開く文字列と閉じる文字列の組で決まります。
  字句解析器がこの 2 つを別々に読みます。
  開きは規則の順に、`-)`、`(-`、`))`、`)`、`(((`、`((`、`{{`、`{`、`>`、`([`、
  `(`、`[[`、`[|`、`[(`、`)))`、`[\`、`[/`、`[` のどれかです。
  閉じは、`(((`、`)))`、`))`、`}}`、`}`、`(-`、`-)`、`((`、`]]`、`(`、`])`、
  `\]`、`/]`、`)]`、`)`、`]>`、`]` のうち、最初に合うものです。
  `[` と `]`、`(` と `)`、`((` と `))`、`(((` と `)))`、`([` と `])`、
  `[[` と `]]`、`[(` と `)]`、`{` と `}`、`{{` と `}}`、`>` と `]`、
  `[/` と `/]`、`[\` と `\]`、`[/` と `\]`、
  `[\` と `/]` の組が type を持ちます。
  それ以外の組は、どの閉じの字句で終わっても type を持たず（`na`）、
  label は残ります。
  方向のない `]>` で閉じた shape は block arrow でなく、
  `<[` を普通の `]` で閉じると拒否されます。
  [fixture: block/db-closer-arrow-open-with-bracket]
  [fixture: block/db-closer-backslash-open-with-bracket]
  [fixture: block/gram-closer-block-arrow-open-with-bracket]
  [fixture: block/db-closer-brace-brace-pair]
  [fixture: block/db-closer-circle-then-triple-close]
  [fixture: block/db-closer-double-circle-then-double-close]
  [fixture: block/db-closer-hexagon-single-close]
  [fixture: block/db-closer-round-then-paren-bracket]
  [fixture: block/db-closer-slash-open-with-bracket]
  [fixture: block/db-closer-square-then-arrow-close]
  [fixture: block/db-closer-square-then-backslash-bracket]
  [fixture: block/db-closer-square-then-brace]
  [fixture: block/db-closer-square-then-double-brace]
  [fixture: block/db-closer-square-then-double-open]
  [fixture: block/db-closer-square-then-double-paren-close]
  [fixture: block/db-closer-square-then-minus-close]
  [fixture: block/db-closer-square-then-minus-open]
  [fixture: block/db-closer-square-then-paren-bracket]
  [fixture: block/db-closer-square-then-paren-close-bracket]
  [fixture: block/db-closer-square-then-round-open]
  [fixture: block/db-closer-square-then-slash-bracket]
  [fixture: block/db-closer-square-then-triple-close]
  [fixture: block/db-closer-square-then-triple-open]
  [fixture: block/db-shape-odd-left]
  [fixture: block/db-shape-odd-double]
  [fixture: block/db-shape-minus-round]
  [fixture: block/db-shape-minus-reverse]
  [fixture: block/db-shape-mixed-round-square]
  [fixture: block/db-shape-mixed-square-round]
  [fixture: block/db-shape-mixed-arrow-brace]
  [fixture: block/db-shape-mixed-brace-square]
  [fixture: block/db-shape-mixed-double]
  [fixture: block/db-shape-mixed-circle-stadium]
  [fixture: block/db-shape-extra-close]
  [fixture: block/db-shape-square]
  [fixture: block/db-shape-round]
  [fixture: block/db-shape-circle]
  [fixture: block/db-shape-doublecircle]
  [fixture: block/db-shape-stadium]
  [fixture: block/db-shape-subroutine]
  [fixture: block/db-shape-cylinder]
  [fixture: block/db-shape-diamond]
  [fixture: block/db-shape-hexagon]
  [fixture: block/db-shape-rect-left-inv-arrow]
  [fixture: block/db-shape-lean-right]
  [fixture: block/db-shape-lean-left]
  [fixture: block/db-shape-trapezoid]
  [fixture: block/db-shape-inv-trapezoid]
  [fixture: block/db-shape-block-arrow]

## kanban

`normalizeKanban()`（`src/normalizers/kanban.ts`）は、
内部の列一覧と統合せず、
描画側が使う
[`getData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L54-L97)
を読む。
[fixture: kanban/db-metadata-all]
[fixture: kanban/db-decoration-class-item]
[fixture: kanban/db-decoration-icon-section]

要約は `{ nodes }` で、
宣言順の各列の後に内部ノード一覧順の項目を置く。
[fixture: kanban/db-sections-items]

各ノードは `id`、`label`、`isGroup` を保持し、
項目は `parentId` も保持し、
未定義の任意フィールドは省く。
[fixture: kanban/db-sections-items]
[fixture: kanban/db-metadata-all]

`id` はサニタイズした識別子で、
形状の前に識別子がなければ説明を使い、
形状前の空白と裸の識別子末尾の空白も残す。
[fixture: kanban/db-name-no-id]
[fixture: kanban/db-name-space-before-shape]
[fixture: kanban/db-name-trailing-space]

`label` はサニタイズした説明か裸の識別子で、
文字列と Markdown の区切りを除き、
内部の空白を残す。
[fixture: kanban/db-name-two-words]
[fixture: kanban/db-markdown-label]
[fixture: kanban/db-label-multiline]
[fixture: kanban/db-spaces-label]

インデントが構造を決め、タブも一文字と数え、
最初のノードと同じ深さを列とし、
他の深さは直前の列の項目にする。
要約はインデントそのもの（`level`）を保持しない。
[描画器](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanRenderer.ts#L16-L73)は
`isGroup` と `parentId` で列と項目を分け、`level` を読まない。
[fixture: kanban/db-indent-tabs]
[fixture: kanban/db-indent-unindented]
[fixture: kanban/db-indent-deeper]
[fixture: kanban/db-indent-shallower-last]

[`getSection()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L25-L48) は既存ノードの深さを調べるため、
最後の浅い項目は受理し、
その後にノードがあると拒否する。
[fixture: kanban/db-indent-shallower-last]
[fixture: kanban/gram-indent-shallower-followed]

`isGroup` は列なら true、項目なら false で、
`parentId` は Db が等値で照合する列の識別子である。
[fixture: kanban/db-sections-items]
[fixture: kanban/db-section-item-same-id]

識別子の重複は統合せず、
同じ列の識別子を持つ全項目を各重複列の下へ再掲する。
[fixture: kanban/db-section-three-definitions]
[fixture: kanban/db-item-three-definitions]
[fixture: kanban/db-metadata-repeated-id]

`Object.prototype` の名前と大文字小文字の違いは通常の識別子である。
[fixture: kanban/db-object-prototype-ids]
[fixture: kanban/db-name-case]

列と項目は `ticket` を保持し、
項目だけが `assigned`、`priority`、`icon` を公開する。
[fixture: kanban/db-metadata-all]
[fixture: kanban/db-metadata-section-ticket]
[fixture: kanban/db-metadata-section-assigned]
[fixture: kanban/db-metadata-section-priority]
[fixture: kanban/db-metadata-section-icon]

[`addNode()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L99-L165) は JSON schema の YAML を読み、
真と評価する値だけを適用し、
`ticket`、`assigned`、`icon` は `toString()` で文字列にする。
[fixture: kanban/db-metadata-ticket-number]
[fixture: kanban/db-metadata-assigned-list]
[fixture: kanban/db-metadata-icon-true]

`priority` は YAML の値を保持し、
文書の優先度の列挙値を検査しない。
[fixture: kanban/db-metadata-priority-number]
[fixture: kanban/db-metadata-priority-list]
[fixture: kanban/db-metadata-priorities]
[fixture: kanban/db-metadata-priority-zero]
[fixture: kanban/db-metadata-priority-null]
[fixture: kanban/db-metadata-priority-overflow-word]

無限大の `priority` は `"Infinity"` と `"-Infinity"` の文字列にし、
単独の `.nan` は偽と評価するため設定しない。
入れ子の非有限数は `"Infinity"`、`"-Infinity"`、`"NaN"` にし、
`__proto__` などのキーは自身のプロパティとして残す。
[fixture: kanban/db-metadata-priority-non-finite]
[fixture: kanban/db-metadata-priority-nested-non-finite]
[fixture: kanban/db-metadata-priority-own-prototype-key]

真と評価する `label` は説明を置換して `getData()` で文字列化し、
false、0、null、空文字列なら元の説明を残す。
[fixture: kanban/db-metadata-label-number]
[fixture: kanban/db-metadata-label-list]
[fixture: kanban/db-metadata-label-false]
[fixture: kanban/db-metadata-label-zero]
[fixture: kanban/db-metadata-label-null]
[fixture: kanban/db-metadata-label-empty-string]

キーは大文字小文字を区別し、
未知のキーは無視し、
重複キーは YAML が拒否し、
入れ子のマッピングの閉じ波括弧は字句上のブロックを先に閉じ得る。
[fixture: kanban/db-metadata-assigned-upper-key]
[fixture: kanban/db-metadata-unknown-key]
[fixture: kanban/gram-metadata-assigned-duplicate]
[fixture: kanban/gram-metadata-assigned-mapping]

一行のメタデータは波括弧で包み、
改行を含むものはブロックマッピングとして渡し、
二重引用符内の改行と続く空白は `<br/>` にする。
ブロックの行の YAML コメントは無視する。
[fixture: kanban/db-metadata-multiline]
[fixture: kanban/db-metadata-quoted-newline]
[fixture: kanban/db-metadata-single-quoted-newline]
[fixture: kanban/db-metadata-yaml-comment]
[fixture: kanban/gram-metadata-two-blocks]

kanban の 1 つのノードに隣り合う `@{ ... }` ブロックは、
中身を連結した 1 つの接尾部として読み、
そのグループに 1 つの効果を記録する。
[fixture: kanban/db-metadata-adjacent-comma]
[fixture: kanban/db-metadata-adjacent-empty]
[fixture: kanban/db-metadata-two-items]
[fixture: kanban/gram-metadata-two-blocks]
[fixture: kanban/db-metadata-all]

小文字でアンダースコアのない形状値は固定形状を変えずに受理し、
`kanbanItem` は小文字検査で拒否し、
真と評価する非文字列の形状は TypeError にする。
[fixture: kanban/db-metadata-shape-lower]
[fixture: kanban/db-metadata-shape-known-other]
[fixture: kanban/gram-metadata-shape-camel]
[fixture: kanban/gram-metadata-shape-underscore]
[fixture: kanban/gram-metadata-shape-number]

最後のアイコン装飾が前の項目の値を置換し、
空のアイコンとクラスは変更せず、
ノードより前の装飾は TypeError にする。
[fixture: kanban/db-decoration-icon-twice]
[fixture: kanban/db-decoration-empty-icon]
[fixture: kanban/db-decoration-empty-class]
[fixture: kanban/gram-decoration-before-node]
[fixture: kanban/gram-decoration-class-before-node]

`shape`、`labelType` は列か項目かで決まる定数なので省き、
固定の `rx`、`ry`、`cssStyles`、空の `edges` と `other` も省く。
[fixture: kanban/db-metadata-all]
[fixture: kanban/db-shape-square]
[fixture: kanban/db-shape-round]
[fixture: kanban/db-shape-circle]
[fixture: kanban/db-shape-hexagon]

描画設定の `look`、`width`、`padding` と要素の表も省く。
[fixture: kanban/db-frontmatter-drawing-config]
[fixture: kanban/db-directive-drawing-config]

列の内部の `assigned`、`priority`、`icon`、`cssClasses` と項目の
`cssClasses` は `getData()` が公開しないため省き、
描画側の Db の読みを比較対象とする。
[fixture: kanban/db-metadata-section-assigned]
[fixture: kanban/db-metadata-section-priority]
[fixture: kanban/db-metadata-section-icon]
[fixture: kanban/db-decoration-class-section]
[fixture: kanban/db-decoration-class-item]

Db に表題とアクセシビリティの setter はなく、
frontmatter の表題は要約を変えず、
`title`、`accTitle:`、`accDescr:` は通常のノードになり、
`accDescr {}` は拒否する。
[fixture: kanban/header-after-frontmatter]
[fixture: kanban/db-frontmatter-accessibility]
[fixture: kanban/db-title-not-statement]
[fixture: kanban/db-acc-title-not-statement]
[fixture: kanban/db-acc-descr-not-statement]
[fixture: kanban/gram-acc-descr-block-not-statement]
[fixture: kanban/gram-empty-description-block-after-value]
[fixture: kanban/db-acc-descr-empty]
[fixture: kanban/db-acc-title-next-statement]
[fixture: kanban/db-frontmatter-after-header]
[fixture: kanban/db-frontmatter-crlf]
[fixture: kanban/db-frontmatter-title-number]

`patchKanbanDb()` は受理した各データブロックを適用順に
`{ id, set }` として `dataBlockEffects` へ記録し、
同じ項目の識別子にも別々の要素を残す。
[fixture: kanban/db-metadata-all]
[fixture: kanban/db-metadata-repeated-id]

`set` はブロックが変えたノードの要約フィールドで、
列と項目の `label` と `ticket`、
項目の `assigned`、`priority`、`icon` を含み、
公開されない列のメタデータは欄を増やさない。
[fixture: kanban/db-metadata-all]
[fixture: kanban/db-metadata-section-label]
[fixture: kanban/db-metadata-section-ticket]
[fixture: kanban/db-metadata-section-assigned]
[fixture: kanban/db-metadata-section-priority]
[fixture: kanban/db-metadata-section-icon]

文書の型から外れた値にも mermaid.js の変換を保持し、
数値の `ticket` は文字列、担当者の一覧はコンマ区切りの文字列、
真偽値のアイコンは文字列、優先度の一覧は一覧にし、
入れ子の非有限数は前述の表現にする。
[fixture: kanban/db-metadata-ticket-number]
[fixture: kanban/db-metadata-assigned-list]
[fixture: kanban/db-metadata-icon-true]
[fixture: kanban/db-metadata-priority-list]
[fixture: kanban/db-metadata-priority-nested-non-finite]

空の一行ブロック、無視するキー、偽と評価する値、受理する `shape` は、
保持する欄を変えなければ `set: {}` を記録し、
拒否する形状値には埋め込みの効果を記録しない。
[fixture: kanban/db-metadata-empty]
[fixture: kanban/db-metadata-unknown-key]
[fixture: kanban/db-metadata-assigned-upper-key]
[fixture: kanban/db-metadata-ticket-false]
[fixture: kanban/db-metadata-assigned-null]
[fixture: kanban/db-metadata-icon-empty-string]
[fixture: kanban/db-metadata-priority-zero]
[fixture: kanban/db-metadata-label-false]
[fixture: kanban/db-metadata-shape-lower]
[fixture: kanban/db-metadata-shape-known-other]
[fixture: kanban/gram-metadata-shape-camel]
[fixture: kanban/gram-metadata-shape-number]

複数行のブロックも同じ変更欄を記録し、
二重引用符内のラベルでの字句解析による `<br/>` への変換も含むが、
空の複数行文書と重複キーは拒否し、埋め込みの効果を記録しない。
[fixture: kanban/db-metadata-multiline]
[fixture: kanban/db-metadata-quoted-newline]
[fixture: kanban/gram-metadata-empty-multiline]
[fixture: kanban/gram-metadata-label-duplicate]
[fixture: kanban/gram-metadata-ticket-duplicate]
[fixture: kanban/gram-metadata-assigned-duplicate]
[fixture: kanban/gram-metadata-priority-duplicate]
[fixture: kanban/gram-metadata-icon-duplicate]
[fixture: kanban/gram-metadata-shape-duplicate]

パッチはブロックなしとありでノードを足した後の要約を、
共有の `blockEffect` で比べる。
Db の状態はモジュール内に隠されているため、
`clear()` 後に元のノード追加と装飾の呼び出しでそれまでの状態を復元し、
次の解析のため共有 Db を消去するときに記録した効果と問題も消す。
[fixture: kanban/db-metadata-all]
[fixture: kanban/db-metadata-repeated-id]
[fixture: kanban/db-decoration-icon-twice]
[fixture: kanban/header-only-lf]

共有サニタイザーを無効にした既定値、`strict`、`loose`、
`antiscript`、`sandbox` は同じ文字を保持する。
[fixture: kanban/config-security-level-other-html-labels-false]

未対応の `securityLevel` で HTML ラベルが有効なら文字と改行タグを置換し、
`htmlLabels` と代替の `flowchart.htmlLabels` が置換の有無を決める。
[fixture: kanban/config-security-level-other]
[fixture: kanban/config-security-level-other-html-labels-false]
[fixture: kanban/config-security-level-other-flowchart-html-labels-false]
[fixture: kanban/config-security-level-other-root-overrides-flowchart]

`ticketBaseUrl` などの描画設定と mindmap の幅や余白は保持値を変えず、
`ticket` は URL に変換せず文字列のまま残す。
[fixture: kanban/db-frontmatter-drawing-config]
[fixture: kanban/db-directive-drawing-config]

検出器は小文字の `kanban` を要求するが、
字句解析は文書内でも大文字小文字を区別せずこの単語を予約し、
ヘッダーの接尾辞は単語文字かどうかで読みが変わる。
[fixture: kanban/header-upper-case]
[fixture: kanban/header-mixed-case]
[fixture: kanban/header-word-suffix]
[fixture: kanban/header-digit-suffix]
[fixture: kanban/header-dash-suffix]
[fixture: kanban/header-non-ascii-suffix]
[fixture: kanban/lex-keyword-kanban-upper]

末尾の改行がないヘッダーだけの入力は拒否し、
改行かコメントがあれば空の文書を受理し、
ヘッダー行末の空白も字句規則の選択を変え得る。
[fixture: kanban/header-only]
[fixture: kanban/header-only-lf]
[fixture: kanban/db-empty-board-comment]
[fixture: kanban/header-tab-trailing]
[fixture: kanban/header-crlf-trailing]

裸のノードは空白、句読点、セミコロンを含めて行を取り、
形状のあるノードは閉じ区切りの後に文の終端を必要とし、
セミコロンの接尾辞を拒否する。
[fixture: kanban/db-name-two-words]
[fixture: kanban/db-semicolon-bare-node]
[fixture: kanban/lex-after-shape-semicolon]
[fixture: kanban/lex-after-bare-semicolon]
[fixture: kanban/gram-two-shapes-on-line]

角括弧、丸括弧、円、六角形、雲、爆発形と不一致の区切りは説明を与えるが、
固定の出力形状は変えない。
[fixture: kanban/db-shape-square]
[fixture: kanban/db-shape-round]
[fixture: kanban/db-shape-circle]
[fixture: kanban/db-shape-hexagon]
[fixture: kanban/db-shape-cloud]
[fixture: kanban/db-shape-bang]
[fixture: kanban/db-shape-mismatched]

空の括弧付き説明と空の引用説明は拒否し、
裸の空文字列の綴りは識別子として保持する。
[fixture: kanban/gram-empty-label]
[fixture: kanban/gram-empty-quoted-label]
[fixture: kanban/db-empty-string-node]

CRLF と単独 CR は改行に正規化し、
タブ、BOM、改行しない空白、全角空白、行区切り、段落区切りは、
位置に応じてインデントや値の文字として読む。
[fixture: kanban/lex-crlf-quoted-value]
[fixture: kanban/lex-cr-quoted-value]
[fixture: kanban/lex-tab-line-start]
[fixture: kanban/lex-bom-line-start]
[fixture: kanban/lex-nbsp-line-start]
[fixture: kanban/lex-ideographic-line-start]
[fixture: kanban/lex-ls-bare-value]
[fixture: kanban/lex-ps-bare-value]

コメント行は複数行の説明やメタデータからも除去するが、
引用ラベル内の行途中のパーセント二つは保持する。
[fixture: kanban/lex-comment-quoted-line]
[fixture: kanban/lex-comment-quoted-inline]
[fixture: kanban/db-metadata-comment-line]

閉じたディレクティブは除去して両側を連結し、
閉じていないものは後続テキストを除去し得る。
[fixture: kanban/header-directive-inside]
[fixture: kanban/lex-directive-at-value-start]
[fixture: kanban/lex-directive-at-value-end]
[fixture: kanban/lex-directive-word-unclosed-next-line]
[fixture: kanban/lex-directive-colon-unclosed-next-line]

共有の前処理は文字参照をプレースホルダーにし、
一致する `style:` と `classDef:` の行の最後のセミコロンを除去し、
綴りと行境界で適用の有無が変わる。
[fixture: kanban/db-grid-entity-item-label-quoted]
[fixture: kanban/lex-label-style-rule]
[fixture: kanban/lex-label-style-rule-upper]
[fixture: kanban/lex-label-style-rule-space]
[fixture: kanban/lex-label-style-rule-no-hash]
[fixture: kanban/lex-label-style-rule-two-semicolons]
[fixture: kanban/lex-label-classdef-rule]
[fixture: kanban/lex-label-style-rule-other-line]
[fixture: kanban/lex-style-entity-two-semicolons]

識別子、ラベル、メタデータ内の C4 の単語は先に別図種を検出し得るが、
除去するコメントや frontmatter 内では影響せず、
これらの fixture に既知の乖離の印は付けない。
[fixture: kanban/lex-c4-c4container-id]
[fixture: kanban/lex-c4-c4component-label]
[fixture: kanban/lex-c4-c4dynamic-metadata]
[fixture: kanban/lex-c4-c4deployment-id]
[fixture: kanban/lex-c4-c4container-comment]
[fixture: kanban/lex-c4-c4container-frontmatter]
[fixture: kanban/lex-c4-c4context-id]

以下の fixture は、kanban のテキストの 33 の場所のそれぞれに 1 つの
テキスト（種類）を書き、Db がそこから何を読むかを記録する。
種類は、それが書くテキストにちなんで名付ける。印字できる ASCII でない文字、
バッククォート、端にある空白を含むテキストは、コードポイントで示す。

| 種類               | テキスト                            |
| ------------------ | ----------------------------------- |
| `ampersand-entity` | `&amp;`                             |
| `arrow`            | `-->`                               |
| `arrow-spaced`     | U+0020 `-->` U+0020                 |
| `backslash`        | `\`                                 |
| `backtick`         | U+0060                              |
| `bom`              | U+FEFF                              |
| `classdef-rule`    | `classDef:#x;y`                     |
| `close-brace`      | `}`                                 |
| `close-round`      | `)`                                 |
| `close-square`     | `]`                                 |
| `colon`            | `:`                                 |
| `comma`            | `,`                                 |
| `comment`          | `%% c`                              |
| `comment-line`     | U+000A `%% c` U+000A                |
| `constructor`      | `constructor`                       |
| `cr`               | U+000D                              |
| `crlf`             | U+000D U+000A                       |
| `dash`             | `-`                                 |
| `digits`           | `123`                               |
| `directive`        | `%%{init: {}}%%`                    |
| `directive-line`   | U+000A `%%{init: {}}%%` U+000A      |
| `emoji`            | U+1F600                             |
| `empty`            | （空）                              |
| `entity`           | `#35;`                              |
| `entity-named`     | `#amp;`                             |
| `equals`           | `=`                                 |
| `ff`               | U+000C                              |
| `greater-than`     | `>`                                 |
| `hash`             | `#`                                 |
| `html`             | `<b>`                               |
| `html-attribute`   | `<a href="x">`                      |
| `html-br`          | `<br>`                              |
| `ideographic`      | U+3000                              |
| `keyword`          | `kanban`                            |
| `keyword-block`    | U+0020 `block` U+0020               |
| `keyword-class`    | U+0020 `class A c` U+0020           |
| `keyword-classdef` | U+0020 `classDef c fill:red` U+0020 |
| `keyword-columns`  | U+0020 `columns 2` U+0020           |
| `keyword-end`      | U+0020 `end` U+0020                 |
| `keyword-header`   | U+0020 `kanban` U+0020              |
| `keyword-space`    | U+0020 `space` U+0020               |
| `keyword-style`    | U+0020 `style A fill:red` U+0020    |
| `less-than`        | `<`                                 |
| `lf`               | U+000A                              |
| `ls`               | U+2028                              |
| `nbsp`             | U+00A0                              |
| `nel`              | U+0085                              |
| `nonascii`         | U+00E9                              |
| `open-brace`       | `{`                                 |
| `open-round`       | `(`                                 |
| `open-square`      | `[`                                 |
| `percent`          | `%`                                 |
| `pipe`             | `                                   | `   |
| `proto`            | `__proto__`                         |
| `ps`               | U+2029                              |
| `punct`            | `!$&*+.,/=?^_~@`                    |
| `quote`            | `"`                                 |
| `root`             | `root`                              |
| `semicolon`        | `;`                                 |
| `single-quote`     | `'`                                 |
| `spaces`           | U+0020 U+0020                       |
| `style-rule`       | `style:#x;y`                        |
| `tab`              | U+0009                              |
| `vt`               | U+000B                              |

以下の各場所で、名を挙げない種類は、そのまま保たれる。

`header-line` はヘッダーの行の `kanban` の後のテキスト（最初の列を始める）。
最初の列のテキストとしてそのまま保たれる: `ampersand-entity`、`arrow`、
`backslash`、`backtick`、`close-square`、`colon`、`comma`、`dash`、`emoji`、
`equals`、`greater-than`、`hash`、`html`、`html-br`、`less-than`、`percent`、
`pipe`、`quote`、`single-quote`。
[fixture: kanban/db-grid-ampersand-entity-header-line]
[fixture: kanban/db-grid-arrow-header-line]
[fixture: kanban/db-grid-backslash-header-line]
[fixture: kanban/db-grid-backtick-header-line]
[fixture: kanban/db-grid-close-square-header-line]
[fixture: kanban/db-grid-colon-header-line]
[fixture: kanban/db-grid-comma-header-line]
[fixture: kanban/db-grid-dash-header-line]
[fixture: kanban/db-grid-emoji-header-line]
[fixture: kanban/db-grid-equals-header-line]
[fixture: kanban/db-grid-greater-than-header-line]
[fixture: kanban/db-grid-hash-header-line]
[fixture: kanban/db-grid-html-header-line]
[fixture: kanban/db-grid-html-br-header-line]
[fixture: kanban/db-grid-less-than-header-line]
[fixture: kanban/db-grid-percent-header-line]
[fixture: kanban/db-grid-pipe-header-line]
[fixture: kanban/db-grid-quote-header-line]
[fixture: kanban/db-grid-single-quote-header-line]
前の空白が落ち、残りが保たれる: `arrow-spaced`、`keyword-block`、
`keyword-class`、`keyword-classdef`、`keyword-columns`、`keyword-end`、
`keyword-space`、`keyword-style`。
[fixture: kanban/db-grid-arrow-spaced-header-line]
[fixture: kanban/db-grid-keyword-block-header-line]
[fixture: kanban/db-grid-keyword-class-header-line]
[fixture: kanban/db-grid-keyword-classdef-header-line]
[fixture: kanban/db-grid-keyword-columns-header-line]
[fixture: kanban/db-grid-keyword-end-header-line]
[fixture: kanban/db-grid-keyword-space-header-line]
[fixture: kanban/db-grid-keyword-style-header-line]
テキストがなく、最初の列は次の行になる: `empty`。
[fixture: kanban/db-grid-empty-header-line]
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-header-line]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-header-line]
[fixture: kanban/db-grid-entity-named-header-line]
字句解析器が拒否する: `close-brace`、`open-brace`、`punct`。
[fixture: kanban/gram-grid-close-brace-header-line]
[fixture: kanban/gram-grid-open-brace-header-line]
[fixture: kanban/gram-grid-punct-header-line]
文法が拒否する: `classdef-rule`、`close-round`、`comment-line`、
`constructor`、`digits`、`directive-line`、`keyword`、`keyword-header`、`lf`、
`open-round`、`open-square`、`proto`、`root`、`spaces`、`style-rule`。
[fixture: kanban/gram-grid-classdef-rule-header-line]
[fixture: kanban/gram-grid-close-round-header-line]
[fixture: kanban/gram-grid-comment-line-header-line]
[fixture: kanban/gram-grid-constructor-header-line]
[fixture: kanban/gram-grid-digits-header-line]
[fixture: kanban/gram-grid-directive-line-header-line]
[fixture: kanban/gram-grid-keyword-header-line]
[fixture: kanban/gram-grid-keyword-header-header-line]
[fixture: kanban/gram-grid-lf-header-line]
[fixture: kanban/gram-grid-open-round-header-line]
[fixture: kanban/gram-grid-open-square-header-line]
[fixture: kanban/gram-grid-proto-header-line]
[fixture: kanban/gram-grid-root-header-line]
[fixture: kanban/gram-grid-spaces-header-line]
[fixture: kanban/gram-grid-style-rule-header-line]

`section-id` は列の id（`[` の前）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-section-id]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-section-id]
[fixture: kanban/db-grid-entity-named-section-id]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-section-id]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-section-id]
[fixture: kanban/db-grid-style-rule-section-id]
そこで値が終わり、`a` になる: `close-round`、`open-round`、`open-square`。
[fixture: kanban/db-grid-close-round-section-id]
[fixture: kanban/db-grid-open-round-section-id]
[fixture: kanban/db-grid-open-square-section-id]
字句解析器が拒否する: `close-brace`、`open-brace`、`punct`。
[fixture: kanban/gram-grid-close-brace-section-id]
[fixture: kanban/gram-grid-open-brace-section-id]
[fixture: kanban/gram-grid-punct-section-id]
Db が拒否する: 項目の前に列がない（`Items without section detected`）:
`comment-line`、`cr`、`crlf`、`directive-line`、`lf`。
[fixture: kanban/gram-grid-comment-line-section-id]
[fixture: kanban/gram-grid-cr-section-id]
[fixture: kanban/gram-grid-crlf-section-id]
[fixture: kanban/gram-grid-directive-line-section-id]
[fixture: kanban/gram-grid-lf-section-id]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-section-id]
[fixture: kanban/db-grid-arrow-section-id]
[fixture: kanban/db-grid-arrow-spaced-section-id]
[fixture: kanban/db-grid-backslash-section-id]
[fixture: kanban/db-grid-backtick-section-id]
[fixture: kanban/db-grid-bom-section-id]
[fixture: kanban/db-grid-close-square-section-id]
[fixture: kanban/db-grid-colon-section-id]
[fixture: kanban/db-grid-comma-section-id]
[fixture: kanban/db-grid-comment-section-id]
[fixture: kanban/db-grid-constructor-section-id]
[fixture: kanban/db-grid-dash-section-id]
[fixture: kanban/db-grid-digits-section-id]
[fixture: kanban/db-grid-emoji-section-id]
[fixture: kanban/db-grid-empty-section-id]
[fixture: kanban/db-grid-equals-section-id]
[fixture: kanban/db-grid-ff-section-id]
[fixture: kanban/db-grid-greater-than-section-id]
[fixture: kanban/db-grid-hash-section-id]
[fixture: kanban/db-grid-html-section-id]
[fixture: kanban/db-grid-html-br-section-id]
[fixture: kanban/db-grid-ideographic-section-id]
[fixture: kanban/db-grid-keyword-section-id]
[fixture: kanban/db-grid-keyword-block-section-id]
[fixture: kanban/db-grid-keyword-class-section-id]
[fixture: kanban/db-grid-keyword-classdef-section-id]
[fixture: kanban/db-grid-keyword-columns-section-id]
[fixture: kanban/db-grid-keyword-end-section-id]
[fixture: kanban/db-grid-keyword-header-section-id]
[fixture: kanban/db-grid-keyword-space-section-id]
[fixture: kanban/db-grid-keyword-style-section-id]
[fixture: kanban/db-grid-less-than-section-id]
[fixture: kanban/db-grid-ls-section-id]
[fixture: kanban/db-grid-nbsp-section-id]
[fixture: kanban/db-grid-nel-section-id]
[fixture: kanban/db-grid-nonascii-section-id]
[fixture: kanban/db-grid-percent-section-id]
[fixture: kanban/db-grid-pipe-section-id]
[fixture: kanban/db-grid-proto-section-id]
[fixture: kanban/db-grid-ps-section-id]
[fixture: kanban/db-grid-quote-section-id]
[fixture: kanban/db-grid-root-section-id]
[fixture: kanban/db-grid-semicolon-section-id]
[fixture: kanban/db-grid-single-quote-section-id]
[fixture: kanban/db-grid-spaces-section-id]
[fixture: kanban/db-grid-tab-section-id]
[fixture: kanban/db-grid-vt-section-id]

`item-id` は項目の id（`[` の前）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-item-id]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-item-id]
[fixture: kanban/db-grid-entity-named-item-id]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-item-id]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-item-id]
[fixture: kanban/db-grid-style-rule-item-id]
そこで値が終わり、`a` になる: `close-round`、`comment-line`、`cr`、`crlf`、
`directive-line`、`lf`、`open-round`、`open-square`。
[fixture: kanban/db-grid-close-round-item-id]
[fixture: kanban/db-grid-comment-line-item-id]
[fixture: kanban/db-grid-cr-item-id]
[fixture: kanban/db-grid-crlf-item-id]
[fixture: kanban/db-grid-directive-line-item-id]
[fixture: kanban/db-grid-lf-item-id]
[fixture: kanban/db-grid-open-round-item-id]
[fixture: kanban/db-grid-open-square-item-id]
字句解析器が拒否する: `close-brace`、`open-brace`、`punct`。
[fixture: kanban/gram-grid-close-brace-item-id]
[fixture: kanban/gram-grid-open-brace-item-id]
[fixture: kanban/gram-grid-punct-item-id]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-item-id]
[fixture: kanban/db-grid-arrow-item-id]
[fixture: kanban/db-grid-arrow-spaced-item-id]
[fixture: kanban/db-grid-backslash-item-id]
[fixture: kanban/db-grid-backtick-item-id]
[fixture: kanban/db-grid-bom-item-id]
[fixture: kanban/db-grid-close-square-item-id]
[fixture: kanban/db-grid-colon-item-id]
[fixture: kanban/db-grid-comma-item-id]
[fixture: kanban/db-grid-comment-item-id]
[fixture: kanban/db-grid-constructor-item-id]
[fixture: kanban/db-grid-dash-item-id]
[fixture: kanban/db-grid-digits-item-id]
[fixture: kanban/db-grid-emoji-item-id]
[fixture: kanban/db-grid-empty-item-id]
[fixture: kanban/db-grid-equals-item-id]
[fixture: kanban/db-grid-ff-item-id]
[fixture: kanban/db-grid-greater-than-item-id]
[fixture: kanban/db-grid-hash-item-id]
[fixture: kanban/db-grid-html-item-id]
[fixture: kanban/db-grid-html-br-item-id]
[fixture: kanban/db-grid-ideographic-item-id]
[fixture: kanban/db-grid-keyword-item-id]
[fixture: kanban/db-grid-keyword-block-item-id]
[fixture: kanban/db-grid-keyword-class-item-id]
[fixture: kanban/db-grid-keyword-classdef-item-id]
[fixture: kanban/db-grid-keyword-columns-item-id]
[fixture: kanban/db-grid-keyword-end-item-id]
[fixture: kanban/db-grid-keyword-header-item-id]
[fixture: kanban/db-grid-keyword-space-item-id]
[fixture: kanban/db-grid-keyword-style-item-id]
[fixture: kanban/db-grid-less-than-item-id]
[fixture: kanban/db-grid-ls-item-id]
[fixture: kanban/db-grid-nbsp-item-id]
[fixture: kanban/db-grid-nel-item-id]
[fixture: kanban/db-grid-nonascii-item-id]
[fixture: kanban/db-grid-percent-item-id]
[fixture: kanban/db-grid-pipe-item-id]
[fixture: kanban/db-grid-proto-item-id]
[fixture: kanban/db-grid-ps-item-id]
[fixture: kanban/db-grid-quote-item-id]
[fixture: kanban/db-grid-root-item-id]
[fixture: kanban/db-grid-semicolon-item-id]
[fixture: kanban/db-grid-single-quote-item-id]
[fixture: kanban/db-grid-spaces-item-id]
[fixture: kanban/db-grid-tab-item-id]
[fixture: kanban/db-grid-vt-item-id]

`section-label-bare` は列のラベル（`[ ]` の中、引用符なし）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-section-label-bare]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-section-label-bare]
[fixture: kanban/db-grid-entity-named-section-label-bare]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-section-label-bare]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-section-label-bare]
[fixture: kanban/db-grid-style-rule-section-label-bare]
1 つの改行として読まれる: `comment-line`、`cr`、`crlf`。
[fixture: kanban/db-grid-comment-line-section-label-bare]
[fixture: kanban/db-grid-cr-section-label-bare]
[fixture: kanban/db-grid-crlf-section-label-bare]
2 つの改行として読まれる: `directive-line`。
[fixture: kanban/db-grid-directive-line-section-label-bare]
文法が拒否する: `close-brace`、`close-round`、`close-square`、`open-round`。
[fixture: kanban/gram-grid-close-brace-section-label-bare]
[fixture: kanban/gram-grid-close-round-section-label-bare]
[fixture: kanban/gram-grid-close-square-section-label-bare]
[fixture: kanban/gram-grid-open-round-section-label-bare]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-section-label-bare]
[fixture: kanban/db-grid-arrow-section-label-bare]
[fixture: kanban/db-grid-arrow-spaced-section-label-bare]
[fixture: kanban/db-grid-backslash-section-label-bare]
[fixture: kanban/db-grid-backtick-section-label-bare]
[fixture: kanban/db-grid-bom-section-label-bare]
[fixture: kanban/db-grid-colon-section-label-bare]
[fixture: kanban/db-grid-comma-section-label-bare]
[fixture: kanban/db-grid-comment-section-label-bare]
[fixture: kanban/db-grid-constructor-section-label-bare]
[fixture: kanban/db-grid-dash-section-label-bare]
[fixture: kanban/db-grid-digits-section-label-bare]
[fixture: kanban/db-grid-emoji-section-label-bare]
[fixture: kanban/db-grid-empty-section-label-bare]
[fixture: kanban/db-grid-equals-section-label-bare]
[fixture: kanban/db-grid-ff-section-label-bare]
[fixture: kanban/db-grid-greater-than-section-label-bare]
[fixture: kanban/db-grid-hash-section-label-bare]
[fixture: kanban/db-grid-html-section-label-bare]
[fixture: kanban/db-grid-html-br-section-label-bare]
[fixture: kanban/db-grid-ideographic-section-label-bare]
[fixture: kanban/db-grid-keyword-section-label-bare]
[fixture: kanban/db-grid-keyword-block-section-label-bare]
[fixture: kanban/db-grid-keyword-class-section-label-bare]
[fixture: kanban/db-grid-keyword-classdef-section-label-bare]
[fixture: kanban/db-grid-keyword-columns-section-label-bare]
[fixture: kanban/db-grid-keyword-end-section-label-bare]
[fixture: kanban/db-grid-keyword-header-section-label-bare]
[fixture: kanban/db-grid-keyword-space-section-label-bare]
[fixture: kanban/db-grid-keyword-style-section-label-bare]
[fixture: kanban/db-grid-less-than-section-label-bare]
[fixture: kanban/db-grid-lf-section-label-bare]
[fixture: kanban/db-grid-ls-section-label-bare]
[fixture: kanban/db-grid-nbsp-section-label-bare]
[fixture: kanban/db-grid-nel-section-label-bare]
[fixture: kanban/db-grid-nonascii-section-label-bare]
[fixture: kanban/db-grid-open-brace-section-label-bare]
[fixture: kanban/db-grid-open-square-section-label-bare]
[fixture: kanban/db-grid-percent-section-label-bare]
[fixture: kanban/db-grid-pipe-section-label-bare]
[fixture: kanban/db-grid-proto-section-label-bare]
[fixture: kanban/db-grid-ps-section-label-bare]
[fixture: kanban/db-grid-punct-section-label-bare]
[fixture: kanban/db-grid-quote-section-label-bare]
[fixture: kanban/db-grid-root-section-label-bare]
[fixture: kanban/db-grid-semicolon-section-label-bare]
[fixture: kanban/db-grid-single-quote-section-label-bare]
[fixture: kanban/db-grid-spaces-section-label-bare]
[fixture: kanban/db-grid-tab-section-label-bare]
[fixture: kanban/db-grid-vt-section-label-bare]

`section-label-quoted` は列のラベル（`[" "]` の中）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-section-label-quoted]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-section-label-quoted]
[fixture: kanban/db-grid-entity-named-section-label-quoted]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-section-label-quoted]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-section-label-quoted]
[fixture: kanban/db-grid-style-rule-section-label-quoted]
1 つの改行として読まれる: `comment-line`、`cr`、`crlf`。
[fixture: kanban/db-grid-comment-line-section-label-quoted]
[fixture: kanban/db-grid-cr-section-label-quoted]
[fixture: kanban/db-grid-crlf-section-label-quoted]
2 つの改行として読まれる: `directive-line`。
[fixture: kanban/db-grid-directive-line-section-label-quoted]
文法が拒否する: `quote`。
[fixture: kanban/gram-grid-quote-section-label-quoted]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-section-label-quoted]
[fixture: kanban/db-grid-arrow-section-label-quoted]
[fixture: kanban/db-grid-arrow-spaced-section-label-quoted]
[fixture: kanban/db-grid-backslash-section-label-quoted]
[fixture: kanban/db-grid-backtick-section-label-quoted]
[fixture: kanban/db-grid-bom-section-label-quoted]
[fixture: kanban/db-grid-close-brace-section-label-quoted]
[fixture: kanban/db-grid-close-round-section-label-quoted]
[fixture: kanban/db-grid-close-square-section-label-quoted]
[fixture: kanban/db-grid-colon-section-label-quoted]
[fixture: kanban/db-grid-comma-section-label-quoted]
[fixture: kanban/db-grid-comment-section-label-quoted]
[fixture: kanban/db-grid-constructor-section-label-quoted]
[fixture: kanban/db-grid-dash-section-label-quoted]
[fixture: kanban/db-grid-digits-section-label-quoted]
[fixture: kanban/db-grid-emoji-section-label-quoted]
[fixture: kanban/db-grid-empty-section-label-quoted]
[fixture: kanban/db-grid-equals-section-label-quoted]
[fixture: kanban/db-grid-ff-section-label-quoted]
[fixture: kanban/db-grid-greater-than-section-label-quoted]
[fixture: kanban/db-grid-hash-section-label-quoted]
[fixture: kanban/db-grid-html-section-label-quoted]
[fixture: kanban/db-grid-html-br-section-label-quoted]
[fixture: kanban/db-grid-ideographic-section-label-quoted]
[fixture: kanban/db-grid-keyword-section-label-quoted]
[fixture: kanban/db-grid-keyword-block-section-label-quoted]
[fixture: kanban/db-grid-keyword-class-section-label-quoted]
[fixture: kanban/db-grid-keyword-classdef-section-label-quoted]
[fixture: kanban/db-grid-keyword-columns-section-label-quoted]
[fixture: kanban/db-grid-keyword-end-section-label-quoted]
[fixture: kanban/db-grid-keyword-header-section-label-quoted]
[fixture: kanban/db-grid-keyword-space-section-label-quoted]
[fixture: kanban/db-grid-keyword-style-section-label-quoted]
[fixture: kanban/db-grid-less-than-section-label-quoted]
[fixture: kanban/db-grid-lf-section-label-quoted]
[fixture: kanban/db-grid-ls-section-label-quoted]
[fixture: kanban/db-grid-nbsp-section-label-quoted]
[fixture: kanban/db-grid-nel-section-label-quoted]
[fixture: kanban/db-grid-nonascii-section-label-quoted]
[fixture: kanban/db-grid-open-brace-section-label-quoted]
[fixture: kanban/db-grid-open-round-section-label-quoted]
[fixture: kanban/db-grid-open-square-section-label-quoted]
[fixture: kanban/db-grid-percent-section-label-quoted]
[fixture: kanban/db-grid-pipe-section-label-quoted]
[fixture: kanban/db-grid-proto-section-label-quoted]
[fixture: kanban/db-grid-ps-section-label-quoted]
[fixture: kanban/db-grid-punct-section-label-quoted]
[fixture: kanban/db-grid-root-section-label-quoted]
[fixture: kanban/db-grid-semicolon-section-label-quoted]
[fixture: kanban/db-grid-single-quote-section-label-quoted]
[fixture: kanban/db-grid-spaces-section-label-quoted]
[fixture: kanban/db-grid-tab-section-label-quoted]
[fixture: kanban/db-grid-vt-section-label-quoted]

`section-label-markdown` は列のラベル（markdown 文字列）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-section-label-markdown]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-section-label-markdown]
[fixture: kanban/db-grid-entity-named-section-label-markdown]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-section-label-markdown]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-section-label-markdown]
[fixture: kanban/db-grid-style-rule-section-label-markdown]
1 つの改行として読まれる: `comment-line`、`cr`、`crlf`。
[fixture: kanban/db-grid-comment-line-section-label-markdown]
[fixture: kanban/db-grid-cr-section-label-markdown]
[fixture: kanban/db-grid-crlf-section-label-markdown]
2 つの改行として読まれる: `directive-line`。
[fixture: kanban/db-grid-directive-line-section-label-markdown]
字句解析器が拒否する: `backtick`、`quote`。
[fixture: kanban/gram-grid-backtick-section-label-markdown]
[fixture: kanban/gram-grid-quote-section-label-markdown]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-section-label-markdown]
[fixture: kanban/db-grid-arrow-section-label-markdown]
[fixture: kanban/db-grid-arrow-spaced-section-label-markdown]
[fixture: kanban/db-grid-backslash-section-label-markdown]
[fixture: kanban/db-grid-bom-section-label-markdown]
[fixture: kanban/db-grid-close-brace-section-label-markdown]
[fixture: kanban/db-grid-close-round-section-label-markdown]
[fixture: kanban/db-grid-close-square-section-label-markdown]
[fixture: kanban/db-grid-colon-section-label-markdown]
[fixture: kanban/db-grid-comma-section-label-markdown]
[fixture: kanban/db-grid-comment-section-label-markdown]
[fixture: kanban/db-grid-constructor-section-label-markdown]
[fixture: kanban/db-grid-dash-section-label-markdown]
[fixture: kanban/db-grid-digits-section-label-markdown]
[fixture: kanban/db-grid-emoji-section-label-markdown]
[fixture: kanban/db-grid-empty-section-label-markdown]
[fixture: kanban/db-grid-equals-section-label-markdown]
[fixture: kanban/db-grid-ff-section-label-markdown]
[fixture: kanban/db-grid-greater-than-section-label-markdown]
[fixture: kanban/db-grid-hash-section-label-markdown]
[fixture: kanban/db-grid-html-section-label-markdown]
[fixture: kanban/db-grid-html-br-section-label-markdown]
[fixture: kanban/db-grid-ideographic-section-label-markdown]
[fixture: kanban/db-grid-keyword-section-label-markdown]
[fixture: kanban/db-grid-keyword-block-section-label-markdown]
[fixture: kanban/db-grid-keyword-class-section-label-markdown]
[fixture: kanban/db-grid-keyword-classdef-section-label-markdown]
[fixture: kanban/db-grid-keyword-columns-section-label-markdown]
[fixture: kanban/db-grid-keyword-end-section-label-markdown]
[fixture: kanban/db-grid-keyword-header-section-label-markdown]
[fixture: kanban/db-grid-keyword-space-section-label-markdown]
[fixture: kanban/db-grid-keyword-style-section-label-markdown]
[fixture: kanban/db-grid-less-than-section-label-markdown]
[fixture: kanban/db-grid-lf-section-label-markdown]
[fixture: kanban/db-grid-ls-section-label-markdown]
[fixture: kanban/db-grid-nbsp-section-label-markdown]
[fixture: kanban/db-grid-nel-section-label-markdown]
[fixture: kanban/db-grid-nonascii-section-label-markdown]
[fixture: kanban/db-grid-open-brace-section-label-markdown]
[fixture: kanban/db-grid-open-round-section-label-markdown]
[fixture: kanban/db-grid-open-square-section-label-markdown]
[fixture: kanban/db-grid-percent-section-label-markdown]
[fixture: kanban/db-grid-pipe-section-label-markdown]
[fixture: kanban/db-grid-proto-section-label-markdown]
[fixture: kanban/db-grid-ps-section-label-markdown]
[fixture: kanban/db-grid-punct-section-label-markdown]
[fixture: kanban/db-grid-root-section-label-markdown]
[fixture: kanban/db-grid-semicolon-section-label-markdown]
[fixture: kanban/db-grid-single-quote-section-label-markdown]
[fixture: kanban/db-grid-spaces-section-label-markdown]
[fixture: kanban/db-grid-tab-section-label-markdown]
[fixture: kanban/db-grid-vt-section-label-markdown]

`item-label-bare` は項目のラベル（`[ ]` の中、引用符なし）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-item-label-bare]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-item-label-bare]
[fixture: kanban/db-grid-entity-named-item-label-bare]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-item-label-bare]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-item-label-bare]
[fixture: kanban/db-grid-style-rule-item-label-bare]
1 つの改行として読まれる: `comment-line`、`cr`、`crlf`。
[fixture: kanban/db-grid-comment-line-item-label-bare]
[fixture: kanban/db-grid-cr-item-label-bare]
[fixture: kanban/db-grid-crlf-item-label-bare]
2 つの改行として読まれる: `directive-line`。
[fixture: kanban/db-grid-directive-line-item-label-bare]
文法が拒否する: `close-brace`、`close-round`、`close-square`、`open-round`。
[fixture: kanban/gram-grid-close-brace-item-label-bare]
[fixture: kanban/gram-grid-close-round-item-label-bare]
[fixture: kanban/gram-grid-close-square-item-label-bare]
[fixture: kanban/gram-grid-open-round-item-label-bare]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-item-label-bare]
[fixture: kanban/db-grid-arrow-item-label-bare]
[fixture: kanban/db-grid-arrow-spaced-item-label-bare]
[fixture: kanban/db-grid-backslash-item-label-bare]
[fixture: kanban/db-grid-backtick-item-label-bare]
[fixture: kanban/db-grid-bom-item-label-bare]
[fixture: kanban/db-grid-colon-item-label-bare]
[fixture: kanban/db-grid-comma-item-label-bare]
[fixture: kanban/db-grid-comment-item-label-bare]
[fixture: kanban/db-grid-constructor-item-label-bare]
[fixture: kanban/db-grid-dash-item-label-bare]
[fixture: kanban/db-grid-digits-item-label-bare]
[fixture: kanban/db-grid-emoji-item-label-bare]
[fixture: kanban/db-grid-empty-item-label-bare]
[fixture: kanban/db-grid-equals-item-label-bare]
[fixture: kanban/db-grid-ff-item-label-bare]
[fixture: kanban/db-grid-greater-than-item-label-bare]
[fixture: kanban/db-grid-hash-item-label-bare]
[fixture: kanban/db-grid-html-item-label-bare]
[fixture: kanban/db-grid-html-br-item-label-bare]
[fixture: kanban/db-grid-ideographic-item-label-bare]
[fixture: kanban/db-grid-keyword-item-label-bare]
[fixture: kanban/db-grid-keyword-block-item-label-bare]
[fixture: kanban/db-grid-keyword-class-item-label-bare]
[fixture: kanban/db-grid-keyword-classdef-item-label-bare]
[fixture: kanban/db-grid-keyword-columns-item-label-bare]
[fixture: kanban/db-grid-keyword-end-item-label-bare]
[fixture: kanban/db-grid-keyword-header-item-label-bare]
[fixture: kanban/db-grid-keyword-space-item-label-bare]
[fixture: kanban/db-grid-keyword-style-item-label-bare]
[fixture: kanban/db-grid-less-than-item-label-bare]
[fixture: kanban/db-grid-lf-item-label-bare]
[fixture: kanban/db-grid-ls-item-label-bare]
[fixture: kanban/db-grid-nbsp-item-label-bare]
[fixture: kanban/db-grid-nel-item-label-bare]
[fixture: kanban/db-grid-nonascii-item-label-bare]
[fixture: kanban/db-grid-open-brace-item-label-bare]
[fixture: kanban/db-grid-open-square-item-label-bare]
[fixture: kanban/db-grid-percent-item-label-bare]
[fixture: kanban/db-grid-pipe-item-label-bare]
[fixture: kanban/db-grid-proto-item-label-bare]
[fixture: kanban/db-grid-ps-item-label-bare]
[fixture: kanban/db-grid-punct-item-label-bare]
[fixture: kanban/db-grid-quote-item-label-bare]
[fixture: kanban/db-grid-root-item-label-bare]
[fixture: kanban/db-grid-semicolon-item-label-bare]
[fixture: kanban/db-grid-single-quote-item-label-bare]
[fixture: kanban/db-grid-spaces-item-label-bare]
[fixture: kanban/db-grid-tab-item-label-bare]
[fixture: kanban/db-grid-vt-item-label-bare]

`item-label-quoted` は項目のラベル（`[" "]` の中）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-item-label-quoted]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-item-label-quoted]
[fixture: kanban/db-grid-entity-named-item-label-quoted]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-item-label-quoted]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-item-label-quoted]
[fixture: kanban/db-grid-style-rule-item-label-quoted]
1 つの改行として読まれる: `comment-line`、`cr`、`crlf`。
[fixture: kanban/db-grid-comment-line-item-label-quoted]
[fixture: kanban/db-grid-cr-item-label-quoted]
[fixture: kanban/db-grid-crlf-item-label-quoted]
2 つの改行として読まれる: `directive-line`。
[fixture: kanban/db-grid-directive-line-item-label-quoted]
文法が拒否する: `quote`。
[fixture: kanban/gram-grid-quote-item-label-quoted]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-item-label-quoted]
[fixture: kanban/db-grid-arrow-item-label-quoted]
[fixture: kanban/db-grid-arrow-spaced-item-label-quoted]
[fixture: kanban/db-grid-backslash-item-label-quoted]
[fixture: kanban/db-grid-backtick-item-label-quoted]
[fixture: kanban/db-grid-bom-item-label-quoted]
[fixture: kanban/db-grid-close-brace-item-label-quoted]
[fixture: kanban/db-grid-close-round-item-label-quoted]
[fixture: kanban/db-grid-close-square-item-label-quoted]
[fixture: kanban/db-grid-colon-item-label-quoted]
[fixture: kanban/db-grid-comma-item-label-quoted]
[fixture: kanban/db-grid-comment-item-label-quoted]
[fixture: kanban/db-grid-constructor-item-label-quoted]
[fixture: kanban/db-grid-dash-item-label-quoted]
[fixture: kanban/db-grid-digits-item-label-quoted]
[fixture: kanban/db-grid-emoji-item-label-quoted]
[fixture: kanban/db-grid-empty-item-label-quoted]
[fixture: kanban/db-grid-equals-item-label-quoted]
[fixture: kanban/db-grid-ff-item-label-quoted]
[fixture: kanban/db-grid-greater-than-item-label-quoted]
[fixture: kanban/db-grid-hash-item-label-quoted]
[fixture: kanban/db-grid-html-item-label-quoted]
[fixture: kanban/db-grid-html-br-item-label-quoted]
[fixture: kanban/db-grid-ideographic-item-label-quoted]
[fixture: kanban/db-grid-keyword-item-label-quoted]
[fixture: kanban/db-grid-keyword-block-item-label-quoted]
[fixture: kanban/db-grid-keyword-class-item-label-quoted]
[fixture: kanban/db-grid-keyword-classdef-item-label-quoted]
[fixture: kanban/db-grid-keyword-columns-item-label-quoted]
[fixture: kanban/db-grid-keyword-end-item-label-quoted]
[fixture: kanban/db-grid-keyword-header-item-label-quoted]
[fixture: kanban/db-grid-keyword-space-item-label-quoted]
[fixture: kanban/db-grid-keyword-style-item-label-quoted]
[fixture: kanban/db-grid-less-than-item-label-quoted]
[fixture: kanban/db-grid-lf-item-label-quoted]
[fixture: kanban/db-grid-ls-item-label-quoted]
[fixture: kanban/db-grid-nbsp-item-label-quoted]
[fixture: kanban/db-grid-nel-item-label-quoted]
[fixture: kanban/db-grid-nonascii-item-label-quoted]
[fixture: kanban/db-grid-open-brace-item-label-quoted]
[fixture: kanban/db-grid-open-round-item-label-quoted]
[fixture: kanban/db-grid-open-square-item-label-quoted]
[fixture: kanban/db-grid-percent-item-label-quoted]
[fixture: kanban/db-grid-pipe-item-label-quoted]
[fixture: kanban/db-grid-proto-item-label-quoted]
[fixture: kanban/db-grid-ps-item-label-quoted]
[fixture: kanban/db-grid-punct-item-label-quoted]
[fixture: kanban/db-grid-root-item-label-quoted]
[fixture: kanban/db-grid-semicolon-item-label-quoted]
[fixture: kanban/db-grid-single-quote-item-label-quoted]
[fixture: kanban/db-grid-spaces-item-label-quoted]
[fixture: kanban/db-grid-tab-item-label-quoted]
[fixture: kanban/db-grid-vt-item-label-quoted]

`item-label-markdown` は項目のラベル（markdown 文字列）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-item-label-markdown]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-item-label-markdown]
[fixture: kanban/db-grid-entity-named-item-label-markdown]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-item-label-markdown]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-item-label-markdown]
[fixture: kanban/db-grid-style-rule-item-label-markdown]
1 つの改行として読まれる: `comment-line`、`cr`、`crlf`。
[fixture: kanban/db-grid-comment-line-item-label-markdown]
[fixture: kanban/db-grid-cr-item-label-markdown]
[fixture: kanban/db-grid-crlf-item-label-markdown]
2 つの改行として読まれる: `directive-line`。
[fixture: kanban/db-grid-directive-line-item-label-markdown]
字句解析器が拒否する: `backtick`、`quote`。
[fixture: kanban/gram-grid-backtick-item-label-markdown]
[fixture: kanban/gram-grid-quote-item-label-markdown]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-item-label-markdown]
[fixture: kanban/db-grid-arrow-item-label-markdown]
[fixture: kanban/db-grid-arrow-spaced-item-label-markdown]
[fixture: kanban/db-grid-backslash-item-label-markdown]
[fixture: kanban/db-grid-bom-item-label-markdown]
[fixture: kanban/db-grid-close-brace-item-label-markdown]
[fixture: kanban/db-grid-close-round-item-label-markdown]
[fixture: kanban/db-grid-close-square-item-label-markdown]
[fixture: kanban/db-grid-colon-item-label-markdown]
[fixture: kanban/db-grid-comma-item-label-markdown]
[fixture: kanban/db-grid-comment-item-label-markdown]
[fixture: kanban/db-grid-constructor-item-label-markdown]
[fixture: kanban/db-grid-dash-item-label-markdown]
[fixture: kanban/db-grid-digits-item-label-markdown]
[fixture: kanban/db-grid-emoji-item-label-markdown]
[fixture: kanban/db-grid-empty-item-label-markdown]
[fixture: kanban/db-grid-equals-item-label-markdown]
[fixture: kanban/db-grid-ff-item-label-markdown]
[fixture: kanban/db-grid-greater-than-item-label-markdown]
[fixture: kanban/db-grid-hash-item-label-markdown]
[fixture: kanban/db-grid-html-item-label-markdown]
[fixture: kanban/db-grid-html-br-item-label-markdown]
[fixture: kanban/db-grid-ideographic-item-label-markdown]
[fixture: kanban/db-grid-keyword-item-label-markdown]
[fixture: kanban/db-grid-keyword-block-item-label-markdown]
[fixture: kanban/db-grid-keyword-class-item-label-markdown]
[fixture: kanban/db-grid-keyword-classdef-item-label-markdown]
[fixture: kanban/db-grid-keyword-columns-item-label-markdown]
[fixture: kanban/db-grid-keyword-end-item-label-markdown]
[fixture: kanban/db-grid-keyword-header-item-label-markdown]
[fixture: kanban/db-grid-keyword-space-item-label-markdown]
[fixture: kanban/db-grid-keyword-style-item-label-markdown]
[fixture: kanban/db-grid-less-than-item-label-markdown]
[fixture: kanban/db-grid-lf-item-label-markdown]
[fixture: kanban/db-grid-ls-item-label-markdown]
[fixture: kanban/db-grid-nbsp-item-label-markdown]
[fixture: kanban/db-grid-nel-item-label-markdown]
[fixture: kanban/db-grid-nonascii-item-label-markdown]
[fixture: kanban/db-grid-open-brace-item-label-markdown]
[fixture: kanban/db-grid-open-round-item-label-markdown]
[fixture: kanban/db-grid-open-square-item-label-markdown]
[fixture: kanban/db-grid-percent-item-label-markdown]
[fixture: kanban/db-grid-pipe-item-label-markdown]
[fixture: kanban/db-grid-proto-item-label-markdown]
[fixture: kanban/db-grid-ps-item-label-markdown]
[fixture: kanban/db-grid-punct-item-label-markdown]
[fixture: kanban/db-grid-root-item-label-markdown]
[fixture: kanban/db-grid-semicolon-item-label-markdown]
[fixture: kanban/db-grid-single-quote-item-label-markdown]
[fixture: kanban/db-grid-spaces-item-label-markdown]
[fixture: kanban/db-grid-tab-item-label-markdown]
[fixture: kanban/db-grid-vt-item-label-markdown]

`section-icon` は列の後の `::icon( )` の名前。
読まれるが、要約は変わらない: `ampersand-entity`、`arrow`、`arrow-spaced`、
`backslash`、`backtick`、`bom`、`classdef-rule`、`close-brace`、
`close-square`、`colon`、`comma`、`comment`、`comment-line`、`constructor`、
`cr`、`crlf`、`dash`、`digits`、`directive`、`directive-line`、`emoji`、
`empty`、`entity`、`entity-named`、`equals`、`ff`、`greater-than`、`hash`、
`html`、`html-attribute`、`html-br`、`ideographic`、`keyword`、
`keyword-block`、`keyword-class`、`keyword-classdef`、`keyword-columns`、
`keyword-end`、`keyword-header`、`keyword-space`、`keyword-style`、
`less-than`、`lf`、`ls`、`nbsp`、`nel`、`nonascii`、`open-brace`、
`open-round`、`open-square`、`percent`、`pipe`、`proto`、`ps`、`punct`、
`quote`、`root`、`semicolon`、`single-quote`、`spaces`、`style-rule`、`tab`、
`vt`。
[fixture: kanban/db-grid-ampersand-entity-section-icon]
[fixture: kanban/db-grid-arrow-section-icon]
[fixture: kanban/db-grid-arrow-spaced-section-icon]
[fixture: kanban/db-grid-backslash-section-icon]
[fixture: kanban/db-grid-backtick-section-icon]
[fixture: kanban/db-grid-bom-section-icon]
[fixture: kanban/db-grid-classdef-rule-section-icon]
[fixture: kanban/db-grid-close-brace-section-icon]
[fixture: kanban/db-grid-close-square-section-icon]
[fixture: kanban/db-grid-colon-section-icon]
[fixture: kanban/db-grid-comma-section-icon]
[fixture: kanban/db-grid-comment-section-icon]
[fixture: kanban/db-grid-comment-line-section-icon]
[fixture: kanban/db-grid-constructor-section-icon]
[fixture: kanban/db-grid-cr-section-icon]
[fixture: kanban/db-grid-crlf-section-icon]
[fixture: kanban/db-grid-dash-section-icon]
[fixture: kanban/db-grid-digits-section-icon]
[fixture: kanban/db-grid-directive-section-icon]
[fixture: kanban/db-grid-directive-line-section-icon]
[fixture: kanban/db-grid-emoji-section-icon]
[fixture: kanban/db-grid-empty-section-icon]
[fixture: kanban/db-grid-entity-section-icon]
[fixture: kanban/db-grid-entity-named-section-icon]
[fixture: kanban/db-grid-equals-section-icon]
[fixture: kanban/db-grid-ff-section-icon]
[fixture: kanban/db-grid-greater-than-section-icon]
[fixture: kanban/db-grid-hash-section-icon]
[fixture: kanban/db-grid-html-section-icon]
[fixture: kanban/db-grid-html-attribute-section-icon]
[fixture: kanban/db-grid-html-br-section-icon]
[fixture: kanban/db-grid-ideographic-section-icon]
[fixture: kanban/db-grid-keyword-section-icon]
[fixture: kanban/db-grid-keyword-block-section-icon]
[fixture: kanban/db-grid-keyword-class-section-icon]
[fixture: kanban/db-grid-keyword-classdef-section-icon]
[fixture: kanban/db-grid-keyword-columns-section-icon]
[fixture: kanban/db-grid-keyword-end-section-icon]
[fixture: kanban/db-grid-keyword-header-section-icon]
[fixture: kanban/db-grid-keyword-space-section-icon]
[fixture: kanban/db-grid-keyword-style-section-icon]
[fixture: kanban/db-grid-less-than-section-icon]
[fixture: kanban/db-grid-lf-section-icon]
[fixture: kanban/db-grid-ls-section-icon]
[fixture: kanban/db-grid-nbsp-section-icon]
[fixture: kanban/db-grid-nel-section-icon]
[fixture: kanban/db-grid-nonascii-section-icon]
[fixture: kanban/db-grid-open-brace-section-icon]
[fixture: kanban/db-grid-open-round-section-icon]
[fixture: kanban/db-grid-open-square-section-icon]
[fixture: kanban/db-grid-percent-section-icon]
[fixture: kanban/db-grid-pipe-section-icon]
[fixture: kanban/db-grid-proto-section-icon]
[fixture: kanban/db-grid-ps-section-icon]
[fixture: kanban/db-grid-punct-section-icon]
[fixture: kanban/db-grid-quote-section-icon]
[fixture: kanban/db-grid-root-section-icon]
[fixture: kanban/db-grid-semicolon-section-icon]
[fixture: kanban/db-grid-single-quote-section-icon]
[fixture: kanban/db-grid-spaces-section-icon]
[fixture: kanban/db-grid-style-rule-section-icon]
[fixture: kanban/db-grid-tab-section-icon]
[fixture: kanban/db-grid-vt-section-icon]
文法が拒否する: `close-round`。
[fixture: kanban/gram-grid-close-round-section-icon]

`item-icon` は項目の後の `::icon( )` の名前。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-item-icon]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-item-icon]
[fixture: kanban/db-grid-entity-named-item-icon]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-item-icon]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-item-icon]
[fixture: kanban/db-grid-style-rule-item-icon]
1 つの改行として読まれる: `comment-line`、`cr`、`crlf`。
[fixture: kanban/db-grid-comment-line-item-icon]
[fixture: kanban/db-grid-cr-item-icon]
[fixture: kanban/db-grid-crlf-item-icon]
2 つの改行として読まれる: `directive-line`。
[fixture: kanban/db-grid-directive-line-item-icon]
文法が拒否する: `close-round`。
[fixture: kanban/gram-grid-close-round-item-icon]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-item-icon]
[fixture: kanban/db-grid-arrow-item-icon]
[fixture: kanban/db-grid-arrow-spaced-item-icon]
[fixture: kanban/db-grid-backslash-item-icon]
[fixture: kanban/db-grid-backtick-item-icon]
[fixture: kanban/db-grid-bom-item-icon]
[fixture: kanban/db-grid-close-brace-item-icon]
[fixture: kanban/db-grid-close-square-item-icon]
[fixture: kanban/db-grid-colon-item-icon]
[fixture: kanban/db-grid-comma-item-icon]
[fixture: kanban/db-grid-comment-item-icon]
[fixture: kanban/db-grid-constructor-item-icon]
[fixture: kanban/db-grid-dash-item-icon]
[fixture: kanban/db-grid-digits-item-icon]
[fixture: kanban/db-grid-emoji-item-icon]
[fixture: kanban/db-grid-empty-item-icon]
[fixture: kanban/db-grid-equals-item-icon]
[fixture: kanban/db-grid-ff-item-icon]
[fixture: kanban/db-grid-greater-than-item-icon]
[fixture: kanban/db-grid-hash-item-icon]
[fixture: kanban/db-grid-html-item-icon]
[fixture: kanban/db-grid-html-br-item-icon]
[fixture: kanban/db-grid-ideographic-item-icon]
[fixture: kanban/db-grid-keyword-item-icon]
[fixture: kanban/db-grid-keyword-block-item-icon]
[fixture: kanban/db-grid-keyword-class-item-icon]
[fixture: kanban/db-grid-keyword-classdef-item-icon]
[fixture: kanban/db-grid-keyword-columns-item-icon]
[fixture: kanban/db-grid-keyword-end-item-icon]
[fixture: kanban/db-grid-keyword-header-item-icon]
[fixture: kanban/db-grid-keyword-space-item-icon]
[fixture: kanban/db-grid-keyword-style-item-icon]
[fixture: kanban/db-grid-less-than-item-icon]
[fixture: kanban/db-grid-lf-item-icon]
[fixture: kanban/db-grid-ls-item-icon]
[fixture: kanban/db-grid-nbsp-item-icon]
[fixture: kanban/db-grid-nel-item-icon]
[fixture: kanban/db-grid-nonascii-item-icon]
[fixture: kanban/db-grid-open-brace-item-icon]
[fixture: kanban/db-grid-open-round-item-icon]
[fixture: kanban/db-grid-open-square-item-icon]
[fixture: kanban/db-grid-percent-item-icon]
[fixture: kanban/db-grid-pipe-item-icon]
[fixture: kanban/db-grid-proto-item-icon]
[fixture: kanban/db-grid-ps-item-icon]
[fixture: kanban/db-grid-punct-item-icon]
[fixture: kanban/db-grid-quote-item-icon]
[fixture: kanban/db-grid-root-item-icon]
[fixture: kanban/db-grid-semicolon-item-icon]
[fixture: kanban/db-grid-single-quote-item-icon]
[fixture: kanban/db-grid-spaces-item-icon]
[fixture: kanban/db-grid-tab-item-icon]
[fixture: kanban/db-grid-vt-item-icon]

`section-class` は列の後の `:::` のクラス。
読まれるが、要約は変わらない: `ampersand-entity`、`arrow`、`arrow-spaced`、
`backslash`、`backtick`、`bom`、`classdef-rule`、`close-brace`、
`close-round`、`close-square`、`colon`、`comma`、`comment`、`constructor`、
`dash`、`digits`、`directive`、`emoji`、`empty`、`entity`、`entity-named`、
`equals`、`ff`、`greater-than`、`hash`、`html`、`html-attribute`、`html-br`、
`ideographic`、`keyword`、`keyword-block`、`keyword-class`、
`keyword-classdef`、`keyword-columns`、`keyword-end`、`keyword-header`、
`keyword-space`、`keyword-style`、`less-than`、`nbsp`、`nel`、`nonascii`、
`open-brace`、`open-round`、`open-square`、`percent`、`pipe`、`proto`、
`punct`、`quote`、`root`、`semicolon`、`single-quote`、`spaces`、
`style-rule`、`tab`、`vt`。
[fixture: kanban/db-grid-ampersand-entity-section-class]
[fixture: kanban/db-grid-arrow-section-class]
[fixture: kanban/db-grid-arrow-spaced-section-class]
[fixture: kanban/db-grid-backslash-section-class]
[fixture: kanban/db-grid-backtick-section-class]
[fixture: kanban/db-grid-bom-section-class]
[fixture: kanban/db-grid-classdef-rule-section-class]
[fixture: kanban/db-grid-close-brace-section-class]
[fixture: kanban/db-grid-close-round-section-class]
[fixture: kanban/db-grid-close-square-section-class]
[fixture: kanban/db-grid-colon-section-class]
[fixture: kanban/db-grid-comma-section-class]
[fixture: kanban/db-grid-comment-section-class]
[fixture: kanban/db-grid-constructor-section-class]
[fixture: kanban/db-grid-dash-section-class]
[fixture: kanban/db-grid-digits-section-class]
[fixture: kanban/db-grid-directive-section-class]
[fixture: kanban/db-grid-emoji-section-class]
[fixture: kanban/db-grid-empty-section-class]
[fixture: kanban/db-grid-entity-section-class]
[fixture: kanban/db-grid-entity-named-section-class]
[fixture: kanban/db-grid-equals-section-class]
[fixture: kanban/db-grid-ff-section-class]
[fixture: kanban/db-grid-greater-than-section-class]
[fixture: kanban/db-grid-hash-section-class]
[fixture: kanban/db-grid-html-section-class]
[fixture: kanban/db-grid-html-attribute-section-class]
[fixture: kanban/db-grid-html-br-section-class]
[fixture: kanban/db-grid-ideographic-section-class]
[fixture: kanban/db-grid-keyword-section-class]
[fixture: kanban/db-grid-keyword-block-section-class]
[fixture: kanban/db-grid-keyword-class-section-class]
[fixture: kanban/db-grid-keyword-classdef-section-class]
[fixture: kanban/db-grid-keyword-columns-section-class]
[fixture: kanban/db-grid-keyword-end-section-class]
[fixture: kanban/db-grid-keyword-header-section-class]
[fixture: kanban/db-grid-keyword-space-section-class]
[fixture: kanban/db-grid-keyword-style-section-class]
[fixture: kanban/db-grid-less-than-section-class]
[fixture: kanban/db-grid-nbsp-section-class]
[fixture: kanban/db-grid-nel-section-class]
[fixture: kanban/db-grid-nonascii-section-class]
[fixture: kanban/db-grid-open-brace-section-class]
[fixture: kanban/db-grid-open-round-section-class]
[fixture: kanban/db-grid-open-square-section-class]
[fixture: kanban/db-grid-percent-section-class]
[fixture: kanban/db-grid-pipe-section-class]
[fixture: kanban/db-grid-proto-section-class]
[fixture: kanban/db-grid-punct-section-class]
[fixture: kanban/db-grid-quote-section-class]
[fixture: kanban/db-grid-root-section-class]
[fixture: kanban/db-grid-semicolon-section-class]
[fixture: kanban/db-grid-single-quote-section-class]
[fixture: kanban/db-grid-spaces-section-class]
[fixture: kanban/db-grid-style-rule-section-class]
[fixture: kanban/db-grid-tab-section-class]
[fixture: kanban/db-grid-vt-section-class]
文法が拒否する: `ls`、`ps`。
[fixture: kanban/gram-grid-ls-section-class]
[fixture: kanban/gram-grid-ps-section-class]
Db が拒否する: 項目の前に列がない（`Items without section detected`）:
`comment-line`、`cr`、`crlf`、`directive-line`、`lf`。
[fixture: kanban/gram-grid-comment-line-section-class]
[fixture: kanban/gram-grid-cr-section-class]
[fixture: kanban/gram-grid-crlf-section-class]
[fixture: kanban/gram-grid-directive-line-section-class]
[fixture: kanban/gram-grid-lf-section-class]

`item-class` は項目の後の `:::` のクラス。
読まれるが、要約は変わらない: `ampersand-entity`、`arrow`、`arrow-spaced`、
`backslash`、`backtick`、`bom`、`classdef-rule`、`close-brace`、
`close-round`、`close-square`、`colon`、`comma`、`comment`、`comment-line`、
`constructor`、`cr`、`crlf`、`dash`、`digits`、`directive`、`directive-line`、
`emoji`、`empty`、`entity`、`entity-named`、`equals`、`ff`、`greater-than`、
`hash`、`html`、`html-attribute`、`html-br`、`ideographic`、`keyword`、
`keyword-block`、`keyword-class`、`keyword-classdef`、`keyword-columns`、
`keyword-end`、`keyword-header`、`keyword-space`、`keyword-style`、
`less-than`、`lf`、`nbsp`、`nel`、`nonascii`、`open-brace`、`open-round`、
`open-square`、`percent`、`pipe`、`proto`、`punct`、`quote`、`root`、
`semicolon`、`single-quote`、`spaces`、`style-rule`、`tab`、`vt`。
[fixture: kanban/db-grid-ampersand-entity-item-class]
[fixture: kanban/db-grid-arrow-item-class]
[fixture: kanban/db-grid-arrow-spaced-item-class]
[fixture: kanban/db-grid-backslash-item-class]
[fixture: kanban/db-grid-backtick-item-class]
[fixture: kanban/db-grid-bom-item-class]
[fixture: kanban/db-grid-classdef-rule-item-class]
[fixture: kanban/db-grid-close-brace-item-class]
[fixture: kanban/db-grid-close-round-item-class]
[fixture: kanban/db-grid-close-square-item-class]
[fixture: kanban/db-grid-colon-item-class]
[fixture: kanban/db-grid-comma-item-class]
[fixture: kanban/db-grid-comment-item-class]
[fixture: kanban/db-grid-comment-line-item-class]
[fixture: kanban/db-grid-constructor-item-class]
[fixture: kanban/db-grid-cr-item-class]
[fixture: kanban/db-grid-crlf-item-class]
[fixture: kanban/db-grid-dash-item-class]
[fixture: kanban/db-grid-digits-item-class]
[fixture: kanban/db-grid-directive-item-class]
[fixture: kanban/db-grid-directive-line-item-class]
[fixture: kanban/db-grid-emoji-item-class]
[fixture: kanban/db-grid-empty-item-class]
[fixture: kanban/db-grid-entity-item-class]
[fixture: kanban/db-grid-entity-named-item-class]
[fixture: kanban/db-grid-equals-item-class]
[fixture: kanban/db-grid-ff-item-class]
[fixture: kanban/db-grid-greater-than-item-class]
[fixture: kanban/db-grid-hash-item-class]
[fixture: kanban/db-grid-html-item-class]
[fixture: kanban/db-grid-html-attribute-item-class]
[fixture: kanban/db-grid-html-br-item-class]
[fixture: kanban/db-grid-ideographic-item-class]
[fixture: kanban/db-grid-keyword-item-class]
[fixture: kanban/db-grid-keyword-block-item-class]
[fixture: kanban/db-grid-keyword-class-item-class]
[fixture: kanban/db-grid-keyword-classdef-item-class]
[fixture: kanban/db-grid-keyword-columns-item-class]
[fixture: kanban/db-grid-keyword-end-item-class]
[fixture: kanban/db-grid-keyword-header-item-class]
[fixture: kanban/db-grid-keyword-space-item-class]
[fixture: kanban/db-grid-keyword-style-item-class]
[fixture: kanban/db-grid-less-than-item-class]
[fixture: kanban/db-grid-lf-item-class]
[fixture: kanban/db-grid-nbsp-item-class]
[fixture: kanban/db-grid-nel-item-class]
[fixture: kanban/db-grid-nonascii-item-class]
[fixture: kanban/db-grid-open-brace-item-class]
[fixture: kanban/db-grid-open-round-item-class]
[fixture: kanban/db-grid-open-square-item-class]
[fixture: kanban/db-grid-percent-item-class]
[fixture: kanban/db-grid-pipe-item-class]
[fixture: kanban/db-grid-proto-item-class]
[fixture: kanban/db-grid-punct-item-class]
[fixture: kanban/db-grid-quote-item-class]
[fixture: kanban/db-grid-root-item-class]
[fixture: kanban/db-grid-semicolon-item-class]
[fixture: kanban/db-grid-single-quote-item-class]
[fixture: kanban/db-grid-spaces-item-class]
[fixture: kanban/db-grid-style-rule-item-class]
[fixture: kanban/db-grid-tab-item-class]
[fixture: kanban/db-grid-vt-item-class]
文法が拒否する: `ls`、`ps`。
[fixture: kanban/gram-grid-ls-item-class]
[fixture: kanban/gram-grid-ps-item-class]

`metadata-key` は項目のデータブロック `@{ }` のキー。
読まれるが、要約は変わらない: `ampersand-entity`、`arrow`、`arrow-spaced`、
`backslash`、`backtick`、`bom`、`classdef-rule`、`close-round`、`colon`、
`comma`、`comment`、`constructor`、`dash`、`digits`、`directive`、`emoji`、
`empty`、`entity`、`entity-named`、`equals`、`greater-than`、`hash`、`html`、
`html-attribute`、`html-br`、`ideographic`、`keyword`、`keyword-block`、
`keyword-class`、`keyword-classdef`、`keyword-columns`、`keyword-end`、
`keyword-header`、`keyword-space`、`keyword-style`、`less-than`、`ls`、
`nbsp`、`nel`、`nonascii`、`open-round`、`percent`、`pipe`、`proto`、`ps`、
`root`、`semicolon`、`single-quote`、`spaces`、`style-rule`、`tab`。
[fixture: kanban/db-grid-ampersand-entity-metadata-key]
[fixture: kanban/db-grid-arrow-metadata-key]
[fixture: kanban/db-grid-arrow-spaced-metadata-key]
[fixture: kanban/db-grid-backslash-metadata-key]
[fixture: kanban/db-grid-backtick-metadata-key]
[fixture: kanban/db-grid-bom-metadata-key]
[fixture: kanban/db-grid-classdef-rule-metadata-key]
[fixture: kanban/db-grid-close-round-metadata-key]
[fixture: kanban/db-grid-colon-metadata-key]
[fixture: kanban/db-grid-comma-metadata-key]
[fixture: kanban/db-grid-comment-metadata-key]
[fixture: kanban/db-grid-constructor-metadata-key]
[fixture: kanban/db-grid-dash-metadata-key]
[fixture: kanban/db-grid-digits-metadata-key]
[fixture: kanban/db-grid-directive-metadata-key]
[fixture: kanban/db-grid-emoji-metadata-key]
[fixture: kanban/db-grid-empty-metadata-key]
[fixture: kanban/db-grid-entity-metadata-key]
[fixture: kanban/db-grid-entity-named-metadata-key]
[fixture: kanban/db-grid-equals-metadata-key]
[fixture: kanban/db-grid-greater-than-metadata-key]
[fixture: kanban/db-grid-hash-metadata-key]
[fixture: kanban/db-grid-html-metadata-key]
[fixture: kanban/db-grid-html-attribute-metadata-key]
[fixture: kanban/db-grid-html-br-metadata-key]
[fixture: kanban/db-grid-ideographic-metadata-key]
[fixture: kanban/db-grid-keyword-metadata-key]
[fixture: kanban/db-grid-keyword-block-metadata-key]
[fixture: kanban/db-grid-keyword-class-metadata-key]
[fixture: kanban/db-grid-keyword-classdef-metadata-key]
[fixture: kanban/db-grid-keyword-columns-metadata-key]
[fixture: kanban/db-grid-keyword-end-metadata-key]
[fixture: kanban/db-grid-keyword-header-metadata-key]
[fixture: kanban/db-grid-keyword-space-metadata-key]
[fixture: kanban/db-grid-keyword-style-metadata-key]
[fixture: kanban/db-grid-less-than-metadata-key]
[fixture: kanban/db-grid-ls-metadata-key]
[fixture: kanban/db-grid-nbsp-metadata-key]
[fixture: kanban/db-grid-nel-metadata-key]
[fixture: kanban/db-grid-nonascii-metadata-key]
[fixture: kanban/db-grid-open-round-metadata-key]
[fixture: kanban/db-grid-percent-metadata-key]
[fixture: kanban/db-grid-pipe-metadata-key]
[fixture: kanban/db-grid-proto-metadata-key]
[fixture: kanban/db-grid-ps-metadata-key]
[fixture: kanban/db-grid-root-metadata-key]
[fixture: kanban/db-grid-semicolon-metadata-key]
[fixture: kanban/db-grid-single-quote-metadata-key]
[fixture: kanban/db-grid-spaces-metadata-key]
[fixture: kanban/db-grid-style-rule-metadata-key]
[fixture: kanban/db-grid-tab-metadata-key]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-key]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-key]
[fixture: kanban/gram-grid-quote-metadata-key]
データブロックの YAML が拒否する: `close-square`、`comment-line`、`cr`、
`crlf`、`directive-line`、`ff`、`lf`、`open-brace`、`open-square`、`vt`。
[fixture: kanban/gram-grid-close-square-metadata-key]
[fixture: kanban/gram-grid-comment-line-metadata-key]
[fixture: kanban/gram-grid-cr-metadata-key]
[fixture: kanban/gram-grid-crlf-metadata-key]
[fixture: kanban/gram-grid-directive-line-metadata-key]
[fixture: kanban/gram-grid-ff-metadata-key]
[fixture: kanban/gram-grid-lf-metadata-key]
[fixture: kanban/gram-grid-open-brace-metadata-key]
[fixture: kanban/gram-grid-open-square-metadata-key]
[fixture: kanban/gram-grid-vt-metadata-key]

`metadata-multiline` は複数行のデータブロックの `label` の値。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-metadata-multiline]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-multiline]
[fixture: kanban/db-grid-entity-named-metadata-multiline]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-multiline]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-multiline]
[fixture: kanban/db-grid-style-rule-metadata-multiline]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-multiline]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-multiline]
[fixture: kanban/gram-grid-quote-metadata-multiline]
データブロックの YAML が拒否する: `comment-line`、`cr`、`crlf`、
`directive-line`、`ff`、`lf`、`vt`。
[fixture: kanban/gram-grid-comment-line-metadata-multiline]
[fixture: kanban/gram-grid-cr-metadata-multiline]
[fixture: kanban/gram-grid-crlf-metadata-multiline]
[fixture: kanban/gram-grid-directive-line-metadata-multiline]
[fixture: kanban/gram-grid-ff-metadata-multiline]
[fixture: kanban/gram-grid-lf-metadata-multiline]
[fixture: kanban/gram-grid-vt-metadata-multiline]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-multiline]
[fixture: kanban/db-grid-arrow-metadata-multiline]
[fixture: kanban/db-grid-arrow-spaced-metadata-multiline]
[fixture: kanban/db-grid-backslash-metadata-multiline]
[fixture: kanban/db-grid-backtick-metadata-multiline]
[fixture: kanban/db-grid-bom-metadata-multiline]
[fixture: kanban/db-grid-close-round-metadata-multiline]
[fixture: kanban/db-grid-close-square-metadata-multiline]
[fixture: kanban/db-grid-colon-metadata-multiline]
[fixture: kanban/db-grid-comma-metadata-multiline]
[fixture: kanban/db-grid-comment-metadata-multiline]
[fixture: kanban/db-grid-constructor-metadata-multiline]
[fixture: kanban/db-grid-dash-metadata-multiline]
[fixture: kanban/db-grid-digits-metadata-multiline]
[fixture: kanban/db-grid-emoji-metadata-multiline]
[fixture: kanban/db-grid-empty-metadata-multiline]
[fixture: kanban/db-grid-equals-metadata-multiline]
[fixture: kanban/db-grid-greater-than-metadata-multiline]
[fixture: kanban/db-grid-hash-metadata-multiline]
[fixture: kanban/db-grid-html-metadata-multiline]
[fixture: kanban/db-grid-html-br-metadata-multiline]
[fixture: kanban/db-grid-ideographic-metadata-multiline]
[fixture: kanban/db-grid-keyword-metadata-multiline]
[fixture: kanban/db-grid-keyword-block-metadata-multiline]
[fixture: kanban/db-grid-keyword-class-metadata-multiline]
[fixture: kanban/db-grid-keyword-classdef-metadata-multiline]
[fixture: kanban/db-grid-keyword-columns-metadata-multiline]
[fixture: kanban/db-grid-keyword-end-metadata-multiline]
[fixture: kanban/db-grid-keyword-header-metadata-multiline]
[fixture: kanban/db-grid-keyword-space-metadata-multiline]
[fixture: kanban/db-grid-keyword-style-metadata-multiline]
[fixture: kanban/db-grid-less-than-metadata-multiline]
[fixture: kanban/db-grid-ls-metadata-multiline]
[fixture: kanban/db-grid-nbsp-metadata-multiline]
[fixture: kanban/db-grid-nel-metadata-multiline]
[fixture: kanban/db-grid-nonascii-metadata-multiline]
[fixture: kanban/db-grid-open-brace-metadata-multiline]
[fixture: kanban/db-grid-open-round-metadata-multiline]
[fixture: kanban/db-grid-open-square-metadata-multiline]
[fixture: kanban/db-grid-percent-metadata-multiline]
[fixture: kanban/db-grid-pipe-metadata-multiline]
[fixture: kanban/db-grid-proto-metadata-multiline]
[fixture: kanban/db-grid-ps-metadata-multiline]
[fixture: kanban/db-grid-root-metadata-multiline]
[fixture: kanban/db-grid-semicolon-metadata-multiline]
[fixture: kanban/db-grid-single-quote-metadata-multiline]
[fixture: kanban/db-grid-spaces-metadata-multiline]
[fixture: kanban/db-grid-tab-metadata-multiline]

`metadata-label-bare` は項目のデータブロックの `label` の値（引用符なし）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-metadata-label-bare]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-label-bare]
[fixture: kanban/db-grid-entity-named-metadata-label-bare]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-label-bare]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-label-bare]
[fixture: kanban/db-grid-style-rule-metadata-label-bare]
そこで値が終わり、`a` になる: `comma`。
[fixture: kanban/db-grid-comma-metadata-label-bare]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-label-bare]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-label-bare]
[fixture: kanban/gram-grid-quote-metadata-label-bare]
データブロックの YAML が拒否する: `close-square`、`comment-line`、`cr`、
`crlf`、`directive-line`、`ff`、`lf`、`open-brace`、`open-square`、`vt`。
[fixture: kanban/gram-grid-close-square-metadata-label-bare]
[fixture: kanban/gram-grid-comment-line-metadata-label-bare]
[fixture: kanban/gram-grid-cr-metadata-label-bare]
[fixture: kanban/gram-grid-crlf-metadata-label-bare]
[fixture: kanban/gram-grid-directive-line-metadata-label-bare]
[fixture: kanban/gram-grid-ff-metadata-label-bare]
[fixture: kanban/gram-grid-lf-metadata-label-bare]
[fixture: kanban/gram-grid-open-brace-metadata-label-bare]
[fixture: kanban/gram-grid-open-square-metadata-label-bare]
[fixture: kanban/gram-grid-vt-metadata-label-bare]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-label-bare]
[fixture: kanban/db-grid-arrow-metadata-label-bare]
[fixture: kanban/db-grid-arrow-spaced-metadata-label-bare]
[fixture: kanban/db-grid-backslash-metadata-label-bare]
[fixture: kanban/db-grid-backtick-metadata-label-bare]
[fixture: kanban/db-grid-bom-metadata-label-bare]
[fixture: kanban/db-grid-close-round-metadata-label-bare]
[fixture: kanban/db-grid-colon-metadata-label-bare]
[fixture: kanban/db-grid-comment-metadata-label-bare]
[fixture: kanban/db-grid-constructor-metadata-label-bare]
[fixture: kanban/db-grid-dash-metadata-label-bare]
[fixture: kanban/db-grid-digits-metadata-label-bare]
[fixture: kanban/db-grid-emoji-metadata-label-bare]
[fixture: kanban/db-grid-empty-metadata-label-bare]
[fixture: kanban/db-grid-equals-metadata-label-bare]
[fixture: kanban/db-grid-greater-than-metadata-label-bare]
[fixture: kanban/db-grid-hash-metadata-label-bare]
[fixture: kanban/db-grid-html-metadata-label-bare]
[fixture: kanban/db-grid-html-br-metadata-label-bare]
[fixture: kanban/db-grid-ideographic-metadata-label-bare]
[fixture: kanban/db-grid-keyword-metadata-label-bare]
[fixture: kanban/db-grid-keyword-block-metadata-label-bare]
[fixture: kanban/db-grid-keyword-class-metadata-label-bare]
[fixture: kanban/db-grid-keyword-classdef-metadata-label-bare]
[fixture: kanban/db-grid-keyword-columns-metadata-label-bare]
[fixture: kanban/db-grid-keyword-end-metadata-label-bare]
[fixture: kanban/db-grid-keyword-header-metadata-label-bare]
[fixture: kanban/db-grid-keyword-space-metadata-label-bare]
[fixture: kanban/db-grid-keyword-style-metadata-label-bare]
[fixture: kanban/db-grid-less-than-metadata-label-bare]
[fixture: kanban/db-grid-ls-metadata-label-bare]
[fixture: kanban/db-grid-nbsp-metadata-label-bare]
[fixture: kanban/db-grid-nel-metadata-label-bare]
[fixture: kanban/db-grid-nonascii-metadata-label-bare]
[fixture: kanban/db-grid-open-round-metadata-label-bare]
[fixture: kanban/db-grid-percent-metadata-label-bare]
[fixture: kanban/db-grid-pipe-metadata-label-bare]
[fixture: kanban/db-grid-proto-metadata-label-bare]
[fixture: kanban/db-grid-ps-metadata-label-bare]
[fixture: kanban/db-grid-root-metadata-label-bare]
[fixture: kanban/db-grid-semicolon-metadata-label-bare]
[fixture: kanban/db-grid-single-quote-metadata-label-bare]
[fixture: kanban/db-grid-spaces-metadata-label-bare]
[fixture: kanban/db-grid-tab-metadata-label-bare]

`metadata-label-single` は項目のデータブロックの `label` の値（一重引用符）。
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-label-single]
[fixture: kanban/db-grid-entity-named-metadata-label-single]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-label-single]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-label-single]
[fixture: kanban/db-grid-style-rule-metadata-label-single]
1 つの改行として読まれる: `directive-line`。
[fixture: kanban/db-grid-directive-line-metadata-label-single]
1 つの空白として読まれる（YAML が改行を畳む）: `comment-line`、`cr`、`crlf`、
`lf`。
[fixture: kanban/db-grid-comment-line-metadata-label-single]
[fixture: kanban/db-grid-cr-metadata-label-single]
[fixture: kanban/db-grid-crlf-metadata-label-single]
[fixture: kanban/db-grid-lf-metadata-label-single]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-label-single]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-label-single]
[fixture: kanban/gram-grid-quote-metadata-label-single]
データブロックの YAML が拒否する: `ff`、`html-attribute`、`single-quote`、
`vt`。
[fixture: kanban/gram-grid-ff-metadata-label-single]
[fixture: kanban/gram-grid-html-attribute-metadata-label-single]
[fixture: kanban/gram-grid-single-quote-metadata-label-single]
[fixture: kanban/gram-grid-vt-metadata-label-single]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-label-single]
[fixture: kanban/db-grid-arrow-metadata-label-single]
[fixture: kanban/db-grid-arrow-spaced-metadata-label-single]
[fixture: kanban/db-grid-backslash-metadata-label-single]
[fixture: kanban/db-grid-backtick-metadata-label-single]
[fixture: kanban/db-grid-bom-metadata-label-single]
[fixture: kanban/db-grid-close-round-metadata-label-single]
[fixture: kanban/db-grid-close-square-metadata-label-single]
[fixture: kanban/db-grid-colon-metadata-label-single]
[fixture: kanban/db-grid-comma-metadata-label-single]
[fixture: kanban/db-grid-comment-metadata-label-single]
[fixture: kanban/db-grid-constructor-metadata-label-single]
[fixture: kanban/db-grid-dash-metadata-label-single]
[fixture: kanban/db-grid-digits-metadata-label-single]
[fixture: kanban/db-grid-emoji-metadata-label-single]
[fixture: kanban/db-grid-empty-metadata-label-single]
[fixture: kanban/db-grid-equals-metadata-label-single]
[fixture: kanban/db-grid-greater-than-metadata-label-single]
[fixture: kanban/db-grid-hash-metadata-label-single]
[fixture: kanban/db-grid-html-metadata-label-single]
[fixture: kanban/db-grid-html-br-metadata-label-single]
[fixture: kanban/db-grid-ideographic-metadata-label-single]
[fixture: kanban/db-grid-keyword-metadata-label-single]
[fixture: kanban/db-grid-keyword-block-metadata-label-single]
[fixture: kanban/db-grid-keyword-class-metadata-label-single]
[fixture: kanban/db-grid-keyword-classdef-metadata-label-single]
[fixture: kanban/db-grid-keyword-columns-metadata-label-single]
[fixture: kanban/db-grid-keyword-end-metadata-label-single]
[fixture: kanban/db-grid-keyword-header-metadata-label-single]
[fixture: kanban/db-grid-keyword-space-metadata-label-single]
[fixture: kanban/db-grid-keyword-style-metadata-label-single]
[fixture: kanban/db-grid-less-than-metadata-label-single]
[fixture: kanban/db-grid-ls-metadata-label-single]
[fixture: kanban/db-grid-nbsp-metadata-label-single]
[fixture: kanban/db-grid-nel-metadata-label-single]
[fixture: kanban/db-grid-nonascii-metadata-label-single]
[fixture: kanban/db-grid-open-brace-metadata-label-single]
[fixture: kanban/db-grid-open-round-metadata-label-single]
[fixture: kanban/db-grid-open-square-metadata-label-single]
[fixture: kanban/db-grid-percent-metadata-label-single]
[fixture: kanban/db-grid-pipe-metadata-label-single]
[fixture: kanban/db-grid-proto-metadata-label-single]
[fixture: kanban/db-grid-ps-metadata-label-single]
[fixture: kanban/db-grid-root-metadata-label-single]
[fixture: kanban/db-grid-semicolon-metadata-label-single]
[fixture: kanban/db-grid-spaces-metadata-label-single]
[fixture: kanban/db-grid-tab-metadata-label-single]

`metadata-label-quoted` は項目のデータブロックの `label` の値（二重引用符）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-metadata-label-quoted]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-label-quoted]
[fixture: kanban/db-grid-entity-named-metadata-label-quoted]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-label-quoted]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-label-quoted]
[fixture: kanban/db-grid-style-rule-metadata-label-quoted]
`<br/>` として読まれる: `comment-line`、`cr`、`crlf`、`directive-line`、`lf`。
[fixture: kanban/db-grid-comment-line-metadata-label-quoted]
[fixture: kanban/db-grid-cr-metadata-label-quoted]
[fixture: kanban/db-grid-crlf-metadata-label-quoted]
[fixture: kanban/db-grid-directive-line-metadata-label-quoted]
[fixture: kanban/db-grid-lf-metadata-label-quoted]
バックスペースとして読まれる（YAML のエスケープ `\b`）: `backslash`。
[fixture: kanban/db-grid-backslash-metadata-label-quoted]
文法が拒否する: `quote`。
[fixture: kanban/gram-grid-quote-metadata-label-quoted]
データブロックの YAML が拒否する: `ff`、`vt`。
[fixture: kanban/gram-grid-ff-metadata-label-quoted]
[fixture: kanban/gram-grid-vt-metadata-label-quoted]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-label-quoted]
[fixture: kanban/db-grid-arrow-metadata-label-quoted]
[fixture: kanban/db-grid-arrow-spaced-metadata-label-quoted]
[fixture: kanban/db-grid-backtick-metadata-label-quoted]
[fixture: kanban/db-grid-bom-metadata-label-quoted]
[fixture: kanban/db-grid-close-brace-metadata-label-quoted]
[fixture: kanban/db-grid-close-round-metadata-label-quoted]
[fixture: kanban/db-grid-close-square-metadata-label-quoted]
[fixture: kanban/db-grid-colon-metadata-label-quoted]
[fixture: kanban/db-grid-comma-metadata-label-quoted]
[fixture: kanban/db-grid-comment-metadata-label-quoted]
[fixture: kanban/db-grid-constructor-metadata-label-quoted]
[fixture: kanban/db-grid-dash-metadata-label-quoted]
[fixture: kanban/db-grid-digits-metadata-label-quoted]
[fixture: kanban/db-grid-emoji-metadata-label-quoted]
[fixture: kanban/db-grid-empty-metadata-label-quoted]
[fixture: kanban/db-grid-equals-metadata-label-quoted]
[fixture: kanban/db-grid-greater-than-metadata-label-quoted]
[fixture: kanban/db-grid-hash-metadata-label-quoted]
[fixture: kanban/db-grid-html-metadata-label-quoted]
[fixture: kanban/db-grid-html-br-metadata-label-quoted]
[fixture: kanban/db-grid-ideographic-metadata-label-quoted]
[fixture: kanban/db-grid-keyword-metadata-label-quoted]
[fixture: kanban/db-grid-keyword-block-metadata-label-quoted]
[fixture: kanban/db-grid-keyword-class-metadata-label-quoted]
[fixture: kanban/db-grid-keyword-classdef-metadata-label-quoted]
[fixture: kanban/db-grid-keyword-columns-metadata-label-quoted]
[fixture: kanban/db-grid-keyword-end-metadata-label-quoted]
[fixture: kanban/db-grid-keyword-header-metadata-label-quoted]
[fixture: kanban/db-grid-keyword-space-metadata-label-quoted]
[fixture: kanban/db-grid-keyword-style-metadata-label-quoted]
[fixture: kanban/db-grid-less-than-metadata-label-quoted]
[fixture: kanban/db-grid-ls-metadata-label-quoted]
[fixture: kanban/db-grid-nbsp-metadata-label-quoted]
[fixture: kanban/db-grid-nel-metadata-label-quoted]
[fixture: kanban/db-grid-nonascii-metadata-label-quoted]
[fixture: kanban/db-grid-open-brace-metadata-label-quoted]
[fixture: kanban/db-grid-open-round-metadata-label-quoted]
[fixture: kanban/db-grid-open-square-metadata-label-quoted]
[fixture: kanban/db-grid-percent-metadata-label-quoted]
[fixture: kanban/db-grid-pipe-metadata-label-quoted]
[fixture: kanban/db-grid-proto-metadata-label-quoted]
[fixture: kanban/db-grid-ps-metadata-label-quoted]
[fixture: kanban/db-grid-punct-metadata-label-quoted]
[fixture: kanban/db-grid-root-metadata-label-quoted]
[fixture: kanban/db-grid-semicolon-metadata-label-quoted]
[fixture: kanban/db-grid-single-quote-metadata-label-quoted]
[fixture: kanban/db-grid-spaces-metadata-label-quoted]
[fixture: kanban/db-grid-tab-metadata-label-quoted]

`metadata-assigned-bare` は項目のデータブロックの `assigned` の
値（引用符なし）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-metadata-assigned-bare]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-assigned-bare]
[fixture: kanban/db-grid-entity-named-metadata-assigned-bare]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-assigned-bare]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-assigned-bare]
[fixture: kanban/db-grid-style-rule-metadata-assigned-bare]
そこで値が終わり、`a` になる: `comma`。
[fixture: kanban/db-grid-comma-metadata-assigned-bare]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-assigned-bare]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-assigned-bare]
[fixture: kanban/gram-grid-quote-metadata-assigned-bare]
データブロックの YAML が拒否する: `close-square`、`comment-line`、`cr`、
`crlf`、`directive-line`、`ff`、`lf`、`open-brace`、`open-square`、`vt`。
[fixture: kanban/gram-grid-close-square-metadata-assigned-bare]
[fixture: kanban/gram-grid-comment-line-metadata-assigned-bare]
[fixture: kanban/gram-grid-cr-metadata-assigned-bare]
[fixture: kanban/gram-grid-crlf-metadata-assigned-bare]
[fixture: kanban/gram-grid-directive-line-metadata-assigned-bare]
[fixture: kanban/gram-grid-ff-metadata-assigned-bare]
[fixture: kanban/gram-grid-lf-metadata-assigned-bare]
[fixture: kanban/gram-grid-open-brace-metadata-assigned-bare]
[fixture: kanban/gram-grid-open-square-metadata-assigned-bare]
[fixture: kanban/gram-grid-vt-metadata-assigned-bare]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-assigned-bare]
[fixture: kanban/db-grid-arrow-metadata-assigned-bare]
[fixture: kanban/db-grid-arrow-spaced-metadata-assigned-bare]
[fixture: kanban/db-grid-backslash-metadata-assigned-bare]
[fixture: kanban/db-grid-backtick-metadata-assigned-bare]
[fixture: kanban/db-grid-bom-metadata-assigned-bare]
[fixture: kanban/db-grid-close-round-metadata-assigned-bare]
[fixture: kanban/db-grid-colon-metadata-assigned-bare]
[fixture: kanban/db-grid-comment-metadata-assigned-bare]
[fixture: kanban/db-grid-constructor-metadata-assigned-bare]
[fixture: kanban/db-grid-dash-metadata-assigned-bare]
[fixture: kanban/db-grid-digits-metadata-assigned-bare]
[fixture: kanban/db-grid-emoji-metadata-assigned-bare]
[fixture: kanban/db-grid-empty-metadata-assigned-bare]
[fixture: kanban/db-grid-equals-metadata-assigned-bare]
[fixture: kanban/db-grid-greater-than-metadata-assigned-bare]
[fixture: kanban/db-grid-hash-metadata-assigned-bare]
[fixture: kanban/db-grid-html-metadata-assigned-bare]
[fixture: kanban/db-grid-html-br-metadata-assigned-bare]
[fixture: kanban/db-grid-ideographic-metadata-assigned-bare]
[fixture: kanban/db-grid-keyword-metadata-assigned-bare]
[fixture: kanban/db-grid-keyword-block-metadata-assigned-bare]
[fixture: kanban/db-grid-keyword-class-metadata-assigned-bare]
[fixture: kanban/db-grid-keyword-classdef-metadata-assigned-bare]
[fixture: kanban/db-grid-keyword-columns-metadata-assigned-bare]
[fixture: kanban/db-grid-keyword-end-metadata-assigned-bare]
[fixture: kanban/db-grid-keyword-header-metadata-assigned-bare]
[fixture: kanban/db-grid-keyword-space-metadata-assigned-bare]
[fixture: kanban/db-grid-keyword-style-metadata-assigned-bare]
[fixture: kanban/db-grid-less-than-metadata-assigned-bare]
[fixture: kanban/db-grid-ls-metadata-assigned-bare]
[fixture: kanban/db-grid-nbsp-metadata-assigned-bare]
[fixture: kanban/db-grid-nel-metadata-assigned-bare]
[fixture: kanban/db-grid-nonascii-metadata-assigned-bare]
[fixture: kanban/db-grid-open-round-metadata-assigned-bare]
[fixture: kanban/db-grid-percent-metadata-assigned-bare]
[fixture: kanban/db-grid-pipe-metadata-assigned-bare]
[fixture: kanban/db-grid-proto-metadata-assigned-bare]
[fixture: kanban/db-grid-ps-metadata-assigned-bare]
[fixture: kanban/db-grid-root-metadata-assigned-bare]
[fixture: kanban/db-grid-semicolon-metadata-assigned-bare]
[fixture: kanban/db-grid-single-quote-metadata-assigned-bare]
[fixture: kanban/db-grid-spaces-metadata-assigned-bare]
[fixture: kanban/db-grid-tab-metadata-assigned-bare]

`metadata-assigned-single` は項目のデータブロックの `assigned` の
値（一重引用符）。
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-assigned-single]
[fixture: kanban/db-grid-entity-named-metadata-assigned-single]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-assigned-single]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-assigned-single]
[fixture: kanban/db-grid-style-rule-metadata-assigned-single]
1 つの改行として読まれる: `directive-line`。
[fixture: kanban/db-grid-directive-line-metadata-assigned-single]
1 つの空白として読まれる（YAML が改行を畳む）: `comment-line`、`cr`、`crlf`、
`lf`。
[fixture: kanban/db-grid-comment-line-metadata-assigned-single]
[fixture: kanban/db-grid-cr-metadata-assigned-single]
[fixture: kanban/db-grid-crlf-metadata-assigned-single]
[fixture: kanban/db-grid-lf-metadata-assigned-single]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-assigned-single]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-assigned-single]
[fixture: kanban/gram-grid-quote-metadata-assigned-single]
データブロックの YAML が拒否する: `ff`、`html-attribute`、`single-quote`、
`vt`。
[fixture: kanban/gram-grid-ff-metadata-assigned-single]
[fixture: kanban/gram-grid-html-attribute-metadata-assigned-single]
[fixture: kanban/gram-grid-single-quote-metadata-assigned-single]
[fixture: kanban/gram-grid-vt-metadata-assigned-single]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-assigned-single]
[fixture: kanban/db-grid-arrow-metadata-assigned-single]
[fixture: kanban/db-grid-arrow-spaced-metadata-assigned-single]
[fixture: kanban/db-grid-backslash-metadata-assigned-single]
[fixture: kanban/db-grid-backtick-metadata-assigned-single]
[fixture: kanban/db-grid-bom-metadata-assigned-single]
[fixture: kanban/db-grid-close-round-metadata-assigned-single]
[fixture: kanban/db-grid-close-square-metadata-assigned-single]
[fixture: kanban/db-grid-colon-metadata-assigned-single]
[fixture: kanban/db-grid-comma-metadata-assigned-single]
[fixture: kanban/db-grid-comment-metadata-assigned-single]
[fixture: kanban/db-grid-constructor-metadata-assigned-single]
[fixture: kanban/db-grid-dash-metadata-assigned-single]
[fixture: kanban/db-grid-digits-metadata-assigned-single]
[fixture: kanban/db-grid-emoji-metadata-assigned-single]
[fixture: kanban/db-grid-empty-metadata-assigned-single]
[fixture: kanban/db-grid-equals-metadata-assigned-single]
[fixture: kanban/db-grid-greater-than-metadata-assigned-single]
[fixture: kanban/db-grid-hash-metadata-assigned-single]
[fixture: kanban/db-grid-html-metadata-assigned-single]
[fixture: kanban/db-grid-html-br-metadata-assigned-single]
[fixture: kanban/db-grid-ideographic-metadata-assigned-single]
[fixture: kanban/db-grid-keyword-metadata-assigned-single]
[fixture: kanban/db-grid-keyword-block-metadata-assigned-single]
[fixture: kanban/db-grid-keyword-class-metadata-assigned-single]
[fixture: kanban/db-grid-keyword-classdef-metadata-assigned-single]
[fixture: kanban/db-grid-keyword-columns-metadata-assigned-single]
[fixture: kanban/db-grid-keyword-end-metadata-assigned-single]
[fixture: kanban/db-grid-keyword-header-metadata-assigned-single]
[fixture: kanban/db-grid-keyword-space-metadata-assigned-single]
[fixture: kanban/db-grid-keyword-style-metadata-assigned-single]
[fixture: kanban/db-grid-less-than-metadata-assigned-single]
[fixture: kanban/db-grid-ls-metadata-assigned-single]
[fixture: kanban/db-grid-nbsp-metadata-assigned-single]
[fixture: kanban/db-grid-nel-metadata-assigned-single]
[fixture: kanban/db-grid-nonascii-metadata-assigned-single]
[fixture: kanban/db-grid-open-brace-metadata-assigned-single]
[fixture: kanban/db-grid-open-round-metadata-assigned-single]
[fixture: kanban/db-grid-open-square-metadata-assigned-single]
[fixture: kanban/db-grid-percent-metadata-assigned-single]
[fixture: kanban/db-grid-pipe-metadata-assigned-single]
[fixture: kanban/db-grid-proto-metadata-assigned-single]
[fixture: kanban/db-grid-ps-metadata-assigned-single]
[fixture: kanban/db-grid-root-metadata-assigned-single]
[fixture: kanban/db-grid-semicolon-metadata-assigned-single]
[fixture: kanban/db-grid-spaces-metadata-assigned-single]
[fixture: kanban/db-grid-tab-metadata-assigned-single]

`metadata-assigned-quoted` は項目のデータブロックの `assigned` の
値（二重引用符）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-metadata-assigned-quoted]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-assigned-quoted]
[fixture: kanban/db-grid-entity-named-metadata-assigned-quoted]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-assigned-quoted]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-assigned-quoted]
[fixture: kanban/db-grid-style-rule-metadata-assigned-quoted]
`<br/>` として読まれる: `comment-line`、`cr`、`crlf`、`directive-line`、`lf`。
[fixture: kanban/db-grid-comment-line-metadata-assigned-quoted]
[fixture: kanban/db-grid-cr-metadata-assigned-quoted]
[fixture: kanban/db-grid-crlf-metadata-assigned-quoted]
[fixture: kanban/db-grid-directive-line-metadata-assigned-quoted]
[fixture: kanban/db-grid-lf-metadata-assigned-quoted]
バックスペースとして読まれる（YAML のエスケープ `\b`）: `backslash`。
[fixture: kanban/db-grid-backslash-metadata-assigned-quoted]
文法が拒否する: `quote`。
[fixture: kanban/gram-grid-quote-metadata-assigned-quoted]
データブロックの YAML が拒否する: `ff`、`vt`。
[fixture: kanban/gram-grid-ff-metadata-assigned-quoted]
[fixture: kanban/gram-grid-vt-metadata-assigned-quoted]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-assigned-quoted]
[fixture: kanban/db-grid-arrow-metadata-assigned-quoted]
[fixture: kanban/db-grid-arrow-spaced-metadata-assigned-quoted]
[fixture: kanban/db-grid-backtick-metadata-assigned-quoted]
[fixture: kanban/db-grid-bom-metadata-assigned-quoted]
[fixture: kanban/db-grid-close-brace-metadata-assigned-quoted]
[fixture: kanban/db-grid-close-round-metadata-assigned-quoted]
[fixture: kanban/db-grid-close-square-metadata-assigned-quoted]
[fixture: kanban/db-grid-colon-metadata-assigned-quoted]
[fixture: kanban/db-grid-comma-metadata-assigned-quoted]
[fixture: kanban/db-grid-comment-metadata-assigned-quoted]
[fixture: kanban/db-grid-constructor-metadata-assigned-quoted]
[fixture: kanban/db-grid-dash-metadata-assigned-quoted]
[fixture: kanban/db-grid-digits-metadata-assigned-quoted]
[fixture: kanban/db-grid-emoji-metadata-assigned-quoted]
[fixture: kanban/db-grid-empty-metadata-assigned-quoted]
[fixture: kanban/db-grid-equals-metadata-assigned-quoted]
[fixture: kanban/db-grid-greater-than-metadata-assigned-quoted]
[fixture: kanban/db-grid-hash-metadata-assigned-quoted]
[fixture: kanban/db-grid-html-metadata-assigned-quoted]
[fixture: kanban/db-grid-html-br-metadata-assigned-quoted]
[fixture: kanban/db-grid-ideographic-metadata-assigned-quoted]
[fixture: kanban/db-grid-keyword-metadata-assigned-quoted]
[fixture: kanban/db-grid-keyword-block-metadata-assigned-quoted]
[fixture: kanban/db-grid-keyword-class-metadata-assigned-quoted]
[fixture: kanban/db-grid-keyword-classdef-metadata-assigned-quoted]
[fixture: kanban/db-grid-keyword-columns-metadata-assigned-quoted]
[fixture: kanban/db-grid-keyword-end-metadata-assigned-quoted]
[fixture: kanban/db-grid-keyword-header-metadata-assigned-quoted]
[fixture: kanban/db-grid-keyword-space-metadata-assigned-quoted]
[fixture: kanban/db-grid-keyword-style-metadata-assigned-quoted]
[fixture: kanban/db-grid-less-than-metadata-assigned-quoted]
[fixture: kanban/db-grid-ls-metadata-assigned-quoted]
[fixture: kanban/db-grid-nbsp-metadata-assigned-quoted]
[fixture: kanban/db-grid-nel-metadata-assigned-quoted]
[fixture: kanban/db-grid-nonascii-metadata-assigned-quoted]
[fixture: kanban/db-grid-open-brace-metadata-assigned-quoted]
[fixture: kanban/db-grid-open-round-metadata-assigned-quoted]
[fixture: kanban/db-grid-open-square-metadata-assigned-quoted]
[fixture: kanban/db-grid-percent-metadata-assigned-quoted]
[fixture: kanban/db-grid-pipe-metadata-assigned-quoted]
[fixture: kanban/db-grid-proto-metadata-assigned-quoted]
[fixture: kanban/db-grid-ps-metadata-assigned-quoted]
[fixture: kanban/db-grid-punct-metadata-assigned-quoted]
[fixture: kanban/db-grid-root-metadata-assigned-quoted]
[fixture: kanban/db-grid-semicolon-metadata-assigned-quoted]
[fixture: kanban/db-grid-single-quote-metadata-assigned-quoted]
[fixture: kanban/db-grid-spaces-metadata-assigned-quoted]
[fixture: kanban/db-grid-tab-metadata-assigned-quoted]

`metadata-ticket-bare` は項目のデータブロックの `ticket` の値（引用符なし）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-metadata-ticket-bare]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-ticket-bare]
[fixture: kanban/db-grid-entity-named-metadata-ticket-bare]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-ticket-bare]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-ticket-bare]
[fixture: kanban/db-grid-style-rule-metadata-ticket-bare]
そこで値が終わり、`a` になる: `comma`。
[fixture: kanban/db-grid-comma-metadata-ticket-bare]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-ticket-bare]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-ticket-bare]
[fixture: kanban/gram-grid-quote-metadata-ticket-bare]
データブロックの YAML が拒否する: `close-square`、`comment-line`、`cr`、
`crlf`、`directive-line`、`ff`、`lf`、`open-brace`、`open-square`、`vt`。
[fixture: kanban/gram-grid-close-square-metadata-ticket-bare]
[fixture: kanban/gram-grid-comment-line-metadata-ticket-bare]
[fixture: kanban/gram-grid-cr-metadata-ticket-bare]
[fixture: kanban/gram-grid-crlf-metadata-ticket-bare]
[fixture: kanban/gram-grid-directive-line-metadata-ticket-bare]
[fixture: kanban/gram-grid-ff-metadata-ticket-bare]
[fixture: kanban/gram-grid-lf-metadata-ticket-bare]
[fixture: kanban/gram-grid-open-brace-metadata-ticket-bare]
[fixture: kanban/gram-grid-open-square-metadata-ticket-bare]
[fixture: kanban/gram-grid-vt-metadata-ticket-bare]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-ticket-bare]
[fixture: kanban/db-grid-arrow-metadata-ticket-bare]
[fixture: kanban/db-grid-arrow-spaced-metadata-ticket-bare]
[fixture: kanban/db-grid-backslash-metadata-ticket-bare]
[fixture: kanban/db-grid-backtick-metadata-ticket-bare]
[fixture: kanban/db-grid-bom-metadata-ticket-bare]
[fixture: kanban/db-grid-close-round-metadata-ticket-bare]
[fixture: kanban/db-grid-colon-metadata-ticket-bare]
[fixture: kanban/db-grid-comment-metadata-ticket-bare]
[fixture: kanban/db-grid-constructor-metadata-ticket-bare]
[fixture: kanban/db-grid-dash-metadata-ticket-bare]
[fixture: kanban/db-grid-digits-metadata-ticket-bare]
[fixture: kanban/db-grid-emoji-metadata-ticket-bare]
[fixture: kanban/db-grid-empty-metadata-ticket-bare]
[fixture: kanban/db-grid-equals-metadata-ticket-bare]
[fixture: kanban/db-grid-greater-than-metadata-ticket-bare]
[fixture: kanban/db-grid-hash-metadata-ticket-bare]
[fixture: kanban/db-grid-html-metadata-ticket-bare]
[fixture: kanban/db-grid-html-br-metadata-ticket-bare]
[fixture: kanban/db-grid-ideographic-metadata-ticket-bare]
[fixture: kanban/db-grid-keyword-metadata-ticket-bare]
[fixture: kanban/db-grid-keyword-block-metadata-ticket-bare]
[fixture: kanban/db-grid-keyword-class-metadata-ticket-bare]
[fixture: kanban/db-grid-keyword-classdef-metadata-ticket-bare]
[fixture: kanban/db-grid-keyword-columns-metadata-ticket-bare]
[fixture: kanban/db-grid-keyword-end-metadata-ticket-bare]
[fixture: kanban/db-grid-keyword-header-metadata-ticket-bare]
[fixture: kanban/db-grid-keyword-space-metadata-ticket-bare]
[fixture: kanban/db-grid-keyword-style-metadata-ticket-bare]
[fixture: kanban/db-grid-less-than-metadata-ticket-bare]
[fixture: kanban/db-grid-ls-metadata-ticket-bare]
[fixture: kanban/db-grid-nbsp-metadata-ticket-bare]
[fixture: kanban/db-grid-nel-metadata-ticket-bare]
[fixture: kanban/db-grid-nonascii-metadata-ticket-bare]
[fixture: kanban/db-grid-open-round-metadata-ticket-bare]
[fixture: kanban/db-grid-percent-metadata-ticket-bare]
[fixture: kanban/db-grid-pipe-metadata-ticket-bare]
[fixture: kanban/db-grid-proto-metadata-ticket-bare]
[fixture: kanban/db-grid-ps-metadata-ticket-bare]
[fixture: kanban/db-grid-root-metadata-ticket-bare]
[fixture: kanban/db-grid-semicolon-metadata-ticket-bare]
[fixture: kanban/db-grid-single-quote-metadata-ticket-bare]
[fixture: kanban/db-grid-spaces-metadata-ticket-bare]
[fixture: kanban/db-grid-tab-metadata-ticket-bare]

`metadata-ticket-single` は項目のデータブロックの `ticket` の
値（一重引用符）。
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-ticket-single]
[fixture: kanban/db-grid-entity-named-metadata-ticket-single]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-ticket-single]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-ticket-single]
[fixture: kanban/db-grid-style-rule-metadata-ticket-single]
1 つの改行として読まれる: `directive-line`。
[fixture: kanban/db-grid-directive-line-metadata-ticket-single]
1 つの空白として読まれる（YAML が改行を畳む）: `comment-line`、`cr`、`crlf`、
`lf`。
[fixture: kanban/db-grid-comment-line-metadata-ticket-single]
[fixture: kanban/db-grid-cr-metadata-ticket-single]
[fixture: kanban/db-grid-crlf-metadata-ticket-single]
[fixture: kanban/db-grid-lf-metadata-ticket-single]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-ticket-single]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-ticket-single]
[fixture: kanban/gram-grid-quote-metadata-ticket-single]
データブロックの YAML が拒否する: `ff`、`html-attribute`、`single-quote`、
`vt`。
[fixture: kanban/gram-grid-ff-metadata-ticket-single]
[fixture: kanban/gram-grid-html-attribute-metadata-ticket-single]
[fixture: kanban/gram-grid-single-quote-metadata-ticket-single]
[fixture: kanban/gram-grid-vt-metadata-ticket-single]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-ticket-single]
[fixture: kanban/db-grid-arrow-metadata-ticket-single]
[fixture: kanban/db-grid-arrow-spaced-metadata-ticket-single]
[fixture: kanban/db-grid-backslash-metadata-ticket-single]
[fixture: kanban/db-grid-backtick-metadata-ticket-single]
[fixture: kanban/db-grid-bom-metadata-ticket-single]
[fixture: kanban/db-grid-close-round-metadata-ticket-single]
[fixture: kanban/db-grid-close-square-metadata-ticket-single]
[fixture: kanban/db-grid-colon-metadata-ticket-single]
[fixture: kanban/db-grid-comma-metadata-ticket-single]
[fixture: kanban/db-grid-comment-metadata-ticket-single]
[fixture: kanban/db-grid-constructor-metadata-ticket-single]
[fixture: kanban/db-grid-dash-metadata-ticket-single]
[fixture: kanban/db-grid-digits-metadata-ticket-single]
[fixture: kanban/db-grid-emoji-metadata-ticket-single]
[fixture: kanban/db-grid-empty-metadata-ticket-single]
[fixture: kanban/db-grid-equals-metadata-ticket-single]
[fixture: kanban/db-grid-greater-than-metadata-ticket-single]
[fixture: kanban/db-grid-hash-metadata-ticket-single]
[fixture: kanban/db-grid-html-metadata-ticket-single]
[fixture: kanban/db-grid-html-br-metadata-ticket-single]
[fixture: kanban/db-grid-ideographic-metadata-ticket-single]
[fixture: kanban/db-grid-keyword-metadata-ticket-single]
[fixture: kanban/db-grid-keyword-block-metadata-ticket-single]
[fixture: kanban/db-grid-keyword-class-metadata-ticket-single]
[fixture: kanban/db-grid-keyword-classdef-metadata-ticket-single]
[fixture: kanban/db-grid-keyword-columns-metadata-ticket-single]
[fixture: kanban/db-grid-keyword-end-metadata-ticket-single]
[fixture: kanban/db-grid-keyword-header-metadata-ticket-single]
[fixture: kanban/db-grid-keyword-space-metadata-ticket-single]
[fixture: kanban/db-grid-keyword-style-metadata-ticket-single]
[fixture: kanban/db-grid-less-than-metadata-ticket-single]
[fixture: kanban/db-grid-ls-metadata-ticket-single]
[fixture: kanban/db-grid-nbsp-metadata-ticket-single]
[fixture: kanban/db-grid-nel-metadata-ticket-single]
[fixture: kanban/db-grid-nonascii-metadata-ticket-single]
[fixture: kanban/db-grid-open-brace-metadata-ticket-single]
[fixture: kanban/db-grid-open-round-metadata-ticket-single]
[fixture: kanban/db-grid-open-square-metadata-ticket-single]
[fixture: kanban/db-grid-percent-metadata-ticket-single]
[fixture: kanban/db-grid-pipe-metadata-ticket-single]
[fixture: kanban/db-grid-proto-metadata-ticket-single]
[fixture: kanban/db-grid-ps-metadata-ticket-single]
[fixture: kanban/db-grid-root-metadata-ticket-single]
[fixture: kanban/db-grid-semicolon-metadata-ticket-single]
[fixture: kanban/db-grid-spaces-metadata-ticket-single]
[fixture: kanban/db-grid-tab-metadata-ticket-single]

`metadata-ticket-quoted` は項目のデータブロックの `ticket` の
値（二重引用符）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-metadata-ticket-quoted]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-ticket-quoted]
[fixture: kanban/db-grid-entity-named-metadata-ticket-quoted]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-ticket-quoted]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-ticket-quoted]
[fixture: kanban/db-grid-style-rule-metadata-ticket-quoted]
`<br/>` として読まれる: `comment-line`、`cr`、`crlf`、`directive-line`、`lf`。
[fixture: kanban/db-grid-comment-line-metadata-ticket-quoted]
[fixture: kanban/db-grid-cr-metadata-ticket-quoted]
[fixture: kanban/db-grid-crlf-metadata-ticket-quoted]
[fixture: kanban/db-grid-directive-line-metadata-ticket-quoted]
[fixture: kanban/db-grid-lf-metadata-ticket-quoted]
バックスペースとして読まれる（YAML のエスケープ `\b`）: `backslash`。
[fixture: kanban/db-grid-backslash-metadata-ticket-quoted]
文法が拒否する: `quote`。
[fixture: kanban/gram-grid-quote-metadata-ticket-quoted]
データブロックの YAML が拒否する: `ff`、`vt`。
[fixture: kanban/gram-grid-ff-metadata-ticket-quoted]
[fixture: kanban/gram-grid-vt-metadata-ticket-quoted]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-ticket-quoted]
[fixture: kanban/db-grid-arrow-metadata-ticket-quoted]
[fixture: kanban/db-grid-arrow-spaced-metadata-ticket-quoted]
[fixture: kanban/db-grid-backtick-metadata-ticket-quoted]
[fixture: kanban/db-grid-bom-metadata-ticket-quoted]
[fixture: kanban/db-grid-close-brace-metadata-ticket-quoted]
[fixture: kanban/db-grid-close-round-metadata-ticket-quoted]
[fixture: kanban/db-grid-close-square-metadata-ticket-quoted]
[fixture: kanban/db-grid-colon-metadata-ticket-quoted]
[fixture: kanban/db-grid-comma-metadata-ticket-quoted]
[fixture: kanban/db-grid-comment-metadata-ticket-quoted]
[fixture: kanban/db-grid-constructor-metadata-ticket-quoted]
[fixture: kanban/db-grid-dash-metadata-ticket-quoted]
[fixture: kanban/db-grid-digits-metadata-ticket-quoted]
[fixture: kanban/db-grid-emoji-metadata-ticket-quoted]
[fixture: kanban/db-grid-empty-metadata-ticket-quoted]
[fixture: kanban/db-grid-equals-metadata-ticket-quoted]
[fixture: kanban/db-grid-greater-than-metadata-ticket-quoted]
[fixture: kanban/db-grid-hash-metadata-ticket-quoted]
[fixture: kanban/db-grid-html-metadata-ticket-quoted]
[fixture: kanban/db-grid-html-br-metadata-ticket-quoted]
[fixture: kanban/db-grid-ideographic-metadata-ticket-quoted]
[fixture: kanban/db-grid-keyword-metadata-ticket-quoted]
[fixture: kanban/db-grid-keyword-block-metadata-ticket-quoted]
[fixture: kanban/db-grid-keyword-class-metadata-ticket-quoted]
[fixture: kanban/db-grid-keyword-classdef-metadata-ticket-quoted]
[fixture: kanban/db-grid-keyword-columns-metadata-ticket-quoted]
[fixture: kanban/db-grid-keyword-end-metadata-ticket-quoted]
[fixture: kanban/db-grid-keyword-header-metadata-ticket-quoted]
[fixture: kanban/db-grid-keyword-space-metadata-ticket-quoted]
[fixture: kanban/db-grid-keyword-style-metadata-ticket-quoted]
[fixture: kanban/db-grid-less-than-metadata-ticket-quoted]
[fixture: kanban/db-grid-ls-metadata-ticket-quoted]
[fixture: kanban/db-grid-nbsp-metadata-ticket-quoted]
[fixture: kanban/db-grid-nel-metadata-ticket-quoted]
[fixture: kanban/db-grid-nonascii-metadata-ticket-quoted]
[fixture: kanban/db-grid-open-brace-metadata-ticket-quoted]
[fixture: kanban/db-grid-open-round-metadata-ticket-quoted]
[fixture: kanban/db-grid-open-square-metadata-ticket-quoted]
[fixture: kanban/db-grid-percent-metadata-ticket-quoted]
[fixture: kanban/db-grid-pipe-metadata-ticket-quoted]
[fixture: kanban/db-grid-proto-metadata-ticket-quoted]
[fixture: kanban/db-grid-ps-metadata-ticket-quoted]
[fixture: kanban/db-grid-punct-metadata-ticket-quoted]
[fixture: kanban/db-grid-root-metadata-ticket-quoted]
[fixture: kanban/db-grid-semicolon-metadata-ticket-quoted]
[fixture: kanban/db-grid-single-quote-metadata-ticket-quoted]
[fixture: kanban/db-grid-spaces-metadata-ticket-quoted]
[fixture: kanban/db-grid-tab-metadata-ticket-quoted]

`metadata-priority-bare` は項目のデータブロックの `priority` の
値（引用符なし）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-metadata-priority-bare]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-priority-bare]
[fixture: kanban/db-grid-entity-named-metadata-priority-bare]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-priority-bare]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-priority-bare]
[fixture: kanban/db-grid-style-rule-metadata-priority-bare]
そこで値が終わり、`a` になる: `comma`。
[fixture: kanban/db-grid-comma-metadata-priority-bare]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-priority-bare]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-priority-bare]
[fixture: kanban/gram-grid-quote-metadata-priority-bare]
データブロックの YAML が拒否する: `close-square`、`comment-line`、`cr`、
`crlf`、`directive-line`、`ff`、`lf`、`open-brace`、`open-square`、`vt`。
[fixture: kanban/gram-grid-close-square-metadata-priority-bare]
[fixture: kanban/gram-grid-comment-line-metadata-priority-bare]
[fixture: kanban/gram-grid-cr-metadata-priority-bare]
[fixture: kanban/gram-grid-crlf-metadata-priority-bare]
[fixture: kanban/gram-grid-directive-line-metadata-priority-bare]
[fixture: kanban/gram-grid-ff-metadata-priority-bare]
[fixture: kanban/gram-grid-lf-metadata-priority-bare]
[fixture: kanban/gram-grid-open-brace-metadata-priority-bare]
[fixture: kanban/gram-grid-open-square-metadata-priority-bare]
[fixture: kanban/gram-grid-vt-metadata-priority-bare]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-priority-bare]
[fixture: kanban/db-grid-arrow-metadata-priority-bare]
[fixture: kanban/db-grid-arrow-spaced-metadata-priority-bare]
[fixture: kanban/db-grid-backslash-metadata-priority-bare]
[fixture: kanban/db-grid-backtick-metadata-priority-bare]
[fixture: kanban/db-grid-bom-metadata-priority-bare]
[fixture: kanban/db-grid-close-round-metadata-priority-bare]
[fixture: kanban/db-grid-colon-metadata-priority-bare]
[fixture: kanban/db-grid-comment-metadata-priority-bare]
[fixture: kanban/db-grid-constructor-metadata-priority-bare]
[fixture: kanban/db-grid-dash-metadata-priority-bare]
[fixture: kanban/db-grid-digits-metadata-priority-bare]
[fixture: kanban/db-grid-emoji-metadata-priority-bare]
[fixture: kanban/db-grid-empty-metadata-priority-bare]
[fixture: kanban/db-grid-equals-metadata-priority-bare]
[fixture: kanban/db-grid-greater-than-metadata-priority-bare]
[fixture: kanban/db-grid-hash-metadata-priority-bare]
[fixture: kanban/db-grid-html-metadata-priority-bare]
[fixture: kanban/db-grid-html-br-metadata-priority-bare]
[fixture: kanban/db-grid-ideographic-metadata-priority-bare]
[fixture: kanban/db-grid-keyword-metadata-priority-bare]
[fixture: kanban/db-grid-keyword-block-metadata-priority-bare]
[fixture: kanban/db-grid-keyword-class-metadata-priority-bare]
[fixture: kanban/db-grid-keyword-classdef-metadata-priority-bare]
[fixture: kanban/db-grid-keyword-columns-metadata-priority-bare]
[fixture: kanban/db-grid-keyword-end-metadata-priority-bare]
[fixture: kanban/db-grid-keyword-header-metadata-priority-bare]
[fixture: kanban/db-grid-keyword-space-metadata-priority-bare]
[fixture: kanban/db-grid-keyword-style-metadata-priority-bare]
[fixture: kanban/db-grid-less-than-metadata-priority-bare]
[fixture: kanban/db-grid-ls-metadata-priority-bare]
[fixture: kanban/db-grid-nbsp-metadata-priority-bare]
[fixture: kanban/db-grid-nel-metadata-priority-bare]
[fixture: kanban/db-grid-nonascii-metadata-priority-bare]
[fixture: kanban/db-grid-open-round-metadata-priority-bare]
[fixture: kanban/db-grid-percent-metadata-priority-bare]
[fixture: kanban/db-grid-pipe-metadata-priority-bare]
[fixture: kanban/db-grid-proto-metadata-priority-bare]
[fixture: kanban/db-grid-ps-metadata-priority-bare]
[fixture: kanban/db-grid-root-metadata-priority-bare]
[fixture: kanban/db-grid-semicolon-metadata-priority-bare]
[fixture: kanban/db-grid-single-quote-metadata-priority-bare]
[fixture: kanban/db-grid-spaces-metadata-priority-bare]
[fixture: kanban/db-grid-tab-metadata-priority-bare]

`metadata-priority-single` は項目のデータブロックの `priority` の
値（一重引用符）。
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-priority-single]
[fixture: kanban/db-grid-entity-named-metadata-priority-single]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-priority-single]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-priority-single]
[fixture: kanban/db-grid-style-rule-metadata-priority-single]
1 つの改行として読まれる: `directive-line`。
[fixture: kanban/db-grid-directive-line-metadata-priority-single]
1 つの空白として読まれる（YAML が改行を畳む）: `comment-line`、`cr`、`crlf`、
`lf`。
[fixture: kanban/db-grid-comment-line-metadata-priority-single]
[fixture: kanban/db-grid-cr-metadata-priority-single]
[fixture: kanban/db-grid-crlf-metadata-priority-single]
[fixture: kanban/db-grid-lf-metadata-priority-single]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-priority-single]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-priority-single]
[fixture: kanban/gram-grid-quote-metadata-priority-single]
データブロックの YAML が拒否する: `ff`、`html-attribute`、`single-quote`、
`vt`。
[fixture: kanban/gram-grid-ff-metadata-priority-single]
[fixture: kanban/gram-grid-html-attribute-metadata-priority-single]
[fixture: kanban/gram-grid-single-quote-metadata-priority-single]
[fixture: kanban/gram-grid-vt-metadata-priority-single]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-priority-single]
[fixture: kanban/db-grid-arrow-metadata-priority-single]
[fixture: kanban/db-grid-arrow-spaced-metadata-priority-single]
[fixture: kanban/db-grid-backslash-metadata-priority-single]
[fixture: kanban/db-grid-backtick-metadata-priority-single]
[fixture: kanban/db-grid-bom-metadata-priority-single]
[fixture: kanban/db-grid-close-round-metadata-priority-single]
[fixture: kanban/db-grid-close-square-metadata-priority-single]
[fixture: kanban/db-grid-colon-metadata-priority-single]
[fixture: kanban/db-grid-comma-metadata-priority-single]
[fixture: kanban/db-grid-comment-metadata-priority-single]
[fixture: kanban/db-grid-constructor-metadata-priority-single]
[fixture: kanban/db-grid-dash-metadata-priority-single]
[fixture: kanban/db-grid-digits-metadata-priority-single]
[fixture: kanban/db-grid-emoji-metadata-priority-single]
[fixture: kanban/db-grid-empty-metadata-priority-single]
[fixture: kanban/db-grid-equals-metadata-priority-single]
[fixture: kanban/db-grid-greater-than-metadata-priority-single]
[fixture: kanban/db-grid-hash-metadata-priority-single]
[fixture: kanban/db-grid-html-metadata-priority-single]
[fixture: kanban/db-grid-html-br-metadata-priority-single]
[fixture: kanban/db-grid-ideographic-metadata-priority-single]
[fixture: kanban/db-grid-keyword-metadata-priority-single]
[fixture: kanban/db-grid-keyword-block-metadata-priority-single]
[fixture: kanban/db-grid-keyword-class-metadata-priority-single]
[fixture: kanban/db-grid-keyword-classdef-metadata-priority-single]
[fixture: kanban/db-grid-keyword-columns-metadata-priority-single]
[fixture: kanban/db-grid-keyword-end-metadata-priority-single]
[fixture: kanban/db-grid-keyword-header-metadata-priority-single]
[fixture: kanban/db-grid-keyword-space-metadata-priority-single]
[fixture: kanban/db-grid-keyword-style-metadata-priority-single]
[fixture: kanban/db-grid-less-than-metadata-priority-single]
[fixture: kanban/db-grid-ls-metadata-priority-single]
[fixture: kanban/db-grid-nbsp-metadata-priority-single]
[fixture: kanban/db-grid-nel-metadata-priority-single]
[fixture: kanban/db-grid-nonascii-metadata-priority-single]
[fixture: kanban/db-grid-open-brace-metadata-priority-single]
[fixture: kanban/db-grid-open-round-metadata-priority-single]
[fixture: kanban/db-grid-open-square-metadata-priority-single]
[fixture: kanban/db-grid-percent-metadata-priority-single]
[fixture: kanban/db-grid-pipe-metadata-priority-single]
[fixture: kanban/db-grid-proto-metadata-priority-single]
[fixture: kanban/db-grid-ps-metadata-priority-single]
[fixture: kanban/db-grid-root-metadata-priority-single]
[fixture: kanban/db-grid-semicolon-metadata-priority-single]
[fixture: kanban/db-grid-spaces-metadata-priority-single]
[fixture: kanban/db-grid-tab-metadata-priority-single]

`metadata-priority-quoted` は項目のデータブロックの `priority` の
値（二重引用符）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-metadata-priority-quoted]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-priority-quoted]
[fixture: kanban/db-grid-entity-named-metadata-priority-quoted]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-priority-quoted]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-priority-quoted]
[fixture: kanban/db-grid-style-rule-metadata-priority-quoted]
`<br/>` として読まれる: `comment-line`、`cr`、`crlf`、`directive-line`、`lf`。
[fixture: kanban/db-grid-comment-line-metadata-priority-quoted]
[fixture: kanban/db-grid-cr-metadata-priority-quoted]
[fixture: kanban/db-grid-crlf-metadata-priority-quoted]
[fixture: kanban/db-grid-directive-line-metadata-priority-quoted]
[fixture: kanban/db-grid-lf-metadata-priority-quoted]
バックスペースとして読まれる（YAML のエスケープ `\b`）: `backslash`。
[fixture: kanban/db-grid-backslash-metadata-priority-quoted]
文法が拒否する: `quote`。
[fixture: kanban/gram-grid-quote-metadata-priority-quoted]
データブロックの YAML が拒否する: `ff`、`vt`。
[fixture: kanban/gram-grid-ff-metadata-priority-quoted]
[fixture: kanban/gram-grid-vt-metadata-priority-quoted]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-priority-quoted]
[fixture: kanban/db-grid-arrow-metadata-priority-quoted]
[fixture: kanban/db-grid-arrow-spaced-metadata-priority-quoted]
[fixture: kanban/db-grid-backtick-metadata-priority-quoted]
[fixture: kanban/db-grid-bom-metadata-priority-quoted]
[fixture: kanban/db-grid-close-brace-metadata-priority-quoted]
[fixture: kanban/db-grid-close-round-metadata-priority-quoted]
[fixture: kanban/db-grid-close-square-metadata-priority-quoted]
[fixture: kanban/db-grid-colon-metadata-priority-quoted]
[fixture: kanban/db-grid-comma-metadata-priority-quoted]
[fixture: kanban/db-grid-comment-metadata-priority-quoted]
[fixture: kanban/db-grid-constructor-metadata-priority-quoted]
[fixture: kanban/db-grid-dash-metadata-priority-quoted]
[fixture: kanban/db-grid-digits-metadata-priority-quoted]
[fixture: kanban/db-grid-emoji-metadata-priority-quoted]
[fixture: kanban/db-grid-empty-metadata-priority-quoted]
[fixture: kanban/db-grid-equals-metadata-priority-quoted]
[fixture: kanban/db-grid-greater-than-metadata-priority-quoted]
[fixture: kanban/db-grid-hash-metadata-priority-quoted]
[fixture: kanban/db-grid-html-metadata-priority-quoted]
[fixture: kanban/db-grid-html-br-metadata-priority-quoted]
[fixture: kanban/db-grid-ideographic-metadata-priority-quoted]
[fixture: kanban/db-grid-keyword-metadata-priority-quoted]
[fixture: kanban/db-grid-keyword-block-metadata-priority-quoted]
[fixture: kanban/db-grid-keyword-class-metadata-priority-quoted]
[fixture: kanban/db-grid-keyword-classdef-metadata-priority-quoted]
[fixture: kanban/db-grid-keyword-columns-metadata-priority-quoted]
[fixture: kanban/db-grid-keyword-end-metadata-priority-quoted]
[fixture: kanban/db-grid-keyword-header-metadata-priority-quoted]
[fixture: kanban/db-grid-keyword-space-metadata-priority-quoted]
[fixture: kanban/db-grid-keyword-style-metadata-priority-quoted]
[fixture: kanban/db-grid-less-than-metadata-priority-quoted]
[fixture: kanban/db-grid-ls-metadata-priority-quoted]
[fixture: kanban/db-grid-nbsp-metadata-priority-quoted]
[fixture: kanban/db-grid-nel-metadata-priority-quoted]
[fixture: kanban/db-grid-nonascii-metadata-priority-quoted]
[fixture: kanban/db-grid-open-brace-metadata-priority-quoted]
[fixture: kanban/db-grid-open-round-metadata-priority-quoted]
[fixture: kanban/db-grid-open-square-metadata-priority-quoted]
[fixture: kanban/db-grid-percent-metadata-priority-quoted]
[fixture: kanban/db-grid-pipe-metadata-priority-quoted]
[fixture: kanban/db-grid-proto-metadata-priority-quoted]
[fixture: kanban/db-grid-ps-metadata-priority-quoted]
[fixture: kanban/db-grid-punct-metadata-priority-quoted]
[fixture: kanban/db-grid-root-metadata-priority-quoted]
[fixture: kanban/db-grid-semicolon-metadata-priority-quoted]
[fixture: kanban/db-grid-single-quote-metadata-priority-quoted]
[fixture: kanban/db-grid-spaces-metadata-priority-quoted]
[fixture: kanban/db-grid-tab-metadata-priority-quoted]

`metadata-icon-bare` は項目のデータブロックの `icon` の値（引用符なし）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-metadata-icon-bare]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-icon-bare]
[fixture: kanban/db-grid-entity-named-metadata-icon-bare]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-icon-bare]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-icon-bare]
[fixture: kanban/db-grid-style-rule-metadata-icon-bare]
そこで値が終わり、`a` になる: `comma`。
[fixture: kanban/db-grid-comma-metadata-icon-bare]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-icon-bare]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-icon-bare]
[fixture: kanban/gram-grid-quote-metadata-icon-bare]
データブロックの YAML が拒否する: `close-square`、`comment-line`、`cr`、
`crlf`、`directive-line`、`ff`、`lf`、`open-brace`、`open-square`、`vt`。
[fixture: kanban/gram-grid-close-square-metadata-icon-bare]
[fixture: kanban/gram-grid-comment-line-metadata-icon-bare]
[fixture: kanban/gram-grid-cr-metadata-icon-bare]
[fixture: kanban/gram-grid-crlf-metadata-icon-bare]
[fixture: kanban/gram-grid-directive-line-metadata-icon-bare]
[fixture: kanban/gram-grid-ff-metadata-icon-bare]
[fixture: kanban/gram-grid-lf-metadata-icon-bare]
[fixture: kanban/gram-grid-open-brace-metadata-icon-bare]
[fixture: kanban/gram-grid-open-square-metadata-icon-bare]
[fixture: kanban/gram-grid-vt-metadata-icon-bare]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-icon-bare]
[fixture: kanban/db-grid-arrow-metadata-icon-bare]
[fixture: kanban/db-grid-arrow-spaced-metadata-icon-bare]
[fixture: kanban/db-grid-backslash-metadata-icon-bare]
[fixture: kanban/db-grid-backtick-metadata-icon-bare]
[fixture: kanban/db-grid-bom-metadata-icon-bare]
[fixture: kanban/db-grid-close-round-metadata-icon-bare]
[fixture: kanban/db-grid-colon-metadata-icon-bare]
[fixture: kanban/db-grid-comment-metadata-icon-bare]
[fixture: kanban/db-grid-constructor-metadata-icon-bare]
[fixture: kanban/db-grid-dash-metadata-icon-bare]
[fixture: kanban/db-grid-digits-metadata-icon-bare]
[fixture: kanban/db-grid-emoji-metadata-icon-bare]
[fixture: kanban/db-grid-empty-metadata-icon-bare]
[fixture: kanban/db-grid-equals-metadata-icon-bare]
[fixture: kanban/db-grid-greater-than-metadata-icon-bare]
[fixture: kanban/db-grid-hash-metadata-icon-bare]
[fixture: kanban/db-grid-html-metadata-icon-bare]
[fixture: kanban/db-grid-html-br-metadata-icon-bare]
[fixture: kanban/db-grid-ideographic-metadata-icon-bare]
[fixture: kanban/db-grid-keyword-metadata-icon-bare]
[fixture: kanban/db-grid-keyword-block-metadata-icon-bare]
[fixture: kanban/db-grid-keyword-class-metadata-icon-bare]
[fixture: kanban/db-grid-keyword-classdef-metadata-icon-bare]
[fixture: kanban/db-grid-keyword-columns-metadata-icon-bare]
[fixture: kanban/db-grid-keyword-end-metadata-icon-bare]
[fixture: kanban/db-grid-keyword-header-metadata-icon-bare]
[fixture: kanban/db-grid-keyword-space-metadata-icon-bare]
[fixture: kanban/db-grid-keyword-style-metadata-icon-bare]
[fixture: kanban/db-grid-less-than-metadata-icon-bare]
[fixture: kanban/db-grid-ls-metadata-icon-bare]
[fixture: kanban/db-grid-nbsp-metadata-icon-bare]
[fixture: kanban/db-grid-nel-metadata-icon-bare]
[fixture: kanban/db-grid-nonascii-metadata-icon-bare]
[fixture: kanban/db-grid-open-round-metadata-icon-bare]
[fixture: kanban/db-grid-percent-metadata-icon-bare]
[fixture: kanban/db-grid-pipe-metadata-icon-bare]
[fixture: kanban/db-grid-proto-metadata-icon-bare]
[fixture: kanban/db-grid-ps-metadata-icon-bare]
[fixture: kanban/db-grid-root-metadata-icon-bare]
[fixture: kanban/db-grid-semicolon-metadata-icon-bare]
[fixture: kanban/db-grid-single-quote-metadata-icon-bare]
[fixture: kanban/db-grid-spaces-metadata-icon-bare]
[fixture: kanban/db-grid-tab-metadata-icon-bare]

`metadata-icon-single` は項目のデータブロックの `icon` の値（一重引用符）。
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-icon-single]
[fixture: kanban/db-grid-entity-named-metadata-icon-single]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-icon-single]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-icon-single]
[fixture: kanban/db-grid-style-rule-metadata-icon-single]
1 つの改行として読まれる: `directive-line`。
[fixture: kanban/db-grid-directive-line-metadata-icon-single]
1 つの空白として読まれる（YAML が改行を畳む）: `comment-line`、`cr`、`crlf`、
`lf`。
[fixture: kanban/db-grid-comment-line-metadata-icon-single]
[fixture: kanban/db-grid-cr-metadata-icon-single]
[fixture: kanban/db-grid-crlf-metadata-icon-single]
[fixture: kanban/db-grid-lf-metadata-icon-single]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-icon-single]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-icon-single]
[fixture: kanban/gram-grid-quote-metadata-icon-single]
データブロックの YAML が拒否する: `ff`、`html-attribute`、`single-quote`、
`vt`。
[fixture: kanban/gram-grid-ff-metadata-icon-single]
[fixture: kanban/gram-grid-html-attribute-metadata-icon-single]
[fixture: kanban/gram-grid-single-quote-metadata-icon-single]
[fixture: kanban/gram-grid-vt-metadata-icon-single]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-icon-single]
[fixture: kanban/db-grid-arrow-metadata-icon-single]
[fixture: kanban/db-grid-arrow-spaced-metadata-icon-single]
[fixture: kanban/db-grid-backslash-metadata-icon-single]
[fixture: kanban/db-grid-backtick-metadata-icon-single]
[fixture: kanban/db-grid-bom-metadata-icon-single]
[fixture: kanban/db-grid-close-round-metadata-icon-single]
[fixture: kanban/db-grid-close-square-metadata-icon-single]
[fixture: kanban/db-grid-colon-metadata-icon-single]
[fixture: kanban/db-grid-comma-metadata-icon-single]
[fixture: kanban/db-grid-comment-metadata-icon-single]
[fixture: kanban/db-grid-constructor-metadata-icon-single]
[fixture: kanban/db-grid-dash-metadata-icon-single]
[fixture: kanban/db-grid-digits-metadata-icon-single]
[fixture: kanban/db-grid-emoji-metadata-icon-single]
[fixture: kanban/db-grid-empty-metadata-icon-single]
[fixture: kanban/db-grid-equals-metadata-icon-single]
[fixture: kanban/db-grid-greater-than-metadata-icon-single]
[fixture: kanban/db-grid-hash-metadata-icon-single]
[fixture: kanban/db-grid-html-metadata-icon-single]
[fixture: kanban/db-grid-html-br-metadata-icon-single]
[fixture: kanban/db-grid-ideographic-metadata-icon-single]
[fixture: kanban/db-grid-keyword-metadata-icon-single]
[fixture: kanban/db-grid-keyword-block-metadata-icon-single]
[fixture: kanban/db-grid-keyword-class-metadata-icon-single]
[fixture: kanban/db-grid-keyword-classdef-metadata-icon-single]
[fixture: kanban/db-grid-keyword-columns-metadata-icon-single]
[fixture: kanban/db-grid-keyword-end-metadata-icon-single]
[fixture: kanban/db-grid-keyword-header-metadata-icon-single]
[fixture: kanban/db-grid-keyword-space-metadata-icon-single]
[fixture: kanban/db-grid-keyword-style-metadata-icon-single]
[fixture: kanban/db-grid-less-than-metadata-icon-single]
[fixture: kanban/db-grid-ls-metadata-icon-single]
[fixture: kanban/db-grid-nbsp-metadata-icon-single]
[fixture: kanban/db-grid-nel-metadata-icon-single]
[fixture: kanban/db-grid-nonascii-metadata-icon-single]
[fixture: kanban/db-grid-open-brace-metadata-icon-single]
[fixture: kanban/db-grid-open-round-metadata-icon-single]
[fixture: kanban/db-grid-open-square-metadata-icon-single]
[fixture: kanban/db-grid-percent-metadata-icon-single]
[fixture: kanban/db-grid-pipe-metadata-icon-single]
[fixture: kanban/db-grid-proto-metadata-icon-single]
[fixture: kanban/db-grid-ps-metadata-icon-single]
[fixture: kanban/db-grid-root-metadata-icon-single]
[fixture: kanban/db-grid-semicolon-metadata-icon-single]
[fixture: kanban/db-grid-spaces-metadata-icon-single]
[fixture: kanban/db-grid-tab-metadata-icon-single]

`metadata-icon-quoted` は項目のデータブロックの `icon` の値（二重引用符）。
HTML 属性の二重引用符が一重引用符として読まれる: `html-attribute`。
[fixture: kanban/db-grid-html-attribute-metadata-icon-quoted]
実体参照の代用文字として読まれる（common.md の Entities）: `entity`、
`entity-named`。
[fixture: kanban/db-grid-entity-metadata-icon-quoted]
[fixture: kanban/db-grid-entity-named-metadata-icon-quoted]
ディレクティブとして取り除かれる: `directive`。
[fixture: kanban/db-grid-directive-metadata-icon-quoted]
最初の `;` が行の規則で落ちる: `classdef-rule`、`style-rule`。
[fixture: kanban/db-grid-classdef-rule-metadata-icon-quoted]
[fixture: kanban/db-grid-style-rule-metadata-icon-quoted]
`<br/>` として読まれる: `comment-line`、`cr`、`crlf`、`directive-line`、`lf`。
[fixture: kanban/db-grid-comment-line-metadata-icon-quoted]
[fixture: kanban/db-grid-cr-metadata-icon-quoted]
[fixture: kanban/db-grid-crlf-metadata-icon-quoted]
[fixture: kanban/db-grid-directive-line-metadata-icon-quoted]
[fixture: kanban/db-grid-lf-metadata-icon-quoted]
バックスペースとして読まれる（YAML のエスケープ `\b`）: `backslash`。
[fixture: kanban/db-grid-backslash-metadata-icon-quoted]
文法が拒否する: `quote`。
[fixture: kanban/gram-grid-quote-metadata-icon-quoted]
データブロックの YAML が拒否する: `ff`、`vt`。
[fixture: kanban/gram-grid-ff-metadata-icon-quoted]
[fixture: kanban/gram-grid-vt-metadata-icon-quoted]
そのまま保たれる: 他の種類。
[fixture: kanban/db-grid-ampersand-entity-metadata-icon-quoted]
[fixture: kanban/db-grid-arrow-metadata-icon-quoted]
[fixture: kanban/db-grid-arrow-spaced-metadata-icon-quoted]
[fixture: kanban/db-grid-backtick-metadata-icon-quoted]
[fixture: kanban/db-grid-bom-metadata-icon-quoted]
[fixture: kanban/db-grid-close-brace-metadata-icon-quoted]
[fixture: kanban/db-grid-close-round-metadata-icon-quoted]
[fixture: kanban/db-grid-close-square-metadata-icon-quoted]
[fixture: kanban/db-grid-colon-metadata-icon-quoted]
[fixture: kanban/db-grid-comma-metadata-icon-quoted]
[fixture: kanban/db-grid-comment-metadata-icon-quoted]
[fixture: kanban/db-grid-constructor-metadata-icon-quoted]
[fixture: kanban/db-grid-dash-metadata-icon-quoted]
[fixture: kanban/db-grid-digits-metadata-icon-quoted]
[fixture: kanban/db-grid-emoji-metadata-icon-quoted]
[fixture: kanban/db-grid-empty-metadata-icon-quoted]
[fixture: kanban/db-grid-equals-metadata-icon-quoted]
[fixture: kanban/db-grid-greater-than-metadata-icon-quoted]
[fixture: kanban/db-grid-hash-metadata-icon-quoted]
[fixture: kanban/db-grid-html-metadata-icon-quoted]
[fixture: kanban/db-grid-html-br-metadata-icon-quoted]
[fixture: kanban/db-grid-ideographic-metadata-icon-quoted]
[fixture: kanban/db-grid-keyword-metadata-icon-quoted]
[fixture: kanban/db-grid-keyword-block-metadata-icon-quoted]
[fixture: kanban/db-grid-keyword-class-metadata-icon-quoted]
[fixture: kanban/db-grid-keyword-classdef-metadata-icon-quoted]
[fixture: kanban/db-grid-keyword-columns-metadata-icon-quoted]
[fixture: kanban/db-grid-keyword-end-metadata-icon-quoted]
[fixture: kanban/db-grid-keyword-header-metadata-icon-quoted]
[fixture: kanban/db-grid-keyword-space-metadata-icon-quoted]
[fixture: kanban/db-grid-keyword-style-metadata-icon-quoted]
[fixture: kanban/db-grid-less-than-metadata-icon-quoted]
[fixture: kanban/db-grid-ls-metadata-icon-quoted]
[fixture: kanban/db-grid-nbsp-metadata-icon-quoted]
[fixture: kanban/db-grid-nel-metadata-icon-quoted]
[fixture: kanban/db-grid-nonascii-metadata-icon-quoted]
[fixture: kanban/db-grid-open-brace-metadata-icon-quoted]
[fixture: kanban/db-grid-open-round-metadata-icon-quoted]
[fixture: kanban/db-grid-open-square-metadata-icon-quoted]
[fixture: kanban/db-grid-percent-metadata-icon-quoted]
[fixture: kanban/db-grid-pipe-metadata-icon-quoted]
[fixture: kanban/db-grid-proto-metadata-icon-quoted]
[fixture: kanban/db-grid-ps-metadata-icon-quoted]
[fixture: kanban/db-grid-punct-metadata-icon-quoted]
[fixture: kanban/db-grid-root-metadata-icon-quoted]
[fixture: kanban/db-grid-semicolon-metadata-icon-quoted]
[fixture: kanban/db-grid-single-quote-metadata-icon-quoted]
[fixture: kanban/db-grid-spaces-metadata-icon-quoted]
[fixture: kanban/db-grid-tab-metadata-icon-quoted]

`metadata-shape-bare` は項目のデータブロックの `shape` の値（引用符なし）。
読まれるが、要約は変わらない: `ampersand-entity`、`arrow`、`arrow-spaced`、
`backslash`、`backtick`、`bom`、`close-round`、`colon`、`comma`、`comment`、
`constructor`、`dash`、`digits`、`directive`、`emoji`、`empty`、`entity`、
`entity-named`、`equals`、`greater-than`、`hash`、`html`、`html-attribute`、
`html-br`、`ideographic`、`keyword`、`keyword-block`、`keyword-columns`、
`keyword-end`、`keyword-header`、`keyword-space`、`less-than`、`ls`、`nbsp`、
`nel`、`nonascii`、`open-round`、`percent`、`pipe`、`ps`、`root`、
`semicolon`、`single-quote`、`spaces`、`style-rule`、`tab`。
[fixture: kanban/db-grid-ampersand-entity-metadata-shape-bare]
[fixture: kanban/db-grid-arrow-metadata-shape-bare]
[fixture: kanban/db-grid-arrow-spaced-metadata-shape-bare]
[fixture: kanban/db-grid-backslash-metadata-shape-bare]
[fixture: kanban/db-grid-backtick-metadata-shape-bare]
[fixture: kanban/db-grid-bom-metadata-shape-bare]
[fixture: kanban/db-grid-close-round-metadata-shape-bare]
[fixture: kanban/db-grid-colon-metadata-shape-bare]
[fixture: kanban/db-grid-comma-metadata-shape-bare]
[fixture: kanban/db-grid-comment-metadata-shape-bare]
[fixture: kanban/db-grid-constructor-metadata-shape-bare]
[fixture: kanban/db-grid-dash-metadata-shape-bare]
[fixture: kanban/db-grid-digits-metadata-shape-bare]
[fixture: kanban/db-grid-directive-metadata-shape-bare]
[fixture: kanban/db-grid-emoji-metadata-shape-bare]
[fixture: kanban/db-grid-empty-metadata-shape-bare]
[fixture: kanban/db-grid-entity-metadata-shape-bare]
[fixture: kanban/db-grid-entity-named-metadata-shape-bare]
[fixture: kanban/db-grid-equals-metadata-shape-bare]
[fixture: kanban/db-grid-greater-than-metadata-shape-bare]
[fixture: kanban/db-grid-hash-metadata-shape-bare]
[fixture: kanban/db-grid-html-metadata-shape-bare]
[fixture: kanban/db-grid-html-attribute-metadata-shape-bare]
[fixture: kanban/db-grid-html-br-metadata-shape-bare]
[fixture: kanban/db-grid-ideographic-metadata-shape-bare]
[fixture: kanban/db-grid-keyword-metadata-shape-bare]
[fixture: kanban/db-grid-keyword-block-metadata-shape-bare]
[fixture: kanban/db-grid-keyword-columns-metadata-shape-bare]
[fixture: kanban/db-grid-keyword-end-metadata-shape-bare]
[fixture: kanban/db-grid-keyword-header-metadata-shape-bare]
[fixture: kanban/db-grid-keyword-space-metadata-shape-bare]
[fixture: kanban/db-grid-less-than-metadata-shape-bare]
[fixture: kanban/db-grid-ls-metadata-shape-bare]
[fixture: kanban/db-grid-nbsp-metadata-shape-bare]
[fixture: kanban/db-grid-nel-metadata-shape-bare]
[fixture: kanban/db-grid-nonascii-metadata-shape-bare]
[fixture: kanban/db-grid-open-round-metadata-shape-bare]
[fixture: kanban/db-grid-percent-metadata-shape-bare]
[fixture: kanban/db-grid-pipe-metadata-shape-bare]
[fixture: kanban/db-grid-ps-metadata-shape-bare]
[fixture: kanban/db-grid-root-metadata-shape-bare]
[fixture: kanban/db-grid-semicolon-metadata-shape-bare]
[fixture: kanban/db-grid-single-quote-metadata-shape-bare]
[fixture: kanban/db-grid-spaces-metadata-shape-bare]
[fixture: kanban/db-grid-style-rule-metadata-shape-bare]
[fixture: kanban/db-grid-tab-metadata-shape-bare]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-shape-bare]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-shape-bare]
[fixture: kanban/gram-grid-quote-metadata-shape-bare]
データブロックの YAML が拒否する: `close-square`、`comment-line`、`cr`、
`crlf`、`directive-line`、`ff`、`lf`、`open-brace`、`open-square`、`vt`。
[fixture: kanban/gram-grid-close-square-metadata-shape-bare]
[fixture: kanban/gram-grid-comment-line-metadata-shape-bare]
[fixture: kanban/gram-grid-cr-metadata-shape-bare]
[fixture: kanban/gram-grid-crlf-metadata-shape-bare]
[fixture: kanban/gram-grid-directive-line-metadata-shape-bare]
[fixture: kanban/gram-grid-ff-metadata-shape-bare]
[fixture: kanban/gram-grid-lf-metadata-shape-bare]
[fixture: kanban/gram-grid-open-brace-metadata-shape-bare]
[fixture: kanban/gram-grid-open-square-metadata-shape-bare]
[fixture: kanban/gram-grid-vt-metadata-shape-bare]
Db が拒否する: shape 名に大文字か `_` が含まれる（`No such shape`）:
`classdef-rule`、`keyword-class`、`keyword-classdef`、`keyword-style`、
`proto`。
[fixture: kanban/gram-grid-classdef-rule-metadata-shape-bare]
[fixture: kanban/gram-grid-keyword-class-metadata-shape-bare]
[fixture: kanban/gram-grid-keyword-classdef-metadata-shape-bare]
[fixture: kanban/gram-grid-keyword-style-metadata-shape-bare]
[fixture: kanban/gram-grid-proto-metadata-shape-bare]

`metadata-shape-single` は項目のデータブロックの `shape` の値（一重引用符）。
読まれるが、要約は変わらない: `ampersand-entity`、`arrow`、`arrow-spaced`、
`backslash`、`backtick`、`bom`、`close-round`、`close-square`、`colon`、
`comma`、`comment`、`comment-line`、`constructor`、`cr`、`crlf`、`dash`、
`digits`、`directive`、`directive-line`、`emoji`、`empty`、`entity`、
`entity-named`、`equals`、`greater-than`、`hash`、`html`、`html-br`、
`ideographic`、`keyword`、`keyword-block`、`keyword-columns`、`keyword-end`、
`keyword-header`、`keyword-space`、`less-than`、`lf`、`ls`、`nbsp`、`nel`、
`nonascii`、`open-brace`、`open-round`、`open-square`、`percent`、`pipe`、
`ps`、`root`、`semicolon`、`spaces`、`style-rule`、`tab`。
[fixture: kanban/db-grid-ampersand-entity-metadata-shape-single]
[fixture: kanban/db-grid-arrow-metadata-shape-single]
[fixture: kanban/db-grid-arrow-spaced-metadata-shape-single]
[fixture: kanban/db-grid-backslash-metadata-shape-single]
[fixture: kanban/db-grid-backtick-metadata-shape-single]
[fixture: kanban/db-grid-bom-metadata-shape-single]
[fixture: kanban/db-grid-close-round-metadata-shape-single]
[fixture: kanban/db-grid-close-square-metadata-shape-single]
[fixture: kanban/db-grid-colon-metadata-shape-single]
[fixture: kanban/db-grid-comma-metadata-shape-single]
[fixture: kanban/db-grid-comment-metadata-shape-single]
[fixture: kanban/db-grid-comment-line-metadata-shape-single]
[fixture: kanban/db-grid-constructor-metadata-shape-single]
[fixture: kanban/db-grid-cr-metadata-shape-single]
[fixture: kanban/db-grid-crlf-metadata-shape-single]
[fixture: kanban/db-grid-dash-metadata-shape-single]
[fixture: kanban/db-grid-digits-metadata-shape-single]
[fixture: kanban/db-grid-directive-metadata-shape-single]
[fixture: kanban/db-grid-directive-line-metadata-shape-single]
[fixture: kanban/db-grid-emoji-metadata-shape-single]
[fixture: kanban/db-grid-empty-metadata-shape-single]
[fixture: kanban/db-grid-entity-metadata-shape-single]
[fixture: kanban/db-grid-entity-named-metadata-shape-single]
[fixture: kanban/db-grid-equals-metadata-shape-single]
[fixture: kanban/db-grid-greater-than-metadata-shape-single]
[fixture: kanban/db-grid-hash-metadata-shape-single]
[fixture: kanban/db-grid-html-metadata-shape-single]
[fixture: kanban/db-grid-html-br-metadata-shape-single]
[fixture: kanban/db-grid-ideographic-metadata-shape-single]
[fixture: kanban/db-grid-keyword-metadata-shape-single]
[fixture: kanban/db-grid-keyword-block-metadata-shape-single]
[fixture: kanban/db-grid-keyword-columns-metadata-shape-single]
[fixture: kanban/db-grid-keyword-end-metadata-shape-single]
[fixture: kanban/db-grid-keyword-header-metadata-shape-single]
[fixture: kanban/db-grid-keyword-space-metadata-shape-single]
[fixture: kanban/db-grid-less-than-metadata-shape-single]
[fixture: kanban/db-grid-lf-metadata-shape-single]
[fixture: kanban/db-grid-ls-metadata-shape-single]
[fixture: kanban/db-grid-nbsp-metadata-shape-single]
[fixture: kanban/db-grid-nel-metadata-shape-single]
[fixture: kanban/db-grid-nonascii-metadata-shape-single]
[fixture: kanban/db-grid-open-brace-metadata-shape-single]
[fixture: kanban/db-grid-open-round-metadata-shape-single]
[fixture: kanban/db-grid-open-square-metadata-shape-single]
[fixture: kanban/db-grid-percent-metadata-shape-single]
[fixture: kanban/db-grid-pipe-metadata-shape-single]
[fixture: kanban/db-grid-ps-metadata-shape-single]
[fixture: kanban/db-grid-root-metadata-shape-single]
[fixture: kanban/db-grid-semicolon-metadata-shape-single]
[fixture: kanban/db-grid-spaces-metadata-shape-single]
[fixture: kanban/db-grid-style-rule-metadata-shape-single]
[fixture: kanban/db-grid-tab-metadata-shape-single]
字句解析器が拒否する: `punct`。
[fixture: kanban/gram-grid-punct-metadata-shape-single]
文法が拒否する: `close-brace`、`quote`。
[fixture: kanban/gram-grid-close-brace-metadata-shape-single]
[fixture: kanban/gram-grid-quote-metadata-shape-single]
データブロックの YAML が拒否する: `ff`、`html-attribute`、`single-quote`、
`vt`。
[fixture: kanban/gram-grid-ff-metadata-shape-single]
[fixture: kanban/gram-grid-html-attribute-metadata-shape-single]
[fixture: kanban/gram-grid-single-quote-metadata-shape-single]
[fixture: kanban/gram-grid-vt-metadata-shape-single]
Db が拒否する: shape 名に大文字か `_` が含まれる（`No such shape`）:
`classdef-rule`、`keyword-class`、`keyword-classdef`、`keyword-style`、
`proto`。
[fixture: kanban/gram-grid-classdef-rule-metadata-shape-single]
[fixture: kanban/gram-grid-keyword-class-metadata-shape-single]
[fixture: kanban/gram-grid-keyword-classdef-metadata-shape-single]
[fixture: kanban/gram-grid-keyword-style-metadata-shape-single]
[fixture: kanban/gram-grid-proto-metadata-shape-single]

`metadata-shape-quoted` は項目のデータブロックの `shape` の値（二重引用符）。
読まれるが、要約は変わらない: `ampersand-entity`、`arrow`、`arrow-spaced`、
`backslash`、`backtick`、`bom`、`close-brace`、`close-round`、`close-square`、
`colon`、`comma`、`comment`、`comment-line`、`constructor`、`cr`、`crlf`、
`dash`、`digits`、`directive`、`directive-line`、`emoji`、`empty`、`entity`、
`entity-named`、`equals`、`greater-than`、`hash`、`html`、`html-attribute`、
`html-br`、`ideographic`、`keyword`、`keyword-block`、`keyword-columns`、
`keyword-end`、`keyword-header`、`keyword-space`、`less-than`、`lf`、`ls`、
`nbsp`、`nel`、`nonascii`、`open-brace`、`open-round`、`open-square`、
`percent`、`pipe`、`ps`、`root`、`semicolon`、`single-quote`、`spaces`、
`style-rule`、`tab`。
[fixture: kanban/db-grid-ampersand-entity-metadata-shape-quoted]
[fixture: kanban/db-grid-arrow-metadata-shape-quoted]
[fixture: kanban/db-grid-arrow-spaced-metadata-shape-quoted]
[fixture: kanban/db-grid-backslash-metadata-shape-quoted]
[fixture: kanban/db-grid-backtick-metadata-shape-quoted]
[fixture: kanban/db-grid-bom-metadata-shape-quoted]
[fixture: kanban/db-grid-close-brace-metadata-shape-quoted]
[fixture: kanban/db-grid-close-round-metadata-shape-quoted]
[fixture: kanban/db-grid-close-square-metadata-shape-quoted]
[fixture: kanban/db-grid-colon-metadata-shape-quoted]
[fixture: kanban/db-grid-comma-metadata-shape-quoted]
[fixture: kanban/db-grid-comment-metadata-shape-quoted]
[fixture: kanban/db-grid-comment-line-metadata-shape-quoted]
[fixture: kanban/db-grid-constructor-metadata-shape-quoted]
[fixture: kanban/db-grid-cr-metadata-shape-quoted]
[fixture: kanban/db-grid-crlf-metadata-shape-quoted]
[fixture: kanban/db-grid-dash-metadata-shape-quoted]
[fixture: kanban/db-grid-digits-metadata-shape-quoted]
[fixture: kanban/db-grid-directive-metadata-shape-quoted]
[fixture: kanban/db-grid-directive-line-metadata-shape-quoted]
[fixture: kanban/db-grid-emoji-metadata-shape-quoted]
[fixture: kanban/db-grid-empty-metadata-shape-quoted]
[fixture: kanban/db-grid-entity-metadata-shape-quoted]
[fixture: kanban/db-grid-entity-named-metadata-shape-quoted]
[fixture: kanban/db-grid-equals-metadata-shape-quoted]
[fixture: kanban/db-grid-greater-than-metadata-shape-quoted]
[fixture: kanban/db-grid-hash-metadata-shape-quoted]
[fixture: kanban/db-grid-html-metadata-shape-quoted]
[fixture: kanban/db-grid-html-attribute-metadata-shape-quoted]
[fixture: kanban/db-grid-html-br-metadata-shape-quoted]
[fixture: kanban/db-grid-ideographic-metadata-shape-quoted]
[fixture: kanban/db-grid-keyword-metadata-shape-quoted]
[fixture: kanban/db-grid-keyword-block-metadata-shape-quoted]
[fixture: kanban/db-grid-keyword-columns-metadata-shape-quoted]
[fixture: kanban/db-grid-keyword-end-metadata-shape-quoted]
[fixture: kanban/db-grid-keyword-header-metadata-shape-quoted]
[fixture: kanban/db-grid-keyword-space-metadata-shape-quoted]
[fixture: kanban/db-grid-less-than-metadata-shape-quoted]
[fixture: kanban/db-grid-lf-metadata-shape-quoted]
[fixture: kanban/db-grid-ls-metadata-shape-quoted]
[fixture: kanban/db-grid-nbsp-metadata-shape-quoted]
[fixture: kanban/db-grid-nel-metadata-shape-quoted]
[fixture: kanban/db-grid-nonascii-metadata-shape-quoted]
[fixture: kanban/db-grid-open-brace-metadata-shape-quoted]
[fixture: kanban/db-grid-open-round-metadata-shape-quoted]
[fixture: kanban/db-grid-open-square-metadata-shape-quoted]
[fixture: kanban/db-grid-percent-metadata-shape-quoted]
[fixture: kanban/db-grid-pipe-metadata-shape-quoted]
[fixture: kanban/db-grid-ps-metadata-shape-quoted]
[fixture: kanban/db-grid-root-metadata-shape-quoted]
[fixture: kanban/db-grid-semicolon-metadata-shape-quoted]
[fixture: kanban/db-grid-single-quote-metadata-shape-quoted]
[fixture: kanban/db-grid-spaces-metadata-shape-quoted]
[fixture: kanban/db-grid-style-rule-metadata-shape-quoted]
[fixture: kanban/db-grid-tab-metadata-shape-quoted]
文法が拒否する: `quote`。
[fixture: kanban/gram-grid-quote-metadata-shape-quoted]
データブロックの YAML が拒否する: `ff`、`vt`。
[fixture: kanban/gram-grid-ff-metadata-shape-quoted]
[fixture: kanban/gram-grid-vt-metadata-shape-quoted]
Db が拒否する: shape 名に大文字か `_` が含まれる（`No such shape`）:
`classdef-rule`、`keyword-class`、`keyword-classdef`、`keyword-style`、
`proto`、`punct`。
[fixture: kanban/gram-grid-classdef-rule-metadata-shape-quoted]
[fixture: kanban/gram-grid-keyword-class-metadata-shape-quoted]
[fixture: kanban/gram-grid-keyword-classdef-metadata-shape-quoted]
[fixture: kanban/gram-grid-keyword-style-metadata-shape-quoted]
[fixture: kanban/gram-grid-proto-metadata-shape-quoted]
[fixture: kanban/gram-grid-punct-metadata-shape-quoted]

データブロックの値は YAML として読む。以下の文は、キー `label`、`assigned`、
`ticket`、`priority`、`icon`、`shape` が、値の種類ごとに何を読むかを示す。

プレーン、一重引用符、二重引用符の YAML テキストの値は、`label`、
`assigned`、`ticket`、`icon`、`priority` にそのテキストを設定し、`label` は
書かれたラベルを置き換える。
[fixture: kanban/db-metadata-label-plain]
[fixture: kanban/db-metadata-assigned-plain]
[fixture: kanban/db-metadata-ticket-plain]
[fixture: kanban/db-metadata-icon-plain]
[fixture: kanban/db-metadata-priority-plain]
[fixture: kanban/db-metadata-label-single-quoted]
[fixture: kanban/db-metadata-assigned-single-quoted]
[fixture: kanban/db-metadata-ticket-single-quoted]
[fixture: kanban/db-metadata-icon-single-quoted]
[fixture: kanban/db-metadata-priority-single-quoted]
[fixture: kanban/db-metadata-label-double-quoted]
[fixture: kanban/db-metadata-assigned-double-quoted]
[fixture: kanban/db-metadata-ticket-double-quoted]
[fixture: kanban/db-metadata-icon-double-quoted]
[fixture: kanban/db-metadata-priority-double-quoted]
空白だけの引用符付きの値は、そのまま値になる。
[fixture: kanban/db-metadata-label-spaces]
[fixture: kanban/db-metadata-assigned-spaces]
[fixture: kanban/db-metadata-ticket-spaces]
[fixture: kanban/db-metadata-icon-spaces]
[fixture: kanban/db-metadata-priority-spaces]
空の値、空文字列、`null`、`false`、`0`、`-0` は何も設定せず、`label` は
書かれたラベルのままで、ほかの欄は現れない。
[fixture: kanban/db-metadata-label-empty]
[fixture: kanban/db-metadata-assigned-empty]
[fixture: kanban/db-metadata-ticket-empty]
[fixture: kanban/db-metadata-icon-empty]
[fixture: kanban/db-metadata-priority-empty]
[fixture: kanban/db-metadata-label-empty-string]
[fixture: kanban/db-metadata-assigned-empty-string]
[fixture: kanban/db-metadata-ticket-empty-string]
[fixture: kanban/db-metadata-icon-empty-string]
[fixture: kanban/db-metadata-priority-empty-string]
[fixture: kanban/db-metadata-label-null]
[fixture: kanban/db-metadata-assigned-null]
[fixture: kanban/db-metadata-ticket-null]
[fixture: kanban/db-metadata-icon-null]
[fixture: kanban/db-metadata-priority-null]
[fixture: kanban/db-metadata-label-false]
[fixture: kanban/db-metadata-assigned-false]
[fixture: kanban/db-metadata-ticket-false]
[fixture: kanban/db-metadata-icon-false]
[fixture: kanban/db-metadata-priority-false]
[fixture: kanban/db-metadata-label-zero]
[fixture: kanban/db-metadata-assigned-zero]
[fixture: kanban/db-metadata-ticket-zero]
[fixture: kanban/db-metadata-icon-zero]
[fixture: kanban/db-metadata-priority-zero]
[fixture: kanban/db-metadata-label-negative-zero]
[fixture: kanban/db-metadata-assigned-negative-zero]
[fixture: kanban/db-metadata-ticket-negative-zero]
[fixture: kanban/db-metadata-icon-negative-zero]
[fixture: kanban/db-metadata-priority-negative-zero]
数、負の数、符号付きの数は、`label`、`assigned`、`ticket`、`icon` ではその
テキスト（`23`、`-2`、`2`）として読まれ、`priority` は数を保つ。`true` は
テキスト `true` として読まれ、`priority` は真偽値を保つ。
[fixture: kanban/db-metadata-label-number]
[fixture: kanban/db-metadata-assigned-number]
[fixture: kanban/db-metadata-ticket-number]
[fixture: kanban/db-metadata-icon-number]
[fixture: kanban/db-metadata-priority-number]
[fixture: kanban/db-metadata-label-negative]
[fixture: kanban/db-metadata-assigned-negative]
[fixture: kanban/db-metadata-ticket-negative]
[fixture: kanban/db-metadata-icon-negative]
[fixture: kanban/db-metadata-priority-negative]
[fixture: kanban/db-metadata-label-plus]
[fixture: kanban/db-metadata-assigned-plus]
[fixture: kanban/db-metadata-ticket-plus]
[fixture: kanban/db-metadata-icon-plus]
[fixture: kanban/db-metadata-priority-plus]
[fixture: kanban/db-metadata-label-true]
[fixture: kanban/db-metadata-assigned-true]
[fixture: kanban/db-metadata-ticket-true]
[fixture: kanban/db-metadata-icon-true]
[fixture: kanban/db-metadata-priority-true]
接尾辞のある数（`12px`）と語 `Infinity`、`NaN` は、どの欄でもテキストになる。
[fixture: kanban/db-metadata-label-number-suffix]
[fixture: kanban/db-metadata-assigned-number-suffix]
[fixture: kanban/db-metadata-ticket-number-suffix]
[fixture: kanban/db-metadata-icon-number-suffix]
[fixture: kanban/db-metadata-priority-number-suffix]
[fixture: kanban/db-metadata-label-infinity-word]
[fixture: kanban/db-metadata-assigned-infinity-word]
[fixture: kanban/db-metadata-ticket-infinity-word]
[fixture: kanban/db-metadata-icon-infinity-word]
[fixture: kanban/db-metadata-priority-infinity-word]
[fixture: kanban/db-metadata-label-nan-word]
[fixture: kanban/db-metadata-assigned-nan-word]
[fixture: kanban/db-metadata-ticket-nan-word]
[fixture: kanban/db-metadata-icon-nan-word]
[fixture: kanban/db-metadata-priority-nan-word]
リスト `[a, b]` は、`label`、`assigned`、`ticket`、`icon` では
コンマでつながれ（`a,b`）、`priority` はリストを保つ。
[fixture: kanban/db-metadata-label-list]
[fixture: kanban/db-metadata-assigned-list]
[fixture: kanban/db-metadata-ticket-list]
[fixture: kanban/db-metadata-icon-list]
[fixture: kanban/db-metadata-priority-list]
キーは大文字小文字を区別し、`ASSIGNED`、`ICON`、`LABEL`、`PRIORITY`、
`SHAPE`、`TICKET` は何も設定しない。
[fixture: kanban/db-metadata-label-upper-key]
[fixture: kanban/db-metadata-assigned-upper-key]
[fixture: kanban/db-metadata-ticket-upper-key]
[fixture: kanban/db-metadata-icon-upper-key]
[fixture: kanban/db-metadata-priority-upper-key]
[fixture: kanban/db-metadata-shape-upper-key]
`priority` の値 `.inf`、`-.inf`、`.nan` は、`.nan` は何も設定せず、ほかは
テキスト `Infinity` と `-Infinity` として読まれる。リストの中の同じ語も
テキストで、`1e400` はテキスト `1e400` になり、マッピングのキー
`__proto__` と `constructor` は自分自身のキーとして保たれる。
[fixture: kanban/db-metadata-priority-non-finite]
[fixture: kanban/db-metadata-priority-nested-non-finite]
[fixture: kanban/db-metadata-priority-overflow-word]
[fixture: kanban/db-metadata-priority-own-prototype-key]
キー `shape` は読まれず、空の値、接尾辞のある数、shape の名前を含むどの
値も、要約を変えない。
[fixture: kanban/db-metadata-shape-empty]
[fixture: kanban/db-metadata-shape-empty-string]
[fixture: kanban/db-metadata-shape-false]
[fixture: kanban/db-metadata-shape-known-other]
[fixture: kanban/db-metadata-shape-lower]
[fixture: kanban/db-metadata-shape-negative-zero]
[fixture: kanban/db-metadata-shape-null]
[fixture: kanban/db-metadata-shape-number-suffix]
[fixture: kanban/db-metadata-shape-spaces]
[fixture: kanban/db-metadata-shape-upper-key]
[fixture: kanban/db-metadata-shape-zero]

## c4

`normalizeC4()`（`src/normalizers/c4.ts`）は、
描画前の構文解析直後に共有 C4 Db を読み取る。
[fixture: c4/db-all-fields]

`type` は
[`getC4Type()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L76-L78)
の値を保持する。
[fixture: c4/db-all-fields]

`title` は
[`getTitle()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L722-L724)
の値を保持する。
[fixture: c4/db-all-fields]

`accTitle` は
[`getAccTitle()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L20-L20)
の値を保持する。
[fixture: c4/db-acc-title]

`accDescr` は
[`getAccDescription()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L26-L26)
の値を保持する。
[fixture: c4/db-all-fields]

`shapes`、`boundaries`、`rels` は、
[`getC4ShapeArray()`、`getBoundaries()`、`getRels()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L684-L720)
の完全な own 属性を最初の追加順に保持する。
[fixture: c4/db-shape-three-definitions] [fixture:
c4/db-boundary-three-definitions] [fixture: c4/db-rel-three-definitions]

図形は `alias`、`label`、`descr`、`techn`、`typeC4Shape`、
`parentBoundary`、`wrap`、`sprite`、`tags`、`link` と、
その他の代入済み属性を保持し、undefined のフィールドを省略する。
[fixture: c4/db-all-fields] [fixture: c4/db-named-text-fields] [fixture:
c4/db-style-layout-key-attributes]

境界は `alias`、`label`、`type`、`parentBoundary`、`wrap`、
`tags`、`link` とその他の代入済み属性を保持し、
配置ノードは `nodeType` と代入された説明も保持する。
[fixture: c4/db-all-fields] [fixture: c4/db-keyword-node-l] [fixture:
c4/db-keyword-node-r]

最初の境界は初期の `global` であり、
ラベルと型は `{ text: "global" }`、親は空文字列、
tags と link は null であり、宣言とスタイル更新がこの項目を更新できる。
[fixture: c4/db-number-layout-zero] [fixture: c4/gram-boundary-global-alias]

`parentBoundary` は宣言時の解析スタックが選んだ alias であり、
重複する alias、オブジェクトの alias、図形と共有する alias も保持し、
要約は階層を再構築しない。
[fixture: c4/gram-boundary-nested] [fixture: c4/db-boundary-alias-named-change]
[fixture: c4/gram-boundary-reused-alias] [fixture: c4/db-parent-c4container]
[fixture: c4/db-parent-c4context] [fixture: c4/db-parent-constructor] [fixture:
c4/db-parent-global] [fixture: c4/db-parent-hasownproperty] [fixture:
c4/db-parent-person] [fixture: c4/db-parent-proto] [fixture: c4/db-parent-title]
[fixture: c4/db-parent-tostring]
[fixture: c4/demo-c4context-1d531a27]
[fixture: c4/demo-c4context-3c40673b]
[fixture: c4/demo-c4context-49481a12]
[fixture: c4/demo-c4context-61e43307]
[fixture: c4/docs-syntax-c4-5f697bdc]
[fixture: c4/docs-syntax-c4-90f106b9]
[fixture: c4/docs-syntax-c4-f96d2403]

関係は `type`、`from`、`to`、`label`、`techn`、`descr`、
`wrap`、`sprite`、`tags`、`link`、代入されたスタイルとオフセット、
その他の代入済み属性を保持し、端点を解決しない。
[fixture: c4/db-all-fields] [fixture: c4/db-alias-constructor] [fixture:
c4/db-rel-named-endpoints] [fixture: c4/db-rel-self] [fixture:
c4/db-alias-c4container] [fixture: c4/db-alias-c4context] [fixture:
c4/db-alias-global] [fixture: c4/db-alias-hasownproperty] [fixture:
c4/db-alias-person] [fixture: c4/db-alias-proto] [fixture: c4/db-alias-title]
[fixture: c4/db-alias-tostring]

図形と境界の alias は厳密等価で比較し、関係は端点の順序付き対で比較し、
再定義は最初の一致を移動せずに更新し、
別々のオブジェクトの alias や端点は別項目となる。
[fixture: c4/db-shape-three-definitions] [fixture:
c4/db-boundary-three-definitions] [fixture: c4/db-rel-three-definitions]
[fixture: c4/db-required-named-alias-repeat] [fixture:
c4/db-rel-object-endpoint-repeat] [fixture: c4/db-shape-case-sensitive]

図形の再定義はラベル、図形種別、親、wrap を設定し直し、
省略された任意の技術、説明、その他の属性は以前の値を保持する。
[fixture: c4/db-shape-three-definitions]

境界の再定義はラベル、型、親、wrap を設定し直し、
省略された tags、link、配置ノードの説明は以前の値を保持する。
[fixture: c4/db-boundary-three-definitions]

関係の再定義は型、端点、ラベル、wrap を設定し直し、
省略された任意属性は以前の値を保持する。
[fixture: c4/db-rel-three-definitions]

文法は引用符付きも含めて位置引数と名前付きのキーと値の両端を削り、
内部の文字を保持し、空の位置文字列は空引数となり、
空の名前付き値は拒否される。
[fixture: c4/db-named-key-whitespace] [fixture: c4/db-required-label-empty]
[fixture: c4/db-required-alias-empty] [fixture: c4/gram-named-empty-value]
[fixture: c4/lex-empty-strings] [fixture: c4/lex-empty-comma] [fixture:
c4/lex-bare-whitespace-only] [fixture: c4/lex-named-whitespace-value]

必須位置の名前付き引数はオブジェクトの alias や端点、
ラベルの `text` 内のオブジェクトとなり、任意位置では名前のキーへ代入する。
[fixture: c4/db-named-person-unknown-slot-1] [fixture:
c4/db-named-person-unknown-slot-2] [fixture: c4/db-rel-named-endpoints]
[fixture: c4/db-named-repeat] [fixture: c4/db-named-boundary-link-slot-1]
[fixture: c4/db-named-boundary-link-slot-2] [fixture:
c4/db-named-boundary-sprite-slot-1] [fixture:
c4/db-named-boundary-sprite-slot-2] [fixture: c4/db-named-boundary-tags-slot-1]
[fixture: c4/db-named-boundary-tags-slot-2] [fixture:
c4/db-named-boundary-unknown-slot-1] [fixture:
c4/db-named-boundary-unknown-slot-2] [fixture:
c4/db-named-component-link-slot-1] [fixture: c4/db-named-component-link-slot-2]
[fixture: c4/db-named-component-sprite-slot-1] [fixture:
c4/db-named-component-sprite-slot-2] [fixture:
c4/db-named-component-tags-slot-1] [fixture: c4/db-named-component-tags-slot-2]
[fixture: c4/db-named-component-unknown-slot-1] [fixture:
c4/db-named-component-unknown-slot-2] [fixture:
c4/db-named-container-boundary-link-slot-1] [fixture:
c4/db-named-container-boundary-link-slot-2] [fixture:
c4/db-named-container-boundary-sprite-slot-1] [fixture:
c4/db-named-container-boundary-sprite-slot-2] [fixture:
c4/db-named-container-boundary-tags-slot-1] [fixture:
c4/db-named-container-boundary-tags-slot-2] [fixture:
c4/db-named-container-boundary-type-slot-1] [fixture:
c4/db-named-container-boundary-type-slot-2] [fixture:
c4/db-named-container-boundary-unknown-slot-1] [fixture:
c4/db-named-container-boundary-unknown-slot-2] [fixture:
c4/db-named-container-link-slot-1] [fixture: c4/db-named-container-link-slot-2]
[fixture: c4/db-named-container-sprite-slot-1] [fixture:
c4/db-named-container-sprite-slot-2] [fixture:
c4/db-named-container-tags-slot-1] [fixture: c4/db-named-container-tags-slot-2]
[fixture: c4/db-named-container-unknown-slot-1] [fixture:
c4/db-named-container-unknown-slot-2] [fixture:
c4/db-named-enterprise-boundary-link-slot-1] [fixture:
c4/db-named-enterprise-boundary-link-slot-2] [fixture:
c4/db-named-enterprise-boundary-sprite-slot-1] [fixture:
c4/db-named-enterprise-boundary-sprite-slot-2] [fixture:
c4/db-named-enterprise-boundary-tags-slot-1] [fixture:
c4/db-named-enterprise-boundary-tags-slot-2] [fixture:
c4/db-named-enterprise-boundary-type-slot-1] [fixture:
c4/db-named-enterprise-boundary-type-slot-2] [fixture:
c4/db-named-enterprise-boundary-unknown-slot-1] [fixture:
c4/db-named-enterprise-boundary-unknown-slot-2] [fixture:
c4/db-named-index-link-slot-2] [fixture: c4/db-named-index-link-slot-3]
[fixture: c4/db-named-index-link-slot-4] [fixture:
c4/db-named-index-sprite-slot-2] [fixture: c4/db-named-index-sprite-slot-3]
[fixture: c4/db-named-index-sprite-slot-4] [fixture:
c4/db-named-index-tags-slot-2] [fixture: c4/db-named-index-tags-slot-3]
[fixture: c4/db-named-index-tags-slot-4] [fixture:
c4/db-named-index-unknown-slot-2] [fixture: c4/db-named-index-unknown-slot-3]
[fixture: c4/db-named-index-unknown-slot-4] [fixture:
c4/db-named-node-link-slot-1] [fixture: c4/db-named-node-link-slot-2] [fixture:
c4/db-named-node-sprite-slot-1] [fixture: c4/db-named-node-sprite-slot-2]
[fixture: c4/db-named-node-tags-slot-1] [fixture: c4/db-named-node-tags-slot-2]
[fixture: c4/db-named-node-unknown-slot-1] [fixture:
c4/db-named-node-unknown-slot-2] [fixture: c4/db-named-person-link-slot-1]
[fixture: c4/db-named-person-link-slot-2] [fixture:
c4/db-named-person-sprite-slot-1] [fixture: c4/db-named-person-sprite-slot-2]
[fixture: c4/db-named-person-tags-slot-1] [fixture:
c4/db-named-person-tags-slot-2] [fixture: c4/db-named-rel-link-slot-1] [fixture:
c4/db-named-rel-link-slot-2] [fixture: c4/db-named-rel-link-slot-3] [fixture:
c4/db-named-rel-sprite-slot-1] [fixture: c4/db-named-rel-sprite-slot-2]
[fixture: c4/db-named-rel-sprite-slot-3] [fixture: c4/db-named-rel-tags-slot-1]
[fixture: c4/db-named-rel-tags-slot-2] [fixture: c4/db-named-rel-tags-slot-3]
[fixture: c4/db-named-rel-unknown-slot-1] [fixture:
c4/db-named-rel-unknown-slot-2] [fixture: c4/db-named-rel-unknown-slot-3]
[fixture: c4/db-named-system-boundary-link-slot-1] [fixture:
c4/db-named-system-boundary-link-slot-2] [fixture:
c4/db-named-system-boundary-sprite-slot-1] [fixture:
c4/db-named-system-boundary-sprite-slot-2] [fixture:
c4/db-named-system-boundary-tags-slot-1] [fixture:
c4/db-named-system-boundary-tags-slot-2] [fixture:
c4/db-named-system-boundary-type-slot-1] [fixture:
c4/db-named-system-boundary-type-slot-2] [fixture:
c4/db-named-system-boundary-unknown-slot-1] [fixture:
c4/db-named-system-boundary-unknown-slot-2] [fixture:
c4/gram-proto-required-alias]
[fixture: c4/spec-c4-boundary-b3599bdb]
[fixture: c4/spec-c4-boundary-bee7a277]
[fixture: c4/spec-c4-container-227cee1f]
[fixture: c4/spec-c4-container-23198f5c]
[fixture: c4/spec-c4-container-4d212df1]
[fixture: c4/spec-c4-container-525a49b6]
[fixture: c4/spec-c4-container-69e27135]
[fixture: c4/spec-c4-container-6f47ed69]
[fixture: c4/spec-c4-container-709d6da2]
[fixture: c4/spec-c4-container-71f1f40a]
[fixture: c4/spec-c4-container-73efb750]
[fixture: c4/spec-c4-container-7b219cb5]
[fixture: c4/spec-c4-container-7ff21db3]
[fixture: c4/spec-c4-container-9fafe60a]
[fixture: c4/spec-c4-container-a4898ac9]
[fixture: c4/spec-c4-container-a8bcc8bb]
[fixture: c4/spec-c4-container-cc23077f]
[fixture: c4/spec-c4-container-cfc9805a]
[fixture: c4/spec-c4-container-f61118ef]
[fixture: c4/spec-c4-container-f76371df]
[fixture: c4/spec-c4-person-7cbb425f]
[fixture: c4/spec-c4-person-7ddb8a15]
[fixture: c4/spec-c4-person-ext-428d8710]
[fixture: c4/spec-c4-person-ext-8bf8e3f1]
[fixture: c4/spec-c4-person-ext-dea72a2a]
[fixture: c4/spec-c4-person-fb9d8438]
[fixture: c4/spec-c4-system-059c79a3]
[fixture: c4/spec-c4-system-2554a22f]
[fixture: c4/spec-c4-system-2eea5541]
[fixture: c4/spec-c4-system-3287508c]
[fixture: c4/spec-c4-system-3650d093]
[fixture: c4/spec-c4-system-4e007e49]
[fixture: c4/spec-c4-system-5c2436b9]
[fixture: c4/spec-c4-system-7af0386b]
[fixture: c4/spec-c4-system-87ba2480]
[fixture: c4/spec-c4-system-94276e42]
[fixture: c4/spec-c4-system-a59e3342]
[fixture: c4/spec-c4-system-c4992129]
[fixture: c4/spec-c4-system-cdbd60ee]
[fixture: c4/spec-c4-system-d179118a]
[fixture: c4/spec-c4-system-d386f240]
[fixture: c4/spec-c4-system-eb1891a8]
[fixture: c4/spec-c4-system-ee47b0a8]
[fixture: c4/spec-c4-system-fecdbb6e]

任意の名前付き `label`、`descr`、`techn`、`type` は `{ text }` となり、
その他の名前付き値は文字列であり、同じキーへの後の代入が以前を置き換える。
[fixture: c4/db-named-text-fields] [fixture: c4/db-named-repeat] [fixture:
c4/db-named-case-sensitive] [fixture: c4/db-named-boundary-link-slot-3]
[fixture: c4/db-named-boundary-link-slot-4] [fixture:
c4/db-named-boundary-link-slot-5] [fixture: c4/db-named-boundary-sprite-slot-3]
[fixture: c4/db-named-boundary-sprite-slot-4] [fixture:
c4/db-named-boundary-sprite-slot-5] [fixture: c4/db-named-boundary-tags-slot-3]
[fixture: c4/db-named-boundary-tags-slot-4] [fixture:
c4/db-named-boundary-tags-slot-5] [fixture: c4/db-named-boundary-unknown-slot-3]
[fixture: c4/db-named-boundary-unknown-slot-4] [fixture:
c4/db-named-boundary-unknown-slot-5] [fixture:
c4/db-named-component-link-slot-3] [fixture: c4/db-named-component-link-slot-4]
[fixture: c4/db-named-component-link-slot-5] [fixture:
c4/db-named-component-link-slot-6] [fixture: c4/db-named-component-link-slot-7]
[fixture: c4/db-named-component-sprite-slot-3] [fixture:
c4/db-named-component-sprite-slot-4] [fixture:
c4/db-named-component-sprite-slot-5] [fixture:
c4/db-named-component-sprite-slot-6] [fixture:
c4/db-named-component-sprite-slot-7] [fixture:
c4/db-named-component-tags-slot-3] [fixture: c4/db-named-component-tags-slot-4]
[fixture: c4/db-named-component-tags-slot-5] [fixture:
c4/db-named-component-tags-slot-6] [fixture: c4/db-named-component-tags-slot-7]
[fixture: c4/db-named-component-unknown-slot-3] [fixture:
c4/db-named-component-unknown-slot-4] [fixture:
c4/db-named-component-unknown-slot-5] [fixture:
c4/db-named-component-unknown-slot-6] [fixture:
c4/db-named-component-unknown-slot-7] [fixture:
c4/db-named-container-boundary-link-slot-3] [fixture:
c4/db-named-container-boundary-link-slot-4] [fixture:
c4/db-named-container-boundary-sprite-slot-3] [fixture:
c4/db-named-container-boundary-sprite-slot-4] [fixture:
c4/db-named-container-boundary-tags-slot-3] [fixture:
c4/db-named-container-boundary-tags-slot-4] [fixture:
c4/db-named-container-boundary-type-slot-3] [fixture:
c4/db-named-container-boundary-type-slot-4] [fixture:
c4/db-named-container-boundary-unknown-slot-3] [fixture:
c4/db-named-container-boundary-unknown-slot-4] [fixture:
c4/db-named-container-link-slot-3] [fixture: c4/db-named-container-link-slot-4]
[fixture: c4/db-named-container-link-slot-5] [fixture:
c4/db-named-container-link-slot-6] [fixture: c4/db-named-container-link-slot-7]
[fixture: c4/db-named-container-sprite-slot-3] [fixture:
c4/db-named-container-sprite-slot-4] [fixture:
c4/db-named-container-sprite-slot-5] [fixture:
c4/db-named-container-sprite-slot-6] [fixture:
c4/db-named-container-sprite-slot-7] [fixture:
c4/db-named-container-tags-slot-3] [fixture: c4/db-named-container-tags-slot-4]
[fixture: c4/db-named-container-tags-slot-5] [fixture:
c4/db-named-container-tags-slot-6] [fixture: c4/db-named-container-tags-slot-7]
[fixture: c4/db-named-container-unknown-slot-3] [fixture:
c4/db-named-container-unknown-slot-4] [fixture:
c4/db-named-container-unknown-slot-5] [fixture:
c4/db-named-container-unknown-slot-6] [fixture:
c4/db-named-container-unknown-slot-7] [fixture:
c4/db-named-enterprise-boundary-link-slot-3] [fixture:
c4/db-named-enterprise-boundary-link-slot-4] [fixture:
c4/db-named-enterprise-boundary-sprite-slot-3] [fixture:
c4/db-named-enterprise-boundary-sprite-slot-4] [fixture:
c4/db-named-enterprise-boundary-tags-slot-3] [fixture:
c4/db-named-enterprise-boundary-tags-slot-4] [fixture:
c4/db-named-enterprise-boundary-type-slot-3] [fixture:
c4/db-named-enterprise-boundary-type-slot-4] [fixture:
c4/db-named-enterprise-boundary-unknown-slot-3] [fixture:
c4/db-named-enterprise-boundary-unknown-slot-4] [fixture:
c4/db-named-index-link-slot-5] [fixture: c4/db-named-index-link-slot-6]
[fixture: c4/db-named-index-link-slot-7] [fixture:
c4/db-named-index-link-slot-8] [fixture: c4/db-named-index-link-slot-9]
[fixture: c4/db-named-index-sprite-slot-5] [fixture:
c4/db-named-index-sprite-slot-6] [fixture: c4/db-named-index-sprite-slot-7]
[fixture: c4/db-named-index-sprite-slot-8] [fixture:
c4/db-named-index-sprite-slot-9] [fixture: c4/db-named-index-tags-slot-5]
[fixture: c4/db-named-index-tags-slot-6] [fixture:
c4/db-named-index-tags-slot-7] [fixture: c4/db-named-index-tags-slot-8]
[fixture: c4/db-named-index-tags-slot-9] [fixture:
c4/db-named-index-unknown-slot-5] [fixture: c4/db-named-index-unknown-slot-6]
[fixture: c4/db-named-index-unknown-slot-7] [fixture:
c4/db-named-index-unknown-slot-8] [fixture: c4/db-named-index-unknown-slot-9]
[fixture: c4/db-named-node-link-slot-3] [fixture: c4/db-named-node-link-slot-4]
[fixture: c4/db-named-node-link-slot-6] [fixture: c4/db-named-node-link-slot-7]
[fixture: c4/db-named-node-sprite-slot-3] [fixture:
c4/db-named-node-sprite-slot-4] [fixture: c4/db-named-node-sprite-slot-6]
[fixture: c4/db-named-node-sprite-slot-7] [fixture:
c4/db-named-node-tags-slot-3] [fixture: c4/db-named-node-tags-slot-4] [fixture:
c4/db-named-node-tags-slot-6] [fixture: c4/db-named-node-tags-slot-7] [fixture:
c4/db-named-node-unknown-slot-3] [fixture: c4/db-named-node-unknown-slot-4]
[fixture: c4/db-named-node-unknown-slot-6] [fixture:
c4/db-named-node-unknown-slot-7] [fixture: c4/db-named-person-link-slot-3]
[fixture: c4/db-named-person-link-slot-4] [fixture:
c4/db-named-person-link-slot-5] [fixture: c4/db-named-person-link-slot-6]
[fixture: c4/db-named-person-sprite-slot-3] [fixture:
c4/db-named-person-sprite-slot-4] [fixture: c4/db-named-person-sprite-slot-5]
[fixture: c4/db-named-person-sprite-slot-6] [fixture:
c4/db-named-person-tags-slot-3] [fixture: c4/db-named-person-tags-slot-4]
[fixture: c4/db-named-person-tags-slot-5] [fixture:
c4/db-named-person-tags-slot-6] [fixture: c4/db-named-person-unknown-slot-3]
[fixture: c4/db-named-person-unknown-slot-4] [fixture:
c4/db-named-person-unknown-slot-5] [fixture: c4/db-named-person-unknown-slot-6]
[fixture: c4/db-named-rel-link-slot-4] [fixture: c4/db-named-rel-link-slot-5]
[fixture: c4/db-named-rel-link-slot-6] [fixture: c4/db-named-rel-link-slot-7]
[fixture: c4/db-named-rel-link-slot-8] [fixture: c4/db-named-rel-sprite-slot-4]
[fixture: c4/db-named-rel-sprite-slot-5] [fixture:
c4/db-named-rel-sprite-slot-6] [fixture: c4/db-named-rel-sprite-slot-7]
[fixture: c4/db-named-rel-sprite-slot-8] [fixture: c4/db-named-rel-tags-slot-4]
[fixture: c4/db-named-rel-tags-slot-5] [fixture: c4/db-named-rel-tags-slot-6]
[fixture: c4/db-named-rel-tags-slot-7] [fixture: c4/db-named-rel-tags-slot-8]
[fixture: c4/db-named-rel-unknown-slot-4] [fixture:
c4/db-named-rel-unknown-slot-5] [fixture: c4/db-named-rel-unknown-slot-6]
[fixture: c4/db-named-rel-unknown-slot-7] [fixture:
c4/db-named-rel-unknown-slot-8] [fixture:
c4/db-named-system-boundary-link-slot-3] [fixture:
c4/db-named-system-boundary-link-slot-4] [fixture:
c4/db-named-system-boundary-sprite-slot-3] [fixture:
c4/db-named-system-boundary-sprite-slot-4] [fixture:
c4/db-named-system-boundary-tags-slot-3] [fixture:
c4/db-named-system-boundary-tags-slot-4] [fixture:
c4/db-named-system-boundary-type-slot-3] [fixture:
c4/db-named-system-boundary-type-slot-4] [fixture:
c4/db-named-system-boundary-unknown-slot-3] [fixture:
c4/db-named-system-boundary-unknown-slot-4] [fixture:
c4/db-boundary-named-descr]
[fixture: c4/demo-c4context-b284cb21]
[fixture: c4/docs-syntax-c4-96b1a834]
[fixture: c4/spec-c4-named-attributes-0430c0e7]
[fixture: c4/spec-c4-named-attributes-048742bf]
[fixture: c4/spec-c4-named-attributes-04ac9f75]
[fixture: c4/spec-c4-named-attributes-0cb2c3dc]
[fixture: c4/spec-c4-named-attributes-1285022a]
[fixture: c4/spec-c4-named-attributes-13f03f92]
[fixture: c4/spec-c4-named-attributes-19f2c0e1]
[fixture: c4/spec-c4-named-attributes-1f32f4f3]
[fixture: c4/spec-c4-named-attributes-239d1762]
[fixture: c4/spec-c4-named-attributes-2c7bc6a9]
[fixture: c4/spec-c4-named-attributes-2f2e1475]
[fixture: c4/spec-c4-named-attributes-2fee60c3]
[fixture: c4/spec-c4-named-attributes-371eb482]
[fixture: c4/spec-c4-named-attributes-3a593391]
[fixture: c4/spec-c4-named-attributes-5fa9c306]
[fixture: c4/spec-c4-named-attributes-71ada770]
[fixture: c4/spec-c4-named-attributes-7bd43315]
[fixture: c4/spec-c4-named-attributes-7f638d49]
[fixture: c4/spec-c4-named-attributes-85d2588f]
[fixture: c4/spec-c4-named-attributes-8de80acb]
[fixture: c4/spec-c4-named-attributes-8e42e31e]
[fixture: c4/spec-c4-named-attributes-8ff48937]
[fixture: c4/spec-c4-named-attributes-94bcf784]
[fixture: c4/spec-c4-named-attributes-9c3f1780]
[fixture: c4/spec-c4-named-attributes-b5341020]
[fixture: c4/spec-c4-named-attributes-bd7f9fb7]
[fixture: c4/spec-c4-named-attributes-c242ed1a]
[fixture: c4/spec-c4-named-attributes-cd95a907]
[fixture: c4/spec-c4-named-attributes-d917387b]
[fixture: c4/spec-c4-named-attributes-dcc2d963]
[fixture: c4/spec-c4-named-attributes-ded1fdf7]
[fixture: c4/spec-c4-named-attributes-e2fffdaa]
[fixture: c4/spec-c4-named-attributes-e489689c]
[fixture: c4/spec-c4-named-attributes-ea0439ad]
[fixture: c4/spec-c4-named-attributes-f69f8e0b]
[fixture: c4/spec-c4-named-attributes-f7287970]
[fixture: c4/spec-c4-named-attributes-fb9b339a]
[fixture: c4/spec-c4-named-attributes-fe324471]
[fixture: c4/spec-c4-person-1505b32b]

型が固定の境界キーワードは記述された任意引数の前へ型を挿入し、
後の名前付き `$type` が置き換えられる。
[fixture: c4/db-boundary-style-named-type]
[fixture: c4/spec-c4-named-attributes-5d8133dd]
[fixture: c4/spec-c4-named-attributes-cdf4c373]

配置ノードの位置 sprite 引数はその位置の名前付き引数も含めて無視され、
別の消費される任意位置の `$sprite` は sprite を設定できる。
[fixture: c4/db-node-sprite] [fixture: c4/db-named-node-sprite-slot-3] [fixture:
c4/db-named-node-sprite-slot-5] [fixture: c4/db-named-node-link-slot-5]
[fixture: c4/db-named-node-tags-slot-5] [fixture:
c4/db-named-node-unknown-slot-5] [fixture:
c4/gram-named-proto-node-ignored-sprite]
[fixture: c4/spec-c4-named-attributes-8fe1ed13]

`RelIndex` は最初の記述引数を捨て、残りを通常の関係の引数と型として扱う。
[fixture: c4/db-keyword-relindex] [fixture: c4/db-named-index-link-slot-1]
[fixture: c4/db-named-index-sprite-slot-1] [fixture:
c4/db-named-index-tags-slot-1] [fixture: c4/db-named-index-unknown-slot-1]
[fixture: c4/db-grid-ampersand-entity-index-argument-bare] [fixture:
c4/db-grid-arrow-index-argument-bare] [fixture:
c4/db-grid-arrow-spaced-index-argument-bare] [fixture:
c4/db-grid-backslash-index-argument-bare] [fixture:
c4/db-grid-backtick-index-argument-bare] [fixture:
c4/db-grid-bom-index-argument-bare] [fixture:
c4/db-grid-classdef-rule-index-argument-bare] [fixture:
c4/db-grid-close-brace-index-argument-bare] [fixture:
c4/db-grid-close-round-index-argument-bare] [fixture:
c4/db-grid-close-square-index-argument-bare] [fixture:
c4/db-grid-colon-index-argument-bare] [fixture:
c4/db-grid-comment-index-argument-bare] [fixture:
c4/db-grid-comment-line-index-argument-bare] [fixture:
c4/db-grid-constructor-index-argument-bare] [fixture:
c4/db-grid-cr-index-argument-bare] [fixture:
c4/db-grid-crlf-index-argument-bare] [fixture:
c4/db-grid-dash-index-argument-bare] [fixture:
c4/db-grid-digits-index-argument-bare] [fixture:
c4/db-grid-directive-index-argument-bare] [fixture:
c4/db-grid-directive-line-index-argument-bare] [fixture:
c4/db-grid-emoji-index-argument-bare] [fixture:
c4/db-grid-empty-index-argument-bare] [fixture:
c4/db-grid-entity-index-argument-bare] [fixture:
c4/db-grid-entity-named-index-argument-bare] [fixture:
c4/db-grid-equals-index-argument-bare] [fixture:
c4/db-grid-ff-index-argument-bare] [fixture:
c4/db-grid-greater-than-index-argument-bare] [fixture:
c4/db-grid-hash-index-argument-bare] [fixture:
c4/db-grid-html-index-argument-bare] [fixture:
c4/db-grid-html-attribute-index-argument-bare] [fixture:
c4/db-grid-html-br-index-argument-bare] [fixture:
c4/db-grid-ideographic-index-argument-bare] [fixture:
c4/db-grid-keyword-index-argument-bare] [fixture:
c4/db-grid-keyword-block-index-argument-bare] [fixture:
c4/db-grid-keyword-class-index-argument-bare] [fixture:
c4/db-grid-keyword-classdef-index-argument-bare] [fixture:
c4/db-grid-keyword-columns-index-argument-bare] [fixture:
c4/db-grid-keyword-end-index-argument-bare] [fixture:
c4/db-grid-keyword-header-index-argument-bare] [fixture:
c4/db-grid-keyword-space-index-argument-bare] [fixture:
c4/db-grid-keyword-style-index-argument-bare] [fixture:
c4/db-grid-less-than-index-argument-bare] [fixture:
c4/db-grid-lf-index-argument-bare] [fixture: c4/db-grid-ls-index-argument-bare]
[fixture: c4/db-grid-nbsp-index-argument-bare] [fixture:
c4/db-grid-nel-index-argument-bare] [fixture:
c4/db-grid-nonascii-index-argument-bare] [fixture:
c4/db-grid-open-brace-index-argument-bare] [fixture:
c4/db-grid-open-round-index-argument-bare] [fixture:
c4/db-grid-open-square-index-argument-bare] [fixture:
c4/db-grid-percent-index-argument-bare] [fixture:
c4/db-grid-pipe-index-argument-bare] [fixture:
c4/db-grid-proto-index-argument-bare] [fixture:
c4/db-grid-ps-index-argument-bare] [fixture:
c4/db-grid-quote-index-argument-bare] [fixture:
c4/db-grid-root-index-argument-bare] [fixture:
c4/db-grid-semicolon-index-argument-bare] [fixture:
c4/db-grid-single-quote-index-argument-bare] [fixture:
c4/db-grid-spaces-index-argument-bare] [fixture:
c4/db-grid-style-rule-index-argument-bare] [fixture:
c4/db-grid-tab-index-argument-bare] [fixture: c4/db-grid-vt-index-argument-bare]
[fixture: c4/db-grid-ampersand-entity-index-argument-quoted] [fixture:
c4/db-grid-arrow-index-argument-quoted] [fixture:
c4/db-grid-arrow-spaced-index-argument-quoted] [fixture:
c4/db-grid-backslash-index-argument-quoted] [fixture:
c4/db-grid-backtick-index-argument-quoted] [fixture:
c4/db-grid-bom-index-argument-quoted] [fixture:
c4/db-grid-classdef-rule-index-argument-quoted] [fixture:
c4/db-grid-close-brace-index-argument-quoted] [fixture:
c4/db-grid-close-round-index-argument-quoted] [fixture:
c4/db-grid-close-square-index-argument-quoted] [fixture:
c4/db-grid-colon-index-argument-quoted] [fixture:
c4/db-grid-comma-index-argument-quoted] [fixture:
c4/db-grid-comment-index-argument-quoted] [fixture:
c4/db-grid-comment-line-index-argument-quoted] [fixture:
c4/db-grid-constructor-index-argument-quoted] [fixture:
c4/db-grid-cr-index-argument-quoted] [fixture:
c4/db-grid-crlf-index-argument-quoted] [fixture:
c4/db-grid-dash-index-argument-quoted] [fixture:
c4/db-grid-digits-index-argument-quoted] [fixture:
c4/db-grid-directive-index-argument-quoted] [fixture:
c4/db-grid-directive-line-index-argument-quoted] [fixture:
c4/db-grid-emoji-index-argument-quoted] [fixture:
c4/db-grid-empty-index-argument-quoted] [fixture:
c4/db-grid-entity-index-argument-quoted] [fixture:
c4/db-grid-entity-named-index-argument-quoted] [fixture:
c4/db-grid-equals-index-argument-quoted] [fixture:
c4/db-grid-ff-index-argument-quoted] [fixture:
c4/db-grid-greater-than-index-argument-quoted] [fixture:
c4/db-grid-hash-index-argument-quoted] [fixture:
c4/db-grid-html-index-argument-quoted] [fixture:
c4/db-grid-html-attribute-index-argument-quoted] [fixture:
c4/db-grid-html-br-index-argument-quoted] [fixture:
c4/db-grid-ideographic-index-argument-quoted] [fixture:
c4/db-grid-keyword-index-argument-quoted] [fixture:
c4/db-grid-keyword-block-index-argument-quoted] [fixture:
c4/db-grid-keyword-class-index-argument-quoted] [fixture:
c4/db-grid-keyword-classdef-index-argument-quoted] [fixture:
c4/db-grid-keyword-columns-index-argument-quoted] [fixture:
c4/db-grid-keyword-end-index-argument-quoted] [fixture:
c4/db-grid-keyword-header-index-argument-quoted] [fixture:
c4/db-grid-keyword-space-index-argument-quoted] [fixture:
c4/db-grid-keyword-style-index-argument-quoted] [fixture:
c4/db-grid-less-than-index-argument-quoted] [fixture:
c4/db-grid-lf-index-argument-quoted] [fixture:
c4/db-grid-ls-index-argument-quoted] [fixture:
c4/db-grid-nbsp-index-argument-quoted] [fixture:
c4/db-grid-nel-index-argument-quoted] [fixture:
c4/db-grid-nonascii-index-argument-quoted] [fixture:
c4/db-grid-open-brace-index-argument-quoted] [fixture:
c4/db-grid-open-round-index-argument-quoted] [fixture:
c4/db-grid-open-square-index-argument-quoted] [fixture:
c4/db-grid-percent-index-argument-quoted] [fixture:
c4/db-grid-pipe-index-argument-quoted] [fixture:
c4/db-grid-proto-index-argument-quoted] [fixture:
c4/db-grid-ps-index-argument-quoted] [fixture:
c4/db-grid-punct-index-argument-quoted] [fixture:
c4/db-grid-root-index-argument-quoted] [fixture:
c4/db-grid-semicolon-index-argument-quoted] [fixture:
c4/db-grid-single-quote-index-argument-quoted] [fixture:
c4/db-grid-spaces-index-argument-quoted] [fixture:
c4/db-grid-style-rule-index-argument-quoted] [fixture:
c4/db-grid-tab-index-argument-quoted] [fixture:
c4/db-grid-vt-index-argument-quoted]

[`UpdateElementStyle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L494-L590)
は最初に一致する図形を更新し、図形がなければ最初に一致する境界を更新し、
対象がなければ何も変更しない。
[fixture: c4/gram-boundary-reused-alias] [fixture: c4/db-style-boundary]
[fixture: c4/db-style-before-definition] [fixture:
c4/db-named-element-style-link-slot-1] [fixture:
c4/db-named-element-style-sprite-slot-1] [fixture:
c4/db-named-element-style-tags-slot-1] [fixture:
c4/db-named-element-style-unknown-slot-1] [fixture:
c4/db-style-required-named-target]

要素スタイルは `bgColor`、`fontColor`、`borderColor`、`shadowing`、
`shape`、`sprite`、`techn`、`legendText`、`legendSprite` を保持し、
名前付き引数はテキストフィールドと任意キーも直接の値として代入し、
後の更新は指定されたフィールドだけを置き換える。
[fixture: c4/db-all-fields] [fixture: c4/db-style-text-replacement] [fixture:
c4/db-style-three-updates] [fixture: c4/db-named-element-style-link-slot-10]
[fixture: c4/db-named-element-style-link-slot-2] [fixture:
c4/db-named-element-style-link-slot-3] [fixture:
c4/db-named-element-style-link-slot-4] [fixture:
c4/db-named-element-style-link-slot-5] [fixture:
c4/db-named-element-style-link-slot-6] [fixture:
c4/db-named-element-style-link-slot-7] [fixture:
c4/db-named-element-style-link-slot-8] [fixture:
c4/db-named-element-style-link-slot-9] [fixture:
c4/db-named-element-style-sprite-slot-10] [fixture:
c4/db-named-element-style-sprite-slot-2] [fixture:
c4/db-named-element-style-sprite-slot-3] [fixture:
c4/db-named-element-style-sprite-slot-4] [fixture:
c4/db-named-element-style-sprite-slot-5] [fixture:
c4/db-named-element-style-sprite-slot-6] [fixture:
c4/db-named-element-style-sprite-slot-7] [fixture:
c4/db-named-element-style-sprite-slot-8] [fixture:
c4/db-named-element-style-sprite-slot-9] [fixture:
c4/db-named-element-style-tags-slot-10] [fixture:
c4/db-named-element-style-tags-slot-2] [fixture:
c4/db-named-element-style-tags-slot-3] [fixture:
c4/db-named-element-style-tags-slot-4] [fixture:
c4/db-named-element-style-tags-slot-5] [fixture:
c4/db-named-element-style-tags-slot-6] [fixture:
c4/db-named-element-style-tags-slot-7] [fixture:
c4/db-named-element-style-tags-slot-8] [fixture:
c4/db-named-element-style-tags-slot-9] [fixture:
c4/db-named-element-style-unknown-slot-10] [fixture:
c4/db-named-element-style-unknown-slot-2] [fixture:
c4/db-named-element-style-unknown-slot-3] [fixture:
c4/db-named-element-style-unknown-slot-4] [fixture:
c4/db-named-element-style-unknown-slot-5] [fixture:
c4/db-named-element-style-unknown-slot-6] [fixture:
c4/db-named-element-style-unknown-slot-7] [fixture:
c4/db-named-element-style-unknown-slot-8] [fixture:
c4/db-named-element-style-unknown-slot-9]
[fixture: c4/demo-c4context-61e43307]
[fixture: c4/docs-syntax-c4-f96d2403]

`UpdateRelStyle` は保存済みの端点の順序付き対だけを更新し、
`textColor`、`lineColor`、`offsetX`、`offsetY` と任意の名前付き属性を保持し、
後の更新は指定されたフィールドだけを置き換える。
[fixture: c4/db-style-before-definition] [fixture:
c4/db-update-rel-style-three-times] [fixture: c4/db-update-rel-style-named-text]
[fixture: c4/db-named-rel-style-link-slot-1] [fixture:
c4/db-named-rel-style-link-slot-2] [fixture: c4/db-named-rel-style-link-slot-3]
[fixture: c4/db-named-rel-style-link-slot-4] [fixture:
c4/db-named-rel-style-sprite-slot-1] [fixture:
c4/db-named-rel-style-sprite-slot-2] [fixture:
c4/db-named-rel-style-sprite-slot-3] [fixture:
c4/db-named-rel-style-sprite-slot-4] [fixture:
c4/db-named-rel-style-tags-slot-1] [fixture: c4/db-named-rel-style-tags-slot-2]
[fixture: c4/db-named-rel-style-tags-slot-3] [fixture:
c4/db-named-rel-style-tags-slot-4] [fixture:
c4/db-named-rel-style-unknown-slot-1] [fixture:
c4/db-named-rel-style-unknown-slot-2] [fixture:
c4/db-named-rel-style-unknown-slot-3] [fixture:
c4/db-named-rel-style-unknown-slot-4]
[fixture: c4/demo-c4context-3c40673b]
[fixture: c4/docs-syntax-c4-5f697bdc]

オフセット位置は名前付きキーが別フィールドを選んでも値へ `parseInt()` を使い、
非有限数を `"NaN"`、`"Infinity"`、`"-Infinity"`、負のゼロをゼロで記録する。
[fixture: c4/db-number-rel-style-negative-zero] [fixture:
c4/db-number-rel-style-nan] [fixture: c4/db-number-rel-style-overflow] [fixture:
c4/db-update-rel-style-named-number-key] [fixture: c4/db-number-rel-style-empty]
[fixture: c4/db-number-rel-style-exponent] [fixture:
c4/db-number-rel-style-fraction] [fixture: c4/db-number-rel-style-fullwidth]
[fixture: c4/db-number-rel-style-hex] [fixture: c4/db-number-rel-style-infinity]
[fixture: c4/db-number-rel-style-negative] [fixture:
c4/db-number-rel-style-non-ascii] [fixture: c4/db-number-rel-style-plus]
[fixture: c4/db-number-rel-style-space-text-after] [fixture:
c4/db-number-rel-style-text-after] [fixture: c4/db-number-rel-style-zero]
[fixture: c4/db-named-rel-style-link-slot-5] [fixture:
c4/db-named-rel-style-link-slot-6] [fixture:
c4/db-named-rel-style-sprite-slot-5] [fixture:
c4/db-named-rel-style-sprite-slot-6] [fixture:
c4/db-named-rel-style-tags-slot-5] [fixture: c4/db-named-rel-style-tags-slot-6]
[fixture: c4/db-named-rel-style-unknown-slot-5] [fixture:
c4/db-named-rel-style-unknown-slot-6]
[fixture: c4/demo-c4context-61e43307]
[fixture: c4/docs-syntax-c4-bc80e69a]
[fixture: c4/docs-syntax-c4-f96d2403]

`UpdateRelStyle` の `textColor` または `lineColor` の位置へ渡した
名前付き `offsetX` と `offsetY` の値は文字列のまま保持し、
オフセット位置だけで数値へ変換する。
[fixture: c4/demo-c4context-1d531a27]
[fixture: c4/demo-c4context-3c40673b]
[fixture: c4/demo-c4context-49481a12]
[fixture: c4/demo-c4context-b284cb21]
[fixture: c4/docs-syntax-c4-5f697bdc]
[fixture: c4/docs-syntax-c4-90f106b9]
[fixture: c4/docs-syntax-c4-96b1a834]
[fixture: c4/docs-syntax-c4-e233a726]

`c4ShapeInRow` と `c4BoundaryInRow` は Db getter の値であり、
初期値は 4 と 2 であり、
対応する `UpdateLayoutConfig` 引数の `parseInt()` 値が 1 以上なら個別に変わり、
名前付き引数でも位置が対象を選ぶ。
[fixture: c4/db-number-layout-zero] [fixture: c4/db-named-layout-order]
[fixture: c4/db-named-layout-key] [fixture: c4/db-update-layout-three-times]
[fixture: c4/db-number-layout-exponent] [fixture: c4/db-number-layout-fraction]
[fixture: c4/db-number-layout-fullwidth] [fixture: c4/db-number-layout-hex]
[fixture: c4/db-number-layout-infinity] [fixture: c4/db-number-layout-nan]
[fixture: c4/db-number-layout-negative] [fixture:
c4/db-number-layout-negative-zero] [fixture: c4/db-number-layout-non-ascii]
[fixture: c4/db-number-layout-overflow] [fixture: c4/db-number-layout-plus]
[fixture: c4/db-number-layout-space-text-after] [fixture:
c4/db-number-layout-text-after] [fixture: c4/db-named-layout-link-slot-1]
[fixture: c4/db-named-layout-link-slot-2] [fixture:
c4/db-named-layout-sprite-slot-1] [fixture: c4/db-named-layout-sprite-slot-2]
[fixture: c4/db-named-layout-tags-slot-1] [fixture:
c4/db-named-layout-tags-slot-2] [fixture: c4/db-named-layout-unknown-slot-1]
[fixture: c4/db-named-layout-unknown-slot-2] [fixture: c4/gram-proto-layout]
[fixture: c4/gram-update-empty-string]
[fixture: c4/demo-c4context-61e43307]
[fixture: c4/docs-syntax-c4-bc80e69a]
[fixture: c4/docs-syntax-c4-f96d2403]

文法は個数制限のない引数列を受理し、
Db は呼ばれた関数のパラメーターを超える引数を無視する。
[fixture: c4/gram-arguments-person-above] [fixture: c4/gram-arguments-rel-above]
[fixture: c4/gram-arguments-element-style-above] [fixture:
c4/gram-arguments-boundary-above] [fixture: c4/gram-arguments-component-above]
[fixture: c4/gram-arguments-container-above] [fixture:
c4/gram-arguments-index-above] [fixture: c4/gram-arguments-layout-above]
[fixture: c4/gram-arguments-node-above] [fixture:
c4/gram-arguments-rel-style-above] [fixture: c4/gram-proto-unused-extra]

5 個の正確なヘッダー語が `type` を設定し、
文の前の改行と空でない文のリストを必要とする。
[fixture: c4/header-context-minimal] [fixture: c4/header-container-minimal]
[fixture: c4/header-component-minimal] [fixture: c4/header-dynamic-minimal]
[fixture: c4/header-deployment-minimal] [fixture: c4/db-empty-board] [fixture:
c4/header-context-statement-on-header-line] [fixture:
c4/db-grid-empty-header-line] [fixture: c4/header-component-only] [fixture:
c4/header-component-only-lf] [fixture:
c4/header-component-statement-on-header-line] [fixture:
c4/header-component-tab-statement-on-header-line] [fixture:
c4/header-component-title-on-header-line] [fixture: c4/header-component-twice]
[fixture: c4/header-container-only] [fixture: c4/header-container-only-lf]
[fixture: c4/header-container-statement-on-header-line] [fixture:
c4/header-container-tab-statement-on-header-line] [fixture:
c4/header-container-title-on-header-line] [fixture: c4/header-container-twice]
[fixture: c4/header-context-only] [fixture:
c4/header-context-tab-statement-on-header-line] [fixture:
c4/header-context-title-on-header-line] [fixture: c4/header-context-twice]
[fixture: c4/header-deployment-only] [fixture: c4/header-deployment-only-lf]
[fixture: c4/header-deployment-statement-on-header-line] [fixture:
c4/header-deployment-tab-statement-on-header-line] [fixture:
c4/header-deployment-title-on-header-line] [fixture: c4/header-deployment-twice]
[fixture: c4/header-dynamic-only] [fixture: c4/header-dynamic-only-lf] [fixture:
c4/header-dynamic-statement-on-header-line] [fixture:
c4/header-dynamic-tab-statement-on-header-line] [fixture:
c4/header-dynamic-title-on-header-line] [fixture: c4/header-dynamic-twice]
[fixture: c4/header-header-semicolon]

5 ヘッダーはすべての要素、境界、ノード、関係、更新の文を共有する。
[fixture: c4/db-keyword-person-ext] [fixture: c4/db-keyword-systemqueue-ext]
[fixture: c4/db-keyword-containerqueue-ext] [fixture:
c4/db-keyword-componentqueue-ext] [fixture: c4/db-keyword-rel-back]

`title` は最初の区切りの後の文字を追加の先頭末尾空白も保持して取り、
`accTitle:` は値の両端を削って同じ title を設定し、
`accTitle` は空のままであり、最後の文が勝つ。
[fixture: c4/db-title-whitespace] [fixture: c4/db-acc-title] [fixture:
c4/db-title-acc-order] [fixture: c4/db-title-frontmatter] [fixture:
c4/db-title-plain] [fixture: c4/db-title-spaces] [fixture:
c4/db-title-spaces-only] [fixture: c4/db-title-tab] [fixture:
c4/db-title-tab-only] [fixture: c4/db-title-three-times] [fixture:
c4/db-acctitle-empty] [fixture: c4/db-acctitle-plain] [fixture:
c4/db-acctitle-spaces] [fixture: c4/db-acctitle-tab] [fixture:
c4/db-acctitle-three-times] [fixture: c4/db-acc-title-space-before-colon]
[fixture: c4/demo-c4context-61e43307]
[fixture: c4/spec-c4-component-0da5aed2]
[fixture: c4/spec-c4-component-469fb648]
[fixture: c4/spec-c4-component-a8988ac2]
[fixture: c4/spec-c4-component-d1298236]
[fixture: c4/spec-c4-component-ebbe1176]
[fixture: c4/spec-c4-component-f06e3225]
[fixture: c4/spec-c4-diagram-a95fd4b0]

`accDescription` は最初の区切りの後の文字を保持し、
`accDescr:` は値、空でない `accDescr { ... }` はブロックの両端を削り、
すべて `accDescr` を設定し、その setter は改行後の空白を削る。
[fixture: c4/db-acc-description-whitespace] [fixture:
c4/db-acc-description-order] [fixture: c4/gram-acc-descr-block-text] [fixture:
c4/db-accdescription-plain] [fixture: c4/db-accdescription-spaces] [fixture:
c4/db-accdescription-tab] [fixture: c4/db-accdescription-three-times] [fixture:
c4/db-accdescr-empty] [fixture: c4/db-accdescr-plain] [fixture:
c4/db-accdescr-spaces] [fixture: c4/db-accdescr-tab] [fixture:
c4/db-accdescr-three-times] [fixture: c4/db-acc-descr-tab-before-colon]
[fixture: c4/db-acc-description-spaces-only] [fixture:
c4/gram-acc-descr-block-after-text-text] [fixture:
c4/gram-acc-descr-block-comment-line] [fixture:
c4/gram-acc-descr-block-after-text-comment-line] [fixture:
c4/gram-acc-descr-block-directive-line] [fixture:
c4/gram-acc-descr-block-after-text-directive-line]
[fixture: c4/demo-c4context-61e43307]

空の説明ブロックは文を出さず、図形文と同じ行なら以前の値を保持し、
直後の改行が余分な改行として残ると文法が拒否する。
[fixture: c4/db-empty-block-inline-before-shape] [fixture:
c4/db-empty-block-inline-after-shape] [fixture: c4/db-empty-block-inline-two]
[fixture: c4/db-empty-description-block-after-value] [fixture:
c4/gram-block-with-comment-only] [fixture: c4/db-empty-block-inline-blank-lines]
[fixture: c4/db-empty-block-inline-spaces] [fixture:
c4/gram-empty-block-after-title] [fixture: c4/gram-empty-block-before-person]
[fixture: c4/gram-empty-block-before-close] [fixture:
c4/gram-empty-block-after-boundary-open] [fixture:
c4/gram-empty-block-after-boundary-close] [fixture:
c4/gram-empty-block-after-args-before-body] [fixture:
c4/gram-empty-block-boundary-between-line-brace] [fixture:
c4/gram-grid-empty-acc-descr-block]

frontmatter の title とアクセシビリティフィールドは C4 getter を設定しない。
[fixture: c4/db-title-frontmatter] [fixture: c4/db-frontmatter-drawing-config]

root の `wrap` 設定が図形、境界、関係へコピーされ、
undefined と null の指定では省略し、
false とその他の指定値も保持し、
ラベルの `wrap:` と `nowrap:` は文字のまま残る。
[fixture: c4/db-wrap-directive] [fixture: c4/config-wrap-true] [fixture:
c4/config-wrap-false] [fixture: c4/config-wrap-null] [fixture:
c4/config-wrap-text] [fixture: c4/db-wrap-frontmatter] [fixture:
c4/db-wrap-init-directive]

テーマ、`c4.wrap`、C4 の行数設定は解析時の Db フィールドを変えず、
未対応の `securityLevel` と有効な HTML ラベルは title と説明の文字を置換し、
root の `htmlLabels` は `flowchart.htmlLabels` に優先する。
[fixture: c4/db-directive-drawing-config] [fixture:
c4/db-frontmatter-drawing-config] [fixture: c4/config-security-level-other]
[fixture: c4/config-security-level-other-html-labels-false] [fixture:
c4/config-security-level-other-flowchart-html-labels-false] [fixture:
c4/config-security-level-other-root-overrides-flowchart]

要約は設定オブジェクト、描画用定数、重複する図形キー、解析スタックを捨て、
描画座標は解析中に設定されず、座標に似た名前付き属性は記述属性として保持する。
[fixture: c4/db-number-layout-zero] [fixture: c4/gram-boundary-nested] [fixture:
c4/db-style-layout-key-attributes]

`patchC4Db()` は C4 のクリア時に共有アクセシビリティ文字列を setter で消し、
各入力が空のアクセシビリティ文字列から始まる。
[fixture: c4/db-all-fields] [fixture: c4/header-context-minimal]

C4 は `@{ ... }` データブロック生成規則を持たない。
[fixture: c4/gram-data-block]

行頭に固定されない direction の字句規則は同じ行の任意の前置文字を取り込み、
文リストの direction トークンは拒否され、ヘッダーを置き換える場合は、
存在しない `setDirection` を呼び TypeError となる。
[fixture: c4/gram-direction-tb-prefix] [fixture: c4/gram-header-direction-tb]
[fixture: c4/gram-header-direction-bt] [fixture: c4/gram-header-direction-rl]
[fixture: c4/gram-header-direction-lr]

### ヘッダーと文の境界

directive の除去後は呼出キーワードが `(` に接する必要があり、
間のスペース、
タブ、
改行、
コメント行は拒否される。
[fixture: c4/lex-keyword-gap-birel-blank-line] [fixture:
c4/lex-keyword-gap-birel-comment-line] [fixture:
c4/lex-keyword-gap-birel-directive-line] [fixture: c4/lex-keyword-gap-birel-lf]
[fixture: c4/lex-keyword-gap-birel-space] [fixture:
c4/lex-keyword-gap-birel-tab] [fixture: c4/lex-keyword-gap-boundary-blank-line]
[fixture: c4/lex-keyword-gap-boundary-comment-line] [fixture:
c4/lex-keyword-gap-boundary-directive-line] [fixture:
c4/lex-keyword-gap-boundary-lf] [fixture: c4/lex-keyword-gap-boundary-space]
[fixture: c4/lex-keyword-gap-boundary-tab] [fixture:
c4/lex-keyword-gap-component-blank-line] [fixture:
c4/lex-keyword-gap-component-comment-line] [fixture:
c4/lex-keyword-gap-component-directive-line] [fixture:
c4/lex-keyword-gap-component-ext-blank-line] [fixture:
c4/lex-keyword-gap-component-ext-comment-line] [fixture:
c4/lex-keyword-gap-component-ext-directive-line] [fixture:
c4/lex-keyword-gap-component-ext-lf] [fixture:
c4/lex-keyword-gap-component-ext-space] [fixture:
c4/lex-keyword-gap-component-ext-tab] [fixture: c4/lex-keyword-gap-component-lf]
[fixture: c4/lex-keyword-gap-component-space] [fixture:
c4/lex-keyword-gap-component-tab] [fixture:
c4/lex-keyword-gap-componentdb-blank-line] [fixture:
c4/lex-keyword-gap-componentdb-comment-line] [fixture:
c4/lex-keyword-gap-componentdb-directive-line] [fixture:
c4/lex-keyword-gap-componentdb-ext-blank-line] [fixture:
c4/lex-keyword-gap-componentdb-ext-comment-line] [fixture:
c4/lex-keyword-gap-componentdb-ext-directive-line] [fixture:
c4/lex-keyword-gap-componentdb-ext-lf] [fixture:
c4/lex-keyword-gap-componentdb-ext-space] [fixture:
c4/lex-keyword-gap-componentdb-ext-tab] [fixture:
c4/lex-keyword-gap-componentdb-lf] [fixture:
c4/lex-keyword-gap-componentdb-space] [fixture:
c4/lex-keyword-gap-componentdb-tab] [fixture:
c4/lex-keyword-gap-componentqueue-blank-line] [fixture:
c4/lex-keyword-gap-componentqueue-comment-line] [fixture:
c4/lex-keyword-gap-componentqueue-directive-line] [fixture:
c4/lex-keyword-gap-componentqueue-ext-blank-line] [fixture:
c4/lex-keyword-gap-componentqueue-ext-comment-line] [fixture:
c4/lex-keyword-gap-componentqueue-ext-directive-line] [fixture:
c4/lex-keyword-gap-componentqueue-ext-lf] [fixture:
c4/lex-keyword-gap-componentqueue-ext-space] [fixture:
c4/lex-keyword-gap-componentqueue-ext-tab] [fixture:
c4/lex-keyword-gap-componentqueue-lf] [fixture:
c4/lex-keyword-gap-componentqueue-space] [fixture:
c4/lex-keyword-gap-componentqueue-tab] [fixture:
c4/lex-keyword-gap-container-blank-line] [fixture:
c4/lex-keyword-gap-container-boundary-blank-line] [fixture:
c4/lex-keyword-gap-container-boundary-comment-line] [fixture:
c4/lex-keyword-gap-container-boundary-directive-line] [fixture:
c4/lex-keyword-gap-container-boundary-lf] [fixture:
c4/lex-keyword-gap-container-boundary-space] [fixture:
c4/lex-keyword-gap-container-boundary-tab] [fixture:
c4/lex-keyword-gap-container-comment-line] [fixture:
c4/lex-keyword-gap-container-directive-line] [fixture:
c4/lex-keyword-gap-container-ext-blank-line] [fixture:
c4/lex-keyword-gap-container-ext-comment-line] [fixture:
c4/lex-keyword-gap-container-ext-directive-line] [fixture:
c4/lex-keyword-gap-container-ext-lf] [fixture:
c4/lex-keyword-gap-container-ext-space] [fixture:
c4/lex-keyword-gap-container-ext-tab] [fixture: c4/lex-keyword-gap-container-lf]
[fixture: c4/lex-keyword-gap-container-space] [fixture:
c4/lex-keyword-gap-container-tab] [fixture:
c4/lex-keyword-gap-containerdb-blank-line] [fixture:
c4/lex-keyword-gap-containerdb-comment-line] [fixture:
c4/lex-keyword-gap-containerdb-directive-line] [fixture:
c4/lex-keyword-gap-containerdb-ext-blank-line] [fixture:
c4/lex-keyword-gap-containerdb-ext-comment-line] [fixture:
c4/lex-keyword-gap-containerdb-ext-directive-line] [fixture:
c4/lex-keyword-gap-containerdb-ext-lf] [fixture:
c4/lex-keyword-gap-containerdb-ext-space] [fixture:
c4/lex-keyword-gap-containerdb-ext-tab] [fixture:
c4/lex-keyword-gap-containerdb-lf] [fixture:
c4/lex-keyword-gap-containerdb-space] [fixture:
c4/lex-keyword-gap-containerdb-tab] [fixture:
c4/lex-keyword-gap-containerqueue-blank-line] [fixture:
c4/lex-keyword-gap-containerqueue-comment-line] [fixture:
c4/lex-keyword-gap-containerqueue-directive-line] [fixture:
c4/lex-keyword-gap-containerqueue-ext-blank-line] [fixture:
c4/lex-keyword-gap-containerqueue-ext-comment-line] [fixture:
c4/lex-keyword-gap-containerqueue-ext-directive-line] [fixture:
c4/lex-keyword-gap-containerqueue-ext-lf] [fixture:
c4/lex-keyword-gap-containerqueue-ext-space] [fixture:
c4/lex-keyword-gap-containerqueue-ext-tab] [fixture:
c4/lex-keyword-gap-containerqueue-lf] [fixture:
c4/lex-keyword-gap-containerqueue-space] [fixture:
c4/lex-keyword-gap-containerqueue-tab] [fixture:
c4/lex-keyword-gap-deployment-node-blank-line] [fixture:
c4/lex-keyword-gap-deployment-node-comment-line] [fixture:
c4/lex-keyword-gap-deployment-node-directive-line] [fixture:
c4/lex-keyword-gap-deployment-node-lf] [fixture:
c4/lex-keyword-gap-deployment-node-space] [fixture:
c4/lex-keyword-gap-deployment-node-tab] [fixture:
c4/lex-keyword-gap-enterprise-boundary-blank-line] [fixture:
c4/lex-keyword-gap-enterprise-boundary-comment-line] [fixture:
c4/lex-keyword-gap-enterprise-boundary-directive-line] [fixture:
c4/lex-keyword-gap-enterprise-boundary-lf] [fixture:
c4/lex-keyword-gap-enterprise-boundary-space] [fixture:
c4/lex-keyword-gap-enterprise-boundary-tab] [fixture:
c4/lex-keyword-gap-node-blank-line] [fixture:
c4/lex-keyword-gap-node-comment-line] [fixture:
c4/lex-keyword-gap-node-directive-line] [fixture:
c4/lex-keyword-gap-node-l-blank-line] [fixture:
c4/lex-keyword-gap-node-l-comment-line] [fixture:
c4/lex-keyword-gap-node-l-directive-line] [fixture:
c4/lex-keyword-gap-node-l-lf] [fixture: c4/lex-keyword-gap-node-l-space]
[fixture: c4/lex-keyword-gap-node-l-tab] [fixture: c4/lex-keyword-gap-node-lf]
[fixture: c4/lex-keyword-gap-node-r-blank-line] [fixture:
c4/lex-keyword-gap-node-r-comment-line] [fixture:
c4/lex-keyword-gap-node-r-directive-line] [fixture:
c4/lex-keyword-gap-node-r-lf] [fixture: c4/lex-keyword-gap-node-r-space]
[fixture: c4/lex-keyword-gap-node-r-tab] [fixture:
c4/lex-keyword-gap-node-space] [fixture: c4/lex-keyword-gap-node-tab] [fixture:
c4/lex-keyword-gap-person-blank-line] [fixture:
c4/lex-keyword-gap-person-comment-line] [fixture:
c4/lex-keyword-gap-person-directive-line] [fixture:
c4/lex-keyword-gap-person-ext-blank-line] [fixture:
c4/lex-keyword-gap-person-ext-comment-line] [fixture:
c4/lex-keyword-gap-person-ext-directive-line] [fixture:
c4/lex-keyword-gap-person-ext-lf] [fixture: c4/lex-keyword-gap-person-ext-space]
[fixture: c4/lex-keyword-gap-person-ext-tab] [fixture:
c4/lex-keyword-gap-person-lf] [fixture: c4/lex-keyword-gap-person-space]
[fixture: c4/lex-keyword-gap-person-tab] [fixture:
c4/lex-keyword-gap-rel-back-blank-line] [fixture:
c4/lex-keyword-gap-rel-back-comment-line] [fixture:
c4/lex-keyword-gap-rel-back-directive-line] [fixture:
c4/lex-keyword-gap-rel-back-lf] [fixture: c4/lex-keyword-gap-rel-back-space]
[fixture: c4/lex-keyword-gap-rel-back-tab] [fixture:
c4/lex-keyword-gap-rel-blank-line] [fixture:
c4/lex-keyword-gap-rel-comment-line] [fixture:
c4/lex-keyword-gap-rel-d-blank-line] [fixture:
c4/lex-keyword-gap-rel-d-comment-line] [fixture:
c4/lex-keyword-gap-rel-d-directive-line] [fixture: c4/lex-keyword-gap-rel-d-lf]
[fixture: c4/lex-keyword-gap-rel-d-space] [fixture:
c4/lex-keyword-gap-rel-d-tab] [fixture: c4/lex-keyword-gap-rel-directive-line]
[fixture: c4/lex-keyword-gap-rel-down-blank-line] [fixture:
c4/lex-keyword-gap-rel-down-comment-line] [fixture:
c4/lex-keyword-gap-rel-down-directive-line] [fixture:
c4/lex-keyword-gap-rel-down-lf] [fixture: c4/lex-keyword-gap-rel-down-space]
[fixture: c4/lex-keyword-gap-rel-down-tab] [fixture:
c4/lex-keyword-gap-rel-l-blank-line] [fixture:
c4/lex-keyword-gap-rel-l-comment-line] [fixture:
c4/lex-keyword-gap-rel-l-directive-line] [fixture: c4/lex-keyword-gap-rel-l-lf]
[fixture: c4/lex-keyword-gap-rel-l-space] [fixture:
c4/lex-keyword-gap-rel-l-tab] [fixture: c4/lex-keyword-gap-rel-left-blank-line]
[fixture: c4/lex-keyword-gap-rel-left-comment-line] [fixture:
c4/lex-keyword-gap-rel-left-directive-line] [fixture:
c4/lex-keyword-gap-rel-left-lf] [fixture: c4/lex-keyword-gap-rel-left-space]
[fixture: c4/lex-keyword-gap-rel-left-tab] [fixture: c4/lex-keyword-gap-rel-lf]
[fixture: c4/lex-keyword-gap-rel-r-blank-line] [fixture:
c4/lex-keyword-gap-rel-r-comment-line] [fixture:
c4/lex-keyword-gap-rel-r-directive-line] [fixture: c4/lex-keyword-gap-rel-r-lf]
[fixture: c4/lex-keyword-gap-rel-r-space] [fixture:
c4/lex-keyword-gap-rel-r-tab] [fixture: c4/lex-keyword-gap-rel-right-blank-line]
[fixture: c4/lex-keyword-gap-rel-right-comment-line] [fixture:
c4/lex-keyword-gap-rel-right-directive-line] [fixture:
c4/lex-keyword-gap-rel-right-lf] [fixture: c4/lex-keyword-gap-rel-right-space]
[fixture: c4/lex-keyword-gap-rel-right-tab] [fixture:
c4/lex-keyword-gap-rel-space] [fixture: c4/lex-keyword-gap-rel-tab] [fixture:
c4/lex-keyword-gap-rel-u-blank-line] [fixture:
c4/lex-keyword-gap-rel-u-comment-line] [fixture:
c4/lex-keyword-gap-rel-u-directive-line] [fixture: c4/lex-keyword-gap-rel-u-lf]
[fixture: c4/lex-keyword-gap-rel-u-space] [fixture:
c4/lex-keyword-gap-rel-u-tab] [fixture: c4/lex-keyword-gap-rel-up-blank-line]
[fixture: c4/lex-keyword-gap-rel-up-comment-line] [fixture:
c4/lex-keyword-gap-rel-up-directive-line] [fixture:
c4/lex-keyword-gap-rel-up-lf] [fixture: c4/lex-keyword-gap-rel-up-space]
[fixture: c4/lex-keyword-gap-rel-up-tab] [fixture:
c4/lex-keyword-gap-relindex-blank-line] [fixture:
c4/lex-keyword-gap-relindex-comment-line] [fixture:
c4/lex-keyword-gap-relindex-directive-line] [fixture:
c4/lex-keyword-gap-relindex-lf] [fixture: c4/lex-keyword-gap-relindex-space]
[fixture: c4/lex-keyword-gap-relindex-tab] [fixture:
c4/lex-keyword-gap-system-blank-line] [fixture:
c4/lex-keyword-gap-system-boundary-blank-line] [fixture:
c4/lex-keyword-gap-system-boundary-comment-line] [fixture:
c4/lex-keyword-gap-system-boundary-directive-line] [fixture:
c4/lex-keyword-gap-system-boundary-lf] [fixture:
c4/lex-keyword-gap-system-boundary-space] [fixture:
c4/lex-keyword-gap-system-boundary-tab] [fixture:
c4/lex-keyword-gap-system-comment-line] [fixture:
c4/lex-keyword-gap-system-directive-line] [fixture:
c4/lex-keyword-gap-system-ext-blank-line] [fixture:
c4/lex-keyword-gap-system-ext-comment-line] [fixture:
c4/lex-keyword-gap-system-ext-directive-line] [fixture:
c4/lex-keyword-gap-system-ext-lf] [fixture: c4/lex-keyword-gap-system-ext-space]
[fixture: c4/lex-keyword-gap-system-ext-tab] [fixture:
c4/lex-keyword-gap-system-lf] [fixture: c4/lex-keyword-gap-system-space]
[fixture: c4/lex-keyword-gap-system-tab] [fixture:
c4/lex-keyword-gap-systemdb-blank-line] [fixture:
c4/lex-keyword-gap-systemdb-comment-line] [fixture:
c4/lex-keyword-gap-systemdb-directive-line] [fixture:
c4/lex-keyword-gap-systemdb-ext-blank-line] [fixture:
c4/lex-keyword-gap-systemdb-ext-comment-line] [fixture:
c4/lex-keyword-gap-systemdb-ext-directive-line] [fixture:
c4/lex-keyword-gap-systemdb-ext-lf] [fixture:
c4/lex-keyword-gap-systemdb-ext-space] [fixture:
c4/lex-keyword-gap-systemdb-ext-tab] [fixture: c4/lex-keyword-gap-systemdb-lf]
[fixture: c4/lex-keyword-gap-systemdb-space] [fixture:
c4/lex-keyword-gap-systemdb-tab] [fixture:
c4/lex-keyword-gap-systemqueue-blank-line] [fixture:
c4/lex-keyword-gap-systemqueue-comment-line] [fixture:
c4/lex-keyword-gap-systemqueue-directive-line] [fixture:
c4/lex-keyword-gap-systemqueue-ext-blank-line] [fixture:
c4/lex-keyword-gap-systemqueue-ext-comment-line] [fixture:
c4/lex-keyword-gap-systemqueue-ext-directive-line] [fixture:
c4/lex-keyword-gap-systemqueue-ext-lf] [fixture:
c4/lex-keyword-gap-systemqueue-ext-space] [fixture:
c4/lex-keyword-gap-systemqueue-ext-tab] [fixture:
c4/lex-keyword-gap-systemqueue-lf] [fixture:
c4/lex-keyword-gap-systemqueue-space] [fixture:
c4/lex-keyword-gap-systemqueue-tab] [fixture:
c4/lex-keyword-gap-updateelementstyle-blank-line] [fixture:
c4/lex-keyword-gap-updateelementstyle-comment-line] [fixture:
c4/lex-keyword-gap-updateelementstyle-directive-line] [fixture:
c4/lex-keyword-gap-updateelementstyle-lf] [fixture:
c4/lex-keyword-gap-updateelementstyle-space] [fixture:
c4/lex-keyword-gap-updateelementstyle-tab] [fixture:
c4/lex-keyword-gap-updatelayoutconfig-blank-line] [fixture:
c4/lex-keyword-gap-updatelayoutconfig-comment-line] [fixture:
c4/lex-keyword-gap-updatelayoutconfig-directive-line] [fixture:
c4/lex-keyword-gap-updatelayoutconfig-lf] [fixture:
c4/lex-keyword-gap-updatelayoutconfig-space] [fixture:
c4/lex-keyword-gap-updatelayoutconfig-tab] [fixture:
c4/lex-keyword-gap-updaterelstyle-blank-line] [fixture:
c4/lex-keyword-gap-updaterelstyle-comment-line] [fixture:
c4/lex-keyword-gap-updaterelstyle-directive-line] [fixture:
c4/lex-keyword-gap-updaterelstyle-lf] [fixture:
c4/lex-keyword-gap-updaterelstyle-space] [fixture:
c4/lex-keyword-gap-updaterelstyle-tab] [fixture: c4/lex-keyword-eof] [fixture:
c4/gram-empty-block-in-keyword-gap]

呼出しとテキストのキーワードは正確な綴りを必要とし、
大文字小文字の変更や、
文字、
数字、
下線、
ハイフン、
ASCII 外の文字の接尾辞は拒否される。
[fixture: c4/lex-keyword-accdescr-dash] [fixture: c4/lex-keyword-accdescr-digit]
[fixture: c4/lex-keyword-accdescr-letter] [fixture:
c4/lex-keyword-accdescr-lower] [fixture: c4/lex-keyword-accdescr-non-ascii]
[fixture: c4/lex-keyword-accdescr-underscore] [fixture:
c4/lex-keyword-accdescr-upper] [fixture: c4/lex-keyword-accdescription-dash]
[fixture: c4/lex-keyword-accdescription-digit] [fixture:
c4/lex-keyword-accdescription-letter] [fixture:
c4/lex-keyword-accdescription-lower] [fixture:
c4/lex-keyword-accdescription-non-ascii] [fixture:
c4/lex-keyword-accdescription-underscore] [fixture:
c4/lex-keyword-accdescription-upper] [fixture: c4/lex-keyword-acctitle-dash]
[fixture: c4/lex-keyword-acctitle-digit] [fixture:
c4/lex-keyword-acctitle-letter] [fixture: c4/lex-keyword-acctitle-lower]
[fixture: c4/lex-keyword-acctitle-non-ascii] [fixture:
c4/lex-keyword-acctitle-underscore] [fixture: c4/lex-keyword-acctitle-upper]
[fixture: c4/lex-keyword-birel-dash] [fixture: c4/lex-keyword-birel-digit]
[fixture: c4/lex-keyword-birel-letter] [fixture: c4/lex-keyword-birel-lower]
[fixture: c4/lex-keyword-birel-non-ascii] [fixture:
c4/lex-keyword-birel-underscore] [fixture: c4/lex-keyword-birel-upper] [fixture:
c4/lex-keyword-boundary-dash] [fixture: c4/lex-keyword-boundary-digit] [fixture:
c4/lex-keyword-boundary-letter] [fixture: c4/lex-keyword-boundary-lower]
[fixture: c4/lex-keyword-boundary-non-ascii] [fixture:
c4/lex-keyword-boundary-underscore] [fixture: c4/lex-keyword-boundary-upper]
[fixture: c4/lex-keyword-component-dash] [fixture:
c4/lex-keyword-component-digit] [fixture: c4/lex-keyword-component-ext-dash]
[fixture: c4/lex-keyword-component-ext-digit] [fixture:
c4/lex-keyword-component-ext-letter] [fixture:
c4/lex-keyword-component-ext-lower] [fixture:
c4/lex-keyword-component-ext-non-ascii] [fixture:
c4/lex-keyword-component-ext-underscore] [fixture:
c4/lex-keyword-component-ext-upper] [fixture: c4/lex-keyword-component-letter]
[fixture: c4/lex-keyword-component-lower] [fixture:
c4/lex-keyword-component-non-ascii] [fixture:
c4/lex-keyword-component-underscore] [fixture: c4/lex-keyword-component-upper]
[fixture: c4/lex-keyword-componentdb-dash] [fixture:
c4/lex-keyword-componentdb-digit] [fixture: c4/lex-keyword-componentdb-ext-dash]
[fixture: c4/lex-keyword-componentdb-ext-digit] [fixture:
c4/lex-keyword-componentdb-ext-letter] [fixture:
c4/lex-keyword-componentdb-ext-lower] [fixture:
c4/lex-keyword-componentdb-ext-non-ascii] [fixture:
c4/lex-keyword-componentdb-ext-underscore] [fixture:
c4/lex-keyword-componentdb-ext-upper] [fixture:
c4/lex-keyword-componentdb-letter] [fixture: c4/lex-keyword-componentdb-lower]
[fixture: c4/lex-keyword-componentdb-non-ascii] [fixture:
c4/lex-keyword-componentdb-underscore] [fixture:
c4/lex-keyword-componentdb-upper] [fixture: c4/lex-keyword-componentqueue-dash]
[fixture: c4/lex-keyword-componentqueue-digit] [fixture:
c4/lex-keyword-componentqueue-ext-dash] [fixture:
c4/lex-keyword-componentqueue-ext-digit] [fixture:
c4/lex-keyword-componentqueue-ext-letter] [fixture:
c4/lex-keyword-componentqueue-ext-lower] [fixture:
c4/lex-keyword-componentqueue-ext-non-ascii] [fixture:
c4/lex-keyword-componentqueue-ext-underscore] [fixture:
c4/lex-keyword-componentqueue-ext-upper] [fixture:
c4/lex-keyword-componentqueue-letter] [fixture:
c4/lex-keyword-componentqueue-lower] [fixture:
c4/lex-keyword-componentqueue-non-ascii] [fixture:
c4/lex-keyword-componentqueue-underscore] [fixture:
c4/lex-keyword-componentqueue-upper] [fixture:
c4/lex-keyword-container-boundary-dash] [fixture:
c4/lex-keyword-container-boundary-digit] [fixture:
c4/lex-keyword-container-boundary-letter] [fixture:
c4/lex-keyword-container-boundary-lower] [fixture:
c4/lex-keyword-container-boundary-non-ascii] [fixture:
c4/lex-keyword-container-boundary-underscore] [fixture:
c4/lex-keyword-container-boundary-upper] [fixture:
c4/lex-keyword-container-dash] [fixture: c4/lex-keyword-container-digit]
[fixture: c4/lex-keyword-container-ext-dash] [fixture:
c4/lex-keyword-container-ext-digit] [fixture:
c4/lex-keyword-container-ext-letter] [fixture:
c4/lex-keyword-container-ext-lower] [fixture:
c4/lex-keyword-container-ext-non-ascii] [fixture:
c4/lex-keyword-container-ext-underscore] [fixture:
c4/lex-keyword-container-ext-upper] [fixture: c4/lex-keyword-container-letter]
[fixture: c4/lex-keyword-container-lower] [fixture:
c4/lex-keyword-container-non-ascii] [fixture:
c4/lex-keyword-container-underscore] [fixture: c4/lex-keyword-container-upper]
[fixture: c4/lex-keyword-containerdb-dash] [fixture:
c4/lex-keyword-containerdb-digit] [fixture: c4/lex-keyword-containerdb-ext-dash]
[fixture: c4/lex-keyword-containerdb-ext-digit] [fixture:
c4/lex-keyword-containerdb-ext-letter] [fixture:
c4/lex-keyword-containerdb-ext-lower] [fixture:
c4/lex-keyword-containerdb-ext-non-ascii] [fixture:
c4/lex-keyword-containerdb-ext-underscore] [fixture:
c4/lex-keyword-containerdb-ext-upper] [fixture:
c4/lex-keyword-containerdb-letter] [fixture: c4/lex-keyword-containerdb-lower]
[fixture: c4/lex-keyword-containerdb-non-ascii] [fixture:
c4/lex-keyword-containerdb-underscore] [fixture:
c4/lex-keyword-containerdb-upper] [fixture: c4/lex-keyword-containerqueue-dash]
[fixture: c4/lex-keyword-containerqueue-digit] [fixture:
c4/lex-keyword-containerqueue-ext-dash] [fixture:
c4/lex-keyword-containerqueue-ext-digit] [fixture:
c4/lex-keyword-containerqueue-ext-letter] [fixture:
c4/lex-keyword-containerqueue-ext-lower] [fixture:
c4/lex-keyword-containerqueue-ext-non-ascii] [fixture:
c4/lex-keyword-containerqueue-ext-underscore] [fixture:
c4/lex-keyword-containerqueue-ext-upper] [fixture:
c4/lex-keyword-containerqueue-letter] [fixture:
c4/lex-keyword-containerqueue-lower] [fixture:
c4/lex-keyword-containerqueue-non-ascii] [fixture:
c4/lex-keyword-containerqueue-underscore] [fixture:
c4/lex-keyword-containerqueue-upper] [fixture:
c4/lex-keyword-deployment-node-dash] [fixture:
c4/lex-keyword-deployment-node-digit] [fixture:
c4/lex-keyword-deployment-node-letter] [fixture:
c4/lex-keyword-deployment-node-lower] [fixture:
c4/lex-keyword-deployment-node-non-ascii] [fixture:
c4/lex-keyword-deployment-node-underscore] [fixture:
c4/lex-keyword-deployment-node-upper] [fixture:
c4/lex-keyword-enterprise-boundary-dash] [fixture:
c4/lex-keyword-enterprise-boundary-digit] [fixture:
c4/lex-keyword-enterprise-boundary-letter] [fixture:
c4/lex-keyword-enterprise-boundary-lower] [fixture:
c4/lex-keyword-enterprise-boundary-non-ascii] [fixture:
c4/lex-keyword-enterprise-boundary-underscore] [fixture:
c4/lex-keyword-enterprise-boundary-upper] [fixture: c4/lex-keyword-node-dash]
[fixture: c4/lex-keyword-node-digit] [fixture: c4/lex-keyword-node-l-dash]
[fixture: c4/lex-keyword-node-l-digit] [fixture: c4/lex-keyword-node-l-letter]
[fixture: c4/lex-keyword-node-l-lower] [fixture:
c4/lex-keyword-node-l-non-ascii] [fixture: c4/lex-keyword-node-l-underscore]
[fixture: c4/lex-keyword-node-l-upper] [fixture: c4/lex-keyword-node-letter]
[fixture: c4/lex-keyword-node-lower] [fixture: c4/lex-keyword-node-non-ascii]
[fixture: c4/lex-keyword-node-r-dash] [fixture: c4/lex-keyword-node-r-digit]
[fixture: c4/lex-keyword-node-r-letter] [fixture: c4/lex-keyword-node-r-lower]
[fixture: c4/lex-keyword-node-r-non-ascii] [fixture:
c4/lex-keyword-node-r-underscore] [fixture: c4/lex-keyword-node-r-upper]
[fixture: c4/lex-keyword-node-underscore] [fixture: c4/lex-keyword-node-upper]
[fixture: c4/lex-keyword-person-dash] [fixture: c4/lex-keyword-person-digit]
[fixture: c4/lex-keyword-person-ext-dash] [fixture:
c4/lex-keyword-person-ext-digit] [fixture: c4/lex-keyword-person-ext-letter]
[fixture: c4/lex-keyword-person-ext-lower] [fixture:
c4/lex-keyword-person-ext-non-ascii] [fixture:
c4/lex-keyword-person-ext-underscore] [fixture: c4/lex-keyword-person-ext-upper]
[fixture: c4/lex-keyword-person-letter] [fixture: c4/lex-keyword-person-lower]
[fixture: c4/lex-keyword-person-non-ascii] [fixture:
c4/lex-keyword-person-underscore] [fixture: c4/lex-keyword-person-upper]
[fixture: c4/lex-keyword-rel-back-dash] [fixture: c4/lex-keyword-rel-back-digit]
[fixture: c4/lex-keyword-rel-back-letter] [fixture:
c4/lex-keyword-rel-back-lower] [fixture: c4/lex-keyword-rel-back-non-ascii]
[fixture: c4/lex-keyword-rel-back-underscore] [fixture:
c4/lex-keyword-rel-back-upper] [fixture: c4/lex-keyword-rel-d-dash] [fixture:
c4/lex-keyword-rel-d-digit] [fixture: c4/lex-keyword-rel-d-letter] [fixture:
c4/lex-keyword-rel-d-lower] [fixture: c4/lex-keyword-rel-d-non-ascii] [fixture:
c4/lex-keyword-rel-d-underscore] [fixture: c4/lex-keyword-rel-d-upper] [fixture:
c4/lex-keyword-rel-dash] [fixture: c4/lex-keyword-rel-digit] [fixture:
c4/lex-keyword-rel-down-dash] [fixture: c4/lex-keyword-rel-down-digit] [fixture:
c4/lex-keyword-rel-down-letter] [fixture: c4/lex-keyword-rel-down-lower]
[fixture: c4/lex-keyword-rel-down-non-ascii] [fixture:
c4/lex-keyword-rel-down-underscore] [fixture: c4/lex-keyword-rel-down-upper]
[fixture: c4/lex-keyword-rel-l-dash] [fixture: c4/lex-keyword-rel-l-digit]
[fixture: c4/lex-keyword-rel-l-letter] [fixture: c4/lex-keyword-rel-l-lower]
[fixture: c4/lex-keyword-rel-l-non-ascii] [fixture:
c4/lex-keyword-rel-l-underscore] [fixture: c4/lex-keyword-rel-l-upper] [fixture:
c4/lex-keyword-rel-left-dash] [fixture: c4/lex-keyword-rel-left-digit] [fixture:
c4/lex-keyword-rel-left-letter] [fixture: c4/lex-keyword-rel-left-lower]
[fixture: c4/lex-keyword-rel-left-non-ascii] [fixture:
c4/lex-keyword-rel-left-underscore] [fixture: c4/lex-keyword-rel-left-upper]
[fixture: c4/lex-keyword-rel-letter] [fixture: c4/lex-keyword-rel-lower]
[fixture: c4/lex-keyword-rel-non-ascii] [fixture: c4/lex-keyword-rel-r-dash]
[fixture: c4/lex-keyword-rel-r-digit] [fixture: c4/lex-keyword-rel-r-letter]
[fixture: c4/lex-keyword-rel-r-lower] [fixture: c4/lex-keyword-rel-r-non-ascii]
[fixture: c4/lex-keyword-rel-r-underscore] [fixture: c4/lex-keyword-rel-r-upper]
[fixture: c4/lex-keyword-rel-right-dash] [fixture:
c4/lex-keyword-rel-right-digit] [fixture: c4/lex-keyword-rel-right-letter]
[fixture: c4/lex-keyword-rel-right-lower] [fixture:
c4/lex-keyword-rel-right-non-ascii] [fixture:
c4/lex-keyword-rel-right-underscore] [fixture: c4/lex-keyword-rel-right-upper]
[fixture: c4/lex-keyword-rel-u-dash] [fixture: c4/lex-keyword-rel-u-digit]
[fixture: c4/lex-keyword-rel-u-letter] [fixture: c4/lex-keyword-rel-u-lower]
[fixture: c4/lex-keyword-rel-u-non-ascii] [fixture:
c4/lex-keyword-rel-u-underscore] [fixture: c4/lex-keyword-rel-u-upper] [fixture:
c4/lex-keyword-rel-underscore] [fixture: c4/lex-keyword-rel-up-dash] [fixture:
c4/lex-keyword-rel-up-digit] [fixture: c4/lex-keyword-rel-up-letter] [fixture:
c4/lex-keyword-rel-up-lower] [fixture: c4/lex-keyword-rel-up-non-ascii]
[fixture: c4/lex-keyword-rel-up-underscore] [fixture:
c4/lex-keyword-rel-up-upper] [fixture: c4/lex-keyword-rel-upper] [fixture:
c4/lex-keyword-relindex-dash] [fixture: c4/lex-keyword-relindex-digit] [fixture:
c4/lex-keyword-relindex-letter] [fixture: c4/lex-keyword-relindex-lower]
[fixture: c4/lex-keyword-relindex-non-ascii] [fixture:
c4/lex-keyword-relindex-underscore] [fixture: c4/lex-keyword-relindex-upper]
[fixture: c4/lex-keyword-system-boundary-dash] [fixture:
c4/lex-keyword-system-boundary-digit] [fixture:
c4/lex-keyword-system-boundary-letter] [fixture:
c4/lex-keyword-system-boundary-lower] [fixture:
c4/lex-keyword-system-boundary-non-ascii] [fixture:
c4/lex-keyword-system-boundary-underscore] [fixture:
c4/lex-keyword-system-boundary-upper] [fixture: c4/lex-keyword-system-dash]
[fixture: c4/lex-keyword-system-digit] [fixture: c4/lex-keyword-system-ext-dash]
[fixture: c4/lex-keyword-system-ext-digit] [fixture:
c4/lex-keyword-system-ext-letter] [fixture: c4/lex-keyword-system-ext-lower]
[fixture: c4/lex-keyword-system-ext-non-ascii] [fixture:
c4/lex-keyword-system-ext-underscore] [fixture: c4/lex-keyword-system-ext-upper]
[fixture: c4/lex-keyword-system-letter] [fixture: c4/lex-keyword-system-lower]
[fixture: c4/lex-keyword-system-non-ascii] [fixture:
c4/lex-keyword-system-underscore] [fixture: c4/lex-keyword-system-upper]
[fixture: c4/lex-keyword-systemdb-dash] [fixture: c4/lex-keyword-systemdb-digit]
[fixture: c4/lex-keyword-systemdb-ext-dash] [fixture:
c4/lex-keyword-systemdb-ext-digit] [fixture: c4/lex-keyword-systemdb-ext-letter]
[fixture: c4/lex-keyword-systemdb-ext-lower] [fixture:
c4/lex-keyword-systemdb-ext-non-ascii] [fixture:
c4/lex-keyword-systemdb-ext-underscore] [fixture:
c4/lex-keyword-systemdb-ext-upper] [fixture: c4/lex-keyword-systemdb-letter]
[fixture: c4/lex-keyword-systemdb-lower] [fixture:
c4/lex-keyword-systemdb-non-ascii] [fixture: c4/lex-keyword-systemdb-underscore]
[fixture: c4/lex-keyword-systemdb-upper] [fixture:
c4/lex-keyword-systemqueue-dash] [fixture: c4/lex-keyword-systemqueue-digit]
[fixture: c4/lex-keyword-systemqueue-ext-dash] [fixture:
c4/lex-keyword-systemqueue-ext-digit] [fixture:
c4/lex-keyword-systemqueue-ext-letter] [fixture:
c4/lex-keyword-systemqueue-ext-lower] [fixture:
c4/lex-keyword-systemqueue-ext-non-ascii] [fixture:
c4/lex-keyword-systemqueue-ext-underscore] [fixture:
c4/lex-keyword-systemqueue-ext-upper] [fixture:
c4/lex-keyword-systemqueue-letter] [fixture: c4/lex-keyword-systemqueue-lower]
[fixture: c4/lex-keyword-systemqueue-non-ascii] [fixture:
c4/lex-keyword-systemqueue-underscore] [fixture:
c4/lex-keyword-systemqueue-upper] [fixture: c4/lex-keyword-title-dash] [fixture:
c4/lex-keyword-title-digit] [fixture: c4/lex-keyword-title-letter] [fixture:
c4/lex-keyword-title-non-ascii] [fixture: c4/lex-keyword-title-underscore]
[fixture: c4/lex-keyword-title-upper] [fixture:
c4/lex-keyword-updateelementstyle-dash] [fixture:
c4/lex-keyword-updateelementstyle-digit] [fixture:
c4/lex-keyword-updateelementstyle-letter] [fixture:
c4/lex-keyword-updateelementstyle-lower] [fixture:
c4/lex-keyword-updateelementstyle-non-ascii] [fixture:
c4/lex-keyword-updateelementstyle-underscore] [fixture:
c4/lex-keyword-updateelementstyle-upper] [fixture:
c4/lex-keyword-updatelayoutconfig-dash] [fixture:
c4/lex-keyword-updatelayoutconfig-digit] [fixture:
c4/lex-keyword-updatelayoutconfig-letter] [fixture:
c4/lex-keyword-updatelayoutconfig-lower] [fixture:
c4/lex-keyword-updatelayoutconfig-non-ascii] [fixture:
c4/lex-keyword-updatelayoutconfig-underscore] [fixture:
c4/lex-keyword-updatelayoutconfig-upper] [fixture:
c4/lex-keyword-updaterelstyle-dash] [fixture:
c4/lex-keyword-updaterelstyle-digit] [fixture:
c4/lex-keyword-updaterelstyle-letter] [fixture:
c4/lex-keyword-updaterelstyle-lower] [fixture:
c4/lex-keyword-updaterelstyle-non-ascii] [fixture:
c4/lex-keyword-updaterelstyle-underscore] [fixture:
c4/lex-keyword-updaterelstyle-upper]

対応のない閉じ波括弧、
完結した呼出し直後の別の呼出しや単語、
完結した文の後のセミコロンは拒否される。
[fixture: c4/lex-after-boundary-call] [fixture:
c4/lex-after-boundary-double-close] [fixture:
c4/lex-after-boundary-double-semicolon] [fixture:
c4/lex-after-boundary-semicolon] [fixture:
c4/lex-after-boundary-semicolon-spaced] [fixture: c4/lex-after-boundary-word]
[fixture: c4/lex-after-component-call] [fixture:
c4/lex-after-component-double-close] [fixture:
c4/lex-after-component-double-semicolon] [fixture:
c4/lex-after-component-semicolon] [fixture:
c4/lex-after-component-semicolon-spaced] [fixture: c4/lex-after-component-word]
[fixture: c4/lex-after-container-call] [fixture:
c4/lex-after-container-double-close] [fixture:
c4/lex-after-container-double-semicolon] [fixture:
c4/lex-after-container-semicolon] [fixture:
c4/lex-after-container-semicolon-spaced] [fixture: c4/lex-after-container-word]
[fixture: c4/lex-after-element-style-call] [fixture:
c4/lex-after-element-style-double-close] [fixture:
c4/lex-after-element-style-double-semicolon] [fixture:
c4/lex-after-element-style-semicolon] [fixture:
c4/lex-after-element-style-semicolon-spaced] [fixture:
c4/lex-after-element-style-word] [fixture: c4/lex-after-index-call] [fixture:
c4/lex-after-index-double-close] [fixture: c4/lex-after-index-double-semicolon]
[fixture: c4/lex-after-index-semicolon] [fixture:
c4/lex-after-index-semicolon-spaced] [fixture: c4/lex-after-index-word]
[fixture: c4/lex-after-layout-call] [fixture: c4/lex-after-layout-double-close]
[fixture: c4/lex-after-layout-double-semicolon] [fixture:
c4/lex-after-layout-semicolon] [fixture: c4/lex-after-layout-semicolon-spaced]
[fixture: c4/lex-after-layout-word] [fixture: c4/lex-after-node-call] [fixture:
c4/lex-after-node-double-close] [fixture: c4/lex-after-node-double-semicolon]
[fixture: c4/lex-after-node-semicolon] [fixture:
c4/lex-after-node-semicolon-spaced] [fixture: c4/lex-after-node-word] [fixture:
c4/lex-after-person-call] [fixture: c4/lex-after-person-double-close] [fixture:
c4/lex-after-person-double-semicolon] [fixture: c4/lex-after-person-semicolon]
[fixture: c4/lex-after-person-semicolon-spaced] [fixture:
c4/lex-after-person-word] [fixture: c4/lex-after-rel-call] [fixture:
c4/lex-after-rel-double-close] [fixture: c4/lex-after-rel-double-semicolon]
[fixture: c4/lex-after-rel-semicolon] [fixture:
c4/lex-after-rel-semicolon-spaced] [fixture: c4/lex-after-rel-style-call]
[fixture: c4/lex-after-rel-style-double-close] [fixture:
c4/lex-after-rel-style-double-semicolon] [fixture:
c4/lex-after-rel-style-semicolon] [fixture:
c4/lex-after-rel-style-semicolon-spaced] [fixture: c4/lex-after-rel-style-word]
[fixture: c4/lex-after-rel-word] [fixture: c4/gram-unmatched-right-brace]
[fixture: c4/gram-unmatched-right-brace-after-person] [fixture:
c4/gram-two-statements-on-line] [fixture: c4/gram-title-adjacent-person]
[fixture: c4/gram-boundary-close-person-same-line]

最後の呼出しや境界の後の閉じた directive と、
二つの百分率記号のコメントは Db を変えず、
閉じていない百分率記号と波括弧の接尾辞も入力末尾まで除去され得る。
[fixture: c4/lex-after-boundary-comment] [fixture:
c4/lex-after-boundary-comment-glued] [fixture: c4/lex-after-boundary-directive]
[fixture: c4/lex-after-boundary-directive-unclosed] [fixture:
c4/lex-after-boundary-directive-word-unclosed] [fixture:
c4/lex-after-component-comment] [fixture: c4/lex-after-component-comment-glued]
[fixture: c4/lex-after-component-directive] [fixture:
c4/lex-after-component-directive-unclosed] [fixture:
c4/lex-after-component-directive-word-unclosed] [fixture:
c4/lex-after-container-comment] [fixture: c4/lex-after-container-comment-glued]
[fixture: c4/lex-after-container-directive] [fixture:
c4/lex-after-container-directive-unclosed] [fixture:
c4/lex-after-container-directive-word-unclosed] [fixture:
c4/lex-after-element-style-comment] [fixture:
c4/lex-after-element-style-comment-glued] [fixture:
c4/lex-after-element-style-directive] [fixture:
c4/lex-after-element-style-directive-unclosed] [fixture:
c4/lex-after-element-style-directive-word-unclosed] [fixture:
c4/lex-after-index-comment] [fixture: c4/lex-after-index-comment-glued]
[fixture: c4/lex-after-index-directive] [fixture:
c4/lex-after-index-directive-unclosed] [fixture:
c4/lex-after-index-directive-word-unclosed] [fixture:
c4/lex-after-layout-comment] [fixture: c4/lex-after-layout-comment-glued]
[fixture: c4/lex-after-layout-directive] [fixture:
c4/lex-after-layout-directive-unclosed] [fixture:
c4/lex-after-layout-directive-word-unclosed] [fixture:
c4/lex-after-node-comment] [fixture: c4/lex-after-node-comment-glued] [fixture:
c4/lex-after-node-directive] [fixture: c4/lex-after-node-directive-unclosed]
[fixture: c4/lex-after-node-directive-word-unclosed] [fixture:
c4/lex-after-person-comment] [fixture: c4/lex-after-person-comment-glued]
[fixture: c4/lex-after-person-directive] [fixture:
c4/lex-after-person-directive-unclosed] [fixture:
c4/lex-after-person-directive-word-unclosed] [fixture: c4/lex-after-rel-comment]
[fixture: c4/lex-after-rel-comment-glued] [fixture: c4/lex-after-rel-directive]
[fixture: c4/lex-after-rel-directive-unclosed] [fixture:
c4/lex-after-rel-directive-word-unclosed] [fixture:
c4/lex-after-rel-style-comment] [fixture: c4/lex-after-rel-style-comment-glued]
[fixture: c4/lex-after-rel-style-directive] [fixture:
c4/lex-after-rel-style-directive-unclosed] [fixture:
c4/lex-after-rel-style-directive-word-unclosed] [fixture:
c4/db-unclosed-directive-at-end] [fixture:
c4/lex-comment-unclosed-percent-brace]

ヘッダーと必須の改行の間の空でない単語や句読点の断片は拒否される。
[fixture: c4/gram-grid-ampersand-entity-header-line] [fixture:
c4/gram-grid-arrow-header-line] [fixture: c4/gram-grid-arrow-spaced-header-line]
[fixture: c4/gram-grid-backslash-header-line] [fixture:
c4/gram-grid-backtick-header-line] [fixture: c4/gram-grid-bom-header-line]
[fixture: c4/gram-grid-classdef-rule-header-line] [fixture:
c4/gram-grid-close-brace-header-line] [fixture:
c4/gram-grid-close-round-header-line] [fixture:
c4/gram-grid-close-square-header-line] [fixture: c4/gram-grid-colon-header-line]
[fixture: c4/gram-grid-comma-header-line] [fixture:
c4/gram-grid-comment-header-line] [fixture:
c4/gram-grid-comment-line-header-line] [fixture:
c4/gram-grid-constructor-header-line] [fixture: c4/gram-grid-cr-header-line]
[fixture: c4/gram-grid-crlf-header-line] [fixture:
c4/gram-grid-dash-header-line] [fixture: c4/gram-grid-digits-header-line]
[fixture: c4/gram-grid-directive-header-line] [fixture:
c4/gram-grid-directive-line-header-line] [fixture:
c4/gram-grid-emoji-header-line] [fixture: c4/gram-grid-entity-header-line]
[fixture: c4/gram-grid-entity-named-header-line] [fixture:
c4/gram-grid-equals-header-line] [fixture: c4/gram-grid-ff-header-line]
[fixture: c4/gram-grid-greater-than-header-line] [fixture:
c4/gram-grid-hash-header-line] [fixture: c4/gram-grid-html-header-line]
[fixture: c4/gram-grid-html-attribute-header-line] [fixture:
c4/gram-grid-html-br-header-line] [fixture:
c4/gram-grid-ideographic-header-line] [fixture:
c4/gram-grid-keyword-header-line] [fixture:
c4/gram-grid-keyword-block-header-line] [fixture:
c4/gram-grid-keyword-class-header-line] [fixture:
c4/gram-grid-keyword-classdef-header-line] [fixture:
c4/gram-grid-keyword-columns-header-line] [fixture:
c4/gram-grid-keyword-end-header-line] [fixture:
c4/gram-grid-keyword-header-header-line] [fixture:
c4/gram-grid-keyword-space-header-line] [fixture:
c4/gram-grid-keyword-style-header-line] [fixture:
c4/gram-grid-less-than-header-line] [fixture: c4/gram-grid-lf-header-line]
[fixture: c4/gram-grid-ls-header-line] [fixture: c4/gram-grid-nbsp-header-line]
[fixture: c4/gram-grid-nel-header-line] [fixture:
c4/gram-grid-nonascii-header-line] [fixture:
c4/gram-grid-open-brace-header-line] [fixture:
c4/gram-grid-open-round-header-line] [fixture:
c4/gram-grid-open-square-header-line] [fixture:
c4/gram-grid-percent-header-line] [fixture: c4/gram-grid-pipe-header-line]
[fixture: c4/gram-grid-proto-header-line] [fixture: c4/gram-grid-ps-header-line]
[fixture: c4/gram-grid-punct-header-line] [fixture:
c4/gram-grid-quote-header-line] [fixture: c4/gram-grid-root-header-line]
[fixture: c4/gram-grid-semicolon-header-line] [fixture:
c4/gram-grid-single-quote-header-line] [fixture:
c4/gram-grid-spaces-header-line] [fixture: c4/gram-grid-style-rule-header-line]
[fixture: c4/gram-grid-tab-header-line] [fixture: c4/gram-grid-vt-header-line]

文リスト内の direction トークンは、
同じ行に単語、
句読点、
空白、
引用符、
エンティティ、
directive があっても拒否される。
[fixture: c4/gram-grid-ampersand-entity-direction-line] [fixture:
c4/gram-grid-arrow-direction-line] [fixture:
c4/gram-grid-arrow-spaced-direction-line] [fixture:
c4/gram-grid-backslash-direction-line] [fixture:
c4/gram-grid-backtick-direction-line] [fixture: c4/gram-grid-bom-direction-line]
[fixture: c4/gram-grid-classdef-rule-direction-line] [fixture:
c4/gram-grid-close-brace-direction-line] [fixture:
c4/gram-grid-close-round-direction-line] [fixture:
c4/gram-grid-close-square-direction-line] [fixture:
c4/gram-grid-colon-direction-line] [fixture: c4/gram-grid-comma-direction-line]
[fixture: c4/gram-grid-comment-direction-line] [fixture:
c4/gram-grid-comment-line-direction-line] [fixture:
c4/gram-grid-constructor-direction-line] [fixture:
c4/gram-grid-cr-direction-line] [fixture: c4/gram-grid-crlf-direction-line]
[fixture: c4/gram-grid-dash-direction-line] [fixture:
c4/gram-grid-digits-direction-line] [fixture:
c4/gram-grid-directive-direction-line] [fixture:
c4/gram-grid-directive-line-direction-line] [fixture:
c4/gram-grid-emoji-direction-line] [fixture: c4/gram-grid-empty-direction-line]
[fixture: c4/gram-grid-entity-direction-line] [fixture:
c4/gram-grid-entity-named-direction-line] [fixture:
c4/gram-grid-equals-direction-line] [fixture: c4/gram-grid-ff-direction-line]
[fixture: c4/gram-grid-greater-than-direction-line] [fixture:
c4/gram-grid-hash-direction-line] [fixture: c4/gram-grid-html-direction-line]
[fixture: c4/gram-grid-html-attribute-direction-line] [fixture:
c4/gram-grid-html-br-direction-line] [fixture:
c4/gram-grid-ideographic-direction-line] [fixture:
c4/gram-grid-keyword-direction-line] [fixture:
c4/gram-grid-keyword-block-direction-line] [fixture:
c4/gram-grid-keyword-class-direction-line] [fixture:
c4/gram-grid-keyword-classdef-direction-line] [fixture:
c4/gram-grid-keyword-columns-direction-line] [fixture:
c4/gram-grid-keyword-end-direction-line] [fixture:
c4/gram-grid-keyword-header-direction-line] [fixture:
c4/gram-grid-keyword-space-direction-line] [fixture:
c4/gram-grid-keyword-style-direction-line] [fixture:
c4/gram-grid-less-than-direction-line] [fixture: c4/gram-grid-lf-direction-line]
[fixture: c4/gram-grid-ls-direction-line] [fixture:
c4/gram-grid-nbsp-direction-line] [fixture: c4/gram-grid-nel-direction-line]
[fixture: c4/gram-grid-nonascii-direction-line] [fixture:
c4/gram-grid-open-brace-direction-line] [fixture:
c4/gram-grid-open-round-direction-line] [fixture:
c4/gram-grid-open-square-direction-line] [fixture:
c4/gram-grid-percent-direction-line] [fixture: c4/gram-grid-pipe-direction-line]
[fixture: c4/gram-grid-proto-direction-line] [fixture:
c4/gram-grid-ps-direction-line] [fixture: c4/gram-grid-punct-direction-line]
[fixture: c4/gram-grid-quote-direction-line] [fixture:
c4/gram-grid-root-direction-line] [fixture:
c4/gram-grid-semicolon-direction-line] [fixture:
c4/gram-grid-single-quote-direction-line] [fixture:
c4/gram-grid-spaces-direction-line] [fixture:
c4/gram-grid-style-rule-direction-line] [fixture:
c4/gram-grid-tab-direction-line] [fixture: c4/gram-grid-vt-direction-line]

ヘッダーは大文字小文字を区別し、
小文字、
大文字、
混合した綴りと、
単語、
数字、
下線、
ハイフン、
ASCII 外の文字の直結した接尾辞は拒否される。
[fixture: c4/header-component-dash-suffix] [fixture:
c4/header-component-digit-suffix] [fixture:
c4/header-component-glued-keyword-suffix] [fixture: c4/header-component-lower]
[fixture: c4/header-component-mixed] [fixture:
c4/header-component-non-ascii-suffix] [fixture:
c4/header-component-underscore-suffix] [fixture: c4/header-component-upper]
[fixture: c4/header-component-word-suffix] [fixture:
c4/header-container-dash-suffix] [fixture: c4/header-container-digit-suffix]
[fixture: c4/header-container-glued-keyword-suffix] [fixture:
c4/header-container-lower] [fixture: c4/header-container-mixed] [fixture:
c4/header-container-non-ascii-suffix] [fixture:
c4/header-container-underscore-suffix] [fixture: c4/header-container-upper]
[fixture: c4/header-container-word-suffix] [fixture:
c4/header-context-dash-suffix] [fixture: c4/header-context-digit-suffix]
[fixture: c4/header-context-glued-keyword-suffix] [fixture:
c4/header-context-lower] [fixture: c4/header-context-mixed] [fixture:
c4/header-context-non-ascii-suffix] [fixture:
c4/header-context-underscore-suffix] [fixture: c4/header-context-upper]
[fixture: c4/header-context-word-suffix] [fixture:
c4/header-deployment-dash-suffix] [fixture: c4/header-deployment-digit-suffix]
[fixture: c4/header-deployment-glued-keyword-suffix] [fixture:
c4/header-deployment-lower] [fixture: c4/header-deployment-mixed] [fixture:
c4/header-deployment-non-ascii-suffix] [fixture:
c4/header-deployment-underscore-suffix] [fixture: c4/header-deployment-upper]
[fixture: c4/header-deployment-word-suffix] [fixture:
c4/header-dynamic-dash-suffix] [fixture: c4/header-dynamic-digit-suffix]
[fixture: c4/header-dynamic-glued-keyword-suffix] [fixture:
c4/header-dynamic-lower] [fixture: c4/header-dynamic-mixed] [fixture:
c4/header-dynamic-non-ascii-suffix] [fixture:
c4/header-dynamic-underscore-suffix] [fixture: c4/header-dynamic-upper]
[fixture: c4/header-dynamic-word-suffix]

ヘッダー前の空行、
空白だけの行、
コメント行、
directive 行、
有効な frontmatter は図と C4 の型を変えない。
[fixture: c4/header-after-bare-percent-line] [fixture:
c4/header-after-blank-lines] [fixture: c4/header-after-comment-line] [fixture:
c4/header-after-directive-line] [fixture: c4/header-after-empty-braces-line]
[fixture: c4/header-after-frontmatter-and-comment] [fixture:
c4/header-after-whitespace-line]

先頭のハッシュ行、
セミコロン行、
単一の百分率記号の行は C4 コメントではなく、
入力を拒否する。
[fixture: c4/header-after-hash-line] [fixture: c4/header-after-semicolon-line]
[fixture: c4/lex-comment-hash] [fixture: c4/lex-comment-single-percent]

不正な frontmatter の YAML は C4 要約ができる前に入力を拒否する。
[fixture: c4/div-frontmatter-invalid-yaml]

ヘッダー前の二つの百分率記号だけの行は、
直後がヘッダーか空行なら受理されるが、
スペースを含む行が続くと除去されず入力を拒否することがある。
[fixture: c4/header-after-bare-percent-line] [fixture:
c4/header-leading-percent-before-different-header] [fixture:
c4/header-leading-percent-blank] [fixture: c4/div-leading-percent-space-blank]

文の周囲と空白だけの行のタブ、
FF、
VT、
NBSP、
U+3000、
U+FEFF、
U+2028、
U+2029 は無視し、
CR と CRLF は文を区切ることができる。
[fixture: c4/lex-bom-after-header] [fixture: c4/lex-bom-before-header] [fixture:
c4/lex-bom-line-end] [fixture: c4/lex-bom-line-start] [fixture:
c4/lex-bom-text-end] [fixture: c4/lex-bom-whitespace-between] [fixture:
c4/lex-bom-whitespace-first] [fixture: c4/lex-bom-whitespace-last] [fixture:
c4/lex-cr-after-header] [fixture: c4/lex-cr-before-header] [fixture:
c4/lex-cr-between-statements] [fixture: c4/lex-cr-line-end] [fixture:
c4/lex-cr-line-start] [fixture: c4/lex-cr-text-end] [fixture:
c4/lex-cr-whitespace-between] [fixture: c4/lex-cr-whitespace-first] [fixture:
c4/lex-cr-whitespace-last] [fixture: c4/lex-crlf-after-header] [fixture:
c4/lex-crlf-before-header] [fixture: c4/lex-crlf-line-end] [fixture:
c4/lex-crlf-text-end] [fixture: c4/lex-crlf-whitespace-between] [fixture:
c4/lex-crlf-whitespace-first] [fixture: c4/lex-crlf-whitespace-last] [fixture:
c4/lex-ff-after-header] [fixture: c4/lex-ff-before-header] [fixture:
c4/lex-ff-line-end] [fixture: c4/lex-ff-line-start] [fixture:
c4/lex-ff-text-end] [fixture: c4/lex-ff-whitespace-between] [fixture:
c4/lex-ff-whitespace-first] [fixture: c4/lex-ff-whitespace-last] [fixture:
c4/lex-ideographic-after-header] [fixture: c4/lex-ideographic-before-header]
[fixture: c4/lex-ideographic-line-end] [fixture: c4/lex-ideographic-line-start]
[fixture: c4/lex-ideographic-text-end] [fixture:
c4/lex-ideographic-whitespace-between] [fixture:
c4/lex-ideographic-whitespace-first] [fixture:
c4/lex-ideographic-whitespace-last] [fixture: c4/lex-ls-after-header] [fixture:
c4/lex-ls-before-header] [fixture: c4/lex-ls-line-end] [fixture:
c4/lex-ls-line-start] [fixture: c4/lex-ls-text-end] [fixture:
c4/lex-ls-whitespace-between] [fixture: c4/lex-ls-whitespace-first] [fixture:
c4/lex-ls-whitespace-last] [fixture: c4/lex-nbsp-after-header] [fixture:
c4/lex-nbsp-before-header] [fixture: c4/lex-nbsp-line-end] [fixture:
c4/lex-nbsp-line-start] [fixture: c4/lex-nbsp-text-end] [fixture:
c4/lex-nbsp-whitespace-between] [fixture: c4/lex-nbsp-whitespace-first]
[fixture: c4/lex-nbsp-whitespace-last] [fixture: c4/lex-ps-after-header]
[fixture: c4/lex-ps-before-header] [fixture: c4/lex-ps-line-end] [fixture:
c4/lex-ps-line-start] [fixture: c4/lex-ps-text-end] [fixture:
c4/lex-ps-whitespace-between] [fixture: c4/lex-ps-whitespace-first] [fixture:
c4/lex-ps-whitespace-last] [fixture: c4/lex-tab-after-header] [fixture:
c4/lex-tab-before-header] [fixture: c4/lex-tab-line-end] [fixture:
c4/lex-tab-line-start] [fixture: c4/lex-tab-text-end] [fixture:
c4/lex-tab-whitespace-between] [fixture: c4/lex-tab-whitespace-first] [fixture:
c4/lex-tab-whitespace-last] [fixture: c4/lex-vt-after-header] [fixture:
c4/lex-vt-before-header] [fixture: c4/lex-vt-line-end] [fixture:
c4/lex-vt-line-start] [fixture: c4/lex-vt-text-end] [fixture:
c4/lex-vt-whitespace-between] [fixture: c4/lex-vt-whitespace-first] [fixture:
c4/lex-vt-whitespace-last]

タブ、
FF、
VT、
NBSP、
U+3000、
U+FEFF、
U+2028、
U+2029 だけでは二つの図の文を区切れない。
[fixture: c4/lex-bom-between-statements] [fixture: c4/lex-ff-between-statements]
[fixture: c4/lex-ideographic-between-statements] [fixture:
c4/lex-ls-between-statements] [fixture: c4/lex-nbsp-between-statements]
[fixture: c4/lex-ps-between-statements] [fixture: c4/lex-tab-between-statements]
[fixture: c4/lex-vt-between-statements]

テキスト引数の外の U+0085 は空白ではなく、
ヘッダーの前と他に文字のない行も含めて入力を拒否する。
[fixture: c4/lex-nel-after-header] [fixture: c4/lex-nel-before-header] [fixture:
c4/lex-nel-between-statements] [fixture: c4/lex-nel-line-end] [fixture:
c4/lex-nel-line-start] [fixture: c4/lex-nel-text-end] [fixture:
c4/lex-nel-whitespace-between] [fixture: c4/lex-nel-whitespace-first] [fixture:
c4/lex-nel-whitespace-last]

ヘッダーや図の文の後の同じ行の二つの百分率記号のコメントは改行を消費し、
間に空行があっても後続の文や境界の開きを拒否させることがある。
[fixture: c4/header-component-comment-glued] [fixture:
c4/header-component-comment-on-header-line] [fixture:
c4/header-container-comment-glued] [fixture:
c4/header-container-comment-on-header-line] [fixture:
c4/header-context-comment-glued] [fixture:
c4/header-context-comment-on-header-line] [fixture:
c4/header-deployment-comment-glued] [fixture:
c4/header-deployment-comment-on-header-line] [fixture:
c4/header-dynamic-comment-glued] [fixture:
c4/header-dynamic-comment-on-header-line] [fixture:
c4/header-header-comment-eof] [fixture: c4/div-header-comment-blank-recovery]
[fixture: c4/div-comment-between-joined-statements] [fixture:
c4/div-comment-between-blank-recovery] [fixture:
c4/div-boundary-comment-before-inline-body] [fixture:
c4/div-boundary-comment-before-next-statement] [fixture:
c4/div-diagram-comment-u2028] [fixture: c4/div-diagram-comment-u2029]

同じ行のコメントの後の空白だけの行は、
失われた改行を供給して後続の文を再び受理させることがある。
[fixture: c4/header-header-comment-spaces-recovery] [fixture:
c4/lex-comment-between-spaces-recovery]

境界の閉じ波括弧は子の直後と、
間の改行を消費したコメントの後に置ける。
[fixture: c4/gram-boundary-close-without-newline] [fixture:
c4/lex-comment-before-close]

通常の文の行では、
小文字の `direction` と空白と `TB`、
`BT`、
`RL`、
`LR` の組が、
題名、
要素、
境界、
説明の開始、
同じ行のコメントより優先し、
長い単語内の一致と後続の文字も含む。
[fixture: c4/gram-direction-bt-inside-label] [fixture:
c4/gram-direction-bt-line] [fixture: c4/gram-direction-bt-prefix] [fixture:
c4/gram-direction-comment] [fixture:
c4/gram-direction-in-description-opening-line] [fixture:
c4/gram-direction-inside-longer-word] [fixture:
c4/gram-direction-lr-inside-label] [fixture: c4/gram-direction-lr-line]
[fixture: c4/gram-direction-lr-prefix] [fixture:
c4/gram-direction-rl-inside-label] [fixture: c4/gram-direction-rl-line]
[fixture: c4/gram-direction-rl-prefix] [fixture: c4/gram-direction-suffix-ls]
[fixture: c4/gram-direction-suffix-u2029] [fixture: c4/gram-direction-tb]
[fixture: c4/gram-direction-tb-inside-label] [fixture:
c4/gram-direction-tb-line] [fixture: c4/gram-direction-tb-prefix] [fixture:
c4/gram-title-direction] [fixture: c4/gram-boundary-direction] [fixture:
c4/gram-boundary-next-line-direction]

大文字の DIRECTION、
小文字の方向値、
次の行の方向値も図の文とならず拒否されるが、
小文字の `direction tb` は題名の中では文字のまま残る。
[fixture: c4/gram-direction-bt-lower-value] [fixture:
c4/gram-direction-bt-upper] [fixture: c4/gram-direction-lr-lower-value]
[fixture: c4/gram-direction-lr-upper] [fixture:
c4/gram-direction-rl-lower-value] [fixture: c4/gram-direction-rl-upper]
[fixture: c4/gram-direction-tb-lower-value] [fixture:
c4/gram-direction-tb-upper] [fixture: c4/gram-direction-value-next-line]
[fixture: c4/gram-title-lower-direction]

開いた引用符付き引数、
引用符なし引数、
説明ブロックの後の行の direction は文字のまま残り、
解析前に除去された direction のコメント行全体も何も変えない。
[fixture: c4/lex-quote-multiline-direction] [fixture:
c4/lex-bare-multiline-direction] [fixture:
c4/lex-direction-in-multiline-description-block] [fixture:
c4/gram-direction-comment-removed]

direction の前の U+2028 と U+2029 は同じ行の前置文字への一致を止め、
その区切りの後の題名や引用符付き引数は `direction TB` を文字のまま保持できる。
[fixture: c4/gram-title-direction-after-ls] [fixture:
c4/gram-title-direction-after-ps] [fixture: c4/lex-quoted-direction-after-ls]
[fixture: c4/lex-title-value-ls]

呼出しの前の行の閉じていない init directive は、
init の後のコロンの有無によらず拒否される。
[fixture: c4/lex-directive-unclosed-next-line] [fixture:
c4/lex-directive-colon-unclosed-next-line]

### 位置引数と名前付き属性

名前付きの alias や端点の上書きは後の定義の検索キーを変え、
境界の子は上書き前に選ばれた親 alias を保持する。
[fixture: c4/db-shape-alias-named-change] [fixture:
c4/db-rel-endpoint-named-change] [fixture: c4/db-boundary-alias-named-change]

名前付きキーは大文字と小文字を区別し、
`$Tags` と `$tags` は別の属性となる。
[fixture: c4/db-named-case-sensitive]

Person と System の外部、
データベース、
キュー形式も含む位置引数は、
`alias`、
`label.text`、
`descr.text`、
`sprite`、
`tags`、
`link` の順に対応する。
[fixture: c4/db-keyword-person-ext] [fixture: c4/db-keyword-person] [fixture:
c4/db-keyword-systemqueue-ext] [fixture: c4/db-keyword-systemdb-ext] [fixture:
c4/db-keyword-system-ext] [fixture: c4/db-keyword-systemqueue] [fixture:
c4/db-keyword-systemdb] [fixture: c4/db-keyword-system]
[fixture: c4/spec-c4-diagram-f0d3f937]
[fixture: c4/spec-c4-person-658cf221]
[fixture: c4/spec-c4-person-a1d68b7d]
[fixture: c4/spec-c4-person-ext-31a32f69]
[fixture: c4/spec-c4-person-ext-cde14a2b]
[fixture: c4/spec-c4-system-4d9f1bce]
[fixture: c4/spec-c4-system-553fd5b2]
[fixture: c4/spec-c4-system-5e851605]
[fixture: c4/spec-c4-system-61b143cb]
[fixture: c4/spec-c4-system-62c3dca2]
[fixture: c4/spec-c4-system-7e1bd7e9]
[fixture: c4/spec-c4-system-7f4c3d18]
[fixture: c4/spec-c4-system-84ca45f9]
[fixture: c4/spec-c4-system-af636454]
[fixture: c4/spec-c4-system-b5a30fc8]
[fixture: c4/spec-c4-system-ca506508]
[fixture: c4/spec-c4-system-f240d0bd]

`Boundary` の位置引数は、
`alias`、
`label.text`、
`type.text`、
`tags`、
`link` の順に対応する。
[fixture: c4/db-keyword-boundary]
[fixture: c4/spec-c4-boundary-08686298]
[fixture: c4/spec-c4-boundary-8c562ee4]

`Enterprise_Boundary`、
`System_Boundary`、
`Container_Boundary` の位置引数は、
`alias`、
`label.text`、
`tags`、
`link` の順に対応する。
[fixture: c4/db-keyword-enterprise-boundary] [fixture:
c4/db-keyword-system-boundary] [fixture: c4/db-keyword-container-boundary]

Container と Component の外部、
データベース、
キュー形式も含む位置引数は、
`alias`、
`label.text`、
`techn.text`、
`descr.text`、
`sprite`、
`tags`、
`link` の順に対応する。
[fixture: c4/db-keyword-containerqueue-ext] [fixture:
c4/db-keyword-containerdb-ext] [fixture: c4/db-keyword-container-ext] [fixture:
c4/db-keyword-containerqueue] [fixture: c4/db-keyword-containerdb] [fixture:
c4/db-keyword-container] [fixture: c4/db-keyword-componentqueue-ext] [fixture:
c4/db-keyword-componentdb-ext] [fixture: c4/db-keyword-component-ext] [fixture:
c4/db-keyword-componentqueue] [fixture: c4/db-keyword-componentdb] [fixture:
c4/db-keyword-component]
[fixture: c4/docs-syntax-c4-e233a726]
[fixture: c4/spec-c4-component-67febb82]
[fixture: c4/spec-c4-component-82a9b2bd]
[fixture: c4/spec-c4-component-bd0e301a]
[fixture: c4/spec-c4-component-e0ffc102]
[fixture: c4/spec-c4-component-ef7ed092]
[fixture: c4/spec-c4-component-f8fbb57a]
[fixture: c4/spec-c4-container-04b94850]
[fixture: c4/spec-c4-container-06e57d08]
[fixture: c4/spec-c4-container-0979e261]
[fixture: c4/spec-c4-container-0c888a1d]
[fixture: c4/spec-c4-container-29db0dde]
[fixture: c4/spec-c4-container-40136510]
[fixture: c4/spec-c4-container-650b0e8f]
[fixture: c4/spec-c4-container-79b6a78b]
[fixture: c4/spec-c4-container-7a65e408]
[fixture: c4/spec-c4-container-85b656fa]
[fixture: c4/spec-c4-container-8a22d744]
[fixture: c4/spec-c4-container-98760505]
[fixture: c4/spec-c4-container-9f732139]
[fixture: c4/spec-c4-container-a087a6ea]
[fixture: c4/spec-c4-container-a5979794]
[fixture: c4/spec-c4-container-a5b85126]
[fixture: c4/spec-c4-container-aa32c573]
[fixture: c4/spec-c4-container-bbf08ef2]
[fixture: c4/spec-c4-container-cef673d4]
[fixture: c4/spec-c4-container-db66cc1e]
[fixture: c4/spec-c4-container-e174083e]
[fixture: c4/spec-c4-container-e58a9a00]
[fixture: c4/spec-c4-container-eae6e364]
[fixture: c4/spec-c4-container-fd30d76e]

`Deployment_Node`、
`Node`、
`Node_L`、
`Node_R` の位置引数は、
`alias`、
`label.text`、
`type.text`、
`descr.text`、
`ignored sprite`、
`tags`、
`link` の順に対応する。
[fixture: c4/db-keyword-deployment-node] [fixture: c4/db-keyword-node] [fixture:
c4/db-keyword-node-l] [fixture: c4/db-keyword-node-r]
[fixture: c4/demo-c4context-1d531a27]
[fixture: c4/docs-syntax-c4-90f106b9]

RelIndex 以外の関係キーワードの位置引数は、
`from`、
`to`、
`label.text`、
`techn.text`、
`descr.text`、
`sprite`、
`tags`、
`link` の順に対応する。
[fixture: c4/db-keyword-rel] [fixture: c4/db-keyword-birel] [fixture:
c4/db-keyword-rel-up] [fixture: c4/db-keyword-rel-u] [fixture:
c4/db-keyword-rel-down] [fixture: c4/db-keyword-rel-d] [fixture:
c4/db-keyword-rel-left] [fixture: c4/db-keyword-rel-l] [fixture:
c4/db-keyword-rel-right] [fixture: c4/db-keyword-rel-r] [fixture:
c4/db-keyword-rel-back]
[fixture: c4/spec-c4-boundary-e7bc47fe]

`RelIndex` の位置引数は、
`discarded index`、
`from`、
`to`、
`label.text`、
`techn.text`、
`descr.text`、
`sprite`、
`tags`、
`link` の順に対応する。
[fixture: c4/db-keyword-relindex]

`UpdateElementStyle` の位置引数は、
`target alias`、
`bgColor`、
`fontColor`、
`borderColor`、
`shadowing`、
`shape`、
`sprite`、
`techn`、
`legendText`、
`legendSprite` の順に対応する。
[fixture: c4/db-keyword-updateelementstyle]

`UpdateRelStyle` の位置引数は、
`target from`、
`target to`、
`textColor`、
`lineColor`、
`offsetX`、
`offsetY` の順に対応する。
[fixture: c4/db-keyword-updaterelstyle]

`UpdateLayoutConfig` の位置引数は、
`c4ShapeInRow`、
`c4BoundaryInRow` の順に対応する。
[fixture: c4/db-keyword-updatelayoutconfig]

型が固定の境界は `ENTERPRISE`、
`SYSTEM`、
`CONTAINER` を設定し、
`Node` と `Deployment_Node` の nodeType は `node`、
`Node_L` は `nodeL`、
`Node_R` は `nodeR` となる。
[fixture: c4/db-keyword-enterprise-boundary] [fixture:
c4/db-keyword-system-boundary] [fixture: c4/db-keyword-container-boundary]
[fixture: c4/db-keyword-node] [fixture: c4/db-keyword-deployment-node] [fixture:
c4/db-keyword-node-l] [fixture: c4/db-keyword-node-r]
[fixture: c4/docs-syntax-c4-bc80e69a]

`Person` と `Person_Ext` は `typeC4Shape.text` をそれぞれ
`person` と `external_person` にする。
[fixture: c4/db-keyword-person] [fixture: c4/db-keyword-person-ext]
[fixture: c4/spec-c4-person-c3534964]
[fixture: c4/spec-c4-person-ext-403c6383]

`System`、
`SystemDb`、
`SystemQueue` の図形種別は、
`system`、
`system_db`、
`system_queue` であり、
`_Ext` 形式は種別の先頭へ `external_` を付ける。
[fixture: c4/db-keyword-system] [fixture: c4/db-keyword-systemdb] [fixture:
c4/db-keyword-systemqueue] [fixture: c4/db-keyword-system-ext] [fixture:
c4/db-keyword-systemdb-ext] [fixture: c4/db-keyword-systemqueue-ext]
[fixture: c4/spec-c4-system-4c688f50]
[fixture: c4/spec-c4-system-6500d002]
[fixture: c4/spec-c4-system-8ae77b48]
[fixture: c4/spec-c4-system-9c3b4db9]
[fixture: c4/spec-c4-system-cb5e70a4]
[fixture: c4/spec-c4-system-eb1a0dc9]

`Container`、
`ContainerDb`、
`ContainerQueue` の図形種別は、
`container`、
`container_db`、
`container_queue` であり、
`_Ext` 形式は種別の先頭へ `external_` を付ける。
[fixture: c4/db-keyword-container] [fixture: c4/db-keyword-containerdb]
[fixture: c4/db-keyword-containerqueue] [fixture: c4/db-keyword-container-ext]
[fixture: c4/db-keyword-containerdb-ext] [fixture:
c4/db-keyword-containerqueue-ext]
[fixture: c4/demo-c4context-b284cb21]
[fixture: c4/docs-syntax-c4-96b1a834]
[fixture: c4/spec-c4-container-40136510]
[fixture: c4/spec-c4-container-7a65e408]
[fixture: c4/spec-c4-container-8a22d744]
[fixture: c4/spec-c4-container-aa32c573]
[fixture: c4/spec-c4-container-bbf08ef2]
[fixture: c4/spec-c4-container-e58a9a00]

`Component`、
`ComponentDb`、
`ComponentQueue` の図形種別は、
`component`、
`component_db`、
`component_queue` であり、
`_Ext` 形式は種別の先頭へ `external_` を付ける。
[fixture: c4/db-keyword-component] [fixture: c4/db-keyword-componentdb]
[fixture: c4/db-keyword-componentqueue] [fixture: c4/db-keyword-component-ext]
[fixture: c4/db-keyword-componentdb-ext] [fixture:
c4/db-keyword-componentqueue-ext]
[fixture: c4/docs-syntax-c4-e233a726]
[fixture: c4/spec-c4-component-0da5aed2]
[fixture: c4/spec-c4-component-469fb648]
[fixture: c4/spec-c4-component-67febb82]
[fixture: c4/spec-c4-component-82a9b2bd]
[fixture: c4/spec-c4-component-a8988ac2]
[fixture: c4/spec-c4-component-bd0e301a]
[fixture: c4/spec-c4-component-d1298236]
[fixture: c4/spec-c4-component-e0ffc102]
[fixture: c4/spec-c4-component-ebbe1176]
[fixture: c4/spec-c4-component-ef7ed092]
[fixture: c4/spec-c4-component-f06e3225]
[fixture: c4/spec-c4-component-f8fbb57a]

`Rel` と `RelIndex` の type は `rel`、
`BiRel` は `birel`、
短形と長形の方向指定は `rel_u`、
`rel_d`、
`rel_l`、
`rel_r`、
`Rel_Back` は `rel_b` となる。
[fixture: c4/db-keyword-rel] [fixture: c4/db-keyword-relindex] [fixture:
c4/db-keyword-birel] [fixture: c4/db-keyword-rel-u] [fixture:
c4/db-keyword-rel-up] [fixture: c4/db-keyword-rel-d] [fixture:
c4/db-keyword-rel-down] [fixture: c4/db-keyword-rel-l] [fixture:
c4/db-keyword-rel-left] [fixture: c4/db-keyword-rel-r] [fixture:
c4/db-keyword-rel-right] [fixture: c4/db-keyword-rel-back]
[fixture: c4/demo-c4context-49481a12]

一つのコンマは引数を区切り、
先頭のコンマと `,,` トークンは空引数を一つ供給し、
隣接する引用符付き引数と名前付き引数にコンマは不要となる。
[fixture: c4/lex-arguments-no-comma] [fixture:
c4/lex-arguments-spaces-between-strings] [fixture: c4/lex-arguments-many-commas]
[fixture: c4/lex-double-comma] [fixture: c4/lex-trailing-comma] [fixture:
c4/lex-empty-before-named] [fixture: c4/lex-quoted-empty-before-bare] [fixture:
c4/gram-person-comma-only] [fixture: c4/gram-person-one-empty-string]

引用符なしの引数は閉じ括弧や改行も含めて次のコンマまでを取り、
最後の引用符なし引数にも後続のコンマが必要となる。
[fixture: c4/gram-arguments-bare-final] [fixture:
c4/gram-arguments-bare-final-before-comma] [fixture:
c4/lex-bare-last-with-comma] [fixture: c4/lex-bare-across-close-and-line]
[fixture: c4/lex-unclosed-parenthesis] [fixture: c4/lex-missing-comma] [fixture:
c4/gram-arguments-person-bare] [fixture: c4/gram-arguments-container-bare]
[fixture: c4/gram-arguments-component-bare] [fixture:
c4/gram-arguments-boundary-bare] [fixture: c4/gram-arguments-node-bare]
[fixture: c4/gram-arguments-rel-bare] [fixture: c4/gram-arguments-index-bare]
[fixture: c4/gram-arguments-element-style-bare] [fixture:
c4/gram-arguments-rel-style-bare] [fixture: c4/gram-arguments-layout-bare]

先頭のタブや長い引用符なしの断片が後続の引用符やドル記号より優先し、
引用符とドル記号は引用符なしの文字列内に残る。
[fixture: c4/lex-bare-tab-before-quote] [fixture:
c4/lex-bare-before-dollar-is-text] [fixture:
c4/lex-empty-description-form-in-bare-argument]

省略した任意引数は Db の既定値を使い、
空の必須ラベルは空のまま保持し、
端点やラベルが欠ける関係は何も追加しない。
[fixture: c4/gram-rel-too-few-quoted] [fixture: c4/gram-rel-empty-label]
[fixture: c4/gram-arguments-boundary-below] [fixture:
c4/gram-arguments-boundary-empty] [fixture: c4/gram-arguments-component-below]
[fixture: c4/gram-arguments-component-empty] [fixture:
c4/gram-arguments-container-below] [fixture: c4/gram-arguments-container-empty]
[fixture: c4/gram-arguments-element-style-below] [fixture:
c4/gram-arguments-element-style-empty] [fixture: c4/gram-arguments-index-below]
[fixture: c4/gram-arguments-index-empty] [fixture: c4/gram-arguments-index-one]
[fixture: c4/gram-arguments-layout-empty] [fixture:
c4/gram-arguments-layout-one] [fixture: c4/gram-arguments-node-below] [fixture:
c4/gram-arguments-node-empty] [fixture: c4/gram-arguments-person-below]
[fixture: c4/gram-arguments-person-empty] [fixture: c4/gram-arguments-rel-below]
[fixture: c4/gram-arguments-rel-empty] [fixture:
c4/gram-arguments-rel-style-below] [fixture: c4/gram-arguments-rel-style-empty]

端点やラベルの欠落の検査は、
`RelIndex` が index を捨てた後にも適用し、
指定された空文字列は引数として数える。
[fixture: c4/gram-arguments-index-one] [fixture: c4/gram-rel-too-few-quoted]
[fixture: c4/gram-rel-empty-label] [fixture: c4/gram-arguments-rel-empty]

呼出しの括弧や引用符の欠落は、
先行する引用符なし引数が見かけ上の呼出しを文字列へ取り込む場合を除き拒否される。
[fixture: c4/gram-arguments-boundary-missing-close] [fixture:
c4/gram-arguments-component-missing-close] [fixture:
c4/gram-arguments-container-missing-close] [fixture:
c4/gram-arguments-element-style-missing-close] [fixture:
c4/gram-arguments-index-missing-close] [fixture:
c4/gram-arguments-layout-missing-close] [fixture:
c4/gram-arguments-node-missing-close] [fixture:
c4/gram-arguments-person-missing-close] [fixture:
c4/gram-arguments-rel-missing-close] [fixture:
c4/gram-arguments-rel-style-missing-close] [fixture: c4/lex-missing-open]
[fixture: c4/lex-unclosed-quote] [fixture: c4/lex-unclosed-named]

コンマは引用符なしの位置引数を終え、
RelIndex の index の後の端点も含めて残りの引数をずらす。
[fixture: c4/db-grid-comma-text-argument-bare] [fixture:
c4/db-grid-punct-text-argument-bare] [fixture:
c4/db-grid-comma-alias-argument-bare] [fixture:
c4/db-grid-punct-alias-argument-bare] [fixture:
c4/db-grid-comma-plain-argument-bare] [fixture:
c4/db-grid-punct-plain-argument-bare] [fixture:
c4/db-grid-comma-index-argument-bare] [fixture:
c4/db-grid-punct-index-argument-bare]

最初の等号が名前付きキーを終えるため、
キー内に挿入した等号や HTML 属性の代入は名前に残らず拒否される。
[fixture: c4/gram-grid-equals-named-key] [fixture:
c4/gram-grid-html-attribute-named-key] [fixture: c4/gram-grid-punct-named-key]

二重引用符は引用符付き位置引数を終え、
後続の引用符なしの断片はコンマがなくても別の引数となる。
[fixture: c4/db-grid-quote-text-argument-quoted] [fixture:
c4/db-grid-quote-alias-argument-quoted] [fixture:
c4/db-grid-quote-plain-argument-quoted] [fixture:
c4/db-grid-quote-index-argument-quoted]

二重引用符は名前付き値を終え、
後続の引用符なしの断片はその値の継続にならず拒否される。
[fixture: c4/gram-grid-quote-named-value] [fixture:
c4/gram-grid-quote-style-value]

空の位置引数は捨てずに空文字列として保持する。
[fixture: c4/db-grid-empty-text-argument-bare] [fixture:
c4/db-grid-empty-alias-argument-bare] [fixture:
c4/db-grid-empty-plain-argument-bare] [fixture:
c4/db-grid-empty-text-argument-quoted] [fixture:
c4/db-grid-empty-alias-argument-quoted] [fixture:
c4/db-grid-empty-plain-argument-quoted]
[fixture: c4/spec-c4-boundary-08686298]
[fixture: c4/spec-c4-container-06e57d08]
[fixture: c4/spec-c4-container-0979e261]
[fixture: c4/spec-c4-container-29db0dde]
[fixture: c4/spec-c4-container-79b6a78b]
[fixture: c4/spec-c4-container-85b656fa]
[fixture: c4/spec-c4-container-9f732139]
[fixture: c4/spec-c4-container-a5979794]
[fixture: c4/spec-c4-container-a5b85126]
[fixture: c4/spec-c4-container-cef673d4]
[fixture: c4/spec-c4-container-db66cc1e]
[fixture: c4/spec-c4-container-e174083e]
[fixture: c4/spec-c4-container-eae6e364]

空の名前付きキーを受理し、
空文字列の名前の属性を選ぶ。
[fixture: c4/db-grid-empty-named-key] [fixture: c4/lex-named-empty-key]

文字が一つもない名前付き値は拒否されるが、
空白だけの空でない値は両端を削って空文字列となる。
[fixture: c4/gram-grid-empty-named-value] [fixture:
c4/gram-grid-empty-style-value] [fixture: c4/gram-named-empty-value] [fixture:
c4/lex-named-whitespace-value]

空の呼出しと終端のない引用符なし引数だけの呼出しは、
完結した引数リストを持たず拒否される。
[fixture: c4/gram-arguments-boundary-none] [fixture:
c4/gram-arguments-boundary-one] [fixture: c4/gram-arguments-component-none]
[fixture: c4/gram-arguments-component-one] [fixture:
c4/gram-arguments-container-none] [fixture: c4/gram-arguments-container-one]
[fixture: c4/gram-arguments-element-style-none] [fixture:
c4/gram-arguments-element-style-one] [fixture: c4/gram-arguments-index-none]
[fixture: c4/gram-arguments-layout-none] [fixture: c4/gram-arguments-node-none]
[fixture: c4/gram-arguments-node-one] [fixture: c4/gram-arguments-person-none]
[fixture: c4/gram-arguments-person-one] [fixture: c4/gram-arguments-rel-none]
[fixture: c4/gram-arguments-rel-one] [fixture: c4/gram-arguments-rel-style-none]
[fixture: c4/gram-arguments-rel-style-one]

引用符付き引数の後の空白や `(` の直後の改行は、
閉じ括弧を取り込む引用符なしの断片を始め、
呼出しを拒否させることがある。
[fixture: c4/lex-bare-after-quoted-spaces] [fixture:
c4/gram-statement-newline-in-call]

引用符付き引数のバックスラッシュは二重引用符をエスケープせず、
引用符が値を閉じて不正な接尾辞を残すことがある。
[fixture: c4/lex-quote-backslash]

名前付き引数は `=` の後に二重引用符付きの値を必要とし、
引用符のない値、
単一引用符の値、
未完の `$` 引数は拒否される。
[fixture: c4/gram-named-bare-value] [fixture: c4/gram-named-single-quote]
[fixture: c4/lex-named-open-eof]

名前付きキーは最初の等号まで内部のコンマ、
閉じ丸括弧、
LF、
字下げを保持する。
[fixture: c4/lex-named-key-comma-close] [fixture: c4/lex-named-key-multiline]

名前付きキー `__proto__` への文字列の代入は、
own 要素のない引数オブジェクトを残し、
そのオブジェクトを任意フィールドとして消費すると TypeError を投げる。
[fixture: c4/gram-named-proto] [fixture: c4/gram-named-proto-boundary-type]
[fixture: c4/gram-named-proto-container-technology] [fixture:
c4/gram-named-proto-existing-relationship-style] [fixture:
c4/gram-named-proto-index-relationship-technology] [fixture:
c4/gram-named-proto-node-type] [fixture: c4/gram-named-proto-person-description]
[fixture: c4/gram-named-proto-relationship-technology] [fixture:
c4/gram-named-proto-system-boundary-tags]

必須の alias 位置の名前付き `__proto__` 引数は、
新しい空オブジェクト `{}` として保持する。
[fixture: c4/gram-proto-required-alias]

`UpdateLayoutConfig` の名前付き `__proto__` 引数は自属性の値を持たず、
`parseInt(undefined)` が `NaN` となるため対応する行数を変更せず、
もう一つの引数は引き続き処理する。
[fixture: c4/gram-proto-layout]

余分な未使用引数や対象に一致しないスタイル呼出しの、
要素のない名前付きオブジェクトは、
消費されず例外を投げない。
[fixture: c4/gram-proto-unused-extra] [fixture:
c4/gram-proto-rel-missing-target]

説明のない新しい Person、
配置ノード、
関係は `{ text: "" }` を保持し、
技術のない Container も techn に同じ空テキストのラップを保持する。
[fixture: c4/header-context-minimal] [fixture: c4/gram-boundary-nested]
[fixture: c4/db-rel-self] [fixture: c4/spec-c4-named-attributes-bd7f9fb7]

新しい Container や Component で省略された説明は、
`{ text: "" }` になる。
[fixture: c4/spec-c4-named-attributes-19f2c0e1]
[fixture: c4/spec-c4-named-attributes-af0fa0d8]

Boundary の型の省略は `{ text: "system" }`、
配置ノードの型の省略は `{ text: "node" }` となる。
[fixture: c4/gram-boundary-nested]
[fixture: c4/spec-c4-boundary-826935af]

新しく宣言した項目で sprite、
tags、
link がなければ空文字列で埋めずに省略し、
初期の global 境界はそれ自身の null の既定値を保持する。
[fixture: c4/header-context-minimal] [fixture: c4/gram-boundary-nested]
[fixture: c4/db-rel-self]

### テキスト値

引数、
名前付きキー、
題名、
アクセシビリティの文字列の内部では、
スペース、
タブ、
FF、
VT、
NBSP、
U+3000、
U+FEFF、
U+2028、
U+2029、
U+0085 を保持し、
両端の削除と accDescr の LF 後の字下げ削除は適用する。
[fixture: c4/db-grid-bom-title] [fixture: c4/db-grid-ff-title] [fixture:
c4/db-grid-ideographic-title] [fixture: c4/db-grid-ls-title] [fixture:
c4/db-grid-nbsp-title] [fixture: c4/db-grid-nel-title] [fixture:
c4/db-grid-ps-title] [fixture: c4/db-grid-spaces-title] [fixture:
c4/db-grid-tab-title] [fixture: c4/db-grid-vt-title] [fixture:
c4/db-grid-bom-acc-description] [fixture: c4/db-grid-ff-acc-description]
[fixture: c4/db-grid-ideographic-acc-description] [fixture:
c4/db-grid-ls-acc-description] [fixture: c4/db-grid-nbsp-acc-description]
[fixture: c4/db-grid-nel-acc-description] [fixture:
c4/db-grid-ps-acc-description] [fixture: c4/db-grid-spaces-acc-description]
[fixture: c4/db-grid-tab-acc-description] [fixture:
c4/db-grid-vt-acc-description] [fixture: c4/db-grid-bom-acc-title] [fixture:
c4/db-grid-ff-acc-title] [fixture: c4/db-grid-ideographic-acc-title] [fixture:
c4/db-grid-ls-acc-title] [fixture: c4/db-grid-nbsp-acc-title] [fixture:
c4/db-grid-nel-acc-title] [fixture: c4/db-grid-ps-acc-title] [fixture:
c4/db-grid-spaces-acc-title] [fixture: c4/db-grid-tab-acc-title] [fixture:
c4/db-grid-vt-acc-title] [fixture: c4/db-grid-bom-acc-descr] [fixture:
c4/db-grid-ff-acc-descr] [fixture: c4/db-grid-ideographic-acc-descr] [fixture:
c4/db-grid-ls-acc-descr] [fixture: c4/db-grid-nbsp-acc-descr] [fixture:
c4/db-grid-nel-acc-descr] [fixture: c4/db-grid-ps-acc-descr] [fixture:
c4/db-grid-spaces-acc-descr] [fixture: c4/db-grid-tab-acc-descr] [fixture:
c4/db-grid-vt-acc-descr] [fixture: c4/db-grid-bom-acc-descr-block] [fixture:
c4/db-grid-ff-acc-descr-block] [fixture: c4/db-grid-ideographic-acc-descr-block]
[fixture: c4/db-grid-ls-acc-descr-block] [fixture:
c4/db-grid-nbsp-acc-descr-block] [fixture: c4/db-grid-nel-acc-descr-block]
[fixture: c4/db-grid-ps-acc-descr-block] [fixture:
c4/db-grid-spaces-acc-descr-block] [fixture: c4/db-grid-tab-acc-descr-block]
[fixture: c4/db-grid-vt-acc-descr-block] [fixture:
c4/db-grid-bom-text-argument-bare] [fixture: c4/db-grid-ff-text-argument-bare]
[fixture: c4/db-grid-ideographic-text-argument-bare] [fixture:
c4/db-grid-ls-text-argument-bare] [fixture: c4/db-grid-nbsp-text-argument-bare]
[fixture: c4/db-grid-nel-text-argument-bare] [fixture:
c4/db-grid-ps-text-argument-bare] [fixture:
c4/db-grid-spaces-text-argument-bare] [fixture:
c4/db-grid-tab-text-argument-bare] [fixture: c4/db-grid-vt-text-argument-bare]
[fixture: c4/db-grid-bom-alias-argument-bare] [fixture:
c4/db-grid-ff-alias-argument-bare] [fixture:
c4/db-grid-ideographic-alias-argument-bare] [fixture:
c4/db-grid-ls-alias-argument-bare] [fixture:
c4/db-grid-nbsp-alias-argument-bare] [fixture:
c4/db-grid-nel-alias-argument-bare] [fixture: c4/db-grid-ps-alias-argument-bare]
[fixture: c4/db-grid-spaces-alias-argument-bare] [fixture:
c4/db-grid-tab-alias-argument-bare] [fixture: c4/db-grid-vt-alias-argument-bare]
[fixture: c4/db-grid-bom-plain-argument-bare] [fixture:
c4/db-grid-ff-plain-argument-bare] [fixture:
c4/db-grid-ideographic-plain-argument-bare] [fixture:
c4/db-grid-ls-plain-argument-bare] [fixture:
c4/db-grid-nbsp-plain-argument-bare] [fixture:
c4/db-grid-nel-plain-argument-bare] [fixture: c4/db-grid-ps-plain-argument-bare]
[fixture: c4/db-grid-spaces-plain-argument-bare] [fixture:
c4/db-grid-tab-plain-argument-bare] [fixture: c4/db-grid-vt-plain-argument-bare]
[fixture: c4/db-grid-bom-text-argument-quoted] [fixture:
c4/db-grid-ff-text-argument-quoted] [fixture:
c4/db-grid-ideographic-text-argument-quoted] [fixture:
c4/db-grid-ls-text-argument-quoted] [fixture:
c4/db-grid-nbsp-text-argument-quoted] [fixture:
c4/db-grid-nel-text-argument-quoted] [fixture:
c4/db-grid-ps-text-argument-quoted] [fixture:
c4/db-grid-spaces-text-argument-quoted] [fixture:
c4/db-grid-tab-text-argument-quoted] [fixture:
c4/db-grid-vt-text-argument-quoted] [fixture:
c4/db-grid-bom-alias-argument-quoted] [fixture:
c4/db-grid-ff-alias-argument-quoted] [fixture:
c4/db-grid-ideographic-alias-argument-quoted] [fixture:
c4/db-grid-ls-alias-argument-quoted] [fixture:
c4/db-grid-nbsp-alias-argument-quoted] [fixture:
c4/db-grid-nel-alias-argument-quoted] [fixture:
c4/db-grid-ps-alias-argument-quoted] [fixture:
c4/db-grid-spaces-alias-argument-quoted] [fixture:
c4/db-grid-tab-alias-argument-quoted] [fixture:
c4/db-grid-vt-alias-argument-quoted] [fixture:
c4/db-grid-bom-plain-argument-quoted] [fixture:
c4/db-grid-ff-plain-argument-quoted] [fixture:
c4/db-grid-ideographic-plain-argument-quoted] [fixture:
c4/db-grid-ls-plain-argument-quoted] [fixture:
c4/db-grid-nbsp-plain-argument-quoted] [fixture:
c4/db-grid-nel-plain-argument-quoted] [fixture:
c4/db-grid-ps-plain-argument-quoted] [fixture:
c4/db-grid-spaces-plain-argument-quoted] [fixture:
c4/db-grid-tab-plain-argument-quoted] [fixture:
c4/db-grid-vt-plain-argument-quoted] [fixture: c4/db-grid-bom-named-key]
[fixture: c4/db-grid-ff-named-key] [fixture: c4/db-grid-ideographic-named-key]
[fixture: c4/db-grid-ls-named-key] [fixture: c4/db-grid-nbsp-named-key]
[fixture: c4/db-grid-nel-named-key] [fixture: c4/db-grid-ps-named-key] [fixture:
c4/db-grid-spaces-named-key] [fixture: c4/db-grid-tab-named-key] [fixture:
c4/db-grid-vt-named-key] [fixture: c4/db-grid-bom-named-value] [fixture:
c4/db-grid-ff-named-value] [fixture: c4/db-grid-ideographic-named-value]
[fixture: c4/db-grid-ls-named-value] [fixture: c4/db-grid-nbsp-named-value]
[fixture: c4/db-grid-nel-named-value] [fixture: c4/db-grid-ps-named-value]
[fixture: c4/db-grid-spaces-named-value] [fixture: c4/db-grid-tab-named-value]
[fixture: c4/db-grid-vt-named-value] [fixture: c4/db-grid-bom-style-value]
[fixture: c4/db-grid-ff-style-value] [fixture:
c4/db-grid-ideographic-style-value] [fixture: c4/db-grid-ls-style-value]
[fixture: c4/db-grid-nbsp-style-value] [fixture: c4/db-grid-nel-style-value]
[fixture: c4/db-grid-ps-style-value] [fixture: c4/db-grid-spaces-style-value]
[fixture: c4/db-grid-tab-style-value] [fixture: c4/db-grid-vt-style-value]

テキスト値と名前付きキーは ASCII 外の文字と絵文字を保持する。
[fixture: c4/db-grid-emoji-title] [fixture: c4/db-grid-nonascii-title] [fixture:
c4/db-grid-emoji-acc-description] [fixture: c4/db-grid-nonascii-acc-description]
[fixture: c4/db-grid-emoji-acc-title] [fixture: c4/db-grid-nonascii-acc-title]
[fixture: c4/db-grid-emoji-acc-descr] [fixture: c4/db-grid-nonascii-acc-descr]
[fixture: c4/db-grid-emoji-acc-descr-block] [fixture:
c4/db-grid-nonascii-acc-descr-block] [fixture:
c4/db-grid-emoji-text-argument-bare] [fixture:
c4/db-grid-nonascii-text-argument-bare] [fixture:
c4/db-grid-emoji-alias-argument-bare] [fixture:
c4/db-grid-nonascii-alias-argument-bare] [fixture:
c4/db-grid-emoji-plain-argument-bare] [fixture:
c4/db-grid-nonascii-plain-argument-bare] [fixture:
c4/db-grid-emoji-text-argument-quoted] [fixture:
c4/db-grid-nonascii-text-argument-quoted] [fixture:
c4/db-grid-emoji-alias-argument-quoted] [fixture:
c4/db-grid-nonascii-alias-argument-quoted] [fixture:
c4/db-grid-emoji-plain-argument-quoted] [fixture:
c4/db-grid-nonascii-plain-argument-quoted] [fixture: c4/db-grid-emoji-named-key]
[fixture: c4/db-grid-nonascii-named-key] [fixture: c4/db-grid-emoji-named-value]
[fixture: c4/db-grid-nonascii-named-value] [fixture:
c4/db-grid-emoji-style-value] [fixture: c4/db-grid-nonascii-style-value]
[fixture: c4/db-title-non-ascii] [fixture: c4/db-acctitle-non-ascii] [fixture:
c4/db-accdescription-non-ascii] [fixture: c4/db-accdescr-non-ascii]

長い文字列内の数字、
`root`、
`constructor`、
`__proto__` はテキスト値と名前付きキーに文字のまま残る。
[fixture: c4/db-grid-constructor-title] [fixture: c4/db-grid-digits-title]
[fixture: c4/db-grid-proto-title] [fixture: c4/db-grid-root-title] [fixture:
c4/db-grid-constructor-acc-description] [fixture:
c4/db-grid-digits-acc-description] [fixture: c4/db-grid-proto-acc-description]
[fixture: c4/db-grid-root-acc-description] [fixture:
c4/db-grid-constructor-acc-title] [fixture: c4/db-grid-digits-acc-title]
[fixture: c4/db-grid-proto-acc-title] [fixture: c4/db-grid-root-acc-title]
[fixture: c4/db-grid-constructor-acc-descr] [fixture:
c4/db-grid-digits-acc-descr] [fixture: c4/db-grid-proto-acc-descr] [fixture:
c4/db-grid-root-acc-descr] [fixture: c4/db-grid-constructor-acc-descr-block]
[fixture: c4/db-grid-digits-acc-descr-block] [fixture:
c4/db-grid-proto-acc-descr-block] [fixture: c4/db-grid-root-acc-descr-block]
[fixture: c4/db-grid-constructor-text-argument-bare] [fixture:
c4/db-grid-digits-text-argument-bare] [fixture:
c4/db-grid-proto-text-argument-bare] [fixture:
c4/db-grid-root-text-argument-bare] [fixture:
c4/db-grid-constructor-alias-argument-bare] [fixture:
c4/db-grid-digits-alias-argument-bare] [fixture:
c4/db-grid-proto-alias-argument-bare] [fixture:
c4/db-grid-root-alias-argument-bare] [fixture:
c4/db-grid-constructor-plain-argument-bare] [fixture:
c4/db-grid-digits-plain-argument-bare] [fixture:
c4/db-grid-proto-plain-argument-bare] [fixture:
c4/db-grid-root-plain-argument-bare] [fixture:
c4/db-grid-constructor-text-argument-quoted] [fixture:
c4/db-grid-digits-text-argument-quoted] [fixture:
c4/db-grid-proto-text-argument-quoted] [fixture:
c4/db-grid-root-text-argument-quoted] [fixture:
c4/db-grid-constructor-alias-argument-quoted] [fixture:
c4/db-grid-digits-alias-argument-quoted] [fixture:
c4/db-grid-proto-alias-argument-quoted] [fixture:
c4/db-grid-root-alias-argument-quoted] [fixture:
c4/db-grid-constructor-plain-argument-quoted] [fixture:
c4/db-grid-digits-plain-argument-quoted] [fixture:
c4/db-grid-proto-plain-argument-quoted] [fixture:
c4/db-grid-root-plain-argument-quoted] [fixture:
c4/db-grid-constructor-named-key] [fixture: c4/db-grid-digits-named-key]
[fixture: c4/db-grid-proto-named-key] [fixture: c4/db-grid-root-named-key]
[fixture: c4/db-grid-constructor-named-value] [fixture:
c4/db-grid-digits-named-value] [fixture: c4/db-grid-proto-named-value] [fixture:
c4/db-grid-root-named-value] [fixture: c4/db-grid-constructor-style-value]
[fixture: c4/db-grid-digits-style-value] [fixture: c4/db-grid-proto-style-value]
[fixture: c4/db-grid-root-style-value]

C4 のヘッダーと要素キーワードや、
他の図の `block`、
`class`、
`columns`、
`end`、
`space`、
`style`、
`classDef` は、
テキスト値と名前付きキーの中では文字のまま残る。
[fixture: c4/db-grid-keyword-title] [fixture: c4/db-grid-keyword-block-title]
[fixture: c4/db-grid-keyword-class-title] [fixture:
c4/db-grid-keyword-classdef-title] [fixture: c4/db-grid-keyword-columns-title]
[fixture: c4/db-grid-keyword-end-title] [fixture:
c4/db-grid-keyword-header-title] [fixture: c4/db-grid-keyword-space-title]
[fixture: c4/db-grid-keyword-style-title] [fixture:
c4/db-grid-keyword-acc-description] [fixture:
c4/db-grid-keyword-block-acc-description] [fixture:
c4/db-grid-keyword-class-acc-description] [fixture:
c4/db-grid-keyword-classdef-acc-description] [fixture:
c4/db-grid-keyword-columns-acc-description] [fixture:
c4/db-grid-keyword-end-acc-description] [fixture:
c4/db-grid-keyword-header-acc-description] [fixture:
c4/db-grid-keyword-space-acc-description] [fixture:
c4/db-grid-keyword-style-acc-description] [fixture:
c4/db-grid-keyword-acc-title] [fixture: c4/db-grid-keyword-block-acc-title]
[fixture: c4/db-grid-keyword-class-acc-title] [fixture:
c4/db-grid-keyword-classdef-acc-title] [fixture:
c4/db-grid-keyword-columns-acc-title] [fixture:
c4/db-grid-keyword-end-acc-title] [fixture: c4/db-grid-keyword-header-acc-title]
[fixture: c4/db-grid-keyword-space-acc-title] [fixture:
c4/db-grid-keyword-style-acc-title] [fixture: c4/db-grid-keyword-acc-descr]
[fixture: c4/db-grid-keyword-block-acc-descr] [fixture:
c4/db-grid-keyword-class-acc-descr] [fixture:
c4/db-grid-keyword-classdef-acc-descr] [fixture:
c4/db-grid-keyword-columns-acc-descr] [fixture:
c4/db-grid-keyword-end-acc-descr] [fixture: c4/db-grid-keyword-header-acc-descr]
[fixture: c4/db-grid-keyword-space-acc-descr] [fixture:
c4/db-grid-keyword-style-acc-descr] [fixture:
c4/db-grid-keyword-acc-descr-block] [fixture:
c4/db-grid-keyword-block-acc-descr-block] [fixture:
c4/db-grid-keyword-class-acc-descr-block] [fixture:
c4/db-grid-keyword-classdef-acc-descr-block] [fixture:
c4/db-grid-keyword-columns-acc-descr-block] [fixture:
c4/db-grid-keyword-end-acc-descr-block] [fixture:
c4/db-grid-keyword-header-acc-descr-block] [fixture:
c4/db-grid-keyword-space-acc-descr-block] [fixture:
c4/db-grid-keyword-style-acc-descr-block] [fixture:
c4/db-grid-keyword-text-argument-bare] [fixture:
c4/db-grid-keyword-block-text-argument-bare] [fixture:
c4/db-grid-keyword-class-text-argument-bare] [fixture:
c4/db-grid-keyword-classdef-text-argument-bare] [fixture:
c4/db-grid-keyword-columns-text-argument-bare] [fixture:
c4/db-grid-keyword-end-text-argument-bare] [fixture:
c4/db-grid-keyword-header-text-argument-bare] [fixture:
c4/db-grid-keyword-space-text-argument-bare] [fixture:
c4/db-grid-keyword-style-text-argument-bare] [fixture:
c4/db-grid-keyword-alias-argument-bare] [fixture:
c4/db-grid-keyword-block-alias-argument-bare] [fixture:
c4/db-grid-keyword-class-alias-argument-bare] [fixture:
c4/db-grid-keyword-classdef-alias-argument-bare] [fixture:
c4/db-grid-keyword-columns-alias-argument-bare] [fixture:
c4/db-grid-keyword-end-alias-argument-bare] [fixture:
c4/db-grid-keyword-header-alias-argument-bare] [fixture:
c4/db-grid-keyword-space-alias-argument-bare] [fixture:
c4/db-grid-keyword-style-alias-argument-bare] [fixture:
c4/db-grid-keyword-plain-argument-bare] [fixture:
c4/db-grid-keyword-block-plain-argument-bare] [fixture:
c4/db-grid-keyword-class-plain-argument-bare] [fixture:
c4/db-grid-keyword-classdef-plain-argument-bare] [fixture:
c4/db-grid-keyword-columns-plain-argument-bare] [fixture:
c4/db-grid-keyword-end-plain-argument-bare] [fixture:
c4/db-grid-keyword-header-plain-argument-bare] [fixture:
c4/db-grid-keyword-space-plain-argument-bare] [fixture:
c4/db-grid-keyword-style-plain-argument-bare] [fixture:
c4/db-grid-keyword-text-argument-quoted] [fixture:
c4/db-grid-keyword-block-text-argument-quoted] [fixture:
c4/db-grid-keyword-class-text-argument-quoted] [fixture:
c4/db-grid-keyword-classdef-text-argument-quoted] [fixture:
c4/db-grid-keyword-columns-text-argument-quoted] [fixture:
c4/db-grid-keyword-end-text-argument-quoted] [fixture:
c4/db-grid-keyword-header-text-argument-quoted] [fixture:
c4/db-grid-keyword-space-text-argument-quoted] [fixture:
c4/db-grid-keyword-style-text-argument-quoted] [fixture:
c4/db-grid-keyword-alias-argument-quoted] [fixture:
c4/db-grid-keyword-block-alias-argument-quoted] [fixture:
c4/db-grid-keyword-class-alias-argument-quoted] [fixture:
c4/db-grid-keyword-classdef-alias-argument-quoted] [fixture:
c4/db-grid-keyword-columns-alias-argument-quoted] [fixture:
c4/db-grid-keyword-end-alias-argument-quoted] [fixture:
c4/db-grid-keyword-header-alias-argument-quoted] [fixture:
c4/db-grid-keyword-space-alias-argument-quoted] [fixture:
c4/db-grid-keyword-style-alias-argument-quoted] [fixture:
c4/db-grid-keyword-plain-argument-quoted] [fixture:
c4/db-grid-keyword-block-plain-argument-quoted] [fixture:
c4/db-grid-keyword-class-plain-argument-quoted] [fixture:
c4/db-grid-keyword-classdef-plain-argument-quoted] [fixture:
c4/db-grid-keyword-columns-plain-argument-quoted] [fixture:
c4/db-grid-keyword-end-plain-argument-quoted] [fixture:
c4/db-grid-keyword-header-plain-argument-quoted] [fixture:
c4/db-grid-keyword-space-plain-argument-quoted] [fixture:
c4/db-grid-keyword-style-plain-argument-quoted] [fixture:
c4/db-grid-keyword-named-key] [fixture: c4/db-grid-keyword-block-named-key]
[fixture: c4/db-grid-keyword-class-named-key] [fixture:
c4/db-grid-keyword-classdef-named-key] [fixture:
c4/db-grid-keyword-columns-named-key] [fixture:
c4/db-grid-keyword-end-named-key] [fixture: c4/db-grid-keyword-header-named-key]
[fixture: c4/db-grid-keyword-space-named-key] [fixture:
c4/db-grid-keyword-style-named-key] [fixture: c4/db-grid-keyword-named-value]
[fixture: c4/db-grid-keyword-block-named-value] [fixture:
c4/db-grid-keyword-class-named-value] [fixture:
c4/db-grid-keyword-classdef-named-value] [fixture:
c4/db-grid-keyword-columns-named-value] [fixture:
c4/db-grid-keyword-end-named-value] [fixture:
c4/db-grid-keyword-header-named-value] [fixture:
c4/db-grid-keyword-space-named-value] [fixture:
c4/db-grid-keyword-style-named-value] [fixture: c4/db-grid-keyword-style-value]
[fixture: c4/db-grid-keyword-block-style-value] [fixture:
c4/db-grid-keyword-class-style-value] [fixture:
c4/db-grid-keyword-classdef-style-value] [fixture:
c4/db-grid-keyword-columns-style-value] [fixture:
c4/db-grid-keyword-end-style-value] [fixture:
c4/db-grid-keyword-header-style-value] [fixture:
c4/db-grid-keyword-space-style-value] [fixture:
c4/db-grid-keyword-style-style-value]
[fixture: c4/spec-c4-diagram-e515e297]

テキスト値と名前付きキーの中では、
矢印、
ハイフン、
丸括弧、
角括弧、
開き波括弧、
山括弧、
コロン、
縦棒、
百分率記号、
単一引用符、
バックスラッシュ、
バッククォートを保持する。
[fixture: c4/db-grid-arrow-title] [fixture: c4/db-grid-arrow-spaced-title]
[fixture: c4/db-grid-backslash-title] [fixture: c4/db-grid-backtick-title]
[fixture: c4/db-grid-close-round-title] [fixture: c4/db-grid-close-square-title]
[fixture: c4/db-grid-colon-title] [fixture: c4/db-grid-dash-title] [fixture:
c4/db-grid-greater-than-title] [fixture: c4/db-grid-less-than-title] [fixture:
c4/db-grid-open-brace-title] [fixture: c4/db-grid-open-round-title] [fixture:
c4/db-grid-open-square-title] [fixture: c4/db-grid-percent-title] [fixture:
c4/db-grid-pipe-title] [fixture: c4/db-grid-single-quote-title] [fixture:
c4/db-grid-arrow-acc-description] [fixture:
c4/db-grid-arrow-spaced-acc-description] [fixture:
c4/db-grid-backslash-acc-description] [fixture:
c4/db-grid-backtick-acc-description] [fixture:
c4/db-grid-close-round-acc-description] [fixture:
c4/db-grid-close-square-acc-description] [fixture:
c4/db-grid-colon-acc-description] [fixture: c4/db-grid-dash-acc-description]
[fixture: c4/db-grid-greater-than-acc-description] [fixture:
c4/db-grid-less-than-acc-description] [fixture:
c4/db-grid-open-brace-acc-description] [fixture:
c4/db-grid-open-round-acc-description] [fixture:
c4/db-grid-open-square-acc-description] [fixture:
c4/db-grid-percent-acc-description] [fixture: c4/db-grid-pipe-acc-description]
[fixture: c4/db-grid-single-quote-acc-description] [fixture:
c4/db-grid-arrow-acc-title] [fixture: c4/db-grid-arrow-spaced-acc-title]
[fixture: c4/db-grid-backslash-acc-title] [fixture:
c4/db-grid-backtick-acc-title] [fixture: c4/db-grid-close-round-acc-title]
[fixture: c4/db-grid-close-square-acc-title] [fixture:
c4/db-grid-colon-acc-title] [fixture: c4/db-grid-dash-acc-title] [fixture:
c4/db-grid-greater-than-acc-title] [fixture: c4/db-grid-less-than-acc-title]
[fixture: c4/db-grid-open-brace-acc-title] [fixture:
c4/db-grid-open-round-acc-title] [fixture: c4/db-grid-open-square-acc-title]
[fixture: c4/db-grid-percent-acc-title] [fixture: c4/db-grid-pipe-acc-title]
[fixture: c4/db-grid-single-quote-acc-title] [fixture:
c4/db-grid-arrow-acc-descr] [fixture: c4/db-grid-arrow-spaced-acc-descr]
[fixture: c4/db-grid-backslash-acc-descr] [fixture:
c4/db-grid-backtick-acc-descr] [fixture: c4/db-grid-close-round-acc-descr]
[fixture: c4/db-grid-close-square-acc-descr] [fixture:
c4/db-grid-colon-acc-descr] [fixture: c4/db-grid-dash-acc-descr] [fixture:
c4/db-grid-greater-than-acc-descr] [fixture: c4/db-grid-less-than-acc-descr]
[fixture: c4/db-grid-open-brace-acc-descr] [fixture:
c4/db-grid-open-round-acc-descr] [fixture: c4/db-grid-open-square-acc-descr]
[fixture: c4/db-grid-percent-acc-descr] [fixture: c4/db-grid-pipe-acc-descr]
[fixture: c4/db-grid-single-quote-acc-descr] [fixture:
c4/db-grid-arrow-acc-descr-block] [fixture:
c4/db-grid-arrow-spaced-acc-descr-block] [fixture:
c4/db-grid-backslash-acc-descr-block] [fixture:
c4/db-grid-backtick-acc-descr-block] [fixture:
c4/db-grid-close-round-acc-descr-block] [fixture:
c4/db-grid-close-square-acc-descr-block] [fixture:
c4/db-grid-colon-acc-descr-block] [fixture: c4/db-grid-dash-acc-descr-block]
[fixture: c4/db-grid-greater-than-acc-descr-block] [fixture:
c4/db-grid-less-than-acc-descr-block] [fixture:
c4/db-grid-open-brace-acc-descr-block] [fixture:
c4/db-grid-open-round-acc-descr-block] [fixture:
c4/db-grid-open-square-acc-descr-block] [fixture:
c4/db-grid-percent-acc-descr-block] [fixture: c4/db-grid-pipe-acc-descr-block]
[fixture: c4/db-grid-single-quote-acc-descr-block] [fixture:
c4/db-grid-arrow-text-argument-bare] [fixture:
c4/db-grid-arrow-spaced-text-argument-bare] [fixture:
c4/db-grid-backslash-text-argument-bare] [fixture:
c4/db-grid-backtick-text-argument-bare] [fixture:
c4/db-grid-close-round-text-argument-bare] [fixture:
c4/db-grid-close-square-text-argument-bare] [fixture:
c4/db-grid-colon-text-argument-bare] [fixture:
c4/db-grid-dash-text-argument-bare] [fixture:
c4/db-grid-greater-than-text-argument-bare] [fixture:
c4/db-grid-less-than-text-argument-bare] [fixture:
c4/db-grid-open-brace-text-argument-bare] [fixture:
c4/db-grid-open-round-text-argument-bare] [fixture:
c4/db-grid-open-square-text-argument-bare] [fixture:
c4/db-grid-percent-text-argument-bare] [fixture:
c4/db-grid-pipe-text-argument-bare] [fixture:
c4/db-grid-single-quote-text-argument-bare] [fixture:
c4/db-grid-arrow-alias-argument-bare] [fixture:
c4/db-grid-arrow-spaced-alias-argument-bare] [fixture:
c4/db-grid-backslash-alias-argument-bare] [fixture:
c4/db-grid-backtick-alias-argument-bare] [fixture:
c4/db-grid-close-round-alias-argument-bare] [fixture:
c4/db-grid-close-square-alias-argument-bare] [fixture:
c4/db-grid-colon-alias-argument-bare] [fixture:
c4/db-grid-dash-alias-argument-bare] [fixture:
c4/db-grid-greater-than-alias-argument-bare] [fixture:
c4/db-grid-less-than-alias-argument-bare] [fixture:
c4/db-grid-open-brace-alias-argument-bare] [fixture:
c4/db-grid-open-round-alias-argument-bare] [fixture:
c4/db-grid-open-square-alias-argument-bare] [fixture:
c4/db-grid-percent-alias-argument-bare] [fixture:
c4/db-grid-pipe-alias-argument-bare] [fixture:
c4/db-grid-single-quote-alias-argument-bare] [fixture:
c4/db-grid-arrow-plain-argument-bare] [fixture:
c4/db-grid-arrow-spaced-plain-argument-bare] [fixture:
c4/db-grid-backslash-plain-argument-bare] [fixture:
c4/db-grid-backtick-plain-argument-bare] [fixture:
c4/db-grid-close-round-plain-argument-bare] [fixture:
c4/db-grid-close-square-plain-argument-bare] [fixture:
c4/db-grid-colon-plain-argument-bare] [fixture:
c4/db-grid-dash-plain-argument-bare] [fixture:
c4/db-grid-greater-than-plain-argument-bare] [fixture:
c4/db-grid-less-than-plain-argument-bare] [fixture:
c4/db-grid-open-brace-plain-argument-bare] [fixture:
c4/db-grid-open-round-plain-argument-bare] [fixture:
c4/db-grid-open-square-plain-argument-bare] [fixture:
c4/db-grid-percent-plain-argument-bare] [fixture:
c4/db-grid-pipe-plain-argument-bare] [fixture:
c4/db-grid-single-quote-plain-argument-bare] [fixture:
c4/db-grid-arrow-text-argument-quoted] [fixture:
c4/db-grid-arrow-spaced-text-argument-quoted] [fixture:
c4/db-grid-backslash-text-argument-quoted] [fixture:
c4/db-grid-backtick-text-argument-quoted] [fixture:
c4/db-grid-close-round-text-argument-quoted] [fixture:
c4/db-grid-close-square-text-argument-quoted] [fixture:
c4/db-grid-colon-text-argument-quoted] [fixture:
c4/db-grid-dash-text-argument-quoted] [fixture:
c4/db-grid-greater-than-text-argument-quoted] [fixture:
c4/db-grid-less-than-text-argument-quoted] [fixture:
c4/db-grid-open-brace-text-argument-quoted] [fixture:
c4/db-grid-open-round-text-argument-quoted] [fixture:
c4/db-grid-open-square-text-argument-quoted] [fixture:
c4/db-grid-percent-text-argument-quoted] [fixture:
c4/db-grid-pipe-text-argument-quoted] [fixture:
c4/db-grid-single-quote-text-argument-quoted] [fixture:
c4/db-grid-arrow-alias-argument-quoted] [fixture:
c4/db-grid-arrow-spaced-alias-argument-quoted] [fixture:
c4/db-grid-backslash-alias-argument-quoted] [fixture:
c4/db-grid-backtick-alias-argument-quoted] [fixture:
c4/db-grid-close-round-alias-argument-quoted] [fixture:
c4/db-grid-close-square-alias-argument-quoted] [fixture:
c4/db-grid-colon-alias-argument-quoted] [fixture:
c4/db-grid-dash-alias-argument-quoted] [fixture:
c4/db-grid-greater-than-alias-argument-quoted] [fixture:
c4/db-grid-less-than-alias-argument-quoted] [fixture:
c4/db-grid-open-brace-alias-argument-quoted] [fixture:
c4/db-grid-open-round-alias-argument-quoted] [fixture:
c4/db-grid-open-square-alias-argument-quoted] [fixture:
c4/db-grid-percent-alias-argument-quoted] [fixture:
c4/db-grid-pipe-alias-argument-quoted] [fixture:
c4/db-grid-single-quote-alias-argument-quoted] [fixture:
c4/db-grid-arrow-plain-argument-quoted] [fixture:
c4/db-grid-arrow-spaced-plain-argument-quoted] [fixture:
c4/db-grid-backslash-plain-argument-quoted] [fixture:
c4/db-grid-backtick-plain-argument-quoted] [fixture:
c4/db-grid-close-round-plain-argument-quoted] [fixture:
c4/db-grid-close-square-plain-argument-quoted] [fixture:
c4/db-grid-colon-plain-argument-quoted] [fixture:
c4/db-grid-dash-plain-argument-quoted] [fixture:
c4/db-grid-greater-than-plain-argument-quoted] [fixture:
c4/db-grid-less-than-plain-argument-quoted] [fixture:
c4/db-grid-open-brace-plain-argument-quoted] [fixture:
c4/db-grid-open-round-plain-argument-quoted] [fixture:
c4/db-grid-open-square-plain-argument-quoted] [fixture:
c4/db-grid-percent-plain-argument-quoted] [fixture:
c4/db-grid-pipe-plain-argument-quoted] [fixture:
c4/db-grid-single-quote-plain-argument-quoted] [fixture:
c4/db-grid-arrow-named-key] [fixture: c4/db-grid-arrow-spaced-named-key]
[fixture: c4/db-grid-backslash-named-key] [fixture:
c4/db-grid-backtick-named-key] [fixture: c4/db-grid-close-round-named-key]
[fixture: c4/db-grid-close-square-named-key] [fixture:
c4/db-grid-colon-named-key] [fixture: c4/db-grid-dash-named-key] [fixture:
c4/db-grid-greater-than-named-key] [fixture: c4/db-grid-less-than-named-key]
[fixture: c4/db-grid-open-brace-named-key] [fixture:
c4/db-grid-open-round-named-key] [fixture: c4/db-grid-open-square-named-key]
[fixture: c4/db-grid-percent-named-key] [fixture: c4/db-grid-pipe-named-key]
[fixture: c4/db-grid-single-quote-named-key] [fixture:
c4/db-grid-arrow-named-value] [fixture: c4/db-grid-arrow-spaced-named-value]
[fixture: c4/db-grid-backslash-named-value] [fixture:
c4/db-grid-backtick-named-value] [fixture: c4/db-grid-close-round-named-value]
[fixture: c4/db-grid-close-square-named-value] [fixture:
c4/db-grid-colon-named-value] [fixture: c4/db-grid-dash-named-value] [fixture:
c4/db-grid-greater-than-named-value] [fixture: c4/db-grid-less-than-named-value]
[fixture: c4/db-grid-open-brace-named-value] [fixture:
c4/db-grid-open-round-named-value] [fixture: c4/db-grid-open-square-named-value]
[fixture: c4/db-grid-percent-named-value] [fixture: c4/db-grid-pipe-named-value]
[fixture: c4/db-grid-single-quote-named-value] [fixture:
c4/db-grid-arrow-style-value] [fixture: c4/db-grid-arrow-spaced-style-value]
[fixture: c4/db-grid-backslash-style-value] [fixture:
c4/db-grid-backtick-style-value] [fixture: c4/db-grid-close-round-style-value]
[fixture: c4/db-grid-close-square-style-value] [fixture:
c4/db-grid-colon-style-value] [fixture: c4/db-grid-dash-style-value] [fixture:
c4/db-grid-greater-than-style-value] [fixture: c4/db-grid-less-than-style-value]
[fixture: c4/db-grid-open-brace-style-value] [fixture:
c4/db-grid-open-round-style-value] [fixture: c4/db-grid-open-square-style-value]
[fixture: c4/db-grid-percent-style-value] [fixture: c4/db-grid-pipe-style-value]
[fixture: c4/db-grid-single-quote-style-value]

閉じ波括弧は引数、
キー、
行の文字列内では文字のまま残るが、
accDescr ブロックを閉じ、
後続の文字は文の文法へ渡す。
[fixture: c4/db-grid-close-brace-title] [fixture:
c4/db-grid-close-brace-acc-description] [fixture:
c4/db-grid-close-brace-acc-title] [fixture: c4/db-grid-close-brace-acc-descr]
[fixture: c4/db-grid-close-brace-text-argument-bare] [fixture:
c4/db-grid-close-brace-alias-argument-bare] [fixture:
c4/db-grid-close-brace-plain-argument-bare] [fixture:
c4/db-grid-close-brace-text-argument-quoted] [fixture:
c4/db-grid-close-brace-alias-argument-quoted] [fixture:
c4/db-grid-close-brace-plain-argument-quoted] [fixture:
c4/db-grid-close-brace-named-key] [fixture: c4/db-grid-close-brace-named-value]
[fixture: c4/db-grid-close-brace-style-value] [fixture:
c4/gram-grid-close-brace-acc-descr-block] [fixture:
c4/gram-acc-descr-block-braces-inside] [fixture:
c4/gram-acc-descr-block-after-text-braces-inside]

コンマとコンマを含む句読点は引用符付き引数、
名前付き値、
題名とアクセシビリティの文字列内では文字のまま残り、
名前付きキーもコンマを保持する。
[fixture: c4/db-grid-comma-title] [fixture: c4/db-grid-comma-acc-description]
[fixture: c4/db-grid-comma-acc-title] [fixture: c4/db-grid-comma-acc-descr]
[fixture: c4/db-grid-comma-acc-descr-block] [fixture:
c4/db-grid-comma-text-argument-quoted] [fixture:
c4/db-grid-comma-alias-argument-quoted] [fixture:
c4/db-grid-comma-plain-argument-quoted] [fixture: c4/db-grid-comma-named-key]
[fixture: c4/db-grid-comma-named-value] [fixture: c4/db-grid-comma-style-value]
[fixture: c4/db-grid-punct-title] [fixture: c4/db-grid-punct-acc-description]
[fixture: c4/db-grid-punct-acc-title] [fixture: c4/db-grid-punct-acc-descr]
[fixture: c4/db-grid-punct-acc-descr-block] [fixture:
c4/db-grid-punct-text-argument-quoted] [fixture:
c4/db-grid-punct-alias-argument-quoted] [fixture:
c4/db-grid-punct-plain-argument-quoted] [fixture: c4/db-grid-punct-named-value]
[fixture: c4/db-grid-punct-style-value]

名前付きキーの区切り以外の等号は文字列に保持する。
[fixture: c4/db-grid-equals-title] [fixture: c4/db-grid-equals-acc-description]
[fixture: c4/db-grid-equals-acc-title] [fixture: c4/db-grid-equals-acc-descr]
[fixture: c4/db-grid-equals-acc-descr-block] [fixture:
c4/db-grid-equals-text-argument-bare] [fixture:
c4/db-grid-equals-alias-argument-bare] [fixture:
c4/db-grid-equals-plain-argument-bare] [fixture:
c4/db-grid-equals-text-argument-quoted] [fixture:
c4/db-grid-equals-alias-argument-quoted] [fixture:
c4/db-grid-equals-plain-argument-quoted] [fixture:
c4/db-grid-equals-named-value] [fixture: c4/db-grid-equals-style-value]

引用符なし引数、
名前付きキー、
題名、
アクセシビリティの文字列内の二重引用符は文字のまま残る。
[fixture: c4/db-grid-quote-title] [fixture: c4/db-grid-quote-acc-description]
[fixture: c4/db-grid-quote-acc-title] [fixture: c4/db-grid-quote-acc-descr]
[fixture: c4/db-grid-quote-acc-descr-block] [fixture:
c4/db-grid-quote-text-argument-bare] [fixture:
c4/db-grid-quote-alias-argument-bare] [fixture:
c4/db-grid-quote-plain-argument-bare] [fixture: c4/db-grid-quote-named-key]
[fixture: c4/db-title-quotes] [fixture: c4/db-acctitle-quotes] [fixture:
c4/db-accdescription-quotes] [fixture: c4/db-accdescr-quotes]

引数、
名前付きのキーと値、
説明ブロック内の LF は保持し、
CR と CRLF は Db が読む前に LF となる。
[fixture: c4/db-grid-cr-acc-descr-block] [fixture:
c4/db-grid-crlf-acc-descr-block] [fixture: c4/db-grid-lf-acc-descr-block]
[fixture: c4/db-grid-cr-text-argument-bare] [fixture:
c4/db-grid-crlf-text-argument-bare] [fixture: c4/db-grid-lf-text-argument-bare]
[fixture: c4/db-grid-cr-alias-argument-bare] [fixture:
c4/db-grid-crlf-alias-argument-bare] [fixture:
c4/db-grid-lf-alias-argument-bare] [fixture: c4/db-grid-cr-plain-argument-bare]
[fixture: c4/db-grid-crlf-plain-argument-bare] [fixture:
c4/db-grid-lf-plain-argument-bare] [fixture: c4/db-grid-cr-text-argument-quoted]
[fixture: c4/db-grid-crlf-text-argument-quoted] [fixture:
c4/db-grid-lf-text-argument-quoted] [fixture:
c4/db-grid-cr-alias-argument-quoted] [fixture:
c4/db-grid-crlf-alias-argument-quoted] [fixture:
c4/db-grid-lf-alias-argument-quoted] [fixture:
c4/db-grid-cr-plain-argument-quoted] [fixture:
c4/db-grid-crlf-plain-argument-quoted] [fixture:
c4/db-grid-lf-plain-argument-quoted] [fixture: c4/db-grid-cr-named-key]
[fixture: c4/db-grid-crlf-named-key] [fixture: c4/db-grid-lf-named-key]
[fixture: c4/db-grid-cr-named-value] [fixture: c4/db-grid-crlf-named-value]
[fixture: c4/db-grid-lf-named-value] [fixture: c4/db-grid-cr-style-value]
[fixture: c4/db-grid-crlf-style-value] [fixture: c4/db-grid-lf-style-value]

title、
accDescription、
accTitle、
accDescr の行の値の内部の LF はその値を終え、
これらの入力の残りの引用符なし単語は拒否される。
[fixture: c4/gram-grid-comment-line-title] [fixture: c4/gram-grid-cr-title]
[fixture: c4/gram-grid-crlf-title] [fixture: c4/gram-grid-directive-line-title]
[fixture: c4/gram-grid-lf-title] [fixture:
c4/gram-grid-comment-line-acc-description] [fixture:
c4/gram-grid-cr-acc-description] [fixture: c4/gram-grid-crlf-acc-description]
[fixture: c4/gram-grid-directive-line-acc-description] [fixture:
c4/gram-grid-lf-acc-description] [fixture: c4/gram-grid-comment-line-acc-title]
[fixture: c4/gram-grid-cr-acc-title] [fixture: c4/gram-grid-crlf-acc-title]
[fixture: c4/gram-grid-directive-line-acc-title] [fixture:
c4/gram-grid-lf-acc-title] [fixture: c4/gram-grid-comment-line-acc-descr]
[fixture: c4/gram-grid-cr-acc-descr] [fixture: c4/gram-grid-crlf-acc-descr]
[fixture: c4/gram-grid-directive-line-acc-descr] [fixture:
c4/gram-grid-lf-acc-descr]

閉じた directive はヘッダー、
キーワード、
題名、
引数、
名前付きキー、
名前付き値の内部でも除去される。
[fixture: c4/db-grid-directive-title] [fixture:
c4/db-grid-directive-acc-description] [fixture: c4/db-grid-directive-acc-title]
[fixture: c4/db-grid-directive-acc-descr] [fixture:
c4/db-grid-directive-acc-descr-block] [fixture:
c4/db-grid-directive-text-argument-bare] [fixture:
c4/db-grid-directive-alias-argument-bare] [fixture:
c4/db-grid-directive-plain-argument-bare] [fixture:
c4/db-grid-directive-text-argument-quoted] [fixture:
c4/db-grid-directive-alias-argument-quoted] [fixture:
c4/db-grid-directive-plain-argument-quoted] [fixture:
c4/db-grid-directive-named-key] [fixture: c4/db-grid-directive-named-value]
[fixture: c4/db-grid-directive-style-value] [fixture: c4/div-directive-header]
[fixture: c4/div-acc-title-directive] [fixture:
c4/div-acc-block-marker-directive] [fixture: c4/lex-directive-keyword] [fixture:
c4/lex-directive-bare-alias] [fixture: c4/lex-directive-named-key] [fixture:
c4/lex-directive-named-equals-quote] [fixture: c4/lex-directive-quoted]
[fixture: c4/lex-title-directive-value] [fixture: c4/lex-directive-line]
[fixture: c4/lex-directive-start] [fixture: c4/lex-directive-end]

独立行の directive の除去は引数と名前付きのキーと値の周囲の LF を残し、
accDescr の setter は LF 後の連続する空白を折り畳む。
[fixture: c4/db-grid-directive-line-text-argument-bare] [fixture:
c4/db-grid-directive-line-alias-argument-bare] [fixture:
c4/db-grid-directive-line-plain-argument-bare] [fixture:
c4/db-grid-directive-line-text-argument-quoted] [fixture:
c4/db-grid-directive-line-alias-argument-quoted] [fixture:
c4/db-grid-directive-line-plain-argument-quoted] [fixture:
c4/db-grid-directive-line-named-key] [fixture:
c4/db-grid-directive-line-named-value] [fixture:
c4/db-grid-directive-line-style-value] [fixture:
c4/db-grid-directive-line-acc-descr-block] [fixture: c4/lex-bare-crlf-directive]
[fixture: c4/lex-quote-crlf-directive]

引数、
名前付きのキーや値、
説明ブロック内のコメント行は除去し、
前後の文字を一つの LF でつなぐ。
[fixture: c4/db-grid-comment-line-acc-descr-block] [fixture:
c4/db-grid-comment-line-text-argument-bare] [fixture:
c4/db-grid-comment-line-alias-argument-bare] [fixture:
c4/db-grid-comment-line-plain-argument-bare] [fixture:
c4/db-grid-comment-line-text-argument-quoted] [fixture:
c4/db-grid-comment-line-alias-argument-quoted] [fixture:
c4/db-grid-comment-line-plain-argument-quoted] [fixture:
c4/db-grid-comment-line-named-key] [fixture:
c4/db-grid-comment-line-named-value] [fixture:
c4/db-grid-comment-line-style-value] [fixture: c4/lex-bare-comment-line]
[fixture: c4/lex-named-value-comment-line] [fixture: c4/lex-comment-line]

テキスト値と名前付きキーの内部の二つの百分率記号の断片は文字のまま残り、
長い引用符なし引数の内部の百分率記号だけの行も同様となる。
[fixture: c4/db-grid-comment-title] [fixture:
c4/db-grid-comment-acc-description] [fixture: c4/db-grid-comment-acc-title]
[fixture: c4/db-grid-comment-acc-descr] [fixture:
c4/db-grid-comment-acc-descr-block] [fixture:
c4/db-grid-comment-text-argument-bare] [fixture:
c4/db-grid-comment-alias-argument-bare] [fixture:
c4/db-grid-comment-plain-argument-bare] [fixture:
c4/db-grid-comment-text-argument-quoted] [fixture:
c4/db-grid-comment-alias-argument-quoted] [fixture:
c4/db-grid-comment-plain-argument-quoted] [fixture:
c4/db-grid-comment-named-key] [fixture: c4/db-grid-comment-named-value]
[fixture: c4/db-grid-comment-style-value] [fixture:
c4/lex-bare-multiple-line-comment] [fixture: c4/lex-comment-inline] [fixture:
c4/db-title-comment] [fixture: c4/db-acctitle-comment] [fixture:
c4/db-accdescription-comment] [fixture: c4/db-accdescr-comment]

引数、
名前付きのキーと値、
アクセシビリティのコロン行、
説明ブロックではハッシュとセミコロンを文字のまま保持する。
[fixture: c4/db-grid-hash-acc-title] [fixture: c4/db-grid-semicolon-acc-title]
[fixture: c4/db-grid-hash-acc-descr] [fixture: c4/db-grid-semicolon-acc-descr]
[fixture: c4/db-grid-hash-acc-descr-block] [fixture:
c4/db-grid-semicolon-acc-descr-block] [fixture:
c4/db-grid-hash-text-argument-bare] [fixture:
c4/db-grid-semicolon-text-argument-bare] [fixture:
c4/db-grid-hash-alias-argument-bare] [fixture:
c4/db-grid-semicolon-alias-argument-bare] [fixture:
c4/db-grid-hash-plain-argument-bare] [fixture:
c4/db-grid-semicolon-plain-argument-bare] [fixture:
c4/db-grid-hash-text-argument-quoted] [fixture:
c4/db-grid-semicolon-text-argument-quoted] [fixture:
c4/db-grid-hash-alias-argument-quoted] [fixture:
c4/db-grid-semicolon-alias-argument-quoted] [fixture:
c4/db-grid-hash-plain-argument-quoted] [fixture:
c4/db-grid-semicolon-plain-argument-quoted] [fixture: c4/db-grid-hash-named-key]
[fixture: c4/db-grid-semicolon-named-key] [fixture: c4/db-grid-hash-named-value]
[fixture: c4/db-grid-semicolon-named-value] [fixture:
c4/db-grid-hash-style-value] [fixture: c4/db-grid-semicolon-style-value]
[fixture: c4/db-acctitle-hash] [fixture: c4/db-accdescr-hash] [fixture:
c4/db-acctitle-semicolon] [fixture: c4/db-accdescr-semicolon]

ハッシュとセミコロンは title と accDescription の文字列を終え、
`&amp;` の末尾も含めて後続の引用符なしの断片は拒否される。
[fixture: c4/gram-grid-ampersand-entity-title] [fixture:
c4/gram-grid-hash-title] [fixture: c4/gram-grid-semicolon-title] [fixture:
c4/gram-grid-ampersand-entity-acc-description] [fixture:
c4/gram-grid-hash-acc-description] [fixture:
c4/gram-grid-semicolon-acc-description] [fixture: c4/lex-title-hash-first]
[fixture: c4/lex-title-semicolon-selected] [fixture:
c4/lex-title-single-space-eof] [fixture: c4/db-title-hash] [fixture:
c4/db-accdescription-hash] [fixture: c4/db-title-semicolon] [fixture:
c4/db-accdescription-semicolon]

HTML 形式の `&amp;` は引数、
名前付きのキーと値、
アクセシビリティのコロン行、
説明ブロックでは文字のまま残る。
[fixture: c4/db-grid-ampersand-entity-acc-title] [fixture:
c4/db-grid-ampersand-entity-acc-descr] [fixture:
c4/db-grid-ampersand-entity-acc-descr-block] [fixture:
c4/db-grid-ampersand-entity-text-argument-bare] [fixture:
c4/db-grid-ampersand-entity-alias-argument-bare] [fixture:
c4/db-grid-ampersand-entity-plain-argument-bare] [fixture:
c4/db-grid-ampersand-entity-text-argument-quoted] [fixture:
c4/db-grid-ampersand-entity-alias-argument-quoted] [fixture:
c4/db-grid-ampersand-entity-plain-argument-quoted] [fixture:
c4/db-grid-ampersand-entity-named-key] [fixture:
c4/db-grid-ampersand-entity-named-value] [fixture:
c4/db-grid-ampersand-entity-style-value]

Mermaid の文字参照は仮表記で保持し、
`#N;` は `\ufb02\u00b0\u00b0N\u00b6\u00df`、
`#name;` は `\ufb02\u00b0name\u00b6\u00df` となる。
[fixture: c4/db-grid-entity-title] [fixture: c4/db-grid-entity-named-title]
[fixture: c4/db-grid-entity-acc-description] [fixture:
c4/db-grid-entity-named-acc-description] [fixture: c4/db-grid-entity-acc-title]
[fixture: c4/db-grid-entity-named-acc-title] [fixture:
c4/db-grid-entity-acc-descr] [fixture: c4/db-grid-entity-named-acc-descr]
[fixture: c4/db-grid-entity-acc-descr-block] [fixture:
c4/db-grid-entity-named-acc-descr-block] [fixture:
c4/db-grid-entity-text-argument-bare] [fixture:
c4/db-grid-entity-named-text-argument-bare] [fixture:
c4/db-grid-entity-alias-argument-bare] [fixture:
c4/db-grid-entity-named-alias-argument-bare] [fixture:
c4/db-grid-entity-plain-argument-bare] [fixture:
c4/db-grid-entity-named-plain-argument-bare] [fixture:
c4/db-grid-entity-text-argument-quoted] [fixture:
c4/db-grid-entity-named-text-argument-quoted] [fixture:
c4/db-grid-entity-alias-argument-quoted] [fixture:
c4/db-grid-entity-named-alias-argument-quoted] [fixture:
c4/db-grid-entity-plain-argument-quoted] [fixture:
c4/db-grid-entity-named-plain-argument-quoted] [fixture:
c4/db-grid-entity-named-key] [fixture: c4/db-grid-entity-named-named-key]
[fixture: c4/db-grid-entity-named-value] [fixture:
c4/db-grid-entity-named-named-value] [fixture: c4/db-grid-entity-style-value]
[fixture: c4/db-grid-entity-named-style-value] [fixture: c4/db-title-entity]
[fixture: c4/db-acctitle-entity] [fixture: c4/db-accdescription-entity]
[fixture: c4/db-accdescr-entity]

HTML タグと改行タグの断片は C4 構文として解釈せず、
保存する文字列に残す。
[fixture: c4/db-grid-html-title] [fixture: c4/db-grid-html-br-title] [fixture:
c4/db-grid-html-acc-description] [fixture: c4/db-grid-html-br-acc-description]
[fixture: c4/db-grid-html-acc-title] [fixture: c4/db-grid-html-br-acc-title]
[fixture: c4/db-grid-html-acc-descr] [fixture: c4/db-grid-html-br-acc-descr]
[fixture: c4/db-grid-html-acc-descr-block] [fixture:
c4/db-grid-html-br-acc-descr-block] [fixture:
c4/db-grid-html-text-argument-bare] [fixture:
c4/db-grid-html-br-text-argument-bare] [fixture:
c4/db-grid-html-alias-argument-bare] [fixture:
c4/db-grid-html-br-alias-argument-bare] [fixture:
c4/db-grid-html-plain-argument-bare] [fixture:
c4/db-grid-html-br-plain-argument-bare] [fixture:
c4/db-grid-html-text-argument-quoted] [fixture:
c4/db-grid-html-br-text-argument-quoted] [fixture:
c4/db-grid-html-alias-argument-quoted] [fixture:
c4/db-grid-html-br-alias-argument-quoted] [fixture:
c4/db-grid-html-plain-argument-quoted] [fixture:
c4/db-grid-html-br-plain-argument-quoted] [fixture: c4/db-grid-html-named-key]
[fixture: c4/db-grid-html-br-named-key] [fixture: c4/db-grid-html-named-value]
[fixture: c4/db-grid-html-br-named-value] [fixture: c4/db-grid-html-style-value]
[fixture: c4/db-grid-html-br-style-value] [fixture: c4/db-title-html] [fixture:
c4/db-acctitle-html] [fixture: c4/db-accdescription-html] [fixture:
c4/db-accdescr-html]
[fixture: c4/demo-c4context-1d531a27]
[fixture: c4/docs-syntax-c4-90f106b9]
[fixture: c4/docs-syntax-c4-bc80e69a]

HTML 属性の文字列内の二重引用符は、
C4 が引数、
題名、
アクセシビリティの値を読む前に単一引用符となる。
[fixture: c4/db-grid-html-attribute-title] [fixture:
c4/db-grid-html-attribute-acc-description] [fixture:
c4/db-grid-html-attribute-acc-title] [fixture:
c4/db-grid-html-attribute-acc-descr] [fixture:
c4/db-grid-html-attribute-acc-descr-block] [fixture:
c4/db-grid-html-attribute-text-argument-bare] [fixture:
c4/db-grid-html-attribute-alias-argument-bare] [fixture:
c4/db-grid-html-attribute-plain-argument-bare] [fixture:
c4/db-grid-html-attribute-text-argument-quoted] [fixture:
c4/db-grid-html-attribute-alias-argument-quoted] [fixture:
c4/db-grid-html-attribute-plain-argument-quoted] [fixture:
c4/db-grid-html-attribute-named-value] [fixture:
c4/db-grid-html-attribute-style-value] [fixture: c4/div-frontmatter-open-tag]

この綴りの `style` または `classDef` の断片の後に、
同じ行でコロンと空白を挟まないハッシュがある場合、
ハッシュの後の最後のセミコロンを、
後の引数やキーワードの内部でも除去する。
[fixture: c4/db-grid-classdef-rule-acc-title] [fixture:
c4/db-grid-style-rule-acc-title] [fixture: c4/db-grid-classdef-rule-acc-descr]
[fixture: c4/db-grid-style-rule-acc-descr] [fixture:
c4/db-grid-classdef-rule-acc-descr-block] [fixture:
c4/db-grid-style-rule-acc-descr-block] [fixture:
c4/db-grid-classdef-rule-text-argument-bare] [fixture:
c4/db-grid-style-rule-text-argument-bare] [fixture:
c4/db-grid-classdef-rule-alias-argument-bare] [fixture:
c4/db-grid-style-rule-alias-argument-bare] [fixture:
c4/db-grid-classdef-rule-plain-argument-bare] [fixture:
c4/db-grid-style-rule-plain-argument-bare] [fixture:
c4/db-grid-classdef-rule-text-argument-quoted] [fixture:
c4/db-grid-style-rule-text-argument-quoted] [fixture:
c4/db-grid-classdef-rule-alias-argument-quoted] [fixture:
c4/db-grid-style-rule-alias-argument-quoted] [fixture:
c4/db-grid-classdef-rule-plain-argument-quoted] [fixture:
c4/db-grid-style-rule-plain-argument-quoted] [fixture:
c4/db-grid-classdef-rule-named-key] [fixture: c4/db-grid-style-rule-named-key]
[fixture: c4/db-grid-classdef-rule-named-value] [fixture:
c4/db-grid-style-rule-named-value] [fixture:
c4/db-grid-classdef-rule-style-value] [fixture:
c4/db-grid-style-rule-style-value] [fixture: c4/db-preprocessing-style]
[fixture: c4/db-preprocessing-classdef] [fixture:
c4/db-preprocessing-two-semicolons] [fixture: c4/db-preprocessing-quoted-line]
[fixture: c4/lex-semicolon-delimiter-selected] [fixture:
c4/lex-semicolon-key-selected] [fixture: c4/lex-semicolon-text-selected]
[fixture: c4/div-semicolon-call-keyword-after-block]

スタイルに似た断片のセミコロンを除去してもハッシュは残り、
title と accDescription の値の内部では拒否される。
[fixture: c4/gram-grid-classdef-rule-title] [fixture:
c4/gram-grid-style-rule-title] [fixture:
c4/gram-grid-classdef-rule-acc-description] [fixture:
c4/gram-grid-style-rule-acc-description]

大文字の `Style`、
ハッシュの欠落、
コロンとハッシュの間の空白や LF、
スタイルに似た断片より前のセミコロンではこの除去を行わず、
文字参照の符号化は適用する。
[fixture: c4/db-preprocessing-space] [fixture: c4/db-preprocessing-upper]
[fixture: c4/db-preprocessing-no-hash] [fixture: c4/db-preprocessing-other-line]
[fixture: c4/lex-semicolon-bare-alias] [fixture: c4/lex-semicolon-keyword]
[fixture: c4/lex-semicolon-keyword-selected] [fixture:
c4/lex-semicolon-keyword-selected-same-line] [fixture:
c4/lex-semicolon-named-delimiter]

未対応の securityLevel で HTML ラベルを無効にすると、
題名とアクセシビリティのマークアップは文字のまま残るが、
ラベル `<b>A</b> = value` は `A` として保持する。
[fixture: c4/config-security-level-other-html-labels-false] [fixture:
c4/config-security-level-other-flowchart-html-labels-false]

### 題名と説明と境界の本体

空の title と accDescription の値は拒否されるが、
空の accTitle と accDescr のコロン行は後続の文を値へ取り込むことがある。
[fixture: c4/db-title-empty] [fixture: c4/db-accdescription-empty] [fixture:
c4/db-acctitle-empty] [fixture: c4/db-accdescr-empty]

境界と配置ノードは波括弧と本体の最初の図の文を必要とし、
空の本体、
先頭の題名、
題名だけの本体、
空の説明ブロックだけの本体は拒否される。
[fixture: c4/gram-boundary-no-brace] [fixture: c4/gram-boundary-empty] [fixture:
c4/gram-boundary-empty-same-line] [fixture: c4/gram-boundary-only-title]
[fixture: c4/gram-boundary-title-first] [fixture:
c4/gram-boundary-empty-block-body-only] [fixture: c4/gram-boundary-unclosed]

境界の宣言と同じ行の開き波括弧は後続の改行を必要とし、
次の行の開き波括弧は直後に最初の子を置ける。
[fixture: c4/gram-boundary-same-line] [fixture: c4/gram-boundary-next-line]
[fixture: c4/gram-boundary-next-line-inline-child]

題名とアクセシビリティの文は境界の内部も含めて図の文の後に続けられ、
図の共有フィールドを更新する。
[fixture: c4/gram-other-statements-after-shape] [fixture:
c4/gram-title-inside-boundary]

空でない accDescr ブロックは同じ行か次の行に波括弧を開け、
本体全体となることも、
直後に図の文を続けることもできる。
[fixture: c4/gram-acc-descr-block-same-line] [fixture:
c4/gram-acc-descr-block-next-line] [fixture:
c4/gram-acc-descr-block-after-text-same-line] [fixture:
c4/gram-acc-descr-block-after-text-next-line] [fixture:
c4/gram-acc-descr-block-statement-after-brace] [fixture:
c4/gram-acc-descr-block-after-text-statement-after-brace] [fixture:
c4/gram-body-only-description-block]

空または空白だけの accDescr ブロックは値のトークンを出さず、
単独の空ブロックや別の文の前の二つの空ブロックは、
拒否される改行を残すことがある。
[fixture: c4/gram-acc-descr-block-after-text-blank-lines] [fixture:
c4/gram-acc-descr-block-after-text-space] [fixture:
c4/gram-acc-descr-block-after-text-tab] [fixture:
c4/gram-acc-descr-block-after-text-two-empty] [fixture:
c4/gram-acc-descr-block-blank-lines] [fixture: c4/gram-acc-descr-block-empty]
[fixture: c4/gram-acc-descr-block-space] [fixture: c4/gram-acc-descr-block-tab]
[fixture: c4/gram-acc-descr-block-two-empty] [fixture:
c4/gram-empty-block-alone-before-person] [fixture: c4/gram-empty-block-only]

トークンを出さない空の accDescr ブロックは、
除去される directive の前も含めてヘッダーと改行の間に置け、
説明を設定しない。
[fixture: c4/gram-empty-block-header-gap] [fixture:
c4/gram-empty-block-header-followed-directive]

閉じていない説明ブロックと閉じ波括弧の後の単なる文字は拒否され、
accTitle と accDescription に複数行ブロック形式はない。
[fixture: c4/gram-acc-descr-block-after-text-text-after-brace] [fixture:
c4/gram-acc-descr-block-after-text-unclosed] [fixture:
c4/gram-acc-descr-block-text-after-brace] [fixture:
c4/gram-acc-descr-block-unclosed] [fixture:
c4/lex-acc-block-unclosed-after-text] [fixture: c4/gram-acc-title-block]
[fixture: c4/gram-acc-description-block]

`title` と `accDescription` は値の前の区切りとして一つの LF、
CRLF、
U+2028 を取れるが、
余分な空行や directive 行は値のない状態を残して入力を拒否させることがある。
[fixture: c4/lex-title-newline-value] [fixture: c4/lex-title-separator-crlf]
[fixture: c4/lex-title-separator-ls] [fixture:
c4/lex-keyword-gap-accdescription-blank-line] [fixture:
c4/lex-keyword-gap-accdescription-comment-line] [fixture:
c4/lex-keyword-gap-accdescription-directive-line] [fixture:
c4/lex-keyword-gap-accdescription-lf] [fixture:
c4/lex-keyword-gap-title-blank-line] [fixture:
c4/lex-keyword-gap-title-comment-line] [fixture:
c4/lex-keyword-gap-title-directive-line] [fixture: c4/lex-keyword-gap-title-lf]

accTitle と accDescr のコロンの後の空白は LF、
空行、
除去されたコメント行や directive 行を含められ、
次の空でない行が値となる。
[fixture: c4/lex-keyword-gap-accdescr-blank-line] [fixture:
c4/lex-keyword-gap-accdescr-comment-line] [fixture:
c4/lex-keyword-gap-accdescr-directive-line] [fixture:
c4/lex-keyword-gap-accdescr-lf] [fixture:
c4/lex-keyword-gap-acctitle-blank-line] [fixture:
c4/lex-keyword-gap-acctitle-comment-line] [fixture:
c4/lex-keyword-gap-acctitle-directive-line] [fixture:
c4/lex-keyword-gap-acctitle-lf] [fixture: c4/lex-acc-title-next-line-hash]
[fixture: c4/lex-acc-title-empty-before-hash] [fixture:
c4/lex-acc-title-empty-before-semicolon] [fixture:
c4/lex-acc-title-direction-next-line]

題名やアクセシビリティの値が完結する前の入力末尾は拒否される。
[fixture: c4/gram-unclosed-accdescr] [fixture: c4/gram-unclosed-accdescription]
[fixture: c4/gram-unclosed-acctitle] [fixture: c4/gram-unclosed-title]

### 配置とオフセット

空のオフセット引数と数値の接頭辞を持たない引数は、
引用符の有無によらず `NaN` となる。
[fixture: c4/db-grid-ampersand-entity-offset-argument-bare] [fixture:
c4/db-grid-arrow-offset-argument-bare] [fixture:
c4/db-grid-arrow-spaced-offset-argument-bare] [fixture:
c4/db-grid-backslash-offset-argument-bare] [fixture:
c4/db-grid-backtick-offset-argument-bare] [fixture:
c4/db-grid-bom-offset-argument-bare] [fixture:
c4/db-grid-classdef-rule-offset-argument-bare] [fixture:
c4/db-grid-close-brace-offset-argument-bare] [fixture:
c4/db-grid-close-round-offset-argument-bare] [fixture:
c4/db-grid-close-square-offset-argument-bare] [fixture:
c4/db-grid-colon-offset-argument-bare] [fixture:
c4/db-grid-comma-offset-argument-bare] [fixture:
c4/db-grid-comment-offset-argument-bare] [fixture:
c4/db-grid-comment-line-offset-argument-bare] [fixture:
c4/db-grid-constructor-offset-argument-bare] [fixture:
c4/db-grid-cr-offset-argument-bare] [fixture:
c4/db-grid-crlf-offset-argument-bare] [fixture:
c4/db-grid-dash-offset-argument-bare] [fixture:
c4/db-grid-digits-offset-argument-bare] [fixture:
c4/db-grid-directive-offset-argument-bare] [fixture:
c4/db-grid-directive-line-offset-argument-bare] [fixture:
c4/db-grid-emoji-offset-argument-bare] [fixture:
c4/db-grid-empty-offset-argument-bare] [fixture:
c4/db-grid-entity-offset-argument-bare] [fixture:
c4/db-grid-entity-named-offset-argument-bare] [fixture:
c4/db-grid-equals-offset-argument-bare] [fixture:
c4/db-grid-ff-offset-argument-bare] [fixture:
c4/db-grid-greater-than-offset-argument-bare] [fixture:
c4/db-grid-hash-offset-argument-bare] [fixture:
c4/db-grid-html-offset-argument-bare] [fixture:
c4/db-grid-html-attribute-offset-argument-bare] [fixture:
c4/db-grid-html-br-offset-argument-bare] [fixture:
c4/db-grid-ideographic-offset-argument-bare] [fixture:
c4/db-grid-keyword-offset-argument-bare] [fixture:
c4/db-grid-keyword-block-offset-argument-bare] [fixture:
c4/db-grid-keyword-class-offset-argument-bare] [fixture:
c4/db-grid-keyword-classdef-offset-argument-bare] [fixture:
c4/db-grid-keyword-columns-offset-argument-bare] [fixture:
c4/db-grid-keyword-end-offset-argument-bare] [fixture:
c4/db-grid-keyword-header-offset-argument-bare] [fixture:
c4/db-grid-keyword-space-offset-argument-bare] [fixture:
c4/db-grid-keyword-style-offset-argument-bare] [fixture:
c4/db-grid-less-than-offset-argument-bare] [fixture:
c4/db-grid-lf-offset-argument-bare] [fixture:
c4/db-grid-ls-offset-argument-bare] [fixture:
c4/db-grid-nbsp-offset-argument-bare] [fixture:
c4/db-grid-nel-offset-argument-bare] [fixture:
c4/db-grid-nonascii-offset-argument-bare] [fixture:
c4/db-grid-open-brace-offset-argument-bare] [fixture:
c4/db-grid-open-round-offset-argument-bare] [fixture:
c4/db-grid-open-square-offset-argument-bare] [fixture:
c4/db-grid-percent-offset-argument-bare] [fixture:
c4/db-grid-pipe-offset-argument-bare] [fixture:
c4/db-grid-proto-offset-argument-bare] [fixture:
c4/db-grid-ps-offset-argument-bare] [fixture:
c4/db-grid-punct-offset-argument-bare] [fixture:
c4/db-grid-quote-offset-argument-bare] [fixture:
c4/db-grid-root-offset-argument-bare] [fixture:
c4/db-grid-semicolon-offset-argument-bare] [fixture:
c4/db-grid-single-quote-offset-argument-bare] [fixture:
c4/db-grid-spaces-offset-argument-bare] [fixture:
c4/db-grid-style-rule-offset-argument-bare] [fixture:
c4/db-grid-tab-offset-argument-bare] [fixture:
c4/db-grid-vt-offset-argument-bare] [fixture:
c4/db-grid-ampersand-entity-offset-argument-quoted] [fixture:
c4/db-grid-arrow-offset-argument-quoted] [fixture:
c4/db-grid-arrow-spaced-offset-argument-quoted] [fixture:
c4/db-grid-backslash-offset-argument-quoted] [fixture:
c4/db-grid-backtick-offset-argument-quoted] [fixture:
c4/db-grid-bom-offset-argument-quoted] [fixture:
c4/db-grid-classdef-rule-offset-argument-quoted] [fixture:
c4/db-grid-close-brace-offset-argument-quoted] [fixture:
c4/db-grid-close-round-offset-argument-quoted] [fixture:
c4/db-grid-close-square-offset-argument-quoted] [fixture:
c4/db-grid-colon-offset-argument-quoted] [fixture:
c4/db-grid-comma-offset-argument-quoted] [fixture:
c4/db-grid-comment-offset-argument-quoted] [fixture:
c4/db-grid-comment-line-offset-argument-quoted] [fixture:
c4/db-grid-constructor-offset-argument-quoted] [fixture:
c4/db-grid-cr-offset-argument-quoted] [fixture:
c4/db-grid-crlf-offset-argument-quoted] [fixture:
c4/db-grid-dash-offset-argument-quoted] [fixture:
c4/db-grid-digits-offset-argument-quoted] [fixture:
c4/db-grid-directive-offset-argument-quoted] [fixture:
c4/db-grid-directive-line-offset-argument-quoted] [fixture:
c4/db-grid-emoji-offset-argument-quoted] [fixture:
c4/db-grid-empty-offset-argument-quoted] [fixture:
c4/db-grid-entity-offset-argument-quoted] [fixture:
c4/db-grid-entity-named-offset-argument-quoted] [fixture:
c4/db-grid-equals-offset-argument-quoted] [fixture:
c4/db-grid-ff-offset-argument-quoted] [fixture:
c4/db-grid-greater-than-offset-argument-quoted] [fixture:
c4/db-grid-hash-offset-argument-quoted] [fixture:
c4/db-grid-html-offset-argument-quoted] [fixture:
c4/db-grid-html-attribute-offset-argument-quoted] [fixture:
c4/db-grid-html-br-offset-argument-quoted] [fixture:
c4/db-grid-ideographic-offset-argument-quoted] [fixture:
c4/db-grid-keyword-offset-argument-quoted] [fixture:
c4/db-grid-keyword-block-offset-argument-quoted] [fixture:
c4/db-grid-keyword-class-offset-argument-quoted] [fixture:
c4/db-grid-keyword-classdef-offset-argument-quoted] [fixture:
c4/db-grid-keyword-columns-offset-argument-quoted] [fixture:
c4/db-grid-keyword-end-offset-argument-quoted] [fixture:
c4/db-grid-keyword-header-offset-argument-quoted] [fixture:
c4/db-grid-keyword-space-offset-argument-quoted] [fixture:
c4/db-grid-keyword-style-offset-argument-quoted] [fixture:
c4/db-grid-less-than-offset-argument-quoted] [fixture:
c4/db-grid-lf-offset-argument-quoted] [fixture:
c4/db-grid-ls-offset-argument-quoted] [fixture:
c4/db-grid-nbsp-offset-argument-quoted] [fixture:
c4/db-grid-nel-offset-argument-quoted] [fixture:
c4/db-grid-nonascii-offset-argument-quoted] [fixture:
c4/db-grid-open-brace-offset-argument-quoted] [fixture:
c4/db-grid-open-round-offset-argument-quoted] [fixture:
c4/db-grid-open-square-offset-argument-quoted] [fixture:
c4/db-grid-percent-offset-argument-quoted] [fixture:
c4/db-grid-pipe-offset-argument-quoted] [fixture:
c4/db-grid-proto-offset-argument-quoted] [fixture:
c4/db-grid-ps-offset-argument-quoted] [fixture:
c4/db-grid-punct-offset-argument-quoted] [fixture:
c4/db-grid-quote-offset-argument-quoted] [fixture:
c4/db-grid-root-offset-argument-quoted] [fixture:
c4/db-grid-semicolon-offset-argument-quoted] [fixture:
c4/db-grid-single-quote-offset-argument-quoted] [fixture:
c4/db-grid-spaces-offset-argument-quoted] [fixture:
c4/db-grid-style-rule-offset-argument-quoted] [fixture:
c4/db-grid-tab-offset-argument-quoted] [fixture:
c4/db-grid-vt-offset-argument-quoted]

空の配置引数と数値の接頭辞を持たない引数は、
引用符の有無によらず行数を変更しない。
[fixture: c4/db-grid-ampersand-entity-layout-argument-bare] [fixture:
c4/db-grid-arrow-layout-argument-bare] [fixture:
c4/db-grid-arrow-spaced-layout-argument-bare] [fixture:
c4/db-grid-backslash-layout-argument-bare] [fixture:
c4/db-grid-backtick-layout-argument-bare] [fixture:
c4/db-grid-bom-layout-argument-bare] [fixture:
c4/db-grid-classdef-rule-layout-argument-bare] [fixture:
c4/db-grid-close-brace-layout-argument-bare] [fixture:
c4/db-grid-close-round-layout-argument-bare] [fixture:
c4/db-grid-close-square-layout-argument-bare] [fixture:
c4/db-grid-colon-layout-argument-bare] [fixture:
c4/db-grid-comma-layout-argument-bare] [fixture:
c4/db-grid-comment-layout-argument-bare] [fixture:
c4/db-grid-comment-line-layout-argument-bare] [fixture:
c4/db-grid-constructor-layout-argument-bare] [fixture:
c4/db-grid-cr-layout-argument-bare] [fixture:
c4/db-grid-crlf-layout-argument-bare] [fixture:
c4/db-grid-dash-layout-argument-bare] [fixture:
c4/db-grid-digits-layout-argument-bare] [fixture:
c4/db-grid-directive-layout-argument-bare] [fixture:
c4/db-grid-directive-line-layout-argument-bare] [fixture:
c4/db-grid-emoji-layout-argument-bare] [fixture:
c4/db-grid-empty-layout-argument-bare] [fixture:
c4/db-grid-entity-layout-argument-bare] [fixture:
c4/db-grid-entity-named-layout-argument-bare] [fixture:
c4/db-grid-equals-layout-argument-bare] [fixture:
c4/db-grid-ff-layout-argument-bare] [fixture:
c4/db-grid-greater-than-layout-argument-bare] [fixture:
c4/db-grid-hash-layout-argument-bare] [fixture:
c4/db-grid-html-layout-argument-bare] [fixture:
c4/db-grid-html-attribute-layout-argument-bare] [fixture:
c4/db-grid-html-br-layout-argument-bare] [fixture:
c4/db-grid-ideographic-layout-argument-bare] [fixture:
c4/db-grid-keyword-layout-argument-bare] [fixture:
c4/db-grid-keyword-block-layout-argument-bare] [fixture:
c4/db-grid-keyword-class-layout-argument-bare] [fixture:
c4/db-grid-keyword-classdef-layout-argument-bare] [fixture:
c4/db-grid-keyword-columns-layout-argument-bare] [fixture:
c4/db-grid-keyword-end-layout-argument-bare] [fixture:
c4/db-grid-keyword-header-layout-argument-bare] [fixture:
c4/db-grid-keyword-space-layout-argument-bare] [fixture:
c4/db-grid-keyword-style-layout-argument-bare] [fixture:
c4/db-grid-less-than-layout-argument-bare] [fixture:
c4/db-grid-lf-layout-argument-bare] [fixture:
c4/db-grid-ls-layout-argument-bare] [fixture:
c4/db-grid-nbsp-layout-argument-bare] [fixture:
c4/db-grid-nel-layout-argument-bare] [fixture:
c4/db-grid-nonascii-layout-argument-bare] [fixture:
c4/db-grid-open-brace-layout-argument-bare] [fixture:
c4/db-grid-open-round-layout-argument-bare] [fixture:
c4/db-grid-open-square-layout-argument-bare] [fixture:
c4/db-grid-percent-layout-argument-bare] [fixture:
c4/db-grid-pipe-layout-argument-bare] [fixture:
c4/db-grid-proto-layout-argument-bare] [fixture:
c4/db-grid-ps-layout-argument-bare] [fixture:
c4/db-grid-punct-layout-argument-bare] [fixture:
c4/db-grid-quote-layout-argument-bare] [fixture:
c4/db-grid-root-layout-argument-bare] [fixture:
c4/db-grid-semicolon-layout-argument-bare] [fixture:
c4/db-grid-single-quote-layout-argument-bare] [fixture:
c4/db-grid-spaces-layout-argument-bare] [fixture:
c4/db-grid-style-rule-layout-argument-bare] [fixture:
c4/db-grid-tab-layout-argument-bare] [fixture:
c4/db-grid-vt-layout-argument-bare] [fixture:
c4/db-grid-ampersand-entity-layout-argument-quoted] [fixture:
c4/db-grid-arrow-layout-argument-quoted] [fixture:
c4/db-grid-arrow-spaced-layout-argument-quoted] [fixture:
c4/db-grid-backslash-layout-argument-quoted] [fixture:
c4/db-grid-backtick-layout-argument-quoted] [fixture:
c4/db-grid-bom-layout-argument-quoted] [fixture:
c4/db-grid-classdef-rule-layout-argument-quoted] [fixture:
c4/db-grid-close-brace-layout-argument-quoted] [fixture:
c4/db-grid-close-round-layout-argument-quoted] [fixture:
c4/db-grid-close-square-layout-argument-quoted] [fixture:
c4/db-grid-colon-layout-argument-quoted] [fixture:
c4/db-grid-comma-layout-argument-quoted] [fixture:
c4/db-grid-comment-layout-argument-quoted] [fixture:
c4/db-grid-comment-line-layout-argument-quoted] [fixture:
c4/db-grid-constructor-layout-argument-quoted] [fixture:
c4/db-grid-cr-layout-argument-quoted] [fixture:
c4/db-grid-crlf-layout-argument-quoted] [fixture:
c4/db-grid-dash-layout-argument-quoted] [fixture:
c4/db-grid-digits-layout-argument-quoted] [fixture:
c4/db-grid-directive-layout-argument-quoted] [fixture:
c4/db-grid-directive-line-layout-argument-quoted] [fixture:
c4/db-grid-emoji-layout-argument-quoted] [fixture:
c4/db-grid-empty-layout-argument-quoted] [fixture:
c4/db-grid-entity-layout-argument-quoted] [fixture:
c4/db-grid-entity-named-layout-argument-quoted] [fixture:
c4/db-grid-equals-layout-argument-quoted] [fixture:
c4/db-grid-ff-layout-argument-quoted] [fixture:
c4/db-grid-greater-than-layout-argument-quoted] [fixture:
c4/db-grid-hash-layout-argument-quoted] [fixture:
c4/db-grid-html-layout-argument-quoted] [fixture:
c4/db-grid-html-attribute-layout-argument-quoted] [fixture:
c4/db-grid-html-br-layout-argument-quoted] [fixture:
c4/db-grid-ideographic-layout-argument-quoted] [fixture:
c4/db-grid-keyword-layout-argument-quoted] [fixture:
c4/db-grid-keyword-block-layout-argument-quoted] [fixture:
c4/db-grid-keyword-class-layout-argument-quoted] [fixture:
c4/db-grid-keyword-classdef-layout-argument-quoted] [fixture:
c4/db-grid-keyword-columns-layout-argument-quoted] [fixture:
c4/db-grid-keyword-end-layout-argument-quoted] [fixture:
c4/db-grid-keyword-header-layout-argument-quoted] [fixture:
c4/db-grid-keyword-space-layout-argument-quoted] [fixture:
c4/db-grid-keyword-style-layout-argument-quoted] [fixture:
c4/db-grid-less-than-layout-argument-quoted] [fixture:
c4/db-grid-lf-layout-argument-quoted] [fixture:
c4/db-grid-ls-layout-argument-quoted] [fixture:
c4/db-grid-nbsp-layout-argument-quoted] [fixture:
c4/db-grid-nel-layout-argument-quoted] [fixture:
c4/db-grid-nonascii-layout-argument-quoted] [fixture:
c4/db-grid-open-brace-layout-argument-quoted] [fixture:
c4/db-grid-open-round-layout-argument-quoted] [fixture:
c4/db-grid-open-square-layout-argument-quoted] [fixture:
c4/db-grid-percent-layout-argument-quoted] [fixture:
c4/db-grid-pipe-layout-argument-quoted] [fixture:
c4/db-grid-proto-layout-argument-quoted] [fixture:
c4/db-grid-ps-layout-argument-quoted] [fixture:
c4/db-grid-punct-layout-argument-quoted] [fixture:
c4/db-grid-quote-layout-argument-quoted] [fixture:
c4/db-grid-root-layout-argument-quoted] [fixture:
c4/db-grid-semicolon-layout-argument-quoted] [fixture:
c4/db-grid-single-quote-layout-argument-quoted] [fixture:
c4/db-grid-spaces-layout-argument-quoted] [fixture:
c4/db-grid-style-rule-layout-argument-quoted] [fixture:
c4/db-grid-tab-layout-argument-quoted] [fixture:
c4/db-grid-vt-layout-argument-quoted]

引用符なしのコンマや早い閉じ引用符は、
数値でない断片を二つ目の数値位置へずらし、
offsetY を `NaN` とする一方で c4BoundaryInRow は以前の値を保持する。
[fixture: c4/db-grid-comma-offset-argument-bare] [fixture:
c4/db-grid-punct-offset-argument-bare] [fixture:
c4/db-grid-quote-offset-argument-quoted] [fixture:
c4/db-grid-comma-layout-argument-bare] [fixture:
c4/db-grid-punct-layout-argument-bare] [fixture:
c4/db-grid-quote-layout-argument-quoted]

## venn

`normalizeVenn()`（`src/normalizers/venn.ts`）は、
[vennDB.ts](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L22-L133)
の共有 Db を要約する。
[fixture: venn/db-all-fields]

要約は
[`getDiagramTitle()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L32-L32)
から `title` を得る。
[fixture: venn/db-all-fields]
[fixture: venn/db-frontmatter-title]

要約は
[`getAccTitle()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L20-L20)
から `accTitle` を得る。
[fixture: venn/db-frontmatter-accessibility]
[fixture: venn/header-only]

要約は
[`getAccDescription()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L26-L26)
から `accDescr` を得る。
[fixture: venn/db-frontmatter-accessibility]
[fixture: venn/header-only]

`subsets` は
[`getSubsetData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L38-L40)
から得る。
[fixture: venn/db-all-fields]

`texts` は
[`getTextData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L88-L90)
から得る。
[fixture: venn/db-all-fields]

`styles` は
[`getStyleData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L72-L74)
から得る。
[fixture: venn/db-all-fields]

三つの配列は重複する宣言を含めて宣言順を保つ。
[fixture: venn/db-style-three-definitions]
[fixture: venn/db-text-three-definitions]
[fixture: venn/db-three-definitions]
[fixture: venn/demo-venn-0d817555]
[fixture: venn/demo-venn-30b70b4c]
[fixture: venn/demo-venn-4f81eecc]
[fixture: venn/demo-venn-5a5405c7]
[fixture: venn/demo-venn-6f1fb809]
[fixture: venn/demo-venn-7526522b]
[fixture: venn/demo-venn-855cfd39]
[fixture: venn/demo-venn-875948cd]
[fixture: venn/demo-venn-8f9aeefc]
[fixture: venn/demo-venn-beda756a]
[fixture: venn/demo-venn-c2dd3beb]
[fixture: venn/demo-venn-eccf2f74]
[fixture: venn/docs-syntax-venn-43f17aa1]
[fixture: venn/docs-syntax-venn-4ac8b1e3]
[fixture: venn/docs-syntax-venn-74014555]
[fixture: venn/docs-syntax-venn-7e1f629a]
[fixture: venn/docs-syntax-venn-9a53dbe6]
[fixture: venn/docs-syntax-venn-ac6de7c7]
[fixture: venn/docs-syntax-venn-cd2ead2b]
[fixture: venn/docs-syntax-venn-dbe2e15b]
[fixture: venn/spec-venn-0cf96be0]
[fixture: venn/spec-venn-209cd4ba]
[fixture: venn/spec-venn-228bfe87]
[fixture: venn/spec-venn-3f44150e]
[fixture: venn/spec-venn-4fdc103a]
[fixture: venn/spec-venn-83701753]
[fixture: venn/spec-venn-850680f1]
[fixture: venn/spec-venn-85a3609e]
[fixture: venn/spec-venn-951627a3]
[fixture: venn/spec-venn-a47b6a31]
[fixture: venn/spec-venn-aa7d1ad8]
[fixture: venn/spec-venn-ab635fc5]
[fixture: venn/spec-venn-ef1992f9]

同じソート済みの要素を持つ三度目の union は、
固有のサイズを持つ集合の要素を追加する。
[fixture: venn/db-union-three-definitions]

同じ対象への三度目の style 文は、
その文のプロパティだけを持つ別の要素を追加する。
[fixture: venn/db-style-three-definitions-same-target]

集合の要素は `{ sets, size, label? }`、
テキストノードは `{ sets, id, label? }`、
style の要素は `{ targets, styles }` を保ち、
未定義のラベルは省略する。
[fixture: venn/db-form-set]
[fixture: venn/db-form-style-id]
[fixture: venn/db-form-text-id]
[fixture: venn/db-label-empty]

要約は描画設定の
[`getConfig()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L100-L102)
と、
解析状態である既知の集合の表、現在の集合、
字下げモードと一時的な字下げフラグを省き、
描画座標、配色、生成 id、暗黙の二集合の重なりを追加しない。
[fixture: venn/db-form-union]
[fixture: venn/db-indent-width]
[fixture: venn/db-union-repeated-member]

Db の
[`customClear()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L104-L112)
は共通の
[`clear()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L10-L14)
を呼び、
宣言と解析状態を消去する。
[fixture: venn/db-all-fields]
[fixture: venn/header-only]

前の入力のタイトル、アクセシビリティの文字、
宣言、字下げ状態は残らない。
[fixture: venn/db-all-fields]
[fixture: venn/header-only]

`set` は一つの識別子と任意の括弧ラベル、
任意の数値サイズを追加し、
`union` は同じ二つの任意引数とソート済みの識別子列を追加する。
[fixture: venn/db-form-set]
[fixture: venn/db-form-set-label]
[fixture: venn/db-form-set-label-size]
[fixture: venn/db-form-set-size]
[fixture: venn/db-form-union]
[fixture: venn/db-form-union-label]
[fixture: venn/db-form-union-label-size]
[fixture: venn/db-form-union-size]

集合、重なり、text、style の文の引数と、
任意のラベルやサイズの接尾辞の間はスペースやタブで区切れる。
[fixture: venn/db-set-label-space]
[fixture: venn/db-set-label-tab]
[fixture: venn/db-set-label-size-label-space]
[fixture: venn/db-set-label-size-label-tab]
[fixture: venn/db-set-size-space]
[fixture: venn/db-set-size-tab]
[fixture: venn/db-set-label-size-size-space]
[fixture: venn/db-set-label-size-size-tab]
[fixture: venn/db-union-label-space]
[fixture: venn/db-union-label-tab]
[fixture: venn/db-union-label-size-label-space]
[fixture: venn/db-union-label-size-label-tab]
[fixture: venn/db-union-size-space]
[fixture: venn/db-union-size-tab]
[fixture: venn/db-union-label-size-size-space]
[fixture: venn/db-union-label-size-size-tab]
[fixture: venn/db-form-text-id]
[fixture: venn/db-text-target-id-tab]
[fixture: venn/db-text-target-string-space]
[fixture: venn/db-text-target-string-tab]
[fixture: venn/db-text-target-number-space]
[fixture: venn/db-text-target-number-tab]
[fixture: venn/db-text-id-label-space]
[fixture: venn/db-text-id-label-tab]
[fixture: venn/db-text-string-label-space]
[fixture: venn/db-text-string-label-tab]
[fixture: venn/db-form-indent-id]
[fixture: venn/db-indent-keyword-id-tab]
[fixture: venn/db-indent-keyword-string-space]
[fixture: venn/db-indent-keyword-string-tab]
[fixture: venn/db-indent-keyword-number-space]
[fixture: venn/db-indent-keyword-number-tab]
[fixture: venn/db-indent-id-label-space]
[fixture: venn/db-indent-id-label-tab]
[fixture: venn/db-indent-string-label-space]
[fixture: venn/db-indent-string-label-tab]
[fixture: venn/db-size-space]
[fixture: venn/db-set-colon-size-tab]
[fixture: venn/db-set-label-colon-size-space]
[fixture: venn/db-set-label-colon-size-tab]
[fixture: venn/db-union-colon-size-space]
[fixture: venn/db-union-colon-size-tab]
[fixture: venn/db-union-label-colon-size-space]
[fixture: venn/db-union-label-colon-size-tab]
[fixture: venn/db-style-target-property-space]
[fixture: venn/db-style-target-property-tab]
[fixture: venn/db-style-property-colon-space]
[fixture: venn/db-style-property-colon-tab]
[fixture: venn/db-style-colon-value-space]
[fixture: venn/db-style-colon-value-tab]

それらの引数境界は LF や CRLF をまたげず、
間に空行、コメント行、directive 行がある場合も拒否する。
[fixture: venn/gram-set-label-next-line]
[fixture: venn/gram-set-label-comment-gap]
[fixture: venn/gram-set-label-directive-gap]
[fixture: venn/gram-set-label-blank-gap]
[fixture: venn/gram-set-label-crlf-gap]
[fixture: venn/gram-set-label-size-label-next-line]
[fixture: venn/gram-set-label-size-label-comment-gap]
[fixture: venn/gram-set-label-size-label-directive-gap]
[fixture: venn/gram-set-label-size-label-blank-gap]
[fixture: venn/gram-set-label-size-label-crlf-gap]
[fixture: venn/gram-set-size-next-line]
[fixture: venn/gram-set-size-comment-gap]
[fixture: venn/gram-set-size-directive-gap]
[fixture: venn/gram-set-size-blank-gap]
[fixture: venn/gram-set-size-crlf-gap]
[fixture: venn/gram-set-label-size-size-next-line]
[fixture: venn/gram-set-label-size-size-comment-gap]
[fixture: venn/gram-set-label-size-size-directive-gap]
[fixture: venn/gram-set-label-size-size-blank-gap]
[fixture: venn/gram-set-label-size-size-crlf-gap]
[fixture: venn/gram-union-label-next-line]
[fixture: venn/gram-union-label-comment-gap]
[fixture: venn/gram-union-label-directive-gap]
[fixture: venn/gram-union-label-blank-gap]
[fixture: venn/gram-union-label-crlf-gap]
[fixture: venn/gram-union-label-size-label-next-line]
[fixture: venn/gram-union-label-size-label-comment-gap]
[fixture: venn/gram-union-label-size-label-directive-gap]
[fixture: venn/gram-union-label-size-label-blank-gap]
[fixture: venn/gram-union-label-size-label-crlf-gap]
[fixture: venn/gram-union-size-next-line]
[fixture: venn/gram-union-size-comment-gap]
[fixture: venn/gram-union-size-directive-gap]
[fixture: venn/gram-union-size-blank-gap]
[fixture: venn/gram-union-size-crlf-gap]
[fixture: venn/gram-union-label-size-size-next-line]
[fixture: venn/gram-union-label-size-size-comment-gap]
[fixture: venn/gram-union-label-size-size-directive-gap]
[fixture: venn/gram-union-label-size-size-blank-gap]
[fixture: venn/gram-union-label-size-size-crlf-gap]
[fixture: venn/gram-text-target-id-next-line]
[fixture: venn/gram-text-target-id-comment-gap]
[fixture: venn/gram-text-target-id-directive-gap]
[fixture: venn/gram-text-target-id-blank-gap]
[fixture: venn/gram-text-target-id-crlf-gap]
[fixture: venn/gram-text-target-string-next-line]
[fixture: venn/gram-text-target-string-comment-gap]
[fixture: venn/gram-text-target-string-directive-gap]
[fixture: venn/gram-text-target-string-blank-gap]
[fixture: venn/gram-text-target-string-crlf-gap]
[fixture: venn/gram-text-target-number-next-line]
[fixture: venn/gram-text-target-number-comment-gap]
[fixture: venn/gram-text-target-number-directive-gap]
[fixture: venn/gram-text-target-number-blank-gap]
[fixture: venn/gram-text-target-number-crlf-gap]
[fixture: venn/gram-text-id-label-next-line]
[fixture: venn/gram-text-id-label-comment-gap]
[fixture: venn/gram-text-id-label-directive-gap]
[fixture: venn/gram-text-id-label-blank-gap]
[fixture: venn/gram-text-id-label-crlf-gap]
[fixture: venn/gram-text-string-label-next-line]
[fixture: venn/gram-text-string-label-comment-gap]
[fixture: venn/gram-text-string-label-directive-gap]
[fixture: venn/gram-text-string-label-blank-gap]
[fixture: venn/gram-text-string-label-crlf-gap]
[fixture: venn/gram-indent-keyword-id-next-line]
[fixture: venn/gram-indent-keyword-id-comment-gap]
[fixture: venn/gram-indent-keyword-id-directive-gap]
[fixture: venn/gram-indent-keyword-id-blank-gap]
[fixture: venn/gram-indent-keyword-id-crlf-gap]
[fixture: venn/gram-indent-keyword-string-next-line]
[fixture: venn/gram-indent-keyword-string-comment-gap]
[fixture: venn/gram-indent-keyword-string-directive-gap]
[fixture: venn/gram-indent-keyword-string-blank-gap]
[fixture: venn/gram-indent-keyword-string-crlf-gap]
[fixture: venn/gram-indent-keyword-number-next-line]
[fixture: venn/gram-indent-keyword-number-comment-gap]
[fixture: venn/gram-indent-keyword-number-directive-gap]
[fixture: venn/gram-indent-keyword-number-blank-gap]
[fixture: venn/gram-indent-keyword-number-crlf-gap]
[fixture: venn/gram-indent-id-label-next-line]
[fixture: venn/gram-indent-id-label-comment-gap]
[fixture: venn/gram-indent-id-label-directive-gap]
[fixture: venn/gram-indent-id-label-blank-gap]
[fixture: venn/gram-indent-id-label-crlf-gap]
[fixture: venn/gram-indent-string-label-next-line]
[fixture: venn/gram-indent-string-label-comment-gap]
[fixture: venn/gram-indent-string-label-directive-gap]
[fixture: venn/gram-indent-string-label-blank-gap]
[fixture: venn/gram-indent-string-label-crlf-gap]
[fixture: venn/gram-size-newline]
[fixture: venn/gram-set-colon-size-comment-gap]
[fixture: venn/gram-set-colon-size-directive-gap]
[fixture: venn/gram-set-colon-size-blank-gap]
[fixture: venn/gram-set-colon-size-crlf-gap]
[fixture: venn/gram-set-label-colon-size-next-line]
[fixture: venn/gram-set-label-colon-size-comment-gap]
[fixture: venn/gram-set-label-colon-size-directive-gap]
[fixture: venn/gram-set-label-colon-size-blank-gap]
[fixture: venn/gram-set-label-colon-size-crlf-gap]
[fixture: venn/gram-union-colon-size-next-line]
[fixture: venn/gram-union-colon-size-comment-gap]
[fixture: venn/gram-union-colon-size-directive-gap]
[fixture: venn/gram-union-colon-size-blank-gap]
[fixture: venn/gram-union-colon-size-crlf-gap]
[fixture: venn/gram-union-label-colon-size-next-line]
[fixture: venn/gram-union-label-colon-size-comment-gap]
[fixture: venn/gram-union-label-colon-size-directive-gap]
[fixture: venn/gram-union-label-colon-size-blank-gap]
[fixture: venn/gram-union-label-colon-size-crlf-gap]
[fixture: venn/gram-style-target-property-next-line]
[fixture: venn/gram-style-target-property-comment-gap]
[fixture: venn/gram-style-target-property-directive-gap]
[fixture: venn/gram-style-target-property-blank-gap]
[fixture: venn/gram-style-target-property-crlf-gap]
[fixture: venn/gram-style-property-colon-next-line]
[fixture: venn/gram-style-property-colon-comment-gap]
[fixture: venn/gram-style-property-colon-directive-gap]
[fixture: venn/gram-style-property-colon-blank-gap]
[fixture: venn/gram-style-property-colon-crlf-gap]
[fixture: venn/gram-style-colon-value-next-line]
[fixture: venn/gram-style-colon-value-comment-gap]
[fixture: venn/gram-style-colon-value-directive-gap]
[fixture: venn/gram-style-colon-value-blank-gap]
[fixture: venn/gram-style-colon-value-crlf-gap]

引数境界の閉じた directive は除かれ、
区切りのスペースを与えない。
[fixture: venn/db-set-label-inline-directive]
[fixture: venn/db-set-label-size-label-inline-directive]
[fixture: venn/db-set-size-inline-directive]
[fixture: venn/db-set-label-size-size-inline-directive]
[fixture: venn/db-union-label-inline-directive]
[fixture: venn/db-union-label-size-label-inline-directive]
[fixture: venn/db-union-size-inline-directive]
[fixture: venn/db-union-label-size-size-inline-directive]
[fixture: venn/gram-text-target-id-inline-directive]
[fixture: venn/db-text-target-string-inline-directive]
[fixture: venn/gram-text-target-number-inline-directive]
[fixture: venn/db-text-id-label-inline-directive]
[fixture: venn/db-text-string-label-inline-directive]
[fixture: venn/gram-indent-keyword-id-inline-directive]
[fixture: venn/db-indent-keyword-string-inline-directive]
[fixture: venn/gram-indent-keyword-number-inline-directive]
[fixture: venn/db-indent-id-label-inline-directive]
[fixture: venn/db-indent-string-label-inline-directive]
[fixture: venn/db-set-colon-size-inline-directive]
[fixture: venn/db-set-label-colon-size-inline-directive]
[fixture: venn/db-union-colon-size-inline-directive]
[fixture: venn/db-union-label-colon-size-inline-directive]
[fixture: venn/gram-style-target-property-inline-directive]
[fixture: venn/db-style-property-colon-inline-directive]
[fixture: venn/db-style-colon-value-inline-directive]

閉じない directive の除去が任意の接尾辞を消すと、
その前の完了した宣言が残る。
[fixture: venn/db-set-label-unclosed-directive-gap]
[fixture: venn/db-set-label-size-label-unclosed-directive-gap]
[fixture: venn/db-set-size-unclosed-directive-gap]
[fixture: venn/db-set-label-size-size-unclosed-directive-gap]
[fixture: venn/db-union-label-unclosed-directive-gap]
[fixture: venn/db-union-label-size-label-unclosed-directive-gap]
[fixture: venn/db-union-size-unclosed-directive-gap]
[fixture: venn/db-union-label-size-size-unclosed-directive-gap]
[fixture: venn/db-text-id-label-unclosed-directive-gap]
[fixture: venn/db-text-string-label-unclosed-directive-gap]
[fixture: venn/db-indent-id-label-unclosed-directive-gap]
[fixture: venn/db-indent-string-label-unclosed-directive-gap]

その除去によって必須の id、プロパティ、数値引数が欠けると、
その文は拒否される。
[fixture: venn/gram-text-target-id-unclosed-directive-gap]
[fixture: venn/gram-text-target-string-unclosed-directive-gap]
[fixture: venn/gram-text-target-number-unclosed-directive-gap]
[fixture: venn/gram-indent-keyword-id-unclosed-directive-gap]
[fixture: venn/gram-indent-keyword-string-unclosed-directive-gap]
[fixture: venn/gram-indent-keyword-number-unclosed-directive-gap]
[fixture: venn/gram-set-colon-size-unclosed-directive-gap]
[fixture: venn/gram-set-label-colon-size-unclosed-directive-gap]
[fixture: venn/gram-union-colon-size-unclosed-directive-gap]
[fixture: venn/gram-union-label-colon-size-unclosed-directive-gap]
[fixture: venn/gram-style-target-property-unclosed-directive-gap]
[fixture: venn/gram-style-property-colon-unclosed-directive-gap]
[fixture: venn/gram-style-colon-value-unclosed-directive-gap]

重なりには先行する `set` が宣言した識別子が二つ以上必要で、
重複する識別子はそのまま残り、
既定サイズ `10 / arity²` の個数に数え、
集合の既定サイズは 10 とする。
[fixture: venn/db-union-repeated-member]
[fixture: venn/gram-union-before-definitions]
[fixture: venn/gram-union-one]
[fixture: venn/gram-union-unknown]
[fixture: venn/spec-venn-a30f032a]
[fixture: venn/spec-venn-d0c4cd0d]

サイズは符号付き十進整数と小数を受け入れ、
先頭のゼロや小数点も許す。
[fixture: venn/db-size-fraction]
[fixture: venn/db-size-leading-zeros]
[fixture: venn/db-size-negative]
[fixture: venn/db-size-negative-zero]
[fixture: venn/db-size-plus]
[fixture: venn/db-size-signed-fraction]
[fixture: venn/db-size-space]
[fixture: venn/db-size-zero]

負のゼロはゼロとして記録する。
[fixture: venn/db-size-negative-zero]

正の桁あふれは `"Infinity"` として記録する。
[fixture: venn/db-size-overflow]

負の桁あふれは `"-Infinity"` として記録する。
[fixture: venn/db-size-negative-overflow]

サイズの欠落、指数、末尾の小数点、十六進接頭辞、
`NaN`、`Infinity`、非 ASCII 数字、
後続の識別子は一つのサイズを構成せず拒否される。
[fixture: venn/gram-size-empty]
[fixture: venn/gram-size-exponent]
[fixture: venn/gram-size-fullwidth]
[fixture: venn/gram-size-hex]
[fixture: venn/gram-size-infinity]
[fixture: venn/gram-size-nan]
[fixture: venn/gram-size-newline]
[fixture: venn/gram-size-suffix]
[fixture: venn/gram-size-trailing-point]

明示的な `text` は対象の列と、
識別子、引用文字列、数値表記のいずれかの id を取り、
括弧ラベルを取れるのは識別子と文字列の id だけで、
対象の存在は検査しない。
[fixture: venn/db-form-text-id]
[fixture: venn/db-form-text-id-label]
[fixture: venn/db-form-text-number]
[fixture: venn/db-form-text-string]
[fixture: venn/db-form-text-string-label]
[fixture: venn/db-text-comma-list]
[fixture: venn/db-text-numeric-fraction]
[fixture: venn/db-text-numeric-positive]
[fixture: venn/db-text-unknown]
[fixture: venn/gram-size-numeric-label]
[fixture: venn/gram-text-no-id]

単語境界のある字下げした `text` は直前の集合か重なりを使い、
相対的な深さによらず一つ以上の空白やタブで字下げでき、
空行、空白だけの行、除去されたコメント行、
directive 行はこのモードを保つ。
[fixture: venn/db-form-indent-id]
[fixture: venn/db-form-indent-id-label]
[fixture: venn/db-form-indent-number]
[fixture: venn/db-form-indent-string]
[fixture: venn/db-form-indent-string-label]
[fixture: venn/db-indent-after-blank]
[fixture: venn/db-indent-after-comment]
[fixture: venn/db-indent-after-directive]
[fixture: venn/db-indent-blank-line]
[fixture: venn/db-indent-empty-id]
[fixture: venn/db-indent-width]

NEWLINE トークンの後の次の文を読む前に、
先頭のスペースかタブが有効な暗黙の text マーカーを選ぶ場合を除き、
行頭の規則は暗黙の text モードを解除する。
[fixture: venn/gram-extra-indent-indented-style]
[fixture: venn/gram-extra-indent-nonindent-text]
[fixture: venn/gram-indent-after-style]
[fixture: venn/gram-indent-after-title]
[fixture: venn/gram-indent-after-indented-title]
[fixture: venn/db-indent-width]

完了した `set` と `union` は、
それぞれの対象で暗黙の text モードを有効にする。
[fixture: venn/db-indent-after-set]
[fixture: venn/db-indent-after-indented-set]
[fixture: venn/db-indent-after-union]
[fixture: venn/db-indent-after-indented-union]
[fixture: venn/db-indent-after-header-set]
[fixture: venn/spec-venn-0cf96be0]

その宣言と同じ行の後続の style、明示的な text、
タイトルはモードを有効なままにする。
[fixture: venn/db-indent-after-same-line-style]
[fixture: venn/db-indent-after-same-line-explicit-text]
[fixture: venn/db-indent-after-same-line-title]

有効なモードと現在の対象がなければ、
字下げした text は暗黙の対象列を使えない。
[fixture: venn/gram-indent-without-set]
[fixture: venn/gram-indent-after-style]

字下げした `text` に単語の接尾辞が接続すると、
そのマーカーは暗黙の対象を与えない。
[fixture: venn/gram-indent-text-prefix]

識別子とテキスト id は大文字小文字、空の引用文字列、
引用符の内側の空白を保ち、
Db は引用符の外側を trim して一組の二重引用符を除く。
[fixture: venn/db-case-distinct-ids]
[fixture: venn/db-empty-identifiers]
[fixture: venn/db-prototype-ids]
[fixture: venn/db-quoted-padding]
[fixture: venn/gram-union-inner-space]

括弧ラベルは Db が trim する前に括弧と引用符を失うため、
引用したラベルの内側の空白も trim され、
lexer の空ラベルは省略され、
引用した空白ラベルは空文字列に、
引用しない空白ラベルは省略される。
[fixture: venn/db-label-double-normalization]
[fixture: venn/db-label-empty]
[fixture: venn/db-label-spaces]
[fixture: venn/db-set-label]
[fixture: venn/db-text-label]
[fixture: venn/lex-label-empty]

バッククォートと単一引用符はラベルの文字として残り、
引用しない空の括弧、括弧内の引用符、
隣接するラベル文字列、閉じない区切りは拒否される。
[fixture: venn/db-label-backticks]
[fixture: venn/db-label-inner-quotes]
[fixture: venn/gram-label-bare-empty]
[fixture: venn/gram-label-two-strings]
[fixture: venn/gram-nested-label-quotes]
[fixture: venn/gram-string-escape-quote]
[fixture: venn/gram-unclosed-id]
[fixture: venn/gram-unclosed-label]
[fixture: venn/gram-unclosed-style]

`style` は対象が未定義でもソート済みの対象と、
大文字小文字を区別する任意のプロパティ名を保ち、
一つの文で同じキーを繰り返すと最後の値を使い、
別の文は別の要素として残す。
[fixture: venn/db-style-case-and-order]
[fixture: venn/db-style-duplicate-key]
[fixture: venn/db-style-three-definitions]
[fixture: venn/db-style-unknown]

style の対象にはテキストノードの id を使える。
[fixture: venn/spec-venn-ed0d6591]

style 値は一つの引用文字列か、
識別子、数値、十六進色、rgb、rgba の空でないトークン列である。
[fixture: venn/db-form-style-documented-properties]
[fixture: venn/db-form-style-hex]
[fixture: venn/db-form-style-id]
[fixture: venn/db-form-style-multiple]
[fixture: venn/db-form-style-number]
[fixture: venn/db-form-style-rgb]
[fixture: venn/db-form-style-rgba]
[fixture: venn/db-form-style-string]
[fixture: venn/db-form-style-tokens]
[fixture: venn/lex-style-empty]

Db は別々の非引用値トークンを一つのスペースで結び、
表記の間に空白がなくても同じ処理をする。
[fixture: venn/db-form-style-tokens]
[fixture: venn/db-style-adjacent-numeric-tokens]
[fixture: venn/db-grid-spaces-style-value]
[fixture: venn/db-grid-tab-style-value]

引用した style 値は一組の外側の引用符を失い、
その内側の空白を保つ。
[fixture: venn/db-form-style-string]
[fixture: venn/db-quoted-padding]
[fixture: venn/lex-style-spaces]

引用した style 文字列の後に別の値トークンは置けない。
[fixture: venn/gram-style-string-followed-token]
[fixture: venn/gram-style-empty-string-followed-token]

rgb トークンは文字の大小と成分の表記を保ち、
数値の範囲や小数点の位置を検査しない。
[fixture: venn/db-style-rgb-uppercase]
[fixture: venn/db-style-rgb-dot-components]

rgb や rgba の成分が空であるか負号を含むと、
色のトークンは成立しない。
[fixture: venn/gram-style-rgb-empty-component]
[fixture: venn/gram-style-rgba-empty-component]
[fixture: venn/gram-style-rgb-negative-component]
[fixture: venn/gram-style-rgba-negative-component]

rgb と rgba のトークン内の U+2028、U+2029、NBSP は、
保持する値に残る。
[fixture: venn/db-style-rgb-line-separator]
[fixture: venn/db-style-rgb-paragraph-separator]
[fixture: venn/db-style-rgb-nbsp]
[fixture: venn/db-style-rgba-line-separator]
[fixture: venn/db-style-rgba-paragraph-separator]
[fixture: venn/db-style-rgba-nbsp]

色のトークン内の CR と CRLF は LF となり、
そのトークンの内側に残る。
[fixture: venn/db-style-rgb-cr]
[fixture: venn/db-style-rgb-crlf]
[fixture: venn/db-style-rgba-crlf]

rgb や rgba の内側のコメント行を除くと、
色のトークンに一つの LF が残る。
[fixture: venn/db-style-rgb-comment-line]
[fixture: venn/db-style-rgba-comment-line]

rgb や rgba の内側の閉じた directive を除くと、
前後の色の断片が結合する。
[fixture: venn/db-style-rgb-directive]
[fixture: venn/db-style-rgba-directive]

十六進色のトークンは三桁から八桁の十六進数字を含む。
[fixture: venn/db-style-hex-three]
[fixture: venn/db-style-hex-four]
[fixture: venn/db-style-hex-five]
[fixture: venn/db-style-hex-six]
[fixture: venn/db-style-hex-seven]
[fixture: venn/db-style-hex-eight]
[fixture: venn/gram-style-hex-short]

九桁目の数字や後続の識別子は別のトークンとなり、
一つのスペースで結ばれる。
[fixture: venn/db-style-hex-trailing-numeric-token]
[fixture: venn/db-style-hex-trailing-identifier]

閉じた directive は十六進色の断片を一つのトークンに結合できる。
[fixture: venn/db-style-hex-directive]

十六進色の断片間の行区切り、コメント行、CRLF は、
それらをまたぐ一つの十六進色の値を作れず拒否される。
[fixture: venn/gram-style-hex-line-separator]
[fixture: venn/gram-style-hex-comment-line]
[fixture: venn/gram-style-hex-crlf]

style キー `__proto__` への文字列の代入は自分のプロパティを作らず、
`constructor`、`hasOwnProperty`、`toString` は自分のプロパティとなり、
集合とテキストではこれらの名前は普通の識別子となる。
[fixture: venn/db-prototype-ids]
[fixture: venn/db-style-prototype-keys]

プロパティや値の欠落、プロパティ列の末尾のカンマ、
単一引用符の style 値、引用した style キーは拒否される。
[fixture: venn/gram-extra-style-no-target]
[fixture: venn/gram-extra-style-quoted-key]
[fixture: venn/gram-style-empty]
[fixture: venn/gram-style-missing-value]
[fixture: venn/gram-style-single-quoted]
[fixture: venn/gram-style-trailing-comma]

`title` は最初の空白区切りの後の文字を引用符や追加の前後の空白ごと保ち、
最後のタイトルを使い、
frontmatter の初期タイトルは文で上書きできる。
[fixture: venn/db-frontmatter-title]
[fixture: venn/db-frontmatter-title-overridden]
[fixture: venn/db-title-last]
[fixture: venn/db-title-on-header]
[fixture: venn/db-title-only-whitespace]
[fixture: venn/db-title-padding]
[fixture: venn/db-title-quotes]
[fixture: venn/lex-title-spaces]

一つの改行やその後で除去されるコメント行は `title` と値を区切れるが、
追加の空行や directive 行は無効なタイトルを残し、
入力末尾でタイトルの文字がない場合も拒否される。
[fixture: venn/db-title-value-next-line]
[fixture: venn/gram-title-empty]
[fixture: venn/gram-title-space-end]
[fixture: venn/lex-gap-title-blank]
[fixture: venn/lex-gap-title-comment]
[fixture: venn/lex-gap-title-directive]
[fixture: venn/lex-gap-title-lf]

venn にはアクセシビリティ行、アクセシビリティブロック、
`@{ ... }` データブロックの生成規則がなく、
frontmatter のアクセシビリティキーも共通 getter を設定しない。
[fixture: venn/db-frontmatter-accessibility]
[fixture: venn/gram-acc-block]
[fixture: venn/gram-acc-descr]
[fixture: venn/gram-acc-title]
[fixture: venn/gram-accdescr-blank]
[fixture: venn/gram-accdescr-comment]
[fixture: venn/gram-accdescr-directive]
[fixture: venn/gram-accdescr-end]
[fixture: venn/gram-accdescr-statement]
[fixture: venn/gram-acctitle-blank]
[fixture: venn/gram-acctitle-comment]
[fixture: venn/gram-acctitle-directive]
[fixture: venn/gram-acctitle-end]
[fixture: venn/gram-acctitle-statement]
[fixture: venn/gram-data-block]
[fixture: venn/gram-empty-acc-block]
[fixture: venn/gram-unclosed-acc-block]
[fixture: venn/lex-empty-description-after-set]

対応する securityLevel と venn の描画設定は要約を変えず、
未対応の `securityLevel` では HTML ラベルが有効なとき、
共通タイトルの `<`、`>`、`=` を置換し、
ルートの `htmlLabels` を `flowchart.htmlLabels` より優先する。
[fixture: venn/config-security-other]
[fixture: venn/config-security-other-flowchart-false]
[fixture: venn/config-security-other-html-false]
[fixture: venn/config-security-other-root-false-flowchart-true]
[fixture: venn/config-security-other-root-true-flowchart-false]
[fixture: venn/db-markup]

検出は前処理後の先頭の小文字 `venn-beta` を正確に要求するが、
接尾辞との境界は検査せず、
パーサーは空の文書やヘッダー行の完全な文を受け入れ、
追加のヘッダーや通常の接尾辞は拒否する。
[fixture: venn/db-same-line-statements]
[fixture: venn/header-capitalized]
[fixture: venn/header-comment-glued]
[fixture: venn/header-dash-suffix]
[fixture: venn/header-digit-suffix]
[fixture: venn/header-directive-glued]
[fixture: venn/header-directive-inside]
[fixture: venn/header-mixed]
[fixture: venn/header-nonascii-suffix]
[fixture: venn/header-only]
[fixture: venn/header-only-lf]
[fixture: venn/header-semicolon]
[fixture: venn/header-semicolon-spaced]
[fixture: venn/header-statement-glued]
[fixture: venn/header-statement-on-line]
[fixture: venn/header-statement-tab]
[fixture: venn/header-twice]
[fixture: venn/header-twice-same-line]
[fixture: venn/header-underscore-suffix]
[fixture: venn/header-upper]
[fixture: venn/header-word-suffix]

先頭の空行、空白、コメント、directive、frontmatter、
裸のパーセント対と空の波括弧のパーセント行はヘッダーの前に置けるが、
ハッシュ、単独のパーセント、セミコロン、
図の文がその前にあると検出できない。
[fixture: venn/header-before-bare-percent]
[fixture: venn/header-before-blank]
[fixture: venn/header-before-comment]
[fixture: venn/header-before-directive]
[fixture: venn/header-before-empty-braces]
[fixture: venn/header-before-frontmatter]
[fixture: venn/header-before-frontmatter-comment]
[fixture: venn/header-before-hash]
[fixture: venn/header-before-percent]
[fixture: venn/header-before-semicolon]
[fixture: venn/header-before-spaces]
[fixture: venn/header-before-statement]

文のキーワードは大文字小文字を区別しないが、
文字、数字、下線、ダッシュ、非 ASCII の接尾辞を付けた形式は文にならず、
タイトル以外のキーワードと最初の引数の間の改行、
空行、コメント行、directive 行は拒否される。
[fixture: venn/lex-gap-set-blank]
[fixture: venn/lex-gap-set-comment]
[fixture: venn/lex-gap-set-directive]
[fixture: venn/lex-gap-set-lf]
[fixture: venn/lex-gap-style-blank]
[fixture: venn/lex-gap-style-comment]
[fixture: venn/lex-gap-style-directive]
[fixture: venn/lex-gap-style-lf]
[fixture: venn/lex-gap-text-blank]
[fixture: venn/lex-gap-text-comment]
[fixture: venn/lex-gap-text-directive]
[fixture: venn/lex-gap-text-lf]
[fixture: venn/lex-gap-union-blank]
[fixture: venn/lex-gap-union-comment]
[fixture: venn/lex-gap-union-directive]
[fixture: venn/lex-gap-union-lf]
[fixture: venn/lex-keyword-set-dash]
[fixture: venn/lex-keyword-set-digit]
[fixture: venn/lex-keyword-set-letter]
[fixture: venn/lex-keyword-set-nonascii]
[fixture: venn/lex-keyword-set-underscore]
[fixture: venn/lex-keyword-set-upper]
[fixture: venn/lex-keyword-style-dash]
[fixture: venn/lex-keyword-style-digit]
[fixture: venn/lex-keyword-style-letter]
[fixture: venn/lex-keyword-style-nonascii]
[fixture: venn/lex-keyword-style-underscore]
[fixture: venn/lex-keyword-style-upper]
[fixture: venn/lex-keyword-text-dash]
[fixture: venn/lex-keyword-text-digit]
[fixture: venn/lex-keyword-text-letter]
[fixture: venn/lex-keyword-text-nonascii]
[fixture: venn/lex-keyword-text-underscore]
[fixture: venn/lex-keyword-text-upper]
[fixture: venn/lex-keyword-title-dash]
[fixture: venn/lex-keyword-title-digit]
[fixture: venn/lex-keyword-title-letter]
[fixture: venn/lex-keyword-title-nonascii]
[fixture: venn/lex-keyword-title-underscore]
[fixture: venn/lex-keyword-title-upper]
[fixture: venn/lex-keyword-union-dash]
[fixture: venn/lex-keyword-union-digit]
[fixture: venn/lex-keyword-union-letter]
[fixture: venn/lex-keyword-union-nonascii]
[fixture: venn/lex-keyword-union-underscore]
[fixture: venn/lex-keyword-union-upper]

予約語 `venn-beta`、`set`、`union`、`text`、`style` は、
引用しない識別子、テキスト id、style キー、style 値として拒否されるが、
引用すると識別子となり、
後続の空白のない `title` も識別子となる。
[fixture: venn/lex-reserved-set-identifier]
[fixture: venn/lex-reserved-set-quoted-identifier]
[fixture: venn/lex-reserved-set-style-key]
[fixture: venn/lex-reserved-set-style-value]
[fixture: venn/lex-reserved-set-text-id]
[fixture: venn/lex-reserved-style-identifier]
[fixture: venn/lex-reserved-style-quoted-identifier]
[fixture: venn/lex-reserved-style-style-key]
[fixture: venn/lex-reserved-style-style-value]
[fixture: venn/lex-reserved-style-text-id]
[fixture: venn/lex-reserved-text-identifier]
[fixture: venn/lex-reserved-text-quoted-identifier]
[fixture: venn/lex-reserved-text-style-key]
[fixture: venn/lex-reserved-text-style-value]
[fixture: venn/lex-reserved-text-text-id]
[fixture: venn/lex-reserved-title-identifier]
[fixture: venn/lex-reserved-title-quoted-identifier]
[fixture: venn/lex-reserved-title-style-key]
[fixture: venn/lex-reserved-title-style-value]
[fixture: venn/lex-reserved-title-text-id]
[fixture: venn/lex-reserved-union-identifier]
[fixture: venn/lex-reserved-union-quoted-identifier]
[fixture: venn/lex-reserved-union-style-key]
[fixture: venn/lex-reserved-union-style-value]
[fixture: venn/lex-reserved-union-text-id]
[fixture: venn/lex-reserved-venn-beta-identifier]
[fixture: venn/lex-reserved-venn-beta-quoted-identifier]
[fixture: venn/lex-reserved-venn-beta-style-key]
[fixture: venn/lex-reserved-venn-beta-style-value]
[fixture: venn/lex-reserved-venn-beta-text-id]

lexer の空白はスペースとタブで、
CR と CRLF は LF 区切りとなり、
先頭の JavaScript の空白は検出前に除去できるが、
文書内の BOM、NBSP、U+3000、U+2028、U+2029、
垂直タブ、改ページ、U+0085 は同じ区切りとして使えない。
[fixture: venn/lex-bom-header-after]
[fixture: venn/lex-bom-header-before]
[fixture: venn/lex-bom-line-end]
[fixture: venn/lex-bom-line-start]
[fixture: venn/lex-bom-text-end]
[fixture: venn/lex-bom-whitespace-line]
[fixture: venn/lex-cr-header-after]
[fixture: venn/lex-cr-header-before]
[fixture: venn/lex-cr-line-end]
[fixture: venn/lex-cr-line-start]
[fixture: venn/lex-cr-text-end]
[fixture: venn/lex-cr-whitespace-line]
[fixture: venn/lex-crlf-header-after]
[fixture: venn/lex-crlf-header-before]
[fixture: venn/lex-crlf-line-end]
[fixture: venn/lex-crlf-text-end]
[fixture: venn/lex-crlf-whitespace-line]
[fixture: venn/lex-ff-header-after]
[fixture: venn/lex-ff-header-before]
[fixture: venn/lex-ff-line-end]
[fixture: venn/lex-ff-line-start]
[fixture: venn/lex-ff-text-end]
[fixture: venn/lex-ff-whitespace-line]
[fixture: venn/lex-ideographic-header-after]
[fixture: venn/lex-ideographic-header-before]
[fixture: venn/lex-ideographic-line-end]
[fixture: venn/lex-ideographic-line-start]
[fixture: venn/lex-ideographic-text-end]
[fixture: venn/lex-ideographic-whitespace-line]
[fixture: venn/lex-ls-header-after]
[fixture: venn/lex-ls-header-before]
[fixture: venn/lex-ls-line-end]
[fixture: venn/lex-ls-line-start]
[fixture: venn/lex-ls-text-end]
[fixture: venn/lex-ls-whitespace-line]
[fixture: venn/lex-nbsp-header-after]
[fixture: venn/lex-nbsp-header-before]
[fixture: venn/lex-nbsp-line-end]
[fixture: venn/lex-nbsp-line-start]
[fixture: venn/lex-nbsp-text-end]
[fixture: venn/lex-nbsp-whitespace-line]
[fixture: venn/lex-nel-header-after]
[fixture: venn/lex-nel-header-before]
[fixture: venn/lex-nel-line-end]
[fixture: venn/lex-nel-line-start]
[fixture: venn/lex-nel-text-end]
[fixture: venn/lex-nel-whitespace-line]
[fixture: venn/lex-ps-header-after]
[fixture: venn/lex-ps-header-before]
[fixture: venn/lex-ps-line-end]
[fixture: venn/lex-ps-line-start]
[fixture: venn/lex-ps-text-end]
[fixture: venn/lex-ps-whitespace-line]
[fixture: venn/lex-tab-header-before]
[fixture: venn/lex-tab-line-end]
[fixture: venn/lex-tab-line-start]
[fixture: venn/lex-tab-text-end]
[fixture: venn/lex-tab-whitespace-line]
[fixture: venn/lex-vt-header-after]
[fixture: venn/lex-vt-header-before]
[fixture: venn/lex-vt-line-end]
[fixture: venn/lex-vt-line-start]
[fixture: venn/lex-vt-text-end]
[fixture: venn/lex-vt-whitespace-line]

引用した識別子内の空白は先頭や末尾のものも識別子に残り、
CR と CRLF だけ LF に正規化される。
[fixture: venn/lex-bom-quoted-end]
[fixture: venn/lex-bom-quoted-start]
[fixture: venn/lex-bom-quoted-value]
[fixture: venn/lex-cr-quoted-end]
[fixture: venn/lex-cr-quoted-start]
[fixture: venn/lex-cr-quoted-value]
[fixture: venn/lex-crlf-quoted-end]
[fixture: venn/lex-crlf-quoted-start]
[fixture: venn/lex-crlf-quoted-value]
[fixture: venn/lex-ff-quoted-end]
[fixture: venn/lex-ff-quoted-start]
[fixture: venn/lex-ff-quoted-value]
[fixture: venn/lex-ideographic-quoted-end]
[fixture: venn/lex-ideographic-quoted-start]
[fixture: venn/lex-ideographic-quoted-value]
[fixture: venn/lex-ls-quoted-end]
[fixture: venn/lex-ls-quoted-start]
[fixture: venn/lex-ls-quoted-value]
[fixture: venn/lex-nbsp-quoted-end]
[fixture: venn/lex-nbsp-quoted-start]
[fixture: venn/lex-nbsp-quoted-value]
[fixture: venn/lex-nel-quoted-end]
[fixture: venn/lex-nel-quoted-start]
[fixture: venn/lex-nel-quoted-value]
[fixture: venn/lex-ps-quoted-end]
[fixture: venn/lex-ps-quoted-start]
[fixture: venn/lex-ps-quoted-value]
[fixture: venn/lex-tab-quoted-end]
[fixture: venn/lex-tab-quoted-start]
[fixture: venn/lex-tab-quoted-value]
[fixture: venn/lex-vt-quoted-end]
[fixture: venn/lex-vt-quoted-start]
[fixture: venn/lex-vt-quoted-value]

前処理後に完了した集合、重なり、text、style の文の後に残る
` ;`、`;`、`;;`、`; ;` の接尾辞は拒否される。
[fixture: venn/lex-after-set-semicolon-spaced]
[fixture: venn/lex-after-set-semicolon]
[fixture: venn/lex-after-set-double-semicolon]
[fixture: venn/gram-after-set-spaced-semicolons]
[fixture: venn/lex-after-set-label-semicolon-spaced]
[fixture: venn/lex-after-set-label-semicolon]
[fixture: venn/lex-after-set-label-double-semicolon]
[fixture: venn/gram-after-set-label-spaced-semicolons]
[fixture: venn/lex-after-set-size-semicolon-spaced]
[fixture: venn/lex-after-set-size-semicolon]
[fixture: venn/lex-after-set-size-double-semicolon]
[fixture: venn/gram-after-set-size-spaced-semicolons]
[fixture: venn/gram-after-set-label-size-semicolon-spaced]
[fixture: venn/gram-after-set-label-size-semicolon]
[fixture: venn/gram-after-set-label-size-double-semicolon]
[fixture: venn/gram-after-set-label-size-spaced-semicolons]
[fixture: venn/lex-after-union-semicolon-spaced]
[fixture: venn/lex-after-union-semicolon]
[fixture: venn/lex-after-union-double-semicolon]
[fixture: venn/gram-after-union-spaced-semicolons]
[fixture: venn/gram-after-union-label-semicolon-spaced]
[fixture: venn/gram-after-union-label-semicolon]
[fixture: venn/gram-after-union-label-double-semicolon]
[fixture: venn/gram-after-union-label-spaced-semicolons]
[fixture: venn/gram-after-union-size-semicolon-spaced]
[fixture: venn/gram-after-union-size-semicolon]
[fixture: venn/gram-after-union-size-double-semicolon]
[fixture: venn/gram-after-union-size-spaced-semicolons]
[fixture: venn/lex-after-union-label-size-semicolon-spaced]
[fixture: venn/lex-after-union-label-size-semicolon]
[fixture: venn/lex-after-union-label-size-double-semicolon]
[fixture: venn/gram-after-union-label-size-spaced-semicolons]
[fixture: venn/lex-after-text-semicolon-spaced]
[fixture: venn/lex-after-text-semicolon]
[fixture: venn/lex-after-text-double-semicolon]
[fixture: venn/gram-after-text-id-spaced-semicolons]
[fixture: venn/lex-after-text-string-semicolon-spaced]
[fixture: venn/lex-after-text-string-semicolon]
[fixture: venn/lex-after-text-string-double-semicolon]
[fixture: venn/gram-after-text-string-spaced-semicolons]
[fixture: venn/lex-after-text-number-semicolon-spaced]
[fixture: venn/lex-after-text-number-semicolon]
[fixture: venn/lex-after-text-number-double-semicolon]
[fixture: venn/gram-after-text-number-spaced-semicolons]
[fixture: venn/lex-after-text-label-semicolon-spaced]
[fixture: venn/lex-after-text-label-semicolon]
[fixture: venn/lex-after-text-label-double-semicolon]
[fixture: venn/gram-after-text-id-label-spaced-semicolons]
[fixture: venn/gram-after-text-string-label-semicolon-spaced]
[fixture: venn/gram-after-text-string-label-semicolon]
[fixture: venn/gram-after-text-string-label-double-semicolon]
[fixture: venn/gram-after-text-string-label-spaced-semicolons]
[fixture: venn/lex-after-indent-semicolon-spaced]
[fixture: venn/lex-after-indent-semicolon]
[fixture: venn/lex-after-indent-double-semicolon]
[fixture: venn/gram-after-indent-id-spaced-semicolons]
[fixture: venn/gram-after-indent-string-semicolon-spaced]
[fixture: venn/gram-after-indent-string-semicolon]
[fixture: venn/gram-after-indent-string-double-semicolon]
[fixture: venn/gram-after-indent-string-spaced-semicolons]
[fixture: venn/gram-after-indent-number-semicolon-spaced]
[fixture: venn/gram-after-indent-number-semicolon]
[fixture: venn/gram-after-indent-number-double-semicolon]
[fixture: venn/gram-after-indent-number-spaced-semicolons]
[fixture: venn/gram-after-indent-id-label-semicolon-spaced]
[fixture: venn/gram-after-indent-id-label-semicolon]
[fixture: venn/gram-after-indent-id-label-double-semicolon]
[fixture: venn/gram-after-indent-id-label-spaced-semicolons]
[fixture: venn/gram-after-indent-string-label-semicolon-spaced]
[fixture: venn/gram-after-indent-string-label-semicolon]
[fixture: venn/gram-after-indent-string-label-double-semicolon]
[fixture: venn/gram-after-indent-string-label-spaced-semicolons]
[fixture: venn/lex-after-style-semicolon-spaced]
[fixture: venn/lex-after-style-semicolon]
[fixture: venn/lex-after-style-double-semicolon]
[fixture: venn/gram-after-style-spaced-semicolons]
[fixture: venn/lex-after-style-string-semicolon-spaced]
[fixture: venn/lex-after-style-string-semicolon]
[fixture: venn/lex-after-style-string-double-semicolon]
[fixture: venn/gram-after-style-string-spaced-semicolons]
[fixture: venn/gram-after-style-list-semicolon-spaced]
[fixture: venn/gram-after-style-list-semicolon]
[fixture: venn/gram-after-style-list-double-semicolon]
[fixture: venn/gram-after-style-list-spaced-semicolons]
[fixture: venn/gram-after-style-hex-double-semicolon]
[fixture: venn/gram-after-style-hex-spaced-semicolons]

追加のコロンの後にスペースしかない場合は、
必要な引数を与えず拒否される。
[fixture: venn/gram-after-set-colon-space]
[fixture: venn/gram-after-set-label-colon-space]
[fixture: venn/gram-after-set-size-colon-space]
[fixture: venn/gram-after-set-label-size-colon-space]
[fixture: venn/gram-after-union-colon-space]
[fixture: venn/gram-after-union-label-colon-space]
[fixture: venn/gram-after-union-size-colon-space]
[fixture: venn/gram-after-union-label-size-colon-space]
[fixture: venn/gram-after-text-id-colon-space]
[fixture: venn/gram-after-text-string-colon-space]
[fixture: venn/gram-after-text-number-colon-space]
[fixture: venn/gram-after-text-id-label-colon-space]
[fixture: venn/gram-after-text-string-label-colon-space]
[fixture: venn/gram-after-indent-id-colon-space]
[fixture: venn/gram-after-indent-string-colon-space]
[fixture: venn/gram-after-indent-number-colon-space]
[fixture: venn/gram-after-indent-id-label-colon-space]
[fixture: venn/gram-after-indent-string-label-colon-space]
[fixture: venn/gram-after-style-colon-space]
[fixture: venn/gram-after-style-string-colon-space]
[fixture: venn/gram-after-style-list-colon-space]

タイトル以外の完了した文は、
末尾のスペース、タブ、空行、CRLF、EOF を受け入れ、
Db のフィールドを変えない。
[fixture: venn/db-after-set-space]
[fixture: venn/lex-after-set-tab]
[fixture: venn/db-after-set-blank]
[fixture: venn/db-after-set-crlf]
[fixture: venn/db-set-eof]
[fixture: venn/db-after-set-label-space]
[fixture: venn/lex-after-set-label-tab]
[fixture: venn/db-after-set-label-blank]
[fixture: venn/db-after-set-label-crlf]
[fixture: venn/db-set-label-eof]
[fixture: venn/db-after-set-size-space]
[fixture: venn/lex-after-set-size-tab]
[fixture: venn/db-after-set-size-blank]
[fixture: venn/db-after-set-size-crlf]
[fixture: venn/db-set-size-eof]
[fixture: venn/db-after-set-label-size-space]
[fixture: venn/db-after-set-label-size-tab]
[fixture: venn/db-after-set-label-size-blank]
[fixture: venn/db-after-set-label-size-crlf]
[fixture: venn/db-set-label-size-eof]
[fixture: venn/db-after-union-space]
[fixture: venn/lex-after-union-tab]
[fixture: venn/db-after-union-blank]
[fixture: venn/db-after-union-crlf]
[fixture: venn/db-union-eof]
[fixture: venn/db-after-union-label-space]
[fixture: venn/db-after-union-label-tab]
[fixture: venn/db-after-union-label-blank]
[fixture: venn/db-after-union-label-crlf]
[fixture: venn/db-union-label-eof]
[fixture: venn/db-after-union-size-space]
[fixture: venn/db-after-union-size-tab]
[fixture: venn/db-after-union-size-blank]
[fixture: venn/db-after-union-size-crlf]
[fixture: venn/db-union-size-eof]
[fixture: venn/db-after-union-label-size-space]
[fixture: venn/lex-after-union-label-size-tab]
[fixture: venn/db-after-union-label-size-blank]
[fixture: venn/db-after-union-label-size-crlf]
[fixture: venn/db-union-label-size-eof]
[fixture: venn/db-after-text-id-space]
[fixture: venn/lex-after-text-tab]
[fixture: venn/db-after-text-id-blank]
[fixture: venn/db-after-text-id-crlf]
[fixture: venn/db-text-id-eof]
[fixture: venn/db-after-text-string-space]
[fixture: venn/lex-after-text-string-tab]
[fixture: venn/db-after-text-string-blank]
[fixture: venn/db-after-text-string-crlf]
[fixture: venn/db-text-string-eof]
[fixture: venn/db-after-text-number-space]
[fixture: venn/lex-after-text-number-tab]
[fixture: venn/db-after-text-number-blank]
[fixture: venn/db-after-text-number-crlf]
[fixture: venn/db-text-number-eof]
[fixture: venn/db-after-text-id-label-space]
[fixture: venn/lex-after-text-label-tab]
[fixture: venn/db-after-text-id-label-blank]
[fixture: venn/db-after-text-id-label-crlf]
[fixture: venn/db-text-id-label-eof]
[fixture: venn/db-after-text-string-label-space]
[fixture: venn/db-after-text-string-label-tab]
[fixture: venn/db-after-text-string-label-blank]
[fixture: venn/db-after-text-string-label-crlf]
[fixture: venn/db-text-string-label-eof]
[fixture: venn/db-after-indent-id-space]
[fixture: venn/lex-after-indent-tab]
[fixture: venn/db-after-indent-id-blank]
[fixture: venn/db-after-indent-id-crlf]
[fixture: venn/db-indent-id-eof]
[fixture: venn/db-after-indent-string-space]
[fixture: venn/db-after-indent-string-tab]
[fixture: venn/db-after-indent-string-blank]
[fixture: venn/db-after-indent-string-crlf]
[fixture: venn/db-indent-string-eof]
[fixture: venn/db-after-indent-number-space]
[fixture: venn/db-after-indent-number-tab]
[fixture: venn/db-after-indent-number-blank]
[fixture: venn/db-after-indent-number-crlf]
[fixture: venn/db-indent-number-eof]
[fixture: venn/db-after-indent-id-label-space]
[fixture: venn/db-after-indent-id-label-tab]
[fixture: venn/db-after-indent-id-label-blank]
[fixture: venn/db-after-indent-id-label-crlf]
[fixture: venn/db-indent-id-label-eof]
[fixture: venn/db-after-indent-string-label-space]
[fixture: venn/db-after-indent-string-label-tab]
[fixture: venn/db-after-indent-string-label-blank]
[fixture: venn/db-after-indent-string-label-crlf]
[fixture: venn/db-indent-string-label-eof]
[fixture: venn/db-after-style-space]
[fixture: venn/lex-after-style-tab]
[fixture: venn/db-after-style-blank]
[fixture: venn/db-after-style-crlf]
[fixture: venn/db-style-eof]
[fixture: venn/db-after-style-string-space]
[fixture: venn/lex-after-style-string-tab]
[fixture: venn/db-after-style-string-blank]
[fixture: venn/db-after-style-string-crlf]
[fixture: venn/db-style-string-eof]
[fixture: venn/db-after-style-list-space]
[fixture: venn/db-after-style-list-tab]
[fixture: venn/db-after-style-list-blank]
[fixture: venn/db-after-style-list-crlf]
[fixture: venn/db-style-list-eof]
[fixture: venn/lex-after-indent-spaces]
[fixture: venn/lex-after-set-label-spaces]
[fixture: venn/lex-after-set-size-spaces]
[fixture: venn/lex-after-set-spaces]
[fixture: venn/lex-after-style-spaces]
[fixture: venn/lex-after-style-string-spaces]
[fixture: venn/lex-after-text-label-spaces]
[fixture: venn/lex-after-text-number-spaces]
[fixture: venn/lex-after-text-spaces]
[fixture: venn/lex-after-text-string-spaces]
[fixture: venn/lex-after-union-label-size-spaces]
[fixture: venn/lex-after-union-spaces]

完了した文からスペースで区切ったパーセント対コメントは、
その文を変えない。
[fixture: venn/lex-after-set-comment]
[fixture: venn/lex-after-set-label-comment]
[fixture: venn/lex-after-set-size-comment]
[fixture: venn/db-after-set-label-size-comment]
[fixture: venn/lex-after-union-comment]
[fixture: venn/db-after-union-label-comment]
[fixture: venn/db-after-union-size-comment]
[fixture: venn/lex-after-union-label-size-comment]
[fixture: venn/lex-after-text-comment]
[fixture: venn/lex-after-text-string-comment]
[fixture: venn/lex-after-text-number-comment]
[fixture: venn/lex-after-text-label-comment]
[fixture: venn/db-after-text-string-label-comment]
[fixture: venn/lex-after-indent-comment]
[fixture: venn/db-after-indent-string-comment]
[fixture: venn/db-after-indent-number-comment]
[fixture: venn/db-after-indent-id-label-comment]
[fixture: venn/db-after-indent-string-label-comment]
[fixture: venn/lex-after-style-comment]
[fixture: venn/lex-after-style-string-comment]
[fixture: venn/db-after-style-list-comment]

完了した文の後の閉じた directive や、
オブジェクト引数の閉じない directive は、
その末尾まで除かれてもその文を変えない。
[fixture: venn/lex-after-set-directive]
[fixture: venn/lex-after-set-directive-unclosed]
[fixture: venn/lex-after-set-label-directive]
[fixture: venn/lex-after-set-label-directive-unclosed]
[fixture: venn/lex-after-set-size-directive]
[fixture: venn/lex-after-set-size-directive-unclosed]
[fixture: venn/db-after-set-label-size-directive]
[fixture: venn/db-after-set-label-size-unclosed-directive]
[fixture: venn/lex-after-union-directive]
[fixture: venn/lex-after-union-directive-unclosed]
[fixture: venn/db-after-union-label-directive]
[fixture: venn/db-after-union-label-unclosed-directive]
[fixture: venn/db-after-union-size-directive]
[fixture: venn/db-after-union-size-unclosed-directive]
[fixture: venn/lex-after-union-label-size-directive]
[fixture: venn/lex-after-union-label-size-directive-unclosed]
[fixture: venn/lex-after-text-directive]
[fixture: venn/lex-after-text-directive-unclosed]
[fixture: venn/lex-after-text-string-directive]
[fixture: venn/lex-after-text-string-directive-unclosed]
[fixture: venn/lex-after-text-number-directive]
[fixture: venn/lex-after-text-number-directive-unclosed]
[fixture: venn/lex-after-text-label-directive]
[fixture: venn/lex-after-text-label-directive-unclosed]
[fixture: venn/db-after-text-string-label-directive]
[fixture: venn/db-after-text-string-label-unclosed-directive]
[fixture: venn/lex-after-indent-directive]
[fixture: venn/lex-after-indent-directive-unclosed]
[fixture: venn/db-after-indent-string-directive]
[fixture: venn/db-after-indent-string-unclosed-directive]
[fixture: venn/db-after-indent-number-directive]
[fixture: venn/db-after-indent-number-unclosed-directive]
[fixture: venn/db-after-indent-id-label-directive]
[fixture: venn/db-after-indent-id-label-unclosed-directive]
[fixture: venn/db-after-indent-string-label-directive]
[fixture: venn/db-after-indent-string-label-unclosed-directive]
[fixture: venn/lex-after-style-directive]
[fixture: venn/lex-after-style-directive-unclosed]
[fixture: venn/lex-after-style-string-directive]
[fixture: venn/lex-after-style-string-directive-unclosed]
[fixture: venn/db-after-style-list-directive]
[fixture: venn/db-after-style-list-unclosed-directive]
[fixture: venn/lex-after-indent-directive-word-unclosed]
[fixture: venn/lex-after-set-directive-word-unclosed]
[fixture: venn/lex-after-set-label-directive-word-unclosed]
[fixture: venn/lex-after-set-size-directive-word-unclosed]
[fixture: venn/lex-after-style-directive-word-unclosed]
[fixture: venn/lex-after-style-string-directive-word-unclosed]
[fixture: venn/lex-after-text-directive-word-unclosed]
[fixture: venn/lex-after-text-label-directive-word-unclosed]
[fixture: venn/lex-after-text-number-directive-word-unclosed]
[fixture: venn/lex-after-text-string-directive-word-unclosed]
[fixture: venn/lex-after-union-directive-word-unclosed]
[fixture: venn/lex-after-union-label-size-directive-word-unclosed]

タイトル以外の文の後の NBSP と BOM は、
末尾の lexer の空白にはならず拒否される。
[fixture: venn/lex-after-indent-bom]
[fixture: venn/lex-after-indent-nbsp]
[fixture: venn/lex-after-set-bom]
[fixture: venn/lex-after-set-label-bom]
[fixture: venn/lex-after-set-label-nbsp]
[fixture: venn/lex-after-set-nbsp]
[fixture: venn/lex-after-set-size-bom]
[fixture: venn/lex-after-set-size-nbsp]
[fixture: venn/lex-after-style-bom]
[fixture: venn/lex-after-style-nbsp]
[fixture: venn/lex-after-style-string-bom]
[fixture: venn/lex-after-style-string-nbsp]
[fixture: venn/lex-after-text-bom]
[fixture: venn/lex-after-text-label-bom]
[fixture: venn/lex-after-text-label-nbsp]
[fixture: venn/lex-after-text-nbsp]
[fixture: venn/lex-after-text-number-bom]
[fixture: venn/lex-after-text-number-nbsp]
[fixture: venn/lex-after-text-string-bom]
[fixture: venn/lex-after-text-string-nbsp]
[fixture: venn/lex-after-union-bom]
[fixture: venn/lex-after-union-label-size-bom]
[fixture: venn/lex-after-union-label-size-nbsp]
[fixture: venn/lex-after-union-nbsp]

接続したパーセント対コメントは引用しない集合識別子、サイズ、
数値のテキスト id の末尾を取り、
不完全な文を拒否させることがあるが、
テキスト id、style 値、括弧ラベルは、
そのコメントトークンを試す前に完了できる。
[fixture: venn/lex-after-indent-comment-glued]
[fixture: venn/lex-after-set-comment-glued]
[fixture: venn/lex-after-set-label-comment-glued]
[fixture: venn/lex-after-set-size-comment-glued]
[fixture: venn/lex-after-style-comment-glued]
[fixture: venn/lex-after-style-string-comment-glued]
[fixture: venn/lex-after-text-comment-glued]
[fixture: venn/lex-after-text-label-comment-glued]
[fixture: venn/lex-after-text-number-comment-glued]
[fixture: venn/lex-after-text-string-comment-glued]
[fixture: venn/lex-after-union-comment-glued]
[fixture: venn/lex-after-union-label-size-comment-glued]
[fixture: venn/lex-inline-comment-eats-id]
[fixture: venn/lex-inline-comment-spaced]

タイトルの文字は行内のパーセント対と、
末尾のスペース、タブ、NBSP、BOM を保つ。
[fixture: venn/lex-after-title-bom]
[fixture: venn/lex-after-title-comment]
[fixture: venn/lex-after-title-comment-glued]
[fixture: venn/lex-after-title-nbsp]
[fixture: venn/lex-after-title-spaces]
[fixture: venn/lex-after-title-tab]
[fixture: venn/db-after-title-space]

タイトル末尾のコロンとスペースはタイトルの文字として残る。
[fixture: venn/db-after-title-colon-space]

完了したタイトルは LF、空行、CRLF、EOF で終えられる。
[fixture: venn/db-after-title-blank]
[fixture: venn/db-after-title-crlf]
[fixture: venn/db-title-eof]

完了したタイトルの閉じた directive と、
閉じない directive の接尾辞は除去できる。
[fixture: venn/lex-after-title-directive]
[fixture: venn/lex-after-title-directive-unclosed]
[fixture: venn/lex-after-title-directive-word-unclosed]

前処理後にタイトルの後に残るセミコロンの接尾辞
` ;`、`;`、`;;`、`; ;` は拒否される。
[fixture: venn/lex-after-title-double-semicolon]
[fixture: venn/lex-after-title-semicolon]
[fixture: venn/lex-after-title-semicolon-spaced]
[fixture: venn/gram-after-title-spaced-semicolons]

ハッシュと単独パーセントの行はコメントではなく、
閉じない directive は後続行やヘッダー自体を除くことがあり、
パーセント対コメント内の U+2028 はコメントを終えない。
[fixture: venn/db-indent-comment-ls]
[fixture: venn/lex-hash-comment]
[fixture: venn/lex-single-percent-comment]
[fixture: venn/lex-unclosed-directive-only]
[fixture: venn/lex-unterminated-colon-directive-next-line]
[fixture: venn/lex-unterminated-directive-next-line]

文のキーワード内の閉じた directive は除かれ、
lexer は結合されたキーワードを読む。
[fixture: venn/lex-directive-in-set]
[fixture: venn/lex-directive-in-style]
[fixture: venn/lex-directive-in-text]
[fixture: venn/lex-directive-in-title]
[fixture: venn/lex-directive-in-union]

venn の識別子、ラベル、タイトル、style 文字列内の非先頭固定の C4 検出語は、
C4 を選んで入力を拒否させることがあるが、
同じ位置の `C4Context` は venn のままとなり、
除去されたコメントと frontmatter の C4 語は検出されない。
[fixture: venn/lex-c4-c4component-comment]
[fixture: venn/lex-c4-c4component-frontmatter]
[fixture: venn/lex-c4-c4component-identifier]
[fixture: venn/lex-c4-c4component-label]
[fixture: venn/lex-c4-c4component-style]
[fixture: venn/lex-c4-c4component-title]
[fixture: venn/lex-c4-c4container-comment]
[fixture: venn/lex-c4-c4container-frontmatter]
[fixture: venn/lex-c4-c4container-identifier]
[fixture: venn/lex-c4-c4container-label]
[fixture: venn/lex-c4-c4container-style]
[fixture: venn/lex-c4-c4container-title]
[fixture: venn/lex-c4-c4context-comment]
[fixture: venn/lex-c4-c4context-frontmatter]
[fixture: venn/lex-c4-c4context-identifier]
[fixture: venn/lex-c4-c4context-label]
[fixture: venn/lex-c4-c4context-style]
[fixture: venn/lex-c4-c4context-title]
[fixture: venn/lex-c4-c4deployment-comment]
[fixture: venn/lex-c4-c4deployment-frontmatter]
[fixture: venn/lex-c4-c4deployment-identifier]
[fixture: venn/lex-c4-c4deployment-label]
[fixture: venn/lex-c4-c4deployment-style]
[fixture: venn/lex-c4-c4deployment-title]
[fixture: venn/lex-c4-c4dynamic-comment]
[fixture: venn/lex-c4-c4dynamic-frontmatter]
[fixture: venn/lex-c4-c4dynamic-identifier]
[fixture: venn/lex-c4-c4dynamic-label]
[fixture: venn/lex-c4-c4dynamic-style]
[fixture: venn/lex-c4-c4dynamic-title]

識別子、ラベル、テキスト id、引用 style 値、
タイトルの内側の閉じた directive は除かれ、
残る断片が結合する。
[fixture: venn/lex-identifier-directive-start]
[fixture: venn/lex-label-directive-start]
[fixture: venn/lex-text-directive-start]
[fixture: venn/lex-style-directive-start]
[fixture: venn/lex-title-directive-start]
[fixture: venn/lex-identifier-directive-middle]
[fixture: venn/lex-label-directive-middle]
[fixture: venn/lex-text-directive-middle]
[fixture: venn/lex-style-directive-middle]
[fixture: venn/lex-title-directive-middle]
[fixture: venn/lex-identifier-directive-end]
[fixture: venn/lex-label-directive-end]
[fixture: venn/lex-text-directive-end]
[fixture: venn/lex-style-directive-end]
[fixture: venn/lex-title-directive-end]

複数行の引用値の内側で一行を占める directive は、
前後の二つの LF を残す。
[fixture: venn/lex-identifier-directive-line]
[fixture: venn/lex-label-directive-line]
[fixture: venn/lex-text-directive-line]
[fixture: venn/lex-style-directive-line]

複数行の引用値の内側のコメント行を除くと、
前後の文字の断片の間に一つの LF が残る。
[fixture: venn/lex-identifier-comment-line]
[fixture: venn/lex-label-comment-line]
[fixture: venn/lex-text-comment-line]
[fixture: venn/lex-style-comment-line]

引用した識別子、ラベル、テキスト id、
style 値の内側の空行は二つの LF として残る。
[fixture: venn/lex-identifier-blank-line]
[fixture: venn/lex-label-blank-line]
[fixture: venn/lex-text-blank-line]
[fixture: venn/lex-style-blank-line]

識別子、ラベル、テキスト id、タイトルの数値文字参照と、
名前付き文字参照は共通の前処理のプレースホルダーとなる。
[fixture: venn/lex-identifier-entity-numeric]
[fixture: venn/lex-label-entity-numeric]
[fixture: venn/lex-text-entity-numeric]
[fixture: venn/lex-title-entity-numeric]
[fixture: venn/lex-identifier-entity-named]
[fixture: venn/lex-label-entity-named]
[fixture: venn/lex-text-entity-named]
[fixture: venn/lex-title-entity-named]

引用 style 値の `a#35;b` と `a#amp;b` は、
行の規則がセミコロンを除き、
`a#35b` と `a#ampb` を残す。
[fixture: venn/lex-style-entity-numeric]
[fixture: venn/lex-style-entity-named]

引用しない style 値 `a#35;b` は、
セミコロンの除去とトークンの結合の後に `a #35b` として保持される。
[fixture: venn/db-grid-entity-style-value]

セミコロンのないハッシュの参照は、
引用した識別子、ラベル、テキスト id、style 値に文字として残る。
[fixture: venn/lex-identifier-entity-no-semicolon]
[fixture: venn/lex-label-entity-no-semicolon]
[fixture: venn/lex-text-entity-no-semicolon]
[fixture: venn/lex-style-entity-no-semicolon]

HTML 属性値を囲む二重引用符は、
venn が周囲の値を読む前に単一引用符となる。
[fixture: venn/lex-identifier-html-attribute]
[fixture: venn/lex-label-html-attribute]
[fixture: venn/lex-text-html-attribute]
[fixture: venn/lex-style-html-attribute]
[fixture: venn/lex-title-html-attribute]

その大小文字の `style` や `classDef` の断片の後に、
同じ行でコロンと空白を挟まないハッシュがあると、
共通のセミコロン規則が適用される。
[fixture: venn/lex-identifier-style-rule]
[fixture: venn/lex-label-style-rule]
[fixture: venn/lex-text-style-rule]
[fixture: venn/lex-style-style-rule]
[fixture: venn/lex-identifier-classdef-rule]
[fixture: venn/lex-label-classdef-rule]
[fixture: venn/lex-text-classdef-rule]
[fixture: venn/lex-style-classdef-rule]

その規則は引用値の内側でも、
ハッシュの後の最後のセミコロンを除く。
[fixture: venn/lex-identifier-style-rule]
[fixture: venn/lex-label-style-rule]
[fixture: venn/lex-text-style-rule]
[fixture: venn/lex-style-style-rule]
[fixture: venn/lex-identifier-classdef-rule]
[fixture: venn/lex-label-classdef-rule]
[fixture: venn/lex-text-classdef-rule]
[fixture: venn/lex-style-classdef-rule]
[fixture: venn/db-after-style-hex-semicolon]
[fixture: venn/db-after-style-hex-semicolon-spaced]

その除去の後にも残る参照のセミコロンは、
文字参照としてエンコードされる。
[fixture: venn/lex-identifier-style-rule-two-semicolons]
[fixture: venn/lex-label-style-rule-two-semicolons]
[fixture: venn/lex-text-style-rule-two-semicolons]
[fixture: venn/lex-style-style-rule-two-semicolons]
[fixture: venn/lex-title-style-rule-two-semicolons]

一致する表記と行の条件がなければセミコロンは残り、
文字参照のエンコードはなお適用される。
[fixture: venn/lex-identifier-style-rule-upper]
[fixture: venn/lex-label-style-rule-upper]
[fixture: venn/lex-text-style-rule-upper]
[fixture: venn/lex-identifier-style-rule-space]
[fixture: venn/lex-label-style-rule-space]
[fixture: venn/lex-text-style-rule-space]
[fixture: venn/lex-identifier-style-rule-no-hash]
[fixture: venn/lex-label-style-rule-no-hash]
[fixture: venn/lex-text-style-rule-no-hash]
[fixture: venn/lex-identifier-style-rule-other-line]
[fixture: venn/lex-label-style-rule-other-line]
[fixture: venn/lex-text-style-rule-other-line]
[fixture: venn/lex-style-style-rule-space]
[fixture: venn/lex-style-style-rule-no-hash]
[fixture: venn/lex-style-style-rule-other-line]
[fixture: venn/lex-title-style-rule-space]
[fixture: venn/lex-title-style-rule-upper]

外側の style 文は、
内側の `Style` の断片が大文字で始まっていてもセミコロンを除去できる。
[fixture: venn/lex-style-style-rule-upper]

引用した識別子、テキスト id、style 値は内側の空白を保ち、
括弧ラベルはそれを trim する。
[fixture: venn/lex-identifier-spaces]
[fixture: venn/lex-label-spaces]
[fixture: venn/lex-text-spaces]
[fixture: venn/lex-style-spaces]

空の引用識別子、テキスト id、style 文字列は、
空文字列として残る。
[fixture: venn/lex-identifier-empty]
[fixture: venn/lex-text-empty]
[fixture: venn/lex-style-empty]

空の引用括弧ラベルは省略される。
[fixture: venn/lex-label-empty]

文字どおりの値 `a#b` と `a;b` は、
引用した識別子、ラベル、テキスト id、style 文字列の内側に残る。
[fixture: venn/db-grid-hash-identifier-quoted]
[fixture: venn/db-grid-semicolon-identifier-quoted]
[fixture: venn/db-grid-hash-label-quoted]
[fixture: venn/db-grid-semicolon-label-quoted]
[fixture: venn/db-text-quoted-hash]
[fixture: venn/db-text-quoted-semicolon]
[fixture: venn/db-style-quoted-hash]
[fixture: venn/db-style-quoted-semicolon]

閉じる `}%%` がない `%%{init: {}` の断片は、
自由文字の引数を U+2028 や U+2029 が中断しなければ EOF まで取る。
[fixture: venn/lex-identifier-unclosed-directive]
[fixture: venn/lex-label-unclosed-directive]
[fixture: venn/lex-text-unclosed-directive]
[fixture: venn/lex-style-unclosed-directive]

引用した識別子、ラベル、テキスト id、style 文字列では、
その除去が終端の区切りを取り、閉じない値を拒否させる。
[fixture: venn/lex-identifier-unclosed-directive]
[fixture: venn/lex-label-unclosed-directive]
[fixture: venn/lex-text-unclosed-directive]
[fixture: venn/lex-style-unclosed-directive]

単語の引数は終端の区切りの前で終わり、
directive が閉じていなくてもその区切りは残る。
[fixture: venn/lex-identifier-word-unclosed-directive]
[fixture: venn/lex-label-word-unclosed-directive]
[fixture: venn/lex-text-word-unclosed-directive]
[fixture: venn/lex-style-word-unclosed-directive]
[fixture: venn/db-identifier-unclosed-directive-word-argument]
[fixture: venn/db-label-unclosed-directive-word-argument]
[fixture: venn/db-text-unclosed-directive-word-argument]
[fixture: venn/db-style-unclosed-directive-word-argument]

その区切りの前の U+2028 や U+2029 は自由文字の引数を止め、
自身は除かれ、後続の文字と区切りを残す。
[fixture: venn/db-identifier-unclosed-directive-line-separator]
[fixture: venn/db-label-unclosed-directive-line-separator]
[fixture: venn/db-text-unclosed-directive-line-separator]
[fixture: venn/db-style-unclosed-directive-line-separator]
[fixture: venn/db-identifier-unclosed-directive-paragraph-separator]
[fixture: venn/db-label-unclosed-directive-paragraph-separator]
[fixture: venn/db-text-unclosed-directive-paragraph-separator]
[fixture: venn/db-style-unclosed-directive-paragraph-separator]

タイトルに終端の区切りは不要なため、
オブジェクト引数の閉じない directive が接尾辞を除いても、
前の文字がタイトルとして残る。
[fixture: venn/lex-title-unclosed-directive]

タイトルの単語引数の閉じない directive は次の単語を除き、
その前のタイトルの文字を残す。
[fixture: venn/lex-title-word-unclosed-directive]

LF はタイトルの文字を終えるため、
間に空行、コメント行、directive 行があっても、
後続の裸の行は拒否される。
[fixture: venn/lex-title-blank-line]
[fixture: venn/lex-title-comment-line]
[fixture: venn/lex-title-directive-line]
[fixture: venn/lex-title-style-rule-other-line]

タイトルの文字内のエンコードされないハッシュやセミコロンは、
そのトークンを終え、残る断片を拒否させる。
[fixture: venn/lex-title-classdef-rule]
[fixture: venn/lex-title-entity-no-semicolon]
[fixture: venn/lex-title-style-rule]
[fixture: venn/lex-title-style-rule-no-hash]

集合には一つの識別子、重なりには識別子列、
style 文には対象が必要で、
単一引用符の集合識別子は拒否される。
[fixture: venn/gram-extra-set-no-id]
[fixture: venn/gram-extra-set-single-quoted]
[fixture: venn/gram-extra-union-no-id]
[fixture: venn/gram-set-list]
[fixture: venn/spec-venn-a50620dc]

字下げした frontmatter と CRLF の frontmatter はタイトルを与え、
その HTML 属性の引用符は単一引用符となり、
ここでの空、構文違反、閉じない形式、
ヘッダーの後の形式、コメントが先行する形式は拒否される。
[fixture: venn/frontmatter-after-header]
[fixture: venn/frontmatter-comment-before]
[fixture: venn/frontmatter-crlf]
[fixture: venn/frontmatter-empty]
[fixture: venn/frontmatter-html-title]
[fixture: venn/frontmatter-indented]
[fixture: venn/frontmatter-invalid]
[fixture: venn/frontmatter-unclosed]

数値のテキスト id は先頭のゼロを保ち、
裸の識別子や空文字列は venn の文を開始できない。
[fixture: venn/db-text-leading-zeros]
[fixture: venn/gram-bare-empty-string]
[fixture: venn/gram-bare-word]

コメントか directive だけの入力にはヘッダーがなく、
字下げしたコメント行は暗黙の text モードを保つ。
[fixture: venn/lex-comment-line-before-text]
[fixture: venn/lex-comment-only]
[fixture: venn/lex-directive-only]

タイトルの区切りはタブ、BOM、NBSP、U+3000、U+2028、U+2029、
CR、CRLF、垂直タブ、改ページを受け入れるが、U+0085 は拒否する。
[fixture: venn/lex-title-separator-bom]
[fixture: venn/lex-title-separator-cr]
[fixture: venn/lex-title-separator-crlf]
[fixture: venn/lex-title-separator-ff]
[fixture: venn/lex-title-separator-ideographic]
[fixture: venn/lex-title-separator-ls]
[fixture: venn/lex-title-separator-nbsp]
[fixture: venn/lex-title-separator-nel]
[fixture: venn/lex-title-separator-ps]
[fixture: venn/lex-title-separator-tab]
[fixture: venn/lex-title-separator-vt]

### 文字の位置

格子は [kanban](#kanban) で定義した 64 種の断片を使い、
`keyword` は `venn-beta`、
`keyword-header` は前後にスペースを置く `venn-beta` とし、
各断片を `a` と `b` の間、
数値の位置では `1` と `2` の間に置く。

`header-line` はヘッダーの後の断片で、完全な文が必要な位置とする。

文法 はこれらの挿入した断片を拒否する。
対象は `ampersand-entity`、`arrow`、`arrow-spaced`、`backslash`、`backtick`、
`bom`、`classdef-rule`、`close-brace`、`close-round`、`close-square`、`colon`、
`comma`、`comment-line`、`constructor`、`cr`、`crlf`、`dash`、`digits`、
`directive`、`directive-line`、`emoji`、`empty`、`entity`、`entity-named`、
`equals`、`ff`、`greater-than`、`hash`、`html`、`html-attribute`、`html-br`、
`ideographic`、`keyword`、`keyword-block`、`keyword-class`、`keyword-classdef`、
`keyword-columns`、`keyword-end`、`keyword-header`、`keyword-space`、
`keyword-style`、`less-than`、`lf`、`ls`、`nbsp`、`nel`、`nonascii`、
`open-brace`、`open-round`、`open-square`、`percent`、`pipe`、`proto`、`ps`、
`punct`、`quote`、`root`、`semicolon`、`single-quote`、`spaces`、`style-rule`、
`tab`、`vt`。
[fixture: venn/gram-grid-ampersand-entity-header-line]
[fixture: venn/gram-grid-arrow-header-line]
[fixture: venn/gram-grid-arrow-spaced-header-line]
[fixture: venn/gram-grid-backslash-header-line]
[fixture: venn/gram-grid-backtick-header-line]
[fixture: venn/gram-grid-bom-header-line]
[fixture: venn/gram-grid-classdef-rule-header-line]
[fixture: venn/gram-grid-close-brace-header-line]
[fixture: venn/gram-grid-close-round-header-line]
[fixture: venn/gram-grid-close-square-header-line]
[fixture: venn/gram-grid-colon-header-line]
[fixture: venn/gram-grid-comma-header-line]
[fixture: venn/gram-grid-comment-line-header-line]
[fixture: venn/gram-grid-constructor-header-line]
[fixture: venn/gram-grid-cr-header-line]
[fixture: venn/gram-grid-crlf-header-line]
[fixture: venn/gram-grid-dash-header-line]
[fixture: venn/gram-grid-digits-header-line]
[fixture: venn/gram-grid-directive-header-line]
[fixture: venn/gram-grid-directive-line-header-line]
[fixture: venn/gram-grid-emoji-header-line]
[fixture: venn/gram-grid-empty-header-line]
[fixture: venn/gram-grid-entity-header-line]
[fixture: venn/gram-grid-entity-named-header-line]
[fixture: venn/gram-grid-equals-header-line]
[fixture: venn/gram-grid-ff-header-line]
[fixture: venn/gram-grid-greater-than-header-line]
[fixture: venn/gram-grid-hash-header-line]
[fixture: venn/gram-grid-html-attribute-header-line]
[fixture: venn/gram-grid-html-br-header-line]
[fixture: venn/gram-grid-html-header-line]
[fixture: venn/gram-grid-ideographic-header-line]
[fixture: venn/gram-grid-keyword-block-header-line]
[fixture: venn/gram-grid-keyword-class-header-line]
[fixture: venn/gram-grid-keyword-classdef-header-line]
[fixture: venn/gram-grid-keyword-columns-header-line]
[fixture: venn/gram-grid-keyword-end-header-line]
[fixture: venn/gram-grid-keyword-header-header-line]
[fixture: venn/gram-grid-keyword-header-line]
[fixture: venn/gram-grid-keyword-space-header-line]
[fixture: venn/gram-grid-keyword-style-header-line]
[fixture: venn/gram-grid-less-than-header-line]
[fixture: venn/gram-grid-lf-header-line]
[fixture: venn/gram-grid-ls-header-line]
[fixture: venn/gram-grid-nbsp-header-line]
[fixture: venn/gram-grid-nel-header-line]
[fixture: venn/gram-grid-nonascii-header-line]
[fixture: venn/gram-grid-open-brace-header-line]
[fixture: venn/gram-grid-open-round-header-line]
[fixture: venn/gram-grid-open-square-header-line]
[fixture: venn/gram-grid-percent-header-line]
[fixture: venn/gram-grid-pipe-header-line]
[fixture: venn/gram-grid-proto-header-line]
[fixture: venn/gram-grid-ps-header-line]
[fixture: venn/gram-grid-punct-header-line]
[fixture: venn/gram-grid-quote-header-line]
[fixture: venn/gram-grid-root-header-line]
[fixture: venn/gram-grid-semicolon-header-line]
[fixture: venn/gram-grid-single-quote-header-line]
[fixture: venn/gram-grid-spaces-header-line]
[fixture: venn/gram-grid-style-rule-header-line]
[fixture: venn/gram-grid-tab-header-line]
[fixture: venn/gram-grid-vt-header-line]

コメントトークンは直前の断片を取り、集合 Z だけを残す。
対象は `comment`。
[fixture: venn/db-grid-comment-header-line]

`identifier-bare` は集合 id、重なりの要素、
text の対象と引用しない id、style の対象が共有する、
ASCII 識別子の lexer と正規化を使う。

lexer はこれらの挿入した断片を拒否する。
対象は `ampersand-entity`、`arrow`、`arrow-spaced`、`backslash`、`backtick`、
`bom`、`classdef-rule`、`close-brace`、`close-round`、`close-square`、`emoji`、
`entity`、`entity-named`、`equals`、`ff`、`greater-than`、`hash`、`html`、
`html-attribute`、`html-br`、`ideographic`、`less-than`、`ls`、`nbsp`、`nel`、
`nonascii`、`open-brace`、`open-round`、`open-square`、`percent`、`pipe`、`ps`、
`punct`、`quote`、`semicolon`、`single-quote`、`style-rule`、`vt`。
[fixture: venn/gram-grid-ampersand-entity-identifier-bare]
[fixture: venn/gram-grid-arrow-identifier-bare]
[fixture: venn/gram-grid-arrow-spaced-identifier-bare]
[fixture: venn/gram-grid-backslash-identifier-bare]
[fixture: venn/gram-grid-backtick-identifier-bare]
[fixture: venn/gram-grid-bom-identifier-bare]
[fixture: venn/gram-grid-classdef-rule-identifier-bare]
[fixture: venn/gram-grid-close-brace-identifier-bare]
[fixture: venn/gram-grid-close-round-identifier-bare]
[fixture: venn/gram-grid-close-square-identifier-bare]
[fixture: venn/gram-grid-emoji-identifier-bare]
[fixture: venn/gram-grid-entity-identifier-bare]
[fixture: venn/gram-grid-entity-named-identifier-bare]
[fixture: venn/gram-grid-equals-identifier-bare]
[fixture: venn/gram-grid-ff-identifier-bare]
[fixture: venn/gram-grid-greater-than-identifier-bare]
[fixture: venn/gram-grid-hash-identifier-bare]
[fixture: venn/gram-grid-html-attribute-identifier-bare]
[fixture: venn/gram-grid-html-br-identifier-bare]
[fixture: venn/gram-grid-html-identifier-bare]
[fixture: venn/gram-grid-ideographic-identifier-bare]
[fixture: venn/gram-grid-less-than-identifier-bare]
[fixture: venn/gram-grid-ls-identifier-bare]
[fixture: venn/gram-grid-nbsp-identifier-bare]
[fixture: venn/gram-grid-nel-identifier-bare]
[fixture: venn/gram-grid-nonascii-identifier-bare]
[fixture: venn/gram-grid-open-brace-identifier-bare]
[fixture: venn/gram-grid-open-round-identifier-bare]
[fixture: venn/gram-grid-open-square-identifier-bare]
[fixture: venn/gram-grid-percent-identifier-bare]
[fixture: venn/gram-grid-pipe-identifier-bare]
[fixture: venn/gram-grid-ps-identifier-bare]
[fixture: venn/gram-grid-punct-identifier-bare]
[fixture: venn/gram-grid-quote-identifier-bare]
[fixture: venn/gram-grid-semicolon-identifier-bare]
[fixture: venn/gram-grid-single-quote-identifier-bare]
[fixture: venn/gram-grid-style-rule-identifier-bare]
[fixture: venn/gram-grid-vt-identifier-bare]

文法 はこれらの挿入した断片を拒否する。
対象は `colon`、`comma`、`comment`、`comment-line`、`cr`、`crlf`、
`directive-line`、`keyword-block`、`keyword-class`、`keyword-classdef`、
`keyword-columns`、`keyword-end`、`keyword-header`、`keyword-space`、`lf`、
`spaces`、`tab`。
[fixture: venn/gram-grid-colon-identifier-bare]
[fixture: venn/gram-grid-comma-identifier-bare]
[fixture: venn/gram-grid-comment-identifier-bare]
[fixture: venn/gram-grid-comment-line-identifier-bare]
[fixture: venn/gram-grid-cr-identifier-bare]
[fixture: venn/gram-grid-crlf-identifier-bare]
[fixture: venn/gram-grid-directive-line-identifier-bare]
[fixture: venn/gram-grid-keyword-block-identifier-bare]
[fixture: venn/gram-grid-keyword-class-identifier-bare]
[fixture: venn/gram-grid-keyword-classdef-identifier-bare]
[fixture: venn/gram-grid-keyword-columns-identifier-bare]
[fixture: venn/gram-grid-keyword-end-identifier-bare]
[fixture: venn/gram-grid-keyword-header-identifier-bare]
[fixture: venn/gram-grid-keyword-space-identifier-bare]
[fixture: venn/gram-grid-lf-identifier-bare]
[fixture: venn/gram-grid-spaces-identifier-bare]
[fixture: venn/gram-grid-tab-identifier-bare]

挿入した断片はこの値に文字として残る。
対象は `constructor`、`dash`、`digits`、`empty`、`keyword`、`proto`、`root`。
[fixture: venn/db-grid-constructor-identifier-bare]
[fixture: venn/db-grid-dash-identifier-bare]
[fixture: venn/db-grid-digits-identifier-bare]
[fixture: venn/db-grid-empty-identifier-bare]
[fixture: venn/db-grid-keyword-identifier-bare]
[fixture: venn/db-grid-proto-identifier-bare]
[fixture: venn/db-grid-root-identifier-bare]

directive は除かれ前後の断片が結合する。
対象は `directive`。
[fixture: venn/db-grid-directive-identifier-bare]

挿入した style キーワードは別の文を始め、
前の値はその前で終わる。
対象は `keyword-style`。
[fixture: venn/db-grid-keyword-style-identifier-bare]

`identifier-quoted` は引用識別子、引用テキスト id、
引用 style 値が共有する文字列の lexer と一組の引用符の除去を使う。

挿入した断片はこの値に文字として残る。
対象は `ampersand-entity`、`arrow`、`arrow-spaced`、`backslash`、`backtick`、
`bom`、`close-brace`、`close-round`、`close-square`、`colon`、`comma`、
`comment`、`constructor`、`dash`、`digits`、`emoji`、`empty`、`equals`、`ff`、
`greater-than`、`hash`、`html`、`html-br`、`ideographic`、`keyword`、
`keyword-block`、`keyword-class`、`keyword-classdef`、`keyword-columns`、
`keyword-end`、`keyword-header`、`keyword-space`、`keyword-style`、`less-than`、
`lf`、`ls`、`nbsp`、`nel`、`nonascii`、`open-brace`、`open-round`、
`open-square`、`percent`、`pipe`、`proto`、`ps`、`punct`、`root`、`semicolon`、
`single-quote`、`spaces`、`tab`、`vt`。
[fixture: venn/db-grid-ampersand-entity-identifier-quoted]
[fixture: venn/db-grid-arrow-identifier-quoted]
[fixture: venn/db-grid-arrow-spaced-identifier-quoted]
[fixture: venn/db-grid-backslash-identifier-quoted]
[fixture: venn/db-grid-backtick-identifier-quoted]
[fixture: venn/db-grid-close-brace-identifier-quoted]
[fixture: venn/db-grid-close-round-identifier-quoted]
[fixture: venn/db-grid-close-square-identifier-quoted]
[fixture: venn/db-grid-colon-identifier-quoted]
[fixture: venn/db-grid-comma-identifier-quoted]
[fixture: venn/db-grid-comment-identifier-quoted]
[fixture: venn/db-grid-constructor-identifier-quoted]
[fixture: venn/db-grid-dash-identifier-quoted]
[fixture: venn/db-grid-digits-identifier-quoted]
[fixture: venn/db-grid-emoji-identifier-quoted]
[fixture: venn/db-grid-empty-identifier-quoted]
[fixture: venn/db-grid-equals-identifier-quoted]
[fixture: venn/db-grid-greater-than-identifier-quoted]
[fixture: venn/db-grid-hash-identifier-quoted]
[fixture: venn/db-grid-html-br-identifier-quoted]
[fixture: venn/db-grid-html-identifier-quoted]
[fixture: venn/db-grid-keyword-block-identifier-quoted]
[fixture: venn/db-grid-keyword-class-identifier-quoted]
[fixture: venn/db-grid-keyword-classdef-identifier-quoted]
[fixture: venn/db-grid-keyword-columns-identifier-quoted]
[fixture: venn/db-grid-keyword-end-identifier-quoted]
[fixture: venn/db-grid-keyword-header-identifier-quoted]
[fixture: venn/db-grid-keyword-identifier-quoted]
[fixture: venn/db-grid-keyword-space-identifier-quoted]
[fixture: venn/db-grid-keyword-style-identifier-quoted]
[fixture: venn/db-grid-less-than-identifier-quoted]
[fixture: venn/db-grid-lf-identifier-quoted]
[fixture: venn/db-grid-nonascii-identifier-quoted]
[fixture: venn/db-grid-open-brace-identifier-quoted]
[fixture: venn/db-grid-open-round-identifier-quoted]
[fixture: venn/db-grid-open-square-identifier-quoted]
[fixture: venn/db-grid-percent-identifier-quoted]
[fixture: venn/db-grid-pipe-identifier-quoted]
[fixture: venn/db-grid-proto-identifier-quoted]
[fixture: venn/db-grid-punct-identifier-quoted]
[fixture: venn/db-grid-root-identifier-quoted]
[fixture: venn/db-grid-semicolon-identifier-quoted]
[fixture: venn/db-grid-single-quote-identifier-quoted]
[fixture: venn/db-grid-spaces-identifier-quoted]
[fixture: venn/lex-bom-quoted-value]
[fixture: venn/lex-ff-quoted-value]
[fixture: venn/lex-ideographic-quoted-value]
[fixture: venn/lex-ls-quoted-value]
[fixture: venn/lex-nbsp-quoted-value]
[fixture: venn/lex-nel-quoted-value]
[fixture: venn/lex-ps-quoted-value]
[fixture: venn/lex-tab-quoted-value]
[fixture: venn/lex-vt-quoted-value]

一致する style や classDef の行は最後のセミコロンを失う。
対象は `classdef-rule`、`style-rule`。
[fixture: venn/db-grid-classdef-rule-identifier-quoted]
[fixture: venn/db-grid-style-rule-identifier-quoted]

挿入した改行や除去したコメント行は一つの LF となる。
対象は `comment-line`、`cr`、`crlf`。
[fixture: venn/lex-cr-quoted-value]
[fixture: venn/lex-crlf-quoted-value]
[fixture: venn/lex-identifier-comment-line]

directive は除かれ前後の断片が結合する。
対象は `directive`。
[fixture: venn/lex-identifier-directive-middle]

除去した directive 行は二つの LF を残す。
対象は `directive-line`。
[fixture: venn/lex-identifier-directive-line]

文字参照は共通の前処理のプレースホルダーとなる。
対象は `entity`、`entity-named`。
[fixture: venn/lex-identifier-entity-named]
[fixture: venn/lex-identifier-entity-numeric]

HTML 属性の二重引用符は単一引用符となる。
対象は `html-attribute`。
[fixture: venn/lex-identifier-html-attribute]

文法 はこれらの挿入した断片を拒否する。
対象は `quote`。
[fixture: venn/gram-grid-quote-identifier-quoted]

`label-bare` は引用しない括弧ラベルの lexer を使い、
Db の正規化の前にも trim する。

挿入した断片はこの値に文字として残る。
対象は `ampersand-entity`、`arrow`、`arrow-spaced`、`backslash`、`backtick`、
`bom`、`close-brace`、`close-round`、`colon`、`comma`、`comment`、
`constructor`、`dash`、`digits`、`emoji`、`empty`、`equals`、`ff`、
`greater-than`、`hash`、`html`、`html-br`、`ideographic`、`keyword`、
`keyword-block`、`keyword-class`、`keyword-classdef`、`keyword-columns`、
`keyword-end`、`keyword-header`、`keyword-space`、`keyword-style`、`less-than`、
`lf`、`ls`、`nbsp`、`nel`、`nonascii`、`open-brace`、`open-round`、
`open-square`、`percent`、`pipe`、`proto`、`ps`、`punct`、`root`、`semicolon`、
`single-quote`、`spaces`、`tab`、`vt`。
[fixture: venn/db-grid-ampersand-entity-label-bare]
[fixture: venn/db-grid-arrow-label-bare]
[fixture: venn/db-grid-arrow-spaced-label-bare]
[fixture: venn/db-grid-backslash-label-bare]
[fixture: venn/db-grid-backtick-label-bare]
[fixture: venn/db-grid-bom-label-bare]
[fixture: venn/db-grid-close-brace-label-bare]
[fixture: venn/db-grid-close-round-label-bare]
[fixture: venn/db-grid-colon-label-bare]
[fixture: venn/db-grid-comma-label-bare]
[fixture: venn/db-grid-comment-label-bare]
[fixture: venn/db-grid-constructor-label-bare]
[fixture: venn/db-grid-dash-label-bare]
[fixture: venn/db-grid-digits-label-bare]
[fixture: venn/db-grid-emoji-label-bare]
[fixture: venn/db-grid-empty-label-bare]
[fixture: venn/db-grid-equals-label-bare]
[fixture: venn/db-grid-ff-label-bare]
[fixture: venn/db-grid-greater-than-label-bare]
[fixture: venn/db-grid-hash-label-bare]
[fixture: venn/db-grid-html-br-label-bare]
[fixture: venn/db-grid-html-label-bare]
[fixture: venn/db-grid-ideographic-label-bare]
[fixture: venn/db-grid-keyword-block-label-bare]
[fixture: venn/db-grid-keyword-class-label-bare]
[fixture: venn/db-grid-keyword-classdef-label-bare]
[fixture: venn/db-grid-keyword-columns-label-bare]
[fixture: venn/db-grid-keyword-end-label-bare]
[fixture: venn/db-grid-keyword-header-label-bare]
[fixture: venn/db-grid-keyword-label-bare]
[fixture: venn/db-grid-keyword-space-label-bare]
[fixture: venn/db-grid-keyword-style-label-bare]
[fixture: venn/db-grid-less-than-label-bare]
[fixture: venn/db-grid-lf-label-bare]
[fixture: venn/db-grid-ls-label-bare]
[fixture: venn/db-grid-nbsp-label-bare]
[fixture: venn/db-grid-nel-label-bare]
[fixture: venn/db-grid-nonascii-label-bare]
[fixture: venn/db-grid-open-brace-label-bare]
[fixture: venn/db-grid-open-round-label-bare]
[fixture: venn/db-grid-open-square-label-bare]
[fixture: venn/db-grid-percent-label-bare]
[fixture: venn/db-grid-pipe-label-bare]
[fixture: venn/db-grid-proto-label-bare]
[fixture: venn/db-grid-ps-label-bare]
[fixture: venn/db-grid-punct-label-bare]
[fixture: venn/db-grid-root-label-bare]
[fixture: venn/db-grid-semicolon-label-bare]
[fixture: venn/db-grid-single-quote-label-bare]
[fixture: venn/db-grid-spaces-label-bare]
[fixture: venn/db-grid-tab-label-bare]
[fixture: venn/db-grid-vt-label-bare]

一致する style や classDef の行は最後のセミコロンを失う。
対象は `classdef-rule`、`style-rule`。
[fixture: venn/db-grid-classdef-rule-label-bare]
[fixture: venn/db-grid-style-rule-label-bare]

文法 はこれらの挿入した断片を拒否する。
対象は `close-square`。
[fixture: venn/gram-grid-close-square-label-bare]

挿入した改行や除去したコメント行は一つの LF となる。
対象は `comment-line`、`cr`、`crlf`。
[fixture: venn/db-grid-comment-line-label-bare]
[fixture: venn/db-grid-cr-label-bare]
[fixture: venn/db-grid-crlf-label-bare]

directive は除かれ前後の断片が結合する。
対象は `directive`。
[fixture: venn/db-grid-directive-label-bare]

除去した directive 行は二つの LF を残す。
対象は `directive-line`。
[fixture: venn/db-grid-directive-line-label-bare]

文字参照は共通の前処理のプレースホルダーとなる。
対象は `entity`、`entity-named`。
[fixture: venn/db-grid-entity-label-bare]
[fixture: venn/db-grid-entity-named-label-bare]

HTML 属性の二重引用符は単一引用符となる。
対象は `html-attribute`。
[fixture: venn/db-grid-html-attribute-label-bare]

lexer はこれらの挿入した断片を拒否する。
対象は `quote`。
[fixture: venn/gram-grid-quote-label-bare]

`label-quoted` は Db の正規化の前に括弧文字列の区切りを除き、
内側の空白も trim できる。

挿入した断片はこの値に文字として残る。
対象は `ampersand-entity`、`arrow`、`arrow-spaced`、`backslash`、`backtick`、
`bom`、`close-brace`、`close-round`、`close-square`、`colon`、`comma`、
`comment`、`constructor`、`dash`、`digits`、`emoji`、`empty`、`equals`、`ff`、
`greater-than`、`hash`、`html`、`html-br`、`ideographic`、`keyword`、
`keyword-block`、`keyword-class`、`keyword-classdef`、`keyword-columns`、
`keyword-end`、`keyword-header`、`keyword-space`、`keyword-style`、`less-than`、
`lf`、`ls`、`nbsp`、`nel`、`nonascii`、`open-brace`、`open-round`、
`open-square`、`percent`、`pipe`、`proto`、`ps`、`punct`、`root`、`semicolon`、
`single-quote`、`spaces`、`tab`、`vt`。
[fixture: venn/db-grid-ampersand-entity-label-quoted]
[fixture: venn/db-grid-arrow-label-quoted]
[fixture: venn/db-grid-arrow-spaced-label-quoted]
[fixture: venn/db-grid-backslash-label-quoted]
[fixture: venn/db-grid-backtick-label-quoted]
[fixture: venn/db-grid-bom-label-quoted]
[fixture: venn/db-grid-close-brace-label-quoted]
[fixture: venn/db-grid-close-round-label-quoted]
[fixture: venn/db-grid-close-square-label-quoted]
[fixture: venn/db-grid-colon-label-quoted]
[fixture: venn/db-grid-comma-label-quoted]
[fixture: venn/db-grid-comment-label-quoted]
[fixture: venn/db-grid-constructor-label-quoted]
[fixture: venn/db-grid-dash-label-quoted]
[fixture: venn/db-grid-digits-label-quoted]
[fixture: venn/db-grid-emoji-label-quoted]
[fixture: venn/db-grid-empty-label-quoted]
[fixture: venn/db-grid-equals-label-quoted]
[fixture: venn/db-grid-ff-label-quoted]
[fixture: venn/db-grid-greater-than-label-quoted]
[fixture: venn/db-grid-hash-label-quoted]
[fixture: venn/db-grid-html-br-label-quoted]
[fixture: venn/db-grid-html-label-quoted]
[fixture: venn/db-grid-ideographic-label-quoted]
[fixture: venn/db-grid-keyword-block-label-quoted]
[fixture: venn/db-grid-keyword-class-label-quoted]
[fixture: venn/db-grid-keyword-classdef-label-quoted]
[fixture: venn/db-grid-keyword-columns-label-quoted]
[fixture: venn/db-grid-keyword-end-label-quoted]
[fixture: venn/db-grid-keyword-header-label-quoted]
[fixture: venn/db-grid-keyword-label-quoted]
[fixture: venn/db-grid-keyword-space-label-quoted]
[fixture: venn/db-grid-keyword-style-label-quoted]
[fixture: venn/db-grid-less-than-label-quoted]
[fixture: venn/db-grid-lf-label-quoted]
[fixture: venn/db-grid-ls-label-quoted]
[fixture: venn/db-grid-nbsp-label-quoted]
[fixture: venn/db-grid-nel-label-quoted]
[fixture: venn/db-grid-nonascii-label-quoted]
[fixture: venn/db-grid-open-brace-label-quoted]
[fixture: venn/db-grid-open-round-label-quoted]
[fixture: venn/db-grid-open-square-label-quoted]
[fixture: venn/db-grid-percent-label-quoted]
[fixture: venn/db-grid-pipe-label-quoted]
[fixture: venn/db-grid-proto-label-quoted]
[fixture: venn/db-grid-ps-label-quoted]
[fixture: venn/db-grid-punct-label-quoted]
[fixture: venn/db-grid-root-label-quoted]
[fixture: venn/db-grid-semicolon-label-quoted]
[fixture: venn/db-grid-single-quote-label-quoted]
[fixture: venn/db-grid-spaces-label-quoted]
[fixture: venn/db-grid-tab-label-quoted]
[fixture: venn/db-grid-vt-label-quoted]

一致する style や classDef の行は最後のセミコロンを失う。
対象は `classdef-rule`、`style-rule`。
[fixture: venn/db-grid-classdef-rule-label-quoted]
[fixture: venn/db-grid-style-rule-label-quoted]

挿入した改行や除去したコメント行は一つの LF となる。
対象は `comment-line`、`cr`、`crlf`。
[fixture: venn/db-grid-cr-label-quoted]
[fixture: venn/db-grid-crlf-label-quoted]
[fixture: venn/lex-label-comment-line]

directive は除かれ前後の断片が結合する。
対象は `directive`。
[fixture: venn/lex-label-directive-middle]

除去した directive 行は二つの LF を残す。
対象は `directive-line`。
[fixture: venn/lex-label-directive-line]

文字参照は共通の前処理のプレースホルダーとなる。
対象は `entity`、`entity-named`。
[fixture: venn/lex-label-entity-named]
[fixture: venn/lex-label-entity-numeric]

HTML 属性の二重引用符は単一引用符となる。
対象は `html-attribute`。
[fixture: venn/lex-label-html-attribute]

lexer はこれらの挿入した断片を拒否する。
対象は `quote`。
[fixture: venn/gram-grid-quote-label-quoted]

`size` は集合か重なりの数値トークンを `parseFloat()` で変換する。

lexer はこれらの挿入した断片を拒否する。
対象は `ampersand-entity`、`arrow`、`arrow-spaced`、`backslash`、`backtick`、
`bom`、`close-brace`、`close-round`、`close-square`、`emoji`、`entity`、
`entity-named`、`equals`、`ff`、`greater-than`、`hash`、`html`、
`html-attribute`、`html-br`、`ideographic`、`less-than`、`ls`、`nbsp`、`nel`、
`nonascii`、`open-brace`、`open-round`、`open-square`、`percent`、`pipe`、`ps`、
`punct`、`quote`、`semicolon`、`single-quote`、`vt`。
[fixture: venn/gram-grid-ampersand-entity-size]
[fixture: venn/gram-grid-arrow-size]
[fixture: venn/gram-grid-arrow-spaced-size]
[fixture: venn/gram-grid-backslash-size]
[fixture: venn/gram-grid-backtick-size]
[fixture: venn/gram-grid-bom-size]
[fixture: venn/gram-grid-close-brace-size]
[fixture: venn/gram-grid-close-round-size]
[fixture: venn/gram-grid-close-square-size]
[fixture: venn/gram-grid-emoji-size]
[fixture: venn/gram-grid-entity-named-size]
[fixture: venn/gram-grid-entity-size]
[fixture: venn/gram-grid-equals-size]
[fixture: venn/gram-grid-ff-size]
[fixture: venn/gram-grid-greater-than-size]
[fixture: venn/gram-grid-hash-size]
[fixture: venn/gram-grid-html-attribute-size]
[fixture: venn/gram-grid-html-br-size]
[fixture: venn/gram-grid-html-size]
[fixture: venn/gram-grid-ideographic-size]
[fixture: venn/gram-grid-less-than-size]
[fixture: venn/gram-grid-ls-size]
[fixture: venn/gram-grid-nbsp-size]
[fixture: venn/gram-grid-nel-size]
[fixture: venn/gram-grid-nonascii-size]
[fixture: venn/gram-grid-open-brace-size]
[fixture: venn/gram-grid-open-round-size]
[fixture: venn/gram-grid-open-square-size]
[fixture: venn/gram-grid-percent-size]
[fixture: venn/gram-grid-pipe-size]
[fixture: venn/gram-grid-ps-size]
[fixture: venn/gram-grid-punct-size]
[fixture: venn/gram-grid-quote-size]
[fixture: venn/gram-grid-semicolon-size]
[fixture: venn/gram-grid-single-quote-size]
[fixture: venn/gram-grid-vt-size]

文法 はこれらの挿入した断片を拒否する。
対象は `classdef-rule`、`colon`、`comma`、`comment`、`comment-line`、
`constructor`、`cr`、`crlf`、`dash`、`directive-line`、`keyword`、
`keyword-block`、`keyword-class`、`keyword-classdef`、`keyword-columns`、
`keyword-end`、`keyword-header`、`keyword-space`、`lf`、`proto`、`root`、
`spaces`、`style-rule`、`tab`。
[fixture: venn/gram-grid-classdef-rule-size]
[fixture: venn/gram-grid-colon-size]
[fixture: venn/gram-grid-comma-size]
[fixture: venn/gram-grid-comment-line-size]
[fixture: venn/gram-grid-comment-size]
[fixture: venn/gram-grid-constructor-size]
[fixture: venn/gram-grid-cr-size]
[fixture: venn/gram-grid-crlf-size]
[fixture: venn/gram-grid-dash-size]
[fixture: venn/gram-grid-directive-line-size]
[fixture: venn/gram-grid-keyword-block-size]
[fixture: venn/gram-grid-keyword-class-size]
[fixture: venn/gram-grid-keyword-classdef-size]
[fixture: venn/gram-grid-keyword-columns-size]
[fixture: venn/gram-grid-keyword-end-size]
[fixture: venn/gram-grid-keyword-header-size]
[fixture: venn/gram-grid-keyword-size]
[fixture: venn/gram-grid-keyword-space-size]
[fixture: venn/gram-grid-lf-size]
[fixture: venn/gram-grid-proto-size]
[fixture: venn/gram-grid-root-size]
[fixture: venn/gram-grid-spaces-size]
[fixture: venn/gram-grid-style-rule-size]
[fixture: venn/gram-grid-tab-size]

挿入した断片はこの値に文字として残る。
対象は `digits`、`empty`。
[fixture: venn/db-grid-digits-size]
[fixture: venn/db-grid-empty-size]

サイズは 12 となる。
対象は `directive`。
[fixture: venn/db-grid-directive-size]

挿入した style キーワードは別の文を始め、
前の値はその前で終わる。
対象は `keyword-style`。
[fixture: venn/db-grid-keyword-style-size]

`text-number` は数値トークンをサイズに変換せず文字として保つ。

lexer はこれらの挿入した断片を拒否する。
対象は `ampersand-entity`、`arrow`、`arrow-spaced`、`backslash`、`backtick`、
`bom`、`close-brace`、`close-round`、`close-square`、`emoji`、`entity`、
`entity-named`、`equals`、`ff`、`greater-than`、`hash`、`html`、
`html-attribute`、`html-br`、`ideographic`、`less-than`、`ls`、`nbsp`、`nel`、
`nonascii`、`open-brace`、`open-round`、`open-square`、`percent`、`pipe`、`ps`、
`punct`、`quote`、`semicolon`、`single-quote`、`vt`。
[fixture: venn/gram-grid-ampersand-entity-text-number]
[fixture: venn/gram-grid-arrow-spaced-text-number]
[fixture: venn/gram-grid-arrow-text-number]
[fixture: venn/gram-grid-backslash-text-number]
[fixture: venn/gram-grid-backtick-text-number]
[fixture: venn/gram-grid-bom-text-number]
[fixture: venn/gram-grid-close-brace-text-number]
[fixture: venn/gram-grid-close-round-text-number]
[fixture: venn/gram-grid-close-square-text-number]
[fixture: venn/gram-grid-emoji-text-number]
[fixture: venn/gram-grid-entity-named-text-number]
[fixture: venn/gram-grid-entity-text-number]
[fixture: venn/gram-grid-equals-text-number]
[fixture: venn/gram-grid-ff-text-number]
[fixture: venn/gram-grid-greater-than-text-number]
[fixture: venn/gram-grid-hash-text-number]
[fixture: venn/gram-grid-html-attribute-text-number]
[fixture: venn/gram-grid-html-br-text-number]
[fixture: venn/gram-grid-html-text-number]
[fixture: venn/gram-grid-ideographic-text-number]
[fixture: venn/gram-grid-less-than-text-number]
[fixture: venn/gram-grid-ls-text-number]
[fixture: venn/gram-grid-nbsp-text-number]
[fixture: venn/gram-grid-nel-text-number]
[fixture: venn/gram-grid-nonascii-text-number]
[fixture: venn/gram-grid-open-brace-text-number]
[fixture: venn/gram-grid-open-round-text-number]
[fixture: venn/gram-grid-open-square-text-number]
[fixture: venn/gram-grid-percent-text-number]
[fixture: venn/gram-grid-pipe-text-number]
[fixture: venn/gram-grid-ps-text-number]
[fixture: venn/gram-grid-punct-text-number]
[fixture: venn/gram-grid-quote-text-number]
[fixture: venn/gram-grid-semicolon-text-number]
[fixture: venn/gram-grid-single-quote-text-number]
[fixture: venn/gram-grid-vt-text-number]

文法 はこれらの挿入した断片を拒否する。
対象は `classdef-rule`、`colon`、`comma`、`comment`、`comment-line`、
`constructor`、`cr`、`crlf`、`dash`、`directive-line`、`keyword`、
`keyword-block`、`keyword-class`、`keyword-classdef`、`keyword-columns`、
`keyword-end`、`keyword-header`、`keyword-space`、`lf`、`proto`、`root`、
`spaces`、`style-rule`、`tab`。
[fixture: venn/gram-grid-classdef-rule-text-number]
[fixture: venn/gram-grid-colon-text-number]
[fixture: venn/gram-grid-comma-text-number]
[fixture: venn/gram-grid-comment-line-text-number]
[fixture: venn/gram-grid-comment-text-number]
[fixture: venn/gram-grid-constructor-text-number]
[fixture: venn/gram-grid-cr-text-number]
[fixture: venn/gram-grid-crlf-text-number]
[fixture: venn/gram-grid-dash-text-number]
[fixture: venn/gram-grid-directive-line-text-number]
[fixture: venn/gram-grid-keyword-block-text-number]
[fixture: venn/gram-grid-keyword-class-text-number]
[fixture: venn/gram-grid-keyword-classdef-text-number]
[fixture: venn/gram-grid-keyword-columns-text-number]
[fixture: venn/gram-grid-keyword-end-text-number]
[fixture: venn/gram-grid-keyword-header-text-number]
[fixture: venn/gram-grid-keyword-space-text-number]
[fixture: venn/gram-grid-keyword-text-number]
[fixture: venn/gram-grid-lf-text-number]
[fixture: venn/gram-grid-proto-text-number]
[fixture: venn/gram-grid-root-text-number]
[fixture: venn/gram-grid-spaces-text-number]
[fixture: venn/gram-grid-style-rule-text-number]
[fixture: venn/gram-grid-tab-text-number]

挿入した断片はこの値に文字として残る。
対象は `digits`、`empty`。
[fixture: venn/db-grid-digits-text-number]
[fixture: venn/db-grid-empty-text-number]

directive は除かれ前後の断片が結合する。
対象は `directive`。
[fixture: venn/db-grid-directive-text-number]

挿入した style キーワードは別の文を始め、
前の値はその前で終わる。
対象は `keyword-style`。
[fixture: venn/db-grid-keyword-style-text-number]

`style-key` は識別子の lexer を使い、
その表記を通常のプロパティオブジェクトのキーとする。

lexer はこれらの挿入した断片を拒否する。
対象は `ampersand-entity`、`arrow`、`arrow-spaced`、`backslash`、`backtick`、
`bom`、`classdef-rule`、`close-brace`、`close-round`、`close-square`、`emoji`、
`entity`、`entity-named`、`equals`、`ff`、`greater-than`、`hash`、`html`、
`html-attribute`、`html-br`、`ideographic`、`less-than`、`ls`、`nbsp`、`nel`、
`nonascii`、`open-brace`、`open-round`、`open-square`、`percent`、`pipe`、`ps`、
`punct`、`quote`、`semicolon`、`single-quote`、`style-rule`、`vt`。
[fixture: venn/gram-grid-ampersand-entity-style-key]
[fixture: venn/gram-grid-arrow-spaced-style-key]
[fixture: venn/gram-grid-arrow-style-key]
[fixture: venn/gram-grid-backslash-style-key]
[fixture: venn/gram-grid-backtick-style-key]
[fixture: venn/gram-grid-bom-style-key]
[fixture: venn/gram-grid-classdef-rule-style-key]
[fixture: venn/gram-grid-close-brace-style-key]
[fixture: venn/gram-grid-close-round-style-key]
[fixture: venn/gram-grid-close-square-style-key]
[fixture: venn/gram-grid-emoji-style-key]
[fixture: venn/gram-grid-entity-named-style-key]
[fixture: venn/gram-grid-entity-style-key]
[fixture: venn/gram-grid-equals-style-key]
[fixture: venn/gram-grid-ff-style-key]
[fixture: venn/gram-grid-greater-than-style-key]
[fixture: venn/gram-grid-hash-style-key]
[fixture: venn/gram-grid-html-attribute-style-key]
[fixture: venn/gram-grid-html-br-style-key]
[fixture: venn/gram-grid-html-style-key]
[fixture: venn/gram-grid-ideographic-style-key]
[fixture: venn/gram-grid-less-than-style-key]
[fixture: venn/gram-grid-ls-style-key]
[fixture: venn/gram-grid-nbsp-style-key]
[fixture: venn/gram-grid-nel-style-key]
[fixture: venn/gram-grid-nonascii-style-key]
[fixture: venn/gram-grid-open-brace-style-key]
[fixture: venn/gram-grid-open-round-style-key]
[fixture: venn/gram-grid-open-square-style-key]
[fixture: venn/gram-grid-percent-style-key]
[fixture: venn/gram-grid-pipe-style-key]
[fixture: venn/gram-grid-ps-style-key]
[fixture: venn/gram-grid-punct-style-key]
[fixture: venn/gram-grid-quote-style-key]
[fixture: venn/gram-grid-semicolon-style-key]
[fixture: venn/gram-grid-single-quote-style-key]
[fixture: venn/gram-grid-style-rule-style-key]
[fixture: venn/gram-grid-vt-style-key]

文法 はこれらの挿入した断片を拒否する。
対象は `colon`、`comma`、`comment`、`comment-line`、`cr`、`crlf`、
`directive-line`、`keyword-block`、`keyword-class`、`keyword-classdef`、
`keyword-columns`、`keyword-end`、`keyword-header`、`keyword-space`、
`keyword-style`、`lf`、`spaces`、`tab`。
[fixture: venn/gram-grid-colon-style-key]
[fixture: venn/gram-grid-comma-style-key]
[fixture: venn/gram-grid-comment-line-style-key]
[fixture: venn/gram-grid-comment-style-key]
[fixture: venn/gram-grid-cr-style-key]
[fixture: venn/gram-grid-crlf-style-key]
[fixture: venn/gram-grid-directive-line-style-key]
[fixture: venn/gram-grid-keyword-block-style-key]
[fixture: venn/gram-grid-keyword-class-style-key]
[fixture: venn/gram-grid-keyword-classdef-style-key]
[fixture: venn/gram-grid-keyword-columns-style-key]
[fixture: venn/gram-grid-keyword-end-style-key]
[fixture: venn/gram-grid-keyword-header-style-key]
[fixture: venn/gram-grid-keyword-space-style-key]
[fixture: venn/gram-grid-keyword-style-style-key]
[fixture: venn/gram-grid-lf-style-key]
[fixture: venn/gram-grid-spaces-style-key]
[fixture: venn/gram-grid-tab-style-key]

挿入した断片はこの値に文字として残る。
対象は `constructor`、`dash`、`digits`、`empty`、`keyword`、`proto`、`root`。
[fixture: venn/db-grid-constructor-style-key]
[fixture: venn/db-grid-dash-style-key]
[fixture: venn/db-grid-digits-style-key]
[fixture: venn/db-grid-empty-style-key]
[fixture: venn/db-grid-keyword-style-key]
[fixture: venn/db-grid-proto-style-key]
[fixture: venn/db-grid-root-style-key]

directive は除かれ前後の断片が結合する。
対象は `directive`。
[fixture: venn/db-grid-directive-style-key]

`style-value` は引用しない値の単語間に断片を挿入し、
rgb、rgba、十六進色の内側は上の色トークンの読みで別に扱う。
[fixture: venn/db-grid-spaces-style-value]
[fixture: venn/db-style-rgb-line-separator]
[fixture: venn/db-style-hex-five]

lexer はこれらの挿入した断片を拒否する。
対象は `ampersand-entity`、`arrow`、`arrow-spaced`、`backslash`、`backtick`、
`bom`、`close-brace`、`close-round`、`close-square`、`emoji`、`entity-named`、
`equals`、`ff`、`greater-than`、`hash`、`html`、`html-attribute`、`html-br`、
`ideographic`、`less-than`、`ls`、`nbsp`、`nel`、`nonascii`、`open-brace`、
`open-round`、`open-square`、`percent`、`pipe`、`ps`、`punct`、`quote`、
`semicolon`、`single-quote`、`vt`。
[fixture: venn/gram-grid-ampersand-entity-style-value]
[fixture: venn/gram-grid-arrow-spaced-style-value]
[fixture: venn/gram-grid-arrow-style-value]
[fixture: venn/gram-grid-backslash-style-value]
[fixture: venn/gram-grid-backtick-style-value]
[fixture: venn/gram-grid-bom-style-value]
[fixture: venn/gram-grid-close-brace-style-value]
[fixture: venn/gram-grid-close-round-style-value]
[fixture: venn/gram-grid-close-square-style-value]
[fixture: venn/gram-grid-emoji-style-value]
[fixture: venn/gram-grid-entity-named-style-value]
[fixture: venn/gram-grid-equals-style-value]
[fixture: venn/gram-grid-ff-style-value]
[fixture: venn/gram-grid-greater-than-style-value]
[fixture: venn/gram-grid-hash-style-value]
[fixture: venn/gram-grid-html-attribute-style-value]
[fixture: venn/gram-grid-html-br-style-value]
[fixture: venn/gram-grid-html-style-value]
[fixture: venn/gram-grid-ideographic-style-value]
[fixture: venn/gram-grid-less-than-style-value]
[fixture: venn/gram-grid-ls-style-value]
[fixture: venn/gram-grid-nbsp-style-value]
[fixture: venn/gram-grid-nel-style-value]
[fixture: venn/gram-grid-nonascii-style-value]
[fixture: venn/gram-grid-open-brace-style-value]
[fixture: venn/gram-grid-open-round-style-value]
[fixture: venn/gram-grid-open-square-style-value]
[fixture: venn/gram-grid-percent-style-value]
[fixture: venn/gram-grid-pipe-style-value]
[fixture: venn/gram-grid-ps-style-value]
[fixture: venn/gram-grid-punct-style-value]
[fixture: venn/gram-grid-quote-style-value]
[fixture: venn/gram-grid-semicolon-style-value]
[fixture: venn/gram-grid-single-quote-style-value]
[fixture: venn/gram-grid-vt-style-value]

文法 はこれらの挿入した断片を拒否する。
対象は `classdef-rule`、`colon`、`comma`、`comment`、`comment-line`、`cr`、
`crlf`、`directive-line`、`keyword-classdef`、`keyword-header`、`lf`、
`style-rule`。
[fixture: venn/gram-grid-classdef-rule-style-value]
[fixture: venn/gram-grid-colon-style-value]
[fixture: venn/gram-grid-comma-style-value]
[fixture: venn/gram-grid-comment-line-style-value]
[fixture: venn/gram-grid-comment-style-value]
[fixture: venn/gram-grid-cr-style-value]
[fixture: venn/gram-grid-crlf-style-value]
[fixture: venn/gram-grid-directive-line-style-value]
[fixture: venn/gram-grid-keyword-classdef-style-value]
[fixture: venn/gram-grid-keyword-header-style-value]
[fixture: venn/gram-grid-lf-style-value]
[fixture: venn/gram-grid-style-rule-style-value]

挿入した断片はこの値に文字として残る。
対象は `constructor`、`dash`、`digits`、`empty`、`keyword`、`keyword-block`、
`keyword-class`、`keyword-columns`、`keyword-end`、`keyword-space`、`proto`、
`root`。
[fixture: venn/db-grid-constructor-style-value]
[fixture: venn/db-grid-dash-style-value]
[fixture: venn/db-grid-digits-style-value]
[fixture: venn/db-grid-empty-style-value]
[fixture: venn/db-grid-keyword-block-style-value]
[fixture: venn/db-grid-keyword-class-style-value]
[fixture: venn/db-grid-keyword-columns-style-value]
[fixture: venn/db-grid-keyword-end-style-value]
[fixture: venn/db-grid-keyword-space-style-value]
[fixture: venn/db-grid-keyword-style-value]
[fixture: venn/db-grid-proto-style-value]
[fixture: venn/db-grid-root-style-value]

directive は除かれ前後の断片が結合する。
対象は `directive`。
[fixture: venn/db-grid-directive-style-value]

保持する値は `"a #35b"` となる。
対象は `entity`。
[fixture: venn/db-grid-entity-style-value]

挿入した style キーワードは別の文を始め、
前の値はその前で終わる。
対象は `keyword-style`。
[fixture: venn/db-grid-keyword-style-style-value]

引用しない値のトークン間の空白は一つのスペースとなる。
対象は `spaces`、`tab`。
[fixture: venn/db-grid-spaces-style-value]
[fixture: venn/db-grid-tab-style-value]

`title` はタイトルのトークン全体と共通の setter を使い、
venn の文字列の正規化を使わない。

lexer はこれらの挿入した断片を拒否する。
対象は `ampersand-entity`、`classdef-rule`、`hash`、`semicolon`、`style-rule`。
[fixture: venn/gram-grid-ampersand-entity-title]
[fixture: venn/gram-grid-classdef-rule-title]
[fixture: venn/gram-grid-hash-title]
[fixture: venn/gram-grid-semicolon-title]
[fixture: venn/gram-grid-style-rule-title]

挿入した断片はこの値に文字として残る。
対象は `arrow`、`arrow-spaced`、`backslash`、`backtick`、`bom`、`close-brace`、
`close-round`、`close-square`、`colon`、`comma`、`comment`、`constructor`、
`dash`、`digits`、`emoji`、`empty`、`equals`、`ff`、`greater-than`、`html`、
`html-br`、`ideographic`、`keyword`、`keyword-block`、`keyword-class`、
`keyword-classdef`、`keyword-columns`、`keyword-end`、`keyword-header`、
`keyword-space`、`keyword-style`、`less-than`、`ls`、`nbsp`、`nel`、`nonascii`、
`open-brace`、`open-round`、`open-square`、`percent`、`pipe`、`proto`、`ps`、
`punct`、`quote`、`root`、`single-quote`、`spaces`、`tab`、`vt`。
[fixture: venn/db-grid-arrow-spaced-title]
[fixture: venn/db-grid-arrow-title]
[fixture: venn/db-grid-backslash-title]
[fixture: venn/db-grid-backtick-title]
[fixture: venn/db-grid-bom-title]
[fixture: venn/db-grid-close-brace-title]
[fixture: venn/db-grid-close-round-title]
[fixture: venn/db-grid-close-square-title]
[fixture: venn/db-grid-colon-title]
[fixture: venn/db-grid-comma-title]
[fixture: venn/db-grid-comment-title]
[fixture: venn/db-grid-constructor-title]
[fixture: venn/db-grid-dash-title]
[fixture: venn/db-grid-digits-title]
[fixture: venn/db-grid-emoji-title]
[fixture: venn/db-grid-empty-title]
[fixture: venn/db-grid-equals-title]
[fixture: venn/db-grid-ff-title]
[fixture: venn/db-grid-greater-than-title]
[fixture: venn/db-grid-html-br-title]
[fixture: venn/db-grid-html-title]
[fixture: venn/db-grid-ideographic-title]
[fixture: venn/db-grid-keyword-block-title]
[fixture: venn/db-grid-keyword-class-title]
[fixture: venn/db-grid-keyword-classdef-title]
[fixture: venn/db-grid-keyword-columns-title]
[fixture: venn/db-grid-keyword-end-title]
[fixture: venn/db-grid-keyword-header-title]
[fixture: venn/db-grid-keyword-space-title]
[fixture: venn/db-grid-keyword-style-title]
[fixture: venn/db-grid-keyword-title]
[fixture: venn/db-grid-less-than-title]
[fixture: venn/db-grid-ls-title]
[fixture: venn/db-grid-nbsp-title]
[fixture: venn/db-grid-nel-title]
[fixture: venn/db-grid-nonascii-title]
[fixture: venn/db-grid-open-brace-title]
[fixture: venn/db-grid-open-round-title]
[fixture: venn/db-grid-open-square-title]
[fixture: venn/db-grid-percent-title]
[fixture: venn/db-grid-pipe-title]
[fixture: venn/db-grid-proto-title]
[fixture: venn/db-grid-ps-title]
[fixture: venn/db-grid-punct-title]
[fixture: venn/db-grid-quote-title]
[fixture: venn/db-grid-root-title]
[fixture: venn/db-grid-single-quote-title]
[fixture: venn/db-grid-spaces-title]
[fixture: venn/db-grid-tab-title]
[fixture: venn/db-grid-vt-title]

文法 はこれらの挿入した断片を拒否する。
対象は `comment-line`、`cr`、`crlf`、`directive-line`、`lf`。
[fixture: venn/gram-grid-cr-title]
[fixture: venn/gram-grid-crlf-title]
[fixture: venn/gram-grid-lf-title]
[fixture: venn/lex-title-comment-line]
[fixture: venn/lex-title-directive-line]

directive は除かれ前後の断片が結合する。
対象は `directive`。
[fixture: venn/lex-title-directive-middle]

文字参照は共通の前処理のプレースホルダーとなる。
対象は `entity`、`entity-named`。
[fixture: venn/lex-title-entity-named]
[fixture: venn/lex-title-entity-numeric]

HTML 属性の二重引用符は単一引用符となる。
対象は `html-attribute`。
[fixture: venn/lex-title-html-attribute]
