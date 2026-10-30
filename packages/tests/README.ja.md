# @mmd-toolkit/tests

英語版: [README.md](./README.md)

Mermaid 記法の実装を、mermaid.js と比べてテストするための fixture と道具です。
どの fixture も、pin した mermaid.js（`mermaid@12.2.0`）が、
その入力をどう扱ったかを記録しています。

mermaid-js とは関係のない、第三者のプロジェクトです。

## 導入

このパッケージは private で、このリポジトリのワークスペースの中で使います。
開発用の依存として足し、一度ビルドしてください。
使う側は `lib/` のビルド済みファイルを読みます。

```json
{ "devDependencies": { "@mmd-toolkit/tests": "workspace:*" } }
```

```sh
pnpm --filter @mmd-toolkit/tests run build
```

Node の `^22.18.0 || ^24.11.0 || >=26.0.0` で動きます。

## 最小の使い方

自分の実装が、mermaid.js と違う受理・拒否をする fixture を探します。
`accepts` は、あなたの実装を表します。

```js
import { loadFixtures } from "@mmd-toolkit/tests"

for (const fixture of await loadFixtures("flowchart")) {
  // On these inputs the specification deliberately differs from mermaid.js.
  if (fixture.knownDivergence !== undefined) continue
  if (accepts(fixture.input) !== fixture.expected.accepted) {
    console.log(
      `${fixture.name}: mermaid.js ${fixture.expected.accepted ? "accepts" : "rejects"} it`,
    )
  }
}
```

任意のテキストについて、mermaid.js の結果を得ます。

```js
import { runMermaid } from "@mmd-toolkit/tests/mermaid"

const outcome = await runMermaid("flowchart LR\n  A --> B\n")
console.log(outcome.accepted, outcome.diagramType, outcome.db.edges.length)
// true flowchart-v2 1

const rejected = await runMermaid("flowchart LR\n  A -->\n")
console.log(rejected.accepted, rejected.error.name)
// false Error
```

## fixture の中身

fixture は 1 件ごとに、
このパッケージのディレクトリ `fixtures/<diagram>/<name>/` です。
絶対パスは `getFixturesRoot()` で得られます。
`<diagram>` は、図種（`flowchart`、`sequence`、`class`、`state`、`er`、`gantt`、
`journey`、 `requirement`、`mindmap`、`timeline`、`sankey`、`xychart`、
`quadrant`、 `block`、`kanban`、`c4`、`venn`、`ishikawa`、`agentflow`、
`usecase`、`pie`、 `gitgraph`、`info`、`packet`、`architecture`、`radar`、
`treemap`、 `treeview`、`railroad`、`wardley`、`eventmodeling`）か、
`common` です。
`common` は、全図種に共通する構文（フロントマター、ディレクティブ、コメント、
図種の検出）のためのものです。

- `input.mmd`: 検査するテキスト。
  バイト単位でそのまま。
- `expected.json`: mermaid.js がその入力をどう扱ったか。
- `specified.json`: 仕様どおりの実装がその入力に対して出す結果。
  それが mermaid.js の結果と違うときにだけある。
  入力の読み方を変える既知の差異を外して、mermaid.js に読ませた結果である。
  どの印に必要かは `DIVERGENCE_PROPERTIES` が定める。
  受理には `fixtureAccepts(fixture)` を使う。
  比較する Db がある場合は、`specified`、なければ `expected` を使い、
  `embeddedValuesOf()` と合わせる。
  不透明な埋め込みの内容は、比較する Db なしで受理できる。
  [docs/expected-results.ja.md](./docs/expected-results.ja.md) を参照。
- `ast.json`: 参照実装（`@mmd-toolkit/parser`）がその入力に対して返す木。
  参照実装が受理する入力にだけある。
- `parse-error.json`: 参照実装がその入力を拒否する `ParseError` の、 `message`、
  `range`、`loc`。
  参照実装がそうして拒否する入力にだけある。
  エラーの位置は仕様が定めず、参照実装が決める。
  その規則は [error-positions.ja.md](../parser/docs/error-positions.ja.md)
  にある。

