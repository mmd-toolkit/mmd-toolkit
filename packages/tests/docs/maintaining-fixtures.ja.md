# fixture の保守

英語版: [maintaining-fixtures.md](./maintaining-fixtures.md)

この文書は、fixture を足す、変える、改名する、集める人のためのものです。
fixture の読み方は [README](../README.ja.md) にあります。

## 手で書くもの

`expected.json` のうち手で書くのは、 `source`、`config`、
`knownDivergence` だけです。
生成器はこの 3 つの欄をそのまま保ち、残りを mermaid.js から書き直し、
ファイルを正準形（欄の順序を固定、2 文字の字下げ、末尾の改行）に保ちます。
既存の fixture の note と `knownDivergence` は、
`fixtures:set-note` と `fixtures:set-divergence` で変えます。

- `source`: `kind: "mermaid"` は、
  mermaid.js のリポジトリの `ref` の時点のファイル `path` から取った入力で、
  省略可能な `line` とテスト名 `test` を持つ。
  `kind: "authored"` は、ここで書いた入力で、`note` に理由を書く。
  例:

  ```json
  {
    "kind": "mermaid",
    "ref": "mermaid@12.0.0",
    "path": "packages/mermaid/src/diagrams/flowchart/parser/flow-edges.spec.js",
    "line": 71,
    "test": "[Edges] when parsing > should handle open ended edges"
  }
  ```

- `config`: 入力自身がしない設定に左右される挙動を示す fixture にだけ使う。
  例えば保護されたキー `maxEdges`、サイトが設定する `flowchart.inheritDir`。
  mermaid.js から取った入力には付けない。
- `knownDivergence`: `KNOWN_DIVERGENCES` のいずれか。
  仕様が意図して mermaid.js と違う入力に付ける。
  識別子は、
  それぞれ `@mmd-toolkit/spec` の `docs/known-divergences.md` の表の行。

`@mmd-toolkit/tests` が export する `DIVERGENCE_PROPERTIES` は、
各識別子の `direction`（`"accept"`、`"reject"`、`"both"`）と、
`requiresSpecifiedReading` を明記します。
表のキーと `KNOWN_DIVERGENCES` を仕様に合わせます。
読み込んだ後は `fixtureAccepts(fixture)` で必要な指定読みを検査し、
受理を決めます。
別の向きや指定読みの要否の一覧は持ちません。
必要な `specified.json` がなければ、
識別子と `<diagram>/<name>` を含めて投げます。
受理の向きだけでも、比較する読みに指定読みが要る差異を含みます。
指定読みがあれば、それが受理を決め、なければ向きで決めます。
無印の fixture は `expected.accepted` を使います。
ローダーはファイルを読み、この関数が受理を検査します。

比較する Db の値には、記録された読み（`specified`、なければ `expected`）と、
`embeddedValuesOf()` を使います。
`embedded-data-opaque` は向きが `"both"` で、
印のある全 fixture に `specified.json` が必要です。
不正な不透明データから比較 Db を求められないときは、
受理の読みが `db: null` を持つことがあります。
埋め込み設定は受理を両方向に変え得ます。
比較の参照入力では、Mermaid の設定導出で拒否されたブロックだけを除き、
正しいテキスト内設定から、仕様が名指しする受理条件の鍵だけを除きます。
ほかの導出値は保ちます。
Mermaid の frontmatter タイトルや、
`wrap` など Db に効く設定も保ちます。 [fixture: gitgraph/div-frontmatter-main-branch-preserves-title]
[fixture: sequence/div-invalid-frontmatter-preserves-wrap-directive]
比較 Db がないことを明示し、Db を作り出したり、
mermaid.js の拒否を仕様の拒否と扱ったりしません。

## 名前

fixture の名前は、小文字のケバブケースで `<接頭辞>-<話題>` です。
同じ話題に入力が多いときは、
末尾に入力の SHA-256 の先頭 8 桁の 16 進数を付けます（収集の道具が、
mermaid.js から取った入力に付けるのと同じ）。
話題は、その入力が示すものの名前で、どの文の、どこに何があるかです。
接頭辞は、その fixture で失敗したときに、何の失敗になるかを示します。

- `lex-`: テキストを単位に分けるやり方。
  名前、文字列、コメント、
  ディレクティブやコメントが始まれる場所（図種の字句の規則）。
