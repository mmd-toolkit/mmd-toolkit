# 開発

英語版: [development.md](./development.md)

プラグインのテストのしかたと、整形の例を足す、更新するしかたを説明します。
プラグインは [`@mmd-toolkit/parser`](../../parser) で図を読み、
出力を mermaid.js を動かさずに確かめます。
テキストの木が表す Db を、
[`@mmd-toolkit/tests`](../../tests) の補助関数で作って比べます。

## テストの実行

```sh
pnpm vitest run --project prettier-plugin-mmd
```

これは、整形の fixture、コーパス、単体テストを回します。
実行には約 10 秒かかります。

テストは `@mmd-toolkit/parser` と `@mmd-toolkit/tests` を、
ビルドではなくソースから読みます（`vitest.config.ts` を参照）。
そのため、ビルドは要りません。
plugin のソースを import して Node で動かすスクリプトは、
それらのパッケージを `lib/` のビルドから読みます。
そのため、動かす前に `pnpm --filter @mmd-toolkit/parser run build` と、
`pnpm --filter @mmd-toolkit/tests run build` で作り直してください。

## テスト

| ファイル                             | 確かめること                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/plugin.test.ts`               | プラグインが宣言する言語、パーサー、printer。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `tests/dispatch.test.ts`             | 図の本体が、その図種の printer に渡ること。printer のない図種と、パーサーが対応しない図種を、ファイルでも Markdown でも変えずに印字すること。                                                                                                                                                                                                                                                                                                                                                                                   |
| `tests/failure.test.ts`              | パーサーが拒否する入力を、ファイルでは構文エラーとして報告し、Markdown では Prettier に任せること。バイト順マークの制限。                                                                                                                                                                                                                                                                                                                                                                                                       |
| `tests/markdown.test.ts`             | どの Markdown のコードブロックがプラグインに届くか。パーサーの代わりのスタブを使います。                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `tests/markdown-flowchart.test.ts`   | Markdown のコードブロックの中で整形した flowchart。トップレベル、リスト項目、引用の中と、行末の空白。                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `tests/usecase.test.ts`              | エスケープした usecase の Unicode と CR、埋め込み、正確な出力、木の不変条件と Db の一致。                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `tests/markdown-usecase.test.ts`     | usecase の最上位、リスト、引用のホスト、metadata、JSON、オプション、ホストの最終行の制限。                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `tests/agentflow.test.ts`            | エスケープ表記のagentflowのUnicode・制御文字・改行。整形結果、冪等性、仕様のDb、埋め込み原文と木の不変条件。                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `tests/markdown-agentflow.test.ts`   | トップレベル、リスト、引用内のagentflow。値の保持、幅0の字下げ、ホストの制限。                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `tests/markdown-sequence.test.ts`    | Markdown のコードブロックの中で整形した sequence 図。トップレベル、リスト項目の中と、タイトルの末尾の空白。                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `tests/markdown-class.test.ts`       | Markdown のコードブロックの中で整形した class 図。トップレベル、リスト項目の中と、コメントの後の空白 1 つの行。                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `tests/markdown-state.test.ts`       | Markdown のコードブロックの中で整形した state 図。トップレベルとリスト項目の中。                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tests/markdown-er.test.ts`          | Markdown のコードブロックの中で整形した ER 図。トップレベル、リスト項目の中、方向を含む `accTitle`。                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tests/markdown-gantt.test.ts`       | Markdown のコードブロックの中で整形した Gantt 図。トップレベル、リスト項目の中、空白だけのデータを持つタスク。                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `tests/markdown-journey.test.ts`     | Markdown のコードブロックの中で整形した journey 図。トップレベル、リスト項目の中、空白だけのデータを持つタスク。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tests/markdown-mindmap.test.ts`     | Markdown のコードブロックの中で整形した mindmap。トップレベル、リスト項目の中、ノードのテキストの末尾の空白。                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `tests/markdown-sankey.test.ts`      | Markdown のコードブロックの中で整形した sankey 図。トップレベル、リスト項目の中、別の記録の前にある空白だけの値。                                                                                                                                                                                                                                                                                                                                                                                                               |
| `tests/markdown-timeline.test.ts`    | Markdown のコードブロックの中で整形した timeline。トップレベル、リスト項目の中、event の末尾の空白。                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tests/markdown-requirement.test.ts` | Markdown のコードブロックの中で整形した requirement 図。トップレベル、リスト項目の中、コメント行が前の行から分けない文。                                                                                                                                                                                                                                                                                                                                                                                                        |
| `tests/markdown-xychart.test.ts`     | Markdown のコードブロックの中で整形した XY チャート。トップレベル、リスト項目の中、閉じていない説明ブロック。                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `tests/markdown-quadrant.test.ts`    | Markdown のコードブロックの中で整形した象限チャート。トップレベル、リスト項目の中、テキストの中の空白。                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `tests/markdown-kanban.test.ts`      | トップレベルと Markdown の入れ子での kanban。ホストの字下げを除いたセクションと項目、不透明データ、拒否するフェンス。                                                                                                                                                                                                                                                                                                                                                                                                           |
| `tests/markdown-c4.test.ts`          | C4 のトップレベルと入れ子のフェンス、境界の本体、複数行の値、空ブロックの隣接、復帰用の空白行、拒否するフェンス。                                                                                                                                                                                                                                                                                                                                                                                                               |
| `tests/markdown-venn.test.ts`        | Venn のトップレベルと入れ子のフェンス、暗黙の印、同じ行の宣言の組、複数行の値、飲み込まれる断片、モードに関わるコメントの隙間、拒否するフェンス。                                                                                                                                                                                                                                                                                                                                                                               |
| `tests/markdown-block.test.ts`       | Markdown のコードブロックの中で整形したブロック図。トップレベル、リスト項目の中、ラベルの中の空白。                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tests/line-separators.test.ts`      | 書かれたまま残す U+2028 か U+2029 を含む state 図、sequence 図、ER 図、Gantt 図、journey 図、requirement 図、mindmap、timeline、XY チャート、象限チャート、kanban、C4、Venn、ブロック図と、U+00A0、U+3000、U+FEFF を含む Gantt 図、journey 図、requirement 図、mindmap、timeline、XY チャート、象限チャート、kanban、C4、Venn、ブロック図と、テキストの末尾にそれらを含む sankey 図。文字はエスケープで書きます。                                                                                                               |
| `tests/line-terminators.test.ts`     | 行が `\r\n` か単独の `\r` で終わる図。改行のときと同じに整形し、オプションの行末で印字します。文字はエスケープで書きます。                                                                                                                                                                                                                                                                                                                                                                                                      |
| `tests/format.test.ts`               | 整形の fixture ごとに、入力が出力に整形されること、出力を整形しても変わらないこと、木が表す Db が両方で同じこと、埋め込みデータが書かれたままであること（[テストが保つもの](#テストが保つもの)を参照）。                                                                                                                                                                                                                                                                                                                        |
| `tests/corpus.test.ts`               | `@mmd-toolkit/tests` の適合性コーパス（common、flowchart、agentflow、sequence、class、state、ER、Gantt、journey、requirement、mindmap、timeline、sankey、XY チャート、象限チャート、kanban、C4、Venn、usecase、ブロック図）のうち、プラグインが整形する入力すべて。もう一度整形しても変わらないこと、埋め込みデータが書かれたままであること、出力の木が表す Db が、コーパスが入力について記録した Db と同じこと（[テストが保つもの](#テストが保つもの)を参照）。parser が拒否する入力すべてが、構文エラーとして報告されること。 |
| `tests/docs.test.ts`                 | 規則の文書と README が fixture と一致すること（[文書と fixture](#文書と-fixture) を参照）。                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `tests/value-nodes.test.ts`          | printer のある図種ごとに、子の欄を持たない木の型（その図種の型と、共有する葉のノード）が、どれも、書かれたまま印字する値か、例外として挙げたもののどちらかであること。木に足された型が、意図して扱われるようにするためです。                                                                                                                                                                                                                                                                                                    |
| `tests/source.test.ts`               | printer がノードの構造のトークンとみなすもの。ディレクティブ、`;`、フロントマターのトークンは含みません。フロントマターの区切りの `---` は、flowchart の矢印と同じ種類と値です。                                                                                                                                                                                                                                                                                                                                                |
| `tests/sequence-layout.test.ts`      | 後ろの空白が別の単位にしてしまう id のうち、sequence の printer が取るもの。数と `title` で、その隣では矢印の前後に空白を置きません。                                                                                                                                                                                                                                                                                                                                                                                           |

### テストが保つもの

整形は、冪等で、Db を変えてはいけません。
Db は mermaid.js から読みません。
`tests/db-reading.ts` の `dbOfText` が、テキストの木から、
`@mmd-toolkit/tests` の `dbFromTree` で作ります。
入力の埋め込みデータ（フロントマター、ディレクティブ、
データブロック）から mermaid.js が導く値を使います。
コーパスは、fixture ごとにその値（`embeddedValuesOf`）と、
入力の Db（`expected.json`。仕様が違う読み方をするものは
`specified.json`）を記録しているので、コーパスのテストは、
整形後のテキストの Db を、記録された Db と比べます。
ほかのテストには記録がないので、整形後のテキストの Db を、入力の Db と、
既定の値で比べます。

埋め込みデータの値は入力のものを使うので、
整形が埋め込みデータを書かれたまま残すことも確かめます。
`writtenEmbeddedTexts` が、ディレクティブとデータブロックの書かれたテキストを、
出現順に並べ、その並びが、
整形の前と後で同じこと（行終端はすべて改行として読みます）を確かめます。
フロントマターは例外です。
printer は、安全なら、その YAML を Prettier の YAML 整形で整形するので、
`describeFrontmatterChange` は、書かれたままか、その整形の出力かを受理し、
YAML の値を保つことはその整形に頼ります。
テストは値を読みません。
データブロックを持つテキストで効果が与えられていないときは、
`dbOfText` は Db を返しません。
データブロックが Db にすることは mermaid.js が導くもので、
テキストだけからは分からないからです。
そのときも、ブロックの書かれたテキストは確かめます。

## printer の作り

- コメントとディレクティブは、printer が印字するものの間のソースから印字します。
  Prettier のコメントの付着の仕組み（`canAttachComment`、`printComment`）で、
  ノードに付けることはしません。
  ディレクティブは名前の中にあったり、空白なしでトークンに接していたりし、
  コメントは複数行に書かれた文の中にあることがあります。
  ノードに付けると、位置が動きます。
  Prettier は一番上のノードの `comments` を読み、
  その仕組みで印字されなかったコメントごとに例外を投げるので、
  木を `FormattedDocument` のノードで包みます（`src/parser.ts`）。
- すべての図種に共通の部分は、共通のモジュールが印字します。
  `root.ts` は、フロントマターと、図の前に立つものを印字します。
  `blocks.ts` は、ブロックの文、その間のコメントとディレクティブ、
  文を区切る `;`、空行、ブロックを閉じる行を印字します。
  `atoms.ts` と `layout.ts` は、文を原子とその間の隙間として組み立てます。
  ほかに `gap.ts`、`lines.ts` があります。
  ER 図と requirement 図が共有する隙間の規則（クラスと名前のリスト、
  direction の行、アクセシビリティの文）は `statement-rules.ts` に、
  1 桁目を保つ `accTitle` の判定は `accessibility-lines.ts` にあります。
  Prettier の path を、
  printer がいるノードの型に絞る関数は `paths.ts` にあります。
  図種ごとに、次のファイルがあり、`blocks.ts` に `BlockRules` を渡します。
  printer は `flowchart.ts`、`agentflow.ts`、`sequence.ts`、 `class.ts`、
  `state.ts`、 `er.ts`、`gantt.ts`、`journey.ts`、`requirement.ts`、
  `mindmap.ts`、 `timeline.ts`、`sankey.ts`、`xychart.ts`、`quadrant.ts`、
  `block.ts`、`kanban.ts`、`c4.ts`、`venn.ts`、`ishikawa.ts`、
  `usecase.ts` です。
  文の配置は `flowchart-layout.ts`、`agentflow-layout.ts`、
  `sequence-layout.ts`、 `class-layout.ts`、`state-layout.ts`、`er-layout.ts`、
  `gantt-layout.ts`、 `journey-layout.ts`、`requirement-layout.ts`、
  `mindmap-layout.ts`、 `timeline-layout.ts`、`sankey-layout.ts`、
  `xychart-layout.ts`、 `quadrant-layout.ts`、`block-layout.ts`、
  `kanban-layout.ts`、 `c4-layout.ts`、`venn-layout.ts`、`ishikawa-layout.ts`、
  `usecase-layout.ts` です。
  保つ行は `flowchart-kept-lines.ts`、`agentflow-kept-lines.ts`、
  `sequence-kept-lines.ts`、 `class-kept-lines.ts`、`state-kept-lines.ts`、
  `er-kept-lines.ts`、 `gantt-kept-lines.ts`、`journey-kept-lines.ts`、
  `requirement-kept-lines.ts`、`mindmap-kept-lines.ts`、
  `timeline-kept-lines.ts`、`sankey-kept-lines.ts`、 `xychart-kept-lines.ts`、
  `quadrant-kept-lines.ts`、 `block-kept-lines.ts`、`kanban-kept-lines.ts`、
  `c4-kept-lines.ts`、 `venn-kept-lines.ts`、`ishikawa-kept-lines.ts`、
  `usecase-kept-lines.ts` です。
  保つ行の共通の部分は `kept-lines.ts` にあります。
  `BlockRules` は、保つ行、文の印字の終わり、文を持つ文、
  トップレベルで落とす文と、コメントの後の空白だけの行を残すかどうかを伝えます。
  ブロック図は、文ではなく単位を渡します。
  1 行に続く node と `space` は 1 つの単位で、
  その行に残ります（`block-layout.ts` の `groupBlockUnits`）。
- 規則は木から決めます。
  木に現れない字句の事実には明示の規則を置き、それぞれ仕様の節を指します。
  printer は、実行のときに結果を parser で読み直して確かめることはしません。
  そうした確かめは、規則の欠けを隠すだけで、規則になりません。
  テストは固定のコーパスと整形フィクスチャを使います。
  各規則の文が分ける場合とそこで交わるほかの規則からケースを書き、
  規則の欠けを調べます。

## 整形の fixture

fixture は整形そのものを示します。
`tests/fixtures/<diagram>/<rule>/` の下に、
整形の規則ごとに 1 つのフォルダーを置きます。
1 つの例は次のファイルからなります。

- `<example>-input.mmd`: 整形の前のテキスト。
- `<example>-output.mmd`: 整形したテキスト。
- `<example>-options.json`: 例に要るときの Prettier のオプション。

どの例にも属さないファイルや、入力のない出力やオプションのファイルがあると、
テストが失敗します。
入力の名前を変えたときに、古い出力が残らないようにするためです。
ルートの `.gitattributes` と `.editorconfig` は、行末の空白も含めて、
`tests/fixtures/` のファイルをバイトのとおりに保ちます。

U+2028 や U+2029 のような不可視文字を含むテキストは、
ここでは fixture にしません。
エディターは、その文字を含むファイルを開くたびに、取り除くかどうかを尋ねるので、
テストのコード（`tests/line-separators.test.ts`）に、エスケープで書きます。
その文字をそのまま持つのは、
適合コーパスの fixture （`packages/tests/fixtures/`）だけです。

例を足すときは、入力を書き、出力を書き出します。

```sh
pnpm --filter prettier-plugin-mmd run test:update
```

このコマンドはパーサーをビルドし、整形した入力と違う出力をすべて書き出します。
変わった出力は、残す前に差分として読んでください。
テストが確かめるのは、出力が安定していることと、 Db を変えないことで、
整形が意図したとおりであることではありません。

## 文書と fixture

規則の文書の例は fixture の写しで、`tests/format.test.ts` は、
プラグインがそれぞれの出力を印字することと、
Db と埋め込みデータを保つことの両方を、
確かめます（[テストが保つもの](#テストが保つもの) を参照）。
英語版の規則の文書は、[docs/agentflow.md](./agentflow.md)、
[docs/architecture.md](./architecture.md)、[docs/block.md](./block.md)、
[docs/c4.md](./c4.md)、[docs/class.md](./class.md)、
[docs/cynefin.md](./cynefin.md)、[docs/er.md](./er.md)、
[docs/eventmodeling.md](./eventmodeling.md)、
[docs/flowchart.md](./flowchart.md)、[docs/gantt.md](./gantt.md)、
[docs/gitgraph.md](./gitgraph.md)、[docs/info.md](./info.md)、
[docs/ishikawa.md](./ishikawa.md)、[docs/journey.md](./journey.md)、
[docs/kanban.md](./kanban.md)、[docs/mindmap.md](./mindmap.md)、
[docs/packet.md](./packet.md)、[docs/pie.md](./pie.md)、
[docs/quadrant.md](./quadrant.md)、[docs/radar.md](./radar.md)、
[docs/railroad.md](./railroad.md)、[docs/requirement.md](./requirement.md)、
[docs/sankey.md](./sankey.md)、[docs/sequence.md](./sequence.md)、
[docs/state.md](./state.md)、[docs/timeline.md](./timeline.md)、
[docs/treemap.md](./treemap.md)、[docs/treeview.md](./treeview.md)、
[docs/usecase.md](./usecase.md)、[docs/venn.md](./venn.md)、
[docs/wardley.md](./wardley.md)、[docs/xychart.md](./xychart.md) です。
それらでは、 `###` の見出しが規則で、その fixture のフォルダーは、
図種のフォルダーの下の、見出しを小文字にし、空白を `-` にしたものです。
「Arrow spacing」は `arrow-spacing` です。
文書の中の例は、fixture のファイルへのリンクと `:` で終わる行、空行、
そのファイルの中身を書いた `mmd` のコードブロックです。
`tests/docs.test.ts` は次を確かめます。

- 規則の文書ごとに、その規則が、図種の fixture のフォルダーと一致すること。
- 各例が、その規則のフォルダーのファイルにリンクすること。
- 規則の文書の日本語版が、同じ規則の下に同じ例を持つこと。
  `README.ja.md` が `README.md` と同じ例を持つこと。
- 各例のブロックが、リンク先のファイルと一致すること。

fixture を変えたときは、それを載せている文書に新しい中身を写してください。

## Kanban の fixture の網羅

[kanban の規則](./kanban.ja.md)は固定した整形ケースをすべて引用します。
Unicode と制御文字は `line-separators.test.ts` にエスケープした文字列で書き、
`line-terminators.test.ts` は設定した CR・LF の出力も確かめます。
拒否されるボードの入力は、ほかの図種と同じく `corpus.test.ts` が確かめます。

kanban は共通のブロック印字を本体の深さ 0 で使い、
各行の字下げ（セクションは 1 段、
項目は 2 段）を `extraIndentationOf` で渡します。
`writtenIndentationOf` と `keptIndentationOf` は、
インラインディレクティブの行と `;` を持つ行の字下げを渡し、
それらの行のテキストは書かれたまま印字します。
隙間の項目は、引き続きノードの列に揃えます。
`keptGapEnd` は `Line.writtenBreakBefore` と `PrintedBlock.writtenEnd`
を通じて、保護するコメントの隙間全体を、次の行の字下げの前まで保ちます。
これらは任意の規則で、他図種は既存の経路を通ります。
共通の `isDroppedSemicolon` は、既に kanban のセミコロンを残す判定です。

## Ishikawa の fixture の網羅

[Ishikawa の規則](./ishikawa.ja.md)は、規則ごとの固定ケースを引用します。
`format.test.ts` は受理するファイルの fixture を共通の経路で検査します。
`ishikawa-cases.ts` は Unicode、制御文字、CR の入力をエスケープして持ち、
`ishikawa.test.ts` が検査します。
`ishikawa.test.ts` は parser の木の不変条件も検査します。
拒否する入力は、共通の corpus と failure のテストで検査します。
`corpus.test.ts` は全 Ishikawa 入力を読み、仕様の Db、
および parser の拒否を検査します。
`markdown-ishikawa.test.ts` は固定した最上位、リスト、引用のホストと、
字下げを除いた図の本文を分けて検査します。

`ishikawa-layout.ts` は入れ子の AST を 1 回たどり、深さを割り当てます。
別の親子のモデルは推測しません。
`indentation-lines.ts` は kanban の先頭 directive の隙間配分と、
実際の Unicode コメント境界を共有します。
任意の `blankBeforeStatement` hook は、先頭の普通の空行と、
図コメントを区切る空行を区別します。
`triviaLineBreak` はコメントの後の改行だけを保ち、
共有のブロック印字でコメントを揃えながら、末尾の隙間を保ちます。
保持区間は開始位置にも終了位置にも `diagramLineEnd` を使うため、
Unicode で終わる手前のコメントにある semicolon が、
そのコメントを次の節点の区間に引き込みません。
他の printer の規則と fixture の出力は維持します。

## Agentflowのfixtureの網羅

[Agentflowの規則](./agentflow.ja.md)には固定ファイルfixtureと、
`agentflow-cases.ts`にエスケープしたUnicode・制御文字・改行のケースがあります。
`agentflow.test.ts`が確認します。
`markdown-agentflow.test.ts`は最上位、リスト、引用のホストと、
外側の字下げを除いた本文を確認します。
振り分けと値の節点のテストにもagentflowを含めます。
`corpus.test.ts`は仕様の拒否も含む全入力を読み、
出力の木と記録済みのDbを確認します。

`graph-layout.ts`と`graph-kept-lines.ts`で、 flowchartの隙間、
nullのstyleの末尾、セミコロン選択、方向の優先順位を共有します。
agentflowの値と文法の違いは専用のモジュールに理由を書きます。
`RootTextPlan`は配置を適用する前に計画を測ります。
書かれたfrontmatterとdirectiveの範囲を使い、50000単位のコメント分岐を保ちます。
任意のブロック規則`keepsHeaderDirectivesWithPrevious`は、
最初の本文の文を下へ移すとき、離れた見出し行directiveを見出しに保ちます。
接するdirectiveは見出しのグループを結合します。
他のprinterは既存の経路を保ちます。

## Usecase の fixture の網羅

[usecase の規則](./usecase.ja.md)は、
規則の文から作った整形 fixture を引用します。
`usecase-cases.ts` は Unicode、制御文字、CR をエスケープして持ち、
`usecase.test.ts` が検査します。
`corpus.test.ts` は指定の拒否と印付きの乖離を含む全 usecase 入力を読みます。
`markdown-usecase.test.ts` は固定したホストと、
字下げを除いた本文を別々に検査します。

データブロックは、他図種と同じ共有の経路を使います。
効果を渡さない整形 fixture の Db 比較は null とし、
書かれた埋め込み文字列を比較します。
コーパスは存在する記録済みの効果を使います。
printer は Mermaid を import せず、出力を再解析しません。
説明ブロックの共有ヘルパーは、印字する値の範囲を任意に受け取り、
余白を含む usecase の Literal でも本文の列と閉じ括弧の配置を再利用します。

`AtomLayout.keptBreaksBefore` は、
metadata の atom と trivia の間の LF をすべて保ち、
既存の atom printer がプロパティと閉じ波括弧を揃えます。
他のレイアウトは指定せず、既存の空行の方針を保ちます。
`semicolonSegmentEnd` と `keptSemicolonPrefixEnd` は、
C4 の既存の区間境界を共有します。
`protectSemicolonPrefixes` は、
atom 全体を含む保持部分の処理を Venn と共有します。
共有 printer に図種による分岐は加えません。

## Pie fixture coverage

[pie の規則](./pie.ja.md)は固定した整形 fixture、
`pie-cases.ts` の escape で表した Unicode・CR の例、
`markdown-pie.test.ts` の実際の Markdown host を引用します。
`format.test.ts` と `pie.test.ts` は正確な出力、冪等性、 Db の一致、
embedded の原文を確認します。
escape 表記の例では木の不変条件も確認します。
`corpus.test.ts` は、印付きの指定の読みと解析失敗も含む全 pie 入力を読みます。
fixture の出力全体で、保持する隠れた原文を確認します。
`describeFrontmatterChange` は ignored YAML が frontmatter
に変わらないかを確かめます。
dispatch と値 node の行にも pie を加えています。

printer は共有の accessibility のコロン規則と `layoutDescriptionBlock`
を呼びます。
pie の行形式は次行の値を結合しません。
`AtomLayout.writtenGapsBefore` は hidden node 外で消費する LF と、
閉じ境界の空白を保ちます。
`BlockRules.joiningRegionsPrintedAsWritten` は共通の結合を、値 atom の中か、
layout が保つギャップの中で、書かれたまま印字させ、安全な後続部分を整えます。
他の printer は従来の行全体の経路を使います。
既存の `triviaLineBreak` は直前に trivia がない場合も印字境界を受け、
hidden の LF を保ちつつ独立した trivia を揃えます。
`formatsEmptyTrivia` は共有の説明 layout でコメントだけの block を揃えます。
図種が選ぶ root の `keepsPrefix` は通常の root の整理より前に前置きを保ち、
ignored YAML が実際の frontmatter になるのを防ぎます。
既存の図種にはこれらの option を渡しません。