fixture には、`ast.json` と `parse-error.json` のどちらか一方までがあります。

`expected.json` の欄:

| 欄                | 意味                                                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `source`          | 入力の出どころ。`{ kind: "mermaid", ref, path, line?, test? }`、またはここで書いた入力なら `{ kind: "authored", note }`。                                                                                                |
| `config`          | 省略可能。入力を実行するときのサイト設定。`mermaid.initialize()` に渡す形。                                                                                                                                              |
| `knownDivergence` | 省略可能。この入力では、仕様が意図して mermaid.js と違う。ファイルの残りは mermaid.js の結果のまま。                                                                                                                     |
| `accepted`        | mermaid.js が入力を受理するか。                                                                                                                                                                                          |
| `diagramType`     | 受理する入力で、mermaid.js が検出する図種 ID。例: `flowchart-v2`。                                                                                                                                                       |
| `db`              | 受理する入力で、mermaid.js の Db の要約（素の JSON）。pin した mermaid.js のどの図種にも要約があるので、`null` の `expected.json` はない。loader が `null` を許すのは `common/` だけで、要約を持たない図種の入力のとき。 |
| `error`           | 拒否する入力で、mermaid.js のエラーの `name` と `message`。message は人が読むためのもので、実装が合わせる必要はない。                                                                                                    |
| `embedded`        | 省略可能。受理する入力で、埋め込みのデータから mermaid.js が導く、Db が頼る値。`config`、`title`、`dataBlockEffects`。[docs/embedded-data.ja.md](./docs/embedded-data.ja.md) を参照。                                    |

例として `fixtures/flowchart/config-inherit-dir-site/expected.json`
を示します（Db は短くしています）。

```json
{
  "source": {
    "kind": "authored",
    "note": "Same input as config-inherit-dir-default with flowchart.inheritDir set in site configuration: the subgraph inherits dir LR."
  },
  "config": { "flowchart": { "inheritDir": true } },
  "accepted": true,
  "diagramType": "flowchart-v2",
  "db": {
    "direction": "LR",
    "subgraphs": [{ "id": "S", "nodes": ["A"], "title": "S", "dir": "LR" }]
  }
}
```

図種ごとの `db` の欄は [docs/db-summaries.ja.md](./docs/db-summaries.ja.md) に、
木からそれを作る手順は [docs/db-from-tree/](./docs/db-from-tree/) にあります。

`fixtures/default-config.json` は、
何も変えないテキストに対する mermaid.js の設定です（`getDefaultConfig()`）。
fixture の `embedded.config` は、その入力がこの設定に起こす変更です。

## API

### `@mmd-toolkit/tests`

fixture を読みます。
mermaid.js は読み込みません。

- `loadFixtures(diagram)`: `"common"`、`"flowchart"`、`"sequence"`、`"class"`、
  `"state"`、 `"er"`、 `"gantt"`、`"journey"`、`"requirement"`、`"mindmap"`、
  `"timeline"`、 `"sankey"`、`"xychart"`、`"quadrant"`、`"block"`、 `"kanban"`、
  `"c4"`、 `"venn"`、`"ishikawa"`、`"agentflow"`、`"usecase"`、 `"pie"`、
  `"gitGraph"`、 `"info"`、`"packet"`、`"architecture"`、`"radar"`、
  `"treemap"`、 `"treeview"`、`"railroad"`、`"wardley"`、
  `"eventmodeling"` のどれかの fixture を、名前順に返す。
  それぞれは `diagram`、`name`、`input`（`input.mmd` のテキスト）、`source`、
  `config` と `knownDivergence`（あるとき）、
  `specified`（ファイルがあるとき）、`expected` を持つ。
  `expected` は `{ accepted: true, diagramType, db }` か
  `{ accepted: false, error }`。
  ファイルは 1 つずつ読む。
  fixture を読むテストファイルが並列の worker で動いても、
  開いているファイルの数がシステムの上限に届かないようにするためのもの。