- `gram-`: 単位から作られる文とノード（文法と木）。
- `db-`: Db の要約の値。
  何を持ち、値をどう作るか。
- `tokens-`: 木のトークンとコメント。
  トークンやコメントの始まりと終わり、範囲が除くもの。
- `div-`: 既知の差異の印を持つ入力。
- `config-`、`frontmatter-`、`directive-`、`comment-`、`entity-`、`detect-`、
  `header-`、`html-`、`error-`: 仕様の共通の規則（`common.md`）を、
  示す規則で分けたもの。
- `spec-`、`docs-`、`demo-`: mermaid.js から取った入力（そのテスト、文書、
  デモ）。
  収集の道具が名前を付ける（下の「mermaid から取った入力」を参照）。

1 つの入力が複数のものを示すときは、失敗が何についてのものになるかで、
接頭辞を選びます。

話題の後に、入力が持つものの印を付けてよく、複数あるときはこの順です。
`u2028` か `u2029`（その文字が入力にある）、
`directive` か `open-directive`（ディレクティブ、または閉じていないもの）、
`semicolon`（`;`）。
話題がすでにディレクティブを名前に持つときは、印として繰り返しません。

## `ast.json` と `parse-error.json`

`expected.json` は、このパッケージの生成器を通して mermaid.js から作ります。
`ast.json` と `parse-error.json` は、
仕様の参照実装（`@mmd-toolkit/parser`）から作ります。
どちらも parser のテストがファイルスナップショットとして書きます。
`ast.json` は parser が受理する入力にだけあり、
`parse-error.json` は parser が `ParseError` で拒否する入力にだけあります。
`parse-error.json` は、その `ParseError` の `message`、`range`、`loc` です。
入力と一緒に読めるよう、入力の隣に置きます。
このパッケージはこれらを読みも書きも検査もせず、parser にも依存しません。
生成器、`add`、`add-many`、`set-divergence`、`set-note`、収集の道具、
`loadFixtures()` が扱うのは `input.mmd`、`expected.json`、
`specified.json` だけで、
fixture のディレクトリにあるほかのファイルはそのまま残します。
ここで足した fixture には、
parser のテストが走るまでどちらのファイルもありません。

**記録した木は JSON です。**
JSON が書けない数は、`JSON.stringify` が書くとおり、
`ast.json` では `null` です。
double に収まらない数（`Infinity` と `-Infinity`）を持つ、
NumericLiteral の `value` がそうで、ほかの欄はそのような数を持てないので、
それ以外の欄にはありません。
ノードの `raw` には書かれたとおりの数があります。
`checkTree()` は、
書かれたテキストがそのような数である NumericLiteral の `value` に、`null`、
`Infinity`、`-Infinity` を認めます。
ほかの `value` の `null` は認めません。
`dbFromTree()` はノードのテキストから数を読むので、
変換は要りません。 [fixture: xychart/db-plot-values-overflow]

## 道具のための export

入口は、このリポジトリの道具とテストだけが使う関数も export しています。
実装をテストするためのものではありません。

- `@mmd-toolkit/tests`:
  - `allowsUnsummarizedDb(diagram)`: その区分で `db` が `null` でよいか（`common` だけ）。
  - `parseExpectedFile(json, label)`、`serializeExpectedFile(file)`、
    `fixtureSourceProblem(source)`: `expected.json` を正準形で読み、書き、
    検査する。
- `@mmd-toolkit/tests/mermaid`:
  - `detectDiagramType(text, { config })`:
    mermaid.js の検出器がテキストに与える図種 ID の promise を返す。
    どれにも当たらなければ `undefined` の promise。
    テキストは解析しないので、mermaid.js が拒否するテキストの図種も分かる。
  - `mermaidVersion`: pin した mermaid.js の版。
  - `extractFrontmatterTitle(text)`:
    mermaid.js と同じ方法で取り出したフロントマターの title （[expected-results.ja.md](./expected-results.ja.md) を参照）。

## コマンド

`packages/tests` で実行します（または `pnpm --filter @mmd-toolkit/tests run ...`）。

```sh
# pin した mermaid から、全 expected.json、specified.json、
# default-config.json を作り直す。
pnpm run fixtures:generate
# それらのどれかが変わるなら失敗する。
pnpm run fixtures:check
# 手で書いた fixture を足す（入力は標準入力か --input）。
pnpm run fixtures:add flowchart subgraph-inherits-dir \
  --note "Why this case exists" --config '{"flowchart":{"inheritDir":true}}' < input.mmd
# JSON からまとめて足す: [{ "name", "input", "note"? か "source"?, "config"?,
# "knownDivergence"?, "accepted"? }] か { "fixtures": [...] }。mermaid から
# 取った入力は、note の代わりに "source"（kind は "mermaid"）を書く。--note は
# 既定の note、--strip-prefix は名前の接頭辞を外す、--dry-run は何も書かない。
pnpm run fixtures:add-many common entries.json --note "..." --dry-run
# pin したタグの mermaid のチェックアウトから図種の入力を集め、add-many
# のファイルにする（下の「mermaid から取った入力」を参照）。
pnpm run fixtures:collect flowchart --mermaid <checkout> --out flowchart.json
pnpm run fixtures:add-many flowchart flowchart.json
# fixture に既知の差異の印を付ける: { "<diagram>/<name>": "<識別子>" か null }。
# その欄と、それに左右される specified.json だけが変わる
# （specified の読みがある印の fixture には mermaid.js を動かす）。
pnpm run fixtures:set-divergence divergences.json --dry-run
# 手で書いた fixture の note を差し替える: { "<diagram>/<name>": "<note>" }。
pnpm run fixtures:set-note notes.json --dry-run
```

- `fixtures:add` は、入力と設定が同じ fixture が別の名前ですでにあれば拒否する。
- `add-many` はそのような項目を飛ばし、不正な項目が 1 つでもあれば何も書かない。
  項目が `accepted` を書いていて mermaid.js と食い違えば、
  mermaid.js の結果を記録し、食い違いを一覧に出す。
  mermaid.js が拒否する項目も、エラーとともに一覧に出す。
- `generate`（と `fixtures:check`）は、
  `expected.json` が変わる fixture を 1 件ずつ、どう変わったかと、
  fixture の `knownDivergence`（あるとき）とともに出す。
  いくつも変わったときは、次のうち最初のものを出す。
  - `acceptance`:
    mermaid.js が受理していた入力を拒否するようになったか、その逆。
    両側の図種 ID かエラーの名前を添える。
  - `detection`: 受理のまま、別の図種 ID になった。
  - `summary fields`: 要約に、一方にないキーがある。
    `+` と `-` を付けて挙げる。
    キーには著者が書くもの（データブロックの中身、props）も含まれるので、
    一覧を読む。
  - `Db values`: キーは同じで、値が違う。
  - `embedded values`: Db は同じで、`embedded` の値が違う。
  - `error name`: 拒否のまま、エラーの名前が違う。
  - `error message only`: 拒否のまま、名前も同じ。
  - `file format only`: 期待は同じで、ファイルが正準形で書かれていなかった。
- fixture の `specified.json` の変更は、それだけの 1 行で出す。
  `specified.json added`、`specified.json removed`、
  または `specified.json:` に続けて、読みがどう変わったかを上のどれかで示す。
- 作れない fixture があっても、`generate` は止まらない。
  作れないのは、Node にないブラウザの機能を mermaid.js が使おうとしたとき、
  `mermaid.parse()` と `getDiagramFromText()` が食い違うとき、
  入力がそのディレクトリに属さない図種として検出されたとき、
  その図種に正規化関数がないときである。
  そのような fixture は、最後に理由とともに一覧に出し、ファイルはそのまま残し、
  実行を失敗させる。
- `generate`、`add`、`add-many` は、 `Error`、`MermaidParseError`、
  `UnknownDiagramError`、
  `YAMLException` 以外のエラーで拒否された fixture を一覧に出す。
  1 件ずつ、
  入力が原因であることを手で確かめる（[expected-results.ja.md](./expected-results.ja.md) の「拒否か、
  ブラウザの機能の欠如か」を参照）。

ワークフロー `NodeCI.yml` は `.github/workflows_bk/` にあり、
今は有効なワークフローがありません。
その `fixtures` ジョブは全 `expected.json` を作り直し、
差分か新しいファイルが出れば失敗します。
そのため、mermaid.js の挙動の変化は差分として現れます。