- `loadFixture(diagram, name)`: 図種 `diagram` の fixture `name` を 1 つ返す。
  `loadFixtures(diagram)` が同じ名前で持つものと同じオブジェクト。
  読むのはその fixture のディレクトリのファイルだけなので、
  名前で数個の fixture を使うテストが、図種の数千の fixture を読まずにすむ。
  その名前の fixture が図種に無いときは例外を投げる。
- `fixtureNames(diagram)`: 図種の fixture の名前を、名前順に返す。
  `fixtures/<図種>/` の下のディレクトリの名前で、
  `loadFixtures` と `loadFixture` が fixture とするものと同じ。
  ファイルは読まない。
- `KNOWN_DIVERGENCES`: fixture の `knownDivergence` がとりうる識別子。
  それぞれ仕様で定義している。
  - `directive-as-token-boundary`:
    [known-divergences/directive-as-token-boundary.ja.md](../spec/docs/known-divergences/directive-as-token-boundary.ja.md)
    を参照。
  - `ignored-semicolon-as-token-boundary`:
    [known-divergences/ignored-semicolon-as-token-boundary.ja.md](../spec/docs/known-divergences/ignored-semicolon-as-token-boundary.ja.md)
    を参照。
  - `html-tag-in-frontmatter`:
    [known-divergences/html-tag-in-frontmatter.ja.md](../spec/docs/known-divergences/html-tag-in-frontmatter.ja.md)
    を参照。
  - `embedded-data-opaque`:
    [known-divergences/embedded-data-opaque.ja.md](../spec/docs/known-divergences/embedded-data-opaque.ja.md)
    を参照。
  - `click-reserved-word`:
    [known-divergences/click-reserved-word.ja.md](../spec/docs/known-divergences/click-reserved-word.ja.md)
    を参照。
  - `tokenless-empty-forms`:
    [known-divergences/tokenless-empty-forms.ja.md](../spec/docs/known-divergences/tokenless-empty-forms.ja.md)
    を参照。
  - `comment-takes-character`:
    [known-divergences/comment-takes-character.ja.md](../spec/docs/known-divergences/comment-takes-character.ja.md)
    を参照。
  - `comment-takes-line-break`:
    [known-divergences/comment-takes-line-break.ja.md](../spec/docs/known-divergences/comment-takes-line-break.ja.md)
    を参照。
  - `headerless-empty-ending`:
    [known-divergences/headerless-empty-ending.ja.md](../spec/docs/known-divergences/headerless-empty-ending.ja.md)
    を参照。
  - `name-start-reads-unit`:
    [known-divergences/name-start-reads-unit.ja.md](../spec/docs/known-divergences/name-start-reads-unit.ja.md)
    を参照。
  - `c4-keyword-anywhere`:
    [known-divergences/c4-keyword-anywhere.ja.md](../spec/docs/known-divergences/c4-keyword-anywhere.ja.md)
    を参照。
  - `bare-percent-line-before-header`:
    [known-divergences/bare-percent-line-before-header.ja.md](../spec/docs/known-divergences/bare-percent-line-before-header.ja.md)
    を参照。
  - `percent-brace-after-unit`:
    [known-divergences/percent-brace-after-unit.ja.md](../spec/docs/known-divergences/percent-brace-after-unit.ja.md)
    を参照。
  - `blank-line-after-header-or-comments`:
    [known-divergences/blank-line-after-header-or-comments.ja.md](../spec/docs/known-divergences/blank-line-after-header-or-comments.ja.md)
    を参照。
  - `title-digit-after-axis-statement`:
    [known-divergences/title-digit-after-axis-statement.ja.md](../spec/docs/known-divergences/title-digit-after-axis-statement.ja.md)
    を参照。
- `getFixturesRoot()`: `fixtures/` ディレクトリの絶対パス。
- `DIVERGENCE_PROPERTIES`: `ReadonlyMap<string, DivergenceProperties>`。
  各識別子の `{ direction, requiresSpecifiedReading }` を明記した表。
  `direction` は `"accept"`、`"reject"`、`"both"` のいずれか。
  別の boolean は、比較する読みの `specified.json` が必要かを示す。
  受理の向きだけでも、Db の読みに必要な差異を含む。
- `fixtureAccepts(fixture)`: 仕様が fixture を受理するか。
  先に印の指定読みの要否を検査する。
  必要な `specified.json` がなければ、
  識別子と `<diagram>/<name>` を含めて投げる。
  次に、`specified` があればその `accepted`、なければ印の向きを使う。
  無印の fixture は `expected.accepted` を使う。
  `embedded-data-opaque` は `direction: "both"` で、指定読みが必要。
  不透明なデータから比較 Db を求められないときは、
  読みは `db: null` で受理することがある。
  埋め込み設定を読まないことで受理が変わるときは、拒否することもある。
  未知の識別子でも、fixture 名と識別子を含めて投げる。
- `getDefaultConfig()`: `embedded.config`
  がそれとの差になる設定（`fixtures/default-config.json`）。
- `embeddedValuesOf(fixture)`: fixture の入力について `resolveEmbeddedData()`
  が返す値を、 fixture が記録したものから作る。
  合わせる読み（`specified`、なければ `expected`）に対する値。
  拒否のときは `undefined`。
- `dbFromTree(text, tree, embedded, isColor)`: 記録した木（`ast.json`）が表す Db
  の要約を、パーサーなしで作る関数。
  `exceedsMaxEdges(tree, config)`、`flowchartEdgeCount(tree)`、
  `agentflowEdgeCount(tree)` は、グラフ系の木の辺の上限を確かめる。
  [docs/db-from-tree.ja.md](./docs/db-from-tree.ja.md) を参照。
- `checkTree(text, tree)`: 記録した木（`ast.json`）について、
  仕様が述べる条件のうち成り立たないもの。
  すべてを満たす木では空。
  [docs/check-tree.ja.md](./docs/check-tree.ja.md) を参照。
- `cssSupportsColor(value)`: ブラウザの `CSS.supports("color", value)`
  が答えるもの。
  ここで mermaid.js を動かすときに与えている代役と同じ。
  sequence の `box` の行がこれを尋ねる。
  この答えを外から受け取る実装のためのもの。
  [docs/expected-results.ja.md](./docs/expected-results.ja.md) を参照。
- 型: `DiagramType`、`Fixture`、`FixtureSource`、`Expectation`、`ExpectedFile`、
  `RecordedEmbedded`、`DbSummary`、`MermaidConfig`、`MermaidError`、
  `DivergenceDirection`、`DivergenceProperties`。

### `@mmd-toolkit/tests/mermaid`

pin した mermaid.js を Node で動かします。

- `runMermaid(text, { config })`: `{ accepted: true, diagramType, db }` か
  `{ accepted: false, error }` を、 `expected.json` が記録する形で返す。
- `resolveEmbeddedData(text, { config })`: mermaid.js がフロントマター、
  ディレクティブ、`@{ ... }` のデータブロックから導く値を返す。
  それらを読まない実装のためのもの。
  mermaid.js がテキストを拒否したときは `undefined`。
  [docs/embedded-data.ja.md](./docs/embedded-data.ja.md) を参照。
  - `config`: そのテキストについての mermaid.js の設定の全体。
  - `title`: フロントマターの title。
  - `dataBlockEffects`: 各データブロックが Db に何をしたか。
    `{ id, set }` の一覧。
- `runMermaidWithEmbeddedData(text, { config })`: 上の 2 つの結果を、
  1 回の実行から `{ outcome, embedded }` として返す。
- `MermaidEnvironmentError`: Node にないブラウザの機能を mermaid.js
  が必要としたときに投げる。