## 改名と削除

fixture を改名するか消すときは、
`ast.json` や `parse-error.json` も一緒に動くよう、
ディレクトリごと `mv` か `rm -r` で動かします。
`git mv` は使いません。
ステージはコミットする人に任せます。
そのあと、`@mmd-toolkit/spec` の fixture へのリンクなど、
古い名前への参照を探します。

## mermaid から取った入力

`tools/collect.ts` は、
pin した mermaid.js のタグにある mermaid.js のチェックアウトを読み、
見つけた 1 つの図種の入力を `add-many` のファイルとして書きます。
各 fixture は、入力の出どころを kind が `mermaid` の `source` として記録します。
タグ、リポジトリ内のパス、行、テストファイルならテストの題名の並びです。

- テストファイル: その図種の構文に図のテキストを渡す mermaid のテスト。
  Langium の図種では、mermaid の parser パッケージのその図種のテストも含む。
  図種ごとに集めるテストファイルの一覧と除外の理由は、
  `tools/collect.ts` の `SPEC_FILES` だけが持つ。
  テストは入力の多くをループとテンプレートリテラルで作るので、
  各ファイルをスタブに対して実行し、mermaid.js に渡したテキストを、
  拒否されるものも含めてすべて取る。
  行は呼び出しの行（`tools/src/spec-recorder.ts`）。
  検出器がほかの図種を与えるテキストは除く。
- 文書: `packages/mermaid/src/docs` の `mermaid`、`mermaid-example`、
  `mermaid-nocode` のブロックのうち、
  mermaid.js の検出器がその図種の ID のどれかを与えるもの。
- デモのページ: `demos/*.html` の `<pre class="mermaid">` のうち、
  検出器がその図種の ID のどれかを与えるもの。
  テキストは `mermaid.run()` が読むもの、つまり文字参照を解決し、
  `dedent()` をかけ、前後の空白を除いたもの。
  `run()` はそのあと `<br>` の書き方をすべて `<br/>` に書き換えるが、
  それは mermaid.js の処理でありページのテキストではないので、ここでは行わない。

どの入力にも `config` は付けません。
テストファイルやデモのページがする設定は、図のテキストの一部ではないためです。

その図種の fixture にすでにある入力は除き、繰り返しも除きます。
繰り返しは最初の出どころ（テストファイル、文書、デモの順）を残します。

名前は `<出どころ>-<ファイル>-<ハッシュ>` で、
`<ハッシュ>` は入力の SHA-256 の先頭 16 進 8 桁です。
例: `spec-flow-edges-3f2a9c1b`。
名前は入力と最初に見つかった場所だけで決まるので、
mermaid.js が変わった後に集め直しても、新しい入力だけが足され、
名前は変わりません。
1 つのファイルで、ハッシュの先頭が同じになる異なる入力が 2 つあれば実行を止め、
手で名前を付けます。

チェックアウトの準備と収集の実行方法、
mermaid.js が拒否する入力の確かめ方は [tools/README.ja.md](../../../tools/README.ja.md) にあります。

## 形で入力を選ぶ

ほかの集まりが持つ入力（道具が失敗を見つけた入力で、
千件を超えることもある）は多く、その多くは名前、文字列、
ラベルのテキストだけが違います。
その中の 1 つが、ほかを代表します。
どれが代表かは、
`shapeOf(text, source)`（`src/fixture-shapes.ts`）の形が決めます。
source は、記録した木（`ast.json`）か、parser が返す木から、
`shapeSourceOf(tree)` で作ります。
木のトークンと、
フロントマターとデータブロックのノード（`DATA_BLOCK_NODE_TYPES`、
spec の AST 文書の見出し）の範囲です。
範囲はテキストから探し直さず、木から取ります。
形は、トークンの列（それぞれ型とテキストを持つ）と、その間の文字の列です。