- 上の 3 つの関数の options の `withoutDivergences`: mermaid.js を、
  一覧の既知の差異を除いて読ませた形で動かす。
  差異が違いの唯一の原因であることを確かめる実装のためのもの。
  一覧に入れられるのは `comment-takes-character`、`comment-takes-line-break`、
  `name-start-reads-unit`、`percent-brace-after-unit`、
  `c4-keyword-anywhere` （型 `DivergenceRemoval`）。
  mermaid.js の同じ部分を変える差異は、同時には除けない。
  [docs/expected-results.ja.md](./docs/expected-results.ja.md) を参照。
- `config` と `withoutDivergences` 以外のキーを持つ options を渡すと、
  このモジュールの options を取る関数はどれも `TypeError` を投げる。
  書き誤った選択肢が黙って無視されないようにするためのもの。
- `runMermaid()` と `runMermaidWithEmbeddedData()` の結果は、
  ディスクの貯蔵庫（リポジトリのルートの
  `node_modules/.cache/mmd-toolkit/mermaid-runs/`）に置かれ、同じテキスト、
  選択肢、コードに対して、そこから返される。
  環境変数 `MMD_TOOLKIT_MERMAID_CACHE=disabled` で貯蔵庫を切り、
  ディレクトリを消すと空になる。
  [docs/expected-results.ja.md](./docs/expected-results.ja.md) を参照。

2 つの入口のほかの export は、このリポジトリの道具が使うものです。
一覧は [docs/maintaining-fixtures.ja.md](./docs/maintaining-fixtures.ja.md)
にあります。

## 保証と制限

- どの結果も、`mermaid@12.2.0` を Node で動かした結果です。
  pin した mermaid.js が変わると、fixture を作り直したときに、
  変わった結果が `expected.json` の差分として現れます。
- ラベルなどのテキストは、mermaid.js が HTML の無害化をする前の値です。
  リンクは書かれたとおりの URL です。
  実装は DOMPurify や URL の無害化を再現する必要がありません。
  [docs/expected-results.ja.md](./docs/expected-results.ja.md)
  を参照してください。
- Db の要約は、構文が決める情報だけを持ちます。
  要約が捨てる欄は [docs/db-summaries.ja.md](./docs/db-summaries.ja.md)
  にあります。
- `securityLevel` が `strict`、`loose`、`antiscript`、`sandbox` のどれでも、
  要約は同じです。
- mermaid.js が埋め込まれたデータから導く値は、mermaid.js 自身から受け取ります。
  それと比べても、実装がその値をどう導くかは検査されません。
- `expected.json` の `db` は、どの fixture でも要約です。
  `embedded-data-opaque` の指定読み（`specified.json`）は、
  不透明なデータから比較の Db を導けないとき、 `db` が `null` です。
  Db の要約は、`db` が `null` でないところだけで比べてください。
- mermaid.js の呼び出しは 1 つずつ実行し、
  どの呼び出しも mermaid.js の既定の設定と、渡したサイト設定から始まります。
- Node にないブラウザの機能を mermaid.js が必要とすると、
  拒否ではなく `MermaidEnvironmentError` を投げます。

## 文書

- [docs/expected-results.ja.md](./docs/expected-results.ja.md): mermaid.js
  から結果を得る方法と、テキストとリンクを無害化の前の値で記録する理由。
- [docs/embedded-data.ja.md](./docs/embedded-data.ja.md):
  埋め込まれたデータから導く値と、それと比べて確かめられること。
- [docs/db-summaries.ja.md](./docs/db-summaries.ja.md): Db
  の要約が持つものと捨てるもの。
- [docs/db-from-tree.ja.md](./docs/db-from-tree.ja.md): 記録した木から Db
  を作ることと、その読む欄。
- [docs/check-tree.ja.md](./docs/check-tree.ja.md):
  記録した木が仕様の条件を満たすことの検査。
- [docs/maintaining-fixtures.ja.md](./docs/maintaining-fixtures.ja.md):
  保守する人向け。
  fixture を足す、変える、改名する、集める方法。
- [tools/README.ja.md](../../tools/README.ja.md): 保守する人向け。
  コマンドラインの道具と、mermaid.js から入力を集め直す方法。