- 作者が名前を付けたものを持つトークン、つまり `Identifier`、`RawText`、
  `String`、`StringFragment` の語と数は、
  テキストに初めて出る順に番号を付けます。
  字、数字、下線の並びは `a1`、`a2`、…、数字だけの並びは `0_1`、`0_2`、…で、
  同じ綴りは同じ番号です。
  名前の綴りは読みを変えませんが、2 つの名前が同じかは変えます。
  `A-->B` は頂点が 2 つ、`A-->A` は 1 つです。
  ディレクティブが 1 つの名前から切り出した断片は、1 つの名前です。
  `a%%{init: {}}%%b` は `ab` です。
  トークンのほかの文字、つまり `:`、`#`、テキストの並びの中の `;`、引用符、
  空白は残ります。
  読みは、トークンがどこで始まりどこで終わるかにも左右されます。
  それはトークンの型とトークンの間の文字に現れます。
  `subgraph a end`、改行、`;` では、
  名前のトークンが改行を取り（`a end` と改行）、
  `subgraph a pend` では取りません。
  `classDef:#x;` は、テキストの並びの中にエンティティの `;` を持ち、
  `style:#f00;` は独立した `IgnoredSemicolon` を持ちます。
- ほかのトークンは書かれたまま残ります。
  `Keyword`（`end`、`direction`、`box`、`LR` と `lr` は、書かれた大小のまま）、
  `Punctuator`（矢印の字、`--o` と `--x`、`-x`）、
  `Numeric`（`linkStyle 0` と `linkStyle 5`）、`Directive`、
  `IgnoredSemicolon` です。
  その字はすべて値で読まれます。
- トークンの間の文字は、すべて書かれたまま残ります。
  空白の数、U+2028 と U+2029、コメント、改行の種類です。
  フロントマターとデータブロック `@{ … }` の中のトークンも、
  書かれたまま残ります。
  そこの語は値だからです（`"wrap": true` と `"wrap": false`、
  `shape: rect` と `shape: foo`）。
  範囲はノードのものなので、データブロックの中のディレクティブにある `}` や、
  フロントマターの前のバイトオーダーマークも、木の読みのとおりになります。
- 木のないテキスト（parser が拒否するもの）は、語と数に番号を付けるだけです。

例外は 3 つで、読みが語が集合に入るかで決まり、
それがどのトークンにも現れない所です。
そのトークンは、書かれたまま残ります。
いま知られている所で、それぞれ、それを示す入力で見つかりました。
この類の所は、その入力とともに足します。
語の一覧は、所を見つける方法ではありません。

- `box` の直後のテキストの並び。
  CSS の色名なら色、ほかの語なら名前になります。
  `box red` は fill が `red`、`box team` は名前が `team` です。
- `linkStyle` の文の中のテキストの並び（`;` か行の終わりまで）。
  mermaid.js は、一覧のどの style も `fill` でないとき、
  辺の style に `fill:none` を足します。
  `linkStyle 0 fill:red` は辺の style が `fill:red`、
  `linkStyle 0 color:red` は `color:red` と `fill:none` です。
- テキスト全体が、ノードを作らない状態の id であるトークン（`</choice>`、
  `</join></fork>`。 `src/db-from-tree/state.ts` の `IDS_WITHOUT_NODE` と、
  [db-from-tree/state.ja.md](./db-from-tree/state.ja.md) のとおり）。
  `state </join></fork> <<fork>>` には fork の状態がなく、
  `state </x></fork> <<fork>>` にはあります。
  どの図種のどの位置でも残すので、1 つになる形を分けるだけです。
  状態の id でない所では、形が必要より細かくなります。

入力を落とすのは、形と図種と mermaid.js が受理するかが、fixture のものか、
同じ集まりのほかの入力のものと同じときだけです。
同じ集まりの中では、いちばん短いものが代表します。
受理を含めるのは、木のないテキストの数は読まれないからです。
辺が 1 本の図の `linkStyle 0` は受理され、`linkStyle 5` は、
ない辺なので拒否されます。
落とした入力は、代わりになる fixture と形とともに一覧にします。

形が区別しないのは、作者が名前を付けたものの綴りです。
名前の中の語や、数の長さがそれに当たります。
その違いが読みを変えると分かったときは、それを示す入力を、
それだけの fixture にします。

parser の最初の集まりの入力は、テキストだけの形で選びました。
字と数字の並びを 1 つの印にし、
その入力とコーパスについて parser が `Keyword` トークンとして出した語は、
小文字にして残しました。
この形は、語の大小を畳み、トークンを見ず、2 つの名前が同じかも残しませんでした。
その fixture はそのままにし、この後の集まりは上の形を使います。
